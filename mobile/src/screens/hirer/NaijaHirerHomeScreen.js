import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Image, Modal, Alert, TextInput, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import { useCountry } from '../../context/CountryContext';
import { api, authService, bookingService, extractArray } from '../../api/api';
import { isGoogleMapsConfigured } from '../../utils/maps';

let MapView, Marker;
try {
  const Maps = require('react-native-maps');
  if (Maps) {
    MapView = Maps.default;
    Marker = Maps.Marker;
  }
} catch (e) {
  console.log("react-native-maps not loaded in NaijaHirerHomeScreen", e);
}

// Supported international & regional Hire Markets (with Nigeria as default)
const COUNTRIES = [
  { id: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: '₦', marketTitle: 'Nigeria Market' },
  { id: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GH₵', marketTitle: 'Ghana Market' },
  { id: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KSh', marketTitle: 'Kenya Market' },
  { id: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'R', marketTitle: 'South Africa Market' },
  { id: 'UK', name: 'United Kingdom', flag: '🇬🇧', currency: '£', marketTitle: 'UK Market' },
  { id: 'US', name: 'United States', flag: '🇺🇸', currency: '$', marketTitle: 'US Market' },
];

export default function NaijaHirerHomeScreen({ navigation }) {
  const { isDark, themeColors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Selected Country Market (Synchronized with Global Country System)
  const { country: globalCountry, updateCountry } = useCountry();
  const selectedCountry = COUNTRIES.find(c => 
    c.id.toLowerCase() === (globalCountry?.code || globalCountry?.id || '').toLowerCase() ||
    c.name.toLowerCase() === (globalCountry?.name || '').toLowerCase()
  ) || COUNTRIES[0];
  const [showCountryModal, setShowCountryModal] = useState(false);

  // Map Picker Modal & Map Coordinates
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCoords, setMapCoords] = useState({
    latitude: 6.4281,
    longitude: 3.4219,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Device GPS Location & Manual Location
  const [userLocation, setUserLocation] = useState('Detecting device location...');
  const [typedLocation, setTypedLocation] = useState('');
  const [locLoading, setLocLoading] = useState(false);

  // Live Admin Executive Car Hire Fleets & Activity
  const [adminFleets, setAdminFleets] = useState([]);
  const [stats, setStats] = useState({ activeJobs: 0, drivers: 18, totalSpend: '₦0' });
  const [liveDrivers, setLiveDrivers] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Auto-detect device location
  const detectDeviceLocation = async () => {
    try {
      setLocLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUserLocation('Victoria Island, Lagos (Default)');
        setTypedLocation('Victoria Island, Lagos');
        setLocLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (position?.coords) {
        const reverse = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        if (reverse && reverse.length > 0) {
          const item = reverse[0];
          const locStr = [item.district || item.city || item.name, item.region || item.country].filter(Boolean).join(', ');
          setUserLocation(locStr || 'Lagos, Nigeria');
          setTypedLocation(locStr || 'Lagos, Nigeria');
        } else {
          setUserLocation('Lagos, Nigeria');
          setTypedLocation('Lagos, Nigeria');
        }
      }
    } catch (err) {
      console.log('Location detection error:', err);
      setUserLocation('Victoria Island, Lagos');
      setTypedLocation('Victoria Island, Lagos');
    } finally {
      setLocLoading(false);
    }
  };

  const fetchLiveMarketData = async () => {
    try {
      const [fleetRes, userRes, driverRes, bookingRes] = await Promise.allSettled([
        api.get('/executive-car-hires'),
        authService.getUser(),
        api.get('/drivers'),
        bookingService.getMyBookings()
      ]);

      if (fleetRes.status === 'fulfilled') {
        const fleetData = extractArray(fleetRes.value);
        setAdminFleets(fleetData);
      }
      if (userRes.status === 'fulfilled' && userRes.value) {
        setUserProfile(userRes.value);
      }
      let driverCount = 0;
      if (driverRes.status === 'fulfilled') {
        const rawDrivers = extractArray(driverRes.value);
        setLiveDrivers(rawDrivers.slice(0, 6));
        driverCount = rawDrivers.length;
      }
      let activeCount = 0;
      let totalSpent = 0;
      if (bookingRes.status === 'fulfilled') {
        const myBookings = extractArray(bookingRes.value);
        activeCount = myBookings.filter(b => ['pending', 'accepted', 'in_progress'].includes(b.status)).length;
        totalSpent = myBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (parseFloat(b.total_amount || b.agreed_rate || 0)), 0);
      }
      setStats({
        activeJobs: activeCount,
        drivers: driverCount,
        totalSpend: totalSpent > 0 ? `₦${(totalSpent/1000).toFixed(0)}K` : '₦0'
      });
    } catch (e) {
      console.log('Error fetching live hire market data:', e);
    }
  };

  useEffect(() => {
    detectDeviceLocation();
  }, []);

  useEffect(() => {
    fetchLiveMarketData();
  }, [selectedCountry]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLiveMarketData();
    detectDeviceLocation();
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? '#090d16' : '#ffffff',
      }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
      >
        {/* Top Header */}
        <View className="px-4 pt-5 pb-3">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1 mr-2">
              {navigation.canGoBack() && (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 items-center justify-center mr-3"
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={20} color="#10b981" />
                </TouchableOpacity>
              )}
              <View className="flex-1">
                <TouchableOpacity
                  onPress={() => setShowCountryModal(true)}
                  className="flex-row items-center mb-1.5 self-start px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30"
                >
                  <Text className="text-base mr-1.5">{selectedCountry.flag}</Text>
                  <Text className="text-emerald-500 text-[11px] font-normal uppercase tracking-wider mr-1">
                    {selectedCountry.marketTitle}
                  </Text>
                  <Ionicons name="chevron-down" size={13} color="#10b981" />
                </TouchableOpacity>

                <Text
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  className="font-normal text-2xl tracking-tight"
                >
                  Oga, Welcome!
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal">
                  {selectedCountry.id === 'NG'
                    ? 'Find, hire, or negotiate with verified Nigerian drivers sharp sharp'
                    : `Explore ${selectedCountry.name} vetted chauffeur & car hire services`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('RideBooking')}
              className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center shadow-sm"
            >
              <Ionicons name="car" size={22} color="#10b981" />
            </TouchableOpacity>
          </View>

          {/* Operating Market Notice */}
          <View className="mb-3 px-1 flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal">
              {`Operating currency: ${selectedCountry.currency} (${selectedCountry.id}) • Live Driver Radius`}
            </Text>
          </View>

          {/* Device GPS / Manual User Location Picker Card */}
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="p-3.5 rounded-2xl border shadow-sm mb-3"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color="#10b981" style={{ marginRight: 6 }} />
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                  Your Current Area / Location
                </Text>
              </View>

              <TouchableOpacity
                onPress={detectDeviceLocation}
                disabled={locLoading}
                className="flex-row items-center px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
              >
                {locLoading ? (
                  <ActivityIndicator size="small" color="#10b981" />
                ) : (
                  <>
                    <Ionicons name="navigate-outline" size={12} color="#10b981" style={{ marginRight: 4 }} />
                    <Text className="text-emerald-500 text-[10px] font-normal">Auto GPS</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Type / Manually change location or pick from map */}
            <View
              style={{
                backgroundColor: isDark ? '#1a2333' : '#f8fafc',
                borderColor: isDark ? '#334155' : '#cbd5e1',
              }}
              className="flex-row items-center border rounded-xl px-3 py-2"
            >
              <TextInput
                placeholder="Type area (e.g. Lekki, Maitama) or pick on map..."
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={typedLocation}
                onChangeText={(text) => {
                  setTypedLocation(text);
                  setUserLocation(text);
                }}
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                className="flex-1 text-xs font-normal mr-2"
              />
              {typedLocation ? (
                <TouchableOpacity onPress={() => { setTypedLocation(''); setUserLocation(''); }}>
                  <Ionicons name="close-circle" size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setShowMapModal(true)}>
                  <Ionicons name="location" size={18} color="#10b981" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Today's Activity Summary */}
        <View className="px-4 mb-4">
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-2xl p-4 shadow-sm"
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm">
                Your Activity
              </Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                <Text className="text-emerald-500 text-[10px] font-normal tracking-wider">LIVE</Text>
              </View>
            </View>
            <View className="flex-row space-x-2.5">
              <View
                style={{
                  backgroundColor: isDark ? '#1a2333' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="flex-1 rounded-xl p-3 items-center border"
              >
                <Text className="text-emerald-500 font-normal text-xl">{stats.activeJobs}</Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#475569' }} className="text-[10px] uppercase font-normal mt-0.5">
                  Active Jobs
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: isDark ? '#1a2333' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="flex-1 rounded-xl p-3 items-center border"
              >
                <Text className="text-emerald-500 font-normal text-xl">{stats.drivers}</Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#475569' }} className="text-[10px] uppercase font-normal mt-0.5">
                  Drivers
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: isDark ? '#1a2333' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="flex-1 rounded-xl p-3 items-center border"
              >
                <Text className="text-emerald-500 font-normal text-xl">{stats.totalSpend}</Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#475569' }} className="text-[10px] uppercase font-normal mt-0.5">
                  Spend
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* OgaPoints Rewards Banner */}
        <View className="px-4 mb-4">
          <TouchableOpacity
            onPress={() => navigation.navigate('Loyalty')}
            activeOpacity={0.85}
            style={{
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
              borderColor: isDark ? '#1e293b' : '#a7f3d0',
            }}
            className="border rounded-2xl p-3 flex-row items-center justify-between shadow-sm"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-8 h-8 rounded-xl bg-emerald-500/15 items-center justify-center mr-3 border border-emerald-500/30">
                <Ionicons name="sparkles" size={16} color="#10b981" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                    OgaPoints Rewards
                  </Text>
                  <View className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/20">
                    <Text className="text-[9px] font-normal uppercase text-emerald-500">1 pt = ₦1</Text>
                  </View>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#10b981" />
          </TouchableOpacity>
        </View>

        {/* Live Interactive Map Radar Preview Card */}
        <View className="px-4 mb-4">
          <TouchableOpacity
            onPress={() => navigation.navigate('RideBooking')}
            activeOpacity={0.9}
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-3xl overflow-hidden shadow-md"
          >
            {/* Clean White Map Mini Canvas */}
            <View className="h-40 w-full bg-[#f8fafc] items-center justify-center relative overflow-hidden border-b border-slate-200">
              {/* Subtle Road Lines */}
              <View className="absolute inset-0">
                <View className="absolute w-full h-8 bg-white top-1/4 -rotate-12 border-y border-slate-200/80" />
                <View className="absolute h-full w-8 bg-white left-1/3 rotate-12 border-x border-slate-200/80" />
                <View className="absolute w-28 h-20 bg-emerald-50/60 rounded-2xl top-4 left-6 border border-emerald-100/60" />
              </View>

              {/* Clean White Status Pin */}
              <View className="z-10 items-center flex-row px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-2.5 border border-emerald-600/30">
                  <Ionicons name="car" size={16} color="#008751" />
                </View>
                <View>
                  <Text className="text-slate-900 text-xs font-normal">18 Drivers Nearby</Text>
                  <Text className="text-emerald-700 text-[10px] font-normal">Lekki • VI • Ikeja Coverage</Text>
                </View>
              </View>

              {/* Clean Status Badge */}
              <View className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-full flex-row items-center border border-slate-200 shadow-xs">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                <Text className="text-slate-800 font-normal text-[9px] uppercase tracking-wider">
                  Live Dispatch
                </Text>
              </View>

              <View className="absolute bottom-3 right-3 bg-white/95 px-3 py-1 rounded-full border border-slate-200 shadow-xs">
                <Text className="text-emerald-700 text-[10px] font-normal uppercase tracking-wider">
                  Open Map ➔
                </Text>
              </View>
            </View>

            <View className="p-4 flex-row items-center justify-between">
              <View>
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm">
                  Active Area Tactical Map
                </Text>
              </View>
              <View className="px-3 py-1.5 rounded-xl bg-emerald-500">
                <Text className="text-white font-normal text-xs">Request Ride</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Unified Quick Actions Grid */}
        <View className="px-4 mb-4">
          <View className="flex-row space-x-3 mb-3">
            {/* 1. Instant Ride */}
            <TouchableOpacity
              style={{
                backgroundColor: isDark ? '#121927' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="flex-1 border rounded-2xl p-4 items-center shadow-sm"
              onPress={() => navigation.navigate('RideBooking')}
            >
              <View className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 items-center justify-center mb-2">
                <Ionicons name="car" size={24} color="#10b981" />
              </View>
              <View className="flex-row items-center">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                  Instant Ride
                </Text>
                <View className="ml-1.5 px-1.5 py-0.2 rounded bg-emerald-500/20">
                  <Text className="text-[8px] font-normal text-emerald-500 uppercase">Fast</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* 2. Hire Chauffeur */}
            <TouchableOpacity
              style={{
                backgroundColor: isDark ? '#121927' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="flex-1 border rounded-2xl p-4 items-center shadow-sm"
              onPress={() => navigation.navigate('HireBooking')}
            >
              <View className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 items-center justify-center mb-2">
                <Ionicons name="briefcase" size={22} color="#10b981" />
              </View>
              <View className="flex-row items-center">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                  Hire Chauffeur
                </Text>
                <View className="ml-1.5 px-1.5 py-0.2 rounded bg-emerald-500/20">
                  <Text className="text-[8px] font-normal text-emerald-500 uppercase">Pro</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View className="flex-row space-x-3">
            {/* 3. Post Job */}
            <TouchableOpacity
              style={{
                backgroundColor: isDark ? '#121927' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="flex-1 border rounded-2xl p-4 items-center shadow-sm"
              onPress={() => navigation.navigate('PostJob')}
            >
              <View className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 items-center justify-center mb-2">
                <Ionicons name="add-circle" size={24} color="#10b981" />
              </View>
              <View className="flex-row items-center">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                  Post Job
                </Text>
                <View className="ml-1.5 px-1.5 py-0.2 rounded bg-emerald-500/20">
                  <Text className="text-[8px] font-normal text-emerald-500 uppercase">Flex</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* 4. Browse Drivers */}
            <TouchableOpacity
              style={{
                backgroundColor: isDark ? '#121927' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="flex-1 border rounded-2xl p-4 items-center shadow-sm"
              onPress={() => navigation.navigate('SearchDrivers')}
            >
              <View className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 items-center justify-center mb-2">
                <Ionicons name="people" size={22} color="#10b981" />
              </View>
              <View className="flex-row items-center">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                  Browse Drivers
                </Text>
                <View className="ml-1.5 px-1.5 py-0.2 rounded bg-emerald-500/20">
                  <Text className="text-[8px] font-normal text-emerald-500 uppercase">Vetted</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ADMIN CURATED EXECUTIVE FLEETS & HIRE CARS (Directly aligned with Admin) */}
        <View className="px-4 mb-5">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm">
                {`${selectedCountry.name} Executive Hire Fleets`}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('VipFleet')}
              className="flex-row items-center px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
            >
              <Text className="text-emerald-500 font-normal text-xs mr-1">View All</Text>
              <Ionicons name="arrow-forward" size={12} color="#10b981" />
            </TouchableOpacity>
          </View>

          {/* Fleets List */}
          <View className="space-y-3">
            {(adminFleets.filter((fleet) => {
                if (!typedLocation.trim()) return true;
                const locLower = typedLocation.toLowerCase();
                return (
                  selectedCountry.id !== 'NG' ||
                  fleet.state?.toLowerCase().includes(locLower) ||
                  fleet.lga?.toLowerCase().includes(locLower) ||
                  locLower.includes(fleet.state?.toLowerCase() || '') ||
                  locLower.includes(fleet.lga?.toLowerCase() || '')
                );
              }).length > 0
                ? adminFleets.filter((fleet) => {
                    if (!typedLocation.trim()) return true;
                    const locLower = typedLocation.toLowerCase();
                    return (
                      selectedCountry.id !== 'NG' ||
                      fleet.state?.toLowerCase().includes(locLower) ||
                      fleet.lga?.toLowerCase().includes(locLower) ||
                      locLower.includes(fleet.state?.toLowerCase() || '') ||
                      locLower.includes(fleet.lga?.toLowerCase() || '')
                    );
                  })
                : adminFleets)
              .map((fleetItem) => (
                <View
                  key={fleetItem.id}
                  style={{
                    backgroundColor: isDark ? '#121927' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="p-4 rounded-2xl border shadow-sm mb-3"
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center">
                        <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm" numberOfLines={1}>
                          {fleetItem.name}
                        </Text>
                        {fleetItem.is_verified && (
                          <View className="ml-1.5 flex-row items-center bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                            <Ionicons name="shield-checkmark" size={11} color="#10b981" style={{ marginRight: 2 }} />
                            <Text className="text-emerald-500 text-[9px] font-normal">Admin Vetted</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal mt-0.5">
                        {`${fleetItem.lga || 'City Hub'}, ${fleetItem.state || selectedCountry.name}`}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-emerald-500 font-normal text-xs">
                        {fleetItem.min_fare || `${selectedCountry.currency}35,000/day`}
                      </Text>
                      <View className="flex-row items-center mt-0.5">
                        <Ionicons name="star" size={11} color="#10b981" style={{ marginRight: 2 }} />
                        <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-[10px] font-normal">
                          {fleetItem.rating || 4.9}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Available Fleet Models */}
                  {Array.isArray(fleetItem.fleet) && fleetItem.fleet.length > 0 && (
                    <View className="flex-row flex-wrap gap-1.5 mb-3">
                      {fleetItem.fleet.slice(0, 3).map((carName, cIdx) => (
                        <View
                          key={cIdx}
                          style={{
                            backgroundColor: isDark ? '#1a2333' : '#f8fafc',
                            borderColor: isDark ? '#1e293b' : '#e2e8f0',
                          }}
                          className="px-2 py-0.5 rounded-md border mr-1"
                        >
                          <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal">
                            🚗 {carName}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View className="flex-row space-x-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <TouchableOpacity
                      onPress={() => navigation.navigate('HireBooking', { fleet: fleetItem })}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 active:bg-emerald-600 items-center justify-center flex-row"
                    >
                      <Ionicons name="briefcase" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                      <Text className="text-white font-normal text-xs">Book Fleet / Chauffeur</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => navigation.navigate('VipFleet', { fleetId: fleetItem.id })}
                      style={{
                        backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                      }}
                      className="px-3.5 py-2.5 rounded-xl items-center justify-center"
                    >
                      <Ionicons name="information-circle-outline" size={16} color={isDark ? '#ffffff' : '#0f172a'} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </View>
        </View>

        {/* Live Nearby Verified Drivers Section */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm">
                Verified Chauffeurs Ready for Dispatch
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('SearchDrivers')}
              className="flex-row items-center px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
            >
              <Text className="text-emerald-500 font-normal text-xs mr-1">See All</Text>
              <Ionicons name="arrow-forward" size={12} color="#10b981" />
            </TouchableOpacity>
          </View>

          {liveDrivers && liveDrivers.length > 0 ? (
            liveDrivers.slice(0, 3).map((driverItem, dIdx) => {
              const driverName = driverItem.name || driverItem.user?.name || `Verified Driver #${dIdx + 1}`;
              const vehicleInfo = driverItem.vehicle_make
                ? `${driverItem.vehicle_make} ${driverItem.vehicle_model || ''}`
                : 'Executive Chauffeur';
              return (
                <View
                  key={driverItem.id || dIdx}
                  style={{
                    backgroundColor: isDark ? '#121927' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="p-3.5 rounded-2xl border shadow-sm mb-2.5 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    <View className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mr-3">
                      <Ionicons name="person" size={18} color="#10b981" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs mr-1.5" numberOfLines={1}>
                          {driverName}
                        </Text>
                        <Ionicons name="shield-checkmark" size={12} color="#10b981" />
                      </View>
                      <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal mt-0.5">
                        {vehicleInfo} • {driverItem.city || driverItem.state || 'Lagos'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('HireBooking', { driver: driverItem })}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 active:bg-emerald-600 items-center justify-center"
                  >
                    <Text className="text-white text-xs font-normal">Hire</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('SearchDrivers')}
              style={{
                backgroundColor: isDark ? '#121927' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="p-4 rounded-2xl border items-center justify-center shadow-sm"
            >
              <Ionicons name="people-outline" size={24} color="#10b981" style={{ marginBottom: 6 }} />
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs text-center">
                Search Vetted Drivers & Chauffeurs
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal text-center mt-1">
                Filter across 36 states by experience, vehicle class, and security clearance.
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Booking Management Banner */}
        <View className="px-4 mb-8">
          <TouchableOpacity
            onPress={() => navigation.navigate('HirerBookings')}
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="p-4 rounded-2xl border flex-row items-center justify-between shadow-sm"
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                  My Trips & Booking History
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal mt-0.5">
                  View scheduled dates, ongoing chauffeur contracts & receipts
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* INTERNATIONAL COUNTRY HIRE MARKET SELECTOR MODAL */}
      <Modal visible={showCountryModal} transparent animationType="slide" onRequestClose={() => setShowCountryModal(false)}>
        <View
          style={{
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 48) + 16 : Math.max(insets.bottom, 16) + 8,
          }}
          className="flex-1 bg-black/60 justify-end px-3"
        >
          <View
            style={{
              backgroundColor: isDark ? '#090d16' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
              maxHeight: '85%',
            }}
            className="rounded-3xl p-6 border shadow-2xl"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-lg font-normal tracking-tight">
                  Select Country Hire Market
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal">
                  Each country has independent regional fleets & verified chauffeur pools
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-2">
              {COUNTRIES.map((c) => {
                const isCurrent = selectedCountry.id === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => {
                      updateCountry(c.id);
                      setShowCountryModal(false);
                      Alert.alert(
                        'Market Switched',
                        `Now viewing the ${c.marketTitle}. Currency: ${c.currency} (${c.id}). Verified drivers & fleets aligned.`
                      );
                    }}
                    style={{
                      backgroundColor: isCurrent
                        ? isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5'
                        : isDark ? '#121927' : '#f8fafc',
                      borderColor: isCurrent ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                      borderWidth: isCurrent ? 2 : 1,
                    }}
                    className="p-4 rounded-2xl mb-2.5 flex-row items-center justify-between shadow-xs"
                  >
                    <View className="flex-row items-center flex-1 mr-3">
                      <Text className="text-2xl mr-3">{c.flag}</Text>
                      <View className="flex-1">
                        <Text
                          style={{
                            color: isCurrent ? '#10b981' : isDark ? '#ffffff' : '#0f172a',
                          }}
                          className="font-normal text-sm"
                        >
                          {c.marketTitle}
                        </Text>
                        <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px] font-normal">
                          {`${c.name} • Currency: ${c.currency}`}
                        </Text>
                      </View>
                    </View>

                    {isCurrent ? (
                      <Ionicons name="checkmark-circle" size={22} color="#10b981" />
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color="#64748b" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MAP LOCATION PICKER MODAL */}
      <Modal
        visible={showMapModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View
          style={{
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 48) + 16 : Math.max(insets.bottom, 16) + 8,
          }}
          className="flex-1 bg-black/60 justify-end px-3"
        >
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
              maxHeight: '85%',
            }}
            className="rounded-3xl border p-5 shadow-2xl"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <View className="flex-1 mr-2">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-base">
                  Pick Area on Map
                </Text>
                <Text className="text-xs font-normal text-emerald-600 dark:text-brandMint">
                  Select your current or destination neighborhood
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowMapModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
              >
                <Ionicons name="close" size={18} color={isDark ? '#ffffff' : '#0f172a'} />
              </TouchableOpacity>
            </View>

            <ScrollView className="py-4" showsVerticalScrollIndicator={false}>
              {/* Native MapView if available and key configured */}
              {Platform.OS !== 'web' && MapView && isGoogleMapsConfigured() ? (
                <View className="h-56 rounded-2xl overflow-hidden mb-3 border border-slate-200 dark:border-slate-700">
                  <MapView
                    style={{ flex: 1 }}
                    region={mapCoords}
                    onPress={async (e) => {
                      const coord = e.nativeEvent.coordinate;
                      setMapCoords(prev => ({ ...prev, latitude: coord.latitude, longitude: coord.longitude }));
                    }}
                  >
                    <Marker coordinate={{ latitude: mapCoords.latitude, longitude: mapCoords.longitude }} />
                  </MapView>
                </View>
              ) : null}

              {Platform.OS !== 'web' && MapView && isGoogleMapsConfigured() ? (
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      const reverse = await Location.reverseGeocodeAsync({
                        latitude: mapCoords.latitude,
                        longitude: mapCoords.longitude,
                      });
                      if (reverse && reverse.length > 0) {
                        const item = reverse[0];
                        const locStr = [item.district || item.city || item.name, item.region || item.country].filter(Boolean).join(', ');
                        setTypedLocation(locStr);
                        setUserLocation(locStr);
                      }
                    } catch (err) {
                      setTypedLocation(`${mapCoords.latitude.toFixed(4)}, ${mapCoords.longitude.toFixed(4)}`);
                    }
                    setShowMapModal(false);
                  }}
                  className="bg-emerald-500 py-3 rounded-xl items-center mb-4 active:bg-emerald-600"
                >
                  <Text className="text-white text-xs font-normal">Confirm Pin on Map</Text>
                </TouchableOpacity>
              ) : null}

              {/* Quick Select Transport Hubs */}
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal mb-2.5">
                Popular Transport & Business Hubs
              </Text>
              <View className="space-y-2 mb-2">
                {[
                  { name: 'Victoria Island & Ikoyi', region: 'Lagos', lat: 6.4281, lng: 3.4219 },
                  { name: 'Lekki Phase 1 / Admiralty', region: 'Lagos', lat: 6.4474, lng: 3.4735 },
                  { name: 'Ikeja GRA & Airport Hub', region: 'Lagos', lat: 6.5954, lng: 3.3533 },
                  { name: 'Maitama / Central Area', region: 'Abuja (FCT)', lat: 9.0765, lng: 7.3986 },
                  { name: 'Wuse 2 & Garki District', region: 'Abuja (FCT)', lat: 9.0600, lng: 7.4700 },
                  { name: 'GRA Phase 2 / Trans-Amadi', region: 'Port Harcourt', lat: 4.8156, lng: 7.0498 },
                  { name: 'Bodija & Ring Road', region: 'Ibadan', lat: 7.4243, lng: 3.9056 },
                ].map((hub) => (
                  <TouchableOpacity
                    key={hub.name}
                    onPress={() => {
                      setTypedLocation(`${hub.name}, ${hub.region}`);
                      setUserLocation(`${hub.name}, ${hub.region}`);
                      setMapCoords(prev => ({ ...prev, latitude: hub.lat, longitude: hub.lng }));
                      setShowMapModal(false);
                    }}
                    style={{
                      backgroundColor: isDark ? '#1a2333' : '#f8fafc',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                    }}
                    className="p-3 rounded-xl border flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="location-outline" size={16} color="#10b981" />
                      <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal ml-2">
                        {hub.name}
                      </Text>
                    </View>
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px] font-normal">
                      {hub.region}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Sticky Action Bar */}
      <View
        style={{
          backgroundColor: isDark ? '#090d16' : '#ffffff',
          borderTopColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
        className="border-t px-4 py-3.5"
      >
        <TouchableOpacity
          className="bg-emerald-500 active:bg-emerald-600 py-3.5 rounded-2xl items-center flex-row justify-center shadow-lg shadow-emerald-500/20"
          onPress={() => navigation.navigate('PostJob')}
        >
          <Ionicons name="add-circle" size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text className="text-white font-normal text-sm uppercase tracking-wider">
            Post Job — Find Your Driver!
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
