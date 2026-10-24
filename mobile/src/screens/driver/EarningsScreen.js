import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { authService, api } from '../../api/api';
import HeaderBar from '../../components/HeaderBar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCountry } from '../../context/CountryContext';

const Storage = {
  getItemAsync: async (key) => {
    try {
      if (Platform.OS === 'web') return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return null;
    }
  }
};

export default function EarningsScreen({ navigation }) {
  const { isDark } = useTheme();
  const { country: globalCountry } = useCountry();
  const [earnings, setEarnings] = useState({
    this_week: 0,
    rides_earnings: 0,
    hire_earnings: 0,
    today_earnings: 0,
    month_earnings: 0,
    total_earnings: 0,
    bank_name: ''
  });
  const [savedBankDisplay, setSavedBankDisplay] = useState('Add Bank Account');
  const [refreshing, setRefreshing] = useState(false);

  const fetchEarnings = async () => {
    try {
      const stored = await Storage.getItemAsync('driver_saved_bank_accounts');
      let foundLocalBank = false;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedBankDisplay(`${parsed[0].bankName.split(' ')[0]} (••${parsed[0].accountNumber.slice(-4)})`);
            foundLocalBank = true;
          }
        } catch (e) {}
      }

      const user = await authService.getUser().catch(() => null);
      if (user?.driver_id || user?.driver?.id) {
        const driverId = user.driver_id || user.driver.id;
        const [summaryRes, walletRes] = await Promise.all([
          api.get(`/drivers/${driverId}/earnings-summary`).catch(() => null),
          api.get('/wallet').catch(() => null)
        ]);
        if (summaryRes?.data?.data) {
          setEarnings(prev => ({
            ...prev,
            ...summaryRes.data.data
          }));
        }
      }
      if (!foundLocalBank && user?.bank_name) {
        setSavedBankDisplay(user.bank_name);
      } else if (!foundLocalBank && !user?.bank_name) {
        setSavedBankDisplay('Add Bank Account');
      }
    } catch (error) {
      console.log('Error fetching earnings:', error);
    }
  };

  useEffect(() => {
    fetchEarnings();
    const unsubscribe = navigation?.addListener ? navigation.addListener('focus', () => {
      fetchEarnings();
    }) : undefined;
    return unsubscribe;
  }, [navigation, globalCountry]);

  const handleCashoutPress = () => {
    // Navigate directly to Driver Wallet under Profile on the Cash Out (withdraw) tab
    try {
      navigation.navigate('Profile', {
        screen: 'DriverWallet',
        params: { initialTab: 'withdraw', tab: 'withdraw' }
      });
    } catch (e) {
      try {
        navigation.navigate('DriverWallet', { initialTab: 'withdraw', tab: 'withdraw' });
      } catch (err) {
        console.log('Error navigating to DriverWallet:', err);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEarnings();
    setRefreshing(false);
  };

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const currencySymbol = globalCountry?.symbol || '₦';

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    heroCardBg: isDark ? '#00e588' : '#059669',
    heroTextColor: isDark ? '#090d16' : '#ffffff',
    heroSubTextColor: isDark ? '#044e39' : '#d1fae5',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Clean Top Navigation Bar (No bulky banner, no back arrow) */}
      <View className="px-4 pt-3 pb-2 flex-row justify-between items-center">
        <View className="flex-1 mr-3">
          <Text style={{ color: themeStyles.titleText, fontSize: 24, fontWeight: '700' }} numberOfLines={1}>
            Earnings
          </Text>
          <Text style={{ color: themeStyles.subText, fontSize: 12, marginTop: 1 }} numberOfLines={1}>
            Weekly payout & commission-free income
          </Text>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleCashoutPress}
            style={{ 
              backgroundColor: themeStyles.heroCardBg, 
              paddingHorizontal: 12,
              height: 36,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8
            }}
            accessibilityLabel="Wallet"
          >
            <Ionicons name="wallet-outline" size={16} color={themeStyles.heroTextColor} style={{ marginRight: 4 }} />
            <Text style={{ color: themeStyles.heroTextColor, fontSize: 12, fontWeight: '600' }}>Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation?.navigate('Conversations')}
            style={{ 
              backgroundColor: themeStyles.cardBg, 
              borderColor: themeStyles.cardBorder,
              borderWidth: 1,
              width: 36,
              height: 36,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={16} color={themeStyles.brandGreen} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-3"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeStyles.heroCardBg} />}
      >
        {/* Hero Card — Weekly Earnings */}
        <View 
          style={{ backgroundColor: themeStyles.heroCardBg }} 
          className="rounded-3xl p-5 mb-4 shadow-xl"
        >
          <Text style={{ color: themeStyles.heroSubTextColor }} className="text-xs font-normal uppercase tracking-wider">
            This week ({globalCountry?.currency || 'NGN'})
          </Text>
          <Text style={{ color: themeStyles.heroTextColor }} className="font-normal text-4xl mt-1 mb-8">
            {currencySymbol}{Number(earnings.this_week || 0).toLocaleString()}
          </Text>

          {/* Days Row */}
          <View className="flex-row justify-between items-center px-1">
            {daysOfWeek.map((day, idx) => (
              <Text key={idx} style={{ color: themeStyles.heroTextColor }} className="font-normal text-xs">
                {day}
              </Text>
            ))}
          </View>
        </View>

        {/* Breakdown Row — Rides vs Hire Contracts */}
        <View className="flex-row justify-between mb-3">
          {/* Rides Breakdown Card */}
          <View 
            style={{ 
              backgroundColor: themeStyles.cardBg, 
              borderColor: themeStyles.cardBorder, 
              borderWidth: 1 
            }} 
            className="flex-1 rounded-3xl p-4 mr-1.5 shadow-sm"
          >
            <Text style={{ color: themeStyles.subText }} className="text-xs font-normal mb-1">
              Rides
            </Text>
            <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xl">
              {currencySymbol}{Number(earnings.rides_earnings || 0).toLocaleString()}
            </Text>
          </View>

          {/* Hire Contracts Breakdown Card */}
          <View 
            style={{ 
              backgroundColor: themeStyles.cardBg, 
              borderColor: themeStyles.cardBorder, 
              borderWidth: 1 
            }} 
            className="flex-1 rounded-3xl p-4 ml-1.5 shadow-sm"
          >
            <Text style={{ color: themeStyles.subText }} className="text-xs font-normal mb-1">
              Hire contracts
            </Text>
            <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xl">
              {currencySymbol}{Number(earnings.hire_earnings || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Cash Out to Bank Trigger */}
        <TouchableOpacity
          style={{ 
            backgroundColor: themeStyles.cardBg, 
            borderColor: themeStyles.cardBorder, 
            borderWidth: 1 
          }} 
          className="rounded-3xl p-4 flex-row justify-between items-center mb-4 shadow-sm"
          onPress={handleCashoutPress}
        >
          <View className="flex-1 mr-2">
            <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base">
              Cash out to bank
            </Text>
            <Text style={{ color: themeStyles.subText }} className="font-normal text-xs mt-0.5">
              Instant 24/7 transfer in {globalCountry?.name || 'Nigeria'}
            </Text>
          </View>
          <View className="flex-row items-center max-w-[45%]">
            <Text style={{ color: themeStyles.subText }} className="text-sm font-normal mr-1" numberOfLines={1} ellipsizeMode="tail">
              {savedBankDisplay}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={themeStyles.subText} />
          </View>
        </TouchableOpacity>

        {/* Subscription Info Card */}
        <View 
          style={{ 
            backgroundColor: isDark ? 'rgba(0, 229, 136, 0.08)' : 'rgba(5, 150, 105, 0.08)',
            borderColor: isDark ? 'rgba(0, 229, 136, 0.25)' : 'rgba(5, 150, 105, 0.25)',
            borderWidth: 1 
          }}
          className="rounded-2xl p-3.5 flex-row items-center justify-center mt-2 mb-6"
        >
          <Ionicons name="shield-checkmark" size={16} color={themeStyles.heroCardBg} style={{ marginRight: 8 }} />
          <Text style={{ color: themeStyles.primaryText }} className="text-xs text-center font-normal flex-1">
            You keep 100% of your earnings — OgaDriver charges a subscription, never commission.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
