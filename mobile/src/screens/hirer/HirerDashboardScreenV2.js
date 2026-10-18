import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { bookingService } from '../../api/api';
import MapCommandCenter from '../../components/MapCommandCenter';
import GestureDeckNavigation from '../../components/GestureDeckNavigation';
import VIPPriorityCard from '../../components/VIPPriorityCard';
import CompetitiveIntelligenceCard from '../../components/CompetitiveIntelligenceCard';
import FadeIn from '../../components/FadeIn';

export default function HirerDashboardScreenV2({ navigation }) {
  const [activeView, setActiveView] = useState('map');
  const [isVIP, setIsVIP] = useState(false);
  const [priceWarMode, setPriceWarMode] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [userLocation, setUserLocation] = useState({ latitude: 6.5244, longitude: 3.3792 });
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  const views = [
    { id: 'map', icon: 'map', label: 'Tactical Map', color: '#1cd188' },
    { id: 'vip', icon: 'diamond', label: 'VIP Priority', color: '#a855f7' },
    { id: 'intelligence', icon: 'analytics', label: 'Intelligence', color: '#f59e0b' },
    { id: 'jobs', icon: 'briefcase', label: 'Active Jobs', color: '#3b82f6' },
  ];

  useEffect(() => {
    loadLiveRadar();
  }, []);

  const loadLiveRadar = async () => {
    try {
      setLoadingDrivers(true);
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
        for_ride: true,
        online_only: true,
        radius_km: 50,
      }).catch(() => ({ data: [] }));

      const list = res?.data || [];
      const drivers = list.map((d) => ({
        id: d.id,
        name: d.user?.name || d.name || 'Verified Driver',
        rating: Number(d.rating || 5.0),
        distance: d.distance ? `${Number(d.distance).toFixed(1)}km` : 'Nearby',
        latitude: Number(d.current_latitude || loc.latitude),
        longitude: Number(d.current_longitude || loc.longitude),
      }));

      setNearbyDrivers(drivers);
    } catch (e) {
      setNearbyDrivers([]);
    } finally {
      setLoadingDrivers(false);
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
                OGADRIVERS
              </Text>
              <Text className="text-white font-black text-2xl tracking-tight">
                HIRER DASHBOARD
              </Text>
            </View>
            <TouchableOpacity className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 items-center justify-center relative">
              <Ionicons name="notifications" size={20} color="#1cd188" />
              <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-slate-900 flex items-center justify-center">
                <Text className="text-white text-[9px] font-bold">5</Text>
              </View>
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

        {activeView === 'vip' && (
          <View className="flex-1 px-4 py-6">
            <VIPPriorityCard
              isVIP={isVIP}
              onUpgrade={() => {}}
              onActivate={() => {}}
            />
          </View>
        )}

        {activeView === 'intelligence' && (
          <View className="flex-1 px-4 py-6">
            <CompetitiveIntelligenceCard
              marketData={{
                competitorPrices: { avgPrice: 4500 },
                ourPrice: priceWarMode ? 3825 : 4500,
              }}
              onPriceAdjust={() => {}}
            />
          </View>
        )}

        {activeView === 'jobs' && (
          <View className="flex-1 items-center justify-center">
            <View className="text-center">
              <Ionicons name="briefcase" size={64} color="#3b82f6" />
              <Text className="text-white font-black text-xl mt-4">Active Jobs</Text>
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
