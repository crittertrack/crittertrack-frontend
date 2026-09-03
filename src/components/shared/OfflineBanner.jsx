// Global "you're offline" indicator — mounted once at the app root (AppRouter) so it's
// visible across every route regardless of auth state. Also shows a live count of
// offline-queued writes (see offlineQueue.js) still waiting to sync.
import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import useQueuedWriteCount from '../../hooks/useQueuedWriteCount';

const OfflineBanner = () => {
    const isOnline = useOnlineStatus();
    const queuedCount = useQueuedWriteCount();

    if (isOnline && queuedCount === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 dark:bg-amber-600 text-white text-sm font-semibold flex items-center justify-center gap-2 py-2 px-4 shadow-md">
            {isOnline ? (
                <>
                    <RefreshCw size={16} className="animate-spin" />
                    Syncing {queuedCount} pending change{queuedCount === 1 ? '' : 's'}…
                </>
            ) : (
                <>
                    <WifiOff size={16} />
                    You're offline{queuedCount > 0 ? ` — ${queuedCount} change${queuedCount === 1 ? '' : 's'} will sync once you're back online.` : ' — some features may not work until your connection returns.'}
                </>
            )}
        </div>
    );
};

export default OfflineBanner;
