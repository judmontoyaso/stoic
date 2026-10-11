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
    page.goto('https://www.tiktok.com/login/phone-or-email/email', wait_until='networkidle')
    time.sleep(3)
    
    print('Filling TikTok username...')
    page.fill('input[name="username"]', 'ayuda@stoicom.app')
    time.sleep(1)
    
    print('Filling TikTok password...')
    page.fill('input[type="password"]', '.Jd0521ms.')
    time.sleep(1)
    
    print('Submitting login...')
    btn = page.query_selector("button[type='submit']")
    if btn:
        btn.click()
    else:
        page.keyboard.press('Enter')
    time.sleep(8)
    
    print('Current URL:', page.url)
    screenshot_path = os.path.join(HERE, 'tiktok_after_login.png')
    page.screenshot(path=screenshot_path)
    print('Screenshot saved:', screenshot_path)
    
    cookies = context.cookies()
    session_cookie = [c for c in cookies if 'session' in c['name'].lower()]
    print('Session cookies found:', len(session_cookie))
    
    if session_cookie or 'login' not in page.url:
        print('SUCCESS: Logged into TikTok!')
        context.storage_state(path=os.path.join(PROFILE_DIR, "tiktok_state.json"))
    else:
        print('Checking page for captcha or error...')
        body = page.inner_text('body')
        for l in [line.strip() for line in body.splitlines() if line.strip()][:8]:
            print('  >', l)
            
    browser.close()
