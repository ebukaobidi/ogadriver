# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/pages/DriverPortal.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r"\{/\* 3 Dots Menu \*/\}\s*<button\s*onClick=\{\(\) => setActiveTab\('profile'\)\}\s*className=\{\`flex flex-col items-center gap-1 \$\{moreSheetOpen \? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'\} transition-colors\`\}\s*aria-label=\"Menu\"\s*>"

new_btn = """{/* 3 Dots Menu */}
          <button
            onClick={() => setMoreSheetOpen(!moreSheetOpen)}
            className={`flex flex-col items-center gap-1 ${moreSheetOpen ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'} transition-colors`}
            aria-label="Menu"
          >"""

text = re.sub(pattern, new_btn, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

