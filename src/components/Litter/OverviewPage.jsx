import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../../utils/apiClient';
import { Eye, EyeOff, Edit, Link, Loader2, Mars, Venus, Plus, Search, BookOpen } from 'lucide-react';
import { formatDateShort } from '../../utils/dateFormatter';
import { deriveStoredStatus, LITTER_STATUS_LABELS } from '../../utils/litterStatus';
import { formatAnimalDisplayName } from '../../utils/animalDisplayName';

const DEFAULT_SPECIES_OPTIONS = ['Fancy Mouse', 'Fancy Rat', 'Russian Dwarf Hamster', 'Campbells Dwarf Hamster', 'Chinese Dwarf Hamster', 'Syrian Hamster', 'Guinea Pig'];

const getSpeciesDisplayName = (species) => {
    const displayNames = {
        'Fancy Mouse': 'Fancy Mice', 'Mouse': 'Fancy Mice',
        'Fancy Rat': 'Fancy Rats', 'Rat': 'Fancy Rats',
        'Russian Dwarf Hamster': 'Russian Dwarf Hamsters',
        'Campbells Dwarf Hamster': 'Campbells Dwarf Hamsters',
        'Chinese Dwarf Hamster': 'Chinese Dwarf Hamsters',
        'Syrian Hamster': 'Syrian Hamsters', 'Hamster': 'Hamsters',
        'Guinea Pig': 'Guinea Pigs'
    };
    return displayNames[species] || species;
};

const STATUS_COLORS = {
    planned: 'border-indigo-300 dark:border-indigo-800/60 bg-indigo-50/20 dark:bg-indigo-900/10',
    mated: 'border-sky-300 dark:border-sky-800/60 bg-sky-50/20 dark:bg-sky-900/10',
    pregnant: 'border-pink-300 dark:border-pink-800/60 bg-pink-50/20 dark:bg-pink-900/10',
    born: 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg',
};

const STATUS_BADGE_BG = {
    planned: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    mated: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
    pregnant: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    born: 'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-dark-text',
};

const QUICK_ACTIONS = {
    planned: { label: 'Mark Mated', action: 'mated', color: 'bg-indigo-600 hover:bg-indigo-700' },
    mated: { label: 'Mark Pregnant', action: 'pregnant', color: 'bg-sky-600 hover:bg-sky-700' },
    pregnant: { label: 'Mark Born', action: 'born', color: 'bg-pink-600 hover:bg-pink-700' },
    born: { label: 'Mark Weaned', action: 'weaned', color: 'bg-gray-600 hover:bg-gray-700' },
};

const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.born;
const getBadgeBg = (status) => STATUS_BADGE_BG[status] || STATUS_BADGE_BG.born;
const getQuickAction = (status) => QUICK_ACTIONS[status] || null;

const LitterCard = ({
    litter,
    onTogglePublic,
    onQuickAction,
    onEdit,
    onDetails,
    coiCalculating = false,
}) => {
    return null;
};

const LittersOverviewPage = ({
    authToken,
    API_BASE_URL,
    userProfile,
    setUserProfile,
    showModalMessage,
    onViewAnimal,
    handleViewAnimal,
    handleEditAnimal,
    speciesOptions = [],
    cachedLitters,
    setCachedLitters,
    litterCacheTimestamp,
    setLitterCacheTimestamp,
    breedingLineDefs = [],
    animalBreedingLines = {},
}) => {
    const [litters, setLitters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [litterStatusFilter, setLitterStatusFilter] = useState('all');
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [litterOffspringMap, setLitterOffspringMap] = useState({});
    const [coiCacheRef] = useState({});
    const [coiCalculating, setCoiCalculating] = useState(new Set());
    const handleMarkAsMated = async (litter) => {
        if (!litter.sireId_public || !litter.damId_public) {
            showModalMessage('Error', 'This litter needs both a sire and a dam before it can be marked as mated.');
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        try {
            await apiClient.put(`/litters/${litter._id}`, { matingDate: today, isPlanned: false });
            await fetchLitters();
            window.dispatchEvent(new Event('animals-changed'));
        } catch (err) {
            showModalMessage('Error', 'Failed to mark as mated.');
        }
    };

    const handleMarkAsPregnant = async (litter) => {
        if (!litter.damId_public) {
            showModalMessage('Error', 'This litter has no dam assigned.');
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        try {
const availableYears = useMemo(() => {
        const years = litters.map(l => l.birthDate || l.matingDate || l.pairingDate).filter(Boolean).map(d => { const p = new Date(d); return isNaN(p.getTime()) ? null : p.getFullYear(); }).filter(Boolean);
        return [...new Set(years)].sort((a, b) => b - a);
    }, [litters]);

    const availableSpeciesInLitters = useMemo(() => {
        const speciesSet = new Set();
        litters.forEach(litter => { const species = litter.sire?.species || litter.dam?.species || litter.species; if (species) speciesSet.add(species); });
        return DEFAULT_SPECIES_OPTIONS.filter(s => speciesSet.has(s));
    }, [litters]);

    const filteredLitters = useMemo(() => {
        return litters.filter(litter => {
            const sire = litter.sire || null; const dam = litter.dam || null;
            if (litterStatusFilter !== 'all') { const status = getStatus(litter); if (status !== litterStatusFilter) return false; }
            if (speciesFilter) { if ((sire?.species || dam?.species) !== speciesFilter) return false; }
            if (yearFilter) { const ref = litter.birthDate || litter.matingDate || litter.pairingDate; if (!ref) return false; const p = new Date(ref); const y = isNaN(p.getTime()) ? null : p.getFullYear(); if (!y || y.toString() !== yearFilter) return false; }
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            if (litter.litter_id_public?.toLowerCase().includes(q)) return true;
            if (litter.breedingPairCodeName?.toLowerCase().includes(q)) return true;
            if (sire?.name?.toLowerCase().includes(q)) return true;
            if (sire?.id_public?.toString().includes(q)) return true;
            if (litter.sireId_public?.toString().includes(q)) return true;
            if (dam?.name?.toLowerCase().includes(q)) return true;
            if (dam?.id_public?.toString().includes(q)) return true;
            if (litter.damId_public?.toString().includes(q)) return true;
            return false;
        }).sort((a, b) => {
            const rank = (s) => s === 'pregnant' ? 0 : s === 'mated' ? 1 : s === 'planned' ? 2 : 3;
            const ar = rank(getStatus(a)); const br = rank(getStatus(b));
            if (ar !== br) return ar - br;
            const ad = (a.birthDate || a.matingDate) ? new Date(a.birthDate || a.matingDate).getTime() : null;
            const bd = (b.birthDate || b.matingDate) ? new Date(b.birthDate || b.matingDate).getTime() : null;
            if (ad === null && bd === null) return 0; if (ad === null) return 1; if (bd === null) return -1;
            return bd - ad;
        });
    }, [litters, searchQuery, litterStatusFilter, speciesFilter, yearFilter]);

    const litterStats = filteredLitters.reduce((acc, l) => { acc.litters++; acc.males += l.maleCount ?? 0; acc.females += l.femaleCount ?? 0; acc.unknown += l.unknownCount ?? 0; return acc; }, { litters: 0, males: 0, females: 0, unknown: 0 });
            await Promise.all([
                apiClient.put(`/litters/${litter._id}`, { pregnancyDate: today }),
                apiClient.put(`/animals/${litter.damId_public}`, { isPregnant: true, isInMating: false }),
            ]);
            await Promise.all([fetchLitters()]);
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: litter.damId_public, isPregnant: true, isInMating: false } }));
        } catch (err) {
            showModalMessage('Error', 'Failed to mark dam as pregnant.');
        }
    };

    const handleMarkAsBorn = async (litter) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await apiClient.put(`/litters/${litter._id}`, { birthDate: today });
            try { await apiClient.put(`/animals/${litter.damId_public}`, { isPregnant: false, isNursing: true }); } catch {}
            await fetchLitters();
        } catch (err) {
            showModalMessage('Error', 'Failed to mark as born.');
        }
    };

    const handleMarkAsWeaned = async (litter) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await apiClient.put(`/litters/${litter._id}`, { weaningDate: today, weaningConfirmed: true });
            await fetchLitters();
        } catch (err) {
            showModalMessage('Error', 'Failed to mark as weaned.');
        }
    };

    const toggleLitterPublic = async (litter) => {
        const newVal = !litter.isDisplayLitter;
        setLitters(prev => prev.map(l => l._id === litter._id ? { ...l, isDisplayLitter: newVal } : l));
        try { await apiClient.put(`/litters/${litter._id}`, { isDisplayLitter: newVal }); } catch (err) {
            setLitters(prev => prev.map(l => l._id === litter._id ? { ...l, isDisplayLitter: !newVal } : l));
            showModalMessage('Error', 'Failed to update visibility.');
        }
    };

    const getStatus = (litter) => deriveStoredStatus(litter);

    const handleQuickAction = (litter, action) => {
        const status = getStatus(litter);
        if (action === 'mated' && status === 'planned') return handleMarkAsMated(litter);
        if (action === 'pregnant' && status === 'mated') return handleMarkAsPregnant(litter);
        if (action === 'born' && status === 'pregnant') return handleMarkAsBorn(litter);
        if (action === 'weaned' && status === 'born') return handleMarkAsWeaned(litter);
    };
    const fetchLitters = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/litters');
            const littersData = Array.isArray(response.data) ? response.data : [];
            if (setLitterCacheTimestamp) setLitterCacheTimestamp(Date.now());

            const parentIds = new Set();
            littersData.forEach(l => {
                if (l.sireId_public) parentIds.add(l.sireId_public);
                if (l.damId_public) parentIds.add(l.damId_public);
            });

            const [anyAnimals, publicAnimals] = await Promise.all([
                apiClient.get('/animals', { params: { ids: [...parentIds] } }).catch(() => ({ data: [] })),
                apiClient.get('/public/animals', { params: { ids: [...parentIds] } }).catch(() => ({ data: [] })),
            ]);
            const anyMap = new Map((anyAnimals.data || []).map(a => [a.id_public, a]));
            const publicMap = new Map((publicAnimals.data || []).map(a => [a.id_public, a]));
            const getParent = (id_public) => (id_public && (anyMap.get(id_public) || publicMap.get(id_public))) || null;

            const enriched = littersData.map(litter => ({
                ...litter,
                sire: getParent(litter.sireId_public),
                dam: getParent(litter.damId_public),
            }));
            setLitters(enriched);

            if (setLitterCacheTimestamp) setLitterCacheTimestamp(Date.now());

            const littersNeedingCOI = enriched.filter(l => {
                if (!l.sireId_public || !l.damId_public) return false;
                if (l.inbreedingCoefficient != null) return false;
                const cacheKey = `${l.sireId_public}:${l.damId_public}`;
                if (coiCacheRef[cacheKey] != null) {
                    setLitters(prev => prev.map(x => x._id === l._id ? { ...x, inbreedingCoefficient: coiCacheRef[cacheKey] } : x));
                    return false;
                }
                return true;
            });

            if (littersNeedingCOI.length > 0) {
                setCoiCalculating(new Set(littersNeedingCOI.map(l => l._id)));
                littersNeedingCOI.forEach(async (litter) => {
                    const cacheKey = `${litter.sireId_public}:${litter.damId_public}`;
                    const coiController = new AbortController();
                    const timeout = setTimeout(() => coiController.abort(), 15000);
                    try {
                        const coiResponse = await apiClient.get('/animals/inbreeding/pairing', {
                            params: { sireId: litter.sireId_public, damId: litter.damId_public, generations: 20 },
                            signal: coiController.signal,
                        });
                        const coi = coiResponse.data.inbreedingCoefficient ?? 0;
                        coiCacheRef[cacheKey] = coi;
                        setLitters(prev => prev.map(l => l._id === litter._id ? { ...l, inbreedingCoefficient: coi } : l));
                        apiClient.put(`/litters/${litter._id}`, { inbreedingCoefficient: coi }).catch(() => {});
                    } catch { coiCacheRef[cacheKey] = 0; }
                    finally {
                        clearTimeout(timeout);
                        setCoiCalculating(prev => { const next = new Set(prev); next.delete(litter._id); return next; });
                    }
                });
            }

            enriched.forEach(litter => {
                apiClient.get(`/litters/${litter.litter_id_public}/offspring`).then(res => {
                    const offspring = Array.isArray(res.data) ? res.data : [];
                    setLitterOffspringMap(prev => ({ ...prev, [litter._id]: offspring }));
                }).catch(() => {
                    setLitterOffspringMap(prev => ({ ...prev, [litter._id]: [] }));
                });
            });
        } catch (err) {
            showModalMessage('Error', 'Failed to load litters.');
        } finally {
            setLoading(false);
        }
    }, [showModalMessage, setLitterCacheTimestamp, coiCacheRef]);

    useEffect(() => {
        fetchLitters();
    }, [fetchLitters]);
    return null;
};
export default LittersOverviewPage;