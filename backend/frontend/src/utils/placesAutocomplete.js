// placesAutocomplete.js — Fast, stress-free location lookup for Nigeria (0ms curated + live OSM)

export const POPULAR_NIGERIAN_LANDMARKS = [
  // Lagos Major Hubs & Terminals
  { name: 'Murtala Muhammed Int\'l Airport (MMIA)', city: 'Ikeja, Lagos', lat: 6.5774, lng: 3.3212, tag: '✈️ Airport', icon: 'plane' },
  { name: 'Murtala Muhammed Domestic Airport (MMA2)', city: 'Ikeja, Lagos', lat: 6.5925, lng: 3.3418, tag: '✈️ Airport', icon: 'plane' },
  { name: 'Victoria Island (VI)', city: 'Lagos Island, Lagos', lat: 6.4281, lng: 3.4219, tag: '🏢 Commercial Hub', icon: 'building' },
  { name: 'Lekki Phase 1 (Admiralty Way)', city: 'Eti-Osa, Lagos', lat: 6.4474, lng: 3.4735, tag: '🌴 Residential & Hub', icon: 'map-pin' },
  { name: 'Ikeja City Mall (ICM)', city: 'Alausa, Ikeja, Lagos', lat: 6.6195, lng: 3.3581, tag: '🛍️ Shopping Mall', icon: 'shopping-bag' },
  { name: 'Eko Hotels & Suites', city: 'Adetokunbo Ademola, VI, Lagos', lat: 6.4262, lng: 3.4328, tag: '🏨 Hotel & Events', icon: 'building' },
  { name: 'The Palms Shopping Mall', city: 'BIS Way, Oniru, Lekki, Lagos', lat: 6.4357, lng: 3.4419, tag: '🛍️ Shopping Mall', icon: 'shopping-bag' },
  { name: 'Yaba Tech / Commercial Hub', city: 'Herbert Macaulay, Yaba, Lagos', lat: 6.5167, lng: 3.3833, tag: '💻 Tech & Transit Hub', icon: 'map-pin' },
  { name: 'Marina Financial District', city: 'CMS / Marina, Lagos Island', lat: 6.4531, lng: 3.3958, tag: '🏦 Financial Center', icon: 'briefcase' },
  { name: 'Maryland Mall', city: 'Ikorodu Road, Maryland, Lagos', lat: 6.5701, lng: 3.3667, tag: '🛍️ Shopping Mall', icon: 'shopping-bag' },
  { name: 'Surulere National Stadium', city: 'Western Avenue, Surulere, Lagos', lat: 6.4969, lng: 3.3639, tag: '⚽ Sports Landmark', icon: 'map-pin' },
  { name: 'Ajah Bus Terminal / Jubilee Bridge', city: 'Lekki-Epe Expressway, Ajah', lat: 6.4678, lng: 3.5678, tag: '🚌 Transit Hub', icon: 'navigation' },
  { name: 'Oshodi Transport Interchange (OTI)', city: 'Oshodi, Lagos', lat: 6.5542, lng: 3.3486, tag: '🚌 Mega Transit Terminal', icon: 'navigation' },
  { name: 'Berger Bus Stop', city: 'Lagos-Ibadan Expressway, Lagos', lat: 6.6508, lng: 3.3762, tag: '🚌 Interstate Gateway', icon: 'navigation' },
  { name: 'Festac Town (1st Avenue / Gate)', city: 'Amuwo Odofin, Lagos', lat: 6.4667, lng: 3.2833, tag: '🏘️ Residential Hub', icon: 'home' },
  { name: 'Ikoyi (Banana Island Gate)', city: 'Ikoyi, Lagos', lat: 6.4608, lng: 3.4542, tag: '💎 Luxury Estate', icon: 'building' },
  { name: 'Sangotedo (Novare Mall / Shoprite)', city: 'Lekki-Epe Expressway, Lagos', lat: 6.4789, lng: 3.6192, tag: '🛍️ Shopping Mall', icon: 'shopping-bag' },
  { name: 'Alaba International Market', city: 'Ojo, Lagos', lat: 6.4632, lng: 3.1945, tag: '📦 Commercial Market', icon: 'briefcase' },

  // Abuja (FCT) Major Hubs
  { name: 'Nnamdi Azikiwe Int\'l Airport', city: 'Airport Road, Abuja', lat: 9.0065, lng: 7.2631, tag: '✈️ Airport', icon: 'plane' },
  { name: 'Central Business District (CBD)', city: 'Abuja Central, FCT', lat: 9.0579, lng: 7.4951, tag: '🏢 Government & Corporate', icon: 'building' },
  { name: 'Maitama District', city: 'Maitama, Abuja, FCT', lat: 9.0882, lng: 7.4983, tag: '💎 Diplomatic Zone', icon: 'map-pin' },
  { name: 'Wuse 2 (Aminu Kano Crescent)', city: 'Wuse 2, Abuja, FCT', lat: 9.0765, lng: 7.4721, tag: '🛍️ Commercial & Dining', icon: 'shopping-bag' },
  { name: 'Jabi Lake Mall', city: 'Jabi, Abuja, FCT', lat: 9.0782, lng: 7.4258, tag: '🛍️ Shopping & Recreation', icon: 'shopping-bag' },
  { name: 'Garki Area 11 / Area 1', city: 'Garki, Abuja, FCT', lat: 9.0321, lng: 7.4891, tag: '🏛️ Commercial District', icon: 'building' },
  { name: 'Gwarinpa Estate (1st Avenue)', city: 'Gwarinpa, Abuja, FCT', lat: 9.1102, lng: 7.3912, tag: '🏘️ Mega Estate', icon: 'home' },

  // Rivers State (Port Harcourt)
  { name: 'Port Harcourt Int\'l Airport (Omagwa)', city: 'Omagwa, Port Harcourt', lat: 5.0155, lng: 6.9496, tag: '✈️ Airport', icon: 'plane' },
  { name: 'GRA Phase 2 (Tombia Street)', city: 'Port Harcourt, Rivers', lat: 4.8156, lng: 7.0012, tag: '🏢 Business & Leisure', icon: 'map-pin' },
  { name: 'Port Harcourt Mall (SPAR)', city: 'Aba Road, Port Harcourt', lat: 4.8012, lng: 7.0145, tag: '🛍️ Shopping Mall', icon: 'shopping-bag' },
  { name: 'Trans-Amadi Industrial Layout', city: 'Trans-Amadi, Port Harcourt', lat: 4.8211, lng: 7.0421, tag: '🏭 Industrial Hub', icon: 'briefcase' },

  // Oyo State (Ibadan)
  { name: 'Ibadan Airport (Alakia)', city: 'Alakia, Ibadan, Oyo', lat: 7.3625, lng: 3.9783, tag: '✈️ Airport', icon: 'plane' },
  { name: 'Bodija Market / Housing Estate', city: 'Bodija, Ibadan, Oyo', lat: 7.4321, lng: 3.9012, tag: '🏘️ Commercial & Residential', icon: 'map-pin' },
  { name: 'Dugbe Commercial Center', city: 'Dugbe, Ibadan, Oyo', lat: 7.3872, lng: 3.8765, tag: '🏢 CBD & Railway Station', icon: 'briefcase' },
  { name: 'Palms Mall Ring Road', city: 'Ring Road, Ibadan, Oyo', lat: 7.3645, lng: 3.8612, tag: '🛍️ Shopping Mall', icon: 'shopping-bag' },

  // Edo State (Benin City)
  { name: 'Benin Airport', city: 'Airport Road, Benin City, Edo', lat: 6.3170, lng: 5.5995, tag: '✈️ Airport', icon: 'plane' },
  { name: 'Ring Road / King\'s Square', city: 'Benin City, Edo', lat: 6.3350, lng: 5.6265, tag: '🏛️ Central City Hub', icon: 'map-pin' },

  // Kano State
  { name: 'Mallam Aminu Kano Int\'l Airport', city: 'Kano, Kano State', lat: 12.0476, lng: 8.5246, tag: '✈️ Airport', icon: 'plane' },
  { name: 'Sabon Gari Commercial District', city: 'Kano, Kano State', lat: 12.0125, lng: 8.5342, tag: '🛍️ Commercial Hub', icon: 'briefcase' },

  // Enugu State
  { name: 'Akanu Ibiam Int\'l Airport', city: 'Emene, Enugu', lat: 6.4743, lng: 7.5620, tag: '✈️ Airport', icon: 'plane' },
  { name: 'Polo Park Mall (Shoprite)', city: 'Abakaliki Road, GRA, Enugu', lat: 6.4512, lng: 7.5021, tag: '🛍️ Shopping Mall', icon: 'shopping-bag' },
];

// Quick shortcut jump pills for 1-tap booking
export const QUICK_DESTINATION_CHIPS = [
  { label: '✈️ MMIA Airport', name: 'Murtala Muhammed Int\'l Airport (MMIA)', lat: 6.5774, lng: 3.3212 },
  { label: '🏢 Victoria Island', name: 'Victoria Island, Lagos', lat: 6.4281, lng: 3.4219 },
  { label: '🛍️ Ikeja City Mall', name: 'Ikeja City Mall (ICM), Alausa', lat: 6.6195, lng: 3.3581 },
  { label: '🌴 Lekki Phase 1', name: 'Lekki Phase 1 (Admiralty Way)', lat: 6.4474, lng: 3.4735 },
  { label: '💻 Yaba Hub', name: 'Yaba Commercial Hub, Lagos', lat: 6.5167, lng: 3.3833 },
  { label: '🏛️ Abuja CBD', name: 'Central Business District, Abuja', lat: 9.0579, lng: 7.4951 },
];

/**
 * Filter popular Nigerian landmarks locally with 0ms delay
 */
export function searchLocalLandmarks(query, limit = 6) {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();
  return POPULAR_NIGERIAN_LANDMARKS.filter(item => 
    item.name.toLowerCase().includes(q) ||
    item.city.toLowerCase().includes(q) ||
    item.tag.toLowerCase().includes(q)
  ).slice(0, limit);
}

/**
 * Search live OpenStreetMap geocoder with debouncing & country code constraint (ng)
 */
export async function searchLivePlaces(query, signal) {
  if (!query || query.trim().length < 2) return [];
  const q = encodeURIComponent(query.trim());
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=ng&addressdetails=1&limit=6`;
  
  try {
    const res = await fetch(url, {
      signal,
      headers: {
        'Accept-Language': 'en',
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(item => ({
      name: item.display_name.split(',')[0],
      city: item.display_name.split(',').slice(1, 3).join(',').trim(),
      full_address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      tag: '📍 Location',
      icon: 'map-pin'
    }));
  } catch (err) {
    if (err.name === 'AbortError') return [];
    return [];
  }
}

/**
 * Clean up long reverse-geocoded addresses to make them user-friendly
 */
export function cleanAddress(raw) {
  if (!raw) return '';
  // Split commas and remove zip codes or repetition
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length <= 3) return raw;
  // Return first 3 parts (Street / Area / City)
  return parts.slice(0, 3).join(', ');
}

/**
 * Recent Places LocalStorage Manager
 */
const RECENT_KEY = 'ogadriver_recent_destinations';

export function getRecentPlaces() {
  try {
    const data = localStorage.getItem(RECENT_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecentPlace(place) {
  if (!place || (!place.name && !place.address)) return;
  try {
    const recents = getRecentPlaces();
    const entry = {
      name: place.name || place.address,
      address: place.address || place.name,
      lat: place.lat || null,
      lng: place.lng || null,
      timestamp: Date.now()
    };
    // De-duplicate
    const filtered = recents.filter(r => r.name.toLowerCase() !== entry.name.toLowerCase());
    const updated = [entry, ...filtered].slice(0, 5); // Keep top 5
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
}
