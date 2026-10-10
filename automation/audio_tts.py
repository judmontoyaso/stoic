"""
Módulo de Generación de Voz en Off (TTS) y Subtítulos Sincronizados
Soporta:
1. ElevenLabs API (máxima fidelidad cinematográfica).
2. Edge-TTS (fallback automático a $0 USD ilimitado con voces neuronales en español).
"""

import os
import sys
import re
import asyncio
import requests
import edge_tts
from edge_tts import SubMaker

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

DEFAULT_EDGE_VOICE = "es-ES-AlvaroNeural"  # Alternativas: "es-CO-GonzaloNeural", "es-MX-JorgeNeural"

async def _generate_edge_tts(text: str, output_audio: str, output_srt: str, voice: str = DEFAULT_EDGE_VOICE):
    """Genera audio y subtítulos sincronizados con Edge-TTS."""
    communicate = edge_tts.Communicate(text, voice, rate="+0%", pitch="-2Hz")
    sub_maker = SubMaker()
    
    with open(output_audio, "wb") as audio_file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_file.write(chunk["data"])
            elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                sub_maker.feed(chunk)
                
    srt_content = sub_maker.get_srt()
    with open(output_srt, "w", encoding="utf-8") as srt_file:
        srt_file.write(srt_content)
        
    # Crear versión ASS estilizada para video vertical 9:16 (estética oscura con oro y blanco)
    output_ass = os.path.splitext(output_srt)[0] + ".ass"
    _convert_srt_to_ass(srt_content, output_ass)
        
    return output_audio, output_srt

def _convert_srt_to_ass(srt_content: str, output_ass: str):
    """Convierte SRT a Advanced SubStation Alpha (.ass) con tipografía cinematográfica para 9:16 (1080x1920)."""
    ass_header = """[Script Info]
Title: StoiCom Subtitles
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,64,&H00FFFFFF,&H0000D7FF,&H00000000,&HB0000000,-1,0,0,0,100,100,1,0,1,6,3,2,80,80,400,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events = []
    blocks = srt_content.strip().split("\n\n")
    for block in blocks:
        lines = block.strip().split("\n")
        if len(lines) >= 3:
            time_line = lines[1]
            raw_text = " ".join(lines[2:]).strip().upper()
            
            # Formatear líneas largas para que no se corten en 1080px de ancho
            words = raw_text.split()
            formatted_lines = []
            current_line = []
            current_len = 0
            for w in words:
                if current_len + len(w) + 1 > 24 and current_line:
                    formatted_lines.append(" ".join(current_line))
                    current_line = [w]
                    current_len = len(w)
                else:
                    current_line.append(w)
                    current_len += len(w) + 1
            if current_line:
                formatted_lines.append(" ".join(current_line))
            
            wrapped_text = "\\N".join(formatted_lines)
            
            match = re.match(r"(\d+):(\d+):(\d+),(\d+)\s+-->\s+(\d+):(\d+):(\d+),(\d+)", time_line)
            if match:
                sh, sm, ss, sms, eh, em, es, ems = match.groups()
                start_ass = f"{int(sh):01d}:{sm}:{ss}.{sms[:2]}"
                end_ass = f"{int(eh):01d}:{em}:{es}.{ems[:2]}"
                events.append(f"Dialogue: 0,{start_ass},{end_ass},Default,,0,0,0,,{wrapped_text}")
                
    with open(output_ass, "w", encoding="utf-8") as f:
        f.write(ass_header + "\n".join(events) + "\n")

def generate_voiceover(
    text: str,
    output_audio: str,
    output_srt: str,
    elevenlabs_api_key: str = None,
    elevenlabs_voice_id: str = "JBFqnCBsd6RMkjVDRZzb",
    force_edge: bool = False
):
    """
    Genera la locución con ElevenLabs o realiza fallback automático a Edge-TTS.
    """
    api_key = elevenlabs_api_key or os.getenv("ELEVENLABS_API_KEY")
    
    if api_key and not force_edge:
        print("🎙️ Intentando generación con ElevenLabs API...")
        try:
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{elevenlabs_voice_id}"
            headers = {
                "xi-api-key": api_key,
                "Content-Type": "application/json"
            }
            data = {
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.50,
                    "similarity_boost": 0.75,
                    "style": 0.30,
                    "use_speaker_boost": True
                }
            }
            response = requests.post(url, json=data, headers=headers, timeout=30)
            if response.status_code == 200:
                with open(output_audio, "wb") as f:
                    f.write(response.content)
                print("✅ Audio generado exitosamente con ElevenLabs.")
                # Generamos los subtítulos alineados con Edge-TTS para mantener sincronía
                asyncio.run(_generate_edge_tts(text, output_audio + ".tmp.mp3", output_srt))
                if os.path.exists(output_audio + ".tmp.mp3"):
                    os.remove(output_audio + ".tmp.mp3")
                return output_audio, output_srt
            else:
                print(f"⚠️ ElevenLabs respondió con código {response.status_code}: {response.text}")
                print("🔄 Conmutando automáticamente a Edge-TTS ($0)...")
        except Exception as e:
            print(f"⚠️ Excepción conectando con ElevenLabs: {e}")
            print("🔄 Conmutando automáticamente a Edge-TTS ($0)...")
            
    # Fallback o ejecución estándar gratuita con Edge-TTS
    print(f"🎙️ Generando locución neuronal con Edge-TTS ({DEFAULT_EDGE_VOICE})...")
    asyncio.run(_generate_edge_tts(text, output_audio, output_srt, DEFAULT_EDGE_VOICE))
    print("✅ Audio y subtítulos sincronizados generados con Edge-TTS.")
    return output_audio, output_srt

if __name__ == "__main__":
    demo_text = "Grábate tres minutos hablando de tu trabajo. Sin preparar nada. Ahora míralo. Dos veces. Vas a querer apagarlo. Por eso funciona."
    out_mp3 = "automation/output/test_voice.mp3"
    out_srt = "automation/output/test_voice.srt"
    generate_voiceover(demo_text, out_mp3, out_srt)
    print("Prueba completada.")
