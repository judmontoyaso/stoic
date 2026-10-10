import os
import sys
import time
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv('.env.local')
load_dotenv('automation/.env')

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY no encontrada")
    sys.exit(1)

print(f"Iniciando generación con Veo 3.1 usando clave: {api_key[:10]}...")

from google import genai
from google.genai import types

client = genai.Client(api_key=api_key)

prompt = (
    "Cinematic close-up slow motion of a classical stoic Roman marble statue bust of Marcus Aurelius. "
    "Dark moody dramatic studio lighting, soft golden caustics and amber rim light tracing the marble contours. "
    "Subtle floating golden dust particles in the air, high-end luxury dark aesthetic, seamless loop feeling, 8k render."
)

output_path = "public/hero_stoic_veo.mp4"

print("Enviando petición a models/veo-3.1-generate-preview...")
try:
    operation = client.models.generate_videos(
        model="veo-3.1-generate-preview",
        prompt=prompt,
        config=types.GenerateVideosConfig(
            aspect_ratio="16:9",
            duration_seconds=5,
            person_generation="allow_adult"
        )
    )

    print("Operación iniciada. Esperando renderizado de Veo en TPUs de Google...")
    wait_time = 0
    while not operation.done:
        time.sleep(10)
        wait_time += 10
        print(f"  ... renderizando en Google Cloud ({wait_time}s)")
        operation = client.operations.get(operation)

    generated_video = operation.response.generated_videos[0]
    generated_video.video.save(output_path)
    print(f"ÉXITO: Video generado por Google Veo guardado en: {output_path}")

except Exception as e:
    print(f"Error generando video con Veo: {e}")
    sys.exit(1)
