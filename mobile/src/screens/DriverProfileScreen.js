import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { authService, driverService } from '../api/api';

export default function DriverProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);
      
      if (userData?.driver?.id) {
        const driverData = await driverService.getProfile(userData.driver.id);
        setDriver(driverData.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    if (!driver?.id) return;
    
    try {
      await driverService.toggleOnline(driver.id);
      loadProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to update online status');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-corporateNavy items-center justify-center">
        <ActivityIndicator color="#22d3ee" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-corporateNavy">
      <ScrollView className="flex-1">
        <View className="p-6">
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full bg-brandMint items-center justify-center mb-4">
              <Text className="text-3xl font-black text-corporateNavy">
                {user?.name?.charAt(0) || 'D'}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-white">{user?.name || 'Driver'}</Text>
            <Text className="text-slate-400">{user?.email}</Text>
            <View className="mt-2 flex-row items-center space-x-2">
              <View className={`w-3 h-3 rounded-full ${driver?.is_online ? 'bg-green-500' : 'bg-slate-500'}`} />
              <Text className="text-slate-400 text-sm">
                {driver?.is_online ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
            <Text className="text-brandMint font-mono text-xs uppercase tracking-widest mb-3">Driver Statistics</Text>
            <View className="grid grid-cols-2 gap-4">
              <View>
                <Text className="text-slate-400 text-xs">Total Jobs</Text>
                <Text className="text-white text-xl font-bold">{driver?.total_jobs || 0}</Text>
              </View>
              <View>
                <Text className="text-slate-400 text-xs">Rating</Text>
                <Text className="text-white text-xl font-bold">{driver?.rating || '0.0'}</Text>
              </View>
              <View>
                <Text className="text-slate-400 text-xs">Experience</Text>
                <Text className="text-white text-xl font-bold">{driver?.years_of_experience || 0}y</Text>
              </View>
              <View>
                <Text className="text-slate-400 text-xs">License Class</Text>
                <Text className="text-white text-xl font-bold">{driver?.license_class || '-'}</Text>
              </View>
            </View>
          </View>

          <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
            <Text className="text-brandMint font-mono text-xs uppercase tracking-widest mb-3">Vehicle Certifications</Text>
            <View className="flex flex-wrap gap-2">
              {driver?.vehicle_certifications?.map((cert, index) => (
                <View key={index} className="bg-slate-800 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs">{cert}</Text>
                </View>
              )) || <Text className="text-slate-500 text-sm">No certifications</Text>}
            </View>
          </View>

          <TouchableOpacity
            className={`py-4 rounded-xl items-center mb-4 ${driver?.is_online ? 'bg-red-500/20 border border-red-500' : 'bg-brandMint'}`}
            onPress={handleToggleOnline}
          >
            <Text className={`font-bold uppercase tracking-widest ${driver?.is_online ? 'text-red-500' : 'text-corporateNavy'}`}>
              {driver?.is_online ? 'Go Offline' : 'Go Online'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-slate-900 border border-slate-800 py-4 rounded-xl items-center mb-4"
            onPress={() => navigation.navigate('DriverDocuments')}
          >
            <Text className="text-white font-bold uppercase tracking-widest">View Documents</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-slate-900 border border-slate-800 py-4 rounded-xl items-center mb-4"
            onPress={() => navigation.navigate('DriverWallet')}
          >
            <Text className="text-white font-bold uppercase tracking-widest">Wallet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
