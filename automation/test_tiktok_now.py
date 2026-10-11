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

print("⚫ [TikTok] Probando login con modo stealth y contraseña actualizada...")

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    context = browser.new_context(
        viewport={'width': 1280, 'height': 800},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    page.goto('https://www.tiktok.com/login/phone-or-email/email', wait_until='domcontentloaded')
    time.sleep(4)

    user_input = page.locator("input[name='username']").first
    pass_input = page.locator("input[type='password']").first

    if user_input.count() and pass_input.count():
        print("1. Rellenando usuario/email...")
        user_input.fill("ayuda@stoicom.app")
        time.sleep(1)
        
        print("2. Rellenando contraseña...")
        pass_input.fill(".Jd0521ms.")
        time.sleep(1)
        
        print("3. Enviando formulario...")
        btn = page.locator("button[type='submit']").first
        if btn.count():
            btn.click()
        else:
            pass_input.press("Enter")
            
        print("4. Esperando respuesta de TikTok (10s)...")
        time.sleep(10)
        
        print("URL tras submit:", page.url)
        screenshot_path = os.path.join(HERE, "tiktok_attempt_fresh.png")
        page.screenshot(path=screenshot_path)
        print(f"Screenshot guardado: {screenshot_path}")

        cookies = context.cookies()
        session_cookie = [c for c in cookies if 'session' in c['name'].lower()]
        print("Cookies de sesión encontradas:", len(session_cookie))

        # Check for captcha or errors
        body_text = page.inner_text("body")
        lines = [l.strip() for l in body_text.splitlines() if l.strip()]
        for l in lines[:15]:
            print("  >", l)

        if session_cookie or "login" not in page.url:
            print("🎉 ¡LOGIN EXITOSO EN TIKTOK!")
            context.storage_state(path=state_path)
        else:
            print("Aún en pantalla de login. Verificando captcha o alertas...")

    else:
        print("⚠️ No se encontraron inputs en la página.")
        page.screenshot(path=os.path.join(HERE, "tiktok_attempt_fresh.png"))

    browser.close()
