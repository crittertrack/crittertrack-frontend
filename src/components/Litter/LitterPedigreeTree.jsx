import React, { useState, useEffect } from 'react';
import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import apiClient from '../../utils/apiClient';
import { buildTreeGraph } from '../../utils/treeComponentUtils';
import { PawPrint, Cat } from 'lucide-react';

const LitterPedigreeTreeNode = ({ node, onViewAnimal }) => {
    const { image, label, gender, isPlaceholder } = node.data;
    const isMale = gender === 'Male';
    const isFemale = gender === 'Female';
    const borderColor = isPlaceholder ? 'border-gray-300' : isMale ? 'border-blue-500' : 'border-pink-500';
    const bgColor = isPlaceholder ? 'bg-gray-100' : isMale ? 'bg-blue-50' : 'bg-pink-50';
    return (
        <div className={`rounded-xl border-2 ${borderColor} ${bgColor} p-2 cursor-pointer hover:shadow-md`} onClick={() => onViewAnimal?.(node.data.animal)}>
            <div className="h-20 w-full bg-gray-100 flex items-center justify-center mb-2">
                {image ? <img src={image} alt={label} className="max-w-full max-h-full object-cover" draggable={false} /> : (
                    isPlaceholder ? <div className="flex items-center justify-center text-gray-400"><PawPrint size={40} strokeWidth={1.5} /></div> : <div className="flex items-center justify-center text-gray-400"><Cat size={40} strokeWidth={1.5} /></div>
                )}
            </div>
            <p className="text-xs font-medium text-gray-800 text-center">{label}</p>
        </div>
    );
};

export { LitterPedigreeTreeNode };

const LitterPedigreeTree = ({ sireId, damId, litterId, generations = 4, onViewAnimal }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            setError(null);
            try {

                const animalMap = new Map();
                const queue = [{ id: sireId, depth: 0 }, { id: damId, depth: 0 }];
                const visited = new Set();

                while (queue.length > 0) {
                    if (cancelled) return;
                    const current = queue.shift();
                    const id = String(current.id);
                    if (!id || current.depth > generations || visited.has(id)) continue;
                    visited.add(id);

                    const animal = await fetchAnimal(id);
                    if (!animal) continue;

                    animalMap.set(id, { id, animal, sireId: animal.sireId_public || null, damId: animal.damId_public || null });

                    if (current.depth < generations) {
                        if (animal.sireId_public && !visited.has(String(animal.sireId_public))) {
                            queue.push({ id: String(animal.sireId_public), depth: current.depth + 1 });
                        }
                        if (animal.damId_public && !visited.has(String(animal.damId_public))) {
                            queue.push({ id: String(animal.damId_public), depth: current.depth + 1 });
                        }
                    }
                }

                const animals = [];
                const animalMap2 = new Map();
                const placeholder = {
                    id_public: litterId || 'litter-placeholder',
                    name: 'Litter',
                    gender: 'Unknown',
                    imageUrl: null,
                    photoUrl: null,
                    birthDate: null,
                    geneticCode: null,
                    prefix: '',
                    suffix: '',
                    isPlaceholder: true,
                };
                animals.push(placeholder);
                animalMap2.set(placeholder.id_public, placeholder);

                for (const [, entry] of animalMap) {
                    const animal = entry.animal;
                    const animalObj = {
                        id_public: entry.id,
                        name: animal.name || 'Unknown',
                        gender: animal.gender || 'Unknown',
                        imageUrl: animal.imageUrl || animal.photoUrl,
                        photoUrl: animal.photoUrl,
                        birthDate: animal.birthDate,
                        geneticCode: animal.geneticCode,
                        prefix: animal.prefix || '',
                        suffix: animal.suffix || '',
                        isPlaceholder: false,
                    };
                    animals.push(animalObj);
                    animalMap2.set(entry.id, animalObj);
                }

                const relationships = [];
                if (sireId) relationships.push({ from: placeholder.id_public, to: sireId });
                if (damId) relationships.push({ from: placeholder.id_public, to: damId });

                for (const [, entry] of animalMap) {
                    if (entry.animal.sireId_public && animalMap2.has(entry.animal.sireId_public)) {
                        relationships.push({ from: entry.id, to: entry.animal.sireId_public });
                    }
                    if (entry.animal.damId_public && animalMap2.has(entry.animal.damId_public)) {
                        relationships.push({ from: entry.id, to: entry.animal.damId_public });
                    }
                }

                const { nodes: flowNodes, edges: flowEdges } = buildTreeGraph(animals, relationships, {
                    layout: 'horizontal',
                    nodeWidth: 180,
                    nodeHeight: 140,
                    levelHeight: 200,
                    hierarchyOffset: 80,
                });

                if (!cancelled) {
                    setNodes(flowNodes);
                    setEdges(flowEdges);
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [sireId, damId, litterId, generations]);

    if (loading) {
        return <div className="flex items-center justify-center py-12"><span className="text-sm text-gray-400">Loading pedigree tree...</span></div>;
    }

    if (error) {
        return <div className="text-sm text-red-500">Error loading tree: {error}</div>;
    }

    return (
        <div className="w-full" style={{ height: '70vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeComponent={LitterPedigreeTreeNode}
                onNodeClick={(_, node) => onViewAnimal?.(node.data.animal)}
                fitView
                fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
                minZoom={0.2}
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default LitterPedigreeTree;

                const fetchAnimal = async (id) => {
                    if (!id) return null;
                    try { return (await apiClient.get(`/animals/any/${encodeURIComponent(id)}`)).data; }
                    catch { return { id_public: id, name: 'Unknown', gender: 'Unknown' }; }
                };
