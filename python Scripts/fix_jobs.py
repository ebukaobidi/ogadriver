# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/DriverProposalsTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r"\{/\* Mock Job 1: Fleet Car \*/\}.*?</button>\s*</div>\s*</div>"

replacement = """<div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="w-12 h-12 text-blue-500/20 mb-4" />
              <p className="text-white font-bold text-lg mb-2">No Open Opportunities</p>
              <p className="text-slate-400 text-xs max-w-[250px]">
                There are currently no fleet vehicles or corporate contracts available in your region. Check back later.
              </p>
            </div>
          </div>"""

text = re.sub(pattern, replacement, text, flags=re.DOTALL)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

