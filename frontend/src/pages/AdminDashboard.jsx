import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';
import AdminSidebar from '../components/AdminSidebar';
import {
  Users,
  Briefcase,
  DollarSign,
  ArrowUpRight,
  AlertTriangle,
  Shield,
  Radio,
  FileCheck,
  ShieldCheck,
  Menu
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [telemetry, setTelemetry] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [deploymentData, setDeploymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing Command Center...');
  
  const loadingMessages = [
    'Initializing Command Center...',
    'Authenticating Administrator...',
    'Loading System Telemetry...',
    'Fetching Financial Data...',
    'Analyzing Driver Metrics...',
    'Preparing Dashboard...'
  ];
  
  const navigate = useNavigate();

  // Chart Data
  

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Cycle through loading messages
  useEffect(() => {
    if (loading) {
      let messageIndex = 0;
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 1500); // Change message every 1.5 seconds
      
      return () => clearInterval(interval);
    }
  }, [loading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cacheKey = 'admin_dashboard_data';
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      const isCacheValid = cacheTime && (Date.now() - parseInt(cacheTime)) < 300000; // 5 minute cache
      
      if (cachedData && isCacheValid) {
        const parsedData = JSON.parse(cachedData);
        setTelemetry(parsedData.telemetry);
        setRecentActivity(parsedData.recentActivity);
        setAlerts(parsedData.alerts.filter(Boolean));
        setRevenueData(parsedData.revenueData || []);
        setDeploymentData(parsedData.deploymentData || []);
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        const dashboardData = {
          telemetry: data.data.telemetry,
          recentActivity: data.data.recentActivity,
          alerts: data.data.alerts.filter(Boolean),
          revenueData: data.data.charts?.revenueData || [],
          deploymentData: data.data.charts?.deploymentData || []
        };
        
        setTelemetry(dashboardData.telemetry);
        setRecentActivity(dashboardData.recentActivity);
        setAlerts(dashboardData.alerts);
        setRevenueData(dashboardData.revenueData);
        setDeploymentData(dashboardData.deploymentData);
        
        // Cache the data
        localStorage.setItem(cacheKey, JSON.stringify(dashboardData));
        localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };



  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm font-mono">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-slate-300">{entry.name}:</span>
              <span className="text-white font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-0 h-screen overflow-hidden">
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">Command Center Overview</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brandMint animate-pulse"></span>
                <span className="text-xs font-mono text-brandMint uppercase tracking-widest hidden sm:block">System Optimal</span>
             </div>
          </div>
        </header>
        
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="mb-6 space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border ${
                    alert.type === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                    alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                    'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  }`}
                >
                  {alert.type === 'critical' && <AlertTriangle size={20} className="shrink-0" />}
                  {alert.type === 'warning' && <AlertTriangle size={20} className="shrink-0" />}
                  {alert.type === 'info' && <Shield size={20} className="shrink-0" />}
                  <div className="flex-1">
                    <p className="font-bold text-sm">{alert.message}</p>
                  </div>
                  <span className="text-xs font-mono opacity-70">{alert.time}</span>
                </div>
              ))}
            </div>
          )}

          {/* Core Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brandMint/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="text-blue-400" size={20} />
                </div>
                <div className="flex items-center text-brandMint text-sm font-bold bg-brandMint/10 px-2 py-1 rounded">
                  <ArrowUpRight size={16} className="mr-1" />
                  {telemetry?.drivers?.growth_rate}%
                </div>
              </div>
              <h3 className="text-3xl font-black text-white">{telemetry?.drivers?.total || 0}</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Total Verified Drivers</p>
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-slate-400">Vetted: <span className="text-blue-400">{telemetry?.drivers?.verified || 0}</span></div>
                <div className="text-slate-400">Queue: <span className="text-amber-400">{telemetry?.drivers?.pending_verification || 0}</span></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brandMint/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Briefcase className="text-purple-400" size={20} />
                </div>
                <div className="flex items-center text-brandMint text-sm font-bold bg-brandMint/10 px-2 py-1 rounded">
                  <ArrowUpRight size={16} className="mr-1" />
                  {telemetry?.matchmaking?.acceptance_rate}%
                </div>
              </div>
              <h3 className="text-3xl font-black text-white">{telemetry?.matchmaking?.active_deployments || 0}</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Active Deployments</p>
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-slate-400">Accepted: <span className="text-brandMint">{telemetry?.matchmaking?.contracts_accepted || 0}</span></div>
                <div className="text-slate-400">Sent: <span className="text-white">{telemetry?.matchmaking?.proposals_sent || 0}</span></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brandMint/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-brandMint/10 flex items-center justify-center">
                  <DollarSign className="text-brandMint" size={20} />
                </div>
                <div className="flex items-center text-brandMint text-sm font-bold bg-brandMint/10 px-2 py-1 rounded">
                  <ArrowUpRight size={16} className="mr-1" />
                  {telemetry?.financials?.revenue_growth}%
                </div>
              </div>
              <h3 className="text-3xl font-black text-white">
                ₦{((telemetry?.financials?.platform_revenue_month || 0) / 1000000).toFixed(1)}M
              </h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Platform Revenue</p>
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-slate-400">Fees: <span className="text-brandMint">₦{((telemetry?.financials?.total_access_fees || 0) / 1000000).toFixed(1)}M</span></div>
                <div className="text-slate-400">Subs: <span className="text-purple-400">₦{((telemetry?.financials?.subscription_revenue || 0) / 1000000).toFixed(1)}M</span></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brandMint/30 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brandMint/5 rounded-full blur-3xl"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <Radio className="text-rose-400 animate-pulse" size={20} />
                </div>
                <div className="flex items-center text-rose-400 text-sm font-bold bg-rose-500/10 px-2 py-1 rounded">
                  Live
                </div>
              </div>
              <h3 className="text-3xl font-black text-white relative z-10">{telemetry?.system?.active_telemetry_sessions || 0}</h3>
              <p className="text-slate-500 text-sm font-medium mt-1 relative z-10">Active Telemetry Sessions</p>
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono relative z-10">
                <div className="text-slate-400">SOS Alerts: <span className="text-red-400 font-bold">{telemetry?.matchmaking?.sos_alerts || 0}</span></div>
                <div className="text-slate-400">Uptime: <span className="text-brandMint">{telemetry?.system?.uptime}%</span></div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue Trend */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Platform Revenue Trend</h3>
                  <p className="text-sm text-slate-500">Access Fees & Subscription Volume (in Millions ₦)</p>
                </div>
                <select className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brandMint">
                  <option>Last 7 Months</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="month" stroke="#475569" tick={{fill: '#94A3B8', fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" tick={{fill: '#94A3B8', fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="access_fees" name="Access Fees" stroke="#4ADE80" strokeWidth={3} fillOpacity={1} fill="url(#colorFees)" />
                    <Area type="monotone" dataKey="subscriptions" name="Subscriptions" stroke="#A855F7" strokeWidth={3} fillOpacity={1} fill="url(#colorSubs)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Deployments Bar Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Deployments</h3>
                <p className="text-sm text-slate-500">Weekly Active vs Completed</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deploymentData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="day" stroke="#475569" tick={{fill: '#94A3B8', fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" tick={{fill: '#94A3B8', fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#1E293B', opacity: 0.4}} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="active" name="Active" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" fill="#4ADE80" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* System Log */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[340px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">System Log</h3>
                <button onClick={() => navigate('/admin/security/audit')} className="text-xs font-bold uppercase tracking-wider text-brandMint hover:text-white transition-colors">Full Log</button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3 p-3 hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-slate-800">
                    <div className="mt-1">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        activity.status === 'success' ? 'bg-brandMint' :
                        activity.status === 'warning' ? 'bg-amber-400' :
                        activity.status === 'pending' ? 'bg-blue-400' :
                        'bg-slate-400'
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 leading-snug">{activity.message}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Queue Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[340px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Queue Status</h3>
                <button onClick={() => navigate('/admin/drivers/verification')} className="text-xs font-bold uppercase tracking-wider text-brandMint hover:text-white transition-colors">Manage</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                       <FileCheck className="text-amber-400" size={18} />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-300">Pending Review</span>
                      <span className="block text-xs font-mono text-slate-500 mt-0.5">Awaiting Admin</span>
                    </div>
                  </div>
                  <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded-lg">{telemetry?.drivers?.pending_verification || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brandMint/10 rounded-lg">
                       <ShieldCheck className="text-brandMint" size={18} />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-300">Cleared & Verified</span>
                      <span className="block text-xs font-mono text-slate-500 mt-0.5">Active in Directory</span>
                    </div>
                  </div>
                  <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded-lg">{telemetry?.drivers?.verified || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                       <AlertTriangle className="text-red-400" size={18} />
                    </div>
                    <div>
                       <span className="block text-sm font-bold text-slate-300">Blacklisted</span>
                       <span className="block text-xs font-mono text-slate-500 mt-0.5">Permanent Ban</span>
                    </div>
                  </div>
                  <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded-lg">{telemetry?.drivers?.blacklisted || 0}</span>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
