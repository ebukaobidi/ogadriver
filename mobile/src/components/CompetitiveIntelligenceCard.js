import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CompetitiveIntelligenceCard({ marketData, onPriceAdjust }) {
  const competitorAdvantage = marketData?.competitorPrices?.avgPrice || 0;
  const ourPrice = marketData?.ourPrice || 0;
  const savings = competitorAdvantage - ourPrice;

  return (
    <View className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 mb-4 shadow-xl">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="analytics" size={20} color="#00e588" className="mr-2" />
          <Text className="text-white font-bold text-sm">Market Intelligence</Text>
        </View>
        <View className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-full">
          <Text className="text-emerald-400 text-[10px] font-bold">LIVE</Text>
        </View>
      </View>

      {/* Competitor Price Comparison */}
      <View className="bg-slate-950/50 rounded-xl p-3 mb-3">
        <Text className="text-slate-400 text-[10px] uppercase tracking-wider mb-2">Competitor Average Price</Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-white font-black text-lg">₦{competitorAdvantage.toLocaleString()}</Text>
          <View className="flex-row items-center">
            <Ionicons name="trending-down" size={16} color="#10b981" />
            <Text className="text-emerald-400 text-xs font-bold ml-1">-15% market</Text>
          </View>
        </View>
      </View>

      {/* Our Advantage */}
      <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-3">
        <Text className="text-emerald-400 text-[10px] uppercase tracking-wider mb-1">Your Price Advantage</Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-white font-black text-lg">₦{ourPrice.toLocaleString()}</Text>
          <View className="bg-emerald-500 px-2 py-1 rounded-lg">
            <Text className="text-slate-950 text-xs font-black">SAVING ₦{savings.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        className="bg-emerald-500 py-3 rounded-xl items-center flex-row justify-center shadow-lg shadow-emerald-500/30"
        onPress={onPriceAdjust}
      >
        <Ionicons name="flash" size={18} color="#090d16" className="mr-2" />
        <Text className="text-slate-950 font-black text-xs uppercase tracking-wider">Auto-Adjust to Win</Text>
      </TouchableOpacity>
    </View>
  );
}
