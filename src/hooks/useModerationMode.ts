import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

/**
 * useModerationMode - Manages moderation/admin panel toggle and auth
 * 
 * Features:
 * - Toggle moderation mode on/off
 * - Admin panel view
 * - Moderation authentication
 * - Context-aware moderation (profiles, animals, messages)
 * 
 * @param authToken - Current auth token for API calls
 * @param API_BASE_URL - API base URL
 * @param userProfile - Current user profile
 * @param showModalMessage - Modal message function for feedback
 * @returns Object with moderation states and handlers
 */
export function useModerationMode(
    authToken: string | null,
    API_BASE_URL: string,
    userProfile: any,
    showModalMessage: (title: string, message: string) => void
) {
    // ========== MODERATION MODE STATES ==========
    const [inModeratorMode, setInModeratorMode] = useState(
        () => localStorage.getItem('inModeratorMode') === 'true'
    );
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showModerationAuthModal, setShowModerationAuthModal] = useState(false);
    const [modCurrentContext, setModCurrentContext] = useState(null);

    // ========== MODERATION AUTH STATE ==========
    const [modAuthCode, setModAuthCode] = useState('');
    const [modAuthError, setModAuthError] = useState('');

    // ========== EFFECTS ==========

    /**
     * Sync moderator mode to localStorage
     */
    useEffect(() => {
        try {
            if (inModeratorMode) {
                localStorage.setItem('inModeratorMode', 'true');
            } else {
                localStorage.removeItem('inModeratorMode');
            }
        } catch (e) {
            console.warn('[MOD] Failed to sync moderator mode to localStorage:', e);
        }
    }, [inModeratorMode]);

    /**
     * Require auth when entering mod mode
     * Admins skip auth; regular mods need code
     */
    useEffect(() => {
        if (inModeratorMode && userProfile?.role === 'moderator' && !localStorage.getItem('moderationAuthenticated')) {
            setShowModerationAuthModal(true);
        }
    }, [inModeratorMode, userProfile]);

    // ========== HANDLER FUNCTIONS ==========

    /**
     * Toggle moderation mode on/off
     */
    const handleToggleModerationMode = useCallback(() => {
        if (userProfile?.role !== 'admin' && userProfile?.role !== 'moderator') {
            showModalMessage('Access Denied', 'Only admins and moderators can access moderation mode.');
            return;
        }

        if (!inModeratorMode && userProfile?.role === 'moderator') {
            // Entering mod mode as regular mod - require auth
            setShowModerationAuthModal(true);
        } else {
            // Toggle directly for admins or exiting
            setInModeratorMode(!inModeratorMode);
        }
    }, [inModeratorMode, userProfile, showModalMessage]);

    /**
     * Authenticate moderator with code
     */
    const handleModerationAuth = useCallback(
        async (code: string) => {
            try {
                const response = await axios.post(
                    `${API_BASE_URL}/admin/mod-auth`,
                    { code },
                    {
                        headers: { Authorization: `Bearer ${authToken}` }
                    }
                );

                if (response.data.success) {
                    localStorage.setItem('moderationAuthenticated', 'true');
                    setInModeratorMode(true);
                    setShowModerationAuthModal(false);
                    setModAuthCode('');
                    setModAuthError('');
                    console.log('[MOD AUTH] Authentication successful');
                } else {
                    setModAuthError('Invalid authentication code');
                }
            } catch (error) {
                console.error('[MOD AUTH] Authentication failed:', error);
                setModAuthError(error.response?.data?.message || 'Authentication failed');
            }
        },
        [authToken, API_BASE_URL]
    );

    // ========== RETURN ALL STATE & HANDLERS ==========
    return {
        // Mode States
        inModeratorMode,
        setInModeratorMode,

        // Panel States
        showAdminPanel,
        setShowAdminPanel,
        showModerationAuthModal,
        setShowModerationAuthModal,

        // Context
        modCurrentContext,
        setModCurrentContext,

        // Auth State
        modAuthCode,
        setModAuthCode,
        modAuthError,
        setModAuthError,

        // Handlers
        handleToggleModerationMode,
        handleModerationAuth,
    };
}
