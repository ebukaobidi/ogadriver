import React, { useState } from 'react';
import { Car, Users, Award, ShieldCheck } from 'lucide-react';
import MobileRideBooking from '../components/hirer/MobileRideBooking';
import MobileHireDirectory from '../components/hirer/MobileHireDirectory';
import HirerAccount from '../components/hirer/HirerAccount';
import VipFleetTab from '../components/hirer/VipFleetTab';

const NAV = [
  { id: 'ride', icon: Car, label: 'Ride' },
  { id: 'hire', icon: Users, label: 'Hire' },
  { id: 'vip', icon: Award, label: 'VIP Fleet' },
  { id: 'account', icon: ShieldCheck, label: 'Account' },
];

export default function HirerPortal() {
  const [activeTab, setActiveTabState] = useState(() => {
    const saved = localStorage.getItem('ogadriver_hirer_active_tab');
    return NAV.some((n) => n.id === saved) ? saved : 'ride';
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('ogadriver_hirer_active_tab', tab);
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1e1b4b] text-white flex flex-col pb-28">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <span className="text-[#1cd188]/60 text-[10px] font-mono uppercase tracking-[0.3em] block mb-1">OGADRIVERS</span>
        <h1 className="text-white text-2xl font-black tracking-tight">Hirer Portal</h1>
      </div>

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'ride' && <MobileRideBooking />}
        {activeTab === 'hire' && <MobileHireDirectory />}
        {activeTab === 'vip' && <VipFleetTab />}
        {activeTab === 'account' && <HirerAccount />}
      </main>

      {/* Floating glass bottom nav (matches Driver portal) */}
      <nav className="fixed bottom-6 left-4 right-4 bg-[#0a0f1a]/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl z-50 flex items-center justify-around px-2 py-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 min-w-0 flex-1 transition-colors ${
                isActive ? 'text-[#1cd188]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-bold truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
