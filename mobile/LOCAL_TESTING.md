# Build and install a standalone Android APK

This creates an APK on this computer for direct installation on an Android
phone. Expo Go is not used. The app continues to use the online API at
`https://ogadriver.ng/api`; a local XAMPP API or database is not involved.

## Requirements

- Node.js and the dependencies installed in `mobile` (`npm install`)
- Android Studio with its Android SDK installed
- A physical Android phone with USB debugging enabled, or a way to transfer the
  APK to the phone

On the first Android Studio launch, finish the setup wizard and install the
Android SDK and build tools it offers. Ensure `ANDROID_HOME` or
`ANDROID_SDK_ROOT` points to that SDK and Java is available through Android
Studio's bundled JDK or `JAVA_HOME`.

## Build

From the `mobile` directory, run:

```powershell
npm run build:apk:android:local
```

The script generates the native Android project locally and builds the release
APK. The output is:

```text
mobile\android\app\build\outputs\apk\release\app-release.apk
```

Install it over USB with Android platform tools:

```powershell
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

Alternatively, copy the APK to the phone and open it there, allowing installs
from that source if Android requests it. The phone needs internet access to
reach the online API.
