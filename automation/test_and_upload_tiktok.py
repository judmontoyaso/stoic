import os
import sys
import time
import json
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(HERE, ".browser_profile")
state_path = os.path.join(PROFILE_DIR, "tiktok_state.json")

video_path = os.path.abspath(os.path.join(HERE, "output", "lote_10_videos", "dia_01", "stoicom_dia_01.mp4"))
caption_path = os.path.abspath(os.path.join(HERE, "output", "lote_10_videos", "dia_01", "caption.txt"))

with open(caption_path, "r", encoding="utf-8") as f:
    caption_text = f.read().strip()

print("⚫ [TikTok] Iniciando publicación de Día 1 con sesión activa...")

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    context = browser.new_context(
        storage_state=state_path,
        viewport={'width': 1280, 'height': 850},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    # 1. Navegar directamente al cargador
    upload_url = "https://www.tiktok.com/creator-center/upload"
    print(f"1. Navegando a {upload_url}...")
    page.goto(upload_url, wait_until="domcontentloaded", timeout=30000)

    # 2. Esperar que cargue el input de archivo
    print("2. Esperando que cargue el cargador de archivos (hasta 25s)...")
    try:
        page.wait_for_selector("input[type='file']", timeout=25000)
    except Exception:
        print("   Esperando 5s adicionales...")
        time.sleep(5)

    page.screenshot(path=os.path.join(HERE, "tiktok_upload_portal.png"))

    file_input = page.locator("input[type='file']").first
    if not file_input.count():
        for f in page.frames:
            fi = f.locator("input[type='file']").first
            if fi.count():
                file_input = fi
                break

    if file_input.count():
        print(f"3. Adjuntando video: {video_path}")
        file_input.set_input_files(video_path)
        print("   Esperando procesamiento de video (15s)...")
        time.sleep(15)
        page.screenshot(path=os.path.join(HERE, "tiktok_video_attached.png"))

        # 4. Manejar modal de copyright si aparece
        print("4. Verificando modales emergentes...")
        page.keyboard.press("Escape")
        time.sleep(1)

        dialog = page.locator("div[role='dialog'], .TUXModal")
        if dialog.count():
            btn = dialog.locator("button:has-text('Turn on'), button:has-text('Cancel')").first
            if btn.count():
                print(f"   Haciendo clic en botón del diálogo: {btn.inner_text()}")
                btn.click(force=True)
                time.sleep(2)

        # 5. Escribir descripción (caption)
        print("5. Escribiendo descripción...")
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1)

        editor = page.locator("div[contenteditable='true'], div[role='combobox']").first
        if editor.count():
            editor.click(force=True)
            time.sleep(1)
            page.keyboard.press("Control+A")
            page.keyboard.insert_text(caption_text)
            time.sleep(2)
            print("   Descripción agregada!")

        page.screenshot(path=os.path.join(HERE, "tiktok_ready_to_publish.png"))

        # 6. Hacer scroll al fondo y hacer clic en Post
        print("6. Buscando y pulsando botón Post...")
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)

        post_btn = page.locator("button:has-text('Post'), button:has-text('Publicar')").first
        if post_btn.count():
            print(f"   Haciendo clic en: '{post_btn.inner_text()}'...")
            post_btn.click(force=True)
            print("   Esperando subida final (25s)...")
            time.sleep(25)
            
            page.screenshot(path=os.path.join(HERE, "tiktok_final_published.png"))
            print("🎉 ¡VIDEO DEL DÍA 1 PUBLICADO EXITOSAMENTE EN TIKTOK!")
            context.storage_state(path=state_path)
        else:
            print("⚠️ No se encontró el botón Post al final de la página.")

    else:
        print("⚠️ No se encontró el input de archivo.")

    browser.close()
