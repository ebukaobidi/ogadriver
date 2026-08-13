import { useEffect, useCallback } from 'react';
import websocket from '../services/websocket';
import * as SecureStore from 'expo-secure-store';

export function useWebSocket() {
  useEffect(() => {
    let mounted = true;

    const initWebSocket = async () => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token && mounted) {
        websocket.connect();
      }
    };

    initWebSocket();

    return () => {
      mounted = false;
      websocket.disconnect();
    };
  }, []);

  const subscribe = useCallback((event, callback) => {
    websocket.on(event, callback);
    return () => websocket.off(event, callback);
  }, []);

  const send = useCallback((event, data) => {
    websocket.send(event, data);
  }, []);

  const subscribeToDriverChannel = useCallback((driverId) => {
    websocket.subscribeToDriverChannel(driverId);
  }, []);

  const subscribeToBookingChannel = useCallback((bookingId) => {
    websocket.subscribeToBookingChannel(bookingId);
  }, []);

  return {
    subscribe,
    send,
    subscribeToDriverChannel,
    subscribeToBookingChannel,
  };
}
