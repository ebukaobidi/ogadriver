import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Platform,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/api';
import MapLocationPickerModal from '../../components/MapLocationPickerModal';

const Storage = {
  getItemAsync: async (key) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  },
  setItemAsync: async (key, val) => {
    if (Platform.OS === 'web') return localStorage.setItem(key, val);
    return await SecureStore.setItemAsync(key, val);
  },
};

export default function SavedPlacesScreen({ navigation }) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [homeAddress, setHomeAddress] = useState('Victoria Island, Lagos');
  const [workAddress, setWorkAddress] = useState('Ikoyi Commercial Hub, Lagos');
  const [airportAddress, setAirportAddress] = useState('Murtala Muhammed Int’l Airport (MM2)');
  const [customPlaces, setCustomPlaces] = useState([]);

  // Modals
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');
  const [detectingGps, setDetectingGps] = useState(false);

  // Map Picker Modal
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingType, setEditingType] = useState('home');
  useEffect(() => {
    const onBack = () => {
      if (pickerVisible) {
        setPickerVisible(false);
        return true;
      }
      if (addModalVisible) {
        setAddModalVisible(false);
        return true;
      }
      if (navigation?.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [pickerVisible, addModalVisible, navigation]);


  useEffect(() => {
    loadSavedPlaces();
  }, []);

  const loadSavedPlaces = async () => {
    try {
      setLoading(true);
      const str = await Storage.getItemAsync('saved_places');
      if (str) {
        const parsed = JSON.parse(str);
        if (parsed.home) setHomeAddress(parsed.home);
        if (parsed.work) setWorkAddress(parsed.work);
        if (parsed.airport) setAirportAddress(parsed.airport);
        if (parsed.custom && Array.isArray(parsed.custom)) setCustomPlaces(parsed.custom);
      }
    } catch (e) {
      console.log('Error loading saved places:', e);
    } finally {
      setLoading(false);
    }
  };

  const persistPlaces = async (updated) => {
    try {
      await Storage.setItemAsync('saved_places', JSON.stringify(updated));
      await api.post('/v1/user/saved-places', updated).catch(() => {});
    } catch (e) {
      console.log('Error persisting places:', e);
    }
  };

  const handleOpenEdit = (type) => {
    setEditingType(type);
    setPickerVisible(true);
  };

  const handleSaveMapPickerPlace = async ({ type, address }) => {
    let updatedHome = homeAddress;
    let updatedWork = workAddress;
    let updatedAirport = airportAddress;

    if (type === 'home') {
      setHomeAddress(address);
      updatedHome = address;
    } else if (type === 'work') {
      setWorkAddress(address);
      updatedWork = address;
    } else if (type === 'airport') {
      setAirportAddress(address);
      updatedAirport = address;
    }

    const payload = {
      home: updatedHome,
      work: updatedWork,
      airport: updatedAirport,
      custom: customPlaces,
    };
    await persistPlaces(payload);
    Alert.alert('Saved Place Updated', `${type.toUpperCase()} location saved.`);
  };

  const handleClearDefaultPlace = (type) => {
    Alert.alert(
      'Clear Location',
      `Clear your saved ${type === 'home' ? 'Home' : type === 'work' ? 'Work' : 'Airport'} address?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            let updatedHome = homeAddress;
            let updatedWork = workAddress;
            let updatedAirport = airportAddress;
            if (type === 'home') {
              setHomeAddress('Not set');
              updatedHome = 'Not set';
            }
            if (type === 'work') {
              setWorkAddress('Not set');
              updatedWork = 'Not set';
            }
            if (type === 'airport') {
              setAirportAddress('Not set');
              updatedAirport = 'Not set';
            }
            await persistPlaces({
              home: updatedHome,
              work: updatedWork,
              airport: updatedAirport,
              custom: customPlaces,
            });
          },
        },
      ]
    );
  };

  const handleDetectGpsForNewPlace = async () => {
    try {
      setDetectingGps(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant location permission to detect your address.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (loc?.coords) {
        const geo = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geo && geo.length > 0) {
          const item = geo[0];
          const parts = [item.street || item.name, item.district || item.subregion, item.city || item.region].filter(Boolean);
          setNewPlaceAddress(parts.join(', ') || `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
        } else {
          setNewPlaceAddress(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
        }
      }
    } catch (err) {
      Alert.alert('GPS Error', 'Could not detect current position.');
    } finally {
      setDetectingGps(false);
    }
  };

  const handleAddCustomPlace = async () => {
    if (!newPlaceName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this place (e.g., Gym, Church, Beach House).');
      return;
    }
    if (!newPlaceAddress.trim()) {
      Alert.alert('Address Required', 'Please enter a street address or location description.');
      return;
    }

    const newPlace = {
      id: Date.now().toString(),
      name: newPlaceName.trim(),
      address: newPlaceAddress.trim(),
    };

    const updated = [...customPlaces, newPlace];
    setCustomPlaces(updated);
    setAddModalVisible(false);
    setNewPlaceName('');
    setNewPlaceAddress('');

    await persistPlaces({
      home: homeAddress,
      work: workAddress,
      airport: airportAddress,
      custom: updated,
    });
    Alert.alert('Place Saved', `"${newPlace.name}" added to your saved places.`);
  };

  const handleDeleteCustomPlace = (id, name) => {
    Alert.alert('Delete Place', `Remove "${name}" from your saved places?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = customPlaces.filter((p) => p.id !== id);
          setCustomPlaces(updated);
          await persistPlaces({
            home: homeAddress,
            work: workAddress,
            airport: airportAddress,
            custom: updated,
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090d16' : '#ffffff' }}>
      {/* Header Bar */}
      <View
        style={{
          backgroundColor: isDark ? '#090d16' : '#ffffff',
          borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
        className="flex-row items-center justify-between px-4 py-3 border-b"
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: isDark ? '#121927' : '#f1f5f9',
              borderColor: isDark ? '#1e293b' : '#cbd5e1',
            }}
            className="p-2 rounded-xl border mr-3"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? '#ffffff' : '#0f172a'} />
          </TouchableOpacity>
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-lg tracking-tight">
            Saved Places
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setAddModalVisible(true)}
          className="flex-row items-center bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl active:opacity-75"
        >
          <Ionicons name="add" size={16} color="#10b981" style={{ marginRight: 2 }} />
          <Text className="text-emerald-500 font-bold text-xs">Add Place</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle banner */}
        <View className="px-5 pt-4 pb-2">
          <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs leading-5">
            Save your favorite frequent destinations for 1-tap route planning during rides and chauffeur hires.
          </Text>
        </View>

        {/* PRIMARY CORE PLACES (HOME, WORK, AIRPORT) */}
        <View className="mt-3">
          {/* Home */}
          <View className="px-5 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-3">
              <View
                style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5' }}
                className="w-10 h-10 rounded-2xl items-center justify-center mr-3 border border-emerald-500/20"
              >
                <Ionicons name="home" size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-sm">
                  Home
                </Text>
                <Text
                  style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  className="text-xs mt-0.5"
                  numberOfLines={1}
                >
                  {homeAddress}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center space-x-1.5">
              <TouchableOpacity
                onPress={() => handleOpenEdit('home')}
                style={{ backgroundColor: isDark ? '#121927' : '#f1f5f9' }}
                className="p-2 rounded-xl border border-slate-700/20"
              >
                <Ionicons name="create-outline" size={16} color="#10b981" />
              </TouchableOpacity>
              {homeAddress !== 'Not set' && (
                <TouchableOpacity
                  onPress={() => handleClearDefaultPlace('home')}
                  style={{ backgroundColor: isDark ? '#121927' : '#fef2f2' }}
                  className="p-2 rounded-xl border border-red-500/20"
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Inset Divider Line ("two line style that does not reach both ends") */}
          <View className="mx-5 h-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Work / Office */}
          <View className="px-5 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-3">
              <View
                style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5' }}
                className="w-10 h-10 rounded-2xl items-center justify-center mr-3 border border-emerald-500/20"
              >
                <Ionicons name="briefcase" size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-sm">
                  Work / Office
                </Text>
                <Text
                  style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  className="text-xs mt-0.5"
                  numberOfLines={1}
                >
                  {workAddress}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center space-x-1.5">
              <TouchableOpacity
                onPress={() => handleOpenEdit('work')}
                style={{ backgroundColor: isDark ? '#121927' : '#f1f5f9' }}
                className="p-2 rounded-xl border border-slate-700/20"
              >
                <Ionicons name="create-outline" size={16} color="#10b981" />
              </TouchableOpacity>
              {workAddress !== 'Not set' && (
                <TouchableOpacity
                  onPress={() => handleClearDefaultPlace('work')}
                  style={{ backgroundColor: isDark ? '#121927' : '#fef2f2' }}
                  className="p-2 rounded-xl border border-red-500/20"
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Inset Divider Line */}
          <View className="mx-5 h-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Airport Terminal */}
          <View className="px-5 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-3">
              <View
                style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5' }}
                className="w-10 h-10 rounded-2xl items-center justify-center mr-3 border border-emerald-500/20"
              >
                <Ionicons name="airplane" size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-sm">
                  Airport Terminal
                </Text>
                <Text
                  style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  className="text-xs mt-0.5"
                  numberOfLines={1}
                >
                  {airportAddress}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center space-x-1.5">
              <TouchableOpacity
                onPress={() => handleOpenEdit('airport')}
                style={{ backgroundColor: isDark ? '#121927' : '#f1f5f9' }}
                className="p-2 rounded-xl border border-slate-700/20"
              >
                <Ionicons name="create-outline" size={16} color="#10b981" />
              </TouchableOpacity>
              {airportAddress !== 'Not set' && (
                <TouchableOpacity
                  onPress={() => handleClearDefaultPlace('airport')}
                  style={{ backgroundColor: isDark ? '#121927' : '#fef2f2' }}
                  className="p-2 rounded-xl border border-red-500/20"
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* CUSTOM PLACES SECTION */}
        <View className="mt-6">
          <View className="px-5 mb-2">
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px] font-bold uppercase tracking-wider">
              Custom Saved Spots
            </Text>
          </View>

          {customPlaces.length === 0 ? (
            <View className="px-5 py-6 items-center">
              <View
                style={{ backgroundColor: isDark ? '#121927' : '#f8fafc' }}
                className="w-14 h-14 rounded-full items-center justify-center mb-2 border border-slate-700/20"
              >
                <Ionicons name="location-outline" size={26} color="#94a3b8" />
              </View>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-sm">
                No custom spots added yet
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs text-center mt-1 max-w-xs">
                Add places like your Gym, Church, Beach Club, or Family Home for swift booking.
              </Text>
              <TouchableOpacity
                onPress={() => setAddModalVisible(true)}
                className="mt-4 bg-emerald-500 py-2.5 px-5 rounded-xl shadow-sm active:opacity-80"
              >
                <Text className="text-white font-bold text-xs uppercase tracking-wider">
                  + Add New Spot
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            customPlaces.map((p, index) => (
              <React.Fragment key={p.id}>
                {index > 0 && <View className="mx-5 h-[1px] bg-slate-200 dark:bg-slate-800" />}
                <View className="px-5 py-3 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      style={{ backgroundColor: isDark ? '#121927' : '#f1f5f9' }}
                      className="w-10 h-10 rounded-2xl items-center justify-center mr-3 border border-slate-700/20"
                    >
                      <Ionicons name="location" size={20} color="#10b981" />
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-sm">
                        {p.name}
                      </Text>
                      <Text
                        style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                        className="text-xs mt-0.5"
                        numberOfLines={1}
                      >
                        {p.address}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDeleteCustomPlace(p.id, p.name)}
                    style={{ backgroundColor: isDark ? '#121927' : '#fef2f2' }}
                    className="p-2 rounded-xl border border-red-500/20"
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ))
          )}
        </View>
      </ScrollView>

      {/* MODAL: ADD CUSTOM PLACE */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <View
          style={{
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 48) + 16 : Math.max(insets.bottom, 16) + 8,
          }}
          className="flex-1 bg-black/70 justify-end px-3"
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
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-emerald-500/15 items-center justify-center mr-3 border border-emerald-500/30">
                  <Ionicons name="location" size={22} color="#10b981" />
                </View>
                <View>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-lg font-semibold tracking-tight">
                    Add New Saved Place
                  </Text>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs">
                    Quick 1-tap route selection
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} className="p-1">
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="space-y-3.5 mb-5">
              {/* Place Name */}
              <View
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="border rounded-2xl px-3.5 py-2.5"
              >
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] uppercase font-bold mb-0.5">
                  Place Name / Label *
                </Text>
                <TextInput
                  value={newPlaceName}
                  onChangeText={setNewPlaceName}
                  placeholder="e.g. Gym, Church, Beach Club, Mom's House"
                  placeholderTextColor="#94a3b8"
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  className="text-xs font-semibold"
                />
              </View>

              {/* Street Address */}
              <View
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="border rounded-2xl px-3.5 py-2.5"
              >
                <View className="flex-row items-center justify-between mb-0.5">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] uppercase font-bold">
                    Street Address / Landmark *
                  </Text>
                  <TouchableOpacity
                    onPress={handleDetectGpsForNewPlace}
                    disabled={detectingGps}
                    className="flex-row items-center bg-emerald-500/15 px-2 py-0.5 rounded"
                  >
                    {detectingGps ? (
                      <ActivityIndicator size="small" color="#10b981" />
                    ) : (
                      <>
                        <Ionicons name="locate" size={10} color="#10b981" style={{ marginRight: 3 }} />
                        <Text className="text-emerald-500 font-bold text-[9px]">Use GPS</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <TextInput
                  value={newPlaceAddress}
                  onChangeText={setNewPlaceAddress}
                  placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={2}
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  className="text-xs font-semibold"
                />
              </View>
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={{
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                }}
                className="flex-1 py-3.5 rounded-xl items-center"
              >
                <Text style={{ color: isDark ? '#cbd5e1' : '#475569' }} className="font-bold text-xs uppercase">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddCustomPlace}
                className="flex-1 py-3.5 rounded-xl bg-emerald-500 active:bg-emerald-600 items-center justify-center shadow-md shadow-emerald-500/20"
              >
                <Text className="text-white font-bold text-xs uppercase tracking-wider">
                  Save Place
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MAP LOCATION PICKER MODAL */}
      <MapLocationPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        placeType={editingType}
        initialAddress={
          editingType === 'home'
            ? homeAddress
            : editingType === 'work'
            ? workAddress
            : airportAddress
        }
        onSave={handleSaveMapPickerPlace}
      />
    </SafeAreaView>
  );
}
