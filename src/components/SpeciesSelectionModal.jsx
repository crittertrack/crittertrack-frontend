import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { X, Search, Loader2 } from 'lucide-react';

const SpeciesSelectionModal = ({
    isOpen,
    onClose,
    onSelect,
    authToken,
    API_BASE_URL,
    title = 'Select Species',
    exclude = [],
}) => {
    const [allSpecies, setAllSpecies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSpecies = async () => {
            if (!isOpen) return;
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/species/all`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                if (response.data && Array.isArray(response.data)) {
                    setAllSpecies(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch species list:", error);
                setAllSpecies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecies();
    }, [isOpen, authToken, API_BASE_URL]);

    const filteredAndGroupedSpecies = useMemo(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        const filtered = allSpecies.filter(species =>
            !exclude.includes(species.name) &&
            (species.name.toLowerCase().includes(lowerCaseSearch) ||
             species.scientificName?.toLowerCase().includes(lowerCaseSearch))
        );

        return filtered.reduce((acc, species) => {
            const category = species.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(species);
            return acc;
        }, {});
    }, [searchTerm, allSpecies, exclude]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60" onClick={onClose}>
            <div
                className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b dark:border-dark-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search species by name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface focus:ring-2 focus:ring-primary"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><Loader2 size={32} className="animate-spin text-primary" /></div>
                    ) : Object.keys(filteredAndGroupedSpecies).length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No species found.</div>
                    ) : (
                        <div className="space-y-4">
                            {Object.keys(filteredAndGroupedSpecies).sort().map(category => (
                                <div key={category}>
                                    <h4 className="text-sm font-semibold text-gray-500 dark:text-dark-text-muted uppercase tracking-wider mb-2">{category}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {filteredAndGroupedSpecies[category].map(species => (
                                            <button key={species._id} onClick={() => onSelect(species.name)} className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-dark-surface-hover hover:bg-primary/10 hover:text-primary-dark dark:hover:bg-primary/20 transition border border-gray-200 dark:border-dark-border">
                                                <span className="font-medium text-sm text-gray-800 dark:text-dark-text">{species.name}</span>
                                                {species.scientificName && <p className="text-xs text-gray-500 dark:text-dark-text-muted italic">{species.scientificName}</p>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpeciesSelectionModal;