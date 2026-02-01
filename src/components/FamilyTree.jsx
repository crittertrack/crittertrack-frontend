import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Loader2, Search, X, Users, ChevronDown, ChevronUp, Filter, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import ReactFlow, { 
    Background, 
    Controls, 
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';

const API_BASE_URL = '/api';

/**
 * FamilyTree Component
 * 
 * Displays a comprehensive family tree visualization showing:
 * - All owned animals and their relationships
 * - Interactive graph with pan/zoom
 * - Parent-child connections shown as edges
 * - Clickable nodes to view animal details
 */

// Custom node component for animals
const AnimalNode = ({ data }) => {
    const isOwned = data.isOwned;
    const isSelected = data.isSelected;
    
    // Build full name with prefix/suffix
    const fullName = [data.prefix, data.label, data.suffix].filter(Boolean).join(' ');
    
    return (
        <div className="flex flex-col items-center">
            {/* Circular Image */}
            <div
                className={`
                    rounded-full overflow-hidden border-4 shadow-lg cursor-pointer transition-all
                    ${isOwned 
                        ? 'border-primary' 
                        : 'border-gray-300'
                    }
                    ${isSelected ? 'ring-4 ring-blue-500 scale-110' : 'hover:scale-105'}
                `}
                style={{ width: '80px', height: '80px' }}
            >
                {data.image ? (
                    <img
                        src={data.image}
                        alt={fullName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                        No Image
                    </div>
                )}
            </div>
            
            {/* Name Bar */}
            <div
                className={`
                    mt-2 px-3 py-1.5 rounded-full shadow-md text-center font-semibold text-sm
                    ${isOwned 
                        ? 'bg-primary text-black' 
                        : 'bg-gray-600 text-white'
                    }
                `}
                style={{ minWidth: '100px', maxWidth: '150px' }}
            >
                <div className="truncate">{fullName}</div>
            </div>
        </div>
    );
};

const nodeTypes = {
    animalNode: AnimalNode
};

const FamilyTree = ({ authToken, userProfile, onViewAnimal, showModalMessage, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [allAnimals, setAllAnimals] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSpecies, setFilterSpecies] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [availableSpecies, setAvailableSpecies] = useState([]);
    const [error, setError] = useState(null);
    
    // React Flow state
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Fetch all animals and build the graph
    useEffect(() => {
        if (!authToken) return;
        
        const fetchAnimalsAndBuildGraph = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch all owned animals
                const animalsResponse = await axios.get(`${API_BASE_URL}/animals`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                
                const ownedAnimals = animalsResponse.data;
                setAllAnimals(ownedAnimals);
                
                // Extract unique species
                const species = [...new Set(ownedAnimals.map(a => a.species))];
                setAvailableSpecies(species);
                
                // Build graph nodes and edges
                buildGraph(ownedAnimals);
                
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch animals:', err);
                setError('Failed to load family tree data');
                setLoading(false);
            }
        };
        
        fetchAnimalsAndBuildGraph();
    }, [authToken]);

    // Build graph from animals data
    const buildGraph = (animals) => {
        const nodeMap = new Map();
        const edgeList = [];
        
        // Track all unique animals (owned + parents/grandparents)
        const allUniqueAnimals = new Map();
        
        // First pass: Add all owned animals
        animals.forEach(animal => {
            allUniqueAnimals.set(animal.id_public, {
                ...animal,
                isOwned: true
            });
        });
        
        // Second pass: Add parents and create edges
        animals.forEach(animal => {
            // Add sire
            if (animal.sireId_public && !allUniqueAnimals.has(animal.sireId_public)) {
                allUniqueAnimals.set(animal.sireId_public, {
                    id_public: animal.sireId_public,
                    name: animal.sireId_public, // Will be replaced with actual name if available
                    species: animal.species,
                    sex: 'Male',
                    isOwned: false
                });
            }
            
            // Add dam
            if (animal.damId_public && !allUniqueAnimals.has(animal.damId_public)) {
                allUniqueAnimals.set(animal.damId_public, {
                    id_public: animal.damId_public,
                    name: animal.damId_public,
                    species: animal.species,
                    sex: 'Female',
                    isOwned: false
                });
            }
            
            // Create parent edges
            if (animal.sireId_public) {
                edgeList.push({
                    id: `${animal.sireId_public}-${animal.id_public}`,
                    source: animal.sireId_public,
                    target: animal.id_public,
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#3b82f6', strokeWidth: 2 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#3b82f6',
                    }
                });
            }
            
            if (animal.damId_public) {
                edgeList.push({
                    id: `${animal.damId_public}-${animal.id_public}`,
                    source: animal.damId_public,
                    target: animal.id_public,
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#ec4899', strokeWidth: 2 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#ec4899',
                    }
                });
            }
        });
        
        // Create nodes with automatic layout
        const nodeList = [];
        const animalsArray = Array.from(allUniqueAnimals.values());
        
        // Simple grid layout for now (we'll improve this)
        const cols = Math.ceil(Math.sqrt(animalsArray.length));
        animalsArray.forEach((animal, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            
            nodeList.push({
                id: animal.id_public,
                type: 'animalNode',
                position: { 
                    x: col * 200, 
                    y: row * 150 
                },
                data: {
                    label: animal.name || animal.id_public,
                    prefix: animal.prefix || '',
                    suffix: animal.suffix || '',
                    species: animal.species || 'Unknown',
                    genetics: animal.geneticCode || '',
                    image: animal.images?.[0] || null,
                    isOwned: animal.isOwned,
                    isSelected: selectedAnimal?.id_public === animal.id_public,
                    animal: animal
                }
            });
        });
        
        setNodes(nodeList);
        setEdges(edgeList);
    };

    // Handle node click
    const onNodeClick = useCallback((event, node) => {
        const animal = node.data.animal;
        setSelectedAnimal(animal);
        
        // Update selected state in nodes
        setNodes(nodes => 
            nodes.map(n => ({
                ...n,
                data: {
                    ...n.data,
                    isSelected: n.id === node.id
                }
            }))
        );
    }, [setNodes]);

    // Filter animals based on search and species
    const filteredAnimals = useMemo(() => {
        if (!allAnimals) return [];
        
        return allAnimals.filter(animal => {
            const matchesSearch = !searchQuery || 
                animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                animal.geneticCode?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesSpecies = filterSpecies === 'all' || animal.species === filterSpecies;
            
            return matchesSearch && matchesSpecies;
        });
    }, [allAnimals, searchQuery, filterSpecies]);
    
    // Update graph when filters change
    useEffect(() => {
        if (filteredAnimals.length > 0 && allAnimals.length > 0) {
            if (searchQuery || filterSpecies !== 'all') {
                buildGraph(filteredAnimals);
            } else {
                buildGraph(allAnimals);
            }
        }
    }, [filteredAnimals, searchQuery, filterSpecies]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-page-bg">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-600">Loading family tree...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-page-bg">
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

    const totalRelationships = edges.length;

    return (
        <div className="flex flex-col h-screen bg-page-bg">
            {/* Header */}
            <div className="bg-white shadow-lg p-4 z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-3">
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
                        <div className="border-t border-gray-200 pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                        <div className="bg-primary/10 rounded-lg p-2">
                            <div className="text-xl font-bold text-primary">{allAnimals.length}</div>
                            <div className="text-xs text-gray-600">Owned Animals</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2">
                            <div className="text-xl font-bold text-blue-600">{nodes.length}</div>
                            <div className="text-xs text-gray-600">Total Nodes</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2">
                            <div className="text-xl font-bold text-green-600">{totalRelationships}</div>
                            <div className="text-xs text-gray-600">Connections</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-2">
                            <div className="text-xl font-bold text-purple-600">{availableSpecies.length}</div>
                            <div className="text-xs text-gray-600">Species</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Graph Container */}
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-left"
                    className="bg-gray-50"
                >
                    <Background color="#ddd" gap={16} />
                    <Controls />
                    <MiniMap 
                        nodeColor={(node) => node.data.isOwned ? '#fbbf24' : '#d1d5db'}
                        maskColor="rgba(0, 0, 0, 0.1)"
                        style={{ backgroundColor: '#f9fafb' }}
                    />
                </ReactFlow>
                
                {/* Selected Animal Detail Panel */}
                {selectedAnimal && (
                    <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-2xl p-4 border border-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto z-10">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-bold text-gray-800">{selectedAnimal.name}</h3>
                            <button
                                onClick={() => {
                                    setSelectedAnimal(null);
                                    setNodes(nodes => 
                                        nodes.map(n => ({
                                            ...n,
                                            data: {
                                                ...n.data,
                                                isSelected: false
                                            }
                                        }))
                                    );
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {selectedAnimal.images && selectedAnimal.images[0] && (
                            <div className="w-full h-40 mb-3 rounded-lg overflow-hidden border-2 border-gray-200">
                                <img
                                    src={selectedAnimal.images[0]}
                                    alt={selectedAnimal.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        
                        <div className="space-y-2 mb-4 text-sm">
                            <div><span className="font-semibold">Species:</span> {selectedAnimal.species}</div>
                            {selectedAnimal.sex && <div><span className="font-semibold">Sex:</span> {selectedAnimal.sex}</div>}
                            {selectedAnimal.dateOfBirth && (
                                <div><span className="font-semibold">Born:</span> {new Date(selectedAnimal.dateOfBirth).toLocaleDateString()}</div>
                            )}
                            {selectedAnimal.geneticCode && <div><span className="font-semibold">Genetics:</span> {selectedAnimal.geneticCode}</div>}
                            {selectedAnimal.sireId_public && (
                                <div><span className="font-semibold">Sire:</span> {selectedAnimal.sireId_public}</div>
                            )}
                            {selectedAnimal.damId_public && (
                                <div><span className="font-semibold">Dam:</span> {selectedAnimal.damId_public}</div>
                            )}
                        </div>
                        
                        <button
                            onClick={() => onViewAnimal && onViewAnimal(selectedAnimal)}
                            className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition"
                        >
                            View Full Details
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FamilyTree;
