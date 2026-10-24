# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/pages/Register.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix the {code}
pattern = r"\{code\}\s*</button>"
replacement = "{country.flag} {country.code}\n                      </button>"
text = re.sub(pattern, replacement, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

