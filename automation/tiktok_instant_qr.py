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

print("⚡ [TikTok] Generando código QR fresco e inmediato...")

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
    time.sleep(2.5)

    qr_btn = page.locator("text='Use QR code'").first
    if qr_btn.count():
        qr_btn.click()
        time.sleep(3.5)

    # Esperar que el canvas del QR esté completamente dibujado
    try:
        page.wait_for_selector("canvas", timeout=5000)
        time.sleep(1)
    except Exception:
        pass

    # Capturar de inmediato el QR fresco
    page.screenshot(path=qr_dest)
    print(f"🔥 QR FRESCO GUARDADO: {qr_dest}")

    # Escuchar durante 180 segundos con verificación rápida cada 1 segundo
    authenticated = False
    start_time = time.time()
    last_refresh = time.time()

    while time.time() - start_time < 180:
        cookies = context.cookies()
        session_cookie = [c for c in cookies if 'session' in c['name'].lower()]
        
        if session_cookie or ("/login" not in page.url and "tiktok.com" in page.url):
            print("🎉 ¡SESIÓN CONFIRMADA EXITOSAMENTE EN TIKTOK!")
            authenticated = True
            context.storage_state(path=state_path)
            break

        # Si pasaron más de 45 segundos, chequear si hay botón de refrescar QR
        if time.time() - last_refresh > 45:
            refresh_btn = page.locator("text='Refresh', text='Actualizar', text='Recargar', div:has-text('QR code expired')").first
            if refresh_btn.count():
                print("🔄 Refrescando código QR expirado...")
                refresh_btn.click()
                time.sleep(1.5)
                page.screenshot(path=qr_dest)
                print(f"🔥 QR ACTUALIZADO: {qr_dest}")
                last_refresh = time.time()

        time.sleep(1)

    if authenticated:
        print("🚀 Subiendo Día 1 a TikTok Creator Center...")
        page.goto("https://www.tiktok.com/creator-center/upload", wait_until="domcontentloaded")
        time.sleep(6)
        
        file_input = page.locator("input[type='file']").first
        if file_input.count():
            print(f"📁 Cargando video: {video_path}")
            file_input.set_input_files(video_path)
            time.sleep(10)
            
            editor = page.locator("div[contenteditable='true'], div[role='combobox']").first
            if editor.count():
                editor.click()
                page.keyboard.insert_text(caption_text)
                time.sleep(3)
                
            post_btn = page.locator("button:has-text('Publicar'), button:has-text('Post')").first
            if post_btn.count():
                post_btn.click()
                print("Esperando subida final (20s)...")
                time.sleep(20)
                page.screenshot(path=os.path.join(HERE, "tiktok_published_live.png"))
                print("🎉 ¡VIDEO DEL DÍA 1 PUBLICADO EN TIKTOK!")
        context.storage_state(path=state_path)
    else:
        print("⏰ Tiempo de espera agotado.")

    browser.close()
