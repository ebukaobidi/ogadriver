# -*- coding: utf-8 -*-
import io

path = 'frontend/src/pages/DriverPortal.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

old_block = """              {/* Quick links grid at bottom */}
              <div className="mt-6">
                <p className="text-[#1cd188] text-xs font-bold uppercase tracking-widest mb-3">Quick Links</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Job Offers', icon: Briefcase, tab: 'proposals' },
                    { label: 'Training Simulator', icon: Gamepad2, tab: 'training' },
                    { label: 'My Ratings', icon: Star, tab: 'ratings' },
                    { label: 'Referrals & Rewards', icon: Gift, tab: 'billing' },
                    { label: 'Surge Map', icon: Zap, tab: 'surge' },
                  ].map(item => (
                    <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                      className="bg-[#1e293b] border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-2">
                      <item.icon size={22} className="text-[#1cd188]" />
                      <span className="text-white text-[10px] font-semibold text-center leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>"""

text = text.replace(old_block, "")

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

