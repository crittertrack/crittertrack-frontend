import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { X, Search, Loader2, Check } from 'lucide-react';

const SpeciesSelectionModal = ({
    isOpen,
    onClose,
    onAssign,
    authToken,
    API_BASE_URL,
    title = 'Select Species',
    initialSelected = [],
}) => {
    const [allSpecies, setAllSpecies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState([]);

    // Reset local selected state when modal opens, seeded with initialSelected
    useEffect(() => {
        if (isOpen) {
            setSelected([...initialSelected]);
            setSearchTerm('');
        }
    }, [isOpen, initialSelected]);

    useEffect(() => {
        const fetchSpecies = async () => {
            if (!isOpen) return;
            setLoading(true);
            try {
                const config = {};
                if (authToken) {
                    config.headers = { Authorization: `Bearer ${authToken}` };
                }
                const response = await axios.get(`${API_BASE_URL}/species`, config);

                const contentType = response.headers['content-type'];
                if (!contentType || !contentType.includes('application/json')) {
                    console.error("Species API did not return JSON. Content-Type:", contentType, "Response data:", response.data);
                    setAllSpecies([]);
                    return;
                }

                let speciesData = response.data;

                // Handle { species: [...] } wrapper
                if (speciesData && typeof speciesData === 'object' && !Array.isArray(speciesData)) {
                    speciesData = speciesData.species || speciesData.results || speciesData.data || [];
                }

                if (Array.isArray(speciesData)) {
                    setAllSpecies(speciesData.map(item =>
                        typeof item === 'string'
                            ? { name: item, category: 'Other' }
                            : item
                    ));
                } else {
                    console.warn("Species data not found or in unexpected format:", response.data);
                    setAllSpecies([]);
                }
            } catch (error) {
                console.error("Failed to fetch species list:", error);
                // Log more details for debugging
                if (error.response) {
                    console.error("Response status:", error.response.status, "data:", error.response.data);
                }
                setAllSpecies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecies();
    }, [isOpen, authToken, API_BASE_URL]);

    const toggleSelect = (speciesName) => {
        setSelected(prev =>
            prev.includes(speciesName)
                ? prev.filter(s => s !== speciesName)
                : [...prev, speciesName]
        );
    };

    const removeSelected = (speciesName) => {
        setSelected(prev => prev.filter(s => s !== speciesName));
    };

    // Species that are available to pick (not currently selected)
    const availableSpecies = useMemo(() => {
        return allSpecies.filter(s => !selected.includes(s.name));
    }, [allSpecies, selected]);

    const filteredAndGroupedSpecies = useMemo(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        const filtered = availableSpecies.filter(species =>
            species.name.toLowerCase().includes(lowerCaseSearch) ||
            species.latinName?.toLowerCase().includes(lowerCaseSearch)
        );

        return filtered.reduce((acc, species) => {
            const category = species.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(species);
            return acc;
        }, {});
    }, [searchTerm, availableSpecies]);

    const handleAssign = () => {
        onAssign(selected);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60" onClick={onClose}>
            <div
                className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-dark-border flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b dark:border-dark-border flex-shrink-0">
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

                {/* Selected Species Section */}
                {selected.length > 0 && (
                    <div className="px-4 pt-4 flex-shrink-0">
                        <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Check size={12} /> Selected ({selected.length})
                        </h4>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {selected.map(name => (
                                <span
                                    key={name}
                                    className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2.5 py-1 rounded-full border border-green-300 dark:border-green-700"
                                >
                                    {name}
                                    <button
                                        type="button"
                                        onClick={() => removeSelected(name)}
                                        className="text-green-500 hover:text-red-500 transition"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 dark:border-dark-border" />
                    </div>
                )}

                {/* Species Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><Loader2 size={32} className="animate-spin text-primary" /></div>
                    ) : Object.keys(filteredAndGroupedSpecies).length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            {searchTerm ? 'No species match your search.' : 'All available species have been selected.'}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.keys(filteredAndGroupedSpecies).sort().map(category => (
                                <div key={category}>
                                    <h4 className="text-sm font-semibold text-gray-500 dark:text-dark-text-muted uppercase tracking-wider mb-2">{category}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {filteredAndGroupedSpecies[category].map(species => (
                                            <button
                                                key={species._id}
                                                onClick={() => toggleSelect(species.name)}
                                                className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-dark-surface-hover hover:bg-primary/10 hover:text-primary-dark dark:hover:bg-primary/20 transition border border-gray-200 dark:border-dark-border"
                                            >
                                                <span className="font-medium text-sm text-gray-800 dark:text-dark-text">{species.name}</span>
                                                {species.latinName && <p className="text-xs text-gray-500 dark:text-dark-text-muted italic">{species.latinName}</p>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer with Assign button */}
                <div className="border-t dark:border-dark-border p-4 flex-shrink-0 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                        {selected.length} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="text-xs px-3 py-1.5 border border-gray-300 dark:border-dark-border rounded-lg text-gray-600 dark:text-dark-text-muted hover:bg-gray-50 dark:hover:bg-dark-surface-hover"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssign}
                            disabled={selected.length === 0}
                            className="text-xs px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-1.5"
                        >
                            <Check size={14} />
                            Assign {selected.length > 0 ? `(${selected.length})` : ''}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpeciesSelectionModal;

