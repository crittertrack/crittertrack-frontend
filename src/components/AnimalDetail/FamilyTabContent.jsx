import React, { useState, useMemo } from 'react';
import axios from 'axios';
import {
    Network, Users, ChevronDown, ChevronUp, ChevronRight,
    Cat, Heart, Hourglass, Mars, Venus, Loader2
} from 'lucide-react';
import { formatDate, litterAge } from '../../utils/dateFormatter';
import { computeRelationships } from './utils';

export const FamilyTabContent = ({ animal, API_BASE_URL, authToken, onViewAnimal = null }) => {
    const [animalLitters, setAnimalLitters] = useState(null);
    const [pedigreeOffspring, setPedigreeOffspring] = useState(null);
    const [expandedBreedingRecords, setExpandedBreedingRecords] = useState({});
    const [expandedPedigreeRecords, setExpandedPedigreeRecords] = useState({});
    const [breedingRecordOffspring, setBreedingRecordOffspring] = useState({});
    const [ownedAnimals, setOwnedAnimals] = useState([]);
    const [ownedAnimalsLoaded, setOwnedAnimalsLoaded] = useState(false);
    const [ownedAnimalsLoading, setOwnedAnimalsLoading] = useState(true);
    const [globalRels, setGlobalRels] = useState(null);
    const [globalRelsLoading, setGlobalRelsLoading] = useState(false);
    const [relInsightsOpen, setRelInsightsOpen] = useState(true);
    const [offspringOpen, setOffspringOpen] = useState(true);
    const ownedAnimalsLoadedRef = React.useRef(false);

    // Fetch own collection first, then global relationships sequentially
    React.useEffect(() => {
        if (!authToken || !animal?.id_public) {
            setOwnedAnimalsLoading(false);
            return;
        }
        if (ownedAnimalsLoadedRef.current) return;
        ownedAnimalsLoadedRef.current = true;

        const run = async () => {
            // Step 1: load own collection and display it
            setOwnedAnimalsLoading(true);
            try {
                const animalsRes = await axios.get(`${API_BASE_URL}/animals`, { headers: { Authorization: `Bearer ${authToken}` } });
                setOwnedAnimals(animalsRes.data || []);
                setOwnedAnimalsLoaded(true);
            } catch {
                setOwnedAnimalsLoaded(true);
            } finally {
                setOwnedAnimalsLoading(false);
            }

            // Step 2: once own collection is shown, fetch cross-breeder relationships
            setGlobalRelsLoading(true);
            try {
                const relsRes = await axios.get(`${API_BASE_URL}/animals/${animal.id_public}/relationships`, { headers: { Authorization: `Bearer ${authToken}` } });
                setGlobalRels(relsRes.data || null);
            } catch { /* no-op */ } finally {
                setGlobalRelsLoading(false);
            }
        };

        run();
    }, [authToken, API_BASE_URL, animal?.id_public]);

    // Fetch litters where this animal is sire or dam
    React.useEffect(() => {
        if (!animal?.id_public || !authToken) return;
        let cancelled = false;
        axios.get(`${API_BASE_URL}/litters`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => {
                if (cancelled) return;
                const linked = (res.data || []).filter(l =>
                    l.sireId_public === animal.id_public || l.damId_public === animal.id_public
                );
                setAnimalLitters(linked);
                linked.forEach(litter => {
                    const lid = litter.litter_id_public;
                    if (!lid) return;
                    if (!litter.offspringIds_public?.length) {
                        setBreedingRecordOffspring(prev => ({ ...prev, [lid]: [] }));
                        return;
                    }
                    axios.get(`${API_BASE_URL}/litters/${lid}/offspring`, { headers: { Authorization: `Bearer ${authToken}` } })
                        .then(r => { if (!cancelled) setBreedingRecordOffspring(prev => ({ ...prev, [lid]: r.data })); })
                        .catch(() => { if (!cancelled) setBreedingRecordOffspring(prev => ({ ...prev, [lid]: [] })); });
                });
            })
            .catch(() => { if (!cancelled) setAnimalLitters([]); });
        return () => { cancelled = true; };
    }, [animal?.id_public, authToken, API_BASE_URL]);

    // Fetch pedigree-based offspring (not in litter management)
    React.useEffect(() => {
        if (!animal?.id_public || !authToken) return;
        let cancelled = false;
        axios.get(`${API_BASE_URL}/animals/${animal.id_public}/offspring`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => {
                if (cancelled) return;
                const unmanaged = (res.data || []).filter(l => !l.litter_id_public);
                setPedigreeOffspring(unmanaged);
            })
            .catch(() => { if (!cancelled) setPedigreeOffspring([]); });
        return () => { cancelled = true; };
    }, [animal?.id_public, authToken, API_BASE_URL]);

    const relationships = useMemo(() => computeRelationships(animal, ownedAnimals), [animal, ownedAnimals]);

    const getRelLabel = (groupLabel, rel) => {
        const isMale = rel.gender === 'Male';
        const isFemale = rel.gender === 'Female';
        const side = rel._side === 'paternal' ? 'Paternal ' : rel._side === 'maternal' ? 'Maternal ' : '';
        switch (groupLabel) {
            case 'Parents':
                if (rel.id_public === animal?.sireId_public) return 'Sire (Father)';
                if (rel.id_public === animal?.damId_public) return 'Dam (Mother)';
                return isMale ? 'Sire (Father)' : isFemale ? 'Dam (Mother)' : 'Parent';
            case 'Siblings':
                return isMale ? 'Brother' : isFemale ? 'Sister' : 'Sibling';
            case 'Nieces & Nephews':
                return isMale ? 'Nephew' : isFemale ? 'Niece' : 'Niece / Nephew';
            case 'Aunts & Uncles':
                return isMale ? `${side}Uncle` : isFemale ? `${side}Aunt` : `${side}Aunt / Uncle`;
            case 'Grandparents':
                return isMale ? `${side}Grandfather` : isFemale ? `${side}Grandmother` : `${side}Grandparent`;
            case 'Great-Grandparents':
                return isMale ? `${side}Great-Grandfather` : isFemale ? `${side}Great-Grandmother` : `${side}Great-Grandparent`;
            case 'Cousins': return 'Cousin';
            default: return groupLabel;
        }
    };

    // Unified merged list: own collection first, then global rels, deduped by id_public
    const allRelGroups = useMemo(() => {
        const groupDefs = [
            { key: 'parents',           label: 'Parents',            ownRelTypes: ['Sire (Father)', 'Dam (Mother)'] },
            { key: 'siblings',          label: 'Siblings',           ownRelTypes: ['Full Sibling', 'Full Brother', 'Full Sister', 'Half-Sibling (via Sire)', 'Half-Brother (via Sire)', 'Half-Sister (via Sire)', 'Half-Sibling (via Dam)', 'Half-Brother (via Dam)', 'Half-Sister (via Dam)'] },
            { key: 'nephewsNieces',     label: 'Nieces & Nephews',   ownRelTypes: ['Niece / Nephew', 'Niece', 'Nephew'] },
            { key: 'auntsUncles',       label: 'Aunts & Uncles',     ownRelTypes: ['Aunt / Uncle', 'Aunt', 'Uncle', 'Paternal Aunt / Uncle', 'Paternal Aunt', 'Paternal Uncle', 'Maternal Aunt / Uncle', 'Maternal Aunt', 'Maternal Uncle'] },
            { key: 'grandparents',      label: 'Grandparents',       ownRelTypes: ['Paternal Grandparent', 'Paternal Grandfather', 'Paternal Grandmother', 'Maternal Grandparent', 'Maternal Grandfather', 'Maternal Grandmother'] },
            { key: 'greatGrandparents', label: 'Great-Grandparents', ownRelTypes: ['Paternal Great-Grandparent', 'Paternal Great-Grandfather', 'Paternal Great-Grandmother', 'Maternal Great-Grandparent', 'Maternal Great-Grandfather', 'Maternal Great-Grandmother'] },
            { key: 'cousins',           label: 'Cousins',            ownRelTypes: ['Cousin'] },
        ];
        const seenAcrossGroups = new Set();
        return groupDefs.map(({ key, label, ownRelTypes }) => {
            const items = [];
            relationships.filter(r => ownRelTypes.includes(r.rel)).forEach(({ animal: rel, rel: relLabel }) => {
                if (!seenAcrossGroups.has(rel.id_public)) { seenAcrossGroups.add(rel.id_public); items.push({ rel, relLabel }); }
            });
            if (globalRels) {
                (globalRels[key] || []).filter(a => a.id_public !== animal?.id_public).forEach(rel => {
                    if (!seenAcrossGroups.has(rel.id_public)) { seenAcrossGroups.add(rel.id_public); items.push({ rel, relLabel: getRelLabel(label, rel) }); }
                });
            }
            return { label, items };
        }).filter(g => g.items.length > 0);
    }, [relationships, globalRels, animal?.id_public, animal?.sireId_public, animal?.damId_public]);

    return (
        <div className="space-y-6">
            {/* Relationship Insights */}
            <div className="bg-blue-50 rounded-lg border border-blue-200">
                <button
                    type="button"
                    onClick={() => setRelInsightsOpen(o => !o)}
                    className="w-full flex items-center justify-between p-4 text-left"
                >
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                        <Network size={20} className="text-blue-600 mr-2" />
                        Relationship Insights
                        {!ownedAnimalsLoading && allRelGroups.length > 0 && (
                            <span className="ml-2 text-xs font-normal text-gray-500 bg-white border border-blue-200 rounded-full px-2 py-0.5">
                                {allRelGroups.reduce((s, g) => s + g.items.length, 0)} relatives
                            </span>
                        )}
                        {globalRelsLoading && (
                            <Loader2 size={13} className="animate-spin text-blue-400 ml-2" />
                        )}
                    </h3>
                    {relInsightsOpen
                        ? <ChevronUp size={18} className="text-blue-400 flex-shrink-0" />
                        : <ChevronDown size={18} className="text-blue-400 flex-shrink-0" />}
                </button>
                {relInsightsOpen && (
                    <div className="px-4 pb-4 space-y-3">
                        {ownedAnimalsLoading ? (
                            <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                                <Loader2 size={13} className="animate-spin" />
                                Loading relationships...
                            </div>
                        ) : allRelGroups.length === 0 && !globalRelsLoading ? (
                            <div className="text-xs text-gray-400 py-1">No known relatives found</div>
                        ) : (
                            <>
                                {allRelGroups.map(({ label: groupLabel, items }) => (
                                    <div key={groupLabel}>
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{groupLabel}</h4>
                                        <div className="space-y-2">
                                            {items.map(({ rel, relLabel }) => (
                                                <div
                                                    key={rel.id_public}
                                                    className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
                                                    onClick={() => onViewAnimal && onViewAnimal(rel)}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {(rel.imageUrl || rel.photoUrl) ? (
                                                            <img src={rel.imageUrl || rel.photoUrl} alt={rel.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-sm text-blue-600 font-semibold">
                                                                {rel.species?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-medium text-gray-800 truncate">{rel.prefix ? `${rel.prefix} ` : ''}{rel.name}{rel.suffix ? ` ${rel.suffix}` : ''}</div>
                                                            <div className="text-xs text-gray-500">{rel.gender}{[rel.color, rel.coatPattern, rel.coat].filter(Boolean).join(' ') ? ` · ${[rel.color, rel.coatPattern, rel.coat].filter(Boolean).join(' ')}` : ''}{rel.birthDate ? ` · ${formatDate(rel.birthDate)}` : ''}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                        <span className="text-xs text-blue-700 bg-blue-100 rounded-full px-2 py-0.5 font-medium whitespace-nowrap">{relLabel}</span>
                                                        <ChevronRight size={14} className="text-gray-400" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {globalRelsLoading && (
                                    <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
                                        <Loader2 size={13} className="animate-spin" />
                                        Loading more...
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Offspring & Litters */}
            {(animalLitters === null || pedigreeOffspring === null) ? (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-sm text-gray-500 animate-pulse">Loading offspring & litters</div>
                </div>
            ) : (() => {
                const litterItems = (animalLitters || []).map(l => ({ ...l, _recordType: 'litter' }));
                const pedItems = (pedigreeOffspring || []).map(l => ({ ...l, _recordType: 'pedigree' }));
                const _offspringToday = new Date();
                const allRecords = [...litterItems, ...pedItems].sort((a, b) => {
                    const aIsMated = a.isPlanned && a.matingDate && new Date(a.matingDate) <= _offspringToday;
                    const bIsMated = b.isPlanned && b.matingDate && new Date(b.matingDate) <= _offspringToday;
                    const aRank = aIsMated ? 0 : a.isPlanned ? 1 : 2;
                    const bRank = bIsMated ? 0 : b.isPlanned ? 1 : 2;
                    if (aRank !== bRank) return aRank - bRank;
                    const aDate = a.birthDate || a.matingDate;
                    const bDate = b.birthDate || b.matingDate;
                    if (!aDate) return 1;
                    if (!bDate) return -1;
                    return new Date(bDate) - new Date(aDate);
                });
                if (allRecords.length === 0) return null;
                return (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-3">
                        <button type="button" onClick={() => setOffspringOpen(o => !o)} className="w-full flex items-center justify-between text-left">
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center"><Users size={20} className="text-purple-600 mr-2" />Offspring & Litters</h3>
                            {offspringOpen ? <ChevronUp size={18} className="text-purple-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-purple-400 flex-shrink-0" />}
                        </button>
                        {offspringOpen && <div className="space-y-2">
                            {allRecords.map((litter) => {
                                if (litter._recordType === 'litter') {
                                    const lid = litter.litter_id_public;
                                    const isSire = litter.sireId_public === animal.id_public;
                                    const mate = isSire ? litter.dam : litter.sire;
                                    const isExpanded = expandedBreedingRecords[lid];
                                    const displayName = litter.breedingPairCodeName;
                                    const lIsMated = litter.isPlanned && litter.matingDate && new Date(litter.matingDate) <= _offspringToday;
                                    const lIsPlannedOnly = litter.isPlanned && !lIsMated;
                                    return (
                                        <div key={lid} className={`bg-white rounded border transition-all ${isExpanded ? 'border-purple-300 shadow-md' : 'border-purple-100'}`}>
                                            <div
                                                onClick={() => setExpandedBreedingRecords({...expandedBreedingRecords, [lid]: !isExpanded})}
                                                className="p-2 sm:p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition rounded"
                                            >
                                                {/* Mobile: stacked */}
                                                <div className="flex-1 sm:hidden">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="font-bold text-gray-800 text-sm">{displayName || <span className="text-gray-400 font-normal">Unnamed Litter</span>}</p>
                                                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                            {lid && <span className="text-xs font-mono bg-purple-100 px-1.5 py-0.5 rounded text-purple-700">{lid}</span>}
                                                            {lIsPlannedOnly && <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5"><Hourglass size={12} className="inline-block align-middle mr-0.5" /> Planned</span>}
                                                            {lIsMated && <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5"><Heart size={12} className="inline-block align-middle mr-0.5" /> Mated</span>}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-600 flex gap-2 flex-wrap items-center">
                                                        {!litter.isPlanned && litter.birthDate && <span>{formatDate(litter.birthDate)}{litterAge(litter.birthDate) && <span className="ml-1 font-semibold text-green-600">• {litterAge(litter.birthDate)}</span>}</span>}
                                                        {lIsMated && <span className="text-purple-600">{formatDate(litter.matingDate)}</span>}
                                                        {lIsPlannedOnly && litter.matingDate && <span className="text-indigo-600">{formatDate(litter.matingDate)}</span>}
                                                        {mate?.name && <span className="truncate max-w-[120px]">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</span>}
                                                        {litter.inbreedingCoefficient != null && <span className="text-gray-500">{litter.inbreedingCoefficient.toFixed(2)}%</span>}
                                                        {!litter.isPlanned && (litter.litterSizeBorn != null || litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && (
                                                            <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                                                {litter.litterSizeBorn != null && <span className="font-bold text-gray-900">{litter.litterSizeBorn}</span>}
                                                                {litter.litterSizeBorn != null && (litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && <span className="text-gray-400">•</span>}
                                                                {(litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && (
                                                                    <span className="inline-flex gap-0.5 font-semibold">
                                                                        <span className="text-blue-500">{litter.maleCount ?? 0}M</span>
                                                                        <span className="text-gray-400">/</span>
                                                                        <span className="text-pink-500">{litter.femaleCount ?? 0}F</span>
                                                                        <span className="text-gray-400">/</span>
                                                                        <span className="text-purple-500">{litter.unknownCount ?? 0}U</span>
                                                                    </span>
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Desktop: 6-column grid */}
                                                <div className="hidden sm:grid flex-1 grid-cols-6 gap-3 items-center min-w-0">
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-800 text-sm truncate">{displayName || <span className="text-gray-400 font-normal text-xs">Unnamed</span>}</p>
                                                        {lIsPlannedOnly && <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5 inline-block mt-0.5"><Hourglass size={12} className="inline-block align-middle mr-0.5" /> Planned</span>}
                                                        {lIsMated && <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5 inline-block mt-0.5"><Heart size={12} className="inline-block align-middle mr-0.5" /> Mated</span>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        {lid ? <span className="text-xs font-mono bg-purple-100 px-2 py-0.5 rounded text-purple-700 block w-fit">{lid}</span> : <span className="text-xs text-gray-400">•</span>}
                                                    </div>
                                                    <div>
                                                        {lIsPlannedOnly ? (<>
                                                            <span className="text-indigo-400 text-[10px] uppercase tracking-wide font-semibold block">Planned</span>
                                                            <span className="text-sm font-semibold text-indigo-700">{formatDate(litter.matingDate) || '?'}</span>
                                                        </>) : lIsMated ? (<>
                                                            <span className="text-purple-400 text-[10px] uppercase tracking-wide font-semibold block">Mated</span>
                                                            <span className="text-sm font-semibold text-purple-700">{formatDate(litter.matingDate) || '?'}</span>
                                                        </>) : (<>
                                                            <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Birth</span>
                                                            <span className="text-sm font-semibold text-gray-800">{formatDate(litter.birthDate) || '?'}{litter.birthDate && litterAge(litter.birthDate) && <span className="ml-1 text-xs font-semibold text-green-600">• {litterAge(litter.birthDate)}</span>}</span>
                                                        </>)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Mate</span>
                                                        <span className="text-sm font-semibold text-gray-800 truncate block">{mate ? [mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ') : '•'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">COI</span>
                                                        <span className="text-sm font-semibold text-gray-800">{litter.inbreedingCoefficient != null ? `${litter.inbreedingCoefficient.toFixed(2)}%` : '•'}</span>
                                                    </div>
                                                    <div>
                                                        {lIsPlannedOnly ? (<>
                                                            <span className="text-indigo-400 text-[10px] uppercase tracking-wide font-semibold block">Due</span>
                                                            <span className="text-sm font-semibold text-indigo-700">{formatDate(litter.expectedDueDate) || '•'}</span>
                                                        </>) : lIsMated ? (<>
                                                            <span className="text-purple-400 text-[10px] uppercase tracking-wide font-semibold block">Status</span>
                                                            <span className="text-xs font-semibold text-purple-500">Awaiting birth</span>
                                                        </>) : (<>
                                                            <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Born</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-sm font-bold text-gray-800">{litter.litterSizeBorn ?? litter.numberBorn ?? 0}</span>
                                                                {(litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && (
                                                                    <span className="text-xs ml-1">
                                                                        <span className="text-blue-500 font-semibold">{litter.maleCount ?? 0}M</span>
                                                                        <span className="text-gray-400 mx-0.5">/</span>
                                                                        <span className="text-pink-500 font-semibold">{litter.femaleCount ?? 0}F</span>
                                                                        <span className="text-gray-400 mx-0.5">/</span>
                                                                        <span className="text-purple-500 font-semibold">{litter.unknownCount ?? 0}U</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </>)}
                                                    </div>
                                                </div>
                                                <ChevronDown size={18} className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                            {isExpanded && (
                                                <div className="border-t border-purple-100 p-3 bg-purple-50 space-y-3">
                                                    {/* Name + CTL | COI | Mate */}
                                                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-start sm:items-center">
                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm h-full grid grid-cols-2 divide-x divide-gray-200 gap-3">
                                                            <div>
                                                                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Litter Name</div>
                                                                {displayName
                                                                    ? <div className="text-sm font-bold text-gray-800">{displayName}</div>
                                                                    : <div className="text-sm text-gray-400 italic">?</div>}
                                                            </div>
                                                            <div className="pl-3">
                                                                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">CTL ID</div>
                                                                {lid
                                                                    ? <div className="font-mono text-sm font-bold text-purple-700">{lid}</div>
                                                                    : <div className="text-sm text-gray-400 italic">?</div>}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-center px-2">
                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">COI</div>
                                                            {litter.inbreedingCoefficient != null
                                                                ? <div className="text-base font-medium text-gray-800">{litter.inbreedingCoefficient.toFixed(2)}%</div>
                                                                : <div className="text-base font-medium text-gray-300">•</div>}
                                                        </div>
                                                        {mate ? (
                                                            <div onClick={() => onViewAnimal && onViewAnimal(mate)} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition shadow-sm">
                                                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                    {mate.imageUrl || mate.photoUrl
                                                                        ? <img src={mate.imageUrl || mate.photoUrl} alt={mate.name} className="w-full h-full object-cover" />
                                                                        : <div className="w-full h-full flex items-center justify-center text-gray-400"><Cat size={18} /></div>}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mate</div>
                                                                    <p className="font-bold text-gray-800 truncate text-sm">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</p>
                                                                    <p className="text-xs text-gray-500">{mate.species}</p>
                                                                    <p className="text-[10px] text-gray-400 font-mono">{mate.id_public}</p>
                                                                </div>
                                                            </div>
                                                        ) : <div />}
                                                    </div>
                                                    {/* Breeding & Birth */}
                                                    {(litter.matingDate || litter.pairingDate || litter.breedingMethod || litter.breedingConditionAtTime || litter.outcome || litter.birthDate || litter.birthMethod || litter.expectedDueDate || litter.weaningDate) && (
                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Breeding &amp; Birth</h4>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                                                                {(litter.matingDate || litter.pairingDate) && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mating Date</div><div className="font-semibold text-gray-800">{formatDate(litter.matingDate || litter.pairingDate)}</div></div>}
                                                                {litter.expectedDueDate && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Expected Due Date</div><div className="font-semibold text-gray-800">{formatDate(litter.expectedDueDate)}</div></div>}
                                                                {litter.breedingMethod && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Breeding Method</div><div className="font-semibold text-gray-800">{litter.breedingMethod}</div></div>}
                                                                {litter.breedingConditionAtTime && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Breeding Condition</div><div className="font-semibold text-gray-800">{litter.breedingConditionAtTime}</div></div>}
                                                                {litter.outcome && !(litter.isPlanned && litter.outcome === 'Unknown') && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Outcome</div><div className={`font-semibold ${litter.outcome === 'Successful' ? 'text-green-600' : litter.outcome === 'Unsuccessful' ? 'text-red-500' : 'text-gray-800'}`}>{litter.outcome}</div></div>}
                                                                {!litter.isPlanned && litter.birthMethod && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Birth Method</div><div className="font-semibold text-gray-800">{litter.birthMethod}</div></div>}
                                                                {!litter.isPlanned && litter.birthDate && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Birth Date</div><div className="font-semibold text-gray-800">{formatDate(litter.birthDate)}{litterAge(litter.birthDate) && <span className="ml-2 text-xs font-semibold text-green-600">{litterAge(litter.birthDate)}</span>}</div></div>}
                                                                {!litter.isPlanned && litter.weaningDate && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Weaning Date</div><div className="font-semibold text-gray-800">{formatDate(litter.weaningDate)}</div></div>}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Stats bar */}
                                                    {!litter.isPlanned && <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                        <div className="grid grid-cols-2 divide-x divide-gray-200">
                                                            <div className="grid grid-cols-3 pr-3">
                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Born</div><div className="text-lg font-bold text-gray-800">{litter.litterSizeBorn ?? litter.numberBorn ?? 0}</div></div>
                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Stillborn</div><div className="text-lg font-bold text-gray-400">{litter.stillbornCount ?? litter.stillborn ?? 0}</div></div>
                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Weaned</div><div className="text-lg font-bold text-green-600">{litter.litterSizeWeaned ?? litter.numberWeaned ?? 0}</div></div>
                                                            </div>
                                                            <div className="grid grid-cols-3 pl-3">
                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Males</div><div className="text-lg font-bold text-blue-500">{litter.maleCount ?? 0}</div></div>
                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Females</div><div className="text-lg font-bold text-pink-500">{litter.femaleCount ?? 0}</div></div>
                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Unknown</div><div className="text-lg font-bold text-purple-500">{litter.unknownCount ?? 0}</div></div>
                                                            </div>
                                                        </div>
                                                    </div>}
                                                    {/* Notes */}
                                                    {litter.notes && <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm"><h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</h4><p className="text-sm text-gray-700 italic leading-relaxed">{litter.notes}</p></div>}
                                                    {/* Photos */}
                                                    {!litter.isPlanned && litter.images && litter.images.length > 0 && (
                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Photos</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {litter.images.map((img, idx) => (
                                                                    <div key={img.r2Key || idx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                                                        <img src={img.url} alt={"Gallery " + (idx + 1)} className="w-full h-full object-cover cursor-pointer" onClick={() => window.open(img.url, '_blank')} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Linked Offspring loading */}
                                                    {lid && breedingRecordOffspring[lid] === undefined && (
                                                        <div className="bg-white p-3 rounded border border-purple-100">
                                                            <div className="text-sm font-semibold text-gray-700 mb-3">Offspring</div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                                {[...Array(3)].map((_, i) => (
                                                                    <div key={i} className="rounded-lg border-2 border-gray-200 h-52 animate-pulse bg-gray-50 flex flex-col items-center pt-2">
                                                                        <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                            <div className="w-20 h-20 bg-gray-200 rounded-md" />
                                                                        </div>
                                                                        <div className="w-full px-2 pb-2">
                                                                            <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-1" />
                                                                            <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto" />
                                                                        </div>
                                                                        <div className="w-full bg-gray-100 py-1 border-t border-gray-200 mt-auto" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Linked Offspring loaded */}
                                                    {lid && breedingRecordOffspring[lid] && breedingRecordOffspring[lid].length > 0 && (
                                                        <div className="bg-white p-3 rounded border border-purple-100">
                                                            <div className="text-sm font-semibold text-gray-700 mb-3">Offspring ({breedingRecordOffspring[lid].length})</div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                                {breedingRecordOffspring[lid].map(offspring => (
                                                                    offspring.isPrivate ? (
                                                                        <div key={offspring.id_public} className="relative bg-gray-50 rounded-lg border-2 border-gray-200 h-52 flex flex-col items-center overflow-hidden pt-2">
                                                                            <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                                <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-2xl">•</div>
                                                                            </div>
                                                                            <div className="w-full text-center px-2 pb-1">
                                                                                <div className="text-sm font-semibold text-gray-500 truncate">Private Animal</div>
                                                                            </div>
                                                                            <div className="w-full px-2 pb-2 flex justify-end">
                                                                                <div className="text-xs text-gray-400 font-mono">{offspring.id_public}</div>
                                                                            </div>
                                                                            <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                                                                <div className="text-xs font-medium text-gray-500">{offspring.gender || '•'}</div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div key={offspring.id_public} onClick={() => onViewAnimal && onViewAnimal(offspring)} className="relative bg-white rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 border-gray-200 pt-2">
                                                                            {offspring.gender && (
                                                                                <div className="absolute top-1.5 right-1.5">
                                                                                    {offspring.gender === 'Male'
                                                                                        ? <Mars size={14} strokeWidth={2.5} className="text-primary" />
                                                                                        : <Venus size={14} strokeWidth={2.5} className="text-accent" />
                                                                                    }
                                                                                </div>
                                                                            )}
                                                                            <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                                {offspring.imageUrl || offspring.photoUrl ? (
                                                                                    <img src={offspring.imageUrl || offspring.photoUrl} alt={offspring.name} className="w-20 h-20 object-cover rounded-md" />
                                                                                ) : (
                                                                                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                                                        <Cat size={32} />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="w-full text-center px-2 pb-1">
                                                                                <div className="text-sm font-semibold text-gray-800 truncate">
                                                                                    {[offspring.prefix, offspring.name, offspring.suffix].filter(Boolean).join(' ')}
                                                                                </div>
                                                                            </div>
                                                                            <div className="w-full px-2 pb-2 flex justify-end">
                                                                                <div className="text-xs text-gray-500">{offspring.id_public}</div>
                                                                            </div>
                                                                            <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                                                                <div className="text-xs font-medium text-gray-700">{offspring.status || offspring.gender || 'Unknown'}</div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                } else {
                                    // Pedigree-only record
                                    const recKey = `${litter.birthDate || 'unknown'}_${litter.otherParent?.id_public || 'none'}`;
                                    const mate = litter.otherParent;
                                    const isExpanded = expandedPedigreeRecords[recKey];
                                    const offspringList = litter.offspring || [];
                                    const maleCount = offspringList.filter(o => o.gender === 'Male').length;
                                    const femaleCount = offspringList.filter(o => o.gender === 'Female').length;
                                    const unknownCount = offspringList.filter(o => o.gender !== 'Male' && o.gender !== 'Female').length;
                                    const coi = offspringList.find(o => o.inbreedingCoefficient != null)?.inbreedingCoefficient ?? null;
                                    return (
                                        <div key={recKey} className={`bg-white rounded border transition-all ${isExpanded ? 'border-purple-300 shadow-md' : 'border-purple-100'}`}>
                                            <div
                                                onClick={() => setExpandedPedigreeRecords({...expandedPedigreeRecords, [recKey]: !isExpanded})}
                                                className="p-2 sm:p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition rounded"
                                            >
                                                {/* Mobile: stacked */}
                                                <div className="flex-1 sm:hidden">
                                                    <div className="text-xs text-gray-600 flex gap-2 flex-wrap items-center">
                                                        {litter.birthDate && <span>{formatDate(litter.birthDate)}</span>}
                                                        {mate?.name && <span className="truncate max-w-[120px]">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</span>}
                                                        <span>{offspringList.length} born</span>
                                                        {coi != null && <span className="text-gray-500">COI {coi.toFixed(2)}%</span>}
                                                        {offspringList.length > 0 && (
                                                            <span className="inline-flex gap-0.5 font-semibold">
                                                                <span className="text-blue-500">{maleCount}M</span>
                                                                <span className="text-gray-400">/</span>
                                                                <span className="text-pink-500">{femaleCount}F</span>
                                                                <span className="text-gray-400">/</span>
                                                                <span className="text-purple-500">{unknownCount}U</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Desktop: 4-column grid */}
                                                <div className="hidden sm:grid flex-1 grid-cols-4 gap-3 items-center min-w-0">
                                                    <div>
                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Birth</span>
                                                        <span className="text-sm font-semibold text-gray-800">{formatDate(litter.birthDate) || '•'}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Mate</span>
                                                        <span className="text-sm font-semibold text-gray-800 truncate block">{mate ? [mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ') : '•'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">COI</span>
                                                        <span className="text-sm font-semibold text-gray-800">{coi != null ? `${coi.toFixed(2)}%` : '•'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Born</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-sm font-bold text-gray-800">{offspringList.length}</span>
                                                            {offspringList.length > 0 && (
                                                                <span className="text-xs ml-1">
                                                                    <span className="text-blue-500 font-semibold">{maleCount}M</span>
                                                                    <span className="text-gray-400 mx-0.5">/</span>
                                                                    <span className="text-pink-500 font-semibold">{femaleCount}F</span>
                                                                    <span className="text-gray-400 mx-0.5">/</span>
                                                                    <span className="text-purple-500 font-semibold">{unknownCount}U</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronDown size={18} className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                            {isExpanded && (
                                                <div className="border-t border-purple-100 p-3 bg-purple-50 space-y-3">
                                                    {/* Birthdate | COI | Mate */}
                                                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-start sm:items-center">
                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm h-full">
                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Birth Date</div>
                                                            {litter.birthDate
                                                                ? <div className="text-sm font-bold text-gray-800">{formatDate(litter.birthDate)}</div>
                                                                : <div className="text-sm text-gray-400 italic">•</div>}
                                                        </div>
                                                        <div className="flex flex-col items-center px-2">
                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">COI</div>
                                                            {coi != null ? <div className="text-base font-medium text-gray-800">{coi.toFixed(2)}%</div> : <div className="text-base font-medium text-gray-300">•</div>}
                                                        </div>
                                                        {mate ? (
                                                            <div onClick={() => onViewAnimal && onViewAnimal(mate)} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition shadow-sm">
                                                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                    {mate.imageUrl || mate.photoUrl
                                                                        ? <img src={mate.imageUrl || mate.photoUrl} alt={mate.name} className="w-full h-full object-cover" />
                                                                        : <div className="w-full h-full flex items-center justify-center text-gray-400"><Cat size={18} /></div>}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mate</div>
                                                                    <p className="font-bold text-gray-800 truncate text-sm">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</p>
                                                                    <p className="text-xs text-gray-500">{mate.species}</p>
                                                                    <p className="text-[10px] text-gray-400 font-mono">{mate.id_public}</p>
                                                                </div>
                                                            </div>
                                                        ) : <div className="text-base font-medium text-gray-300">•</div>}
                                                    </div>
                                                    {/* Stats */}
                                                    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                        <div className="grid grid-cols-4 gap-3">
                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Born</div><div className="text-lg font-bold text-gray-800">{offspringList.length}</div></div>
                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Males</div><div className="text-lg font-bold text-blue-500">{maleCount}</div></div>
                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Females</div><div className="text-lg font-bold text-pink-500">{femaleCount}</div></div>
                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Unknown</div><div className="text-lg font-bold text-purple-500">{unknownCount}</div></div>
                                                        </div>
                                                    </div>
                                                    {/* Offspring cards */}
                                                    {offspringList.length > 0 && (
                                                        <div className="bg-white p-3 rounded border border-purple-100">
                                                            <div className="text-sm font-semibold text-gray-700 mb-3">Offspring ({offspringList.length})</div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                                {offspringList.map(offspring => (
                                                                    <div key={offspring.id_public || offspring._id} onClick={() => onViewAnimal && onViewAnimal(offspring)} className="relative bg-white rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 border-gray-200 pt-2">
                                                                        {offspring.gender && (
                                                                            <div className="absolute top-1.5 right-1.5">
                                                                                {offspring.gender === 'Male'
                                                                                    ? <Mars size={14} strokeWidth={2.5} className="text-primary" />
                                                                                    : <Venus size={14} strokeWidth={2.5} className="text-accent" />
                                                                                }
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                            {offspring.imageUrl || offspring.photoUrl ? (
                                                                                <img src={offspring.imageUrl || offspring.photoUrl} alt={offspring.name} className="w-20 h-20 object-cover rounded-md" />
                                                                            ) : (
                                                                                <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                                                    <Cat size={32} />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="w-full text-center px-2 pb-1">
                                                                            <div className="text-sm font-semibold text-gray-800 truncate">
                                                                                {[offspring.prefix, offspring.name, offspring.suffix].filter(Boolean).join(' ')}
                                                                            </div>
                                                                        </div>
                                                                        <div className="w-full px-2 pb-2 flex justify-end">
                                                                            <div className="text-xs text-gray-500">{offspring.id_public}</div>
                                                                        </div>
                                                                        <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                                                            <div className="text-xs font-medium text-gray-700">{offspring.status || offspring.gender || 'Unknown'}</div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                            })}
                        </div>}
                    </div>
                );
            })()}
        </div>
    );
};
