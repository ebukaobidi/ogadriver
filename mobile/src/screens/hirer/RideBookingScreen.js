import React, { useState } from 'react';
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

let MapView, Marker, Polyline, PROVIDER_GOOGLE;
let DateTimePicker;
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    Polyline = Maps.Polyline;
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

export default function RideBookingScreen({ navigation }) {
  const { isDark, themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [activeInput, setActiveInput] = useState(null);

  // Intermediate stops (Stop & Continue)
  const [stops, setStops] = useState([]); // [{ id: string, address: string }]
  const [showTripSummaryModal, setShowTripSummaryModal] = useState(false);

  // Vehicle choices: Economy, Comfort, Executive VIP (Centred layout)
  const [selectedVehicle, setSelectedVehicle] = useState('Economy');
  const [suggestedPrice, setSuggestedPrice] = useState(3900);
  const [offerPrice, setOfferPrice] = useState(3900);

  // Stop & continue management
  const addStop = () => {
    if (stops.length >= 3) {
      Alert.alert('Maximum Stops', 'You can add up to 3 intermediate stops along your route.');
      return;
    }
    const newStopId = String(Date.now());
    setStops((prev) => [...prev, { id: newStopId, address: '' }]);
    // Adding a stop adds modest stop fare
    setSuggestedPrice((p) => p + 800);
    setOfferPrice((p) => p + 800);
  };

  const removeStop = (id) => {
    setStops((prev) => prev.filter((s) => s.id !== id));
    setSuggestedPrice((p) => Math.max(2000, p - 800));
    setOfferPrice((p) => Math.max(2000, p - 800));
  };

  const updateStop = (id, text) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, address: text } : s)));
  };

  // OgaPoints Rewards & Discount
  const [userPoints, setUserPoints] = useState(1250);
  const [usePointsDiscount, setUsePointsDiscount] = useState(false);
  const pointsDiscountValue = 1000; // ₦1,000 discount per 1,000 pts
  const pointsToEarn = Math.max(25, Math.round(offerPrice / 100));

  React.useEffect(() => {
    loyaltyService.getPoints().then(setUserPoints).catch(() => {});
  }, []);

  // Schedule states: 'Now' vs flexible presets & custom date/time (When)
  const [scheduleType, setScheduleType] = useState('Now'); // 'Now' | '+15m' | '+30m' | '+1h' | 'Custom'
  const [date, setDate] = useState(new Date());
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showNativePicker, setShowNativePicker] = useState(false);
  const [showWhenMenu, setShowWhenMenu] = useState(false);

  // Payment methods
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const [pickupCoord, setPickupCoord] = useState({ latitude: 9.1066, longitude: 7.4111 });
  const [dropoffCoord, setDropoffCoord] = useState({ latitude: 9.0765, longitude: 7.4753 });
  const region = {
    latitude: 9.0915,
    longitude: 7.4432,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const [searchResults, setSearchResults] = useState([
    { id: '1', title: 'Victoria Island, Lagos, Nigeria', lat: 6.4281, lon: 3.4219 },
    { id: '2', title: 'Lekki Phase 1, Lagos, Nigeria', lat: 6.4474, lon: 3.4723 },
    { id: '3', title: 'Maitama, Abuja, Nigeria', lat: 9.0882, lon: 7.4934 },
    { id: '4', title: 'Gwarinpa Estate, Abuja, Nigeria', lat: 9.1100, lon: 7.3900 },
    { id: '5', title: 'Ikeja City Mall, Lagos', lat: 6.6190, lon: 3.3580 },
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

  // Bolt-style Bottom Sheet Animation & Snapping
  const { height: screenHeight } = Dimensions.get('window');
  // Snap points (height from bottom)
  const SNAP_COLLAPSED = Math.max(180, Math.round(screenHeight * 0.25));
  const SNAP_MIDDLE = Math.round(screenHeight * 0.60); // Middle height (60%)
  const SNAP_EXPANDED = Math.round(screenHeight * 0.88); // Full top screen (88%)

  const [sheetState, setSheetState] = useState('middle'); // Open at middle so user sees vehicle choices & CTA immediately
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

  const vehicleOptions = [
    { id: 'Economy', name: 'Economy', price: 3900, icon: 'car-outline', desc: 'Standard 4-seater' },
    { id: 'Comfort', name: 'Comfort', price: 6500, icon: 'car-sport-outline', desc: 'Air-conditioned Sedan' },
    { id: 'Executive', name: 'VIP Luxury', price: 25000, icon: 'diamond', desc: 'Premium Chauffeur Fleet' },
  ];

  const handleSelectVehicle = (v) => {
    setSelectedVehicle(v.id);
    setSuggestedPrice(v.price);
    setOfferPrice(v.price);
  };

  const adjustPrice = (amount) => {
    setOfferPrice((prev) => Math.max(1000, prev + amount));
  };

  const applySchedulePreset = (preset) => {
    setScheduleType(preset);
    const newDate = new Date();
    if (preset === 'Now') {
      setDate(newDate);
    } else if (preset === '+15m') {
      newDate.setMinutes(newDate.getMinutes() + 15);
      setDate(newDate);
    } else if (preset === '+30m') {
      newDate.setMinutes(newDate.getMinutes() + 30);
      setDate(newDate);
    } else if (preset === '+1h') {
      newDate.setHours(newDate.getHours() + 1);
      setDate(newDate);
    }
  };

  const handleCustomDateOffset = (daysAhead, hoursAhead = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    if (hoursAhead !== 0) {
      d.setHours(d.getHours() + hoursAhead);
    }
    setDate(d);
    setScheduleType('Custom');
  };

  const onNativeDateChange = (event, selectedDate) => {
    setShowNativePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      setScheduleType('Custom');
    }
  };

  const handleRequestRide = () => {
    if (!pickup || !dropoff) {
      Alert.alert('Missing Location', 'Please enter both pickup and destination locations.');
      return;
    }
    // Show Trip Summary review modal before dispatching
    setShowTripSummaryModal(true);
  };

  const dispatchRideConfirmed = async () => {
    setShowTripSummaryModal(false);
    try {
      const finalFare = usePointsDiscount ? Math.max(1000, offerPrice - pointsDiscountValue) : offerPrice;
      const stopAddresses = stops.map((s) => s.address).filter(Boolean);
      const combinedNotes = stopAddresses.length > 0 ? `Intermediate stops: ${stopAddresses.join(' -> ')}` : null;

      await bookingService.createBooking({
        booking_mode: 'open_ride',
        pickup_location: pickup || 'Pickup Point',
        dropoff_location: dropoff || 'Destination',
        pickup_latitude: pickupCoord.latitude,
        pickup_longitude: pickupCoord.longitude,
        dropoff_latitude: dropoffCoord.latitude,
        dropoff_longitude: dropoffCoord.longitude,
        agreed_rate: finalFare,
        offer_price: finalFare,
        vehicle_type: selectedVehicle?.toLowerCase() || 'standard',
        payment_method: paymentMethod.toLowerCase(),
        notes: combinedNotes,
        is_scheduled: scheduleType !== 'Now',
        scheduled_at: scheduleType === 'Now' ? null : date.toISOString(),
      });

      if (usePointsDiscount) {
        await loyaltyService.redeemPoints(pointsDiscountValue, `Redeemed for ₦1,000 off Ride Booking`);
        setUserPoints((prev) => Math.max(0, prev - pointsDiscountValue));
        setUsePointsDiscount(false);
      }
      await loyaltyService.earnPoints(pointsToEarn, `Ride cashback (+${pointsToEarn} pts)`);
      setUserPoints((prev) => prev + pointsToEarn);

      Alert.alert(
        'Ride Dispatched!',
        `Broadcast sent to nearby drivers.${usePointsDiscount ? ' ₦1,000 points discount was applied!' : ''}\nYou earned +${pointsToEarn} OgaPoints on this booking!`
      );
    } catch (err) {
      console.log('Ride booking dispatch error:', err);
      const errorMsg = err.response?.data?.message || 'Broadcast sent to available verified drivers in your zone.';
      Alert.alert('Trip Broadcast Status', errorMsg);
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
              if (activeInput === 'dropoff') {
                setDropoff(item.title);
                if (item.lat && item.lon) setDropoffCoord({ latitude: item.lat, longitude: item.lon });
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
        <TouchableOpacity
          onPress={() => navigation.goBack ? navigation.goBack() : navigation.navigate('NaijaHirerHome')}
          style={{
            backgroundColor: isDark ? 'rgba(18,25,39,0.92)' : 'rgba(255,255,255,0.95)',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="w-11 h-11 rounded-2xl border items-center justify-center shadow-lg shadow-black/10"
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? '#ffffff' : '#0f172a'} />
        </TouchableOpacity>

        <View
          style={{
            backgroundColor: isDark ? 'rgba(18,25,39,0.92)' : 'rgba(255,255,255,0.95)',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="flex-row items-center px-3.5 py-2 rounded-2xl border shadow-lg shadow-black/10"
        >
          <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs mr-2">
            OgaDriver Ride
          </Text>
          <View className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
            <Text className="text-[9px] font-normal uppercase text-emerald-500">Live Map</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('NaijaHirerHome')}
          style={{
            backgroundColor: isDark ? 'rgba(18,25,39,0.92)' : 'rgba(255,255,255,0.95)',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="px-3.5 h-11 rounded-2xl border items-center justify-center flex-row shadow-lg shadow-black/10"
        >
          <Ionicons name="storefront-outline" size={16} color="#10b981" style={{ marginRight: 4 }} />
          <Text className="text-emerald-500 font-normal text-xs">Market</Text>
        </TouchableOpacity>
      </View>

      {/* FULL-SCREEN BOLT BACKGROUND MAP CANVAS (80%+ Screen View) */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} className="bg-[#f8fafc]">
        {Platform.OS !== 'web' && MapView ? (
          <MapView
            style={{ width: '100%', height: '100%' }}
            initialRegion={region}
            customMapStyle={WHITE_GOOGLE_MAP_STYLE}
          >
            {pickup && <Marker coordinate={pickupCoord} pinColor="#008751" title="Pickup Spot" />}
            {dropoff && <Marker coordinate={dropoffCoord} pinColor="#ea4335" title="Destination" />}
            {pickup && dropoff && (
              <Polyline
                coordinates={[pickupCoord, dropoffCoord]}
                strokeColor="#008751"
                strokeWidth={5}
              />
            )}
          </MapView>
        ) : (
          // Clean Minimalist White Google Maps Canvas
          <View className="flex-1 w-full bg-[#f8fafc] items-center justify-center relative overflow-hidden">
            {/* Street Cartography Roads (Crisp White / Light Silver) */}
            <View className="absolute inset-0">
              <View className="absolute w-full h-10 bg-white top-1/4 -rotate-12 border-y border-slate-200/80" />
              <View className="absolute w-full h-12 bg-white top-1/2 rotate-6 border-y border-slate-200/80" />
              <View className="absolute h-full w-10 bg-white left-1/3 rotate-12 border-x border-slate-200/80" />
              <View className="absolute h-full w-12 bg-white right-1/4 -rotate-6 border-x border-slate-200/80" />
              <View className="absolute w-44 h-36 bg-emerald-50/60 rounded-3xl top-16 left-8 border border-emerald-100/70" />
              <View className="absolute w-52 h-32 bg-sky-50/70 rounded-full top-1/3 right-6 border border-sky-100/70" />
            </View>

            {/* Simulated Clean Route Line */}
            <View className="absolute w-48 h-1.5 bg-emerald-600 rounded-full rotate-45 shadow-sm" />

            {/* Clean Floating Route Summary Card */}
            <View className="flex-row items-center space-x-4 z-10 px-4 py-3 bg-white/95 rounded-2xl border border-slate-200 shadow-md max-w-[90%] mb-20">
              <View className="items-center">
                <View className="w-7 h-7 rounded-full bg-emerald-50 border-2 border-emerald-600 items-center justify-center">
                  <Ionicons name="navigate" size={12} color="#008751" />
                </View>
                <Text className="text-slate-800 text-[10px] font-normal mt-0.5 max-w-[85px] text-center" numberOfLines={1}>
                  {pickup || 'Pickup Point'}
                </Text>
              </View>

              <View className="flex-1 items-center px-1">
                <View className="h-1 w-full bg-emerald-600 rounded-full mb-1" />
                <View className="flex-row items-center px-2 py-0.5 rounded-full bg-slate-100">
                  <Ionicons name="time-outline" size={10} color="#64748b" style={{ marginRight: 3 }} />
                  <Text className="text-slate-700 text-[9px] font-normal">
                    24 min • 14.8 km
                  </Text>
                </View>
              </View>

              <View className="items-center">
                <View className="w-7 h-7 rounded-full bg-rose-50 border-2 border-rose-500 items-center justify-center">
                  <Ionicons name="location" size={13} color="#e11d48" />
                </View>
                <Text className="text-slate-800 text-[10px] font-normal mt-0.5 max-w-[85px] text-center" numberOfLines={1}>
                  {dropoff || 'Destination'}
                </Text>
              </View>
            </View>

            {/* Floating Lagos Metro Badge */}
            <View className="absolute top-24 left-4 bg-white/90 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-slate-700 text-[10px] font-normal">
                Google Maps Live Tracking
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* BOLT-STYLE SLIDING BOTTOM SHEET */}
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

        {/* ROUTE INPUT SECTION (ALWAYS VISIBLE: STARTING SPOT, STOPS, DESTINATION & ADD STOP) */}
        <View className="px-4 pt-1 pb-2">
          {/* Pickup input */}
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
              placeholder="Where are you starting from?"
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
                  setPickup('Current GPS Location');
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
          <View className="my-1.5 flex-row items-center justify-center">
            <View className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
            <TouchableOpacity
              onPress={addStop}
              className="mx-3 flex-row items-center py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/30"
            >
              <Ionicons name="add-circle" size={13} color="#10b981" style={{ marginRight: 4 }} />
              <Text className="text-emerald-500 font-normal text-[11px]">
                + Add Stop (Stop & Continue)
              </Text>
            </TouchableOpacity>
            <View className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
          </View>

          {/* INTERMEDIATE STOPS (STOP & CONTINUE) */}
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
                  placeholder={`Stop ${index + 1} (Stop & Continue)`}
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
                    onPress={() => updateStop(stopItem.id, 'Intermediate Waypoint Pin')}
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

          {/* Dropoff input (Where to) */}
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: activeInput === 'dropoff' ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="flex-row items-center border rounded-2xl px-3.5 py-2.5 shadow-sm"
          >
            <View className="w-3.5 h-3.5 rounded-full bg-amber-500 mr-2.5 items-center justify-center">
              <View className="w-1.5 h-1.5 rounded-full bg-white" />
            </View>
            <TextInput
              placeholder="Where to? (Destination)"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              value={dropoff}
              onChangeText={(text) => {
                setDropoff(text);
                setActiveInput('dropoff');
                fetchLiveSuggestions(text);
              }}
              onFocus={() => {
                setActiveInput('dropoff');
                if (sheetState === 'collapsed') snapSheetTo('middle');
              }}
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              className="flex-1 text-xs font-normal"
            />
            {/* Switching between Clear/Cancel and Map Location Icon */}
            {dropoff ? (
              <TouchableOpacity onPress={() => setDropoff('')} className="p-1">
                <Ionicons name="close-circle" size={17} color="#ef4444" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setDropoff('Set from Map Pin');
                  if (sheetState === 'collapsed') snapSheetTo('middle');
                }}
                className="p-1"
              >
                <Ionicons name="location" size={17} color="#f59e0b" />
              </TouchableOpacity>
            )}
          </View>
          {activeInput === 'dropoff' && renderSuggestions()}

          {/* QUICK SNAP CHEVRON IN COLLAPSED */}
          {sheetState === 'collapsed' ? (
            <TouchableOpacity
              onPress={() => snapSheetTo('middle')}
              className="flex-row items-center justify-center mt-2 py-1 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 self-center"
            >
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="font-normal text-[11px] mr-1">
                View Vehicles & Pricing
              </Text>
              <Ionicons name="chevron-up" size={12} color={isDark ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* EXPANDED / MIDDLE SCROLLABLE FORM (ONLY VISIBLE WHEN EXPANDED OR MIDDLE) */}
        {sheetState !== 'collapsed' ? (
          <ScrollView
            className="flex-1 px-4 pt-1"
            contentContainerStyle={{ paddingBottom: 110 }}
            bounces={true}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* CHOOSE A VEHICLE: VIP FLEET EXECUTIVE + 3 CENTERED ICONS */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-2.5 px-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm tracking-tight">
                  Choose a Vehicle
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs">
                  All vetted drivers
                </Text>
              </View>

              {/* Centered 3-Column Vehicle Layout */}
              <View className="flex-row justify-between space-x-2.5 w-full">
                {vehicleOptions.map((v) => {
                  const isSelected = selectedVehicle === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      onPress={() => handleSelectVehicle(v)}
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

                      {/* Centered Label & Pricing */}
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
                        style={{
                          color: isSelected ? (isDark ? '#34d399' : '#059669') : isDark ? '#94a3b8' : '#64748b',
                        }}
                        className="text-[11px] font-normal mt-0.5 text-center"
                      >
                        ₦{v.price.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* SUGGESTED FARE & COUNTER-OFFER BIDDING CARD */}
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#052e16',
                borderColor: isDark ? '#1e293b' : '#0a5c25',
              }}
              className="rounded-3xl p-5 mb-6 border shadow-xl"
            >
              {/* Header row: Left side calculated distance/time, Right side closer Suggested Fare */}
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center bg-black/25 px-2.5 py-1.5 rounded-xl border border-white/10">
                  <Ionicons name="navigate-circle-outline" size={14} color="#34d399" style={{ marginRight: 4 }} />
                  <Text className="text-emerald-300 font-normal text-xs">
                    14.8 km - 24 min
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-white font-normal text-xs mr-2">
                    Suggested Fare:
                  </Text>
                  <Text className="text-emerald-300 font-normal text-sm">
                    ₦{suggestedPrice.toLocaleString()}
                  </Text>
                </View>
              </View>

              <Text className="text-white text-xs font-normal mb-2 text-center opacity-80">
                You offer: Set what you want to pay
              </Text>

              {/* Offer Stepper */}
              <View className="flex-row justify-between items-center my-1 bg-black/20 p-2 rounded-2xl">
                <TouchableOpacity
                  onPress={() => adjustPrice(-500)}
                  className="w-12 h-12 bg-white/10 active:bg-white/20 rounded-xl items-center justify-center border border-white/15"
                >
                  <Ionicons name="remove" size={24} color="#ffffff" />
                </TouchableOpacity>

                <Text className="text-white font-normal text-3xl tracking-tight">
                  ₦{(usePointsDiscount ? Math.max(1000, offerPrice - pointsDiscountValue) : offerPrice).toLocaleString()}
                </Text>

                <TouchableOpacity
                  onPress={() => adjustPrice(500)}
                  className="w-12 h-12 bg-white/10 active:bg-white/20 rounded-xl items-center justify-center border border-white/15"
                >
                  <Ionicons name="add" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {usePointsDiscount ? (
                <View className="bg-emerald-400/20 py-1.5 px-3 rounded-xl border border-emerald-400/30 flex-row items-center justify-center mt-2 mb-1">
                  <Ionicons name="checkmark-circle" size={14} color="#34d399" style={{ marginRight: 4 }} />
                  <Text className="text-emerald-300 font-normal text-[11px]">
                    ₦1,000 Points Discount Applied (Original: ₦{offerPrice.toLocaleString()})
                  </Text>
                </View>
              ) : null}

              {/* OgaPoints Rewards & Redemption Toggle */}
              <View className="mt-3 pt-3 border-t border-emerald-500/20 flex-row items-center justify-between">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center">
                    <Ionicons name="sparkles" size={14} color="#34d399" style={{ marginRight: 4 }} />
                    <Text className="text-emerald-300 font-normal text-xs">
                      Redeem 1,000 pts (Save ₦1,000)
                    </Text>
                  </View>
                  <Text className="text-white text-[10px] mt-0.5 font-normal">
                    Balance: {userPoints.toLocaleString()} pts • Earn +{pointsToEarn} pts on this trip
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    if (!usePointsDiscount && userPoints < pointsDiscountValue) {
                      Alert.alert(
                        'Points Balance',
                        `You have ${userPoints.toLocaleString()} points. You need at least 1,000 points to redeem a ₦1,000 discount.`
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
                Drivers in your radius can accept directly or send a sharp counter-offer.
              </Text>
            </View>

            {/* WHEN SECTION: WITH TOGGLE BTN FOR NEATNESS */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => setShowWhenMenu(!showWhenMenu)}
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="flex-row items-center justify-between p-3.5 rounded-2xl border shadow-sm mb-2"
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-xl bg-emerald-500/15 items-center justify-center mr-3">
                    <Ionicons name="time-outline" size={18} color="#10b981" />
                  </View>
                  <View>
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm">
                      When
                    </Text>
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px] font-normal">
                      {scheduleType === 'Now' ? 'Leave Immediately (Now)' : `Scheduled: ${scheduleType}`}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-emerald-500 font-normal text-xs mr-1.5">
                    {showWhenMenu ? 'Hide' : 'Options'}
                  </Text>
                  <Ionicons
                    name={showWhenMenu ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#10b981"
                  />
                </View>
              </TouchableOpacity>

              {/* Collapsible When Options Menu */}
              {showWhenMenu && (
                <View
                  style={{
                    backgroundColor: isDark ? '#0b111e' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="p-3.5 rounded-2xl border shadow-sm space-y-3 mt-1"
                >
                  {/* Flexible Quick Presets: Now | +15m | +30m | +1h */}
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
                      onPress={() => applySchedulePreset('+15m')}
                      style={{
                        backgroundColor: scheduleType === '+15m'
                          ? isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5'
                          : isDark ? '#121927' : '#ffffff',
                        borderColor: scheduleType === '+15m' ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                      }}
                      className="flex-1 py-2 rounded-xl items-center justify-center border"
                    >
                      <Text
                        style={{
                          color: scheduleType === '+15m' ? '#10b981' : isDark ? '#ffffff' : '#0f172a',
                        }}
                        className="font-normal text-xs text-center"
                      >
                        +15 min
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => applySchedulePreset('+30m')}
                      style={{
                        backgroundColor: scheduleType === '+30m'
                          ? isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5'
                          : isDark ? '#121927' : '#ffffff',
                        borderColor: scheduleType === '+30m' ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                      }}
                      className="flex-1 py-2 rounded-xl items-center justify-center border"
                    >
                      <Text
                        style={{
                          color: scheduleType === '+30m' ? '#10b981' : isDark ? '#ffffff' : '#0f172a',
                        }}
                        className="font-normal text-xs text-center"
                      >
                        +30 min
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => applySchedulePreset('+1h')}
                      style={{
                        backgroundColor: scheduleType === '+1h'
                          ? isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5'
                          : isDark ? '#121927' : '#ffffff',
                        borderColor: scheduleType === '+1h' ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                      }}
                      className="flex-1 py-2 rounded-xl items-center justify-center border"
                    >
                      <Text
                        style={{
                          color: scheduleType === '+1h' ? '#10b981' : isDark ? '#ffffff' : '#0f172a',
                        }}
                        className="font-normal text-xs text-center"
                      >
                        +1 hour
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Custom Date & Time Display Bar */}
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
                          ? 'Departing: Immediately (Now)'
                          : `Scheduled: ${date.toLocaleDateString([], {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </Text>
                    </View>

                    <Text className="text-emerald-500 font-normal text-xs">
                      {scheduleType === 'Custom' ? 'Custom' : 'Edit'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
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
                    onPress={() => setPaymentMethod(item.id)}
                    style={{
                      backgroundColor: paymentMethod === item.id
                        ? isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5'
                        : isDark ? '#121927' : '#ffffff',
                      borderColor: paymentMethod === item.id ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                      borderWidth: paymentMethod === item.id ? 2 : 1,
                    }}
                    className="flex-1 py-3 rounded-2xl items-center justify-center flex-row shadow-sm"
                  >
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={paymentMethod === item.id ? '#10b981' : isDark ? '#94a3b8' : '#64748b'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        color: paymentMethod === item.id ? '#10b981' : isDark ? '#ffffff' : '#0f172a',
                      }}
                      className="font-bold text-xs"
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* PRIMARY ACTION: FIND A DRIVER */}
            <TouchableOpacity
              onPress={handleRequestRide}
              className="w-full py-4 rounded-2xl bg-emerald-500 active:bg-emerald-600 items-center justify-center shadow-xl shadow-emerald-500/25 flex-row mb-6"
            >
              <Ionicons name="search" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text className="text-white font-normal text-base uppercase tracking-wider">
                Find a Driver Sharp Sharp
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : null}
      </Animated.View>

      {/* TRIP SUMMARY MODAL */}
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
                  Trip Summary & Route Details
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowTripSummaryModal(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Route Details Card */}
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#f8fafc',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="p-4 rounded-2xl border mb-4"
            >
              {/* Pickup */}
              <View className="flex-row items-start mb-3">
                <View className="w-3.5 h-3.5 rounded-full bg-emerald-500 mr-3 mt-0.5 items-center justify-center">
                  <View className="w-1.5 h-1.5 rounded-full bg-white" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal uppercase">
                    Pickup Location
                  </Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal">
                    {pickup || 'Current GPS Location'}
                  </Text>
                </View>
              </View>

              {/* Intermediate Stops */}
              {stops.map((s, idx) => (
                <View key={s.id} className="flex-row items-start mb-3 pl-0.5">
                  <View className="w-3.5 h-3.5 rounded-full bg-sky-500 mr-3 mt-0.5 items-center justify-center">
                    <Text className="text-[8px] text-white font-normal">{idx + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal uppercase">
                      Intermediate Stop {idx + 1} (Stop & Continue)
                    </Text>
                    <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal">
                      {s.address || `Stop ${idx + 1}`}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Destination */}
              <View className="flex-row items-start">
                <View className="w-3.5 h-3.5 rounded-full bg-amber-500 mr-3 mt-0.5 items-center justify-center">
                  <View className="w-1.5 h-1.5 rounded-full bg-white" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal uppercase">
                    Final Destination
                  </Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal">
                    {dropoff || 'Not specified'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Ride Breakdown Grid */}
            <View className="flex-row space-x-2 mb-4">
              <View
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="flex-1 p-3 rounded-2xl border items-center"
              >
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal">
                  Vehicle
                </Text>
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal mt-0.5">
                  {selectedVehicle}
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
                  Schedule
                </Text>
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal mt-0.5">
                  {scheduleType === 'Now' ? 'Leave Now' : 'Scheduled'}
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
                  {paymentMethod}
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
                  Total Offered Fare
                </Text>
                <Text className="text-emerald-500 text-lg font-normal">
                  ₦{(usePointsDiscount ? Math.max(1000, offerPrice - pointsDiscountValue) : offerPrice).toLocaleString()}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-emerald-600 text-[11px] font-normal">
                  +{pointsToEarn} OgaPoints Cashback
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal">
                  {stops.length > 0 ? `${stops.length} stop(s) included` : 'Direct trip'}
                </Text>
              </View>
            </View>

            {/* Confirm & Dispatch Button */}
            <TouchableOpacity
              onPress={dispatchRideConfirmed}
              className="w-full py-4 rounded-2xl bg-emerald-500 active:bg-emerald-600 items-center justify-center shadow-xl shadow-emerald-500/25 flex-row"
            >
              <Ionicons name="checkmark-circle" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text className="text-white font-normal text-sm uppercase tracking-wider">
                Confirm & Find Driver Sharp Sharp
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FLEXIBLE DATE PICKER MODAL (WEB & ACCESSIBILITY FALLBACK) */}
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
                Flexible Pickup Time
              </Text>
              <TouchableOpacity onPress={() => setShowDatePickerModal(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mb-4">
              Choose a preset day or adjust to your exact journey schedule:
            </Text>

            {/* Day Presets */}
            <View className="flex-row space-x-2 mb-4">
              <TouchableOpacity
                onPress={() => {
                  handleCustomDateOffset(0);
                  setShowDatePickerModal(false);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500 items-center"
              >
                <Text className="text-emerald-500 font-bold text-xs">Today</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handleCustomDateOffset(1, 9);
                  setShowDatePickerModal(false);
                }}
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="flex-1 py-3 rounded-xl border items-center"
              >
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs">
                  Tomorrow Morning
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handleCustomDateOffset(2);
                  setShowDatePickerModal(false);
                }}
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
                className="flex-1 py-3 rounded-xl border items-center"
              >
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs">
                  In 2 Days
                </Text>
              </TouchableOpacity>
            </View>

            {/* Time Presets */}
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs mb-2">
              Time of Day:
            </Text>
            <View className="flex-row space-x-2 mb-6">
              {[
                { label: 'Morning (8:00 AM)', h: 8, m: 0 },
                { label: 'Afternoon (2:00 PM)', h: 14, m: 0 },
                { label: 'Evening (6:30 PM)', h: 18, m: 30 },
              ].map((t) => (
                <TouchableOpacity
                  key={t.label}
                  onPress={() => {
                    const d = new Date(date);
                    d.setHours(t.h, t.m, 0, 0);
                    setDate(d);
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
              <Text className="text-white font-black text-sm uppercase">Reset to Leave Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NATIVE DATETIMEPICKER (iOS/Android) */}
      {showNativePicker && Platform.OS !== 'web' && DateTimePicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="default"
          onChange={onNativeDateChange}
        />
      )}
    </SafeAreaView>
  );
}