import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';
import { initPWACapture } from './hooks/usePWAInstall';

// Capture beforeinstallprompt before React mounts so navigating to Settings never misses it
initPWACapture();

// Register the PWA Service Worker immediately so browsers recognize the app as installable
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
