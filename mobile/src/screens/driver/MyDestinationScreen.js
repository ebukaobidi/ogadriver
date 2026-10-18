import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import HeaderBar from '../../components/HeaderBar';

export default function MyDestinationScreen({ navigation }) {
  const { isDark } = useTheme();
  const [destinationFilterEnabled, setDestinationFilterEnabled] = useState(true);
  const [targetAddress, setTargetAddress] = useState('Sangotedo, Ajah / Lekki-Epe Expressway');
  const [remainingTrips, setRemainingTrips] = useState(2); // standard 2 destination filters daily
  const [arriveBy, setArriveBy] = useState('7:30 PM');
  const [corridorRadius, setCorridorRadius] = useState('tight'); // 'tight' (±2km) | 'medium' (±5km) | 'broad' (±8km)

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: isDark ? '#00e588' : '#059669',
    inputBg: isDark ? '#090d16' : '#ffffff',
    inputBorder: isDark ? '#1e293b' : '#cbd5e1',
  };

  const POPULAR_DESTINATIONS = [
    'Sangotedo, Ajah / Lekki-Epe Expressway',
    'Ikorodu Road / Maryland Interchange',
    'Surulere / National Stadium Area',
    'Magodo Phase 2, Berger Toll Gate',
    'Murtala Muhammed Airport Road, Ikeja',
    'Central Business District (CBD), Abuja',
    'Trans-Amadi / Aba Road, Port Harcourt'
  ];

  const handleSaveDestination = () => {
    if (!targetAddress.trim()) {
      Alert.alert("Target Required", "Please enter your destination address or select a hub.");
      return;
    }

    Alert.alert(
      "Destination Filter Active",
      `The dispatch algorithm will only match you with trips that align along your corridor toward:\n\n"${targetAddress}"\n\n• Corridor Tolerance: ${corridorRadius === 'tight' ? '±2 km' : corridorRadius === 'medium' ? '±5 km' : '±8 km'}\n• Arrive Before: ${arriveBy || 'Unrestricted'}\n• Remaining Uses Today: ${remainingTrips}`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Top Header Bar with Single-Icon Theme Toggle */}
      <HeaderBar 
        navigation={navigation} 
        showBack={true}
        title="My Destination" 
        subtitle="Commute route filter" 
      />

      <ScrollView className="flex-1 px-4 pt-3 pb-12" showsVerticalScrollIndicator={false}>
        {/* Screen Title */}
        <View className="mb-4">
          <Text style={{ color: themeStyles.titleText, fontSize: 26, fontWeight: 'normal' }}>
            My Destination
          </Text>
          <Text style={{ color: themeStyles.subText, fontSize: 13, marginTop: 2, fontWeight: 'normal' }}>
            Only pick trip and hire requests that match your route on your way home
          </Text>
        </View>

        {/* 1. Toggle Switch Card */}
        <View 
          style={{ 
            backgroundColor: themeStyles.cardBg, 
            borderColor: themeStyles.cardBorder, 
            borderWidth: 1 
          }}
          className="rounded-3xl p-5 mb-4 flex-row items-center justify-between shadow-sm"
        >
          <View className="flex-1 mr-3">
            <Text style={{ color: themeStyles.primaryText, fontSize: 15, fontWeight: 'normal' }}>
              Enable Destination Filter
            </Text>
            <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginTop: 2 }}>
              Only receive trip requests that align along your homeward travel direction.
            </Text>
          </View>
          <Switch 
            value={destinationFilterEnabled}
            onValueChange={setDestinationFilterEnabled}
            thumbColor={destinationFilterEnabled ? themeStyles.brandGreen : '#94a3b8'}
            trackColor={{ 
              false: isDark ? '#334155' : '#cbd5e1', 
              true: isDark ? 'rgba(0, 229, 136, 0.3)' : 'rgba(5, 150, 105, 0.3)' 
            }}
          />
        </View>

        {/* 2. Destination Setup Form */}
        <View 
          style={{ 
            backgroundColor: themeStyles.cardBg, 
            borderColor: themeStyles.cardBorder, 
            borderWidth: 1 
          }}
          className="rounded-3xl p-5 mb-4 shadow-sm"
        >
          <View className="flex-row justify-between items-center mb-2.5">
            <Text style={{ color: themeStyles.primaryText, fontSize: 13, fontWeight: 'normal' }}>
              Target Destination Address
            </Text>
            <View className="bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              <Text className="text-amber-500 text-[10px] font-normal">
                {remainingTrips} Uses Left Today
              </Text>
            </View>
          </View>

          {/* Input Box with Clear Button */}
          <View 
            style={{ 
              backgroundColor: themeStyles.inputBg, 
              borderColor: themeStyles.inputBorder, 
              borderWidth: 1 
            }}
            className="flex-row items-center rounded-2xl px-3.5 py-2.5 mb-4"
          >
            <Ionicons name="location-outline" size={18} color={themeStyles.brandGreen} style={{ marginRight: 8 }} />
            <TextInput 
              value={targetAddress}
              onChangeText={setTargetAddress}
              placeholder="e.g. Lekki, Ajah, Ikeja, Garki..."
              placeholderTextColor={themeStyles.subText}
              style={{ color: themeStyles.primaryText, fontSize: 13, fontWeight: 'normal' }}
              className="flex-1"
            />
            {targetAddress.length > 0 && (
              <TouchableOpacity onPress={() => setTargetAddress('')} className="p-1">
                <Ionicons name="close-circle" size={16} color={themeStyles.subText} />
              </TouchableOpacity>
            )}
          </View>

          {/* Corridor Tolerance Selection */}
          <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 6 }}>
            CORRIDOR DEVIATION TOLERANCE
          </Text>
          <View className="flex-row justify-between mb-4">
            {[
              { id: 'tight', label: 'Strict (±2 km)' },
              { id: 'medium', label: 'Standard (±5 km)' },
              { id: 'broad', label: 'Broad (±8 km)' },
            ].map((c) => {
              const isSelected = corridorRadius === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCorridorRadius(c.id)}
                  style={{
                    backgroundColor: isSelected 
                      ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)')
                      : themeStyles.inputBg,
                    borderColor: isSelected ? themeStyles.brandGreen : themeStyles.inputBorder,
                    borderWidth: 1
                  }}
                  className="flex-1 py-2 mx-1 rounded-xl items-center"
                >
                  <Text 
                    style={{
                      color: isSelected ? themeStyles.brandGreen : themeStyles.primaryText,
                      fontSize: 10,
                      fontWeight: 'normal'
                    }}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Dropoff Presets */}
          <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 8 }}>
            SUGGESTED DROPOFF HUBS
          </Text>
          <View className="space-y-2 mb-4">
            {POPULAR_DESTINATIONS.map((dest) => {
              const isSelected = targetAddress === dest;
              return (
                <TouchableOpacity
                  key={dest}
                  onPress={() => setTargetAddress(dest)}
                  style={{
                    backgroundColor: isSelected 
                      ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)') 
                      : themeStyles.inputBg,
                    borderColor: isSelected ? themeStyles.brandGreen : themeStyles.inputBorder,
                    borderWidth: 1
                  }}
                  className="p-3 rounded-2xl flex-row items-center justify-between mb-2"
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <Ionicons 
                      name="navigate-outline" 
                      size={14} 
                      color={isSelected ? themeStyles.brandGreen : themeStyles.subText} 
                      style={{ marginRight: 8 }} 
                    />
                    <Text 
                      style={{ color: isSelected ? themeStyles.brandGreen : themeStyles.primaryText, fontSize: 12, fontWeight: 'normal' }} 
                      numberOfLines={1}
                    >
                      {dest}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={16} color={themeStyles.brandGreen} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Desired Arrival Time */}
          <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 6 }}>
            DESIRED ARRIVAL TIME (OPTIONAL)
          </Text>
          <TextInput 
            value={arriveBy}
            onChangeText={setArriveBy}
            placeholder="e.g. 7:30 PM"
            placeholderTextColor={themeStyles.subText}
            style={{ 
              backgroundColor: themeStyles.inputBg, 
              borderColor: themeStyles.inputBorder,
              color: themeStyles.primaryText,
              borderWidth: 1,
              fontSize: 13,
              fontWeight: 'normal'
            }}
            className="rounded-2xl px-4 py-3"
          />
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={handleSaveDestination}
          style={{
            backgroundColor: themeStyles.brandGreen,
            shadowColor: themeStyles.brandGreen,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6
          }}
          className="py-4 rounded-2xl items-center justify-center mb-8"
        >
          <Text className="text-slate-950 text-sm uppercase tracking-wider font-normal">
            Activate Route Home Filter
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
