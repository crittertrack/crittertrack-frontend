import React from 'react';
import { Edit } from 'lucide-react';
import { Panel, Muted, isBlank } from './ui';

export default function ObjectivesPanel({ litter, onEdit }) {
    const objectives = Array.isArray(litter.breedingObjectives) ? litter.breedingObjectives : [];
    return (
        <Panel
            title="Breeding objectives"
            testId="objectives-panel"
            action={(
                <button
                    type="button"
                    onClick={onEdit}
                    title="Edit objectives"
                    aria-label="Edit breeding objectives"
                    className="p-1.5 rounded-md text-gray-500 dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-surface"
                >
                    <Edit size={15} />
                </button>
            )}
        >
            <div className="space-y-4 text-sm">
                <div>
                    {objectives.length ? (
                        <div className="flex flex-wrap gap-2">
                            {objectives.map(o => (
                                <span key={o} className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">{o}</span>
                            ))}
                        </div>
                    ) : <Muted>No objectives set.</Muted>}
                </div>
                <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">Notes</div>
                    {isBlank(litter.objectivesNotes)
                        ? <Muted>Not recorded</Muted>
                        : <p className="whitespace-pre-wrap text-gray-800 dark:text-dark-text">{litter.objectivesNotes}</p>}
                </div>
                <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">Objective evaluation</div>
                    {isBlank(litter.objectivesEvaluation)
                        ? <Muted>Not evaluated yet</Muted>
                        : <p className="whitespace-pre-wrap text-gray-800 dark:text-dark-text">{litter.objectivesEvaluation}</p>}
                </div>
            </div>
        </Panel>
    );
}
