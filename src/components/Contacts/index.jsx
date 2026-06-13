import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Users, Plus, Edit, Trash2, X, Save, MapPin, Globe, Hash, UserCheck, UserX, Filter, Search } from 'lucide-react';

const ContactsPage = ({ API_BASE_URL, authToken, showModalMessage }) => {
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // 'all', 'keeper', 'breeder'
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [formData, setFormData] = useState({
        linkedCTUID: '',
        personalName: '',
        breederName: '',
        prefix: '',
        suffix: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
        },
        isKeeper: false,
        isBreeder: false,
        notes: ''
    });

    // Fetch contacts on mount
    useEffect(() => {
        fetchContacts();
    }, []);

    // Apply filters when contacts, filterType, or searchTerm changes
    useEffect(() => {
        applyFilters();
    }, [contacts, filterType, searchTerm]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/contacts`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            showModalMessage('Error', 'Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...contacts];

        // Filter by type
        if (filterType === 'keeper') {
            filtered = filtered.filter(c => c.isKeeper);
        } else if (filterType === 'breeder') {
            filtered = filtered.filter(c => c.isBreeder);
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(c => 
                (c.personalName && c.personalName.toLowerCase().includes(term)) ||
                (c.breederName && c.breederName.toLowerCase().includes(term)) ||
                (c.linkedCTUID && c.linkedCTUID.toLowerCase().includes(term)) ||
                (c.address?.city && c.address.city.toLowerCase().includes(term)) ||
                (c.address?.country && c.address.country.toLowerCase().includes(term))
            );
        }

        setFilteredContacts(filtered);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.isKeeper && !formData.isBreeder) {
            showModalMessage('Validation Error', 'Please select at least one type (Keeper or Breeder)');
            return;
        }

        if (!formData.personalName && !formData.breederName) {
            showModalMessage('Validation Error', 'Please provide at least one name (Personal or Breeder)');
            return;
        }

        try {
            if (editingContact) {
                // Update existing contact
                await axios.put(`${API_BASE_URL}/contacts/${editingContact._id}`, formData, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                showModalMessage('Success', 'Contact updated successfully');
            } else {
                // Create new contact
                await axios.post(`${API_BASE_URL}/contacts`, formData, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                showModalMessage('Success', 'Contact created successfully');
            }

            // Reset form and refresh list
            resetForm();
            fetchContacts();
        } catch (error) {
            console.error('Error saving contact:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to save contact');
        }
    };

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setFormData({
            linkedCTUID: contact.linkedCTUID || '',
            personalName: contact.personalName || '',
            breederName: contact.breederName || '',
            prefix: contact.prefix || '',
            suffix: contact.suffix || '',
            address: contact.address || {
                street: '',
                city: '',
                state: '',
                postalCode: '',
                country: ''
            },
            isKeeper: contact.isKeeper || false,
            isBreeder: contact.isBreeder || false,
            notes: contact.notes || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (contactId) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/contacts/${contactId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'Contact deleted successfully');
            fetchContacts();
        } catch (error) {
            console.error('Error deleting contact:', error);
            showModalMessage('Error', 'Failed to delete contact');
        }
    };

    const resetForm = () => {
        setFormData({
            linkedCTUID: '',
            personalName: '',
            breederName: '',
            prefix: '',
            suffix: '',
            address: {
                street: '',
                city: '',
                state: '',
                postalCode: '',
                country: ''
            },
            isKeeper: false,
            isBreeder: false,
            notes: ''
        });
        setEditingContact(null);
        setShowForm(false);
    };

    const getDisplayName = (contact) => {
        const parts = [];
        if (contact.prefix) parts.push(contact.prefix);
        if (contact.personalName) parts.push(contact.personalName);
        if (contact.breederName) parts.push(`(${contact.breederName})`);
        if (contact.suffix) parts.push(contact.suffix);
        return parts.join(' ') || 'Unnamed Contact';
    };

    if (loading) {
        return (
            <div className="w-full max-w-7xl bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl bg-white p-6 rounded-xl shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users size={28} className="text-primary" />
                        Contacts
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage keepers and breeders for your animals
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Contact
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            filterType === 'all'
                                ? 'bg-primary text-black'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterType('keeper')}
                        className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 ${
                            filterType === 'keeper'
                                ? 'bg-primary text-black'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <UserCheck size={16} />
                        Keepers
                    </button>
                    <button
                        onClick={() => setFilterType('breeder')}
                        className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 ${
                            filterType === 'breeder'
                                ? 'bg-primary text-black'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Users size={16} />
                        Breeders
                    </button>
                </div>
            </div>

            {/* Contact List */}
            {filteredContacts.length === 0 ? (
                <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">
                        {searchTerm || filterType !== 'all'
                            ? 'No contacts match your filters'
                            : 'No contacts yet. Add your first contact to get started!'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredContacts.map(contact => (
                        <div
                            key={contact._id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 text-lg">
                                        {getDisplayName(contact)}
                                    </h3>
                                    {contact.linkedCTUID && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <Hash size={12} />
                                            {contact.linkedCTUID}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(contact)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(contact._id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Type Badges */}
                            <div className="flex gap-2 mb-3">
                                {contact.isKeeper && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center gap-1">
                                        <UserCheck size={12} />
                                        Keeper
                                    </span>
                                )}
                                {contact.isBreeder && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded flex items-center gap-1">
                                        <Users size={12} />
                                        Breeder
                                    </span>
                                )}
                            </div>

                            {/* Address */}
                            {(contact.address?.city || contact.address?.country) && (
                                <div className="text-sm text-gray-600 flex items-start gap-1 mb-2">
                                    <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                                    <span>
                                        {[contact.address.city, contact.address.country]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </span>
                                </div>
                            )}

                            {/* Animals Count */}
                            {contact.assignedAnimals && contact.assignedAnimals.length > 0 && (
                                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                                    {contact.assignedAnimals.length} animal{contact.assignedAnimals.length !== 1 ? 's' : ''} assigned
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Contact Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingContact ? 'Edit Contact' : 'Add New Contact'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Contact Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Type *
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isKeeper"
                                            checked={formData.isKeeper}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">Keeper</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isBreeder"
                                            checked={formData.isBreeder}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">Breeder</span>
                                    </label>
                                </div>
                            </div>

                            {/* Linked CTUID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Linked CritterTrack ID
                                </label>
                                <input
                                    type="text"
                                    name="linkedCTUID"
                                    value={formData.linkedCTUID}
                                    onChange={handleInputChange}
                                    placeholder="e.g., CTU123"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            {/* Names */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Personal Name
                                    </label>
                                    <input
                                        type="text"
                                        name="personalName"
                                        value={formData.personalName}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Breeder Name
                                    </label>
                                    <input
                                        type="text"
                                        name="breederName"
                                        value={formData.breederName}
                                        onChange={handleInputChange}
                                        placeholder="Doe's Critters"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Prefix/Suffix */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prefix
                                    </label>
                                    <input
                                        type="text"
                                        name="prefix"
                                        value={formData.prefix}
                                        onChange={handleInputChange}
                                        placeholder="Dr., Mr., etc."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Suffix
                                    </label>
                                    <input
                                        type="text"
                                        name="suffix"
                                        value={formData.suffix}
                                        onChange={handleInputChange}
                                        placeholder="Jr., Sr., etc."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-700">Address</h3>
                                <input
                                    type="text"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleInputChange}
                                    placeholder="Street Address"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleInputChange}
                                        placeholder="City"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <input
                                        type="text"
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleInputChange}
                                        placeholder="State/Province"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        name="address.postalCode"
                                        value={formData.address.postalCode}
                                        onChange={handleInputChange}
                                        placeholder="Postal Code"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <input
                                        type="text"
                                        name="address.country"
                                        value={formData.address.country}
                                        onChange={handleInputChange}
                                        placeholder="Country"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Additional notes about this contact..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                />
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                                >
                                    <Save size={18} />
                                    {editingContact ? 'Update Contact' : 'Create Contact'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactsPage;
