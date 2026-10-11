import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(HERE, ".browser_profile", "instagram_state.json")
video_path = os.path.abspath(os.path.join(HERE, "output", "lote_10_videos", "dia_01", "stoicom_dia_01.mp4"))

caption = """El primer error al intentar hablar mejor es corregir a ciegas. Grábate 3 minutos hoy sin guion. El audio te dirá tus muletillas; el video te dirá tus inseguridades. Día 1 de 90.

Prueba los primeros 7 días gratis en el link de la bio.

#comunicacion #oratoria #lenguajecorporal #estoicismo #hablarenpublico #stoicom"""

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        storage_state=state_path,
        viewport={'width': 1280, 'height': 850},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    )
    page = context.new_page()
    page.goto('https://www.instagram.com/', wait_until='networkidle')
    time.sleep(3)

    # Clic en Crear (+)
    print("1. Clic en Crear...")
    create_btn = page.locator("svg[aria-label='New post'], svg[aria-label='Nuevo post']").first
    create_btn.click()
    time.sleep(2)

    # Subir archivo
    print("2. Subiendo video...")
    page.set_input_files("input[type='file']", video_path)
    time.sleep(4)

    ok_btn = page.query_selector("button:has-text('OK')")
    if ok_btn:
        ok_btn.click()
        time.sleep(1)

    # Next 1
    print("3. Next 1...")
    page.locator("div[role='button']:has-text('Next'), div[role='button']:has-text('Siguiente')").click()
    time.sleep(3)

    # Next 2
    print("4. Next 2...")
    page.locator("div[role='button']:has-text('Next'), div[role='button']:has-text('Siguiente')").click()
    time.sleep(3)

    # Escribir caption (escribir sin '#' final para no abrir dropdown)
    print("5. Escribiendo caption...")
    caption_box = page.locator("div[aria-label='Write a caption...'], div[contenteditable='true']").first
    caption_box.click()
    time.sleep(1)
    caption_box.fill(caption)
    time.sleep(1)
    
    # Hacer clic fuera del editor de texto para quitar foco y cerrar autocompletado
    header_title = page.locator("h1:has-text('New reel'), div:has-text('New reel')").first
    if header_title:
        header_title.click()
        time.sleep(1)

    # Clic en Share (el botón en la esquina superior derecha del diálogo)
    print("6. Clic en Share...")
    share_button = page.locator("div[role='button']:has-text('Share')").last
    print("Texto del botón:", share_button.inner_text())
    share_button.click()
    
    print("7. Esperando que Instagram suba y procese el video...")
    for i in range(12):
        time.sleep(4)
        print(f"   Procesando... ({(i+1)*4}s)")
        # Comprobar si salió el mensaje de éxito
        if page.query_selector("span:has-text('Your reel has been shared')") or page.query_selector("span:has-text('Se ha compartido tu reel')") or page.query_selector("img[alt='Animated checkmark']"):
            print("🎉 ¡CONFIRMACIÓN RECIBIDA: Reel publicado exitosamente!")
            break

    page.screenshot(path=os.path.join(HERE, "ig_final_success.png"))
    context.storage_state(path=state_path)
    browser.close()
    print("✅ Proceso completado.")
