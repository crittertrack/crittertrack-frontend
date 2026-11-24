
import React from 'react';
import {
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
 * Breakdown row with an always-visible sex distribution bar.
 * Each bar calculates percentages from its own recorded sex total.
 */
export const BreakdownToggle = ({
    title,
    total,
    bySex = [null, null, null],
    note
}) => {
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
                <span className="min-w-0 flex-1 truncate text-sm text-gray-700 dark:text-dark-text">
                    {title}
                </span>

                <span className="w-7 shrink-0 text-right text-base font-bold tabular-nums text-gray-900 dark:text-dark-text">
                    {total === null || total === undefined
                        ? <Muted>—</Muted>
                        : total}
                </span>
            </div>

            {note && (
                <div className="mt-0.5 text-[11px] text-gray-400 dark:text-dark-text-muted">
                    {note}
                </div>
            )}

            <div className="mt-2">
                {hasRecordedSexCount && sexTotal > 0 ? (
                    <>
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
                                        style={{
                                            width: `${(count / sexTotal) * 100}%`
                                        }}
                                    />
                                );
                            })}
                        </div>

                        <div className="mt-1 flex justify-between gap-2 text-[10px] text-gray-500 dark:text-dark-text-muted">
                            {SEX.map(({ key, label, Icon, icon }, index) => (
                                <span
                                    key={key}
                                    className="inline-flex items-center gap-1 whitespace-nowrap"
                                >
                                    <Icon size={11} className={icon} />
                                    {values[index] === null
                                        ? '—'
                                        : `${Math.round((values[index] / sexTotal) * 100)}%`}
                                    <span className="hidden sm:inline">
                                        {label.toLowerCase()}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-[11px] text-gray-400 dark:text-dark-text-muted">
                        Sex breakdown is not recorded.
                    </p>
                )}
            </div>
        </div>
    );
};
