import os
import sys
import time
from dotenv import load_dotenv

load_dotenv('.env.local')

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
from google import genai
from google.genai import types

client = genai.Client(api_key=api_key)

prompt = (
    "Vertical 9:16 cinematic slow motion of an antique brass hourglass resting on an ancient dark stone altar. "
    "Fine golden sand trickling down continuously illuminated by a single warm golden ray of sunlight. "
    "Pitch black background, floating golden dust particles in the air, 8k photorealistic, luxury dark chiaroscuro."
)

output_path = "public/veo_hourglass_memento.mp4"
print("Solicitando video 9:16 a Google Veo 3.1...")

try:
    operation = client.models.generate_videos(
        model="veo-3.1-generate-preview",
        prompt=prompt,
        config=types.GenerateVideosConfig(
            duration_seconds=4,
            aspect_ratio="9:16"
        )
    )

    print(f"Operación iniciada: {operation.name}")
    while not operation.done:
        time.sleep(12)
        print("  ... renderizando en Google Cloud...")
        operation = client.operations.get(operation)

    if operation.error:
        print("Error:", operation.error)
        sys.exit(1)

    video = operation.response.generated_videos[0].video
    client.files.download(file=video)
    video.save(output_path)
    print(f"✅ Video 9:16 guardado en {output_path} ({os.path.getsize(output_path) / 1024 / 1024:.2f} MB)")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
