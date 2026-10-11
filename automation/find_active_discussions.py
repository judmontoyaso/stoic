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

    page.goto("https://www.reddit.com/r/AskRedditespanol/new/", wait_until="domcontentloaded")
    time.sleep(3)

    posts = page.evaluate("""() => {
        const anchors = Array.from(document.querySelectorAll('a[href*="/comments/"]'));
        return anchors.map(a => ({
            title: a.innerText.trim(),
            href: a.href
        })).filter(a => a.title.length > 10 && !a.title.includes('Guess') && !a.href.includes('comment'));
    }""")
    print("Recent posts in r/conversaciones:")
    for p_info in posts[:5]:
        print(f"  > {p_info['title']} -> {p_info['href']}")

    browser.close()
