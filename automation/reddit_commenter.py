"""
StoiCom Reddit Assistant — Búsqueda inteligente de posts y respuesta en tu nombre.
Busca personas con dudas reales de comunicación (nervios, muletillas, hablar en público)
y responde con consejos de alto valor basados en el programa StoiCom.
"""

import os
import sys
import time
import json
import requests
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
from google import genai

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(HERE, ".env"))

PROFILE_DIR = os.path.join(HERE, ".browser_profile")

SEARCH_QUERIES = [
    "miedo hablar en publico",
    "me tiembla la voz",
    "como dejar de usar muletillas",
    "timidez al hablar en reuniones",
    "mejorar mi comunicacion",
]

SUBREDDITS = [
    "conversaciones",
    "AskRedditespanol",
    "es",
]

def generate_stoic_response(post_title: str, post_text: str) -> str:
    """Genera una respuesta estoica y táctica de alto valor con Gemini."""
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    prompt = f"""Eres un mentor de oratoria, negociación y comunicación estoica de StoiCom.
Un usuario en Reddit acaba de publicar esta duda:
Título: {post_title}
Texto: {post_text}

Redacta un comentario de respuesta de 2 a 3 párrafos cortos que:
1. Valide su situación sin juzgar (tono empático y maduro).
2. Le dé una técnica táctica aplicable de inmediato (por ejemplo, regulación fisiológica 4-6, pausa de 2 segundos, o replanteamiento cognitivo).
3. Sea 100% útil por sí mismo, sin sonar a anuncio ni spam. Al final, menciona de forma muy sutil y natural: 'Es justo lo que practicamos en StoiCom día a día. Mucho ánimo.'
4. Esté en español neutro, claro y profesional.
"""
    resp = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt
    )
    return resp.text.strip()

def find_and_comment(auto_submit: bool = False):
    print("🔍 Iniciando búsqueda de debates en Reddit con tu perfil...")
    
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            headless=False,
            viewport={"width": 1280, "height": 800},
            args=["--disable-blink-features=AutomationControlled"]
        )
        page = context.pages[0] if context.pages else context.new_page()

        # Buscar en Reddit
        query = SEARCH_QUERIES[0]
        search_url = f"https://www.reddit.com/r/conversaciones/search/?q={query.replace(' ', '+')}&sort=new"
        print(f"🌐 Buscando en: {search_url}")
        page.goto(search_url, wait_until="networkidle")
        time.sleep(3)

        # Extraer enlaces a posts
        posts = page.query_selector_all("a[href*='/comments/']")
        post_urls = []
        for post in posts[:5]:
            href = post.get_attribute("href")
            if href and "/comments/" in href and href not in post_urls:
                full_url = href if href.startswith("http") else f"https://www.reddit.com{href}"
                post_urls.append(full_url)

        if not post_urls:
            print("⚠️ No se encontraron posts recientes con esa búsqueda específica. Intentando búsqueda global...")
            page.goto(f"https://www.reddit.com/search/?q={query.replace(' ', '+')}&sort=new", wait_until="networkidle")
            time.sleep(3)
            posts = page.query_selector_all("a[href*='/comments/']")
            for post in posts[:5]:
                href = post.get_attribute("href")
                if href and "/comments/" in href and href not in post_urls:
                    full_url = href if href.startswith("http") else f"https://www.reddit.com{href}"
                    post_urls.append(full_url)

        if not post_urls:
            print("❌ No se pudieron cargar posts en este momento. Revisa tu conexión o el perfil.")
            context.close()
            return

        target_url = post_urls[0]
        print(f"\n🎯 Post seleccionado: {target_url}")
        page.goto(target_url, wait_until="networkidle")
        time.sleep(3)

        title_el = page.query_selector("h1")
        title = title_el.inner_text() if title_el else "Duda sobre comunicación"
        print(f"📌 Título: {title}")

        # Generar respuesta con IA
        print("🧠 Generando respuesta táctica y estoica con Gemini...")
        comment_text = generate_stoic_response(title, title)
        print("\n" + "=" * 50)
        print("📝 COMENTARIO GENERADO:")
        print("=" * 50)
        print(comment_text)
        print("=" * 50 + "\n")

        # Localizar la caja de comentarios
        comment_box = page.query_selector("div[contenteditable='true']") or page.query_selector("textarea") or page.query_selector("shreddit-async-loader")
        if comment_box:
            comment_box.click()
            time.sleep(1)
            page.keyboard.type(comment_text)
            print("✍️ Comentario escrito en la caja de texto.")

            if auto_submit:
                # Clic en botón comentar
                submit_btn = page.query_selector("button:has-text('Comment')") or page.query_selector("button:has-text('Comentar')")
                if submit_btn:
                    submit_btn.click()
                    print("🚀 ¡Comentario publicado exitosamente en Reddit en tu nombre!")
                    time.sleep(3)
            else:
                print("👀 Ventana abierta en tu pantalla para que revises el comentario antes de enviarlo.")
                input("👉 Presiona ENTER aquí cuando quieras cerrar la ventana...")
        else:
            print("⚠️ No se pudo interactuar directamente con la caja de comentarios. Puedes pegarlo manualmente.")

        context.close()

if __name__ == "__main__":
    auto = "--auto" in sys.argv
    find_and_comment(auto_submit=auto)
