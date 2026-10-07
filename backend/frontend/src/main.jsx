import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './components/ThemeProvider'

// Initialize Microsoft Clarity User Behavior & Heatmaps (Free)
const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID || 'py5z153p55'; // Default or Env ID
if (clarityId && typeof window !== 'undefined') {
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", clarityId);
}

// Initialize Sentry Error Tracking (Free Developer Plan)
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn && typeof window !== 'undefined') {
  const script = document.createElement('script');
  script.src = "https://browser.sentry-cdn.com/7.100.0/bundle.min.js";
  script.crossOrigin = "anonymous";
  script.onload = () => {
    if (window.Sentry) {
      window.Sentry.init({ dsn: sentryDsn, environment: import.meta.env.MODE });
    }
  };
  document.head.appendChild(script);
}

// Capture the PWA install event early (it can fire before React mounts)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__pwaDeferredPrompt = e;
    window.dispatchEvent(new Event('pwa-install-ready'));
  });
  window.addEventListener('appinstalled', () => {
    window.__pwaDeferredPrompt = null;
  });
}

// Service Worker Registration for Client PWA (Completely bypassed on Admin portal)
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  const isAdminPath = window.location.pathname.startsWith('/admin');

  if (isAdminPath) {
    // Unregister any active service worker when accessing Admin portal
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  } else if (import.meta.env.PROD) {
    // Clean background registration without aggressive auto-reload
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('PWA service worker registration note:', err?.message || err);
      });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
