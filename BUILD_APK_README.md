# AJ MoneyPro – Complete Source Code & Real APK Build Guide

This archive contains **100% of the working AJ MoneyPro source code** (`src/`, `public/`, `index.html`, `package.json`, `vite.config.ts`), plus everything required to compile a **genuine, installable Android `.apk` file** (`com.aj.moneypro`).

---

## Option 1: Build a Real APK Automatically in the Cloud (No Android Studio Required)
1. Create a new repository on **GitHub** and upload the unzipped contents of this folder.
2. Open the **Actions** tab in your GitHub repository.
3. Run the **"Build AJ MoneyPro Android APK"** workflow (configured in `.github/workflows/build-apk.yml`).
4. Once finished (~2–3 minutes), download the **`AJMoneyPro-Android-APK`** artifact containing the real installable `.apk` file and install it on your Android phone!

---

## Option 2: Build Locally with Capacitor & Android Studio
Requires **Node.js 18+**, **Java JDK 17**, and **Android Studio** installed on your computer:

```bash
# 1. Install dependencies & build the production web bundle
npm install
npm run build

# 2. Add Capacitor Android wrapper & sync assets
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap sync android

# 3. Compile the installable APK directly via Gradle
cd android
./gradlew assembleDebug
```

Your compiled APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

Or open `android/` in **Android Studio** and select **Build -> Generate Signed Bundle / APK** for a Play Store / signed release APK.

---

## Option 3: Native Kotlin + Jetpack Compose Reference Starter
See the `android-native-kotlin/` folder in this archive for the standalone Kotlin + Room + Material 3 starter project (`com.aj.moneypro`).
