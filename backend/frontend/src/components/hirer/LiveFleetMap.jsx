import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Activity, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';

// Custom Map Marker Icon
const driverIcon = new L.Icon({
  iconUrl: '/logo.svg',
  iconRetinaUrl: '/logo.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'bg-white rounded-full p-1 border-2 border-brandMint shadow-[0_0_15px_rgba(28,209,136,0.5)]'
});

const LiveFleetMap = () => {
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([9.0820, 8.6753]); // Default Nigeria center

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTelemetry = async () => {
    try {
      const response = await api.get('/hirer/fleet-telemetry');
      if (response.data.success) {
        setTelemetry(response.data.data);
        if (response.data.data.length > 0) {
          setMapCenter([parseFloat(response.data.data[0].latitude), parseFloat(response.data.data[0].longitude)]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch fleet telemetry', err);
      setError('Could not connect to telemetry service.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] w-full bg-slate-900 rounded-3xl border border-slate-800">
        <Activity className="w-10 h-10 text-brandMint animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Initializing Telemetry...</p>
      </div>
    );
  }

  if (telemetry.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] w-full bg-slate-900 rounded-3xl border border-slate-800 text-center px-6">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700 shadow-inner mb-6">
          <Activity className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Telemetry Offline</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
          You currently have no active drivers in transit. Once you hire a driver and they begin a job, their real-time GPS location and telemetry data will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border-4 border-slate-800 bg-slate-900 shadow-2xl">
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <div className="bg-slate-950/90 backdrop-blur-md border border-brandMint/30 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="w-2.5 h-2.5 bg-brandMint rounded-full animate-pulse shadow-[0_0_10px_rgba(28,209,136,0.8)]" />
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Active Fleet</p>
            <p className="text-white font-black leading-none">{telemetry.length} <span className="text-sm font-normal text-slate-500">Drivers</span></p>
          </div>
        </div>
      </div>

      <MapContainer 
        center={mapCenter} 
        zoom={12} 
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
        />
        <ZoomControl position="bottomright" />

        {telemetry.map(loc => {
          const lat = parseFloat(loc.latitude);
          const lng = parseFloat(loc.longitude);
          const driverName = loc.driver?.user?.name || 'Driver';
          const driverPhone = loc.driver?.user?.phone || 'N/A';
          const avatar = loc.driver?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(driverName)}&background=020617&color=4ade80`;

          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker key={loc.id} position={[lat, lng]} icon={driverIcon}>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                    <img src={avatar} alt={driverName} className="w-10 h-10 rounded-full border border-slate-200" />
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{driverName}</p>
                      <p className="text-xs text-slate-500 font-mono">{driverPhone}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Status</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {loc.status || 'Active'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Last Updated</span>
                      <span className="font-mono text-slate-700">
                        {new Date(loc.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LiveFleetMap;
