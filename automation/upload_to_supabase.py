"""
Sube todos los videos de StoiCom (lotes 1 y 2) al bucket de Supabase Storage.
Genera URLs publicas permanentes y un catalogo JSON indexado para n8n.
"""

import os
import sys
import json
import requests
from dotenv import load_dotenv

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(HERE, ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://rnmykblecgmbajprreau.supabase.co").rstrip("/")
SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY", "")
BUCKET = os.getenv("SUPABASE_BUCKET", "stoicom")

HEADERS_BASE = {
    "Authorization": f"Bearer {SECRET_KEY}",
    "apikey": SECRET_KEY,
    "x-upsert": "true",
}

def upload_file(local_path: str, storage_path: str, content_type: str) -> str:
    """Sube un archivo a Supabase Storage y retorna su URL publica."""
    headers = {**HEADERS_BASE, "Content-Type": content_type}
    with open(local_path, "rb") as f:
        data = f.read()
    
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{storage_path}"
    r = requests.post(url, headers=headers, data=data)
    if r.status_code not in (200, 201):
        raise RuntimeError(f"Error {r.status_code} al subir {storage_path}: {r.text[:300]}")
    
    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{storage_path}"
    return public_url

def main():
    print(f"🚀 Iniciando sincronizacion hacia Supabase Storage: {SUPABASE_URL}")
    print(f"📦 Bucket destino: '{BUCKET}'\n")

    catalog = []
    
    # 1. Escanear lotes disponibles (prioridad al lote 2 y luego lote 1)
    targets = [
        # (day, dir_path)
    ]
    
    # Lote 2: Días 11 al 20 (motor dinámico v3)
    lote2_dir = os.path.join(HERE, "output", "lote_11_20")
    if os.path.exists(lote2_dir):
        for d in range(11, 21):
            day_dir = os.path.join(lote2_dir, f"dia_{d:02d}")
            if os.path.exists(day_dir):
                targets.append((d, day_dir, "v2_dynamic"))

    # Lote 1: Días 1 al 10 (base)
    lote1_dir = os.path.join(HERE, "output", "lote_10_videos")
    if os.path.exists(lote1_dir):
        for d in range(1, 11):
            day_dir = os.path.join(lote1_dir, f"dia_{d:02d}")
            if os.path.exists(day_dir):
                targets.append((d, day_dir, "v1_baseline"))

    targets.sort(key=lambda x: x[0])
    print(f"📁 Encontrados {len(targets)} días con videos generados para sincronizar.\n")

    for day, day_dir, version in targets:
        mp4_name = f"stoicom_dia_{day:02d}.mp4"
        mp4_path = os.path.join(day_dir, mp4_name)
        caption_path = os.path.join(day_dir, "caption.txt")
        reddit_path = os.path.join(day_dir, "reddit.md")
        plan_path = os.path.join(day_dir, "plan.json")

        if not os.path.exists(mp4_path):
            print(f"   ⚠️ Día {day}: No se encontró {mp4_name}, omitiendo.")
            continue

        size_mb = os.path.getsize(mp4_path) / (1024 * 1024)
        print(f"⬆️  Día {day:02d} ({size_mb:.1f} MB) [{version}]...")

        # Subir video MP4
        video_storage_path = f"videos/dia_{day:02d}/{mp4_name}"
        video_url = upload_file(mp4_path, video_storage_path, "video/mp4")

        # Leer y subir textos
        caption_text = ""
        if os.path.exists(caption_path):
            with open(caption_path, "r", encoding="utf-8") as f:
                caption_text = f.read().strip()
            upload_file(caption_path, f"videos/dia_{day:02d}/caption.txt", "text/plain; charset=utf-8")

        reddit_text = ""
        reddit_title = ""
        if os.path.exists(reddit_path):
            with open(reddit_path, "r", encoding="utf-8") as f:
                reddit_text = f.read().strip()
                lines = [l.strip() for l in reddit_text.splitlines() if l.strip()]
                if lines and lines[0].startswith("# "):
                    reddit_title = lines[0][2:].strip()
                    reddit_text = "\n\n".join(lines[1:]).strip()
            upload_file(reddit_path, f"videos/dia_{day:02d}/reddit.md", "text/markdown; charset=utf-8")

        hook_text = ""
        if os.path.exists(plan_path):
            try:
                with open(plan_path, "r", encoding="utf-8") as f:
                    p = json.load(f)
                    hook_text = p.get("hook_text", "")
            except Exception:
                pass
            upload_file(plan_path, f"videos/dia_{day:02d}/plan.json", "application/json")

        record = {
            "day": day,
            "version": version,
            "hook": hook_text,
            "video_url": video_url,
            "video_filename": mp4_name,
            "caption": caption_text,
            "reddit_title": reddit_title,
            "reddit_body": reddit_text,
            "storage_path": video_storage_path,
        }
        catalog.append(record)
        print(f"   ✅ Día {day:02d} OK → {video_url}")

    # Subir catálogo general indexado
    catalog_json = json.dumps(catalog, ensure_ascii=False, indent=2)
    local_cat = os.path.join(HERE, "output", "videos_catalog.json")
    with open(local_cat, "w", encoding="utf-8") as f:
        f.write(catalog_json)

    headers = {**HEADERS_BASE, "Content-Type": "application/json; charset=utf-8"}
    r = requests.post(
        f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/videos/catalog.json",
        headers=headers,
        data=catalog_json.encode("utf-8")
    )
    catalog_public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/videos/catalog.json"
    print(f"\n=======================================================")
    print(f"🎉 Sincronización completada exitosamente!")
    print(f"📚 Total de videos en Supabase: {len(catalog)}")
    print(f"🌐 Catálogo público JSON para n8n: {catalog_public_url}")
    print(f"=======================================================")

if __name__ == "__main__":
    main()
