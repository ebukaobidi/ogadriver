import re

with open('frontend/src/pages/DriverPortal.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_header = '''      {activeTab === 'profile' && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-b border-slate-800 px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setMoreSheetOpen(prev => !prev)}
            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white"
            aria-label="Profile Menu"
          >
            <MoreVertical className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center justify-center">
            <img src="/logo.svg" alt="OgaDriver" className="h-7 w-auto" />
            <span className="text-[9px] font-bold text-[#1cd188] uppercase tracking-widest mt-0.5">Profile</span>
          </div>
          <div className="flex items-center gap-2">
            <MessagingButton />
            <NotificationBell />
          </div>
        </header>
      )}'''

new_header = '''      {/* Floating Global Top Actions md:hidden */}
      <div className="md:hidden fixed top-3 left-4 right-4 z-[60] flex items-center justify-between pointer-events-none">
        <button
          onClick={() => setMoreSheetOpen(prev => !prev)}
          className="w-10 h-10 rounded-full bg-[#1e293b]/90 backdrop-blur-md border border-slate-700 flex items-center justify-center text-white pointer-events-auto shadow-lg"
          aria-label="Profile Menu"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 pointer-events-auto">
          <MessagingButton />
          <NotificationBell />
        </div>
      </div>'''

if old_header in text:
    text = text.replace(old_header, new_header)
else:
    print("Old header not found exactly.")

text = text.replace("pb-24 \", "pb-24 pt-16")

with open('frontend/src/pages/DriverPortal.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
