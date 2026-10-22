import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * OpenStreetMap interactive map component powered by Leaflet & high-speed CartoDB Voyager tiles.
 * 100% Free with zero API key dependencies, zero Play Services dependencies, and instantaneous rendering.
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
  nearbyDrivers = [],
  nearbyJobs = [],
  onJobSelect = null,
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
          } else if (data && data.type === 'JOB_SELECTED' && onJobSelect) {
            onJobSelect(data.job);
          }
        } catch (e) {}
      };
      window.addEventListener('message', onWebMessage);
      return () => window.removeEventListener('message', onWebMessage);
    }
  }, [onLocationSelect, onJobSelect]);

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

    const initialLat = uCoord?.latitude || drCoord?.latitude || pCoord?.latitude || (center?.latitude ? Number(center.latitude) : 6.5244);
    const initialLng = uCoord?.longitude || drCoord?.longitude || pCoord?.longitude || (center?.longitude ? Number(center.longitude) : 3.3792);

    const stopsData = (stops || [])
      .filter((s) => s.lat != null && s.lon != null)
      .map((s, idx) => ({
        lat: Number(s.lat),
        lng: Number(s.lon),
        title: s.address || `Stop ${idx + 1}`,
        idx: idx + 1,
      }));

    const cleanJobs = (nearbyJobs || []).filter(j => j && j.latitude && j.longitude);

    const bgColor = isDark ? '#090d16' : '#f8fafc';
    const tileUrl = isDark 
      ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png' 
      : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
  <script>
    if (typeof L === 'undefined') {
      document.write('<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />');
      document.write('<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\\/script>');
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
    .pin-car {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #090d16;
      border: 2.5px solid #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.55);
      animation: pulse-car 2.5s infinite;
    }
    @keyframes pulse-car {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { box-shadow: 0 0 0 16px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    /* User Current GPS Location Pulsing Marker */
    .pin-user-location {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.25);
      border: 2.5px solid #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 14px rgba(16, 185, 129, 0.6);
      animation: pulse-user 2s infinite;
    }
    .user-inner-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10b981;
      border: 2px solid #ffffff;
    }
    @keyframes pulse-user {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.75); }
      70% { box-shadow: 0 0 0 18px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    /* Interactive Job Pins Around Driver Location */
    .pin-job-badge {
      display: flex;
      align-items: center;
      background: #0f172a;
      border-radius: 20px;
      padding: 4px 8px;
      border: 2px solid #10b981;
      box-shadow: 0 4px 14px rgba(0,0,0,0.35);
      white-space: nowrap;
      cursor: pointer;
    }
    .pin-job-ride { border-color: #10b981; background: #064e3b; }
    .pin-job-contract { border-color: #3b82f6; background: #1e3a8a; }
    .pin-job-hotspot { border-color: #f59e0b; background: #78350f; }
    .pin-job-text {
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      margin-left: 4px;
    }
    .job-popup-btn {
      display: inline-block;
      margin-top: 6px;
      padding: 6px 12px;
      background: #008751;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      text-align: center;
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

      // Ultra-fast CartoDB Voyager raster tiles (Global CDN, 100% uptime, zero watermarks)
      var tileLayer = L.tileLayer('${tileUrl}', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c', 'd'],
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
      setTimeout(function() { if (map) map.invalidateSize(); }, 100);
      setTimeout(function() { if (map) map.invalidateSize(); }, 400);

      var boundsPoints = [];

      // Current GPS Location Marker
      ${
        uCoord
          ? `
        var userIcon = L.divIcon({
          className: 'custom-pin',
          html: '<div class="pin-user-location"><div class="user-inner-dot"></div></div>',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
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
          html: '<div class="pin-bubble pin-pickup"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/></svg></div>',
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
          html: '<div class="pin-bubble pin-dropoff"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>',
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
          html: '<div class="pin-bubble pin-stop">' + s.idx + '</div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        L.marker([s.lat, s.lng], { icon: stopIcon })
          .addTo(map)
          .bindPopup('<b>Stop ' + s.idx + '</b><br/>' + s.title);
        boundsPoints.push([s.lat, s.lng]);
      });

      // Driver Vehicle Marker (With OgaDriver Brand Color Car Image)
      ${
        drCoord
          ? `
        var driverCarSvg = '<div class="pin-car"><svg width="22" height="22" viewBox="0 0 24 24" fill="#10b981"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg></div>';
        var driverIcon = L.divIcon({
          className: 'custom-pin',
          html: driverCarSvg,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });
        L.marker([${drCoord.latitude}, ${drCoord.longitude}], { icon: driverIcon, zIndexOffset: 950 })
          .addTo(map)
          .bindPopup('<b>${escapeHtml(driverName)} (Active Driver)</b>');
        boundsPoints.push([${drCoord.latitude}, ${drCoord.longitude}]);
      `
          : ''
      }

      // Nearby Opportunities & Location Activities (Jobs, Rides, Hotspots)
      var nearbyJobsList = ${JSON.stringify(cleanJobs)};
      nearbyJobsList.forEach(function(job) {
        if (job && job.latitude && job.longitude) {
          var isRide = job.type === 'ride';
          var isHotspot = job.type === 'hotspot';
          var badgeClass = isRide ? 'pin-job-ride' : (isHotspot ? 'pin-job-hotspot' : 'pin-job-contract');
          var iconEmoji = isRide ? '🚖' : (isHotspot ? '⚡' : '💼');
          var priceLabel = job.fare || job.price || job.salary || (isHotspot ? '+25%' : 'Available');

          var jobBadgeHtml = '<div class="pin-job-badge ' + badgeClass + '">' +
            '<span>' + iconEmoji + '</span>' +
            '<span class="pin-job-text">' + priceLabel + '</span>' +
            '</div>';

          var jobIcon = L.divIcon({
            className: 'custom-pin',
            html: jobBadgeHtml,
            iconSize: [80, 28],
            iconAnchor: [40, 14]
          });

          var marker = L.marker([job.latitude, job.longitude], { icon: jobIcon, zIndexOffset: 920 }).addTo(map);

          var popupContent = '<div style="min-width:160px;font-family:sans-serif;">' +
            '<div style="font-weight:bold;font-size:13px;color:#0f172a;">' + (job.title || 'Nearby Opportunity') + '</div>' +
            '<div style="font-size:11px;color:#64748b;margin-top:2px;">📍 ' + (job.pickup || job.location || 'Within 3 km') + '</div>' +
            '<div style="font-size:12px;font-weight:bold;color:#059669;margin-top:3px;">💰 ' + priceLabel + '</div>' +
            '<div style="font-size:11px;color:#2563eb;margin-top:2px;">📏 ' + (job.distance_km ? job.distance_km + ' km away' : 'Nearby') + '</div>' +
            '</div>';

          marker.bindPopup(popupContent);
          marker.on('click', function() {
            var payload = JSON.stringify({ type: 'JOB_SELECTED', job: job });
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(payload);
            } else if (window.parent && window.parent.postMessage) {
              window.parent.postMessage(payload, '*');
            }
          });
        }
      });

      // Nearby Active Drivers with Branded Car Markers
      var nearbyDriversList = ${JSON.stringify(nearbyDrivers || [])};
      nearbyDriversList.forEach(function(dr) {
        if (dr && dr.latitude && dr.longitude) {
          var carSvgHtml = '<div class="pin-car"><svg width="20" height="20" viewBox="0 0 24 24" fill="#10b981"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg></div>';
          var nbIcon = L.divIcon({
            className: 'custom-pin',
            html: carSvgHtml,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });
          L.marker([dr.latitude, dr.longitude], { icon: nbIcon, zIndexOffset: 900 })
            .addTo(map)
            .bindPopup('<b>' + (dr.name || 'Verified Driver') + '</b><br/>' + (dr.vehicle || 'Active Chauffeur'));
        }
      });

      // Draw Route Polyline if both Pickup and Dropoff exist
      ${
        pCoord && dCoord
          ? `
        var routeCoords = [
          [${pCoord.latitude}, ${pCoord.longitude}],
          ...stopsList.map(function(s) { return [s.lat, s.lng]; }),
          [${dCoord.latitude}, ${dCoord.longitude}]
        ];
        var routePolyline = L.polyline(routeCoords, {
          color: '#008751',
          weight: 5,
          opacity: 0.92,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        try {
          var osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' +
            ${pCoord.longitude} + ',' + ${pCoord.latitude} + ';' +
            ${dCoord.longitude} + ',' + ${dCoord.latitude} +
            '?overview=full&geometries=geojson';
          fetch(osrmUrl)
            .then(function(res) { return res.json(); })
            .then(function(json) {
              if (json && json.routes && json.routes.length > 0 && json.routes[0].geometry) {
                var coords = json.routes[0].geometry.coordinates.map(function(c) {
                  return [c[1], c[0]];
                });
                if (coords && coords.length > 0) {
                  routePolyline.setLatLngs(coords);
                }
              }
            })
            .catch(function(e) {});
        } catch (e) {}
      `
          : ''
      }

      // Auto-fit bounds if multiple coordinate points exist
      if (boundsPoints.length >= 2) {
        map.fitBounds(boundsPoints, { padding: [50, 50], maxZoom: 16 });
      }

      // Click to pick location
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
    nearbyDrivers,
    nearbyJobs,
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
      } else if (data.type === 'JOB_SELECTED' && onJobSelect) {
        onJobSelect(data.job);
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
        source={{ html: leafletHtml, baseUrl: 'https://cartocdn.com' }}
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
        startInLoadingState={false}
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
