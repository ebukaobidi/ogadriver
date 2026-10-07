import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Menu,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Download,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { adminService } from '../../api/admin';

function FinancialOverview() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    loadFinancialData();
  }, [timeRange]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getFinancials();
      if (response.status === 'success') {
        setFinancialData(response.data);
      }
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-brandMint">
        <DollarSign className="animate-bounce w-12 h-12 mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Calculating Ledger...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-0 h-screen overflow-hidden">
        
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block flex items-center gap-2">
              <DollarSign className="text-brandMint" size={20} /> Revenue & Ledger
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Financial Overview
              </h1>
              <p className="text-slate-400 mt-1">Monitor Subscription revenue and Financial Performance.</p>
            </div>
            <div className="flex gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint text-sm font-bold uppercase tracking-wider"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                <Download size={16} /> Export
              </button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-brandMint/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <DollarSign size={64} className="text-brandMint" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-brandMint" size={18} />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Access Revenue</span>
              </div>
              <p className="text-3xl font-black text-white">₦{((financialData?.overview?.totalRevenue || 0) / 1000000).toFixed(1)}M</p>
              <div className="flex items-center gap-1 text-xs text-brandMint mt-2 font-mono">
                <TrendingUp size={14} /> +12.5% vs last period
              </div>
            </div>



            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-400/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <TrendingUp size={64} className="text-emerald-400" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-emerald-400" size={18} />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Platform Profit</span>
              </div>
              <p className="text-3xl font-black text-brandMint">₦{((financialData?.overview?.netProfit || 0) / 1000000).toFixed(1)}M</p>
              <div className="flex items-center gap-1 text-xs text-brandMint mt-2 font-mono">
                <TrendingUp size={14} /> +18.7% Margin
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue by Tier */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6 border-b border-slate-800/50 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Access Revenue by Tier</h3>
                <PieChart className="text-slate-500" size={20} />
              </div>
              <div className="space-y-6">
                {financialData?.revenueByTier?.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300 font-bold">{item.tier}</span>
                      <span className="text-sm font-mono text-brandMint">₦{(item.amount / 1000000).toFixed(1)}M <span className="text-slate-500">({item.percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800">
                      <div 
                        className={`h-2 rounded-full ${index === 0 ? 'bg-purple-500' : index === 1 ? 'bg-blue-500' : 'bg-slate-500'}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Revenue Trend */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6 border-b border-slate-800/50 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">P&L Trajectory</h3>
                <BarChart3 className="text-slate-500" size={20} />
              </div>
              <div className="space-y-4">
                {financialData?.monthlyRevenue?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest w-8">{item.month}</span>
                    <div className="flex-1">
                      <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800 mb-1 relative overflow-hidden">
                        <div 
                          className="bg-slate-700 h-1.5 rounded-full absolute top-0 left-0"
                          style={{ width: `${(item.expenses / 6200000) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-brandMint h-1.5 rounded-full absolute top-0 left-0"
                          style={{ width: `${(item.profit / 6200000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-brandMint font-mono w-16 justify-end">
                      +₦{(item.profit / 1000000).toFixed(1)}M
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800/50 pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Ledger Activity</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-800">
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trx ID</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Vector</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {financialData?.recentTransactions?.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 font-mono text-xs text-slate-400">{transaction.id}</td>
                      <td className="py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          transaction.type === 'Access Fee' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                          transaction.type === 'Platform Fee' ? 'text-brandMint bg-brandMint/10 border-brandMint/20' :
                          'text-amber-500 bg-amber-500/10 border-amber-500/20'
                        }`}>
                          {transaction.type === 'Access Fee' ? <CreditCard size={12} /> :
                           transaction.type === 'Platform Fee' ? <ArrowUpRight size={12} /> :
                           <ShieldCheck size={12} />}
                          <span>{transaction.type}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-slate-300">{transaction.description}</td>
                      <td className="py-4 text-sm font-mono text-white">₦{transaction.amount.toLocaleString()}</td>
                      <td className="py-4 text-xs text-slate-500 font-mono">{transaction.date}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          transaction.status === 'completed' ? 'text-brandMint bg-brandMint/10 border-brandMint/20' :
                          'text-blue-400 bg-blue-500/10 border-blue-500/20'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default FinancialOverview;
