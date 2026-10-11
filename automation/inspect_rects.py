import os
import time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(HERE, ".browser_profile", "reddit_state.json")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
    context = browser.new_context(
        storage_state=state_path,
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        viewport={"width": 1280, "height": 850}
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    page.goto("https://www.reddit.com/r/conversaciones/submit", wait_until="domcontentloaded")
    time.sleep(4)

    # Inspect all candidate elements in JS
    elements = page.evaluate("""() => {
        const els = Array.from(document.querySelectorAll('div[role="textbox"], [contenteditable="true"], textarea, div[slot="editor"]'));
        return els.map((el, i) => {
            const r = el.getBoundingClientRect();
            const cs = window.getComputedStyle(el);
            return {
                index: i,
                tag: el.tagName,
                name: el.getAttribute('name'),
                role: el.getAttribute('role'),
                ce: el.getAttribute('contenteditable'),
                slot: el.getAttribute('slot'),
                class: el.className,
                rect: { x: r.x, y: r.y, w: r.width, h: r.height },
                display: cs.display,
                visibility: cs.visibility,
                opacity: cs.opacity
            };
        });
    }""")
    for el in elements:
        print(el)

    browser.close()
