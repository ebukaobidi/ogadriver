import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ActivityIndicator,
  BackHandler
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bookingService } from '../../api/api';
import { useTheme } from '../../context/ThemeContext';
import loyaltyService from '../../services/loyaltyService';
import { isGoogleMapsConfigured } from '../../utils/maps';
import * as Location from 'expo-location';
import OpenStreetMap from '../../components/OpenStreetMap';
import * as SecureStore from 'expo-secure-store';
import MapLocationPickerModal from '../../components/MapLocationPickerModal';

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

  // Saved Places and Map Location Picker
  const [savedPlaces, setSavedPlaces] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);


  const [pickerType, setPickerType] = useState('dropoff');

  useEffect(() => {
    (async () => {
      try {
        const str = Platform.OS === 'web' ? localStorage.getItem('saved_places') : await SecureStore.getItemAsync('saved_places');
        if (str) setSavedPlaces(JSON.parse(str));
      } catch (e) {}
    })();
  }, []);

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

  // Android hardware back button handler (safely placed after all state declarations)
  useEffect(() => {
    const onBack = () => {
      if (pickerVisible) {
        setPickerVisible(false);
        return true;
      }
      if (showDatePickerModal) {
        setShowDatePickerModal(false);
        return true;
      }
      if (showTripSummaryModal) {
        setShowTripSummaryModal(false);
        return true;
      }
      if (showWhenMenu) {
        setShowWhenMenu(false);
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
  }, [pickerVisible, showDatePickerModal, showTripSummaryModal, showWhenMenu, navigation]);

  const [pickupCoord, setPickupCoord] = useState({ latitude: 9.1066, longitude: 7.4111 });
  const [dropoffCoord, setDropoffCoord] = useState({ latitude: 9.0765, longitude: 7.4753 });
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const mapRef = React.useRef(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);

  // Fetch nearby active drivers with OgaDriver branded vehicles
  React.useEffect(() => {
    const lat = userLocation?.latitude || pickupCoord.latitude || 9.0765;
    const lng = userLocation?.longitude || pickupCoord.longitude || 7.4753;
    setNearbyDrivers([
      { id: 'd1', name: 'Emeka O. (Verified)', latitude: lat + 0.0035, longitude: lng + 0.0028, vehicle: 'Toyota Corolla', badge: 'PRO' },
      { id: 'd2', name: 'Tunde B. (VIP Chauffeur)', latitude: lat - 0.0032, longitude: lng + 0.0041, vehicle: 'Hyundai Elantra', badge: 'VIP' },
      { id: 'd3', name: 'Chukwuma K. (Top Rated)', latitude: lat + 0.0024, longitude: lng - 0.0035, vehicle: 'Honda Accord', badge: '5★' },
      { id: 'd4', name: 'Ibrahim S. (Executive)', latitude: lat - 0.0038, longitude: lng - 0.0021, vehicle: 'Toyota Camry', badge: 'PRO' },
    ]);
  }, [userLocation, pickupCoord]);

  // Request & Fetch real GPS location on mount
  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (isMounted && loc?.coords) {
            const userCoords = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };
            setUserLocation(userCoords);
            setPickupCoord(userCoords);
            if (mapRef.current?.animateToRegion) {
              mapRef.current.animateToRegion({
                latitude: userCoords.latitude,
                longitude: userCoords.longitude,
                latitudeDelta: 0.028,
                longitudeDelta: 0.028,
              }, 1000);
            }
            try {
              const geo = await Location.reverseGeocodeAsync(userCoords);
              if (geo && geo.length > 0) {
                const place = geo[0];
                const formatted = [place.name, place.street, place.subregion || place.city || place.region]
                  .filter(Boolean)
                  .join(', ');
                setPickup(formatted || 'Current Location');
              } else {
                setPickup('Current Location');
              }
            } catch (e) {
              setPickup('Current Location');
            }
          }
        }
      } catch (err) {
        console.log('Location request error:', err);
      } finally {
        if (isMounted) setLocationLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const region = {
    latitude: 9.0915,
    longitude: 7.4432,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Dynamic Distance & Duration calculation
  const calculateDistanceKm = (c1, c2, numStops = 0) => {
    if (!c1 || !c2) return 14.8;
    const R = 6371;
    const dLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
    const dLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((c1.latitude * Math.PI) / 180) *
        Math.cos((c2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let km = R * c * 1.35;
    if (numStops > 0) {
      km += numStops * 2.8;
    }
    return Math.max(1.5, Math.round(km * 10) / 10);
  };

  const tripDistanceKm = useMemo(() => {
    return calculateDistanceKm(pickupCoord, dropoffCoord, stops.length);
  }, [pickupCoord, dropoffCoord, stops.length]);

  const tripDurationMin = useMemo(() => {
    return Math.max(8, Math.round((tripDistanceKm / 32) * 60) + stops.length * 5);
  }, [tripDistanceKm, stops.length]);

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = React.useRef(null);

  const fetchLiveSuggestions = (query, inputType = 'dropoff') => {
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
            const mapped = data.map((item, idx) => ({
              id: item.place_id || String(idx),
              title: item.display_name,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            }));
            setSearchResults(mapped);

            // Dynamically update coordinates as user is typing so map markers and linking route update live
            const topMatch = mapped[0];
            if (topMatch && topMatch.lat && topMatch.lon) {
              if (inputType === 'pickup') {
                setPickupCoord({ latitude: topMatch.lat, longitude: topMatch.lon });
              } else if (inputType === 'dropoff') {
                setDropoffCoord({ latitude: topMatch.lat, longitude: topMatch.lon });
              }
            }
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
  const SNAP_COLLAPSED = 115; // Clean "Where to?" pill only
  const SNAP_MIDDLE = Math.round(screenHeight * 0.50); // Halfway (50% screen)
  const SNAP_EXPANDED = Math.round(screenHeight * 0.72); // Fluid slide keeping map visible at top (72%)

  // Default to middle (halfway) on app load so Map floats at top and the slide starts below it
  const [sheetState, setSheetState] = useState('middle');
  const sheetHeightAnim = React.useRef(new Animated.Value(SNAP_MIDDLE)).current;
  const currentHeightRef = React.useRef(SNAP_MIDDLE);
  const dropoffInputRef = React.useRef(null);

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
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 3,
      onMoveShouldSetPanResponderCapture: (_, gesture) => Math.abs(gesture.dy) > 3,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockAppendedResponder: () => true,
      onPanResponderGrant: () => {
        sheetHeightAnim.stopAnimation();
        const currentVal = typeof sheetHeightAnim._value === 'number' ? sheetHeightAnim._value : currentHeightRef.current;
        currentHeightRef.current = currentVal;
      },
      onPanResponderMove: (_, gesture) => {
        const nextHeight = Math.min(
          SNAP_EXPANDED + 15,
          Math.max(SNAP_COLLAPSED - 10, currentHeightRef.current - gesture.dy)
        );
        sheetHeightAnim.setValue(nextHeight);
      },
      onPanResponderRelease: (_, gesture) => {
        const finalDy = gesture.dy;
        const finalVy = gesture.vy;

        // Quick tap: toggle state (< 10px drag)
        if (Math.abs(finalDy) < 10 && Math.abs(gesture.dx) < 10) {
          if (sheetState === 'collapsed') {
            snapSheetTo('middle');
          } else if (sheetState === 'middle') {
            snapSheetTo('expanded');
          } else {
            snapSheetTo('middle');
          }
          return;
        }

        // Swiped UP
        if (finalVy < -0.25 || finalDy < -35) {
          if (sheetState === 'collapsed') {
            snapSheetTo('middle');
          } else {
            snapSheetTo('expanded');
          }
        }
        // Swiped DOWN
        else if (finalVy > 0.25 || finalDy > 35) {
          if (sheetState === 'expanded') {
            snapSheetTo('middle');
          } else {
            snapSheetTo('collapsed');
          }
        }
        // Distance based closest snap point
        else {
          const currentHeight = currentHeightRef.current - finalDy;
          const distToCollapsed = Math.abs(currentHeight - SNAP_COLLAPSED);
          const distToMiddle = Math.abs(currentHeight - SNAP_MIDDLE);
          const distToExpanded = Math.abs(currentHeight - SNAP_EXPANDED);

          if (distToExpanded <= distToMiddle && distToExpanded <= distToCollapsed) {
            snapSheetTo('expanded');
          } else if (distToMiddle <= distToCollapsed) {
            snapSheetTo('middle');
          } else {
            snapSheetTo('collapsed');
          }
        }
      },
    })
  ).current;

  const vehicleOptions = useMemo(() => {
    const dist = Math.max(1.5, tripDistanceKm || 2);
    const stopCharge = stops.length * 800;
    const economyRate = Math.max(2000, Math.round(1200 + dist * 280 + stopCharge));
    const comfortRate = Math.max(3500, Math.round(2000 + dist * 420 + stopCharge));
    const execRate = Math.max(18000, Math.round(12000 + dist * 1200 + stopCharge));

    return [
      { id: 'Economy', name: 'Economy', price: economyRate, icon: 'car-outline', desc: 'Standard 4-seater' },
      { id: 'Comfort', name: 'Comfort', price: comfortRate, icon: 'car-sport-outline', desc: 'Air-conditioned Sedan' },
      { id: 'Executive', name: 'VIP Luxury', price: execRate, icon: 'diamond', desc: 'Premium Chauffeur Fleet' },
    ];
  }, [tripDistanceKm, stops.length]);

  useEffect(() => {
    const found = vehicleOptions.find((v) => v.id === selectedVehicle);
    if (found) {
      setSuggestedPrice(found.price);
      setOfferPrice(found.price);
    }
  }, [vehicleOptions, selectedVehicle]);

  const handleOpenLocationPicker = async (type) => {
    setPickerType(type);
    if (type === 'pickup') {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (loc?.coords) {
            const newCoord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setPickupCoord(newCoord);
            if (mapRef.current?.animateToRegion) {
              mapRef.current.animateToRegion({ ...newCoord, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 800);
            }
            const geo = await Location.reverseGeocodeAsync(newCoord);
            if (geo && geo.length > 0) {
              const item = geo[0];
              const parts = [item.street || item.name, item.district || item.subregion, item.city || item.region].filter(Boolean);
              const formatted = parts.join(', ');
              if (formatted) {
                setPickup(formatted);
                setActiveInput(null);
                return;
              }
            }
          }
        }
      } catch (e) {}
    }
    setPickerVisible(true);
  };

  const handleSavePickedLocation = ({ type, address: chosenAddress, coords: chosenCoords }) => {
    if (type === 'pickup') {
      setPickup(chosenAddress);
      if (chosenCoords) setPickupCoord(chosenCoords);
    } else {
      setDropoff(chosenAddress);
      if (chosenCoords) setDropoffCoord(chosenCoords);
    }
    setActiveInput(null);
  };

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

    const hasSearchResults = searchResults && searchResults.length > 0;
    const hasSavedPlaces = savedPlaces && (savedPlaces.home || savedPlaces.work || savedPlaces.airport || (savedPlaces.custom && savedPlaces.custom.length > 0));

    return (
      <View
        style={{
          backgroundColor: isDark ? '#121927' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
        className="border rounded-2xl shadow-xl mt-1 z-50 max-h-64 overflow-hidden"
      >
        {/* Pick from Map Pin Direct Action */}
        <TouchableOpacity
          onPress={() => handleOpenLocationPicker(activeInput)}
          className="flex-row items-center p-3 border-b border-slate-700/20 bg-emerald-500/10"
        >
          <View className="w-7 h-7 rounded-full bg-emerald-500/20 items-center justify-center mr-2.5">
            <Ionicons name="map" size={14} color="#10b981" />
          </View>
          <Text className="text-emerald-500 font-bold text-xs flex-1">
            Pick address directly from interactive map
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#10b981" />
        </TouchableOpacity>

        {/* Live Search Suggestions (when user is typing) */}
        {hasSearchResults ? (
          searchResults.map((item, index) => (
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
        ))) : hasSavedPlaces ? (
          /* Real Saved Places display when focused */
          <ScrollView showsVerticalScrollIndicator={false}>
            {savedPlaces.home && savedPlaces.home !== 'Not set' && (
              <TouchableOpacity
                onPress={() => {
                  if (activeInput === 'pickup') setPickup(savedPlaces.home);
                  if (activeInput === 'dropoff') setDropoff(savedPlaces.home);
                  setActiveInput(null);
                }}
                className="flex-row items-center p-3 border-b border-slate-700/20"
              >
                <View className="w-7 h-7 rounded-xl bg-emerald-500/10 items-center justify-center mr-2.5">
                  <Ionicons name="home" size={14} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs">Home</Text>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px]" numberOfLines={1}>{savedPlaces.home}</Text>
                </View>
              </TouchableOpacity>
            )}
            {savedPlaces.work && savedPlaces.work !== 'Not set' && (
              <TouchableOpacity
                onPress={() => {
                  if (activeInput === 'pickup') setPickup(savedPlaces.work);
                  if (activeInput === 'dropoff') setDropoff(savedPlaces.work);
                  setActiveInput(null);
                }}
                className="flex-row items-center p-3 border-b border-slate-700/20"
              >
                <View className="w-7 h-7 rounded-xl bg-emerald-500/10 items-center justify-center mr-2.5">
                  <Ionicons name="briefcase" size={14} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs">Work / Office</Text>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px]" numberOfLines={1}>{savedPlaces.work}</Text>
                </View>
              </TouchableOpacity>
            )}
            {savedPlaces.airport && savedPlaces.airport !== 'Not set' && (
              <TouchableOpacity
                onPress={() => {
                  if (activeInput === 'pickup') setPickup(savedPlaces.airport);
                  if (activeInput === 'dropoff') setDropoff(savedPlaces.airport);
                  setActiveInput(null);
                }}
                className="flex-row items-center p-3 border-b border-slate-700/20"
              >
                <View className="w-7 h-7 rounded-xl bg-emerald-500/10 items-center justify-center mr-2.5">
                  <Ionicons name="airplane" size={14} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs">Airport</Text>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px]" numberOfLines={1}>{savedPlaces.airport}</Text>
                </View>
              </TouchableOpacity>
            )}
            {savedPlaces.custom && savedPlaces.custom.map((cp) => (
              <TouchableOpacity
                key={cp.id}
                onPress={() => {
                  if (activeInput === 'pickup') setPickup(cp.address);
                  if (activeInput === 'dropoff') setDropoff(cp.address);
                  setActiveInput(null);
                }}
                className="flex-row items-center p-3 border-b border-slate-700/20"
              >
                <View className="w-7 h-7 rounded-xl bg-emerald-500/10 items-center justify-center mr-2.5">
                  <Ionicons name="location" size={14} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs">{cp.name}</Text>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px]" numberOfLines={1}>{cp.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090d16' : '#ffffff' }}>
      {/* FULL-SCREEN BOLT BACKGROUND MAP CANVAS (80%+ Screen View) */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} className="bg-[#f8fafc]">
        {false && Platform.OS !== 'web' && MapView && isGoogleMapsConfigured() ? (
          <MapView
            ref={mapRef}
            style={{ width: '100%', height: '100%' }}
            initialRegion={userLocation ? {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            } : region}
            customMapStyle={WHITE_GOOGLE_MAP_STYLE}
          >
            {userLocation && <Marker coordinate={userLocation} pinColor="#10b981" title="Your Location" />}
            {pickup && <Marker coordinate={pickupCoord} pinColor="#008751" title="Pickup Spot" />}
            {dropoff && <Marker coordinate={dropoffCoord} pinColor="#ea4335" title="Destination" />}
            {pickup && dropoff && (
              <Polyline
                coordinates={[pickupCoord, dropoffCoord]}
                strokeColor="#008751"
                strokeWidth={5}
              />
            )}

            {/* Nearby Active Drivers with Branded Car Markers */}
            {nearbyDrivers.map((d) => (
              <Marker
                key={d.id}
                coordinate={{ latitude: d.latitude, longitude: d.longitude }}
                title={`${d.name} (${d.vehicle})`}
                description="Active OgaDriver Chauffeur"
              >
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: '#090d16',
                      borderWidth: 2.5,
                      borderColor: '#10b981',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#10b981',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5,
                      shadowRadius: 5,
                      elevation: 6,
                    }}
                  >
                    <Ionicons name="car-sport" size={20} color="#10b981" />
                  </View>
                  <View
                    style={{
                      backgroundColor: '#10b981',
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      borderRadius: 4,
                      marginTop: -2,
                    }}
                  >
                    <Text style={{ color: '#090d16', fontSize: 8, fontWeight: '900' }}>{d.badge}</Text>
                  </View>
                </View>
              </Marker>
            ))}
          </MapView>
        ) : (
          <OpenStreetMap
            center={userLocation || (pickup ? pickupCoord : region)}
            userLocation={userLocation}
            pickup={pickup}
            dropoff={dropoff}
            pickupCoord={pickup ? pickupCoord : null}
            dropoffCoord={dropoff ? dropoffCoord : null}
            stops={stops}
            nearbyDrivers={nearbyDrivers}
            isDark={isDark}
            interactive={true}
          />
        )}
      </View>

      
      {/* FLOATING TOP BACK BUTTON */}
      {navigation?.canGoBack && navigation.canGoBack() && (
        <View style={{ position: 'absolute', top: (insets?.top || 16) + 8, left: 16, zIndex: 60 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isDark ? '#121927' : '#ffffff',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 5,
              elevation: 8,
              borderWidth: 1,
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <Ionicons name="arrow-back" size={22} color={isDark ? '#ffffff' : '#0f172a'} />
          </TouchableOpacity>
        </View>
      )}

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
        {/* DRAG / TAP HANDLE */}
        <View
          {...panResponder.panHandlers}
          collapsable={false}
          style={{ width: '100%', height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}
        >
          <View
            style={{ backgroundColor: isDark ? '#475569' : '#cbd5e1' }}
            className="w-14 h-1.5 rounded-full"
          />
        </View>

        {sheetState === 'collapsed' ? (
          /* COLLAPSED VIEW: ONLY THE "WHERE TO?" SEARCH PILL (MATCHING BENCHMARK DESIGN) */
          <View {...panResponder.panHandlers} collapsable={false} className="px-4 pb-4">
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                snapSheetTo('middle');
                setTimeout(() => dropoffInputRef.current?.focus(), 250);
              }}
              style={{
                backgroundColor: isDark ? '#121927' : '#f1f5f9',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="flex-row items-center border rounded-2xl px-4 py-3.5 shadow-sm"
            >
              <Ionicons name="search" size={20} color={isDark ? '#ffffff' : '#0f172a'} style={{ marginRight: 12 }} />
              <Text
                style={{ color: dropoff ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b') }}
                className="text-base font-medium flex-1"
                numberOfLines={1}
              >
                {dropoff || 'Where to?'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* EXPANDED VIEW: HEADER WITH MINIMIZE BTN + FULL ROUTE INPUTS */
          <View className="flex-1">
            <View {...panResponder.panHandlers} collapsable={false} className="px-4 pb-2 pt-1 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-base mr-2">
                  Plan Your Ride
                </Text>
                {locationLoading && (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#10b981" />
                    <Text className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-1">Locating...</Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center space-x-2">
                <TouchableOpacity
                  onPress={() => snapSheetTo(sheetState === 'collapsed' ? 'middle' : 'collapsed')}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800"
                  activeOpacity={0.7}
                >
                  <Ionicons name={sheetState === 'collapsed' ? 'chevron-up' : 'chevron-down'} size={18} color={isDark ? '#cbd5e1' : '#475569'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* ROUTE INPUT SECTION */}
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
                    fetchLiveSuggestions(text, 'pickup');
                  }}
                  onFocus={() => {
                    setActiveInput('pickup');
                  }}
                  onSubmitEditing={() => {
                    if (searchResults.length > 0 && searchResults[0].lat) {
                      setPickup(searchResults[0].title);
                      setPickupCoord({ latitude: searchResults[0].lat, longitude: searchResults[0].lon });
                    }
                    setActiveInput(null);
                  }}
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  className="flex-1 text-xs font-normal"
                />
                {pickup ? (
                  <TouchableOpacity onPress={() => setPickup('')} className="p-1">
                    <Ionicons name="close-circle" size={17} color="#ef4444" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleOpenLocationPicker('pickup')}
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
                        <Ionicons name="location" size={16} color="#10b981" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => removeStop(stopItem.id)} className="p-1">
                      <Ionicons name="trash-outline" size={16} color="#94a3b8" />
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
                <View className="w-3.5 h-3.5 rounded-full bg-emerald-500 mr-2.5 items-center justify-center">
                  <View className="w-1.5 h-1.5 rounded-full bg-white" />
                </View>
                <TextInput
                  ref={dropoffInputRef}
                  placeholder="Where to? (Destination)"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  value={dropoff}
                  onChangeText={(text) => {
                    setDropoff(text);
                    setActiveInput('dropoff');
                    fetchLiveSuggestions(text, 'dropoff');
                  }}
                  onFocus={() => {
                    setActiveInput('dropoff');
                  }}
                  onSubmitEditing={() => {
                    if (searchResults.length > 0 && searchResults[0].lat) {
                      setDropoff(searchResults[0].title);
                      setDropoffCoord({ latitude: searchResults[0].lat, longitude: searchResults[0].lon });
                    }
                    setActiveInput(null);
                  }}
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  className="flex-1 text-xs font-normal"
                />
                {dropoff ? (
                  <TouchableOpacity onPress={() => setDropoff('')} className="p-1">
                    <Ionicons name="close-circle" size={17} color="#94a3b8" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleOpenLocationPicker('dropoff')}
                    className="p-1"
                  >
                    <Ionicons name="location" size={17} color="#10b981" />
                  </TouchableOpacity>
                )}
              </View>
              {activeInput === 'dropoff' && renderSuggestions()}
            </View>

            {/* EXPANDED / MIDDLE SCROLLABLE FORM */}
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
                    {tripDistanceKm} km - {tripDurationMin} min
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

              {/* Offer Stepper */}
              <View className="flex-row justify-between items-center my-1 bg-black/20 p-2 rounded-2xl">
                <TouchableOpacity
                  onPress={() => adjustPrice(-500)}
                  className="w-12 h-12 bg-white/10 active:bg-white/20 rounded-xl items-center justify-center border border-white/15"
                >
                  <Ionicons name="remove" size={24} color="#ffffff" />
                </TouchableOpacity>

                <Text className="text-white font-semibold text-3xl tracking-tight">
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
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" style={{ marginRight: 4 }} />
                  <Text className="text-emerald-300 font-normal text-[11px]">
                    ₦1,000 Points Discount Applied
                  </Text>
                </View>
              ) : null}

              {/* OgaPoints Rewards & Redemption Toggle */}
              <View className="mt-3 pt-3 border-t border-emerald-500/20 flex-row items-center justify-between">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center">
                    <Ionicons name="sparkles" size={14} color="#10b981" style={{ marginRight: 4 }} />
                    <Text className="text-emerald-300 font-medium text-xs">
                      Redeem 1,000 pts
                    </Text>
                  </View>
                  <Text className="text-white/80 text-[10px] mt-0.5 font-normal">
                    {userPoints.toLocaleString()} pts available
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
              <View className="flex-row items-center justify-between mb-2.5 px-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm tracking-tight">
                  Payment Method
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('PaymentCards')}
                  className="flex-row items-center"
                >
                  <Ionicons name="card-outline" size={14} color="#10b981" style={{ marginRight: 3 }} />
                  <Text className="text-emerald-500 font-bold text-xs">Add Debit/Credit Card</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row space-x-2.5">
                {[
                  { id: 'Cash', icon: 'cash-outline', label: 'Cash' },
                  { id: 'Bank transfer', icon: 'swap-horizontal-outline', label: 'Transfer' },
                  { id: 'Wallet', icon: 'wallet-outline', label: 'In-App Wallet' },
                  { id: 'Card', icon: 'card-outline', label: 'Card' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setPaymentMethod(item.id);
                      if (item.id === 'Card') {
                        navigation.navigate('PaymentCards');
                      }
                    }}
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
                      size={15}
                      color={paymentMethod === item.id ? '#10b981' : isDark ? '#94a3b8' : '#64748b'}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        color: paymentMethod === item.id ? '#10b981' : isDark ? '#ffffff' : '#0f172a',
                      }}
                      className="font-bold text-[11px]"
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
        </View>
      )}
      </Animated.View>

      {/* TRIP SUMMARY MODAL - FLOATING SAFELY ABOVE ANDROID NAVIGATION BUTTONS */}
      <Modal visible={showTripSummaryModal} transparent animationType="slide" onRequestClose={() => setShowTripSummaryModal(false)}>
        <View
          style={{
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 48) + 16 : Math.max(insets.bottom, 20) + 12,
          }}
          className="flex-1 bg-black/60 justify-end px-3"
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
                <Ionicons name="document-text-outline" size={22} color="#10b981" style={{ marginRight: 8 }} />
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-lg font-normal tracking-tight">
                  Trip Summary & Route Details
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowTripSummaryModal(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ paddingBottom: 8 }}>
              {/* Distance & Travel Time Metric Banner */}
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#a7f3d0',
                }}
                className="p-3.5 rounded-2xl border mb-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-9 h-9 rounded-xl bg-emerald-500/20 items-center justify-center mr-3 border border-emerald-500/30">
                    <Ionicons name="speedometer-outline" size={20} color="#10b981" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: isDark ? '#ffffff' : '#065f46' }} className="font-semibold text-xs">
                      Estimated Route Distance
                    </Text>
                    <Text style={{ color: isDark ? '#94a3b8' : '#047857' }} className="text-[11px] mt-0.5">
                      Approx. {tripDurationMin} mins travel time
                    </Text>
                  </View>
                </View>
                <View className="bg-emerald-500 px-3 py-1.5 rounded-xl shadow-sm">
                  <Text className="text-white font-bold text-xs font-mono">
                    {tripDistanceKm} KM
                  </Text>
                </View>
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
                <View className="flex-row items-start mb-1">
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

                {/* Distance Connector */}
                <View className="flex-row items-center my-1.5 ml-1">
                  <View className="w-0.5 h-5 bg-emerald-500/30 mr-4" />
                  <View className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex-row items-center">
                    <Ionicons name="navigate-outline" size={10} color="#10b981" style={{ marginRight: 3 }} />
                    <Text style={{ color: isDark ? '#34d399' : '#059669' }} className="text-[10px] font-semibold font-mono">
                      {tripDistanceKm} km route measure
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

              {/* Ride Breakdown Grid (Featuring Distance & Duration) */}
              <View className="flex-row space-x-2 mb-4">
                <View
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f8fafc',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="flex-1 p-2.5 rounded-2xl border items-center"
                >
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal">
                    Distance
                  </Text>
                  <Text className="text-emerald-500 text-xs font-bold mt-0.5 font-mono">
                    {tripDistanceKm} km
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f8fafc',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="flex-1 p-2.5 rounded-2xl border items-center"
                >
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal">
                    Est. Time
                  </Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-semibold mt-0.5">
                    ~{tripDurationMin} min
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f8fafc',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="flex-1 p-2.5 rounded-2xl border items-center"
                >
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal">
                    Vehicle
                  </Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-semibold mt-0.5" numberOfLines={1}>
                    {selectedVehicle}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f8fafc',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  }}
                  className="flex-1 p-2.5 rounded-2xl border items-center"
                >
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] font-normal">
                    Payment
                  </Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-semibold mt-0.5" numberOfLines={1}>
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* FLEXIBLE DATE PICKER MODAL (WEB & ACCESSIBILITY FALLBACK) */}
      <Modal visible={showDatePickerModal} transparent animationType="slide" onRequestClose={() => setShowDatePickerModal(false)}>
        <View
          style={{
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 48) + 16 : Math.max(insets.bottom, 20) + 12,
          }}
          className="flex-1 bg-black/60 justify-end px-3"
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
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-lg font-black tracking-tight">
                Flexible Pickup Time
              </Text>
              <TouchableOpacity onPress={() => setShowDatePickerModal(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ paddingBottom: 8 }}>

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
            </ScrollView>
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
      {/* MAP LOCATION PICKER MODAL */}
      <MapLocationPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        placeType={pickerType}
        initialAddress={pickerType === 'pickup' ? pickup : dropoff}
        onSave={handleSavePickedLocation}
      />
    </SafeAreaView>
  );
}