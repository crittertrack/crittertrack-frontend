import React, { useState } from 'react';
import { Feather } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import apiClient from '../../utils/apiClient';
import { setCachedUiMode } from '../../utils/uiModeCache';

// Compact header toggle for switching the account's uiMode between 'full' and 'lite'.
// Mirrors PushToggleButton's layout/style so it slots in alongside the other header icons.
// NOTE: this only persists the preference for now — the actual Lite-mode simplified nav/UI
// (bottom bar, logo swap, tab consolidation) is not wired up to this flag yet.
// Desktop/PWA web only — the native Android app is the separate crittertrack-lite app already,
// so this toggle (and lite mode itself) must never appear/apply there.
const LiteModeToggle = ({ userProfile, setUserProfile, showModalMessage }) => {
    const [busy, setBusy] = useState(false);
    const isLite = userProfile?.uiMode === 'lite';

    if (Capacitor.isNativePlatform()) return null;

    const handleToggle = async () => {
        const next = isLite ? 'full' : 'lite';
        const confirmMsg = isLite
            ? 'Switch back to Full mode? This restores the complete feature set and navigation.'
            : 'Switch to Lite mode? This simplifies the app to a smaller, more focused feature set — you can switch back anytime.';
        if (!window.confirm(confirmMsg)) return;

        setBusy(true);
        try {
            const res = await apiClient.put('/users/profile', { uiMode: next });
            const updatedUser = res?.data?.user || res?.data || null;
            setUserProfile(prev => (updatedUser ? { ...prev, ...updatedUser } : { ...prev, uiMode: next }));
            setCachedUiMode(next);
        } catch (error) {
            showModalMessage && showModalMessage('Lite Mode', error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={busy}
            className={`flex items-center justify-center rounded-lg transition duration-150 shadow-sm p-2 disabled:opacity-60 ${
                isLite
                    ? 'bg-primary/20 hover:bg-primary/30 text-primary-dark dark:bg-dark-primary/20 dark:hover:bg-dark-primary/30 dark:text-dark-primary'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-dark-card-bg dark:hover:bg-dark-surface-hover dark:text-dark-text-secondary'
            }`}
            title={isLite ? 'Lite mode is on (click to switch back to Full mode)' : 'Switch to Lite mode'}
        >
            <Feather size={18} />
        </button>
    );
};

export default LiteModeToggle;
