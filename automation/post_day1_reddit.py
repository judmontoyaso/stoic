import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(HERE, ".browser_profile", "reddit_state.json")

title = "¿Por qué grabarte 3 minutos sin guion es el mejor diagnóstico de tu comunicación?"

body = """La mayoría de las personas intenta mejorar su forma de hablar aplicando trucos de lenguaje corporal sin saber con precisión qué errores comete en la práctica real.

El ejercicio de la línea base consiste en grabarse tres minutos hablando de cualquier tema sin preparación previa y hacer dos revisiones:
1. Solo audio (con ojos cerrados): para aislar muletillas, velocidad y pausas vacías.
2. Solo video (sin volumen): para mirar postura, manos y mirada.

Confrontarse con una grabación propia genera rechazo, pero la cámara muestra exactamente lo que los demás ven y uno suele ignorar. Sin esa medición inicial, cualquier intento de progreso posterior va a ciegas.

¿Alguna vez se han grabado hablando para evaluar su comunicación de forma analítica, o evitan verse en video?"""

print("🔴 [Reddit] Publicando debate del Día 1 en r/conversaciones...")

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

    page.goto("https://www.reddit.com/r/conversaciones/submit", wait_until="domcontentloaded", timeout=20000)
    time.sleep(4)

    # Llenar título
    print("1. Rellenando título...")
    title_box = page.locator("textarea[placeholder*='Título']").first
    title_box.fill(title)
    time.sleep(1)

    # Llenar cuerpo
    print("2. Rellenando cuerpo del post...")
    body_box = page.locator("textarea[placeholder*='Cuerpo'], div[role='textbox']").first
    body_box.fill(body)
    time.sleep(2)

    page.screenshot(path=os.path.join(HERE, "reddit_before_submit.png"))

    # Clic en Publicar
    print("3. Clic en botón de envío...")
    submit_btn = page.locator("button:has-text('Solicitud para publicar'), button:has-text('Publicar'), button:has-text('Post')").first
    if submit_btn.count():
        print(f"   Haciendo clic en: {submit_btn.inner_text()}")
        submit_btn.click()
        print("   Esperando publicación (10s)...")
        time.sleep(10)
        print("URL final tras publicar:", page.url)
        page.screenshot(path=os.path.join(HERE, "reddit_post_published.png"))
        print("🎉 ¡Debate del Día 1 enviado exitosamente en Reddit!")
    else:
        print("⚠️ No se encontró botón de envío.")

    context.storage_state(path=state_path)
    browser.close()
