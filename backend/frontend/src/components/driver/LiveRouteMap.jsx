import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';

// Fix Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LiveRouteMap = ({ pickupLat, pickupLng, dropoffLat, dropoffLng }) => {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);
        // OSRM Public API
        const response = await axios.get(
          `https://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}?overview=full&geometries=geojson`
        );
        
        if (response.data.routes && response.data.routes[0]) {
          const route = response.data.routes[0];
          // Convert GeoJSON coords [lng, lat] to Leaflet [lat, lng]
          const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRouteData({
            coordinates,
            distance: (route.distance / 1000).toFixed(1), // km
            duration: Math.ceil(route.duration / 60) // minutes
          });
        }
      } catch (error) {
        console.error('Failed to fetch OSRM route:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

  const center = [
    (parseFloat(pickupLat) + parseFloat(dropoffLat)) / 2,
    (parseFloat(pickupLng) + parseFloat(dropoffLng)) / 2
  ];

  return (
    <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 relative">
      {loading && (
        <div className="absolute inset-0 z-[1000] bg-slate-900/80 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brandMint border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {routeData && (
        <div className="absolute top-2 right-2 z-[1000] bg-slate-950/90 text-brandMint text-xs font-black px-3 py-1.5 rounded-lg border border-brandMint/30 backdrop-blur-sm">
          {routeData.distance} km • {routeData.duration} min ETA
        </div>
      )}

      <MapContainer center={center} zoom={11} scrollWheelZoom={false} className="w-full h-full z-10">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
        />
        
        <Marker position={[pickupLat, pickupLng]}>
          <Popup>Pickup Location</Popup>
        </Marker>
        
        <Marker position={[dropoffLat, dropoffLng]}>
          <Popup>Dropoff Location</Popup>
        </Marker>
        
        {routeData && (
          <Polyline 
            positions={routeData.coordinates} 
            pathOptions={{ color: '#00F2FE', weight: 4, opacity: 0.8 }} 
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LiveRouteMap;

