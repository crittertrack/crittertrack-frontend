import React, { useState, useEffect, useMemo } from 'react';
import {
    X, Cat, Mars, Venus, Edit, Archive, Users, Heart, Tag, Dna, Ruler, Palette, Hash, FolderOpen, Globe, Sprout,
    Shield, Stethoscope, UtensilsCrossed, Droplets, Thermometer, Scissors, MessageSquare, Brain, HeartPulse,
    Activity, AlertTriangle, Medal, Target, Key, Ban, Check, RefreshCw, Leaf, BookOpen, FileText, Calendar, Trophy, Loader2, ClipboardList,
    Clock, User, Camera, ChevronDown, ChevronUp, ChevronRight, Image as ImageIcon, FileJson, ArrowLeftRight, Share, Info,
    Scale, HeartOff, Eye, EyeOff, RotateCcw
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import axios from 'axios';
import { ViewOnlyParentCard } from './utils';
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
    animalBreedingLines = {},
    setShowImageModal,
    setEnlargedImageUrl
}) => {
    if (!animal) return null;

    const [activeTab, setActiveTab] = useState('overview');
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
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
            if (animal?.isOwned && animal?.creatorId_public) { // Changed from ownerId_public to creatorId_public
                try {
                    const response = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${animal.creatorId_public}&limit=1`); // Changed from ownerId_public to creatorId_public
                    if (response.data && response.data.length > 0) setOwnerInfo(response.data[0]);
                    else setOwnerInfo(null);
                } catch { setOwnerInfo(null); }
            } else { setOwnerInfo(null); }
        };
        fetchOwner();
    }, [animal?.isOwned, animal?.creatorId_public, API_BASE_URL]); // Changed from ownerId_public to creatorId_public

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
        { id: 'identification', label: 'Identification', icon: <Hash size={14} /> },
        { id: 'health', label: 'Health', icon: <HeartPulse size={14} /> },
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
            <div className="bg-[#e1f2f5] rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
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
                    <div className={`${isHeaderCollapsed ? 'w-full' : 'flex-1'} flex flex-col`}>
                        <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-300 shadow-sm p-4 h-full flex flex-col">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        {animal.prefix} {animal.name} {animal.suffix}
                                        {animal.gender === 'Male' && <Mars className="text-blue-500" size={24} />}
                                        {animal.gender === 'Female' && <Venus className="text-pink-500" size={24} />}
                                        <button onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)} className="p-1 text-gray-400 hover:text-gray-600" title={isHeaderCollapsed ? 'Expand Header' : 'Collapse Header'}>
                                            {isHeaderCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                                        </button>
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
                                                {animal.healthStatus && <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5"><HeartPulse size={12} />{animal.healthStatus}</span>}
                                                {animal.isForSale && <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Tag size={12} /> For Sale</span>}
                                                {animal.availableForBreeding && <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Heart size={12} /> Stud</span>}
                                            </div>
                                        </>
                                    )}
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
                                        const iWasTransferredThisAnimal = animal.originalOwnerId && animal.creatorId_public === userProfile?.id_public;
                                        if (iWasTransferredThisAnimal && handleReturnTransferredAnimal) { // Changed from ownerId_public to creatorId_public
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
                                                                    return `(${animal.deceasedDate ? `Lived ${age}` : `~${age}`})`;
                                                                })()}
                                                            </span>
                                                        </>
                                                    ) : null}
                                                </InfoItem>
                                                <InfoItem label="Purchase Date" value={animal.purchaseDate ? formatDate(animal.purchaseDate) : null} />

                                                {/* Row 3 */}
                                                <InfoItem label="Enclosure" value={enclosureInfo?.name} /> 
                                                <InfoItem label="Owner">
                                                    <span>{ownerInfo ? ownerInfo.breederName || ownerInfo.personalName : animal.ownerName || 'N/A'}</span>
                                                    {animal.coOwnership && <span className="text-gray-500 ml-1">({animal.coOwnership})</span>}
                                                </InfoItem>
                                                <InfoItem label="Breeder">{breederInfo ? breederInfo.breederName || breederInfo.personalName : animal.manualBreederName || 'N/A'}</InfoItem>
                                            </dl>
                                            <div className="pt-2 border-t border-gray-200">
                                                <p className="text-xs text-gray-700 text-center flex justify-center items-center gap-x-2">
                                                    {(() => {
                                                        const lines = (animalBreedingLines[animal.id_public] || []).map(lineId => breedingLineDefs.find(l => l.id === lineId)).filter(Boolean);
                                                        const idString = [animal.id_public, animal.breederAssignedId, animal.microchipNumber, animal.pedigreeRegistrationId, animal.colonyId, animal.tattooId].filter(Boolean).join(' • ');
                                                        const linesComponent = lines.length > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                {lines.map(line => (
                                                                    <span key={line.id} title={line.name} style={{ color: line.color }} className="text-sm leading-none">&#x25C6;</span>
                                                                ))}
                                                            </span>
                                                        );
                                                        const idComponent = idString && <span>{idString}</span>;
                                                        return (<>{linesComponent}{linesComponent && idComponent && <span className="text-gray-300 mx-1">•</span>}{idComponent}</>);
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
                                            </InfoCard>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white px-6 border-b border-gray-200">
                    <nav className="flex space-x-4 -mb-px overflow-x-auto">
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
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="absolute right-4 top-4 z-10 text-xs">
                                        {loadingCOI ? <span className="text-gray-400">COI: Calculating...</span> : animalCOI != null && <span className="font-semibold">COI: {animalCOI.toFixed(2)}%</span>}
                                    </div>
                                    <ViewOnlyParentCard parentId={animal.fatherId_public || animal.sireId_public} parentType="Sire" API_BASE_URL={API_BASE_URL} onViewAnimal={onViewAnimal} authToken={authToken} />
                                    <ViewOnlyParentCard parentId={animal.motherId_public || animal.damId_public} parentType="Dam" API_BASE_URL={API_BASE_URL} onViewAnimal={onViewAnimal} authToken={authToken} />
                                </div>
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
                        </div>
                    )}
                    {activeTab === 'dev' && (
                        <InfoCard title="Raw Data (for testing)" icon={<FileJson size={18} className="text-gray-400" />}>
                            <pre className="bg-gray-800 text-white p-4 rounded-md text-xs overflow-x-auto max-h-96">
                                {JSON.stringify(animal, null, 2)}
                            </pre>
                        </InfoCard>
                    )}
                    {activeTab === 'identification' && (
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
                     activeTab !== 'identification' &&
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