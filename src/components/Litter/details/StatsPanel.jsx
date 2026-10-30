import React from 'react';
import { computeLitterStats } from './helpers';
import { Panel, Muted } from './ui';
import { Big, BreakdownToggle, SEX } from './StatsParts';

const Divider = ({ children }) => (
    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border">{children}</div>
);

export default function StatsPanel({ litter, status }) {
    const s = computeLitterStats(litter, status);
    const isBorn = status === 'born';

    if (!isBorn && s.totalBorn === null && !s.sexRecorded && !s.anyLossRecorded) {
        return (
            <Panel title="Litter statistics" testId="stats-panel">
                <p className="text-sm text-gray-400 dark:text-dark-text-muted py-6 text-center">
                    {status === 'planned' ? 'Planned — no offspring recorded yet.' : 'No offspring recorded yet.'}
                </p>
            </Panel>
        );
    }

    const pct = (v) => (s.sexSum > 0 ? Math.round(((v || 0) / s.sexSum) * 100) : 0);
    const st = (v) => (v === null ? 'missing' : 'value');

    return (
        <Panel title="Litter statistics" testId="stats-panel">
            <div className="grid grid-cols-3 gap-y-4 gap-x-2">
                <Big label="Total born" value={s.totalBorn} state={st(s.totalBorn)} testId="stat-born" />
                <Big label="Males" value={s.male} state={st(s.male)} testId="stat-males" />
                <Big label="Females" value={s.female} state={st(s.female)} testId="stat-females" />
                <Big label="Unknown" value={s.unknown} state={st(s.unknown)} testId="stat-unknown" />
                <Big label="Surviving" value={s.surviving} state={st(s.surviving)} testId="stat-surviving" />
                <Big label="Weaned" value={s.weaned} state={s.weanedState} testId="stat-weaned" />
            </div>
            {s.sexExcludesLosses && s.sexRecorded && (
                <p className="mt-2 text-[11px] text-gray-400 dark:text-dark-text-muted">Sex counts exclude the losses you extracted from the total.</p>
            )}

            <div className="mt-4">
                <div className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">Sex distribution</div>
                {s.sexSum > 0 ? (
                    <>
                        <div
                            className="flex h-2.5 w-full rounded-full overflow-hidden bg-gray-100 dark:bg-dark-surface"
                            role="img"
                            aria-label={`Males ${pct(s.male)}%, females ${pct(s.female)}%, unknown ${pct(s.unknown)}%`}
                        >
                            {SEX.map(({ key, bar }) => (s[key] ? <div key={key} className={bar} style={{ width: `${(s[key] / s.sexSum) * 100}%` }} /> : null))}
                        </div>
                        <div className="flex justify-between mt-1 text-[11px] text-gray-600 dark:text-dark-text-secondary">
                            {SEX.map(({ key, label, Icon, icon }) => (
                                <span key={key} className="inline-flex items-center gap-1"><Icon size={11} className={icon} />{pct(s[key])}% {label.toLowerCase()}</span>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-dark-surface" aria-label="No sex data recorded" />
                )}
            </div>

            <Divider>
                <div className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">Losses</div>
                {s.anyLossRecorded ? (
                    <div className="divide-y divide-gray-100 dark:divide-dark-border">
                        <BreakdownToggle title="Stillborn" total={s.stillborn} bySex={s.stillbornBySex} />
                        <BreakdownToggle title="Postnatal losses" total={s.postnatal} bySex={s.lossesBySex} note={s.culls ? 'Excludes culls' : undefined} />
                        {s.culls !== null && <BreakdownToggle title="Culls" total={s.culls} bySex={[null, null, null]} />}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 dark:text-dark-text-muted">{isBorn ? 'No losses recorded.' : 'Not recorded.'}</p>
                )}
            </Divider>

            <Divider>
                <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-dark-text-muted">Live born</span>
                        <span className="font-medium text-gray-900 dark:text-dark-text">{s.liveBorn === null ? <Muted>Not recorded</Muted> : s.liveBorn}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-dark-text-muted">Survival to weaning</span>
                        <span className="font-medium text-gray-900 dark:text-dark-text">
                            {s.survivalPct !== null
                                ? `${s.survivalPct}%`
                                : s.weanedState === 'pending' ? <Muted>Pending weaning</Muted> : <Muted>Not recorded</Muted>}
                        </span>
                    </div>
                </div>
            </Divider>
        </Panel>
    );
}
