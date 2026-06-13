import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, Loader2, User, Plus } from 'lucide-react';

const ContactSelector = ({ onClose, onSelect, API_BASE_URL, authToken }) => {
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredContacts(contacts);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = contacts.filter(contact => 
                contact.personalName?.toLowerCase().includes(term) ||
                contact.breederName?.toLowerCase().includes(term) ||
                contact.linkedCTUID?.toLowerCase().includes(term) ||
                contact.address?.city?.toLowerCase().includes(term) ||
                contact.address?.country?.toLowerCase().includes(term)
            );
            setFilteredContacts(filtered);
        }
    }, [searchTerm, contacts]);

    const getDisplayName = (contact) => {
        const parts = [];
        if (contact.prefix) parts.push(contact.prefix);
        if (contact.personalName) parts.push(contact.personalName);
        if (contact.breederName) parts.push(`(${contact.breederName})`);
        if (contact.suffix) parts.push(contact.suffix);
        return parts.join(' ') || 'Unnamed Contact';
    };

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/contacts`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setContacts(response.data || []);
            setFilteredContacts(response.data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setContacts([]);
            setFilteredContacts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectContact = (contact) => {
        onSelect(contact);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <User size={20} />
                        Select Contact
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search contacts by name, email, phone, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                        />
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    </div>
                </div>

                {/* Contact List */}
                <div className="flex-grow overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="animate-spin text-primary-dark mr-2" size={24} />
                            <span className="text-gray-600">Loading contacts...</span>
                        </div>
                    ) : filteredContacts.length > 0 ? (
                        <div className="space-y-2">
                            {filteredContacts.map((contact) => (
                                <div
                                    key={contact._id}
                                    onClick={() => handleSelectContact(contact)}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-grow">
                                            <h4 className="font-semibold text-gray-800 text-lg">
                                                {getDisplayName(contact)}
                                            </h4>
                                            {contact.linkedCTUID && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    🆔 {contact.linkedCTUID}
                                                </p>
                                            )}
                                            {(contact.address?.city || contact.address?.country) && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    📍 {[contact.address.city, contact.address.country].filter(Boolean).join(', ')}
                                                </p>
                                            )}
                                            {contact.notes && (
                                                <p className="text-xs text-gray-500 mt-2 italic">
                                                    {contact.notes.length > 100 
                                                        ? `${contact.notes.substring(0, 100)}...` 
                                                        : contact.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <User className="mx-auto text-gray-300 mb-3" size={48} />
                            <p className="text-gray-500">
                                {searchTerm ? 'No contacts found matching your search.' : 'No contacts found.'}
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                                Add contacts from the Contacts page to select them here.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContactSelector;
