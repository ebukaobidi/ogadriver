# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/DriverProfileTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add imports
if "NotificationBell" not in text:
    text = text.replace("import { formatCurrency } from '../../utils/CurrencyManager';", "import { formatCurrency } from '../../utils/CurrencyManager';\nimport { NotificationBell } from '../NotificationSystem';\nimport { MessagingButton } from '../MessagingSystem';")

# Add isOnline state
if "const [isOnline, setIsOnline] = useState(false);" not in text:
    text = text.replace("const [walletBalance, setWalletBalance] = useState(driver?.wallet_balance || 0);", "const [walletBalance, setWalletBalance] = useState(driver?.wallet_balance || 0);\n  const [isOnline, setIsOnline] = useState(false);")

# Find the header section and inject icons and online button
# Using regex to find the profile header
pattern = r"(<div className=\"bg-\[\#1e293b\] rounded-b-\[2\.5rem\] p-6 pt-8 relative overflow-hidden shadow-2xl shadow-\[\#0f172a\]/50\">.*?<StatDial label=\"Acceptance\" value=\"94%\" percent=\{94\} color=\"#3b82f6\" />)"

replacement = r"""<div className="bg-[#1e293b] rounded-b-[2.5rem] p-6 pt-12 relative overflow-hidden shadow-2xl shadow-[#0f172a]/50">
        <div className="absolute top-4 right-6 z-[60] flex items-center gap-4">
            <MessagingButton />
            <NotificationBell />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-[#1cd188] overflow-hidden flex items-center justify-center p-1">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={32} className="text-slate-400" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#1cd188] text-[#0f172a] rounded-full p-1 border-2 border-[#1e293b]">
                <CheckCircle2 size={12} className="font-bold" />
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-black text-white">{nickname || user?.first_name || 'Driver'}</h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <Star className="text-amber-400 fill-amber-400 w-3 h-3" />
                <span className="font-bold text-slate-300">4.92</span>
                <span>•</span>
                <span>{driver?.total_trips || 0} Trips</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 mb-8 relative z-10">
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`w-full py-3 rounded-2xl font-black text-base transition-all shadow-lg flex items-center justify-center gap-2 ${isOnline ? 'bg-red-500 text-white' : 'bg-[#1cd188] text-slate-900'}`}
          >
            {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
          </button>
        </div>

        <div className="flex justify-between px-2 mt-2 relative z-10">
          <StatDial label="Acceptance" value="94%" percent={94} color="#3b82f6" />"""

text = re.sub(pattern, replacement, text, flags=re.DOTALL)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

