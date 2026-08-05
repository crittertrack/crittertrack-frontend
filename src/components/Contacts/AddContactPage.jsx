import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, X, UserPlus, Loader2, User, Search } from 'lucide-react';
import { UserSearchModal } from '../Modals/SearchModals';


const AddContactPage = ({ API_BASE_URL, authToken, showModalMessage, userProfile }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        personalName: '',
        breederName: '',
        prefix: '',
        suffix: '',
        isKeeper: false,
        isBreeder: false,
        notes: '',
        linkedCTUID: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
        },
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [linkedUserName, setLinkedUserName] = useState('');

    useEffect(() => {
        if (formData.linkedCTUID) {
            axios.get(`${API_BASE_URL}/public/profiles/search?query=${formData.linkedCTUID}&limit=1`)
                .then(res => {
                    const user = res.data?.[0];
                    if (user) {
                        const showPersonalName = user.showPersonalName ?? false;
                        const showBreederName = user.showBreederName ?? false;
                        let displayName;
                        if (showBreederName && showPersonalName && user.personalName && user.breederName) {
                            displayName = `${user.personalName} (${user.breederName})`;
                        } else if (showBreederName && user.breederName) {
                            displayName = user.breederName;
                        } else if (showPersonalName && user.personalName) {
                            displayName = user.personalName;
                        } else {
                            displayName = user.id_public || 'Selected User';
                        }
                        setLinkedUserName(displayName);
                    } else {
                        setLinkedUserName('Unknown User');
                    }
                })
                .catch(() => setLinkedUserName('Unknown User'));
        } else {
            setLinkedUserName('');
        }
    }, [formData.linkedCTUID, API_BASE_URL]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value
            }
        }));
    };

    const handleSelectUser = (user) => {
        if (user) {
            setFormData(prev => ({ ...prev, linkedCTUID: user.id_public }));
        }
        setShowUserSearch(false);
    };

    const handleClearLinkedUser = () => {
        setFormData(prev => ({ ...prev, linkedCTUID: '' }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.personalName && !formData.breederName) {
            showModalMessage('Validation Error', 'Please enter at least a personal name or a breeder name.');
            return;
        }

        setIsSaving(true);
        try {
            await axios.post(`${API_BASE_URL}/contacts`, formData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'Contact added successfully!');
            navigate('/contacts');
        } catch (error) {
            console.error('Error creating contact:', error);
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
            showModalMessage('Error', `Failed to create contact: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            <header className="bg-white rounded-lg shadow p-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <UserPlus size={28} className="text-primary" />
                    Add New Contact
                </h1>
                <p className="text-sm text-gray-600 mt-1">Create a new record for a keeper or breeder.</p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Name */}
                    <div>
                        <label htmlFor="personalName" className="block text-sm font-medium text-gray-700 mb-1">Personal Name</label>
                        <input
                            type="text"
                            id="personalName"
                            name="personalName"
                            value={formData.personalName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Breeder Name */}
                    <div>
                        <label htmlFor="breederName" className="block text-sm font-medium text-gray-700 mb-1">Breeder Name / Kennel</label>
                        <input
                            type="text"
                            id="breederName"
                            name="breederName"
                            value={formData.breederName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Prefix */}
                    <div>
                        <label htmlFor="prefix" className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
                        <input
                            type="text"
                            id="prefix"
                            name="prefix"
                            value={formData.prefix}
                            onChange={handleInputChange}
                            placeholder="e.g., Dr., Mr., Ms."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Suffix */}
                    <div>
                        <label htmlFor="suffix" className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
                        <input
                            type="text"
                            id="suffix"
                            name="suffix"
                            value={formData.suffix}
                            onChange={handleInputChange}
                            placeholder="e.g., Jr., Sr., III"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Address */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                            <input
                                type="text"
                                id="street"
                                name="street"
                                value={formData.address.street}
                                onChange={handleAddressChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.address.city}
                                onChange={handleAddressChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                value={formData.address.state}
                                onChange={handleAddressChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal / ZIP Code</label>
                            <input
                                type="text"
                                id="postalCode"
                                name="postalCode"
                                value={formData.address.postalCode}
                                onChange={handleAddressChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                value={formData.address.country}
                                onChange={handleAddressChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* Linked CTUID */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Linked CritterTrack User</label>
                    <div className="mt-1 p-3 w-full bg-gray-50 border border-gray-300 rounded-md min-h-[60px] flex items-center justify-between">
                        {formData.linkedCTUID && linkedUserName ? (
                            <div className="flex items-center gap-3">
                                <User size={20} className="text-gray-500" />
                                <div>
                                    <p className="font-semibold text-gray-800">{linkedUserName}</p>
                                    <p className="text-sm text-gray-500 font-mono">{formData.linkedCTUID}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No user linked.</p>
                        )}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowUserSearch(true)}
                                className="px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                {formData.linkedCTUID ? 'Change' : 'Search'}
                            </button>
                            {formData.linkedCTUID && (
                                <button
                                    type="button"
                                    onClick={handleClearLinkedUser}
                                    className="p-1.5 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50"
                                    title="Clear linked user"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Optional. Links this contact to a public CritterTrack user profile.</p>
                </div>

                {/* Contact Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Type</label>
                    <div className="flex gap-6">
                        <div className="flex items-center">
                            <input id="isKeeper" name="isKeeper" type="checkbox" checked={formData.isKeeper} onChange={handleInputChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                            <label htmlFor="isKeeper" className="ml-2 block text-sm text-gray-900">Keeper</label>
                        </div>
                        <div className="flex items-center">
                            <input id="isBreeder" name="isBreeder" type="checkbox" checked={formData.isBreeder} onChange={handleInputChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                            <label htmlFor="isBreeder" className="ml-2 block text-sm text-gray-900">Breeder</label>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea id="notes" name="notes" rows="4" value={formData.notes} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Any additional information about this contact..."></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" onClick={() => navigate('/contacts')} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"><X size={18} />Cancel</button>
                    <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-black rounded-md hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {isSaving ? 'Saving...' : 'Save Contact'}
                    </button>
                </div>
            </form>

            {showUserSearch && (
                <UserSearchModal
                    onClose={() => setShowUserSearch(false)}
                    onSelectUser={handleSelectUser}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    userProfile={userProfile}
                />
            )}
        </div>
    );
};

export default AddContactPage;
