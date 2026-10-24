# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/SurgeMap.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add isOnline state
if "const [isOnline, setIsOnline] = useState(false);" not in text:
    text = text.replace("const [combatMode, setCombatMode] = useState(false);", "const [combatMode, setCombatMode] = useState(false);\n  const [isOnline, setIsOnline] = useState(false);")

# Add ShieldAlert to imports
if "ShieldAlert" not in text:
    text = text.replace("ShieldCheck, Shield }", "ShieldCheck, Shield, ShieldAlert }")
    if "ShieldAlert" not in text: # fallback
        text = text.replace("} from 'lucide-react';", ", ShieldAlert } from 'lucide-react';")

# Replace header buttons to include SOS
old_header = """<button onClick={fetchZones} className="w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center border border-slate-800">
          <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
        </button>"""

new_header = """<div className="flex items-center gap-2">
          <button onClick={() => alert('SOS Triggered! Regional Command Center has been alerted with your live location.')} className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/30 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </button>
          <button onClick={fetchZones} className="w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center border border-slate-800">
            <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>"""

text = text.replace(old_header, new_header)

# Inject Online toggle at the bottom
online_button = """
      {/* Online/Offline Toggle */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[50] w-64">
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`w-full py-4 rounded-full font-black text-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all border-4 flex items-center justify-center gap-2 ${isOnline ? 'bg-red-500 text-white border-[#0f172a]' : 'bg-[#1cd188] text-slate-900 border-[#0f172a]'}`}
        >
          {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
        </button>
      </div>
      
      {/* Oga Radio (Walkie Talkie) Floating Action Button */}"""

text = text.replace("{/* Oga Radio (Walkie Talkie) Floating Action Button */}", online_button)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

