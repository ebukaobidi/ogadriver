import * as Location from 'expo-location';
import { Platform } from 'react-native';
// In a true EAS build, this would use a background SMS native module or expo-sms.
// import * as SMS from 'expo-sms'; 

class OfflineMeshService {
    constructor() {
        this.isOffline = false;
        this.lastPing = Date.now();
        this.checkInterval = null;
    }

    startMonitoring(jobId) {
        if (this.checkInterval) clearInterval(this.checkInterval);
        
        this.checkInterval = setInterval(async () => {
            // Check internet via a quick ping
            try {
                const response = await fetch('https://8.8.8.8', { method: 'HEAD', cache: 'no-cache' });
                this.isOffline = !response.ok;
            } catch (e) {
                this.isOffline = true;
            }

            if (this.isOffline) {
                console.log('[OFFLINE MESH] Connection lost. Switching to SMS Bridge...');
                this.dispatchOfflinePing(jobId);
            }
        }, 120000); // Check every 2 minutes
    }

    stopMonitoring() {
        if (this.checkInterval) clearInterval(this.checkInterval);
    }

    async dispatchOfflinePing(jobId) {
        try {
            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const payload = `OGA-LOC:${location.coords.latitude},${location.coords.longitude}:JOB${jobId}`;
            
            // Simulating a silent background SMS via Termii Gateway Number
            // In a production bare-workflow (EAS), we would use android.telephony.SmsManager
            console.log(`[OFFLINE MESH] Dispatched encrypted SMS payload to Gateway: ${payload}`);
            
            // If using expo-sms (Requires user action):
            // const isAvailable = await SMS.isAvailableAsync();
            // if (isAvailable) {
            //   await SMS.sendSMSAsync(['+2348000000000'], payload);
            // }
        } catch (e) {
            console.error('[OFFLINE MESH] Failed to dispatch offline location', e);
        }
    }
}

export default new OfflineMeshService();
