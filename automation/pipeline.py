"""
StoiCom Master Distribution Pipeline
Orquestador principal para la generación y distribución de videos 9:16 y posts de Reddit.
Ejecutable por CLI, Cron local, o activado vía Webhook desde n8n.
"""

import os
import sys
import argparse
from audio_tts import generate_voiceover
from video_composer import compose_vertical_video, create_cinematic_fallback_background
from veo_generator import generate_veo_clip
from reddit_distributor import create_reddit_discussion_post, publish_or_save_reddit_post

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Lecciones base de StoiCom para el lote inicial
DEFAULT_LESSONS = {
    1: {
        "title": "Grábate 3 minutos (Línea Base)",
        "script": (
            "Grábate tres minutos hablando de tu trabajo. Sin preparar nada. "
            "Ahora míralo. Dos veces. "
            "La primera, tapa la pantalla y solo escucha: cuenta tus muletillas. "
            "La segunda, quita el volumen y solo mira: tu postura, tus manos, tus ojos. "
            "Vas a querer apagarlo. Por eso funciona. "
            "Es el diagnóstico más honesto que existe: lo que el mundo ve, y tú no. "
            "Ese video se guarda. En el día ochenta y seis lo vuelves a ver, "
            "y ahí está la prueba de que cambiaste. "
            "Día uno de noventa. Apenas empieza. "
            "Los primeros siete días son gratis en stoicom.app"
        ),
        "veo_prompt": (
            "Vertical 9:16. Extreme slow dolly-in on a weathered white marble Greek statue's face, "
            "half in deep shadow, single warm golden key light from the side, pitch black background, "
            "floating dust particles, cinematic chiaroscuro, photorealistic, moody and austere."
        ),
        "core_idea": "El diagnóstico más honesto de tu comunicación es observar lo que el mundo ve y tú ignoras: tus muletillas y tu postura corporal en frío.",
        "exercise": "Grábate 3 minutos sin guión hablando de lo que haces. Escúchalo una vez sin video y míralo una vez sin audio."
    },
    2: {
        "title": "Pregúntale a 5 personas (Benchmark de escucha)",
        "script": (
            "Día dos del programa: pídele a cinco personas cercanas que califiquen "
            "tu capacidad de escucha, del uno al diez. "
            "Y que te cuenten una situación concreta donde escuchaste mal. "
            "La regla es una sola: anotas todo en silencio. Sin justificarte. "
            "Sin explicar. Sin 'sí, pero'. "
            "Si te defiendes, el ejercicio fracasó. "
            "Escuchar no es esperar tu turno para hablar. Es callar al ego. "
            "Día dos de noventa en stoicom.app"
        ),
        "veo_prompt": (
            "Vertical 9:16. Close-up on a white marble classical ear and jawline, flickering warm golden candlelight, "
            "pitch black background, shallow depth of field, chiaroscuro, photorealistic, austere."
        ),
        "core_idea": "La mayoría de la gente no escucha para comprender, sino para responder o justificarse ante el primer desacuerdo.",
        "exercise": "Pide a 5 personas que califiquen tu escucha de 1 a 10 con un ejemplo. Tu única respuesta permitida es: 'gracias, lo anoto'."
    }
}

def run_pipeline(day: int = 1, mode: str = "all", use_veo: bool = False, dry_run: bool = True):
    print(f"\n=======================================================")
    print(f"🚀 INICIANDO PIPELINE DE DISTRIBUCIÓN STOICOM — DÍA {day}")
    print(f"=======================================================\n")
    
    lesson = DEFAULT_LESSONS.get(day, DEFAULT_LESSONS[1])
    output_dir = os.path.join(os.path.dirname(__file__), "output")
    os.makedirs(output_dir, exist_ok=True)
    
    results = {}
    
    # --- RAMA 1: VIDEO 9:16 ---
    if mode in ("video", "all"):
        print("📌 1. GENERANDO AUDIO Y SUBTÍTULOS DINÁMICOS...")
        audio_path = os.path.join(output_dir, f"audio_day_{day}.mp3")
        srt_path = os.path.join(output_dir, f"subs_day_{day}.srt")
        ass_path = os.path.join(output_dir, f"subs_day_{day}.ass")
        
        generate_voiceover(lesson["script"], audio_path, srt_path)
        
        # Generar clip visual (Google Veo o Fondo Cinemático Fallback)
        bg_video_path = os.path.join(output_dir, f"bg_clip_day_{day}.mp4")
        if use_veo:
            print("📌 2. SOLICITANDO CLIP REAL A GOOGLE VEO API...")
            veo_res = generate_veo_clip(lesson["veo_prompt"], bg_video_path)
            if not veo_res:
                print("🔄 Utilizando fondo cinemático de alta definición...")
                create_cinematic_fallback_background(35.0, bg_video_path)
        else:
            print("📌 2. CREANDO FONDO CINEMÁTICO 9:16 (CLAROSCURO)...")
            create_cinematic_fallback_background(35.0, bg_video_path)
            
        # Componer Video Final con FFmpeg NVENC
        print("📌 3. ENSAMBLANDO VIDEO FINAL CON GPU (NVENC)...")
        final_video_path = os.path.join(output_dir, f"video_stoicom_dia_{day}.mp4")
        compose_vertical_video(bg_video_path, audio_path, ass_path, final_video_path)
        results["video"] = final_video_path

    # --- RAMA 2: REDDIT POST ---
    if mode in ("reddit", "all"):
        print("\n📌 4. GENERANDO PUBLICACIÓN PARA REDDIT...")
        post_data = create_reddit_discussion_post(
            day_number=day,
            lesson_title=lesson["title"],
            lesson_core_idea=lesson["core_idea"],
            practical_exercise=lesson["exercise"]
        )
        reddit_file = os.path.join(output_dir, f"reddit_post_dia_{day}.md")
        publish_or_save_reddit_post(post_data, reddit_file, dry_run=dry_run)
        results["reddit"] = reddit_file

    print("\n=======================================================")
    print("✅ EJECUCIÓN DEL PIPELINE COMPLETADA EXITOSAMENTE")
    print(f"📁 Video generado: {results.get('video')}")
    print(f"📄 Post de Reddit: {results.get('reddit')}")
    print("=======================================================\n")
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="StoiCom Distribution Pipeline")
    parser.add_argument("--day", type=int, default=1, help="Número de día a procesar (1 a 90)")
    parser.add_argument("--mode", type=str, choices=["video", "reddit", "all"], default="all")
    parser.add_argument("--veo", action="store_true", help="Activar generación por Google Veo API")
    parser.add_argument("--live", action="store_true", help="Publicar en vivo en lugar de dry-run")
    
    args = parser.parse_args()
    run_pipeline(day=args.day, mode=args.mode, use_veo=args.veo, dry_run=not args.live)
