import React, { useState, useEffect, useCallback, useRef, useMemo, useImperativeHandle } from 'react';
import axios from 'axios';
import {
    ArrowLeft, ClipboardList, Dna, FileText, Home, Hospital, Images, Clock,
    Lock, Palette, PlusCircle, Save, Tag, Trash2, TreeDeciduous, Egg, Brain, Trophy, FileCheck, Scale, X, User, Heart, Eye, EyeOff, Edit, Users, HeartPulse,
    Hash, Sparkles, Ruler, Sprout, Key, FolderOpen, Globe, Leaf, Microscope, Stethoscope, UtensilsCrossed, Droplets,
    Thermometer, Feather, Medal, Target, Ban, Package, ScrollText, Link, Unlink, Baby, Bell, Plus, RotateCcw, Camera, Upload, Search, Star, ArrowRight,
    Loader2, ChevronDown, ChevronUp, ChevronRight, Info, Cat,
    Activity, AlertCircle, AlertTriangle, Download, Flame, Gem,
    Mars, MessageSquare, Pill,
    RefreshCw, Scissors, Shield,
    Venus, Check,
    Circle, Hourglass, Network, Bean, Milk, VenusAndMars, BookOpen,
    Calculator, Calendar, CheckCircle, Dumbbell, Wrench, Utensils
} from 'lucide-react';

const parseJsonArrayField = (data) => {
    if (!data) return [];
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    return Array.isArray(data) ? data : [];
};

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDate, formatDateShort } from '../../utils/dateFormatter';
import DatePicker from '../DatePicker';
import AnimalImageUpload from '../AnimalImageUpload';
import GeneticCodeBuilder from '../GeneticCodeBuilder';
import LoadingSpinner from '../shared/LoadingSpinner';
import AnimalFormModalV2 from './AnimalFormModalV2';

const getPedigreeCacheKey = (rootId, authToken) => {
    if (!rootId) return null;
    return `${authToken ? 'auth' : 'public'}:${rootId}`;
};

const prefetchPedigreeTree = async ({ animalId, API_BASE_URL, authToken = null }) => {
    const rootId = animalId;
    if (!rootId || !API_BASE_URL) return null;

    const cacheKey = getPedigreeCacheKey(rootId, authToken);
    if (!cacheKey) return null;

    if (pedigreeTreeCache.has(cacheKey)) {
        console.log(`[PEDIGREE PREFETCH] Cache hit for ${rootId}`);
        return pedigreeTreeCache.get(cacheKey);
    }

    if (pedigreePrefetchInFlight.has(cacheKey)) {
        console.log(`[PEDIGREE PREFETCH] Already in flight for ${rootId}`);
        return pedigreePrefetchInFlight.get(cacheKey);
    }

    console.log(`[PEDIGREE PREFETCH] Starting for ${rootId}`);
    const overallStartTime = Date.now();

    const task = (async () => {
        const resultCache = new Map();
        let remainingFetchBudget = MAX_PEDIGREE_FETCH_NODES;

        // Helper function to fetch a single animal's data
        const fetchSingleAnimalData = async (id) => {
            let animalInfo = null;
            if (authToken) {
                const isPublicId = /^CTC\d+|^\d+$/.test(id);
                if (!isPublicId) {
                    try {
                        const response = await axios.get(`${API_BASE_URL}/animals/${id}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        animalInfo = response.data;
                    } catch (error) {}
                }

                if (!animalInfo) {
                    try {
                        const response = await axios.get(`${API_BASE_URL}/animals/any/${id}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        animalInfo = response.data;
                    } catch (error2) {}
                }
            }

            if (!animalInfo) {
                try {
                    const publicResponse = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${id}`);
                    if (publicResponse.data && publicResponse.data.length > 0) {
                        animalInfo = publicResponse.data[0];
                    }
                } catch (error) {}
            }

            if (!animalInfo && id) return { isHidden: true, id_public: id };
            if (!animalInfo) return null;
            if (!authToken && !animalInfo.showOnPublicProfile) return { isHidden: true, id_public: id };

            if (animalInfo.manualBreederName) {
                animalInfo.breederName = animalInfo.manualBreederName;
            } else if (animalInfo.breederId_public) {
                try {
                    const breederResponse = await axios.get(
                        `${API_BASE_URL}/public/profiles/search?query=${animalInfo.breederId_public}&limit=1`
                    );
                    if (breederResponse.data && breederResponse.data.length > 0) {
                        const breeder = breederResponse.data[0];
                        const showPersonalName = breeder.showPersonalName ?? false;
                        const showBreederName = breeder.showBreederName ?? false;
                        let breederName;
                        if (showBreederName && showPersonalName && breeder.personalName && breeder.breederName) {
                            breederName = `${breeder.personalName} (${breeder.breederName})`;
                        } else if (showBreederName && breeder.breederName) {
                            breederName = breeder.breederName;
                        } else if (showPersonalName && breeder.personalName) {
                            breederName = breeder.personalName;
                        } else {
                            breederName = 'Anonymous Breeder';
                        }
                        animalInfo.breederName = breederName;
                    }
                } catch (error) {}
            }

            return animalInfo;
        };

        // Helper to build tree structure from flat results
        const buildTreeFromResults = (id, resultsMap, visited = new Set()) => {
            const animalData = resultsMap.get(id);
            if (!animalData) return null;
            
            // Prevent infinite recursion by tracking visited nodes
            if (visited.has(id)) {
                console.warn(`[PEDIGREE] Circular reference detected for ${id}, stopping recursion`);
                return { ...animalData, father: null, mother: null };
            }
            
            visited.add(id);

            const fatherId = animalData.fatherId_public || animalData.sireId_public;
            const motherId = animalData.motherId_public || animalData.damId_public;

            return {
                ...animalData,
                father: fatherId ? buildTreeFromResults(fatherId, resultsMap, visited) : null,
                mother: motherId ? buildTreeFromResults(motherId, resultsMap, visited) : null
            };
        };

        // PHASE 1: Breadth-first for all generations (simplified for 4 generation limit)
        const BREADTH_FIRST_DEPTH = MAX_PEDIGREE_FETCH_DEPTH;
        const generationQueue = [{ id: rootId, depth: 0, path: new Set() }];
        const processedIds = new Set();

        for (let currentDepth = 0; currentDepth <= BREADTH_FIRST_DEPTH; currentDepth++) {
            const animalsAtThisDepth = generationQueue.filter(item => item.depth === currentDepth);
            if (animalsAtThisDepth.length === 0) continue;

            console.log(`[PEDIGREE PREFETCH] Fetching generation ${currentDepth} (${animalsAtThisDepth.length} animals)...`);
            const genStartTime = Date.now();

            // Fetch all animals in this generation in parallel
            const fetchPromises = animalsAtThisDepth.map(async ({ id, path }) => {
                if (processedIds.has(id) || !id || path.has(id)) return null;
                if (remainingFetchBudget <= 0) return null;
                
                processedIds.add(id);
                remainingFetchBudget -= 1;

                const animalInfo = await fetchSingleAnimalData(id);
                if (!animalInfo) return null;

                resultCache.set(id, { fetchedAtDepth: currentDepth, data: animalInfo });

                // Queue parents for next generation
                const fatherId = animalInfo.fatherId_public || animalInfo.sireId_public;
                const motherId = animalInfo.motherId_public || animalInfo.damId_public;
                const childPath = new Set([...path, id]);

                if (currentDepth < BREADTH_FIRST_DEPTH) {
                    if (fatherId && !processedIds.has(fatherId)) {
                        generationQueue.push({ id: fatherId, depth: currentDepth + 1, path: childPath });
                    }
                    if (motherId && !processedIds.has(motherId)) {
                        generationQueue.push({ id: motherId, depth: currentDepth + 1, path: childPath });
                    }
                }

                return animalInfo;
            });

            await Promise.all(fetchPromises);

            const genElapsed = Date.now() - genStartTime;
            console.log(`[PEDIGREE PREFETCH] Generation ${currentDepth} complete (${genElapsed}ms)`);

            // Update cache with partial data after each generation
            const partialTree = buildTreeFromResults(rootId, resultCache);
            if (partialTree) {
                pedigreeTreeCache.set(cacheKey, {
                    data: partialTree,
                    ownerProfile: null,
                    isPartial: true,
                    fetchedDepth: currentDepth,
                    timestamp: Date.now()
                });
                console.log(`[PEDIGREE PREFETCH] Cache updated with ${currentDepth + 1} generation(s)`);
            }
        }

        // Build final tree from cached results (no additional fetching needed - we already have 4 generations)
        const data = buildTreeFromResults(rootId, new Map(Array.from(resultCache.entries()).map(([k, v]) => [k, v.data])));
        
        // Fetch owner profile
        let fetchedOwnerProfile = null;
        if (data?.breederId_public) {
            try {
                const ownerResponse = await axios.get(
                    `${API_BASE_URL}/public/profiles/search?query=${data.breederId_public}&limit=1`
                );
                if (ownerResponse.data && ownerResponse.data.length > 0) {
                    fetchedOwnerProfile = ownerResponse.data[0];
                }
            } catch (error) {}
        }

        const payload = { 
            data, 
            ownerProfile: fetchedOwnerProfile,
            isPartial: false,
            fetchedDepth: MAX_PEDIGREE_FETCH_DEPTH,
            timestamp: Date.now()
        };
        pedigreeTreeCache.set(cacheKey, payload);
        
        const overallElapsed = Date.now() - overallStartTime;
        console.log(`[PEDIGREE PREFETCH] Complete for ${rootId} (${overallElapsed}ms total, ${MAX_PEDIGREE_FETCH_DEPTH + 1} generations)`);
        
        return payload;
    })().catch((error) => {
        console.error(`[PEDIGREE PREFETCH] Error for ${rootId}:`, error);
        return null;
    }).finally(() => {
        pedigreePrefetchInFlight.delete(cacheKey);
    });

    pedigreePrefetchInFlight.set(cacheKey, task);
    return task;
};


const PedigreeChart = React.forwardRef(({ animalId, animalData, onClose, API_BASE_URL, authToken = null, inline = false, vertical = false, manualData = null, onViewAnimal = null, inlineGenerations = null }, ref) => {
    const [pedigreeData, setPedigreeData] = useState(null);
    const [currentViewingAnimal, setCurrentViewingAnimal] = useState(null);
    const [ownerProfile, setOwnerProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [stackedPedigree, setStackedPedigree] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [generations, setGenerations] = useState(inline && inlineGenerations ? inlineGenerations : 4); // 1–4
    // Load persisted cert prefs from localStorage (shared across all animals for this user)
    const _savedPrefs = (() => { try { return JSON.parse(localStorage.getItem('ct_cert_prefs') || '{}'); } catch { return {}; } })();
    const [certText, setCertText] = useState(_savedPrefs.certText ?? '');
    const [certTextTopRight, setCertTextTopRight] = useState(_savedPrefs.certTextTopRight ?? 'Certificate of Origin');
    const [certTextBottomLeft, setCertTextBottomLeft] = useState(_savedPrefs.certTextBottomLeft ?? 'This pedigree is not recognized by the state');
    const [certTextSignature, setCertTextSignature] = useState(_savedPrefs.certTextSignature ?? 'Signature');
    const [certFontColor, setCertFontColor] = useState(_savedPrefs.certFontColor ?? '#1a1a1a');
    const [certBorderColor, setCertBorderColor] = useState(_savedPrefs.certBorderColor ?? '#374151');
    const [certBgColor, setCertBgColor] = useState(_savedPrefs.certBgColor ?? '#ffffff');
    const [showCustomPanel, setShowCustomPanel] = useState(false);
    const [vertGenerations, setVertGenerations] = useState(inline && inlineGenerations ? inlineGenerations : 3);
    const [inlineZoomPct, setInlineZoomPct] = useState(30);
    const [inlinePan, setInlinePan] = useState({ x: 12, y: 12 });
    const [inlineDragging, setInlineDragging] = useState(false);
    const [inlineEnlarged, setInlineEnlarged] = useState(false);
    const [enlargedZoomPct, setEnlargedZoomPct] = useState(60);
    const [enlargedPan, setEnlargedPan] = useState({ x: 12, y: 12 });
    const [enlargedDragging, setEnlargedDragging] = useState(false);
    const inlineDragRef = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });
    const enlargedDragRef = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });
    const inlineViewportRef = useRef(null);
    const enlargedViewportRef = useRef(null);
    const inlineTreeLayoutRef = useRef(null);
    const enlargedTreeLayoutRef = useRef(null);
    const pedigreeRef = useRef(null);

    useEffect(() => {
        if (vertical) setVertGenerations(inline && inlineGenerations ? inlineGenerations : 4);
    }, [vertical, inline, inlineGenerations]);

    // Persist cert prefs to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('ct_cert_prefs', JSON.stringify({ certText, certTextTopRight, certTextBottomLeft, certTextSignature, certFontColor, certBorderColor, certBgColor }));
        } catch {}
    }, [certText, certTextTopRight, certTextBottomLeft, certTextSignature, certFontColor, certBorderColor, certBgColor]);

    // Merge manual ancestors into fetched pedigree tree wherever API returned nothing
    const displayData = useMemo(() => {
        if (!pedigreeData) return null;
        if (!manualData) return pedigreeData;
        
        const slotToAnimal = (slot) => {
            if (!slot) return null;
            if (!slot.ctcId && !slot.name && !slot.prefix && !slot.suffix) return null;
            return {
                name: slot.name || '', prefix: slot.prefix || '', suffix: slot.suffix || '',
                color: slot.variety || '', imageUrl: slot.imageUrl || null, photoUrl: slot.imageUrl || null,
                birthDate: slot.birthDate || null, deceasedDate: slot.deceasedDate || null,
                breederName: slot.breederName || '',
                gender: slot.gender || '', id_public: slot.ctcId || null, geneticCode: slot.genCode || '',
            };
        };
        const d = JSON.parse(JSON.stringify(pedigreeData));
        // Level 1 • parents
        if (!d.father && manualData.sire) d.father = slotToAnimal(manualData.sire);
        if (!d.mother && manualData.dam)  d.mother = slotToAnimal(manualData.dam);
        // Level 2 • grandparents
        if (d.father) {
            if (!d.father.father && manualData.sireSire) d.father.father = slotToAnimal(manualData.sireSire);
            if (!d.father.mother && manualData.sireDam)  d.father.mother = slotToAnimal(manualData.sireDam);
        }
        if (d.mother) {
            if (!d.mother.father && manualData.damSire) d.mother.father = slotToAnimal(manualData.damSire);
            if (!d.mother.mother && manualData.damDam)  d.mother.mother = slotToAnimal(manualData.damDam);
        }
        // Level 3 • great-grandparents
        if (d.father?.father) {
            if (!d.father.father.father && manualData.sireSireSire) d.father.father.father = slotToAnimal(manualData.sireSireSire);
            if (!d.father.father.mother && manualData.sireSireDam)  d.father.father.mother = slotToAnimal(manualData.sireSireDam);
        }
        if (d.father?.mother) {
            if (!d.father.mother.father && manualData.sireDamSire) d.father.mother.father = slotToAnimal(manualData.sireDamSire);
            if (!d.father.mother.mother && manualData.sireDamDam)  d.father.mother.mother = slotToAnimal(manualData.sireDamDam);
        }
        if (d.mother?.father) {
            if (!d.mother.father.father && manualData.damSireSire) d.mother.father.father = slotToAnimal(manualData.damSireSire);
            if (!d.mother.father.mother && manualData.damSireDam)  d.mother.father.mother = slotToAnimal(manualData.damSireDam);
        }
        if (d.mother?.mother) {
            if (!d.mother.mother.father && manualData.damDamSire) d.mother.mother.father = slotToAnimal(manualData.damDamSire);
            if (!d.mother.mother.mother && manualData.damDamDam)  d.mother.mother.mother = slotToAnimal(manualData.damDamDam);
        }
        return d;
    }, [pedigreeData, manualData]);

    useEffect(() => {
        // Inline mode with animalData already supplied: skip the expensive recursive fetch.
        // The merge useEffect will overlay manualData ancestors on top.
        // Note: inline mode still does the full recursive fetch so all ancestor generations load.

        const fetchPedigreeData = async () => {
            const rootId = animalId || animalData?.id_public;
            const authScope = authToken ? 'auth' : 'public';
            const cacheKey = rootId ? `${authScope}:${rootId}` : null;
            if (cacheKey && pedigreeTreeCache.has(cacheKey)) {
                const cached = pedigreeTreeCache.get(cacheKey);
                setPedigreeData(cached?.data || null);
                setOwnerProfile(cached?.ownerProfile || null);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Enhanced recursive function to fetch animal, ancestors, and descendants
                // resultCache: Map<id, {fetchedAtDepth, data}> — caches results but only reuses
                //   them when the cached version was fetched at the same or shallower depth
                //   (shallower = more ancestors available). This prevents offspring-fetching
                //   from poisoning the cache with depth=4 entries that have null parents,
                //   which would then be reused when the ancestor chain needs them at depth=3.
                // pathIds: Set of IDs in the current call-chain — detects true circular loops only.
                const resultCache = new Map();
                let remainingFetchBudget = MAX_PEDIGREE_FETCH_NODES;
                const fetchAnimalWithFamily = async (id, depth = 0, pathIds = new Set()) => {
                    if (!id || depth > MAX_PEDIGREE_FETCH_DEPTH) return null;
                    if (pathIds.has(id)) return null; // circular reference — stop this branch

                    // Return cached result only if it was fetched at the same or shallower depth
                    // (cached.fetchedAtDepth <= depth means the cache has at least as many
                    //  ancestor levels as we need right now).
                    if (resultCache.has(id)) {
                        const cached = resultCache.get(id);
                        if (cached.fetchedAtDepth <= depth) return cached.data;
                        // else: cache was built at a deeper position — fewer ancestors stored.
                        // Fall through and re-fetch so we get the full ancestor chain.
                    }

                    if (remainingFetchBudget <= 0) return null;
                    remainingFetchBudget -= 1;

                    let animalInfo = null;
                    let foundViaOwned = false;

                    // Try to fetch from owned animals first if authToken is available
                    if (authToken) {
                        // Skip the /animals/:id endpoint if id looks like a public ID (CTC format or numeric)
                        const isPublicId = /^CTC\d+|^\d+$/.test(id);
                        
                        if (!isPublicId) {
                            try {
                                // Try /animals/:id_backend endpoint for backend ObjectIds (owned animals)
                                const response = await axios.get(`${API_BASE_URL}/animals/${id}`, {
                                    headers: { Authorization: `Bearer ${authToken}` }
                                });
                                animalInfo = response.data;
                                foundViaOwned = true; // Only set when truly owned by the user
                            } catch (error) {
                                // Not found as backend ID, continue to try other endpoints
                            }
                        }

                        // Try /animals/any endpoint for public IDs or related animals
                        if (!animalInfo) {
                            try {
                                const response = await axios.get(`${API_BASE_URL}/animals/any/${id}`, {
                                    headers: { Authorization: `Bearer ${authToken}` }
                                });
                                animalInfo = response.data;
                                // Do NOT set foundViaOwned = true here — animal is accessible but not owned.
                                // This ensures the showOnPublicProfile check below still applies,
                                // consistent with how ViewOnlyParentCard handles the same case.
                            } catch (error2) {
                                console.log(`Animal ${id} not accessible via any endpoint:`, error2.message);
                            }
                        }
                    }

                    // If not found in owned, try public database
                    if (!animalInfo) {
                        try {
                            const publicResponse = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${id}`);
                            if (publicResponse.data && publicResponse.data.length > 0) {
                                animalInfo = publicResponse.data[0];
                            }
                        } catch (error) {
                            console.log(`Animal ${id} not found in public database:`, error.message);
                            // Don't return null here - continue to check if we should show hidden marker
                        }
                    }

                    // If animal exists but is not public/accessible (has ID but no data), return hidden marker
                    // This ensures parents always show even if they're private
                    if (!animalInfo && id) {
                        return { isHidden: true, id_public: id };
                    }
                    
                    if (!animalInfo) return null;

                    // If not authenticated and animal is not publicly visible, hide it
                    if (!authToken && !animalInfo.showOnPublicProfile) {
                        return { isHidden: true, id_public: id };
                    }

                    // Use manual breeder name if available, otherwise fetch breeder profile
                    if (animalInfo.manualBreederName) {
                        animalInfo.breederName = animalInfo.manualBreederName;
                    } else if (animalInfo.breederId_public) {
                        try {
                            const breederResponse = await axios.get(
                                `${API_BASE_URL}/public/profiles/search?query=${animalInfo.breederId_public}&limit=1`
                            );
                            if (breederResponse.data && breederResponse.data.length > 0) {
                                const breeder = breederResponse.data[0];
                                const showPersonalName = breeder.showPersonalName ?? false;
                                const showBreederName = breeder.showBreederName ?? false;
                                
                                // Determine breeder display name based on privacy settings
                                let breederName;
                                if (showBreederName && showPersonalName && breeder.personalName && breeder.breederName) {
                                    breederName = `${breeder.personalName} (${breeder.breederName})`;
                                } else if (showBreederName && breeder.breederName) {
                                    breederName = breeder.breederName;
                                } else if (showPersonalName && breeder.personalName) {
                                    breederName = breeder.personalName;
                                } else {
                                    breederName = 'Anonymous Breeder';
                                }
                                animalInfo.breederName = breederName;
                            }
                        } catch (error) {
                            console.error(`Failed to fetch breeder for animal ${id}:`, error);
                        }
                    }

                    // Recursively fetch parents — each branch gets its own path copy so that
                    // an ancestor appearing on BOTH sides (inbreeding) isn't blocked.
                    const fatherId = animalInfo.fatherId_public || animalInfo.sireId_public;
                    const motherId = animalInfo.motherId_public || animalInfo.damId_public;
                    console.log(`[PEDIGREE] depth=${depth} id=${id} name=${animalInfo.name} | fatherId=${fatherId} motherId=${motherId} | raw: sireId_public=${animalInfo.sireId_public} damId_public=${animalInfo.damId_public} fatherId_public=${animalInfo.fatherId_public} motherId_public=${animalInfo.motherId_public}`);
                    const childPath = new Set([...pathIds, id]);

                    const father = fatherId ? await fetchAnimalWithFamily(fatherId, depth + 1, childPath) : null;
                    const mother = motherId ? await fetchAnimalWithFamily(motherId, depth + 1, childPath) : null;

                    const result = {
                        ...animalInfo,
                        father,
                        mother,
                    };
                    // Cache — always overwrite with the shallowest-depth version (most ancestors available)
                    if (!resultCache.has(id) || resultCache.get(id).fetchedAtDepth > depth) {
                        resultCache.set(id, { fetchedAtDepth: depth, data: result });
                    }
                    return result;
                };

                const data = await fetchAnimalWithFamily(rootId);
                setPedigreeData(data);

                // Fetch breeder profile for the main animal
                let fetchedOwnerProfile = null;
                if (data?.breederId_public) {
                    try {
                        const breederId = data.breederId_public;
                        console.log('[PEDIGREE] Fetching breeder profile for ID:', breederId);
                        const ownerResponse = await axios.get(
                            `${API_BASE_URL}/public/profiles/search?query=${breederId}&limit=1`
                        );
                        console.log('[PEDIGREE] Owner profile response:', ownerResponse.data);
                        if (ownerResponse.data && ownerResponse.data.length > 0) {
                            const profile = ownerResponse.data[0];
                            console.log('[PEDIGREE] Owner profile data:', {
                                personalName: profile.personalName,
                                breederName: profile.breederName,
                                showBreederName: profile.showBreederName,
                                profileImage: profile.profileImage,
                                profileImageUrl: profile.profileImageUrl,
                                id_public: profile.id_public
                            });
                            setOwnerProfile(profile);
                            fetchedOwnerProfile = profile;
                        }
                    } catch (error) {
                        console.error('Failed to fetch owner profile:', error);
                    }
                }

                if (cacheKey) {
                    pedigreeTreeCache.set(cacheKey, { data, ownerProfile: fetchedOwnerProfile });
                }
            } catch (error) {
                console.error('Error fetching pedigree data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPedigreeData();
    }, [animalId, animalData?.id_public, API_BASE_URL, authToken]); // eslint-disable-line react-hooks/exhaustive-deps

    // Re-fetch pedigree when clicking an ancestor (currentViewingAnimal changes)
    useEffect(() => {
        if (!currentViewingAnimal?.id_public) return;

        const rootId = currentViewingAnimal.id_public;
        const authScope = authToken ? 'auth' : 'public';
        const cacheKey = `${authScope}:${rootId}`;
        if (pedigreeTreeCache.has(cacheKey)) {
            const cached = pedigreeTreeCache.get(cacheKey);
            setPedigreeData(cached?.data || null);
            setOwnerProfile(cached?.ownerProfile || null);
            setLoading(false);
            return;
        }
        
        setLoading(true);
        
        // Use async function to properly handle the fetch
        const fetchAncestorPedigree = async () => {
            const resultCache = new Map();
            let remainingFetchBudget = MAX_PEDIGREE_FETCH_NODES;
            const fetchAnimalWithFamily = async (id, depth = 0, pathIds = new Set()) => {
            if (!id || depth > MAX_PEDIGREE_FETCH_DEPTH) return null;
            if (pathIds.has(id)) return null;
            if (resultCache.has(id)) {
                const cached = resultCache.get(id);
                if (cached.fetchedAtDepth <= depth) return cached.data;
            }

            if (remainingFetchBudget <= 0) return null;
            remainingFetchBudget -= 1;

            let animalInfo = null;
            let foundViaOwned = false;
            if (authToken) {
                const isPublicId = /^CTC\d+|^\d+$/.test(id);
                if (!isPublicId) {
                    try {
                        const response = await axios.get(`${API_BASE_URL}/animals/${id}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        animalInfo = response.data;
                        foundViaOwned = true;
                    } catch (error) {}
                }
                if (!animalInfo) {
                    try {
                        const response = await axios.get(`${API_BASE_URL}/animals/any/${id}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        animalInfo = response.data;
                    } catch (error2) {}
                }
            }
            if (!animalInfo) {
                try {
                    const publicResponse = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${id}`);
                    if (publicResponse.data && publicResponse.data.length > 0) {
                        animalInfo = publicResponse.data[0];
                    }
                } catch (error) {}
            }
            if (!animalInfo && id) return { isHidden: true, id_public: id };
            if (!animalInfo) return null;
            if (!authToken && !animalInfo.showOnPublicProfile) return { isHidden: true, id_public: id };

            if (animalInfo.manualBreederName) {
                animalInfo.breederName = animalInfo.manualBreederName;
            } else if (animalInfo.breederId_public) {
                try {
                    const breederResponse = await axios.get(
                        `${API_BASE_URL}/public/profiles/search?query=${animalInfo.breederId_public}&limit=1`
                    );
                    if (breederResponse.data && breederResponse.data.length > 0) {
                        const breeder = breederResponse.data[0];
                        const showPersonalName = breeder.showPersonalName ?? false;
                        const showBreederName = breeder.showBreederName ?? false;
                        let breederName;
                        if (showBreederName && showPersonalName && breeder.personalName && breeder.breederName) {
                            breederName = `${breeder.personalName} (${breeder.breederName})`;
                        } else if (showBreederName && breeder.breederName) {
                            breederName = breeder.breederName;
                        } else if (showPersonalName && breeder.personalName) {
                            breederName = breeder.personalName;
                        } else {
                            breederName = 'Anonymous Breeder';
                        }
                        animalInfo.breederName = breederName;
                    }
                } catch (error) {}
            }

            const fatherId = animalInfo.fatherId_public || animalInfo.sireId_public;
            const motherId = animalInfo.motherId_public || animalInfo.damId_public;
            const childPath = new Set([...pathIds, id]);
            const father = fatherId ? await fetchAnimalWithFamily(fatherId, depth + 1, childPath) : null;
            const mother = motherId ? await fetchAnimalWithFamily(motherId, depth + 1, childPath) : null;
            const result = { ...animalInfo, father, mother };
            if (!resultCache.has(id) || resultCache.get(id).fetchedAtDepth > depth) {
                resultCache.set(id, { fetchedAtDepth: depth, data: result });
            }
            return result;
        };

            try {
                const data = await fetchAnimalWithFamily(rootId);
                setPedigreeData(data);
                
                let fetchedOwnerProfile = null;
                // Fetch breeder profile for the ancestor
                if (data?.breederId_public) {
                    try {
                        const r = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${data.breederId_public}&limit=1`);
                        if (r.data?.[0]) {
                            fetchedOwnerProfile = r.data[0];
                            setOwnerProfile(r.data[0]);
                        }
                    } catch (error) {
                        console.error('Error fetching breeder profile:', error);
                    }
                }
                
                pedigreeTreeCache.set(cacheKey, { data, ownerProfile: fetchedOwnerProfile });
            } catch (error) {
                console.error('Error fetching ancestor pedigree:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAncestorPedigree();
    }, [currentViewingAnimal, API_BASE_URL, authToken]);

    // Check when all images are loaded
    useEffect(() => {
        if (!pedigreeRef.current || loading) return;

        const checkImagesLoaded = () => {
            const images = pedigreeRef.current.querySelectorAll('img');
            const allLoaded = Array.from(images).every(img => img.complete);
            setImagesLoaded(allLoaded);
        };

        // Initial check
        checkImagesLoaded();

        // Listen for image load events
        const images = pedigreeRef.current.querySelectorAll('img');
        const handleImageLoad = () => checkImagesLoaded();
        
        images.forEach(img => {
            img.addEventListener('load', handleImageLoad);
            img.addEventListener('error', handleImageLoad);
        });

        return () => {
            images.forEach(img => {
                img.removeEventListener('load', handleImageLoad);
                img.removeEventListener('error', handleImageLoad);
            });
        };
    }, [loading, pedigreeData]);

    const capturePedigreeCanvas = async () => {
        const el = pedigreeRef.current;
        if (!el) return null;

        // Clone and mount directly on body so html2canvas sees no ancestor
        // overflow/scroll clipping — the only reliable way to capture content
        // that lives inside a scrollable modal.
        const clone = el.cloneNode(true);
        const captureW = vertical ? Math.max(el.scrollWidth, 860) : Math.max(el.scrollWidth, 1400);
        Object.assign(clone.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: captureW + 'px',
            zIndex: '-9999',
            pointerEvents: 'none',
            opacity: '1',
            visibility: 'visible',
        });
        // Hide ggp chart images
        clone.querySelectorAll('.ggp-chart-img').forEach(img => { img.style.display = 'none'; });
        document.body.appendChild(clone);

        try {
            await new Promise(r => setTimeout(r, 150));
            return await html2canvas(clone, {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true,
                letterRendering: true,
                windowWidth: captureW,
                windowHeight: clone.scrollHeight,
                imageTimeout: 15000,
                scrollX: 0,
                scrollY: 0,
            });
        } finally {
            if (document.body.contains(clone)) {
                document.body.removeChild(clone);
            }
        }
    };

    const downloadPDF = async () => {
        if (!pedigreeRef.current) return;
        setIsSaving(true);
        try {
            const srcCanvas = await capturePedigreeCanvas();
            if (!srcCanvas) return;

            // Scale to fill full page width, height follows aspect ratio (custom page size)
            const pageW = vertical ? 210 : 297;
            const padMm = 4;
            const drawW = pageW - padMm * 2;
            const ratio = drawW / srcCanvas.width;
            const drawH = srcCanvas.height * ratio;
            const pdf = new jsPDF({ orientation: vertical ? 'portrait' : 'landscape', unit: 'mm', format: [pageW, drawH + padMm * 2] });
            pdf.addImage(srcCanvas.toDataURL('image/png'), 'PNG', padMm, padMm, drawW, drawH);
            pdf.save(`pedigree-${pedigreeData?.name || 'chart'}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const downloadImage = async () => {
        if (!pedigreeRef.current) return;
        setIsSaving(true);
        try {
            const srcCanvas = await capturePedigreeCanvas();
            if (!srcCanvas) return;

            // Scale to fill full paper width at 300dpi, height follows aspect ratio.
            const a4W = vertical ? 2480 : 3508;
            const pad = 60;
            const drawW = a4W - pad * 2;
            const ratio = drawW / srcCanvas.width;
            const drawH = Math.round(srcCanvas.height * ratio);
            const out = document.createElement('canvas');
            out.width = a4W;
            out.height = drawH + pad * 2;
            const ctx = out.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, out.width, out.height);
            ctx.drawImage(srcCanvas, pad, pad, drawW, drawH);

            const link = document.createElement('a');
            link.download = `pedigree-${pedigreeData?.name || 'chart'}.png`;
            link.href = out.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Error generating image:', error);
        } finally {
            setIsSaving(false);
        }
    };

    useImperativeHandle(ref, () => ({
        downloadPDF,
        downloadImage,
        get imagesLoaded() { return imagesLoaded; },
        get isSaving() { return isSaving; },
    }), [downloadPDF, downloadImage, imagesLoaded, isSaving]);

    // ── Certificate helpers ─────────────────────────────────────────────────

    // Extract flat ancestor at a given path. path is an array of 'father'|'mother' strings.
    const getAncestor = (root, path) => {
        let node = root;
        for (const step of path) {
            if (!node) return null;
            node = node[step];
        }
        return node || null;
    };

    // Render one certificate cell (compact, text-only label+value rows)
    // genIndex: 0 = parents (largest), 1 = grandparents, 2 = great-grandparents, 3 = great-great (smallest)
    const renderCertCell = (animal, isSire, onClick = null, genIndex = 0, stacked = false) => {
        const inlineMode = inline;
        // Scale text and image per generation column
        const imgSize  = stacked
            ? (genIndex === 0 ? 70 : genIndex === 1 ? 50 : genIndex === 2 ? 0 : 0)
            : (genIndex === 0 ? 90 : genIndex === 1 ? 60 : genIndex === 2 ? 38 : 0);
        const nameSize = genIndex === 0 ? '0.90rem' : genIndex === 1 ? '0.78rem' : genIndex === 2 ? '0.66rem' : '0.58rem';
        const metaSize = genIndex === 0 ? '0.76rem' : genIndex === 1 ? '0.68rem' : genIndex === 2 ? '0.58rem' : '0.51rem';
        const smallSize= genIndex === 0 ? '0.66rem' : genIndex === 1 ? '0.58rem' : genIndex === 2 ? '0.51rem' : '0.46rem';
        let iconSize = genIndex === 0 ? 26 : genIndex === 1 ? 22 : genIndex === 2 ? 20 : 18;
        // Reduce icon size on vertical stacked layout (gen3 & gen4) to free text space
        if (stacked && genIndex >= 2) {
          iconSize = genIndex === 2 ? 18 : 16;
        }
        const pad      = genIndex === 0 ? '6px 8px' : genIndex === 1 ? '5px 7px' : genIndex === 2 ? '4px 6px' : '3px 5px';
        const borderColor = (!animal || animal.isHidden) ? (isSire ? '#76a7ff' : '#f48abf')
            : animal.gender === 'Male' ? '#3b82f6'
            : animal.gender === 'Female' ? '#934E69'
            : (inlineMode ? '#94a3b8' : certBorderColor);

        const bgColor = (!animal || animal.isHidden) ? (isSire ? '#e8f1ff' : '#fdeef6')
            : (!animal.isHidden && !animal.gender) ? (isSire ? '#e8f1ff' : '#fdeef6')
            : animal.gender === 'Male' ? '#e8f1ff'
            : animal.gender === 'Female' ? '#fdeef6'
            : (isSire ? '#e8f1ff' : '#fdeef6');

        const baseStyle = {
            border: `1px solid ${borderColor}`,
            backgroundColor: bgColor,
            padding: pad,
            position: 'relative',
            height: '100%',
            boxSizing: 'border-box',
            borderRadius: inlineMode ? 8 : 0,
            cursor: onClick && animal && !animal.isHidden && animal.id_public ? 'pointer' : 'default',
        };

        const GenderIcon = isSire ? Mars : Venus;

        if (!animal) {
            return (
                <div style={baseStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <div style={{ fontSize: metaSize, color: '#9ca3af', textAlign: 'center' }}>Unknown</div>
                    </div>
                    <div style={{ position: 'absolute', top: 2, right: 2 }}><GenderIcon size={iconSize} color={certBorderColor} /></div>
                </div>
            );
        }

        if (animal.isHidden) {
            return (
                <div style={baseStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <div style={{ fontSize: metaSize, color: '#9ca3af', textAlign: 'center' }}>Unknown</div>
                    </div>
                    <div style={{ position: 'absolute', top: 2, right: 2 }}><GenderIcon size={iconSize} color={certBorderColor} /></div>
                </div>
            );
        }

        const imgSrc = animal.imageUrl || animal.photoUrl || null;
        const variety = [animal.color, animal.coatPattern, animal.coat].filter(Boolean).join(', ') || animal.variety || '';
        const fullName = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ');
        const handleClick = onClick && animal.id_public ? () => onClick(animal) : undefined;

        const isRowLayout = (genIndex === 2 && !stacked) || (stacked && (genIndex === 0 || genIndex === 1));

        return (
            <div style={baseStyle} onClick={handleClick}>
                <div style={{ display: 'flex', flexDirection: isRowLayout ? 'row' : 'column', gap: imgSize > 0 ? 6 : 0, alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                    {/* Thumbnail — hidden at gen 4 or when imgSize=0 */}
                    {imgSrc && imgSize > 0 && (
                        <div className="hide-for-pdf" style={{ width: imgSize, height: imgSize, flexShrink: 0, borderRadius: 4, overflow: 'hidden', border: `1px solid ${certBorderColor}` }}>
                            <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={Math.round(imgSize * 0.4)} />
                        </div>
                    )}
                    {/* Text */}
                    <div style={{ minWidth: 0, width: isRowLayout ? `calc(100% - ${imgSize}px - 6px)` : '100%', textAlign: (stacked && (genIndex === 0 || genIndex === 1)) ? 'left' : 'center', paddingLeft: isRowLayout ? 4 : 0, fontSize: (genIndex === 2 && !stacked) ? '0.62rem' : 'inherit', overflowWrap: 'break-word' }}>
                        {genIndex === 3 ? (
                            stacked ? (
                                <>
                                    <div style={{ fontSize: '0.54rem', fontWeight: 700, color: certFontColor, lineHeight: 1.05, overflowWrap: 'anywhere', padding: '0 18px 0 4px' }}>{fullName}</div>
                                    {variety && <div style={{ fontSize: '0.47rem', color: certFontColor, lineHeight: 1.05, overflowWrap: 'anywhere', padding: '0 18px 0 4px' }}>{variety}</div>}
                                    {animal.birthDate && <div style={{ fontSize: '0.47rem', color: certFontColor, lineHeight: 1.05, padding: '0 18px 0 4px' }}>{formatDate(animal.birthDate)}</div>}
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: nameSize, fontWeight: 700, color: certFontColor, lineHeight: 1.4, whiteSpace: 'nowrap', padding: '0 20px 0 4px' }}>{fullName}{variety ? <span style={{ fontWeight: 400, marginLeft: 4 }}>· {variety}</span> : null}</div>
                                    <div style={{ fontSize: metaSize, color: certFontColor, lineHeight: 1.4, whiteSpace: 'nowrap', padding: '0 20px 0 4px' }}>{[animal.birthDate ? formatDate(animal.birthDate) : null, animal.breederName !== 'Anonymous Breeder' ? animal.breederName : null].filter(Boolean).join(' · ')}</div>
                                </>
                            )
                        ) : (
                            <>
                                <div style={{ fontSize: nameSize, fontWeight: 700, color: certFontColor, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{fullName}</div>
                                {variety && <div style={{ fontSize: metaSize, color: certFontColor, lineHeight: 1.15, overflowWrap: 'anywhere' }}>{variety}</div>}
                                {animal.geneticCode && <div style={{ fontSize: metaSize, color: certFontColor, lineHeight: 1.15, overflowWrap: 'anywhere' }}>{animal.geneticCode}</div>}
                                {animal.birthDate && <div style={{ fontSize: metaSize, color: certFontColor, lineHeight: 1.2 }}>{formatDate(animal.birthDate)}</div>}
                                {animal.breederName && animal.breederName !== 'Anonymous Breeder' && <div style={{ fontSize: smallSize, color: certFontColor, fontStyle: 'italic', lineHeight: 1.15, overflowWrap: 'anywhere' }}>{animal.breederName}</div>}
                            </>
                        )}
                    </div>
                </div>
                <div style={{ position: 'absolute', top: 2, right: 2 }}><GenderIcon size={iconSize} color={certBorderColor} /></div>
                {animal.id_public && <div style={{ position: 'absolute', bottom: 10, right: 4, fontSize: smallSize, color: '#6b7280', fontFamily: 'monospace', fontWeight: 600, lineHeight: 1 }}>{animal.id_public}</div>}
            </div>
        );
    };

    // Build the pedigree grid (CSS Grid instead of table to fix html2canvas rowspan issues)
    const renderCertificateTable = (subject, gens, handleCardClick) => {
        if (!subject) return null;

        const maxRows = 16; // Fixed grid preserves 4-gen structure
        const rowMinH = 62;

        const genSlots = [];
        genSlots[0] = [
            { path: ['father'], isSire: true },
            { path: ['mother'], isSire: false },
        ];
        for (let g = 1; g < gens; g++) {
            genSlots[g] = [];
            for (const slot of genSlots[g - 1]) {
                genSlots[g].push({ path: [...slot.path, 'father'], isSire: true });
                genSlots[g].push({ path: [...slot.path, 'mother'], isSire: false });
            }
        }

        const rowGap = 3;
        const cells = [];
        for (let g = 0; g < gens; g++) {
            const slots = genSlots[g];
            const rowsPerSlot = maxRows / slots.length;
            slots.forEach((slot, i) => {
                const rowStart = i * rowsPerSlot + 1;
                const animal = getAncestor(subject, slot.path);
                // Explicit pixel height so html2canvas resolves height:100% correctly
                // (html2canvas can't infer height from CSS Grid row-span)
                const cellH = rowsPerSlot * rowMinH + (rowsPerSlot - 1) * rowGap;
                cells.push(
                    <div key={`${g}-${i}`} style={{
                        gridColumn: g + 1,
                        gridRow: `${rowStart} / span ${rowsPerSlot}`,
                        padding: 2,
                        boxSizing: 'border-box',
                        height: cellH,
                    }}>
                        <div style={{ height: cellH - 4 }}>
                            {renderCertCell(animal, slot.isSire, handleCardClick, g)}
                        </div>
                    </div>
                );
            });
        }

        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gens}, 1fr)`,
                gridTemplateRows: `repeat(${maxRows}, ${rowMinH}px)`,
                gap: 3,
                width: '100%',
            }}>
                {cells}
            </div>
        );
    };

    // ── Vertical certificate table (top-down layout) ──────────────────────────────
    const renderVerticalCertTable = (subject, gens, handleCardClick) => {
        if (!subject) return null;
        const vGenSlots = [];
        vGenSlots[0] = [
            { path: ['father'], isSire: true },
            { path: ['mother'], isSire: false },
        ];
        for (let g = 1; g < gens; g++) {
            vGenSlots[g] = [];
            for (const slot of vGenSlots[g - 1]) {
                vGenSlots[g].push({ path: [...slot.path, 'father'], isSire: true });
                vGenSlots[g].push({ path: [...slot.path, 'mother'], isSire: false });
            }
        }
        const totalCols = Math.pow(2, gens);
        // Compact profile for 4-gen vertical view so all rows fit portrait cleanly.
        const rowHeights = gens >= 4 ? [142, 141, 132, 185] : [160, 166, 138];
        const rows = [];
        const directGenCount = Math.min(gens, 3);
        for (let g = 0; g < directGenCount; g++) {
            const slots = vGenSlots[g];
            const colspan = totalCols / slots.length;
            const cellH = rowHeights[g] || 60;
            const cells = slots.map((slot, idx) => {
                const animal = getAncestor(subject, slot.path);
                return (
                    <td key={idx} colSpan={colspan} style={{ padding: 2, verticalAlign: 'middle', height: cellH }}>
                        <div style={{ height: '100%' }}>
                            {renderCertCell(animal, slot.isSire, handleCardClick, g, true)}
                        </div>
                    </td>
                );
            });
            rows.push(<tr key={g}>{cells}</tr>);
        }

        // For 4th generation in vertical view: render each gen3 ancestor's parents
        // stacked top/bottom (sire/dam) instead of 16 tiny left/right cells.
        if (gens >= 4) {
            const gen3Slots = vGenSlots[2] || [];
            const stackedColSpan = totalCols / gen3Slots.length;
            const rowH = rowHeights[3] || 132;
            const stackedCells = gen3Slots.map((slot, idx) => {
                const sire = getAncestor(subject, [...slot.path, 'father']);
                const dam = getAncestor(subject, [...slot.path, 'mother']);
                return (
                    <td key={idx} colSpan={stackedColSpan} style={{ padding: 2, verticalAlign: 'middle', height: rowH }}>
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ flex: 1, minHeight: 0 }}>
                                {renderCertCell(sire, true, handleCardClick, 3, true)}
                            </div>
                            <div style={{ flex: 1, minHeight: 0 }}>
                                {renderCertCell(dam, false, handleCardClick, 3, true)}
                            </div>
                        </div>
                    </td>
                );
            });
            rows.push(<tr key={3}>{stackedCells}</tr>);
        }
        return (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 3, tableLayout: 'fixed' }}>
                <tbody>{rows}</tbody>
            </table>
        );
    };
    const renderCertMainCard = (animal) => {
        if (!animal) return null;
        const imgSrc = animal.imageUrl || animal.photoUrl || null;
        const variety = [animal.color, animal.coatPattern, animal.coat].filter(Boolean).join(', ') || animal.variety || '';
        const fullName = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ');
        const isMale = animal.gender === 'Male';
        const isFemale = animal.gender === 'Female';
        const GenderIcon = isMale ? Mars : Venus;
        const cardBg = isMale ? '#dbeafe' : isFemale ? '#fce7f3' : '#f3f4f6';
        const cardBorder = isMale ? '#3b82f6' : isFemale ? '#934E69' : certBorderColor;

        return (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 6, padding: '8px 12px 20px 12px', boxSizing: 'border-box', height: '100%', position: 'relative' }}>
                {/* Gender icon top-right */}
                <div style={{ position: 'absolute', top: 4, right: 6 }}><GenderIcon size={22} color={certBorderColor} /></div>
                {/* Photo */}
                <div className="hide-for-pdf" style={{ width: 115, height: 115, flexShrink: 0, overflow: 'hidden', borderRadius: 8, border: `2px solid ${certBorderColor}`, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {imgSrc ? (
                        <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={46} />
                    ) : (
                        <Cat size={46} style={{ color: '#9ca3af' }} />
                    )}
                </div>
                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: 4 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: certFontColor }}>{fullName}</span>
                    </div>
                    <table style={{ borderCollapse: 'collapse', fontSize: '0.7rem' }}>
                        <tbody>
                            <tr>
                                <td style={{ color: '#6b7280', paddingRight: 6, whiteSpace: 'nowrap', fontWeight: 600, paddingBottom: 2 }}>Variation:</td>
                                <td style={{ color: certFontColor, wordBreak: 'break-word' }}>{variety || '—'}</td>
                            </tr>
                            {animal.geneticCode && (
                                <tr>
                                    <td style={{ color: '#6b7280', paddingRight: 6, whiteSpace: 'nowrap', fontWeight: 600, paddingBottom: 2 }}>Genotype:</td>
                                    <td style={{ color: certFontColor, fontFamily: 'monospace', wordBreak: 'break-word' }}>{animal.geneticCode}</td>
                                </tr>
                            )}
                            <tr>
                                <td style={{ color: '#6b7280', paddingRight: 6, whiteSpace: 'nowrap', fontWeight: 600, paddingBottom: 2 }}>Birth:</td>
                                <td style={{ color: certFontColor }}>{animal.birthDate ? formatDate(animal.birthDate) : '—'}</td>
                            </tr>
                            {animal.deceasedDate && (
                                <tr>
                                    <td style={{ color: '#dc2626', paddingRight: 6, fontWeight: 600, paddingBottom: 2 }}>Deceased:</td>
                                    <td style={{ color: '#dc2626' }}>{formatDate(animal.deceasedDate)}</td>
                                </tr>
                            )}
                            <tr>
                                <td style={{ color: '#6b7280', paddingRight: 6, whiteSpace: 'nowrap', fontWeight: 600, paddingBottom: 2 }}>Breeder:</td>
                                <td style={{ color: certFontColor, wordBreak: 'break-word' }}>{(animal.breederName && animal.breederName !== 'Anonymous Breeder') ? animal.breederName : '—'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {animal.id_public && <div style={{ position: 'absolute', bottom: 4, right: 8, fontSize: '0.62rem', color: '#6b7280', fontFamily: 'monospace', fontWeight: 600 }}>{animal.id_public}</div>}
            </div>
        );
    };

    const renderInlineSubjectCard = (animal) => {
        if (!animal) return null;
        const imgSrc = animal.imageUrl || animal.photoUrl || null;
        const variety = [animal.color, animal.coatPattern, animal.coat].filter(Boolean).join(', ') || animal.variety || '';
        const fullName = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ');
        const isMale = animal.gender === 'Male';
        const isFemale = animal.gender === 'Female';
        const GenderIcon = isMale ? Mars : Venus;
        const cardBg = isMale ? '#e8f1ff' : isFemale ? '#fdeef6' : '#f3f6fb';
        const cardBorder = isMale ? '#79a9ff' : isFemale ? '#f48abf' : '#b9c7db';

        return (
            <div style={{ backgroundColor: cardBg, border: `1.5px solid ${cardBorder}`, borderRadius: 10, padding: '10px', boxSizing: 'border-box', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 8, right: 8 }}><GenderIcon size={18} color={isMale ? '#3b82f6' : isFemale ? '#934E69' : '#64748b'} /></div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 86, height: 86, flexShrink: 0, overflow: 'hidden', borderRadius: 10, border: '1px solid #c9d5e6', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {imgSrc ? (
                            <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={34} />
                        ) : (
                            <Cat size={34} style={{ color: '#94a3b8' }} />
                        )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.15, overflowWrap: 'anywhere', paddingRight: 20 }}>{fullName || 'Unknown'}</div>
                        {variety && <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: 2, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{variety}</div>}
                        {animal.birthDate && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 3 }}>{formatDate(animal.birthDate)}</div>}
                        {animal.id_public && <div style={{ fontSize: '0.7rem', color: '#334155', fontFamily: 'monospace', marginTop: 4 }}>{animal.id_public}</div>}
                    </div>
                </div>
            </div>
        );
    };

    const getInlineAncestorDepth = (node) => {
        if (!node) return 0;
        const hasParent = !!(node.father || node.mother);
        if (!hasParent) return 0;
        const fatherDepth = getInlineAncestorDepth(node.father);
        const motherDepth = getInlineAncestorDepth(node.mother);
        return 1 + Math.max(fatherDepth, motherDepth);
    };

    const renderInlineRoundTree = (rootAnimal, gens, layoutRef = null) => {
        if (!rootAnimal) return null;

        const autoDepth = getInlineAncestorDepth(rootAnimal);
        const maxRequestedGens = Number.isFinite(gens) ? Math.max(0, gens) : autoDepth;
        const effectiveGens = Math.max(0, Math.min(autoDepth, maxRequestedGens));

        const nodeSize = 86;
        const nodeHalf = nodeSize / 2;
        const rowGap = 170;
        const padX = 120;
        const padY = 70;
        const leafGap = 120;

        const nodes = [];
        const edges = [];
        let leafIndex = 0;
        let maxDepth = 0;

        const buildSparse = (animal, depth, isSire, key) => {
            if (!animal) return null;

            maxDepth = Math.max(maxDepth, depth);
            const canExpand = depth < effectiveGens;

            const fatherLayout = canExpand && animal.father
                ? buildSparse(animal.father, depth + 1, true, `${key}-f`)
                : null;
            const motherLayout = canExpand && animal.mother
                ? buildSparse(animal.mother, depth + 1, false, `${key}-m`)
                : null;

            let xLeaf;
            if (fatherLayout && motherLayout) xLeaf = (fatherLayout.xLeaf + motherLayout.xLeaf) / 2;
            else if (fatherLayout) xLeaf = fatherLayout.xLeaf;
            else if (motherLayout) xLeaf = motherLayout.xLeaf;
            else {
                xLeaf = leafIndex;
                leafIndex += 1;
            }

            nodes.push({ key, animal, depth, isSire, xLeaf });

            if (fatherLayout) edges.push({ childKey: key, parentKey: fatherLayout.key });
            if (motherLayout) edges.push({ childKey: key, parentKey: motherLayout.key });

            return { key, xLeaf };
        };

        buildSparse(rootAnimal, 0, null, 'root');

        const leafCount = Math.max(1, leafIndex);
        const worldW = Math.max(900, padX * 2 + Math.max(0, leafCount - 1) * leafGap + nodeSize);
        const worldH = Math.max(520, padY * 2 + nodeSize + maxDepth * rowGap);

        const nodePos = new Map();
        nodes.forEach((n) => {
            const x = padX + n.xLeaf * leafGap + nodeHalf;
            const y = worldH - padY - nodeHalf - n.depth * rowGap;
            nodePos.set(n.key, { x, y });
        });

        const subjectPos = nodePos.get('root') || { x: worldW / 2, y: worldH - padY - nodeHalf };
        if (layoutRef) {
            layoutRef.current = {
                worldW,
                worldH,
                subjectX: subjectPos.x,
                subjectY: subjectPos.y,
            };
        }

        const edgePaths = edges.map(({ childKey, parentKey }) => {
            const child = nodePos.get(childKey);
            const parent = nodePos.get(parentKey);
            if (!child || !parent) return null;
            const startX = child.x;
            const startY = child.y - nodeHalf;
            const endX = parent.x;
            const endY = parent.y + nodeHalf;
            const midY = (startY + endY) / 2;
            return `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
        }).filter(Boolean);

        return (
            <div style={{ position: 'relative', width: worldW, height: worldH }}>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    {edgePaths.map((d, i) => (
                        <path key={i} d={d} fill="none" stroke="#8ea0ba" strokeWidth="2" strokeLinecap="round" />
                    ))}
                </svg>

                {nodes.map((n) => {
                    const a = n.animal;
                    const p = nodePos.get(n.key);
                    if (!p) return null;
                    const isUnknown = !a || a.isHidden;
                    const imgSrc = a && !a.isHidden ? (a.imageUrl || a.photoUrl || null) : null;
                    const isMale = a?.gender === 'Male' || (a?.gender !== 'Female' && n.isSire === true);
                    const isFemale = a?.gender === 'Female' || (a?.gender !== 'Male' && n.isSire === false);
                    const borderColor = isUnknown ? '#94a3b8' : isMale ? '#3b82f6' : isFemale ? '#934E69' : '#64748b';
                    const bgColor = isUnknown ? '#e5e7eb' : '#f8fafc';
                    const fullName = a && !a.isHidden ? [a.prefix, a.name, a.suffix].filter(Boolean).join(' ') : 'Unknown';
                    const clickable = !!(a && !a.isHidden && a.id_public);

                    return (
                        <div key={n.key} style={{ position: 'absolute', left: p.x - nodeHalf, top: p.y - nodeHalf, width: nodeSize, transform: 'translate(0, 0)' }}>
                            <div
                                onClick={clickable ? () => handleCardClick(a) : undefined}
                                style={{
                                    width: nodeSize,
                                    height: nodeSize,
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    border: `3px solid ${borderColor}`,
                                    background: bgColor,
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                    cursor: clickable ? 'pointer' : 'default',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                                title={fullName}
                            >
                                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f1f5f9' }}>
                                    {imgSrc ? (
                                        <AnimalImage src={imgSrc} alt={fullName} className="w-full h-full object-cover" iconSize={24} />
                                    ) : (
                                        <Cat size={32} style={{ color: '#94a3b8' }} />
                                    )}
                                </div>
                                <div style={{ width: '100%', background: 'rgba(255,255,255,0.95)', borderTop: '1px solid #cbd5e1', fontSize: '0.60rem', color: '#0f172a', fontWeight: 700, textAlign: 'center', padding: '2px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {fullName}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // ── Owner display helpers ──────────────────────────────────────────────
    const getOwnerDisplayName = () => {
        if (!ownerProfile) return '';
        const { showPersonalName, showBreederName, personalName, breederName, id_public } = ownerProfile;
        const parts = [];
        if (showPersonalName && personalName) parts.push(personalName);
        if (showBreederName && breederName) parts.push(breederName);
        return parts.join(' · ') || id_public || 'Anonymous Breeder';
    };

    // ── Shared Certificate JSX ─────────────────────────────────────────────
    const handleCardClick = (clickedAnimal) => {
        if (!clickedAnimal?.id_public) return;
        if (onViewAnimal) { onViewAnimal(clickedAnimal, 1, 5); }
        else {
            // Stay in modal: update the viewing animal and re-fetch its pedigree
            setCurrentViewingAnimal(clickedAnimal);
        }
    };

    const subject = currentViewingAnimal || displayData || pedigreeData;

    const certJsx = (
        <div
            ref={pedigreeRef}
            style={{
                backgroundColor: certBgColor,
                border: `1.5px solid ${certBorderColor}`,
                borderRadius: 8,
                padding: '6px 14px 10px 14px',
                position: 'relative',
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'Georgia, serif',
            }}
        >
            {/* ── Header row: Species | Title ──────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, borderBottom: `1px solid ${certBorderColor}`, paddingBottom: 4 }}>
                <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: certFontColor, lineHeight: 1.2 }}>{subject?.species || 'Unknown Species'}</div>
                    {subject?.species && getSpeciesLatinName(subject.species) && (
                        <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#6b7280' }}>{getSpeciesLatinName(subject.species)}</div>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontStyle: 'italic', fontWeight: 600, color: certFontColor }}>{certTextTopRight}</div>
                        {ownerProfile && (
                            <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: 2 }}>{getOwnerDisplayName()}</div>
                        )}
                    </div>
                    {ownerProfile && (ownerProfile.profileImage || ownerProfile.profileImageUrl || ownerProfile.imageUrl || ownerProfile.avatarUrl || ownerProfile.avatar || ownerProfile.profile_image) && (
                        <img
                            src={ownerProfile.profileImage || ownerProfile.profileImageUrl || ownerProfile.imageUrl || ownerProfile.avatarUrl || ownerProfile.avatar || ownerProfile.profile_image}
                            alt={getOwnerDisplayName()}
                            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${certBorderColor}`, flexShrink: 0 }}
                        />
                    )}
                </div>
            </div>

            {/* ── Top strip: main animal (50%) + text/signature (50%) ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: `1px dashed ${certBorderColor}` }}>
                {/* Left 50%: main animal card */}
                <div style={{ width: '50%' }}>
                    {subject && renderCertMainCard(subject)}
                </div>
                {/* Right 50%: cert text + logo + signature */}
                <div style={{ width: '50%', paddingLeft: 10, borderLeft: `1px dashed ${certBorderColor}`, display: 'flex', flexDirection: 'column' }}>
                    {certText && (
                        <div style={{ fontSize: '0.7rem', color: certFontColor, lineHeight: 1.6, flex: 1 }}>{certText}</div>
                    )}
                    <div style={{ marginTop: 'auto', borderTop: `1px solid ${certBorderColor}`, paddingTop: 4, textAlign: 'right' }}>
                        <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{certTextSignature}</div>
                    </div>
                </div>
            </div>

            {/* ── Ancestor table ── */}
            <div style={{ overflow: 'visible' }}>
                {subject ? (vertical ? renderVerticalCertTable(subject, vertGenerations, handleCardClick) : renderCertificateTable(subject, generations, handleCardClick)) : null}
            </div>

            {/* ── Footer ─────────────────────────────────────────── */}
            <div style={{ marginTop: 8, paddingTop: 6, borderTop: `1px solid ${certBorderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: '#9ca3af', fontStyle: 'italic' }}>{certTextBottomLeft}</div>
                <div style={{ fontSize: '0.6rem', color: '#6b7280' }}>{formatDate(new Date())}</div>
                <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>Created by CritterTrack</div>
            </div>
        </div>
    );

    const getTreeDepth = (node, d = 0) => {
        if (!node || node.isHidden) return d;
        return Math.max(getTreeDepth(node.father, d + 1), getTreeDepth(node.mother, d + 1));
    };

    const inlineDepth = subject ? getTreeDepth(subject) : 0;
    const resolvedInlineGens = inlineDepth > 0 ? inlineDepth : (inlineGenerations || 3);

    useEffect(() => {
        if (!inline || loading || !subject?.id_public) return;
        const layout = inlineTreeLayoutRef.current;
        const viewport = inlineViewportRef.current;
        if (!layout || !viewport) return;
        if (!Number.isFinite(layout.subjectX) || !Number.isFinite(layout.subjectY)) return;
        if (viewport.clientWidth <= 0 || viewport.clientHeight <= 0) return;

        const scale = Math.max(0.2, Math.min(2, inlineZoomPct / 100));
        const targetX = viewport.clientWidth / 2;
        const targetY = viewport.clientHeight - 80;
        const nextX = targetX - layout.subjectX * scale;
        const nextY = targetY - layout.subjectY * scale;
        if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) return;
        setInlinePan({ x: nextX, y: nextY });
    }, [inline, loading, subject?.id_public]);

    useEffect(() => {
        if (!inlineEnlarged || !subject?.id_public) return;
        const layout = enlargedTreeLayoutRef.current;
        const viewport = enlargedViewportRef.current;
        if (!layout || !viewport) return;
        if (!Number.isFinite(layout.subjectX) || !Number.isFinite(layout.subjectY)) return;
        if (viewport.clientWidth <= 0 || viewport.clientHeight <= 0) return;

        const scale = Math.max(0.2, Math.min(2, enlargedZoomPct / 100));
        const targetX = viewport.clientWidth / 2;
        const targetY = viewport.clientHeight - 100;
        const nextX = targetX - layout.subjectX * scale;
        const nextY = targetY - layout.subjectY * scale;
        if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) return;
        setEnlargedPan({ x: nextX, y: nextY });
    }, [inlineEnlarged, subject?.id_public]);

    if (loading) {
        if (inline) {
            return <div className="flex items-center justify-center py-12 gap-2 text-gray-400"><Loader2 size={18} className="animate-spin" /><span className="text-sm">Loading Family Tree...</span></div>;
        }
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-6xl w-full">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (inline) {
        const inlineGens = resolvedInlineGens;
        const inlineScale = Math.max(0.2, Math.min(2, inlineZoomPct / 100));
        const previewHeight = vertical ? 620 : 440;

        const handleInlineMouseDown = (e) => {
            inlineDragRef.current = {
                active: true,
                startX: e.clientX,
                startY: e.clientY,
                originX: inlinePan.x,
                originY: inlinePan.y,
            };
            setInlineDragging(true);
        };

        const handleInlineMouseMove = (e) => {
            if (!inlineDragRef.current.active) return;
            const dx = e.clientX - inlineDragRef.current.startX;
            const dy = e.clientY - inlineDragRef.current.startY;
            setInlinePan({ x: inlineDragRef.current.originX + dx, y: inlineDragRef.current.originY + dy });
        };

        const stopInlineDrag = () => {
            if (!inlineDragRef.current.active) return;
            inlineDragRef.current.active = false;
            setInlineDragging(false);
        };

        const inlineJsx = (
            <div
                ref={pedigreeRef}
                style={{
                    background: '#ffffff',
                    border: '1px solid #dbe3ee',
                    borderRadius: 12,
                    padding: 10,
                    width: 'max-content',
                    boxSizing: 'border-box',
                    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                }}
            >
                {subject ? renderInlineRoundTree(subject, inlineGens, inlineTreeLayoutRef) : null}
            </div>
        );

        return (
            <>
                <div className="w-full rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                    <div className="px-4 pt-3 pb-2">
                        <div className="flex items-center gap-3 mb-2">
                            <input
                                type="range"
                                min={20}
                                max={120}
                                step={1}
                                value={inlineZoomPct}
                                onChange={(e) => setInlineZoomPct(Number(e.target.value))}
                                className="flex-1 accent-primary"
                            />
                            <span className="text-white bg-primary rounded px-2 py-0.5 text-sm font-bold min-w-[48px] text-center">{inlineZoomPct}%</span>
                        </div>

                        <div
                            ref={inlineViewportRef}
                            className="border border-gray-200 bg-slate-50 overflow-hidden"
                            style={{ height: previewHeight, cursor: inlineDragging ? 'grabbing' : 'grab' }}
                            onMouseDown={handleInlineMouseDown}
                            onMouseMove={handleInlineMouseMove}
                            onMouseUp={stopInlineDrag}
                            onMouseLeave={stopInlineDrag}
                        >
                            <div
                                style={{
                                    transform: `translate(${inlinePan.x}px, ${inlinePan.y}px) scale(${inlineScale})`,
                                    transformOrigin: 'top left',
                                    padding: 8,
                                    boxSizing: 'border-box',
                                }}
                            >
                                {inlineJsx}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => { setInlineEnlarged(true); setEnlargedZoomPct(60); setEnlargedPan({ x: 12, y: 12 }); }}
                            className="mt-2 text-2xl text-gray-800 hover:underline"
                        >
                            View it enlarged
                        </button>
                    </div>
                </div>

                {inlineEnlarged && (
                    <div className="fixed inset-0 z-[200] bg-black bg-opacity-80 flex flex-col">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white flex-shrink-0">
                            <span className="font-semibold text-sm">Full Pedigree Tree</span>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min={20}
                                    max={150}
                                    step={1}
                                    value={enlargedZoomPct}
                                    onChange={(e) => setEnlargedZoomPct(Number(e.target.value))}
                                    className="w-40 accent-primary"
                                />
                                <span className="text-sm font-bold min-w-[48px] text-center">{enlargedZoomPct}%</span>
                                <button
                                    type="button"
                                    onClick={() => setInlineEnlarged(false)}
                                    className="ml-4 text-white hover:text-red-400 text-2xl leading-none"
                                >&times;</button>
                            </div>
                        </div>
                        <div
                            ref={enlargedViewportRef}
                            className="flex-1 overflow-hidden"
                            style={{ cursor: enlargedDragging ? 'grabbing' : 'grab' }}
                            onMouseDown={(e) => {
                                enlargedDragRef.current = { active: true, startX: e.clientX, startY: e.clientY, originX: enlargedPan.x, originY: enlargedPan.y };
                                setEnlargedDragging(true);
                            }}
                            onMouseMove={(e) => {
                                if (!enlargedDragRef.current.active) return;
                                setEnlargedPan({ x: enlargedDragRef.current.originX + e.clientX - enlargedDragRef.current.startX, y: enlargedDragRef.current.originY + e.clientY - enlargedDragRef.current.startY });
                            }}
                            onMouseUp={() => { enlargedDragRef.current.active = false; setEnlargedDragging(false); }}
                            onMouseLeave={() => { enlargedDragRef.current.active = false; setEnlargedDragging(false); }}
                        >
                            <div
                                style={{
                                    transform: `translate(${enlargedPan.x}px, ${enlargedPan.y}px) scale(${Math.max(0.2, Math.min(2, enlargedZoomPct / 100))})`,
                                    transformOrigin: 'top left',
                                    padding: 8,
                                    boxSizing: 'border-box',
                                }}
                            >
                                <div style={{ background: '#ffffff', borderRadius: 12, padding: 10, width: 'max-content', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
                                    {subject ? renderInlineRoundTree(subject, inlineGens, enlargedTreeLayoutRef) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {stackedPedigree && (
                    <div className="fixed inset-0 z-[90]">
                        <PedigreeChart 
                            animalId={stackedPedigree.id_public} 
                            animalData={stackedPedigree} 
                            onClose={() => { setStackedPedigree(null); setCurrentViewingAnimal(null); }} 
                            API_BASE_URL={API_BASE_URL} 
                            authToken={authToken} 
                        />
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen flex justify-center pt-2 sm:pt-4 pb-2 sm:pb-4 px-2 sm:px-4">
                <div className={`relative bg-white rounded-xl shadow-2xl h-fit w-full ${vertical ? 'max-w-[860px]' : 'max-w-[98vw] sm:max-w-[95vw]'}`}>
                    {/* Header */}
                    <div className="flex justify-between items-center px-3 sm:px-6 pr-12 sm:pr-14 py-2 sm:py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl flex-wrap gap-2">
                        <h2 className="text-base sm:text-xl font-bold text-gray-800 flex items-center gap-1">
                            <ScrollText size={16} />
                            <span>Pedigree Certificate</span>
                        </h2>

                        {/* Generation slider */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Network size={14} className="flex-shrink-0" />
                            <span className="text-xs hidden sm:inline">Generations:</span>
                            {vertical ? (
                                <>
                                <input
                                    type="range" min={1} max={4} step={1}
                                    value={vertGenerations}
                                    onChange={e => setVertGenerations(Number(e.target.value))}
                                    className="w-20 accent-primary cursor-pointer"
                                />
                                <span className="text-xs font-bold w-4">{vertGenerations}</span>
                                </>
                            ) : (
                                <>
                                <input
                                    type="range" min={1} max={4} step={1}
                                    value={generations}
                                    onChange={e => setGenerations(Number(e.target.value))}
                                    className="w-20 accent-primary cursor-pointer"
                                />
                                <span className="text-xs font-bold w-4">{generations}</span>
                                </>
                            )}
                        </div>

                        {/* Customise toggle */}
                        <button
                            onClick={() => setShowCustomPanel(p => !p)}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition ${showCustomPanel ? 'bg-primary/10 border-primary text-primary' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Palette size={13} /> Customise
                        </button>

                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={downloadPDF}
                                disabled={!imagesLoaded}
                                data-tutorial-target="download-pdf-btn"
                                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 font-semibold rounded-lg transition text-xs sm:text-base ${imagesLoaded ? 'bg-primary hover:bg-primary/90 text-black cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                title={!imagesLoaded ? 'Waiting for images to load...' : 'Download PDF'}
                            >
                                <Download size={16} />
                                <span className="hidden sm:inline">{isSaving ? 'Saving...' : imagesLoaded ? 'Save PDF' : 'Loading...'}</span>
                                <span className="sm:hidden">{isSaving ? '...' : imagesLoaded ? 'PDF' : '...'}</span>
                            </button>
                            <button
                                onClick={downloadImage}
                                disabled={!imagesLoaded || isSaving}
                                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 font-semibold rounded-lg transition text-xs sm:text-base ${imagesLoaded && !isSaving ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                title={!imagesLoaded ? 'Waiting for images to load...' : `Save as Image (A4 ${vertical ? 'Portrait' : 'Landscape'})`}
                            >
                                <Images size={16} />
                                <span className="hidden sm:inline">{isSaving ? 'Saving...' : imagesLoaded ? 'Save Image' : 'Loading...'}</span>
                                <span className="sm:hidden">{isSaving ? '...' : imagesLoaded ? 'Img' : '...'}</span>
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition z-10"
                        aria-label="Close certificate"
                    >
                        <X size={20} />
                    </button>

                    {/* Customise panel */}
                    {showCustomPanel && (
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                            <label className="flex flex-col gap-1">
                                <span className="text-gray-500 font-medium">Top-right title</span>
                                <input className="border rounded px-2 py-1" value={certTextTopRight} onChange={e => setCertTextTopRight(e.target.value)} />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-gray-500 font-medium">Centre text</span>
                                <textarea className="border rounded px-2 py-1 resize-none" rows={2} value={certText} onChange={e => setCertText(e.target.value)} />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-gray-500 font-medium">Bottom-left text</span>
                                <input className="border rounded px-2 py-1" value={certTextBottomLeft} onChange={e => setCertTextBottomLeft(e.target.value)} />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-gray-500 font-medium">Signature label</span>
                                <input className="border rounded px-2 py-1" value={certTextSignature} onChange={e => setCertTextSignature(e.target.value)} />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-gray-500 font-medium">Font colour</span>
                                <div className="flex gap-1 items-center">
                                    <input type="color" className="w-8 h-7 cursor-pointer rounded border" value={certFontColor} onChange={e => setCertFontColor(e.target.value)} />
                                    <input className="border rounded px-2 py-1 flex-1" value={certFontColor} onChange={e => setCertFontColor(e.target.value)} />
                                </div>
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-gray-500 font-medium">Border colour</span>
                                <div className="flex gap-1 items-center">
                                    <input type="color" className="w-8 h-7 cursor-pointer rounded border" value={certBorderColor} onChange={e => setCertBorderColor(e.target.value)} />
                                    <input className="border rounded px-2 py-1 flex-1" value={certBorderColor} onChange={e => setCertBorderColor(e.target.value)} />
                                </div>
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-gray-500 font-medium">Background colour</span>
                                <div className="flex gap-1 items-center">
                                    <input type="color" className="w-8 h-7 cursor-pointer rounded border" value={certBgColor} onChange={e => setCertBgColor(e.target.value)} />
                                    <input className="border rounded px-2 py-1 flex-1" value={certBgColor} onChange={e => setCertBgColor(e.target.value)} />
                                </div>
                            </label>

                        </div>
                    )}

                    {/* Content */}
                    <div className={`p-3 sm:p-6 ${vertical ? '' : 'overflow-x-auto'}`} style={{ paddingBottom: window.innerWidth < 640 ? '80px' : '1.5rem' }}>
                        <div style={vertical ? { width: '100%' } : { minWidth: 700 }}>{certJsx}</div>
                    </div>
                </div>
            </div>

            {/* Stacked Pedigree Modal */}
            {stackedPedigree && (
                <div className="fixed inset-0 z-[90]">
                    <PedigreeChart
                        animalId={stackedPedigree.id_public}
                        animalData={stackedPedigree}
                        onClose={() => setStackedPedigree(null)}
                        API_BASE_URL={API_BASE_URL}
                        authToken={authToken}
                        onViewAnimal={onViewAnimal}
                    />
                </div>
            )}
        </div>
    );
});

const AnimalForm = (props) => {
    return <AnimalFormModalV2 {...props} />;
};

export default AnimalForm;
export { PedigreeChart, prefetchPedigreeTree };
