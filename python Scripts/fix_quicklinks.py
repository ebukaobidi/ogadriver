# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/pages/DriverPortal.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r"\{/\* Quick links grid at bottom \*/\}.*?</button>\s*\}\)\}\s*</div>\s*</div>"
text = re.sub(pattern, "", text, flags=re.DOTALL)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

