import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import { Navigation, Layers, Flame, MapPin, Navigation2 } from 'lucide-react';

export default function TacticalMap() {
  const [showRadar, setShowRadar] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const drivers = [
    { id: 1, name: 'Emeka O.', rating: 4.9, lat: 6.5244, lng: 3.3792 },
    { id: 2, name: 'Chinedu K.', rating: 4.8, lat: 6.5344, lng: 3.3892 },
    { id: 3, name: 'Adaeze N.', rating: 4.7, lat: 6.5144, lng: 3.3692 },
  ];

  const userLocation = [6.5244, 3.3792];

  return (
    <div className="relative w-full h-screen">
      {/* Tactical Map */}
      <MapContainer
        center={userLocation}
        zoom={13}
        className="w-full h-full"
        style={{ background: '#0a0f1a' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* User Location */}
        <Marker position={userLocation}>
          <Popup>Your Location</Popup>
        </Marker>

        {/* Radar Effect */}
        {showRadar && (
          <Circle
            center={userLocation}
            radius={1000}
            pathOptions={{
              color: '#1cd188',
              fillColor: 'rgba(28, 209, 136, 0.1)',
              fillOpacity: 0.3,
              weight: 2,
            }}
          />
        )}

        {/* Driver Markers */}
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            position={[driver.lat, driver.lng]}
            eventHandlers={{
              click: () => setSelectedDriver(driver),
            }}
          >
            <Popup>
              <div className="text-slate-900">
                <strong>{driver.name}</strong>
                <br />
                Rating: {driver.rating}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Command Panel - Top */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-brandMint/20 border border-brandMint/30 flex items-center justify-center mr-3">
                <Navigation className="w-5 h-5 text-brandMint" />
              </div>
              <div>
                <p className="text-white font-black text-sm">Lagos, Victoria Island</p>
                <p className="text-slate-400 text-[10px]">12 drivers within 2km</p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Layers className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Tactical Controls - Right Side */}
      <div className="absolute right-4 top-1/3 z-[1000] space-y-3">
        <button
          onClick={() => setShowRadar(!showRadar)}
          className={`w-12 h-12 rounded-xl backdrop-blur-xl border flex items-center justify-center shadow-lg ${
            showRadar
              ? 'bg-brandMint/20 border-brandMint/50'
              : 'bg-slate-900/90 border-slate-700'
          }`}
        >
          <Navigation2 className={`w-6 h-6 ${showRadar ? 'text-brandMint' : 'text-slate-400'}`} />
        </button>

        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`w-12 h-12 rounded-xl backdrop-blur-xl border flex items-center justify-center shadow-lg ${
            showHeatmap
              ? 'bg-red-500/20 border-red-500/50'
              : 'bg-slate-900/90 border-slate-700'
          }`}
        >
          <Flame className={`w-6 h-6 ${showHeatmap ? 'text-red-500' : 'text-slate-400'}`} />
        </button>

        <button className="w-12 h-12 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 flex items-center justify-center shadow-lg">
          <Layers className="w-6 h-6 text-slate-400" />
        </button>

        <button className="w-12 h-12 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 flex items-center justify-center shadow-lg">
          <MapPin className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      {/* Quick Actions - Bottom Left */}
      <div className="absolute bottom-32 left-4 z-[1000] space-y-3">
        <button className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brandMint to-emerald-600 border-2 border-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/30">
          <Navigation className="w-7 h-7 text-slate-950" />
        </button>

        <button className="w-14 h-14 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 flex items-center justify-center shadow-lg">
          <MapPin className="w-7 h-7 text-slate-400" />
        </button>
      </div>

      {/* Selected Driver Info */}
      {selectedDriver && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-600 mr-4 flex items-center justify-center">
                <span className="text-white font-black text-xl">{selectedDriver.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-black text-lg">{selectedDriver.name}</p>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center">
                    <span className="text-amber-400 text-sm">★</span>
                    <span className="text-slate-400 text-xs ml-1">{selectedDriver.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-400 text-xs ml-1">1.2km</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="bg-brandMint px-6 py-3 rounded-xl"
              >
                <span className="text-slate-950 font-black text-sm uppercase tracking-wider">Select</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Mode Indicator */}
      <div className="absolute bottom-32 right-4 z-[1000]">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-xl px-3 py-2 shadow-lg">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-brandMint mr-2 animate-pulse" />
            <span className="text-brandMint text-[10px] font-bold uppercase tracking-wider">Tactical View</span>
          </div>
        </div>
      </div>
    </div>
  );
}
