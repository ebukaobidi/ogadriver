import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { bookingService } from '../../api/api';
import MapCommandCenter from '../../components/MapCommandCenter';
import GestureDeckNavigation from '../../components/GestureDeckNavigation';
import FadeIn from '../../components/FadeIn';

export default function DriverTacticalMapScreen({ navigation }) {
  const [activeView, setActiveView] = useState('map');
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [userLocation, setUserLocation] = useState({ latitude: 6.5244, longitude: 3.3792 });

  const views = [
    { id: 'map', icon: 'map', label: 'Tactical Map', color: '#1cd188' },
    { id: 'surge', icon: 'flash', label: 'Surge Zones', color: '#f59e0b' },
    { id: 'earnings', icon: 'wallet', label: 'Earnings', color: '#3b82f6' },
    { id: 'jobs', icon: 'briefcase', label: 'Active Jobs', color: '#a855f7' },
    { id: 'bounty', icon: 'trophy', label: 'Bounty Hunter', color: '#ef4444' },
  ];

  useEffect(() => {
    loadLiveMap();
  }, []);

  const loadLiveMap = async () => {
    try {
      let loc = userLocation;
      const { status } = await Location.requestForegroundPermissionsAsync().catch(() => ({ status: 'denied' }));
      if (status === 'granted') {
        const cur = await Location.getCurrentPositionAsync({}).catch(() => null);
        if (cur?.coords) {
          loc = { latitude: cur.coords.latitude, longitude: cur.coords.longitude };
          setUserLocation(loc);
        }
      }

      const res = await bookingService.searchDrivers({
        latitude: loc.latitude,
        longitude: loc.longitude,
        online_only: true,
        radius_km: 50,
      }).catch(() => ({ data: [] }));

      const list = res?.data || [];
      const drivers = list.map((d) => ({
        id: d.id,
        name: d.user?.name || d.name || 'Active Driver',
        rating: Number(d.rating || 5.0),
        distance: d.distance ? `${Number(d.distance).toFixed(1)}km` : 'Nearby',
        latitude: Number(d.current_latitude || loc.latitude),
        longitude: Number(d.current_longitude || loc.longitude),
      }));

      setNearbyDrivers(drivers);
    } catch (e) {
      setNearbyDrivers([]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0f1a]">
      {/* Tactical Header */}
      <FadeIn>
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-brandMint/60 text-[10px] font-mono uppercase tracking-[0.3em]">
                OGADRIVERS PARTNERS
              </Text>
              <Text className="text-white font-black text-2xl tracking-tight">
                DRIVER DASHBOARD
              </Text>
            </View>
            <TouchableOpacity className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 items-center justify-center">
              <Ionicons name="notifications" size={20} color="#1cd188" />
            </TouchableOpacity>
          </View>
        </View>
      </FadeIn>

      {/* Main Content Area */}
      <View className="flex-1">
        {activeView === 'map' && (
          <MapCommandCenter
            userLocation={userLocation}
            nearbyDrivers={nearbyDrivers}
            onDriverSelect={(driver) => console.log('Selected:', driver)}
            onLocationPress={(location) => console.log('Location:', location)}
          />
        )}

        {activeView === 'surge' && (
          <View className="flex-1 items-center justify-center">
            <View className="text-center">
              <Ionicons name="flash" size={64} color="#10b981" />
              <Text className="text-white font-normal text-xl mt-4">Surge Zones</Text>
            </View>
          </View>
        )}

        {activeView === 'earnings' && (
          <View className="flex-1 items-center justify-center">
            <View className="text-center">
              <Ionicons name="wallet" size={64} color="#10b981" />
              <Text className="text-white font-normal text-xl mt-4">Earnings Dashboard</Text>
            </View>
          </View>
        )}

        {activeView === 'jobs' && (
          <View className="flex-1 items-center justify-center">
            <View className="text-center">
              <Ionicons name="briefcase" size={64} color="#a855f7" />
              <Text className="text-white font-black text-xl mt-4">Active Jobs</Text>
              <Text className="text-slate-400 text-sm">Swipe to return to map</Text>
            </View>
          </View>
        )}

        {activeView === 'bounty' && (
          <View className="flex-1 items-center justify-center">
            <View className="text-center">
              <Ionicons name="trophy" size={64} color="#ef4444" />
              <Text className="text-white font-black text-xl mt-4">Bounty Hunter</Text>
              <Text className="text-slate-400 text-sm">Swipe to return to map</Text>
            </View>
          </View>
        )}
      </View>

      {/* Gesture Deck Navigation - Bottom */}
      <GestureDeckNavigation
        views={views}
        activeView={activeView}
        onViewChange={(view) => setActiveView(view.id)}
      />
    </SafeAreaView>
  );
}
