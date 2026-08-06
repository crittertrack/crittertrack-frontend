import React, { useState, useMemo } from 'react';
import { X, Search, ShieldAlert, Stethoscope, Check, AlertTriangle } from 'lucide-react';
import DatePicker from '../DatePicker';

const QUARANTINE_TYPES = [
    'Preventive - New Arrival', 'Preventive - Intake', 'Medical - Illness/URI',
    'Medical - Contagious Disease', 'Medical - Recovery', 'Behavioral - Aggression',
    'Behavioral - Fear/Stress', 'Other',
];

const getAnimalDisplayName = (a) => [a.prefix, a.name, a.suffix].filter(Boolean).join(' ') || a.id_public || 'Unknown';

const todayStr = () => new Date().toISOString().substring(0, 10);

const defaultDetails = (type) => ({
    status: type === 'quarantine' ? 'Quarantine' : 'Treatment',
    type: '', reason: '', startDate: todayStr(), endDate: '',
});

const defaultMedication = () => ({ name: '', dose: '', reason: '', notes: '', startDate: todayStr(), stopDate: '', intervalValue: '', intervalUnit: 'hours' });

// Bulk-assigns a quarantine/isolation or treatment period to one or more animals at once,
// mirroring the per-animal fields/logic in AnimalFormModalV2's Health tab.
const AssignHealthStatusModal = ({ isOpen, onClose, animals, onSubmit, saving }) => {
    const [statusType, setStatusType] = useState('quarantine'); // 'quarantine' | 'treatment'
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [details, setDetails] = useState(defaultDetails('quarantine'));
    // Active medications are what actually make an animal "under treatment" (see healthNeedsAttentionList),
    // so treatment assignments can optionally record one alongside the treatment period itself.
    const [medication, setMedication] = useState(defaultMedication());

    const filteredAnimals = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return animals;
        return animals.filter(a =>
            getAnimalDisplayName(a).toLowerCase().includes(q) ||
            (a.id_public || '').toLowerCase().includes(q)
        );
    }, [animals, search]);

    if (!isOpen) return null;

    const toggleType = (type) => {
        setStatusType(type);
        setDetails(defaultDetails(type));
        setMedication(defaultMedication());
    };

    const toggleAnimal = (id_public) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id_public)) next.delete(id_public); else next.add(id_public);
            return next;
        });
    };

    const selectAllFiltered = () => setSelectedIds(new Set(filteredAnimals.map(a => a.id_public)));
    const clearSelection = () => setSelectedIds(new Set());

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleMedicationChange = (e) => {
        const { name, value } = e.target;
        setMedication(prev => ({ ...prev, [name]: value }));
    };

    const resetState = () => {
        setSearch('');
        setSelectedIds(new Set());
        setStatusType('quarantine');
        setDetails(defaultDetails('quarantine'));
        setMedication(defaultMedication());
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const canSubmit = selectedIds.size > 0 && !saving &&
        (statusType === 'quarantine' ? !!details.startDate : (medication.name.trim() && !!medication.startDate));

    const handleSubmit = async () => {
        if (!canSubmit) return;
        const medicationToSubmit = statusType === 'treatment' ? medication : null;
        await onSubmit([...selectedIds], statusType, statusType === 'quarantine' ? details : null, medicationToSubmit);
        resetState();
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60" onClick={handleClose}>
            <div className="bg-white dark:bg-dark-card-bg rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 sm:p-6 pb-4 border-b dark:border-dark-text-muted">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text flex items-center gap-2">
                        <ShieldAlert size={20} className="text-orange-600" /> Assign Quarantine / Treatment
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-text"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => toggleType('quarantine')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-semibold transition ${statusType === 'quarantine' ? 'bg-orange-100 border-orange-400 text-orange-800' : 'border-gray-200 dark:border-dark-text-muted text-gray-500 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-hover'}`}
                        >
                            <ShieldAlert size={15} /> Quarantine
                        </button>
                        <button
                            type="button"
                            onClick={() => toggleType('treatment')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-semibold transition ${statusType === 'treatment' ? 'bg-red-100 border-red-400 text-red-800' : 'border-gray-200 dark:border-dark-text-muted text-gray-500 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-hover'}`}
                        >
                            <Stethoscope size={15} /> Treatment
                        </button>
                    </div>

                    {statusType === 'quarantine' ? (
                        <div className="bg-gray-50 dark:bg-dark-card-bg rounded-lg border border-gray-200 dark:border-dark-text-muted p-3 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Status</label>
                                    <select name="status" value={details.status} onChange={handleDetailChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                        <option value="Quarantine">Quarantine</option>
                                        <option value="Isolation">Isolation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Type/Reason</label>
                                    <select name="type" value={details.type} onChange={handleDetailChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                        <option value="">Select type...</option>
                                        {QUARANTINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Additional Notes</label>
                                    <input type="text" name="reason" value={details.reason} onChange={handleDetailChange} placeholder="e.g., Specific illness, concerns, observations" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Start Date <span className="text-red-500">*</span></label>
                                    <DatePicker name="startDate" value={details.startDate} onChange={handleDetailChange} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary">End Date (Optional)</label>
                                    <DatePicker name="endDate" value={details.endDate} onChange={handleDetailChange} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-dark-card-bg rounded-lg border border-gray-200 dark:border-dark-text-muted p-3 space-y-3">
                            <div className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-md p-2">
                                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                                <span>Treatment is defined by an active medication — it's what marks the animal as "In Treatment" and factors into its health status.</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Name</label>
                                    <input type="text" name="name" value={medication.name} onChange={handleMedicationChange} placeholder="e.g., Amoxicillin" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Dose</label>
                                    <input type="text" name="dose" value={medication.dose} onChange={handleMedicationChange} placeholder="e.g., 50mg" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Reason</label>
                                    <input type="text" name="reason" value={medication.reason} onChange={handleMedicationChange} placeholder="e.g., Post-surgical recovery, illness, injury" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Start Date <span className="text-red-500">*</span></label>
                                    <DatePicker name="startDate" value={medication.startDate} onChange={handleMedicationChange} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Stop Date</label>
                                    <DatePicker name="stopDate" value={medication.stopDate} onChange={handleMedicationChange} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Dose Interval</label>
                                        <input type="number" min="0" name="intervalValue" value={medication.intervalValue} onChange={handleMedicationChange} placeholder="e.g., 12" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Unit</label>
                                        <select name="intervalUnit" value={medication.intervalUnit} onChange={handleMedicationChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                            <option value="hours">Hours</option>
                                            <option value="days">Days</option>
                                            <option value="weeks">Weeks</option>
                                            <option value="months">Months</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary">Medication Notes</label>
                                    <input type="text" name="notes" value={medication.notes} onChange={handleMedicationChange} placeholder="e.g., Give with food" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <label className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">
                                Animals ({selectedIds.size} selected)
                            </label>
                            <div className="flex items-center gap-2 text-xs">
                                <button type="button" onClick={selectAllFiltered} className="text-primary-dark hover:underline">Select all{search ? ' filtered' : ''}</button>
                                <span className="text-gray-300">|</span>
                                <button type="button" onClick={clearSelection} className="text-gray-500 hover:underline">Clear</button>
                            </div>
                        </div>
                        <div className="relative mb-2">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or ID..."
                                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="border border-gray-200 dark:border-dark-text-muted rounded-lg max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-dark-text-muted">
                            {filteredAnimals.length === 0 && (
                                <div className="p-3 text-sm text-gray-400 text-center">No animals found.</div>
                            )}
                            {filteredAnimals.map(a => {
                                const checked = selectedIds.has(a.id_public);
                                return (
                                    <label key={a.id_public} className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-surface-hover ${checked ? 'bg-primary/5' : ''}`}>
                                        <input type="checkbox" checked={checked} onChange={() => toggleAnimal(a.id_public)} className="rounded border-gray-300" />
                                        <span className="flex-1 truncate">{getAnimalDisplayName(a)}</span>
                                        <span className="text-xs text-gray-400">{a.id_public}</span>
                                        {a.isQuarantine && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">Quarantine</span>}
                                        {a.isInTreatment && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">Treatment</span>}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 p-4 sm:p-6 pt-4 border-t dark:border-dark-text-muted">
                    <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface-hover rounded-lg">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                    >
                        <Check size={15} /> {saving ? 'Assigning...' : `Assign to ${selectedIds.size || ''} Animal${selectedIds.size === 1 ? '' : 's'}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignHealthStatusModal;
