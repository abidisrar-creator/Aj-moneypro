import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  FolderArchive,
  Terminal,
  Smartphone,
  ShieldCheck,
  Copy,
  Info,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { AndroidProjectGenerator } from '../../services/androidProjectGenerator';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { InstallPhoneModal } from '../common/InstallPhoneModal';

export const ApkDownloadScreen: React.FC = () => {
  const { setSubScreen } = useFinance();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const [isGeneratingSource, setIsGeneratingSource] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleInstallToPhone = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setStatusMessage('AJ MoneyPro installed to your device!');
        setTimeout(() => setStatusMessage(''), 4000);
        return;
      }
      if (outcome === 'dismissed') {
        return;
      }
    }
    setShowInstallModal(true);
  };

  const handleDownloadFullSource = async () => {
    setIsGeneratingSource(true);
    try {
      await AndroidProjectGenerator.downloadCompleteSourceZip();
      setStatusMessage('AJMoneyPro-Full-Source-Code.zip downloaded!');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      console.error('Failed to package full source code:', err);
      setStatusMessage('Error packaging source code archive.');
    } finally {
      setIsGeneratingSource(false);
    }
  };

  const handleDownloadZip = async () => {
    setIsGeneratingZip(true);
    try {
      await AndroidProjectGenerator.downloadAndroidStudioProject();
      setStatusMessage('AJMoneyPro-Android-Studio-Project.zip downloaded!');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      console.error('Failed to generate Studio ZIP:', err);
      setStatusMessage('Error packaging Android Studio starter.');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const copyGradleCommand = () => {
    navigator.clipboard.writeText(
      'npm install && npm run build && npm i @capacitor/core @capacitor/cli @capacitor/android && npx cap add android && npx cap sync android && cd android && ./gradlew assembleDebug'
    );
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSubScreen(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
          com.aj.moneypro • v1.0.0
        </span>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold">
          {statusMessage}
        </div>
      )}

      <div className="px-1">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Source Code & Android APK Builder
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Download 100% of the AJ MoneyPro source code with Capacitor Android & GitHub Actions CI configured to compile a real installable APK, or install directly as an offline PWA.
        </p>
      </div>

      {/* 1. Primary Full Source Code + Cloud APK Builder Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-800/60 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">AJ MoneyPro – Complete Source Bundle</h3>
              <span className="text-[9px] font-bold uppercase bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded">
                Full App
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              com.aj.moneypro • React + TypeScript + Capacitor + CI
            </p>
          </div>
        </div>

        {/* Spec Meta Grid */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-[11px]">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Target OS</span>
            <span className="text-slate-200 font-semibold">Android 8.0–15</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Min SDK</span>
            <span className="text-slate-200 font-semibold">API 26</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Currency</span>
            <span className="text-emerald-400 font-bold">PKR (Rs.)</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">APK CI</span>
            <span className="text-slate-200 font-semibold">Included</span>
          </div>
        </div>

        {/* Download Full Source Code ZIP Button */}
        <div className="mt-4 pt-2">
          <button
            onClick={handleDownloadFullSource}
            disabled={isGeneratingSource}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition transform active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isGeneratingSource ? 'Packaging Source Archive...' : 'Download Full Source Code (.ZIP)'}
            </span>
          </button>
        </div>
      </div>

      {/* Honest Note about APK Binary Compilation */}
      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 flex gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-bold text-white">How to get the installable .apk binary:</p>
          <p>
            Compiling a signed Android <code className="text-emerald-300">.apk</code> binary requires the Android SDK &amp; Gradle (not available inside a web browser sandbox). Push the downloaded ZIP to a GitHub repo and run the included <strong>Build AJ MoneyPro Android APK</strong> GitHub Action, or build locally in Android Studio.
          </p>
        </div>
      </div>

      {/* 2. Direct Android Phone PWA Install */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white">Install Directly on Android Now (PWA)</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Adds AJ MoneyPro to your Android home screen with offline caching immediately.
            </p>
          </div>
        </div>

        <button
          onClick={handleInstallToPhone}
          className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 transition cursor-pointer"
        >
          {isInstalled ? 'Installed' : isInstallable ? 'Install Now' : 'Install Guide'}
        </button>
      </div>

      {/* 3. Native Kotlin Android Studio Starter (.ZIP) */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">
              Native Kotlin Android Studio Starter (.ZIP)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Kotlin • Jetpack Compose • Room Database • Material 3
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Standalone native Kotlin starter containing
          <code className="text-blue-400 bg-slate-950 px-1.5 py-0.5 rounded ml-1">MainActivity.kt</code>,
          <code className="text-blue-400 bg-slate-950 px-1.5 py-0.5 rounded ml-1">AppDatabase.kt</code>,
          <code className="text-blue-400 bg-slate-950 px-1.5 py-0.5 rounded ml-1">TransactionDao.kt</code>,
          and <code className="text-blue-400 bg-slate-950 px-1.5 py-0.5 rounded ml-1">AndroidManifest.xml</code>.
        </p>

        <button
          onClick={handleDownloadZip}
          disabled={isGeneratingZip}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition border border-slate-700 disabled:opacity-50 cursor-pointer"
        >
          <FolderArchive className="w-4 h-4 text-purple-400" />
          <span>
            {isGeneratingZip ? 'Packaging Kotlin ZIP...' : 'Download Kotlin Studio Starter (.ZIP)'}
          </span>
        </button>
      </div>

      {/* 4. Local APK Build Commands */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Build Real APK via Capacitor &amp; Gradle
          </span>
          <button
            onClick={copyGradleCommand}
            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Copy className="w-3 h-3" />
            <span>{copiedCommand ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 overflow-x-auto">
          <div className="text-slate-500"># 1. Build web bundle &amp; add Android wrapper:</div>
          <div className="text-emerald-400">npm install &amp;&amp; npm run build</div>
          <div className="text-emerald-400">npm i @capacitor/core @capacitor/cli @capacitor/android</div>
          <div className="text-emerald-400">npx cap add android &amp;&amp; npx cap sync android</div>
          <div className="text-slate-500 pt-1"># 2. Compile genuine installable APK:</div>
          <div className="text-blue-400">cd android &amp;&amp; ./gradlew assembleDebug</div>
        </div>
      </div>
      <InstallPhoneModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
