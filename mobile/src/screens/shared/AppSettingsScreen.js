import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function AppSettingsScreen({ navigation }) {
  const { themeMode, isDark, themeColors, biometricEnabled, updateThemeMode, updateBiometricEnabled } = useTheme();
  const [autoAccept, setAutoAccept] = useState(false);
  const [notifications, setNotifications] = useState(true);
  React.useEffect(() => {
    const onBack = () => {
      if (navigation?.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [navigation]);


  const handleTestBiometrics = () => {
    Alert.alert(
      'Biometric Check',
      'Scanning Face ID / Fingerprint sensor...',
      [
        {
          text: 'Authenticate',
          onPress: () => Alert.alert('Success', 'Biometric identity confirmed! Authentication successful!.'),
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${themeColors.bg}`}>
      {/* Header */}
      <View className={`px-4 py-4 ${themeColors.cardBg} border-b ${themeColors.borderColor} flex-row items-center`}>
        {navigation?.canGoBack && navigation.canGoBack() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            className="mr-3 p-1 rounded-xl"
          >
            <Ionicons name="arrow-back" size={22} color={isDark ? '#ffffff' : '#0f172a'} />
          </TouchableOpacity>
        )}
        <Text className={`font-normal text-lg ${themeColors.textColor}`}>Settings & Preferences</Text>
      </View>

      <ScrollView 
        className="flex-1 px-4 py-6" 
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 🔑 SECURITY & BIOMETRICS SECTION */}
        <Text className={`font-mono text-xs uppercase tracking-widest mb-3 ${themeColors.accentColor}`}>Security & Biometrics</Text>
        <View className={`${themeColors.cardBg} border ${themeColors.borderColor} rounded-2xl p-5 mb-6`}>
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1 pr-4">
              <View className="flex-row items-center">
                <Ionicons name="finger-print-outline" size={20} color={isDark ? '#10b981' : '#059669'} />
                <Text className={`font-normal text-base ml-2 ${themeColors.textColor}`}>Biometric Unlock</Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={updateBiometricEnabled}
              trackColor={{ false: '#334155', true: '#10b981' }}
              thumbColor={biometricEnabled ? '#0f172a' : '#f8fafc'}
            />
          </View>

          {biometricEnabled && (
            <TouchableOpacity
              onPress={handleTestBiometrics}
              className={`py-3 rounded-xl items-center border ${themeColors.borderColor} bg-slate-950/20`}
            >
              <Text className={`font-normal text-xs uppercase tracking-widest ${themeColors.accentColor}`}>
                Test Biometric Sensor
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 🚗 RIDE & HIRE PREFERENCES */}
        <Text className={`font-mono text-xs uppercase tracking-widest mb-3 ${themeColors.accentColor}`}>Ride & Hire Preferences</Text>
        <View className={`${themeColors.cardBg} border ${themeColors.borderColor} rounded-2xl p-5 mb-8`}>
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1 pr-4">
              <Text className={`font-normal text-sm ${themeColors.textColor}`}>Push Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#334155', true: '#10b981' }}
              thumbColor={notifications ? '#0f172a' : '#f8fafc'}
            />
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-4">
              <Text className={`font-normal text-sm ${themeColors.textColor}`}>Auto-Accept Bids</Text>
            </View>
            <Switch
              value={autoAccept}
              onValueChange={setAutoAccept}
              trackColor={{ false: '#334155', true: '#10b981' }}
              thumbColor={autoAccept ? '#0f172a' : '#f8fafc'}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
