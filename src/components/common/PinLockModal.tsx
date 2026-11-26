import React, { useState, useEffect, useCallback } from 'react';
import {
  Fingerprint,
  Delete,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ScanFace,
  LockKeyhole,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

type UnlockMethod = 'pin' | 'biometric';

export const PinLockModal: React.FC = () => {
  const {
    unlockApp,
    unlockAppWithBiometric,
    biometricAvailability,
    isBiometricAuthenticating,
    biometricError,
    clearBiometricError,
    settings,
  } = useFinance();

  const canUseBiometrics = Boolean(
    settings.isBiometricEnabled || biometricAvailability?.isSupported
  );

  // Allow users to choose between PIN-based or biometric authentication
  const [authMethod, setAuthMethod] = useState<UnlockMethod>(() =>
    settings.isBiometricEnabled ? 'biometric' : 'pin'
  );
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  const handleSelectMethod = (method: UnlockMethod) => {
    setAuthMethod(method);
    setPinError(false);
    clearBiometricError();
  };

  const handleBiometricTrigger = useCallback(async () => {
    if (isBiometricAuthenticating || biometricSuccess) return;
    setPinError(false);
    const result = await unlockAppWithBiometric();
    if (result.success) {
      setBiometricSuccess(true);
    }
  }, [isBiometricAuthenticating, biometricSuccess, unlockAppWithBiometric]);

  // If biometric-only mode is active (no PIN set & biometrics enabled), auto-prompt once cleanly if allowed
  useEffect(() => {
    if (settings.isBiometricEnabled && !settings.isPinEnabled && authMethod === 'biometric') {
      const timer = setTimeout(() => {
        handleBiometricTrigger();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [settings.isBiometricEnabled, settings.isPinEnabled, authMethod, handleBiometricTrigger]);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setPinError(false);

      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = unlockApp(nextPin);
          if (!success) {
            setPinError(true);
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const isFaceId =
    biometricAvailability?.biometricType === 'face' ||
    biometricAvailability?.deviceLabel.toLowerCase().includes('face');

  const BiometricIcon = isFaceId ? ScanFace : Fingerprint;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-between p-6 select-none animate-in fade-in duration-200">
      {/* Top Header & Method Selector */}
      <div className="w-full max-w-xs flex flex-col items-center pt-6 sm:pt-10">
        <div className="w-15 h-15 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-xl shadow-blue-500/25 mb-4 ring-1 ring-white/20">
          <Shield className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
          AJ MoneyPro
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium text-center">
          Choose how you want to unlock your vault
        </p>

        {/* Auth Method Chooser: PIN vs Biometric (WebAuthn) */}
        {canUseBiometrics && (
          <div className="w-full grid grid-cols-2 p-1 mt-5 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => handleSelectMethod('pin')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'pin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <LockKeyhole className="w-3.5 h-3.5" />
              <span>Security PIN</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMethod('biometric')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMethod === 'biometric'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <BiometricIcon className="w-3.5 h-3.5" />
              <span>Biometric</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Authentication Body */}
      {authMethod === 'biometric' && canUseBiometrics ? (
        <div className="w-full max-w-xs flex flex-col items-center justify-center flex-1 py-6 space-y-5 animate-in fade-in duration-150">
          {/* Interactive Biometric Scanner Orb */}
          <button
            type="button"
            onClick={handleBiometricTrigger}
            disabled={isBiometricAuthenticating || biometricSuccess}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 disabled:cursor-default ${
              biometricSuccess
                ? 'bg-emerald-500/20 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/30'
                : isBiometricAuthenticating
                ? 'bg-blue-500/20 border-2 border-blue-400 shadow-2xl shadow-blue-500/30 scale-105'
                : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 shadow-xl'
            }`}
            aria-label="Authenticate with Biometric WebAuthn"
          >
            {isBiometricAuthenticating && (
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-35" />
            )}
            {biometricSuccess ? (
              <CheckCircle2 className="w-14 h-14 text-emerald-500" />
            ) : (
              <BiometricIcon
                className={`w-14 h-14 transition-colors ${
                  isBiometricAuthenticating
                    ? 'text-blue-500 dark:text-blue-400 animate-pulse'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              />
            )}
          </button>

          <div className="text-center space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {biometricSuccess
                ? 'Identity Verified!'
                : isBiometricAuthenticating
                ? 'Waiting for Biometric Scan...'
                : biometricAvailability?.deviceLabel || 'Fingerprint / Face ID'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[260px]">
              {biometricSuccess
                ? 'Unlocking your AJ MoneyPro ledger...'
                : biometricAvailability?.hasPlatformAuthenticator
                ? 'Tap the sensor icon or button below to verify with WebAuthn FIDO2.'
                : 'Uses your browser WebAuthn platform authenticator when supported.'}
            </p>
          </div>

          {/* Biometric Error / Feedback Banner */}
          {biometricError && (
            <div className="w-full p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/50 text-rose-700 dark:text-rose-200 text-xs font-medium flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{biometricError}</span>
            </div>
          )}

          {/* Primary Biometric CTA */}
          <div className="w-full space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handleBiometricTrigger}
              disabled={isBiometricAuthenticating || biometricSuccess}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <BiometricIcon className="w-4 h-4" />
              <span>
                {isBiometricAuthenticating
                  ? 'Scanning...'
                  : `Unlock with ${biometricAvailability?.deviceLabel || 'Biometrics'}`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMethod('pin')}
              className="w-full py-2.5 rounded-xl bg-slate-200/70 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Use 4-Digit Security PIN Instead
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-xs flex flex-col items-center justify-between flex-1 py-4 animate-in fade-in duration-150">
          {/* PIN Dots Display */}
          <div className="flex flex-col items-center mt-2">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Enter 4-Digit Security PIN
            </p>
            <div className={`flex items-center gap-4 mt-4 ${pinError ? 'animate-shake' : ''}`}>
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      isFilled
                        ? 'bg-blue-600 dark:bg-blue-500 scale-110 shadow-md shadow-blue-500/50'
                        : 'bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700'
                    } ${pinError ? 'border-red-500 bg-red-500/40' : ''}`}
                  />
                );
              })}
            </div>

            {pinError && (
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-3 animate-in fade-in">
                {settings.pinHash
                  ? 'Incorrect PIN. Please try again.'
                  : 'Incorrect PIN. Default PIN is 1234.'}
              </p>
            )}

            {biometricError && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-2 text-center">
                {biometricError}
              </p>
            )}
          </div>

          {/* Numeric Keypad with Integrated WebAuthn Button */}
          <div className="w-full grid grid-cols-3 gap-3 pb-2 mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit.toString())}
                className="h-14 rounded-2xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-blue-600/20 text-slate-900 dark:text-white text-2xl font-bold border border-slate-200 dark:border-slate-800/80 transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
              >
                {digit}
              </button>
            ))}

            {/* Quick Biometric Key on Keypad */}
            <button
              type="button"
              onClick={() => {
                handleSelectMethod('biometric');
                handleBiometricTrigger();
              }}
              disabled={!canUseBiometrics || isBiometricAuthenticating}
              className="h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 active:bg-blue-600/30 text-blue-600 dark:text-blue-400 transition-all flex flex-col items-center justify-center border border-blue-200 dark:border-blue-900/50 cursor-pointer active:scale-95 disabled:opacity-40"
              title="Unlock with WebAuthn Biometrics"
            >
              <BiometricIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] mt-0.5 font-bold tracking-tight text-slate-700 dark:text-slate-300">
                Biometrics
              </span>
            </button>

            {/* 0 */}
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-14 rounded-2xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-blue-600/20 text-slate-900 dark:text-white text-2xl font-bold border border-slate-200 dark:border-slate-800/80 transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
            >
              0
            </button>

            {/* Backspace / Delete */}
            <button
              type="button"
              onClick={handleDelete}
              className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-900/40 hover:bg-slate-200 dark:hover:bg-slate-800 active:bg-blue-600/20 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center border border-slate-200 dark:border-slate-800/80 cursor-pointer active:scale-95"
              title="Delete digit"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Security Footer Badge */}
      <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 pb-1 flex items-center justify-center gap-1.5">
        <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>WebAuthn FIDO2 Biometric Security &amp; Local PIN Vault</span>
      </div>
    </div>
  );
};
