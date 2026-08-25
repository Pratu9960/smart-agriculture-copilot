import urllib.request
import json
import time
import subprocess
import os
import sys

from chrome_cdp_runner import SimpleWebSocket

req = urllib.request.urlopen('http://localhost:9222/json')
targets = json.loads(req.read().decode('utf-8'))
page_target = next((t for t in targets if t.get('type') == 'page'), targets[0])
ws = SimpleWebSocket(page_target['webSocketDebuggerUrl'])

ws.call('Page.enable')
ws.call('Runtime.enable')

ws.call('Emulation.setDeviceMetricsOverride', {
    'width': 375,
    'height': 812,
    'deviceScaleFactor': 1,
    'mobile': True,
    'screenWidth': 375,
    'screenHeight': 812
})
time.sleep(0.3)

def eval_js(expr):
    res = ws.call('Runtime.evaluate', {
        'expression': expr,
        'returnByValue': True,
        'awaitPromise': True
    })
    return res.get('result', {}).get('value')

# Activate view-home and check classes and rect
res = eval_js("""
    (function() {
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        const vh = document.getElementById('view-home');
        vh.classList.add('active');
        const card = document.querySelector('.intel-card-dark');
        const r = card.getBoundingClientRect();
        const container = document.querySelector('.app-container');
        const cr = container.getBoundingClientRect();
        return {
            vhActive: vh.classList.contains('active'),
            vhDisplay: window.getComputedStyle(vh).display,
            cardDisplay: window.getComputedStyle(card).display,
            cardRect: { left: r.left, right: r.right, width: r.width, height: r.height },
            containerRect: { left: cr.left, right: cr.right, width: cr.width },
            winW: window.innerWidth,
            docW: document.documentElement.scrollWidth
        };
    })();
""")

print("Inspect result:", json.dumps(res, indent=2))
ws.close()
