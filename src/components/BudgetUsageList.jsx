import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatMoney } from './shared/FinanceOverviewBody';

// List of individual usage entries for the Budget "Usage" view.

const SOURCE_LABELS = {
    feeding: 'Feeding',
    enclosure_task: 'Enclosure task',
    litter: 'Litter',
    animal: 'Animal',
    other: 'Other',
};

const formatDate = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
};

export default function BudgetUsageList({ entries, onDelete }) {
    if (entries.length === 0) {
        return (
            <p className="text-sm text-gray-500 dark:text-dark-text-muted" data-testid="usage-empty">
                No usage recorded for this period. Usage is saved when you mark an animal as fed with a supply,
                complete an enclosure task that uses supplies, or use supplies for a litter.
            </p>
        );
    }

    return (
        <ul className="divide-y divide-gray-100 dark:divide-dark-border" data-testid="usage-list">
            {entries.map(entry => (
                <li key={entry._id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-dark-text truncate">
                            {entry.supplyName || 'Unknown supply'} · {entry.quantity}{entry.unit ? ` ${entry.unit}` : ''}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-dark-text-muted truncate">
                            {formatDate(entry.date)} · {SOURCE_LABELS[entry.source] || 'Other'}
                            {entry.animalId ? ` · ${entry.animalId}` : ''}
                            {entry.litterId ? ` · ${entry.litterId}` : ''}
                            {entry.note ? ` · ${entry.note}` : ''}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-gray-900 dark:text-dark-text">
                            {entry.priced ? formatMoney(entry.cost) : <span className="text-amber-600 dark:text-amber-400">no price</span>}
                        </span>
                        <button
                            type="button" onClick={() => onDelete(entry)}
                            className="text-red-400 hover:text-red-600 p-1" title="Remove and restore stock" aria-label="Remove usage entry"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
