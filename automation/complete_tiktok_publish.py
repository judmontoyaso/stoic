import os
import sys
import time
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

print("⚫ [TikTok] Publicando video Día 1 con selectores de precisión...")

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    context = browser.new_context(
        storage_state=state_path,
        viewport={'width': 1280, 'height': 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    upload_url = "https://www.tiktok.com/creator-center/upload"
    print(f"1. Cargando {upload_url}...")
    page.goto(upload_url, wait_until="domcontentloaded", timeout=30000)

    try:
        page.wait_for_selector("input[type='file']", timeout=25000)
    except Exception:
        time.sleep(5)

    file_input = page.locator("input[type='file']").first
    if not file_input.count():
        for f in page.frames:
            fi = f.locator("input[type='file']").first
            if fi.count():
                file_input = fi
                break

    if file_input.count():
        print(f"2. Adjuntando video: {video_path}")
        file_input.set_input_files(video_path)
        print("   Esperando subida y renderizado (18s)...")
        time.sleep(18)

        # 3. Descartar modal de copyright si aparece
        page.keyboard.press("Escape")
        time.sleep(1)
        dialog = page.locator("div[role='dialog'], .TUXModal")
        if dialog.count():
            cancel_btn = dialog.locator("button:has-text('Cancel'), button:has-text('Turn on')").first
            if cancel_btn.count():
                cancel_btn.click(force=True)
                time.sleep(2)

        # 4. Rellenar Caption
        print("3. Rellenando texto del caption...")
        editor = page.locator(".public-DraftEditor-content, div[contenteditable='true']").first
        if editor.count():
            editor.click(force=True)
            time.sleep(1)
            page.keyboard.press("Control+A")
            page.keyboard.press("Backspace")
            time.sleep(0.5)
            page.keyboard.insert_text(caption_text)
            time.sleep(2)
            print("   Texto del caption ingresado con éxito!")

        # 5. Buscar botones en la página
        print("4. Buscando el botón Post exacto...")
        # Desplazar hacia abajo para asegurar visibilidad
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)

        page.screenshot(path=os.path.join(HERE, "tiktok_ready_clean.png"))

        # El botón de publicar en TikTok Creator Center
        post_btn = page.get_by_role("button", name="Post", exact=True)
        if not post_btn.count():
            post_btn = page.locator("button:has-text('Post')").filter(has_not_text="schedule").last

        if post_btn.count():
            print(f"   Haciendo clic en el botón de publicación: '{post_btn.inner_text().strip()}'")
            post_btn.click(force=True)
            print("   Esperando procesamiento final (30s)...")
            time.sleep(30)
            page.screenshot(path=os.path.join(HERE, "tiktok_live_success.png"))
            print("🎉 ¡VIDEO DEL DÍA 1 PUBLICADO EXITOSAMENTE EN TIKTOK!")
            context.storage_state(path=state_path)
        else:
            print("⚠️ No se encontró el botón Post exacto.")

    browser.close()
