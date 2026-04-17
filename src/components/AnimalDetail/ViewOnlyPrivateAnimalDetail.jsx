import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowLeft, X, QrCode, ChevronDown, ChevronUp, ChevronRight, Mars, Venus, VenusAndMars, Circle, Cat, Users, User, Home, Tag, Loader2, Lock, TreeDeciduous, Egg, Pill, Shield, Microscope, Hospital, Stethoscope, UtensilsCrossed, Droplets, Thermometer, Scissors, MessageSquare, Activity, AlertTriangle, FileText, Feather, Medal, Target, Key, ClipboardList, Ban, Images, Camera, Heart, Eye, EyeOff, Sparkles, Dna, Ruler, Palette, Hash, FolderOpen, Globe, Hourglass, Bean, Milk, Sprout, RefreshCw, Leaf, Brain, Trophy, FileCheck, Scale, ScrollText, Check, Users as UsersIcon, TableOfContents, Dumbbell, Download } from 'lucide-react';
import { useDetailFieldTemplate, parseJsonField, DetailJsonList, ViewOnlyParentCard, ParentMiniCard } from './utils';
import { formatDate, formatDateShort, litterAge } from '../../utils/dateFormatter';
import { getCurrencySymbol, getCountryFlag, getCountryName } from '../../utils/locationUtils';
import { getSpeciesLatinName } from '../../utils/speciesUtils';
import { PedigreeChart } from '../AnimalForm';
const ViewOnlyPrivateAnimalDetail = ({ animal, onClose, onCloseAll, API_BASE_URL, authToken, setShowImageModal, setEnlargedImageUrl, showModalMessage, onViewAnimal, breedingLineDefs = [], animalBreedingLines = {}, toggleAnimalBreedingLine, initialTab = 1, initialBetaView = 'vertical' }) => {
    const [breederInfo, setBreederInfo] = useState(null);
    const [ownerInfo, setOwnerInfo] = useState(null);
    const [showPedigree, setShowPedigree] = useState(false);
    const [detailViewTab, setDetailViewTab] = useState(initialTab);
    const [enclosureInfo, setEnclosureInfo] = useState(null);
    const [collapsedHealthSections, setCollapsedHealthSections] = useState({});
    const [breedingRecordOffspring, setBreedingRecordOffspring] = useState({});
    const [expandedBreedingRecords, setExpandedBreedingRecords] = useState({});
    const [animalLitters, setAnimalLitters] = useState(null);
    const [pedigreeOffspring, setPedigreeOffspring] = useState(null);
    const [expandedPedigreeRecords, setExpandedPedigreeRecords] = useState({});
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

    // Fetch owner info when animal is owned (ownerId_public differs from breederId_public)
    React.useEffect(() => {
        const fetchOwner = async () => {
            if (animal?.isOwned && animal?.ownerId_public) {
                try {
                    const response = await axios.get(
                        `${API_BASE_URL}/public/profiles/search?query=${animal.ownerId_public}&limit=1`
                    );
                    if (response.data && response.data.length > 0) {
                        setOwnerInfo(response.data[0]);
                    } else {
                        setOwnerInfo(null);
                    }
                } catch {
                    setOwnerInfo(null);
                }
            } else {
                setOwnerInfo(null);
            }
        };
        fetchOwner();
    }, [animal?.isOwned, animal?.ownerId_public, API_BASE_URL]);
    
    if (!animal) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center pt-12 px-2 pb-2 sm:p-4 z-[70] overflow-y-auto">
            <div className="bg-[#E1F2F5] rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] my-2 sm:my-0 flex flex-col">
                {/* Header */}
                <div className="bg-[#E1F2F5] rounded-t-lg pt-3 px-2 pb-2 sm:p-4 border-b border-gray-300">
                    {/* Mobile layout: stacked */}
                    <div className="sm:hidden">
                        <div className="flex justify-between items-center mb-2">
                            <button 
                                onClick={onClose} 
                                className="flex items-center text-gray-600 hover:text-gray-800 transition text-sm"
                            >
                                <ArrowLeft size={16} className="mr-1" /> Back
                            </button>
                            <button onClick={onCloseAll || onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={24} />
                            </button>
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
                            <button onClick={onCloseAll || onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={28} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs - ALL 11 TABS (same as PrivateAnimalDetail) */}
                <div className="bg-[#E1F2F5] border-b border-gray-300 px-0.5 sm:px-4 py-2">
                    <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                        {[
                            { id: 1, label: 'Overview', icon: ClipboardList, color: 'text-blue-500' },
                            { id: 2, label: 'Ownership', icon: Lock, color: 'text-slate-500' },
                            { id: 3, label: 'Identification', icon: Tag, color: 'text-amber-500' },
                            { id: 4, label: 'Appearance', icon: Palette, color: 'text-pink-500' },
                            { id: 5, label: 'Pedigree', icon: Dna, color: 'text-orange-500' },
                            { id: 6, label: 'Family', icon: TreeDeciduous, color: 'text-green-600' },
                            { id: 7, label: 'Fertility', icon: Egg, color: 'text-yellow-500' },
                            { id: 8, label: 'Health', icon: Hospital, color: 'text-red-500' },
                            { id: 9, label: 'Care', icon: Home, color: 'text-teal-500' },
                            { id: 10, label: 'Behavior', icon: Brain, color: 'text-purple-500' },
                            { id: 11, label: 'Notes', icon: FileText, color: 'text-indigo-500' },
                            { id: 12, label: 'Show', icon: Trophy, color: 'text-yellow-600' },
                            { id: 13, label: 'Legal', icon: FileCheck, color: 'text-blue-600' },
                            { id: 14, label: 'End of Life', icon: Scale, color: 'text-gray-500' },
                            { id: 15, label: 'Gallery', icon: Images, color: 'text-rose-500' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setDetailViewTab(tab.id)}
                                className={`w-[calc(20%-0.25rem)] sm:w-[calc(20%-1rem)] px-1 py-2 text-[10px] sm:px-2 sm:text-xs font-medium sm:font-semibold rounded border-2 transition-colors ${
                                    detailViewTab === tab.id 
                                        ? 'bg-[#F2E4E9] text-black border-gray-300' 
                                        : 'bg-white text-gray-600 hover:text-gray-800 border-gray-300'
                                }`}
                                title={tab.label}
                            >
                                <span className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-1">
                                    {React.createElement(tab.icon, { size: 14, className: `flex-shrink-0 ${tab.color || ''}` })}
                                    <span>{tab.label}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content - COPY OF PRIVATE DETAIL (no edit/delete/privacy toggle in Tab 1) */}
                <div className="bg-[#E1F2F5] border border-gray-300 rounded-b-lg pt-1 px-3 py-3 sm:pt-2 sm:px-6 sm:py-6 overflow-y-auto flex-1 pb-8">
                    {/* Tab 1: Overview - NO PRIVACY TOGGLE */}
                    {detailViewTab === 1 && (
                        <div className="space-y-3">
                            {/* Main info card */}
                            <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    {/* Left: Photo + status + badges */}
                                    <div className="w-full md:w-1/3 p-4 flex flex-col items-center gap-2 border-b md:border-b-0 md:border-r border-gray-300">
                                        <div className="relative w-full flex justify-center overflow-hidden rounded-lg">
                                            <div className="absolute top-0 right-0">
                                                {animal.gender === 'Male' ? <Mars size={16} strokeWidth={2.5} className="text-blue-600" /> : animal.gender === 'Female' ? <Venus size={16} strokeWidth={2.5} className="text-pink-600" /> : animal.gender === 'Intersex' ? <VenusAndMars size={16} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={16} strokeWidth={2.5} className="text-gray-500" />}
                                            </div>
                                            {(animal.imageUrl || animal.photoUrl) ? (
                                                <img
                                                    src={animal.imageUrl || animal.photoUrl}
                                                    alt={animal.name}
                                                    className="w-32 h-32 object-contain cursor-pointer hover:opacity-80 transition"
                                                    onClick={() => {
                                                        if (setEnlargedImageUrl && setShowImageModal) {
                                                            setEnlargedImageUrl(animal.imageUrl || animal.photoUrl);
                                                            setShowImageModal(true);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-32 h-32 bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <Cat size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm font-medium text-gray-700">
                                            {animal.breederId_public && animal.ownerId_public && animal.breederId_public !== animal.ownerId_public ? (
                                                <div className="space-y-0.5 text-center">
                                                    <div>Sold</div>
                                                    {animal.status && <div>{animal.status}</div>}
                                                </div>
                                            ) : (
                                                <span>{animal.status || 'Unknown'}</span>
                                            )}
                                        </div>
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
                                        {/* Species/CTC row */}
                                        <p className="text-sm text-gray-500">
                                            {animal.species || 'Unknown'}
                                            {animal.breed && ` \u2022 ${animal.breed}`}
                                            {animal.strain && ` \u2022 ${animal.strain}`}
                                            {animal.id_public && ` \u2022 ${animal.id_public}`}
                                        </p>
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
                                                    return <RouterLink to={`/user/${breederInfo.id_public}`} className="text-purple-600 hover:underline font-semibold">{bDisplayName}</RouterLink>;
                                                })() : <span className="font-mono text-accent">{animal.manualBreederName || animal.breederId_public || '\u2014'}</span>}
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
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Parents</h3>
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

                    {/* Tab 2: Ownership */}
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
                                            ? <RouterLink to={`/user/${breederInfo.id_public}`} className="text-purple-600 hover:underline font-semibold">{breederInfo.breederName || breederInfo.personalName || 'Unknown'}</RouterLink>
                                            : <strong>{animal.manualBreederName || animal.breederId_public || ''}</strong>}
                                    </div>
                                </div>
                            </div>

                            {/* 2nd Section: Current Owner */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Keeper</h3>
                                <div className="text-sm space-y-2">
                                    {(() => {
                                        const keeperDisplay = animal.isOwned
                                            ? (ownerInfo ? (ownerInfo.breederName || ownerInfo.personalName || ownerInfo.id_public) : animal.ownerId_public) || null
                                            : (animal.keeperName || null);
                                        if (!keeperDisplay) return null;
                                        const keeperLink = animal.isOwned && ownerInfo?.id_public ? `/user/${ownerInfo.id_public}` : null;
                                        return (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">Keeper Name:</span>
                                                {keeperLink
                                                    ? <RouterLink to={keeperLink} className="text-purple-600 hover:underline font-semibold">{keeperDisplay}</RouterLink>
                                                    : <strong>{keeperDisplay}</strong>}
                                            </div>
                                        );
                                    })()}
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
                                                    {entry.userId_public
                                                        ? <RouterLink to={`/user/${entry.userId_public}`} className="text-sm font-semibold text-purple-600 hover:underline">{entry.name || 'Unknown'}</RouterLink>
                                                        : <p className="text-sm font-semibold text-gray-800">{entry.name || 'Unknown'}</p>}
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
                                        <strong>{animal.isForSale ? `Yes - ${animal.salePriceCurrency || ''} ${animal.salePriceAmount || 'Negotiable'}`.trim() : 'No'}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">For Stud:</span>
                                        <strong>{animal.availableForBreeding ? `Yes - ${animal.studFeeCurrency || ''} ${animal.studFeeAmount || 'Negotiable'}`.trim() : 'No'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Appearance */}
                    {detailViewTab === 4 && (
                        <div className="space-y-6">
                            {/* Appearance */}
                            {(() => {
                                const fields = [
                                    { key: 'color', label: 'Color' },
                                    { key: 'coatPattern', label: 'Pattern' },
                                    { key: 'coat', label: 'Coat Type' },
                                    { key: 'earset', label: 'Earset' },
                                    { key: 'phenotype', label: 'Phenotype' },
                                    { key: 'morph', label: 'Morph' },
                                    { key: 'markings', label: 'Markings' },
                                    { key: 'eyeColor', label: 'Eye Color' },
                                    { key: 'nailColor', label: 'Nail/Claw Color' },
                                    { key: 'size', label: 'Size' },
                                    { key: 'carrierTraits', label: 'Carrier Traits' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return fields.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Sparkles size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Appearance</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {fields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Genetic Code */}
                            {fieldTemplate?.fields?.geneticCode?.enabled !== false && animal.geneticCode && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Dna size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> {getLabel('geneticCode', 'Genetic Code')}</h3>
                                    <p className="text-gray-700 font-mono text-sm break-all">{animal.geneticCode}</p>
                                </div>
                            )}

                            {/* Life Stage */}
                            {fieldTemplate?.fields?.lifeStage?.enabled !== false && animal.lifeStage && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Sprout size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> {getLabel('lifeStage', 'Life Stage')}</h3>
                                    <p className="text-gray-700 text-sm">{animal.lifeStage}</p>
                                </div>
                            )}

                            {/* Measurements */}
                            {(() => {
                                const mFields = [
                                    { key: 'bodyWeight', label: 'Weight' },
                                    { key: 'bodyLength', label: 'Body Length' },
                                    { key: 'heightAtWithers', label: 'Height at Withers' },
                                    { key: 'chestGirth', label: 'Chest Girth' },
                                    { key: 'adultWeight', label: 'Adult Weight' },
                                    { key: 'bodyConditionScore', label: 'Body Condition Score' },
                                    { key: 'length', label: 'Length' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return mFields.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Ruler size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Measurements</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {mFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tab 3: Identification */}
                    {detailViewTab === 3 && (
                        <div className="space-y-6">
                            {/* Identification Numbers */}
                            {(() => {
                                const idFields = [
                                    { key: 'breederAssignedId', label: 'Identification' },
                                    { key: 'microchipNumber', label: 'Microchip Number' },
                                    { key: 'pedigreeRegistrationId', label: 'Pedigree Registration ID' },
                                    { key: 'colonyId', label: 'Colony ID' },
                                    { key: 'rabiesTagNumber', label: 'Rabies Tag Number' },
                                    { key: 'tattooId', label: 'Tattoo ID' },
                                    { key: 'akcRegistrationNumber', label: 'AKC Registration #' },
                                    { key: 'fciRegistrationNumber', label: 'FCI Registration #' },
                                    { key: 'cfaRegistrationNumber', label: 'CFA Registration #' },
                                    { key: 'workingRegistryIds', label: 'Working Registry IDs' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Hash size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Identification Numbers</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div><span className="text-gray-600">CritterTrack ID:</span> <strong>{animal.id_public || ''}</strong></div>
                                            {idFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Classification */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><FolderOpen size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Classification</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Species:</span> <strong>{animal.species || ''}</strong></div>
                                    {fieldTemplate?.fields?.breed?.enabled !== false && animal.breed && (
                                        <div><span className="text-gray-600">{getLabel('breed', 'Breed')}:</span> <strong>{animal.breed}</strong></div>
                                    )}
                                    {fieldTemplate?.fields?.strain?.enabled !== false && animal.strain && (
                                        <div><span className="text-gray-600">{getLabel('strain', 'Strain')}:</span> <strong>{animal.strain}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* Tags */}
                            {animal.tags && animal.tags.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Tag size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {animal.tags.map((tag, idx) => (
                                            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Breeding Lines */}
                            {(() => {
                                const namedLines = breedingLineDefs.filter(l => l.name);
                                if (namedLines.length === 0 || !toggleAnimalBreedingLine) return null;
                                const assignedIds = animalBreedingLines[animal.id_public] || [];
                                return (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-1.5"><TableOfContents size={16} className="flex-shrink-0 text-gray-400" /> Breeding Lines</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {namedLines.map(l => {
                                                const assigned = assignedIds.includes(l.id);
                                                return (
                                                    <button key={l.id} type="button"
                                                        onClick={() => toggleAnimalBreedingLine(animal.id_public, l.id)}
                                                        style={{ borderColor: l.color, color: assigned ? '#fff' : l.color, backgroundColor: assigned ? l.color : 'transparent' }}
                                                        className="flex items-center gap-1.5 px-3 py-1 rounded-full border-2 text-sm font-medium transition"
                                                    ><span>&#x25C6;</span> {l.name}</button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Origin */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Globe size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Origin</h3>
                                <p className="text-sm text-gray-700">{animal.origin || ''}</p>
                            </div>
                        </div>
                    )}

                    {/* Tab 6: Family */}
                    {detailViewTab === 6 && (
                        <div className="space-y-6">
                            {/* 2nd Section: Keeper History */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Keeper History</h3>
                                {(animal.keeperHistory || []).length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No entries yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {(animal.keeperHistory || []).map((entry, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                                <div className="flex-1 min-w-0">
                                                    {entry.userId_public
                                                        ? <RouterLink to={`/user/${entry.userId_public}`} className="text-sm font-semibold text-purple-600 hover:underline">{entry.name || 'Unknown'}</RouterLink>
                                                        : <p className="text-sm font-semibold text-gray-800">{entry.name || 'Unknown'}</p>}
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

                            {/* 2nd Section: Offspring & Litters - merged litters + pedigree offspring */}
                            {(animalLitters === null || pedigreeOffspring === null) ? (
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <div className="text-sm text-gray-500 animate-pulse">Loading offspring & litters...</div>
                                </div>
                            ) : (() => {
                                const litterItems = (animalLitters || []).map(l => ({ ...l, _recordType: 'litter' }));
                                const pedItems = (pedigreeOffspring || []).map(l => ({ ...l, _recordType: 'pedigree' }));
                                const today2 = new Date();
                                const allRecords = [...litterItems, ...pedItems].sort((a, b) => {
                                    const aIsMated = a.isPlanned && a.matingDate && new Date(a.matingDate) <= today2;
                                    const bIsMated = b.isPlanned && b.matingDate && new Date(b.matingDate) <= today2;
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
                                        <h3 className="text-lg font-semibold text-gray-700 flex items-center"><Users size={20} className="text-purple-600 mr-2" />Offspring & Litters</h3>
                                        <div className="space-y-2">
                                            {allRecords.map((litter) => {
                                                if (litter._recordType === 'litter') {
                                                    const lid = litter.litter_id_public;
                                                    const isSire = litter.sireId_public === animal.id_public;
                                                    const mate = isSire ? litter.dam : litter.sire;
                                                    const isExpanded = expandedBreedingRecords[lid];
                                                    const displayName = litter.breedingPairCodeName;
                                                    const lIsMated = litter.isPlanned && litter.matingDate && new Date(litter.matingDate) <= today2;
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
                                                                        {!litter.isPlanned && litter.birthDate && <span>{formatDate(litter.birthDate)}{litterAge(litter.birthDate) && <span className="ml-1 font-semibold text-green-600">? {litterAge(litter.birthDate)}</span>}</span>}
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
                                                                    {/* -- 1. Name+CTL | COI | Mate ----------------------------- */}
                                                                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-start sm:items-center">
                                                                        {/* Left: Litter Name + CTL ID */}
                                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm h-full grid grid-cols-2 divide-x divide-gray-200 gap-3">
                                                                            <div>
                                                                                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Litter Name</div>
                                                                                {displayName
                                                                                    ? <div className="text-sm font-bold text-gray-800">{displayName}</div>
                                                                                    : <div className="text-sm text-gray-400 italic">•</div>}
                                                                            </div>
                                                                            <div className="pl-3">
                                                                                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">CTL ID</div>
                                                                                {lid
                                                                                    ? <div className="font-mono text-sm font-bold text-purple-700">{lid}</div>
                                                                                    : <div className="text-sm text-gray-400 italic">•</div>}
                                                                            </div>
                                                                        </div>
                                                                        {/* Center: COI */}
                                                                        <div className="flex flex-col items-center px-2">
                                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">COI</div>
                                                                            {litter.inbreedingCoefficient != null
                                                                                ? <div className="text-base font-medium text-gray-800">{litter.inbreedingCoefficient.toFixed(2)}%</div>
                                                                                : <div className="text-base font-medium text-gray-300">•</div>}
                                                                        </div>
                                                                        {/* Right: Mate card */}
                                                                        {mate ? (
                                                                            <div onClick={() => onViewAnimal && onViewAnimal(mate)} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition shadow-sm">
                                                                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                                    {mate.imageUrl || mate.photoUrl
                                                                                        ? <img src={mate.imageUrl || mate.photoUrl} alt={mate.name} className="w-full h-full object-cover" />
                                                                                        : <div className="w-full h-full flex items-center justify-center text-gray-400"><Cat size={18} /></div>}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mate</div>
                                                                                    <p className="font-bold text-gray-800 truncate text-sm">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ') || '•'}</p>
                                                                                    <p className="text-xs text-gray-500">{mate.species || '•'}</p>
                                                                                    <p className="text-[10px] text-gray-400 font-mono">{mate.id_public || '•'}</p>
                                                                                </div>
                                                                            </div>
                                                                        ) : <div />}
                                                                    </div>
                                                                    {/* -- 2. Breeding & Birth ---------------------------------- */}
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
                                                                    {/* -- 3. Stats bar ----------------------------------------- */}
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
                                                                    {/* -- 4. Notes --------------------------------------------- */}
                                                                    {litter.notes && <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm"><h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</h4><p className="text-sm text-gray-700 italic leading-relaxed">{litter.notes}</p></div>}
                                                                    {/* -- 4b. Photos ----------------------------------------- */}
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
                                                                    {/* -- 5. Linked Offspring ---------------------------------- */}
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
                                                                    {lid && breedingRecordOffspring[lid] && breedingRecordOffspring[lid].length > 0 && (
                                                                        <div className="bg-white p-3 rounded border border-purple-100">
                                                                            <div className="text-sm font-semibold text-gray-700 mb-3">Offspring ({breedingRecordOffspring[lid].length})</div>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                                                {breedingRecordOffspring[lid].map(offspring => (
                                                                                    offspring.isPrivate ? (
                                                                                        <div key={offspring.id_public} className="relative bg-gray-50 rounded-lg border-2 border-gray-200 h-52 flex flex-col items-center overflow-hidden pt-2">
                                                                                            <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                                                <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-2xl">??</div>
                                                                                            </div>
                                                                                            <div className="w-full text-center px-2 pb-1">
                                                                                                <div className="text-sm font-semibold text-gray-500 truncate">Private Animal</div>
                                                                                            </div>
                                                                                            <div className="w-full px-2 pb-2 flex justify-end">
                                                                                                <div className="text-xs text-gray-400 font-mono">{offspring.id_public}</div>
                                                                                            </div>
                                                                                            <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                                                                                <div className="text-xs font-medium text-gray-500">{offspring.gender || '?'}</div>
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
                                                    // Pedigree-only record (no CTL/litter management entry)
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
                                                                        <span className="text-sm font-semibold text-gray-800">{formatDate(litter.birthDate) || '?'}</span>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Mate</span>
                                                                        <span className="text-sm font-semibold text-gray-800 truncate block">{mate ? [mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ') : '?'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">COI</span>
                                                                        <span className="text-sm font-semibold text-gray-800">{coi != null ? `${coi.toFixed(2)}%` : '?'}</span>
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
                                                                    {/* -- 1. Birthdate | COI | Mate ----------------------------- */}
                                                                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-start sm:items-center">
                                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm h-full">
                                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Birth Date</div>
                                                                            {litter.birthDate
                                                                                ? <div className="text-sm font-bold text-gray-800">{formatDate(litter.birthDate)}</div>
                                                                                : <div className="text-sm text-gray-400 italic">?</div>}
                                                                        </div>
                                                                        <div className="flex flex-col items-center px-2">
                                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">COI</div>
                                                                            {coi != null ? <div className="text-base font-medium text-gray-800">{coi.toFixed(2)}%</div> : <div className="text-base font-medium text-gray-300">?</div>}
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
                                                                    {/* -- 2. Slim stats ---------------------------------------- */}
                                                                    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                                        <div className="grid grid-cols-4 gap-3">
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Born</div><div className="text-lg font-bold text-gray-800">{offspringList.length}</div></div>
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Males</div><div className="text-lg font-bold text-blue-500">{maleCount}</div></div>
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Females</div><div className="text-lg font-bold text-pink-500">{femaleCount}</div></div>
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Unknown</div><div className="text-lg font-bold text-purple-500">{unknownCount}</div></div>
                                                                        </div>
                                                                    </div>
                                                                    {/* -- 3. Offspring cards ----------------------------------- */}
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
                                        </div>
                                    </div>
                                );
                            })()}

                        </div>
                    )}

                    {/* Tab 7: Fertility */}
                    {detailViewTab === 7 && (
                        <div className="space-y-6">
                            {/* 1st Section: Reproductive Status */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Leaf size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Reproductive Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Neutered/Spayed:</span> <strong>{animal.isNeutered ? 'Yes' : 'No'}</strong></div>
                                    <div><span className="text-gray-600">Infertile:</span> <strong>{animal.isInfertile ? 'Yes' : 'No'}</strong></div>
                                    {!animal.isNeutered && !animal.isInfertile && (
                                        <div><span className="text-gray-600">In Mating:</span> <strong>{animal.isInMating ? 'Yes' : 'No'}</strong></div>
                                    )}
                                    {(animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && !animal.isNeutered && (
                                        <>
                                            <div><span className="text-gray-600">{getLabel('isPregnant', 'Pregnant')}:</span> <strong>{animal.isPregnant ? 'Yes' : 'No'}</strong></div>
                                            <div><span className="text-gray-600">{getLabel('isNursing', 'Nursing')}:</span> <strong>{animal.isNursing ? 'Yes' : 'No'}</strong></div>
                                        </>
                                    )}
                                    {animal.gender === 'Male' && !animal.isNeutered && !animal.isInfertile && (
                                        <div><span className="text-gray-600">Stud Animal:</span> <strong>{animal.isStudAnimal ? 'Yes' : 'No'}</strong></div>
                                    )}
                                    {animal.gender === 'Female' && !animal.isNeutered && !animal.isInfertile && (
                                        <div><span className="text-gray-600">Breeding Dam:</span> <strong>{animal.isDamAnimal ? 'Yes' : 'No'}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* 2nd Section: Estrus/Cycle (Female/Intersex/Unknown only) */}
                            {(animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && !animal.isNeutered && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><RefreshCw size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Estrus/Cycle</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Heat Status:</span> <strong>{animal.heatStatus || ''}</strong></div>
                                        <div><span className="text-gray-600">Last Heat Date:</span> <strong>{animal.lastHeatDate ? formatDate(animal.lastHeatDate) : ''}</strong></div>
                                        <div><span className="text-gray-600">{getLabel('ovulationDate', 'Ovulation Date')}:</span> <strong>{animal.ovulationDate ? formatDate(animal.ovulationDate) : ''}</strong></div>
                                        {animal.estrusCycleLength && (
                                            <div><span className="text-gray-600">Estrus Cycle Length:</span> <strong>{`${animal.estrusCycleLength} days`}</strong></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 4th Section: Stud Information */}
                            {!animal.isNeutered && !animal.isInfertile && (animal.gender === 'Male' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Mars size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Sire Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Fertility Status:</span> <strong>{animal.fertilityStatus || ''}</strong></div>
                                    </div>
                                    {animal.fertilityNotes && (
                                        <div className="text-sm"><span className="text-gray-600">Notes:</span> <strong className="whitespace-pre-wrap">{animal.fertilityNotes}</strong></div>
                                    )}
                                    {animal.reproductiveClearances && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Clearances:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveClearances}</strong></div>
                                    )}
                                    {animal.reproductiveComplications && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Complications:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveComplications}</strong></div>
                                    )}
                                </div>
                            )}

                            {/* 5th Section: Dam Information */}
                            {!animal.isNeutered && !animal.isInfertile && (animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Venus size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Dam Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">{getLabel('damFertilityStatus', 'Dam Fertility Status')}:</span> <strong>{animal.damFertilityStatus || animal.fertilityStatus || ''}</strong></div>
                                        {animal.gestationLength && (
                                            <div><span className="text-gray-600">{getLabel('gestationLength', 'Gestation Length')}:</span> <strong>{`${animal.gestationLength} days`}</strong></div>
                                        )}
                                        {animal.deliveryMethod && (
                                            <div><span className="text-gray-600">{getLabel('deliveryMethod', 'Delivery Method')}:</span> <strong>{animal.deliveryMethod}</strong></div>
                                        )}
                                        {animal.whelpingDate && (
                                            <div><span className="text-gray-600">{getLabel('whelpingDate', 'Whelping Date')}:</span> <strong>{formatDate(animal.whelpingDate)}</strong></div>
                                        )}
                                        {animal.queeningDate && (
                                            <div><span className="text-gray-600">{getLabel('queeningDate', 'Queening Date')}:</span> <strong>{formatDate(animal.queeningDate)}</strong></div>
                                        )}
                                    </div>
                                    {animal.damFertilityNotes && (
                                        <div className="text-sm"><span className="text-gray-600">Notes:</span> <strong className="whitespace-pre-wrap">{animal.damFertilityNotes}</strong></div>
                                    )}
                                    {animal.reproductiveClearances && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Clearances:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveClearances}</strong></div>
                                    )}
                                    {animal.reproductiveComplications && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Complications:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveComplications}</strong></div>
                                    )}
                                </div>
                            )}

                            {/* 6th Section: Breeding History */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center"><span className="text-blue-600 mr-2">??</span>Litter Records</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {(animal.gender === 'Male' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                        <>
                                            <div><span className="text-gray-600">{getLabel('lastMatingDate', 'Last Mating Date')}:</span> <strong>{animal.lastMatingDate ? formatDate(animal.lastMatingDate) : ''}</strong></div>
                                            </>
                                    )}
                                    {(animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                        <>
                                            <div><span className="text-gray-600">{getLabel('lastPregnancyDate', 'Last Pregnancy Date')}:</span> <strong>{animal.lastPregnancyDate ? formatDate(animal.lastPregnancyDate) : ''}</strong></div>
                                            <div><span className="text-gray-600">{getLabel('litterCount', 'Litter Count')}:</span> <strong>{animal.litterCount || ''}</strong></div>
                                        </>
                                    )}
                                    <div><span className="text-gray-600">Total Offspring:</span> <strong>{animal.offspringCount || ''}</strong></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 8: Health */}
                    {detailViewTab === 8 && (
                        <div className="space-y-6">
                            {/* 1st Section: Preventive Care */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, preventiveCare: !p.preventiveCare}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Shield size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Preventive Care</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.preventiveCare ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.preventiveCare && (<div className="space-y-4 mt-4">
                                    {animal.vaccinations && (
                                        <DetailJsonList
                                            label={getLabel('vaccinations', 'Vaccinations')}
                                            data={animal.vaccinations}
                                            renderItem={v => <>{v.name} {v.date && `(${formatDate(v.date)})`}{v.notes && <span className="text-gray-600"> - {v.notes}</span>}</>}
                                        />
                                    )}
                                    {animal.dewormingRecords && (
                                        <DetailJsonList
                                            label="Deworming Records"
                                            data={animal.dewormingRecords}
                                            renderItem={r => <>{r.medication} {r.date && `(${formatDate(r.date)})`}{r.notes && <span className="text-gray-600"> - {r.notes}</span>}</>}
                                        />
                                    )}
                                    {animal.parasiteControl && (
                                        <DetailJsonList
                                            label="Parasite Control"
                                            data={animal.parasiteControl}
                                            renderItem={r => <>{r.treatment} {r.date && `(${formatDate(r.date)})`}{r.notes && <span className="text-gray-600"> - {r.notes}</span>}</>}
                                        />
                                    )}
                                    {fieldTemplate?.fields?.parasitePreventionSchedule?.enabled !== false && animal.parasitePreventionSchedule && (
                                        <div className="text-sm">
                                            <span className="text-gray-600">{getLabel('parasitePreventionSchedule', 'Parasite Prevention Schedule')}:</span>
                                            <strong className="whitespace-pre-wrap">{animal.parasitePreventionSchedule}</strong>
                                        </div>
                                    )}
                                </div>)}
                            </div>

                            {/* 2nd Section: Procedures & Diagnostics */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, proceduresDiagnostics: !p.proceduresDiagnostics}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Microscope size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Procedures & Diagnostics</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.proceduresDiagnostics ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.proceduresDiagnostics && (<div className="space-y-4 mt-4">
                                    {animal.medicalProcedures && (
                                        <DetailJsonList
                                            label="Medical Procedures"
                                            data={animal.medicalProcedures}
                                            renderItem={p => <>{p.name} {p.date && `(${formatDate(p.date)})`}{p.notes && <span className="text-gray-600"> - {p.notes}</span>}</>}
                                        />
                                    )}
                                    {(animal.labResults || animal.laboratoryResults) && (
                                        <DetailJsonList
                                            label="Laboratory Results"
                                            data={animal.labResults || animal.laboratoryResults}
                                            renderItem={r => <>{r.testName} - {r.result} {r.date && `(${formatDate(r.date)})`}{r.notes && <span className="text-gray-600"> - {r.notes}</span>}</>}
                                        />
                                    )}
                                </div>)}
                            </div>

                            {/* 3rd Section: Active Medical Records */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, activeMedical: !p.activeMedical}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Pill size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Active Medical Records</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.activeMedical ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.activeMedical && (<div className="space-y-3 mt-4">
                                    {animal.medicalConditions && (() => {
                                        const d = animal.medicalConditions;
                                        const parsed = typeof d === 'string' ? (() => { try { return JSON.parse(d); } catch { return null; } })() : Array.isArray(d) ? d : null;
                                        return parsed && parsed.length > 0 ? (
                                            <div>
                                                <span className="text-gray-600 text-sm font-semibold">Medical Conditions:</span>
                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                    {parsed.map((item, i) => (
                                                        <li key={i} className="text-gray-700">
                                                            {item.condition || item.name}
                                                            {item.notes && <span className="text-gray-500"> ? {item.notes}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : <div><span className="text-gray-600 text-sm font-semibold">Medical Conditions:</span><strong className="text-sm whitespace-pre-wrap">{d}</strong></div>;
                                    })()}
                                    {animal.allergies && (() => {
                                        const d = animal.allergies;
                                        const parsed = typeof d === 'string' ? (() => { try { return JSON.parse(d); } catch { return null; } })() : Array.isArray(d) ? d : null;
                                        return parsed && parsed.length > 0 ? (
                                            <div>
                                                <span className="text-gray-600 text-sm font-semibold">Allergies:</span>
                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                    {parsed.map((item, i) => (
                                                        <li key={i} className="text-gray-700">
                                                            {item.allergen || item.name}
                                                            {item.notes && <span className="text-gray-500"> ? {item.notes}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : <div><span className="text-gray-600 text-sm font-semibold">Allergies:</span><strong className="text-sm whitespace-pre-wrap">{d}</strong></div>;
                                    })()}
                                    {animal.medications && (() => {
                                        const d = animal.medications;
                                        const parsed = typeof d === 'string' ? (() => { try { return JSON.parse(d); } catch { return null; } })() : Array.isArray(d) ? d : null;
                                        return parsed && parsed.length > 0 ? (
                                            <div>
                                                <span className="text-gray-600 text-sm font-semibold">Current Medications:</span>
                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                    {parsed.map((item, i) => (
                                                        <li key={i} className="text-gray-700">
                                                            {item.medication || item.name}
                                                            {item.notes && <span className="text-gray-500"> ? {item.notes}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : <div><span className="text-gray-600 text-sm font-semibold">Current Medications:</span><strong className="text-sm whitespace-pre-wrap">{d}</strong></div>;
                                    })()}
                                </div>)}
                            </div>

                            {/* 4th Section: Health Clearances & Screening */}
                            {(() => {
                                const clearanceFields = [
                                    { key: 'heartwormStatus', label: 'Heartworm Status' },
                                    { key: 'hipElbowScores', label: 'Hip/Elbow Scores' },
                                    { key: 'eyeClearance', label: 'Eye Clearance' },
                                    { key: 'cardiacClearance', label: 'Cardiac Clearance' },
                                    { key: 'dentalRecords', label: 'Dental Records' },
                                    { key: 'geneticTestResults', label: 'Genetic Test Results' },
                                    { key: 'chronicConditions', label: 'Chronic Conditions' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                const spayDate = fieldTemplate?.fields?.spayNeuterDate?.enabled !== false && animal.spayNeuterDate;
                                return (clearanceFields.length > 0 || spayDate) && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, healthClearances: !p.healthClearances}))} className="w-full flex items-center justify-between text-left group">
                                            <h3 className="text-lg font-semibold text-gray-700"><Hospital size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Health Clearances & Screening</h3>
                                            <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.healthClearances ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                        </button>
                                        {!collapsedHealthSections.healthClearances && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                                            {spayDate && <div><span className="text-gray-600">{getLabel('spayNeuterDate', 'Spay/Neuter Date')}:</span> <strong>{formatDate(animal.spayNeuterDate)}</strong></div>}
                                            {clearanceFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>)}
                                    </div>
                                );
                            })()}

                            {/* 5th Section: Veterinary Care */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, vetCare: !p.vetCare}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Stethoscope size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Veterinary Care</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.vetCare ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.vetCare && (<div className="space-y-4 text-sm mt-4">
                                    {animal.primaryVet && <div><span className="text-gray-600">Primary Veterinarian:</span> <strong>{animal.primaryVet}</strong></div>}
                                    {animal.vetVisits && (
                                        <DetailJsonList
                                            label="Veterinary Visits"
                                            data={animal.vetVisits}
                                            renderItem={v => <>{v.reason} {v.date && `(${formatDate(v.date)})`}{v.notes && <span className="text-gray-600"> - {v.notes}</span>}</>}
                                        />
                                    )}
                                </div>)}
                            </div>
                        </div>
                    )}

                    {/* Tab 9: Care */}
                    {detailViewTab === 9 && (
                        <div className="space-y-6">
                            {/* 1st Section: Nutrition */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><UtensilsCrossed size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Nutrition</h3>
                                <div className="space-y-3 text-sm">
                                    {animal.dietType && <div><span className="text-gray-600">Diet Type:</span> <strong>{animal.dietType}</strong></div>}
                                    {animal.feedingSchedule && <div><span className="text-gray-600">Feeding Schedule:</span> <strong>{animal.feedingSchedule}</strong></div>}
                                    {animal.supplements && <div><span className="text-gray-600">Supplements:</span> <strong>{animal.supplements}</strong></div>}
                                </div>
                            </div>

                            {/* 2nd Section: Husbandry */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Droplets size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Animal Care</h3>
                                <div className="space-y-3 text-sm">
                                    {enclosureInfo && (<div><span className="text-gray-600">Enclosure:</span> <strong>{enclosureInfo.name}</strong></div>)}
                                    {fieldTemplate?.fields?.housingType?.enabled !== false && animal.housingType && <div><span className="text-gray-600">{getLabel('housingType', 'Housing Type')}:</span> <strong>{animal.housingType}</strong></div>}
                                    {fieldTemplate?.fields?.bedding?.enabled !== false && animal.bedding && <div><span className="text-gray-600">{getLabel('bedding', 'Bedding')}:</span> <strong>{animal.bedding}</strong></div>}
                                    {animal.enrichment && <div><span className="text-gray-600">Enrichment:</span> <strong>{animal.enrichment}</strong></div>}
                                </div>
                            </div>

                            {/* 3rd Section: Environment */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Thermometer size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Environment</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {animal.temperatureRange && <div><span className="text-gray-600">Temperature Range:</span> <strong>{animal.temperatureRange}</strong></div>}
                                    {fieldTemplate?.fields?.humidity?.enabled !== false && animal.humidity && <div><span className="text-gray-600">{getLabel('humidity', 'Humidity')}:</span> <strong>{animal.humidity}</strong></div>}
                                    {animal.lighting && <div><span className="text-gray-600">Lighting:</span> <strong>{animal.lighting}</strong></div>}
                                    {fieldTemplate?.fields?.noise?.enabled !== false && animal.noise && <div><span className="text-gray-600">{getLabel('noise', 'Noise Level')}:</span> <strong>{animal.noise}</strong></div>}
                                </div>
                            </div>

                            {/* 4th Section: Exercise & Grooming */}
                            {(() => {
                                const egFields = [
                                    { key: 'exerciseRequirements', label: 'Exercise Requirements' },
                                    { key: 'dailyExerciseMinutes', label: 'Daily Exercise (min)' },
                                    { key: 'groomingNeeds', label: 'Grooming Needs' },
                                    { key: 'sheddingLevel', label: 'Shedding Level' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                const trainFlags = [
                                    { key: 'crateTrained', label: 'Crate Trained' },
                                    { key: 'litterTrained', label: 'Litter Trained' },
                                    { key: 'leashTrained', label: 'Leash Trained' },
                                    { key: 'freeFlightTrained', label: 'Free Flight Trained' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return (egFields.length > 0 || trainFlags.length > 0) && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Scissors size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Grooming</h3>
                                        {egFields.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                {egFields.map(f => (
                                                    <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                                ))}
                                            </div>
                                        )}
                                        {trainFlags.length > 0 && (
                                            <div className="flex flex-wrap gap-3 text-sm">
                                                {trainFlags.map(f => (
                                                    <span key={f.key} className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">&#x2713; {getLabel(f.key, f.label)}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tab 10: Behavior */}
                    {detailViewTab === 10 && (
                        <div className="space-y-6">
                            {/* 1st Section: Behavior */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><MessageSquare size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Behavior</h3>
                                <div className="space-y-3 text-sm">
                                    {animal.temperament && <div><span className="text-gray-600">Temperament:</span> <strong>{animal.temperament}</strong></div>}
                                    {fieldTemplate?.fields?.handlingTolerance?.enabled !== false && animal.handlingTolerance && <div><span className="text-gray-600">{getLabel('handlingTolerance', 'Handling Tolerance')}:</span> <strong>{animal.handlingTolerance}</strong></div>}
                                    {animal.socialStructure && <div><span className="text-gray-600">Social Structure:</span> <strong>{animal.socialStructure}</strong></div>}
                                </div>
                            </div>

                            {/* 2nd Section: Activity */}
                            {animal.activityCycle && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Activity size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Activity</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Activity Cycle:</span> <strong>{animal.activityCycle}</strong></div>
                                </div>
                            </div>
                            )}

                            {/* 3rd Section: Training & Working */}
                            {(() => {
                                const trainFields = [
                                    { key: 'trainingLevel', label: 'Training Level' },
                                    { key: 'trainingDisciplines', label: 'Training Disciplines' },
                                    { key: 'workingRole', label: 'Working Role' },
                                    { key: 'certifications', label: 'Certifications' },
                                    { key: 'behavioralIssues', label: 'Behavioral Issues' },
                                    { key: 'biteHistory', label: 'Bite History' },
                                    { key: 'reactivityNotes', label: 'Reactivity Notes' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return trainFields.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Dumbbell size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Training & Working</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {trainFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tab 11: Notes */}
                    {detailViewTab === 11 && (
                        <div className="space-y-6">
                            {/* 1st Section: Remarks & Notes */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><FileText size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Remarks & Notes</h3>
                                <strong className="block text-sm text-gray-700 whitespace-pre-wrap">{animal.remarks || ''}</strong>
                            </div>
                        </div>
                    )}                    {/* Tab 14: End of Life */}
                    {detailViewTab === 14 && (
                        <div className="space-y-6">
                            {/* End of Life */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Feather size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Deceased Date:</span> <strong>{animal.deceasedDate ? formatDate(animal.deceasedDate) : ''}</strong></div>
                                    <div><span className="text-gray-600">Cause of Death:</span> <strong>{animal.causeOfDeath || ''}</strong></div>
                                    <div><span className="text-gray-600">Necropsy Results:</span> <strong>{animal.necropsyResults || ''}</strong></div>
                                    {animal.endOfLifeCareNotes && (
                                        <div><span className="text-gray-600">{getLabel('endOfLifeCareNotes', 'End of Life Care Notes')}:</span> <strong className="whitespace-pre-wrap">{animal.endOfLifeCareNotes}</strong></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 12: Show */}
                    {detailViewTab === 12 && (
                        <div className="space-y-6">
                            {/* Show Titles & Ratings */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Medal size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Show Titles & Ratings</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Titles:</span> <strong>{animal.showTitles || ''}</strong></div>
                                    <div><span className="text-gray-600">Ratings:</span> <strong>{animal.showRatings || ''}</strong></div>
                                    <div><span className="text-gray-600">Judge Comments:</span> <strong className="whitespace-pre-wrap">{animal.judgeComments || ''}</strong></div>
                                </div>
                            </div>

                            {/* Working Titles & Performance */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Target size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Working & Performance</h3>
                                    <div className="space-y-3 text-sm">
                                        <div><span className="text-gray-600">Working Titles:</span> <strong>{animal.workingTitles || ''}</strong></div>
                                        <div><span className="text-gray-600">Performance Scores:</span> <strong>{animal.performanceScores || ''}</strong></div>
                                    </div>
                                </div>
                        </div>
                    )}

                    {/* Tab 13: Legal & Documentation */}
                    {detailViewTab === 13 && (
                        <div className="space-y-6">
                            {/* Licensing & Permits */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Key size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Licensing & Permits</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {fieldTemplate?.fields?.licenseNumber?.enabled !== false && animal.licenseNumber && (
                                        <div><span className="text-gray-600">{getLabel('licenseNumber', 'License Number')}:</span> <strong>{animal.licenseNumber}</strong></div>
                                    )}
                                    {fieldTemplate?.fields?.licenseJurisdiction?.enabled !== false && animal.licenseJurisdiction && (
                                        <div><span className="text-gray-600">{getLabel('licenseJurisdiction', 'License Jurisdiction')}:</span> <strong>{animal.licenseJurisdiction}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* Legal / Administrative */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><ClipboardList size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Legal / Administrative</h3>
                                <div className="space-y-3 text-sm">
                                    {fieldTemplate?.fields?.insurance?.enabled !== false && animal.insurance && (
                                        <div><span className="text-gray-600">{getLabel('insurance', 'Insurance')}:</span> <strong className="whitespace-pre-wrap">{animal.insurance}</strong></div>
                                    )}
                                    {fieldTemplate?.fields?.legalStatus?.enabled !== false && animal.legalStatus && (
                                        <div><span className="text-gray-600">{getLabel('legalStatus', 'Legal Status')}:</span> <strong className="whitespace-pre-wrap">{animal.legalStatus}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* Restrictions */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Ban size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Restrictions</h3>
                                <div className="space-y-3 text-sm">
                                    {animal.breedingRestrictions && (
                                        <div><span className="text-gray-600">{getLabel('breedingRestrictions', 'Breeding Restrictions')}:</span> <strong className="whitespace-pre-wrap">{animal.breedingRestrictions}</strong></div>
                                    )}
                                    {animal.exportRestrictions && (
                                        <div><span className="text-gray-600">{getLabel('exportRestrictions', 'Export Restrictions')}:</span> <strong className="whitespace-pre-wrap">{animal.exportRestrictions}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* No data fallback */}
                            {!animal.licenseNumber && !animal.licenseJurisdiction && !animal.insurance && !animal.legalStatus && !animal.breedingRestrictions && !animal.exportRestrictions && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center text-gray-500">
                                    <p>No legal or documentation records</p>
                                </div>
                            )}
                        </div>
                    )}

                {/* -- TAB 15 : Gallery (read-only) --- */}
                {detailViewTab === 15 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700"><Images size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Photo Gallery</h3>
                                <p className="text-xs text-gray-400 mt-0.5">{(animal.extraImages || []).length} photos</p>
                            </div>
                        </div>

                        {(animal.extraImages || []).length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <Camera size={48} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-medium">No photos</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {(animal.extraImages || []).map((url, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                        <img
                                            src={url}
                                            alt={`Gallery photo ${idx + 1}`}
                                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => { setEnlargedImageUrl(url); setShowImageModal(true); }}
                                        />
                                        <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] rounded px-1 py-0.5">#{idx + 1}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Pedigree Chart Modal */}
                {showPedigree && (
                    <PedigreeChart
                        animalId={animal.id_public}
                        API_BASE_URL={API_BASE_URL}
                        authToken={authToken}
                        onClose={() => setShowPedigree(false)}
                        onViewAnimal={onViewAnimal}
                    />
                )}

                {/* Tab 5: Pedigree */}
                {detailViewTab === 5 && (() => {
                    if (mpLoading) return <div className="flex items-center justify-center py-16 gap-2 text-gray-400"><Loader2 size={18} className="animate-spin" /><span className="text-sm">Loading ancestry?</span></div>;
                    const mpData = mpEnrichedData || animal?.manualPedigree || {};
                    const emptySlot = () => ({ mode: 'manual', ctcId: '', prefix: '', name: '', suffix: '', variety: '', genCode: '', birthDate: '', breederName: '', gender: '', imageUrl: '', notes: '' });
                    const getSlot = (key) => mpData[key] || emptySlot();
                    const hasAnyData = ['sire','dam','sireSire','sireDam','damSire','damDam',
                        'sireSireSire','sireSireDam','sireDamSire','sireDamDam',
                        'damSireSire','damSireDam','damDamSire','damDamDam'].some(k => {
                        const d = mpData[k];
                        return d && (d.ctcId || Object.entries(d).some(([fk,v]) => fk !== 'mode' && v && String(v).trim()));
                    });
                    const handleDownloadMP = async () => {
                        if (!mpTreeRef.current) return;
                        setMpDownloading(true);
                        try {
                            const srcCanvas = await html2canvas(mpTreeRef.current, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
                            const a4W = 1654, a4H = 2339, pad = 80;
                            const maxW = a4W - pad * 2, maxH = a4H - pad * 2;
                            const ratio = Math.min(maxW / srcCanvas.width, maxH / srcCanvas.height);
                            const dw = Math.round(srcCanvas.width * ratio), dh = Math.round(srcCanvas.height * ratio);
                            const out = document.createElement('canvas');
                            out.width = a4W; out.height = a4H;
                            const ctx = out.getContext('2d');
                            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, a4W, a4H);
                            ctx.drawImage(srcCanvas, Math.round((a4W - dw) / 2), Math.round((a4H - dh) / 2), dw, dh);
                            const link = document.createElement('a');
                            link.download = `manual-pedigree-${animal.name || animal.id_public}.png`;
                            link.href = out.toDataURL('image/png');
                            link.click();
                        } catch(e) { console.error('Manual pedigree download failed', e); }
                        finally { setMpDownloading(false); }
                    };
                    const handleDownloadMPPDF = async () => {
                        if (!mpTreeRef.current) return;
                        setMpDownloading(true);
                        try {
                            const srcCanvas = await html2canvas(mpTreeRef.current, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
                            const a4W = 1654, a4H = 2339, pad = 80;
                            const maxW = a4W - pad * 2, maxH = a4H - pad * 2;
                            const ratio = Math.min(maxW / srcCanvas.width, maxH / srcCanvas.height);
                            const dw = Math.round(srcCanvas.width * ratio), dh = Math.round(srcCanvas.height * ratio);
                            const out = document.createElement('canvas');
                            out.width = a4W; out.height = a4H;
                            const ctx = out.getContext('2d');
                            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, a4W, a4H);
                            ctx.drawImage(srcCanvas, Math.round((a4W - dw) / 2), Math.round((a4H - dh) / 2), dw, dh);
                            const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [a4W, a4H] });
                            pdf.addImage(out.toDataURL('image/png'), 'PNG', 0, 0, a4W, a4H);
                            pdf.save(`pedigree-${animal.name || animal.id_public}.pdf`);
                        } catch(e) { console.error('Pedigree PDF failed', e); }
                        finally { setMpDownloading(false); }
                    };
                    const renderSlot = (slotKey, label) => {
                        const d = getSlot(slotKey);
                        const hasData = d && (d.ctcId || Object.entries(d).some(([fk,v]) => fk !== 'mode' && v && String(v).trim()));
                        const fullName = [d.prefix, d.name, d.suffix].filter(Boolean).join(' ');
                        const isSire = slotKey === 'sire' || slotKey.endsWith('Sire');
                        const GIcon = isSire ? Mars : Venus;
                        const gColor = isSire ? 'text-blue-400' : 'text-pink-400';
                        const handleSlotClick = d.ctcId && onViewAnimal ? async () => {
                            try {
                                const res = await axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(d.ctcId)}`, { headers: { Authorization: `Bearer ${authToken}` } });
                                if (res.data) onViewAnimal(res.data, 16);
                            } catch { /* not accessible */ }
                        } : undefined;
                        return (
                            <div key={slotKey} onClick={handleSlotClick} className={`rounded-lg border-2 p-3 h-full relative ${handleSlotClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${hasData ? (isSire ? 'border-blue-200 bg-blue-50/40' : 'border-pink-200 bg-pink-50/40') : 'border-dashed border-gray-200 bg-gray-50'}`}>
                                <div className={`flex items-center gap-1 mb-1.5 ${isSire ? 'text-blue-400' : 'text-pink-400'}`}>
                                    <GIcon size={11} className={`flex-shrink-0 ${gColor}`} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
                                </div>
                                {hasData ? (
                                    <div className="flex gap-2.5">
                                        {d.imageUrl && <img src={d.imageUrl} alt={fullName} className="w-10 h-10 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200 self-start" />}
                                        <div className="flex-1 min-w-0 space-y-0.5 pb-4">
                                            {fullName && <p className="text-[10px] sm:text-xs font-semibold text-gray-800 leading-tight">{fullName}</p>}
                                            {d.variety && <p className="text-[9px] sm:text-[11px] text-gray-500">{d.variety}</p>}
                                            {d.genCode && <p className="text-[9px] sm:text-[11px] font-mono text-indigo-600">{d.genCode}</p>}
                                            {d.birthDate && <p className="text-[9px] sm:text-[11px] text-gray-400">{formatDate(d.birthDate)}</p>}
                                            {d.deceasedDate && <p className="text-[9px] sm:text-[11px] text-red-600 font-semibold">† {formatDate(d.deceasedDate)}</p>}
                                            {d.breederName && <p className="text-[9px] sm:text-[11px] text-gray-500 italic">{d.breederName}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2.5">
                                        <div className="flex-1 min-w-0 space-y-0.5 pb-4">
                                            <p className="text-[11px] text-gray-300 italic">?</p>
                                        </div>
                                    </div>
                                )}
                                {d.ctcId && <p className="absolute bottom-1.5 right-2 text-[10px] font-mono text-gray-800">{d.ctcId}</p>}
                            </div>
                        );
                    };
                    return (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <Dna size={18} className="text-orange-500" />
                                    <h3 className="text-base font-semibold text-gray-700">Pedigree</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex rounded border border-gray-300 overflow-hidden text-xs">
                                        <button onClick={() => setBetaPedigreeView('vertical')} className={`px-2 py-1 transition-colors ${betaPedigreeView === 'vertical' ? 'bg-gray-200 font-semibold text-gray-800' : 'text-gray-400 hover:bg-gray-100'}`}>Vertical</button>
                                        <button onClick={() => setBetaPedigreeView('chart')} className={`px-2 py-1 transition-colors ${betaPedigreeView === 'chart' ? 'bg-primary font-semibold text-black' : 'text-gray-400 hover:bg-gray-100'}`}>Chart</button>
                                    </div>
                                    {hasAnyData && betaPedigreeView === 'vertical' && (
                                        <>
                                        <button onClick={handleDownloadMPPDF} disabled={mpDownloading}
                                            className="px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-black rounded-lg border border-primary/40 transition flex items-center gap-1.5 disabled:opacity-60 font-semibold">
                                            {mpDownloading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Download size={14} /> Save PDF</>}
                                        </button>
                                        <button onClick={handleDownloadMP} disabled={mpDownloading}
                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition flex items-center gap-1.5 disabled:opacity-60">
                                            {mpDownloading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Images size={14} /> Save Image</>}
                                        </button>
                                        </>
                                    )}
                                    {betaPedigreeView === 'chart' && (
                                        <>
                                        <button onClick={() => chartRef.current?.downloadPDF()} disabled={!chartRef.current?.imagesLoaded || chartRef.current?.isSaving}
                                            className="px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-black rounded-lg border border-primary/40 transition flex items-center gap-1.5 disabled:opacity-60 font-semibold">
                                            <Download size={14} /> Save PDF
                                        </button>
                                        <button onClick={() => chartRef.current?.downloadImage()} disabled={!chartRef.current?.imagesLoaded || chartRef.current?.isSaving}
                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition flex items-center gap-1.5 disabled:opacity-60">
                                            <Images size={14} /> Save Image
                                        </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 -mt-3">This pedigree displays both linked CritterTrack ancestors (with CTC IDs) and manually entered ancestors. Only linked CritterTrack ancestry is used for COI calculations (shown on Overview tab). Manual entries are for display/reference only and do not affect COI.</p>
                            <div className={betaPedigreeView === 'chart' ? '' : 'hidden'}>
                                <PedigreeChart ref={chartRef} inline animalId={animal.id_public} animalData={animal} API_BASE_URL={API_BASE_URL} authToken={authToken} onClose={() => {}} manualData={mpEnrichedData} onViewAnimal={onViewAnimal} />
                            </div>
                            <div className={betaPedigreeView === 'vertical' ? '' : 'hidden'}>
                            <div ref={mpTreeRef} className="space-y-6 bg-white p-4 rounded-xl">
                            {(() => {
                                const subjectVariety = ['color','coatPattern','coat','earset','phenotype','morph','markings'].map(k => animal[k]).filter(Boolean).join(' ');
                                const subjectImgUrl = animal.imageUrl || animal.photoUrl || null;
                                const subjectName = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ');
                                const isMale = animal.gender === 'Male';
                                const SubjectGenderIcon = isMale ? Mars : Venus;
                                const subjectGColor = isMale ? 'text-blue-500' : 'text-pink-500';
                                const ownerImgUrl = breederInfo?.profileImage || null;
                                const ownerShowPersonal = breederInfo?.showPersonalName ?? true;
                                const ownerShowBreeder = breederInfo?.showBreederName ?? true;
                                const ownerLines = [];
                                if (ownerShowPersonal && breederInfo?.personalName) ownerLines.push(breederInfo.personalName);
                                if (ownerShowBreeder && breederInfo?.breederName) ownerLines.push(breederInfo.breederName);
                                const ownerUserId = breederInfo?.id_public || null;
                                const ownerQrUrl = ownerUserId ? `${window.location.origin}/user/${ownerUserId}` : null;
                                return (
                                    <div className="rounded-xl border-2 border-primary bg-primary/10 overflow-hidden relative">
                                        {/* Owner/breeder ? top-right corner */}
                                        {breederInfo && (
                                        <div className="absolute top-2 right-2 flex flex-col items-center gap-1 text-center z-10">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                                                {ownerImgUrl ? <img src={ownerImgUrl} alt="Breeder" className="w-full h-full object-cover" /> : <User size={18} className="text-gray-400" />}
                                            </div>
                                            <div className="space-y-0">
                                                {ownerLines.length > 0 ? ownerLines.map((l,i) => <p key={i} className="text-xs font-semibold text-gray-700 leading-tight">{l}</p>) : null}
                                                {ownerUserId && <p className="text-[10px] font-mono text-gray-400">{ownerUserId}</p>}
                                            </div>
                                            {ownerQrUrl && <QRCodeSVG value={ownerQrUrl} size={52} bgColor="transparent" fgColor="#374151" level="M" />}
                                        </div>
                                        )}
                                        {/* Animal info ? centered */}
                                        <div className="flex flex-col items-center gap-2 text-center p-4 relative">
                                            {animal.species && <div className="absolute top-2 left-2 text-left"><p className="text-xs font-semibold text-gray-600 leading-tight">{animal.species}</p>{getSpeciesLatinName(animal.species) && <p className="text-[10px] italic text-gray-400 leading-tight">{getSpeciesLatinName(animal.species)}</p>}</div>}
                                            {subjectImgUrl ? <img src={subjectImgUrl} alt={subjectName} className="w-20 h-20 rounded-full object-cover border-2 border-primary/30" /> : <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-300"><Cat size={32} /></div>}
                                            <div className="flex items-center gap-1 justify-center">
                                                <SubjectGenderIcon size={14} className={`flex-shrink-0 ${subjectGColor}`} />
                                                <p className="text-base font-bold text-gray-800 leading-tight">{subjectName}</p>
                                            </div>
                                            {subjectVariety && <p className="text-xs text-gray-500 -mt-1">{subjectVariety}</p>}
                                            {animal.geneticCode && <p className="text-xs font-mono text-indigo-600">{animal.geneticCode}</p>}
                                            {animal.birthDate && <p className="text-xs text-gray-400">{formatDate(animal.birthDate)}</p>}
                                            {(animal.manualBreederName || (breederInfo && (breederInfo.breederName || breederInfo.personalName))) && <p className="text-xs text-gray-500 italic">{animal.manualBreederName || breederInfo.breederName || breederInfo.personalName}</p>}
                                            {animal.id_public && <p className="text-xs font-mono text-gray-400">{animal.id_public}</p>}
                                        </div>
                                    </div>
                                );
                            })()}
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 1 — Parents</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {renderSlot('sire', 'Sire')}
                                    {renderSlot('dam', 'Dam')}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 2 — Grandparents</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Paternal</p>
                                    <p className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest">Maternal</p>
                                    {renderSlot('sireSire', 'Grandsire')}
                                    {renderSlot('damSire', 'Grandsire')}
                                    {renderSlot('sireDam', 'Granddam')}
                                    {renderSlot('damDam', 'Granddam')}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 3 — Great-Grandparents</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Paternal</p>
                                    <p className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest">Maternal</p>
                                    <p className="text-[10px] text-gray-400 mb-0.5">via Grandsire</p>
                                    <p className="text-[10px] text-gray-400 mb-0.5">via Grandsire</p>
                                    {renderSlot('sireSireSire', 'Great-Grandsire')}
                                    {renderSlot('damSireSire', 'Great-Grandsire')}
                                    {renderSlot('sireSireDam', 'Great-Granddam')}
                                    {renderSlot('damSireDam', 'Great-Granddam')}
                                    <p className="text-[10px] text-gray-400 mt-1 mb-0.5">via Granddam</p>
                                    <p className="text-[10px] text-gray-400 mt-1 mb-0.5">via Granddam</p>
                                    {renderSlot('sireDamSire', 'Great-Grandsire')}
                                    {renderSlot('damDamSire', 'Great-Grandsire')}
                                    {renderSlot('sireDamDam', 'Great-Granddam')}
                                    {renderSlot('damDamDam', 'Great-Granddam')}
                                </div>
                            </div>
                            </div>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    </div>
    );
};
// Respects privacy toggles - only shows public sections
// Accessed from: Global search, user profiles, offspring links

export default ViewOnlyPrivateAnimalDetail;
