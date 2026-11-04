import React, { useCallback, useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import apiClient from '../utils/apiClient';
import { downloadBlob } from '../utils/nativeDownload';
import { formatMoney } from './shared/FinanceOverviewBody';

// Budget "Year-end" view: money in and out for one calendar year, from your Budget transactions
// (sales and income vs purchases and expenses). Supplies you have used are not included, because
// buying them is already counted as spending.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CATEGORY_LABELS = {
    food: 'Food & supplies',
    housing: 'Housing & bedding',
    medical: 'Medical & vet',
    equipment: 'Equipment & setup',
    purchase: 'Animal purchases',
    other: 'Other',
};

export default function BudgetYearEndView() {
    const [years, setYears] = useState(null); // null while loading
    const [year, setYear] = useState('');
    const [state, setState] = useState({ status: 'loading', data: null });

    const loadYears = useCallback(() => {
        setState({ status: 'loading', data: null });
        apiClient.get('/budget/report/year/all')
            .then(res => {
                const list = Array.isArray(res.data?.years) ? res.data.years : [];
                setYears(list);
                if (list.length === 0) { setState({ status: 'ready', data: null }); return; }
                setYear(prev => (prev && list.map(String).includes(String(prev)) ? prev : String(list[0])));
            })
            .catch(() => setState({ status: 'error', data: null }));
    }, []);

    useEffect(() => { loadYears(); }, [loadYears]);

    useEffect(() => {
        if (!year) return;
        setState({ status: 'loading', data: null });
        apiClient.get(`/budget/report/year/${encodeURIComponent(year)}`)
            .then(res => setState({ status: 'ready', data: res.data }))
            .catch(() => setState({ status: 'error', data: null }));
    }, [year]);

    const d = state.data;
    const months = d ? MONTHS.map((label, i) => ({ label, ...(d.byMonth?.[i + 1] || { cost: 0, revenue: 0, net: 0 }) })) : [];
    const categories = d ? Object.entries(d.costByCategory || {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]) : [];

    const downloadReport = () => {
        if (!d) return;
        const money = (n) => Number(n || 0).toFixed(2);
        const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
        const rows = [
            [`Year-end report ${year}`],
            [],
            ['Month', 'Earned', 'Spent', 'Net'],
            ...months.map(m => [m.label, money(m.revenue), money(m.cost), money(m.net)]),
            ['Total', money(d.totalRevenue), money(d.totalCost), money(d.net)],
            [],
            ['Spent by category', 'Amount'],
            ...categories.map(([cat, amount]) => [CATEGORY_LABELS[cat] || cat, money(amount)]),
        ];
        const csv = rows.map(r => r.map(cell).join(',')).join('\n');
        downloadBlob(new Blob([csv], { type: 'text/csv' }), `year_end_${year}.csv`);
    };

    return (
        <div className="space-y-4" data-testid="budget-year-end-view">
            <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-lg p-3 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary max-w-xl">
                        Year-end shows what came in and went out over a calendar year, from your Budget transactions.
                        Supplies you used are not counted here, because buying them is already part of Spending.
                    </p>
                    {years && years.length > 0 && (
                        <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-dark-text-secondary">
                            Year:
                            <select
                                value={year} onChange={e => setYear(e.target.value)}
                                className="border border-gray-300 dark:border-dark-text-muted bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text rounded-lg px-2 py-1 text-sm"
                                data-testid="year-end-year"
                            >
                                {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                            </select>
                        </label>
                        <button
                            type="button"
                            onClick={downloadReport}
                            disabled={!d}
                            data-testid="year-end-download"
                            className="flex items-center gap-1 px-3 py-1 bg-gray-600 dark:bg-dark-surface hover:bg-gray-700 dark:hover:bg-dark-surface-hover text-white rounded-lg transition text-sm disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            Download CSV
                        </button>
                        </div>
                    )}
                </div>

                {state.status === 'loading' && <p className="text-sm text-gray-500 dark:text-dark-text-muted">Loading report...</p>}
                {state.status === 'error' && (
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                        Couldn&apos;t load the report. <button type="button" className="underline" onClick={loadYears}>Retry</button>
                    </p>
                )}
                {state.status === 'ready' && !d && (
                    <p className="text-sm text-gray-500 dark:text-dark-text-muted" data-testid="year-end-empty">No transactions recorded yet, so there is nothing to report.</p>
                )}

                {state.status === 'ready' && d && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                            {[
                                ['Earned', formatMoney(d.totalRevenue), 'year-end-earned', `${d.saleCount} sale${d.saleCount === 1 ? '' : 's'}`],
                                ['Spent', formatMoney(d.totalCost), 'year-end-spent', `${d.costCount} cost${d.costCount === 1 ? '' : 's'}`],
                                ['Net', `${d.net > 0 ? '+' : ''}${formatMoney(d.net)}`, 'year-end-net', d.net >= 0 ? 'Profit' : 'Loss'],
                                ['Average sale', d.saleCount > 0 ? formatMoney(d.totalRevenue / d.saleCount) : '-', 'year-end-average', 'Earned / sales'],
                            ].map(([label, value, testId, hint]) => (
                                <div key={testId} className="rounded-lg bg-gray-50 dark:bg-dark-surface px-3 py-2" data-testid={testId}>
                                    <div className="text-xs text-gray-500 dark:text-dark-text-muted">{label}</div>
                                    <div className="text-lg font-semibold text-gray-900 dark:text-dark-text">{value}</div>
                                    <div className="text-[11px] text-gray-500 dark:text-dark-text-muted">{hint}</div>
                                </div>
                            ))}
                        </div>

                        <div className="overflow-x-auto" data-testid="year-end-months">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 dark:text-dark-text-muted">
                                        <th className="py-1">Month</th>
                                        <th className="py-1 text-right">Earned</th>
                                        <th className="py-1 text-right">Spent</th>
                                        <th className="py-1 text-right">Net</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {months.map(m => (
                                        <tr key={m.label} className="border-t border-gray-100 dark:border-dark-border">
                                            <td className="py-1">{m.label}</td>
                                            <td className="py-1 text-right">{formatMoney(m.revenue)}</td>
                                            <td className="py-1 text-right">{formatMoney(m.cost)}</td>
                                            <td className="py-1 text-right">{formatMoney(m.net)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-gray-200 dark:border-dark-border font-semibold">
                                        <td className="py-1">Total</td>
                                        <td className="py-1 text-right">{formatMoney(d.totalRevenue)}</td>
                                        <td className="py-1 text-right">{formatMoney(d.totalCost)}</td>
                                        <td className="py-1 text-right">{formatMoney(d.net)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {categories.length > 0 && (
                            <div data-testid="year-end-categories">
                                <p className="text-sm font-semibold text-gray-800 dark:text-dark-text mb-1">Spent by category</p>
                                <ul className="text-sm text-gray-700 dark:text-dark-text-secondary space-y-0.5">
                                    {categories.map(([cat, amount]) => (
                                        <li key={cat} className="flex justify-between gap-3">
                                            <span>{CATEGORY_LABELS[cat] || cat}</span>
                                            <span>{formatMoney(amount)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
