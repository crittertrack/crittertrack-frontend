import React, { useState, useEffect } from 'react';
import { Download, Info, Share, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isSafari = () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// compact=true renders just a small text link (e.g. for use inline in banners like
// AndroidBetaBanner) instead of the full button+info-toggle UI shown on the login screen —
// both share the exact same install/guide logic below, just different trigger markup.
const InstallPWA = ({ compact = false, compactLabel = 'Install CritterTrack (Web)', compactClassName = '' }) => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Already running as the installed native app — no "Install App" prompt to show.
  if (Capacitor.isNativePlatform()) return null;

  const handleInstallClick = async () => {
    if (isIOS() || isSafari()) {
      setShowIOSGuide(true);
      return;
    }
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setInstallPrompt(null);
  };

  if (isInstalled) return null;

  const isIOSSafari = isIOS() || (isSafari() && !installPrompt);

  const iosGuideModal = showIOSGuide && (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4" onClick={() => setShowIOSGuide(false)}>
      <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm mb-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">Add to Home Screen</h3>
          <button onClick={() => setShowIOSGuide(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="bg-purple-100 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
            <span>Tap the <Share size={14} className="inline-block align-middle mx-0.5 text-blue-500" /> <strong>Share</strong> button at the bottom of your browser</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-purple-100 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
            <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-purple-100 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
            <span>Tap <strong>"Add"</strong> in the top right corner</span>
          </li>
        </ol>
        <p className="text-xs text-gray-400 mt-3">CritterTrack will appear on your home screen and open fullscreen like a native app.</p>
      </div>
    </div>
  );

  if (compact) {
    // No disabled/greyed-out state here (unlike the full button below) — on unsupported
    // browsers this just silently no-ops on click, which is fine for a low-emphasis link.
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={compactClassName || 'text-xs font-medium text-white/90 hover:text-white underline underline-offset-2 transition'}
        >
          {compactLabel}
        </button>
        {iosGuideModal}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          disabled={!installPrompt && !isIOSSafari}
          className={`flex-1 font-semibold py-3 px-4 rounded-lg transition duration-150 flex items-center justify-center gap-2 border-2 ${
            installPrompt || isIOSSafari
              ? 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300 cursor-pointer'
              : 'bg-gray-100 text-gray-500 border-gray-200 cursor-default'
          }`}
        >
          <Download size={20} />
          Install CritterTrack (Web)
        </button>
        <button
          type="button"
          onClick={() => setShowInfo(prev => !prev)}
          className="flex-shrink-0 p-2 rounded-lg border-2 border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition"
          title="What does this do?"
        >
          <Info size={18} />
        </button>
      </div>
      {showInfo && (
        <p className="text-xs text-gray-400 text-center mt-1.5">
          Adds CritterTrack to your home screen or desktop so it opens like a regular app instead of a browser tab. Once you're using it, your data stays available offline and any changes you make will sync automatically when you're back online.
        </p>
      )}

      {iosGuideModal}
    </>
  );
};

export default InstallPWA;
