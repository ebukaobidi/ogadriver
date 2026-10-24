# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/SurgeMap.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the rendering block for zones
pattern = r"\(<div className=\"flex flex-col gap-3\">\s*<p className=\"text-slate-400 text-xs font-bold uppercase tracking-wider mb-1\">Active High-Demand Corridors</p>\s*\{zones\.map\(zone => \{"

replacement = r"""(
          <div className="flex flex-col gap-3">
            {zones.length === 0 ? (
              <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                <MapPin className="w-8 h-8 text-slate-500 mb-3" />
                <p className="text-slate-400 text-sm font-bold">No active surge corridors</p>
                <p className="text-slate-500 text-xs mt-1">We will notify you when demand increases in your city.</p>
              </div>
            ) : (
              <>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active High-Demand Corridors</p>
                {zones.map(zone => {"""

text = re.sub(pattern, replacement, text)

# We also need to close the Fragment <React.Fragment> at the bottom of the map!
pattern2 = r"\}\)\}\s*</div>\s*\)"
replacement2 = """})}</>\n            )}\n          </div>\n        )"""

text = re.sub(pattern2, replacement2, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

