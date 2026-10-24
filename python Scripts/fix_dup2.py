# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/pages/DriverPortal.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r"<h2 className=\"text-white font-black text-xl mb-1\">Manage Your Availability</h2>\s*<p className=\"text-slate-400 text-xs mb-4\">.*?</p>"
text = re.sub(pattern, "", text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

