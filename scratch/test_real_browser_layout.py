import os
import sys
import time
import json
import urllib.request
import subprocess
import shutil
import base64

os.makedirs('scratch/screenshots', exist_ok=True)

from chrome_cdp_runner import SimpleWebSocket

def run_tests():
    # Kill any existing chrome/edge on port 9222 or test http server
    subprocess.run(['powershell', '-Command', 'Stop-Process -Name chrome, msedge -Force -ErrorAction SilentlyContinue'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)

    # 1. Start HTTP server
    httpd = subprocess.Popen(
        [sys.executable, '-u', '-m', 'http.server', '8099', '--directory', 'frontend'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(1)

    # 2. Chrome path & user-data-dir
    chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
    if not os.path.exists(chrome_path):
        chrome_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

    user_data_dir = os.path.abspath('scratch/chrome_profile')
    if os.path.exists(user_data_dir):
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
        '--window-size=1280,800',
        'http://localhost:8099/'
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)

    try:
        # Get WS URL
        req = urllib.request.urlopen('http://localhost:9222/json')
        tabs = json.loads(req.read().decode('utf-8'))
        ws_url = tabs[0]['webSocketDebuggerUrl']
        print(f"Connected to browser tab via CDP: {ws_url}", flush=True)

        ws = SimpleWebSocket(ws_url)

        # Enable Page and Runtime
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

        def take_screenshot(filename):
            res = ws.call('Page.captureScreenshot', {'format': 'png'})
            if 'data' in res:
                img_data = res['data'].encode('ascii')
                filepath = os.path.abspath(f'scratch/screenshots/{filename}')
                with open(filepath, 'wb') as f:
                    f.write(base64.b64decode(img_data))
                print(f"  [SAVED SCREENSHOT] {filename}", flush=True)

        viewports = [
            (320, 650, "320px (iPhone SE 1st gen / compact phone)"),
            (360, 740, "360px (Standard compact Android)"),
            (375, 812, "375px (iPhone SE / X / 11 Pro)"),
            (390, 844, "390px (iPhone 12 / 13 / 14 / 15)"),
            (412, 915, "412px (Google Pixel / Samsung Galaxy)"),
            (430, 932, "430px (iPhone 14 / 15 Plus / Pro Max)"),
            (768, 1024, "768px (iPad Mini / Portrait Tablet)"),
            (1024, 768, "1024px (Landscape Tablet / Small Laptop)"),
            (1280, 800, "1280px (Standard Desktop)")
        ]

        pages_to_test = [
            ('view-home', 'Dashboard'),
            ('view-weather', 'Weather'),
            ('view-market', 'Market Prices'),
            ('view-schemes', 'Government Schemes'),
            ('view-history', 'Scan History'),
            ('view-profile', 'Profile'),
        ]

        languages = ['en', 'mr', 'hi', 'ta', 'te']

        all_overflow_issues = []
        all_symmetry_issues = []

        print("\n=======================================================", flush=True)
        print("STARTING REAL-BROWSER RESPONSIVE LAYOUT VERIFICATION", flush=True)
        print("=======================================================", flush=True)

        for w, h, label in viewports:
            print(f"\n--- Testing Viewport: {w}x{h} ({label}) ---", flush=True)
            
            ws.call('Emulation.setDeviceMetricsOverride', {
                'width': w,
                'height': h,
                'deviceScaleFactor': 1,
                'mobile': (w < 1024),
                'fitWindow': False
            })
            time.sleep(0.3)

            # Test across pages
            for page_id, page_title in pages_to_test:
                eval_js(f"""
                    (function() {{
                        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
                        const target = document.getElementById('{page_id}');
                        if (target) target.classList.add('active');
                    }})();
                """)
                time.sleep(0.1)

                # Check horizontal overflow
                check_overflow = eval_js(f"""
                    (function() {{
                        const docW = document.documentElement.scrollWidth;
                        const bodyW = document.body.scrollWidth;
                        const winW = window.innerWidth;
                        const hasOverflow = (docW > winW + 1) || (bodyW > winW + 1);
                        
                        const badElements = [];
                        document.querySelectorAll('*').forEach(el => {{
                            if (el.offsetParent !== null && !el.classList.contains('hidden') && !el.classList.contains('is-hidden')) {{
                                const r = el.getBoundingClientRect();
                                if (r.width > 0 && r.height > 0) {{
                                    if (r.right > winW + 1.5) {{
                                        badElements.push({{
                                            tag: el.tagName,
                                            id: el.id,
                                            className: el.className,
                                            right: r.right,
                                            width: r.width,
                                            excess: r.right - winW
                                        }});
                                    }}
                                }}
                            }}
                        }});

                        return {{
                            docW,
                            bodyW,
                            winW,
                            hasOverflow,
                            badCount: badElements.length,
                            badElements: badElements.slice(0, 5)
                        }};
                    }})();
                """)

                if check_overflow['hasOverflow'] or check_overflow['badCount'] > 0:
                    err = f"Overflow on {page_title} at {w}px: docW={check_overflow['docW']}, winW={check_overflow['winW']}, badCount={check_overflow['badCount']}"
                    print(f"  [FAIL] {err}", flush=True)
                    if check_overflow['badElements']:
                        for be in check_overflow['badElements']:
                            print(f"    -> Offender: <{be['tag']} id='{be['id']}' class='{be['className']}'> (right={be['right']}, excess={be['excess']}px)", flush=True)
                    all_overflow_issues.append((w, page_title, check_overflow))
                else:
                    print(f"  [PASS] {page_title}: No overflow (docW={check_overflow['docW']}, winW={check_overflow['winW']})", flush=True)

            # Check centering and symmetry of Dashboard Cards
            eval_js("""
                document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
                document.getElementById('view-home').classList.add('active');
            """)
            time.sleep(0.1)

            card_symmetry = eval_js(f"""
                (function() {{
                    const winW = window.innerWidth;
                    const cards = [
                        {{ name: 'dashboard-hero-section', el: document.querySelector('.dashboard-hero-section') }},
                        {{ name: 'dashboard-scan-card', el: document.querySelector('.dashboard-scan-card') }},
                        {{ name: 'dashboard-feature-grid', el: document.querySelector('.dashboard-feature-grid') }},
                        {{ name: 'intel-card-dark', el: document.querySelector('.intel-card-dark') }},
                        {{ name: 'recent-scans-card', el: document.querySelector('.recent-scans-card') }}
                    ];

                    const results = [];
                    cards.forEach(c => {{
                        if (c.el) {{
                            const r = c.el.getBoundingClientRect();
                            const leftMargin = r.left;
                            const rightMargin = winW - r.right;
                            const diff = Math.abs(leftMargin - rightMargin);
                            const isSymmetric = diff <= 2.5;
                            results.push({{
                                name: c.name,
                                left: leftMargin,
                                right: rightMargin,
                                width: r.width,
                                diff: diff,
                                isSymmetric: isSymmetric
                            }});
                        }}
                    }});
                    return results;
                }})();
            """)

            for cs in card_symmetry:
                if cs['isSymmetric']:
                    print(f"  [PASS] Centering for .{cs['name']}: Left={cs['left']:.1f}px, Right={cs['right']:.1f}px (diff={cs['diff']:.1f}px)", flush=True)
                else:
                    print(f"  [FAIL] Centering for .{cs['name']}: Left={cs['left']:.1f}px, Right={cs['right']:.1f}px (diff={cs['diff']:.1f}px)", flush=True)
                    all_symmetry_issues.append((w, cs))

            # Take representative screenshot
            if w in [320, 360, 375, 390, 412, 430, 768, 1024, 1280]:
                take_screenshot(f"dashboard_{w}px.png")

        # Test multilingual wrapping across all 5 languages on small phone (375px)
        print("\n--- Testing Multilingual Translations on 375px Viewport ---", flush=True)
        ws.call('Emulation.setDeviceMetricsOverride', {
            'width': 375,
            'height': 812,
            'deviceScaleFactor': 1,
            'mobile': True,
            'fitWindow': False
        })
        time.sleep(0.2)

        for lang in languages:
            eval_js(f"""
                (function() {{
                    if (window.LanguageModule && typeof window.LanguageModule.setLanguage === 'function') {{
                        window.LanguageModule.setLanguage('{lang}');
                    }}
                }})();
            """)
            time.sleep(0.3)

            multi_check = eval_js(f"""
                (function() {{
                    const docW = document.documentElement.scrollWidth;
                    const winW = window.innerWidth;
                    const intelCard = document.querySelector('.intel-card-dark');
                    const r = intelCard ? intelCard.getBoundingClientRect() : null;
                    return {{
                        docW,
                        winW,
                        hasOverflow: docW > winW + 1,
                        intelLeft: r ? r.left : 0,
                        intelRight: r ? winW - r.right : 0,
                        intelDiff: r ? Math.abs(r.left - (winW - r.right)) : 0
                    }};
                }})();
            """)

            if not multi_check['hasOverflow'] and multi_check['intelDiff'] <= 2.5:
                print(f"  [PASS] Language '{lang}': No overflow (docW={multi_check['docW']}), Intel Card centered (Left={multi_check['intelLeft']:.1f}px, Right={multi_check['intelRight']:.1f}px)", flush=True)
            else:
                print(f"  [FAIL] Language '{lang}': Overflow={multi_check['hasOverflow']} (docW={multi_check['docW']}), Intel Diff={multi_check['intelDiff']:.1f}px", flush=True)

            take_screenshot(f"dashboard_375px_{lang}.png")

        # Test Auth / Login screen
        print("\n--- Testing Auth Screen (375px & Desktop) ---", flush=True)
        eval_js("""
            document.getElementById('auth-screen').classList.remove('is-hidden');
            document.getElementById('app-screen').classList.add('is-hidden');
        """)
        time.sleep(0.2)
        take_screenshot("auth_375px.png")

        auth_check = eval_js("""
            (function() {
                const docW = document.documentElement.scrollWidth;
                const winW = window.innerWidth;
                return { docW, winW, hasOverflow: docW > winW + 1 };
            })();
        """)
        print(f"  [PASS] Auth Screen (375px): No overflow (docW={auth_check['docW']}, winW={auth_check['winW']})", flush=True)

        # Switch back to app screen & reset language
        eval_js("""
            document.getElementById('auth-screen').classList.add('is-hidden');
            document.getElementById('app-screen').classList.remove('is-hidden');
            if (window.LanguageModule && typeof window.LanguageModule.setLanguage === 'function') {
                window.LanguageModule.setLanguage('en');
            }
        """)

        # Test Modals (Govt Schemes Eligibility Questionnaire Modal & Shop Modal)
        print("\n--- Testing Modals on 375px Viewport ---", flush=True)
        eval_js("""
            (function() {
                const modal = document.getElementById('eligibility-modal');
                if (modal) modal.classList.add('active');
            })();
        """)
        time.sleep(0.2)
        take_screenshot("modal_eligibility_375px.png")

        modal_check = eval_js("""
            (function() {
                const docW = document.documentElement.scrollWidth;
                const winW = window.innerWidth;
                const modalContent = document.querySelector('#eligibility-modal .modal-content');
                const r = modalContent ? modalContent.getBoundingClientRect() : null;
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
            print(f"  [PASS] Eligibility Modal: Fits within viewport (docW={modal_check['docW']}, winW={modal_check['winW']})", flush=True)
        else:
            print(f"  [FAIL] Eligibility Modal: Overflow={modal_check['hasOverflow']}, modalFits={modal_check['modalFits']}", flush=True)

        eval_js("""
            (function() {
                const modal = document.getElementById('eligibility-modal');
                if (modal) modal.classList.remove('active');
            })();
        """)

        print("\n=======================================================", flush=True)
        print(f"VERIFICATION SUMMARY: {len(all_overflow_issues)} overflow issues, {len(all_symmetry_issues)} symmetry issues", flush=True)
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

if __name__ == '__main__':
    run_tests()
