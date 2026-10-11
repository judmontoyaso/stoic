import os
import time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ARTIFACT_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\f13eebbb-85fb-455a-99f0-b7964389975a"
qr_dest = os.path.join(ARTIFACT_DIR, "tiktok_qr_code.png")

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

    page.locator("text='Use QR code'").first.click()
    time.sleep(3)

    # Find the QR code canvas or container
    qr_el = page.locator("canvas, div[data-e2e='qr-code'], img[alt*='qr'], div:has(canvas)").first
    if qr_el.count():
        qr_el.screenshot(path=qr_dest)
        print(f"QR element screenshot saved to {qr_dest}")
    else:
        page.screenshot(path=qr_dest)
        print(f"Full page screenshot saved to {qr_dest}")

    browser.close()
