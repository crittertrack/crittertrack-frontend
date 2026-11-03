import React, { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import FinanceOverviewBody from './FinanceOverviewBody';
import UseSupplyForm from './UseSupplyForm';
import ManualExpenseForm from './ManualExpenseForm';

// Money summary for one litter (kind="litter", id = litter_id_public). Data comes from
// GET /budget/overview/litter/:id. Animals have no finance card.
// This file handles loading/error/hidden states; FinanceOverviewBody renders the numbers.

const buttonCls = 'text-xs px-2 py-1 rounded-lg border border-gray-300 dark:border-dark-text-muted text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-hover';

// bare: no outer border or "Finances" title (used where the page already has a Finances tab);
// toolbarExtra: extra controls (e.g. a currency picker) shown at the right of the toolbar.
export default function FinanceOverviewCard({ kind, id, className = '', bare = false, toolbarExtra = null }) {
    const [state, setState] = useState({ status: 'loading', data: null });
    const [attempt, setAttempt] = useState(0);
    const [showUseForm, setShowUseForm] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);

    useEffect(() => {
        if (!id || kind !== 'litter') return undefined;
        let cancelled = false;
        setState({ status: 'loading', data: null });
        apiClient.get(`/budget/overview/${kind}/${encodeURIComponent(id)}`)
            .then(res => { if (!cancelled) setState({ status: 'ready', data: res.data }); })
            .catch(err => {
                if (cancelled) return;
                // 404 = not your record (e.g. someone else's litter): show nothing rather than an error.
                const notMine = err?.response?.status === 404;
                setState({ status: notMine ? 'hidden' : 'error', data: null });
            });
        return () => { cancelled = true; };
    }, [kind, id, attempt]);

    if (!id || state.status === 'hidden') return null;

    const refresh = () => setAttempt(a => a + 1);

    return (
        <section
            data-testid="finance-overview"
            className={bare ? className : `rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4 ${className}`}
        >
            <div className="flex flex-wrap items-center gap-2 mb-3">
                {!bare && <Wallet size={18} className="text-gray-400 dark:text-dark-text-muted" />}
                {!bare && <h3 className="font-semibold text-gray-900 dark:text-dark-text">Finances</h3>}
                {state.status === 'ready' && (
                    <div className={`${bare ? '' : 'ml-auto '}flex flex-wrap items-center gap-2`}>
                        {kind === 'litter' && !showUseForm && (
                            <button type="button" onClick={() => setShowUseForm(true)} className={buttonCls} data-testid="open-use-supply">
                                Use supplies
                            </button>
                        )}
                        {kind === 'litter' && !showExpenseForm && (
                            <button type="button" onClick={() => setShowExpenseForm(true)} className={buttonCls} data-testid="open-manual-expense">
                                Add expense
                            </button>
                        )}
                    </div>
                )}
                {toolbarExtra && <div className="ml-auto" data-testid="finance-toolbar-extra">{toolbarExtra}</div>}
            </div>
            {showUseForm && (
                <div className="mb-3">
                    <UseSupplyForm
                        litterId={id}
                        onCancel={() => setShowUseForm(false)}
                        onDone={() => { setShowUseForm(false); refresh(); }}
                    />
                </div>
            )}
            {showExpenseForm && kind === 'litter' && (
                <div className="mb-3">
                    <ManualExpenseForm
                        litterId={id}
                        onCancel={() => setShowExpenseForm(false)}
                        onDone={() => { setShowExpenseForm(false); refresh(); }}
                    />
                </div>
            )}
            {state.status === 'loading' && (
                <p className="text-sm text-gray-500 dark:text-dark-text-muted">Loading finances...</p>
            )}
            {state.status === 'error' && (
                <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
                    Couldn&apos;t load finances.{' '}
                    <button type="button" className="underline" onClick={refresh}>Retry</button>
                </div>
            )}
            {state.status === 'ready' && <FinanceOverviewBody data={state.data} />}
        </section>
    );
}
