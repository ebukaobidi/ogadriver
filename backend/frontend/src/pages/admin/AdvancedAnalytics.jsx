import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../api/axios';
import {
  TrendingUp,
  Users,
  CreditCard,
  Activity,
  Calendar,
  Download,
  Filter,
  BarChart3,
  LineChart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  DollarSign,
  UserCheck,
  AlertCircle
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
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

function AdvancedAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const navigate = useNavigate();

  const COLORS = ['#4ADE80', '#A855F7', '#3B82F6', '#F59E0B', '#EF4444'];

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics/advanced', {
        params: { range: timeRange }
      });

      const data = response.data;
      if (data.status === 'success') {
        setAnalyticsData(data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-slate-900 border-b border-slate-800 p-4 z-10 shrink-0">
            <h1 className="text-xl font-bold text-white">Advanced Analytics</h1>
          </header>
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-brandMint animate-spin mx-auto mb-4" />
          </main>
        </div>
      </div>
    );
  }

  const subscriptionRevenue = analyticsData?.subscription_revenue || [];
  const driverAcquisition = analyticsData?.driver_acquisition || [];
  const subscriptionDistribution = analyticsData?.subscription_distribution || [];
  const locationDistribution = analyticsData?.location_distribution || [];
  const metrics = analyticsData?.metrics || {};

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col lg:ml-0 h-screen overflow-hidden">
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">Advanced Analytics</h1>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brandMint"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button className="px-4 py-2 bg-brandMint text-corporateNavy text-sm font-bold rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-2">
              <Download size={16} /> Export Report
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">Platform Analytics</h1>
            <p className="text-slate-400">Subscription-based revenue and driver performance metrics</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-brandMint/10 flex items-center justify-center">
                  <DollarSign className="text-brandMint" size={20} />
                </div>
                {metrics.revenue_growth >= 0 ? (
                  <div className="flex items-center text-brandMint text-sm font-bold bg-brandMint/10 px-2 py-1 rounded">
                    <ArrowUpRight size={16} className="mr-1" />
                    {metrics.revenue_growth}%
                  </div>
                ) : (
                  <div className="flex items-center text-red-400 text-sm font-bold bg-red-500/10 px-2 py-1 rounded">
                    <ArrowDownRight size={16} className="mr-1" />
                    {Math.abs(metrics.revenue_growth)}%
                  </div>
                )}
              </div>
              <h3 className="text-3xl font-black text-white">₦{(metrics.monthly_revenue || 0).toLocaleString()}</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Monthly Subscription Revenue</p>
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-slate-400">Basic: <span className="text-white">₦{(metrics.basic_revenue || 0).toLocaleString()}</span></div>
                <div className="text-slate-400">Premium: <span className="text-white">₦{(metrics.premium_revenue || 0).toLocaleString()}</span></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="text-blue-400" size={20} />
                </div>
                {metrics.subscriber_growth >= 0 ? (
                  <div className="flex items-center text-brandMint text-sm font-bold bg-brandMint/10 px-2 py-1 rounded">
                    <ArrowUpRight size={16} className="mr-1" />
                    {metrics.subscriber_growth}%
                  </div>
                ) : (
                  <div className="flex items-center text-red-400 text-sm font-bold bg-red-500/10 px-2 py-1 rounded">
                    <ArrowDownRight size={16} className="mr-1" />
                    {Math.abs(metrics.subscriber_growth)}%
                  </div>
                )}
              </div>
              <h3 className="text-3xl font-black text-white">{(metrics.active_subscribers || 0).toLocaleString()}</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Active Subscribers</p>
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-slate-400">Drivers: <span className="text-blue-400">{metrics.driver_subscribers || 0}</span></div>
                <div className="text-slate-400">Employers: <span className="text-purple-400">{metrics.employer_subscribers || 0}</span></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <UserCheck className="text-purple-400" size={20} />
                </div>
                {metrics.driver_growth >= 0 ? (
                  <div className="flex items-center text-brandMint text-sm font-bold bg-brandMint/10 px-2 py-1 rounded">
                    <ArrowUpRight size={16} className="mr-1" />
                    {metrics.driver_growth}%
                  </div>
                ) : (
                  <div className="flex items-center text-red-400 text-sm font-bold bg-red-500/10 px-2 py-1 rounded">
                    <ArrowDownRight size={16} className="mr-1" />
                    {Math.abs(metrics.driver_growth)}%
                  </div>
                )}
              </div>
              <h3 className="text-3xl font-black text-white">{metrics.new_drivers || 0}</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">New Drivers This Month</p>
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-slate-400">Verified: <span className="text-brandMint">{metrics.verified_drivers || 0}</span></div>
                <div className="text-slate-400">Pending: <span className="text-amber-400">{metrics.pending_drivers || 0}</span></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Activity className="text-amber-400" size={20} />
                </div>
                {metrics.retention_change >= 0 ? (
                  <div className="flex items-center text-brandMint text-sm font-bold bg-brandMint/10 px-2 py-1 rounded">
                    <ArrowUpRight size={16} className="mr-1" />
                    {metrics.retention_change}%
                  </div>
                ) : (
                  <div className="flex items-center text-red-400 text-sm font-bold bg-red-500/10 px-2 py-1 rounded">
                    <ArrowDownRight size={16} className="mr-1" />
                    {Math.abs(metrics.retention_change)}%
                  </div>
                )}
              </div>
              <h3 className="text-3xl font-black text-white">{metrics.retention_rate || 0}%</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Retention Rate</p>
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-slate-400">Renewed: <span className="text-brandMint">{metrics.renewed || 0}</span></div>
                <div className="text-slate-400">Churned: <span className="text-red-400">{metrics.churned || 0}</span></div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Subscription Revenue Trend */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Subscription Revenue</h3>
                  <p className="text-sm text-slate-500">By plan type (in ₦)</p>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={subscriptionRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBasic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEnterprise" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="month" stroke="#475569" tick={{fill: '#94A3B8', fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" tick={{fill: '#94A3B8', fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="basic" name="Basic" stroke="#4ADE80" strokeWidth={3} fillOpacity={1} fill="url(#colorBasic)" />
                    <Area type="monotone" dataKey="premium" name="Premium" stroke="#A855F7" strokeWidth={3} fillOpacity={1} fill="url(#colorPremium)" />
                    <Area type="monotone" dataKey="enterprise" name="Enterprise" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorEnterprise)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Driver Acquisition */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Driver Acquisition</h3>
                <p className="text-sm text-slate-500">Verification outcomes by month</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={driverAcquisition} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="month" stroke="#475569" tick={{fill: '#94A3B8', fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" tick={{fill: '#94A3B8', fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#1E293B', opacity: 0.4}} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="verified" name="Verified" fill="#4ADE80" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected" name="Rejected" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Subscription Distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Subscription Distribution</h3>
                <p className="text-sm text-slate-500">Revenue by plan type</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriptionDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {subscriptionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {subscriptionDistribution.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-sm text-slate-300">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{entry.value}%</p>
                        <p className="text-xs text-slate-500">₦{(entry.amount / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Driver Location Distribution</h3>
                <p className="text-sm text-slate-500">Active drivers by city</p>
              </div>
              <div className="space-y-3">
                {locationDistribution.map((location, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-300">{location.name}</span>
                      <span className="text-sm font-bold text-white">{location.value}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-brandMint h-2 rounded-full transition-all"
                        style={{ width: `${location.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Key Performance Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="text-brandMint" size={16} />
                  <span className="text-xs font-mono text-slate-500 uppercase">Conversion Rate</span>
                </div>
                <p className="text-2xl font-bold text-white">{metrics.conversion_rate || 0}%</p>
                <p className="text-xs text-slate-500 mt-1">Visitor to subscriber</p>
              </div>
              <div className="bg-slate-950 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="text-purple-400" size={16} />
                  <span className="text-xs font-mono text-slate-500 uppercase">Avg Revenue/User</span>
                </div>
                <p className="text-2xl font-bold text-white">₦{(metrics.arpu || 0).toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Monthly ARPU</p>
              </div>
              <div className="bg-slate-950 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-blue-400" size={16} />
                  <span className="text-xs font-mono text-slate-500 uppercase">Avg Subscription</span>
                </div>
                <p className="text-2xl font-bold text-white">{metrics.avg_subscription_duration || 0} mo</p>
                <p className="text-xs text-slate-500 mt-1">Average duration</p>
              </div>
              <div className="bg-slate-950 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-amber-400" size={16} />
                  <span className="text-xs font-mono text-slate-500 uppercase">Churn Rate</span>
                </div>
                <p className="text-2xl font-bold text-white">{metrics.churn_rate || 0}%</p>
                <p className="text-xs text-slate-500 mt-1">Monthly churn</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdvancedAnalytics;
