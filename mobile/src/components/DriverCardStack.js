import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DriverCardStack({ drivers, onSwipeLeft, onSwipeRight, onCardPress }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const pan = useRef(new Animated.ValueXY()).current;

  const currentDriver = drivers[currentIndex];

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100) {
          // Swipe right - Accept
          Animated.spring(pan, {
            toValue: { x: 500, y: 0 },
            useNativeDriver: true,
          }).start(() => {
            if (onSwipeRight) onSwipeRight(currentDriver);
            pan.setValue({ x: 0, y: 0 });
            setCurrentIndex((prev) => Math.min(prev + 1, drivers.length - 1));
          });
        } else if (gestureState.dx < -100) {
          // Swipe left - Reject
          Animated.spring(pan, {
            toValue: { x: -500, y: 0 },
            useNativeDriver: true,
          }).start(() => {
            if (onSwipeLeft) onSwipeLeft(currentDriver);
            pan.setValue({ x: 0, y: 0 });
            setCurrentIndex((prev) => Math.min(prev + 1, drivers.length - 1));
          });
        } else {
          // Return to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!currentDriver) {
    return (
      <View className="flex-1 items-center justify-center">
        <Ionicons name="checkmark-circle" size={64} color="#1cd188" />
        <Text className="text-white font-bold text-lg mt-4">All drivers reviewed!</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-4">
      {/* Swipe Indicators */}
      <View className="flex-row space-x-2 mb-4">
        <View className="w-12 h-1 rounded-full bg-emerald-500" />
        <View className="w-12 h-1 rounded-full bg-slate-700" />
        <View className="w-12 h-1 rounded-full bg-slate-700" />
      </View>

      {/* Card Stack */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateX: pan.x }],
        }}
        className="w-full max-w-sm"
      >
        {/* Main Card */}
        <TouchableOpacity
          onPress={() => onCardPress(currentDriver)}
          activeOpacity={0.9}
          className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Driver Image */}
          <View className="relative h-72">
            <Image
              source={{ uri: currentDriver.avatar || 'https://via.placeholder.com/400' }}
              className="w-full h-full"
            />
            <View className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

            {/* Rating Badge */}
            <View className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 border border-emerald-500/30">
              <View className="flex-row items-center">
                <Ionicons name="star" size={14} color="#1cd188" />
                <Text className="text-white font-bold text-sm ml-1">{currentDriver.rating || '4.9'}</Text>
              </View>
            </View>

            {/* Status Badge */}
            <View className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-md rounded-full px-3 py-1.5 border border-emerald-400/30">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                <Text className="text-white font-bold text-xs">ONLINE</Text>
              </View>
            </View>

            {/* Driver Info */}
            <View className="absolute bottom-4 left-4 right-4">
              <Text className="text-white font-black text-2xl mb-1">{currentDriver.name}</Text>
              <View className="flex-row items-center space-x-3">
                <View className="flex-row items-center">
                  <Ionicons name="car" size={16} color="#1cd188" />
                  <Text className="text-slate-300 text-xs ml-1">{currentDriver.vehicle || 'Toyota Camry'}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="location" size={16} color="#1cd188" />
                  <Text className="text-slate-300 text-xs ml-1">{currentDriver.distance || '2.3 km'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Card Content */}
          <View className="p-5">
            {/* Stats Grid */}
            <View className="grid grid-cols-3 gap-3 mb-4">
              <View className="bg-slate-950/50 rounded-xl p-3 items-center">
                <Text className="text-emerald-400 font-black text-lg">{currentDriver.trips || '1,234'}</Text>
                <Text className="text-slate-500 text-[10px] uppercase">Trips</Text>
              </View>
              <View className="bg-slate-950/50 rounded-xl p-3 items-center">
                <Text className="text-blue-400 font-black text-lg">{currentDriver.experience || '5'}</Text>
                <Text className="text-slate-500 text-[10px] uppercase">Years</Text>
              </View>
              <View className="bg-slate-950/50 rounded-xl p-3 items-center">
                <Text className="text-purple-400 font-black text-lg">{currentDriver.response || '2min'}</Text>
                <Text className="text-slate-500 text-[10px] uppercase">Response</Text>
              </View>
            </View>

            {/* Skills */}
            <View className="mb-4">
              <Text className="text-slate-400 text-xs uppercase tracking-wider mb-2">Specializations</Text>
              <View className="flex-row flex-wrap gap-2">
                {currentDriver.skills?.map((skill, i) => (
                  <View key={i} className="bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                    <Text className="text-slate-300 text-[10px]">{skill}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Price */}
            <View className="flex-row items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
              <View>
                <Text className="text-slate-400 text-[10px] uppercase">Rate per trip</Text>
                <Text className="text-white font-black text-xl">₦{currentDriver.rate?.toLocaleString() || '3,500'}</Text>
              </View>
              <View className="bg-emerald-500 px-4 py-2 rounded-xl">
                <Text className="text-slate-950 font-black text-sm uppercase tracking-wider">Accept</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Action Buttons */}
      <View className="flex-row space-x-4 mt-6">
        <TouchableOpacity
          onPress={() => {
            if (onSwipeLeft) onSwipeLeft(currentDriver);
            setCurrentIndex((prev) => Math.min(prev + 1, drivers.length - 1));
          }}
          className="w-16 h-16 rounded-full bg-slate-900 border-2 border-rose-500 items-center justify-center shadow-xl shadow-rose-500/30"
        >
          <Ionicons name="close" size={28} color="#ef4444" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (onSwipeRight) onSwipeRight(currentDriver);
            setCurrentIndex((prev) => Math.min(prev + 1, drivers.length - 1));
          }}
          className="w-16 h-16 rounded-full bg-slate-900 border-2 border-emerald-500 items-center justify-center shadow-xl shadow-emerald-500/30"
        >
          <Ionicons name="checkmark" size={28} color="#10b981" />
        </TouchableOpacity>
      </View>

      {/* Swipe Instructions */}
      <View className="flex-row items-center justify-center mt-4 space-x-6">
        <View className="flex-row items-center">
          <Ionicons name="arrow-back" size={16} color="#ef4444" />
          <Text className="text-slate-500 text-xs ml-2">Pass</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="arrow-forward" size={16} color="#10b981" />
          <Text className="text-slate-500 text-xs ml-2">Accept</Text>
        </View>
      </View>
    </View>
  );
}
