import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { authService } from '../api/api';

export default function ProfileScreen({ route }) {
  const onLogout = route.params?.onLogout;

  const handleLogout = async () => {
    await authService.logout();
    if (onLogout) onLogout();
  };

  return (
    <SafeAreaView className="flex-1 bg-corporateNavy">
      <View className="px-5 pt-4 pb-2 border-b border-slate-800">
        <Text className="text-2xl font-black text-white uppercase tracking-widest">Dossier</Text>
        <Text className="text-brandMint font-mono text-xs mb-2">Driver Profile</Text>
      </View>
      <ScrollView className="flex-1 p-5">
        <View className="items-center mb-10">
          <View className="w-24 h-24 rounded-full bg-slate-800 border-2 border-brandMint justify-center items-center mb-4">
            <Text className="text-brandMint font-black text-3xl">D</Text>
          </View>
          <Text className="text-xl font-bold text-white uppercase">Operative</Text>
          <Text className="text-slate-400 font-mono text-xs">ID: OGA-001</Text>
        </View>

        <View className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
          <Text className="text-white font-bold mb-4 uppercase tracking-widest text-sm border-b border-slate-800 pb-2">System Status</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-400">Security Clearance</Text>
            <Text className="text-emerald-400 font-bold">VERIFIED</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-slate-400">Escrow Balance</Text>
            <Text className="text-brandMint font-mono">₦0.00</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="border border-red-500/50 py-4 px-8 rounded-xl items-center bg-red-900/20"
          onPress={handleLogout}
        >
          <Text className="text-red-500 font-bold uppercase tracking-widest text-sm">Disengage</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
