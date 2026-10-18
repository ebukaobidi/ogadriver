import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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

  const canGoBack = Boolean(navigation?.canGoBack && navigation.canGoBack());
  const shouldShowBack = showBack !== undefined ? showBack : canGoBack;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('Home');
    }
  };

  const containerBg = isDark ? '#090d16' : '#ffffff';
  const borderColor = isDark ? '#1e293b' : '#e2e8f0';
  const buttonBg = isDark ? '#121927' : '#f1f5f9';
  const buttonBorder = isDark ? '#1e293b' : '#cbd5e1';
  const iconColor = isDark ? '#ffffff' : '#0f172a';
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
      className="px-4 py-3 flex-row justify-between items-center z-50"
    >
      {/* Left Section: Back Button or Brand / Title */}
      <View className="flex-row items-center flex-1 mr-2">
        {shouldShowBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={{ backgroundColor: buttonBg, borderColor: buttonBorder }}
            className="mr-3 w-9 h-9 items-center justify-center rounded-full border shadow-sm"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color={iconColor} />
          </TouchableOpacity>
        )}

        {title ? (
          <View className="flex-1">
            <Text style={{ color: titleColor }} className="font-normal text-base" numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={{ color: subTextColor }} className="text-[11px] font-normal" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : (
          <View className="flex-row items-baseline">
            <Text style={{ color: brandGreen }} className="font-normal text-sm tracking-wider uppercase">
              OGADRIVER
            </Text>
            <Text style={{ color: partnerTextColor }} className="font-normal text-sm tracking-wider uppercase ml-1">
              PARTNERS
            </Text>
          </View>
        )}
      </View>

      {/* Right Section: Theme Toggle & Notification Bell or Custom Component */}
      <View className="flex-row items-center space-x-2">
        {rightComponent}

        {/* Display Theme Single Icon Switcher (Light / Dark) */}
        {showThemeToggle && (
          <TouchableOpacity 
            onPress={handleToggleTheme}
            style={{ backgroundColor: buttonBg, borderColor: buttonBorder }}
            className="w-9 h-9 rounded-full border items-center justify-center shadow-sm mr-2"
            activeOpacity={0.7}
            accessibilityLabel="Toggle Theme"
          >
            <Ionicons 
              name={isDark ? "sunny" : "moon"} 
              size={18} 
              color={isDark ? "#f59e0b" : "#475569"} 
            />
          </TouchableOpacity>
        )}

        {/* Notification Bell */}
        {showNotification && (
          <TouchableOpacity 
            style={{ backgroundColor: buttonBg, borderColor: buttonBorder }}
            className="w-9 h-9 rounded-full border items-center justify-center relative shadow-sm"
            onPress={() => navigation?.navigate('Conversations')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={18} color={iconColor} />
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
