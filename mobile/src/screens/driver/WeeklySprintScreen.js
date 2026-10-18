import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import { useTheme } from '../../context/ThemeContext';

export default function WeeklySprintScreen({ navigation }) {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    api.get('/drivers/sprints/active')
      .then(res => {
        if (res.data?.success) setData(res.data.data);
      })
      .catch(e => console.log('Sprint error:', e))
      .finally(() => setLoading(false));
  }, []);

  const handleClaim = async () => {
    try {
      const res = await api.post('/drivers/sprints/claim');
      if (res.data?.success) {
        Alert.alert('Prize Claimed! 🏆', res.data.message);
      } else {
        Alert.alert('Claim', res.data?.message || 'No unclaimed prize.');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Claim failed.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{
              backgroundColor: themeStyles.headerBtnBg,
              borderColor: themeStyles.headerBtnBorder
            }}
            className="p-2 mr-3 rounded-xl border"
          >
            <Ionicons name="arrow-back" size={20} color={themeStyles.primaryText} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: themeStyles.titleText }} className="text-2xl font-black">
              🏆 Weekly Cash Sprint
            </Text>
            <Text style={{ color: themeStyles.subText }} className="text-xs">
              Top Drivers Leaderboard & Weekly Cash Prizes
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={themeStyles.brandGreen} size="large" className="mt-10" />
        ) : data ? (
          <View>
            {/* Prize Pool Hero Card */}
            <View 
              style={{
                backgroundColor: isDark ? '#121927' : '#ecfdf5',
                borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : '#a7f3d0',
                borderWidth: 1
              }}
              className="p-5 rounded-3xl mb-6 shadow-md"
            >
              <Text className="text-amber-500 font-black text-lg mb-1">{data.sprint?.title}</Text>
              <Text style={{ color: themeStyles.brandGreen }} className="text-3xl font-black font-mono mb-2">
                ₦{parseFloat(data.sprint?.total_prize_pool || 0).toLocaleString()}
              </Text>
              <Text style={{ color: themeStyles.subText }} className="text-xs">
                {data.sprint?.prizes_breakdown}
              </Text>

              {data.my_rank && (
                <View 
                  style={{ borderTopColor: isDark ? '#1e293b' : '#e2e8f0', borderTopWidth: 1 }} 
                  className="mt-4 pt-4 flex-row justify-between items-center"
                >
                  <Text style={{ color: themeStyles.subText }} className="text-xs font-mono font-bold">Your Rank:</Text>
                  <Text className="text-amber-500 font-black text-xl font-mono">#{data.my_rank.rank}</Text>
                </View>
              )}
            </View>

            {/* Leaderboard Section */}
            <Text style={{ color: themeStyles.subText }} className="text-xs font-mono font-bold uppercase mb-3">
              Top Drivers Leaderboard
            </Text>
            {data.leaderboard?.map((item, idx) => (
              <View 
                key={idx} 
                style={{
                  backgroundColor: themeStyles.cardBg,
                  borderColor: themeStyles.cardBorder,
                  borderWidth: 1
                }}
                className="p-4 rounded-2xl mb-2.5 flex-row justify-between items-center shadow-sm"
              >
                <View className="flex-row items-center">
                  <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-300' : 'bg-amber-700'}`}>
                    <Text className="text-slate-950 font-black text-xs font-mono">{idx + 1}</Text>
                  </View>
                  <Text style={{ color: themeStyles.primaryText }} className="font-bold text-sm">
                    {item.driver?.user?.name || `Driver #${item.driver_id}`}
                  </Text>
                </View>
                <Text className="text-amber-500 font-mono text-xs font-bold">
                  ★ {item.rating_score} ({item.completed_jobs} Jobs)
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
