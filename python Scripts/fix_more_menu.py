# -*- coding: utf-8 -*-
import io

path = 'frontend/src/pages/DriverPortal.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

old_btn = """          {/* 3 Dots Menu */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 ${moreSheetOpen ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'} transition-colors`}
            aria-label="Menu"
          >"""

new_btn = """          {/* 3 Dots Menu */}
          <button
            onClick={() => setMoreSheetOpen(!moreSheetOpen)}
            className={`flex flex-col items-center gap-1 ${moreSheetOpen ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'} transition-colors`}
            aria-label="Menu"
          >"""

text = text.replace(old_btn, new_btn)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

