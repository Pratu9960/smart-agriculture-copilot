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

tasks = [
    {
        "name": "weather_live",
        "file": "shot_05_weather_live.png",
        "width": 1920,
        "height": 1080,
        "js": """
        App.showAppShell({ displayName: 'Prathamesh', email: 'farmer@example.com' });
        App.navigateTo('view-weather');
        const sampleWeather = {
            latitude: 18.52,
            longitude: 73.85,
            location: 'Pune, Maharashtra',
            temperature: 28.4,
            condition: 'Partly cloudy',
            icon: '⛅',
            humidity: 62,
            windSpeed: 14.5,
            rainProbability: 25,
            timestamp: new Date().toISOString(),
            irrigationAdvisory: {
                headline: 'Favorable for Irrigation',
                detail: 'Weather conditions support regular field watering. Soil moisture window is optimal today.',
                recommendation: 'PROCEED'
            },
            forecast: [
                { date: '2026-08-22', condition: 'Sunny', icon: '☀️', temperatureMax: 31, temperatureMin: 21, rainProbability: 10 },
                { date: '2026-08-23', condition: 'Partly cloudy', icon: '⛅', temperatureMax: 30, temperatureMin: 22, rainProbability: 25 },
                { date: '2026-08-24', condition: 'Light rain', icon: '🌦️', temperatureMax: 28, temperatureMin: 21, rainProbability: 60 },
                { date: '2026-08-25', condition: 'Moderate rain', icon: '🌧️', temperatureMax: 27, temperatureMin: 20, rainProbability: 75 },
                { date: '2026-08-26', condition: 'Thunderstorm', icon: '⛈️', temperatureMax: 26, temperatureMin: 20, rainProbability: 85 }
            ]
        };
        if (window.WeatherModule) {
            WeatherModule.currentLocation = { city: 'Pune', state: 'Maharashtra', displayName: 'Pune, Maharashtra' };
            WeatherModule.renderWeatherUI(sampleWeather);
        }
        """
    },
    {
        "name": "history_live",
        "file": "shot_08_history_live.png",
        "width": 1920,
        "height": 1080,
        "js": """
        App.showAppShell({ displayName: 'Prathamesh', email: 'farmer@example.com' });
        App.navigateTo('view-history');
        const sampleHistory = [
            {
                id: 'rec_1',
                crop: 'Wheat',
                disease: 'Yellow Stripe Rust (Puccinia striiformis)',
                severity: 'High',
                date: '21 Aug 2026 • 3:53 PM',
                syncStatus: 'SYNCED'
            },
            {
                id: 'rec_2',
                crop: 'Soybean',
                disease: 'Soybean Rust (Phakopsora pachyrhizi)',
                severity: 'Moderate',
                date: '20 Aug 2026 • 11:20 AM',
                syncStatus: 'SYNCED'
            },
            {
                id: 'rec_3',
                crop: 'Tomato',
                disease: 'Early Blight (Alternaria solani)',
                severity: 'Low',
                date: '18 Aug 2026 • 09:15 AM',
                syncStatus: 'SYNCED'
            }
        ];
        if (window.HistoryModule) {
            HistoryModule.renderHistoryList(sampleHistory);
        }
        """
    },
    {
        "name": "diagnosis_result",
        "file": "shot_12_diagnosis_result.png",
        "width": 1920,
        "height": 1080,
        "js": """
        App.showAppShell({ displayName: 'Prathamesh', email: 'farmer@example.com' });
        App.navigateTo('view-result');
        document.getElementById('result-crop-name').textContent = 'Tomato';
        document.getElementById('result-disease-name').textContent = 'Early Blight (Alternaria solani)';
        document.getElementById('result-confidence').textContent = '96%';
        document.getElementById('result-overview').textContent = 'Fungal disease causing concentric target-board dark rings on leaves and stems.';
        document.getElementById('result-symptoms').innerHTML = '<p>Brown to black circular spots with concentric rings appearing on older lower leaves first.</p>';
        document.getElementById('result-cause').innerHTML = '<p>Alternaria solani fungus, favored by warm temperatures (24-29°C) and extended leaf wetness.</p>';
        document.getElementById('result-treatment').innerHTML = '<p>Apply Mancozeb 75% WP @ 2g/liter or Copper Oxychloride 50% WP @ 2.5g/liter at 10-day intervals.</p>';
        document.getElementById('result-pesticides').innerHTML = '<p>Recommended fungicide: Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/liter.</p>';
        document.getElementById('result-fertilizer').innerHTML = '<p>Avoid excess nitrogen; balance with potassium to reinforce plant cell wall resistance.</p>';
        document.getElementById('result-prevention').innerHTML = '<p>Ensure 60cm row spacing for air circulation, avoid overhead sprinkler watering, practice crop rotation.</p>';
        """
    }
]

async def run():
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
                if params: payload["params"] = params
                await ws.send(json.dumps(payload))
                while True:
                    raw = await ws.recv()
                    data = json.loads(raw)
                    if data.get("id") == current_id: return data
            
            await send_cmd("Page.enable")
            await send_cmd("Runtime.enable")
            
            for task in tasks:
                print(f"Capturing {task['name']}...")
                await send_cmd("Emulation.setDeviceMetricsOverride", {
                    "width": task["width"],
                    "height": task["height"],
                    "deviceScaleFactor": 1,
                    "mobile": False
                })
                await send_cmd("Runtime.evaluate", {"expression": task["js"]})
                await asyncio.sleep(1.2)
                res = await send_cmd("Page.captureScreenshot", {"format": "png"})
                if "result" in res and "data" in res["result"]:
                    img_data = base64.b64decode(res["result"]["data"])
                    out_path = os.path.join(artifact_dir, task["file"])
                    with open(out_path, "wb") as f:
                        f.write(img_data)
                    print(f" -> Saved {task['file']} ({len(img_data)} bytes)")
    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    asyncio.run(run())
