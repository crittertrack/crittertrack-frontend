import React, { useState } from 'react';
import { InfoCard } from './DashboardComponents';
import { IdentificationNumbersCard } from './IdentificationTabContent';
import { AppearanceTabContent } from './AppearanceTabContent';
import { Stethoscope, Pill, Syringe, Bug, HeartPulse, AlertTriangle, Plus, Pencil, X, Save, Loader2, Trash2 } from 'lucide-react';
import apiClient from '../../utils/apiClient';

// Records arrays are stored as arrays but can arrive JSON-encoded (mirrors the parsers used
// by HealthTabContent / IdentificationTabContent, since some import paths write them as strings).
const parseRecords = (data) => {
    if (!data) return [];
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    return Array.isArray(data) ? data : [];
};

const str = (v) => (v !== null && v !== undefined && String(v).trim() ? String(v).trim() : '');
const fmtDate = (v) => (v ? String(v).slice(0, 10) : '');
const today = () => new Date().toISOString().substring(0, 10);

// Field shapes mirror the add-handlers in AnimalFormModalV2 so records written from Lite are
// indistinguishable from ones written in the Full editor.
const RECORD_TYPES = {
    vetVisits: {
        title: 'Veterinary Visits', icon: <Stethoscope size={18} className="text-gray-400 dark:text-dark-text-muted" />,
        primary: (r) => r.reason || r.name || '',
        secondary: (r) => [fmtDate(r.date), str(r.notes)].filter(Boolean).join(' — '),
        empty: { date: '', reason: '', notes: '' },
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'reason', label: 'Reason', type: 'text', required: true },
            { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
    },
    medications: {
        title: 'Medications', icon: <Pill size={18} className="text-gray-400 dark:text-dark-text-muted" />,
        primary: (r) => r.name || r.medication || '',
        secondary: (r) => [str(r.dose), str(r.reason), fmtDate(r.startDate)].filter(Boolean).join(' — '),
        empty: { name: '', dose: '', reason: '', notes: '', startDate: '', stopDate: '', intervalValue: '', intervalUnit: 'hours' },
        // Mirrors the Full editor: a medication is either typed in by hand or picked from the
        // Supplies inventory, which stamps supplyId/supplyName and source:'supply'.
        supportsSupply: true,
        fields: [
            { key: 'name', label: 'Medication', type: 'text', required: true },
            { key: 'dose', label: 'Dose', type: 'text' },
            { key: 'reason', label: 'Reason', type: 'text' },
            { key: 'startDate', label: 'Start', type: 'date' },
            { key: 'stopDate', label: 'Stop', type: 'date' },
            { key: 'intervalValue', label: 'Dose every', type: 'number' },
            { key: 'intervalUnit', label: 'Interval unit', type: 'select', options: ['hours', 'days', 'weeks'] },
            { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
    },
    vaccinations: {
        title: 'Vaccinations', icon: <Syringe size={18} className="text-gray-400 dark:text-dark-text-muted" />,
        primary: (r) => r.name || r.vaccine || '',
        secondary: (r) => [fmtDate(r.date), str(r.notes)].filter(Boolean).join(' — '),
        empty: { date: '', name: '', notes: '' },
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'name', label: 'Vaccination', type: 'text', required: true },
            { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
    },
    dewormingRecords: {
        title: 'Deworming', icon: <Bug size={18} className="text-gray-400 dark:text-dark-text-muted" />,
        primary: (r) => r.medication || r.name || r.product || '',
        secondary: (r) => [fmtDate(r.date), str(r.notes)].filter(Boolean).join(' — '),
        empty: { date: '', medication: '', notes: '' },
        fields: [
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'medication', label: 'Medication', type: 'text', required: true },
            { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
    },
    medicalConditions: {
        title: 'Medical Conditions', icon: <HeartPulse size={18} className="text-gray-400 dark:text-dark-text-muted" />,
        primary: (r) => r.name || r.condition || '',
        secondary: (r) => [str(r.status), str(r.severity), str(r.notes)].filter(Boolean).join(' — '),
        empty: { name: '', notes: '' },
        fields: [
            { key: 'name', label: 'Condition', type: 'text', required: true },
            { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
    },
    allergies: {
        title: 'Allergies', icon: <AlertTriangle size={18} className="text-gray-400 dark:text-dark-text-muted" />,
        primary: (r) => r.name || r.allergen || '',
        secondary: (r) => str(r.notes),
        empty: { name: '', notes: '' },
        fields: [
            { key: 'name', label: 'Allergen', type: 'text', required: true },
            { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
    },
};

// One record type: list, inline add form, inline edit, delete. Saves the whole array back
// via PUT /animals/:id, which is how the Full editor persists these fields too.
const RecordEditor = ({ field, animal, onUpdateAnimal }) => {
    const spec = RECORD_TYPES[field];
    const [records, setRecords] = useState(() => parseRecords(animal[field]));
    const [draft, setDraft] = useState(null);          // null = not adding
    const [editingId, setEditingId] = useState(null);  // record id being edited
    const [saving, setSaving] = useState(false);
    const [supplyMode, setSupplyMode] = useState(false);
    const [supplies, setSupplies] = useState([]);
    const [suppliesLoading, setSuppliesLoading] = useState(false);
    const [selectedSupply, setSelectedSupply] = useState('');
    const [error, setError] = useState(null);

    // Same endpoint and category filter the Full editor uses.
    React.useEffect(() => {
        if (!supplyMode || supplies.length || suppliesLoading) return;
        setSuppliesLoading(true);
        apiClient.get('/supplies?category=medication')
            .then((res) => setSupplies(res.data || []))
            .catch(() => setError('Could not load supplies. Type the name manually instead.'))
            .finally(() => setSuppliesLoading(false));
    }, [supplyMode, supplies.length, suppliesLoading]);

    const startAdd = () => { setEditingId(null); setDraft({ ...spec.empty }); setSelectedSupply(''); setSupplyMode(false); setError(null); };
    const startEdit = (rec, i) => { setDraft(null); setEditingId(rec.id ?? `idx-${i}`); setError(null); };
    const cancel = () => { setDraft(null); setEditingId(null); setSelectedSupply(''); setSupplyMode(false); setError(null); };

    const persist = async (next) => {
        setSaving(true);
        setError(null);
        try {
            await apiClient.put(`/animals/${animal.id_public}`, { [field]: next });
            setRecords(next);
            if (onUpdateAnimal) onUpdateAnimal({ ...animal, [field]: next });
        } catch (e) {
            setError('Could not save. Check your connection and try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleAdd = () => {
        const missing = spec.fields.find((f) => f.required && !str(draft[f.key]));
        if (missing) { setError(`${missing.label} is required.`); return; }
        const supply = supplies.find((s) => (s.id || s._id) === selectedSupply);
        const base = spec.fields.reduce((o, f) => { o[f.key] = draft[f.key] || (f.type === 'date' ? null : ''); return o; }, {});
        const record = spec.supportsSupply && supplyMode
            ? { id: Date.now().toString(), ...base, supplyId: supply.id || supply._id, supplyName: supply.name, source: 'supply' }
            : { id: Date.now().toString(), ...base, ...(spec.supportsSupply ? { source: 'manual' } : {}) };
        persist([...records, record]);
        cancel();
    };

    const handleSaveEdit = () => {
        const i = records.findIndex((r, idx) => (r.id ?? `idx-${idx}`) === editingId);
        if (i < 0) { cancel(); return; }
        const missing = spec.fields.find((f) => f.required && !str(draft[f.key]));
        if (missing) { setError(`${missing.label} is required.`); return; }
        const next = [...records];
        next[i] = { ...records[i], ...spec.fields.reduce((o, f) => { o[f.key] = draft[f.key] || (f.type === 'date' ? null : ''); return o; }, {}) };
        persist(next);
        cancel();
    };

    const handleDelete = (i) => {
        const next = records.filter((_, idx) => idx !== i);
        persist(next);
        if (editingId !== null) cancel();
    };

    const renderForm = (values, onChange, onSubmit, onCancel, submitLabel) => (
        <div className="space-y-2 mt-2 p-2 rounded-lg bg-gray-50 dark:bg-dark-surface">
            {spec.supportsSupply && (
                <div className="flex gap-1 mb-1">
                    <button
                        type="button"
                        onClick={() => { setSupplyMode(false); setSelectedSupply(''); setDraft((d) => ({ ...d, name: '' })); }}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${!supplyMode ? 'bg-primary dark:bg-dark-primary text-black' : 'bg-gray-200 dark:bg-dark-surface text-gray-500 dark:text-dark-text-muted'}`}
                    >Manual Entry</button>
                    <button
                        type="button"
                        onClick={() => setSupplyMode(true)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${supplyMode ? 'bg-primary dark:bg-dark-primary text-black' : 'bg-gray-200 dark:bg-dark-surface text-gray-500 dark:text-dark-text-muted'}`}
                    >From Supplies</button>
                </div>
            )}
            {spec.supportsSupply && supplyMode && (
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-dark-text-muted mb-0.5">Supply *</label>
                    {suppliesLoading ? (
                        <p className="text-[11px] text-gray-400 flex items-center gap-1"><Loader2 size={11} className="animate-spin" /> Loading supplies…</p>
                    ) : (
                        <select
                            value={selectedSupply}
                            onChange={(e) => {
                                setSelectedSupply(e.target.value);
                                const s = supplies.find((x) => (x.id || x._id) === e.target.value);
                                if (s) setDraft((d) => ({ ...d, name: s.name })); // mirrors the Full editor
                            }}
                            className="w-full px-2 py-1 text-xs rounded border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text"
                        >
                            <option value="">Select a medication supply…</option>
                            {supplies.map((s) => <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>)}
                        </select>
                    )}
                </div>
            )}
            {spec.fields.map((f) => (
                <div key={f.key}>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-dark-text-muted mb-0.5">
                        {f.label}{f.required ? ' *' : ''}
                    </label>
                    {f.type === 'textarea' ? (
                        <textarea rows={2} value={values[f.key] || ''} onChange={(e) => onChange(f.key, e.target.value)} className="w-full px-2 py-1 text-xs rounded border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text" />
                    ) : f.type === 'select' ? (
                        <select value={values[f.key] || ''} onChange={(e) => onChange(f.key, e.target.value)} className="w-full px-2 py-1 text-xs rounded border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text">
                            {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                    ) : (
                        <input type={f.type} value={values[f.key] || ''} onChange={(e) => onChange(f.key, e.target.value)} className="w-full px-2 py-1 text-xs rounded border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text" />
                    )}
                </div>
            ))}
            {error && <p className="text-[11px] text-red-500">{error}</p>}
            <div className="flex gap-1.5">
                <button onClick={onSubmit} disabled={saving} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-primary dark:bg-dark-primary text-black disabled:opacity-50">
                    {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} {submitLabel}
                </button>
                <button onClick={onCancel} className="text-[11px] font-semibold px-2 py-1 rounded bg-gray-200 dark:bg-dark-surface-hover text-gray-600 dark:text-dark-text-secondary">Cancel</button>
            </div>
        </div>
    );

    return (
        <InfoCard title={spec.title} icon={spec.icon}>
            {records.length === 0 && !draft && (
                <p className="text-xs text-gray-400 dark:text-dark-text-muted">No {spec.title.toLowerCase()} recorded.</p>
            )}
            <ul className="space-y-1.5">
                {records.map((r, i) => {
                    const rid = r.id ?? `idx-${i}`;
                    const isEditing = editingId === rid;
                    return (
                        <li key={rid} className="border-b border-gray-100 dark:border-dark-text-muted last:border-0 pb-1.5 last:pb-0">
                            {isEditing ? (
                                renderForm(draft || {}, (k, v) => setDraft((d) => ({ ...d, [k]: v })), handleSaveEdit, cancel, 'Save')
                            ) : (
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0 text-xs">
                                        <span className="text-gray-800 dark:text-dark-text font-medium">{spec.primary(r) || '—'}</span>
                                        {spec.secondary(r) && <span className="text-gray-500 dark:text-dark-text-muted"> · {spec.secondary(r)}</span>}
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => startEdit(r, i)} title="Edit" className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-dark-text"><Pencil size={12} /></button>
                                        <button onClick={() => handleDelete(i)} title="Delete" className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
            {draft && !editingId && renderForm(draft, (k, v) => setDraft((d) => ({ ...d, [k]: v })), handleAdd, cancel, 'Add')}
            {!draft && editingId === null && (
                <button onClick={startAdd} className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded border border-gray-300 dark:border-dark-border text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-hover">
                    <Plus size={11} /> Add
                </button>
            )}
            {error && !draft && editingId === null && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </InfoCard>
    );
};

// Lite's "Records" tab: Identification Numbers + Appearance + the editable record types the
// standalone crittertrack-lite app surfaces. Scope rationale in crittertrack-lite/RECORDS_SCOPE.md.
export const LiteRecordsTabContent = ({ animal, API_BASE_URL, authToken, onUpdateAnimal }) => {
    if (!animal) return null;
    return (
        <div className="space-y-6">
            <IdentificationNumbersCard animal={animal} />
            <AppearanceTabContent animal={animal} API_BASE_URL={API_BASE_URL} authToken={authToken} />
            {Object.keys(RECORD_TYPES).map((field) => (
                <RecordEditor key={field} field={field} animal={animal} onUpdateAnimal={onUpdateAnimal} />
            ))}
        </div>
    );
};

export default LiteRecordsTabContent;



