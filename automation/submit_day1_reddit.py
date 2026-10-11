import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(HERE, ".browser_profile", "reddit_state.json")

title_text = "¿Por qué grabarte 3 minutos sin guion es el mejor diagnóstico de tu comunicación?"

body_text = """La mayoría de las personas intenta mejorar su forma de hablar aplicando trucos de lenguaje corporal sin saber con precisión qué errores comete en la práctica real.

El ejercicio de la línea base consiste en grabarse tres minutos hablando de cualquier tema sin preparación previa y hacer dos revisiones:
1. Solo audio (con ojos cerrados): para aislar muletillas, velocidad y pausas vacías.
2. Solo video (sin volumen): para mirar postura, manos y mirada.

Confrontarse con una grabación propia genera rechazo, pero la cámara muestra exactamente lo que los demás ven y uno suele ignorar. Sin esa medición inicial, cualquier intento de progreso posterior va a ciegas.

¿Alguna vez se han grabado hablando para evaluar su comunicación de forma analítica, o evitan verse en video?"""

print("🔴 [Reddit] Publicando debate en r/conversaciones...")

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

    page.goto("https://www.reddit.com/r/conversaciones/submit", wait_until="domcontentloaded")
    time.sleep(4)

    # 1. Fill title
    print("1. Rellenando título...")
    title_box = page.locator("textarea[name='title']").first
    title_box.fill(title_text)
    time.sleep(1)

    # 2. Fill body
    print("2. Rellenando cuerpo del post...")
    body_box = page.locator("div[slot='rte']").first
    body_box.click()
    page.keyboard.insert_text(body_text)
    time.sleep(2)

    # 3. Click submit button
    print("3. Haciendo clic en botón de publicación...")
    try:
        page.get_by_text("Solicitud para publicar").click()
        print("   Clic realizado con get_by_text('Solicitud para publicar')")
    except Exception as e:
        print(f"   Fallo con get_by_text: {e}, intentando con locator...")
        page.locator("button:has-text('Solicitud para publicar')").click()

    print("4. Esperando confirmación de Reddit (12s)...")
    time.sleep(12)

    final_url = page.url
    print(f"URL final: {final_url}")
    screenshot_path = os.path.join(HERE, "reddit_post_final.png")
    page.screenshot(path=screenshot_path)
    print(f"Screenshot guardado: {screenshot_path}")

    context.storage_state(path=state_path)

    if "/comments/" in final_url or "conversaciones/comments" in final_url:
        print(f"🎉 ¡POST PUBLICADO CON ÉXITO EN REDDIT! URL: {final_url}")
    else:
        print(f"Comprobando resultado: {final_url}")

    browser.close()
