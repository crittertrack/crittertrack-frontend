import React from 'react';
import { getCompatibleFeedingUnits } from '../../utils/feedingUnits';

// Input fields for the "use supplies" form: supply picker, quantity + unit, date and note.

const inputCls = 'w-full text-sm border border-gray-300 dark:border-dark-text dark:bg-dark-surface dark:text-dark-text rounded-lg px-2 py-1.5';

export default function UseSupplyFields({ supplies, form, setForm, pickSupply }) {
    const selected = supplies.find(s => s._id === form.supplyId) || null;
    const units = selected ? getCompatibleFeedingUnits(selected.unit) : [];
    const unpriced = selected && (selected.costPerUnit === null || selected.costPerUnit === undefined);

    return (
        <>
            <select aria-label="Supply" value={form.supplyId} onChange={e => pickSupply(e.target.value)} className={inputCls} data-testid="use-supply-select">
                <option value="">Choose a supply...</option>
                {supplies.map(s => (
                    <option key={s._id} value={s._id}>
                        {s.name} ({s.currentStock ?? 0}{s.unit ? ` ${s.unit}` : ''} in stock)
                    </option>
                ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
                <input
                    type="number" min="0" step="any" aria-label="Quantity used" placeholder="Quantity used"
                    value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    className={inputCls} data-testid="use-supply-qty"
                />
                {units.length > 0 ? (
                    <select aria-label="Unit" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className={inputCls}>
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                ) : (
                    <input type="text" aria-label="Unit" placeholder="Unit" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className={inputCls} />
                )}
            </div>
            {unpriced && (
                <p className="text-xs text-amber-700 dark:text-amber-400" data-testid="use-supply-unpriced">
                    This supply has no price set, so this use will count as no cost.
                </p>
            )}
            <div className="grid grid-cols-2 gap-2">
                <input type="date" aria-label="Date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
                <input type="text" aria-label="Note" placeholder="Note (optional)" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className={inputCls} />
            </div>
        </>
    );
}
