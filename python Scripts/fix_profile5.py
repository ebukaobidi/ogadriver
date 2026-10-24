# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/DriverProfileTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Inject GO ONLINE button under avatar block
pattern = r"(<div className=\"mt-2 inline-flex items-center px-2 py-0\.5 rounded-full bg-\[\#1cd188\]/20 text-\[\#1cd188\] text-\[9px\] font-bold uppercase tracking-wider\">\s*\{driver\?\.status \|\| 'ONLINE'\} &bull; \{driver\?\.city \|\| 'LAGOS'\}\s*</div>\s*</div>\s*</div>)"

replacement = r"""\1

      {/* Online/Offline Toggle */}
      <div className="mb-6">
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${isOnline ? 'bg-red-500 text-white' : 'bg-[#1cd188] text-slate-900'}`}
        >
          {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
        </button>
      </div>"""

text = re.sub(pattern, replacement, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

