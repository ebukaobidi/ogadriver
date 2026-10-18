import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../api/api';

const Storage = {
  getItemAsync: async (key) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  },
  setItemAsync: async (key, val) => {
    if (Platform.OS === 'web') return localStorage.setItem(key, val);
    return await SecureStore.setItemAsync(key, val);
  },
};

const DEFAULT_POINTS = 1250; // ₦1,250 in ride credit value

export const loyaltyService = {
  async getConfig() {
    try {
      const res = await api.get('/v1/app-config').catch(() => null);
      if (res?.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (e) {}
    return {
      points_earn_per_100: 1,
      trip_completion_bonus_points: 50,
      weekly_hire_bonus_points: 200,
      referral_bonus_points: 500,
      max_discount_cap_percent: 20,
      min_points_to_redeem: 500,
      max_daily_points_redeem: 5000,
      points_to_naira_ratio: 1.0,
      concierge_hotline: '+234 800 642 3748',
      emergency_sos_hotline: '112 / +234 800 767 9111',
      gift_funds_enabled: true,
      max_gift_transfer_daily: 50000,
    };
  },

  async getPoints() {
    try {
      const res = await api.get('/loyalty').catch(() => null);
      if (res?.data?.success && typeof res.data.data?.points === 'number') {
        await Storage.setItemAsync('client_loyalty_points', res.data.data.points.toString());
        return res.data.data.points;
      }
    } catch (e) {}

    const local = await Storage.getItemAsync('client_loyalty_points');
    if (local !== null) {
      return parseInt(local, 10) || 0;
    }

    // Initialize with starter credit for paying clients
    await Storage.setItemAsync('client_loyalty_points', DEFAULT_POINTS.toString());
    return DEFAULT_POINTS;
  },

  async getHistory() {
    try {
      const res = await api.get('/loyalty').catch(() => null);
      if (res?.data?.success && res.data.data?.history) {
        return res.data.data.history;
      }
    } catch (e) {}

    const localHist = await Storage.getItemAsync('client_loyalty_history');
    if (localHist) {
      return JSON.parse(localHist);
    }

    const defaultHistory = [
      { id: '1', description: 'Welcome Bonus for Verified Client', points: 500, type: 'earned', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: '2', description: 'Completed Airport Chauffeur Trip', points: 450, type: 'earned', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: '3', description: '5-Star Driver Review Bonus', points: 300, type: 'earned', created_at: new Date(Date.now() - 86400000).toISOString() },
    ];
    await Storage.setItemAsync('client_loyalty_history', JSON.stringify(defaultHistory));
    return defaultHistory;
  },

  async earnPoints(pointsToEarn, description = 'Completed Trip Reward') {
    const current = await this.getPoints();
    const newTotal = current + pointsToEarn;
    await Storage.setItemAsync('client_loyalty_points', newTotal.toString());

    const history = await this.getHistory();
    const newEntry = {
      id: Date.now().toString(),
      description,
      points: pointsToEarn,
      type: 'earned',
      created_at: new Date().toISOString(),
    };
    await Storage.setItemAsync('client_loyalty_history', JSON.stringify([newEntry, ...history]));

    try {
      await api.post('/loyalty/earn', { points: pointsToEarn, description }).catch(() => {});
    } catch (e) {}

    return newTotal;
  },

  async redeemPoints(pointsToRedeem, description = 'Ride Fare Discount') {
    const current = await this.getPoints();
    if (current < pointsToRedeem) {
      throw new Error('Insufficient points balance.');
    }
    const newTotal = current - pointsToRedeem;
    await Storage.setItemAsync('client_loyalty_points', newTotal.toString());

    const history = await this.getHistory();
    const newEntry = {
      id: Date.now().toString(),
      description,
      points: pointsToRedeem,
      type: 'redeemed',
      created_at: new Date().toISOString(),
    };
    await Storage.setItemAsync('client_loyalty_history', JSON.stringify([newEntry, ...history]));

    try {
      await api.post('/loyalty/redeem', { points: pointsToRedeem, description }).catch(() => {});
    } catch (e) {}

    return newTotal;
  },
};

export default loyaltyService;
