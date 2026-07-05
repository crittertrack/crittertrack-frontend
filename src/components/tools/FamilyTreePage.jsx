import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2, Search, X } from 'lucide-react';
import FamilyTreeView from '../FamilyTree/FamilyTreeView'; 

const FamilyTreePage = ({ API_BASE_URL, authToken, myAnimals, onViewAnimal }) => {
    const [selectedAnimal, setSelectedAnimal] = useState(null);
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

    const filteredAnimals = myAnimals.filter(animal => 
        animal.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAnimal = (animal) => {
        setSelectedAnimal(animal);
        setIsDropdownOpen(false);
        setSearchTerm(animal.name);
    };

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-dark-surface rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">Family Tree Explorer</h1>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
                Select an animal from your collection to load and explore its full pedigree, including all known ancestors and offspring across the platform.
            </p>

            <div className="max-w-lg mx-auto mb-8" ref={searchRef}>
                <label htmlFor="animal-selector" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">Select an Animal</label>
                <div className="relative">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-bg">
                        <Search className="h-5 w-5 text-gray-400 mx-3" />
                        <input
                            id="animal-selector"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (!isDropdownOpen) setIsDropdownOpen(true);
                                if (selectedAnimal && e.target.value !== selectedAnimal.name) {
                                    setSelectedAnimal(null);
                                }
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            placeholder="Search for an animal in your list..."
                            className="w-full py-2.5 pr-10 bg-transparent focus:outline-none text-gray-900 dark:text-dark-text"
                        />
                        {searchTerm && (
                            <button onClick={() => { setSearchTerm(''); setSelectedAnimal(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredAnimals.length > 0 ? (
                                filteredAnimals.map(animal => (
                                    <div
                                        key={animal._id}
                                        onClick={() => handleSelectAnimal(animal)}
                                        className="px-4 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-dark-text"
                                    >
                                        {animal.name} ({animal.species})
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-gray-500">No animals found.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8" style={{ height: '70vh', width: '100%' }}>
                {selectedAnimal ? (
                    <FamilyTreeView animals={myAnimals} focusAnimalId={selectedAnimal.id_public} onNodeClick={(node) => onViewAnimal(node.data.animal)} API_BASE_URL={API_BASE_URL} authToken={authToken} />
                ) : (
                    <div className="text-center py-16"><p className="text-gray-500 dark:text-dark-text-secondary">Please select an animal to view its family tree.</p></div>
                )}
            </div>
        </div>
    );
};

export default FamilyTreePage;