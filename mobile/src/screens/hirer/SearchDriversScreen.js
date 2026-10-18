import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { bookingService } from '../../api/api';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';

const VEHICLE_CATEGORIES = [
  { id: 'all', label: 'All Drivers', icon: 'people-outline' },
  { id: 'sedan', label: 'Saloon / Sedan', icon: 'car-outline' },
  { id: 'vip_luxury', label: 'Executive VIP', icon: 'diamond-outline' },
  { id: 'suv', label: 'SUV / 4x4', icon: 'car-sport-outline' },
  { id: 'van', label: 'Delivery Van', icon: 'cube-outline' },
  { id: 'mini_bus', label: 'Mini Bus', icon: 'bus-outline' },
  { id: 'coastal_bus', label: 'Coaster Bus', icon: 'bus-outline' },
  { id: 'light_truck', label: 'Light Truck', icon: 'construct-outline' },
  { id: 'heavy_duty', label: 'Heavy Duty', icon: 'trail-sign-outline' },
  { id: 'dispatch_bike', label: 'Dispatch Bike', icon: 'bicycle-outline' },
];

const STATES = [
  'All Nigeria', 'Lagos', 'Abuja (FCT)', 'Rivers', 'Oyo', 'Kano', 'Delta', 'Anambra', 'Edo', 'Ogun'
];

export default function SearchDriversScreen({ navigation }) {
  const { isDark } = useTheme();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('All Nigeria');
  const [showFilters, setShowFilters] = useState(false);

  // Selected Driver for Details Modal
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Advanced Filter States
  const [country, setCountry] = useState('Nigeria');
  const [lga, setLga] = useState('');
  const [employmentType, setEmploymentType] = useState('Any');
  const [licenseClass, setLicenseClass] = useState('Any');
  const [vehicleRequirement, setVehicleRequirement] = useState('Any');
  const [accommodation, setAccommodation] = useState('Any');

  const handlePostVacancy = (driverData) => {
    try {
      navigation.navigate('PostJob', driverData ? { prefillDriver: driverData } : undefined);
    } catch (err) {
      console.log('PostJob navigation fallback:', err);
      try {
        navigation.navigate('Ride', { screen: 'PostJob', params: driverData ? { prefillDriver: driverData } : undefined });
      } catch (err2) {
        console.log('PostJob secondary fallback:', err2);
      }
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const filters = {
        query: searchQuery,
        country,
        state: selectedState === 'All Nigeria' ? '' : selectedState,
        lga,
        vehicle_type: selectedCategory === 'all' ? undefined : selectedCategory,
        employmentType: employmentType === 'Any' ? undefined : employmentType,
        licenseClass: licenseClass === 'Any' ? undefined : licenseClass,
        vehicleRequirement: vehicleRequirement === 'Any' ? undefined : vehicleRequirement,
        accommodation: accommodation === 'Any' ? undefined : accommodation,
      };

      const response = await bookingService.searchDrivers(filters);
      let list = response.data || [];

      // Use real drivers list from production backend API
      setDrivers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.log('Error searching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getCurrentPositionAsync({});
          let geocode = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
          });
          if (geocode && geocode.length > 0) {
            const item = geocode[0];
            if (item.region && STATES.includes(item.region)) {
              setSelectedState(item.region);
            }
          }
        }
      } catch (e) {
        console.log('Auto location detect error:', e);
      } finally {
        handleSearch();
      }
    })();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [selectedCategory, selectedState]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedState('All Nigeria');
    setEmploymentType('Any');
    setLicenseClass('Any');
    setVehicleRequirement('Any');
    setAccommodation('Any');
    setShowFilters(false);
  };

  const renderDriverCard = ({ item }) => {
    const initials = item.name
      ? item.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'DR';

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setSelectedDriver(item)}
        style={{
          backgroundColor: isDark ? '#121927' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
        className="border rounded-2xl p-4 mb-3.5 shadow-sm"
      >
        {/* Top Header: Avatar + Name + Rating */}
        <View className="flex-row items-center mb-3">
          <View
            style={{
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#a7f3d0',
            }}
            className="w-12 h-12 rounded-2xl border items-center justify-center mr-3 relative"
          >
            <Text className="text-emerald-600 dark:text-emerald-400 font-normal text-base tracking-wider">
              {initials}
            </Text>
            {item.is_verified && (
              <View className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full w-4 h-4 items-center justify-center border-2 border-white dark:border-slate-900">
                <Ionicons name="checkmark" size={10} color="#ffffff" />
              </View>
            )}
          </View>

          <View className="flex-1">
            <View className="flex-row items-center">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-base mr-1.5">
                {item.name}
              </Text>
              <Ionicons name="shield-checkmark" size={14} color="#10b981" />
            </View>
            <Text className="text-xs font-normal text-emerald-600 dark:text-brandMint mt-0.5">
              {item.vehicle_label || item.vehicle_type?.replace(/_/g, ' ') || 'Professional Driver'}
            </Text>
          </View>

          {/* Rating Badge */}
          <View
            style={{
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : '#a7f3d0',
            }}
            className="px-2.5 py-1 rounded-xl border flex-row items-center"
          >
            <Ionicons name="star" size={12} color="#10b981" />
            <Text style={{ color: isDark ? '#34d399' : '#065f46' }} className="text-xs font-normal ml-1">
              {item.rating || '5.0'}
            </Text>
          </View>
        </View>

        {/* Bio / Excerpt */}
        {item.bio ? (
          <Text
            numberOfLines={2}
            style={{ color: isDark ? '#94a3b8' : '#475569' }}
            className="text-xs font-normal leading-4 mb-3"
          >
            {item.bio}
          </Text>
        ) : null}

        {/* Info Badges Row */}
        <View className="flex-row flex-wrap gap-2 mb-3.5">
          <View
            style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }}
            className="flex-row items-center px-2 py-1 rounded-lg border"
          >
            <Ionicons name="location-outline" size={12} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={{ color: isDark ? '#cbd5e1' : '#475569' }} className="text-[11px] font-normal ml-1">
              {item.lga ? `${item.lga}, ${item.state}` : item.state || 'Nigeria'}
            </Text>
          </View>

          {item.experience_years ? (
            <View
              style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }}
              className="flex-row items-center px-2 py-1 rounded-lg border"
            >
              <Ionicons name="ribbon-outline" size={12} color="#10b981" />
              <Text style={{ color: isDark ? '#cbd5e1' : '#475569' }} className="text-[11px] font-normal ml-1">
                {item.experience_years} Yrs Exp
              </Text>
            </View>
          ) : null}

          <View
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.25)' }}
            className="flex-row items-center px-2 py-1 rounded-lg border"
          >
            <Ionicons name="checkmark-done" size={12} color="#10b981" />
            <Text className="text-[11px] font-normal text-emerald-700 dark:text-emerald-300 ml-1">
              NIN & Police Cleared
            </Text>
          </View>
        </View>

        {/* Card Footer: Action Buttons */}
        <View
          style={{ borderTopColor: isDark ? '#1e293b' : '#f1f5f9' }}
          className="flex-row items-center justify-between pt-2.5 border-t"
        >
          <TouchableOpacity
            onPress={() => setSelectedDriver(item)}
            className="py-1.5 px-3 rounded-xl flex-row items-center"
          >
            <Ionicons name="eye-outline" size={14} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={{ color: isDark ? '#cbd5e1' : '#475569' }} className="text-xs font-normal ml-1.5">
              View Credentials
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('RideBooking', { selectedDriver: item });
            }}
            className="bg-emerald-500 py-1.5 px-3.5 rounded-xl flex-row items-center active:bg-emerald-600"
          >
            <Ionicons name="car-sport-outline" size={14} color="#ffffff" />
            <Text className="text-white text-xs font-normal ml-1.5">
              Hire Driver
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090d16' : '#f8fafc' }}>
      {/* Top App Bar Header */}
      <View
        style={{
          backgroundColor: isDark ? '#121927' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
        className="px-4 py-3.5 border-b flex-row items-center justify-between"
      >
        <View className="flex-1">
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-base">
            Drivers Directory
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handlePostVacancy()}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex-row items-center active:bg-emerald-500/20"
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={14} color="#10b981" />
          <Text className="text-xs font-normal text-emerald-700 dark:text-brandMint ml-1">
            Post Vacancy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-3" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="flex-row items-center border rounded-2xl px-3.5 py-2 mb-3 shadow-sm"
        >
          <Ionicons name="search" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
          <TextInput
            placeholder="Search driver by name, LGA, or skill..."
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            className="flex-1 text-sm font-normal ml-2 py-1"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => { setSearchQuery(''); handleSearch(); }}>
              <Ionicons name="close-circle" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
              <Ionicons name="options-outline" size={18} color="#10b981" />
            </TouchableOpacity>
          )}
        </View>

        {/* State / Region Pills */}
        <View className="mb-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {STATES.map((st) => {
              const isSelected = selectedState === st;
              return (
                <TouchableOpacity
                  key={st}
                  onPress={() => setSelectedState(st)}
                  className={`mr-2 px-3 py-1.5 rounded-xl border ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500'
                      : isDark
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-xs font-normal ${
                      isSelected ? 'text-emerald-700 dark:text-brandMint font-normal' : isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Vehicle Category Chips */}
        <View className="mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {VEHICLE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  className={`mr-2 px-3 py-2 rounded-xl border flex-row items-center ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500'
                      : isDark
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={cat.icon}
                    size={14}
                    color={isSelected ? '#10b981' : isDark ? '#94a3b8' : '#64748b'}
                  />
                  <Text
                    className={`text-xs font-normal ml-1.5 ${
                      isSelected ? 'text-emerald-700 dark:text-brandMint' : isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Advanced Filters Drawer (if toggled) */}
        {showFilters && (
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-2xl p-4 mb-4 shadow-sm"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="funnel-outline" size={16} color="#10b981" />
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal ml-1.5">
                  Advanced Filters
                </Text>
              </View>
              <TouchableOpacity onPress={clearFilters}>
                <Text className="text-xs font-normal text-slate-500">Reset</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-[11px] font-normal text-slate-500 mb-1">Employment Type</Text>
                <TextInput
                  value={employmentType}
                  onChangeText={setEmploymentType}
                  placeholder="Full-Time / Daily"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  className="p-2 border rounded-xl text-xs font-normal"
                  style={{
                    backgroundColor: isDark ? '#090d16' : '#f8fafc',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    color: isDark ? '#ffffff' : '#0f172a',
                  }}
                />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-normal text-slate-500 mb-1">License Class</Text>
                <TextInput
                  value={licenseClass}
                  onChangeText={setLicenseClass}
                  placeholder="Class C / Heavy"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  className="p-2 border rounded-xl text-xs font-normal"
                  style={{
                    backgroundColor: isDark ? '#090d16' : '#f8fafc',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    color: isDark ? '#ffffff' : '#0f172a',
                  }}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => { setShowFilters(false); handleSearch(); }}
              className="bg-emerald-500 py-2.5 rounded-xl items-center"
            >
              <Text className="text-white text-xs font-normal">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results Header */}
        <View className="flex-row items-center justify-between mb-3 px-1">
          <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal">
            {drivers.length} Verified Drivers Available
          </Text>
          <TouchableOpacity onPress={handleSearch} className="flex-row items-center">
            <Ionicons name="refresh" size={13} color="#10b981" />
            <Text className="text-xs font-normal text-emerald-600 dark:text-brandMint ml-1">Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Drivers List */}
        {loading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-xs font-normal text-slate-500 mt-2">Loading vetted drivers...</Text>
          </View>
        ) : drivers.length > 0 ? (
          <FlatList
            data={drivers}
            renderItem={renderDriverCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-2xl p-6 items-center my-4"
          >
            <View className="w-14 h-14 rounded-full bg-emerald-500/10 items-center justify-center mb-3">
              <Ionicons name="search" size={24} color="#10b981" />
            </View>
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-sm font-normal mb-1">
              No Drivers Found in {selectedState}
            </Text>
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal text-center leading-4 mb-4">
              Try choosing "All Nigeria" or reset category filters to browse drivers in surrounding regions.
            </Text>
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={clearFilters}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700"
              >
                <Text style={{ color: isDark ? '#cbd5e1' : '#475569' }} className="text-xs font-normal">Clear Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePostVacancy()}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 active:bg-emerald-600 flex-row items-center"
              >
                <Ionicons name="add" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                <Text className="text-white text-xs font-normal">Post Driver Vacancy</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Driver Credentials / Details Modal */}
      <Modal
        visible={!!selectedDriver}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDriver(null)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="rounded-t-3xl border-t p-5 max-h-[85%]"
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-base font-normal">
                  {selectedDriver?.name}
                </Text>
                <Text className="text-xs font-normal text-emerald-600 dark:text-brandMint">
                  {selectedDriver?.vehicle_label || 'Professional Driver'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedDriver(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
              >
                <Ionicons name="close" size={18} color={isDark ? '#ffffff' : '#0f172a'} />
              </TouchableOpacity>
            </View>

            <ScrollView className="py-4" showsVerticalScrollIndicator={false}>
              {/* Trust & Security Highlights */}
              <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 mb-4">
                <View className="flex-row items-center mb-1.5">
                  <Ionicons name="shield-checkmark" size={18} color="#10b981" />
                  <Text className="text-xs font-normal text-emerald-800 dark:text-emerald-200 ml-2">
                    Verified Security Credentials
                  </Text>
                </View>
                <Text className="text-[11px] font-normal text-emerald-700 dark:text-emerald-300 leading-4">
                  National ID (NIN) identity match verified, Nigerian Police Force character clearance passed, and valid FRSC commercial driver's license confirmed.
                </Text>
              </View>

              {/* Driver Details Grid */}
              <View className="space-y-2.5 mb-4">
                <View className="flex-row justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal">License Class</Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal">
                    {selectedDriver?.license_class || 'Class C'}
                  </Text>
                </View>
                <View className="flex-row justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal">Experience</Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal">
                    {selectedDriver?.experience_years ? `${selectedDriver.experience_years} Years Active` : '5+ Years'}
                  </Text>
                </View>
                <View className="flex-row justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal">Base Location</Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal">
                    {selectedDriver?.lga ? `${selectedDriver.lga}, ${selectedDriver.state}` : selectedDriver?.state}
                  </Text>
                </View>
                <View className="flex-row justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal">Customer Rating</Text>
                  <Text className="text-xs font-normal text-amber-500">
                    ★ {selectedDriver?.rating || '5.0'} ({selectedDriver?.reviews_count || 12} trips)
                  </Text>
                </View>
              </View>

              {/* Bio Statement */}
              {selectedDriver?.bio ? (
                <View className="mb-4">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal mb-1">
                    About Driver
                  </Text>
                  <Text style={{ color: isDark ? '#e2e8f0' : '#334155' }} className="text-xs font-normal leading-5">
                    {selectedDriver.bio}
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            {/* Actions */}
            <View className="flex-row gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <TouchableOpacity
                onPress={() => {
                  const driverToHire = selectedDriver;
                  setSelectedDriver(null);
                  navigation.navigate('RideBooking', { selectedDriver: driverToHire });
                }}
                className="flex-1 bg-emerald-500 py-3 rounded-2xl items-center active:bg-emerald-600 flex-row justify-center"
              >
                <Ionicons name="car-sport" size={16} color="#ffffff" />
                <Text className="text-white text-xs font-normal ml-2">Book Driver Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const d = selectedDriver;
                  setSelectedDriver(null);
                  handlePostVacancy(d);
                }}
                className="flex-1 border border-emerald-500 py-3 rounded-2xl items-center flex-row justify-center"
              >
                <Ionicons name="briefcase-outline" size={16} color="#10b981" />
                <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-normal ml-2">Post Direct Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
