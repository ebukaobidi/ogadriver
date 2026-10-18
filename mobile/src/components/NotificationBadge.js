import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NotificationBadge({ count, max = 99, size = 16 }) {
  if (!count || count === 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          minWidth: size,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.5 }]}>
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 8,
  },
});
