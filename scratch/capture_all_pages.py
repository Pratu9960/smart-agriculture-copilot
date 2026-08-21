import subprocess
import time
import json
import urllib.request
import os
import base64
import asyncio
import websockets

artifact_dir = r"C:\Users\Prathamesh\.gemini\antigravity-ide\brain\3498bab7-4bca-4cd4-bec5-f0ac8bf2e100"
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
port = 9222
user_data = os.path.join(artifact_dir, "chrome_profile")
os.makedirs(user_data, exist_ok=True)

# Define tasks to capture
tasks = [
    {
        "name": "login",
        "file": "shot_01_login.png",
        "width": 1920,
        "height": 1080,
        "js": "App.showAuthScreen('login');"
    },
    {
        "name": "register",
        "file": "shot_02_register.png",
        "width": 1920,
        "height": 1080,
        "js": "App.showAuthScreen('register');"
    },
    {
        "name": "dashboard",
        "file": "shot_03_dashboard.png",
        "width": 1920,
        "height": 1080,
        "js": "App.showAppShell({ displayName: 'Prathamesh', email: 'farmer@example.com' }); App.navigateTo('view-home');"
    },
    {
        "name": "scan",
        "file": "shot_04_scan.png",
        "width": 1920,
        "height": 1080,
        "js": "App.showAppShell({ displayName: 'Prathamesh', email: 'farmer@example.com' }); App.navigateTo('view-scan');"
    },
    {
        "name": "weather",
        "file": "shot_05_weather.png",
        "width": 1920,
        "height": 1080,
        "js": "App.showAppShell({ displayName: 'Prathamesh', email: 'farmer@example.com' }); App.navigateTo('view-weather'); if (window.WeatherModule) WeatherModule.initView();"
    },
    {
        "name": "market",
        "file": "shot_06_market.png",
        "width": 1920,
        "height": 1080,
        "js": "App.showAppShell({ displayName: 'Prathamesh', email: 'farmer@example.com' }); App.navigateTo('view-market'); if (window.MarketModule) MarketModule.initView();"
    },
    {
        "name": "schemes",
        "file": "shot_07_schemes.png",
        "width": 1920,
        "height": 1080,
        "js": "App.showAppShell({ displayName: 'Prathamesh', email: 'farmer@example.com' }); App.navigateTo('view-schemes'); if (window.SchemesModule) SchemesModule.initView();"
    },
    {
        "name": "history",
        "file": "shot_08_history.png",
        "width": 1920,
        "height": 1080,
        "js": "App.showAppShell({ displayName: 'Prathamesh', email: 'farmer@example.com' }); App.navigateTo('view-history'); if (window.HistoryModule) HistoryModule.initView();"
    },
    {
        "name": "profile",
        "file": "shot_09_profile.png",
        "width": 1920,
        "height": 1080,
        "js": "App.showAppShell({ displayName: 'Prathamesh', email: 'farmer@example.com' }); App.navigateTo('view-profile'); if (window.ProfileModule) ProfileModule.initView();"
    },
    {
        "name": "mobile_dashboard",
        "file": "shot_10_mobile_dashboard.png",
        "width": 390,
        "height": 844,
        "js": "App.showAppShell({ displayName: 'Prathamesh', email: 'farmer@example.com' }); App.navigateTo('view-home');"
    },
    {
        "name": "desktop_1366",
        "file": "shot_11_desktop_1366.png",
        "width": 1366,
        "height": 768,
        "js": "App.showAppShell({ displayName: 'Prathamesh', email: 'farmer@example.com' }); App.navigateTo('view-home');"
    }
]

async def capture_all():
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data}",
        "--window-size=1920,1080",
        "http://localhost:3000"
    ]
    
    proc = subprocess.Popen(cmd)
    time.sleep(2.5)
    
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
            
            await send_cmd("Page.enable")
            await send_cmd("Runtime.enable")
            
            for task in tasks:
                print(f"Capturing {task['name']}...")
                # Set viewport
                await send_cmd("Emulation.setDeviceMetricsOverride", {
                    "width": task["width"],
                    "height": task["height"],
                    "deviceScaleFactor": 1,
                    "mobile": task["width"] < 768
                })
                
                # Execute JS
                await send_cmd("Runtime.evaluate", {
                    "expression": task["js"]
                })
                
                # Wait for render / animations
                await asyncio.sleep(1.2)
                
                # Capture
                res = await send_cmd("Page.captureScreenshot", {"format": "png"})
                if "result" in res and "data" in res["result"]:
                    img_data = base64.b64decode(res["result"]["data"])
                    out_path = os.path.join(artifact_dir, task["file"])
                    with open(out_path, "wb") as f:
                        f.write(img_data)
                    print(f" -> Saved {task['file']} ({len(img_data)} bytes)")
                else:
                    print(f" -> Error capturing {task['name']}: {res}")
                    
    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    asyncio.run(capture_all())
