import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Power, Sliders, Edit3, Compass } from 'lucide-react';
import axios from 'axios';
import DestinationModeModal from './DestinationModeModal';

const DestinationModeCard = ({ driver, user }) => {
  const [isActive, setIsActive] = useState(false);
  const [destinationData, setDestinationData] = useState({
    label: 'My Home',
    address: '',
    maxDetourKm: 5,
    alongRouteOnly: true
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch initial destination mode status
  useEffect(() => {
    if (!driver?.id) return;
    const token = localStorage.getItem('auth_token');
    const apiBase = import.meta.env.VITE_API_URL || 'https://ogadriver.ng/api';

    axios.get(`${apiBase}/v1/drivers/${driver.id}/destination-mode`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.data?.data) {
        const d = res.data.data;
        setIsActive(!!d.destination_mode_active);
        setDestinationData({
          label: d.destination_label || 'My Home',
          address: d.destination_address || '',
          maxDetourKm: d.destination_max_detour_km || 5,
          alongRouteOnly: d.along_route_only !== undefined ? !!d.along_route_only : true
        });
      }
    })
    .catch(() => {});
  }, [driver]);

  const handleModalUpdateSuccess = (updated) => {
    if (updated) {
      setIsActive(updated.isActive);
      setDestinationData(prev => ({
        ...prev,
        label: updated.label || prev.label,
        address: updated.address !== undefined ? updated.address : prev.address
      }));
    }
  };

  return (
    <>
      <div className={`rounded-2xl p-4 mb-4 border transition-all ${
        isActive
          ? 'bg-slate-900/60 backdrop-blur-2xl border-[#1cd188]/60 shadow-lg shadow-[#1cd188]/10'
          : 'bg-slate-900/60 backdrop-blur-2xl/90 border-white/10'
      }`}>
        {/* Header & Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isActive ? 'bg-[#1cd188]/20 text-[#1cd188] animate-pulse border border-[#1cd188]/40' : 'bg-[#0f172a] text-slate-400'
            }`}>
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Destination Mode</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1cd188]/10 text-[#1cd188] border border-[#1cd188]/20">
                  Corridor Matching
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Match rides along your travel route</p>
            </div>
          </div>

          {/* Toggle Button / Trigger */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-md ${
              isActive
                ? 'bg-[#1cd188] text-[#0f172a] hover:bg-emerald-400'
                : 'bg-[#0f172a] text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {isActive ? 'ACTIVE' : 'TURN ON'}
          </button>
        </div>

        {/* Active Route Display */}
        {isActive && (
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="w-4 h-4 text-[#1cd188] shrink-0" />
              <div>
                <p className="text-white font-bold">{destinationData.label}</p>
                <p className="text-slate-400 text-[10px] truncate max-w-[200px]">
                  {destinationData.address || 'Corridor route set'} ({destinationData.maxDetourKm} km detour)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-[#1cd188] text-xs font-bold flex items-center gap-1 hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" /> Change Route
            </button>
          </div>
        )}

        {!isActive && (
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full text-center text-xs font-bold text-[#1cd188] py-1.5 hover:underline"
            >
              + Set Destination & Start Matching
            </button>
          </div>
        )}
      </div>

      {/* Destination Mode Popup Modal */}
      <DestinationModeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        driver={driver}
        onUpdateSuccess={handleModalUpdateSuccess}
      />
    </>
  );
};

export default DestinationModeCard;
