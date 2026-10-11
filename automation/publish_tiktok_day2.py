import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(HERE, ".browser_profile")
state_path = os.path.join(PROFILE_DIR, "tiktok_state.json")

DAY = 2
day_dir = os.path.join(HERE, "output", "lote_10_videos", f"dia_{DAY:02d}")
video_path = os.path.abspath(os.path.join(day_dir, f"stoicom_dia_{DAY:02d}.mp4"))
caption_path = os.path.abspath(os.path.join(day_dir, "caption.txt"))

if not os.path.exists(video_path):
    print(f"❌ Error: No existe el video en {video_path}")
    sys.exit(1)

with open(caption_path, "r", encoding="utf-8") as f:
    caption_text = f.read().strip()

# Agregar llamado a la acción claro al final
if "stoicom.app" not in caption_text:
    caption_text += "\n\n🏛 Día 2 de 90. Prueba 7 días gratis en stoicom.app"

print(f"⚫ [TikTok] Iniciando publicación de DÍA {DAY}...")
print(f"📁 Video: {video_path}")
print(f"📝 Caption:\n{caption_text}\n")

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
    page.goto(upload_url, wait_until="domcontentloaded", timeout=40000)

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

    if not file_input.count():
        print("❌ No se encontró el selector input[type='file']")
        page.screenshot(path=os.path.join(HERE, f"tiktok_dia_{DAY}_error.png"))
        browser.close()
        sys.exit(1)

    print(f"2. Subiendo archivo de video...")
    file_input.set_input_files(video_path)
    print("   Esperando subida y pre-procesamiento de TikTok (20s)...")
    time.sleep(20)

    # Descartar modales emergentes si existen
    page.keyboard.press("Escape")
    time.sleep(1)
    dialog = page.locator("div[role='dialog'], .TUXModal")
    if dialog.count():
        cancel_btn = dialog.locator("button:has-text('Cancel'), button:has-text('Turn on')").first
        if cancel_btn.count():
            cancel_btn.click(force=True)
            time.sleep(2)

    # Rellenar descripción
    print("3. Ingresando caption...")
    editor = page.locator(".public-DraftEditor-content, div[contenteditable='true']").first
    if editor.count():
        editor.click(force=True)
        time.sleep(1)
        page.keyboard.press("Control+A")
        page.keyboard.press("Backspace")
        time.sleep(0.5)
        page.keyboard.insert_text(caption_text)
        time.sleep(2)
        print("   ✅ Caption ingresado con éxito.")

    # Scroll hacia abajo
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(2)

    # Click en Post
    print("4. Confirmando publicación...")
    post_btn = page.get_by_role("button", name="Post", exact=True)
    if not post_btn.count():
        post_btn = page.locator("button:has-text('Post')").filter(has_not_text="schedule").last

    if post_btn.count():
        print(f"   Haciendo clic en botón Post...")
        post_btn.click(force=True)
        print("   Esperando confirmación de subida (35s)...")
        time.sleep(35)
        success_img = os.path.join(HERE, f"tiktok_dia_{DAY}_success.png")
        page.screenshot(path=success_img)
        print(f"🎉 ¡VIDEO DEL DÍA {DAY} PUBLICADO CON ÉXITO EN TIKTOK!")
        context.storage_state(path=state_path)
    else:
        print("⚠️ No se encontró el botón Post")
        page.screenshot(path=os.path.join(HERE, f"tiktok_dia_{DAY}_nopost.png"))

    browser.close()
    print("🏁 Fin del proceso.")
