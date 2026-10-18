import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl, Modal, TextInput, Platform, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { driverService, authService } from '../../api/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import HeaderBar from '../../components/HeaderBar';

export default function DriverDocumentsScreen({ navigation }) {
  const { isDark } = useTheme();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [driverId, setDriverId] = useState(null);
  const [hasVehicle, setHasVehicle] = useState(false);
  const [driverProfile, setDriverProfile] = useState(null);

  // Upload Modal States
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [selectedDocName, setSelectedDocName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [docNumber, setDocNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  // NIM / NIN Verification States
  const [currentUser, setCurrentUser] = useState(null);
  const [ninModalVisible, setNinModalVisible] = useState(false);
  const [ninInput, setNinInput] = useState('');
  const [verifyingNin, setVerifyingNin] = useState(false);
  const [ninVerified, setNinVerified] = useState(false);
  const [ninVerifiedData, setNinVerifiedData] = useState(null);

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    itemBg: isDark ? '#090d16' : '#ffffff',
    itemBorder: isDark ? '#1e293b' : '#cbd5e1',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: isDark ? '#00e588' : '#059669',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = await authService.getUser().catch(() => null);
      if (user) {
        setCurrentUser(user);
        const dId = user.driver?.id || user.driver_id;
        if (dId) {
          setDriverId(dId);
          const [docsRes, profileRes] = await Promise.all([
            driverService.getDocuments(dId).catch(() => ({ data: [] })),
            driverService.getProfile(dId).catch(() => null)
          ]);

          const docsList = docsRes?.data || [];
          setDocuments(docsList);

          const profileData = profileRes?.data || profileRes || user.driver || {};
          setDriverProfile(profileData);

          if (profileData.nin || profileData.nin_number || profileData.biometric_verified) {
            setNinVerified(true);
            setNinVerifiedData({
              nin: profileData.nin || profileData.nin_number || 'NIMC-VERIFIED',
              full_name: user.name || 'Verified Partner Driver',
            });
          }

          // Check if driver registered with a car or without a car
          const isCarOwner = profileData.has_vehicle === true || 
                            profileData.status === 'with_car' || 
                            profileData.vehicle_id !== null ||
                            Boolean(profileData.vehicle);
          setHasVehicle(isCarOwner);
        }
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVerifyNIN = async () => {
    const cleanNin = (ninInput || '').replace(/[^0-9]/g, '');
    if (cleanNin.length !== 11) {
      Alert.alert('Invalid NIN', 'National Identification Number must be exactly 11 digits.');
      return;
    }

    try {
      setVerifyingNin(true);
      const res = await driverService.verifyNIN({
        nin: cleanNin,
        firstname: currentUser?.name?.split(' ')[0] || '',
        lastname: currentUser?.name?.split(' ')[1] || '',
      });

      if (res?.success) {
        setNinVerified(true);
        setNinVerifiedData(res.data);
        setNinModalVisible(false);
        Alert.alert('NIMC Verified', 'Your National Identification Number has been successfully verified with the national identity database.');
        loadData();
      } else {
        Alert.alert('Verification Failed', res?.message || 'Could not verify NIN.');
      }
    } catch (e) {
      Alert.alert('Verification Error', e?.response?.data?.message || 'Could not connect to national identity database.');
    } finally {
      setVerifyingNin(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleUploadPress = (type, name) => {
    setSelectedDocType(type);
    setSelectedDocName(name);
    setUploadModalVisible(true);
    setDocNumber('');
    setSelectedFile(null);
  };

  const pickImage = async (useCamera = false) => {
    const permissionResult = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Camera/Gallery access is required.');
      return;
    }

    const pickerResult = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true });

    if (!pickerResult.canceled && pickerResult.assets?.[0]) {
      const asset = pickerResult.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: `${selectedDocType || 'doc'}_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
    }
  };

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets?.[0]) {
        const file = res.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Required', 'Please select a document or snap a photo.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('document_type', selectedDocType);
      formData.append('document_number', docNumber || 'N/A');
      formData.append('expiry_date', expiryDate.toISOString().split('T')[0]);
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.type,
      });

      await driverService.uploadDocument(driverId, formData);
      
      Alert.alert('Uploaded Successfully', `${selectedDocName} has been submitted and sent to Super Admin for verification review.`);
      setUploadModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('Upload Failed', 'Could not process file upload. Please verify file format.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadGuarantorForm = async () => {
    try {
      await Share.share({
        title: 'OgaDriver Official Guarantor Form',
        message: 'Download the official OgaDriver Guarantor Verification Form (PDF) to print and complete:\nhttps://ogadriver.ng/downloads/OgaDriver_Guarantor_Form.pdf\n\nNote: Verified guarantors are required for vehicle allocation.',
      });
    } catch (e) {
      Alert.alert("Guarantor Form", "Official Guarantor Form is accessible at: https://ogadriver.ng/downloads/OgaDriver_Guarantor_Form.pdf");
    }
  };

  // 1. Rejected Documents Filter
  const rejectedDocs = documents.filter(d => d.status === 'rejected');

  // 2. Guarantor Documents Filter (for drivers without car)
  const guarantorDocTypes = [
    { type: 'guarantor_form_a', title: 'Guarantor A Form', description: 'Signed and completed Guarantor A verification sheet' },
    { type: 'guarantor_form_b', title: 'Guarantor B Form', description: 'Signed and completed Guarantor B verification sheet' },
    { type: 'guarantor_a_id', title: 'Guarantor A Identity ID', description: 'NIN, International Passport, or Voter Card of Guarantor A' },
    { type: 'guarantor_b_id', title: 'Guarantor B Identity ID', description: 'NIN, International Passport, or Voter Card of Guarantor B' },
  ];

  const getDocStatus = (type) => {
    const doc = documents.find(d => d.document_type === type);
    return doc?.status || 'unsubmitted';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Top Header Bar with Single-Icon Theme Toggle */}
      <HeaderBar 
        navigation={navigation} 
        showBack={true}
        title="Vetting & Compliance Portal" 
        subtitle="Verification & credentials vault" 
      />

      <ScrollView
        className="flex-1 px-4 pt-3 pb-12"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeStyles.brandGreen} />}
      >
        {/* Screen Title */}
        <View className="mb-4">
          <Text style={{ color: themeStyles.titleText, fontSize: 26, fontWeight: 'normal' }}>
            Vetting & Compliance Portal
          </Text>
          <Text style={{ color: themeStyles.subText, fontSize: 13, marginTop: 2, fontWeight: 'normal' }}>
            Aligned with Super Admin compliance roster & operational requirements
          </Text>
        </View>

        {loading ? (
          <View className="py-16 items-center justify-center">
            <ActivityIndicator size="large" color={themeStyles.brandGreen} />
            <Text style={{ color: themeStyles.subText, fontSize: 12, marginTop: 8, fontWeight: 'normal' }}>
              Checking compliance roster...
            </Text>
          </View>
        ) : (
          <>
            {/* ─── NATIONAL IDENTITY NUMBER (NIMC / NIN) VERIFICATION CARD ─── */}
            <View 
              style={{
                backgroundColor: themeStyles.cardBg,
                borderColor: ninVerified ? themeStyles.brandGreen : themeStyles.cardBorder,
                borderWidth: 1
              }}
              className="rounded-3xl p-5 mb-5 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1 mr-2">
                  <View 
                    style={{
                      backgroundColor: ninVerified ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.1)',
                      borderColor: themeStyles.brandGreen,
                      borderWidth: 1
                    }}
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                  >
                    <Ionicons 
                      name={ninVerified ? "shield-checkmark" : "finger-print-outline"} 
                      size={20} 
                      color={themeStyles.brandGreen} 
                    />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: themeStyles.primaryText, fontSize: 15, fontWeight: 'normal' }}>
                      NIMC National Identity (NIN)
                    </Text>
                    <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginTop: 1 }}>
                      {ninVerified 
                        ? 'Validated with National Identity Database' 
                        : 'National identity verification via NIMC API'}
                    </Text>
                  </View>
                </View>

                {ninVerified ? (
                  <View className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex-row items-center">
                    <Ionicons name="checkmark-circle" size={13} color={themeStyles.brandGreen} style={{ marginRight: 4 }} />
                    <Text style={{ color: themeStyles.brandGreen, fontSize: 11, fontWeight: 'normal' }}>
                      VERIFIED
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setNinInput('');
                      setNinModalVisible(true);
                    }}
                    style={{ backgroundColor: themeStyles.brandGreen }}
                    className="px-3.5 py-1.5 rounded-xl flex-row items-center"
                  >
                    <Text className="text-slate-950 font-normal text-xs uppercase tracking-wider">
                      Verify NIN
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {ninVerified && (
                <View 
                  style={{
                    backgroundColor: isDark ? '#090d16' : '#ffffff',
                    borderColor: themeStyles.cardBorder,
                    borderWidth: 1
                  }}
                  className="p-3 rounded-2xl mt-2 flex-row justify-between items-center"
                >
                  <View>
                    <Text style={{ color: themeStyles.subText, fontSize: 10, textTransform: 'uppercase', fontWeight: 'normal' }}>
                      Verified Citizen Identity
                    </Text>
                    <Text style={{ color: themeStyles.primaryText, fontSize: 13, fontWeight: 'normal', marginTop: 1 }}>
                      {ninVerifiedData?.full_name || currentUser?.name || 'Verified Partner'}
                    </Text>
                  </View>
                  <Text style={{ color: themeStyles.brandGreen, fontSize: 12, fontWeight: 'normal' }}>
                    NIN: {ninVerifiedData?.nin ? `${String(ninVerifiedData.nin).slice(0, 4)}••••${String(ninVerifiedData.nin).slice(-3)}` : 'VERIFIED'}
                  </Text>
                </View>
              )}
            </View>

            {/* ─── SECTION 1: REJECTED UPLOADED IMAGES BY ADMIN ─── */}
            {rejectedDocs.length > 0 && (
              <View 
                style={{
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                  borderColor: isDark ? '#ef4444' : '#f87171',
                  borderWidth: 1
                }}
                className="rounded-3xl p-5 mb-5 shadow-md"
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-9 h-9 rounded-xl bg-red-500/20 items-center justify-center mr-3 border border-red-500/40">
                    <Ionicons name="alert-circle" size={20} color="#ef4444" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: isDark ? '#fca5a5' : '#b91c1c', fontSize: 15, fontWeight: 'normal' }}>
                      Action Required: Rejected Documents ({rejectedDocs.length})
                    </Text>
                    <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginTop: 1 }}>
                      Super Admin requested clear re-uploads for the items below:
                    </Text>
                  </View>
                </View>

                {/* List of Rejected Items */}
                <View className="space-y-3">
                  {rejectedDocs.map((doc, idx) => (
                    <View 
                      key={idx}
                      style={{
                        backgroundColor: themeStyles.cardBg,
                        borderColor: isDark ? '#7f1d1d' : '#fecaca',
                        borderWidth: 1
                      }}
                      className="p-4 rounded-2xl mb-2.5"
                    >
                      <View className="flex-row items-center justify-between mb-1.5">
                        <Text style={{ color: themeStyles.primaryText, fontSize: 13, fontWeight: 'normal' }}>
                          {doc.document_type ? doc.document_type.replace(/_/g, ' ').toUpperCase() : 'DOCUMENT'}
                        </Text>
                        <View className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/30">
                          <Text className="text-red-500 text-[10px] uppercase font-normal">
                            Rejected by Admin
                          </Text>
                        </View>
                      </View>

                      {/* Admin Reason Callout */}
                      <View 
                        style={{
                          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                          borderWidth: 1
                        }}
                        className="p-3 rounded-xl mb-3"
                      >
                        <Text style={{ color: isDark ? '#fca5a5' : '#991b1b', fontSize: 11, fontWeight: 'normal' }}>
                          Reason: {doc.rejection_reason || 'Photo blurred, expired, or illegible. Please provide a clear snap.'}
                        </Text>
                      </View>

                      {/* Snap & Re-upload Button */}
                      <TouchableOpacity
                        onPress={() => handleUploadPress(doc.document_type, doc.document_type.replace(/_/g, ' '))}
                        style={{ backgroundColor: themeStyles.brandGreen }}
                        className="py-2.5 rounded-xl flex-row items-center justify-center"
                      >
                        <Ionicons name="camera-outline" size={16} color="#090d16" style={{ marginRight: 6 }} />
                        <Text className="text-slate-950 font-normal text-xs uppercase tracking-wider">
                          Snap & Re-upload Photo
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ─── SECTION 2: GUARANTORS FORM (FOR DRIVERS WITHOUT CAR ONLY) ─── */}
            {!hasVehicle ? (
              <View 
                style={{
                  backgroundColor: themeStyles.cardBg,
                  borderColor: themeStyles.cardBorder,
                  borderWidth: 1
                }}
                className="rounded-3xl p-5 mb-5 shadow-sm"
              >
                {/* Header Title */}
                <View className="flex-row items-center mb-3">
                  <View 
                    style={{
                      backgroundColor: isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.1)',
                      borderColor: themeStyles.brandGreen,
                      borderWidth: 1
                    }}
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                  >
                    <Ionicons name="people-outline" size={20} color={themeStyles.brandGreen} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: themeStyles.primaryText, fontSize: 15, fontWeight: 'normal' }}>
                      Guarantors Form & Dossier
                    </Text>
                    <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginTop: 1 }}>
                      Required for fleet operatives seeking vehicle placement
                    </Text>
                  </View>
                </View>

                {/* Important Advisory Reminder */}
                <View 
                  style={{
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : '#fffbeb',
                    borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#fde68a',
                    borderWidth: 1
                  }}
                  className="p-3.5 rounded-2xl mb-4"
                >
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="information-circle-outline" size={16} color={themeStyles.brandGreen} style={{ marginRight: 6 }} />
                    <Text style={{ color: themeStyles.brandGreen }} className="text-xs font-normal">
                      Vehicle Placement Advisory
                    </Text>
                  </View>
                  <Text style={{ color: themeStyles.subText }} className="text-[11px] leading-relaxed font-normal">
                    Please note: Your chances of getting a job or vehicle allocation without a verified guarantor are low. Fleet employers mandate verified guarantors before dispatching high-value vehicles.
                  </Text>
                </View>

                {/* Instructions to download after initial registration */}
                <Text style={{ color: themeStyles.subText, fontSize: 12, lineHeight: 18, marginBottom: 14, fontWeight: 'normal' }}>
                  Now that you have completed your initial registration and entered the operations system, download the official form, print it, have your two guarantors fill and sign it, and upload the completed copies below.
                </Text>

                {/* Download Form Button */}
                <TouchableOpacity
                  onPress={handleDownloadGuarantorForm}
                  style={{
                    backgroundColor: isDark ? 'rgba(0, 229, 136, 0.08)' : '#ecfdf5',
                    borderColor: themeStyles.brandGreen,
                    borderWidth: 1
                  }}
                  className="py-3 rounded-2xl flex-row items-center justify-center mb-5"
                >
                  <Ionicons name="download-outline" size={18} color={themeStyles.brandGreen} style={{ marginRight: 8 }} />
                  <Text style={{ color: themeStyles.brandGreen }} className="font-normal text-xs uppercase tracking-wider">
                    Download Official Guarantor Form (PDF)
                  </Text>
                </TouchableOpacity>

                {/* Upload Guarantor Form Items */}
                <Text style={{ color: themeStyles.primaryText, fontSize: 13, fontWeight: 'normal', marginBottom: 8 }}>
                  Upload Completed Guarantor Documents
                </Text>

                <View className="space-y-2.5">
                  {guarantorDocTypes.map((item, idx) => {
                    const status = getDocStatus(item.type);
                    const isSubmitted = status === 'approved' || status === 'pending';
                    const isRejected = status === 'rejected';

                    return (
                      <View
                        key={idx}
                        style={{
                          backgroundColor: themeStyles.itemBg,
                          borderColor: themeStyles.cardBorder,
                          borderWidth: 1
                        }}
                        className="p-3.5 rounded-2xl mb-2 flex-row items-center justify-between"
                      >
                        <View className="flex-1 mr-3">
                          <Text style={{ color: themeStyles.primaryText, fontSize: 12, fontWeight: 'normal' }}>
                            {item.title}
                          </Text>
                          <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal', marginTop: 1 }} numberOfLines={1}>
                            {item.description}
                          </Text>
                          <View className="flex-row items-center mt-1.5">
                            <Ionicons 
                              name={isSubmitted ? "checkmark-circle" : isRejected ? "close-circle" : "time-outline"} 
                              size={12} 
                              color={isSubmitted ? themeStyles.brandGreen : themeStyles.subText} 
                              style={{ marginRight: 4 }} 
                            />
                            <Text 
                              style={{
                                color: isSubmitted ? themeStyles.brandGreen : themeStyles.subText,
                                fontSize: 10,
                                fontWeight: 'normal',
                                textTransform: 'capitalize'
                              }}
                            >
                              {status === 'unsubmitted' ? 'Not uploaded' : status}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          onPress={() => handleUploadPress(item.type, item.title)}
                          style={{
                            backgroundColor: isSubmitted ? (isDark ? '#1e293b' : '#e2e8f0') : themeStyles.brandGreen
                          }}
                          className="px-3.5 py-2 rounded-xl flex-row items-center"
                        >
                          <Ionicons 
                            name={isSubmitted ? "refresh-outline" : "cloud-upload-outline"} 
                            size={14} 
                            color={isSubmitted ? themeStyles.primaryText : "#090d16"} 
                            style={{ marginRight: 4 }} 
                          />
                          <Text 
                            style={{
                              color: isSubmitted ? themeStyles.primaryText : "#090d16",
                              fontSize: 11,
                              fontWeight: 'normal'
                            }}
                          >
                            {isSubmitted ? 'Update' : 'Upload'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* ─── SECTION 3: PRISTINE STATUS (FOR DRIVERS WITH CAR & ZERO REJECTIONS) ─── */}
            {hasVehicle && rejectedDocs.length === 0 && (
              <View 
                style={{
                  backgroundColor: themeStyles.cardBg,
                  borderColor: themeStyles.cardBorder,
                  borderWidth: 1
                }}
                className="rounded-3xl p-6 mb-5 items-center shadow-md"
              >
                <View 
                  style={{
                    backgroundColor: isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.1)',
                    borderColor: themeStyles.brandGreen,
                    borderWidth: 1
                  }}
                  className="w-16 h-16 rounded-full items-center justify-center mb-3"
                >
                  <Ionicons name="shield-checkmark" size={32} color={themeStyles.brandGreen} />
                </View>
                <Text style={{ color: themeStyles.primaryText, fontSize: 17, fontWeight: 'normal', marginBottom: 4 }}>
                  All Credentials In Good Standing
                </Text>
                <Text style={{ color: themeStyles.subText, fontSize: 12, textAlign: 'center', lineHeight: 18, fontWeight: 'normal', paddingHorizontal: 12 }}>
                  Your road credentials comply with Super Admin verification standards. You operate your registered vehicle with full platform clearance.
                </Text>
              </View>
            )}

            {/* Help / Verification Guide Footer */}
            <View 
              style={{
                backgroundColor: themeStyles.cardBg,
                borderColor: themeStyles.cardBorder,
                borderWidth: 1
              }}
              className="rounded-3xl p-4 mb-8 flex-row items-center"
            >
              <Ionicons name="information-circle-outline" size={20} color={themeStyles.brandGreen} style={{ marginRight: 10 }} />
              <Text style={{ color: themeStyles.subText, fontSize: 11, lineHeight: 16, flex: 1, fontWeight: 'normal' }}>
                Need help with documentation? Reach our verification compliance desk directly through Support.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={uploadModalVisible}
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View 
            style={{
              backgroundColor: themeStyles.cardBg,
              borderColor: themeStyles.cardBorder,
              borderTopWidth: 1
            }}
            className="rounded-t-3xl p-6"
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ color: themeStyles.primaryText, fontSize: 16, fontWeight: 'normal' }}>
                Upload {selectedDocName}
              </Text>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <Ionicons name="close" size={22} color={themeStyles.subText} />
              </TouchableOpacity>
            </View>

            {/* Document ID Number (Optional) */}
            <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 6 }}>
              DOCUMENT IDENTIFIER / REFERENCE NUMBER (OPTIONAL)
            </Text>
            <TextInput
              value={docNumber}
              onChangeText={setDocNumber}
              placeholder="e.g. DL-92847294"
              placeholderTextColor={themeStyles.subText}
              style={{
                backgroundColor: themeStyles.itemBg,
                borderColor: themeStyles.itemBorder,
                color: themeStyles.primaryText,
                borderWidth: 1,
                fontSize: 13,
                fontWeight: 'normal'
              }}
              className="rounded-2xl px-4 py-3 mb-4"
            />

            {/* Choose Source: Camera vs Gallery vs Document */}
            <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 8 }}>
              SELECT SOURCE
            </Text>
            <View className="flex-row justify-between mb-5">
              <TouchableOpacity
                onPress={() => pickImage(true)}
                style={{
                  backgroundColor: themeStyles.itemBg,
                  borderColor: themeStyles.itemBorder,
                  borderWidth: 1
                }}
                className="flex-1 py-3 mx-1 rounded-2xl items-center"
              >
                <Ionicons name="camera" size={20} color={themeStyles.brandGreen} />
                <Text style={{ color: themeStyles.primaryText, fontSize: 11, fontWeight: 'normal', marginTop: 4 }}>
                  Camera Snap
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => pickImage(false)}
                style={{
                  backgroundColor: themeStyles.itemBg,
                  borderColor: themeStyles.itemBorder,
                  borderWidth: 1
                }}
                className="flex-1 py-3 mx-1 rounded-2xl items-center"
              >
                <Ionicons name="images" size={20} color={themeStyles.brandGreen} />
                <Text style={{ color: themeStyles.primaryText, fontSize: 11, fontWeight: 'normal', marginTop: 4 }}>
                  Photo Gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickDocument}
                style={{
                  backgroundColor: themeStyles.itemBg,
                  borderColor: themeStyles.itemBorder,
                  borderWidth: 1
                }}
                className="flex-1 py-3 mx-1 rounded-2xl items-center"
              >
                <Ionicons name="document-text" size={20} color={themeStyles.brandGreen} />
                <Text style={{ color: themeStyles.primaryText, fontSize: 11, fontWeight: 'normal', marginTop: 4 }}>
                  PDF Document
                </Text>
              </TouchableOpacity>
            </View>

            {/* Selected File HUD */}
            {selectedFile && (
              <View 
                style={{
                  backgroundColor: isDark ? 'rgba(0, 229, 136, 0.1)' : 'rgba(5, 150, 105, 0.1)',
                  borderColor: themeStyles.brandGreen,
                  borderWidth: 1
                }}
                className="p-3 rounded-2xl mb-5 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <Ionicons name="checkmark-circle" size={18} color={themeStyles.brandGreen} style={{ marginRight: 6 }} />
                  <Text style={{ color: themeStyles.primaryText, fontSize: 11, fontWeight: 'normal' }} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedFile(null)}>
                  <Ionicons name="close-circle" size={16} color={themeStyles.subText} />
                </TouchableOpacity>
              </View>
            )}

            {/* Submit Upload CTA */}
            <TouchableOpacity
              onPress={submitUpload}
              disabled={uploading || !selectedFile}
              style={{
                backgroundColor: selectedFile ? themeStyles.brandGreen : (isDark ? '#1e293b' : '#cbd5e1')
              }}
              className="py-4 rounded-2xl items-center justify-center mb-4"
            >
              {uploading ? (
                <ActivityIndicator color="#090d16" />
              ) : (
                <Text 
                  style={{
                    color: selectedFile ? '#090d16' : '#64748b',
                    fontSize: 13,
                    fontWeight: 'normal',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}
                >
                  Submit for Super Admin Review
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NIM / NIN Verification Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={ninModalVisible}
        onRequestClose={() => setNinModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View 
            style={{
              backgroundColor: themeStyles.cardBg,
              borderColor: themeStyles.cardBorder,
              borderWidth: 1
            }}
            className="rounded-t-[2.5rem] p-6 pb-10 shadow-2xl"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View 
                  style={{
                    backgroundColor: 'rgba(0, 229, 136, 0.12)',
                    borderColor: themeStyles.brandGreen,
                    borderWidth: 1
                  }}
                  className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                >
                  <Ionicons name="finger-print" size={18} color={themeStyles.brandGreen} />
                </View>
                <Text style={{ color: themeStyles.primaryText, fontSize: 16, fontWeight: 'normal' }}>
                  Verify National ID (NIN)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setNinModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={themeStyles.subText} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: themeStyles.subText, fontSize: 12, lineHeight: 18, marginBottom: 16, fontWeight: 'normal' }}>
              Enter your 11-digit National Identification Number (NIN). Your identity will be confirmed directly through Nigeria's national registry.
            </Text>

            {/* NIN Input */}
            <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 6, textTransform: 'uppercase' }}>
              11-DIGIT NATIONAL IDENTIFICATION NUMBER
            </Text>
            <View 
              style={{
                backgroundColor: themeStyles.itemBg,
                borderColor: themeStyles.itemBorder,
                borderWidth: 1
              }}
              className="flex-row items-center rounded-2xl px-4 py-3 mb-4"
            >
              <TextInput
                value={ninInput}
                onChangeText={(text) => setNinInput(text.replace(/[^0-9]/g, '').slice(0, 11))}
                placeholder="e.g. 12345678901"
                placeholderTextColor={themeStyles.subText}
                keyboardType="numeric"
                maxLength={11}
                style={{ color: themeStyles.primaryText, fontSize: 15, fontWeight: 'normal', flex: 1, letterSpacing: 2 }}
              />
              <Text style={{ color: themeStyles.subText, fontSize: 11 }}>
                {ninInput.length}/11
              </Text>
            </View>

            {/* Official Advisory */}
            <View 
              style={{
                backgroundColor: isDark ? 'rgba(0, 229, 136, 0.08)' : '#f0fdf4',
                borderColor: themeStyles.brandGreen,
                borderWidth: 1
              }}
              className="p-3 rounded-2xl mb-6 flex-row items-center"
            >
              <Ionicons name="shield-checkmark" size={16} color={themeStyles.brandGreen} style={{ marginRight: 8 }} />
              <Text style={{ color: themeStyles.subText, fontSize: 11, lineHeight: 16, flex: 1, fontWeight: 'normal' }}>
                Verified details are encrypted and matched with your official driver profile.
              </Text>
            </View>

            {/* Verify CTA */}
            <TouchableOpacity
              onPress={handleVerifyNIN}
              disabled={verifyingNin || ninInput.length !== 11}
              style={{
                backgroundColor: ninInput.length === 11 ? themeStyles.brandGreen : (isDark ? '#1e293b' : '#cbd5e1')
              }}
              className="py-4 rounded-2xl items-center justify-center mb-2"
            >
              {verifyingNin ? (
                <ActivityIndicator color="#090d16" />
              ) : (
                <Text 
                  style={{
                    color: ninInput.length === 11 ? '#090d16' : '#64748b',
                    fontSize: 13,
                    fontWeight: 'normal',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}
                >
                  Verify with National Registry
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
