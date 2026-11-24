
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

const LitterOutcomeBar = ({ totalBorn, stillborn, postnatal, culls, surviving }) => {
    const totalBornNum = totalBorn || 0;
    const stillbornPct = totalBornNum > 0 ? Math.round((stillborn / totalBornNum) * 100) : 0;
    const postnatalPct = totalBornNum > 0 ? Math.round((postnatal / totalBornNum) * 100) : 0;
    const cullsPct = totalBornNum > 0 ? Math.round((culls / totalBornNum) * 100) : 0;
    const survivingPct = totalBornNum > 0 ? Math.round((surviving / totalBornNum) * 100) : 0;

    const colors = {
        surviving: 'bg-green-500',
        stillborn: 'bg-red-500',
        postnatal: 'bg-orange-500',
        culls: 'bg-gray-500',
    };

    return (
        <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-gray-100 dark:bg-dark-surface">
            <div style={{ width: `${survivingPct}%`, backgroundColor: colors.surviving }} aria-label="Surviving" />
            <div style={{ width: `${stillbornPct}%`, backgroundColor: colors.stillborn }} aria-label="Stillborn" />
            <div style={{ width: `${postnatalPct}%`, backgroundColor: colors.postnatal }} aria-label="Postnatal losses" />
            <div style={{ width: `${cullsPct}%`, backgroundColor: colors.culls }} aria-label="Culls" />
        </div>
    );
};

const LitterOutcomeLegend = ({ totalBorn, stillborn, postnatal, culls, surviving }) => {
    const totalBornNum = totalBorn || 0;

    const items = [
        { label: 'Surviving', count: surviving, pct: totalBornNum > 0 ? Math.round((surviving / totalBornNum) * 100) : 0, color: 'bg-green-500' },
        { label: 'Stillborn', count: stillborn, pct: totalBornNum > 0 ? Math.round((stillborn / totalBornNum) * 100) : 0, color: 'bg-red-500' },
        { label: 'Postnatal losses', count: postnatal, pct: totalBornNum > 0 ? Math.round((postnatal / totalBornNum) * 100) : 0, color: 'bg-orange-500' },
        culls !== null ? { label: 'Culls', count: culls, pct: totalBornNum > 0 ? Math.round((culls / totalBornNum) * 100) : 0, color: 'bg-gray-500' } : null,
    ].filter(Boolean);

    return (
        <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                    <span className={item.color} width={12} height={12} aria-hidden="true" />
                    <span>{item.label}: {item.count === null ? '—' : item.count}{item.pct > 0 ? ` (${item.pct}%)` : ''}</span>
                </span>
            ))}
        </div>
    );
};

export default function StatsPanel({ litter, status, speciesOptions = [] }) {
    const s = computeLitterStats(litter, status);
    const isBorn = status === 'born';
    const eggLaying = isEggLayingSpecies(
        getLitterSpecies(litter),
        speciesOptions
    );

    if (!isBorn && s.totalBorn === null && !s.sexRecorded && !s.anyLossRecorded) {
        return (
            <Panel title="Litter statistics" testId="stats-panel">
                <p className="text-sm text-gray-400 dark:text-dark-text-muted py-6 text-center">
                    {status === 'planned'
                        ? 'Planned — no offspring recorded yet.'
                        : 'No offspring recorded yet.'}
                </p>
            </Panel>
        );
    }

    const st = (v) => (v === null ? 'missing' : 'value');

    // Compute breakdown rows in the specified order
    const breakdownRows = [];

    // 1. Born
    breakdownRows.push({
        label: 'Born',
        total: s.totalBorn,
        male: s.male,
        female: s.female,
        unknown: s.unknown,
        computedTotal: s.totalBorn,
    });

    // 2. Stillborn
    breakdownRows.push({
        label: 'Stillborn',
        total: s.stillborn,
        male: s.stillbornBySex[0],
        female: s.stillbornBySex[1],
        unknown: s.stillbornBySex[2],
        computedTotal: s.stillborn,
    });

    // 3. Postnatal losses
    breakdownRows.push({
        label: 'Postnatal losses',
        total: s.postnatal,
        male: s.lossesBySex[0],
        female: s.lossesBySex[1],
        unknown: s.lossesBySex[2],
        computedTotal: s.postnatal,
    });

    // 4. Culls (when applicable)
    if (s.culls !== null && s.cullSexSum > 0) {
        breakdownRows.push({
            label: 'Culls',
            total: s.culls,
            male: s.cullsBySex[0],
            female: s.cullsBySex[1],
            unknown: s.cullsBySex[2],
            computedTotal: s.cullSexSum,
        });
    }

    // 5. Surviving
    breakdownRows.push({
        label: 'Surviving',
        total: s.surviving,
        male: null,
        female: null,
        unknown: null,
        computedTotal: s.surviving,
    });

    // 6. Weaned
    breakdownRows.push({
        label: 'Weaned',
        total: s.weaned,
        male: null,
        female: null,
        unknown: null,
        computedTotal: s.weaned,
    });

    return (
        <Panel title="Litter statistics" testId="stats-panel">
            {/* Main statistics - three prominent stats: Total born, Males/Females, Weaned */}
            <div className="grid grid-cols-3 gap-y-4 gap-x-2">
                <Big
                    label={getLitterFieldLabel(
                        'litterSizeBorn',
                        getLitterSpecies(litter),
                        'Total born',
                        speciesOptions
                    )}
                    value={s.totalBorn}
                    state={st(s.totalBorn)}
                    testId="stat-born"
                />

                <Big
                    label="Surviving"
                    value={s.surviving}
                    state={st(s.surviving)}
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

            {isBorn && (
                <p className="mt-2 text-[11px] text-gray-400 dark:text-dark-text-muted">
                    
                </p>
            )}

            {/* Sex distribution - percentages calculated against total born */}
            <div className="mt-4">
                <div className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">
                    Sex distribution
                </div>

                {s.sexSum > 0 ? (
                    <>
                        <div
                            className="flex h-2.5 w-full rounded-full overflow-hidden bg-gray-100 dark:bg-dark-surface"
                            role="img"
                            aria-label={`Males ${s.male !== null ? Math.round((s.male / s.sexSum) * 100) : 0}%, females ${s.female !== null ? Math.round((s.female / s.sexSum) * 100) : 0}%, unknown ${s.unknown !== null ? Math.round((s.unknown / s.sexSum) * 100) : 0}%`}
                        >
                            {SEX.map(({ key, bar }) =>
                                s[key] ? (
                                    <div
                                        key={key}
                                        className={bar}
                                        style={{
                                            width: `${(s[key] / s.sexSum) * 100}%`
                                        }}
                                    />
                                ) : null
                            )}
                        </div>

                        <div className="flex justify-between mt-1 text-[11px] text-gray-600 dark:text-dark-text-secondary">
                            {SEX.map(({ key, label, Icon, icon }) => (
                                <span
                                    key={key}
                                    className="inline-flex items-center gap-1"
                                >
                                    <Icon size={11} className={icon} />
                                    {(s[key] / s.sexSum * 100) | 0}% {label.toLowerCase()}
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

             {/* Distribution bar: stillborn, losses, culls, surviving */}
{s.totalBorn !== null && (
    <div className="mt-4">
        <div className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">
            Distribution
        </div>
        <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-gray-100 dark:bg-dark-surface" aria-label="Litter distribution">
            {/* Stillborn section */}
            <div
                className="bg-red-500"
                style={{ width: `{s.totalBorn > 0 ? (s.stillborn / s.totalBorn) * 100 : 0}%` }}
                aria-label="Stillborn"
            />
            {/* Losses section (excluding culls) */}
            <div
                className="bg-orange-500"
                style={{ width: `{s.totalBorn > 0 ? (s.postnatal / s.totalBorn) * 100 : 0}%` }} aria-label="Postnatal losses"
            />
            {/* Culls section */}
            {s.culls !== null && s.cullSexSum > 0 && (
                <div
                    className="bg-gray-500"
                    style={{ width: `{s.totalBorn > 0 ? (s.culls / s.totalBorn) * 100 : 0}%` }} aria-label="Culls"
                />
            )}
            {/* Surviving section */}
            <div
                className="bg-green-500"
                style={{ width: `{s.totalBorn > 0 ? (s.surviving / s.totalBorn) * 100 : 0}%` }} aria-label="Surviving"
            />
        </div>
        <div className="flex justify-between mt-1 text-[11px] text-gray-600 dark:text-dark-text-secondary">
            <span>Stillborn: {s.stillborn !== null ? s.stillborn : '—'}</span>
            <span>Losses: {s.postnatal !== null ? s.postnatal : '—'}</span>
            <span>Culls: {s.culls !== null ? s.culls : '—'}</span>
            <span>Surviving: {s.surviving !== null ? s.surviving : '—'}</span>
        </div>
    </div>
)}         

            {/* Losses and outcomes */}
            <Divider>
                <div className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">
                    {eggLaying ? 'Egg / hatchling losses' : 'Losses'}
                </div>

                {s.anyLossRecorded ? (
                    <div className="divide-y divide-gray-100 dark:divide-dark-border">
                        <BreakdownToggle
                            title={
                                eggLaying
                                    ? 'Unhatched / non-viable eggs'
                                    : 'Stillborn'
                            }
                            total={s.stillborn}
                            bySex={s.stillbornBySex}
                        />

                        <BreakdownToggle
                            title={
                                eggLaying
                                    ? 'Post-hatch losses'
                                    : 'Postnatal losses'
                            }
                            total={s.postnatal}
                            bySex={s.lossesBySex}
                            note={s.culls ? 'Excludes culls' : undefined}
                        />

                        {s.culls !== null && (
                            <BreakdownToggle
                                title="Culls"
                                total={s.culls}
                                bySex={[null, null, null]}
                            />
                        )}

                        {s.liveBorn !== null && (
                            <BreakdownToggle
                                title="Live"
                                total={s.liveBorn}
                                bySex={[s.male, s.female, s.unknown]}
                                note="Live born offspring"
                            />
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 dark:text-dark-text-muted">
                        {isBorn ? 'No losses recorded.' : 'Not recorded.'}
                    </p>
                )}

                {/* Cull sex distribution */}
                {s.cullSexRecorded && (
                    <div className="mt-3">
                        <div className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">
                            Cull distribution
                        </div>

                        <div
                            className="flex h-2.5 w-full rounded-full overflow-hidden bg-gray-100 dark:bg-dark-surface"
                            aria-label="Cull sex distribution"
                        >
                            {s.cullSexSum > 0 &&
                                SEX.map(({ key, bar }) =>
                                    s.cullsBySex[key] ? (
                                        <div
                                            key={key}
                                            className={bar}
                                            style={{
                                                width: `${(s.cullsBySex[key] / s.cullSexSum) * 100}%`
                                            }}
                                        />
                                    ) : null
                                )}
                        </div>
                    </div>
                )}
            </Divider>

            {/* Survival statistics */}
            <Divider>
                <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-dark-text-muted">
                            {eggLaying ? 'Live hatched' : 'Live born'}
                        </span>

                        <span className="font-medium text-gray-900 dark:text-dark-text">
                            {s.liveBorn === null
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
                            {s.survivalPct !== null
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

