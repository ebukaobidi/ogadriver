import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import loyaltyService from '../../services/loyaltyService';

export default function LoyaltyScreen({ navigation }) {
  const { isDark, themeColors } = useTheme();
  const [points, setPoints] = useState(1250);
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [adminConfig, setAdminConfig] = useState({
    points_earn_per_100: 1,
    trip_completion_bonus_points: 50,
    weekly_hire_bonus_points: 200,
    referral_bonus_points: 500,
    five_star_rating_bonus_points: 25,
    max_discount_cap_percent: 20,
    min_points_to_redeem: 500,
    max_daily_points_redeem: 5000,
  });

  const fetchLoyalty = async () => {
    try {
      const pts = await loyaltyService.getPoints();
      const hist = await loyaltyService.getHistory();
      const cfg = await loyaltyService.getConfig();
      setPoints(pts);
      setHistory(hist);
      if (cfg) {
        setAdminConfig(prev => ({ ...prev, ...cfg }));
      }
    } catch (error) {
      console.log('Error fetching loyalty:', error);
    }
  };

  useEffect(() => {
    fetchLoyalty();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLoyalty();
    setRefreshing(false);
  };

  const handleRedeemVoucher = async (ptsRequired, voucherTitle) => {
    if (points < ptsRequired) {
      Alert.alert(
        'More Points Needed',
        `You need ${ptsRequired.toLocaleString()} points for this reward. Keep riding with OgaDriver to earn more!`
      );
      return;
    }

    Alert.alert(
      'Redeem Ride Credit',
      `Convert ${ptsRequired.toLocaleString()} OgaPoints into ${voucherTitle} for your next ride?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem Now',
          onPress: async () => {
            try {
              const updated = await loyaltyService.redeemPoints(
                ptsRequired,
                `Redeemed: ${voucherTitle}`
              );
              setPoints(updated);
              const hist = await loyaltyService.getHistory();
              setHistory(hist);
              Alert.alert(
                '🎉 Voucher Activated',
                `Your ${voucherTitle} is ready! It will be automatically available at checkout on your next ride or driver hire.`
              );
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not redeem points.');
            }
          },
        },
      ]
    );
  };

  // Calculate tier status
  const getTier = (pts) => {
    if (pts >= 5000) return { name: 'Platinum', color: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: '#c084fc' };
    if (pts >= 2000) return { name: 'Gold', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: '#fbbf24' };
    if (pts >= 500) return { name: 'Silver', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: '#10b981' };
    return { name: 'Bronze', color: '#d97706', bg: 'rgba(217,119,6,0.12)', border: '#d97706' };
  };

  const tier = getTier(points);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090d16' : '#ffffff' }}>
      {/* Top Header */}
      <View
        style={{
          backgroundColor: isDark ? '#090d16' : '#ffffff',
          borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
        className="flex-row items-center justify-between px-4 py-3 border-b"
      >
        <View className="flex-row items-center">
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-lg">
            OgaPoints & Rewards
          </Text>
          <View className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
            <Text className="text-[9px] font-normal uppercase text-emerald-500 tracking-wider">
              Ride For Less
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
      >
        {/* SUBSCRIPTION & PLATFORM HEALTH SAFEGUARD BANNER */}
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#f0fdf4',
            borderColor: isDark ? '#1e293b' : '#bbf7d0',
          }}
          className="p-3.5 rounded-2xl border mb-4 flex-row items-center"
        >
          <View className="w-8 h-8 rounded-xl bg-emerald-500/20 items-center justify-center mr-2.5">
            <Ionicons name="shield-checkmark" size={17} color="#10b981" />
          </View>
          <View className="flex-1">
            <Text style={{ color: isDark ? '#ffffff' : '#166534' }} className="font-normal text-xs">
              Subscription & Reward Policy
            </Text>
            <Text style={{ color: isDark ? '#94a3b8' : '#15803d' }} className="text-[10px] leading-3 mt-0.5">
              Reward credits are sustainably balanced with platform subscriptions and completed rides to ensure reliable service and lasting profitability.
            </Text>
          </View>
        </View>

        {/* BIG POINTS CARD */}
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#052e16',
            borderColor: isDark ? '#1e293b' : '#0a5c25',
          }}
          className="rounded-3xl p-6 mb-5 border shadow-xl items-center relative overflow-hidden"
        >
          {/* Subtle background trophy watermark */}
          <View className="absolute right-3 -bottom-4 opacity-10">
            <Ionicons name="trophy" size={120} color="#ffffff" />
          </View>

          <View className="px-3 py-1 rounded-full bg-white/10 border border-white/15 flex-row items-center mb-2">
            <Ionicons name="sparkles" size={12} color="#34d399" style={{ marginRight: 4 }} />
            <Text className="text-emerald-300 font-normal text-[10px] uppercase tracking-widest">
              Available Ride Credits
            </Text>
          </View>

          <Text className="text-white text-5xl font-normal tracking-tight mb-1">
            {points.toLocaleString()}
          </Text>

          <Text className="text-emerald-300 text-base font-normal mb-3">
            ≈ ₦{points.toLocaleString()} in Ride Credit
          </Text>

          {/* Tier Pill */}
          <View
            style={{
              backgroundColor: tier.bg,
              borderColor: tier.border,
            }}
            className="flex-row items-center px-3 py-1 rounded-full border"
          >
            <Ionicons name="ribbon" size={14} color={tier.color} style={{ marginRight: 4 }} />
            <Text style={{ color: tier.color }} className="font-normal text-xs uppercase tracking-wider">
              {tier.name} Tier Member
            </Text>
          </View>
        </View>

        {/* TIER PROGRESS BAR */}
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#f8fafc',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="border rounded-2xl p-4 mb-5 shadow-sm"
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs tracking-tight">
              Tier Progress
            </Text>
            <Text className="text-emerald-500 font-normal text-xs">
              {points < 5000 ? `${(5000 - points).toLocaleString()} pts to Platinum` : 'Maximum Tier Achieved'}
            </Text>
          </View>

          <View className="flex-row justify-between mb-1.5 px-0.5">
            <Text className="text-amber-600 text-[10px] font-normal">Bronze</Text>
            <Text className="text-emerald-500 text-[10px] font-normal">Silver (500)</Text>
            <Text className="text-amber-400 text-[10px] font-normal">Gold (2k)</Text>
            <Text className="text-purple-400 text-[10px] font-normal">Platinum (5k)</Text>
          </View>

          <View
            style={{ backgroundColor: isDark ? '#1a2333' : '#e2e8f0' }}
            className="rounded-full h-2.5 overflow-hidden"
          >
            <View
              className="bg-emerald-500 h-2.5 rounded-full"
              style={{ width: `${Math.min((points / 5000) * 100, 100)}%` }}
            />
          </View>
        </View>

        {/* REDEEM POINTS FOR RIDES (KEY USER FEATURE) */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-2.5 px-1">
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm tracking-tight">
              Redeem Points for Rides
            </Text>
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal">
              Up to {adminConfig.max_discount_cap_percent || 20}% trip cap
            </Text>
          </View>

          <View className="space-y-3">
            {[
              {
                pts: 500,
                value: '₦500 Ride Discount',
                desc: 'Apply ₦500 off any ride (capped at 20% fare to preserve margins).',
                icon: 'car-outline',
              },
              {
                pts: 1000,
                value: '₦1,000 Ride Voucher',
                desc: 'Save ₦1,000 on journeys (balanced with subscription margin).',
                icon: 'car-sport-outline',
              },
              {
                pts: 2500,
                value: '₦2,500 Chauffeur Credit',
                desc: 'Dedicated daily driver discount pegged to platform profit buffer.',
                icon: 'briefcase-outline',
              },
              {
                pts: 5000,
                value: '₦5,000 Platinum Credit',
                desc: 'Maximum credit for active VIP hirers & loyal subscribers.',
                icon: 'gift-outline',
              },
            ].map((v) => {
              const canRedeem = points >= v.pts;
              return (
                <View
                  key={v.pts}
                  style={{
                    backgroundColor: isDark ? '#121927' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="p-4 rounded-2xl border flex-row items-center justify-between mb-2.5 shadow-sm"
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                      style={{
                        backgroundColor: canRedeem
                          ? isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5'
                          : isDark ? '#1a2333' : '#f1f5f9',
                      }}
                    >
                      <Ionicons
                        name={v.icon}
                        size={22}
                        color={canRedeem ? '#10b981' : '#64748b'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                        {v.value}
                      </Text>
                      <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] mt-0.5 font-normal">
                        {v.desc}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleRedeemVoucher(v.pts, v.value)}
                    style={{
                      backgroundColor: canRedeem ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                    }}
                    className="px-3.5 py-2 rounded-xl items-center justify-center shadow-sm"
                  >
                    <Text
                      style={{
                        color: canRedeem ? '#ffffff' : isDark ? '#64748b' : '#94a3b8',
                      }}
                      className="font-normal text-[11px]"
                    >
                      {v.pts.toLocaleString()} pts
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* HOW TO EARN MORE POINTS */}
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="border rounded-2xl p-4 mb-5 shadow-sm"
        >
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm mb-3">
            Ways to Earn OgaPoints
          </Text>

          {[
            { pts: `+${adminConfig.points_earn_per_100 || 1} pt`, desc: 'Per ₦100 spent on any completed ride or hire' },
            { pts: `+${adminConfig.trip_completion_bonus_points || 50} pts`, desc: 'Bonus every time a trip is successfully finished' },
            { pts: `+${adminConfig.weekly_hire_bonus_points || 200} pts`, desc: 'When you hire a driver for weekly or monthly engagement' },
            { pts: `+${adminConfig.referral_bonus_points || 500} pts`, desc: 'When a friend signs up with your invite code and rides' },
            { pts: `+${adminConfig.five_star_rating_bonus_points || 25} pts`, desc: 'For leaving a 5-star rating for verified drivers' },
          ].map((item, idx) => (
            <View
              key={idx}
              className={`flex-row items-center py-2.5 ${
                idx !== 4 ? 'border-b border-slate-700/20' : ''
              }`}
            >
              <View className="w-14 py-1 bg-emerald-500/15 rounded-lg items-center justify-center mr-3 border border-emerald-500/30">
                <Text className="text-emerald-500 font-normal text-xs">{item.pts}</Text>
              </View>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs flex-1 font-normal">
                {item.desc}
              </Text>
            </View>
          ))}
        </View>

        {/* RECENT ACTIVITY HISTORY */}
        <View className="mb-8">
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm mb-3 px-1">
            Points Ledger & Activity
          </Text>

          {history.length > 0 ? (
            history.map((item, index) => (
              <View
                key={item.id || index}
                style={{
                  backgroundColor: isDark ? '#121927' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="p-3.5 rounded-2xl border flex-row justify-between items-center mb-2.5 shadow-sm"
              >
                <View className="flex-1 mr-3">
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                    {item.description}
                  </Text>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] mt-0.5">
                    {new Date(item.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View
                  className={`px-2.5 py-1 rounded-xl ${
                    item.type === 'earned' ? 'bg-emerald-500/15' : 'bg-red-500/15'
                  }`}
                >
                  <Text
                    className={`font-black text-xs ${
                      item.type === 'earned' ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {item.type === 'earned' ? '+' : '-'}{item.points} pts
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#f8fafc',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="rounded-2xl p-6 items-center border"
            >
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs">
                No activity yet. Complete bookings to earn your first points!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
