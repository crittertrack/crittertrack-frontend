import React from 'react';
import { computeLitterStats } from './helpers';
import { Panel, Muted } from './ui';
import { Big, BreakdownToggle, SEX } from './StatsParts';
import {
    getLitterFieldLabel,
    getLitterSpecies,
    isEggLayingSpecies
} from '../../../utils/litterSpeciesPresentation';

const Divider = ({ children }) => (
    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border">
        {children}
    </div>
);

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
        { key: 'surviving', value: surviving, color: 'bg-green-500', label: 'Surviving' },
        { key: 'stillborn', value: stillborn, color: 'bg-red-500', label: 'Stillborn' },
        { key: 'postnatal', value: postnatal, color: 'bg-orange-500', label: 'Postnatal losses' },
        { key: 'culls', value: culls, color: 'bg-gray-500', label: 'Culls' }
    ];

    return (
        <div
            className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-dark-surface"
            role="img"
            aria-label="Litter outcome distribution"
        >
            {segments.map((segment) => {
                if (segment.value === null || segment.value === undefined) {
                    return null;
                }

                const value = Math.max(0, Number(segment.value) || 0);
                const width = Math.min(100, (value / total) * 100);

                if (width <= 0) {
                    return null;
                }

                return (
                    <div
                        key={segment.key}
                        className={segment.color}
                        style={{ width: `${width}%` }}
                        aria-label={`${segment.label}: ${value}`}
                        title={`${segment.label}: ${value}`}
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
    const s = computeLitterStats(litter, status);
    const isBorn = status === 'born';
    const eggLaying = isEggLayingSpecies(
        getLitterSpecies(litter),
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

    const valueState = (value) => (
        value === null || value === undefined ? 'missing' : 'value'
    );

    const bornBySex = [s.male, s.female, s.unknown];
    const stillbornBySex = s.stillbornBySex || [null, null, null];
    const liveBornBySex = bornBySex.map((bornCount, index) => {
        const stillbornCount = stillbornBySex[index];

        if (
            bornCount === null ||
            bornCount === undefined ||
            stillbornCount === null ||
            stillbornCount === undefined
        ) {
            return null;
        }

        return Math.max(0, Number(bornCount) - Number(stillbornCount));
    });
    const stillbornTitle = eggLaying
        ? 'Unhatched / non-viable eggs'
        : 'Stillborn';
    const lossesTitle = eggLaying
        ? 'Post-hatch losses'
        : 'Postnatal losses';

    return (
        <Panel title="Litter statistics" testId="stats-panel">
            {/* Main statistics */}
            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                <Big
                    label={getLitterFieldLabel(
                        'litterSizeBorn',
                        getLitterSpecies(litter),
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
                            getLitterSpecies(litter),
                            'Weaned',
                            speciesOptions
                        )}
                        value={s.weaned}
                        state={s.weanedState}
                        testId="stat-weaned"
                    />
                )}
            </div>

            {/* Sex distribution: based on the recorded born sex counts only. */}
            <div className="mt-4">
                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-dark-text-muted">
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
                                    {s[key] !== null && s[key] !== undefined && s.sexSum > 0
                                        ? `${Math.round((s[key] / s.sexSum) * 100)}%`
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

            {/* Outcome categories are displayed as recorded/calculated.
                This display does not change any litter values or Overview totals. */}
            {s.totalBorn !== null && s.totalBorn !== undefined && (
                <div className="mt-4">
                    <div className="mb-1 text-xs font-medium text-gray-500 dark:text-dark-text-muted">
                        Litter outcome
                    </div>

                    <LitterOutcomeBar
                        totalBorn={s.totalBorn}
                        stillborn={s.stillborn}
                        postnatal={s.postnatal}
                        culls={s.culls}
                        surviving={s.surviving}
                    />

                    <div className="mt-1 flex flex-wrap justify-between gap-x-3 gap-y-1 text-[11px] text-gray-600 dark:text-dark-text-secondary">
                        <span>Stillborn: {s.stillborn ?? '—'}</span>
                        <span>Losses: {s.postnatal ?? '—'}</span>
                        <span>Culls: {s.culls ?? '—'}</span>
                        <span>Surviving: {s.surviving ?? '—'}</span>
                    </div>
                </div>
            )}

            {/* Breakdown: these are the recorded litter figures, not Overview-adjusted figures. */}
            <Divider>
                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-dark-text-muted">
                    Breakdown
                </div>

                <div className="divide-y divide-gray-100 dark:divide-dark-border">
                    <BreakdownToggle
                        title="Born"
                        total={s.totalBorn}
                        bySex={bornBySex}
                    />

                    <BreakdownToggle
                        title={stillbornTitle}
                        total={s.stillborn}
                        bySex={stillbornBySex}
                    />

                    <BreakdownToggle
                        title={lossesTitle}
                        total={s.postnatal}
                        bySex={s.lossesBySex}
                        note={s.culls > 0 ? 'Excludes culls' : undefined}
                    />

                    {s.culls !== null && s.culls !== undefined && (
                        <BreakdownToggle
                            title="Culls"
                            total={s.culls}
                            bySex={s.cullsBySex || [null, null, null]}
                        />
                    )}

                    {s.liveBorn !== null && s.liveBorn !== undefined && (
                        <BreakdownToggle
                            title={eggLaying ? 'Live hatched' : 'Live born'}
                            total={s.liveBorn}
                            bySex={liveBornBySex}
                            note="After stillborn / non-viable outcomes"
                        />
                    )}

                    <BreakdownToggle
                        title="Surviving"
                        total={s.surviving}
                        bySex={[null, null, null]}
                        note="After recorded stillborn and postnatal losses"
                    />

                    {isBorn && (
                        <BreakdownToggle
                            title={getLitterFieldLabel(
                                'litterSizeWeaned',
                                getLitterSpecies(litter),
                                'Weaned',
                                speciesOptions
                            )}
                            total={s.weaned}
                            bySex={[null, null, null]}
                        />
                    )}
                </div>
            </Divider>

            {/* Survival statistics */}
            <Divider>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-dark-text-muted">
                            {eggLaying ? 'Live hatched' : 'Live born'}
                        </span>

                        <span className="font-medium text-gray-900 dark:text-dark-text">
                            {s.liveBorn === null || s.liveBorn === undefined
                                ? <Muted>Not recorded</Muted>
                                : s.liveBorn}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-dark-text-muted">
                            {eggLaying
                                ? 'Survival to independence'
                                : 'Survival to weaning'}
                        </span>

                        <span className="font-medium text-gray-900 dark:text-dark-text">
                            {s.survivalPct !== null && s.survivalPct !== undefined
                                ? `${s.survivalPct}%`
                                : s.weanedState === 'pending'
                                    ? <Muted>Pending weaning</Muted>
                                    : <Muted>Not recorded</Muted>}
                        </span>
                    </div>
                </div>
            </Divider>
        </Panel>
    );
}
