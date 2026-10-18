import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For Android emulator, localhost is 10.0.2.2. For Reverb default port is 8080.
const REVERB_KEY = process.env.EXPO_PUBLIC_REVERB_KEY || 'configure_in_env';
const WS_URL = 'wss://ogadriver.ng';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  async connect() {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected to Reverb');
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle Pusher protocol messages
          if (data.event === 'pusher:connection_established') {
            console.log('Pusher connection established');
            return;
          }

          if (data.event === 'pusher:error') {
            console.error('Pusher error:', data.data.message);
            return;
          }

          // Emit regular events
          this.emit(data.event || 'message', data.data || data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(event, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Channel-specific methods for Laravel Reverb/Pusher compatibility
  subscribe(channel) {
    this.send('pusher:subscribe', { channel });
  }

  unsubscribe(channel) {
    this.send('pusher:unsubscribe', { channel });
  }

  subscribeToDriverChannel(driverId) {
    this.subscribe(`private-driver.${driverId}`);
  }

  subscribeToBookingChannel(bookingId) {
    this.subscribe(`private-bookings.${bookingId}.updates`);
  }

  subscribeToChatChannel(conversationId) {
    this.subscribe(`private-chat.${conversationId}`);
  }
}

export default new WebSocketService();
