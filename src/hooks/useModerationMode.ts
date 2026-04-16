import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

/**
 * useModerationMode - Manages moderation/admin panel and moderation actions
 * 
 * Features:
 * - Toggle moderation mode on/off
 * - Admin panel and report queue views
 * - Moderation authentication
 * - Quick flag handler for warn/suspend/ban/lift actions
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
    const [showModReportQueue, setShowModReportQueue] = useState(false);
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

    /**
     * MAIN MODERATION HANDLER - Handles all mod actions
     * This is the most complex handler in the app (~200 lines)
     * 
     * Actions: flag, edit, warn, suspend, ban, lift-warning, lift-suspension, lift-ban
     * Contexts: profile, animal, message
     */
    const handleModQuickFlag = useCallback(
        async (flagData: any) => {
            console.log('[MOD ACTION] Handler called with:', flagData);

            try {
                // ========== FLAG ACTION: Create report for flagged content ==========
                if (flagData.action === 'flag') {
                    const reportType =
                        flagData.context?.type === 'profile'
                            ? 'profile'
                            : flagData.context?.type === 'animal'
                              ? 'animal'
                              : 'message';

                    const userId =
                        flagData.context?.type === 'profile'
                            ? flagData.context?.userId
                            : flagData.context?.ownerId;

                    const reportData = {
                        reason: flagData.reason,
                        category: flagData.category,
                        description: `Moderator flag: ${flagData.reason}`,
                        reportedContentId: flagData.context?.id,
                        reportedUser: userId,
                        reportType
                    };

                    console.log('[MOD ACTION] Creating flag report:', reportData);

                    const response = await axios.post(`${API_BASE_URL}/admin/reports`, reportData, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });

                    showModalMessage('Content Flagged', 'Report created and added to the queue.');
                    console.log('[MOD ACTION] Flag report created:', response.data.reportId);
                    return response.data;
                }

                // ========== EDIT ACTION: Edit user profile/content ==========
                if (flagData.action === 'edit') {
                    if (flagData.context?.type === 'profile') {
                        const updateData = {
                            personalName: flagData.personalName,
                            breederName: flagData.breederName,
                            profileImage: flagData.profileImage,
                            bio: flagData.bio
                        };

                        console.log('[MOD ACTION] Editing profile:', flagData.context.userId, updateData);

                        const response = await axios.put(
                            `${API_BASE_URL}/admin/users/${flagData.context.userId}`,
                            updateData,
                            {
                                headers: { Authorization: `Bearer ${authToken}` }
                            }
                        );

                        showModalMessage('Profile Updated', 'User profile has been updated.');
                        return response.data;
                    }

                    if (flagData.context?.type === 'animal') {
                        const updateData = {
                            name: flagData.animalName,
                            description: flagData.description
                        };

                        console.log('[MOD ACTION] Editing animal:', flagData.context.id, updateData);

                        const response = await axios.put(
                            `${API_BASE_URL}/admin/animals/${flagData.context.id}`,
                            updateData,
                            {
                                headers: { Authorization: `Bearer ${authToken}` }
                            }
                        );

                        showModalMessage('Animal Updated', 'Animal record has been updated.');
                        return response.data;
                    }
                }

                // ========== WARNING ACTION: Issue warning to user ==========
                if (flagData.action === 'warn') {
                    const userId =
                        flagData.context?.type === 'profile'
                            ? flagData.context?.userId
                            : flagData.context?.ownerId;

                    const warnData = {
                        reason: flagData.reason,
                        category: flagData.category,
                        message: flagData.warnMessage || 'You have received a warning from the moderation team.',
                        duration: flagData.duration || null // null = permanent until manual removal
                    };

                    console.log('[MOD ACTION] Issuing warning:', userId, warnData);

                    const response = await axios.post(
                        `${API_BASE_URL}/admin/warnings`,
                        { userId, ...warnData },
                        {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }
                    );

                    showModalMessage('Warning Issued', `User has been warned.`);
                    return response.data;
                }

                // ========== SUSPEND ACTION: Temporarily suspend user account ==========
                if (flagData.action === 'suspend') {
                    const userId =
                        flagData.context?.type === 'profile'
                            ? flagData.context?.userId
                            : flagData.context?.ownerId;

                    const suspendData = {
                        reason: flagData.reason,
                        duration: flagData.suspensionDuration || 7, // days
                        message: flagData.suspensionMessage || 'Your account has been temporarily suspended.'
                    };

                    console.log('[MOD ACTION] Suspending user:', userId, suspendData);

                    const response = await axios.post(
                        `${API_BASE_URL}/admin/suspend`,
                        { userId, ...suspendData },
                        {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }
                    );

                    showModalMessage('Account Suspended', `User account suspended for ${suspendData.duration} days.`);
                    return response.data;
                }

                // ========== BAN ACTION: Permanently ban user account ==========
                if (flagData.action === 'ban') {
                    const userId =
                        flagData.context?.type === 'profile'
                            ? flagData.context?.userId
                            : flagData.context?.ownerId;

                    const banData = {
                        reason: flagData.reason,
                        message: flagData.banMessage || 'Your account has been permanently banned.'
                    };

                    console.log('[MOD ACTION] Banning user:', userId, banData);

                    const response = await axios.post(
                        `${API_BASE_URL}/admin/ban`,
                        { userId, ...banData },
                        {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }
                    );

                    showModalMessage('Account Banned', 'User has been permanently banned.');
                    return response.data;
                }

                // ========== LIFT WARNING ACTION: Remove warning from user ==========
                if (flagData.action === 'lift-warning') {
                    const userId =
                        flagData.context?.type === 'profile'
                            ? flagData.context?.userId
                            : flagData.context?.ownerId;

                    console.log('[MOD ACTION] Lifting warning from user:', userId);

                    const response = await axios.post(
                        `${API_BASE_URL}/admin/warnings/${userId}/lift`,
                        { reason: flagData.reason || 'Lifted by moderator' },
                        {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }
                    );

                    showModalMessage('Warning Lifted', 'User warning has been removed.');
                    return response.data;
                }

                // ========== LIFT SUSPENSION ACTION: End suspension early ==========
                if (flagData.action === 'lift-suspension') {
                    const userId =
                        flagData.context?.type === 'profile'
                            ? flagData.context?.userId
                            : flagData.context?.ownerId;

                    console.log('[MOD ACTION] Lifting suspension from user:', userId);

                    const response = await axios.post(
                        `${API_BASE_URL}/admin/suspend/${userId}/lift`,
                        { reason: flagData.reason || 'Lifted by moderator' },
                        {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }
                    );

                    showModalMessage('Suspension Lifted', 'User account has been restored.');
                    return response.data;
                }

                // ========== LIFT BAN ACTION: Restore banned account ==========
                if (flagData.action === 'lift-ban') {
                    const userId =
                        flagData.context?.type === 'profile'
                            ? flagData.context?.userId
                            : flagData.context?.ownerId;

                    console.log('[MOD ACTION] Lifting ban from user:', userId);

                    const response = await axios.post(
                        `${API_BASE_URL}/admin/ban/${userId}/lift`,
                        { reason: flagData.reason || 'Lifted by moderator' },
                        {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }
                    );

                    showModalMessage('Ban Lifted', 'User account has been restored.');
                    return response.data;
                }

                // Unknown action
                console.warn('[MOD ACTION] Unknown action:', flagData.action);
                showModalMessage('Error', 'Unknown moderation action.');
            } catch (error) {
                console.error('[MOD ACTION] Error:', error);
                const errorMessage =
                    error.response?.data?.message || error.message || 'Moderation action failed.';
                showModalMessage('Action Failed', errorMessage);
                throw error;
            }
        },
        [authToken, API_BASE_URL, showModalMessage]
    );

    // ========== RETURN ALL STATE & HANDLERS ==========
    return {
        // Mode States
        inModeratorMode,
        setInModeratorMode,

        // Panel States
        showAdminPanel,
        setShowAdminPanel,
        showModReportQueue,
        setShowModReportQueue,
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
        handleModQuickFlag,
    };
}
