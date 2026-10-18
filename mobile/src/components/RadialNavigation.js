import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RadialNavigation({ activeSection, onSectionChange }) {
  const [expanded, setExpanded] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const sections = [
    { id: 'home', icon: 'home', label: 'Home', color: '#1cd188' },
    { id: 'surge', icon: 'flash', label: 'Surge', color: '#f59e0b' },
    { id: 'earnings', icon: 'wallet', label: 'Earnings', color: '#3b82f6' },
    { id: 'jobs', icon: 'briefcase', label: 'Jobs', color: '#a855f7' },
    { id: 'profile', icon: 'person', label: 'Profile', color: '#ef4444' },
    { id: 'settings', icon: 'settings', label: 'Settings', color: '#64748b' },
  ];

  const toggleExpand = () => {
    Animated.spring(scaleAnim, {
      toValue: expanded ? 1 : 1.2,
      friction: 7,
      tension: 40,
    }).start();
    setExpanded(!expanded);
  };

  return (
    <View className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      {/* Central Hub */}
      <TouchableOpacity
        onPress={toggleExpand}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-brandMint to-emerald-600 items-center justify-center shadow-2xl shadow-emerald-500/50 border-4 border-slate-900"
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons name={expanded ? 'close' : 'grid'} size={28} color="#0f172a" />
        </Animated.View>
      </TouchableOpacity>

      {/* Radial Menu Items */}
      {expanded && (
        <View className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
          {sections.map((section, index) => {
            const angle = (index * 60 - 90) * (Math.PI / 180);
            const radius = 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <TouchableOpacity
                key={section.id}
                onPress={() => {
                  onSectionChange(section.id);
                  setExpanded(false);
                }}
                className="absolute w-14 h-14 rounded-full items-center justify-center shadow-xl"
                style={{
                  left: x - 28,
                  top: y - 28,
                  backgroundColor: section.color,
                }}
                activeOpacity={0.8}
              >
                <Ionicons name={section.icon} size={24} color="#ffffff" />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
