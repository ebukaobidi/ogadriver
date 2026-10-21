import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Animated, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import FadeIn from '../../components/FadeIn';
import SlideUp from '../../components/SlideUp';

export default function OgaCopilotScreen({ navigation }) {
  const [copilot, setCopilot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [perimeter, setPerimeter] = useState(15);
  useEffect(() => {
    const onBack = () => {
      if (navigation?.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [navigation]);
 // Default 15km perimeter radius

  useEffect(() => {
    api.get('/drivers/copilot/demand-radar')
      .then(res => {
        if (res.data?.success) setCopilot(res.data.data);
      })
      .catch(e => console.log('Copilot error:', e))
      .finally(() => setLoading(false));
  }, []);

  const handleNavigate = (zoneName) => {
    Alert.alert('Navigation Started', `Routing to high-demand zone: ${zoneName}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-[#090d16] to-[#0f172a]">
      <ScrollView className="flex-1 px-4 pt-3 pb-8">
        {/* Top App Bar Header */}
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center">
            {navigation?.canGoBack && navigation.canGoBack() && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                className="mr-2 p-1 rounded-xl"
              >
                <Ionicons name="arrow-back" size={22} color="#ffffff" />
              </TouchableOpacity>
            )}
            <View className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 items-center justify-center mr-2 relative shadow-lg shadow-emerald-500/20">
              <Ionicons name="person" size={16} color="#10b981" />
            </View>
            <Text className="text-white font-normal text-lg">Oga Driver</Text>
          </View>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity className="p-2 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 shadow-lg">
              <Ionicons name="chatbubble-outline" size={18} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 shadow-lg ml-2 relative">
              <Ionicons name="notifications-outline" size={18} color="#ffffff" />
              <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <Text className="text-white text-[9px] font-normal">3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subheader Title */}
        <Text className="text-center font-mono text-[10px] uppercase text-emerald-400 font-bold tracking-widest mb-4">SURGE MAP</Text>

        {/* LIVE SURGE MAP Section Header */}
        <SlideUp delay={100}>
          <View className="mb-4">
            <Text className="text-white font-black text-2xl tracking-wide">LIVE SURGE MAP</Text>
            <Text className="text-slate-400 text-xs mt-1">Track high-demand areas and premium jobs in real-time.</Text>
          </View>
        </SlideUp>

        {/* Radar Engine: Working Perimeter Selector Card */}
        <SlideUp delay={200}>
          <View className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4 mb-5 shadow-xl shadow-black/20">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Ionicons name="locate-outline" size={18} color="#10b981" className="mr-2" />
                <Text className="text-white font-bold text-sm">🎯 Radar Engine: Working Perimeter</Text>
              </View>
              <View className="bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full shadow-lg shadow-emerald-500/20">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                <Text className="text-emerald-400 font-black text-xs">[ {perimeter} km ]</Text>
              </View>
            </View>

            {/* Perimeter Quick Selectors */}
            <View className="flex-row space-x-2">
              {[5, 15, 25, 50].map((dist) => (
                <TouchableOpacity
                  key={dist}
                  className={`flex-1 py-2 rounded-xl border items-center shadow-lg ${perimeter === dist ? 'bg-emerald-950 border-emerald-500 shadow-emerald-500/30' : 'bg-slate-950/50 border-slate-800'}`}
                  onPress={() => setPerimeter(dist)}
                >
                  <Text className={`font-bold text-xs ${perimeter === dist ? 'text-emerald-400' : 'text-slate-400'}`}>{dist} km</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </SlideUp>

        {/* Map Canvas Container (Dark Mode Theme) */}
        <SlideUp delay={300}>
          <View className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-4 mb-8 overflow-hidden relative shadow-2xl shadow-black/30">
            <View className="w-full h-80 rounded-2xl bg-[#0b101d] overflow-hidden relative border border-slate-800 justify-between p-4">
              {/* Dark Mode Map Grid Simulation */}
              <View className="w-full h-full absolute top-0 left-0 opacity-25 bg-slate-900 flex-wrap flex-row">
                {Array.from({ length: 30 }).map((_, i) => (
                  <View key={i} className="w-1/5 h-1/6 border border-emerald-500/20" />
                ))}
              </View>

              {/* 🔥 High Surge Zone 1 Overlay: 2.4x Maitama / Wuse II */}
              <TouchableOpacity
                className="bg-red-950/90 backdrop-blur-sm border border-red-500/80 rounded-2xl p-3 shadow-xl shadow-red-500/20 self-start w-[85%] mb-2"
                onPress={() => handleNavigate('Maitama / Wuse II Zone')}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-red-400 font-black text-sm">🔥 2.4x Surge</Text>
                  <Text className="text-white font-bold text-xs">[Maitama / Wuse II Zone]</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                  <Text className="text-red-200 text-[11px] font-semibold">High Demand (38 trip requests)</Text>
                </View>
              </TouchableOpacity>

              {/* ⚡ Medium Surge Zone 2 Overlay: 1.8x Garki / Central Area */}
              <TouchableOpacity
                className="bg-amber-950/90 backdrop-blur-sm border border-amber-500/80 rounded-2xl p-3 shadow-xl shadow-amber-500/20 self-end w-[85%] mt-2"
                onPress={() => handleNavigate('Garki / Central Area')}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-amber-400 font-black text-sm">⚡ 1.8x Surge</Text>
                  <Text className="text-white font-bold text-xs">[Garki / Central Area]</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse" />
                  <Text className="text-amber-200 text-[11px] font-semibold">Medium Demand (19 trip requests)</Text>
                </View>
              </TouchableOpacity>

              {/* Map Action Overlay / Controls */}
              <View className="absolute right-3 top-24 space-y-2">
                <TouchableOpacity className="w-9 h-9 rounded-xl bg-slate-900/90 backdrop-blur-sm border border-slate-800 items-center justify-center mb-1 shadow-lg">
                  <Ionicons name="locate" size={18} color="#10b981" />
                </TouchableOpacity>
                <TouchableOpacity className="w-9 h-9 rounded-xl bg-slate-900/90 backdrop-blur-sm border border-slate-800 items-center justify-center mb-1 shadow-lg">
                  <Ionicons name="compass" size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* 🔥 TOP SURGE ZONE NOW Floating Overlay Card */}
              <View className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 rounded-2xl p-4 mt-4 shadow-2xl shadow-emerald-500/20">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-amber-400 font-black text-xs uppercase tracking-wider">🔥 TOP SURGE ZONE NOW</Text>
                  <View className="bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                    <Text className="text-emerald-400 font-bold text-[9px]">+₦4,500 extra / trip</Text>
                  </View>
                </View>

                <Text className="text-white font-bold text-sm mb-3">Maitama & Central Business District</Text>

                <TouchableOpacity
                  className="bg-gradient-to-r from-brandMint to-emerald-500 py-3 rounded-xl items-center flex-row justify-center shadow-lg shadow-emerald-500/30"
                  onPress={() => handleNavigate('Maitama & Central Business District')}
                >
                  <Ionicons name="navigate-outline" size={16} color="#0f172a" className="mr-2" />
                  <Text className="text-slate-950 font-black text-xs uppercase tracking-wider">Navigate to Zone</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SlideUp>
      </ScrollView>
    </SafeAreaView>
  );
}
