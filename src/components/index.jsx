import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Plus, Search, UserCheck, Loader2 } from 'lucide-react';

const ContactsListPage = ({ API_BASE_URL, authToken, showModalMessage }) => {
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // 'all', 'keeper', 'breeder'
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchContacts();
    }, []);

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
        if (filterType === 'keeper') {
            filtered = filtered.filter(c => c.isKeeper);
        } else if (filterType === 'breeder') {
            filtered = filtered.filter(c => c.isBreeder);
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                (c.personalName && c.personalName.toLowerCase().includes(term)) ||
                (c.breederName && c.breederName.toLowerCase().includes(term))
            );
        }
        setFilteredContacts(filtered);
    };

    const getDisplayName = (contact) => {
        const parts = [];
        if (contact.prefix) parts.push(contact.prefix);
        if (contact.personalName) parts.push(contact.personalName);
        if (contact.breederName) parts.push(`(${contact.breederName})`);
        if (contact.suffix) parts.push(contact.suffix);
        return parts.join(' ') || 'Unnamed Contact';
    };

    return (
        <div className="p-4 md:p-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users size={28} className="text-primary" />
                        Contacts
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">Manage keepers and breeders</p>
                </div>
                {/* This button will eventually lead to a new "Add Contact" page or modal */}
                <button className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2">
                    <Plus size={18} /> Add Contact
                </button>
            </header>

            <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
            ) : (
                <div className="bg-white rounded-lg shadow">
                    {filteredContacts.length > 0 ? (
                        <ul>
                            {filteredContacts.map(contact => (
                                <li key={contact._id} className="border-b last:border-b-0">
                                    <Link
                                        to={`/contacts/${contact._id}/overview`}
                                        className="block p-4 hover:bg-gray-50"
                                    >
                                        <h3 className="font-semibold text-gray-800">{getDisplayName(contact)}</h3>
                                        <div className="flex gap-2 mt-1">
                                            {contact.isKeeper && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Keeper</span>}
                                            {contact.isBreeder && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Breeder</span>}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-12 text-gray-500">No contacts found.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContactsListPage;