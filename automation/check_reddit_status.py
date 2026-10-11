import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
state_path = os.path.join(HERE, ".browser_profile", "reddit_state.json")

print("🔍 [Reddit] Diagnosticando estado de la cuenta stoicomunication...")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])

    # 1. Chequeo anónimo (Incógnito) para detectar shadowban
    incognito = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
    page_inc = incognito.new_page()
    page_inc.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    print("1. Comprobando perfil público (incógnito)...")
    res = page_inc.goto("https://www.reddit.com/user/stoicomunication/", wait_until="domcontentloaded")
    time.sleep(3)
    page_inc.screenshot(path=os.path.join(HERE, "reddit_incognito_check.png"))
    
    body_text_inc = page_inc.inner_text("body")
    is_shadowbanned = "nobody on reddit goes by that name" in body_text_inc.lower() or "page not found" in body_text_inc.lower() or res.status == 404
    print(f"   Status HTTP: {res.status} | ¿Shadowbanned?: {is_shadowbanned}")

    # 2. Chequeo con sesión activa
    auth_ctx = browser.new_context(storage_state=state_path, user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
    page_auth = auth_ctx.new_page()
    page_auth.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    print("2. Comprobando perfil con sesión activa...")
    page_auth.goto("https://www.reddit.com/user/stoicomunication/", wait_until="domcontentloaded")
    time.sleep(3)
    page_auth.screenshot(path=os.path.join(HERE, "reddit_auth_check.png"))

    # Revisar mensajes del sistema o notificaciones de Reddit
    print("3. Comprobando notificaciones y mensajes de moderación...")
    page_auth.goto("https://www.reddit.com/message/messages/", wait_until="domcontentloaded")
    time.sleep(3)
    page_auth.screenshot(path=os.path.join(HERE, "reddit_messages_check.png"))
    
    messages = page_auth.locator(".message, [data-testid='message-item'], shreddit-message").all_inner_texts()
    print("   Mensajes recibidos:", len(messages))
    for m in messages[:5]:
        print("   >", m.replace("\n", " ")[:120])

    browser.close()
