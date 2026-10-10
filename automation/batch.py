"""
StoiCom Video Engine v2 — generación automática de videos 9:16 por lotes.

Flujo por video (sin intervención humana):
  1. Lee la lección real del seed SQL (lessons.py).
  2. Gemini 3.8 Flash escribe el plan: gancho, 4 escenas (narración + sujeto visual),
     caption social y post de Reddit (salida JSON estructurada).
  3. Gemini 3.1 Flash Image genera 1 imagen 9:16 por escena (estética de marca).
  4. ElevenLabs narra con timestamps por carácter -> subtítulos exactos palabra a palabra.
     (Fallback automático a Edge-TTS si ElevenLabs falla o se agota la cuota.)
  5. FFmpeg (NVENC en la RTX 2050) anima cada imagen (Ken Burns), une escenas,
     quema subtítulos karaoke, gancho arriba y CTA final.
  6. Registra el costo real de cada video en cost_report.csv / .json.

Uso:
  py automation/batch.py --days 1-10
  py automation/batch.py --days 3,7,12
"""

import os
import sys
import re
import csv
import json
import time
import base64
import asyncio
import argparse
import datetime
import subprocess
from concurrent.futures import ThreadPoolExecutor

import requests
import imageio_ffmpeg
from dotenv import load_dotenv
from pydantic import BaseModel
from google import genai
from google.genai import types

from lessons import load_lessons
from video_composer import check_nvenc_support
from dynamic_composer import assemble_dynamic_video

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(HERE, ".env"))

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
FPS = 30
TAIL_SECONDS = 1.6          # cola final para el CTA
TEXT_MODEL = "gemini-3.8-flash"
IMAGE_MODEL = "gemini-3.1-flash-image"
EL_MODEL = "eleven_v3"
EL_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "nPczCjzI2devNBz1zQrb")
EDGE_VOICE = "es-CO-GonzaloNeural"

# Precios oficiales (ai.google.dev/gemini-api/docs/pricing, consultado 2026-10-10)
PRICES = {
    "text_in": 0.75 / 1e6,        # Gemini 3.8 Flash input (hasta 31-dic-2026)
    "text_out": 3.75 / 1e6,       # Gemini 3.8 Flash output + thinking
    "img_in": 0.50 / 1e6,         # Gemini 3.1 Flash Image input
    "img_text_out": 3.00 / 1e6,   # Gemini 3.1 Flash Image output texto/thinking
    "img_out": 60.0 / 1e6,        # Gemini 3.1 Flash Image output imagen (1K = 1120 tokens = $0.067)
    "el_starter_char": 5.0 / 30000,   # ElevenLabs Starter: $5 / 30k caracteres (licencia comercial)
}

CTA_NARRATION = "Prueba siete días gratis. Link en bio."
IMAGE_STYLE = (
    "Vertical 9:16 cinematic photograph. {subject}. Rembrandt chiaroscuro lighting, a single warm golden "
    "key light, pitch-black background, fine marble and stone textures, faint dust floating in the light, "
    "shallow depth of field, ultra photorealistic, subtle film grain. Palette: bone white, deep black, amber gold. "
    "Absolutely no text, no letters, no logos, no watermarks."
)


# ----------------------------------------------------------------- modelos
class Scene(BaseModel):
    narration: str
    image_subject: str


class VideoPlan(BaseModel):
    hook_text: str
    scenes: list[Scene]
    social_caption: str
    reddit_title: str
    reddit_body: str


def retry(fn, tries=4, base_wait=5):
    for i in range(tries):
        try:
            return fn()
        except Exception as e:  # noqa: BLE001
            if i == tries - 1:
                raise
            wait = base_wait * (2 ** i)
            print(f"   ↻ reintento {i + 1} en {wait}s: {str(e)[:140]}")
            time.sleep(wait)


import threading
_local = threading.local()


def gclient():
    if not hasattr(_local, "client"):
        _local.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    return _local.client


from curated_plans import CURATED_PLANS

# ----------------------------------------------------------------- 1. plan
def plan_video(lesson: dict) -> tuple[VideoPlan, float]:
    day = lesson["day"]
    if day in CURATED_PLANS:
        print(f"   ✨ Usando guion y plan curado de alta retención para Día {day}...")
        return CURATED_PLANS[day], 0.0001

    prompt = f"""Eres el guionista de StoiCom, un programa de 90 días de comunicación con filosofía estoica.
Convierte esta lección REAL en un video vertical corto (TikTok/Reels/Shorts).

LECCIÓN (día {lesson['day']} de 90 — fuente: {lesson['source_author']}):
Título: {lesson['title']}
Ejercicio: {lesson['instructions']}
Por qué funciona: {lesson['rationale']}

REGLAS DEL GUION:
- Exactamente 4 escenas. Narración total entre 65 y 90 palabras (sin contar el cierre, que se agrega solo).
- Español latino neutro, tono estoico: calmado, firme, frases cortas. Nada de "hola", "en este video", ni emojis.
- Escena 1 = gancho: una orden directa o una afirmación contraintuitiva en las primeras seis palabras.
- Escenas 2-3: el ejercicio concreto, accionable hoy. Escena 4: por qué funciona + una línea que cierre con fuerza
  mencionando "día {lesson['day']} de noventa".
- No inventes estudios, cifras ni citas que no estén en la lección. No menciones precios ni la app.
- Escribe los números con letras (se leerán en voz alta).

REGLAS VISUALES (image_subject, en inglés):
- Un sujeto concreto y simbólico por escena, distinto en cada una: estatuas greco-romanas de mármol (rostros, manos,
  ojos, oídos, perfiles), velas, relojes de arena, columnas, pergaminos, espejos antiguos, kintsugi, braseros.
- Sin personas modernas, sin pantallas, sin texto. Describe encuadre y gesto (ej. "extreme close-up of ...").

OTROS CAMPOS:
- hook_text: máximo siete palabras para mostrar en pantalla durante el gancho.
- social_caption: una o dos frases + cinco hashtags en español.
- reddit_title y reddit_body: aporte informativo para r/desarrollopersonal (150-250 palabras), formato de discusión,
  sin inventar experiencias personales, sin enlaces ni menciones a StoiCom, termina con una pregunta abierta.
"""

    def call():
        resp = gclient().models.generate_content(
            model=TEXT_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=VideoPlan,
            ),
        )
        plan = resp.parsed if isinstance(resp.parsed, VideoPlan) else VideoPlan.model_validate_json(resp.text)
        if len(plan.scenes) < 4:
            raise ValueError(f"El plan trajo {len(plan.scenes)} escenas")
        plan.scenes = plan.scenes[:4]
        words = sum(len(s.narration.split()) for s in plan.scenes)
        if not 50 <= words <= 110:
            raise ValueError(f"Guion fuera de rango: {words} palabras")
        u = resp.usage_metadata
        cost = (u.prompt_token_count or 0) * PRICES["text_in"] + (
            (u.candidates_token_count or 0) + (u.thoughts_token_count or 0)
        ) * PRICES["text_out"]
        return plan, cost

    return retry(call)


# ----------------------------------------------------------------- 2. imágenes
def generate_image(subject: str, out_path: str) -> float:
    def call():
        resp = gclient().models.generate_content(
            model=IMAGE_MODEL,
            contents=IMAGE_STYLE.format(subject=subject),
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=types.ImageConfig(aspect_ratio="9:16"),
            ),
        )
        data = None
        for part in resp.candidates[0].content.parts:
            if part.inline_data and part.inline_data.data:
                data = part.inline_data.data
        if not data:
            raise RuntimeError("El modelo no devolvió imagen")
        with open(out_path, "wb") as f:
            f.write(data)
        u = resp.usage_metadata
        img_tokens = sum(
            d.token_count or 0 for d in (u.candidates_tokens_details or []) if "IMAGE" in str(d.modality)
        )
        text_out = max(0, (u.candidates_token_count or 0) - img_tokens) + (u.thoughts_token_count or 0)
        return (u.prompt_token_count or 0) * PRICES["img_in"] + img_tokens * PRICES["img_out"] + text_out * PRICES["img_text_out"]

    return retry(call)


# ----------------------------------------------------------------- 3. voz
def tts_elevenlabs(text: str, out_path: str) -> list:
    key = os.getenv("ELEVENLABS_API_KEY")
    if not key:
        raise RuntimeError("Sin ELEVENLABS_API_KEY")
    r = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{EL_VOICE_ID}/with-timestamps",
        headers={"xi-api-key": key, "Content-Type": "application/json"},
        json={
            "text": text,
            "model_id": EL_MODEL,
            "voice_settings": {"stability": 0.35, "similarity_boost": 0.82, "style": 0.45, "use_speaker_boost": True},
        },
        timeout=180,
    )
    if r.status_code != 200:
        raise RuntimeError(f"ElevenLabs {r.status_code}: {r.text[:200]}")
    d = r.json()
    with open(out_path, "wb") as f:
        f.write(base64.b64decode(d["audio_base64"]))
    al = d.get("alignment") or d.get("normalized_alignment")
    words, cur, start, end = [], "", None, None
    for ch, s, e in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if ch.isspace():
            if cur:
                words.append((cur, start, end))
            cur, start = "", None
            continue
        if start is None:
            start = s
        cur += ch
        end = e
    if cur:
        words.append((cur, start, end))
    return words


async def _edge(text: str, out_path: str) -> list:
    import edge_tts
    comm = edge_tts.Communicate(text, EDGE_VOICE, boundary="WordBoundary")
    words = []
    with open(out_path, "wb") as f:
        async for ch in comm.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                s = ch["offset"] / 1e7
                words.append((ch["text"], s, s + ch["duration"] / 1e7))
    return words


def narrate(text: str, out_path: str) -> tuple[list, str]:
    try:
        return retry(lambda: tts_elevenlabs(text, out_path), tries=2), "elevenlabs"
    except Exception as e:  # noqa: BLE001
        print(f"   ⚠️ ElevenLabs no disponible ({str(e)[:100]}). Usando Edge-TTS ($0).")
        return asyncio.run(_edge(text, out_path)), "edge-tts"


# ----------------------------------------------------------------- 4. subtítulos
def _ass_time(t: float) -> str:
    t = max(0.0, t)
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def _clean(w: str) -> str:
    return w.replace("{", "").replace("}", "").replace("\\", "").upper()


def build_ass(words: list, hook: str, hook_end: float, total: float, out_path: str):
    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Arial,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,-1,0,0,0,100,100,1,0,1,6,2,2,90,90,560,1
Style: Hook,Arial,66,&H0000D7FF,&H0000D7FF,&H00000000,&H96000000,-1,0,0,0,100,100,1,0,1,5,2,8,90,90,230,1
Style: CTA,Arial,78,&H0000D7FF,&H0000D7FF,&H00000000,&H96000000,-1,0,0,0,100,100,2,0,1,5,2,8,90,90,300,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    # agrupar palabras en bloques cortos (máx. 3 palabras / 18 caracteres, corta en puntuación)
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        text_len = sum(len(x[0]) + 1 for x in cur)
        if len(cur) >= 3 or text_len > 18 or re.search(r"[.,;:?!…]$", w[0]):
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)

    events = []
    for ci, chunk in enumerate(chunks):
        chunk_end = chunks[ci + 1][0][1] if ci + 1 < len(chunks) else chunk[-1][2] + 0.4
        for wi, (wtext, ws, _we) in enumerate(chunk):
            w_end = chunk[wi + 1][1] if wi + 1 < len(chunk) else chunk_end
            parts = []
            for k, (t, _, _) in enumerate(chunk):
                t = _clean(t)
                parts.append("{\\c&H0000D7FF&}" + t + "{\\c&H00FFFFFF&}" if k == wi else t)
            events.append(f"Dialogue: 1,{_ass_time(ws)},{_ass_time(w_end)},Cap,,0,0,0,,{' '.join(parts)}")

    if hook:
        events.append(f"Dialogue: 2,{_ass_time(0)},{_ass_time(hook_end)},Hook,,0,0,0,,{_clean(hook)}")
    events.append(
        f"Dialogue: 2,{_ass_time(max(0, total - 3.4))},{_ass_time(total)},CTA,,0,0,0,,"
        "STOICOM.APP\\N{\\fs50\\c&H00FFFFFF&}LOS PRIMEROS 7 DÍAS, GRATIS"
    )
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(header + "\n".join(events) + "\n")


# ----------------------------------------------------------------- 5. render
MOTIONS = [
    ("z='1+0.14*on/{n}'", "x='iw/2-(iw/zoom/2)'", "y='ih/2-(ih/zoom/2)'"),           # acercamiento
    ("z='1.14-0.14*on/{n}'", "x='iw/2-(iw/zoom/2)'", "y='ih/2-(ih/zoom/2)'"),        # alejamiento
    ("z='1.12'", "x='iw/2-(iw/zoom/2)'", "y='(ih-ih/zoom)*(1-on/{n})'"),             # paneo vertical
    ("z='1+0.10*on/{n}'", "x='(iw-iw/zoom)*on/{n}'", "y='(ih-ih/zoom)*0.4'"),        # deriva lateral
]
VCODEC = "h264_nvenc" if check_nvenc_support() else "libx264"


def _run(cmd, cwd=None):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
    if r.returncode != 0:
        raise RuntimeError(f"ffmpeg falló: {r.stderr[-600:]}")


def probe_duration(path: str) -> float:
    r = subprocess.run([FFMPEG, "-i", path], capture_output=True, text=True, encoding="utf-8", errors="ignore")
    m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", r.stderr)
    h, mi, s = m.groups()
    return int(h) * 3600 + int(mi) * 60 + float(s)


def render_scene(img: str, dur: float, idx: int, out: str, first: bool):
    n = max(2, int(round(dur * FPS)))
    z, x, y = (p.format(n=n) for p in MOTIONS[idx % len(MOTIONS)])
    fade_in = "" if first else "fade=t=in:st=0:d=0.2,"
    vf = (
        "scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,"
        f"zoompan={z}:{x}:{y}:d={n}:s=1080x1920:fps={FPS},"
        f"{fade_in}fade=t=out:st={max(0.0, n / FPS - 0.2):.3f}:d=0.2,format=yuv420p"
    )
    _run([FFMPEG, "-y", "-loop", "1", "-i", img, "-vf", vf, "-frames:v", str(n),
          "-c:v", VCODEC, "-b:v", "10M", "-r", str(FPS), out])


def assemble(video_dir: str, scene_imgs: list, scene_durs: list, final_name: str):
    clips = []
    for i, (img, dur) in enumerate(zip(scene_imgs, scene_durs)):
        clip = os.path.join(video_dir, f"scene_{i + 1}.mp4")
        render_scene(img, dur, i, clip, first=(i == 0))
        clips.append(clip)
    with open(os.path.join(video_dir, "concat.txt"), "w", encoding="utf-8") as f:
        for c in clips:
            f.write(f"file '{os.path.basename(c)}'\n")
    _run([FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", "concat.txt", "-c", "copy", "scenes.mp4"], cwd=video_dir)
    total_dur = sum(scene_durs)
    _run([
        FFMPEG, "-y", "-i", "scenes.mp4", "-i", "voice.mp3",
        "-t", f"{total_dur:.3f}",
        "-vf", "subtitles=subs.ass",
        "-c:v", VCODEC, "-b:v", "8M",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart", final_name,
    ], cwd=video_dir)


# ----------------------------------------------------------------- orquestación
def scene_boundaries(plan: VideoPlan, words: list, audio_dur: float) -> list:
    """Tiempo de inicio de cada escena según la palabra donde empieza su narración."""
    counts = [len(s.narration.split()) for s in plan.scenes]
    total_text = sum(counts) + len(CTA_NARRATION.split())
    starts, acc = [0.0], 0
    for c in counts[:-1]:
        acc += c
        idx = acc if len(words) == total_text else round(acc / total_text * len(words))
        idx = min(max(idx, 0), len(words) - 1)
        starts.append(max(starts[-1] + 1.0, words[idx][1] - 0.08))
    end = audio_dur + TAIL_SECONDS
    return [b - a for a, b in zip(starts, starts[1:] + [end])]


def make_video(lesson: dict, batch_dir: str) -> dict:
    day = lesson["day"]
    vdir = os.path.join(batch_dir, f"dia_{day:02d}")
    os.makedirs(vdir, exist_ok=True)
    t0 = time.time()
    rec = {"day": day, "title": lesson["title"], "status": "error"}
    final_name = f"stoicom_dia_{day:02d}.mp4"
    final_file = os.path.join(vdir, final_name)
    json_path = os.path.join(batch_dir, "cost_report.json")
    if os.path.exists(final_file) and os.path.getsize(final_file) > 1_000_000 and os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                prev = json.load(f)
            for r in prev:
                if r.get("day") == day and r.get("status") == "ok":
                    print(f"   ⏩ Día {day} ya existe ({final_file}), reutilizando...")
                    return r
        except Exception:
            pass

    print(f"\n🎬 Día {day}: {lesson['title']}")
    print("   1/4 Gemini escribe guion + escenas...")
    plan, text_cost = plan_video(lesson)
    with open(os.path.join(vdir, "plan.json"), "w", encoding="utf-8") as f:
        json.dump(plan.model_dump(), f, ensure_ascii=False, indent=2)

    print("   2/4 Generando 4 imágenes (Gemini Flash Image)...")
    imgs = [os.path.join(vdir, f"scene_{i + 1}.jpg") for i in range(4)]
    with ThreadPoolExecutor(max_workers=4) as ex:
        img_costs = list(ex.map(generate_image, [s.image_subject for s in plan.scenes], imgs))

    print("   3/4 Narrando con timestamps...")
    narration = " ".join(s.narration.strip() for s in plan.scenes) + " " + CTA_NARRATION
    words, engine = narrate(narration, os.path.join(vdir, "voice.mp3"))
    audio_dur = probe_duration(os.path.join(vdir, "voice.mp3"))
    durs = scene_boundaries(plan, words, audio_dur)
    total = sum(durs)
    build_ass(words, plan.hook_text, min(3.0, durs[0]), total, os.path.join(vdir, "subs.ass"))

    print(f"   4/4 Render GPU ({VCODEC}) dinámico — {total:.1f}s...")
    final_name = f"stoicom_dia_{day:02d}.mp4"
    assemble_dynamic_video(vdir, imgs, durs, words, plan.hook_text, final_name)

    with open(os.path.join(vdir, "caption.txt"), "w", encoding="utf-8") as f:
        f.write(plan.social_caption + "\n")
    with open(os.path.join(vdir, "reddit.md"), "w", encoding="utf-8") as f:
        f.write(f"# {plan.reddit_title}\n\n{plan.reddit_body}\n")

    chars = len(narration) if engine == "elevenlabs" else 0
    rec.update({
        "status": "ok",
        "duration_s": round(total, 1),
        "tts_engine": engine,
        "gemini_text_usd": round(text_cost, 4),
        "images": len(imgs),
        "gemini_images_usd": round(sum(img_costs), 4),
        "elevenlabs_chars": chars,
        "elevenlabs_starter_equiv_usd": round(chars * PRICES["el_starter_char"], 4),
        "veo_usd": 0.0,
        "render_s": round(time.time() - t0, 1),
        "file": os.path.join(vdir, final_name),
    })
    rec["google_billed_usd"] = round(rec["gemini_text_usd"] + rec["gemini_images_usd"], 4)
    rec["total_with_el_starter_usd"] = round(rec["google_billed_usd"] + rec["elevenlabs_starter_equiv_usd"], 4)
    print(f"   ✅ {final_name} | {total:.1f}s | Google ${rec['google_billed_usd']:.3f} | "
          f"ElevenLabs {chars} chars | {rec['render_s']}s")
    return rec


def parse_days(spec: str) -> list:
    days = []
    for part in spec.split(","):
        if "-" in part:
            a, b = part.split("-")
            days += list(range(int(a), int(b) + 1))
        elif part.strip():
            days.append(int(part))
    return days


def main():
    ap = argparse.ArgumentParser(description="StoiCom — generación de videos por lotes")
    ap.add_argument("--days", default="1-10")
    ap.add_argument("--out", default=None)
    args = ap.parse_args()

    lessons = load_lessons()
    days = parse_days(args.days)
    batch_dir = args.out or os.path.join(HERE, "output", "batch_" + datetime.datetime.now().strftime("%Y%m%d_%H%M"))
    os.makedirs(batch_dir, exist_ok=True)
    print(f"📦 Lote: {len(days)} videos → {batch_dir}")

    records = []
    for d in days:
        try:
            records.append(make_video(lessons[d], batch_dir))
        except Exception as e:  # noqa: BLE001
            print(f"   ❌ Día {d} falló: {str(e)[:300]}")
            records.append({"day": d, "title": lessons.get(d, {}).get("title", "?"), "status": "error", "error": str(e)[:300]})

    ok = [r for r in records if r["status"] == "ok"]
    fields = sorted({k for r in records for k in r})
    with open(os.path.join(batch_dir, "cost_report.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(records)
    with open(os.path.join(batch_dir, "cost_report.json"), "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    if ok:
        g = sum(r["google_billed_usd"] for r in ok)
        el = sum(r["elevenlabs_chars"] for r in ok)
        print("\n================ RESUMEN DE COSTOS ================")
        print(f"Videos OK: {len(ok)}/{len(records)}")
        print(f"Google (texto + imágenes) facturado: ${g:.3f}  →  ${g / len(ok):.3f} por video")
        print(f"ElevenLabs: {el} caracteres (equiv. Starter ${el * PRICES['el_starter_char']:.3f})")
        print(f"Duración promedio: {sum(r['duration_s'] for r in ok) / len(ok):.1f}s")
        print(f"Reporte: {os.path.join(batch_dir, 'cost_report.csv')}")


if __name__ == "__main__":
    main()
