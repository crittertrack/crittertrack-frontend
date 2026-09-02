// Tracks whether the app currently has a working connection to the API.
// Combines the browser's `online`/`offline` events (fast, but only knows about the local
// network interface — a phone can show "online" while connected to Wi-Fi with no real
// internet) with live signal from actual API calls via apiClient's response interceptor,
// which is a much more reliable indicator of "can we actually reach the backend".
import { useEffect, useState } from 'react';

export default function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);
        const onApiNetworkStatus = (e) => setIsOnline(e.detail.online);

        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        window.addEventListener('api-network-status', onApiNetworkStatus);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
            window.removeEventListener('api-network-status', onApiNetworkStatus);
        };
    }, []);

    return isOnline;
}
