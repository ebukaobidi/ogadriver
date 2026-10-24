# -*- coding: utf-8 -*-
import io

path = 'frontend/src/pages/Login.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

old_bio_func = """                      onClick={() => {
                        if (!window.PublicKeyCredential) {
                          setError('Biometric Face ID / Fingerprint login is not supported on this browser or device.');
                          return;
                        }
                        const token = authService.getToken();
                        const user = authService.getUser();
                        if (token && user) {
                          window.location.href = '/dashboard';
                        } else {
                          setError('No saved biometric key found. Please sign in with your password or OTP once to register this device.');
                        }
                      }}"""

new_bio_func = """                      onClick={async () => {
                        if (!window.PublicKeyCredential) {
                          setError('Biometric Face ID / Fingerprint login is not supported on this browser or device.');
                          return;
                        }
                        try {
                          // Trigger native browser biometric/passkey prompt
                          const challenge = new Uint8Array(32);
                          window.crypto.getRandomValues(challenge);
                          await navigator.credentials.get({
                            publicKey: {
                              challenge: challenge,
                              rpId: window.location.hostname,
                              userVerification: "required",
                              timeout: 60000
                            }
                          });
                          // If biometric succeeds, we mock a successful login to dashboard
                          // In production, we would send the assertion to the backend for verification.
                          window.location.href = '/dashboard';
                        } catch (err) {
                          console.error(err);
                          setError('Biometric authentication failed or was cancelled.');
                        }
                      }}"""

text = text.replace(old_bio_func, new_bio_func)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

