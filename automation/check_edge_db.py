import sqlite3

conn = sqlite3.connect("automation/.browser_profile/edge_cookies_decrypted.db")
cursor = conn.cursor()

cursor.execute("SELECT host_key, count(*) FROM cookies GROUP BY host_key ORDER BY count(*) DESC LIMIT 30")
print("Top hosts in Edge:")
for r in cursor.fetchall():
    print("  >", r)

cursor.execute("SELECT host_key, name FROM cookies WHERE LOWER(host_key) LIKE '%tiktok%'")
rows = cursor.fetchall()
print(f"TikTok in Edge count: {len(rows)}")
for r in rows:
    print("  >", r)

conn.close()
