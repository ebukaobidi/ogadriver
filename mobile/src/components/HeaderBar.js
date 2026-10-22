import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function HeaderBar({ 
  navigation, 
  title, 
  subtitle,
  showBack, 
  onBack,
  hasUnread = false,
  showThemeToggle = false,
  showNotification = true,
  rightComponent,
}) {
  const { isDark, updateThemeMode } = useTheme();

  // Only show back button if explicitly requested with showBack={true}
  // Main screens do NOT show back button
  const shouldShowBack = Boolean(showBack === true);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('Home');
    }
  };

  // Android hardware back button handler
  useEffect(() => {
    const onHardwareBack = () => {
      if (shouldShowBack) {
        handleBack();
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [shouldShowBack, onBack, navigation]);

  const containerBg = isDark ? '#090d16' : '#ffffff';
  const borderColor = isDark ? '#1e293b' : '#e2e8f0';
  const buttonBg = isDark ? '#121927' : '#f1f5f9';
  const buttonBorder = isDark ? '#1e293b' : '#cbd5e1';
  const iconColor = isDark ? '#00e588' : '#059669';
  const brandGreen = isDark ? '#00e588' : '#059669';
  const partnerTextColor = isDark ? '#ffffff' : '#0f172a';
  const titleColor = isDark ? '#ffffff' : '#0f172a';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';

  const handleToggleTheme = () => {
    updateThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <View 
      style={{ 
        backgroundColor: containerBg, 
        borderBottomColor: borderColor, 
        borderBottomWidth: 1 
      }} 
      className="px-4 py-3.5 flex-row justify-between items-center z-50"
    >
      {/* Left Section: Back Button + Title/Brand */}
      <View className="flex-row items-center flex-1 mr-2">
        {shouldShowBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={{ backgroundColor: buttonBg, borderColor: buttonBorder }}
            className="w-9 h-9 rounded-xl border items-center justify-center mr-3 shadow-sm active:opacity-75"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={18} color={iconColor} />
          </TouchableOpacity>
        )}

        {title ? (
          <View className="flex-1">
            <Text style={{ color: titleColor }} className="font-semibold text-base" numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={{ color: subTextColor }} className="text-xs mt-0.5" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Right Section: Theme Toggle & Notification Bell or Custom Component */}
      <View className="flex-row items-center space-x-2">
        {rightComponent}

        {/* Display Theme Single Icon Switcher (Light / Dark) */}
        {showThemeToggle && (
          <TouchableOpacity 
            onPress={handleToggleTheme}
            style={{ backgroundColor: buttonBg, borderColor: buttonBorder }}
            className="w-9 h-9 rounded-xl border items-center justify-center shadow-sm mr-2"
            activeOpacity={0.7}
            accessibilityLabel="Toggle Theme"
          >
            <Ionicons 
              name={isDark ? "sunny" : "moon"} 
              size={18} 
              color={brandGreen} 
            />
          </TouchableOpacity>
        )}

        {/* Notification Bell */}
        {showNotification && (
          <TouchableOpacity 
            style={{ backgroundColor: buttonBg, borderColor: buttonBorder }}
            className="w-9 h-9 rounded-xl border items-center justify-center relative shadow-sm"
            onPress={() => navigation?.navigate('Conversations')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={18} color={brandGreen} />
            {hasUnread && (
              <View 
                style={{ backgroundColor: brandGreen, borderColor: containerBg }} 
                className="w-2.5 h-2.5 rounded-full absolute top-1.5 right-1.5 border-2" 
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
