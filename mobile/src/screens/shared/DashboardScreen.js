import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../api/api';

export default function DashboardScreen({ route }) {
  const onLogout = route.params?.onLogout;

  const handleLogout = async () => {
    await authService.logout();
    if (onLogout) onLogout();
  };

  return (
    <SafeAreaView className="flex-1 bg-corporateNavy">
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-3xl font-black text-white mb-2 text-center uppercase tracking-widest">Command Center</Text>
        <Text className="text-brandMint mb-10 text-center font-mono">Mobile Telemetry Node</Text>
        
        <View className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full mb-8">
          <Text className="text-slate-400 text-center">Mobile UI Scaffold Complete. You are logged in.</Text>
        </View>

        <TouchableOpacity 
          className="border border-red-500/50 py-3 px-8 rounded-xl"
          onPress={handleLogout}
        >
          <Text className="text-red-500 font-bold uppercase tracking-widest text-sm">Disengage</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
