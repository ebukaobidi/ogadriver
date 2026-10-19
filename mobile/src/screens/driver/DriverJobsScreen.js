import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Alert, TextInput, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { jobService, bookingService, authService, driverService, api, extractArray } from '../../api/api';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import HeaderBar from '../../components/HeaderBar';
import { useTheme } from '../../context/ThemeContext';

export default function DriverJobsScreen({ navigation }) {
  const { isDark } = useTheme();
  // Main Tab: 'market' (Available jobs) | 'offers' (Direct Offers) | 'contracts' (My Contracts)
  const [activeMainTab, setActiveMainTab] = useState('market');

  // Job Market Sub-Category Filter: 'all' | 'rides' | 'hire'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Smart Hire Match Collapsible Drawer State
  const [smartMatchOpen, setSmartMatchOpen] = useState(false);
  const [preferredSchedule, setPreferredSchedule] = useState('Weekdays, 7am – 6pm');
  const [serviceArea, setServiceArea] = useState('Ikoyi, Lekki, VI');
  const [hireType, setHireType] = useState('any'); // 'any' | 'with_car' | 'driver_only'
  const [hireRequirements, setHireRequirements] = useState(
    'Weekly or longer contracts, at least ₦20,000/day, no night driving'
  );

  // Predefined Schedule Options (Hours, Days, Weeks, Weekends)
  const SCHEDULE_PRESETS = [
    'Weekdays, 7am – 6pm',
    'Full Week (7 Days)',
    'Weekends Only (Sat–Sun)',
    'Full Day (8 Hours)',
    'Half Day (4 Hours)',
    'Night Shift (7pm – 6am)'
  ];

  // Data States
  const [marketJobs, setMarketJobs] = useState([]);
  const [directOffers, setDirectOffers] = useState([]);
  const [activeContracts, setActiveContracts] = useState([]);
  const [isCarOwner, setIsCarOwner] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [locating, setLocating] = useState(false);

  // Auto-Detect Driver Location for Service Area
  const detectLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to detect service area.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      if (loc?.coords) {
        const addressRes = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        if (addressRes && addressRes.length > 0) {
          const place = addressRes[0];
          const detectedArea = `${place.district || place.city || place.subregion || 'Lagos'}, ${place.region || 'Nigeria'}`;
          setServiceArea(detectedArea);
        }
      }
    } catch (e) {
      console.log('Location detection error', e);
    } finally {
      setLocating(false);
    }
  };

  // Fetch real API data for the current active tab
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeMainTab === 'market') {
        // Fetch open rides & nearby jobs from real backend endpoints
        const [ridesRes, jobsRes, userRes] = await Promise.all([
          api.get('/marketplace/open-rides').catch(() => ({ data: [] })),
          jobService.getJobs({ type: categoryFilter }).catch(() => ({ data: [] })),
          authService.getUser().catch(() => null)
        ]);

        const hasCar = Boolean(userRes?.driver?.has_vehicle || userRes?.driver?.vehicle_make || userRes?.driver?.vehicle);
        setIsCarOwner(hasCar);

        const openRidesList = hasCar ? extractArray(ridesRes) : [];
        const nearbyJobsList = extractArray(jobsRes);

        // If driver has NO car, strictly filter to jobs where vehicle is NOT required
        const availableJobs = hasCar ? nearbyJobsList : nearbyJobsList.filter(j => !j.vehicle_required);

        // Combine and map into item cards
        const combinedMarket = [
          ...openRidesList.map(r => ({
            id: `ride_${r.id}`,
            rawId: r.id,
            itemType: 'ride',
            categoryLabel: 'Ride',
            title: `${r.pickup_address || r.pickup || 'Location'} → ${r.dropoff_address || r.dropoff || 'Destination'}`,
            subtitle: `${r.distance || '0'} km · ${r.duration || '0'} min`,
            price: Number(r.agreed_rate || r.fare || 0),
            rawItem: r
          })),
          ...availableJobs.map(j => ({
            id: `job_${j.id}`,
            rawId: j.id,
            itemType: j.vehicle_required ? 'hire_with_car' : 'hire_driver_only',
            categoryLabel: j.vehicle_required ? 'Hire · With car' : 'Hire · Driver only',
            title: `${j.location || j.city || 'Lagos'} → ${j.title || 'Contract'}`,
            subtitle: j.schedule || j.work_hours || 'Flexible Schedule',
            price: Number(j.daily_rate || j.monthly_rate || j.offered_salary || 0),
            rawItem: j
          }))
        ];

        setMarketJobs(combinedMarket);
      } else if (activeMainTab === 'offers') {
        // Fetch direct proposals sent to this driver
        const response = await bookingService.getMyBookings().catch(() => ({ data: [] }));
        const bookingsList = extractArray(response);
        setDirectOffers(bookingsList.filter(b => b.status === 'pending'));
      } else if (activeMainTab === 'contracts') {
        // Fetch active accepted runs & ongoing contracts
        const response = await bookingService.getMyBookings().catch(() => ({ data: [] }));
        const bookingsList = extractArray(response);
        setActiveContracts(bookingsList.filter(b => b.status === 'accepted' || b.status === 'in_progress'));
      }
    } catch (error) {
      console.error('Error loading jobs data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeMainTab, categoryFilter]);

  useEffect(() => {
    loadData();
    // Load initial user location preference
    authService.getUser().then(u => {
      if (u?.city) setServiceArea(`${u.city}, Lagos`);
    });
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Direct Offer Acceptance / Rejection Handlers
  const handleAcceptOffer = async (id) => {
    try {
      setProcessingId(id);
      await bookingService.acceptProposal(id);
      Alert.alert('Offer Accepted', 'Great! This contract has moved to My Contracts.');
      loadData();
    } catch (e) {
      Alert.alert('Error', 'Failed to accept offer. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineOffer = async (id) => {
    try {
      setProcessingId(id);
      await bookingService.rejectProposal(id);
      Alert.alert('Offer Declined', 'The offer has been declined.');
      loadData();
    } catch (e) {
      Alert.alert('Error', 'Failed to decline offer.');
    } finally {
      setProcessingId(null);
    }
  };

  // Recommend Hires Filter Trigger
  const handleRecommendHires = () => {
    Alert.alert(
      'Smart Match Updated',
      `Filtering matched hires for ${serviceArea} (${preferredSchedule})`
    );
    loadData();
  };

  // Filter items based on category pill selection
  const filteredMarketJobs = marketJobs.filter(item => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'rides') return item.itemType === 'ride';
    if (categoryFilter === 'hire') return item.itemType.startsWith('hire');
    return true;
  });

  // Theme-adaptive styling
  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: isDark ? '#00e588' : '#059669',
    tabBarBg: isDark ? '#0f172a' : '#f1f5f9',
    tabBarBorder: isDark ? '#1e293b' : '#e2e8f0',
    tabInactiveBg: isDark ? 'rgba(30, 41, 59, 0.6)' : '#e2e8f0',
    tabInactiveText: isDark ? '#94a3b8' : '#64748b',
    activeTabBg: isDark ? '#00e588' : '#059669',
    activeTabText: isDark ? '#090d16' : '#ffffff',
    inputBg: isDark ? '#090d16' : '#ffffff',
    inputBorder: isDark ? '#1e293b' : '#cbd5e1',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Top App Header */}
      <HeaderBar navigation={navigation} />

      {/* Screen Sub-Header Title */}
      <View className="px-4 pt-3 pb-2 flex-row justify-between items-center">
        <Text style={{ color: themeStyles.titleText }} className="font-normal text-2xl">
          Available jobs
        </Text>
      </View>

      {/* Main Top Navigation Tabs (Job Market | Direct Offers | My Contracts) */}
      <View 
        style={{ 
          backgroundColor: themeStyles.tabBarBg, 
          borderBottomColor: themeStyles.tabBarBorder, 
          borderBottomWidth: 1 
        }} 
        className="px-3 py-2 flex-row"
      >
        <TouchableOpacity
          style={{
            backgroundColor: activeMainTab === 'market' ? themeStyles.activeTabBg : themeStyles.tabInactiveBg
          }}
          className="flex-1 py-2 rounded-xl items-center"
          onPress={() => setActiveMainTab('market')}
        >
          <Text 
            style={{ 
              color: activeMainTab === 'market' ? themeStyles.activeTabText : themeStyles.tabInactiveText 
            }} 
            className="font-normal text-xs"
          >
            Job Market
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: activeMainTab === 'offers' ? themeStyles.activeTabBg : themeStyles.tabInactiveBg
          }}
          className="flex-1 py-2 rounded-xl items-center mx-1.5"
          onPress={() => setActiveMainTab('offers')}
        >
          <Text 
            style={{ 
              color: activeMainTab === 'offers' ? themeStyles.activeTabText : themeStyles.tabInactiveText 
            }} 
            className="font-normal text-xs"
          >
            Direct Offers {directOffers.length > 0 ? `(${directOffers.length})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: activeMainTab === 'contracts' ? themeStyles.activeTabBg : themeStyles.tabInactiveBg
          }}
          className="flex-1 py-2 rounded-xl items-center"
          onPress={() => setActiveMainTab('contracts')}
        >
          <Text 
            style={{ 
              color: activeMainTab === 'contracts' ? themeStyles.activeTabText : themeStyles.tabInactiveText 
            }} 
            className="font-normal text-xs"
          >
            My Contracts {activeContracts.length > 0 ? `(${activeContracts.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-3"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeStyles.brandGreen} />}
      >
        {/* ========================================================================= */}
        {/* TAB 1: JOB MARKET (UPGRADED WITH ATTACHED SCREEN MOCKUP UI & SMART HIRE MATCH) */}
        {/* ========================================================================= */}
        {activeMainTab === 'market' && (
          <View>
            {/* Collapsible Smart Hire Match Card */}
            <View 
              style={{ 
                backgroundColor: themeStyles.cardBg, 
                borderColor: themeStyles.brandGreen, 
                borderWidth: 1.5 
              }} 
              className="rounded-3xl p-4 mb-4 shadow-xl"
            >
              {/* Header (Opens / Closes on Arrow Tap) */}
              <TouchableOpacity
                className="flex-row items-center justify-between"
                onPress={() => setSmartMatchOpen(!smartMatchOpen)}
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View 
                    style={{ backgroundColor: isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)' }} 
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  >
                    <Ionicons name="sparkles" size={18} color={themeStyles.brandGreen} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base">
                      Smart hire match
                    </Text>
                    <Text style={{ color: themeStyles.subText }} className="text-xs mt-0.5">
                      Tell us your preferences, get matched hires
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={smartMatchOpen ? 'chevron-up' : 'chevron-forward'}
                  size={20}
                  color={themeStyles.primaryText}
                />
              </TouchableOpacity>

              {/* Expanded Preferences Drawer */}
              {smartMatchOpen && (
                <View 
                  style={{ borderTopColor: themeStyles.cardBorder, borderTopWidth: 1 }} 
                  className="mt-4 pt-4 space-y-4"
                >
                  {/* Preferred Schedule Selector */}
                  <View>
                    <Text style={{ color: themeStyles.subText }} className="text-xs font-semibold mb-1.5">
                      Preferred schedule
                    </Text>
                    <TextInput
                      value={preferredSchedule}
                      onChangeText={setPreferredSchedule}
                      style={{ 
                        backgroundColor: themeStyles.inputBg, 
                        color: themeStyles.primaryText, 
                        borderColor: themeStyles.inputBorder 
                      }}
                      className="border rounded-2xl px-4 py-3 text-xs mb-2"
                      placeholder="e.g. Weekdays, 7am – 6pm"
                      placeholderTextColor={themeStyles.subText}
                    />

                    {/* Schedule Preset Pills (Hours, Days, Weeks, Weekends) */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-1">
                      {SCHEDULE_PRESETS.map(preset => (
                        <TouchableOpacity
                          key={preset}
                          onPress={() => setPreferredSchedule(preset)}
                          style={{
                            backgroundColor: preferredSchedule === preset 
                              ? (isDark ? 'rgba(0, 229, 136, 0.18)' : 'rgba(5, 150, 105, 0.12)')
                              : themeStyles.inputBg,
                            borderColor: preferredSchedule === preset ? themeStyles.brandGreen : themeStyles.inputBorder,
                            borderWidth: 1
                          }}
                          className="px-3 py-1.5 rounded-full mr-2"
                        >
                          <Text 
                            style={{ 
                              color: preferredSchedule === preset ? themeStyles.brandGreen : themeStyles.subText 
                            }} 
                            className="text-[10px] font-bold"
                          >
                            {preset}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Service Area Input with Location Auto-Detect */}
                  <View>
                    <View className="flex-row justify-between items-center mb-1.5">
                      <Text style={{ color: themeStyles.subText }} className="text-xs font-semibold">
                        Service area
                      </Text>
                      <TouchableOpacity onPress={detectLocation} className="flex-row items-center">
                        {locating ? (
                          <ActivityIndicator size="small" color={themeStyles.brandGreen} />
                        ) : (
                          <>
                            <Ionicons name="location" size={12} color={themeStyles.brandGreen} style={{ marginRight: 2 }} />
                            <Text style={{ color: themeStyles.brandGreen }} className="text-[10px] font-bold">
                              Auto-detect
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      value={serviceArea}
                      onChangeText={setServiceArea}
                      style={{ 
                        backgroundColor: themeStyles.inputBg, 
                        color: themeStyles.primaryText, 
                        borderColor: themeStyles.inputBorder 
                      }}
                      className="border rounded-2xl px-4 py-3 text-xs"
                      placeholder="e.g. Ikoyi, Lekki, VI"
                      placeholderTextColor={themeStyles.subText}
                    />
                  </View>

                  {/* Hire Type Filter Pills */}
                  <View>
                    <Text style={{ color: themeStyles.subText }} className="text-xs font-semibold mb-1.5">
                      Hire type
                    </Text>
                    <View className="flex-row">
                      <TouchableOpacity
                        style={{
                          backgroundColor: hireType === 'any' ? themeStyles.brandGreen : themeStyles.tabInactiveBg
                        }}
                        className="px-4 py-2 rounded-full mr-2"
                        onPress={() => setHireType('any')}
                      >
                        <Text
                          style={{
                            color: hireType === 'any' ? themeStyles.activeTabText : themeStyles.tabInactiveText
                          }}
                          className="text-xs font-bold"
                        >
                          Any
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          backgroundColor: hireType === 'with_car' ? themeStyles.brandGreen : themeStyles.tabInactiveBg
                        }}
                        className="px-4 py-2 rounded-full mr-2"
                        onPress={() => setHireType('with_car')}
                      >
                        <Text
                          style={{
                            color: hireType === 'with_car' ? themeStyles.activeTabText : themeStyles.tabInactiveText
                          }}
                          className="text-xs font-bold"
                        >
                          With my car
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          backgroundColor: hireType === 'driver_only' ? themeStyles.brandGreen : themeStyles.tabInactiveBg
                        }}
                        className="px-4 py-2 rounded-full"
                        onPress={() => setHireType('driver_only')}
                      >
                        <Text
                          style={{
                            color: hireType === 'driver_only' ? themeStyles.activeTabText : themeStyles.tabInactiveText
                          }}
                          className="text-xs font-bold"
                        >
                          Driver only
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Hire Requirements Multiline Textarea */}
                  <View>
                    <Text style={{ color: themeStyles.subText }} className="text-xs font-semibold mb-1.5">
                      Hire requirements
                    </Text>
                    <TextInput
                      value={hireRequirements}
                      onChangeText={setHireRequirements}
                      multiline
                      numberOfLines={3}
                      style={{ 
                        backgroundColor: themeStyles.inputBg, 
                        color: themeStyles.primaryText, 
                        borderColor: themeStyles.inputBorder 
                      }}
                      className="border rounded-2xl p-4 text-xs h-20"
                      placeholder="e.g. Weekly or longer contracts, at least ₦20,000/day..."
                      placeholderTextColor={themeStyles.subText}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Recommend Hires Button */}
                  <TouchableOpacity
                    style={{ backgroundColor: themeStyles.brandGreen }}
                    className="py-3.5 rounded-full flex-row justify-center items-center mt-2 shadow-lg"
                    onPress={handleRecommendHires}
                  >
                    <Ionicons name="sparkles" size={16} color={themeStyles.activeTabText} style={{ marginRight: 6 }} />
                    <Text style={{ color: themeStyles.activeTabText }} className="font-normal text-sm">
                      Recommend hires
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Category Filter Pills (All | Rides | Driver Hire) */}
            <View className="flex-row mb-4">
              <TouchableOpacity
                style={{
                  backgroundColor: categoryFilter === 'all' ? themeStyles.brandGreen : themeStyles.cardBg,
                  borderColor: categoryFilter === 'all' ? themeStyles.brandGreen : themeStyles.cardBorder,
                  borderWidth: 1
                }}
                className="px-5 py-2 rounded-full mr-2"
                onPress={() => setCategoryFilter('all')}
              >
                <Text
                  style={{
                    color: categoryFilter === 'all' ? themeStyles.activeTabText : themeStyles.primaryText
                  }}
                  className="text-xs font-normal"
                >
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: categoryFilter === 'rides' ? themeStyles.brandGreen : themeStyles.cardBg,
                  borderColor: categoryFilter === 'rides' ? themeStyles.brandGreen : themeStyles.cardBorder,
                  borderWidth: 1
                }}
                className="px-5 py-2 rounded-full mr-2"
                onPress={() => {
                  if (!isCarOwner) {
                    Alert.alert(
                      '🚗 Vehicle Required',
                      'Street ride requests require a verified vehicle attached to your profile. As a Chauffeur Operative, you can accept full-time and private hire contracts.'
                    );
                    return;
                  }
                  setCategoryFilter('rides');
                }}
              >
                <Text
                  style={{
                    color: categoryFilter === 'rides' ? themeStyles.activeTabText : themeStyles.primaryText
                  }}
                  className="text-xs font-normal"
                >
                  Rides
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: categoryFilter === 'hire' ? themeStyles.brandGreen : themeStyles.cardBg,
                  borderColor: categoryFilter === 'hire' ? themeStyles.brandGreen : themeStyles.cardBorder,
                  borderWidth: 1
                }}
                className="px-5 py-2 rounded-full"
                onPress={() => setCategoryFilter('hire')}
              >
                <Text
                  style={{
                    color: categoryFilter === 'hire' ? themeStyles.activeTabText : themeStyles.primaryText
                  }}
                  className="text-xs font-normal"
                >
                  Driver Hire
                </Text>
              </TouchableOpacity>
            </View>

            {/* Available Jobs Real API Items Stream */}
            {loading ? (
              <View className="py-12 items-center">
                <ActivityIndicator color={themeStyles.brandGreen} size="large" />
                <Text style={{ color: themeStyles.subText }} className="text-xs mt-3">
                  Scanning live job market...
                </Text>
              </View>
            ) : filteredMarketJobs.length > 0 ? (
              filteredMarketJobs.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={{ 
                    backgroundColor: themeStyles.cardBg, 
                    borderColor: themeStyles.cardBorder, 
                    borderWidth: 1 
                  }}
                  className="rounded-3xl p-4 mb-3 flex-row items-center justify-between shadow-sm"
                  onPress={() => {
                    if (item.itemType === 'ride') {
                      Alert.alert('Ride Bid', `Submit fare bid for ${item.title}?`, [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Bid ₦' + item.price.toLocaleString(),
                          onPress: () =>
                            api.post(`/rides/${item.rawId}/bid`, { amount: item.price })
                        }
                      ]);
                    } else {
                      navigation.navigate('Home', { screen: 'JobDetails', params: { jobId: item.rawId } });
                    }
                  }}
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    {/* Circle Icon Badge */}
                    <View
                      style={{
                        backgroundColor: item.itemType === 'hire_driver_only'
                          ? 'rgba(251, 191, 36, 0.15)'
                          : isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)'
                      }}
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    >
                      <Ionicons
                        name={
                          item.itemType === 'ride'
                            ? 'car'
                            : item.itemType === 'hire_with_car'
                            ? 'car-sport'
                            : 'key'
                        }
                        size={22}
                        color={themeStyles.brandGreen}
                      />
                    </View>

                    {/* Content Details */}
                    <View className="flex-1">
                      <Text 
                        style={{ 
                          color: themeStyles.subText 
                        }} 
                        className="text-[11px] font-semibold mb-0.5"
                      >
                        {item.categoryLabel}
                      </Text>
                      <Text style={{ color: themeStyles.primaryText }} className="font-normal text-sm leading-snug" numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={{ color: themeStyles.subText }} className="text-xs mt-0.5">{item.subtitle}</Text>
                    </View>
                  </View>

                  {/* Price & Right Arrow */}
                  <View className="flex-row items-center">
                    <Text style={{ color: themeStyles.brandGreen }} className="font-normal text-base mr-1">
                      ₦{item.price.toLocaleString()}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={themeStyles.subText} />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View 
                style={{ 
                  backgroundColor: themeStyles.cardBg, 
                  borderColor: themeStyles.cardBorder, 
                  borderWidth: 1 
                }} 
                className="rounded-3xl p-8 items-center"
              >
                <Ionicons name="briefcase-outline" size={48} color={themeStyles.subText} className="mb-3" />
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base">
                  No Available Jobs
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DIRECT OFFERS (PENDING PROPOSALS FROM EMPLOYERS) */}
        {/* ========================================================================= */}
        {activeMainTab === 'offers' && (
          <View>
            {loading ? (
              <View className="py-12 items-center">
                <ActivityIndicator color={themeStyles.brandGreen} size="large" />
              </View>
            ) : directOffers.length > 0 ? (
              directOffers.map(offer => (
                <View 
                  key={offer.id} 
                  style={{ 
                    backgroundColor: themeStyles.cardBg, 
                    borderColor: themeStyles.cardBorder, 
                    borderWidth: 1 
                  }} 
                  className="rounded-3xl p-5 mb-4 shadow-sm"
                >
                  <View className="flex-row items-center mb-3">
                    <View 
                      style={{ 
                        backgroundColor: isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)' 
                      }} 
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    >
                      <Ionicons name="person" size={22} color={themeStyles.brandGreen} />
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base">
                        {offer.title || 'Corporate Executive Driver Offer'}
                      </Text>
                      <Text style={{ color: themeStyles.brandGreen }} className="text-xs font-normal">
                        Verified Hirer Proposal ✓
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-baseline mb-3">
                    <Text style={{ color: themeStyles.primaryText }} className="font-normal text-2xl">
                      ₦{Number(offer.agreed_rate || offer.amount || 0).toLocaleString()}
                    </Text>
                    <Text style={{ color: themeStyles.subText }} className="text-xs font-normal">
                      / {offer.rate_type || 'month'}
                    </Text>
                  </View>

                  <View className="flex-row gap-2 mt-1">
                    <TouchableOpacity
                      style={{ backgroundColor: themeStyles.brandGreen }}
                      className="flex-1 py-3 rounded-2xl items-center"
                      onPress={() => handleAcceptOffer(offer.id)}
                      disabled={processingId !== null}
                    >
                      <Text style={{ color: themeStyles.activeTabText }} className="font-normal text-xs uppercase">
                        Accept Offer
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ 
                        backgroundColor: themeStyles.tabInactiveBg, 
                        borderColor: themeStyles.cardBorder, 
                        borderWidth: 1 
                      }}
                      className="flex-1 py-3 rounded-2xl items-center"
                      onPress={() => handleDeclineOffer(offer.id)}
                      disabled={processingId !== null}
                    >
                      <Text style={{ color: themeStyles.subText }} className="font-normal text-xs uppercase">
                        Decline
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View 
                style={{ 
                  backgroundColor: themeStyles.cardBg, 
                  borderColor: themeStyles.cardBorder, 
                  borderWidth: 1 
                }} 
                className="rounded-3xl p-8 items-center"
              >
                <Ionicons name="mail-unread-outline" size={48} color={themeStyles.subText} className="mb-3" />
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base mb-1">
                  No Direct Offers Yet
                </Text>
                <Text style={{ color: themeStyles.subText }} className="text-xs text-center font-normal">
                  Direct job offers sent by employers will appear here. Ensure your profile is 100% complete!
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MY CONTRACTS (ACTIVE ACCEPTED RUNS & JOBS) */}
        {/* ========================================================================= */}
        {activeMainTab === 'contracts' && (
          <View>
            {loading ? (
              <View className="py-12 items-center">
                <ActivityIndicator color={themeStyles.brandGreen} size="large" />
              </View>
            ) : activeContracts.length > 0 ? (
              activeContracts.map(contract => (
                <View 
                  key={contract.id} 
                  style={{ 
                    backgroundColor: themeStyles.cardBg, 
                    borderColor: themeStyles.cardBorder, 
                    borderWidth: 1 
                  }} 
                  className="rounded-3xl p-5 mb-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base">
                      {contract.title || 'Active Driver Contract'}
                    </Text>
                    <View 
                      style={{ 
                        backgroundColor: isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)', 
                        borderColor: themeStyles.brandGreen, 
                        borderWidth: 1 
                      }} 
                      className="px-3 py-1 rounded-full"
                    >
                      <Text style={{ color: themeStyles.brandGreen }} className="text-[10px] font-normal uppercase">
                        ACTIVE
                      </Text>
                    </View>
                  </View>

                  <Text style={{ color: themeStyles.subText }} className="text-xs mb-3 font-normal">
                    Pickup: {contract.pickup_location || 'Lagos'} • Starts: {contract.start_date || 'Ongoing'}
                  </Text>

                  <View 
                    style={{ borderTopColor: themeStyles.cardBorder, borderTopWidth: 1 }} 
                    className="flex-row justify-between items-center pt-3"
                  >
                    <Text style={{ color: themeStyles.primaryText }} className="font-normal text-lg">
                      ₦{Number(contract.agreed_rate || contract.amount || 0).toLocaleString()}
                    </Text>
                    <TouchableOpacity
                      style={{ 
                        backgroundColor: themeStyles.tabInactiveBg, 
                        borderColor: themeStyles.cardBorder, 
                        borderWidth: 1 
                      }} 
                      className="px-4 py-2 rounded-xl"
                      onPress={() => navigation.navigate('Home', { screen: 'JobDetails', params: { jobId: contract.id } })}
                    >
                      <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs">
                        View Contract
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View 
                style={{ 
                  backgroundColor: themeStyles.cardBg, 
                  borderColor: themeStyles.cardBorder, 
                  borderWidth: 1 
                }} 
                className="rounded-3xl p-8 items-center"
              >
                <Ionicons name="document-text-outline" size={48} color={themeStyles.subText} className="mb-3" />
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-base mb-1">
                  No Active Contracts
                </Text>
                <Text style={{ color: themeStyles.subText }} className="text-xs text-center font-normal">
                  Contracts you accept from the Job Market or Direct Offers will appear here.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

