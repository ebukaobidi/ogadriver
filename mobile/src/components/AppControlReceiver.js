import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Linking, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import api from '../api/api';
import { useNavigation } from '@react-navigation/native';

export default function AppControlReceiver({ children }) {
  const [updateRequired, setUpdateRequired] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [version, setVersion] = useState('');

  const checkAppControls = async () => {
    try {
      const res = await api.get('/settings/public'); // We need to create this open endpoint
      if (res.data?.status === 'success') {
        const settings = res.data.data;
        
        const currentVersion = Constants.expoConfig?.version || '1.0.0';
        const targetVersion = settings.app_version || '1.0.0';
        const isForceUpdate = settings.app_force_update === 'true' || settings.app_force_update === true;

        if (currentVersion !== targetVersion && isForceUpdate) {
          setVersion(targetVersion);
          setReleaseNotes(settings.app_release_notes || 'A critical update is required to continue.');
          setUpdateRequired(true);
        }
      }
    } catch (err) {
      console.log('Failed to check app controls', err);
    }
  };

  useEffect(() => {
    // Check on launch
    checkAppControls();
    
    // Check every 5 minutes while app is open
    const interval = setInterval(checkAppControls, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {children}
      <Modal visible={updateRequired} animationType="slide" transparent={false} onRequestClose={() => {}}>
        <View className="flex-1 bg-slate-950 justify-center px-6">
          <View className="w-16 h-16 bg-amber-500/20 rounded-2xl border border-amber-500/50 items-center justify-center mb-6">
            <Text className="text-3xl">🚀</Text>
          </View>
          
          <Text className="text-3xl font-black text-white uppercase tracking-widest mb-2">
            Update Required
          </Text>
          <Text className="text-amber-500 font-bold mb-6">
            Version {version} is now available.
          </Text>
          
          <View className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-8">
            <Text className="text-slate-400 font-bold uppercase text-[10px] mb-2 tracking-wider">What's New</Text>
            <Text className="text-white text-sm leading-relaxed">{releaseNotes}</Text>
          </View>

          <TouchableOpacity 
            onPress={() => Linking.openURL('https://ogadriver.ng/download')}
            className="w-full bg-amber-500 py-4 rounded-xl items-center shadow-[0_0_20px_rgba(245,158,11,0.3)]"
          >
            <Text className="text-slate-950 font-black uppercase tracking-widest">Download Update</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}
