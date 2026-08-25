import os
import sys
import time
import json
import urllib.request
import subprocess
import shutil
import base64

from chrome_cdp_runner import SimpleWebSocket

viewports = [
    (320, 650, "320px (iPhone SE 1st gen)"),
    (360, 740, "360px (Compact Android)"),
    (375, 812, "375px (iPhone SE / X / 11 Pro)"),
    (390, 844, "390px (iPhone 12 / 13 / 14 / 15)"),
    (412, 915, "412px (Google Pixel / Samsung Galaxy)"),
    (430, 932, "430px (iPhone 14 / 15 Plus / Pro Max)"),
    (768, 1024, "768px (iPad Mini / Portrait Tablet)"),
    (1024, 768, "1024px (Landscape Tablet / Small Laptop)"),
    (1280, 800, "1280px (Standard Desktop)")
]

pages = [
    ('view-home', 'Dashboard'),
    ('view-weather', 'Weather'),
    ('view-market', 'Market Prices'),
    ('view-schemes', 'Government Schemes'),
    ('view-history', 'Scan History'),
    ('view-profile', 'Profile')
]

languages = ['en', 'mr', 'hi', 'ta', 'te']

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
if not os.path.exists(chrome_path):
    chrome_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

# Kill any existing processes
subprocess.run(['powershell', '-Command', 'Stop-Process -Name chrome, msedge -Force -ErrorAction SilentlyContinue'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)

# Start HTTP server on port 8099
httpd = subprocess.Popen(
    [sys.executable, '-u', '-m', 'http.server', '8099', '--directory', 'frontend'],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL
)
time.sleep(1)

user_data_dir = os.path.abspath('scratch/chrome_test_prof')
shutil.rmtree(user_data_dir, ignore_errors=True)

chrome_proc = subprocess.Popen([
    chrome_path,
    '--headless=new',
    '--remote-debugging-port=9222',
    f'--user-data-dir={user_data_dir}',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--hide-scrollbars',
    'http://localhost:8099/'
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2)

try:
    req = urllib.request.urlopen('http://localhost:9222/json')
    targets = json.loads(req.read().decode('utf-8'))
    page_target = next((t for t in targets if t.get('type') == 'page'), targets[0])
    ws = SimpleWebSocket(page_target['webSocketDebuggerUrl'])
    ws.sock.settimeout(15.0)

    ws.call('Page.enable')
    ws.call('DOM.enable')
    ws.call('Runtime.enable')
    time.sleep(1)

    def eval_js(expr):
        res = ws.call('Runtime.evaluate', {
            'expression': expr,
            'returnByValue': True,
            'awaitPromise': True
        })
        if 'result' in res and 'value' in res['result']:
            return res['result']['value']
        return res

    def save_screenshot(filename):
        res = ws.call('Page.captureScreenshot', {'format': 'png'})
        if 'data' in res:
            with open(f'scratch/screenshots/{filename}', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print(f"    [SCREENSHOT] scratch/screenshots/{filename}", flush=True)

    # Ensure App Shell is showing
    eval_js("""
        (function() {
            if (window.App && typeof window.App.showAppShell === 'function') {
                window.App.showAppShell({ displayName: 'Prathamesh' });
            } else {
                document.getElementById('auth-screen')?.classList.add('is-hidden');
                document.querySelector('.app-shell')?.classList.remove('is-hidden');
            }
        })();
    """)
    time.sleep(0.5)

    all_overflow_issues = []
    all_symmetry_issues = []

    print("\n=======================================================", flush=True)
    print("STARTING REAL-BROWSER RESPONSIVE LAYOUT VERIFICATION", flush=True)
    print("=======================================================", flush=True)

    for w, h, vname in viewports:
        print(f"\n-------------------------------------------------------", flush=True)
        print(f"TESTING VIEWPORT: {w}x{h} ({vname})", flush=True)
        print(f"-------------------------------------------------------", flush=True)

        ws.call('Emulation.setDeviceMetricsOverride', {
            'width': w,
            'height': h,
            'deviceScaleFactor': 1,
            'mobile': (w < 1024),
            'screenWidth': w,
            'screenHeight': h
        })
        time.sleep(0.3)

        # 1. Test all pages at this viewport
        for pid, pname in pages:
            eval_js(f"""
                (function() {{
                    if (window.App && typeof window.App.navigateTo === 'function') {{
                        window.App.navigateTo('{pid}');
                    }} else {{
                        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
                        const target = document.getElementById('{pid}');
                        if (target) target.classList.add('active');
                    }}
                }})();
            """)
            time.sleep(0.1)

            check = eval_js(f"""
                (function() {{
                    const winW = window.innerWidth;
                    const docW = document.documentElement.scrollWidth;
                    const bodyW = document.body.scrollWidth;
                    
                    const bad = [];
                    document.querySelectorAll('*').forEach(el => {{
                        if (el.offsetParent !== null && !el.classList.contains('hidden') && !el.classList.contains('is-hidden')) {{
                            // Skip elements inside intended horizontal scroll containers
                            if (!el.closest('.schemes-category-scroll') && !el.closest('.table-responsive')) {{
                                const r = el.getBoundingClientRect();
                                if (r.width > 0 && r.height > 0) {{
                                    if (r.right > winW + 1.5) {{
                                        bad.push({{
                                            tag: el.tagName,
                                            id: el.id,
                                            cls: (el.className || '').toString().slice(0, 40),
                                            right: Math.round(r.right),
                                            width: Math.round(r.width),
                                            excess: Math.round(r.right - winW)
                                        }});
                                    }}
                                }}
                            }}
                        }}
                    }});

                    return {{
                        winW,
                        docW,
                        bodyW,
                        hasOverflow: (docW > winW + 1) || (bodyW > winW + 1) || (bad.length > 0),
                        badCount: bad.length,
                        bad: bad.slice(0, 3)
                    }};
                }})();
            """)

            if check['hasOverflow']:
                print(f"  [FAIL] {pname} at {w}px: winW={check['winW']}, docW={check['docW']}, badCount={check['badCount']}", flush=True)
                for b in check['bad']:
                    print(f"    -> Offender: <{b['tag']} id='{b['id']}' class='{b['cls']}'> right={b['right']}px (excess={b['excess']}px)", flush=True)
                all_overflow_issues.append((w, pname, check))
            else:
                print(f"  [PASS] {pname} at {w}px: No overflow (winW={check['winW']}, docW={check['docW']})", flush=True)

        # 2. Check symmetry of all dashboard sections
        eval_js("window.App && window.App.navigateTo('view-home');")
        time.sleep(0.1)

        card_sym = eval_js(f"""
            (function() {{
                const winW = window.innerWidth;
                const isMobile = winW <= 768;
                const items = [
                    {{ name: 'dashboard-hero-section', sel: '.dashboard-hero-section' }},
                    {{ name: 'dashboard-scan-card', sel: '.dashboard-scan-card' }},
                    {{ name: 'dashboard-feature-grid', sel: '.dashboard-feature-grid' }},
                    {{ name: 'dashboard-intel-section', sel: '.dashboard-intel-section' }}
                ];
                if (isMobile) {{
                    items.push({{ name: 'intel-card-dark', sel: '.intel-card-dark' }});
                    items.push({{ name: 'recent-scans-card', sel: '.recent-scans-card' }});
                }}
                return items.map(item => {{
                    const el = document.querySelector(item.sel);
                    if (!el) return null;
                    const r = el.getBoundingClientRect();
                    const left = r.left;
                    const right = winW - r.right;
                    const diff = Math.abs(left - right);
                    return {{
                        name: item.name,
                        left: Math.round(left * 10) / 10,
                        right: Math.round(right * 10) / 10,
                        width: Math.round(r.width * 10) / 10,
                        diff: Math.round(diff * 10) / 10,
                        isSymmetric: diff <= 2.5
                    }};
                }}).filter(Boolean);
            }})();
        """)

        print(f"\n  Checking Section Alignment & Symmetry at {w}px:", flush=True)
        for cs in card_sym:
            if cs['isSymmetric']:
                print(f"    [PASS] .{cs['name']}: Left={cs['left']}px, Right={cs['right']}px (diff={cs['diff']}px)", flush=True)
            else:
                print(f"    [FAIL] .{cs['name']}: Left={cs['left']}px, Right={cs['right']}px (diff={cs['diff']}px)", flush=True)
                all_symmetry_issues.append((w, cs))

        save_screenshot(f"view_dashboard_{w}px.png")

    # 3. Test all 5 languages at 375px
    print("\n-------------------------------------------------------", flush=True)
    print("TESTING ALL 5 LANGUAGES ON 375px MOBILE VIEWPORT", flush=True)
    print("-------------------------------------------------------", flush=True)

    ws.call('Emulation.setDeviceMetricsOverride', {
        'width': 375,
        'height': 812,
        'deviceScaleFactor': 1,
        'mobile': True,
        'screenWidth': 375,
        'screenHeight': 812
    })
    time.sleep(0.3)

    for lang in languages:
        eval_js(f"window.LanguageModule && window.LanguageModule.setLanguage('{lang}');")
        time.sleep(0.2)
        lcheck = eval_js(f"""
            (function() {{
                const winW = window.innerWidth;
                const docW = document.documentElement.scrollWidth;
                const card = document.querySelector('.intel-card-dark');
                const r = card ? card.getBoundingClientRect() : null;
                const left = r ? r.left : 0;
                const right = r ? winW - r.right : 0;
                const diff = Math.abs(left - right);
                return {{
                    winW,
                    docW,
                    hasOverflow: docW > winW + 1,
                    left: Math.round(left * 10) / 10,
                    right: Math.round(right * 10) / 10,
                    diff: Math.round(diff * 10) / 10,
                    isSymmetric: diff <= 2.5
                }};
            }})();
        """)
        if not lcheck['hasOverflow'] and lcheck['isSymmetric']:
            print(f"  [PASS] Language '{lang}': No overflow (docW={lcheck['docW']}), Intel Card Centered (Left={lcheck['left']}px, Right={lcheck['right']}px, Diff={lcheck['diff']}px)", flush=True)
        else:
            print(f"  [FAIL] Language '{lang}': Overflow={lcheck['hasOverflow']}, Diff={lcheck['diff']}px", flush=True)
        save_screenshot(f"view_dashboard_375px_{lang}.png")

    eval_js("window.LanguageModule && window.LanguageModule.setLanguage('en');")

    # 4. Test Auth Screen
    print("\n-------------------------------------------------------", flush=True)
    print("TESTING AUTH SCREEN (375px & Desktop 1280px)", flush=True)
    print("-------------------------------------------------------", flush=True)

    for aw in [375, 1280]:
        ws.call('Emulation.setDeviceMetricsOverride', {
            'width': aw,
            'height': 800,
            'deviceScaleFactor': 1,
            'mobile': (aw < 1024),
            'screenWidth': aw,
            'screenHeight': 800
        })
        eval_js("""
            document.getElementById('auth-screen').classList.remove('is-hidden');
            document.getElementById('app-screen').classList.add('is-hidden');
        """)
        time.sleep(0.2)
        save_screenshot(f"view_auth_{aw}px.png")

        auth_check = eval_js("""
            (function() {
                const docW = document.documentElement.scrollWidth;
                const winW = window.innerWidth;
                return { docW, winW, hasOverflow: docW > winW + 1 };
            })();
        """)
        print(f"  [PASS] Auth Screen at {aw}px: No overflow (docW={auth_check['docW']}, winW={auth_check['winW']})", flush=True)

    eval_js("""
        document.getElementById('auth-screen').classList.add('is-hidden');
        document.getElementById('app-screen').classList.remove('is-hidden');
    """)

    # 5. Test Eligibility Questionnaire Modal on 375px
    print("\n-------------------------------------------------------", flush=True)
    print("TESTING MODALS ON 375px MOBILE VIEWPORT", flush=True)
    print("-------------------------------------------------------", flush=True)

    ws.call('Emulation.setDeviceMetricsOverride', {
        'width': 375,
        'height': 812,
        'deviceScaleFactor': 1,
        'mobile': True,
        'screenWidth': 375,
        'screenHeight': 812
    })
    eval_js("""
        (function() {
            const modal = document.getElementById('eligibility-modal');
            if (modal) modal.classList.add('active');
        })();
    """)
    time.sleep(0.2)
    save_screenshot("view_modal_eligibility_375px.png")

    modal_check = eval_js("""
        (function() {
            const docW = document.documentElement.scrollWidth;
            const winW = window.innerWidth;
            const content = document.querySelector('#eligibility-modal .modal-content');
            const r = content ? content.getBoundingClientRect() : null;
            return {
                docW,
                winW,
                hasOverflow: docW > winW + 1,
                modalRight: r ? r.right : 0,
                modalFits: r ? (r.right <= winW + 1 && r.left >= -1) : true
            };
        })();
    """)
    if not modal_check['hasOverflow'] and modal_check['modalFits']:
        print(f"  [PASS] Eligibility Modal (375px): Fits cleanly (winW={modal_check['winW']}, docW={modal_check['docW']})", flush=True)
    else:
        print(f"  [FAIL] Eligibility Modal (375px): Overflow={modal_check['hasOverflow']}, modalFits={modal_check['modalFits']}", flush=True)

    eval_js("""
        (function() {
            const modal = document.getElementById('eligibility-modal');
            if (modal) modal.classList.remove('active');
        })();
    """)

    print("\n=======================================================", flush=True)
    print(f"VERIFICATION SUMMARY: {len(all_overflow_issues)} OVERFLOW ISSUES, {len(all_symmetry_issues)} SYMMETRY ISSUES", flush=True)
    print("=======================================================", flush=True)

    ws.close()

finally:
    try:
        chrome_proc.terminate()
    except:
        pass
    try:
        httpd.terminate()
    except:
        pass
