/**
 * Shared utilities for tree components (AnimalTree, FamilyTree)
 * Extracted to reduce duplication (~50+ lines saved per component)
 */

/**
 * Get border color based on animal gender
 * @param {string} gender - Animal gender
 * @returns {string} Tailwind color class
 */
export const getGenderBorderColor = (gender) => {
    const normalizedGender = (gender || '').toLowerCase();
    switch(normalizedGender) {
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

/**
 * Format animal age from birth date
 * @param {string|Date} birthDate - Animal birth date
 * @returns {object} Object with years, months, label
 */
export const formatAnimalAge = (birthDate) => {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const today = new Date();
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    if (months < 0) {
        years--;
        months += 12;
    }
    
    if (years < 0) return null;
    
    const ageLabel = years > 0 
        ? `${years}y ${months}m`
        : `${months}m`;
    
    return { years, months, label: ageLabel };
};

/**
 * Format date in short form (e.g., "Jan 15, 2026")
 * @param {string|Date} dateString - Date to format
 * @returns {string|null} Formatted date string
 */
export const formatDateShort = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
};

/**
 * Build animal node data for ReactFlow graph
 * @param {object} animal - Animal data from API
 * @param {object} options - Configuration options
 * @returns {object} Node data formatted for ReactFlow
 */
export const createNodeData = (animal, options = {}) => {
    const {
        isOwned = true,
        isSelected = false,
        isSearchMatch = null,
        onClick = () => {}
    } = options;
    
    return {
        id_public: animal.id_public,
        label: animal.name || 'Unknown',
        prefix: animal.prefix || '',
        suffix: animal.suffix || '',
        gender: animal.gender,
        image: animal.imageUrl || animal.photoUrl,
        birthDate: animal.birthDate,
        deceasedDate: animal.deceasedDate,
        genetics: animal.geneticCode || '',
        isOwned,
        isSelected,
        isSearchMatch,
        onClick,
        // Full animal object for detail views
        animal
    };
};

/**
 * Handle node selection in tree
 * Updates selected node state and calls callback
 * @param {object} animal - Selected animal
 * @param {array} currentNodes - All nodes in graph
 * @param {function} setNodes - Setter for nodes
 * @param {function} onSelect - Selection callback
 */
export const handleNodeSelection = (animal, currentNodes, setNodes, onSelect) => {
    // Update all nodes: deselect others, select this one
    const updatedNodes = currentNodes.map(node => ({
        ...node,
        data: {
            ...node.data,
            isSelected: node.data.id_public === animal.id_public
        }
    }));
    
    setNodes(updatedNodes);
    onSelect?.(animal);
};

/**
 * Build animal graph using Dagre layout algorithm
 * Positions animals in a hierarchical tree layout
 * @param {array} animals - All animals to include
 * @param {array} relationships - Parent-child relationships
 * @param {object} config - Layout configuration
 * @returns {object} { nodes, edges } formatted for ReactFlow
 */
export const buildTreeGraph = (animals, relationships = [], config = {}) => {
    const {
        layout = 'vertical',
        nodeWidth = 140,
        nodeHeight = 140,
        levelHeight = 200,
        hierarchyOffset = 100
    } = config;
    
    const nodes = [];
    const edges = [];
    const animalMap = new Map(animals.map(a => [a.id_public, a]));
    
    // Create dagre graph for layout
    const g = new window.dagre.graphlib.Graph();
    g.setGraph({ rankdir: layout === 'horizontal' ? 'LR' : 'TB', marginx: 50, marginy: 50 });
    g.setDefaultEdgeLabel(() => ({}));
    
    // Add nodes to dagre
    for (const animal of animals) {
        g.setNode(animal.id_public, { 
            width: nodeWidth, 
            height: nodeHeight 
        });
        nodes.push({
            id: animal.id_public,
            data: createNodeData(animal),
            position: { x: 0, y: 0 } // Dagre will calculate positions
        });
    }
    
    // Add edges for relationships
    const addedEdges = new Set();
    for (const rel of relationships) {
        const edgeKey = `${rel.from}-${rel.to}`;
        if (!addedEdges.has(edgeKey)) {
            g.setEdge(rel.from, rel.to);
            edges.push({
                id: edgeKey,
                source: rel.from,
                target: rel.to,
                markerEnd: { type: 'arrowclosed' },
                animated: false,
                style: { stroke: '#cbd5e1' }
            });
            addedEdges.add(edgeKey);
        }
    }
    
    // Calculate layout using Dagre
    window.dagre.graphlib.alg.preorder(g, g.nodes()[0]);
    window.dagre.layout(g);
    
    // Apply calculated positions to ReactFlow nodes
    g.nodes().forEach(nodeId => {
        const dagNode = g.node(nodeId);
        const flowNode = nodes.find(n => n.id === nodeId);
        if (flowNode && dagNode) {
            flowNode.position = { 
                x: dagNode.x - nodeWidth / 2, 
                y: dagNode.y - nodeHeight / 2 
            };
        }
    });
    
    return { nodes, edges };
};

/**
 * Filter animals for search/species matching
 * @param {array} animals - All animals
 * @param {string} searchQuery - Search text
 * @param {string} speciesFilter - Species filter
 * @returns {object} { matches, filtered } - Matched and filtered animals
 */
export const filterTreeAnimals = (animals, searchQuery = '', speciesFilter = 'all') => {
    let filtered = animals;
    
    // Apply species filter
    if (speciesFilter && speciesFilter !== 'all') {
        filtered = filtered.filter(a => a.species === speciesFilter);
    }
    
    // Apply search query
    const matches = new Set();
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered.forEach(animal => {
            const fullName = [animal.prefix, animal.name, animal.suffix]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            
            if (fullName.includes(query) || 
                animal.id_public?.toLowerCase().includes(query) ||
                animal.geneticCode?.toLowerCase().includes(query)) {
                matches.add(animal.id_public);
            }
        });
    }
    
    return { matches, filtered };
};

/**
 * Extract unique species from animal list
 * Useful for building species filter dropdown
 * @param {array} animals - All animals
 * @returns {array} Unique species, sorted alphabetically
 */
export const getSpeciesOptions = (animals) => {
    const species = [...new Set(animals.map(a => a.species))];
    return species.filter(Boolean).sort();
};

export default {
    getGenderBorderColor,
    formatAnimalAge,
    formatDateShort,
    createNodeData,
    handleNodeSelection,
    buildTreeGraph,
    filterTreeAnimals,
    getSpeciesOptions
};
