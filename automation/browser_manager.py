"""
StoiCom Local Autoposter & Reddit Assistant
Maneja la sesion persistente de navegador en tu PC con Playwright.
Permite iniciar sesion de forma segura, publicar en las 3 redes y comentar en Reddit en tu nombre.
"""

import os
import sys
import time
import argparse
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

HERE = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(HERE, ".browser_profile")
os.makedirs(PROFILE_DIR, exist_ok=True)

def check_logins(context):
    cookies = {c["name"]: c for c in context.cookies()}
    reddit_ok = "reddit_session" in cookies or any("reddit" in c["domain"] and "token" in c["name"] for c in cookies.values())
    ig_ok = "sessionid" in cookies and any("instagram" in c["domain"] for c in cookies.values())
    tiktok_ok = "sessionid" in cookies and any("tiktok" in c["domain"] for c in cookies.values())
    return reddit_ok, ig_ok, tiktok_ok

def open_login_session(timeout_minutes: int = 10):
    """Abre el navegador en tu pantalla para iniciar sesion en Reddit, Instagram y TikTok."""
    print("=" * 65)
    print("🌐 ABRIENDO VENTANA DE CHROME EN TU PANTALLA")
    print("=" * 65)
    print("Se abrira una ventana de Chrome con 3 pestañas:")
    print("  1. Reddit: Inicia sesion con tu cuenta.")
    print("  2. Instagram: Inicia sesion con @stoicomapp.")
    print("  3. TikTok: Inicia sesion con @stoicom.app.")
    print("\n👉 Inicia sesion tranquilamente. El script detectara automaticamente")
    print("   cuando hayas entrado en las 3 y guardara la sesion de inmediato.")
    print("=" * 65)

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="msedge",
            headless=False,
            no_viewport=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--start-maximized"
            ]
        )
        
        # Pestaña 1: Reddit
        page_reddit = context.pages[0] if context.pages else context.new_page()
        page_reddit.goto("https://www.reddit.com/login", wait_until="domcontentloaded")
        
        # Pestaña 2: Instagram
        page_ig = context.new_page()
        page_ig.goto("https://www.instagram.com/", wait_until="domcontentloaded")
        
        # Pestaña 3: TikTok
        page_tiktok = context.new_page()
        page_tiktok.goto("https://www.tiktok.com/login", wait_until="domcontentloaded")

        start = time.time()
        max_wait = timeout_minutes * 60

        reddit_logged = False
        ig_logged = False
        tiktok_logged = False

        try:
            while time.time() - start < max_wait:
                # Si todas las ventanas fueron cerradas por el usuario
                if not context.pages or not any(not p.is_closed() for p in context.pages):
                    print("\n🚪 Ventana cerrada manualmente por el usuario.")
                    break

                try:
                    r_ok, i_ok, t_ok = check_logins(context)
                except Exception:
                    # En caso de que se esté cerrando una pestaña
                    break
                
                if r_ok and not reddit_logged:
                    reddit_logged = True
                    print("   ✅ Reddit: ¡Sesion iniciada detectada!")
                if i_ok and not ig_logged:
                    ig_logged = True
                    print("   ✅ Instagram: ¡Sesion iniciada detectada!")
                if t_ok and not tiktok_logged:
                    tiktok_logged = True
                    print("   ✅ TikTok: ¡Sesion iniciada detectada!")

                if reddit_logged and ig_logged and tiktok_logged:
                    print("\n🎉 ¡Las 3 cuentas han iniciado sesion con exito!")
                    time.sleep(3)
                    break

                time.sleep(2)
        except Exception as e:
            print(f"\nℹ️ Finalizando asistente: {str(e)[:100]}")

        print("\n💾 Guardando cookies y perfil seguro en .browser_profile...")
        try:
            context.close()
        except Exception:
            pass
        print(f"✅ Estado final de sesiones: Reddit={'OK' if reddit_logged else 'Pendiente'} | Instagram={'OK' if ig_logged else 'Pendiente'} | TikTok={'OK' if tiktok_logged else 'Pendiente'}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--login", action="store_true", help="Abrir navegador para iniciar sesion")
    args = parser.parse_args()

    if args.login:
        open_login_session()
    else:
        print("Uso: py automation/browser_manager.py --login")
