# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/SurgeMap.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

if "const [isRadioActive, setIsRadioActive] = useState(false);" not in text:
    text = text.replace("const [combatMode, setCombatMode] = useState(false);", "const [combatMode, setCombatMode] = useState(false);\n  const [isRadioActive, setIsRadioActive] = useState(false);")

old_radio = """      {/* Oga Radio (Walkie Talkie) Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-[60] flex flex-col items-center">
        <button className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-[#1cd188] rounded-full shadow-[0_0_20px_rgba(28,209,136,0.4)] flex items-center justify-center animate-pulse active:scale-95 transition-transform border-4 border-[#0f172a]">
          <Mic className="w-6 h-6 text-[#0f172a]" />
        </button>
        <span className="text-[#1cd188] text-[9px] font-black uppercase tracking-widest mt-1 drop-shadow-md">
          Oga Radio
        </span>
      </div>"""

new_radio = """      {/* Oga Radio (Walkie Talkie) Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-[60] flex flex-col items-center">
        <button 
          onMouseDown={() => setIsRadioActive(true)}
          onMouseUp={() => setIsRadioActive(false)}
          onMouseLeave={() => setIsRadioActive(false)}
          onTouchStart={() => setIsRadioActive(true)}
          onTouchEnd={() => setIsRadioActive(false)}
          onClick={() => {
             alert("Voice transmission sent to Regional Command Center.");
          }}
          className={`w-16 h-16 rounded-full shadow-[0_0_20px_rgba(28,209,136,0.4)] flex items-center justify-center transition-all duration-200 border-4 border-[#0f172a] select-none ${isRadioActive ? 'bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'bg-gradient-to-br from-emerald-400 to-[#1cd188] animate-pulse active:scale-95'}`}
        >
          <Mic className={`w-6 h-6 ${isRadioActive ? 'text-white animate-bounce' : 'text-[#0f172a]'}`} />
        </button>
        <span className={`text-[9px] font-black uppercase tracking-widest mt-1 drop-shadow-md transition-colors ${isRadioActive ? 'text-red-400 animate-pulse' : 'text-[#1cd188]'}`}>
          {isRadioActive ? 'TRANSMITTING...' : 'Oga Radio'}
        </span>
      </div>"""

text = text.replace(old_radio, new_radio)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

