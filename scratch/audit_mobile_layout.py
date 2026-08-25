import re

with open('frontend/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('frontend/css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

print('=== 1. Inline styles in index.html with sizing/margin ===')
for m in re.finditer(r'style="([^"]+)"', html):
    s = m.group(1)
    if any(k in s for k in ['width', 'margin', 'padding', 'calc', 'vw', 'min-width']):
        print(' ', s)

print('\n=== 2. Check all card elements and sections ===')
card_classes = [
    'dashboard-hero-section', 'hero-left-col', 'hero-right-col', 'ai-radar-card',
    'dashboard-scan-card', 'scan-card-body', 'scan-upload-col', 'upload-dropzone', 'scan-workflow-col',
    'dashboard-feature-grid', 'dash-feature-card',
    'dashboard-intel-section', 'intel-card-dark', 'intel-stats-grid', 'intel-stat-block', 'intel-crop-tags', 'crop-tag',
    'recent-scans-card', 'recent-scans-list', 'recent-scan-item',
    'app-container', 'view-section', 'app-content-layout', 'app-shell', 'app-header', 'header-inner'
]

for cls in card_classes:
    # search rules for cls
    rules = re.findall(rf'(\.[a-zA-Z0-9_\-\s,>:+~]*\b{cls}\b[a-zA-Z0-9_\-\s,>:+~]*)\{{([^}}]+)\}}', css)
    print(f'\nClass: .{cls} ({len(rules)} rules)')
    for r in rules:
        sel = r[0].strip()
        body = ' '.join([line.strip() for line in r[1].split('\n') if line.strip()])
        # only print relevant sizing properties
        sizing_props = [p.strip() for p in body.split(';') if any(k in p for k in ['width', 'padding', 'margin', 'gap', 'grid-template', 'flex', 'box-sizing', 'overflow'])]
        if sizing_props:
            print(f'  {sel} -> {"; ".join(sizing_props)}')
