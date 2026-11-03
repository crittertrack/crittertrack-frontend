import React from 'react';

export const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card-bg text-gray-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary';
export const cardClass = 'rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4 space-y-4';
export const secondaryBtn = 'px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface';

/** Label + control + inline hint/error, used by every section. */
export const FieldRow = ({ label, hint, error, required = false, children }) => (
    <div>
        {label && (
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                {label}{required && <span className="text-red-500"> *</span>}
            </label>
        )}
        {children}
        {hint && !error && <p className="text-xs text-gray-400 dark:text-dark-text-muted mt-1">{hint}</p>}
        {error && <p role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
);

/** Whole-number input: stores a number, or null when emptied. */
export const NumberInput = ({ value, onChange, min = 0, ...rest }) => (
    <input
        type="number"
        inputMode="numeric"
        min={min}
        className={inputClass}
        value={value ?? ''}
        onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') return onChange(null);
            const n = parseInt(raw, 10);
            onChange(Number.isNaN(n) ? null : Math.max(min, n));
        }}
        {...rest}
    />
);

export const Checkbox = ({ checked, onChange, label, hint }) => (
    <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-dark-text cursor-pointer">
        <input type="checkbox" className="mt-0.5" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
        <span>
            {label}
            {hint && <span className="block text-xs text-gray-400 dark:text-dark-text-muted">{hint}</span>}
        </span>
    </label>
);

export const SectionTitle = ({ title, description, icon: Icon, iconBg = 'bg-blue-100', iconColor = 'text-blue-600' }) => (
    <div className="flex items-start gap-3">
        {Icon && (
            <div className={`shrink-0 w-10 h-10 rounded-full ${iconBg} ${iconColor} flex items-center justify-center`}>
                <Icon size={20} />
            </div>
        )}
        <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">{title}</h2>
            {description && <p className="text-sm text-gray-500 dark:text-dark-text-muted">{description}</p>}
        </div>
    </div>
);

export const Select = ({ value, onChange, options, placeholder }) => (
    <select className={inputClass} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
        })}
    </select>
);
