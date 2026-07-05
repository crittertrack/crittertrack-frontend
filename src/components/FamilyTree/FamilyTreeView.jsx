import React, { useState, useMemo, useRef, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ZoomIn, ZoomOut, Home, Cat } from 'lucide-react';
import dagre from 'dagre';
import { formatDate } from '../../utils/dateFormatter';

const NODE_W = 96;
const NODE_H = 92;
const API_BASE_URL = '/api';
const MIN_ZOOM = 20;
const MAX_ZOOM = 180;

const parseCtcNumeric = (idPublic = '') => {
    const m = String(idPublic).match(/(\d+)/);
    return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
};

const compareSiblingOrder = (a, b) => {
    const dateA = a?.birthDate ? new Date(a.birthDate).getTime() : Number.MAX_SAFE_INTEGER;
    const dateB = b?.birthDate ? new Date(b.birthDate).getTime() : Number.MAX_SAFE_INTEGER;
    if (dateA !== dateB) return dateA - dateB;

    const ctcA = parseCtcNumeric(a?.id_public);
    const ctcB = parseCtcNumeric(b?.id_public);
    if (ctcA !== ctcB) return ctcA - ctcB;

    const nameA = [a?.prefix, a?.name, a?.suffix].filter(Boolean).join(' ').toLowerCase();
    const nameB = [b?.prefix, b?.name, b?.suffix].filter(Boolean).join(' ').toLowerCase();
    return nameA.localeCompare(nameB);
};

const lineLaneOffset = (key = '', spread = 6) => {
    const hashKey = (k = '') => { let h = 0; for (let i = 0; i < k.length; i++) { h = ((h << 5) - h) + k.charCodeAt(i); h |= 0; } return Math.abs(h); };
    const bucket = hashKey(String(key)) % 3; // 0..2
    return (bucket - 1) * spread;
};

const snapCoord = (value) => Math.round(Number(value || 0) * 2) / 2;

const quantizePathData = (d = '') => String(d).replace(/-?\d+(?:\.\d+)?/g, (m) => {
    const n = Number(m);
    if (!Number.isFinite(n)) return m;
    return String(snapCoord(n));
});

const keepAwayFromNode = (value, nodeTop, nodeBottom, gap = 6) => {
    if (value < nodeTop + gap) return nodeTop + gap;
    if (value > nodeBottom - gap) return nodeBottom - gap;
    return value;
};

const VARIETY_KEYS = [
    'color', 'coatPattern', 'coat', 'earset', 'phenotype', 'morph',
    'markings', 'eyeColor', 'nailColor', 'carrierTraits', 'size',
];

const getVarietyLabel = (animal = {}) => {
    const direct = String(animal?.variety || animal?.varietyName || '').trim();
    if (direct) return direct;

    const derived = VARIETY_KEYS
        .map((key) => animal?.[key])
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .join(' ');

    return derived || 'Unknown variety';
};

const FamilyTreeView = ({
    animals = [], // from parent, for quick lookups
    focusAnimalId,
    onNodeClick,
    authToken,
    graphMode = 'direct',
    selectedSpecies,
}) => {
    const [lineageData, setLineageData] = useState({});
    const [lineageLoading, setLineageLoading] = useState(false);
    const [zoom, setZoom] = useState(85);
    const [pan, setPan] = useState({ x: 24, y: 24 });
    const containerRef = useRef(null);
    const dragRef = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });
    const touchRef = useRef({ mode: null, startX: 0, startY: 0, originX: 0, originY: 0, startDist: 0, startZoom: 85 });
    const panStateRef = useRef({ x: 24, y: 24 });
    const zoomStateRef = useRef(85);
    const viewFrameRef = useRef(null);
    const pendingViewRef = useRef({ pan: { x: 24, y: 24 }, zoom: 85 });

    const clampPanToViewport = (nextPan, nextZoom) => {
        const container = containerRef.current;
        if (!container || !graphData?.width || !graphData?.height) return nextPan;

        const scale = nextZoom / 100;
        const scaledW = graphData.width * scale;
        const scaledH = graphData.height * scale;
        let x = nextPan.x;
        let y = nextPan.y;

        if (scaledW <= container.clientWidth) {
            x = (container.clientWidth - scaledW) / 2;
        } else {
            const minX = container.clientWidth - scaledW;
            const maxX = 0;
            x = Math.min(maxX, Math.max(minX, x));
        }

        if (scaledH <= container.clientHeight) {
            y = (container.clientHeight - scaledH) / 2;
        } else {
            const minY = container.clientHeight - scaledH;
            const maxY = 0;
            y = Math.min(maxY, Math.max(minY, y));
        }

        return { x, y };
    };

    const scheduleViewUpdate = (nextPan, nextZoom) => {
        const targetZoom = typeof nextZoom === 'number' ? nextZoom : pendingViewRef.current.zoom;
        const unclampedPan = nextPan || pendingViewRef.current.pan;
        const targetPan = clampPanToViewport(unclampedPan, targetZoom);

        pendingViewRef.current = {
            pan: targetPan,
            zoom: targetZoom,
        };

        panStateRef.current = pendingViewRef.current.pan;
        zoomStateRef.current = pendingViewRef.current.zoom;

        if (viewFrameRef.current) return;
        viewFrameRef.current = requestAnimationFrame(() => {
            viewFrameRef.current = null;
            setPan(pendingViewRef.current.pan);
            setZoom(pendingViewRef.current.zoom);
        });
    };

    useEffect(() => {
        if (!focusAnimalId) {
            setLineageData({});
            return;
        }

        const fetchDirectLineage = async () => {
            setLineageLoading(true);
            const nodes = {};
            const visited = new Set();
            const fetchAnimalData = async (id) => {
                if (!id) return null;
                const localAnimal = (animals || []).find(a => a.id_public === id);
                if (localAnimal) return localAnimal;
                if (nodes[id]) return nodes[id];
                try {
                    const response = await axios.get(`${API_BASE_URL}/animals/any/${id}`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    return response.data;
                } catch (e) {
                    console.warn(`Could not fetch animal ${id}`);
                    return { id_public: id, name: 'Unknown', isPlaceholder: true };
                }
            };

            // Fetch ancestors
            const ancestorQueue = [focusAnimalId];
            while (ancestorQueue.length > 0) {
                const currentId = ancestorQueue.shift();
                if (!currentId || visited.has(currentId)) continue;
                visited.add(currentId);

                const animalData = await fetchAnimalData(currentId);
                if (animalData) {
                    nodes[currentId] = animalData;
                    const sireId = animalData.sireId_public || animalData.fatherId_public;
                    const damId = animalData.damId_public || animalData.motherId_public;
                    if (sireId) ancestorQueue.push(sireId);
                    if (damId) ancestorQueue.push(damId);
                }
            }

            // Fetch direct offspring
            try {
                const offspringResponse = await axios.get(`${API_BASE_URL}/animals/${focusAnimalId}/offspring`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const litters = offspringResponse.data || [];
                const otherParentIds = new Set();
                for (const litter of litters) {
                    if (litter.offspring && Array.isArray(litter.offspring)) {
                        for (const offspring of litter.offspring) {
                            if (offspring && offspring.id_public) {
                                nodes[offspring.id_public] = offspring;
                                const otherParentId = (litter.sireId === focusAnimalId || litter.sireId_public === focusAnimalId) ? (litter.damId || litter.damId_public) : (litter.sireId || litter.sireId_public);
                                if (otherParentId) {
                                    otherParentIds.add(otherParentId);
                                }
                            }
                        }
                    }
                }
                
                for (const parentId of otherParentIds) {
                    if (!nodes[parentId]) {
                        const parentData = await fetchAnimalData(parentId);
                        if (parentData) {
                            nodes[parentId] = parentData;
                        }
                    }
                }
            } catch (e) {
                console.error(`Failed to fetch offspring for ${focusAnimalId}`, e);
            }

            setLineageData(nodes);
            setLineageLoading(false);
        };

        const fetchFullGraph = async () => {
            setLineageLoading(true);
            const nodes = {};
            const visited = new Set();

            const speciesAnimals = animals.filter(a => a.species === selectedSpecies);
            speciesAnimals.forEach(a => {
                if (a && a.id_public) {
                    nodes[a.id_public] = a;
                    visited.add(a.id_public);
                }
            });

            const fetchAnimalData = async (id) => {
                if (!id) return null;
                if (nodes[id]) return nodes[id];
                try {
                    const response = await axios.get(`${API_BASE_URL}/animals/any/${id}`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    return response.data;
                } catch (e) {
                    console.warn(`Could not fetch animal ${id}`);
                    return { id_public: id, name: 'Unknown', isPlaceholder: true };
                }
            };

            const queue = [];
            const enqueueParentIfMissing = (id) => {
                if (!id || visited.has(id)) return;
                visited.add(id);
                queue.push(id);
            };

            speciesAnimals.forEach(a => {
                enqueueParentIfMissing(a.sireId_public || a.fatherId_public);
                enqueueParentIfMissing(a.damId_public || a.motherId_public);
            });

            let guard = 0;
            while (queue.length > 0 && guard < 1000) {
                guard++;
                const currentId = queue.shift();
                const animalData = await fetchAnimalData(currentId);
                if (animalData) {
                    nodes[currentId] = animalData;
                    enqueueParentIfMissing(animalData.sireId_public || animalData.fatherId_public);
                    enqueueParentIfMissing(animalData.damId_public || animalData.motherId_public);
                }
            }

            setLineageData(nodes);
            setLineageLoading(false);
        };

        if (graphMode === 'full' && selectedSpecies) {
            fetchFullGraph();
        } else {
            fetchDirectLineage();
        }
    }, [focusAnimalId, authToken, animals, graphMode, selectedSpecies]);

    const graphData = useMemo(() => {
        const lineageAnimals = Object.values(lineageData);
        if (lineageAnimals.length === 0) {
            return { byId: {}, positions: {}, edgeSegments: [], width: 0, height: 0, focusId: null };
        }

        const allById = {};
        const childrenByParentAll = {};
        const parentLinksByChildAll = {};

        lineageAnimals.forEach(a => {
            if (a && a.id_public) {
                allById[a.id_public] = a;
            }
        });

        Object.values(allById).forEach(a => {
            const parents = [a.fatherId_public || a.sireId_public, a.motherId_public || a.damId_public].filter(Boolean);
            parentLinksByChildAll[a.id_public] = parents.filter(pid => allById[pid]);
            parentLinksByChildAll[a.id_public].forEach(pid => {
                if (!childrenByParentAll[pid]) childrenByParentAll[pid] = [];
                childrenByParentAll[pid].push(a.id_public);
            });
        });

        const byId = {};
        Object.assign(byId, allById);

        const childrenByParent = {};
        const parentLinksByChild = {};
        Object.keys(byId).forEach(cid => {
            const parentIds = (parentLinksByChildAll[cid] || []).filter(pid => byId[pid]);
            parentLinksByChild[cid] = parentIds;
            parentIds.forEach(pid => {
                if (!childrenByParent[pid]) childrenByParent[pid] = [];
                childrenByParent[pid].push(cid);
            });
        });

        const g = new dagre.graphlib.Graph();
        g.setGraph({
            rankdir: 'TB',
            nodesep: 30,
            ranksep: 220,
            marginx: 24,
            marginy: 24,
            ranker: 'tight-tree',
        });
        g.setDefaultEdgeLabel(() => ({}));

        Object.values(byId).forEach(a => {
            g.setNode(a.id_public, { width: NODE_W, height: NODE_H });
        });

        Object.values(byId).forEach(child => {
            (parentLinksByChild[child.id_public] || []).forEach(parentId => {
                g.setEdge(parentId, child.id_public);
            });
        });

        dagre.layout(g);

        const positions = {};
        g.nodes().forEach(id => {
            const n = g.node(id);
            positions[id] = { x: snapCoord(n.x - NODE_W / 2), y: snapCoord(n.y - NODE_H / 2) };
        });

        const edgeSegments = [];
        const pairGroups = {};
        Object.entries(parentLinksByChild).forEach(([childId, linkedParentIds]) => {
            const parents = (linkedParentIds || []).filter(pid => byId[pid] && positions[pid]);
            if (!parents.length) return;
            const key = parents.slice().sort().join('|');
            if (!pairGroups[key]) pairGroups[key] = { parentIds: parents.slice().sort(), childIds: [] };
            pairGroups[key].childIds.push(childId);
        });

        const pairInfoByKey = {};
        Object.entries(pairGroups).forEach(([pairKey, group]) => {
            const parentIds = (group.parentIds || []).filter(pid => positions[pid]);
            if (parentIds.length < 2) return;

            const childCenters = (group.childIds || [])
                .filter(cid => positions[cid])
                .map(cid => positions[cid].x + NODE_W / 2);

            const childMidpoint = childCenters.length
                ? childCenters.reduce((sum, x) => sum + x, 0) / childCenters.length
                : parentIds.reduce((sum, pid) => sum + (positions[pid].x + NODE_W / 2), 0) / parentIds.length;

            pairInfoByKey[pairKey] = {
                pairKey,
                parentIds,
                childMidpoint,
            };
        });

        const litterInfoByKey = {};
        const litterKeyByChildId = {};
        Object.entries(pairGroups).forEach(([pairKey, group]) => {
            (group.childIds || []).forEach(childId => {
                const child = byId[childId];
                if (!child || !positions[childId]) return;

                const birthKey = child.birthDate
                    ? new Date(child.birthDate).toISOString().slice(0, 10)
                    : `unknown:${childId}`;
                const litterKey = `${pairKey}|${birthKey}`;

                if (!litterInfoByKey[litterKey]) {
                    const pairInfo = pairInfoByKey[pairKey];
                    litterInfoByKey[litterKey] = {
                        litterKey,
                        pairKey,
                        birthKey,
                        childIds: [],
                        center: Number.isFinite(pairInfo?.childMidpoint)
                            ? pairInfo.childMidpoint
                            : (positions[childId].x + NODE_W / 2),
                    };
                }

                litterInfoByKey[litterKey].childIds.push(childId);
                litterKeyByChildId[childId] = litterKey;
            });
        });

        // Post-layout ordering pass: keep each generation deterministic and grouped by parent midpoint.
        const rankIds = {};
        Object.entries(positions).forEach(([id, pos]) => {
            const rankKey = String(Math.round(pos.y));
            if (!rankIds[rankKey]) rankIds[rankKey] = [];
            rankIds[rankKey].push(id);
        });

        Object.values(rankIds).forEach(ids => {
            if (ids.length < 2) return;

            const currentCenters = ids
                .map(id => positions[id].x + NODE_W / 2)
                .sort((a, b) => a - b);

            const rankSet = new Set(ids);
            const sortedIds = ids.slice().sort((idA, idB) => (positions[idA].x + NODE_W / 2) - (positions[idB].x + NODE_W / 2));
            const used = new Set();
            const blocks = [];

            const scoreBlock = (block) => {
                if (block.kind === 'pair') {
                    return block.center;
                }
                return positions[block.members[0]].x + NODE_W / 2;
            };

            sortedIds.forEach(id => {
                if (used.has(id)) return;

                const litterKey = litterKeyByChildId[id];
                if (litterKey) {
                    const litterInfo = litterInfoByKey[litterKey];
                    const members = (litterInfo?.childIds || [])
                        .filter(cid => rankSet.has(cid) && !used.has(cid))
                        .sort((a, b) => compareSiblingOrder(byId[a], byId[b]));

                    if (members.length > 1) {
                        members.forEach(cid => used.add(cid));
                        blocks.push({
                            kind: 'litter',
                            key: litterKey,
                            members,
                            center: litterInfo.center,
                        });
                        return;
                    }
                }

                const pairKey = Object.keys(pairInfoByKey).find(key => {
                    const info = pairInfoByKey[key];
                    return info.parentIds.includes(id)
                        && info.parentIds.every(pid => rankSet.has(pid))
                        && !used.has(info.parentIds[0])
                        && !used.has(info.parentIds[1]);
                });

                if (pairKey) {
                    const info = pairInfoByKey[pairKey];
                    const members = info.parentIds.slice().sort((a, b) => (positions[a].x + NODE_W / 2) - (positions[b].x + NODE_W / 2));
                    members.forEach(pid => used.add(pid));
                    blocks.push({
                        kind: 'pair',
                        key: pairKey,
                        members,
                        center: info.childMidpoint,
                    });
                    return;
                }

                used.add(id);
                blocks.push({
                    kind: 'single',
                    key: id,
                    members: [id],
                    center: positions[id].x + NODE_W / 2,
                });
            });

            blocks.sort((a, b) => {
                if (scoreBlock(a) !== scoreBlock(b)) return scoreBlock(a) - scoreBlock(b);
                return a.key.localeCompare(b.key);
            });

            const desired = [];
            blocks.forEach(block => {
                block.members.forEach(id => desired.push(id));
            });

            desired.forEach((id, idx) => {
                if (currentCenters[idx] === undefined) return;
                positions[id].x = currentCenters[idx] - NODE_W / 2;
            });
        });

        Object.entries(pairGroups).forEach(([pairKey, group]) => {
            const parents = group.parentIds
                .map(pid => ({
                    id: pid,
                    x: positions[pid].x + NODE_W / 2,
                    leftX: positions[pid].x,
                    rightX: positions[pid].x + NODE_W,
                    yMid: positions[pid].y + NODE_H / 2,
                    yBottom: positions[pid].y + NODE_H,
                }))
                .sort((a, b) => a.x - b.x);
            const children = group.childIds
                .filter(cid => positions[cid])
                .map(cid => ({
                    id: cid,
                    x: positions[cid].x + NODE_W / 2,
                    yTop: positions[cid].y,
                    birthDate: byId[cid]?.birthDate,
                }))
                .sort((a, b) => compareSiblingOrder(byId[a.id], byId[b.id]));

            if (!parents.length || !children.length) return;

            const laneOffset = lineLaneOffset(pairKey, 5);
            const childBandBaseY = Math.min(...children.map(c => c.yTop)) - 20;
            const litterSpreadY = 26;

            const litterGroups = [];
            const litterGroupByKey = new Map();
            children.forEach(child => {
                const birthKey = child.birthDate ? new Date(child.birthDate).toISOString().slice(0, 10) : 'unknown';
                const litterKey = `${pairKey}|${birthKey}`;
                if (!litterGroupByKey.has(litterKey)) {
                    const groupIndex = litterGroups.length;
                    const litterLaneY = childBandBaseY - (groupIndex * litterSpreadY) - lineLaneOffset(litterKey, 4);
                    const group = {
                        key: litterKey,
                        birthKey,
                        laneY: litterLaneY,
                        children: [],
                    };
                    litterGroupByKey.set(litterKey, group);
                    litterGroups.push(group);
                }
                litterGroupByKey.get(litterKey).children.push(child);
            });

            litterGroups.sort((a, b) => {
                if (a.birthKey === 'unknown' && b.birthKey === 'unknown') return a.key.localeCompare(b.key);
                if (a.birthKey === 'unknown') return 1;
                if (b.birthKey === 'unknown') return -1;
                return a.birthKey.localeCompare(b.birthKey);
            });

            litterGroups.forEach((group, groupIndex) => {
                group.laneY = childBandBaseY - (groupIndex * litterSpreadY) - lineLaneOffset(group.key, 4);
            });

            // Orthogonal connector style (default): parent-pair grouping with shared sibling bars.
            if (parents.length === 1) {
                const p = parents[0];
                litterGroups.forEach((group, groupIndex) => {
                    const minX = Math.min(...group.children.map(c => c.x));
                    const maxX = Math.max(...group.children.map(c => c.x));
                    const groupY = group.laneY;

                    if (group.children.length > 1) {
                        edgeSegments.push({
                            id: `seg-${pairKey}-single-offspring-network-${groupIndex}`,
                            d: `M ${p.x} ${p.yBottom} L ${p.x} ${groupY} L ${minX} ${groupY} L ${maxX} ${groupY}`,
                            relatedIds: [p.id, ...group.children.map(c => c.id)],
                        });
                    } else {
                        const onlyChild = group.children[0];
                        const elbowY = groupY;
                        edgeSegments.push({
                            id: `seg-${pairKey}-single-parent-trunk-${groupIndex}`,
                            d: `M ${p.x} ${p.yBottom} L ${p.x} ${elbowY} L ${onlyChild.x} ${elbowY}`,
                            relatedIds: [p.id, onlyChild.id],
                        });
                    }

                    group.children.forEach((c, idx) => {
                        edgeSegments.push({
                            id: `seg-${pairKey}-single-child-${groupIndex}-${idx}`,
                            d: `M ${c.x} ${groupY} L ${c.x} ${c.yTop}`,
                            relatedIds: [p.id, c.id],
                        });
                    });
                });
                return;
            }

            const leftParent = parents[0];
            const rightParent = parents[parents.length - 1];
            const partnerLineY = (leftParent.yMid + rightParent.yMid) / 2;
            const partnerLeftX = leftParent.rightX;
            const partnerRightX = rightParent.leftX;
            const trunkX = (partnerLeftX + partnerRightX) / 2;

            edgeSegments.push({
                id: `seg-${pairKey}-partner-network`,
                d: `M ${partnerLeftX} ${leftParent.yMid} L ${partnerLeftX} ${partnerLineY} L ${partnerRightX} ${partnerLineY} L ${partnerRightX} ${rightParent.yMid}`,
                relatedIds: [leftParent.id, rightParent.id, ...children.map(c => c.id)],
                pairParentIds: [leftParent.id, rightParent.id],
            });

            litterGroups.forEach((group, groupIndex) => {
                const minX = Math.min(...group.children.map(c => c.x));
                const maxX = Math.max(...group.children.map(c => c.x));
                const groupY = group.laneY;
                const groupTrunkX = trunkX;

                if (group.children.length > 1) {
                    edgeSegments.push({
                        id: `seg-${pairKey}-offspring-network-${groupIndex}`,
                        d: `M ${groupTrunkX} ${partnerLineY} L ${groupTrunkX} ${groupY} L ${minX} ${groupY} L ${maxX} ${groupY}`,
                        relatedIds: [leftParent.id, rightParent.id, ...group.children.map(c => c.id)],
                    });
                } else {
                    const onlyChild = group.children[0];
                    const elbowY = groupY;
                    edgeSegments.push({
                        id: `seg-${pairKey}-trunk-${groupIndex}`,
                        d: `M ${groupTrunkX} ${partnerLineY} L ${groupTrunkX} ${elbowY} L ${onlyChild.x} ${elbowY}`,
                        relatedIds: [leftParent.id, rightParent.id, onlyChild.id],
                    });
                }

                group.children.forEach((c, idx) => {
                    edgeSegments.push({
                        id: `seg-${pairKey}-child-drop-${groupIndex}-${idx}`,
                        d: `M ${c.x} ${groupY} L ${c.x} ${c.yTop}`,
                        relatedIds: [leftParent.id, rightParent.id, c.id],
                    });
                });
            });
        });

        const maxX = Math.max(...Object.values(positions).map(p => p.x + NODE_W), 1200) + 48;
        const maxY = Math.max(...Object.values(positions).map(p => p.y + NODE_H), 700) + 48;

        return {
            byId,
            positions,
            edgeSegments,
            focusId: focusAnimalId,
            width: maxX,
            height: maxY,
        };
    }, [
        lineageData,
        focusAnimalId,
    ]);

    // Effect to center the view on the focus animal when it changes
    useEffect(() => {
        const container = containerRef.current;
        const focusNodePos = graphData.positions && graphData.positions[focusAnimalId];

        if (container && focusNodePos) {
            const initialZoom = 85;
            const scale = initialZoom / 100;
            const nodeCenterX = focusNodePos.x + NODE_W / 2;
            const nodeCenterY = focusNodePos.y + NODE_H / 2;

            const targetPan = {
                x: (container.clientWidth / 2) - (nodeCenterX * scale),
                y: (container.clientHeight / 2) - (nodeCenterY * scale),
            };
            
            setPan(targetPan);
            setZoom(initialZoom);
        } else {
            setPan({ x: 24, y: 24 });
            setZoom(85);
        }
    }, [focusAnimalId, graphData.width, graphData.height]); // Re-center when the animal or graph dimensions change.

    useEffect(() => {
        panStateRef.current = pan;
        zoomStateRef.current = zoom;
        pendingViewRef.current = { pan, zoom };
    }, [pan, zoom]);

    useEffect(() => () => {
        if (viewFrameRef.current) cancelAnimationFrame(viewFrameRef.current);
    }, []);

    const handleWheel = e => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -8 : 8;
        const currentZoom = zoomStateRef.current;
        const currentPan = panStateRef.current;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + delta));
        
        // Keep the point under cursor centered during zoom
        const container = containerRef.current;
        if (container) {
            const rect = container.getBoundingClientRect();
            const cursorX = e.clientX - rect.left;
            const cursorY = e.clientY - rect.top;
            
            // World coords of cursor before zoom
            const worldX = (cursorX - currentPan.x) / (currentZoom / 100);
            const worldY = (cursorY - currentPan.y) / (currentZoom / 100);
            
            // New pan to keep cursor on same world point
            const newPan = {
                x: cursorX - worldX * (newZoom / 100),
                y: cursorY - worldY * (newZoom / 100),
            };
            
            scheduleViewUpdate(newPan, newZoom);
            return;
        }

        scheduleViewUpdate(currentPan, newZoom);
    };

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    useEffect(() => {
        const clamped = clampPanToViewport(panStateRef.current, zoomStateRef.current);
        if (Math.abs(clamped.x - panStateRef.current.x) > 0.5 || Math.abs(clamped.y - panStateRef.current.y) > 0.5) {
            setPan(clamped);
        }
    }, [graphData.width, graphData.height, zoom]);

    const beginDrag = e => {
        // Left-drag pans when starting from empty canvas space.
        if (e.button !== 0 && e.button !== 1) return;
        if (e.target.closest('[data-family-node="true"]')) return;
        dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, originX: panStateRef.current.x, originY: panStateRef.current.y };
    };

    const onDrag = e => {
        if (!dragRef.current.active) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        scheduleViewUpdate({ x: dragRef.current.originX + dx, y: dragRef.current.originY + dy }, zoomStateRef.current);
    };

    const endDrag = () => {
        dragRef.current.active = false;
    };

    const touchDistance = (t1, t2) => {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = e => {
        if (e.touches.length === 2) {
            const dist = touchDistance(e.touches[0], e.touches[1]);
            touchRef.current = { ...touchRef.current, mode: 'pinch', startDist: dist, startZoom: zoomStateRef.current };
            return;
        }
        if (e.touches.length !== 1) return;

        const t = e.touches[0];
        if (e.target.closest('[data-family-node="true"]')) {
            touchRef.current = { ...touchRef.current, mode: 'tap' };
            return;
        }

        touchRef.current = {
            ...touchRef.current,
            mode: 'pan',
            startX: t.clientX,
            startY: t.clientY,
            originX: panStateRef.current.x,
            originY: panStateRef.current.y,
        };
    };

    const onTouchMove = e => {
        if (touchRef.current.mode === 'pinch' && e.touches.length === 2) {
            e.preventDefault();
            const dist = touchDistance(e.touches[0], e.touches[1]);
            if (!touchRef.current.startDist) return;
            const scale = dist / touchRef.current.startDist;
            const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(touchRef.current.startZoom * scale)));
            scheduleViewUpdate(panStateRef.current, nextZoom);
            return;
        }

        if (touchRef.current.mode === 'pan' && e.touches.length === 1) {
            e.preventDefault();
            const t = e.touches[0];
            const dx = t.clientX - touchRef.current.startX;
            const dy = t.clientY - touchRef.current.startY;
            scheduleViewUpdate({ x: touchRef.current.originX + dx, y: touchRef.current.originY + dy }, zoomStateRef.current);
        }
    };

    const onTouchEnd = e => {
        if (e.touches.length >= 2) {
            const dist = touchDistance(e.touches[0], e.touches[1]);
            touchRef.current = { ...touchRef.current, mode: 'pinch', startDist: dist, startZoom: zoomStateRef.current };
            return;
        }
        if (e.touches.length === 1 && touchRef.current.mode === 'pinch') {
            const t = e.touches[0];
            touchRef.current = {
                ...touchRef.current,
                mode: 'pan',
                startX: t.clientX,
                startY: t.clientY,
                originX: panStateRef.current.x,
                originY: panStateRef.current.y,
            };
            return;
        }
        touchRef.current = { ...touchRef.current, mode: null, startDist: 0 };
    };

    return (
        <div className="w-full h-full relative">
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white/70 backdrop-blur-sm p-1 rounded-lg border border-gray-200">
                <button onClick={() => {
                    const nextZoom = Math.max(MIN_ZOOM, zoomStateRef.current - 10);
                    scheduleViewUpdate(panStateRef.current, nextZoom);
                }} className="p-2 hover:bg-gray-200 rounded transition" title="Zoom out (Ctrl+Scroll)">
                    <ZoomOut size={16} className="text-gray-600" />
                </button>
                <span className="text-xs font-medium text-gray-600 w-12 text-center">{zoom}%</span>
                <button onClick={() => {
                    const nextZoom = Math.min(MAX_ZOOM, zoomStateRef.current + 10);
                    scheduleViewUpdate(panStateRef.current, nextZoom);
                }} className="p-2 hover:bg-gray-200 rounded transition" title="Zoom in (Ctrl+Scroll)">
                    <ZoomIn size={16} className="text-gray-600" />
                </button>
                <button
                    onClick={() => {
                        setZoom(85);
                        setPan({ x: 24, y: 24 });
                    }}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Reset view"
                >
                    <Home size={16} className="text-gray-600" />
                </button>
            </div>
                <div
                    ref={containerRef}
                    onMouseDown={beginDrag}
                    onMouseMove={onDrag}
                    onMouseUp={endDrag}
                    onMouseLeave={endDrag}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onTouchCancel={onTouchEnd}
                    className="relative w-full border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm h-full"
                    style={{ cursor: dragRef.current.active ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}
                >
                    <div
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
                            transformOrigin: '0 0',
                            transition: 'none',
                            width: graphData.width,
                            height: graphData.height,
                            position: 'relative',
                        }}
                    >
                        <svg style={{ position: 'absolute', inset: 0, width: graphData.width, height: graphData.height, pointerEvents: 'none', shapeRendering: 'geometricPrecision' }}>
                            {graphData.edgeSegments.map(seg => {
                                const isPairLine = seg.id.includes('partner-network');
                                const isDescendantLine = /offspring|child|trunk|anchor|single-parent/.test(seg.id);
                                const baseStroke = isPairLine ? '#6f949d' : isDescendantLine ? '#be185d' : '#64748b';
                                const activeStroke = isPairLine ? '#7fd4e0' : isDescendantLine ? '#9d174d' : '#334155';
                                const active = false; // Highlighting removed
                                const opacity = 0.92;
                                return (
                                    <path
                                        key={seg.id}
                                        d={quantizePathData(seg.d)}
                                        fill="none"
                                        stroke={active ? activeStroke : baseStroke}
                                        strokeWidth={active ? 3.4 : 2.4}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        opacity={opacity}
                                    />
                                );
                            })}
                        </svg>

                        {Object.entries(graphData.positions).map(([id, pos]) => {
                            const animal = graphData.byId[id];
                            if (!animal) return null;
                            const active = graphData.focusId === id;
                            const isMale = animal.gender === 'Male';
                            const isFemale = animal.gender === 'Female';
                            const borderColor = isMale ? '#3b82f6' : isFemale ? '#ec4899' : '#94a3b8';
                            const bgColor = isMale ? '#dbeafe' : isFemale ? '#fce7f3' : '#eef2f7';
                            const displayName = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ') || 'Unnamed';
                            const imageSrc = animal.imageUrl || animal.photoUrl || null;

                            return (
                                <button
                                    key={id}
                                    type="button"
                                    data-family-node="true"
                                    onClick={() => {
                                        if (onNodeClick) {
                                            onNodeClick({ data: { animal } });
                                        }
                                    }}
                                    style={{
                                        position: 'absolute',
                                        left: pos.x,
                                        top: pos.y,
                                        width: NODE_W,
                                        height: NODE_H,
                                        borderColor,
                                        backgroundColor: bgColor,
                                        touchAction: 'manipulation',
                                    }}
                                    className={`text-left rounded-xl border-2 transition-all shadow-sm overflow-hidden ${active ? 'ring-2 ring-accent' : 'hover:border-accent hover:shadow-md'}`}
                                    title="Click to open details."
                                >
                                    <div className="w-full h-[68px] bg-white/60 flex items-center justify-center">
                                        {imageSrc ? (
                                            <img
                                                src={imageSrc}
                                                alt={displayName}
                                                className="w-full h-full object-cover"
                                                draggable={false}
                                            />
                                        ) : (
                                            <Cat size={24} className="text-slate-400" />
                                        )}
                                    </div>
                                    <div className="w-full h-[22px] bg-white border-t border-gray-200 px-1.5 flex items-center justify-center">
                                        <p className="text-[11px] font-semibold text-gray-800 truncate max-w-full">{displayName}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {lineageLoading && (
                        <div className="absolute inset-0 z-20 bg-white/75 backdrop-blur-[1px] flex items-center justify-center pointer-events-auto">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm text-gray-600 text-sm font-medium">
                                <Loader2 size={16} className="animate-spin" />
                                Loading lineage...
                            </div>
                        </div>
                    )}
                </div>
        </div>
    );
};

export default FamilyTreeView;
