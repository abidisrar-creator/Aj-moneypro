import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  MoreVertical,
  Share,
  PlusSquare,
  Info,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface InstallPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPhoneModal: React.FC<InstallPhoneModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const [platformTab, setPlatformTab] = useState<'android' | 'ios'>(() =>
    isIOS ? 'ios' : 'android'
  );
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [installFeedback, setInstallFeedback] = useState('');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '/';

  const handleNativeInstall = async () => {
    setIsPrompting(true);
    setInstallFeedback('');
    try {
      const outcome = await install();
      if (outcome === 'accepted') {
        setInstallFeedback('AJ MoneyPro has been added to your device!');
      } else if (outcome === 'dismissed') {
        setInstallFeedback('Install prompt was dismissed. You can also install manually below.');
      } else {
        setInstallFeedback('Direct browser prompt unavailable here. Follow the steps below.');
      }
    } finally {
      setIsPrompting(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      setInstallFeedback('Copy the address from your browser bar to open on your phone.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Install AJ MoneyPro to Phone
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Offline Standalone App • Zero Store Fees
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close install guide"
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Already Installed State */}
          {isInstalled && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900 dark:text-emerald-200">
                  AJ MoneyPro is Already Installed
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 mt-0.5">
                  You are currently running AJ MoneyPro in standalone app mode with offline support active.
                </p>
              </div>
            </div>
          )}

          {/* Native One-Tap Install Button (when browser allows beforeinstallprompt) */}
          {isInstallable && !isInstalled && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-950/60 dark:to-emerald-950/40 border border-blue-200 dark:border-blue-800/60 space-y-3">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Your browser is ready to install AJ MoneyPro directly onto your home screen.
              </p>
              <button
                onClick={handleNativeInstall}
                disabled={isPrompting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition cursor-pointer disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                <span>{isPrompting ? 'Opening Install Prompt...' : 'Install AJ MoneyPro Now'}</span>
              </button>
            </div>
          )}

          {/* Preview Iframe Notice & Standalone Browser Tab Launch */}
          {isInIframe && !isInstalled && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-3">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-200">
                    Preview Mode Blocks Direct Install
                  </p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                    Browsers block app installation inside embedded preview frames. Open AJ MoneyPro in a full browser tab first, then tap Install.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in New Tab to Install</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="py-2.5 px-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {installFeedback && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-200 text-[11px] font-semibold">
              {installFeedback}
            </div>
          )}

          {/* Platform Step-by-Step Guide */}
          {!isInstalled && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 gap-1">
                <button
                  type="button"
                  onClick={() => setPlatformTab('android')}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    platformTab === 'android'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Android (Chrome)
                </button>
                <button
                  type="button"
                  onClick={() => setPlatformTab('ios')}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    platformTab === 'ios'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  iPhone / iPad (Safari)
                </button>
              </div>

              {platformTab === 'android' ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      Open AJ MoneyPro in <strong>Google Chrome</strong> (or Edge / Samsung Internet) on your Android phone.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed flex items-center flex-wrap gap-1">
                      Tap the
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold">
                        <MoreVertical className="w-3 h-3" /> Menu
                      </span>
                      icon in the top-right corner of Chrome.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>, then confirm <strong>Install</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      Open AJ MoneyPro in <strong>Safari</strong> on your iPhone or iPad (iOS requires Safari to install web apps).
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed flex items-center flex-wrap gap-1">
                      Tap the
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold">
                        <Share className="w-3 h-3" /> Share
                      </span>
                      button in Safari&apos;s toolbar.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed flex items-center flex-wrap gap-1">
                      Scroll and tap
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold">
                        <PlusSquare className="w-3 h-3" /> Add to Home Screen
                      </span>
                      then tap <strong>Add</strong>.
                    </p>
                  </div>
                </div>
              )}

              {!isInIframe && (
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>App Link Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy App Link for Phone Browser</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
