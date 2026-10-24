# -*- coding: utf-8 -*-
import io

path = 'frontend/src/App.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

import_statement = "const PromoterPortal = safeLazy(() => import('./pages/PromoterPortal'));\n"

if "PromoterPortal = safeLazy" not in text and "import PromoterPortal" not in text:
    text = text.replace("const Home = safeLazy(() => import('./pages/Home'));", "const Home = safeLazy(() => import('./pages/Home'));\n" + import_statement)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

