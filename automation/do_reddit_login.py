import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(HERE, ".browser_profile")
state_path = os.path.join(PROFILE_DIR, "reddit_state.json")

print("🔴 [Reddit] Iniciando sesión...")

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        viewport={"width": 1280, "height": 800}
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    page.goto("https://www.reddit.com/login", wait_until="domcontentloaded", timeout=15000)
    time.sleep(3)
    
    # Rellenar formulario
    print("1. Rellenando usuario/email...")
    user_input = page.locator("input[name='username']").first
    user_input.fill("ayuda@stoicom.app")
    time.sleep(1)
    
    print("2. Rellenando contraseña...")
    pass_input = page.locator("input[name='password']").first
    pass_input.fill(".Jd0521ms.")
    time.sleep(1)
    
    print("3. Enviando formulario (Enter)...")
    pass_input.press("Enter")
    time.sleep(8)
    
    print("URL tras submit:", page.url)
    screenshot_path = os.path.join(HERE, "reddit_after_login.png")
    page.screenshot(path=screenshot_path)
    print("Screenshot guardada:", screenshot_path)
    
    cookies = context.cookies()
    session_cookie = [c for c in cookies if 'reddit_session' in c['name'] or 'token' in c['name'].lower()]
    print("Cookies de sesión:", len(session_cookie))
    
    if session_cookie or "login" not in page.url:
        print("🎉 ¡LOGIN EXITOSO EN REDDIT!")
        context.storage_state(path=state_path)
    else:
        # Extraer mensajes de error si hay
        print("Buscando mensajes de error...")
        body = page.inner_text("body")
        for line in [l.strip() for l in body.splitlines() if l.strip()][:8]:
            print("  >", line)
            
    browser.close()
