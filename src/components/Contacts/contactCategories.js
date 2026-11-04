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

// Toggle a category key inside formData.categories
export const toggleCategory = (categories = [], key) =>
    categories.includes(key) ? categories.filter(k => k !== key) : [...categories, key];
