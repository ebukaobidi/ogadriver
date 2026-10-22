import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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
  }
};
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

import DriverLoginScreen from '../screens/driver/DriverLoginScreen';
import DriverRegisterScreen from '../screens/driver/DriverRegisterScreen';
import HirerLoginScreen from '../screens/hirer/HirerLoginScreen';
import HirerRegisterScreen from '../screens/hirer/HirerRegisterScreen';
import DriverStatusScreen from '../screens/driver/DriverStatusScreen';
import DriverApplicationReviewScreen from '../screens/driver/DriverApplicationReviewScreen';
import OnboardingScreen from '../screens/shared/OnboardingScreen';
import AppSettingsScreen from '../screens/shared/AppSettingsScreen';
import AppLockScreen from '../screens/shared/AppLockScreen';
import HybridNavigator from './HybridNavigator';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { CountryProvider } from '../context/CountryContext';
import { authService } from '../api/api';

import { registerForPushNotificationsAsync } from '../services/notifications';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0f172a',
    card: '#0f172a',
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


export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const colorScheme = useColorScheme();

  const checkAuth = async () => {
    try {
      const token = await Storage.getItemAsync('auth_token');
      if (token) {
        setIsAuthenticated(true);
        const user = await authService.getUser().catch(() => null);
        setUserRole(user?.role);
        registerForPushNotificationsAsync();
      } else {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error(e);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setUserRole(user?.role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (isLoading) return null;

  const linking = {
    prefixes: ['ogadriver://', 'https://ogadriver.ng', 'https://*.ogadriver.ng'],
    config: {
      screens: {
        Login: 'login',
        Register: 'register',
        Onboarding: 'onboarding',
        Main: {
          screens: {
            Home: 'home',
            Profile: 'profile',
            Jobs: 'jobs/:id'
          }
        },
        AppSettings: 'settings',
      },
    },
  };

  return (
    <ThemeProvider>
      <CountryProvider>
        <ThemedNavigationContent
          linking={linking}
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
        />
      </CountryProvider>
    </ThemeProvider>
  );
}

function ThemedNavigationContent({ linking, isAuthenticated, handleLogin, handleLogout }) {
  const { isDark } = useTheme();

  return (
    <NavigationContainer 
      linking={linking}
      theme={isDark ? customDarkTheme : customLightTheme}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={process.env.EXPO_PUBLIC_APP_VARIANT === 'hirer' ? HirerLoginScreen : DriverLoginScreen} 
              initialParams={{ onLogin: handleLogin }} 
            />
            <Stack.Screen 
              name="Register" 
              component={process.env.EXPO_PUBLIC_APP_VARIANT === 'hirer' ? HirerRegisterScreen : DriverRegisterScreen} 
            />
            {process.env.EXPO_PUBLIC_APP_VARIANT !== 'hirer' && (
              <>
                <Stack.Screen name="DriverStatus" component={DriverStatusScreen} />
                <Stack.Screen name="DriverApplicationReview" component={DriverApplicationReviewScreen} />
              </>
            )}
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={HybridNavigator} initialParams={{ onLogout: handleLogout }} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
            <Stack.Screen name="AppLock" component={AppLockScreen} options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}



