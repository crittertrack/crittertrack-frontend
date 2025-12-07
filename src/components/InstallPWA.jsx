import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setInstallPrompt(e);
      // Show our custom install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the saved prompt
    setInstallPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-2xl p-4 z-50 border-2 border-primary">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X size={20} />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 rounded-full p-2">
          <Download size={24} className="text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">Install CritterTrack</h3>
          <p className="text-sm text-gray-600 mb-3">
            Add CritterTrack to your home screen for quick access and offline use!
          </p>
          <button
            onClick={handleInstallClick}
            className="w-full bg-primary hover:bg-primary/80 text-black font-semibold py-2 px-4 rounded-lg transition duration-150"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
