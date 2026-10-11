import os
import time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(HERE, ".browser_profile", "reddit_state.json")

post_url = "https://www.reddit.com/r/AskRedditespanol/comments/1x2m9x6/porque_aqu%C3%AD_en_reddit_te_juzgan_de_lo_peor_si/"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
    context = browser.new_context(
        storage_state=state_path,
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        viewport={"width": 1280, "height": 850}
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    page.goto(post_url, wait_until="domcontentloaded")
    time.sleep(4)

    page.screenshot(path=os.path.join(HERE, "reddit_post_view.png"))

    # Check for comment composer elements
    comment_inputs = page.evaluate("""() => {
        const composer = document.querySelector('shreddit-comment-composer') || document.querySelector('comment-composer-host');
        const textboxes = Array.from(document.querySelectorAll('[role="textbox"], [contenteditable="true"], textarea, faceplate-textarea-tab, [placeholder*="Comentario"], [placeholder*="comentario"]'));
        const buttons = Array.from(document.querySelectorAll('button, [role="button"]')).map(b => b.innerText.trim()).filter(t => t.length > 0 && t.length < 30);
        return {
            hasComposer: !!composer,
            textboxesCount: textboxes.length,
            textboxes: textboxes.map(t => ({ tag: t.tagName, role: t.getAttribute('role'), slot: t.getAttribute('slot'), name: t.getAttribute('name'), placeholder: t.getAttribute('placeholder') })),
            sampleButtons: buttons.slice(0, 15)
        };
    }""")
    print("Comment elements found:", comment_inputs)

    browser.close()
