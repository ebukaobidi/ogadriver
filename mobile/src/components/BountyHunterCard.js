import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BountyHunterCard({ bounties, onClaim }) {
  return (
    <View className="bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 mb-4 shadow-xl shadow-emerald-500/10">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="trophy" size={20} color="#00e588" className="mr-2" />
          <Text className="text-white font-bold text-sm">Bounty Hunter Program</Text>
        </View>
        <View className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-full">
          <Text className="text-emerald-400 text-[10px] font-bold">ACTIVE</Text>
        </View>
      </View>

      <Text className="text-slate-400 text-xs mb-3">Refer drivers from competitors and earn massive rewards:</Text>

      {/* Bounty Items */}
      <View className="space-y-2 mb-3">
        <View className="bg-slate-950/50 rounded-xl p-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg bg-emerald-500/20 items-center justify-center mr-3">
              <Ionicons name="person-add" size={16} color="#00e588" />
            </View>
            <View>
              <Text className="text-white font-bold text-xs">Driver Referral</Text>
              <Text className="text-slate-500 text-[10px]">From any competitor</Text>
            </View>
          </View>
          <View className="bg-emerald-500 px-2 py-1 rounded-lg">
            <Text className="text-slate-950 text-xs font-black">₦5,000</Text>
          </View>
        </View>

        <View className="bg-slate-950/50 rounded-xl p-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg bg-emerald-500/20 items-center justify-center mr-3">
              <Ionicons name="flame" size={16} color="#00e588" />
            </View>
            <View>
              <Text className="text-white font-bold text-xs">Top Driver</Text>
              <Text className="text-slate-500 text-[10px]">4.8+ rating from Uber/Bolt</Text>
            </View>
          </View>
          <View className="bg-emerald-500 px-2 py-1 rounded-lg">
            <Text className="text-slate-950 text-xs font-black">₦15,000</Text>
          </View>
        </View>

        <View className="bg-slate-950/50 rounded-xl p-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg bg-emerald-500/20 items-center justify-center mr-3">
              <Ionicons name="business" size={16} color="#00e588" />
            </View>
            <View>
              <Text className="text-white font-bold text-xs">Fleet Poach</Text>
              <Text className="text-slate-500 text-[10px]">Bring entire fleet (5+ drivers)</Text>
            </View>
          </View>
          <View className="bg-emerald-500 px-2 py-1 rounded-lg">
            <Text className="text-slate-950 text-xs font-black">₦50,000</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="bg-emerald-500 py-3 rounded-xl items-center flex-row justify-center shadow-lg shadow-emerald-500/30"
        onPress={onClaim}
      >
        <Ionicons name="gift" size={18} color="#090d16" className="mr-2" />
        <Text className="text-slate-950 font-black text-xs uppercase tracking-wider">Start Hunting</Text>
      </TouchableOpacity>
    </View>
  );
}
