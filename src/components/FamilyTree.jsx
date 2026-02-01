import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Search, X, Users, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = '/api';

/**
 * FamilyTree Component
 * 
 * Displays a comprehensive family tree visualization showing:
 * - All owned animals
 * - All related animals (parents, siblings, grandparents, great-grandparents, aunts, uncles, nephews, nieces, cousins)
 * - Interactive nodes with click-to-view functionality
 * - Filtering and search capabilities
 */
const FamilyTree = ({ authToken, userProfile, onViewAnimal, showModalMessage, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [treeData, setTreeData] = useState(null);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSpecies, setFilterSpecies] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [availableSpecies, setAvailableSpecies] = useState([]);
    const [error, setError] = useState(null);

    // Fetch comprehensive family tree data
    useEffect(() => {
        if (!authToken) return;
        
        const fetchFamilyTreeData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch all owned animals
                const animalsResponse = await axios.get(`${API_BASE_URL}/animals`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                
                const ownedAnimals = animalsResponse.data;
                
                // Build comprehensive relationship map
                const relationshipMap = await buildRelationshipMap(ownedAnimals);
                
                // Extract unique species for filtering
                const species = [...new Set(ownedAnimals.map(a => a.species))];
                setAvailableSpecies(species);
                
                setTreeData({
                    ownedAnimals,
                    relationshipMap
                });
                
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch family tree data:', err);
                setError('Failed to load family tree data');
                setLoading(false);
            }
        };
        
        fetchFamilyTreeData();
    }, [authToken]);

    /**
     * Build a comprehensive relationship map for all animals
     * This includes: parents, siblings, grandparents, great-grandparents, aunts, uncles, nephews, nieces, cousins
     */
    const buildRelationshipMap = async (ownedAnimals) => {
        const map = new Map();
        const allRelatedAnimals = new Set();
        
        // For each owned animal, fetch all their relationships
        for (const animal of ownedAnimals) {
            const relationships = {
                parents: [],
                siblings: [],
                grandparents: [],
                greatGrandparents: [],
                auntsUncles: [],
                nephewsNieces: [],
                cousins: [],
                children: []
            };
            
            try {
                // Fetch detailed relationship data from backend
                const response = await axios.get(
                    `${API_BASE_URL}/animals/${animal.id_public}/relationships`,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                
                const data = response.data;
                
                // Organize relationships
                if (data.parents) relationships.parents = data.parents;
                if (data.siblings) relationships.siblings = data.siblings;
                if (data.grandparents) relationships.grandparents = data.grandparents;
                if (data.greatGrandparents) relationships.greatGrandparents = data.greatGrandparents;
                if (data.auntsUncles) relationships.auntsUncles = data.auntsUncles;
                if (data.nephewsNieces) relationships.nephewsNieces = data.nephewsNieces;
                if (data.cousins) relationships.cousins = data.cousins;
                if (data.children) relationships.children = data.children;
                
                // Add all related animals to the set
                Object.values(relationships).forEach(relGroup => {
                    if (Array.isArray(relGroup)) {
                        relGroup.forEach(rel => allRelatedAnimals.add(rel.id_public));
                    }
                });
                
            } catch (err) {
                console.error(`Failed to fetch relationships for ${animal.name}:`, err);
            }
            
            map.set(animal.id_public, relationships);
        }
        
        return map;
    };

    /**
     * Render a single animal node in the tree
     */
    const renderAnimalNode = (animal, relationshipType = null) => {
        if (!animal) return null;
        
        const isOwned = treeData?.ownedAnimals?.some(a => a.id_public === animal.id_public);
        
        return (
            <div
                key={animal.id_public}
                onClick={() => setSelectedAnimal(animal)}
                className={`
                    relative p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${isOwned 
                        ? 'bg-primary/10 border-primary hover:border-primary-dark' 
                        : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                    }
                    ${selectedAnimal?.id_public === animal.id_public ? 'ring-4 ring-blue-400' : ''}
                    hover:shadow-md
                `}
                title={`${animal.name} - ${relationshipType || 'Owned'}`}
            >
                {/* Animal Image */}
                {animal.images && animal.images.length > 0 && (
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img
                            src={animal.images[0]}
                            alt={animal.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                
                {/* Animal Info */}
                <div className="text-center">
                    <div className="font-semibold text-sm text-gray-800 truncate">
                        {animal.name}
                    </div>
                    <div className="text-xs text-gray-500">
                        {animal.species}
                    </div>
                    {animal.sex && (
                        <div className="text-xs text-gray-400">
                            {animal.sex}
                        </div>
                    )}
                    {isOwned && (
                        <div className="mt-1 inline-block px-2 py-0.5 bg-primary text-black text-xs font-semibold rounded">
                            Owned
                        </div>
                    )}
                </div>
            </div>
        );
    };

    /**
     * Render animal detail panel
     */
    const renderAnimalDetail = () => {
        if (!selectedAnimal) return null;
        
        const relationships = treeData?.relationshipMap?.get(selectedAnimal.id_public);
        
        return (
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{selectedAnimal.name}</h3>
                    <button
                        onClick={() => setSelectedAnimal(null)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Animal Image */}
                {selectedAnimal.images && selectedAnimal.images.length > 0 && (
                    <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                            src={selectedAnimal.images[0]}
                            alt={selectedAnimal.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                
                {/* Basic Info */}
                <div className="space-y-2 mb-4 text-sm">
                    <div><span className="font-semibold">Species:</span> {selectedAnimal.species}</div>
                    {selectedAnimal.sex && <div><span className="font-semibold">Sex:</span> {selectedAnimal.sex}</div>}
                    {selectedAnimal.dateOfBirth && (
                        <div><span className="font-semibold">Born:</span> {new Date(selectedAnimal.dateOfBirth).toLocaleDateString()}</div>
                    )}
                    {selectedAnimal.geneticCode && <div><span className="font-semibold">Genetics:</span> {selectedAnimal.geneticCode}</div>}
                </div>
                
                {/* Relationships Summary */}
                {relationships && (
                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Relationships</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {relationships.parents?.length > 0 && (
                                <div className="bg-blue-50 px-3 py-2 rounded">
                                    <div className="font-medium text-blue-700">Parents</div>
                                    <div className="text-blue-600">{relationships.parents.length}</div>
                                </div>
                            )}
                            {relationships.siblings?.length > 0 && (
                                <div className="bg-green-50 px-3 py-2 rounded">
                                    <div className="font-medium text-green-700">Siblings</div>
                                    <div className="text-green-600">{relationships.siblings.length}</div>
                                </div>
                            )}
                            {relationships.children?.length > 0 && (
                                <div className="bg-purple-50 px-3 py-2 rounded">
                                    <div className="font-medium text-purple-700">Children</div>
                                    <div className="text-purple-600">{relationships.children.length}</div>
                                </div>
                            )}
                            {relationships.grandparents?.length > 0 && (
                                <div className="bg-yellow-50 px-3 py-2 rounded">
                                    <div className="font-medium text-yellow-700">Grandparents</div>
                                    <div className="text-yellow-600">{relationships.grandparents.length}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* View Full Details Button */}
                <button
                    onClick={() => onViewAnimal && onViewAnimal(selectedAnimal)}
                    className="w-full mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition"
                >
                    View Full Details
                </button>
            </div>
        );
    };

    // Filter animals based on search and species filter
    const getFilteredAnimals = () => {
        if (!treeData?.ownedAnimals) return [];
        
        return treeData.ownedAnimals.filter(animal => {
            const matchesSearch = !searchQuery || 
                animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                animal.geneticCode?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesSpecies = filterSpecies === 'all' || animal.species === filterSpecies;
            
            return matchesSearch && matchesSpecies;
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-600">Loading family tree...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const filteredAnimals = getFilteredAnimals();

    return (
        <div className="min-h-screen bg-page-bg p-4">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onBack}
                                className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition"
                            >
                                <ArrowLeft size={20} className="mr-2" />
                                Back
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div className="flex items-center gap-2">
                                <Users size={24} className="text-primary" />
                                <h1 className="text-2xl font-bold text-gray-800">Family Tree</h1>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        >
                            <Filter size={18} />
                            <span>Filters</span>
                            {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    </div>
                    
                    {/* Filters */}
                    {showFilters && (
                        <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or genetics..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                            
                            {/* Species Filter */}
                            <select
                                value={filterSpecies}
                                onChange={(e) => setFilterSpecies(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="all">All Species</option>
                                {availableSpecies.map(species => (
                                    <option key={species} value={species}>{species}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-primary/10 rounded-lg p-3">
                            <div className="text-2xl font-bold text-primary">{treeData?.ownedAnimals?.length || 0}</div>
                            <div className="text-sm text-gray-600">Owned Animals</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-2xl font-bold text-blue-600">{availableSpecies.length}</div>
                            <div className="text-sm text-gray-600">Species</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-2xl font-bold text-green-600">{filteredAnimals.length}</div>
                            <div className="text-sm text-gray-600">Filtered Results</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                            <div className="text-2xl font-bold text-purple-600">
                                {treeData?.relationshipMap?.size || 0}
                            </div>
                            <div className="text-sm text-gray-600">With Relationships</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tree View */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Animals</h2>
                        
                        {filteredAnimals.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Users size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No animals found matching your filters</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredAnimals.map(animal => renderAnimalNode(animal, 'Owned'))}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Detail Panel */}
                <div className="lg:col-span-1">
                    {selectedAnimal ? (
                        renderAnimalDetail()
                    ) : (
                        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                            <div className="text-center text-gray-500 py-12">
                                <Users size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Select an animal to view details and relationships</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FamilyTree;
