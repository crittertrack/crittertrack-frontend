import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import NotificationBar from '../Notifications/NotificationBar';
import ArchiveScreen from '../ArchiveScreen';
import NotificationPanel from '../Notifications/NotificationPanel';
import FamilyTreeView from '../FamilyTree/FamilyTreeView';
import {
    Activity, AlertCircle, AlertTriangle, Archive, ArrowLeftRight, ArrowDown, ArrowUp, Ban,
    Bean, Bell, Bird, Bug, Calendar, Cat, Check, ChevronDown, ChevronLeft, ChevronRight,
    ChevronUp, MoreVertical, Circle, ClipboardList, Edit, Eye, EyeOff, Fish, Flag, FolderOpen, Heart, HeartOff,
    Home, Hourglass, LayoutGrid, Loader2, LockOpen, MapPin, Mars, MessageSquare, Milk, Pin, Network,    
    Package, Plus, PlusCircle, RefreshCw, Save, Search, ShoppingBag, SlidersHorizontal,
    Sparkles, Trash2, Turtle, Utensils, Venus, VenusAndMars, Wrench, X
} from 'lucide-react';
import { formatDate, formatDateShort, calculateBreedingAge, formatLocalDate } from '../../utils/dateFormatter';
import { getSpeciesLatinName } from '../../utils/speciesUtils';
import { prefetchPedigreeTree } from '../AnimalForm';

const API_BASE_URL = '/api';
const FAMILY_TREE_MIN_WIDTH = 900;

const GENDER_OPTIONS = ['All', 'Male', 'Female', 'Intersex', 'Unknown'];
const STATUS_OPTIONS = ['Pet', 'Growout', 'Breeder', 'Available', 'Booked', 'Sold', 'Retired', 'Deceased', 'Rehomed', 'Unknown'];
const normalizeAnimalView = (value) =>
    ['collections', 'enclosures', 'reproduction', 'health', 'feeding', 'familyTree'].includes(value) ? value : 'list';

const ALERT_CATEGORIES = {
    feeding: 'Feeding Due',
    reproduction: 'Reproduction',
    health: 'Medical / Quarantine',
    maintenance: 'Maintenance'
};

const DEFAULT_LIST_COLUMNS = { animal: true, species: true, variety: true, enclosure: true, lifeStage: true, status: true, health: true, birthdateAge: true, breedingLines: true, tags: true };

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

const normalizeSpeciesForFilter = (species) => (species || '').toLowerCase();

const AnimalImage = ({ src, alt = 'Animal', className = 'w-full h-full object-cover', iconSize = 24 }) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageSrc, setImageSrc] = React.useState(src);
    React.useEffect(() => { setImageSrc(src); setImageError(false); }, [src]);
    if (!imageSrc || imageError) return <Cat size={iconSize} className="text-gray-400" />;
    return <img src={imageSrc} alt={alt} className={className} onError={() => setImageError(true)} loading="lazy" />;
};

const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try { return formatDateShort(dateStr); } catch(e) { return dateStr; }
};

﻿
// -- Decode JWT payload to get a stable per-user key for localStorage scoping --
const getUserKey = (token) => {
    try {
        if (!token) return 'anon';
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.sub || payload.id || payload.userId || 'anon';
    } catch { return 'anon'; }
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
    navigate,
    initialAnimalView = 'list',
    // Archive props
    showArchiveScreen,
    setShowArchiveScreen,
    archivedAnimals,
    setArchivedAnimals,
    soldTransferredAnimals,
    setSoldTransferredAnimals,
    archiveLoading,
    setArchiveLoading,
    // Breeding lines (display-only for cards)
    breedingLineDefs = [],
    animalBreedingLines = {}
}) => {
    // Stable ref so showModalMessage (inline prop) doesn't destabilise useCallbacks
    const showModalMessageRef = useRef(showModalMessage);

    // Per-user localStorage key prefix — scopes all persistent state to the logged-in user
    // so that switching accounts never leaks one user's collections/prefs into another's.
    const userKey = useMemo(() => getUserKey(authToken), [authToken]);
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
    const alertsDropdownRef = useRef(null);
    const [alertSettings, setAlertSettings] = useState(() => Object.keys(ALERT_CATEGORIES).reduce((acc, key) => ({ ...acc, [key]: true }), {}));    
    const [listViewColumns, setListViewColumns] = useState(DEFAULT_LIST_COLUMNS);

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

    const toggleAlertCategory = (key) => {
        setAlertSettings(prev => {
            const next = { ...prev, [key]: !prev[key] };
            try {
                localStorage.setItem(`ct_alert_settings_${userKey}`, JSON.stringify(next));
            } catch {}
            return next;
        });
    };
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
    const [pendingFilters, setPendingFilters] = useState(false); // true when filters changed but not yet applied

    const filterMountedRef = useRef(false); // tracks initial mount for pending-filters detection
    const [ownedFilterMode, setOwnedFilterMode] = useState(() => {
        try {
            return localStorage.getItem('animalList_ownedFilterMode') || 'owned';
        } catch { return 'owned'; }
    });
    // Applied filter snapshot ? groupedAnimals reads from this, only updated on "Apply Filters" click
    const [appliedFilters, setAppliedFilters] = useState(() => ({
        statusFilter: (function() { try { return localStorage.getItem('animalList_statusFilter') || ''; } catch { return ''; } })(),
        genderFilter: (function() { try { return localStorage.getItem('animalList_genderFilter') || ''; } catch { return ''; } })(),
        speciesFilter: (function() { try { return localStorage.getItem('animalList_speciesFilter') || ''; } catch { return ''; } })(),
        statusFilterPregnant: (function() { try { return localStorage.getItem('animalList_statusFilterPregnant') === 'true'; } catch { return false; } })(),
        statusFilterNursing: (function() { try { return localStorage.getItem('animalList_statusFilterNursing') === 'true'; } catch { return false; } })(),
        publicFilter: (function() { try { return localStorage.getItem('animalList_publicFilter') || ''; } catch { return ''; } })(),
        blFilter: (function() { try { const s = localStorage.getItem('animalList_blFilter'); return s ? JSON.parse(s) : []; } catch { return []; } })(),
    }));
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
    const [mgmtAlertsEnabled, setMgmtAlertsEnabled] = useState(() => {
        try { return localStorage.getItem('ct_mgmt_urgency_enabled') !== 'false'; } catch { return true; }
    });
    const toggleMgmtAlerts = () => {
        const next = !mgmtAlertsEnabled;
        setMgmtAlertsEnabled(next);
        try {
            localStorage.setItem('ct_mgmt_urgency_enabled', next ? 'true' : 'false');
            window.dispatchEvent(new StorageEvent('storage', { key: 'ct_mgmt_urgency_enabled' }));
        } catch {}
    };

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
    const [showForSaleScreen, setShowForSaleScreen] = useState(false);
    const [myAnimalsViewMode, setMyAnimalsViewMode] = useState('cards');
    const [showDuplicatesScreen, setShowDuplicatesScreen] = useState(false);
    const [duplicateGroups, setDuplicateGroups] = useState([]);
    const [duplicatesLoading, setDuplicatesLoading] = useState(false);
    const [supplyForm, setSupplyForm] = useState({ name: '', category: 'Other', currentStock: '', unit: '', reorderThreshold: '', notes: '', isFeederAnimal: false, feederType: '', feederSize: '', costPerUnit: '', nextOrderDate: '', orderFrequency: '', orderFrequencyUnit: 'months' });
    const [supplyFormVisible, setSupplyFormVisible] = useState(false);
    const [editingSupplyId, setEditingSupplyId] = useState(null);
    const [supplySaving, setSupplySaving] = useState(false);
    const [supplies, setSupplies] = useState([]);
    const [suppliesLoading, setSuppliesLoading] = useState(false);
    const [supplyCategoryFilter, setSupplyCategoryFilter] = useState('All');
    const [restockingSupplyId, setRestockingSupplyId] = useState(null);
    const [restockForm, setRestockForm] = useState({ qty: '', cost: '', date: new Date().toISOString().slice(0, 10), notes: '' });
    const [restockSaving, setRestockSaving] = useState(false);
    const [openActionMenu, setOpenActionMenu] = useState(null); // For list view action dropdown
    const actionMenuRef = useRef(null);

    // ---- Collections state (user-scoped localStorage + backend sync) ----
    const [userCollections, setUserCollections] = useState([]); // populated from user-scoped key below
    const [animalCollections, setAnimalCollections] = useState({}); // populated from user-scoped key below
    const [showCollectionManager, setShowCollectionManager] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [renamingCollectionId, setRenamingCollectionId] = useState(null);
    const [renamingCollectionName, setRenamingCollectionName] = useState('');
    const [collapsedCollections, setCollapsedCollections] = useState({});
    const [assigningCollectionAnimalId, setAssigningCollectionAnimalId] = useState(null);

    // Close action menu when clicking outside
    const [collectionsViewMode, setCollectionsViewMode] = useState(() => {
        try { return localStorage.getItem(`ct_collections_view_mode_${userKey}`) || 'cards'; } catch { return 'cards'; }
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
                setOpenActionMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [actionMenuRef]);

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
            const vm = localStorage.getItem(`ct_my_animals_view_mode_${userKey}`);
            if (vm) setMyAnimalsViewMode(vm);
            const cvm = localStorage.getItem(`ct_collections_view_mode_${userKey}`);
            if (cvm) setCollectionsViewMode(cvm);
        } catch {}
        // Alert settings
        try {
            const saved = localStorage.getItem(`ct_alert_settings_${userKey}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                const defaults = Object.keys(ALERT_CATEGORIES).reduce((acc, key) => ({ ...acc, [key]: true }), {});
                setAlertSettings({ ...defaults, ...parsed });
            }
        } catch {}
    }, [userKey]);

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
    const [enclosureFormData, setEnclosureFormData] = useState({ name: '', enclosureType: '', size: '', notes: '', cleaningTasks: [], purpose: 'general' });
    const [editingEnclosureId, setEditingEnclosureId] = useState(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (alertsDropdownRef.current && !alertsDropdownRef.current.contains(event.target)) {
                setShowAlertsDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const [enclosureSaving, setEnclosureSaving] = useState(false);
    const [assigningAnimalId, setAssigningAnimalId] = useState(null);
    const [newCleaningTaskName, setNewCleaningTaskName] = useState('');
    const [newCleaningTaskFreq, setNewCleaningTaskFreq] = useState('');
    
    // Fetch archived + sold/transferred animals from API
    const fetchArchiveData = useCallback(async () => {
        setArchiveLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/animals/archived`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setArchivedAnimals(res.data.archived || []);
            setSoldTransferredAnimals(res.data.soldTransferred || []);

            const sold = res.data.soldTransferred || [];
            if (sold.length > 0) {
                // Get unique owner IDs from the sold animals
                const ownerIds = [...new Set(sold.map(a => a.ownerId_public).filter(Boolean))];

                if (ownerIds.length > 0) {
                    // Fetch all owner profiles in parallel for efficiency
                    const profilePromises = ownerIds.map(id =>
                        axios.get(`${API_BASE_URL}/public/profiles/search?query=${id}&limit=1`)
                            .then(res => res.data?.[0])
                            .catch(() => null) // Ignore errors for individual profile fetches
                    );
                    const profiles = (await Promise.all(profilePromises)).filter(Boolean);
                    const profilesMap = new Map(profiles.map(p => [p.id_public, p]));

                    // Enrich the animal objects with owner details for display
                    const enrichedSold = sold.map(animal => {
                        const ownerProfile = profilesMap.get(animal.ownerId_public);
                        if (ownerProfile) {
                            return {
                                ...animal,
                                ownerName: ownerProfile.breederName || ownerProfile.personalName,
                                ownerAvatar: ownerProfile.profileImage,
                                ownerIdPublic: ownerProfile.id_public
                            };
                        }
                        return animal;
                    });
                    setSoldTransferredAnimals(enrichedSold);
                } else {
                    setSoldTransferredAnimals(sold);
                }
            } else {
                setSoldTransferredAnimals([]);
            }
        } catch (err) {
            console.error('Failed to fetch archive data:', err);
            showModalMessageRef.current('Error', err.response?.data?.message || 'Failed to load archive');
        } finally {
            setArchiveLoading(false);
        }
    }, [authToken, API_BASE_URL]);
    
    // Fetch archive data when archive screen is opened
    React.useEffect(() => {
        if (showArchiveScreen) {
            fetchArchiveData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showArchiveScreen]);
    
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
        try { localStorage.setItem('animalList_speciesFilter', speciesFilter); }
        catch (e) { console.warn('Failed to save speciesFilter', e); }
    }, [speciesFilter]);

    useEffect(() => {
        try {
            localStorage.setItem('animalList_blFilter', JSON.stringify(blFilter));
        } catch (e) { console.warn('Failed to save blFilter', e); }
    }, [blFilter]);

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
            setPendingFilters(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authToken]);

    // Apply filters: snapshot current UI filter state into appliedFilters
    const applyFilters = useCallback(() => {
        setAppliedFilters({
            statusFilter, genderFilter, speciesFilter,
            statusFilterPregnant, statusFilterNursing, statusFilterMating,
            publicFilter, blFilter,
        });
        setPendingFilters(false);
      }, [statusFilter, genderFilter, speciesFilter, statusFilterPregnant, statusFilterNursing, statusFilterMating, publicFilter, blFilter]);

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
            // Only keep view-only entries (ownerId !== current user)
            setSoldTransferredRaw((res.data || []).filter(a => a.isViewOnly));
        } catch (err) { console.error('[fetchSoldTransferred]', err); }
    }, [authToken, API_BASE_URL]);

    useEffect(() => {
        // Skip fetch if we have a cache (e.g. returning from edit/view)
        if (_alCache && _alCache.length > 0) {
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
    }, [fetchAnimals]);

    // Removed extensive prefetch logic - with only 4 generations to show, 
    // pedigrees are fetched on-demand when viewing individual animals

    // Refresh animals when other parts of the app signal a change (e.g., after upload/save)
    useEffect(() => {
        const handleAnimalsChanged = () => {
            try { fetchAnimals(); } catch (e) { /* ignore */ }
            try { fetchAllSpecies(); } catch (e) { /* ignore */ }
            try { fetchAllAnimals(); } catch (e) { /* ignore */ }
            try { fetchAvailableAnimals(); } catch (e) { /* ignore */ }
            try { fetchSoldTransferred(); } catch (e) { /* ignore */ }
        };
        window.addEventListener('animals-changed', handleAnimalsChanged);
        return () => window.removeEventListener('animals-changed', handleAnimalsChanged);
    }, [fetchAnimals, fetchAllSpecies, fetchAllAnimals, fetchAvailableAnimals, fetchSoldTransferred]);

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
            if (showArchiveScreen) {
                fetchArchiveData();
            }
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

    const fetchEnclosures = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/enclosures`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setEnclosures(res.data);
        } catch (err) { console.error('[fetchEnclosures]', err); }
    }, [authToken]);
    useEffect(() => { fetchEnclosures(); }, [fetchEnclosures]);

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
        // --- Applied panel filters (only update on "Apply Filters" click) ---
        const af = appliedFilters;

        // Status filter (appliedFilters)
        if (af.statusFilter) {
            source = source.filter(a => a.status === af.statusFilter);
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

        // Species filter (appliedFilters)
         if (af.speciesFilter) {
            source = source.filter(a => a.species === af.speciesFilter);
        }

        // Gender filter (appliedFilters)
        if (af.selectedGenders.length === 0) {
            source = [];
        } else if (af.selectedGenders.length < GENDER_OPTIONS.length) {
            source = source.filter(a => af.selectedGenders.includes(a.gender));
        }

        // Pregnant / Nursing / Mating filters (appliedFilters)
        if (af.statusFilterPregnant || af.statusFilterNursing) {
            source = source.filter(a => (a.gender || '').toLowerCase() !== 'male');
        }
        if (af.statusFilterPregnant) source = source.filter(a => a.isPregnant === true);
        if (af.statusFilterNursing) source = source.filter(a => a.isNursing === true);
        if (af.statusFilterMating) source = source.filter(a => a.isInMating === true);

        // Public/private filter (appliedFilters)
        if (af.publicFilter === 'public') {
            source = source.filter(a => a.showOnPublicProfile === true);
        } else if (af.publicFilter === 'private') {
            source = source.filter(a => !a.showOnPublicProfile);
        }

        // --- Instant filters (no Apply needed, use direct state) ---
        // Ownership filter
        if (ownedFilterMode === 'owned') {
            source = source.filter(a => a.isOwned !== false); // isOwned: true or undefined for owned, false for unowned
        }
        // Breeding line filter
        if (af.blFilter.length > 0) {
            source = source.filter(a => {
                const assigned = animalBreedingLines[a.id_public] || [];
                return af.blFilter.some(lineId => assigned.includes(lineId));
            });
        }
        return source.reduce((groups, animal) => { // ownedFilterMode is a direct dependency now
            const species = animal.species || 'Unspecified Species';
            if (!groups[species]) {
                groups[species] = [];
            }
            groups[species].push(animal);
            return groups;
        }, {});
    }, [animals, appliedFilters, appliedNameFilter, animalBreedingLines, ownedFilterMode]);

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

    // -- Dashboard & Management Data Calculations --
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysSince = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        return Math.floor((today - d) / 86400000);
    };

    const isDue = (lastDate, freqDays) => {
        if (!freqDays) return false;
        if (!lastDate) return true;
        const ds = daysSince(lastDate);
        return ds !== null && ds >= Number(freqDays);
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

    const feedDueDashboard = useMemo(() => {
        return activeAnimalsForDashboard.filter(a => isDue(a.lastFedDate, a.feedingFrequencyDays));
    }, [activeAnimalsForDashboard]);

    const reproEnclosures = enclosures.filter(e => e.purpose === 'reproduction');
    const reproEnclosureIds = new Set(reproEnclosures.map(e => e._id));
    const inReproEnclosure = a => a.enclosureId && reproEnclosureIds.has(a.enclosureId);

    const supplyReorderDue = supplies.filter(s =>
        (s.reorderThreshold != null && s.currentStock <= s.reorderThreshold) ||
        (s.nextOrderDate && new Date(s.nextOrderDate) < today)
    );
    const healthEnclosures = enclosures.filter(e => e.purpose === 'health');
    const healthEnclosureIds = new Set(healthEnclosures.map(e => e._id));
    const inHealthEnclosure = useCallback(a => a.enclosureId && healthEnclosureIds.has(a.enclosureId), [healthEnclosureIds]);

    const quarantineDashboardList = useMemo(() => {
        return activeAnimalsForDashboard.filter(a => a.isQuarantine && !inHealthEnclosure(a));
    }, [activeAnimalsForDashboard, inHealthEnclosure]);

    const treatmentDashboardList = useMemo(() => {
        return activeAnimalsForDashboard.filter(a => a.isInTreatment && !a.isQuarantine && !inHealthEnclosure(a));
    }, [activeAnimalsForDashboard, inHealthEnclosure]);

    const healthAttentionDashboardCount = quarantineDashboardList.length + treatmentDashboardList.length;

    // The original 'allAnimals' variable (used for the main list and management views) remains unchanged.
    const quarantineList = allAnimalsRaw.filter(a => a.isQuarantine && !inHealthEnclosure(a));
    const treatmentList = allAnimalsRaw.filter(a => a.isInTreatment && !a.isQuarantine && !inHealthEnclosure(a));
    const allAnimals = allAnimalsRaw.filter(a => !a.isViewOnly);

    // Other lists that might depend on 'allAnimals' for management views
    const pregnantList = allAnimals.filter(a => a.isPregnant && !a.isInMating && !inReproEnclosure(a));
    const matingList = allAnimals.filter(a => a.isInMating && !inReproEnclosure(a));
    const nursingList = allAnimals.filter(a => a.isNursing && !inReproEnclosure(a));
    const availableList = availableAnimalsRaw.filter(a => a.status === 'Available' && !a.isViewOnly); // This is for the For Sale screen, not dashboard
    const feedDue = allAnimals.filter(a => isDue(a.lastFedDate, a.feedingFrequencyDays)); // This is for the Feeding management view
    const animalsWithAnimalTasks = allAnimals.filter(a => a.animalCareTasks?.length > 0); // For Scheduled Care management view
    const animalCareDue = feedDue.length + animalsWithAnimalTasks.reduce((sum, a) => sum + (a.animalCareTasks || []).filter(t => isDue(t.lastDoneDate, t.frequencyDays)).length, 0);
    const reproTotal = allAnimals.filter(a => (a.isInMating || a.isPregnant || a.isNursing) && !inReproEnclosure(a)).length;
    const feedOk = allAnimals.filter(a => a.feedingFrequencyDays && !isDue(a.lastFedDate, a.feedingFrequencyDays));
    const feedNone = allAnimals.filter(a => !a.feedingFrequencyDays);
    const enclosuresWithCleaningTasks = enclosures.filter(enc => enc.cleaningTasks?.length > 0);
    const animalsWithEnclosureCareTasks = allAnimals.filter(a => (a.careTasks?.length > 0) || (a.maintenanceFrequencyDays));
    const enclosureCarTasksDue = animalsWithEnclosureCareTasks.reduce((sum, a) => sum + (a.careTasks || []).filter(t => isDue(t.lastDoneDate, t.frequencyDays)).length, 0);
    const maintMaintenanceDue = allAnimals.filter(a => a.maintenanceFrequencyDays && isDue(a.lastMaintenanceDate, a.maintenanceFrequencyDays)).length;
    const maintTotalDue = enclosuresWithCleaningTasks.reduce((sum, enc) => sum + enc.cleaningTasks.filter(t => isDue(t.lastDoneDate, t.frequencyDays)).length, 0) + supplyReorderDue.length + enclosureCarTasksDue + maintMaintenanceDue;
    const soldList = soldTransferredRaw.filter(a => a.isViewOnly);
    const generalEnclosures = enclosures.filter(e => !e.purpose || e.purpose === 'general');
    const enclosureAnimalMap = {}; // { enclosureId: [animals] }
    const unassignedAnimals = [];
    allAnimals.forEach(a => {
        if (a.enclosureId) {
            if (!enclosureAnimalMap[a.enclosureId]) enclosureAnimalMap[a.enclosureId] = [];
            enclosureAnimalMap[a.enclosureId].push(a);
        } else {
                unassignedAnimals.push(a);
        }
    });

    // Initialize species filter to "All" on first load only
    // Also add any new species that appear (e.g., after creating a new animal)
    // Keep selectedSpecies in sync with allUserSpecies (the unfiltered master list)
    useEffect(() => {
        if (allUserSpecies.length === 0) return;
        if (selectedSpecies.length === 0) {
            // First load: select everything
            setSelectedSpecies([...allUserSpecies]);
            setAppliedFilters(prev => ({ ...prev, selectedSpecies: [...allUserSpecies] }));
        } else {
            // Add any newly-seen species so they aren't silently hidden
            const newSpecies = allUserSpecies.filter(s => !selectedSpecies.includes(s));
            if (newSpecies.length > 0) {
                setSelectedSpecies(prev => [...prev, ...newSpecies]);
                setAppliedFilters(prev => ({ ...prev, selectedSpecies: [...prev.selectedSpecies, ...newSpecies] }));
            }
        }
    }, [allUserSpecies]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
    const handleSearchInputChange = (e) => setSearchInput(e.target.value);
    const toggleGender = (gender) => {
        setSelectedGenders(prev => 
            prev.includes(gender) 
                ? prev.filter(g => g !== gender) 
                : [...prev, gender]
        );
    };
    const toggleSpecies = (species) => {
        setSelectedSpecies(prev => 
            prev.includes(species)
                ? prev.filter(s => s !== species)
                : [...prev, species]
        );
    };
    const handleFilterPregnant = () => { setStatusFilterPregnant(prev => !prev); setStatusFilterNursing(false); setStatusFilterMating(false); };
    const handleFilterNursing = () => { setStatusFilterNursing(prev => !prev); setStatusFilterPregnant(false); setStatusFilterMating(false); };
    const handleFilterMating = () => { setStatusFilterMating(prev => !prev); setStatusFilterPregnant(false); setStatusFilterNursing(false); };
    
    // Check if any filters are active (different from defaults) ? uses appliedFilters for panel filters
    const hasActiveFilters = (
        appliedFilters.statusFilter !== '' ||
        appliedNameFilter !== '' ||
        searchInput !== '' ||
        appliedFilters.selectedGenders.length !== 4 ||
        (appliedFilters.selectedSpecies.length > 0 && !speciesNames.every(species => appliedFilters.selectedSpecies.includes(species))) ||
        appliedFilters.statusFilterPregnant ||
        appliedFilters.statusFilterNursing ||
        appliedFilters.statusFilterMating ||
        appliedFilters.publicFilter !== '' ||
        appliedFilters.blFilter.length > 0
    );

    // Detect if panel UI state differs from applied snapshot (show pulse on Apply button)
    const panelDirty = (
        statusFilter !== appliedFilters.statusFilter ||
        JSON.stringify(selectedGenders) !== JSON.stringify(appliedFilters.selectedGenders) ||
        JSON.stringify(selectedSpecies) !== JSON.stringify(appliedFilters.selectedSpecies) ||
        statusFilterPregnant !== appliedFilters.statusFilterPregnant ||
        statusFilterNursing !== appliedFilters.statusFilterNursing ||
        statusFilterMating !== appliedFilters.statusFilterMating ||
        publicFilter !== appliedFilters.publicFilter ||
        JSON.stringify(blFilter) !== JSON.stringify(appliedFilters.blFilter)
    );

    const handleClearFilters = () => {
        setStatusFilter('');
        setSearchInput('');
        setAppliedNameFilter('');
        setSelectedGenders(['Male', 'Female', 'Intersex', 'Unknown']);
        setSelectedSpecies([...speciesNames]);
        setStatusFilterPregnant(false);
        setStatusFilterNursing(false);
        setStatusFilterMating(false);
        setOwnedFilterMode('owned'); // Reset to default 'owned'
        setPublicFilter('');
        setBlFilter([]);
        // Also reset the applied snapshot to defaults
        setAppliedFilters({
            statusFilter: '',
            selectedGenders: ['Male', 'Female', 'Intersex', 'Unknown'],
            selectedSpecies: [...speciesNames],
            statusFilterPregnant: false,
            statusFilterNursing: false,
            publicFilter: '',
            blFilter: [],
        });
        setPendingFilters(false);
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
                await axios.post(`${API_BASE_URL}/animals/${id}/archive`, {}, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            }
            showModalMessage('Success', `Successfully archived ${selectedIds.length} animal(s).`);
            setBulkArchiveMode(prev => ({ ...prev, [species]: false }));
            setSelectedAnimals(prev => ({ ...prev, [species]: [] }));
            await fetchAnimals();
            await fetchAllAnimals();
            if (showArchiveScreen) {
                await fetchArchiveData();
            }
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
                        className={`relative bg-white dark:bg-dark-surface rounded-lg sm:rounded-xl shadow-sm w-full max-w-[165px] sm:max-w-[140px] md:max-w-[176px] min-h-44 sm:min-h-48 md:min-h-56 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 pt-2 sm:pt-3 ${
                            isSelected ? 'border-red-500' : animal.isViewOnly ? 'border-gray-400 dark:border-dark-border bg-gray-50 dark:bg-dark-surface-hover' : 'border-gray-300 dark:border-dark-border'
                        }`}
                        className={`relative bg-white dark:bg-dark-surface rounded-lg sm:rounded-xl shadow-sm w-full max-w-[165px] sm:max-w-[140px] md:max-w-[176px] min-h-44 sm:min-h-48 md:min-h-56 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 pt-2 sm:pt-3 ${(() => {
                            if (isSelected) return 'border-red-500';
                            // Only apply darker border for isViewOnly if the animal's status is 'Sold'
                            if (animal.isViewOnly && animal.status === 'Sold') {
                                return 'border-gray-400 dark:border-dark-border bg-gray-50 dark:bg-dark-surface-hover';
                            }
                            return 'border-gray-300 dark:border-dark-border';
                        })()}`}
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
                    {animal.originalOwnerId && !isSelectable && (
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
                    
                    {/* Icon row */}
                    <div className="w-full flex justify-center items-center space-x-1 sm:space-x-2 py-0.5 sm:py-1">
                        {animal.isInMating && <Hourglass className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black" />}
                        {animal.isPregnant && <Bean className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black" />}
                        {animal.isNursing && <Milk className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black" />}
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
                        const activeLines = breedingLineDefs.filter(l => assignedIds.includes(l.id) && l.name);
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
                    duplicates: group.duplicates.filter(d => 
                        !((group.primary.id_public === id1 && d.animal.id_public === id2) ||
                          (group.primary.id_public === id2 && d.animal.id_public === id1))
                    )
                })).filter(group => group.duplicates.length > 0));
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
            
            const keepAnimal = [...duplicateGroups.flatMap(g => [g.primary, ...g.duplicates.map(d => d.animal)])].find(a => a.id_public === keepId);
            const deleteAnimal = [...duplicateGroups.flatMap(g => [g.primary, ...g.duplicates.map(d => d.animal)])].find(a => a.id_public === deleteId);
            
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
                    duplicates: group.duplicates.filter(d => d.animal.id_public !== deleteId)
                })).filter(group => group.duplicates.length > 0));
                // Refresh animal list
                fetchAnimals();
            } catch (err) {
                showModalMessage('Error', err.response?.data?.message || 'Failed to merge animals');
            }
        };

        const formatReasons = (reasons) => {
            return reasons.map(r => {
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
                                {group.duplicates.map((dup, dIdx) => (
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
                archiveLoading={archiveLoading}
                archivedAnimals={archivedAnimals} // This is correct
                soldTransferredAnimals={soldTransferredAnimals} // Use the correct prop
                soldOwnerFilter={soldOwnerFilter}
                setSoldOwnerFilter={setSoldOwnerFilter}
                collapsedMgmtSections={collapsedMgmtSections}
                setCollapsedMgmtSections={setCollapsedMgmtSections}
                navigate={navigate}
                authToken={authToken}
                API_BASE_URL={API_BASE_URL}
                showModalMessage={showModalMessage}
                fetchArchiveData={fetchArchiveData}
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
        const searchTerm = searchInput.trim().toLowerCase();
        const allOwnedAnimals = (allAnimalsRaw.length > 0 ? allAnimalsRaw : animals)
            .filter(a => !a.isViewOnly && !a.archived)
            .filter(a => !searchTerm || [
                a.name, a.prefix, a.suffix, a.id_public, a.breederAssignedId
            ].some(v => v && v.toString().toLowerCase().includes(searchTerm)));
        const enclosureMap = new Map(enclosures.map(e => [e._id, e.name]));
        return (
            <div className="space-y-4">
                {/* Collections Manager Header */}
                <div className="flex items-center gap-2 mb-1">
                    <button
                        onClick={() => setShowCollectionManager(prev => !prev)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition ${
                            showCollectionManager ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-primary hover:bg-primary/90 text-black'
                        }`}
                    >
                        <FolderOpen size={14} />
                        {showCollectionManager ? 'Close Manager' : 'Manage Collections'}
                    </button>
                </div>

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
                                                                const activeLines = breedingLineDefs.filter(l => assignedIds.includes(l.id) && l.name);
                                                                return (
                                                                    <tr key={animal.id_public} className="hover:bg-gray-50 cursor-pointer" onClick={() => onViewAnimal(animal)}>
                                                                        <td className="px-3 py-1.5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden"><AnimalImage src={animal.imageUrl || animal.photoUrl} alt={animal.name} iconSize={20} /></div><div><div className="font-medium text-gray-800 flex items-center gap-1.5 text-sm"><span>{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</span>{animal.gender === 'Male' ? <Mars className="w-3.5 h-3.5 text-primary" /> : animal.gender === 'Female' ? <Venus className="w-3.5 h-3.5 text-accent" /> : animal.gender === 'Intersex' ? <VenusAndMars className="w-3.5 h-3.5 text-purple-500" /> : null}</div><div className="text-xs text-gray-500 font-mono">{animal.id_public}</div></div></div></td>
                                                                        <td className="px-3 py-1.5 text-gray-600"><div>{animal.species || '—'}</div>{getSpeciesLatinName(animal.species) && <div className="text-xs text-gray-400">{getSpeciesLatinName(animal.species)}</div>}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600"><div>{varietyStr}</div>{animal.geneticCode && <div className="text-xs text-gray-400 font-mono">{animal.geneticCode}</div>}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600">{animal.enclosureId ? enclosureMap.get(animal.enclosureId) || 'N/A' : '—'}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600">{animal.lifeStage || '—'}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600 text-xs">{animal.status || '—'}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600 text-xs">{animal.isQuarantine ? <span className="font-medium text-orange-600">Quarantine</span> : animal.isInTreatment ? <span className="font-medium text-red-600">Treatment</span> : animal.status === 'Deceased' ? <span className="text-gray-500">Deceased</span> : <span className="text-green-600">OK</span>}</td>
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
                                                                const activeLines = breedingLineDefs.filter(l => assignedIds.includes(l.id) && l.name);
                                                                return (
                                                                    <tr key={animal.id_public} className="hover:bg-gray-50 cursor-pointer" onClick={() => onViewAnimal(animal)}>
                                                                        <td className="px-3 py-1.5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden"><AnimalImage src={animal.imageUrl || animal.photoUrl} alt={animal.name} iconSize={20} /></div><div><div className="font-medium text-gray-800 flex items-center gap-1.5 text-sm"><span>{[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}</span>{animal.gender === 'Male' ? <Mars className="w-3.5 h-3.5 text-primary" /> : animal.gender === 'Female' ? <Venus className="w-3.5 h-3.5 text-accent" /> : animal.gender === 'Intersex' ? <VenusAndMars className="w-3.5 h-3.5 text-purple-500" /> : null}</div><div className="text-xs text-gray-500 font-mono">{animal.id_public}</div></div></div></td>
                                                                        <td className="px-3 py-1.5 text-gray-600"><div>{animal.species || '—'}</div>{getSpeciesLatinName(animal.species) && <div className="text-xs text-gray-400">{getSpeciesLatinName(animal.species)}</div>}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600"><div>{varietyStr}</div>{animal.geneticCode && <div className="text-xs text-gray-400 font-mono">{animal.geneticCode}</div>}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600">{animal.enclosureId ? enclosureMap.get(animal.enclosureId) || 'N/A' : '—'}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600">{animal.lifeStage || '—'}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600 text-xs">{animal.status || '—'}</td>
                                                                        <td className="px-3 py-1.5 text-gray-600 text-xs">{animal.isQuarantine ? <span className="font-medium text-orange-600">Quarantine</span> : animal.isInTreatment ? <span className="font-medium text-red-600">Treatment</span> : animal.status === 'Deceased' ? <span className="text-gray-500">Deceased</span> : <span className="text-green-600">OK</span>}</td>
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

        // Enclosure CRUD handlers
        const handleSaveEnclosure = async () => {
            if (enclosureSaving || !enclosureFormData.name.trim()) return;
            setEnclosureSaving(true);
            try {
                if (editingEnclosureId) {
                    await axios.put(`${API_BASE_URL}/enclosures/${editingEnclosureId}`, enclosureFormData,
                        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } });
                } else {
                    await axios.post(`${API_BASE_URL}/enclosures`, enclosureFormData,
                        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } });
                }
                setEnclosureFormVisible(false);
                setReproEncFormVisible(false);
                setHealthEncFormVisible(false);
                setEditingEnclosureId(null);
                setEnclosureFormData({ name: '', enclosureType: '', size: '', notes: '', cleaningTasks: [], purpose: 'general' });
                fetchEnclosures();
            } catch (err) {
                showModalMessage('Error', err.response?.data?.message || 'Failed to save enclosure');
            } finally { setEnclosureSaving(false); }
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

        const handleMarkMaintDone = (e, animal) => {
            e.stopPropagation();
            const now = new Date().toISOString();
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, lastMaintenanceDate: now } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, lastMaintenanceDate: now } }));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`,
                { lastMaintenanceDate: now },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Mark maintenance failed:', err); setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, lastMaintenanceDate: animal.lastMaintenanceDate } : a)); });
        };

        const parseArrayField = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            try { return JSON.parse(val); } catch { return [{ name: String(val) }]; }
        };

        const calcNextDose = (med) => {
            if (!med.startDate || !med.intervalValue || !med.intervalUnit) return null;
            const v = Number(med.intervalValue);
            const unitMs = med.intervalUnit === 'hours' ? 3600000
                : med.intervalUnit === 'days' ? 86400000
                : med.intervalUnit === 'weeks' ? 604800000
                : med.intervalUnit === 'months' ? 2592000000 : null;
            if (!unitMs) return null;
            const start = new Date(med.startDate).getTime();
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
            const d = new Date(date); d.setHours(0,0,0,0);
            if (date <= Date.now()) return 'due now';
            if (d.getTime() === today.getTime()) return 'today';
            if (d.getTime() === tomorrow.getTime()) return 'tomorrow';
            return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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

        const handleMarkEnclosureTaskDone = async (e, enc, taskIdx) => {
            e.stopPropagation();
            const updated = [...(enc.cleaningTasks || [])];
            updated[taskIdx] = { ...updated[taskIdx], lastDoneDate: new Date().toISOString() };
            // Optimistic update
            setEnclosures(prev => prev.map(ex => ex._id === enc._id ? { ...ex, cleaningTasks: updated } : ex));
            axios.put(`${API_BASE_URL}/enclosures/${enc._id}`,
                { name: enc.name, enclosureType: enc.enclosureType || '', size: enc.size || '', notes: enc.notes || '', cleaningTasks: updated },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Mark enclosure task done failed:', err); fetchEnclosures(); });
        };

        const handleSkipEnclosureTask = async (e, enc, taskIdx) => {
            e.stopPropagation();
            const updated = [...(enc.cleaningTasks || [])];
            const taskName = updated[taskIdx]?.taskName || 'Cleaning task';
            updated[taskIdx] = { ...updated[taskIdx], lastDoneDate: new Date().toISOString(), lastSkipped: true };
            // Optimistic update
            setEnclosures(prev => prev.map(ex => ex._id === enc._id ? { ...ex, cleaningTasks: updated } : ex));
            axios.put(`${API_BASE_URL}/enclosures/${enc._id}`,
                { name: enc.name, enclosureType: enc.enclosureType || '', size: enc.size || '', notes: enc.notes || '', cleaningTasks: updated },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Skip enclosure task failed:', err); fetchEnclosures(); });
        };

        const handleMarkAnimalCareTaskDone = (e, animal, taskIdx, taskType = 'enclosure') => {
            e.stopPropagation();
            const fieldName = taskType === 'animal' ? 'animalCareTasks' : 'careTasks';
            const updated = [...(animal[fieldName] || [])];
            updated[taskIdx] = { ...updated[taskIdx], lastDoneDate: new Date().toISOString() };
            // Optimistic update
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, [fieldName]: updated } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, [fieldName]: updated } }));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { [fieldName]: updated },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Mark animal care task done failed:', err); fetchAllAnimals(); });
        };

        const handleSkipAnimalCareTask = (e, animal, taskIdx, taskType = 'enclosure') => {
            e.stopPropagation();
            const fieldName = taskType === 'animal' ? 'animalCareTasks' : 'careTasks';
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

        const handleUnquarantine = (e, animal) => {
            e.stopPropagation();
            if (!window.confirm(`Release ${animal.name || 'this animal'} from quarantine?`)) return;
            // Optimistic update
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, isQuarantine: false } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, isQuarantine: false } }));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { isQuarantine: false },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Unquarantine failed:', err); setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, isQuarantine: true } : a)); });
        };

        const handleDischargeTreatment = (e, animal) => {
            e.stopPropagation();
            if (!window.confirm(`Discharge ${animal.name || 'this animal'} from treatment? This will clear all recorded conditions and medications.`)) return;
            const patch = { medicalConditions: null, medications: null, isInTreatment: false };
            const prev = { medicalConditions: animal.medicalConditions, medications: animal.medications, isInTreatment: animal.isInTreatment };
            setAllAnimalsRaw(prevArr => prevArr.map(a => a.id_public === animal.id_public ? { ...a, ...patch } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, ...patch } }));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, patch,
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Discharge failed:', err); setAllAnimalsRaw(prevArr => prevArr.map(a => a.id_public === animal.id_public ? { ...a, ...prev } : a)); });
        };

        const handleReproStatusUpdate = (e, animal, patch) => {
            e.stopPropagation();
            // Optimistic update
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, ...patch } : a));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, ...patch } }));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, patch,
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .catch(err => { console.error('Repro status update failed:', err); setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, ...Object.fromEntries(Object.keys(patch).map(k => [k, animal[k]])) } : a)); });
        };

        return (
            <div className="space-y-3 sm:space-y-4 mt-4">

                {/* -- 1. ENCLOSURES ------------------------------------------ */}
                {(!view || view === 'enclosures') && (<div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Section header ? collapse on click, Add button on right */}
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
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (editingEnclosureId) { setEditingEnclosureId(null); setEnclosureFormVisible(false); }
                                else { setEnclosureFormData({ name: '', enclosureType: '', size: '', notes: '', cleaningTasks: [], purpose: 'general' }); setEnclosureFormVisible(v => !v); }
                            }}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-2 py-1 rounded-lg"
                        >
                            <Plus size={13} /> {enclosureFormVisible && !editingEnclosureId ? 'Cancel' : 'Add'}
                        </button>
                    </div>}
                    {/* Add button shown standalone when on dedicated tab */}
                    {view && <div className="flex justify-end px-3 py-2 border-b bg-blue-50/40">
                        <button
                            onClick={(e) => { e.stopPropagation(); if (editingEnclosureId) { setEditingEnclosureId(null); setEnclosureFormVisible(false); } else { setEnclosureFormData({ name: '', enclosureType: '', size: '', notes: '', cleaningTasks: [], purpose: 'general' }); setEnclosureFormVisible(v => !v); } }}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-2 py-1 rounded-lg"
                        >
                            <Plus size={13} /> {enclosureFormVisible && !editingEnclosureId ? 'Cancel' : 'Add Enclosure'}
                        </button>
                    </div>}

                    {/* Inline create / edit form */}
                    {enclosureFormVisible && (!collapsedMgmtSections['enclosures'] || !!view) && (
                        <div className="p-3 border-b bg-blue-50/40 space-y-2">
                            <div className="text-xs font-semibold text-blue-700 mb-1">{editingEnclosureId ? 'Edit Enclosure' : 'New Enclosure'}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                                    <input type="text" value={enclosureFormData.name}
                                        onChange={e => setEnclosureFormData(p => ({...p, name: e.target.value}))}
                                        placeholder="e.g. Tank 1, Vivarium A, Colony Room 3"
                                        className="block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                                    <input type="text" value={enclosureFormData.enclosureType}
                                        onChange={e => setEnclosureFormData(p => ({...p, enclosureType: e.target.value}))}
                                        placeholder="e.g. Tank, Cage, Vivarium, Pond, Room"
                                        className="block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
                                    <input type="text" value={enclosureFormData.size}
                                        onChange={e => setEnclosureFormData(p => ({...p, size: e.target.value}))}
                                        placeholder="e.g. 40 gallon, 48?24?24, 10 sq ft"
                                        className="block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                                    <input type="text" value={enclosureFormData.notes}
                                        onChange={e => setEnclosureFormData(p => ({...p, notes: e.target.value}))}
                                        placeholder="Optional notes"
                                        className="block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" />
                                </div>
                                {/* Cleaning Tasks */}
                                <div className="col-span-full">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Cleaning Tasks</label>
                                    {(enclosureFormData.cleaningTasks || []).length > 0 && (
                                        <div className="space-y-1 mb-2">
                                            {(enclosureFormData.cleaningTasks || []).map((task, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs bg-white rounded border border-gray-200 px-2 py-1.5">
                                                    <span className="flex-1 font-medium text-gray-700">{task.taskName}</span>
                                                    {task.frequencyDays && <span className="text-gray-400">Every {task.frequencyDays}d</span>}
                                                    <button type="button" onClick={() => setEnclosureFormData(p => ({ ...p, cleaningTasks: (p.cleaningTasks || []).filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600 p-0.5" title="Remove"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <input type="text" value={newCleaningTaskName} onChange={e => setNewCleaningTaskName(e.target.value)}
                                            placeholder="e.g. Spot clean, Full clean, Bulb change"
                                            className="flex-1 p-1.5 text-xs border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" />
                                        <input type="number" value={newCleaningTaskFreq} onChange={e => setNewCleaningTaskFreq(e.target.value)}
                                            placeholder="Days" min="1"
                                            className="w-16 p-1.5 text-xs border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" />
                                        <button type="button" onClick={() => {
                                            if (!newCleaningTaskName.trim()) return;
                                            setEnclosureFormData(p => ({ ...p, cleaningTasks: [...(p.cleaningTasks || []), { taskName: newCleaningTaskName.trim(), frequencyDays: newCleaningTaskFreq ? Number(newCleaningTaskFreq) : null, lastDoneDate: null }] }));
                                            setNewCleaningTaskName(''); setNewCleaningTaskFreq('');
                                        }} className="px-2 py-1.5 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 whitespace-nowrap">+ Add</button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => { setEnclosureFormVisible(false); setEditingEnclosureId(null); }}
                                    className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button onClick={handleSaveEnclosure} disabled={enclosureSaving || !enclosureFormData.name.trim()}
                                    className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50">
                                    {enclosureSaving ? 'Saving...' : (editingEnclosureId ? 'Save Changes' : 'Create Enclosure')}
                                </button>
                            </div>
                        </div>
                    )}

                    {(!collapsedMgmtSections['enclosures'] || !!view) && (
                        <div className="p-3 space-y-2">
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
                                                                setEnclosureFormData({ name: enc.name, enclosureType: enc.enclosureType || '', size: enc.size || '', notes: enc.notes || '', cleaningTasks: enc.cleaningTasks || [], purpose: enc.purpose || 'general' });
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
                </div>)}

                {/* -- 2. FEEDING -------------------------------------------- */}
                {(!view || view === 'feeding') && (<div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <SectionHeader sectionKey="feeding"
                        icon={<Utensils size={18} className="text-green-600" />}
                        title="Feeding" count={animalCareDue > 0 ? `${animalCareDue} due` : animals.length} bgClass="bg-green-50" hideHeader={!!view} />
                    {(!collapsedMgmtSections['feeding'] || !!view) && (
                        <div className="p-3 space-y-4">
                            {!!view && <div className="flex items-center gap-2 pb-2 mb-1 border-b border-green-100">
                                <Utensils size={15} className="text-green-600 flex-shrink-0" />
                                <span className="text-sm font-bold text-green-700 uppercase tracking-wide">Feeding Schedule</span>
                            </div>}
                            {feedDue.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 px-1 pb-2 cursor-pointer" onClick={() => toggleGroup('feed_due')}>
                                        {collapsedMgmtGroups['feed_due'] ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronUp size={12} className="text-gray-400" />}
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Due Today / Overdue ({feedDue.length})</span>
                                    </div>
                                    {!collapsedMgmtGroups['feed_due'] && <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                                        {feedDue.map(a => (
                                            <AnimalCard key={a._id || a.id_public} animal={a} onEditAnimal={onEditAnimal} species={a.species} isSelectable={false} isSelected={false} onToggleSelect={() => {}} onTogglePrivacy={toggleAnimalPrivacy} onToggleOwned={toggleAnimalOwned}
                                                hideControls hideBreedingLines
                                                cardActions={<>
                                                    {a.lastFedDate
                                                        ? <div className="text-[10px] text-gray-400 w-full text-center">Last: {formatDateShort(a.lastFedDate)}</div>
                                                        : <div className="text-[10px] text-orange-500 w-full text-center">Never fed</div>}
                                                    <button onClick={(e) => handleMarkFed(e, a)}
                                                        className="text-[10px] px-1.5 py-0.5 rounded bg-green-500 text-white hover:bg-green-600 w-full flex items-center justify-center gap-0.5">
                                                        🍽 Fed
                                                    </button>
                                                    <button onClick={(e) => handleSkipFeeding(e, a)}
                                                        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200 w-full flex items-center justify-center gap-0.5">
                                                        ⏭ Skip
                                                    </button>
                                                </>}
                                            />
                                        ))}
                                    </div>}
                                </div>
                            )}
                            {feedOk.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 px-1 pb-2 cursor-pointer" onClick={() => toggleGroup('feed_ok')}>
                                        {collapsedMgmtGroups['feed_ok'] ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronUp size={12} className="text-gray-400" />}
                                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Up to Date ({feedOk.length})</span>
                                    </div>
                                    {!collapsedMgmtGroups['feed_ok'] && <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                                        {feedOk.map(a => (
                                            <AnimalCard key={a._id || a.id_public} animal={a} onEditAnimal={onEditAnimal} species={a.species} isSelectable={false} isSelected={false} onToggleSelect={() => {}} onTogglePrivacy={toggleAnimalPrivacy} onToggleOwned={toggleAnimalOwned}
                                                hideControls hideBreedingLines
                                                cardActions={<>
                                                    {a.lastFedDate && <div className="text-[10px] text-gray-400 w-full text-center">Last: {formatDateShort(a.lastFedDate)}</div>}
                                                    {a.feedingFrequencyDays && <div className="text-[10px] text-gray-400 w-full text-center">Every {a.feedingFrequencyDays}d</div>}
                                                    <button onClick={(e) => handleMarkFed(e, a)}
                                                        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 border border-gray-200 w-full flex items-center justify-center gap-0.5">
                                                        🍽 Fed
                                                    </button>
                                                </>}
                                            />
                                        ))}
                                    </div>}
                                </div>
                            )}
                            {feedNone.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 px-1 pb-2 cursor-pointer" onClick={() => toggleGroup('feed_none')}>
                                        {collapsedMgmtGroups['feed_none'] ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronUp size={12} className="text-gray-400" />}
                                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">No Schedule Set ({feedNone.length})</span>
                                    </div>
                                    {!collapsedMgmtGroups['feed_none'] && <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                                        {feedNone.map(a => (
                                            <AnimalCard key={a._id || a.id_public} animal={a} onEditAnimal={onEditAnimal} species={a.species} isSelectable={false} isSelected={false} onToggleSelect={() => {}} onTogglePrivacy={toggleAnimalPrivacy} onToggleOwned={toggleAnimalOwned}
                                                hideControls hideBreedingLines
                                                cardActions={a.dietType
                                                    ? <div className="text-[10px] text-gray-400 w-full text-center truncate">{a.dietType}</div>
                                                    : undefined}
                                            />
                                        ))}
                                    </div>}
                                </div>
                            )}
                            {feedDue.length === 0 && feedOk.length === 0 && feedNone.length === 0 && (
                                <div className="text-sm text-gray-400 text-center py-4">No animals with a feeding schedule.</div>
                            )}
                        </div>
                    )}
                </div>)}

                {/* -- 3. REPRODUCTION ---------------------------------------- */}
                {(!view || view === 'reproduction') && (<div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <SectionHeader sectionKey="reproduction"
                        icon={<Bean size={18} className="text-pink-600" />}
                        title="Reproduction" count={reproTotal} bgClass="bg-pink-50" hideHeader={!!view} />
                    {(!collapsedMgmtSections['reproduction'] || !!view) && (
                        <div className="p-3 space-y-4">
                            {/* Enclosures sub-panel */}
                            <div className="border border-blue-200 rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between px-3 py-2 bg-blue-50/60">
                                    <div className="flex items-center gap-2">
                                        <Home size={13} className="text-blue-600" />
                                        <span className="text-xs font-semibold text-gray-700">Enclosures</span>
                                        <span className="text-xs text-gray-500 bg-white/70 px-1.5 py-0.5 rounded-full">{reproEnclosures.length}</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); if (editingEnclosureId) { setEditingEnclosureId(null); setReproEncFormVisible(false); } else { setEnclosureFormData({ name: '', enclosureType: '', size: '', notes: '', cleaningTasks: [], purpose: 'reproduction' }); setReproEncFormVisible(v => !v); } }} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-2 py-1 rounded-lg">
                                        <Plus size={11} /> {reproEncFormVisible && !editingEnclosureId ? 'Cancel' : 'Add'}
                                    </button>
                                </div>
                                {reproEncFormVisible && (
                                    <div className="p-3 border-b bg-blue-50/40 space-y-2">
                                        <div className="text-xs font-semibold text-blue-700 mb-1">{editingEnclosureId ? 'Edit Enclosure' : 'New Enclosure'}</div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div><label className="block text-xs font-medium text-gray-600 mb-1">Name *</label><input type="text" value={enclosureFormData.name} onChange={e => setEnclosureFormData(p => ({...p, name: e.target.value}))} placeholder="e.g. Breeding Pair Tank A" className="block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" /></div>
                                            <div><label className="block text-xs font-medium text-gray-600 mb-1">Type</label><input type="text" value={enclosureFormData.enclosureType} onChange={e => setEnclosureFormData(p => ({...p, enclosureType: e.target.value}))} placeholder="e.g. Tank, Cage, Vivarium" className="block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" /></div>
                                            <div><label className="block text-xs font-medium text-gray-600 mb-1">Size</label><input type="text" value={enclosureFormData.size} onChange={e => setEnclosureFormData(p => ({...p, size: e.target.value}))} placeholder="e.g. 40 gallon" className="block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" /></div>
                                            <div><label className="block text-xs font-medium text-gray-600 mb-1">Notes</label><input type="text" value={enclosureFormData.notes} onChange={e => setEnclosureFormData(p => ({...p, notes: e.target.value}))} placeholder="Optional notes" className="block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" /></div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setReproEncFormVisible(false); setEditingEnclosureId(null); }} className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                                            <button onClick={handleSaveEnclosure} disabled={enclosureSaving || !enclosureFormData.name.trim()} className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50">{enclosureSaving ? 'Saving...' : (editingEnclosureId ? 'Save Changes' : 'Create Enclosure')}</button>
                                        </div>
                                    </div>
                                )}
                                <div className="p-2 space-y-2">
                                    {reproEnclosures.length === 0
                                        ? <div className="text-xs text-gray-400 text-center py-2">No enclosures yet. Click Add to create one.</div>
                                        : reproEnclosures.map(enc => {
                                            const occupants = enclosureAnimalMap[enc._id] || [];
                                            const isGrpCollapsed = collapsedMgmtGroups[`enc_${enc._id}`] || false;
                                            return (
                                                <div key={enc._id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="relative flex items-center bg-blue-50/60 px-3 py-2 cursor-pointer" onClick={() => toggleGroup(`enc_${enc._id}`)}>
                                                        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                                                            {isGrpCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronUp className="w-3.5 h-3.5 text-gray-400" />}
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <span className="font-semibold text-sm text-gray-800 truncate">{enc.name}</span>
                                                            {enc.enclosureType && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0 hidden sm:inline">{enc.enclosureType}</span>}
                                                            {enc.size && <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline shrink-0">{enc.size}</span>}
                                                            <span className="text-xs text-gray-500 bg-white/70 px-1.5 py-0.5 rounded-full shrink-0">{occupants.length}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 ml-2 shrink-0" onClick={e => e.stopPropagation()}>
                                                            <button onClick={() => { setEnclosureFormData({ name: enc.name, enclosureType: enc.enclosureType || '', size: enc.size || '', notes: enc.notes || '', cleaningTasks: enc.cleaningTasks || [], purpose: enc.purpose || 'reproduction' }); setEditingEnclosureId(enc._id); setReproEncFormVisible(true); }} className="p-1 text-gray-400 hover:text-blue-600 rounded" title="Edit"><Edit size={13} /></button>
                                                            <button onClick={() => handleDeleteEnclosure(enc._id)} className="p-1 text-gray-400 hover:text-red-500 rounded" title="Delete"><Trash2 size={13} /></button>
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
                                                                                cardActions={<>
                                                                                    {/* State badge */}
                                                                                    {(a.isInMating || a.isPregnant || a.isNursing) && (
                                                                                        <div className={`text-[10px] text-center font-semibold px-1.5 py-0.5 rounded w-full ${a.isNursing ? 'bg-blue-100 text-blue-700' : a.isPregnant ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'}`}>
                                                                                            {a.isNursing ? 'Nursing' : a.isPregnant ? 'Pregnant' : 'Mating'}
                                                                                        </div>
                                                                                    )}
                                                                                    {/* Advance state */}
                                                                                    {a.isInMating && !a.isPregnant && !a.isNursing && a.gender !== 'Male' && (
                                                                                        <button onClick={(e) => handleReproStatusUpdate(e, a, { isInMating: false, isPregnant: true })}
                                                                                            className="text-[10px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200 w-full flex items-center justify-center gap-0.5"><Bean size={9} /> Set as Pregnant</button>
                                                                                    )}
                                                                                    {a.isInMating && !a.isPregnant && !a.isNursing && a.gender === 'Male' && (
                                                                                        <button onClick={(e) => handleReproStatusUpdate(e, a, { isInMating: false })}
                                                                                            className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200 w-full">Clear</button>
                                                                                    )}
                                                                                    {a.isPregnant && !a.isNursing && (
                                                                                        <button onClick={(e) => handleReproStatusUpdate(e, a, { isPregnant: false, isNursing: true })}
                                                                                            className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 w-full flex items-center justify-center gap-0.5"><Milk size={9} /> Set to Nursing</button>
                                                                                    )}
                                                                                    {a.isNursing && (
                                                                                        <button onClick={(e) => handleReproStatusUpdate(e, a, { isNursing: false })}
                                                                                            className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200 w-full">Clear</button>
                                                                                    )}
                                                                                    <button onClick={(e) => { e.stopPropagation(); handleAssignAnimalToEnclosure(a.id_public, ''); }}
                                                                                        className="text-[10px] text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded px-1.5 py-0.5 w-full">Remove from enclosure</button>
                                                                                </>}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                            {(() => {
                                const unassignedReproAnimals = [...matingList, ...pregnantList, ...nursingList];
                                return unassignedReproAnimals.length === 0 ? null : (
                                    <div>
                                        <div className="flex items-center gap-2 px-1 pb-2 cursor-pointer" onClick={() => toggleGroup('repro_unassigned')}>
                                            {collapsedMgmtGroups['repro_unassigned'] ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronUp size={12} className="text-gray-400" />}
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Unassigned ({unassignedReproAnimals.length})</span>
                                        </div>
                                        {!collapsedMgmtGroups['repro_unassigned'] && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                                                {unassignedReproAnimals.map(a => (
                                                    <AnimalCard key={a._id || a.id_public} animal={a} onEditAnimal={onEditAnimal} species={a.species} isSelectable={false} isSelected={false} onToggleSelect={() => {}} onTogglePrivacy={toggleAnimalPrivacy} onToggleOwned={toggleAnimalOwned}
                                                        hideControls hideBreedingLines
                                                        cardActions={<>
                                                            {/* State badge */}
                                                            <div className={`text-[10px] text-center font-semibold px-1.5 py-0.5 rounded w-full ${a.isNursing ? 'bg-blue-100 text-blue-700' : a.isPregnant ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'}`}>
                                                                {a.isNursing ? 'Nursing' : a.isPregnant ? 'Pregnant' : 'Mating'}
                                                            </div>
                                                            {/* Advance state */}
                                                            {a.isInMating && !a.isPregnant && !a.isNursing && a.gender !== 'Male' && (
                                                                <button onClick={(e) => handleReproStatusUpdate(e, a, { isInMating: false, isPregnant: true })}
                                                                    className="text-[10px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200 w-full flex items-center justify-center gap-0.5"><Bean size={9} /> Set as Pregnant</button>
                                                            )}
                                                            {a.isInMating && !a.isPregnant && !a.isNursing && a.gender === 'Male' && (
                                                                <button onClick={(e) => handleReproStatusUpdate(e, a, { isInMating: false })}
                                                                    className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200 w-full">Clear</button>
                                                            )}
                                                            {a.isPregnant && !a.isNursing && (
                                                                <button onClick={(e) => handleReproStatusUpdate(e, a, { isPregnant: false, isNursing: true })}
                                                                    className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 w-full flex items-center justify-center gap-0.5"><Milk size={9} /> Set to Nursing</button>
                                                            )}
                                                            {a.isNursing && (
                                                                <button onClick={(e) => handleReproStatusUpdate(e, a, { isNursing: false })}
                                                                    className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200 w-full">Clear</button>
                                                            )}
                                                            {assigningAnimalId === a.id_public
                                                                ? <select autoFocus defaultValue="" onChange={e => { if (e.target.value) handleAssignAnimalToEnclosure(a.id_public, e.target.value); setAssigningAnimalId(null); }} onBlur={() => setAssigningAnimalId(null)} className="text-[10px] border border-blue-300 rounded p-1 w-full">
                                                                    <option value="" disabled>{reproEnclosures.length === 0 ? 'No enclosures yet' : 'Select enclosure...'}</option>
                                                                    {reproEnclosures.map(enc => <option key={enc._id} value={enc._id}>{enc.name}</option>)}
                                                                  </select>
                                                                : <button onClick={(e) => { e.stopPropagation(); setAssigningAnimalId(a.id_public); }} className="text-[10px] text-blue-500 hover:text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 w-full">Assign enclosure</button>
                                                            }
                                                        </>}
                                                    />
                                                ))}
                                            </div>
                                        )}
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
                                <div className="flex items-center justify-between px-3 py-2 bg-orange-50/60">
                                    <div className="flex items-center gap-2">
                                        <Home size={13} className="text-orange-600" />
                                        <span className="text-xs font-semibold text-gray-700">Enclosures</span>
                                        <span className="text-xs text-gray-500 bg-white/70 px-1.5 py-0.5 rounded-full">{healthEnclosures.length}</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); if (editingEnclosureId) { setEditingEnclosureId(null); setHealthEncFormVisible(false); } else { setEnclosureFormData({ name: '', enclosureType: '', size: '', notes: '', cleaningTasks: [], purpose: 'health' }); setHealthEncFormVisible(v => !v); } }} className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-800 bg-white border border-orange-200 px-2 py-1 rounded-lg">
                                        <Plus size={11} /> {healthEncFormVisible && !editingEnclosureId ? 'Cancel' : 'Add'}
                                    </button>
                                </div>
                                {healthEncFormVisible && (
                                    <div className="p-3 border-b bg-orange-50/40 space-y-2">
                                        <div className="text-xs font-semibold text-orange-700 mb-1">{editingEnclosureId ? 'Edit Enclosure' : 'New Enclosure'}</div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div><label className="block text-xs font-medium text-gray-600 mb-1">Name *</label><input type="text" value={enclosureFormData.name} onChange={e => setEnclosureFormData(p => ({...p, name: e.target.value}))} placeholder="e.g. Quarantine Tank 1" className="block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-orange-400 focus:border-orange-400" /></div>
                                            <div><label className="block text-xs font-medium text-gray-600 mb-1">Type</label><input type="text" value={enclosureFormData.enclosureType} onChange={e => setEnclosureFormData(p => ({...p, enclosureType: e.target.value}))} placeholder="e.g. Tank, Cage, Vivarium" className="block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-orange-400 focus:border-orange-400" /></div>
                                            <div><label className="block text-xs font-medium text-gray-600 mb-1">Size</label><input type="text" value={enclosureFormData.size} onChange={e => setEnclosureFormData(p => ({...p, size: e.target.value}))} placeholder="e.g. 40 gallon" className="block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-orange-400 focus:border-orange-400" /></div>
                                            <div><label className="block text-xs font-medium text-gray-600 mb-1">Notes</label><input type="text" value={enclosureFormData.notes} onChange={e => setEnclosureFormData(p => ({...p, notes: e.target.value}))} placeholder="Optional notes" className="block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-orange-400 focus:border-orange-400" /></div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setHealthEncFormVisible(false); setEditingEnclosureId(null); }} className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                                            <button onClick={handleSaveEnclosure} disabled={enclosureSaving || !enclosureFormData.name.trim()} className="text-xs px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50">{enclosureSaving ? 'Saving...' : (editingEnclosureId ? 'Save Changes' : 'Create Enclosure')}</button>
                                        </div>
                                    </div>
                                )}
                                <div className="p-2 space-y-2">
                                    {healthEnclosures.length === 0
                                        ? <div className="text-xs text-gray-400 text-center py-2">No enclosures yet. Click Add to create one.</div>
                                        : healthEnclosures.map(enc => {
                                            const occupants = (enclosureAnimalMap[enc._id] || []).filter(a => {
                                                const isTreatment = a.isInTreatment && !a.isQuarantine;
                                                return a.isQuarantine || isTreatment;
                                            });
                                            const isGrpCollapsed = collapsedMgmtGroups[`enc_${enc._id}`] || false;
                                            return (
                                                <div key={enc._id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="relative flex items-center bg-orange-50/60 px-3 py-2 cursor-pointer" onClick={() => toggleGroup(`enc_${enc._id}`)}>
                                                        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                                                            {isGrpCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronUp className="w-3.5 h-3.5 text-gray-400" />}
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <span className="font-semibold text-sm text-gray-800 truncate">{enc.name}</span>
                                                            {enc.enclosureType && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0 hidden sm:inline">{enc.enclosureType}</span>}
                                                            {enc.size && <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline shrink-0">{enc.size}</span>}
                                                            <span className="text-xs text-gray-500 bg-white/70 px-1.5 py-0.5 rounded-full shrink-0">{occupants.length}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 ml-2 shrink-0" onClick={e => e.stopPropagation()}>
                                                            <button onClick={() => { setEnclosureFormData({ name: enc.name, enclosureType: enc.enclosureType || '', size: enc.size || '', notes: enc.notes || '', cleaningTasks: enc.cleaningTasks || [], purpose: enc.purpose || 'health' }); setEditingEnclosureId(enc._id); setHealthEncFormVisible(true); }} className="p-1 text-gray-400 hover:text-orange-600 rounded" title="Edit"><Edit size={13} /></button>
                                                            <button onClick={() => handleDeleteEnclosure(enc._id)} className="p-1 text-gray-400 hover:text-red-500 rounded" title="Delete"><Trash2 size={13} /></button>
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
                                                                        {occupants.map(a => {
                                                                            const conds = parseArrayField(a.medicalConditions);
                                                                            const meds = parseArrayField(a.medications);
                                                                            const isTreatment = a.isInTreatment && !a.isQuarantine;
                                                                            const hasHealthState = a.isQuarantine || isTreatment;
                                                                            return (
                                                                                <AnimalCard key={a._id || a.id_public} animal={a} onEditAnimal={onEditAnimal} species={a.species} isSelectable={false} isSelected={false} onToggleSelect={() => {}} onTogglePrivacy={toggleAnimalPrivacy} onToggleOwned={toggleAnimalOwned}
                                                                                    hideControls hideBreedingLines
                                                                                    cardActions={<>
                                                                                        {/* State badge */}
                                                                                        {hasHealthState ? (
                                                                                            <div className={`text-[10px] text-center font-semibold px-1.5 py-0.5 rounded w-full ${isTreatment ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                                                                {isTreatment ? 'Treatment' : 'Quarantine'}
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="text-[10px] text-center font-semibold px-1.5 py-0.5 rounded w-full bg-gray-100 text-gray-500">
                                                                                                No health status
                                                                                            </div>
                                                                                        )}
                                                                                        {isTreatment && conds.length > 0 && <div className="text-[10px] text-gray-500 truncate w-full text-center">{conds.map(c => c.name || c).join(', ')}</div>}
                                                                                        {isTreatment && meds.length > 0 && meds.slice(0, 2).map((m, i) => {
                                                                                            const next = calcNextDose(m);
                                                                                            const nextLabel = next ? formatNextDose(next) : null;
                                                                                            const intervalLabel = m.intervalValue ? `every ${m.intervalValue}${m.intervalUnit === 'hours' ? 'h' : m.intervalUnit === 'days' ? 'd' : m.intervalUnit === 'weeks' ? 'w' : 'mo'}` : null;
                                                                                            return (
                                                                                                <div key={i} className="text-[10px] text-blue-600 w-full text-center leading-tight">
                                                                                                    <span className="font-medium truncate block">{m.name || m}</span>
                                                                                                    <span className="text-blue-400">{[m.dose, intervalLabel].filter(Boolean).join(' · ')}{nextLabel ? <span className="text-orange-400 ml-1">· {nextLabel}</span> : null}</span>
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                        {a.isQuarantine
                                                                                            ? <button onClick={(e) => handleUnquarantine(e, a)} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500 text-white hover:bg-green-600 w-full flex items-center justify-center gap-0.5"><LockOpen size={9} /> Release</button>
                                                                                            : isTreatment && <button onClick={(e) => handleDischargeTreatment(e, a)} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500 text-white hover:bg-green-600 w-full flex items-center justify-center gap-0.5"><LockOpen size={9} /> Discharge</button>
                                                                                        }
                                                                                        <button onClick={(e) => { e.stopPropagation(); handleAssignAnimalToEnclosure(a.id_public, ''); }}
                                                                                            className="text-[10px] text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded px-1.5 py-0.5 w-full">Remove from enclosure</button>
                                                                                    </>}
                                                                                />
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                            {(() => {
                                const unassignedHealthAnimals = [...quarantineList, ...treatmentList];
                                return unassignedHealthAnimals.length === 0 ? null : (
                                    <div>
                                        <div className="flex items-center gap-2 px-1 pb-2 cursor-pointer" onClick={() => toggleGroup('health_unassigned')}>
                                            {collapsedMgmtGroups['health_unassigned'] ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronUp size={12} className="text-gray-400" />}
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Unassigned ({unassignedHealthAnimals.length})</span>
                                        </div>
                                        {!collapsedMgmtGroups['health_unassigned'] && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                                                {unassignedHealthAnimals.map(a => {
                                                    const conds = parseArrayField(a.medicalConditions);
                                                    const meds = parseArrayField(a.medications);
                                                    const isTreatment = a.isInTreatment && !a.isQuarantine;
                                                    const hasHealthState = a.isQuarantine || isTreatment;
                                                    return (
                                                        <AnimalCard key={a._id || a.id_public} animal={a} onEditAnimal={onEditAnimal} species={a.species} isSelectable={false} isSelected={false} onToggleSelect={() => {}} onTogglePrivacy={toggleAnimalPrivacy} onToggleOwned={toggleAnimalOwned}
                                                            hideControls hideBreedingLines
                                                            cardActions={<>
                                                                {hasHealthState ? (
                                                                    <div className={`text-[10px] text-center font-semibold px-1.5 py-0.5 rounded w-full ${isTreatment ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                                        {isTreatment ? 'Treatment' : 'Quarantine'}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-[10px] text-center font-semibold px-1.5 py-0.5 rounded w-full bg-gray-100 text-gray-500">
                                                                        No health status
                                                                    </div>
                                                                )}
                                                                {isTreatment && conds.length > 0 && <div className="text-[10px] text-gray-500 truncate w-full text-center">{conds.map(c => c.name || c).join(', ')}</div>}
                                                                {isTreatment && meds.length > 0 && meds.slice(0, 2).map((m, i) => {
                                                                    const next = calcNextDose(m);
                                                                    const nextLabel = next ? formatNextDose(next) : null;
                                                                    const intervalLabel = m.intervalValue ? `every ${m.intervalValue}${m.intervalUnit === 'hours' ? 'h' : m.intervalUnit === 'days' ? 'd' : m.intervalUnit === 'weeks' ? 'w' : 'mo'}` : null;
                                                                    return (
                                                                        <div key={i} className="text-[10px] text-blue-600 w-full text-center leading-tight">
                                                                            <span className="font-medium truncate block">{m.name || m}</span>
                                                                            <span className="text-blue-400">{[m.dose, intervalLabel].filter(Boolean).join(' · ')}{nextLabel ? <span className="text-orange-400 ml-1">· {nextLabel}</span> : null}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                                {a.isQuarantine
                                                                    ? <button onClick={(e) => handleUnquarantine(e, a)} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500 text-white hover:bg-green-600 w-full flex items-center justify-center gap-0.5"><LockOpen size={9} /> Release</button>
                                                                    : isTreatment && <button onClick={(e) => handleDischargeTreatment(e, a)} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500 text-white hover:bg-green-600 w-full flex items-center justify-center gap-0.5"><LockOpen size={9} /> Discharge</button>
                                                                }
                                                                {assigningAnimalId === a.id_public
                                                                    ? <select autoFocus defaultValue="" onChange={e => { if (e.target.value) handleAssignAnimalToEnclosure(a.id_public, e.target.value); setAssigningAnimalId(null); }} onBlur={() => setAssigningAnimalId(null)} className="text-[10px] border border-orange-300 rounded p-1 w-full">
                                                                        <option value="" disabled>{healthEnclosures.length === 0 ? 'No enclosures yet' : 'Select enclosure...'}</option>
                                                                        {healthEnclosures.map(enc => <option key={enc._id} value={enc._id}>{enc.name}</option>)}
                                                                      </select>
                                                                    : <button onClick={(e) => { e.stopPropagation(); setAssigningAnimalId(a.id_public); }} className="text-[10px] text-orange-500 hover:text-orange-700 border border-orange-200 rounded px-1.5 py-0.5 w-full">Assign enclosure</button>
                                                                }
                                                            </>}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        )}
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

                {/* -- 6. SCHEDULED CARE ------------------------------------- */}
                {(!view || view === 'feeding') && (<div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <SectionHeader sectionKey="scheduledcare"
                        icon={<ClipboardList size={18} className="text-teal-600" />}
                        title="Scheduled Care" count={animalsWithAnimalTasks.reduce((s, a) => s + (a.animalCareTasks || []).filter(t => isDue(t.lastDoneDate, t.frequencyDays)).length, 0) > 0 ? `${animalsWithAnimalTasks.reduce((s, a) => s + (a.animalCareTasks || []).filter(t => isDue(t.lastDoneDate, t.frequencyDays)).length, 0)} due` : animalsWithAnimalTasks.length} bgClass="bg-teal-50" hideHeader={!!view} />
                    {(!collapsedMgmtSections['scheduledcare'] || !!view) && (
                        <div className="divide-y divide-gray-100">
                            {!!view && <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border-b border-teal-100">
                                <ClipboardList size={15} className="text-teal-600 flex-shrink-0" />
                                <span className="text-sm font-bold text-teal-700 uppercase tracking-wide">Scheduled Animal Care</span>
                            </div>}
                            {animalsWithAnimalTasks.length === 0 ? (
                                <div className="px-3 py-4 text-xs text-gray-400 text-center">No animal care tasks. Edit an animal and add tasks in the Care tab.</div>
                            ) : animalsWithAnimalTasks.map(a => {
                                const grpKey = `animalcare_${a.id_public}`;
                                const isGrpCollapsed = collapsedMgmtGroups[grpKey] || false;
                                const tasks = (a.animalCareTasks || []);
                                const dueTasks = tasks.filter(t => isDue(t.lastDoneDate, t.frequencyDays));
                                return (
                                    <div key={a.id_public} className="border-b border-gray-100 last:border-0">
                                        <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50" onClick={() => toggleGroup(grpKey)}>
                                            <div className="flex items-center gap-2 min-w-0">
                                                {isGrpCollapsed ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronUp size={14} className="text-gray-400" />}
                                                {a.imageUrl
                                                    ? <img src={a.imageUrl} alt={a.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                                                    : <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><Cat size={11} className="text-gray-400" /></div>}
                                                <span className="text-sm font-medium text-gray-800 truncate">{[a.prefix, a.name || 'Unnamed', a.suffix].filter(Boolean).join(' ')}</span>
                                                <span className="text-xs text-gray-400 hidden sm:block">{getSpeciesDisplayName(a.species)}</span>
                                            </div>
                                            {dueTasks.length > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium shrink-0">{dueTasks.length} due</span>}
                                        </div>
                                        {!isGrpCollapsed && (
                                            <div className="px-4 py-2 space-y-1">
                                                {tasks.map((task, idx) => {
                                                    const due = isDue(task.lastDoneDate, task.frequencyDays);
                                                    const daysAgo = task.lastDoneDate ? daysSince(task.lastDoneDate) : null;
                                                    const daysLeft = task.frequencyDays && daysAgo !== null ? task.frequencyDays - daysAgo : null;
                                                    const soon = !due && daysLeft !== null && daysLeft <= 2;
                                                    return (
                                                        <div key={idx} className="flex flex-col gap-1 text-sm py-1 border-b border-gray-50 last:border-0" onClick={e => e.stopPropagation()}>
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${due ? 'bg-red-500' : soon ? 'bg-orange-400' : task.frequencyDays ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                                <span className="text-gray-700 font-medium truncate">{task.taskName}</span>
                                                            </div>
                                                            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 pl-4 text-xs text-gray-400">
                                                                {task.frequencyDays && <span className="flex items-center gap-0.5"><RefreshCw size={11} /> Every {task.frequencyDays}d</span>}
                                                                {task.lastDoneDate
                                                                    ? <span className="flex items-center gap-0.5 text-green-600"><Check size={10} /> Last: {formatDateShort(task.lastDoneDate)}</span>
                                                                    : <span className="flex items-center gap-0.5 text-orange-500"><X size={10} /> Never done</span>}
                                                                <button onClick={(e) => handleMarkAnimalCareTaskDone(e, a, idx, 'animal')}
                                                                    className={`text-xs px-2 py-0.5 rounded font-medium border flex items-center gap-0.5 ${due ? 'bg-amber-500 text-white hover:bg-amber-600 border-amber-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'}`}>
                                                                    <Check size={10} /> Done
                                                                </button>
                                                                <button onClick={(e) => handleSkipAnimalCareTask(e, a, idx, 'animal')}
                                                                    className="text-xs px-2 py-0.5 rounded font-medium border bg-gray-100 text-gray-400 hover:bg-gray-200 border-gray-200 flex items-center gap-0.5">
                                                                    <ChevronRight size={10} /> Skip
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>)}

                {/* -- 7. MAINTENANCE ----------------------------------------- */}
                {(!view || view === 'feeding') && (<div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <SectionHeader sectionKey="maintenance"
                        icon={<Wrench size={18} className="text-amber-600" />}
                        title="Maintenance" count={`${maintTotalDue} due`} bgClass="bg-amber-50" hideHeader={!!view} />
                    {(!collapsedMgmtSections['maintenance'] || !!view) && (
                        <div className="divide-y divide-gray-100">
                            {!!view && <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-b border-amber-100">
                                <Wrench size={15} className="text-amber-600 flex-shrink-0" />
                                <span className="text-sm font-bold text-amber-700 uppercase tracking-wide">Maintenance</span>
                            </div>}
                            {/* -- Housing Maintenance (animal enclosure care tasks + maintenance schedule) -- */}
                            <div>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wide flex items-center gap-2 cursor-pointer" onClick={() => toggleGroup('maint_housing')}>
                                    {collapsedMgmtGroups['maint_housing'] ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronUp size={12} className="text-gray-400" />}
                                    Housing Maintenance
                                </div>
                                {!collapsedMgmtGroups['maint_housing'] && (animalsWithEnclosureCareTasks.length === 0 ? (
                                    <div className="px-3 py-4 text-xs text-gray-400 text-center">No housing maintenance tasks. Edit an animal and add tasks in the Care tab.</div>
                                ) : animalsWithEnclosureCareTasks.map(a => {
                                    const grpKey = `housingmaint_${a.id_public}`;
                                    const isGrpCollapsed = collapsedMgmtGroups[grpKey] || false;
                                    const tasks = (a.careTasks || []);
                                    const maintDue = a.maintenanceFrequencyDays && isDue(a.lastMaintenanceDate, a.maintenanceFrequencyDays);
                                    const tasksDue = tasks.filter(t => isDue(t.lastDoneDate, t.frequencyDays)).length + (maintDue ? 1 : 0);
                                    return (
                                        <div key={a.id_public} className="border-b border-gray-100 last:border-0">
                                            <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50" onClick={() => toggleGroup(grpKey)}>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {isGrpCollapsed ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronUp size={14} className="text-gray-400" />}
                                                    {a.imageUrl
                                                        ? <img src={a.imageUrl} alt={a.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                                                        : <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><Cat size={11} className="text-gray-400" /></div>}
                                                    <span className="text-sm font-medium text-gray-800 truncate">{[a.prefix, a.name || 'Unnamed', a.suffix].filter(Boolean).join(' ')}</span>
                                                    <span className="text-xs text-gray-400 hidden sm:block">{getSpeciesDisplayName(a.species)}</span>
                                                </div>
                                                {tasksDue > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium shrink-0">{tasksDue} due</span>}
                                            </div>
                                            {!isGrpCollapsed && (
                                                <div className="px-4 py-2 space-y-1">
                                                    {/* General maintenance schedule row */}
                                                    {a.maintenanceFrequencyDays && (
                                                        <div className="flex flex-col gap-1 text-sm py-1 border-b border-gray-50" onClick={e => e.stopPropagation()}>
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${maintDue ? 'bg-red-500' : 'bg-green-500'}`} />
                                                                <span className="text-gray-700 font-medium">General Maintenance</span>
                                                                <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded flex-shrink-0">Schedule</span>
                                                            </div>
                                                            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 pl-4 text-xs text-gray-400">
                                                                <span className="flex items-center gap-0.5"><RefreshCw size={11} /> Every {a.maintenanceFrequencyDays}d</span>
                                                                {a.lastMaintenanceDate
                                                                    ? <span className="flex items-center gap-0.5 text-green-600"><Check size={10} /> Last: {formatDateShort(a.lastMaintenanceDate)}</span>
                                                                    : <span className="flex items-center gap-0.5 text-orange-500"><X size={10} /> Never done</span>}
                                                                <button onClick={(e) => { e.stopPropagation(); const today = new Date().toISOString().split('T')[0]; setAllAnimalsRaw(prev => prev.map(x => x.id_public === a.id_public ? { ...x, lastMaintenanceDate: today } : x)); axios.put(`${API_BASE_URL}/animals/${a.id_public}`, { lastMaintenanceDate: today }, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } }).catch(err => { console.error('Mark maintenance done failed:', err); fetchAllAnimals(); }); }}
                                                                    className={`text-xs px-2 py-0.5 rounded font-medium border flex items-center gap-0.5 ${maintDue ? 'bg-amber-500 text-white hover:bg-amber-600 border-amber-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'}`}>
                                                                    <Check size={10} /> Done
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Per-task enclosure care tasks */}
                                                    {tasks.map((task, idx) => {
                                                        const due = isDue(task.lastDoneDate, task.frequencyDays);
                                                        const daysAgo = task.lastDoneDate ? daysSince(task.lastDoneDate) : null;
                                                        const daysLeft = task.frequencyDays && daysAgo !== null ? task.frequencyDays - daysAgo : null;
                                                        const soon = !due && daysLeft !== null && daysLeft <= 2;
                                                        return (
                                                            <div key={idx} className="flex flex-col gap-1 text-sm py-1 border-b border-gray-50 last:border-0" onClick={e => e.stopPropagation()}>
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${due ? 'bg-red-500' : soon ? 'bg-orange-400' : task.frequencyDays ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                                    <span className="text-gray-700 font-medium truncate">{task.taskName}</span>
                                                                </div>
                                                                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 pl-4 text-xs text-gray-400">
                                                                    {task.frequencyDays && <span className="flex items-center gap-0.5"><RefreshCw size={11} /> Every {task.frequencyDays}d</span>}
                                                                    {task.lastDoneDate
                                                                        ? <span className="flex items-center gap-0.5 text-green-600"><Check size={10} /> Last: {formatDateShort(task.lastDoneDate)}</span>
                                                                        : <span className="flex items-center gap-0.5 text-orange-500"><X size={10} /> Never done</span>}
                                                                    <button onClick={(e) => handleMarkAnimalCareTaskDone(e, a, idx, 'enclosure')}
                                                                        className={`text-xs px-2 py-0.5 rounded font-medium border flex items-center gap-0.5 ${due ? 'bg-amber-500 text-white hover:bg-amber-600 border-amber-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'}`}>
                                                                        <Check size={10} /> Done
                                                                    </button>
                                                                    <button onClick={(e) => handleSkipAnimalCareTask(e, a, idx, 'enclosure')}
                                                                        className="text-xs px-2 py-0.5 rounded font-medium border bg-gray-100 text-gray-400 hover:bg-gray-200 border-gray-200 flex items-center gap-0.5">
                                                                        <ChevronRight size={10} /> Skip
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }))}
                            </div>

                            {/* -- Enclosure Cleaning -- */}
                            <div>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wide flex items-center gap-2 cursor-pointer" onClick={() => toggleGroup('maint_cleaning')}>
                                    {collapsedMgmtGroups['maint_cleaning'] ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronUp size={12} className="text-gray-400" />}
                                    Enclosure Cleaning
                                </div>
                                {!collapsedMgmtGroups['maint_cleaning'] && (enclosuresWithCleaningTasks.length === 0 ? (
                                    <div className="px-3 py-4 text-xs text-gray-400 text-center">No cleaning tasks defined. Edit an enclosure above and add tasks.</div>
                                ) : enclosuresWithCleaningTasks.map(enc => {
                                    const grpKey = `maint_enc_${enc._id}`;
                                    const isGrpCollapsed = collapsedMgmtGroups[grpKey] || false;
                                    const dueTasks = enc.cleaningTasks.filter(t => isDue(t.lastDoneDate, t.frequencyDays));
                                    return (
                                        <div key={enc._id} className="border-b border-gray-100 last:border-0">
                                            <div className="flex items-center justify-between px-3 py-2 bg-amber-50/40 cursor-pointer" onClick={() => toggleGroup(grpKey)}>
                                                <div className="flex items-center gap-2">
                                                    {isGrpCollapsed ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronUp size={14} className="text-gray-400" />}
                                                    <span className="text-sm font-medium text-gray-800">{enc.name}</span>
                                                    {enc.enclosureType && <span className="text-xs text-gray-400">({enc.enclosureType})</span>}
                                                </div>
                                                {dueTasks.length > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{dueTasks.length} due</span>}
                                            </div>
                                            {!isGrpCollapsed && (
                                                <div className="px-4 py-2 space-y-2">
                                                    {enc.cleaningTasks.map((task, idx) => {
                                                        const due = isDue(task.lastDoneDate, task.frequencyDays);
                                                        const daysAgo = task.lastDoneDate ? daysSince(task.lastDoneDate) : null;
                                                        const daysLeft = task.frequencyDays && daysAgo !== null ? task.frequencyDays - daysAgo : null;
                                                        const soon = !due && daysLeft !== null && daysLeft <= 2;
                                                        return (
                                                            <div key={idx} className="flex items-center justify-between gap-2 text-sm" onClick={e => e.stopPropagation()}>
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${due ? 'bg-red-500' : soon ? 'bg-orange-400' : task.frequencyDays ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                                    <span className="text-gray-700 truncate">{task.taskName}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 shrink-0 text-xs text-gray-400">
                                                                    {task.frequencyDays && <span><RefreshCw size={12} className="inline-block align-middle mr-0.5" /> Every {task.frequencyDays}d</span>}
                                                                    {task.lastDoneDate ? <span className="flex items-center gap-0.5 text-green-600"><Check size={10} className="flex-shrink-0" /> Last: {formatDateShort(task.lastDoneDate)}</span> : <span className="text-orange-500 flex items-center gap-0.5"><X size={10} className="flex-shrink-0" /> Never done</span>}
                                                                    <button onClick={(e) => handleMarkEnclosureTaskDone(e, enc, idx)}
                                                                        className={`ml-1 text-xs px-2 py-0.5 rounded font-medium border flex items-center gap-0.5 ${due ? 'bg-amber-500 text-white hover:bg-amber-600 border-amber-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'}`}>
                                                                        <Check size={10} /> Done
                                                                    </button>
                                                                    <button onClick={(e) => handleSkipEnclosureTask(e, enc, idx)}
                                                                        className="ml-1 text-xs px-2 py-0.5 rounded font-medium border bg-gray-100 text-gray-400 hover:bg-gray-200 border-gray-200 flex items-center gap-0.5">
                                                                        <ChevronRight size={10} /> Skip
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }))}
                            </div>
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

        const DashboardCard = ({ icon, label, value, colorClass, onClick, hasDropdown, isDropdownOpen, onDropdownToggle }) => (
            <div
                className={`relative flex items-center p-4 rounded-xl shadow-sm transition-all duration-200 ${onClick || onDropdownToggle ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''} ${colorClass}`}
                onClick={onClick || (onDropdownToggle ? () => onDropdownToggle() : undefined)}
            >
                {icon}
                <div className="ml-4">
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="text-sm font-medium opacity-90">{label}</div>
                </div>
                {hasDropdown && (
                    <button onClick={(e) => { e.stopPropagation(); if (onDropdownToggle) onDropdownToggle(); }} className="absolute top-2 right-2 p-1 text-inherit opacity-60 hover:opacity-100">
                        <ChevronDown size={20} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>
        );

        return (
            <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Column 1: Total Animals */}
                    <div className="flex flex-col gap-2">
                        <DashboardCard
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
                    </div>

                    {/* Column 2: Owned */}
                    <div className="flex flex-col gap-2">
                        <DashboardCard
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
                        <DashboardCard
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
                        <DashboardCard
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
                        <DashboardCard
                            icon={<AlertCircle size={32} className="text-orange-800" />}
                            label="Needs Attention"
                            value={feedDueDashboard.length + healthAttentionDashboardCount}
                            colorClass="bg-orange-100 text-orange-900"
                        />
                        <div className="relative w-full" ref={alertsDropdownRef}>
                            <button
                                onClick={() => setShowAlertsDropdown(prev => !prev)}
                                title="Configure alerts"
                                className={`w-full px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center justify-center gap-1 ${mgmtAlertsEnabled ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                <Bell size={14} className="sm:w-4 sm:h-4" />
                                <span>Alerts {mgmtAlertsEnabled ? 'On' : 'Off'}</span>
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
            {/* Notification banner */}
            <div className="w-full max-w-7xl mx-auto mb-4">
                <NotificationBar
                    authToken={authToken}
                    API_BASE_URL={API_BASE_URL}
                    setShowNotifications={setShowNotifications}
                    setShowMessages={setShowMessages}
                />
            </div>

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

                {renderDashboard()}

                {/* View Toggle: My Animals / Collections / Enclosures / Reproduction / Health / Feeding & Care / Supplies */}
            {!showArchiveScreen && (
            <div className="mb-4 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-3 sm:hidden">
                                {[{key:'list', icon:<ClipboardList size={14} className="shrink-0" />, label:'My Animals'},
                                    {key:'collections', icon:<FolderOpen size={14} className="shrink-0" />, label:'Collections'},
                                    {key:'enclosures', icon:<Home size={14} className="shrink-0" />, label:'Enclosures'},
                                    {key:'reproduction', icon:<Bean size={14} className="shrink-0" />, label:'Reproduction'},
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
                  {key:'collections', icon:<FolderOpen size={14} className="shrink-0" />, label:'Collections'},
                  {key:'enclosures', icon:<Home size={14} className="shrink-0" />, label:'Enclosures'},
                  {key:'reproduction', icon:<Bean size={14} className="shrink-0" />, label:'Reproduction'},
                  {key:'health', icon:<Activity size={14} className="shrink-0" />, label:'Health'},
                  {key:'feeding', icon:<Utensils size={14} className="shrink-0" />, label:'Feeding & Care'}].map(tab => (
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

            {isCollectionsView && !showArchiveScreen && (
            <div className="mb-4 sm:mb-6 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 p-2 sm:p-3">
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
                        <button
                            onClick={() => { setCollectionsViewMode('cards'); try { localStorage.setItem(`ct_collections_view_mode_${userKey}`, 'cards'); } catch {} }}
                            className={`p-2 transition text-xs font-medium flex items-center gap-1 ${collectionsViewMode === 'cards' ? 'bg-primary text-black' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            title="Card view"
                        >
                            <LayoutGrid size={14} />
                        </button>
                        <button
                            onClick={() => { setCollectionsViewMode('list'); try { localStorage.setItem(`ct_collections_view_mode_${userKey}`, 'list'); } catch {} }}
                            className={`p-2 transition text-xs font-medium flex items-center gap-1 border-l border-gray-200 ${collectionsViewMode === 'list' ? 'bg-primary text-black' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            title="List view"
                        >
                            <ClipboardList size={14} />
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        onKeyPress={(e) => { if (e.key === 'Enter') triggerSearch(); }}
                        className="flex-grow p-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition min-w-0"
                    />
                    <button
                        onClick={triggerSearch}
                        className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-3 rounded-lg transition duration-150 shadow-md flex items-center justify-center gap-1 text-sm shrink-0"
                        title="Search"
                    >
                        <Search size={16} />
                        <span className="hidden sm:inline">Search</span>
                    </button>
                    <span className="hidden sm:inline mx-1 text-gray-300">|</span>
                    <button
                        onClick={() => toggleAllAnimalsPrivacy(true)}
                        className="text-green-600 hover:text-green-700 transition flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-green-50 text-xs sm:text-sm font-semibold shadow-sm shrink-0"
                        title="Make All Animals Public"
                    >
                        <Eye size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Set All Public</span>
                    </button>
                    <button
                        onClick={() => toggleAllAnimalsPrivacy(false)}
                        className="text-gray-600 hover:text-gray-800 transition flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray-100 text-xs sm:text-sm font-semibold shadow-sm shrink-0"
                        title="Make All Animals Private"
                    >
                        <EyeOff size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Set All Private</span>
                    </button>
                </div>
            </div>
            )}

            {isListLikeView && !isCollectionsView && !showArchiveScreen && (
                <div className="mb-4 sm:mb-6 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 p-2 sm:p-3 border-t border-gray-200">
                    {/* Card / List view toggle */}
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
                        <button
                            onClick={() => { setMyAnimalsViewMode('cards'); try { localStorage.setItem(`ct_my_animals_view_mode_${userKey}`, 'cards'); } catch {} }}
                            className={`p-2 transition text-xs font-medium flex items-center gap-1 ${myAnimalsViewMode === 'cards' ? 'bg-primary text-black' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            title="Card view"
                        >
                            <LayoutGrid size={14} />
                        </button>
                        <button
                            onClick={() => { setMyAnimalsViewMode('list'); try { localStorage.setItem(`ct_my_animals_view_mode_${userKey}`, 'list'); } catch {} }}
                            className={`p-2 transition text-xs font-medium flex items-center gap-1 border-l border-gray-200 ${myAnimalsViewMode === 'list' ? 'bg-primary text-black' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            title="List view"
                        >
                            <ClipboardList size={14} />
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        onKeyPress={(e) => { if (e.key === 'Enter') triggerSearch(); }}
                        className="flex-grow p-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition min-w-0"
                        disabled={loading}
                        data-tutorial-target="my-animals-search"
                    />
                    <button
                        onClick={triggerSearch}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-3 rounded-lg transition duration-150 shadow-md flex items-center justify-center gap-1 text-sm shrink-0"
                        title="Search"
                    >
                        <Search size={16} />
                        <span className="hidden sm:inline">Search</span>
                    </button>
                    <button
                        onClick={() => setFiltersExpanded(prev => !prev)}
                        className={`relative py-2 px-3 rounded-lg transition duration-150 shadow-sm flex items-center justify-center gap-1 text-sm font-semibold shrink-0 ${
                            filtersExpanded ? 'bg-gray-700 text-white' : hasActiveFilters ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title="Toggle Filters"
                    >
                        <SlidersHorizontal size={16} />
                        <span className="hidden sm:inline">Filters</span>
                        {hasActiveFilters && !filtersExpanded && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full" />
                        )}
                    </button>
                </div>

            {/* Collapsible filter panel */}
            {filtersExpanded && (
            <div className="px-2 sm:px-3 pb-2 sm:pb-3 space-y-2 sm:space-y-3 border-t border-gray-200 dark:border-dark-border pt-2 sm:pt-3">
                {/* Row 1: Species + Status dropdowns */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                    <div className="flex gap-1 sm:gap-2 items-center" data-tutorial-target="species-filter">
                        <span className='text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap'>Species:</span>
                        <select 
                            value={
                                speciesNames.every(species => selectedSpecies.includes(species)) ? '' : 
                                (selectedSpecies.find(s => speciesNames.includes(s)) || '')
                            }
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                    setSelectedSpecies([...speciesNames]);
                                } else {
                                    setSelectedSpecies([value]);
                                }
                            }}
                            className="p-1.5 sm:p-2 text-xs sm:text-sm border border-gray-300 dark:border-dark-border rounded-lg shadow-sm focus:ring-primary focus:border-primary dark:bg-dark-surface dark:text-dark-text transition min-w-[110px] sm:min-w-[160px]"
                        >
                            <option value="">All</option>
                            {speciesNames.map(species => (
                                <option key={species} value={species}>{getSpeciesDisplayName(species)}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex gap-1 sm:gap-2 items-center" data-tutorial-target="status-filter">
                        <span className='text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap'>Status:</span>
                        <select value={statusFilter} onChange={handleStatusFilterChange} 
                            className="p-1.5 sm:p-2 text-xs sm:text-sm border border-gray-300 dark:border-dark-border rounded-lg shadow-sm focus:ring-primary focus:border-primary dark:bg-dark-surface dark:text-dark-text transition min-w-[110px] sm:min-w-[160px]"
                        >
                            <option value="">All</option>
                            {STATUS_OPTIONS.filter(s => s !== 'Sold').map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Row 2: Gender + Visibility */}
                <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-1 sm:gap-2" data-tutorial-target="gender-filter">
                        <span className='text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap'>Gender:</span>
                            {GENDER_OPTIONS.map(gender => {
                                const isSelected = selectedGenders.includes(gender);
                                let Icon, bgColor;
                                switch(gender) {
                                    case 'Male': Icon = Mars; bgColor = isSelected ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'; break;
                                    case 'Female': Icon = Venus; bgColor = isSelected ? 'bg-pink-400' : 'bg-gray-300 hover:bg-gray-400'; break;
                                    case 'Intersex': Icon = VenusAndMars; bgColor = isSelected ? 'bg-purple-400' : 'bg-gray-300 hover:bg-gray-400'; break;
                                    case 'Unknown': Icon = Circle; bgColor = isSelected ? 'bg-teal-400' : 'bg-gray-300 hover:bg-gray-400'; break;
                                    default: Icon = Circle; bgColor = 'bg-gray-300 hover:bg-gray-400';
                                }
                                return (
                                    <button key={gender} onClick={() => toggleGender(gender)}
                                        className={`p-1.5 sm:p-2 rounded-lg transition duration-150 shadow-sm ${bgColor}`}
                                        title={gender}
                                    >
                                        <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-black" />
                                    </button>
                                );
                            })}
                        </div>

                    <div className="flex items-center gap-1 sm:gap-2" data-tutorial-target="visibility-filter">
                        <span className='text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap'>Visibility:</span>
                            {['All', 'Public', 'Private'].map(option => {
                                const value = option === 'All' ? '' : option.toLowerCase();
                                const isSelected = publicFilter === value;
                                return (
                                    <button key={option} onClick={() => setPublicFilter(value)}
                                        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 shadow-sm ${ 
                                            isSelected ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                {/* Row 3: Show filters */}
                <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2" data-tutorial-target="collection-filters">
                    <span className='text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap'>Show:</span>

                        <button onClick={handleFilterMating}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center gap-1 ${ 
                                statusFilterMating ? 'bg-accent text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title="Mating"
                        >
                            <Hourglass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Mating</span>
                        </button>
                        <button onClick={handleFilterPregnant}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center gap-1 ${ 
                                statusFilterPregnant ? 'bg-accent text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title="Pregnant"
                        >
                            <Bean className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Pregnant</span>
                        </button>
                        <button onClick={handleFilterNursing}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center gap-1 ${ 
                                statusFilterNursing ? 'bg-accent text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title="Nursing"
                        >
                            <Milk className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Nursing</span>
                        </button>
                    </div>

                {/* Row 4: Breeding Line filters */}
                {breedingLineDefs.some(l => l.name) && (
                    <div className="flex flex-wrap justify-center items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap">Breeding Line:</span>
                            {breedingLineDefs.filter(l => l.name).map(line => {
                                const isActive = blFilter.includes(line.id);
                                return (
                                    <button
                                        key={line.id}
                                        onClick={() => setBlFilter(prev => isActive ? prev.filter(id => id !== line.id) : [...prev, line.id])}
                                        title={line.name}
                                        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 shadow-sm border ${
                                            isActive ? 'text-white border-transparent' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                                        }`}
                                        style={isActive ? { backgroundColor: line.color, borderColor: line.color } : {}}
                                    >
                                        <span style={{ color: isActive ? 'white' : line.color }} className="text-base leading-none">&#x25C6;</span>
                                        {line.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                {/* Apply / Clear row */}
                <div className="flex justify-center items-center gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
                        <button
                            onClick={() => { applyFilters(); setFiltersExpanded(false); }}
                            className={`font-semibold py-2 px-5 rounded-lg transition duration-150 shadow-md flex items-center justify-center gap-1.5 text-sm ${
                                panelDirty
                                    ? 'bg-accent hover:bg-accent/90 text-white animate-pulse'
                                    : 'bg-primary hover:bg-primary/90 text-black'
                            }`}
                        >
                            <Check size={16} />
                            Apply Filters
                        </button>
                        {hasActiveFilters && (
                            <button
                                onClick={() => { handleClearFilters(); setFiltersExpanded(false); }}
                                className="text-gray-600 hover:text-gray-800 transition flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium"
                            >
                                <X size={14} />
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
                )}
            </div>
            )}
            {showArchiveScreen ? renderArchiveScreen() : showDuplicatesScreen ? renderDuplicatesScreen() : animalView === 'enclosures' ? renderManagementView('enclosures') : animalView === 'reproduction' ? renderManagementView('reproduction') : animalView === 'health' ? renderManagementView('health') : animalView === 'feeding' ? renderManagementView('feeding') : animalView === 'collections' ? renderCollectionsView() : (animalView === 'familyTree' && isFamilyTreeEnabled) ? <FamilyTreeView animals={familyTreeAnimals} loading={loading} onViewAnimal={onViewAnimal || onEditAnimal} authToken={authToken} breedingLineDefs={breedingLineDefs} animalBreedingLines={animalBreedingLines} prefetchedAncestorsBySpecies={familyTreePrefetchBySpecies} prefetchLoadingBySpecies={familyTreePrefetchLoadingBySpecies} onAncestorsResolved={handleFamilyTreeAncestorsResolved} /> : (loading && animals.length === 0) ? (
                <div className="space-y-3 sm:space-y-4"> {/* Skeleton grid */} </div>
            ) : displayedAnimalCount === 0 ? ( <div /> ) : myAnimalsViewMode === 'list' ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">                    
                    <table className="min-w-full text-xs divide-y divide-gray-200">
                        <thead className="bg-gray-100 text-gray-600 text-xs">
                            <tr>
                                <th className="px-4 py-2 w-12"></th>                                

                                {listViewColumns.animal && <th className="px-3 py-2 text-left"><button onClick={() => requestSort('name')} className="flex items-center gap-1 group"><span className={sortConfig.key === 'name' ? 'text-gray-800 font-bold' : ''}>Animal</span>{sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? <ArrowUp size={12} className="text-gray-800" /> : <ArrowDown size={12} className="text-gray-800" />) : (<ArrowDown size={12} className="text-gray-400" />)}</button></th>}
                                {listViewColumns.species && <th className="px-3 py-2 text-left">Species</th>}
                                {listViewColumns.variety && <th className="px-3 py-2 text-left">Variety</th>}
                                {listViewColumns.enclosure && <th className="px-3 py-2 text-left">Enclosure</th>}
                                {listViewColumns.lifeStage && <th className="px-3 py-2 text-left">Life Stage</th>}
                                {listViewColumns.status && <th className="px-3 py-2 text-left">Status</th>}
                                {listViewColumns.health && <th className="px-3 py-2 text-left">Health</th>}
                                {listViewColumns.birthdateAge && <th className="px-3 py-2 text-left whitespace-nowrap"><button onClick={() => requestSort('birthdate')} className="flex items-center gap-1 group"><span className={sortConfig.key === 'birthdate' ? 'text-gray-800 font-bold' : ''}>Birthdate / age</span>{sortConfig.key === 'birthdate' ? (sortConfig.direction === 'ascending' ? <ArrowUp size={12} className="text-gray-800" /> : <ArrowDown size={12} className="text-gray-800" />) : (<ArrowDown size={12} className="text-gray-400" />)}</button></th>}
                                {listViewColumns.breedingLines && <th className="px-3 py-2 text-left">Lines</th>}
                                {listViewColumns.tags && <th className="px-3 py-2 text-left">Tags</th>}
                                <th className="px-3 py-2 text-right w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(() => {
                                let displayedAnimals = speciesNames.flatMap(species => (groupedAnimals[species] || []));
                                
                                // Sorting logic
                                if (sortConfig.key) {
                                    displayedAnimals.sort((a, b) => {
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
                                        
                                        // Secondary sort for stability
                                        if ((a.name || '').toLowerCase() < (b.name || '').toLowerCase()) return -1;
                                        if ((a.name || '').toLowerCase() > (b.name || '').toLowerCase()) return 1;

                                        return 0;
                                    });
                                }

                                const isBulkMode = Object.values(bulkDeleteMode).some(v => v) || Object.values(bulkArchiveMode).some(v => v);
                                const selectedIds = Object.values(selectedAnimals).flat();
                            const enclosureMap = new Map(enclosures.map(e => [e._id, e.name]));
                                return displayedAnimals.map(animal => {
                                    const birthDateObj = animal.birthDate ? new Date(animal.birthDate) : null;
                                    const ageStr = calculateBreedingAge(animal.birthDate, animal.deceasedDate);
                                    const varietyStr = [animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).join(' ') || '—';
                                    const assignedIds = animalBreedingLines[animal.id_public] || [];
                                    const activeLines = breedingLineDefs.filter(l => assignedIds.includes(l.id) && l.name);

                                    return (
                                        <tr key={animal.id_public || animal._id} className="hover:bg-gray-50" onClick={() => onViewAnimal(animal)}>
                                        <td className="px-4 py-1.5 text-center">
                                            <input
                                                type="checkbox"
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
                                        {listViewColumns.health && <td className="px-3 py-1.5 text-gray-600 text-xs">{
                                            animal.isQuarantine ? <span className="font-medium text-orange-600">Quarantine</span> :
                                            animal.isInTreatment ? <span className="font-medium text-red-600">Treatment</span> :
                                            animal.status === 'Deceased' ? <span className="text-gray-500">Deceased</span> :
                                            <span className="text-green-600">OK</span>
                                        }</td>}
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
            </div>
        </>
    );
};

export default AnimalList;
