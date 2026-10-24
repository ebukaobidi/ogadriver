# -*- coding: utf-8 -*-
with open('frontend/src/components/hirer/HirerAccount.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# 1. Add Corporate toggle
old_prefs = r"\{ key: 'female_driver_only', label: 'Female Driver Only', desc: 'Prioritize verified female chauffeurs' \}"
new_prefs = r"{ key: 'female_driver_only', label: 'Female Driver Only', desc: 'Prioritize verified female chauffeurs' },\n            { key: 'corporate_account', label: 'Corporate / Business Account', desc: 'Bill rides directly to your registered company' }"
content = re.sub(old_prefs, new_prefs, content)

# 2. Add Paystack visual to Top Up Wallet Modal
old_topup_btn = r'<button\s*type="submit"\s*disabled=\{topUpLoading\}\s*className="w-full bg-\[#1cd188\] hover:bg-emerald-400 text-corporateNavy font-black py-4 rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-\[#1cd188\]/20"\s*>\s*\{topUpLoading \? <Loader2 className="w-5 h-5 animate-spin" /> : \'Proceed to Payment\'\}\s*</button>'

# Let's verify the button looks like that by doing a softer replace
if 'Proceed to Payment' in content:
    # We replace the button and add the Paystack mock text
    paystack_btn = '''<div className="flex items-center justify-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400 font-bold">Secured by Paystack</span>
                </div>
                <button 
                  type="submit" 
                  disabled={topUpLoading}
                  className="w-full bg-[#1cd188] hover:bg-emerald-400 text-slate-900 font-black py-4 rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-[#1cd188]/20 gap-2"
                >
                  {topUpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate via Paystack'}
                </button>'''
    content = re.sub(r'<button[^>]*type="submit"[^>]*>.*?Proceed to Payment.*?</button>', paystack_btn, content, flags=re.DOTALL)

# And in case the button was named something else
if 'Authenticate via Paystack' not in content:
    paystack_btn = '''<div className="flex items-center justify-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400 font-bold">Secured by Paystack</span>
                </div>
                <button 
                  type="submit" 
                  disabled={topUpLoading}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center shadow-lg gap-2"
                >
                  {topUpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay with Paystack'}
                </button>'''
    content = re.sub(r'<button\s*type="submit"[^>]*>.*?</button>', paystack_btn, content, flags=re.DOTALL | re.MULTILINE)
    
with open('frontend/src/components/hirer/HirerAccount.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
