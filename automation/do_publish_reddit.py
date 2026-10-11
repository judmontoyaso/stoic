import os
import time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(HERE, ".browser_profile", "reddit_state.json")

title_text = "¿Por qué grabarte 3 minutos sin guion es el mejor diagnóstico de tu comunicación?"

body_text = """La mayoría de las personas intenta mejorar su forma de hablar aplicando trucos de lenguaje corporal sin saber con precisión qué errores comete en la práctica real.

El ejercicio de la línea base consiste en grabarse tres minutos hablando de cualquier tema sin preparación previa y hacer dos revisiones:
1. Solo audio (con ojos cerrados): para aislar muletillas, velocidad y pausas vacías.
2. Solo video (sin volumen): para mirar postura, manos y mirada.

Confrontarse con una grabación propia genera rechazo, pero la cámara muestra exactamente lo que los demás ven y uno suele ignorar. Sin esa medición inicial, cualquier intento de progreso posterior va a ciegas.

¿Alguna vez se han grabado hablando para evaluar su comunicación de forma analítica, o evitan verse en video?"""

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
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
    print("1. Filling title...")
    title_box = page.locator("textarea[name='title']").first
    title_box.fill(title_text)
    time.sleep(1)

    # 2. Fill body
    print("2. Filling body in div[slot='rte']...")
    body_box = page.locator("div[slot='rte']").first
    body_box.click()
    page.keyboard.insert_text(body_text)
    time.sleep(2)

    # 3. Inspect visible buttons
    buttons = page.evaluate("""() => {
        const btns = Array.from(document.querySelectorAll('button, [role="button"]'));
        return btns.map((b, i) => {
            const r = b.getBoundingClientRect();
            return {
                index: i,
                tag: b.tagName,
                text: b.innerText.trim(),
                disabled: b.disabled || b.getAttribute('aria-disabled'),
                rect: { x: r.x, y: r.y, w: r.width, h: r.height }
            };
        }).filter(b => b.rect.w > 0 && b.rect.h > 0 && b.text.length > 0);
    }""")
    print("Visible buttons:")
    for b in buttons:
        print(b)

    page.screenshot(path=os.path.join(HERE, "reddit_ready_post.png"))
    print("Screenshot saved to reddit_ready_post.png")

    # Click submit if found
    for b in buttons:
        txt = b['text'].lower()
        if "solicitud" in txt or "publicar" in txt or "post" in txt:
            if not b['disabled'] or b['disabled'] == 'false':
                print(f"Clicking submit button: '{b['text']}'...")
                page.locator(f"button:has-text('{b['text']}')").first.click()
                print("Waiting 10s for post submission...")
                time.sleep(10)
                print("New URL:", page.url)
                page.screenshot(path=os.path.join(HERE, "reddit_submitted.png"))
                context.storage_state(path=state_path)
                break

    browser.close()
