import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import notificationService from './src/services/notifications';

export default function App() {
  useEffect(() => {
    // Initialize push notifications
    notificationService.registerPushToken();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}
