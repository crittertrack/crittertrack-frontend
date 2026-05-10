import React, { useState, useMemo, useRef, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ZoomIn, ZoomOut, Home, Cat, ChevronLeft, ChevronRight } from 'lucide-react';
import dagre from 'dagre';
import { formatDate } from '../../utils/dateFormatter';

const NODE_W = 96;
const NODE_H = 92;
const API_BASE_URL = '/api';
const MIN_ZOOM = 20;
const MAX_ZOOM = 180;
const LINEAGE_COLORS = [
    '#2563eb', '#dc2626', '#059669', '#7c3aed', '#ea580c', '#0f766e', '#c026d3', '#b45309',
    '#0891b2', '#be123c', '#4f46e5', '#15803d', '#a16207', '#9333ea', '#0ea5e9', '#e11d48'
];

const hashKey = (key = '') => {
    let h = 0;
    for (let i = 0; i < key.length; i += 1) {
        h = ((h << 5) - h) + key.charCodeAt(i);
        h |= 0;
    }
    return Math.abs(h);
};

const lineageColorFromKey = (key = '') => LINEAGE_COLORS[hashKey(key) % LINEAGE_COLORS.length];
const isHexColor = (value = '') => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value).trim());

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

const FamilyTreeView = ({
    animals = [],
    loading = false,
    onViewAnimal,
    authToken,
    breedingLineDefs = [],
    animalBreedingLines = {},
    prefetchedAncestorsBySpecies = {},
    prefetchLoadingBySpecies = {},
    onAncestorsResolved,
}) => {
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [zoom, setZoom] = useState(85);
    const [pan, setPan] = useState({ x: 24, y: 24 });
    const [showNoPedigreePanel, setShowNoPedigreePanel] = useState(true);
    const [hoveredAnimal, setHoveredAnimal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [focusMode, setFocusMode] = useState(true);
    const [focusAnimalId, setFocusAnimalId] = useState(null);
    const [ancestorDepthLimit, setAncestorDepthLimit] = useState(3);
    const [descendantDepthLimit, setDescendantDepthLimit] = useState(2);
    const [highlightMode, setHighlightMode] = useState('none');
    const connectorStyle = 'orthogonal';
    const [externalAncestorsById, setExternalAncestorsById] = useState({});
    const [ancestorLoading, setAncestorLoading] = useState(false);
    const containerRef = useRef(null);
    const dragRef = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });
    const touchRef = useRef({ mode: null, startX: 0, startY: 0, originX: 0, originY: 0, startDist: 0, startZoom: 85 });
    const wasAncestorLoadingRef = useRef(false);
    const panStateRef = useRef({ x: 24, y: 24 });
    const zoomStateRef = useRef(85);
    const viewFrameRef = useRef(null);
    const pendingViewRef = useRef({ pan: { x: 24, y: 24 }, zoom: 85 });
    const pendingCenterAnimalRef = useRef(null);
    const [centerRequestNonce, setCenterRequestNonce] = useState(0);

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

    const speciesList = useMemo(() => [...new Set(animals.map(a => a.species).filter(Boolean))].sort(), [animals]);

    const animalLineColorById = useMemo(() => {
        const colorByLineId = {};
        const linePriorityById = {};
        (breedingLineDefs || []).forEach(def => {
            if (def?.id === undefined || def?.id === null) return;
            const color = String(def?.color || '').trim();
            linePriorityById[String(def.id)] = Number(def.id);
            if (!isHexColor(color)) return;
            colorByLineId[String(def.id)] = color;
        });

        const out = {};
        Object.entries(animalBreedingLines || {}).forEach(([animalId, lineIds]) => {
            if (!animalId || !Array.isArray(lineIds) || lineIds.length === 0) return;
            const matched = lineIds
                .map(lineId => String(lineId))
                .filter(lineId => Boolean(colorByLineId[lineId]))
                .sort((a, b) => {
                    const pa = Number.isFinite(linePriorityById[a]) ? linePriorityById[a] : Number.MAX_SAFE_INTEGER;
                    const pb = Number.isFinite(linePriorityById[b]) ? linePriorityById[b] : Number.MAX_SAFE_INTEGER;
                    if (pa !== pb) return pa - pb;
                    return Number(a) - Number(b);
                })
                .map(lineId => colorByLineId[lineId])[0];
            if (matched) out[animalId] = matched;
        });

        return out;
    }, [breedingLineDefs, animalBreedingLines]);

    useEffect(() => {
        if (!speciesList.length) {
            setSelectedSpecies(null);
            return;
        }
        if (!selectedSpecies || !speciesList.includes(selectedSpecies)) {
            setSelectedSpecies(speciesList[0]);
        }
    }, [speciesList, selectedSpecies]);

    const speciesAnimals = useMemo(() => {
        if (!selectedSpecies) return [];
        return animals.filter(a => a.species === selectedSpecies && a.id_public);
    }, [animals, selectedSpecies]);

    useEffect(() => {
        if (!selectedSpecies || speciesAnimals.length === 0) {
            setExternalAncestorsById({});
            return;
        }

        const prefetchedForSpecies = prefetchedAncestorsBySpecies[selectedSpecies];
        if (prefetchedForSpecies) {
            setExternalAncestorsById(prefetchedForSpecies);
            setAncestorLoading(false);
            return;
        }

        if (prefetchLoadingBySpecies[selectedSpecies]) {
            setAncestorLoading(true);
        }

        let cancelled = false;

        const fetchAncestorForest = async () => {
            setAncestorLoading(true);
            const canonicalId = (id) => String(id || '').trim().toLowerCase();
            const accountIdKeys = new Set(
                (animals || [])
                    .map(a => canonicalId(a?.id_public))
                    .filter(Boolean)
            );
            const existing = new Map(speciesAnimals.map(a => [a.id_public, a]));
            const fetched = {};
            const visited = new Set(speciesAnimals.map(a => canonicalId(a.id_public)).filter(Boolean));
            const queue = [];

            const enqueueParentIfMissing = (id) => {
                const key = canonicalId(id);
                if (!key || visited.has(key)) return;
                visited.add(key);
                queue.push(id);
            };

            speciesAnimals.forEach(a => {
                const sire = a.fatherId_public || a.sireId_public;
                const dam = a.motherId_public || a.damId_public;
                if (sire) enqueueParentIfMissing(sire);
                if (dam) enqueueParentIfMissing(dam);
            });

            console.log(`[FamilyTree] Queued ${queue.length} ancestors to fetch for ${selectedSpecies}`);

            const fetchOne = async (id) => {
                if (!id) return null;
                if (authToken) {
                    try {
                        const r = await axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(id)}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        if (r.data) {
                            console.log(`[FamilyTree] Fetched (authenticated): ${id}`, r.data);
                            return r.data;
                        }
                    } catch (e) {
                        console.log(`[FamilyTree] Auth fetch failed for ${id}:`, e.message);
                    }
                }
                try {
                    const r = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(id)}`);
                    if (r.data?.[0]) {
                        console.log(`[FamilyTree] Fetched (public): ${id}`, r.data[0]);
                        return r.data[0];
                    }
                } catch (e) {
                    console.log(`[FamilyTree] Public fetch failed for ${id}:`, e.message);
                }
                return null;
            };

            let guard = 0;
            while (queue.length > 0 && guard < 1200) {
                guard += 1;
                const id = queue.shift();
                const node = await fetchOne(id);
                if (cancelled) return;
                if (!node) continue;

                const nid = node.id_public || id;
                const nidKey = canonicalId(nid);
                const isAlreadyOnAccount = accountIdKeys.has(nidKey);
                if (!existing.has(nid) && !isAlreadyOnAccount) {
                    const normalized = { ...node, id_public: nid, isPublicAncestor: true };
                    existing.set(nid, normalized);
                    fetched[nid] = normalized;
                }

                enqueueParentIfMissing(node.fatherId_public || node.sireId_public);
                enqueueParentIfMissing(node.motherId_public || node.damId_public);
            }

            console.log(`[FamilyTree] Fetch complete. Got ${Object.keys(fetched).length} external ancestors`);

            if (!cancelled) {
                setExternalAncestorsById(fetched);
                setAncestorLoading(false);
                if (onAncestorsResolved) onAncestorsResolved(selectedSpecies, fetched);
            }
        };

        fetchAncestorForest().catch((err) => {
            console.error('[FamilyTree] Ancestor fetch error:', err);
            if (!cancelled) {
                setExternalAncestorsById({});
                setAncestorLoading(false);
            }
        });

        return () => { cancelled = true; };
    }, [
        selectedSpecies,
        speciesAnimals,
        authToken,
        prefetchedAncestorsBySpecies,
        prefetchLoadingBySpecies,
        onAncestorsResolved,
    ]);

    const graphData = useMemo(() => {
        const allById = {};
        const childrenByParentAll = {};
        const parentLinksByChildAll = {};

        const combinedSpecies = [
            ...speciesAnimals,
            ...Object.values(externalAncestorsById),
        ];

        combinedSpecies.forEach(a => {
            allById[a.id_public] = a;
        });

        Object.values(allById).forEach(a => {
            const parents = [a.fatherId_public || a.sireId_public, a.motherId_public || a.damId_public].filter(Boolean);
            parentLinksByChildAll[a.id_public] = parents.filter(pid => allById[pid]);
            parentLinksByChildAll[a.id_public].forEach(pid => {
                if (!childrenByParentAll[pid]) childrenByParentAll[pid] = [];
                childrenByParentAll[pid].push(a.id_public);
            });
        });

        // Account animals with no pedigree links live only in the left list, not in the graph.
        const noPedigreeAnimals = speciesAnimals
            .filter(a => {
                const hasParents = Boolean(a.fatherId_public || a.sireId_public || a.motherId_public || a.damId_public);
                const hasOffspring = (childrenByParentAll[a.id_public] || []).length > 0;
                return !hasParents && !hasOffspring;
            })
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        const noPedigreeSet = new Set(noPedigreeAnimals.map(a => a.id_public));
        const accountIdSet = new Set(speciesAnimals.map(a => a.id_public));

        const query = searchQuery.trim().toLowerCase();
        let resolvedFocusId = (focusAnimalId && allById[focusAnimalId]) ? focusAnimalId : null;
        if (query) {
            const matched = combinedSpecies.find(a => {
                const name = [a?.prefix, a?.name, a?.suffix].filter(Boolean).join(' ').toLowerCase();
                const idPublic = String(a?.id_public || '').toLowerCase();
                return name.includes(query) || idPublic.includes(query);
            });
            if (matched?.id_public) resolvedFocusId = matched.id_public;
        }
        if (!resolvedFocusId) resolvedFocusId = speciesAnimals[0]?.id_public || null;

        const collectWithDepth = (startId, getNeighbors, maxDepth) => {
            const out = new Set();
            if (!startId || !Number.isFinite(maxDepth) || maxDepth < 0) return out;
            const queue = [{ id: startId, depth: 0 }];
            const seen = new Set([startId]);

            while (queue.length) {
                const current = queue.shift();
                if (current.depth >= maxDepth) continue;
                (getNeighbors(current.id) || []).forEach(nextId => {
                    if (!nextId || seen.has(nextId) || !allById[nextId]) return;
                    seen.add(nextId);
                    out.add(nextId);
                    queue.push({ id: nextId, depth: current.depth + 1 });
                });
            }
            return out;
        };

        const focusVisibleIds = new Set();
        if (focusMode && resolvedFocusId) {
            focusVisibleIds.add(resolvedFocusId);
            collectWithDepth(resolvedFocusId, id => parentLinksByChildAll[id], ancestorDepthLimit).forEach(id => focusVisibleIds.add(id));
            collectWithDepth(resolvedFocusId, id => childrenByParentAll[id], descendantDepthLimit).forEach(id => focusVisibleIds.add(id));

            // Keep co-parents visible for descendants in the focus slice.
            Array.from(focusVisibleIds).forEach(id => {
                (parentLinksByChildAll[id] || []).forEach(pid => {
                    if (allById[pid]) focusVisibleIds.add(pid);
                });
            });
        }

        const byId = {};
        Object.values(allById).forEach(a => {
            const isIsolatedAccountAnimal = accountIdSet.has(a.id_public) && noPedigreeSet.has(a.id_public);
            const outsideFocus = focusMode && resolvedFocusId && !focusVisibleIds.has(a.id_public);
            if (!isIsolatedAccountAnimal && !outsideFocus) byId[a.id_public] = a;
        });

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

            const pairColor =
                parents.map(p => animalLineColorById[p.id]).find(Boolean)
                || children.map(c => animalLineColorById[c.id]).find(Boolean)
                || lineageColorFromKey(pairKey);

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

            if (connectorStyle === 'diagonal') {
                if (parents.length === 1) {
                    const p = parents[0];
                    litterGroups.forEach((group, groupIndex) => {
                        const childXs = group.children.map(c => c.x);
                        const minX = Math.min(...childXs);
                        const maxX = Math.max(...childXs);
                        const fanLaneY = group.laneY;

                        edgeSegments.push({
                            id: `seg-${pairKey}-single-diagonal-anchor-${groupIndex}`,
                            d: `M ${p.x} ${p.yBottom} L ${p.x} ${fanLaneY}`,
                            relatedIds: [p.id, ...group.children.map(c => c.id)],
                            color: pairColor,
                        });

                        edgeSegments.push({
                            id: `seg-${pairKey}-single-diagonal-band-${groupIndex}`,
                            d: `M ${p.x} ${fanLaneY} L ${minX} ${fanLaneY} L ${maxX} ${fanLaneY}`,
                            relatedIds: [p.id, ...group.children.map(c => c.id)],
                            color: pairColor,
                        });

                        group.children.forEach((c, idx) => {
                            edgeSegments.push({
                                id: `seg-${pairKey}-single-diagonal-child-${groupIndex}-${idx}`,
                                d: `M ${c.x} ${fanLaneY} L ${c.x} ${c.yTop}`,
                                relatedIds: [p.id, c.id],
                                color: pairColor,
                            });
                        });
                    });
                    return;
                }

                const leftParent = parents[0];
                const rightParent = parents[parents.length - 1];
                const partnerLineY = (leftParent.yMid + rightParent.yMid) / 2 + laneOffset;
                const partnerLeftX = leftParent.rightX;
                const partnerRightX = rightParent.leftX;
                const trunkX = (partnerLeftX + partnerRightX) / 2;

                edgeSegments.push({
                    id: `seg-${pairKey}-diagonal-partner-network`,
                    d: `M ${partnerLeftX} ${leftParent.yMid} L ${partnerLeftX} ${partnerLineY} L ${partnerRightX} ${partnerLineY} L ${partnerRightX} ${rightParent.yMid}`,
                    relatedIds: [leftParent.id, rightParent.id, ...children.map(c => c.id)],
                    color: pairColor,
                });

                litterGroups.forEach((group, groupIndex) => {
                    const childXs = group.children.map(c => c.x);
                    const minX = Math.min(...childXs);
                    const maxX = Math.max(...childXs);
                    const groupFanY = group.laneY;

                    edgeSegments.push({
                        id: `seg-${pairKey}-diagonal-anchor-${groupIndex}`,
                        d: `M ${trunkX} ${partnerLineY} L ${trunkX} ${groupFanY}`,
                        relatedIds: [leftParent.id, rightParent.id, ...group.children.map(c => c.id)],
                        color: pairColor,
                    });

                    edgeSegments.push({
                        id: `seg-${pairKey}-diagonal-band-${groupIndex}`,
                        d: `M ${trunkX} ${groupFanY} L ${minX} ${groupFanY} L ${maxX} ${groupFanY}`,
                        relatedIds: [leftParent.id, rightParent.id, ...group.children.map(c => c.id)],
                        color: pairColor,
                    });

                    group.children.forEach((c, idx) => {
                        edgeSegments.push({
                            id: `seg-${pairKey}-diagonal-child-${groupIndex}-${idx}`,
                            d: `M ${trunkX} ${groupFanY} L ${c.x} ${c.yTop}`,
                            relatedIds: [leftParent.id, rightParent.id, c.id],
                            color: pairColor,
                        });
                    });
                });
                return;
            }

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
                            color: pairColor,
                        });
                    } else {
                        const onlyChild = group.children[0];
                        const elbowY = groupY;
                        edgeSegments.push({
                            id: `seg-${pairKey}-single-parent-trunk-${groupIndex}`,
                            d: `M ${p.x} ${p.yBottom} L ${p.x} ${elbowY} L ${onlyChild.x} ${elbowY}`,
                            relatedIds: [p.id, onlyChild.id],
                            color: pairColor,
                        });
                    }

                    group.children.forEach((c, idx) => {
                        edgeSegments.push({
                            id: `seg-${pairKey}-single-child-${groupIndex}-${idx}`,
                            d: `M ${c.x} ${groupY} L ${c.x} ${c.yTop}`,
                            relatedIds: [p.id, c.id],
                            color: pairColor,
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
                color: pairColor,
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
                        color: pairColor,
                    });
                } else {
                    const onlyChild = group.children[0];
                    const elbowY = groupY;
                    edgeSegments.push({
                        id: `seg-${pairKey}-trunk-${groupIndex}`,
                        d: `M ${groupTrunkX} ${partnerLineY} L ${groupTrunkX} ${elbowY} L ${onlyChild.x} ${elbowY}`,
                        relatedIds: [leftParent.id, rightParent.id, onlyChild.id],
                        color: pairColor,
                    });
                }

                group.children.forEach((c, idx) => {
                    edgeSegments.push({
                        id: `seg-${pairKey}-child-drop-${groupIndex}-${idx}`,
                        d: `M ${c.x} ${groupY} L ${c.x} ${c.yTop}`,
                        relatedIds: [leftParent.id, rightParent.id, c.id],
                        color: pairColor,
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
            childrenByParent,
            parentLinksByChild,
            focusId: resolvedFocusId,
            width: maxX,
            height: maxY,
            noPedigreeAnimals,
        };
    }, [
        speciesAnimals,
        externalAncestorsById,
        connectorStyle,
        searchQuery,
        focusMode,
        focusAnimalId,
        ancestorDepthLimit,
        descendantDepthLimit,
    ]);

    const noPedigreeAnimals = graphData.noPedigreeAnimals || [];

    const searchMatchedIds = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return new Set();

        const out = new Set();
        Object.values(graphData.byId || {}).forEach(animal => {
            const displayName = [animal?.prefix, animal?.name, animal?.suffix].filter(Boolean).join(' ').toLowerCase();
            const idPublic = String(animal?.id_public || '').toLowerCase();
            if (displayName.includes(query) || idPublic.includes(query)) {
                out.add(animal.id_public);
            }
        });
        return out;
    }, [graphData.byId, searchQuery]);

    const firstSearchMatch = useMemo(() => {
        if (!searchMatchedIds.size) return null;
        if (graphData.focusId && searchMatchedIds.has(graphData.focusId)) return graphData.focusId;
        return Object.keys(graphData.positions || {}).find(id => searchMatchedIds.has(id)) || null;
    }, [graphData.focusId, graphData.positions, searchMatchedIds]);

    useEffect(() => {
        if (!searchQuery.trim() || !firstSearchMatch) return;

        setFocusMode(true);
        setFocusAnimalId(prev => (prev === firstSearchMatch ? prev : firstSearchMatch));
        pendingCenterAnimalRef.current = firstSearchMatch;
        setCenterRequestNonce(n => n + 1);
    }, [firstSearchMatch, searchQuery]);

    useEffect(() => {
        const targetId = pendingCenterAnimalRef.current;
        if (!targetId) return;
        if (graphData.focusId !== targetId) return;

        const pos = graphData.positions[targetId];
        if (!pos) return;

        const container = containerRef.current;
        if (!container) return;

        const scale = zoomStateRef.current / 100;
        const nodeCenterX = pos.x + NODE_W / 2;
        const nodeCenterY = pos.y + NODE_H / 2;
        const targetPan = {
            x: (container.clientWidth / 2) - (nodeCenterX * scale),
            y: (container.clientHeight / 2) - (nodeCenterY * scale),
        };

        scheduleViewUpdate(targetPan, zoomStateRef.current);
        pendingCenterAnimalRef.current = null;
    }, [centerRequestNonce, focusMode, graphData.focusId, graphData.positions]);

    const getAncestors = (id, visited = new Set()) => {
        if (visited.has(id)) return new Set();
        visited.add(id);
        const out = new Set();
        (graphData.parentLinksByChild[id] || []).forEach(pid => {
            if (!graphData.byId[pid]) return;
            out.add(pid);
            getAncestors(pid, visited).forEach(x => out.add(x));
        });
        return out;
    };

    const getDescendants = (id, visited = new Set()) => {
        if (visited.has(id)) return new Set();
        visited.add(id);
        const out = new Set();
        (graphData.childrenByParent[id] || []).forEach(cid => {
            if (!graphData.byId[cid]) return;
            out.add(cid);
            getDescendants(cid, visited).forEach(x => out.add(x));
        });
        return out;
    };

    const highlightAnchorId = hoveredAnimal || (focusMode ? graphData.focusId : null);

    const highlightedSet = useMemo(() => {
        if (!highlightAnchorId || highlightMode === 'none') return new Set();
        const out = new Set([highlightAnchorId]);
        const rel = highlightMode === 'descendants'
            ? getDescendants(highlightAnchorId)
            : getAncestors(highlightAnchorId);
        rel.forEach(id => out.add(id));
        return out;
    }, [highlightAnchorId, highlightMode, graphData]);

    useEffect(() => {
        panStateRef.current = pan;
        zoomStateRef.current = zoom;
        pendingViewRef.current = { pan, zoom };
    }, [pan, zoom]);

    useEffect(() => () => {
        if (viewFrameRef.current) cancelAnimationFrame(viewFrameRef.current);
    }, []);

    useEffect(() => {
        const justFinishedLoading = wasAncestorLoadingRef.current && !ancestorLoading;
        wasAncestorLoadingRef.current = ancestorLoading;
        if (!justFinishedLoading) return;

        const container = containerRef.current;
        if (!container) return;

        const scale = zoom / 100;
        const contentWidth = graphData.width * scale;
        const contentHeight = graphData.height * scale;

        const nextX = (container.clientWidth - contentWidth) / 2;
        const nextY = (container.clientHeight - contentHeight) / 2;

        setPan({
            x: Number.isFinite(nextX) ? nextX : 24,
            y: Number.isFinite(nextY) ? nextY : 24,
        });
    }, [ancestorLoading, graphData.width, graphData.height, zoom]);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                <Loader2 size={20} className="animate-spin" />
                <span>Loading family trees...</span>
            </div>
        );
    }

    if (!speciesList.length) {
        return <div className="text-center py-12 text-gray-400">No animals to display</div>;
    }

    return (
        <div className="w-full space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <select
                        value={selectedSpecies || ''}
                        onChange={e => {
                            setSelectedSpecies(e.target.value);
                            setHoveredAnimal(null);
                            setSearchQuery('');
                            setFocusAnimalId(null);
                            setPan({ x: 24, y: 24 });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent focus:border-transparent"
                    >
                        {speciesList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <div className="flex items-center gap-2 min-w-[280px] flex-1 max-w-[420px]">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => {
                                    setSearchQuery(e.target.value);
                                    setFocusAnimalId(null);
                                }}
                                placeholder="Focus by name or CTCID"
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent"
                            />
                            {searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                                    title="Clear search"
                                >
                                    Clear
                                </button>
                            ) : null}
                        </div>
                        {searchQuery ? (
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                {searchMatchedIds.size} match{searchMatchedIds.size === 1 ? '' : 'es'}
                            </span>
                        ) : null}
                    </div>

                    <span className="text-sm text-gray-600 font-medium">
                        {speciesAnimals.length} account animal{speciesAnimals.length !== 1 ? 's' : ''}
                        {Object.keys(externalAncestorsById).length > 0 ? ` + ${Object.keys(externalAncestorsById).length} public ancestor${Object.keys(externalAncestorsById).length !== 1 ? 's' : ''}` : ''}
                    </span>

                    {ancestorLoading && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Loader2 size={12} className="animate-spin" />
                            Loading linked ancestors...
                        </span>
                    )}

                    {focusMode && graphData.focusId && graphData.byId[graphData.focusId] && (
                        <span className="text-xs text-gray-500">
                            Focus: {[graphData.byId[graphData.focusId].prefix, graphData.byId[graphData.focusId].name, graphData.byId[graphData.focusId].suffix].filter(Boolean).join(' ') || graphData.focusId}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">View:</label>
                        <button
                            onClick={() => setFocusMode(true)}
                            className={`px-2 py-1 text-xs rounded border ${focusMode ? 'bg-accent text-white border-accent' : 'bg-white text-gray-600 border-gray-300'}`}
                            title="Show focused generations"
                        >
                            Focused
                        </button>
                        <button
                            onClick={() => setFocusMode(false)}
                            className={`px-2 py-1 text-xs rounded border ${!focusMode ? 'bg-accent text-white border-accent' : 'bg-white text-gray-600 border-gray-300'}`}
                            title="Show complete graph"
                        >
                            Full Graph
                        </button>
                        {focusMode && (
                            <>
                                <span className="text-xs text-gray-500 ml-1">Anc</span>
                                <button
                                    onClick={() => setAncestorDepthLimit(v => Math.max(1, v - 1))}
                                    className="px-2 py-1 text-xs rounded border bg-white text-gray-600 border-gray-300"
                                    title="Decrease ancestor depth"
                                >
                                    -
                                </button>
                                <span className="text-xs text-gray-600 w-4 text-center">{ancestorDepthLimit}</span>
                                <button
                                    onClick={() => setAncestorDepthLimit(v => Math.min(8, v + 1))}
                                    className="px-2 py-1 text-xs rounded border bg-white text-gray-600 border-gray-300"
                                    title="Increase ancestor depth"
                                >
                                    +
                                </button>
                                <span className="text-xs text-gray-500 ml-1">Desc</span>
                                <button
                                    onClick={() => setDescendantDepthLimit(v => Math.max(1, v - 1))}
                                    className="px-2 py-1 text-xs rounded border bg-white text-gray-600 border-gray-300"
                                    title="Decrease descendant depth"
                                >
                                    -
                                </button>
                                <span className="text-xs text-gray-600 w-4 text-center">{descendantDepthLimit}</span>
                                <button
                                    onClick={() => setDescendantDepthLimit(v => Math.min(8, v + 1))}
                                    className="px-2 py-1 text-xs rounded border bg-white text-gray-600 border-gray-300"
                                    title="Increase descendant depth"
                                >
                                    +
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">Lines:</label>
                        <span
                            className="px-2 py-1 text-xs rounded border bg-accent text-white border-accent"
                            title="Orthogonal connector lines"
                        >
                            Right Angle
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">Highlight:</label>
                        <button
                            onClick={() => setHighlightMode('ancestors')}
                            className={`px-2 py-1 text-xs rounded border ${highlightMode === 'ancestors' ? 'bg-accent text-white border-accent' : 'bg-white text-gray-600 border-gray-300'}`}
                        >
                            Ancestors
                        </button>
                        <button
                            onClick={() => setHighlightMode('descendants')}
                            className={`px-2 py-1 text-xs rounded border ${highlightMode === 'descendants' ? 'bg-accent text-white border-accent' : 'bg-white text-gray-600 border-gray-300'}`}
                        >
                            Descendants
                        </button>
                        <button
                            onClick={() => setHighlightMode('none')}
                            className={`px-2 py-1 text-xs rounded border ${highlightMode === 'none' ? 'bg-accent text-white border-accent' : 'bg-white text-gray-600 border-gray-300'}`}
                        >
                            None
                        </button>
                    </div>

                    <div className="flex items-center gap-1 ml-auto">
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
                                setHoveredAnimal(null);
                                setSearchQuery('');
                                setFocusAnimalId(null);
                            }}
                            className="p-2 hover:bg-gray-200 rounded transition"
                            title="Reset view"
                        >
                            <Home size={16} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-xs text-gray-500 px-1">
                Click a node to focus and center it. Double-click for details. Focus search recenters to the first match without dimming the graph.
            </div>

            <div className={`grid ${showNoPedigreePanel ? 'grid-cols-[280px_minmax(0,1fr)]' : 'grid-cols-[44px_minmax(0,1fr)]'} gap-4`}>
                <div className="border border-gray-300 rounded-lg bg-white shadow-sm h-[680px] overflow-hidden">
                    <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-200 px-2.5 py-2 flex items-center justify-between gap-2">
                        {showNoPedigreePanel ? (
                            <>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-700 truncate">No Pedigree Links</p>
                                    <p className="text-xs text-gray-500 truncate">{noPedigreeAnimals.length} animals with no parents and no offspring in this species</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowNoPedigreePanel(false)}
                                    className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 text-gray-600"
                                    title="Collapse panel"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowNoPedigreePanel(true)}
                                className="w-full h-full flex items-center justify-center p-1.5 rounded border border-gray-200 hover:bg-gray-50 text-gray-600"
                                title="Expand no-pedigree panel"
                            >
                                <ChevronRight size={14} />
                            </button>
                        )}
                    </div>

                    {showNoPedigreePanel && (
                        <div className="p-2 space-y-1.5 h-[calc(680px-52px)] overflow-auto">
                            {noPedigreeAnimals.length === 0 ? (
                                <p className="text-xs text-gray-400 p-2">All animals are connected in this species graph.</p>
                            ) : noPedigreeAnimals.map(a => (
                                <button
                                    key={a.id_public}
                                    type="button"
                                    onClick={() => onViewAnimal && onViewAnimal(a)}
                                    className="w-full text-left px-2 py-2 rounded border border-gray-200 hover:border-accent hover:bg-accent/5 transition"
                                    title="Open animal details"
                                >
                                    <p className="text-xs font-semibold text-gray-800 truncate">{[a.prefix, a.name, a.suffix].filter(Boolean).join(' ') || 'Unnamed'}</p>
                                    <p className="text-[11px] text-gray-500 truncate">{a.status || 'Unknown'}{a.birthDate ? ` • ${formatDate(a.birthDate)}` : ''}</p>
                                    <p className="text-[10px] text-gray-400 font-mono truncate">{a.id_public}</p>
                                </button>
                            ))}
                        </div>
                    )}
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
                    className="relative w-full border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm"
                    style={{ height: '680px', cursor: dragRef.current.active ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}
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
                                const hasHighlightSelection = highlightMode !== 'none' && highlightedSet.size > 0;
                                const isPairLine = seg.id.includes('partner-network');
                                const isDescendantLine = /offspring|child|trunk|anchor|single-diagonal|single-parent/.test(seg.id);
                                const relatedHighlightCount = (seg.relatedIds || []).reduce(
                                    (count, rid) => count + (highlightedSet.has(rid) ? 1 : 0),
                                    0
                                );
                                const allowPairLineHighlight = highlightMode === 'descendants';
                                const active = hasHighlightSelection && (
                                    isPairLine
                                        ? (allowPairLineHighlight && relatedHighlightCount >= 1)
                                        : relatedHighlightCount >= 2
                                );

                                const baseStroke = isPairLine ? '#2563eb' : isDescendantLine ? '#7c3aed' : '#64748b';
                                const activeStroke = isPairLine ? '#1d4ed8' : isDescendantLine ? '#6d28d9' : '#334155';
                                const opacity = hasHighlightSelection
                                    ? (active ? 1 : 0.2)
                                    : 0.92;
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
                            const hasHighlightSelection = highlightMode !== 'none' && highlightedSet.size > 0;
                            const active = highlightedSet.has(id) || graphData.focusId === id;
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
                                    onMouseEnter={() => setHoveredAnimal(id)}
                                    onMouseLeave={() => setHoveredAnimal(null)}
                                    onContextMenu={e => {
                                        e.preventDefault();
                                        setFocusAnimalId(id);
                                        setFocusMode(true);
                                    }}
                                    onClick={() => {
                                        setFocusMode(true);
                                        setFocusAnimalId(id);
                                        pendingCenterAnimalRef.current = id;
                                        setCenterRequestNonce(n => n + 1);
                                    }}
                                    onDoubleClick={() => {
                                        if (onViewAnimal) onViewAnimal(animal);
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
                                    className={`text-left rounded-xl border-2 transition-all shadow-sm overflow-hidden ${active ? 'ring-2 ring-pink-200' : hasHighlightSelection ? 'opacity-35' : 'hover:border-accent hover:shadow-md'}`}
                                    title="Click to focus this animal. Double-click to open details."
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

                    {ancestorLoading && (
                        <div className="absolute inset-0 z-20 bg-white/75 backdrop-blur-[1px] flex items-center justify-center pointer-events-auto">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm text-gray-600 text-sm font-medium">
                                <Loader2 size={16} className="animate-spin" />
                                Loading linked public ancestors...
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-xs text-gray-500 italic">
                Hover a node to highlight {highlightMode}. Click a node to focus and center it. Double-click to open details. Focus search navigates without fading other animals. Use Ctrl+scroll to zoom and drag empty space to pan. On touch devices: one-finger drag to pan, two-finger pinch to zoom.
            </p>
        </div>
    );
};

export default FamilyTreeView;
