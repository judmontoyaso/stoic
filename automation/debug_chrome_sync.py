import os
import sqlite3
import shutil

HERE = os.path.dirname(os.path.abspath(__file__))
chrome_source = os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\User Data\Default\Network\Cookies")
target = os.path.join(HERE, ".browser_profile", "test_inspect.db")

shutil.copyfile(chrome_source, target)

conn = sqlite3.connect(target)
cursor = conn.cursor()

import json
import base64
import win32crypt
from Crypto.Cipher import AES

local_state_path = os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\User Data\Local State")
with open(local_state_path, "r", encoding="utf-8") as f:
    local_state = json.loads(f.read())
key = base64.b64decode(local_state["os_crypt"]["encrypted_key"])[5:]
key = win32crypt.CryptUnprotectData(key, None, None, None, 0)[1]

cursor.execute("SELECT host_key, name, encrypted_value FROM cookies WHERE host_key LIKE '%tiktok%'")
for host, name, enc_val in cursor.fetchall():
    try:
        if enc_val.startswith(b'v10') or enc_val.startswith(b'v11'):
            nonce = enc_val[3:15]
            ciphertext = enc_val[15:-16]
            tag = enc_val[-16:]
            cipher = AES.new(key, AES.MODE_GCM, nonce)
            val = cipher.decrypt_and_verify(ciphertext, tag).decode('utf-8', errors='ignore')
            print(f"DECRYPT OK: {name} = {val[:15]}... (len {len(val)})")
        elif enc_val.startswith(b'v20'):
            print(f"DECRYPT V20 detected for {name}")
        else:
            val = win32crypt.CryptUnprotectData(enc_val, None, None, None, 0)[1].decode('utf-8', errors='ignore')
            print(f"DPAPI OK: {name} = {val[:15]}...")
    except Exception as e:
        print(f"DECRYPT FAIL for {name}: {e}")

conn.close()
