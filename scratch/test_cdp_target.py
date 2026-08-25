import urllib.request
import json
import time
import subprocess
import os
import shutil

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
user_data_dir = os.path.abspath('scratch/chrome_test_prof')
shutil.rmtree(user_data_dir, ignore_errors=True)

proc = subprocess.Popen([
    chrome_path,
    '--headless=new',
    '--remote-debugging-port=9222',
    f'--user-data-dir={user_data_dir}',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2)

try:
    req = urllib.request.urlopen('http://localhost:9222/json')
    targets = json.loads(req.read().decode('utf-8'))
    print("Targets found:", len(targets))
    for t in targets:
        print("  Type:", t.get('type'), "URL:", t.get('url'), "WS:", t.get('webSocketDebuggerUrl'))
finally:
    proc.terminate()
