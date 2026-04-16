import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import {
    Plus, Search, RefreshCw, Eye, EyeOff, Trash2, Archive, Heart, HeartOff,
    ClipboardList, LayoutGrid, ChevronDown, ChevronUp, Cat, Loader2,
    Home, Ban, Flag, ScrollText, Package, AlertTriangle, MessageSquare,
    MapPin, Check, X, Edit, Hourglass, Bean, Milk, Network, ShoppingBag
} from 'lucide-react';

const AnimalList = ({ 
    authToken,
    API_BASE_URL,
    showModalMessage, 
    onEditAnimal, 
    onViewAnimal, 
    navigate,
    showArchiveScreen,
    setShowArchiveScreen,
    archivedAnimals,
    setArchivedAnimals,
    soldTransferredAnimals,
    setSoldTransferredAnimals,
    archiveLoading,
    setArchiveLoading,
    breedingLineDefs = [],
    animalBreedingLines = {}
}) => {
    const [animals, setAnimalsRaw] = useState([]);
    const setAnimals = useCallback((valOrFn) => {
        setAnimalsRaw(prev => {
            const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
            return next;
        });
    }, []);

    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedGenders, setSelectedGenders] = useState(['Male', 'Female', 'Intersex', 'Unknown']);
    const [selectedSpecies, setSelectedSpecies] = useState([]);
    const [allUserSpecies, setAllUserSpecies] = useState([]);
    const [showOwned, setShowOwned] = useState(true);
    const [showUnowned, setShowUnowned] = useState(false);

    const fetchAnimals = useCallback(async () => {
        try {
            const ownedRes = await axios.get(`${API_BASE_URL}/animals?isOwned=true`, { 
                headers: { Authorization: `Bearer ${authToken}` } 
            });
            let ownedData = (ownedRes.data || []).filter(a => !a.isViewOnly);
            setAnimals(ownedData);
            
            const speciesList = [...new Set(ownedData.map(a => a.species).filter(Boolean))];
            if (speciesList.length > 0) setAllUserSpecies(speciesList);
            setLoading(false);
        } catch (error) {
            console.error('Fetch animals error:', error);
            showModalMessage('Error', 'Failed to fetch animal list.');
            setLoading(false);
        }
    }, [authToken, API_BASE_URL, showModalMessage, setAnimals]);

    useEffect(() => {
        fetchAnimals();
    }, [fetchAnimals]);

    const groupedAnimals = useMemo(() => {
        let source = animals;
        
        if (statusFilter) {
            source = source.filter(a => a.status === statusFilter);
        }
        
        if (searchInput) {
            const term = searchInput.toLowerCase();
            source = source.filter(a => {
                const name = (a.name || '').toString().toLowerCase();
                return name.includes(term);
            });
        }
        
        if (selectedSpecies.length > 0) {
            source = source.filter(a => selectedSpecies.includes(a.species));
        }
        
        if (selectedGenders.length < 4) {
            source = source.filter(a => selectedGenders.includes(a.gender));
        }

        if (showOwned && !showUnowned) {
            source = source.filter(a => a.isOwned !== false);
        } else if (!showOwned && showUnowned) {
            source = source.filter(a => a.isOwned === false);
        } else if (!showOwned && !showUnowned) {
            source = [];
        }

        return source.reduce((groups, animal) => {
            const species = animal.species || 'Unspecified Species';
            if (!groups[species]) {
                groups[species] = [];
            }
            groups[species].push(animal);
            return groups;
        }, {});
    }, [animals, statusFilter, searchInput, selectedSpecies, selectedGenders, showOwned, showUnowned]);

    const displayedAnimalCount = useMemo(() => {
        return Object.values(groupedAnimals).reduce((sum, arr) => sum + arr.length, 0);
    }, [groupedAnimals]);

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" size={32} /></div>;
    }

    return (
        <div className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ClipboardList size={24} />
                My Animals ({displayedAnimalCount})
            </h2>

            {displayedAnimalCount === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <Cat size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-600">No animals found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {Object.keys(groupedAnimals).map(species => (
                        <div key={species} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-bold text-lg text-gray-700 mb-3">{species} ({groupedAnimals[species].length})</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {groupedAnimals[species].map(animal => (
                                    <div 
                                        key={animal.id_public}
                                        onClick={() => onViewAnimal(animal)}
                                        className="cursor-pointer p-3 border border-gray-200 rounded-lg hover:shadow-md transition"
                                    >
                                        <div className="font-semibold text-gray-800 text-sm truncate">
                                            {animal.name}
                                        </div>
                                        <div className="text-xs text-gray-500">{animal.gender}</div>
                                        <div className="text-xs text-gray-400">{animal.status}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnimalList;
