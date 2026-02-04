import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, X, Users } from 'lucide-react';
import ReactFlow, { 
    Background, 
    Controls, 
    useNodesState,
    useEdgesState,
    MarkerType,
    Position,
    Handle,
    useReactFlow,
    ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import dagre from 'dagre';
import { formatDate } from '../utils/dateFormatter';

const API_BASE_URL = '/api';

/**
 * ProjectTree Component
 * 
 * Displays a simplified family tree visualization showing:
 * - Only owned animals and their immediate parents
 * - Parents can be global/private but only one generation up
 * - Interactive graph with pan/zoom
 * - Parent-child connections shown as edges
 * - Clickable nodes to view animal details
 */

// Custom node component for animals (same as FamilyTree)
const AnimalNode = ({ data }) => {
    const isOwned = data.isOwned;
    const isSelected = data.isSelected;
    const isSearchMatch = data.isSearchMatch;
    
    // Build full name with prefix/suffix
    const fullName = [data.prefix, data.label, data.suffix].filter(Boolean).join(' ');
    
    // Gender-based border color
    const getBorderColor = () => {
        const gender = data.gender?.toLowerCase() || data.animal?.sex?.toLowerCase() || '';
        switch(gender) {
            case 'male':
            case 'm':
                return 'border-blue-500';
            case 'female': 
            case 'f':
                return 'border-pink-500';
            case 'intersex':
                return 'border-purple-500';
            default:
                return 'border-gray-400';
        }
    };
    
    return (
        <div className="flex flex-col items-center">
            <Handle
                type="target"
                position={Position.Top}
                style={{ background: '#555', width: '8px', height: '8px' }}
            />
            
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
            
            <div
                className={`
                    rounded-full overflow-hidden border-4 shadow-lg cursor-pointer transition-all
                    ${getBorderColor()}
                    ${isSelected ? 'ring-4 ring-blue-500 scale-110' : 'hover:scale-105'}
                    ${isSearchMatch ? 'ring-4 ring-yellow-400 ring-offset-2 animate-pulse' : ''}
                    ${!isOwned ? 'opacity-60' : ''}
                `}
                style={{ 
                    width: '120px', 
                    height: '120px',
                    opacity: isSearchMatch ? 1 : (isSearchMatch === false ? 0.4 : 1)
                }}
                onClick={data.onClick}
            >
                {data.image ? (
                    <img
                        src={data.image}
                        alt={fullName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Users size={48} className="text-gray-500" />
                    </div>
                )}
            </div>
            
            <div 
                className={`
                    mt-2 px-3 py-1 bg-white rounded-lg shadow-md border text-center max-w-[160px]
                    ${isSearchMatch ? 'ring-2 ring-yellow-400 bg-yellow-100 text-black font-bold' : ''}
                `}
                style={{ minWidth: '120px' }}
            >
                <div className="text-xs font-semibold text-gray-800 truncate" title={fullName}>
                    {fullName}
                </div>
                {data.genetics && (
                    <div className="text-xs text-gray-500 truncate" title={data.genetics}>
                        {data.genetics}
                    </div>
                )}
            </div>
            
            <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: '#555', width: '8px', height: '8px' }}
            />
        </div>
    );
};

const ProjectTreeContent = ({ authToken, userProfile, showModalMessage, onViewAnimal, onBack }) => {
    const { species: urlSpecies } = useParams();
    const decodedSpecies = urlSpecies ? decodeURIComponent(urlSpecies) : 'all';
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allAnimals, setAllAnimals] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    
    const { fitView } = useReactFlow();

    // Node types
    const nodeTypes = useMemo(() => ({
        animalNode: AnimalNode
    }), []);

    // Fetch owned animals and their immediate parents only
    useEffect(() => {
        const fetchAnimalsAndBuildGraph = async () => {
            setLoading(true);
            setError(null);
            
            try {
                console.log('[ProjectTree] Fetching owned animals...');
                
                // Get all owned animals
                const ownedResponse = await axios.get(`${API_BASE_URL}/animals`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                
                const ownedAnimals = ownedResponse.data;
                console.log(`[ProjectTree] Found ${ownedAnimals.length} owned animals`);
                
                // Collect all parent IDs
                const parentIds = new Set();
                ownedAnimals.forEach(animal => {
                    if (animal.sireId_public) parentIds.add(animal.sireId_public);
                    if (animal.damId_public) parentIds.add(animal.damId_public);
                });
                
                console.log(`[ProjectTree] Found ${parentIds.size} unique parent references`);
                
                // Fetch parent details if any
                let parentAnimals = [];
                if (parentIds.size > 0) {
                    try {
                        const parentsResponse = await axios.post(`${API_BASE_URL}/animals/batch`, {
                            ids: Array.from(parentIds)
                        }, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        parentAnimals = parentsResponse.data;
                        console.log(`[ProjectTree] Retrieved ${parentAnimals.length} parent animals`);
                    } catch (err) {
                        console.error('[ProjectTree] Failed to fetch parent details:', err);
                        // Continue without parent details
                    }
                }
                
                // Combine owned and parent animals
                const allAnimals = [...ownedAnimals, ...parentAnimals];
                console.log(`[ProjectTree] Total animals in tree: ${allAnimals.length}`);
                
                setAllAnimals(allAnimals);
                
                // Build graph nodes and edges
                buildGraph(allAnimals, ownedAnimals);
                
                setLoading(false);
            } catch (err) {
                console.error('[ProjectTree] Failed to fetch animals:', err);
                setError('Failed to load project tree data');
                setLoading(false);
            }
        };
        
        fetchAnimalsAndBuildGraph();
    }, [authToken]);

    // Build graph from animals data
    const buildGraph = (allAnimals, ownedAnimals) => {
        const allUniqueAnimals = new Map();
        const ownedIds = new Set(ownedAnimals.map(a => a.id_public));
        
        // Add all animals
        allAnimals.forEach(animal => {
            allUniqueAnimals.set(animal.id_public, {
                ...animal,
                isOwned: ownedIds.has(animal.id_public)
            });
        });
        
        // Add placeholder nodes for missing parents
        allAnimals.forEach(animal => {
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
        
        // Track mating pairs
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
        
        // Create nodes
        const nodeList = Array.from(allUniqueAnimals.values()).map(animal => ({
            id: animal.id_public,
            type: 'animalNode',
            position: { x: 0, y: 0 },
            data: {
                label: animal.name || animal.id_public,
                prefix: animal.prefix || '',
                suffix: animal.suffix || '',
                gender: animal.gender || animal.sex || 'Unknown',
                species: animal.species || 'Unknown',
                genetics: animal.geneticCode || '',
                image: animal.imageUrl || animal.photoUrl || null,
                isOwned: animal.isOwned,
                isSelected: selectedAnimal?.id_public === animal.id_public,
                animal: animal,
                onClick: () => handleNodeClick(animal)
            }
        }));
        
        // Use dagre for layout
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        
        dagreGraph.setGraph({ 
            rankdir: 'TB',
            nodesep: 80,
            ranksep: 300,
            marginx: 60,
            marginy: 60
        });
        
        nodeList.forEach(node => {
            dagreGraph.setNode(node.id, { width: 180, height: 180 });
        });
        
        // Add parent-child edges
        allUniqueAnimals.forEach(animal => {
            if (animal.sireId_public && allUniqueAnimals.has(animal.sireId_public)) {
                dagreGraph.setEdge(animal.sireId_public, animal.id_public);
            }
            else if (animal.damId_public && allUniqueAnimals.has(animal.damId_public)) {
                dagreGraph.setEdge(animal.damId_public, animal.id_public);
            }
        });
        
        // Add partner edges
        matingPairData.forEach((pairData) => {
            dagreGraph.setEdge(pairData.sire, pairData.dam, { 
                minlen: 0,
                weight: 100
            });
        });
        
        dagre.layout(dagreGraph);
        
        // Apply positions
        nodeList.forEach(node => {
            const nodeWithPosition = dagreGraph.node(node.id);
            if (nodeWithPosition) {
                node.position = {
                    x: nodeWithPosition.x,
                    y: nodeWithPosition.y
                };
            }
        });
        
        // Align partners horizontally
        matingPairData.forEach((pairData) => {
            const sireNode = nodeList.find(n => n.id === pairData.sire);
            const damNode = nodeList.find(n => n.id === pairData.dam);
            
            if (sireNode?.position && damNode?.position) {
                const avgY = (sireNode.position.y + damNode.position.y) / 2;
                sireNode.position.y = avgY;
                damNode.position.y = avgY;
                
                const minSpacing = 200;
                const currentDistance = Math.abs(sireNode.position.x - damNode.position.x);
                
                if (currentDistance < minSpacing) {
                    const midX = (sireNode.position.x + damNode.position.x) / 2;
                    const halfSpacing = minSpacing / 2;
                    
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
        
        // Create edges
        const edgeList = [];
        
        // Parent-child edges
        allUniqueAnimals.forEach(animal => {
            if (animal.sireId_public && allUniqueAnimals.has(animal.sireId_public)) {
                edgeList.push({
                    id: `${animal.sireId_public}-${animal.id_public}`,
                    source: animal.sireId_public,
                    target: animal.id_public,
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#94a3b8', strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }
                });
            }
            
            if (animal.damId_public && allUniqueAnimals.has(animal.damId_public)) {
                edgeList.push({
                    id: `${animal.damId_public}-${animal.id_public}`,
                    source: animal.damId_public,
                    target: animal.id_public,
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#94a3b8', strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }
                });
            }
        });
        
        // Partner edges
        matingPairData.forEach((pairData) => {
            const sireNode = nodeList.find(n => n.id === pairData.sire);
            const damNode = nodeList.find(n => n.id === pairData.dam);
            
            if (sireNode?.position && damNode?.position) {
                const partnerId = `partner-${pairData.sire}-${pairData.dam}`;
                edgeList.push({
                    id: partnerId,
                    source: pairData.sire,
                    target: pairData.dam,
                    sourceHandle: sireNode.position.x < damNode.position.x ? 'right' : 'left',
                    targetHandle: sireNode.position.x < damNode.position.x ? 'left-target' : 'right-target',
                    type: 'straight',
                    animated: false,
                    style: { stroke: '#10b981', strokeWidth: 3 }
                });
            }
        });
        
        setNodes(nodeList);
        setEdges(edgeList);
        
        setTimeout(() => {
            fitView({ padding: 0.2, duration: 800 });
        }, 100);
    };

    const handleNodeClick = (animal) => {
        setSelectedAnimal(animal);
        if (onViewAnimal) {
            onViewAnimal(animal);
        }
    };

    // Apply search filter
    const filteredNodes = useMemo(() => {
        let filtered = nodes;
        
        // Species filter from URL
        if (decodedSpecies && decodedSpecies !== 'all') {
            filtered = filtered.map(node => ({
                ...node,
                hidden: node.data.species !== decodedSpecies
            }));
        }
        
        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.map(node => {
                const fullName = [node.data.prefix, node.data.label, node.data.suffix].filter(Boolean).join(' ').toLowerCase();
                const matches = fullName.includes(query) || 
                               node.id.toLowerCase().includes(query) ||
                               node.data.genetics?.toLowerCase().includes(query);
                
                return {
                    ...node,
                    data: {
                        ...node.data,
                        isSearchMatch: matches ? true : (searchQuery.trim() ? false : undefined)
                    }
                };
            });
        } else {
            filtered = filtered.map(node => ({
                ...node,
                data: {
                    ...node.data,
                    isSearchMatch: undefined
                }
            }));
        }
        
        return filtered;
    }, [nodes, searchQuery, decodedSpecies]);

    const clearSearch = () => {
        setSearchQuery('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-600">Building your project tree...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Project Tree {decodedSpecies && decodedSpecies !== 'all' && `- ${decodedSpecies}`}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {allAnimals.length} animals • Your collection and their parents
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search animals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-64"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            {/* ReactFlow Graph */}
            <div className="flex-1">
                <ReactFlow
                    nodes={filteredNodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={2}
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                        animated: false
                    }}
                >
                    <Background color="#e5e7eb" gap={16} />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
};

const ProjectTree = (props) => {
    return (
        <ReactFlowProvider>
            <ProjectTreeContent {...props} />
        </ReactFlowProvider>
    );
};

export default ProjectTree;
