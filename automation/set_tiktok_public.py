import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(HERE, ".browser_profile")
state_path = os.path.join(PROFILE_DIR, "tiktok_state.json")

print("⚫ [TikTok] Configurando privacidad del video a Público (Everyone)...")

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

    manage_url = "https://www.tiktok.com/creator-center/content"
    page.goto(manage_url, wait_until="domcontentloaded", timeout=25000)
    time.sleep(5)

    # Click en el selector de privacidad
    privacy_dropdown = page.locator("text='Only me', text='Solo yo'").first
    if privacy_dropdown.count():
        print(f"Haciendo clic en dropdown de privacidad: {privacy_dropdown.inner_text()}...")
        privacy_dropdown.click()
        time.sleep(1.5)
        
        # Seleccionar Everyone / Todos / Public
        everyone_opt = page.locator("text='Everyone', text='Todos', text='Público'").first
        if everyone_opt.count():
            print(f"Seleccionando: {everyone_opt.inner_text()}...")
            everyone_opt.click()
            time.sleep(2)
            
            # Confirmar modal si aparece
            confirm_btn = page.locator("button:has-text('Confirm'), button:has-text('Update'), button:has-text('Confirmar')").first
            if confirm_btn.count():
                confirm_btn.click()
                time.sleep(2)
                
            print("✅ ¡Privacidad cambiada a Público (Everyone)!")
        else:
            print("No se encontró la opción Everyone.")
    else:
        print("El video ya está público o no se encontró el botón Only me.")

    page.screenshot(path=os.path.join(HERE, "tiktok_public_confirmed.png"))
    context.storage_state(path=state_path)
    browser.close()
