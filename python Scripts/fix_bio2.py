# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/pages/Login.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r"onClick=\{\(\) => \{\s*if \(\!window\.PublicKeyCredential\).*?setError\('No saved biometric key found.*?\s*\}\s*\}\}"
new_bio_func = """onClick={async () => {
                        if (!window.PublicKeyCredential) {
                          setError('Biometric Face ID / Fingerprint login is not supported on this browser or device.');
                          return;
                        }
                        try {
                          const challenge = new Uint8Array(32);
                          window.crypto.getRandomValues(challenge);
                          await navigator.credentials.get({
                            publicKey: {
                              challenge: challenge,
                              timeout: 60000,
                              userVerification: "required"
                            }
                          });
                          window.location.href = '/dashboard';
                        } catch (err) {
                          console.error(err);
                          setError('Biometric authentication failed or was cancelled.');
                        }
                      }}"""

text = re.sub(pattern, new_bio_func, text, flags=re.DOTALL)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

