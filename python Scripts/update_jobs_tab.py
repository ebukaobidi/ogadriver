# -*- coding: utf-8 -*-
import re
import io

path = 'frontend/src/components/driver/DriverProposalsTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace activeSubTab logic to include 'market'
state_pattern = r"const \[activeSubTab, setActiveSubTab\] = useState\('pending'\);"
new_state = """const [activeSubTab, setActiveSubTab] = useState('market');"""
text = re.sub(state_pattern, new_state, text)

# Modify Pill tabs
pill_pattern = r'\{\/\* Pill tabs \*\/\}[\s\S]*?<\/div>'
new_pill = """{/* Pill tabs */}
      <div className="flex bg-[#1e293b] rounded-xl p-1 mb-4">
        <button onClick={() => setActiveSubTab('market')}
          className={`flex-1 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${
            activeSubTab === 'market' ? 'bg-blue-600 text-white' : 'text-slate-500'
          }`}>
          Job Market
        </button>
        <button onClick={() => setActiveSubTab('pending')}
          className={`flex-1 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${
            activeSubTab === 'pending' ? 'bg-[#0f172a] text-white' : 'text-slate-500'
          }`}>
          Direct Offers
        </button>
        <button onClick={() => setActiveSubTab('accepted')}
          className={`flex-1 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${
            activeSubTab === 'accepted' ? 'bg-brandMint text-[#0f172a]' : 'text-slate-500'
          }`}>
          My Contracts
        </button>
      </div>"""
text = re.sub(pill_pattern, new_pill, text)

# Add Job Market Rendering logic
# We find the start of the list rendering: `{loading ? (`
# And we inject the `activeSubTab === 'market'` condition before it.
loading_pattern = r'\{loading \? \('
new_market = """{activeSubTab === 'market' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="bg-gradient-to-r from-blue-900/40 to-blue-600/10 border border-blue-500/20 rounded-2xl p-5 mb-2">
            <h3 className="font-black text-blue-400 mb-1">The Employment Hub</h3>
            <p className="text-xs text-blue-200/60 leading-relaxed">Browse available fleet vehicles for hire or apply for corporate driving contracts. verified operatives only.</p>
          </div>

          <div className="space-y-4">
            {/* Mock Job 1: Fleet Car */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl text-white">Fleet Vehicle</div>
              <h4 className="text-lg font-black text-white pr-20">2021 Toyota Corolla LE</h4>
              <p className="text-xs text-slate-400 font-mono mb-4">Lagos Island &bull; Fleet Owner: Oga Transport Ltd</p>
              
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Rental Cost</p>
                  <p className="text-brandMint font-black">₦35,000<span className="text-xs font-normal text-slate-400">/day</span></p>
                </div>
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Req. Guarantee</p>
                  <p className="text-white font-black">Level 2</p>
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all">
                Apply for Vehicle
              </button>
            </div>

            {/* Mock Job 2: Corporate Contract */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl text-slate-900">Corporate Contract</div>
              <h4 className="text-lg font-black text-white pr-24">Executive Bank Driver</h4>
              <p className="text-xs text-slate-400 font-mono mb-4">Victoria Island &bull; Zenith Holdings</p>
              
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Monthly Salary</p>
                  <p className="text-amber-400 font-black">₦180,000<span className="text-xs font-normal text-slate-400">/mo</span></p>
                </div>
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Req. Status</p>
                  <p className="text-white font-black">Has Own Car</p>
                </div>
              </div>
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all border border-slate-700">
                Apply for Contract
              </button>
            </div>
            
             {/* Mock Job 3: Private Hire */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brandMint text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl text-slate-900">Private Client</div>
              <h4 className="text-lg font-black text-white pr-20">School Run Driver</h4>
              <p className="text-xs text-slate-400 font-mono mb-4">Lekki Phase 1 &bull; Mon-Fri (Mornings Only)</p>
              
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Weekly Pay</p>
                  <p className="text-brandMint font-black">₦35,000<span className="text-xs font-normal text-slate-400">/wk</span></p>
                </div>
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Req. Status</p>
                  <p className="text-white font-black">Has Own Car</p>
                </div>
              </div>
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-brandMint font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all border border-slate-700">
                Apply for Contract
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab !== 'market' && loading ? ("""

text = re.sub(loading_pattern, new_market, text)

# Ensure the closing tags are correct for the new condition block
# We replaced `{loading ? (` with `{activeSubTab !== 'market' && loading ? (`
# The end of the block has `)}` which matches the ternary. Wait, the ternary was `{loading ? (...) : (...) }`.
# By replacing `{loading ? (` with `{activeSubTab !== 'market' && (loading ? (`, I need to fix the closing brace.
# Actually, the original was:
# `{loading ? (
#   <div ...> </div>
# ) : displayedProposals.length === 0 ? (
#   <div ...> </div>
# ) : (
#   <div ...> </div>
# )}`
# So changing `{loading ? (` to `{activeSubTab !== 'market' && ( loading ? (` means I must append `)}` at the very end of that block.
# Let's find the end of the file `</div>\n  );\n}` and replace it with `)}\n    </div>\n  );\n}`
end_pattern = r'<\/div>\s*\);\s*\}\s*$'
new_end = """)}\n    </div>\n  );\n}"""
text = re.sub(end_pattern, new_end, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

