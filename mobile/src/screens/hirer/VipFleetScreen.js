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
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={isDark ? '#ffffff' : '#0f172a'} />
          </TouchableOpacity>
          <View>
            <View className="flex-row items-center">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-black text-lg">
                VIP & Elite Fleet
              </Text>
              <View className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                <Text className="text-[9px] font-black uppercase text-amber-500 tracking-wider">Coming Soon</Text>
              </View>
            </View>
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px]">
              OgaDriver Executive Security & Fleet
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', minHeight: '80%' }}>
        {/* Armored Shield Emblem */}
        <View className="w-24 h-24 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 items-center justify-center mb-6 shadow-xl shadow-amber-500/10">
          <Ionicons name="shield-checkmark" size={48} color="#f59e0b" />
        </View>

        <Text
          style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          className="font-black text-2xl text-center tracking-tight mb-2"
        >
          VIP & Elite Fleet
        </Text>
        
        <View className="px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 mb-4">
          <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-bold uppercase tracking-widest">
            Temporarily Disabled
          </Text>
        </View>

        <Text
          style={{ color: isDark ? '#94a3b8' : '#64748b' }}
          className="text-sm text-center leading-relaxed max-w-[320px] mb-8 font-medium"
        >
          OgaDriver VIP & Elite Fleet features (Armored Escort, Tactical Close Protection, and Diplomatic Motorcade) are currently disabled while functions and security fixtures are being finalized.
        </Text>

        {/* Feature Preview Cards (Staged / Disabled) */}
        <View className="w-full space-y-3 mb-8">
          {[
            {
              title: 'Armored B6 & B7 Fleet',
              desc: 'Bulletproof SUVs, Land Cruisers, and luxury sedans.',
              icon: 'car-sport-outline',
            },
            {
              title: 'Armed Close Protection (CPO)',
              desc: 'Vetted operatives trained in executive tactical security.',
              icon: 'shield-outline',
            },
            {
              title: 'Police Outrider Convoy',
              desc: 'Rapid highway and airport corridor clearance.',
              icon: 'flash-outline',
            },
            {
              title: 'Stealth Protocol & Digital NDA',
              desc: 'End-to-end encrypted VIP itinerary and route secrecy.',
              icon: 'lock-closed-outline',
            },
          ].map((item) => (
            <View
              key={item.title}
              style={{
                backgroundColor: isDark ? '#121927' : '#f8fafc',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="p-3.5 rounded-2xl border flex-row items-center mb-2.5 opacity-60"
            >
              <View className="w-10 h-10 rounded-xl bg-amber-500/10 items-center justify-center mr-3 border border-amber-500/20">
                <Ionicons name={item.icon} size={20} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs">
                  {item.title}
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] mt-0.5">
                  {item.desc}
                </Text>
              </View>
              <View className="px-2 py-0.5 rounded bg-slate-500/10">
                <Text className="text-[9px] font-bold text-slate-500 uppercase">Staging</Text>
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
