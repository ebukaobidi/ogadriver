import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { driverService, authService } from '../../api/api';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function DriverSettingsScreen({ navigation }) {
  const { isDark } = useTheme();
  const [driver, setDriver] = useState(null);

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    itemBg: isDark ? '#090d16' : '#ffffff',
    itemBorder: isDark ? '#1e293b' : '#cbd5e1',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: isDark ? '#00e588' : '#059669',
    headerBtnBg: isDark ? '#0f172a' : '#f1f5f9',
    headerBtnBorder: isDark ? '#1e293b' : '#e2e8f0',
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await authService.getUser();
      if (userData?.driver?.id) {
        const driverData = await driverService.getProfile(userData.driver.id);
        setDriver(driverData.data);
      }
    } catch (error) {
      console.error('Error loading driver settings data:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      <ScrollView className="flex-1 px-4 pt-3 pb-8" showsVerticalScrollIndicator={false}>
        {/* Top App Bar Header */}
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 items-center justify-center mr-2 relative">
              <Ionicons name="person" size={16} color="#10b981" />
              <View className="w-3 h-3 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 items-center justify-center">
                <Ionicons name="checkmark" size={8} color="#ffffff" />
              </View>
            </View>
            <Text style={{ color: themeStyles.primaryText }} className="font-normal text-lg">Oga Driver</Text>
          </View>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity 
              style={{ backgroundColor: themeStyles.headerBtnBg, borderColor: themeStyles.headerBtnBorder }}
              className="p-2 rounded-xl border mr-2"
            >
              <Ionicons name="chatbubble-outline" size={18} color={themeStyles.primaryText} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ backgroundColor: themeStyles.headerBtnBg, borderColor: themeStyles.headerBtnBorder }}
              className="p-2 rounded-xl border"
            >
              <Ionicons name="notifications-outline" size={18} color={themeStyles.primaryText} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Subheader Title */}
        <Text style={{ color: themeStyles.brandGreen }} className="text-center font-mono text-[10px] uppercase font-bold tracking-widest mb-4">
          MORE OPTIONS
        </Text>

        {/* Bottom Sheet Container Card */}
        <View 
          style={{
            backgroundColor: themeStyles.cardBg,
            borderColor: themeStyles.cardBorder,
            borderWidth: 1
          }}
          className="rounded-3xl p-5 pt-3 shadow-2xl relative mb-6"
        >
          {/* Drag Handle Notch */}
          <View 
            style={{ backgroundColor: isDark ? '#334155' : '#cbd5e1' }} 
            className="w-12 h-1 rounded-full self-center mb-5 opacity-70" 
          />

          {/* Top Row: 4 Column Grid */}
          <View className="flex-row justify-between mb-3">
            <TouchableOpacity
              style={{
                backgroundColor: themeStyles.itemBg,
                borderColor: themeStyles.cardBorder,
                borderWidth: 1
              }}
              className="w-[23%] rounded-2xl p-2.5 items-center justify-center py-4"
              onPress={() => navigation.navigate('Proposals')}
            >
              <View 
                style={{
                  backgroundColor: isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                  borderColor: themeStyles.brandGreen,
                  borderWidth: 1
                }}
                className="w-10 h-10 rounded-xl items-center justify-center mb-2"
              >
                <Ionicons name="sparkles-outline" size={20} color={themeStyles.brandGreen} />
              </View>
              <Text style={{ color: themeStyles.primaryText }} className="font-bold text-[10px] text-center">Job Offers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: themeStyles.itemBg,
                borderColor: themeStyles.cardBorder,
                borderWidth: 1
              }}
              className="w-[23%] rounded-2xl p-2.5 items-center justify-center py-4"
              onPress={() => navigation.navigate('DriverAssessment')}
            >
              <View 
                style={{
                  backgroundColor: isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                  borderColor: themeStyles.brandGreen,
                  borderWidth: 1
                }}
                className="w-10 h-10 rounded-xl items-center justify-center mb-2"
              >
                <Ionicons name="game-controller-outline" size={20} color={themeStyles.brandGreen} />
              </View>
              <Text style={{ color: themeStyles.primaryText }} className="font-normal text-[9px] text-center">Simulations & Training</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: themeStyles.itemBg,
                borderColor: themeStyles.cardBorder,
                borderWidth: 1
              }}
              className="w-[23%] rounded-2xl p-2.5 items-center justify-center py-4"
              onPress={() => navigation.navigate('DriverProfile')}
            >
              <View 
                style={{
                  backgroundColor: isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                  borderColor: themeStyles.brandGreen,
                  borderWidth: 1
                }}
                className="w-10 h-10 rounded-xl items-center justify-center mb-2"
              >
                <Ionicons name="star-outline" size={20} color={themeStyles.brandGreen} />
              </View>
              <Text style={{ color: themeStyles.primaryText }} className="font-bold text-[10px] text-center">My Ratings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: themeStyles.itemBg,
                borderColor: themeStyles.cardBorder,
                borderWidth: 1
              }}
              className="w-[23%] rounded-2xl p-2.5 items-center justify-center py-4"
              onPress={() => navigation.navigate('Referrals')}
            >
              <View 
                style={{
                  backgroundColor: isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                  borderColor: themeStyles.brandGreen,
                  borderWidth: 1
                }}
                className="w-10 h-10 rounded-xl items-center justify-center mb-2"
              >
                <Ionicons name="gift-outline" size={20} color={themeStyles.brandGreen} />
              </View>
              <Text style={{ color: themeStyles.primaryText }} className="font-bold text-[9px] text-center">Referrals</Text>
            </TouchableOpacity>
          </View>

          {/* Legal Subtext */}
          <View className="flex-row items-center justify-between pt-2">
            <View className="w-full pl-3 pr-1">
              <Text style={{ color: themeStyles.subText }} className="text-[10px] leading-tight text-center">
                Regulatory compliance terms and partner dispatch utilities updated for all active drivers. All rights reserved.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
