import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  TextInput, 
  Alert, 
  Platform,
  ActivityIndicator,
  BackHandler
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../../context/ThemeContext';
import { useCountry } from '../../context/CountryContext';
import { api, authService } from '../../api/api';

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

const DEFAULT_BANKS = [
  { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
  { code: '044', name: 'Access Bank' },
  { code: '057', name: 'Zenith Bank' },
  { code: '033', name: 'United Bank For Africa (UBA)' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '035', name: 'Wema Bank / ALAT' },
  { code: '50515', name: 'Moniepoint MFB' },
  { code: '999991', name: 'OPay Digital Services' },
  { code: '999992', name: 'Palmpay Limited' },
  { code: '50211', name: 'Kuda Microfinance Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank (FCMB)' },
  { code: '232', name: 'Sterling Bank' },
];

export default function PaymentCardsScreen({ navigation }) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { country: globalCountry } = useCountry();

  // Active Sub-Tab: 'cards' | 'banks'
  const [activeTab, setActiveTab] = useState('banks');

  // Saved Cards & Saved Banks
  const [cards, setCards] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Card Modal State
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [savingCard, setSavingCard] = useState(false);

  // Add Bank Account Modal State
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [banksList, setBanksList] = useState(DEFAULT_BANKS);
  const [selectedBank, setSelectedBank] = useState(DEFAULT_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolving, setResolving] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [showBankPicker, setShowBankPicker] = useState(false);

  // Android hardware back handler
  useEffect(() => {
    const onBack = () => {
      if (showBankPicker) {
        setShowBankPicker(false);
        return true;
      }
      if (bankModalVisible) {
        setBankModalVisible(false);
        return true;
      }
      if (cardModalVisible) {
        setCardModalVisible(false);
        return true;
      }
      if (navigation?.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [showBankPicker, bankModalVisible, cardModalVisible, navigation]);

  useEffect(() => {
    loadSavedPaymentMethods();
    fetchBankList();
  }, []);

  const fetchBankList = async () => {
    try {
      const res = await api.get('/bank/banks').catch(() => null);
      if (res?.data?.data && Array.isArray(res.data.data)) {
        setBanksList(res.data.data);
      }
    } catch (e) {}
  };

  const loadSavedPaymentMethods = async () => {
    try {
      setLoading(true);
      const [cardsStored, banksStored] = await Promise.all([
        Storage.getItemAsync('user_payment_cards'),
        Storage.getItemAsync('user_saved_bank_accounts')
      ]);

      if (cardsStored) {
        const parsed = JSON.parse(cardsStored);
        if (Array.isArray(parsed)) setCards(parsed);
      }

      if (banksStored) {
        const parsed = JSON.parse(banksStored);
        if (Array.isArray(parsed)) setBankAccounts(parsed);
      }
    } catch (e) {
      console.log('Error loading saved payment methods:', e);
    } finally {
      setLoading(false);
    }
  };

  const persistCards = async (updated) => {
    setCards(updated);
    try {
      await Storage.setItemAsync('user_payment_cards', JSON.stringify(updated));
    } catch (e) {}
  };

  const persistBankAccounts = async (updated) => {
    setBankAccounts(updated);
    try {
      await Storage.setItemAsync('user_saved_bank_accounts', JSON.stringify(updated));
      await Storage.setItemAsync('driver_saved_bank_accounts', JSON.stringify(updated));
    } catch (e) {}
  };

  // Paystack Real-Time Bank Resolution
  const handleAccountNumberChange = async (val) => {
    const cleanNum = val.replace(/[^0-9]/g, '').slice(0, 10);
    setAccountNumber(cleanNum);

    if (cleanNum.length === 10 && selectedBank?.code) {
      try {
        setResolving(true);
        setAccountName('');
        const res = await api.post('/bank/resolve', {
          account_number: cleanNum,
          bank_code: selectedBank.code,
        }).catch((err) => {
          return { data: { success: false, message: err.response?.data?.message || 'Could not verify account name' } };
        });

        if (res?.data?.success && res?.data?.data?.account_name) {
          setAccountName(res.data.data.account_name);
        } else {
          Alert.alert('Verification Failed', 'Could not verify this account number with the selected bank. Please check the digits.');
          setAccountName('');
        }
      } catch (err) {
        setAccountName('');
      } finally {
        setResolving(false);
      }
    } else {
      setAccountName('');
    }
  };

  const handleSaveBankAccount = async () => {
    if (!accountNumber || accountNumber.length !== 10) {
      Alert.alert('Invalid Account', 'Please enter a valid 10-digit NUBAN account number.');
      return;
    }
    if (!selectedBank) {
      Alert.alert('Select Bank', 'Please select your bank from the list.');
      return;
    }
    if (!accountName) {
      Alert.alert('Account Unverified', 'Please wait for your account name to be verified by Paystack.');
      return;
    }

    const newAccount = {
      id: `bank_${Date.now()}`,
      bankName: selectedBank.name,
      bankCode: selectedBank.code,
      accountNumber,
      accountName,
      isDefault: bankAccounts.length === 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [newAccount, ...bankAccounts];
    await persistBankAccounts(updated);

    // Sync to user profile in backend if possible
    try {
      await api.post('/user/profile', {
        bank_name: selectedBank.name,
        bank_code: selectedBank.code,
        account_number: accountNumber,
        account_name: accountName,
      }).catch(() => {});
    } catch (e) {}

    setBankModalVisible(false);
    setAccountNumber('');
    setAccountName('');
    Alert.alert('Account Added', `${accountName} (${selectedBank.name}) has been verified and added to your payment methods.`);
  };

  const handleDeleteBank = (id) => {
    Alert.alert('Remove Bank Account', 'Are you sure you want to delete this bank account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = bankAccounts.filter((b) => b.id !== id);
          if (updated.length > 0 && !updated.some((b) => b.isDefault)) {
            updated[0].isDefault = true;
          }
          await persistBankAccounts(updated);
        },
      },
    ]);
  };

  const handleSetDefaultBank = async (id) => {
    const updated = bankAccounts.map((b) => ({
      ...b,
      isDefault: b.id === id,
    }));
    await persistBankAccounts(updated);
    Alert.alert('Default Updated', 'This bank account is now your default payment & withdrawal method.');
  };

  const handleAddCard = async () => {
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
      Alert.alert('CVV', 'Please enter a valid 3 or 4 digit CVV code.');
      return;
    }

    let brand = 'Mastercard';
    if (cleanNum.startsWith('4')) brand = 'Visa';
    else if (cleanNum.startsWith('506') || cleanNum.startsWith('650') || cleanNum.startsWith('507')) brand = 'Verve';

    const newCard = {
      id: `card_${Date.now()}`,
      last4: cleanNum.slice(-4),
      brand,
      expiry,
      holderName: cardHolder || 'Cardholder',
      isDefault: cards.length === 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [newCard, ...cards];
    await persistCards(updated);
    setCardModalVisible(false);
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setCardHolder('');
    Alert.alert('Card Added', `Your ${brand} ending in ${newCard.last4} has been securely saved.`);
  };

  const handleDeleteCard = (id) => {
    Alert.alert('Remove Card', 'Are you sure you want to delete this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = cards.filter((c) => c.id !== id);
          if (updated.length > 0 && !updated.some((c) => c.isDefault)) {
            updated[0].isDefault = true;
          }
          await persistCards(updated);
        },
      },
    ]);
  };

  const filteredBanks = banksList.filter((b) => 
    b.name.toLowerCase().includes(bankSearch.toLowerCase()) || 
    b.code.includes(bankSearch)
  );

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#f8fafc',
    cardBg: isDark ? '#121927' : '#ffffff',
    border: isDark ? '#1e293b' : '#e2e8f0',
    titleText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: '#10b981',
    lineDivider: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Sleek Floating Top Navigation Bar */}
      <View className="px-4 py-3 flex-row items-center justify-between border-b" style={{ borderBottomColor: themeStyles.border }}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={{ 
            backgroundColor: isDark ? '#131d2e' : '#f1f5f9', 
            borderColor: themeStyles.border, 
            borderWidth: 1,
            width: 38,
            height: 38,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center'
          }}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={18} color={themeStyles.brandGreen} />
        </TouchableOpacity>

        <Text style={{ color: themeStyles.titleText, fontSize: 18, fontWeight: '700' }}>
          Payment Methods
        </Text>

        <View style={{ width: 38 }} />
      </View>

      {/* Modern Pill Switcher: Bank Accounts vs Debit / Credit Cards */}
      <View className="px-4 pt-3 pb-2">
        <View 
          style={{ 
            backgroundColor: isDark ? '#121927' : '#f1f5f9', 
            borderRadius: 14, 
            padding: 4, 
            flexDirection: 'row' 
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('banks')}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: activeTab === 'banks' ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
              shadowColor: '#000',
              shadowOpacity: activeTab === 'banks' ? 0.08 : 0,
              shadowRadius: 2,
            }}
          >
            <View className="flex-row items-center">
              <Ionicons 
                name="business" 
                size={16} 
                color={activeTab === 'banks' ? themeStyles.brandGreen : themeStyles.subText} 
                style={{ marginRight: 6 }} 
              />
              <Text 
                style={{ 
                  color: activeTab === 'banks' ? themeStyles.titleText : themeStyles.subText, 
                  fontWeight: activeTab === 'banks' ? '700' : '500',
                  fontSize: 13 
                }}
              >
                Bank Accounts ({bankAccounts.length})
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('cards')}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: activeTab === 'cards' ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
              shadowColor: '#000',
              shadowOpacity: activeTab === 'cards' ? 0.08 : 0,
              shadowRadius: 2,
            }}
          >
            <View className="flex-row items-center">
              <Ionicons 
                name="card" 
                size={16} 
                color={activeTab === 'cards' ? themeStyles.brandGreen : themeStyles.subText} 
                style={{ marginRight: 6 }} 
              />
              <Text 
                style={{ 
                  color: activeTab === 'cards' ? themeStyles.titleText : themeStyles.subText, 
                  fontWeight: activeTab === 'cards' ? '700' : '500',
                  fontSize: 13 
                }}
              >
                Debit / Credit ({cards.length})
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 pt-2" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* ========================================================================= */}
        {/* TAB 1: VERIFIED BANK ACCOUNTS (NUBAN / MoMo Resolution via Paystack)      */}
        {/* ========================================================================= */}
        {activeTab === 'banks' && (
          <View>
            {/* Add Bank Account Trigger (Two-Line Luxury Style) */}
            <View className="my-2">
              <View style={{ marginHorizontal: 20, height: 1, backgroundColor: themeStyles.lineDivider }} />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setBankModalVisible(true)}
                className="px-5 py-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View 
                    style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: 14, 
                      backgroundColor: 'rgba(16, 185, 129, 0.12)', 
                      borderColor: 'rgba(16, 185, 129, 0.3)',
                      borderWidth: 1,
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginRight: 14
                    }}
                  >
                    <Ionicons name="add" size={24} color="#10b981" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: themeStyles.titleText, fontSize: 15, fontWeight: '700' }}>
                      Add & Verify Bank Account
                    </Text>
                    <Text style={{ color: themeStyles.subText, fontSize: 12, marginTop: 2 }}>
                      Instant Paystack / NIBSS account name verification
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#10b981" />
              </TouchableOpacity>
              <View style={{ marginHorizontal: 20, height: 1, backgroundColor: themeStyles.lineDivider }} />
            </View>

            {/* List of Saved Bank Accounts (Two-Line Menu Style) */}
            <View className="mt-4">
              <Text style={{ color: themeStyles.subText, marginHorizontal: 20, marginBottom: 8, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                Saved Bank Accounts
              </Text>

              {loading ? (
                <ActivityIndicator size="small" color="#10b981" className="my-6" />
              ) : bankAccounts.length === 0 ? (
                <View className="px-5 py-8 items-center">
                  <Ionicons name="business-outline" size={38} color={themeStyles.subText} style={{ opacity: 0.6, marginBottom: 8 }} />
                  <Text style={{ color: themeStyles.titleText, fontSize: 15, fontWeight: '600' }}>No bank account added yet</Text>
                  <Text style={{ color: themeStyles.subText, fontSize: 12, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 }}>
                    Add your bank account above to receive instant trip payouts or make direct account transfers.
                  </Text>
                </View>
              ) : (
                bankAccounts.map((account) => (
                  <View key={account.id} className="my-1.5">
                    <View style={{ marginHorizontal: 20, height: 1, backgroundColor: themeStyles.lineDivider }} />
                    <View className="px-5 py-4 flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 mr-3">
                        <View 
                          style={{ 
                            width: 44, 
                            height: 44, 
                            borderRadius: 14, 
                            backgroundColor: isDark ? '#1a2234' : '#ecfdf5', 
                            borderColor: isDark ? '#2e3a50' : '#a7f3d0',
                            borderWidth: 1,
                            alignItems: 'center', 
                            justifyContent: 'center',
                            marginRight: 14
                          }}
                        >
                          <Ionicons name="business" size={20} color="#10b981" />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center flex-wrap">
                            <Text style={{ color: themeStyles.titleText, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
                              {account.bankName}
                            </Text>
                            <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginLeft: 6 }}>
                              <Text style={{ color: '#10b981', fontSize: 9, fontWeight: '700' }}>VERIFIED</Text>
                            </View>
                            {account.isDefault && (
                              <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginLeft: 4 }}>
                                <Text style={{ color: '#3b82f6', fontSize: 9, fontWeight: '700' }}>DEFAULT</Text>
                              </View>
                            )}
                          </View>
                          <Text style={{ color: themeStyles.titleText, fontSize: 12, fontWeight: '600', marginTop: 2 }} numberOfLines={1}>
                            {account.accountName}
                          </Text>
                          <Text style={{ color: themeStyles.subText, fontSize: 12, marginTop: 1 }}>
                            •••• {account.accountNumber.slice(-4)}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center space-x-2">
                        {!account.isDefault && (
                          <TouchableOpacity
                            onPress={() => handleSetDefaultBank(account.id)}
                            style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: isDark ? '#1a2234' : '#f1f5f9', marginRight: 6 }}
                          >
                            <Text style={{ color: themeStyles.brandGreen, fontSize: 11, fontWeight: '600' }}>Set Default</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => handleDeleteBank(account.id)}
                          style={{ padding: 6 }}
                          accessibilityLabel="Delete bank account"
                        >
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={{ marginHorizontal: 20, height: 1, backgroundColor: themeStyles.lineDivider }} />
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DEBIT / CREDIT CARDS (Visa / Mastercard / Verve)                   */}
        {/* ========================================================================= */}
        {activeTab === 'cards' && (
          <View>
            {/* Add Card Trigger (Two-Line Luxury Style) */}
            <View className="my-2">
              <View style={{ marginHorizontal: 20, height: 1, backgroundColor: themeStyles.lineDivider }} />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setCardModalVisible(true)}
                className="px-5 py-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View 
                    style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: 14, 
                      backgroundColor: 'rgba(16, 185, 129, 0.12)', 
                      borderColor: 'rgba(16, 185, 129, 0.3)',
                      borderWidth: 1,
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginRight: 14
                    }}
                  >
                    <Ionicons name="card" size={22} color="#10b981" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: themeStyles.titleText, fontSize: 15, fontWeight: '700' }}>
                      Add Debit / Credit Card
                    </Text>
                    <Text style={{ color: themeStyles.subText, fontSize: 12, marginTop: 2 }}>
                      Visa, Mastercard, Verve with 3DS authorization
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#10b981" />
              </TouchableOpacity>
              <View style={{ marginHorizontal: 20, height: 1, backgroundColor: themeStyles.lineDivider }} />
            </View>

            {/* List of Saved Cards (Two-Line Menu Style) */}
            <View className="mt-4">
              <Text style={{ color: themeStyles.subText, marginHorizontal: 20, marginBottom: 8, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                Saved Cards
              </Text>

              {loading ? (
                <ActivityIndicator size="small" color="#10b981" className="my-6" />
              ) : cards.length === 0 ? (
                <View className="px-5 py-8 items-center">
                  <Ionicons name="card-outline" size={38} color={themeStyles.subText} style={{ opacity: 0.6, marginBottom: 8 }} />
                  <Text style={{ color: themeStyles.titleText, fontSize: 15, fontWeight: '600' }}>No cards added yet</Text>
                  <Text style={{ color: themeStyles.subText, fontSize: 12, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 }}>
                    Add your debit or credit card for seamless automatic payments.
                  </Text>
                </View>
              ) : (
                cards.map((card) => (
                  <View key={card.id} className="my-1.5">
                    <View style={{ marginHorizontal: 20, height: 1, backgroundColor: themeStyles.lineDivider }} />
                    <View className="px-5 py-4 flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 mr-3">
                        <View 
                          style={{ 
                            width: 44, 
                            height: 44, 
                            borderRadius: 14, 
                            backgroundColor: isDark ? '#1a2234' : '#ecfdf5', 
                            borderColor: isDark ? '#2e3a50' : '#a7f3d0',
                            borderWidth: 1,
                            alignItems: 'center', 
                            justifyContent: 'center',
                            marginRight: 14
                          }}
                        >
                          <Ionicons name="card" size={20} color="#10b981" />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center">
                            <Text style={{ color: themeStyles.titleText, fontSize: 15, fontWeight: '700' }}>
                              {card.brand} •••• {card.last4}
                            </Text>
                            {card.isDefault && (
                              <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginLeft: 6 }}>
                                <Text style={{ color: '#3b82f6', fontSize: 9, fontWeight: '700' }}>DEFAULT</Text>
                              </View>
                            )}
                          </View>
                          <Text style={{ color: themeStyles.subText, fontSize: 12, marginTop: 2 }}>
                            Expires {card.expiry} • {card.holderName}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleDeleteCard(card.id)}
                        style={{ padding: 6 }}
                        accessibilityLabel="Delete card"
                      >
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    <View style={{ marginHorizontal: 20, height: 1, backgroundColor: themeStyles.lineDivider }} />
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD & VERIFY BANK ACCOUNT                                        */}
      {/* ========================================================================= */}
      <Modal visible={bankModalVisible} transparent animationType="slide" onRequestClose={() => setBankModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' }}>
          <View 
            style={{ 
              backgroundColor: isDark ? '#0f172a' : '#ffffff', 
              borderTopLeftRadius: 24, 
              borderTopRightRadius: 24, 
              paddingHorizontal: 20, 
              paddingTop: 20, 
              paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 30 
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ color: themeStyles.titleText, fontSize: 18, fontWeight: '700' }}>
                Verify & Add Bank Account
              </Text>
              <TouchableOpacity onPress={() => setBankModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={themeStyles.subText} />
              </TouchableOpacity>
            </View>

            {/* Bank Selector Trigger */}
            <Text style={{ color: themeStyles.subText, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>SELECT BANK</Text>
            <TouchableOpacity
              onPress={() => setShowBankPicker(true)}
              style={{
                backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                borderColor: themeStyles.border,
                borderWidth: 1,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 13,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <View className="flex-row items-center flex-1 mr-2">
                <Ionicons name="business-outline" size={18} color="#10b981" style={{ marginRight: 10 }} />
                <Text style={{ color: themeStyles.titleText, fontSize: 14, fontWeight: '600' }} numberOfLines={1}>
                  {selectedBank?.name || 'Choose Bank'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color={themeStyles.subText} />
            </TouchableOpacity>

            {/* Account Number Input */}
            <Text style={{ color: themeStyles.subText, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>10-DIGIT ACCOUNT NUMBER</Text>
            <View
              style={{
                backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                borderColor: themeStyles.border,
                borderWidth: 1,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 4,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <TextInput
                value={accountNumber}
                onChangeText={handleAccountNumberChange}
                placeholder="0123456789"
                placeholderTextColor={themeStyles.subText}
                keyboardType="numeric"
                maxLength={10}
                style={{ flex: 1, color: themeStyles.titleText, fontSize: 16, height: 44, fontWeight: '600' }}
              />
              {resolving && <ActivityIndicator size="small" color="#10b981" />}
            </View>

            {/* Verified Account Name Card (Displays Name from Paystack) */}
            {accountName ? (
              <View 
                style={{ 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                  borderColor: 'rgba(16, 185, 129, 0.3)', 
                  borderWidth: 1, 
                  borderRadius: 14, 
                  padding: 12, 
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="checkmark-circle" size={24} color="#10b981" style={{ marginRight: 10 }} />
                <View className="flex-1">
                  <Text style={{ color: '#10b981', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
                    VERIFIED ACCOUNT HOLDER
                  </Text>
                  <Text style={{ color: themeStyles.titleText, fontSize: 14, fontWeight: '700', marginTop: 1 }}>
                    {accountName}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Confirm & Save Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSaveBankAccount}
              disabled={!accountName || resolving}
              style={{
                backgroundColor: accountName && !resolving ? '#10b981' : (isDark ? '#334155' : '#cbd5e1'),
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>
                {accountName ? 'Add Verified Account for Payment' : 'Enter 10 Digits to Verify'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: BANK LIST SEARCH PICKER                                          */}
      {/* ========================================================================= */}
      <Modal visible={showBankPicker} transparent animationType="slide" onRequestClose={() => setShowBankPicker(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' }}>
          <View 
            style={{ 
              backgroundColor: isDark ? '#0f172a' : '#ffffff', 
              borderTopLeftRadius: 24, 
              borderTopRightRadius: 24, 
              maxHeight: '80%',
              paddingHorizontal: 20, 
              paddingTop: 20, 
              paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 24 
            }}
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text style={{ color: themeStyles.titleText, fontSize: 17, fontWeight: '700' }}>Select Your Bank</Text>
              <TouchableOpacity onPress={() => setShowBankPicker(false)}>
                <Ionicons name="close" size={24} color={themeStyles.subText} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View 
              style={{ 
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9', 
                borderRadius: 12, 
                paddingHorizontal: 12, 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 10 
              }}
            >
              <Ionicons name="search" size={16} color={themeStyles.subText} style={{ marginRight: 8 }} />
              <TextInput
                value={bankSearch}
                onChangeText={setBankSearch}
                placeholder="Search bank name or code..."
                placeholderTextColor={themeStyles.subText}
                style={{ flex: 1, height: 40, color: themeStyles.titleText, fontSize: 14 }}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
              {filteredBanks.map((b) => (
                <TouchableOpacity
                  key={b.code}
                  onPress={() => {
                    setSelectedBank(b);
                    setShowBankPicker(false);
                    if (accountNumber.length === 10) {
                      handleAccountNumberChange(accountNumber);
                    }
                  }}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: themeStyles.border,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: themeStyles.titleText, fontSize: 14, fontWeight: '600', flex: 1 }}>
                    {b.name}
                  </Text>
                  {selectedBank?.code === b.code && (
                    <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: ADD DEBIT / CREDIT CARD                                          */}
      {/* ========================================================================= */}
      <Modal visible={cardModalVisible} transparent animationType="slide" onRequestClose={() => setCardModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' }}>
          <View 
            style={{ 
              backgroundColor: isDark ? '#0f172a' : '#ffffff', 
              borderTopLeftRadius: 24, 
              borderTopRightRadius: 24, 
              paddingHorizontal: 20, 
              paddingTop: 20, 
              paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 30 
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ color: themeStyles.titleText, fontSize: 18, fontWeight: '700' }}>Add Debit / Credit Card</Text>
              <TouchableOpacity onPress={() => setCardModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={themeStyles.subText} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: themeStyles.subText, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>CARD NUMBER</Text>
            <TextInput
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="4123 4567 8901 2345"
              placeholderTextColor={themeStyles.subText}
              keyboardType="numeric"
              maxLength={19}
              style={{
                backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                borderColor: themeStyles.border,
                borderWidth: 1,
                borderRadius: 14,
                paddingHorizontal: 14,
                height: 46,
                color: themeStyles.titleText,
                fontSize: 15,
                fontWeight: '600',
                marginBottom: 12,
              }}
            />

            <View className="flex-row space-x-3 mb-12">
              <View className="flex-1 mr-2">
                <Text style={{ color: themeStyles.subText, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>EXPIRY (MM/YY)</Text>
                <TextInput
                  value={expiry}
                  onChangeText={setExpiry}
                  placeholder="12/28"
                  placeholderTextColor={themeStyles.subText}
                  maxLength={5}
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    borderColor: themeStyles.border,
                    borderWidth: 1,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    height: 46,
                    color: themeStyles.titleText,
                    fontSize: 15,
                    fontWeight: '600',
                  }}
                />
              </View>

              <View className="flex-1 ml-2">
                <Text style={{ color: themeStyles.subText, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>CVV</Text>
                <TextInput
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  placeholderTextColor={themeStyles.subText}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    borderColor: themeStyles.border,
                    borderWidth: 1,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    height: 46,
                    color: themeStyles.titleText,
                    fontSize: 15,
                    fontWeight: '600',
                  }}
                />
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAddCard}
              style={{
                backgroundColor: '#10b981',
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>Save Card Securely</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
