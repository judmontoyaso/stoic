import os
import sys
import time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(HERE, ".browser_profile", "instagram_state.json")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        storage_state=state_path,
        viewport={'width': 1280, 'height': 800},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    )
    page = context.new_page()
    page.goto('https://www.instagram.com/', wait_until='networkidle')
    time.sleep(3)
    
    # Save info / Not now modal
    for b in page.query_selector_all('button'):
        txt = b.inner_text().strip()
        if txt in ['Save info', 'Save', 'Guardar información', 'Guardar']:
            print('Clicking Save info...')
            b.click()
            time.sleep(2)
            break
            
    page.screenshot(path=os.path.join(HERE, 'ig_feed.png'))
    print('IG Feed Screenshot saved!')
    print('Current URL:', page.url)
    context.storage_state(path=state_path)
    browser.close()
