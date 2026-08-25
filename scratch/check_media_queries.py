import re

with open('frontend/css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Let's inspect all media query blocks in style.css
mq_blocks = re.findall(r'(@media[^{]+\{([\s\S]+?)\n\})', css)

print(f'Total media query blocks: {len(mq_blocks)}')
for full_mq, content in mq_blocks:
    header = full_mq.split('{')[0].strip()
    print(f'\n--- {header} --- ({len(content.splitlines())} lines)')
