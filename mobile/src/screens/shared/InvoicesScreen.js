import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function InvoicesScreen({ navigation }) {
  const { isDark } = useTheme();
  const [filter, setFilter] = useState('all'); // 'all' | 'ride' | 'hire' | 'topup'

  const invoices = [
    {
      id: 'INV-2026-9041',
      date: 'Oct 11, 2026 • 02:45 PM',
      type: 'ride',
      description: 'Point-to-Point Executive Ride',
      route: 'Victoria Island ➔ Lekki Phase 1',
      amount: 4200,
      vat: 315,
      driver: 'Babatunde O. (Lexus ES350)',
      status: 'Paid',
      paymentMethod: 'Prepaid Wallet',
    },
    {
      id: 'INV-2026-8912',
      date: 'Oct 09, 2026 • 08:30 AM',
      type: 'hire',
      description: 'Full-Day Chauffeur Engagement (8 hrs)',
      route: 'Ikoyi ➔ Ikeja Industrial Estate ➔ VI',
      amount: 25000,
      vat: 1875,
      driver: 'Chinedu O. (Driver Only)',
      status: 'Paid',
      paymentMethod: 'Mastercard •••• 8842',
    },
    {
      id: 'INV-2026-8740',
      date: 'Oct 05, 2026 • 11:15 AM',
      type: 'topup',
      description: 'Prepaid Wallet Direct Deposit Top-up',
      route: 'Instant Paystack Top-Up',
      amount: 50000,
      vat: 0,
      driver: 'OgaDriver Automated Deposit',
      status: 'Paid',
      paymentMethod: 'Zenith Bank Transfer',
    },
    {
      id: 'INV-2026-8610',
      date: 'Sep 28, 2026 • 06:10 PM',
      type: 'hire',
      description: 'Weekend VIP Airport Concierge Escort',
      route: 'MM2 International Airport ➔ Eko Hotel',
      amount: 35000,
      vat: 2625,
      driver: 'Tunde A. (Mercedes E-Class)',
      status: 'Paid',
      paymentMethod: 'Prepaid Wallet',
    },
    {
      id: 'INV-2026-8422',
      date: 'Sep 21, 2026 • 09:20 AM',
      type: 'ride',
      description: 'Morning Rush Comfort Ride',
      route: 'Ajah ➔ Victoria Island Hub',
      amount: 5800,
      vat: 435,
      driver: 'Emeka D. (Toyota Camry)',
      status: 'Paid',
      paymentMethod: 'Visa •••• 1024',
    },
  ];

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'all') return true;
    return inv.type === filter;
  });

  const totalSpent = invoices.reduce((acc, curr) => acc + curr.amount, 0);

  const handleDownloadPdf = (invoice) => {
    Alert.alert(
      'Receipt Generated',
      `Official FIRS tax invoice and PDF receipt for ${invoice.id} (₦${invoice.amount.toLocaleString()}) has been sent to your registered email.\n\nYou can also download or print this document directly.`,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Share / Print',
          onPress: async () => {
            try {
              await Share.share({
                title: `OgaDriver Invoice ${invoice.id}`,
                message: `OgaDriver Official Tax Invoice #${invoice.id}\nDate: ${invoice.date}\nService: ${invoice.description}\nAmount Paid: ₦${invoice.amount.toLocaleString()}\nVAT (7.5%): ₦${invoice.vat.toLocaleString()}\nStatus: Verified Paid`,
              });
            } catch (e) {}
          },
        },
      ]
    );
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
            Invoices & Receipts
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Export Monthly Statement',
              'Send combined October 2026 expense spreadsheet (.CSV & .PDF) to your accounting email?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Export Statement',
                  onPress: () => Alert.alert('Sent', 'Corporate expense statement dispatched to your email.'),
                },
              ]
            )
          }
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: isDark ? '#121927' : '#f1f5f9' }}
        >
          <Ionicons name="download-outline" size={18} color="#008751" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Total Spend Summary Card */}
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#052e16',
            borderColor: isDark ? '#1e293b' : '#0a5c25',
          }}
          className="rounded-3xl p-5 mb-4 shadow-md border"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white font-bold text-xs uppercase tracking-wider">
              Total Invoiced Expenses
            </Text>
            <View className="bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
              <Text className="text-white font-black text-[9px] uppercase">FIRS Compliant</Text>
            </View>
          </View>
          <Text className="text-white font-black text-3xl mb-1">
            ₦{totalSpent.toLocaleString()}
          </Text>
          <Text className="text-white text-xs">
            {invoices.length} transactions processed • All receipts verified
          </Text>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-4 space-x-2 pb-1"
        >
          {[
            { id: 'all', label: 'All Invoices' },
            { id: 'ride', label: 'Rides' },
            { id: 'hire', label: 'Chauffeur Hires' },
            { id: 'topup', label: 'Wallet Top-ups' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setFilter(item.id)}
              style={{
                backgroundColor: filter === item.id ? '#008751' : isDark ? '#121927' : '#f1f5f9',
                borderColor: filter === item.id ? '#008751' : isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="px-4 py-2 rounded-xl border mr-2"
            >
              <Text
                style={{
                  color: filter === item.id ? '#ffffff' : isDark ? '#94a3b8' : '#475569',
                  fontWeight: filter === item.id ? '800' : '600',
                }}
                className="text-xs"
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Invoices List */}
        {filteredInvoices.map((inv) => (
          <View
            key={inv.id}
            style={{
              backgroundColor: isDark ? '#121927' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
            className="border rounded-2xl p-4 mb-3.5 shadow-xs"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-2.5"
                  style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}
                >
                  <Ionicons
                    name={
                      inv.type === 'ride'
                        ? 'car-outline'
                        : inv.type === 'hire'
                        ? 'briefcase-outline'
                        : 'wallet-outline'
                    }
                    size={16}
                    color="#008751"
                  />
                </View>
                <View>
                  <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-xs">
                    {inv.id}
                  </Text>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px]">
                    {inv.date}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-black text-sm">
                  ₦{inv.amount.toLocaleString()}
                </Text>
                <View className="bg-emerald-500/15 px-2 py-0.2 rounded-full mt-0.5">
                  <Text className="text-emerald-600 font-extrabold text-[9px] uppercase">
                    {inv.status}
                  </Text>
                </View>
              </View>
            </View>

            {/* Description & Route */}
            <View
              style={{
                backgroundColor: isDark ? '#090d16' : '#f8fafc',
                borderColor: isDark ? '#1e293b' : '#f1f5f9',
              }}
              className="p-2.5 rounded-xl border mb-3"
            >
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-semibold text-xs">
                {inv.description}
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[11px] mt-0.5">
                {inv.route}
              </Text>
              <View className="flex-row items-center justify-between mt-2 pt-1.5 border-t border-slate-700/10">
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px]">
                  Payment: {inv.paymentMethod}
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }} className="text-[10px]">
                  VAT: ₦{inv.vat.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row items-center justify-end space-x-2">
              <TouchableOpacity
                onPress={() => handleDownloadPdf(inv)}
                style={{
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                }}
                className="px-3 py-1.5 rounded-xl border flex-row items-center"
              >
                <Ionicons name="document-text-outline" size={13} color="#008751" style={{ marginRight: 4 }} />
                <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-[10px]">
                  View & Print Receipt
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
