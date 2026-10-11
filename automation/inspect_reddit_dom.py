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
    page.goto("https://www.reddit.com/r/conversaciones/submit", wait_until="networkidle")
    time.sleep(3)

    # Let's inspect composer container
    info = page.evaluate("""() => {
        const composer = document.querySelector('shreddit-composer') || document.querySelector('form') || document.querySelector('main');
        if (!composer) return 'No composer found';
        
        // Find all elements that look like editors or text areas
        const all = Array.from(document.querySelectorAll('*'));
        const editorLike = all.filter(el => {
            const tag = el.tagName.toLowerCase();
            const role = el.getAttribute('role');
            const ce = el.getAttribute('contenteditable');
            const name = el.getAttribute('name');
            return tag === 'textarea' || role === 'textbox' || ce === 'true' || name === 'body';
        }).map(el => ({
            tag: el.tagName,
            id: el.id,
            name: el.getAttribute('name'),
            role: el.getAttribute('role'),
            ce: el.getAttribute('contenteditable'),
            placeholder: el.getAttribute('placeholder'),
            slot: el.getAttribute('slot'),
            className: el.className,
            rect: el.getBoundingClientRect(),
            parentTag: el.parentElement ? el.parentElement.tagName : null
        }));
        
        // Also find all buttons
        const buttons = Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({
            text: b.innerText.trim(),
            rect: b.getBoundingClientRect(),
            tag: b.tagName,
            type: b.getAttribute('type'),
            disabled: b.disabled || b.getAttribute('aria-disabled')
        })).filter(b => b.text.length > 0 && b.text.length < 50);

        return { editorLike, buttons };
    }""")
    
    print("URL:", page.url)
    print("Info result:", info)
    page.screenshot(path=os.path.join(HERE, "inspect_reddit.png"))

    browser.close()
