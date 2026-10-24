# -*- coding: utf-8 -*-
import re
import io

path = 'frontend/src/pages/DriverPortal.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'<nav className="fixed bottom-0 left-0 right-0 bg-\[\#0f172a\].*?<\/nav>', re.DOTALL)

new_nav = """<nav className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-800 z-50 flex items-center justify-around px-2 pb-5 pt-3">
        {/* Home */}
        <button
          onClick={() => { setActiveTab('surge'); setMoreSheetOpen(false); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'surge' && !moreSheetOpen ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'} transition-colors`}
        >
          <Zap className="w-6 h-6" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* Jobs */}
        <button
          onClick={() => { setActiveTab('proposals'); setMoreSheetOpen(false); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'proposals' && !moreSheetOpen ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'} transition-colors`}
        >
          <Briefcase className="w-6 h-6" />
          <span className="text-[10px] font-bold">Jobs</span>
        </button>

        {/* Schedule */}
        <button
          onClick={() => {
            setMoreSheetOpen(false);
            setTimeout(() => setActiveTab('schedule'), 0);
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'schedule' && !moreSheetOpen ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'} transition-colors`}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-bold">Schedule</span>
        </button>

        {/* 3 Dots Menu */}
        <button
          onClick={() => setMoreSheetOpen(prev => !prev)}
          className={`flex flex-col items-center gap-1 ${moreSheetOpen ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'} transition-colors`}
          aria-label="Menu"
        >
          <MoreVertical className="w-6 h-6" />
          <span className="text-[10px] font-bold">More</span>
        </button>
      </nav>"""

text = pattern.sub(new_nav, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

