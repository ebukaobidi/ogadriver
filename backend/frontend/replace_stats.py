# -*- coding: utf-8 -*-
import re

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'<section className="mt-5 px-4" aria-label="Performance statistics">.*?<Zap className="h-4 w-4" />\s*Withdraw\s*(?:Instant\s*)?(?:Cash|Funds?)[^<]*</button>\s*</div>\s*</section>', re.DOTALL)

new_section = '''<section className="mt-5 px-4" aria-label="Performance statistics">
        <div className="rounded-[26px] border border-slate-800 bg-[#0f172a] p-5 shadow-lg shadow-slate-950/30">
          {earningsError ? (
            <p className="w-full text-center text-xs text-rose-300" role="alert">{earningsError}</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Earnings</p>
                <p className="text-sm sm:text-base font-black text-white">{currencySymbol}{earningsSummary ? Number(earningsSummary.total_earnings).toLocaleString() : '0'}</p>
              </div>
              <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">This Month</p>
                <p className="text-sm sm:text-base font-black text-blue-400">{currencySymbol}{earningsSummary ? Number(earningsSummary.month_earnings).toLocaleString() : '0'}</p>
              </div>
              <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Completed</p>
                <p className="text-lg font-black text-white">{driver?.total_jobs || 0}</p>
              </div>
              
              <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Job Offers</p>
                <p className="text-lg font-black text-white">{driver?.job_offers || driver?.total_jobs || 0}</p>
              </div>
              <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Acceptance</p>
                <p className="text-lg font-black text-[#1cd188]">{driver?.acceptance_rate || 100}%</p>
              </div>
              <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cancelled</p>
                <p className="text-lg font-black text-rose-400">{driver?.cancellation_rate || 0}%</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowInstantCashout(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-4 text-sm font-bold text-emerald-300 shadow-lg shadow-emerald-900/20 transition-colors hover:bg-emerald-500/15"
          >
            <Zap className="h-5 w-5" /> Withdraw Funds ({currencySymbol}{Number(driver?.wallet_balance || 0).toLocaleString()})
          </button>
        </div>
      </section>'''

if pattern.search(content):
    content = pattern.sub(new_section, content)
else:
    print("Pattern not found!")

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
