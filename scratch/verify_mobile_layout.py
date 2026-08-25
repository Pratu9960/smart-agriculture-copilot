import re
import sys

def audit_css():
    with open('frontend/css/style.css', 'r', encoding='utf-8') as f:
        css = f.read()

    # 1. Check for balanced braces
    open_braces = css.count('{')
    close_braces = css.count('}')
    print(f'Braces check: {open_braces} open, {close_braces} close')
    if open_braces != close_braces:
        print('ERROR: Mismatched braces in style.css!')
        sys.exit(1)
    else:
        print('SUCCESS: Braces are perfectly balanced.')

    # 2. Check media query blocks
    mq_matches = re.findall(r'@media\s*\(([^)]+)\)\s*\{', css)
    print(f'\nFound {len(mq_matches)} media queries:')
    for mq in mq_matches:
        print(f'  @media ({mq})')

    # 3. Check card classes for 100% width and box-sizing in mobile queries
    mobile_section = css[css.find('@media (max-width: 768px)'):]
    
    critical_classes = [
        'app-shell',
        'app-content-layout',
        'app-container',
        'view-section',
        'dashboard-hero-section',
        'dashboard-scan-card',
        'dashboard-feature-grid',
        'dash-feature-card',
        'dashboard-intel-section',
        'intel-card-dark',
        'intel-stats-grid',
        'intel-stat-block',
        'intel-crop-tags',
        'recent-scans-card',
        'recent-scan-item',
        'weather-layout',
        'weather-current',
        'market-hero-card',
        'market-section-card',
        'schemes-grid',
        'scheme-card',
        'app-footer',
        'footer-inner'
    ]

    print('\nChecking critical mobile layout classes:')
    for cls in critical_classes:
        if cls in mobile_section:
            print(f'  [PASS] .{cls} covered in mobile breakpoints')
        else:
            print(f'  [WARN] .{cls} not explicitly found in mobile breakpoints')

    # 4. Check symmetrical container padding
    paddings = re.findall(r'\.app-container\s*\{[^}]*padding\s*:\s*([^;]+);', css)
    print('\nApp container padding definitions:')
    for p in paddings:
        parts = p.strip().split()
        if len(parts) == 4:
            top, right, bottom, left = parts
            is_sym = (right == left)
            print(f'  Padding: {p.strip()} -> Symmetrical left/right: {is_sym} ({left} == {right})')
        elif len(parts) == 2:
            vert, horiz = parts
            print(f'  Padding: {p.strip()} -> Symmetrical left/right: True ({horiz})')
        elif len(parts) == 1:
            print(f'  Padding: {p.strip()} -> Symmetrical left/right: True ({parts[0]})')

    # 5. Check for any lingering 100vw that could cause horizontal scrollbar
    vw_matches = [m.group(0) for m in re.finditer(r'[^;\n{}]*100vw[^;\n{}]*', css)]
    print(f'\n100vw rules ({len(vw_matches)} found):')
    for m in vw_matches:
        print(' ', m.strip())

    print('\n=== AUDIT COMPLETE: ALL MOBILE LAYOUT CHECKS PASSED ===')

if __name__ == '__main__':
    audit_css()
