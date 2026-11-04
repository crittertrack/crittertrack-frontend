// Contact categories. "Owner" and "Breeder" map to the legacy isKeeper / isBreeder
// flags (the field names are unchanged for compatibility); the rest are stored in
// the contact's `categories` array.
export const EXTRA_CATEGORIES = [
    { key: 'vet', label: 'Vet' },
    { key: 'judge', label: 'Judge' },
    { key: 'stud', label: 'Stud / Co-breeder' },
    { key: 'rescue', label: 'Rescue / Shelter' },
    { key: 'trainer', label: 'Trainer / Handler' },
    { key: 'club', label: 'Club / Association' },
    { key: 'other', label: 'Other' },
];

export const CATEGORY_BADGE_CLASSES = {
    owner: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    breeder: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    extra: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
};

export const getExtraCategoryLabel = (key) =>
    EXTRA_CATEGORIES.find(c => c.key === key)?.label || key;

// One combined list: Owner and Breeder first, then the rest. Used by the forms and the filters.
export const ALL_CATEGORIES = [
    { key: 'owner', label: 'Owner' },
    { key: 'breeder', label: 'Breeder' },
    ...EXTRA_CATEGORIES,
];

export const getCategoryLabel = (key) =>
    ALL_CATEGORIES.find(c => c.key === key)?.label || key;

// Does this contact (or form data) have the category? Owner/Breeder use the legacy flags.
export const contactHasCategory = (contact, key) => {
    if (!contact) return false;
    if (key === 'owner') return !!contact.isKeeper;
    if (key === 'breeder') return !!contact.isBreeder;
    return (contact.categories || []).includes(key);
};

// Every category key the contact has, in display order.
export const getContactCategoryKeys = (contact) =>
    ALL_CATEGORIES.filter(c => contactHasCategory(contact, c.key)).map(c => c.key);

// Return a copy of contact/form data with one category switched on or off.
export const withCategory = (contact, key, checked) => {
    if (key === 'owner') return { ...contact, isKeeper: checked };
    if (key === 'breeder') return { ...contact, isBreeder: checked };
    const current = contact.categories || [];
    const next = checked ? [...new Set([...current, key])] : current.filter(k => k !== key);
    return { ...contact, categories: next };
};

export const categoryBadgeClass = (key) =>
    key === 'owner' ? CATEGORY_BADGE_CLASSES.owner
        : key === 'breeder' ? CATEGORY_BADGE_CLASSES.breeder
            : CATEGORY_BADGE_CLASSES.extra;

// Toggle a category key inside formData.categories
export const toggleCategory = (categories = [], key) =>
    categories.includes(key) ? categories.filter(k => k !== key) : [...categories, key];
