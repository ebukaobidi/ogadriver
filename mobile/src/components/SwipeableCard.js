import React, { useRef } from 'react';
import { View, PanResponder, Animated } from 'react-native';

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 100,
  className = '',
}) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > swipeThreshold) {
          Animated.spring(pan, {
            toValue: { x: 500, y: 0 },
            useNativeDriver: true,
          }).start(() => {
            if (onSwipeRight) onSwipeRight();
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -swipeThreshold) {
          Animated.spring(pan, {
            toValue: { x: -500, y: 0 },
            useNativeDriver: true,
          }).start(() => {
            if (onSwipeLeft) onSwipeLeft();
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        transform: [{ translateX: pan.x }],
      }}
      className={className}
    >
      {children}
    </Animated.View>
  );
}
