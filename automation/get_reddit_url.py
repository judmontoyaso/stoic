import os
import time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(HERE, ".browser_profile", "reddit_state.json")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
    context = browser.new_context(
        storage_state=state_path,
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    page.goto("https://www.reddit.com/user/stoicomunication/submitted/", wait_until="domcontentloaded")
    time.sleep(3)
    
    posts = page.evaluate("""() => {
        const anchors = Array.from(document.querySelectorAll('a[href*="/comments/"]'));
        return anchors.map(a => ({
            title: a.innerText.trim(),
            href: a.href
        })).filter(a => a.href.includes('/comments/'));
    }""")
    print("Post links found:")
    for p_info in posts:
        print(f"  > Title: {p_info['title']} | URL: {p_info['href']}")
        
    page.screenshot(path=os.path.join(HERE, "reddit_user_submitted.png"))
    browser.close()
