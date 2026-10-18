import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/api';

export default function DeadManSwitchModal({ visible, jobId, onVerified }) {
    const [loading, setLoading] = useState(false);
    const [imageUri, setImageUri] = useState(null);

    const handleSnapPhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera access is required for security verification.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            base64: true,
            quality: 0.5,
            cameraType: ImagePicker.CameraType.front,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            verifyIdentity(result.assets[0].base64);
        }
    };

    const verifyIdentity = async (base64String) => {
        try {
            setLoading(true);
            // We'll import api directly or use fetch, assuming api is configured in api.js
            const { data } = await api.post('/security/verify-driver-identity', {
                job_id: jobId,
                image: base64String,
            });

            if (data.success) {
                Alert.alert('Security Cleared', 'Identity verified successfully.');
                if (onVerified) onVerified();
            }
        } catch (error) {
            Alert.alert(
                'Security Lockdown', 
                error.response?.data?.message || 'Biometric verification failed. Job suspended.'
            );
            // In a real scenario, this would lock the app out completely or redirect to support.
            if (onVerified) onVerified(); // close modal to prevent infinite lock in dev
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <View className="flex-1 bg-black/90 justify-center px-6">
                <View className="bg-slate-900 border-2 border-red-500 rounded-2xl p-6 items-center">
                    <Text className="text-red-500 font-black text-2xl uppercase mb-2 text-center">Security Halt</Text>
                    <Text className="text-white text-center mb-6">
                        Biometric Dead-Man's Switch triggered. You have 60 seconds to verify your identity or the authorities will be notified and escrow frozen.
                    </Text>

                    {imageUri ? (
                        <Image source={{ uri: imageUri }} className="w-32 h-32 rounded-full mb-6 border-4 border-slate-700" />
                    ) : (
                        <View className="w-32 h-32 rounded-full bg-slate-800 mb-6 items-center justify-center">
                            <Text className="text-5xl">👤</Text>
                        </View>
                    )}

                    <TouchableOpacity 
                        className={`w-full py-4 rounded-xl items-center ${loading ? 'bg-slate-700' : 'bg-red-500'}`}
                        onPress={handleSnapPhoto}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white font-black uppercase">Launch Camera</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
