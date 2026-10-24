# -*- coding: utf-8 -*-
import io

path = 'frontend/src/components/driver/DriverProfileTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add imports
if "NotificationBell" not in text:
    text = text.replace("import { formatCurrency } from '../../utils/CurrencyManager';", "import { formatCurrency } from '../../utils/CurrencyManager';\nimport { NotificationBell } from '../NotificationSystem';\nimport { MessagingButton } from '../MessagingSystem';")

# Add isOnline state
if "const [isOnline, setIsOnline] = useState(false);" not in text:
    text = text.replace("const [walletBalance, setWalletBalance] = useState(driver?.wallet_balance || 0);", "const [walletBalance, setWalletBalance] = useState(driver?.wallet_balance || 0);\n  const [isOnline, setIsOnline] = useState(false);")


# Find the header block to replace SVG hamburger with icons
old_header_icons = """<div className="flex gap-2">
          <button className="w-11 h-11 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </button>
          <button className="w-11 h-11 rounded-full bg-[#1e293b] border border-slate-800 flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>"""

new_header_icons = """<div className="flex gap-2">
          <MessagingButton />
          <NotificationBell />
        </div>"""

text = text.replace(old_header_icons, new_header_icons)

# Put GO ONLINE button under Avatar Block
old_avatar = """<div className="w-full h-full flex items-center justify-center bg-[#1cd188] text-[#0f172a] text-2xl font-bold">
              {(user?.name || 'D').charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-white text-xl font-bold">{user?.name || 'Driver Operative'}</h2>
          <div className="flex gap-3 mt-1 text-slate-400 text-xs">
            <span className="flex items-center gap-1"><Star className="text-amber-400 fill-amber-400 w-3 h-3"/> 4.90</span>
            <span>•</span>
            <span>{(driver?.total_trips || 0).toLocaleString()} trips</span>
          </div>
        </div>
      </div>"""

new_avatar = """<div className="w-full h-full flex items-center justify-center bg-[#1cd188] text-[#0f172a] text-2xl font-bold">
              {(user?.name || 'D').charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-white text-xl font-bold">{user?.name || 'Driver Operative'}</h2>
          <div className="flex gap-3 mt-1 text-slate-400 text-xs">
            <span className="flex items-center gap-1"><Star className="text-amber-400 fill-amber-400 w-3 h-3"/> 4.90</span>
            <span>•</span>
            <span>{(driver?.total_trips || 0).toLocaleString()} trips</span>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${isOnline ? 'bg-red-500 text-white' : 'bg-[#1cd188] text-slate-900'}`}
        >
          {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
        </button>
      </div>"""

text = text.replace(old_avatar, new_avatar)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

