"""
Test worker to log into Instagram headlessly and inspect the result.
"""

import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(HERE, ".browser_profile")
os.makedirs(PROFILE_DIR, exist_ok=True)

def test_instagram_login(username_or_email, password):
    print(f"🟣 [Instagram] Intentando login con {username_or_email}...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        page.goto("https://www.instagram.com/accounts/login/", timeout=30000)
        time.sleep(3)

        # Aceptar cookies si sale banner
        try:
            accept_btn = page.query_selector("button:has-text('Allow all cookies')") or page.query_selector("button:has-text('Permitir todas')") or page.query_selector("button:has-text('Permitir')") or page.query_selector("button:has-text('Aceptar')")
            if accept_btn:
                accept_btn.click()
                time.sleep(1)
        except Exception:
            pass

        # Rellenar formulario
        page.wait_for_selector('input[name="username"]', timeout=10000)
        page.fill('input[name="username"]', username_or_email)
        page.fill('input[name="password"]', password)
        page.click('button[type="submit"]')
        time.sleep(6)

        url = page.url
        print("URL tras submit:", url)
        page.screenshot(path=os.path.join(HERE, "ig_login_result.png"))

        # Chequear estados
        if "two_factor" in url or page.query_selector('input[name="verificationCode"]'):
            print("STATUS: NEEDS_2FA")
        elif "challenge" in url:
            print("STATUS: CHALLENGE (Instagram requiere código por email/SMS)")
        elif "accounts/login" not in url:
            print("STATUS: SUCCESS")
            context.storage_state(path=os.path.join(PROFILE_DIR, "instagram_state.json"))
        else:
            # Revisar si hay mensaje de error
            err = page.query_selector('#slfErrorAlert') or page.query_selector('div[role="alert"]')
            err_text = err.inner_text() if err else "Login fallido sin mensaje claro"
            print(f"STATUS: FAILED - {err_text}")

        browser.close()

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "ayuda@stoicom.app"
    pwd = sys.argv[2] if len(sys.argv) > 2 else ".Jd0521ms."
    test_instagram_login(email, pwd)
