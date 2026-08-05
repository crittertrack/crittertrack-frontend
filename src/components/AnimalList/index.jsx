import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import ArchiveScreen from '../ArchiveScreen';
import NotificationPanel from '../Notifications/NotificationPanel';
import EnclosureDetailModal from '../EnclosureDetailModal'; // Import new modal
import AnimalImage from '../shared/AnimalImage';
import {
    Activity, AlertCircle, AlertTriangle, Archive, ArrowLeftRight, ArrowDown, ArrowUp, Ban, Info,
    Bell, Bird, Bug, Bean, Building, Calendar, Cat, Check, ChevronDown, ChevronLeft, ChevronRight, Dna, Hourglass, Star,
    ChevronUp, MoreVertical, Circle, ClipboardList, Edit, Eye, EyeOff, Fish, Flag, FolderOpen, Heart, HeartOff, Settings, Users, PawPrint,
    Home, LayoutGrid, Loader2, LockOpen, MapPin, Mars, MessageSquare, Pin, Network, Droplet, ScanHeart, LampCeiling, BarChart2, Thermometer, Worm,
    Package, Plus, PlusCircle, RefreshCw, Ruler, Save, Search, ShoppingBag, SkipForward, SlidersHorizontal, Utensils,
    Sparkles, Trash2, Turtle, Venus, VenusAndMars, Wrench, X, Scissors, Dumbbell
} from 'lucide-react';
import FamilyTreeView from '../FamilyTree/FamilyTreeView';
import { formatDate, formatDateShort, calculateBreedingAge, formatLocalDate, parseLocalDate, isStatusPeriodActive } from '../../utils/dateFormatter';
import { resolveDuplicateLitter } from '../../utils/litterDuplicate';
import { computeIsInTreatment, HEALTH_STATUS_TEXT_COLORS, remapLegacyHealthStatus } from '../../utils/medicalStatus';
import DatePicker from '../DatePicker';
import EnclosureModal from '../EnclosureModal';
import LocationManagerModal from './LocationManagerModal';
import AssignHealthStatusModal from './AssignHealthStatusModal';

import { getSpeciesLatinName } from '../../utils/speciesUtils';
import { prefetchPedigreeTree } from '../AnimalForm';
import { ALERT_CATEGORIES } from '../../utils/alertCategories';
import { GROOMING_SCHEDULE_DEFS, TRAINING_SCHEDULE_DEFS } from '../../utils/scheduleFieldDefs';
import { getUserKey } from '../../utils/userKey';

import AnimalModalV2 from '../AnimalDetail/AnimalModalV2';

const API_BASE_URL = '/api';
const FAMILY_TREE_MIN_WIDTH = 900;

const GENDER_OPTIONS = ['All Genders', 'Male', 'Female', 'Intersex', 'Mixed', 'Unknown'];
const STATUS_OPTIONS = ['Pet', 'Growout', 'Breeder', 'Available', 'Booked', 'Retired', 'Deceased', 'Rehomed', 'Unknown'];

const normalizeAnimalView = (value) =>
    ['collections', 'enclosures', 'reproduction', 'health', 'feeding', 'familyTree'].includes(value) ? value : 'list';

const DEFAULT_LIST_COLUMNS = { animal: true, species: true, variety: true, enclosure: true, lifeStage: true, status: true, health: true, birthdateAge: true, breedingLines: true, tags: true };

// Shared "Health" column renderer for the list/collection table views \u2014 Quarantine/Treatment
// take priority as the most actionable state, otherwise falls back to the derived health status
// pill (healthStatusOverride || healthStatus, computed server-side, see medicalStatus.js).
const renderHealthColumnCell = (animal) => {
    if (animal.isQuarantine) return <span className="font-medium text-orange-600">Quarantine</span>;
    if (animal.isInTreatment) return <span className="font-medium text-red-600">Treatment</span>;
    if (animal.status === 'Deceased') return <span className="text-gray-500">Deceased</span>;
    const status = remapLegacyHealthStatus(animal.healthStatusOverride || animal.healthStatus) || 'Healthy';
    return <span className={`font-medium ${HEALTH_STATUS_TEXT_COLORS[status] || HEALTH_STATUS_TEXT_COLORS.Healthy}`}>{status}</span>;
};

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

const getSpeciesCategory = (species) => {
    if (!species) return 'Other';
    const s = species.toLowerCase();
    if (s.includes('mouse') || s.includes('rat') || s.includes('hamster') || s.includes('guinea pig')) {
        return 'Mammal';
    }
    if (s.includes('snake') || s.includes('lizard') || s.includes('gecko') || s.includes('turtle')) {
        return 'Reptile';
    }
    if (s.includes('parrot') || s.includes('finch') || s.includes('bird')) {
        return 'Bird';
    }
    if (s.includes('frog') || s.includes('salamander') || s.includes('axolotl')) {
        return 'Amphibian';
    }
    if (s.includes('fish')) {
        return 'Fish';
    }
    if (s.includes('tarantula') || s.includes('scorpion') || s.includes('spider') || s.includes('invertebrate')) {
        return 'Invertebrate';
    }
    return 'Other';
};

const formatTime12h = (time24) => {
    if (!time24) return '...';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
};

const formatDimensions = (dim, size) => {
    if (dim && (dim.length || dim.width || dim.height)) {
        return `${dim.length || '?'}x${dim.width || '?'}x${dim.height || '?'} ${dim.unit || ''}`;
    }
    return size || null;
};

const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try { return formatDateShort(dateStr); } catch(e) { return dateStr; }
};

const BreedingLineManagerModal = ({ lines, onClose, onClearLine }) => {
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60" onClick={onClose}>
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3 pb-3 border-b dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Manage Breeding Lines</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover"><X size={20} /></button>
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {(lines || []).filter(l => l.name).map(line => (
                        <div key={line.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 dark:border-dark-border dark:hover:bg-dark-surface-hover">
                            <div className="flex items-center gap-3">
                                <span style={{ backgroundColor: line.color }} className="w-4 h-4 rounded-full border border-gray-300 dark:border-dark-border"></span>
                                <span className="font-medium text-gray-800 dark:text-dark-text">{line.name}</span>
                            </div>
                            <button onClick={() => onClearLine(line.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20" title="Clear line name and unassign from all animals">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {(lines || []).filter(l => l.name).length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-dark-text-secondary text-center py-4">No named breeding lines to manage.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// -- Module-level cache so AnimalList survives unmount/remount without refetching --
let _alCache = null;       // last animals array
let _familyTreePrefetchCacheByUser = {};
let _familyTreePrefetchLoadingByUser = {};

// Keep cache patched even while AnimalList is unmounted
if (!window.__alCacheListenerAttached) {
    window.__alCacheListenerAttached = true;
    window.addEventListener('animal-updated', (e) => {
        const u = e.detail;
        if (_alCache && u?.id_public) {
            _alCache = _alCache.map(a => a.id_public === u.id_public ? { ...a, ...u } : a);
        }
    });
    window.addEventListener('animals-changed', () => { _alCache = null; }); // bust on full reload signal
}

const AnimalList = ({ 
    authToken, 
    showModalMessage, 
    onEditAnimal, 
    onViewAnimal, 
    viewingAnimal, // Assuming parent passes this down
    onClose, // Assuming parent passes this down
    onAddSibling,
    onUpdateAnimal,
    onToggleOwned,
    userProfile,
    handleAcceptTransfer,
    handleRejectTransfer,
    onTransfer,
    onCloseAll,
    navigate,
    initialAnimalView = 'list',
    // Archive props
    showArchiveScreen,
    setShowArchiveScreen,
    // Breeding lines (display-only for cards)
    breedingLineDefs = [],
    animalBreedingLines = {},
    onBreedingLinesUpdate,
    speciesOptions = [],
    locations,
    fetchLocations
}) => {
    // Stable ref so showModalMessage (inline prop) doesn't destabilise useCallbacks
    const showModalMessageRef = useRef(showModalMessage);
    const coiCacheRef = useRef({});

    const TASK_TYPE_STYLES = {
        Cleaning: { icon: <Wrench size={12} />, color: 'text-amber-700' },
        Maintenance: { icon: <Settings size={12} />, color: 'text-orange-700' },
        Feeding: { icon: <Utensils size={12} />, color: 'text-red-700' },
        Other: { icon: <Info size={12} />, color: 'text-gray-600' },
    };


    // Per-user localStorage key prefix — scopes all persistent state to the logged-in user
    // so that switching accounts never leaks one user's collections/prefs into another's.
    const userKey = useMemo(() => getUserKey(authToken), [authToken]);
    const [returningAnimal, setReturningAnimal] = useState(false);

    const handleWithdrawTransfer = useCallback(async (transferId) => {
        if (!transferId) return;

        if (!window.confirm('Are you sure you want to withdraw this transfer request?')) {
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/transfers/${transferId}/withdraw`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'Transfer request has been withdrawn.');
            // Optimistically update the viewing animal to remove the pending transfer state
            if (onUpdateAnimal) {
                onUpdateAnimal({ ...viewingAnimal, pendingTransfer: null, pendingTransferId: undefined });
            }
        } catch (err) {
            console.error('Failed to withdraw transfer:', err);
            showModalMessage('Error', `Failed to withdraw transfer: ${err.response?.data?.message || err.message}`);
        }
    }, [API_BASE_URL, authToken, showModalMessage, viewingAnimal, onUpdateAnimal]);

    const [sortConfig, setSortConfig] = useState(() => {
        try {
            const saved = localStorage.getItem(`ct_list_sort_config_${userKey}`);
            return saved ? JSON.parse(saved) : { key: 'name', direction: 'ascending' };
        } catch {
            return { key: 'name', direction: 'ascending' };
        }
    });

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending';
        } else if (key === 'birthdate') {
            direction = 'descending'; // Default for birthdate is oldest first
        }
        const newSortConfig = { key, direction };
        setSortConfig(newSortConfig);
        try { localStorage.setItem(`ct_list_sort_config_${userKey}`, JSON.stringify(newSortConfig)); } catch {}
    };
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);
    useEffect(() => { showModalMessageRef.current = showModalMessage; });

    const [animals, setAnimalsRaw] = useState(() => _alCache || []);
    const setAnimals = useCallback((valOrFn) => {
        setAnimalsRaw(prev => {
            const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
            _alCache = next;
            return next;
        });
    }, []);
    const [allAnimalsRaw, setAllAnimalsRaw] = useState([]); // Unfiltered ? used by Management View
    const [availableAnimalsRaw, setAvailableAnimalsRaw] = useState([]); // All user-created animals with status=Available (no ownership filter)
    const [soldTransferredRaw, setSoldTransferredRaw] = useState([]); // View-only/transferred animals ? shown in Management > Sold/Transferred section
    const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
    const [soldOwnerFilter, setSoldOwnerFilter] = useState(''); // Filter sold/transferred section by recipient owner
    const [loading, setLoading] = useState(() => !_alCache);
    const [allAnimalsFetched, setAllAnimalsFetched] = useState(false); // true once Phase 2 (all animals) fetch completes
    
    // Load filters from localStorage or use defaults
    const [statusFilter, setStatusFilter] = useState(() => {
        try {
            return localStorage.getItem('animalList_statusFilter') || '';
        } catch { return ''; }
    });
    // Manual search: `searchInput` is the controlled input, `appliedNameFilter` is sent to the API
    const [searchInput, setSearchInput] = useState(() => {
        try {
            return localStorage.getItem('animalList_searchInput') || '';
        } catch { return ''; }
    });
    const [appliedNameFilter, setAppliedNameFilter] = useState(() => {
        try {
            return localStorage.getItem('animalList_appliedNameFilter') || '';
        } catch { return ''; }
    });
    const [genderFilter, setGenderFilter] = useState(() => {
        try {
            return localStorage.getItem('animalList_genderFilter') || '';
        } catch { return ''; }
    });
    // Always start with all species selected (empty array = show all)
    // Don't persist this filter to prevent newly created animals from being hidden
     const [speciesFilter, setSpeciesFilter] = useState(() => {
        try { return localStorage.getItem('animalList_speciesFilter') || ''; } catch { return ''; }
    });
    const [categoryFilter, setCategoryFilter] = useState(() => {
        try { return localStorage.getItem('animalList_categoryFilter') || ''; } catch { return ''; }
    });
    // Master species list ? all species the user has ANY animal for, never filtered
    const [allUserSpecies, setAllUserSpecies] = useState([]);
    const [statusFilterPregnant, setStatusFilterPregnant] = useState(() => {
        try {
            return localStorage.getItem('animalList_statusFilterPregnant') === 'true';
        } catch { return false; }
    });
    const [statusFilterNursing, setStatusFilterNursing] = useState(() => {
        try {
            return localStorage.getItem('animalList_statusFilterNursing') === 'true';
        } catch { return false; }
    });
    const [statusFilterMating, setStatusFilterMating] = useState(() => {
        try {
            return localStorage.getItem('animalList_statusFilterMating') === 'true';
        } catch { return false; }
    });
    const [blFilter, setBlFilter] = useState(() => {
        try {
            const saved = localStorage.getItem('animalList_blFilter');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    }); // array of line IDs to filter by (empty = no filter)
    const [ownedFilterMode, setOwnedFilterMode] = useState(() => {
        try {
            return localStorage.getItem('animalList_ownedFilterMode') || 'owned';
        } catch { return 'owned'; }
    });
    const [publicFilter, setPublicFilter] = useState(() => {
        try {
            return localStorage.getItem('animalList_publicFilter') || '';
        } catch { return ''; }
    });
    const [bulkDeleteMode, setBulkDeleteMode] = useState({}); // { species: true/false }
    const [bulkArchiveMode, setBulkArchiveMode] = useState({}); // { species: true/false }
    const [selectedAnimals, setSelectedAnimals] = useState({}); // { species: [id1, id2, ...] }
    const [collapsedSpecies, setCollapsedSpecies] = useState({}); // { species: true/false } - for mobile collapse
    const [userSpeciesOrder, setUserSpeciesOrder] = useState([]); // User's custom species order
    const [filtersExpanded, setFiltersExpanded] = useState(false); // toggle filter panel visibility
    const [defaultAnimalView, setDefaultAnimalView] = useState(() => {
        try { return localStorage.getItem('ct_default_animal_view') || 'list'; } catch { return 'list'; }
    });
    const [animalView, setAnimalView] = useState(() => {
        try {
            const saved = localStorage.getItem('ct_default_animal_view');
            return normalizeAnimalView(saved || initialAnimalView);
        } catch { return normalizeAnimalView(initialAnimalView); }
    }); // 'list' | 'collections' | 'management'
    const [isFamilyTreeEnabled, setIsFamilyTreeEnabled] = useState(() => {
        if (typeof window === 'undefined') return true;
        return window.innerWidth >= FAMILY_TREE_MIN_WIDTH;
    });
    const [collapsedMgmtSections, setCollapsedMgmtSections] = useState({ enclosures: false }); // { sectionKey: bool }
    const [collapsedMgmtGroups, setCollapsedMgmtGroups] = useState({}); // { groupKey: bool }

    const [litters, setLitters] = useState([]);

    const fetchLitters = useCallback(async () => {
        if (!authToken) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/litters`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setLitters(res.data || []);
        } catch (err) {
            console.error('[AnimalList] Failed to fetch litters:', err);
        }
    }, [authToken]);

    const fetchAnimals = useCallback(async () => {
        // Two-phase fetch: fast owned-only first, then all animals in background
        try {
            // Phase 1: fetch owned animals quickly to get content on screen
            const ownedRes = await axios.get(`${API_BASE_URL}/animals?isOwned=true`, { headers: { Authorization: `Bearer ${authToken}` } });
            let ownedData = (ownedRes.data || []).filter(a => !a.isViewOnly);

            // Cache-bust images ONLY once per session startup
            if (!fetchAnimals._cacheBusted) {
                fetchAnimals._cacheBusted = true;
                const bustImages = (data) => data.map(a => {
                    const img = a.imageUrl || a.photoUrl || null;
                    if (img) {
                        const busted = img.includes('?') ? `${img}&t=${Date.now()}` : `${img}?t=${Date.now()}`;
                        return { ...a, imageUrl: busted, photoUrl: busted };
                    }
                    return a;
                });
                ownedData = bustImages(ownedData);
            }

            setAnimals(ownedData);
            const speciesList = [...new Set(ownedData.map(a => a.species).filter(Boolean))];
            if (speciesList.length > 0) setAllUserSpecies(speciesList);
            setLoading(false);

            // Phase 2: background-fetch ALL animals so unowned toggle works instantly
            // slim=true strips heavy fields (breedingRecords, health, etc.) — list cards don't need them
            try {
                const allRes = await axios.get(`${API_BASE_URL}/animals?slim=true`, { headers: { Authorization: `Bearer ${authToken}` } });
                let allData = (allRes.data || []).filter(a => !a.isViewOnly);
                // Preserve cache-busted image URLs from phase 1
                const ownedMap = new Map(ownedData.map(a => [a.id_public || a._id, a]));
                allData = allData.map(a => {
                    const key = a.id_public || a._id;
                    return ownedMap.has(key) ? ownedMap.get(key) : a;
                });
                setAnimals(allData);
                const allSpecies = [...new Set(allData.map(a => a.species).filter(Boolean))];
                if (allSpecies.length > 0) setAllUserSpecies(allSpecies);
            } catch (err) {
                console.warn('[fetchAnimals] Background all-animals fetch failed, owned-only still shown:', err);
            } finally {
                setAllAnimalsFetched(true);
            }
        } catch (error) {
            console.error('Fetch animals error:', error);
            showModalMessageRef.current('Error', 'Failed to fetch animal list.');
            setLoading(false);
        } finally {
            // setPendingFilters(false); // This state was removed, causing a ReferenceError.
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authToken]);

    // Species list is now derived from the fetchAnimals result - no separate API call needed
    const fetchAllSpecies = useCallback(async () => {
        // No-op: species are populated as a side-effect of fetchAnimals()
        // Kept for compatibility with the animals-changed event handler
    }, []);

    // Fetch ALL user animals (no client-side filters) ? used by Management View and Collections
    const fetchAllAnimals = useCallback(async () => {
        if (!authToken) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` },
                params: { slim: 'true' }
            });
            const archivedRes = await axios.get(`${API_BASE_URL}/animals/archived`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            // Manually add `archived: true` to animals from the archived list,
            // as the backend doesn't seem to include this flag, which breaks counter logic.
            const archivedData = (archivedRes.data?.archived || []).map(a => ({ ...a, archived: true }));
            // Also ensure sold/transferred animals are correctly marked as view-only for the counters.
            const soldTransferredData = (archivedRes.data?.soldTransferred || []).map(a => ({ ...a, isViewOnly: true }));

            const combinedData = [...(res.data || []), ...archivedData, ...soldTransferredData];
            const uniqueData = Array.from(new Map(combinedData.map(item => [item.id_public || item._id, item])).values());
            setAllAnimalsRaw(uniqueData);
        } catch (err) { console.error('[fetchAllAnimals]', err); }
    }, [authToken, API_BASE_URL]);

    // Fetch ALL animals created by this user with status=Available (ignores ownership filter)
    const fetchAvailableAnimals = useCallback(async () => {
        if (!authToken) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` },
                params: { status: 'Available' }
            });
            setAvailableAnimalsRaw((res.data || []).filter(a => !a.isViewOnly));
        } catch (err) { console.error('[fetchAvailableAnimals]', err); }
    }, [authToken, API_BASE_URL]);

    // Fetch view-only/transferred animals ? these are animals the user sold/transferred but retains view-only access to
    const fetchSoldTransferred = useCallback(async () => {
        if (!authToken) return;
        try {
            // Fetch without isOwned filter so the backend returns both owned + view-only animals
            const res = await axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            // Only keep view-only entries (creatorId !== current user)
            setSoldTransferredRaw((res.data || []).filter(a => a.isViewOnly));
        } catch (err) { console.error('[fetchSoldTransferred]', err); }
    }, [authToken, API_BASE_URL]);

    // ---- Collection CRUD helpers ----
    const _syncToApi = (cols, map) => {
        if (!authToken) return;
        axios.put(`${API_BASE_URL}/collections`, { collections: cols, animalMap: map }, {
            headers: { Authorization: `Bearer ${authToken}` }
        }).catch(err => console.warn('[collections sync]', err));
    };
    const _saveCollections = (cols, mapOverride) => {
        const map = mapOverride !== undefined ? mapOverride : animalCollections;
        setUserCollections(cols);
        try { localStorage.setItem(`ct_collections_${userKey}`, JSON.stringify(cols)); } catch {}
        _syncToApi(cols, map);
    };
    const _saveAnimalCollections = (map) => {
        setAnimalCollections(map);
        try { localStorage.setItem(`ct_animal_collections_${userKey}`, JSON.stringify(map)); } catch {}
        _syncToApi(userCollections, map);
    };
    const createCollection = (name) => {
        if (!name.trim()) return;
        const id = `col_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        _saveCollections([...userCollections, { id, name: name.trim() }]);
    };
    const deleteCollection = (id) => {
        const newCols = userCollections.filter(c => c.id !== id);
        const next = { ...animalCollections };
        Object.keys(next).forEach(aid => { next[aid] = next[aid].filter(cid => cid !== id); });
        setUserCollections(newCols);
        setAnimalCollections(next);
        try { localStorage.setItem(`ct_collections_${userKey}`, JSON.stringify(newCols)); } catch {}
        try { localStorage.setItem(`ct_animal_collections_${userKey}`, JSON.stringify(next)); } catch {}
        _syncToApi(newCols, next);
    };
    const renameCollection = (id, name) => {
        if (!name.trim()) return;
        _saveCollections(userCollections.map(c => c.id === id ? { ...c, name: name.trim() } : c));
    };
    const assignAnimalToCollection = (animalId, collectionId) => {
        const current = animalCollections[animalId] || [];
        if (current.includes(collectionId)) return;
        _saveAnimalCollections({ ...animalCollections, [animalId]: [...current, collectionId] });
    };
    const removeAnimalFromCollection = (animalId, collectionId) => {
        const current = animalCollections[animalId] || [];
        _saveAnimalCollections({ ...animalCollections, [animalId]: current.filter(cid => cid !== collectionId) });
    };

    // Duplicates state
     const [showForSaleScreen, setShowForSaleScreen] = useState(false); const [defaultMyAnimalsViewMode, setDefaultMyAnimalsViewMode] = useState(() => {
        try { return localStorage.getItem(`ct_default_my_animals_view_mode_${userKey}`) || 'cards'; } catch { return 'cards'; }
    });
    const [myAnimalsViewMode, setMyAnimalsViewMode] = useState(defaultMyAnimalsViewMode);
    useEffect(() => {
        try { localStorage.setItem(`ct_default_my_animals_view_mode_${userKey}`, defaultMyAnimalsViewMode); } catch {}
    }, [defaultMyAnimalsViewMode, userKey]);
    const [defaultCollectionsViewMode, setDefaultCollectionsViewMode] = useState(() => {
        try { return localStorage.getItem(`ct_default_collections_view_mode_${userKey}`) || 'cards'; } catch { return 'cards'; }
    });
    const [collectionsViewMode, setCollectionsViewMode] = useState(defaultCollectionsViewMode);
    useEffect(() => {
        try { localStorage.setItem(`ct_default_collections_view_mode_${userKey}`, defaultCollectionsViewMode); } catch {}
    }, [defaultCollectionsViewMode, userKey]);

    const [showDuplicatesScreen, setShowDuplicatesScreen] = useState(false);
    const [duplicateGroups, setDuplicateGroups] = useState([]);
    const [duplicatesLoading, setDuplicatesLoading] = useState(false);
    const [supplyForm, setSupplyForm] = useState({ name: '', category: 'Other', currentStock: '', unit: '', reorderThreshold: '', notes: '', isFeederAnimal: false, feederType: '', feederSize: '', costPerUnit: '', nextOrderDate: '', orderFrequency: '', orderFrequencyUnit: 'months' });
    const [supplyFormVisible, setSupplyFormVisible] = useState(false);
    const [editingSupplyId, setEditingSupplyId] = useState(null);
    const [supplySaving, setSupplySaving] = useState(false);
    const [supplies, setSupplies] = useState([]);
    const [suppliesLoading, setSuppliesLoading] = useState(false);
    const [showBreedingLineManager, setShowBreedingLineManager] = useState(false);
    const [supplyCategoryFilter, setSupplyCategoryFilter] = useState('All');
    const [restockingSupplyId, setRestockingSupplyId] = useState(null);
    const [restockForm, setRestockForm] = useState({ qty: '', cost: '', date: new Date().toISOString().slice(0, 10), notes: '' });
    const [restockSaving, setRestockSaving] = useState(false);
    const [openActionMenu, setOpenActionMenu] = useState(null); // For list view action dropdown
    const actionMenuRef = useRef(null);
    const alertsDropdownRef = useRef(null);
    const columnsDropdownRef = useRef(null);

    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
    const [listViewColumns, setListViewColumns] = useState(() => {
        try {
            const saved = localStorage.getItem(`ct_list_columns_${userKey}`);
            return saved ? { ...DEFAULT_LIST_COLUMNS, ...JSON.parse(saved) } : DEFAULT_LIST_COLUMNS;
        } catch {
            return DEFAULT_LIST_COLUMNS;
        }
    });
    const [alertSettings, setAlertSettings] = useState(() =>
        Object.keys(ALERT_CATEGORIES).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    const toggleAlertCategory = (key) => {
        setAlertSettings(prev => {
            const next = { ...prev, [key]: !prev[key] };
            const storageKey = `ct_alert_settings_${userKey}`;
            try {
                localStorage.setItem(storageKey, JSON.stringify(next));
                // Notify the globally-rendered NotificationBar (a sibling, not a child) so it
                // picks up the change immediately without needing a page reload.
                window.dispatchEvent(new StorageEvent('storage', { key: storageKey }));
            } catch {}
            return next;
        });
    };

    // Mating form state
    const [showAddMatingForm, setShowAddMatingForm] = useState(false);
    const [editingMatingId, setEditingMatingId] = useState(null);
    const [matingData, setMatingData] = useState({ sireId_public: '', damId_public: '', matingDate: '', expectedDueDate: '', breedingMethod: 'Natural', breedingConditionAtTime: '', species: '', notes: '' });

    // Assign Quarantine/Treatment modal state
    const [showAssignHealthStatusModal, setShowAssignHealthStatusModal] = useState(false);
    const [assigningHealthStatus, setAssigningHealthStatus] = useState(false);
    const [selectedMatingSire, setSelectedMatingSire] = useState(null);
    const [selectedMatingDam, setSelectedMatingDam] = useState(null);
    const [showMatingBreedingDetails, setShowMatingBreedingDetails] = useState(false);
    const [matingCOI, setMatingCOI] = useState(null);
    const [matingCalcCOI, setMatingCalcCOI] = useState(false);
    const [showMatingSpeciesPicker, setShowMatingSpeciesPicker] = useState(false);
    const [modalTarget, setModalTarget] = useState(null);
    // ---- Collections state (user-scoped localStorage + backend sync) ----
    const [userCollections, setUserCollections] = useState([]); // populated from user-scoped key below
    const [listSelectedIds, setListSelectedIds] = useState(new Set());
    const [animalCollections, setAnimalCollections] = useState({}); // populated from user-scoped key below
    const [showCollectionManager, setShowCollectionManager] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [renamingCollectionId, setRenamingCollectionId] = useState(null);
    const [renamingCollectionName, setRenamingCollectionName] = useState('');
    const [collapsedCollections, setCollapsedCollections] = useState({});
    const [assigningCollectionAnimalId, setAssigningCollectionAnimalId] = useState(null);

    // Close action menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
                setOpenActionMenu(null);
            }
            if (alertsDropdownRef.current && !alertsDropdownRef.current.contains(event.target)) {
                setShowAlertsDropdown(false);
            }
            if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(event.target)) {
                setShowColumnsDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [actionMenuRef, alertsDropdownRef, columnsDropdownRef]);

    // ---- Re-load user-scoped prefs & collections whenever the logged-in user changes ----
    // This prevents one user's data from leaking into another account after switching.
    useEffect(() => {
        if (!userKey || userKey === 'anon') return;
        // Collections
        try {
            const cols = JSON.parse(localStorage.getItem(`ct_collections_${userKey}`) || '[]');
            const map  = JSON.parse(localStorage.getItem(`ct_animal_collections_${userKey}`) || '{}');
            setUserCollections(cols);
            setAnimalCollections(map);
        } catch { setUserCollections([]); setAnimalCollections({}); }
        // View mode & column config
        try {
            const dcvm = localStorage.getItem(`ct_default_collections_view_mode_${userKey}`);
            if (dcvm) {
                setDefaultCollectionsViewMode(dcvm);
                setCollectionsViewMode(dcvm);
            }
            const dvm = localStorage.getItem(`ct_default_my_animals_view_mode_${userKey}`); if (dvm) {
                setMyAnimalsViewMode(dvm);
                setDefaultMyAnimalsViewMode(dvm);
            }
            const lvc = localStorage.getItem(`ct_list_columns_${userKey}`);
            if (lvc) {
                try { setListViewColumns({ ...DEFAULT_LIST_COLUMNS, ...JSON.parse(lvc) }); }
                catch {}
            }
        } catch {} // Alert settings
        try {
            const saved = localStorage.getItem(`ct_alert_settings_${userKey}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                const defaults = Object.keys(ALERT_CATEGORIES).reduce((acc, key) => ({ ...acc, [key]: true }), {});
                setAlertSettings({ ...defaults, ...parsed });
            }
        } catch {}
    }, [userKey]);

    const speciesOptionsForEnclosureModal = useMemo(() => {
        const favoriteSpecies = userProfile?.favoriteSpecies || [];
        const allSystemSpecies = speciesOptions || [];
        const systemSpeciesNames = allSystemSpecies.map(s => s.name).filter(Boolean);
        const combined = [...new Set([...systemSpeciesNames, ...favoriteSpecies])];
        const sorted = combined.sort((a, b) => a.localeCompare(b));
        return sorted.map(speciesName => ({
            name: speciesName,
            latinName: allSystemSpecies.find(s => s.name === speciesName)?.latinName || getSpeciesLatinName(speciesName),
            category: allSystemSpecies.find(s => s.name === speciesName)?.category || getSpeciesCategory(speciesName)
        }));
    }, [userProfile?.favoriteSpecies, speciesOptions]);

    const isCollectionsView = animalView === 'collections';
    const isMgmtTab = ['enclosures', 'reproduction', 'health', 'feeding', 'supplies'].includes(animalView);
    const isListLikeView = animalView === 'list' || isCollectionsView;

    useEffect(() => {
        // Only override if the caller explicitly passed a non-default view (e.g. deep-link)
        // Otherwise respect the user's pinned default from localStorage
        if (initialAnimalView && initialAnimalView !== 'list') {
            setAnimalView(normalizeAnimalView(initialAnimalView));
        }
    }, [initialAnimalView]);
    const [feedingModal, setFeedingModal] = useState(null); // { animal } when open
    const [feedingForm, setFeedingForm] = useState({ supplyId: '', qty: '1', notes: '', updateStock: true });
    const [enclosures, setEnclosures] = useState([]);
    const [enclosureFormVisible, setEnclosureFormVisible] = useState(false);
    const [reproEncFormVisible, setReproEncFormVisible] = useState(false);
    const [healthEncFormVisible, setHealthEncFormVisible] = useState(false);
    const [enclosureFormData, setNewEnclosureForm] = useState({
        name: '', enclosureType: '', capacity: '', length: '', width: '', height: '', dimensionsUnit: 'in',
        buildingId: '', roomId: '',
        purpose: 'general', purposeDescription: '', tempMin: '', tempMax: '', temperatureUnit: 'C', humidityMin: '', humidityMax: '',
        lightsOnTime: '', lightsOffTime: '', lightTimeFormat: '24h', notes: '', imageUrl: '', tags: [], speciesLabels: [],
        cleaningTasks: [],
        bedding: '', lightingType: '', enrichment: ''
    });
    const [editingEnclosureId, setEditingEnclosureId] = useState(null);
    const [newEnclosureTag, setNewEnclosureTag] = useState('');
    const [enclosureImageFile, setEnclosureImageFile] = useState(null);
    const [enclosureImagePreview, setEnclosureImagePreview] = useState(null);

    const [enclosureSaving, setEnclosureSaving] = useState(false);
    const [assigningAnimalId, setAssigningAnimalId] = useState(null);
    const [newCleaningTaskName, setNewCleaningTaskName] = useState('');
    const [newCleaningTaskFreq, setNewCleaningTaskFreq] = useState('');
    
    const isSavingEnclosureRef = useRef(false);
    const [showEnclosureModal, setShowEnclosureModal] = useState(false); // State for the new modal
    // New states for Enclosures tab overhaul
    const [enclosureSearch, setEnclosureSearch] = useState('');
    const [enclosureTypeFilter, setEnclosureTypeFilter] = useState('');
    const [enclosureStatusFilter, setEnclosureStatusFilter] = useState(''); // 'occupied' | 'empty'
    const [enclosureBuildingFilter, setEnclosureBuildingFilter] = useState('');
    const [enclosureSpeciesFilter, setEnclosureSpeciesFilter] = useState('');
    const [enclosureRoomFilter, setEnclosureRoomFilter] = useState('');

    const [showEnclosureBreakdown, setShowEnclosureBreakdown] = useState(false);
    const [showCapacityBreakdown, setShowCapacityBreakdown] = useState(false);
    const [showNeedsAttentionBreakdown, setShowNeedsAttentionBreakdown] = useState(false);
    const [showMainAlertsBreakdown, setShowMainAlertsBreakdown] = useState(false);
    const [showReproNeedsAttentionBreakdown, setShowReproNeedsAttentionBreakdown] = useState(false);
    const [showHealthNeedsAttentionBreakdown, setShowHealthNeedsAttentionBreakdown] = useState(false);
    const [showFeedingCareNeedsAttentionBreakdown, setShowFeedingCareNeedsAttentionBreakdown] = useState(false);
    // Enclosure Detail Modal State
    const [selectedEnclosure, setSelectedEnclosure] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [originalEnclosureForEdit, setOriginalEnclosureForEdit] = useState(null);
    const [enclosureAnimals, setEnclosureAnimals] = useState([]);
    const [loadingAnimals, setLoadingAnimals] = useState(false);

    const fetchSupplies = useCallback(async () => {
        if (!authToken) return;
        setSuppliesLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/supplies`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setSupplies(res.data || []);
        } catch (err) { console.error('[fetchSupplies]', err); }
        setSuppliesLoading(false);
    }, [authToken, API_BASE_URL]);

    useEffect(() => { fetchSupplies(); }, [fetchSupplies]);

    
    const fetchEnclosures = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/enclosures`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setEnclosures(res.data);
        } catch (err) { console.error('[fetchEnclosures]', err); }
    }, [authToken]);
    useEffect(() => { fetchEnclosures(); }, [fetchEnclosures]);


    // Fetch archived + sold/transferred animals from API
    const handleCloseEnclosureModal = useCallback(() => {
        console.log('[AnimalList] EnclosureModal onClose triggered.');
        setShowEnclosureModal(false);
        setOriginalEnclosureForEdit(null);
        setEditingEnclosureId(null);
        setNewEnclosureForm({
            name: '', enclosureType: '', capacity: '', length: '', width: '', height: '', dimensionsUnit: 'in',
            buildingId: '', roomId: '',
            purpose: 'general', purposeDescription: '', tempMin: '', tempMax: '', temperatureUnit: 'C', humidityMin: '', humidityMax: '',
            lightsOnTime: '', lightsOffTime: '', lightTimeFormat: '24h', notes: '', imageUrl: '', tags: [], speciesLabels: [],
            cleaningTasks: [],
            bedding: '', lightingType: '', enrichment: ''
        });
        setEnclosureImageFile(null);
        setEnclosureImagePreview(null);
    }, [setNewEnclosureForm, setEnclosureImageFile, setEnclosureImagePreview, setEditingEnclosureId, setShowEnclosureModal]);

    const handleSaveEnclosure = useCallback(async () => {
        if (isSavingEnclosureRef.current) return;
        isSavingEnclosureRef.current = true;

        const generateHistoryDiff = (oldEnc, newEncData, user) => {
            const history = [];
            const timestamp = new Date().toISOString();
            const userName = user.personalName || user.breederName;
            const userId = user._id;
        
            const fieldsToCompare = [
                'name', 'enclosureType', 'purpose', 'purposeDescription', 'capacity', 
                'tempMin', 'tempMax', 'humidityMin', 'humidityMax', 
                'lightsOnTime', 'lightsOffTime', 'notes'
            ];
        
            fieldsToCompare.forEach(field => {
                const oldVal = (oldEnc[field] == null) ? '' : String(oldEnc[field]).trim();
                const newVal = (newEncData[field] == null) ? '' : String(newEncData[field]).trim();

                if (oldVal !== newVal) {
                    history.push({
                        timestamp,
                        userId,
                        userName,
                        action: 'update',
                        details: { field, oldValue: oldVal, newValue: newVal }
                    });
                }
            });
        
            const oldDims = oldEnc.dimensions || {};
            const newDims = {
                length: newEncData.length,
                width: newEncData.width,
                height: newEncData.height,
                unit: newEncData.dimensionsUnit
            };
            if (JSON.stringify(oldDims) !== JSON.stringify(newDims)) {
                 history.push({ timestamp, userId, userName, action: 'update', details: { field: 'dimensions', oldValue: `${oldDims.length || '?'}x${oldDims.width || '?'}x${oldDims.height || '?'} ${oldDims.unit || ''}`.trim(), newValue: `${newDims.length || '?'}x${newDims.width || '?'}x${newDims.height || '?'} ${newDims.unit || ''}`.trim() } });
            }
        
            const oldLocation = getLocationPath(oldEnc.buildingId, oldEnc.roomId, locations);
            const newLocation = getLocationPath(newEncData.buildingId, newEncData.roomId, locations);
            if (oldLocation !== newLocation) {
                history.push({ timestamp, userId, userName, action: 'update', details: { field: 'location', oldValue: oldLocation, newValue: newLocation } });
            }
        
            const oldTasks = oldEnc.cleaningTasks || [];
            const newTasks = newEncData.cleaningTasks || [];
            if (oldTasks.length > newTasks.length) {
                const removedTasks = oldTasks.filter(ot => !newTasks.find(nt => nt.taskName === ot.taskName && nt.frequency === ot.frequency));
                removedTasks.forEach(task => history.push({ timestamp, userId, userName, action: 'task_removed', details: { taskName: task.taskName } }));
            } else if (newTasks.length > oldTasks.length) {
                const addedTasks = newTasks.filter(nt => !oldTasks.find(ot => ot.taskName === nt.taskName && nt.frequency === ot.frequency));
                addedTasks.forEach(task => history.push({ timestamp, userId, userName, action: 'task_added', details: { taskName: task.taskName } }));
            }
        
            return history;
        };

           // Set saving state immediately
        setEnclosureSaving(true);
          const dataToSave = { ...enclosureFormData };
        const imageFileToSave = enclosureImageFile;
        const enclosureIdToSave = editingEnclosureId;
        
        if (!dataToSave || !dataToSave.name || !dataToSave.name.trim()) {
            showModalMessageRef.current('Validation Error', 'Enclosure name cannot be empty.');
            setEnclosureSaving(false); // Reset saving state if validation fails
            isSavingEnclosureRef.current = false;
            return;
        }
        try {
            const payload = {
                name: dataToSave.name.trim(),
                enclosureType: dataToSave.enclosureType,
                buildingId: dataToSave.buildingId || null,
                roomId: dataToSave.roomId || null,
                purpose: dataToSave.purpose,
                purposeDescription: dataToSave.purposeDescription?.trim(),
                dimensions: {
                    length: dataToSave.length ? Number(dataToSave.length) : null,
                    width: dataToSave.width ? Number(dataToSave.width) : null,
                    height: dataToSave.height ? Number(dataToSave.height) : null,
                    unit: dataToSave.dimensionsUnit || 'in'
                },
                capacity: dataToSave.capacity ? Number(dataToSave.capacity) : undefined,
                tempMin: dataToSave.tempMin ? Number(dataToSave.tempMin) : null,
                tempMax: dataToSave.tempMax ? Number(dataToSave.tempMax) : null,
                temperatureUnit: dataToSave.temperatureUnit || 'C',
                humidityMin: dataToSave.humidityMin ? Number(dataToSave.humidityMin) : null,
                humidityMax: dataToSave.humidityMax ? Number(dataToSave.humidityMax) : null,
                lightsOnTime: dataToSave.lightsOnTime,
                lightsOffTime: dataToSave.lightsOffTime,
                lightTimeFormat: dataToSave.lightTimeFormat,
                notes: dataToSave.notes?.trim(),
                cleaningTasks: dataToSave.cleaningTasks,
                tags: dataToSave.tags,
                speciesLabels: dataToSave.speciesLabels,
                bedding: dataToSave.bedding,
                lightingType: dataToSave.lightingType,
                enrichment: dataToSave.enrichment,
                imageUrl: dataToSave.imageUrl, // This will now be correct from handleEnclosureImageChange
            };

            if (imageFileToSave) {
                // Only upload if there's a new file
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFileToSave);
                uploadFormData.append('type', 'enclosure'); // Add type for backend processing
                const res = await axios.post(`${API_BASE_URL}/upload`, uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${authToken}` }
                });
                console.log('[AnimalList] Image upload response data:', res.data); // Log the full response data for debugging
                payload.imageUrl = res.data.url; // Use 'url' to be consistent with other uploads
                console.log('[AnimalList] Image uploaded. New imageUrl (from response):', payload.imageUrl); // Log the updated URL
            } else if (enclosureImagePreview === null && dataToSave.imageUrl !== '') {
                // If no new file, preview is null, but formData still has an imageUrl,
                // it means the user removed the image. Clear it.
                payload.imageUrl = '';
            }

            if (enclosureIdToSave && originalEnclosureForEdit) {
                const newHistory = generateHistoryDiff(originalEnclosureForEdit, dataToSave, userProfile);
                if (newHistory.length > 0) {
                    const existingHistory = originalEnclosureForEdit.history || [];
                    payload.history = [...existingHistory, ...newHistory];
                }
            }

            if (enclosureIdToSave) {
                await axios.put(`${API_BASE_URL}/enclosures/${enclosureIdToSave}`, payload,
                    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } });
            } else {
                await axios.post(`${API_BASE_URL}/enclosures`, payload,
                    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } });
            }
            handleCloseEnclosureModal();
            fetchEnclosures();
        } catch (err) {
            showModalMessageRef.current('Error', err.response?.data?.message || 'Failed to save enclosure');
        } finally {
            setEnclosureSaving(false);
            isSavingEnclosureRef.current = false;
        }
    }, [authToken, API_BASE_URL, enclosureFormData, enclosureImageFile, editingEnclosureId, fetchEnclosures, handleCloseEnclosureModal]);
    
    const handleDeleteEnclosure = useCallback(async () => {
        if (!editingEnclosureId) return;

        if (!window.confirm('Are you sure you want to permanently delete this enclosure? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/enclosures/${editingEnclosureId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessageRef.current('Success', 'Enclosure deleted. Any animals assigned to it have been unassigned.');
            fetchEnclosures();
            fetchAllAnimals(); // Refresh animal list so UI shows animals as unassigned
            handleCloseEnclosureModal();
        } catch (err) {
            showModalMessageRef.current('Error', err.response?.data?.message || 'Failed to delete enclosure.');
        }
    }, [editingEnclosureId, API_BASE_URL, authToken, fetchEnclosures, fetchAllAnimals, handleCloseEnclosureModal]);

    const getLocationPath = useCallback((buildingId, roomId, allLocations) => {
        if (!buildingId || !allLocations.length) return '';
        const locationMap = new Map(allLocations.map(l => [l._id, l]));
        const path = [];
        const building = locationMap.get(buildingId);
        const room = locationMap.get(roomId);
        
        if (building) path.push(building.name);
        if (room) path.push(room.name);
        
        return path.join(' / ');
    }, []);

    // --- Location Management ---
    const [showLocationManager, setShowLocationManager] = useState(false);
    const [locationSaving, setLocationSaving] = useState(false);

    const handleSaveLocation = useCallback(async (id, data) => {
        setLocationSaving(true);
        try {
            if (id) {
                // Ensure parentLocationId is null if it's an empty string
                await axios.put(`${API_BASE_URL}/locations/${id}`, { ...data, parentLocationId: data.parentLocationId || null }, { headers: { Authorization: `Bearer ${authToken}` } });
            } else {
                await axios.post(`${API_BASE_URL}/locations`, data, { headers: { Authorization: `Bearer ${authToken}` } });
            }
            fetchLocations();
        } catch (err) {
            showModalMessageRef.current('Error', err.response?.data?.message || `Failed to save location: ${err.message}`);
        } finally {
            setLocationSaving(false);
        }
    }, [authToken, API_BASE_URL, fetchLocations]);

    const handleDeleteLocation = useCallback(async (id) => {
        setLocationSaving(true);
        try {
            await axios.delete(`${API_BASE_URL}/locations/${id}`, { headers: { Authorization: `Bearer ${authToken}` } });
            fetchLocations();
            fetchEnclosures(); // Refetch enclosures as their location might be cleared
        } catch (err) {
            showModalMessageRef.current('Error', err.response?.data?.message || `Failed to delete location: ${err.message}`);
        } finally {
            setLocationSaving(false);
        }
    }, [authToken, API_BASE_URL, fetchLocations, fetchEnclosures]);

    // Base list for "active" animals (not sold or archived) for dashboard counts.
    const activeAnimalsForDashboard = useMemo(() => {
        return allAnimalsRaw.filter(a =>
            !a.isViewOnly &&
            !a.archived
        );
    }, [allAnimalsRaw]);

    const categoryBreakdown = useMemo(() => {
        const breakdown = { 'Mammal': 0, 'Reptile': 0, 'Bird': 0, 'Amphibian': 0, 'Fish': 0, 'Invertebrate': 0, 'Other': 0 };
        activeAnimalsForDashboard.forEach(animal => {
            const category = getSpeciesCategory(animal.species);
            breakdown[category]++;
        });

        const total = activeAnimalsForDashboard.length;
        if (total === 0) return [];
        return Object.entries(breakdown).map(([name, count]) => ({ name, count, percentage: ((count / total) * 100).toFixed(1) })).filter(cat => cat.count > 0);
    }, [activeAnimalsForDashboard]);

    const enclosureSpeciesCapacityBreakdown = useMemo(() => {
        const breakdown = {};
        enclosures.forEach(enc => {
            const capacity = Number(enc.capacity) || 0;
            if (capacity > 0) {
                (enc.speciesLabels || []).forEach(species => {
                    breakdown[species] = (breakdown[species] || 0) + capacity;
                });
            }
        });
        return Object.entries(breakdown)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [enclosures]);

    const enclosureBreakdown = useMemo(() => {
        if (!locations.length) return [];

        const buildings = locations.filter(l => l.type === 'building');
        const rooms = locations.filter(l => l.type === 'room');

        const breakdown = buildings.map(building => {
            const buildingRooms = rooms.filter(r => r.parentLocationId === building._id);
            const roomCounts = buildingRooms.map(room => ({
                name: room.name,
                count: enclosures.filter(e => e.roomId === room._id).length
            }));
            const enclosuresDirectlyInBuilding = enclosures.filter(e => e.buildingId === building._id && !e.roomId).length;
            
            const totalInBuilding = roomCounts.reduce((sum, room) => sum + room.count, 0) + enclosuresDirectlyInBuilding;

            return {
                name: building.name,
                count: totalInBuilding,
                rooms: roomCounts.filter(r => r.count > 0)
            };
        });

        const unassignedBuildingEnclosures = enclosures.filter(e => !e.buildingId);
        if (unassignedBuildingEnclosures.length > 0) {
            breakdown.push({ name: 'Unassigned to Building', count: unassignedBuildingEnclosures.length, rooms: [] });
        }

        return breakdown.filter(b => b.count > 0).sort((a, b) => a.name.localeCompare(b.name));
    }, [enclosures, locations]);

    // Save filters to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('animalList_statusFilter', statusFilter);
        } catch (e) { console.warn('Failed to save statusFilter', e); }
    }, [statusFilter]);
    
    useEffect(() => {
        try {
            localStorage.setItem('animalList_searchInput', searchInput);
        } catch (e) { console.warn('Failed to save searchInput', e); }
    }, [searchInput]);
    
    useEffect(() => {
        try {
            localStorage.setItem('animalList_appliedNameFilter', appliedNameFilter);
        } catch (e) { console.warn('Failed to save appliedNameFilter', e); }
    }, [appliedNameFilter]);
    
    useEffect(() => {
          try { localStorage.setItem('animalList_genderFilter', genderFilter); }
        catch (e) { console.warn('Failed to save genderFilter', e); }
    }, [genderFilter]);

    // Removed selectedSpecies persistence - always default to showing all species
    // This prevents confusion when users create new animals and they don't appear due to cached filters
    
useEffect(() => {
        try { localStorage.setItem('animalList_speciesFilter', speciesFilter); }
        catch (e) { console.warn('Failed to save speciesFilter', e); }
    }, [speciesFilter]);

    useEffect(() => {
        try { localStorage.setItem('animalList_categoryFilter', categoryFilter); }
        catch (e) { console.warn('Failed to save categoryFilter', e); }
    }, [categoryFilter]);


    useEffect(() => {
        try {
            localStorage.setItem('animalList_statusFilterPregnant', statusFilterPregnant.toString());
        } catch (e) { console.warn('Failed to save statusFilterPregnant', e); }
    }, [statusFilterPregnant]);
    
    useEffect(() => {
        try {
            localStorage.setItem('animalList_statusFilterNursing', statusFilterNursing.toString());
        } catch (e) { console.warn('Failed to save statusFilterNursing', e); }
    }, [statusFilterNursing]);
    
    useEffect(() => {
        try {
            localStorage.setItem('animalList_statusFilterMating', statusFilterMating.toString());
        } catch (e) { console.warn('Failed to save statusFilterMating', e); }
    }, [statusFilterMating]);
    
    useEffect(() => {
        try { localStorage.setItem('animalList_ownedFilterMode', ownedFilterMode); }
        catch (e) { console.warn('Failed to save ownedFilterMode', e); }
    }, [ownedFilterMode]);
    useEffect(() => { try {
            localStorage.setItem('animalList_publicFilter', publicFilter);
        } catch (e) { console.warn('Failed to save publicFilter', e); }
    }, [publicFilter]);

    useEffect(() => {
        try {
            localStorage.setItem('animalList_blFilter', JSON.stringify(blFilter));
        } catch (e) { console.warn('Failed to save blFilter', e); }
    }, [blFilter]);

    useEffect(() => {
        try {
            localStorage.setItem(`ct_list_columns_${userKey}`, JSON.stringify(listViewColumns));
        } catch (e) { console.warn('Failed to save listViewColumns', e); }
    }, [listViewColumns, userKey]);

     const EnclosureCard = ({ enclosure }) => {
        const occupants = enclosureAnimalMap[enclosure._id] || [];
        const occupancyStatus = occupants.length > 0 ? 'Occupied' : 'Empty';
        const capacity = parseInt(enclosure.capacity, 10);
        const locationName = getLocationPath(enclosure.buildingId, enclosure.roomId, locations);
        const occupancyPercentage = capacity > 0 ? (occupants.length / capacity) * 100 : 0;

        const tempRange = (enclosure.tempMin != null && enclosure.tempMax != null)
            ? `${enclosure.tempMin}° - ${enclosure.tempMax}°${enclosure.temperatureUnit || 'C'}`
            : null;

        const humidityRange = (enclosure.humidityMin != null && enclosure.humidityMax != null)
            ? `${enclosure.humidityMin}% - ${enclosure.humidityMax}%`
            : null;
        
        const lightSchedule = (enclosure.lightsOnTime && enclosure.lightsOffTime)
            ? `${formatTime12h(enclosure.lightsOnTime)} - ${formatTime12h(enclosure.lightsOffTime)}`
            : null;

        const dimensions = formatDimensions(enclosure.dimensions, enclosure.size);

        const dueTasks = (enclosure.cleaningTasks || []).filter(isTaskDue);
        const needsAttention = dueTasks.length > 0;
        const dueTypes = needsAttention ? [...new Set(dueTasks.map(t => t.type || 'Other'))] : [];

        return (
            <div 
                className="bg-white dark:bg-dark-surface rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-dark-border transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer flex flex-col"
                onClick={() => handleOpenDetail(enclosure)}
            >
                {/* Banner Image */}
                <div className="h-28 bg-gray-200 dark:bg-dark-surface-hover flex items-center justify-center relative">
                    {enclosure.imageUrl ? (
                        <img src={enclosure.imageUrl} alt={enclosure.name} className="w-full h-full object-cover" />
                    ) : (
                        <Home size={40} className="text-gray-400 dark:text-dark-text-muted" />
                    )}
                    <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full ${occupancyStatus === 'Occupied' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-dark-surface-hover dark:text-dark-text-secondary'}`}>
                        {occupancyStatus}
                    </span>
                </div>
                
                <div className="p-3 flex-grow flex flex-col">
                    {/* Name */}
                    <h3 className="font-bold text-base text-gray-800 dark:text-dark-text truncate">{enclosure.name}</h3>
                    
                    {/* Type, Size, Location */}
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
                        {enclosure.enclosureType && <span className="flex items-center gap-1"><Home size={12} /> {enclosure.enclosureType}</span>}
                        {dimensions && <span className="flex items-center gap-1"><Ruler size={12} /> {dimensions}</span>}
                        {locationName && <span className="flex items-center gap-1"><MapPin size={12} /> {locationName}</span>}
                    </div>

                    {/* Stats Row */}
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5" title="Animals Housed">
                            <Cat size={14} className="text-gray-400" />
                            <span className="font-medium text-gray-700 dark:text-dark-text">{occupants.length} {occupants.length === 1 ? 'Animal' : 'Animals'}</span>
                        </div>
                        {capacity > 0 && ( <div className="flex items-center gap-1.5" title="Occupancy Percentage"><BarChart2 size={14} className="text-gray-400" /><span className="font-medium text-gray-700 dark:text-dark-text">{occupancyPercentage.toFixed(0)}% Full</span></div> )}
                        {tempRange && ( <div className="flex items-center gap-1.5" title="Temperature Range"><Thermometer size={14} className="text-gray-400" /><span className="font-medium text-gray-700 dark:text-dark-text">{tempRange}</span></div> )}
                        {humidityRange && ( <div className="flex items-center gap-1.5" title="Humidity Range"><Droplet size={14} className="text-gray-400" /><span className="font-medium text-gray-700 dark:text-dark-text">{humidityRange}</span></div> )}
                        {lightSchedule && ( <div className="flex items-center gap-1.5" title="Lighting Schedule"><LampCeiling size={14} className="text-gray-400" /><span className="font-medium text-gray-700 dark:text-dark-text">{lightSchedule}</span></div> )}
                    </div>
                    
                    {/* Warnings */}
                    <div className="mt-auto pt-2 flex flex-wrap gap-2">
                        {needsAttention && dueTypes.map(type => {
                            let label = 'Task Due';
                            let colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                            let icon = <Wrench size={12} />;

                            switch(type) {
                                case 'Cleaning': label = 'Needs Cleaning'; colorClass = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'; icon = <Wrench size={12} />; break;
                                case 'Maintenance': label = 'Needs Maintenance'; colorClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'; icon = <Settings size={12} />; break;
                                case 'Feeding': label = 'Feeding Due'; colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'; icon = <Utensils size={12} />; break;
                                default: label = `${type} Due`; break;
                            }
                            return ( <span key={type} className={`flex items-center gap-1 text-xs ${colorClass} px-2 py-1 rounded-full font-medium`}>{icon} {label}</span> );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const handleClearBreedingLine = async (lineId) => {
        const lineToClear = breedingLineDefs.find(l => l.id === lineId);
        if (!lineToClear || !lineToClear.name) return;

        if (!window.confirm(`Are you sure you want to clear the "${lineToClear.name}" breeding line? This will also unassign it from all animals.`)) {
            return;
        }

        try {
            // Assumes a backend endpoint that clears the name and unassigns from all animals.
            await axios.delete(`${API_BASE_URL}/breeding-lines/${lineId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            showModalMessageRef.current('Success', `Breeding line "${lineToClear.name}" has been cleared.`);

            // Trigger a refetch in the parent component
            onBreedingLinesUpdate?.();
            setShowBreedingLineManager(false);

        } catch (error) {
            console.error('Error clearing breeding line:', error);
            showModalMessageRef.current('Error', error.response?.data?.message || 'Failed to clear breeding line.');
        }
    };

    useEffect(() => {
        // Skip fetch if we have a cache (e.g. returning from edit/view)
        if (_alCache && _alCache.length > 0) {
            fetchLitters();
            setAnimalsRaw(_alCache);
            setLoading(false);
            // Still derive species from cached data
            const speciesList = [...new Set(_alCache.map(a => a.species).filter(Boolean))];
            if (speciesList.length > 0) setAllUserSpecies(speciesList);
            // Still run Phase 2 in background so unowned toggle works
            fetchAnimals();
            return;
        }
        fetchAnimals();
        fetchLitters();
    }, [fetchAnimals, fetchLitters]);

    // Removed extensive prefetch logic - with only 4 generations to show, 
    // pedigrees are fetched on-demand when viewing individual animals

    // Refresh animals when other parts of the app signal a change (e.g., after upload/save)
    useEffect(() => {
        const handleAnimalsChanged = () => {
            try { fetchLitters(); } catch (e) { /* ignore */ }
            try { fetchAnimals(); } catch (e) { /* ignore */ }
            try { fetchAllSpecies(); } catch (e) { /* ignore */ }
            try { fetchAllAnimals(); } catch (e) { /* ignore */ }
            try { fetchAvailableAnimals(); } catch (e) { /* ignore */ }
            try { fetchSoldTransferred(); } catch (e) { /* ignore */ }
        };
        window.addEventListener('animals-changed', handleAnimalsChanged);
        return () => window.removeEventListener('animals-changed', handleAnimalsChanged);
    }, [fetchAnimals, fetchAllSpecies, fetchAllAnimals, fetchAvailableAnimals, fetchSoldTransferred, fetchLitters]);

    // Patch a single updated animal in-place without reloading the full list
    useEffect(() => {
        const handleAnimalUpdated = (e) => {
            const updated = e.detail;
            if (!updated?.id_public) return;
            setAnimals(prev => prev.map(a => a.id_public === updated.id_public ? { ...a, ...updated } : a));
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === updated.id_public ? { ...a, ...updated } : a));
            setAvailableAnimalsRaw(prev => {
                const next = prev.map(a => a.id_public === updated.id_public ? { ...a, ...updated } : a);
                return next.filter(a => a.status === 'Available');
            });
            setSoldTransferredRaw(prev =>
                prev.map(a => a.id_public === updated.id_public ? { ...a, ...updated } : a).filter(a => a.isViewOnly)
            );
        };
        window.addEventListener('animal-updated', handleAnimalUpdated);
        return () => window.removeEventListener('animal-updated', handleAnimalUpdated);
    }, []);

    // Listen for archive events from App component to refresh lists
    useEffect(() => {
        const handleAnimalArchived = () => {
            fetchAnimals();
            fetchAllAnimals();
        };
        window.addEventListener('animal-archived', handleAnimalArchived);
        return () => window.removeEventListener('animal-archived', handleAnimalArchived);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchAnimals, fetchAllAnimals, showArchiveScreen]);

    useEffect(() => { fetchAllAnimals(); }, [fetchAllAnimals]);
    useEffect(() => { fetchAvailableAnimals(); }, [fetchAvailableAnimals]);
    useEffect(() => { fetchSoldTransferred(); }, [fetchSoldTransferred]);

    // Load collections from API on auth change — always overwrite state from server to prevent cross-user leakage
    useEffect(() => {
        if (!authToken) return;
        // Reset to empty immediately so a user with no collections doesn't see a previous user's data
        setUserCollections([]);
        setAnimalCollections({});
        axios.get(`${API_BASE_URL}/collections`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => {
                const { collections, animalMap } = res.data || {};
                const cols = Array.isArray(collections) ? collections : [];
                const map  = (animalMap && typeof animalMap === 'object') ? animalMap : {};
                setUserCollections(cols);
                setAnimalCollections(map);
                try { localStorage.setItem(`ct_collections_${userKey}`, JSON.stringify(cols)); } catch {}
                try { localStorage.setItem(`ct_animal_collections_${userKey}`, JSON.stringify(map)); } catch {}
            })
            .catch(err => console.warn('[collections load]', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authToken]);

    // Reset management-related screens when navigating away from management view
    useEffect(() => {
        if (animalView !== 'management') { setSupplyFormVisible(false); setShowDuplicatesScreen(false); }
    }, [animalView]);
    
    // Auto-fetch duplicates when duplicates screen opens for the first time
    useEffect(() => {
        if (showDuplicatesScreen && duplicateGroups.length === 0 && !duplicatesLoading) {
            fetchDuplicates();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showDuplicatesScreen]);

    const handleEnclosureTagAdd = useCallback(() => {
        if (!newEnclosureTag.trim()) return;
        setNewEnclosureForm(p => ({ ...p, tags: [...new Set([...(p.tags || []), newEnclosureTag.trim()])] }));
        setNewEnclosureTag('');
    }, [newEnclosureTag]);

    const handleEnclosureSpeciesLabelAdd = useCallback((speciesLabel) => {
        setNewEnclosureForm(p => ({
            ...p,
            speciesLabels: [...new Set([...(p.speciesLabels || []), speciesLabel])]
        }));
    }, []);

    const handleEnclosureSpeciesLabelRemove = useCallback((speciesLabelToRemove) => {
        setNewEnclosureForm(p => ({
            ...p,
            speciesLabels: (p.speciesLabels || []).filter(s => s !== speciesLabelToRemove)
        }));
    }, []);

    const handleEnclosureTagRemove = useCallback((tagToRemove) => {
        setNewEnclosureForm(p => ({ ...p, tags: (p.tags || []).filter(t => t !== tagToRemove) }));
    }, []);

      const openEnclosureModal = useCallback((enclosure, defaultValues = {}) => {
        console.log('[AnimalList] openEnclosureModal called. Editing enclosure:', enclosure ? enclosure._id : 'new');
        if (enclosure) {
              setOriginalEnclosureForEdit(enclosure); // Edit mode
            const dims = enclosure.dimensions || enclosure.size;
            let length = '', width = '', height = '', dimensionsUnit = 'in';
            if (typeof dims === 'object' && dims !== null) {
                length = dims.length || '';
                width = dims.width || '';
                height = dims.height || '';
                dimensionsUnit = dims.unit || 'in';
            }
            setNewEnclosureForm({
                name: enclosure.name || '',
                enclosureType: enclosure.enclosureType || enclosure.roomType || '',
                buildingId: enclosure.buildingId || '',
                roomId: enclosure.roomId || '',
                purpose: enclosure.purpose || 'general',
                purposeDescription: enclosure.purposeDescription || '',
                capacity: enclosure.capacity || '',
                length, width, height, dimensionsUnit,
                tempMin: enclosure.tempMin ?? enclosure.temperatureRange?.min ?? '',
                tempMax: enclosure.tempMax ?? enclosure.temperatureRange?.max ?? '',
                temperatureUnit: enclosure.temperatureUnit || 'C',
                humidityMin: enclosure.humidityMin ?? enclosure.humidityRange?.min ?? '',
                humidityMax: enclosure.humidityMax ?? enclosure.humidityRange?.max ?? '',
                lightsOnTime: enclosure.lightsOnTime || '',
                lightsOffTime: enclosure.lightsOffTime || '',
                lightTimeFormat: enclosure.lightTimeFormat || '24h',
                notes: enclosure.notes || enclosure.description || '',
                imageUrl: enclosure.imageUrl || '',
                bedding: enclosure.bedding || '',
                lightingType: enclosure.lightingType || '',
                enrichment: enclosure.enrichment || '',
                tags: enclosure.tags || [],
                speciesLabels: enclosure.speciesLabels || [],
                cleaningTasks: enclosure.cleaningTasks || [],
            });
            setEnclosureImagePreview(enclosure.imageUrl || null);
            setEnclosureImageFile(null);
            setEditingEnclosureId(enclosure._id);
        } else {
            // Add new mode
            setOriginalEnclosureForEdit(null);
            setNewEnclosureForm({
                name: '', enclosureType: '', capacity: '', length: '', width: '', height: '', dimensionsUnit: 'in', buildingId: '', roomId: '',
                purpose: 'general', purposeDescription: '', tempMin: '', tempMax: '', temperatureUnit: 'C', humidityMin: '', humidityMax: '',
                lightsOnTime: '', lightsOffTime: '', lightTimeFormat: '24h', notes: '', imageUrl: '', tags: [], speciesLabels: [],
                cleaningTasks: [],
                bedding: '', lightingType: '', enrichment: '',
                ...defaultValues
            });
            setEnclosureImagePreview(null);
            setEnclosureImageFile(null);
            setEditingEnclosureId(null);
        }
        setShowEnclosureModal(true);
    }, [setNewEnclosureForm, setEnclosureImagePreview, setEnclosureImageFile, setEditingEnclosureId, setShowEnclosureModal]);
    
    const logEnclosureHistory = useCallback(async (enclosureId, action, details) => {
        if (!userProfile) return;
        try {
            const newHistoryEntry = {
                timestamp: new Date().toISOString(),
                userId: userProfile._id,
                userName: userProfile.personalName || userProfile.breederName,
                action,
                details
            };
    
            // Use a PATCH request with MongoDB's $push operator to safely append to the history array.
            // This is more efficient and avoids race conditions from a GET-then-PUT approach.
            await axios.patch(`${API_BASE_URL}/enclosures/${enclosureId}`, { '$push': { history: newHistoryEntry } }, { headers: { Authorization: `Bearer ${authToken}` } });
    
            fetchEnclosures();
        } catch (error) {
            console.error('Failed to log enclosure history:', error);
        }
    }, [authToken, API_BASE_URL, userProfile, fetchEnclosures]);

    const handleAssignAnimalInModal = useCallback(async (animalToAssign, enclosureToAssignTo) => {
        if (!animalToAssign || !enclosureToAssignTo) return;
        const animalIdPublic = animalToAssign.id_public;
        const enclosureId = enclosureToAssignTo._id || enclosureToAssignTo.id;

        // Optimistic update
        setAllAnimalsRaw(prev => prev.map(a => a.id_public === animalIdPublic ? { ...a, enclosureId } : a));
        setEnclosureAnimals(prev => [...prev, { ...animalToAssign, enclosureId }]);

        try {
            await axios.patch(`${API_BASE_URL}/enclosures/assign-animal`,
                { animalId_public: animalIdPublic, enclosureId: enclosureId },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } }
            );
            logEnclosureHistory(enclosureId, 'assign_animal', {
                animalId: animalIdPublic,
                animalName: animalToAssign.name,
                prefix: animalToAssign.prefix,
                suffix: animalToAssign.suffix
            });
        } catch (err) {
            console.error('Assign enclosure failed:', err);
            showModalMessageRef.current('Error', `Failed to assign animal: ${err.response?.data?.message || err.message}`);
            // Rollback
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animalIdPublic ? { ...a, enclosureId: null } : a));
            setEnclosureAnimals(prev => prev.filter(a => a.id_public !== animalIdPublic));
        }
    }, [API_BASE_URL, authToken, logEnclosureHistory]);

    const handleUnassignAnimalInModal = useCallback(async (animalToUnassign) => {
        if (!animalToUnassign) return;
        const animalIdPublic = animalToUnassign.id_public;
        const originalEnclosureId = animalToUnassign.enclosureId;

        // Optimistic update
        setAllAnimalsRaw(prev => prev.map(a => a.id_public === animalIdPublic ? { ...a, enclosureId: null } : a));
        setEnclosureAnimals(prev => prev.filter(a => a.id_public !== animalIdPublic));

        try {
            await axios.patch(`${API_BASE_URL}/enclosures/assign-animal`, { animalId_public: animalIdPublic, enclosureId: null }, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } });
            logEnclosureHistory(originalEnclosureId, 'unassign_animal', {
                animalId: animalIdPublic,
                animalName: animalToUnassign.name,
                prefix: animalToUnassign.prefix,
                suffix: animalToUnassign.suffix
            });
        } catch (err) {
            console.error('Unassign enclosure failed:', err);
            showModalMessageRef.current('Error', `Failed to unassign animal: ${err.response?.data?.message || err.message}`);
            // Rollback
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animalIdPublic ? { ...a, enclosureId: originalEnclosureId } : a));
            setEnclosureAnimals(prev => [...prev, animalToUnassign]);
        }
    }, [API_BASE_URL, authToken, logEnclosureHistory]);

    const handleOpenDetail = (enclosure) => {
        setSelectedEnclosure(enclosure);
        setShowDetailModal(true);
        setLoadingAnimals(false); // Not loading from API anymore

        const enclosureId = enclosure._id || enclosure.id;
        const enrichedEnclosure = { ...enclosure, locationName: getLocationPath(enclosure.buildingId, enclosure.roomId, locations) };

        setSelectedEnclosure(enrichedEnclosure);

        const occupants = allAnimalsRaw.filter(a => a.enclosureId === enclosureId); // This is correct
        setEnclosureAnimals(occupants);
    };

    const assignableAnimals = useMemo(() => {
        if (!selectedEnclosure) return [];
        
        const suitableSpecies = new Set(selectedEnclosure.speciesLabels || []);
        const unassignableStatuses = ['Deceased', 'Rehomed', 'Sold'];

        let filteredAnimals = allAnimalsRaw.filter(a => 
            !a.enclosureId && 
            !a.isViewOnly &&
            !a.archived &&
            !unassignableStatuses.includes(a.status)
        );

        // Purpose-based filtering
        switch (selectedEnclosure.purpose) {
            case 'reproduction': // Nursery / Breeding
                filteredAnimals = filteredAnimals.filter(a => a.isPlannedMating || a.isInMating || a.isPregnant || a.isNursing);
                break;
            case 'medical':
            case 'quarantine':
                filteredAnimals = filteredAnimals.filter(a => a.isInTreatment === true || a.isQuarantine === true);
                break;
            case 'general':
            default:
                // No additional animal state filtering for 'general'
                break;
        }

        // Finally, filter by suitable species if specified
        if (suitableSpecies.size > 0) {
            filteredAnimals = filteredAnimals.filter(a => suitableSpecies.has(a.species));
        }

        return filteredAnimals;
    }, [allAnimalsRaw, selectedEnclosure]);



    // Fetch user's custom species order on mount
    useEffect(() => {
        const fetchSpeciesOrder = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/species-order`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                if (response.data && Array.isArray(response.data.speciesOrder)) {
                    setUserSpeciesOrder(response.data.speciesOrder);
                }
            } catch (error) {
                console.error('[SPECIES ORDER] Error fetching:', error);
            }
        };
        if (authToken) {
            fetchSpeciesOrder();
        }
    }, [authToken, API_BASE_URL]);

    const groupedAnimals = useMemo(() => {
        let source = animals;

        if (categoryFilter) {
            source = source.filter(a => getSpeciesCategory(a.species) === categoryFilter);
        }

        // Status filter
        if (statusFilter) {
            source = source.filter(a => a.status === statusFilter);
        }

        // Name search (applied on Search button click)
        if (appliedNameFilter) {
            const term = appliedNameFilter.toLowerCase();
            source = source.filter(a => {
                const name = (a.name || '').toString().toLowerCase();
                const registry = (a.breederAssignedId || a.registryCode || '').toString().toLowerCase();
                const idPublic = (a.id_public || '').toString().toLowerCase();
                const tags = (a.tags || []).map(t => t.toLowerCase());
                const tagsMatch = tags.some(tag => tag.includes(term));
                return name.includes(term) || registry.includes(term) || idPublic.includes(term.replace(/^ct-?/,'').toLowerCase()) || tagsMatch;
            });
        }

        // Species filter
         if (speciesFilter) {
            source = source.filter(a => a.species === speciesFilter);
        }

        // Gender filter
        if (genderFilter) {
            source = source.filter(a => a.gender === genderFilter);
        }

        // Pregnant / Nursing / Mating filters
        if (statusFilterPregnant || statusFilterNursing) {
            source = source.filter(a => (a.gender || '').toLowerCase() !== 'male');
        }
        if (statusFilterPregnant) source = source.filter(a => a.isPregnant === true);
        if (statusFilterNursing) source = source.filter(a => a.isNursing === true);
        if (statusFilterMating) source = source.filter(a => a.isInMating === true);

        // Public/private filter
        if (publicFilter === 'public') {
            source = source.filter(a => a.showOnPublicProfile === true);
        } else if (publicFilter === 'private') {
            source = source.filter(a => !a.showOnPublicProfile);
        }

        // Ownership filter
        if (ownedFilterMode === 'owned') {
            source = source.filter(a => a.isOwned !== false); // isOwned: true or undefined for owned, false for unowned
        }
        // Breeding line filter
        if (blFilter.length > 0) {
            source = source.filter(a => {
                const assigned = animalBreedingLines[a.id_public] || [];
                return blFilter.some(lineId => assigned.map(String).includes(String(lineId)));
            });
        }

        // Create a new array to sort to avoid mutating the original source
        const sortedSource = [...source];

        // Sorting logic
        if (sortConfig.key) {
            sortedSource.sort((a, b) => {
                const dir = sortConfig.direction === 'ascending' ? 1 : -1;
                let valA, valB;

                if (sortConfig.key === 'name') {
                    valA = (a.name || '').toLowerCase();
                    valB = (b.name || '').toLowerCase();
                } else if (sortConfig.key === 'birthdate') {
                    const dateA = a.birthDate ? new Date(a.birthDate) : null;
                    const dateB = b.birthDate ? new Date(b.birthDate) : null;
                    if (dateA === dateB) return 0;
                    if (dateA === null) return 1; // nulls/invalid dates last
                    if (dateB === null) return -1;
                    valA = dateA.getTime();
                    valB = dateB.getTime();
                }

                if (valA < valB) return -1 * dir;
                if (valA > valB) return 1 * dir;
                
                return 0;
            });
        }
        return sortedSource.reduce((groups, animal) => { // ownedFilterMode is a direct dependency now
            const species = animal.species || 'Unspecified Species';
            if (!groups[species]) {
                groups[species] = [];
            }
            groups[species].push(animal);
            return groups;
        }, {});
    }, [animals, statusFilter, genderFilter, speciesFilter, categoryFilter, statusFilterPregnant, statusFilterNursing, statusFilterMating, publicFilter, blFilter, appliedNameFilter, animalBreedingLines, ownedFilterMode, sortConfig, userProfile]);

    const displayedAnimalsForList = useMemo(() => {
        let source = animals;

        if (categoryFilter) {
            source = source.filter(a => getSpeciesCategory(a.species) === categoryFilter);
        }
        if (statusFilter) source = source.filter(a => a.status === statusFilter);
        if (appliedNameFilter) {
            const term = appliedNameFilter.toLowerCase();
            source = source.filter(a => {
                const name = (a.name || '').toString().toLowerCase();
                const registry = (a.breederAssignedId || a.registryCode || '').toString().toLowerCase();
                const idPublic = (a.id_public || '').toString().toLowerCase();
                const tags = (a.tags || []).map(t => t.toLowerCase());
                const tagsMatch = tags.some(tag => tag.includes(term));
                return name.includes(term) || registry.includes(term) || idPublic.includes(term.replace(/^ct-?/,'').toLowerCase()) || tagsMatch;
            });
        }
        if (speciesFilter) source = source.filter(a => a.species === speciesFilter);
        if (genderFilter) source = source.filter(a => a.gender === genderFilter);
        if (statusFilterPregnant) source = source.filter(a => a.isPregnant === true);
        if (statusFilterNursing) source = source.filter(a => a.isNursing === true);
        if (statusFilterMating) source = source.filter(a => a.isInMating === true);
        if (publicFilter === 'public') {
            source = source.filter(a => a.showOnPublicProfile === true);
        } else if (publicFilter === 'private') {
            source = source.filter(a => !a.showOnPublicProfile);
        }
        if (ownedFilterMode === 'owned') source = source.filter(a => a.isOwned !== false);
        if (blFilter.length > 0) source = source.filter(a => { const assigned = animalBreedingLines[a.id_public] || []; return blFilter.some(lineId => assigned.map(String).includes(String(lineId))); });
        const sortedSource = [...source];
        if (sortConfig.key) {
            sortedSource.sort((a, b) => {
                const dir = sortConfig.direction === 'ascending' ? 1 : -1;
                let valA, valB;
                if (sortConfig.key === 'name') {
                    valA = (a.name || '').toLowerCase();
                    valB = (b.name || '').toLowerCase();
                } else if (sortConfig.key === 'birthdate') {
                    const dateA = a.birthDate ? new Date(a.birthDate) : null;
                    const dateB = b.birthDate ? new Date(b.birthDate) : null;
                    if (dateA === dateB) return 0;
                    if (dateA === null) return 1;
                    if (dateB === null) return -1;
                    valA = dateA.getTime();
                    valB = dateB.getTime();
                }
                if (valA < valB) return -1 * dir;
                if (valA > valB) return 1 * dir;
                return 0;
            });
        }
        return sortedSource;
    }, [animals, statusFilter, genderFilter, speciesFilter, categoryFilter, statusFilterPregnant, statusFilterNursing, statusFilterMating, publicFilter, blFilter, appliedNameFilter, animalBreedingLines, ownedFilterMode, sortConfig, userProfile]);

    const displayedAnimalCount = useMemo(() => {
        return Object.values(groupedAnimals).reduce((sum, arr) => sum + arr.length, 0);
    }, [groupedAnimals]);
    
    const speciesNames = useMemo(() => {
        return [...allUserSpecies].sort((a, b) => {
            // Use user's custom order if available
            if (userSpeciesOrder.length > 0) {
                const aIndex = userSpeciesOrder.indexOf(a);
                const bIndex = userSpeciesOrder.indexOf(b);
                
                // Both are in user's custom order
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                // Only a is in custom order, it comes first
                if (aIndex !== -1) return -1;
                // Only b is in custom order, it comes first
                if (bIndex !== -1) return 1;
                // Neither in custom order, use alphabetical
                return a.localeCompare(b);
            }
            
            // Fallback to default order (Mouse, Rat, Hamster, then alphabetical)
            const order = ['Mouse', 'Rat', 'Hamster'];
            const aIndex = order.indexOf(a);
            const bIndex = order.indexOf(b);
            
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.localeCompare(b);
        });
    }, [allUserSpecies, userSpeciesOrder]);

    const allSpeciesCategories = useMemo(() => {
        const categories = new Set(allUserSpecies.map(getSpeciesCategory));
        return ['All Categories', ...Array.from(categories).sort()];
    }, [allUserSpecies]);

    const filteredSpeciesNames = useMemo(() => {
        if (!categoryFilter) {
            return speciesNames;
        }
        return speciesNames.filter(species => getSpeciesCategory(species) === categoryFilter);
    }, [speciesNames, categoryFilter]);

    // -- Dashboard & Management Data Calculations --
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysSince = (dateStr) => {
        if (!dateStr) return null;
        const d = parseLocalDate(dateStr);
        d.setHours(0, 0, 0, 0);
        return Math.floor((today - d) / 86400000);
    };

    const isDue = (lastDate, freqDays) => {
        if (!freqDays) return false;
        if (!lastDate) return true;
        const ds = daysSince(lastDate);
        return ds !== null && ds >= Number(freqDays);
    };

    // Feeding uses an hours-based interval (supports multiple feedings/day, e.g. 12h = 2x/day),
    // so it needs real elapsed-hours precision rather than the midnight-truncated daysSince() above.
    const hoursSince = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        return (Date.now() - d.getTime()) / 3600000;
    };

    const isFeedingDue = (lastDate, intervalHours) => {
        if (!intervalHours) return false;
        if (!lastDate) return true;
        const hrs = hoursSince(lastDate);
        return hrs !== null && hrs >= Number(intervalHours);
    };

    const formatFeedingInterval = (hours) => {
        const h = Number(hours);
        if (!h) return '';
        if (h % 24 === 0) return `Every ${h / 24}d`;
        if (h < 24) return `Every ${h}h`;
        return `Every ${Math.floor(h / 24)}d ${h % 24}h`;
    };

    const parseArrayField = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try { return JSON.parse(val); } catch { return [{ name: String(val) }]; }
    };

    const calcNextDose = (med) => {
        if (!med.intervalValue || !med.intervalUnit) return null;
        // A finished medication (stop date reached) has no more doses due.
        if (med.stopDate && new Date(med.stopDate) <= new Date()) return null;
        const v = Number(med.intervalValue);
        const unitMs = med.intervalUnit === 'hours' ? 3600000
            : med.intervalUnit === 'days' ? 86400000
            : med.intervalUnit === 'weeks' ? 604800000
            : med.intervalUnit === 'months' ? 2592000000 : null;
        if (!unitMs) return null;
        // Anchor the schedule to the most recently confirmed dose, falling back to the start date.
        const lastAdmin = med.administrations?.length > 0 ? med.administrations[med.administrations.length - 1].date : null;
        const anchor = lastAdmin || med.startDate;
        if (!anchor) return null;
        const start = new Date(anchor).getTime();
        if (isNaN(start)) return null;
        const intervalMs = v * unitMs;
        const now = Date.now();
        const elapsed = now - start;
        if (elapsed < 0) return new Date(start);
        const nextDose = new Date(start + (Math.floor(elapsed / intervalMs) + 1) * intervalMs);
        return nextDose;
    };

    const formatNextDose = (date) => {
        const today = new Date(); today.setHours(0,0,0,0);
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const d = parseLocalDate(date); d.setHours(0,0,0,0);
        if (date <= Date.now()) return 'due now';
        if (d.getTime() === today.getTime()) return 'today';
        if (d.getTime() === tomorrow.getTime()) return 'tomorrow';
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    // --- Dashboard Counter Calculations ---
    // Per your instructions, these counters strictly follow these rules:
    // - Total = All animals excluding sold/archived.
    // - Owned = All owned animals excluding sold/archived.
    // - Public = All public animals excluding sold/archived.
    // - Sold/Archived = All animals that are sold (transferred) or archived.
    // - DECEASED animals are NOT excluded from any of these counts.

    // Sold/Archived = all transferred (isViewOnly) + Archived.
    const soldOrArchivedCount = useMemo(() => {
         return allAnimalsRaw.filter(a => a.archived || a.isViewOnly).length;
}, [allAnimalsRaw]);

    // Dashboard Counters
    const totalDashboardAnimalsCount = activeAnimalsForDashboard.length;
    const ownedDashboardCount = activeAnimalsForDashboard.filter(a => a.isOwned !== false).length;
    const publicDashboardCount = activeAnimalsForDashboard.filter(a => a.showOnPublicProfile === true).length;

    const availableDashboardList = useMemo(() => {
        return activeAnimalsForDashboard.filter(a => a.status === 'Available');
    }, [activeAnimalsForDashboard]);

    // "Feeding & Care" needs-attention entries for the main dashboard — one entry per animal with the
    // list of reasons (feeding, custom animal care tasks, and/or Grooming/Special Care/Training
    // schedules) so the breakdown dropdown can show which animal(s) and why, not just a bare count.
    const feedingCareDueDashboard = useMemo(() => {
        return activeAnimalsForDashboard
            .map(a => {
                const reasons = [];
                if (isFeedingDue(a.lastFedDate, a.feedingIntervalHours)) reasons.push('Feeding due');
                (a.animalCareTasks || []).forEach(t => {
                    if (isDue(t.lastDoneDate, t.frequencyDays)) reasons.push(`${t.taskName} due`);
                });
                GROOMING_SCHEDULE_DEFS.forEach(def => {
                    if (a[def.key]?.frequencyDays && isDue(a[def.key]?.lastDoneDate, a[def.key]?.frequencyDays)) reasons.push(`${def.label} due`);
                });
                TRAINING_SCHEDULE_DEFS.forEach(def => {
                    if (a[def.key]?.frequencyDays && isDue(a[def.key]?.lastDoneDate, a[def.key]?.frequencyDays)) reasons.push(`${def.label} due`);
                });
                return { animal: a, reasons };
            })
            .filter(entry => entry.reasons.length > 0);
    }, [activeAnimalsForDashboard]);

    const reproEnclosures = enclosures.filter(e => e.purpose === 'reproduction');
    const reproEnclosureIds = new Set(reproEnclosures.map(e => e._id));
    const inReproEnclosure = a => a.enclosureId && reproEnclosureIds.has(a.enclosureId);

    const healthEnclosures = enclosures.filter(e => e.purpose === 'medical' || e.purpose === 'quarantine');
    const healthEnclosureIds = new Set(healthEnclosures.map(e => e._id));
    const inHealthEnclosure = useCallback(a => a.enclosureId && healthEnclosureIds.has(a.enclosureId), [healthEnclosureIds]);

    const isTaskDue = useCallback((task) => {
        const freq = task.frequencyDays || task.frequency;
        if (!freq) return false;
        if (!task.lastDoneDate) return true;

        const lastDone = parseLocalDate(task.lastDoneDate);
        const nextDue = new Date(lastDone);
        
        let frequencyInDays = task.frequencyDays;
        if (!frequencyInDays && task.frequency) {
            if (task.frequencyUnit === 'weeks') {
                frequencyInDays = task.frequency * 7;
            } else if (task.frequencyUnit === 'months') {
                frequencyInDays = task.frequency * 30;
            } else { // Assumes 'days'
                frequencyInDays = task.frequency;
            }
        }

        if (!frequencyInDays) return false;

        nextDue.setDate(nextDue.getDate() + Number(frequencyInDays));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        nextDue.setHours(0, 0, 0, 0);

        return nextDue <= today;
    }, []);

    const enclosureMaintenanceDueCount = useMemo(() => {
        return enclosures.reduce((count, enc) => {
            const hasDueTask = (enc.cleaningTasks || []).some(isTaskDue);
            return count + (hasDueTask ? 1 : 0);
        }, 0);
    }, [enclosures, isTaskDue]);

    const enclosuresNeedingAttention = useMemo(() => {
        return enclosures
            .map(enc => ({
                ...enc,
                dueTasks: (enc.cleaningTasks || []).filter(isTaskDue)
            }))
            .filter(enc => enc.dueTasks.length > 0);
    }, [enclosures, isTaskDue]);

    const totalDueEnclosureTasks = useMemo(() => {
        return enclosuresNeedingAttention.reduce((sum, enc) => sum + enc.dueTasks.length, 0);
    }, [enclosuresNeedingAttention]);

    const dueEnclosureTasksByType = useMemo(() => {
        const taskCounts = {};

        enclosuresNeedingAttention.forEach(enc => {
            enc.dueTasks.forEach(task => {
                const type = task.type || 'Other';
                taskCounts[type] = (taskCounts[type] || 0) + 1;
            });
        });

        return Object.entries(taskCounts)
            .map(([type, count]) => ({ type, count }))
            .filter(item => item.count > 0);
    }, [enclosuresNeedingAttention]);

    // The original 'allAnimals' variable (used for the main list and management views) remains unchanged.
    // Must exclude view-only animals (e.g. transferred away, kept only for pedigree/history access) —
    // otherwise a transferred animal with stale isQuarantine/isInTreatment flags keeps showing up here
    // for the previous owner even though it's no longer theirs to manage.
    const quarantineList = allAnimalsRaw.filter(a => a.isQuarantine && !a.isViewOnly && !inHealthEnclosure(a));
    const treatmentList = allAnimalsRaw.filter(a => a.isInTreatment && !a.isQuarantine && !a.isViewOnly && !inHealthEnclosure(a));
    const allAnimals = allAnimalsRaw.filter(a => !a.isViewOnly);
    const activeMedicationsCount = treatmentList.reduce((sum, a) => sum + parseArrayField(a.medications).filter(m => !m.status || m.status === 'active').length, 0);
    // Entries needing action now: a medication dose is due, or a quarantine end date has been reached.
    const healthNeedsAttentionList = [
        ...treatmentList.flatMap(animal => parseArrayField(animal.medications)
            .filter(m => !m.status || m.status === 'active')
            .map(m => calcNextDose(m))
            .filter(next => next && next.getTime() <= Date.now())
            .map(() => ({ animal, reason: 'Medication dose due' }))
        ).filter((item, idx, arr) => arr.findIndex(o => o.animal.id_public === item.animal.id_public) === idx),
        ...quarantineList.filter(a => a.quarantineDetails?.endDate && daysSince(a.quarantineDetails.endDate) >= 0).map(animal => ({ animal, reason: 'Quarantine end date reached' })),
        // A Concern/Critical derived health status is itself an actionable alert, regardless of quarantine/treatment state.
        ...allAnimals.filter(a => ['Concern', 'Critical'].includes(remapLegacyHealthStatus(a.healthStatusOverride || a.healthStatus)))
            .map(animal => ({ animal, reason: `Health status: ${remapLegacyHealthStatus(animal.healthStatusOverride || animal.healthStatus)}` })),
    ];

    const activeReproEventsByAnimal = useMemo(() => {
        const map = new Map();
        if (!litters || litters.length === 0) return map;

        const sortedLitters = [...litters].sort((a, b) => {
            const dateA = new Date(a.birthDate || a.pregnancyDate || a.matingDate || a.pairingDate || a.createdAt).getTime() || 0;
            const dateB = new Date(b.birthDate || b.pregnancyDate || b.matingDate || b.pairingDate || b.createdAt).getTime() || 0;
            return dateB - dateA;
        });

        sortedLitters.forEach(litter => {
            const hasBirth = !!litter.birthDate;
            // Nursing only ends once weaning is explicitly confirmed via the "Wean Today" action —
            // recording/correcting a weaningDate value alone shouldn't close the litter.
            const isWeaned = !!litter.weaningConfirmed;
            const hasPregnancy = !!litter.pregnancyDate;
            const isClosed = litter.pregnancyLost || (hasBirth && isWeaned);
            const isNursing = hasBirth && !isWeaned && !isClosed;
            const isPregnant = hasPregnancy && !hasBirth && !isClosed;
            // A planned mating only advances to "mating" via the explicit "Mated Today" action
            // (which clears isPlanned) — a matingDate arriving on its own doesn't advance it.
            const isMated = !litter.isPlanned && !!litter.matingDate && !hasPregnancy && !hasBirth && !isClosed;
            const isPlanned = litter.isPlanned && !hasPregnancy && !hasBirth && !isClosed;

            let status = null;
            if (isNursing) status = 'nursing';
            else if (isPregnant) status = 'pregnant';
            else if (isMated) status = 'mating';
            else if (isPlanned) status = 'planned';

            if (status) {
                const litterInfo = {
                    status,
                    _litterId: litter._id,
                    matingDate: litter.matingDate || litter.pairingDate,
                    dueDate: litter.expectedDueDate,
                    birthDate: litter.birthDate,
                    weaningDate: litter.weaningDate,
                };

                if (litter.sireId_public && !map.has(litter.sireId_public)) {
                    map.set(litter.sireId_public, litterInfo);
                }
                if (litter.damId_public && !map.has(litter.damId_public)) {
                    map.set(litter.damId_public, litterInfo);
                }
            }
        });
        return map;
    }, [litters]);

    const mergeLitterData = useCallback((animal) => {
        const litterInfo = activeReproEventsByAnimal.get(animal.id_public) || {};
        return {
            ...animal,
            reproStatus: litterInfo.status,
            matingDate: litterInfo.matingDate,
            dueDate: litterInfo.dueDate,
            birthDate: litterInfo.birthDate,
            weaningDate: litterInfo.weaningDate,
            _litterId: litterInfo._litterId,
        };
    }, [activeReproEventsByAnimal]);

    const plannedMatingList = useMemo(() => allAnimals.filter(a => a.isPlannedMating && !inReproEnclosure(a)).map(mergeLitterData), [allAnimals, inReproEnclosure, mergeLitterData]);
    const matingList = useMemo(() => allAnimals.filter(a => a.isInMating && !inReproEnclosure(a)).map(mergeLitterData), [allAnimals, inReproEnclosure, mergeLitterData]);
    // Membership relies solely on the backend-authoritative flags (which apply the per-species
    // nursing cutoff) — the locally-derived litterStatus above has no cutoff and would otherwise
    // keep long-past litters showing here forever, out of sync with the flag used for the status pill.
    const pregnantList = useMemo(() => allAnimals
        .filter(a => a.gender !== 'Male' && !inReproEnclosure(a) && !!a.isPregnant)
        .map(mergeLitterData), [allAnimals, inReproEnclosure, mergeLitterData]);
    const nursingList = useMemo(() => allAnimals
        .filter(a => a.gender !== 'Male' && !inReproEnclosure(a) && !!a.isNursing)
        .map(mergeLitterData), [allAnimals, inReproEnclosure, mergeLitterData]);
    const availableList = availableAnimalsRaw.filter(a => a.status === 'Available' && !a.isViewOnly); // This is for the For Sale screen, not dashboard
    const feedDue = allAnimals.filter(a => isFeedingDue(a.lastFedDate, a.feedingIntervalHours)); // This is for the Feeding management view
    const animalsWithAnimalTasks = allAnimals.filter(a => a.animalCareTasks?.length > 0); // For Scheduled Care management view
    const animalCareDue = feedDue.length + animalsWithAnimalTasks.reduce((sum, a) => sum + (a.animalCareTasks || []).filter(isTaskDue).length, 0);
    const reproTotal = matingList.length + pregnantList.length + nursingList.length;
    // Entries whose planned mating / due / weaning date lands on today. Checked directly against the
    // litter records rather than the derived isPlannedMating/isPregnant/isNursing flags, because those
    // flags auto-advance to the next stage (mating/closed) as soon as that same date is reached — which
    // would otherwise make the animal disappear from plannedMatingList/nursingList before this alert fires.
    const reproNeedsAttentionList = useMemo(() => {
        const items = [];
        // Stages only advance via an explicit user action ("Mated Today"/confirm birth/"Wean
        // Today"), so a due date that passes without that click must keep alerting (>= 0), not
        // just fire once on the exact day (=== 0) and then silently disappear as "overdue".
        const dueLabel = (days, label) => days > 0 ? `${label} (${days}d overdue)` : label;
        (litters || []).forEach(litter => {
            const dam = litter.damId_public ? allAnimals.find(a => a.id_public === litter.damId_public) : null;
            const sire = litter.sireId_public ? allAnimals.find(a => a.id_public === litter.sireId_public) : null;

            if (litter.isPlanned && !litter.pregnancyDate && !litter.birthDate && litter.matingDate) {
                const days = daysSince(litter.matingDate);
                if (days !== null && days >= 0) {
                    [dam, sire].filter(Boolean).forEach(animal => items.push({ animal, reason: dueLabel(days, 'Planned mating date is today'), view: 'planned' }));
                }
            }
            if (litter.pregnancyDate && !litter.birthDate && litter.expectedDueDate && dam) {
                const days = daysSince(litter.expectedDueDate);
                if (days !== null && days >= 0) items.push({ animal: dam, reason: dueLabel(days, 'Due date is today'), view: 'pregnant' });
            }
            // Skip litters already weaned/closed, and rely on the dam's isNursing flag when
            // available — the backend auto-closes it past the species' maxNursingDays safety-net
            // cutoff (see utils/reproStatusSync.js), so a litter nobody marked "Wean Today" for
            // doesn't alert forever once it's well past any realistic nursing window.
            const stillNursing = dam ? !!dam.isNursing : (!litter.weaningConfirmed && !litter.pregnancyLost);
            if (litter.birthDate && litter.weaningDate && dam && stillNursing) {
                const days = daysSince(litter.weaningDate);
                if (days !== null && days >= 0) items.push({ animal: dam, reason: dueLabel(days, 'Weaning date is today'), view: 'nursing' });
            }
        });
        return items;
    }, [litters, allAnimals]);
    const feedOk = allAnimals.filter(a => a.feedingIntervalHours && !isFeedingDue(a.lastFedDate, a.feedingIntervalHours));
    // Flatten Grooming/Special Care and Training schedules to one entry per assigned task per animal —
    // each schedule is tracked/displayed completely separately (never merged), only shown when assigned.
    const groomingScheduleEntries = allAnimals.flatMap(a =>
        GROOMING_SCHEDULE_DEFS.filter(def => a[def.key]?.frequencyDays).map(def => ({ animal: a, ...def }))
    );
    const groomingScheduleDue = groomingScheduleEntries.filter(entry => isDue(entry.animal[entry.key]?.lastDoneDate, entry.animal[entry.key]?.frequencyDays));
    const groomingScheduleOk = groomingScheduleEntries.filter(entry => !isDue(entry.animal[entry.key]?.lastDoneDate, entry.animal[entry.key]?.frequencyDays));
    const trainingScheduleEntries = allAnimals.flatMap(a =>
        TRAINING_SCHEDULE_DEFS.filter(def => a[def.key]?.frequencyDays).map(def => ({ animal: a, ...def }))
    );
    const trainingScheduleDue = trainingScheduleEntries.filter(entry => isDue(entry.animal[entry.key]?.lastDoneDate, entry.animal[entry.key]?.frequencyDays));
    const trainingScheduleOk = trainingScheduleEntries.filter(entry => !isDue(entry.animal[entry.key]?.lastDoneDate, entry.animal[entry.key]?.frequencyDays));
    // Flatten Custom Animal Care tasks to one entry per task per animal, matching the Grooming/Training bar layout.
    const animalCareTaskEntries = animalsWithAnimalTasks.flatMap(a =>
        (a.animalCareTasks || []).map((task, taskIdx) => ({ animal: a, task, taskIdx }))
    );
    const animalCareTaskDue = animalCareTaskEntries.filter(entry => isDue(entry.task.lastDoneDate, entry.task.frequencyDays));
    const animalCareTaskOk = animalCareTaskEntries.filter(entry => !isDue(entry.task.lastDoneDate, entry.task.frequencyDays));
    const scheduledCareDueCount = animalCareTaskDue.length;
    // Unique-animal totals for the Feeding & Care StatCards (entries assigned, not due counts — Needs Attention covers due).
    const feedingAssignedCount = feedDue.length + feedOk.length;
    const groomingAssignedCount = new Set(groomingScheduleEntries.map(entry => entry.animal.id_public)).size;
    const trainingAssignedCount = new Set(trainingScheduleEntries.map(entry => entry.animal.id_public)).size;
    const scheduledCareAssignedCount = animalsWithAnimalTasks.length;
    const feedingCareNeedsAttentionList = [
        ...feedDue.map(animal => ({ animal, reason: 'Feeding due' })),
        ...groomingScheduleDue.map(entry => ({ animal: entry.animal, reason: `${entry.label} due` })),
        ...trainingScheduleDue.map(entry => ({ animal: entry.animal, reason: `${entry.label} due` })),
        ...animalsWithAnimalTasks.flatMap(a => (a.animalCareTasks || [])
            .filter(t => isDue(t.lastDoneDate, t.frequencyDays))
            .map(t => ({ animal: a, reason: `${t.taskName} due` }))
        ),
    ];
    const soldList = soldTransferredRaw.filter(a => a.isViewOnly);
    const generalEnclosures = enclosures.filter(e => !e.purpose || e.purpose === 'general');
    const enclosureAnimalMap = {}; // { enclosureId: [animals] }
    const unassignedAnimals = [];
    allAnimals.forEach(a => {
        const key = a.enclosureId || 'unassigned';
        if (!enclosureAnimalMap[key]) enclosureAnimalMap[key] = [];
        enclosureAnimalMap[key].push(a);
    });


    // Check if any filters are active (different from defaults) ? uses appliedFilters for panel filters
    const hasActiveFilters = (
        statusFilter !== '' ||
        appliedNameFilter !== '' ||
        genderFilter !== '' ||
        speciesFilter !== '' ||
        categoryFilter !== '' ||
        statusFilterPregnant ||
        statusFilterNursing ||
        statusFilterMating ||
        publicFilter !== '' ||
        blFilter.length > 0
    );

    const handleClearFilters = () => {
        setStatusFilter('');
        setSearchInput('');
        setAppliedNameFilter('');
        setGenderFilter('');
        setSpeciesFilter('');
        setCategoryFilter('');
        setStatusFilterPregnant(false);
        setStatusFilterNursing(false);
        setStatusFilterMating(false);
        setOwnedFilterMode('owned'); // Reset to default 'owned'
        setPublicFilter('');
        setBlFilter([]);
    };
    
    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleRefresh = async () => {
        try {
            setLoading(true);
            
            // Bust the module-level cache so fetchAnimals does a fresh API call
            _alCache = null;

            // Re-fetch the animal list from the server
            await fetchAnimals();
            await fetchAllAnimals();
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setLoading(false);
        }
    };

    // Bulk-assigns a quarantine/isolation or treatment period to one or more animals at once
    // (see AssignHealthStatusModal), mirroring the per-animal archiving logic used by the
    // Health tab in AnimalFormModalV2 (starting a new period over a prior one archives it).
    const handleAssignHealthStatus = async (selectedIds, statusType, details, medication) => {
        setAssigningHealthStatus(true);
        const isQuarantineType = statusType === 'quarantine';

        const results = await Promise.allSettled(selectedIds.map(async (id_public) => {
            const animal = allAnimalsRaw.find(a => a.id_public === id_public);
            if (!animal) return;

            const patch = {};
            let updatedMedications = null;

            if (isQuarantineType) {
                const prevDetails = animal.quarantineDetails || { status: 'None', type: '', reason: '', startDate: '', endDate: '' };
                let history = animal.quarantineHistory || [];
                if (prevDetails.startDate && prevDetails.startDate !== details.startDate) {
                    history = [...history, prevDetails];
                }
                const newDetails = { status: details.status, type: details.type, reason: details.reason, startDate: details.startDate, endDate: details.endDate };
                patch.quarantineDetails = newDetails;
                patch.quarantineHistory = history;
                patch.isQuarantine = isStatusPeriodActive(newDetails);
            } else {
                // Treatment is defined entirely by the medication record (name, dose, reason,
                // start/stop date, interval, notes) \u2014 there's no separate treatmentDetails period.
                if (medication?.name?.trim()) {
                    const medicationRecord = {
                        id: Date.now().toString() + '-' + id_public,
                        name: medication.name.trim(),
                        dose: medication.dose || '',
                        reason: medication.reason || '',
                        notes: medication.notes || '',
                        startDate: medication.startDate || null,
                        stopDate: medication.stopDate || null,
                        intervalValue: medication.intervalValue ? Number(medication.intervalValue) : null,
                        intervalUnit: medication.intervalUnit || 'hours',
                        source: 'manual'
                    };
                    updatedMedications = [...parseArrayField(animal.medications), medicationRecord];
                    patch.medications = updatedMedications;
                }
                // isInTreatment is derived from active medications/critical conditions \u2014
                // recompute using the (possibly just-added) medication.
                patch.isInTreatment = computeIsInTreatment({
                    medications: updatedMedications !== null ? updatedMedications : animal.medications,
                    medicalConditions: animal.medicalConditions,
                });
            }

            setAllAnimalsRaw(prev => prev.map(a => a.id_public === id_public ? { ...a, ...patch } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public, ...patch } }));

            await axios.put(`${API_BASE_URL}/animals/${id_public}`, patch,
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } });
        }));

        setAssigningHealthStatus(false);
        setShowAssignHealthStatusModal(false);

        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length > 0) {
            console.error('Failed to assign health status to some animals:', failures);
            showModalMessage('Partial Failure', `Assigned to ${selectedIds.length - failures.length} of ${selectedIds.length} animal(s). ${failures.length} failed — please refresh and try again.`);
            fetchAllAnimals();
        }
    };

    const triggerSearch = () => {
        const term = searchInput.trim();
        if (!term) {
            // empty -> clear filter
            setAppliedNameFilter('');
            return;
        }
        if (term.length < 3) {
            showModalMessage('Search Info', 'Please enter at least 3 characters to search.');
            return;
        }
        setAppliedNameFilter(term);
    };

    const toggleBulkDeleteMode = (species) => {
        setBulkDeleteMode(prev => ({ ...prev, [species]: !prev[species] }));
        setSelectedAnimals(prev => ({ ...prev, [species]: [] }));
    };

    const toggleBulkArchiveMode = (species) => {
        setBulkArchiveMode(prev => ({ ...prev, [species]: !prev[species] }));
        setSelectedAnimals(prev => ({ ...prev, [species]: [] }));
    };

    const toggleAnimalSelection = (species, animalId) => {
        setSelectedAnimals(prev => {
            const current = prev[species] || [];
            const updated = current.includes(animalId)
                ? current.filter(id => id !== animalId)
                : [...current, animalId];
            return { ...prev, [species]: updated };
        });
    };

    const toggleAnimalPrivacy = async (animalId, newPrivacyValue) => {
        // Update local state immediately for instant UI feedback
        const updatedAnimals = animals.map(animal => 
            animal.id_public === animalId 
                ? { ...animal, showOnPublicProfile: newPrivacyValue, isDisplay: newPrivacyValue }
                : animal
        );
        setAnimals(updatedAnimals);
        window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animalId, showOnPublicProfile: newPrivacyValue, isDisplay: newPrivacyValue } }));

        // Update database in the background
        try {
            const response = await fetch(`${API_BASE_URL}/animals/${animalId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ 
                    showOnPublicProfile: newPrivacyValue,
                    isDisplay: newPrivacyValue 
                })
            });

            if (!response.ok) {
                // Revert on failure
                const revertedAnimals = animals.map(animal => 
                    animal.id_public === animalId 
                        ? { ...animal, showOnPublicProfile: !newPrivacyValue, isDisplay: !newPrivacyValue }
                        : animal
                );
                setAnimals(revertedAnimals);
                showModalMessage('Error', 'Failed to update privacy setting.');
            }
        } catch (error) {
            console.error('Error updating privacy:', error);
            // Revert on error
            const revertedAnimals = animals.map(animal => 
                animal.id_public === animalId 
                    ? { ...animal, showOnPublicProfile: !newPrivacyValue, isDisplay: !newPrivacyValue }
                    : animal
            );
            setAnimals(revertedAnimals);
            showModalMessage('Error', 'Failed to update privacy setting.');
        }
    };

    const toggleAnimalOwned = async (animalId, newOwnedValue) => {
        // Update local state immediately for instant UI feedback
        const updatedAnimals = animals.map(animal => 
            animal.id_public === animalId 
                ? { ...animal, isOwned: newOwnedValue }
                : animal
        );
        setAnimals(updatedAnimals);
        window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animalId, isOwned: newOwnedValue } }));

        // Update database in the background
        try {
            const response = await fetch(`${API_BASE_URL}/animals/${animalId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ 
                    isOwned: newOwnedValue
                })
            });

            if (!response.ok) {
                // Revert on failure
                const revertedAnimals = animals.map(animal => 
                    animal.id_public === animalId 
                        ? { ...animal, isOwned: !newOwnedValue }
                        : animal
                );
                setAnimals(revertedAnimals);
                showModalMessage('Error', 'Failed to update owned status.');
            }
        } catch (error) {
            console.error('Error updating owned status:', error);
            // Revert on error
            const revertedAnimals = animals.map(animal => 
                animal.id_public === animalId 
                    ? { ...animal, isOwned: !newOwnedValue }
                    : animal
            );
            setAnimals(revertedAnimals);
            showModalMessage('Error', 'Failed to update owned status.');
        }
    };

    const toggleBulkPrivacy = async (species, makePublic) => {
        const speciesAnimals = groupedAnimals[species] || [];
        const animalIds = speciesAnimals.map(animal => animal.id_public);
        
        if (animalIds.length === 0) {
            showModalMessage('No Animals', 'No animals found for this species.');
            return;
        }

        const action = makePublic ? 'public' : 'private';
        const confirmChange = window.confirm(`Are you sure you want to make all ${animalIds.length} ${getSpeciesDisplayName(species)} animals ${action}?`);
        if (!confirmChange) return;

        // Update local state immediately for instant UI feedback
        const updatedAnimals = animals.map(animal => 
            animalIds.includes(animal.id_public) 
                ? { ...animal, showOnPublicProfile: makePublic, isDisplay: makePublic }
                : animal
        );
        setAnimals(updatedAnimals);
        setAllAnimalsRaw(prev => prev.map(animal =>
            animalIds.includes(animal.id_public)
                ? { ...animal, showOnPublicProfile: makePublic, isDisplay: makePublic }
                : animal
        ));

        // Update database in the background
        let failedUpdates = 0;
        for (const animalId of animalIds) {
            try {
                await fetch(`${API_BASE_URL}/animals/${animalId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ 
                        showOnPublicProfile: makePublic,
                        isDisplay: makePublic 
                    })
                });
            } catch (error) {
                console.error(`Error updating animal ${animalId}:`, error);
                failedUpdates++;
            }
        }

        // Show notification if there were failures
        if (failedUpdates > 0) {
            showModalMessage('Partial Success', `Updated locally, but ${failedUpdates} animal(s) failed to sync with the server. They will be updated on next refresh.`);
        }
    };

    const toggleAllAnimalsPrivacy = async (makePublic) => {
        if (animals.length === 0) {
            showModalMessage('No Animals', 'No animals found.');
            return;
        }

        const action = makePublic ? 'public' : 'private';
        const confirmChange = window.confirm(`Are you sure you want to make ALL ${animals.length} animals ${action}?`);
        if (!confirmChange) return;

        // Update local state immediately for instant UI feedback
        const updatedAnimals = animals.map(animal => ({
            ...animal,
            showOnPublicProfile: makePublic,
            isDisplay: makePublic
        }));
        setAnimals(updatedAnimals);
        setAllAnimalsRaw(prev => prev.map(animal => ({
            ...animal,
            showOnPublicProfile: makePublic,
            isDisplay: makePublic
        })));

        // Update database in the background
        let failedUpdates = 0;
        for (const animal of animals) {
            try {
                await fetch(`${API_BASE_URL}/animals/${animal.id_public}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ 
                        showOnPublicProfile: makePublic,
                        isDisplay: makePublic 
                    })
                });
            } catch (error) {
                console.error(`Error updating animal ${animal.id_public}:`, error);
                failedUpdates++;
            }
        }

        // Show notification if there were failures
        if (failedUpdates > 0) {
            showModalMessage('Partial Success', `Updated locally, but ${failedUpdates} animal(s) failed to sync with the server. They will be updated on next refresh.`);
        }
    };

    const handleListToggle = (animalId) => {
        setListSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(animalId)) {
                next.delete(animalId);
            } else {
                next.add(animalId);
            }
            return next;
        });
    };

    const handleListSelectAll = (e) => {
        if (e.target.checked) {
            setListSelectedIds(new Set(displayedAnimalsForList.map(a => a.id_public)));
        } else {
            setListSelectedIds(new Set());
        }
    };

    const handleBulkDelete = async (species) => {
        const selectedIds = selectedAnimals[species] || [];
        if (selectedIds.length === 0) {
            showModalMessage('No Selection', 'Please select at least one animal to delete.');
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedIds.length} animal(s)? This action cannot be undone.`);
        if (!confirmDelete) return;

        try {
            setLoading(true);
            for (const id of selectedIds) {
                await axios.delete(`${API_BASE_URL}/animals/${id}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            }
            showModalMessage('Success', `Successfully deleted ${selectedIds.length} animal(s).`);
            setBulkDeleteMode(prev => ({ ...prev, [species]: false }));
            setSelectedAnimals(prev => ({ ...prev, [species]: [] }));
            await fetchAnimals();
            await fetchAllAnimals();
        } catch (error) {
            console.error('Error deleting animals:', error);
            showModalMessage('Error', 'Failed to delete some animals. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkArchive = async (species) => {
        const selectedIds = selectedAnimals[species] || [];
        if (selectedIds.length === 0) {
            showModalMessage('No Selection', 'Please select at least one animal to archive.');
            return;
        }

        const confirmArchive = window.confirm(`Archive ${selectedIds.length} animal(s)? They will be hidden from your main lists but remain in pedigrees.`);
        if (!confirmArchive) return;

        try {
            setLoading(true);
            for (const id of selectedIds) {
                // Archive endpoint is a RESTful PUT with { archived: true } on the animal resource
                // itself — there is no separate POST /:id/archive command endpoint on the backend.
                await axios.put(`${API_BASE_URL}/animals/${id}`, { archived: true }, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            }
            window.dispatchEvent(new Event('animals-changed'));
            showModalMessage('Success', `Successfully archived ${selectedIds.length} animal(s).`);
            setBulkArchiveMode(prev => ({ ...prev, [species]: false }));
            setSelectedAnimals(prev => ({ ...prev, [species]: [] }));
            await fetchAnimals();
            await fetchAllAnimals();
        } catch (error) {
            console.error('Error archiving animals:', error);
            showModalMessage('Error', 'Failed to archive some animals. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const AnimalCard = ({ animal, onEditAnimal, species, isSelectable, isSelected, onToggleSelect, onTogglePrivacy, onToggleOwned, hideControls, hideBreedingLines, cardActions }) => {
        const birth = animal.birthDate ? formatDate(animal.birthDate) : '';
        const imgSrc = animal.imageUrl || animal.photoUrl || null;

        const handleClick = () => {
            if (isSelectable) {
                onToggleSelect(species, animal.id_public);
            } else {
                onViewAnimal(animal);
            }
        };

        return (
            <div className="w-full flex justify-center">
                    <div
                        onClick={handleClick}
                        className={`relative bg-white dark:bg-dark-surface rounded-lg sm:rounded-xl shadow-sm w-full max-w-[165px] sm:max-w-[140px] md:max-w-[176px] min-h-44 sm:min-h-48 md:min-h-56 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 pt-2 sm:pt-3 ${isSelected ? 'border-red-500' : 'border-gray-300 dark:border-dark-border'}`}
                    >
                    {isSelectable && (
                        <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggleSelect(species, animal.id_public)}
                                className="w-5 h-5 cursor-pointer"
                            />
                        </div>
                    )}
                    {/* Transfer icon top-left */}
                    {animal.originalCreatorId && !isSelectable && (
                        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 text-black" title="Received Animal">
                            <ArrowLeftRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2.5} />
                        </div>
                    )}

                    {/* Birthdate center-top - only show if not in selection mode */}
                    {birth && !isSelectable && (
                        <div className="absolute top-1 sm:top-2 left-1/2 transform -translate-x-1/2 text-[10px] sm:text-xs text-gray-600 dark:text-dark-text-secondary bg-white/80 dark:bg-dark-surface/80 px-1 sm:px-2 py-0.5 rounded">
                            {birth}
                        </div>
                    )}

                    {/* Gender badge top-right */}
                    {animal.gender && (
                        <div className={`absolute top-1 sm:top-2 right-1 sm:right-2`} title={animal.gender}>
                            {animal.gender === 'Male' ? <Mars className="w-3 h-3 sm:w-4 sm:h-4 text-primary dark:text-primary" strokeWidth={2.5} /> : animal.gender === 'Female' ? <Venus className="w-3 h-3 sm:w-4 sm:h-4 text-accent dark:text-accent" strokeWidth={2.5} /> : animal.gender === 'Intersex' ? <VenusAndMars className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 dark:text-purple-400" strokeWidth={2.5} /> : <Circle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" strokeWidth={2.5} />}
                        </div>
                    )}

                    {/* Centered profile image */}
                    <div className="flex items-center justify-center w-full px-1 sm:px-2 mt-0.5 sm:mt-1 h-20 sm:h-20 md:h-28">
                        {imgSrc ? (
                            <img src={imgSrc} alt={animal.name} className="max-w-20 max-h-20 sm:max-w-20 sm:max-h-20 md:max-w-24 md:max-h-24 w-auto h-auto object-contain rounded-md" />
                        ) : (
                            <div className="w-20 h-20 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 dark:bg-dark-surface-hover rounded-md flex items-center justify-center text-gray-400 dark:text-dark-text-muted">
                                <Cat className="w-8 h-8 sm:w-8 sm:h-8 md:w-9 md:h-9" />
                            </div>
                        )}
                    </div>
                    
                    {/* Reproductive State Pill */}
                    <div className="w-full flex justify-center items-center py-1 sm:py-1.5 px-1">
                        {(() => {
                            // Determine reproductive state to display (prioritized)
                            let state = null;
                            if (animal.isPregnant) {
                                state = { label: 'Pregnant', color: 'bg-pink-100 text-pink-800', icon: <ScanHeart size={14} className="fill-current" /> };
                            } else if (animal.isNursing) {
                                state = { label: 'Nursing', color: 'bg-violet-100 text-violet-800', icon: <Droplet size={14} /> };
                            } else if (animal.isInMating) {
                                state = { label: 'In Mating', color: 'bg-sky-100 text-sky-800', icon: <Hourglass size={14} /> };
                            } else if (animal.isPlannedMating) {
                                state = { label: 'Planned Mating', color: 'bg-indigo-100 text-indigo-800', icon: <Calendar size={14} /> };
                            }
                            return state ? (
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap ${state.color}`}>
                                    {state.icon} {state.label}
                                </span>
                            ) : null;
                        })()}
                    </div>
                    
                    {/* Prefix / Name under image */}
                    <div className="w-full text-center px-1 sm:px-2 pb-0.5 sm:pb-1 flex-grow">
                        <div className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-800 dark:text-dark-text line-clamp-2 leading-tight">{animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}</div>
                    </div>

                    {/* Edit is available when viewing full card; remove inline edit icon from dashboard cards */}

                    {/* ID + controls row */}
                    <div className="w-full px-1 sm:px-2 pb-1 sm:pb-2 flex justify-between items-center mt-auto">
                        {/* Privacy and Owned toggles bottom-left */}
                        {!isSelectable && !hideControls && (
                            <div className="flex items-center gap-1">
                                {/* Owned toggle */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onToggleOwned && onToggleOwned(animal.id_public, !animal.isOwned);
                                    }}
                                    className={`p-0.5 sm:p-1 rounded transition-colors ${
                                        animal.isOwned 
                                            ? 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50' 
                                            : 'bg-gray-100 dark:bg-dark-surface-hover hover:bg-gray-200 dark:hover:bg-dark-border'
                                    }`}
                                    title={animal.isOwned ? "Click to mark as Not Owned" : "Click to mark as Owned"}
                                >
                                    {animal.isOwned ? (
                                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                                    ) : (
                                        <HeartOff className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                    )}
                                </button>
                                {/* Privacy toggle */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onTogglePrivacy && onTogglePrivacy(animal.id_public, !animal.showOnPublicProfile);
                                    }}
                                    className={`p-0.5 sm:p-1 rounded transition-colors ${
                                        animal.showOnPublicProfile 
                                            ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50' 
                                            : 'bg-gray-100 dark:bg-dark-surface-hover hover:bg-gray-200 dark:hover:bg-dark-border'
                                    }`}
                                    title={animal.showOnPublicProfile ? "Click to make Private" : "Click to make Public"}
                                >
                                    {animal.showOnPublicProfile ? (
                                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                    ) : (
                                        <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                    )}
                                </button>
                            </div>
                        )}
                        {/* Spacer if no toggles */}
                        {(isSelectable || hideControls) && <div></div>}
                        <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-dark-text-secondary">{animal.id_public}</div>
                    </div>
                    {/* Breeding line diamonds */}
                    {!hideBreedingLines && (() => {
                        const assignedIds = animalBreedingLines[animal.id_public] || [];
                        const activeLines = breedingLineDefs.filter(l => assignedIds.includes(l.id) && l.name && l.enabled !== false);
                        if (activeLines.length === 0) return null;
                        return (
                            <div className="w-full px-2 pb-1 flex flex-wrap gap-0.5 justify-center">
                                {activeLines.map(l => (
                                    <span key={l.id} title={l.name} style={{ color: l.color }} className="text-sm leading-none">&#x25C6;</span>
                                ))}
                            </div>
                        );
                    })()}
                    {/* Management action buttons slot */}
                    {cardActions && (
                        <div className="w-full px-1 pt-1 pb-1 border-t border-gray-100 flex flex-wrap gap-1 justify-center shrink-0" onClick={e => e.stopPropagation()}>
                            {cardActions}
                        </div>
                    )}
                    {/* Status bar at bottom */}
                    <div className="w-full py-0.5 sm:py-1 text-center border-t border-gray-300 dark:border-dark-border mt-auto bg-gray-100 dark:bg-dark-surface-hover">
                        <div className="text-[10px] sm:text-xs font-medium capitalize text-gray-700 dark:text-dark-text-secondary">
                            {animal.status || 'Unknown'}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // -- Activity log helpers -----------------------------------------------------
    const getActionColor = (action) => {
        if (!action) return 'bg-gray-300';
        if (action.includes('delete') || action.includes('failed')) return 'bg-red-400';
        if (action === 'animal_fed') return 'bg-green-400';
        if (action === 'reproduction_update') return 'bg-pink-400';
        if (action.includes('task_done')) return 'bg-amber-400';
        if (action.includes('assign') || action.includes('transfer')) return 'bg-purple-400';
        if (action.includes('create') || action.includes('login')) return 'bg-green-400';
        if (action.includes('update') || action.includes('change') || action.includes('upload')) return 'bg-blue-400';
        if (action.includes('visibility')) return 'bg-yellow-400';
        return 'bg-gray-400';
    };

    const getActionLabel = (action) => {
        const labels = {
            login: 'Logged in',
            logout: 'Logged out',
            password_change: 'Changed password',
            profile_update: 'Updated profile',
            profile_image_change: 'Changed profile image',
            privacy_settings_change: 'Changed privacy settings',
            animal_create: 'Added animal',
            animal_update: 'Updated animal',
            animal_delete: 'Deleted animal',
            animal_image_upload: 'Uploaded animal image',
            animal_image_delete: 'Deleted animal image',
            animal_visibility_change: 'Changed animal visibility',
            animal_transfer_initiate: 'Initiated animal transfer',
            animal_transfer_accept: 'Accepted animal transfer',
            animal_transfer_reject: 'Rejected animal transfer',
            litter_create: 'Created litter',
            litter_update: 'Updated litter',
            litter_delete: 'Deleted litter',
            message_send: 'Sent message',
            message_delete: 'Deleted message',
            report_submit: 'Submitted report',
            transaction_create: 'Created transaction',
            transaction_delete: 'Deleted transaction',
            // Management panel
            enclosure_create: 'Created enclosure',
            enclosure_update: 'Updated enclosure',
            enclosure_delete: 'Deleted enclosure',
            enclosure_assign: 'Assigned to enclosure',
            enclosure_unassign: 'Removed from enclosure',
            animal_fed: 'Marked as fed',
            care_task_done: 'Care task completed',
            enclosure_task_done: 'Cleaning task completed',
            reproduction_update: 'Reproductive status updated',
        };
        if (!action) return 'Unknown action';
        const key = action.replace(/_failed$/, '');
        const base = labels[key] || action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return action.endsWith('_failed') ? `${base} (failed)` : base;
    };

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return formatDateDisplay(dateStr);
    };

    // Fetch duplicates from API
    const fetchDuplicates = async () => {
        setDuplicatesLoading(true);
        try {
            const url = `${API_BASE_URL}/animals/duplicates`;
            console.log('[Duplicates] Fetching from:', url);
            console.log('[Duplicates] Auth token:', authToken ? 'Present' : 'Missing');
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('Duplicates response:', res.data);
            const groups = res.data.groups || [];
            
            // Validate that all animals have id_public
            groups.forEach((group, gIdx) => {
                if (!group.primary?.id_public) {
                    console.error(`Group ${gIdx} primary missing id_public:`, group.primary);
                }
                group.duplicates?.forEach((dup, dIdx) => {
                    if (!dup.animal?.id_public) {
                        console.error(`Group ${gIdx} duplicate ${dIdx} missing id_public:`, dup.animal);
                    }
                });
            });
            
            setDuplicateGroups(groups);
        } catch (err) {
            console.error('Failed to fetch duplicates:', err);
            console.error('Error response:', err.response);
            console.error('Error data:', err.response?.data);
            console.error('Error status:', err.response?.status);
            console.error('Error message:', err.response?.data?.message);
            showModalMessage('Error', err.response?.data?.message || 'Failed to load duplicates');
        } finally {
            setDuplicatesLoading(false);
        }
    };

    // -- Duplicates Screen --------------------------------------------------------
    const renderDuplicatesScreen = () => {

        const handleDismiss = async (id1, id2) => {
            // Validate IDs before proceeding
            if (!id1 || !id2) {
                showModalMessage('Error', 'Invalid animal IDs. Please refresh and try again.');
                console.error('Invalid IDs for dismiss:', { id1, id2 });
                return;
            }
            
            try {
                console.log('Dismissing duplicate pair:', { id1, id2 });
                await axios.post(`${API_BASE_URL}/animals/duplicates/dismiss`, 
                    { id1, id2 },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                // Remove from UI
                setDuplicateGroups(prev => prev.map(group => ({
                    ...group,
                    duplicates: (group.duplicates || []).filter(d => 
                        !((group.primary.id_public === id1 && d.animal.id_public === id2) ||
                          (group.primary.id_public === id2 && d.animal.id_public === id1))
                    )
                })).filter(group => (group.duplicates || []).length > 0));
            } catch (err) {
                showModalMessage('Error', err.response?.data?.message || 'Failed to dismiss duplicate');
            }
        };

        const handleMerge = async (keepId, deleteId) => {
            // Validate IDs before proceeding
            if (!keepId || !deleteId) {
                showModalMessage('Error', 'Invalid animal IDs. Please refresh and try again.');
                console.error('Invalid IDs for merge:', { keepId, deleteId });
                return;
            }
            
            const keepAnimal = [...duplicateGroups.flatMap(g => [g.primary, ...((g.duplicates || []).map(d => d.animal))])].find(a => a.id_public === keepId);
            const deleteAnimal = [...duplicateGroups.flatMap(g => [g.primary, ...((g.duplicates || []).map(d => d.animal))])].find(a => a.id_public === deleteId);
            
            if (!keepAnimal || !deleteAnimal) {
                showModalMessage('Error', 'Could not find one or both animals. Please refresh and try again.');
                console.error('Animals not found:', { keepAnimal, deleteAnimal });
                return;
            }
            
            if (!window.confirm(`Merge "${deleteAnimal?.name}" into "${keepAnimal?.name}"? This will delete the duplicate and transfer all related data (logs, litters, offspring). This cannot be undone.`)) return;

            try {
                console.log('Merging animals:', { keepId, deleteId });
                const res = await axios.post(`${API_BASE_URL}/animals/duplicates/merge`,
                    { keepId, deleteId },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                showModalMessage('Success', res.data.message || 'Animals merged successfully');
                // Remove merged pair from UI
                setDuplicateGroups(prev => prev.map(group => ({
                    ...group,
                    duplicates: (group.duplicates || []).filter(d => d.animal.id_public !== deleteId)
                })).filter(group => (group.duplicates || []).length > 0));
                // Refresh animal list
                fetchAnimals();
            } catch (err) {
                showModalMessage('Error', err.response?.data?.message || 'Failed to merge animals');
            }
        };

        const formatReasons = (reasons) => {
            if (!reasons) return 'Unknown reason';
            return (reasons || []).map(r => {
                if (r === 'exact_name') return 'Exact name match';
                if (r.startsWith('similar_name_')) return `Similar name (${r.split('_')[2]} match)`;
                if (r === 'same_birthdate_species') return 'Same birthdate & species';
                if (r === 'same_parents') return 'Same parents';
                return r;
            }).join(' • ');
        };

        return (
            <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowDuplicatesScreen(false)}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition"
                    >
                        <ChevronLeft size={16} />
                        {animalView === 'list' ? 'Back to My Animals' : 'Back to Management'}
                    </button>
                    <button
                        onClick={fetchDuplicates}
                        disabled={duplicatesLoading}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                    >
                        <RefreshCw size={12} />
                        Refresh
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <Search size={18} className="text-amber-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Find Duplicate Animals</h3>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{duplicateGroups.length} group{duplicateGroups.length !== 1 ? 's' : ''}</span>
                </div>

                {duplicatesLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 size={32} className="animate-spin text-gray-400" />
                    </div>
                ) : duplicateGroups.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <Sparkles size={48} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-medium">No duplicate animals found</p>
                        <p className="text-xs mt-1">Your collection looks clean!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {duplicateGroups.map((group, gIdx) => (
                            <div key={gIdx} className="border border-amber-200 rounded-lg bg-amber-50/30 p-4 space-y-3">
                                {(group.duplicates || []).map((dup, dIdx) => (
                                    <div key={dIdx} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                        <div className="p-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                                            <div className="text-xs text-amber-700 font-medium">
                                                {formatReasons(dup.reasons)}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDismiss(group.primary.id_public, dup.animal.id_public)}
                                                    className="text-xs px-2 py-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded transition"
                                                >
                                                    Not a duplicate
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const choice = window.confirm(`Which animal do you want to KEEP?\n\nOK = Keep "${group.primary.name}"\nCancel = Keep "${dup.animal.name}"`);
                                                        if (choice) {
                                                            handleMerge(group.primary.id_public, dup.animal.id_public);
                                                        } else {
                                                            handleMerge(dup.animal.id_public, group.primary.id_public);
                                                        }
                                                    }}
                                                    className="text-xs px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded transition"
                                                >
                                                    Merge
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 divide-x divide-gray-200">
                                            {[group.primary, dup.animal].map((animal, aIdx) => (
                                                <div key={aIdx} className="p-3 space-y-2">
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                            <AnimalImage src={animal.imageUrl || animal.photoUrl} alt={animal.name} className="w-full h-full object-cover" iconSize={20} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-800 text-sm truncate">{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</p>
                                                            <p className="text-xs text-gray-500">{animal.species} ? {animal.gender || 'Unknown'}</p>
                                                            {animal.breederAssignedId && <p className="text-xs text-gray-400">ID: {animal.breederAssignedId}</p>}
                                                        </div>
                                                    </div>
                                                    {animal.birthDate && (
                                                        <div className="text-xs text-gray-600">
                                                            <span className="text-gray-400">Born:</span> {new Date(animal.birthDate).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {(animal.fatherId_public || animal.sireId_public || animal.motherId_public || animal.damId_public) && (
                                                        <div className="text-xs text-gray-600">
                                                            <span className="text-gray-400">Parents:</span> {[animal.fatherId_public || animal.sireId_public, animal.motherId_public || animal.damId_public].filter(Boolean).join(' • ')}
                                                        </div>
                                                    )}
                                                    <div className="text-xs"><span className="text-gray-400">Status:</span> <span className={animal.status === 'Deceased' ? 'text-gray-500' : 'text-green-600'}>{animal.status || 'N/A'}</span></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // -- Archive Screen -----------------------------------------------------------
    const renderArchiveScreen = () => {
        return (
            <ArchiveScreen
                onBack={() => setShowArchiveScreen(false)}
                soldOwnerFilter={soldOwnerFilter}
                setSoldOwnerFilter={setSoldOwnerFilter}
                collapsedMgmtSections={collapsedMgmtSections}
                setCollapsedMgmtSections={setCollapsedMgmtSections}
                navigate={navigate}
                authToken={authToken}
                API_BASE_URL={API_BASE_URL}
                showModalMessage={showModalMessage}
                fetchAnimals={fetchAnimals}
                MgmtAnimalCard={MgmtAnimalCard}
                SectionHeader={SectionHeader}
            />
        );
    };

    // -- Shared Management Components ------------------------------------------
    // All appearance fields that make up "Variety" ? same set as Tab 3 / Appearance section
    const VARIETY_KEYS = ['color', 'coatPattern', 'coat', 'earset', 'phenotype', 'morph', 'markings', 'eyeColor', 'nailColor', 'carrierTraits', 'size'];
    const getAnimalVariety = (a) => VARIETY_KEYS.map(k => a[k]).filter(Boolean).join(' ');

    const MgmtAnimalCard = ({ animal, extras }) => (
        <div
            className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer gap-2"
            onClick={() => onViewAnimal && onViewAnimal(animal)}
        >
            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                {animal.imageUrl ? (
                    <img src={animal.imageUrl} alt={animal.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <Cat size={14} className="text-gray-400" />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-gray-800 truncate">
                        {[animal.prefix, animal.name || 'Unnamed', animal.suffix].filter(Boolean).join(' ')}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                        {getSpeciesDisplayName(animal.species)}{animal.gender ? ` · ${animal.gender}` : ''}
                        {animal.dateOfBirth ? ` · ${formatDateShort(animal.dateOfBirth)}` : ''}
                    </div>
                    {(() => {
                        const variety = getAnimalVariety(animal);
                        const parts = [animal.status, variety].filter(Boolean);
                        return parts.length > 0 ? (
                            <div className="text-xs text-gray-400 truncate">{parts.join(' • ')}</div>
                        ) : null;
                    })()}
                </div>
            </div>
            {extras && <div className="shrink-0 flex items-center">{extras}</div>}
        </div>
    );

    const SectionHeader = ({ sectionKey, icon, title, count, bgClass, onClick, hideHeader }) => {
        const collapsed = collapsedMgmtSections[sectionKey] || false;
        if (hideHeader) return null;
        return (
            <div
                className={`relative flex items-center justify-between ${bgClass} px-3 py-2.5 sm:px-4 sm:py-3 border-b cursor-pointer`}
                onClick={onClick || (() => setCollapsedMgmtSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] })))}
            >
                <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                    {collapsed
                        ? <ChevronDown className="w-4 h-4 text-gray-400" />
                        : <ChevronUp className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-semibold text-gray-800">{title}</span>
                    <span className="text-xs text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">{count}</span>
                </div>
                <div />
            </div>
        );
    };

    // -- Collections View ----------------------------------------------------------
    const renderCollectionsView = () => {
        // Use the same filtered list as the main "My Animals" view, but also exclude archived.
        const allOwnedAnimals = displayedAnimalsForList.filter(a => !a.archived);
        const enclosureMap = new Map(enclosures.map(e => [e._id, e.name]));
        return (
            <div className="space-y-4">
                {/* Collections Manager Header - button moved to filter bar */}

                {/* Collection Manager Panel */}
                {showCollectionManager && (
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="New collection name…"
                                value={newCollectionName}
                                onChange={e => setNewCollectionName(e.target.value)}
                                onKeyPress={e => { if (e.key === 'Enter' && newCollectionName.trim()) { createCollection(newCollectionName); setNewCollectionName(''); } }}
                                className="flex-grow p-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            />
                            <button
                                onClick={() => { createCollection(newCollectionName); setNewCollectionName(''); }}
                                disabled={!newCollectionName.trim()}
                                className="px-3 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                            >
                                Create
                            </button>
                        </div>
                        {userCollections.length > 0 ? (
                            <ul className="space-y-1.5">
                                {userCollections.map(col => (
                                    <li key={col.id} className="flex items-center gap-2">
                                        {renamingCollectionId === col.id ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={renamingCollectionName}
                                                    onChange={e => setRenamingCollectionName(e.target.value)}
                                                    onKeyPress={e => { if (e.key === 'Enter') { renameCollection(col.id, renamingCollectionName); setRenamingCollectionId(null); } }}
                                                    className="flex-grow p-1.5 text-sm border border-gray-300 rounded-lg"
                                                    autoFocus
                                                />
                                                <button onClick={() => { renameCollection(col.id, renamingCollectionName); setRenamingCollectionId(null); }} className="text-xs px-2 py-1 bg-primary text-black rounded-lg">Save</button>
                                                <button onClick={() => setRenamingCollectionId(null)} className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-lg">Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="flex-grow text-sm font-medium text-gray-700">{col.name}</span>
                                                <span className="text-xs text-gray-400">{Object.values(animalCollections).filter(ids => Array.isArray(ids) && ids.includes(col.id)).length} animals</span>
                                                <button onClick={() => { setRenamingCollectionId(col.id); setRenamingCollectionName(col.name); }} className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">Rename</button>
                                                <button onClick={() => deleteCollection(col.id)} className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg">Delete</button>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-2">No collections yet. Create one above.</p>
                        )}
                    </div>
                )}

                {loading && allOwnedAnimals.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                        Loading animals…
                    </div>
                )}

                {/* Empty state: no collections created yet */}
                {!loading && userCollections.length === 0 && (
                    <div className="text-center p-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <FolderOpen size={40} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-lg font-semibold text-gray-600 mb-1">No collections yet</p>
                        <p className="text-sm text-gray-500 mb-4">Create collections to organise your animals into custom folders.</p>
                        <button onClick={() => setShowCollectionManager(true)} className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-semibold rounded-lg transition">
                            Create First Collection
                        </button>
                    </div>
                )}

                {/* Collection sections */}
                {userCollections.length > 0 && (
                    <>
                        {userCollections.map(col => {
                            const colAnimals = allOwnedAnimals.filter(a => (animalCollections[a.id_public] || []).includes(col.id));
                            const isColCollapsed = collapsedCollections[col.id] || false;
                            return (
                                <div key={col.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                    <div
                                        className="flex items-center justify-between bg-gray-100 px-4 py-2.5 border-b cursor-pointer"
                                        onClick={() => setCollapsedCollections(prev => ({ ...prev, [col.id]: !prev[col.id] }))}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FolderOpen size={16} className="text-amber-500" />
                                            <span className="font-bold text-gray-700">{col.name} ({colAnimals.length})</span>
                                        </div>
                                        {isColCollapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
                                    </div>
                                    {!isColCollapsed && (
                                        <div className="p-1.5 sm:p-4">
                                            {colAnimals.length === 0 ? (
                                                <p className="text-sm text-gray-400 text-center py-4">No animals yet. Assign animals from the Uncategorized section below.</p>
                                            ) : collectionsViewMode === 'cards' ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                                                    {colAnimals.map(animal => (
                                                        <div key={animal.id_public} className="relative">
                                                            <AnimalCard animal={animal} onEditAnimal={onEditAnimal} species={animal.species} isSelectable={false} isSelected={false} onToggleSelect={() => {}} onTogglePrivacy={toggleAnimalPrivacy} onToggleOwned={toggleAnimalOwned} />
                                                            <button
                                                                onClick={e => { e.stopPropagation(); removeAnimalFromCollection(animal.id_public, col.id); }}
                                                                className="absolute top-1 right-1 z-20 bg-white/90 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-full p-0.5 shadow-sm border border-gray-200"
                                                                title="Remove from this collection"
                                                            >
                                                                <X size={11} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full text-xs divide-y divide-gray-200">
                                                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px]">
                                                            <tr>
                                                                <th className="px-3 py-2 text-left font-semibold">Animal</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Species</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Variety</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Enclosure</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Life Stage</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Status</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Health</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Birthdate / Age</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Lines</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Tags</th>
                                                                <th className="px-3 py-2 text-right w-12"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {colAnimals.map(animal => {
                                                                const ageStr = calculateBreedingAge(animal.birthDate, animal.deceasedDate);
                                                                const varietyStr = [animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).join(' ') || '—';
                                                                const assignedIds = animalBreedingLines[animal.id_public] || [];
                                                                const activeLines = breedingLineDefs.filter(l => assignedIds.includes(l.id) && l.name && l.enabled !== false);
                                                                return (
                                                                    <tr key={animal.id_public} className="hover:bg-gray-50 cursor-pointer" onClick={() => onViewAnimal(animal)}>
                                                                        <td className="px-3 py-1.5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden"><AnimalImage src={animal.imageUrl || animal.photoUrl} alt={animal.name} iconSize={20} /></div><div><div className="font-medium text-gray-800 flex items-center gap-1.5 text-sm"><span>{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</span>{animal.gender === 'Male' ? <Mars className="w-3.5 h-3.5 text-primary" /> : animal.gender === 'Female' ? <Venus className="w-3.5 h-3.5 text-accent" /> : animal.gender === 'Intersex' ? <VenusAndMars className="w-3.5 h-3.5 text-purple-500" /> : null}</div><div className="text-xs text-gray-500 font-mono">{animal.id_public}</div></div></div></td>
                                                                        <td className="px-3 py-1.5 text-gray-600"><div>{animal.species || '—'}</div>{getSpeciesLatinName(animal.species) && <div className="text-xs text-gray-400">{getSpeciesLatinName(animal.species)}</div>}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600"><div>{varietyStr}</div>{animal.geneticCode && <div className="text-xs text-gray-400 font-mono">{animal.geneticCode}</div>}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600">{animal.enclosureId ? enclosureMap.get(animal.enclosureId) || 'N/A' : '—'}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600">{animal.lifeStage || '—'}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600 text-xs">{animal.status || '—'}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600 text-xs">{renderHealthColumnCell(animal)}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600 whitespace-nowrap"><div>{formatLocalDate(animal.birthDate)}</div><div className="text-xs text-gray-400">{ageStr}</div></td>
                                                                        <td className="px-3 py-1.5">{activeLines.length > 0 ? (<div className="flex flex-wrap gap-1">{activeLines.map(l => (<span key={l.id} title={l.name} style={{ color: l.color }} className="text-lg leading-none">&#x25C6;</span>))}</div>) : '—'}</td>
                                                                        <td className="px-3 py-1.5 text-gray-500">{(animal.tags && animal.tags.length > 0) ? animal.tags.join(', ') : '—'}</td>
                                                                        <td className="px-3 py-1.5 text-right">
                                                                            <button onClick={e => { e.stopPropagation(); removeAnimalFromCollection(animal.id_public, col.id); }} className="bg-white hover:bg-red-50 text-red-400 hover:text-red-600 rounded-full p-1 shadow-sm border border-gray-200" title="Remove from this collection"><X size={11} /></button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Uncategorized section */}
                        {(() => {
                            const validCollectionIds = new Set(userCollections.map(c => c.id));
                            const uncategorized = allOwnedAnimals.filter(a => {
                                const assigned = (animalCollections[a.id_public] || []).filter(cid => validCollectionIds.has(cid));
                                return assigned.length === 0;
                            });
                            if (uncategorized.length === 0) return null;
                            const isUncatCollapsed = collapsedCollections['__uncategorized'] || false;
                            return (
                                <div className="border border-dashed border-gray-300 rounded-xl">
                                    <div
                                        className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b cursor-pointer"
                                        onClick={() => setCollapsedCollections(prev => ({ ...prev, __uncategorized: !prev.__uncategorized }))}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FolderOpen size={16} className="text-gray-400" />
                                            <span className="font-semibold text-gray-500">Uncategorized ({uncategorized.length})</span>
                                        </div>
                                        {isUncatCollapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
                                    </div>
                                    {!isUncatCollapsed && (
                                        <div className="p-1.5 sm:p-4">
                                            {collectionsViewMode === 'cards' ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                                                    {uncategorized.map(animal => (
                                                        <div key={animal.id_public} className="relative" onClick={e => { if (assigningCollectionAnimalId === animal.id_public) e.stopPropagation(); }}>
                                                            <div className="absolute inset-0 bg-gray-400/20 rounded-xl z-10 pointer-events-none" />
                                                            <AnimalCard animal={animal} onEditAnimal={onEditAnimal} species={animal.species} isSelectable={false} isSelected={false} onToggleSelect={() => {}} onTogglePrivacy={toggleAnimalPrivacy} onToggleOwned={toggleAnimalOwned} />
                                                            <div className="absolute top-2 left-2 z-20">
                                                                {assigningCollectionAnimalId === animal.id_public && (
                                                                    <div className="absolute left-0 top-9 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[150px] z-30" onClick={e => e.stopPropagation()}>
                                                                        <p className="text-xs font-semibold text-gray-600 mb-1.5">Add to collection:</p>
                                                                        {userCollections.map(col => (<button key={col.id} onClick={() => { assignAnimalToCollection(animal.id_public, col.id); setAssigningCollectionAnimalId(null); }} className="w-full text-left text-xs px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-1.5 text-gray-700"><FolderOpen size={11} className="text-amber-500" /> {col.name}</button>))}
                                                                        <button onClick={() => setAssigningCollectionAnimalId(null)} className="w-full text-left text-xs px-2 py-1 hover:bg-gray-100 rounded text-gray-400 mt-1">Cancel</button>
                                                                    </div>
                                                                )}
                                                                <button onClick={e => { e.stopPropagation(); setAssigningCollectionAnimalId(prev => prev === animal.id_public ? null : animal.id_public); }} className="bg-white/90 hover:bg-amber-50 text-amber-500 hover:text-amber-700 rounded-full p-1 shadow-sm border border-gray-200" title="Add to a collection"><Plus size={16} /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full text-xs divide-y divide-gray-200">
                                                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px]">
                                                            <tr>
                                                                <th className="px-3 py-2 text-left font-semibold">Animal</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Species</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Variety</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Enclosure</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Life Stage</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Status</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Health</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Birthdate / Age</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Lines</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Tags</th>
                                                                <th className="px-3 py-2 text-right w-12"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {uncategorized.map(animal => {
                                                                const ageStr = calculateBreedingAge(animal.birthDate, animal.deceasedDate);
                                                                const varietyStr = [animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).join(' ') || '—';
                                                                const assignedIds = animalBreedingLines[animal.id_public] || [];
                                                                const activeLines = breedingLineDefs.filter(l => assignedIds.includes(l.id) && l.name && l.enabled !== false);
                                                                return (
                                                                    <tr key={animal.id_public} className="hover:bg-gray-50 cursor-pointer" onClick={() => onViewAnimal(animal)}>
                                                                        <td className="px-3 py-1.5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden"><AnimalImage src={animal.imageUrl || animal.photoUrl} alt={animal.name} iconSize={20} /></div><div><div className="font-medium text-gray-800 flex items-center gap-1.5 text-sm"><span>{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</span>{animal.gender === 'Male' ? <Mars className="w-3.5 h-3.5 text-primary" /> : animal.gender === 'Female' ? <Venus className="w-3.5 h-3.5 text-accent" /> : animal.gender === 'Intersex' ? <VenusAndMars className="w-3.5 h-3.5 text-purple-500" /> : null}</div><div className="text-xs text-gray-500 font-mono">{animal.id_public}</div></div></div></td>
                                                                        <td className="px-3 py-1.5 text-gray-600"><div>{animal.species || '—'}</div>{getSpeciesLatinName(animal.species) && <div className="text-xs text-gray-400">{getSpeciesLatinName(animal.species)}</div>}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600"><div>{varietyStr}</div>{animal.geneticCode && <div className="text-xs text-gray-400 font-mono">{animal.geneticCode}</div>}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600">{animal.enclosureId ? enclosureMap.get(animal.enclosureId) || 'N/A' : '—'}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600">{animal.lifeStage || '—'}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600 text-xs">{animal.status || '—'}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600 text-xs">{renderHealthColumnCell(animal)}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600 whitespace-nowrap"><div>{formatLocalDate(animal.birthDate)}</div><div className="text-xs text-gray-400">{ageStr}</div></td>
                                                                        <td className="px-3 py-1.5">{activeLines.length > 0 ? (<div className="flex flex-wrap gap-1">{activeLines.map(l => (<span key={l.id} title={l.name} style={{ color: l.color }} className="text-lg leading-none">&#x25C6;</span>))}</div>) : '—'}</td>
                                                                        <td className="px-3 py-1.5 text-gray-500">{(animal.tags && animal.tags.length > 0) ? animal.tags.join(', ') : '—'}</td>
                                                                        <td className="px-3 py-1.5 text-right"><div className="relative inline-block text-left"><button onClick={e => { e.stopPropagation(); setAssigningCollectionAnimalId(prev => prev === animal.id_public ? null : animal.id_public); }} className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200"><Plus size={16} /></button>{assigningCollectionAnimalId === animal.id_public && (<div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-30" onClick={e => e.stopPropagation()}><div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu"><p className="text-xs font-semibold text-gray-600 px-3 py-1">Add to collection:</p>{userCollections.map(col => (<button key={col.id} onClick={() => { assignAnimalToCollection(animal.id_public, col.id); setAssigningCollectionAnimalId(null); }} className="w-full text-left text-xs px-3 py-2 hover:bg-gray-100 flex items-center gap-1.5 text-gray-700"><FolderOpen size={11} className="text-amber-500" /> {col.name}</button>))}</div></div>)}</div></td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </>
                )}
            </div>
        );
    };

    const StatCard = ({ icon, label, value, colorClass, onClick, hasDropdown, isDropdownOpen, onDropdownToggle }) => (
        <div
            className={`relative flex items-center h-[104px] p-4 rounded-xl shadow-sm transition-all duration-200 ${onClick || onDropdownToggle ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''} ${colorClass}`}
            onClick={onClick || (onDropdownToggle ? () => onDropdownToggle() : undefined)}
        >
            {icon}
            <div className="ml-4">
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm font-medium opacity-90 line-clamp-2">{label}</div>
            </div>
            {hasDropdown && (
                <button onClick={(e) => { e.stopPropagation(); if (onDropdownToggle) onDropdownToggle(); }} className="absolute top-2 right-2 p-1 text-inherit opacity-60 hover:opacity-100">
                    <ChevronDown size={20} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
            )}
        </div>
    );

    const renderEnclosureDashboard = () => {
        const occupiedEnclosuresList = enclosures.filter(enc => (enclosureAnimalMap[enc._id] || []).length > 0);
        const animalsHousedCount = Object.values(enclosureAnimalMap).flat().filter(a => a.enclosureId).length;
        
        const needsAttentionCount = enclosuresNeedingAttention.length;

        const totalCapacity = enclosures.reduce((sum, enc) => sum + (Number(enc.capacity) || 0), 0);

        return (
            <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
                    <div className="flex flex-col gap-2">
                        <StatCard
                            icon={<Home size={32} className="text-blue-800" />}
                            label="Total Enclosures"
                            value={enclosures.length}
                            colorClass="bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200"
                            hasDropdown={true}
                            isDropdownOpen={showEnclosureBreakdown}
                            onDropdownToggle={() => setShowEnclosureBreakdown(prev => !prev)}
                        />
                        {showEnclosureBreakdown && (
                            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-3 -mt-1 shadow-sm">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Enclosure Breakdown</h4>
                                {enclosureBreakdown.length > 0 ? (
                                    <ul className="text-xs space-y-2">
                                        {enclosureBreakdown.map(building => (
                                            <li key={building.name}>
                                                <div className="flex justify-between items-center font-medium text-gray-800 dark:text-dark-text">
                                                    <span className="flex items-center gap-1.5"><Building size={14} /> {building.name}</span>
                                                    <span>{building.count}</span>
                                                </div>
                                                {building.rooms.length > 0 && (
                                                    <ul className="pl-6 mt-1 space-y-1">
                                                        {building.rooms.map(room => (
                                                            <li key={room.name} className="flex justify-between items-center text-gray-600 dark:text-dark-text-secondary">
                                                                <span className="flex items-center gap-1.5"><Home size={12} /> {room.name}</span>
                                                                <span>{room.count}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-gray-400 text-center">No enclosures to categorize by location.</p>
                                )}
                            </div>
                        )}
                    </div>
                    <StatCard icon={<Package size={32} className="text-green-800" />} label="Occupied" value={occupiedEnclosuresList.length} colorClass="bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-200" />
                    <div className="flex flex-col gap-2">
                        <StatCard
                            icon={<Users size={32} className="text-purple-800" />}
                            label="Total Capacity"
                            value={totalCapacity}
                            colorClass="bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200"
                            hasDropdown={true}
                            isDropdownOpen={showCapacityBreakdown}
                            onDropdownToggle={() => setShowCapacityBreakdown(prev => !prev)}
                        />
                        {showCapacityBreakdown && (
                            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-3 -mt-1 shadow-sm max-h-60 overflow-y-auto pr-2">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Capacity by Species</h4>
                                {enclosureSpeciesCapacityBreakdown.length > 0 ? (
                                    <ul className="text-xs space-y-1">
                                        {enclosureSpeciesCapacityBreakdown.map(species => (
                                            <li key={species.name} className="flex justify-between items-center text-gray-600 dark:text-dark-text-secondary">
                                                <span className="flex items-center gap-1.5"><PawPrint size={12} /> {species.name}</span>
                                                <span>{species.count}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-gray-400 text-center">No enclosures with capacity and suitable species assigned.</p>
                                )}
                            </div>
                        )}
                    </div>
                    <StatCard icon={<Cat size={32} className="text-indigo-800" />} label="Animals Housed" value={animalsHousedCount} colorClass="bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200" />
                    <div className="flex flex-col gap-2">
                        <StatCard
                            icon={<AlertTriangle size={32} className="text-orange-800" />}
                            label="Needs Attention"
                            value={needsAttentionCount}
                            colorClass="bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200"
                            hasDropdown={enclosuresNeedingAttention.length > 0}
                            isDropdownOpen={showNeedsAttentionBreakdown}
                            onDropdownToggle={() => setShowNeedsAttentionBreakdown(prev => !prev)}
                        />
                        {showNeedsAttentionBreakdown && enclosuresNeedingAttention.length > 0 && (
                            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-3 -mt-1 shadow-sm max-h-60 overflow-y-auto">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                    Due Tasks ({totalDueEnclosureTasks} total)
                                </h4>
                                <div className="space-y-2 pr-2">
                                    {enclosuresNeedingAttention.map(enc => (
                                        <div key={enc._id} className="cursor-pointer" onClick={() => handleOpenDetail(enc)}>
                                            <p className="font-semibold text-xs text-gray-800 dark:text-dark-text">{enc.name}</p>
                                            <ul className="pl-2 text-xs text-gray-600 dark:text-dark-text-secondary space-y-0.5">
                                                {enc.dueTasks.map((task, idx) => {
                                                    const type = task.type || 'Other';
                                                    const Icon = TASK_TYPE_STYLES[type]?.icon || TASK_TYPE_STYLES['Other'].icon;
                                                    const color = TASK_TYPE_STYLES[type]?.color || TASK_TYPE_STYLES['Other'].color;
                                                    return (
                                                        <li key={idx} className={`flex items-center gap-1.5 ${color}`}>
                                                            {Icon}
                                                            <span>{task.taskName}</span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderReproductionDashboard = () => {
        return (
            <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
                    <StatCard icon={<Calendar size={32} className="text-indigo-800" />} label="Animals in Planned Mating" value={plannedMatingList.length} colorClass="bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200" onClick={() => setAnimalView('reproduction')} />
                    <StatCard icon={<Hourglass size={32} className="text-sky-800" />} label="Animals In Mating" value={matingList.length} colorClass="bg-sky-100 text-sky-900 dark:bg-sky-900/30 dark:text-sky-200" onClick={() => setAnimalView('reproduction')} />
                    <StatCard icon={<ScanHeart size={32} className="text-pink-800" />} label="Animals Pregnant" value={pregnantList.length} colorClass="bg-pink-100 text-pink-900 dark:bg-pink-900/30 dark:text-pink-200" onClick={() => setAnimalView('reproduction')} />
                    <StatCard icon={<Droplet size={32} className="text-violet-800" />} label="Animals Nursing" value={nursingList.length} colorClass="bg-violet-100 text-violet-900 dark:bg-violet-900/30 dark:text-violet-200" onClick={() => setAnimalView('reproduction')} />
                    <div className="flex flex-col gap-2">
                        <StatCard
                            icon={<AlertTriangle size={32} className="text-orange-800" />}
                            label="Needs Attention"
                            value={reproNeedsAttentionList.length}
                            colorClass="bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200"
                            hasDropdown={reproNeedsAttentionList.length > 0}
                            isDropdownOpen={showReproNeedsAttentionBreakdown}
                            onDropdownToggle={() => setShowReproNeedsAttentionBreakdown(prev => !prev)}
                        />
                        {showReproNeedsAttentionBreakdown && reproNeedsAttentionList.length > 0 && (
                            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-3 -mt-1 shadow-sm max-h-60 overflow-y-auto">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Due Today</h4>
                                <ul className="text-xs space-y-1.5">
                                    {reproNeedsAttentionList.map(({ animal, reason }) => (
                                        <li key={animal.id_public} className="flex flex-col gap-0.5 p-1.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface-hover" onClick={() => onViewAnimal(animal)}>
                                            <span className="text-gray-700 dark:text-dark-text-secondary font-semibold truncate">{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</span>
                                            <span className="font-medium text-orange-700">{reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderHealthDashboard = () => {
        return (
            <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
                    <StatCard icon={<Cat size={32} className="text-indigo-800" />} label="Total in Health Program" value={quarantineList.length + treatmentList.length} colorClass="bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200" onClick={() => setAnimalView('health')} />
                    <StatCard icon={<AlertTriangle size={32} className="text-orange-800" />} label="Quarantine" value={quarantineList.length} colorClass="bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200" onClick={() => setAnimalView('health')} />
                    <StatCard icon={<Activity size={32} className="text-red-800" />} label="In Treatment" value={treatmentList.length} colorClass="bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200" onClick={() => setAnimalView('health')} />
                    <StatCard icon={<Droplet size={32} className="text-teal-800" />} label="Active Medications" value={activeMedicationsCount} colorClass="bg-teal-100 text-teal-900 dark:bg-teal-900/30 dark:text-teal-200" onClick={() => setAnimalView('health')} />
                    <div className="flex flex-col gap-2">
                        <StatCard
                            icon={<AlertTriangle size={32} className="text-orange-800" />}
                            label="Needs Attention"
                            value={healthNeedsAttentionList.length}
                            colorClass="bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200"
                            hasDropdown={healthNeedsAttentionList.length > 0}
                            isDropdownOpen={showHealthNeedsAttentionBreakdown}
                            onDropdownToggle={() => setShowHealthNeedsAttentionBreakdown(prev => !prev)}
                        />
                        {showHealthNeedsAttentionBreakdown && healthNeedsAttentionList.length > 0 && (
                            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-3 -mt-1 shadow-sm max-h-60 overflow-y-auto">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Due Now</h4>
                                <ul className="text-xs space-y-1.5">
                                    {healthNeedsAttentionList.map(({ animal, reason }) => (
                                        <li key={`${animal.id_public}-${reason}`} className="flex flex-col gap-0.5 p-1.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface-hover" onClick={() => onViewAnimal(animal)}>
                                            <span className="text-gray-700 dark:text-dark-text-secondary font-semibold truncate">{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</span>
                                            <span className="font-medium text-orange-700">{reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderFeedingDashboard = () => {
        return (
            <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
                    <StatCard icon={<Utensils size={32} className="text-green-800" />} label="Feeding" value={feedingAssignedCount} colorClass="bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-200" onClick={() => setAnimalView('feeding')} />
                    <StatCard icon={<Scissors size={32} className="text-teal-800" />} label="Grooming & Special Care" value={groomingAssignedCount} colorClass="bg-teal-100 text-teal-900 dark:bg-teal-900/30 dark:text-teal-200" onClick={() => setAnimalView('feeding')} />
                    <StatCard icon={<Dumbbell size={32} className="text-sky-800" />} label="Training" value={trainingAssignedCount} colorClass="bg-sky-100 text-sky-900 dark:bg-sky-900/30 dark:text-sky-200" onClick={() => setAnimalView('feeding')} />
                    <StatCard icon={<ClipboardList size={32} className="text-indigo-800" />} label="Custom Animal Care" value={scheduledCareAssignedCount} colorClass="bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200" onClick={() => setAnimalView('feeding')} />
                    <div className="flex flex-col gap-2">
                        <StatCard
                            icon={<AlertTriangle size={32} className="text-orange-800" />}
                            label="Needs Attention"
                            value={feedingCareNeedsAttentionList.length}
                            colorClass="bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200"
                            hasDropdown={feedingCareNeedsAttentionList.length > 0}
                            isDropdownOpen={showFeedingCareNeedsAttentionBreakdown}
                            onDropdownToggle={() => setShowFeedingCareNeedsAttentionBreakdown(prev => !prev)}
                        />
                        {showFeedingCareNeedsAttentionBreakdown && feedingCareNeedsAttentionList.length > 0 && (
                            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-3 -mt-1 shadow-sm max-h-60 overflow-y-auto">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Due Now</h4>
                                <ul className="text-xs space-y-1.5">
                                    {feedingCareNeedsAttentionList.map(({ animal, reason }, idx) => (
                                        <li key={`${animal.id_public}-${reason}-${idx}`} className="flex flex-col gap-0.5 p-1.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface-hover" onClick={() => onViewAnimal(animal)}>
                                            <span className="text-gray-700 dark:text-dark-text-secondary font-semibold truncate">{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</span>
                                            <span className="font-medium text-orange-700">{reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const enclosureSpeciesLabels = useMemo(() => {
        const allLabels = new Set();
        enclosures.forEach(enc => {
            (enc.speciesLabels || []).forEach(label => allLabels.add(label));
        });
        return Array.from(allLabels).sort();
    }, [enclosures]);

    const handleEnclosureImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEnclosureImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setEnclosureImagePreview(previewUrl);
            // Update imageUrl in form data so it's correctly reflected in the payload if no new upload occurs
            setNewEnclosureForm(prev => ({ ...prev, imageUrl: previewUrl }));
        }
        else {
            setEnclosureImageFile(null);
            setEnclosureImagePreview(null);
            setNewEnclosureForm(prev => ({ ...prev, imageUrl: '' })); // Clear imageUrl in form data
        }
    };

    const ReproductiveAnimalBar = ({ animal, onViewAnimal, onEditAnimal, onTransfer, handleReproStatusUpdate }) => {
        const matingDate = animal.matingDate ? formatDateShort(animal.matingDate) : '—';
        const dueDate = animal.dueDate ? formatDateShort(animal.dueDate) : '—';
        const birthDate = animal.birthDate ? formatDateShort(animal.birthDate) : '—';
        const weaningDate = animal.weaningDate ? formatDateShort(animal.weaningDate) : '—';

        let dueOrBornDate = '—';
        if (animal.isPlannedMating || animal.isPregnant) {
            dueOrBornDate = dueDate;
        } else if (animal.isNursing) {
            dueOrBornDate = birthDate;
        }

        let statusLabel = 'Unknown';
        let statusColor = 'bg-gray-100 text-gray-800';
        if (animal.isPlannedMating) {
            statusLabel = 'Planned';
            statusColor = 'bg-indigo-100 text-indigo-800';
        } else if (animal.isInMating) {
            statusLabel = 'Mating';
            statusColor = 'bg-sky-100 text-sky-800';
        } else if (animal.isPregnant) {
            statusLabel = 'Pregnant';
            statusColor = 'bg-pink-100 text-pink-800';
        } else if (animal.isNursing) {
            statusLabel = 'Nursing';
            statusColor = 'bg-violet-100 text-violet-800';
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-7 items-center gap-2 sm:gap-4 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                {/* Animal Info (col-span-2 on sm+) */}
                <div className="sm:col-span-2 flex items-center gap-3 cursor-pointer" onClick={() => onViewAnimal(animal)}>
                    <AnimalImage src={animal.imageUrl} alt={animal.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                    <div className="min-w-0">
                        <div className="font-semibold text-sm text-gray-800 truncate">{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</div>
                        <div className="text-xs text-gray-500 truncate">{animal.species}</div>
                    </div>
                </div>

                {/* Mating Date */}
                <div className="text-xs text-gray-600"><span className="sm:hidden font-semibold">Mating: </span>{matingDate}</div>

                {/* Due/Birth Date */}
                <div className="text-xs text-gray-600"><span className="sm:hidden font-semibold">Due/Born: </span>{animal.isPregnant ? dueDate : birthDate}</div>

                {/* Weaning Date */}
                <div className="text-xs text-gray-600"><span className="sm:hidden font-semibold">Weaning: </span>{weaningDate}</div>

                {/* Status */}
                <div className="text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{statusLabel}</span>
                </div>

                {/* Actions */}
                <div className="sm:text-right flex items-center gap-1 justify-end">
                    {animal.isPlannedMating && ( <><button onClick={(e) => handleReproStatusUpdate(e, animal, { isPlannedMating: false, isInMating: true, matingDate: new Date().toISOString().slice(0,10) })} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-sky-100 text-sky-700 hover:bg-sky-200"><Hourglass size={12} /> Mated today</button><button onClick={(e) => handleReproStatusUpdate(e, animal, { isPlannedMating: false, isInMating: false, isPregnant: false, isNursing: false })} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200" title="Clear Status"><X size={12} /></button></> )} {animal.isInMating && ( <> {animal.gender !== 'Male' && <button onClick={(e) => handleReproStatusUpdate(e, animal, { isInMating: false, isPregnant: true, pregnancyDate: new Date().toISOString().slice(0,10) })} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-pink-100 text-pink-700 hover:bg-pink-200"><ScanHeart size={12} /> Assign Pregnant</button>} <button onClick={(e) => handleReproStatusUpdate(e, animal, { isInMating: false, isPregnant: false, isNursing: false })} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200" title="Clear Status"><X size={12} /></button> </>)} {animal.isPregnant && animal.gender !== 'Male' && ( <><button onClick={(e) => handleReproStatusUpdate(e, animal, { isPregnant: false, isNursing: true, birthDate: new Date().toISOString().slice(0,10) })} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-violet-100 text-violet-700 hover:bg-violet-200"><Droplet size={12} /> Born today</button><button onClick={(e) => handleReproStatusUpdate(e, animal, { isPregnant: false, isInMating: false, isNursing: false })} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200" title="Clear Status"><X size={12} /></button></> )} {animal.isNursing && animal.gender !== 'Male' && ( <><button onClick={(e) => handleReproStatusUpdate(e, animal, { isNursing: false, weaningDate: new Date().toISOString().slice(0,10) })} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"><Check size={12} /> Mark Weaned</button><button onClick={(e) => handleReproStatusUpdate(e, animal, { isNursing: false, isPregnant: false, isInMating: false })} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200" title="Clear Status"><X size={12} /></button></> )}
                    <button onClick={(e) => { e.stopPropagation(); onEditAnimal(animal); }} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200"><Edit size={14} /></button>
                </div>
            </div>
        );
    };

    const HealthAnimalBar = ({ animal, type, onViewAnimal, onEditAnimal, handleUnquarantine, handleDischargeTreatment, handleMedicationAction, parseArrayField, calcNextDose, formatNextDose }) => {
        const isQuarantine = type === 'quarantine';
        const details = animal.quarantineDetails || {};
        const conds = parseArrayField(animal.medicalConditions).filter(c => !c.status || c.status === 'active');
        const meds = parseArrayField(animal.medications).filter(m => !m.status || m.status === 'active');

        return (
            <div className="grid grid-cols-1 sm:grid-cols-7 items-center gap-2 sm:gap-4 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                <div className="sm:col-span-2 flex items-center gap-3 cursor-pointer" onClick={() => onViewAnimal(animal)}>
                    <AnimalImage src={animal.imageUrl} alt={animal.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                    <div className="min-w-0">
                        <div className="font-semibold text-sm text-gray-800 truncate">{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</div>
                        <div className="text-xs text-gray-500 truncate">{animal.species}</div>
                    </div>
                </div>

                {isQuarantine ? (
                    <>
                        <div className="text-xs text-gray-600 truncate"><span className="sm:hidden font-semibold">Type/Reason: </span>{[details.type, details.reason].filter(Boolean).join(' — ') || '—'}</div>
                        <div className="text-xs text-gray-600"><span className="sm:hidden font-semibold">Start: </span>{details.startDate ? formatDateShort(details.startDate) : '—'}</div>
                        <div className="text-xs text-gray-600"><span className="sm:hidden font-semibold">End: </span>{details.endDate ? formatDateShort(details.endDate) : '—'}</div>
                    </>
                ) : (
                    <>
                        <div className="text-xs text-gray-600 truncate"><span className="sm:hidden font-semibold">Condition: </span>{conds.length > 0 ? conds.map(c => c.condition || c.name).filter(Boolean).join(', ') : '—'}</div>
                        <div className="sm:col-span-2 text-xs space-y-0.5">
                            <span className="sm:hidden font-semibold">Medications: </span>
                            {meds.length > 0 ? meds.slice(0, 2).map((m, i) => {
                                const next = calcNextDose(m);
                                const nextLabel = next ? formatNextDose(next) : null;
                                const intervalLabel = m.intervalValue ? `every ${m.intervalValue}${m.intervalUnit === 'hours' ? 'h' : m.intervalUnit === 'days' ? 'd' : m.intervalUnit === 'weeks' ? 'w' : 'mo'}` : null;
                                return (
                                    <div key={i} className="leading-tight flex items-center gap-1.5 flex-wrap">
                                        <span>
                                            <span className="font-medium text-gray-700">{m.name || m.medication}{m.reason ? ` — ${m.reason}` : ''}</span>
                                            <span className="text-blue-500"> {[m.dose, intervalLabel].filter(Boolean).join(' · ')}{nextLabel ? <span className="text-orange-500 ml-1">· {nextLabel}</span> : null}</span>
                                        </span>
                                        {m.intervalValue && (
                                            <span className="flex items-center gap-0.5">
                                                <button title="Confirm dose given" onClick={(e) => handleMedicationAction(e, animal, m.id, 'confirm')} className="p-0.5 text-green-600 hover:bg-green-100 rounded"><Check size={12} /></button>
                                                <button title="Prolong stop date" onClick={(e) => handleMedicationAction(e, animal, m.id, 'prolong')} className="p-0.5 text-blue-500 hover:bg-blue-100 rounded"><PlusCircle size={12} /></button>
                                                <button title="Finish medication (stop date = today)" onClick={(e) => handleMedicationAction(e, animal, m.id, 'finish')} className="p-0.5 text-red-500 hover:bg-red-100 rounded"><X size={12} /></button>
                                            </span>
                                        )}
                                    </div>
                                );
                            }) : <span className="text-gray-400">No active medications</span>}
                        </div>
                    </>
                )}

                <div className="text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isQuarantine ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>{isQuarantine ? 'Quarantine' : 'Treatment'}</span>
                </div>

                <div className="sm:text-right flex items-center gap-1 justify-end">
                    {isQuarantine
                        ? <button onClick={(e) => handleUnquarantine(e, animal)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"><LockOpen size={12} /> Release</button>
                        : <button onClick={(e) => handleDischargeTreatment(e, animal)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"><LockOpen size={12} /> End Treatment</button>
                    }
                    <button onClick={(e) => { e.stopPropagation(); onEditAnimal(animal); }} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200"><Edit size={14} /></button>
                </div>
            </div>
        );
    };

    const FeedingAnimalBar = ({ animal, onViewAnimal, onEditAnimal, handleMarkFed, handleSkipFeeding }) => {
        const due = isFeedingDue(animal.lastFedDate, animal.feedingIntervalHours);
        return (
            <div className="grid grid-cols-1 sm:grid-cols-8 items-center gap-2 sm:gap-4 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                <div className="sm:col-span-2 flex items-center gap-3 cursor-pointer" onClick={() => onViewAnimal(animal)}>
                    <AnimalImage src={animal.imageUrl} alt={animal.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                    <div className="min-w-0">
                        <div className="font-semibold text-sm text-gray-800 truncate">{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</div>
                        <div className="text-xs text-gray-500 truncate">{animal.species}</div>
                    </div>
                </div>

                <div className="text-xs text-gray-600"><span className="sm:hidden font-semibold">Last Fed: </span>{animal.lastFedDate ? formatDateShort(animal.lastFedDate) : <span className="text-orange-500">Never</span>}</div>

                <div className="text-xs text-gray-600"><span className="sm:hidden font-semibold">Frequency: </span>{formatFeedingInterval(animal.feedingIntervalHours)}</div>

                <div className="sm:col-span-2 text-xs text-gray-400">
                    <div>{animal.dietType || ''}</div>
                </div>

                <div className="text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${due ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{due ? 'Due/Overdue' : 'Up to Date'}</span>
                </div>

                <div className="sm:text-right flex items-center gap-1 justify-end">
                    <button onClick={(e) => handleMarkFed(e, animal)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"><Utensils size={12} /> Fed</button>
                    {due && <button onClick={(e) => handleSkipFeeding(e, animal)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"><SkipForward size={12} /> Skip</button>}
                    <button onClick={(e) => { e.stopPropagation(); onEditAnimal(animal); }} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200"><Edit size={14} /></button>
                </div>
            </div>
        );
    };

    // Generic bar row for a single dedicated schedule task (Grooming/Special Care/Training).
    // Each row represents ONE schedule field on ONE animal — tasks are never merged/shared.
    const ScheduleAnimalBar = ({ animal, label, fieldName, onViewAnimal, onEditAnimal, handleMarkScheduleDone, handleSkipScheduleTask }) => {
        const sched = animal[fieldName] || {};
        const due = isDue(sched.lastDoneDate, sched.frequencyDays);
        return (
            <div className="grid grid-cols-1 sm:grid-cols-8 items-center gap-2 sm:gap-4 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                <div className="sm:col-span-2 flex items-center gap-3 cursor-pointer" onClick={() => onViewAnimal(animal)}>
                    <AnimalImage src={animal.imageUrl} alt={animal.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                    <div className="min-w-0">
                        <div className="font-semibold text-sm text-gray-800 truncate">{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</div>
                        <div className="text-xs text-gray-500 truncate">{animal.species}</div>
                    </div>
                </div>

                <div className="text-xs text-gray-600"><span className="sm:hidden font-semibold">Last Done: </span>{sched.lastDoneDate ? formatDateShort(sched.lastDoneDate) : <span className="text-orange-500">Never</span>}</div>

                <div className="text-xs text-gray-600"><span className="sm:hidden font-semibold">Frequency: </span>Every {sched.frequencyDays}d</div>

                <div className="sm:col-span-2 text-xs text-gray-400 truncate">{label}</div>

                <div className="text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${due ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{due ? 'Due/Overdue' : 'Up to Date'}</span>
                </div>

                <div className="sm:text-right flex items-center gap-1 justify-end">
                    <button onClick={(e) => handleMarkScheduleDone(e, animal, fieldName)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"><Check size={12} /> Done</button>
                    {due && <button onClick={(e) => handleSkipScheduleTask(e, animal, fieldName)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"><SkipForward size={12} /> Skip</button>}
                    <button onClick={(e) => { e.stopPropagation(); onEditAnimal(animal); }} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200"><Edit size={14} /></button>
                </div>
            </div>
        );
    };

    // Bar row for a single custom animal care task (one row per task per animal), matching the
    // Grooming/Special Care/Training bar layout.
    const AnimalCareTaskBar = ({ animal, taskIdx, task, onViewAnimal, onEditAnimal, handleMarkAnimalCareTaskDone, handleSkipAnimalCareTask }) => {
        const due = isDue(task.lastDoneDate, task.frequencyDays);
        return (
            <div className="grid grid-cols-1 sm:grid-cols-8 items-center gap-2 sm:gap-4 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                <div className="sm:col-span-2 flex items-center gap-3 cursor-pointer" onClick={() => onViewAnimal(animal)}>
                    <AnimalImage src={animal.imageUrl} alt={animal.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                    <div className="min-w-0">
                        <div className="font-semibold text-sm text-gray-800 truncate">{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</div>
                        <div className="text-xs text-gray-500 truncate">{animal.species}</div>
                    </div>
                </div>

                <div className="text-xs text-gray-600"><span className="sm:hidden font-semibold">Last Done: </span>{task.lastDoneDate ? formatDateShort(task.lastDoneDate) : <span className="text-orange-500">Never</span>}</div>

                <div className="text-xs text-gray-600"><span className="sm:hidden font-semibold">Frequency: </span>{task.frequencyDays ? `Every ${task.frequencyDays}d` : '—'}</div>

                <div className="sm:col-span-2 text-xs text-gray-400 truncate">{task.taskName}</div>

                <div className="text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${due ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{due ? 'Due/Overdue' : 'Up to Date'}</span>
                </div>

                <div className="sm:text-right flex items-center gap-1 justify-end">
                    <button onClick={(e) => handleMarkAnimalCareTaskDone(e, animal, taskIdx)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"><Check size={12} /> Done</button>
                    {due && <button onClick={(e) => handleSkipAnimalCareTask(e, animal, taskIdx)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"><SkipForward size={12} /> Skip</button>}
                    <button onClick={(e) => { e.stopPropagation(); onEditAnimal(animal); }} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200"><Edit size={14} /></button>
                </div>
            </div>
        );
    };

    // -- For Sale Screen ----------------------------------------------------------
    const renderForSaleScreen = () => {
        const availableList = availableAnimalsRaw.filter(a => a.status === 'Available' && !a.isViewOnly);
        const handleMarkRehomed = (e, animal) => {
            e.stopPropagation();
            if (!window.confirm(`Mark ${animal.name || 'this animal'} as Rehomed? This will change their status to "Rehomed".`)) return;
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, status: 'Rehomed' } : a));
            setAvailableAnimalsRaw(prev => prev.filter(a => a.id_public !== animal.id_public));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { status: 'Rehomed' },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Mark rehomed failed:', err); fetchAnimals(); });
        };
        return (
            <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag size={18} className="text-purple-600" />
                    <h3 className="text-base font-semibold text-gray-800">For Sale / Available</h3>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{availableList.length}</span>
                </div>
                {availableList.length === 0
                    ? <div className="text-sm text-gray-400 text-center py-8">No animals currently marked as Available.</div>
                    : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                        {availableList.map(a => (
                            <AnimalCard key={a._id || a.id_public} animal={a} onEditAnimal={onEditAnimal} species={a.species}
                                isSelectable={false} isSelected={false} onToggleSelect={() => {}} onTogglePrivacy={toggleAnimalPrivacy} onToggleOwned={toggleAnimalOwned}
                                hideControls hideBreedingLines
                                cardActions={<>
                                    {a.isForSale && a.salePriceAmount && (
                                        <div className="text-[10px] text-purple-600 font-medium truncate w-full text-center">
                                            {a.salePriceCurrency === 'Negotiable' ? 'Negotiable' : `${a.salePriceCurrency || ''} ${a.salePriceAmount}`.trim()}
                                        </div>
                                    )}
                                    <button onClick={(e) => handleMarkRehomed(e, a)}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500 text-white hover:bg-indigo-600 w-full flex items-center justify-center gap-0.5">
                                        <Check size={9} /> Rehomed
                                    </button>
                                </>}
                            />
                        ))}
                    </div>
                }
            </div>
        );
    };
    
    // -- Management View (view = 'enclosures' | 'reproduction' | 'health' | 'feeding') --
    const renderManagementView = (view = null) => {
        const toggleSection = (key) => setCollapsedMgmtSections(prev => ({ ...prev, [key]: !prev[key] }));
        const toggleGroup = (key) => setCollapsedMgmtGroups(prev => ({ ...prev, [key]: !prev[key] }));


        const MgmtGroup = ({ groupKey, label, groupAnimals, headerClass, renderExtras }) => {
            const isGrpCollapsed = collapsedMgmtGroups[groupKey] || false;
            return (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                        className={`relative flex items-center justify-between ${headerClass} px-3 py-2 cursor-pointer`}
                        onClick={() => toggleGroup(groupKey)}
                    >
                        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                            {isGrpCollapsed
                                ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                : <ChevronUp className="w-3.5 h-3.5 text-gray-400" />}
                        </div>
                        <span className="font-medium text-sm text-gray-800">{label}</span>
                        <span className="text-xs text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">{groupAnimals.length}</span>
                    </div>
                    {!isGrpCollapsed && (
                        <div className="p-2 space-y-1.5 bg-white">
                            {groupAnimals.length === 0
                                ? <div className="text-sm text-gray-400 text-center py-2">None</div>
                                : groupAnimals.map(a => (
                                    <MgmtAnimalCard key={a._id || a.id_public} animal={a} extras={renderExtras ? renderExtras(a) : null} />
                                ))
                            }
                        </div>
                    )}
                </div>
            );
        };

        const handleDeleteEnclosure = async (encId) => {
            if (!window.confirm('Delete this enclosure? Animals inside will become unassigned.')) return;
            const encToDelete = enclosures.find(e => e._id === encId);
            try {
                await axios.delete(`${API_BASE_URL}/enclosures/${encId}`,
                    { headers: { 'Authorization': `Bearer ${authToken}` } });
                fetchEnclosures();
                fetchAnimals();
            } catch (err) {
                showModalMessage('Error', err.response?.data?.message || 'Failed to delete enclosure');
            }
        };

        const handleAssignAnimalToEnclosure = (animalIdPublic, enclosureId) => {
            const newEnclosureId = enclosureId || null;
            // Capture old value for rollback
            const prevRaw = allAnimalsRaw;
            // Optimistic update
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animalIdPublic ? { ...a, enclosureId: newEnclosureId } : a));
            setAssigningAnimalId(null);
            axios.patch(`${API_BASE_URL}/enclosures/assign-animal`,
                { animalId_public: animalIdPublic, enclosureId: newEnclosureId },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => {
                    console.error('Assign enclosure failed:', err);
                    setAllAnimalsRaw(prevRaw);
                });
        };

        const handleMarkFed = (e, animal) => {
            e.stopPropagation();
            // Open the feeding modal; form resets each time
            setFeedingForm({ supplyId: '', qty: '1', notes: '', updateStock: true });
            setFeedingModal({ animal });
        };

        const handleFeedingSubmit = async () => {
            if (!feedingModal) return;
            const { animal } = feedingModal;
            const now = new Date().toISOString();
            setFeedingModal(null);
            // Optimistic: update lastFedDate immediately
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, lastFedDate: now } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, lastFedDate: now } }));
            try {
                const body = {};
                if (feedingForm.supplyId) {
                    body.supplyId = feedingForm.supplyId;
                    if (feedingForm.updateStock) body.quantity = Number(feedingForm.qty) || 1;
                }
                if (feedingForm.notes.trim()) body.notes = feedingForm.notes.trim();
                const res = await axios.post(`${API_BASE_URL}/animals/${animal.id_public}/feeding`, body,
                    { headers: { Authorization: `Bearer ${authToken}` } });
                // Update supply stock in state
                if (res.data.supply) setSupplies(prev => prev.map(s => s._id === res.data.supply._id ? res.data.supply : s));
                const supplyItem = feedingForm.supplyId ? supplies.find(s => s._id === feedingForm.supplyId) : null;
            } catch (err) {
                console.error('Feeding failed:', err);
                setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, lastFedDate: animal.lastFedDate } : a));
            }
        };

        const handleSkipFeeding = async (e, animal) => {
            e.stopPropagation();
            const now = new Date().toISOString();
            // Optimistic: advance lastFedDate so it clears the overdue state
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, lastFedDate: now } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, lastFedDate: now } }));
            try {
                await axios.post(`${API_BASE_URL}/animals/${animal.id_public}/feeding`,
                    { skipped: true },
                    { headers: { Authorization: `Bearer ${authToken}` } });
            } catch (err) {
                console.error('Skip feeding failed:', err);
                setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, lastFedDate: animal.lastFedDate } : a));
            }
        };

        const handleMarkRehomed = (e, animal) => {
            e.stopPropagation();
            if (!window.confirm(`Mark ${animal.name || 'this animal'} as Rehomed? This will change their status to "Rehomed".`)) return;
            // Optimistic update
            setAvailableAnimalsRaw(prev => prev.filter(a => a.id_public !== animal.id_public));
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, status: 'Rehomed' } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, status: 'Rehomed' } }));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { status: 'Rehomed' },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => {
                    console.error('Mark rehomed failed:', err);
                    // Rollback
                    setAvailableAnimalsRaw(prev => [...prev, { ...animal }]);
                    setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, status: 'Available' } : a));
                });
        };

        const handleMarkAnimalCareTaskDone = (e, animal, taskIdx) => {
            e.stopPropagation();
            const fieldName = 'animalCareTasks';
            const updated = [...(animal[fieldName] || [])];
            updated[taskIdx] = { ...updated[taskIdx], lastDoneDate: new Date().toISOString() };
            // Optimistic update
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, [fieldName]: updated } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, [fieldName]: updated } }));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { [fieldName]: updated },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Mark animal care task done failed:', err); fetchAllAnimals(); });
        };

        const handleSkipAnimalCareTask = (e, animal, taskIdx) => {
            e.stopPropagation();
            const fieldName = 'animalCareTasks';
            const updated = [...(animal[fieldName] || [])];
            const taskName = updated[taskIdx]?.taskName || 'Care task';
            updated[taskIdx] = { ...updated[taskIdx], lastDoneDate: new Date().toISOString(), lastSkipped: true };
            // Optimistic update
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, [fieldName]: updated } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, [fieldName]: updated } }));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { [fieldName]: updated },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Skip animal care task failed:', err); fetchAllAnimals(); });
        };

        // Generic handlers for the dedicated, individually-tracked Grooming/Special Care/Training
        // schedules ({ lastDoneDate, frequencyDays } shape, one Mongoose field per task).
        const handleMarkScheduleDone = (e, animal, fieldName) => {
            e.stopPropagation();
            const updated = { ...(animal[fieldName] || {}), lastDoneDate: new Date().toISOString() };
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, [fieldName]: updated } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, [fieldName]: updated } }));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { [fieldName]: updated },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Mark schedule done failed:', err); fetchAllAnimals(); });
        };

        const handleSkipScheduleTask = (e, animal, fieldName) => {
            e.stopPropagation();
            const updated = { ...(animal[fieldName] || {}), lastDoneDate: new Date().toISOString(), lastSkipped: true };
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, [fieldName]: updated } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, [fieldName]: updated } }));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { [fieldName]: updated },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Skip schedule task failed:', err); fetchAllAnimals(); });
        };

        const handleUnquarantine = (e, animal) => {
            e.stopPropagation();
            if (!window.confirm(`Release ${animal.name || 'this animal'} from quarantine?`)) return;
            const today = new Date().toISOString().substring(0, 10);
            const patch = { isQuarantine: false, quarantineDetails: { ...(animal.quarantineDetails || {}), status: 'None', endDate: today } };
            const prev = { isQuarantine: animal.isQuarantine, quarantineDetails: animal.quarantineDetails };
            // Optimistic update
            setAllAnimalsRaw(prevArr => prevArr.map(a => a.id_public === animal.id_public ? { ...a, ...patch } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, ...patch } }));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, patch,
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Unquarantine failed:', err); setAllAnimalsRaw(prevArr => prevArr.map(a => a.id_public === animal.id_public ? { ...a, ...prev } : a)); });
        };

        const handleDischargeTreatment = (e, animal) => {
            e.stopPropagation();
            if (!window.confirm(`End treatment for ${animal.name || 'this animal'}? Active medications will be marked finished (stop date = today); recorded conditions and medications are kept for history.`)) return;
            const today = new Date().toISOString().substring(0, 10);
            const meds = parseArrayField(animal.medications);
            const updatedMeds = meds.map(m => {
                const isActive = (!m.status || m.status === 'active') && (!m.stopDate || new Date(m.stopDate) >= new Date());
                return isActive ? { ...m, stopDate: today } : m;
            });
            // isInTreatment is derived, so ending treatment means finishing active medications above;
            // if an active critical condition remains, the animal will still show as "in treatment".
            const newIsInTreatment = computeIsInTreatment({ medications: updatedMeds, medicalConditions: animal.medicalConditions });
            if (newIsInTreatment) {
                window.alert(`${animal.name || 'This animal'} still has an active critical medical condition, so it will continue to show as "in treatment" until that condition is resolved.`);
            }
            const patch = { isInTreatment: newIsInTreatment, medications: updatedMeds };
            const prev = { isInTreatment: animal.isInTreatment, medications: animal.medications };
            setAllAnimalsRaw(prevArr => prevArr.map(a => a.id_public === animal.id_public ? { ...a, ...patch } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, ...patch } }));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, patch,
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('End treatment failed:', err); setAllAnimalsRaw(prevArr => prevArr.map(a => a.id_public === animal.id_public ? { ...a, ...prev } : a)); });
        };

        const handleMedicationAction = (e, animal, medId, action) => {
            e.stopPropagation();
            const meds = parseArrayField(animal.medications);
            const idx = meds.findIndex(m => m.id === medId);
            if (idx === -1) return;
            const med = meds[idx];
            const updatedMed = { ...med };

            if (action === 'confirm') {
                updatedMed.administrations = [...(med.administrations || []), { date: new Date().toISOString() }];
            } else if (action === 'prolong') {
                const unitLabel = med.intervalUnit === 'hours' ? 'hours' : 'days';
                const input = window.prompt(`Extend "${med.name}" stop date by how many ${unitLabel}?`, med.intervalUnit === 'hours' ? '24' : '7');
                if (!input) return;
                const amount = Number(input);
                if (!amount || amount <= 0) return;
                const unitMs = med.intervalUnit === 'hours' ? 3600000 : 86400000;
                const base = med.stopDate ? new Date(med.stopDate).getTime() : Date.now();
                updatedMed.stopDate = new Date(base + amount * unitMs).toISOString().substring(0, 10);
            } else if (action === 'finish') {
                if (!window.confirm(`Mark "${med.name}" as finished? This sets its stop date to today.`)) return;
                updatedMed.stopDate = new Date().toISOString().substring(0, 10);
            } else {
                return;
            }

            const updatedMeds = [...meds];
            updatedMeds[idx] = updatedMed;
            // isInTreatment is derived from active medications/critical conditions — recompute it
            // optimistically here too, so the badge updates immediately (backend recomputes on save).
            const newIsInTreatment = computeIsInTreatment({ medications: updatedMeds, medicalConditions: animal.medicalConditions });
            const patch = { medications: updatedMeds, isInTreatment: newIsInTreatment };
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, ...patch } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, ...patch } }));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, patch,
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Medication action failed:', err); fetchAllAnimals(); });
        };

        const handleReproStatusUpdate = (e, animal, patch) => {
            e.stopPropagation();
            // Optimistic update
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, ...patch } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, ...patch } }));
            let litterPatch = null;
            if (animal.isPlannedMating && patch.isPlannedMating === false && !patch.isInMating) {
                litterPatch = { isPlanned: false };
            } else if (animal.isPlannedMating && patch.isInMating) {
                litterPatch = { isPlanned: false, matingDate: patch.matingDate };
            } else if (animal.isInMating && patch.isPregnant) {
                litterPatch = { pregnancyDate: patch.pregnancyDate };
            } else if (animal.isPregnant && patch.isNursing) {
                litterPatch = { birthDate: patch.birthDate };
            } else if (animal.isNursing && patch.isNursing === false) {
                litterPatch = { weaningDate: patch.weaningDate };
            }

            if (litterPatch && animal._litterId) {
                axios.put(`${API_BASE_URL}/litters/${animal._litterId}`, litterPatch, { headers: { Authorization: `Bearer ${authToken}` } })
                    .then(() => fetchLitters()) // Refetch litters to update the UI
                    .catch(err => console.error('Failed to update litter record:', err));
            }

            // The animal update is always performed
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, patch,
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Repro status update failed:', err); setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, ...Object.fromEntries(Object.keys(patch).map(k => [k, animal[k]])) } : a)); });
        };

        return (
            <div className="space-y-3 sm:space-y-4 mt-4">

                {/* -- 1. ENCLOSURES ------------------------------------------ */}
                {(!view || view === 'enclosures') && (<div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Section header - collapse on click, Add button on right */}
                    {!view && <div className="relative flex items-center justify-between bg-blue-50 px-3 py-2.5 sm:px-4 sm:py-3 border-b cursor-pointer" onClick={() => toggleSection('enclosures')}>
                        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                            {collapsedMgmtSections['enclosures']
                                ? <ChevronDown className="w-4 h-4 text-gray-400" />
                                : <ChevronUp className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="flex items-center gap-2">
                            <Home size={18} className="text-blue-600" />
                            <span className="font-semibold text-gray-800">Enclosures</span>
                            <span className="text-xs text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">{enclosures.length}</span>
                        </div>
                    </div>}                     

                    {(!collapsedMgmtSections['enclosures'] || !!view) && (
                        <div className="p-3 space-y-2">{renderEnclosuresTab()}
                            {generalEnclosures.length === 0 && unassignedAnimals.length === 0 ? (
                                <div className="text-sm text-gray-400 text-center py-4">No enclosures yet. Click Add to create your first enclosure.</div>
                            ) : (
                                <>
                                    {/* Named enclosures */}
                                    {generalEnclosures.map(enc => {
                                        const occupants = enclosureAnimalMap[enc._id] || [];
                                        const isGrpCollapsed = collapsedMgmtGroups[`enc_${enc._id}`] || false;
                                        return (
                                            <div key={enc._id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                {/* Enclosure header */}
                                                <div className="relative flex items-center bg-blue-50/60 px-3 py-2 cursor-pointer"
                                                    onClick={() => toggleGroup(`enc_${enc._id}`)}
                                                >
                                                    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                                                        {isGrpCollapsed
                                                            ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                                            : <ChevronUp className="w-3.5 h-3.5 text-gray-400" />}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <span className="font-semibold text-sm text-gray-800 truncate">{enc.name}</span>
                                                        {enc.enclosureType && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">{enc.enclosureType}</span>}
                                                        {enc.size && <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline shrink-0">{enc.size}</span>}
                                                        <span className="text-xs text-gray-500 bg-white/70 px-1.5 py-0.5 rounded-full shrink-0">{occupants.length}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 ml-2 shrink-0" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => {
                                                                setNewEnclosureForm({
                                                                    name: enc.name,
                                                                    enclosureType: enc.enclosureType || '',
                                                                    location: enc.location || '',
                                                                    dimensions: enc.dimensions || enc.size || '',
                                                                    capacity: enc.capacity || '',
                                                                    tempMin: enc.tempMin || '', tempMax: enc.tempMax || '',
                                                                    humidityMin: enc.humidityMin || '', humidityMax: enc.humidityMax || '', buildingId: enc.buildingId || '', roomId: enc.roomId || '',
                                                                    lightingSchedule: enc.lightingSchedule || '',
                                                                    notes: enc.notes || '',
                                                                    tags: enc.tags || [], speciesLabels: enc.speciesLabels || [],
                                                                    cleaningTasks: enc.cleaningTasks || [],
                                                                    purpose: enc.purpose || 'general',
                                                                    imageUrl: enc.imageUrl || ''
                                                                });
                                                                setEnclosureImagePreview(enc.imageUrl || null);
                                                                setEnclosureImageFile(null);
                                                                setEditingEnclosureId(enc._id);
                                                                setEnclosureFormVisible(true);
                                                                setCollapsedMgmtSections(p => ({...p, enclosures: false}));
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-blue-600 rounded" title="Edit"
                                                        ><Edit size={13} /></button>
                                                        <button onClick={() => handleDeleteEnclosure(enc._id)}
                                                            className="p-1 text-gray-400 hover:text-red-500 rounded" title="Delete"
                                                        ><Trash2 size={13} /></button>
                                                    </div>
                                                </div>
                                                {!isGrpCollapsed && enc.notes && (
                                                    <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-500 border-b border-gray-100">{enc.notes}</div>
                                                )}
                                                {!isGrpCollapsed && (
                                                    <div>
                                                        {occupants.length === 0
                                                            ? <div className="text-xs text-gray-400 text-center py-2">No animals assigned yet</div>
                                                            : (
                                                                <div className="p-1.5 sm:p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                                                                    {occupants.map(a => (
                                                                        <AnimalCard key={a._id || a.id_public} animal={a} onEditAnimal={onEditAnimal} species={a.species} isSelectable={false} isSelected={false} onToggleSelect={() => {}} onTogglePrivacy={toggleAnimalPrivacy} onToggleOwned={toggleAnimalOwned}
                                                                            hideControls hideBreedingLines
                                                                            cardActions={
                                                                                <button onClick={(e) => { e.stopPropagation(); handleAssignAnimalToEnclosure(a.id_public, ''); }}
                                                                                    className="text-[10px] text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded px-1.5 py-0.5 w-full">
                                                                                    Remove
                                                                                </button>
                                                                            }
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Unassigned animals */}
                                    {unassignedAnimals.length > 0 && (
                                        <div className="border border-dashed border-gray-300 rounded-lg overflow-hidden">
                                            <div className="relative flex items-center justify-between bg-gray-50 px-3 py-2 cursor-pointer"
                                                onClick={() => toggleGroup('enc_unassigned')}
                                            >
                                                <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                                                    {collapsedMgmtGroups['enc_unassigned']
                                                        ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                                        : <ChevronUp className="w-3.5 h-3.5 text-gray-400" />}
                                                </div>
                                                <span className="font-medium text-sm text-gray-500">Unassigned</span>
                                                <span className="text-xs text-gray-400 bg-white/70 px-2 py-0.5 rounded-full">{unassignedAnimals.length}</span>
                                            </div>
                                            {!collapsedMgmtGroups['enc_unassigned'] && (
                                                <div className="p-1.5 sm:p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 bg-white">
                                                    {unassignedAnimals.map(a => (
                                                        <AnimalCard key={a._id || a.id_public} animal={a} onEditAnimal={onEditAnimal} species={a.species} isSelectable={false} isSelected={false} onToggleSelect={() => {}} onTogglePrivacy={toggleAnimalPrivacy} onToggleOwned={toggleAnimalOwned}
                                                            hideControls hideBreedingLines
                                                            cardActions={
                                                                generalEnclosures.length > 0 ? (
                                                                    assigningAnimalId === a.id_public ? (
                                                                        <select autoFocus defaultValue=""
                                                                            onChange={e => { if (e.target.value) { handleAssignAnimalToEnclosure(a.id_public, e.target.value); } setAssigningAnimalId(null); }}
                                                                            onBlur={() => setAssigningAnimalId(null)}
                                                                            className="text-[10px] border border-blue-300 rounded p-1 w-full">
                                                                            <option value="" disabled>Select enclosure...</option>
                                                                            {generalEnclosures.map(enc => <option key={enc._id} value={enc._id}>{enc.name}</option>)}
                                                                        </select>
                                                                    ) : (
                                                                        <button onClick={(e) => { e.stopPropagation(); setAssigningAnimalId(a.id_public); }}
                                                                            className="text-[10px] text-blue-500 hover:text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 w-full whitespace-nowrap">
                                                                            Assign
                                                                        </button>
                                                                    )
                                                                ) : null
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}


                {/* -- 2. FEEDING & CARE -------------------------------------- */}
                {(!view || view === 'feeding') && (<div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <SectionHeader sectionKey="feedingCare"
                        icon={<Utensils size={18} className="text-green-600" />}
                        title="Feeding & Care"
                        count={(feedDue.length + groomingScheduleDue.length + trainingScheduleDue.length + scheduledCareDueCount) > 0
                            ? `${feedDue.length + groomingScheduleDue.length + trainingScheduleDue.length + scheduledCareDueCount} due`
                            : (feedDue.length + feedOk.length + groomingScheduleDue.length + groomingScheduleOk.length + trainingScheduleDue.length + trainingScheduleOk.length + animalsWithAnimalTasks.length)}
                        bgClass="bg-green-50" hideHeader={!!view} />
                    {(!collapsedMgmtSections['feedingCare'] || !!view) && (
                        <div className="p-3 space-y-4">
                            {(() => {
                                const feedingCareSections = [
                                    {
                                        key: 'feeding', title: 'Feeding', icon: <Utensils size={16} className="text-green-700" />, headerClass: 'bg-green-50 border-b border-green-100',
                                        list: [...feedDue, ...feedOk], dueCount: feedDue.length, colLabels: ['Last Fed', 'Diet'],
                                        emptyText: "No animals with a feeding schedule set yet — set one up in the animal's Routine Care tab.",
                                        renderRow: a => <FeedingAnimalBar key={a.id_public} animal={a} onViewAnimal={onViewAnimal} onEditAnimal={onEditAnimal} handleMarkFed={handleMarkFed} handleSkipFeeding={handleSkipFeeding} />,
                                    },
                                    {
                                        key: 'grooming', title: 'Grooming & Special Care', icon: <Scissors size={16} className="text-teal-700" />, headerClass: 'bg-teal-50 border-b border-teal-100',
                                        list: [...groomingScheduleDue, ...groomingScheduleOk], dueCount: groomingScheduleDue.length, colLabels: ['Last Done', 'Task'],
                                        emptyText: "No assigned schedules yet — set one up in the animal's Routine Care tab.",
                                        renderRow: entry => <ScheduleAnimalBar key={`${entry.animal.id_public}_${entry.key}`} animal={entry.animal} label={entry.label} fieldName={entry.key} onViewAnimal={onViewAnimal} onEditAnimal={onEditAnimal} handleMarkScheduleDone={handleMarkScheduleDone} handleSkipScheduleTask={handleSkipScheduleTask} />,
                                    },
                                    {
                                        key: 'training', title: 'Training', icon: <Dumbbell size={16} className="text-teal-700" />, headerClass: 'bg-teal-50 border-b border-teal-100',
                                        list: [...trainingScheduleDue, ...trainingScheduleOk], dueCount: trainingScheduleDue.length, colLabels: ['Last Done', 'Task'],
                                        emptyText: "No assigned schedules yet — set one up in the animal's Behavior tab.",
                                        renderRow: entry => <ScheduleAnimalBar key={`${entry.animal.id_public}_${entry.key}`} animal={entry.animal} label={entry.label} fieldName={entry.key} onViewAnimal={onViewAnimal} onEditAnimal={onEditAnimal} handleMarkScheduleDone={handleMarkScheduleDone} handleSkipScheduleTask={handleSkipScheduleTask} />,
                                    },
                                    {
                                        key: 'animalcare', title: 'Custom Animal Care', icon: <ClipboardList size={16} className="text-teal-700" />, headerClass: 'bg-teal-50 border-b border-teal-100',
                                        list: [...animalCareTaskDue, ...animalCareTaskOk], dueCount: animalCareTaskDue.length, colLabels: ['Last Done', 'Task'],
                                        emptyText: "No animal care tasks. Edit an animal and add tasks in the Routine Care tab.",
                                        renderRow: entry => <AnimalCareTaskBar key={`${entry.animal.id_public}_${entry.taskIdx}`} animal={entry.animal} taskIdx={entry.taskIdx} task={entry.task} onViewAnimal={onViewAnimal} onEditAnimal={onEditAnimal} handleMarkAnimalCareTaskDone={handleMarkAnimalCareTaskDone} handleSkipAnimalCareTask={handleSkipAnimalCareTask} />,
                                    },
                                ];

                                return (
                                    <div className="space-y-4">
                                        {feedingCareSections.map(section => (
                                            <div key={section.key} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <div className={`flex items-center justify-between p-3 cursor-pointer ${section.headerClass}`} onClick={() => toggleGroup(`feedcare_${section.key}`)}>
                                                    <div className="flex items-center gap-3">
                                                        {section.icon}
                                                        <span className="font-semibold text-gray-800 text-base">{section.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-gray-500 bg-white/80 px-2.5 py-1 rounded-full">{section.dueCount > 0 ? `${section.dueCount} due` : section.list.length}</span>
                                                        {collapsedMgmtGroups[`feedcare_${section.key}`] ? <ChevronDown size={18} className="text-gray-500" /> : <ChevronUp size={18} className="text-gray-500" />}
                                                    </div>
                                                </div>
                                                {!collapsedMgmtGroups[`feedcare_${section.key}`] && (
                                                    <div className="p-2 space-y-1 bg-white">
                                                        {section.list.length === 0 ? (
                                                            <div className="text-center text-sm text-gray-400 py-4">{section.emptyText}</div>
                                                        ) : (
                                                            <>
                                                                <div className="hidden sm:grid grid-cols-8 items-center gap-4 px-3 py-1 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                                                                    <div className="col-span-2">Animal</div>
                                                                    <div>{section.colLabels[0]}</div>
                                                                    <div>Frequency</div>
                                                                    <div className="col-span-2">{section.colLabels[1]}</div>
                                                                    <div className="text-center">Status</div>
                                                                    <div className="text-right pr-2">Action</div>
                                                                </div>
                                                                {section.list.map(section.renderRow)}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>)}

                {/* -- 3. REPRODUCTION ---------------------------------------- */}
                {(!view || view === 'reproduction') && (<div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <SectionHeader sectionKey="reproduction"
                        icon={<Heart size={18} className="text-pink-600" />}
                        title="Reproduction" count={reproTotal} bgClass="bg-pink-50" hideHeader={!!view} />
                    {(!collapsedMgmtSections['reproduction'] || !!view) && (
                        <div className="p-3 space-y-4">
                            <div className="border border-pink-200 rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between p-3 bg-pink-50/60">
                                    <div className="flex items-center gap-3">
                                        <Home size={16} className="text-pink-600" />
                                        <span className="font-semibold text-gray-800 text-base">Breeding/Nursery Enclosures</span>
                                        <span className="text-sm font-bold text-gray-500 bg-white/80 px-2.5 py-1 rounded-full">{reproEnclosures.length}</span>
                                    </div>
                                    <button onClick={() => openEnclosureModal(null, { purpose: 'reproduction' })} className="flex items-center gap-1 text-xs font-medium text-pink-600 hover:text-pink-800 bg-white border border-pink-200 px-2 py-1 rounded-lg">
                                        <Plus size={11} /> Add
                                    </button>
                                </div>
                                <div className="p-3">
                                    {reproEnclosures.length === 0
                                        ? <div className="text-xs text-gray-400 text-center py-4">No breeding/nursery enclosures.</div>
                                        : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {reproEnclosures.map(enclosure => (
                                                    <EnclosureCard key={enclosure._id} enclosure={enclosure} onViewAnimal={onViewAnimal} />
                                                ))}
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                            {(() => {
                                const reproSections = [
                                    { key: 'planned', title: 'Planned Matings', list: plannedMatingList, icon: <Calendar size={16} className="text-indigo-700" />, headerClass: 'bg-indigo-50 border-b border-indigo-100', emptyText: 'No planned matings yet.' },
                                    { key: 'mating', title: 'Currently In Mating', list: matingList, icon: <Hourglass size={16} className="text-sky-700" />, headerClass: 'bg-sky-50 border-b border-sky-100', emptyText: 'No animals currently mating.' },
                                    { key: 'pregnant', title: 'Pregnant', list: pregnantList, icon: <ScanHeart size={16} className="text-pink-700" />, headerClass: 'bg-pink-50 border-b border-pink-100', emptyText: 'No pregnant animals.' },
                                    { key: 'nursing', title: 'Nursing', list: nursingList, icon: <Droplet size={16} className="text-violet-700" />, headerClass: 'bg-violet-50 border-b border-violet-100', emptyText: 'No nursing animals.' }
                                ];

                                return (
                                    <div className="space-y-4">
                                        {reproSections.map(section => (
                                            <div key={section.key} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <div className={`flex items-center justify-between p-3 cursor-pointer ${section.headerClass}`} onClick={() => toggleGroup(`repro_${section.key}`)}>
                                                    <div className="flex items-center gap-3">
                                                        {section.icon}
                                                        <span className="font-semibold text-gray-800 text-base">{section.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-gray-500 bg-white/80 px-2.5 py-1 rounded-full">{section.list.length}</span>
                                                        {collapsedMgmtGroups[`repro_${section.key}`] ? <ChevronDown size={18} className="text-gray-500" /> : <ChevronUp size={18} className="text-gray-500" />}
                                                    </div>
                                                </div>

                                                {!collapsedMgmtGroups[`repro_${section.key}`] && (
                                                    <div className="p-2 space-y-1 bg-white">
                                                        {section.list.length === 0 ? (
                                                            <div className="text-center text-sm text-gray-400 py-4">
                                                                {section.emptyText}
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="hidden sm:grid grid-cols-7 items-center gap-4 px-3 py-1 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                                                                    <div className="col-span-2">Animal</div>
                                                                    <div>Planned / Mating Date</div>
                                                                    <div>Due Date / Birth Date</div>
                                                                    <div>Weaning Date</div>
                                                                    <div className="text-center">Status</div>
                                                                    <div className="text-right pr-2">Action</div>
                                                                </div>
                                                                {section.list.map(a => (
                                                                    <ReproductiveAnimalBar key={a.id_public} animal={a} onViewAnimal={onViewAnimal} onEditAnimal={onEditAnimal} onTransfer={onTransfer} handleReproStatusUpdate={handleReproStatusUpdate} />
                                                                ))}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>)}

                {/* -- 4. MEDICAL / QUARANTINE -------------------------------- */}
                {(!view || view === 'health') && (<div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <SectionHeader sectionKey="medical"
                        icon={<Activity size={18} className="text-red-600" />}
                        title="Medical / Quarantine" count={quarantineList.length + treatmentList.length} bgClass="bg-red-50" hideHeader={!!view} />
                    {(!collapsedMgmtSections['medical'] || !!view) && (
                        <div className="p-3 space-y-4">
                            {/* Enclosures sub-panel */}
                            <div className="border border-orange-200 rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between p-3 bg-orange-50/60">
                                    <div className="flex items-center gap-3">
                                        <Home size={16} className="text-orange-600" />
                                        <span className="font-semibold text-gray-800 text-base">Enclosures</span>
                                        <span className="text-sm font-bold text-gray-500 bg-white/80 px-2.5 py-1 rounded-full">{healthEnclosures.length}</span>
                                    </div>
                                    <button onClick={() => openEnclosureModal(null, { purpose: 'medical' })} className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-800 bg-white border border-orange-200 px-2 py-1 rounded-lg">
                                        <Plus size={11} /> Add
                                    </button>
                                </div>
                                <div className="p-3">
                                    {healthEnclosures.length === 0
                                        ? <div className="text-xs text-gray-400 text-center py-4">No medical/quarantine enclosures.</div>
                                        : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {healthEnclosures.map(enclosure => (
                                                    <EnclosureCard key={enclosure._id} enclosure={enclosure} />
                                                ))}
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                            {(() => {
                                const healthSections = [
                                    { key: 'quarantine', title: 'Quarantine', list: quarantineList, icon: <AlertTriangle size={16} className="text-orange-700" />, headerClass: 'bg-orange-50 border-b border-orange-100', emptyText: 'No animals in quarantine.' },
                                    { key: 'treatment', title: 'In Treatment', list: treatmentList, icon: <Activity size={16} className="text-red-700" />, headerClass: 'bg-red-50 border-b border-red-100', emptyText: 'No animals currently in treatment.' },
                                ];

                                return (
                                    <div className="space-y-4">
                                        {healthSections.map(section => (
                                            <div key={section.key} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <div className={`flex items-center justify-between p-3 cursor-pointer ${section.headerClass}`} onClick={() => toggleGroup(`health_${section.key}`)}>
                                                    <div className="flex items-center gap-3">
                                                        {section.icon}
                                                        <span className="font-semibold text-gray-800 text-base">{section.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-gray-500 bg-white/80 px-2.5 py-1 rounded-full">{section.list.length}</span>
                                                        {collapsedMgmtGroups[`health_${section.key}`] ? <ChevronDown size={18} className="text-gray-500" /> : <ChevronUp size={18} className="text-gray-500" />}
                                                    </div>
                                                </div>

                                                {!collapsedMgmtGroups[`health_${section.key}`] && (
                                                    <div className="p-2 space-y-1 bg-white">
                                                        {section.list.length === 0 ? (
                                                            <div className="text-center text-sm text-gray-400 py-4">
                                                                {section.emptyText}
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="hidden sm:grid grid-cols-7 items-center gap-4 px-3 py-1 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                                                                    <div className="col-span-2">Animal</div>
                                                                    {section.key === 'quarantine' ? (
                                                                        <>
                                                                            <div>Type/Reason</div>
                                                                            <div>Start Date</div>
                                                                            <div>End Date</div>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <div>Condition</div>
                                                                            <div className="col-span-2">Medications</div>
                                                                        </>
                                                                    )}
                                                                    <div className="text-center">Status</div>
                                                                    <div className="text-right pr-2">Action</div>
                                                                </div>
                                                                {section.list.map(a => (
                                                                    <HealthAnimalBar key={a.id_public} animal={a} type={section.key} onViewAnimal={onViewAnimal} onEditAnimal={onEditAnimal} handleUnquarantine={handleUnquarantine} handleDischargeTreatment={handleDischargeTreatment} handleMedicationAction={handleMedicationAction} parseArrayField={parseArrayField} calcNextDose={calcNextDose} formatNextDose={formatNextDose} />
                                                                ))}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>)}

                {/* -- 5. FOR SALE / AVAILABLE (moved to top-bar button) ------ */}
                {!view && (<div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <SectionHeader sectionKey="available"
                        icon={<ShoppingBag size={18} className="text-purple-600" />}
                        title="For Sale / Available" count={availableList.length} bgClass="bg-purple-50" />
                    {!collapsedMgmtSections['available'] && (
                        <div className="p-3">
                            {availableList.length === 0
                                ? <div className="text-sm text-gray-400 text-center py-4">No animals currently marked as Available.</div>
                                : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                                    {availableList.map(a => (
                                        <AnimalCard key={a._id || a.id_public} animal={a} onEditAnimal={onEditAnimal} species={a.species} isSelectable={false} isSelected={false} onToggleSelect={() => {}} onTogglePrivacy={toggleAnimalPrivacy} onToggleOwned={toggleAnimalOwned}
                                            hideControls hideBreedingLines
                                            cardActions={<>
                                                {a.isForSale && a.salePriceAmount && (
                                                    <div className="text-[10px] text-purple-600 font-medium truncate w-full text-center">
                                                        {a.salePriceCurrency === 'Negotiable' ? 'Negotiable' : `${a.salePriceCurrency || ''} ${a.salePriceAmount}`.trim()}
                                                    </div>
                                                )}
                                                <button onClick={(e) => handleMarkRehomed(e, a)}
                                                    className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500 text-white hover:bg-indigo-600 w-full flex items-center justify-center gap-0.5">
                                                    <Check size={9} /> Rehomed
                                                </button>
                                            </>}
                                        />
                                    ))}
                                </div>
                            }
                        </div>
                    )}
                </div>)}

                {/* -- 8. ACTIVITY LOG ? now a separate screen, accessed via button in header -- */}

                {/* -- Feeding Modal ------------------------------------------------------- */}
                {feedingModal && (
                    <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4" onClick={() => setFeedingModal(null)}>
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4" onClick={e => e.stopPropagation()}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-base">Record Feeding</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{feedingModal.animal.name}</p>
                                </div>
                                <button onClick={() => setFeedingModal(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded"><X size={18} /></button>
                            </div>

                            {/* Food / Supply selector */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Food / Supply</label>
                                <select
                                    value={feedingForm.supplyId}
                                    onChange={e => setFeedingForm(f => ({ ...f, supplyId: e.target.value, qty: '1' }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                >
                                    <option value="">No food selected</option>
                                    {supplies.filter(s => s.category === 'Food').map(s => (
                                        <option key={s._id} value={s._id}>
                                            {s.name}{s.feederType ? ` (${s.feederType}${s.feederSize ? ` · ${s.feederSize}` : ''})` : ''}{s.currentStock != null ? ` · ${s.currentStock} ${s.unit || 'in stock'}` : ''}
                                        </option>
                                    ))}
                                    {supplies.filter(s => s.category === 'Food').length === 0 && (
                                        <option disabled>No food items in supply ? add some in Supplies & Inventory</option>
                                    )}
                                </select>
                            </div>

                            {/* Quantity + stock deduction ? only shown when a supply is selected */}
                            {feedingForm.supplyId && (() => {
                                const s = supplies.find(x => x._id === feedingForm.supplyId);
                                const stockAfter = Math.round((s.currentStock - Number(feedingForm.qty || 0)) * 100) / 100;
                                return (
                                    <div className="space-y-2">
                                        {/* Deduct from stock toggle */}
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={feedingForm.updateStock}
                                                onChange={e => setFeedingForm(f => ({ ...f, updateStock: e.target.checked }))}
                                                className="w-4 h-4 rounded accent-green-500"
                                            />
                                            <span className="text-sm text-gray-700">Deduct from stock</span>
                                            {s && <span className="text-xs text-gray-400">(current: {s.currentStock} {s.unit})</span>}
                                        </label>
                                        {/* Quantity input ? only when deducting */}
                                        {feedingForm.updateStock && (
                                            <div className="space-y-1">
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantity{s?.unit ? ` (${s.unit})` : ''}</label>
                                                <input
                                                    type="number" min="0.1" step="0.1"
                                                    value={feedingForm.qty}
                                                    onChange={e => setFeedingForm(f => ({ ...f, qty: e.target.value }))}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                                />
                                                {s && <p className="text-xs text-gray-400">Stock after: {s.currentStock} ? <span className={stockAfter < 0 ? 'text-red-500 font-medium' : 'text-gray-600'}>{stockAfter} {s.unit}</span></p>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</label>
                                <input
                                    type="text"
                                    value={feedingForm.notes}
                                    onChange={e => setFeedingForm(f => ({ ...f, notes: e.target.value }))}
                                    placeholder="e.g. Refused once, ate second attempt"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                />
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={handleFeedingSubmit}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
                                >
                                    ? Record Feeding
                                </button>
                                <button
                                    onClick={() => setFeedingModal(null)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        );
    };

    const renderEnclosuresTab = () => { // --- Filtering ---
        let filteredEnclosures = [...enclosures];
        if (enclosureSearch) { filteredEnclosures = filteredEnclosures.filter(e => e.name.toLowerCase().includes(enclosureSearch.toLowerCase())); }
        if (enclosureTypeFilter) { filteredEnclosures = filteredEnclosures.filter(e => e.enclosureType === enclosureTypeFilter); }
        if (enclosureStatusFilter) { if (enclosureStatusFilter === 'occupied') { filteredEnclosures = filteredEnclosures.filter(e => (enclosureAnimalMap[e._id] || []).length > 0); } else if (enclosureStatusFilter === 'empty') { filteredEnclosures = filteredEnclosures.filter(e => (enclosureAnimalMap[e._id] || []).length === 0); } }
        if (enclosureBuildingFilter) { if (enclosureRoomFilter) { filteredEnclosures = filteredEnclosures.filter(e => e.roomId === enclosureRoomFilter); } else { filteredEnclosures = filteredEnclosures.filter(e => e.buildingId === enclosureBuildingFilter); } }
        if (enclosureSpeciesFilter) { filteredEnclosures = filteredEnclosures.filter(e => (e.speciesLabels || []).includes(enclosureSpeciesFilter)); }
        return (
            <div className="space-y-4">
                {/* Search/Filter Bar */}
                <div className="p-2 bg-gray-50 dark:bg-dark-surface rounded-lg flex flex-wrap items-center gap-2">
                    <div className="relative flex-grow">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search enclosures..."
                            value={enclosureSearch}
                            onChange={e => setEnclosureSearch(e.target.value)}
                            className="w-full pl-10 p-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface-hover focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <select value={enclosureStatusFilter} onChange={e => setEnclosureStatusFilter(e.target.value)} className="p-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface-hover focus:ring-primary focus:border-primary">
                        <option value="">All Statuses</option>
                        <option value="occupied">Occupied</option>
                        <option value="empty">Empty</option>
                    </select>
                    <select value={enclosureBuildingFilter} onChange={e => { setEnclosureBuildingFilter(e.target.value); setEnclosureRoomFilter(''); }} className="p-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface-hover focus:ring-primary focus:border-primary">
                        <option value="">All Buildings</option>
                        {locations.filter(l => l.type === 'building').map(building => ( <option key={building._id} value={building._id}>{building.name}</option> ))}
                    </select>
                    <select value={enclosureRoomFilter} onChange={e => setEnclosureRoomFilter(e.target.value)} disabled={!enclosureBuildingFilter} className="p-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface-hover focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed">
                        <option value="">All Rooms</option>
                        {enclosureBuildingFilter && locations .filter(l => l.type === 'room' && l.parentLocationId === enclosureBuildingFilter) .map(room => ( <option key={room._id} value={room._id}>{room.name}</option> )) }
                    </select>
                    <select value={enclosureSpeciesFilter} onChange={e => setEnclosureSpeciesFilter(e.target.value)} className="p-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface-hover focus:ring-primary focus:border-primary">
                        <option value="">All Suitable Species</option>
                        {enclosureSpeciesLabels.map(species => ( <option key={species} value={species}>{species}</option> ))}
                    </select>
                    <button onClick={() => setShowLocationManager(true)} className="p-2 text-sm border border-gray-300 rounded-lg flex items-center gap-1.5"> <Settings size={14} /> Manage Locations </button>
                </div>
                {/* Main Content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredEnclosures.map(enclosure => ( <EnclosureCard key={enclosure._id} enclosure={enclosure} /> ))}
                </div>
                 {filteredEnclosures.length === 0 && ( <div className="text-center py-16 text-gray-500 dark:text-dark-text-secondary"> <Home size={48} className="mx-auto text-gray-300 dark:text-dark-border mb-4" /> <h3 className="font-semibold text-lg">No Enclosures Found</h3> <p className="text-sm mt-1">Try adjusting your filters or add a new enclosure.</p> </div> )}
            </div>
        );
    };

    const LoadingSpinner = () => (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin text-primary-dark mr-2" size={24} />
          <span className="text-gray-600">Loading...</span>
        </div>
    );

    const SpeciesPickerModal = ({ speciesOptions, onSelect, onClose, X, Search }) => {
        const categories = ['All', 'Mammal', 'Reptile', 'Bird', 'Amphibian', 'Fish', 'Invertebrate', 'Other'];
        const [search, setSearch] = useState('');
        const [cat, setCat] = useState('All');
        const [favorites, setFavorites] = useState(() => {
            try { return JSON.parse(localStorage.getItem('speciesFavorites') || '[]'); } catch { return []; }
        });
    
        const toggleFavorite = (e, name) => {
            e.stopPropagation();
            setFavorites(prev => {
                const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
                localStorage.setItem('speciesFavorites', JSON.stringify(next));
                window.dispatchEvent(new CustomEvent('speciesFavoritesChanged', { detail: next }));
                return next;
            });
        };
    
        const filtered = speciesOptions
            .filter(s => {
                const matchesCat = cat === 'All' || s.category === cat;
                const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.latinName && s.latinName.toLowerCase().includes(search.toLowerCase()));
                return matchesCat && matchesSearch;
            })
            .sort((a, b) => {
                const aFav = favorites.includes(a.name);
                const bFav = favorites.includes(b.name);
                if (aFav && !bFav) return -1;
                if (!aFav && bFav) return 1;
                if (a.isDefault && !b.isDefault) return -1;
                if (!a.isDefault && b.isDefault) return 1;
                return a.name.localeCompare(b.name);
            });
    
        const favCount = filtered.filter(s => favorites.includes(s.name)).length;
    
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                    <div className="flex justify-between items-center border-b p-4 flex-shrink-0">
                        <h3 className="text-lg font-bold text-gray-800">Select Species</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={22} /></button>
                    </div>
                    <div className="p-4 border-b flex-shrink-0 space-y-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Search by name or latin name..." value={search} onChange={e => setSearch(e.target.value)} autoFocus className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent" />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {categories.map(c => ( <button key={c} type="button" onClick={() => setCat(c)} className={`px-3 py-1 text-xs font-semibold rounded-full transition ${ cat === c ? 'bg-primary text-black' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }`}>{c}</button>))}
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto p-4">
                        {favCount > 0 && !search && ( <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1"><Star size={11} className="fill-current" /> Favourites</p>)}
                        {filtered.length === 0 ? ( <p className="text-center text-gray-500 py-8">No species found.</p> ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {filtered.map((s, idx) => {
                                    const isFav = favorites.includes(s.name);
                                    const prevFav = idx > 0 && favorites.includes(filtered[idx - 1].name);
                                    const showDivider = !search && !isFav && prevFav;
                                    return (
                                        <React.Fragment key={s._id || s.name}>
                                            {showDivider && ( <div className="col-span-full border-t border-gray-200 my-1" /> )}
                                            <div className="relative group">
                                                <button type="button" onClick={() => onSelect(s.name)} className={`w-full h-20 flex flex-col items-start justify-center p-2 border-2 rounded-lg text-left transition hover:shadow-md relative ${ isFav ? 'border-amber-300 bg-amber-50 hover:bg-amber-100' : s.isDefault ? 'border-primary bg-primary/10 hover:bg-primary/20' : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50' }`}>
                                                    <span className="font-medium text-sm text-gray-800 leading-tight pr-5 line-clamp-1">{s.name}</span>
                                                    {s.latinName && ( <span className="text-xs italic text-gray-500 mt-0.5 leading-tight line-clamp-1">{s.latinName}</span> )}
                                                    {s.category && ( <span className="absolute bottom-1 left-2 text-gray-400">{s.category === 'Mammal' && <Cat size={12} />}{s.category === 'Reptile' && <Turtle size={12} />}{s.category === 'Bird' && <Bird size={12} />}{s.category === 'Amphibian' && <Worm size={12} />}{s.category === 'Fish' && <Fish size={12} />}{s.category === 'Invertebrate' && <Bug size={12} />}{s.category === 'Other' && <PawPrint size={12} />}</span>)}
                                                </button>
                                                <button type="button" onClick={e => toggleFavorite(e, s.name)} title={isFav ? 'Remove from favourites' : 'Add to favourites'} className={`absolute top-2 right-2 transition ${isFav ? 'text-amber-400 opacity-100' : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-amber-400'}`}><Star size={13} className={isFav ? 'fill-current' : ''} /></button>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="border-t p-3 flex-shrink-0 flex justify-between items-center">
                        <span className="text-xs text-gray-400">{filtered.length} species{favCount > 0 ? ` · ${favCount} favourited` : ''}</span>
                        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 transition">Cancel</button>
                    </div>
                </div>
            </div>
        );
    };

    const ParentSearchModal = ({ title, currentId, onSelect, onClose, authToken, showModalMessage, API_BASE_URL, X, Search, Loader2, requiredGender, birthDate, species }) => {
        const [searchTerm, setSearchTerm] = useState('');
        const [hasSearched, setHasSearched] = useState(false);
        const [localAnimals, setLocalAnimals] = useState([]);
        const [globalAnimals, setGlobalAnimals] = useState([]);
        const [loadingLocal, setLoadingLocal] = useState(false);
        const [loadingGlobal, setLoadingGlobal] = useState(false);
        const [scope, setScope] = useState('both');
        const SearchResultItem = ({ animal, isGlobal }) => {
            const imgSrc = animal.imageUrl || animal.photoUrl || null;
            return (
                <div className="flex items-center space-x-3 p-3 border-b hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(animal)}>
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center"><AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={24} /></div>
                    <div className="flex-grow">
                        <p className="font-semibold text-gray-800">{animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}</p>
                        <p className="text-xs text-gray-500">{animal.id_public}</p>
                        <p className="text-sm text-gray-600">{animal.species} &bull; {animal.gender} &bull; {animal.status || 'Unknown'}</p>
                        {getSpeciesLatinName(animal.species) && ( <p className="text-xs italic text-gray-500">{getSpeciesLatinName(animal.species)}</p> )}
                    </div>
                    {isGlobal && <span className="text-xs text-black bg-primary px-2 py-1 rounded-full flex-shrink-0">Global</span>}
                </div>
            );
        };
        const handleSearch = async () => {
            setHasSearched(true);
            const trimmedSearchTerm = searchTerm.trim();
            if (!trimmedSearchTerm || trimmedSearchTerm.length < 1) { setLocalAnimals([]); setGlobalAnimals([]); showModalMessage('Search Info', 'Please enter a name or ID to search.'); return; }
            const idMatch = trimmedSearchTerm.match(/^\s*(?:CTC?[- ]?)?(\d+)\s*$/i);
            const isIdSearch = !!idMatch;
            const idValue = isIdSearch ? `CTC${idMatch[1]}` : null;
            const genderQuery = requiredGender ? (Array.isArray(requiredGender) ? `&gender=${requiredGender.map(g => encodeURIComponent(g)).join('&gender=')}` : `&gender=${requiredGender}`) : '';
            const birthdateQuery = birthDate ? `&birthdateBefore=${birthDate}` : '';
            const speciesQuery = species ? `&species=${encodeURIComponent(species)}` : '';
            setLoadingLocal(scope === 'local' || scope === 'both');
            setLoadingGlobal(scope === 'global' || scope === 'both');
            if (scope === 'local' || scope === 'both') {
                try {
                    const localUrl = isIdSearch ? `${API_BASE_URL}/animals?id_public=${encodeURIComponent(idValue)}` : `${API_BASE_URL}/animals?name=${encodeURIComponent(trimmedSearchTerm)}${genderQuery}${birthdateQuery}${speciesQuery}`;
                    const localResponse = await axios.get(localUrl, { headers: { Authorization: `Bearer ${authToken}` } });
                    const filteredLocal = localResponse.data.filter(a => {
                        if (a.id_public === currentId) return false;
                        if (birthDate && a.deceasedDate && (a.gender === 'Female' || a.gender === 'Intersex')) { const offspringBirth = new Date(birthDate); const parentDeceased = new Date(a.deceasedDate); if (parentDeceased < offspringBirth) return false; }
                        return true;
                    });
                    setLocalAnimals(filteredLocal);
                } catch (error) { console.error('Local Search Error:', error); showModalMessage('Search Error', 'Failed to search your animals.'); setLocalAnimals([]); } finally { setLoadingLocal(false); }
            } else { setLocalAnimals([]); setLoadingLocal(false); }
            if (scope === 'global' || scope === 'both') {
                try {
                    const globalUrl = isIdSearch ? `${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(idValue)}` : `${API_BASE_URL}/public/global/animals?name=${encodeURIComponent(trimmedSearchTerm)}${genderQuery}${birthdateQuery}${speciesQuery}`;
                    const globalResponse = await axios.get(globalUrl);
                    const filteredGlobal = globalResponse.data.filter(a => {
                        if (a.id_public === currentId) return false;
                        if (birthDate && a.deceasedDate && (a.gender === 'Female' || a.gender === 'Intersex')) { const offspringBirth = new Date(birthDate); const parentDeceased = new Date(a.deceasedDate); if (parentDeceased < offspringBirth) return false; }
                        return true;
                    });
                    setGlobalAnimals(filteredGlobal);
                } catch (error) { console.error('Global Search Error:', error); setGlobalAnimals([]); } finally { setLoadingGlobal(false); }
            } else { setGlobalAnimals([]); setLoadingGlobal(false); }
        };
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center border-b pb-3 mb-4"><h3 className="text-xl font-bold text-gray-800">{title} Selector</h3><button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button></div>
                    <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-2"><span className="text-sm font-medium text-gray-600">Search Scope:</span>{['local','global','both'].map(s => ( <button key={s} type="button" onClick={() => setScope(s)} className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 ${scope === s ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{s === 'both' ? 'Local + Global' : (s === 'local' ? 'Local' : 'Global')}</button>))}</div>
                        <div className="flex space-x-2"><input type="text" placeholder={`Search by Name or ID (e.g., Minnie or CT2468)...`} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setHasSearched(false); }} className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" /><button onClick={handleSearch} disabled={((scope === 'local' || scope === 'both') && loadingLocal) || ((scope === 'global' || scope === 'both') && loadingGlobal) || searchTerm.trim().length < 1} className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50">{ (loadingLocal || loadingGlobal) ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} /> }</button></div>
                    </div>
                    <div className="flex-grow overflow-y-auto space-y-4">
                        {loadingLocal ? <LoadingSpinner message="Searching your animals..." /> : localAnimals.length > 0 && ( <div className="border p-3 rounded-lg bg-white shadow-sm"><h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Your Animals ({localAnimals.length})</h4>{localAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={false} />)}</div>)}
                        {loadingGlobal ? <LoadingSpinner message="Searching global animals..." /> : globalAnimals.length > 0 && ( <div className="border p-3 rounded-lg bg-white shadow-sm"><h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Global Display Animals ({globalAnimals.length})</h4>{globalAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={true} />)}</div>)}
                        {hasSearched && searchTerm.trim().length >= 1 && localAnimals.length === 0 && globalAnimals.length === 0 && !loadingLocal && !loadingGlobal && ( <p className="text-center text-gray-500 py-4">No animals found matching your search term or filters.</p>)}
                    </div>
                    <div className="mt-4 pt-4 border-t"><button onClick={() => onSelect(null)} className="w-full text-sm text-gray-500 hover:text-red-500 transition">Clear {title} ID</button></div>
                </div>
            </div>
        );
    };

    const handleSelectOtherParentForLitter = (animal) => {
        if (modalTarget === 'sire-mating') {
            setMatingData(prev => ({...prev, sireId_public: animal?.id_public || '', species: prev.species || animal?.species || ''}));
            setSelectedMatingSire(animal || null);
            setMatingCOI(null);
        } else if (modalTarget === 'dam-mating') {
            setMatingData(prev => ({...prev, damId_public: animal?.id_public || '', species: prev.species || animal?.species || ''}));
            setSelectedMatingDam(animal || null);
            setMatingCOI(null);
        }
        setModalTarget(null);
    };

    useEffect(() => {
        if (!matingData.sireId_public || !matingData.damId_public) { setMatingCOI(null); return; }
        const sireId = matingData.sireId_public;
        const damId = matingData.damId_public;
        const cacheKey = `${sireId}:${damId}`;
        if (coiCacheRef.current[cacheKey] != null) { setMatingCOI(coiCacheRef.current[cacheKey]); return; }
        setMatingCalcCOI(true);
        setMatingCOI(null);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
            params: { sireId, damId, generations: 20 },
            headers: { Authorization: `Bearer ${authToken}` },
            signal: controller.signal,
        }).then(res => {
            const val = res.data.inbreedingCoefficient ?? 0;
            coiCacheRef.current[cacheKey] = val;
            setMatingCOI(val);
        }).catch(() => {}).finally(() => { clearTimeout(timeout); setMatingCalcCOI(false); });
    }, [matingData.sireId_public, matingData.damId_public, authToken, API_BASE_URL]);

    const resetMatingForm = () => {
        setMatingData({ sireId_public: '', damId_public: '', matingDate: '', expectedDueDate: '', breedingMethod: 'Natural', breedingConditionAtTime: '', species: '', notes: '' });
        setSelectedMatingSire(null);
        setSelectedMatingDam(null);
        setShowMatingBreedingDetails(false);
        setShowMatingSpeciesPicker(false);
        setMatingCOI(null);
        setMatingCalcCOI(false);
        setEditingMatingId(null);
    };

    const handleSubmitMating = async (e) => {
        e.preventDefault();
        if (!matingData.sireId_public || !matingData.damId_public) {
            showModalMessage('Error', 'Please select both a Sire and a Dam');
            return;
        }
        try {
            const sire = allAnimalsRaw.find(a => a.id_public === matingData.sireId_public) || selectedMatingSire;
            const dam = allAnimalsRaw.find(a => a.id_public === matingData.damId_public) || selectedMatingDam;
            if (!sire || !dam) {
                showModalMessage('Error', 'Selected parents not found. Please re-select sire and dam.');
                return;
            }
            const payload = {
                sireId_public: matingData.sireId_public,
                damId_public: matingData.damId_public,
                species: matingData.species || sire.species,
                matingDate: matingData.matingDate || null,
                expectedDueDate: matingData.expectedDueDate || null,
                breedingMethod: matingData.breedingMethod || 'Natural',
                breedingConditionAtTime: matingData.breedingConditionAtTime || null,
                notes: matingData.notes || '',
                isPlanned: true,
                numberBorn: 0,
            };
            let resp;
            try {
                resp = await axios.post(`${API_BASE_URL}/litters`, payload, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            } catch (createError) {
                const duplicate = createError.response?.status === 409 && createError.response.data?.duplicate;
                if (!duplicate) throw createError;
                const resolution = await resolveDuplicateLitter({ duplicate, authToken, API_BASE_URL });
                if (resolution.action === 'adopted') {
                    showModalMessage('Success', 'Adopted the existing litter into your Litter Management!');
                    setShowAddMatingForm(false);
                    resetMatingForm();
                    await fetchLitters();
                    return;
                }
                if (resolution.action === 'create-anyway') {
                    resp = await axios.post(`${API_BASE_URL}/litters`, { ...payload, confirmDuplicate: true }, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                } else {
                    return;
                }
            }
            const litterBackendId = resp.data.litterId_backend;
            if (matingCOI != null) {
                axios.put(`${API_BASE_URL}/litters/${litterBackendId}`, { inbreedingCoefficient: matingCOI }, {
                    headers: { Authorization: `Bearer ${authToken}` }
                }).catch(() => {});
            }
            showModalMessage('Success', 'Planned mating recorded!');
            setShowAddMatingForm(false);
            resetMatingForm();
            await fetchLitters();
        } catch (error) {
            console.error('Error recording planned mating:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to record mating');
        }
    };

    const renderDashboard = () => {
        const categoryIcons = {
            'Mammal': <Cat size={16} className="mr-1.5 text-gray-500" />,
            'Reptile': <Turtle size={16} className="mr-1.5 text-gray-500" />,
            'Bird': <Bird size={16} className="mr-1.5 text-gray-500" />,
            'Amphibian': <Circle size={16} className="mr-1.5 text-gray-500" />,
            'Fish': <Fish size={16} className="mr-1.5 text-gray-500" />,
            'Invertebrate': <Bug size={16} className="mr-1.5 text-gray-500" />,
            'Other': <Sparkles size={16} className="mr-1.5 text-gray-500" />
        };

        return (
            <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
                    {/* Column 1: Total Animals */}
                    <div className="flex flex-col gap-2">
                        <StatCard
                            icon={<Cat size={32} className="text-blue-800" />}
                            label="Total Animals"
                            value={totalDashboardAnimalsCount}
                            colorClass="bg-blue-100 text-blue-900"
                            hasDropdown={true}
                            isDropdownOpen={showCategoryBreakdown}
                            onDropdownToggle={() => setShowCategoryBreakdown(prev => !prev)}
                        />
                        {showCategoryBreakdown && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3 -mt-1 shadow-sm">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Category Breakdown</h4>
                                {categoryBreakdown.length > 0 ? (
                                    <ul className="text-xs space-y-1">
                                        {categoryBreakdown.map(cat => (
                                            <li key={cat.name} className="flex justify-between items-center">
                                                <span className="flex items-center text-gray-600">
                                                    {categoryIcons[cat.name]}
                                                    {cat.name}{cat.count !== 1 && cat.name !== 'Fish' ? 's' : ''}
                                                </span>
                                                <span className="font-medium text-gray-800">{cat.count} <span className="text-gray-400">({cat.percentage}%)</span></span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-gray-400 text-center">No animals to categorize.</p>
                                )}
                            </div>
                        )}
                        <div className="flex rounded-lg overflow-hidden shrink-0 shadow-sm w-full" data-tutorial-target="ownership-visibility-filter">
                            <button
                                onClick={() => setOwnedFilterMode('owned')}
                                className={`w-1/2 px-3 py-1.5 transition duration-150 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 ${ownedFilterMode === 'owned' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                title="Show only animals you own"
                            >
                                <Heart size={14} /> Owned
                            </button>
                            <button
                                onClick={() => setOwnedFilterMode('all')}
                                className={`w-1/2 px-3 py-1.5 transition duration-150 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 border-l border-gray-300 ${ownedFilterMode === 'all' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                title="Show all animals (owned and unowned)"
                            >
                                All
                            </button>
                        </div>
                        <div className="text-center text-[10px] text-gray-400 dark:text-dark-text-muted mt-1">
                            Applies to all tabs
                        </div>
                    </div>

                    {/* Column 2: Owned */}
                    <div className="flex flex-col gap-2">
                        <StatCard
                            icon={<Heart size={32} className="text-red-800" />}
                            label="Owned"
                            value={ownedDashboardCount}
                            colorClass="bg-red-100 text-red-900"
                        />
                        <button
                            onClick={() => toggleAllAnimalsOwned(true)}
                            className="w-full px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center justify-center gap-1 bg-red-100 text-red-700 hover:bg-red-200"
                            title="Mark All Animals as Owned"
                        >
                            <Heart size={14} /> Set All Owned
                        </button>
                        <button
                            onClick={() => toggleAllAnimalsOwned(false)}
                            className="w-full px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center justify-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                            title="Mark All Animals as Unowned"
                        >
                            <HeartOff size={14} /> Set All Unowned
                        </button>
                    </div>

                    {/* Column 3: Public */}
                    <div className="flex flex-col gap-2">
                        <StatCard
                            icon={<Eye size={32} className="text-green-800" />}
                            label="Public"
                            value={publicDashboardCount}
                            colorClass="bg-green-100 text-green-900"
                        />
                        <button
                            onClick={() => toggleAllAnimalsPrivacy(true)}
                            className="w-full px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center justify-center gap-1 bg-green-100 text-green-700 hover:bg-green-200"
                            title="Make All Animals Public"
                        >
                            <Eye size={14} /> Set All Public
                        </button>
                        <button
                            onClick={() => toggleAllAnimalsPrivacy(false)}
                            className="w-full px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center justify-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                            title="Make All Animals Private"
                        >
                            <EyeOff size={14} /> Set All Private
                        </button>
                    </div>

                    {/* Column 4: Sold/Archived */}
                    <div className="flex flex-col gap-2">
                        <StatCard
                            icon={<Archive size={32} className="text-purple-800" />}
                            label="Sold / Archived"
                            value={soldOrArchivedCount}
                            colorClass="bg-purple-100 text-purple-900"
                        />
                        {!showDuplicatesScreen && (
                            <button
                                onClick={() => { setShowArchiveScreen(v => !v); setShowForSaleScreen(false); }}
                                className={`w-full px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center justify-center gap-1 ${showArchiveScreen ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                                title="Archive"
                            >
                                <Archive size={14} className="sm:w-4 sm:h-4" />
                                <span>Archive</span>
                            </button>
                        )}
                    </div>

                    {/* Column 5: Needs Attention */}
                    <div className="flex flex-col gap-2">
                        {(() => {
                            const totalAttention = feedingCareDueDashboard.length + healthNeedsAttentionList.length + reproNeedsAttentionList.length + enclosureMaintenanceDueCount;
                            return (
                                <>
                                    <StatCard
                                        icon={<AlertTriangle size={32} className="text-orange-800" />}
                                        label="Needs Attention"
                                        value={totalAttention}
                                        colorClass="bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200"
                                        hasDropdown={totalAttention > 0}
                                        isDropdownOpen={showMainAlertsBreakdown}
                                        onDropdownToggle={() => setShowMainAlertsBreakdown(prev => !prev)}
                                    />
                                    {showMainAlertsBreakdown && totalAttention > 0 && (
                                        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-3 -mt-1 shadow-sm">
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Needs Attention Breakdown</h4>
                                            <ul className="text-sm space-y-1">
                                                {feedingCareDueDashboard.length > 0 && (
                                                    <>
                                                        <li className="flex justify-between items-center p-1 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface-hover" onClick={() => setAnimalView('feeding')}>
                                                            <span className="flex items-center gap-1.5 text-red-700"><Utensils size={14} /> Feeding & Care</span>
                                                            <span className="font-medium">{feedingCareDueDashboard.length}</span>
                                                        </li>
                                                        <ul className="pl-6 space-y-1 text-xs">
                                                            {feedingCareDueDashboard.map(({ animal, reasons }) => (
                                                                <li key={animal.id_public} className="flex justify-between items-center gap-2 text-gray-600 dark:text-dark-text-secondary p-1 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-border" onClick={() => onViewAnimal(animal)}>
                                                                    <span className="font-semibold truncate">{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</span>
                                                                    <span className="whitespace-nowrap">{reasons.length} task(s)</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </>
                                                )}
                                                {healthNeedsAttentionList.length > 0 && (
                                                    <>
                                                        <li className="flex justify-between items-center p-1 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface-hover" onClick={() => setAnimalView('health')}>
                                                            <span className="flex items-center gap-1.5 text-orange-700"><Activity size={14} /> Health</span>
                                                            <span className="font-medium">{healthNeedsAttentionList.length}</span>
                                                        </li>
                                                        <ul className="pl-6 space-y-1 text-xs">
                                                            {healthNeedsAttentionList.map(({ animal, reason }) => (
                                                                <li key={`${animal.id_public}-${reason}`} className="flex flex-col gap-0.5 text-gray-600 dark:text-dark-text-secondary p-1 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-border" onClick={() => onViewAnimal(animal)}>
                                                                    <span className="font-semibold truncate">{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</span>
                                                                    <span>{reason}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </>
                                                )}
                                                {reproNeedsAttentionList.length > 0 && (
                                                    <>
                                                        <li className="flex justify-between items-center p-1 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface-hover" onClick={() => setAnimalView('reproduction')}>
                                                            <span className="flex items-center gap-1.5 text-pink-700"><Heart size={14} /> Reproduction</span>
                                                            <span className="font-medium">{reproNeedsAttentionList.length}</span>
                                                        </li>
                                                        <ul className="pl-6 space-y-1 text-xs">
                                                            {reproNeedsAttentionList.map(({ animal, reason }) => (
                                                                <li key={`${animal.id_public}-${reason}`} className="flex flex-col gap-0.5 text-gray-600 dark:text-dark-text-secondary p-1 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-border" onClick={() => onViewAnimal(animal)}>
                                                                    <span className="font-semibold truncate">{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</span>
                                                                    <span>{reason}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </>
                                                )}
                                                {enclosureMaintenanceDueCount > 0 && (
                                                    <>
                                                        <li className="flex justify-between items-center p-1 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface-hover" onClick={() => setAnimalView('enclosures')}>
                                                            <span className="flex items-center gap-1.5 text-blue-700"><Home size={14} /> Enclosures</span>
                                                            <span className="font-medium">{enclosureMaintenanceDueCount}</span>
                                                        </li>
                                                        <ul className="pl-6 space-y-1 text-xs">
                                                            {enclosuresNeedingAttention.map(enc => (
                                                                <li key={enc._id} className="flex justify-between items-center text-gray-600 dark:text-dark-text-secondary p-1 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-border" onClick={() => setAnimalView('enclosures')}>
                                                                    <span>{enc.name}</span>
                                                                    <span className="font-medium">{enc.dueTasks.length} task(s)</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                        <div className="relative w-full" ref={alertsDropdownRef}>
                            <button
                                onClick={() => setShowAlertsDropdown(prev => !prev)}
                                title="Configure alerts"
                                className={`w-full px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center justify-center gap-1 ${Object.values(alertSettings).some(Boolean) ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                <Bell size={14} className="sm:w-4 sm:h-4" />
                                <span>Alerts {Object.values(alertSettings).some(Boolean) ? 'On' : 'Off'}</span>
                                <ChevronDown size={14} className={`ml-1 transition-transform ${showAlertsDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showAlertsDropdown && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                                    <div className="p-3 border-b">
                                        <h4 className="font-semibold text-sm text-gray-800">Notification Settings</h4>
                                        <p className="text-xs text-gray-500">Select which alerts to show.</p>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        {Object.entries(ALERT_CATEGORIES).map(([key, label]) => (
                                            <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={!!alertSettings[key]}
                                                    onChange={() => toggleAlertCategory(key)}
                                                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                                                />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const toggleAllAnimalsOwned = async (makeOwned) => {
        if (animals.length === 0) {
            showModalMessage('No Animals', 'No animals found.');
            return;
        }

        const action = makeOwned ? 'owned' : 'unowned';
        const confirmChange = window.confirm(`Are you sure you want to mark ALL ${animals.length} animals as ${action}?`);
        if (!confirmChange) return;

        // Update local state immediately for instant UI feedback
        const updatedAnimals = animals.map(animal => ({
            ...animal,
            isOwned: makeOwned,
        }));
        setAnimals(updatedAnimals);
        setAllAnimalsRaw(prev => prev.map(animal => ({
            ...animal,
            isOwned: makeOwned,
        })));

        // Update database in the background
        let failedUpdates = 0;
        for (const animal of animals) {
            try {
                await fetch(`${API_BASE_URL}/animals/${animal.id_public}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        isOwned: makeOwned,
                    })
                });
            } catch (error) {
                console.error(`Error updating animal ${animal.id_public}:`, error);
                failedUpdates++;
            }
        }

        // Show notification if there were failures
        if (failedUpdates > 0) {
            showModalMessage('Partial Success', `Updated locally, but ${failedUpdates} animal(s) failed to sync with the server. They will be updated on next refresh.`);
        }
    };

    const handleViewAnimalFromNotification = useCallback((animalId) => {
        const animal = allAnimalsRaw.find(a => a.id_public === animalId);
        if (animal) {
            onViewAnimal(animal);
        } else {
            // Fallback for animals not in the current list (e.g., transferred)
            showModalMessageRef.current('Info', 'Navigating to animal...');
            navigate(`/animals/${animalId}`);
        }
    }, [allAnimalsRaw, onViewAnimal, navigate, showModalMessageRef]);

    return (
        <>
            {/* Animal List section */}
            <div className="w-full max-w-7xl bg-white dark:bg-dark-bg p-6 rounded-xl shadow-lg transition-colors duration-200">
                <div className="flex items-center justify-between w-full gap-2 min-w-0 mb-4">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <ClipboardList size={20} className="sm:w-6 sm:h-6 shrink-0 text-primary-dark dark:text-dark-accent" />
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-dark-text truncate" data-tutorial-target="my-animals-title">
                            {animalView === 'list' ? `My Animals` : animalView === 'collections' ? 'Collections' : animalView === 'enclosures' ? 'Enclosures' : animalView === 'reproduction' ? 'Reproduction' : animalView === 'health' ? 'Health' : animalView === 'feeding' ? 'Feeding & Care' : animalView === 'supplies' ? 'Supplies & Inventory' : animalView === 'familyTree' ? 'Family Tree' : showForSaleScreen ? 'For Sale / Available' : 'My Animals'}
                        </h2>
                        {/* Refresh button */}
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="text-gray-500 dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-primary transition disabled:opacity-50 flex items-center gap-1 px-1.5 py-0.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-xs font-medium"
                            title="Refresh"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        {isListLikeView && hasActiveFilters && (
                            <span className="bg-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full shrink-0">
                                Filtered
                            </span>
                        )}
                    </div>
                    {/* Right-aligned action buttons */}
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
                        {/* Find Duplicates */}
                        {!showArchiveScreen && (
                            <button
                                onClick={() => { setDuplicateGroups([]); setShowDuplicatesScreen(v => !v); setShowForSaleScreen(false); }}
                                className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition ${showDuplicatesScreen ? 'bg-amber-500 text-white border-amber-500' : 'text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}
                                title="Find Duplicate Animals"
                            >
                                <Search size={14} className="sm:w-4 sm:h-4" />
                                <span className="font-medium hidden sm:inline">Find Duplicates</span>
                            </button>
                        )}
                        {/* Add Enclosure button */}
                        {animalView === 'reproduction' ? (
                            <button onClick={() => setShowAddMatingForm(true)} className="flex bg-accent hover:bg-accent/90 text-white font-semibold py-1.5 sm:py-2 px-3 rounded-lg transition duration-150 shadow-md items-center justify-center gap-1 whitespace-nowrap text-xs sm:text-sm" title="Add Planned Mating">
                                <Plus size={14} className="sm:w-4 sm:h-4" /> <span>Add Mating</span>
                            </button>
                        ) : animalView === 'health' ? (
                            <button onClick={() => setShowAssignHealthStatusModal(true)} className="flex bg-orange-600 hover:bg-orange-700 text-white font-semibold py-1.5 sm:py-2 px-3 rounded-lg transition duration-150 shadow-md items-center justify-center gap-1 whitespace-nowrap text-xs sm:text-sm" title="Assign Quarantine or Treatment">
                                <Plus size={14} className="sm:w-4 sm:h-4" /> <span>Assign Quarantine/Treatment</span>
                            </button>
                        ) : animalView === 'feeding' ? null : (
                            <button
                                onClick={() => openEnclosureModal()}
                                className="flex bg-primary hover:bg-primary/90 text-black font-semibold py-1.5 sm:py-2 px-3 rounded-lg transition duration-150 shadow-md items-center justify-center gap-1 whitespace-nowrap text-xs sm:text-sm"
                                title="Add New Enclosure"
                            >
                                <Plus size={14} className="sm:w-4 sm:h-4" /> <span>Add Enclosure</span>
                            </button>
                        )}
                        {/* Add Animal (only on list/collections views) — desktop only, mobile is in title row */}
                        {isListLikeView && !showArchiveScreen && (
                            <button
                                onClick={() => navigate('/select-species')}
                                className="hidden sm:flex bg-accent hover:bg-accent/90 dark:bg-dark-accent dark:hover:bg-dark-accent/80 text-white font-semibold py-1.5 sm:py-2 px-3 rounded-lg transition duration-150 shadow-md items-center justify-center gap-1 whitespace-nowrap text-xs sm:text-sm"
                                data-tutorial-target="add-animal-btn"
                            >
                                <PlusCircle size={14} className="sm:w-4 sm:h-4" /> <span>Add Animal</span>
                            </button>
                        )}
                        {/* Mobile Add Animal button — icon-only on mobile, hidden on sm+ */}
                        {isListLikeView && !showArchiveScreen && (
                        <button
                            onClick={() => navigate('/select-species')}
                            className="sm:hidden bg-accent hover:bg-accent/90 dark:bg-dark-accent dark:hover:bg-dark-accent/80 text-white font-semibold py-1.5 px-2.5 rounded-lg transition duration-150 shadow-md flex items-center justify-center gap-1 shrink-0 text-xs"
                            data-tutorial-target="add-animal-btn"
                            title="Add Animal"
                        >
                            <PlusCircle size={14} /> <span className="sm:hidden">Add</span>
                        </button>
                        )}
                    </div>
                </div>

                {/* Conditional Dashboards */}
                {animalView === 'enclosures' ? (
                    renderEnclosureDashboard()
                ) : animalView === 'reproduction' ? (
                    renderReproductionDashboard()
                ) : animalView === 'health' ? (
                    renderHealthDashboard()
                ) : animalView === 'feeding' ? (
                    renderFeedingDashboard()
                ) : (
                    renderDashboard()
                )}

                {/* View Toggle: My Animals / Collections / Enclosures / Reproduction / Health / Feeding & Care / Supplies */}
            {!showArchiveScreen && (
            <div className="mb-4 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-3 sm:hidden">
                                {[{key:'list', icon:<ClipboardList size={14} className="shrink-0" />, label:'My Animals'},
                                    {key:'collections', icon:<FolderOpen size={14} className="shrink-0" />, label:'Collections'},
                                    {key:'enclosures', icon:<Home size={14} className="shrink-0" />, label:'Enclosures'},
                                    {key:'reproduction', icon:<Heart size={14} className="shrink-0" />, label:'Reproduction'},
                                    {key:'health', icon:<Activity size={14} className="shrink-0" />, label:'Health'},
                                    {key:'feeding', icon:<Utensils size={14} className="shrink-0" />, label:'Feeding & Care'}
                ].map(tab => (
                    <button key={tab.key}
                        onClick={() => setAnimalView(tab.key)}
                                                className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 text-[10px] font-semibold transition ${
                            animalView === tab.key ? 'bg-primary text-black' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        <span
                            onClick={e => { e.stopPropagation(); const next = tab.key; setDefaultAnimalView(next); try { localStorage.setItem('ct_default_animal_view', next); } catch {} }}
                            title={defaultAnimalView === tab.key ? 'Default view' : 'Set as default'}
                            className={`absolute top-1 right-1.5 transition-colors ${
                                defaultAnimalView === tab.key ? 'text-red-500' : 'text-gray-300 hover:text-gray-500'
                            }`}
                        >
                            <Pin size={13} fill={defaultAnimalView === tab.key ? 'currentColor' : 'none'} strokeWidth={2} />
                        </span>
                    </button>
                ))}
                </div>
                <div className="hidden sm:flex">
                {[{key:'list', icon:<ClipboardList size={14} className="shrink-0" />, label:'My Animals'},
                  {key:'collections', icon:<FolderOpen size={14} className="shrink-0" />, label:'Collections'}, {key:'enclosures', icon:<Home size={14} className="shrink-0" />, label:'Enclosures'}, {key:'reproduction', icon:<Heart size={14} className="shrink-0" />, label:'Reproduction'}, {key:'health', icon:<Activity size={14} className="shrink-0" />, label:'Health'}, {key:'feeding', icon:<Utensils size={14} className="shrink-0" />, label:'Feeding & Care'}].map(tab => (
                    <button key={tab.key}
                        onClick={() => setAnimalView(tab.key)}
                        className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-4 text-sm font-semibold transition ${
                            animalView === tab.key ? 'bg-primary text-black' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        <span
                            onClick={e => { e.stopPropagation(); const next = tab.key; setDefaultAnimalView(next); try { localStorage.setItem('ct_default_animal_view', next); } catch {} }}
                            title={defaultAnimalView === tab.key ? 'Default view' : 'Set as default'}
                            className={`absolute top-1 right-1.5 transition-colors ${
                                defaultAnimalView === tab.key ? 'text-red-500' : 'text-gray-300 hover:text-gray-500'
                            }`}
                        >
                            <Pin size={18} fill={defaultAnimalView === tab.key ? 'currentColor' : 'none'} strokeWidth={2} />
                        </span>
                    </button>
                ))}
                </div>
            </div>
            )}

            {isListLikeView && !showArchiveScreen && (
                // Filter bar
                <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                    <div className="flex flex-wrap items-center gap-2 flex-grow">
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
                            <button onClick={() => {
                                if (isCollectionsView) { setCollectionsViewMode('cards'); } else {
                                    setMyAnimalsViewMode('cards');
                                }
                            }}
                                className={`p-2 transition text-xs font-medium flex items-center gap-1 ${(isCollectionsView ? collectionsViewMode : myAnimalsViewMode) === 'cards' ? 'bg-primary text-black' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                                title="Card view"
                            >
                                <LayoutGrid size={14} />
                            </button>
                            <button onClick={() => {
                                if (isCollectionsView) { setCollectionsViewMode('list'); } else {
                                    setMyAnimalsViewMode('list');
                                }
                            }}
                                className={`p-2 transition text-xs font-medium flex items-center gap-1 border-l border-gray-200 ${(isCollectionsView ? collectionsViewMode : myAnimalsViewMode) === 'list' ? 'bg-primary text-black' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                                title="List view"
                            >
                                <ClipboardList size={14} />
                            </button>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                if (isCollectionsView) {
                                    setDefaultCollectionsViewMode(collectionsViewMode);
                                } else {
                                    setDefaultMyAnimalsViewMode(myAnimalsViewMode);
                                }
                            }}
                                className={`p-2 transition text-xs font-medium flex items-center gap-1 border-l border-gray-200 ${
                                    (isCollectionsView && defaultCollectionsViewMode === collectionsViewMode) ||
                                    (!isCollectionsView && defaultMyAnimalsViewMode === myAnimalsViewMode)
                                    ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                                title="Pin as default view"
                            >
                                <Pin size={14} fill={
                                    (isCollectionsView && defaultCollectionsViewMode === collectionsViewMode) ||
                                    (!isCollectionsView && defaultMyAnimalsViewMode === myAnimalsViewMode)
                                    ? 'currentColor' : 'none'} />
                            </button>
                        </div>
                        {isCollectionsView && (
                            <button
                                onClick={() => setShowCollectionManager(prev => !prev)}
                                className={`p-2 text-xs border rounded-lg flex items-center gap-1 transition ${showCollectionManager ? 'bg-gray-200 border-gray-300 text-gray-800' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Wrench size={14} />
                                <span>{showCollectionManager ? 'Close Collections' : 'Manage Collections'}</span>
                            </button>
                        )}
                        <div className="relative flex-shrink-0">
                            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchInput}
                                onChange={handleSearchInputChange}
                                onKeyPress={(e) => { if (e.key === 'Enter') triggerSearch(); }}
                                className="w-36 sm:w-40 pl-8 p-2 text-sm border border-gray-300 rounded-lg"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); setSpeciesFilter(''); }}
                            className="p-2 text-sm border border-gray-300 rounded-lg"
                        >
                            {allSpeciesCategories.map(cat => (
                                <option key={cat} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
                            ))}
                        </select>
                        <select 
                            value={speciesFilter}
                            onChange={(e) => { setSpeciesFilter(e.target.value); }}
                            className="p-2 text-sm border border-gray-300 rounded-lg"
                        >
                            <option value="">All Species</option>
                            {filteredSpeciesNames.map(species => (
                                <option key={species} value={species}>{getSpeciesDisplayName(species)}</option>
                            ))}
                        </select>
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); }}
                            className="p-2 text-sm border border-gray-300 rounded-lg"
                        >
                            <option value="">All Statuses</option>
                            {STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <select value={genderFilter} onChange={(e) => { setGenderFilter(e.target.value); }}
                            className="p-2 text-sm border border-gray-300 rounded-lg"
                        >
                            {GENDER_OPTIONS.map(gender => (
                                <option key={gender} value={gender === 'All Genders' ? '' : gender}>{gender}</option>
                            ))}
                        </select>
                        {breedingLineDefs && breedingLineDefs.length > 0 && (
                            <select
                                value={blFilter.length > 0 ? blFilter[0] : ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setBlFilter(value ? [value] : []);
                                }}
                                className="p-2 text-sm border border-gray-300 rounded-lg"
                            >
                                <option value="">All Lines</option>
                                {breedingLineDefs.filter(line => line.name && line.enabled !== false).map(line => (
                                    <option key={line.id} value={line.id}>{line.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="flex items-center gap-2 ml-auto flex-wrap">
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
                        </div>
                        <span className="hidden sm:inline mx-1 text-gray-300">|</span>
                        <button onClick={() => requestSort('name')} className={`flex items-center gap-1 text-sm p-2 rounded-lg ${sortConfig.key === 'name' ? 'bg-primary text-black' : 'bg-gray-200'}`}>
                            A-Z {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                        </button>
                        <button onClick={() => requestSort('birthdate')} className={`flex items-center gap-1 text-sm p-2 rounded-lg ${sortConfig.key === 'birthdate' ? 'bg-primary text-black' : 'bg-gray-200'}`}>
                            Age {sortConfig.key === 'birthdate' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                        </button>
                    </div>
            </div>
            )}
             {showArchiveScreen ? renderArchiveScreen() : showDuplicatesScreen ? renderDuplicatesScreen() : animalView === 'enclosures' ? renderEnclosuresTab() : animalView === 'reproduction' ? renderManagementView('reproduction') : animalView === 'health' ? renderManagementView('health') : animalView === 'feeding' ? renderManagementView('feeding') : animalView === 'collections' ? renderCollectionsView() : (animalView === 'familyTree' && isFamilyTreeEnabled) ? <FamilyTreeView animals={allAnimalsRaw} loading={loading} onViewAnimal={onViewAnimal || onEditAnimal} authToken={authToken} breedingLineDefs={breedingLineDefs} animalBreedingLines={animalBreedingLines} prefetchedAncestorsBySpecies={familyTreePrefetchBySpecies} prefetchLoadingBySpecies={familyTreePrefetchLoadingBySpecies} onAncestorsResolved={handleFamilyTreeAncestorsResolved} /> : (loading && animals.length === 0) ? (
                <div className="space-y-3 sm:space-y-4"> {/* Skeleton grid */} </div>
            ) : displayedAnimalCount === 0 ? ( <div /> ) : myAnimalsViewMode === 'list' ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm relative">
                    {showColumnsDropdown && (
                        <div ref={columnsDropdownRef} className="absolute top-10 right-2 bg-white border rounded-lg shadow-lg p-3 z-20 w-48">
                            <h4 className="text-xs font-bold mb-2">Displayed Columns</h4>
                            {Object.entries({ animal: 'Animal', species: 'Species', variety: 'Variety', enclosure: 'Enclosure', lifeStage: 'Life Stage', status: 'Status', health: 'Health', birthdateAge: 'Birthdate / Age', breedingLines: 'Lines', tags: 'Tags' }).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 text-sm text-gray-700 p-1 hover:bg-gray-100 rounded">
                                    <input type="checkbox" checked={!!listViewColumns[key]} onChange={() => setListViewColumns(prev => ({...prev, [key]: !prev[key]}))} className="rounded" />
                                    {label}
                                </label>
                            ))}
                        </div>
                    )}
                    <table className="min-w-full text-xs divide-y divide-gray-200">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 text-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 cursor-pointer rounded"
                                        onChange={handleListSelectAll}
                                        checked={displayedAnimalsForList.length > 0 && listSelectedIds.size === displayedAnimalsForList.length}
                                        ref={el => el && (el.indeterminate = listSelectedIds.size > 0 && listSelectedIds.size < displayedAnimalsForList.length)}
                                    />
                                </th>
                                {listViewColumns.animal && <th className="px-3 py-2 text-left font-semibold">Animal</th>}
                                {listViewColumns.species && <th className="px-3 py-2 text-left font-semibold">Species</th>}
                                {listViewColumns.variety && <th className="px-3 py-2 text-left font-semibold">Variety</th>}
                                {listViewColumns.enclosure && <th className="px-3 py-2 text-left font-semibold">Enclosure</th>}
                                {listViewColumns.lifeStage && <th className="px-3 py-2 text-left font-semibold">Life Stage</th>}
                                {listViewColumns.status && <th className="px-3 py-2 text-left font-semibold">Status</th>}
                                {listViewColumns.health && <th className="px-3 py-2 text-left font-semibold">Health</th>}
                                {listViewColumns.birthdateAge && <th className="px-3 py-2 text-left font-semibold">Birthdate / Age</th>}
                                {listViewColumns.breedingLines && <th className="px-3 py-2 text-left font-semibold">Lines</th>}
                                {listViewColumns.tags && <th className="px-3 py-2 text-left font-semibold">Tags</th>}
                                <th className="px-3 py-2 text-right w-12">
                                    <button onClick={() => setShowColumnsDropdown(v => !v)} className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200">
                                        <SlidersHorizontal size={14} />
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(() => {
                            const enclosureMap = new Map(enclosures.map(e => [e._id, e.name]));
                                return displayedAnimalsForList.map(animal => {
                                    const birthDateObj = animal.birthDate ? new Date(animal.birthDate) : null;
                                    const ageStr = calculateBreedingAge(animal.birthDate, animal.deceasedDate);
                                    const varietyStr = [animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).join(' ') || '—';
                                    const assignedIds = animalBreedingLines[animal.id_public] || [];
                                    const activeLines = breedingLineDefs.filter(l => assignedIds.includes(l.id) && l.name && l.enabled !== false);

                                    return (
                                        <tr key={animal.id_public || animal._id} className="hover:bg-gray-50" onClick={() => onViewAnimal(animal)}>
                                        <td className="px-4 py-1.5 text-center">
                                            <input
                                                type="checkbox"
                                                checked={listSelectedIds.has(animal.id_public)}
                                                onChange={() => handleListToggle(animal.id_public)}
                                                className="w-4 h-4 cursor-pointer rounded"
                                                onClick={e => e.stopPropagation()}
                                            />
                                        </td>
                                        {listViewColumns.animal && (
                                            <td className="px-3 py-1.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden cursor-pointer" onClick={(e) => {e.stopPropagation(); onViewAnimal(animal);}}>
                                                        <AnimalImage src={animal.imageUrl || animal.photoUrl} alt={animal.name} iconSize={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-800 flex items-center gap-1.5 text-sm">
                                                            <span className="cursor-pointer hover:underline" onClick={(e) => {e.stopPropagation(); onViewAnimal(animal);}}>
                                                                {[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}
                                                            </span>
                                                            {animal.gender === 'Male' ? <Mars className="w-3.5 h-3.5 text-primary" /> : animal.gender === 'Female' ? <Venus className="w-3.5 h-3.5 text-accent" /> : animal.gender === 'Intersex' ? <VenusAndMars className="w-3.5 h-3.5 text-purple-500" /> : null}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono">{animal.id_public}</div>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        {listViewColumns.species && <td className="px-3 py-1.5 text-gray-600"><div>{animal.species || '—'}</div>{getSpeciesLatinName(animal.species) && <div className="text-xs text-gray-400">{getSpeciesLatinName(animal.species)}</div>}</td>}
                                        {listViewColumns.variety && <td className="px-3 py-1.5 text-gray-600"><div>{varietyStr}</div>{animal.geneticCode && <div className="text-xs text-gray-400 font-mono">{animal.geneticCode}</div>}</td>}
                                        {listViewColumns.enclosure && <td className="px-3 py-1.5 text-gray-600">{animal.enclosureId ? enclosureMap.get(animal.enclosureId) || 'N/A' : '—'}</td>}
                                        {listViewColumns.lifeStage && <td className="px-3 py-1.5 text-gray-600">{animal.lifeStage || '—'}</td>}
                                        {listViewColumns.status && <td className="px-3 py-1.5 text-gray-600 text-xs">{animal.status || '—'}</td>}
                                        {listViewColumns.health && <td className="px-3 py-1.5 text-gray-600 text-xs">{renderHealthColumnCell(animal)}</td>}
                                        {listViewColumns.birthdateAge && (
                                            <td className="px-3 py-1.5 text-gray-600 whitespace-nowrap">
                                                <div>{formatLocalDate(animal.birthDate)}</div>
                                                <div className="text-xs text-gray-400">{ageStr}</div>
                                            </td>
                                        )}
                                        {listViewColumns.breedingLines && (
                                            <td className="px-3 py-1.5">
                                                {activeLines.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {activeLines.map(l => (
                                                            <span key={l.id} title={l.name} style={{ color: l.color }} className="text-lg leading-none">&#x25C6;</span>
                                                        ))}
                                                    </div>
                                                ) : '—'}
                                            </td>
                                        )}
                                        {listViewColumns.tags && (
                                            <td className="px-3 py-1.5 text-gray-500">
                                                {(animal.tags && animal.tags.length > 0) ? animal.tags.join(', ') : '—'}
                                            </td>
                                        )}
                                        <td className="px-3 py-1.5 text-right">
                                            <button className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200" onClick={(e) => {e.stopPropagation(); setOpenActionMenu(animal.id_public); }}>
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    {speciesNames.map(species => {
                        const isBulkMode = bulkDeleteMode[species] || bulkArchiveMode[species] || false;
                        const isArchiveMode = bulkArchiveMode[species] || false;
                        const selected = selectedAnimals[species] || [];
                        const isCollapsed = collapsedSpecies[species] || false;
                        // Skip species that have no visible animals under current filters
                        if (!groupedAnimals[species]?.length) return null;
                        
                        return (
                        <div key={species} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div 
                                className="relative flex items-center justify-between bg-gray-100 px-2 py-2 sm:p-4 border-b cursor-pointer"
                                onClick={() => {
                                    if (!isBulkMode) {
                                        setCollapsedSpecies(prev => ({ ...prev, [species]: !prev[species] }));
                                    }
                                }}
                            >
                                {/* Collapse indicator ? centered, up/down chevron */}
                                {!isBulkMode && (
                                    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                                        {isCollapsed
                                            ? <ChevronDown className="w-4 h-4 text-gray-400" />
                                            : <ChevronUp className="w-4 h-4 text-gray-400" />
                                        }
                                    </div>
                                )}
                                <div className="flex items-center gap-1 sm:gap-2">
                                    {/* Reorder buttons ? left side, bordered pill */}
                                    {!isBulkMode && (
                                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); moveSpecies(species, 'up'); }}
                                                disabled={speciesNames.indexOf(species) === 0}
                                                className="p-1 sm:p-1.5 hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-300"
                                                title="Move Up"
                                            >
                                                <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); moveSpecies(species, 'down'); }}
                                                disabled={speciesNames.indexOf(species) === speciesNames.length - 1}
                                                className="p-1 sm:p-1.5 hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Move Down"
                                            >
                                                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                                            </button>
                                        </div>
                                    )}
                                    <h3 className="text-sm sm:text-lg font-bold text-gray-700">
                                        {getSpeciesDisplayName(species)} ({groupedAnimals[species].length})
                                    </h3>
                                </div>
                                <div className="flex items-center gap-0.5 sm:gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                                    {isBulkMode && (
                                        <>
                                            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                                                {selected.length} selected
                                            </span>
                                            <span className="text-xs text-gray-600 sm:hidden">
                                                {selected.length}
                                            </span>
                                            {isArchiveMode ? (
                                                <>
                                                    <button
                                                        onClick={() => handleBulkArchive(species)}
                                                        disabled={selected.length === 0}
                                                        className="px-2 sm:px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="hidden sm:inline">Archive Selected</span>
                                                        <span className="sm:hidden">Archive</span>
                                                    </button>
                                                    <button
                                                        onClick={() => toggleBulkArchiveMode(species)}
                                                        className="px-2 sm:px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs sm:text-sm font-semibold rounded-lg transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleBulkDelete(species)}
                                                        disabled={selected.length === 0}
                                                        className="px-2 sm:px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="hidden sm:inline">Delete Selected</span>
                                                        <span className="sm:hidden">Delete</span>
                                                    </button>
                                                    <button
                                                        onClick={() => toggleBulkDeleteMode(species)}
                                                        className="px-2 sm:px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs sm:text-sm font-semibold rounded-lg transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                    {!isBulkMode && (
                                        <>
                                            <button
                                                onClick={() => toggleBulkPrivacy(species, true)}
                                                className="p-1 sm:p-2 hover:bg-gray-200 rounded-lg transition"
                                                title="Make All Public"
                                            >
                                                <Eye className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] text-green-600" />
                                            </button>
                                            <button
                                                onClick={() => toggleBulkPrivacy(species, false)}
                                                className="p-1 sm:p-2 hover:bg-gray-200 rounded-lg transition"
                                                title="Make All Private"
                                            >
                                                <EyeOff className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => toggleBulkDeleteMode(species)}
                                                data-tutorial-target="bulk-delete-btn"
                                                className="p-1 sm:p-2 hover:bg-gray-200 rounded-lg transition"
                                                title="Delete Multiple"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] text-red-500" />
                                            </button>
                                            <button
                                                onClick={() => toggleBulkArchiveMode(species)}
                                                className="p-1 sm:p-2 hover:bg-gray-200 rounded-lg transition"
                                                title="Archive Multiple"
                                            >
                                                <Archive className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] text-gray-600" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            {/* Collapsible content */}
                            <div className={isCollapsed ? 'hidden' : 'block'}>
                                <div className="p-1.5 sm:p-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                                    {groupedAnimals[species].map(animal => (
                                        <AnimalCard 
                                            key={animal.id_public} 
                                            animal={animal} 
                                            onEditAnimal={onEditAnimal}
                                            species={species}
                                            isSelectable={isBulkMode}
                                            isSelected={selected.includes(animal.id_public)}
                                            onToggleSelect={toggleAnimalSelection}
                                            onTogglePrivacy={toggleAnimalPrivacy}
                                            onToggleOwned={toggleAnimalOwned}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
            {showNotifications && (
                <NotificationPanel
                    authToken={authToken}
                    API_BASE_URL={API_BASE_URL}
                    onClose={() => setShowNotifications(false)}
                    showModalMessage={showModalMessage}
                    onNotificationChange={() => window.dispatchEvent(new CustomEvent('notifications-changed'))}
                    onViewAnimal={handleViewAnimalFromNotification}
                />
            )}
            {showBreedingLineManager && (
                <BreedingLineManagerModal
                    lines={breedingLineDefs}
                    onClose={() => setShowBreedingLineManager(false)}
                    onClearLine={handleClearBreedingLine}
                />
            )}
            <EnclosureModal
                isOpen={showEnclosureModal}
                onClose={handleCloseEnclosureModal}
                enclosureFormData={enclosureFormData}
                setNewEnclosureForm={setNewEnclosureForm}
                editingEnclosureId={editingEnclosureId}
                setEditingEnclosureId={setEditingEnclosureId}
                handleSaveEnclosure={handleSaveEnclosure}
                handleDeleteEnclosure={handleDeleteEnclosure}
                enclosureSaving={enclosureSaving}
                enclosureImageFile={enclosureImageFile}
                setEnclosureImageFile={setEnclosureImageFile}
                enclosureImagePreview={enclosureImagePreview}
                setEnclosureImagePreview={setEnclosureImagePreview} newEnclosureTag={newEnclosureTag} setNewEnclosureTag={setNewEnclosureTag} handleEnclosureTagAdd={handleEnclosureTagAdd} handleEnclosureTagRemove={handleEnclosureTagRemove}
                speciesOptions={speciesOptionsForEnclosureModal}
                handleEnclosureSpeciesLabelAdd={handleEnclosureSpeciesLabelAdd} handleEnclosureSpeciesLabelRemove={handleEnclosureSpeciesLabelRemove}
                locations={locations} onManageLocations={() => setShowLocationManager(true)}
                newCleaningTaskName={newCleaningTaskName} setNewCleaningTaskName={setNewCleaningTaskName} newCleaningTaskFreq={newCleaningTaskFreq} setNewCleaningTaskFreq={setNewCleaningTaskFreq}
                supplies={supplies}
            />
            {showDetailModal && selectedEnclosure && (
                <EnclosureDetailModal
                    isOpen={showDetailModal}
                    onClose={() => { setShowDetailModal(false); setSelectedEnclosure(null); setEnclosureAnimals([]); }}
                    enclosure={selectedEnclosure}
                    animals={enclosureAnimals}
                    assignableAnimals={assignableAnimals}
                    loadingAnimals={loadingAnimals}
                    authToken={authToken}
                    API_BASE_URL={API_BASE_URL}
                    showModalMessage={showModalMessage}
                    onRefresh={() => { fetchEnclosures(); fetchAllAnimals(); }}
                    onViewAnimal={onViewAnimal}
                    onEditEnclosure={(enclosureToEdit) => { setShowDetailModal(false); openEnclosureModal(enclosureToEdit); }}
                    onAssignAnimal={handleAssignAnimalInModal}
                    onLogEnclosureHistory={logEnclosureHistory}
                    onUnassignAnimal={handleUnassignAnimalInModal}
                    userProfile={userProfile}
                />
            )}
            {showLocationManager && (
                <LocationManagerModal
                    isOpen={showLocationManager}
                    onClose={() => setShowLocationManager(false)}
                    locations={locations}
                    onSave={handleSaveLocation}
                    onDelete={handleDeleteLocation}
                    saving={locationSaving}
                />
            )}
            <AssignHealthStatusModal
                isOpen={showAssignHealthStatusModal}
                onClose={() => setShowAssignHealthStatusModal(false)}
                animals={activeAnimalsForDashboard}
                onSubmit={handleAssignHealthStatus}
                saving={assigningHealthStatus}
            />
            {showAddMatingForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="flex justify-between items-center border-b p-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Heart size={18} className="text-indigo-500" />Record Planned Mating</h3>
                            <button onClick={() => { setShowAddMatingForm(false); resetMatingForm(); }} className="text-gray-500 hover:text-gray-800"><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmitMating} className="p-4 space-y-4 overflow-y-auto max-h-[75vh]">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Species <span className="text-red-500">*</span></label>
                                <button type="button" onClick={() => setShowMatingSpeciesPicker(true)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left hover:bg-gray-50 transition focus:ring-2 focus:ring-primary focus:border-transparent">
                                    {matingData.species ? <span className="font-medium text-gray-800">{matingData.species}</span> : <span className="text-gray-400">Click to select species...</span>}
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sire (Father) <span className="text-red-500">*</span></label>
                                <button type="button" onClick={() => setModalTarget('sire-mating')} disabled={!matingData.species} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left hover:bg-gray-50 transition focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed">
                                    {matingData.sireId_public ? (<div className="flex items-center justify-between"><div><div className="font-medium">{(allAnimalsRaw.find(a => a.id_public === matingData.sireId_public) || selectedMatingSire)?.name || 'Unknown'}</div><div className="text-xs text-gray-500">{matingData.sireId_public}</div></div></div>) : <span className="text-gray-400">{matingData.species ? 'Select Sire...' : 'Select species first'}</span>}
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dam (Mother) <span className="text-red-500">*</span></label>
                                <button type="button" onClick={() => setModalTarget('dam-mating')} disabled={!matingData.species} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left hover:bg-gray-50 transition focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed">
                                    {matingData.damId_public ? (<div className="flex items-center justify-between"><div><div className="font-medium">{(allAnimalsRaw.find(a => a.id_public === matingData.damId_public) || selectedMatingDam)?.name || 'Unknown'}</div><div className="text-xs text-gray-500">{matingData.damId_public}</div></div></div>) : <span className="text-gray-400">{matingData.species ? 'Select Dam...' : 'Select species first'}</span>}
                                </button>
                            </div>
                            {(matingCalcCOI || matingCOI != null) && (
                                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${matingCalcCOI ? 'bg-gray-50 text-gray-500' : 'bg-gray-50 text-gray-700'}`}>
                                    {matingCalcCOI ? <><span className="inline-block w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" /> Calculating COI...</> : <><span className="font-semibold">Predicted COI:</span> {matingCOI.toFixed(2)}%{matingCOI === 0 && <span className="text-xs ml-1">(unrelated)</span>}</>}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mating Date</label>
                                <DatePicker value={matingData.matingDate} onChange={(e) => setMatingData({...matingData, matingDate: e.target.value})} minDate={new Date()} className="px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Due Date</label>
                                <DatePicker value={matingData.expectedDueDate} onChange={(e) => setMatingData({...matingData, expectedDueDate: e.target.value})} minDate={matingData.matingDate ? new Date(matingData.matingDate) : new Date()} className="px-3 py-2" />
                            </div>
                            <button type="button" onClick={() => setShowMatingBreedingDetails(p => !p)} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                {showMatingBreedingDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                {showMatingBreedingDetails ? 'Hide breeding details' : '+ Breeding details (optional)'}
                            </button>
                            {showMatingBreedingDetails && (
                                <div className="space-y-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Breeding Method</label><select value={matingData.breedingMethod} onChange={(e) => setMatingData({...matingData, breedingMethod: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"><option value="Natural">Natural</option><option value="AI">Artificial Insemination</option><option value="Assisted">Assisted</option><option value="Unknown">Unknown</option></select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Breeding Condition</label><select value={matingData.breedingConditionAtTime} onChange={(e) => setMatingData({...matingData, breedingConditionAtTime: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"><option value="">Select Condition...</option><option value="Good">Good</option><option value="Okay">Okay</option><option value="Poor">Poor</option></select></div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea value={matingData.notes} onChange={(e) => setMatingData({...matingData, notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 text-sm" rows="2" placeholder="Any notes about this mating..." />
                            </div>
                            <div className="flex gap-3 justify-end border-t pt-3">
                                <button type="button" onClick={() => { setShowAddMatingForm(false); resetMatingForm(); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm">Cancel</button>
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg text-sm">Save Mating</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showMatingSpeciesPicker && (
                <SpeciesPickerModal
                    speciesOptions={speciesOptions}
                    onSelect={(speciesName) => {
                        setMatingData(prev => ({...prev, species: speciesName, sireId_public: '', damId_public: ''}));
                        setSelectedMatingSire(null);
                        setSelectedMatingDam(null);
                        setMatingCOI(null);
                        setShowMatingSpeciesPicker(false);
                    }}
                    onClose={() => setShowMatingSpeciesPicker(false)}
                    X={X}
                    Search={Search}
                />
            )}
            {modalTarget === 'sire-mating' && (
                <ParentSearchModal title="Select Sire" onSelect={handleSelectOtherParentForLitter} onClose={() => setModalTarget(null)} authToken={authToken} showModalMessage={showModalMessage} API_BASE_URL={API_BASE_URL} X={X} Search={Search} Loader2={Loader2} LoadingSpinner={LoadingSpinner} requiredGender={['Male', 'Intersex', 'Mixed', 'Unknown']} species={matingData.species || undefined} />
            )}
            {modalTarget === 'dam-mating' && (
                <ParentSearchModal title="Select Dam" onSelect={handleSelectOtherParentForLitter} onClose={() => setModalTarget(null)} authToken={authToken} showModalMessage={showModalMessage} API_BASE_URL={API_BASE_URL} X={X} Search={Search} Loader2={Loader2} LoadingSpinner={LoadingSpinner} requiredGender={['Female', 'Intersex', 'Mixed', 'Unknown']} species={matingData.species || undefined} />
            )}
            </div>
        </>
    );
};

export default AnimalList;