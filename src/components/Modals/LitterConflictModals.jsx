import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Conflict Resolution Modal Component
// Used when linking a breeding record to a litter with conflicting data
const ConflictResolutionModal = ({ conflicts, litter, onResolve, onCancel }) => {
    const [resolutions, setResolutions] = useState({});

    useEffect(() => {
        // Initialize resolutions with default 'breeding' choice for all conflicts
        const initialResolutions = {};
        conflicts.forEach(conflict => {
            initialResolutions[conflict.field] = 'breeding';
        });
        setResolutions(initialResolutions);
    }, [conflicts]);

    const handleResolutionChange = (field, choice) => {
        setResolutions(prev => ({
            ...prev,
            [field]: choice
        }));
    };

    const handleResolve = () => {
        const resolutionArray = Object.entries(resolutions).map(([field, choice]) => ({
            field,
            choice
        }));
        onResolve(resolutionArray);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Resolve Data Conflicts</h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                        <strong>Linking to Litter:</strong> {litter.litter_id_public}
                    </p>
                    <p className="text-yellow-800 text-sm">
                        Some data conflicts were found between your breeding record and the litter. Please choose which values to keep.
                    </p>
                </div>

                <div className="space-y-4">
                    {conflicts.map((conflict) => (
                        <div key={conflict.field} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-700 mb-3">{conflict.label}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={conflict.field}
                                        value="breeding"
                                        checked={resolutions[conflict.field] === 'breeding'}
                                        onChange={() => handleResolutionChange(conflict.field, 'breeding')}
                                        className="text-blue-600"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-blue-600">Keep Breeding Record Value</div>
                                        <div className="text-sm text-gray-600">{conflict.breedingValue}</div>
                                    </div>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={conflict.field}
                                        value="litter"
                                        checked={resolutions[conflict.field] === 'litter'}
                                        onChange={() => handleResolutionChange(conflict.field, 'litter')}
                                        className="text-green-600"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-green-600">Use Litter Value</div>
                                        <div className="text-sm text-gray-600">{conflict.litterValue}</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="flex gap-4 mt-6">
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleResolve}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Resolve Conflicts & Link
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Litter Sync Conflict Modal -----------------------------------------------
// Shown after an animal save when a breeding record's values differ from its
// linked litter document. Lets the user pick the "truth" for each field; the
// winning value is written to BOTH sides.
const LitterSyncConflictModal = ({ items, onResolve, onSkip }) => {
    const [choices, setChoices] = useState({});

    useEffect(() => {
        const init = {};
        items.forEach(item => {
            item.conflicts.forEach(c => {
                init[`${item.litter._id}__${c.field}`] = 'record';
            });
        });
        setChoices(init);
    }, [items]);

    const set = (litterId, field, val) =>
        setChoices(prev => ({ ...prev, [`${litterId}__${field}`]: val }));

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-600 text-xl">⚠</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Litter Sync Conflicts</h3>
                        <p className="text-sm text-gray-500">Your breeding record and litter card have different values. Pick which is correct – it will be saved to both.</p>
                    </div>
                </div>

                {/* Conflict list */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
                    {items.map(item => (
                        <div key={item.litter._id} className="space-y-3">
                            {items.length > 1 && (
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Litter {item.litter.litter_id_public}
                                </div>
                            )}
                            {item.conflicts.map(c => {
                                const key = `${item.litter._id}__${c.field}`;
                                const chosen = choices[key] ?? 'record';
                                return (
                                    <div key={c.field} className="rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                                            <span className="text-sm font-semibold text-gray-700">{c.label}</span>
                                        </div>
                                        <div className="grid grid-cols-2 divide-x divide-gray-200">
                                            {/* Breeding record option */}
                                            <label className={`flex items-start gap-3 p-4 cursor-pointer transition ${chosen === 'record' ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                                <input
                                                    type="radio"
                                                    name={key}
                                                    value="record"
                                                    checked={chosen === 'record'}
                                                    onChange={() => set(item.litter._id, c.field, 'record')}
                                                    className="mt-0.5 accent-blue-600"
                                                />
                                                <div>
                                                    <div className={`text-xs font-semibold mb-1 ${chosen === 'record' ? 'text-blue-600' : 'text-gray-500'}`}>Breeding Record</div>
                                                    <div className={`text-sm font-bold ${chosen === 'record' ? 'text-blue-800' : 'text-gray-700'}`}>{c.recordValue ?? '?'}</div>
                                                </div>
                                            </label>
                                            {/* Litter card option */}
                                            <label className={`flex items-start gap-3 p-4 cursor-pointer transition ${chosen === 'litter' ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                                                <input
                                                    type="radio"
                                                    name={key}
                                                    value="litter"
                                                    checked={chosen === 'litter'}
                                                    onChange={() => set(item.litter._id, c.field, 'litter')}
                                                    className="mt-0.5 accent-green-600"
                                                />
                                                <div>
                                                    <div className={`text-xs font-semibold mb-1 ${chosen === 'litter' ? 'text-green-600' : 'text-gray-500'}`}>Litter Card</div>
                                                    <div className={`text-sm font-bold ${chosen === 'litter' ? 'text-green-800' : 'text-gray-700'}`}>{c.litterValue ?? '?'}</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onSkip}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition text-sm"
                    >
                        Skip Litter Sync
                    </button>
                    <button
                        type="button"
                        onClick={() => onResolve(choices)}
                        className="flex-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition text-sm"
                    >
                        Save to Both Sides
                    </button>
                </div>
            </div>
        </div>
    );
};

export { ConflictResolutionModal, LitterSyncConflictModal };
