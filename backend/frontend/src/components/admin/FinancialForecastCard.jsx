import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, AlertCircle, ArrowUpRight, Users, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';

const FinancialForecastCard = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/financials/forecast')
      .then(res => {
        if (res.data.status === 'success') {
          setForecast(res.data.data);
        }
      })
      .catch(err => console.error('Forecast error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandMint"></div>
      </div>
    );
  }

  if (!forecast) return null;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-brandMint/20 border border-purple-500/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-black text-xl text-white uppercase tracking-tight">MRR & Financial Forecast Engine</h3>
            <p className="text-sm text-slate-400 font-mono flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-brandMint" />
              Monthly Recurring Revenue projections at ₦5,000 / sub
            </p>
          </div>
        </div>

        {/* Core KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800/80 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Subs</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-white font-mono">{forecast.active_subscribers}</p>
          </div>
          
          <div className="bg-slate-950/80 p-5 rounded-xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-purple-400/70 uppercase tracking-wider">Current MRR</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-black text-purple-400 font-mono">₦{(forecast.mrr / 1000).toFixed(0)}K</p>
          </div>
          
          <div className="bg-slate-950/80 p-5 rounded-xl border border-brandMint/20 shadow-[0_0_15px_rgba(28,209,136,0.05)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-brandMint/70 uppercase tracking-wider">Annual Run Rate</span>
              <TrendingUp className="w-4 h-4 text-brandMint" />
            </div>
            <p className="text-3xl font-black text-brandMint font-mono">₦{(forecast.arr / 1000000).toFixed(2)}M</p>
          </div>
          
          <div className="bg-slate-950/80 p-5 rounded-xl border border-red-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-red-400/70 uppercase tracking-wider">7-Day Churn Risk</span>
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-3xl font-black text-red-400 font-mono">{forecast.churn_risk_count}</p>
            <p className="text-[10px] text-red-400/50 mt-1 uppercase font-bold">{forecast.churn_rate_pct}% of total base</p>
          </div>
        </div>
      </div>

      {/* Chart & Targets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 12-Month MRR Growth Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brandMint" />
              12-Month MRR Trajectory
            </h4>
            <span className="text-[10px] bg-brandMint/10 text-brandMint px-2 py-1 rounded-md font-mono border border-brandMint/20">
              Assumes 10% MoM Net Growth
            </span>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast.chart_data || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1CD188" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1CD188" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#1CD188', fontWeight: 'bold' }}
                  formatter={(value) => [`₦${value.toLocaleString()}`, 'Projected MRR']}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="mrr" 
                  stroke="#1CD188" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#mrrGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Short Term Goals & Churn Watch */}
        <div className="space-y-6">
          {/* Projections */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wide mb-4">Revenue Milestones</h4>
            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold">30-Day Target</span>
                <span className="text-white font-black font-mono">₦{forecast.projections?.day_30?.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold">60-Day Target</span>
                <span className="text-purple-400 font-black font-mono">₦{forecast.projections?.day_60?.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-brandMint/20 flex justify-between items-center shadow-[0_0_10px_rgba(28,209,136,0.05)]">
                <span className="text-xs text-brandMint font-bold flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> 90-Day Target
                </span>
                <span className="text-brandMint font-black font-mono">₦{forecast.projections?.day_90?.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
            </div>
          </div>

          {/* Churn Risk Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-xs font-black text-red-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Immediate Churn Risk
            </h4>
            
            {(!forecast.high_risk_drivers || forecast.high_risk_drivers.length === 0) ? (
              <div className="text-center py-4 text-xs text-slate-500 font-bold">
                No active subscriptions expiring in the next 7 days.
              </div>
            ) : (
              <div className="space-y-2">
                {forecast.high_risk_drivers.map((driver, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-slate-800">
                    <div>
                      <p className="text-xs font-bold text-white">{driver.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase">Expires {driver.expires_at}</p>
                    </div>
                    <span className="text-xs font-mono text-red-400 font-bold">-₦{driver.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialForecastCard;
