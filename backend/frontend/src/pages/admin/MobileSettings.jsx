import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import AdminSidebar from '../../components/AdminSidebar';
import { Menu, Settings, CheckCircle, AlertTriangle, Award, Gift, ShieldAlert, PhoneCall } from 'lucide-react';

export default function MobileSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [config, setConfig] = useState({
    force_update: false,
    maintenance_mode: false,
    min_version: '',
    latest_version: '',
    maintenance_message: '',
    force_update_message: '',
    // OgaPoints & Rewards in mobile
    points_earn_per_100: 1,
    trip_completion_bonus_points: 50,
    max_discount_cap_percent: 20,
    min_points_to_redeem: 500,
    max_daily_points_redeem: 5000,
    // Mobile Features
    concierge_hotline: '+234 800 642 3748',
    emergency_sos_hotline: '112 / +234 800 767 9111',
    gift_funds_enabled: true,
    max_gift_transfer_daily: 50000,
  });
  const [logs, setLogs] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Assuming adminApi is configured to prefix /api/admin
      const configRes = await adminApi.get('/mobile/config');
      if (configRes.data?.data) {
        setConfig(configRes.data.data);
      }
      
      const tokensRes = await adminApi.get('/mobile/tokens');
      if (tokensRes.data?.data) {
        setTokens(tokensRes.data.data.data || []);
      }
      
      const logsRes = await adminApi.get('/mobile/logs');
      if (logsRes.data?.data) {
        setLogs(logsRes.data.data.data || []);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load mobile settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    try {
      await adminApi.put('/mobile/config', config);
      setMessage({ type: 'success', text: 'Mobile app configuration updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update config' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col lg:ml-0 h-screen overflow-hidden">
          <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            Loading mobile controls...
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
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block flex items-center gap-2">
              <Settings className="text-slate-400" size={20} /> Mobile App Controls
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            
            {message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-brandMint/10 border border-brandMint/30 text-brandMint' 
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                <span className="font-bold text-sm">{message.text}</span>
              </div>
            )}

            {/* Force Update & Maintenance Module */}
            <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Force Update & Maintenance</h2>
              <form onSubmit={handleUpdateConfig} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
                      <input 
                        type="checkbox" 
                        checked={config.force_update}
                        onChange={e => setConfig({...config, force_update: e.target.checked})}
                        className="rounded text-brandMint focus:ring-brandMint"
                      />
                      <span>Require Force Update</span>
                    </label>
                    <p className="text-xs text-slate-500 mt-1">Locks out older versions until updated.</p>
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
                      <input 
                        type="checkbox" 
                        checked={config.maintenance_mode}
                        onChange={e => setConfig({...config, maintenance_mode: e.target.checked})}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span className="text-red-400 font-bold">Maintenance Mode</span>
                    </label>
                    <p className="text-xs text-slate-500 mt-1">Safely locks all mobile app access.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400">Minimum Version</label>
                    <input 
                      type="text" 
                      value={config.min_version} 
                      onChange={e => setConfig({...config, min_version: e.target.value})}
                      className="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-white shadow-sm focus:border-brandMint focus:ring-brandMint sm:text-sm p-2 border" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400">Latest Version</label>
                    <input 
                      type="text" 
                      value={config.latest_version} 
                      onChange={e => setConfig({...config, latest_version: e.target.value})}
                      className="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-white shadow-sm focus:border-brandMint focus:ring-brandMint sm:text-sm p-2 border" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400">Force Update Message</label>
                  <textarea 
                    value={config.force_update_message}
                    onChange={e => setConfig({...config, force_update_message: e.target.value})}
                    className="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-white shadow-sm focus:border-brandMint focus:ring-brandMint sm:text-sm p-2 border" 
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400">Maintenance Message</label>
                  <textarea 
                    value={config.maintenance_message}
                    onChange={e => setConfig({...config, maintenance_message: e.target.value})}
                    className="mt-1 block w-full rounded-md border-slate-700 bg-slate-950 text-white shadow-sm focus:border-brandMint focus:ring-brandMint sm:text-sm p-2 border" 
                    rows="2"
                  />
                </div>

                {/* 🌟 OgaPoints & Rewards System (In-App Rules) */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Award size={16} className="text-emerald-400" /> OgaPoints & Rewards System Rules
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Margin Safeguard
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Balance points accrual and redemption caps against platform subscription revenue and trip margins.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Points per ₦100 Spent</label>
                      <input
                        type="number"
                        value={config.points_earn_per_100 ?? 1}
                        onChange={e => setConfig({...config, points_earn_per_100: Number(e.target.value)})}
                        className="block w-full rounded-md border-slate-700 bg-slate-950 text-white shadow-sm focus:border-brandMint sm:text-sm p-2 border font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Trip Bonus (Points)</label>
                      <input
                        type="number"
                        value={config.trip_completion_bonus_points ?? 50}
                        onChange={e => setConfig({...config, trip_completion_bonus_points: Number(e.target.value)})}
                        className="block w-full rounded-md border-slate-700 bg-slate-950 text-white shadow-sm focus:border-brandMint sm:text-sm p-2 border font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-400 mb-1">Max Discount Cap (%)</label>
                      <input
                        type="number"
                        value={config.max_discount_cap_percent ?? 20}
                        onChange={e => setConfig({...config, max_discount_cap_percent: Number(e.target.value)})}
                        className="block w-full rounded-md border-slate-700 bg-slate-950 text-amber-400 shadow-sm focus:border-amber-400 sm:text-sm p-2 border font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Min Points to Redeem</label>
                      <input
                        type="number"
                        value={config.min_points_to_redeem ?? 500}
                        onChange={e => setConfig({...config, min_points_to_redeem: Number(e.target.value)})}
                        className="block w-full rounded-md border-slate-700 bg-slate-950 text-white shadow-sm focus:border-brandMint sm:text-sm p-2 border font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Max Daily Points Redeem</label>
                      <input
                        type="number"
                        value={config.max_daily_points_redeem ?? 5000}
                        onChange={e => setConfig({...config, max_daily_points_redeem: Number(e.target.value)})}
                        className="block w-full rounded-md border-slate-700 bg-slate-950 text-white shadow-sm focus:border-brandMint sm:text-sm p-2 border font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 📞 Mobile App Support & Gift Funds */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <PhoneCall size={16} className="text-blue-400" /> Hotlines & Gift Funds Controls
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Concierge Hotline</label>
                      <input
                        type="text"
                        value={config.concierge_hotline || '+234 800 642 3748'}
                        onChange={e => setConfig({...config, concierge_hotline: e.target.value})}
                        className="block w-full rounded-md border-slate-700 bg-slate-950 text-white shadow-sm focus:border-blue-400 sm:text-sm p-2 border font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-red-400 mb-1">Emergency SOS Hotline</label>
                      <input
                        type="text"
                        value={config.emergency_sos_hotline || '112 / +234 800 767 9111'}
                        onChange={e => setConfig({...config, emergency_sos_hotline: e.target.value})}
                        className="block w-full rounded-md border-slate-700 bg-slate-950 text-red-400 shadow-sm focus:border-red-400 sm:text-sm p-2 border font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Daily Gift Funds Cap (₦)</label>
                      <input
                        type="number"
                        value={config.max_gift_transfer_daily || 50000}
                        onChange={e => setConfig({...config, max_gift_transfer_daily: Number(e.target.value)})}
                        className="block w-full rounded-md border-slate-700 bg-slate-950 text-white shadow-sm focus:border-blue-400 sm:text-sm p-2 border font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="bg-brandMint text-corporateNavy px-5 py-2.5 rounded-lg font-bold hover:bg-emerald-400 transition-colors mt-2">
                  Save Configuration
                </button>
              </form>
            </div>

            {/* Token Management */}
            <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4">FCM Device Tokens</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-950">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">FCM Token</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900 divide-y divide-slate-800">
                    {tokens.map(token => (
                      <tr key={token.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{token.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{token.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 truncate max-w-xs">{token.fcm_token}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{new Date(token.updated_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity Logs */}
            <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Mobile Security & Activity Logs</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-950">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Causer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Metadata (IP, Device, Version)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900 divide-y divide-slate-800">
                    {logs.map(log => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brandMint">{log.event}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{log.causer?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(log.properties, null, 2)}</pre>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
