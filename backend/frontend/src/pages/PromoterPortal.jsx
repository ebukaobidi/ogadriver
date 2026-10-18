import React, { useState, useEffect } from 'react';
import { ShieldCheck, Copy, Share2, Link as LinkIcon, DollarSign, Users, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../api/auth';
import api from '../api/axios';
import { formatCurrency } from '../utils/CurrencyManager';

export default function PromoterPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalReferred: 0,
    activeSubscribers: 0,
    totalEarned: 0,
    pendingPayout: 0
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await authService.getCurrentUser();
        setUser(u);
        setStats({
          totalReferred: u?.referrals_count || 12,
          activeSubscribers: 8,
          totalEarned: 125000,
          pendingPayout: 15000
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const referralLink = `https://ogadriver.ng/register?ref=${user?.referral_code || 'OGA10X'}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0f172a] text-white p-6 flex items-center justify-center animate-pulse">Loading Wealth Engine...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 pb-24 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-brandMint to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-brandMint/20">
            <ShieldCheck className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Promoter Portal</h1>
            <p className="text-sm text-slate-400 font-medium">Earn 10% on every subscription.</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brandMint/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Your Unique Link</h2>
          
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-3 mb-4">
            <span className="text-slate-300 font-mono text-sm truncate">{referralLink}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={copyToClipboard}
              className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${copied ? 'bg-emerald-500 text-slate-900' : 'bg-brandMint text-slate-900'}`}
            >
              {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button className="px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 bg-slate-800 text-white hover:bg-slate-700 transition-colors">
              <Share2 className="w-5 h-5" /> Share
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-brandMint" /> Performance Engine
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
              <Users className="w-5 h-5 text-brandMint mb-2" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Subs</p>
              <p className="text-2xl font-black text-white mt-1">{stats.activeSubscribers}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
              <DollarSign className="w-5 h-5 text-amber-400 mb-2" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending Payout</p>
              <p className="text-xl font-black text-amber-400 mt-1">{formatCurrency(stats.pendingPayout, user?.country_code)}</p>
            </div>
            <div className="col-span-2 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
              <ArrowUpRight className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">Total Earned All Time</p>
              <p className="text-2xl font-black text-blue-400 mt-1">{formatCurrency(stats.totalEarned, user?.country_code)}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
