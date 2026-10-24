# -*- coding: utf-8 -*-
import io

path = 'frontend/src/pages/Login.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix App Download Banner
text = text.replace('dY" Get the OgaDriver App', '📱 Get the OgaDriver App')
text = text.replace('-  Google Play', '▶️ Google Play')
text = text.replace('????????', '••••••••')

# Fix password dots
text = text.replace('placeholder="????????"', 'placeholder="••••••••"')

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

