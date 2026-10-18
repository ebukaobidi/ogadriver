import React, { useState, useEffect } from 'react';
import { Navigation, Home, Briefcase, MapPin, Sliders, CheckCircle2, Power, X, Clock, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import axios from 'axios';
import MapLocationPickerModal from '../common/MapLocationPickerModal';

const DestinationModeModal = ({ isOpen, onClose, driver, onUpdateSuccess }) => {
  const [isActive, setIsActive] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('My Home');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [maxDetourKm, setMaxDetourKm] = useState(5);
  const [alongRouteOnly, setAlongRouteOnly] = useState(true);
  const [targetArrivalTime, setTargetArrivalTime] = useState('');
  const [minFare, setMinFare] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !driver?.id) return;
    const token = localStorage.getItem('auth_token');
    const apiBase = import.meta.env.VITE_API_URL || 'https://ogadriver.ng/api';

    axios.get(`${apiBase}/v1/drivers/${driver.id}/destination-mode`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.data?.data) {
        const d = res.data.data;
        setIsActive(!!d.destination_mode_active);
        if (d.destination_label) setSelectedLabel(d.destination_label);
        if (d.destination_address) setAddress(d.destination_address);
        if (d.destination_latitude) setLatitude(d.destination_latitude);
        if (d.destination_longitude) setLongitude(d.destination_longitude);
        if (d.destination_max_detour_km) setMaxDetourKm(d.destination_max_detour_km);
        if (d.along_route_only !== undefined) setAlongRouteOnly(!!d.along_route_only);
        if (d.target_arrival_time) setTargetArrivalTime(d.target_arrival_time);
        if (d.min_fare) setMinFare(d.min_fare);
      }
    })
    .catch(() => {});
  }, [isOpen, driver]);

  const savedPlaces = (() => {
    try {
      return JSON.parse(localStorage.getItem('user_saved_places') || '{}');
    } catch (e) {
      return {};
    }
  })();

  const handleSelectPreset = (presetKey, labelDefault) => {
    setSelectedLabel(labelDefault);
    if (presetKey === 'home' && savedPlaces.home?.address) {
      setAddress(savedPlaces.home.address);
      setLatitude(savedPlaces.home.latitude || null);
      setLongitude(savedPlaces.home.longitude || null);
    } else if (presetKey === 'work' && savedPlaces.work?.address) {
      setAddress(savedPlaces.work.address);
      setLatitude(savedPlaces.work.latitude || null);
      setLongitude(savedPlaces.work.longitude || null);
    }
  };

  const handleSaveDestinationMode = async (targetActiveState) => {
    if (!driver?.id) return;
    if (targetActiveState && !address) {
      setError('Please enter or select a destination address');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');
    const token = localStorage.getItem('auth_token');
    const apiBase = import.meta.env.VITE_API_URL || 'https://ogadriver.ng/api';

    try {
      const res = await axios.post(`${apiBase}/v1/drivers/${driver.id}/destination-mode`, {
        destination_mode_active: targetActiveState,
        destination_label: selectedLabel,
        destination_address: address,
        destination_latitude: latitude,
        destination_longitude: longitude,
        destination_max_detour_km: parseFloat(maxDetourKm),
        along_route_only: alongRouteOnly,
        target_arrival_time: targetArrivalTime,
        min_fare: minFare
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        setIsActive(targetActiveState);
        setMessage(res.data.message || (targetActiveState ? 'Destination mode activated' : 'Destination mode turned off'));
        if (onUpdateSuccess) onUpdateSuccess(res.data.data || { isActive: targetActiveState, label: selectedLabel, address });
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update destination mode');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f172a] border border-[#1cd188]/40 rounded-2xl max-w-md w-full p-6 relative shadow-[0_0_50px_rgba(28,209,136,0.15)] max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-[#1cd188]/20 border border-[#1cd188]/40 flex items-center justify-center text-[#1cd188] shrink-0">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-lg text-white uppercase tracking-tight">Destination Mode</h3>
            <p className="text-xs text-slate-400">Pick up passengers along your travel corridor</p>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Preset Location Chips */}
        <div className="mb-4">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-2">
            Quick Destinations
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSelectPreset('home', 'My Home')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                selectedLabel === 'My Home'
                  ? 'bg-[#1cd188]/20 border-[#1cd188] text-[#1cd188]'
                  : 'bg-slate-900/60 backdrop-blur-2xl border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Heading Home</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset('work', 'Work / Office')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                selectedLabel === 'Work / Office'
                  ? 'bg-[#1cd188]/20 border-[#1cd188] text-[#1cd188]'
                  : 'bg-slate-900/60 backdrop-blur-2xl border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>To Office</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset('custom', 'Custom Route')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                selectedLabel === 'Custom Route'
                  ? 'bg-[#1cd188]/20 border-[#1cd188] text-[#1cd188]'
                  : 'bg-slate-900/60 backdrop-blur-2xl border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Custom</span>
            </button>
          </div>
        </div>

        {/* Address Input & Map Picker Trigger */}
        <div className="mb-4">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
            End Destination ({selectedLabel})
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Victoria Island / Ikeja City Mall"
              className="flex-1 bg-slate-900/60 backdrop-blur-2xl border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1cd188]"
            />
            <button
              type="button"
              onClick={() => setIsMapPickerOpen(true)}
              className="px-3 py-2.5 bg-[#1cd188]/15 border border-[#1cd188]/40 hover:bg-[#1cd188]/30 rounded-xl text-xs font-bold text-[#1cd188] flex items-center gap-1 shrink-0 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" /> Pick Map
            </button>
          </div>
          {latitude && longitude && (
            <p className="text-[10px] text-[#1cd188] font-mono mt-1">
              ✓ Pin set: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          )}
        </div>

        {/* Detour Radius Slider */}
        <div className="mb-5 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="flex items-center gap-1 font-semibold">
              <Sliders className="w-3.5 h-3.5 text-[#1cd188]" /> Max Detour Corridor:
            </span>
            <span className="font-bold text-[#1cd188]">{maxDetourKm} km radius</span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            value={maxDetourKm}
            onChange={(e) => setMaxDetourKm(e.target.value)}
            className="w-full accent-[#1cd188] cursor-pointer"
          />
          <p className="text-[10px] text-slate-400 mt-1">Only accept trip requests within {maxDetourKm} km of your main route.</p>
        </div>

        {/* Along-Route Extra Features */}
        <div className="space-y-3 mb-6 bg-slate-900/60 backdrop-blur-2xl/70 border border-white/10 rounded-xl p-3">
          <p className="text-[#1cd188] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
            <Zap size={12} /> Along-Route Smart Filters
          </p>

          {/* Along-route only toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-white text-xs font-semibold">Strict Corridor Matching</p>
              <p className="text-slate-400 text-[10px]">Filter out passengers going off your direction</p>
            </div>
            <button
              type="button"
              onClick={() => setAlongRouteOnly(!alongRouteOnly)}
              className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                alongRouteOnly ? 'bg-[#1cd188] justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white" />
            </button>
          </div>

          {/* Target Arrival Time */}
          <div className="flex items-center justify-between py-1 border-t border-white/10 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Target Arrival Time</span>
            </div>
            <input
              type="time"
              value={targetArrivalTime}
              onChange={(e) => setTargetArrivalTime(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-[#1cd188]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {isActive && (
            <button
              type="button"
              onClick={() => handleSaveDestinationMode(false)}
              disabled={loading}
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider hover:bg-slate-700 transition-all"
            >
              Turn Off Mode
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSaveDestinationMode(true)}
            disabled={loading}
            className="flex-1 bg-[#1cd188] text-[#0f172a] font-black py-3.5 rounded-xl text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1cd188]/20"
          >
            {loading ? 'Saving Route...' : (isActive ? 'Update Destination' : 'Activate Mode')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Map Location Picker Modal */}
      <MapLocationPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialLat={latitude || 6.4531}
        initialLng={longitude || 3.4244}
        initialAddress={address}
        onConfirm={({ address: newAddr, lat, lng }) => {
          setAddress(newAddr);
          setLatitude(lat);
          setLongitude(lng);
        }}
      />
    </div>
  );
};

export default DestinationModeModal;
