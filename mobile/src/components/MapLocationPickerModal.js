import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function MapLocationPickerModal({ visible, onClose, placeType = 'home', initialAddress = '', onSave }) {
  const insets = useSafeAreaInsets();
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);

  const placeTitle = placeType === 'home' ? 'My Home' : placeType === 'work' ? 'Work / Office' : 'Saved Place';
  const iconName = placeType === 'home' ? 'home' : 'briefcase';

  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to detect current position.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const item = geocode[0];
        const formatted = `${item.name || item.street || ''}, ${item.district || item.subregion || ''}, ${item.city || item.region || ''}`.replace(/^, /, '');
        setAddress(formatted || `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      } else {
        setAddress(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      }
    } catch (err) {
      Alert.alert('Location Error', 'Could not fetch current GPS coordinates.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSave = () => {
    if (!address.trim()) {
      Alert.alert('Address Required', 'Please enter an address or pick from current location.');
      return;
    }
    onSave({ type: placeType, address: address.trim() });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 48) + 16 : Math.max(insets.bottom, 16) + 8,
        }}
        className="flex-1 bg-black/80 justify-end px-3"
      >
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-5">
            <View className="flex-row items-center space-x-2.5">
              <View className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 items-center justify-center">
                <Ionicons name={iconName} size={20} color="#1cd188" />
              </View>
              <View>
                <Text className="text-white font-bold text-base">Edit {placeTitle}</Text>
                <Text className="text-slate-400 text-xs">Set address for 1-tap quick routing</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} className="p-2 rounded-full bg-slate-800">
              <Ionicons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Address Input */}
          <View className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-4">
            <Text className="text-slate-500 text-[10px] font-mono uppercase tracking-wider mb-1.5">LOCATION ADDRESS</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. Victoria Island, Lagos"
              placeholderTextColor="#475569"
              className="text-white font-bold text-sm"
              multiline
            />
          </View>

          {/* GPS Detector Button */}
          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            disabled={loading}
            className="flex-row items-center justify-center bg-slate-800 border border-slate-700 py-3 rounded-xl mb-6 active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="#1cd188" />
            ) : (
              <>
                <Ionicons name="locate" size={16} color="#1cd188" className="mr-2" />
                <Text className="text-emerald-400 font-bold text-xs ml-2 uppercase tracking-wider">Use Current GPS Location</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Actions */}
          <View className="flex-row space-x-3">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-slate-800 py-3.5 rounded-xl items-center">
              <Text className="text-slate-300 font-bold text-xs uppercase">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleConfirmSave} className="flex-1 bg-emerald-500 py-3.5 rounded-xl items-center">
              <Text className="text-slate-950 font-black text-xs uppercase tracking-wider">Save Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
