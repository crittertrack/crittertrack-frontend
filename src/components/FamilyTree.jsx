import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Loader2, Search, X, Users, ChevronDown, ChevronUp, Filter, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import ReactFlow, { 
    Background, 
    Controls, 
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
    Position,
    Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import dagre from 'dagre';

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
    
    // Gender-based border color
    const getBorderColor = () => {
        switch(data.gender?.toLowerCase()) {
            case 'male':
                return 'border-blue-500';
            case 'female':
                return 'border-pink-500';
            case 'intersex':
                return 'border-purple-500';
            default:
                return 'border-gray-400';
        }
    };
    
    return (
        <div className="flex flex-col items-center">
            {/* Top handle for incoming edges (from parents) */}
            <Handle
                type="target"
                position={Position.Top}
                style={{ background: '#555', width: '8px', height: '8px' }}
            />
            
            {/* Left handle for partner/sibling connections */}
            <Handle
                type="source"
                position={Position.Left}
                id="left"
                style={{ background: '#10b981', width: '8px', height: '8px', top: '50%' }}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="left-target"
                style={{ background: '#10b981', width: '8px', height: '8px', top: '50%' }}
            />
            
            {/* Right handle for partner/sibling connections */}
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                style={{ background: '#10b981', width: '8px', height: '8px', top: '50%' }}
            />
            <Handle
                type="target"
                position={Position.Right}
                id="right-target"
                style={{ background: '#10b981', width: '8px', height: '8px', top: '50%' }}
            />
            
            {/* Circular Image */}
            <div
                className={`
                    rounded-full overflow-hidden border-4 shadow-lg cursor-pointer transition-all
                    ${getBorderColor()}
                    ${isSelected ? 'ring-4 ring-blue-500 scale-110' : 'hover:scale-105'}
                `}
                style={{ width: '120px', height: '120px' }}
            >
                {data.image ? (
                    <img
                        src={data.image}
                        alt={fullName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm font-semibold">
                        No Image
                    </div>
                )}
            </div>
            
            {/* Name Bar */}
            <div
                className={`
                    mt-2 px-4 py-2 rounded-full shadow-md text-center font-semibold text-sm
                    ${isOwned 
                        ? 'bg-primary text-black' 
                        : 'bg-gray-600 text-white'
                    }
                `}
                style={{ minWidth: '120px', maxWidth: '180px' }}
            >
                <div className="truncate">{fullName}</div>
            </div>
            
            {/* Bottom handle for outgoing edges (to children) */}
            <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: '#555', width: '8px', height: '8px' }}
            />
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
                
                // Fetch all owned animals first
                const animalsResponse = await axios.get(`${API_BASE_URL}/animals`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                
                const ownedAnimals = animalsResponse.data;
                console.log('Owned animals fetched:', ownedAnimals.length);
                
                // Build complete family tree by expanding ALL relationships
                let allAnimals = [...ownedAnimals];
                let processedIds = new Set(ownedAnimals.map(a => a.id_public));
                let currentBatch = ownedAnimals.map(a => a.id_public);
                let maxIterations = 20; // Increased safety limit
                
                for (let iteration = 0; iteration < maxIterations; iteration++) {
                    if (currentBatch.length === 0) {
                        console.log(`No more animals to expand after ${iteration} iterations`);
                        break;
                    }
                    
                    console.log(`Iteration ${iteration + 1}: Expanding ${currentBatch.length} animals`);
                    
                    try {
                        // Use expand endpoint to get ALL related animals (parents, children, siblings)
                        const response = await axios.post(`${API_BASE_URL}/animals/family-tree-expand`, {
                            ids: currentBatch
                        }, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        
                        const relatedAnimals = response.data;
                        console.log(`Found ${relatedAnimals.length} related animals`);
                        
                        // Add new animals and prepare next batch
                        const newAnimals = [];
                        relatedAnimals.forEach(animal => {
                            if (!processedIds.has(animal.id_public)) {
                                allAnimals.push(animal);
                                processedIds.add(animal.id_public);
                                newAnimals.push(animal.id_public);
                            }
                        });
                        
                        console.log(`Added ${newAnimals.length} new animals to tree`);
                        
                        if (newAnimals.length === 0) {
                            console.log('No new animals found, tree is complete');
                            break;
                        }
                        
                        currentBatch = newAnimals;
                    } catch (err) {
                        console.error('Failed to expand family tree:', err);
                        break;
                    }
                }
                
                console.log('✓ Complete family tree built with', allAnimals.length, 'animals');
                setAllAnimals(allAnimals);
                
                // Extract unique species
                const species = [...new Set(allAnimals.map(a => a.species))];
                setAvailableSpecies(species);
                
                // Build graph nodes and edges
                buildGraph(allAnimals);
                
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
        const allUniqueAnimals = new Map();
        const edgeList = [];
        
        // First pass: Add all owned animals
        animals.forEach(animal => {
            allUniqueAnimals.set(animal.id_public, {
                ...animal,
                isOwned: true
            });
        });
        
        // Second pass: Add parents for all owned animals
        animals.forEach(animal => {
            // Add sire if not already present
            if (animal.sireId_public && !allUniqueAnimals.has(animal.sireId_public)) {
                allUniqueAnimals.set(animal.sireId_public, {
                    id_public: animal.sireId_public,
                    name: animal.sireId_public,
                    species: animal.species,
                    sex: 'Male',
                    gender: 'Male',
                    isOwned: false
                });
            }
            
            // Add dam if not already present
            if (animal.damId_public && !allUniqueAnimals.has(animal.damId_public)) {
                allUniqueAnimals.set(animal.damId_public, {
                    id_public: animal.damId_public,
                    name: animal.damId_public,
                    species: animal.species,
                    sex: 'Female',
                    gender: 'Female',
                    isOwned: false
                });
            }
        });
        
        // Track mating pairs for later processing
        const matingPairData = new Map();
        allUniqueAnimals.forEach(animal => {
            if (animal.sireId_public && animal.damId_public && 
                allUniqueAnimals.has(animal.sireId_public) && 
                allUniqueAnimals.has(animal.damId_public)) {
                const pairKey = [animal.sireId_public, animal.damId_public].sort().join('-');
                if (!matingPairData.has(pairKey)) {
                    matingPairData.set(pairKey, {
                        sire: animal.sireId_public,
                        dam: animal.damId_public,
                        children: []
                    });
                }
                matingPairData.get(pairKey).children.push(animal.id_public);
            }
        });
        
        // Create initial nodes without positions
        const nodeList = Array.from(allUniqueAnimals.values()).map(animal => ({
            id: animal.id_public,
            type: 'animalNode',
            position: { x: 0, y: 0 }, // Will be set by dagre
            data: {
                label: animal.name || animal.id_public,
                prefix: animal.prefix || '',
                suffix: animal.suffix || '',
                gender: animal.gender || animal.sex || 'Unknown',
                species: animal.species || 'Unknown',
                genetics: animal.geneticCode || '',
                image: animal.images?.[0] || null,
                isOwned: animal.isOwned,
                isSelected: selectedAnimal?.id_public === animal.id_public,
                animal: animal
            }
        }));
        
        // Use dagre to calculate hierarchical layout
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        
        // Configure the graph for top-to-bottom layout (oldest at top, children below)
        dagreGraph.setGraph({ 
            rankdir: 'TB', // Top to bottom (classical tree layout)
            nodesep: 80,   // Reduced horizontal spacing between nodes
            ranksep: 300,  // Much more vertical spacing between generations
            marginx: 60,
            marginy: 60
        });
        
        // Add nodes to dagre graph
        nodeList.forEach(node => {
            dagreGraph.setNode(node.id, { width: 180, height: 180 });
        });
        
        // Add parent-child edges to dagre for layout calculation (using first parent of each child)
        allUniqueAnimals.forEach(animal => {
            // Add edge from sire for layout purposes
            if (animal.sireId_public && allUniqueAnimals.has(animal.sireId_public)) {
                dagreGraph.setEdge(animal.sireId_public, animal.id_public);
            }
            // If no sire but has dam, use dam for layout
            else if (animal.damId_public && allUniqueAnimals.has(animal.damId_public)) {
                dagreGraph.setEdge(animal.damId_public, animal.id_public);
            }
        });
        
        // Add partner edges to dagre so partners are positioned near each other
        matingPairData.forEach((pairData) => {
            dagreGraph.setEdge(pairData.sire, pairData.dam, { 
                minlen: 0,    // Allow them to be adjacent 
                weight: 100   // Very high weight to keep them close together
            });
        });
        
        // Calculate layout
        dagre.layout(dagreGraph);
        
        // Apply calculated positions to nodes
        nodeList.forEach(node => {
            const nodeWithPosition = dagreGraph.node(node.id);
            if (nodeWithPosition) {
                node.position = {
                    x: nodeWithPosition.x,
                    y: nodeWithPosition.y
                };
            }
        });
        
        // Align partners on the same horizontal line (same y-coordinate)
        matingPairData.forEach((pairData) => {
            const sireNode = nodeList.find(n => n.id === pairData.sire);
            const damNode = nodeList.find(n => n.id === pairData.dam);
            
            if (sireNode?.position && damNode?.position) {
                // Use the average y-coordinate for both partners
                const avgY = (sireNode.position.y + damNode.position.y) / 2;
                sireNode.position.y = avgY;
                damNode.position.y = avgY;
                
                // Ensure minimum horizontal spacing between partners (200px)
                const minSpacing = 200;
                const currentDistance = Math.abs(sireNode.position.x - damNode.position.x);
                
                if (currentDistance < minSpacing) {
                    const midX = (sireNode.position.x + damNode.position.x) / 2;
                    const halfSpacing = minSpacing / 2;
                    
                    // Position them on either side of the midpoint
                    if (sireNode.position.x < damNode.position.x) {
                        sireNode.position.x = midX - halfSpacing;
                        damNode.position.x = midX + halfSpacing;
                    } else {
                        damNode.position.x = midX - halfSpacing;
                        sireNode.position.x = midX + halfSpacing;
                    }
                }
            }
        });
        
        // Now create family unit nodes and edges AFTER positions are calculated
        const familyUnitNodes = [];
        const childrenWithBothParents = new Set();
        
        matingPairData.forEach((pairData, pairKey) => {
            const sireNode = nodeList.find(n => n.id === pairData.sire);
            const damNode = nodeList.find(n => n.id === pairData.dam);
            
            if (sireNode && damNode && sireNode.position && damNode.position) {
                const midpointId = `family-${pairKey}`;
                
                // Calculate midpoint between parents
                const midX = (sireNode.position.x + damNode.position.x) / 2;
                const midY = (sireNode.position.y + damNode.position.y) / 2;
                
                // Create small invisible family unit node
                familyUnitNodes.push({
                    id: midpointId,
                    type: 'default',
                    position: { x: midX, y: midY },
                    data: { label: '' },
                    style: {
                        width: 1,
                        height: 1,
                        background: '#8b5cf6',
                        border: 'none',
                        borderRadius: '50%'
                    }
                });
                
                // Partnership line: split into two halves through family unit
                edgeList.push({
                    id: `partner-left-${pairKey}`,
                    source: pairData.sire,
                    target: midpointId,
                    type: 'straight',
                    animated: false,
                    style: { stroke: '#f97316', strokeWidth: 3, strokeDasharray: '8,4' },
                    sourceHandle: 'right'
                });
                
                edgeList.push({
                    id: `partner-right-${pairKey}`,
                    source: midpointId,
                    target: pairData.dam,
                    type: 'straight',
                    animated: false,
                    style: { stroke: '#f97316', strokeWidth: 3, strokeDasharray: '8,4' },
                    targetHandle: 'left-target'
                });
                
                // Single line from family unit to each child
                pairData.children.forEach(childId => {
                    childrenWithBothParents.add(childId);
                    edgeList.push({
                        id: `offspring-${pairKey}-${childId}`,
                        source: midpointId,
                        target: childId,
                        type: 'smoothstep',
                        animated: false,
                        style: { stroke: '#6366f1', strokeWidth: 2 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#6366f1'
                        }
                    });
                });
            }
        });
        
        // Add edges for children with only ONE parent (no mating pair)
        allUniqueAnimals.forEach(animal => {
            if (!childrenWithBothParents.has(animal.id_public)) {
                // Sire only
                if (animal.sireId_public && allUniqueAnimals.has(animal.sireId_public) && !animal.damId_public) {
                    edgeList.push({
                        id: `sire-${animal.sireId_public}-${animal.id_public}`,
                        source: animal.sireId_public,
                        target: animal.id_public,
                        type: 'smoothstep',
                        animated: false,
                        style: { stroke: '#3b82f6', strokeWidth: 2 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#3b82f6'
                        }
                    });
                }
                
                // Dam only
                if (animal.damId_public && allUniqueAnimals.has(animal.damId_public) && !animal.sireId_public) {
                    edgeList.push({
                        id: `dam-${animal.damId_public}-${animal.id_public}`,
                        source: animal.damId_public,
                        target: animal.id_public,
                        type: 'smoothstep',
                        animated: false,
                        style: { stroke: '#ec4899', strokeWidth: 2 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#ec4899'
                        }
                    });
                }
            }
        });
        
        // Add family unit nodes to the node list
        nodeList.push(...familyUnitNodes);
        
        console.log(`Created ${nodeList.length} nodes and ${edgeList.length} edges`);
        console.log('Edge types:', edgeList.map(e => e.id.split('-')[0]));
        console.log('Sample edges:', edgeList.slice(0, 3));
        
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
                    fitViewOptions={{ padding: 0.05, minZoom: 0.25, maxZoom: 0.25 }}
                    attributionPosition="bottom-left"
                    className="bg-gray-50"
                    defaultEdgeOptions={{
                        type: 'default',
                        animated: false
                    }}
                    minZoom={0.1}
                    maxZoom={4}
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
                    <div className="absolute top-4 right-4 w-96 bg-white rounded-lg shadow-2xl p-5 border border-gray-200 max-h-[calc(100vh-100px)] overflow-y-auto z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    {[selectedAnimal.prefix, selectedAnimal.name, selectedAnimal.suffix].filter(Boolean).join(' ')}
                                </h3>
                                <p className="text-sm text-gray-600 font-mono mt-1">{selectedAnimal.id_public}</p>
                            </div>
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
                            <div className="w-full h-48 mb-4 rounded-lg overflow-hidden border-2 border-gray-200">
                                <img
                                    src={selectedAnimal.images[0]}
                                    alt={selectedAnimal.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        
                        <div className="space-y-2 mb-4 text-sm">
                            {selectedAnimal.sex && <div><span className="font-semibold">Sex:</span> {selectedAnimal.sex}</div>}
                            {selectedAnimal.dateOfBirth && (
                                <div>
                                    <span className="font-semibold">Age:</span> {
                                        (() => {
                                            const birthDate = new Date(selectedAnimal.dateOfBirth);
                                            const today = new Date();
                                            const ageInDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
                                            const ageInWeeks = Math.floor(ageInDays / 7);
                                            const ageInMonths = Math.floor(ageInDays / 30);
                                            const ageInYears = Math.floor(ageInDays / 365);
                                            
                                            if (ageInDays < 7) return `${ageInDays} days`;
                                            if (ageInWeeks < 8) return `${ageInWeeks} weeks`;
                                            if (ageInMonths < 24) return `${ageInMonths} months`;
                                            return `${ageInYears} years`;
                                        })()
                                    }
                                </div>
                            )}
                            {selectedAnimal.color && <div><span className="font-semibold">Color:</span> {selectedAnimal.color}</div>}
                        </div>
                        
                        {/* Relationships Section */}
                        <div className="border-t pt-4 mt-4">
                            <h4 className="font-bold text-gray-800 mb-3">Relationships</h4>
                            <div className="space-y-3 text-sm">
                                {/* Sire */}
                                {(() => {
                                    const sire = allAnimals?.find(a => a.id_public === selectedAnimal.sireId_public);
                                    return sire ? (
                                        <div>
                                            <span className="font-semibold text-blue-600">Sire:</span>
                                            <div className="ml-4 text-gray-700">
                                                {[sire.prefix, sire.name, sire.suffix].filter(Boolean).join(' ')}
                                                <span className="font-mono text-xs text-gray-500 ml-2">({sire.id_public})</span>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                                
                                {/* Dam */}
                                {(() => {
                                    const dam = allAnimals?.find(a => a.id_public === selectedAnimal.damId_public);
                                    return dam ? (
                                        <div>
                                            <span className="font-semibold text-pink-600">Dam:</span>
                                            <div className="ml-4 text-gray-700">
                                                {[dam.prefix, dam.name, dam.suffix].filter(Boolean).join(' ')}
                                                <span className="font-mono text-xs text-gray-500 ml-2">({dam.id_public})</span>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                                
                                {/* Grandsire (Sire's Sire) */}
                                {(() => {
                                    const sire = allAnimals?.find(a => a.id_public === selectedAnimal.sireId_public);
                                    const grandsire = sire ? allAnimals?.find(a => a.id_public === sire.sireId_public) : null;
                                    return grandsire ? (
                                        <div>
                                            <span className="font-semibold text-blue-500">Grandsire:</span>
                                            <div className="ml-4 text-gray-700">
                                                {[grandsire.prefix, grandsire.name, grandsire.suffix].filter(Boolean).join(' ')}
                                                <span className="font-mono text-xs text-gray-500 ml-2">({grandsire.id_public})</span>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                                
                                {/* Granddam (Dam's Dam) */}
                                {(() => {
                                    const dam = allAnimals?.find(a => a.id_public === selectedAnimal.damId_public);
                                    const granddam = dam ? allAnimals?.find(a => a.id_public === dam.damId_public) : null;
                                    return granddam ? (
                                        <div>
                                            <span className="font-semibold text-pink-500">Granddam:</span>
                                            <div className="ml-4 text-gray-700">
                                                {[granddam.prefix, granddam.name, granddam.suffix].filter(Boolean).join(' ')}
                                                <span className="font-mono text-xs text-gray-500 ml-2">({granddam.id_public})</span>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                                
                                {/* Children */}
                                {(() => {
                                    const children = allAnimals?.filter(a => 
                                        a.sireId_public === selectedAnimal.id_public || 
                                        a.damId_public === selectedAnimal.id_public
                                    );
                                    return children && children.length > 0 ? (
                                        <div>
                                            <span className="font-semibold text-purple-600">Children:</span>
                                            <div className="ml-4 space-y-1 mt-1">
                                                {children.map(child => {
                                                    const partner = child.sireId_public === selectedAnimal.id_public
                                                        ? allAnimals?.find(a => a.id_public === child.damId_public)
                                                        : allAnimals?.find(a => a.id_public === child.sireId_public);
                                                    
                                                    return (
                                                        <div key={child.id_public} className="text-gray-700">
                                                            {[child.prefix, child.name, child.suffix].filter(Boolean).join(' ')}
                                                            <span className="font-mono text-xs text-gray-500 ml-1">({child.id_public})</span>
                                                            {partner && (
                                                                <span className="text-gray-500 text-xs ml-2">
                                                                    with {[partner.prefix, partner.name, partner.suffix].filter(Boolean).join(' ')}
                                                                    <span className="font-mono ml-1">({partner.id_public})</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        </div>
                        
                        <button
                            onClick={() => onViewAnimal && onViewAnimal(selectedAnimal)}
                            className="w-full px-4 py-3 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition mt-4"
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
