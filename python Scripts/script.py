
import re
with open('svg_content.svg', 'r', encoding='utf-8') as f:
    content = f.read()
    content = re.sub(r'd=\"[^\"']+?\"', 'd=\"...\"', content)
    print(content[:2000])

