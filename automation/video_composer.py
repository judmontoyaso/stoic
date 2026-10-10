"""
Módulo de Composición y Renderizado de Video 9:16 (1080x1920)
Utiliza FFmpeg con aceleración por GPU (NVENC en NVIDIA RTX 2050) o CPU.
Combina video de fondo/B-roll, locución, subtítulos dinámicos y música ambiental.
"""

import os
import sys
import subprocess
import imageio_ffmpeg

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()

def check_nvenc_support() -> bool:
    """Verifica si el codificador por hardware h264_nvenc está disponible."""
    try:
        res = subprocess.run([FFMPEG_EXE, "-encoders"], capture_output=True, text=True, check=True)
        return "h264_nvenc" in res.stdout
    except Exception:
        return False

def create_dolly_zoom_video_from_image(image_path: str, duration: float, output_bg: str) -> str:
    """
    Toma una imagen vertical 9:16 (ej. estatua de mármol de Séneca) y le aplica
    un movimiento de cámara lento tipo Dolly-In cinematográfico continuo con NVENC.
    """
    has_nvenc = check_nvenc_support()
    vcodec = "h264_nvenc" if has_nvenc else "libx264"
    total_frames = int(duration * 30)

    cmd = [
        FFMPEG_EXE, "-y",
        "-loop", "1",
        "-i", image_path,
        "-t", str(duration),
        "-vf", (
            f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
            f"zoompan=z='min(zoom+0.0003,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={total_frames}:s=1080x1920:fps=30"
        ),
        "-c:v", vcodec,
        "-pix_fmt", "yuv420p",
        output_bg
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return output_bg

def create_cinematic_fallback_background(duration: float, output_bg: str) -> str:
    """
    Crea un clip de fondo cinemático 9:16. Si existe la imagen de la estatua estoica en assets,
    genera un dolly-in cinematográfico sobre la estatua.
    """
    statue_asset = os.path.join(os.path.dirname(__file__), "assets", "stoic_seneca_statue.jpg")
    if os.path.exists(statue_asset):
        print("🏛️ Generando movimiento de cámara cinematográfico (Dolly-In) sobre la estatua estoica...")
        return create_dolly_zoom_video_from_image(statue_asset, duration, output_bg)

    cmd = [
        FFMPEG_EXE, "-y",
        "-f", "lavfi",
        "-i", f"color=c=0x0a0a0a:s=1080x1920:d={duration}:r=30",
        "-vf", "drawbox=x=0:y=0:w=1080:h=1920:color=0x15120e@0.5:t=fill,vignette=PI/4",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        output_bg
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return output_bg

def compose_vertical_video(
    background_video: str,
    audio_path: str,
    subtitle_ass_path: str,
    output_path: str,
    bg_music_path: str = None
) -> str:
    """
    Ensambla el video final 9:16 con audio sincronizado, subtítulos quemados y aceleración NVENC.
    """
    has_nvenc = check_nvenc_support()
    vcodec = "h264_nvenc" if has_nvenc else "libx264"
    print(f"🎬 Ensamblando video vertical 9:16 usando codificador: {vcodec}...")

    # Escapar ruta de subtítulos para filtro de ffmpeg en Windows
    ass_escaped = subtitle_ass_path.replace("\\", "/").replace(":", "\\:")

    filter_complex = f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,subtitles='{ass_escaped}'[v]"

    cmd = [
        FFMPEG_EXE, "-y",
        "-i", background_video,
        "-i", audio_path,
    ]

    if bg_music_path and os.path.exists(bg_music_path):
        cmd.extend(["-i", bg_music_path])
        filter_complex += ";[1:a]volume=1.0[voice];[2:a]volume=0.12[bgm];[voice][bgm]amix=inputs=2:duration=first[a]"
        audio_map = "[a]"
    else:
        audio_map = "1:a"

    cmd.extend([
        "-filter_complex", filter_complex,
        "-map", "[v]",
        "-map", audio_map,
        "-c:v", vcodec,
        "-pix_fmt", "yuv420p",
        "-shortest",
        output_path
    ])

    try:
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"✅ Video final generado exitosamente en: {output_path}")
        return output_path
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Error renderizando con {vcodec}: {e.stderr.decode('utf-8', errors='ignore')}")
        if vcodec == "h264_nvenc":
            print("🔄 Reintentando con codificador por software libx264...")
            cmd[cmd.index("h264_nvenc")] = "libx264"
            subprocess.run(cmd, check=True, capture_output=True)
            print(f"✅ Video final generado exitosamente con libx264: {output_path}")
            return output_path
        raise

if __name__ == "__main__":
    audio = "automation/output/test_voice.mp3"
    subs = "automation/output/test_voice.ass"
    bg = "automation/output/temp_bg.mp4"
    out = "automation/output/video_demo_stoicom.mp4"
    
    if os.path.exists(audio) and os.path.exists(subs):
        create_cinematic_fallback_background(14.0, bg)
        compose_vertical_video(bg, audio, subs, out)
        print("Test de video vertical completado.")
    else:
        print("Genera primero el audio con audio_tts.py")
