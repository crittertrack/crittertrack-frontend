import React from 'react';

export const isBlank = (v) => v === null || v === undefined || v === '';

export const Panel = ({ title, action, children, className = '', testId }) => (
    <section data-testid={testId} className={`rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4 ${className}`}>
        {(title || action) && (
            <div className="flex items-center justify-between gap-2 mb-3">
                {title && <h3 className="font-semibold text-gray-900 dark:text-dark-text">{title}</h3>}
                {action}
            </div>
        )}
        {children}
    </section>
);

/** Label / value line; a blank value renders as a muted "Not recorded". */
export const DetailRow = ({ label, value }) => (
    <div className="flex justify-between gap-3 py-1.5 text-sm border-b border-gray-100 dark:border-dark-border last:border-0">
        <span className="text-gray-500 dark:text-dark-text-muted shrink-0">{label}</span>
        {isBlank(value)
            ? <span className="text-gray-400 dark:text-dark-text-muted text-right">Not recorded</span>
            : <span className="text-gray-900 dark:text-dark-text text-right">{value}</span>}
    </div>
);

export const Muted = ({ children }) => (
    <span className="text-gray-400 dark:text-dark-text-muted">{children}</span>
);
