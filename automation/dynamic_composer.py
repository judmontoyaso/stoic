"""
StoiCom Dynamic Video Engine — Composición de Alto Impacto y Movimiento Continuo
Diseñado para eliminar la sensación estática de diapositivas en Reels/TikTok/Shorts.

Características clave:
1. Cortes rápidos rítmicos cada 2.5 a 3.8 segundos (6 a 8 planos por video).
2. Movimientos de cámara agresivos (Crash-zoom, whip-pan, tilt ascendente).
3. Iluminación orgánica viva: simulación de vela/antorcha romana parpadeante a 30fps.
4. Capa continua de partículas y chispas doradas flotando a lo largo de todo el video.
5. Subtítulos dinámicos estilo TikTok/Hormozi (bloques de 1-2 palabras con pop-in dorado).
6. Mezcla de voz con pista ambiental cinematográfica de sub-bajos continuos.
"""

import os
import sys
import re
import subprocess
import imageio_ffmpeg

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
FPS = 30

# Movimientos de cámara agresivos y variados
DYNAMIC_MOTIONS = [
    # 0: Crash Zoom de impacto hacia el centro
    ("z='1.0+0.25*sqrt(on/{n})'", "x='iw/2-(iw/zoom/2)'", "y='ih/2-(ih/zoom/2)'"),
    # 1: Paneo lateral continuo (Whip Pan)
    ("z='1.15'", "x='(iw-iw/zoom)*(on/{n})'", "y='(ih-ih/zoom)*0.3'"),
    # 2: Tilt ascendente (de mandíbula a ojos)
    ("z='1.18'", "x='iw/2-(iw/zoom/2)'", "y='(ih-ih/zoom)*(1-on/{n})'"),
    # 3: Dolly Out dramático (revelando el vacío)
    ("z='1.25-0.20*(on/{n})'", "x='iw/2-(iw/zoom/2)'", "y='ih/2-(ih/zoom/2)'"),
    # 4: Deriva diagonal dinámica
    ("z='1.12+0.12*on/{n}'", "x='(iw-iw/zoom)*(1-on/{n})'", "y='(ih-ih/zoom)*on/{n}'"),
    # 5: Zoom lento con balanceo sutil
    ("z='1.08+0.14*on/{n}'", "x='iw/2-(iw/zoom/2)+15*sin(2*PI*on/60)'", "y='ih/2-(ih/zoom/2)'"),
    # 6: Crash Zoom final con autoridad
    ("z='1.0+0.22*(on/{n})*sqrt(on/{n})'", "x='iw/2-(iw/zoom/2)'", "y='ih/2-(ih/zoom/2)'"),
]

def check_nvenc() -> str:
    try:
        r = subprocess.run([FFMPEG, "-encoders"], capture_output=True, text=True)
        return "h264_nvenc" if "h264_nvenc" in r.stdout else "libx264"
    except Exception:
        return "libx264"

VCODEC = check_nvenc()

def _run(cmd, cwd=None):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
    if r.returncode != 0:
        raise RuntimeError(f"FFmpeg error: {r.stderr[-600:]}")

def render_dynamic_scene(img_path: str, duration: float, idx: int, out_path: str, is_first: bool = False):
    """
    Renderiza un clip con movimiento de cámara rápido y efecto de luz viva (parpadeo de antorcha romana).
    """
    n = max(2, int(round(duration * FPS)))
    z, x, y = (p.format(n=n) for p in DYNAMIC_MOTIONS[idx % len(DYNAMIC_MOTIONS)])
    
    # Parpadeo de antorcha orgánica (flicker de luminosidad a 30fps)
    torchlight = "eq=brightness='0.038*sin(2*PI*t*1.9)+0.019*sin(2*PI*t*4.7)':contrast='1.08+0.04*cos(2*PI*t*2.8)'"
    
    # Transición de corte flash rápida (0.12s)
    flash_in = "" if is_first else "fade=t=in:st=0:d=0.12:color=white@0.25,"
    fade_out = f"fade=t=out:st={max(0.0, n/FPS - 0.12):.3f}:d=0.12,"

    vf = (
        "scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,"
        f"zoompan={z}:{x}:{y}:d={n}:s=1080x1920:fps={FPS},"
        f"{torchlight},"
        f"{flash_in}{fade_out}format=yuv420p"
    )

    _run([
        FFMPEG, "-y",
        "-loop", "1",
        "-i", img_path,
        "-vf", vf,
        "-frames:v", str(n),
        "-c:v", VCODEC,
        "-b:v", "10M",
        "-r", str(FPS),
        out_path
    ])

def generate_procedural_particles(duration: float, out_path: str):
    """Genera una capa continua de partículas/chispas doradas flotando."""
    vf = (
        "geq=r='if(gt(random(N),0.996),255*sin(T*3.5),0)':"
        "g='if(gt(random(N),0.996),210*sin(T*3.5),0)':"
        "b=0,boxblur=2:1"
    )
    _run([
        FFMPEG, "-y",
        "-f", "lavfi",
        "-i", f"color=c=black:s=1080x1920:d={duration:.2f}:r={FPS}",
        "-vf", vf,
        "-c:v", VCODEC,
        "-b:v", "4M",
        out_path
    ])

def generate_subbass_drone(duration: float, out_path: str):
    """Genera una pista ambiental cinemática de sub-bajos atmosféricos."""
    expr = "'0.12*sin(2*PI*55*t)+0.06*sin(2*PI*82.5*t)+0.03*sin(2*PI*110*t)+0.015*sin(2*PI*165*t*sin(2*PI*0.1*t))'"
    af = "lowpass=f=250,volume=0.25,afade=t=in:ss=0:d=1.5,afade=t=out:st={:.2f}:d=2".format(max(0.1, duration - 2))
    _run([
        FFMPEG, "-y",
        "-f", "lavfi",
        "-i", f"aevalsrc=exprs={expr}:s=44100:d={duration:.2f}",
        "-af", af,
        "-c:a", "aac",
        "-b:a", "128k",
        out_path
    ])

def build_dynamic_popin_ass(words: list, hook: str, total_duration: float, out_path: str):
    """
    Genera subtítulos estilo TikTok / Hormozi con bloques ultracortos (1-2 palabras)
    y resaltado dorado activo al instante de sonar.
    """
    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Pop,Impact,92,&H00FFFFFF,&H0000D7FF,&H00000000,&HBF000000,-1,0,0,0,100,100,2,0,1,7,3,2,80,80,540,1
Style: Hook,Impact,76,&H0000D7FF,&H0000D7FF,&H00000000,&HB0000000,-1,0,0,0,100,100,1,0,1,6,3,8,80,80,240,1
Style: CTA,Impact,84,&H0000D7FF,&H0000D7FF,&H00000000,&HB0000000,-1,0,0,0,100,100,2,0,1,6,3,8,80,80,280,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    def _t(sec):
        sec = max(0.0, sec)
        h, rem = divmod(sec, 3600)
        m, s = divmod(rem, 60)
        return f"{int(h)}:{int(m):02d}:{s:05.2f}"

    def _c(w):
        return w.replace("{", "").replace("}", "").replace("\\", "").upper()

    # Agrupar en bloques cortos de 1 a 2 palabras para dinamismo visual rápido
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= 2 or re.search(r"[.,;:?!…]$", w[0]):
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)

    events = []
    for ci, chunk in enumerate(chunks):
        chunk_end = chunks[ci + 1][0][1] if ci + 1 < len(chunks) else chunk[-1][2] + 0.35
        for wi, (wtext, ws, _we) in enumerate(chunk):
            w_end = chunk[wi + 1][1] if wi + 1 < len(chunk) else chunk_end
            parts = []
            for k, (t, _, _) in enumerate(chunk):
                t_clean = _c(t)
                if k == wi:
                    # Palabra activa: amarillo dorado brillante con resalte
                    parts.append(f"{{\\c&H0000D7FF&\\fscx112\\fscy112}}{t_clean}{{\\c&H00FFFFFF&\\fscx100\\fscy100}}")
                else:
                    parts.append(t_clean)
            events.append(f"Dialogue: 1,{_t(ws)},{_t(w_end)},Pop,,0,0,0,,{' '.join(parts)}")

    if hook:
        hook_end = min(3.5, words[min(4, len(words)-1)][2] if words else 3.0)
        events.append(f"Dialogue: 2,{_t(0)},{_t(hook_end)},Hook,,0,0,0,,{_c(hook)}")

    events.append(
        f"Dialogue: 2,{_t(max(0, total_duration - 3.2))},{_t(total_duration)},CTA,,0,0,0,,"
        "STOICOM.APP\\N{\\fs52\\c&H00FFFFFF&}ENTRENA TU COMUNICACIÓN EN 90 DÍAS"
    )

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(header + "\n".join(events) + "\n")

def assemble_dynamic_video(
    video_dir: str,
    scene_imgs: list,
    scene_durs: list,
    words: list,
    hook_text: str,
    final_output: str
):
    """Ensambla el video completo con capas dinámicas superpuestas."""
    total_dur = sum(scene_durs)
    print(f"   🎬 Ensamblando {len(scene_imgs)} planos dinámicos (duración total: {total_dur:.1f}s)...")

    # 1. Renderizar cada escena con su movimiento y luz viva
    clips = []
    for i, (img, dur) in enumerate(zip(scene_imgs, scene_durs)):
        clip = os.path.join(video_dir, f"dyn_scene_{i+1}.mp4")
        render_dynamic_scene(img, dur, i, clip, is_first=(i == 0))
        clips.append(clip)

    concat_txt = os.path.join(video_dir, "dyn_concat.txt")
    with open(concat_txt, "w", encoding="utf-8") as f:
        for c in clips:
            f.write(f"file '{os.path.basename(c)}'\n")

    scenes_raw = os.path.join(video_dir, "dyn_scenes_raw.mp4")
    _run([FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", "dyn_concat.txt", "-c", "copy", "dyn_scenes_raw.mp4"], cwd=video_dir)

    # 2. Capa de partículas doradas (usa el loop precargado para máxima velocidad)
    assets_loop = os.path.abspath(os.path.join(os.path.dirname(__file__), "assets", "golden_particles_loop.mp4"))
    if os.path.exists(assets_loop):
        particles_args = ["-stream_loop", "-1", "-i", assets_loop]
    else:
        particles_mp4 = os.path.join(video_dir, "dyn_particles.mp4")
        print("   ✨ Generando capa continua de partículas doradas...")
        generate_procedural_particles(total_dur, particles_mp4)
        particles_args = ["-i", "dyn_particles.mp4"]

    # 3. Generar audio cinemático de fondo
    drone_aac = os.path.join(video_dir, "dyn_drone.aac")
    print("   🎵 Generando ambient drone cinemático...")
    generate_subbass_drone(total_dur, drone_aac)

    # 4. Construir subtítulos pop-in dinámicos
    ass_path = os.path.join(video_dir, "dyn_subs.ass")
    build_dynamic_popin_ass(words, hook_text, total_dur, ass_path)

    # 5. Composición final con mezcla de partículas (addition), audio y subtítulos
    print("   🚀 Renderizando video final dinámico con GPU NVENC...")
    ass_escaped = "dyn_subs.ass"

    filter_complex = (
        "[0:v][1:v]blend=all_mode=addition:all_opacity=0.45[vbase];"
        f"[vbase]subtitles={ass_escaped}[vfinal];"
        "[2:a]volume=1.0[voice];"
        "[3:a]volume=0.22[ambient];"
        "[voice][ambient]amix=inputs=2:duration=first[afinal]"
    )

    _run([
        FFMPEG, "-y",
        "-i", "dyn_scenes_raw.mp4",
        *particles_args,
        "-i", "voice.mp3",
        "-i", "dyn_drone.aac",
        "-t", f"{total_dur:.3f}",
        "-filter_complex", filter_complex,
        "-map", "[vfinal]",
        "-map", "[afinal]",
        "-c:v", VCODEC,
        "-b:v", "9M",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        final_output
    ], cwd=video_dir)

    print(f"   ✅ ¡Video dinámico terminado exitosamente en: {final_output}!")
    return final_output
