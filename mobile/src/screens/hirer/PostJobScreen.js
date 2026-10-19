import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { jobService } from '../../api/api';
import { useTheme } from '../../context/ThemeContext';

const VACANCY_TYPES = [
  { id: 'full_time', label: 'Full-Time Driver', icon: 'person-outline', desc: 'Monthly Salary' },
  { id: 'daily_hire', label: 'Daily Chauffeur', icon: 'time-outline', desc: 'Per-Day Rate' },
  { id: 'haulage_trip', label: 'Haulage / Trip', icon: 'trail-sign-outline', desc: 'One-Off Trip' },
];

const VEHICLE_TYPES = [
  { id: 'sedan', label: 'Saloon / Sedan', icon: 'car-outline' },
  { id: 'suv', label: 'SUV / 4x4', icon: 'car-sport-outline' },
  { id: 'vip_luxury', label: 'VIP Executive', icon: 'diamond-outline' },
  { id: 'van', label: 'Delivery Van', icon: 'cube-outline' },
  { id: 'mini_bus', label: 'Mini Bus (14-Seater)', icon: 'bus-outline' },
  { id: 'coastal_bus', label: 'Coaster Bus (32-Seater)', icon: 'bus-outline' },
  { id: 'light_truck', label: 'Light Truck / Dyna', icon: 'construct-outline' },
  { id: 'heavy_duty', label: 'Heavy Duty / Flatbed', icon: 'trail-sign-outline' },
  { id: 'tanker', label: 'Tanker (Fuel/Water)', icon: 'water-outline' },
  { id: 'refrigerated', label: 'Cold Chain / Fridge', icon: 'snow-outline' },
  { id: 'tipper', label: 'Tipper / Dump Truck', icon: 'hardware-chip-outline' },
  { id: 'dispatch_bike', label: 'Dispatch Bike', icon: 'bicycle-outline' },
  { id: 'tricycle', label: 'Tricycle (Keke)', icon: 'speedometer-outline' },
];

export default function PostJobScreen({ navigation, route }) {
  const { isDark } = useTheme();
  const prefillDriver = route?.params?.prefillDriver;

  const [loading, setLoading] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);
  const [vacancyType, setVacancyType] = useState('full_time');

  const [formData, setFormData] = useState({
    title: prefillDriver ? `Direct Vacancy for ${prefillDriver.name}` : '',
    description: '',
    vehicle_type: prefillDriver?.vehicle_type || 'sedan',
    pickup_location: prefillDriver?.lga ? `${prefillDriver.lga}, ${prefillDriver.state}` : '',
    pickup_latitude: 0,
    pickup_longitude: 0,
    dropoff_location: '',
    dropoff_latitude: 0,
    dropoff_longitude: 0,
    pickup_time: '',
    estimated_delivery_time: '',
    distance_km: '',
    amount: '',
    search_radius_km: '50',
  });

  const handleAutoDetectPickup = async () => {
    try {
      setFetchingGps(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant location permissions to detect your current position.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (loc && loc.coords) {
        const reverse = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (reverse && reverse.length > 0) {
          const item = reverse[0];
          const parts = [item.name, item.street, item.district || item.subregion, item.city].filter(Boolean);
          const formatted = parts.join(', ') || `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
          setFormData(prev => ({
            ...prev,
            pickup_location: formatted,
            pickup_latitude: loc.coords.latitude,
            pickup_longitude: loc.coords.longitude,
          }));
        }
      }
    } catch (err) {
      console.log('GPS error:', err);
      Alert.alert('Notice', 'Could not detect GPS location. You can type the location manually.');
    } finally {
      setFetchingGps(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title or driver role for this vacancy.');
      return;
    }
    if (!formData.pickup_location.trim()) {
      Alert.alert('Missing Location', 'Please provide a reporting or pickup location.');
      return;
    }
    if (!formData.amount.trim()) {
      Alert.alert('Missing Budget', 'Please enter your proposed budget or salary offer.');
      return;
    }

    try {
      setLoading(true);

      let pLat = formData.pickup_latitude || 0;
      let pLng = formData.pickup_longitude || 0;
      let dLat = formData.dropoff_latitude || 0;
      let dLng = formData.dropoff_longitude || 0;

      try {
        if (!pLat || !pLng) {
          const pGeocode = await Location.geocodeAsync(formData.pickup_location);
          if (pGeocode && pGeocode.length > 0) {
            pLat = pGeocode[0].latitude;
            pLng = pGeocode[0].longitude;
          }
        }
        if (formData.dropoff_location.trim() && (!dLat || !dLng)) {
          const dGeocode = await Location.geocodeAsync(formData.dropoff_location);
          if (dGeocode && dGeocode.length > 0) {
            dLat = dGeocode[0].latitude;
            dLng = dGeocode[0].longitude;
          }
        }
      } catch (e) {
        console.log('Geocode error', e);
      }

      await jobService.createJob({
        ...formData,
        vacancy_type: vacancyType,
        pickup_latitude: pLat,
        pickup_longitude: pLng,
        dropoff_latitude: dLat,
        dropoff_longitude: dLng,
        amount: parseFloat(formData.amount.replace(/[^0-9.]/g, '')) || 0,
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null,
        search_radius_km: parseInt(formData.search_radius_km) || 50,
        publish_now: true,
        prefill_driver_id: prefillDriver?.id || null,
      });

      Alert.alert(
        'Vacancy Broadcasted!',
        prefillDriver
          ? `Your direct vacancy offer has been submitted to ${prefillDriver.name}.`
          : 'Your vacancy has been broadcasted to verified, security-cleared drivers.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.log('Post vacancy error:', error);
      Alert.alert('Notice', error.message || 'Failed to broadcast vacancy. Please verify connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090d16' : '#f8fafc' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Top Header */}
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="px-4 py-3.5 border-b flex-row items-center justify-between"
        >
          <View className="flex-1">
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-base font-normal">
              Post Driver Vacancy
            </Text>
          </View>

          <View className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <Text className="text-[11px] font-normal text-emerald-700 dark:text-brandMint">
              Live Broadcast
            </Text>
          </View>
        </View>

        <ScrollView 
          className="flex-1 px-4 py-4" 
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Direct Offer Banner if prefilled driver exists */}
          {prefillDriver ? (
            <View
              style={{
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5',
                borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#a7f3d0',
              }}
              className="mb-4 p-3.5 rounded-2xl border flex-row items-center"
            >
              <View className="w-10 h-10 rounded-full bg-emerald-500 items-center justify-center mr-3">
                <Ionicons name="person" size={18} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#065f46' }} className="text-xs font-normal">
                  Direct Offer for {prefillDriver.name}
                </Text>
                <Text style={{ color: isDark ? '#a7f3d0' : '#047857' }} className="text-[11px] font-normal">
                  {prefillDriver.vehicle_label || 'Verified Driver'} • NIN & Police Cleared
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#ecfdf5',
                borderColor: isDark ? '#1e293b' : '#a7f3d0',
              }}
              className="mb-4 p-3.5 rounded-2xl border flex-row items-center shadow-xs"
            >
              <Ionicons name="shield-checkmark" size={18} color="#10b981" />
              <Text style={{ color: isDark ? '#34d399' : '#065f46' }} className="ml-2.5 flex-1 text-xs font-normal leading-4">
                Post your hiring vacancy. Vetted, background-cleared Nigerian drivers and fleets will receive immediate notifications.
              </Text>
            </View>
          )}

          {/* Vacancy Category Selector */}
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-2xl p-4 mb-4 shadow-sm"
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="briefcase-outline" size={16} color={isDark ? '#94a3b8' : '#475569'} />
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="ml-2 text-xs font-normal uppercase tracking-wider">
                Vacancy Category
              </Text>
            </View>

            <View className="flex-row gap-2">
              {VACANCY_TYPES.map((t) => {
                const isSelected = vacancyType === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setVacancyType(t.id)}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: isSelected
                        ? isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5'
                        : isDark ? '#1a2333' : '#f8fafc',
                      borderColor: isSelected ? '#10b981' : isDark ? '#334155' : '#e2e8f0',
                    }}
                    className="flex-1 p-3 rounded-xl border items-center"
                  >
                    <Ionicons
                      name={t.icon}
                      size={18}
                      color={isSelected ? '#10b981' : isDark ? '#94a3b8' : '#64748b'}
                    />
                    <Text
                      style={{
                        color: isSelected ? '#10b981' : isDark ? '#ffffff' : '#0f172a',
                      }}
                      className="text-xs font-normal mt-1 text-center"
                    >
                      {t.label}
                    </Text>
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal mt-0.5">
                      {t.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Card 1: Job Details */}
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-2xl p-4 mb-4 shadow-sm"
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="document-text-outline" size={16} color={isDark ? '#94a3b8' : '#475569'} />
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="ml-2 text-xs font-normal uppercase tracking-wider">
                Role & Requirements
              </Text>
            </View>

            <View className="mb-3.5">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal mb-1.5">
                Vacancy Title *
              </Text>
              <TextInput
                style={{
                  backgroundColor: isDark ? '#1a2333' : '#f8fafc',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
                className="border rounded-xl px-3.5 py-2.5 text-xs font-normal"
                placeholder="e.g. Executive Chauffeur for Family or 10T Haulage Driver"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            <View>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal mb-1.5">
                Description & Special Instructions
              </Text>
              <TextInput
                style={{
                  backgroundColor: isDark ? '#1a2333' : '#f8fafc',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
                className="border rounded-xl px-3.5 py-2.5 text-xs font-normal"
                placeholder="Specify working hours, live-in/live-out, defensive driving requirements, vehicle type provided..."
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Card 2: Vehicle Type */}
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-2xl p-4 mb-4 shadow-sm"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="car-outline" size={16} color={isDark ? '#94a3b8' : '#475569'} />
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="ml-2 text-xs font-normal uppercase tracking-wider">
                  Vehicle Expertise Needed
                </Text>
              </View>
              <Text className="text-[11px] font-normal text-emerald-600 dark:text-brandMint">
                {VEHICLE_TYPES.length} Categories
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {VEHICLE_TYPES.map((v) => {
                const isSelected = formData.vehicle_type === v.id;
                return (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => setFormData({ ...formData, vehicle_type: v.id })}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: isSelected
                        ? isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5'
                        : isDark ? '#1a2333' : '#f8fafc',
                      borderColor: isSelected ? '#10b981' : isDark ? '#334155' : '#e2e8f0',
                    }}
                    className="flex-row items-center px-3 py-2 rounded-xl border"
                  >
                    <Ionicons
                      name={v.icon}
                      size={14}
                      color={isSelected ? '#10b981' : isDark ? '#94a3b8' : '#64748b'}
                    />
                    <Text
                      style={{
                        color: isSelected ? '#10b981' : isDark ? '#cbd5e1' : '#334155',
                      }}
                      className="text-xs font-normal ml-1.5"
                    >
                      {v.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Card 3: Location Route */}
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-2xl p-4 mb-4 shadow-sm"
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="navigate-outline" size={16} color={isDark ? '#94a3b8' : '#475569'} />
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="ml-2 text-xs font-normal uppercase tracking-wider">
                Reporting / Base Location
              </Text>
            </View>

            {/* Pickup / Base Location */}
            <View className="mb-3.5">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal">
                  Base / Reporting Address *
                </Text>
                <TouchableOpacity
                  onPress={handleAutoDetectPickup}
                  className="flex-row items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30"
                  activeOpacity={0.7}
                >
                  {fetchingGps ? (
                    <ActivityIndicator size="small" color="#10b981" />
                  ) : (
                    <>
                      <Ionicons name="locate" size={11} color="#10b981" />
                      <Text className="ml-1 text-[11px] font-normal text-emerald-700 dark:text-brandMint">
                        Auto GPS
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View
                style={{
                  backgroundColor: isDark ? '#1a2333' : '#f8fafc',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                }}
                className="flex-row items-center border rounded-xl px-3"
              >
                <Ionicons name="pin" size={15} color="#10b981" />
                <TextInput
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  className="flex-1 py-2.5 pl-2 text-xs font-normal"
                  placeholder="e.g. Victoria Island, Lagos or Maitama, Abuja"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  value={formData.pickup_location}
                  onChangeText={(text) => setFormData({ ...formData, pickup_location: text })}
                />
                {formData.pickup_location.length > 0 ? (
                  <TouchableOpacity onPress={() => setFormData({ ...formData, pickup_location: '' })}>
                    <Ionicons name="close-circle" size={17} color={isDark ? '#94a3b8' : '#64748b'} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleAutoDetectPickup}>
                    <Ionicons name="location" size={17} color="#10b981" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Dropoff / Destination (Optional for full-time, required for trip) */}
            <View>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal mb-1.5">
                Destination (For Specific Trips / Contracts)
              </Text>
              <View
                style={{
                  backgroundColor: isDark ? '#1a2333' : '#f8fafc',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                }}
                className="flex-row items-center border rounded-xl px-3"
              >
                <Ionicons name="flag" size={15} color="#10b981" />
                <TextInput
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  className="flex-1 py-2.5 pl-2 text-xs font-normal"
                  placeholder="Optional destination or inter-state corridor"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  value={formData.dropoff_location}
                  onChangeText={(text) => setFormData({ ...formData, dropoff_location: text })}
                />
                {formData.dropoff_location.length > 0 && (
                  <TouchableOpacity onPress={() => setFormData({ ...formData, dropoff_location: '' })}>
                    <Ionicons name="close-circle" size={17} color={isDark ? '#94a3b8' : '#64748b'} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Card 4: Budget / Proposed Salary */}
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-2xl p-4 mb-4 shadow-sm"
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="cash-outline" size={16} color={isDark ? '#94a3b8' : '#475569'} />
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="ml-2 text-xs font-normal uppercase tracking-wider">
                Salary / Budget Offer
              </Text>
            </View>

            <View className="flex-row gap-3 mb-3.5">
              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal mb-1.5">
                  Proposed Pay (₦) *
                </Text>
                <View
                  style={{
                    backgroundColor: isDark ? '#1a2333' : '#f8fafc',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                  }}
                  className="flex-row items-center border rounded-xl px-3"
                >
                  <Text className="text-xs font-normal text-amber-500 mr-1.5">₦</Text>
                  <TextInput
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    className="flex-1 py-2.5 text-xs font-normal"
                    placeholder={vacancyType === 'full_time' ? 'e.g. 120,000 / mo' : 'e.g. 15,000 / day'}
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    value={formData.amount}
                    onChangeText={(text) => setFormData({ ...formData, amount: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal mb-1.5">
                  Broadcast Radius
                </Text>
                <View className="flex-row items-center gap-1.5">
                  {['25', '50', '100'].map((radius) => {
                    const isSelected = formData.search_radius_km === radius;
                    return (
                      <TouchableOpacity
                        key={radius}
                        onPress={() => setFormData({ ...formData, search_radius_km: radius })}
                        style={{
                          backgroundColor: isSelected
                            ? isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5'
                            : isDark ? '#1a2333' : '#f8fafc',
                          borderColor: isSelected ? '#10b981' : isDark ? '#334155' : '#e2e8f0',
                        }}
                        className="flex-1 py-2 rounded-xl border items-center"
                      >
                        <Text
                          style={{
                            color: isSelected ? '#10b981' : isDark ? '#94a3b8' : '#64748b',
                          }}
                          className="text-[11px] font-normal"
                        >
                          {radius}km
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Quick Timing Chips */}
            <View>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal mb-1.5">
                Resumption / Start Timeline
              </Text>
              <View className="flex-row gap-2">
                {['Immediate Resumption', 'Next Monday', 'Flexible / Negotiable'].map((chip) => {
                  const isSelected = formData.pickup_time === chip;
                  return (
                    <TouchableOpacity
                      key={chip}
                      onPress={() => setFormData({ ...formData, pickup_time: chip })}
                      style={{
                        backgroundColor: isSelected
                          ? isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5'
                          : isDark ? '#1a2333' : '#f8fafc',
                        borderColor: isSelected ? '#10b981' : isDark ? '#334155' : '#e2e8f0',
                      }}
                      className="px-2.5 py-1.5 rounded-lg border"
                    >
                      <Text
                        style={{
                          color: isSelected ? '#10b981' : isDark ? '#94a3b8' : '#64748b',
                        }}
                        className="text-[10px] font-normal"
                      >
                        {chip}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={{
              backgroundColor: loading ? '#34d399' : '#10b981',
            }}
            className="py-3.5 rounded-2xl items-center mb-8 flex-row justify-center shadow-lg shadow-emerald-500/20 active:bg-emerald-600"
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="paper-plane-outline" size={17} color="#ffffff" />
                <Text className="ml-2 text-white text-xs font-normal uppercase tracking-wider">
                  {prefillDriver ? `Send Direct Offer to ${prefillDriver.name}` : 'Broadcast Vacancy Now'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
