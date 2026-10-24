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


# Header icons replacement
pattern_header = r"<div className=\"flex gap-2\">\s*<button className=\"w-11 h-11 rounded-full bg-rose-500/10.*?</button>\s*<button className=\"w-11 h-11 rounded-full bg-\[\#1e293b\].*?</button>\s*</div>"
replacement_header = """<div className="flex gap-2">
          <MessagingButton />
          <NotificationBell />
        </div>"""
text = re.sub(pattern_header, replacement_header, text, flags=re.DOTALL)

# Inject GO ONLINE before Stats Grid
pattern_stats = r"(\{/\* Stats Grid \*/\})"
replacement_stats = """<div className="mb-6">
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${isOnline ? 'bg-red-500 text-white' : 'bg-[#1cd188] text-slate-900'}`}
        >
          {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
        </button>
      </div>\n\n      \\1"""
text = re.sub(pattern_stats, replacement_stats, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

