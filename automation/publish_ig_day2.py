import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(HERE, ".browser_profile", "instagram_state.json")
video_path = os.path.abspath(os.path.join(HERE, "output", "lote_10_videos", "dia_02", "stoicom_dia_02.mp4"))

caption = """Crees que sabes escuchar, pero mientes. Tu propia opinión sobre tu atención está distorsionada por el ego.

Hoy, pide a cinco personas cercanas que califiquen tu escucha del 1 al 10. Exige un ejemplo concreto donde fallaste. Recibe sus palabras en silencio absoluto. Eres solo un auditor registrando la verdad sobre ti mismo.

Día 2 de 90. Prueba los primeros 7 días gratis en el link de la bio.

#comunicacion #oratoria #lenguajecorporal #estoicismo #escuchaactiva #autocontrol #stoicom"""

print("📷 [Instagram] Publicando Reel Día 2...")

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
    print("1. Clic en Crear (+)...")
    create_btn = page.locator("svg[aria-label='New post'], svg[aria-label='Nuevo post']").first
    create_btn.click()
    time.sleep(2)

    # Subir archivo
    print(f"2. Subiendo video: {video_path}...")
    page.set_input_files("input[type='file']", video_path)
    time.sleep(4)

    ok_btn = page.query_selector("button:has-text('OK')")
    if ok_btn:
        ok_btn.click()
        time.sleep(1)

    # Next 1
    print("3. Clic en Siguiente (1)...")
    page.locator("div[role='button']:has-text('Next'), div[role='button']:has-text('Siguiente')").click()
    time.sleep(3)

    # Next 2
    print("4. Clic en Siguiente (2)...")
    page.locator("div[role='button']:has-text('Next'), div[role='button']:has-text('Siguiente')").click()
    time.sleep(3)

    # Escribir caption
    print("5. Escribiendo caption...")
    caption_box = page.locator("div[aria-label='Write a caption...'], div[contenteditable='true']").first
    caption_box.click()
    time.sleep(1)
    caption_box.fill(caption)
    time.sleep(1)
    
    # Hacer clic fuera del editor de texto para quitar foco
    header_title = page.locator("h1:has-text('New reel'), div:has-text('New reel')").first
    if header_title:
        header_title.click()
        time.sleep(1)

    # Clic en Share
    print("6. Clic en Compartir (Share)...")
    share_button = page.locator("div[role='button']:has-text('Share'), div[role='button']:has-text('Compartir')").last
    print("Texto del botón:", share_button.inner_text())
    share_button.click()
    
    print("7. Esperando procesamiento y confirmación de Instagram...")
    for i in range(15):
        time.sleep(4)
        print(f"   Subiendo video... ({(i+1)*4}s)")
        if page.query_selector("span:has-text('Your reel has been shared')") or page.query_selector("span:has-text('Se ha compartido tu reel')") or page.query_selector("img[alt='Animated checkmark']"):
            print("🎉 ¡CONFIRMACIÓN RECIBIDA: Reel Día 2 publicado exitosamente en Instagram!")
            break

    page.screenshot(path=os.path.join(HERE, "ig_dia_02_success.png"))
    context.storage_state(path=state_path)
    browser.close()
    print("✅ Instagram Reel Día 2 completado.")
