import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import FamilyTreeView from '../FamilyTree/FamilyTreeView'; 

const FamilyTreePage = ({ API_BASE_URL, authToken, myAnimals, onViewAnimal }) => {
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [selectedSpecies, setSelectedSpecies] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const speciesOptions = useMemo(() => {
        if (!myAnimals) return [];
        return [...new Set(myAnimals.map(a => a.species))].sort();
    }, [myAnimals]);

    const animalsOfSpecies = useMemo(() => {
        if (!selectedSpecies) return [];
        const lowercasedTerm = searchTerm.toLowerCase();
        return myAnimals.filter(animal => 
            animal.species === selectedSpecies &&
            (getFullName(animal).toLowerCase().includes(lowercasedTerm) ||
             (animal.id_public && animal.id_public.toLowerCase().includes(lowercasedTerm)))
        );
    }, [myAnimals, selectedSpecies, searchTerm]);

    const handleSpeciesChange = (species) => {
        setSelectedSpecies(species);
        setSelectedAnimal(null);
        setSearchTerm('');
    };

    const handleSelectAnimal = (animal) => {
        setSelectedAnimal(animal);
        setSearchTerm(getFullName(animal));
        setIsDropdownOpen(false);
    };

    const getFullName = (animal) => [animal?.prefix, animal?.name, animal?.suffix].filter(Boolean).join(' ');

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-dark-surface rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">Family Tree Explorer</h1>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
                Select an animal from your collection to load and explore its full pedigree, including only direct ancestors and offspring.
            </p>

            <div className="max-w-lg mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="species-selector" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">1. Select Species</label>
                    <select
                        id="species-selector"
                        value={selectedSpecies}
                        onChange={(e) => handleSpeciesChange(e.target.value)}
                        className="w-full py-2.5 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">-- Select a Species --</option>
                        {speciesOptions.map(species => (
                            <option key={species} value={species}>{species}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="animal-search" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">2. Search for Animal</label>
                    <div className="relative" ref={searchRef}>
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-bg">
                            <Search className="h-5 w-5 text-gray-400 mx-3" />
                            <input
                                id="animal-search"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (!isDropdownOpen) setIsDropdownOpen(true);
                                    if (selectedAnimal && e.target.value !== getFullName(selectedAnimal)) {
                                        setSelectedAnimal(null);
                                    }
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder="Search by name or ID..."
                                disabled={!selectedSpecies}
                                className="w-full py-2.5 pr-10 bg-transparent focus:outline-none text-gray-900 dark:text-dark-text disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            {searchTerm && (
                                <button onClick={() => { setSearchTerm(''); setSelectedAnimal(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                        {isDropdownOpen && selectedSpecies && (
                            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {animalsOfSpecies.length > 0 ? (
                                    animalsOfSpecies.map(animal => (
                                        <div key={animal.id_public} onClick={() => handleSelectAnimal(animal)} className="px-4 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-dark-text">
                                            {getFullName(animal)} ({animal.id_public})
                                        </div>
                                    ))
                                ) : (<div className="px-4 py-2 text-gray-500">No animals found.</div>)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8" style={{ height: '70vh', width: '100%', overflow: 'hidden' }}>
                {selectedAnimal ? (
                    <FamilyTreeView 
                        animals={myAnimals} 
                        focusAnimalId={selectedAnimal.id_public} 
                        onNodeClick={(node) => onViewAnimal(node.data.animal)} 
                        API_BASE_URL={API_BASE_URL} 
                        authToken={authToken} 
                    />
                ) : (
                    <div className="text-center py-16"><p className="text-gray-500 dark:text-dark-text-secondary">Please select a species and an animal to view its family tree.</p></div>
                )}
            </div>
        </div>
    );
};

export default FamilyTreePage;