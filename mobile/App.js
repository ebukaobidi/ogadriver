import React, { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import notificationService from './src/services/notifications';
import AppControlReceiver from './src/components/AppControlReceiver';
import { CountryProvider } from './src/context/CountryContext';
import { LanguageProvider } from './src/context/LanguageContext';
import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {
  useEffect(() => {
    try {
      notificationService.registerPushToken().catch(() => {});
    } catch (e) {}
  }, []);

  return (
    <ErrorBoundary>
      <View style={{ flex: 1 }}>
        <StatusBar style="light" />
        <CountryProvider>
          <LanguageProvider>
            <AppControlReceiver>
              <AppNavigator />
            </AppControlReceiver>
          </LanguageProvider>
        </CountryProvider>
      </View>
    </ErrorBoundary>
  );
}
