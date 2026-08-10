import React, { useState, useEffect, useCallback } from 'react';
import { Radio, RadioTower, Loader2 } from 'lucide-react';
import { isPushSupported, isSubscribedOnThisDevice, subscribeToPush, unsubscribeFromPush } from '../../utils/pushNotifications';

// Compact quick-access toggle for enabling/disabling push notifications on this device,
// mirrored alongside the theme/notifications/messages buttons in the main header.
const PushToggleButton = ({ authToken, API_BASE_URL, showModalMessage }) => {
    const [supported, setSupported] = useState(true);
    const [subscribed, setSubscribed] = useState(false);
    const [busy, setBusy] = useState(false);

    const refresh = useCallback(async () => {
        if (!isPushSupported()) {
            setSupported(false);
            return;
        }
        setSubscribed(await isSubscribedOnThisDevice());
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    if (!supported) return null;

    const handleToggle = async () => {
        setBusy(true);
        try {
            if (subscribed) {
                await unsubscribeFromPush(authToken, API_BASE_URL);
                setSubscribed(false);
            } else {
                await subscribeToPush(authToken, API_BASE_URL);
                setSubscribed(true);
            }
        } catch (error) {
            showModalMessage && showModalMessage('Push Notifications', error.message || 'Something went wrong. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const Icon = busy ? Loader2 : subscribed ? RadioTower : Radio;

    return (
        <button
            onClick={handleToggle}
            disabled={busy}
            className={`flex items-center justify-center rounded-lg transition duration-150 shadow-sm p-2 disabled:opacity-60 ${
                subscribed
                    ? 'bg-primary/20 hover:bg-primary/30 text-primary-dark dark:bg-dark-primary/20 dark:hover:bg-dark-primary/30 dark:text-dark-primary'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-dark-card-bg dark:hover:bg-dark-surface-hover dark:text-dark-text-secondary'
            }`}
            title={subscribed ? 'Push notifications enabled on this device (click to disable)' : 'Enable push notifications on this device'}
        >
            <Icon size={18} className={busy ? 'animate-spin' : ''} />
        </button>
    );
};

export default PushToggleButton;
