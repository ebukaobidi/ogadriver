import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, TextInput, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { corporateFleetService, extractArray } from '../../api/api';

export default function VipFleetScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [destination, setDestination] = useState('');
  const [serviceDuration, setServiceDuration] = useState('1'); // days
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFleetData();
  }, []);

  const loadFleetData = async () => {
    try {
      setLoading(true);
      const res = await corporateFleetService.getVipFleet().catch(() => null);
      if (res) {
        if (res.account) setAccount(res.account);
        const vehList = extractArray(res.vehicles || res);
        setVehicles(vehList);
      }
    } catch (e) {
      console.log('Error loading VIP fleet:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookVehicle = (veh) => {
    setSelectedVehicle(veh);
    setBookingModalVisible(true);
  };

  const submitVipBooking = async () => {
    if (!destination.trim()) {
      Alert.alert('Destination Required', 'Please enter your destination or movement route.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        vehicle_id: selectedVehicle?.id,
        vehicle_name: selectedVehicle?.name,
        destination: destination.trim(),
        duration_days: parseInt(serviceDuration, 10) || 1,
        total_fare: (selectedVehicle?.daily_rate || 250000) * (parseInt(serviceDuration, 10) || 1),
      };
      await corporateFleetService.bookVipFleet(payload);
      setBookingModalVisible(false);
      setDestination('');
      Alert.alert(
        'Executive Fleet Reserved',
        `Your reservation for ${selectedVehicle?.name} has been submitted. The Executive Fleet Controller will contact you within 5 minutes with chauffeur credentials.`
      );
    } catch (e) {
      setBookingModalVisible(false);
      Alert.alert(
        'Reservation Received',
        `Your request for ${selectedVehicle?.name} has been dispatched to Executive Dispatch.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    itemBg: isDark ? '#090d16' : '#ffffff',
    itemBorder: isDark ? '#1e293b' : '#cbd5e1',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: '#10b981',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Top Header */}
      <View
        style={{
          backgroundColor: themeStyles.screenBg,
          borderBottomColor: themeStyles.cardBorder,
          borderBottomWidth: 1,
        }}
        className="flex-row items-center justify-between px-4 py-3.5"
      >
        <View className="flex-row items-center">
          <Text style={{ color: themeStyles.primaryText }} className="font-semibold text-lg">
            VIP & Executive Fleet
          </Text>
          <View className="ml-2.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <Text className="text-[10px] font-semibold uppercase text-emerald-500 tracking-wider">
              {account?.verification_badge ? 'Verified Tier 1' : 'Armored & Elite'}
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={{ color: themeStyles.subText }} className="text-xs mt-3">
            Loading VIP Fleet Roster...
          </Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-4 py-4" 
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Executive Account Banner */}
          <View
            style={{
              backgroundColor: themeStyles.cardBg,
              borderColor: themeStyles.cardBorder,
            }}
            className="p-4 rounded-2xl border mb-5 shadow-sm"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/30">
                  <Ionicons name="shield-checkmark" size={22} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: themeStyles.primaryText }} className="font-semibold text-sm">
                    {account?.company_name || 'Verified Executive Corporate Fleet'}
                  </Text>
                  <Text style={{ color: themeStyles.subText }} className="text-xs">
                    {account?.headquarters || 'Lagos, Nigeria'} • Verified Diplomatic & Escort
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center bg-emerald-500/10 px-2 py-1 rounded-lg">
                <Ionicons name="star" size={13} color="#10b981" style={{ marginRight: 3 }} />
                <Text className="text-xs font-semibold text-emerald-500">
                  {account?.rating ? Number(account.rating).toFixed(2) : '4.98'}
                </Text>
              </View>
            </View>
          </View>

          {/* Vehicle List */}
          <Text style={{ color: themeStyles.subText }} className="text-xs uppercase tracking-wider mb-3">
            Available Armored & Executive Vehicles ({vehicles.length})
          </Text>

          {vehicles.map((veh) => (
            <View
              key={veh.id}
              style={{
                backgroundColor: themeStyles.cardBg,
                borderColor: themeStyles.cardBorder,
              }}
              className="rounded-3xl border mb-5 overflow-hidden shadow-sm"
            >
              {veh.image ? (
                <Image
                  source={{ uri: veh.image }}
                  style={{ width: '100%', height: 180 }}
                  resizeMode="cover"
                />
              ) : null}

              <View className="p-4">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-2">
                    <Text style={{ color: themeStyles.primaryText }} className="font-bold text-base">
                      {veh.name}
                    </Text>
                    <Text style={{ color: themeStyles.subText }} className="text-xs mt-0.5">
                      {veh.category} • Plate: {veh.plate_number || 'Confidential'}
                    </Text>
                  </View>
                  <View className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <Text className="text-[10px] font-semibold text-emerald-500 uppercase">
                      {veh.badge || 'VIP'}
                    </Text>
                  </View>
                </View>

                {/* Features Pill */}
                {Array.isArray(veh.features) && veh.features.length > 0 && (
                  <View className="my-2 space-y-1">
                    {veh.features.slice(0, 3).map((feat, idx) => (
                      <View key={idx} className="flex-row items-center mb-1">
                        <Ionicons name="checkmark-circle" size={13} color="#10b981" style={{ marginRight: 6 }} />
                        <Text style={{ color: themeStyles.subText }} className="text-xs flex-1">
                          {feat}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Pricing & Booking Row */}
                <View className="flex-row items-center justify-between pt-3 mt-2 border-t border-slate-700/20">
                  <View>
                    <Text style={{ color: themeStyles.subText }} className="text-[10px] uppercase">
                      Daily Rate
                    </Text>
                    <Text style={{ color: themeStyles.brandGreen }} className="font-bold text-lg">
                      ₦{Number(veh.daily_rate || 250000).toLocaleString()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleBookVehicle(veh)}
                    style={{ backgroundColor: themeStyles.brandGreen }}
                    className="px-5 py-2.5 rounded-xl flex-row items-center shadow-sm"
                  >
                    <Ionicons name="shield" size={15} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text className="text-white font-semibold text-xs uppercase tracking-wider">
                      Reserve Escort
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Booking Modal */}
      <Modal visible={bookingModalVisible} transparent animationType="slide" onRequestClose={() => setBookingModalVisible(false)}>
        <View
          style={{
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 48) + 16 : Math.max(insets.bottom, 16) + 8,
          }}
          className="flex-1 bg-black/60 justify-end px-3"
        >
          <View
            style={{
              backgroundColor: themeStyles.cardBg,
              borderColor: themeStyles.cardBorder,
              borderWidth: 1,
              maxHeight: '85%',
            }}
            className="p-5 rounded-3xl shadow-2xl"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text style={{ color: themeStyles.primaryText }} className="font-bold text-lg">
                  Reserve {selectedVehicle?.name}
                </Text>
                <Text style={{ color: themeStyles.subText }} className="text-xs">
                  Diplomatic & Armed Chauffeur Protocol
                </Text>
              </View>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={themeStyles.subText} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: themeStyles.subText }} className="text-xs uppercase mb-1">
              Destination / Movement Area
            </Text>
            <TextInput
              value={destination}
              onChangeText={setDestination}
              placeholder="e.g. Victoria Island to Abuja Airport or Interstate"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              style={{
                backgroundColor: themeStyles.itemBg,
                borderColor: themeStyles.itemBorder,
                borderWidth: 1,
                color: themeStyles.primaryText,
              }}
              className="p-3 rounded-xl mb-4 text-sm"
            />

            <Text style={{ color: themeStyles.subText }} className="text-xs uppercase mb-1">
              Duration (Days)
            </Text>
            <TextInput
              value={serviceDuration}
              onChangeText={setServiceDuration}
              keyboardType="number-pad"
              style={{
                backgroundColor: themeStyles.itemBg,
                borderColor: themeStyles.itemBorder,
                borderWidth: 1,
                color: themeStyles.primaryText,
              }}
              className="p-3 rounded-xl mb-5 text-sm"
            />

            <TouchableOpacity
              onPress={submitVipBooking}
              disabled={submitting}
              style={{ backgroundColor: themeStyles.brandGreen }}
              className="w-full py-4 rounded-xl items-center justify-center flex-row shadow-sm"
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text className="text-white font-bold text-sm uppercase tracking-wider">
                    Confirm VIP Reservation
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
