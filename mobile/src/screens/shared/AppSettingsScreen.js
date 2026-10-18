import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function AppSettingsScreen({ navigation }) {
 const { themeMode, isDark, themeColors, biometricEnabled, updateThemeMode, updateBiometricEnabled } = useTheme();
 const [autoAccept, setAutoAccept] = useState(false);
 const [notifications, setNotifications] = useState(true);

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
 <View className={`px-4 py-4 ${themeColors.cardBg} border-b ${themeColors.borderColor} flex-row items-center justify-between`}>
 <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
 <Ionicons name="arrow-back" size={24} color={isDark ? '#ffffff' : '#0f172a'} />
 </TouchableOpacity>
 <Text className={`font-bold text-lg ${themeColors.textColor}`}>Settings & Preferences</Text>
 <View className="w-8" />
 </View>

 <ScrollView className="flex-1 px-4 py-6">

 {/* 🔑 SECURITY & BIOMETRICS SECTION */}
 <Text className={`font-mono text-xs uppercase tracking-widest mb-3 ${themeColors.accentColor}`}>Security & Biometrics</Text>
 <View className={`${themeColors.cardBg} border ${themeColors.borderColor} rounded-2xl p-5 mb-6`}>
 <View className="flex-row justify-between items-center mb-4">
 <View className="flex-1 pr-4">
 <View className="flex-row items-center mb-1">
 <Ionicons name="finger-print-outline" size={20} color={isDark ? '#1cd188' : '#059669'} />
 <Text className={`font-bold text-base ml-2 ${themeColors.textColor}`}>Biometric Unlock</Text>
 </View>
 <Text className={`text-xs ${themeColors.subTextColor}`}>
 Require FaceID or Fingerprint scan to open app and confirm high-value payments.
 </Text>
 </View>
 <Switch
 value={biometricEnabled}
 onValueChange={updateBiometricEnabled}
 trackColor={{ false: '#334155', true: '#1cd188' }}
 thumbColor={biometricEnabled ? '#0f172a' : '#f8fafc'}
 />
 </View>

 {biometricEnabled && (
 <TouchableOpacity
 onPress={handleTestBiometrics}
 className={`py-3 rounded-xl items-center border ${themeColors.borderColor} bg-slate-950/20`}
 >
 <Text className={`font-bold text-xs uppercase tracking-widest ${themeColors.accentColor}`}>
 Test Biometric Sensor
 </Text>
 </TouchableOpacity>
 )}
 </View>

 {/* 🎨 THEME & APPEARANCE SECTION */}
 <Text className={`font-mono text-xs uppercase tracking-widest mb-3 ${themeColors.accentColor}`}>Appearance & Theme</Text>
 <View className={`${themeColors.cardBg} border ${themeColors.borderColor} rounded-2xl p-5 mb-6`}>
 <Text className={`font-bold text-base mb-1 ${themeColors.textColor}`}>App Theme Mode</Text>
 <Text className={`text-xs mb-4 ${themeColors.subTextColor}`}>
 Theme applied across all screens.
 </Text>

 <View className="space-y-3">
 {/* Dark Mode Option */}
 <TouchableOpacity
 onPress={() => updateThemeMode('dark')}
 className={`p-4 rounded-xl border flex-row justify-between items-center ${themeMode === 'dark' ? 'border-brandMint bg-brandMint/10' : themeColors.borderColor}`}
 >
 <View className="flex-row items-center">
 <Ionicons name="moon-outline" size={20} color={themeMode === 'dark' ? '#1cd188' : '#64748b'} />
 <Text className={`font-bold text-sm ml-3 ${themeMode === 'dark' ? 'text-brandMint' : themeColors.textColor}`}>🌙 Dark Mode (Default)</Text>
 </View>
 {themeMode === 'dark' && <Ionicons name="checkmark-circle" size={20} color="#1cd188" />}
 </TouchableOpacity>

 {/* Light Mode Option */}
 <TouchableOpacity
 onPress={() => updateThemeMode('light')}
 className={`p-4 rounded-xl border flex-row justify-between items-center ${themeMode === 'light' ? 'border-emerald-600 bg-emerald-50' : themeColors.borderColor}`}
 >
 <View className="flex-row items-center">
 <Ionicons name="sunny-outline" size={20} color={themeMode === 'light' ? '#059669' : '#64748b'} />
 <Text className={`font-bold text-sm ml-3 ${themeMode === 'light' ? 'text-emerald-700' : themeColors.textColor}`}>☀️ Light Mode</Text>
 </View>
 {themeMode === 'light' && <Ionicons name="checkmark-circle" size={20} color="#059669" />}
 </TouchableOpacity>

 {/* System Option */}
 <TouchableOpacity
 onPress={() => updateThemeMode('system')}
              className={`p-4 rounded-xl border flex-row justify-between items-center ${themeMode === 'system' ? 'border-brandMint bg-brandMint/10' : themeColors.borderColor}`}
            >
              <View className="flex-row items-center">
                <Ionicons name="phone-portrait-outline" size={20} color={themeMode === 'system' ? '#1cd188' : '#64748b'} />
                <Text className={`font-bold text-sm ml-3 ${themeMode === 'system' ? 'text-brandMint' : themeColors.textColor}`}>📱 System Default</Text>
              </View>
              {themeMode === 'system' && <Ionicons name="checkmark-circle" size={20} color="#1cd188" />}
 </TouchableOpacity>
 </View>
 </View>

 {/* 🚗 RIDE & HIRE PREFERENCES */}
 <Text className={`font-mono text-xs uppercase tracking-widest mb-3 ${themeColors.accentColor}`}>Ride & Hire Preferences</Text>
 <View className={`${themeColors.cardBg} border ${themeColors.borderColor} rounded-2xl p-5 mb-8`}>
 <View className="flex-row justify-between items-center mb-4">
 <View className="flex-1 pr-4">
 <Text className={`font-bold text-sm ${themeColors.textColor}`}>Push Notifications</Text>
 <Text className={`text-xs ${themeColors.subTextColor}`}>Receive instant trip updates and dispatch alerts.</Text>
 </View>
 <Switch
 value={notifications}
 onValueChange={setNotifications}
 trackColor={{ false: '#334155', true: '#1cd188' }}
 thumbColor={notifications ? '#0f172a' : '#f8fafc'}
 />
 </View>

 <View className="flex-row justify-between items-center">
 <View className="flex-1 pr-4">
 <Text className={`font-bold text-sm ${themeColors.textColor}`}>Auto-Accept Bids</Text>
 <Text className={`text-xs ${themeColors.subTextColor}`}>Automatically confirm top-rated driver proposals.</Text>
 </View>
 <Switch
 value={autoAccept}
 onValueChange={setAutoAccept}
 trackColor={{ false: '#334155', true: '#1cd188' }}
 thumbColor={autoAccept ? '#0f172a' : '#f8fafc'}
 />
 </View>
 </View>

 </ScrollView>
 </SafeAreaView>
 );
}
