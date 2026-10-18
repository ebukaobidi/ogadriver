import React, { useState } from 'react';
import { DollarSign, MapPin, Users, Activity, ExternalLink, ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/CurrencyManager';

export default function TerritoryFranchiseManager() {
  const [loading, setLoading] = useState(false);
  const [managerData, setManagerData] = useState({
    territoryName: 'Lagos & Southwest Operations',
    countryCode: 'NG',
    managerName: 'Admin Operations',
    managerOverrideRate: 2.50,
    metrics: {
      totalGrossVolume: 85000000,
      activeDrivers: 1450,
      monthlySubscriptions: 4200,
      managerCommissionPool: 2125000,
      pendingPayouts: 450000
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <MapPin size={250} />
        </div>
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mb-2 inline-block">
              Franchise License: Active
            </span>
            <h2 className="text-2xl font-black text-white">{managerData.territoryName}</h2>
            <p className="text-slate-400 text-sm font-mono mt-1">Managed by: {managerData.managerName} &bull; {managerData.managerOverrideRate}% Override Rate</p>
          </div>
          <button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            Withdraw Pool
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            <DollarSign className="w-5 h-5 text-brandMint mb-2" />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Territory Gross Volume</p>
            <p className="text-2xl font-black text-white mt-1">{formatCurrency(managerData.metrics.totalGrossVolume, managerData.countryCode)}</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
            <Activity className="w-5 h-5 text-amber-400 mb-2" />
            <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Your 2.5% Commission Pool</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{formatCurrency(managerData.metrics.managerCommissionPool, managerData.countryCode)}</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            <Users className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Franchise Drivers</p>
            <p className="text-2xl font-black text-white mt-1">{managerData.metrics.activeDrivers}</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            <CheckCircle2 className="w-5 h-5 text-brandMint mb-2" />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Monthly Subscriptions</p>
            <p className="text-2xl font-black text-white mt-1">{managerData.metrics.monthlySubscriptions}</p>
          </div>
        </div>
      </div>

      {/* Audit Log / Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <ArrowUpRight className="text-brandMint w-4 h-4" /> Live Territory Revenue Stream
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-500 font-mono tracking-widest">
                <th className="pb-3 font-medium">Driver</th>
                <th className="pb-3 font-medium">Transaction Type</th>
                <th className="pb-3 font-medium text-right">Gross Amount</th>
                <th className="pb-3 font-medium text-right">Your Override (2.5%)</th>
                <th className="pb-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { driver: 'Emeka O.', type: 'Premium Subscription', amt: 10000, override: 250, stat: 'Cleared' },
                { driver: 'Tunde B.', type: 'Elite Subscription', amt: 15000, override: 375, stat: 'Cleared' },
                { driver: 'Kunle A.', type: 'Standard (Daily)', amt: 300, override: 7.50, stat: 'Cleared' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 text-white font-bold">{row.driver}</td>
                  <td className="py-4 text-slate-400">{row.type}</td>
                  <td className="py-4 text-right text-slate-300 font-mono">{formatCurrency(row.amt, managerData.countryCode)}</td>
                  <td className="py-4 text-right text-brandMint font-black">{formatCurrency(row.override, managerData.countryCode)}</td>
                  <td className="py-4 text-center">
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded">
                      {row.stat}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
