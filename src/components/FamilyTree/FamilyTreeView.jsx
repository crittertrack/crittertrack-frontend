import React, { useState, useMemo, useRef, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ZoomIn, ZoomOut, Home, Mars, Venus } from 'lucide-react';
import dagre from 'dagre';
import { formatDate } from '../../utils/dateFormatter';

const NODE_W = 180;
const NODE_H = 116;
const API_BASE_URL = '/api';

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

const FamilyTreeView = ({ animals = [], loading = false, onViewAnimal, authToken }) => {
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [zoom, setZoom] = useState(85);
    const [pan, setPan] = useState({ x: 24, y: 24 });
    const [hoveredAnimal, setHoveredAnimal] = useState(null);
    const [highlightMode, setHighlightMode] = useState('ancestors');
    const [externalAncestorsById, setExternalAncestorsById] = useState({});
    const [ancestorLoading, setAncestorLoading] = useState(false);
    const containerRef = useRef(null);
    const dragRef = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });
    const touchRef = useRef({ mode: null, startX: 0, startY: 0, originX: 0, originY: 0, startDist: 0, startZoom: 85 });

    const speciesList = useMemo(() => [...new Set(animals.map(a => a.species).filter(Boolean))].sort(), [animals]);

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

        let cancelled = false;

        const fetchAncestorForest = async () => {
            setAncestorLoading(true);
            const existing = new Map(speciesAnimals.map(a => [a.id_public, a]));
            const fetched = {};
            const visited = new Set(existing.keys());
            const queue = [];

            const enqueueParentIfMissing = (id) => {
                if (!id || visited.has(id)) return;
                visited.add(id);
                queue.push(id);
            };

            speciesAnimals.forEach(a => {
                enqueueParentIfMissing(a.fatherId_public || a.sireId_public);
                enqueueParentIfMissing(a.motherId_public || a.damId_public);
            });

            const fetchOne = async (id) => {
                if (!id) return null;
                if (authToken) {
                    try {
                        const r = await axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(id)}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        return r.data || null;
                    } catch {}
                }
                try {
                    const r = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(id)}`);
                    return r.data?.[0] || null;
                } catch {
                    return null;
                }
            };

            let guard = 0;
            while (queue.length > 0 && guard < 1200) {
                guard += 1;
                const id = queue.shift();
                const node = await fetchOne(id);
                if (cancelled) return;
                if (!node) continue;

                const nid = node.id_public || id;
                if (!existing.has(nid)) {
                    const normalized = { ...node, id_public: nid, isPublicAncestor: true };
                    existing.set(nid, normalized);
                    fetched[nid] = normalized;
                }

                enqueueParentIfMissing(node.fatherId_public || node.sireId_public);
                enqueueParentIfMissing(node.motherId_public || node.damId_public);
            }

            if (!cancelled) {
                setExternalAncestorsById(fetched);
                setAncestorLoading(false);
            }
        };

        fetchAncestorForest().catch(() => {
            if (!cancelled) {
                setExternalAncestorsById({});
                setAncestorLoading(false);
            }
        });

        return () => { cancelled = true; };
    }, [selectedSpecies, speciesAnimals, authToken]);

    const graphData = useMemo(() => {
        const byId = {};
        const childrenByParent = {};
        const parentLinksByChild = {};

        const combinedSpecies = [
            ...speciesAnimals,
            ...Object.values(externalAncestorsById),
        ];

        combinedSpecies.forEach(a => {
            byId[a.id_public] = a;
        });

        Object.values(byId).forEach(a => {
            const parents = [a.fatherId_public || a.sireId_public, a.motherId_public || a.damId_public].filter(Boolean);
            parentLinksByChild[a.id_public] = parents.filter(pid => byId[pid]);
            parentLinksByChild[a.id_public].forEach(pid => {
                if (!childrenByParent[pid]) childrenByParent[pid] = [];
                childrenByParent[pid].push(a.id_public);
            });
        });

        const g = new dagre.graphlib.Graph();
        g.setGraph({
            rankdir: 'TB',
            nodesep: 42,
            ranksep: 128,
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
            positions[id] = { x: n.x - NODE_W / 2, y: n.y - NODE_H / 2 };
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

        Object.entries(pairGroups).forEach(([pairKey, group]) => {
            const parents = group.parentIds
                .map(pid => ({ id: pid, x: positions[pid].x + NODE_W / 2, yBottom: positions[pid].y + NODE_H }))
                .sort((a, b) => a.x - b.x);
            const children = group.childIds
                .filter(cid => positions[cid])
                .map(cid => ({ id: cid, x: positions[cid].x + NODE_W / 2, yTop: positions[cid].y }))
                .sort((a, b) => compareSiblingOrder(byId[a.id], byId[b.id]));

            if (!parents.length || !children.length) return;

            const childBandY = Math.min(...children.map(c => c.yTop)) - 16;

            if (parents.length === 1) {
                const p = parents[0];
                edgeSegments.push({
                    id: `seg-${pairKey}-single-parent-trunk`,
                    d: `M ${p.x} ${p.yBottom} L ${p.x} ${childBandY}`,
                    relatedIds: [p.id, ...children.map(c => c.id)],
                });

                if (children.length > 1) {
                    const minX = children[0].x;
                    const maxX = children[children.length - 1].x;
                    edgeSegments.push({
                        id: `seg-${pairKey}-single-sibling-bar`,
                        d: `M ${minX} ${childBandY} L ${maxX} ${childBandY}`,
                        relatedIds: [p.id, ...children.map(c => c.id)],
                    });
                }

                children.forEach((c, idx) => {
                    edgeSegments.push({
                        id: `seg-${pairKey}-single-child-${idx}`,
                        d: `M ${c.x} ${childBandY} L ${c.x} ${c.yTop}`,
                        relatedIds: [p.id, c.id],
                    });
                });
                return;
            }

            const leftParent = parents[0];
            const rightParent = parents[parents.length - 1];
            const partnerLineY = Math.max(leftParent.yBottom, rightParent.yBottom) + 8;
            const trunkX = (leftParent.x + rightParent.x) / 2;

            edgeSegments.push({
                id: `seg-${pairKey}-left-down`,
                d: `M ${leftParent.x} ${leftParent.yBottom} L ${leftParent.x} ${partnerLineY}`,
                relatedIds: [leftParent.id, rightParent.id, ...children.map(c => c.id)],
            });
            edgeSegments.push({
                id: `seg-${pairKey}-partner-line`,
                d: `M ${leftParent.x} ${partnerLineY} L ${rightParent.x} ${partnerLineY}`,
                relatedIds: [leftParent.id, rightParent.id, ...children.map(c => c.id)],
            });
            edgeSegments.push({
                id: `seg-${pairKey}-right-down`,
                d: `M ${rightParent.x} ${rightParent.yBottom} L ${rightParent.x} ${partnerLineY}`,
                relatedIds: [leftParent.id, rightParent.id, ...children.map(c => c.id)],
            });

            edgeSegments.push({
                id: `seg-${pairKey}-trunk`,
                d: `M ${trunkX} ${partnerLineY} L ${trunkX} ${childBandY}`,
                relatedIds: [leftParent.id, rightParent.id, ...children.map(c => c.id)],
            });

            if (children.length > 1) {
                const minX = children[0].x;
                const maxX = children[children.length - 1].x;
                edgeSegments.push({
                    id: `seg-${pairKey}-sibling-bar`,
                    d: `M ${minX} ${childBandY} L ${maxX} ${childBandY}`,
                    relatedIds: [leftParent.id, rightParent.id, ...children.map(c => c.id)],
                });
            }

            children.forEach((c, idx) => {
                edgeSegments.push({
                    id: `seg-${pairKey}-child-drop-${idx}`,
                    d: `M ${c.x} ${childBandY} L ${c.x} ${c.yTop}`,
                    relatedIds: [leftParent.id, rightParent.id, c.id],
                });
            });
        });

        const maxX = Math.max(...Object.values(positions).map(p => p.x + NODE_W), 1200) + 48;
        const maxY = Math.max(...Object.values(positions).map(p => p.y + NODE_H), 700) + 48;

        return { byId, positions, edgeSegments, childrenByParent, parentLinksByChild, width: maxX, height: maxY };
    }, [speciesAnimals, externalAncestorsById]);

    const noPedigreeAnimals = useMemo(() => {
        return speciesAnimals
            .filter(a => {
                const hasParents = Boolean(a.fatherId_public || a.sireId_public || a.motherId_public || a.damId_public);
                const hasOffspring = (graphData.childrenByParent[a.id_public] || []).length > 0;
                return !hasParents && !hasOffspring;
            })
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [speciesAnimals, graphData.childrenByParent]);

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

    const highlightedSet = useMemo(() => {
        if (!hoveredAnimal) return new Set();
        const out = new Set([hoveredAnimal]);
        const rel = highlightMode === 'descendants' ? getDescendants(hoveredAnimal) : getAncestors(hoveredAnimal);
        rel.forEach(id => out.add(id));
        return out;
    }, [hoveredAnimal, highlightMode, graphData]);

    const handleWheel = e => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -8 : 8;
        setZoom(prev => Math.max(40, Math.min(180, prev + delta)));
    };

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    const beginDrag = e => {
        // Left-drag pans when starting from empty canvas space.
        if (e.button !== 0 && e.button !== 1) return;
        if (e.target.closest('[data-family-node="true"]')) return;
        dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, originX: pan.x, originY: pan.y };
    };

    const onDrag = e => {
        if (!dragRef.current.active) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPan({ x: dragRef.current.originX + dx, y: dragRef.current.originY + dy });
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
            touchRef.current = { ...touchRef.current, mode: 'pinch', startDist: dist, startZoom: zoom };
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
            originX: pan.x,
            originY: pan.y,
        };
    };

    const onTouchMove = e => {
        if (touchRef.current.mode === 'pinch' && e.touches.length === 2) {
            e.preventDefault();
            const dist = touchDistance(e.touches[0], e.touches[1]);
            if (!touchRef.current.startDist) return;
            const scale = dist / touchRef.current.startDist;
            const nextZoom = Math.max(40, Math.min(180, Math.round(touchRef.current.startZoom * scale)));
            setZoom(nextZoom);
            return;
        }

        if (touchRef.current.mode === 'pan' && e.touches.length === 1) {
            e.preventDefault();
            const t = e.touches[0];
            const dx = t.clientX - touchRef.current.startX;
            const dy = t.clientY - touchRef.current.startY;
            setPan({ x: touchRef.current.originX + dx, y: touchRef.current.originY + dy });
        }
    };

    const onTouchEnd = e => {
        if (e.touches.length >= 2) {
            const dist = touchDistance(e.touches[0], e.touches[1]);
            touchRef.current = { ...touchRef.current, mode: 'pinch', startDist: dist, startZoom: zoom };
            return;
        }
        if (e.touches.length === 1 && touchRef.current.mode === 'pinch') {
            const t = e.touches[0];
            touchRef.current = {
                ...touchRef.current,
                mode: 'pan',
                startX: t.clientX,
                startY: t.clientY,
                originX: pan.x,
                originY: pan.y,
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
            <div className="flex items-center gap-3 flex-wrap p-4 bg-gray-50 rounded-lg border border-gray-200">
                <select
                    value={selectedSpecies || ''}
                    onChange={e => {
                        setSelectedSpecies(e.target.value);
                        setHoveredAnimal(null);
                        setPan({ x: 24, y: 24 });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                    {speciesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

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

                <div className="flex items-center gap-2 ml-auto">
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
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={() => setZoom(z => Math.max(40, z - 10))} className="p-2 hover:bg-gray-200 rounded transition" title="Zoom out (Ctrl+Scroll)">
                        <ZoomOut size={16} className="text-gray-600" />
                    </button>
                    <span className="text-xs font-medium text-gray-600 w-12 text-center">{zoom}%</span>
                    <button onClick={() => setZoom(z => Math.min(180, z + 10))} className="p-2 hover:bg-gray-200 rounded transition" title="Zoom in (Ctrl+Scroll)">
                        <ZoomIn size={16} className="text-gray-600" />
                    </button>
                    <button
                        onClick={() => {
                            setZoom(85);
                            setPan({ x: 24, y: 24 });
                            setHoveredAnimal(null);
                        }}
                        className="p-2 hover:bg-gray-200 rounded transition"
                        title="Reset view"
                    >
                        <Home size={16} className="text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4">
                <div className="border border-gray-300 rounded-lg bg-white shadow-sm h-[680px] overflow-auto">
                    <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-200 px-3 py-2">
                        <p className="text-sm font-semibold text-gray-700">No Pedigree Links</p>
                        <p className="text-xs text-gray-500">{noPedigreeAnimals.length} animals with no parents and no offspring in this species</p>
                    </div>
                    <div className="p-2 space-y-1.5">
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
                    className="w-full border border-gray-300 rounded-lg bg-white overflow-auto shadow-sm"
                    style={{ height: '680px', cursor: dragRef.current.active ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}
                >
                    <div
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
                            transformOrigin: '0 0',
                            transition: dragRef.current.active ? 'none' : 'transform 0.12s linear',
                            width: graphData.width,
                            height: graphData.height,
                            position: 'relative',
                        }}
                    >
                        <svg style={{ position: 'absolute', inset: 0, width: graphData.width, height: graphData.height, pointerEvents: 'none' }}>
                            {graphData.edgeSegments.map(seg => {
                                const active = hoveredAnimal && seg.relatedIds.every(rid => highlightedSet.has(rid));
                                return (
                                    <path
                                        key={seg.id}
                                        d={seg.d}
                                        fill="none"
                                        stroke={active ? '#1d4ed8' : '#64748b'}
                                        strokeWidth={active ? 3.4 : 2.4}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        opacity={hoveredAnimal ? (active ? 1 : 0.2) : 0.92}
                                    />
                                );
                            })}
                        </svg>

                        {Object.entries(graphData.positions).map(([id, pos]) => {
                            const animal = graphData.byId[id];
                            if (!animal) return null;
                            const active = highlightedSet.has(id);
                            const isMale = animal.gender === 'Male';
                            const isFemale = animal.gender === 'Female';
                            const borderColor = isMale ? '#3b82f6' : isFemale ? '#ec4899' : '#94a3b8';
                            const bgColor = isMale ? '#e8f1ff' : isFemale ? '#fdeef6' : '#f8fafc';
                            const GenderIcon = isMale ? Mars : Venus;

                            return (
                                <button
                                    key={id}
                                    type="button"
                                    data-family-node="true"
                                    onMouseEnter={() => setHoveredAnimal(id)}
                                    onMouseLeave={() => setHoveredAnimal(null)}
                                    onClick={() => onViewAnimal && onViewAnimal(animal)}
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
                                    className={`text-left p-2.5 rounded-xl border transition-all shadow-sm ${active ? 'ring-2 ring-pink-200' : hoveredAnimal ? 'opacity-35' : 'hover:border-accent hover:shadow-md'}`}
                                    title="Click to open animal details"
                                >
                                    <div className="absolute top-1 right-1">
                                        <GenderIcon size={14} color={borderColor} />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 truncate">{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ') || 'Unnamed'}</p>
                                    <p className="text-xs text-gray-500 truncate">{animal.species || 'Unknown species'}</p>
                                    <p className="text-xs text-gray-400">{animal.birthDate ? formatDate(animal.birthDate) : 'No birth date'}</p>
                                    <p className="text-xs text-gray-600 mt-1 truncate">{animal.status || 'Unknown'}</p>
                                    <p className="text-xs text-gray-600 truncate">{animal.color || 'No variety'}</p>
                                    <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">{animal.id_public}{animal.isPublicAncestor ? ' • public' : ''}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-500 italic">
                Hover a node to highlight {highlightMode}. Click a node to open details. Use Ctrl+scroll to zoom and drag empty space to pan. On touch devices: one-finger drag to pan, two-finger pinch to zoom.
            </p>
        </div>
    );
};

export default FamilyTreeView;
