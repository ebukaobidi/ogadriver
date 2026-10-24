# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/pages/DriverPortal.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# I will replace the entire moreSheetOpen render block
old_block = r"\{moreSheetOpen && \([\s\S]*?onClick=\{\(\) => setMoreSheetOpen\(false\)\}\s*>\s*<div\s*className=\"bg-\[#0f172a\] w-full rounded-t-3xl px-6 pt-5 pb-28 border-t border-slate-800\"[\s\S]*?\}\]\.map\(item => \([\s\S]*?<\/button>\s*\)\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}"

new_block = """{moreSheetOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-[100] flex items-end"
            onClick={() => setMoreSheetOpen(false)}
          >
            <div
              className="bg-[#0f172a] w-full rounded-t-3xl px-6 pt-5 pb-28 border-t border-slate-800"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center mb-6">
                <div className="w-10 h-1 bg-slate-700 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                {[
                  { id: 'active', icon: FileCheck, label: 'Contracts' },
                  { id: 'compliance', icon: ShieldCheck, label: 'Compliance' },
                  { id: 'subscriptions', icon: CreditCard, label: 'Billing' },
                  { id: 'training', icon: BookOpen, label: 'Training' },
                  { id: 'ratings', icon: Star, label: 'Ratings' },
                  { id: 'profile', icon: User, label: 'Profile' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMoreSheetOpen(false); }}
                    className="flex flex-col items-center justify-center gap-2 active:scale-95 transition-all group"
                  >
                    <div className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all ${
                      activeTab === item.id
                        ? 'bg-[#1cd188]/20 border border-[#1cd188]/40'
                        : 'bg-[#1e293b] border border-slate-800 group-hover:border-slate-600'
                    }`}>
                      <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'text-[#1cd188]' : 'text-slate-400'}`} />
                    </div>
                    <span className={`text-[10px] font-bold ${activeTab === item.id ? 'text-[#1cd188]' : 'text-slate-400'}`}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}"""

text = re.sub(old_block, new_block, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)
