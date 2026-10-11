import os
import time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
    context = browser.new_context(
        viewport={'width': 1280, 'height': 800},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    page.goto('https://www.tiktok.com/login/phone-or-email/email', wait_until='domcontentloaded')
    time.sleep(3)

    links = page.locator("a, button, [role='button']").all_inner_texts()
    print("Available links/buttons on email login page:")
    for l in links:
        l_s = l.strip()
        if l_s and len(l_s) < 50:
            print("  >", l_s)

    browser.close()
