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

    page.goto('https://www.tiktok.com/login', wait_until='domcontentloaded')
    time.sleep(3)

    qr_btn = page.locator("text='Use QR code'").first
    if qr_btn.count():
        qr_btn.click()
        time.sleep(3)
        page.screenshot(path=os.path.join(HERE, "tiktok_qr_screen.png"))
        print("QR Code screen captured!")

    browser.close()
