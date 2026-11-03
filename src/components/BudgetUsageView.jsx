import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../utils/apiClient';
import { formatMoney } from './shared/FinanceOverviewBody';
import BudgetUsageList from './BudgetUsageList';

// Budget "Usage" view: what you USED (valued at cost per unit), as opposed to the Spending view,
// which is what you PAID. The two are never added together.

export default function BudgetUsageView({ showModalMessage }) {
    const thisYear = new Date().getFullYear();
    const [year, setYear] = useState(String(thisYear));
    const [state, setState] = useState({ status: 'loading', data: null });

    const load = useCallback(() => {
        setState({ status: 'loading', data: null });
        const query = year === 'all' ? '' : `?year=${encodeURIComponent(year)}`;
        apiClient.get(`/supplies/usage${query}`)
            .then(res => setState({ status: 'ready', data: res.data }))
            .catch(() => setState({ status: 'error', data: null }));
    }, [year]);

    useEffect(() => { load(); }, [load]);

    const years = useMemo(() => {
        const list = [];
        for (let y = thisYear; y >= thisYear - 5; y--) list.push(String(y));
        return list;
    }, [thisYear]);

    const handleDelete = async (entry) => {
        if (!window.confirm(`Remove this usage entry for ${entry.supplyName || 'this supply'} and put the quantity back in stock?`)) return;
        try {
            await apiClient.delete(`/supplies/usage/${entry._id}`);
            load();
        } catch (err) {
            if (showModalMessage) showModalMessage('Error', 'Could not remove this usage entry.');
        }
    };

    const summary = state.data?.summary;
    const entries = state.data?.entries || [];

    return (
        <div className="space-y-4" data-testid="budget-usage-view">
            <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-lg p-3 sm:p-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary max-w-xl">
                        Usage shows the supplies you have <strong>used</strong>, valued at cost per unit. It is separate from
                        Spending, which is what you <strong>paid</strong>, so the two are never added together.
                    </p>
                    <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-dark-text-secondary">
                        Year:
                        <select
                            value={year} onChange={e => setYear(e.target.value)}
                            className="border border-gray-300 dark:border-dark-text-muted bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text rounded-lg px-2 py-1 text-sm"
                            data-testid="usage-year"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                            <option value="all">All time</option>
                        </select>
                    </label>
                </div>

                {state.status === 'loading' && <p className="text-sm text-gray-500 dark:text-dark-text-muted">Loading usage...</p>}
                {state.status === 'error' && (
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                        Couldn&apos;t load usage. <button type="button" className="underline" onClick={load}>Retry</button>
                    </p>
                )}

                {state.status === 'ready' && summary && (
                    <>
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <div className="rounded-lg bg-gray-50 dark:bg-dark-surface px-3 py-2" data-testid="usage-total">
                                <div className="text-xs text-gray-500 dark:text-dark-text-muted">Supplies used</div>
                                <div className="text-lg font-semibold text-gray-900 dark:text-dark-text">{formatMoney(summary.totalCost)}</div>
                            </div>
                            <div className="rounded-lg bg-gray-50 dark:bg-dark-surface px-3 py-2">
                                <div className="text-xs text-gray-500 dark:text-dark-text-muted">Uses recorded</div>
                                <div className="text-lg font-semibold text-gray-900 dark:text-dark-text">{summary.count}</div>
                            </div>
                        </div>
                        {summary.unpricedCount > 0 && (
                            <p className="text-sm text-amber-700 dark:text-amber-400" data-testid="usage-unpriced">
                                {summary.unpricedSupplies.length} suppl{summary.unpricedSupplies.length === 1 ? 'y has' : 'ies have'} no price
                                ({summary.unpricedSupplies.join(', ')}), so costs are understated. Set a cost per unit on the Supplies page.
                            </p>
                        )}
                    </>
                )}
            </div>

            {state.status === 'ready' && (
                <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-lg p-3 sm:p-6">
                    <BudgetUsageList entries={entries} onDelete={handleDelete} />
                </div>
            )}
        </div>
    );
}
