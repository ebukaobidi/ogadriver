import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function VipFleetScreen({ navigation }) {
  const { isDark } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? '#090d16' : '#ffffff',
      }}
    >
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
            VIP & Elite Fleet
          </Text>
          <View className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
            <Text className="text-[9px] font-normal uppercase text-emerald-500 tracking-wider">Coming Soon</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', minHeight: '80%' }}>
        {/* Armored Shield Emblem */}
        <View className="w-20 h-20 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 items-center justify-center mb-5 shadow-xl shadow-emerald-500/10">
          <Ionicons name="shield-checkmark" size={40} color="#10b981" />
        </View>

        <Text
          style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          className="font-normal text-2xl text-center tracking-tight mb-2"
        >
          VIP & Elite Fleet
        </Text>
        
        <View className="px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 mb-6">
          <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal uppercase tracking-widest">
            Coming Soon
          </Text>
        </View>

        {/* Feature Preview Cards */}
        <View className="w-full space-y-2 mb-6">
          {[
            { title: 'Armored B6 & B7 Fleet', icon: 'car-sport-outline' },
            { title: 'Armed Close Protection (CPO)', icon: 'shield-outline' },
            { title: 'Police Outrider Convoy', icon: 'flash-outline' },
            { title: 'Stealth Protocol & Digital NDA', icon: 'lock-closed-outline' },
          ].map((item) => (
            <View
              key={item.title}
              style={{
                backgroundColor: isDark ? '#121927' : '#f8fafc',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="p-3.5 rounded-2xl border flex-row items-center justify-between mb-2"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-9 h-9 rounded-xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/20">
                  <Ionicons name={item.icon} size={18} color="#10b981" />
                </View>
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                  {item.title}
                </Text>
              </View>
              <View className="px-2 py-0.5 rounded bg-emerald-500/10">
                <Text className="text-[9px] font-normal text-emerald-500 uppercase">Staging</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Disabled Action Button */}
        <View
          style={{
            backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="w-full py-4 rounded-2xl items-center justify-center mb-4"
        >
          <Text style={{ color: isDark ? '#64748b' : '#94a3b8' }} className="font-black text-sm uppercase tracking-wider">
            Booking Disabled (Under Staging)
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="py-2 px-4"
        >
          <Text className="text-emerald-500 font-bold text-xs">
            Return to Available Services
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
