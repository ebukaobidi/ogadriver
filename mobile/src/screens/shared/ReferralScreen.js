import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { authService } from '../../api/api';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import HeaderBar from '../../components/HeaderBar';

export default function ReferralScreen({ navigation }) {
  const { isDark } = useTheme();
  const [referral, setReferral] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: isDark ? '#00e588' : '#059669',
    itemBg: isDark ? '#090d16' : '#ffffff',
    itemBorder: isDark ? '#1e293b' : '#cbd5e1',
  };

  const fetchReferral = async () => {
    try {
      const user = await authService.getUser();
      const endpoint = user?.driver_id 
        ? `/drivers/${user.driver_id}/referral`
        : `/referral`;
      const res = await api.get(endpoint).catch(() => null);
      if (res?.data?.data) {
        setReferral(res.data.data);
      }
    } catch (error) {
      console.log('Error fetching referral:', error);
    }
  };

  useEffect(() => { 
    fetchReferral(); 
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReferral();
    setRefreshing(false);
  };

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const user = await authService.getUser();
      const endpoint = user?.driver_id
        ? `/drivers/${user.driver_id}/referral/claim`
        : `/referral/claim`;
      const res = await api.post(endpoint);
      if (res.data?.success) {
        Alert.alert('Success', `Commission claimed to your wallet!`);
        fetchReferral();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not claim bonus.');
    } finally {
      setClaiming(false);
    }
  };

  const handleShare = async () => {
    if (!referral?.referral_code) return;
    try {
      await Share.share({
        message: `Join OgaDriver and earn! Use my referral code: ${referral.referral_code}\n\nSign up at: ${referral?.referral_link || 'https://ogadriver.ng'}`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Top Header Bar with Single-Icon Theme Toggle */}
      <HeaderBar 
        navigation={navigation} 
        showBack={true}
        title="Referral & Affiliate Network" 
        subtitle="Earn recurring partner commissions" 
      />

      <ScrollView
        className="flex-1 px-4 pt-3"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeStyles.brandGreen} />}
      >
        {/* Screen Title */}
        <View className="mb-4">
          <Text style={{ color: themeStyles.titleText, fontSize: 26, fontWeight: 'normal' }}>
            Referral & Affiliate Network
          </Text>
          <Text style={{ color: themeStyles.subText, fontSize: 13, marginTop: 2, fontWeight: 'normal' }}>
            Invite partner drivers & riders to earn direct wallet cash
          </Text>
        </View>

        {/* 1. Referral Code Card */}
        <View 
          style={{
            backgroundColor: themeStyles.cardBg,
            borderColor: themeStyles.brandGreen,
            borderWidth: 1
          }}
          className="rounded-3xl p-5 mb-4 items-center shadow-md"
        >
          <Text style={{ color: themeStyles.subText, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 'normal', marginBottom: 6 }}>
            YOUR REFERRAL CODE
          </Text>
          <Text style={{ color: themeStyles.brandGreen, fontSize: 32, letterSpacing: 3, fontWeight: 'normal', marginBottom: 8 }}>
            {referral?.referral_code || '------'}
          </Text>
          <Text style={{ color: themeStyles.subText, fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 16, fontWeight: 'normal', paddingHorizontal: 10 }}>
            Share this code or your direct link with fellow drivers and passengers. Earn recurring wallet commissions and points!
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: themeStyles.brandGreen }}
            className="py-3 px-8 rounded-2xl flex-row items-center"
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={18} color="#090d16" />
            <Text className="text-slate-950 font-normal text-xs uppercase tracking-wider ml-2">
              Share Link & Code
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. Wallet & Points Overview */}
        <View className="flex-row justify-between mb-3">
          <View 
            style={{ 
              backgroundColor: themeStyles.cardBg, 
              borderColor: themeStyles.cardBorder, 
              borderWidth: 1 
            }}
            className="flex-1 rounded-2xl p-4 mr-1.5"
          >
            <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal' }}>
              Wallet Balance
            </Text>
            <Text style={{ color: themeStyles.primaryText, fontSize: 18, fontWeight: 'normal', marginTop: 4 }}>
              ₦{(referral?.wallet_balance || 0).toLocaleString()}
            </Text>
          </View>
          <View 
            style={{ 
              backgroundColor: themeStyles.cardBg, 
              borderColor: themeStyles.cardBorder, 
              borderWidth: 1 
            }}
            className="flex-1 rounded-2xl p-4 ml-1.5"
          >
            <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal' }}>
              OgaPoints Balance
            </Text>
            <Text style={{ color: themeStyles.brandGreen, fontSize: 18, fontWeight: 'normal', marginTop: 4 }}>
              {(referral?.points_balance || 0).toLocaleString()} pts
            </Text>
          </View>
        </View>

        {/* 3. Pending & Claimable Commissions */}
        <View className="flex-row justify-between mb-3">
          <View 
            style={{ 
              backgroundColor: 'rgba(245, 158, 11, 0.08)', 
              borderColor: 'rgba(245, 158, 11, 0.3)', 
              borderWidth: 1 
            }}
            className="flex-1 rounded-2xl p-4 mr-1.5 items-center"
          >
            <Text className="text-amber-500 text-lg font-normal">
              ₦{(referral?.pending_balance || 0).toLocaleString()}
            </Text>
            <Text className="text-amber-500/80 text-[10px] uppercase font-normal mt-0.5">
              Pending Payout
            </Text>
          </View>
          <View 
            style={{ 
              backgroundColor: isDark ? 'rgba(0, 229, 136, 0.1)' : 'rgba(5, 150, 105, 0.1)', 
              borderColor: themeStyles.brandGreen, 
              borderWidth: 1 
            }}
            className="flex-1 rounded-2xl p-4 ml-1.5 items-center"
          >
            <Text style={{ color: themeStyles.brandGreen, fontSize: 18, fontWeight: 'normal' }}>
              ₦{(referral?.claimable_balance || 0).toLocaleString()}
            </Text>
            <Text style={{ color: themeStyles.brandGreen, fontSize: 10, textTransform: 'uppercase', fontWeight: 'normal', marginTop: 2 }}>
              Claimable Cash
            </Text>
          </View>
        </View>

        {/* 4. Breakdown Stats */}
        <View className="flex-row justify-between mb-4">
          <View 
            style={{ 
              backgroundColor: themeStyles.cardBg, 
              borderColor: themeStyles.cardBorder, 
              borderWidth: 1 
            }}
            className="flex-1 rounded-2xl p-3 mr-1 items-center"
          >
            <Text style={{ color: themeStyles.primaryText, fontSize: 16, fontWeight: 'normal' }}>
              {referral?.referred_drivers_count || 0}
            </Text>
            <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal', marginTop: 2 }}>
              Drivers
            </Text>
          </View>
          <View 
            style={{ 
              backgroundColor: themeStyles.cardBg, 
              borderColor: themeStyles.cardBorder, 
              borderWidth: 1 
            }}
            className="flex-1 rounded-2xl p-3 mx-1 items-center"
          >
            <Text style={{ color: themeStyles.primaryText, fontSize: 16, fontWeight: 'normal' }}>
              {referral?.referred_riders_count || 0}
            </Text>
            <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal', marginTop: 2 }}>
              Passengers
            </Text>
          </View>
          <View 
            style={{ 
              backgroundColor: themeStyles.cardBg, 
              borderColor: themeStyles.cardBorder, 
              borderWidth: 1 
            }}
            className="flex-1 rounded-2xl p-3 ml-1 items-center"
          >
            <Text style={{ color: themeStyles.brandGreen, fontSize: 16, fontWeight: 'normal' }}>
              ₦{(referral?.total_earned || 0).toLocaleString()}
            </Text>
            <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal', marginTop: 2 }}>
              Total Paid
            </Text>
          </View>
        </View>

        {/* 5. Claim Button */}
        <TouchableOpacity
          onPress={handleClaim}
          disabled={claiming || !referral?.claimable_balance || referral?.claimable_balance <= 0}
          style={{
            backgroundColor: referral?.claimable_balance > 0 ? themeStyles.brandGreen : (isDark ? '#1e293b' : '#cbd5e1')
          }}
          className="py-4 rounded-2xl items-center mb-5"
        >
          <Text 
            style={{
              color: referral?.claimable_balance > 0 ? '#090d16' : '#64748b',
              fontSize: 13,
              fontWeight: 'normal',
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}
          >
            {claiming ? 'Claiming...' : 'Claim Commission to Wallet'}
          </Text>
        </TouchableOpacity>

        {/* 6. Referral Matrix (Content creators section removed!) */}
        <View 
          style={{ 
            backgroundColor: themeStyles.cardBg, 
            borderColor: themeStyles.cardBorder, 
            borderWidth: 1 
          }}
          className="rounded-3xl p-5 mb-8"
        >
          <Text style={{ color: themeStyles.primaryText, fontSize: 14, fontWeight: 'normal', marginBottom: 10 }}>
            Ecosystem Referral Matrix
          </Text>
          
          <View className="mb-3">
            <Text style={{ color: themeStyles.brandGreen, fontSize: 12, fontWeight: 'normal' }}>
              • Refer a Driver Partner (10% Cash Commission):
            </Text>
            <Text style={{ color: themeStyles.subText, fontSize: 11, lineHeight: 16, marginTop: 2, fontWeight: 'normal', marginLeft: 12 }}>
              Every time a driver you invite activates or renews an OgaDriver subscription pass, you earn 10% recurring cash directly into your wallet.
            </Text>
          </View>

          <View>
            <Text style={{ color: themeStyles.brandGreen, fontSize: 12, fontWeight: 'normal' }}>
              • Refer a Passenger / Hirer (Points & Trip Cash):
            </Text>
            <Text style={{ color: themeStyles.subText, fontSize: 11, lineHeight: 16, marginTop: 2, fontWeight: 'normal', marginLeft: 12 }}>
              When your referred passengers complete rides, you earn OgaPoints discounts and automatic micro-commissions credited to your account.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
