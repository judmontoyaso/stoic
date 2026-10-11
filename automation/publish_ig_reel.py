"""
Publica un Reel en Instagram usando la sesión guardada.
"""

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

print("🚀 Iniciando publicación de Reel en Instagram...")
print(f"🎬 Video: {video_path}")

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

    # 1. Clic en el botón Crear (+)
    print("1/5 Buscando botón Crear (+)...")
    create_btn = page.query_selector("svg[aria-label='New post']") or page.query_selector("svg[aria-label='Nuevo post']") or page.query_selector("svg[aria-label='Create']") or page.query_selector("svg[aria-label='Crear']")
    if create_btn:
        create_btn.click()
    else:
        # Intentar por texto o posición
        links = page.query_selector_all("a")
        for a in links:
            if "create" in a.inner_text().lower() or "crear" in a.inner_text().lower():
                a.click()
                break
    time.sleep(3)
    page.screenshot(path=os.path.join(HERE, "ig_modal_1.png"))

    # 2. Subir archivo
    print("2/5 Adjuntando archivo MP4...")
    file_input = page.query_selector("input[type='file']")
    if not file_input:
        print("Buscando input de archivo...")
        page.wait_for_selector("input[type='file']", timeout=10000)
        file_input = page.query_selector("input[type='file']")

    file_input.set_input_files(video_path)
    time.sleep(5)
    page.screenshot(path=os.path.join(HERE, "ig_modal_2.png"))

    # Clic en OK si sale modal informativo de Reels
    ok_btn = page.query_selector("button:has-text('OK')")
    if ok_btn:
        ok_btn.click()
        time.sleep(1)

    # 3. Avanzar (Next / Siguiente)
    print("3/5 Avanzando en el editor...")
    for step in range(2):
        next_btn = page.query_selector("div[role='button']:has-text('Next')") or page.query_selector("button:has-text('Next')") or page.query_selector("div[role='button']:has-text('Siguiente')") or page.query_selector("button:has-text('Siguiente')")
        if next_btn:
            print(f"   Clic en Siguiente (paso {step+1})...")
            next_btn.click()
            time.sleep(3)

    page.screenshot(path=os.path.join(HERE, "ig_modal_3.png"))

    # 4. Escribir pie de foto
    print("4/5 Escribiendo caption...")
    caption_box = page.query_selector("div[aria-label='Write a caption...']") or page.query_selector("div[aria-label='Escribe un pie de foto...']") or page.query_selector("div[contenteditable='true']")
    if caption_box:
        caption_box.click()
        time.sleep(1)
        caption_box.fill(caption)
        time.sleep(2)
        print("   Caption escrito correctamente.")
    else:
        print("   ⚠️ No se encontró la caja de caption por selector exacto.")

    page.screenshot(path=os.path.join(HERE, "ig_modal_4.png"))

    # 5. Compartir Reel
    print("5/5 Compartiendo Reel...")
    # Cerrar cualquier dropdown de hashtags presionando Escape
    page.keyboard.press("Escape")
    time.sleep(1)
    
    # Buscar el botón Share y hacer click con force=True
    share_btn = page.locator("div[role='button']:has-text('Share'), button:has-text('Share'), div[role='button']:has-text('Compartir'), button:has-text('Compartir')").first
    if share_btn:
        print("   Haciendo click forzado en Share...")
        share_btn.click(force=True)
        print("   Clic en Compartir realizado. Esperando procesamiento del video (25-30s)...")
        time.sleep(25)
        page.screenshot(path=os.path.join(HERE, "ig_modal_5_published.png"))
        print("🎉 ¡Reel publicado exitosamente en Instagram!")
    else:
        print("   ⚠️ No se encontró el botón Compartir.")

    context.storage_state(path=state_path)
    browser.close()
