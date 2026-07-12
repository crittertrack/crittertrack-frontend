import React, { useState, useEffect, useMemo } from 'react';
import {
    X, Cat, Mars, Venus, Edit, Archive, Users, Heart, Tag, Dna, Ruler, Palette, Hash, FolderOpen, Globe, Sprout,
    Shield, Microscope, Pill, Stethoscope, UtensilsCrossed, Droplets, Thermometer, Scissors, MessageSquare, Brain,
    Activity, AlertTriangle, Medal, Target, Key, Ban, Check, RefreshCw, Leaf, BookOpen, FileText, Calendar, Trophy,
    Clock, User, Camera, ChevronDown, ChevronUp, ChevronRight, Image as ImageIcon, FileJson, ArrowLeftRight, Share, Info,
    Scale, HeartOff, Eye, EyeOff, RotateCcw
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import axios from 'axios';
import { ViewOnlyParentCard, useDetailFieldTemplate, DetailJsonList } from './utils';
import { FamilyTabContent } from './FamilyTabContent';
import { CareTabContent } from './CareTabContent';
import { PedigreeTabContent } from './PedigreeTabContent';
import { HealthTabContent } from './HealthTabContent';
import { GalleryTabContent } from './GalleryTabContent';
import { TimelineTabContent } from './TimelineTabContent';
import { NotesTabContent } from './NotesTabContent';
import { LegalTabContent } from './LegalTabContent';
import { BehaviorTabContent } from './BehaviorTabContent';
import { ShowTabContent } from './ShowTabContent';
import { EndOfLifeTabContent } from './EndOfLifeTabContent';
import { FertilityTabContent } from './FertilityTabContent';
import { MeasurementsTabContent } from './MeasurementsTabContent';
import { InfoCard, InfoItem, TimelineItem } from './DashboardComponents';

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

const parseMilestones = (data) => {
    return parseJsonArrayField(data).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
};

const AnimalTestModal = ({
    animal,
    onClose,
    onEdit,
    onArchive,
    onAddSibling,
    onTransfer,
    API_BASE_URL,
    authToken,
    onViewAnimal,
    onUpdateAnimal,
    onToggleOwned,
    userProfile,
    handleReturnTransferredAnimal,
    handleWithdrawTransfer,
    handleAcceptTransfer,
    handleRejectTransfer,
    breedingLineDefs = [], 
    animalBreedingLines = {}
}) => {
    if (!animal) return null;

    const [activeTab, setActiveTab] = useState('overview');
    const [mainImage, setMainImage] = useState(animal.imageUrl || animal.photoUrl);
    const [animalCOI, setAnimalCOI] = useState(null);
    const [loadingCOI, setLoadingCOI] = useState(false);
    const [breederInfo, setBreederInfo] = useState(null);
    const [ownerInfo, setOwnerInfo] = useState(null);
    const [enclosureInfo, setEnclosureInfo] = useState(null);

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
            if (animal?.isOwned && animal?.ownerId_public) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${animal.ownerId_public}&limit=1`);
                    if (response.data && response.data.length > 0) setOwnerInfo(response.data[0]);
                    else setOwnerInfo(null);
                } catch { setOwnerInfo(null); }
            } else { setOwnerInfo(null); }
        };
        fetchOwner();
    }, [animal?.isOwned, animal?.ownerId_public, API_BASE_URL]);

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
                    }
                } catch (error) {
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

    const allImages = useMemo(() => [animal.imageUrl || animal.photoUrl, ...(animal.extraImages || [])].filter(Boolean), [animal]);

    const TABS = [
        { id: 'overview', label: 'Overview', icon: <Info size={14} /> },
        { id: 'health', label: 'Health', icon: <Heart size={14} /> },
        { id: 'care', label: 'Care', icon: <Droplets size={14} /> },
        { id: 'measurements', label: 'Measurements', icon: <Ruler size={14} /> },
        { id: 'behavior', label: 'Behavior', icon: <Brain size={14} /> },
        { id: 'breeding', label: 'Breeding', icon: <Users size={14} /> },
        { id: 'pedigree', label: 'Pedigree', icon: <Dna size={14} /> },
        { id: 'gallery', label: 'Gallery', icon: <ImageIcon size={14} /> },
        { id: 'timeline', label: 'Timeline', icon: <Clock size={14} /> },
        { id: 'notes', label: 'Notes', icon: <FileText size={14} /> },
        { id: 'records', label: 'Records', icon: <BookOpen size={14} /> },
        { id: 'dev', label: 'Dev', icon: <FileJson size={14} /> },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[80] backdrop-blur-sm">
            <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-200 gap-6">
                    {/* Left: Gallery */}
                    <div className="w-1/3 flex flex-col gap-2">
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                            {mainImage ? (
                                <img src={mainImage} alt={animal.name} className="w-full h-full object-cover" />
                            ) : (
                                <Cat size={64} className="text-gray-300" />
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div className="flex gap-2">
                                {allImages.slice(0, 5).map((img, idx) => (
                                    <button key={idx} onClick={() => setMainImage(img)} className={`w-1/5 aspect-square rounded-md overflow-hidden border-2 ${mainImage === img ? 'border-primary' : 'border-transparent'}`}>
                                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info & Actions */}
                    <div className="w-2/3 flex flex-col">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                                    {animal.prefix} {animal.name} {animal.suffix}
                                    {animal.gender === 'Male' && <Mars className="text-blue-500" size={24} />}
                                    {animal.gender === 'Female' && <Venus className="text-pink-500" size={24} />}
                                </h2>
                                <p className="text-md text-gray-500">{animal.species} {animal.id_public && `• ${animal.id_public}`}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    {animal.status && <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">{animal.status}</span>}
                                    {animal.isForSale && <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Tag size={12} /> For Sale</span>}
                                    {animal.availableForBreeding && <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Heart size={12} /> Stud</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {onToggleOwned && <button onClick={() => onToggleOwned(animal.id_public, !animal.isOwned)} className={`p-2 rounded-lg transition ${animal.isOwned ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'}`} title={animal.isOwned ? 'Mark as Not Owned' : 'Mark as Owned'}>{animal.isOwned ? <Heart size={16} /> : <HeartOff size={16} />}</button>}
                                {onUpdateAnimal && <button onClick={() => {
                                    const newIsDisplay = !animal.isDisplay;
                                    onUpdateAnimal({ ...animal, isDisplay: newIsDisplay, showOnPublicProfile: newIsDisplay });
                                    axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { isDisplay: newIsDisplay, showOnPublicProfile: newIsDisplay }, { headers: { Authorization: `Bearer ${authToken}` } }).catch(() => onUpdateAnimal({ ...animal, isDisplay: !newIsDisplay, showOnPublicProfile: !newIsDisplay }));
                                }} className={`p-2 rounded-lg transition ${animal.isDisplay ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`} title={animal.isDisplay ? 'Make Private' : 'Make Public'}>{animal.isDisplay ? <Eye size={16} /> : <EyeOff size={16} />}</button>}
                                {onEdit && <button onClick={() => onEdit(animal)} className="p-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition"><Edit size={16} /></button>}
                                {onTransfer && (() => {
                                    const iWasTransferredThisAnimal = animal.originalOwnerId && animal.ownerId_public === userProfile?.id_public;
                                    if (iWasTransferredThisAnimal && handleReturnTransferredAnimal) {
                                        return (
                                            <button
                                                onClick={() => handleReturnTransferredAnimal()}
                                                className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition"
                                                title="Return to breeder"
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                        );
                                    }

                                    if (animal.pendingTransfer) {
                                        if (animal.pendingTransfer.fromUserId === userProfile?._id && handleWithdrawTransfer) {
                                            return (
                                                <button
                                                    onClick={() => handleWithdrawTransfer(animal.pendingTransfer._id)}
                                                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                                    title="Withdraw transfer request"
                                                >
                                                    <X size={16} />
                                                </button>
                                            );
                                        }
                                        if (animal.pendingTransfer.toUserId === userProfile?._id && handleAcceptTransfer && handleRejectTransfer) {
                                            return (
                                                <>
                                                    <button
                                                        onClick={() => handleAcceptTransfer(animal.pendingTransfer._id)}
                                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                                        title="Accept transfer"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectTransfer(animal.pendingTransfer._id)}
                                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                                        title="Reject transfer"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            );
                                        }
                                    }

                                    return (
                                        <button onClick={() => onTransfer(animal)} className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition" title="Transfer Animal">
                                            <ArrowLeftRight size={16} />
                                        </button>
                                    );
                                })()}
                                {onAddSibling && <button onClick={() => onAddSibling(animal)} className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"><Users size={16} /></button>}
                                {onArchive && <button onClick={() => onArchive(animal)} className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"><Archive size={16} /></button>}
                                <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800"><X size={20} /></button>
                            </div>
                        </div>

                        <dl className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                            <InfoItem label="ID" value={animal.id_public} />
                            <InfoItem label="Species" value={animal.species} />
                            <InfoItem label="Sex" value={animal.gender} />
                            <InfoItem label="Born" value={animal.birthDate ? formatDate(animal.birthDate) : 'N/A'} />
                            <InfoItem label="Variety" value={[animal.color, animal.coatPattern, animal.coat].filter(Boolean).join(', ') || 'N/A'} />
                            <InfoItem label="Breeder">{breederInfo ? breederInfo.breederName || breederInfo.personalName : animal.manualBreederName || 'N/A'}</InfoItem>
                            <InfoItem label="Keeper">{ownerInfo ? ownerInfo.breederName || ownerInfo.personalName : animal.keeperName || 'N/A'}</InfoItem>
                        </dl>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 border-b border-gray-200">
                    <nav className="flex space-x-4 -mb-px overflow-x-auto">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto bg-white rounded-b-xl flex-1">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <InfoCard title="About" icon={<Info size={18} className="text-gray-400" />}>
                                    <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                                        <InfoItem label="Species" value={animal.species} />
                                        <InfoItem label="Strain" value={animal.strain} />
                                        <InfoItem label="Breed" value={animal.breed} />
                                        <InfoItem label="Life Stage" value={animal.lifeStage} />
                                        <InfoItem label="Sex" value={animal.gender} />
                                        <InfoItem label="Birth Date" value={animal.birthDate ? formatDate(animal.birthDate) : 'N/A'} />
                                        <InfoItem label="Weight" value={animal.bodyWeight ? `${animal.bodyWeight}g` : 'N/A'} />
                                        <InfoItem label="Status" value={animal.status} />
                                        <InfoItem label="Origin" value={animal.origin} />
                                        <InfoItem label="Co-Ownership" value={animal.coOwnership} />
                                        <InfoItem label="Color" value={animal.color} />
                                        <InfoItem label="Pattern" value={animal.coatPattern} />
                                        <InfoItem label="Coat" value={animal.coat} />
                                        <InfoItem label="Carrier Traits" value={animal.carrierTraits} />
                                        {animal.tags && animal.tags.length > 0 && (
                                            <div className="col-span-full">
                                                <InfoItem label="Tags">
                                                    <div className="flex flex-wrap gap-1">
                                                        {animal.tags.map(tag => <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">{tag}</span>)}
                                                    </div>
                                                </InfoItem>
                                            </div>
                                        )}
                                        <div className="col-span-full">
                                            <InfoItem label="Genetic Code">
                                                <code className="bg-gray-100 p-1 rounded text-xs">{animal.geneticCode || 'N/A'}</code>
                                            </InfoItem>
                                        </div>
                                    </dl>
                                </InfoCard>
                                <InfoCard 
                                    title="Parents" 
                                    icon={<Users size={18} className="text-gray-400" />} 
                                    contentClassName="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <div className="absolute top-4 right-4 text-xs">
                                        {loadingCOI ? <span className="text-gray-400">COI: Calculating...</span> : animalCOI != null && <span className="font-semibold">COI: {animalCOI.toFixed(2)}%</span>}
                                    </div>
                                    <ViewOnlyParentCard parentId={animal.fatherId_public || animal.sireId_public} parentType="Sire" API_BASE_URL={API_BASE_URL} onViewAnimal={onViewAnimal} authToken={authToken} />
                                    <ViewOnlyParentCard parentId={animal.motherId_public || animal.damId_public} parentType="Dam" API_BASE_URL={API_BASE_URL} onViewAnimal={onViewAnimal} authToken={authToken} />
                                </InfoCard>
                            </div>
                            <div className="space-y-6">
                                <InfoCard title="Health Summary" icon={<Heart size={18} className="text-gray-400" />}>
                                    <InfoItem label="Health Status" value={animal.healthStatus || 'Good'} />
                                    <InfoItem label="Last Vet Check" value={animal.lastVetCheck ? formatDate(animal.lastVetCheck) : 'N/A'} />
                                    <InfoItem label="Medical Conditions" value={parseJsonArrayField(animal.medicalConditions).map(c => c.condition || c.name).join(', ')} />
                                </InfoCard>
                                <InfoCard title="Recent Activity" icon={<Clock size={18} className="text-gray-400" />}>
                                    {(() => {
                                        const milestones = parseMilestones(animal.milestones);
                                        if (milestones.length === 0) return <p className="text-sm text-gray-400">No recent activity.</p>;
                                        return milestones.slice(0, 3).map((m, i) => (
                                            <TimelineItem key={i} icon={<Calendar size={16} />} title={m.label} date={m.startDate} />
                                        ));
                                    })()}
                                </InfoCard>
                            </div>
                            <div className="lg:col-span-3">
                                <InfoCard title="Identification" icon={<Hash size={18} className="text-gray-400" />}>
                                    <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
                                        <InfoItem label="CritterTrack ID" value={animal.id_public} />
                                        <InfoItem label="Breeder Assigned ID" value={animal.breederAssignedId} />
                                        <InfoItem label="Microchip Number" value={animal.microchipNumber} />
                                        <InfoItem label="Pedigree Reg. ID" value={animal.pedigreeRegistrationId} />
                                        <InfoItem label="Registry Name"><span className="text-gray-400 italic">e.g., AKC, TICA</span></InfoItem>
                                        <InfoItem label="DNA Profile ID"><span className="text-gray-400 italic">e.g., V123456</span></InfoItem>
                                        <InfoItem label="Litter Reg. Number"><span className="text-gray-400 italic">e.g., RN12345678</span></InfoItem>
                                        <InfoItem label="Colony ID" value={animal.colonyId} />
                                        <InfoItem label="Tattoo ID" value={animal.tattooId} />
                                    </dl>
                                    {breedingLineDefs.length > 0 && (
                                        <div className="pt-4 mt-4 border-t">
                                            <InfoItem label="Breeding Lines">
                                                <div className="flex flex-wrap gap-2">
                                                    {(animalBreedingLines[animal.id_public] || []).map(lineId => breedingLineDefs.find(l => l.id === lineId)).filter(Boolean).map(line => <span key={line.id} style={{ backgroundColor: line.color, color: '#fff' }} className="text-xs font-semibold px-2 py-0.5 rounded-full">{line.name}</span>)}
                                                </div>
                                            </InfoItem>
                                        </div>
                                    )}
                                </InfoCard>
                            </div>
                        </div>
                    )}
                    {activeTab === 'dev' && (
                        <InfoCard title="Raw Data (for testing)" icon={<FileJson size={18} className="text-gray-400" />}>
                            <pre className="bg-gray-800 text-white p-4 rounded-md text-xs overflow-x-auto max-h-96">
                                {JSON.stringify(animal, null, 2)}
                            </pre>
                        </InfoCard>
                    )}
                    {activeTab === 'health' && (
                        <HealthTabContent
                            animal={animal}
                            API_BASE_URL={API_BASE_URL}
                        />
                    )}
                    {activeTab === 'measurements' && (
                        <MeasurementsTabContent
                            animal={animal}
                            onUpdateAnimal={onUpdateAnimal}
                            authToken={authToken}
                            API_BASE_URL={API_BASE_URL}
                        />
                    )}
                    {activeTab === 'care' && (
                        <CareTabContent
                            animal={animal}
                            API_BASE_URL={API_BASE_URL}
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
                            <FertilityTabContent
                                animal={animal}
                                API_BASE_URL={API_BASE_URL}
                            />
                            <FamilyTabContent
                                animal={animal}
                                API_BASE_URL={API_BASE_URL}
                                authToken={authToken}
                                onViewAnimal={onViewAnimal}
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
                    {activeTab === 'notes' && (
                        <NotesTabContent animal={animal} />
                    )}
                    {activeTab === 'records' && (
                        <div className="space-y-6">
                            <LegalTabContent animal={animal} API_BASE_URL={API_BASE_URL} />
                            <ShowTabContent animal={animal} />
                            <EndOfLifeTabContent animal={animal} API_BASE_URL={API_BASE_URL} />
                        </div>
                    )}
                    {/* Placeholder for other tabs */}
                    {activeTab !== 'overview' &&
                     activeTab !== 'dev' &&
                     activeTab !== 'breeding' &&
                     activeTab !== 'health' &&
                     activeTab !== 'care' &&
                     activeTab !== 'pedigree' &&
                     activeTab !== 'gallery' && 
                     activeTab !== 'timeline' && 
                     activeTab !== 'notes' &&
                     activeTab !== 'records' &&
                     activeTab !== 'measurements' &&
                     activeTab !== 'behavior' && (
                        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Content for the {activeTab} tab goes here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnimalTestModal;