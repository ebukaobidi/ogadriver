import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/api';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

export default function AppLockScreen({ navigation, route }) {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [correctPin, setCorrectPin] = useState(null);
    const [duressPin, setDuressPin] = useState(null);

    useEffect(() => {
        const loadPins = async () => {
            const storedPin = await SecureStore.getItemAsync('app_lock_pin');
            const storedDuressPin = await SecureStore.getItemAsync('duress_pin');
            if (!storedPin) {
                // If no PIN set, we should probably guide them to set it, but for now we fallback
                setCorrectPin('1234');
            } else {
                setCorrectPin(storedPin);
            }
            setDuressPin(storedDuressPin || '9999');
        };
        loadPins();
    }, []);

    const handlePress = (num) => {
        if (pin.length < 4) {
            setPin(pin + num);
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const handleUnlock = async () => {
        if (pin === correctPin) {
            navigation.goBack();
        } else if (pin === duressPin) {
            try {
                setLoading(true);
                const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                
                await api.post('/emergency/covert-alert', {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    pin: pin,
                    job_id: route.params?.jobId || null,
                });
                
                // Unlocks seamlessly so attacker suspects nothing
                navigation.goBack(); 
            } catch (error) {
                // Failsafe unlock even if offline, to maintain cover
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        } else {
            setPin('');
            Alert.alert('Error', 'Incorrect PIN');
        }
    };

    // Auto-submit when 4 digits are entered
    React.useEffect(() => {
        if (pin.length === 4) {
            handleUnlock();
        }
    }, [pin]);

    return (
        <SafeAreaView className="flex-1 bg-slate-950 justify-center items-center">
            <View className="items-center mb-10">
                <Text className="text-white text-3xl font-black uppercase tracking-widest mb-2">App Lock</Text>
                <Text className="text-slate-400">Enter your 4-digit security PIN</Text>
            </View>

            <View className="flex-row space-x-4 mb-12">
                {[...Array(4)].map((_, i) => (
                    <View 
                        key={i} 
                        className={`w-4 h-4 rounded-full ${i < pin.length ? 'bg-brandMint' : 'bg-slate-800'}`} 
                    />
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#1cd188" />
            ) : (
                <View className="w-64 flex-row flex-wrap justify-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'X'].map((key, index) => (
                        <TouchableOpacity
                            key={index}
                            className="w-20 h-20 items-center justify-center m-1"
                            onPress={() => {
                                if (key === 'C') setPin('');
                                else if (key === 'X') handleDelete();
                                else handlePress(key.toString());
                            }}
                        >
                            <Text className={`text-3xl font-bold ${typeof key === 'number' ? 'text-white' : 'text-slate-500'}`}>
                                {key}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </SafeAreaView>
    );
}
