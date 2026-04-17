import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

const decodeJwtPayload = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

const isTokenExpired = (token: string | null) => {
    if (!token) return false;

    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return false;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowInSeconds;
};

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
            const storedToken = localStorage.getItem('authToken');
            if (!storedToken) return null;

            if (isTokenExpired(storedToken)) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                return null;
            }

            return storedToken;
        } catch (e) {
            console.warn('Could not read authToken from localStorage', e);
            return null;
        }
    });

    // User profile state
    const [userProfile, setUserProfile] = useState<any>(null);

    // Stable ref for showModalMessage — avoids making fetchUserProfile a new reference
    // every render just because the caller passes an inline arrow function
    const showModalMessageRef = useRef(showModalMessage);
    const sessionExpiredHandledRef = useRef(false);

    useEffect(() => {
        showModalMessageRef.current = showModalMessage;
    });

    const clearAuthState = useCallback((showExpiredMessage = false) => {
        setAuthToken(null);
        setUserProfile(null);

        try {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
        } catch (e) {
            console.warn('Could not clear auth from localStorage', e);
        }

        if (showExpiredMessage && !sessionExpiredHandledRef.current) {
            sessionExpiredHandledRef.current = true;
            showModalMessageRef.current('Session Expired', 'Your session has expired. Please log in again.');
        }
    }, []);

    useEffect(() => {
        if (authToken) {
            sessionExpiredHandledRef.current = false;
        }
    }, [authToken]);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const status = error?.response?.status;
                const message = String(error?.response?.data?.message || error?.message || '').toLowerCase();
                const tokenExpired = status === 401 && (
                    error?.response?.data?.expired === true ||
                    message.includes('token expired') ||
                    message.includes('jwt expired') ||
                    message.includes('session expired')
                );

                if (tokenExpired) {
                    clearAuthState(true);
                }

                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, [clearAuthState]);

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
                    if (token) {
                        clearAuthState(true);
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
        [API_BASE_URL, clearAuthState]  // No longer depends on authToken or showModalMessage — both accessed via ref/closure
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
