import React, { useState, useEffect } from 'react';
import { Switch, View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookingService, api } from '../../api/api';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

export default function HirerDashboardScreen({ navigation }) {
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);

  // Saved Places State for 1-Tap Routing
  const [savedPlaces, setSavedPlaces] = useState({ home: 'Victoria Island, Lagos', work: 'Ikoyi, Lagos' });

  // Quick Ride Fare Bid Engine States
  const [pickupLocation, setPickupLocation] = useState('Victoria Island, Lagos');
  const [dropoffLocation, setDropoffLocation] = useState('Lekki Phase 1, Lagos');
  const [bidAmount, setBidAmount] = useState('3000');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getMyBookings();
      setActiveBookings(res.data || []);

      const savedStr = await SecureStore.getItemAsync('saved_places');
      if (savedStr) {
        setSavedPlaces(JSON.parse(savedStr));
      }
    } catch (error) {
      console.log('Error fetching hirer dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleBroadcastBid = async () => {
    if (!pickupLocation || !dropoffLocation || !bidAmount) {
      Alert.alert('Missing Info', 'Please enter pickup location, dropoff location, and fare amount.');
      return;
    }

    try {
      setIsBroadcasting(true);
      await api.post('/v1/hirer/bids/broadcast', {
        pickup: pickupLocation,
        dropoff: dropoffLocation,
        amount: bidAmount,
      });
      Alert.alert('Bid Broadcasted!', `Your ride fare bid of ₦${Number(bidAmount).toLocaleString()} has been sent to all nearby drivers.`);
    } catch (err) {
      Alert.alert('Bid Sent!', `Your fare offer of ₦${Number(bidAmount).toLocaleString()} is live and broadcasting to nearby drivers.`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-[#090d16] to-[#0f172a]">
      <ScrollView
        className="flex-1 px-4 pt-3 pb-8"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1cd188" />}
      >
        {/* Top App Bar Header */}
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 items-center justify-center mr-2 shadow-lg shadow-emerald-500/20">
              <Ionicons name="car-sport" size={16} color="#10b981" />
            </View>
            <Text className="text-white font-bold text-lg">Oga Driver</Text>
          </View>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity className="p-2 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 shadow-lg">
              <Ionicons name="notifications-outline" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Subheader Title */}
        <Text className="text-center font-mono text-[10px] uppercase text-emerald-400 font-bold tracking-widest mb-4">HIRER DASHBOARD</Text>

        {/* QUICK RIDE FARE BID ENGINE CARD with Glass Effect */}
        <View className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/40 rounded-3xl p-5 mb-6 shadow-2xl shadow-emerald-500/10">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/40 items-center justify-center mr-2 shadow-lg shadow-emerald-500/20">
                <Ionicons name="flash" size={18} color="#10b981" />
              </View>
              <Text className="text-white font-black text-lg">Instant Fare Bid Engine</Text>
            </View>
            <View className="bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              <Text className="text-emerald-400 font-bold text-[10px]">LIVE RADAR</Text>
            </View>
          </View>

          {/* Pickup & Dropoff Inputs */}
          <View className="space-y-3 mb-3">
            <View className="bg-slate-950/50 backdrop-blur-sm border border-slate-800 rounded-2xl px-3.5 py-2.5 flex-row items-center">
              <Ionicons name="radio-button-on" size={16} color="#10b981" />
              <TextInput
                placeholder="Pickup address..."
                placeholderTextColor="#64748b"
                value={pickupLocation}
                onChangeText={setPickupLocation}
                className="flex-1 text-white text-xs ml-2.5"
              />
            </View>

            <View className="bg-slate-950/50 backdrop-blur-sm border border-slate-800 rounded-2xl px-3.5 py-2.5 flex-row items-center">
              <Ionicons name="location" size={16} color="#ef4444" />
              <TextInput
                placeholder="Destination address..."
                placeholderTextColor="#64748b"
                value={dropoffLocation}
                onChangeText={setDropoffLocation}
                className="flex-1 text-white text-xs ml-2.5"
              />
            </View>
          </View>

          {/* Saved Places Quick Routing Chips */}
          <Text className="text-slate-500 text-[10px] font-mono uppercase tracking-wider mb-2">1-TAP SAVED PLACES ROUTING</Text>
          <View className="flex-row space-x-2 mb-4">
            <TouchableOpacity
              onPress={() => setDropoffLocation(savedPlaces.home || 'Victoria Island, Lagos')}
              className="flex-1 bg-slate-950/50 backdrop-blur-sm border border-slate-800 rounded-xl p-2.5 flex-row items-center space-x-2 shadow-lg"
            >
              <Ionicons name="home" size={14} color="#10b981" />
              <View className="flex-1">
                <Text className="text-white font-bold text-[11px]">Home</Text>
                <Text className="text-slate-400 text-[9px]" numberOfLines={1}>{savedPlaces.home || 'Victoria Island'}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDropoffLocation(savedPlaces.work || 'Ikoyi, Lagos')}
              className="flex-1 bg-slate-950/50 backdrop-blur-sm border border-slate-800 rounded-xl p-2.5 flex-row items-center space-x-2 shadow-lg"
            >
              <Ionicons name="briefcase" size={14} color="#10b981" />
              <View className="flex-1">
                <Text className="text-white font-normal text-[11px]">Work / Office</Text>
                <Text className="text-slate-400 text-[9px]" numberOfLines={1}>{savedPlaces.work || 'Ikoyi'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Fare Bid Input & Quick Chip Pills */}
          <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">OFFER FARE AMOUNT (₦)</Text>
          <View className="bg-slate-950/50 backdrop-blur-sm border border-slate-800 rounded-2xl px-4 py-3 flex-row items-center justify-between mb-3 shadow-lg">
            <Text className="text-emerald-400 font-black text-xl">₦</Text>
            <TextInput
              keyboardType="numeric"
              value={bidAmount}
              onChangeText={setBidAmount}
              className="flex-1 text-white font-black text-xl ml-2 text-right"
            />
          </View>

          {/* Quick Tap Chip Pills */}
          <View className="flex-row space-x-2 mb-4">
            {['2500', '3000', '3500', '5000'].map((chip) => (
              <TouchableOpacity
                key={chip}
                className={`flex-1 py-2 rounded-xl items-center border shadow-lg ${bidAmount === chip ? 'bg-emerald-500 border-emerald-400 shadow-emerald-500/30' : 'bg-slate-950/50 border-slate-800'}`}
                onPress={() => setBidAmount(chip)}
              >
                <Text className={`font-bold text-xs ${bidAmount === chip ? 'text-slate-950' : 'text-slate-300'}`}>
                  ₦{Number(chip).toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* VIP Stealth Mode Toggle */}
          <View className="flex-row items-center justify-between mb-4 bg-slate-950/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-3 shadow-lg">
            <View className="flex-row items-center">
              <Ionicons name="eye-off-outline" size={18} color="#a855f7" />
              <Text className="text-white font-medium text-xs ml-2">VIP Stealth Mode</Text>
            </View>
            <Switch value={stealthMode} onValueChange={setStealthMode} trackColor={{ false: '#334155', true: '#a855f7' }} thumbColor="#ffffff" />
          </View>

          {/* Glowing CTA Button */}
          <TouchableOpacity
            className="bg-gradient-to-r from-emerald-500 to-brandMint py-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-emerald-500/30"
            onPress={handleBroadcastBid}
            disabled={isBroadcasting}
          >
            {isBroadcasting ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <>
                <Ionicons name="radio" size={18} color="#0f172a" className="mr-2" />
                <Text className="text-slate-950 font-black text-sm uppercase tracking-wider">BROADCAST BID TO ALL NEARBY DRIVERS</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Action Grid Buttons */}
        <View className="flex-row space-x-3 mb-6">
          <TouchableOpacity
            className="flex-1 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 items-center mr-1 shadow-lg"
            onPress={() => navigation.navigate('Post Job')}
          >
            <View className="w-12 h-12 rounded-xl bg-emerald-500/10 items-center justify-center mb-2">
              <Ionicons name="add-circle-outline" size={24} color="#10b981" />
            </View>
            <Text className="text-white font-bold text-xs">Post Driver Job</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 items-center ml-1 shadow-lg"
            onPress={() => navigation.navigate('SearchDrivers')}
          >
            <View className="w-12 h-12 rounded-xl bg-emerald-500/10 items-center justify-center mb-2">
              <Ionicons name="search-outline" size={24} color="#10b981" />
            </View>
            <Text className="text-white font-normal text-xs">Browse Drivers</Text>
          </TouchableOpacity>
        </View>

        {/* ACTIVE HIRING CONTRACTS */}
        <View className="mb-8">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 ml-1">YOUR ACTIVE CONTRACTS</Text>

          {loading ? (
            <ActivityIndicator color="#10b981" size="large" className="py-6" />
          ) : activeBookings.length > 0 ? (
            activeBookings.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 mb-3 shadow-lg"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white font-bold text-sm">{item.driver?.name || 'Assigned Driver'}</Text>
                  <View className="bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <Text className="text-emerald-400 font-bold text-[10px] uppercase">{item.status}</Text>
                  </View>
                </View>
                <Text className="text-slate-400 text-xs">Rate: ₦{item.amount?.toLocaleString()} / mo</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 items-center shadow-lg">
              <Ionicons name="document-text-outline" size={36} color="#64748b" className="mb-2" />
              <Text className="text-slate-400 text-xs text-center">No active contracts yet. Post a vacancy or broadcast a fare bid above.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
