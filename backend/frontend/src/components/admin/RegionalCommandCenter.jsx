import React, { useState, useEffect } from 'react';
import { MapPin, ShieldCheck, Car, UserCheck, Clock, FileText, CheckCircle2, ChevronRight, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import axios from 'axios';

const RegionalCommandCenter = () => {
  const [data, setData] = useState(null);
  const [selectedStateId, setSelectedStateId] = useState(25); // Default Lagos (25)
  const [loading, setLoading] = useState(true);

  const fetchRegionalData = async (stateId) => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    const apiBase = import.meta.env.VITE_API_URL || 'https://ogadriver.ng/api';

    try {
      const res = await axios.get(`${apiBase}/v1/admin/dashboard/regional?state_id=${stateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load regional dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegionalData(selectedStateId);
  }, [selectedStateId]);

  const state = data?.state;
  const metrics = data?.metrics;
  const cities = data?.cities || [];
  const pendingDocs = data?.pending_documents || [];
  const allStates = data?.all_states || [];

  return (
    <div className="space-y-6">
      {/* Territory Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brandMint/10 border border-brandMint/30 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6 text-brandMint" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">
                {state?.name || 'Regional'} State Command Center
              </h2>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-brandMint/20 text-brandMint border border-brandMint/30">
                {state?.code || 'NG'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Territory Operations Dashboard for State & Country Franchise Managers
            </p>
          </div>
        </div>

        {/* State Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-slate-400 uppercase font-bold shrink-0">Select Territory:</label>
          <select
            value={selectedStateId}
            onChange={(e) => setSelectedStateId(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:border-brandMint"
          >
            {allStates.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} State ({st.code || 'NG'})
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchRegionalData(selectedStateId)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brandMint' : ''}`} />
          </button>
        </div>
      </div>

      {/* Territory Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Total Territory Drivers</span>
            <UserCheck className="w-5 h-5 text-brandMint" />
          </div>
          <p className="text-2xl font-black text-white">{metrics?.total_drivers || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">{metrics?.verified_drivers || 0} verified & active</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Ride Fleet (With Car)</span>
            <Car className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">{metrics?.drivers_with_car || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Available for Instant Ride Bids</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Chauffeur Pool (Hire)</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{metrics?.chauffeurs_for_hire || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Available for Contract Employment</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Pending Approvals</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{metrics?.pending_documents_count || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">State documents requiring review</p>
        </div>
      </div>

      {/* City Activation & Driver Density Progress Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brandMint" /> City Driver Density & Launch Thresholds
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Target: 10 Verified Drivers per City for Auto-Activation</p>
          </div>
          <span className="text-xs font-mono text-brandMint font-bold">
            {metrics?.active_cities_count || 0} Cities Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((c) => (
            <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{c.name}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  c.is_ride_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {c.is_ride_active ? 'RIDE ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              {/* Ride Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Ride Drivers (Cars):</span>
                  <span className="font-bold text-white">{c.ride_driver_count} / 10</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-brandMint rounded-full" style={{ width: `${c.progress_ride_pct}%` }} />
                </div>
              </div>

              {/* Hire Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Hire Drivers (Chauffeurs):</span>
                  <span className="font-bold text-white">{c.hire_driver_count} / 10</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${c.progress_hire_pct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending State Document Approvals Queue */}
      {pendingDocs.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" /> Pending State Verification Queue
          </h3>

          <div className="divide-y divide-slate-800">
            {pendingDocs.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-xs">{doc.driver?.user?.name || 'Driver'}</p>
                  <p className="text-[11px] text-slate-400 uppercase font-mono">{doc.document_type} · Uploaded {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'recently'}</p>
                </div>

                <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Pending State Review
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionalCommandCenter;
