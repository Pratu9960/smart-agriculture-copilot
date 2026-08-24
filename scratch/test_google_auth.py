import subprocess
import time
import json
import urllib.request
import os
import base64
import asyncio
import websockets

artifact_dir = r"C:\Users\Prathamesh\.gemini\antigravity-ide\brain\3f272dc7-011e-45e9-8c81-9f8c70f89aec"
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
port = 9223
user_data = os.path.join(artifact_dir, "chrome_profile")
os.makedirs(user_data, exist_ok=True)

async def run_tests():
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data}",
        "--window-size=1440,900",
        "http://localhost:8085"
    ]
    
    proc = subprocess.Popen(cmd)
    time.sleep(2.0)
    
    try:
        tabs_url = f"http://127.0.0.1:{port}/json"
        with urllib.request.urlopen(tabs_url) as resp:
            tabs = json.loads(resp.read().decode())
        
        target_tab = next(t for t in tabs if t.get('type') == 'page')
        ws_url = target_tab['webSocketDebuggerUrl']
        
        async with websockets.connect(ws_url, max_size=50*1024*1024) as ws:
            msg_id = 1
            
            async def send_cmd(method, params=None):
                nonlocal msg_id
                current_id = msg_id
                msg_id += 1
                payload = {"id": current_id, "method": method}
                if params:
                    payload["params"] = params
                await ws.send(json.dumps(payload))
                
                while True:
                    raw = await ws.recv()
                    data = json.loads(raw)
                    if data.get("id") == current_id:
                        return data

            async def eval_js(expression):
                res = await send_cmd("Runtime.evaluate", {
                    "expression": expression,
                    "returnByValue": True,
                    "awaitPromise": True
                })
                if "result" in res and "result" in res["result"]:
                    return res["result"]["result"].get("value")
                return None

            async def capture_screen(filename):
                res = await send_cmd("Page.captureScreenshot", {"format": "png"})
                if "result" in res and "data" in res["result"]:
                    img_data = base64.b64decode(res["result"]["data"])
                    out_path = os.path.join(artifact_dir, filename)
                    with open(out_path, "wb") as f:
                        f.write(img_data)
                    print(f"Captured {filename}")

            await send_cmd("Page.enable")
            await send_cmd("Runtime.enable")
            
            # Wait for page load
            await asyncio.sleep(2.0)
            
            print("1. Checking auth screen and Google button presence...")
            check_dom = await eval_js("""
            (() => {
                const btnSubmit = document.getElementById('btn-auth-submit');
                const divider = document.getElementById('auth-divider');
                const btnGoogle = document.getElementById('btn-google-auth');
                const googleText = document.getElementById('btn-google-text');
                const googleSvg = btnGoogle ? btnGoogle.querySelector('svg') : null;
                const authError = document.getElementById('auth-error-msg');
                return {
                    hasBtnSubmit: !!btnSubmit,
                    submitText: btnSubmit ? btnSubmit.textContent.trim() : null,
                    hasDivider: !!divider,
                    dividerText: divider ? divider.textContent.trim() : null,
                    hasBtnGoogle: !!btnGoogle,
                    googleText: googleText ? googleText.textContent.trim() : null,
                    hasGoogleSvg: !!googleSvg,
                    hasAuthError: !!authError,
                    hasAuthModule: !!window.AuthModule,
                    hasGoogleProviderMethod: typeof (window.AuthModule && window.AuthModule.getGoogleProvider) === 'function',
                    hasLoginWithGoogleMethod: typeof (window.AuthModule && window.AuthModule.loginWithGoogle) === 'function',
                    hasGoogleHandler: typeof (window.ProfileModule && window.ProfileModule.handleGoogleSignIn) === 'function'
                };
            })()
            """)
            print("DOM Check:", json.dumps(check_dom, indent=2))
            
            await capture_screen("auth_login_with_google.png")

            print("\n2. Testing switch to Register mode...")
            await eval_js("ProfileModule.switchAuthTab('register');")
            await asyncio.sleep(0.5)
            register_dom = await eval_js("""
            (() => {
                const isRegister = document.getElementById('auth-screen').classList.contains('mode-register');
                const nameVisible = window.getComputedStyle(document.getElementById('auth-name-group')).display !== 'none';
                const confirmVisible = window.getComputedStyle(document.getElementById('auth-confirm-group')).display !== 'none';
                const googleVisible = window.getComputedStyle(document.getElementById('btn-google-auth')).display !== 'none';
                return { isRegister, nameVisible, confirmVisible, googleVisible };
            })()
            """)
            print("Register Mode Check:", json.dumps(register_dom, indent=2))
            await capture_screen("auth_register_with_google.png")

            print("\n3. Testing switch back to Login mode...")
            await eval_js("ProfileModule.switchAuthTab('login');")
            await asyncio.sleep(0.5)

            print("\n4. Testing Multilingual translations...")
            lang_results = {}
            for lang in ['en', 'mr', 'hi', 'ta', 'te']:
                await eval_js(f"LanguageModule.setLanguage('{lang}');")
                await asyncio.sleep(0.3)
                t_check = await eval_js("""
                (() => {
                    const googleText = document.getElementById('btn-google-text')?.textContent.trim();
                    const dividerText = document.getElementById('auth-divider')?.textContent.trim();
                    return { googleText, dividerText };
                })()
                """)
                lang_results[lang] = t_check
            print("Language translations:", json.dumps(lang_results, indent=2))

            # Reset back to English
            await eval_js("LanguageModule.setLanguage('en');")
            await asyncio.sleep(0.3)

            print("\n5. Testing Google Sign-In button click and error handling...")
            # Trigger handleGoogleSignIn
            await eval_js("ProfileModule.handleGoogleSignIn();")
            await asyncio.sleep(1.5)
            
            error_check = await eval_js("""
            (() => {
                const errBox = document.getElementById('auth-error-msg');
                return {
                    errorDisplayed: errBox ? window.getComputedStyle(errBox).display !== 'none' : false,
                    errorText: errBox ? errBox.textContent.trim() : ''
                };
            })()
            """)
            print("Google Error Handling Check:", json.dumps(error_check, indent=2))
            await capture_screen("auth_error_state.png")

    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    asyncio.run(run_tests())
