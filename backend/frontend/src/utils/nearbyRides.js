export async function fetchNearbyRides(lat, lng) {
  const apiKey = import.meta.env.VITE_NEARBY_RIDES_API_KEY || process.env.NEARBY_RIDES_API_KEY;
  if (!apiKey) {
    console.error('NEARBY_RIDES_API_KEY is not set');
    return [];
  }
  const radius = 5000; // meters
  const keywords = encodeURIComponent('Uber|Lyft|taxi|ride share');
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=establishment&keyword=${keywords}&key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', data.status, data.error_message);
      return [];
    }
    // Map to simplified objects
    const results = data.results.map(place => {
      const distance = haversineDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
      return {
        name: place.name,
        address: place.vicinity,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        distance,
        // Deep link to Uber app as a fallback (Lyft would have similar)
        uberLink: `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${place.geometry.location.lat}&dropoff[longitude]=${place.geometry.location.lng}`,
        // Lyft deep link
        lyftLink: `lyft://ridetype?id=lyft&destination[latitude]=${place.geometry.location.lat}&destination[longitude]=${place.geometry.location.lng}`,
      };
    });
    return results;
  } catch (e) {
    console.error('Failed to fetch nearby rides', e);
    return [];
  }
}

// Helper to calculate distance in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
}
