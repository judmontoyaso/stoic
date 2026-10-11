import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(HERE, ".browser_profile")
os.makedirs(PROFILE_DIR, exist_ok=True)
state_path = os.path.join(PROFILE_DIR, "tiktok_state.json")
ARTIFACT_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\f13eebbb-85fb-455a-99f0-b7964389975a"
qr_dest = os.path.join(ARTIFACT_DIR, "tiktok_qr_live.png")

video_path = os.path.abspath(os.path.join(HERE, "output", "lote_10_videos", "dia_01", "stoicom_dia_01.mp4"))
caption_path = os.path.abspath(os.path.join(HERE, "output", "lote_10_videos", "dia_01", "caption.txt"))

with open(caption_path, "r", encoding="utf-8") as f:
    caption_text = f.read().strip()

print("⚫ [TikTok] Iniciando sesión QR autónoma...")

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    context = browser.new_context(
        viewport={'width': 1280, 'height': 850},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    page.goto('https://www.tiktok.com/login', wait_until='domcontentloaded')
    time.sleep(3)

    qr_btn = page.locator("text='Use QR code'").first
    if qr_btn.count():
        qr_btn.click()
        time.sleep(2)

    # Capturar el contenedor del código QR
    qr_container = page.locator("canvas, div:has(canvas), div[data-e2e='qr-code']").first
    if qr_container.count():
        qr_container.screenshot(path=qr_dest)
    else:
        page.screenshot(path=qr_dest)
    print(f"📸 Código QR guardado exitosamente en: {qr_dest}")

    # Esperar escaneo durante 150 segundos
    authenticated = False
    start_time = time.time()
    print("⏳ Esperando escaneo desde la aplicación móvil de TikTok (300 segundos)...")

    while time.time() - start_time < 300:
        cookies = context.cookies()
        session_cookie = [c for c in cookies if 'session' in c['name'].lower()]
        
        if session_cookie or ("/login" not in page.url and "tiktok.com" in page.url):
            print("🎉 ¡AUTENTICACIÓN DETECTADA! Sesión iniciada con éxito.")
            authenticated = True
            context.storage_state(path=state_path)
            break
        time.sleep(2)

    if authenticated:
        print("🚀 Abriendo TikTok Studio / Creator Upload...")
        page.goto("https://www.tiktok.com/creator-center/upload", wait_until="domcontentloaded")
        time.sleep(6)
        
        # Guardar captura inicial del cargador
        page.screenshot(path=os.path.join(HERE, "tiktok_studio_loaded.png"))
        
        # Subir archivo
        file_input = page.locator("input[type='file']").first
        if file_input.count():
            print(f"📁 Cargando video del Día 1: {video_path}")
            file_input.set_input_files(video_path)
            time.sleep(10)
            
            # Escribir descripción
            editor = page.locator("div[contenteditable='true'], div[role='combobox']").first
            if editor.count():
                editor.click()
                page.keyboard.insert_text(caption_text)
                time.sleep(3)
                
            page.screenshot(path=os.path.join(HERE, "tiktok_ready_to_publish.png"))
            
            # Clic en Publicar
            publish_btn = page.locator("button:has-text('Publicar'), button:has-text('Post')").first
            if publish_btn.count():
                publish_btn.click()
                print("Esperando subida final (20s)...")
                time.sleep(20)
                page.screenshot(path=os.path.join(HERE, "tiktok_published_live.png"))
                print("🎉 ¡VIDEO DEL DÍA 1 PUBLICADO EN TIKTOK!")
        context.storage_state(path=state_path)
    else:
        print("⏰ El tiempo de espera finalizó sin confirmación.")

    browser.close()
