import api from '../api/axios';

const STORAGE_KEY = 'ogadriver_offline_gps_waypoints';

export const offlineGpsBuffer = {
  /** Add a GPS waypoint to local offline storage buffer */
  bufferWaypoint(waypoint) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const waypoints = stored ? JSON.parse(stored) : [];
      waypoints.push({
        ...waypoint,
        timestamp: Date.now(),
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(waypoints.slice(-100))); // Keep last 100
    } catch (e) {
      console.warn('Could not buffer offline GPS waypoint', e);
    }
  },

  /** Flush buffered waypoints to server when online */
  async flushBuffer() {
    if (!navigator.onLine) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const waypoints = JSON.parse(stored);
      if (!Array.isArray(waypoints) || waypoints.length === 0) return;

      await api.post('/bookings/sync-offline-waypoints', { waypoints });
      localStorage.removeItem(STORAGE_KEY);
      console.log(`Synced ${waypoints.length} offline GPS waypoints with server.`);
    } catch (e) {
      console.warn('Failed to flush offline GPS waypoints', e);
    }
  },

  /** Initialize automatic online listener */
  initAutoSync() {
    window.addEventListener('online', () => {
      this.flushBuffer();
    });
  },
};

// Auto-initialize online listener
offlineGpsBuffer.initAutoSync();
