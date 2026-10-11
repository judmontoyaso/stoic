import os
import sys
import time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(HERE, ".browser_profile", "reddit_state.json")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
    context = browser.new_context(storage_state=state_path, viewport={"width": 1280, "height": 850})
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    page.goto("https://www.reddit.com/r/conversaciones/submit", wait_until="domcontentloaded")
    time.sleep(3)

    visible = page.locator("div[contenteditable='true']:visible").all()
    print(f"Total div[contenteditable='true']:visible = {len(visible)}")
    for i, el in enumerate(visible):
        print(f"[{i}] class={el.get_attribute('class')} role={el.get_attribute('role')}")

    # Chequear también elementos con texto "Cuerpo"
    body_containers = page.locator("text='Cuerpo de texto'").all()
    print(f"Total text='Cuerpo de texto' = {len(body_containers)}")
    for i, el in enumerate(body_containers):
        print(f"[{i}] tag={el.evaluate('e => e.tagName')} class={el.get_attribute('class')}")

    browser.close()
