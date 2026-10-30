import React from 'react';
import { formatDate } from '../../../utils/dateFormatter';
import { buildTimeline } from './helpers';
import { Panel } from './ui';

export default function TimelinePanel({ litter, status }) {
    const steps = buildTimeline(litter, status);
    return (
        <Panel title="Reproductive timeline" testId="timeline-panel">
            <ol className="relative ml-2">
                {steps.map((s, i) => {
                    const last = i === steps.length - 1;
                    const dot = s.done
                        ? 'bg-green-500 border-green-500'
                        : s.missing
                            ? 'bg-white dark:bg-dark-card-bg border-gray-300 dark:border-dark-border border-dashed'
                            : 'bg-white dark:bg-dark-card-bg border-primary dark:border-dark-primary';
                    return (
                        <li key={s.key} className="relative pl-6 pb-5 last:pb-0" data-testid={`timeline-${s.key}`}>
                            {!last && <span className="absolute left-[5px] top-3 bottom-0 w-px bg-gray-200 dark:bg-dark-border" aria-hidden="true" />}
                            <span className={`absolute left-0 top-1 w-[11px] h-[11px] rounded-full border-2 ${dot}`} aria-hidden="true" />
                            <div className={`text-sm font-medium ${s.missing ? 'text-gray-400 dark:text-dark-text-muted' : 'text-gray-900 dark:text-dark-text'}`}>{s.label}</div>
                            <div className="text-xs text-gray-500 dark:text-dark-text-muted">
                                {s.date ? formatDate(s.date) : s.note || 'Not recorded'}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </Panel>
    );
}
