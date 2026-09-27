// Canonical enclosure "purpose" options.
//
// This list used to be duplicated inline in every enclosure form and had drifted out of sync
// with the backend's enum — the dropdowns offered "Medical" and "Quarantine" while the schema
// only accepted a single combined "health" value, so those choices failed to save. Keep this
// in sync with the backend's utils/enclosurePurpose.js (the two are standalone apps and can't
// share an import).
//
// Order matters — it drives the order of the dropdown.
export const ENCLOSURE_PURPOSE_OPTIONS = [
    { value: 'general', label: 'General' },
    { value: 'reproduction', label: 'Nursery / Breeding' },
    { value: 'medical', label: 'Medical' },
    { value: 'quarantine', label: 'Quarantine' },
    { value: 'sale', label: 'For Sale' },
    { value: 'other', label: 'Other' },
];

// Purposes whose enclosures are grouped into the Health tab's enclosure panel.
export const HEALTH_ENCLOSURE_PURPOSES = ['medical', 'quarantine'];

// Older records store a single combined 'health' purpose, and some forms use '' for General.
const PURPOSE_ALIASES = { health: 'quarantine', '': 'general' };

export const DEFAULT_ENCLOSURE_PURPOSE = 'general';

/** Map any stored/selected purpose onto a canonical value. */
export const normalizeEnclosurePurpose = (value) => {
    if (value === undefined || value === null) return DEFAULT_ENCLOSURE_PURPOSE;
    const raw = String(value).trim().toLowerCase();
    if (ENCLOSURE_PURPOSE_OPTIONS.some((o) => o.value === raw)) return raw;
    return PURPOSE_ALIASES[raw] ?? DEFAULT_ENCLOSURE_PURPOSE;
};

/** Human-readable label for a stored purpose, e.g. 'quarantine' -> 'Quarantine'. */
export const getEnclosurePurposeLabel = (value) => {
    const normalized = normalizeEnclosurePurpose(value);
    return ENCLOSURE_PURPOSE_OPTIONS.find((o) => o.value === normalized)?.label ?? 'General';
};

export const isHealthEnclosurePurpose = (value) =>
    HEALTH_ENCLOSURE_PURPOSES.includes(normalizeEnclosurePurpose(value));
