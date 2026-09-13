// Caches the account's last-known uiMode in localStorage so that when App remounts fresh
// (e.g. returning from the standalone /user/:userId route, which lives outside <App>), Lite
// mode can render immediately instead of flashing the Full-site UI while userProfile re-fetches.
const STORAGE_KEY = 'crittertrack_uiMode';

export const getCachedUiMode = () => {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
};

export const setCachedUiMode = (uiMode) => {
    try {
        if (uiMode) localStorage.setItem(STORAGE_KEY, uiMode);
        else localStorage.removeItem(STORAGE_KEY);
    } catch {
        // no-op — localStorage unavailable (private browsing, etc.)
    }
};
