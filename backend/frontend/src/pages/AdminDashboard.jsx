import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';
import api from '../api/axios';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
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

import { useNotifications } from '../components/NotificationSystem';
import AdminFleetRadarMap from '../components/admin/AdminFleetRadarMap';
import BatchPayoutManager from '../components/admin/BatchPayoutManager';
import FinancialForecastCard from '../components/admin/FinancialForecastCard';
import AiGuarantorCallMonitor from '../components/admin/AiGuarantorCallMonitor';
import ServerControlTerminal from '../components/admin/ServerControlTerminal';
import AdminEmergencySwitchboard from '../components/admin/AdminEmergencySwitchboard';


const formatCurrency = (amount, currencyCode = 'NGN') => {
  const code = currencyCode.toUpperCase();
  let symbol = '₦';
  if (code === 'GHS') symbol = 'GH₵';
  if (code === 'KES') symbol = 'KSh';
  if (code === 'ZAR') symbol = 'R';
  if (code === 'USD') symbol = '$';
  return `${symbol}${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
};

function AdminDashboard() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (localStorage.getItem('login_success_toast') === 'true') {
      localStorage.removeItem('login_success_toast');
      addNotification({
        title: 'Welcome Back!',
        message: 'You have successfully logged in to your administrator dashboard.',
        type: 'success',
      });
    }
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [telemetry, setTelemetry] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [deploymentData, setDeploymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/admin/dashboard/overview');
      const data = response.data;
      
      if (data?.status === 'success' && data?.data) {
        setTelemetry(data.data.telemetry || null);
        setRecentActivity(data.data.recentActivity || []);
        setAlerts((data.data.alerts || []).filter(Boolean));
        setRevenueData(data.data.charts?.revenueData || []);
        setDeploymentData(data.data.charts?.deploymentData || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-xl font-sans">
          <p className="text-slate-900 dark:text-white font-bold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm font-mono">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-slate-600 dark:text-slate-300">{entry.name}:</span>
              <span className="text-slate-900 dark:text-white font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-300 transition-colors duration-300">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-0 h-screen overflow-hidden">
        <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="mb-6 space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border ${
                    alert.type === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' :
                    alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' :
                    'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
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

          {/* Operational Control Switchboard */}
          <AdminEmergencySwitchboard />

          {/* Live Telemetry Radar */}
          <AdminFleetRadarMap />

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 mb-6">
            
            {/* Total Platform Users */}
            <div
              onClick={() => navigate('/admin/users')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-brandMint/40 hover:shadow-lg hover:shadow-brandMint/5 transition-all cursor-pointer group transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                  <Users className="text-teal-500 dark:text-teal-400" size={18} />
                </div>
                <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-1 rounded uppercase tracking-wider">Users →</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{telemetry?.users?.total || 0}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Total Users</p>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-slate-500 dark:text-slate-400">Active: <span className="text-teal-600 dark:text-teal-400 font-bold">{telemetry?.users?.active || 0}</span></div>
                <div className="text-slate-500 dark:text-slate-400">Pending: <span className="text-amber-500 font-bold">{telemetry?.users?.pending || 0}</span></div>
              </div>
            </div>

            {/* Total Drivers */}
            <div
              onClick={() => navigate('/admin/drivers/list')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-brandMint/40 hover:shadow-lg hover:shadow-brandMint/5 transition-all cursor-pointer group transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Users className="text-blue-500 dark:text-blue-400" size={18} />
                </div>
                <div className="flex items-center text-brandMint text-sm font-bold bg-brandMint/10 px-2 py-1 rounded">
                  <ArrowUpRight size={14} className="mr-1" />
                  {telemetry?.drivers?.growth_rate}%
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{telemetry?.drivers?.total || 0}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Total Drivers</p>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-slate-500 dark:text-slate-400">Vetted: <span className="text-blue-600 dark:text-blue-400 font-bold">{telemetry?.drivers?.verified || 0}</span></div>
                <div className="text-slate-500 dark:text-slate-400">Queue: <span className="text-amber-500 font-bold">{telemetry?.drivers?.pending_verification || 0}</span></div>
              </div>
            </div>

            {/* Active Deployments */}
            <div
              onClick={() => navigate('/admin/jobs/active')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-brandMint/40 hover:shadow-lg hover:shadow-brandMint/5 transition-all cursor-pointer group transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Briefcase className="text-purple-500 dark:text-purple-400" size={18} />
                </div>
                <div className="flex items-center text-brandMint text-sm font-bold bg-brandMint/10 px-2 py-1 rounded">
                  <ArrowUpRight size={14} className="mr-1" />
                  {telemetry?.matchmaking?.acceptance_rate}%
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{telemetry?.matchmaking?.active_deployments || 0}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Active Deployments</p>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-slate-500 dark:text-slate-400">Accepted: <span className="text-brandMint font-bold">{telemetry?.matchmaking?.contracts_accepted || 0}</span></div>
                <div className="text-slate-500 dark:text-slate-400">Sent: <span className="text-slate-900 dark:text-white font-bold">{telemetry?.matchmaking?.proposals_sent || 0}</span></div>
              </div>
            </div>

            {/* Platform Revenue */}
            <div
              onClick={() => navigate('/admin/financials/overview')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-brandMint/40 hover:shadow-lg hover:shadow-brandMint/5 transition-all cursor-pointer group transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-brandMint/10 flex items-center justify-center group-hover:bg-brandMint/20 transition-colors">
                  <DollarSign className="text-brandMint" size={18} />
                </div>
                <div className="flex items-center text-brandMint text-sm font-bold bg-brandMint/10 px-2 py-1 rounded">
                  <ArrowUpRight size={14} className="mr-1" />
                  {telemetry?.financials?.revenue_growth}%
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {formatCurrency(((telemetry?.financials?.platform_revenue_month || 0) / 1000000))}M
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Platform Revenue</p>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-slate-500 dark:text-slate-400">Fees: <span className="text-brandMint font-bold">{formatCurrency(((telemetry?.financials?.total_access_fees || 0) / 1000000))}M</span></div>
                <div className="text-slate-500 dark:text-slate-400">Subs: <span className="text-purple-500 dark:text-purple-400 font-bold">{formatCurrency(((telemetry?.financials?.subscription_revenue || 0) / 1000000))}M</span></div>
              </div>
            </div>

            {/* Telemetry Sessions */}
            <div
              onClick={() => navigate('/admin/telemetry/radar')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-brandMint/40 hover:shadow-lg hover:shadow-brandMint/5 transition-all cursor-pointer group transform hover:-translate-y-0.5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brandMint/5 rounded-full blur-3xl"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                  <Radio className="text-rose-500 dark:text-rose-400 animate-pulse" size={18} />
                </div>
                <div className="flex items-center text-rose-500 dark:text-rose-400 text-sm font-bold bg-rose-500/10 px-2 py-1 rounded">
                  Live Radar →
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white relative z-10">{telemetry?.system?.active_telemetry_sessions || 0}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 relative z-10">Active Telemetry Sessions</p>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono relative z-10">
                <div className="text-slate-500 dark:text-slate-400">SOS: <span className="text-red-500 dark:text-red-400 font-bold">{telemetry?.matchmaking?.sos_alerts || 0}</span></div>
                <div className="text-slate-500 dark:text-slate-400">Uptime: <span className="text-brandMint font-bold">{telemetry?.system?.uptime}%</span></div>
              </div>
            </div>
          </div>

          {/* Platform Revenue Trend & Deployments Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue Trend */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Platform Revenue Trend</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Access Fees & Subscription Volume (in Millions ₦)</p>
                </div>
                <select className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brandMint">
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} vertical={false} />
                    <XAxis dataKey="month" stroke="#94A3B8" tick={{fill: '#64748B', fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" tick={{fill: '#64748B', fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="access_fees" name="Access Fees" stroke="#4ADE80" strokeWidth={3} fillOpacity={1} fill="url(#colorFees)" />
                    <Area type="monotone" dataKey="subscriptions" name="Subscriptions" stroke="#A855F7" strokeWidth={3} fillOpacity={1} fill="url(#colorSubs)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Deployments Bar Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Deployments</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Weekly Active vs Completed</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deploymentData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} vertical={false} />
                    <XAxis dataKey="day" stroke="#94A3B8" tick={{fill: '#64748B', fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" tick={{fill: '#64748B', fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="active" name="Active" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" fill="#4ADE80" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 3-IN-ONE LINE SECTION (Batch Payouts, AI Guarantor Calls & Server Terminal) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <BatchPayoutManager />
            <AiGuarantorCallMonitor />
            <ServerControlTerminal />
          </div>

          {/* Financial Forecast Engine Card */}
          <FinancialForecastCard />

          {/* System Log & Verification Queue Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* System Log */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none flex flex-col h-[340px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">System Activity Log</h3>
                <button onClick={() => navigate('/admin/security/audit')} className="text-xs font-bold uppercase tracking-wider text-brandMint hover:underline transition-colors">Full Log</button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors border border-slate-200 dark:border-slate-800">
                    <div className="mt-1">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        activity.status === 'success' ? 'bg-brandMint' :
                        activity.status === 'warning' ? 'bg-amber-400' :
                        activity.status === 'pending' ? 'bg-blue-400' :
                        'bg-slate-400'
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{activity.message}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Queue Status */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none flex flex-col h-[340px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Queue Status</h3>
                <button onClick={() => navigate('/admin/drivers/verification')} className="text-xs font-bold uppercase tracking-wider text-brandMint hover:underline transition-colors">Manage Queue</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                       <FileCheck className="text-amber-500" size={18} />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-800 dark:text-slate-300">Pending Review</span>
                      <span className="block text-xs font-mono text-slate-400 mt-0.5">Unverified Accounts</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-lg">{telemetry?.users?.pending || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brandMint/10 rounded-lg">
                       <ShieldCheck className="text-brandMint" size={18} />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-800 dark:text-slate-300">Cleared & Verified</span>
                      <span className="block text-xs font-mono text-slate-400 mt-0.5">Active in Directory</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-lg">{telemetry?.drivers?.verified || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                       <AlertTriangle className="text-red-500" size={18} />
                    </div>
                    <div>
                       <span className="block text-sm font-bold text-slate-800 dark:text-slate-300">Blacklisted</span>
                       <span className="block text-xs font-mono text-slate-400 mt-0.5">Permanent Ban</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-lg">{telemetry?.drivers?.blacklisted || 0}</span>
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
