// Personal "Recently Viewed" history (animals + breeders), stored on this device only.
// Cleared on logout so a shared device never shows the previous user's history.
const STORAGE_KEY = 'crittertrack_recently_viewed';
const MAX_ITEMS = 30;

export const getRecentlyViewed = () => {
    try {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
};

// item: { type: 'animal' | 'breeder', id, name, image?, subtitle? }
export const trackRecentlyViewed = (item) => {
    if (!item || !item.id || !item.type || !item.name) return;
    if (!localStorage.getItem('authToken')) return;
    try {
        const entry = { ...item, viewedAt: Date.now() };
        const rest = getRecentlyViewed().filter(i => !(i.type === item.type && i.id === item.id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...rest].slice(0, MAX_ITEMS)));
    } catch { /* storage full/unavailable - history is best-effort */ }
};

export const clearRecentlyViewed = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
};
