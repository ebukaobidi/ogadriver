import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VIPPriorityCard({ isVIP, onUpgrade, onActivate }) {
  return (
    <View className={`bg-slate-900/80 backdrop-blur-md border ${isVIP ? 'border-emerald-500/50' : 'border-slate-800'} rounded-2xl p-4 mb-4 shadow-xl ${isVIP ? 'shadow-emerald-500/20' : ''}`}>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="diamond" size={20} color={isVIP ? "#00e588" : "#64748b"} className="mr-2" />
          <Text className="text-white font-bold text-sm">VIP Priority Queue</Text>
        </View>
        {isVIP ? (
          <View className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-full">
            <Text className="text-emerald-400 text-[10px] font-bold">ACTIVE</Text>
          </View>
        ) : (
          <View className="bg-slate-800 px-2 py-1 rounded-full">
            <Text className="text-slate-400 text-[10px] font-bold">LOCKED</Text>
          </View>
        )}
      </View>

      {isVIP ? (
        <View className="space-y-2">
          <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
            <View className="flex-row items-center mb-1">
              <Ionicons name="flash" size={16} color="#00e588" className="mr-2" />
              <Text className="text-white font-bold text-xs">Instant Matching</Text>
            </View>
            <Text className="text-slate-400 text-[10px]">Skip 500+ drivers in queue - matched in under 30 seconds</Text>
          </View>

          <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
            <View className="flex-row items-center mb-1">
              <Ionicons name="shield-checkmark" size={16} color="#00e588" className="mr-2" />
              <Text className="text-white font-bold text-xs">Elite Drivers Only</Text>
            </View>
            <Text className="text-slate-400 text-[10px]">Access top 5% rated drivers exclusively</Text>
          </View>

          <TouchableOpacity
            className="bg-emerald-500 py-3 rounded-xl items-center flex-row justify-center shadow-lg shadow-emerald-500/30"
            onPress={onActivate}
          >
            <Ionicons name="play" size={18} color="#090d16" className="mr-2" />
            <Text className="text-slate-950 font-black text-xs uppercase tracking-wider">Activate Priority</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="space-y-2">
          <View className="bg-slate-950/50 rounded-xl p-3 mb-3">
            <Text className="text-slate-400 text-xs mb-2">Unlock VIP features:</Text>
            <View className="space-y-1">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={12} color="#00e588" className="mr-2" />
                <Text className="text-slate-500 text-[10px]">Skip queue - instant driver matching</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={12} color="#00e588" className="mr-2" />
                <Text className="text-slate-500 text-[10px]">Priority access to elite drivers</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={12} color="#00e588" className="mr-2" />
                <Text className="text-slate-500 text-[10px]">No surge pricing ever</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={12} color="#00e588" className="mr-2" />
                <Text className="text-slate-500 text-[10px]">24/7 concierge support</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className="bg-emerald-500 py-3 rounded-xl items-center flex-row justify-center shadow-lg shadow-emerald-500/30"
            onPress={onUpgrade}
          >
            <Ionicons name="crown" size={18} color="#090d16" className="mr-2" />
            <Text className="text-slate-950 font-black text-xs uppercase tracking-wider">Upgrade to VIP - ₦2,500/mo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
