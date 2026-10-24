# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/DriverSettingsTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r"dY.*?Battery Saver Eco Mode", "<Leaf className=\"w-4 h-4 inline-block mr-1 text-emerald-400\" /> Battery Saver Eco Mode", text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

