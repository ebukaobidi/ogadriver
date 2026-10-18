import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import api from '../../api/api';

const Storage = {
  getItemAsync: async (key) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  },
};

export default function EmergencySosScreen({ navigation }) {
  const [dispatching, setDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [nextOfKinPhone, setNextOfKinPhone] = useState(null);
  const [nextOfKinName, setNextOfKinName] = useState(null);

  useEffect(() => {
    const loadKin = async () => {
      try {
        const phone = await Storage.getItemAsync('sos_next_of_kin_phone');
        const name = await Storage.getItemAsync('sos_next_of_kin_name');
        if (phone) setNextOfKinPhone(phone);
        if (name) setNextOfKinName(name);
      } catch (e) {}
    };
    loadKin();
  }, []);

  const handleConfirmSos = async () => {
    setDispatching(true);
    try {
      let location = await Location.getCurrentPositionAsync({});
      const res = await api.post('/drivers/sos/trigger', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: 'Emergency Alert Sent',
        next_of_kin_phone: nextOfKinPhone || null,
      });

      if (res.data?.success) {
        setDispatched(true);
      } else {
        Alert.alert('Dispatch Error', res.data?.message || 'Emergency dispatch failed.');
      }
    } catch (e) {
      Alert.alert('SOS Error', e.response?.data?.message || 'SOS Beacon dispatch failed.');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950 justify-between p-6">
      <View>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6 flex-row items-center">
          <Ionicons name="close-circle" size={28} color="#ef4444" />
          <Text className="text-red-400 font-bold ml-2">Close Safety Screen</Text>
        </TouchableOpacity>

        <View className="items-center my-6">
          <View className="w-24 h-24 rounded-full bg-red-500/20 border-4 border-red-500 items-center justify-center mb-5">
            <Ionicons name="warning" size={48} color="#ef4444" />
          </View>
          <Text className="text-white text-3xl font-normal uppercase text-center tracking-tight">EMERGENCY SOS</Text>
          <Text className="text-slate-400 text-xs text-center mt-2 px-4 leading-relaxed font-mono">
            Pressing confirm dispatches your live encrypted GPS tracking beacon and rapid armed relay to OgaDriver Safety Desk and registered Next of Kin.
          </Text>
        </View>

        {/* Next of Kin Live Relay Badge */}
        <View className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-5">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={16} color="#ef4444" style={{ marginRight: 6 }} />
              <Text className="text-slate-300 font-bold text-xs uppercase">SOS Emergency Next of Kin</Text>
            </View>
            <View className="bg-red-500/20 px-2 py-0.5 rounded">
              <Text className="text-red-400 font-bold text-[9px]">Priority 1</Text>
            </View>
          </View>
          {nextOfKinPhone ? (
            <Text className="text-white font-mono font-bold text-sm mt-1">
              {nextOfKinName ? `${nextOfKinName}: ` : ''}{nextOfKinPhone}
            </Text>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('KycVerification')} className="mt-1 flex-row items-center justify-between">
              <Text className="text-amber-400 text-xs">No Next of Kin registered yet</Text>
              <Text className="text-emerald-400 font-bold text-xs underline">Add in KYC</Text>
            </TouchableOpacity>
          )}
        </View>

        {dispatched && (
          <View className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-2xl items-center mb-6">
            <Ionicons name="checkmark-circle" size={36} color="#1cd188" />
            <Text className="text-emerald-400 font-black text-lg mt-2">BEACON ACTIVE & LIVE</Text>
            <Text className="text-slate-300 text-xs text-center mt-1">
              {nextOfKinPhone ? `Alert dispatched to ${nextOfKinPhone} and ` : ''}OgaDriver Rapid Security Response Desk has been notified.
            </Text>
          </View>
        )}
      </View>

      {!dispatched ? (
        <TouchableOpacity
          onPress={handleConfirmSos}
          disabled={dispatching}
          className="bg-red-600 py-5 rounded-2xl items-center shadow-2xl active:scale-95 border border-red-400"
        >
          {dispatching ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-black uppercase tracking-widest text-base">CONFIRM EMERGENCY SOS BEACON</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-slate-900 border border-slate-800 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-xs uppercase">Return to Home Screen</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
