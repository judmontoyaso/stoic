import os
import time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(HERE, ".browser_profile", "reddit_state.json")

test_subs = ["r/AskRedditespanol", "r/preguntaleareddit", "r/desarrollopersonal"]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
    context = browser.new_context(
        storage_state=state_path,
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        viewport={"width": 1280, "height": 850}
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    for sub in test_subs:
        url = f"https://www.reddit.com/{sub}/submit"
        print(f"Probando {url}...")
        page.goto(url, wait_until="domcontentloaded")
        time.sleep(3)
        # Check if private modal or blocked
        private_modal = page.locator("text='Esta es una comunidad privada'").count()
        submit_btn = page.locator("button:has-text('Publicar'), button:has-text('Post')").count()
        print(f"  > Sub: {sub} | Es privada: {private_modal > 0} | Tiene botón publicar: {submit_btn > 0}")

    browser.close()
