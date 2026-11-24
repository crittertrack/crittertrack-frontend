
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { computeLitterStats } from './helpers';
import { Panel, Muted } from './ui';
import { Big, BreakdownToggle, SEX } from './StatsParts';
import {
    getLitterFieldLabel,
    getLitterSpecies,
    isEggLayingSpecies
} from '../../../utils/litterSpeciesPresentation';

const Divider = ({ children }) => (
    <div className="mt-4 border-t border-gray-100 pt-3 dark:border-dark-border">
        {children}
    </div>
);

/**
 * Displays litter outcomes as proportions of the original total born.
 * Culls are displayed separately from postnatal losses.
 */
const LitterOutcomeBar = ({
    totalBorn,
    stillborn,
    postnatal,
    culls,
    surviving
}) => {
    const total = Number(totalBorn) || 0;

    if (total <= 0) {
        return (
            <div
                className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-dark-surface"
                aria-label="No litter outcome data"
            />
        );
    }

    const segments = [
        { key: 'surviving', value: surviving, className: 'bg-green-500' },
        { key: 'stillborn', value: stillborn, className: 'bg-red-500' },
        { key: 'postnatal', value: postnatal, className: 'bg-orange-500' },
        { key: 'culls', value: culls, className: 'bg-gray-500' }
    ];

    return (
        <div
            className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-dark-surface"
            role="img"
            aria-label="Litter outcome distribution"
        >
            {segments.map(({ key, value, className }) => {
                if (value === null || value === undefined) return null;

                const count = Math.max(0, Number(value) || 0);
                const width = Math.min(100, (count / total) * 100);

                if (width <= 0) return null;

                return (
                    <div
                        key={key}
                        className={className}
                        style={{ width: `${width}%` }}
                    />
                );
            })}
        </div>
    );
};

export default function StatsPanel({
    litter,
    status,
    speciesOptions = []
}) {
    const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);

    const s = computeLitterStats(litter, status);
    const isBorn = status === 'born';

    const species = getLitterSpecies(litter);

    const eggLaying = isEggLayingSpecies(
        species,
        speciesOptions
    );

    if (
        !isBorn &&
        s.totalBorn === null &&
        !s.sexRecorded &&
        !s.anyLossRecorded
    ) {
        return (
            <Panel title="Litter statistics" testId="stats-panel">
                <p className="py-6 text-center text-sm text-gray-400 dark:text-dark-text-muted">
                    {status === 'planned'
                        ? 'Planned — no offspring recorded yet.'
                        : 'No offspring recorded yet.'}
                </p>
            </Panel>
        );
    }

    const valueState = (value) =>
        value === null || value === undefined ? 'missing' : 'value';

    const bornBySex = [s.male, s.female, s.unknown];

    const stillbornBySex = s.stillbornBySex || [null, null, null];

    // Calculate live-born counts per sex.
    const liveBornBySex = bornBySex.map((bornCount, index) => {
        const stillbornCount = stillbornBySex[index];

        if (
            bornCount === null || bornCount === undefined ||
            stillbornCount === null || stillbornCount === undefined
        ) {
            return null;
        }

        return Math.max(
            0,
            Number(bornCount) - Number(stillbornCount)
        );
    });

    // Culls are included in lossesBySex.
    const cullsBySex =
        s.culls === null || s.culls === undefined
            ? [0, 0, 0]
            : (s.cullsBySex || [null, null, null]);

    const lossesBySex = s.lossesBySex || [null, null, null];

    // Postnatal losses exclude culls.
    const postnatalBySex = lossesBySex.map((lossCount, index) => {
        const cullCount = cullsBySex[index];

        if (
            lossCount === null || lossCount === undefined ||
            cullCount === null || cullCount === undefined
        ) {
            return null;
        }

        return Math.max(
            0,
            Number(lossCount) - Number(cullCount)
        );
    });

    // Surviving counts per sex.
    const survivingBySex = bornBySex.map((bornCount, index) => {
        const stillbornCount = stillbornBySex[index];
        const lossCount = lossesBySex[index];

        if (
            bornCount === null || bornCount === undefined ||
            stillbornCount === null || stillbornCount === undefined ||
            lossCount === null || lossCount === undefined
        ) {
            return null;
        }

        return Math.max(
            0,
            Number(bornCount) -
            Number(stillbornCount) -
            Number(lossCount)
        );
    });

    const stillbornTitle = eggLaying
        ? 'Unhatched / non-viable eggs'
        : 'Stillborn';

    const lossesTitle = eggLaying
        ? 'Post-hatch losses'
        : 'Postnatal losses';

    const liveTitle = eggLaying
        ? 'Live hatched'
        : 'Live born';

    return (
        <Panel title="Litter statistics" testId="stats-panel">

            {/* MAIN STATISTICS */}
            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                <Big
                    label={getLitterFieldLabel(
                        'litterSizeBorn',
                        species,
                        'Total born',
                        speciesOptions
                    )}
                    value={s.totalBorn}
                    state={valueState(s.totalBorn)}
                    testId="stat-born"
                />

                <Big
                    label="Surviving"
                    value={s.surviving}
                    state={valueState(s.surviving)}
                    testId="stat-surviving"
                />

                {isBorn && (
                    <Big
                        label={getLitterFieldLabel(
                            'litterSizeWeaned',
                            species,
                            'Weaned',
                            speciesOptions
                        )}
                        value={s.weaned}
                        state={s.weanedState}
                        testId="stat-weaned"
                    />
                )}
            </div>

            {/* SEX DISTRIBUTION */}
            <div className="mt-4">
                <div className="mb-1 text-xs font-bold text-gray-900 dark:text-dark-text-muted">
                    Sex distribution
                </div>

                {s.sexSum > 0 ? (
                    <>
                        <div
                            className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-dark-surface"
                            role="img"
                            aria-label={`Males ${s.male !== null ? Math.round((s.male / s.sexSum) * 100) : 0}%, females ${s.female !== null ? Math.round((s.female / s.sexSum) * 100) : 0}%, unknown ${s.unknown !== null ? Math.round((s.unknown / s.sexSum) * 100) : 0}%`}
                        >
                            {SEX.map(({ key, bar }) => {
                                const count = Number(s[key]) || 0;

                                return count > 0 ? (
                                    <div
                                        key={key}
                                        className={bar}
                                        style={{
                                            width: `${(count / s.sexSum) * 100}%`
                                        }}
                                    />
                                ) : null;
                            })}
                        </div>

                        <div className="mt-1 flex justify-between text-[11px] text-gray-600 dark:text-dark-text-secondary">
                            {SEX.map(({ key, label, Icon, icon }) => (
                                <span
                                    key={key}
                                    className="inline-flex items-center gap-1"
                                >
                                    <Icon size={11} className={icon} />

                                    {s[key] !== null && s[key] !== undefined
                                        ? `${Math.round((s[key] / s.sexSum) * 100)}% (${s[key]})`
                                        : '—'}{' '}

                                    {label.toLowerCase()}
                                </span>
                            ))}
                        </div>
                    </>
                ) : (
                    <div
                        className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-dark-surface"
                        aria-label="No sex data recorded"
                    />
                )}
            </div>

            {/* LITTER OUTCOME */}
            {s.totalBorn !== null && s.totalBorn !== undefined && (
                <div className="mt-4">
                    <div className="mb-1 text-xs font-bold text-gray-900 dark:text-dark-text-muted">
                        Litter outcome
                    </div>

                    <LitterOutcomeBar
                        totalBorn={s.totalBorn}
                        stillborn={s.stillborn}
                        postnatal={s.postnatal}
                        culls={s.culls}
                        surviving={s.surviving}
                    />

                    <div className="mt-1 flex justify-between gap-2 text-[11px] text-gray-600 dark:text-dark-text-secondary">

                        <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" aria-hidden="true" />
                            {s.surviving != null
                                ? `${((s.surviving / s.totalBorn) * 100).toFixed(1)}%`
                                : '—'}{' '}
                            surviving
                        </span>

                        <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                            {s.stillborn != null
                                ? `${((s.stillborn / s.totalBorn) * 100).toFixed(1)}%`
                                : '—'}{' '}
                            {stillbornTitle.toLowerCase()}
                        </span>

                        <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
                            {s.postnatal != null
                                ? `${((s.postnatal / s.totalBorn) * 100).toFixed(1)}%`
                                : '—'}{' '}
                            {lossesTitle.toLowerCase()}
                        </span>

                        <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 shrink-0 rounded-full bg-gray-500" aria-hidden="true" />
                            {s.culls != null
                                ? `${((s.culls / s.totalBorn) * 100).toFixed(1)}%`
                                : '0.0%'}{' '}
                            culls
                        </span>

                    </div>
                </div>
            )}

            {/* COLLAPSIBLE BREAKDOWN */}
            <Divider>
                <button
                    type="button"
                    onClick={() => setIsBreakdownExpanded(prev => !prev)}
                    className="flex w-full items-center justify-between gap-3 text-left group"
                    aria-expanded={isBreakdownExpanded}
                    aria-controls="litter-statistics-breakdown"
                >
                    <span className="text-sm font-bold text-gray-900 dark:text-dark-text-muted group-hover:text-gray-700 dark:group-hover:text-dark-text transition-colors">
                        Breakdown
                    </span>

                    {isBreakdownExpanded ? (
                        <ChevronUp
                            size={18}
                            className="shrink-0 text-gray-500 dark:text-dark-text-muted"
                        />
                    ) : (
                        <ChevronDown
                            size={18}
                            className="shrink-0 text-gray-500 dark:text-dark-text-muted"
                        />
                    )}
                </button>
            </Divider>

            {isBreakdownExpanded && (
                <div
                    id="litter-statistics-breakdown"
                    className="space-y-1.5"
                >
                    <BreakdownToggle
                        title={stillbornTitle}
                        total={s.stillborn}
                        bySex={stillbornBySex}
                    />

                    <BreakdownToggle
                        title={lossesTitle}
                        total={s.postnatal}
                        bySex={postnatalBySex}
                        note={s.culls > 0 ? 'Excludes culls' : undefined}
                    />

                    <BreakdownToggle
                        title="Culls"
                        total={s.culls ?? 0}
                        bySex={cullsBySex}
                    />

                    <BreakdownToggle
                        title="Surviving"
                        total={s.surviving}
                        bySex={survivingBySex}
                    />

                    <BreakdownToggle
                        title={getLitterFieldLabel(
                            'litterSizeWeaned',
                            species,
                            'Weaned',
                            speciesOptions
                        )}
                        total={s.weaned}
                        bySex={s.weanedBySex}
                    />
                </div>
            )}

        </Panel>
    );
}
