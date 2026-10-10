import os
import requests
from dotenv import load_dotenv

load_dotenv("automation/.env")
key = os.getenv("ELEVENLABS_API_KEY")
r = requests.get("https://api.elevenlabs.io/v1/voices", headers={"xi-api-key": key})
voices = r.json().get("voices", [])

print(f"Total voces disponibles en cuenta: {len(voices)}")
for v in voices:
    name = v.get("name")
    vid = v.get("voice_id")
    cat = v.get("category")
    labels = v.get("labels", {})
    desc = v.get("description", "")
    print(f"- {name} (ID: {vid}) | Cat: {cat} | Accent: {labels.get('accent')} | Gender: {labels.get('gender')} | Use: {labels.get('use_case')}")
