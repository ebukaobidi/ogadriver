import React from 'react';
import { ShieldCheck, Sparkles, AlertTriangle, Moon } from 'lucide-react';

export default function VipFleetTab() {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
      <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-2 shadow-2xl">
        <ShieldCheck className="w-10 h-10 text-amber-500" />
      </div>
      <h2 className="text-2xl font-black text-white">VIP Fleet Management</h2>
      <p className="text-slate-400 text-sm max-w-xs mx-auto">
        Armored convoys, executive chauffeurs, and stealth routing.
      </p>

      {/* NDA Alert Block */}
      <div className="w-full max-w-sm bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-left">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-rose-400 font-bold text-sm mb-1">Strict KYC / NDA Required</h4>
            <p className="text-rose-400/80 text-[10px] leading-relaxed">
              Booking armored or stealth vehicles requires a digitally signed NDA and verified corporate identity document.
            </p>
            <button className="mt-3 bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl active:scale-95 transition-transform">
              Verify Identity Now
            </button>
          </div>
        </div>
      </div>

      {/* Stealth Mode Toggle */}
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="text-left">
          <h4 className="text-white font-bold text-sm flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            Stealth Mode (Hidden Route)
          </h4>
          <p className="text-slate-500 text-[10px] mt-1">Route and destination are hidden from driver until trip starts.</p>
        </div>
        <button className="w-12 h-6 rounded-full bg-slate-700 p-1 flex items-center transition-colors">
          <div className="w-4 h-4 rounded-full bg-white transition-transform translate-x-0" />
        </button>
      </div>
    </div>
  );
}
