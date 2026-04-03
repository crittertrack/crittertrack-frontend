import React, { useState, useEffect } from 'react';
import { Download, Share, X } from 'lucide-react';

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isSafari = () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

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

  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={!installPrompt && !isIOSSafari}
        className={`w-full font-semibold py-3 px-4 rounded-lg transition duration-150 flex items-center justify-center gap-2 border-2 ${
          installPrompt || isIOSSafari
            ? 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300 cursor-pointer'
            : 'bg-gray-100 text-gray-500 border-gray-200 cursor-default'
        }`}
      >
        <Download size={20} />
        Install Desktop/Mobile App
      </button>

      {showIOSGuide && (
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
      )}
    </>
  );
};

export default InstallPWA;
