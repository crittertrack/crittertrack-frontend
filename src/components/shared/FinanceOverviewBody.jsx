import React from 'react';
import { Trash2 } from 'lucide-react';
import apiClient from '../../utils/apiClient';

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

// Show a supply quantity in the most readable unit of its family (3000 g -> 3 kg, 0.25 l -> 250 ml).
const UNIT_LADDERS = [
    [['mcg', 0.000001], ['mg', 0.001], ['g', 1], ['kg', 1000]],
    [['ml', 1], ['l', 1000]],
];
const UNIT_ALIASES = { gram: 'g', grams: 'g', kilogram: 'kg', kilograms: 'kg', milligram: 'mg', milligrams: 'mg', microgram: 'mcg', micrograms: 'mcg', liter: 'l', liters: 'l', litre: 'l', litres: 'l', milliliter: 'ml', milliliters: 'ml', millilitre: 'ml', millilitres: 'ml' };
export const formatQuantity = (quantity, unit) => {
    const q = Number(quantity) || 0;
    const key = String(unit || '').trim().toLowerCase();
    const u = UNIT_ALIASES[key] || key;
    const ladder = UNIT_LADDERS.find(l => l.some(([name]) => name === u));
    let value = q;
    let label = unit || '';
    if (ladder) {
        const factor = ladder.find(([name]) => name === u)[1];
        const base = q * factor;
        let pick = ladder[0];
        for (const step of ladder) { if (Math.abs(base) >= step[1]) pick = step; }
        value = base / pick[1];
        label = pick[0];
    }
    const rounded = Math.round(value * 100) / 100;
    return `${rounded}${label ? ` ${label}` : ''}`;
};
const TrashButton = ({ label, onClick }) => (
    <button type="button" onClick={onClick} className="text-red-400 hover:text-red-600 p-1" title={label} aria-label={label}>
        <Trash2 size={14} />
    </button>
);

export default function FinanceOverviewBody({ data: d, onChanged }) {
    const removeUsage = async (entry) => {
        if (!window.confirm(`Remove ${entry.supplyName} from this litter and put the quantity back in stock?`)) return;
        try { await apiClient.delete(`/supplies/usage/${entry._id}`); } catch { window.alert('Could not remove this entry.'); return; }
        if (onChanged) onChanged();
    };
    const removeExpense = async (t) => {
        if (!window.confirm(`Remove the expense "${t.description}"?`)) return;
        try { await apiClient.delete(`/budget/transactions/${t._id}`); } catch { window.alert('Could not remove this expense.'); return; }
        if (onChanged) onChanged();
    };

    const usage = d.usage;
    const categories = Object.entries(d.costByCategory || {}).filter(([, v]) => v > 0);
    const namedExpenses = Array.isArray(d.transactions) ? d.transactions.filter(t => t.type === 'expense' && t.litterId && t.description) : [];
    const hasAnything = d.totalCost > 0 || d.totalRevenue > 0 || d.expectedRevenue > 0;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <Stat label="Spent" value={formatMoney(d.totalCost)} testId="finance-spent" />
                <Stat label="Earned from sales" value={formatMoney(d.totalRevenue)} testId="finance-earned" />
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

            </div>

            {d.offspringDetails && d.offspringDetails.length > 0 && (
                <section className="border-t border-gray-100 dark:border-dark-border pt-3" data-testid="finance-offspring-section">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-text mb-1">Offspring</h4>
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
                </section>
            )}

            {(categories.length > 0 || (usage && usage.count > 0) || namedExpenses.length > 0) && (
                <section className="border-t border-gray-100 dark:border-dark-border pt-3 space-y-3" data-testid="finance-care-supplies">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-text">Care &amp; supplies</h4>

                    {usage && usage.count > 0 && (
                        <div data-testid="finance-usage">
                            <div className="overflow-x-auto" data-testid="finance-supplies">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 dark:text-dark-text-muted">
                                            <th className="py-1">Name</th>
                                            <th className="py-1 text-right">Quantity</th>
                                            <th className="py-1 text-right">Cost</th>
                                            <th className="w-8" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(usage.entries || []).map(s => (
                                            <tr key={s._id} className="border-t border-gray-100 dark:border-dark-border">
                                                <td className="py-1">{s.supplyName}</td>
                                                <td className="py-1 text-right">{formatQuantity(s.quantity, s.unit)}</td>
                                                <td className="py-1 text-right">{s.priced ? formatMoney(s.cost) : '-'}</td>
                                                <td className="py-1 text-right"><TrashButton label={`Remove ${s.supplyName}`} onClick={() => removeUsage(s)} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-gray-200 dark:border-dark-border font-semibold">
                                            <td className="py-1" colSpan={2}>Total</td>
                                            <td className="py-1 text-right">{formatMoney(usage.totalCost)}</td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-dark-text-muted mt-1">
                                Valued at cost per unit. Not added to Spent, because buying the supplies is already counted there.
                            </p>
                            {usage.unpricedCount > 0 && (
                                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400" data-testid="finance-unpriced">
                                    {usage.unpricedSupplies.length} suppl{usage.unpricedSupplies.length === 1 ? 'y has' : 'ies have'} no price
                                    ({usage.unpricedSupplies.join(', ')}), so these costs are understated. Set a cost per unit on the Supplies page.
                                </p>
                            )}
                        </div>
                    )}

                    {namedExpenses.length > 0 && (
                        <div data-testid="finance-litter-expenses">
                            <p className="text-xs font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Litter expenses</p>
                            <ul className="text-sm text-gray-700 dark:text-dark-text-secondary space-y-0.5">
                                {namedExpenses.map(t => (
                                    <li key={t._id} className="flex justify-between gap-3">
                                        <span>{t.description}</span>
                                        <span className="flex items-center gap-1">{formatMoney(t.price)}<TrashButton label={`Remove ${t.description}`} onClick={() => removeExpense(t)} /></span>
                                    </li>
                                ))}
                            </ul>
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
                </section>
            )}
            {!hasAnything && !(usage && usage.count > 0) && (
                <p className="text-sm text-gray-500 dark:text-dark-text-muted">
                    No costs or sales recorded yet. Tag an expense to this litter in Budget to see it here.
                </p>
            )}
        </div>
    );
}
