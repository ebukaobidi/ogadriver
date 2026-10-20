import Constants from 'expo-constants';

/**
 * Validates if a legitimate Google Maps API key has been provided.
 * If the key is dummy, empty, or unconfigured, returns false so that native screens
 * render the lightweight vector cartography canvas instead of initializing Google Play Services.
 * This completely prevents Google Play Services from popping up the authorization
 * error dialog with [OK] and [Cancel] that crashes/exits the app when Cancel is pressed.
 */
export const isGoogleMapsConfigured = () => {
  try {
    const envKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    const manifestKey = Constants?.expoConfig?.android?.config?.googleMaps?.apiKey;
    const key = envKey || manifestKey;

    if (!key || typeof key !== 'string') return false;
    if (key.includes('Dummy') || key.includes('ForCompilationOnly') || key.includes('AIzaSyDummy')) return false;
    if (key.length < 20) return false;

    return true;
  } catch (e) {
    return false;
  }
};
