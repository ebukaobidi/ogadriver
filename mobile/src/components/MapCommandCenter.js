import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle, Polygon } from 'react-native-maps';
import { isGoogleMapsConfigured } from '../utils/maps';
import OpenStreetMap from './OpenStreetMap';

export default function MapCommandCenter({ userLocation, nearbyDrivers, onDriverSelect, onLocationPress }) {
  const [mapRegion, setMapRegion] = useState({
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showRadar, setShowRadar] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  return (
    <View className="flex-1 relative">
      {/* Tactical Map View */}
      {Platform.OS !== 'web' && isGoogleMapsConfigured() ? (
        <MapView
        style={{ flex: 1 }}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        customMapStyle={[
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [
              { color: '#1e293b' },
              { lightness: 20 },
            ],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [
              { color: '#0c4a6e' },
              { lightness: 10 },
            ],
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [
              { color: '#334155' },
              { lightness: 10 },
            ],
          },
        ]}
      >
        {/* User Location Marker */}
        <Marker
          coordinate={userLocation || { latitude: 6.5244, longitude: 3.3792 }}
          title="Your Location"
        >
          <View className="w-6 h-6 rounded-full bg-brandMint border-4 border-white shadow-lg shadow-emerald-500/50">
            <View className="w-2 h-2 rounded-full bg-white absolute top-1 left-1" />
          </View>
        </Marker>

        {/* Radar Scan Effect */}
        {showRadar && (
          <Circle
            center={userLocation || { latitude: 6.5244, longitude: 3.3792 }}
            radius={1000}
            fillColor="rgba(28, 209, 136, 0.1)"
            strokeColor="#1cd188"
            strokeWidth={2}
          />
        )}

        {/* Nearby Drivers */}
        {nearbyDrivers?.map((driver, index) => (
          <Marker
            key={driver.id || index}
            coordinate={{
              latitude: driver.latitude || 6.5244 + (index * 0.01),
              longitude: driver.longitude || 3.3792 + (index * 0.01),
            }}
            onPress={() => {
              setSelectedDriver(driver);
              if (onDriverSelect) onDriverSelect(driver);
            }}
          >
            <View
              className={`w-10 h-10 rounded-full border-2 ${
                selectedDriver?.id === driver.id
                  ? 'bg-brandMint border-white shadow-lg shadow-emerald-500/50'
                  : 'bg-slate-800 border-slate-600'
              } items-center justify-center`}
            >
              <Text className="text-white font-bold text-xs">
                {driver.name?.charAt(0) || 'D'}
              </Text>
            </View>
          </Marker>
        ))}

        {/* High-Demand Zone Heatmap */}
        {showHeatmap && (
          <Polygon
            coordinates={[
              { latitude: 6.5344, longitude: 3.3892 },
              { latitude: 6.5344, longitude: 3.3692 },
              { latitude: 6.5144, longitude: 3.3692 },
              { latitude: 6.5144, longitude: 3.3892 },
            ]}
            fillColor="rgba(239, 68, 68, 0.3)"
            strokeColor="#ef4444"
            strokeWidth={2}
          />
        )}
      </MapView>
      ) : (
        <OpenStreetMap
          center={userLocation || mapRegion}
          driverCoord={userLocation}
          driverName="Your Location"
          isDark={true}
          interactive={true}
        />
      )}

      {/* Floating Command Panel - Top */}
      <View className="absolute top-4 left-4 right-4">
        <View className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-brandMint/20 border border-brandMint/30 items-center justify-center mr-3">
                <Ionicons name="locate" size={20} color="#1cd188" />
              </View>
              <View>
                <Text className="text-white font-black text-sm">Lagos, Victoria Island</Text>
                <Text className="text-slate-400 text-[10px]">12 drivers within 2km</Text>
              </View>
            </View>
            <TouchableOpacity className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center">
              <Ionicons name="settings" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tactical Controls - Right Side */}
      <View className="absolute right-4 top-1/3 space-y-3">
        <TouchableOpacity
          onPress={() => setShowRadar(!showRadar)}
          className={`w-12 h-12 rounded-xl backdrop-blur-xl border items-center justify-center shadow-lg ${
            showRadar
              ? 'bg-brandMint/20 border-brandMint/50'
              : 'bg-slate-900/90 border-slate-700'
          }`}
        >
          <Ionicons name="radar" size={22} color={showRadar ? '#1cd188' : '#64748b'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowHeatmap(!showHeatmap)}
          className={`w-12 h-12 rounded-xl backdrop-blur-xl border items-center justify-center shadow-lg ${
            showHeatmap
              ? 'bg-red-500/20 border-red-500/50'
              : 'bg-slate-900/90 border-slate-700'
          }`}
        >
          <Ionicons name="flame" size={22} color={showHeatmap ? '#ef4444' : '#64748b'} />
        </TouchableOpacity>

        <TouchableOpacity className="w-12 h-12 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 items-center justify-center shadow-lg">
          <Ionicons name="layers" size={22} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity className="w-12 h-12 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 items-center justify-center shadow-lg">
          <Ionicons name="expand" size={22} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions - Bottom Left */}
      <View className="absolute bottom-32 left-4 space-y-3">
        <TouchableOpacity className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brandMint to-emerald-600 border-2 border-emerald-400 items-center justify-center shadow-xl shadow-emerald-500/30">
          <Ionicons name="flash" size={26} color="#0f172a" />
        </TouchableOpacity>

        <TouchableOpacity className="w-14 h-14 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 items-center justify-center shadow-lg">
          <Ionicons name="person-add" size={26} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Selected Driver Info - Bottom Sheet */}
      {selectedDriver && (
        <View className="absolute bottom-4 left-4 right-4">
          <View className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl">
            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-600 mr-4 overflow-hidden">
                {/* Driver Avatar Placeholder */}
                <View className="w-full h-full bg-brandMint/20 items-center justify-center">
                  <Text className="text-white font-black text-xl">
                    {selectedDriver.name?.charAt(0) || 'D'}
                  </Text>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-white font-black text-lg">{selectedDriver.name}</Text>
                <View className="flex-row items-center space-x-3 mt-1">
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text className="text-slate-400 text-xs ml-1">{selectedDriver.rating || '4.9'}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="car" size={14} color="#3b82f6" />
                    <Text className="text-slate-400 text-xs ml-1">{selectedDriver.distance || '1.2km'}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                className="bg-brandMint px-6 py-3 rounded-xl"
                onPress={() => {
                  if (onDriverSelect) onDriverSelect(selectedDriver);
                  setSelectedDriver(null);
                }}
              >
                <Text className="text-slate-950 font-black text-sm uppercase tracking-wider">Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Map Mode Indicator */}
      <View className="absolute bottom-32 right-4">
        <View className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-xl px-3 py-2 shadow-lg">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-brandMint mr-2 animate-pulse" />
            <Text className="text-brandMint text-[10px] font-bold uppercase tracking-wider">Tactical View</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
