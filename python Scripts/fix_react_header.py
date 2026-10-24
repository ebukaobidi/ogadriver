import re

path = 'frontend/src/components/driver/DriverSubscriptionsTab.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

header = '''        <p className="text-[#1cd188] text-xs font-bold uppercase tracking-widest mb-1">Driver Membership</p>
        <h1 className="text-white font-black text-xl mb-4">Subscription Plans</h1>'''

new_header = '''        <p className="text-[#1cd188] text-xs font-bold uppercase tracking-widest mb-1">Driver Membership</p>
        <h1 className="text-white font-black text-2xl mb-2">0% Commission Plans</h1>
        
        <div className="bg-gradient-to-r from-[#1cd188]/20 to-[#1cd188]/5 border border-[#1cd188]/30 rounded-2xl p-4 mb-6 shadow-xl relative overflow-hidden">
            <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-[#1cd188]/10" />
            <h2 className="text-[#1cd188] font-black text-lg mb-1 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Keep 100% of your earnings!
            </h2>
            <p className="text-slate-300 text-xs">
                OgaDriver does not take a cut from your trips. Simply choose a monthly plan below and enjoy total financial freedom on every ride.
            </p>
        </div>'''

text = text.replace(header, new_header)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
