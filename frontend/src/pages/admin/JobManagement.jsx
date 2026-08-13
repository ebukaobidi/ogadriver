import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Briefcase,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Menu,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminService } from '../../api/admin';

function JobManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [recentContracts, setRecentContracts] = useState([]);
  const [jobTrendData, setJobTrendData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getJobs();
      if (response.status === 'success') {
        setMetrics(response.data.metrics);
        setRecentContracts(response.data.recentContracts);
        setJobTrendData(response.data.charts?.jobTrend || []);
      }
    } catch (err) {
      console.error('Failed to load matchmaking data:', err);
    } finally {
      setLoading(false);
    }
  };
  const chartData = jobTrendData;



  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-0 h-screen overflow-hidden">
        
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">Matchmaking Operations</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-white">Matchmaking & Contract Overview</h1>
              <p className="text-slate-400">High-level telemetry and financial metrics for all active peer-to-peer matches.</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div 
              onClick={() => navigate('/admin/jobs/active')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-brandMint hover:shadow-[0_0_20px_rgba(28,209,136,0.1)] transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-brandMint/10 rounded-xl group-hover:bg-brandMint/20 transition-colors">
                  <Briefcase className="text-brandMint" size={24} />
                </div>
                <span className="text-xs font-bold text-brandMint bg-brandMint/10 px-2 py-1 rounded uppercase tracking-wider">Live</span>
              </div>
              <div>
                <p className="text-3xl font-black text-white">{metrics?.activeContracts || 0}</p>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mt-1">Active Contracts</p>
              </div>
            </div>

            <div 
              onClick={() => navigate('/admin/jobs/completed')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                  <CheckCircle className="text-blue-400" size={24} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-white">{metrics?.completedMatches ? metrics.completedMatches.toLocaleString() : 0}</p>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mt-1">Completed Matches</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Clock className="text-amber-500" size={24} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-white">{metrics?.pendingApproval}</p>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mt-1">Pending Sign-off</p>
              </div>
            </div>

            <div 
              onClick={() => navigate('/admin/jobs/disputes')}
              className="bg-slate-900 border-l-4 border-l-red-500 border-t border-b border-r border-slate-800 rounded-r-2xl p-6 cursor-pointer hover:bg-slate-800 transition-colors group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-3 bg-red-500/20 rounded-xl animate-pulse">
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-3xl font-black text-white">{metrics?.activeDisputes}</p>
                <p className="text-sm font-bold uppercase tracking-wider text-red-500 mt-1">SOS / Disputes</p>
              </div>
            </div>
          </div>

          {/* Chart & Recent Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Main Chart */}
            <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-6 flex items-center gap-2">
                <TrendingUp size={16} className="text-brandMint" /> Contract Volume Trend
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorContracts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1cd188" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1cd188" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }}
                      itemStyle={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="matches" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMatches)" name="Completed Matches" />
                    <Area type="monotone" dataKey="active_contracts" stroke="#1cd188" strokeWidth={3} fillOpacity={1} fill="url(#colorContracts)" name="Active Contracts" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Matchmaking Activity */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">Recent Match Activity</h3>
                <button 
                  onClick={() => navigate('/admin/jobs/active')}
                  className="text-xs text-brandMint hover:text-emerald-400 font-bold uppercase tracking-wider"
                >
                  View All
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {recentContracts.map((contract) => (
                  <div key={contract.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-slate-500">{contract.id}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest flex items-center gap-1 ${
                        contract.status === 'active' ? 'bg-brandMint/10 text-brandMint border border-brandMint/20' :
                        contract.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        contract.status === 'disputed' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {contract.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-sm">{contract.employer}</span>
                      <span className="font-mono text-brandMint font-bold text-sm">{contract.amount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Op: {contract.operative}</span>
                      <span className="text-slate-500 font-mono">{contract.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default JobManagement;
