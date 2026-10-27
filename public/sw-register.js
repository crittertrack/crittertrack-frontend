
 // Register service worker with update checking
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('[App] SW registered:', registration);

        const checkForUpdate = () => registration.update().catch(err => {
          console.warn('[App] SW update check failed:', err);
        });

        // Check periodically and whenever a backgrounded phone browser is reopened.
        setInterval(checkForUpdate, 60000);
        window.addEventListener('focus', checkForUpdate);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') checkForUpdate();
        });
        checkForUpdate();

        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[App] New service worker found, installing...');

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[App] New service worker version is ready.');
                window.SW_UPDATE_AVAILABLE = true;
                window.dispatchEvent(new Event('sw-update-available'));
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[App] SW registration failed:', error);
      });
  });
}
