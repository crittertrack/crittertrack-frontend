import React, { useRef, useEffect } from 'react';
import { X, Home, Cat } from 'lucide-react';
import AnimalImage from '../components/shared/AnimalImage';

const EnclosureModal = ({
    isOpen,
    onClose,
    enclosureFormData,
    setEnclosureFormData,
    editingEnclosureId,
    setEditingEnclosureId,
    handleSaveEnclosure,
    enclosureSaving,
    enclosureImageFile,
    setEnclosureImageFile,
    enclosureImagePreview,
    setEnclosureImagePreview,
    newEnclosureTag,
    setNewEnclosureTag,
    handleEnclosureTagAdd,
    handleEnclosureTagRemove,
    allSpecies,
    handleEnclosureSpeciesLabelAdd,
    handleEnclosureSpeciesLabelRemove,
    newCleaningTaskName,
    setNewCleaningTaskName,
    newCleaningTaskFreq,
    setNewCleaningTaskFreq,
}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEnclosureImageFile(file);
            setEnclosureImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60" onClick={onClose}>
            <div ref={modalRef} className="bg-white dark:bg-dark-surface rounded-lg shadow-xl p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3 pb-3 border-b dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">{editingEnclosureId ? 'Edit Enclosure' : 'Add New Enclosure'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 bg-gray-200 dark:bg-dark-surface-hover rounded-lg flex items-center justify-center overflow-hidden border border-gray-300 dark:border-dark-border">
                                {enclosureImagePreview ? (
                                    <img src={enclosureImagePreview} alt="Enclosure" className="w-full h-full object-cover" />
                                ) : (
                                    <Home size={48} className="text-gray-400 dark:text-dark-text-muted" />
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input type="file" id="enclosure-image-upload" accept="image/*" onChange={handleImageChange} className="hidden" />
                                <label htmlFor="enclosure-image-upload" className="cursor-pointer bg-white dark:bg-dark-surface text-xs font-semibold text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-dark-surface-hover">
                                    Choose Image
                                </label>
                                {(enclosureImagePreview || enclosureFormData.imageUrl) && (
                                    <button onClick={() => { setEnclosureImageFile(null); setEnclosureImagePreview(null); setEnclosureFormData(p => ({ ...p, imageUrl: '' })); }} className="text-xs text-red-500 hover:text-red-700">
                                        Remove Image
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="sm:col-span-2 pt-2">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text border-b pb-1 mb-2">General</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                                <input type="text" value={enclosureFormData.name} onChange={e => setEnclosureFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Tank 1, Vivarium A" className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                                <input type="text" value={enclosureFormData.enclosureType} onChange={e => setEnclosureFormData(p => ({ ...p, enclosureType: e.target.value }))} placeholder="e.g. Tank, Cage, Vivarium" className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Purpose</label>
                                <select
                                    value={enclosureFormData.purpose || 'general'}
                                    onChange={e => setEnclosureFormData(p => ({ ...p, purpose: e.target.value }))}
                                    className="block w-full p-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-dark-surface">
                                    <option value="general">General</option>
                                    <option value="nursery">Nursery / Breeding</option>
                                    <option value="quarantine">Quarantine</option>
                                    <option value="isolation">Medical / Isolation</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                                <input type="text" value={enclosureFormData.location} onChange={e => setEnclosureFormData(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Reptile Room" className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Dimensions</label>
                                <div className="grid grid-cols-4 gap-2">
                                    <input type="number" value={enclosureFormData.length} onChange={e => setEnclosureFormData(p => ({ ...p, length: e.target.value }))} placeholder="L" className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
                                    <input type="number" value={enclosureFormData.width} onChange={e => setEnclosureFormData(p => ({ ...p, width: e.target.value }))} placeholder="W" className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
                                    <input type="number" value={enclosureFormData.height} onChange={e => setEnclosureFormData(p => ({ ...p, height: e.target.value }))} placeholder="H" className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
                                    <select
                                        value={enclosureFormData.dimensionsUnit || 'in'}
                                        onChange={e => setEnclosureFormData(p => ({ ...p, dimensionsUnit: e.target.value }))}
                                        className="block w-full p-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-dark-surface"
                                    >
                                        <option value="in">in</option>
                                        <option value="cm">cm</option>
                                        <option value="m">m</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
                                <input type="number" value={enclosureFormData.capacity} onChange={e => setEnclosureFormData(p => ({ ...p, capacity: e.target.value }))} placeholder="Max animals" className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="sm:col-span-2 pt-2">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text border-b pb-1 mb-2">Environment</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Temp Min</label>
                                    <input type="number" value={enclosureFormData.tempMin} onChange={e => setEnclosureFormData(p => ({ ...p, tempMin: e.target.value }))} placeholder="e.g. 22" className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Temp Max</label>
                                    <input type="number" value={enclosureFormData.tempMax} onChange={e => setEnclosureFormData(p => ({ ...p, tempMax: e.target.value }))} placeholder="e.g. 28" className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                                    <select value={enclosureFormData.temperatureUnit || 'C'} onChange={e => setEnclosureFormData(p => ({ ...p, temperatureUnit: e.target.value }))} className="block w-full p-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-dark-surface">
                                        <option value="C">°C</option>
                                        <option value="F">°F</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Humidity Min</label>
                                    <input type="number" value={enclosureFormData.humidityMin} onChange={e => setEnclosureFormData(p => ({ ...p, humidityMin: e.target.value }))} placeholder="e.g. 40" className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Humidity Max</label>
                                    <input type="number" value={enclosureFormData.humidityMax} onChange={e => setEnclosureFormData(p => ({ ...p, humidityMax: e.target.value }))} placeholder="e.g. 60" className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-medium text-gray-600">Lights On/Off Time</label>
                                    <div className="flex items-center gap-1 text-xs">
                                        <button type="button" onClick={() => setEnclosureFormData(p => ({ ...p, lightTimeFormat: '12h' }))} className={`px-2 py-0.5 rounded ${enclosureFormData.lightTimeFormat === '12h' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>12h</button>
                                        <button type="button" onClick={() => setEnclosureFormData(p => ({ ...p, lightTimeFormat: '24h' }))} className={`px-2 py-0.5 rounded ${enclosureFormData.lightTimeFormat === '24h' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>24h</button>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <input type="time" value={enclosureFormData.lightsOnTime} onChange={e => setEnclosureFormData(p => ({ ...p, lightsOnTime: e.target.value }))} className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
                                    <input type="time" value={enclosureFormData.lightsOffTime} onChange={e => setEnclosureFormData(p => ({ ...p, lightsOffTime: e.target.value }))} className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sm:col-span-2 pt-2">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text border-b pb-1 mb-2">Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                <input type="text" value={enclosureFormData.notes}
                                    onChange={e => setEnclosureFormData(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="Optional notes"
                                    className="block w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
                                <div className="flex items-center gap-2">
                                    <input type="text" value={newEnclosureTag} onChange={e => setNewEnclosureTag(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleEnclosureTagAdd()} placeholder="Add tag..." className="flex-1 p-2 text-sm border border-gray-300 rounded-lg" />
                                    <button type="button" onClick={handleEnclosureTagAdd} className="px-3 py-2 text-sm bg-gray-200 rounded-lg">+</button>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {enclosureFormData.tags.map(tag => <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1">{tag} <button type="button" onClick={() => handleEnclosureTagRemove(tag)} className="text-red-400 hover:text-red-600">x</button></span>)}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Suitable Species</label>
                                <div className="flex items-center gap-2">
                                    <select
                                        onChange={(e) => { if (e.target.value) handleEnclosureSpeciesLabelAdd(e.target.value); e.target.value = ''; }}
                                        value=""
                                        className="flex-1 p-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-dark-surface"
                                    >
                                        <option value="" disabled>Select a species to add...</option>
                                        {(allSpecies || []).filter(s => !(enclosureFormData.speciesLabels || []).includes(s)).map(species => (
                                            <option key={species} value={species}>{species}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {enclosureFormData.speciesLabels.map(label => <span key={label} className="text-xs bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1">{label} <button type="button" onClick={() => handleEnclosureSpeciesLabelRemove(label)} className="text-red-400 hover:text-red-600">x</button></span>)}
                                </div>
                            </div>
                            {/* Cleaning Tasks */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Cleaning Tasks</label>
                                {(enclosureFormData.cleaningTasks || []).length > 0 && (
                                    <div className="space-y-1 mb-2">
                                        {(enclosureFormData.cleaningTasks || []).map((task, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs bg-white rounded border border-gray-200 px-2 py-1.5">
                                                <span className="flex-1 font-medium text-gray-700">{task.taskName}</span>
                                                {task.frequencyDays && <span className="text-gray-400">Every {task.frequencyDays}d</span>}
                                                <button type="button" onClick={() => setEnclosureFormData(p => ({ ...p, cleaningTasks: (p.cleaningTasks || []).filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600 p-0.5" title="Remove"><X size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <input type="text" value={newCleaningTaskName} onChange={e => setNewCleaningTaskName(e.target.value)}
                                        placeholder="e.g. Spot clean, Full clean, Bulb change"
                                        className="flex-1 p-1.5 text-xs border border-gray-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" />
                                    <input type="number" value={newCleaningTaskFreq} onChange={e => setNewCleaningTaskFreq(e.target.value)}
                                        placeholder="Days" min="1"
                                        className="w-16 p-1.5 text-xs border border-gray-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" />
                                    <button type="button" onClick={() => {
                                        if (!newCleaningTaskName.trim()) return;
                                        setEnclosureFormData(p => ({ ...p, cleaningTasks: [...(p.cleaningTasks || []), { taskName: newCleaningTaskName.trim(), frequencyDays: newCleaningTaskFreq ? Number(newCleaningTaskFreq) : null, lastDoneDate: null }] }));
                                        setNewCleaningTaskName(''); setNewCleaningTaskFreq('');
                                    }} className="px-2 py-1.5 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 whitespace-nowrap">+ Add</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={onClose}
                            className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button onClick={() => {
                            console.log('[EnclosureModal] Save Changes button clicked. Form data:', enclosureFormData);
                            handleSaveEnclosure();
                        }} disabled={enclosureSaving || !enclosureFormData.name.trim()}
                            className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50">
                            {enclosureSaving ? 'Saving...' : (editingEnclosureId ? 'Save Changes' : 'Create Enclosure')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default EnclosureModal;