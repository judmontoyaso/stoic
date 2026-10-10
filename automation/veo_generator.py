"""
Módulo Generador de Video con Google Veo (Vertex AI / Gemini API)
Permite generar clips de video cinematográficos 9:16 usando el modelo Veo de Google DeepMind.
Incluye manejo asíncrono y descarga del resultado.
"""

import os
import sys
import time
import requests

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def generate_veo_clip(
    prompt: str,
    output_path: str,
    duration_seconds: int = 5,
    aspect_ratio: str = "9:16",
    model_name: str = "veo-3.1-generate-preview"
) -> str:
    """
    Invoca la API de Google Veo vía google-genai para generar un clip cinematográfico.
    Requiere GEMINI_API_KEY o autenticación de Google Cloud (Vertex AI).
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    try:
        from google import genai
        from google.genai import types
        
        print(f"🎬 Conectando con Google Veo ({model_name})...")
        print(f"📝 Prompt: {prompt[:80]}...")
        
        client = genai.Client(api_key=api_key) if api_key else genai.Client()
        
        operation = client.models.generate_videos(
            model=model_name,
            prompt=prompt,
            config=types.GenerateVideosConfig(
                aspect_ratio=aspect_ratio,
                duration_seconds=duration_seconds,
                person_generation="allow_adult"
            )
        )
        
        print("⏳ Generando video en la nube de Google (TPUs)...")
        wait_count = 0
        while not operation.done:
            time.sleep(15)
            wait_count += 1
            print(f"   ... procesando ({wait_count * 15}s transcurridos)")
            operation = client.operations.get(operation)
            
        generated_video = operation.response.generated_videos[0]
        client.files.download(file=generated_video.video)
        generated_video.video.save(output_path)
        print(f"✅ Clip de Google Veo guardado en: {output_path}")
        return output_path

    except Exception as e:
        print(f"⚠️ Aviso al llamar a Google Veo API: {e}")
        print("💡 Para activar Veo: Configura tu GEMINI_API_KEY o credenciales de Google Cloud Vertex AI.")
        return None

def fetch_pexels_broll(
    query: str,
    output_path: str,
    pexels_api_key: str = None
) -> str:
    """
    Descarga clips verticales de stock gratuitos en alta definición (1080x1920)
    usando la API de Pexels como alternativa o complemento a Veo.
    """
    key = pexels_api_key or os.getenv("PEXELS_API_KEY")
    if not key:
        return None
        
    try:
        url = f"https://api.pexels.com/videos/search?query={query}&orientation=portrait&per_page=5"
        headers = {"Authorization": key}
        res = requests.get(url, headers=headers, timeout=15)
        if res.status_code == 200:
            data = res.json()
            videos = data.get("videos", [])
            if videos:
                # Obtener el archivo de mejor calidad HD vertical
                video_files = videos[0].get("video_files", [])
                for vf in video_files:
                    if vf.get("width") == 1080 or vf.get("quality") == "hd":
                        download_url = vf.get("link")
                        r = requests.get(download_url, timeout=30)
                        with open(output_path, "wb") as f:
                            f.write(r.content)
                        print(f"✅ B-Roll de Pexels descargado: {output_path}")
                        return output_path
    except Exception as e:
        print(f"⚠️ Error descargando B-Roll: {e}")
    return None

if __name__ == "__main__":
    prompt_test = (
        "Vertical 9:16. Extreme slow dolly-in on a weathered white marble Roman statue of Seneca, "
        "chiaroscuro golden candle lighting from the right, pitch black background, floating dust particles, "
        "ultra photorealistic, cinematic, austere mood."
    )
    print("Probando conector de Google Veo...")
    generate_veo_clip(prompt_test, "automation/output/veo_test.mp4")
