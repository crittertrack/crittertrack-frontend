import { useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

// 30 minutes in milliseconds
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

// Events that reset the idle timer
const ACTIVE_EVENTS = ['mousemove', 'keydown', 'scroll', 'click'];

/**
 * useIdleTimeout - Manages idle session timeout and suspension/ban detection
 * 
 * Features:
 * - Auto-logout after 30 minutes of inactivity
 * - Detects user activity (mouse, keyboard, scroll, click)
 * - Catches suspension/ban via axios interceptor
 * - Automatic retry on network errors
 * 
 * @param authToken - Current auth token
 * @param handleLogout - Function to call when session expires
 * @param showModalMessage - Function to show modal messages
 * @returns cleanup function (automatically called)
 */
export function useIdleTimeout(
    authToken: string | null,
    handleLogout: (expired: boolean) => void,
    showModalMessage: (title: string, message: string) => void
) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Reset idle timer on user activity
    const resetIdleTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            if (authToken) {
                handleLogout(true); // true = session expired
            }
        }, IDLE_TIMEOUT_MS);
    }, [authToken, handleLogout]);

    // Set up idle timeout and axios interceptor
    useEffect(() => {
        if (authToken) {
            // Set Authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

            // Start idle timeout
            resetIdleTimer();

            // Listen for user activity to reset idle timer
            ACTIVE_EVENTS.forEach(event => window.addEventListener(event, resetIdleTimer));

            // Add axios response interceptor to catch suspension/ban
            const interceptor = axios.interceptors.response.use(
                response => response,
                error => {
                    if (error.response?.status === 403 && error.response?.data?.forceLogout) {
                        const accountStatus = error.response?.data?.accountStatus;
                        const message = error.response?.data?.message || 'Your account status has changed.';

                        console.log('[AUTH] Force logout triggered:', { accountStatus, message });

                        // Clear auth and show message
                        handleLogout(false); // false = not expired, but forced
                        showModalMessage(
                            accountStatus === 'suspended' ? 'Account Suspended' : 'Account Status Changed',
                            message
                        );
                    }
                    return Promise.reject(error);
                }
            );

            return () => {
                // Clean up response interceptor
                axios.interceptors.response.eject(interceptor);

                // Remove event listeners
                ACTIVE_EVENTS.forEach(event => window.removeEventListener(event, resetIdleTimer));

                // Clear timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        } else {
            // No auth token - clean up
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            ACTIVE_EVENTS.forEach(event => window.removeEventListener(event, resetIdleTimer));
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            ACTIVE_EVENTS.forEach(event => window.removeEventListener(event, resetIdleTimer));
        };
    }, [authToken, resetIdleTimer, handleLogout, showModalMessage]);
}
