# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/SurgeMap.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add combat mode state
state_pattern = r'const \[showRadio, setShowRadio\] = useState\(false\);'
new_state = """const [showRadio, setShowRadio] = useState(false);
  const [combatMode, setCombatMode] = useState(false);"""
text = re.sub(state_pattern, new_state, text)

# We need to add the Combat Mode button on the map UI and the visual overlay when active.
# The map UI has: `{/* Oga Radio FAB */}`
ui_pattern = r'\{\/\* Oga Radio FAB \*\/\}'

new_ui = """{/* Combat Driving Mode Overlay */}
      {combatMode && (
        <div className="absolute inset-0 bg-black/80 z-[60] flex flex-col items-center justify-center p-6 backdrop-blur-sm pointer-events-none">
          <div className="bg-red-500/20 w-32 h-32 rounded-full flex items-center justify-center border-4 border-red-500 mb-6 animate-pulse shadow-[0_0_50px_rgba(239,68,68,0.5)]">
            <Shield className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest text-center mb-2">Combat Mode Active</h2>
          <p className="text-white text-center font-mono text-sm max-w-xs">Distractions blocked. You are currently driving above 15km/h. Focus on the road.</p>
        </div>
      )}

      {/* Combat Mode Toggle (Manual Override for Demo) */}
      <div className="absolute top-20 right-4 z-[50]">
        <button
          onClick={() => setCombatMode(!combatMode)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all ${
            combatMode ? 'bg-red-500 border-red-400 animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Shield className={`w-6 h-6 ${combatMode ? 'text-slate-900' : ''}`} />
        </button>
      </div>

      {/* Oga Radio FAB */}"""

text = re.sub(ui_pattern, new_ui, text)

# Wait, `Shield` needs to be imported.
import_pattern = r"import \{ Mic, X, MapPin, Search, Navigation, Zap, AlertTriangle \} from 'lucide-react';"
new_import = """import { Mic, X, MapPin, Search, Navigation, Zap, AlertTriangle, Shield } from 'lucide-react';"""
text = re.sub(import_pattern, new_import, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

