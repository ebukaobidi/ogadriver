import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from '../api/api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.pushToken = null;
  }

  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return false;
    }

    return true;
  }

  async registerPushToken() {
    if (Platform.OS === 'web') return null;
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId || '620f6923-55e5-4e86-802d-b61bba5939af';
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.pushToken = tokenData.data;

      // Send token to backend
      const userStr = await SecureStore.getItemAsync('user');
      if (userStr) {
        try {
          await api.post('/notifications/fcm-token', {
            fcm_token: this.pushToken,
            platform: Platform.OS,
          });
        } catch (e) {
          // Fallback if endpoint varies
          try {
            await api.post('/user/push-token', {
              push_token: this.pushToken,
              platform: Platform.OS,
            });
          } catch (err) {}
        }
      }

      return this.pushToken;
    } catch (error) {
      console.error('Error registering push token:', error);
      return null;
    }
  }

  async scheduleLocalNotification(title, body, data = {}, delaySeconds = 0) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  addNotificationListener(listener) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  addNotificationResponseListener(listener) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  async getBadgeCount() {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count) {
    await Notifications.setBadgeCountAsync(count);
  }
}

const notificationService = new NotificationService();
export const registerForPushNotificationsAsync = async () => {
  return await notificationService.registerPushToken();
};
export default notificationService;
