import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))

print("🔴 [Reddit] Probando carga de login con modo stealth...")

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
    time.sleep(4)
    
    screenshot_path = os.path.join(HERE, "reddit_stealth.png")
    page.screenshot(path=screenshot_path)
    print(f"Screenshot guardada: {screenshot_path}")
    print(f"URL actual: {page.url}")
    
    # Comprobar si hay formulario de login
    inputs = page.query_selector_all("input")
    print(f"Inputs encontrados: {len(inputs)}")
    for inp in inputs:
        print(f"  > input name='{inp.get_attribute('name')}' id='{inp.get_attribute('id')}' type='{inp.get_attribute('type')}'")
        
    browser.close()
