import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Platform, 
  Alert,
  Animated,
  StyleSheet,
  Modal,
  ScrollView,
  AppState
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authService, driverService, radioService, extractArray } from '../../api/api';
import { useTheme } from '../../context/ThemeContext';
import { isGoogleMapsConfigured } from '../../utils/maps';

// Safe MapView imports for native platforms
let MapView, Marker, PROVIDER_GOOGLE;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
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

export default function NaijaDriverHomeScreen({ navigation }) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(true);
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);

  // Proximity Walkie-Talkie & Half-Duplex State
  const [isTalking, setIsTalking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [talkDuration, setTalkDuration] = useState(0);
  const [radioModalVisible, setRadioModalVisible] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('lagos_mainland');
  const [floorStatus, setFloorStatus] = useState('idle'); // 'idle' | 'transmitting' | 'busy'
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [recentChatter, setRecentChatter] = useState([
    { driver: 'Emeka D.', location: '3rd Mainland Bridge', message: 'Adekunle ramp moving smoothly, zero hold-up.', time_ago: '2m ago' },
    { driver: 'Babajide T.', location: 'Ikeja Along / Airport Rd', message: 'Heavy traffic at computer village under bridge.', time_ago: '5m ago' },
    { driver: 'Chukwudi O.', location: 'Lekki Phase 1 Tollgate', message: 'Clear flow into Admiralty Way.', time_ago: '9m ago' },
  ]);

  // Tactical Walkie-Talkie Channels (Push-To-Talk / Two-Way Driver Comms)
  const [radioChannels, setRadioChannels] = useState([
    { id: 'lagos_mainland', code: 'CH-01', frequency: 'CH-01', name: 'Lagos Mainland Grid', coverage: 'Ikeja, Yaba, 3rd Mainland Bridge', driversOnNet: 142 },
    { id: 'lagos_island', code: 'CH-02', frequency: 'CH-02', name: 'Island & Lekki Express', coverage: 'VI, Ikoyi, Lekki Phase 1, Ajah', driversOnNet: 198 },
    { id: 'abuja_fct', code: 'CH-03', frequency: 'CH-03', name: 'Abuja Federal Net', coverage: 'Central Area, Maitama, Airport Rd', driversOnNet: 95 },
    { id: 'port_harcourt', code: 'CH-04', frequency: 'CH-04', name: 'Port Harcourt Hub', coverage: 'GRA, Trans-Amadi, Aba Rd', driversOnNet: 64 },
    { id: 'sos_emergency', code: 'CH-09', frequency: 'CH-09 (SOS)', name: '🚨 SOS Tactical Net', coverage: 'Nationwide Road Hazard & Priority Comms', driversOnNet: 310 },
  ]);

  const activeChannelInfo = radioChannels.find(c => c.id === selectedChannel) || radioChannels[0];

  // Pulse & Audio Waveform animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(6)).current;
  const waveAnim2 = useRef(new Animated.Value(14)).current;
  const waveAnim3 = useRef(new Animated.Value(10)).current;
  const waveAnim4 = useRef(new Animated.Value(18)).current;

  // Countdown seconds for incoming dispatch offers (15s down to 0)
  const [countdownSeconds, setCountdownSeconds] = useState(15);

  // Incoming Live Ride / Hire Request (Dynamic & tailored to vehicle, subscription & boost)
  const [activeRequest, setActiveRequest] = useState(null);

  useEffect(() => {
    loadProfile();
    radioService.getChannels()
      .then(res => {
        const list = extractArray(res);
        if (list.length > 0) {
          setRadioChannels(list.map(c => ({
            id: c.id,
            code: c.channel_code || c.code || 'CH-01',
            frequency: c.frequency || c.channel_code || 'CH-01',
            name: c.name || 'Tactical Channel',
            coverage: c.coverage || 'Metropolitan Grid',
            driversOnNet: c.active_drivers_on_net || c.active_listeners || 50,
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Helper: Generate tailored offer based on vehicle presence, fleet type, subscription, and boost status
  const generateDispatchOffer = (driverData, userData) => {
    const hasCar = Boolean(driverData?.has_vehicle || driverData?.vehicle_make || driverData?.vehicle);

    if (!hasCar) {
      // Drivers WITHOUT car receive Chauffeur Job Offers only (NO street ride hailing)
      return {
        id: 'job_' + Date.now(),
        type: 'job',
        tier: 'PRIVATE CHAUFFEUR',
        employer: 'Chief Adewale E.',
        rating: '4.95',
        title: 'Executive Chauffeur (Monthly Contract)',
        location: 'Alexander Ave, Ikoyi → Victoria Island',
        dutySchedule: 'Mon – Fri, 7:30 AM – 6:00 PM',
        offeredSalary: 220000,
        vehicleProvided: 'Vehicle Provided: Mercedes S-Class',
        isBoosted: Boolean(driverData?.boost_tier || driverData?.is_boosted),
        boostLabel: driverData?.boost_tier ? `⚡ ${driverData.boost_multiplier || '5X'} BOOST MATCH` : null,
        subscriptionTag: 'CHAUFFEUR PASS: 0% SALARY COMMISSION',
        perks: ['0% Commission', 'Health Insurance', 'Overtime Allowance']
      };
    }

    // Drivers WITH car receive Ride Offers aligned with Fleet & Boost & Subscriptions
    const make = (driverData?.vehicle?.make || driverData?.vehicle_make || '').toLowerCase();
    const isLuxury = ['mercedes', 'benz', 'bmw', 'lexus', 'audi', 'range rover', 'land rover', 'porsche'].some(b => make.includes(b));
    const isExecutive = ['camry', 'accord', 'sonata', 'k5', 'rav4', 'prado'].some(m => (driverData?.vehicle?.model || '').toLowerCase().includes(m)) || make.includes('toyota');

    const tierName = isLuxury ? 'VIP LUXURY FLEET' : isExecutive ? 'EXECUTIVE FLEET' : 'STANDARD FLEET';
    const title = isLuxury ? 'VIP Luxury Ride Offer' : isExecutive ? 'Executive Sedan Ride' : 'Standard Ride Offer';
    const baseFare = isLuxury ? 16500 : isExecutive ? 8400 : 4200;
    const isBoosted = Boolean(driverData?.boost_tier || driverData?.is_boosted);
    const fare = isBoosted ? Math.round(baseFare * 1.25) : baseFare;

    return {
      id: 'ride_' + Date.now(),
      type: 'ride',
      tier: tierName,
      title: title,
      passenger: isLuxury ? 'Senator Adeleke K.' : isExecutive ? 'Engr. Tunde A.' : 'Fatima A.',
      rating: isLuxury ? '4.98' : '4.85',
      pickup: isLuxury ? 'Eko Hotel VIP Tower, Victoria Island' : 'Adetokunbo Ademola St, Victoria Island',
      dropoff: isLuxury ? 'Banana Island Estate, Ikoyi' : 'Lekki Phase 1 Gate, Admiralty Way',
      estFare: fare,
      distanceKm: isLuxury ? 9.4 : 7.2,
      pickupDistanceKm: 1.2,
      pickupEtaMins: 3,
      paymentMethod: 'Cash (Direct to Partner)',
      isBoosted: isBoosted,
      boostLabel: isBoosted ? `⚡ ${driverData?.boost_multiplier || '5X'} RADAR BOOSTED` : null,
      subscriptionTag: `${(driverData?.subscription_tier || 'PASS').toUpperCase()}: 0% COMMISSION`,
      perks: [isBoosted ? 'Surge Boost +25%' : 'Surge +15%', 'Verified Hirer', 'Smooth Route']
    };
  };

  // Live offer countdown timer (15s down to 0; disappears when countdown hits 0)
  useEffect(() => {
    let timer;
    if (isOnline && activeRequest) {
      timer = setInterval(() => {
        setCountdownSeconds(prev => {
          if (prev <= 1) {
            setActiveRequest(null);
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdownSeconds(15);
    }
    return () => clearInterval(timer);
  }, [isOnline, activeRequest]);

  // Live Dispatch Checker when driver is ONLINE
  const fetchLiveDispatches = async () => {
    if (!isOnline) {
      setActiveRequest(null);
      return;
    }
    try {
      const res = await driverService.getJobs();
      const openJobs = extractArray(res);
      if (openJobs.length > 0) {
        const topJob = openJobs[0];
        setActiveRequest({
          id: topJob.id,
          type: topJob.booking_mode || 'job',
          tier: (topJob.vehicle_type || 'EXECUTIVE CHAUFFEUR').toUpperCase(),
          employer: topJob.hirer?.name || topJob.user?.name || 'Verified Client',
          passenger: topJob.user?.name || 'Verified Client',
          rating: '4.95',
          title: topJob.title || 'Chauffeur Booking Request',
          location: `${topJob.pickup_location || 'Lagos'} → ${topJob.dropoff_location || 'Destination'}`,
          pickup: topJob.pickup_location || 'Pickup Location',
          dropoff: topJob.dropoff_location || 'Destination',
          dutySchedule: topJob.schedule || 'Flexible Schedule',
          offeredSalary: topJob.agreed_rate || topJob.salary || 250000,
          estFare: topJob.agreed_rate || topJob.offer_price || 6500,
          vehicleProvided: topJob.vehicle_provided ? 'Vehicle Provided' : 'Personal Vehicle',
          isBoosted: false,
          subscriptionTag: 'PARTNER DISPATCH: 0% COMMISSION',
          perks: ['0% Commission', 'Verified Client', 'Direct Settlement']
        });
        setCountdownSeconds(25);
      }
    } catch (e) {
      // Keep radar cleanly listening with no simulated mock data
    }
  };

  useEffect(() => {
    if (isOnline) {
      fetchLiveDispatches();
      const pollTimer = setInterval(fetchLiveDispatches, 25000);
      return () => clearInterval(pollTimer);
    } else {
      setActiveRequest(null);
    }
  }, [isOnline]);

  // Tray / Background AppState listener ("tried menu when ogadriver app is close except the driver is offline")
  useEffect(() => {
    const appStateSub = AppState.addEventListener('change', nextAppState => {
      if (nextAppState.match(/inactive|background/)) {
        if (isOnline) {
          // Push alert to notification tray / browser notification
          if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              const hasCar = Boolean(driver?.has_vehicle || driver?.vehicle_make || driver?.vehicle);
              new Notification('OgaDriver Dispatch Active', {
                body: hasCar 
                  ? '🚗 New VIP Ride Offer available near your route! Open app to accept.'
                  : '👔 New Executive Chauffeur vacancy (₦220,000/mo) in Ikoyi! Open app to apply.',
                icon: '/icon-192x192.png'
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission();
            }
          }
        }
      }
    });

    return () => {
      appStateSub.remove();
    };
  }, [isOnline, driver]);

  // Periodic simulation of road voice transmission
  useEffect(() => {
    if (!isOnline || isMuted) {
      setActiveSpeaker(null);
      return;
    }

    const timer1 = setTimeout(() => {
      setActiveSpeaker({
        name: 'Emeka D.',
        location: 'Ozumba Mbadiwe, VI',
      });

      const clearTimer = setTimeout(() => {
        setActiveSpeaker(null);
      }, 5500);

      return () => clearTimeout(clearTimer);
    }, 8000);

    return () => clearTimeout(timer1);
  }, [isOnline, isMuted]);

  // Audio wave oscillating animation during transmission or receiving
  useEffect(() => {
    let waveLoop;
    if (isTalking || floorStatus === 'busy') {
      waveLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(waveAnim1, { toValue: 24, duration: 180, useNativeDriver: false }),
            Animated.timing(waveAnim1, { toValue: 6, duration: 180, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim2, { toValue: 8, duration: 220, useNativeDriver: false }),
            Animated.timing(waveAnim2, { toValue: 28, duration: 220, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim3, { toValue: 30, duration: 160, useNativeDriver: false }),
            Animated.timing(waveAnim3, { toValue: 8, duration: 160, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim4, { toValue: 10, duration: 200, useNativeDriver: false }),
            Animated.timing(waveAnim4, { toValue: 26, duration: 200, useNativeDriver: false }),
          ]),
        ])
      );
      waveLoop.start();
    } else {
      waveAnim1.setValue(6);
      waveAnim2.setValue(14);
      waveAnim3.setValue(10);
      waveAnim4.setValue(18);
    }
    return () => {
      if (waveLoop) waveLoop.stop();
    };
  }, [isTalking, floorStatus]);

  // Talking Timer (15s Max Safety Timeout per burst)
  useEffect(() => {
    let interval;
    if (isTalking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 350, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        ])
      ).start();

      interval = setInterval(() => {
        setTalkDuration(d => {
          if (d >= 14) {
            // Safety auto-cutoff after 15 seconds
            handleHoldEnd();
            Alert.alert('15s Limit Reached', 'Transmission burst ended (15s max limit) to keep channel open for other drivers.');
            return 0;
          }
          return d + 1;
        });
      }, 1000);
    } else {
      pulseAnim.setValue(1);
      setTalkDuration(0);
    }
    return () => clearInterval(interval);
  }, [isTalking]);

  const loadProfile = async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);
      if (userData?.driver?.id) {
        const driverData = await driverService.getProfile(userData.driver.id);
        setDriver(driverData.data);
      }
    } catch (e) {
      console.log('Error loading profile:', e);
    }
  };

  // 1. Online / Offline toggle with Anti-Moonlighting & Vehicle Verification
  const handleToggleOnline = async () => {
    if (!isOnline) {
      // Vehicle Verification Check
      const hasVehicle = Boolean(driver?.has_vehicle || driver?.vehicle_make || driver?.vehicle);
      if (!hasVehicle) {
        Alert.alert(
          '🚗 Vehicle Required for Hailing',
          'You are currently registered as a Chauffeur Operative without an attached car. On-demand street hailing requires a verified vehicle.\n\nYou can accept private chauffeur contracts in the Jobs tab, or register a vehicle in your Profile.',
          [
            { text: 'Register Car', onPress: () => navigation.navigate('Profile') },
            { text: 'View Jobs', onPress: () => navigation.navigate('Jobs') },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      // Anti-Moonlighting Security Lock Check
      const isEmployed = driver?.status === 'employed' || driver?.vehicle?.ownership_type === 'employer';
      if (isEmployed) {
        Alert.alert(
          '🔒 Hailing Blocked: Active Employment',
          'Anti-Moonlighting Protection Active:\n\nYou are currently under an active employment contract or operating an employer-provided vehicle.\n\nTo protect vehicle owners and prevent unauthorized commercial use of private employer vehicles, street hailing is strictly disabled during active employment.\n\nCommercial hailing will become available once your contract concludes or if you operate a verified personally-owned vehicle.',
          [{ text: 'Understood' }]
        );
        return;
      }
    }

    try {
      if (driver?.id) {
        const res = await driverService.toggleOnline(driver.id);
        setIsOnline(res.data?.is_online ?? !isOnline);
      } else {
        setIsOnline(!isOnline);
      }
    } catch (err) {
      const errData = err?.response?.data;
      if (errData?.error_code === 'EMPLOYMENT_HAILING_LOCKED') {
        Alert.alert('🔒 Hailing Blocked', errData.message);
      } else if (errData?.error_code === 'NO_VEHICLE_ATTACHED') {
        Alert.alert('🚗 Vehicle Required', errData.message);
      } else {
        Alert.alert('Status Update', errData?.message || 'Could not update online status.');
      }
    }
  };

  // 2. Half-Duplex Push-to-Talk (PTT) with Strict Floor Arbitration
  const handleHoldStart = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Go online first to use Oga Walkie-Talkie (PTT).');
      return;
    }

    // Collision Check: If another driver is already speaking on this channel!
    if (floorStatus === 'busy' && activeSpeaker && !isTalking) {
      Alert.alert(
        '⚠️ Frequency Occupied',
        `Driver ${activeSpeaker.name} is currently transmitting on ${activeChannelInfo.frequency}.\n\nTwo drivers cannot speak at the same time to prevent audio collision. Floor is locked until their transmission finishes.`
      );
      return;
    }

    try {
      // Request floor token from backend
      const res = await radioService.requestFloor(selectedChannel);
      if (res.success) {
        setFloorStatus('transmitting');
        setIsTalking(true);
        setActiveSpeaker({
          name: user?.name ? user.name.split(' ')[0] : 'You',
          location: 'Victoria Island (GPS Active)',
          frequency: activeChannelInfo.frequency
        });
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        // Floor occupied by another driver!
        const speaker = err.response.data?.active_speaker;
        setFloorStatus('busy');
        setActiveSpeaker(speaker);
        Alert.alert(
          '⚠️ Channel Busy',
          `Frequency Occupied: Driver ${speaker?.name || 'Partner'} is currently on air. Two drivers cannot speak simultaneously.\n\nPlease wait for the airwaves to clear.`
        );
      } else {
        // Fallback local floor grant
        setFloorStatus('transmitting');
        setIsTalking(true);
        setActiveSpeaker({
          name: user?.name ? user.name.split(' ')[0] : 'You',
          location: 'Victoria Island (GPS Active)',
          frequency: activeChannelInfo.frequency
        });
      }
    }
  };

  const handleHoldEnd = async () => {
    if (isTalking) {
      setIsTalking(false);
      setFloorStatus('idle');
      setActiveSpeaker(null);
      try {
        await radioService.releaseFloor(selectedChannel);
      } catch (e) {
        // quiet catch
      }
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      setActiveSpeaker(null);
    }
  };

  const handleAcceptRequest = () => {
    if (!activeRequest) return;

    if (activeRequest.type === 'job') {
      Alert.alert(
        'Application Submitted',
        `Your driver profile has been forwarded to ${activeRequest.employer}. Opening contract details...`,
        [
          {
            text: 'View Job Details',
            onPress: () => {
              setActiveRequest(null);
              navigation.navigate('Jobs', { screen: 'JobDetails', params: { jobId: activeRequest.id } });
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Request Accepted',
        `Routing to pickup: ${activeRequest.pickup}`,
        [
          {
            text: 'Start Navigation',
            onPress: () => {
              const reqId = activeRequest.id;
              setActiveRequest(null);
              navigation.navigate('Home', { screen: 'JobDetails', params: { jobId: reqId } });
            }
          }
        ]
      );
    }
  };

  const handleDeclineRequest = () => {
    setActiveRequest(null);
    setCountdownSeconds(15);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. FULL-SCREEN MAP BACKGROUND */}
      <View style={StyleSheet.absoluteFillObject}>
        {Platform.OS === 'web' || !MapView || !isGoogleMapsConfigured() ? (
          <View style={[styles.webMapContainer, !isDark && { backgroundColor: '#f1f5f9' }]}>
            {/* Street Grid Background Pattern with White/Slate Cartography in Light Mode */}
            <View style={[styles.gridOverlay, !isDark && { opacity: 0.35 }]}>
              <View style={[styles.gridLine, { transform: [{ rotate: '25deg' }] }, !isDark && { borderColor: '#cbd5e1' }]} />
              <View style={[styles.gridLine, { transform: [{ rotate: '-25deg' }] }, !isDark && { borderColor: '#cbd5e1' }]} />
              <View style={[styles.gridLineHorizontal, { top: '30%' }, !isDark && { backgroundColor: '#cbd5e1' }]} />
              <View style={[styles.gridLineHorizontal, { top: '65%' }, !isDark && { backgroundColor: '#cbd5e1' }]} />
              <View style={[styles.gridLineVertical, { left: '35%' }, !isDark && { backgroundColor: '#cbd5e1' }]} />
              <View style={[styles.gridLineVertical, { left: '70%' }, !isDark && { backgroundColor: '#cbd5e1' }]} />
            </View>

            {/* GPS Vehicle Marker */}
            <View style={styles.markerContainer}>
              <View style={[styles.markerOuterPulse, !isDark && { backgroundColor: 'rgba(5, 150, 105, 0.2)', borderColor: '#059669' }]}>
                <View style={[styles.markerInnerDot, !isDark && { backgroundColor: '#059669' }]}>
                  <Ionicons name="navigate" size={20} color="#ffffff" />
                </View>
              </View>
              <View style={[styles.markerCallout, !isDark && { backgroundColor: '#ffffff', borderColor: '#e2e8f0' }]}>
                <Text style={[styles.markerCalloutText, !isDark && { color: '#0f172a' }]}>Victoria Island, Lagos</Text>
              </View>
            </View>

          </View>
        ) : (
          <MapView
            style={StyleSheet.absoluteFillObject}
            customMapStyle={WHITE_GOOGLE_MAP_STYLE}
            initialRegion={{
              latitude: 6.4281,
              longitude: 3.4219,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {isOnline && (
              <Marker
                coordinate={{ latitude: 6.4281, longitude: 3.4219 }}
                title="Your Vehicle"
                description={user?.name || 'Active Partner'}
              />
            )}
          </MapView>
        )}
      </View>

      {/* 2. FLOATING TOP HEADER BAR */}
      <View 
        style={[
          styles.topHeader,
          { top: Math.max(insets.top + 8, 14) },
          !isDark && {
            backgroundColor: '#ffffff',
            borderColor: '#e2e8f0',
            shadowColor: '#64748b',
          }
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <Ionicons name="car-sport" size={18} color="#090d16" />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.headerTitle, !isDark && { color: '#008751' }]}>OgaDriver</Text>
              <View 
                style={[
                  styles.partnerBadge, 
                  !isDark && { backgroundColor: 'rgba(0, 135, 81, 0.1)', borderColor: 'rgba(0, 135, 81, 0.3)' }
                ]}
              >
                <Text style={[styles.partnerBadgeText, !isDark && { color: '#008751' }]}>PARTNER</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('DriverSubscription')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.08)',
                  borderColor: isDark ? '#00e588' : '#059669',
                  borderWidth: 1,
                  borderRadius: 10,
                  paddingHorizontal: 6,
                  paddingVertical: 1.5,
                  marginRight: 6
                }}
              >
                <Ionicons name="card" size={10} color={isDark ? "#00e588" : "#059669"} style={{ marginRight: 3 }} />
                <Text style={{ color: isDark ? '#00e588' : '#059669', fontSize: 9.5, fontWeight: 'normal' }}>
                  Pass: ₦300/Day
                </Text>
              </TouchableOpacity>
              <Text style={[styles.headerSubtitle, !isDark && { color: '#64748b' }]} numberOfLines={1}>
                {driver?.vehicle_make ? `${driver.vehicle_make}` : 'Tactical Map'}
              </Text>
            </View>
          </View>
        </View>

        {/* Online / Offline Switcher with Anti-Moonlighting Guard */}
        <TouchableOpacity
          onPress={handleToggleOnline}
          style={[
            styles.onlineBtn,
            isOnline ? styles.onlineBtnActive : styles.onlineBtnInactive,
            !isDark && { backgroundColor: isOnline ? '#ecfdf5' : '#fff1f2' }
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10b981' : '#f43f5e' }]} />
          <Text style={[styles.statusText, { color: isOnline ? '#059669' : '#e11d48' }]}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. FLOATING MAP UTILITY BUTTONS (TOP RIGHT) */}
      <View style={styles.mapToolsContainer}>
        <TouchableOpacity 
          onPress={() => Alert.alert('Recenter', 'Map centered to current GPS location.')}
          style={[
            styles.mapToolBtn,
            !isDark && { backgroundColor: '#ffffff', borderColor: '#e2e8f0' }
          ]}
        >
          <Ionicons name="locate" size={18} color={isDark ? "#00e588" : "#059669"} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Schedule')}
          style={[
            styles.mapToolBtn, 
            { marginTop: 8 },
            !isDark && { backgroundColor: '#ffffff', borderColor: '#e2e8f0' }
          ]}
        >
          <Ionicons name="calendar-outline" size={18} color={isDark ? "#00e588" : "#059669"} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Jobs')}
          style={[
            styles.mapToolBtn, 
            { marginTop: 8 },
            !isDark && { backgroundColor: '#ffffff', borderColor: '#e2e8f0' }
          ]}
        >
          <Ionicons name="briefcase-outline" size={18} color={isDark ? "#00e588" : "#059669"} />
        </TouchableOpacity>
      </View>

      {/* 4. DISPATCH OVERLAY CARD: Tailored Ride Offer (with car) or Chauffeur Job Offer (without car) */}
      {isOnline && activeRequest && (
        <View style={styles.dispatchOverlay}>
          <View 
            style={[
              styles.dispatchCard,
              !isDark && {
                backgroundColor: '#ffffff',
                borderColor: '#059669',
                shadowColor: '#059669',
              }
            ]}
          >
            {/* Top Amber Traffic-Signal Countdown Progress Line */}
            <View style={styles.dispatchCountdownTrack}>
              <View 
                style={[
                  styles.dispatchCountdownFill,
                  { 
                    backgroundColor: countdownSeconds <= 4 ? '#ef4444' : '#fbbf24',
                    width: `${(countdownSeconds / 15) * 100}%`
                  }
                ]} 
              />
            </View>

            {/* Header: Fleet Tier / Job Title & Financial Focus */}
            <View style={styles.dispatchHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                <View 
                  style={[
                    styles.dispatchIconBox,
                    !isDark ? {
                      backgroundColor: 'rgba(251, 191, 36, 0.15)',
                      borderColor: 'rgba(245, 158, 11, 0.4)'
                    } : {
                      backgroundColor: isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.08)',
                      borderColor: isDark ? 'rgba(0, 229, 136, 0.35)' : 'rgba(5, 150, 105, 0.25)'
                    }
                  ]}
                >
                  <Ionicons 
                    name={activeRequest.type === 'job' ? "briefcase" : "car-sport"} 
                    size={18} 
                    color={isDark ? "#00e588" : "#059669"} 
                  />
                </View>
                <View className="flex-1">
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Text style={[styles.dispatchTitle, !isDark && { color: '#0f172a' }]} numberOfLines={1}>
                      {activeRequest.type === 'job' ? activeRequest.title : activeRequest.title}
                    </Text>
                    <View 
                      style={[
                        styles.tierTag,
                        {
                          backgroundColor: isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.08)',
                          borderColor: isDark ? 'rgba(0, 229, 136, 0.35)' : 'rgba(5, 150, 105, 0.25)'
                        }
                      ]}
                    >
                      <Text style={[styles.tierTagText, { color: isDark ? '#00e588' : '#059669' }]}>
                        {activeRequest.tier}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.dispatchPassenger, !isDark && { color: '#64748b' }]} numberOfLines={1}>
                    {activeRequest.type === 'job' 
                      ? `Hirer: ${activeRequest.employer} • ★ ${activeRequest.rating}`
                      : `Client: ${activeRequest.passenger} • ★ ${activeRequest.rating}`}
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.dispatchFare, !isDark && { color: '#047857' }]}>
                  ₦{(activeRequest.type === 'job' ? activeRequest.offeredSalary : activeRequest.estFare).toLocaleString()}
                </Text>
                <View style={styles.cashBadge}>
                  <Ionicons name="cash-outline" size={11} color={isDark ? "#10b981" : "#059669"} style={{ marginRight: 3 }} />
                  <Text style={[styles.dispatchPayment, !isDark && { color: '#059669' }]}>
                    {activeRequest.type === 'job' ? 'Monthly Salary' : 'Direct to Partner'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Details Box: Route Waypoints (For Ride) OR Contract Specs (For Job) */}
            {activeRequest.type === 'job' ? (
              <View 
                style={[
                  styles.waypointsBox,
                  !isDark && { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }
                ]}
              >
                <View style={styles.waypointRow}>
                  <View style={styles.waypointMarkerPickup}>
                    <Ionicons name="location" size={14} color={isDark ? "#00e588" : "#059669"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.waypointLabel, !isDark && { color: '#64748b' }]}>LOCATION / DEPLOYMENT</Text>
                    <Text style={[styles.waypointAddress, !isDark && { color: '#0f172a' }]}>
                      {activeRequest.location}
                    </Text>
                  </View>
                </View>

                <View style={[styles.waypointConnectorLine, !isDark && { backgroundColor: '#cbd5e1' }]} />

                <View style={styles.waypointRow}>
                  <View style={styles.waypointMarkerDropoff}>
                    <Ionicons name="calendar-outline" size={14} color={isDark ? "#00e588" : "#059669"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.waypointLabel, !isDark && { color: '#64748b' }]}>WORKING SCHEDULE & VEHICLE</Text>
                    <Text style={[styles.waypointAddress, !isDark && { color: '#0f172a' }]}>
                      {activeRequest.dutySchedule} • {activeRequest.vehicleProvided}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View 
                style={[
                  styles.waypointsBox,
                  !isDark && { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }
                ]}
              >
                <View style={styles.waypointRow}>
                  <View style={styles.waypointMarkerPickup}>
                    <Ionicons name="radio-button-on" size={14} color={isDark ? "#00e588" : "#059669"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[styles.waypointLabel, !isDark && { color: '#64748b' }]}>PICKUP LOCATION</Text>
                      <Text style={[styles.waypointEta, !isDark && { color: '#059669' }]}>
                        {activeRequest.pickupEtaMins} mins away ({activeRequest.pickupDistanceKm} km)
                      </Text>
                    </View>
                    <Text style={[styles.waypointAddress, !isDark && { color: '#0f172a' }]} numberOfLines={1}>
                      {activeRequest.pickup}
                    </Text>
                  </View>
                </View>

                <View style={[styles.waypointConnectorLine, !isDark && { backgroundColor: '#cbd5e1' }]} />

                <View style={styles.waypointRow}>
                  <View style={styles.waypointMarkerDropoff}>
                    <Ionicons name="location" size={14} color={isDark ? "#00e588" : "#059669"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[styles.waypointLabel, !isDark && { color: '#64748b' }]}>FINAL DESTINATION</Text>
                      <Text style={[styles.waypointDistance, { color: isDark ? '#00e588' : '#059669' }]}>
                        {activeRequest.distanceKm} km trip
                      </Text>
                    </View>
                    <Text style={[styles.waypointAddress, !isDark && { color: '#0f172a' }]} numberOfLines={1}>
                      {activeRequest.dropoff}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Quick Intelligence Badges aligned with Boost, Subscription & Fleet */}
            <View style={styles.tripPerksRow}>
              {activeRequest.boostLabel && (
                <View 
                  style={[
                    styles.tripPerkPill,
                    { backgroundColor: isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.08)', borderColor: isDark ? '#00e588' : '#059669' }
                  ]}
                >
                  <Ionicons name="flash" size={12} color={isDark ? "#00e588" : "#059669"} style={{ marginRight: 4 }} />
                  <Text style={[styles.tripPerkText, { color: isDark ? '#00e588' : '#059669', fontWeight: 'normal' }]}>
                    {activeRequest.boostLabel}
                  </Text>
                </View>
              )}
              {activeRequest.perks.map((perk, pIdx) => (
                <View 
                  key={pIdx}
                  style={[
                    styles.tripPerkPill,
                    !isDark && { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' }
                  ]}
                >
                  <Ionicons name="shield-checkmark" size={12} color={isDark ? "#10b981" : "#059669"} style={{ marginRight: 4 }} />
                  <Text style={[styles.tripPerkText, !isDark && { color: '#334155' }]}>
                    {perk}
                  </Text>
                </View>
              ))}
            </View>

            {/* Actions: Live Countdown Reject & Glowing Emerald Accept */}
            <View style={styles.dispatchActions}>
              <TouchableOpacity 
                onPress={handleDeclineRequest} 
                style={[
                  styles.declineBtn,
                  !isDark && { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }
                ]} 
                activeOpacity={0.8}
              >
                <Text style={[styles.declineBtnText, { color: '#ef4444' }]}>
                  Reject ({countdownSeconds}s)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleAcceptRequest} 
                style={[
                  styles.acceptBtn,
                  !isDark && { backgroundColor: '#059669' }
                ]} 
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle" size={18} color={isDark ? "#090d16" : "#ffffff"} style={{ marginRight: 6 }} />
                <Text style={[styles.acceptBtnText, !isDark && { color: '#ffffff' }]}>
                  {activeRequest.type === 'job' ? 'ACCEPT & APPLY' : 'ACCEPT & DRIVE'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 5. FLOATING OGA RADIO WALKIE-TALKIE BUTTON - Anchored Above Bottom Nav */}
      <View style={styles.ogaRadioAnchor}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setRadioModalVisible(true)}
                  onLongPress={handleHoldStart}
                  onPressOut={handleHoldEnd}
                  delayLongPress={160}
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                  {/* Outer Ring with Emerald Glow */}
                  <View 
                    style={[
                      styles.radioOuterRing,
                      isTalking 
                        ? styles.radioTalking 
                        : floorStatus === 'busy'
                          ? { borderColor: '#f59e0b', shadowColor: '#f59e0b' }
                          : isMuted 
                            ? styles.radioMuted 
                            : styles.radioActiveGlow
                    ]}
                  >
                    {/* Indicator Dot */}
                    <View style={[
                      styles.radioRedDot, 
                      { backgroundColor: isTalking ? '#dc2626' : floorStatus === 'busy' ? '#f59e0b' : '#00e588' }
                    ]} />

                    {/* Inner Solid Disc */}
                    <View 
                      style={[
                        styles.radioInnerDisc,
                        { 
                          backgroundColor: isTalking 
                            ? '#dc2626' 
                            : floorStatus === 'busy'
                              ? '#d97706'
                              : isMuted 
                                ? '#334155' 
                                : '#00e588' 
                        }
                      ]}
                    >
                      <Ionicons 
                        name={isMuted ? "mic-off" : isTalking ? "radio" : floorStatus === 'busy' ? "volume-high" : "mic"} 
                        size={28} 
                        color={isMuted ? "#94a3b8" : isTalking || floorStatus === 'busy' ? "#ffffff" : "#02241b"} 
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Dynamic Speaker Indicator under the mic */}
              {activeSpeaker ? (
                <TouchableOpacity 
                  onPress={() => setRadioModalVisible(true)} 
                  style={[
                    styles.speakerPill,
                    floorStatus === 'busy' && { backgroundColor: 'rgba(245, 158, 11, 0.95)', borderColor: '#f59e0b' }
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.speakerDot, floorStatus === 'busy' && { backgroundColor: '#ffffff' }]} />
                    <Text style={styles.speakerName} numberOfLines={1}>
                      {isTalking ? `TRANSMITTING (${15 - talkDuration}s)` : `TRANSMITTING: ${activeSpeaker.name}`}
                    </Text>
                  </View>
                  <Text style={styles.speakerLocation} numberOfLines={1}>
                    {activeSpeaker.location}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setRadioModalVisible(true)}>
                  <Text 
                    style={[
                      styles.ogaRadioLabel,
                      { color: isMuted ? '#64748b' : '#00e588', fontWeight: 'normal' }
                    ]}
                  >
                    {isMuted ? 'PTT MUTED' : `WALKIE-TALKIE: ${activeChannelInfo.code || activeChannelInfo.frequency}`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 6. FULL OGA WALKIE-TALKIE TACTICAL CONSOLE MODAL */}
            <Modal
              visible={radioModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setRadioModalVisible(false)}
            >
              <View
                style={{
                  paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 48) + 16 : Math.max(insets.bottom, 16) + 8,
                }}
                className="flex-1 justify-end bg-black/80 px-3"
              >
                <View 
                  style={{ 
                    backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                    borderColor: isDark ? '#1e293b' : '#e2e8f0', 
                    borderWidth: 1,
                    maxHeight: '85%'
                  }}
                  className="rounded-3xl p-6 shadow-2xl"
                >
                  {/* Modal Header */}
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 items-center justify-center mr-3">
                        <Ionicons name="radio" size={22} color="#00e588" />
                      </View>
                      <View>
                        <Text style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: 'normal', fontSize: 18 }}>
                          Oga Walkie-Talkie Console
                        </Text>
                        <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 'normal' }}>
                          Two-Way Driver Voice Comms • Push-To-Talk (PTT)
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => setRadioModalVisible(false)}>
                      <Ionicons name="close-circle" size={26} color={isDark ? '#94a3b8' : '#64748b'} />
                    </TouchableOpacity>
                  </View>

                  {/* Channel Frequency Selector (Tabs) */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                    {radioChannels.map(ch => (
                      <TouchableOpacity
                        key={ch.id}
                        onPress={() => setSelectedChannel(ch.id)}
                        style={{
                          backgroundColor: selectedChannel === ch.id 
                            ? (isDark ? 'rgba(0, 229, 136, 0.15)' : '#ecfdf5')
                            : (isDark ? '#1e293b' : '#f1f5f9'),
                          borderColor: selectedChannel === ch.id ? '#00e588' : (isDark ? '#334155' : '#cbd5e1'),
                          borderWidth: 1,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 14,
                          marginRight: 8
                        }}
                      >
                        <Text 
                          style={{ 
                            color: selectedChannel === ch.id ? '#00e588' : (isDark ? '#94a3b8' : '#64748b'), 
                            fontSize: 12, 
                            fontWeight: 'normal' 
                          }}
                        >
                          {ch.code || ch.frequency}
                        </Text>
                        <Text 
                          style={{ 
                            color: selectedChannel === ch.id ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#64748b' : '#94a3b8'), 
                            fontSize: 10, 
                            fontWeight: 'normal' 
                          }}
                        >
                          {ch.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Active Channel Stats & Floor HUD */}
                  <View 
                    style={{ 
                      backgroundColor: isDark ? '#090d16' : '#f8fafc',
                      borderColor: isDark ? '#1e293b' : '#e2e8f0',
                      borderWidth: 1,
                      borderRadius: 20,
                      padding: 14,
                      marginBottom: 16
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <Ionicons name="radio" size={14} color="#00e588" style={{ marginRight: 6 }} />
                        <Text style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: 'normal', fontSize: 13 }}>
                          {activeChannelInfo.name} ({activeChannelInfo.code || activeChannelInfo.frequency})
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                        <Text style={{ color: '#00e588', fontSize: 11, fontWeight: 'normal' }}>
                          {activeChannelInfo.driversOnNet || activeChannelInfo.listeners} Drivers On Channel
                        </Text>
                      </View>
                    </View>

                    {/* Coverage Area */}
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 'normal', marginBottom: 10 }}>
                      Sector Coverage: {activeChannelInfo.coverage}
                    </Text>

                    {/* Channel Floor Status Banner */}
                    <View 
                      style={{
                        backgroundColor: isTalking 
                          ? 'rgba(220, 38, 38, 0.15)'
                          : floorStatus === 'busy'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(0, 229, 136, 0.12)',
                        borderColor: isTalking ? '#dc2626' : floorStatus === 'busy' ? '#f59e0b' : '#00e588',
                        borderWidth: 1,
                        padding: 10,
                        borderRadius: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <View className="flex-row items-center flex-1 mr-2">
                        <Ionicons 
                          name={isTalking ? "mic" : floorStatus === 'busy' ? "lock-closed" : "radio-outline"} 
                          size={18} 
                          color={isTalking ? '#dc2626' : floorStatus === 'busy' ? '#f59e0b' : '#00e588'} 
                          style={{ marginRight: 8 }} 
                        />
                        <View className="flex-1">
                          <Text 
                            style={{ 
                              color: isTalking ? '#ef4444' : floorStatus === 'busy' ? '#f59e0b' : '#00e588', 
                              fontSize: 12, 
                              fontWeight: 'normal' 
                            }}
                          >
                            {isTalking 
                              ? `LIVE MIC TRANSMITTING (${15 - talkDuration}s remaining)` 
                              : floorStatus === 'busy'
                                ? `CHANNEL BUSY: ${activeSpeaker?.name || 'Partner'} on air`
                                : 'CHANNEL IDLE & OPEN'}
                          </Text>
                          <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 'normal' }}>
                            {isTalking 
                              ? 'Your voice is broadcasting to all partners in this sector'
                              : floorStatus === 'busy'
                                ? 'Two drivers cannot speak at the same time. Floor locked.'
                                : 'Airwaves clear. Hold PTT button below to speak.'}
                          </Text>
                        </View>
                      </View>

                      {/* Animated Audio Bars */}
                      <View className="flex-row items-end space-x-1" style={{ height: 30 }}>
                        <Animated.View style={{ width: 4, height: waveAnim1, backgroundColor: isTalking ? '#dc2626' : floorStatus === 'busy' ? '#f59e0b' : '#00e588', borderRadius: 2 }} />
                        <Animated.View style={{ width: 4, height: waveAnim2, backgroundColor: isTalking ? '#dc2626' : floorStatus === 'busy' ? '#f59e0b' : '#00e588', borderRadius: 2 }} />
                        <Animated.View style={{ width: 4, height: waveAnim3, backgroundColor: isTalking ? '#dc2626' : floorStatus === 'busy' ? '#f59e0b' : '#00e588', borderRadius: 2 }} />
                        <Animated.View style={{ width: 4, height: waveAnim4, backgroundColor: isTalking ? '#dc2626' : floorStatus === 'busy' ? '#f59e0b' : '#00e588', borderRadius: 2 }} />
                      </View>
                    </View>
                  </View>

                  {/* Big Circular Push-To-Talk (PTT) Button with Strict Collision Lock */}
                  <View className="items-center my-3">
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPressIn={handleHoldStart}
                      onPressOut={handleHoldEnd}
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: 70,
                        backgroundColor: isTalking 
                          ? '#dc2626' 
                          : floorStatus === 'busy'
                            ? '#78350f'
                            : '#00e588',
                        borderColor: isTalking 
                          ? '#f87171' 
                          : floorStatus === 'busy'
                            ? '#f59e0b'
                            : 'rgba(0, 229, 136, 0.4)',
                        borderWidth: 6,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: isTalking ? '#dc2626' : '#00e588',
                        shadowOpacity: 0.6,
                        shadowRadius: 18,
                        elevation: 10
                      }}
                    >
                      <Ionicons 
                        name={isTalking ? "mic" : floorStatus === 'busy' ? "lock-closed" : "mic-outline"} 
                        size={48} 
                        color={isTalking || floorStatus === 'busy' ? '#ffffff' : '#02241b'} 
                      />
                      <Text 
                        style={{ 
                          color: isTalking || floorStatus === 'busy' ? '#ffffff' : '#02241b', 
                          fontSize: 11, 
                          fontWeight: 'normal',
                          marginTop: 4,
                          textAlign: 'center'
                        }}
                      >
                        {isTalking 
                          ? `TRANSMITTING\n${15 - talkDuration}s` 
                          : floorStatus === 'busy'
                            ? 'CHANNEL BUSY\nFLOOR LOCKED'
                            : 'PRESS & HOLD\nTO TALK'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Collision & Safety Protocol Notice */}
                  <View className="items-center mb-4">
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 'normal', textAlign: 'center' }}>
                      ⚡ Strict Half-Duplex Arbitration: Only 1 driver can talk at a time to prevent audio collision. 15s max per burst. Say 'Over' when releasing.
                    </Text>
                  </View>

                  {/* Recent Road Traffic Chatter Feed */}
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a', fontSize: 13, fontWeight: 'normal', marginBottom: 8 }}>
                    Recent Voice Transmissions ({activeChannelInfo.name})
                  </Text>
                  <ScrollView style={{ maxHeight: 110 }} showsVerticalScrollIndicator={false}>
                    {recentChatter.map((chat, idx) => (
                      <View 
                        key={idx} 
                        style={{
                          backgroundColor: isDark ? '#090d16' : '#f8fafc',
                          borderColor: isDark ? '#1e293b' : '#e2e8f0',
                          borderWidth: 1,
                          padding: 8,
                          borderRadius: 12,
                          marginBottom: 6
                        }}
                      >
                        <View className="flex-row items-center justify-between mb-1">
                          <Text style={{ color: '#00e588', fontSize: 11, fontWeight: 'normal' }}>
                            {chat.driver} • <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{chat.location}</Text>
                          </Text>
                          <Text style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 'normal' }}>
                            {chat.time_ago}
                          </Text>
                        </View>
                        <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 11, fontWeight: 'normal' }}>
                          "{chat.message}"
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
    position: 'relative',
  },
  webMapContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  gridLine: {
    width: '200%',
    height: '200%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#cbd5e1',
  },
  markerContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  markerOuterPulse: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInnerDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCallout: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  markerCalloutText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  topHeader: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 50,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#00e588',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'normal',
    marginRight: 6,
  },
  partnerBadge: {
    backgroundColor: 'rgba(0, 229, 136, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 136, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  partnerBadgeText: {
    color: '#00e588',
    fontSize: 9,
    fontWeight: 'normal',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 1,
  },
  onlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  onlineBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  onlineBtnInactive: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.4)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'normal',
    letterSpacing: 0.8,
  },
  mapToolsContainer: {
    position: 'absolute',
    top: 75,
    right: 14,
    zIndex: 40,
  },
  mapToolBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  dispatchOverlay: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 100,
    zIndex: 60,
  },
  dispatchCard: {
    backgroundColor: '#0c1424',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 136, 0.5)',
    borderRadius: 24,
    padding: 16,
    paddingTop: 14,
    shadowColor: '#00e588',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 25,
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.8), 0px 0px 25px rgba(0, 229, 136, 0.25)',
    } : {}),
  },
  dispatchCountdownTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dispatchCountdownFill: {
    width: '75%',
    height: '100%',
    backgroundColor: '#00e588',
  },
  dispatchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 12,
  },
  dispatchIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 229, 136, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 136, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dispatchTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'normal',
    letterSpacing: 0.3,
    marginRight: 8,
  },
  tierTag: {
    backgroundColor: 'rgba(0, 229, 136, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 136, 0.35)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierTagText: {
    color: '#00e588',
    fontSize: 8.5,
    fontWeight: 'normal',
    letterSpacing: 0.8,
  },
  dispatchPassenger: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
    fontWeight: 'normal',
  },
  dispatchFare: {
    color: '#00e588',
    fontSize: 22,
    fontWeight: 'normal',
    letterSpacing: 0.5,
  },
  cashBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  dispatchPayment: {
    color: '#10b981',
    fontSize: 9.5,
    fontWeight: 'normal',
  },
  waypointsBox: {
    backgroundColor: '#070c17',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  waypointRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waypointMarkerPickup: {
    width: 22,
    alignItems: 'center',
    marginRight: 8,
  },
  waypointMarkerDropoff: {
    width: 22,
    alignItems: 'center',
    marginRight: 8,
  },
  waypointConnectorLine: {
    width: 1,
    height: 12,
    backgroundColor: '#334155',
    marginLeft: 11,
    marginVertical: 1,
  },
  waypointLabel: {
    color: '#64748b',
    fontSize: 8.5,
    fontWeight: 'normal',
    letterSpacing: 0.6,
  },
  waypointEta: {
    color: '#00e588',
    fontSize: 9,
    fontWeight: 'normal',
  },
  waypointDistance: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: 'normal',
  },
  waypointAddress: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'normal',
    marginTop: 1,
  },
  tripPerksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tripPerkPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 10,
    paddingVertical: 5,
    marginHorizontal: 2,
  },
  tripPerkText: {
    color: '#cbd5e1',
    fontSize: 9.5,
    fontWeight: 'normal',
  },
  dispatchActions: {
    flexDirection: 'row',
  },
  declineBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#162033',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  declineBtnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'normal',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#00e588',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00e588',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 0px 20px rgba(0, 229, 136, 0.6)',
    } : {}),
  },
  acceptBtnText: {
    color: '#090d16',
    fontSize: 12,
    fontWeight: 'normal',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ogaRadioAnchor: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 35,
  },
  radioOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
  },
  radioTalking: {
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
  },
  radioMuted: {
    backgroundColor: '#0f172a',
    borderColor: '#475569',
  },
  radioActiveGlow: {
    backgroundColor: '#03231b',
    borderColor: '#00e588',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 0px 30px rgba(0, 229, 136, 0.75), inset 0px 0px 15px rgba(0, 229, 136, 0.3)',
    } : {}),
  },
  radioRedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    position: 'absolute',
    top: 5,
    right: 5,
    borderWidth: 1.5,
    borderColor: '#090d16',
    zIndex: 10,
  },
  radioInnerDisc: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: '#00e588',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
    alignItems: 'center',
    maxWidth: 140,
  },
  speakerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00e588',
    marginRight: 4,
  },
  speakerName: {
    color: '#00e588',
    fontWeight: 'normal',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  speakerLocation: {
    color: '#cbd5e1',
    fontSize: 8,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  ogaRadioLabel: {
    fontWeight: 'normal',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 5,
    ...(Platform.OS === 'web' ? {
      textShadow: '0 0 8px rgba(0, 229, 136, 0.7)',
    } : {}),
  },
});
