import re

path = 'frontend/src/components/driver/SurgeMap.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'import \{ (.*?) \} from \'lucide-react\';')
match = pattern.search(text)
if match:
    imports = match.group(1)
    if 'Mic' not in imports:
        text = text.replace(match.group(0), f"import {{ {imports}, Mic, Radio }} from 'lucide-react';")

# Add OgaRadio Floating Button before the closing div
target = '''    </div>
  );
}'''

replacement = '''      {/* Oga Radio (Walkie Talkie) Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-[60] flex flex-col items-center">
        <button className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-[#1cd188] rounded-full shadow-[0_0_20px_rgba(28,209,136,0.4)] flex items-center justify-center animate-pulse active:scale-95 transition-transform border-4 border-[#0f172a]">
          <Mic className="w-6 h-6 text-[#0f172a]" />
        </button>
        <span className="text-[#1cd188] text-[9px] font-black uppercase tracking-widest mt-1 drop-shadow-md">
          Oga Radio
        </span>
      </div>
    </div>
  );
}'''

text = text.replace(target, replacement)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
