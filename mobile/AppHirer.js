import React, { useState, useEffect } from 'react';
import { View, Platform, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import HirerNavigator from './src/navigation/HirerNavigator';
import HirerLoginScreen from './src/screens/hirer/HirerLoginScreen';
import HirerRegisterScreen from './src/screens/hirer/HirerRegisterScreen';
import OnboardingScreen from './src/screens/shared/OnboardingScreen';
import AppSettingsScreen from './src/screens/shared/AppSettingsScreen';
import notificationService, { registerForPushNotificationsAsync } from './src/services/notifications';
import AppControlReceiver from './src/components/AppControlReceiver';
import { ThemeProvider } from './src/context/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

const Storage = {
  getItemAsync: async (key) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  },
  setItemAsync: async (key, value) => {
    if (Platform.OS === 'web') return localStorage.setItem(key, value);
    return await SecureStore.setItemAsync(key, value);
  },
  deleteItemAsync: async (key) => {
    if (Platform.OS === 'web') return localStorage.removeItem(key);
    return await SecureStore.deleteItemAsync(key);
  }
};

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#090d16',
    card: '#090d16',
    text: '#ffffff',
    border: '#1e293b',
  },
};

const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    border: '#e2e8f0',
  },
};

export default function AppHirer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();

  const checkAuth = async () => {
    try {
      const token = await Storage.getItemAsync('auth_token');
      if (token) {
        setIsAuthenticated(true);
        registerForPushNotificationsAsync();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    notificationService.registerPushToken();
    checkAuth();
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await Storage.deleteItemAsync('auth_token');
    } catch (e) {}
    setIsAuthenticated(false);
  };

  if (isLoading) return null;

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar style="light" />
      <ThemeProvider>
        <NavigationContainer theme={colorScheme === 'dark' ? customDarkTheme : customLightTheme}>
          <AppControlReceiver>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name="Main"
                component={HirerNavigator}
                initialParams={{ onLogout: handleLogout }}
              />
              <Stack.Screen
                name="Login"
                component={HirerLoginScreen}
                initialParams={{ onLogin: handleLogin }}
              />
              <Stack.Screen
                name="Register"
                component={HirerRegisterScreen}
                initialParams={{ onLogin: handleLogin }}
              />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
            </Stack.Navigator>
          </AppControlReceiver>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
