import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { User, Users, Plus, Edit, Trash2, X, Save, MapPin, Globe, Hash, UserCheck, UserX, Filter, Search, Cat, Loader2, Eye } from 'lucide-react';

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
    
    // Contact preview modal state
    const [previewContact, setPreviewContact] = useState(null);
    const [previewTab, setPreviewTab] = useState('bred'); // 'bred' or 'own'
    const [bredAnimals, setBredAnimals] = useState([]);
    const [ownAnimals, setOwnAnimals] = useState([]);
    const [loadingAnimals, setLoadingAnimals] = useState(false);
    
    // CTUID selector state
    const [availableUsers, setAvailableUsers] = useState([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch contacts on mount
    useEffect(() => {
        fetchContacts();
    }, []);

    // Click outside handler to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };

        if (showUserDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showUserDropdown]);

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

    // Fetch available users for CTUID selector
    const fetchUsers = async (search = '') => {
        try {
            setLoadingUsers(true);
            const response = await axios.get(`${API_BASE_URL}/contacts/users`, {
                headers: { Authorization: `Bearer ${authToken}` },
                params: { search }
            });
            setAvailableUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Debounced user search
    useEffect(() => {
        if (showUserDropdown) {
            const timer = setTimeout(() => {
                fetchUsers(userSearchTerm);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [userSearchTerm, showUserDropdown]);

    // Generate abbreviation from breeder name
    const generateAbbreviation = (name) => {
        if (!name) return '';
        
        // Split by spaces and take first letter of each word
        const words = name.trim().split(/\s+/);
        if (words.length === 1) {
            // Single word - take first 2-3 letters
            return name.substring(0, 3).toUpperCase();
        }
        
        // Multiple words - take first letter of each
        return words.map(w => w[0]).join('').toUpperCase();
    };

    // Handle CTUID selection from dropdown
    const handleUserSelect = (user) => {
        setFormData(prev => ({
            ...prev,
            linkedCTUID: user.id_public,
            personalName: user.personalName || prev.personalName,
            breederName: user.breederName || prev.breederName,
            prefix: user.breederName ? generateAbbreviation(user.breederName) : prev.prefix,
            suffix: user.breederName ? generateAbbreviation(user.breederName) : prev.suffix,
            address: {
                ...prev.address,
                country: user.country || prev.address.country,
                state: user.state || prev.address.state
            }
        }));
        setUserSearchTerm('');
        setShowUserDropdown(false);
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

    // Handle contact click to show preview modal
    const handleContactClick = async (contact, e) => {
        // Don't open preview if clicking on edit/delete buttons
        if (e.target.closest('button')) {
            return;
        }

        setPreviewContact(contact);
        setPreviewTab('bred');
        setLoadingAnimals(true);
        setBredAnimals([]);
        setOwnAnimals([]);

        try {
            const [bredRes, ownRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/contacts/${contact._id}/bred-animals`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                }),
                axios.get(`${API_BASE_URL}/contacts/${contact._id}/own-animals`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                })
            ]);

            setBredAnimals(bredRes.data);
            setOwnAnimals(ownRes.data);
        } catch (error) {
            console.error('Error fetching contact animals:', error);
            showModalMessage('Error', 'Failed to load animals for this contact');
        } finally {
            setLoadingAnimals(false);
        }
    };

    const closePreview = () => {
        setPreviewContact(null);
        setBredAnimals([]);
        setOwnAnimals([]);
        setPreviewTab('bred');
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
                            onClick={(e) => handleContactClick(contact, e)}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
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

                            {/* Linked CTUID - Searchable Selector */}
                            <div className="relative" ref={dropdownRef}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Linked CritterTrack ID
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.linkedCTUID || userSearchTerm}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (formData.linkedCTUID) {
                                                // If CTUID is already selected, clear it and start searching
                                                setFormData(prev => ({ ...prev, linkedCTUID: '' }));
                                            }
                                            setUserSearchTerm(value);
                                            setShowUserDropdown(true);
                                        }}
                                        onFocus={() => {
                                            setShowUserDropdown(true);
                                            if (!userSearchTerm && !formData.linkedCTUID) {
                                                fetchUsers('');
                                            }
                                        }}
                                        placeholder="Search by CTUID or name..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    {formData.linkedCTUID && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, linkedCTUID: '' }));
                                                setUserSearchTerm('');
                                            }}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                
                                {/* Dropdown */}
                                {showUserDropdown && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {loadingUsers ? (
                                            <div className="p-3 text-center text-gray-500">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                                            </div>
                                        ) : availableUsers.length === 0 ? (
                                            <div className="p-3 text-center text-gray-500 text-sm">
                                                No users found
                                            </div>
                                        ) : (
                                            availableUsers.map(user => (
                                                <button
                                                    key={user.id_public}
                                                    type="button"
                                                    onClick={() => handleUserSelect(user)}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 transition border-b border-gray-100 last:border-b-0"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-gray-800">
                                                                {user.id_public}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                {user.personalName}
                                                                {user.breederName && ` (${user.breederName})`}
                                                            </div>
                                                        </div>
                                                        {user.country && (
                                                            <div className="text-xs text-gray-500">
                                                                {user.country}
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
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

            {/* Contact Preview Modal */}
            {previewContact && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-black">
                                    {getDisplayName(previewContact)}
                                </h2>
                                {previewContact.linkedCTUID && (
                                    <p className="text-sm text-gray-700 flex items-center gap-1 mt-1">
                                        <Hash size={14} />
                                        {previewContact.linkedCTUID}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={closePreview}
                                className="text-black hover:text-gray-700 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 px-6 flex gap-4">
                            <button
                                onClick={() => setPreviewTab('bred')}
                                className={`py-3 px-4 font-medium transition border-b-2 ${
                                    previewTab === 'bred'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                Bred Animals ({bredAnimals.length})
                            </button>
                            <button
                                onClick={() => setPreviewTab('own')}
                                className={`py-3 px-4 font-medium transition border-b-2 ${
                                    previewTab === 'own'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                Own Animals ({ownAnimals.length})
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingAnimals ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-primary mr-2" size={24} />
                                    <span className="text-gray-600">Loading animals...</span>
                                </div>
                            ) : previewTab === 'bred' ? (
                                bredAnimals.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Cat size={48} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500">
                                            No animals bred by this contact in your stock.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {bredAnimals.map(animal => (
                                            <div
                                                key={animal.id_public}
                                                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                                                onClick={() => window.location.href = `/animals/${animal.id_public}`}
                                            >
                                                {/* Animal Image */}
                                                <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                                    {animal.imageUrl || animal.photoUrl ? (
                                                        <img
                                                            src={animal.imageUrl || animal.photoUrl}
                                                            alt={animal.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Cat size={32} className="text-gray-400" />
                                                    )}
                                                </div>

                                                {/* Animal Info */}
                                                <h4 className="font-semibold text-gray-800">
                                                    {[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {animal.id_public}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                                                    <span className="px-2 py-1 bg-gray-100 rounded">
                                                        {animal.species}
                                                    </span>
                                                    {animal.gender && (
                                                        <span className="px-2 py-1 bg-gray-100 rounded">
                                                            {animal.gender}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                ownAnimals.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Cat size={48} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500">
                                            No animals bred by you and owned by this contact.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {ownAnimals.map(animal => (
                                            <div
                                                key={animal.id_public}
                                                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                                                onClick={() => window.location.href = `/animals/${animal.id_public}`}
                                            >
                                                {/* Animal Image */}
                                                <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                                    {animal.imageUrl || animal.photoUrl ? (
                                                        <img
                                                            src={animal.imageUrl || animal.photoUrl}
                                                            alt={animal.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Cat size={32} className="text-gray-400" />
                                                    )}
                                                </div>

                                                {/* Animal Info */}
                                                <h4 className="font-semibold text-gray-800">
                                                    {[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {animal.id_public}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                                                    <span className="px-2 py-1 bg-gray-100 rounded">
                                                        {animal.species}
                                                    </span>
                                                    {animal.gender && (
                                                        <span className="px-2 py-1 bg-gray-100 rounded">
                                                            {animal.gender}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
                            <button
                                onClick={closePreview}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactsPage;
