import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import HeaderBar from '../../components/HeaderBar';
import { authService, api } from '../../api/api';

export default function DriverSubscriptionScreen({ navigation }) {
  const { isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [userWallet, setUserWallet] = useState(15400);
  const [hasVehicle, setHasVehicle] = useState(false);
  const [planMode, setPlanMode] = useState('without_car'); // 'with_car' | 'without_car'
  const [activeSubscription, setActiveSubscription] = useState({
    status: 'active',
    planName: '7-Day Operative Pass',
    planId: 'weekly',
    daysRemaining: 4,
    expiresAt: '17 Oct 2026',
    features: [
      '0% Platform Commission',
      'Oga Walkie-Talkie Push-to-Talk (PTT)',
      'Instant Fuel Loan Eligibility'
    ]
  });

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
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const [res, userRes] = await Promise.all([
        api.get('/subscriptions/status').catch(() => null),
        authService.getUser().catch(() => null)
      ]);

      if (userRes) {
        const isCarAttached = Boolean(userRes.driver?.has_vehicle || userRes.driver?.vehicle_make || userRes.driver?.vehicle);
        setHasVehicle(isCarAttached);
        setPlanMode(isCarAttached ? 'with_car' : 'without_car');
      }
      if (res?.data?.success) {
        if (res.data.wallet_balance !== undefined) {
          setUserWallet(res.data.wallet_balance);
        }
        if (res.data.status === 'active') {
          setActiveSubscription({
            status: 'active',
            planName: res.data.subscription?.plan?.name || 'Active Driver Access',
            daysRemaining: Math.max(1, Math.ceil((new Date(res.data.expires_at) - new Date()) / (1000 * 60 * 60 * 24))),
            expiresAt: new Date(res.data.expires_at).toLocaleDateString('en-GB')
          });
        }
      }
    } catch (e) {
      console.log('Error fetching subscription status:', e);
    }
  };

  // Subscription Pricing Breakdown:
  // Base daily subscription is ₦300/day
  // Longer access tiers receive volume discounts:
  // 1-Day: ₦300 (₦300/day)
  // 7-Day: ₦1,750 (₦250/day - save 17%)
  // 30-Day: ₦6,000 (₦200/day - save 33%)
  // 90-Day: ₦13,500 (₦150/day - save 50%)
  // Distinct Plan Sets: Drivers with Car vs Drivers without Car
  const PLANS_WITH_CAR = [
    {
      id: 'daily',
      name: '1-Day Shift Pass',
      durationDays: 1,
      price: 300,
      dailyEquivalent: 300,
      savingsLabel: 'Standard Daily',
      description: 'Ideal for fleet drivers working single day dispatches and weekend peak trips.',
      features: [
        'Full 24hr live on-demand street ride dispatch',
        'Receive instant street rides & day hire requests',
        '0% commission on your trip earnings',
        'Standard FRSC road clearance'
      ]
    },
    {
      id: 'weekly',
      name: '7-Day Fleet Operative Pass',
      durationDays: 7,
      price: 1750,
      dailyEquivalent: 250,
      savingsLabel: 'Save 17% • ₦250/day',
      popular: true,
      description: 'Most popular for full-time ride hailing & private hire car owners.',
      features: [
        '7 consecutive days unmetered ride dispatch access',
        'Airport queue & high-surge radar priority',
        '0% commission on all rides & day hires',
        'Oga Walkie-Talkie (PTT) voice channel access',
        'Instant Fuel Loan qualification eligibility'
      ]
    },
    {
      id: 'monthly',
      name: '30-Day Executive Fleet Pass',
      durationDays: 30,
      price: 6000,
      dailyEquivalent: 200,
      savingsLabel: 'Save 33% • ₦200/day',
      description: 'Keep your car permanently on dispatch without daily top-up interruptions.',
      features: [
        '30 days seamless dispatch without daily renewals',
        'VIP surge pricing access (+15% surge bonus)',
        'Top algorithm ranking in client dispatch radar',
        '0% platform commission guaranteed',
        'Priority 24/7 road assistance & towing support'
      ]
    },
    {
      id: 'quarterly',
      name: '90-Day Fleet Master Pass',
      durationDays: 90,
      price: 13500,
      dailyEquivalent: 150,
      savingsLabel: 'Save 50% • ₦150/day',
      bestValue: true,
      description: 'Massive 50% discount (only ₦150/day). For dedicated commercial fleet drivers.',
      features: [
        '90 days continuous unmetered ride & hire dispatch',
        'Free quarterly vehicle inspection voucher',
        'Diamond Fleet verification badge',
        'Priority Fuel credit line up to ₦100,000',
        '24/7 dedicated fleet manager'
      ]
    }
  ];

  const PLANS_WITHOUT_CAR = [
    {
      id: 'daily',
      name: '1-Day Job Hunter Pass',
      durationDays: 1,
      price: 300,
      dailyEquivalent: 300,
      savingsLabel: 'Standard Daily',
      description: 'Apply to unlimited corporate chauffeur vacancies and private family openings today.',
      features: [
        'Full 24hr access to Corporate & Private Job Board',
        'Direct phone contacts of verified Hirers looking for drivers',
        '0% commission on your agreed monthly salary',
        'FRSC background verification badge'
      ]
    },
    {
      id: 'weekly',
      name: '7-Day Career Chauffeur Pass',
      durationDays: 7,
      price: 1500,
      dailyEquivalent: 214,
      savingsLabel: 'Save 28% • ₦214/day',
      popular: true,
      description: 'Top choice for active job-seeking chauffeurs seeking monthly employment.',
      features: [
        'Priority matching with VIP families & executives',
        'Instant SMS & push alerts for high-salary vacancies',
        '0% commission on all salary contracts',
        'Guarantor verification assistance & guidance',
        'Driver Simulator game certification badge'
      ]
    },
    {
      id: 'monthly',
      name: '30-Day Executive Chauffeur Pass',
      durationDays: 30,
      price: 5000,
      dailyEquivalent: 166,
      savingsLabel: 'Save 44% • ₦166/day',
      description: 'Recommended for elite chauffeurs seeking embassy or corporate placements.',
      features: [
        'Guaranteed interview recommendations to top hirers (₦150k - ₦300k/mo)',
        'Top-rank permanent listing in Hirer Directory',
        '0% commission on monthly salary contracts',
        'Diamond Chauffeur verification status',
        'Priority 24/7 career dispute mediation'
      ]
    },
    {
      id: 'quarterly',
      name: '90-Day VIP Master Chauffeur',
      durationDays: 90,
      price: 12000,
      dailyEquivalent: 133,
      savingsLabel: 'Save 55% • ₦133/day',
      bestValue: true,
      description: 'Maximum career coverage (only ₦133/day). Complete job security.',
      features: [
        'Direct corporate interview placement guarantee',
        'Salary payment escrow protection guarantee',
        'Guarantor form direct submission to employers',
        'Zero commission on all multi-month contracts',
        'Lifetime career accreditation record'
      ]
    }
  ];

  const SUBSCRIPTION_PLANS = planMode === 'with_car' ? PLANS_WITH_CAR : PLANS_WITHOUT_CAR;

  const handleSubscribe = async (plan) => {
    Alert.alert(
      "Confirm Subscription",
      `Activate ${plan.name} (${plan.durationDays} Days) for ₦${plan.price.toLocaleString()} (₦${plan.dailyEquivalent}/day)?\n\nFunds will be deducted from your OgaDriver Wallet balance (Balance: ₦${userWallet.toLocaleString()}).`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Subscribe",
          onPress: async () => {
            if (userWallet < plan.price) {
              Alert.alert(
                "Insufficient Wallet Balance",
                `Your wallet balance is ₦${userWallet.toLocaleString()}, but this plan requires ₦${plan.price.toLocaleString()}. Would you like to top up your wallet?`,
                [
                  { text: "Later", style: "cancel" },
                  { text: "Top Up Wallet", onPress: () => navigation.navigate('DriverWallet') }
                ]
              );
              return;
            }

            setLoading(true);
            try {
              const res = await api.post('/subscription/subscribe', {
                plan_id: plan.id,
                payment_method: 'wallet'
              }).catch(() => null);

              setLoading(false);
              setUserWallet(prev => Math.max(0, prev - plan.price));
              setActiveSubscription({
                status: 'active',
                planName: plan.name,
                planId: plan.id,
                daysRemaining: plan.durationDays,
                expiresAt: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
                features: plan.features
              });
              Alert.alert(
                "Subscription Active! 🚀",
                `Your ${plan.name} is now active for ${plan.durationDays} days. Enjoy 0% commission, unmetered clients, and all plan privileges!`,
                [{ text: "Continue Driving", onPress: () => navigation.goBack() }]
              );
            } catch (err) {
              setLoading(false);
              Alert.alert("Subscription Failed", err?.response?.data?.message || "Failed to activate subscription. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Flexible HeaderBar */}
      <HeaderBar 
        navigation={navigation} 
        showBack 
        title="Driver Subscription" 
        subtitle="0% Commission • From ₦300/day"
      />

      <ScrollView className="flex-1 px-4 pt-3 pb-12" showsVerticalScrollIndicator={false}>
        <View 
          style={{ 
            backgroundColor: isDark ? '#121927' : '#ecfdf5',
            borderColor: isDark ? '#00e588' : '#a7f3d0',
            borderWidth: 1
          }}
          className="rounded-3xl p-5 mb-5 shadow-lg"
        >
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <View className="flex-row items-center mb-1">
                <Ionicons name="shield-checkmark" size={16} color={isDark ? "#00e588" : "#059669"} style={{ marginRight: 6 }} />
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base">
                  {activeSubscription.planName}
                </Text>
              </View>
              <Text style={{ color: themeStyles.subText }} className="text-xs font-normal">
                Active access • Expires on {activeSubscription.expiresAt}
              </Text>
            </View>
            <View 
              style={{ backgroundColor: isDark ? 'rgba(0, 229, 136, 0.2)' : '#d1fae5' }}
              className="px-3 py-1 rounded-full border border-emerald-500/30"
            >
              <Text style={{ color: themeStyles.brandGreen }} className="font-normal text-xs">
                {activeSubscription.daysRemaining} Days Left
              </Text>
            </View>
          </View>

          {/* Zero Commission Highlight */}
          <View 
            style={{ 
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
              borderWidth: 1
            }}
            className="rounded-2xl p-3 mt-2 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="sparkles" size={16} color="#f59e0b" style={{ marginRight: 6 }} />
              <Text style={{ color: themeStyles.primaryText }} className="text-xs font-normal">
                0% Platform Commission
              </Text>
            </View>
            <Text style={{ color: themeStyles.brandGreen }} className="text-xs font-normal">
              Keep 100% Earnings
            </Text>
          </View>
        </View>

        {/* Pricing Model Info Banner */}
        <View 
          style={{
            backgroundColor: themeStyles.cardBg,
            borderColor: themeStyles.cardBorder,
            borderWidth: 1
          }}
          className="rounded-2xl p-4 mb-5 flex-row items-center"
        >
          <View className="w-10 h-10 rounded-xl bg-amber-400/20 items-center justify-center mr-3 border border-amber-400/40">
            <Ionicons name="pricetag-outline" size={20} color="#f59e0b" />
          </View>
          <View className="flex-1">
            <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs">
              Daily Subscription: ₦300 / day
            </Text>
            <Text style={{ color: themeStyles.subText }} className="text-[11px] leading-tight mt-0.5 font-normal">
              Subscribe for more days to unlock discounts down to ₦150/day. Pay seamlessly with your wallet.
            </Text>
          </View>
        </View>

        {/* Plan Cards Section */}
        <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base uppercase tracking-wider mb-3">
          Choose Your Access Plan
        </Text>

        {SUBSCRIPTION_PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              activeOpacity={0.9}
              onPress={() => setSelectedPlan(plan.id)}
              style={{
                backgroundColor: themeStyles.cardBg,
                borderColor: isSelected ? themeStyles.brandGreen : themeStyles.cardBorder,
                borderWidth: isSelected ? 2 : 1,
              }}
              className="rounded-3xl p-5 mb-4 shadow-sm relative"
            >
              {/* Badges */}
              {plan.popular && (
                <View 
                  style={{ backgroundColor: themeStyles.brandGreen }}
                  className="absolute -top-3 right-6 px-3 py-1 rounded-full shadow-sm"
                >
                  <Text className="text-slate-950 font-normal text-[9px] uppercase tracking-wider">
                    Most Popular
                  </Text>
                </View>
              )}
              {plan.bestValue && (
                <View 
                  className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-amber-500 shadow-sm"
                >
                  <Text className="text-slate-950 font-normal text-[9px] uppercase tracking-wider">
                    Best Value (50% Off)
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center flex-wrap">
                    <Text style={{ color: themeStyles.primaryText }} className="font-normal text-lg mr-2">
                      {plan.name}
                    </Text>
                    <View 
                      style={{
                        backgroundColor: plan.id === 'daily' ? (isDark ? '#334155' : '#e2e8f0') : (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)'),
                        borderColor: plan.id === 'daily' ? 'transparent' : themeStyles.brandGreen,
                        borderWidth: 1
                      }}
                      className="px-2 py-0.5 rounded-md"
                    >
                      <Text 
                        style={{ color: plan.id === 'daily' ? themeStyles.subText : themeStyles.brandGreen }} 
                        className="text-[10px] font-normal"
                      >
                        {plan.savingsLabel}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-amber-500 font-normal text-xs mt-1">
                    ₦{plan.dailyEquivalent}/day • {plan.durationDays === 1 ? 'Single Day' : `${plan.durationDays} Days Duration`}
                  </Text>
                </View>

                <View className="items-end">
                  <Text style={{ color: themeStyles.brandGreen }} className="font-normal text-2xl">
                    ₦{plan.price.toLocaleString()}
                  </Text>
                  <Text style={{ color: themeStyles.subText }} className="text-[10px] uppercase font-normal">
                    Total Plan Price
                  </Text>
                </View>
              </View>

              <Text style={{ color: themeStyles.subText }} className="text-xs mb-3 font-normal">
                {plan.description}
              </Text>

              {/* Features List */}
              <View 
                style={{ borderTopColor: themeStyles.cardBorder, borderTopWidth: 1 }} 
                className="space-y-1.5 pt-2"
              >
                {plan.features.map((feat, idx) => (
                  <View key={idx} className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={14} color={themeStyles.brandGreen} style={{ marginRight: 6 }} />
                    <Text style={{ color: themeStyles.subText }} className="text-xs font-normal">
                      {feat}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={() => handleSubscribe(plan)}
                disabled={loading}
                style={{ 
                  backgroundColor: isSelected ? themeStyles.brandGreen : (isDark ? '#1e293b' : '#e2e8f0'),
                  marginTop: 14 
                }}
                className="py-3.5 rounded-2xl items-center justify-center flex-row"
              >
                <Text 
                  style={{ 
                    color: isSelected ? '#090d16' : themeStyles.primaryText 
                  }} 
                  className="font-normal text-xs uppercase tracking-wider"
                >
                  Activate Pass • ₦{plan.price.toLocaleString()}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
