import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';
import UseSupplyFields from './UseSupplyFields';

// "From supplies" cost entry for a litter or an animal: pick a supply and how much was used.
// Posts to /supplies/use, which lowers stock (with unit conversion) and records a usage entry
// valued at the supply's cost per unit.

const today = () => new Date().toISOString().slice(0, 10);

export default function UseSupplyForm({ litterId = null, animalId = null, onDone, onCancel }) {
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ supplyId: '', quantity: '', unit: '', date: today(), note: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        apiClient.get('/supplies')
            .then(res => { if (!cancelled) setSupplies(Array.isArray(res.data) ? res.data : []); })
            .catch(() => { if (!cancelled) setError('Could not load your supplies.'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const pickSupply = (supplyId) => {
        const supply = supplies.find(s => s._id === supplyId);
        setForm(f => ({ ...f, supplyId, unit: supply?.unit || '' }));
    };

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.supplyId) { setError('Choose a supply.'); return; }
        if (!(Number(form.quantity) > 0)) { setError('Enter how much was used.'); return; }
        setSaving(true);
        try {
            await apiClient.post('/supplies/use', {
                supplyId: form.supplyId,
                quantity: Number(form.quantity),
                unit: form.unit || undefined,
                litterId: litterId || undefined,
                animalId: animalId || undefined,
                date: form.date || undefined,
                note: form.note.trim() || undefined,
            });
            if (onDone) onDone();
        } catch (err) {
            setError(err?.response?.data?.message || 'Could not record this use.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="rounded-lg border border-blue-200 dark:border-blue-700/60 bg-blue-50 dark:bg-blue-900/20 p-3 space-y-2" data-testid="use-supply-form">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Use supplies for this {litterId ? 'litter' : 'animal'}</p>
            {loading ? (
                <p className="text-sm text-gray-500 dark:text-dark-text-muted">Loading supplies...</p>
            ) : supplies.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">You have no supplies yet. Add some on the Supplies page first.</p>
            ) : (
                <UseSupplyFields supplies={supplies} form={form} setForm={setForm} pickSupply={pickSupply} />
            )}
            {error && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-2.5 py-1 text-xs text-gray-600 dark:text-dark-text-muted rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface-hover">Cancel</button>
                <button
                    type="submit" disabled={saving || loading || supplies.length === 0}
                    className="px-2.5 py-1 bg-blue-600 text-white text-xs rounded-lg font-medium disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Record use'}
                </button>
            </div>
        </form>
    );
}
