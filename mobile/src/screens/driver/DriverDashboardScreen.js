import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DashboardGauge, { SpeedometerGauge, HorizontalBarGauge } from '../../components/DashboardGauge';
import FadeIn from '../../components/FadeIn';
import SlideUp from '../../components/SlideUp';

export default function DriverDashboardScreen({ navigation }) {
  const [activeSection, setActiveSection] = useState('home');

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1e1b4b]">
      {/* Futuristic Header */}
      <FadeIn>
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white/60 text-[10px] font-mono uppercase tracking-[0.3em] mb-1">
                DRIVER COMMAND CENTER
              </Text>
              <Text className="text-white font-black text-3xl tracking-tight">
                GOOD EVENING
              </Text>
            </View>
            <TouchableOpacity className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 items-center justify-center">
              <Ionicons name="notifications" size={22} color="#1cd188" />
            </TouchableOpacity>
          </View>
        </View>
      </FadeIn>

      <ScrollView className="flex-1 px-6 pb-32">
        {/* Dashboard Gauges */}
        <SlideUp delay={100}>
          <View className="grid grid-cols-2 gap-4 mb-6">
            <DashboardGauge
              value={6.5}
              max={10}
              label="Hours Online"
              color="#1cd188"
              unit="h"
            />
            <DashboardGauge
              value={8}
              max={15}
              label="Trips Today"
              color="#10b981"
              unit="trips"
            />
          </View>
        </SlideUp>

        {/* Speedometer - Earnings */}
        <SlideUp delay={200}>
          <View className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white/60 text-[10px] font-mono uppercase tracking-wider">
                Earnings Velocity
              </Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
                <Text className="text-emerald-400 text-xs font-bold">LIVE</Text>
              </View>
            </View>
            <SpeedometerGauge
              value={12450}
              max={20000}
              label="Today's Earnings"
              color="#1cd188"
            />
            <View className="flex-row justify-between mt-4 pt-4 border-t border-white/10">
              <View>
                <Text className="text-slate-500 text-[10px] uppercase">Target</Text>
                <Text className="text-white font-bold">₦20,000</Text>
              </View>
              <View>
                <Text className="text-slate-500 text-[10px] uppercase">Progress</Text>
                <Text className="text-emerald-400 font-bold">62%</Text>
              </View>
            </View>
          </View>
        </SlideUp>

        {/* Horizontal Progress Bars */}
        <SlideUp delay={300}>
          <View className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-6 space-y-4">
            <Text className="text-white/60 text-[10px] font-mono uppercase tracking-wider mb-4">
              Performance Metrics
            </Text>
            <HorizontalBarGauge value={4.9} max={5} label="Rating" color="#10b981" />
            <HorizontalBarGauge value={95} max={100} label="Acceptance Rate" color="#10b981" />
            <HorizontalBarGauge value={12} max={15} label="Weekly Target" color="#10b981" />
          </View>
        </SlideUp>

        {/* Holographic Action Cards */}
        <SlideUp delay={400}>
          <View className="space-y-3">
            <TouchableOpacity
              className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-5 flex-row items-center shadow-lg shadow-emerald-500/20"
              onPress={() => navigation.navigate('OgaCopilot')}
            >
              <View className="w-14 h-14 rounded-2xl bg-emerald-500/30 border border-emerald-500/50 items-center justify-center mr-4">
                <Ionicons name="map" size={28} color="#1cd188" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-black text-lg">Surge Map</Text>
                <Text className="text-emerald-400/70 text-xs">High-demand zones detected</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#1cd188" />
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-5 flex-row items-center shadow-lg shadow-emerald-500/20"
              onPress={() => navigation.navigate('DriverJobs')}
            >
              <View className="w-14 h-14 rounded-2xl bg-emerald-500/30 border border-emerald-500/50 items-center justify-center mr-4">
                <Ionicons name="briefcase" size={28} color="#1cd188" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-black text-lg">Active Jobs</Text>
                <Text className="text-emerald-400/70 text-xs">3 jobs nearby</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#1cd188" />
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-5 flex-row items-center shadow-lg shadow-emerald-500/20"
              onPress={() => navigation.navigate('InstantCashout')}
            >
              <View className="w-14 h-14 rounded-2xl bg-emerald-500/30 border border-emerald-500/50 items-center justify-center mr-4">
                <Ionicons name="flash" size={28} color="#1cd188" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-black text-lg">Instant Cashout</Text>
                <Text className="text-emerald-400/70 text-xs">₦12,450 available</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#1cd188" />
            </TouchableOpacity>
          </View>
        </SlideUp>

        {/* Floating Stats Cards */}
        <SlideUp delay={500}>
          <View className="grid grid-cols-2 gap-3 mb-6">
            <View className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="trending-up" size={18} color="#1cd188" />
                <Text className="text-emerald-400 text-xs font-bold ml-2">+23%</Text>
              </View>
              <Text className="text-white font-black text-xl">₦12,450</Text>
              <Text className="text-slate-500 text-[10px]">Today</Text>
            </View>

            <View className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar" size={18} color="#1cd188" />
                <Text className="text-emerald-400 text-xs font-bold ml-2">This Week</Text>
              </View>
              <Text className="text-white font-black text-xl">₦45,200</Text>
              <Text className="text-slate-500 text-[10px]">Total</Text>
            </View>
          </View>
        </SlideUp>
      </ScrollView>
    </SafeAreaView>
  );
}
