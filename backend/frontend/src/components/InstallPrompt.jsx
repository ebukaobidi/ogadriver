import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, MoreVertical } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if already installed as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(standalone);
    if (standalone) return; // Already installed, don't show anything

    // Detect iOS (Safari)
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) && !window.MSStream;
    setIsIos(ios);

    // Check if dismissed within the last 24 hours (not permanent)
    const dismissedAt = localStorage.getItem('pwa_prompt_dismissed_at');
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const recentlyDismissed = dismissedAt && (Date.now() - parseInt(dismissedAt)) < twentyFourHours;

    // For Chrome/Android — capture the native install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!recentlyDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Pick up an event that fired before this component mounted
    if (window.__pwaDeferredPrompt) {
      setDeferredPrompt(window.__pwaDeferredPrompt);
      if (!recentlyDismissed) setShowPrompt(true);
    }
    const onReady = () => {
      setDeferredPrompt(window.__pwaDeferredPrompt);
      if (!recentlyDismissed) setShowPrompt(true);
    };
    window.addEventListener('pwa-install-ready', onReady);

    // For iOS and browsers that don't fire beforeinstallprompt —
    // Show our custom prompt after 3 seconds if not recently dismissed
    const fallbackTimer = setTimeout(() => {
      if (!standalone && !recentlyDismissed) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } catch (e) {
        alert("To install OgaDriver on your phone:\n1. Tap your browser menu (the 3 dots ⋮ at the top right)\n2. Select 'Install app' or 'Add to Home screen'\n3. Tap 'Install' — done!");
      }
    } else {
      alert("To install OgaDriver on your phone:\n1. Tap your browser menu (the 3 dots ⋮ at the top right)\n2. Select 'Install app' or 'Add to Home screen'\n3. Tap 'Install' — done!");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Only dismiss for 24 hours, not permanently
    localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-[72px] lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-96 z-50 bg-slate-900 border border-brandMint/30 shadow-[0_0_20px_rgba(28,209,136,0.15)] rounded-2xl p-5 flex flex-col gap-3 animate-slide-up">
      {/* Close Button */}
      <button onClick={handleDismiss} className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brandMint/20 to-brandMint/5 flex items-center justify-center shrink-0 border border-brandMint/20">
          <Download className="w-6 h-6 text-brandMint" />
        </div>
        <div>
          <h4 className="text-white font-bold text-sm">📲 Install OgaDriver App</h4>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Get the full app experience — instant access, push notifications, and offline support.
          </p>
        </div>
      </div>

      {isIos ? (
        // iOS-specific instructions (Safari doesn't support beforeinstallprompt)
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
          <p className="text-brandMint text-xs font-bold mb-2">How to install on iPhone/iPad:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <Share className="w-4 h-4 text-blue-400 shrink-0" />
              <span>1. Tap the <strong>Share</strong> button at the bottom of Safari</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <PlusSquare className="w-4 h-4 text-brandMint shrink-0" />
              <span>2. Scroll down and tap <strong>"Add to Home Screen"</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <Download className="w-4 h-4 text-green-400 shrink-0" />
              <span>3. Tap <strong>"Add"</strong> — Done! Open from your Home Screen</span>
            </div>
          </div>
        </div>
      ) : (
        // Android/Chrome install button
        <div className="flex gap-2">
          <button onClick={handleDismiss} className="flex-1 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700/50">
            Maybe Later
          </button>
          <button onClick={handleInstallClick} className="flex-1 py-2.5 text-xs font-bold bg-brandMint text-corporateNavy rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Install App Now
          </button>
        </div>
      )}

      <p className="text-slate-500 text-[10px] text-center">Free • No App Store needed • Works offline</p>
    </div>
  );
};

export default InstallPrompt;
