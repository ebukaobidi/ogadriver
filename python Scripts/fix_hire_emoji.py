# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/hirer/HirerAccount.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r"dY\?[^\'\"]+", "🏠", text)
text = text.replace("{ id: '2', name: 'Office', address: 'Marina Financial Center, Lagos', icon: '🏠' }", "{ id: '2', name: 'Office', address: 'Marina Financial Center, Lagos', icon: '💼' }")

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)
