import React, { useState, useEffect } from 'react';
import { Radio, MapPin, Car, ShieldAlert, Zap, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

const AdminFleetRadarMap = () => {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMapData = () => {
    setLoading(true);
    api.get('/admin/fleet/live-map')
      .then(res => {
        if (res.data.status === 'success') {
          setMapData(res.data.data);
        }
      })
      .catch(err => console.error('Fleet map error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-sm dark:shadow-none transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <Radio className="w-5 h-5 text-blue-500 dark:text-blue-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">Live Fleet Telemetry Radar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Real-time driver GPS tracking & emergency beacon pins</p>
          </div>
        </div>
        <button
          onClick={fetchMapData}
          className="flex items-center gap-2 text-xs font-bold text-brandMint bg-brandMint/10 border border-brandMint/30 px-3 py-1.5 rounded-xl hover:bg-brandMint/20 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Map
        </button>
      </div>

      {/* Live Radar Grid */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 relative overflow-hidden min-h-[200px] flex flex-col justify-between transition-colors duration-300">
        {/* SOS Alert Banner if active */}
        {mapData?.sos_beacons?.length > 0 && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 flex items-center gap-3 animate-pulse relative z-10">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div className="flex-1">
              <span className="font-bold text-xs uppercase">ACTIVE EMERGENCY SOS ALERTS ({mapData.sos_beacons.length})</span>
              <p className="text-[11px] text-red-600 dark:text-red-300 font-mono">{mapData.sos_beacons[0].driver_name} at {mapData.sos_beacons[0].address}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Active Drivers Online</span>
            <p className="text-2xl font-black text-brandMint font-mono">{mapData?.drivers?.length || 0}</p>
            <span className="text-[10px] text-slate-400">Tracked via mobile GPS</span>
          </div>
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Trips In Progress</span>
            <p className="text-2xl font-black text-blue-500 dark:text-blue-400 font-mono">{mapData?.active_trips?.length || 0}</p>
            <span className="text-[10px] text-slate-400">Live matched contracts</span>
          </div>
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Emergency Beacons</span>
            <p className="text-2xl font-black text-red-500 dark:text-red-400 font-mono">{mapData?.sos_beacons?.length || 0}</p>
            <span className="text-[10px] text-slate-400">Active SOS alerts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFleetRadarMap;
