import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
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
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setInstallPrompt(null);
  };

  // Don't show if already running as installed PWA
  if (isInstalled) return null;

  return (
    <button
      onClick={handleInstallClick}
      disabled={!installPrompt}
      className={`w-full font-semibold py-3 px-4 rounded-lg transition duration-150 flex items-center justify-center gap-2 border-2 ${
        installPrompt
          ? 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300 cursor-pointer'
          : 'bg-gray-100 text-gray-500 border-gray-200 cursor-default'
      }`}
      title={!installPrompt ? 'Open this page in a browser (not already installed) to install the app' : undefined}
    >
      <Download size={20} />
      Install Desktop/Mobile App
    </button>
  );
};

export default InstallPWA;
