import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader2, ZoomIn, ZoomOut, Home } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

const FamilyTreeView = ({ animals = [], loading = false }) => {
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [zoom, setZoom] = useState(100);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [highlightedAnimal, setHighlightedAnimal] = useState(null);
    const [highlightMode, setHighlightMode] = useState(null); // 'ancestors', 'descendants', or null
    const containerRef = useRef(null);
    const isDragging = useRef({ active: false, startX: 0, startY: 0, panStart: { x: 0, y: 0 } });

    // Get unique species
    const speciesList = useMemo(() => {
        const species = [...new Set(animals.map(a => a.species).filter(Boolean))].sort();
        if (species.length > 0 && !selectedSpecies) {
            setSelectedSpecies(species[0]);
        }
        return species;
    }, [animals, selectedSpecies]);

    // Filter animals by species
    const speciesAnimals = useMemo(() => {
        if (!selectedSpecies) return [];
        return animals.filter(a => a.species === selectedSpecies);
    }, [animals, selectedSpecies]);

    // Build family tree structure
    const treeStructure = useMemo(() => {
        if (speciesAnimals.length === 0) return { roots: [], allNodes: {} };

        const animalMap = {};
        speciesAnimals.forEach(a => { animalMap[a.id_public] = a; });

        const allNodes = {};
        const parentOf = {}; // Map of parent -> children
        const childOf = {}; // Map of child -> parents

        speciesAnimals.forEach(a => {
            allNodes[a.id_public] = {
                ...a,
                children: [],
                generation: 0,
            };

            const sireId = a.fatherId_public || a.sireId_public;
            const damId = a.motherId_public || a.damId_public;

            if (sireId) {
                if (!childOf[a.id_public]) childOf[a.id_public] = [];
                childOf[a.id_public].push(sireId);
            }
            if (damId) {
                if (!childOf[a.id_public]) childOf[a.id_public] = [];
                childOf[a.id_public].push(damId);
            }
        });

        // Find roots (animals with no parents in collection)
        const roots = speciesAnimals.filter(a => {
            const sireId = a.fatherId_public || a.sireId_public;
            const damId = a.motherId_public || a.damId_public;
            return (!sireId || !animalMap[sireId]) && (!damId || !animalMap[damId]);
        });

        // Calculate generations top-down
        const calculateGeneration = (animalId, visited = new Set()) => {
            if (visited.has(animalId)) return 0;
            visited.add(animalId);
            const animal = allNodes[animalId];
            if (!animal) return 0;

            const sireId = animal.fatherId_public || animal.sireId_public;
            const damId = animal.motherId_public || animal.damId_public;

            let maxParentGen = 0;
            if (sireId && animalMap[sireId]) {
                maxParentGen = Math.max(maxParentGen, calculateGeneration(sireId, visited));
            }
            if (damId && animalMap[damId]) {
                maxParentGen = Math.max(maxParentGen, calculateGeneration(damId, visited));
            }

            animal.generation = maxParentGen + 1;
            return animal.generation;
        };

        roots.forEach(r => calculateGeneration(r.id_public));

        // Build offspring relationships
        speciesAnimals.forEach(a => {
            const sireId = a.fatherId_public || a.sireId_public;
            const damId = a.motherId_public || a.damId_public;

            if (sireId && animalMap[sireId]) {
                if (!animalMap[sireId]._offspring) animalMap[sireId]._offspring = [];
                animalMap[sireId]._offspring.push(a.id_public);
            }
            if (damId && animalMap[damId]) {
                if (!animalMap[damId]._offspring) animalMap[damId]._offspring = [];
                animalMap[damId]._offspring.push(a.id_public);
            }
        });

        return { roots: roots.sort((a, b) => (a.name || '').localeCompare(b.name || '')), allNodes, animalMap };
    }, [speciesAnimals]);

    // Get ancestors of an animal
    const getAncestors = (animalId, visited = new Set()) => {
        if (visited.has(animalId)) return new Set();
        visited.add(animalId);

        const ancestors = new Set();
        const animal = treeStructure.allNodes[animalId];
        if (!animal) return ancestors;

        const sireId = animal.fatherId_public || animal.sireId_public;
        const damId = animal.motherId_public || animal.damId_public;

        if (sireId && treeStructure.animalMap[sireId]) {
            ancestors.add(sireId);
            getAncestors(sireId, visited).forEach(a => ancestors.add(a));
        }
        if (damId && treeStructure.animalMap[damId]) {
            ancestors.add(damId);
            getAncestors(damId, visited).forEach(a => ancestors.add(a));
        }

        return ancestors;
    };

    // Get descendants of an animal
    const getDescendants = (animalId, visited = new Set()) => {
        if (visited.has(animalId)) return new Set();
        visited.add(animalId);

        const descendants = new Set();
        const animal = treeStructure.animalMap[animalId];
        if (!animal) return descendants;

        if (animal._offspring) {
            animal._offspring.forEach(childId => {
                descendants.add(childId);
                getDescendants(childId, visited).forEach(d => descendants.add(d));
            });
        }

        return descendants;
    };

    const highlightedAnimals = useMemo(() => {
        if (!highlightedAnimal) return new Set();

        const highlighted = new Set([highlightedAnimal]);

        if (highlightMode === 'ancestors') {
            getAncestors(highlightedAnimal).forEach(a => highlighted.add(a));
        } else if (highlightMode === 'descendants') {
            getDescendants(highlightedAnimal).forEach(d => highlighted.add(d));
        }

        return highlighted;
    }, [highlightedAnimal, highlightMode, treeStructure]);

    // Mouse wheel zoom
    const handleWheel = e => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setZoom(z => Math.max(50, Math.min(200, z + delta)));
    };

    // Pan drag
    const handleMouseDown = e => {
        if (e.button !== 1 && !e.shiftKey) return; // Middle mouse or shift+left click
        isDragging.current = { active: true, startX: e.clientX, startY: e.clientY, panStart: { ...pan } };
    };

    const handleMouseMove = e => {
        if (!isDragging.current.active) return;
        const deltaX = e.clientX - isDragging.current.startX;
        const deltaY = e.clientY - isDragging.current.startY;
        setPan({
            x: isDragging.current.panStart.x + deltaX,
            y: isDragging.current.panStart.y + deltaY,
        });
    };

    const handleMouseUp = () => {
        isDragging.current.active = false;
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
            return () => container.removeEventListener('wheel', handleWheel);
        }
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                <Loader2 size={20} className="animate-spin" />
                <span>Loading family trees...</span>
            </div>
        );
    }

    if (speciesList.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p>No animals to display</p>
            </div>
        );
    }

    if (speciesAnimals.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p>No animals of this species</p>
            </div>
        );
    }

    const zoomScale = zoom / 100;

    return (
        <div className="w-full space-y-4">
            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* Species selector */}
                <select
                    value={selectedSpecies || ''}
                    onChange={e => {
                        setSelectedSpecies(e.target.value);
                        setHighlightedAnimal(null);
                        setPan({ x: 0, y: 0 });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                    {speciesList.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>

                {/* Animal count */}
                <span className="text-sm text-gray-600 font-medium">
                    {speciesAnimals.length} animal{speciesAnimals.length !== 1 ? 's' : ''}
                </span>

                {/* Zoom controls */}
                <div className="flex items-center gap-1 ml-auto">
                    <button
                        onClick={() => setZoom(z => Math.max(50, z - 10))}
                        className="p-2 hover:bg-gray-200 rounded transition"
                        title="Zoom out (Ctrl+Scroll)"
                    >
                        <ZoomOut size={16} className="text-gray-600" />
                    </button>
                    <span className="text-xs font-medium text-gray-600 w-12 text-center">{zoom}%</span>
                    <button
                        onClick={() => setZoom(z => Math.min(200, z + 10))}
                        className="p-2 hover:bg-gray-200 rounded transition"
                        title="Zoom in (Ctrl+Scroll)"
                    >
                        <ZoomIn size={16} className="text-gray-600" />
                    </button>
                </div>

                {/* Reset button */}
                <button
                    onClick={() => {
                        setZoom(100);
                        setPan({ x: 0, y: 0 });
                        setHighlightedAnimal(null);
                    }}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Reset view"
                >
                    <Home size={16} className="text-gray-600" />
                </button>
            </div>

            {/* Legend */}
            {highlightedAnimal && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-sm text-gray-700">
                            <strong>{treeStructure.allNodes[highlightedAnimal]?.name || 'Animal'}</strong> highlighted
                        </p>
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <input
                                    type="radio"
                                    checked={highlightMode === 'ancestors'}
                                    onChange={() => setHighlightMode('ancestors')}
                                    className="w-4 h-4"
                                />
                                Show Ancestors
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <input
                                    type="radio"
                                    checked={highlightMode === 'descendants'}
                                    onChange={() => setHighlightMode('descendants')}
                                    className="w-4 h-4"
                                />
                                Show Descendants
                            </label>
                            <button
                                onClick={() => setHighlightedAnimal(null)}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tree viewport */}
            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="w-full border border-gray-300 rounded-lg bg-white overflow-auto shadow-sm"
                style={{ height: '600px', cursor: 'grab', userSelect: 'none' }}
            >
                <div
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomScale})`,
                        transformOrigin: '0 0',
                        transition: isDragging.current.active ? 'none' : 'transform 0.2s',
                        minWidth: 'max-content',
                        minHeight: 'max-content',
                    }}
                >
                    <FamilyTreeGraph
                        roots={treeStructure.roots}
                        allNodes={treeStructure.allNodes}
                        highlighted={highlightedAnimals}
                        onAnimalClick={setHighlightedAnimal}
                    />
                </div>
            </div>

            {/* Info */}
            <p className="text-xs text-gray-500 italic">
                Tip: Ctrl+Scroll to zoom • Shift+Drag to pan • Click an animal to highlight relationships
            </p>
        </div>
    );
};

// Render the hierarchical tree graph
const FamilyTreeGraph = ({ roots, allNodes, highlighted, onAnimalClick }) => {
    // Group by generation
    const generationMap = {};
    Object.values(allNodes).forEach(node => {
        if (!generationMap[node.generation]) generationMap[node.generation] = [];
        generationMap[node.generation].push(node);
    });

    const generations = Object.keys(generationMap).map(Number).sort((a, b) => a - b);
    const maxGen = Math.max(...generations, 0);

    // Position nodes
    const nodePositions = {};
    const cellWidth = 200;
    const cellHeight = 140;
    const genHeight = 180;

    generations.forEach(gen => {
        const nodesInGen = generationMap[gen] || [];
        nodesInGen.forEach((node, idx) => {
            nodePositions[node.id_public] = {
                x: idx * cellWidth + 20,
                y: (maxGen - gen) * genHeight + 20,
            };
        });
    });

    // Draw edges
    const edges = [];
    Object.values(allNodes).forEach(node => {
        const sireId = node.fatherId_public || node.sireId_public;
        const damId = node.motherId_public || node.damId_public;
        const fromPos = nodePositions[node.id_public];

        if (sireId && allNodes[sireId] && fromPos) {
            const toPos = nodePositions[sireId];
            if (toPos) {
                edges.push({
                    from: node.id_public,
                    to: sireId,
                    x1: fromPos.x + 90,
                    y1: fromPos.y,
                    x2: toPos.x + 90,
                    y2: toPos.y + cellHeight,
                });
            }
        }

        if (damId && allNodes[damId] && fromPos) {
            const toPos = nodePositions[damId];
            if (toPos) {
                edges.push({
                    from: node.id_public,
                    to: damId,
                    x1: fromPos.x + 90,
                    y1: fromPos.y,
                    x2: toPos.x + 90,
                    y2: toPos.y + cellHeight,
                });
            }
        }
    });

    // Calculate SVG dimensions
    const maxX = Math.max(...Object.values(nodePositions).map(p => p.x), 200) + cellWidth + 40;
    const maxY = Math.max(...Object.values(nodePositions).map(p => p.y), 200) + cellHeight + 40;

    return (
        <div style={{ position: 'relative', width: maxX, height: maxY, paddingBottom: '40px' }}>
            {/* SVG for edges */}
            <svg
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: maxX,
                    height: maxY,
                    pointerEvents: 'none',
                }}
            >
                {edges.map((edge, idx) => (
                    <line
                        key={idx}
                        x1={edge.x1}
                        y1={edge.y1}
                        x2={edge.x2}
                        y2={edge.y2}
                        stroke={highlighted.has(edge.from) && highlighted.has(edge.to) ? '#ec4899' : '#d1d5db'}
                        strokeWidth={highlighted.has(edge.from) && highlighted.has(edge.to) ? 3 : 1}
                        opacity={highlighted.has(edge.from) && highlighted.has(edge.to) ? 1 : 0.5}
                    />
                ))}
            </svg>

            {/* Nodes */}
            {Object.entries(nodePositions).map(([animalId, pos]) => {
                const animal = allNodes[animalId];
                if (!animal) return null;

                const isHighlighted = highlighted.has(animalId);

                return (
                    <div
                        key={animalId}
                        onClick={() => onAnimalClick(animalId)}
                        style={{
                            position: 'absolute',
                            left: pos.x,
                            top: pos.y,
                            width: cellWidth - 20,
                            height: cellHeight,
                        }}
                        className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                            isHighlighted
                                ? 'bg-pink-100 border-pink-500 shadow-lg ring-2 ring-pink-300'
                                : highlighted.size > 0
                                ? 'bg-gray-50 border-gray-300 opacity-30'
                                : 'bg-white border-gray-300 hover:shadow-md hover:border-accent'
                        }`}
                    >
                        <div className="text-xs font-semibold text-gray-800 truncate">
                            {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                        </div>
                        {animal.species && <div className="text-[10px] text-gray-500">{animal.species}</div>}
                        {animal.birthDate && <div className="text-[10px] text-gray-400">{formatDate(animal.birthDate)}</div>}
                        <div className="text-[10px] text-gray-500 mt-1">
                            {animal.gender === 'Male' ? '♂' : animal.gender === 'Female' ? '♀' : '◆'} {animal.status || 'Unknown'}
                        </div>
                        {animal.color && <div className="text-[10px] text-gray-600 truncate mt-0.5">{animal.color}</div>}
                        <div className="text-[9px] text-gray-400 font-mono mt-0.5 truncate">{animal.id_public}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default FamilyTreeView;
