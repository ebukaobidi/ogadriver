import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../context/ThemeContext';

export default function DriverApplicationReviewScreen({ route, navigation }) {
  const { isDark } = useTheme();
  // Get driver parameters from previous steps
  const driverStatus = route.params?.driverStatus || 'no_car'; 
  const registeredUser = route.params?.registeredUser || {};
  const isWithCar = driverStatus === 'with_car';
  const vehicleDetails = route.params?.vehicleDetails || null;
  
  // Friction-free initial onboarding documents:
  // ONLY essential driver identification so drivers can sign up in under 2 minutes without drop-off.
  // Note: Guarantor Verification is NEVER required during immediate registration.
  // For drivers without a car, guarantor verification is handled subsequently in their compliance portal before vehicle allocation.
  const commonDocs = [
    { id: 'driversLicense', title: "FRSC Driver's Licence", subtitle: "Clear photo showing license class and expiry date", required: true },
    { id: 'identityCard', title: "Government ID (NIN / Voter / Int'l Passport)", subtitle: "National identity verification", required: true },
    { id: 'profilePhoto', title: "Driver Profile Photo (Selfie)", subtitle: "Clear face photo for your verified partner badge", required: true },
  ];

  const carDocs = [
    { id: 'vehicleRegistration', title: "Vehicle Registration", subtitle: "Vehicle license or ownership proof", required: true },
    { id: 'vehicleInsurance', title: "Vehicle Insurance Certificate", subtitle: "Valid motor insurance policy", required: false },
  ];

  const requiredDocs = isWithCar ? [...commonDocs, ...carDocs] : commonDocs;
  const totalDocs = requiredDocs.length;

  const [uploadedDocs, setUploadedDocs] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: isDark ? '#00e588' : '#059669',
    itemBg: isDark ? '#090d16' : '#ffffff',
    itemBorder: isDark ? '#1e293b' : '#cbd5e1',
    headerBtnBg: isDark ? '#0f172a' : '#f1f5f9',
    headerBtnBorder: isDark ? '#1e293b' : '#e2e8f0',
  };

  const uploadedCount = Object.keys(uploadedDocs).length;
  const progressPercent = Math.round((uploadedCount / totalDocs) * 100);

  const openUploadModal = (doc) => {
    setActiveDoc(doc);
    setModalVisible(true);
  };

  const handleManualUpload = async () => {
    setModalVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadedDocs(prev => ({
          ...prev,
          [activeDoc.id]: result.assets[0]
        }));
      }
    } catch (err) {
      console.log('Error picking document', err);
    }
  };

  const handleAIOCRScan = () => {
    setIsScanning(true);
    // Simulate AI OCR scanning
    setTimeout(() => {
      setIsScanning(false);
      setModalVisible(false);
      setUploadedDocs(prev => ({
        ...prev,
        [activeDoc.id]: { name: `AI_Verified_${activeDoc.id}.jpg`, uri: 'ocr_verified_uri' }
      }));
      Alert.alert(
        "AI OCR Verified! ✓",
        `Details from your ${activeDoc.title} have been verified and extracted into compliance records.`
      );
    }, 1200);
  };

  const handleFinalSubmit = () => {
    // Only require Driver's License or Government ID to complete signup
    if (!uploadedDocs['driversLicense'] && !uploadedDocs['identityCard']) {
      Alert.alert(
        "Upload Driver's Licence",
        "Please snap or upload your FRSC Driver's Licence or NIN Government ID to complete your initial sign-up."
      );
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        "Account Created! 🎉",
        isWithCar 
          ? "Your partner registration has been submitted. You can now access your dashboard and start accepting trips once road credentials are verified!"
          : "Your partner registration is active! As a fleet operative seeking placement without a car, you will be invited to complete your Guarantor dossier directly from your profile when matched with an employer vehicle.",
        [
          {
            text: "Open Dashboard",
            onPress: () => {
              if (navigation.canGoBack()) navigation.popToTop();
              navigation.replace ? navigation.replace('Login') : navigation.navigate('Login');
            }
          }
        ]
      );
    }, 1200);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Top Header */}
      <View 
        style={{ borderBottomColor: themeStyles.cardBorder, borderBottomWidth: 1 }}
        className="px-5 py-4 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: themeStyles.headerBtnBg, borderColor: themeStyles.headerBtnBorder }}
            className="p-2 mr-3 rounded-xl border"
          >
            <Ionicons name="arrow-back" size={18} color={themeStyles.primaryText} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: themeStyles.primaryText }} className="font-black text-lg">
              Quick Verification
            </Text>
            <Text style={{ color: themeStyles.subText }} className="text-xs">
              Step 3 of 3 • Instant Sign-Up
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Ionicons name="log-out-outline" size={22} color={themeStyles.subText} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-6 pb-12" showsVerticalScrollIndicator={false}>
        {/* Fast Signup Notice Card (No drop-off) */}
        <View 
          style={{ 
            backgroundColor: isDark ? '#121927' : '#ecfdf5',
            borderColor: isDark ? '#00e588' : '#a7f3d0',
            borderWidth: 1
          }}
          className="rounded-3xl p-5 mb-5 shadow-sm"
        >
          <View className="flex-row items-center mb-1">
            <Ionicons name="flash" size={18} color="#00e588" style={{ marginRight: 6 }} />
            <Text style={{ color: themeStyles.primaryText }} className="font-black text-base">
              Fast 2-Minute Onboarding
            </Text>
          </View>
          <Text style={{ color: themeStyles.subText }} className="text-xs leading-relaxed">
            Snap your Driver's Licence and ID to activate your account. You can begin driving immediately without lengthy paperwork upfront.
          </Text>

          {isWithCar ? (
            <View 
              style={{
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                borderColor: isDark ? '#1e293b' : '#cbd5e1',
                borderWidth: 1
              }}
              className="rounded-2xl p-3 mt-3 flex-row items-center"
            >
              <Ionicons name="car-sport-outline" size={18} color={themeStyles.brandGreen} style={{ marginRight: 8 }} />
              <Text style={{ color: themeStyles.subText }} className="text-[11px] flex-1 leading-tight">
                <Text style={{ color: themeStyles.primaryText }} className="font-bold">Vehicle Photos Notice:</Text> You can upload your car pictures anytime later from your <Text style={{ color: themeStyles.brandGreen }} className="font-bold">Profile → Vehicle & Rates</Text> section so you don't delay your registration!
              </Text>
            </View>
          ) : (
            <View 
              style={{
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                borderColor: isDark ? '#1e293b' : '#cbd5e1',
                borderWidth: 1
              }}
              className="rounded-2xl p-3 mt-3 flex-row items-center"
            >
              <Ionicons name="information-circle-outline" size={18} color={themeStyles.brandGreen} style={{ marginRight: 8 }} />
              <Text style={{ color: themeStyles.subText }} className="text-[11px] flex-1 leading-tight">
                <Text style={{ color: themeStyles.primaryText }} className="font-bold">Fleet Placement Note:</Text> Guarantor verification will only be required later from your profile when you are matched with an employer's car.
              </Text>
            </View>
          )}
        </View>

        {/* Registered Vehicle Profile Summary (If with_car) */}
        {isWithCar && vehicleDetails && (
          <View 
            style={{ 
              backgroundColor: themeStyles.cardBg, 
              borderColor: themeStyles.cardBorder, 
              borderWidth: 1 
            }}
            className="rounded-3xl p-4 mb-5 shadow-sm"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="car-sport" size={18} color={themeStyles.brandGreen} style={{ marginRight: 6 }} />
                <Text style={{ color: themeStyles.primaryText }} className="font-normal text-xs uppercase">
                  Vehicle Registered
                </Text>
              </View>
              <View 
                style={{
                  backgroundColor: vehicleDetails.isArmored ? 'rgba(239, 68, 68, 0.15)' : vehicleDetails.vehicleTier === 'luxury' ? 'rgba(245, 158, 11, 0.15)' : vehicleDetails.vehicleTier === 'executive' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  borderColor: vehicleDetails.isArmored ? '#ef4444' : vehicleDetails.vehicleTier === 'luxury' ? '#f59e0b' : vehicleDetails.vehicleTier === 'executive' ? '#3b82f6' : '#10b981',
                  borderWidth: 1,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8
                }}
              >
                <Text style={{ color: vehicleDetails.isArmored ? '#ef4444' : vehicleDetails.vehicleTier === 'luxury' ? '#f59e0b' : vehicleDetails.vehicleTier === 'executive' ? '#3b82f6' : '#10b981', fontSize: 10, fontWeight: 'normal' }}>
                  {vehicleDetails.isArmored ? '🛡️ ARMORED VIP' : vehicleDetails.vehicleTier === 'luxury' ? '🌟 VIP LUXURY' : vehicleDetails.vehicleTier === 'executive' ? '👔 EXECUTIVE' : '🚗 STANDARD'}
                </Text>
              </View>
            </View>

            <Text style={{ color: themeStyles.primaryText }} className="text-base font-normal mb-1">
              {[vehicleDetails.make, vehicleDetails.model, vehicleDetails.year].filter(Boolean).join(' ')}
            </Text>

            <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-700/20">
              <Text style={{ color: themeStyles.subText }} className="text-xs font-normal">
                Color: <Text style={{ color: themeStyles.primaryText }} className="font-normal">{vehicleDetails.colour || 'Silver'}</Text>
              </Text>
              <View 
                style={{
                  backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6
                }}
              >
                <Text style={{ color: themeStyles.brandGreen }} className="text-xs font-mono font-normal">
                  {vehicleDetails.plateNumber || 'REGISTRATION'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Progress Card */}
        <View 
          style={{ backgroundColor: themeStyles.cardBg, borderColor: themeStyles.cardBorder, borderWidth: 1 }}
          className="rounded-3xl p-4 mb-5 shadow-sm"
        >
          <View className="flex-row items-end justify-between mb-2">
            <Text style={{ color: themeStyles.primaryText }} className="font-bold text-xs uppercase">
              Upload Checklist
            </Text>
            <Text style={{ color: themeStyles.brandGreen }} className="font-bold text-xs">
              {uploadedCount}/{totalDocs} Completed
            </Text>
          </View>

          {/* Progress Bar */}
          <View 
            style={{ backgroundColor: themeStyles.itemBg, borderColor: themeStyles.cardBorder }} 
            className="h-2 rounded-full mb-1 overflow-hidden border"
          >
            <View 
              style={{ width: `${progressPercent}%`, backgroundColor: themeStyles.brandGreen }} 
              className="h-full rounded-full" 
            />
          </View>
        </View>

        {/* Required Documents List */}
        <View className="space-y-3 mb-8">
          {requiredDocs.map((doc, index) => {
            const isUploaded = !!uploadedDocs[doc.id];
            
            return (
              <View 
                key={index} 
                style={{
                  backgroundColor: isUploaded 
                    ? (isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.1)') 
                    : themeStyles.cardBg,
                  borderColor: isUploaded ? themeStyles.brandGreen : themeStyles.cardBorder,
                  borderWidth: 1
                }}
                className="flex-row items-center justify-between p-4 rounded-2xl mb-2.5 shadow-sm"
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View 
                    style={{
                      backgroundColor: isUploaded ? themeStyles.brandGreen : (isDark ? '#1e293b' : '#e2e8f0')
                    }}
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  >
                    <Ionicons 
                      name={isUploaded ? "checkmark-circle" : "document-text-outline"} 
                      size={20} 
                      color={isUploaded ? "#090d16" : themeStyles.primaryText} 
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text style={{ color: themeStyles.primaryText }} className="font-bold text-sm">
                        {doc.title}
                      </Text>
                      {doc.required && (
                        <Text className="text-red-500 font-bold ml-1 text-xs">*</Text>
                      )}
                    </View>
                    <Text style={{ color: themeStyles.subText }} className="text-[10px] mt-0.5" numberOfLines={1}>
                      {isUploaded ? uploadedDocs[doc.id].name : doc.subtitle}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={{
                    backgroundColor: isUploaded ? themeStyles.brandGreen : (isDark ? '#1e293b' : '#e2e8f0'),
                    borderColor: isUploaded ? themeStyles.brandGreen : themeStyles.cardBorder,
                    borderWidth: 1
                  }}
                  className="px-4 py-2 rounded-xl"
                  onPress={() => openUploadModal(doc)}
                >
                  <Text style={{ color: isUploaded ? '#090d16' : themeStyles.primaryText }} className="font-bold text-xs uppercase">
                    {isUploaded ? 'Edit' : 'Upload'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Submit Final Application Button */}
        <TouchableOpacity 
          style={{ backgroundColor: themeStyles.brandGreen }}
          className="py-4 rounded-2xl items-center justify-center shadow-lg mb-10"
          onPress={handleFinalSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#090d16" />
          ) : (
            <Text className="text-slate-950 font-black text-sm uppercase tracking-wider">
              Complete Sign-Up & Activate Account
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Upload Choice Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => !isScanning && setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70 px-5">
          <View 
            style={{
              backgroundColor: themeStyles.cardBg,
              borderColor: themeStyles.cardBorder,
              borderWidth: 1
            }}
            className="rounded-3xl w-full p-6 shadow-2xl"
          >
            {isScanning ? (
              <View className="items-center py-6">
                <Ionicons name="scan-outline" size={56} color={themeStyles.brandGreen} className="mb-3" />
                <Text style={{ color: themeStyles.primaryText }} className="text-lg font-black mb-1">
                  AI OCR Scanner Active
                </Text>
                <Text style={{ color: themeStyles.subText }} className="text-xs text-center mb-5">
                  Scanning credentials and auto-extracting metadata for {activeDoc?.title}...
                </Text>
                <ActivityIndicator color={themeStyles.brandGreen} />
              </View>
            ) : (
              <>
                <View className="flex-row justify-between items-center mb-5">
                  <View>
                    <Text style={{ color: themeStyles.primaryText }} className="text-lg font-black">
                      Upload Document
                    </Text>
                    <Text style={{ color: themeStyles.subText }} className="text-xs">
                      {activeDoc?.title}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={themeStyles.subText} />
                  </TouchableOpacity>
                </View>
                
                {/* AI OCR Scanner Button */}
                <TouchableOpacity 
                  style={{
                    backgroundColor: isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                    borderColor: themeStyles.brandGreen,
                    borderWidth: 1
                  }}
                  className="rounded-2xl p-4 mb-3 flex-row items-center"
                  onPress={handleAIOCRScan}
                >
                  <View 
                    style={{ backgroundColor: themeStyles.brandGreen }} 
                    className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                  >
                    <Ionicons name="scan" size={22} color="#090d16" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text style={{ color: themeStyles.brandGreen }} className="font-black text-sm">
                        AI OCR Live Camera
                      </Text>
                      <View className="bg-amber-400 px-1.5 py-0.5 rounded ml-2">
                        <Text className="text-[9px] font-black text-slate-950">INSTANT</Text>
                      </View>
                    </View>
                    <Text style={{ color: themeStyles.subText }} className="text-[11px] mt-0.5">
                      Snap a quick picture of your licence or ID
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Manual File Pick */}
                <TouchableOpacity 
                  style={{
                    backgroundColor: themeStyles.itemBg,
                    borderColor: themeStyles.itemBorder,
                    borderWidth: 1
                  }}
                  className="rounded-2xl p-4 flex-row items-center"
                  onPress={handleManualUpload}
                >
                  <View 
                    style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }} 
                    className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                  >
                    <Ionicons name="folder-open" size={20} color={themeStyles.primaryText} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: themeStyles.primaryText }} className="font-bold text-sm">
                      Choose from Gallery / Files
                    </Text>
                    <Text style={{ color: themeStyles.subText }} className="text-[11px] mt-0.5">
                      Select saved image or PDF from phone
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
