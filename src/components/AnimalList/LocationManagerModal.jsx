import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, Building, Home, MapPin } from 'lucide-react';

const LocationManagerModal = ({ isOpen, onClose, locations, onSave, onDelete, saving }) => {
    const [formState, setFormState] = useState(null); // null when not editing/adding

    const buildings = locations.filter(l => l.type === 'building');
    const rooms = locations.filter(l => l.type === 'room');

    const handleEdit = (location) => {
        setFormState({
            id: location._id,
            name: location.name,
            type: location.type,
            parentLocationId: location.parentLocationId || '',
            address: location.address || { street: '', city: '', state: '', postalCode: '', country: '' }
        });
    };

    const handleAddNewBuilding = () => {
        setFormState({
            id: null,
            name: '',
            type: 'building',
            parentLocationId: '',
            address: { street: '', city: '', state: '', postalCode: '', country: '' }
        });
    };

    const handleAddRoom = (buildingId) => {
        setFormState({
            id: null,
            name: '',
            type: 'room',
            parentLocationId: buildingId,
            address: { street: '', city: '', state: '', postalCode: '', country: '' }
        });
    };

    const handleCancel = () => {
        setFormState(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            address: { ...prev.address, [name]: value }
        }));
    };

    const handleSave = () => {
        if (!formState.name.trim()) return;
        onSave(formState.id, formState);
        setFormState(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this location? This will also delete any rooms inside it.')) {
            onDelete(id);
        }
    };
    
    const formatAddress = (address) => {
        if (!address) return null;
        const parts = [address.street, address.city, address.state, address.postalCode, address.country].filter(Boolean);
        return parts.join(', ');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card-bg border border-transparent dark:border-dark-text-muted rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-dark-text-muted">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text">Manage Locations</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover dark:text-dark-text-muted"><X size={22} /></button>
                </div>

                {formState ? (
                    // Form View
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg text-gray-800 dark:text-dark-text">{formState.id ? 'Edit' : 'Add'} {formState.type === 'building' ? 'Building' : 'Room'}</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Name</label>
                            <input type="text" name="name" value={formState.name} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 dark:border-dark-text-muted rounded-md shadow-sm bg-white dark:bg-dark-card-bg dark:text-dark-text" />
                        </div>
                        {formState.type === 'room' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Building</label>
                                <select name="parentLocationId" value={formState.parentLocationId} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 dark:border-dark-text-muted rounded-md shadow-sm bg-white dark:bg-dark-card-bg dark:text-dark-text">
                                    <option value="">Select a building</option>
                                    {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                </select>
                            </div>
                        )}
                        {formState.type === 'building' && (
                            <div className="space-y-3 p-3 border rounded-md bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-text-muted">
                                <h5 className="font-medium text-gray-600 dark:text-dark-text">Address (Optional)</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div><label className="text-xs text-gray-500 dark:text-dark-text-muted">Street</label><input type="text" name="street" value={formState.address.street || ''} onChange={handleAddressChange} className="mt-1 block w-full p-2 text-sm border border-gray-300 dark:border-dark-text-muted rounded-md bg-white dark:bg-dark-card-bg dark:text-dark-text" /></div>
                                    <div><label className="text-xs text-gray-500 dark:text-dark-text-muted">City</label><input type="text" name="city" value={formState.address.city || ''} onChange={handleAddressChange} className="mt-1 block w-full p-2 text-sm border border-gray-300 dark:border-dark-text-muted rounded-md bg-white dark:bg-dark-card-bg dark:text-dark-text" /></div>
                                    <div><label className="text-xs text-gray-500 dark:text-dark-text-muted">State / Province</label><input type="text" name="state" value={formState.address.state || ''} onChange={handleAddressChange} className="mt-1 block w-full p-2 text-sm border border-gray-300 dark:border-dark-text-muted rounded-md bg-white dark:bg-dark-card-bg dark:text-dark-text" /></div>
                                    <div><label className="text-xs text-gray-500 dark:text-dark-text-muted">Postal Code</label><input type="text" name="postalCode" value={formState.address.postalCode || ''} onChange={handleAddressChange} className="mt-1 block w-full p-2 text-sm border border-gray-300 dark:border-dark-text-muted rounded-md bg-white dark:bg-dark-card-bg dark:text-dark-text" /></div>
                                    <div className="sm:col-span-2"><label className="text-xs text-gray-500 dark:text-dark-text-muted">Country</label><input type="text" name="country" value={formState.address.country || ''} onChange={handleAddressChange} className="mt-1 block w-full p-2 text-sm border border-gray-300 dark:border-dark-text-muted rounded-md bg-white dark:bg-dark-card-bg dark:text-dark-text" /></div>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 pt-4">
                            <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-dark-card-bg dark:text-dark-text dark:border-dark-text-muted dark:hover:bg-dark-surface-hover">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary dark:bg-dark-primary rounded-md hover:bg-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                        {buildings.map(building => {
                            const buildingRooms = rooms.filter(r => r.parentLocationId === building._id);
                            const addressStr = formatAddress(building.address);
                            return (
                                <div key={building._id} className="bg-gray-50 dark:bg-dark-surface p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2"><Building size={18} className="text-gray-600 dark:text-dark-text-secondary" /><span className="font-semibold text-gray-800 dark:text-dark-text">{building.name}</span></div>
                                            {addressStr && (<div className="text-xs text-gray-500 dark:text-dark-text-muted mt-1 ml-7 flex items-center gap-1.5"><MapPin size={12} /><span>{addressStr}</span></div>)}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => handleEdit(building)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-dark-surface-hover dark:text-dark-text-secondary" title="Edit Building"><Edit size={14} /></button>
                                            <button onClick={() => handleDelete(building._id)} className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500" title="Delete Building"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="pl-7 mt-2 space-y-2">
                                        {buildingRooms.map(room => (
                                            <div key={room._id} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text-secondary"><Home size={14} /><span>{room.name}</span></div>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => handleEdit(room)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-surface-hover dark:text-dark-text-secondary"><Edit size={12} /></button>
                                                    <button onClick={() => onDelete(room._id)} className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => handleAddRoom(building._id)} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"><Plus size={14} /> Add Room</button>
                                    </div>
                                </div>
                            );
                        })}
                        <button onClick={handleAddNewBuilding} className="w-full mt-4 px-4 py-2 text-sm font-semibold text-white bg-accent dark:bg-dark-accent rounded-md hover:bg-accent/90 dark:hover:bg-dark-accent/90 flex items-center justify-center gap-2"><Plus size={16} /> Add New Building</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationManagerModal;