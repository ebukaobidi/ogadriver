import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GestureDeckNavigation({ views, activeView, onViewChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const pan = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const viewsData = views || [
    { id: 'map', icon: 'map', label: 'Tactical Map', color: '#1cd188' },
    { id: 'surge', icon: 'flash', label: 'Surge Zones', color: '#f59e0b' },
    { id: 'earnings', icon: 'wallet', label: 'Earnings', color: '#3b82f6' },
    { id: 'jobs', icon: 'briefcase', label: 'Active Jobs', color: '#a855f7' },
  ];

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = 80;

        if (gestureState.dx > swipeThreshold && currentIndex > 0) {
          // Swipe right - Previous view
          Animated.spring(pan, {
            toValue: 0,
            friction: 7,
            tension: 40,
          }).start(() => {
            setCurrentIndex((prev) => Math.max(0, prev - 1));
            if (onViewChange) onViewChange(viewsData[Math.max(0, currentIndex - 1)]);
          });
        } else if (gestureState.dx < -swipeThreshold && currentIndex < viewsData.length - 1) {
          // Swipe left - Next view
          Animated.spring(pan, {
            toValue: 0,
            friction: 7,
            tension: 40,
          }).start(() => {
            setCurrentIndex((prev) => Math.min(prev + 1, viewsData.length - 1));
            if (onViewChange) onViewChange(viewsData[Math.min(currentIndex + 1, viewsData.length - 1)]);
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

  return (
    <View className="h-24 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800">
      {/* Horizontal Scroll Container */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX: pan }] }}
        className="flex-row items-center px-4 h-full"
      >
        {viewsData.map((view, index) => {
          const isActive = index === currentIndex;
          const position = index - currentIndex;

          return (
            <TouchableOpacity
              key={view.id}
              onPress={() => {
                setCurrentIndex(index);
                if (onViewChange) onViewChange(view);
              }}
              className={`mr-3 ${
                isActive ? 'opacity-100' : 'opacity-50'
              }`}
              style={{
                transform: [{ scale: isActive ? 1 : 0.9 }],
              }}
            >
              <View
                className={`w-16 h-16 rounded-2xl border-2 items-center justify-center ${
                  isActive
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900'
                    : 'bg-slate-800/50'
                }`}
                style={{
                  borderColor: isActive ? view.color : '#334155',
                  shadowColor: view.color,
                  shadowOpacity: isActive ? 0.5 : 0,
                  shadowRadius: isActive ? 10 : 0,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: isActive ? 8 : 0,
                }}
              >
                <Ionicons name={view.icon} size={24} color={isActive ? view.color : '#64748b'} />
              </View>
              <Text
                className={`text-[10px] font-bold text-center mt-1 ${
                  isActive ? 'text-white' : 'text-slate-500'
                }`}
              >
                {view.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Swipe Indicator */}
      <View className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex-row space-x-1">
        {viewsData.map((_, index) => (
          <View
            key={index}
            className={`w-8 h-1 rounded-full ${
              index === currentIndex ? 'bg-brandMint' : 'bg-slate-700'
            }`}
          />
        ))}
      </View>

      {/* Swipe Hint */}
      <View className="absolute top-2 left-1/2 transform -translate-x-1/2">
        <View className="flex-row items-center space-x-2">
          <Ionicons name="chevron-back" size={14} color="#64748b" />
          <Text className="text-slate-600 text-[10px]">Swipe to navigate</Text>
          <Ionicons name="chevron-forward" size={14} color="#64748b" />
        </View>
      </View>
    </View>
  );
}
