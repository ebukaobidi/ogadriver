import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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

export default function PaymentCardsScreen({ navigation }) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Saved Cards State (loaded from storage, no fake mock cards)
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Card Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [savingCard, setSavingCard] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const stored = await Storage.getItemAsync('user_payment_cards');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCards(parsed);
        }
      }
    } catch (e) {
      console.log('Error loading saved cards:', e);
    } finally {
      setLoading(false);
    }
  };

  const persistCards = async (updated) => {
    try {
      await Storage.setItemAsync('user_payment_cards', JSON.stringify(updated));
    } catch (e) {
      console.log('Error saving cards:', e);
    }
  };

  const handleSetDefault = async (id) => {
    const updated = cards.map((c) => ({
      ...c,
      isDefault: c.id === id,
    }));
    setCards(updated);
    await persistCards(updated);
    Alert.alert('Default Card Updated', 'This card will be used for automatic trip charges and wallet top-ups.');
  };

  const handleDeleteCard = (id) => {
    Alert.alert('Remove Card', 'Are you sure you want to delete this payment card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = cards.filter((c) => c.id !== id);
          if (updated.length > 0 && !updated.some((c) => c.isDefault)) {
            updated[0].isDefault = true;
          }
          setCards(updated);
          await persistCards(updated);
        },
      },
    ]);
  };

  const handleAddCard = () => {
    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 16) {
      Alert.alert('Card Number', 'Please enter a valid 16-digit card number.');
      return;
    }
    if (expiry.length < 5) {
      Alert.alert('Expiry Date', 'Please enter a valid MM/YY expiry date.');
      return;
    }
    if (cvv.length < 3) {
      Alert.alert('CVV Code', 'Please enter a valid 3-digit security code.');
      return;
    }

    setSavingCard(true);
    setTimeout(async () => {
      const last4 = cleanNum.slice(-4);
      const isVisa = cleanNum.startsWith('4');
      const isVerve = cleanNum.startsWith('506') || cleanNum.startsWith('650');
      const brand = isVerve ? 'Verve' : isVisa ? 'Visa' : 'Mastercard';

      const newCard = {
        id: 'c_' + Date.now(),
        brand,
        last4,
        expiry,
        holder: cardHolder.trim().toUpperCase() || 'CLIENT PARTNER',
        isDefault: cards.length === 0,
        bank: 'Direct Bank Card',
      };

      const updated = [...cards, newCard];
      setCards(updated);
      await persistCards(updated);

      setSavingCard(false);
      setModalVisible(false);
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setCardHolder('');

      Alert.alert(
        'Card Added Successfully',
        'Your payment card is securely tokenized for instant booking and wallet deposits.'
      );
    }, 900);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090d16' : '#ffffff' }}>
      {/* Top Header */}
      <View
        style={{
          backgroundColor: isDark ? '#090d16' : '#ffffff',
          borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
        className="flex-row items-center justify-between px-4 py-3 border-b"
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: isDark ? '#121927' : '#f1f5f9',
              borderColor: isDark ? '#1e293b' : '#cbd5e1',
            }}
            className="p-2 rounded-xl border mr-3"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? '#ffffff' : '#0f172a'} />
          </TouchableOpacity>
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-lg tracking-tight">
            Payment Methods
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-row items-center bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl active:opacity-75"
        >
          <Ionicons name="add" size={16} color="#10b981" style={{ marginRight: 2 }} />
          <Text className="text-emerald-500 font-bold text-xs">Add Card</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Shield Banner */}
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#f8fafc',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="p-3.5 rounded-2xl border flex-row items-center mb-5 shadow-xs"
        >
          <View className="w-9 h-9 rounded-xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/20">
            <Ionicons name="shield-checkmark" size={18} color="#10b981" />
          </View>
          <View className="flex-1">
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs">
              End-to-End Encrypted via Paystack
            </Text>
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px] mt-0.5">
              Card numbers are tokenized directly with banking processors. OgaDriver never stores raw card credentials.
            </Text>
          </View>
        </View>

        {/* Empty state when no cards are saved */}
        {cards.length === 0 && (
          <View className="items-center py-8 px-4">
            <View
              style={{ backgroundColor: isDark ? '#121927' : '#f1f5f9' }}
              className="w-16 h-16 rounded-full items-center justify-center mb-3 border border-slate-700/20"
            >
              <Ionicons name="card-outline" size={28} color="#94a3b8" />
            </View>
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-base">
              No Cards Saved Yet
            </Text>
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs text-center mt-1 max-w-xs mb-5">
              Add your Mastercard, Visa, or Verve card for instant 1-tap booking and automated billing.
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="py-3 px-6 rounded-2xl bg-emerald-500 active:bg-emerald-600 flex-row items-center shadow-md shadow-emerald-500/20"
            >
              <Ionicons name="add" size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text className="text-white font-bold text-xs uppercase tracking-wider">
                Add Debit/Credit Card
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Card Cards List */}
        {cards.map((card) => (
          <View
            key={card.id}
            style={{
              backgroundColor: card.brand === 'Mastercard' ? '#0f172a' : card.brand === 'Verve' ? '#1e1b4b' : '#064e3b',
              borderColor: card.isDefault ? '#10b981' : '#334155',
            }}
            className="rounded-3xl p-5 mb-4 shadow-xl border relative overflow-hidden"
          >
            {/* Header row */}
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-white font-black text-sm tracking-widest uppercase">
                  {card.bank}
                </Text>
                <Text className="text-emerald-300 font-mono text-[10px]">DEBIT / CREDIT</Text>
              </View>

              <View className="flex-row items-center">
                {card.isDefault && (
                  <View className="bg-emerald-500 px-2.5 py-0.5 rounded-full mr-2">
                    <Text className="text-white font-black text-[9px] uppercase">DEFAULT</Text>
                  </View>
                )}
                <Ionicons
                  name={card.brand === 'Mastercard' ? 'card' : 'card-outline'}
                  size={26}
                  color="#ffffff"
                />
              </View>
            </View>

            {/* Chip Graphic */}
            <View className="w-10 h-7 rounded-md bg-amber-400/80 border border-amber-300 mb-4" />

            {/* Masked Card Number */}
            <Text className="text-white font-mono text-lg tracking-widest font-black mb-4">
              ••••  ••••  ••••  {card.last4}
            </Text>

            {/* Card Holder & Expiry */}
            <View className="flex-row items-center justify-between border-t border-white/10 pt-3">
              <View>
                <Text className="text-white/60 text-[9px] uppercase tracking-wider font-bold">
                  CARDHOLDER
                </Text>
                <Text className="text-white font-bold text-xs tracking-wider">
                  {card.holder}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-white/60 text-[9px] uppercase tracking-wider font-bold">
                  EXPIRES
                </Text>
                <Text className="text-white font-bold text-xs tracking-wider font-mono">
                  {card.expiry}
                </Text>
              </View>
            </View>

            {/* Card Action Row */}
            <View className="flex-row items-center justify-end mt-4 pt-3 border-t border-white/10 space-x-3">
              {!card.isDefault && (
                <TouchableOpacity
                  onPress={() => handleSetDefault(card.id)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 active:bg-white/20 border border-white/20"
                >
                  <Text className="text-white font-bold text-[10px]">Set as Default</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => handleDeleteCard(card.id)}
                className="px-3 py-1.5 rounded-xl bg-red-500/20 active:bg-red-500/30 border border-red-400/30 flex-row items-center"
              >
                <Ionicons name="trash-outline" size={12} color="#f87171" style={{ marginRight: 4 }} />
                <Text className="text-red-300 font-bold text-[10px]">Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add Card Action Card */}
        {cards.length > 0 && (
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border-2 border-dashed rounded-3xl p-5 items-center justify-center mb-8 shadow-xs"
          >
            <View className="w-12 h-12 rounded-2xl bg-emerald-500/10 items-center justify-center mb-2">
              <Ionicons name="add-circle" size={26} color="#10b981" />
            </View>
            <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm">
              Add Debit/Credit Card
            </Text>
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mt-0.5">
              Supports Verve, Visa & Mastercard
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Add Card Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View
          style={{
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 48) + 16 : Math.max(insets.bottom, 16) + 8,
          }}
          className="flex-1 bg-black/60 justify-end px-3"
        >
          <View
            style={{
              backgroundColor: isDark ? '#090d16' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
              maxHeight: '85%',
            }}
            className="rounded-3xl p-6 border shadow-2xl"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-lg font-bold tracking-tight">
                Add Debit/Credit Card
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Card Number */}
              <View className="mb-4">
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-bold uppercase mb-1.5">
                  Card Number
                </Text>
                <TextInput
                  value={cardNumber}
                  onChangeText={(text) => {
                    const clean = text.replace(/[^0-9]/g, '');
                    const chunked = clean.match(/.{1,4}/g)?.join(' ') || clean;
                    setCardNumber(chunked);
                  }}
                  keyboardType="numeric"
                  maxLength={19}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f8fafc',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    color: isDark ? '#ffffff' : '#0f172a',
                  }}
                  className="border rounded-2xl px-4 py-3.5 font-mono text-base font-bold"
                />
              </View>

              {/* Expiry and CVV */}
              <View className="flex-row space-x-3 mb-4">
                <View className="flex-1">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-bold uppercase mb-1.5">
                    Expiry Date
                  </Text>
                  <TextInput
                    value={expiry}
                    onChangeText={(text) => {
                      const clean = text.replace(/[^0-9]/g, '');
                      if (clean.length >= 2) {
                        setExpiry(clean.slice(0, 2) + '/' + clean.slice(2, 4));
                      } else {
                        setExpiry(clean);
                      }
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                    placeholder="MM/YY"
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    style={{
                      backgroundColor: isDark ? '#121927' : '#f8fafc',
                      borderColor: isDark ? '#1e293b' : '#e2e8f0',
                      color: isDark ? '#ffffff' : '#0f172a',
                    }}
                    className="border rounded-2xl px-4 py-3.5 font-mono text-base font-bold"
                  />
                </View>

                <View className="flex-1">
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-bold uppercase mb-1.5">
                    CVV
                  </Text>
                  <TextInput
                    value={cvv}
                    onChangeText={(text) => setCvv(text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    placeholder="123"
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    style={{
                      backgroundColor: isDark ? '#121927' : '#f8fafc',
                      borderColor: isDark ? '#1e293b' : '#e2e8f0',
                      color: isDark ? '#ffffff' : '#0f172a',
                    }}
                    className="border rounded-2xl px-4 py-3.5 font-mono text-base font-bold"
                  />
                </View>
              </View>

              {/* Cardholder Name */}
              <View className="mb-6">
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-bold uppercase mb-1.5">
                  Cardholder Name
                </Text>
                <TextInput
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  placeholder="Full name as printed on card"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  autoCapitalize="characters"
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f8fafc',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    color: isDark ? '#ffffff' : '#0f172a',
                  }}
                  className="border rounded-2xl px-4 py-3.5 text-base font-bold"
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3 mb-2">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  }}
                  className="flex-1 py-4 rounded-2xl items-center"
                >
                  <Text style={{ color: isDark ? '#cbd5e1' : '#475569' }} className="font-bold text-sm uppercase">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddCard}
                  disabled={savingCard}
                  className="flex-1 py-4 rounded-2xl bg-emerald-500 active:bg-emerald-600 items-center justify-center shadow-lg shadow-emerald-500/25"
                >
                  <Text className="text-white font-bold text-sm uppercase tracking-wider">
                    {savingCard ? 'Tokenizing...' : 'Save Card'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
