import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * OpenStreetMap interactive map component powered by Leaflet & OSM tiles.
 * 100% Free with zero API key dependencies, zero Play Services dependencies, and zero watermarks.
 */
export default function OpenStreetMap({
  center = { latitude: 6.5244, longitude: 3.3792 }, // Default to Lagos, Nigeria
  zoom = 15,
  userLocation = null, // Current GPS location { latitude, longitude }
  pickup = null,
  dropoff = null,
  pickupCoord = null,
  dropoffCoord = null,
  stops = [],
  driverCoord = null,
  driverName = 'Active Driver',
  onLocationSelect = null,
  interactive = true,
  isDark = false,
  style,
  className = '',
}) {
  const webViewRef = useRef(null);

  // Web message listener for tap-to-select on Web platform
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const onWebMessage = (event) => {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (data && data.type === 'LOCATION_SELECTED' && onLocationSelect) {
            onLocationSelect({
              latitude: Number(data.latitude),
              longitude: Number(data.longitude),
            });
          }
        } catch (e) {}
      };
      window.addEventListener('message', onWebMessage);
      return () => window.removeEventListener('message', onWebMessage);
    }
  }, [onLocationSelect]);

  // Generate the standalone Leaflet HTML document
  const leafletHtml = useMemo(() => {
    const uCoord = userLocation && userLocation.latitude != null ? {
      latitude: Number(userLocation.latitude),
      longitude: Number(userLocation.longitude)
    } : null;

    const pCoord = pickupCoord && pickupCoord.latitude != null ? {
      latitude: Number(pickupCoord.latitude),
      longitude: Number(pickupCoord.longitude)
    } : null;

    const dCoord = dropoffCoord && dropoffCoord.latitude != null ? {
      latitude: Number(dropoffCoord.latitude),
      longitude: Number(dropoffCoord.longitude)
    } : null;

    const drCoord = driverCoord && driverCoord.latitude != null ? {
      latitude: Number(driverCoord.latitude),
      longitude: Number(driverCoord.longitude)
    } : null;

    const initialLat = pCoord?.latitude || uCoord?.latitude || drCoord?.latitude || (center?.latitude ? Number(center.latitude) : 6.5244);
    const initialLng = pCoord?.longitude || uCoord?.longitude || drCoord?.longitude || (center?.longitude ? Number(center.longitude) : 3.3792);

    const stopsData = (stops || [])
      .filter((s) => s.lat != null && s.lon != null)
      .map((s, idx) => ({
        lat: Number(s.lat),
        lng: Number(s.lon),
        title: s.address || `Stop ${idx + 1}`,
        idx: idx + 1,
      }));

    const bgColor = isDark ? '#090d16' : '#f8fafc';
    const popupBg = isDark ? '#1e293b' : '#ffffff';
    const popupText = isDark ? '#f8fafc' : '#0f172a';
    const popupBorder = isDark ? '#334155' : '#e2e8f0';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    if (typeof L === 'undefined') {
      document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"><\\/script>');
    }
  </script>
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: ${bgColor};
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .leaflet-control-attribution { display: none !important; }
    ${
      isDark
        ? `
    .leaflet-tile-pane {
      filter: brightness(0.68) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.78);
    }
    `
        : ''
    }
    .custom-pin {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pin-bubble {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 2.5px solid #ffffff;
      color: #ffffff;
      font-weight: bold;
      font-size: 13px;
    }
    .pin-pickup { background: #008751; }
    .pin-dropoff { background: #ea4335; }
    .pin-stop { background: #0284c7; }
    .pin-driver { background: #008751; animation: pulse 2s infinite; }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 135, 81, 0.7); }
      70% { box-shadow: 0 0 0 14px rgba(0, 135, 81, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 135, 81, 0); }
    }
    /* User Current GPS Location Pulsing Marker */
    .pin-user-location {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.25);
      border: 2px solid #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
      animation: pulse-user 2.2s infinite;
    }
    .user-inner-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10b981;
      border: 2px solid #ffffff;
    }
    @keyframes pulse-user {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { box-shadow: 0 0 0 16px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    .leaflet-popup-content-wrapper {
      background: ${popupBg};
      color: ${popupText};
      border-radius: 12px;
      border: 1px solid ${popupBorder};
      box-shadow: 0 6px 18px rgba(0,0,0,0.25);
      font-size: 12px;
      padding: 4px;
    }
    .leaflet-popup-tip {
      background: ${popupBg};
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    try {
      var map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        dragging: ${interactive ? 'true' : 'false'},
        touchZoom: ${interactive ? 'true' : 'false'},
        scrollWheelZoom: ${interactive ? 'true' : 'false'},
        doubleClickZoom: ${interactive ? 'true' : 'false'}
      }).setView([${initialLat}, ${initialLng}], ${zoom});

      // High-availability Humanitarian OpenStreetMap Team Tiles (100% Free, High Contrast, Zero Watermarks)
      var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b'],
        attribution: ''
      });
      tileLayer.on('tileerror', function(error) {
        if (error && error.tile && error.tile.src) {
          var src = error.tile.src;
          if (src.indexOf('tile.openstreetmap.org') === -1) {
            var parts = src.split('/');
            if (parts.length >= 3) {
              var z = parts[parts.length - 3];
              var x = parts[parts.length - 2];
              var y = parts[parts.length - 1];
              error.tile.src = 'https://tile.openstreetmap.org/' + z + '/' + x + '/' + y;
            }
          }
        }
      });
      tileLayer.addTo(map);

      // Invalidate layout after rendering to guarantee map tiles paint fully in WebView
      setTimeout(function() { if (map) map.invalidateSize(); }, 150);
      setTimeout(function() { if (map) map.invalidateSize(); }, 600);

      var boundsPoints = [];

      // Current GPS Location Marker
      ${
        uCoord
          ? `
        var userIcon = L.divIcon({
          className: 'custom-pin',
          html: '<div class=\"pin-user-location\"><div class=\"user-inner-dot\"></div></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        L.marker([${uCoord.latitude}, ${uCoord.longitude}], { icon: userIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup('<b>Your Current Location</b>');
        boundsPoints.push([${uCoord.latitude}, ${uCoord.longitude}]);
      `
          : ''
      }

      // Pickup Marker (Emerald Green)
      ${
        pCoord
          ? `
        var pickupIcon = L.divIcon({
          className: 'custom-pin',
          html: '<div class=\"pin-bubble pin-pickup\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"4\"/></svg></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        L.marker([${pCoord.latitude}, ${pCoord.longitude}], { icon: pickupIcon, zIndexOffset: 900 })
          .addTo(map)
          .bindPopup('<b>Pickup Point</b><br/>${escapeHtml(pickup || 'Your Location')}');
        boundsPoints.push([${pCoord.latitude}, ${pCoord.longitude}]);
      `
          : ''
      }

      // Destination Marker (Rose Red)
      ${
        dCoord
          ? `
        var dropoffIcon = L.divIcon({
          className: 'custom-pin',
          html: '<div class=\"pin-bubble pin-dropoff\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/></svg></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        L.marker([${dCoord.latitude}, ${dCoord.longitude}], { icon: dropoffIcon, zIndexOffset: 900 })
          .addTo(map)
          .bindPopup('<b>Destination</b><br/>${escapeHtml(dropoff || 'Destination')}');
        boundsPoints.push([${dCoord.latitude}, ${dCoord.longitude}]);
      `
          : ''
      }

      // Intermediate Stops
      var stopsList = ${JSON.stringify(stopsData)};
      stopsList.forEach(function(s) {
        var stopIcon = L.divIcon({
          className: 'custom-pin',
          html: '<div class=\"pin-bubble pin-stop\">' + s.idx + '</div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        L.marker([s.lat, s.lng], { icon: stopIcon })
          .addTo(map)
          .bindPopup('<b>Stop ' + s.idx + '</b><br/>' + s.title);
        boundsPoints.push([s.lat, s.lng]);
      });

      // Driver Vehicle Marker
      ${
        drCoord
          ? `
        var driverIcon = L.divIcon({
          className: 'custom-pin',
          html: '<div class=\"pin-bubble pin-driver\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"12 2 19 21 12 17 5 21 12 2\"/></svg></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        L.marker([${drCoord.latitude}, ${drCoord.longitude}], { icon: driverIcon, zIndexOffset: 950 })
          .addTo(map)
          .bindPopup('<b>${escapeHtml(driverName)}</b>');
        boundsPoints.push([${drCoord.latitude}, ${drCoord.longitude}]);
      `
          : ''
      }

      // Draw Route Polyline if both Pickup and Dropoff exist
      ${
        pCoord && dCoord
          ? `
        var routeCoords = [
          [${pCoord.latitude}, ${pCoord.longitude}],
          ...stopsList.map(function(s) { return [s.lat, s.lng]; }),
          [${dCoord.latitude}, ${dCoord.longitude}]
        ];
        L.polyline(routeCoords, {
          color: '#008751',
          weight: 5,
          opacity: 0.92,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);
      `
          : ''
      }

      // Automatically Fit Bounds to show all route points
      if (boundsPoints.length > 1) {
        map.fitBounds(boundsPoints, { padding: [60, 60], maxZoom: 16 });
      } else if (boundsPoints.length === 1) {
        map.setView(boundsPoints[0], 15);
      }

      // Tap on map listener (Sends coordinate to app)
      map.on('click', function(e) {
        var payload = JSON.stringify({
          type: 'LOCATION_SELECTED',
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        });
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(payload);
        } else if (window.parent && window.parent.postMessage) {
          window.parent.postMessage(payload, '*');
        }
      });
    } catch (err) {
      console.error('Leaflet initialization error:', err);
    }
  </script>
</body>
</html>`;
  }, [
    center?.latitude,
    center?.longitude,
    zoom,
    userLocation?.latitude,
    userLocation?.longitude,
    pickup,
    dropoff,
    pickupCoord?.latitude,
    pickupCoord?.longitude,
    dropoffCoord?.latitude,
    dropoffCoord?.longitude,
    driverCoord?.latitude,
    driverCoord?.longitude,
    driverName,
    stops,
    interactive,
    isDark,
  ]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'LOCATION_SELECTED' && onLocationSelect) {
        onLocationSelect({
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
        });
      }
    } catch (e) {}
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#090d16' : '#f8fafc' }, style]} className={className}>
        <iframe
          srcDoc={leafletHtml}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="OpenStreetMap"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#090d16' : '#f8fafc' }, style]} className={className}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: leafletHtml, baseUrl: 'https://unpkg.com' }}
        style={[styles.webView, { width: '100%', height: '100%', backgroundColor: isDark ? '#090d16' : '#f8fafc' }]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        androidLayerType="hardware"
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        onMessage={handleMessage}
        renderLoading={() => (
          <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#090d16' : '#f8fafc' }]}>
            <ActivityIndicator size="small" color="#008751" />
          </View>
        )}
        startInLoadingState={true}
      />
    </View>
  );
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
