import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme, Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const safeGetItem = async (key) => {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return await SecureStore.getItemAsync(key);
};

const safeSetItem = async (key, val) => {
  if (Platform.OS === 'web') return localStorage.setItem(key, val);
  return await SecureStore.setItemAsync(key, val);
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'system' (phone default theme), 'dark', 'light'
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await safeGetItem('app_theme_mode');
      if (savedTheme) {
        setThemeMode(savedTheme);
      }

      const savedBio = await safeGetItem('biometric_enabled');
      if (savedBio !== null) {
        setBiometricEnabled(savedBio === 'true');
      }
    } catch (e) {
      console.log('Error loading theme/biometric settings:', e);
    }
  };

  const updateThemeMode = async (mode) => {
    setThemeMode(mode);
    await safeSetItem('app_theme_mode', mode);
  };

  const updateBiometricEnabled = async (enabled) => {
    setBiometricEnabled(enabled);
    await safeSetItem('biometric_enabled', enabled ? 'true' : 'false');
    Alert.alert(
      'Biometric Security',
      enabled
        ? 'Biometric Authentication (FaceID / Fingerprint) is now ENABLED for app access.'
        : 'Biometric Authentication has been DISABLED.'
    );
  };

  const isDark = themeMode === 'system' ? deviceColorScheme === 'dark' : themeMode === 'dark';

  const themeColors = isDark ? {
    bg: 'bg-slate-950',
    cardBg: 'bg-slate-900',
    borderColor: 'border-slate-800',
    textColor: 'text-white',
    subTextColor: 'text-slate-400',
    accentColor: 'text-emerald-400',
    buttonBg: 'bg-emerald-600',
    buttonText: 'text-white',
    statusBar: 'light',
    rawBg: '#090d16',
    rawCardBg: '#121927',
    rawBorder: '#1e293b',
    rawText: '#ffffff',
    rawSubText: '#94a3b8',
    rawPrimary: '#008751',
    rawBrandGreen: '#10b981',
    rawEmerald: '#008751',
    // Road Sign & Traffic Caution Yellow Touches
    rawRoadYellow: '#ffc107',
    rawTrafficYellow: '#fbbf24',
    rawAmber: '#f59e0b',
    roadSignBg: 'rgba(255, 193, 7, 0.15)',
    roadSignBorder: '#f59e0b',
  } : {
    bg: 'bg-white',
    cardBg: 'bg-white',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-900',
    subTextColor: 'text-slate-600',
    accentColor: 'text-emerald-700',
    buttonBg: 'bg-emerald-700',
    buttonText: 'text-white',
    statusBar: 'dark',
    rawBg: '#ffffff',
    rawCardBg: '#f8fafc',
    rawBorder: '#e2e8f0',
    rawText: '#0f172a',
    rawSubText: '#64748b',
    rawPrimary: '#008751',
    rawBrandGreen: '#059669',
    rawEmerald: '#008751',
    // Road Sign & Traffic Caution Yellow Touches
    rawRoadYellow: '#f59e0b',
    rawTrafficYellow: '#d97706',
    rawAmber: '#f59e0b',
    roadSignBg: '#fffbeb',
    roadSignBorder: '#f59e0b',
  };

  return (
    <ThemeContext.Provider value={{
      themeMode,
      isDark,
      themeColors,
      biometricEnabled,
      updateThemeMode,
      updateBiometricEnabled,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
