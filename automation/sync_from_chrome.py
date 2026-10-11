import os
import sys
import json
import base64
import shutil
import sqlite3
import win32crypt
from Crypto.Cipher import AES
from playwright.sync_api import sync_playwright
import time

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(HERE, ".browser_profile")
os.makedirs(PROFILE_DIR, exist_ok=True)
state_path = os.path.join(PROFILE_DIR, "tiktok_state.json")

chrome_cookie_source = os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\User Data\Default\Network\Cookies")
local_state_path = os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\User Data\Local State")
temp_db = os.path.join(PROFILE_DIR, "chrome_cookies_sync.db")

video_path = os.path.abspath(os.path.join(HERE, "output", "lote_10_videos", "dia_01", "stoicom_dia_01.mp4"))
caption_path = os.path.abspath(os.path.join(HERE, "output", "lote_10_videos", "dia_01", "caption.txt"))

with open(caption_path, "r", encoding="utf-8") as f:
    caption_text = f.read().strip()

def get_encryption_key():
    with open(local_state_path, "r", encoding="utf-8") as f:
        local_state = json.loads(f.read())
    key = base64.b64decode(local_state["os_crypt"]["encrypted_key"])
    key = key[5:]
    return win32crypt.CryptUnprotectData(key, None, None, None, 0)[1]

def decrypt_cookie(encrypted_value, key):
    try:
        if encrypted_value.startswith(b'v10') or encrypted_value.startswith(b'v11'):
            nonce = encrypted_value[3:15]
            ciphertext = encrypted_value[15:-16]
            tag = encrypted_value[-16:]
            cipher = AES.new(key, AES.MODE_GCM, nonce)
            return cipher.decrypt_and_verify(ciphertext, tag).decode('utf-8', errors='ignore')
        else:
            return win32crypt.CryptUnprotectData(encrypted_value, None, None, None, 0)[1].decode('utf-8', errors='ignore')
    except Exception:
        return ""

print("🔍 Buscando sesión activa de TikTok en Google Chrome...")

if not os.path.exists(chrome_cookie_source):
    print("❌ No se encontró la ruta de cookies de Chrome.")
    sys.exit(1)

try:
    shutil.copyfile(chrome_cookie_source, temp_db)
except Exception as e:
    print(f"⚠️ Nota: Para sincronizar, asegúrate de cerrar la ventana de Google Chrome ({e}).")
    sys.exit(1)

key = get_encryption_key()
conn = sqlite3.connect(temp_db)
cursor = conn.cursor()
cursor.execute("SELECT host_key, name, path, expires_utc, is_secure, is_httponly, samesite, encrypted_value FROM cookies WHERE host_key LIKE '%tiktok.com%'")
rows = cursor.fetchall()
conn.close()

playwright_cookies = []
has_session = False

for host, name, path, expires_utc, is_secure, is_httponly, samesite, enc_val in rows:
    val = decrypt_cookie(enc_val, key)
    if val:
        if "session" in name.lower():
            has_session = True
        
        # Chrome stores expires in microsec since 1601. Convert if > 0
        exp = -1
        if expires_utc and expires_utc > 0:
            exp = (expires_utc - 11644473600000000) / 1000000

        playwright_cookies.append({
            "name": name,
            "value": val,
            "domain": host,
            "path": path,
            "expires": exp,
            "httpOnly": bool(is_httponly),
            "secure": bool(is_secure),
            "sameSite": "Lax" if samesite == 1 else ("Strict" if samesite == 2 else "None")
        })

print(f"Cookies de TikTok extraídas: {len(playwright_cookies)} | ¿Tiene sesión?: {has_session}")

if not has_session:
    print("⚠️ Aún no se detecta la cookie de sesión activa ('sessionid'). Inicia sesión en Chrome en tiktok.com y vuelve a ejecutar.")
    sys.exit(0)

# Guardar storage_state
storage_state = {
    "cookies": playwright_cookies,
    "origins": [
        {
            "origin": "https://www.tiktok.com",
            "localStorage": []
        }
    ]
}

with open(state_path, "w", encoding="utf-8") as f:
    json.dump(storage_state, f, indent=2)

print(f"🎉 ¡SESIÓN DE TIKTOK SINCRONIZADA Y GUARDADA EN {state_path}!")

# Proceder a subir video automáticamente
print("🚀 Subiendo Día 1 a TikTok Creator Center...")
with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    context = browser.new_context(
        storage_state=state_path,
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        viewport={"width": 1280, "height": 850}
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    page.goto("https://www.tiktok.com/creator-center/upload", wait_until="domcontentloaded")
    time.sleep(6)
    page.screenshot(path=os.path.join(HERE, "tiktok_creator_portal.png"))

    file_input = page.locator("input[type='file']").first
    if file_input.count():
        print(f"📁 Adjuntando video del Día 1: {video_path}")
        file_input.set_input_files(video_path)
        time.sleep(10)

        editor = page.locator("div[contenteditable='true'], div[role='combobox']").first
        if editor.count():
            editor.click()
            page.keyboard.insert_text(caption_text)
            time.sleep(3)

        page.screenshot(path=os.path.join(HERE, "tiktok_ready_to_publish.png"))

        post_btn = page.locator("button:has-text('Publicar'), button:has-text('Post')").first
        if post_btn.count():
            post_btn.click()
            print("Esperando subida final (20s)...")
            time.sleep(20)
            page.screenshot(path=os.path.join(HERE, "tiktok_published_live.png"))
            print("🎉 ¡VIDEO DEL DÍA 1 PUBLICADO EXITOSAMENTE EN TIKTOK!")
            context.storage_state(path=state_path)

    browser.close()
