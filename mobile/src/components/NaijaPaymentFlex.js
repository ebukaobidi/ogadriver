import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function NaijaPaymentFlex({ amount, onPaymentSelect }) {
  const { isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('cash');

  const paymentMethods = [
    {
      id: 'cash',
      label: 'Cash Payment',
      icon: 'cash-outline',
      badgeColor: '#10b981',
      description: 'Pay cash directly to driver upon reaching destination',
    },
    {
      id: 'transfer',
      label: 'Instant Bank Transfer',
      icon: 'phone-portrait-outline',
      badgeColor: '#3b82f6',
      description: 'Transfer directly into verified driver bank account',
    },
    {
      id: 'wallet',
      label: 'OgaDriver Wallet',
      icon: 'wallet-outline',
      badgeColor: '#8b5cf6',
      description: 'Zero fee one-tap debit from your funded wallet',
    },
    {
      id: 'ussd',
      label: 'USSD Bank Dial',
      icon: 'keypad-outline',
      badgeColor: '#f59e0b',
      description: 'Quick dial *737#, *894#, *919# or your bank code',
    },
    {
      id: 'pos',
      label: 'Card POS on Board',
      icon: 'card-outline',
      badgeColor: '#ef4444',
      description: 'Driver brings an active bank POS terminal for debit cards',
    },
    {
      id: 'flex',
      label: 'Corporate Invoice / Credit',
      icon: 'receipt-outline',
      badgeColor: '#64748b',
      description: 'Company billed monthly settlement for verified hirers',
    },
  ];

  const handleSelect = (id) => {
    setSelectedMethod(id);
    if (onPaymentSelect) {
      onPaymentSelect(id);
    }
  };

  const handleConfirm = () => {
    if (onPaymentSelect) {
      onPaymentSelect(selectedMethod);
    }
    setModalVisible(false);
  };

  const activeMethod = paymentMethods.find((m) => m.id === selectedMethod) || paymentMethods[0];

  return (
    <>
      {/* Premium Trigger Card */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
        style={{
          backgroundColor: isDark ? '#121927' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
        className="border rounded-2xl p-4 shadow-sm"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-3">
            <View
              style={{
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#a7f3d0',
              }}
              className="w-11 h-11 rounded-xl border items-center justify-center mr-3"
            >
              <Ionicons name="card-outline" size={20} color={isDark ? '#34d399' : '#059669'} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm mr-2">
                  Payment Flexibility
                </Text>
                <View className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Text className="text-[10px] font-normal text-emerald-600 dark:text-brandMint">
                    {activeMethod.label.split(' ')[0]}
                  </Text>
                </View>
              </View>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal mt-0.5">
                Cash, instant transfer, USSD, wallet, or POS machine
              </Text>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-xs font-normal text-emerald-600 dark:text-brandMint">Choose</Text>
            <Ionicons name="chevron-forward" size={16} color={isDark ? '#94a3b8' : '#64748b'} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Payment Options Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="rounded-t-3xl border-t p-5 max-h-[88%]"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <View className="flex-1 mr-2">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-base">
                  Payment Methods
                </Text>
                <Text className="text-xs font-normal text-emerald-600 dark:text-brandMint">
                  Flexible Naija Settlement Options
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
              >
                <Ionicons name="close" size={18} color={isDark ? '#ffffff' : '#0f172a'} />
              </TouchableOpacity>
            </View>

            <ScrollView className="py-4" showsVerticalScrollIndicator={false}>
              {/* Fare Banner */}
              <View
                style={{
                  backgroundColor: isDark ? '#1a2333' : '#f8fafc',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                }}
                className="p-3.5 rounded-2xl border mb-4 flex-row items-center justify-between"
              >
                <View>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal">
                    Estimated Trip Fare
                  </Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-lg mt-0.5">
                    {amount || '₦3,500'}
                  </Text>
                </View>
                <View className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex-row items-center">
                  <Ionicons name="shield-checkmark" size={12} color="#10b981" />
                  <Text className="text-[11px] font-normal text-emerald-600 dark:text-brandMint ml-1">
                    Escrow Safe
                  </Text>
                </View>
              </View>

              {/* Payment Methods List */}
              <View className="space-y-2.5 mb-4">
                {paymentMethods.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  return (
                    <TouchableOpacity
                      key={method.id}
                      onPress={() => handleSelect(method.id)}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: isDark ? '#1a2333' : '#ffffff',
                        borderColor: isSelected ? '#10b981' : isDark ? '#334155' : '#e2e8f0',
                      }}
                      className="p-3.5 rounded-2xl border flex-row items-center"
                    >
                      <View
                        style={{
                          backgroundColor: `${method.badgeColor}15`,
                          borderColor: `${method.badgeColor}30`,
                        }}
                        className="w-10 h-10 rounded-xl border items-center justify-center mr-3"
                      >
                        <Ionicons name={method.icon} size={20} color={method.badgeColor} />
                      </View>

                      <View className="flex-1 mr-2">
                        <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-xs">
                          {method.label}
                        </Text>
                        <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px] font-normal mt-0.5 leading-4">
                          {method.description}
                        </Text>
                      </View>

                      <View
                        className={`w-5 h-5 rounded-full border items-center justify-center ${
                          isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-400 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Ionicons name="checkmark" size={12} color="#ffffff" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Security / Reassurance Notice */}
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#ecfdf5',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#a7f3d0',
                }}
                className="p-3 rounded-xl border flex-row items-center mb-4"
              >
                <Ionicons name="lock-closed-outline" size={16} color="#10b981" />
                <Text style={{ color: isDark ? '#a7f3d0' : '#065f46' }} className="text-xs font-normal ml-2 flex-1 leading-4">
                  Payment is protected. Drivers only receive funds after you confirm trip completion.
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleConfirm}
                className="bg-emerald-500 py-3.5 rounded-2xl items-center active:bg-emerald-600"
              >
                <Text className="text-white text-xs font-normal">Confirm Payment Method</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
