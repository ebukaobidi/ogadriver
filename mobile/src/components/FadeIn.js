import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export default function FadeIn({ children, duration = 500, delay = 0, style }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View style={{ opacity: fadeAnim, ...style }}>
      {children}
    </Animated.View>
  );
}
