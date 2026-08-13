import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  Zap,
  Globe,
  Shield,
  Users,
  Timer
} from 'lucide-react';
import api from '../../api/axios';

function SystemHealth() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadHealthData();
    const interval = setInterval(loadHealthData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadHealthData = async () => {
    try {
      if (!loading) setRefreshing(true);
      const response = await api.get('/admin/system/health');

      if (response.data.success) {
        setHealthData(response.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to load health data:', err);
      setHealthData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      healthy: 'text-brandMint bg-brandMint/10 border-brandMint/30',
      warning: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      critical: 'text-red-400 bg-red-500/10 border-red-500/30',
      unknown: 'text-slate-400 bg-slate-500/10 border-slate-500/30'
    };
    return colors[status] || colors.unknown;
  };

  const getStatusIcon = (status) => {
    if (status === 'healthy') return <CheckCircle size={16} className="text-brandMint" />;
    if (status === 'warning') return <AlertTriangle size={16} className="text-amber-400" />;
    if (status === 'critical') return <XCircle size={16} className="text-red-400" />;
    return <Clock size={16} className="text-slate-400" />;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-brandMint';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-slate-900 border-b border-slate-800 p-4 z-10 shrink-0">
            <h1 className="text-xl font-bold text-white">System Health Monitoring</h1>
          </header>
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-brandMint animate-spin mx-auto mb-4" />
          </main>
        </div>
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
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">System Health Monitoring</h1>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-xs text-slate-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={loadHealthData}
              disabled={refreshing}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">System Overview</h1>
            <p className="text-slate-400">Real-time monitoring of system performance and infrastructure health.</p>
          </div>

          {/* Overall Status */}
          {healthData && (
            <div className={`mb-6 p-6 rounded-2xl border ${getStatusColor(healthData.overall_status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(healthData.overall_status)}
                  <div>
                    <h2 className="text-xl font-bold text-white">System Status: {healthData.overall_status?.toUpperCase()}</h2>
                    <p className="text-sm text-slate-400">{healthData.status_message || 'All systems operational'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-white">{healthData.uptime || '99.9'}%</p>
                  <p className="text-xs text-slate-500">Uptime</p>
                </div>
              </div>
            </div>
          )}

          {/* Server Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-brandMint/10 rounded-xl"><Cpu className="text-brandMint" size={24} /></div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${getStatusColor(healthData?.cpu_status)}`}>
                  {healthData?.cpu_status || 'unknown'}
                </span>
              </div>
              <h3 className="text-3xl font-black text-white">{healthData?.cpu_usage || 0}%</h3>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">CPU Usage</p>
              <div className="mt-4 w-full bg-slate-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressColor(healthData?.cpu_usage || 0)}`}
                  style={{ width: `${healthData?.cpu_usage || 0}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl"><Cpu className="text-blue-400" size={24} /></div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${getStatusColor(healthData?.memory_status)}`}>
                  {healthData?.memory_status || 'unknown'}
                </span>
              </div>
              <h3 className="text-3xl font-black text-white">{healthData?.memory_usage || 0}%</h3>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Memory Usage</p>
              <div className="mt-4 w-full bg-slate-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressColor(healthData?.memory_usage || 0)}`}
                  style={{ width: `${healthData?.memory_usage || 0}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl"><HardDrive className="text-purple-400" size={24} /></div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${getStatusColor(healthData?.disk_status)}`}>
                  {healthData?.disk_status || 'unknown'}
                </span>
              </div>
              <h3 className="text-3xl font-black text-white">{healthData?.disk_usage || 0}%</h3>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Disk Usage</p>
              <div className="mt-4 w-full bg-slate-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressColor(healthData?.disk_usage || 0)}`}
                  style={{ width: `${healthData?.disk_usage || 0}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl"><Activity className="text-amber-400" size={24} /></div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${getStatusColor(healthData?.network_status)}`}>
                  {healthData?.network_status || 'unknown'}
                </span>
              </div>
              <h3 className="text-3xl font-black text-white">{healthData?.network_latency || 0}ms</h3>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Network Latency</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <Wifi size={12} />
                <span>{healthData?.network_status || 'Checking...'}</span>
              </div>
            </div>
          </div>

          {/* Service Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Service Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthData?.services?.map((service, index) => (
                <div key={index} className="bg-slate-950 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Server size={20} className="text-slate-400" />
                    <div>
                      <p className="font-bold text-white">{service.name}</p>
                      <p className="text-xs text-slate-500">{service.port ? `Port ${service.port}` : 'System Service'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="col-span-full text-center py-8">
                  <Server className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 font-mono text-sm">No service data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Database Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Database size={20} className="text-brandMint" />
                Database Health
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Connection Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(healthData?.database?.status)}
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${getStatusColor(healthData?.database?.status)}`}>
                      {healthData?.database?.status || 'unknown'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active Connections</span>
                  <span className="font-bold text-white">{healthData?.database?.connections || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Query Latency</span>
                  <span className="font-bold text-white">{healthData?.database?.latency || 0}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Database Size</span>
                  <span className="font-bold text-white">{healthData?.database?.size || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Globe size={20} className="text-blue-400" />
                API Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Response Time</span>
                  <span className="font-bold text-white">{healthData?.api?.response_time || 0}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Requests/Min</span>
                  <span className="font-bold text-white">{healthData?.api?.requests_per_min || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Error Rate</span>
                  <span className="font-bold text-white">{healthData?.api?.error_rate || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(healthData?.api?.status)}
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${getStatusColor(healthData?.api?.status)}`}>
                      {healthData?.api?.status || 'unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-400" />
              Recent Alerts
            </h3>
            <div className="space-y-3">
              {healthData?.alerts?.map((alert, index) => (
                <div key={index} className={`p-4 rounded-xl border ${getStatusColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-white">{alert.title}</p>
                      <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-brandMint mx-auto mb-3" />
                  <p className="text-slate-500 font-mono text-sm">No active alerts</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SystemHealth;
