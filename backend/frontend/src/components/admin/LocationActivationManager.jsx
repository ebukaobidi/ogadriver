import React, { useState, useEffect } from 'react';
import { MapPin, Car, UserCheck, ShieldCheck, CheckCircle2, XCircle, RefreshCw, Zap, Sliders, ToggleLeft, ToggleRight } from 'lucide-react';
import axios from 'axios';

const LocationActivationManager = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    const apiBase = import.meta.env.VITE_API_URL || 'https://ogadriver.ng/api';

    try {
      const res = await axios.get(`${apiBase}/v1/admin/launch-zones/report`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Error loading location activation report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleToggleActivation = async (stateId, cityId, serviceType, currentStatus) => {
    const token = localStorage.getItem('auth_token');
    const apiBase = import.meta.env.VITE_API_URL || 'https://ogadriver.ng/api';

    try {
      const res = await axios.post(`${apiBase}/v1/admin/launch-zones/toggle`, {
        state_id: stateId,
        city_id: cityId || null,
        service_type: serviceType,
        status: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        setActionMessage(`Updated activation for ${serviceType.toUpperCase()} mode.`);
        fetchReport();
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      alert('Failed to update location activation.');
    }
  };

  const locations = reportData?.locations || [];

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterMode === 'ride') return loc.is_ride_active;
    if (filterMode === 'hire') return loc.is_hire_active;
    if (filterMode === 'inactive') return !loc.is_ride_active && !loc.is_hire_active;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-6 h-6 text-brandMint" />
            <h2 className="text-xl font-black text-white">Location & Route Activation Manager</h2>
          </div>
          <p className="text-xs text-slate-400">
            Control market launch zones for <b>Instant Ride Bids</b> and <b>Driver Hire / Employment</b> independently.
          </p>
        </div>

        <button
          onClick={fetchReport}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brandMint' : ''}`} />
          Sync Driver Density
        </button>
      </div>

      {actionMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">Active Ride Zones</span>
            <Car className="w-5 h-5 text-brandMint" />
          </div>
          <p className="text-2xl font-black text-white">{reportData?.total_states_active_ride || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Expressways & Ride Bids Enabled</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">Active Driver Hire Zones</span>
            <UserCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">{reportData?.total_states_active_hire || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Chauffeurs & Employment Enabled</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">Auto-Threshold Rule</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">≥ 10 Drivers</p>
          <p className="text-[11px] text-slate-500 mt-1">Density required for auto-launch</p>
        </div>
      </div>

      {/* Table & Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search city or state..."
            className="w-full sm:w-64 bg-slate-950 border border-slate-800 text-white text-xs px-4 py-2.5 rounded-xl placeholder-slate-500 focus:outline-none focus:border-brandMint"
          />

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {['all', 'ride', 'hire', 'inactive'].map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  filterMode === mode
                    ? 'bg-brandMint text-slate-950 border-brandMint'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {mode === 'all' && 'All Locations'}
                {mode === 'ride' && 'Ride Active'}
                {mode === 'hire' && 'Hire Active'}
                {mode === 'inactive' && 'Inactive'}
              </button>
            ))}
          </div>
        </div>

        {/* Location Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-4">Location Name</th>
                <th className="py-3 px-4">Ride Drivers (With Car)</th>
                <th className="py-3 px-4">Hire Drivers (Chauffeurs)</th>
                <th className="py-3 px-4">Instant Rides Status</th>
                <th className="py-3 px-4">Driver Hire Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brandMint shrink-0" />
                      <span>{loc.name}</span>
                      {loc.manual_override && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Manual
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-300">
                      <span className={`px-2 py-0.5 rounded ${loc.ride_driver_count >= 10 ? 'bg-emerald-500/10 text-emerald-400 font-black' : 'text-slate-400'}`}>
                        {loc.ride_driver_count} drivers
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-300">
                      <span className={`px-2 py-0.5 rounded ${loc.hire_driver_count >= 10 ? 'bg-cyan-500/10 text-cyan-400 font-black' : 'text-slate-400'}`}>
                        {loc.hire_driver_count} drivers
                      </span>
                    </td>

                    {/* Ride Activation Switch */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActivation(loc.state_id, loc.city_id, 'ride', loc.is_ride_active)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          loc.is_ride_active
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {loc.is_ride_active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>RIDE ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-500" />
                            <span>INACTIVE</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Hire Activation Switch */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActivation(loc.state_id, loc.city_id, 'hire', loc.is_hire_active)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          loc.is_hire_active
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {loc.is_hire_active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>HIRE ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-500" />
                            <span>INACTIVE</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 text-xs">
                    No locations found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LocationActivationManager;
