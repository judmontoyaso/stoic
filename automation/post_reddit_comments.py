import os
import sys
import time
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
from google import genai

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(HERE, ".env"))

state_path = os.path.join(HERE, ".browser_profile", "reddit_state.json")
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

TARGET_POSTS = [
    {
        "url": "https://www.reddit.com/r/AskRedditespanol/comments/1x26gb9/estar%C3%A1_sobrepensando_de_m%C3%A1s_sobre_la_relaci%C3%B3n_que/",
        "topic": "sobrepensar en relaciones, dicotomía de control y comunicación directa"
    },
    {
        "url": "https://www.reddit.com/r/AskRedditespanol/comments/1x26nxd/deber%C3%ADa_buscarla_en_un_futuro_o_me_aferro_a_una/",
        "topic": "dejar ir con serenidad, aceptación estoica y no forzar vínculos"
    },
    {
        "url": "https://www.reddit.com/r/AskRedditespanol/comments/1x2d1y5/conocen_a_alguien_que_consideran_realmente/",
        "topic": "personalidad, autenticidad, reserva estratégica vs timidez"
    }
]

def generate_comment(title: str, topic: str) -> str:
    prompt = f"""Eres un mentor de comunicación, oratoria y filosofía estoica práctica de StoiCom.
En Reddit (r/AskRedditespanol), un usuario hizo esta publicación:
Título: {title}
Tema clave: {topic}

Escribe una respuesta para el hilo (2 párrafos breves, 60-80 palabras en total) que:
1. Valide el punto con madurez y empatía real.
2. Aporte una perspectiva estoica y psicológica aplicable (p. ej. la dicotomía de control de Epicteto, el principio de no asumir intenciones ajenas, o la regla de tener una conversación franca en lugar de hacer conjeturas mentales).
3. Suene como un usuario sabio, reflexivo y de gran valor para la comunidad (que naturalmente atraiga upvotes).
4. NO pongas enlaces ni hagas autobombo descarado; el valor debe ser 100% genuino. Español natural y claro.
"""
    try:
        resp = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt
        )
        return resp.text.strip()
    except Exception as e:
        print(f"Error generando con Gemini: {e}")
        return "Sobrepensar suele ser el intento de la mente por controlar lo que escapa a su alcance. Marco Aurelio decía que sufrimos más por lo que imaginamos que por lo que realmente sucede. Si tienes dudas sobre el vínculo, la solución no es darle vueltas en soledad, sino tener una conversación directa, serena y sin drama. Lo que dependa de ti, dilo con calma; lo que dependa del otro, acéptalo con dignidad."

print("🔴 [Reddit] Publicando comentarios en hilos activos...")

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    context = browser.new_context(
        storage_state=state_path,
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        viewport={"width": 1280, "height": 850}
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    for i, target in enumerate(TARGET_POSTS):
        print(f"\n--- Publicando comentario [{i+1}/{len(TARGET_POSTS)}] ---")
        try:
            page.goto(target['url'], wait_until="domcontentloaded", timeout=25000)
            time.sleep(3)

            title = page.locator("h1").first.inner_text() if page.locator("h1").count() else "Pregunta"
            print(f"Título: {title}")

            comment_text = generate_comment(title, target["topic"])
            print("Comentario:")
            print(comment_text)

            # 1. Clic en el placeholder para abrir el editor
            print("Abriendo caja de comentarios...")
            placeholder = page.locator("text='Únete a la conversación', [aria-placeholder*='conversación']").first
            if placeholder.count():
                placeholder.click()
                time.sleep(1.5)
            else:
                page.locator("comment-composer-host, shreddit-comment-composer").first.click()
                time.sleep(1.5)

            # 2. Localizar el editor y escribir
            rte = page.locator("div[slot='rte']").first
            if rte.count():
                rte.click()
                time.sleep(0.5)
                page.keyboard.insert_text(comment_text)
                time.sleep(2)

                # 3. Clic en Comentar
                btn = page.locator("button:has-text('Comentar')").first
                if btn.count():
                    btn.click()
                    print(f"✅ ¡Comentario {i+1} enviado con éxito!")
                    time.sleep(5)
                    page.screenshot(path=os.path.join(HERE, f"reddit_comment_published_{i+1}.png"))
                else:
                    print("⚠️ No se encontró el botón Comentar.")
            else:
                print("⚠️ No se encontró el editor RTE.")

        except Exception as e:
            print(f"Error procesando {target['url']}: {e}")

        time.sleep(4)

    context.storage_state(path=state_path)
    browser.close()

print("\n🎉 ¡Proceso de comentarios finalizado!")
