import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, ChevronDown, ChevronRight, Trash2, Edit, Save, PlusCircle, Plus, ArrowLeft, Loader2, RefreshCw, User, Users, ClipboardList, BookOpen, Settings, Mail, Globe, Bean, Milk, Search, X, Mars, Venus, Eye, EyeOff, Home, Heart, HeartOff, HeartHandshake, Bell, XCircle, CheckCircle, Download, FileText, Link, AlertCircle, Check, DollarSign, Archive, ArrowLeftRight, RotateCcw, Info, Hourglass, MessageSquare, Ban, Flag, Scissors, VenusAndMars, Circle, Shield, Lock } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'flag-icons/css/flag-icons.min.css';
import MouseGeneticsCalculator from './components/MouseGeneticsCalculator';
import GeneticCodeBuilder from './components/GeneticCodeBuilder';
import BudgetingTab from './components/BudgetingTab';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import InstallPWA from './components/InstallPWA';
import AdminPanel from './components/EnhancedAdminPanel';
import UrgentNotificationModal from './components/UrgentNotificationModal';
import MaintenanceModeBanner from './components/MaintenanceModeBanner';
import { TutorialProvider, useTutorial } from './contexts/TutorialContext';
import { InitialTutorialModal, TutorialOverlay, TutorialHighlight } from './components/TutorialOverlay';
import { TUTORIAL_LESSONS } from './data/tutorialLessonsNew';
import InfoTab from './components/InfoTab';
import WelcomeBanner from './components/WelcomeBanner';
import ReportButton from './components/ReportButton';
import ModerationAuthModal from './components/moderation/ModerationAuthModal';
import ModOversightPanel from './components/moderation/ModOversightPanel';
import ModeratorActionSidebar from './components/moderation/ModeratorActionSidebar';

// const API_BASE_URL = 'http://localhost:5000/api'; // Local development
// const API_BASE_URL = 'https://crittertrack-pedigree-production.up.railway.app/api'; // Direct Railway (for testing)
const API_BASE_URL = '/api'; // Production via Vercel proxy

const GENDER_OPTIONS = ['Male', 'Female', 'Intersex', 'Unknown'];
const STATUS_OPTIONS = ['Pet', 'Breeder', 'Available', 'Sold', 'Retired', 'Deceased', 'Rehomed', 'Unknown']; 

const DEFAULT_SPECIES_OPTIONS = ['Fancy Mouse', 'Fancy Rat', 'Russian Dwarf Hamster', 'Campbells Dwarf Hamster', 'Chinese Dwarf Hamster', 'Syrian Hamster', 'Guinea Pig'];

// Helper function to get plural/display names for species
const getSpeciesDisplayName = (species) => {
    const displayNames = {
        'Fancy Mouse': 'Fancy Mice',
        'Mouse': 'Fancy Mice', // Backwards compatibility
        'Fancy Rat': 'Fancy Rats',
        'Rat': 'Fancy Rats', // Backwards compatibility
        'Russian Dwarf Hamster': 'Russian Dwarf Hamsters',
        'Campbells Dwarf Hamster': 'Campbells Dwarf Hamsters',
        'Chinese Dwarf Hamster': 'Chinese Dwarf Hamsters',
        'Syrian Hamster': 'Syrian Hamsters',
        'Hamster': 'Hamsters', // Backwards compatibility
        'Guinea Pig': 'Guinea Pigs'
    };
    return displayNames[species] || species;
};

// Map species to their latin names for display
const getSpeciesLatinName = (species) => {
    const latinNames = {
        'Fancy Mouse': 'Mus musculus',
        'Mouse': 'Mus musculus',
        'Fancy Rat': 'Rattus norvegicus',
        'Rat': 'Rattus norvegicus',
        'Russian Dwarf Hamster': 'Phodopus sungorus',
        'Campbells Dwarf Hamster': 'Phodopus campbelli',
        'Chinese Dwarf Hamster': 'Cricetulus barabensis',
        'Syrian Hamster': 'Mesocricetus auratus',
        'Guinea Pig': 'Cavia porcellus'
    };
    return latinNames[species] || null;
};

// Helper function to get flag class from country code (for flag-icons library)
const getCountryFlag = (countryCode) => {
    if (!countryCode || countryCode.length !== 2) return '';
    return `fi fi-${countryCode.toLowerCase()}`;
};

// Get country name from code
const getCountryName = (countryCode) => {
    const countryNames = {
        'US': 'United States', 'CA': 'Canada', 'GB': 'United Kingdom', 'AU': 'Australia',
        'NZ': 'New Zealand', 'DE': 'Germany', 'FR': 'France', 'IT': 'Italy',
        'ES': 'Spain', 'NL': 'Netherlands', 'SE': 'Sweden', 'NO': 'Norway',
        'DK': 'Denmark', 'CH': 'Switzerland', 'BE': 'Belgium', 'AT': 'Austria',
        'PL': 'Poland', 'CZ': 'Czech Republic', 'IE': 'Ireland', 'PT': 'Portugal',
        'GR': 'Greece', 'RU': 'Russia', 'JP': 'Japan', 'KR': 'South Korea',
        'CN': 'China', 'IN': 'India', 'BR': 'Brazil', 'MX': 'Mexico',
        'ZA': 'South Africa', 'SG': 'Singapore', 'HK': 'Hong Kong', 'MY': 'Malaysia', 'TH': 'Thailand'
    };
    return countryNames[countryCode] || countryCode;
};

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

const ModalMessage = ({ title, message, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <button 
        onClick={onClose} 
        className="w-full bg-primary hover:bg-primary/80 text-black font-semibold py-2 rounded-lg transition duration-150 shadow-md"
      >
        Close
      </button>
    </div>
  </div>
);

const CustomAppLogo = ({ size = "w-10 h-10" }) => (
  <div className="relative inline-block">
    <img 
      src="/logo.png" 
      alt="Crittertrack Logo" 
      className={`${size} shadow-md`} 
    />
    <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg transform rotate-12">
      BETA
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin text-primary-dark mr-2" size={24} />
    <span className="text-gray-600">Loading...</span>
  </div>
);

// Reusable animal image component with error handling
const AnimalImage = ({ src, alt = "Animal", className = "w-full h-full object-cover", iconSize = 24 }) => {
    const [imageError, setImageError] = useState(false);
    const [imageSrc, setImageSrc] = useState(src);

    useEffect(() => {
        setImageSrc(src);
        setImageError(false);
    }, [src]);

    const handleError = () => {
        console.warn('Image failed to load:', imageSrc);
        setImageError(true);
    };

    if (!imageSrc || imageError) {
        return <Cat size={iconSize} className="text-gray-400" />;
    }

    return (
        <img 
            src={imageSrc} 
            alt={alt} 
            className={className}
            onError={handleError}
            loading="lazy"
        />
    );
};

// Pedigree Chart Component
const PedigreeChart = ({ animalId, animalData, onClose, API_BASE_URL, authToken = null }) => {
    const [pedigreeData, setPedigreeData] = useState(null);
    const [ownerProfile, setOwnerProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const pedigreeRef = useRef(null);

    useEffect(() => {
        const fetchPedigreeData = async () => {
            setLoading(true);
            try {
                // Recursive function to fetch animal and ancestors
                const fetchAnimalWithAncestors = async (id, depth = 0) => {
                    if (!id || depth > 4) return null; // Limit to 5 generations (0-4)

                    let animalInfo = null;

                    // Try to fetch from owned animals first if authToken is available
                    if (authToken) {
                        try {
                            // Use /animals/any endpoint which returns owned, public, OR related animals
                            const response = await axios.get(`${API_BASE_URL}/animals/any/${id}`, {
                                headers: { Authorization: `Bearer ${authToken}` }
                            });
                            animalInfo = response.data;
                        } catch (error) {
                            // Not owned/public/related, will skip this animal
                            console.log(`Animal ${id} not accessible:`, error.message);
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
                            console.error(`Failed to fetch animal ${id}:`, error);
                            return null;
                        }
                    }

                    // If animal exists but is not public/accessible (has ID but no data), return hidden marker
                    if (!animalInfo && id) {
                        return { isHidden: true, id_public: id };
                    }
                    
                    if (!animalInfo) return null;

                    // Fetch breeder info for each animal
                    if (animalInfo.breederId_public) {
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

                    // Recursively fetch parents
                    const fatherId = animalInfo.fatherId_public || animalInfo.sireId_public;
                    const motherId = animalInfo.motherId_public || animalInfo.damId_public;

                    const father = fatherId ? await fetchAnimalWithAncestors(fatherId, depth + 1) : null;
                    const mother = motherId ? await fetchAnimalWithAncestors(motherId, depth + 1) : null;

                    return {
                        ...animalInfo,
                        father,
                        mother
                    };
                };

                const data = await fetchAnimalWithAncestors(animalId || animalData?.id_public);
                setPedigreeData(data);

                // Fetch owner profile for the main animal
                if (data?.ownerId_public || data?.breederId_public) {
                    try {
                        const ownerId = data.ownerId_public || data.breederId_public;
                        console.log('[PEDIGREE] Fetching owner profile for ID:', ownerId);
                        const ownerResponse = await axios.get(
                            `${API_BASE_URL}/public/profiles/search?query=${ownerId}&limit=1`
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
                        }
                    } catch (error) {
                        console.error('Failed to fetch owner profile:', error);
                    }
                }
            } catch (error) {
                console.error('Error fetching pedigree data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPedigreeData();
    }, [animalId, animalData, API_BASE_URL, authToken]);

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

    const downloadPDF = async () => {
        if (!pedigreeRef.current) return;

        try {
            // Hide all images before PDF generation
            const imageContainers = pedigreeRef.current.querySelectorAll('.hide-for-pdf');
            imageContainers.forEach(el => el.style.display = 'none');

            const canvas = await html2canvas(pedigreeRef.current, {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true,
                letterRendering: true,
                windowWidth: 1123,
                windowHeight: 794
            });

            // Restore images after PDF generation
            imageContainers.forEach(el => el.style.display = '');

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [1123, 794]
            });

            // Add image at exact dimensions without scaling
            pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794);
            pdf.save(`pedigree-${pedigreeData?.name || 'chart'}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            // Restore images even if there's an error
            const imageContainers = pedigreeRef.current?.querySelectorAll('.hide-for-pdf');
            imageContainers?.forEach(el => el.style.display = '');
        }
    };

    // Render card for main animal (larger with image)
    const renderMainAnimalCard = (animal) => {
        if (!animal) return null;
        
        const imgSrc = animal.imageUrl || animal.photoUrl || null;
        const colorCoat = [animal.color, animal.coat].filter(Boolean).join(' ') || 'N/A';
        
        // Determine gender-based styling
        const isMale = animal.gender === 'Male';
        const bgColor = isMale ? 'bg-[#d4f1f5]' : 'bg-[#f8e8ee]';
        const GenderIcon = isMale ? Mars : Venus;
        
        return (
            <div className={`border border-gray-700 rounded-lg p-2 ${bgColor} relative flex gap-3 items-center`} style={{height: '160px'}}>
                {/* Image */}
                <div className="hide-for-pdf w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-gray-900">
                    {imgSrc ? (
                        <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={48} />
                    ) : (
                        <Cat size={48} className="text-gray-400" />
                    )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-start gap-2 py-2">
                    {/* Name */}
                    <div className="text-sm text-gray-900 leading-tight" style={{lineHeight: '1.2'}}>
                        <span className="font-bold">Name: </span>
                        <span className="line-clamp-2">
                            {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`}
                        </span>
                    </div>
                    
                    {/* Variety */}
                    <div className="text-xs text-gray-900 leading-tight" style={{lineHeight: '1.2'}}>
                        <span className="font-semibold">Variety: </span>
                        {colorCoat}
                    </div>
                    
                    {/* Birth Date */}
                    <div className="text-xs text-gray-900 leading-tight" style={{lineHeight: '1.2'}}>
                        <span className="font-semibold">Birthdate: </span>
                        {animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : 'N/A'}
                    </div>
                    
                    {/* Breeder Info */}
                    <div className="text-xs text-gray-900 leading-tight" style={{lineHeight: '1.2'}}>
                        <span className="font-semibold">Breeder: </span>
                        {animal.breederName || 'N/A'}
                    </div>
                </div>
                
                {/* Gender Icon - Top Right */}
                <div className="absolute top-2 right-2">
                    <GenderIcon size={24} className="text-gray-900" strokeWidth={2.5} />
                </div>
                
                {/* CT ID - Bottom Right */}
                <div className="absolute bottom-1 right-2 text-xs font-mono text-gray-700">
                    {animal.id_public}
                </div>
            </div>
        );
    };

    // Render card for parents (medium with image)
    const renderParentCard = (animal, isSire) => {
        const bgColor = isSire ? 'bg-[#d4f1f5]' : 'bg-[#f8e8ee]';
        const GenderIcon = isSire ? Mars : Venus;
        
        // Direct parents always show - either full data, "Unknown", or "Hidden" (private)
        if (!animal) {
            return (
                <div className={`border border-gray-700 rounded p-2 ${bgColor} relative h-full flex items-center justify-center`}>
                    <div className="text-center">
                        <Cat size={32} className="hide-for-pdf text-gray-300 mx-auto mb-2" />
                        <div className="text-xs text-gray-400">Unknown</div>
                    </div>
                    <div className="absolute top-2 right-2">
                        <GenderIcon size={20} className="text-gray-900" strokeWidth={2.5} />
                    </div>
                </div>
            );
        }
        
        if (animal.isHidden) {
            return (
                <div className={`border border-gray-700 rounded p-2 ${bgColor} relative h-full flex items-center justify-center`}>
                    <div className="text-center">
                        <EyeOff size={32} className="hide-for-pdf text-gray-500 mx-auto mb-2" />
                        <div className="text-xs text-gray-600 font-semibold">Hidden</div>
                        <div className="text-xs text-gray-500 mt-1">Private Profile</div>
                    </div>
                    <div className="absolute top-2 right-2">
                        <GenderIcon size={20} className="text-gray-900" strokeWidth={2.5} />
                    </div>
                </div>
            );
        }
        
        const imgSrc = animal.imageUrl || animal.photoUrl || null;
        const colorCoat = [animal.color, animal.coat].filter(Boolean).join(' ') || 'N/A';
        
        return (
            <div className={`border border-gray-700 rounded p-1.5 ${bgColor} relative flex gap-2 h-full items-center`}>
                {/* Image - 1/3 width */}
                <div className="hide-for-pdf w-1/3 aspect-square bg-gray-100 rounded-lg border-2 border-gray-900 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {imgSrc ? (
                        <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={28} />
                    ) : (
                        <Cat size={28} className="text-gray-400" />
                    )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-start gap-1.5 py-1">
                    {/* Name */}
                    <div className="text-xs text-gray-900 leading-tight" style={{lineHeight: '1.2'}}>
                        <span className="font-semibold">Name: </span>
                        <span className="line-clamp-2">
                            {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`}
                        </span>
                    </div>
                    
                    {/* Variety */}
                    <div className="text-xs text-gray-900 leading-tight" style={{lineHeight: '1.2'}}>
                        <span className="font-semibold">Variety: </span>
                        {colorCoat}
                    </div>
                    
                    {/* Birth Date */}
                    <div className="text-xs text-gray-900 leading-tight" style={{lineHeight: '1.2'}}>
                        <span className="font-semibold">Birthdate: </span>
                        {animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : 'N/A'}
                    </div>
                    
                    {/* Breeder */}
                    <div className="text-xs text-gray-900 leading-tight" style={{lineHeight: '1.2'}}>
                        <span className="font-semibold">Breeder: </span>
                        {animal.breederName || 'N/A'}
                    </div>
                </div>
                
                {/* Gender Icon - Top Right */}
                <div className="absolute top-2 right-2">
                    <GenderIcon size={20} className="text-gray-900" strokeWidth={2.5} />
                </div>
                
                {/* CT ID - Bottom Right */}
                <div className="absolute bottom-1 right-2 text-xs font-mono text-gray-700">
                    {animal.id_public}
                </div>
            </div>
        );
    };

    // Render card for grandparents (with image)
    const renderGrandparentCard = (animal, isSire) => {
        const bgColor = isSire ? 'bg-[#d4f1f5]' : 'bg-[#f8e8ee]';
        const GenderIcon = isSire ? Mars : Venus;
        
        if (!animal) {
            return (
                <div className={`border border-gray-700 rounded p-1.5 ${bgColor} flex gap-1.5 h-full items-center relative`}>
                    {/* Image placeholder - 1/3 width */}
                    <div className="hide-for-pdf w-1/3 aspect-square bg-gray-100 rounded-lg border-2 border-gray-900 overflow-hidden flex items-center justify-center flex-shrink-0">
                        <Cat size={20} className="text-gray-400" />
                    </div>
                    {/* Text */}
                    <div className="flex-1 flex items-center justify-start">
                        <span className="text-xs text-gray-400">Unknown</span>
                    </div>
                    <div className="absolute top-1 right-1">
                        <GenderIcon size={14} className="text-gray-900" strokeWidth={2.5} />
                    </div>
                </div>
            );
        }
        
        if (animal.isHidden) {
            return (
                <div className={`border border-gray-700 rounded p-1.5 ${bgColor} flex gap-1.5 h-full items-center relative`}>
                    {/* Icon placeholder - 1/3 width */}
                    <div className="hide-for-pdf w-1/3 aspect-square bg-gray-100 rounded-lg border-2 border-gray-900 overflow-hidden flex items-center justify-center flex-shrink-0">
                        <EyeOff size={20} className="text-gray-500" />
                    </div>
                    {/* Text */}
                    <div className="flex-1 flex items-center justify-start">
                        <span className="text-xs text-gray-600 font-semibold">Hidden</span>
                    </div>
                    <div className="absolute top-1 right-1">
                        <GenderIcon size={14} className="text-gray-900" strokeWidth={2.5} />
                    </div>
                </div>
            );
        }
        
        const imgSrc = animal.imageUrl || animal.photoUrl || null;
        const colorCoat = [animal.color, animal.coat].filter(Boolean).join(' ') || 'N/A';
        
        return (
            <div className={`border border-gray-700 rounded p-1 ${bgColor} relative flex gap-1.5 h-full items-center`}>
                {/* Image - 1/3 width */}
                <div className="hide-for-pdf w-1/3 aspect-square bg-gray-100 rounded-lg border-2 border-gray-900 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {imgSrc ? (
                        <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={20} />
                    ) : (
                        <Cat size={20} className="text-gray-400" />
                    )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-start gap-1 py-0.5">
                    {/* Name */}
                    <div className="text-gray-900 leading-tight" style={{fontSize: '0.65rem', lineHeight: '1.2'}}>
                        <span className="font-semibold">Name: </span>
                        <span className="line-clamp-2">
                            {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`}
                        </span>
                    </div>
                    
                    {/* Variety */}
                    <div className="text-gray-900 leading-tight" style={{fontSize: '0.65rem', lineHeight: '1.2'}}>
                        <span className="font-semibold">Variety: </span>
                        {colorCoat}
                    </div>
                    
                    {/* Birth Date */}
                    <div className="text-gray-900 leading-tight" style={{fontSize: '0.65rem', lineHeight: '1.2'}}>
                        <span className="font-semibold">Birthdate: </span>
                        {animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : 'N/A'}
                    </div>
                    
                    {/* Breeder */}
                    <div className="text-gray-900 leading-tight" style={{fontSize: '0.65rem', lineHeight: '1.2'}}>
                        <span className="font-semibold">Breeder: </span>
                        {animal.breederName || 'N/A'}
                    </div>
                </div>
                
                {/* Gender Icon - Top Right */}
                <div className="absolute top-1 right-1">
                    <GenderIcon size={14} className="text-gray-900" strokeWidth={2.5} />
                </div>
                
                {/* CT ID - Bottom Right */}
                <div className="absolute bottom-1 right-1 text-xs font-mono text-gray-700">
                    {animal.id_public}
                </div>
            </div>
        );
    };

    // Render card for great-grandparents (text only, no image)
    const renderGreatGrandparentCard = (animal, isSire) => {
        const bgColor = isSire ? 'bg-[#d4f1f5]' : 'bg-[#f8e8ee]';
        const GenderIcon = isSire ? Mars : Venus;
        
        if (!animal) {
            return (
                <div className={`border border-gray-700 rounded p-1 ${bgColor} flex items-center justify-center h-full relative`}>
                    <span className="text-xs text-gray-400">Unknown</span>
                    <div className="absolute top-0.5 right-0.5">
                        <GenderIcon size={12} className="text-gray-900" strokeWidth={2.5} />
                    </div>
                </div>
            );
        }
        
        if (animal.isHidden) {
            return (
                <div className={`border border-gray-700 rounded p-1 ${bgColor} flex flex-col items-center justify-center h-full relative`}>
                    <EyeOff size={16} className="text-gray-500 mb-1" />
                    <span className="text-xs text-gray-600 font-semibold">Hidden</span>
                    <div className="absolute top-0.5 right-0.5">
                        <GenderIcon size={12} className="text-gray-900" strokeWidth={2.5} />
                    </div>
                </div>
            );
        }
        
        const colorCoat = [animal.color, animal.coat].filter(Boolean).join(' ') || 'N/A';
        
        return (
            <div className={`border border-gray-700 rounded p-0.5 ${bgColor} relative h-full flex flex-col justify-start gap-1 py-1`}>
                {/* Name */}
                <div className="text-gray-900 leading-tight" style={{fontSize: '0.6rem', lineHeight: '1.2'}}>
                    <span className="font-semibold">Name: </span>
                    <span className="line-clamp-2">
                        {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`}
                    </span>
                </div>
                
                {/* Variety */}
                <div className="text-gray-900 leading-tight" style={{fontSize: '0.6rem', lineHeight: '1.2'}}>
                    <span className="font-semibold">Variety: </span>
                    {colorCoat}
                </div>
                
                {/* Breeder */}
                <div className="text-gray-900 leading-tight" style={{fontSize: '0.6rem', lineHeight: '1.2'}}>
                    <span className="font-semibold">Breeder: </span>
                    {animal.breederName || 'N/A'}
                </div>
                
                {/* Gender Icon - Top Right */}
                <div className="absolute top-0.5 right-0.5">
                    <GenderIcon size={12} className="text-gray-900" strokeWidth={2.5} />
                </div>
                
                {/* CT ID - Bottom Right */}
                <div className="absolute bottom-0.5 right-0.5 text-xs font-mono text-gray-700">
                    {animal.id_public}
                </div>
            </div>
        );
    };

    // Render card for great-great-grandparents (smallest, no image)
    const renderGreatGreatGrandparentCard = (animal) => {
        if (!animal) {
            return (
                <div className="border border-gray-300 rounded px-1 py-0.5 bg-gray-50 flex items-center justify-center h-full">
                    <span className="text-xs text-gray-400">Unknown</span>
                </div>
            );
        }
        
        const colorCoat = [animal.color, animal.coat].filter(Boolean).join(' / ') || 'N/A';
        
        return (
            <div className="border border-gray-200 rounded px-1 py-0.5 bg-white h-full flex flex-col justify-center">
                {/* Name */}
                <div className="font-semibold text-xs text-gray-800 leading-tight line-clamp-2">
                    {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`}
                </div>
                
                {/* Color/Coat */}
                <div className="text-xs text-gray-600 truncate leading-tight">
                    {colorCoat}
                </div>
            </div>
        );
    };

    const renderPedigreeTree = (animal) => {
        if (!animal) return null;

        // Generation 0 (subject)
        const subject = animal;
        
        // Generation 1 (parents)
        const father = animal.father;
        const mother = animal.mother;

        // Generation 2 (grandparents)
        const paternalGrandfather = father?.father;
        const paternalGrandmother = father?.mother;
        const maternalGrandfather = mother?.father;
        const maternalGrandmother = mother?.mother;

        // Generation 3 (great-grandparents)
        const pgfFather = paternalGrandfather?.father;
        const pgfMother = paternalGrandfather?.mother;
        const pgmFather = paternalGrandmother?.father;
        const pgmMother = paternalGrandmother?.mother;
        const mgfFather = maternalGrandfather?.father;
        const mgfMother = maternalGrandfather?.mother;
        const mgmFather = maternalGrandmother?.father;
        const mgmMother = maternalGrandmother?.mother;

        // Calculate heights based on full height (794px - padding 48px - top section ~170px - footer ~50px - gaps = ~526px for content)
        const contentHeight = 526;
        const parentHeight = contentHeight / 2; // ~263px for each parent
        const grandparentHeight = contentHeight / 4; // ~131.5px for each grandparent
        const greatGrandparentHeight = contentHeight / 8; // ~65.75px for each great-grandparent

        return (
            <div className="flex gap-2 w-full" style={{height: `${contentHeight}px`}}>
                    {/* Column 1: Parents (2 rows, each takes 1/2 height) */}
                    <div className="w-1/3 flex flex-col gap-2">
                        <div style={{height: `${parentHeight - 4}px`}}>
                            {renderParentCard(father, true)}
                        </div>
                        <div style={{height: `${parentHeight - 4}px`}}>
                            {renderParentCard(mother, false)}
                        </div>
                    </div>

                    {/* Column 2: Grandparents (4 rows, each takes 1/4 height) */}
                    <div className="w-1/3 flex flex-col gap-2">
                        <div style={{height: `${grandparentHeight - 6}px`}}>
                            {renderGrandparentCard(paternalGrandfather, true)}
                        </div>
                        <div style={{height: `${grandparentHeight - 6}px`}}>
                            {renderGrandparentCard(paternalGrandmother, false)}
                        </div>
                        <div style={{height: `${grandparentHeight - 6}px`}}>
                            {renderGrandparentCard(maternalGrandfather, true)}
                        </div>
                        <div style={{height: `${grandparentHeight - 6}px`}}>
                            {renderGrandparentCard(maternalGrandmother, false)}
                        </div>
                    </div>

                    {/* Column 3: Great-Grandparents (8 rows, each takes 1/8 height) */}
                    <div className="w-1/3 flex flex-col gap-2">
                        <div style={{height: `${greatGrandparentHeight - 7}px`}}>
                            {renderGreatGrandparentCard(pgfFather, true)}
                        </div>
                        <div style={{height: `${greatGrandparentHeight - 7}px`}}>
                            {renderGreatGrandparentCard(pgfMother, false)}
                        </div>
                        <div style={{height: `${greatGrandparentHeight - 7}px`}}>
                            {renderGreatGrandparentCard(pgmFather, true)}
                        </div>
                        <div style={{height: `${greatGrandparentHeight - 7}px`}}>
                            {renderGreatGrandparentCard(pgmMother, false)}
                        </div>
                        <div style={{height: `${greatGrandparentHeight - 7}px`}}>
                            {renderGreatGrandparentCard(mgfFather, true)}
                        </div>
                        <div style={{height: `${greatGrandparentHeight - 7}px`}}>
                            {renderGreatGrandparentCard(mgfMother, false)}
                        </div>
                        <div style={{height: `${greatGrandparentHeight - 7}px`}}>
                            {renderGreatGrandparentCard(mgmFather, true)}
                        </div>
                        <div style={{height: `${greatGrandparentHeight - 7}px`}}>
                            {renderGreatGrandparentCard(mgmMother, false)}
                        </div>
                    </div>
                </div>
        );
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-6xl w-full">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    // Top right - 3 lines (Personal Name, Breeder Name, CTID)
    const getOwnerDisplayInfoTopRight = () => {
        if (!ownerProfile) return { lines: ['Unknown Owner'], userId: null };
        
        const userId = ownerProfile.id_public || pedigreeData?.ownerId_public || pedigreeData?.breederId_public;
        const lines = [];
        
        const showPersonalName = ownerProfile.showPersonalName ?? false;
        const showBreederName = ownerProfile.showBreederName ?? false;
        
        // Add personal name if privacy allows and available
        if (showPersonalName && ownerProfile.personalName) {
            lines.push(ownerProfile.personalName);
        }
        
        // Add breeder name if it's public and available
        if (showBreederName && ownerProfile.breederName) {
            lines.push(ownerProfile.breederName);
        }
        
        return { 
            lines: lines.length > 0 ? lines : [userId || 'Anonymous Breeder'], 
            userId 
        };
    };
    
    // Bottom left - 1 line (CTID - Personal Name - Breeder Name)
    const getOwnerDisplayInfoBottomLeft = () => {
        if (!ownerProfile) return 'Unknown Owner';
        
        const userId = ownerProfile.id_public || pedigreeData?.ownerId_public || pedigreeData?.breederId_public;
        const parts = [];
        
        const showPersonalName = ownerProfile.showPersonalName ?? false;
        const showBreederName = ownerProfile.showBreederName ?? false;
        
        // Add CTID first
        if (userId) {
            parts.push(userId);
        }
        
        // Add personal name if privacy allows and available
        if (showPersonalName && ownerProfile.personalName) {
            parts.push(ownerProfile.personalName);
        }
        
        // Add breeder name if it's public and available
        if (showBreederName && ownerProfile.breederName) {
            parts.push(ownerProfile.breederName);
        }
        
        return parts.length > 0 ? parts.join(' - ') : 'Anonymous Breeder';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen flex justify-center pt-8 pb-8">
                <div className="bg-white rounded-xl shadow-2xl h-fit" style={{width: 'fit-content', maxWidth: '95vw'}}>
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <FileText className="mr-2" size={24} />
                            Pedigree Chart
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={downloadPDF}
                                disabled={!imagesLoaded}
                                data-tutorial-target="download-pdf-btn"
                                className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg transition ${
                                    imagesLoaded 
                                        ? 'bg-primary hover:bg-primary/90 text-black cursor-pointer' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                title={!imagesLoaded ? 'Waiting for images to load...' : 'Download PDF'}
                            >
                                <Download size={18} />
                                {imagesLoaded ? 'Download PDF' : 'Loading...'}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">

                {/* Pedigree Chart - A4 Landscape: 11.69" x 8.27" (1123px x 794px at 96dpi) */}
                <div ref={pedigreeRef} className="bg-white p-6 rounded-lg border-2 border-gray-300 relative" style={{width: '1123px', height: '794px', maxWidth: '1123px', maxHeight: '794px'}}>
                    {/* Top Row: 3 columns - Main Animal | Species | Owner */}
                    <div className="flex gap-2 mb-2 items-start">
                        {/* Left: Main Animal */}
                        <div className="w-1/3">
                            {pedigreeData && renderMainAnimalCard(pedigreeData)}
                        </div>
                        
                        {/* Middle: Species */}
                        <div className="w-1/3 flex items-center justify-center">
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-gray-800">{pedigreeData?.species || 'Unknown Species'}</h3>
                                {pedigreeData?.species && getSpeciesLatinName(pedigreeData.species) && (
                                    <p className="text-sm italic text-gray-600">{getSpeciesLatinName(pedigreeData.species)}</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Right: Owner Profile */}
                        <div className="w-1/3 flex items-center justify-end gap-3">
                            <div className="text-right">
                                {(() => {
                                    const ownerInfo = getOwnerDisplayInfoTopRight();
                                    return (
                                        <>
                                            {ownerInfo.lines.map((line, idx) => (
                                                <div key={idx} className="text-base font-semibold text-gray-800 leading-tight">{line}</div>
                                            ))}
                                            {ownerInfo.userId && (
                                                <div className="text-xs text-gray-600 mt-1">{ownerInfo.userId}</div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                            <div className="hide-for-pdf w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                                {(ownerProfile?.profileImage || ownerProfile?.profileImageUrl) ? (
                                    <img src={ownerProfile.profileImage || ownerProfile.profileImageUrl} alt="Owner" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} className="text-gray-400" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pedigree Tree */}
                    <div className="overflow-hidden">
                        {renderPedigreeTree(pedigreeData)}
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-6 left-6 right-6 pt-3 border-t-2 border-gray-300 flex justify-between items-center text-sm text-gray-600">
                        <div>
                            {getOwnerDisplayInfoBottomLeft()}
                        </div>
                        <div>{new Date().toLocaleDateString()}</div>
                    </div>
                </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// (Removed unused `AnimalListItem` component to reduce redundancy)

const ProfileImagePlaceholder = ({ url, onFileChange, disabled }) => (
    <div className="flex flex-col items-center space-y-3">
        <div 
            className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden shadow-inner cursor-pointer" 
            onClick={() => !disabled && document.getElementById('profileImageInput').click()}
        >
            {url ? (
                <img src={url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                <User size={50} />
            )}
        </div>
        <input 
            id="profileImageInput" 
            type="file" 
            accept="image/*" 
            hidden 
            onChange={onFileChange} 
            disabled={disabled}
        />
        <button 
            type="button" 
            onClick={() => !disabled && document.getElementById('profileImageInput').click()}
            disabled={disabled}
            className="text-sm text-primary hover:text-primary-dark transition duration-150 disabled:opacity-50"
        >
            {url ? "Change Image" : "Upload Image"}
        </button>
    </div>
);


const ParentSearchModal = ({ 
    title, 
    currentId, 
    onSelect, 
    onClose, 
    authToken, 
    showModalMessage, 
    API_BASE_URL, 
    X, 
    Search, 
    Loader2, 
    LoadingSpinner,
    requiredGender, // Filter: e.g., 'Male' or 'Female'
    birthDate,      // Filter: Date of the animal being bred
    species         // Filter: Species of the animal being bred
}) => {
    const [searchTerm, setSearchTerm] = useState('');
        const [hasSearched, setHasSearched] = useState(false);
    const [localAnimals, setLocalAnimals] = useState([]);
    const [globalAnimals, setGlobalAnimals] = useState([]);
    const [loadingLocal, setLoadingLocal] = useState(false);
    const [loadingGlobal, setLoadingGlobal] = useState(false);
    const [scope, setScope] = useState('both'); // 'local' | 'global' | 'both'
    
    // Simple component to render a list item
    const SearchResultItem = ({ animal, isGlobal }) => {
        const imgSrc = animal.imageUrl || animal.photoUrl || null;
        
        return (
            <div 
                className="flex items-center space-x-3 p-3 border-b hover:bg-gray-50 cursor-pointer" 
                onClick={() => onSelect(animal)}
            >
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={24} />
                </div>
                
                {/* Info */}
                <div className="flex-grow">
                    <p className="font-semibold text-gray-800">
                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">{animal.id_public}</p>
                    <p className="text-sm text-gray-600">
                        {animal.species} • {animal.gender} • {animal.status || 'Unknown'}
                    </p>
                    {getSpeciesLatinName(animal.species) && (
                        <p className="text-xs italic text-gray-500">{getSpeciesLatinName(animal.species)}</p>
                    )}
                </div>
                
                {/* Badge */}
                {isGlobal && <span className="text-xs text-black bg-primary px-2 py-1 rounded-full flex-shrink-0">Global</span>}
            </div>
        );
    };

        const handleSearch = async () => {
            setHasSearched(true);
        const trimmedSearchTerm = searchTerm.trim();

        if (!trimmedSearchTerm || trimmedSearchTerm.length < 1) {
            setLocalAnimals([]);
            setGlobalAnimals([]);
            showModalMessage('Search Info', 'Please enter a name or ID to search.');
            return;
        }

        // Detect ID searches (CTC1234, CT1234, or 1234)
        const idMatch = trimmedSearchTerm.match(/^\s*(?:CTC?[- ]?)?(\d+)\s*$/i);
        const isIdSearch = !!idMatch;
        // Send full CTC format (CTC1234) instead of just numeric portion (1234)
        const idValue = isIdSearch ? `CTC${idMatch[1]}` : null;

        // --- CONSTRUCT FILTER QUERIES ---
        const genderQuery = requiredGender 
            ? (Array.isArray(requiredGender) 
                ? `&gender=${requiredGender.map(g => encodeURIComponent(g)).join('&gender=')}`
                : `&gender=${requiredGender}`)
            : '';
        const birthdateQuery = birthDate ? `&birthdateBefore=${birthDate}` : '';
        const speciesQuery = species ? `&species=${encodeURIComponent(species)}` : '';

        // Prepare promises depending on scope
        setLoadingLocal(scope === 'local' || scope === 'both');
        setLoadingGlobal(scope === 'global' || scope === 'both');

        // Local search
        if (scope === 'local' || scope === 'both') {
            try {
                const localUrl = isIdSearch
                    ? `${API_BASE_URL}/animals?id_public=${encodeURIComponent(idValue)}`
                    : `${API_BASE_URL}/animals?name=${encodeURIComponent(trimmedSearchTerm)}${genderQuery}${birthdateQuery}${speciesQuery}`;

                const localResponse = await axios.get(localUrl, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                // Filter out current animal and animals deceased before offspring birth date
                const filteredLocal = localResponse.data.filter(a => {
                    if (a.id_public === currentId) return false;
                    // If animal has deceased date and we have offspring birth date, check if alive at that time
                    if (birthDate && a.deceasedDate) {
                        const offspringBirth = new Date(birthDate);
                        const parentDeceased = new Date(a.deceasedDate);
                        if (parentDeceased < offspringBirth) return false; // Parent died before offspring born
                    }
                    return true;
                });
                setLocalAnimals(filteredLocal);
            } catch (error) {
                console.error('Local Search Error:', error);
                showModalMessage('Search Error', 'Failed to search your animals.');
                setLocalAnimals([]);
            } finally {
                setLoadingLocal(false);
            }
        } else {
            setLocalAnimals([]);
            setLoadingLocal(false);
        }

        // Global search
        if (scope === 'global' || scope === 'both') {
            try {
                const globalUrl = isIdSearch
                    ? `${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(idValue)}`
                    : `${API_BASE_URL}/public/global/animals?name=${encodeURIComponent(trimmedSearchTerm)}${genderQuery}${birthdateQuery}${speciesQuery}`;

                const globalResponse = await axios.get(globalUrl);
                // Filter out current animal and animals deceased before offspring birth date
                const filteredGlobal = globalResponse.data.filter(a => {
                    if (a.id_public === currentId) return false;
                    // If animal has deceased date and we have offspring birth date, check if alive at that time
                    if (birthDate && a.deceasedDate) {
                        const offspringBirth = new Date(birthDate);
                        const parentDeceased = new Date(a.deceasedDate);
                        if (parentDeceased < offspringBirth) return false; // Parent died before offspring born
                    }
                    return true;
                });
                setGlobalAnimals(filteredGlobal);
            } catch (error) {
                console.error('Global Search Error:', error);
                setGlobalAnimals([]);
            } finally {
                setLoadingGlobal(false);
            }
        } else {
            setGlobalAnimals([]);
            setLoadingGlobal(false);
        }
    };

        return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title} Selector</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>

                {/* Scope Toggle + Search Bar (Manual Search) */}
                <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">Search Scope:</span>
                        {['local','global','both'].map(s => (
                            <button key={s} onClick={() => setScope(s)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 ${scope === s ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                {s === 'both' ? 'Local + Global' : (s === 'local' ? 'Local' : 'Global')}
                            </button>
                        ))}
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder={`Search by Name or ID (e.g., Minnie or CT2468)...`}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setHasSearched(false); }}
                            className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={(scope === 'local' || scope === 'both') && loadingLocal || (scope === 'global' || scope === 'both') && loadingGlobal || searchTerm.trim().length < 1}
                            className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                        >
                            { (loadingLocal || loadingGlobal) ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} /> }
                        </button>
                    </div>
                </div>
                
                {/* Results Area */}
                <div className="flex-grow overflow-y-auto space-y-4">
                    {/* Local Results */}
                    {loadingLocal ? <LoadingSpinner message="Searching your animals..." /> : localAnimals.length > 0 && (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Your Animals ({localAnimals.length})</h4>
                            {localAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={false} />)}
                        </div>
                    )}
                    
                    {/* Global Results */}
                    {loadingGlobal ? <LoadingSpinner message="Searching global animals..." /> : globalAnimals.length > 0 && (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Global Display Animals ({globalAnimals.length})</h4>
                            {globalAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={true} />)}
                        </div>
                    )}
                    
                    {/* Updated no results check */}
                    {hasSearched && searchTerm.trim().length >= 1 && localAnimals.length === 0 && globalAnimals.length === 0 && !loadingLocal && !loadingGlobal && (
                        <p className="text-center text-gray-500 py-4">No animals found matching your search term or filters.</p>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t">
                    <button 
                        onClick={() => onSelect(null)} 
                        className="w-full text-sm text-gray-500 hover:text-red-500 transition"
                    >
                        Clear {title} ID
                    </button>
                </div>
            </div>
        </div>
    );
};


const LocalAnimalSearchModal = ({ title, currentId, onSelect, onClose, authToken, showModalMessage, API_BASE_URL, X, Search, Loader2, LoadingSpinner, genderFilter }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [localAnimals, setLocalAnimals] = useState([]);
    const [loadingLocal, setLoadingLocal] = useState(false);
    
    // Simple component to render a list item (No isGlobal tag needed)
    const SearchResultItem = ({ animal }) => (
        <div 
            className="flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer" 
            onClick={() => onSelect(animal)}
        >
            <div>
                <p className="font-semibold text-gray-800">{animal.prefix} {animal.name}{animal.suffix && ` ${animal.suffix}`} ({animal.id_public})</p>
                <p className="text-sm text-gray-600">
                    {animal.species} | {animal.gender} | {animal.status}
                </p>
                {getSpeciesLatinName(animal.species) && (
                    <p className="text-xs italic text-gray-500">{getSpeciesLatinName(animal.species)}</p>
                )}
            </div>
        </div>
    );

    const handleSearch = async () => {
        setHasSearched(true);
        const trimmedSearchTerm = searchTerm.trim();
        
        if (!trimmedSearchTerm || trimmedSearchTerm.length < 3) {
            setLocalAnimals([]);
            showModalMessage('Search Info', 'Please enter at least 3 characters to search.');
            return;
        }

        // --- Search Local Animals Only ---
        setLoadingLocal(true);
        try {
            const localResponse = await axios.get(`${API_BASE_URL}/animals?name=${trimmedSearchTerm}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            let filteredLocal = localResponse.data.filter(a => a.id_public !== currentId);
            
            // Apply gender filter if specified
            if (genderFilter) {
                if (Array.isArray(genderFilter)) {
                    filteredLocal = filteredLocal.filter(a => genderFilter.includes(a.gender));
                } else {
                    filteredLocal = filteredLocal.filter(a => a.gender === genderFilter);
                }
            }
            
            setLocalAnimals(filteredLocal);
        } catch (error) {
            console.error('Local Search Error:', error);
            showModalMessage('Search Error', 'Failed to search your animals.');
            setLocalAnimals([]);
        } finally {
            setLoadingLocal(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title} Selector</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>

                {/* Search Bar (Manual Search) */}
                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        placeholder="Search your animals by Name (min 3 chars)..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setHasSearched(false); }}
                        className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loadingLocal || searchTerm.trim().length < 3}
                        className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                    >
                        {loadingLocal ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    </button>
                </div>
                
                {/* Results Area */}
                <div className="flex-grow overflow-y-auto space-y-4">
                    {/* Local Results */}
                    {loadingLocal ? <LoadingSpinner message="Searching your animals..." /> : localAnimals.length > 0 ? (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Your Animals ({localAnimals.length})</h4>
                            {localAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} />)}
                        </div>
                    ) : (
                        hasSearched && searchTerm.trim().length >= 3 && !loadingLocal && (
                            <p className="text-center text-gray-500 py-4">No local animals found matching your search term.</p>
                        )
                    )}
                </div>

                <div className="mt-4 pt-4 border-t">
                    <button 
                        onClick={() => onSelect(null)} 
                        className="w-full text-sm text-gray-500 hover:text-red-500 transition"
                    >
                        Clear {title} ID
                    </button>
                </div>
            </div>
        </div>
    );
};



const UserSearchModal = ({ onClose, showModalMessage, onSelectUser, API_BASE_URL, modalTarget, userProfile }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('users'); // 'users' or 'animals'
    const [userResults, setUserResults] = useState([]);
    const [animalResults, setAnimalResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm || searchTerm.trim().length < 2) {
            setUserResults([]);
            setAnimalResults([]);
            setHasSearched(false);
            return;
        }

        setHasSearched(true);
        setLoading(true);
        
        try {
            if (searchType === 'users') {
                // Search for users
                const url = `${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(searchTerm.trim())}&limit=50`;
                console.log('Fetching users from:', url);
                const response = await axios.get(url);
                console.log('User search response:', response.data);
                if (response.data && response.data.length > 0) {
                    console.log('First user object keys:', Object.keys(response.data[0]));
                    console.log('First user object:', response.data[0]);
                }
                setUserResults(response.data || []);
                setAnimalResults([]);
            } else {
                // Search for animals globally
                const idMatch = searchTerm.trim().match(/^\s*(?:CT[- ]?)?(\d+)\s*$/i);
                const url = idMatch
                    ? `${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(idMatch[1])}`
                    : `${API_BASE_URL}/public/global/animals?name=${encodeURIComponent(searchTerm.trim())}`;
                console.log('Fetching animals from:', url);
                const response = await axios.get(url);
                console.log('Animal search response:', response.data);
                if (response.data && response.data.length > 0) {
                    console.log('First animal object keys:', Object.keys(response.data[0]));
                    console.log('First animal object:', response.data[0]);
                }
                setAnimalResults(response.data || []);
                setUserResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            showModalMessage('Search Error', 'Failed to search. Please try again.');
            setUserResults([]);
            setAnimalResults([]);
        } finally {
            setLoading(false);
        }
    };

    const UserResultCard = ({ user }) => {
        const memberSince = user.createdAt 
            ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(user.createdAt))
            : (user.updatedAt ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(user.updatedAt)) : null);
        
        // Determine display name(s) - respect privacy settings
        const showPersonalName = user.showPersonalName ?? false;
        const showBreederName = user.showBreederName ?? false;
        
        let displayName;
        if (showBreederName && showPersonalName && user.personalName && user.breederName) {
            displayName = `${user.personalName} (${user.breederName})`;
        } else if (showBreederName && user.breederName) {
            displayName = user.breederName;
        } else if (showPersonalName && user.personalName) {
            displayName = user.personalName;
        } else {
            displayName = 'Anonymous Breeder';
        }
        
        return (
            <div 
                className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition duration-150 cursor-pointer"
                onClick={() => {
                    if (onSelectUser) onSelectUser(user);
                }}
            >
                <div className="flex items-start space-x-3">
                    {user.profileImage ? (
                        <img src={user.profileImage} alt={displayName} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <User size={24} className="text-gray-400" />
                        </div>
                    )}
                    <div className="flex-grow">
                        <p className="text-lg font-semibold text-gray-800">
                            {displayName}
                        </p>
                        <p className="text-sm text-gray-600">
                            Public ID: <span className="font-mono text-accent">{user.id_public}</span>
                        </p>
                        {memberSince && (
                            <p className="text-xs text-gray-500 mt-1">
                                Member since {memberSince}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const AnimalResultCard = ({ animal }) => (
        <div 
            className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition duration-150 cursor-pointer"
            onClick={() => {
                // Will open view-only animal detail modal
                if (window.handleViewPublicAnimal) {
                    window.handleViewPublicAnimal(animal);
                }
            }}
        >
            <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                    <AnimalImage src={animal.imageUrl || animal.photoUrl} alt={animal.name} className="w-full h-full object-cover" iconSize={24} />
                </div>
                <div className="flex-grow">
                    <p className="text-lg font-semibold text-gray-800">
                        {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`}
                    </p>
                    <p className="text-sm text-gray-600">
                        {animal.species} • {animal.gender} • <span className="font-mono">{animal.id_public}</span>
                    </p>
                    {animal.color && <p className="text-xs text-gray-500 mt-1">{animal.color}</p>}
                </div>
            </div>
        </div>
    );

    const results = searchType === 'users' ? userResults : animalResults;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Global Search 🔎</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>

                {/* Search Type Toggle - only show for pedigree (sire/dam), not for breeder */}
                {modalTarget !== 'breeder' && (
                    <div className="flex space-x-2 mb-4">
                        <button
                            onClick={() => { setSearchType('users'); setUserResults([]); setAnimalResults([]); setHasSearched(false); }}
                            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                                searchType === 'users' 
                                    ? 'bg-primary text-black' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <User size={16} className="inline mr-2" />
                            Users
                        </button>
                        <button
                            onClick={() => { setSearchType('animals'); setUserResults([]); setAnimalResults([]); setHasSearched(false); }}
                            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                                searchType === 'animals' 
                                    ? 'bg-primary text-black' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <Cat size={16} className="inline mr-2" />
                            Animals
                        </button>
                    </div>
                )}

                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        placeholder={searchType === 'users' 
                            ? "Search by Name or ID (e.g., CT2468)..." 
                            : "Search by Name or ID (e.g., CT123)..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading || searchTerm.trim().length < 2}
                        className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto space-y-4 divide-y divide-gray-100">
                    {modalTarget === 'breeder' && userProfile && (
                        <div className="border rounded-lg bg-white shadow-sm mb-4">
                            <h4 className="font-bold text-gray-700 p-3 bg-primary/20 border-b">
                                Your Profile
                            </h4>
                            <UserResultCard user={userProfile} />
                        </div>
                    )}
                    {loading ? <LoadingSpinner /> : results.length > 0 ? (
                        <div className="border rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 p-3 bg-gray-50 border-b">
                                {searchType === 'users' ? `Users (${results.length})` : `Animals (${results.length})`}
                            </h4>
                            {searchType === 'users' 
                                ? results.map(user => <UserResultCard key={user.id_public} user={user} />)
                                : results.map(animal => <AnimalResultCard key={animal.id_public} animal={animal} />)
                            }
                        </div>
                    ) : hasSearched && !loading ? (
                        <p className="text-center text-gray-500 py-4">
                            No {searchType === 'users' ? 'users' : 'animals'} found matching your search.
                        </p>
                    ) : (
                        <p className="text-center text-gray-500 py-4">
                            Enter a name or ID to search for {searchType === 'users' ? 'users' : 'animals'}.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Public Profile View Component - Shows a breeder's public animals
const PublicProfileView = ({ profile, onBack, onViewAnimal, API_BASE_URL, onStartMessage, authToken, setModCurrentContext }) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [genderFilters, setGenderFilters] = useState({ Male: true, Female: true, Intersex: true, Unknown: true });
    const [statusFilter, setStatusFilter] = useState('');
    const [freshProfile, setFreshProfile] = useState(profile);
    
    // Set moderator context when viewing this profile
    useEffect(() => {
        if (setModCurrentContext && profile) {
            setModCurrentContext({
                type: 'profile',
                id: profile.id_public,
                name: profile.personalName || profile.breederName,
                userId: profile.userId_backend
            });
        }
        return () => {
            if (setModCurrentContext) {
                setModCurrentContext(null);
            }
        };
    }, [profile, setModCurrentContext]);
    
    // Force-refetch latest public profile to ensure flags like allowMessages are current
    useEffect(() => {
        const fetchProfile = async () => {
            if (!profile?.id_public) return;
            try {
                const resp = await axios.get(`${API_BASE_URL}/public/profile/${profile.id_public}`);
                setFreshProfile(resp.data || profile);
            } catch (err) {
                console.warn('Failed to refresh public profile, using provided profile', err);
                setFreshProfile(profile);
            }
        };
        fetchProfile();
    }, [profile?.id_public, API_BASE_URL]);
    
    const handleShare = () => {
        const url = `${window.location.origin}/user/${(freshProfile?.id_public || profile.id_public)}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    useEffect(() => {
        const fetchPublicAnimals = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/public/animals/${profile.id_public}`);
                setAnimals(response.data || []);
            } catch (error) {
                console.error('Error fetching public animals:', error);
                setAnimals([]);
            } finally {
                setLoading(false);
            }
        };

        if (profile) {
            fetchPublicAnimals();
        }
    }, [profile, API_BASE_URL]);

    const memberSince = (freshProfile?.createdAt || profile.createdAt)
        ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(freshProfile?.createdAt || profile.createdAt))
        : ((freshProfile?.updatedAt || profile.updatedAt) ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(freshProfile?.updatedAt || profile.updatedAt)) : 'Unknown');

    // Determine display name(s) - respect privacy settings
    const showPersonalName = (freshProfile?.showPersonalName ?? profile.showPersonalName ?? false);
    const showBreederName = (freshProfile?.showBreederName ?? profile.showBreederName ?? false);
    
    const showBothNames = showPersonalName && showBreederName && profile.personalName && profile.breederName;
    const displayName = showBothNames 
        ? `${(freshProfile?.personalName || profile.personalName)} (${(freshProfile?.breederName || profile.breederName)})`
        : (showBreederName && (freshProfile?.breederName || profile.breederName) 
            ? (freshProfile?.breederName || profile.breederName)
            : (showPersonalName && (freshProfile?.personalName || profile.personalName) 
                ? (freshProfile?.personalName || profile.personalName)
                : 'Anonymous Breeder'));

    // Apply filters
    const filteredAnimals = animals.filter(animal => {
        if (speciesFilter && animal.species !== speciesFilter) return false;
        // Show nothing if both genders are unchecked
        if (!genderFilters.Male && !genderFilters.Female) return false;
        // Filter by selected genders
        if (!genderFilters[animal.gender]) return false;
        if (statusFilter && animal.status !== statusFilter) return false;
        return true;
    });

    const groupedAnimals = filteredAnimals.reduce((groups, animal) => {
        const species = animal.species || 'Unspecified';
        if (!groups[species]) groups[species] = [];
        groups[species].push(animal);
        return groups;
    }, {});

    const sortedSpecies = Object.keys(groupedAnimals).sort((a, b) => {
        const order = ['Mouse', 'Rat', 'Hamster'];
        const aIndex = order.indexOf(a);
        const bIndex = order.indexOf(b);
        
        // If both are in the base order, sort by their position
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        // If only a is in base order, it comes first
        if (aIndex !== -1) return -1;
        // If only b is in base order, it comes first
        if (bIndex !== -1) return 1;
        // Otherwise, alphabetical sort
        return a.localeCompare(b);
    });

    return (
        <div className="w-full max-w-6xl bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
                <button 
                    onClick={onBack} 
                    className="flex items-center text-gray-600 hover:text-gray-800 transition"
                >
                    <ArrowLeft size={18} className="mr-1" /> Back
                </button>
                <div className="flex gap-2 flex-wrap">
                    {onStartMessage && freshProfile?.allowMessages === true && (
                        <button
                            onClick={onStartMessage}
                            data-tutorial-target="profile-message-btn"
                            className="px-3 py-1.5 bg-accent hover:bg-accent/80 text-white font-semibold rounded-lg transition flex items-center gap-2"
                        >
                            <MessageSquare size={16} />
                            Message
                        </button>
                    )}
                    <button
                        onClick={handleShare}
                        className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-2"
                    >
                        <Link size={16} />
                        {copySuccess ? 'Link Copied!' : 'Share Profile'}
                    </button>
                    <ReportButton
                        contentType="profile"
                        contentId={profile.id_public}
                        contentOwnerId={profile.userId_backend}
                        authToken={authToken}
                        API_BASE_URL={API_BASE_URL}
                        tooltipText="Report this profile"
                    />
                </div>
            </div>

            {/* Profile Header */}
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
                {profile.profileImage ? (
                    <img src={profile.profileImage} alt={displayName} className="w-24 h-24 rounded-lg object-cover shadow-md" />
                ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center shadow-md">
                        <User size={48} className="text-gray-400" />
                    </div>
                )}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{displayName}</h2>
                    <p className="text-gray-600">Public ID: <span className="font-mono text-accent">{freshProfile?.id_public || profile.id_public}</span></p>
                    <p className="text-sm text-gray-500 mt-1">Member since {memberSince}</p>
                    
                    {/* Country - Show if available */}
                    {(freshProfile?.country || profile.country) && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                            <span className={`${getCountryFlag(freshProfile?.country || profile.country)} inline-block h-5 w-7`}></span>
                            <span>{getCountryName(freshProfile?.country || profile.country)}</span>
                        </p>
                    )}
                    
                    {/* Bio - Show if available and public */}
                    {(freshProfile?.showBio ?? profile.showBio ?? true) && (freshProfile?.bio || profile.bio) && (
                        <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            {freshProfile?.bio || profile.bio}
                        </p>
                    )}
                    
                    {/* Email - Show if public */}
                    {(freshProfile?.showEmailPublic ?? profile.showEmailPublic) && (freshProfile?.email || profile.email) && (
                        <p className="text-sm text-gray-700 mt-2 flex items-center gap-2 break-all">
                            <Mail size={16} className="text-accent flex-shrink-0" />
                            <a href={`mailto:${freshProfile?.email || profile.email}`} className="hover:text-accent transition underline break-all">
                                {freshProfile?.email || profile.email}
                            </a>
                        </p>
                    )}
                    
                    {/* Website - Show if public */}
                    {(freshProfile?.showWebsiteURL ?? profile.showWebsiteURL) && (freshProfile?.websiteURL || profile.websiteURL) && (
                        <p className="text-sm text-gray-700 mt-2 flex items-center gap-2">
                            <Globe size={16} className="text-accent" />
                            <a href={freshProfile?.websiteURL || profile.websiteURL} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition underline">
                                {freshProfile?.websiteURL || profile.websiteURL}
                            </a>
                        </p>
                    )}
                </div>
            </div>

            {/* Public Animals */}
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Public Animals ({filteredAnimals.length})</h3>
            
            {/* Filters */}
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    {/* Species dropdown, Gender icons, and Status dropdown - all in one row */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between">
                        <div className="flex gap-3 items-center flex-wrap">
                            {/* Species dropdown */}
                            <div className="flex gap-2 items-center" data-tutorial-target="species-filter">
                                <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Species:</span>
                                <select 
                                    value={speciesFilter}
                                    onChange={(e) => setSpeciesFilter(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition min-w-[150px]"
                                >
                                    <option value="">All Species</option>
                                    {sortedSpecies.map(species => (
                                        <option key={species} value={species}>{getSpeciesDisplayName(species)}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Gender filter with icons */}
                            <div className="flex gap-2 items-center" data-tutorial-target="gender-filter">
                                <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Gender:</span>
                                <button 
                                    onClick={() => setGenderFilters(prev => ({ ...prev, Male: !prev.Male }))}
                                    className={`p-2 rounded-lg transition duration-150 shadow-sm ${
                                        genderFilters.Male ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    title="Male"
                                >
                                    <Mars size={18} className="text-black" />
                                </button>
                                <button 
                                    onClick={() => setGenderFilters(prev => ({ ...prev, Female: !prev.Female }))}
                                    className={`p-2 rounded-lg transition duration-150 shadow-sm ${
                                        genderFilters.Female ? 'bg-pink-400' : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    title="Female"
                                >
                                    <Venus size={18} className="text-black" />
                                </button>
                                <button 
                                    onClick={() => setGenderFilters(prev => ({ ...prev, Intersex: !prev.Intersex }))}
                                    className={`p-2 rounded-lg transition duration-150 shadow-sm ${
                                        genderFilters.Intersex ? 'bg-purple-400' : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    title="Intersex"
                                >
                                    <VenusAndMars size={18} className="text-black" />
                                </button>
                                <button 
                                    onClick={() => setGenderFilters(prev => ({ ...prev, Unknown: !prev.Unknown }))}
                                    className={`p-2 rounded-lg transition duration-150 shadow-sm ${
                                        genderFilters.Unknown ? 'bg-teal-400' : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    title="Unknown"
                                >
                                    <Circle size={18} className="text-black" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Status dropdown on right */}
                        <div className="flex gap-2 items-center" data-tutorial-target="status-filter">
                            <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Status:</span>
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)} 
                                className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition min-w-[150px]"
                            >
                                <option value="">All</option>
                                {STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            
            {loading ? (
                <LoadingSpinner />
            ) : filteredAnimals.length === 0 && animals.length > 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Cat size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No animals match the selected filters.</p>
                </div>
            ) : animals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Cat size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>This breeder has no public animals.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {sortedSpecies.map(species => (
                        <div key={species} className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                                <Cat size={20} className="mr-2" /> {getSpeciesDisplayName(species)}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {groupedAnimals[species].map(animal => {
                                    const birth = animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : '';
                                    const imgSrc = animal.imageUrl || animal.photoUrl || null;
                                    
                                    return (
                                        <div key={animal.id_public} className="w-full flex justify-center">
                                            <div
                                                onClick={() => onViewAnimal(animal)}
                                                className="relative bg-white rounded-xl shadow-sm w-44 h-56 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 border-gray-300 pt-3"
                                            >
                                                {/* Birthdate top-left */}
                                                {birth && (
                                                    <div className="absolute top-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-0.5 rounded">
                                                        {birth}
                                                    </div>
                                                )}

                                                {/* Gender badge top-right */}
                                                {animal.gender && (
                                                    <div className="absolute top-2 right-2" title={animal.gender}>
                                                        {animal.gender === 'Male' ? <Mars size={16} strokeWidth={2.5} className="text-primary" /> : animal.gender === 'Female' ? <Venus size={16} strokeWidth={2.5} className="text-accent" /> : animal.gender === 'Intersex' ? <VenusAndMars size={16} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={16} strokeWidth={2.5} className="text-gray-500" />}
                                                    </div>
                                                )}

                                                {/* Centered profile image */}
                                                <div className="flex items-center justify-center w-full px-2 mt-1 h-28">
                                                    {imgSrc ? (
                                                        <img src={imgSrc} alt={animal.name} className="max-w-24 max-h-24 w-auto h-auto object-contain rounded-md" />
                                                    ) : (
                                                        <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                            <Cat size={36} />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Icon row */}
                                                <div className="w-full flex justify-center items-center space-x-2 py-1">
                                                    {/* No icons for public profile - they don't apply */}
                                                </div>
                                                
                                                {/* Prefix / Name under image */}
                                                <div className="w-full text-center px-2 pb-1">
                                                    <div className="text-sm font-semibold text-gray-800 line-clamp-2">{animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}</div>
                                                </div>

                                                {/* ID bottom-right */}
                                                <div className="w-full px-2 pb-2 flex justify-end">
                                                    <div className="text-xs text-gray-500">{animal.id_public}</div>
                                                </div>
                                                
                                                {/* Status bar at bottom */}
                                                <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                                    <div className="text-xs font-medium text-gray-700">{animal.status || 'Unknown'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// View-Only Animal Detail Modal
const ViewOnlyAnimalDetail = ({ animal, onClose, API_BASE_URL, onViewProfile, authToken, setModCurrentContext, setShowImageModal, setEnlargedImageUrl }) => {
    const [breederInfo, setBreederInfo] = useState(null);
    const [showPedigree, setShowPedigree] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [detailViewTab, setDetailViewTab] = useState(1);
    
    // Set moderator context when viewing this animal
    useEffect(() => {
        if (setModCurrentContext && animal) {
            setModCurrentContext({
                type: 'animal',
                id: animal.id_public,
                name: animal.name,
                ownerId: animal.ownerId
            });
        }
        return () => {
            if (setModCurrentContext) {
                setModCurrentContext(null);
            }
        };
    }, [animal, setModCurrentContext]);
    
    // Helper function to parse health records from JSON strings
    const parseHealthRecords = (data) => {
        if (!data) return [];
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Failed to parse health records:', e);
                return [];
            }
        }
        return Array.isArray(data) ? data : [];
    };
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

    const imgSrc = animal.imageUrl || animal.photoUrl || null;
    const birthDate = animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : 'Unknown';

    // Only show remarks and genetic code if section privacy allows AND data exists
    const showRemarks = animal.sectionPrivacy?.records !== false && animal.remarks;
    const showGeneticCode = animal.sectionPrivacy?.identification !== false && animal.geneticCode;
    
    console.log('Animal data:', { 
        hasRemarks: !!animal.remarks, 
        hasGeneticCode: !!animal.geneticCode,
        showRemarks,
        showGeneticCode
    });

    return (
        <div className="fixed inset-0 bg-accent/10 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-primary rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-white rounded-t-lg p-4 border-b border-gray-300">
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={onClose} 
                            className="flex items-center text-gray-600 hover:text-gray-800 transition"
                        >
                            <ArrowLeft size={18} className="mr-1" /> Back
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleShare}
                                className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-2"
                            >
                                <Link size={16} />
                                {copySuccess ? 'Link Copied!' : 'Share'}
                            </button>
                            <ReportButton
                                contentType="animal"
                                contentId={animal.id_public}
                                contentOwnerId={animal.ownerId}
                                authToken={authToken}
                                tooltipText="Report this animal"
                            />
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={28} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border-b border-gray-300">
                    <div className="flex overflow-x-auto">
                        {[
                            { id: 1, label: 'Overview', icon: '📋' },
                            { id: 3, label: 'Physical', icon: '🎨' },
                            { id: 5, label: 'Lineage', icon: '🌳' },
                            { id: 6, label: 'Breeding', icon: '🫘' },
                            { id: 7, label: 'Health', icon: '🏥' },
                            { id: 8, label: 'Husbandry', icon: '🏠' },
                            { id: 9, label: 'Behavior', icon: '🧠' },
                            { id: 10, label: 'Records', icon: '📝' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setDetailViewTab(tab.id)}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
                                    detailViewTab === tab.id
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                <span className="mr-1">{tab.icon}</span>{tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white border border-t-0 border-gray-300 rounded-b-lg p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Tab 1: Overview */}
                    {detailViewTab === 1 && (
                        <div className="space-y-4">
                            {/* Main Animal Card - 2 Column Layout */}
                            <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                                <div className="flex flex-col md:flex-row relative">
                                    {/* Left Column - Image (1/3 on desktop, full width on mobile) */}
                                    <div className="w-full md:w-1/3 p-4 sm:p-6 flex flex-col items-center justify-center relative min-h-60 md:min-h-80">
                                        {/* Birthdate badge */}
                                        {animal.birthDate && (
                                            <div className="absolute top-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-0.5 rounded">
                                                {new Date(animal.birthDate).toLocaleDateString()}
                                            </div>
                                        )}

                                        {/* Gender badge */}
                                        <div className="absolute top-2 right-2">
                                            {animal.gender === 'Male' ? <Mars size={20} strokeWidth={2.5} className="text-blue-600" /> : animal.gender === 'Female' ? <Venus size={20} strokeWidth={2.5} className="text-pink-600" /> : animal.gender === 'Intersex' ? <VenusAndMars size={20} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={20} strokeWidth={2.5} className="text-gray-500" />}
                                        </div>

                                        {/* Profile Image */}
                                        <div className="flex items-center justify-center h-40 w-full">
                                            {(animal.imageUrl || animal.photoUrl) ? (
                                                <img 
                                                    src={animal.imageUrl || animal.photoUrl} 
                                                    alt={animal.name} 
                                                    className="max-w-32 max-h-32 w-auto h-auto object-contain rounded-md cursor-pointer hover:opacity-80 transition"
                                                    onClick={() => {
                                                        if (setEnlargedImageUrl && setShowImageModal) {
                                                            setEnlargedImageUrl(animal.imageUrl || animal.photoUrl);
                                                            setShowImageModal(true);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-32 h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                    <Cat size={48} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Status text */}
                                        <div className="text-sm font-medium text-gray-700 mt-2">
                                            {animal.status || 'Unknown'}
                                        </div>
                                    </div>

                                    {/* Right Column - Info (2/3 on desktop, full width on mobile) */}
                                    <div className="w-full md:w-2/3 p-4 sm:p-6 flex flex-col border-t md:border-t-0 md:border-l border-gray-300 space-y-3">
                                        {/* Species/Breed/Strain/CTC - At Top */}
                                        <p className="text-sm text-gray-600">
                                            {animal.species}
                                            {animal.breed && ` • ${animal.breed}`}
                                            {animal.strain && ` • ${animal.strain}`}
                                            {animal.id_public && ` • ${animal.id_public}`}
                                        </p>

                                        {/* Full Name */}
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            {animal.prefix ? `${animal.prefix} ` : ''}
                                            {animal.name}
                                            {animal.suffix ? ` ${animal.suffix}` : ''}
                                        </h2>

                                        {/* For Sale Badge */}
                                        {animal.isForSale && (animal.salePriceCurrency || animal.salePriceAmount) && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                                <span className="text-lg">🏷️</span>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">For Sale</p>
                                                    <p className="text-sm text-gray-600">
                                                        {animal.salePriceCurrency === 'Negotiable' ? 'Negotiable' : `${animal.salePriceCurrency === 'USD' ? '$' : animal.salePriceCurrency === 'EUR' ? '€' : animal.salePriceCurrency === 'GBP' ? '£' : animal.salePriceCurrency === 'CAD' ? 'C$' : animal.salePriceCurrency === 'AUD' ? 'A$' : animal.salePriceCurrency === 'JPY' ? '¥' : animal.salePriceCurrency}${animal.salePriceAmount ? ` ${animal.salePriceAmount}` : ''}`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* For Stud Badge */}
                                        {animal.availableForBreeding && (animal.studFeeCurrency || animal.studFeeAmount) && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                                                <span className="text-lg">🫘</span>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">Available for Stud</p>
                                                    <p className="text-sm text-gray-600">
                                                        {animal.studFeeCurrency === 'Negotiable' ? 'Negotiable' : `${animal.studFeeCurrency === 'USD' ? '$' : animal.studFeeCurrency === 'EUR' ? '€' : animal.studFeeCurrency === 'GBP' ? '£' : animal.studFeeCurrency === 'CAD' ? 'C$' : animal.studFeeCurrency === 'AUD' ? 'A$' : animal.studFeeCurrency === 'JPY' ? '¥' : animal.studFeeCurrency}${animal.studFeeAmount ? ` ${animal.studFeeAmount}` : ''}`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Appearance */}
                                        {(animal.color || animal.coat || animal.coatPattern || animal.earset) && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Appearance:</span> {[
                                                    animal.color,
                                                    animal.coatPattern,
                                                    animal.coat,
                                                    animal.earset
                                                ].filter(Boolean).join(', ')}
                                            </p>
                                        )}

                                        {/* Date of Birth and Age/Deceased */}
                                        {animal.birthDate && (
                                            <div className="text-sm text-gray-700 space-y-1">
                                                <p>
                                                    <span className="font-semibold">Date of Birth:</span> {new Date(animal.birthDate).toLocaleDateString()} (~{(() => {
                                                        const birth = new Date(animal.birthDate);
                                                        const endDate = animal.deceasedDate ? new Date(animal.deceasedDate) : new Date();
                                                        let years = endDate.getFullYear() - birth.getFullYear();
                                                        let months = endDate.getMonth() - birth.getMonth();
                                                        let days = endDate.getDate() - birth.getDate();
                                                        
                                                        if (days < 0) {
                                                            months--;
                                                            const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
                                                            days += prevMonth.getDate();
                                                        }
                                                        if (months < 0) {
                                                            years--;
                                                            months += 12;
                                                        }
                                                        
                                                        if (years > 0) {
                                                            return `${years}y ${months}m ${days}d`;
                                                        } else if (months > 0) {
                                                            return `${months}m ${days}d`;
                                                        } else {
                                                            return `${days}d`;
                                                        }
                                                    })()})
                                                </p>
                                                {animal.deceasedDate && (
                                                    <p className="text-red-600 font-semibold">
                                                        Deceased: {new Date(animal.deceasedDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Breeder Section */}
                            {animal.breederId_public && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Breeder</h3>
                                    <p className="text-gray-700">
                                        {breederInfo ? (
                                            <button
                                                onClick={() => onViewProfile && onViewProfile(breederInfo)}
                                                className="text-primary hover:underline font-medium"
                                            >
                                                {(() => {
                                                    const showPersonal = breederInfo.showPersonalName ?? false;
                                                    const showBreeder = breederInfo.showBreederName ?? false;
                                                    if (showPersonal && showBreeder && breederInfo.personalName && breederInfo.breederName) {
                                                        return `${breederInfo.personalName} (${breederInfo.breederName})`;
                                                    } else if (showBreeder && breederInfo.breederName) {
                                                        return breederInfo.breederName;
                                                    } else if (showPersonal && breederInfo.personalName) {
                                                        return breederInfo.personalName;
                                                    } else {
                                                        return 'Unknown Breeder';
                                                    }
                                                })()}
                                            </button>
                                        ) : (
                                            <span className="font-mono text-accent">{animal.breederId_public}</span>
                                        )}
                                    </p>
                                </div>
                            )}

                            {/* Identification Numbers Section */}
                            {(animal.breederyId || animal.microchipNumber || animal.pedigreeRegistrationId) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Identification Numbers</h3>
                                    <div className="space-y-2">
                                        {animal.breederyId && <p className="text-sm"><span className="font-medium">Identification:</span> {animal.breederyId}</p>}
                                        {animal.microchipNumber && <p className="text-sm"><span className="font-medium">Microchip:</span> {animal.microchipNumber}</p>}
                                        {animal.pedigreeRegistrationId && <p className="text-sm"><span className="font-medium">Pedigree Reg ID:</span> {animal.pedigreeRegistrationId}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Genetic Code Display Section */}
                            {showGeneticCode && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Genetic Code</h3>
                                    <p className="text-gray-700 font-mono text-sm break-all">{animal.geneticCode}</p>
                                </div>
                            )}

                            {/* Medical Information Section */}
                            {(animal.allergies || animal.medications || animal.medicalConditions) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Medical Information</h3>
                                    <div className="space-y-3">
                                        {animal.allergies && (() => {
                                            const parsed = parseHealthRecords(animal.allergies);
                                            return parsed && parsed.length > 0 ? (
                                                <div>
                                                    <strong className="text-sm">Allergies:</strong>
                                                    <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                        {parsed.map((allergy, idx) => (
                                                            <li key={idx} className="text-gray-700">
                                                                {allergy.allergen || allergy.name}
                                                                {allergy.notes && <span className="text-gray-600"> - {allergy.notes}</span>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null;
                                        })()}
                                        {animal.medications && (() => {
                                            const parsed = parseHealthRecords(animal.medications);
                                            return parsed && parsed.length > 0 ? (
                                                <div>
                                                    <strong className="text-sm">Medications:</strong>
                                                    <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                        {parsed.map((med, idx) => (
                                                            <li key={idx} className="text-gray-700">
                                                                {med.medication || med.name}
                                                                {med.notes && <span className="text-gray-600"> - {med.notes}</span>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null;
                                        })()}
                                        {animal.medicalConditions && (() => {
                                            const parsed = parseHealthRecords(animal.medicalConditions);
                                            return parsed && parsed.length > 0 ? (
                                                <div>
                                                    <strong className="text-sm">Medical Conditions:</strong>
                                                    <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                        {parsed.map((condition, idx) => (
                                                            <li key={idx} className="text-gray-700">
                                                                {condition.condition || condition.name}
                                                                {condition.notes && <span className="text-gray-600"> - {condition.notes}</span>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Parents Section */}
                            {(animal.fatherId_public || animal.sireId_public || animal.motherId_public || animal.damId_public) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Parents</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <ViewOnlyParentCard 
                                            parentId={animal.fatherId_public || animal.sireId_public} 
                                            parentType="Sire"
                                            API_BASE_URL={API_BASE_URL}
                                            onViewAnimal={(parent) => {
                                                if (window.handleViewPublicAnimal) {
                                                    window.handleViewPublicAnimal(parent);
                                                }
                                            }}
                                        />
                                        <ViewOnlyParentCard 
                                            parentId={animal.motherId_public || animal.damId_public} 
                                            parentType="Dam"
                                            API_BASE_URL={API_BASE_URL}
                                            onViewAnimal={(parent) => {
                                                if (window.handleViewPublicAnimal) {
                                                    window.handleViewPublicAnimal(parent);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Physical */}
                    {detailViewTab === 3 && (
                        <div className="space-y-4">
                            {/* Appearance Section */}
                            {(animal.color || animal.coat || animal.coatPattern || animal.earset) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Appearance</h3>
                                    <div className="space-y-2">
                                        {animal.color && <p className="text-sm"><span className="font-medium">Color:</span> {animal.color}</p>}
                                        {animal.coatPattern && <p className="text-sm"><span className="font-medium">Coat Pattern:</span> {animal.coatPattern}</p>}
                                        {animal.coat && <p className="text-sm"><span className="font-medium">Coat Type:</span> {animal.coat}</p>}
                                        {animal.earset && <p className="text-sm"><span className="font-medium">Earset:</span> {animal.earset}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Genetic Code Section */}
                            {showGeneticCode && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Genetic Code</h3>
                                    <p className="text-gray-700 font-mono text-sm break-all">{animal.geneticCode}</p>
                                </div>
                            )}

                            {/* Life Stage Section */}
                            {animal.lifeStage && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Life Stage</h3>
                                    <p className="text-gray-700">{animal.lifeStage}</p>
                                </div>
                            )}

                            {/* Current Measurements Section */}
                            {(() => {
                                // Compute current measurements from growth records if available, otherwise use stored fields
                                let currentWeight = null;
                                let currentLength = null;
                                
                                if (animal.growthRecords && Array.isArray(animal.growthRecords) && animal.growthRecords.length > 0) {
                                    const sorted = [...animal.growthRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
                                    currentWeight = sorted[0].weight;
                                    const withLength = sorted.find(r => r.length);
                                    currentLength = withLength ? withLength.length : null;
                                } else {
                                    currentWeight = animal.weight;
                                    currentLength = animal.length;
                                }
                                
                                return (currentWeight || currentLength || animal.heightAtShoulder) && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Current Measurements</h3>
                                        <div className="space-y-2">
                                            {currentWeight && <p className="text-sm"><span className="font-medium">Weight:</span> {currentWeight}</p>}
                                            {currentLength && <p className="text-sm"><span className="font-medium">Length:</span> {currentLength}</p>}
                                            {animal.heightAtShoulder && <p className="text-sm"><span className="font-medium">