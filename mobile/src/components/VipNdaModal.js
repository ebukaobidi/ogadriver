import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { jobService } from '../api/api';

export default function VipNdaModal({ visible, jobId, onSigned, onCancel }) {
 const [signature, setSignature] = useState('');
 const [loading, setLoading] = useState(false);

 const handleSign = async () => {
 if (!signature.trim()) {
 Alert.alert('Error', 'Please type your full legal name to sign.');
 return;
 }

 try {
 setLoading(true);
 const res = await jobService.signNda(jobId, { signature });
 if (res.status === 'success') {
 Alert.alert('NDA Signed', 'Stealth Protocol unlocked. You may now view the coordinates.');
 onSigned();
 } else {
 Alert.alert('Error', res.message || 'Failed to sign NDA');
 }
 } catch (error) {
 Alert.alert('Error', 'An error occurred while signing the NDA.');
 } finally {
 setLoading(false);
 }
 };

 return (
 <Modal visible={visible} transparent={true} animationType="slide">
 <View style={styles.overlay}>
 <View style={styles.modalContainer}>
 <View style={styles.header}>
 <Text style={styles.title}>Stealth Protocol NDA</Text>
 <Text style={styles.subtitle}>Confidentiality Agreement Required</Text>
 </View>

 <View style={styles.content}>
 <Text style={styles.text}>
 This VIP transport job is under Stealth Protocol. The client's pickup and drop-off coordinates are strictly confidential.
 </Text>
 <Text style={styles.text}>
 By signing this digital Non-Disclosure Agreement, you agree not to share, leak, or disclose the locations, identity, or schedule of this high-profile client under penalty of immediate platform ban and legal action.
 </Text>

 <TextInput
 style={styles.input}
 placeholder="Type your full legal name to sign"
 value={signature}
 onChangeText={setSignature}
 />
 </View>

 <View style={styles.actions}>
 <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
 <Text style={styles.cancelText}>Refuse & Go Back</Text>
 </TouchableOpacity>
 
 <TouchableOpacity style={styles.signBtn} onPress={handleSign} disabled={loading}>
 {loading ? (
 <ActivityIndicator color="#111" />
 ) : (
 <Text style={styles.signText}>I Agree & Sign</Text>
 )}
 </TouchableOpacity>
 </View>
 </View>
 </View>
 </Modal>
 );
}

const styles = StyleSheet.create({
 overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
 modalContainer: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
 header: { backgroundColor: '#111', padding: 20, alignItems: 'center' },
 title: { color: '#FFD700', fontSize: 20, fontWeight: 'bold' },
 subtitle: { color: '#ccc', fontSize: 14, marginTop: 5 },
 content: { padding: 20 },
 text: { fontSize: 14, color: '#333', marginBottom: 15, lineHeight: 20 },
 input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, fontSize: 16, backgroundColor: '#f9f9f9', marginTop: 10 },
 actions: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#eee' },
 cancelBtn: { flex: 1, padding: 15, alignItems: 'center', borderRightWidth: 1, borderColor: '#eee' },
 cancelText: { color: '#ef4444', fontWeight: 'bold' },
 signBtn: { flex: 1, padding: 15, alignItems: 'center', backgroundColor: '#FFD700' },
 signText: { color: '#111', fontWeight: 'bold' }
});
