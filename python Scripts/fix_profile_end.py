# -*- coding: utf-8 -*-
import io

path = 'frontend/src/components/driver/DriverProfileTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

old_end = """        <InstantCashoutModal 
        isOpen={showCashoutModal} 
        onClose={() => setShowCashoutModal(false)} 
        walletBalance={walletBalance}
        onCashoutSuccess={() => {}}
      />

    </div>
  );
};

export default DriverProfileTab;"""

new_end = """        {/* Settings & Support */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-4 mb-8 shadow-lg flex flex-col gap-2">
          <button onClick={() => alert('Support module coming soon')} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900 text-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <HelpCircle size={16} />
              </div>
              <span className="font-bold text-sm">Help & Support</span>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </button>

          <button onClick={doLogout} className="w-full flex items-center justify-between p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all mt-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <Lock size={16} />
              </div>
              <span className="font-bold text-sm">Sign Out</span>
            </div>
            <ChevronRight size={16} className="opacity-50" />
          </button>
        </div>

        <InstantCashoutModal 
        isOpen={showCashoutModal} 
        onClose={() => setShowCashoutModal(false)} 
        walletBalance={walletBalance}
        onCashoutSuccess={() => {}}
      />
    </div>
  );
};

export default DriverProfileTab;"""

text = text.replace(old_end, new_end)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

