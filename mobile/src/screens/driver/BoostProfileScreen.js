import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import HeaderBar from '../../components/HeaderBar';
import { authService, driverService, api } from '../../api/api';

export default function BoostProfileScreen({ navigation }) {
  const { isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [userWallet, setUserWallet] = useState(15400);
  const [activeBoost, setActiveBoost] = useState(null); // { title: '7-Day Priority Radar', multiplier: '5X', daysLeft: 5 }

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: isDark ? '#00e588' : '#059669',
  };

  useEffect(() => {
    loadBoostStatus();
  }, []);

  const loadBoostStatus = async () => {
    try {
      const [userRes, boostRes] = await Promise.all([
        api.get('/user').catch(() => null),
        driverService.getBoostStatus().catch(() => null)
      ]);
      if (userRes?.data?.user?.wallet?.available_balance !== undefined) {
        setUserWallet(userRes.data.user.wallet.available_balance);
      }
      if (boostRes?.data?.is_boosted) {
        setActiveBoost({
          title: boostRes.data.boost_tier || 'Active Surge Boost',
          multiplier: boostRes.data.boost_multiplier || '5X Radar',
          daysLeft: boostRes.data.days_left || 5
        });
      }
    } catch (e) {
      console.log('Error loading boost status:', e);
    }
  };

  const BOOST_PACKS = [
    {
      id: 'daily',
      title: '1-Day Quick Flash',
      durationDays: 1,
      multiplier: '2X Radar Surge',
      price: 700,
      dailyEquivalent: 700,
      discountLabel: 'Standard Daily',
      description: 'Ideal for weekend shifts or single busy-day rush hours to jump the dispatch queue.',
      perks: ['Instant 24hr priority ping', 'Top of map marker in your zone', 'Flash Bronze badge']
    },
    {
      id: '3days',
      title: '3-Day Weekend Sprint',
      durationDays: 3,
      multiplier: '3X Priority Surge',
      price: 1800,
      dailyEquivalent: 600,
      discountLabel: 'Save 14%',
      description: 'Covers Friday through Sunday peak hire requests and airport booking windows.',
      perks: ['Friday-Sunday weekend surge', 'Top 5 dispatcher ranking', 'Instant high-value run alerts']
    },
    {
      id: 'weekly',
      title: '7-Day Priority Radar',
      durationDays: 7,
      multiplier: '5X Algorithm Boost',
      price: 3500,
      dailyEquivalent: 500,
      discountLabel: 'Save 28% • ₦500/day',
      popular: true,
      description: 'Best for weekly full-time active operatives wanting consistent high-paying private clients.',
      perks: ['7 full days search priority', 'Executive Private Chauffeur matching', 'Top 3 rank in dispatch queue', 'Silver Priority badge']
    },
    {
      id: 'monthly',
      title: '30-Day Executive Boost',
      durationDays: 30,
      multiplier: '8X Exposure Surge',
      price: 10500,
      dailyEquivalent: 350,
      discountLabel: 'Save 50% • ₦350/day',
      description: 'Massive visibility cut: Half the daily cost with guaranteed monthly corporate job recommendations.',
      perks: ['VIP Client algorithm recommendation', 'Top rank in corporate dispatch queue', 'Gold Partner badge', 'Zero dispatch pause guarantee']
    },
    {
      id: 'quarterly',
      title: '90-Day Master Fleet Plan',
      durationDays: 90,
      multiplier: '12X Master Operative',
      price: 22500,
      dailyEquivalent: 250,
      discountLabel: 'Save 64% • ₦250/day',
      bestValue: true,
      description: 'Our most economical plan (only ₦250/day). Preferred by long-term expatriate & corporate fleet drivers.',
      perks: ['Guaranteed corporate employer interviews', 'Dedicated account manager', 'Diamond Partner badge', 'Free monthly vehicle safety audit']
    }
  ];

  const handleActivateBoost = (pack) => {
    Alert.alert(
      "Confirm Profile Boost",
      `Activate ${pack.title} (${pack.durationDays} Days) for ₦${pack.price.toLocaleString()} (only ₦${pack.dailyEquivalent}/day)?\n\nPayment will be debited from your OgaDriver Wallet balance (Balance: ₦${userWallet.toLocaleString()}).`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Boost",
          onPress: async () => {
            if (userWallet < pack.price) {
              Alert.alert(
                "Insufficient Wallet Balance",
                `Your wallet balance is ₦${userWallet.toLocaleString()}, but this boost requires ₦${pack.price.toLocaleString()}. Top up your wallet?`,
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Top Up Wallet", onPress: () => navigation.navigate('DriverWallet') }
                ]
              );
              return;
            }

            setLoading(true);
            try {
              const res = await driverService.activateBoost(pack.id);
              setLoading(false);
              if (res.data?.wallet_balance !== undefined) {
                setUserWallet(res.data.wallet_balance);
              } else {
                setUserWallet(prev => Math.max(0, prev - pack.price));
              }
              setActiveBoost({
                title: pack.title,
                multiplier: pack.multiplier,
                daysLeft: pack.durationDays
              });
              Alert.alert(
                "Profile Boost Active! 🚀",
                `Your profile is now receiving ${pack.multiplier} for the next ${pack.durationDays} days. You are prioritized at the top of client searches!`,
                [{ text: "Continue Driving", onPress: () => navigation.goBack() }]
              );
            } catch (err) {
              setLoading(false);
              const errMsg = err?.response?.data?.message || "Could not process boost payment. Please verify wallet balance.";
              Alert.alert("Boost Error", errMsg);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Flexible HeaderBar matching Ride/Hire app */}
      <HeaderBar 
        navigation={navigation} 
        showBack 
        title="Boost My Profile" 
        subtitle="Rank #1 in Hirer searches"
      />

      <ScrollView className="flex-1 px-4 pt-3 pb-10" showsVerticalScrollIndicator={false}>
        {/* Active Boost Alert (if active) */}
        {activeBoost && (
          <View 
            style={{ 
              backgroundColor: isDark ? 'rgba(0, 229, 136, 0.15)' : '#ecfdf5',
              borderColor: themeStyles.brandGreen,
              borderWidth: 1
            }}
            className="rounded-3xl p-4 mb-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-10 h-10 rounded-2xl bg-emerald-500/20 items-center justify-center mr-3">
                <Ionicons name="flash" size={20} color={themeStyles.brandGreen} />
              </View>
              <View>
                <Text style={{ color: themeStyles.brandGreen }} className="font-normal text-xs uppercase tracking-wider">
                  Boost Active • {activeBoost.multiplier}
                </Text>
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm">
                  {activeBoost.title} ({activeBoost.daysLeft}d left)
                </Text>
              </View>
            </View>
            <View className="px-2.5 py-1 rounded-full bg-emerald-500/20">
              <Text style={{ color: themeStyles.brandGreen }} className="text-[10px] font-normal uppercase">
                SPOTLIGHT
              </Text>
            </View>
          </View>
        )}

        {/* Hero Visual Card */}
        <View 
          style={{ 
            backgroundColor: isDark ? '#121927' : '#ecfdf5',
            borderColor: isDark ? '#1e293b' : '#a7f3d0',
            borderWidth: 1
          }}
          className="rounded-3xl p-5 mb-5 shadow-lg relative overflow-hidden"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <View className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 self-start mb-2 flex-row items-center">
                <Ionicons name="flash" size={12} color={themeStyles.brandGreen} style={{ marginRight: 4 }} />
                <Text style={{ color: themeStyles.brandGreen }} className="font-normal text-[10px] uppercase tracking-wider">
                  Algorithm Spotlight
                </Text>
              </View>
              <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xl mb-1">
                More Days = Cheaper Rate
              </Text>
              <Text style={{ color: themeStyles.subText }} className="text-xs leading-relaxed font-normal">
                Daily boost starts at ₦700/day, but drops down to just ₦250/day when you commit to longer periods. Pushes your profile straight to the top of client searches!
              </Text>
            </View>
            <View 
              style={{ backgroundColor: themeStyles.brandGreen }} 
              className="w-14 h-14 rounded-2xl items-center justify-center shadow-lg"
            >
              <Ionicons name="rocket" size={28} color="#090d16" />
            </View>
          </View>
        </View>

        {/* Boost Plans List */}
        <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base uppercase tracking-wider mb-3">
          Select Boost Package
        </Text>

        {BOOST_PACKS.map((pack) => {
          const isSelected = selectedPlan === pack.id;
          return (
            <TouchableOpacity
              key={pack.id}
              activeOpacity={0.9}
              onPress={() => setSelectedPlan(pack.id)}
              style={{
                backgroundColor: themeStyles.cardBg,
                borderColor: isSelected ? themeStyles.brandGreen : themeStyles.cardBorder,
                borderWidth: isSelected ? 2 : 1,
              }}
              className="rounded-3xl p-5 mb-4 shadow-sm relative"
            >
              {/* Badges for Best Value / Popular */}
              {pack.popular && (
                <View 
                  style={{ backgroundColor: themeStyles.brandGreen }}
                  className="absolute -top-3 right-6 px-3 py-1 rounded-full shadow-sm"
                >
                  <Text className="text-slate-950 font-normal text-[9px] uppercase tracking-wider">
                    Most Popular
                  </Text>
                </View>
              )}
              {pack.bestValue && (
                <View 
                  className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-amber-500 shadow-sm"
                >
                  <Text className="text-slate-950 font-normal text-[9px] uppercase tracking-wider">
                    Best Value (64% Off)
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center flex-wrap">
                    <Text style={{ color: themeStyles.primaryText }} className="font-normal text-lg mr-2">
                      {pack.title}
                    </Text>
                    <View 
                      style={{
                        backgroundColor: pack.id === 'daily' ? (isDark ? '#334155' : '#e2e8f0') : (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)'),
                        borderColor: pack.id === 'daily' ? 'transparent' : themeStyles.brandGreen,
                        borderWidth: 1
                      }}
                      className="px-2 py-0.5 rounded-md"
                    >
                      <Text 
                        style={{ color: pack.id === 'daily' ? themeStyles.subText : themeStyles.brandGreen }} 
                        className="text-[10px] font-normal"
                      >
                        {pack.discountLabel}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-amber-500 font-normal text-xs mt-1">
                    {pack.multiplier} • ₦{pack.dailyEquivalent}/day
                  </Text>
                </View>
                <View className="items-end">
                  <Text style={{ color: themeStyles.brandGreen }} className="font-normal text-xl">
                    ₦{pack.price.toLocaleString()}
                  </Text>
                  <Text style={{ color: themeStyles.subText }} className="text-[10px] uppercase font-normal">
                    {pack.durationDays === 1 ? '1 Day' : `${pack.durationDays} Days`}
                  </Text>
                </View>
              </View>

              <Text style={{ color: themeStyles.subText }} className="text-xs mb-3 font-normal">
                {pack.description}
              </Text>

              {/* Perks List */}
              <View 
                style={{ borderTopColor: themeStyles.cardBorder, borderTopWidth: 1 }} 
                className="space-y-1.5 pt-2"
              >
                {pack.perks.map((perk, idx) => (
                  <View key={idx} className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={14} color={themeStyles.brandGreen} style={{ marginRight: 6 }} />
                    <Text style={{ color: themeStyles.subText }} className="text-xs font-normal">
                      {perk}
                    </Text>
                  </View>
                ))}
              </View>

              {/* CTA Action */}
              <TouchableOpacity
                onPress={() => handleActivateBoost(pack)}
                disabled={loading}
                style={{ 
                  backgroundColor: isSelected ? themeStyles.brandGreen : (isDark ? '#1e293b' : '#e2e8f0'),
                  marginTop: 14 
                }}
                className="py-3.5 rounded-2xl items-center justify-center flex-row"
              >
                {loading ? (
                  <ActivityIndicator color="#090d16" />
                ) : (
                  <Text 
                    style={{ 
                      color: isSelected ? '#090d16' : themeStyles.primaryText 
                    }} 
                    className="font-normal text-xs uppercase tracking-wider"
                  >
                    Activate Boost • ₦{pack.price.toLocaleString()} ({pack.durationDays}d)
                  </Text>
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
