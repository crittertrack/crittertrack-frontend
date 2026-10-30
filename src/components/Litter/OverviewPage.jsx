import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import { Circle, Eye, EyeOff, Edit, Loader2, Mars, Venus, Plus, Search, BookOpen } from 'lucide-react';
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

// Cards are always white; the status shows through the border colour and the badge.
const STATUS_COLORS = {
    planned: 'border-indigo-300 dark:border-indigo-800/60 bg-white dark:bg-dark-card-bg',
    mated: 'border-sky-300 dark:border-sky-800/60 bg-white dark:bg-dark-card-bg',
    pregnant: 'border-pink-300 dark:border-pink-800/60 bg-white dark:bg-dark-card-bg',
    born: 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg',
};

// The app's coloured gender icons (same colours as the animal cards and lists).
const GENDER_ICON_PROPS = { size: 14, strokeWidth: 2.5, className: 'shrink-0' };
const MaleIcon = ({ size = 14 }) => <Mars {...GENDER_ICON_PROPS} size={size} className="text-primary shrink-0" />;
const FemaleIcon = ({ size = 14 }) => <Venus {...GENDER_ICON_PROPS} size={size} className="text-accent shrink-0" />;
const UnknownIcon = ({ size = 14 }) => <Circle {...GENDER_ICON_PROPS} size={size} className="text-gray-500 dark:text-dark-text-muted shrink-0" />;

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

const ParentLine = ({ icon, label, animal, fallbackId, onView }) => (
    <div className="flex items-center gap-1.5 text-sm min-w-0">
        {icon}
        <span className="text-gray-500 dark:text-dark-text-muted text-xs">{label}:</span>
        {animal || fallbackId ? (
            <button
                type="button"
                onClick={() => onView && onView(animal || { id_public: fallbackId })}
                className="truncate text-left font-medium text-gray-800 dark:text-dark-text hover:underline"
            >
                {animal ? formatAnimalDisplayName(animal) : fallbackId}
            </button>
        ) : (
            <span className="text-gray-400 dark:text-dark-text-muted">Unknown</span>
        )}
    </div>
);

const LitterCard = ({
    litter,
    status,
    offspring,
    onTogglePublic,
    onQuickAction,
    onEdit,
    onDetails,
    onViewAnimal,
    coiCalculating = false,
}) => {
    const quick = getQuickAction(status);
    const coi = litter.inbreedingCoefficient;
    const males = litter.maleCount ?? 0;
    const females = litter.femaleCount ?? 0;
    const unknown = litter.unknownCount ?? 0;
    const total = litter.numberBorn ?? (males + females + unknown);
    const dateLabel = litter.birthDate
        ? `Born ${formatDateShort(litter.birthDate)}`
        : litter.pregnancyDate
            ? `Pregnant since ${formatDateShort(litter.pregnancyDate)}`
            : litter.matingDate
                ? `${status === 'planned' ? 'Planned mating' : 'Mated'} ${formatDateShort(litter.matingDate)}`
                : 'No dates set';

    return (
        <div data-testid="litter-card" className={`rounded-xl border p-4 shadow-sm flex flex-col gap-3 ${getStatusColor(status)}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-dark-text truncate">
                        {litter.breedingPairCodeName || litter.litter_id_public || 'Litter'}
                    </div>
                    {litter.litter_id_public && (
                        <div className="text-xs text-gray-500 dark:text-dark-text-muted">{litter.litter_id_public}</div>
                    )}
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeBg(status)}`}>
                    {LITTER_STATUS_LABELS[status] || status}
                </span>
            </div>

            <div className="space-y-1">
                <ParentLine
                    icon={<MaleIcon />}
                    label="Sire" animal={litter.sire} fallbackId={litter.sireId_public} onView={onViewAnimal}
                />
                <ParentLine
                    icon={<FemaleIcon />}
                    label="Dam" animal={litter.dam} fallbackId={litter.damId_public} onView={onViewAnimal}
                />
            </div>

            <div className="text-xs text-gray-600 dark:text-dark-text-secondary space-y-0.5">
                <div>{dateLabel}</div>
                {(status === 'born' || total > 0) && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span>{total} born</span>
                        <span className="inline-flex items-center gap-1"><MaleIcon size={12} />{males}</span>
                        <span className="inline-flex items-center gap-1"><FemaleIcon size={12} />{females}</span>
                        {unknown > 0 && <span className="inline-flex items-center gap-1"><UnknownIcon size={12} />{unknown}</span>}
                    </div>
                )}
                {Array.isArray(offspring) && offspring.length > 0 && (
                    <div>{offspring.length} offspring linked</div>
                )}
                {coiCalculating ? (
                    <div className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Calculating COI…</div>
                ) : coi != null ? (
                    <div>COI: {Number(coi).toFixed(2)}%</div>
                ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
                {quick && (
                    <button
                        type="button"
                        onClick={() => onQuickAction(litter, quick.action)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white ${quick.color}`}
                    >
                        {quick.label}
                    </button>
                )}
                <button type="button" onClick={() => onDetails(litter)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text flex items-center gap-1">
                    <BookOpen size={12} /> Details
                </button>
                <button type="button" onClick={() => onEdit(litter)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text flex items-center gap-1">
                    <Edit size={12} /> Edit
                </button>
                <button
                    type="button"
                    onClick={() => onTogglePublic(litter)}
                    title={litter.isDisplayLitter ? 'Public — click to hide' : 'Private — click to make public'}
                    className="ml-auto p-1.5 rounded-lg border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text"
                >
                    {litter.isDisplayLitter ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
            </div>
        </div>
    );
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
    const navigate = useNavigate();
    const [litters, setLitters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [litterStatusFilter, setLitterStatusFilter] = useState('all');
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [litterOffspringMap, setLitterOffspringMap] = useState({});
    const [coiCacheRef] = useState({});
    const [coiCalculating, setCoiCalculating] = useState(new Set());

    const viewAnimal = onViewAnimal || handleViewAnimal;
    const getStatus = (litter) => deriveStoredStatus(litter);

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

            // GET /animals ignores an `ids` param (it returns all of the user's animals), so don't
            // send hundreds of IDs in the URL. Only IDs not owned by the user are looked up
            // publicly, in chunks to keep each URL well under proxy length limits.
            const anyAnimals = await apiClient.get('/animals').catch(() => ({ data: [] }));
            const anyMap = new Map((anyAnimals.data || []).map(a => [a.id_public, a]));

            const missingIds = [...parentIds].filter(id => !anyMap.has(id));
            const CHUNK_SIZE = 100;
            const chunks = [];
            for (let i = 0; i < missingIds.length; i += CHUNK_SIZE) chunks.push(missingIds.slice(i, i + CHUNK_SIZE));
            const publicResults = await Promise.all(
                chunks.map(ids => apiClient.get('/public/animals', { params: { ids } }).catch(() => ({ data: [] })))
            );
            const publicMap = new Map(publicResults.flatMap(r => r.data || []).map(a => [a.id_public, a]));
            const getParent = (id_public) => (id_public && (anyMap.get(id_public) || publicMap.get(id_public))) || null;

            const enriched = littersData.map(litter => ({
                ...litter,
                sire: getParent(litter.sireId_public),
                dam: getParent(litter.damId_public),
            }));
            setLitters(enriched);
            if (setCachedLitters) setCachedLitters(enriched);

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
    }, [showModalMessage, setLitterCacheTimestamp, setCachedLitters, coiCacheRef]);

    useEffect(() => {
        fetchLitters();
    }, [fetchLitters]);

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
            await Promise.all([
                apiClient.put(`/litters/${litter._id}`, { pregnancyDate: today }),
                apiClient.put(`/animals/${litter.damId_public}`, { isPregnant: true, isInMating: false }),
            ]);
            await fetchLitters();
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

    const handleQuickAction = (litter, action) => {
        const status = getStatus(litter);
        if (action === 'mated' && status === 'planned') return handleMarkAsMated(litter);
        if (action === 'pregnant' && status === 'mated') return handleMarkAsPregnant(litter);
        if (action === 'born' && status === 'pregnant') return handleMarkAsBorn(litter);
        if (action === 'weaned' && status === 'born') return handleMarkAsWeaned(litter);
    };

    const availableYears = useMemo(() => {
        const years = litters.map(l => l.birthDate || l.matingDate || l.pairingDate).filter(Boolean).map(d => { const p = new Date(d); return isNaN(p.getTime()) ? null : p.getFullYear(); }).filter(Boolean);
        return [...new Set(years)].sort((a, b) => b - a);
    }, [litters]);

    const availableSpeciesInLitters = useMemo(() => {
        const speciesSet = new Set();
        litters.forEach(litter => { const species = litter.sire?.species || litter.dam?.species || litter.species; if (species) speciesSet.add(species); });
        const known = DEFAULT_SPECIES_OPTIONS.filter(s => speciesSet.has(s));
        const extra = [...speciesSet].filter(s => !DEFAULT_SPECIES_OPTIONS.includes(s)).sort();
        return [...known, ...extra];
    }, [litters]);

    const filteredLitters = useMemo(() => {
        return litters.filter(litter => {
            const sire = litter.sire || null; const dam = litter.dam || null;
            if (litterStatusFilter !== 'all') { const status = deriveStoredStatus(litter); if (status !== litterStatusFilter) return false; }
            if (speciesFilter) { if ((sire?.species || dam?.species || litter.species) !== speciesFilter) return false; }
            if (yearFilter) { const ref = litter.birthDate || litter.matingDate || litter.pairingDate; if (!ref) return false; const p = new Date(ref); const y = isNaN(p.getTime()) ? null : p.getFullYear(); if (!y || y.toString() !== yearFilter) return false; }
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            const has = (v) => v != null && v.toString().toLowerCase().includes(q);
            return has(litter.litter_id_public) || has(litter.breedingPairCodeName)
                || has(sire?.name) || has(sire?.id_public) || has(litter.sireId_public)
                || has(dam?.name) || has(dam?.id_public) || has(litter.damId_public);
        }).sort((a, b) => {
            const rank = (s) => s === 'pregnant' ? 0 : s === 'mated' ? 1 : s === 'planned' ? 2 : 3;
            const ar = rank(deriveStoredStatus(a)); const br = rank(deriveStoredStatus(b));
            if (ar !== br) return ar - br;
            const ad = (a.birthDate || a.matingDate) ? new Date(a.birthDate || a.matingDate).getTime() : null;
            const bd = (b.birthDate || b.matingDate) ? new Date(b.birthDate || b.matingDate).getTime() : null;
            if (ad === null && bd === null) return 0; if (ad === null) return 1; if (bd === null) return -1;
            return bd - ad;
        });
    }, [litters, searchQuery, litterStatusFilter, speciesFilter, yearFilter]);

    const litterStats = filteredLitters.reduce((acc, l) => { acc.litters++; acc.males += l.maleCount ?? 0; acc.females += l.femaleCount ?? 0; acc.unknown += l.unknownCount ?? 0; return acc; }, { litters: 0, males: 0, females: 0, unknown: 0 });

    const goEdit = (litter) => navigate(`/litters/${encodeURIComponent(litter.litter_id_public || litter._id)}/edit`);
    const goDetails = (litter) => navigate(`/litters/${encodeURIComponent(litter.litter_id_public || litter._id)}`);
    const goNew = () => navigate('/litters/new');

    const selectClass = 'px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card-bg text-gray-800 dark:text-dark-text';

    return (
        <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
        <div className="bg-white dark:bg-dark-card-bg border border-transparent dark:border-dark-text-muted rounded-xl shadow-lg p-3 sm:p-6 space-y-4" data-testid="litters-container">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text">Litters</h1>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                        Record planned matings, track pregnancies, and log litters with offspring counts and details.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={goNew}
                    className="px-4 py-2 rounded-lg bg-primary dark:bg-dark-primary text-black text-sm font-medium flex items-center gap-1 shadow-md"
                >
                    <Plus size={16} /> Add Entry
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by ID, pair name, sire or dam…"
                        className={`${selectClass} w-full pl-9`}
                    />
                </div>
                <select value={litterStatusFilter} onChange={(e) => setLitterStatusFilter(e.target.value)} className={selectClass}>
                    <option value="all">All statuses</option>
                    {Object.entries(LITTER_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
                <select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)} className={selectClass}>
                    <option value="">All species</option>
                    {availableSpeciesInLitters.map(s => (
                        <option key={s} value={s}>{getSpeciesDisplayName(s)}</option>
                    ))}
                </select>
                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className={selectClass}>
                    <option value="">All years</option>
                    {availableYears.map(y => (
                        <option key={y} value={String(y)}>{y}</option>
                    ))}
                </select>
            </div>

            {!loading && litters.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-700 dark:text-dark-text" data-testid="litter-stats">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                        <BookOpen size={14} strokeWidth={2.5} className="shrink-0" />
                        {litterStats.litters} {litterStats.litters === 1 ? 'litter' : 'litters'}
                    </span>
                    <span className="inline-flex items-center gap-1.5" title="Males"><MaleIcon />{litterStats.males}</span>
                    <span className="inline-flex items-center gap-1.5" title="Females"><FemaleIcon />{litterStats.females}</span>
                    <span className="inline-flex items-center gap-1.5" title="Unknown sex"><UnknownIcon />{litterStats.unknown}</span>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-16 text-gray-500 dark:text-dark-text-muted">
                    <Loader2 className="animate-spin mr-2" size={20} /> Loading litters…
                </div>
            ) : litters.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-dark-text-muted">
                    <p className="mb-3">You haven't added any litter entries yet.</p>
                    <button type="button" onClick={goNew} className="px-4 py-2 rounded-lg bg-primary dark:bg-dark-primary text-black text-sm font-medium">
                        Add your first entry
                    </button>
                </div>
            ) : filteredLitters.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-dark-text-muted">No litters match your filters.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLitters.map(litter => (
                        <LitterCard
                            key={litter._id}
                            litter={litter}
                            status={getStatus(litter)}
                            offspring={litterOffspringMap[litter._id]}
                            onTogglePublic={toggleLitterPublic}
                            onQuickAction={handleQuickAction}
                            onEdit={goEdit}
                            onDetails={goDetails}
                            onViewAnimal={viewAnimal}
                            coiCalculating={coiCalculating.has(litter._id)}
                        />
                    ))}
                </div>
            )}
        </div>
        </div>
    );
};

export default LittersOverviewPage;
