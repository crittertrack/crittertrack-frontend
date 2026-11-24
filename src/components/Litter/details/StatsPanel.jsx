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
    <div className="mt-4 border-t border-gray-100 pt-3 dark:border-dark-border">
        {children}
    </div>
);

/**
 * Displays the outcome buckets as proportions of the original total born.
 * Culls are a subset of losses, so the bar uses postnatal losses excluding
 * culls plus culls as separate, non-overlapping segments.
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

    const valueState = (value) =>
        value === null || value === undefined ? 'missing' : 'value';

    const bornBySex = [s.male, s.female, s.unknown];
    const stillbornBySex = s.stillbornBySex || [null, null, null];

    // A per-sex live-born count is only knowable where both the original
    // born count and the matching stillborn count have been recorded.
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

    // Cull counts are part of the helper's lossesBySex values. Subtract them
    // here so the Postnatal losses row excludes culls, just like s.postnatal.
    const cullsBySex = s.culls === null || s.culls === undefined
        ? [0, 0, 0]
        : (s.cullsBySex || [null, null, null]);

    const lossesBySex = s.lossesBySex || [null, null, null];
    const postnatalBySex = lossesBySex.map((lossCount, index) => {
        const cullCount = cullsBySex[index];

        if (
            lossCount === null || lossCount === undefined ||
            cullCount === null || cullCount === undefined
        ) {
            return null;
        }

        return Math.max(0, Number(lossCount) - Number(cullCount));
    });

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
            Number(bornCount) - Number(stillbornCount) - Number(lossCount)
        );
    });

    const stillbornTitle = eggLaying
        ? 'Unhatched / non-viable eggs'
        : 'Stillborn';
    const lossesTitle = eggLaying
        ? 'Post-hatch losses'
        : 'Postnatal losses';
    const liveTitle = eggLaying ? 'Live hatched' : 'Live born';

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

            {/* Sex distribution uses only the original born sex counts. */}
            <div className="mt-4">
                <div className="mb-1 text-xs font-bold text-gray-500 dark:text-dark-text-muted">
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

            
{/* Outcome bar. Culls are separated from postnatal losses. */}
{s.totalBorn !== null && s.totalBorn !== undefined && (
    <div className="mt-4">
        <div className="mb-1 text-xs font-bold text-gray-500 dark:text-dark-text-muted">
            Litter outcome
        </div>

        <LitterOutcomeBar
            totalBorn={s.totalBorn}
            stillborn={s.stillborn}
            postnatal={s.postnatal}
            culls={s.culls}
            surviving={s.surviving}
        />

        
<div className="mt-1 flex justify-between text-[11px] text-gray-600 dark:text-dark-text-secondary">
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


            {/* Compact rounded breakdown rows */}
            <Divider>
                <div className="mb-2 text-sm font-bold text-gray-500 dark:text-dark-text-muted">
                    Breakdown
                </div>

                <div className="space-y-1.5">

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
        </Panel>
    );
}
