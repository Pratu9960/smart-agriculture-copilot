import re

with open('frontend/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('frontend/css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

print('=== 1. SVGs with width attributes > 260 ===')
for m in re.finditer(r'<svg[^>]+width=["\']([0-9]+)["\'][^>]*>', html):
    w = int(m.group(1))
    if w > 260:
        print(' ', m.group(0)[:120])

print('\n=== 2. Check all classes with nowrap in CSS ===')
for m in re.finditer(r'([.#a-zA-Z0-9_\-\s,>:+~]+)\{([^}]*white-space\s*:\s*nowrap[^}]*)\}', css):
    sel = m.group(1).strip()
    print(' ', sel)

print('\n=== 3. Check all elements with flex in CSS or HTML ===')
for m in re.finditer(r'<([a-zA-Z0-9]+)[^>]*class=["\']([^"\']+)["\'][^>]*style=["\']([^"\']+)["\'][^>]*>', html):
    tag, cls, st = m.group(1), m.group(2), m.group(3)
    if 'flex' in st or 'nowrap' in st or 'width' in st:
        print(f'  <{tag} class="{cls}" style="{st}">')

print('\n=== 4. Check all width rules on body, main, section, div ===')
for m in re.finditer(r'([.#a-zA-Z0-9_\-\s,>:+~]+)\{([^}]*width\s*:[^;]+;[^}]*)\}', css):
    sel = m.group(1).strip()
    body = m.group(2).strip()
    if any(k in sel for k in ['hero', 'scan', 'feature', 'intel', 'radar', 'app', 'view', 'header', 'footer']):
        print(f'  {sel} -> {body}')
