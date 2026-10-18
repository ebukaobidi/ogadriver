import React, { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import DriverNavigator from './DriverNavigator';
import HirerNavigator from './HirerNavigator';

export default function HybridNavigator({ route }) {
  const [activeMode, setActiveMode] = useState(() => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('active_user_mode') || 'driver';
    }
    return 'driver';
  });
  const onLogout = route.params?.onLogout;

  const loadSavedMode = async () => {
    try {
      let saved;
      if (Platform.OS === 'web') {
        saved = localStorage.getItem('active_user_mode');
      } else {
        saved = await SecureStore.getItemAsync('active_user_mode');
      }
      if (saved) {
        setActiveMode(saved);
      }
    } catch (e) {
      console.log('Error loading saved mode:', e);
    }
  };

  useEffect(() => {
    loadSavedMode();
  }, []);

  const handleSwitchMode = async (newMode) => {
    setActiveMode(newMode);
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('active_user_mode', newMode);
      } else {
        await SecureStore.setItemAsync('active_user_mode', newMode);
      }
    } catch (e) {
      console.log('Error saving mode:', e);
    }
  };

  if (activeMode === 'driver') {
    return <DriverNavigator route={{ params: { onLogout, onSwitchMode: handleSwitchMode } }} />;
  }

  return <HirerNavigator route={{ params: { onLogout, onSwitchMode: handleSwitchMode } }} />;
}
