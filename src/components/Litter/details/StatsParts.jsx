import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Mars, Venus, Circle } from 'lucide-react';
import { Muted } from './ui';

export const SEX = [
    { key: 'male', label: 'Males', Icon: Mars, icon: 'text-primary', bar: 'bg-primary' },
    { key: 'female', label: 'Females', Icon: Venus, icon: 'text-accent', bar: 'bg-accent' },
    { key: 'unknown', label: 'Unknown', Icon: Circle, icon: 'text-gray-500', bar: 'bg-gray-400' },
];

/** Prominent number with a muted label. state: 'value' | 'pending' | 'missing'. */
export const Big = ({ label, value, state = 'value', testId }) => (
    <div className="text-center min-w-0" data-testid={testId}>
        <div className="text-2xl font-bold leading-tight text-gray-900 dark:text-dark-text">
            {state === 'value'
                ? value
                : <span className="text-base font-medium text-gray-400 dark:text-dark-text-muted">{state === 'pending' ? 'Pending' : '—'}</span>}
        </div>
        <div className="text-[11px] text-gray-500 dark:text-dark-text-muted">{label}</div>
    </div>
);

/** A loss line with an optional expandable male / female / unknown breakdown. */
export const BreakdownToggle = ({ title, total, bySex, note }) => {
    const [open, setOpen] = useState(false);
    const recorded = bySex.some(v => v !== null);
    return (
        <div className="text-sm">
            <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-500 dark:text-dark-text-muted">{title}</span>
                <span className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-dark-text">{total === null ? <Muted>Not recorded</Muted> : total}</span>
                    {recorded && (
                        <button
                            type="button"
                            onClick={() => setOpen(o => !o)}
                            aria-expanded={open}
                            aria-label={`${open ? 'Hide' : 'Show'} ${title.toLowerCase()} by sex`}
                            className="p-0.5 rounded text-gray-500 dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-surface"
                        >
                            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    )}
                </span>
            </div>
            {note && <div className="text-[11px] text-gray-400 dark:text-dark-text-muted -mt-1 mb-1">{note}</div>}
            {open && recorded && (
                <div className="flex gap-4 pb-2 pl-2 text-xs text-gray-600 dark:text-dark-text-secondary">
                    {SEX.map(({ key, label, Icon, icon }, i) => (
                        <span key={key} className="inline-flex items-center gap-1"><Icon size={12} className={icon} />{bySex[i] ?? 0} {label.toLowerCase()}</span>
                    ))}
                </div>
            )}
        </div>
    );
};
