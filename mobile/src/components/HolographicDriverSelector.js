import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HolographicDriverSelector({ drivers, onSelect, onCardPress }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const pan = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        const threshold = 100;

        if (gestureState.dx > threshold && selectedIndex > 0) {
          // Swipe right - Previous driver
          Animated.spring(pan, {
            toValue: 0,
            friction: 7,
            tension: 40,
          }).start(() => {
            setSelectedIndex((prev) => Math.max(0, prev - 1));
          });
        } else if (gestureState.dx < -threshold && selectedIndex < drivers.length - 1) {
          // Swipe left - Next driver
          Animated.spring(pan, {
            toValue: 0,
            friction: 7,
            tension: 40,
          }).start(() => {
            setSelectedIndex((prev) => Math.min(prev + 1, drivers.length - 1));
          });
        } else {
          // Return to center
          Animated.spring(pan, {
            toValue: 0,
            friction: 7,
            tension: 40,
          }).start();
        }
      },
    })
  ).current;

  const currentDriver = drivers[selectedIndex];

  if (!currentDriver) {
    return (
      <View className="flex-1 items-center justify-center">
        <Ionicons name="people" size={64} color="#64748b" />
        <Text className="text-slate-400 text-lg mt-4">No drivers available</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-4 py-6">
      {/* Holographic Card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateX: pan }, { scale }],
        }}
      >
        <TouchableOpacity
          onPress={() => onCardPress(currentDriver)}
          activeOpacity={0.9}
          className="relative"
        >
          {/* Holographic Glow Effect */}
          <View className="absolute inset-0 bg-gradient-to-br from-brandMint/20 via-emerald-500/10 to-transparent rounded-3xl blur-xl" />

          {/* Main Card */}
          <View className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative">
            {/* Scan Line Animation */}
            <View className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brandMint to-transparent opacity-50" />
            <View className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brandMint to-transparent animate-[scan_2s_linear_infinite]" />

            {/* Driver Image */}
            <View className="relative h-64">
              <Image
                source={{ uri: currentDriver.avatar || 'https://via.placeholder.com/400' }}
                className="w-full h-full"
              />
              <View className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

              {/* Holographic Overlay */}
              <View className="absolute inset-0 border-2 border-brandMint/30 rounded-b-3xl" />

              {/* Status Badge */}
              <View className="absolute top-4 right-4 bg-brandMint/90 backdrop-blur-md rounded-full px-3 py-1.5 border border-brandMint/50">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                  <Text className="text-white font-bold text-xs">ONLINE</Text>
                </View>
              </View>

              {/* Rating Badge */}
              <View className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 border border-emerald-500/30">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={14} color="#1cd188" />
                  <Text className="text-white font-bold text-xs ml-1">{currentDriver.rating || '4.9'}</Text>
                </View>
              </View>

              {/* Driver Info */}
              <View className="absolute bottom-4 left-4 right-4">
                <Text className="text-white font-black text-2xl mb-1">{currentDriver.name}</Text>
                <View className="flex-row items-center space-x-4">
                  <View className="flex-row items-center">
                    <Ionicons name="car" size={16} color="#1cd188" />
                    <Text className="text-slate-300 text-sm ml-1">{currentDriver.vehicle || 'Toyota Camry'}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="location" size={16} color="#1cd188" />
                    <Text className="text-slate-300 text-sm ml-1">{currentDriver.distance || '1.2km'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Holographic Stats */}
            <View className="p-5 bg-slate-950/50 backdrop-blur-sm">
              <View className="grid grid-cols-3 gap-3 mb-4">
                <View className="bg-slate-900/50 rounded-xl p-3 items-center border border-slate-800">
                  <Text className="text-brandMint font-black text-lg">{currentDriver.trips || '1,234'}</Text>
                  <Text className="text-slate-500 text-[10px] uppercase mt-1">Trips</Text>
                </View>
                <View className="bg-slate-900/50 rounded-xl p-3 items-center border border-slate-800">
                  <Text className="text-blue-400 font-black text-lg">{currentDriver.experience || '5'}</Text>
                  <Text className="text-slate-500 text-[10px] uppercase mt-1">Years</Text>
                </View>
                <View className="bg-slate-900/50 rounded-xl p-3 items-center border border-slate-800">
                  <Text className="text-purple-400 font-black text-lg">{currentDriver.response || '2min'}</Text>
                  <Text className="text-slate-500 text-[10px] uppercase mt-1">Response</Text>
                </View>
              </View>

              {/* Skills with Holographic Effect */}
              <View className="mb-4">
                <Text className="text-slate-400 text-[10px] uppercase tracking-wider mb-2">Specializations</Text>
                <View className="flex-row flex-wrap gap-2">
                  {currentDriver.skills?.map((skill, i) => (
                    <View
                      key={i}
                      className="bg-brandMint/10 border border-brandMint/30 px-3 py-1.5 rounded-full"
                    >
                      <Text className="text-brandMint text-[10px] font-medium">{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Price with Holographic Highlight */}
              <View className="flex-row items-center justify-between bg-gradient-to-r from-brandMint/20 to-emerald-500/20 border border-brandMint/30 rounded-2xl p-4">
                <View>
                  <Text className="text-slate-400 text-[10px] uppercase">Rate per trip</Text>
                  <Text className="text-white font-black text-2xl">₦{currentDriver.rate?.toLocaleString() || '3,500'}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => onSelect(currentDriver)}
                  className="bg-gradient-to-r from-brandMint to-emerald-500 px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30"
                >
                  <Text className="text-slate-950 font-black text-sm uppercase tracking-wider">Select</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Card Stack Indicators */}
      <View className="flex-row justify-center space-x-2 mt-6">
        {drivers.map((_, index) => (
          <View
            key={index}
            className={`w-12 h-1 rounded-full ${
              index === selectedIndex ? 'bg-brandMint' : 'bg-slate-700'
            }`}
          />
        ))}
      </View>

      {/* Swipe Instructions */}
      <View className="flex-row items-center justify-center mt-4 space-x-8">
        <View className="flex-row items-center">
          <Ionicons name="arrow-back" size={16} color="#64748b" />
          <Text className="text-slate-500 text-xs ml-2">Previous</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="arrow-forward" size={16} color="#64748b" />
          <Text className="text-slate-500 text-xs ml-2">Next</Text>
        </View>
      </View>
    </View>
  );
}
