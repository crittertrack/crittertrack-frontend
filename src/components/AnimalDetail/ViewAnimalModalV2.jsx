import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    X, Cat, Mars, Venus, Heart, Tag, Dna, Ruler, Palette, Hash, FolderOpen, Globe, Sprout,
    Shield, Stethoscope, UtensilsCrossed, Droplets, Thermometer, Scissors, MessageSquare, Brain, HeartPulse, Feather,
    Activity, AlertTriangle, Medal, Target, Key, Ban, RefreshCw, Leaf, BookOpen, FileText, Calendar, Trophy, Loader2, ClipboardList, Hourglass,
    Clock, User, Camera, ChevronDown, ChevronUp, ChevronRight, Image as ImageIcon, FileJson, Share, Info, Network, Star,
    Scale, Eye, EyeOff, TableOfContents, Users, HeartOff, Hospital, CheckCircle, Link
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate, litterAge } from '../../utils/dateFormatter';
import { getCurrencySymbol } from '../../utils/locationUtils';
import axios from 'axios';
import { ViewOnlyParentCard, computeRelationships } from './utils';
import { CareTabContent } from './CareTabContent';
import { PedigreeTabContent } from './PedigreeTabContent';
import { HealthTabContent } from './HealthTabContent';
import { GalleryTabContent } from './GalleryTabContent';
import { IdentificationTabContent } from './IdentificationTabContent';
import { AppearanceTabContent } from './AppearanceTabContent';
import { TimelineTabContent } from './TimelineTabContent';
import { BehaviorTabContent } from './BehaviorTabContent';
import { BreedingTabContent } from './BreedingTabContent';
import { InfoCard, InfoItem, TimelineItem } from './DashboardComponents';
import { RecordsTabContent } from './RecordsTabContent';
import ReportButton from '../ReportButton';

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

const StatusIndicator = ({ status }) => {
    const statusStyles = {
        'Excellent': 'bg-emerald-100 text-emerald-800',
        'Good': 'bg-green-100 text-green-800',
        'Fair': 'bg-yellow-100 text-yellow-800',
        'Poor': 'bg-orange-100 text-orange-800',
        'Under Observation': 'bg-yellow-100 text-yellow-800',
        'Under Treatment': 'bg-blue-100 text-blue-800',
        'Quarantined': 'bg-orange-100 text-orange-800',
        'Critical': 'bg-red-100 text-red-800',
        'Unknown': 'bg-gray-100 text-gray-800',
    };
    const style = statusStyles[status] || statusStyles['Unknown'];
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${style}`}>{status}</span>;
};

const getReproductionState = (animal) => {
    if (animal.gender === 'Male') return null;
    if (animal.isPregnant) return { label: 'Pregnant', color: 'bg-pink-100 text-pink-800', icon: '🤰' };
    if (animal.isNursing) return { label: 'Nursing', color: 'bg-orange-100 text-orange-800', icon: '🍼' };
    if (animal.isInMating) return { label: 'In Mating', color: 'bg-purple-100 text-purple-800', icon: '💑' };
    if (animal.isPlannedMating) return { label: 'Planned Mating', color: 'bg-purple-100 text-purple-800', icon: '📅' };
    return null;
};

const ViewAnimalModalV2 = ({
    animal,
    onClose,
    API_BASE_URL,
    authToken,
    onViewAnimal,
    mode = "private", // "private" | "public"
    breedingLineDefs = [], 
    animalBreedingLines = {},
    toggleAnimalBreedingLine,
    setAnimalBreedingLinesDirect,
    setShowImageModal,
    setEnlargedImageUrl
}) => {
    // Validate mode
    if (!["private", "public"].includes(mode)) {
        console.error(`Invalid ViewAnimalModalV2 mode: ${mode}. Must be "private" or "public".`);
    }
    
    const isPrivate = mode === "private";
    const isPublic = mode === "public";
    
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const [mainImage, setMainImage] = useState(animal?.imageUrl || animal?.photoUrl);
    const [showQR, setShowQR] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [animalCOI, setAnimalCOI] = useState(null);
    const [commonAncestorCount, setCommonAncestorCount] = useState(null);
    const [loadingCOI, setLoadingCOI] = useState(false);
    const [breederInfo, setBreederInfo] = useState(null);
    const [ownedAnimals, setOwnedAnimals] = useState([]); // Placeholder for owned animals
    const [ownedAnimalsLoaded, setOwnedAnimalsLoaded] = useState(false);
    const ownedAnimalsLoadedRef = useRef(false);
    const [globalRels, setGlobalRels] = useState(null);
    const [globalRelsLoading, setGlobalRelsLoading] = useState(false);
    const [ownerInfo, setOwnerInfo] = useState(null);
    const [enclosureInfo, setEnclosureInfo] = useState(null);
    const [relInsightsOpen, setRelInsightsOpen] = useState(true);
    const [offspringOpen, setOffspringOpen] = useState(true);
    const [animalLitters, setAnimalLitters] = useState(null);
    const [pedigreeOffspring, setPedigreeOffspring] = useState(null);
    const [expandedBreedingRecords, setExpandedBreedingRecords] = useState({});
    const [expandedPedigreeRecords, setExpandedPedigreeRecords] = useState({});
    const [breedingRecordOffspring, setBreedingRecordOffspring] = useState({});

    useEffect(() => {
        setMainImage(animal.imageUrl || animal.photoUrl);
    }, [animal.imageUrl, animal.photoUrl]);

    useEffect(() => {
        const fetchBreeder = async () => {
            if (animal?.breederId_public) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${animal.breederId_public}&limit=1`);
                    if (response.data && response.data.length > 0) setBreederInfo(response.data[0]);
                } catch (error) { setBreederInfo(null); }
            } else { setBreederInfo(null); }
        };
        fetchBreeder();
    }, [animal?.breederId_public, API_BASE_URL]);

    useEffect(() => {
        const fetchOwner = async () => {
            if (animal?.ownerId_public) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${animal.ownerId_public}&limit=1`);
                    if (response.data && response.data.length > 0) setOwnerInfo(response.data[0]);
                    else setOwnerInfo(null);
                } catch { setOwnerInfo(null); }
            } else { setOwnerInfo(null); }
        };
        fetchOwner();
    }, [animal?.ownerId_public, API_BASE_URL]);

    useEffect(() => {
        const fetchEnclosure = async () => {
            if (animal?.enclosureId && authToken) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/enclosures/${animal.enclosureId}`, { headers: { Authorization: `Bearer ${authToken}` } });
                    setEnclosureInfo(response.data);
                } catch { setEnclosureInfo(null); }
            } else { setEnclosureInfo(null); }
        };
        fetchEnclosure();
    }, [animal?.enclosureId, API_BASE_URL, authToken]);

    useEffect(() => {
        const fetchCOI = async () => {
            const sireId = animal?.fatherId_public || animal?.sireId_public;
            const damId = animal?.motherId_public || animal?.damId_public;
            
            if (animal?.id_public && sireId && damId) {
                setLoadingCOI(true);
                try {
                    const response = await axios.get(`${API_BASE_URL}/animals/${animal.id_public}/inbreeding`, { headers: { Authorization: `Bearer ${authToken}` } });
                    if (response.data && response.data.inbreedingCoefficient != null) {
                        setAnimalCOI(response.data.inbreedingCoefficient);
                        setCommonAncestorCount(response.data.commonAncestorCount || null);
                    }
                } catch (error) {
                    setAnimalCOI(null);
                    setCommonAncestorCount(null);
                } finally {
                    setLoadingCOI(false);
                }
            } else {
                setAnimalCOI(null);
            }
        };
        fetchCOI();
    }, [animal?.id_public, animal?.fatherId_public, animal?.sireId_public, animal?.motherId_public, animal?.damId_public, API_BASE_URL, authToken]);

    // Fetch own collection first, then global relationships sequentially
    useEffect(() => {
        if (!authToken || !animal?.id_public) {
            return;
        }
        if (ownedAnimalsLoadedRef.current) return;
        ownedAnimalsLoadedRef.current = true;

        const run = async () => {
            setGlobalRelsLoading(true);
            try {
                const animalsRes = await axios.get(`${API_BASE_URL}/animals`, { headers: { Authorization: `Bearer ${authToken}` } });
                setOwnedAnimals(animalsRes.data || []);
                setOwnedAnimalsLoaded(true);

                const relsRes = await axios.get(`${API_BASE_URL}/animals/${animal.id_public}/relationships`, { headers: { Authorization: `Bearer ${authToken}` } });
                setGlobalRels(relsRes.data || null);
            } catch { /* no-op */ }
            finally { setGlobalRelsLoading(false); }
        };
        run();
    }, [authToken, API_BASE_URL, animal?.id_public]);

    // Fetch litters where this animal is sire or dam
    useEffect(() => {
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
    useEffect(() => {
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

    // Listen for animal updates and refetch litters and pedigree data
    useEffect(() => {
        const handleAnimalUpdated = (event) => {
            const updatedAnimal = event.detail; // detail IS the animal object
            if (!updatedAnimal?.id_public || !animal) return;

            const shouldRefetch = updatedAnimal.id_public === animal.id_public || updatedAnimal.id_public === animal.sireId_public || updatedAnimal.id_public === animal.damId_public || updatedAnimal.id_public === animal.fatherId_public || updatedAnimal.id_public === animal.motherId_public;

            if (shouldRefetch) {
                setAnimalLitters(null);
                setPedigreeOffspring(null);
                setBreedingRecordOffspring({});
            }
        };
        window.addEventListener('animal-updated', handleAnimalUpdated);
        return () => window.removeEventListener('animal-updated', handleAnimalUpdated);
    }, [animal]);

    const allImages = useMemo(() => [animal.imageUrl || animal.photoUrl, ...(animal.extraImages || [])].filter(Boolean), [animal]);

    const TABS = [
        { id: 'dashboard', label: 'Dashboard', icon: <Info size={14} /> },
        { id: 'identification', label: 'Identification', icon: <Hash size={14} /> },
        { id: 'appearance', label: 'Appearance', icon: <Palette size={14} /> }, 
        { id: 'health', label: 'Health', icon: <HeartPulse size={14} /> }, 
        { id: 'care', label: 'Routine Care', icon: <Droplets size={14} /> }, 
        { id: 'behavior', label: 'Behavior', icon: <Brain size={14} /> }, 
        { id: 'breeding', label: 'Breeding', icon: <Users size={14} /> },
        { id: 'pedigree', label: 'Pedigree', icon: <Dna size={14} /> },
        { id: 'gallery', label: 'Gallery', icon: <ImageIcon size={14} /> },
        { id: 'timeline', label: 'Timeline', icon: <Clock size={14} /> },
        { id: 'records', label: 'Records', icon: <FileText size={14} /> },
    ];

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
        <>
            {!animal ? null : (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[80] backdrop-blur-sm">
            <div className="bg-[#e1f2f5] rounded-xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col">
                {/* Header */}
                <div className={`flex items-stretch p-4 md:p-6 pb-3 md:pb-4 border-b border-gray-200 gap-4 md:gap-6`}>
                    {/* Left: Gallery */}
                    <div className={`w-1/4 flex-col gap-2 ${isHeaderCollapsed ? 'hidden' : 'flex'}`}>
                        <div className="flex-grow bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-300">
                            {mainImage ? (
                                <img 
                                    src={mainImage} 
                                    alt={animal.name} 
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => {
                                        if (setShowImageModal && setEnlargedImageUrl) {
                                            setEnlargedImageUrl(mainImage);
                                            setShowImageModal(true);
                                        }
                                    }}
                                />
                            ) : (
                                <Cat size={64} className="text-gray-300" />
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div className="flex-shrink-0 flex gap-2">
                                {allImages.slice(0, 3).map((img, idx) => (
                                    <button key={idx} onClick={() => setMainImage(img)} className={`w-1/3 aspect-square rounded-md overflow-hidden border-2 ${mainImage === img ? 'border-primary' : 'border-gray-300'}`}>
                                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info & Actions */}
                    <div className="flex-1 flex flex-col">
                        <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-300 shadow-sm p-4 h-full flex flex-col">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        {animal.prefix} {animal.name} {animal.suffix} {animal.gender === 'Male' && <Mars className="text-blue-500" size={24} />} {animal.gender === 'Female' && <Venus className="text-pink-500" size={24} />}
                                    </h2>
                                    {!isHeaderCollapsed && (
                                        <>
                                            <p className="text-xs text-gray-700">
                                                {[animal.species, animal.strain, animal.breed, animal.origin].filter(Boolean).join(' • ')}
                                            </p>
                                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${animal.isOwned ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-800'}`}>
                                                    {animal.isOwned ? <Heart size={12} /> : <HeartOff size={12} />}
                                                    {animal.isOwned ? 'Owned' : 'Not Owned'}
                                                </span>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${animal.isDisplay ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                                    {animal.isDisplay ? <Eye size={12} /> : <EyeOff size={12} />}
                                                    {animal.isDisplay ? 'Public' : 'Private'}
                                                </span>
                                                {animal.status && <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5"><ClipboardList size={12} />{animal.status}</span>}
                                                {animal.lifeStage && <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5"><Sprout size={12} />{animal.lifeStage}</span>}
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5"><HeartPulse size={12} /><StatusIndicator status={animal.healthStatus || 'Excellent'} /></span>
                                                {(() => {
                                                    const reproState = getReproductionState(animal);
                                                    return reproState ? <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${reproState.color}`}>{reproState.icon} {reproState.label}</span> : null;
                                                })()}
                                                {animal.isForSale && <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Tag size={12} /> For Sale{animal.salePriceCurrency !== 'Negotiable' && animal.salePriceAmount ? ` · ${getCurrencySymbol(animal.salePriceCurrency)}${animal.salePriceAmount}` : ''}</span>}
                                                {animal.availableForBreeding && <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Heart size={12} /> Stud{animal.studFeeCurrency !== 'Negotiable' && animal.studFeeAmount ? ` · ${getCurrencySymbol(animal.studFeeCurrency)}${animal.studFeeAmount}` : ''}</span>}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Favorite Button (if logged in) */}
                                    {authToken && (
                                        <button 
                                            onClick={() => setIsFavorited(!isFavorited)}
                                            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                                                isFavorited 
                                                    ? 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                                        >
                                            <Heart size={18} fill={isFavorited ? "currentColor" : "none"} />
                                            {isFavorited ? "Favorited" : "Favorite"}
                                        </button>
                                    )}
                                    
                                    {/* Share Button */}
                                    <button 
                                        onClick={() => setShowQR(true)}
                                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-gray-800 rounded-lg font-semibold transition flex items-center gap-2"
                                        title="Share animal link"
                                    >
                                        <Share size={18} />
                                        Share
                                    </button>
                                    
                                    {/* Report Button */}
                                    <div className="inline-block">
                                        <ReportButton
                                            contentType="animal"
                                            contentId={animal.id_public}
                                            contentcreatorId={animal.creatorId_public}
                                            API_BASE_URL={API_BASE_URL}
                                            authToken={authToken}
                                            tooltipText="Report this animal"
                                        />
                                    </div>
                                    
                                    {/* Close Button */}
                                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                                </div>
                            </div>

                            {!isHeaderCollapsed && (
                                <>
                                    <div className="mt-3 flex gap-4 flex-grow">
                                        <div className="w-2/3 space-y-4">
                                            <dl className="grid grid-cols-3 gap-x-6 gap-y-4 text-xs">
                                                {/* Row 1 */}
                                                <InfoItem label="Variety">
                                                    {[animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).join(' ') || <span className="text-gray-400">N/A</span>}
                                                </InfoItem>
                                                <InfoItem label="Carries" value={animal.carrierTraits} />
                                                <InfoItem label="Genetics">
                                                    {animal.geneticCode && <code className="font-mono">{animal.geneticCode}</code>}
                                                </InfoItem>

                                                {/* Row 2 */}
                                                <InfoItem label="Weight" value={animal.bodyWeight ? `${animal.bodyWeight}${animal.measurementUnits?.weight || 'g'}` : null} />
                                                <InfoItem label="Birthdate">
                                                    {animal.birthDate ? (
                                                        <>
                                                            {formatDate(animal.birthDate)}
                                                            <span className="text-gray-500 ml-1">
                                                                {(() => {
                                                                    const birth = new Date(animal.birthDate);
                                                                    const endDate = animal.deceasedDate ? new Date(animal.deceasedDate) : new Date();
                                                                    let years = endDate.getFullYear() - birth.getFullYear();
                                                                    let months = endDate.getMonth() - birth.getMonth();
                                                                    let days = endDate.getDate() - birth.getDate();
                                                                    if (days < 0) { months--; days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate(); }
                                                                    if (months < 0) { years--; months += 12; }
                                                                    const age = years > 0 ? `${years}y ${months}m` : (months > 0 ? `${months}m ${days}d` : `${days}d`);
                                                                    return `(${animal.deceasedDate ? `Lived ${age} † ${formatDate(animal.deceasedDate)}` : `~${age}`})`;
                                                                })()}
                                                            </span>
                                                        </>
                                                    ) : null}
                                                </InfoItem>
                                                <InfoItem label="Purchase Date" value={animal.purchaseDate ? formatDate(animal.purchaseDate) : null} />

                                                {/* Row 3 */}
                                                <InfoItem label="Enclosure" value={enclosureInfo?.name} /> 
                                                <InfoItem label="Owner">
                                                    <span>{ownerInfo ? ownerInfo.breederName || ownerInfo.personalName : animal.manualownerName || 'N/A'}</span>
                                                    {animal.coOwnership && <span className="text-gray-500 ml-1">({animal.coOwnership})</span>}
                                                </InfoItem>
                                                <InfoItem label="Breeder">{breederInfo ? breederInfo.breederName || breederInfo.personalName : animal.manualBreederName || 'N/A'}</InfoItem>
                                            </dl>
                                            <div className="pt-2 border-t border-gray-200">
                                                <p className="text-xs text-gray-700 text-center flex justify-center items-center gap-x-2">
                                                    {(() => {
                                                        const lines = (animalBreedingLines[animal.id_public] || []).map(lineId => breedingLineDefs.find(l => l.id === lineId)).filter(Boolean);
                                                        const idParts = [
                                                            animal.id_public,
                                                            animal.breederAssignedId,
                                                            animal.microchipNumber,
                                                            animal.pedigreeRegistrationId,
                                                            animal.colonyId,
                                                            animal.tattooId,
                                                            animal.ringId,
                                                            animal.eartagNumber,
                                                            ...parseJsonArrayField(animal.identifiers).map(id => id.value)
                                                        ];
                                                        const idString = idParts.filter(Boolean).join(' • ');
                                                        const linesComponent = lines.length > 0 ? (
                                                            <span className="flex items-center gap-1">
                                                                {lines.map(line => (
                                                                    <span key={line.id} title={line.name} style={{ color: line.color }} className="text-sm leading-none">&#x25C6;</span>
                                                                ))}
                                                            </span>
                                                        ) : null;
                                                        const idComponent = idString ? <span>{idString}</span> : null;
                                                        
                                                        return (
                                                            <>
                                                                {linesComponent}
                                                                {linesComponent && idComponent && <span className="text-gray-300 mx-1">•</span>}
                                                                {idComponent}
                                                            </>
                                                        );
                                                    })()}
                                                </p>
                                                {animal.tags && animal.tags.length > 0 && (
                                                    <div className="text-center mt-2">
                                                        <div className="flex flex-wrap gap-2 justify-center">
                                                            {animal.tags.map(tag => (
                                                                <span key={tag} className="bg-gray-200 text-gray-800 text-xs font-medium px-1.5 py-0.5 rounded-full">{tag}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-1/3 flex flex-col">
                                            <InfoCard title="Notes" icon={<FileText size={16} className="text-gray-400" />} className="flex-1" contentClassName="overflow-y-auto">
                                                <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{animal.remarks || 'No remarks for this animal.'}</p>
                                            </InfoCard> {/* Remarks are now on the Dashboard tab */}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border-b border-gray-200">
                    <nav className="flex items-center space-x-4 -mb-px overflow-x-auto px-4">
                        <button
                            onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors border border-gray-300"
                            title={isHeaderCollapsed ? 'Expand Header' : 'Collapse Header'}
                        >
                            {isHeaderCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                        </button>
                        <div className="h-6 w-px bg-gray-200"></div>
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-700 hover:text-gray-800 hover:border-gray-400'}`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto rounded-b-xl flex-1">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Sire Card */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full">
                                <ViewOnlyParentCard parentId={animal.fatherId_public || animal.sireId_public} parentType="Sire" API_BASE_URL={API_BASE_URL} onViewAnimal={onViewAnimal} authToken={authToken} />
                            </div>
                            {/* Dam Card */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full">
                                <ViewOnlyParentCard parentId={animal.motherId_public || animal.damId_public} parentType="Dam" API_BASE_URL={API_BASE_URL} onViewAnimal={onViewAnimal} authToken={authToken} />
                            </div>
                            {/* Health Summary Card */}
                            <div>
                                <InfoCard title="Health Summary" icon={<Heart size={18} className="text-gray-400" />}>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">Health Status</label>
                                            <div className="mt-1">
                                                <StatusIndicator status={animal.healthStatus || 'Excellent'} />
                                            </div>
                                        </div>
                                        {animal.lastVetCheck && (
                                            <div>
                                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">Last Vet Check</label>
                                                <p className="mt-1 text-sm text-gray-700">{formatDate(animal.lastVetCheck)}</p>
                                            </div>
                                        )}
                                        {(() => {
                                            const conditions = parseJsonArrayField(animal.medicalConditions).filter(Boolean);
                                            return conditions.length > 0 ? (
                                                <div>
                                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">Medical Conditions</label>
                                                    <p className="mt-1 text-sm text-gray-700">{conditions.map(c => c.condition || c.name).join(', ')}</p>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                </InfoCard>
                            </div>
                            {/* Recent Activity Card */}
                            <div>
                                <InfoCard title="Recent Activity" icon={<Clock size={18} className="text-gray-400" />}>
                                    {(() => {
                                        // Aggregate all timeline events
                                        const timelineEvents = [];

                                        // Milestones
                                        const milestones = parseJsonArrayField(animal.milestones) || [];
                                        milestones.forEach(m => {
                                            if (m?.startDate) {
                                                timelineEvents.push({
                                                    date: new Date(m.startDate),
                                                    icon: <Target size={14} className="text-purple-500" />,
                                                    title: m.label || 'Milestone',
                                                    displayDate: m.startDate
                                                });
                                            }
                                        });

                                        // Health events
                                        if (animal.quarantineDetails?.startDate) {
                                            timelineEvents.push({
                                                date: new Date(animal.quarantineDetails.startDate),
                                                icon: <Shield size={14} className="text-orange-500" />,
                                                title: 'Quarantine Started',
                                                displayDate: animal.quarantineDetails.startDate
                                            });
                                        }

                                        if (animal.spayNeuterDate) {
                                            timelineEvents.push({
                                                date: new Date(animal.spayNeuterDate),
                                                icon: <Stethoscope size={14} className="text-red-500" />,
                                                title: 'Spay/Neuter Surgery',
                                                displayDate: animal.spayNeuterDate
                                            });
                                        }

                                        (parseJsonArrayField(animal.vetVisits) || []).forEach((visit, idx) => {
                                            if (visit?.date) {
                                                timelineEvents.push({
                                                    date: new Date(visit.date),
                                                    icon: <Stethoscope size={14} className="text-blue-500" />,
                                                    title: 'Vet Visit',
                                                    displayDate: visit.date
                                                });
                                            }
                                        });

                                        (parseJsonArrayField(animal.vaccinations) || []).forEach((vacc, idx) => {
                                            if (vacc?.date) {
                                                timelineEvents.push({
                                                    date: new Date(vacc.date),
                                                    icon: <Droplets size={14} className="text-green-500" />,
                                                    title: 'Vaccination',
                                                    displayDate: vacc.date
                                                });
                                            }
                                        });

                                        // Breeding events
                                        if (animal.lastHeatDate) {
                                            timelineEvents.push({
                                                date: new Date(animal.lastHeatDate),
                                                icon: <Heart size={14} className="text-pink-500" />,
                                                title: 'Heat Cycle',
                                                displayDate: animal.lastHeatDate
                                            });
                                        }

                                        if (animal.matingDate) {
                                            timelineEvents.push({
                                                date: new Date(animal.matingDate),
                                                icon: <Heart size={14} className="text-red-500" />,
                                                title: 'Mating',
                                                displayDate: animal.matingDate
                                            });
                                        }

                                        if (animal.expectedDueDate) {
                                            timelineEvents.push({
                                                date: new Date(animal.expectedDueDate),
                                                icon: <Heart size={14} className="text-pink-600" />,
                                                title: 'Expected Delivery',
                                                displayDate: animal.expectedDueDate
                                            });
                                        }

                                        (parseJsonArrayField(animal.breedingRecords) || []).forEach((record, idx) => {
                                            if (record?.birthEventDate) {
                                                timelineEvents.push({
                                                    date: new Date(record.birthEventDate),
                                                    icon: <Users size={14} className="text-emerald-500" />,
                                                    title: 'Birth/Hatching Event',
                                                    displayDate: record.birthEventDate
                                                });
                                            }
                                        });

                                        if (animal.weaningDate) {
                                            timelineEvents.push({
                                                date: new Date(animal.weaningDate),
                                                icon: <Users size={14} className="text-teal-500" />,
                                                title: 'Weaning',
                                                displayDate: animal.weaningDate
                                            });
                                        }

                                        // Keeper events
                                        (animal.ownershipHistory || []).forEach((ownership, idx) => {
                                            if (ownership?.startDate) {
                                                timelineEvents.push({
                                                    date: new Date(ownership.startDate),
                                                    icon: <User size={14} className="text-slate-500" />,
                                                    title: 'Keeper Changed',
                                                    displayDate: ownership.startDate
                                                });
                                            }
                                        });

                                        if (animal.purchaseDate) {
                                            timelineEvents.push({
                                                date: new Date(animal.purchaseDate),
                                                icon: <User size={14} className="text-indigo-500" />,
                                                title: 'Animal Purchased',
                                                displayDate: animal.purchaseDate
                                            });
                                        }

                                        if (animal.saleDate) {
                                            timelineEvents.push({
                                                date: new Date(animal.saleDate),
                                                icon: <User size={14} className="text-violet-500" />,
                                                title: 'Animal Sold',
                                                displayDate: animal.saleDate
                                            });
                                        }

                                        // Show events
                                        (parseJsonArrayField(animal.shows) || []).forEach((show, idx) => {
                                            if (show?.date) {
                                                timelineEvents.push({
                                                    date: new Date(show.date),
                                                    icon: <Medal size={14} className="text-amber-500" />,
                                                    title: `Show: ${show.showName}${show.titleEarned ? ` - ${show.titleEarned}` : ''}`,
                                                    displayDate: show.date
                                                });
                                            }
                                        });

                                        // Status changes
                                        if (animal.dateOfDeath) {
                                            timelineEvents.push({
                                                date: new Date(animal.dateOfDeath),
                                                icon: <AlertTriangle size={14} className="text-gray-600" />,
                                                title: 'Animal Deceased',
                                                displayDate: animal.dateOfDeath
                                            });
                                        }

                                        // Health clearances
                                        (parseJsonArrayField(animal.healthClearances) || []).forEach((clearance) => {
                                            if (clearance?.dateIssued) {
                                                timelineEvents.push({
                                                    date: new Date(clearance.dateIssued),
                                                    icon: <Hospital size={14} className="text-green-600" />,
                                                    title: `Health Clearance: ${clearance.clearanceType}`,
                                                    displayDate: clearance.dateIssued
                                                });
                                            }
                                        });

                                        // Parasite prevention schedule
                                        (parseJsonArrayField(animal.parasitePreventionSchedule) || []).forEach((schedule) => {
                                            if (schedule?.startDate) {
                                                timelineEvents.push({
                                                    date: new Date(schedule.startDate),
                                                    icon: <Shield size={14} className="text-blue-600" />,
                                                    title: `Parasite Prevention: ${schedule.treatment}`,
                                                    displayDate: schedule.startDate
                                                });
                                            }
                                        });

                                        // Sort by date (most recent first) and take top 5
                                        const recentEvents = timelineEvents
                                            .sort((a, b) => b.date - a.date)
                                            .slice(0, 5);

                                        if (recentEvents.length === 0) return <p className="text-sm text-gray-400">No recent activity.</p>;
                                        return recentEvents.map((event, i) => (
                                            <TimelineItem key={i} icon={event.icon} title={event.title} date={event.displayDate} />
                                        ));
                                    })()}
                                </InfoCard>
                            </div>
                            
                            </div>
                            {(animalCOI != null || loadingCOI) && (
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="border-b border-gray-200 pb-2 mb-2">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Coefficient of Inbreeding (COI)</h3>
                                    </div>
                                    {animalCOI != null && (
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">COI:</span> {animalCOI.toFixed(2)}%
                                            {commonAncestorCount != null && <span className="text-gray-600"> (calculated on {commonAncestorCount} common ancestor{commonAncestorCount !== 1 ? 's' : ''})</span>}
                                        </p>
                                    )}
                                    {loadingCOI && <p className="text-xs text-gray-400">Calculating COI...</p>}
                                </div>
                            )}
                            <div className="bg-blue-50 rounded-lg border border-blue-200">
                                <button
                                    type="button"
                                    onClick={() => setRelInsightsOpen(o => !o)}
                                    className="w-full flex items-center justify-between p-4 text-left"
                                >
                                    <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                                        <Network size={20} className="text-blue-600 mr-2" />
                                        Relationship Insights
                                        {ownedAnimalsLoaded && allRelGroups.length > 0 && (
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
                                        {!ownedAnimalsLoaded ? (
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
                            <InfoCard title="Offspring & Litters" icon={<Users size={18} className="text-gray-400" />}>
                                {(animalLitters === null || pedigreeOffspring === null) ? (
                                    <div className="text-sm text-gray-500 animate-pulse">
                                        Loading offspring & litters...
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
                                    if (allRecords.length === 0) {
                                        return (
                                            <p className="text-center text-sm text-gray-400">
                                                No known offspring/litters recorded.
                                            </p>
                                        );
                                    }
                                    return (
                                            <div className="space-y-2">
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
                                                                            {!litter.isPlanned && litter.birthDate && <span>{formatDate(litter.birthDate)}{litterAge(litter.birthDate) && <span className="ml-1 font-semibold text-green-600">~ {litterAge(litter.birthDate)}</span>}</span>}
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
                                                                                    <div className="w-full px-2 pb-2 flex justify-end"> {/* Changed from creatorId_public to creatorId_public */}
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
                                            </div>
                                    );
                                })()}
                                </InfoCard>
                        </div>
                    )}
                    {activeTab === 'identification' && (
                        <IdentificationTabContent
                            animal={animal}
                            isEditable={false}
                        />
                    )}
                    {activeTab === 'appearance' && (
                        <AppearanceTabContent 
                            animal={animal} 
                            authToken={authToken}
                            API_BASE_URL={API_BASE_URL}
                        />
                    )}
                    {activeTab === 'health' && (
                        <HealthTabContent animal={animal} API_BASE_URL={API_BASE_URL} />
                    )}
                    {activeTab === 'care' && (
                        <CareTabContent
                            animal={animal}
                            enclosureInfo={enclosureInfo}
                        />
                    )}
                    {activeTab === 'behavior' && (
                        <BehaviorTabContent
                            animal={animal}
                            API_BASE_URL={API_BASE_URL}
                        />
                    )}
                    {activeTab === 'breeding' && (
                        <div className="space-y-6">
                            <BreedingTabContent
                                animal={animal} // This tab no longer contains Relationship Insights
                                API_BASE_URL={API_BASE_URL}
                            />
                        </div>
                    )}
                    {activeTab === 'pedigree' && (
                        <PedigreeTabContent
                            animal={animal}
                            API_BASE_URL={API_BASE_URL}
                            authToken={authToken}
                            onViewAnimal={onViewAnimal}
                        />
                    )}
                    {activeTab === 'gallery' && (
                        <GalleryTabContent animal={animal} />
                    )}
                    {activeTab === 'timeline' && (
                        <TimelineTabContent animal={animal} />
                    )}
                    {activeTab === 'records' && (
                        <div className="space-y-6">
                            <RecordsTabContent animal={animal} API_BASE_URL={API_BASE_URL} />
                        </div>
                    )}
                    {/* Placeholder for other tabs */}
                    {activeTab !== 'dashboard' &&
                        activeTab !== 'identification' &&
                        activeTab !== 'appearance' &&
                        activeTab !== 'health' &&
                        activeTab !== 'care' &&
                        activeTab !== 'behavior' &&
                        activeTab !== 'breeding' &&
                        activeTab !== 'pedigree' &&
                        activeTab !== 'gallery' &&
                        activeTab !== 'timeline' &&
                        activeTab !== 'records' && (
                        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Content for the {activeTab} tab goes here.</p>
                        </div>
                    )}

                    {/* Breeding Lines - Private only */}
                    {/* Removed: breeding lines are shown in IdentificationTabContent when that tab is active */}
                </div>
            </div>
        </div>
            )}

            {/* QR Code Share Modal */}
            {showQR && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60" onClick={() => setShowQR(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 w-72" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between w-full">
                            <h3 className="font-semibold text-gray-800 text-sm truncate pr-2">{animal.name || 'Share'}</h3>
                            <button onClick={() => setShowQR(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                        </div>
                        <div className="p-3 bg-white border border-gray-200 rounded-xl">
                            <QRCodeSVG 
                                value={`${window.location.origin}/animal/${animal.id_public}`} 
                                size={196} 
                                bgColor="#ffffff" 
                                fgColor="#111827" 
                                level="M" 
                            />
                        </div>
                        <p className="text-xs text-gray-400 break-all text-center leading-relaxed">
                            {`${window.location.origin}/animal/${animal.id_public}`}
                        </p>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/animal/${animal.id_public}`);
                                alert('Link copied to clipboard!');
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg text-sm transition"
                        >
                            <Link size={14} /> Copy Link
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ViewAnimalModalV2;