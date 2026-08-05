// Decode JWT payload to get a stable per-user key for scoping localStorage preferences
// (e.g. alert settings) — shared by AnimalList's dropdown and the global NotificationBar.
export const getUserKey = (token) => {
    try {
        if (!token) return 'anon';
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.sub || payload.id || payload.userId || 'anon';
    } catch { return 'anon'; }
};
