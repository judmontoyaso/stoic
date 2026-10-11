import os
import time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(HERE, ".browser_profile", "reddit_state.json")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
    context = browser.new_context(storage_state=state_path, user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
    page = context.new_page()
    page.goto("https://www.reddit.com/r/AskRedditespanol/new/", wait_until="domcontentloaded")
    time.sleep(3)
    
    posts = page.evaluate("""() => {
        const els = Array.from(document.querySelectorAll('shreddit-post'));
        return els.map(e => ({
            title: e.getAttribute('post-title'),
            link: e.getAttribute('permalink')
        }));
    }""")
    for p_info in posts[:8]:
        print(f"https://www.reddit.com{p_info['link']} | {p_info['title']}")
        
    browser.close()
