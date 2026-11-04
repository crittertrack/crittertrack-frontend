import React from 'react';
import { ALL_CATEGORIES, contactHasCategory, withCategory } from './contactCategories';

// Single checklist of every contact category (Owner, Breeder, Vet, ...), shared by the
// Add and Edit contact forms. `value` is the form data; `onChange` receives the updated copy.
const CategoryPicker = ({ value, onChange }) => (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
        {ALL_CATEGORIES.map(cat => (
            <div key={cat.key} className="flex items-center">
                <input
                    id={`cat-${cat.key}`}
                    type="checkbox"
                    checked={contactHasCategory(value, cat.key)}
                    onChange={(e) => onChange(withCategory(value, cat.key, e.target.checked))}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-dark-text-muted rounded"
                />
                <label htmlFor={`cat-${cat.key}`} className="ml-2 block text-sm text-gray-900 dark:text-dark-text">{cat.label}</label>
            </div>
        ))}
    </div>
);

export default CategoryPicker;
