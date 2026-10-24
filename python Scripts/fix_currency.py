# -*- coding: utf-8 -*-
import io

path = 'frontend/src/utils/CurrencyManager.js'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("const code = countryCode.toUpperCase();", "const code = (countryCode || 'NG').toUpperCase();")

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

path2 = 'mobile/src/utils/CurrencyManager.js'
with io.open(path2, 'r', encoding='utf-8') as f:
    text2 = f.read()
text2 = text2.replace("const code = countryCode.toUpperCase();", "const code = (countryCode || 'NG').toUpperCase();")
with io.open(path2, 'w', encoding='utf-8') as f:
    f.write(text2)

