import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Crosshair, CheckCircle2, X, Search, Sparkles, Navigation } from 'lucide-react';
import api from '../../api/axios';
import { 
  POPULAR_NIGERIAN_LANDMARKS, 
  searchLocalLandmarks, 
  searchLivePlaces, 
  cleanAddress,
  saveRecentPlace 
} from '../../utils/placesAutocomplete';

// Leaflet custom marker setup for target location pin
const targetPinIcon = L.divIcon({
  className: 'custom-map-picker-pin',
  html: `<div style="background-color:#1cd188; color:#0f172a; width:38px; height:38px; border-radius:50%; border:3px solid #ffffff; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 0 25px rgba(28,209,136,0.9); cursor:grab;">📍</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

/** Helper component to fly the map when user picks a suggestion or chip */
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], 16, { duration: 1 });
    }
  }, [center?.lat, center?.lng, map]);
  return null;
}

/** Helper component to capture map drag and click events */
function MapEventsHandler({ onLocationChange }) {
  const map = useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
    moveend() {
      const center = map.getCenter();
      onLocationChange(center.lat, center.lng);
    },
  });
  return null;
}

export default function MapLocationPickerModal({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  initialAddress = '',
  onConfirm,
}) {
  const defaultLat = initialLat || 6.4531;
  const defaultLng = initialLng || 3.4244;

  const [position, setPosition] = useState({ lat: defaultLat, lng: defaultLng });
  const [address, setAddress] = useState(initialAddress);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const geocodeTimeoutRef = useRef(null);
  const searchAbortRef = useRef(null);

  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    let resolvedAddress = `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    // 1. Try Laravel API Endpoint
    try {
      const res = await api.get('/location/reverse', { params: { lat, lng } });
      if (res.data?.display_name) resolvedAddress = cleanAddress(res.data.display_name);
    } catch (e) {
      // 2. Try Nominatim OSM
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        if (res.ok) {
          const data = await res.json();
          if (data?.display_name) resolvedAddress = cleanAddress(data.display_name);
        }
      } catch (err) {
        // 3. Try LocationIQ
        try {
          const res = await fetch(`https://us1.locationiq.com/v1/reverse.php?key=pk.8ae3192c04f86a50c49464280dfb044e&lat=${lat}&lon=${lng}&format=json`);
          if (res.ok) {
            const data = await res.json();
            if (data?.display_name) resolvedAddress = cleanAddress(data.display_name);
          }
        } catch (e2) {}
      }
    }

    setAddress(resolvedAddress);
    setIsGeocoding(false);
  };

  const handlePositionChange = (lat, lng) => {
    setPosition({ lat, lng });
    if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    geocodeTimeoutRef.current = setTimeout(() => {
      reverseGeocode(lat, lng);
    }, 350);
  };

  // Instant local search + debounced live geocoding
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    // Instant local matches (0ms)
    const localMatches = searchLocalLandmarks(searchQuery, 4);
    setSuggestions(localMatches);
    setShowSuggestions(true);

    // Live OSM geocoding with debounce
    if (searchAbortRef.current) searchAbortRef.current.abort();
    const abortController = new AbortController();
    searchAbortRef.current = abortController;

    const timer = setTimeout(async () => {
      const liveMatches = await searchLivePlaces(searchQuery, abortController.signal);
      if (liveMatches.length > 0) {
        // Merge without duplicates
        setSuggestions(prev => {
          const seen = new Set(prev.map(p => p.name.toLowerCase()));
          const extra = liveMatches.filter(l => !seen.has(l.name.toLowerCase())).slice(0, 4);
          return [...prev, ...extra];
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectPlace = (place) => {
    const lat = place.lat;
    const lng = place.lng;
    const fullAddr = place.city ? `${place.name}, ${place.city}` : place.name;
    setPosition({ lat, lng });
    setAddress(fullAddr);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const useCurrentGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation unavailable on this device.');
      return;
    }
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition({ lat, lng });
        reverseGeocode(lat, lng);
      },
      () => {
        alert('Could not acquire current GPS coordinates.');
        setIsGeocoding(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (isOpen) {
      const lat = initialLat || 6.4531;
      const lng = initialLng || 3.4244;
      setPosition({ lat, lng });
      if (initialAddress) {
        setAddress(initialAddress);
      } else {
        reverseGeocode(lat, lng);
      }
      setSearchQuery('');
      setShowSuggestions(false);
    }
  }, [isOpen, initialLat, initialLng, initialAddress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shadow-xl z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brandMint/10 border border-brandMint/30 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-brandMint" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Pick Exact Location</h3>
            <p className="text-[10px] text-slate-400">Search place name or drag map to pinpoint</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Live Search & Autocomplete Bar inside Map */}
      <div className="p-2.5 bg-slate-950 border-b border-slate-800 relative z-20 shadow-md">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-brandMint absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search address, hotel, airport, or landmark in Nigeria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-brandMint text-white text-xs rounded-xl pl-9 pr-8 py-2.5 outline-none placeholder:text-slate-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              className="absolute right-2.5 text-slate-400 p-1 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-2.5 right-2.5 top-[52px] bg-slate-900 border border-brandMint/40 rounded-2xl shadow-2xl overflow-hidden z-30 max-h-56 overflow-y-auto">
            {suggestions.map((place, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectPlace(place)}
                className="w-full text-left p-3 hover:bg-slate-800 border-b border-slate-800 last:border-none flex items-center gap-3 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-brandMint/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-brandMint" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{place.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{place.city || place.full_address}</p>
                </div>
                {place.tag && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 shrink-0">
                    {place.tag}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Quick Hub Jump Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar">
          {[
            { label: '✈️ Airport', lat: 6.5774, lng: 3.3212, name: 'Murtala Muhammed Airport, Ikeja' },
            { label: '🏢 Victoria Island', lat: 6.4281, lng: 3.4219, name: 'Victoria Island, Lagos' },
            { label: '🌴 Lekki Phase 1', lat: 6.4474, lng: 3.4735, name: 'Lekki Phase 1, Admiralty Way' },
            { label: '🛍️ Ikeja City Mall', lat: 6.6195, lng: 3.3581, name: 'Ikeja City Mall, Alausa' },
            { label: '💻 Yaba Hub', lat: 6.5167, lng: 3.3833, name: 'Yaba Commercial Hub, Lagos' },
            { label: '🏛️ Abuja CBD', lat: 9.0579, lng: 7.4951, name: 'Central Business District, Abuja' },
            { label: '⛽ Port Harcourt', lat: 4.8156, lng: 7.0012, name: 'GRA Phase 2, Port Harcourt' }
          ].map(hub => (
            <button
              key={hub.label}
              type="button"
              onClick={() => {
                setPosition({ lat: hub.lat, lng: hub.lng });
                setAddress(hub.name);
                setShowSuggestions(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-brandMint hover:border-brandMint whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
            >
              {hub.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Geocoded Address Bar Overlay */}
      <div className="px-4 py-2.5 bg-slate-950/95 border-b border-brandMint/30 flex items-center justify-between gap-3 z-10 shadow-lg">
        <div className="min-w-0 flex-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brandMint block">Selected Address:</span>
          <p className="text-xs font-bold text-white truncate mt-0.5">
            {isGeocoding ? 'Detecting street name...' : address || 'Tap or drag on map'}
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            GPS: <span className="text-brandMint">{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={useCurrentGps}
          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-brandMint/40 rounded-xl text-xs font-black text-brandMint flex items-center gap-1.5 shrink-0 shadow-sm transition-all active:scale-95"
        >
          <Crosshair className="w-3.5 h-3.5" /> My GPS
        </button>
      </div>

      {/* Interactive Leaflet Map Picker Canvas */}
      <div className="relative flex-1 w-full bg-slate-950 overflow-hidden z-0">
        <MapContainer
          key={`${defaultLat}-${defaultLng}`}
          center={[position.lat, position.lng]}
          zoom={15}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
          />
          <MapController center={position} />
          <MapEventsHandler onLocationChange={handlePositionChange} />
          <Marker
            position={[position.lat, position.lng]}
            icon={targetPinIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                handlePositionChange(pos.lat, pos.lng);
              },
            }}
          >
            <Popup>
              <div className="p-1 font-sans text-xs">
                <strong className="text-emerald-600 block font-bold">Selected Target Point</strong>
                <span className="text-slate-800 text-[11px]">{address}</span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Center Target Indicator Crosshair Badge */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-brandMint/40 text-brandMint px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest pointer-events-none shadow-2xl flex items-center gap-1.5 z-[500]">
          <span className="w-2 h-2 rounded-full bg-brandMint animate-ping" />
          Tap or drag marker to set exact location
        </div>
      </div>

      {/* Bottom Confirmation Action Bar */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex gap-2.5 z-10 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isGeocoding}
          onClick={() => {
            const finalAddr = address.trim() || `GPS: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;
            saveRecentPlace({ name: finalAddr, address: finalAddr, lat: position.lat, lng: position.lng });
            onConfirm({
              address: finalAddr,
              lat: position.lat,
              lng: position.lng,
            });
            onClose();
          }}
          className="flex-1 py-3.5 bg-brandMint hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(28,209,136,0.35)] flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" /> Confirm & Use Location
        </button>
      </div>
    </div>
  );
}
