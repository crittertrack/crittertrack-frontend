import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import ArchiveScreen from '../ArchiveScreen';
import {
    Activity, AlertCircle, AlertTriangle, Archive, ArrowLeftRight,
    Ban, Bean, Bell, Calendar, Cat, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
    Circle, ClipboardList, Edit, Eye, EyeOff, Flag, FolderOpen, Heart, HeartOff,
    Home, Hourglass, LayoutGrid, Loader2, LockOpen, MapPin, Mars, MessageSquare, Milk,
    Network, Package, Plus, PlusCircle, RefreshCw, Save, ScrollText,
    Search, ShoppingBag, SlidersHorizontal, Sparkles, Trash2, Utensils,
    Venus, VenusAndMars, Wrench, X
} from 'lucide-react';
import { formatDate, formatDateShort } from '../../utils/dateFormatter';

const API_BASE_URL = '/api';

const GENDER_OPTIONS = ['Male', 'Female', 'Intersex', 'Unknown'];
const STATUS_OPTIONS = ['Pet', 'Breeder', 'Available', 'Booked', 'Sold', 'Retired', 'Deceased', 'Rehomed', 'Unknown'];
const normalizeAnimalView = (value) => (
    value === 'management' || value === 'collections' ? value : 'list'
);

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

const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const then = new Date(dateStr);
    if (isNaN(then.getTime())) return '';
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return diffMin + 'm ago';
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return diffHr + 'h ago';
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 30) return diffDays + 'd ago';
    const diffMo = Math.floor(diffDays / 30);
    if (diffMo < 12) return diffMo + 'mo ago';
    return Math.floor(diffMo / 12) + 'y ago';
};

const getActionLabel = (action) => {
    const labels = {
        login: 'Logged in', logout: 'Logged out', password_change: 'Changed password',
        profile_update: 'Updated profile', profile_image_change: 'Changed profile photo',
        privacy_settings_change: 'Updated privacy settings',
        animal_create: 'Added a new animal', animal_update: 'Updated animal',
        animal_delete: 'Deleted animal', animal_image_upload: 'Uploaded animal photo',
        animal_image_delete: 'Deleted animal photo', animal_visibility_change: 'Changed animal visibility',
        animal_transfer_initiate: 'Initiated animal transfer', animal_transfer_accept: 'Accepted animal transfer',
        animal_transfer_reject: 'Rejected animal transfer', litter_create: 'Recorded a new litter',
        litter_update: 'Updated litter', litter_delete: 'Deleted litter',
        message_send: 'Sent a message', message_delete: 'Deleted a message',
        report_submit: 'Submitted a report', transaction_create: 'Added a budget transaction',
        transaction_delete: 'Deleted a budget transaction',
    };
    return labels[action] || (action && action.replace(/_/g, ' ')) || 'Unknown action';
};

const getActionColor = (action) => {
    if (!action) return 'bg-gray-300';
    if (action.startsWith('animal_')) return 'bg-accent';
    if (action.startsWith('litter_')) return 'bg-purple-400';
    if (action.startsWith('transaction_')) return 'bg-emerald-400';
    if (action.startsWith('message_')) return 'bg-blue-400';
    if (action === 'login' || action === 'logout') return 'bg-gray-400';
    if (action.startsWith('profile_') || action.startsWith('privacy_')) return 'bg-yellow-400';
    if (action === 'report_submit') return 'bg-red-400';
    return 'bg-gray-300';
};

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
// -- Module-level cache so AnimalList survives unmount/remount without refetching --
let _alCache = null;       // last animals array

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
    const [selectedGenders, setSelectedGenders] = useState(() => {
        try {
            const saved = localStorage.getItem('animalList_selectedGenders');
            // Default to all genders if not previously saved
            return saved ? JSON.parse(saved) : ['Male', 'Female', 'Intersex', 'Unknown'];
        } catch { return ['Male', 'Female', 'Intersex', 'Unknown']; }
    });
    // Always start with all species selected (empty array = show all)
    // Don't persist this filter to prevent newly created animals from being hidden
    const [selectedSpecies, setSelectedSpecies] = useState([]);
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
    // Applied filter snapshot ? groupedAnimals reads from this, only updated on "Apply Filters" click
    const [appliedFilters, setAppliedFilters] = useState(() => ({
        statusFilter: (function() { try { return localStorage.getItem('animalList_statusFilter') || ''; } catch { return ''; } })(),
        selectedGenders: (function() { try { const s = localStorage.getItem('animalList_selectedGenders'); return s ? JSON.parse(s) : ['Male', 'Female', 'Intersex', 'Unknown']; } catch { return ['Male', 'Female', 'Intersex', 'Unknown']; } })(),
        selectedSpecies: [], // will be filled on first species load
        statusFilterPregnant: (function() { try { return localStorage.getItem('animalList_statusFilterPregnant') === 'true'; } catch { return false; } })(),
        statusFilterNursing: (function() { try { return localStorage.getItem('animalList_statusFilterNursing') === 'true'; } catch { return false; } })(),
        statusFilterMating: (function() { try { return localStorage.getItem('animalList_statusFilterMating') === 'true'; } catch { return false; } })(),
        publicFilter: (function() { try { return localStorage.getItem('animalList_publicFilter') || ''; } catch { return ''; } })(),
        blFilter: (function() { try { const s = localStorage.getItem('animalList_blFilter'); return s ? JSON.parse(s) : []; } catch { return []; } })(),
    }));
    const [showOwned, setShowOwned] = useState(() => {
        try {
            const saved = localStorage.getItem('animalList_showOwned');
            return saved !== null ? saved === 'true' : true;
        } catch { return true; }
    });
    const [showUnowned, setShowUnowned] = useState(() => {
        try {
            const saved = localStorage.getItem('animalList_showUnowned');
            return saved !== null ? saved === 'true' : false;
        } catch { return false; }
    });
    // Archive section collapse states
    const [archiveSoldCollapsed, setArchiveSoldCollapsed] = useState(false);
    const [archiveArchivedCollapsed, setArchiveArchivedCollapsed] = useState(false);
    
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
    const [animalView, setAnimalView] = useState(() => normalizeAnimalView(initialAnimalView)); // 'list' | 'collections' | 'management'
    const [collapsedMgmtSections, setCollapsedMgmtSections] = useState({ enclosures: true }); // { sectionKey: bool }
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
    const _saveCollections = (cols) => {
        setUserCollections(cols);
        try { localStorage.setItem('ct_collections', JSON.stringify(cols)); } catch {}
    };
    const _saveAnimalCollections = (map) => {
        setAnimalCollections(map);
        try { localStorage.setItem('ct_animal_collections', JSON.stringify(map)); } catch {}
    };
    const createCollection = (name) => {
        if (!name.trim()) return;
        const id = `col_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        _saveCollections([...userCollections, { id, name: name.trim() }]);
    };
    const deleteCollection = (id) => {
        _saveCollections(userCollections.filter(c => c.id !== id));
        const next = { ...animalCollections };
        Object.keys(next).forEach(aid => { next[aid] = next[aid].filter(cid => cid !== id); });
        _saveAnimalCollections(next);
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

    // Activity Log state
    const [activityLogs, setActivityLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsPagination, setLogsPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [logsLoaded, setLogsLoaded] = useState(false);
    const [showActivityLogScreen, setShowActivityLogScreen] = useState(false);
    const [logFilterAction, setLogFilterAction] = useState('');
    const [logFilterSearch, setLogFilterSearch] = useState('');
    const [logFilterStartDate, setLogFilterStartDate] = useState('');
    const [logFilterEndDate, setLogFilterEndDate] = useState('');
    // Supplies & Inventory state
    const [showSuppliesScreen, setShowSuppliesScreen] = useState(false);
    const [supplies, setSupplies] = useState([]);
    const [suppliesLoading, setSuppliesLoading] = useState(false);
    // Duplicates state
    const [showDuplicatesScreen, setShowDuplicatesScreen] = useState(false);
    const [duplicateGroups, setDuplicateGroups] = useState([]);
    const [duplicatesLoading, setDuplicatesLoading] = useState(false);
    const [supplyForm, setSupplyForm] = useState({ name: '', category: 'Other', currentStock: '', unit: '', reorderThreshold: '', notes: '', isFeederAnimal: false, feederType: '', feederSize: '', costPerUnit: '', nextOrderDate: '', orderFrequency: '', orderFrequencyUnit: 'months' });
    const [supplyFormVisible, setSupplyFormVisible] = useState(false);
    const [editingSupplyId, setEditingSupplyId] = useState(null);
    const [supplySaving, setSupplySaving] = useState(false);
    const [supplyCategoryFilter, setSupplyCategoryFilter] = useState('All');
    const [restockingSupplyId, setRestockingSupplyId] = useState(null);
    const [restockForm, setRestockForm] = useState({ qty: '', cost: '', date: new Date().toISOString().slice(0, 10), notes: '' });
    const [restockSaving, setRestockSaving] = useState(false);

    // ---- Collections state (localStorage-backed; backend sync TBD) ----
    const [userCollections, setUserCollections] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ct_collections') || '[]'); } catch { return []; }
    });
    const [animalCollections, setAnimalCollections] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ct_animal_collections') || '{}'); } catch { return {}; }
    });
    const [showCollectionManager, setShowCollectionManager] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [renamingCollectionId, setRenamingCollectionId] = useState(null);
    const [renamingCollectionName, setRenamingCollectionName] = useState('');
    const [collapsedCollections, setCollapsedCollections] = useState({});
    const [assigningCollectionAnimalId, setAssigningCollectionAnimalId] = useState(null);

    const isCollectionsView = animalView === 'collections';
    const isListLikeView = animalView === 'list' || isCollectionsView;

    useEffect(() => {
        setAnimalView(normalizeAnimalView(initialAnimalView));
    }, [initialAnimalView]);
    const [feedingModal, setFeedingModal] = useState(null); // { animal } when open
    const [feedingForm, setFeedingForm] = useState({ supplyId: '', qty: '1', notes: '', updateStock: true });
    const [enclosures, setEnclosures] = useState([]);
    const [enclosureFormVisible, setEnclosureFormVisible] = useState(false);
    const [enclosureFormData, setEnclosureFormData] = useState({ name: '', enclosureType: '', size: '', notes: '', cleaningTasks: [] });
    const [editingEnclosureId, setEditingEnclosureId] = useState(null);
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
        try {
            localStorage.setItem('animalList_selectedGenders', JSON.stringify(selectedGenders));
        } catch (e) { console.warn('Failed to save selectedGenders', e); }
    }, [selectedGenders]);
    
    // Removed selectedSpecies persistence - always default to showing all species
    // This prevents confusion when users create new animals and they don't appear due to cached filters
    
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
        try {
            localStorage.setItem('animalList_showOwned', showOwned.toString());
        } catch (e) { console.warn('Failed to save showOwned', e); }
    }, [showOwned]);
    useEffect(() => {
        try {
            localStorage.setItem('animalList_showUnowned', showUnowned.toString());
        } catch (e) { console.warn('Failed to save showUnowned', e); }
    }, [showUnowned]);
    
    useEffect(() => {
        try {
            localStorage.setItem('animalList_publicFilter', publicFilter);
        } catch (e) { console.warn('Failed to save publicFilter', e); }
    }, [publicFilter]);

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
            try {
                const allRes = await axios.get(`${API_BASE_URL}/animals`, { headers: { Authorization: `Bearer ${authToken}` } });
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
            statusFilter, selectedGenders, selectedSpecies,
            statusFilterPregnant, statusFilterNursing, statusFilterMating,
            publicFilter, blFilter,
        });
        setPendingFilters(false);
    }, [statusFilter, selectedGenders, selectedSpecies, statusFilterPregnant, statusFilterNursing, statusFilterMating, publicFilter, blFilter]);

    // Species list is now derived from the fetchAnimals result - no separate API call needed
    const fetchAllSpecies = useCallback(async () => {
        // No-op: species are populated as a side-effect of fetchAnimals()
        // Kept for compatibility with the animals-changed event handler
    }, []);

    // Fetch ALL user animals (no client-side filters) ? used by Management View
    const fetchAllAnimals = useCallback(async () => {
        if (!authToken) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` },
                params: { isOwned: 'true' }
            });
            setAllAnimalsRaw(res.data || []);
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
            setAvailableAnimalsRaw(res.data || []);
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

    // Fetch the current user's activity log (lazy ? only when log screen opens)
    const fetchActivityLogs = useCallback(async (page = 1, filters = {}) => {
        if (!authToken) return;
        setLogsLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 30 });
            if (filters.targetType) params.set('targetType', filters.targetType);
            if (filters.action) params.set('action', filters.action);
            if (filters.search) params.set('search', filters.search);
            if (filters.startDate) params.set('startDate', filters.startDate);
            if (filters.endDate) params.set('endDate', filters.endDate);
            const res = await axios.get(`${API_BASE_URL}/activity-logs?${params}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (page === 1) {
                setActivityLogs(res.data.logs || []);
            } else {
                setActivityLogs(prev => [...prev, ...(res.data.logs || [])]);
            }
            setLogsPagination(res.data);
            setLogsLoaded(true);
        } catch (err) {
            console.error('[fetchActivityLogs]', err);
        } finally {
            setLogsLoading(false);
        }
    }, [authToken, API_BASE_URL]);

    // Auto-fetch logs when the activity log screen opens for the first time
    useEffect(() => {
        if (showActivityLogScreen && !logsLoaded && !logsLoading) {
            fetchActivityLogs(1, { targetType: 'management' });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showActivityLogScreen]);

    // Reset log screen when navigating away from management view
    useEffect(() => {
        if (animalView !== 'management') { setShowActivityLogScreen(false); setShowSuppliesScreen(false); setSupplyFormVisible(false); setShowDuplicatesScreen(false); }
    }, [animalView]);
    
    // Auto-fetch duplicates when duplicates screen opens for the first time
    useEffect(() => {
        if (showDuplicatesScreen && duplicateGroups.length === 0 && !duplicatesLoading) {
            fetchDuplicates();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showDuplicatesScreen]);

    // Fire-and-forget management activity logger (called from management handlers)
    const logManagementActivity = useCallback(async (action, targetId_public, details = {}) => {
        if (!authToken) return;
        try {
            await axios.post(`${API_BASE_URL}/activity-logs`,
                { action, targetId_public: targetId_public || null, details },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
        } catch (err) {
            // Non-critical ? don't surface logging failures to the user
        }
    }, [authToken, API_BASE_URL]);
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

        // Status filter
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

        // Species filter
        if (af.selectedSpecies.length > 0) {
            source = source.filter(a => af.selectedSpecies.includes(a.species));
        }

        // Gender filter
        if (af.selectedGenders.length === 0) {
            source = [];
        } else if (af.selectedGenders.length < GENDER_OPTIONS.length) {
            source = source.filter(a => af.selectedGenders.includes(a.gender));
        }

        // Pregnant / Nursing / Mating filters
        if (af.statusFilterPregnant || af.statusFilterNursing) {
            source = source.filter(a => (a.gender || '').toLowerCase() !== 'male');
        }
        if (af.statusFilterPregnant) source = source.filter(a => a.isPregnant === true);
        if (af.statusFilterNursing) source = source.filter(a => a.isNursing === true);
        if (af.statusFilterMating) source = source.filter(a => a.isInMating === true);

        // Public/private filter
        if (af.publicFilter === 'public') {
            source = source.filter(a => a.showOnPublicProfile === true);
        } else if (af.publicFilter === 'private') {
            source = source.filter(a => !a.showOnPublicProfile);
        }

        // --- Instant filters (no Apply needed) ---
        // Ownership filter
        if (showOwned && !showUnowned) {
            source = source.filter(a => a.isOwned !== false);
        } else if (!showOwned && showUnowned) {
            source = source.filter(a => a.isOwned === false);
        } else if (!showOwned && !showUnowned) {
            source = [];
        }
        // Breeding line filter
        if (af.blFilter.length > 0) {
            source = source.filter(a => {
                const assigned = animalBreedingLines[a.id_public] || [];
                return af.blFilter.some(lineId => assigned.includes(lineId));
            });
        }
        return source.reduce((groups, animal) => {
            const species = animal.species || 'Unspecified Species';
            if (!groups[species]) {
                groups[species] = [];
            }
            groups[species].push(animal);
            return groups;
        }, {});
    }, [animals, appliedFilters, appliedNameFilter, showOwned, showUnowned, animalBreedingLines]);

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
        setShowOwned(true);
        setShowUnowned(false);
        setPublicFilter('');
        setBlFilter([]);
        // Also reset the applied snapshot to defaults
        setAppliedFilters({
            statusFilter: '',
            selectedGenders: ['Male', 'Female', 'Intersex', 'Unknown'],
            selectedSpecies: [...speciesNames],
            statusFilterPregnant: false,
            statusFilterNursing: false,
            statusFilterMating: false,
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

    const moveSpecies = async (species, direction) => {
        const currentIndex = speciesNames.indexOf(species);
        if (currentIndex === -1) return;

        const newOrder = [...speciesNames];
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        // Check bounds
        if (newIndex < 0 || newIndex >= newOrder.length) return;

        // Swap
        [newOrder[newIndex], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[newIndex]];

        // Update local state immediately
        setUserSpeciesOrder(newOrder);

        // Save to backend
        try {
            await axios.post(`${API_BASE_URL}/users/species-order`, 
                { speciesOrder: newOrder },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
        } catch (error) {
            console.error('[SPECIES ORDER] Error saving:', error);
            showModalMessage('Error', 'Failed to save species order.');
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

    const AnimalCard = ({ animal, onEditAnimal, species, isSelectable, isSelected, onToggleSelect, onTogglePrivacy, onToggleOwned }) => {
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
                    className={`relative bg-white rounded-lg sm:rounded-xl shadow-sm w-full max-w-[165px] sm:max-w-[140px] md:max-w-[176px] h-44 sm:h-48 md:h-56 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 pt-2 sm:pt-3 ${
                        isSelected ? 'border-red-500' : animal.isViewOnly ? 'border-gray-400 bg-gray-50' : 'border-gray-300'
                    }`}
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
                    {(animal.soldStatus || animal.isViewOnly) && !isSelectable && (
                        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 text-black" title="Transferred Animal">
                            <ArrowLeftRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2.5} />
                        </div>
                    )}

                    {/* Birthdate center-top - only show if not in selection mode */}
                    {birth && !isSelectable && (
                        <div className="absolute top-1 sm:top-2 left-1/2 transform -translate-x-1/2 text-[10px] sm:text-xs text-gray-600 bg-white/80 px-1 sm:px-2 py-0.5 rounded">
                            {birth}
                        </div>
                    )}

                    {/* Gender badge top-right */}
                    {animal.gender && (
                        <div className={`absolute top-1 sm:top-2 right-1 sm:right-2`} title={animal.gender}>
                            {animal.gender === 'Male' ? <Mars className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2.5} style={{color: 'var(--color-primary, #9ED4E0)'}} /> : animal.gender === 'Female' ? <Venus className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2.5} style={{color: 'var(--color-accent, #D27096)'}} /> : animal.gender === 'Intersex' ? <VenusAndMars className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" strokeWidth={2.5} /> : <Circle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" strokeWidth={2.5} />}
                        </div>
                    )}

                    {/* Centered profile image */}
                    <div className="flex items-center justify-center w-full px-1 sm:px-2 mt-0.5 sm:mt-1 h-20 sm:h-20 md:h-28">
                        {imgSrc ? (
                            <img src={imgSrc} alt={animal.name} className="max-w-20 max-h-20 sm:max-w-20 sm:max-h-20 md:max-w-24 md:max-h-24 w-auto h-auto object-contain rounded-md" />
                        ) : (
                            <div className="w-20 h-20 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
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
                        <div className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">{animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}</div>
                    </div>

                    {/* Edit is available when viewing full card; remove inline edit icon from dashboard cards */}

                    {/* ID bottom-right */}
                    <div className="w-full px-1 sm:px-2 pb-1 sm:pb-2 flex justify-between items-center mt-auto">
                        {/* Privacy and Owned toggles bottom-left */}
                        {!isSelectable && (
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
                                            ? 'bg-red-100 hover:bg-red-200' 
                                            : 'bg-gray-100 hover:bg-gray-200'
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
                                            ? 'bg-green-100 hover:bg-green-200' 
                                            : 'bg-gray-100 hover:bg-gray-200'
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
                        {/* Spacer if no toggles (in selection mode) */}
                        {isSelectable && <div></div>}
                        <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-500">{animal.id_public}</div>
                    </div>
                    {/* Breeding line diamonds */}
                    {(() => {
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
                    {/* Status bar at bottom */}
                    <div className={`w-full py-0.5 sm:py-1 text-center border-t border-gray-300 mt-auto ${
                        animal.isViewOnly ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                        <div className={`text-[10px] sm:text-xs font-medium ${
                            animal.isViewOnly ? 'text-orange-800' : 'text-gray-700'
                        }`}>{animal.isViewOnly ? 'Sold' : (animal.status || 'Unknown')}</div>
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

    // -- Activity Log Screen ------------------------------------------------------
    const renderActivityLogScreen = () => {
        const ACTION_OPTIONS = [
            { value: '', label: 'All Management Actions' },
            { value: 'enclosure_create', label: 'Created Enclosure' },
            { value: 'enclosure_update', label: 'Updated Enclosure' },
            { value: 'enclosure_delete', label: 'Deleted Enclosure' },
            { value: 'enclosure_assign', label: 'Assigned to Enclosure' },
            { value: 'enclosure_unassign', label: 'Removed from Enclosure' },
            { value: 'animal_fed', label: 'Marked as Fed' },
            { value: 'care_task_done', label: 'Care Task Completed' },
            { value: 'enclosure_task_done', label: 'Cleaning Task Completed' },
            { value: 'reproduction_update', label: 'Reproductive Status Updated' },
        ];

        // targetType: 'management' is always included to scope logs to management panel only
        const currentFilters = { targetType: 'management', action: logFilterAction, search: logFilterSearch, startDate: logFilterStartDate, endDate: logFilterEndDate };

        const handleApplyFilters = () => {
            setActivityLogs([]);
            setLogsLoaded(false);
            fetchActivityLogs(1, currentFilters);
        };

        const handleResetFilters = () => {
            setLogFilterAction('');
            setLogFilterSearch('');
            setLogFilterStartDate('');
            setLogFilterEndDate('');
            setActivityLogs([]);
            setLogsLoaded(false);
            fetchActivityLogs(1, { targetType: 'management' });
        };

        return (
            <div className="mt-4 space-y-4">
                {/* Back + Refresh row */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowActivityLogScreen(false)}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition"
                    >
                        <ChevronLeft size={16} />
                        Back to Management
                    </button>
                    <button
                        onClick={() => { setLogsLoaded(false); fetchActivityLogs(1, currentFilters); }}
                        disabled={logsLoading}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                    >
                        <RefreshCw size={12} />
                        Refresh
                    </button>
                </div>

                {/* Title + total */}
                <div className="flex items-center gap-2">
                    <ScrollText size={18} className="text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Activity Log</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{logsPagination.total || 0} entries</span>
                </div>

                {/* Filter bar */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Action Type</label>
                            <select
                                value={logFilterAction}
                                onChange={e => setLogFilterAction(e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-indigo-400 focus:border-indigo-400"
                            >
                                {ACTION_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Search (animal name / ID)</label>
                            <input
                                type="text"
                                value={logFilterSearch}
                                onChange={e => setLogFilterSearch(e.target.value)}
                                onKeyPress={e => { if (e.key === 'Enter') handleApplyFilters(); }}
                                placeholder="e.g. Pixie or CT-00123"
                                className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-indigo-400 focus:border-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                            <input
                                type="date"
                                value={logFilterStartDate}
                                onChange={e => setLogFilterStartDate(e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-indigo-400 focus:border-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                            <input
                                type="date"
                                value={logFilterEndDate}
                                onChange={e => setLogFilterEndDate(e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-indigo-400 focus:border-indigo-400"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={handleResetFilters}
                            className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleApplyFilters}
                            disabled={logsLoading}
                            className="text-xs px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50"
                        >
                            {logsLoading ? 'Loading...' : 'Apply Filters'}
                        </button>
                    </div>
                </div>

                {/* Log entries */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {logsLoading && activityLogs.length === 0 ? (
                        <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="text-sm">Loading activity log...</span>
                        </div>
                    ) : activityLogs.length === 0 ? (
                        <div className="text-sm text-gray-400 text-center py-10">No activity found for the selected filters.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {activityLogs.map((log) => (
                                <div key={log._id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50">
                                    <span className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${getActionColor(log.action)}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-gray-800 font-medium">
                                            {getActionLabel(log.action)}
                                            {(log.details?.name || log.details?.enclosureName) && <span className="text-gray-500 font-normal"> ? <span className="font-medium text-gray-700">{log.details.name || log.details.enclosureName}</span></span>}
                                            {log.details?.species && !log.details?.name && <span className="text-gray-500 font-normal"> ({log.details.species})</span>}
                                            {log.details?.status && <span className="text-indigo-500 font-normal text-xs ml-1">({log.details.status})</span>}
                                        </div>
                                        {log.targetId_public && (
                                            <div className="text-xs text-gray-400 mt-0.5">{log.targetId_public}</div>
                                        )}
                                        {log.details && Object.keys(log.details).filter(k => !['name', 'species', 'status', 'enclosureName'].includes(k)).length > 0 && (
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                {(() => {
                                                    const entries = Object.entries(log.details)
                                                        .filter(([k]) => !['name', 'species', 'status', 'enclosureName'].includes(k))
                                                        .slice(0, 3)
                                                        .map(([k, v]) => `${k}: ${v}`);
                                                    const hasDeathField = Object.entries(log.details).some(([k]) => k.toLowerCase().includes('decease') || k.toLowerCase().includes('death'));
                                                    return entries.join(hasDeathField ? ' † ' : ' • ');
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400 flex-shrink-0 text-right ml-2">
                                        <div className="font-medium">{formatTimeAgo(log.createdAt)}</div>
                                        <div className="text-gray-300">{log.createdAt ? new Date(log.createdAt).toLocaleDateString() : ''}</div>
                                        {log.success === false && <div className="text-red-400 font-medium mt-0.5">failed</div>}
                                    </div>
                                </div>
                            ))}
                            {logsPagination.page < logsPagination.totalPages && (
                                <div className="p-3">
                                    <button
                                        onClick={() => fetchActivityLogs(logsPagination.page + 1, currentFilters)}
                                        disabled={logsLoading}
                                        className="w-full py-2 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition flex items-center justify-center gap-1 disabled:opacity-50"
                                    >
                                        {logsLoading ? <><Loader2 size={12} className="animate-spin" /> Loading...</> : `Load more (${activityLogs.length} of ${logsPagination.total})`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // -- Supplies & Inventory Screen ---------------------------------------------
    const renderSuppliesScreen = () => {
        const CATEGORIES = ['Food', 'Bedding', 'Medication', 'Other'];
        const CATEGORY_COLORS = {
            Food: 'bg-green-100 text-green-700',
            Bedding: 'bg-yellow-100 text-yellow-700',
            Medication: 'bg-red-100 text-red-700',
            Other: 'bg-gray-100 text-gray-600',
        };
        // Map supply category ? budget expense category
        const BUDGET_CATEGORY_MAP = { Food: 'food', Bedding: 'housing', Medication: 'medical', Other: 'other' };
        const isLow = (item) => item.reorderThreshold != null && item.currentStock <= item.reorderThreshold;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const isOverdue = (item) => item.nextOrderDate && new Date(item.nextOrderDate) < today;
        const isDueSoon = (item) => { if (!item.nextOrderDate) return false; const d = new Date(item.nextOrderDate); const diff = (d - today) / (1000 * 60 * 60 * 24); return diff >= 0 && diff <= 14; };
        const needsAttention = (item) => isLow(item) || isOverdue(item);
        const filtered = supplyCategoryFilter === 'All' ? supplies : supplies.filter(s => s.category === supplyCategoryFilter);
        const lowStockItems = supplies.filter(isLow);
        const overdueItems = supplies.filter(isOverdue);
        const attentionItems = supplies.filter(needsAttention);

        const handleSupplySubmit = async () => {
            if (!supplyForm.name.trim()) return;
            setSupplySaving(true);
            try {
                if (editingSupplyId) {
                    const res = await axios.patch(`${API_BASE_URL}/supplies/${editingSupplyId}`, supplyForm, { headers: { Authorization: `Bearer ${authToken}` } });
                    setSupplies(prev => prev.map(s => s._id === editingSupplyId ? res.data : s));
                } else {
                    const res = await axios.post(`${API_BASE_URL}/supplies`, supplyForm, { headers: { Authorization: `Bearer ${authToken}` } });
                    setSupplies(prev => [...prev, res.data]);
                }
                setSupplyForm({ name: '', category: 'Other', currentStock: '', unit: '', reorderThreshold: '', notes: '', isFeederAnimal: false, feederType: '', feederSize: '', costPerUnit: '', nextOrderDate: '', orderFrequency: '', orderFrequencyUnit: 'months' });
                setSupplyFormVisible(false);
                setEditingSupplyId(null);
            } catch (err) { console.error(err); }
            setSupplySaving(false);
        };

        const handleSupplyDelete = async (id) => {
            if (!window.confirm('Delete this supply item?')) return;
            try {
                await axios.delete(`${API_BASE_URL}/supplies/${id}`, { headers: { Authorization: `Bearer ${authToken}` } });
                setSupplies(prev => prev.filter(s => s._id !== id));
            } catch (err) { console.error(err); }
        };

        const handleSupplyEdit = (item) => {
            setSupplyForm({
                name: item.name,
                category: item.category,
                currentStock: item.currentStock ?? '',
                unit: item.unit || '',
                reorderThreshold: item.reorderThreshold ?? '',
                notes: item.notes || '',
                isFeederAnimal: item.isFeederAnimal || false,
                feederType: item.feederType || '',
                feederSize: item.feederSize || '',
                costPerUnit: item.costPerUnit ?? '',
                nextOrderDate: item.nextOrderDate ? new Date(item.nextOrderDate).toISOString().split('T')[0] : '',
                orderFrequency: item.orderFrequency ?? '',
                orderFrequencyUnit: item.orderFrequencyUnit || 'months',
            });
            setEditingSupplyId(item._id);
            setSupplyFormVisible(true);
        };

        const openRestock = (item) => {
            setRestockingSupplyId(item._id);
            // Auto-suggest cost from costPerUnit if it's a feeder animal
            const suggestCost = item.isFeederAnimal && item.costPerUnit ? '' : '';
            setRestockForm({ qty: '', cost: suggestCost, date: new Date().toISOString().slice(0, 10), notes: '' });
            setSupplyFormVisible(false);
            setEditingSupplyId(null);
        };

                        const handleRestockSubmit = async (item) => {
            const qty = parseFloat(restockForm.qty);
            const cost = parseFloat(restockForm.cost);
            if (!qty || qty <= 0 || !restockForm.cost || cost < 0) return;
            setRestockSaving(true);
            try {
                // 1. Update supply stock (and advance next order date if a schedule is set)
                const newStock = (item.currentStock || 0) + qty;
                const stockPatch = { currentStock: newStock };
                if (item.orderFrequency && item.orderFrequencyUnit) {
                    const base = new Date();
                    if (item.orderFrequencyUnit === 'days') base.setDate(base.getDate() + Number(item.orderFrequency));
                    else if (item.orderFrequencyUnit === 'weeks') base.setDate(base.getDate() + Number(item.orderFrequency) * 7);
                    else if (item.orderFrequencyUnit === 'months') base.setMonth(base.getMonth() + Number(item.orderFrequency));
                    stockPatch.nextOrderDate = base.toISOString().split('T')[0];
                }
                const supplyRes = await axios.patch(
                    `${API_BASE_URL}/supplies/${item._id}`,
                    stockPatch,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                setSupplies(prev => prev.map(s => s._id === item._id ? supplyRes.data : s));

                // 2. Log budget expense
                const feederLabel = item.isFeederAnimal && (item.feederType || item.feederSize)
                    ? ` · ${[item.feederType, item.feederSize].filter(Boolean).join(' ')}`
                    : '';
                await axios.post(
                    `${API_BASE_URL}/budget/transactions`,
                    {
                        type: 'expense',
                        price: cost,
                        date: restockForm.date || new Date().toISOString().slice(0, 10),
                        category: BUDGET_CATEGORY_MAP[item.category] || 'other',
                        description: `Supplies restock: ${item.name}${feederLabel} ($${qty}${item.unit ? ' ' + item.unit : ''})`,

                        notes: restockForm.notes || null,
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                setRestockingSupplyId(null);
            } catch (err) { console.error(err); }
            setRestockSaving(false);
        };

        return (
            <div className="mt-4 space-y-4">
                {/* Back + Refresh */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => { setShowSuppliesScreen(false); setSupplyFormVisible(false); setEditingSupplyId(null); }}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition"
                    >
                        <ChevronLeft size={16} />
                        Back to Management
                    </button>
                    <button onClick={fetchSupplies} disabled={suppliesLoading}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition disabled:opacity-50">
                        <RefreshCw size={12} /> Refresh
                    </button>
                </div>

                {/* Title + Add button */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package size={18} className="text-emerald-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Supplies &amp; Inventory</h3>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{supplies.length} item{supplies.length !== 1 ? 's' : ''}</span>
                    </div>
                    <button
                        onClick={() => { setSupplyForm({ name: '', category: 'Other', currentStock: '', unit: '', reorderThreshold: '', notes: '', isFeederAnimal: false, feederType: '', feederSize: '', costPerUnit: '', nextOrderDate: '', orderFrequency: '', orderFrequencyUnit: 'months' }); setEditingSupplyId(null); setSupplyFormVisible(v => !v); }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg font-medium transition"
                    >
                        <Plus size={14} /> Add Item
                    </button>
                </div>

                {/* Low stock alert */}
                {attentionItems.length > 0 && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <div className="text-sm text-amber-700 space-y-0.5">
                            {lowStockItems.length > 0 && <div><span className="font-semibold">Low stock:</span> {lowStockItems.map(i => i.name).join(', ')}</div>}
                            {overdueItems.length > 0 && <div><span className="font-semibold">Order overdue:</span> {overdueItems.map(i => i.name).join(', ')}</div>}
                        </div>
                    </div>
                )}

                {/* Add / Edit form */}
                {supplyFormVisible && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-emerald-800">{editingSupplyId ? 'Edit Item' : 'New Supply Item'}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Name *</label>
                                <input type="text" value={supplyForm.name} onChange={e => setSupplyForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Rat blocks" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
                                <select value={supplyForm.category} onChange={e => setSupplyForm(f => ({ ...f, category: e.target.value, isFeederAnimal: e.target.value === 'Food' ? f.isFeederAnimal : false }))} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Current Stock</label>
                                <input type="number" min="0" value={supplyForm.currentStock} onChange={e => setSupplyForm(f => ({ ...f, currentStock: e.target.value }))} placeholder="0" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Unit (e.g. bags, kg, boxes)</label>
                                <input type="text" value={supplyForm.unit} onChange={e => setSupplyForm(f => ({ ...f, unit: e.target.value }))} placeholder="bags" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Cost per unit</label>
                                <input type="number" min="0" step="0.01" value={supplyForm.costPerUnit} onChange={e => setSupplyForm(f => ({ ...f, costPerUnit: e.target.value }))} placeholder="0.00" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Reorder when stock reaches</label>
                                <input type="number" min="0" value={supplyForm.reorderThreshold} onChange={e => setSupplyForm(f => ({ ...f, reorderThreshold: e.target.value }))} placeholder="e.g. 2" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
                                    <input type="text" value={supplyForm.notes} onChange={e => setSupplyForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400" />
                            </div>
                        </div>
                        {/* Schedule-based reorder */}
                        <div className="border-t border-emerald-200 pt-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-600">Reorder Schedule <span className="font-normal text-gray-400">(optional ? for bulk or timed items)</span></p>
                            <p className="text-[11px] text-gray-400">Set a date &amp; repeat frequency for items ordered on a schedule, regardless of stock count ? e.g. a 650 L bedding pallet every 3 months.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Next order date</label>
                                    <input type="date" value={supplyForm.nextOrderDate} onChange={e => setSupplyForm(f => ({ ...f, nextOrderDate: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Repeat every</label>
                                    <input type="number" min="1" value={supplyForm.orderFrequency} onChange={e => setSupplyForm(f => ({ ...f, orderFrequency: e.target.value }))} placeholder="e.g. 3" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Frequency unit</label>
                                    <select value={supplyForm.orderFrequencyUnit} onChange={e => setSupplyForm(f => ({ ...f, orderFrequencyUnit: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400">
                                        <option value="days">Days</option>
                                        <option value="weeks">Weeks</option>
                                        <option value="months">Months</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        {/* Feeder animal toggle (Food only) */}
                        {supplyForm.category === 'Food' && (
                            <div className="col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" checked={supplyForm.isFeederAnimal} onChange={e => setSupplyForm(f => ({ ...f, isFeederAnimal: e.target.checked }))} className="w-4 h-4 accent-emerald-600" />
                                    <span className="text-sm font-medium text-gray-700">This is a feeder animal (mice, rats, crickets, etc.)</span>
                                </label>
                            </div>
                        )}
                        {supplyForm.category === 'Food' && supplyForm.isFeederAnimal && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Feeder Type</label>
                                    <input type="text" value={supplyForm.feederType} onChange={e => setSupplyForm(f => ({ ...f, feederType: e.target.value }))} list="feeder-type-list" placeholder="e.g. Mice, Rats" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                                    <datalist id="feeder-type-list"><option value="Mice" /><option value="Rats" /><option value="Gerbils" /><option value="Crickets" /><option value="Dubia Roaches" /><option value="Mealworms" /><option value="Superworms" /><option value="Waxworms" /><option value="Hornworms" /><option value="Fish" /></datalist>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Size</label>
                                    <input type="text" value={supplyForm.feederSize} onChange={e => setSupplyForm(f => ({ ...f, feederSize: e.target.value }))} list="feeder-size-list" placeholder="e.g. Pinky, Adult" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                                    <datalist id="feeder-size-list"><option value="Pinky" /><option value="Fuzzy" /><option value="Hopper" /><option value="Weaned" /><option value="Adult" /><option value="Small" /><option value="Medium" /><option value="Large" /><option value="XL" /></datalist>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2 justify-end pt-1">
                            <button onClick={() => { setSupplyFormVisible(false); setEditingSupplyId(null); }} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                            <button onClick={handleSupplySubmit} disabled={supplySaving || !supplyForm.name.trim()} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-1.5">
                                {supplySaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                {editingSupplyId ? 'Save Changes' : 'Add Item'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Category filter pills */}
                <div className="flex gap-1.5 flex-wrap">
                    {['All', ...CATEGORIES].map(cat => (
                        <button key={cat} onClick={() => setSupplyCategoryFilter(cat)}
                            className={`px-3 py-1 text-xs rounded-full font-medium transition ${supplyCategoryFilter === cat ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >{cat}</button>
                    ))}
                </div>

                {/* Items grid */}
                {suppliesLoading ? (
                    <div className="flex items-center justify-center py-12 text-gray-400 gap-2"><Loader2 size={20} className="animate-spin" /> Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">
                        {supplies.length === 0 ? 'No supplies added yet. Click "Add Item" to get started.' : `No ${supplyCategoryFilter} items.`}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filtered.map(item => (
                            <div key={item._id} className={`border rounded-xl p-3 bg-white flex flex-col gap-1.5 shadow-sm ${isLow(item) ? 'border-amber-300' : 'border-gray-200'}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                        <span className="font-semibold text-sm text-gray-800 truncate">{item.name}</span>
                                        {isLow(item) && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">Low Stock</span>}
                                        {isOverdue(item) && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">Order Due</span>}
                                        {!isOverdue(item) && isDueSoon(item) && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">Order Soon</span>}
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other}`}>{item.category}</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-lg font-bold ${isLow(item) ? 'text-amber-600' : 'text-gray-800'}`}>{item.currentStock}</span>
                                    {item.unit && <span className="text-gray-500 text-xs">{item.unit}</span>}
                                    {item.reorderThreshold != null && <span className="text-gray-400 text-xs ml-auto">Reorder at {item.reorderThreshold}</span>}
                                </div>
                                {item.notes && <p className="text-xs text-gray-400 truncate">{item.notes}</p>}
                                {(item.isFeederAnimal || item.costPerUnit != null) && (
                                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                                        {item.isFeederAnimal && item.feederType && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{item.feederType}</span>}
                                        {item.isFeederAnimal && item.feederSize && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{item.feederSize}</span>}
                                        {item.costPerUnit != null && <span className="text-xs text-gray-400">${Number(item.costPerUnit).toFixed(2)} / {item.unit || 'unit'}</span>}
                                    </div>
                                )}
                                {item.nextOrderDate && (
                                    <div className={`flex items-center gap-1.5 text-xs rounded-lg px-2 py-1.5 mt-0.5 ${isOverdue(item) ? 'bg-red-50 text-red-600' : isDueSoon(item) ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>
                                        <Calendar size={11} className="shrink-0" />
                                        <span>Next order: {new Date(item.nextOrderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        {item.orderFrequency && <span className="opacity-60"> <RefreshCw size={12} className="inline-block align-middle mr-0.5" /> every {item.orderFrequency} {item.orderFrequencyUnit}</span>}
                                    </div>
                                )}

                                {/* Inline restock form */}
                                {restockingSupplyId === item._id && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mt-1 space-y-2">
                                        <p className="text-xs font-semibold text-blue-700">Restock · logs an expense in Budget{item.isFeederAnimal ? ` · ${[item.feederType, item.feederSize].filter(Boolean).join(' ')}` : ''}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 block mb-0.5">Qty received *</label>
                                                <input type="number" min="0.01" step="any" value={restockForm.qty} onChange={e => {
                                                    const q = e.target.value;
                                                    const autoCost = item.costPerUnit && q ? (parseFloat(q) * item.costPerUnit).toFixed(2) : restockForm.cost;
                                                    setRestockForm(f => ({ ...f, qty: q, cost: autoCost }));
                                                }} placeholder="e.g. 5" className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 block mb-0.5">Cost paid *</label>
                                                <input type="number" min="0" step="0.01" value={restockForm.cost} onChange={e => setRestockForm(f => ({ ...f, cost: e.target.value }))} placeholder="0.00" className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 block mb-0.5">Date</label>
                                                <input type="date" value={restockForm.date} onChange={e => setRestockForm(f => ({ ...f, date: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 block mb-0.5">Notes</label>
                                                <input type="text" value={restockForm.notes} onChange={e => setRestockForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => setRestockingSupplyId(null)} className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                                            <button
                                                onClick={() => handleRestockSubmit(item)}
                                                disabled={restockSaving || !restockForm.qty || !restockForm.cost}
                                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-1"
                                            >
                                                {restockSaving ? <Loader2 size={11} className="animate-spin" /> : <ShoppingBag size={11} />}
                                                Log Restock
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 justify-end mt-0.5">
                                    <button onClick={() => openRestock(item)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-lg transition font-medium"><ShoppingBag size={11} /> Restock</button>
                                    <button onClick={() => handleSupplyEdit(item)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-lg transition"><Edit size={11} /> Edit</button>
                                    <button onClick={() => handleSupplyDelete(item._id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition"><Trash2 size={11} /> Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
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
                        Back to Management
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
                archivedAnimals={archivedAnimals}
                soldTransferredAnimals={soldTransferredRaw.filter(a => a.isViewOnly)}
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

    const SectionHeader = ({ sectionKey, icon, title, count, bgClass, onClick }) => {
        const collapsed = collapsedMgmtSections[sectionKey] || false;
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
        const allOwnedAnimals = animals.filter(a => a.isOwned !== false);
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
                                            ) : (
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
                                <div className="border border-dashed border-gray-300 rounded-xl overflow-hidden">
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
                                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                                                {uncategorized.map(animal => (
                                                    <div key={animal.id_public} className="relative" onClick={e => { if (assigningCollectionAnimalId === animal.id_public) e.stopPropagation(); }}>
                                                        <AnimalCard animal={animal} onEditAnimal={onEditAnimal} species={animal.species} isSelectable={false} isSelected={false} onToggleSelect={() => {}} onTogglePrivacy={toggleAnimalPrivacy} onToggleOwned={toggleAnimalOwned} />
                                                        <div className="absolute top-1 right-1 z-20">
                                                            {assigningCollectionAnimalId === animal.id_public && (
                                                                <div
                                                                    className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[150px] z-30"
                                                                    onClick={e => e.stopPropagation()}
                                                                >
                                                                    <p className="text-xs font-semibold text-gray-600 mb-1.5">Add to collection:</p>
                                                                    {userCollections.map(col => (
                                                                        <button
                                                                            key={col.id}
                                                                            onClick={() => { assignAnimalToCollection(animal.id_public, col.id); setAssigningCollectionAnimalId(null); }}
                                                                            className="w-full text-left text-xs px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-1.5 text-gray-700"
                                                                        >
                                                                            <FolderOpen size={11} className="text-amber-500" /> {col.name}
                                                                        </button>
                                                                    ))}
                                                                    <button onClick={() => setAssigningCollectionAnimalId(null)} className="w-full text-left text-xs px-2 py-1 hover:bg-gray-100 rounded text-gray-400 mt-1">Cancel</button>
                                                                </div>
                                                            )}
                                                            <button
                                                                onClick={e => { e.stopPropagation(); setAssigningCollectionAnimalId(prev => prev === animal.id_public ? null : animal.id_public); }}
                                                                className="bg-white/90 hover:bg-amber-50 text-amber-500 hover:text-amber-700 rounded-full p-0.5 shadow-sm border border-gray-200"
                                                                title="Add to a collection"
                                                            >
                                                                <Plus size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
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

    // -- Management View ----------------------------------------------------------
    const renderManagementView = () => {
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
                    logManagementActivity('enclosure_update', null, { name: enclosureFormData.name.trim() });
                } else {
                    await axios.post(`${API_BASE_URL}/enclosures`, enclosureFormData,
                        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } });
                    logManagementActivity('enclosure_create', null, { name: enclosureFormData.name.trim() });
                }
                setEnclosureFormVisible(false);
                setEditingEnclosureId(null);
                setEnclosureFormData({ name: '', enclosureType: '', size: '', notes: '', cleaningTasks: [] });
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
                logManagementActivity('enclosure_delete', null, { name: encToDelete?.name || encId });
                fetchEnclosures();
                fetchAnimals();
            } catch (err) {
                showModalMessage('Error', err.response?.data?.message || 'Failed to delete enclosure');
            }
        };

        const handleAssignAnimalToEnclosure = async (animalIdPublic, enclosureId) => {
            try {
                await axios.put(`${API_BASE_URL}/animals/${animalIdPublic}`,
                    { enclosureId: enclosureId || null },
                    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } });
                const encName = enclosureId ? (enclosures.find(e => e._id === enclosureId)?.name || enclosureId) : null;
                logManagementActivity(
                    enclosureId ? 'enclosure_assign' : 'enclosure_unassign',
                    animalIdPublic,
                    enclosureId ? { enclosureName: encName } : {}
                );
                fetchAnimals();
            } catch (err) { console.error('Assign enclosure failed:', err); }
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
                logManagementActivity('animal_fed', animal.id_public, {
                    name: animal.name,
                    species: animal.species,
                    ...(supplyItem ? { food: supplyItem.name, qty: `${feedingForm.qty} ${supplyItem.unit || ''}`.trim() } : {})
                });
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
            try {
                await axios.post(`${API_BASE_URL}/animals/${animal.id_public}/feeding`,
                    { skipped: true },
                    { headers: { Authorization: `Bearer ${authToken}` } });
                logManagementActivity('feeding_skipped', animal.id_public, { name: animal.name, species: animal.species });
            } catch (err) {
                console.error('Skip feeding failed:', err);
                setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, lastFedDate: animal.lastFedDate } : a));
            }
        };

        const handleMarkMaintDone = (e, animal) => {
            e.stopPropagation();
            const now = new Date().toISOString();
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, lastMaintenanceDate: now } : a));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`,
                { lastMaintenanceDate: now },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .then(() => logManagementActivity('care_task_done', animal.id_public, { name: animal.name, taskName: 'General maintenance' }))
                .catch(err => { console.error('Mark maintenance failed:', err); setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, lastMaintenanceDate: animal.lastMaintenanceDate } : a)); });
        };

        const parseArrayField = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            try { return JSON.parse(val); } catch { return [{ name: String(val) }]; }
        };

        // -- Section data ---------------------------------------------------------
        // Exclude deceased animals from all management sections
        const allAnimals = allAnimalsRaw.filter(a => a.status !== 'Deceased');
        // 1. Enclosures ? grouped by named enclosure (enclosureId)
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

        // 2. Reproduction
        const matingList = allAnimals.filter(a => a.isInMating);
        const pregnantList = allAnimals.filter(a => a.isPregnant && !a.isInMating);
        const nursingList = allAnimals.filter(a => a.isNursing);
        const reproTotal = allAnimals.filter(a => a.isInMating || a.isPregnant || a.isNursing).length;

        // 3. Feeding
        const feedDue = allAnimals.filter(a => isDue(a.lastFedDate, a.feedingFrequencyDays));
        const feedOk = allAnimals.filter(a => a.feedingFrequencyDays && !isDue(a.lastFedDate, a.feedingFrequencyDays));
        const feedNone = allAnimals.filter(a => !a.feedingFrequencyDays);

        // 4. Maintenance ? enclosure cleaning tasks + supply reorders + housing care tasks per animal
        const enclosuresWithCleaningTasks = enclosures.filter(enc => enc.cleaningTasks?.length > 0);
        const animalsWithAnimalTasks = allAnimals.filter(a => a.animalCareTasks?.length > 0);
        const animalsWithEnclosureCareTasks = allAnimals.filter(a => (a.careTasks?.length > 0) || (a.maintenanceFrequencyDays));
        const todayMaint = new Date(); todayMaint.setHours(0, 0, 0, 0);
        const supplyReorderDue = supplies.filter(s =>
            (s.reorderThreshold != null && s.currentStock <= s.reorderThreshold) ||
            (s.nextOrderDate && new Date(s.nextOrderDate) < todayMaint)
        );
        const enclosureCarTasksDue = animalsWithEnclosureCareTasks.reduce((sum, a) => sum + (a.careTasks || []).filter(t => isDue(t.lastDoneDate, t.frequencyDays)).length, 0);
        const maintMaintenanceDue = allAnimals.filter(a => a.maintenanceFrequencyDays && isDue(a.lastMaintenanceDate, a.maintenanceFrequencyDays)).length;
        const maintTotalDue = enclosuresWithCleaningTasks.reduce((sum, enc) => sum + enc.cleaningTasks.filter(t => isDue(t.lastDoneDate, t.frequencyDays)).length, 0) + supplyReorderDue.length + enclosureCarTasksDue + maintMaintenanceDue;
        const animalCareDue = feedDue.length + animalsWithAnimalTasks.reduce((sum, a) => sum + (a.animalCareTasks || []).filter(t => isDue(t.lastDoneDate, t.frequencyDays)).length, 0);

        // 5. Medical ? quarantine and treatment
        const quarantineList = allAnimals.filter(a => a.isQuarantine);
        const treatmentList = allAnimals.filter(a => !a.isQuarantine && (

            parseArrayField(a.medicalConditions).length > 0 || parseArrayField(a.medications).length > 0
        ));

        // 6. Available for sale/rehoming ? all user-created animals with status=Available (no ownership filter)
        const availableList = availableAnimalsRaw.filter(a => a.status === 'Available');

        // 7. Sold / Transferred ? view-only animals (transferred through the system, original owner retains view access)
        const soldList = soldTransferredRaw.filter(a => a.isViewOnly);

        const handleMarkRehomed = (e, animal) => {
            e.stopPropagation();
            if (!window.confirm(`Mark ${animal.name || 'this animal'} as Rehomed? This will change their status to "Rehomed".`)) return;
            // Optimistic update
            setAvailableAnimalsRaw(prev => prev.filter(a => a.id_public !== animal.id_public));
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, status: 'Rehomed' } : a));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { status: 'Rehomed' },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .then(() => logManagementActivity('status_change', animal.id_public, { name: animal.name, species: animal.species, status: 'Rehomed' }))
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
                .then(() => logManagementActivity('enclosure_task_done', null, { name: enc.name, taskName: updated[taskIdx]?.taskName || 'Cleaning task' }))
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
                .then(() => logManagementActivity('enclosure_task_skipped', null, { name: enc.name, taskName }))
                .catch(err => { console.error('Skip enclosure task failed:', err); fetchEnclosures(); });
        };

        const handleMarkAnimalCareTaskDone = (e, animal, taskIdx, taskType = 'enclosure') => {
            e.stopPropagation();
            const fieldName = taskType === 'animal' ? 'animalCareTasks' : 'careTasks';
            const updated = [...(animal[fieldName] || [])];
            updated[taskIdx] = { ...updated[taskIdx], lastDoneDate: new Date().toISOString() };
            // Optimistic update
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, [fieldName]: updated } : a));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { [fieldName]: updated },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .then(() => logManagementActivity('care_task_done', animal.id_public, { name: animal.name, taskName: updated[taskIdx]?.taskName || 'Care task' }))
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
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { [fieldName]: updated },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .then(() => logManagementActivity('care_task_skipped', animal.id_public, { name: animal.name, taskName }))
                .catch(err => { console.error('Skip animal care task failed:', err); fetchAllAnimals(); });
        };

        const handleUnquarantine = (e, animal) => {
            e.stopPropagation();
            if (!window.confirm(`Release ${animal.name || 'this animal'} from quarantine?`)) return;
            // Optimistic update
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, isQuarantine: false } : a));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { isQuarantine: false },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .then(() => logManagementActivity('quarantine_released', animal.id_public, { name: animal.name, species: animal.species }))
                .catch(err => { console.error('Unquarantine failed:', err); setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, isQuarantine: true } : a)); });
        };

        const handleReproStatusUpdate = (e, animal, patch) => {
            e.stopPropagation();
            // Optimistic update
            setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, ...patch } : a));
            axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, patch,
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
                .then(() => {
                    let reproStatus = 'Status changed';
                    if (patch.isInMating === false && patch.isPregnant === true) reproStatus = 'Confirmed Pregnant';
                    else if (patch.isPregnant === false && patch.isNursing === true) reproStatus = 'Started Nursing';
                    else if (patch.isInMating === false) reproStatus = 'Cleared Mating';
                    else if (patch.isPregnant === false) reproStatus = 'Cleared Pregnancy';
                    else if (patch.isNursing === false) reproStatus = 'Cleared Nursing';
                    logManagementActivity('reproduction_update', animal.id_public, { name: animal.name, species: animal.species, status: reproStatus });
                })
                .catch(err => { console.error('Repro status update failed:', err); setAllAnimalsRaw(prev => prev.map(a => a.id_public === animal.id_public ? { ...a, ...Object.fromEntries(Object.keys(patch).map(k => [k, animal[k]])) } : a)); });
        };

        return (
            <div className="space-y-3 sm:space-y-4 mt-4">

                {/* -- 1. ENCLOSURES ------------------------------------------ */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Section header ? collapse on click, Add button on right */}
                    <div className="relative flex items-center justify-between bg-blue-50 px-3 py-2.5 sm:px-4 sm:py-3 border-b cursor-pointer" onClick={() => toggleSection('enclosures')}>
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
                                else { setEnclosureFormData({ name: '', enclosureType: '', size: '', notes: '', cleaningTasks: [] }); setEnclosureFormVisible(v => !v); }
                            }}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-2 py-1 rounded-lg"
                        >
                            <Plus size={13} /> {enclosureFormVisible && !editingEnclosureId ? 'Cancel' : 'Add'}
                        </button>
                    </div>

                    {/* Inline create / edit form */}
                    {enclosureFormVisible && !collapsedMgmtSections['enclosures'] && (
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

                    {!collapsedMgmtSections['enclosures'] && (
                        <div className="p-3 space-y-2">
                            {enclosures.length === 0 && unassignedAnimals.length === 0 ? (
                                <div className="text-sm text-gray-400 text-center py-4">No enclosures yet. Click Add to create your first enclosure.</div>
                            ) : (
                                <>
                                    {/* Named enclosures */}
                                    {enclosures.map(enc => {
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
                                                                setEnclosureFormData({ name: enc.name, enclosureType: enc.enclosureType || '', size: enc.size || '', notes: enc.notes || '', cleaningTasks: enc.cleaningTasks || [] });
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
                                                    <div className="p-2 space-y-1.5 bg-white">
                                                        {occupants.length === 0
                                                            ? <div className="text-xs text-gray-400 text-center py-2">No animals assigned yet</div>
                                                            : occupants.map(a => (
                                                                <MgmtAnimalCard key={a._id || a.id_public} animal={a}
                                                                    extras={
                                                                        <button onClick={(e) => { e.stopPropagation(); handleAssignAnimalToEnclosure(a.id_public, ''); }}
                                                                            className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded px-1.5 py-0.5 shrink-0">
                                                                            Remove
                                                                        </button>
                                                                    }
                                                                />
                                                            ))
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
                                                <div className="p-2 space-y-1.5 bg-white">
                                                    {unassignedAnimals.map(a => (
                                                        <MgmtAnimalCard key={a._id || a.id_public} animal={a}
                                                            extras={
                                                                enclosures.length > 0 ? (
                                                                    assigningAnimalId === a.id_public ? (
                                                                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                                                            <select autoFocus defaultValue=""
                                                                                onChange={e => { if (e.target.value) { handleAssignAnimalToEnclosure(a.id_public, e.target.value); } setAssigningAnimalId(null); }}
                                                                                onBlur={() => setAssigningAnimalId(null)}
                                                                                className="text-xs border border-blue-300 rounded p-1 max-w-[130px]">
                                                                                <option value="" disabled>Select enclosure...</option>
                                                                                {enclosures.map(enc => <option key={enc._id} value={enc._id}>{enc.name}</option>)}
                                                                            </select>
                                                                        </div>
                                                                    ) : (
                                                                        <button onClick={(e) => { e.stopPropagation(); setAssigningAnimalId(a.id_public); }}
                                                                            className="text-xs text-blue-500 hover:text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 shrink-0 whitespace-nowrap">
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

                {/* -- 2. REPRODUCTION ---------------------------------------- */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <SectionHeader sectionKey="reproduction"
                        icon={<Bean size={18} className="text-pink-600" />}
                        title="Reproduction" count={reproTotal} bgClass="bg-pink-50" />
                    {!collapsedMgmtSections['reproduction'] && (
                        <div className="p-3 space-y-2">
                            {reproTotal === 0
                                ? <div className="text-sm text-gray-400 text-center py-4">No animals currently in a reproductive state.</div>
                                : <>
                                    {matingList.length > 0 && (
                                        <MgmtGroup groupKey="repro_mating" label="In Mating"
                                            groupAnimals={matingList} headerClass="bg-purple-50"
                                            renderExtras={(a) => (
                                                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                                    {a.matingDate && <div className="text-xs text-gray-400 hidden sm:block">Since {formatDateShort(a.matingDate)}</div>}
                                                    {a.gender !== 'Male' && <button onClick={(e) => handleReproStatusUpdate(e, a, { isInMating: false, isPregnant: true })}
                                                        className="text-xs px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200 whitespace-nowrap flex items-center gap-0.5"><Bean size={10} className="flex-shrink-0" /> Set as Pregnant</button>}
                                                    <button onClick={(e) => handleReproStatusUpdate(e, a, { isInMating: false })}
                                                        className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200">Clear</button>
                                                </div>
                                            )} />
                                    )}
                                    {pregnantList.length > 0 && (
                                        <MgmtGroup groupKey="repro_pregnant" label="Pregnant / Gravid"
                                            groupAnimals={pregnantList} headerClass="bg-pink-50"
                                            renderExtras={(a) => (
                                                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                                    {a.expectedDueDate && <div className="text-xs text-gray-400 hidden sm:block">Due {formatDateShort(a.expectedDueDate)}</div>}
                                                    {a.gender !== 'Male' && <button onClick={(e) => handleReproStatusUpdate(e, a, { isPregnant: false, isNursing: true })}
                                                        className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 whitespace-nowrap flex items-center gap-0.5"><Milk size={10} className="flex-shrink-0" /> Set as Nursing</button>}
                                                    <button onClick={(e) => handleReproStatusUpdate(e, a, { isPregnant: false })}
                                                        className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200">Clear</button>
                                                </div>
                                            )} />
                                    )}
                                    {nursingList.length > 0 && (
                                        <MgmtGroup groupKey="repro_nursing" label="Nursing / Brooding"
                                            groupAnimals={nursingList} headerClass="bg-blue-50"
                                            renderExtras={(a) => (
                                                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                                    <button onClick={(e) => handleReproStatusUpdate(e, a, { isNursing: false })}
                                                        className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 flex items-center gap-0.5"><Check size={10} className="flex-shrink-0" /> Done</button>
                                                </div>
                                            )} />
                                    )}
                                </>
                            }
                        </div>
                    )}
                </div>

                {/* -- 3. ANIMAL CARE ----------------------------------------- */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <SectionHeader sectionKey="feeding"
                        icon={<Utensils size={18} className="text-green-600" />}
                        title="Animal Care" count={animalCareDue > 0 ? `${animalCareDue} due` : animals.length} bgClass="bg-green-50" />
                    {!collapsedMgmtSections['feeding'] && (
                        <div className="divide-y divide-gray-100">
                            {/* -- Daily / Routine -- */}
                            <div>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wide">Daily / Routine</div>
                                <div className="p-3 space-y-2">
                                    {feedDue.length > 0 && (
                                        <MgmtGroup groupKey="feed_due" label="Due Today / Overdue"
                                            groupAnimals={feedDue} headerClass="bg-red-50"
                                            renderExtras={(a) => (
                                                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                                                    <div className="text-xs text-gray-400 text-right whitespace-nowrap hidden sm:block">
                                                        {a.dietType && <div>{a.dietType}</div>}
                                                        {a.lastFedDate
                                                            ? <div>Last: {formatDateShort(a.lastFedDate)}</div>
                                                            : <div className="text-orange-500">Never fed</div>}
                                                        {a.feedingFrequencyDays && <div>Every {a.feedingFrequencyDays}d</div>}
                                                    </div>
                                                    <button onClick={(e) => handleMarkFed(e, a)}
                                                        className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap">
                                                        ? Fed
                                                    </button>
                                                    <button onClick={(e) => handleSkipFeeding(e, a)}
                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap border border-gray-200">
                                                        ?? Skip
                                                    </button>
                                                </div>
                                            )} />
                                    )}
                                    {feedOk.length > 0 && (
                                        <MgmtGroup groupKey="feed_ok" label="Up to Date"
                                            groupAnimals={feedOk} headerClass="bg-green-50"
                                            renderExtras={(a) => (
                                                <div className="text-xs text-gray-400 text-right whitespace-nowrap shrink-0">
                                                    {a.lastFedDate && <div>Last: {formatDateShort(a.lastFedDate)}</div>}
                                                    {a.feedingFrequencyDays && <div> <RefreshCw size={12} className="inline-block align-middle mr-0.5" /> Every {a.feedingFrequencyDays}d</div>}
                                                </div>
                                            )} />
                                    )}
                                    {feedNone.length > 0 && (
                                        <MgmtGroup groupKey="feed_none" label="No Schedule Set"
                                            groupAnimals={feedNone} headerClass="bg-gray-100"
                                            renderExtras={(a) => a.dietType
                                                ? <div className="text-xs text-gray-400 shrink-0 truncate max-w-[100px]">{a.dietType}</div>
                                                : null} />
                                    )}
                                    {feedDue.length === 0 && feedOk.length === 0 && feedNone.length === 0 && (
                                        <div className="text-sm text-gray-400 text-center py-4">No animals with a feeding schedule.</div>
                                    )}
                                </div>
                            </div>
                            {/* -- Scheduled Care (Animal Care Tasks only) -- */}
                            <div>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wide">Scheduled Care</div>
                                {animalsWithAnimalTasks.length === 0 ? (
                                    <div className="px-3 py-4 text-xs text-gray-400 text-center">No animal care tasks. Edit an animal and add tasks in the Animal Care tab.</div>
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
                        </div>
                    )}
                </div>

                {/* -- 4. MAINTENANCE ----------------------------------------- */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <SectionHeader sectionKey="maintenance"
                        icon={<Wrench size={18} className="text-amber-600" />}
                        title="Maintenance" count={`${maintTotalDue} due`} bgClass="bg-amber-50" />
                    {!collapsedMgmtSections['maintenance'] && (
                        <div className="divide-y divide-gray-100">
                            {/* -- Housing Maintenance (animal enclosure care tasks + maintenance schedule) -- */}
                            <div>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wide">Housing Maintenance</div>
                                {animalsWithEnclosureCareTasks.length === 0 ? (
                                    <div className="px-3 py-4 text-xs text-gray-400 text-center">No housing maintenance tasks. Edit an animal and add tasks in the Housing tab.</div>
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
                                })}
                            </div>

                            {/* -- Enclosure Cleaning -- */}
                            <div>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wide">Enclosure Cleaning</div>
                                {enclosuresWithCleaningTasks.length === 0 ? (
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
                                })}
                            </div>

                            {/* -- Supplies & Inventory -- */}
                            <div>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wide flex items-center justify-between">
                                    <span>Supplies &amp; Inventory</span>
                                    {suppliesLoading
                                        ? <Loader2 size={11} className="animate-spin text-gray-400" />
                                        : <span className="text-gray-400 font-normal normal-case">
                                            {supplies.length} item{supplies.length !== 1 ? 's' : ''}
                                            {supplyReorderDue.length > 0 && <span className="ml-1 text-amber-600 font-semibold"><AlertCircle size={12} className="inline-block align-middle mr-0.5" /> {supplyReorderDue.length} to reorder</span>}
                                          </span>
                                    }
                                </div>
                                {supplies.length === 0 ? (
                                    <div className="px-3 py-3 flex items-center justify-between">
                                        <span className="text-xs text-gray-400">No items tracked yet.</span>
                                        <button onClick={() => { setSupplyFormVisible(false); setEditingSupplyId(null); setShowSuppliesScreen(true); }} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 font-medium transition"><Package size={12} /> View All</button>
                                    </div>
                                ) : (
                                    <div className="px-3 py-2 space-y-1.5">
                                        {supplyReorderDue.length > 0 ? (
                                            supplyReorderDue.map(s => {
                                                const isDate = s.nextOrderDate && new Date(s.nextOrderDate) < todayMaint;
                                                const isStock = s.reorderThreshold != null && s.currentStock <= s.reorderThreshold;
                                                return (
                                                    <div key={s._id} className="flex items-center justify-between gap-2 text-sm">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="w-2 h-2 rounded-full flex-shrink-0 bg-red-500" />
                                                            <span className="text-gray-700 truncate">{s.name}</span>
                                                            {s.unit && <span className="text-gray-400 text-xs">{s.unit}</span>}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            {isStock && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Low stock: {s.currentStock}</span>}
                                                            {isDate && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Order due</span>}
                                                            <button onClick={() => { setSupplyFormVisible(false); setEditingSupplyId(null); setShowSuppliesScreen(true); }} className="text-xs px-2 py-0.5 rounded font-medium border bg-amber-500 text-white hover:bg-amber-600 border-amber-500">Reorder</button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-xs text-gray-400 py-1">{supplies.length} item{supplies.length !== 1 ? 's' : ''} tracked • all stocked</p>
                                        )}
                                        <div className="flex justify-end pt-0.5">
                                            <button onClick={() => { setSupplyFormVisible(false); setEditingSupplyId(null); setShowSuppliesScreen(true); }} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 font-medium transition"><Package size={12} /> View All</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* -- 5. MEDICAL / QUARANTINE -------------------------------- */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <SectionHeader sectionKey="medical"
                        icon={<Activity size={18} className="text-red-600" />}
                        title="Medical / Quarantine" count={quarantineList.length + treatmentList.length} bgClass="bg-red-50" />
                    {!collapsedMgmtSections['medical'] && (
                        <div className="p-3 space-y-2">
                            {quarantineList.length === 0 && treatmentList.length === 0
                                ? <div className="text-sm text-gray-400 text-center py-4">No animals in quarantine or under treatment.</div>
                                : <>
                                    {quarantineList.length > 0 && (
                                        <MgmtGroup groupKey="med_quarantine" label="Quarantine / Isolation"
                                            groupAnimals={quarantineList} headerClass="bg-orange-50"
                                            renderExtras={(a) => {
                                                const conds = parseArrayField(a.medicalConditions);
                                                return (
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        {conds.length > 0
                                                            ? <div className="text-xs text-orange-600 max-w-[100px] truncate">{conds.map(c => c.name || c).join(', ')}</div>
                                                            : <span className="text-xs text-orange-400">Quarantine</span>}
                                                        <button
                                                            onClick={(e) => handleUnquarantine(e, a)}
                                                            className="text-xs px-2 py-0.5 rounded font-medium border bg-green-500 text-white hover:bg-green-600 border-green-500 whitespace-nowrap"
                                                            title="Release from quarantine"
                                                        >
                                                            <LockOpen size={14} className="inline-block align-middle mr-1" /> Release
                                                        </button>
                                                    </div>
                                                );
                                            }} />
                                    )}
                                    {treatmentList.length > 0 && (
                                        <MgmtGroup groupKey="med_treatment" label="Under Treatment"
                                            groupAnimals={treatmentList} headerClass="bg-red-50"
                                            renderExtras={(a) => {
                                                const conds = parseArrayField(a.medicalConditions);
                                                const meds = parseArrayField(a.medications);
                                                return (
                                                    <div className="text-xs text-right shrink-0 max-w-[140px]">
                                                        {conds.length > 0 && <div className="text-gray-500 truncate">{conds.map(c => c.name || c).join(', ')}</div>}
                                                        {meds.length > 0 && <div className="text-blue-500 truncate">{meds.map(m => m.name || m).join(', ')}</div>}
                                                    </div>
                                                );
                                            }} />
                                    )}
                                </>
                            }
                        </div>
                    )}
                </div>

                {/* -- 6. FOR SALE / AVAILABLE -------------------------------- */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <SectionHeader sectionKey="available"
                        icon={<ShoppingBag size={18} className="text-purple-600" />}
                        title="For Sale / Available" count={availableList.length} bgClass="bg-purple-50" />
                    {!collapsedMgmtSections['available'] && (
                        <div className="p-3 space-y-1.5">
                            {availableList.length === 0
                                ? <div className="text-sm text-gray-400 text-center py-4">No animals currently marked as Available.</div>
                                : availableList.map(a => (
                                    <MgmtAnimalCard key={a._id || a.id_public} animal={a} extras={
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {a.isForSale && a.salePriceAmount && (
                                                <span className="text-xs text-purple-600 font-medium whitespace-nowrap">
                                                    {a.salePriceCurrency === 'Negotiable' ? 'Negotiable' : `${a.salePriceCurrency || ''} ${a.salePriceAmount}`.trim()}
                                                </span>
                                            )}
                                            <button
                                                onClick={(e) => handleMarkRehomed(e, a)}
                                                className="text-xs px-2 py-0.5 rounded font-medium border bg-indigo-500 text-white hover:bg-indigo-600 border-indigo-500 whitespace-nowrap"
                                                title="Mark as Rehomed / Sold"
                                            >
                                                <Check size={14} className="inline-block align-middle mr-0.5" /> Rehomed
                                            </button>
                                        </div>
                                    } />
                                ))
                            }
                        </div>
                    )}
                </div>

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

    return (
        <div className="w-full max-w-7xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className='flex items-center gap-2'>
                    <ClipboardList size={20} className="sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary-dark" />
                    {animalView === 'list' ? `My Animals (${displayedAnimalCount})` : animalView === 'collections' ? 'Collections' : showActivityLogScreen ? 'Activity Log' : showSuppliesScreen ? 'Supplies & Inventory' : 'Management View'}
                    {isListLikeView && hasActiveFilters && (
                        <span className="bg-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Filtered
                        </span>
                    )}
                    <button 
                        onClick={handleRefresh}
                        disabled={loading}
                        className="text-gray-500 hover:text-primary transition disabled:opacity-50 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 text-xs sm:text-sm font-medium"
                        title="Refresh List"
                    >
                        {loading ? <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" /> : <RefreshCw size={14} className="sm:w-4 sm:h-4" />}
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap" data-tutorial-target="bulk-privacy-controls">
                    {isListLikeView && (<>
                    <button 
                        onClick={() => navigate('/select-species')} 
                        className="bg-accent hover:bg-accent/90 text-white font-semibold py-1.5 sm:py-2 px-3 rounded-lg transition duration-150 shadow-md flex items-center justify-center gap-1 whitespace-nowrap text-xs sm:text-sm"
                        data-tutorial-target="add-animal-btn"
                    >
                        <PlusCircle size={14} className="sm:w-4 sm:h-4" /> <span>Add Animal</span>
                    </button>

                    </>)}
                    {animalView === 'management' && !showArchiveScreen && !showActivityLogScreen && !showSuppliesScreen && !showDuplicatesScreen && (
                        <button
                            onClick={() => {
                                setActivityLogs([]);
                                setLogsLoaded(false);
                                setShowActivityLogScreen(true);
                            }}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition font-medium"
                            title="View Activity Log"
                        >
                            <ScrollText size={14} className="sm:w-4 sm:h-4" />
                            <span className="font-medium">Activity Log</span>
                        </button>
                    )}
                    {animalView === 'management' && !showArchiveScreen && !showActivityLogScreen && !showSuppliesScreen && !showDuplicatesScreen && (
                        <button
                            onClick={() => { setSupplyForm({ name: '', category: 'Other', currentStock: '', unit: '', reorderThreshold: '', notes: '', isFeederAnimal: false, feederType: '', feederSize: '', costPerUnit: '', nextOrderDate: '', orderFrequency: '', orderFrequencyUnit: 'months' }); setEditingSupplyId(null); setSupplyFormVisible(false); setShowSuppliesScreen(true); }}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition font-medium"
                            title="Supplies & Inventory"
                        >
                            <Package size={14} className="sm:w-4 sm:h-4" />
                            <span className="font-medium">Supplies</span>
                        </button>
                    )}
                    {animalView === 'management' && !showArchiveScreen && !showActivityLogScreen && !showSuppliesScreen && !showDuplicatesScreen && (
                        <button
                            onClick={() => setShowArchiveScreen(true)}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 border border-purple-200 rounded-lg transition font-medium"
                            title="Archive"
                        >
                            <Archive size={14} className="sm:w-4 sm:h-4" />
                            <span className="font-medium">Archive</span>
                        </button>
                    )}
                    {animalView === 'management' && !showArchiveScreen && !showActivityLogScreen && !showSuppliesScreen && !showDuplicatesScreen && (
                        <button
                            onClick={() => { setDuplicateGroups([]); setShowDuplicatesScreen(true); }}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-amber-600 hover:text-amber-800 hover:bg-amber-50 border border-amber-200 rounded-lg transition font-medium"
                            title="Find Duplicate Animals"
                        >
                            <Search size={14} className="sm:w-4 sm:h-4" />
                            <span className="font-medium">Find Duplicates</span>
                        </button>
                    )}
                    {animalView === 'management' && !showArchiveScreen && !showActivityLogScreen && !showSuppliesScreen && !showDuplicatesScreen && (
                        <button
                            onClick={toggleMgmtAlerts}
                            title={mgmtAlertsEnabled ? 'Management alerts on ? click to disable' : 'Management alerts off ? click to enable'}
                            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg border shadow-sm transition-colors ${
                                mgmtAlertsEnabled ? 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                            }`}
                        >
                            <Bell size={14} className="sm:w-4 sm:h-4" />
                            <span className="font-medium hidden sm:inline">Alerts {mgmtAlertsEnabled ? 'On' : 'Off'}</span>
                        </button>
                    )}
                    {animalView === 'management' && (
                    <button 
                        onClick={handleRefresh} 
                        disabled={loading}
                        className="text-gray-500 hover:text-primary transition disabled:opacity-50 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 text-xs sm:text-sm font-medium"
                        title="Refresh List"
                    >
                        {loading ? <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" /> : <RefreshCw size={14} className="sm:w-4 sm:h-4" />}
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                    )}
                </div>
            </h2>

            {/* View Toggle: My Animals / Collections / Management */}
            {!showArchiveScreen && (
            <div className="flex border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-4">
                <button
                    onClick={() => setAnimalView('list')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold transition ${
                        animalView === 'list' ? 'bg-primary text-black' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <ClipboardList size={15} />
                    <span>My Animals</span>
                </button>
                <button
                    onClick={() => setAnimalView('collections')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold transition ${
                        animalView === 'collections' ? 'bg-primary text-black' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <FolderOpen size={15} />
                    <span>Collections</span>
                </button>
                <button
                    onClick={() => setAnimalView('management')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold transition ${
                        animalView === 'management' ? 'bg-primary text-black' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <LayoutGrid size={15} />
                    <span>Management</span>
                </button>
            </div>
            )}

            {isListLikeView && !showArchiveScreen && (
            <div className="mb-4 sm:mb-6 border rounded-lg bg-gray-50">
                {/* Ownership filter buttons ? always visible, auto-apply */}
                <div className="flex flex-wrap items-center justify-center gap-2 px-2 sm:px-3 py-2">
                    <button onClick={() => setShowOwned(prev => !prev)}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center gap-1 ${ 
                            showOwned ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title={showOwned ? 'Click to hide owned animals' : 'Click to show owned animals'}
                    >
                        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {showOwned ? 'Showing Owned' : 'Show Owned'}
                    </button>
                    <button onClick={() => setShowUnowned(prev => !prev)}
                        disabled={!allAnimalsFetched}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center gap-1 ${ 
                            !allAnimalsFetched ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                            showUnowned ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title={!allAnimalsFetched ? 'Loading all animals...' : showUnowned ? 'Click to hide unowned animals' : 'Click to show unowned animals'}
                    >
                        <HeartOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {!allAnimalsFetched ? 'Loading...' : showUnowned ? 'Showing Unowned' : 'Show Unowned'}
                    </button>
                    <span className="hidden sm:inline mx-1 text-gray-300">|</span>
                    <button
                        onClick={() => toggleAllAnimalsPrivacy(true)}
                        className="text-green-600 hover:text-green-700 transition flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-green-50 text-xs sm:text-sm font-semibold shadow-sm"
                        title="Make All Animals Public"
                    >
                        <Eye size={14} className="sm:w-4 sm:h-4" />
                        <span>Set All Public</span>
                    </button>
                    <button
                        onClick={() => toggleAllAnimalsPrivacy(false)}
                        className="text-gray-600 hover:text-gray-800 transition flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray-100 text-xs sm:text-sm font-semibold shadow-sm"
                        title="Make All Animals Private"
                    >
                        <EyeOff size={14} className="sm:w-4 sm:h-4" />
                        <span>Set All Private</span>
                    </button>
                </div>

                {/* Search + Filters toggle + Add */}
                <div className="flex items-center gap-2 p-2 sm:p-3 border-t border-gray-200">
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
                <div className="px-2 sm:px-3 pb-2 sm:pb-3 space-y-2 sm:space-y-3 border-t border-gray-200 pt-2 sm:pt-3">
                    {/* Row 1: Species + Status dropdowns */}
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                        <div className="flex gap-1 sm:gap-2 items-center" data-tutorial-target="species-filter">
                            <span className='text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap'>Species:</span>
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
                                className="p-1.5 sm:p-2 text-xs sm:text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition min-w-[110px] sm:min-w-[160px]"
                            >
                                <option value="">All</option>
                                {speciesNames.map(species => (
                                    <option key={species} value={species}>{getSpeciesDisplayName(species)}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex gap-1 sm:gap-2 items-center" data-tutorial-target="status-filter">
                            <span className='text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap'>Status:</span>
                            <select value={statusFilter} onChange={handleStatusFilterChange} 
                                className="p-1.5 sm:p-2 text-xs sm:text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition min-w-[110px] sm:min-w-[160px]"
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
                            <span className='text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap'>Gender:</span>
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
                            <span className='text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap'>Visibility:</span>
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
                        <span className='text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap'>Show:</span>

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
                            <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Breeding Line:</span>
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
                    <div className="flex justify-center items-center gap-2 pt-2 border-t border-gray-200">
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

            {showArchiveScreen ? renderArchiveScreen() : animalView === 'management' ? (
                showActivityLogScreen ? renderActivityLogScreen() : showSuppliesScreen ? renderSuppliesScreen() : showDuplicatesScreen ? renderDuplicatesScreen() : renderManagementView()
            ) : animalView === 'collections' ? renderCollectionsView() : (loading && animals.length === 0) ? (
                /* Skeleton grid ? only on very first load before any animals arrive */
                <div className="space-y-3 sm:space-y-4">
                    {[0,1,2].map(gi => (
                        <div key={gi} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
                            <div className="flex items-center justify-between bg-gray-100 px-4 py-3 border-b">
                                <div className="h-5 w-32 bg-gray-300 rounded" />
                            </div>
                            <div className="p-3 sm:p-4">
                                <div className="flex flex-wrap gap-2">
                                    {[0,1,2,3,4,6,7,8].map(ci => (
                                        <div key={ci} className="w-[140px] sm:w-[140px] md:w-[176px] h-44 sm:h-48 md:h-56 bg-gray-100 rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : displayedAnimalCount === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <Cat size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-600">No animals found.</p>
                    <p className="text-gray-500">Try adjusting your filters or add a new animal!</p>
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
                                                onClick={() => navigate(`/animal-tree/${encodeURIComponent(species)}`)}
                                                className="p-1 sm:p-2 hover:bg-gray-200 rounded-lg transition"
                                                title="Animal Tree"
                                                data-tutorial-target="animal-tree-btn"
                                            >
                                                <Network className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] text-blue-500" />
                                            </button>
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
        </div>
    );
};

export default AnimalList;
