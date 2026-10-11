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

    print("1. Cargando r/conversaciones/submit...")
    page.goto("https://www.reddit.com/r/conversaciones/submit", wait_until="domcontentloaded", timeout=20000)
    time.sleep(4)

    # 1. Título
    print("2. Escribiendo título en textarea[name='title']...")
    title_box = page.locator("textarea[name='title']").first
    title_box.click()
    title_box.fill(title_text)
    time.sleep(1)

    # 2. Cuerpo
    print("3. Escribiendo cuerpo en editor Lexical...")
    # Buscamos el editor de texto enriquecido dentro del composer
    editor = page.locator("div[contenteditable='true'][role='textbox']").first
    editor.click()
    time.sleep(1)
    
    # Escribir usando fill o typing para disparar los eventos de Lexical
    # En Lexical de Reddit, page.keyboard.type o insert_text funciona perfecto
    # Para texto con saltos de línea, podemos usar evaluate o clipboard/insert_text
    page.keyboard.insert_text(body_text)
    time.sleep(2)

    page.screenshot(path=os.path.join(HERE, "reddit_ready_to_submit.png"))
    print("Screenshot guardado en reddit_ready_to_submit.png")

    # 3. Inspeccionar botones tras rellenar campos
    all_buttons = page.locator("button").all()
    print(f"Total botones tras rellenar: {len(all_buttons)}")
    for b in all_buttons:
        txt = b.inner_text().strip()
        if txt:
            print(f"  Botón visible: '{txt}'")
            
    # Intentar publicar si encontramos el botón
    submit_btn = page.locator("button:has-text('Solicitud para publicar'), button:has-text('Publicar'), button:has-text('Post')").first
    if submit_btn.count():
        btn_text = submit_btn.inner_text().strip()
        print(f"4. Botón de publicación detectado: '{btn_text}'. Haciendo clic...")
        submit_btn.click()
        print("Esperando navegación/respuesta de Reddit...")
        time.sleep(8)
        print("URL final:", page.url)
        page.screenshot(path=os.path.join(HERE, "reddit_final_status.png"))
        context.storage_state(path=state_path)
    else:
        print("⚠️ No se encontró botón directo con ese texto.")

    browser.close()
