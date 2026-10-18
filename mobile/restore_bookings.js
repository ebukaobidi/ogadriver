const fs = require('fs');

const rideContent = `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../api/supabase';

let MapView, Marker, Polyline, PROVIDER_GOOGLE;
let DateTimePicker;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

export default function RideBookingScreen({ navigation }) {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [activeInput, setActiveInput] = useState(null); 

  const [suggestedPrice, setSuggestedPrice] = useState(3900);
  const [offerPrice, setOfferPrice] = useState(3900);
  
  const [scheduleType, setScheduleType] = useState('Now');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const pickupCoord = { latitude: 9.1066, longitude: 7.4111 }; 
  const dropoffCoord = { latitude: 9.0765, longitude: 7.4753 };
  const region = {
    latitude: 9.0915,
    longitude: 7.4432,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const searchResults = [
    { id: '1', title: 'Gwagwalada, Nigeria' },
    { id: '2', title: 'Gwarinpa, Nigeria' }
  ];

  const renderSuggestions = () => {
    if (!activeInput) return null;
    return (
      <View className="bg-[#f4f2eb] border border-slate-200 rounded-b-2xl shadow-lg mt-0 z-50 max-h-60 overflow-hidden">
        {searchResults.map((item, index) => (
          <TouchableOpacity 
            key={item.id}
            className={\`flex-row items-center p-4 \${index !== searchResults.length - 1 ? 'border-b border-slate-200' : ''}\`}
            onPress={() => {
              if (activeInput === 'pickup') setPickup(item.title);
              if (activeInput === 'dropoff') setDropoff(item.title);
              setActiveInput(null);
            }}
          >
            <Ionicons name="location-outline" size={20} color="#64748b" className="mr-3" />
            <Text className="text-slate-700 flex-1" numberOfLines={2}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const adjustPrice = (amount) => { setOfferPrice(prev => Math.max(1000, prev + amount)); };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      setScheduleType('Later');
    }
  };

  const handleRequestRide = async () => {
    if (!pickup || !dropoff) {
      Alert.alert('Missing Info', 'Please enter pickup and dropoff locations.');
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    const riderId = user?.id || '00000000-0000-0000-0000-000000000000'; 
    
    const { data, error } = await supabase
      .from('trips')
      .insert([
        {
          rider_id: riderId,
          kind: 'ride',
          pickup_address: pickup,
          dropoff_address: dropoff,
          pickup_lat: pickupCoord.latitude,
          pickup_lng: pickupCoord.longitude,
          dropoff_lat: dropoffCoord.latitude,
          dropoff_lng: dropoffCoord.longitude,
          offered_fare: offerPrice,
          payment_method: paymentMethod.toLowerCase(),
          status: 'requested',
          start_at: scheduleType === 'Later' ? date.toISOString() : new Date().toISOString()
        }
      ]);

    if (error) {
      console.log('Error requesting ride:', error);
      Alert.alert('Database connection required', 'Ride requested but Supabase must be fully configured to save.');
    } else {
      Alert.alert('Success', 'Searching for drivers nearby...');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 bg-[#fdfaf3]">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-[#ffc107] items-center justify-center mr-3">
            <Text className="text-black font-black text-lg">O</Text>
          </View>
          <View>
            <Text className="text-black font-bold text-lg leading-tight">OgaDriver</Text>
            <Text className="text-slate-500 text-xs">Ride</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="log-out-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView className="flex-1" bounces={false} keyboardShouldPersistTaps="handled">
          <View className="h-64 bg-slate-200 w-full relative items-center justify-center">
            {Platform.OS === 'web' ? (
              <Text className="text-slate-500 font-bold">Map View (Web Mockup)</Text>
            ) : (
              <MapView 
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1, width: '100%' }}
                initialRegion={region}
              >
                {pickup && <Marker coordinate={pickupCoord} pinColor="#0a5c25" />}
                {dropoff && <Marker coordinate={dropoffCoord} pinColor="#f59e0b" />}
                {pickup && dropoff && (
                  <Polyline 
                    coordinates={[pickupCoord, dropoffCoord]}
                    strokeColor="#0a5c25"
                    strokeWidth={4}
                  />
                )}
              </MapView>
            )}
          </View>
          
          <View className="items-center py-2 bg-white rounded-t-3xl -mt-4 z-10 shadow-sm border-t border-slate-100">
             <View className="w-12 h-1.5 bg-slate-300 rounded-full" />
          </View>

          <View className="px-4 pb-8 bg-white mt-4">
            <View className="relative z-20 mb-6">
              <View className={\`flex-row items-center border rounded-2xl px-4 py-3 mb-3 bg-white \${activeInput === 'pickup' ? 'border-[#0a5c25]' : 'border-slate-200'}\`}>
                <View className="w-3 h-3 rounded-full bg-[#0a5c25] mr-3" />
                <TextInput 
                  placeholder="Pickup location"
                  value={pickup}
                  onChangeText={(text) => { setPickup(text); setActiveInput('pickup'); }}
                  onFocus={() => setActiveInput('pickup')}
                  className="flex-1 text-black text-sm"
                />
              </View>
              {activeInput === 'pickup' && renderSuggestions()}

              <View className={\`flex-row items-center border rounded-2xl px-4 py-3 bg-white \${activeInput === 'dropoff' ? 'border-[#0a5c25]' : 'border-slate-200'}\`}>
                <View className="w-3 h-3 rounded-full bg-[#ffc107] mr-3" />
                <TextInput 
                  placeholder="Where to?"
                  value={dropoff}
                  onChangeText={(text) => { setDropoff(text); setActiveInput('dropoff'); }}
                  onFocus={() => setActiveInput('dropoff')}
                  className="flex-1 text-black text-sm"
                />
              </View>
              {activeInput === 'dropoff' && renderSuggestions()}
            </View>

            <View className="mb-6">
              <Text className="text-slate-800 font-bold mb-2 ml-1">Choose a vehicle</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                <TouchableOpacity 
                  className={\`mr-3 p-3 rounded-2xl border items-center w-28 \${suggestedPrice === 3900 ? 'border-[#0a5c25] bg-emerald-50' : 'border-slate-200 bg-white'}\`}
                  onPress={() => {
                    setSuggestedPrice(3900);
                    setOfferPrice(3900);
                  }}
                >
                  <Ionicons name="car-sport" size={32} color={suggestedPrice === 3900 ? '#0a5c25' : '#64748b'} />
                  <Text className={\`font-bold mt-2 \${suggestedPrice === 3900 ? 'text-[#0a5c25]' : 'text-slate-600'}\`}>Economy</Text>
                  <Text className="text-xs text-slate-500">₦3,900</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  className={\`mr-3 p-3 rounded-2xl border items-center w-28 \${suggestedPrice === 5500 ? 'border-[#0a5c25] bg-emerald-50' : 'border-slate-200 bg-white'}\`}
                  onPress={() => {
                    setSuggestedPrice(5500);
                    setOfferPrice(5500);
                  }}
                >
                  <Ionicons name="car" size={32} color={suggestedPrice === 5500 ? '#0a5c25' : '#64748b'} />
                  <Text className={\`font-bold mt-2 \${suggestedPrice === 5500 ? 'text-[#0a5c25]' : 'text-slate-600'}\`}>Comfort</Text>
                  <Text className="text-xs text-slate-500">₦5,500</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <View className="bg-[#052e16] rounded-3xl p-5 mb-6 shadow-xl">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-emerald-100 text-sm">Suggested price</Text>
                <Text className="text-emerald-100 text-sm">₦{suggestedPrice.toLocaleString()}</Text>
              </View>
              
              <Text className="text-emerald-200 text-sm font-bold mb-2">Your offer</Text>
              
              <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity 
                  className="w-12 h-12 bg-[#e8efeb] rounded-full items-center justify-center"
                  onPress={() => adjustPrice(-500)}
                >
                  <Ionicons name="remove" size={24} color="#052e16" />
                </TouchableOpacity>
                
                <Text className="text-white font-black text-3xl">₦{offerPrice.toLocaleString()}</Text>
                
                <TouchableOpacity 
                  className="w-12 h-12 bg-[#e8efeb] rounded-full items-center justify-center"
                  onPress={() => adjustPrice(500)}
                >
                  <Ionicons name="add" size={24} color="#052e16" />
                </TouchableOpacity>
              </View>
              
              <Text className="text-emerald-100 text-xs text-center">Drivers can accept your price or send a counter-offer.</Text>
            </View>

            <View className="mb-6">
              <Text className="text-slate-800 font-bold mb-2 ml-1">Schedule</Text>
              <View className="flex-row space-x-3 items-center">
                <TouchableOpacity 
                  className={\`flex-1 py-3 rounded-2xl items-center border \${scheduleType === 'Now' ? 'border-[#0a5c25] bg-[#eef3eb]' : 'border-slate-200 bg-white'}\`}
                  onPress={() => setScheduleType('Now')}
                >
                  <Text className={\`font-bold \${scheduleType === 'Now' ? 'text-[#0a5c25]' : 'text-slate-600'}\`}>Leave now</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  className={\`flex-[1.5] py-3 rounded-2xl items-center border \${scheduleType === 'Later' ? 'border-[#0a5c25] bg-[#eef3eb]' : 'border-slate-200 bg-white'}\`}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text className={\`font-bold \${scheduleType === 'Later' ? 'text-[#0a5c25]' : 'text-slate-600'}\`}>
                    {scheduleType === 'Later' ? \`\${date.toLocaleDateString()} \${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}\` : 'mm/dd/yyyy --:--'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-slate-800 font-bold mb-2 ml-1">Payment Options</Text>
              <View className="flex-row space-x-2">
                {['Cash', 'Bank transfer', 'Wallet'].map(method => (
                  <TouchableOpacity 
                    key={method}
                    className={\`flex-1 py-3 rounded-2xl items-center border \${paymentMethod === method ? 'border-[#0a5c25] bg-white' : 'border-slate-200'}\`}
                    onPress={() => setPaymentMethod(method)}
                  >
                    <Text className={\`font-bold \${paymentMethod === method ? 'text-[#0a5c25]' : 'text-slate-600'}\`}>{method}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={handleRequestRide} className="bg-[#052e16] py-4 rounded-2xl items-center shadow-lg">
              <Text className="text-white font-bold text-lg">Find a driver</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="default"
          onChange={onDateChange}
        />
      )}
    </SafeAreaView>
  );
}`;

fs.writeFileSync('src/screens/hirer/RideBookingScreen.js', rideContent, 'utf8');

const hireContent = `import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../api/supabase';

let MapView, Marker, Polyline, PROVIDER_GOOGLE;
let DateTimePicker;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

export default function HireBookingScreen({ navigation }) {
  const [pickup, setPickup] = useState('');
  const [activeInput, setActiveInput] = useState(null); 

  const [hireType, setHireType] = useState('Driver only'); 
  const [engagement, setEngagement] = useState('Daily'); 
  const [hireDuration, setHireDuration] = useState('1');
  const [hireNotes, setHireNotes] = useState('');
  const [hireStartDate, setHireStartDate] = useState(new Date());
  const [showHireDatePicker, setShowHireDatePicker] = useState(false);
  const [hirePaymentMethod, setHirePaymentMethod] = useState('Cash');
  const [hireVehicleType, setHireVehicleType] = useState('Economy');
  
  const [hireSuggestedPrice, setHireSuggestedPrice] = useState(20000);
  const [hireOfferPrice, setHireOfferPrice] = useState(20000);

  const pickupCoord = { latitude: 9.1066, longitude: 7.4111 }; 
  const region = {
    latitude: 9.0915,
    longitude: 7.4432,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const searchResults = [
    { id: '1', title: 'Gwagwalada, Nigeria' },
    { id: '2', title: 'Gwarinpa, Nigeria' }
  ];

  useEffect(() => {
    let base = 0;
    if (hireType === 'Driver only') {
      if (engagement === 'Hourly') base = 3000;
      if (engagement === 'Daily') base = 20000;
      if (engagement === 'Weekly') base = 100000;
      if (engagement === 'Monthly / Full-Time') base = 350000;
    } else {
      let carMultiplier = 1;
      if (hireVehicleType === 'Comfort') carMultiplier = 1.5;
      if (hireVehicleType === 'SUV / Minivan') carMultiplier = 2.5;

      if (engagement === 'Hourly') base = 6000 * carMultiplier;
      if (engagement === 'Daily') base = 45000 * carMultiplier;
      if (engagement === 'Weekly') base = 250000 * carMultiplier;
      if (engagement === 'Monthly / Full-Time') base = 900000 * carMultiplier;
    }
    
    const total = base * (parseInt(hireDuration) || 1);
    setHireSuggestedPrice(total);
    setHireOfferPrice(total);
  }, [hireType, engagement, hireDuration, hireVehicleType]);

  const renderSuggestions = () => {
    if (!activeInput) return null;
    return (
      <View className="bg-[#f4f2eb] border border-slate-200 rounded-b-2xl shadow-lg mt-0 z-50 max-h-60 overflow-hidden">
        {searchResults.map((item, index) => (
          <TouchableOpacity 
            key={item.id}
            className={\`flex-row items-center p-4 \${index !== searchResults.length - 1 ? 'border-b border-slate-200' : ''}\`}
            onPress={() => {
              if (activeInput === 'pickup') setPickup(item.title);
              setActiveInput(null);
            }}
          >
            <Ionicons name="location-outline" size={20} color="#64748b" className="mr-3" />
            <Text className="text-slate-700 flex-1" numberOfLines={2}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const adjustPrice = (amount) => { setHireOfferPrice(prev => Math.max(1000, prev + amount)); };

  const onHireDateChange = (event, selectedDate) => {
    setShowHireDatePicker(Platform.OS === 'ios');
    if (selectedDate) setHireStartDate(selectedDate);
  };

  const handleRequestHire = async () => {
    if (!pickup) {
      Alert.alert('Missing Info', 'Please enter where the driver should meet you.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const riderId = user?.id || '00000000-0000-0000-0000-000000000000'; 

    const { data, error } = await supabase
      .from('trips')
      .insert([
        {
          rider_id: riderId,
          kind: 'hire',
          needs_car: hireType === 'Driver + car',
          hire_type: engagement,
          hire_duration: parseInt(hireDuration) || 1,
          pickup_address: pickup,
          pickup_lat: pickupCoord.latitude,
          pickup_lng: pickupCoord.longitude,
          offered_fare: hireOfferPrice,
          payment_method: hirePaymentMethod.toLowerCase(),
          notes: hireNotes,
          status: 'requested',
          start_at: hireStartDate.toISOString()
        }
      ]);

    if (error) {
      console.log('Error requesting hire:', error);
      Alert.alert('Database connection required', 'Hire request registered but Supabase must be fully configured to save.');
    } else {
      Alert.alert('Success', 'Your driver hire request has been broadcasted!');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 bg-[#fdfaf3]">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-[#ffc107] items-center justify-center mr-3">
            <Text className="text-black font-black text-lg">O</Text>
          </View>
          <View>
            <Text className="text-black font-bold text-lg leading-tight">OgaDriver</Text>
            <Text className="text-slate-500 text-xs">Hire</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="log-out-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView className="flex-1" bounces={false} keyboardShouldPersistTaps="handled">
          <View className="h-64 bg-slate-200 w-full relative items-center justify-center">
            {Platform.OS === 'web' ? (
              <Text className="text-slate-500 font-bold">Map View (Web Mockup)</Text>
            ) : (
              <MapView 
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1, width: '100%' }}
                initialRegion={region}
              >
                {pickup && <Marker coordinate={pickupCoord} pinColor="#0a5c25" />}
              </MapView>
            )}
          </View>
          
          <View className="items-center py-2 bg-white rounded-t-3xl -mt-4 z-10 shadow-sm border-t border-slate-100">
             <View className="w-12 h-1.5 bg-slate-300 rounded-full" />
          </View>

          <View className="px-4 pb-8 bg-white mt-4">
            <View className="relative z-20 mb-6">
              <View className={\`flex-row items-center border rounded-2xl px-4 py-3 bg-white \${activeInput === 'pickup' ? 'border-[#0a5c25] rounded-b-none' : 'border-slate-400'}\`}>
                <View className="w-3 h-3 rounded-full bg-[#0a5c25] mr-3" />
                <TextInput 
                  placeholder="Where should the driver meet you?"
                  value={pickup}
                  onChangeText={(text) => { setPickup(text); setActiveInput('pickup'); }}
                  onFocus={() => setActiveInput('pickup')}
                  className="flex-1 text-black text-sm"
                />
              </View>
              {activeInput === 'pickup' && renderSuggestions()}
            </View>

            <View className="flex-row space-x-3 mb-6">
              <TouchableOpacity 
                className={\`flex-1 p-4 rounded-2xl border \${hireType === 'Driver only' ? 'bg-[#eef3eb] border-[#0a5c25]' : 'bg-white border-slate-300'}\`}
                onPress={() => setHireType('Driver only')}
              >
                <Ionicons name="person-outline" size={24} color="#000" className="mb-2" />
                <Text className="font-black text-black text-base">Driver only</Text>
                <Text className="text-slate-500 text-xs mt-1">For my own car</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={\`flex-1 p-4 rounded-2xl border \${hireType === 'Driver + car' ? 'bg-[#eef3eb] border-[#0a5c25]' : 'bg-white border-slate-300'}\`}
                onPress={() => setHireType('Driver + car')}
              >
                <Ionicons name="car-outline" size={24} color="#000" className="mb-2" />
                <Text className="font-black text-black text-base">Driver + car</Text>
                <Text className="text-slate-500 text-xs mt-1">Driver brings a car</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-slate-800 font-bold mb-3 ml-1">Engagement</Text>
              <View className="flex-row space-x-2">
                {['Hourly', 'Daily', 'Weekly', 'Monthly / Full-Time'].map(type => (
                  <TouchableOpacity 
                    key={type}
                    className={\`flex-1 py-3 px-1 rounded-2xl items-center justify-center border \${engagement === type ? 'bg-[#052e16] border-[#052e16]' : 'bg-white border-slate-300'}\`}
                    onPress={() => setEngagement(type)}
                  >
                    <Text className={\`font-bold text-center text-[10px] \${engagement === type ? 'text-white' : 'text-slate-700'}\`}>{type.replace(' / ', '\\n')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-slate-800 font-bold mb-3 ml-1">How many {engagement === 'Hourly' ? 'hours' : engagement === 'Daily' ? 'days' : engagement === 'Weekly' ? 'weeks' : 'months'}</Text>
              <View className="flex-row space-x-3 items-center">
                <View className="flex-1 border border-slate-300 rounded-2xl px-4 py-3 bg-white">
                  <TextInput 
                    keyboardType="numeric"
                    value={hireDuration}
                    onChangeText={setHireDuration}
                    className="text-black font-bold text-base"
                  />
                </View>
                <TouchableOpacity 
                  className="flex-[1.5] py-3 rounded-2xl items-center border border-slate-300 bg-white"
                  onPress={() => setShowHireDatePicker(true)}
                >
                  <Text className="text-slate-600 font-bold">
                    {hireStartDate.toLocaleDateString() === new Date().toLocaleDateString() ? 'mm/dd/yyyy --:--' : \`\${hireStartDate.toLocaleDateString()} \${hireStartDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}\`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {hireType === 'Driver + car' && (
              <View className="mb-6">
                <Text className="text-slate-800 font-bold mb-3 ml-1">Choose a vehicle</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                  {['Economy', 'Comfort', 'SUV / Minivan'].map((type, i) => (
                    <TouchableOpacity 
                      key={type}
                      className={\`mr-3 p-3 rounded-2xl border items-center w-28 \${hireVehicleType === type ? 'border-[#0a5c25] bg-emerald-50' : 'border-slate-300 bg-white'}\`}
                      onPress={() => setHireVehicleType(type)}
                    >
                      <Ionicons name={i===0 ? "car-sport" : i===1 ? "car" : "bus"} size={32} color={hireVehicleType === type ? '#0a5c25' : '#64748b'} />
                      <Text className={\`font-bold mt-2 text-center \${hireVehicleType === type ? 'text-[#0a5c25]' : 'text-slate-600'}\`}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View className="mb-6">
              <View className="border border-slate-300 rounded-2xl px-4 py-3 bg-white min-h-[100px] border-b-4 border-b-blue-600">
                <TextInput 
                  multiline
                  placeholder="e.g. Manual transmission, school runs, office commute..."
                  value={hireNotes}
                  onChangeText={setHireNotes}
                  className="text-slate-700 text-sm"
                  style={{ textAlignVertical: 'top' }}
                />
              </View>
            </View>

            <View className="bg-[#052e16] rounded-3xl p-5 mb-6 shadow-xl">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-emerald-100 text-sm">Suggested price</Text>
                <Text className="text-emerald-100 text-sm">₦{hireSuggestedPrice.toLocaleString()}</Text>
              </View>
              
              <Text className="text-emerald-200 text-sm font-bold mb-2">Your offer</Text>
              
              <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity 
                  className="w-12 h-12 bg-[#e8efeb] rounded-full items-center justify-center"
                  onPress={() => adjustPrice(-1000)}
                >
                  <Ionicons name="remove" size={24} color="#052e16" />
                </TouchableOpacity>
                
                <Text className="text-white font-black text-3xl">₦{hireOfferPrice.toLocaleString()}</Text>
                
                <TouchableOpacity 
                  className="w-12 h-12 bg-[#e8efeb] rounded-full items-center justify-center"
                  onPress={() => adjustPrice(1000)}
                >
                  <Ionicons name="add" size={24} color="#052e16" />
                </TouchableOpacity>
              </View>
              
              <Text className="text-emerald-100 text-xs text-center">Drivers can accept your price or send a counter-offer.</Text>
            </View>

            <View className="mb-8">
              <View className="flex-row space-x-2">
                {['Cash', 'Bank transfer', 'Wallet'].map(method => (
                  <TouchableOpacity 
                    key={method}
                    className={\`flex-1 py-3 rounded-2xl items-center border \${hirePaymentMethod === method ? 'border-[#0a5c25] bg-white' : 'border-slate-300 bg-white'}\`}
                    onPress={() => setHirePaymentMethod(method)}
                  >
                    <Text className={\`font-bold \${hirePaymentMethod === method ? 'text-black' : 'text-slate-500'}\`}>{method}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={handleRequestHire} className="bg-[#052e16] py-4 rounded-2xl items-center shadow-lg">
              <Text className="text-white font-bold text-lg">Request driver hire</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showHireDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={hireStartDate}
          mode="datetime"
          display="default"
          onChange={onHireDateChange}
        />
      )}
    </SafeAreaView>
  );
}`;

fs.writeFileSync('src/screens/hirer/HireBookingScreen.js', hireContent, 'utf8');

console.log('Restored both booking screens natively via Node.');
