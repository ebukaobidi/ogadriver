import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

const Storage = {
  getItemAsync: async (key) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  },
};

export default function MapLocationPickerModal({ visible, onClose, placeType = 'home', initialAddress = '', onSave }) {
  const insets = useSafeAreaInsets();
  const [address, setAddress] = useState(initialAddress);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState(null);

  useEffect(() => {
    setAddress(initialAddress);
  }, [initialAddress, visible]);

  useEffect(() => {
    if (visible) {
      Storage.getItemAsync('saved_places').then((str) => {
        if (str) {
          try {
            setSavedPlaces(JSON.parse(str));
          } catch (e) {}
        }
      });
    }
  }, [visible]);

  let placeTitle = 'Saved Place';
  let iconName = 'location';

  if (placeType === 'home') {
    placeTitle = 'My Home';
    iconName = 'home';
  } else if (placeType === 'work') {
    placeTitle = 'Work / Office';
    iconName = 'briefcase';
  } else if (placeType === 'airport') {
    placeTitle = 'Airport Terminal';
    iconName = 'airplane';
  } else if (placeType === 'pickup') {
    placeTitle = 'Starting Point (Pickup)';
    iconName = 'navigate';
  } else if (placeType === 'dropoff') {
    placeTitle = 'Destination (Dropoff)';
    iconName = 'pin';
  }

  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to detect current position.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = loc.coords.latitude;
      const lon = loc.coords.longitude;
      setCoords({ latitude: lat, longitude: lon });

      const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });

      if (geocode && geocode.length > 0) {
        const item = geocode[0];
        const parts = [
          item.street || item.name,
          item.district || item.subregion,
          item.city || item.region
        ].filter(Boolean);
        const formatted = parts.join(', ');
        setAddress(formatted || `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      } else {
        setAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      }
    } catch (err) {
      Alert.alert('Location Error', 'Could not fetch current GPS coordinates.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSavedPlace = (placeAddress) => {
    if (!placeAddress || placeAddress === 'Not set') return;
    setAddress(placeAddress);
  };

  const handleConfirmSave = () => {
    if (!address.trim()) {
      Alert.alert('Address Required', 'Please enter an address or pick from current location.');
      return;
    }
    onSave({ type: placeType, address: address.trim(), coords });
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
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center space-x-2.5">
              <View className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center">
                <Ionicons name={iconName} size={20} color="#10b981" />
              </View>
              <View>
                <Text className="text-white font-bold text-base">{placeTitle}</Text>
                <Text className="text-slate-400 text-xs">Pick address directly from map or GPS</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} className="p-2 rounded-full bg-slate-800">
              <Ionicons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Quick Saved Place Chips (If available) */}
          {savedPlaces && (savedPlaces.home || savedPlaces.work || savedPlaces.airport) && (
            <View className="mb-3">
              <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1.5">Pick from Saved Places:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-2">
                {savedPlaces.home && savedPlaces.home !== 'Not set' && (
                  <TouchableOpacity
                    onPress={() => handleSelectSavedPlace(savedPlaces.home)}
                    className="flex-row items-center bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl mr-2"
                  >
                    <Ionicons name="home-outline" size={13} color="#10b981" style={{ marginRight: 4 }} />
                    <Text className="text-slate-200 text-xs font-semibold">Home</Text>
                  </TouchableOpacity>
                )}
                {savedPlaces.work && savedPlaces.work !== 'Not set' && (
                  <TouchableOpacity
                    onPress={() => handleSelectSavedPlace(savedPlaces.work)}
                    className="flex-row items-center bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl mr-2"
                  >
                    <Ionicons name="briefcase-outline" size={13} color="#10b981" style={{ marginRight: 4 }} />
                    <Text className="text-slate-200 text-xs font-semibold">Work</Text>
                  </TouchableOpacity>
                )}
                {savedPlaces.airport && savedPlaces.airport !== 'Not set' && (
                  <TouchableOpacity
                    onPress={() => handleSelectSavedPlace(savedPlaces.airport)}
                    className="flex-row items-center bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl mr-2"
                  >
                    <Ionicons name="airplane-outline" size={13} color="#10b981" style={{ marginRight: 4 }} />
                    <Text className="text-slate-200 text-xs font-semibold">Airport</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          )}

          {/* Address Input */}
          <View className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 mb-3">
            <Text className="text-slate-500 text-[10px] font-mono uppercase tracking-wider mb-1">SELECTED ADDRESS</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. 14 Adeola Odeku St, Victoria Island, Lagos"
              placeholderTextColor="#475569"
              className="text-white font-bold text-sm"
              multiline
            />
          </View>

          {/* GPS Detector Button */}
          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            disabled={loading}
            className="flex-row items-center justify-center bg-slate-800/90 border border-slate-700 py-3 rounded-xl mb-5 active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="#10b981" />
            ) : (
              <>
                <Ionicons name="locate" size={16} color="#10b981" style={{ marginRight: 6 }} />
                <Text className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  Detect Live GPS Location
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Actions */}
          <View className="flex-row space-x-3">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-slate-800 py-3.5 rounded-xl items-center">
              <Text className="text-slate-300 font-bold text-xs uppercase">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleConfirmSave} className="flex-1 bg-emerald-500 active:bg-emerald-600 py-3.5 rounded-xl items-center shadow-lg shadow-emerald-500/25">
              <Text className="text-white font-bold text-xs uppercase tracking-wider">Set Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
