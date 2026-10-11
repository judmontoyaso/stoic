import os
import sys
import json
import base64
import sqlite3
import win32crypt
from Crypto.Cipher import AES

HERE = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(HERE, ".browser_profile")
state_path = os.path.join(PROFILE_DIR, "tiktok_state.json")
db_path = os.path.join(PROFILE_DIR, "edge_cookies_decrypted.db")
local_state_path = os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\User Data\Local State")

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
    except Exception as e:
        return ""

key = get_encryption_key()
conn = sqlite3.connect(db_path)
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
            print(f"🔑 Encontrada cookie de sesión: {name} (len={len(val)})")

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

print(f"Total cookies extraídas de Edge: {len(playwright_cookies)} | ¿Sesión detectada?: {has_session}")

if has_session:
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
    print(f"🎉 ¡ESTADO DE TIKTOK GUARDADO EXITOSAMENTE EN: {state_path}!")
else:
    print("⚠️ No se encontró la cookie de sesión en Edge.")
