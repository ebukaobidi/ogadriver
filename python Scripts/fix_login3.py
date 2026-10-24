# -*- coding: utf-8 -*-
import io

path = 'frontend/src/pages/Login.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Get the OgaDriver App" in line:
        lines[i] = '                  <p className="text-white text-xs font-bold text-center mb-3">📱 Get the OgaDriver App</p>\n'
    if "Google Play" in line and "<a" not in line:
        lines[i] = '                        ▶️ Google Play\n'
    if "placeholder=" in line and "type=\"password\"" in lines[i-3]:
        lines[i] = '                        placeholder="••••••••"\n'

with io.open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

