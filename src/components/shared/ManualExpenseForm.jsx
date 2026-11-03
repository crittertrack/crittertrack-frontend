import React, { useState } from 'react';
import apiClient from '../../utils/apiClient';

// Manual cost entry for a litter (vet visit, bedding, etc). Posts a normal 'expense' transaction
// tagged to the litter, so it flows into Spent and the Budget Tracker like any other expense.

const today = () => new Date().toISOString().slice(0, 10);
const inputCls = 'w-full border border-gray-300 dark:border-dark-text-muted rounded px-2 py-1 text-sm dark:bg-dark-surface dark:text-dark-text';
const labelCls = 'block text-xs text-gray-600 dark:text-dark-text-muted mb-0.5';

export default function ManualExpenseForm({ litterId, onDone, onCancel }) {
    const [form, setForm] = useState({ name: '', amount: '', category: '', note: '', date: today() });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (!(Number(form.amount) > 0)) { setError('Enter an amount greater than 0.'); return; }
        setSaving(true);
        try {
            await apiClient.post(`/budget/litters/${encodeURIComponent(litterId)}/manual-expense`, {
                name: form.name.trim() || undefined,
                amount: Number(form.amount),
                category: form.category || undefined,
                note: form.note.trim() || undefined,
                date: form.date || undefined,
            });
            if (onDone) onDone();
        } catch (err) {
            setError(err?.response?.data?.message || 'Could not record this expense.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="rounded-lg border border-gray-200 dark:border-dark-border p-3 space-y-2" data-testid="manual-expense-form">
            <p className="text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Add an expense for this litter</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="sm:col-span-2">
                    <label className={labelCls} htmlFor="expense-name">Name</label>
                    <input id="expense-name" type="text" className={inputCls} placeholder="e.g. Vet check, Bedding" maxLength={100} value={form.name} onChange={set('name')} />
                </div>
                <div>
                    <label className={labelCls} htmlFor="expense-amount">Amount</label>
                    <input id="expense-amount" type="number" step="0.01" min="0" className={inputCls} placeholder="0.00" value={form.amount} onChange={set('amount')} />
                </div>
                <div>
                    <label className={labelCls} htmlFor="expense-date">Date</label>
                    <input id="expense-date" type="date" className={inputCls} value={form.date} onChange={set('date')} />
                </div>
                <div>
                    <label className={labelCls} htmlFor="expense-category">Category</label>
                    <select id="expense-category" className={inputCls} value={form.category} onChange={set('category')}>
                        <option value="">Other</option>
                        <option value="food">Food &amp; supplies</option>
                        <option value="housing">Housing &amp; bedding</option>
                        <option value="medical">Medical &amp; vet</option>
                        <option value="equipment">Equipment &amp; setup</option>
                    </select>
                </div>
                <div>
                    <label className={labelCls} htmlFor="expense-note">Note</label>
                    <input id="expense-note" type="text" className={inputCls} placeholder="Optional" value={form.note} onChange={set('note')} />
                </div>
            </div>
            {error && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-2.5 py-1 text-xs text-gray-600 dark:text-dark-text-muted rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface-hover">Cancel</button>
                <button type="submit" disabled={saving} className="px-2.5 py-1 bg-blue-600 text-white text-xs rounded-lg font-medium disabled:opacity-50">
                    {saving ? 'Saving...' : 'Add expense'}
                </button>
            </div>
        </form>
    );
}
