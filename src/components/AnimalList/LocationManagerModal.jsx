import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Edit, Trash2, Save, Loader2, Building, DoorOpen } from 'lucide-react';

const LocationManagerModal = ({ isOpen, onClose, locations, onSave, onDelete, saving }) => {
    const modalRef = useRef(null);
    
    const [formState, setFormState] = useState({
        mode: null, // 'addBuilding', 'addRoom', 'edit'
        id: null,
        name: '',
        parentLocationId: ''
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const resetForm = () => {
        setFormState({ mode: null, id: null, name: '', parentLocationId: '' });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleEditClick = (location) => {
        setFormState({
            mode: 'edit',
            id: location._id,
            name: location.name,
            parentLocationId: location.parentLocationId || ''
        });
    };

    const handleAddRoomClick = (buildingId) => {
        setFormState({
            mode: 'addRoom',
            id: null,
            name: '',
            parentLocationId: buildingId
        });
    };

    const handleAddBuildingClick = () => {
        setFormState({
            mode: 'addBuilding',
            id: null,
            name: '',
            parentLocationId: ''
        });
    };
    
    const handleSaveClick = () => {
        if (!formState.name.trim()) return;
        const data = {
            name: formState.name.trim(),
            type: formState.parentLocationId ? 'room' : 'building',
            parentLocationId: formState.parentLocationId || null,
        };
        onSave(formState.id, data);
        resetForm();
    };

    const handleDeleteClick = (id) => {
        if (window.confirm('Are you sure you want to delete this location? All enclosures within it will become unassigned.')) {
            onDelete(id);
        }
    };

    if (!isOpen) return null;

    const buildings = locations.filter(l => !l.parentLocationId).sort((a, b) => a.name.localeCompare(b.name));
    const roomsByBuilding = locations.reduce((acc, loc) => {
        if (loc.parentLocationId) {
            if (!acc[loc.parentLocationId]) acc[loc.parentLocationId] = [];
            acc[loc.parentLocationId].push(loc);
            acc[loc.parentLocationId].sort((a, b) => a.name.localeCompare(b.name));
        }
        return acc;
    }, {});

    const renderForm = () => {
        if (!formState.mode) return null;

        const isEdit = formState.mode === 'edit';
        const isRoom = formState.parentLocationId !== '';

        let title = 'Add New Building';
        if (isEdit) title = 'Edit Location';
        else if (isRoom) title = 'Add New Room';

        return (
            <div className="p-3 bg-blue-50 dark:bg-dark-surface border border-blue-200 dark:border-blue-800 rounded-lg mt-2 space-y-2">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">{title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary block mb-1">Name *</label>
                        <input
                            type="text"
                            value={formState.name}
                            onChange={e => setFormState(f => ({ ...f, name: e.target.value }))}
                            className="w-full text-sm border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1.5 bg-white dark:bg-dark-surface-hover"
                            autoFocus
                        />
                    </div>
                    {isRoom && (
                         <div>
                            <label className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary block mb-1">In Building</label>
                            <select
                                value={formState.parentLocationId}
                                onChange={e => setFormState(f => ({ ...f, parentLocationId: e.target.value }))}
                                disabled={isEdit || formState.mode === 'addRoom'}
                                className="w-full text-sm border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1.5 bg-white dark:bg-dark-surface-hover disabled:bg-gray-100 dark:disabled:bg-dark-border"
                            >
                                {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <button onClick={resetForm} className="px-3 py-1.5 text-sm text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface-hover rounded-lg">Cancel</button>
                    <button onClick={handleSaveClick} disabled={saving || !formState.name.trim()} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium disabled:opacity-50 flex items-center gap-1.5">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {isEdit ? 'Save' : 'Add'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60" onClick={handleClose}>
            <div ref={modalRef} className="bg-white dark:bg-dark-surface rounded-lg shadow-xl p-4 w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3 pb-3 border-b dark:border-dark-border flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Manage Locations</h3>
                    <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover"><X size={20} /></button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-3">
                    {buildings.map(building => (
                        <div key={building._id} className="bg-gray-50 dark:bg-dark-surface-hover border border-gray-200 dark:border-dark-border rounded-lg">
                            <div className="flex items-center justify-between p-2">
                                <div className="flex items-center gap-2">
                                    <Building size={16} className="text-gray-500" />
                                    <span className="font-semibold text-gray-800 dark:text-dark-text">{building.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleAddRoomClick(building._id)} className="p-1 text-xs text-blue-600 hover:bg-blue-100 rounded-full" title="Add Room"><Plus size={14} /></button>
                                    <button onClick={() => handleEditClick(building)} className="p-1 text-xs text-gray-500 hover:bg-gray-200 rounded-full" title="Edit Building"><Edit size={14} /></button>
                                    <button onClick={() => handleDeleteClick(building._id)} className="p-1 text-xs text-red-500 hover:bg-red-100 rounded-full" title="Delete Building"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            {(roomsByBuilding[building._id] || []).length > 0 && (
                                <div className="pl-6 pr-2 pb-2 space-y-1">
                                    {(roomsByBuilding[building._id] || []).map(room => (
                                        <div key={room._id} className="flex items-center justify-between p-1.5 bg-white dark:bg-dark-surface rounded-md">
                                            <div className="flex items-center gap-2">
                                                <DoorOpen size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-700 dark:text-dark-text">{room.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleEditClick(room)} className="p-1 text-xs text-gray-500 hover:bg-gray-200 rounded-full" title="Edit Room"><Edit size={14} /></button>
                                                <button onClick={() => handleDeleteClick(room._id)} className="p-1 text-xs text-red-500 hover:bg-red-100 rounded-full" title="Delete Room"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {formState.mode === 'addRoom' && formState.parentLocationId === building._id && renderForm()}
                        </div>
                    ))}
                    
                    {buildings.length === 0 && !formState.mode && <p className="text-center text-sm text-gray-500 py-8">No locations defined yet.</p>}

                    {formState.mode === 'edit' && renderForm()}
                </div>

                <div className="pt-3 border-t dark:border-dark-border flex-shrink-0">
                    {!formState.mode && (
                        <button onClick={handleAddBuildingClick} className="w-full flex items-center justify-center gap-2 p-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                            <Plus size={16} /> Add New Building
                        </button>
                    )}
                    {formState.mode === 'addBuilding' && renderForm()}
                </div>
            </div>
        </div>
    );
};

export default LocationManagerModal;