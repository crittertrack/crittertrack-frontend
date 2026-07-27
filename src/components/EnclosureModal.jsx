import React, { useRef, useEffect, useState } from 'react';
import { X, Home, Trash2, Save, Loader2, Search, Package, RefreshCw, Wrench, Settings, Utensils, Info } from 'lucide-react';
import axios from 'axios';
import { SpeciesPickerModal } from './Modals/SpeciesModals';

const EnclosureModal = ({
    isOpen,
    onClose,
    enclosureFormData,
    setEnclosureFormData,
    editingEnclosureId,
    setEditingEnclosureId,
    handleSaveEnclosure,
    handleDeleteEnclosure,
    enclosureSaving,
    enclosureImageFile,
    setEnclosureImageFile,
    enclosureImagePreview,
    setEnclosureImagePreview,
    newEnclosureTag,
    setNewEnclosureTag,
    handleEnclosureTagAdd,
    handleEnclosureTagRemove,
    handleEnclosureSpeciesLabelAdd,
    handleEnclosureSpeciesLabelRemove,
    newCleaningTaskName,
    setNewCleaningTaskName,
    newCleaningTaskFreq,
    setNewCleaningTaskFreq,
    API_BASE_URL,
    authToken,
    locations = [],
    onManageLocations,
    showModalMessage,
    speciesOptions = [],
    supplies = [],
}) => {
    const modalRef = useRef(null);
    const [isSpeciesModalOpen, setIsSpeciesModalOpen] = useState(false);
    const [newCleaningTaskFreqUnit, setNewCleaningTaskFreqUnit] = useState('days');
    const [newCleaningTaskType, setNewCleaningTaskType] = useState('Cleaning');
    const [newCleaningTaskNotes, setNewCleaningTaskNotes] = useState('');
    const [newCleaningTaskSupplies, setNewCleaningTaskSupplies] = useState([]); // [{ supplyId, quantity }]

    const TASK_TYPE_STYLES = {
        Cleaning: { icon: <Wrench size={11} />, color: 'text-amber-700' },
        Maintenance: { icon: <Settings size={11} />, color: 'text-orange-700' },
        Feeding: { icon: <Utensils size={11} />, color: 'text-red-700' },
        Other: { icon: <Info size={11} />, color: 'text-gray-600' },
    };

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEnclosureImageFile(file);
            setEnclosureImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSelectSpecies = (speciesName) => {
        handleEnclosureSpeciesLabelAdd(speciesName);
        setIsSpeciesModalOpen(false);
    };

    const handleAddSupplyToTask = (supply) => {
        if (!newCleaningTaskSupplies.find(s => s.supplyId === supply._id)) {
            setNewCleaningTaskSupplies([...newCleaningTaskSupplies, { supplyId: supply._id, supplyName: supply.name, quantity: 1 }]);
        }
    };

    const handleRemoveSupplyFromTask = (supplyId) => {
        setNewCleaningTaskSupplies(newCleaningTaskSupplies.filter(s => s.supplyId !== supplyId));
    };
    const handleSupplyQuantityChange = (supplyId, quantity) => {
        setNewCleaningTaskSupplies(newCleaningTaskSupplies.map(s => s.supplyId === supplyId ? { ...s, quantity: Math.max(1, Number(quantity)) } : s));
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60">
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
                                    <option value="reproduction">Nursery / Breeding</option>
                                    <option value="medical">Medical</option>
                                    <option value="quarantine">Quarantine</option>
                                    <option value="sale">For Sale</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            {(enclosureFormData.purpose === 'other') && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Purpose Description</label>
                                    <input type="text" value={enclosureFormData.purposeDescription || ''} onChange={e => setEnclosureFormData(p => ({ ...p, purposeDescription: e.target.value }))} placeholder="e.g. Pet-only, Geriatric care" className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Building</label>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={enclosureFormData.buildingId || ''}
                                        onChange={e => setEnclosureFormData(p => ({ ...p, buildingId: e.target.value, roomId: '' }))}
                                        className="block w-full p-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-dark-surface">
                                        <option value="">No Building</option>
                                        {Array.isArray(locations) && locations.filter(l => l.type === 'building').map(building => (
                                            <option key={building._id} value={building._id}>{building.name}</option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={onManageLocations} className="p-2 text-sm bg-gray-200 rounded-lg" title="Manage Locations">...</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Room</label>
                                <select
                                    value={enclosureFormData.roomId || ''}
                                    onChange={e => setEnclosureFormData(p => ({ ...p, roomId: e.target.value }))}
                                    disabled={!enclosureFormData.buildingId}
                                    className="block w-full p-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-dark-surface disabled:bg-gray-100 dark:disabled:bg-dark-border"
                                >
                                    <option value="">No Room</option>
                                    {enclosureFormData.buildingId && Array.isArray(locations) && locations
                                        .filter(l => l.type === 'room' && l.parentLocationId === enclosureFormData.buildingId)
                                        .map(room => (
                                            <option key={room._id} value={room._id}>{room.name}</option>
                                        ))
                                    }
                                </select>
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
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Lighting Type(s)</label>
                                <input
                                    type="text"
                                    value={enclosureFormData.lightingType || ''}
                                    onChange={e => setEnclosureFormData(p => ({ ...p, lightingType: e.target.value }))}
                                    placeholder="e.g. LED, UVB, Infrared"
                                    className="block w-full p-2 text-sm border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Bedding / Substrate</label>
                                <input
                                    type="text"
                                    list="bedding-supplies"
                                    value={enclosureFormData.bedding || ''}
                                    onChange={e => setEnclosureFormData(p => ({ ...p, bedding: e.target.value }))}
                                    placeholder="e.g. Aspen shavings, Coco fiber"
                                    className="block w-full p-2 text-sm border border-gray-300 rounded-lg"
                                />
                                <datalist id="bedding-supplies">
                                    {supplies.filter(s => s.category === 'Bedding').map(s => (
                                        <option key={s._id} value={s.name} />
                                    ))}
                                </datalist>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Enrichment</label>
                                <textarea value={enclosureFormData.enrichment || ''} onChange={e => setEnclosureFormData(p => ({ ...p, enrichment: e.target.value }))}
                                    placeholder="e.g. Wheels, hides, climbing branches" rows="2"
                                    className="block w-full p-2 text-sm border border-gray-300 rounded-lg" />
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
                                    <button
                                        type="button"
                                        onClick={() => setIsSpeciesModalOpen(true)}
                                        className="w-full text-left flex-1 p-2 text-sm border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-surface-hover"
                                    >
                                        {enclosureFormData.speciesLabels && enclosureFormData.speciesLabels.length > 0
                                            ? `Edit species (${enclosureFormData.speciesLabels.length} selected)`
                                            : '+ Add suitable species'}
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {enclosureFormData.speciesLabels && enclosureFormData.speciesLabels.map(label => (
                                        <span key={label} className="text-xs bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-1 rounded-full flex items-center gap-1 border border-green-300 dark:border-green-700">
                                            {label} <button type="button" onClick={() => handleEnclosureSpeciesLabelRemove(label)} className="text-green-500 hover:text-red-500 transition">x</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {/* Cleaning Tasks */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Tasks</label>
                                <div className="space-y-2">
                                    {(enclosureFormData.cleaningTasks || []).map((task, idx) => (
                                        <div key={idx} className="bg-white dark:bg-dark-surface-hover p-2 rounded-lg border border-gray-200 dark:border-dark-border">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-sm text-gray-800 dark:text-dark-text">{task.taskName}</p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-dark-text-muted mt-0.5 flex-wrap">
                                                        {task.type && (() => {
                                                            const type = task.type || 'Other';
                                                            const Icon = TASK_TYPE_STYLES[type]?.icon;
                                                            return (
                                                                <span className="flex items-center gap-1 font-semibold bg-gray-200 dark:bg-dark-border px-1.5 py-0.5 rounded">
                                                                    {Icon}
                                                                    {type}
                                                                </span>
                                                            );
                                                        })()}
                                                        {(task.frequencyDays || task.frequency) && (
                                                            <span className="flex items-center gap-1">
                                                                <RefreshCw size={11} /> Every {task.frequencyDays || task.frequency} {task.frequencyUnit || 'days'}
                                                            </span>
                                                        )}
                                                        {task.notes && <p className="italic">"{task.notes}"</p>}
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => setEnclosureFormData(p => ({ ...p, cleaningTasks: (p.cleaningTasks || []).filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600 p-1" title="Remove"><Trash2 size={14} /></button>
                                            </div>
                                            {task.assignedSupplies && task.assignedSupplies.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-dark-border">
                                                    <p className="text-xs font-semibold text-gray-600 dark:text-dark-text-secondary">Supplies:</p>
                                                    <ul className="text-xs text-gray-600 dark:text-dark-text-secondary mt-1 space-y-0.5">
                                                        {task.assignedSupplies.map(s => (
                                                            <li key={s.supplyId} className="flex items-center gap-1">
                                                                <Package size={12} />
                                                                <span>{s.quantity} x {s.supplyName}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-100 dark:bg-dark-surface-hover p-3 mt-2 rounded-lg border border-gray-200 dark:border-dark-border space-y-2">
                                    <h5 className="text-xs font-bold text-gray-700 dark:text-dark-text">Add New Task</h5>
                                    <select value={newCleaningTaskType} onChange={e => setNewCleaningTaskType(e.target.value)} className="w-full p-1.5 text-xs border border-gray-300 rounded-lg bg-white dark:bg-dark-surface">
                                        <option value="Cleaning">Cleaning</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Feeding">Feeding</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <input type="text" value={newCleaningTaskName} onChange={e => setNewCleaningTaskName(e.target.value)} placeholder="Task name (e.g. Full substrate change)" className="w-full p-1.5 text-xs border border-gray-300 rounded-lg" />
                                    <div className="flex gap-2">
                                        <input type="number" value={newCleaningTaskFreq} onChange={e => setNewCleaningTaskFreq(e.target.value)} placeholder="Frequency" min="1" className="w-20 p-1.5 text-xs border border-gray-300 rounded-lg" />
                                        <select value={newCleaningTaskFreqUnit} onChange={e => setNewCleaningTaskFreqUnit(e.target.value)} className="flex-1 p-1.5 text-xs border border-gray-300 rounded-lg bg-white dark:bg-dark-surface">
                                            <option value="days">Days</option>
                                            <option value="weeks">Weeks</option>
                                            <option value="months">Months</option>
                                        </select>
                                    </div>
                                    <input type="text" value={newCleaningTaskNotes} onChange={e => setNewCleaningTaskNotes(e.target.value)} placeholder="Optional notes for this task" className="w-full p-1.5 text-xs border border-gray-300 rounded-lg" />
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Supplies Used</label>
                                        {newCleaningTaskSupplies.length > 0 && (
                                            <div className="space-y-1 mb-1">
                                                {newCleaningTaskSupplies.map(supply => (
                                                    <div key={supply.supplyId} className="flex items-center gap-2 text-xs bg-white p-1 rounded border">
                                                        <span className="flex-1">{supply.supplyName}</span>
                                                        <input type="number" value={supply.quantity} onChange={e => handleSupplyQuantityChange(supply.supplyId, e.target.value)} className="w-12 p-1 border rounded" min="1" />
                                                        <button type="button" onClick={() => handleRemoveSupplyFromTask(supply.supplyId)} className="text-red-500"><Trash2 size={12} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <select onChange={e => { const supply = supplies.find(s => s._id === e.target.value); if (supply) handleAddSupplyToTask(supply); e.target.value = ''; }} className="w-full p-1.5 text-xs border border-gray-300 rounded-lg bg-white">
                                            <option value="">+ Add a supply...</option>
                                            {supplies.filter(s => !newCleaningTaskSupplies.find(nts => nts.supplyId === s._id)).map(supply => (
                                                <option key={supply._id} value={supply._id}>{supply.name} ({supply.currentStock} {supply.unit})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button type="button" onClick={() => {
                                        if (!newCleaningTaskName.trim()) return;
                                        const newTask = { taskName: newCleaningTaskName.trim(), type: newCleaningTaskType, frequency: newCleaningTaskFreq ? Number(newCleaningTaskFreq) : null, frequencyUnit: newCleaningTaskFreq ? newCleaningTaskFreqUnit : null, notes: newCleaningTaskNotes.trim() || null, assignedSupplies: newCleaningTaskSupplies, lastDoneDate: null };
                                        setEnclosureFormData(p => ({ ...p, cleaningTasks: [...(p.cleaningTasks || []), newTask] }));
                                        setNewCleaningTaskName(''); setNewCleaningTaskFreq(''); setNewCleaningTaskFreqUnit('days'); setNewCleaningTaskNotes(''); setNewCleaningTaskSupplies([]); setNewCleaningTaskType('Cleaning');
                                    }} className="w-full px-2 py-1.5 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700">+ Add Task</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center gap-2 pt-2">
                        <div>
                            {editingEnclosureId && (
                                <button
                                    type="button"
                                    onClick={handleDeleteEnclosure}
                                    className="text-xs px-3 py-1.5 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={onClose}
                                className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={handleSaveEnclosure} disabled={enclosureSaving || !enclosureFormData.name.trim()}
                                className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-1.5">
                                {enclosureSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {editingEnclosureId ? 'Save Changes' : 'Create Enclosure'}
                            </button>
                        </div>
                    </div>
                </div>

                {isSpeciesModalOpen && (
                <SpeciesPickerModal
                    speciesOptions={speciesOptions.filter(s => !(enclosureFormData.speciesLabels || []).includes(s.name))}
                    onSelect={handleSelectSpecies}
                    onClose={() => setIsSpeciesModalOpen(false)}
                    X={X}
                    Search={Search}
                />
                )}
            </div>
        </div>
    );
};


export default EnclosureModal;
