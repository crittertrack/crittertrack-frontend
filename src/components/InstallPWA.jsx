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

  // Don't show if already installed or no install prompt available
  if (isInstalled || !installPrompt) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="w-full bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold py-3 px-4 rounded-lg transition duration-150 flex items-center justify-center gap-2 border border-purple-300"
    >
      <Download size={20} />
      Install Desktop/Mobile App
    </button>
  );
};

export default InstallPWA;
