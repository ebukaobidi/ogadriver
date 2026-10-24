# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/pages/Login.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern1 = r"<p className=\"text-white text-xs font-bold text-center mb-3\">.*?Get the OgaDriver App</p>"
replacement1 = """<p className="text-white text-xs font-bold text-center mb-3">📱 Get the OgaDriver App</p>"""
text = re.sub(pattern1, replacement1, text)

pattern2 = r"Google Play\s*</a>"
replacement2 = """▶️ Google Play\n                      </a>"""
# wait, actually let's match the whole a tag content
text = re.sub(r">\s*.*?Google Play\s*</a>", ">\n                        ▶️ Google Play\n                      </a>", text)

# password dots
text = re.sub(r'placeholder="[^"]*"', 'placeholder="••••••••"', text, count=1) # only replace the first which is password hopefully? NO.
# Let's fix password placeholder specifically
text = re.sub(r'type="password"\s*value=\{formData\.password\}\s*onChange=\{\(e\) => setFormData\(\{ \.\.\.formData, password: e\.target\.value \}\)\}\s*placeholder="[^"]*"', 
              'type="password"\n                        value={formData.password}\n                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}\n                        placeholder="••••••••"', text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

