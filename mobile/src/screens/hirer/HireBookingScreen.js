import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bookingService } from '../../api/api';
import { useTheme } from '../../context/ThemeContext';
import loyaltyService from '../../services/loyaltyService';

let MapView, Marker, PROVIDER_GOOGLE;
let DateTimePicker;
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch (e) {
    console.log('Native maps/picker optional import warning:', e);
  }
}

const WHITE_GOOGLE_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'on' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e8f5e9' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e0f2fe' }] },
];

export default function HireBookingScreen({ navigation }) {
  const { isDark, themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const [pickup, setPickup] = useState('');
  const [activeInput, setActiveInput] = useState(null);

  // Hire Mode: Driver only vs Driver + car
  const [hireType, setHireType] = useState('Driver only'); // 'Driver only' | 'Driver + car'
  const [engagement, setEngagement] = useState('Daily'); // 'Hourly' | 'Daily' | 'Weekly' | 'Monthly / Full-Time'
  const [hireDuration, setHireDuration] = useState(1);
  const [hireNotes, setHireNotes] = useState('');

  // Vehicle choices for "Driver + car": Economy, Comfort, Executive VIP (Centred layout)
  const [hireVehicleType, setHireVehicleType] = useState('Economy');

  // Schedule / Start Date
  const [scheduleType, setScheduleType] = useState('Now'); // 'Now' | 'Tomorrow' | 'Next Monday' | 'Custom'
  const [hireStartDate, setHireStartDate] = useState(new Date());
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showNativePicker, setShowNativePicker] = useState(false);
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);

  // Pricing
  const [hireSuggestedPrice, setHireSuggestedPrice] = useState(20000);
  const [hireOfferPrice, setHireOfferPrice] = useState(20000);
  const [hirePaymentMethod, setHirePaymentMethod] = useState('Cash');

  // OgaPoints Rewards & Discount for Driver Hire
  const [userPoints, setUserPoints] = useState(1250);
  const [usePointsDiscount, setUsePointsDiscount] = useState(false);
  const pointsDiscountValue = 2000; // ₦2,000 discount per 2,000 pts
  const pointsToEarn = 200; // +200 pts bonus for chauffeur hire

  useEffect(() => {
    loyaltyService.getPoints().then(setUserPoints).catch(() => {});
  }, []);

  // Intermediate stops / itinerary (Stop & Continue)
  const [stops, setStops] = useState([]); // [{ id: string, address: string }]
  const [showTripSummaryModal, setShowTripSummaryModal] = useState(false);
  const [pickupCoord, setPickupCoord] = useState({ latitude: 9.1066, longitude: 7.4111 });

  // Add stop for multi-destination chauffeur hire
  const addStop = () => {
    if (stops.length >= 4) {
      Alert.alert('Maximum Stops', 'You can add up to 4 itinerary stops for your chauffeur booking.');
      return;
    }
    const newStopId = String(Date.now());
    setStops((prev) => [...prev, { id: newStopId, address: '' }]);
  };

  const removeStop = (id) => {
    setStops((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStop = (id, text) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, address: text } : s)));
  };

  // Map pick-up point selection
  const handleMapPress = (e) => {
    const coord = e.nativeEvent.coordinate;
    if (coord) {
      setPickupCoord(coord);
      setPickup(`Selected Pin (${coord.latitude.toFixed(4)}, ${coord.longitude.toFixed(4)})`);
    }
  };

  const handlePickOnMap = () => {
    Alert.alert('Map Pick-up Spot', 'Tap anywhere on the map above to set your chauffeur meeting point.');
  };
  const region = {
    latitude: 9.0915,
    longitude: 7.4432,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const [searchResults, setSearchResults] = useState([
    { id: '1', title: 'Victoria Island, Lagos, Nigeria', lat: 6.4281, lon: 3.4219 },
    { id: '2', title: 'Ikoyi Residential Zone, Lagos', lat: 6.4549, lon: 3.4358 },
    { id: '3', title: 'Maitama Business District, Abuja', lat: 9.0882, lon: 7.4934 },
    { id: '4', title: 'Wuse 2, Abuja, Nigeria', lat: 9.0765, lon: 7.4753 },
    { id: '5', title: 'Ikeja GRA, Lagos', lat: 6.5900, lon: 3.3500 },
  ]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = React.useRef(null);

  const fetchLiveSuggestions = (query) => {
    if (!query || query.trim().length < 2) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const url = `https://api.locationiq.com/v1/autocomplete?key=pk.8ae3192c04f86a50c49464280dfb044e&q=${encodeURIComponent(query)}&countrycodes=ng&limit=6&format=json`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSearchResults(data.map((item, idx) => ({
              id: item.place_id || String(idx),
              title: item.display_name,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            })));
          }
        }
      } catch (e) {
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  };

  const vehicleOptions = [
    { id: 'Economy', name: 'Economy', mult: 1, icon: 'car-outline', desc: 'Standard 4-seater' },
    { id: 'Comfort', name: 'Comfort', mult: 1.5, icon: 'car-sport-outline', desc: 'Air-conditioned Sedan' },
    { id: 'Executive', name: 'VIP Luxury', mult: 4.0, icon: 'diamond', desc: 'Executive Chauffeur Fleet' },
  ];

  // Calculate pricing dynamically
  useEffect(() => {
    let base = 0;
    if (hireType === 'Driver only') {
      if (engagement === 'Hourly') base = 3000;
      if (engagement === 'Daily') base = 20000;
      if (engagement === 'Weekly') base = 100000;
      if (engagement === 'Monthly / Full-Time') base = 350000;
    } else {
      let carMultiplier = 1;
      const found = vehicleOptions.find((v) => v.id === hireVehicleType);
      if (found) carMultiplier = found.mult;

      if (engagement === 'Hourly') base = 6000 * carMultiplier;
      if (engagement === 'Daily') base = 45000 * carMultiplier;
      if (engagement === 'Weekly') base = 250000 * carMultiplier;
      if (engagement === 'Monthly / Full-Time') base = 900000 * carMultiplier;
    }

    const durationNum = parseInt(hireDuration, 10) || 1;
    const total = Math.round(base * durationNum);
    setHireSuggestedPrice(total);
    setHireOfferPrice(total);
  }, [hireType, engagement, hireDuration, hireVehicleType]);

  // Bolt-style Bottom Sheet Animation & Snapping for Hire
  const { height: screenHeight } = Dimensions.get('window');
  const SNAP_COLLAPSED = Math.max(180, Math.round(screenHeight * 0.25));
  const SNAP_MIDDLE = Math.round(screenHeight * 0.60); // Middle height (60%)
  const SNAP_EXPANDED = Math.round(screenHeight * 0.88); // Full top screen (88%)

  const [sheetState, setSheetState] = useState('middle'); // Open at middle so user sees options immediately
  const sheetHeightAnim = React.useRef(new Animated.Value(SNAP_MIDDLE)).current;
  const currentHeightRef = React.useRef(SNAP_MIDDLE);

  const snapSheetTo = (stateName) => {
    let target = SNAP_COLLAPSED;
    if (stateName === 'middle') target = SNAP_MIDDLE;
    if (stateName === 'expanded') target = SNAP_EXPANDED;

    currentHeightRef.current = target;
    setSheetState(stateName);
    Animated.spring(sheetHeightAnim, {
      toValue: target,
      damping: 24,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: false,
    }).start();
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
      onPanResponderGrant: () => {
        sheetHeightAnim.stopAnimation();
      },
      onPanResponderMove: (_, gesture) => {
        const nextHeight = Math.min(
          SNAP_EXPANDED + 30,
          Math.max(SNAP_COLLAPSED - 20, currentHeightRef.current - gesture.dy)
        );
        sheetHeightAnim.setValue(nextHeight);
      },
      onPanResponderRelease: (_, gesture) => {
        const projectedHeight = currentHeightRef.current - gesture.dy - gesture.vy * 50;
        if (projectedHeight > (SNAP_MIDDLE + SNAP_EXPANDED) / 2) {
          snapSheetTo('expanded');
        } else if (projectedHeight > (SNAP_COLLAPSED + SNAP_MIDDLE) / 2) {
          snapSheetTo('middle');
        } else {
          snapSheetTo('collapsed');
        }
      },
    })
  ).current;

  const adjustPrice = (amount) => {
    setHireOfferPrice((prev) => Math.max(2000, prev + amount));
  };

  const adjustDuration = (delta) => {
    setHireDuration((prev) => Math.max(1, (parseInt(prev, 10) || 1) + delta));
  };

  const applySchedulePreset = (preset) => {
    setScheduleType(preset);
    const newDate = new Date();
    if (preset === 'Now') {
      setHireStartDate(newDate);
    } else if (preset === 'Tomorrow') {
      newDate.setDate(newDate.getDate() + 1);
      newDate.setHours(8, 0, 0, 0); // 8:00 AM
      setHireStartDate(newDate);
    } else if (preset === 'Next Monday') {
      const day = newDate.getDay();
      const diff = (8 - day) % 7 || 7;
      newDate.setDate(newDate.getDate() + diff);
      newDate.setHours(8, 0, 0, 0);
      setHireStartDate(newDate);
    }
  };

  const onNativeDateChange = (event, selectedDate) => {
    setShowNativePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setHireStartDate(selectedDate);
      setScheduleType('Custom');
    }
  };

  const handleRequestHire = () => {
    if (!pickup) {
      Alert.alert('Missing Location', 'Please specify where the driver should report / meet you.');
      return;
    }
    // Show Trip Summary before dispatching
    setShowTripSummaryModal(true);
  };

  const dispatchHireConfirmed = async () => {
    setShowTripSummaryModal(false);
    try {
      const finalFare = usePointsDiscount ? Math.max(2000, hireOfferPrice - pointsDiscountValue) : hireOfferPrice;

      const stopAddresses = stops.map((s) => s.address).filter(Boolean);
      const combinedNotes = [
        `Engagement: ${engagement} (${hireDuration})`,
        `Type: ${hireType}`,
        hireNotes,
        stopAddresses.length > 0 ? `Intermediate Stops: ${stopAddresses.join(' -> ')}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      await bookingService.createBooking({
        booking_mode: 'open_ride',
        pickup_location: pickup || 'Pickup Point',
        dropoff_location: 'City Service / Dedicated Chauffeur',
        pickup_latitude: pickupCoord.latitude,
        pickup_longitude: pickupCoord.longitude,
        agreed_rate: finalFare,
        offer_price: finalFare,
        vehicle_type: hireType === 'Driver + car' ? hireVehicleType.toLowerCase() : 'standard',
        vehicle_required: hireType === 'Driver + car',
        payment_method: hirePaymentMethod.toLowerCase(),
        notes: combinedNotes,
        is_scheduled: scheduleType !== 'Now',
        scheduled_at: scheduleType === 'Now' ? null : hireStartDate.toISOString(),
      });

      if (usePointsDiscount) {
        await loyaltyService.redeemPoints(pointsDiscountValue, `Redeemed for ₦2,000 off Driver Hire`);
        setUserPoints((prev) => Math.max(0, prev - pointsDiscountValue));
        setUsePointsDiscount(false);
      }
      await loyaltyService.earnPoints(pointsToEarn, `Driver Hire cashback (+${pointsToEarn} pts)`);
      setUserPoints((prev) => prev + pointsToEarn);

      Alert.alert(
        'Hire Request Dispatched!',
        `Your driver hire request has been broadcasted!${usePointsDiscount ? ' ₦2,000 points discount was applied!' : ''}\nYou earned +${pointsToEarn} OgaPoints on this booking!`
      );
    } catch (err) {
      console.log('Hire request error:', err);
      const errorMsg = err.response?.data?.message || 'Searching for available vetted drivers in your state.';
      Alert.alert('Hire Request Broadcasted', errorMsg);
    }
  };

  const renderSuggestions = () => {
    if (!activeInput) return null;
    return (
      <View
        style={{
          backgroundColor: isDark ? '#121927' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
        className="border rounded-2xl shadow-xl mt-1 z-50 max-h-56 overflow-hidden"
      >
        {searchResults.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            className={`flex-row items-center p-3.5 ${
              index !== searchResults.length - 1 ? 'border-b' : ''
            }`}
            style={{
              borderColor: isDark ? '#1e293b' : '#f1f5f9',
            }}
            onPress={() => {
              if (activeInput === 'pickup') {
                setPickup(item.title);
                if (item.lat && item.lon) setPickupCoord({ latitude: item.lat, longitude: item.lon });
              }
              setActiveInput(null);
            }}
          >
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5' }}
            >
              <Ionicons name="location-outline" size={18} color="#10b981" />
            </View>
            <Text
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              className="text-xs font-semibold flex-1"
              numberOfLines={2}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090d16' : '#ffffff' }}>
      {/* TOP FLOATING BOLT NAV HEADER (Overlaying Map) */}
      <View
        style={{
          position: 'absolute',
          top: Math.max(insets.top + 8, 16),
          left: 16,
          right: 16,
          zIndex: 40,
        }}
        className="flex-row items-center justify-between"
      >
        <View
          style={{
            backgroundColor: isDark ? 'rgba(18,25,39,0.92)' : 'rgba(255,255,255,0.95)',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="flex-row items-center px-4 py-2.5 rounded-2xl border shadow-lg shadow-black/10"
        >
          <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs mr-2">
            OgaDriver Chauffeur
          </Text>
          <View className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
            <Text className="text-[9px] font-bold uppercase text-emerald-500">Live Map</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            try {
              navigation.navigate('HirerBookings');
            } catch (err) {
              navigation.navigate('Account', { screen: 'HirerBookings' });
            }
          }}
          style={{
            backgroundColor: isDark ? 'rgba(18,25,39,0.92)' : 'rgba(255,255,255,0.95)',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="px-3.5 h-11 rounded-2xl border items-center justify-center flex-row shadow-lg shadow-black/10"
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={16} color="#10b981" style={{ marginRight: 4 }} />
          <Text className="text-emerald-500 font-normal text-xs">Bookings</Text>
        </TouchableOpacity>
      </View>

      {/* FULL-SCREEN BOLT BACKGROUND MAP CANVAS (80%+ Screen View) */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} className="bg-[#f8fafc]">
        {Platform.OS !== 'web' && MapView ? (
          <MapView
            style={{ width: '100%', height: '100%' }}
            initialRegion={region}
            customMapStyle={WHITE_GOOGLE_MAP_STYLE}
            onPress={handleMapPress}
          >
            {pickup && <Marker coordinate={pickupCoord} pinColor="#008751" title="Pickup / Reporting Point" />}
          </MapView>
        ) : (
          // Clean Minimalist White Google Maps Canvas
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={handlePickOnMap}
            className="flex-1 w-full bg-[#f8fafc] items-center justify-center relative overflow-hidden"
          >
            {/* Street Cartography Roads (Crisp White / Light Silver) */}
            <View className="absolute inset-0">
              <View className="absolute w-full h-10 bg-white top-1/4 -rotate-12 border-y border-slate-200/80" />
              <View className="absolute w-full h-12 bg-white top-1/2 rotate-6 border-y border-slate-200/80" />
              <View className="absolute h-full w-10 bg-white left-1/3 rotate-12 border-x border-slate-200/80" />
              <View className="absolute h-full w-12 bg-white right-1/4 -rotate-6 border-x border-slate-200/80" />
              <View className="absolute w-44 h-36 bg-emerald-50/60 rounded-3xl top-16 left-8 border border-emerald-100/70" />
              <View className="absolute w-52 h-32 bg-sky-50/70 rounded-full top-1/3 right-6 border border-sky-100/70" />
            </View>

            {/* Center Reporting Spot Graphic (Clean White Card) */}
            <View className="z-10 items-center bg-white/95 px-6 py-4 rounded-3xl border border-slate-200 shadow-md max-w-[85%] mb-24">
              <View className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-600 items-center justify-center shadow-sm mb-2">
                <Ionicons name="location" size={24} color="#008751" />
              </View>
              <Text className="text-slate-800 text-xs font-normal text-center" numberOfLines={2}>
                {pickup || 'Tap Map to Set Reporting Spot'}
              </Text>
              <View className="flex-row items-center mt-1 px-2.5 py-0.5 rounded-full bg-slate-100">
                <Ionicons name="shield-checkmark" size={11} color="#008751" style={{ marginRight: 4 }} />
                <Text className="text-slate-600 text-[10px] font-normal">
                  Chauffeur Service Radius
                </Text>
              </View>
            </View>

            {/* Floating Lagos Metro Badge */}
            <View className="absolute top-24 left-4 bg-white/90 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-slate-700 text-[10px] font-normal">
                Google Maps Chauffeur Dispatch • Tap map to pick
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* BOLT-STYLE SLIDING BOTTOM SHEET FOR HIRE */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: sheetHeightAnim,
          backgroundColor: isDark ? '#090d16' : '#ffffff',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 24,
          zIndex: 50,
          borderTopWidth: 1,
          borderColor: isDark ? '#1e293b' : '#f1f5f9',
        }}
      >
        {/* DRAG / TAP HANDLE (Clean Bolt minimal handle) */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => snapSheetTo(sheetState === 'collapsed' ? 'middle' : (sheetState === 'middle' ? 'expanded' : 'collapsed'))}
          {...panResponder.panHandlers}
          className="w-full pt-3 pb-2.5 items-center justify-center bg-transparent"
        >
          <View
            style={{ backgroundColor: isDark ? '#475569' : '#cbd5e1' }}
            className="w-12 h-1.5 rounded-full"
          />
        </TouchableOpacity>

        {/* REPORTING LOCATION & ITINERARY (ALWAYS VISIBLE FORM) */}
        <View className="px-4 pt-1 pb-2">
          {/* Reporting Location Input */}
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: activeInput === 'pickup' ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="flex-row items-center border rounded-2xl px-3.5 py-2.5 mb-1.5 shadow-sm"
          >
            <View className="w-3.5 h-3.5 rounded-full bg-emerald-500 mr-2.5 items-center justify-center">
              <View className="w-1.5 h-1.5 rounded-full bg-white" />
            </View>
            <TextInput
              placeholder="Where should the driver meet you?"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              value={pickup}
              onChangeText={(text) => {
                setPickup(text);
                setActiveInput('pickup');
                fetchLiveSuggestions(text);
              }}
              onFocus={() => {
                setActiveInput('pickup');
                if (sheetState === 'collapsed') snapSheetTo('middle');
              }}
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              className="flex-1 text-xs font-normal"
            />
            {/* Switching between Clear/Cancel and Map Location Icon */}
            {pickup ? (
              <TouchableOpacity onPress={() => setPickup('')} className="p-1">
                <Ionicons name="close-circle" size={17} color="#ef4444" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  handlePickOnMap();
                  if (sheetState === 'collapsed') snapSheetTo('middle');
                }}
                className="p-1"
              >
                <Ionicons name="location" size={17} color="#10b981" />
              </TouchableOpacity>
            )}
          </View>
          {activeInput === 'pickup' && renderSuggestions()}

          {/* CENTER ADD STOP ACTION BAR */}
          <View className="my-2 flex-row items-center justify-center">
            <View className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
            <TouchableOpacity
              onPress={addStop}
              className="mx-3 flex-row items-center py-1.5 px-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 active:bg-emerald-500/20"
            >
              <Ionicons name="add-circle" size={14} color="#10b981" style={{ marginRight: 4 }} />
              <Text className="text-emerald-500 font-normal text-xs">
                + Add Stop (Stop & Continue)
              </Text>
            </TouchableOpacity>
            <View className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
          </View>

          {/* ITINERARY STOPS (STOP & CONTINUE) */}
          {stops.map((stopItem, index) => (
            <View key={stopItem.id} className="mb-1.5">
              <View
                style={{
                  backgroundColor: isDark ? '#121927' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="flex-row items-center border rounded-2xl px-3.5 py-2.5 shadow-sm"
              >
                <View className="w-3.5 h-3.5 rounded-full bg-sky-500 mr-2.5 items-center justify-center">
                  <Text className="text-[8px] text-white font-normal">{index + 1}</Text>
                </View>
                <TextInput
                  placeholder={`Stop ${index + 1} / Destination spot`}
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  value={stopItem.address}
                  onChangeText={(text) => updateStop(stopItem.id, text)}
                  onFocus={() => {
                    if (sheetState === 'collapsed') snapSheetTo('middle');
                  }}
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  className="flex-1 text-xs font-normal"
                />
                {stopItem.address ? (
                  <TouchableOpacity onPress={() => updateStop(stopItem.id, '')} className="p-1 mr-1">
                    <Ionicons name="close-circle" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => updateStop(stopItem.id, 'Chauffeur Destination Pin')}
                    className="p-1 mr-1"
                  >
                    <Ionicons name="location" size={16} color="#0284c7" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => removeStop(stopItem.id)} className="p-1">
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* QUICK SNAP CHEVRON IN COLLAPSED */}
          {sheetState === 'collapsed' ? (
            <TouchableOpacity
              onPress={() => snapSheetTo('middle')}
              className="flex-row items-center justify-center mt-2 py-1 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 self-center"
            >
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="font-normal text-[11px] mr-1">
                Hire Options
              </Text>
              <Ionicons name="chevron-up" size={12} color={isDark ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* EXPANDED / MIDDLE SCROLLABLE HIRE FORM (ONLY VISIBLE WHEN EXPANDED OR MIDDLE) */}
        {sheetState !== 'collapsed' ? (
          <ScrollView
            className="flex-1 px-4 pt-1"
            contentContainerStyle={{ paddingBottom: 110 }}
            bounces={true}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* HIRE TYPE: DRIVER ONLY vs DRIVER + CAR */}
            <View className="flex-row space-x-3 mb-6">
              <TouchableOpacity
                onPress={() => setHireType('Driver only')}
                style={{
                  backgroundColor: hireType === 'Driver only'
                    ? isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5'
                    : isDark ? '#121927' : '#ffffff',
                  borderColor: hireType === 'Driver only' ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                  borderWidth: hireType === 'Driver only' ? 2 : 1,
                }}
                className="flex-1 py-4 px-3 rounded-2xl shadow-sm items-center justify-center relative overflow-hidden"
              >
                {hireType === 'Driver only' && (
                  <View className="absolute top-2.5 right-2.5">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  </View>
                )}
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                  style={{
                    backgroundColor: hireType === 'Driver only'
                      ? '#10b981'
                      : isDark
                      ? '#1e293b'
                      : '#f1f5f9',
                  }}
                >
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color={hireType === 'Driver only' ? '#ffffff' : isDark ? '#94a3b8' : '#475569'}
                  />
                </View>
                <Text
                  style={{ color: hireType === 'Driver only' ? '#10b981' : isDark ? '#ffffff' : '#0f172a' }}
                  className="font-normal text-sm text-center"
                >
                  Driver Only
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px] text-center mt-0.5">
                  Drive my own car
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setHireType('Driver + car')}
                style={{
                  backgroundColor: hireType === 'Driver + car'
                    ? isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5'
                    : isDark ? '#121927' : '#ffffff',
                  borderColor: hireType === 'Driver + car' ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                  borderWidth: hireType === 'Driver + car' ? 2 : 1,
                }}
                className="flex-1 py-4 px-3 rounded-2xl shadow-sm items-center justify-center relative overflow-hidden"
              >
                {hireType === 'Driver + car' && (
                  <View className="absolute top-2.5 right-2.5">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  </View>
                )}
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                  style={{
                    backgroundColor: hireType === 'Driver + car'
                      ? '#10b981'
                      : isDark
                      ? '#1e293b'
                      : '#f1f5f9',
                  }}
                >
                  <Ionicons
                    name="car-outline"
                    size={22}
                    color={hireType === 'Driver + car' ? '#ffffff' : isDark ? '#94a3b8' : '#475569'}
                  />
                </View>
                <Text
                  style={{ color: hireType === 'Driver + car' ? '#10b981' : isDark ? '#ffffff' : '#0f172a' }}
                  className="font-normal text-sm text-center"
                >
                  Driver + Car
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px] text-center mt-0.5">
                  Driver brings vehicle
                </Text>
              </TouchableOpacity>
            </View>

            {/* CHOOSE A VEHICLE (WHEN DRIVER + CAR): EXECUTIVE VIP + 3 CENTERED ICONS */}
            {hireType === 'Driver + car' && (
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-2.5 px-1">
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm tracking-tight">
                    Choose a Vehicle
                  </Text>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs">
                    Inspected & Fuel Ready
                  </Text>
                </View>

                {/* Centered 3-Column Vehicle Layout */}
                <View className="flex-row justify-between space-x-2.5 w-full">
                  {vehicleOptions.map((v) => {
                    const isSelected = hireVehicleType === v.id;
                    return (
                      <TouchableOpacity
                        key={v.id}
                        onPress={() => setHireVehicleType(v.id)}
                        style={{
                          backgroundColor: isSelected
                            ? isDark
                              ? 'rgba(16,185,129,0.12)'
                              : '#ecfdf5'
                            : isDark
                            ? '#121927'
                            : '#ffffff',
                          borderColor: isSelected ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                          borderWidth: isSelected ? 2 : 1,
                        }}
                        className="flex-1 py-3.5 px-1.5 rounded-2xl items-center justify-center shadow-sm"
                      >
                        {/* Centered Vehicle Icon */}
                        <View
                          className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                          style={{
                            backgroundColor: isSelected
                              ? '#10b981'
                              : isDark
                              ? '#1e293b'
                              : '#f1f5f9',
                          }}
                        >
                          <Ionicons
                            name={v.icon}
                            size={24}
                            color={isSelected ? '#ffffff' : isDark ? '#94a3b8' : '#475569'}
                          />
                        </View>

                        {/* Centered Label */}
                        <Text
                          style={{
                            color: isSelected ? '#10b981' : isDark ? '#ffffff' : '#0f172a',
                          }}
                          className="font-normal text-center text-xs tracking-tight"
                          numberOfLines={1}
                        >
                          {v.name}
                        </Text>
                        <Text
                          style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                          className="text-[10px] text-center mt-0.5 font-normal"
                          numberOfLines={1}
                        >
                          {v.desc}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ENGAGEMENT DURATION SELECTOR */}
            <View className="mb-6">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm tracking-tight mb-2.5 px-1">
                Engagement
              </Text>
              <View className="flex-row space-x-2">
                {['Hourly', 'Daily', 'Weekly', 'Monthly / Full-Time'].map((type) => {
                  const isSelected = engagement === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setEngagement(type)}
                      style={{
                        backgroundColor: isSelected
                          ? '#10b981'
                          : isDark
                          ? '#121927'
                          : '#ffffff',
                        borderColor: isSelected ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                      }}
                      className="flex-1 py-2.5 px-1 rounded-2xl items-center justify-center border shadow-sm"
                    >
                      <Text
                        className="font-normal text-center text-[11px]"
                        style={{ color: isSelected ? '#ffffff' : isDark ? '#94a3b8' : '#475569' }}
                      >
                        {type.replace(' / ', '\n')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* UNIFIED ROW: DURATION & SCHEDULE IN ONE LINE */}
            <View className="mb-6">
              <View className="flex-row space-x-3 items-stretch">
                {/* Left Card: Number of Days / Duration Stepper */}
                <View
                  style={{
                    backgroundColor: isDark ? '#121927' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="flex-1 p-3 rounded-2xl border shadow-sm justify-between"
                >
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="font-normal text-[11px] mb-1.5" numberOfLines={1}>
                    Duration ({engagement === 'Hourly' ? 'Hours' : engagement === 'Daily' ? 'Days' : engagement === 'Weekly' ? 'Weeks' : 'Months'})
                  </Text>

                  <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                      onPress={() => adjustDuration(-1)}
                      className="w-8 h-8 rounded-lg bg-emerald-500/10 items-center justify-center border border-emerald-500/20"
                    >
                      <Ionicons name="remove" size={16} color="#10b981" />
                    </TouchableOpacity>

                    <View className="items-center px-1">
                      <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-lg">
                        {hireDuration}
                      </Text>
                      <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[9px] uppercase font-normal">
                        {engagement === 'Hourly' ? (hireDuration === 1 ? 'Hour' : 'Hours') : engagement === 'Daily' ? (hireDuration === 1 ? 'Day' : 'Days') : engagement === 'Weekly' ? (hireDuration === 1 ? 'Week' : 'Weeks') : (hireDuration === 1 ? 'Month' : 'Months')}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => adjustDuration(1)}
                      className="w-8 h-8 rounded-lg bg-emerald-500/10 items-center justify-center border border-emerald-500/20"
                    >
                      <Ionicons name="add" size={16} color="#10b981" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Right Card: Schedule Toggle Button */}
                <TouchableOpacity
                  onPress={() => setShowScheduleMenu(!showScheduleMenu)}
                  style={{
                    backgroundColor: isDark ? '#121927' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="flex-1 p-3 rounded-2xl border shadow-sm justify-between"
                >
                  <View className="flex-row items-center justify-between">
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="font-normal text-[11px]">
                      Schedule
                    </Text>
                    <Ionicons
                      name={showScheduleMenu ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color="#10b981"
                    />
                  </View>

                  <View className="flex-row items-center mt-1">
                    <View className="w-7 h-7 rounded-lg bg-emerald-500/15 items-center justify-center mr-2">
                      <Ionicons name="calendar-outline" size={15} color="#10b981" />
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs" numberOfLines={1}>
                        {scheduleType === 'Now' ? 'Starts Now' : scheduleType}
                      </Text>
                      <Text style={{ color: '#10b981' }} className="text-[10px] font-normal" numberOfLines={1}>
                        {scheduleType === 'Now' ? 'Immediate' : hireStartDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Collapsible Options Container */}
              {showScheduleMenu && (
                <View
                  style={{
                    backgroundColor: isDark ? '#0b111e' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="p-3.5 rounded-2xl border shadow-sm space-y-3 mt-1"
                >
                  {/* Flexible Quick Presets */}
                  <View className="flex-row space-x-2">
                    <TouchableOpacity
                      onPress={() => applySchedulePreset('Now')}
                      style={{
                        backgroundColor: scheduleType === 'Now'
                          ? isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5'
                          : isDark ? '#121927' : '#ffffff',
                        borderColor: scheduleType === 'Now' ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                      }}
                      className="flex-1 py-2 rounded-xl items-center justify-center border flex-row"
                    >
                      <Ionicons
                        name="flash"
                        size={13}
                        color={scheduleType === 'Now' ? '#10b981' : isDark ? '#94a3b8' : '#64748b'}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={{
                          color: scheduleType === 'Now' ? '#10b981' : isDark ? '#ffffff' : '#0f172a',
                        }}
                        className="font-normal text-xs uppercase"
                      >
                        Now
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => applySchedulePreset('Tomorrow')}
                      style={{
                        backgroundColor: scheduleType === 'Tomorrow'
                          ? isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5'
                          : isDark ? '#121927' : '#ffffff',
                        borderColor: scheduleType === 'Tomorrow' ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                      }}
                      className="flex-1 py-2 rounded-xl items-center justify-center border"
                    >
                      <Text
                        style={{
                          color: scheduleType === 'Tomorrow' ? '#10b981' : isDark ? '#ffffff' : '#0f172a',
                        }}
                        className="font-normal text-xs text-center"
                      >
                        Tomorrow 8am
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => applySchedulePreset('Next Monday')}
                      style={{
                        backgroundColor: scheduleType === 'Next Monday'
                          ? isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5'
                          : isDark ? '#121927' : '#ffffff',
                        borderColor: scheduleType === 'Next Monday' ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                      }}
                      className="flex-1 py-2 rounded-xl items-center justify-center border"
                    >
                      <Text
                        style={{
                          color: scheduleType === 'Next Monday' ? '#10b981' : isDark ? '#ffffff' : '#0f172a',
                        }}
                        className="font-normal text-xs text-center"
                      >
                        Next Monday
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Start Date & Time Status Bar */}
                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        setShowDatePickerModal(true);
                      } else {
                        setShowNativePicker(true);
                      }
                    }}
                    style={{
                      backgroundColor: scheduleType === 'Custom'
                        ? isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5'
                        : isDark ? '#121927' : '#f8fafc',
                      borderColor: scheduleType === 'Custom' ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                    }}
                    className="py-2.5 px-3.5 rounded-xl items-center justify-between flex-row border shadow-sm mt-2"
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={scheduleType === 'Custom' ? '#10b981' : '#64748b'}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                        className="font-normal text-xs"
                      >
                        {scheduleType === 'Now'
                          ? 'Service Starts: Immediately (Now)'
                          : `Service Starts: ${hireStartDate.toLocaleDateString([], {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })} at ${hireStartDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </Text>
                    </View>

                    <Text className="text-emerald-500 font-normal text-xs">
                      {scheduleType === 'Custom' ? 'Custom' : 'Edit'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* SPECIAL INSTRUCTIONS / NOTES */}
            <View className="mb-6">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm tracking-tight mb-2 px-1">
                Instructions / Preferences
              </Text>
              <View
                style={{
                  backgroundColor: isDark ? '#121927' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="border rounded-2xl p-3.5 min-h-[90px] shadow-sm"
              >
                <TextInput
                  multiline
                  placeholder="e.g. Manual transmission expert needed, school runs, airport pickup, out-of-state trip..."
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  value={hireNotes}
                  onChangeText={setHireNotes}
                  style={{ color: isDark ? '#ffffff' : '#0f172a', textAlignVertical: 'top' }}
                  className="text-xs"
                />
              </View>
            </View>

            {/* SUGGESTED PRICE & COUNTER-OFFER BIDDING CARD */}
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#052e16',
                borderColor: isDark ? '#1e293b' : '#0a5c25',
              }}
              className="rounded-3xl p-5 mb-6 border shadow-xl"
            >
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="sparkles" size={16} color="#34d399" />
                  <Text className="text-emerald-300 text-xs font-bold uppercase tracking-wider ml-1.5">
                    Suggested Package Fare
                  </Text>
                </View>
                <Text className="text-emerald-300 font-bold text-sm">
                  ₦{hireSuggestedPrice.toLocaleString()}
                </Text>
              </View>

              <Text className="text-white text-xs font-medium mb-2 text-center opacity-80">
                You offer: Set your budget
              </Text>

              {/* Offer Stepper */}
              <View className="flex-row justify-between items-center my-1 bg-black/20 p-2 rounded-2xl">
                <TouchableOpacity
                  onPress={() => adjustPrice(-1000)}
                  className="w-12 h-12 bg-white/10 active:bg-white/20 rounded-xl items-center justify-center border border-white/15"
                >
                  <Ionicons name="remove" size={24} color="#ffffff" />
                </TouchableOpacity>

                <Text className="text-white font-black text-3xl tracking-tight">
                  ₦{(usePointsDiscount ? Math.max(2000, hireOfferPrice - pointsDiscountValue) : hireOfferPrice).toLocaleString()}
                </Text>

                <TouchableOpacity
                  onPress={() => adjustPrice(1000)}
                  className="w-12 h-12 bg-white/10 active:bg-white/20 rounded-xl items-center justify-center border border-white/15"
                >
                  <Ionicons name="add" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {usePointsDiscount ? (
                <View className="bg-emerald-400/20 py-1.5 px-3 rounded-xl border border-emerald-400/30 flex-row items-center justify-center mt-2 mb-1">
                  <Ionicons name="checkmark-circle" size={14} color="#34d399" style={{ marginRight: 4 }} />
                  <Text className="text-emerald-300 font-bold text-[11px]">
                    ₦2,000 Points Discount Applied (Original: ₦{hireOfferPrice.toLocaleString()})
                  </Text>
                </View>
              ) : null}

              {/* OgaPoints Rewards & Redemption Toggle for Hire */}
              <View className="mt-3 pt-3 border-t border-emerald-500/20 flex-row items-center justify-between">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center">
                    <Ionicons name="sparkles" size={14} color="#34d399" style={{ marginRight: 4 }} />
                    <Text className="text-emerald-300 font-normal text-xs">
                      Redeem 2,000 pts (Save ₦2,000)
                    </Text>
                  </View>
                  <Text className="text-white text-[10px] mt-0.5 font-normal">
                    Balance: {userPoints.toLocaleString()} pts • Earn +{pointsToEarn} pts on this hire
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    if (!usePointsDiscount && userPoints < pointsDiscountValue) {
                      Alert.alert(
                        'Points Balance',
                        `You have ${userPoints.toLocaleString()} points. You need at least 2,000 points to redeem a ₦2,000 hire discount.`
                      );
                      return;
                    }
                    setUsePointsDiscount(!usePointsDiscount);
                  }}
                  style={{
                    backgroundColor: usePointsDiscount ? '#10b981' : 'rgba(255,255,255,0.15)',
                    borderColor: usePointsDiscount ? '#34d399' : 'rgba(255,255,255,0.25)',
                  }}
                  className="px-3 py-1.5 rounded-xl border items-center justify-center"
                >
                  <Text className="text-white font-normal text-xs">
                    {usePointsDiscount ? 'Applied ✓' : 'Use Points'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-white text-[11px] text-center mt-3 font-normal">
                Verified drivers in your area can accept this package or submit counter proposals.
              </Text>
            </View>

            {/* PAYMENT METHOD SELECTION */}
            <View className="mb-6">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm tracking-tight mb-2.5 px-1">
                Payment Option
              </Text>
              <View className="flex-row space-x-2.5">
                {[
                  { id: 'Cash', icon: 'cash-outline', label: 'Cash' },
                  { id: 'Bank transfer', icon: 'swap-horizontal-outline', label: 'Transfer' },
                  { id: 'Wallet', icon: 'wallet-outline', label: 'In-App Wallet' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setHirePaymentMethod(item.id)}
                    style={{
                      backgroundColor: hirePaymentMethod === item.id
                        ? isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5'
                        : isDark ? '#121927' : '#ffffff',
                      borderColor: hirePaymentMethod === item.id ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                      borderWidth: hirePaymentMethod === item.id ? 2 : 1,
                    }}
                    className="flex-1 py-3 rounded-2xl items-center justify-center flex-row shadow-sm"
                  >
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={hirePaymentMethod === item.id ? '#10b981' : isDark ? '#94a3b8' : '#64748b'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        color: hirePaymentMethod === item.id ? '#10b981' : isDark ? '#ffffff' : '#0f172a',
                      }}
                      className="font-bold text-xs"
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* PRIMARY ACTION: REQUEST DRIVER HIRE */}
            <TouchableOpacity
              onPress={handleRequestHire}
              className="w-full py-4 rounded-2xl bg-emerald-500 active:bg-emerald-600 items-center justify-center shadow-xl shadow-emerald-500/25 flex-row mb-6"
            >
              <Ionicons name="send" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text className="text-white font-normal text-base uppercase tracking-wider">
                Request Driver Hire
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : null}
      </Animated.View>

      {/* CHAUFFEUR HIRE TRIP SUMMARY MODAL */}
      <Modal visible={showTripSummaryModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{
              backgroundColor: isDark ? '#090d16' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="rounded-t-3xl p-6 border-t"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Ionicons name="document-text-outline" size={22} color="#10b981" style={{ marginRight: 8 }} />
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-lg font-normal tracking-tight">
                  Chauffeur Hire Trip Summary
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowTripSummaryModal(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Reporting & Itinerary Card */}
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#f8fafc',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="p-4 rounded-2xl border mb-4"
            >
              {/* Pickup / Reporting Spot */}
              <View className="flex-row items-start mb-3">
                <View className="w-3.5 h-3.5 rounded-full bg-emerald-500 mr-3 mt-0.5 items-center justify-center">
                  <View className="w-1.5 h-1.5 rounded-full bg-white" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal uppercase">
                    Reporting Spot
                  </Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal">
                    {pickup || 'Reporting Spot'}
                  </Text>
                </View>
              </View>

              {/* Itinerary Stops */}
              {stops.map((s, idx) => (
                <View key={s.id} className="flex-row items-start mb-3 pl-0.5">
                  <View className="w-3.5 h-3.5 rounded-full bg-sky-500 mr-3 mt-0.5 items-center justify-center">
                    <Text className="text-[8px] text-white font-normal">{idx + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal uppercase">
                      Itinerary Stop {idx + 1} (Stop & Continue)
                    </Text>
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal">
                      {s.address || `Stop ${idx + 1}`}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Hire Engagement details */}
              <View className="flex-row items-start">
                <View className="w-3.5 h-3.5 rounded-full bg-amber-500 mr-3 mt-0.5 items-center justify-center">
                  <View className="w-1.5 h-1.5 rounded-full bg-white" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal uppercase">
                    Engagement & Service Type
                  </Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal">
                    {`${hireType} • ${engagement} (${hireDuration} ${engagement === 'Hourly' ? 'hr' : engagement === 'Daily' ? 'day' : engagement === 'Weekly' ? 'wk' : 'mo'}${parseInt(hireDuration, 10) > 1 ? 's' : ''})`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Hire Summary Grid */}
            <View className="flex-row space-x-2 mb-4">
              <View
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="flex-1 p-3 rounded-2xl border items-center"
              >
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal">
                  Chauffeur
                </Text>
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal mt-0.5">
                  {hireType === 'Driver + car' ? hireVehicleType : 'Driver Only'}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="flex-1 p-3 rounded-2xl border items-center"
              >
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal">
                  Reporting
                </Text>
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal mt-0.5">
                  {scheduleType === 'Now' ? 'Start Now' : 'Scheduled'}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="flex-1 p-3 rounded-2xl border items-center"
              >
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal">
                  Payment
                </Text>
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal mt-0.5">
                  {hirePaymentMethod}
                </Text>
              </View>
            </View>

            {/* Fare & Rewards Row */}
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#ecfdf5',
                borderColor: '#10b981',
              }}
              className="p-3.5 rounded-2xl border flex-row items-center justify-between mb-5"
            >
              <View>
                <Text style={{ color: isDark ? '#94a3b8' : '#047857' }} className="text-[11px] font-normal">
                  Total Chauffeur Package
                </Text>
                <Text className="text-emerald-500 text-lg font-normal">
                  ₦{(usePointsDiscount ? Math.max(2000, hireOfferPrice - pointsDiscountValue) : hireOfferPrice).toLocaleString()}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-emerald-600 text-[11px] font-normal">
                  +{pointsToEarn} OgaPoints Cashback
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal">
                  {stops.length > 0 ? `${stops.length} stop(s) logged` : 'Single location'}
                </Text>
              </View>
            </View>

            {/* Confirm & Dispatch Button */}
            <TouchableOpacity
              onPress={dispatchHireConfirmed}
              className="w-full py-4 rounded-2xl bg-emerald-500 active:bg-emerald-600 items-center justify-center shadow-xl shadow-emerald-500/25 flex-row"
            >
              <Ionicons name="checkmark-circle" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text className="text-white font-normal text-sm uppercase tracking-wider">
                Confirm & Request Chauffeur Hire
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FLEXIBLE DATE PICKER MODAL */}
      <Modal visible={showDatePickerModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{
              backgroundColor: isDark ? '#090d16' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="rounded-t-3xl p-6 border-t"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-lg font-black tracking-tight">
                Flexible Hire Start Date
              </Text>
              <TouchableOpacity onPress={() => setShowDatePickerModal(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-4">
              Select when you need your chauffeur to report for duty:
            </Text>

            {/* Presets */}
            <View className="flex-row space-x-2 mb-4">
              <TouchableOpacity
                onPress={() => {
                  applySchedulePreset('Now');
                  setShowDatePickerModal(false);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500 items-center"
              >
                <Text className="text-emerald-500 font-bold text-xs">Start Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  applySchedulePreset('Tomorrow');
                  setShowDatePickerModal(false);
                }}
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="flex-1 py-3 rounded-xl border items-center"
              >
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs">
                  Tomorrow 8am
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  applySchedulePreset('Next Monday');
                  setShowDatePickerModal(false);
                }}
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="flex-1 py-3 rounded-xl border items-center"
              >
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs">
                  Next Monday
                </Text>
              </TouchableOpacity>
            </View>

            {/* Time Adjusters */}
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs mb-2">
              Preferred Reporting Hour:
            </Text>
            <View className="flex-row space-x-2 mb-6">
              {[
                { label: 'Morning (7:30 AM)', h: 7, m: 30 },
                { label: 'Business (9:00 AM)', h: 9, m: 0 },
                { label: 'Mid-Day (1:00 PM)', h: 13, m: 0 },
              ].map((t) => (
                <TouchableOpacity
                  key={t.label}
                  onPress={() => {
                    const d = new Date(hireStartDate);
                    d.setHours(t.h, t.m, 0, 0);
                    setHireStartDate(d);
                    setScheduleType('Custom');
                    setShowDatePickerModal(false);
                  }}
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f1f5f9',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="flex-1 p-2.5 rounded-xl border items-center"
                >
                  <Text
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    className="font-bold text-[10px] text-center"
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => {
                applySchedulePreset('Now');
                setShowDatePickerModal(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 items-center justify-center"
            >
              <Text className="text-white font-black text-sm uppercase">Reset to Immediate (Now)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NATIVE DATETIMEPICKER (iOS/Android) */}
      {showNativePicker && Platform.OS !== 'web' && DateTimePicker && (
        <DateTimePicker
          value={hireStartDate}
          mode="datetime"
          display="default"
          onChange={onNativeDateChange}
        />
      )}
    </SafeAreaView>
  );
}