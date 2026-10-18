import React, { useState, useEffect } from 'react';
import { View, Platform, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import DriverNavigator from './src/navigation/DriverNavigator';
import DriverLoginScreen from './src/screens/driver/DriverLoginScreen';
import DriverRegisterScreen from './src/screens/driver/DriverRegisterScreen';
import DriverStatusScreen from './src/screens/driver/DriverStatusScreen';
import DriverApplicationReviewScreen from './src/screens/driver/DriverApplicationReviewScreen';
import OnboardingScreen from './src/screens/shared/OnboardingScreen';
import AppSettingsScreen from './src/screens/shared/AppSettingsScreen';
import notificationService, { registerForPushNotificationsAsync } from './src/services/notifications';
import AppControlReceiver from './src/components/AppControlReceiver';
import { ThemeProvider } from './src/context/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

const Storage = {
  getItemAsync: async (key) => {
    try {
      if (Platform.OS === 'web') return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return null;
    }
  },
  setItemAsync: async (key, value) => {
    try {
      if (Platform.OS === 'web') return typeof localStorage !== 'undefined' ? localStorage.setItem(key, value) : null;
      return await SecureStore.setItemAsync(key, value);
    } catch (e) {}
  },
  deleteItemAsync: async (key) => {
    try {
      if (Platform.OS === 'web') return typeof localStorage !== 'undefined' ? localStorage.removeItem(key) : null;
      return await SecureStore.deleteItemAsync(key);
    } catch (e) {}
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

export default function AppDriver() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
                component={DriverNavigator}
                initialParams={{ onLogout: handleLogout }}
              />
              <Stack.Screen
                name="Login"
                component={DriverLoginScreen}
                initialParams={{ onLogin: handleLogin }}
              />
              <Stack.Screen
                name="Register"
                component={DriverRegisterScreen}
                initialParams={{ onLogin: handleLogin }}
              />
              <Stack.Screen name="DriverStatus" component={DriverStatusScreen} />
              <Stack.Screen name="DriverApplicationReview" component={DriverApplicationReviewScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
            </Stack.Navigator>
          </AppControlReceiver>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
