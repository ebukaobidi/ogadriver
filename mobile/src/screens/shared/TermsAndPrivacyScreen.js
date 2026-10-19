import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function TermsAndPrivacyScreen({ navigation }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('terms'); // 'terms' | 'privacy'

  const handleShareTerms = async () => {
    try {
      await Share.share({
        message: 'OgaDriver Terms of Service & Privacy Policy: https://ogadriver.ng/legal',
        title: 'OgaDriver Legal & Privacy Charter',
      });
    } catch (e) {
      console.log('Share error:', e);
    }
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
            Legal & Compliance
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleShareTerms}
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: isDark ? '#121927' : '#f1f5f9' }}
        >
          <Ionicons name="share-social-outline" size={18} color="#008751" />
        </TouchableOpacity>
      </View>

      {/* Segmented Tab Switcher */}
      <View className="px-4 py-3">
        <View
          style={{
            backgroundColor: isDark ? '#121927' : '#f1f5f9',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
          className="flex-row p-1 rounded-2xl border"
        >
          <TouchableOpacity
            onPress={() => setActiveTab('terms')}
            style={{
              backgroundColor: activeTab === 'terms' ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
            }}
            className="flex-1 py-2.5 rounded-xl items-center shadow-xs"
          >
            <Text
              style={{
                color: activeTab === 'terms' ? (isDark ? '#ffffff' : '#008751') : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: activeTab === 'terms' ? '800' : '600',
              }}
              className="text-xs"
            >
              Terms of Service
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('privacy')}
            style={{
              backgroundColor: activeTab === 'privacy' ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
            }}
            className="flex-1 py-2.5 rounded-xl items-center shadow-xs"
          >
            <Text
              style={{
                color: activeTab === 'privacy' ? (isDark ? '#ffffff' : '#008751') : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: activeTab === 'privacy' ? '800' : '600',
              }}
              className="text-xs"
            >
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-4" 
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'terms' ? (
          /* TERMS OF SERVICE CONTENT */
          <View className="pb-12 pt-1">
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#f8fafc',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="p-4 rounded-2xl border mb-4"
            >
              <Text className="text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
                Charter Overview
              </Text>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs leading-5">
                These Terms of Service govern the use of the OgaDriver platform (website, mobile applications, and dispatch APIs) operated by OgaDriver Nigeria Ltd. By creating an account or requesting services, you agree to these legal terms.
              </Text>
            </View>

            {/* Section 1 */}
            <View className="mb-4">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm mb-1.5">
                1. Eligibility & User Account
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#475569' }} className="text-xs leading-5">
                Clients must be at least 18 years of age and legally authorized to enter binding contracts. You are responsible for maintaining the confidentiality of your login credentials and for all rides, hires, and payments authorized under your account.
              </Text>
            </View>

            {/* Section 2 */}
            <View className="mb-4">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm mb-1.5">
                2. On-Demand Ride & Chauffeur Hire Services
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#475569' }} className="text-xs leading-5">
                OgaDriver provides an on-demand marketplace connecting certified vetted drivers with hirers. Drivers are independent verified service contractors who have undergone National Identity Number (NIN) authentication, valid driver license verification, criminal background checks, and guarantor verification.
              </Text>
            </View>

            {/* Section 3 */}
            <View className="mb-4">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm mb-1.5">
                3. Pricing, Fares & Prepaid Wallet
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#475569' }} className="text-xs leading-5">
                Trip fares are calculated based on duration, distance, and selected service tier. For Chauffeur Hire, daily or monthly contract fees are locked upon mutual agreement. All wallet debits, card payments via Paystack, and bank transfer top-ups are non-refundable once the service has commenced.
              </Text>
            </View>

            {/* Section 4 */}
            <View className="mb-4">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm mb-1.5">
                4. Safety, Code of Conduct & Vehicle Standards
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#475569' }} className="text-xs leading-5">
                Both hirers and drivers must adhere to courteous standards. In vehicles provided by hirers, the vehicle must be in roadworthy condition with valid vehicle insurance and roadworthiness documentation. Reckless driving, substance abuse, and illegal transport are strictly prohibited and result in immediate ban and law enforcement escalation.
              </Text>
            </View>

            {/* Section 5 */}
            <View className="mb-4">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm mb-1.5">
                5. Cancellations & Dispute Resolution
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#475569' }} className="text-xs leading-5">
                Cancellations requested after driver dispatch has occurred may be subject to a nominal dispatch fee. Any disputes regarding service fulfillment, vehicle incidents, or billing discrepancies must be reported to the 24/7 Client Concierge within 48 hours for immediate investigation and escrow mediation.
              </Text>
            </View>
          </View>
        ) : (
          /* PRIVACY POLICY CONTENT */
          <View className="pb-12 pt-1">
            <View
              style={{
                backgroundColor: isDark ? '#121927' : '#f8fafc',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
              className="p-4 rounded-2xl border mb-4"
            >
              <Text className="text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
                NDPR & Data Protection Compliance
              </Text>
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="text-xs leading-5">
                OgaDriver complies with the Nigeria Data Protection Act (NDPA) and Global Privacy Regulations. We treat your personal and travel telemetry with top-tier confidentiality.
              </Text>
            </View>

            {/* Privacy Section 1 */}
            <View className="mb-4">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm mb-1.5">
                1. Information We Collect
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#475569' }} className="text-xs leading-5">
                • Account Credentials: Name, email address, phone number, and corporate billing details.{'\n'}
                • Telemetry & GPS Location: Real-time precise pickup, destination, and in-transit GPS route coordinates.{'\n'}
                • Payment Information: Tokenized credit/debit card credentials securely stored by Paystack (OgaDriver does not store raw CVVs).
              </Text>
            </View>

            {/* Privacy Section 2 */}
            <View className="mb-4">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm mb-1.5">
                2. How We Use Your Data
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#475569' }} className="text-xs leading-5">
                We utilize collected information to dispatch nearest verified drivers, generate accurate trip fare estimates, provide real-time trip monitoring for safety, process automated receipts, and support emergency rapid response units when SOS is activated.
              </Text>
            </View>

            {/* Privacy Section 3 */}
            <View className="mb-4">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm mb-1.5">
                3. Real-Time Tracking & Emergency Sharing
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#475569' }} className="text-xs leading-5">
                While a trip is active, your route is monitored by our central security radar. In the event of an Emergency SOS trigger, live GPS telemetry is shared instantly with registered emergency contacts, FRSC, and state law enforcement agencies.
              </Text>
            </View>

            {/* Privacy Section 4 */}
            <View className="mb-4">
              <Text style={{ color: isDark ? '#ffffff' : '#0f172a' }} className="font-bold text-sm mb-1.5">
                4. Data Retention & Your Rights
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#475569' }} className="text-xs leading-5">
                You retain the right to request access to your travel history, modify profile information, download invoices, or request account erasure by contacting privacy@ogadriver.ng.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
