# -*- coding: utf-8 -*-
import io

path = 'frontend/src/components/driver/SurgeMap.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add combat mode state
text = text.replace("const [loading, setLoading] = useState(false);", "const [loading, setLoading] = useState(false);\n  const [combatMode, setCombatMode] = useState(false);")

# Inject Shield into imports if missing
if "Shield" not in text:
    text = text.replace("ShieldCheck } from 'lucide-react';", "ShieldCheck, Shield } from 'lucide-react';")
if "Shield," not in text and "Shield " not in text:
    text = text.replace("ShieldCheck }", "ShieldCheck, Shield }")

# Inject UI
ui_inject = """
      {/* Combat Driving Mode Overlay */}
      {combatMode && (
        <div className="fixed inset-0 bg-black/90 z-[70] flex flex-col items-center justify-center p-6 backdrop-blur-md pointer-events-auto">
          <div className="bg-red-500/20 w-40 h-40 rounded-full flex items-center justify-center border-4 border-red-500 mb-8 animate-pulse shadow-[0_0_80px_rgba(239,68,68,0.6)]">
            <Shield className="w-20 h-20 text-red-500" />
          </div>
          <h2 className="text-4xl font-black text-red-500 uppercase tracking-widest text-center mb-3 drop-shadow-md">Combat Mode Active</h2>
          <p className="text-white text-center font-mono text-base max-w-sm border border-slate-700 bg-slate-900/50 p-4 rounded-xl">Distractions blocked. You are driving above 15km/h. Focus on the road.</p>
        </div>
      )}

      {/* Combat Mode Toggle */}
      <div className="absolute top-24 right-4 z-[50]">
        <button
          onClick={() => setCombatMode(!combatMode)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all ${
            combatMode ? 'bg-red-500 border-red-400 animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Shield className={`w-6 h-6 ${combatMode ? 'text-slate-900' : ''}`} />
        </button>
      </div>

      {/* Oga Radio (Walkie Talkie) Floating Action Button */}"""

text = text.replace("{/* Oga Radio (Walkie Talkie) Floating Action Button */}", ui_inject)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

