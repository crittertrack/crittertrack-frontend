import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
                    ${isSearchMatch ? 'ring-4 ring-yellow-400 ring-offset-2 animate-pulse' : ''}
                `}
                style={{ 
                    width: '120px', 
                    height: '120px',
                    opacity: isSearchMatch ? 1 : (isSearchMatch === false ? 0.4 : 1)
                }}
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
                    mt-2 px-4 py-2 rounded-full shadow-md text-center font-semibold text-sm transition-all
                    ${isOwned 
                        ? 'bg-primary text-black' 
                        : 'bg-gray-600 text-white'
                    }
                    ${isSearchMatch ? 'ring-2 ring-yellow-400 bg-yellow-100 text-black font-bold' : ''}
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
    const [ownedAnimalsCount, setOwnedAnimalsCount] = useState(0);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSpecies, setFilterSpecies] = useState('all');
    const [availableSpecies, setAvailableSpecies] = useState([]);
    const [error, setError] = useState(null);
    
    // React Flow state
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { setCenter, getZoom, getNode } = useReactFlow();

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
                setOwnedAnimalsCount(ownedAnimals.length);
                
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
        
        // First pass: Add all animals from API (preserving their actual ownership status)
        animals.forEach(animal => {
            allUniqueAnimals.set(animal.id_public, {
                ...animal
                // Preserve the isOwned status from the API response
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
                image: animal.imageUrl || animal.photoUrl || null,
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

    // Build graph with highlighted search results (keeps entire tree visible)
    const buildGraphWithHighlights = (allAnimalsData, matchingAnimals) => {
        const matchingIds = new Set(matchingAnimals.map(animal => animal.id_public));
        
        // Use the same graph building logic as buildGraph but highlight matches
        const allUniqueAnimals = new Map();
        const edgeList = [];
        
        // First pass: Add all animals from API (preserving their actual ownership status)
        allAnimalsData.forEach(animal => {
            allUniqueAnimals.set(animal.id_public, {
                ...animal,
                isSearchMatch: matchingIds.has(animal.id_public) // Add search match flag
            });
        });
        
        // Second pass: Add parents for all owned animals
        allAnimalsData.forEach(animal => {
            // Add sire if not already present
            if (animal.sireId_public && !allUniqueAnimals.has(animal.sireId_public)) {
                allUniqueAnimals.set(animal.sireId_public, {
                    id_public: animal.sireId_public,
                    name: animal.sireId_public,
                    species: animal.species,
                    sex: 'Male',
                    gender: 'Male',
                    isOwned: false,
                    isSearchMatch: matchingIds.has(animal.sireId_public)
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
                    isOwned: false,
                    isSearchMatch: matchingIds.has(animal.damId_public)
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
        
        // Create initial nodes without positions (with highlight styling)
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
                image: animal.imageUrl || animal.photoUrl || null,
                isOwned: animal.isOwned,
                isSelected: selectedAnimal?.id_public === animal.id_public,
                isSearchMatch: animal.isSearchMatch, // Add search match flag for styling
                animal: animal
            }
        }));
        
        // Use dagre to calculate hierarchical layout (same as buildGraph)
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
        
        // Add parent-child edges to dagre for layout calculation
        allUniqueAnimals.forEach(animal => {
            if (animal.sireId_public && allUniqueAnimals.has(animal.sireId_public)) {
                dagreGraph.setEdge(animal.sireId_public, animal.id_public);
            }
            else if (animal.damId_public && allUniqueAnimals.has(animal.damId_public)) {
                dagreGraph.setEdge(animal.damId_public, animal.id_public);
            }
        });
        
        // Calculate layout
        dagre.layout(dagreGraph);
        
        // Apply calculated positions to nodes
        nodeList.forEach(node => {
            const nodeWithPosition = dagreGraph.node(node.id);
            node.position = {
                x: nodeWithPosition.x - 90,
                y: nodeWithPosition.y - 90
            };
        });
        
        // Create family unit nodes and edges (same logic as buildGraph)
        const familyUnitNodes = [];
        const childrenWithBothParents = new Set();
        
        matingPairData.forEach((pairData, pairKey) => {
            if (pairData.children.length > 0) {
                const sireNode = dagreGraph.node(pairData.sire);
                const damNode = dagreGraph.node(pairData.dam);
                
                const midpointX = (sireNode.x + damNode.x) / 2;
                const midpointY = Math.max(sireNode.y, damNode.y) + 100;
                const midpointId = `family-${pairKey}`;
                
                familyUnitNodes.push({
                    id: midpointId,
                    type: 'default',
                    position: { x: midpointX - 10, y: midpointY - 10 },
                    data: { label: '' },
                    style: { 
                        width: 20, 
                        height: 20, 
                        backgroundColor: '#8b5cf6', 
                        borderRadius: '50%', 
                        border: '2px solid #7c3aed',
                        opacity: 0.8
                    }
                });
                
                edgeList.push({
                    id: `sire-mating-${pairKey}`,
                    source: pairData.sire,
                    target: pairData.dam,
                    type: 'straight',
                    animated: false,
                    style: { stroke: '#f97316', strokeWidth: 3, strokeDasharray: '8,4' },
                    targetHandle: 'left-target'
                });
                
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
        
        // Add edges for children with only ONE parent
        allUniqueAnimals.forEach(animal => {
            if (!childrenWithBothParents.has(animal.id_public)) {
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
        
        nodeList.push(...familyUnitNodes);
        
        console.log(`Created highlighted graph: ${nodeList.length} nodes, ${edgeList.length} edges, ${matchingAnimals.length} matches`);
        
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
                animal.id_public?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesSpecies = filterSpecies === 'all' || animal.species === filterSpecies;
            
            return matchesSearch && matchesSpecies;
        });
    }, [allAnimals, searchQuery, filterSpecies]);
    
    // Zoom to animal when search finds a match
    useEffect(() => {
        if (searchQuery && filteredAnimals.length === 1 && nodes.length > 0) {
            const foundAnimal = filteredAnimals[0];
            const node = getNode(foundAnimal.id_public);
            if (node) {
                setCenter(node.position.x + 90, node.position.y + 90, { zoom: 1.5, duration: 800 });
            }
        }
    }, [searchQuery, filteredAnimals, nodes, getNode, setCenter]);
    
    // Focus on latest born animal on initial load
    useEffect(() => {
        if (!loading && nodes.length > 0 && allAnimals.length > 0 && !searchQuery) {
            // Find the animal with the most recent dateOfBirth or createdAt
            const sortedAnimals = [...allAnimals].sort((a, b) => {
                const dateA = new Date(a.dateOfBirth || a.createdAt || 0);
                const dateB = new Date(b.dateOfBirth || b.createdAt || 0);
                return dateB - dateA; // Most recent first
            });
            
            const latestAnimal = sortedAnimals[0];
            if (latestAnimal) {
                const node = getNode(latestAnimal.id_public);
                if (node) {
                    // Small delay to ensure layout is complete
                    setTimeout(() => {
                        setCenter(node.position.x + 90, node.position.y + 90, { zoom: 0.5, duration: 1000 });
                    }, 500);
                }
            }
        }
    }, [loading, nodes, allAnimals, searchQuery, getNode, setCenter]);
    
    // Update graph when filters change - but keep entire tree for search
    useEffect(() => {
        if (allAnimals.length > 0) {
            // For search, keep entire tree visible but highlight matches
            if (searchQuery) {
                buildGraphWithHighlights(allAnimals, filteredAnimals);
            } else if (filterSpecies !== 'all') {
                // Only for species filter, actually filter the tree
                buildGraph(filteredAnimals);
            } else {
                buildGraph(allAnimals);
            }
        }
    }, [filteredAnimals, searchQuery, filterSpecies, allAnimals]);

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
        <div style={{ 
            width: 'calc(100vw - 20px)',
            height: 'calc(100vh - 130px)',
            margin: 0,
            padding: 0,
            display: 'flex',
            overflow: 'auto',
            position: 'absolute',
            top: '130px',
            left: 0,
            right: '20px',
            bottom: 0
        }}>
            {/* Left Sidebar Search Menu */}
            <div className="w-80 bg-gray-900 text-white flex flex-col h-full shadow-lg z-20">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-3">Family Tree Search</h2>
                    
                    {/* Search Input */}
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search animals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto">
                    {searchQuery ? (
                        <div className="p-2">
                            {filteredAnimals.length === 0 ? (
                                <div className="text-gray-400 text-center py-8">No animals found</div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredAnimals.map((animal) => (
                                        <button
                                            key={animal.id_public}
                                            onClick={() => {
                                                // Just pan to animal's existing position without any other changes
                                                const node = getNode(animal.id_public);
                                                if (node) {
                                                    setCenter(node.position.x + 90, node.position.y + 90, { 
                                                        duration: 800 
                                                    });
                                                }
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition ${
                                                selectedAnimal?.id_public === animal.id_public 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'text-gray-200'
                                            }`}
                                        >
                                            <div className="font-medium">{animal.name || animal.id_public}</div>
                                            {animal.name && animal.id_public && (
                                                <div className="text-sm text-gray-400">{animal.id_public}</div>
                                            )}
                                            <div className="text-xs text-gray-500">{animal.species}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4">
                            <div className="text-gray-400 text-sm mb-4">
                                Search to find animals in the family tree
                            </div>
                            
                            {/* Species Filter */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Species</label>
                                <select
                                    value={filterSpecies}
                                    onChange={(e) => setFilterSpecies(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                                >
                                    <option value="all">All Species</option>
                                    {availableSpecies.map(species => (
                                        <option key={species} value={species}>{species}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Stats */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Total Animals:</span>
                                    <span className="text-white">{allAnimals.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Owned Animals:</span>
                                    <span className="text-white">{ownedAnimalsCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Connections:</span>
                                    <span className="text-white">{totalRelationships}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Species:</span>
                                    <span className="text-white">{availableSpecies.length}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{
                flex: '1 1 auto',
                height: '100vh',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                minWidth: 0
            }}>
                {/* Header */}
                <div className="bg-white shadow-lg z-10 w-full" style={{ padding: '12px', margin: 0 }}>
                    <div className="flex items-center justify-between w-full" style={{ margin: 0, padding: 0 }}>
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
                        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <Users size={16} className="inline mr-1.5" />
                            {allAnimals.length} Animals in Tree
                        </div>
                    </div>
                </div>

                {/* Graph Container */}
                <div style={{
                    position: 'absolute',
                    top: '60px',
                    left: '320px',
                    right: '20px',
                    bottom: 0,
                    width: 'calc(100% - 340px)',
                    height: 'calc(100% - 60px)',
                    margin: 0,
                    padding: 0,
                    overflow: 'hidden'
                }}>
                    <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView={false}
                    fitViewOptions={{ padding: 0, minZoom: 0.05, maxZoom: 2 }}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.3 }}
                    attributionPosition="bottom-left"
                    style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: '#f9fafb',
                        margin: 0,
                        padding: 0
                    }}
                    defaultEdgeOptions={{
                        type: 'default',
                        animated: false,
                        style: {
                            stroke: '#6b7280',
                            strokeWidth: 2
                        }
                    }}
                    minZoom={0.05}
                    maxZoom={4}
                    edgesReconnectable={false}
                    connectionMode="loose"
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={true}
                >
                    <Background color="#ddd" gap={16} />
                    <Controls />
                    </ReactFlow>
                    
                    {/* Selected Animal Detail Panel */}
                    {selectedAnimal && (
                    <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-10" 
                         style={{ 
                             maxWidth: 'calc(100% - 40px)', 
                             maxHeight: 'calc(100vh - 140px)',
                             paddingBottom: '20px'
                         }}>
                        <div className="max-h-full overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 180px)' }}>
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
                        
                        {/* Image or Placeholder */}
                        <div className="w-full h-48 mb-4 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                            {(selectedAnimal.imageUrl || selectedAnimal.photoUrl) ? (
                                <img
                                    src={selectedAnimal.imageUrl || selectedAnimal.photoUrl}
                                    alt={selectedAnimal.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <Users size={48} className="mx-auto mb-2" />
                                        <p className="text-sm">No image available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-2 mb-4 text-sm">
                            {selectedAnimal.birthDate && (
                                <div>
                                    {(() => {
                                        const birthDate = new Date(selectedAnimal.birthDate);
                                        const today = new Date();
                                        const ageInDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
                                        const ageInMonths = Math.floor(ageInDays / 30);
                                        const remainingDays = ageInDays % 30;
                                        const ageInYears = Math.floor(ageInDays / 365);
                                        
                                        // Format date as DD/MM/YYYY
                                        const formattedDate = formatDate(birthDate);
                                        
                                        // Format age
                                        let ageStr = '';
                                        if (ageInYears > 0) {
                                            const remainingMonths = Math.floor((ageInDays % 365) / 30);
                                            ageStr = `~${ageInYears}y${remainingMonths > 0 ? ' ' + remainingMonths + 'm' : ''}`;
                                        } else if (ageInMonths > 0) {
                                            ageStr = `~${ageInMonths}m${remainingDays > 0 ? ' ' + remainingDays + 'd' : ''}`;
                                        } else {
                                            ageStr = `~${ageInDays}d`;
                                        }
                                        
                                        return `${formattedDate} (${ageStr})`;
                                    })()}
                                </div>
                            )}
                            {(selectedAnimal.color || selectedAnimal.coat || selectedAnimal.coatPattern) && (
                                <div>
                                    {[selectedAnimal.color, selectedAnimal.coatPattern, selectedAnimal.coat].filter(Boolean).join(', ')}
                                </div>
                            )}
                        </div>
                        
                        <div className="border-t pt-4 mt-4">
                            {/* Relationships Section */}
                            <h4 className="font-bold text-gray-800 mb-3">Relationships</h4>
                            
                            {/* Parent Info Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                {/* Sire Info Column */}
                                <div>
                                    {(() => {
                                        const sire = allAnimals?.find(a => a.id_public === selectedAnimal.sireId_public);
                                        if (!sire) return <div className="text-gray-400 text-xs">Not available</div>;
                                        
                                        const sireGrandsire = allAnimals?.find(a => a.id_public === sire.sireId_public);
                                        const sireGranddam = allAnimals?.find(a => a.id_public === sire.damId_public);
                                        
                                        return (
                                            <>
                                                <div className="mb-3">
                                                    <div className="text-gray-700 font-medium">
                                                        <span className="text-blue-600 font-bold text-lg mr-1.5">♂</span>
                                                        {[sire.prefix, sire.name, sire.suffix].filter(Boolean).join(' ')}
                                                    </div>
                                                    <div className="font-mono text-xs text-gray-500">({sire.id_public})</div>
                                                </div>
                                                
                                                {(sireGrandsire || sireGranddam) && (
                                                    <div className="pl-3 border-l-2 border-gray-200 space-y-2">
                                                        {sireGrandsire && (
                                                            <div>
                                                                <div className="text-xs text-gray-500">
                                                                    <span className="font-bold">♂</span> grandsire
                                                                </div>
                                                                <div className="text-gray-700">
                                                                    {[sireGrandsire.prefix, sireGrandsire.name, sireGrandsire.suffix].filter(Boolean).join(' ')}
                                                                </div>
                                                                <div className="font-mono text-xs text-gray-500">({sireGrandsire.id_public})</div>
                                                            </div>
                                                        )}
                                                        {sireGranddam && (
                                                            <div>
                                                                <div className="text-xs text-gray-500">
                                                                    <span className="font-bold">♀</span> granddam
                                                                </div>
                                                                <div className="text-gray-700">
                                                                    {[sireGranddam.prefix, sireGranddam.name, sireGranddam.suffix].filter(Boolean).join(' ')}
                                                                </div>
                                                                <div className="font-mono text-xs text-gray-500">({sireGranddam.id_public})</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                                
                                {/* Dam Info Column */}
                                <div>
                                    {(() => {
                                        const dam = allAnimals?.find(a => a.id_public === selectedAnimal.damId_public);
                                        if (!dam) return <div className="text-gray-400 text-xs">Not available</div>;
                                        
                                        const damGrandsire = allAnimals?.find(a => a.id_public === dam.sireId_public);
                                        const damGranddam = allAnimals?.find(a => a.id_public === dam.damId_public);
                                        
                                        return (
                                            <>
                                                <div className="mb-3">
                                                    <div className="text-gray-700 font-medium">
                                                        <span className="text-pink-600 font-bold text-lg mr-1.5">♀</span>
                                                        {[dam.prefix, dam.name, dam.suffix].filter(Boolean).join(' ')}
                                                    </div>
                                                    <div className="font-mono text-xs text-gray-500">({dam.id_public})</div>
                                                </div>
                                                
                                                {(damGrandsire || damGranddam) && (
                                                    <div className="pl-3 border-l-2 border-gray-200 space-y-2">
                                                        {damGrandsire && (
                                                            <div>
                                                                <div className="text-xs text-gray-500">
                                                                    <span className="font-bold">♂</span> grandsire
                                                                </div>
                                                                <div className="text-gray-700">
                                                                    {[damGrandsire.prefix, damGrandsire.name, damGrandsire.suffix].filter(Boolean).join(' ')}
                                                                </div>
                                                                <div className="font-mono text-xs text-gray-500">({damGrandsire.id_public})</div>
                                                            </div>
                                                        )}
                                                        {damGranddam && (
                                                            <div>
                                                                <div className="text-xs text-gray-500">
                                                                    <span className="font-bold">♀</span> granddam
                                                                </div>
                                                                <div className="text-gray-700">
                                                                    {[damGranddam.prefix, damGranddam.name, damGranddam.suffix].filter(Boolean).join(' ')}
                                                                </div>
                                                                <div className="font-mono text-xs text-gray-500">({damGranddam.id_public})</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                            
                            {/* Children Section */}
                            {(() => {
                                const children = allAnimals?.filter(a => 
                                    a.sireId_public === selectedAnimal.id_public || 
                                    a.damId_public === selectedAnimal.id_public
                                );
                                return children && children.length > 0 ? (
                                    <div className="border-t pt-3 mt-3">
                                        <div className="font-semibold text-purple-600 mb-2 text-sm">Children:</div>
                                        <div className="space-y-1 text-sm max-h-32 overflow-y-auto pr-2">
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
                        
                        <div className="p-4 pt-2 border-t bg-white">
                            <button
                                onClick={() => onViewAnimal && onViewAnimal(selectedAnimal)}
                                className="w-full px-4 py-3 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition"
                            >
                                View Full Details
                            </button>
                        </div>
                    </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

const FamilyTreeWithProvider = (props) => (
    <ReactFlowProvider>
        <FamilyTree {...props} />
    </ReactFlowProvider>
);

export default FamilyTreeWithProvider;
