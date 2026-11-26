import { useCallback, useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __ajMoneyProDeferredPrompt?: BeforeInstallPromptEvent | null;
    __ajMoneyProPWACaptureInitialized?: boolean;
  }
}

const PWA_PROMPT_READY_EVENT = 'aj-pwa-prompt-ready';
const PWA_INSTALLED_EVENT = 'aj-pwa-installed';

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.startsWith('android-app://')
  );
}

function checkIsInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function checkIsIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isClassicIOS = /iphone|ipad|ipod/.test(ua);
  const isIPadOS =
    window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
  return isClassicIOS || isIPadOS;
}

function checkIsAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return /android/i.test(window.navigator.userAgent);
}

/**
 * Attaches global listeners at app bootstrap so `beforeinstallprompt`
 * is captured even if the user hasn't navigated to Settings yet.
 */
export function initPWACapture(): void {
  if (typeof window === 'undefined' || window.__ajMoneyProPWACaptureInitialized) {
    return;
  }
  window.__ajMoneyProPWACaptureInitialized = true;

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    window.__ajMoneyProDeferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new Event(PWA_PROMPT_READY_EVENT));
  });

  window.addEventListener('appinstalled', () => {
    window.__ajMoneyProDeferredPrompt = null;
    window.dispatchEvent(new Event(PWA_INSTALLED_EVENT));
  });
}

export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() =>
    typeof window !== 'undefined' ? window.__ajMoneyProDeferredPrompt ?? null : null
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsStandalone());
  const [isIOS] = useState<boolean>(() => checkIsIOS());
  const [isAndroid] = useState<boolean>(() => checkIsAndroid());
  const [isInIframe] = useState<boolean>(() => checkIsInIframe());

  useEffect(() => {
    initPWACapture();

    if (window.__ajMoneyProDeferredPrompt) {
      setDeferredPrompt(window.__ajMoneyProDeferredPrompt);
    }

    const syncPrompt = () => {
      setDeferredPrompt(window.__ajMoneyProDeferredPrompt ?? null);
    };

    const handleInstalled = () => {
      window.__ajMoneyProDeferredPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    const displayModeQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
      }
    };

    window.addEventListener(PWA_PROMPT_READY_EVENT, syncPrompt);
    window.addEventListener(PWA_INSTALLED_EVENT, handleInstalled);
    displayModeQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener(PWA_PROMPT_READY_EVENT, syncPrompt);
      window.removeEventListener(PWA_INSTALLED_EVENT, handleInstalled);
      displayModeQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const install = useCallback(async (): Promise<InstallOutcome> => {
    const promptEvent = deferredPrompt || window.__ajMoneyProDeferredPrompt;
    if (!promptEvent) {
      return 'unavailable';
    }

    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      // A BeforeInstallPromptEvent can only be used once
      window.__ajMoneyProDeferredPrompt = null;
      setDeferredPrompt(null);
      window.dispatchEvent(new Event(PWA_PROMPT_READY_EVENT));

      if (outcome === 'accepted') {
        setIsInstalled(true);
        return 'accepted';
      }
      return 'dismissed';
    } catch {
      window.__ajMoneyProDeferredPrompt = null;
      setDeferredPrompt(null);
      return 'unavailable';
    }
  }, [deferredPrompt]);

  return {
    isInstallable: !!deferredPrompt && !isInstalled,
    isInstalled,
    isIOS,
    isAndroid,
    isInIframe,
    install,
  };
}
