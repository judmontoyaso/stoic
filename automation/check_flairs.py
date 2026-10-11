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

    page.goto("https://www.reddit.com/r/AskRedditespanol/submit", wait_until="domcontentloaded")
    time.sleep(3)

    tag_btn = page.locator("button:has-text('Añadir marcas y etiquetas')").first
    if tag_btn.count():
        print("Clicking tag button...")
        tag_btn.click()
        time.sleep(2)
        page.screenshot(path=os.path.join(HERE, "reddit_flairs.png"))
        
        flairs = page.locator("r-post-flairs-modal, [role='dialog']").all_inner_texts()
        print("Flairs modal texts:", flairs)

    browser.close()
