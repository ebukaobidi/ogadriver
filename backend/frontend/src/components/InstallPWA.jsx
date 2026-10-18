import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const dismissals = parseInt(localStorage.getItem('pwa_dismissals') || '0', 10);
    if (dismissals >= 1) {
      return; // Already dismissed once — never show again
    }

    // Delay slightly so it doesn't jarringly block immediately on paint
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIosDevice);

    const handler = e => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleDismiss = () => {
    const current = parseInt(localStorage.getItem('pwa_dismissals') || '0', 10);
    localStorage.setItem('pwa_dismissals', (current + 1).toString());
    setIsVisible(false);
  };

  const onClickInstall = evt => {
    evt.preventDefault();
    // Mark as dismissed permanently — whether they install or not, never ask again
    localStorage.setItem('pwa_dismissals', '1');
    if (!promptInstall) {
      // Firefox / other browsers — show manual instructions once
      alert("To install on this browser, tap the menu (three dots) and select 'Add to Home screen' or 'Install app'.");
      setIsVisible(false);
      return;
    }
    promptInstall.prompt();
    promptInstall.userChoice.then(() => {
      setIsVisible(false);
    });
  };

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col items-center p-6 text-center">
        
        <div className="w-20 h-20 bg-brandMint rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(28,209,136,0.3)]">
          <Download className="w-10 h-10 text-corporateNavy" />
        </div>

        <h2 className="text-2xl font-black text-white mb-2">Install OgaDriver</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Install our app on your device for a faster, full-screen experience and instant access.
        </p>

        {isIOS ? (
          <div className="bg-slate-800/50 p-4 rounded-2xl text-sm font-medium text-slate-300 w-full mb-6 border border-slate-700/50 text-left space-y-3">
            <p className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">1</span>
              Tap the <Share className="w-4 h-4 mx-1" /> Share button
            </p>
            <p className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">2</span>
              Select <PlusSquare className="w-4 h-4 mx-1" /> Add to Home Screen
            </p>
          </div>
        ) : (
          <button 
            onClick={onClickInstall}
            className="w-full bg-brandMint hover:bg-emerald-400 text-corporateNavy font-black uppercase tracking-wider py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(28,209,136,0.4)] mb-4"
          >
            Install App Now
          </button>
        )}

        <button 
          onClick={handleDismiss}
          className="w-full py-3 text-sm font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-wider"
        >
          Not Now, Continue to Site
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;
