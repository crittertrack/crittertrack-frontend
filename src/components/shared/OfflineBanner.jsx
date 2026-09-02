// Global "you're offline" indicator — mounted once at the app root (AppRouter) so it's
// visible across every route regardless of auth state.
import React from 'react';
import { WifiOff } from 'lucide-react';
import useOnlineStatus from '../../hooks/useOnlineStatus';

const OfflineBanner = () => {
    const isOnline = useOnlineStatus();

    if (isOnline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 dark:bg-amber-600 text-white text-sm font-semibold flex items-center justify-center gap-2 py-2 px-4 shadow-md">
            <WifiOff size={16} />
            You're offline — some features may not work until your connection returns.
        </div>
    );
};

export default OfflineBanner;
