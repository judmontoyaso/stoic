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

    # 1. Fill title
    print("Filling title...")
    title_box = page.locator("textarea[name='title']").first
    title_box.fill("Test Title")
    time.sleep(1)

    # 2. Try focusing body via keyboard Tab
    print("Pressing Tab to see focused element...")
    page.keyboard.press("Tab")
    time.sleep(0.5)
    active = page.evaluate("() => ({ tag: document.activeElement.tagName, role: document.activeElement.getAttribute('role'), ce: document.activeElement.getAttribute('contenteditable') })")
    print("Active element after Tab:", active)

    # Try clicking with force=True on div[contenteditable='true']
    print("Trying force click on contenteditable...")
    ed = page.locator("div[role='textbox'][contenteditable='true']").first
    ed.click(force=True)
    time.sleep(0.5)
    active2 = page.evaluate("() => ({ tag: document.activeElement.tagName, role: document.activeElement.getAttribute('role'), ce: document.activeElement.getAttribute('contenteditable'), className: document.activeElement.className })")
    print("Active element after force click:", active2)

    # Type something to test
    page.keyboard.insert_text("This is test body content.")
    time.sleep(1)

    page.screenshot(path=os.path.join(HERE, "test_body_result.png"))
    print("Screenshot saved to test_body_result.png")

    browser.close()
