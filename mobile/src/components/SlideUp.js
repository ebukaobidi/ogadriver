import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export default function SlideUp({ children, duration = 500, delay = 0, distance = 30, style }) {
  const slideAnim = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, duration, delay, distance]);

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }], ...style }}>
      {children}
    </Animated.View>
  );
}
