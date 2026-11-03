import React from 'react';

// Numbers for the Finances card. Wording notes (agreed with the user): litters are never sold as a
// unit and most offspring are kept, so unsold offspring are NOT presented as a "loss". We lead with
// how much of the cost sales have paid back, and show kept offspring as "kept, no revenue".

export const formatMoney = (value) => {
    const code = (typeof localStorage !== 'undefined' && localStorage.getItem('budgetCurrency')) || 'USD';
    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(Number(value) || 0);
    } catch {
        return (Number(value) || 0).toFixed(2);
    }
};

const CATEGORY_LABELS = {
    food: 'Food & supplies',
    housing: 'Housing & bedding',
    medical: 'Medical & vet',
    equipment: 'Equipment & setup',
    purchase: 'Animal purchases',
    other: 'Other',
};

const OFFSPRING_LABELS = [
    ['sold', 'Sold'],
    ['booked', 'Booked'],
    ['available', 'Available'],
    ['kept', 'Kept'],
    ['deceased', 'Deceased'],
    ['cull', 'Culled'],
];
const STATUS_LABELS = Object.fromEntries(OFFSPRING_LABELS);

const Stat = ({ label, value, testId, hint }) => (
    <div className="rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface px-3 py-2" data-testid={testId}>
        <div className="text-xs text-gray-500 dark:text-dark-text-muted">{label}</div>
        <div className="mt-0.5 text-base font-semibold text-gray-900 dark:text-dark-text">{value}</div>
        {hint && <div className="text-[11px] text-gray-500 dark:text-dark-text-muted">{hint}</div>}
    </div>
);

// Price badge: green = paid, red = still due, gray = not applicable (no price / not tracked).
const BADGE_STYLES = {
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    due: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
    na: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const PriceBadge = ({ value, paid }) => {
    if (value == null) return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_STYLES.na}`}>-</span>;
    const tone = paid === true ? 'paid' : paid === false ? 'due' : 'na';
    return (
        <span data-tone={tone} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[tone]}`}>
            {formatMoney(value)}
        </span>
    );
};

export default function FinanceOverviewBody({ kind, data: d }) {
    const isLitter = kind === 'litter';
    const usage = d.usage;
    const categories = Object.entries(d.costByCategory || {}).filter(([, v]) => v > 0);
    const hasAnything = d.totalCost > 0 || d.totalRevenue > 0 || d.expectedRevenue > 0;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <Stat label="Spent" value={formatMoney(d.totalCost)} testId="finance-spent" />
                <Stat label="Earned from sales" value={formatMoney(d.totalRevenue)} testId="finance-earned" />
                {isLitter ? (
                    <>
                        <Stat
                            label="Cost recouped"
                            value={d.costRecoupedPercent == null ? '-' : `${d.costRecoupedPercent}%`}
                            hint={d.breakEvenRemaining > 0 ? `${formatMoney(d.breakEvenRemaining)} to break even` : undefined}
                            testId="finance-recouped"
                        />
                        <Stat
                            label="Cost per offspring born"
                            value={d.costPerOffspringBorn == null ? '-' : formatMoney(d.costPerOffspringBorn)}
                            testId="finance-per-offspring"
                        />
                    </>
                ) : (
                    <Stat label="Net" value={formatMoney(d.net)} testId="finance-net" />
                )}

            </div>

            {isLitter && d.offspringDetails && d.offspringDetails.length > 0 && (
                <div className="overflow-x-auto" data-testid="finance-offspring-details">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 dark:text-dark-text-muted">
                                <th className="py-1">Name</th>
                                <th className="py-1">Status</th>
                                <th className="py-1 text-right">Deposit</th>
                                <th className="py-1 text-right">Full price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {d.offspringDetails.map((o, i) => (
                                <tr key={o.id || i} className="border-t border-gray-100 dark:border-dark-border">
                                    <td className="py-1">{[o.prefix, o.name, o.suffix].filter(Boolean).join(' ') || o.displayName || 'Offspring'}</td>
                                    <td className="py-1">{STATUS_LABELS[o.status] || o.status}</td>
                                    <td className="py-1 text-right"><PriceBadge value={o.deposit} paid={o.depositPaid} /></td>
                                    <td className="py-1 text-right"><PriceBadge value={o.amount} paid={o.amountPaid} /></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-gray-200 dark:border-dark-border font-semibold">
                                <td className="py-1" colSpan={2}>Total</td>
                                <td className="py-1 text-right">{formatMoney(d.offspringDetails.reduce((s, o) => s + (o.deposit || 0), 0))}</td>
                                <td className="py-1 text-right">{formatMoney(d.offspringDetails.reduce((s, o) => s + (o.amount || 0), 0))}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {categories.length > 0 && (
                <ul className="text-sm text-gray-700 dark:text-dark-text-secondary space-y-0.5" data-testid="finance-categories">
                    {categories.map(([cat, amount]) => (
                        <li key={cat} className="flex justify-between gap-3">
                            <span>{CATEGORY_LABELS[cat] || cat}</span>
                            <span>{formatMoney(amount)}</span>
                        </li>
                    ))}
                </ul>
            )}

            {usage && usage.count > 0 && (
                <div className="border-t border-gray-100 dark:border-dark-border pt-3" data-testid="finance-usage">
                    <div className="flex justify-between gap-3 text-sm font-medium text-gray-800 dark:text-dark-text">
                        <span>Supplies used</span>
                        <span>{formatMoney(usage.totalCost)}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-dark-text-muted mb-1">
                        Valued at cost per unit. Not added to Spent, because buying the supplies is already counted there.
                    </p>
                    <div className="overflow-x-auto" data-testid="finance-supplies">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 dark:text-dark-text-muted">
                                    <th className="py-1">Supply</th>
                                    <th className="py-1 text-right">Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usage.bySupply.map(s => (
                                    <tr key={`${s.supplyName}|${s.unit}`} className="border-t border-gray-100 dark:border-dark-border">
                                        <td>{s.supplyName} ({s.quantity}{s.unit ? ` ${s.unit}` : ''})</td>
                                        <td className="py-1 text-right">{formatMoney(s.cost)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-gray-200 dark:border-dark-border font-semibold">
                                    <td className="py-1">Total</td>
                                    <td className="py-1 text-right">{formatMoney(usage.totalCost)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    {usage.unpricedCount > 0 && (
                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400" data-testid="finance-unpriced">
                            {usage.unpricedSupplies.length} suppl{usage.unpricedSupplies.length === 1 ? 'y has' : 'ies have'} no price
                            ({usage.unpricedSupplies.join(', ')}), so these costs are understated. Set a cost per unit on the Supplies page.
                        </p>
                    )}
                </div>
            )}

            {!hasAnything && !(usage && usage.count > 0) && (
                <p className="text-sm text-gray-500 dark:text-dark-text-muted">
                    {isLitter
                        ? 'No costs or sales recorded yet. Tag an expense to this litter in Budget to see it here.'
                        : 'No costs or sales recorded for this animal yet.'}
                </p>
            )}
        </div>
    );
}
