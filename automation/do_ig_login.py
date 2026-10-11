import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(HERE, ".browser_profile")
os.makedirs(PROFILE_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={'width': 1280, 'height': 800},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    )
    page = context.new_page()
    page.goto('https://www.instagram.com/', wait_until='domcontentloaded')
    time.sleep(3)
    
    print('Filling email...')
    page.fill('input[name="email"]', 'ayuda@stoicom.app')
    time.sleep(1)
    
    print('Filling password...')
    page.fill('input[name="pass"]', '.Jd0521ms.')
    time.sleep(1)
    
    print('Submitting via Enter key...')
    page.keyboard.press('Enter')
    time.sleep(10)
    
    print('Current URL after submit:', page.url)
    screenshot_path = os.path.join(HERE, 'ig_after_login.png')
    page.screenshot(path=screenshot_path)
    print('Screenshot saved:', screenshot_path)
    
    # Check cookies or URL
    cookies = context.cookies()
    session_cookie = [c for c in cookies if 'session' in c['name'].lower()]
    print('Session cookies found:', len(session_cookie))
    
    if session_cookie or 'login' not in page.url:
        print('SUCCESS: Logged in!')
        context.storage_state(path=os.path.join(PROFILE_DIR, "instagram_state.json"))
    else:
        print('Page title:', page.title())
        # Print visible text
        body_text = page.inner_text('body')
        for line in [l.strip() for l in body_text.splitlines() if l.strip()][:8]:
            print('  >', line)
            
    browser.close()
