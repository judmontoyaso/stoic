import os
import json
import base64
import sqlite3
import win32crypt
from Crypto.Cipher import AES

HERE = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(HERE, ".browser_profile", "chrome_cookies.db")
local_state_path = os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\User Data\Local State")

def get_encryption_key():
    with open(local_state_path, "r", encoding="utf-8") as f:
        local_state = json.loads(f.read())
    key = base64.b64decode(local_state["os_crypt"]["encrypted_key"])
    key = key[5:]  # strip 'DPAPI' prefix
    return win32crypt.CryptUnprotectData(key, None, None, None, 0)[1]

def decrypt_cookie(encrypted_value, key):
    try:
        # Check prefix: v10 or v11
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

if os.path.exists(db_path) and os.path.exists(local_state_path):
    key = get_encryption_key()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT host_key, name, encrypted_value FROM cookies WHERE host_key LIKE '%tiktok%'")
    rows = cursor.fetchall()
    print(f"Total TikTok cookies found in Chrome: {len(rows)}")
    for host, name, enc_val in rows:
        val = decrypt_cookie(enc_val, key)
        val_display = val[:10] + "..." if len(val) > 10 else val
        print(f"  {host} -> {name}: {val_display}")
    conn.close()
else:
    print("Files not found.")
