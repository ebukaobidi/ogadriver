
# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/DriverProfileTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. ADD REFERRAL CARD
referral_card = """
          {/* Referral & Earnings Card */}
          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#1cd188]/30 rounded-2xl p-5 mb-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Gift size={80} className="text-[#1cd188]" />
            </div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[#1cd188] text-[10px] font-bold uppercase tracking-widest mb-1">Operative Growth</p>
                <h3 className="text-white text-lg font-black mb-1">Referral Earnings</h3>
                <p className="text-slate-400 text-xs w-4/5 leading-relaxed">Invite other drivers to OgaDriver and earn ₦5,000 for every verified activation.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-5 relative z-10">
              <div className="bg-[#0f172a]/50 rounded-xl p-3 border border-slate-800">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Total Referred</span>
                <p className="text-xl font-black text-white mt-1">{(driver?.referrals_count || 0)}</p>
              </div>
              <div className="bg-[#0f172a]/50 rounded-xl p-3 border border-slate-800">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Bonus Earned</span>
                <p className="text-xl font-black text-[#1cd188] mt-1">₦{((driver?.referrals_count || 0) * 5000).toLocaleString()}</p>
              </div>
            </div>
            <button className="w-full mt-4 py-3 bg-[#1cd188]/10 text-[#1cd188] border border-[#1cd188]/30 rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 relative z-10">
              <Gift size={16} /> Share & Invite Link
            </button>
          </div>
"""

# Insert right after the Profile Completion Bar
old_completion = r"(<div className=\"h-full bg-gradient-to-r from-\[#1cd188\] to-\[#99f6e4\] rounded-full transition-all duration-500\" style={{width: `\$\{verificationProgress \|\| 0\}%`}} \/>\s*<\/div>\s*<\/div>)"
text = re.sub(old_completion, r"\1\n" + referral_card, text)

# 2. ADD PREFERENCES TOGGLES
prefs_toggles = """
          {/* Operative Preferences (Biometrics, Interstate, Accommodation) */}
          <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl relative overflow-hidden">
            <p className="text-[#1cd188] text-[10px] font-bold uppercase tracking-widest mb-4">Operative Preferences</p>
            <div className="flex flex-col gap-3">
              
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-[#1cd188] transition-colors">
                    <User size={14} />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold">Biometric Login</h4>
                    <p className="text-slate-500 text-[10px]">Enable Face ID or Fingerprint</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={prefs.biometric_login} 
                  onChange={() => handlePrefToggle('biometric_login')} 
                  className="w-5 h-5 rounded border-slate-600 text-[#1cd188] focus:ring-[#1cd188] bg-slate-800" 
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-[#1cd188] transition-colors">
                    <Car size={14} />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold">Interstate Available</h4>
                    <p className="text-slate-500 text-[10px]">Open to long-distance out-of-state trips</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={prefs.availableForInterstate} 
                  onChange={() => handlePrefToggle('availableForInterstate')} 
                  className="w-5 h-5 rounded border-slate-600 text-[#1cd188] focus:ring-[#1cd188] bg-slate-800" 
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-[#1cd188] transition-colors">
                    <Star size={14} />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold">Accommodation Needed</h4>
                    <p className="text-slate-500 text-[10px]">Require employer to provide housing</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={prefs.openToAccommodation} 
                  onChange={() => handlePrefToggle('openToAccommodation')} 
                  className="w-5 h-5 rounded border-slate-600 text-[#1cd188] focus:ring-[#1cd188] bg-slate-800" 
                />
              </label>

            </div>
          </div>
"""

# Insert right after the Status Selection Block
old_status_block = r"(<p className=\"text-amber-400 text-\[10px\] font-bold mt-2 flex items-center gap-1 bg-amber-500/10 p-2 rounded-lg\">\s*<AlertTriangle size=\{12\} \/> Pending Guarantor Verification. Profile Hidden from Fleets.\s*<\/p>\s*<\/div>\s*\)\}\s*<\/button>\s*<\/div>\s*<\/div>)"

text = re.sub(old_status_block, r"\1\n" + prefs_toggles, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)
