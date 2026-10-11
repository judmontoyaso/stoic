import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(HERE, ".browser_profile", "reddit_state.json")

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    context = browser.new_context(
        storage_state=state_path,
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        viewport={"width": 1280, "height": 850}
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    print("Navegando a r/conversaciones/submit...")
    page.goto("https://www.reddit.com/r/conversaciones/submit", wait_until="domcontentloaded", timeout=20000)
    time.sleep(4)

    print("URL actual:", page.url)

    textareas = page.query_selector_all("textarea")
    print(f"Textareas encontrados: {len(textareas)}")
    for i, t in enumerate(textareas):
        print(f"  [{i}] name='{t.get_attribute('name')}' placeholder='{t.get_attribute('placeholder')}' role='{t.get_attribute('role')}'")

    editable = page.query_selector_all("[contenteditable='true']")
    print(f"Contenteditables encontrados: {len(editable)}")
    for i, e in enumerate(editable):
        print(f"  [{i}] tag={e.evaluate('el => el.tagName')} role='{e.get_attribute('role')}' class='{e.get_attribute('class')[:40] if e.get_attribute('class') else ''}'")

    buttons = page.query_selector_all("button")
    print("Botones relevantes:")
    for b in buttons:
        txt = b.inner_text().strip()
        if any(w in txt.lower() for w in ["publicar", "solicitud", "post", "borrador"]):
            print(f"  > Boton: '{txt}'")

    browser.close()
