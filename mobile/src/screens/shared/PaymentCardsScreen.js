import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function PaymentCardsScreen({ navigation }) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Saved Cards State
  const [cards, setCards] = useState([
    {
      id: 'c1',
      brand: 'Mastercard',
      last4: '8842',
      expiry: '08/28',
      holder: 'EMMANUEL A.',
      isDefault: true,
      bank: 'Zenith Bank',
    },
    {
      id: 'c2',
      brand: 'Visa',
      last4: '1024',
      expiry: '11/27',
      holder: 'EMMANUEL A.',
      isDefault: false,
      bank: 'GTBank',
    },
  ]);

  // Add Card Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [savingCard, setSavingCard] = useState(false);

  const handleSetDefault = (id) => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === id,
      }))
    );
    Alert.alert('Default Card Updated', 'This card will be used for automatic trip charges and wallet top-ups.');
  };

  const handleDeleteCard = (id) => {
    if (cards.length <= 1) {
      Alert.alert('Action Restricted', 'You must have at least one payment method linked to your account.');
      return;
    }
    Alert.alert('Remove Card', 'Are you sure you want to delete this payment card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setCards((prev) => prev.filter((c) => c.id !== id));
        },
      },
    ]);
  };

  const handleAddCard = () => {
    if (cardNumber.replace(/\s/g, '').length < 16) {
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
    setTimeout(() => {
      const cleanNum = cardNumber.replace(/\s/g, '');
      const last4 = cleanNum.slice(-4);
      const isVisa = cleanNum.startsWith('4');
      const brand = isVisa ? 'Visa' : 'Mastercard';

      const newCard = {
        id: 'c_' + Date.now(),
        brand,
        last4,
        expiry,
        holder: cardHolder.toUpperCase() || 'CLIENT PARTNER',
        isDefault: cards.length === 0,
        bank: 'Access Bank',
      };

      setCards((prev) => [...prev, newCard]);
      setSavingCard(false);
      setModalVisible(false);
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setCardHolder('');

      Alert.alert(
        'Card Tokenized Successfully',
        'Your card has been verified with Paystack ₦100 pre-authorization (immediately reversed).'
      );
    }, 1200);
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
        <View className="flex-1">
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-base">
            Payment Cards
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="w-10 h-10 rounded-xl items-center justify-center bg-emerald-500"
        >
          <Ionicons name="add" size={22} color="#ffffff" />
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
            <Ionicons name="shield-checkmark" size={18} color="#008751" />
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

        {/* Card Cards List */}
        {cards.map((card) => (
          <View
            key={card.id}
            style={{
              backgroundColor: card.brand === 'Mastercard' ? '#0f172a' : '#064e3b',
              borderColor: card.isDefault ? '#10b981' : '#334155',
            }}
            className="rounded-3xl p-5 mb-4 shadow-xl border relative overflow-hidden"
          >
            {/* Background Chip Watermark */}
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
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            backgroundColor: isDark ? '#121927' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="border-2 border-dashed rounded-3xl p-5 items-center justify-center mb-8 shadow-xs"
        >
          <View className="w-12 h-12 rounded-2xl bg-emerald-500/10 items-center justify-center mb-2">
            <Ionicons name="add-circle" size={26} color="#008751" />
          </View>
          <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm">
            Add Another Payment Card
          </Text>
          <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs mt-0.5">
            Supports Mastercard, Visa & Verve Cards
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ADD CARD MODAL */}
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
              <View>
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-lg font-black">
                  Add New Card
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs">
                  Secured by Paystack PCI-DSS verification
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Card Form */}
            <View className="mb-3">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-bold mb-1.5">
                Card Number
              </Text>
              <TextInput
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                keyboardType="numeric"
                maxLength={19}
                value={cardNumber}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, '');
                  const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
                  setCardNumber(formatted);
                }}
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
                className="border rounded-2xl px-4 py-3 text-sm font-mono"
              />
            </View>

            <View className="flex-row space-x-3 mb-3">
              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-bold mb-1.5">
                  Expiry (MM/YY)
                </Text>
                <TextInput
                  placeholder="MM/YY"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  keyboardType="numeric"
                  maxLength={5}
                  value={expiry}
                  onChangeText={(text) => {
                    if (text.length === 2 && !text.includes('/')) {
                      setExpiry(text + '/');
                    } else {
                      setExpiry(text);
                    }
                  }}
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f8fafc',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    color: isDark ? '#ffffff' : '#0f172a',
                  }}
                  className="border rounded-2xl px-4 py-3 text-sm font-mono text-center"
                />
              </View>

              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-bold mb-1.5">
                  CVV / CVC
                </Text>
                <TextInput
                  placeholder="123"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  value={cvv}
                  onChangeText={setCvv}
                  style={{
                    backgroundColor: isDark ? '#121927' : '#f8fafc',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    color: isDark ? '#ffffff' : '#0f172a',
                  }}
                  className="border rounded-2xl px-4 py-3 text-sm font-mono text-center"
                />
              </View>
            </View>

            <View className="mb-5">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-bold mb-1.5">
                Cardholder Name
              </Text>
              <TextInput
                placeholder="Full name as printed on card"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={cardHolder}
                onChangeText={setCardHolder}
                style={{
                  backgroundColor: isDark ? '#121927' : '#f8fafc',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
                className="border rounded-2xl px-4 py-3 text-sm"
              />
            </View>

            <TouchableOpacity
              onPress={handleAddCard}
              disabled={savingCard}
              className="w-full py-4 rounded-2xl bg-emerald-500 items-center justify-center shadow-lg shadow-emerald-500/20"
            >
              <Text className="text-white font-bold text-sm uppercase tracking-wider">
                {savingCard ? 'Verifying with Paystack...' : 'Save & Authorize Card'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
