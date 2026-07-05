import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, X, UserPlus, Loader2 } from 'lucide-react';

const AddContactPage = ({ API_BASE_URL, authToken, showModalMessage }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        personalName: '',
        breederName: '',
        prefix: '',
        suffix: '',
        isKeeper: false,
        isBreeder: false,
        notes: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
        </div>
    );
};

export default AddContactPage;
