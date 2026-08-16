// Lightweight in-memory caches for per-animal inbreeding (COI/AVK) and parent-card lookups,
// so repeatedly opening/closing the same animal while browsing doesn't refetch every time.
// Invalidated automatically via the app-wide 'animal-updated' (one animal changed) and
// 'animals-changed' (broader — delete/archive/transfer, population membership changed)
// events that every animal mutation path already dispatches (see app.jsx/usePrivateAnimalNavigation.ts).
const CACHE_TTL_MS = 5 * 60 * 1000; // safety net in case an invalidation path is ever missed

const inbreedingCache = new Map(); // id_public -> { data, expiresAt }
const parentCache = new Map(); // id_public -> { data, expiresAt }

function getCached(map, id) {
    if (!id) return null;
    const entry = map.get(id);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        map.delete(id);
        return null;
    }
    return entry.data;
}

function setCached(map, id, data) {
    if (!id) return;
    map.set(id, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function getCachedInbreeding(id) {
    return getCached(inbreedingCache, id);
}

export function setCachedInbreeding(id, data) {
    setCached(inbreedingCache, id, data);
}

export function getCachedParent(id) {
    return getCached(parentCache, id);
}

export function setCachedParent(id, data) {
    setCached(parentCache, id, data);
}

if (typeof window !== 'undefined') {
    window.addEventListener('animal-updated', (e) => {
        const id = e.detail?.id_public;
        if (!id) return;
        // The animal itself changed (e.g. its own pedigree/status) — its own cached
        // inbreeding result is stale, and if it's cached as somebody else's parent card
        // that's stale too.
        inbreedingCache.delete(id);
        parentCache.delete(id);
    });
    window.addEventListener('animals-changed', () => {
        // Broader change (delete/archive/transfer) — population membership shifted, which
        // can ripple into other animals' AVK, so drop everything rather than guess who's affected.
        inbreedingCache.clear();
        parentCache.clear();
    });
}
