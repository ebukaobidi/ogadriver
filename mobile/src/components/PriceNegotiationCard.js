import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function PriceNegotiationCard({ driver, onNegotiate, onAccept }) {
  const { isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [step, setStep] = useState(1); // 1 = Enter/Select Counter-Offer, 2 = Review & Confirm

  const basePriceStr = driver?.price || '₦3,500';
  const numericPrice = parseInt(basePriceStr.replace(/[^0-9]/g, ''), 10) || 3500;
  const currencySymbol = basePriceStr.match(/^[^\d]+/)?.[0] || '₦';

  const discount15 = Math.round(numericPrice * 0.85);
  const discount10 = Math.round(numericPrice * 0.90);
  const discount5 = Math.round(numericPrice * 0.95);

  const handleOpen = () => {
    setOfferPrice(`${currencySymbol}${discount10.toLocaleString()}`);
    setStep(1);
    setModalVisible(true);
  };

  const handleSendOffer = () => {
    if (onNegotiate) {
      onNegotiate(driver, offerPrice);
    }
    setModalVisible(false);
  };

  const handleAcceptBase = () => {
    if (onAccept) {
      onAccept(driver);
    }
    setModalVisible(false);
  };

  return (
    <>
      {/* Premium Card Trigger */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleOpen}
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
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
                borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#fde68a',
              }}
              className="w-11 h-11 rounded-xl border items-center justify-center mr-3"
            >
              <Ionicons name="hand-left-outline" size={20} color={isDark ? '#fbbf24' : '#d97706'} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-sm mr-2">
                  Price Negotiation
                </Text>
                <View className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Text className="text-[10px] font-normal text-amber-600 dark:text-amber-400">Direct Bargain</Text>
                </View>
              </View>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal mt-0.5">
                Counter-offer directly with driver & agree fair price
              </Text>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-xs font-normal text-amber-600 dark:text-amber-400">Open</Text>
            <Ionicons name="chevron-forward" size={16} color={isDark ? '#94a3b8' : '#64748b'} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Negotiation Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 bg-black/60 justify-end"
        >
          <View
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="rounded-t-3xl border-t p-5 max-h-[90%]"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <View className="flex-1 mr-2">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-base">
                  Price Negotiation
                </Text>
                <Text className="text-xs font-normal text-emerald-600 dark:text-brandMint">
                  Transparent Naija Bargaining • Zero Extra Middleman Fee
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
              {/* Benchmark Driver Price Card */}
              <View
                style={{
                  backgroundColor: isDark ? '#1a2333' : '#f8fafc',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                }}
                className="p-3.5 rounded-2xl border mb-4 flex-row items-center justify-between"
              >
                <View>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal">
                    Driver Benchmark Fare
                  </Text>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-normal text-lg mt-0.5">
                    {basePriceStr}
                  </Text>
                </View>
                <View className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Text className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400">
                    {driver?.name || 'Verified Driver'}
                  </Text>
                </View>
              </View>

              {step === 1 ? (
                <>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal mb-2">
                    Enter Your Proposed Fare ({currencySymbol})
                  </Text>

                  {/* Input */}
                  <View
                    style={{
                      backgroundColor: isDark ? '#090d16' : '#f8fafc',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                    }}
                    className="flex-row items-center border rounded-2xl px-4 py-2.5 mb-4"
                  >
                    <Text className="text-base font-normal text-amber-500 mr-2">{currencySymbol}</Text>
                    <TextInput
                      value={offerPrice.replace(/[^0-9]/g, '')}
                      onChangeText={(text) => setOfferPrice(`${currencySymbol}${text}`)}
                      placeholder="e.g. 3000"
                      placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                      keyboardType="numeric"
                      style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                      className="flex-1 text-base font-normal"
                    />
                  </View>

                  {/* Preset Quick Discount Chips */}
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-xs font-normal mb-2">
                    Quick Counter Presets
                  </Text>
                  <View className="space-y-2 mb-5">
                    <TouchableOpacity
                      onPress={() => setOfferPrice(`${currencySymbol}${discount15.toLocaleString()}`)}
                      style={{
                        backgroundColor: isDark ? '#1a2333' : '#ffffff',
                        borderColor: offerPrice.includes(discount15.toString()) ? '#10b981' : isDark ? '#334155' : '#e2e8f0',
                      }}
                      className="p-3 rounded-xl border flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="flash-outline" size={16} color="#10b981" />
                        <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal ml-2">
                          {currencySymbol}{discount15.toLocaleString()}
                        </Text>
                      </View>
                      <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-normal">-15% Sharp Offer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setOfferPrice(`${currencySymbol}${discount10.toLocaleString()}`)}
                      style={{
                        backgroundColor: isDark ? '#1a2333' : '#ffffff',
                        borderColor: offerPrice.includes(discount10.toString()) ? '#10b981' : isDark ? '#334155' : '#e2e8f0',
                      }}
                      className="p-3 rounded-xl border flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="thumbs-up-outline" size={16} color="#10b981" />
                        <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal ml-2">
                          {currencySymbol}{discount10.toLocaleString()}
                        </Text>
                      </View>
                      <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-normal">-10% Fair Bargain</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setOfferPrice(`${currencySymbol}${discount5.toLocaleString()}`)}
                      style={{
                        backgroundColor: isDark ? '#1a2333' : '#ffffff',
                        borderColor: offerPrice.includes(discount5.toString()) ? '#10b981' : isDark ? '#334155' : '#e2e8f0',
                      }}
                      className="p-3 rounded-xl border flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="checkmark-outline" size={16} color="#10b981" />
                        <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs font-normal ml-2">
                          {currencySymbol}{discount5.toLocaleString()}
                        </Text>
                      </View>
                      <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-normal">-5% Slight Discount</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Actions */}
                  <TouchableOpacity
                    onPress={() => setStep(2)}
                    className="bg-emerald-500 py-3.5 rounded-2xl items-center active:bg-emerald-600 mb-2.5"
                  >
                    <Text className="text-white text-xs font-normal">Review & Proceed</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleAcceptBase}
                    className="py-3 rounded-2xl items-center border border-slate-300 dark:border-slate-700"
                  >
                    <Text style={{ color: isDark ? '#cbd5e1' : '#475569' }} className="text-xs font-normal">
                      Accept Benchmark ({basePriceStr})
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* Step 2 Confirmation */}
                  <View
                    style={{
                      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
                      borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : '#a7f3d0',
                    }}
                    className="p-4 rounded-2xl border mb-4 items-center"
                  >
                    <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                    <Text style={{ color: isDark ? '#ffffff' : '#065f46' }} className="text-sm font-normal mt-2">
                      Your Proposed Counter-Offer
                    </Text>
                    <Text className="text-2xl font-normal text-emerald-600 dark:text-emerald-400 mt-1">
                      {offerPrice}
                    </Text>
                    <Text style={{ color: isDark ? '#94a3b8' : '#047857' }} className="text-xs font-normal text-center mt-2 leading-4">
                      The driver will receive an instant push alert with your offer and can accept or send a counter-bid.
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleSendOffer}
                    className="bg-emerald-500 py-3.5 rounded-2xl items-center active:bg-emerald-600 mb-2.5 flex-row justify-center"
                  >
                    <Ionicons name="paper-plane-outline" size={16} color="#ffffff" />
                    <Text className="text-white text-xs font-normal ml-2">Send Counter-Offer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setStep(1)}
                    className="py-3 rounded-2xl items-center border border-slate-300 dark:border-slate-700"
                  >
                    <Text style={{ color: isDark ? '#cbd5e1' : '#475569' }} className="text-xs font-normal">
                      Modify Offer
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
