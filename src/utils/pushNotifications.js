// Web Push subscribe/unsubscribe helpers (browser-side).
import axios from 'axios';

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const isPushSupported = () =>
    'serviceWorker' in navigator && 'PushManager' in window && typeof window.Notification !== 'undefined';

export const getPushPermission = () => (isPushSupported() ? window.Notification.permission : 'unsupported');

// Checks THIS browser/device's actual subscription state (not just whether the account has
// a subscription on some other device) — use this to drive the enable/disable button UI.
export const isSubscribedOnThisDevice = async () => {
    if (!isPushSupported()) return false;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
};

export const subscribeToPush = async (authToken, API_BASE_URL) => {
    if (!isPushSupported()) throw new Error('Push notifications are not supported in this browser.');

    const permission = await window.Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Notification permission was not granted.');

    const { data } = await axios.get(`${API_BASE_URL}/push/vapid-public-key`);
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey)
    });

    await axios.post(
        `${API_BASE_URL}/push/subscribe`,
        { subscription: subscription.toJSON() },
        { headers: { Authorization: `Bearer ${authToken}` } }
    );

    return subscription;
};

export const unsubscribeFromPush = async (authToken, API_BASE_URL) => {
    if (!isPushSupported()) return;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    await axios.post(
        `${API_BASE_URL}/push/unsubscribe`,
        { endpoint },
        { headers: { Authorization: `Bearer ${authToken}` } }
    );
};
