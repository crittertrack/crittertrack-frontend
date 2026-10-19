import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/apiClient';
import { Loader2, Search } from 'lucide-react';

// Shared "assign a contact" picker, used by the animal modal (breeder/owner/seller/buyer)
// and by the Reservations waitlist form. It offers three ways to resolve a person:
//   Search User    → a public profile (CTU id)
//   Select Contact → a record from the Contacts collection (keepers/breeders)
//   Manual Entry   → just a typed name
//
// The selection object always has this shape:
//   { name, userId, contactInfo, contactId }
// where contactId is only set when a Contacts record was picked.
export const getContactDisplayName = (contact) => {
    const personalName = contact?.personalName?.trim();
    const breederName = contact?.breederName?.trim();
    const prefix = contact?.prefix?.trim();
    const suffix = contact?.suffix?.trim();

    if (personalName && breederName) return `${personalName} (${breederName})`;
    if (personalName) return [prefix, personalName, suffix].filter(Boolean).join(' ');
    if (breederName) return [prefix, breederName, suffix].filter(Boolean).join(' ');
    return [prefix, personalName, suffix].filter(Boolean).join(' ') || 'Unnamed Contact';
};

export const getContactInfoString = (contact) => {
    const addr = contact?.address || {};
    return [addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(', ');
};

const ContactAssignModal = ({ isOpen, onClose, onSelect, target, API_BASE_URL, authToken, contactOnly = false }) => {
    const [mode, setMode] = useState(contactOnly ? 'contact' : 'user'); // 'user', 'contact', 'manual'
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [manualName, setManualName] = useState('');
    const [contactTypeFilter, setContactTypeFilter] = useState('all'); // 'all', 'keeper', 'breeder'
    const [showRetiredBreeders, setShowRetiredBreeders] = useState(false);
    const [contactSearch, setContactSearch] = useState('');

    useEffect(() => {
        if ((contactOnly || mode === 'contact') && contacts.length === 0) {
            setLoadingContacts(true);
            apiClient.get(`/contacts`)
                .then(res => setContacts(res.data || []))
                .catch(err => console.error(err))
                .finally(() => setLoadingContacts(false));
        }
    }, [mode, contactOnly, contacts.length]);

    const handleUserSearch = async () => {
        if (!searchTerm.trim()) return;
        setLoading(true);
        try {
            const res = await apiClient.get(`/public/profiles/search?query=${encodeURIComponent(searchTerm.trim())}&limit=20`);
            setSearchResults(res.data || []);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    const visibleContacts = contacts.filter(contact => {
        if (contactTypeFilter === 'keeper' && !contact.isKeeper) return false;
        if (contactTypeFilter === 'breeder' && !contact.isBreeder) return false;
        if (!showRetiredBreeders && contact.isBreeder && (contact.breederStatus || 'active') === 'retired') return false;
        const term = contactSearch.trim().toLowerCase();
        if (term) {
            const haystack = [contact.personalName, contact.breederName, contact.linkedCTUID].filter(Boolean).join(' ').toLowerCase();
            if (!haystack.includes(term)) return false;
        }
        return true;
    });

    if (!isOpen) return null;
    // In contactOnly mode the picker is restricted to existing Contacts records.
    const activeMode = contactOnly ? 'contact' : mode;
    return (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Assign {target}</h3>
                </div>
                <div className="p-4 border-b flex gap-2">
                    {!contactOnly && <button type="button" onClick={() => setMode('user')} className={`px-3 py-1 text-sm rounded-full ${mode === 'user' ? 'bg-primary dark:bg-dark-primary text-black' : 'bg-gray-200 dark:bg-dark-surface'}`}>Search User</button>}
                    <button type="button" onClick={() => setMode('contact')} className={`px-3 py-1 text-sm rounded-full ${mode === 'contact' ? 'bg-primary dark:bg-dark-primary text-black' : 'bg-gray-200 dark:bg-dark-surface'}`}>Select Contact</button>
                    {!contactOnly && <button type="button" onClick={() => setMode('manual')} className={`px-3 py-1 text-sm rounded-full ${mode === 'manual' ? 'bg-primary dark:bg-dark-primary text-black' : 'bg-gray-200 dark:bg-dark-surface'}`}>Manual Entry</button>}
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                    {activeMode === 'user' && (
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or CTU ID" className="w-full p-2 border rounded-md" onKeyPress={e => e.key === 'Enter' && handleUserSearch()} />
                                <button type="button" onClick={handleUserSearch} disabled={loading} className="p-2 bg-primary dark:bg-dark-primary rounded-md disabled:opacity-50">{loading ? <Loader2 className="animate-spin" /> : <Search />}</button>
                            </div>
                            <div className="space-y-1">
                                {searchResults.map(user => (
                                    <div key={user.id_public} onClick={() => onSelect({ name: user.breederName || user.personalName, userId: user.id_public })} className="p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-dark-surface-hover cursor-pointer">
                                        <p className="font-semibold">{user.breederName || user.personalName}</p>
                                        <p className="text-xs text-gray-500 dark:text-dark-text-muted">{user.id_public}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeMode === 'contact' && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex gap-1">
                                    <button type="button" onClick={() => setContactTypeFilter('all')} className={`px-2 py-1 text-xs font-medium rounded-full ${contactTypeFilter === 'all' ? 'bg-primary dark:bg-dark-primary text-black' : 'bg-gray-200 dark:bg-dark-surface'}`}>All</button>
                                    <button type="button" onClick={() => setContactTypeFilter('keeper')} className={`px-2 py-1 text-xs font-medium rounded-full ${contactTypeFilter === 'keeper' ? 'bg-primary dark:bg-dark-primary text-black' : 'bg-gray-200 dark:bg-dark-surface'}`}>Keepers</button>
                                    <button type="button" onClick={() => setContactTypeFilter('breeder')} className={`px-2 py-1 text-xs font-medium rounded-full ${contactTypeFilter === 'breeder' ? 'bg-primary dark:bg-dark-primary text-black' : 'bg-gray-200 dark:bg-dark-surface'}`}>Breeders</button>
                                </div>
                                <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-dark-text-secondary cursor-pointer">
                                    <input type="checkbox" checked={showRetiredBreeders} onChange={e => setShowRetiredBreeders(e.target.checked)} className="h-3.5 w-3.5" />
                                    Show retired breeders
                                </label>
                            </div>
                            <input type="text" value={contactSearch} onChange={e => setContactSearch(e.target.value)} placeholder="Filter contacts by name or CTU ID" className="w-full p-2 border rounded-md" />
                            <div className="space-y-1">
                                {loadingContacts ? <Loader2 className="animate-spin" /> : (visibleContacts.length > 0 ? visibleContacts.map(contact => (
                                    <div key={contact._id} onClick={() => onSelect({ name: getContactDisplayName(contact), userId: contact.linkedCTUID, contactInfo: getContactInfoString(contact), contactId: contact._id })} className="p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-dark-surface-hover cursor-pointer">
                                        <p className="font-semibold">{getContactDisplayName(contact)}</p>
                                        {contact.linkedCTUID && <p className="text-xs text-gray-500 dark:text-dark-text-muted">{contact.linkedCTUID}</p>}
                                    </div>
                                )) : <p className="text-sm text-gray-500 dark:text-dark-text-muted p-2">No contacts match this filter.</p>)}
                            </div>
                        </div>
                    )}
                    {activeMode === 'manual' && (
                        <div className="space-y-2">
                            <input type="text" value={manualName} onChange={e => setManualName(e.target.value)} placeholder={`Enter ${target} name`} className="w-full p-2 border rounded-md" />
                            <button type="button" onClick={() => onSelect({ name: manualName })} className="w-full p-2 bg-primary dark:bg-dark-primary rounded-md">Assign Name</button>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t">
                    <button type="button" onClick={onClose} className="w-full p-2 bg-gray-200 dark:bg-dark-surface rounded-md">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ContactAssignModal;
