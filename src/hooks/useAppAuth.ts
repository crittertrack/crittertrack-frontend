import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

/**
 * useAppAuth - Manages application authentication state and profile fetching
 * 
 * Provides:
 * - authToken and userProfile state
 * - fetchUserProfile function with automatic refresh
 * - Auth token setup from localStorage
 */
export function useAppAuth(
    API_BASE_URL: string,
    showModalMessage: (title: string, message: string) => void
) {
    // Auth token state - initialize from localStorage
    const [authToken, setAuthToken] = useState<string | null>(() => {
        try {
            return localStorage.getItem('authToken') || null;
        } catch (e) {
            console.warn('Could not read authToken from localStorage', e);
            return null;
        }
    });

    // User profile state
    const [userProfile, setUserProfile] = useState<any>(null);

    // Fetch user profile from API
    const fetchUserProfile = useCallback(
        async (token: string | null) => {
            // Don't fetch if no token (already logged out)
            if (!token) return;

            try {
                const response = await axios.get(`${API_BASE_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Normalize profile image keys for UI compatibility and add cache-busting query
                const user = response.data || {};
                const img =
                    user.profileImage ||
                    user.profileImageUrl ||
                    user.imageUrl ||
                    user.avatarUrl ||
                    user.avatar ||
                    user.profile_image ||
                    null;

                if (img) {
                    const busted = img.includes('?') ? `${img}&t=${Date.now()}` : `${img}?t=${Date.now()}`;
                    // Prefer `profileImage` and also set `profileImageUrl` for backwards compatibility
                    user.profileImage = busted;
                    user.profileImageUrl = busted;
                }

                setUserProfile(user);
            } catch (error: any) {
                console.error('Failed to fetch user profile:', error);

                // Only log out if it's a 401 or 403 (token expired/invalid/forbidden), not for network errors
                if (error.response?.status === 401 || error.response?.status === 403) {
                    // Only show error modal if we still have a token (not already logged out)
                    if (authToken) {
                        showModalMessage('Session Expired', 'Your session has expired. Please log in again.');
                        setAuthToken(null);
                        try {
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('userId');
                        } catch (e) {
                            console.warn('Could not clear auth from localStorage', e);
                        }
                    }
                } else if (error.code === 'ERR_NETWORK' || !error.response) {
                    // Network error - don't log out, just log it
                    console.warn('Network error fetching profile, will retry automatically');
                } else {
                    // Other unexpected errors - log but don't force logout
                    console.error('Unexpected error fetching profile:', error.response?.status, error.message);
                }
                // For network/other errors, don't log out - the periodic refresh will retry
            }
        },
        [API_BASE_URL, authToken, showModalMessage]
    );

    // Periodically refresh user profile to catch warning/suspension changes
    useEffect(() => {
        if (!authToken) return;

        // Fetch immediately, then set up periodic refetch
        fetchUserProfile(authToken);

        // Refetch user profile every 5 minutes to catch warning/suspension updates
        const interval = setInterval(() => {
            fetchUserProfile(authToken);
        }, 300000);

        return () => clearInterval(interval);
    }, [authToken, fetchUserProfile]);

    return {
        authToken,
        setAuthToken,
        userProfile,
        setUserProfile,
        fetchUserProfile
    };
}
