import React, { useState, useEffect, useCallback, useRef, useImperativeHandle, useMemo } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode.react';
import { QRCodeSVG } from 'qrcode.react';
import { Link as RouterLink } from 'react-router-dom';

// Lucide React Icons
import {
    Mars, Venus, VenusAndMars, Circle, Cat, QrCode, Edit, Archive, Heart, HeartOff, Eye, EyeOff,
    ChevronDown, ChevronRight, ChevronUp, ArrowLeft, X, ClipboardList, Lock, Tag, Palette, Dna,
    TreeDeciduous, Egg, Hospital, Home, Brain, FileText, Trophy, FileCheck, Scale, Images, ScrollText,
    Shield, Microscope, Pill, Stethoscope, UtensilsCrossed, Droplets, Thermometer, Scissors, MessageSquare,
    Activity, AlertTriangle, Medal, Target, Key, Ban, Check, RefreshCw, Leaf, ArrowRight, Hourglass,
    Users, FolderOpen, Globe, Sparkles, Sprout, Ruler, Feather, Download, Loader2, Camera, Network,
    TableOfContents, BookOpen, RotateCcw, ArrowLeftRight, Hash
} from 'lucide-react';

// Utilities
import { useDetailFieldTemplate, parseJsonField, DetailJsonList, computeRelationships, ViewOnlyParentCard, ParentMiniCard } from './utils';
import { formatDate, litterAge } from '../../utils/dateFormatter';
import { getCurrencySymbol, getCountryFlag, getCountryName } from '../../utils/locationUtils';
import { getSpeciesLatinName } from '../../utils/speciesUtils';
import { QRModal } from '../PublicProfile/PublicProfileView';

const PrivateAnimalDetail = ({ animal, onClose, onCloseAll, onEdit, onArchive, API_BASE_URL, authToken, setShowImageModal, setEnlargedImageUrl, onUpdateAnimal, showModalMessage, onTransfer, onViewAnimal, onViewPublicAnimal, onToggleOwned, userProfile, userAnimals = [], breedingLineDefs = [], animalBreedingLines = {}, toggleAnimalBreedingLine, initialTab = 1, initialBetaView = 'vertical' }) => {
    const [breederInfo, setBreederInfo] = useState(null);
    const [showPedigree, setShowPedigree] = useState(false);
    const [detailViewTab, setDetailViewTab] = useState(initialTab);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [enclosureInfo, setEnclosureInfo] = useState(null);
    const [animalLogs, setAnimalLogs] = useState(null); // null = not yet fetched
    const [animalLogsLoading, setAnimalLogsLoading] = useState(false);
    const [animalCOI, setAnimalCOI] = useState(null);
    const [loadingCOI, setLoadingCOI] = useState(false);
    const [collapsedHealthSections, setCollapsedHealthSections] = useState({});
    const [breedingRecordOffspring, setBreedingRecordOffspring] = useState({});
    const [expandedBreedingRecords, setExpandedBreedingRecords] = useState({});
    const [animalLitters, setAnimalLitters] = useState(null);
    const [pedigreeOffspring, setPedigreeOffspring] = useState(null);
    const [expandedPedigreeRecords, setExpandedPedigreeRecords] = useState({});
    const [ownedAnimals, setOwnedAnimals] = useState(userAnimals); // may be pre-seeded from parent or fetched lazily
    const [ownedAnimalsLoaded, setOwnedAnimalsLoaded] = useState(false); // Track when fetch completes
    const ownedAnimalsLoadedRef = useRef(false); // Always fetch to get complete list
    const [globalRels, setGlobalRels] = useState(null); // null = not yet fetched
    const [globalRelsLoading, setGlobalRelsLoading] = useState(false);
    const [parentCardKey, setParentCardKey] = useState(0); // increment to force parent cards to refetch
    // Manual Pedigree (Beta) • Tab 16
    const [mpDownloading, setMpDownloading] = useState(false);
    const [mpLoading, setMpLoading] = useState(false);
    const mpTreeRef = useRef(null);
    const chartRef = useRef(null);
    const [mpEnrichedData, setMpEnrichedData] = useState(null);
    const [betaPedigreeView, setBetaPedigreeView] = useState(initialBetaView);
    useEffect(() => {
        if (detailViewTab !== 5) return;
        let cancelled = false;
        setMpLoading(true);
        (async () => {
            const manual = animal?.manualPedigree || {};
            const toSlot = (a) => {
                const variety = ['color','coatPattern','coat','earset','phenotype','morph','markings'].map(k => a[k]).filter(Boolean).join(' ');
                return { mode: 'ctc', ctcId: a.id_public || '', prefix: a.prefix || '', name: a.name || '', suffix: a.suffix || '', variety, genCode: a.geneticCode || '', birthDate: a.birthDate ? String(a.birthDate).slice(0,10) : '', deceasedDate: a.deceasedDate ? String(a.deceasedDate).slice(0,10) : '', breederName: a.breederName || a.manualBreederName || '', gender: a.gender || '', imageUrl: a.imageUrl || a.photoUrl || '', notes: '' };
            };
            const fetchOne = async (id) => {
                if (!id) return null;
                try { const r = await axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${authToken}` } }); return r.data || null; }
                catch { return null; }
            };
            // Level 1: parents
            const [sire, dam] = await Promise.all([
                fetchOne(animal?.sireId_public || animal?.fatherId_public),
                fetchOne(animal?.damId_public  || animal?.motherId_public),
            ]);
            if (cancelled) return;
            // Level 2: grandparents
            const [ss, sd, ds, dd] = await Promise.all([
                fetchOne(sire?.sireId_public || sire?.fatherId_public),
                fetchOne(sire?.damId_public  || sire?.motherId_public),
                fetchOne(dam?.sireId_public  || dam?.fatherId_public),
                fetchOne(dam?.damId_public   || dam?.motherId_public),
            ]);
            if (cancelled) return;
            // Level 3: great-grandparents
            const [sss, ssd, sds, sdd, dss, dsd, dds, ddd] = await Promise.all([
                fetchOne(ss?.sireId_public || ss?.fatherId_public),
                fetchOne(ss?.damId_public  || ss?.motherId_public),
                fetchOne(sd?.sireId_public || sd?.fatherId_public),
                fetchOne(sd?.damId_public  || sd?.motherId_public),
                fetchOne(ds?.sireId_public || ds?.fatherId_public),
                fetchOne(ds?.damId_public  || ds?.motherId_public),
                fetchOne(dd?.sireId_public || dd?.fatherId_public),
                fetchOne(dd?.damId_public  || dd?.motherId_public),
            ]);
            if (cancelled) return;
            // Build seeded slots from linked ancestry
            const seeded = {};
            if (sire) seeded.sire         = toSlot(sire);
            if (dam)  seeded.dam          = toSlot(dam);
            if (ss)   seeded.sireSire     = toSlot(ss);
            if (sd)   seeded.sireDam      = toSlot(sd);
            if (ds)   seeded.damSire      = toSlot(ds);
            if (dd)   seeded.damDam       = toSlot(dd);
            if (sss)  seeded.sireSireSire = toSlot(sss);
            if (ssd)  seeded.sireSireDam  = toSlot(ssd);
            if (sds)  seeded.sireDamSire  = toSlot(sds);
            if (sdd)  seeded.sireDamDam   = toSlot(sdd);
            if (dss)  seeded.damSireSire  = toSlot(dss);
            if (dsd)  seeded.damSireDam   = toSlot(dsd);
            if (dds)  seeded.damDamSire   = toSlot(dds);
            if (ddd)  seeded.damDamDam    = toSlot(ddd);
            // Overlay seeded (real CTC links) on top of manual entries • seed wins
            const merged = {};
            Object.entries(manual).forEach(([k, v]) => {
                if (v && (v.ctcId || v.name || v.prefix || v.suffix)) merged[k] = v;
            });
            Object.assign(merged, seeded);
            if (!cancelled) { setMpEnrichedData(merged); setMpLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [detailViewTab, animal?.id_public]);
    useEffect(() => { setMpEnrichedData(null); setMpLoading(false); }, [animal?.id_public]);
    useEffect(() => { setDetailViewTab(initialTab); setBetaPedigreeView(initialBetaView); }, [animal?.id_public, initialTab, initialBetaView]);

    // Fetch ALL animals on the account + global relationships on mount
    useEffect(() => {
        if (ownedAnimalsLoadedRef.current || !authToken || !animal?.id_public) return;
        ownedAnimalsLoadedRef.current = true;
        // Fetch both in PARALLEL instead of sequential for faster load
        setGlobalRelsLoading(true);
        Promise.all([
            axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` }
            }),
            axios.get(`${API_BASE_URL}/animals/${animal.id_public}/relationships`, {
                headers: { Authorization: `Bearer ${authToken}` }
            })
        ]).then(([animalsRes, relsRes]) => {
            setOwnedAnimals(animalsRes.data || []);
            setOwnedAnimalsLoaded(true);
            setGlobalRels(relsRes.data || null);
            setGlobalRelsLoading(false);
        }).catch(err => {
            console.error('Error fetching animals or relationships:', err);
            setOwnedAnimalsLoaded(true);
            setGlobalRelsLoading(false);
        });
    }, [authToken, API_BASE_URL, animal?.id_public, userAnimals]);

    // Relationship Insights • computed from all account animals (shown in Lineage tab)
    const relationships = useMemo(() => computeRelationships(animal, ownedAnimals), [animal, ownedAnimals]);
    const ownedIds = useMemo(() => new Set(ownedAnimals.map(a => a.id_public)), [ownedAnimals]);
    // Flatten global relationships from backend, exclude own-collection animals, add group label
    const externalRelGroups = useMemo(() => {
        if (!globalRels) return [];
        const groupDefs = [
            { key: 'parents',           label: 'Parents' },
            { key: 'siblings',          label: 'Siblings' },
            { key: 'nephewsNieces',     label: 'Nieces & Nephews' },
            { key: 'auntsUncles',       label: 'Aunts & Uncles' },
            { key: 'grandparents',      label: 'Grandparents' },
            { key: 'greatGrandparents', label: 'Great-Grandparents' },
            { key: 'cousins',           label: 'Cousins' },
        ];
        return groupDefs.map(({ key, label }) => ({
            label,
            animals: (globalRels[key] || []).filter(a => !ownedIds.has(a.id_public) && a.id_public !== animal.id_public),
        })).filter(g => g.animals.length > 0);
    }, [globalRels, ownedIds, animal?.id_public]);
    const getExternalRelLabel = (groupLabel, rel) => {
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
    const [relInsightsOpen, setRelInsightsOpen] = useState(true);
    const [relOwnOpen, setRelOwnOpen] = useState(true);
    const [relExternalOpen, setRelExternalOpen] = useState(false);
    const [offspringOpen, setOffspringOpen] = useState(true);
    const pedigreeIssues = useMemo(() => {
        const issues = [];
        const map = {};
        ownedAnimals.forEach(a => { if (a.id_public) map[a.id_public] = a; });
        const sireId = animal.fatherId_public || animal.sireId_public;
        const damId  = animal.motherId_public  || animal.damId_public;
        const externalParents = globalRels?.parents || [];
        const sireFull = map[sireId] || (sireId ? externalParents.find(p => p.id_public === sireId) : null);
        const damFull  = map[damId]  || (damId  ? externalParents.find(p => p.id_public === damId)  : null);
        const animalBirth = animal.birthDate ? new Date(animal.birthDate) : null;
        // 1. Self-reference
        if (sireId && sireId === animal.id_public) issues.push({ severity: 'error', field: 'Sire', message: 'This animal is listed as its own sire — impossible self-reference.' });
        if (damId  && damId  === animal.id_public) issues.push({ severity: 'error', field: 'Dam',  message: 'This animal is listed as its own dam — impossible self-reference.' });
        // 2. Broken parent link (only after globalRels has finished loading to avoid false positives)
        if (sireId && !sireFull && ownedAnimals.length > 0 && !globalRelsLoading) issues.push({ severity: 'warning', field: 'Sire', message: 'Sire is linked but not found in your collection or known platform animals.' });
        if (damId  && !damFull  && ownedAnimals.length > 0 && !globalRelsLoading) issues.push({ severity: 'warning', field: 'Dam',  message: 'Dam is linked but not found in your collection or known platform animals.' });
        // 3. Parent born on or after offspring
        if (animalBirth) {
            if (sireFull?.birthDate && new Date(sireFull.birthDate) >= animalBirth)
                issues.push({ severity: 'error', field: 'Sire', message: `Sire "${[sireFull.prefix, sireFull.name].filter(Boolean).join(' ')}" was born on or after this animal — impossible parentage.` });
            if (damFull?.birthDate && new Date(damFull.birthDate) >= animalBirth)
                issues.push({ severity: 'error', field: 'Dam',  message: `Dam "${[damFull.prefix, damFull.name].filter(Boolean).join(' ')}" was born on or after this animal — impossible parentage.` });
        }
        // 4. Same-sex parents
        if (sireFull && damFull) {
            const sg = sireFull.gender; const dg = damFull.gender;
            if (sg && dg && sg !== 'Unknown' && dg !== 'Unknown' && sg === dg)
                issues.push({ severity: 'error', field: 'Parents', message: `Both linked parents are ${sg} — a sire/dam pair must be male and female.` });
        }
        // 5. Species mismatch
        if (sireFull?.species && animal.species && sireFull.species !== animal.species)
            issues.push({ severity: 'warning', field: 'Sire', message: `Sire is ${sireFull.species} but this animal is ${animal.species} — species mismatch.` });
        if (damFull?.species && animal.species && damFull.species !== animal.species)
            issues.push({ severity: 'warning', field: 'Dam',  message: `Dam is ${damFull.species} but this animal is ${animal.species} — species mismatch.` });
        // 6. Circular lineage
        const seen = new Set();
        const hasCycle = (pid) => {
            if (!pid || !map[pid]) return false;
            if (pid === animal.id_public) return true;
            if (seen.has(pid)) return false;
            seen.add(pid);
            const p = map[pid];
            return hasCycle(p.fatherId_public || p.sireId_public) || hasCycle(p.motherId_public || p.damId_public);
        };
        if (hasCycle(sireId) || hasCycle(damId))
            issues.push({ severity: 'error', field: 'Lineage', message: 'Circular lineage detected — this animal appears in its own ancestry chain.' });
        return issues;
    }, [animal, ownedAnimals, globalRels, globalRelsLoading]);
    const [pedigreeValidationOpen, setPedigreeValidationOpen] = useState(true);

    // Fetch all litters where this animal is sire or dam
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

    // Fetch pedigree-based offspring groups (not in litter management)
    React.useEffect(() => {
        if (!animal?.id_public || !authToken) return;
        let cancelled = false;
        axios.get(`${API_BASE_URL}/animals/${animal.id_public}/offspring`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => {
                if (cancelled) return;
                // Only groups without a formal litter record (no CTL ID)
                const unmanaged = (res.data || []).filter(l => !l.litter_id_public);
                setPedigreeOffspring(unmanaged);
            })
            .catch(() => { if (!cancelled) setPedigreeOffspring([]); });
        return () => { cancelled = true; };
    }, [animal?.id_public, authToken, API_BASE_URL]);

    const { fieldTemplate, getLabel } = useDetailFieldTemplate(animal?.species, API_BASE_URL);

    // Fetch assigned enclosure info
    React.useEffect(() => {
        if (!animal?.enclosureId || !authToken) { setEnclosureInfo(null); return; }
        axios.get(`${API_BASE_URL}/enclosures`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => setEnclosureInfo(res.data.find(e => e._id === animal.enclosureId) || null))
            .catch(() => setEnclosureInfo(null));
    }, [animal?.enclosureId, authToken, API_BASE_URL]);

    // Fetch logs when Logs tab is opened (lazy, once per animal)
    React.useEffect(() => {
        if (detailViewTab !== 16 || animalLogs !== null || !animal?.id_public || !authToken) return;
        setAnimalLogsLoading(true);
        axios.get(`${API_BASE_URL}/animals/${animal.id_public}/logs`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => setAnimalLogs(res.data || []))
            .catch(() => setAnimalLogs([]))
            .finally(() => setAnimalLogsLoading(false));
    }, [detailViewTab, animal?.id_public, authToken, API_BASE_URL, animalLogs]);
    
    // Fetch COI when component mounts or animal changes (if animal has both parents)
    React.useEffect(() => {
        const fetchCOI = async () => {
            const sireId = animal?.fatherId_public || animal?.sireId_public;
            const damId = animal?.motherId_public || animal?.damId_public;
            
            if (animal?.id_public && sireId && damId) {
                setLoadingCOI(true);
                try {
                    const response = await axios.get(
                        `${API_BASE_URL}/animals/${animal.id_public}/inbreeding`,
                        { headers: { Authorization: `Bearer ${authToken}` } }
                    );
                    if (response.data && response.data.inbreedingCoefficient != null) {
                        setAnimalCOI(response.data.inbreedingCoefficient);
                    }
                } catch (error) {
                    console.error('Failed to fetch COI:', error);
                    setAnimalCOI(null);
                } finally {
                    setLoadingCOI(false);
                }
            } else {
                setAnimalCOI(null);
            }
        };
        fetchCOI();
    }, [animal?.id_public, animal?.fatherId_public, animal?.sireId_public, animal?.motherId_public, animal?.damId_public, API_BASE_URL, authToken]);
    
    const handleShare = () => {
        const url = `${window.location.origin}/animal/${animal.id_public}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };
    
    // Fetch breeder info when component mounts or animal changes
    React.useEffect(() => {
        const fetchBreeder = async () => {
            if (animal?.breederId_public) {
                try {
                    const response = await axios.get(
                        `${API_BASE_URL}/public/profiles/search?query=${animal.breederId_public}&limit=1`
                    );
                    if (response.data && response.data.length > 0) {
                        setBreederInfo(response.data[0]);
                    }
                } catch (error) {
                    console.error('Failed to fetch breeder info:', error);
                    setBreederInfo(null);
                }
            } else {
                setBreederInfo(null);
            }
        };
        fetchBreeder();
    }, [animal?.breederId_public, API_BASE_URL]);
    
    if (!animal) return null;

    return (
        <div className="fixed inset-0 bg-accent/10 flex items-center justify-center p-2 sm:p-4 z-[70] overflow-y-auto">
            <div className="bg-primary rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden">
                {/* Header */}
                <div className="bg-white rounded-t-lg p-2 sm:p-4 border-b border-gray-300 mt-12 sm:mt-0">
                    {/* Mobile layout: stacked */}
                    <div className="sm:hidden">
                        <div className="flex justify-between items-center mb-2">
                            <button 
                                onClick={onClose} 
                                className="flex items-center text-gray-600 hover:text-gray-800 transition text-sm"
                            >
                                <ArrowLeft size={16} className="mr-1" /> Back
                            </button>
                            <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-medium">
                                 OWNER
                            </span>
                            <button onClick={onCloseAll || onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex justify-center gap-1.5 flex-wrap">
                            <button
                                onClick={() => setShowQR(true)}
                                className="px-2 py-1 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-1 text-xs"
                            >
                                <QrCode size={14} />
                                Share
                            </button>
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(animal)}
                                    className="px-2 py-1 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-1 text-xs"
                                >
                                    <Edit size={14} />
                                    Edit
                                </button>
                            )}
                            {onArchive && (
                                <button
                                    onClick={() => onArchive(animal)}
                                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition flex items-center gap-1 text-xs"
                                    title={animal.archived ? "Unarchive animal" : "Archive animal"}
                                >
                                    <Archive size={14} />
                                    {animal.archived ? 'Unarchive' : 'Archive'}
                                </button>
                            )}
                            {onTransfer && (() => {
                                const iWasTransferredThisAnimal = animal.originalOwnerId && animal.ownerId_public === userProfile?.id_public;
                                if (iWasTransferredThisAnimal) {
                                    return (
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Return ${animal.name} to ${animal.breederName || 'the breeder'}? This will remove the animal from your account.`)) {
                                                    try {
                                                        await axios.post(`${API_BASE_URL}/animals/${animal.id_public}/return`, {}, {
                                                            headers: { Authorization: `Bearer ${authToken}` }
                                                        });
                                                        onClose();
                                                        showModalMessage('Success', `Animal has been returned to ${animal.breederName || 'the breeder'}.`);
                                                    } catch (error) {
                                                        console.error('Failed to return animal:', error);
                                                        showModalMessage('Error', `Failed to return animal: ${error.response?.data?.message || error.message}`);
                                                    }
                                                }
                                            }}
                                            className="px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold rounded-lg transition flex items-center gap-1 text-xs"
                                            title="Return to breeder"
                                        >
                                            <RotateCcw size={14} />
                                            Return
                                        </button>
                                    );
                                }
                                return (
                                    <button
                                        onClick={() => onTransfer(animal)}
                                        className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition flex items-center gap-1 text-xs"
                                        title="Transfer"
                                    >
                                        <ArrowLeftRight size={14} />
                                        Transfer
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                    
                    {/* Desktop layout: single row */}
                    <div className="hidden sm:flex justify-between items-center">
                        <button 
                            onClick={onClose} 
                            className="flex items-center text-gray-600 hover:text-gray-800 transition"
                        >
                            <ArrowLeft size={18} className="mr-1" /> Back
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowQR(true)}
                                className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-2"
                            >
                                <QrCode size={16} />
                                Share
                            </button>
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(animal)}
                                    data-tutorial-target="edit-animal-btn"
                                    className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-2"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                            )}
                            {onArchive && (
                                <button
                                    onClick={() => onArchive(animal)}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition flex items-center gap-2"
                                    title={animal.archived ? "Restore from archive" : "Archive animal"}
                                >
                                    <Archive size={16} />
                                    {animal.archived ? 'Unarchive' : 'Archive'}
                                </button>
                            )}
                            {onTransfer && (() => {
                                const iWasTransferredThisAnimal = animal.originalOwnerId && animal.ownerId_public === userProfile?.id_public;
                                if (iWasTransferredThisAnimal) {
                                    return (
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Return ${animal.name} to ${animal.breederName || 'the breeder'}? This will remove the animal from your account.`)) {
                                                    try {
                                                        await axios.post(`${API_BASE_URL}/animals/${animal.id_public}/return`, {}, {
                                                            headers: { Authorization: `Bearer ${authToken}` }
                                                        });
                                                        onClose();
                                                        showModalMessage('Success', `Animal has been returned to ${animal.breederName || 'the breeder'}.`);
                                                    } catch (error) {
                                                        console.error('Failed to return animal:', error);
                                                        showModalMessage('Error', `Failed to return animal: ${error.response?.data?.message || error.message}`);
                                                    }
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold rounded-lg transition flex items-center gap-2"
                                            title="Return to breeder"
                                        >
                                            <RotateCcw size={16} />
                                            Return Animal
                                        </button>
                                    );
                                }
                                return (
                                    <button
                                        onClick={() => onTransfer(animal)}
                                        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition flex items-center gap-2"
                                        title="Transfer this animal"
                                    >
                                        <ArrowLeftRight size={16} />
                                        Transfer
                                    </button>
                                );
                            })()}
                            <button onClick={onCloseAll || onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={28} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs - ALL 16 TABS */}
                <div className="bg-white border-b border-gray-300 px-2 sm:px-6 pt-2 sm:pt-4">
                    <div className="flex flex-wrap gap-1 sm:gap-1 pb-2 sm:pb-4">
                        {[
                            { id: 1, label: 'Overview', icon: ClipboardList, color: 'text-blue-500' },
                            { id: 2, label: 'Status & Privacy', icon: Lock, color: 'text-slate-500' },
                            { id: 3, label: 'Identification', icon: Tag, color: 'text-amber-500' },
                            { id: 4, label: 'Appearance', icon: Palette, color: 'text-pink-500' },
                            { id: 5, label: 'Beta Pedigree', icon: Dna, color: 'text-orange-500' },
                            { id: 6, label: 'Family', icon: TreeDeciduous, color: 'text-green-600' },
                            { id: 7, label: 'Fertility', icon: Egg, color: 'text-yellow-500' },
                            { id: 8, label: 'Health', icon: Hospital, color: 'text-red-500' },
                            { id: 9, label: 'Care', icon: Home, color: 'text-teal-500' },
                            { id: 10, label: 'Behavior', icon: Brain, color: 'text-purple-500' },
                            { id: 11, label: 'Notes', icon: FileText, color: 'text-indigo-500' },
                            { id: 12, label: 'Show', icon: Trophy, color: 'text-yellow-600' },
                            { id: 13, label: 'Legal', icon: FileCheck, color: 'text-blue-600' },
                            { id: 14, label: 'End of Life', icon: Scale, color: 'text-gray-500' },
                            { id: 15, label: 'Gallery', icon: Images, color: 'text-rose-500' },
                            { id: 16, label: 'Logs', icon: ScrollText, color: 'text-gray-600' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setDetailViewTab(tab.id)}
                                className={`flex-shrink-0 px-2.5 sm:px-3 py-2 sm:py-2 text-xs sm:text-sm font-medium rounded border transition-colors ${
                                    detailViewTab === tab.id 
                                        ? 'bg-primary text-black border-gray-400' 
                                        : 'bg-gray-50 text-gray-600 hover:text-gray-800 border-gray-300'
                                }`}
                                title={tab.label}
                            >
                                {React.createElement(tab.icon, { size: 14, className: `inline-block align-middle flex-shrink-0 mr-1.5 ${tab.color || ''}` })}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white border border-t-0 border-gray-300 rounded-b-lg p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-160px)] sm:max-h-[calc(90vh-180px)]">
                    {/* Tab 1: Overview */}
                    {detailViewTab === 1 && (
                        <div className="space-y-3">
                            {/* Main info card */}
                            <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    {/* Left: Photo + status + badges */}
                                    <div className="w-full md:w-1/4 p-4 flex flex-col items-center gap-2 border-b md:border-b-0 md:border-r border-gray-300">
                                        <div className="relative w-full flex justify-center">
                                            <div className="absolute top-0 right-0">
                                                {animal.gender === 'Male' ? <Mars size={16} strokeWidth={2.5} className="text-blue-600" /> : animal.gender === 'Female' ? <Venus size={16} strokeWidth={2.5} className="text-pink-600" /> : animal.gender === 'Intersex' ? <VenusAndMars size={16} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={16} strokeWidth={2.5} className="text-gray-500" />}
                                            </div>
                                            {(animal.imageUrl || animal.photoUrl) ? (
                                                <img
                                                    src={animal.imageUrl || animal.photoUrl}
                                                    alt={animal.name}
                                                    className="w-28 h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                                                    onClick={() => {
                                                        if (setEnlargedImageUrl && setShowImageModal) {
                                                            setEnlargedImageUrl(animal.imageUrl || animal.photoUrl);
                                                            setShowImageModal(true);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                    <Cat size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm font-medium text-gray-700">{animal.status || 'Unknown'}</div>
                                        {animal.isForSale && (
                                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Tag size={11} /> For Sale{animal.salePriceCurrency !== 'Negotiable' && animal.salePriceAmount ? ` · ${getCurrencySymbol(animal.salePriceCurrency)}${animal.salePriceAmount}` : ''}
                                            </span>
                                        )}
                                        {animal.availableForBreeding && (
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Tag size={11} /> Stud{animal.studFeeCurrency !== 'Negotiable' && animal.studFeeAmount ? ` · ${getCurrencySymbol(animal.studFeeCurrency)}${animal.studFeeAmount}` : ''}
                                            </span>
                                        )}
                                        {animal.tags && animal.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {animal.tags.map((tag, idx) => (
                                                    <span key={idx} className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Right: All info */}
                                    <div className="flex-1 p-4 space-y-2">
                                        {/* Top row: species/CTC + toggles */}
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <p className="text-sm text-gray-500">
                                                {animal.species || 'Unknown'}
                                                {animal.breed && ` · ${animal.breed}`}
                                                {animal.strain && ` · ${animal.strain}`}
                                                {animal.id_public && ` · ${animal.id_public}`}
                                            </p>
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => { onToggleOwned && onToggleOwned(animal.id_public, !animal.isOwned); }}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-xs transition ${animal.isOwned ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                                    title="Toggle owned status"
                                                    data-tutorial-target="detail-owned-toggle"
                                                >
                                                    {animal.isOwned ? <Heart size={13} /> : <HeartOff size={13} />}
                                                    <span>{animal.isOwned ? 'Owned' : 'Not Owned'}</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newIsDisplay = !animal.isDisplay;
                                                        axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { isDisplay: newIsDisplay }, {
                                                            headers: { Authorization: `Bearer ${authToken}` }
                                                        }).then(() => {
                                                            if (onUpdateAnimal) onUpdateAnimal({ ...animal, isDisplay: newIsDisplay });
                                                        }).catch(err => console.error('Failed to update isDisplay:', err));
                                                    }}
                                                    data-tutorial-target="detail-private-toggle"
                                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-xs transition ${animal.isDisplay ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                                    title="Toggle public profile visibility"
                                                >
                                                    {animal.isDisplay ? <Eye size={13} /> : <EyeOff size={13} />}
                                                    <span>{animal.isDisplay ? 'Public' : 'Private'}</span>
                                                </button>
                                            </div>
                                        </div>
                                        {/* Name */}
                                        <h2 className="text-xl font-bold text-gray-800 leading-tight">
                                            {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                                        </h2>
                                        {/* DOB + age */}
                                        {animal.birthDate && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Born:</span> {formatDate(animal.birthDate)} {(() => {
                                                    const birth = new Date(animal.birthDate);
                                                    const endDate = animal.deceasedDate ? new Date(animal.deceasedDate) : new Date();
                                                    let years = endDate.getFullYear() - birth.getFullYear();
                                                    let months = endDate.getMonth() - birth.getMonth();
                                                    let days = endDate.getDate() - birth.getDate();
                                                    if (days < 0) { months--; days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate(); }
                                                    if (months < 0) { years--; months += 12; }
                                                    const ageStr = years > 0 ? `${years}y ${months}m ${days}d` : (months > 0 ? `${months}m ${days}d` : `${days}d`);
                                                    if (animal.deceasedDate) {
                                                        return <span className="text-red-600 font-semibold ml-2">{"†"} {formatDate(animal.deceasedDate)} (Lived {ageStr})</span>;
                                                    } else {
                                                        return <span>(~{ageStr})</span>;
                                                    }
                                                })()}
                                            </p>
                                        )}
                                        {/* Variety */}
                                        {[animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).length > 0 && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Variety:</span> {[animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).join(' ')}
                                            </p>
                                        )}
                                        {animal.carrierTraits && (
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Carrier:</span> {animal.carrierTraits}</p>
                                        )}
                                        {animal.geneticCode && (
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Genetic Code:</span> <code className="bg-gray-100 px-1 rounded font-mono">{animal.geneticCode}</code></p>
                                        )}
                                        {animal.remarks && (
                                            <p className="text-sm text-gray-700 line-clamp-2"><span className="font-semibold">Remarks:</span> {animal.remarks}</p>
                                        )}
                                        {/* Breeder + IDs */}
                                        <div className="border-t border-gray-200 pt-2 space-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">Breeder:</span>{' '}
                                                {breederInfo ? (() => {
                                                    const showPersonal = breederInfo.showPersonalName ?? false;
                                                    const showBreeder = breederInfo.showBreederName ?? false;
                                                    let bDisplayName;
                                                    if (showPersonal && showBreeder && breederInfo.personalName && breederInfo.breederName) {
                                                        bDisplayName = `${breederInfo.personalName} (${breederInfo.breederName})`;
                                                    } else if (showBreeder && breederInfo.breederName) {
                                                        bDisplayName = breederInfo.breederName;
                                                    } else if (showPersonal && breederInfo.personalName) {
                                                        bDisplayName = breederInfo.personalName;
                                                    } else {
                                                        bDisplayName = 'Unknown Breeder';
                                                    }
                                                    return <RouterLink to={`/user/${breederInfo.id_public}`} className="text-blue-600 hover:underline font-semibold">{bDisplayName}</RouterLink>;
                                                })() : <span className="font-mono text-accent">{animal.manualBreederName || animal.breederId_public || '—'}</span>}
                                            </div>
                                            {(animal.breederAssignedId || animal.microchipNumber || animal.pedigreeRegistrationId) && (
                                                <hr className="border-gray-200" />
                                            )}
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                {animal.breederAssignedId && <div><span className="text-gray-500">Assigned ID:</span> <strong>{animal.breederAssignedId}</strong></div>}
                                                {animal.microchipNumber && <div><span className="text-gray-500">Microchip:</span> <strong>{animal.microchipNumber}</strong></div>}
                                                {animal.pedigreeRegistrationId && <div><span className="text-gray-500">Pedigree Reg:</span> <strong>{animal.pedigreeRegistrationId}</strong></div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Parents */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Parents</h3>
                                    {animalCOI != null && <span className="text-sm text-gray-700"><span className="font-medium">COI:</span> {animalCOI.toFixed(2)}%</span>}
                                    {loadingCOI && <span className="text-xs text-gray-400">Calculating COI...</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <ViewOnlyParentCard
                                        parentId={animal.fatherId_public || animal.sireId_public}
                                        parentType="Sire"
                                        API_BASE_URL={API_BASE_URL}
                                        onViewAnimal={onViewAnimal}
                                        authToken={authToken}
                                    />
                                    <ViewOnlyParentCard
                                        parentId={animal.motherId_public || animal.damId_public}
                                        parentType="Dam"
                                        API_BASE_URL={API_BASE_URL}
                                        onViewAnimal={onViewAnimal}
                                        authToken={authToken}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Status & Privacy */}
                    {detailViewTab === 2 && (
                        <div className="space-y-6">
                            {/* 1st Section: Ownership */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Users size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Ownership</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Currently Owned:</span>
                                        <strong>{animal.isOwned ? 'Yes' : 'No'}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Breeder:</span>
                                        {breederInfo
                                            ? <RouterLink to={`/user/${breederInfo.id_public}`} className="text-blue-600 hover:underline font-semibold">{breederInfo.breederName || breederInfo.personalName || 'Unknown'}</RouterLink>
                                            : <strong>{animal.manualBreederName || animal.breederId_public || ''}</strong>}
                                    </div>
                                </div>
                            </div>

                            {/* 2nd Section: Current Owner */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Keeper</h3>
                                <div className="text-sm space-y-2">
                                    {(animal.keeperName || animal.isOwned) && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Keeper Name:</span>
                                        <strong>{animal.keeperName || (animal.isOwned ? 'Me' : '')}</strong>
                                    </div>
                                    )}
                                    {animal.coOwnership && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">Co-Ownership:</span>
                                            <strong>{animal.coOwnership}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3rd Section: Keeper History */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Keeper History</h3>
                                {(animal.keeperHistory || []).length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No entries yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {(animal.keeperHistory || []).map((entry, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800">{entry.name || 'Unknown'}</p>
                                                    {entry.userId_public && <p className="text-xs text-gray-400 font-mono">{entry.userId_public}</p>}
                                                </div>
                                                {entry.country && (
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <span className={`${getCountryFlag(entry.country)} inline-block h-4 w-6`}></span>
                                                        <span className="text-xs text-gray-500">{getCountryName(entry.country)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 4th Section: Availability for Sale or Stud */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Tag size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Availability for Sale or Stud</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">For Sale:</span>
                                        <strong>{animal.isForSale ? `Yes - ${getCurrencySymbol(animal.salePriceCurrency)} ${animal.salePriceAmount || 'Negotiable'}`.trim() : 'No'}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">For Stud:</span>
                                        <strong>{animal.availableForBreeding ? `Yes - ${getCurrencySymbol(animal.studFeeCurrency)} ${animal.studFeeAmount || 'Negotiable'}`.trim() : 'No'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Additional tabs (3-16) would follow - Tab 3: Identification, Tab 4: Appearance, Tab 5: Beta Pedigree, Tab 6: Family, Tab 7: Fertility, Tab 8: Health, Tab 9: Care, Tab 10: Behavior, Tab 11: Notes, Tab 12: Show, Tab 13: Legal, Tab 14: End of Life, Tab 15: Gallery, Tab 16: Logs */}
                    {/* Full tab content extraction should be inserted here */}
                </div>

                {/* QR Share Modal */}
                {showQR && <QRModal url={`${window.location.origin}/animal/${animal.id_public}`} title={animal.name} onClose={() => setShowQR(false)} />}

                {/* Pedigree Chart Modal - not yet implemented */}
                {/* {showPedigree && (
                    <PedigreeChart
                        animalId={animal.id_public}
                        API_BASE_URL={API_BASE_URL}
                        authToken={authToken}
                        onClose={() => setShowPedigree(false)}
                        onViewAnimal={onViewAnimal}
                    />
                )} */}
            </div>
        </div>
    );
};

export default PrivateAnimalDetail;
