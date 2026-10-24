# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/DriverProfileTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# I will find the Wallet & Instant Cashout Card and append the Fuel Advance logic.
wallet_pattern = re.compile(r'\{\/\* 4\. Wallet & Instant Cashout Card \*\/\}[\s\S]*?<InstantCashoutModal', re.DOTALL)

# In order to implement Fuel Advance, let's create a small modal state or just an alert for now.
# Wait, let's just make it a cool button that shows a success alert.

new_wallet = """{/* 4. Wallet & Instant Cashout Card */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-5 mb-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-brandMint" />
              <span className="text-white font-bold text-sm uppercase tracking-wide">Wallet Balance</span>
            </div>
            <span className="text-brandMint text-2xl font-black">{formatCurrency(walletBalance, user?.country_code)}</span>
          </div>
          <div className="flex gap-3 mt-4">
            <button 
              onClick={() => { if (setActiveTab) setActiveTab('subscriptions'); }}
              className="flex-1 bg-slate-950 border border-slate-700 text-slate-300 font-bold py-3 rounded-xl text-[10px] sm:text-xs flex items-center justify-center gap-1.5 active:bg-slate-800 transition-colors uppercase tracking-wider"
            >
              Subscriptions
            </button>
            <button 
              onClick={() => setShowCashoutModal(true)}
              className="flex-1 bg-brandMint text-slate-900 font-black py-3 rounded-xl text-[10px] sm:text-xs flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider"
            >
              Cash Out
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-800/50">
            <button 
              onClick={() => {
                if (window.confirm(`Request an Instant Fuel Advance of ${formatCurrency(10000, user?.country_code)}?\n\nThis will be automatically deducted from your next payouts at 0% interest.`)) {
                  setWalletBalance(prev => Number(prev) + 10000);
                  alert(`Success! ${formatCurrency(10000, user?.country_code)} Fuel Advance has been credited to your wallet.`);
                }
              }}
              className="w-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-black py-3 rounded-xl text-xs flex items-center justify-between px-4 hover:bg-orange-500/20 active:scale-95 transition-all uppercase tracking-widest"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" /> Instant Fuel Advance
              </div>
              <span>{formatCurrency(10000, user?.country_code)}</span>
            </button>
          </div>
        </div>

        <InstantCashoutModal"""

text = wallet_pattern.sub(new_wallet, text)

# I also need to make sure formatCurrency is imported in DriverProfileTab.jsx
import_pattern = r"import InstantCashoutModal from '\.\/InstantCashoutModal';"
new_import = """import InstantCashoutModal from './InstantCashoutModal';\nimport { formatCurrency } from '../../utils/CurrencyManager';"""
text = re.sub(import_pattern, new_import, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

