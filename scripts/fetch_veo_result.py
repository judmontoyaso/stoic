import os
import sys
import time
from dotenv import load_dotenv

load_dotenv('.env.local')

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
print(f"Usando clave API: {api_key[:10]}...")

from google import genai
from google.genai import types

client = genai.Client(api_key=api_key)

op_name = "models/veo-3.1-generate-preview/operations/5va7szlxh5ei"
output_path = "public/hero_stoic_veo.mp4"

print(f"Consultando estado de la operación de Veo 3.1: {op_name}...")

operation = client.operations.get(types.GetOperationConfig(name=op_name))

wait_count = 0
while not operation.done:
    print(f"  ... aún procesando en Google Cloud ({wait_count * 10}s transcurridos)")
    time.sleep(10)
    wait_count += 1
    operation = client.operations.get(types.GetOperationConfig(name=op_name))

print("¡Operación completada!")
if operation.error:
    print("Error en operación:", operation.error)
    sys.exit(1)

generated_video = operation.response.generated_videos[0]
print(f"Descargando video de Veo a {output_path}...")
generated_video.video.save(output_path)
print(f"✅ Video guardado exitosamente en: {output_path}")

# Verificar tamaño
size = os.path.getsize(output_path)
print(f"Tamaño del archivo: {size} bytes ({size / 1024 / 1024:.2f} MB)")
