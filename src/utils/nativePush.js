// Native FCM push registration/listeners for the Capacitor Android build (com.crittertrack.app).
// Web builds keep using the existing Web Push flow in pushNotifications.js — this is native-only.
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import apiClient from './apiClient';

// google-services.json is present and the backend has FIREBASE_SERVICE_ACCOUNT configured.
const FIREBASE_CONFIGURED = true;

const authHeaders = (authToken) => ({ headers: { Authorization: `Bearer ${authToken}` } });

// Requests permission (if needed) and asks the OS to register this device for FCM push —
// the actual token arrives asynchronously via the 'registration' listener below.
export const registerNativePush = async () => {
    if (!Capacitor.isNativePlatform() || !FIREBASE_CONFIGURED) return;
    try {
        let perm = await PushNotifications.checkPermissions();
        if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
            perm = await PushNotifications.requestPermissions();
        }
        if (perm.receive !== 'granted') return;
        await PushNotifications.register();
    } catch (err) {
        console.error('[push] Native registration failed:', err);
    }
};

// Wires up the FCM listeners for this authenticated session. Returns a cleanup function that
// removes all listeners (call it on logout/unmount).
export const initNativePushListeners = async (authToken, API_BASE_URL) => {
    if (!Capacitor.isNativePlatform()) return () => {};

    const handles = await Promise.all([
        PushNotifications.addListener('registration', async (token) => {
            try {
                await apiClient.post(`/push/register-device`, { token: token.value, platform: 'android' });
            } catch (err) {
                console.error('[push] Failed to register device token with backend:', err);
            }
        }),
        PushNotifications.addListener('registrationError', (err) => {
            console.error('[push] Registration error:', err);
        }),
        // Native build uses HashRouter (see index.jsx) — navigate via the hash, not a full href change.
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            const url = action.notification?.data?.url;
            if (url) window.location.hash = url;
        }),
    ]);

    return () => handles.forEach((h) => h.remove());
};
