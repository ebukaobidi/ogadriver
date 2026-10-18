import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../../context/ThemeContext';

const Storage = {
  getItemAsync: async (key) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  },
  setItemAsync: async (key, val) => {
    if (Platform.OS === 'web') return localStorage.setItem(key, val);
    return await SecureStore.setItemAsync(key, val);
  },
};

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000];

export default function GiftFundsScreen({ navigation }) {
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('send'); // 'send' | 'invite'
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [giftAmount, setGiftAmount] = useState('2000');
  const [personalNote, setPersonalNote] = useState('Enjoy a safe, comfortable ride on me!');
  const [submitting, setSubmitting] = useState(false);

  const inviteCode = 'OGA-GIFT-2026';

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `🎁 Here is ₦2,000 OgaDriver Ride Gift Credit! Use my invite code: ${inviteCode} to claim instant discount on your first verified ride or chauffeur booking at https://ogadriver.ng`,
        title: 'OgaDriver Ride Gift Credit',
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  const handleSendGift = () => {
    const cleanPhone = recipientPhone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      Alert.alert('Phone Required', 'Please provide a valid recipient phone number.');
      return;
    }

    const amt = parseInt(giftAmount, 10) || 0;
    if (amt < 500) {
      Alert.alert('Minimum Amount', 'Minimum gift fund voucher is ₦500.');
      return;
    }

    Alert.alert(
      'Confirm Gift Fund Voucher',
      `Send ₦${amt.toLocaleString()} ride credit to ${recipientName || cleanPhone}? This will be credited directly to their OgaDriver wallet from your prepaid balance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Gift Now',
          onPress: () => {
            setSubmitting(true);
            setTimeout(() => {
              setSubmitting(false);
              Alert.alert(
                '🎉 Gift Voucher Sent!',
                `₦${amt.toLocaleString()} has been dispatched to ${cleanPhone}. An encrypted SMS notification with your note has been sent.`,
                [{ text: 'Done', onPress: () => navigation.goBack() }]
              );
            }, 1000);
          },
        },
      ]
    );
  };

  const bgStyle = { backgroundColor: isDark ? '#090d16' : '#ffffff' };
  const cardBgStyle = {
    backgroundColor: isDark ? '#121927' : '#ffffff',
    borderColor: isDark ? '#1e293b' : '#e2e8f0',
  };
  const inputBgStyle = {
    backgroundColor: isDark ? '#0d131f' : '#f8fafc',
    borderColor: isDark ? '#1e293b' : '#e2e8f0',
    color: isDark ? '#ffffff' : '#0f172a',
  };

  return (
    <SafeAreaView style={[{ flex: 1 }, bgStyle]}>
      {/* Top Header */}
      <View
        style={{
          backgroundColor: isDark ? '#090d16' : '#ffffff',
          borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
        className="flex-row items-center justify-between px-4 py-3 border-b"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-xl items-center justify-center bg-slate-100 dark:bg-slate-800"
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? '#ffffff' : '#0f172a'} />
        </TouchableOpacity>

        <View className="items-center">
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-base">
            Gift Funds & Ride Vouchers
          </Text>
          <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px]">
            Send Wallet Balance or Referral Bonuses
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleShareInvite}
          className="w-10 h-10 rounded-xl items-center justify-center bg-slate-100 dark:bg-slate-800"
        >
          <Ionicons name="share-social-outline" size={18} color="#10b981" />
        </TouchableOpacity>
      </View>

      {/* Switcher Tab */}
      <View className="flex-row p-4 pb-2">
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#f1f5f9',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="flex-1 flex-row p-1 rounded-2xl border"
        >
          <TouchableOpacity
            onPress={() => setActiveTab('send')}
            style={{
              backgroundColor: activeTab === 'send' ? '#10b981' : 'transparent',
            }}
            className="flex-1 py-2 rounded-xl items-center"
          >
            <Text
              style={{
                color: activeTab === 'send' ? '#ffffff' : isDark ? '#94a3b8' : '#64748b',
              }}
              className="font-normal text-xs uppercase"
            >
              Send Ride Credit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('invite')}
            style={{
              backgroundColor: activeTab === 'invite' ? '#10b981' : 'transparent',
            }}
            className="flex-1 py-2 rounded-xl items-center"
          >
            <Text
              style={{
                color: activeTab === 'invite' ? '#ffffff' : isDark ? '#94a3b8' : '#64748b',
              }}
              className="font-normal text-xs uppercase"
            >
              Give ₦2,000 Bonus
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
        {activeTab === 'send' ? (
          <View>
            {/* Explanatory Banner */}
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#ecfdf5',
                borderColor: '#10b981',
              }}
              className="p-4 rounded-3xl border mb-5 shadow-sm"
            >
              <View className="flex-row items-center mb-1.5">
                <View className="w-8 h-8 rounded-xl bg-emerald-500/20 items-center justify-center mr-2.5">
                  <Ionicons name="gift" size={18} color="#10b981" />
                </View>
                <Text style={{ color: isDark ? '#ffffff' : '#065f46' }} className="font-normal text-sm">
                  What is Gift Fund?
                </Text>
              </View>
              <Text style={{ color: isDark ? '#94a3b8' : '#047857' }} className="text-xs leading-5">
                Gift Fund allows you to transfer ride credit or sponsor trips for your loved ones, colleagues, or guests. The amount is debited from your Prepaid Wallet and credited directly to the recipient's phone number.
              </Text>
            </View>

            {/* Recipient Details */}
            <View style={cardBgStyle} className="p-4 rounded-3xl border mb-4 shadow-sm">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs uppercase tracking-wider mb-3">
                Recipient Details
              </Text>

              <View className="space-y-3">
                <View>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] uppercase mb-1">
                    Recipient Phone Number *
                  </Text>
                  <TextInput
                    value={recipientPhone}
                    onChangeText={setRecipientPhone}
                    placeholder="+234 803 000 0000"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    style={inputBgStyle}
                    className="p-3 rounded-xl border text-xs font-mono"
                  />
                </View>

                <View>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] uppercase mb-1">
                    Recipient Name (Optional)
                  </Text>
                  <TextInput
                    value={recipientName}
                    onChangeText={setRecipientName}
                    placeholder="e.g. Tunde Oladele"
                    placeholderTextColor="#94a3b8"
                    style={inputBgStyle}
                    className="p-3 rounded-xl border text-xs"
                  />
                </View>
              </View>
            </View>

            {/* Amount Selection */}
            <View style={cardBgStyle} className="p-4 rounded-3xl border mb-4 shadow-sm">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs uppercase tracking-wider mb-3">
                Gift Voucher Amount
              </Text>

              <View className="flex-row space-x-2 mb-3">
                {PRESET_AMOUNTS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => setGiftAmount(amt.toString())}
                    style={{
                      backgroundColor: giftAmount === amt.toString() ? '#10b981' : isDark ? '#0d131f' : '#f1f5f9',
                      borderColor: giftAmount === amt.toString() ? '#10b981' : isDark ? '#1e293b' : '#e2e8f0',
                    }}
                    className="flex-1 py-2.5 rounded-xl border items-center justify-center"
                  >
                    <Text
                      style={{
                        color: giftAmount === amt.toString() ? '#ffffff' : isDark ? '#cbd5e1' : '#334155',
                      }}
                      className="font-normal text-xs"
                    >
                      ₦{(amt / 1000).toFixed(0)}k
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] uppercase mb-1">
                  Custom Amount (₦)
                </Text>
                <TextInput
                  value={giftAmount}
                  onChangeText={setGiftAmount}
                  placeholder="Enter amount"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  style={inputBgStyle}
                  className="p-3 rounded-xl border text-xs font-mono"
                />
              </View>
            </View>

            {/* Note */}
            <View style={cardBgStyle} className="p-4 rounded-3xl border mb-5 shadow-sm">
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] uppercase mb-1">
                Personal Message (Included in SMS)
              </Text>
              <TextInput
                value={personalNote}
                onChangeText={setPersonalNote}
                placeholder="Write a warm note..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={2}
                style={inputBgStyle}
                className="p-3 rounded-xl border text-xs"
              />
            </View>

            <TouchableOpacity
              onPress={handleSendGift}
              disabled={submitting}
              className="py-4 rounded-2xl bg-emerald-500 active:bg-emerald-600 items-center justify-center shadow-lg shadow-emerald-500/20 mb-8"
            >
              <Text className="text-white font-normal text-sm uppercase tracking-wider">
                Send ₦{(parseInt(giftAmount, 10) || 0).toLocaleString()} Gift Voucher
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Invite & Give ₦2k Banner */}
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#ecfdf5',
                borderColor: '#10b981',
              }}
              className="p-5 rounded-3xl border mb-5 shadow-sm items-center text-center"
            >
              <View className="w-14 h-14 rounded-2xl bg-emerald-500/20 items-center justify-center mb-3">
                <Ionicons name="sparkles" size={28} color="#10b981" />
              </View>
              <Text style={{ color: isDark ? '#ffffff' : '#065f46' }} className="font-normal text-base text-center">
                Give ₦2,000, Earn ₦1,000
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#047857' }} className="text-xs text-center mt-1 leading-5 px-2">
                When your friend signs up with your code, they get ₦2,000 off their first ride or driver booking. You receive ₦1,000 credit when they complete their first trip!
              </Text>

              {/* Code Pill */}
              <View className="mt-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 flex-row items-center space-x-3">
                <Text style={{ color: '#10b981' }} className="font-mono text-base tracking-widest">
                  {inviteCode}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleShareInvite}
              className="py-4 rounded-2xl bg-emerald-500 active:bg-emerald-600 items-center justify-center shadow-lg shadow-emerald-500/20 mb-8 flex-row"
            >
              <Ionicons name="share-social" size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text className="text-white font-normal text-sm uppercase tracking-wider">
                Share Invite Link
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
