import React, { useState, useEffect } from 'react';
import { Zap, MapPin, RefreshCw, Loader2, Navigation, Flame, Mic, Radio, ShieldCheck, Shield, ShieldAlert } from 'lucide-react';
import api from '../../api/axios';
import { safeArray } from '../../utils/safeArray';

export default function SurgeMap() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [driverLoc, setDriverLoc] = useState(null);
  const [combatMode, setCombatMode] = useState(false);
  const [isRadioActive, setIsRadioActive] = useState(false);
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setDriverLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await api.get('/marketplace/surge-zones');
      const dataList = safeArray(res.data);
      if (dataList.length > 0) {
        setZones(dataList);
      } else {
        setZones([]);
      }
      setLastUpdated(new Date());
    } catch (e) {
      setZones([]);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  return (
    <div className="bg-[#0f172a] min-h-screen px-4 pt-4 pb-24 text-white animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="text-[#1cd188] w-5 h-5" /> Live Surge Radar
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => alert('SOS Triggered! Regional Command Center has been alerted with your live location.')} className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/30 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </button>
          <button onClick={fetchZones} className="w-10 h-10 rounded-xl bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center border border-white/10">
            <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && zones.length === 0 ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-[#1cd188] animate-spin" /></div>
      ) : (
        <div className="flex flex-col gap-3">
          {zones.length === 0 ? (
            <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 mt-4 text-center flex flex-col items-center justify-center shadow-lg">
              <MapPin className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-300 text-sm font-bold uppercase tracking-wider">No Active Surge Corridors</p>
              <p className="text-slate-500 text-xs mt-2 max-w-[200px] leading-relaxed">Map will automatically highlight zones when rider demand increases in your city.</p>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active High-Demand Corridors</p>
              {zones.map(zone => {
            const dist = getDistance(driverLoc?.lat, driverLoc?.lng, zone.lat, zone.lng);
            return (
              <div key={zone.id} className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start w-full">
                    <div>
                      <h3 className="font-bold text-sm text-white mb-1">{zone.name}</h3>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin size={12} className="text-[#1cd188]" /> {dist ? `${dist} km away` : 'Nearby'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${zone.demand === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {zone.demand} Demand
                    </span>
                  </div>
                </div>
                
                <div className={`px-3 py-2 rounded-xl font-black text-lg ${zone.multiplier >= 2 ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
                  {zone.multiplier}x
                </div>
              </div>

              {/* Surge Lock Feature */}
              <div className="flex items-center justify-between border-t border-slate-700/50 pt-3 mt-1 w-full">
                  <div>
                      <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                          <ShieldCheck size={12} /> Surge Lock Guarantee
                      </p>
                      <p className="text-slate-500 text-[9px] mt-0.5">Lock this {zone.multiplier}x multiplier for 15 mins</p>
                  </div>
                  <button onClick={() => alert(`Surge Locked! You now have 15 minutes to reach ${zone.name} with a guaranteed ${zone.multiplier}x multiplier.`)} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                      Lock Surge
                  </button>
              </div>

              </div>
            );
          })}</>
            )}
          </div>
        )}
      
      {/* Combat Driving Mode Overlay */}
      {combatMode && (
        <div className="fixed inset-0 bg-black/90 z-[70] flex flex-col items-center justify-center p-6 backdrop-blur-md pointer-events-auto">
          <div className="bg-red-500/20 w-40 h-40 rounded-full flex items-center justify-center border-4 border-red-500 mb-8 animate-pulse shadow-[0_0_80px_rgba(239,68,68,0.6)]">
            <Shield className="w-20 h-20 text-red-500" />
          </div>
          <h2 className="text-4xl font-black text-red-500 uppercase tracking-widest text-center mb-3 drop-shadow-md">Combat Mode Active</h2>
          <p className="text-white text-center font-mono text-base max-w-sm border border-slate-700 bg-slate-900/50 p-4 rounded-xl">Distractions blocked. You are driving above 15km/h. Focus on the road.</p>
        </div>
      )}

      {/* Combat Mode Toggle */}
      <div className="absolute top-24 right-4 z-[50]">
        <button
          onClick={() => setCombatMode(!combatMode)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all ${
            combatMode ? 'bg-red-500 border-red-400 animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Shield className={`w-6 h-6 ${combatMode ? 'text-slate-900' : ''}`} />
        </button>
      </div>

      
      {/* Oga Radio (Walkie Talkie) Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-[60] flex flex-col items-center">
        <button 
          onMouseDown={() => setIsRadioActive(true)}
          onMouseUp={() => setIsRadioActive(false)}
          onMouseLeave={() => setIsRadioActive(false)}
          onTouchStart={() => setIsRadioActive(true)}
          onTouchEnd={() => setIsRadioActive(false)}
          onClick={() => {
             alert("Voice transmission sent to Regional Command Center.");
          }}
          className={`w-16 h-16 rounded-full shadow-[0_0_20px_rgba(28,209,136,0.4)] flex items-center justify-center transition-all duration-200 border-4 border-[#0f172a] select-none ${isRadioActive ? 'bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'bg-gradient-to-br from-emerald-400 to-[#1cd188] animate-pulse active:scale-95'}`}
        >
          <Mic className={`w-6 h-6 ${isRadioActive ? 'text-white animate-bounce' : 'text-[#0f172a]'}`} />
        </button>
        <span className={`text-[9px] font-black uppercase tracking-widest mt-1 drop-shadow-md transition-colors ${isRadioActive ? 'text-red-400 animate-pulse' : 'text-[#1cd188]'}`}>
          {isRadioActive ? 'TRANSMITTING...' : 'Oga Radio'}
        </span>
      </div>
    </div>
  );
}
