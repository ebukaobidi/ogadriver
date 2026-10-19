import React, { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import DriverNavigator from './DriverNavigator';
import HirerNavigator from './HirerNavigator';

import { authService } from '../api/api';

export default function HybridNavigator({ route }) {
  const isHirerApp = process.env.EXPO_PUBLIC_APP_VARIANT === 'hirer';
  const defaultVariantMode = isHirerApp ? 'hirer' : 'driver';

  const [activeMode, setActiveMode] = useState(() => {
    if (isHirerApp) return 'hirer';
    if (Platform.OS === 'web') {
      return localStorage.getItem('active_user_mode') || defaultVariantMode;
    }
    return defaultVariantMode;
  });
  const onLogout = route.params?.onLogout;

  const loadSavedMode = async () => {
    try {
      if (isHirerApp) {
        setActiveMode('hirer');
        return;
      }
      let saved;
      if (Platform.OS === 'web') {
        saved = localStorage.getItem('active_user_mode');
      } else {
        saved = await SecureStore.getItemAsync('active_user_mode');
      }
      if (saved) {
        setActiveMode(saved);
      } else {
        const user = await authService.getUser().catch(() => null);
        if (user?.role === 'hirer' || user?.role === 'employer') {
          setActiveMode('hirer');
        } else {
          setActiveMode('driver');
        }
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
