import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';

/**
 * GeneralTaskModal - Create/edit a standalone Feeding & Care task that isn't tied to any single
 * animal or enclosure (e.g. "Feed the mouse colony"). Optionally links a set of animals purely
 * for display context — this does NOT create per-animal due-dates/notifications, the task
 * itself has exactly one due date/one reminder.
 */
const GeneralTaskModal = ({ isOpen, onClose, onSave, task, animals = [] }) => {
    const isEdit = !!task;
    const [taskName, setTaskName] = useState(task?.taskName || '');
    const [type, setType] = useState(task?.type || 'Feeding');
    const [frequency, setFrequency] = useState(task?.frequency || '');
    const [frequencyUnit, setFrequencyUnit] = useState(task?.frequencyUnit || 'days');
    const [notes, setNotes] = useState(task?.notes || '');
    const [assignedAnimals, setAssignedAnimals] = useState(task?.assignedAnimals || []);
    const [animalSearch, setAnimalSearch] = useState('');

    const filteredAnimals = useMemo(() => {
        if (!animalSearch.trim()) return animals;
        const q = animalSearch.trim().toLowerCase();
        return animals.filter(a => a.name?.toLowerCase().includes(q) || a.id_public?.toLowerCase().includes(q));
    }, [animals, animalSearch]);

    const toggleAnimal = (id_public) => {
        setAssignedAnimals(prev => prev.includes(id_public) ? prev.filter(id => id !== id_public) : [...prev, id_public]);
    };

    const handleSave = () => {
        if (!taskName.trim()) return;
        onSave({
            ...(isEdit ? { id: task.id } : {}),
            taskName: taskName.trim(),
            type,
            frequency: frequency ? Number(frequency) : null,
            frequencyUnit,
            notes: notes.trim() || null,
            assignedAnimals,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-[500]" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b dark:border-dark-text-muted p-4 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text">{isEdit ? 'Edit Custom Task' : 'Add Custom Task'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-dark-text-muted dark:hover:text-dark-text"><X size={22} /></button>
                </div>

                <div className="p-4 space-y-3 overflow-y-auto">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1">Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 text-sm border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text">
                            <option value="Feeding">Feeding</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1">Task Name</label>
                        <input
                            type="text"
                            value={taskName}
                            onChange={e => setTaskName(e.target.value)}
                            placeholder="e.g. Feed the mouse colony"
                            autoFocus
                            className="w-full p-2 text-sm border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted"
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="w-24">
                            <label className="block text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1">Frequency</label>
                            <input type="number" value={frequency} onChange={e => setFrequency(e.target.value)} min="1" placeholder="e.g. 1" className="w-full p-2 text-sm border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1">Unit</label>
                            <select value={frequencyUnit} onChange={e => setFrequencyUnit(e.target.value)} className="w-full p-2 text-sm border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text">
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                                <option value="months">Months</option>
                                <option value="years">Years</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1">Notes (optional)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes" className="w-full p-2 text-sm border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1">
                            Assign Animals (optional — for reference only, does not create separate reminders)
                        </label>
                        {assignedAnimals.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1.5">
                                {assignedAnimals.map(id => {
                                    const a = animals.find(an => an.id_public === id);
                                    return (
                                        <span key={id} className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-dark-info-blue/30 text-blue-700 dark:text-dark-info-blue px-2 py-0.5 rounded-full">
                                            {a?.name || id}
                                            <button type="button" onClick={() => toggleAnimal(id)} className="hover:text-blue-900 dark:hover:text-dark-text"><X size={11} /></button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                        <div className="relative mb-1.5">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={animalSearch}
                                onChange={e => setAnimalSearch(e.target.value)}
                                placeholder="Search animals to assign..."
                                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted"
                            />
                        </div>
                        <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-dark-text-muted rounded-lg divide-y divide-gray-100 dark:divide-dark-text-muted">
                            {filteredAnimals.length === 0
                                ? <div className="text-xs text-gray-400 dark:text-dark-text-muted text-center py-3">No animals found.</div>
                                : filteredAnimals.slice(0, 50).map(a => (
                                    <label key={a.id_public} className="flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-surface">
                                        <input type="checkbox" checked={assignedAnimals.includes(a.id_public)} onChange={() => toggleAnimal(a.id_public)} />
                                        <span className="text-gray-700 dark:text-dark-text">{a.name || a.id_public}</span>
                                        <span className="text-gray-400 dark:text-dark-text-muted">{a.id_public}</span>
                                    </label>
                                ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 p-4 border-t dark:border-dark-text-muted flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-dark-text-muted text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface">Cancel</button>
                    <button type="button" onClick={handleSave} disabled={!taskName.trim()} className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 dark:bg-dark-info-blue text-white font-medium hover:bg-blue-700 dark:hover:bg-dark-info-blue-hover disabled:opacity-50 disabled:cursor-not-allowed">
                        {isEdit ? 'Save Changes' : 'Add Task'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeneralTaskModal;
