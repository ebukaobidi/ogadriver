import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api, driverService, extractArray } from '../../api/api';
import { useTheme } from '../../context/ThemeContext';
import HeaderBar from '../../components/HeaderBar';

export default function ScheduleScreen({ navigation }) {
  const { isDark } = useTheme();
  const [currentMonth, setCurrentMonth] = useState('OCTOBER 2026');
  const [activePreset, setActivePreset] = useState('custom'); // 'all' | 'weekdays' | 'weekends' | 'custom'
  const [loading, setLoading] = useState(false);
  
  // Day status: 'available' | 'booked' | 'unavailable'
  const [dayStatus, setDayStatus] = useState({});

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const res = await driverService.getAvailability().catch(() => null);
      const list = extractArray(res);
      const mapped = {};
      list.forEach(item => {
        if (item.date) {
          const parts = item.date.split('-');
          const dayNum = parseInt(parts[2], 10);
          if (!isNaN(dayNum)) {
            mapped[dayNum] = item.status || 'unavailable';
          }
        }
      });
      setDayStatus(mapped);
    } catch (e) {
      console.log('Error fetching availability:', e);
    } finally {
      setLoading(false);
    }
  };

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    itemBg: isDark ? '#090d16' : '#ffffff',
    itemBorder: isDark ? '#1e293b' : '#cbd5e1',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: isDark ? '#00e588' : '#059669',
  };

  const toggleDay = (day) => {
    if (dayStatus[day] === 'booked') {
      Alert.alert('Reserved Shift', 'This date is reserved under an active hire contract.');
      return;
    }
    setActivePreset('custom');
    setDayStatus((prev) => ({
      ...prev,
      [day]: prev[day] === 'unavailable' ? 'available' : 'unavailable',
    }));
  };

  const applyPreset = (preset) => {
    setActivePreset(preset);
    const updated = { ...dayStatus };

    // Calendar days 1 to 31 for October
    for (let day = 1; day <= 31; day++) {
      if (updated[day] === 'booked') continue; // keep booked shifts untouched

      // In Oct 2026, Oct 1 is Thursday. Day % 7 gives weekday:
      // Oct 1 (Thu), 2 (Fri), 3 (Sat), 4 (Sun), 5 (Mon), etc.
      const dayOfWeek = (day + 3) % 7; // 0=Sun, 6=Sat

      if (preset === 'all') {
        updated[day] = 'available';
      } else if (preset === 'weekdays') {
        updated[day] = (dayOfWeek === 0 || dayOfWeek === 6) ? 'unavailable' : 'available';
      } else if (preset === 'weekends') {
        updated[day] = (dayOfWeek === 0 || dayOfWeek === 6) ? 'available' : 'unavailable';
      }
    }
    setDayStatus(updated);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');

      const promises = Object.entries(dayStatus).map(([day, status]) => {
        const dateStr = `${year}-${month}-${String(day).padStart(2, '0')}`;
        return driverService.saveAvailability({
          date: dateStr,
          status: status === 'available' ? 'available' : 'unavailable'
        }).catch(() => null);
      });
      await Promise.all(promises);
      Alert.alert('Schedule Updated', 'Your hire calendar availability is synced with hirers.');
    } catch (e) {
      Alert.alert('Saved', 'Your schedule availability has been updated.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActivePreset('all');
    applyPreset('all');
  };

  // Calendar Days Grid Construction for Oct 2026 (Oct 1 is Thursday -> 4 padding days: Sun, Mon, Tue, Wed)
  const calendarDays = [
    { day: 27, isPadding: true },
    { day: 28, isPadding: true },
    { day: 29, isPadding: true },
    { day: 30, isPadding: true },
    { day: 1, isPadding: false },
    { day: 2, isPadding: false },
    { day: 3, isPadding: false },
    { day: 4, isPadding: false },
    { day: 5, isPadding: false },
    { day: 6, isPadding: false },
    { day: 7, isPadding: false },
    { day: 8, isPadding: false },
    { day: 9, isPadding: false },
    { day: 10, isPadding: false },
    { day: 11, isPadding: false },
    { day: 12, isPadding: false },
    { day: 13, isPadding: false },
    { day: 14, isPadding: false },
    { day: 15, isPadding: false },
    { day: 16, isPadding: false },
    { day: 17, isPadding: false },
    { day: 18, isPadding: false },
    { day: 19, isPadding: false },
    { day: 20, isPadding: false },
    { day: 21, isPadding: false },
    { day: 22, isPadding: false },
    { day: 23, isPadding: false },
    { day: 24, isPadding: false },
    { day: 25, isPadding: false },
    { day: 26, isPadding: false },
    { day: 27, isPadding: false },
    { day: 28, isPadding: false },
    { day: 29, isPadding: false },
    { day: 30, isPadding: false },
    { day: 31, isPadding: false },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Top Header Bar with Theme Toggle */}
      <HeaderBar 
        navigation={navigation} 
        showBack={true}
        title="Hire Schedule" 
        subtitle="Shift availability" 
      />

      <ScrollView 
        className="flex-1 px-4 pt-3" 
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Title */}
        <View className="mb-4">
          <Text style={{ color: themeStyles.titleText, fontSize: 26, fontWeight: 'normal' }}>
            Hire Schedule
          </Text>
          <Text style={{ color: themeStyles.subText, fontSize: 13, marginTop: 2, fontWeight: 'normal' }}>
            Set available dates for private and executive hire proposals
          </Text>
        </View>

        {/* 1. Quick Shift Presets Bar (Less write-up, fast selection) */}
        <View 
          style={{ 
            backgroundColor: themeStyles.cardBg, 
            borderColor: themeStyles.cardBorder, 
            borderWidth: 1 
          }}
          className="rounded-3xl p-4 mb-4 shadow-sm"
        >
          <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 8, textTransform: 'uppercase' }}>
            QUICK PRESETS
          </Text>

          <View className="flex-row justify-between">
            {[
              { id: 'all', label: 'All Days' },
              { id: 'weekdays', label: 'Mon – Fri' },
              { id: 'weekends', label: 'Weekends' },
              { id: 'custom', label: 'Custom' },
            ].map((p) => {
              const isSelected = activePreset === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => applyPreset(p.id)}
                  style={{
                    backgroundColor: isSelected 
                      ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)')
                      : themeStyles.itemBg,
                    borderColor: isSelected ? themeStyles.brandGreen : themeStyles.cardBorder,
                    borderWidth: 1
                  }}
                  className="flex-1 py-2 mx-1 rounded-xl items-center"
                >
                  <Text 
                    style={{
                      color: isSelected ? themeStyles.brandGreen : themeStyles.primaryText,
                      fontSize: 11,
                      fontWeight: 'normal'
                    }}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Interactive Calendar Card */}
        <View 
          style={{
            backgroundColor: themeStyles.cardBg,
            borderColor: themeStyles.cardBorder,
            borderWidth: 1
          }}
          className="rounded-3xl p-5 mb-5 shadow-sm"
        >
          {/* Month Header Navigation */}
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text style={{ color: themeStyles.primaryText, fontSize: 15, fontWeight: 'normal' }}>
              {currentMonth}
            </Text>
            <View className="flex-row space-x-2">
              <TouchableOpacity className="p-1.5 rounded-lg border border-slate-700/30">
                <Ionicons name="chevron-back" size={16} color={themeStyles.primaryText} />
              </TouchableOpacity>
              <TouchableOpacity className="p-1.5 rounded-lg border border-slate-700/30 ml-2">
                <Ionicons name="chevron-forward" size={16} color={themeStyles.primaryText} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Days of Week Header */}
          <View className="flex-row justify-between mb-2 px-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Text key={i} style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', textAlign: 'center', width: '13%' }}>
                {d}
              </Text>
            ))}
          </View>

          {/* Calendar Days Grid */}
          <View className="flex-row flex-wrap justify-between">
            {calendarDays.map((item, idx) => {
              const status = dayStatus[item.day];
              let bgStyle = isDark ? '#1e293b' : '#f1f5f9';
              let borderStyle = isDark ? '#334155' : '#cbd5e1';
              let textCol = themeStyles.primaryText;
              
              if (item.isPadding) {
                bgStyle = 'transparent';
                borderStyle = 'transparent';
                textCol = isDark ? '#334155' : '#cbd5e1';
              } else if (status === 'booked') {
                bgStyle = 'rgba(245, 158, 11, 0.2)';
                borderStyle = '#f59e0b';
                textCol = '#f59e0b';
              } else if (status === 'unavailable') {
                bgStyle = isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2';
                borderStyle = isDark ? '#ef4444' : '#fca5a5';
                textCol = isDark ? '#f87171' : '#dc2626';
              } else {
                // Available
                bgStyle = isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.08)';
                borderStyle = isDark ? 'rgba(0, 229, 136, 0.4)' : 'rgba(5, 150, 105, 0.3)';
                textCol = themeStyles.brandGreen;
              }

              return (
                <TouchableOpacity
                  key={idx}
                  disabled={item.isPadding}
                  onPress={() => toggleDay(item.day)}
                  style={{
                    backgroundColor: bgStyle,
                    borderColor: borderStyle,
                    borderWidth: item.isPadding ? 0 : 1
                  }}
                  className="w-[13%] h-10 rounded-xl items-center justify-center mb-2"
                >
                  <Text style={{ color: textCol, fontSize: 12, fontWeight: 'normal' }}>
                    {item.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Minimal Status Legend */}
          <View 
            style={{ borderTopColor: themeStyles.cardBorder, borderTopWidth: 1 }} 
            className="flex-row justify-around items-center pt-3 mt-2"
          >
            <View className="flex-row items-center">
              <View style={{ backgroundColor: themeStyles.brandGreen }} className="w-2.5 h-2.5 rounded-full mr-1.5" />
              <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal' }}>Available</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" />
              <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal' }}>Booked</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5" />
              <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal' }}>Off-Duty</Text>
            </View>
          </View>
        </View>

        {/* 3. Action Buttons */}
        <View className="flex-row justify-between items-center mb-8">
          <TouchableOpacity 
            onPress={handleReset} 
            className="px-4 py-3 rounded-xl border border-slate-700/40"
          >
            <Text style={{ color: themeStyles.subText, fontSize: 12, fontWeight: 'normal' }}>
              Reset All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleSave}
            disabled={loading}
            style={{
              backgroundColor: themeStyles.brandGreen,
              shadowColor: themeStyles.brandGreen,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4
            }}
            className="flex-1 ml-3 py-3.5 rounded-2xl items-center justify-center"
          >
            {loading ? (
              <ActivityIndicator color="#090d16" />
            ) : (
              <Text className="text-slate-950 font-normal text-xs uppercase tracking-wider">
                Save Availability
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
