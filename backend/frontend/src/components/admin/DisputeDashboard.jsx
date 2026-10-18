import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, FileText, MessageSquare, MapPin, CheckCircle2, AlertTriangle, ShieldAlert,
  Calendar, User, Briefcase, Activity, Clock
} from 'lucide-react';
import api from '../../api/axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const dotIcon = new L.Icon({
  iconUrl: '/logo.svg', // using logo temporarily
  iconSize: [16, 16],
  className: 'bg-brandMint rounded-full p-0.5 border border-slate-900'
});

export default function DisputeDashboard({ disputeId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, [disputeId]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/jobs/disputes/${disputeId}/dashboard`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load dispute dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10">
        <Activity className="w-10 h-10 text-brandMint animate-spin mb-4" />
        <p className="text-slate-400 font-mono tracking-widest uppercase">Loading Dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">{error || 'Data missing'}</h2>
        <button onClick={onBack} className="text-brandMint hover:underline mt-4">Go Back</button>
      </div>
    );
  }

  const { dispute, job, messages, telemetry } = data;

  const getMapCenter = () => {
    if (telemetry && telemetry.length > 0) {
      return [parseFloat(telemetry[0].latitude), parseFloat(telemetry[0].longitude)];
    }
    if (job && job.pickup_latitude) {
      return [parseFloat(job.pickup_latitude), parseFloat(job.pickup_longitude)];
    }
    return [9.0820, 8.6753];
  };

  const handleResolve = async (resolution) => {
    const notes = prompt(`Enter resolution notes for ${resolution === 'approved' ? 'Hirer (Refund)' : 'Driver (Payout)'}:`);
    if (notes === null) return; // cancelled
    
    try {
      const res = await api.post(`/admin/disputes/${disputeId}/resolve`, {
        resolution,
        notes: notes || `Resolved in favor of ${resolution === 'approved' ? 'Hirer' : 'Driver'}`
      });
      if (res.data.success) {
        alert('Dispute resolved successfully');
        fetchDashboard();
      }
    } catch (err) {
      alert('Failed to resolve dispute');
    }
  };

  // Basic Geofence Anomaly Detection (distance between job pickup and last telemetry)
  let geofenceWarning = null;
  if (telemetry && telemetry.length > 0 && job && job.pickup_latitude) {
    const lastT = telemetry[0]; // ordered desc usually
    const dLat = Math.abs(parseFloat(lastT.latitude) - parseFloat(job.pickup_latitude));
    const dLng = Math.abs(parseFloat(lastT.longitude) - parseFloat(job.pickup_longitude));
    // Roughly 1 deg ~ 111km. If delta > 0.1 (approx 11km), flag anomaly
    if (dLat > 0.1 || dLng > 0.1) {
      geofenceWarning = "⚠️ GEOFENCE ANOMALY: Driver last ping was >10km from job location.";
    }
  }

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-slate-950 z-50">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            Dispute Resolution Dashboard <span className="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-xs">#{dispute.id}</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Job: {job.title} • Status: <span className="uppercase text-amber-500 font-bold">{dispute.status}</span></p>
        </div>
      </div>

      {/* 3-Pane Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Pane 1: Contract Details */}
        <div className="w-full lg:w-[25%] flex flex-col border-r border-slate-800 bg-slate-950 overflow-y-auto custom-scrollbar">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
            <h2 className="font-bold text-white flex items-center gap-2"><FileText className="w-4 h-4 text-brandMint" /> Contract Terms & Escrow</h2>
          </div>
          <div className="p-4 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider">Hirer (Employer)</h3>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <p className="font-bold text-white text-sm">{job.hirer?.user?.name || 'Unknown'}</p>
                <p className="text-xs text-slate-400">{job.hirer?.user?.phone || 'No Phone'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider">Driver (Operative)</h3>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <p className="font-bold text-white text-sm">{job.driver?.user?.name || 'Unknown'}</p>
                <p className="text-xs text-slate-400">{job.driver?.user?.phone || 'No Phone'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider">Job Terms</h3>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 text-sm">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Payment Method</span>
                  <span className="font-mono text-white capitalize">{job.payment_method || 'Direct'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Amount</span>
                  <span className="font-mono text-brandMint font-bold">{job.currency} {parseFloat(job.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Status</span>
                  <span className="font-mono text-white">{job.status}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-mono text-red-400 uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Dispute Details</h3>
              <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-sm">
                <p className="text-slate-300 italic">"{dispute.reason}"</p>
                <p className="text-xs text-slate-500 mt-2">Raised by {dispute.raised_by} on {new Date(dispute.created_at).toLocaleString()}</p>
              </div>
            </div>

            {geofenceWarning && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-500 text-xs font-bold">
                {geofenceWarning}
              </div>
            )}
            
            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <button onClick={() => handleResolve('approved')} className="w-full bg-brandMint text-corporateNavy font-bold py-2 rounded-xl text-sm hover:bg-emerald-400">Resolve in favor of Hirer</button>
              <button onClick={() => handleResolve('rejected')} className="w-full bg-slate-800 text-white font-bold py-2 rounded-xl text-sm hover:bg-slate-700">Resolve in favor of Driver</button>
            </div>
          </div>
        </div>

        {/* Pane 2: Live Chat */}
        <div className="w-full lg:w-[35%] flex flex-col border-r border-slate-800 bg-slate-900 relative">
          <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 shrink-0">
            <h2 className="font-bold text-white flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-400" /> Evidence / Comms</h2>
            <p className="text-xs text-slate-400">Chat history between parties</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950">
            {messages.length === 0 ? (
              <div className="text-center text-slate-500 mt-10 text-sm italic">No messages found between parties.</div>
            ) : (
              messages.map(msg => {
                const isHirer = msg.sender_id === job.hirer?.user_id;
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[85%] ${isHirer ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>
                    <span className="text-[10px] text-slate-500 mb-1">{isHirer ? 'Employer' : 'Operative'}</span>
                    <div className={`p-3 rounded-2xl text-sm ${isHirer ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-sm' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'}`}>
                      {msg.body}
                    </div>
                    <span className="text-[9px] text-slate-600 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Pane 3: Telemetry Map */}
        <div className="w-full lg:w-[40%] flex flex-col bg-slate-950 relative">
          <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-20 shrink-0">
            <h2 className="font-bold text-white flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-400" /> Live/Historical Telemetry</h2>
            <p className="text-xs text-slate-400">Last 50 pings during job execution</p>
          </div>
          <div className="flex-1 w-full h-full relative z-0">
            <MapContainer center={getMapCenter()} zoom={14} className="w-full h-full">
              <TileLayer
                url="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                attribution="&copy; CARTO"
              />
              {/* Draw path */}
              {telemetry && telemetry.length > 1 && (
                <Polyline 
                  positions={telemetry.map(t => [parseFloat(t.latitude), parseFloat(t.longitude)])} 
                  color="#10b981" 
                  weight={3} 
                  opacity={0.6}
                  dashArray="5, 5"
                />
              )}
              {/* Draw points */}
              {telemetry && telemetry.map((t, idx) => (
                <Marker key={t.id} position={[parseFloat(t.latitude), parseFloat(t.longitude)]} icon={dotIcon}>
                  <Popup className="custom-popup">
                    <div className="p-1">
                      <p className="font-bold text-slate-900 text-xs">Ping #{telemetry.length - idx}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{new Date(t.updated_at).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{t.address || 'GPS Coord'}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            
            {telemetry.length === 0 && (
              <div className="absolute inset-0 z-[400] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                <div className="text-center p-6 bg-slate-900 rounded-2xl border border-slate-800 max-w-sm">
                  <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-white font-bold">No Telemetry Available</p>
                  <p className="text-sm text-slate-400 mt-2">The operative's app did not report any location data during the timeframe of this contract.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
