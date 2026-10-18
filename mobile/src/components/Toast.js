import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Toast({ message, type = 'success', visible, onHide }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible) return null;

  const typeConfig = {
    success: {
      icon: 'checkmark-circle',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.95)',
      borderColor: '#34d399',
    },
    error: {
      icon: 'close-circle',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.95)',
      borderColor: '#f87171',
    },
    warning: {
      icon: 'warning',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.95)',
      borderColor: '#fbbf24',
    },
    info: {
      icon: 'information-circle',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.95)',
      borderColor: '#60a5fa',
    },
  };

  const config = typeConfig[type] || typeConfig.success;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
      ]}
    >
      <Ionicons name={config.icon} size={24} color={config.color} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  message: {
    flex: 1,
    marginLeft: 12,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
