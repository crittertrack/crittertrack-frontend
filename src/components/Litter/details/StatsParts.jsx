import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Mars,
    Venus,
    Circle
} from 'lucide-react';
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
                : (
                    <span className="text-base font-medium text-gray-400 dark:text-dark-text-muted">
                        {state === 'pending' ? 'Pending' : '—'}
                    </span>
                )}
        </div>
        <div className="text-[11px] text-gray-500 dark:text-dark-text-muted">
            {label}
        </div>
    </div>
);

/**
 * Breakdown row styled like the litter statistics reference:
 * category dot, title, total, always-visible sex counts, and expand chevron.
 * Expanding reveals a compact visual distribution of the available sex counts.
 */
export const BreakdownToggle = ({
    title,
    total,
    bySex = [null, null, null],
    note,
    dotColor = 'bg-primary'
}) => {
    const [open, setOpen] = useState(false);
    const safeBySex = Array.isArray(bySex) ? bySex : [null, null, null];

    const values = [0, 1, 2].map((index) => {
        const value = safeBySex[index];

        if (value === null || value === undefined || value === '') {
            return null;
        }

        const numericValue = Number(value);
        return Number.isFinite(numericValue)
            ? Math.max(0, numericValue)
            : null;
    });

    const hasRecordedSexCount = values.some(value => value !== null);
    const sexTotal = values.reduce(
        (sum, value) => sum + (value === null ? 0 : value),
        0
    );

    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2 dark:border-dark-border dark:bg-dark-surface/70">
            <div className="flex min-w-0 items-center gap-2">
                <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`}
                    aria-hidden="true"
                />

                <span className="min-w-0 flex-1 truncate text-sm text-gray-700 dark:text-dark-text">
                    {title}
                </span>

                <span className="w-7 shrink-0 text-right text-base font-bold tabular-nums text-gray-900 dark:text-dark-text">
                    {total === null || total === undefined
                        ? <Muted>—</Muted>
                        : total}
                </span>

                <div className="ml-1 flex shrink-0 items-center gap-1.5 sm:gap-3">
                    {SEX.map(({ key, label, Icon, icon }, index) => (
                        <span
                            key={key}
                            className="inline-flex items-center gap-0.5 whitespace-nowrap text-[11px] tabular-nums text-gray-600 dark:text-dark-text-secondary sm:gap-1 sm:text-xs"
                            aria-label={`${label}: ${values[index] === null ? 'not recorded' : values[index]}`}
                        >
                            <Icon size={13} className={icon} />
                            <span>{values[index] === null ? '—' : values[index]}</span>
                        </span>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => setOpen(value => !value)}
                    aria-expanded={open}
                    aria-label={`${open ? 'Hide' : 'Show'} ${title.toLowerCase()} distribution`}
                    className="ml-0.5 shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-700 dark:text-dark-text-muted dark:hover:bg-dark-border dark:hover:text-dark-text"
                >
                    {open
                        ? <ChevronUp size={16} />
                        : <ChevronDown size={16} />}
                </button>
            </div>

            {note && (
                <div className="ml-5 mt-1 text-[11px] text-gray-400 dark:text-dark-text-muted">
                    {note}
                </div>
            )}

            {open && (
                <div className="ml-5 mt-2 border-t border-gray-200/80 pt-2 dark:border-dark-border">
                    {hasRecordedSexCount && sexTotal > 0 ? (
                        <div
                            className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-dark-border"
                            role="img"
                            aria-label={`${title} sex distribution`}
                        >
                            {SEX.map(({ key, bar }, index) => {
                                const count = values[index] ?? 0;
                                if (count <= 0) return null;

                                return (
                                    <span
                                        key={key}
                                        className={bar}
                                        style={{ width: `${(count / sexTotal) * 100}%` }}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-[11px] text-gray-400 dark:text-dark-text-muted">
                            Sex breakdown is not recorded.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
