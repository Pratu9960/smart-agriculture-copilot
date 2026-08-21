import os
import re

html_path = r"c:\smart agriculture copilo\frontend\index.html"
css_path = r"c:\smart agriculture copilo\frontend\css\style.css"
lang_js_path = r"c:\smart agriculture copilo\frontend\js\language.js"

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

with open(lang_js_path, 'r', encoding='utf-8') as f:
    lang_js = f.read()

print("--- 1. AUDITING SIDEBAR NAVIGATION ---")
sidebar_nav_match = re.search(r'<aside id="app-sidebar".*?</aside>', html, re.DOTALL)
if sidebar_nav_match:
    sidebar_html = sidebar_nav_match.group(0)
    buttons = re.findall(r'<button class="desktop-nav-item[^"]*".*?</button>', sidebar_html, re.DOTALL)
    print(f"Found {len(buttons)} desktop nav buttons:")
    for b in buttons:
        target = re.search(r'data-target="([^"]+)"', b)
        target_name = target.group(1) if target else "unknown"
        # Find all span contents
        spans = re.findall(r'<span[^>]*>(.*?)</span>', b, re.DOTALL)
        text_spans = [s.strip() for s in spans if not s.strip().startswith('<svg')]
        print(f" - [data-target='{target_name}']: Text labels = {text_spans}")
        if len(text_spans) != 1:
            print(f"   [ERROR] Expected exactly 1 text label, found {len(text_spans)}")
else:
    print("[ERROR] Sidebar not found in HTML!")

print("\n--- 2. AUDITING LANGUAGE.JS NAV MAPPING ---")
nav_mapping_match = re.search(r'const navMapping = \{(.*?)\};', lang_js, re.DOTALL)
if nav_mapping_match:
    print("navMapping definition:")
    print(nav_mapping_match.group(0))

print("\n--- 3. AUDITING FILE INPUTS VISIBILITY ---")
file_inputs = re.findall(r'<input[^>]*type="file"[^>]*>', html)
print(f"Found {len(file_inputs)} file inputs in HTML:")
for fi in file_inputs:
    print(" -", fi)
    if 'class="file-input-hidden"' in fi or 'class="hidden"' in fi or 'style="display: none"' in fi or 'class="is-hidden"' in fi:
        print("   -> OK (Properly hidden with custom class)")
    else:
        print("   -> [WARNING] Native file input might be visible!")

print("\n--- 4. AUDITING FORM CONTROLS IN CSS ---")
required_classes = ['.btn', '.btn-primary', '.btn-lime', '.btn-secondary', '.btn-outline', '.form-input', '.form-select', '.form-textarea', '.auth-screen', '.dashboard-hero', '.feature-row', '.weather-layout', '.market-hero-card', '.schemes-grid', '.history-card', '.app-footer']
for cls in required_classes:
    if cls in css:
        print(f" - Class '{cls}' defined in style.css: YES")
    else:
        print(f" - Class '{cls}' defined in style.css: [MISSING]")

print("\n--- AUDIT COMPLETE ---")
