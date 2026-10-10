import os
import sys
import time
from dotenv import load_dotenv

load_dotenv('.env.local')
load_dotenv('automation/.env')

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
print(f"Iniciando Google Veo 3.1 con API Key: {api_key[:10]}...")

from google import genai
from google.genai import types

client = genai.Client(api_key=api_key)

# Prompt cinematográfico refinado para el Hero de StoiCom (arquitectura clásica, mármol y fuego dorado)
prompt = (
    "Cinematic slow motion camera drift across a classical Roman temple colonnade at twilight. "
    "Warm golden firelight flickers against white marble columns, casting dramatic chiaroscuro shadows. "
    "Glowing golden embers and dust particles drift gently through the air in pitch black background. "
    "8k resolution, photorealistic, luxury dark neo-stoic aesthetic, smooth motion."
)

output_path = "public/veo_stoic_hero.mp4"

print("Enviando solicitud a models/veo-3.1-generate-preview (aspect_ratio: 16:9, duration: 4s)...")

try:
    operation = client.models.generate_videos(
        model="veo-3.1-generate-preview",
        prompt=prompt,
        config=types.GenerateVideosConfig(
            duration_seconds=4,
            aspect_ratio="16:9"
        )
    )

    print(f"Operación iniciada: {operation.name}")
    print("Esperando procesamiento en Google Cloud...")

    wait_count = 0
    while not operation.done:
        time.sleep(12)
        wait_count += 1
        print(f"  ... renderizando en los servidores de Google ({wait_count * 12}s)")
        operation = client.operations.get(operation)

    if operation.error:
        print(f"Error de la operación: {operation.error}")
        sys.exit(1)

    response = operation.response
    if response and response.generated_videos:
        video_obj = response.generated_videos[0]
        video_obj.video.save(output_path)
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"🎉 ¡VIDEO GENERADO EXITOSAMENTE CON GOOGLE VEO 3.1!")
        print(f"Guardado en: {output_path} ({size_mb:.2f} MB)")
    else:
        print(f"Respuesta sin videos generados: {response}")
        sys.exit(1)

except Exception as e:
    print(f"Error durante la generación: {e}")
    sys.exit(1)
