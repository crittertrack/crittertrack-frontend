import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
    Plus, X, Trash2, Edit, Search, Loader2, ChevronDown, ChevronUp,
    Heart, HeartOff, Eye, EyeOff, ArrowLeftRight, Home, Hourglass, Bean, Milk
} from 'lucide-react';

const LitterManagement = ({ authToken, API_BASE_URL, userProfile, showModalMessage, onViewAnimal, formDataRef, onFormOpenChange, speciesOptions = [] }) => {
    const [litters, setLitters] = useState([]);
    const [myAnimals, setMyAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        breedingPairCodeName: '',
        sireId_public: '',
        damId_public: '',
        species: '',
        birthDate: '',
        maleCount: null,
        femaleCount: null,
        unknownCount: null,
        notes: '',
        linkedOffspringIds: [],
        // Enhanced breeding record fields
        breedingMethod: 'Unknown',
        breedingConditionAtTime: '',
        matingDate: '',
        outcome: 'Unknown',
        birthMethod: '',
        litterSizeBorn: null,
        litterSizeWeaned: null,
        stillbornCount: null,
        expectedDueDate: '',
        weaningDate: ''
    });
    const [createOffspringCounts, setCreateOffspringCounts] = useState({
        males: 0,
        females: 0,
        unknown: 0
    });
    
    const [linkingAnimals, setLinkingAnimals] = useState(false);
    const [availableToLink, setAvailableToLink] = useState({ litter: null, animals: [] });
    const [expandedLitter, setExpandedLitter] = useState(null);
    const [editingLitter, setEditingLitter] = useState(null);
    const [litterImages, setLitterImages] = useState([]);
    const [litterImageUploading, setLitterImageUploading] = useState(false);
    const [pendingLitterImages, setPendingLitterImages] = useState([]);
    const [showLitterImageModal, setShowLitterImageModal] = useState(false);
    const [enlargedLitterImageUrl, setEnlargedLitterImageUrl] = useState(null);

    const handleLitterImageDownload = async (imageUrl) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `crittertrack-litter-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Failed to download image:', error);
        }
    };

    const [modalTarget, setModalTarget] = useState(null);
    const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);
    const [selectedSireAnimal, setSelectedSireAnimal] = useState(null);
    const [selectedDamAnimal, setSelectedDamAnimal] = useState(null);
    const [selectedTpSireAnimal, setSelectedTpSireAnimal] = useState(null);
    const [selectedTpDamAnimal, setSelectedTpDamAnimal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');

    // COI calculation state
    const [predictedCOI, setPredictedCOI] = useState(null);
    const [calculatingCOI, setCalculatingCOI] = useState(false);
    const [addingOffspring, setAddingOffspring] = useState(null);
    const [newOffspringData, setNewOffspringData] = useState({
        name: '',
        gender: '',
        color: '',
        coat: '',
        remarks: ''
    });
    const [bulkDeleteMode, setBulkDeleteMode] = useState({});
    const [selectedOffspring, setSelectedOffspring] = useState({});
    const [coiCalculating, setCoiCalculating] = useState(new Set());
    
    const coiCacheRef = useRef({});
    const [myAnimalsLoaded, setMyAnimalsLoaded] = useState(false);
    const [litterOffspringMap, setLitterOffspringMap] = useState({});
    const [offspringRefetchToken, setOffspringRefetchToken] = useState(0);
    const [viewMode, setViewMode] = useState('list');
    const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
    const [calendarTooltip, setCalendarTooltip] = useState(null);
    const [urgencyEnabled, setUrgencyEnabled] = useState(() => {
        try { return localStorage.getItem('ct_urgency_enabled') !== 'false'; } catch { return true; }
    });

    const toggleUrgency = () => {
        const next = !urgencyEnabled;
        setUrgencyEnabled(next);
        try {
            localStorage.setItem('ct_urgency_enabled', next ? 'true' : 'false');
            window.dispatchEvent(new StorageEvent('storage', { key: 'ct_urgency_enabled' }));
        } catch {}
    };

    // Mating quick-add form state
    const [showAddMatingForm, setShowAddMatingForm] = useState(false);
    const [editingMatingId, setEditingMatingId] = useState(null);
    const [matingEditChoice, setMatingEditChoice] = useState(null);
    const [matingData, setMatingData] = useState({ sireId_public: '', damId_public: '', matingDate: '', expectedDueDate: '', breedingMethod: 'Natural', breedingConditionAtTime: '', species: '', notes: '' });
    const [selectedMatingSire, setSelectedMatingSire] = useState(null);
    const [selectedMatingDam, setSelectedMatingDam] = useState(null);
    const [showMatingBreedingDetails, setShowMatingBreedingDetails] = useState(false);
    const [matingCOI, setMatingCOI] = useState(null);
    const [matingCalcCOI, setMatingCalcCOI] = useState(false);
    const [showMatingSpeciesPicker, setShowMatingSpeciesPicker] = useState(false);

    // Test Pairing modal state
    const [showTestPairingModal, setShowTestPairingModal] = useState(false);
    const [tpSireId, setTpSireId] = useState('');
    const [tpDamId, setTpDamId] = useState('');
    const [tpCOI, setTpCOI] = useState(null);
    const [tpCalculating, setTpCalculating] = useState(false);
    const [tpError, setTpError] = useState(null);

    const handleCalculateTestPairing = async () => {
        if (!tpSireId || !tpDamId) return;
        const cacheKey = `${tpSireId}:${tpDamId}`;
        if (coiCacheRef.current[cacheKey] != null) {
            setTpCOI(coiCacheRef.current[cacheKey]);
            return;
        }
        setTpCalculating(true);
        setTpError(null);
        setTpCOI(null);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            const res = await axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
                params: { sireId: tpSireId, damId: tpDamId, generations: 20 },
                headers: { Authorization: `Bearer ${authToken}` },
                signal: controller.signal,
            });
            const val = res.data.inbreedingCoefficient ?? 0;
            coiCacheRef.current[cacheKey] = val;
            setTpCOI(val);
        } catch (err) {
            if (axios.isCancel(err)) setTpError('Request timed out – please try again.');
            else setTpError('Failed to calculate COI. Please try again.');
        } finally {
            clearTimeout(timeout);
            setTpCalculating(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await fetchLitters();
            } catch (error) {
                console.error('Error loading litters:', error);
            } finally {
                setLoading(false);
            }
            fetchMyAnimals().catch(err => console.error('Error loading animals:', err));
        };
        loadData();
    }, []);

    useEffect(() => {
        if (formDataRef) {
            formDataRef.current = formData;
        }
    }, [formData, formDataRef]);

    useEffect(() => {
        if (onFormOpenChange) {
            onFormOpenChange(showAddForm);
        }
    }, [showAddForm, onFormOpenChange]);

    useEffect(() => {
        if (!expandedLitter || !authToken) return;
        if (litterOffspringMap[expandedLitter] !== undefined) return;
        const litter = litters.find(l => l._id === expandedLitter);
        if (!litter) return;
        axios.get(`${API_BASE_URL}/litters/${litter.litter_id_public}/offspring`, {
            headers: { Authorization: `Bearer ${authToken}` }
        }).then(res => {
            setLitterOffspringMap(prev => ({ ...prev, [expandedLitter]: res.data || [] }));
        }).catch(() => {
            setLitterOffspringMap(prev => ({ ...prev, [expandedLitter]: [] }));
        });
    }, [expandedLitter, litters, authToken, API_BASE_URL, offspringRefetchToken]);

    const toggleBulkDeleteMode = (litterId) => {
        setBulkDeleteMode(prev => ({ ...prev, [litterId]: !prev[litterId] }));
        setSelectedOffspring(prev => ({ ...prev, [litterId]: [] }));
    };

    const toggleOffspringSelection = (litterId, animalId) => {
        setSelectedOffspring(prev => {
            const current = prev[litterId] || [];
            const updated = current.includes(animalId)
                ? current.filter(id => id !== animalId)
                : [...current, animalId];
            return { ...prev, [litterId]: updated };
        });
    };

    const handleBulkDeleteOffspring = async (litterId) => {
        const selectedIds = selectedOffspring[litterId] || [];
        if (selectedIds.length === 0) {
            showModalMessage('No Selection', 'Please select at least one offspring to delete.');
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedIds.length} offspring animal(s)? This action cannot be undone.`);
        if (!confirmDelete) return;

        try {
            setLoading(true);
            for (const id of selectedIds) {
                await axios.delete(`${API_BASE_URL}/animals/${id}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            }
            showModalMessage('Success', `Successfully deleted ${selectedIds.length} offspring animal(s).`);
            setBulkDeleteMode(prev => ({ ...prev, [litterId]: false }));
            setSelectedOffspring(prev => ({ ...prev, [litterId]: [] }));
            await fetchLitters();
            await fetchMyAnimals();
        } catch (error) {
            console.error('Error deleting offspring:', error);
            showModalMessage('Error', 'Failed to delete some offspring. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchLitters = useCallback(async ({ preserveOffspring = false } = {}) => {
        try {
            if (!preserveOffspring) {
                setLitterOffspringMap({});
            }
            setOffspringRefetchToken(t => t + 1);
            const response = await axios.get(`${API_BASE_URL}/litters`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const littersData = Array.isArray(response.data) ? response.data : [];
            
            setLitters(littersData);
            
            const littersNeedingCOI = littersData.filter(l => {
                if (!l.sireId_public || !l.damId_public) return false;
                if (l.inbreedingCoefficient != null) return false;
                const cacheKey = `${l.sireId_public}:${l.damId_public}`;
                if (coiCacheRef.current[cacheKey] != null) {
                    setLitters(prev => prev.map(x => x._id === l._id ? { ...x, inbreedingCoefficient: coiCacheRef.current[cacheKey] } : x));
                    return false;
                }
                return true;
            });
            
            if (littersNeedingCOI.length > 0) {
                setCoiCalculating(new Set(littersNeedingCOI.map(l => l._id)));
                littersNeedingCOI.forEach(async (litter) => {
                    const cacheKey = `${litter.sireId_public}:${litter.damId_public}`;
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 15000);
                    try {
                        const coiResponse = await axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
                            params: { sireId: litter.sireId_public, damId: litter.damId_public, generations: 20 },
                            headers: { Authorization: `Bearer ${authToken}` },
                            signal: controller.signal,
                        });
                        const coi = coiResponse.data.inbreedingCoefficient ?? 0;
                        coiCacheRef.current[cacheKey] = coi;
                        setLitters(prev => prev.map(l => l._id === litter._id ? { ...l, inbreedingCoefficient: coi } : l));
                        axios.put(`${API_BASE_URL}/litters/${litter._id}`, { inbreedingCoefficient: coi }, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }).catch(() => {});
                    } catch { coiCacheRef.current[cacheKey] = 0; }
                    finally {
                        clearTimeout(timeout);
                        setCoiCalculating(prev => { const next = new Set(prev); next.delete(litter._id); return next; });
                    }
                });
            }

            littersData.forEach(litter => {
                axios.get(`${API_BASE_URL}/litters/${litter.litter_id_public}/offspring`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                }).then(res => {
                    const offspring = Array.isArray(res.data) ? res.data : [];
                    setLitterOffspringMap(prev => ({ ...prev, [litter._id]: offspring }));

                    if (offspring.length === 0) return;
                    const linkedMales   = offspring.filter(a => a.gender === 'Male').length;
                    const linkedFemales = offspring.filter(a => a.gender === 'Female').length;
                    const linkedUnknown = offspring.filter(a => a.gender !== 'Male' && a.gender !== 'Female').length;
                    const linkedTotal   = offspring.length;
                    const storedMales   = litter.maleCount   ?? 0;
                    const storedFemales = litter.femaleCount  ?? 0;
                    const storedUnknown = litter.unknownCount ?? 0;
                    const storedBorn    = litter.litterSizeBorn ?? litter.numberBorn ?? 0;
                    const newBorn = Math.max(storedBorn, linkedTotal);
                    if (newBorn !== storedBorn) {
                        const patch = { litterSizeBorn: newBorn || null, numberBorn: newBorn || null };
                        setLitters(prev => prev.map(l => l._id === litter._id ? { ...l, ...patch } : l));
                        axios.put(`${API_BASE_URL}/litters/${litter._id}`, patch, { headers: { Authorization: `Bearer ${authToken}` } }).catch(() => {});
                    }
                }).catch(() => {
                    setLitterOffspringMap(prev => ({ ...prev, [litter._id]: [] }));
                });
            });
        } catch (error) {
            console.error('Error fetching litters:', error);
            setLitters([]);
        }
    }, [authToken, API_BASE_URL]);

    const fetchMyAnimals = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const animalsData = response.data || [];
            
            setMyAnimals(animalsData);
            setMyAnimalsLoaded(true);
            
            Promise.resolve().then(async () => {
                for (const animal of animalsData) {
                    if ((animal.fatherId_public || animal.motherId_public || animal.sireId_public || animal.damId_public)) {
                        try {
                            const coiResponse = await axios.get(`${API_BASE_URL}/animals/${animal.id_public}/inbreeding`, {
                                params: { generations: 50 },
                                headers: { Authorization: `Bearer ${authToken}` }
                            });
                            animal.inbreedingCoefficient = coiResponse.data.inbreedingCoefficient;
                        } catch (error) {
                            console.log(`Could not update COI for animal ${animal.id_public}:`, error);
                        }
                    } else {
                        animal.inbreedingCoefficient = 0;
                    }
                }
                setMyAnimals([...animalsData]);
            });
        } catch (error) {
            console.error('Error fetching animals:', error);
            setMyAnimals([]);
        }
    }, [authToken, API_BASE_URL]);

    const handleSelectOtherParentForLitter = (animal) => {
        if (modalTarget === 'sire-litter') {
            setFormData(prev => ({...prev, sireId_public: animal?.id_public || '', species: prev.species || animal?.species || ''}));
            setSelectedSireAnimal(animal || null);
        } else if (modalTarget === 'dam-litter') {
            setFormData(prev => ({...prev, damId_public: animal?.id_public || '', species: prev.species || animal?.species || ''}));
            setSelectedDamAnimal(animal || null);
        } else if (modalTarget === 'tp-sire') {
            setTpSireId(animal?.id_public || '');
            setSelectedTpSireAnimal(animal || null);
            setTpCOI(null);
            setTpError(null);
        } else if (modalTarget === 'tp-dam') {
            setTpDamId(animal?.id_public || '');
            setSelectedTpDamAnimal(animal || null);
            setTpCOI(null);
            setTpError(null);
        } else if (modalTarget === 'sire-mating') {
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

    return (
        <div>
            {/* LitterManagement component content */}
            <p>Litter Management Component - Extracted from app.jsx</p>
            <p>Total litters: {litters.length}</p>
            <p>Total animals: {myAnimals.length}</p>
        </div>
    );
};

export default LitterManagement;
