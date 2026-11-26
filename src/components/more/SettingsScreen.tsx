import React, { useState, useRef } from 'react';
import {
  Download,
  FolderArchive,
  Smartphone,
  ShieldCheck,
  Moon,
  Sun,
  Palette,
  DollarSign,
  Lock,
  Fingerprint,
  Bell,
  HardDriveDownload,
  HardDriveUpload,
  RotateCcw,
  Check,
  ChevronRight,
  Copy,
  Wallet,
  Target,
  HandCoins,
  Repeat,
  Calendar,
  KeyRound,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SUPPORTED_CURRENCIES } from '../../constants/defaultData';
import { StorageService } from '../../services/storage';
import { AndroidProjectGenerator } from '../../services/androidProjectGenerator';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { InstallPhoneModal } from '../common/InstallPhoneModal';

const COLOR_PALETTES = [
  {
    id: 'royal_emerald',
    name: 'Fintech Signature',
    primary: '#2563EB',
    secondary: '#10B981',
    description: 'Deep Navy base with Royal Blue & Emerald Green',
  },
  {
    id: 'emerald_cyan',
    name: 'Islamic Wealth',
    primary: '#10B981',
    secondary: '#06B6D4',
    description: 'Emerald Green with Cyan accents',
  },
  {
    id: 'indigo_violet',
    name: 'High-Tech Pro',
    primary: '#6366F1',
    secondary: '#8B5CF6',
    description: 'Modern Indigo with Royal Violet accents',
  },
  {
    id: 'amber_gold',
    name: 'Gold Reserve',
    primary: '#F59E0B',
    secondary: '#EAB308',
    description: 'Luxury Amber and Golden highlights',
  },
  {
    id: 'crimson_rose',
    name: 'Velocity Crimson',
    primary: '#EF4444',
    secondary: '#F43F5E',
    description: 'Energetic Crimson and Rose accents',
  },
];

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    accounts,
    setSubScreen,
    setActiveTab,
    resetAllAppData,
    lockApp,
    togglePrivacyHideBalance,
    biometricAvailability,
    isBiometricAuthenticating,
    enrollBiometric,
    disableBiometric,
    authenticateWithBiometric,
  } = useFinance();

  const { isInstallable, isInstalled, isInIframe, install } = usePWAInstall();

  // State
  const [successToast, setSuccessToast] = useState('');
  const [isGeneratingSource, setIsGeneratingSource] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [showPinChangeModal, setShowPinChangeModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  const importFileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleInstallToPhone = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        showToast('AJ MoneyPro installed to your device!');
        return;
      }
      if (outcome === 'dismissed') {
        showToast('Install prompt dismissed — tap anytime to install');
        return;
      }
    }
    setShowInstallModal(true);
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    if (!enabled) {
      disableBiometric();
      showToast('Biometric unlock disabled');
      return;
    }

    showToast('Touch sensor for WebAuthn biometric prompt...');
    const res = await enrollBiometric();
    if (res.success) {
      showToast('Biometric unlock enrolled & active!');
    } else if (res.cancelled) {
      showToast('Biometric prompt cancelled');
    } else {
      updateSettings({ isBiometricEnabled: true });
      showToast(res.error || 'Biometric enabled (PIN fallback active)');
    }
  };

  const handleTestBiometric = async () => {
    const res = await authenticateWithBiometric(false);
    if (res.success) {
      showToast('Biometric scan passed! Scanner is fully functional.');
    } else if (res.cancelled) {
      showToast('Biometric test cancelled');
    } else {
      showToast(res.error || 'Biometric check failed');
    }
  };

  const handleDownloadFullSource = async () => {
    setIsGeneratingSource(true);
    try {
      await AndroidProjectGenerator.downloadCompleteSourceZip();
      showToast('AJMoneyPro-Full-Source-Code.zip downloaded!');
    } catch (err) {
      console.error('Failed to package full source code:', err);
      showToast('Error packaging source code ZIP.');
    } finally {
      setIsGeneratingSource(false);
    }
  };

  const handleDownloadZip = async () => {
    setIsGeneratingZip(true);
    try {
      await AndroidProjectGenerator.downloadAndroidStudioProject();
      showToast('Android Studio Kotlin Project (.ZIP) downloaded!');
    } catch (err) {
      console.error('Failed to generate Studio ZIP:', err);
      showToast('Error packaging Android Studio project.');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const copyGradleCommand = () => {
    navigator.clipboard.writeText('npm install && npm run build && npx cap add android && cd android && ./gradlew assembleDebug');
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleExportJSON = () => {
    const jsonString = StorageService.exportFullBackup();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AJMoneyPro_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('All financial data exported successfully!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const ok = StorageService.importFullBackup(content);
        if (ok) {
          showToast('Data restored successfully!');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          alert('Invalid backup file. Please provide a valid AJ MoneyPro JSON export.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (
      confirm(
        'Are you sure you want to reset all data? This will restore the default clean seed data for AJ MoneyPro.'
      )
    ) {
      resetAllAppData();
      showToast('AJ MoneyPro reset to default state.');
    }
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('PIN must be exactly 4 numeric digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match.');
      return;
    }

    updateSettings({
      isPinEnabled: true,
      pinHash: newPin,
    });
    setShowPinChangeModal(false);
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    showToast('Security PIN set successfully!');
  };

  const currentPalette = settings.accentColor || 'royal_emerald';

  return (
    <div className="space-y-5 pb-28 animate-in fade-in duration-200">
      {/* Toast */}
      {successToast && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-800 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in shadow-lg">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. Brand Hero Profile Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-900/60 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-2 ring-white/10 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight text-white truncate">AJ Money</h1>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/60 px-1.5 py-0.2 rounded shadow-xs">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              com.aj.moneypro • v1.0.0 (Release)
            </p>
            <p className="text-[11px] text-blue-300 font-medium mt-0.5">
              Offline-First Fintech • 100% Private Ledger
            </p>
          </div>
        </div>
      </div>

      {/* 2. SOURCE CODE EXPORT & ANDROID APK BUILD HUB */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Source Code & Android APK Hub
            </h2>
          </div>
          <button
            onClick={() => setSubScreen('apk-hub')}
            className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full hover:bg-emerald-900/60 transition cursor-pointer"
          >
            APK Build Guide
          </button>
        </div>

        {/* Primary Complete Source Code + APK CI Builder Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-950 border border-blue-900/50 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold text-white block">
                AJ MoneyPro – Full Source Code + APK Builder
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                AJMoneyPro-Full-Source-Code.zip • React + Capacitor + CI
              </span>
            </div>
            <span className="text-[9px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-mono shrink-0">
              COMPLETE SRC
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Includes 100% of the app source code, <code className="text-blue-300">capacitor.config.ts</code>, and a GitHub Actions workflow (<code className="text-emerald-300">.github/workflows/build-apk.yml</code>) to compile a real installable <code className="text-emerald-300">.apk</code> in the cloud or Android Studio.
          </p>

          <button
            onClick={handleDownloadFullSource}
            disabled={isGeneratingSource}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition transform active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isGeneratingSource ? 'Packaging Complete Source ZIP...' : 'Download Full Source Code (.ZIP)'}
            </span>
          </button>
        </div>

        {/* Native Kotlin Studio ZIP & PWA Install Row */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleDownloadZip}
            disabled={isGeneratingZip}
            className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-800 text-left transition flex flex-col justify-between group disabled:opacity-50 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Kotlin Studio ZIP</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Native Compose Starter</span>
            </div>
          </button>

          <button
            onClick={handleInstallToPhone}
            className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-800 text-left transition flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Install to Phone</span>
              <span className="text-[10px] text-emerald-400/90 mt-0.5 block">
                {isInstalled
                  ? 'Installed on Device'
                  : isInstallable
                    ? 'Tap to Install App'
                    : isInIframe
                      ? 'Open Tab / Guide'
                      : 'Install Guide'}
              </span>
            </div>
          </button>
        </div>

        {/* Capacitor + Gradle Command snippet */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
          <span className="text-emerald-400 truncate">npx cap add android && ./gradlew assembleDebug</span>
          <button
            onClick={copyGradleCommand}
            className="text-slate-400 hover:text-white flex items-center gap-1 font-sans text-xs ml-2 shrink-0 cursor-pointer"
          >
            <Copy className="w-3 h-3" />
            <span>{copiedCommand ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* 3. THEME SELECTION (LIGHT / DARK / SYSTEM) */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-400 flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Theme Appearance
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold capitalize">
            {settings.theme} Mode
          </span>
        </div>

        <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 gap-1">
          <button
            onClick={() => {
              updateSettings({ theme: 'dark' });
              showToast('Dark Mode enabled (Deep Navy)');
            }}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              settings.theme === 'dark'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>

          <button
            onClick={() => {
              updateSettings({ theme: 'light' });
              showToast('Light Mode enabled (Fintech White)');
            }}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              settings.theme === 'light'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>

          <button
            onClick={() => {
              updateSettings({ theme: 'system' });
              showToast('System Auto Theme enabled');
            }}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              settings.theme === 'system'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* 4. COLOR CHANGE (ACCENT COLOR CUSTOMIZATION) */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-emerald-400" />
            Fintech Accent Color
          </h2>
          <span className="text-[11px] text-slate-400">Personalize styling</span>
        </div>

        <div className="space-y-2">
          {COLOR_PALETTES.map((palette) => {
            const isSelected = currentPalette === palette.id;
            return (
              <button
                key={palette.id}
                onClick={() => {
                  updateSettings({ accentColor: palette.id });
                  showToast(`Accent updated: ${palette.name}`);
                }}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/50'
                    : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    <span
                      className="w-6 h-6 rounded-full border-2 border-slate-900 shadow-sm"
                      style={{ backgroundColor: palette.primary }}
                    />
                    <span
                      className="w-6 h-6 rounded-full border-2 border-slate-900 shadow-sm"
                      style={{ backgroundColor: palette.secondary }}
                    />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block">{palette.name}</span>
                    <span className="text-[10px] text-slate-400 block">{palette.description}</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. CURRENCY SELECTION (DEFAULT PKR) */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Primary Currency
          </h2>
          <span className="text-[11px] font-bold text-emerald-400">
            Selected: {settings.currency} ({settings.currencySymbol})
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {SUPPORTED_CURRENCIES.map((curr) => {
            const isSelected = settings.currency === curr.code;
            return (
              <button
                key={curr.code}
                onClick={() => {
                  updateSettings({
                    currency: curr.code,
                    currencySymbol: curr.symbol,
                  });
                  showToast(`Default currency set to ${curr.code} (${curr.symbol})`);
                }}
                className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-600/20 text-white ring-1 ring-blue-500/50'
                    : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{curr.code}</span>
                  <span className="text-xs font-mono font-bold text-slate-400">{curr.symbol}</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5">{curr.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. SECURITY & PIN LOCK */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-blue-400" />
          Security & Privacy Protection
        </h2>

        <div className="space-y-2.5 text-xs">
          {/* PIN Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="font-semibold text-white block">PIN Protection</span>
              <span className="text-[11px] text-slate-400">
                Require 4-digit security PIN on app launch
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.isPinEnabled}
              onChange={(e) => {
                if (e.target.checked && !settings.pinHash) {
                  setShowPinChangeModal(true);
                } else {
                  updateSettings({ isPinEnabled: e.target.checked });
                  showToast(e.target.checked ? 'PIN Lock Enabled' : 'PIN Lock Disabled');
                }
              }}
              className="w-5 h-5 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </div>

          {/* Change PIN button */}
          {settings.isPinEnabled && (
            <button
              onClick={() => {
                setNewPin('');
                setConfirmPin('');
                setPinError('');
                setShowPinChangeModal(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-400" />
                <span>Change 4-Digit Security PIN</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          )}

          {/* Biometrics Authentication (WebAuthn / Fingerprint / FaceID) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">
                      {biometricAvailability?.deviceLabel || 'Biometric Security'}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                      WebAuthn FIDO2
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Fast unlock using hardware fingerprint, Face ID, or Windows Hello
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={settings.isBiometricEnabled}
                disabled={isBiometricAuthenticating}
                onChange={(e) => handleToggleBiometric(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* Hardware availability status & Test Scanner Action */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                {biometricAvailability?.hasPlatformAuthenticator ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Platform biometric sensor detected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>PIN lock active with browser WebAuthn support</span>
                  </>
                )}
              </div>

              <button
                onClick={handleTestBiometric}
                disabled={isBiometricAuthenticating}
                className="px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/50 text-blue-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
              >
                <Fingerprint className="w-3 h-3 text-emerald-400" />
                <span>{isBiometricAuthenticating ? 'Scanning...' : 'Test Sensor'}</span>
              </button>
            </div>
          </div>

          {/* Privacy Hide Balance Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="font-semibold text-white block">Public Privacy Mode</span>
              <span className="text-[11px] text-slate-400">
                Hide numeric balances by default (••••••)
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.privacyHideBalance}
              onChange={() => {
                togglePrivacyHideBalance();
                showToast(settings.privacyHideBalance ? 'Balances visible' : 'Balances hidden');
              }}
              className="w-5 h-5 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </div>

          {/* Instant App Lock (Active if PIN or Biometric is enabled) */}
          {(settings.isPinEnabled || settings.isBiometricEnabled) && (
            <button
              onClick={lockApp}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Lock AJ MoneyPro Now</span>
            </button>
          )}
        </div>
      </div>

      {/* 7. FINANCIAL TOOLS HUB (QUICK DIRECTORY) */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Financial Management Modules
        </h2>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => setSubScreen('accounts')}
            className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="font-bold text-white">Wallets & Accounts</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <span className="font-bold text-white">Budgets & Limits</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
          </button>

          <button
            onClick={() => setSubScreen('debts')}
            className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <HandCoins className="w-4 h-4" />
              </div>
              <span className="font-bold text-white">Loans & Debts</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
          </button>

          <button
            onClick={() => setSubScreen('recurring')}
            className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <Repeat className="w-4 h-4" />
              </div>
              <span className="font-bold text-white">Recurring Schedules</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
          </button>

          <button
            onClick={() => setSubScreen('calendar')}
            className="col-span-2 p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Financial Calendar</span>
                <span className="text-[10px] text-slate-400">Day-by-day cashflow totals</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* 8. NOTIFICATIONS & ALERTS PREFERENCES */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-amber-400" />
          Notifications & Alerts
        </h2>

        <div className="space-y-2.5 text-xs">
          {/* Daily Reminder */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="font-semibold text-white block">Daily Expense Reminder</span>
              <span className="text-[11px] text-slate-400">
                Prompt to record today's spend at {settings.dailyReminderTime || '21:00'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.dailyReminderEnabled}
              onChange={(e) => updateSettings({ dailyReminderEnabled: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </div>

          {/* Budget Warnings */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="font-semibold text-white block">Budget Overrun Alerts</span>
              <span className="text-[11px] text-slate-400">
                Alerts when approaching 75%, 90% or exceeding 100%
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.budgetAlertsEnabled}
              onChange={(e) => updateSettings({ budgetAlertsEnabled: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 9. OFFLINE VAULT & DATA BACKUP */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <HardDriveDownload className="w-4 h-4 text-purple-400" />
          Data Backup & Local Vault
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleExportJSON}
            className="py-3 px-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition border border-slate-800 cursor-pointer"
          >
            <HardDriveDownload className="w-4 h-4 text-purple-400" />
            <span>Export Backup (.JSON)</span>
          </button>

          <input
            type="file"
            ref={importFileRef}
            accept=".json"
            className="hidden"
            onChange={handleImportJSON}
          />

          <button
            onClick={() => importFileRef.current?.click()}
            className="py-3 px-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition border border-slate-800 cursor-pointer"
          >
            <HardDriveUpload className="w-4 h-4 text-blue-400" />
            <span>Restore Backup (.JSON)</span>
          </button>
        </div>

        {/* Reset App */}
        <div className="pt-2">
          <button
            onClick={handleResetData}
            className="w-full py-2.5 px-3 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-red-400 text-xs font-semibold border border-red-900/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset AJ MoneyPro to Default Data</span>
          </button>
        </div>
      </div>

      {/* 10. Change PIN Modal */}
      {showPinChangeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Set 4-Digit Security PIN</h3>
              <button
                onClick={() => setShowPinChangeModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePin} className="p-5 space-y-3.5 text-xs">
              {pinError && (
                <div className="p-2.5 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs">
                  {pinError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Enter 4-Digit PIN *
                </label>
                <input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-center text-lg tracking-widest font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Confirm 4-Digit PIN *
                </label>
                <input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-center text-lg tracking-widest font-mono"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPinChangeModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 11. Install to Phone Modal */}
      <InstallPhoneModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
