# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/SurgeMap.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the mock fallback in fetchZones
pattern = r"setZones\(\[\s*\{ id: 1, name: 'Victoria Island.*?\]\);"
text = re.sub(pattern, "setZones([]);", text, flags=re.DOTALL)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

