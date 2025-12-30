import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, ChevronDown, ChevronRight, Trash2, Edit, Save, PlusCircle, Plus, ArrowLeft, Loader2, RefreshCw, User, Users, ClipboardList, BookOpen, Settings, Mail, Globe, Bean, Milk, Search, X, Mars, Venus, Eye, EyeOff, Home, Heart, HeartOff, HeartHandshake, Bell, XCircle, CheckCircle, Download, FileText, Link, AlertCircle, Check, DollarSign, Archive, ArrowLeftRight, RotateCcw, Info, Hourglass, MessageSquare, Ban, Flag, Scissors, VenusAndMars, Circle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'flag-icons/css/flag-icons.min.css';
import MouseGeneticsCalculator from './components/MouseGeneticsCalculator';
import GeneticCodeBuilder from './components/GeneticCodeBuilder';
import BudgetingTab from './components/BudgetingTab';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import InstallPWA from './components/InstallPWA';
import { TutorialProvider, useTutorial } from './contexts/TutorialContext';
import { InitialTutorialModal, TutorialOverlay, TutorialHighlight } from './components/TutorialOverlay';
import { TUTORIAL_LESSONS } from './data/tutorialLessons';
import InfoTab from './components/InfoTab';
import WelcomeBanner from './components/WelcomeBanner';

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


const LocalAnimalSearchModal = ({ title, currentId, onSelect, onClose, authToken, showModalMessage, API_BASE_URL, X, Search, Loader2, LoadingSpinner }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [localAnimals, setLocalAnimals] = useState([]);
    const [loadingLocal, setLoadingLocal] = useState(false);
    
    // Simple component to render a list item (No isGlobal tag needed)
    const SearchResultItem = ({ animal }) => (
        <div 
            className="flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer" 
            onClick={() => onSelect(animal.id_public)}
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
            const filteredLocal = localResponse.data.filter(a => a.id_public !== currentId);
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
                    <h3 className="text-xl font-bold text-gray-800">{title} Selector (Local Animals Only)</h3>
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

    const handleSearch = async () => {
        if (!searchTerm || searchTerm.trim().length < 2) {
            setUserResults([]);
            setAnimalResults([]);
            return;
        }

        setLoading(true);
        
        try {
            if (searchType === 'users') {
                // Search for users
                const url = `${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(searchTerm.trim())}&limit=50`;
                console.log('Fetching users from:', url);
                const response = await axios.get(url);
                console.log('User search response:', response.data);
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
                            onClick={() => { setSearchType('users'); setUserResults([]); setAnimalResults([]); }}
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
                            onClick={() => { setSearchType('animals'); setUserResults([]); setAnimalResults([]); }}
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
                    ) : searchTerm && !loading ? (
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
const PublicProfileView = ({ profile, onBack, onViewAnimal, API_BASE_URL, onStartMessage }) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [genderFilters, setGenderFilters] = useState({ Male: true, Female: true, Intersex: true, Unknown: true });
    const [statusFilter, setStatusFilter] = useState('');
    const [freshProfile, setFreshProfile] = useState(profile);
    
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
const ViewOnlyAnimalDetail = ({ animal, onClose, API_BASE_URL, onViewProfile }) => {
    const [breederInfo, setBreederInfo] = useState(null);
    const [showPedigree, setShowPedigree] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [detailViewTab, setDetailViewTab] = useState(1);
    
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
                                <div className="flex relative">
                                    {/* Left Column - Image (1/3) */}
                                    <div className="w-1/3 p-4 sm:p-6 flex flex-col items-center justify-center relative min-h-80">
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
                                                <img src={animal.imageUrl || animal.photoUrl} alt={animal.name} className="max-w-32 max-h-32 w-auto h-auto object-contain rounded-md" />
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

                                    {/* Right Column - Info (2/3) */}
                                    <div className="w-2/3 p-4 sm:p-6 flex flex-col border-l border-gray-300 space-y-3">
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
                                                        let age = endDate.getFullYear() - birth.getFullYear();
                                                        const monthDiff = endDate.getMonth() - birth.getMonth();
                                                        if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birth.getDate())) age--;
                                                        const months = (endDate.getMonth() - birth.getMonth() + 12) % 12;
                                                        let days = endDate.getDate() - birth.getDate();
                                                        if (days < 0) {
                                                            days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
                                                        }
                                                        if (age > 0) {
                                                            return `${age}y ${months}m ${days}d`;
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
                                            {animal.heightAtShoulder && <p className="text-sm"><span className="font-medium">Height at Shoulder:</span> {animal.heightAtShoulder}</p>}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Growth Records Section */}
                            {(() => {
                                let growthRecords = animal.growthRecords;
                                if (typeof growthRecords === 'string') {
                                    try {
                                        growthRecords = JSON.parse(growthRecords);
                                    } catch (e) {
                                        growthRecords = [];
                                    }
                                }
                                return animal.sectionPrivacy?.measurements !== false && growthRecords && Array.isArray(growthRecords) && growthRecords.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Growth History</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="border-b border-gray-300">
                                                    <tr>
                                                        <th className="text-left py-2 px-2">Date</th>
                                                        <th className="text-left py-2 px-2">Weight</th>
                                                        <th className="text-left py-2 px-2">Length</th>
                                                        <th className="text-left py-2 px-2">BCS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {growthRecords.map((record, idx) => (
                                                        <tr key={idx} className="border-b border-gray-200">
                                                            <td className="py-2 px-2">{record.date ? new Date(record.date).toLocaleDateString() : '-'}</td>
                                                            <td className="py-2 px-2">{record.weight ? `${record.weight} ${animal.measurementUnits?.weight || 'g'}` : '-'}</td>
                                                            <td className="py-2 px-2">{record.length ? `${record.length} ${animal.measurementUnits?.length || 'cm'}` : '-'}</td>
                                                            <td className="py-2 px-2">{record.bcs || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tab 5: Lineage */}
                    {detailViewTab === 5 && (
                        <div className="space-y-4">
                            {/* Origin Section */}
                            {animal.origin && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Origin</h3>
                                    <p className="text-gray-700">{animal.origin}</p>
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
                            {/* Offspring Section */}
                            <OffspringSection
                                animalId={animal.id_public}
                                API_BASE_URL={API_BASE_URL}
                                onViewAnimal={(offspring) => {
                                    if (window.handleViewPublicAnimal) {
                                        window.handleViewPublicAnimal(offspring);
                                    }
                                }}
                            />
                        </div>
                    )}

                    {/* Tab 6: Breeding */}
                    {detailViewTab === 6 && (
                        <div className="space-y-4">
                            {animal.sectionPrivacy?.reproductive !== false && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Reproductive Status</h3>
                                    <div className="space-y-2">
                                        <p className="text-sm"><span className="font-medium">Neutered:</span> {animal.isNeutered ? 'Yes' : 'No'}</p>
                                        {animal.isInMating && <p className="text-sm"><span className="font-medium">In Mating:</span> Yes</p>}
                                        {animal.isPregnant && <p className="text-sm"><span className="font-medium">Pregnant:</span> Yes</p>}
                                        {animal.isNursing && <p className="text-sm"><span className="font-medium">Nursing:</span> Yes</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 7: Health */}
                    {detailViewTab === 7 && (
                        <div className="space-y-4">
                            {/* Preventive Care */}
                            {animal.sectionPrivacy?.health !== false && (animal.vaccinations || animal.dewormingRecords || animal.parasiteControl || animal.allergies || animal.medications) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Preventive Care</h3>
                                    <div className="space-y-3">
                                        {animal.vaccinations && (() => {
                                            const parsed = parseHealthRecords(animal.vaccinations);
                                            return parsed && parsed.length > 0 ? (
                                                <div>
                                                    <strong className="text-sm">Vaccinations:</strong>
                                                    <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                        {parsed.map((vacc, idx) => (
                                                            <li key={idx} className="text-gray-700">
                                                                {vacc.name} {vacc.date && `(${new Date(vacc.date).toLocaleDateString()})`}
                                                                {vacc.notes && <span className="text-gray-600"> - {vacc.notes}</span>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null;
                                        })()}
                                        {animal.dewormingRecords && (() => {
                                            const parsed = parseHealthRecords(animal.dewormingRecords);
                                            return parsed && parsed.length > 0 ? (
                                                <div>
                                                    <strong className="text-sm">Deworming Records:</strong>
                                                    <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                        {parsed.map((record, idx) => (
                                                            <li key={idx} className="text-gray-700">
                                                                {record.medication} {record.date && `(${new Date(record.date).toLocaleDateString()})`}
                                                                {record.notes && <span className="text-gray-600"> - {record.notes}</span>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null;
                                        })()}
                                        {animal.parasiteControl && (() => {
                                            const parsed = parseHealthRecords(animal.parasiteControl);
                                            return parsed && parsed.length > 0 ? (
                                                <div>
                                                    <strong className="text-sm">Parasite Control:</strong>
                                                    <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                        {parsed.map((record, idx) => (
                                                            <li key={idx} className="text-gray-700">
                                                                {record.treatment} {record.date && `(${new Date(record.date).toLocaleDateString()})`}
                                                                {record.notes && <span className="text-gray-600"> - {record.notes}</span>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>
                            )}
                            {/* Medical History */}
                            {animal.sectionPrivacy?.health !== false && (animal.medicalConditions || animal.medicalProcedures || animal.labResults || animal.vetVisits || animal.allergies || animal.medications || animal.primaryVet) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Medical History</h3>
                                    <div className="space-y-3">
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
                                        {animal.medicalProcedures && (() => {
                                            const parsed = parseHealthRecords(animal.medicalProcedures);
                                            return parsed && parsed.length > 0 ? (
                                                <div>
                                                    <strong className="text-sm">Medical Procedures:</strong>
                                                    <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                        {parsed.map((proc, idx) => (
                                                            <li key={idx} className="text-gray-700">
                                                                {proc.procedure} {proc.date && `(${new Date(proc.date).toLocaleDateString()})`}
                                                                {proc.notes && <span className="text-gray-600"> - {proc.notes}</span>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null;
                                        })()}
                                        {animal.labResults && (() => {
                                            const parsed = parseHealthRecords(animal.labResults);
                                            return parsed && parsed.length > 0 ? (
                                                <div>
                                                    <strong className="text-sm">Lab Results:</strong>
                                                    <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                        {parsed.map((result, idx) => (
                                                            <li key={idx} className="text-gray-700">
                                                                {result.testName} {result.date && `(${new Date(result.date).toLocaleDateString()})`}
                                                                {result.result && <span className="text-gray-600"> - {result.result}</span>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null;
                                        })()}
                                        {animal.vetVisits && (() => {
                                            const parsed = parseHealthRecords(animal.vetVisits);
                                            return parsed && parsed.length > 0 ? (
                                                <div>
                                                    <strong className="text-sm">Veterinary Visits:</strong>
                                                    <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                        {parsed.map((visit, idx) => (
                                                            <li key={idx} className="text-gray-700">
                                                                {visit.date && `${new Date(visit.date).toLocaleDateString()}: `}{visit.reason}
                                                                {visit.notes && <span className="text-gray-600"> - {visit.notes}</span>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null;
                                        })()}
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
                                        {animal.primaryVet && (
                                            <div>
                                                <strong className="text-sm">Primary Veterinarian:</strong>
                                                <p className="text-sm text-gray-700 mt-1">{animal.primaryVet}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 8: Husbandry */}
                    {detailViewTab === 8 && (
                        <div className="space-y-4">
                            {/* Nutrition Section */}
                            {animal.sectionPrivacy?.husbandry !== false && (animal.dietType || animal.feedingSchedule || animal.supplements) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Nutrition</h3>
                                    <div className="space-y-2">
                                        {animal.dietType && <p className="text-sm"><span className="font-medium">Diet Type:</span> {animal.dietType}</p>}
                                        {animal.feedingSchedule && <p className="text-sm"><span className="font-medium">Feeding Schedule:</span> {animal.feedingSchedule}</p>}
                                        {animal.supplements && <p className="text-sm"><span className="font-medium">Supplements:</span> {animal.supplements}</p>}
                                    </div>
                                </div>
                            )}
                            {/* Husbandry Section */}
                            {animal.sectionPrivacy?.husbandry !== false && (animal.housingType || animal.bedding || animal.enrichment) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Husbandry</h3>
                                    <div className="space-y-2">
                                        {animal.housingType && <p className="text-sm"><span className="font-medium">Housing Type:</span> {animal.housingType}</p>}
                                        {animal.bedding && <p className="text-sm"><span className="font-medium">Bedding:</span> {animal.bedding}</p>}
                                        {animal.enrichment && <p className="text-sm"><span className="font-medium">Enrichment:</span> {animal.enrichment}</p>}
                                    </div>
                                </div>
                            )}
                            {/* Environment Section */}
                            {animal.sectionPrivacy?.environment !== false && (animal.temperatureRange || animal.humidity || animal.lighting || animal.noise) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Environment</h3>
                                    <div className="space-y-2">
                                        {animal.temperatureRange && <p className="text-sm"><span className="font-medium">Temperature Range:</span> {animal.temperatureRange}</p>}
                                        {animal.humidity && <p className="text-sm"><span className="font-medium">Humidity:</span> {animal.humidity}</p>}
                                        {animal.lighting && <p className="text-sm"><span className="font-medium">Lighting:</span> {animal.lighting}</p>}
                                        {animal.noise && <p className="text-sm"><span className="font-medium">Noise Level:</span> {animal.noise}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 9: Behavior */}
                    {detailViewTab === 9 && (
                        <div className="space-y-4">
                            {/* Behavior & Welfare Section */}
                            {animal.sectionPrivacy?.behavior !== false && (animal.temperament || animal.handlingTolerance || animal.socialStructure) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Behavior & Welfare</h3>
                                    <div className="space-y-2">
                                        {animal.temperament && <p className="text-sm"><span className="font-medium">Temperament:</span> {animal.temperament}</p>}
                                        {animal.handlingTolerance && <p className="text-sm"><span className="font-medium">Handling Tolerance:</span> {animal.handlingTolerance}</p>}
                                        {animal.socialStructure && <p className="text-sm"><span className="font-medium">Social Structure:</span> {animal.socialStructure}</p>}
                                    </div>
                                </div>
                            )}
                            {/* Activity Cycle Section */}
                            {animal.sectionPrivacy?.activity !== false && animal.activityCycle && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Activity Cycle</h3>
                                    <p className="text-sm text-gray-700">{animal.activityCycle}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 10: Records */}
                    {detailViewTab === 10 && (
                        <div className="space-y-4">
                            {/* Current Owner Section */}
                            {(animal.currentOwnerId || animal.currentOwnerName) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Current Owner</h3>
                                    <p className="text-gray-700">{animal.currentOwnerName || animal.currentOwnerId}</p>
                                </div>
                            )}
                            {/* Remarks & Notes Section */}
                            {showRemarks && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Remarks & Notes</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{animal.remarks}</p>
                                </div>
                            )}
                            {/* End of Life Section */}
                            {animal.deceasedDate && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">End of Life</h3>
                                    <div className="space-y-2">
                                        <p className="text-sm"><span className="font-medium">Deceased Date:</span> {new Date(animal.deceasedDate).toLocaleDateString()}</p>
                                        {animal.causeOfDeath && <p className="text-sm"><span className="font-medium">Cause of Death:</span> {animal.causeOfDeath}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pedigree Chart Modal */}
                {showPedigree && (
                    <PedigreeChart
                        animalData={animal}
                        onClose={() => setShowPedigree(false)}
                        API_BASE_URL={API_BASE_URL}
                    />
                )}
            </div>
        </div>
    );
};

// View-Only Parent Card Component
const ViewOnlyParentCard = ({ parentId, parentType, API_BASE_URL, onViewAnimal }) => {
    const [parentData, setParentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);

    React.useEffect(() => {
        if (!parentId) {
            setParentData(null);
            setNotFound(false);
            return;
        }

        const fetchParent = async () => {
            setLoading(true);
            setNotFound(false);
            try {
                // Try fetching from global public animals database
                const publicResponse = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${parentId}`);
                if (publicResponse.data && publicResponse.data.length > 0) {
                    setParentData(publicResponse.data[0]);
                } else {
                    setNotFound(true);
                    setParentData(null);
                }
            } catch (error) {
                console.error(`Error fetching ${parentType}:`, error);
                setNotFound(true);
                setParentData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchParent();
    }, [parentId, parentType, API_BASE_URL]);

    if (!parentId || notFound) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">No {parentType.toLowerCase()} recorded</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="border-2 border-gray-300 rounded-lg p-4 flex justify-center items-center">
                <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (!parentData) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">Loading {parentType.toLowerCase()} data...</p>
            </div>
        );
    }

    const imgSrc = parentData.imageUrl || parentData.photoUrl || null;

    return (
        <div 
            className="border-2 border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onViewAnimal && onViewAnimal(parentData)}
        >
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
                <p className="text-xs font-semibold text-gray-600">{parentType}</p>
            </div>
            <div className="p-4">
                <div className="flex items-start space-x-3">
                    {imgSrc ? (
                        <img src={imgSrc} alt={parentData.name} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Cat size={32} className="text-gray-400" />
                        </div>
                    )}
                    <div className="flex-grow">
                        <p className="font-semibold text-gray-800">
                            {parentData.prefix && `${parentData.prefix} `}{parentData.name}
                        </p>
                        <p className="text-xs text-gray-600 font-mono">{parentData.id_public}</p>
                        {parentData.status && (
                            <p className="text-xs text-gray-500 mt-1">{parentData.status}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Parent Mini Card Component for Offspring Section
const ParentMiniCard = ({ parent, label, onViewAnimal }) => {
    if (!parent) {
        return (
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-200" style={{ width: 'auto', minWidth: '180px' }}>
                <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                    <Cat size={20} className="text-gray-400" />
                </div>
                <div className="flex-grow">
                    <p className="text-xs text-gray-500 italic">{label} unknown</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-200 cursor-pointer hover:bg-gray-100 transition" 
            style={{ width: 'auto', minWidth: '180px' }}
            onClick={() => onViewAnimal && onViewAnimal(parent)}
        >
            <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                {parent.imageUrl || parent.photoUrl ? (
                    <img 
                        src={parent.imageUrl || parent.photoUrl} 
                        alt={parent.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Cat size={20} className="text-gray-400" />
                )}
            </div>
            <div className="flex items-center space-x-1 flex-grow">
                {parent.gender && (
                    <div>
                        {parent.gender === 'Male' 
                            ? <Mars size={12} strokeWidth={2.5} className="text-primary" /> 
                            : <Venus size={12} strokeWidth={2.5} className="text-accent" />
                        }
                    </div>
                )}
                <div className="flex-grow min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                        {parent.prefix && `${parent.prefix} `}
                        {parent.name}
                    </p>
                    <p className="text-xs text-gray-600 font-mono">
                        {parent.id_public}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Offspring Section Component - shows offspring grouped by litter
const OffspringSection = ({ animalId, API_BASE_URL, authToken = null, onViewAnimal }) => {
    const [offspring, setOffspring] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentAnimal, setCurrentAnimal] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!animalId) return;
            
            setLoading(true);
            try {
                const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
                
                // Fetch offspring - only available for authenticated users
                if (authToken) {
                    const offspringEndpoint = `${API_BASE_URL}/animals/${animalId}/offspring`;
                    const offspringResponse = await axios.get(offspringEndpoint, { headers });
                    setOffspring(offspringResponse.data || []);
                    
                    // Fetch current animal to know which parent we are
                    try {
                        const animalResponse = await axios.get(
                            `${API_BASE_URL}/animals/any/${animalId}`,
                            { headers }
                        );
                        setCurrentAnimal(animalResponse.data);
                    } catch (err) {
                        console.error('Error fetching current animal:', err);
                    }
                } else {
                    // For unauthenticated users, offspring data is not available via API
                    // The backend doesn't expose a public offspring endpoint for privacy reasons
                    setOffspring([]);
                    
                    // Still fetch the current animal for display
                    try {
                        const publicResponse = await axios.get(
                            `${API_BASE_URL}/public/global/animals?id_public=${animalId}`
                        );
                        setCurrentAnimal(publicResponse.data?.[0] || null);
                    } catch (err) {
                        console.error('Error fetching current animal:', err);
                    }
                }
            } catch (error) {
                console.error('Error fetching offspring:', error);
                setOffspring([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [animalId, API_BASE_URL, authToken]);

    return (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Offspring</h3>
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
            ) : (!offspring || offspring.length === 0) ? (
                <p className="text-gray-500 text-sm italic">Offspring are not public or no offspring recorded.</p>
            ) : (
                <div className="space-y-6">
                    {offspring.map((litter, index) => (
                    <div key={litter.litterId || index} className="border-2 border-gray-200 rounded-lg p-4">
                        {/* Parent Cards at Top - Centered on desktop, stacked on mobile */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 mb-3 justify-center">
                            {/* Father Card */}
                            {(litter.sireId_public || litter.otherParentType === 'sire') && (
                                <ParentMiniCard 
                                    parent={litter.otherParentType === 'sire' ? litter.otherParent : currentAnimal}
                                    label="Father"
                                    onViewAnimal={onViewAnimal}
                                />
                            )}
                            
                            {/* Mother Card */}
                            {(litter.damId_public || litter.otherParentType === 'dam') && (
                                <ParentMiniCard 
                                    parent={litter.otherParentType === 'dam' ? litter.otherParent : currentAnimal}
                                    label="Mother"
                                    onViewAnimal={onViewAnimal}
                                />
                            )}
                        </div>

                        {/* Litter Info - Centered */}
                        <div className="flex justify-center mb-4">
                            <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200 inline-block">
                                {litter.litterName && (
                                    <p className="text-sm font-semibold text-gray-800 text-center mb-1">
                                        {litter.litterName}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <span>Born: {new Date(litter.birthDate).toLocaleDateString()}</span>
                                    {litter.numberBorn && (
                                        <>
                                            <span>•</span>
                                            <span>{litter.numberBorn} born</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Offspring Animals */}
                        {litter.offspring && litter.offspring.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {litter.offspring.map((animal) => (
                                    <div
                                        key={animal.id_public}
                                        onClick={() => onViewAnimal && onViewAnimal(animal)}
                                        className="relative bg-white rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border border-gray-300 pt-2"
                                    >
                                        {/* Birthdate top-left */}
                                        {animal.birthDate && (
                                            <div className="absolute top-1.5 left-1.5 text-xs text-gray-600 bg-white/80 px-1.5 py-0.5 rounded">
                                                {new Date(animal.birthDate).toLocaleDateString()}
                                            </div>
                                        )}

                                        {/* Gender badge top-right */}
                                        {animal.gender && (
                                            <div className="absolute top-1.5 right-1.5">
                                                {animal.gender === 'Male' 
                                                    ? <Mars size={14} strokeWidth={2.5} className="text-primary" /> 
                                                    : <Venus size={14} strokeWidth={2.5} className="text-accent" />
                                                }
                                            </div>
                                        )}

                                        {/* Profile image */}
                                        <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                            {animal.imageUrl || animal.photoUrl ? (
                                                <img 
                                                    src={animal.imageUrl || animal.photoUrl} 
                                                    alt={animal.name} 
                                                    className="w-20 h-20 object-cover rounded-md" 
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                    <Cat size={32} />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Icon row - only show if authenticated (local view) */}
                                        {authToken && (
                                            <div className="w-full flex justify-center items-center space-x-2 py-1">
                                                {animal.isOwned ? (
                                                    <Heart size={12} className="text-black" />
                                                ) : (
                                                    <HeartOff size={12} className="text-black" />
                                                )}
                                                {/* Show Eye icon if showOnPublicProfile is true, or if the animal is from PublicAnimal collection (has no showOnPublicProfile field) */}
                                                {(animal.showOnPublicProfile !== undefined ? animal.showOnPublicProfile : true) ? (
                                                    <Eye size={12} className="text-black" />
                                                ) : (
                                                    <EyeOff size={12} className="text-black" />
                                                )}
                                                {animal.isInMating && <Hourglass size={12} className="text-black" />}
                                                {animal.isPregnant && <Bean size={12} className="text-black" />}
                                                {animal.isNursing && <Milk size={12} className="text-black" />}
                                            </div>
                                        )}
                                        
                                        {/* Name */}
                                        <div className="w-full text-center px-2 pb-1">
                                            <div className="text-sm font-semibold text-gray-800 truncate">
                                                {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                                            </div>
                                        </div>

                                        {/* ID bottom-right */}
                                        <div className="w-full px-2 pb-2 flex justify-end">
                                            <div className="text-xs text-gray-500">{animal.id_public}</div>
                                        </div>
                                        
                                        {/* Status bar */}
                                        <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                            <div className="text-xs font-medium text-gray-700">{animal.status || 'Unknown'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No offspring recorded in this litter.</p>
                        )}
                    </div>
                ))}
                </div>
            )}
        </div>
    );
};

// Litter Management Component
const LitterManagement = ({ authToken, API_BASE_URL, userProfile, showModalMessage, onViewAnimal, formDataRef, onFormOpenChange }) => {
    const [litters, setLitters] = useState([]);
    const [myAnimals, setMyAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        breedingPairCodeName: '',
        sireId_public: '',
        damId_public: '',
        pairingDate: '',
        birthDate: '',
        maleCount: '',
        femaleCount: '',
        notes: '',
        linkedOffspringIds: []
    });
    const [createOffspringCounts, setCreateOffspringCounts] = useState({
        males: 0,
        females: 0
    });
    const [sireSearch, setSireSearch] = useState('');
    const [damSearch, setDamSearch] = useState('');
    const [sireSpeciesFilter, setSireSpeciesFilter] = useState('');
    const [damSpeciesFilter, setDamSpeciesFilter] = useState('');
    const [linkingAnimals, setLinkingAnimals] = useState(false);
    const [availableToLink, setAvailableToLink] = useState({ litter: null, animals: [] });
    const [expandedLitter, setExpandedLitter] = useState(null);
    const [editingLitter, setEditingLitter] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState('');
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

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch animals and litters - they return immediately after setting data
                await Promise.all([fetchMyAnimals(), fetchLitters()]);
                
                // Run one-time migration to set isDisplay: true for all existing animals
                const migrationKey = 'crittertrack_visibility_migration_v1';
                if (!localStorage.getItem(migrationKey)) {
                    console.log('[Migration] Running visibility migration...');
                    await migrateAnimalVisibility();
                    localStorage.setItem(migrationKey, 'completed');
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Update parent ref with current form data for tutorial tracking
    useEffect(() => {
        if (formDataRef) {
            formDataRef.current = formData;
        }
    }, [formData, formDataRef]);

    // Notify parent when form open state changes
    useEffect(() => {
        if (onFormOpenChange) {
            onFormOpenChange(showAddForm);
        }
    }, [showAddForm, onFormOpenChange]);

    // Calculate predicted COI when both parents are selected
    useEffect(() => {
        const calculatePredictedCOI = async () => {
            if (formData.sireId_public && formData.damId_public && showAddForm) {
                setCalculatingCOI(true);
                try {
                    console.log('[Predicted COI] Calculating for sire:', formData.sireId_public, 'dam:', formData.damId_public);
                    const coiResponse = await axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
                        params: {
                            sireId: formData.sireId_public,
                            damId: formData.damId_public,
                            generations: 50
                        },
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    console.log('[Predicted COI] Response:', coiResponse.data);
                    const coiValue = coiResponse.data.inbreedingCoefficient;
                    setPredictedCOI(coiValue != null ? coiValue : 0);
                } catch (error) {
                    console.error('[Predicted COI] Error calculating:', error);
                    console.error('[Predicted COI] Error response:', error.response?.data);
                    setPredictedCOI(0); // Default to 0 if calculation fails
                } finally {
                    setCalculatingCOI(false);
                }
            } else {
                setPredictedCOI(null);
            }
        };
        
        calculatePredictedCOI();
    }, [formData.sireId_public, formData.damId_public, showAddForm, authToken, API_BASE_URL]);

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

    const fetchLitters = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/litters`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const littersData = response.data || [];
            
            // Set litters immediately so UI can render
            setLitters(littersData);
            
            // Calculate COI for each litter in background
            Promise.resolve().then(async () => {
                let needsUpdate = false;
                for (const litter of littersData) {
                    // Only calculate if COI is missing or null
                    if (litter.inbreedingCoefficient == null) {
                        try {
                            const coiResponse = await axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
                                params: {
                                    sireId: litter.sireId_public,
                                    damId: litter.damId_public,
                                    generations: 50
                                },
                                headers: { Authorization: `Bearer ${authToken}` }
                            });

                            if (coiResponse.data.inbreedingCoefficient != null) {
                                litter.inbreedingCoefficient = coiResponse.data.inbreedingCoefficient;
                                needsUpdate = true;
                                
                                // Update database
                                await axios.put(`${API_BASE_URL}/litters/${litter._id}`, {
                                    inbreedingCoefficient: coiResponse.data.inbreedingCoefficient
                                }, {
                                    headers: { Authorization: `Bearer ${authToken}` }
                                });
                            }
                        } catch (error) {
                            console.log(`Could not update COI for litter ${litter._id}:`, error);
                        }
                    }
                }
                // Update state if any COI values were calculated
                if (needsUpdate) {
                    setLitters([...littersData]);
                }
            });
        } catch (error) {
            console.error('Error fetching litters:', error);
            setLitters([]);
        }
    };

    const fetchMyAnimals = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const animalsData = response.data || [];
            
            console.log('[fetchMyAnimals] Raw response:', animalsData.length, 'animals');
            
            // Debug: Log health records for animals that have them
            animalsData.forEach((animal, idx) => {
                if (animal.vaccinations || animal.dewormingRecords || animal.parasiteControl) {
                    console.log(`[fetchMyAnimals] Animal ${animal.id_public} has health records:`, {
                        vaccinations: animal.vaccinations ? `${animal.vaccinations.length} bytes` : 'null',
                        dewormingRecords: animal.dewormingRecords ? `${animal.dewormingRecords.length} bytes` : 'null',
                        parasiteControl: animal.parasiteControl ? `${animal.parasiteControl.length} bytes` : 'null'
                    });
                }
            });
            
            // Set animals immediately so UI can render
            setMyAnimals(animalsData);
            
            // Start COI calculations in background without blocking
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
    };

    // Migration function to set isDisplay to true for all existing animals
    const migrateAnimalVisibility = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const animalsData = response.data || [];
            
            console.log('[migrateAnimalVisibility] Migrating', animalsData.length, 'animals');
            
            let updated = 0;
            for (const animal of animalsData) {
                // Only migrate animals where isDisplay was never set (undefined/null)
                // Do NOT override explicit false values set by users
                if (animal.isDisplay === undefined || animal.isDisplay === null) {
                    try {
                        await axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, 
                            { ...animal, isDisplay: true },
                            { headers: { Authorization: `Bearer ${authToken}` } }
                        );
                        updated++;
                    } catch (err) {
                        console.error(`Failed to update animal ${animal.id_public}:`, err);
                    }
                }
            }
            
            console.log(`[migrateAnimalVisibility] Updated ${updated} animals to isDisplay: true`);
            showModalMessage('Migration Complete', `Updated ${updated} animal(s) to have public profile enabled by default.`);
            
            // Refresh animals list
            await fetchMyAnimals();
        } catch (error) {
            console.error('Error migrating animals:', error);
            showModalMessage('Migration Error', 'Failed to migrate animal visibility settings.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.sireId_public || !formData.damId_public) {
            showModalMessage('Error', 'Please select both parents');
            return;
        }

        try {
            // Get parent details
            const sire = myAnimals.find(a => a.id_public === formData.sireId_public);
            const dam = myAnimals.find(a => a.id_public === formData.damId_public);

            if (!sire || !dam) {
                showModalMessage('Error', 'Selected parents not found');
                return;
            }

            if (sire.species !== dam.species) {
                showModalMessage('Error', 'Parents must be the same species');
                return;
            }

            // Validate parents were alive at litter birth date
            if (formData.birthDate) {
                const litterBirthDate = new Date(formData.birthDate);
                
                if (sire.deceasedDate) {
                    const sireDeceasedDate = new Date(sire.deceasedDate);
                    if (sireDeceasedDate < litterBirthDate) {
                        showModalMessage('Error', `Sire (${sire.name}) was deceased before the litter birth date`);
                        return;
                    }
                }
                
                if (dam.deceasedDate) {
                    const damDeceasedDate = new Date(dam.deceasedDate);
                    if (damDeceasedDate < litterBirthDate) {
                        showModalMessage('Error', `Dam (${dam.name}) was deceased before the litter birth date`);
                        return;
                    }
                }
            }

            // Create litter with optional tracking counts
            const maleCountNum = formData.maleCount ? parseInt(formData.maleCount) : 0;
            const femaleCountNum = formData.femaleCount ? parseInt(formData.femaleCount) : 0;
            const totalCount = maleCountNum + femaleCountNum;
            
            const litterPayload = {
                breedingPairCodeName: formData.breedingPairCodeName || null,
                sireId_public: formData.sireId_public,
                damId_public: formData.damId_public,
                pairingDate: formData.pairingDate || null,
                birthDate: formData.birthDate || null,
                numberBorn: totalCount > 0 ? totalCount : (formData.linkedOffspringIds?.length || 0),
                maleCount: maleCountNum,
                femaleCount: femaleCountNum,
                notes: formData.notes || '',
                offspringIds_public: formData.linkedOffspringIds || []
            };

            const litterResponse = await axios.post(`${API_BASE_URL}/litters`, litterPayload, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            const litterId = litterResponse.data.litterId_backend;

            // Calculate inbreeding coefficient for this pairing
            try {
                const coiResponse = await axios.get(`${API_BASE_URL}/inbreeding/pairing`, {
                    params: {
                        sireId: formData.sireId_public,
                        damId: formData.damId_public,
                        generations: 50
                    },
                    headers: { Authorization: `Bearer ${authToken}` }
                });

                if (coiResponse.data.inbreedingCoefficient != null) {
                    await axios.put(`${API_BASE_URL}/litters/${litterId}`, {
                        inbreedingCoefficient: coiResponse.data.inbreedingCoefficient
                    }, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                }
            } catch (coiError) {
                console.log('Could not calculate COI for litter:', coiError);
            }

            // Create offspring animals if requested
            const offspringPromises = [];
            const totalToCreate = parseInt(createOffspringCounts.males) + parseInt(createOffspringCounts.females);
            
            if (totalToCreate > 0) {
                // Need birthdate to create animals
                if (!formData.birthDate) {
                    showModalMessage('Error', 'Birth date is required to create new offspring animals');
                    return;
                }
                
                // Create males
                for (let i = 1; i <= parseInt(createOffspringCounts.males); i++) {
                    const animalData = {
                        name: `M${i}`,
                        species: sire.species,
                        gender: 'Male',
                        birthDate: formData.birthDate,
                        status: 'Pet',
                        fatherId_public: formData.sireId_public,
                        motherId_public: formData.damId_public,
                        isOwned: true,
                        breederId_public: userProfile.id_public,
                        ownerId_public: userProfile.id_public
                    };
                    offspringPromises.push(
                        axios.post(`${API_BASE_URL}/animals`, animalData, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        })
                    );
                }
                
                // Create females
                for (let i = 1; i <= parseInt(createOffspringCounts.females); i++) {
                    const animalData = {
                        name: `F${i}`,
                        species: sire.species,
                        gender: 'Female',
                        birthDate: formData.birthDate,
                        status: 'Pet',
                        fatherId_public: formData.sireId_public,
                        motherId_public: formData.damId_public,
                        isOwned: true,
                        breederId_public: userProfile.id_public,
                        ownerId_public: userProfile.id_public
                    };
                    offspringPromises.push(
                        axios.post(`${API_BASE_URL}/animals`, animalData, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        })
                    );
                }
            }
            
            const createdAnimals = await Promise.all(offspringPromises);

            // Extract the IDs from created animals
            const newOffspringIds = createdAnimals.map(response => response.data.id_public);
            
            // Combine created and linked offspring IDs
            const allOffspringIds = [...newOffspringIds, ...(formData.linkedOffspringIds || [])];
            
            // Calculate inbreeding for each NEW offspring
            for (const animalId of newOffspringIds) {
                try {
                    await axios.get(`${API_BASE_URL}/animals/${animalId}/inbreeding`, {
                        params: { generations: 50 },
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                } catch (coiError) {
                    console.log(`Could not calculate COI for animal ${animalId}:`, coiError);
                }
            }
            
            // Update litter with all offspring
            await axios.put(`${API_BASE_URL}/litters/${litterId}`, {
                offspringIds_public: allOffspringIds,
                numberBorn: allOffspringIds.length
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            // Recalculate litter COI after adding offspring
            try {
                const coiResponse = await axios.get(`${API_BASE_URL}/inbreeding/pairing`, {
                    params: {
                        sireId: formData.sireId_public,
                        damId: formData.damId_public,
                        generations: 50
                    },
                    headers: { Authorization: `Bearer ${authToken}` }
                });

                if (coiResponse.data.inbreedingCoefficient != null) {
                    await axios.put(`${API_BASE_URL}/litters/${litterId}`, {
                        inbreedingCoefficient: coiResponse.data.inbreedingCoefficient
                    }, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                }
            } catch (coiError) {
                console.log('Could not calculate COI for litter:', coiError);
            }

            const createdCount = newOffspringIds.length;
            const linkedCount = formData.linkedOffspringIds?.length || 0;
            const trackingMales = formData.maleCount ? parseInt(formData.maleCount) : 0;
            const trackingFemales = formData.femaleCount ? parseInt(formData.femaleCount) : 0;
            
            let successMsg = 'Litter created successfully!';
            const parts = [];
            if (createdCount > 0) parts.push(`${createdCount} new animal(s) created`);
            if (linkedCount > 0) parts.push(`${linkedCount} animal(s) linked`);
            if (trackingMales > 0 || trackingFemales > 0) {
                parts.push(`tracking ${trackingMales}M/${trackingFemales}F`);
            }
            if (parts.length > 0) {
                successMsg = `Litter created with ${parts.join(', ')}!`;
            }
            
            showModalMessage('Success', successMsg);
            setShowAddForm(false);
            setFormData({
                breedingPairCodeName: '',
                sireId_public: '',
                damId_public: '',
                pairingDate: '',
                birthDate: '',
                maleCount: '',
                femaleCount: '',
                notes: '',
                linkedOffspringIds: []
            });
            setCreateOffspringCounts({ males: 0, females: 0 });
            setSireSearch('');
            setDamSearch('');
            setSireSpeciesFilter('');
            setDamSpeciesFilter('');
            setPredictedCOI(null);
            fetchLitters();
            fetchMyAnimals();
        } catch (error) {
            console.error('Error creating litter:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to create litter');
        }
    };

    const handleLinkAnimals = async (litter) => {
        try {
            // Search for animals with matching parents and birthdate
            const response = await axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            // Get offspring IDs already in this litter
            const linkedIds = litter.offspringIds_public || [];
            
            const matching = response.data.filter(animal => {
                // Skip if already linked to this litter
                if (linkedIds.includes(animal.id_public)) return false;
                
                const matchesSire = animal.fatherId_public === litter.sireId_public || animal.sireId_public === litter.sireId_public;
                const matchesDam = animal.motherId_public === litter.damId_public || animal.damId_public === litter.damId_public;
                const matchesBirthDate = animal.birthDate && new Date(animal.birthDate).toDateString() === new Date(litter.birthDate).toDateString();
                return matchesSire && matchesDam && matchesBirthDate;
            });

            setAvailableToLink({ litter, animals: matching });
            setLinkingAnimals(true);
        } catch (error) {
            console.error('Error finding matching animals:', error);
            showModalMessage('Error', 'Failed to search for matching animals');
        }
    };

    const handleAddToLitter = async (animalId) => {
        try {
            const updatedOffspringIds = [...(availableToLink.litter.offspringIds_public || []), animalId];
            
            await axios.put(`${API_BASE_URL}/litters/${availableToLink.litter._id}`, {
                offspringIds_public: updatedOffspringIds,
                numberBorn: updatedOffspringIds.length
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            showModalMessage('Success', 'Animal linked to litter!');
            
            // Remove from available list
            setAvailableToLink({
                ...availableToLink,
                animals: availableToLink.animals.filter(a => a.id_public !== animalId)
            });
            
            // Refresh litters to show updated count
            fetchLitters();
        } catch (error) {
            console.error('Error linking animal to litter:', error);
            showModalMessage('Error', 'Failed to link animal to litter');
        }
    };

    const handleDeleteLitter = async (litterId) => {
        if (!window.confirm('Are you sure you want to delete this litter? This will not delete the animals, only the litter record.')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/litters/${litterId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            showModalMessage('Success', 'Litter deleted successfully!');
            fetchLitters();
        } catch (error) {
            console.error('Error deleting litter:', error);
            showModalMessage('Error', 'Failed to delete litter');
        }
    };

    const handleRecalculateOffspringCounts = async () => {
        if (!window.confirm('This will recalculate offspring counts for all litters based on linked animals. Continue?')) {
            return;
        }

        try {
            setLoading(true);
            let updatedCount = 0;

            for (const litter of litters) {
                const correctCount = litter.offspringIds_public?.length || 0;
                
                // Only update if count is different
                if (litter.numberBorn !== correctCount) {
                    await axios.put(`${API_BASE_URL}/litters/${litter._id}`, {
                        numberBorn: correctCount
                    }, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    updatedCount++;
                }
            }

            showModalMessage('Success', `Recalculated offspring counts for ${updatedCount} litter(s)!`);
            fetchLitters();
        } catch (error) {
            console.error('Error recalculating offspring counts:', error);
            showModalMessage('Error', 'Failed to recalculate offspring counts');
        } finally {
            setLoading(false);
        }
    };

    const handleEditLitter = (litter) => {
        setEditingLitter(litter._id);
        setFormData({
            breedingPairCodeName: litter.breedingPairCodeName || '',
            sireId_public: litter.sireId_public,
            damId_public: litter.damId_public,
            pairingDate: litter.pairingDate || '',
            birthDate: litter.birthDate || '',
            maleCount: litter.maleCount || '',
            femaleCount: litter.femaleCount || '',
            notes: litter.notes || '',
            linkedOffspringIds: litter.offspringIds_public || []
        });
        setShowAddForm(true);
        setExpandedLitter(null);
    };

    const handleUpdateLitter = async (e) => {
        e.preventDefault();
        
        if (!formData.sireId_public || !formData.damId_public) {
            showModalMessage('Error', 'Please select both parents');
            return;
        }

        try {
            // Get parent details for offspring creation
            const sire = myAnimals.find(a => a.id_public === formData.sireId_public);
            const dam = myAnimals.find(a => a.id_public === formData.damId_public);

            // Create offspring animals if requested
            const offspringPromises = [];
            const totalToCreate = parseInt(createOffspringCounts.males) + parseInt(createOffspringCounts.females);
            
            if (totalToCreate > 0) {
                // Need birthdate to create animals
                if (!formData.birthDate) {
                    showModalMessage('Error', 'Birth date is required to create new offspring animals');
                    return;
                }
                
                // Create males
                for (let i = 1; i <= parseInt(createOffspringCounts.males); i++) {
                    const animalData = {
                        name: `M${i}`,
                        species: sire.species,
                        gender: 'Male',
                        birthDate: formData.birthDate,
                        status: 'Pet',
                        fatherId_public: formData.sireId_public,
                        motherId_public: formData.damId_public,
                        isOwned: true,
                        breederId_public: userProfile.id_public,
                        ownerId_public: userProfile.id_public
                    };
                    offspringPromises.push(
                        axios.post(`${API_BASE_URL}/animals`, animalData, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        })
                    );
                }
                
                // Create females
                for (let i = 1; i <= parseInt(createOffspringCounts.females); i++) {
                    const animalData = {
                        name: `F${i}`,
                        species: sire.species,
                        gender: 'Female',
                        birthDate: formData.birthDate,
                        status: 'Pet',
                        fatherId_public: formData.sireId_public,
                        motherId_public: formData.damId_public,
                        isOwned: true,
                        breederId_public: userProfile.id_public,
                        ownerId_public: userProfile.id_public
                    };
                    offspringPromises.push(
                        axios.post(`${API_BASE_URL}/animals`, animalData, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        })
                    );
                }
            }
            
            const createdAnimals = await Promise.all(offspringPromises);
            const newOffspringIds = createdAnimals.map(response => response.data.id_public);
            const allOffspringIds = [...newOffspringIds, ...(formData.linkedOffspringIds || [])];

            await axios.put(`${API_BASE_URL}/litters/${editingLitter}`, {
                breedingPairCodeName: formData.breedingPairCodeName,
                sireId_public: formData.sireId_public,
                damId_public: formData.damId_public,
                pairingDate: formData.pairingDate,
                birthDate: formData.birthDate,
                maleCount: formData.maleCount,
                femaleCount: formData.femaleCount,
                notes: formData.notes,
                offspringIds_public: allOffspringIds,
                numberBorn: allOffspringIds.length
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            showModalMessage('Success', 'Litter updated successfully!');
            setShowAddForm(false);
            setEditingLitter(null);
            setFormData({
                breedingPairCodeName: '',
                sireId_public: '',
                damId_public: '',
                pairingDate: '',
                birthDate: '',
                maleCount: '',
                femaleCount: '',
                notes: '',
                linkedOffspringIds: []
            });
            setCreateOffspringCounts({ males: 0, females: 0 });
            setSireSearch('');
            setDamSearch('');
            setSireSpeciesFilter('');
            setDamSpeciesFilter('');
            setPredictedCOI(null);
            fetchLitters();
            fetchMyAnimals();
        } catch (error) {
            console.error('Error updating litter:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to update litter');
        }
    };

    const handleAddOffspringToLitter = (litter) => {
        const sire = myAnimals.find(a => a.id_public === litter.sireId_public);
        setAddingOffspring(litter);
        setNewOffspringData({
            name: '',
            gender: '',
            color: '',
            coat: '',
            remarks: ''
        });
    };

    const handleSaveNewOffspring = async () => {
        if (!newOffspringData.name || !newOffspringData.gender) {
            showModalMessage('Error', 'Name and gender are required');
            return;
        }

        try {
            const sire = myAnimals.find(a => a.id_public === addingOffspring.sireId_public);
            
            const animalData = {
                name: newOffspringData.name,
                species: sire.species,
                gender: newOffspringData.gender,
                birthDate: addingOffspring.birthDate,
                status: 'Pet',
                fatherId_public: addingOffspring.sireId_public,
                motherId_public: addingOffspring.damId_public,
                color: newOffspringData.color || null,
                coat: newOffspringData.coat || null,
                remarks: newOffspringData.remarks || null,
                isOwned: true,
                breederId_public: userProfile.id_public,
                ownerId_public: userProfile.id_public
            };

            const response = await axios.post(`${API_BASE_URL}/animals`, animalData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            const newAnimalId = response.data.id_public;

            // Calculate inbreeding coefficient
            try {
                await axios.get(`${API_BASE_URL}/animals/${newAnimalId}/inbreeding`, {
                    params: { generations: 50 },
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            } catch (coiError) {
                console.log('Could not calculate COI for new offspring:', coiError);
            }

            // Link to litter
            const updatedOffspringIds = [...(addingOffspring.offspringIds_public || []), newAnimalId];
            await axios.put(`${API_BASE_URL}/litters/${addingOffspring._id}`, {
                offspringIds_public: updatedOffspringIds,
                numberBorn: updatedOffspringIds.length
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            showModalMessage('Success', 'Offspring added to litter!');
            setAddingOffspring(null);
            fetchLitters();
            fetchMyAnimals();
        } catch (error) {
            console.error('Error adding offspring:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to add offspring');
        }
    };

    // Debug logging for animal filtering
    console.log('[LitterManagement] Total myAnimals:', myAnimals.length);
    console.log('[LitterManagement] Animals data:', myAnimals.map(a => ({ 
        id: a.id_public, 
        name: a.name, 
        gender: a.gender,
        species: a.species 
    })));
    
    const maleAnimals = myAnimals.filter(a => a.gender === 'Male');
    const femaleAnimals = myAnimals.filter(a => a.gender === 'Female');
    
    // Filter male animals by search and species
    const filteredMaleAnimals = maleAnimals.filter(animal => {
        const matchesSearch = !sireSearch || 
            animal.name.toLowerCase().includes(sireSearch.toLowerCase()) ||
            animal.id_public.toString().includes(sireSearch) ||
            (animal.prefix && animal.prefix.toLowerCase().includes(sireSearch.toLowerCase())) ||
            (animal.suffix && animal.suffix.toLowerCase().includes(sireSearch.toLowerCase()));
        const matchesSpecies = !sireSpeciesFilter || animal.species === sireSpeciesFilter;
        return matchesSearch && matchesSpecies;
    });
    
    // Filter female animals by search and species
    const filteredFemaleAnimals = femaleAnimals.filter(animal => {
        const matchesSearch = !damSearch || 
            animal.name.toLowerCase().includes(damSearch.toLowerCase()) ||
            animal.id_public.toString().includes(damSearch) ||
            (animal.prefix && animal.prefix.toLowerCase().includes(damSearch.toLowerCase())) ||
            (animal.suffix && animal.suffix.toLowerCase().includes(damSearch.toLowerCase()));
        const matchesSpecies = !damSpeciesFilter || animal.species === damSpeciesFilter;
        return matchesSearch && matchesSpecies;
    });
    
    // Get unique species from all animals
    const allSpecies = [...new Set(myAnimals.map(a => a.species).filter(Boolean))].sort();
    
    console.log('[LitterManagement] Male animals:', maleAnimals.length);
    console.log('[LitterManagement] Female animals:', femaleAnimals.length);

    // Filter litters based on search query and species
    const filteredLitters = litters.filter(litter => {
        const sire = myAnimals.find(a => a.id_public === litter.sireId_public);
        const dam = myAnimals.find(a => a.id_public === litter.damId_public);
        
        // Species filter
        if (speciesFilter) {
            if (sire?.species !== speciesFilter) return false;
        }
        
        // Search filter
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        
        // Search by litter name
        if (litter.breedingPairCodeName && litter.breedingPairCodeName.toLowerCase().includes(query)) return true;
        
        // Search by sire name or ID
        if (sire && sire.name.toLowerCase().includes(query)) return true;
        if (sire && sire.id_public.toString().includes(query)) return true;
        if (litter.sireId_public.toString().includes(query)) return true;
        
        // Search by dam name or ID
        if (dam && dam.name.toLowerCase().includes(query)) return true;
        if (dam && dam.id_public.toString().includes(query)) return true;
        if (litter.damId_public.toString().includes(query)) return true;
        
        return false;
    });

    if (loading) {
        return (
            <div className="w-full max-w-6xl bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin" size={48} />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <BookOpen size={24} className="mr-3 text-primary-dark" />
                    Litter Management
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleRecalculateOffspringCounts}
                        className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-3 rounded-lg flex items-center"
                        title="Recalculate offspring counts for all litters"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={() => {
                            if (showAddForm) {
                                // Clear search filters and editing state when closing form
                                setSireSearch('');
                                setDamSearch('');
                                setSireSpeciesFilter('');
                                setDamSpeciesFilter('');
                                setEditingLitter(null);
                                setPredictedCOI(null);
                                setFormData({
                                    breedingPairCodeName: '',
                                    sireId_public: '',
                                    damId_public: '',
                                    pairingDate: '',
                                    birthDate: '',
                                    maleCount: '',
                                    femaleCount: '',
                                    notes: '',
                                    linkedOffspringIds: []
                                });
                            }
                            setShowAddForm(!showAddForm);
                        }}
                        data-tutorial-target="new-litter-btn"
                        className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                    >
                        {showAddForm ? <X size={20} /> : <Plus size={20} />}
                        {showAddForm ? 'Cancel' : 'New Litter'}
                    </button>
                </div>
            </div>

            {showAddForm && (
                <form onSubmit={editingLitter ? handleUpdateLitter : handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6 border-2 border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{editingLitter ? 'Edit Litter' : 'Create New Litter'}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Litter Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Litter Name/ID (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.breedingPairCodeName}
                                onChange={(e) => setFormData({...formData, breedingPairCodeName: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g., Summer 2025 Litter A"
                            />
                        </div>

                        {/* Pairing Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pairing Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={formData.pairingDate}
                                onChange={(e) => setFormData({...formData, pairingDate: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Sire Selection */}
                        <div data-tutorial-target="litter-sire-dam">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sire (Father) <span className="text-red-500">*</span>
                            </label>
                            
                            {/* Search and Filter for Sire */}
                            <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Search sires..."
                                    value={sireSearch}
                                    onChange={(e) => setSireSearch(e.target.value)}
                                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <select
                                    value={sireSpeciesFilter}
                                    onChange={(e) => setSireSpeciesFilter(e.target.value)}
                                    className="w-full sm:w-auto px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">All Species</option>
                                    {allSpecies.map(species => (
                                        <option key={species} value={species}>{species}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <select
                                value={formData.sireId_public}
                                onChange={(e) => setFormData({...formData, sireId_public: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            >
                                <option value="">Select Sire</option>
                                {filteredMaleAnimals.length === 0 && maleAnimals.length > 0 && (
                                    <option value="" disabled>No males match your filters</option>
                                )}
                                {maleAnimals.length === 0 && myAnimals.length > 0 && (
                                    <option value="" disabled>No male animals found</option>
                                )}
                                {maleAnimals.length === 0 && myAnimals.length === 0 && (
                                    <option value="" disabled>Loading animals...</option>
                                )}
                                {filteredMaleAnimals.map(animal => (
                                    <option key={animal.id_public} value={animal.id_public}>
                                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''} - {animal.id_public} ({animal.species})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dam Selection */}
                        <div data-tutorial-target="litter-sire-dam">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dam (Mother) <span className="text-red-500">*</span>
                            </label>
                            
                            {/* Search and Filter for Dam */}
                            <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Search dams..."
                                    value={damSearch}
                                    onChange={(e) => setDamSearch(e.target.value)}
                                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <select
                                    value={damSpeciesFilter}
                                    onChange={(e) => setDamSpeciesFilter(e.target.value)}
                                    className="w-full sm:w-auto px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">All Species</option>
                                    {allSpecies.map(species => (
                                        <option key={species} value={species}>{species}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <select
                                value={formData.damId_public}
                                onChange={(e) => setFormData({...formData, damId_public: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            >
                                <option value="">Select Dam</option>
                                {filteredFemaleAnimals.length === 0 && femaleAnimals.length > 0 && (
                                    <option value="" disabled>No females match your filters</option>
                                )}
                                {femaleAnimals.length === 0 && myAnimals.length > 0 && (
                                    <option value="" disabled>No female animals found</option>
                                )}
                                {femaleAnimals.length === 0 && myAnimals.length === 0 && (
                                    <option value="" disabled>Loading animals...</option>
                                )}
                                {filteredFemaleAnimals.map(animal => (
                                    <option key={animal.id_public} value={animal.id_public}>
                                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''} - {animal.id_public} ({animal.species})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Predicted COI Display */}
                    {(formData.sireId_public && formData.damId_public) && (
                        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Predicted Offspring COI:</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Coefficient of Inbreeding for offspring from this pairing
                                    </p>
                                </div>
                                <div className="text-right">
                                    {calculatingCOI ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={20} />
                                            <span className="text-sm text-gray-600">Calculating...</span>
                                        </div>
                                    ) : predictedCOI != null ? (
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {predictedCOI.toFixed(2)}%
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {predictedCOI === 0 ? 'No inbreeding' : 
                                                 predictedCOI < 5 ? 'Low inbreeding' : 
                                                 predictedCOI < 10 ? 'Moderate inbreeding' : 
                                                 'High inbreeding'}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">N/A</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Birth Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Birth Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                                min="1800-01-01"
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Male Count */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Males (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.maleCount}
                                onChange={(e) => setFormData({...formData, maleCount: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g., 5 or just notes"
                            />
                        </div>

                        {/* Female Count */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Females (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.femaleCount}
                                onChange={(e) => setFormData({...formData, femaleCount: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g., 3 or just notes"
                            />
                        </div>
                    </div>

                    {/* Link Existing Offspring */}
                    {formData.sireId_public && formData.damId_public && (
                        <div className="mb-4 border-t pt-4" data-tutorial-target="litter-offspring-sections">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Link Existing Animals as Offspring
                            </label>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-3">
                                    Select animals with matching parents to link them to this litter. Birth date will be filled automatically.
                                </p>
                                <div className="space-y-2">
                                    {myAnimals
                                        .filter(animal => {
                                            const matchesSire = animal.fatherId_public === formData.sireId_public || animal.sireId_public === formData.sireId_public;
                                            const matchesDam = animal.motherId_public === formData.damId_public || animal.damId_public === formData.damId_public;
                                            return matchesSire && matchesDam;
                                        })
                                        .map(animal => (
                                            <label key={animal.id_public} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.linkedOffspringIds?.includes(animal.id_public)}
                                                    onChange={(e) => {
                                                        const newLinked = e.target.checked
                                                            ? [...(formData.linkedOffspringIds || []), animal.id_public]
                                                            : (formData.linkedOffspringIds || []).filter(id => id !== animal.id_public);
                                                        // Auto-fill birthDate from first selected offspring
                                                        const newBirthDate = e.target.checked && animal.birthDate && !formData.birthDate
                                                            ? animal.birthDate
                                                            : formData.birthDate;
                                                        setFormData({...formData, linkedOffspringIds: newLinked, birthDate: newBirthDate});
                                                    }}
                                                    className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                                />
                                                <span className="text-sm text-gray-800">
                                                    {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`} - {animal.id_public} ({animal.gender})
                                                </span>
                                            </label>
                                        ))
                                    }
                                    {myAnimals.filter(animal => {
                                        const matchesSire = animal.fatherId_public === formData.sireId_public || animal.sireId_public === formData.sireId_public;
                                        const matchesDam = animal.motherId_public === formData.damId_public || animal.damId_public === formData.damId_public;
                                        return matchesSire && matchesDam;
                                    }).length === 0 && (
                                        <p className="text-xs text-gray-500 italic">No matching animals found</p>
                                    )}
                                    {formData.linkedOffspringIds?.length > 0 && (
                                        <p className="text-xs text-green-600 font-semibold mt-2">
                                            {formData.linkedOffspringIds.length} animal(s) selected
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Create New Offspring */}
                    {formData.sireId_public && formData.damId_public && formData.birthDate && (
                        <div className="mb-4 border-t pt-4" data-tutorial-target="litter-offspring-sections">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Create New Offspring Animals
                            </label>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <p className="text-xs text-blue-800 mb-3">
                                    <strong>Create placeholder animals:</strong> These will be created with names M1, M2... for males and F1, F2... for females. You can edit names and details after creation.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Add # Males
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={createOffspringCounts.males}
                                            onChange={(e) => setCreateOffspringCounts({...createOffspringCounts, males: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Add # Females
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={createOffspringCounts.females}
                                            onChange={(e) => setCreateOffspringCounts({...createOffspringCounts, females: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                {(parseInt(createOffspringCounts.males) > 0 || parseInt(createOffspringCounts.females) > 0) && (
                                    <p className="text-xs text-green-600 font-semibold mt-2">
                                        Will create {parseInt(createOffspringCounts.males) + parseInt(createOffspringCounts.females)} new animal(s)
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            rows="3"
                            placeholder="Additional notes about this litter..."
                        />
                    </div>

                    <button
                        type="submit"
                        data-tutorial-target="create-litter-btn"
                        className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3 px-4 rounded-lg"
                    >
                        {editingLitter ? 'Update Litter' : 'Create Litter'}
                    </button>
                </form>
            )}

            {/* Litter List */}
            <div className="space-y-4">
                {/* Search Bar */}
                {litters.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by litter name, sire name/ID, or dam name/ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        
                        {/* Species filter */}
                        <div className="flex gap-2 items-center pt-2 border-t border-gray-200">
                            <label htmlFor="litter-species-filter" className='text-sm font-medium text-gray-700 whitespace-nowrap'>Species:</label>
                            <select
                                id="litter-species-filter"
                                value={speciesFilter}
                                onChange={(e) => setSpeciesFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            >
                                <option value="">All Species</option>
                                {DEFAULT_SPECIES_OPTIONS.map(species => (
                                    <option key={species} value={species}>
                                        {getSpeciesDisplayName(species)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {filteredLitters.length === 0 && litters.length > 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Search size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No litters match your search.</p>
                    </div>
                ) : filteredLitters.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No litters yet. Create your first litter above!</p>
                    </div>
                ) : (
                    filteredLitters.map(litter => {
                        const sire = myAnimals.find(a => a.id_public === litter.sireId_public);
                        const dam = myAnimals.find(a => a.id_public === litter.damId_public);
                        const isExpanded = expandedLitter === litter._id;
                        const offspringList = myAnimals.filter(a => 
                            litter.offspringIds_public && litter.offspringIds_public.includes(a.id_public)
                        );
                        
                        return (
                            <div key={litter._id} className="border-2 border-gray-200 rounded-lg bg-white hover:shadow-md transition">
                                {/* Compact Header - Always Visible */}
                                <div 
                                    className="p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50"
                                    onClick={() => setExpandedLitter(isExpanded ? null : litter._id)}
                                >
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">
                                                {litter.breedingPairCodeName || 'Unnamed Litter'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(litter.birthDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-600">Sire:</span> {sire ? `${sire.prefix ? sire.prefix + ' ' : ''}${sire.name}${sire.suffix ? ' ' + sire.suffix : ''}` : `${litter.sireId_public}`}
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-600">Dam:</span> {dam ? `${dam.prefix ? dam.prefix + ' ' : ''}${dam.name}${dam.suffix ? ' ' + dam.suffix : ''}` : `${litter.damId_public}`}
                                        </div>
                                        <div className="text-sm font-semibold text-gray-700">
                                            {litter.numberBorn} offspring
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-600">COI:</span> {litter.inbreedingCoefficient != null ? `${litter.inbreedingCoefficient.toFixed(2)}%` : 'N/A'}
                                        </div>
                                    </div>
                                    <ChevronLeft 
                                        size={20} 
                                        className={`text-gray-400 transition-transform ${isExpanded ? '-rotate-90' : 'rotate-180'}`}
                                    />
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t-2 border-gray-200 p-4 bg-gray-50">
                                        <div className="flex justify-end gap-2 mb-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditLitter(litter);
                                                }}
                                                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-3 py-2 rounded-lg text-sm"
                                            >
                                                <Edit size={16} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleLinkAnimals(litter)}
                                                className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-black font-semibold px-3 py-2 rounded-lg text-sm"
                                            >
                                                <Link size={16} />
                                                Link Animals
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteLitter(litter._id);
                                                }}
                                                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-2 rounded-lg text-sm"
                                            >
                                                <Trash2 size={16} />
                                                Delete Litter
                                            </button>
                                        </div>

                                        {litter.pairingDate && (
                                            <p className="text-sm text-gray-600 mb-3">
                                                <strong>Pairing Date:</strong> {new Date(litter.pairingDate).toLocaleDateString()}
                                            </p>
                                        )}

                                        {litter.notes && (
                                            <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200">
                                                <p className="text-sm font-semibold text-gray-700 mb-1">Notes:</p>
                                                <p className="text-sm text-gray-600">{litter.notes}</p>
                                            </div>
                                        )}

                                        {/* Parent Cards */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-bold text-gray-700 mb-2">Parents</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {/* Sire Card */}
                                                {sire && (
                                                    <div 
                                                        onClick={() => onViewAnimal(sire)}
                                                        className="relative bg-white rounded-lg shadow-sm border border-gray-300 p-3 cursor-pointer hover:shadow-md transition flex items-center gap-3"
                                                    >
                                                        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                            {sire.imageUrl || sire.photoUrl ? (
                                                                <img src={sire.imageUrl || sire.photoUrl} alt={sire.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <Cat size={32} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <Mars size={14} className="text-primary flex-shrink-0" />
                                                                <p className="font-bold text-gray-800 truncate">
                                                                    {sire.prefix ? `${sire.prefix} ` : ''}{sire.name}{sire.suffix ? ` ${sire.suffix}` : ''}
                                                                </p>
                                                            </div>
                                                            <p className="text-xs text-gray-500">{sire.id_public}</p>
                                                            <p className="text-xs text-gray-600">{sire.species}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dam Card */}
                                                {dam && (
                                                    <div 
                                                        onClick={() => onViewAnimal(dam)}
                                                        className="relative bg-white rounded-lg shadow-sm border border-gray-300 p-3 cursor-pointer hover:shadow-md transition flex items-center gap-3"
                                                    >
                                                        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                            {dam.imageUrl || dam.photoUrl ? (
                                                                <img src={dam.imageUrl || dam.photoUrl} alt={dam.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <Cat size={32} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <Venus size={14} className="text-accent flex-shrink-0" />
                                                                <p className="font-bold text-gray-800 truncate">
                                                                    {dam.prefix ? `${dam.prefix} ` : ''}{dam.name}{dam.suffix ? ` ${dam.suffix}` : ''}
                                                                </p>
                                                            </div>
                                                            <p className="text-xs text-gray-500">{dam.id_public}</p>
                                                            <p className="text-xs text-gray-600">{dam.species}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Offspring Cards */}
                                        {offspringList.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-bold text-gray-700">Offspring ({offspringList.length})</h4>
                                                    <div className="flex items-center gap-2">
                                                        {bulkDeleteMode[litter._id] && (
                                                            <>
                                                                <span className="text-sm text-gray-600">
                                                                    {(selectedOffspring[litter._id] || []).length} selected
                                                                </span>
                                                                <button
                                                                    onClick={() => handleBulkDeleteOffspring(litter._id)}
                                                                    disabled={(selectedOffspring[litter._id] || []).length === 0}
                                                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    Delete Selected
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleBulkDeleteMode(litter._id)}
                                                                    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded-lg transition"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                        {!bulkDeleteMode[litter._id] && (
                                                            <button
                                                                onClick={() => toggleBulkDeleteMode(litter._id)}
                                                                className="p-2 hover:bg-gray-200 rounded-lg transition"
                                                                title="Delete Multiple"
                                                            >
                                                                <Trash2 size={18} className="text-red-500" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                    {offspringList.map(animal => {
                                                        const isBulkMode = bulkDeleteMode[litter._id] || false;
                                                        const isSelected = (selectedOffspring[litter._id] || []).includes(animal.id_public);
                                                        
                                                        return (
                                                        <div
                                                            key={animal.id_public}
                                                            onClick={() => {
                                                                if (isBulkMode) {
                                                                    toggleOffspringSelection(litter._id, animal.id_public);
                                                                } else {
                                                                    onViewAnimal(animal);
                                                                }
                                                            }}
                                                            className={`relative bg-white rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 pt-2 ${
                                                                isSelected ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                        >
                                                            {isBulkMode && (
                                                                <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => toggleOffspringSelection(litter._id, animal.id_public)}
                                                                        className="w-5 h-5 cursor-pointer"
                                                                    />
                                                                </div>
                                                            )}
                                                            {/* Gender badge top-right */}
                                                            {animal.gender && (
                                                                <div className="absolute top-1.5 right-1.5">
                                                                    {animal.gender === 'Male' 
                                                                        ? <Mars size={14} strokeWidth={2.5} className="text-primary" /> 
                                                                        : <Venus size={14} strokeWidth={2.5} className="text-accent" />
                                                                    }
                                                                </div>
                                                            )}

                                                            {/* Profile image */}
                                                            <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                {animal.imageUrl || animal.photoUrl ? (
                                                                    <img 
                                                                        src={animal.imageUrl || animal.photoUrl} 
                                                                        alt={animal.name} 
                                                                        className="w-20 h-20 object-cover rounded-md" 
                                                                    />
                                                                ) : (
                                                                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                                        <Cat size={32} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Icon row */}
                                                            <div className="w-full flex justify-center items-center space-x-2 py-1">
                                                                {animal.isOwned ? (
                                                                    <Heart size={12} className="text-black" />
                                                                ) : (
                                                                    <HeartOff size={12} className="text-black" />
                                                                )}
                                                                {animal.showOnPublicProfile || animal.isDisplay ? (
                                                                    <Eye size={12} className="text-black" />
                                                                ) : (
                                                                    <EyeOff size={12} className="text-black" />
                                                                )}
                                                                {animal.isInMating && <Hourglass size={12} className="text-black" />}
                                                                {animal.isPregnant && <Bean size={12} className="text-black" />}
                                                                {animal.isNursing && <Milk size={12} className="text-black" />}
                                                            </div>
                                                            
                                                            {/* Name */}
                                                            <div className="w-full text-center px-2 pb-1">
                                                                <div className="text-sm font-semibold text-gray-800 truncate">
                                                                    {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                                                                </div>
                                                            </div>

                                                            {/* ID bottom-right */}
                                                            <div className="w-full px-2 pb-2 flex justify-end">
                                                                <div className="text-xs text-gray-500">{animal.id_public}</div>
                                                            </div>
                                                            
                                                            {/* Status bar */}
                                                            <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                                                <div className="text-xs font-medium text-gray-700">{animal.status || 'Unknown'}</div>
                                                            </div>
                                                        </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Add Offspring Section */}
                                        {addingOffspring && addingOffspring._id === litter._id ? (
                                            <div className="bg-white rounded-lg border-2 border-primary p-4">
                                                <h4 className="text-sm font-bold text-gray-700 mb-3">Add New Offspring</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                                                        <input
                                                            type="text"
                                                            value={newOffspringData.name}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, name: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Enter name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Gender *</label>
                                                        <select
                                                            value={newOffspringData.gender}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, gender: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                        >
                                                            <option value="">Select gender</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Color</label>
                                                        <input
                                                            type="text"
                                                            value={newOffspringData.color}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, color: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Optional"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Coat</label>
                                                        <input
                                                            type="text"
                                                            value={newOffspringData.coat}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, coat: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Optional"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks</label>
                                                        <textarea
                                                            value={newOffspringData.remarks}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, remarks: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                            rows="2"
                                                            placeholder="Optional notes"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500 mb-3">
                                                    Autofilled: Species ({sire?.species}), Birth Date ({new Date(litter.birthDate).toLocaleDateString()}), Parents ({litter.sireId_public} × {litter.damId_public})
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSaveNewOffspring}
                                                        className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-black font-semibold px-4 py-2 rounded-lg"
                                                    >
                                                        <Plus size={16} />
                                                        Save Offspring
                                                    </button>
                                                    <button
                                                        onClick={() => setAddingOffspring(null)}
                                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAddOffspringToLitter(litter)}
                                                className="flex items-center gap-1 bg-accent hover:bg-accent/90 text-white font-semibold px-3 py-2 rounded-lg text-sm"
                                            >
                                                <Plus size={16} />
                                                Add Offspring
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Link Animals Modal */}
            {linkingAnimals && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center border-b p-4">
                            <h3 className="text-xl font-bold text-gray-800">Link Animals to Litter</h3>
                            <button onClick={() => setLinkingAnimals(false)} className="text-gray-500 hover:text-gray-800">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4">
                            {availableToLink.animals && availableToLink.animals.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No unlinked animals found with matching parents and birth date.</p>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Found {availableToLink.animals?.length || 0} unlinked animal(s) with matching parents and birth date:
                                    </p>
                                    {availableToLink.animals?.map(animal => (
                                        <div key={animal.id_public} className="border rounded-lg p-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">
                                                    {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {animal.id_public} • {animal.gender} • {animal.species}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleAddToLitter(animal.id_public)}
                                                className="bg-primary hover:bg-primary/90 text-black font-semibold px-3 py-1 rounded text-sm"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border-t p-4">
                            <button
                                onClick={() => setLinkingAnimals(false)}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const SpeciesManager = ({ speciesOptions, setSpeciesOptions, onCancel, showModalMessage, authToken, API_BASE_URL }) => {
    const [newSpeciesName, setNewSpeciesName] = useState('');
    const [newSpeciesLatinName, setNewSpeciesLatinName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Other');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [loading, setLoading] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackSpecies, setFeedbackSpecies] = useState('');
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    
    const categories = ['Rodent', 'Mammal', 'Reptile', 'Bird', 'Amphibian', 'Fish', 'Invertebrate', 'Other'];
    
    const customSpecies = speciesOptions.filter(s => !s.isDefault);
    const defaultSpecies = speciesOptions.filter(s => s.isDefault);
    
    // Filter species by category and search
    const filteredSpecies = speciesOptions.filter(s => {
        const matchesCategory = categoryFilter === 'All' || (s.category && s.category === categoryFilter);
        const matchesSearch = !searchTerm || (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });
    
    const handleAddSpecies = async (e) => {
        e.preventDefault();
        const trimmedName = newSpeciesName.trim();
        if (!trimmedName) return;
        
        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/species`,
                { 
                    name: trimmedName, 
                    latinName: newSpeciesLatinName.trim() || null,
                    category: selectedCategory 
                },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            // Add to local state
            setSpeciesOptions(prev => [...prev, response.data.species]);
            setNewSpeciesName('');
            setNewSpeciesLatinName('');
            showModalMessage('Success', `Species "${trimmedName}" added and is now available to all users!`);
        } catch (error) {
            if (error.response?.status === 409) {
                showModalMessage('Already Exists', `Species "${error.response.data.existing?.name || trimmedName}" already exists.`);
            } else {
                console.error('Failed to add species:', error);
                showModalMessage('Error', 'Failed to add species. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (!feedbackSpecies || !feedbackText.trim()) return;
        
        setFeedbackSubmitting(true);
        try {
            await axios.post(
                `${API_BASE_URL}/feedback/species`,
                {
                    species: feedbackSpecies,
                    feedback: feedbackText.trim(),
                    type: 'species-customization'
                },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            showModalMessage('Feedback Sent', 'Thank you! Your feedback will help us improve species customization.');
            setShowFeedbackModal(false);
            setFeedbackSpecies('');
            setFeedbackText('');
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            showModalMessage('Error', 'Failed to submit feedback. Please try again.');
        } finally {
            setFeedbackSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Settings size={20} className="mr-2 text-primary-dark" />
                Manage Species (Global for All Users)
            </h2>

            <form onSubmit={handleAddSpecies} className="mb-6 p-3 sm:p-4 border rounded-lg bg-gray-50 space-y-3 overflow-x-hidden">
                <div className="flex flex-col space-y-2 min-w-0">
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
                        <input
                            type="text"
                            placeholder="Enter species name..."
                            value={newSpeciesName}
                            onChange={(e) => setNewSpeciesName(e.target.value)}
                            required
                            disabled={loading}
                            className="flex-grow p-2 border border-gray-300 rounded-lg box-border min-w-0"
                        />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            disabled={loading}
                            className="p-2 border border-gray-300 rounded-lg box-border sm:flex-shrink-0 sm:w-auto w-full"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter latin/scientific name... (optional, e.g., Mus musculus)"
                        value={newSpeciesLatinName}
                        onChange={(e) => setNewSpeciesLatinName(e.target.value)}
                        disabled={loading}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} className="mr-2" />}
                        {loading ? 'Adding...' : 'Add'}
                    </button>
                </div>
                <p className="text-xs text-gray-500">💡 Species you add will be available to all users globally! Include the scientific name if known.</p>
            </form>

            <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:space-x-3 overflow-x-hidden">
                <input
                    type="text"
                    placeholder="Search species..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-lg box-border min-w-0"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg box-border sm:flex-shrink-0 sm:w-auto w-full"
                >
                    <option value="All">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Available Species ({filteredSpecies.length})</h3>
                
                {filteredSpecies.length === 0 ? (
                    <p className="text-sm text-gray-500 p-2">No species found matching your filters.</p>
                ) : (
                    filteredSpecies.map(species => (
                        <div key={species._id || species.name} className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm">
                            <div>
                                <span className="font-medium text-gray-800">{species.name}</span>
                                {species.latinName && (
                                    <div className="text-xs italic text-gray-600">{species.latinName}</div>
                                )}
                                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">{species.category}</span>
                                {species.isDefault && <span className="ml-2 text-xs bg-primary text-black px-2 py-1 rounded">Default</span>}
                            </div>
                            {species.isDefault ? (
                                <span className="text-sm text-gray-400">Locked</span>
                            ) : (
                                <span className="text-xs text-gray-500">Added by community</span>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-6 border-t pt-4 flex justify-between items-center">
                <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="flex items-center text-purple-600 hover:text-purple-700 transition font-medium"
                >
                    <Mail size={18} className="mr-1" /> Request Species Customization
                </button>
                <button
                    onClick={onCancel}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition"
                >
                    <ArrowLeft size={18} className="mr-1" /> Back to Selector
                </button>
            </div>

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Request Species Customization</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Let us know if a species needs different or additional fields (e.g., "Morph" instead of "Color/Coat" for snakes, or missing fields like "Pattern")
                        </p>
                        
                        <form onSubmit={handleSubmitFeedback} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                                <select
                                    value={feedbackSpecies}
                                    onChange={(e) => setFeedbackSpecies(e.target.value)}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Select a species...</option>
                                    {speciesOptions.map(s => (
                                        <option key={s._id || s.name} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    What fields need to be different or added?
                                </label>
                                <textarea
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    required
                                    rows={4}
                                    placeholder='Example: For snakes, replace "Color" and "Coat" with "Morph", and add a "Pattern" field'
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowFeedbackModal(false);
                                        setFeedbackSpecies('');
                                        setFeedbackText('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={feedbackSubmitting}
                                    className="flex-1 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center"
                                >
                                    {feedbackSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Mail size={18} className="mr-2" />}
                                    {feedbackSubmitting ? 'Sending...' : 'Send Feedback'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const SpeciesSelector = ({ speciesOptions, onSelectSpecies, onManageSpecies, searchTerm, setSearchTerm, categoryFilter, setCategoryFilter }) => {
    const categories = ['All', 'Rodent', 'Mammal', 'Reptile', 'Bird', 'Amphibian', 'Fish', 'Invertebrate', 'Other'];
    
    // Filter species by category and search
    const filteredSpecies = speciesOptions.filter(s => {
        const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
        const matchesSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    // Sort: defaults first, then alphabetical
    const sortedSpecies = [...filteredSpecies].sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.name.localeCompare(b.name);
    });
    
    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Cat size={24} className="mr-3 text-primary-dark" />
                Select Species for New Animal
            </h2>
            
            <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <p className="text-sm text-yellow-800">
                    <span className="font-semibold">⚠️ Work in Progress:</span> All species can be selected, but species-specific details (traits, colors, coat types, etc.) are not yet implemented. Currently optimized for Mouse, Rat, and Hamster.
                </p>
            </div>
            
            <div className="mb-4 flex space-x-3">
                <input
                    type="text"
                    placeholder="Search species..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-lg"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg w-24 flex-shrink-0"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6 max-h-96 overflow-y-auto">
                {sortedSpecies.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500 p-4">No species found matching your filters.</p>
                ) : (
                    sortedSpecies.map(species => (
                        <button
                            key={species._id || species.name}
                            onClick={() => onSelectSpecies(species.name)}
                            className={`p-6 border-2 text-lg font-semibold rounded-lg transition duration-150 shadow-md relative text-center ${
                                species.isDefault 
                                    ? 'border-primary-dark bg-primary text-gray-800 hover:bg-primary/80' 
                                    : 'border-accent bg-accent text-white hover:bg-accent/80'
                            }`}
                        >
                            {species.name}
                            {species.latinName && (
                                <p className={`text-xs italic mt-1 ${species.isDefault ? 'text-gray-600' : 'text-white/80'}`}>{species.latinName}</p>
                            )}
                            {species.isDefault && (
                                <span className="absolute top-1 right-1 text-xs bg-white text-primary-dark px-1.5 py-0.5 rounded">★</span>
                            )}
                        </button>
                    ))
                )}
            </div>

            <div className="mt-8 border-t pt-4 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                    <span className="font-semibold">{sortedSpecies.length}</span> species available
                </p>
                <button
                    data-tutorial-target="add-new-species-btn"
                    onClick={onManageSpecies}
                    className="text-primary-dark hover:text-primary transition duration-150 font-medium flex items-center"
                >
                    <Settings size={18} className="mr-2" /> Add New Species
                </button>
            </div>
        </div>
    );
};


// Small helper component for animal image selection/preview
const AnimalImageUpload = ({ imageUrl, onFileChange, onDeleteImage, disabled = false, Trash2 }) => (
    <div data-tutorial-target="photo-upload-section" className="flex items-center space-x-4">
        <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border">
            <AnimalImage src={imageUrl} alt="Animal" className="w-full h-full object-cover" iconSize={36} />
        </div>
        <div className="flex-1">
            <div className="flex items-center space-x-2">
                <label className={`inline-flex items-center px-4 py-2 bg-primary text-black rounded-md cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}>
                    Change Photo
                    <input type="file" accept="image/*" onChange={onFileChange} disabled={disabled} className="hidden" />
                </label>
                {imageUrl && onDeleteImage && Trash2 && (
                    <button
                        type="button"
                        onClick={onDeleteImage}
                        disabled={disabled}
                        className={`inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-md ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                        title="Delete Image"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
            <p className="text-sm text-gray-500 mt-2">Images are automatically compressed for upload.</p>
        </div>
    </div>
);


// Compress an image File in the browser by resizing it to fit within max dimensions
// and re-encoding to JPEG (or PNG for original PNG files). GIFs are returned as-is.
// Returns a Promise that resolves to a Blob.
async function compressImageFile(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {}) {
    if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('Not an image file');
    // Reject GIFs (animations not allowed) — the server accepts PNG/JPEG only
    if (file.type === 'image/gif') throw new Error('GIF_NOT_ALLOWED');

    const img = await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
        image.onerror = (e) => { URL.revokeObjectURL(url); reject(new Error('Failed to load image for compression')); };
        image.src = url;
    });

    const origWidth = img.width;
    const origHeight = img.height;
    let targetWidth = origWidth;
    let targetHeight = origHeight;

    // Calculate target size preserving aspect ratio
    if (origWidth > maxWidth || origHeight > maxHeight) {
        const widthRatio = maxWidth / origWidth;
        const heightRatio = maxHeight / origHeight;
        const ratio = Math.min(widthRatio, heightRatio);
        targetWidth = Math.round(origWidth * ratio);
        targetHeight = Math.round(origHeight * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    // Fill background white for JPEG to avoid black background on transparent PNGs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Always output JPEG for better compatibility (especially with mobile browsers)
    const outputType = 'image/jpeg';
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
    return blob || file;
}

// Compress an image File to be under `maxBytes` if possible.
// Tries decreasing quality first, then scales down dimensions and retries.
// Returns a Blob (best-effort). Throws if input isn't an image.
async function compressImageToMaxSize(file, maxBytes = 200 * 1024, opts = {}) {
    if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('Not an image file');
    // Reject GIFs (animations not allowed) — the server accepts PNG/JPEG only
    if (file.type === 'image/gif') throw new Error('GIF_NOT_ALLOWED');

    console.log('[COMPRESSION DEBUG] Starting compression:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        targetMaxBytes: maxBytes
    });

    // Start with original dimensions limits from opts or defaults
    let { maxWidth = 1200, maxHeight = 1200, startQuality = 0.85, minQuality = 0.35, qualityStep = 0.05, minDimension = 200 } = opts;

    // Load original image to get dimensions
    const image = await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = (e) => { URL.revokeObjectURL(url); reject(new Error('Failed to load image for compression')); };
        img.src = url;
    });

    console.log('[COMPRESSION DEBUG] Original image dimensions:', {
        width: image.width,
        height: image.height,
        aspectRatio: (image.width / image.height).toFixed(3)
    });

    let targetW = Math.min(image.width, maxWidth);
    let targetH = Math.min(image.height, maxHeight);

    // Helper to run compression with given dims and quality
    const tryCompress = async (w, h, quality) => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(image, 0, 0, w, h);
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
        return blob;
    };

    // First pass: try with decreasing quality at initial dimensions
    let quality = startQuality;
    while (quality >= minQuality) {
        const blob = await tryCompress(targetW, targetH, quality);
        if (!blob) break;
        console.log('[COMPRESSION DEBUG] Quality pass:', { quality: quality.toFixed(2), blobSize: blob.size, targetW, targetH });
        if (blob.size <= maxBytes) {
            console.log('[COMPRESSION DEBUG] ✓ Success with quality reduction. Final:', { width: targetW, height: targetH, size: blob.size, quality: quality.toFixed(2) });
            return blob;
        }
        quality -= qualityStep;
    }

    // Second pass: gradually reduce dimensions while preserving aspect ratio
    const aspectRatio = image.width / image.height;
    console.log('[COMPRESSION DEBUG] Entering dimension reduction loop. AspectRatio:', aspectRatio.toFixed(3));
    while (Math.max(targetW, targetH) > minDimension) {
        // Reduce dimensions proportionally to maintain aspect ratio
        const scale = 0.8;
        targetW = Math.round(targetW * scale);
        targetH = Math.round(targetH * scale);
        
        console.log('[COMPRESSION DEBUG] Scaled down to:', { targetW, targetH });
        
        // Ensure neither dimension goes below minDimension while preserving aspect ratio
        if (Math.max(targetW, targetH) < minDimension) {
            if (aspectRatio >= 1) {
                targetW = minDimension;
                targetH = Math.round(minDimension / aspectRatio);
            } else {
                targetH = minDimension;
                targetW = Math.round(minDimension * aspectRatio);
            }
            console.log('[COMPRESSION DEBUG] Hit minimum, adjusted to:', { targetW, targetH });
        }
        
        quality = startQuality;
        while (quality >= minQuality) {
            const blob = await tryCompress(targetW, targetH, quality);
            if (!blob) break;
            if (blob.size <= maxBytes) {
                console.log('[COMPRESSION DEBUG] ✓ Success with dimension reduction. Final:', { width: targetW, height: targetH, size: blob.size, quality: quality.toFixed(2) });
                return blob;
            }
            quality -= qualityStep;
        }
    }

    // As a last resort, return the smallest we could create (use minQuality and minimum dimensions while preserving aspect ratio)
    const finalW = aspectRatio >= 1 ? minDimension : Math.round(minDimension * aspectRatio);
    const finalH = aspectRatio <= 1 ? minDimension : Math.round(minDimension / aspectRatio);
    console.log('[COMPRESSION DEBUG] ⚠ Using fallback dimensions:', { finalW, finalH, aspectRatio: aspectRatio.toFixed(3) });
    const finalBlob = await tryCompress(finalW, finalH, minQuality);
    console.log('[COMPRESSION DEBUG] Final result:', { width: finalW, height: finalH, size: finalBlob?.size });
    return finalBlob || file;
}

// Attempt to compress an image in a Web Worker (public/imageWorker.js).
// Returns a Blob on success, or null if worker not available or reports an error.
const compressImageWithWorker = (file, maxBytes = 200 * 1024, opts = {}) => {
    return new Promise((resolve, reject) => {
        // Try to create a worker pointing to the public folder path
        let worker;
        try {
            worker = new Worker('/imageWorker.js');
        } catch (e) {
            resolve(null); // Worker couldn't be created (e.g., bundler/public path issue)
            return;
        }

        const id = Math.random().toString(36).slice(2);

        const onMessage = (ev) => {
            if (!ev.data || ev.data.id !== id) return;
            if (ev.data.error) {
                worker.removeEventListener('message', onMessage);
                worker.terminate();
                resolve(null);
                return;
            }
            // Received blob
            const blob = ev.data.blob;
            worker.removeEventListener('message', onMessage);
            worker.terminate();
            resolve(blob);
        };

        worker.addEventListener('message', onMessage);

        // Post file (structured clone) to worker
        try {
            worker.postMessage({ id, file, maxBytes, opts });
        } catch (e) {
            worker.removeEventListener('message', onMessage);
            worker.terminate();
            resolve(null);
        }
    });
};

const CommunityGeneticsModal = ({ species, onClose, authToken, API_BASE_URL, showModalMessage }) => {
    const [formData, setFormData] = useState({
        genes: '',
        alleles: '',
        phenotypeInfo: '',
        references: '',
        contactEmail: ''
    });
    const [submitting, setSubmitting] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            await axios.post(
                `${API_BASE_URL}/species-genetics-feedback`,
                {
                    species,
                    ...formData,
                    submittedAt: new Date().toISOString()
                },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            showModalMessage('Thank you for your contribution! Our team will review your submission.');
            onClose();
        } catch (error) {
            console.error('Failed to submit genetics feedback:', error);
            showModalMessage('Failed to submit. Please try again later.', 'error');
        } finally {
            setSubmitting(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                        Submit Genetics Info for {species}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-blue-900">
                        Help us build a comprehensive genetics database! Share your knowledge about {species} genetics.
                        Your submission may be used to create a visual builder for this species.
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            What genes/loci exist for {species}? *
                        </label>
                        <textarea
                            required
                            value={formData.genes}
                            onChange={(e) => setFormData(prev => ({ ...prev, genes: e.target.value }))}
                            placeholder="e.g., A (Agouti), B (Brown), C (Albino), D (Dilution)..."
                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                            rows="3"
                        />
                        <p className="text-xs text-gray-500 mt-1">List the gene loci and their names</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            What are the possible allele combinations? *
                        </label>
                        <textarea
                            required
                            value={formData.alleles}
                            onChange={(e) => setFormData(prev => ({ ...prev, alleles: e.target.value }))}
                            placeholder="e.g., A: A/A, A/a, a/a&#10;B: B/B, B/b, b/b&#10;C: C/C, C/c, c/c, ch/ch, C/ch, c/ch..."
                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary font-mono text-sm"
                            rows="5"
                        />
                        <p className="text-xs text-gray-500 mt-1">List all valid allele combinations for each gene</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phenotype information (optional)
                        </label>
                        <textarea
                            value={formData.phenotypeInfo}
                            onChange={(e) => setFormData(prev => ({ ...prev, phenotypeInfo: e.target.value }))}
                            placeholder="e.g., A/A = Agouti color, a/a = Non-agouti/Black..."
                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                            rows="4"
                        />
                        <p className="text-xs text-gray-500 mt-1">Describe what each genotype looks like</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            References or sources (optional)
                        </label>
                        <textarea
                            value={formData.references}
                            onChange={(e) => setFormData(prev => ({ ...prev, references: e.target.value }))}
                            placeholder="e.g., Books, websites, breeding clubs, scientific papers..."
                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                            rows="2"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact email (optional)
                        </label>
                        <input
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                            placeholder="your@email.com"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        />
                        <p className="text-xs text-gray-500 mt-1">In case we have questions about your submission</p>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Genetics Info'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AnimalForm = ({ 
    formTitle,             
    animalToEdit,          
    species,               
    onSave, 
    onCancel, 
    onDelete,              
    authToken,
    showModalMessage, 
    API_BASE_URL,          // Ensure these are passed from the parent component (App)
    userProfile,           // Current user profile for default breeder
    X, 
    Search, 
    Loader2, 
    LoadingSpinner,
    PlusCircle, ArrowLeft, Save, Trash2, RotateCcw,
    GENDER_OPTIONS, STATUS_OPTIONS,
    AnimalImageUpload, // Assuming this component is defined elsewhere
    sectionPrivacy,
    toggleSectionPrivacy
}) => {
    
    // Initial state setup (using the passed props for options)
    const [formData, setFormData] = useState(
        animalToEdit ? {
            species: animalToEdit.species,
            breederyId: animalToEdit.breederyId || animalToEdit.registryCode || '',
            prefix: animalToEdit.prefix || '',
            suffix: animalToEdit.suffix || '',
            name: animalToEdit.name || '',
            gender: animalToEdit.gender || GENDER_OPTIONS[0],
            birthDate: animalToEdit.birthDate ? new Date(animalToEdit.birthDate).toISOString().substring(0, 10) : '',
            deceasedDate: animalToEdit.deceasedDate ? new Date(animalToEdit.deceasedDate).toISOString().substring(0, 10) : '',
            status: animalToEdit.status || 'Pet',
            color: animalToEdit.color || '',
            coat: animalToEdit.coat || '',
			earset: animalToEdit.earset || '', 
            remarks: animalToEdit.remarks || '',
            tags: animalToEdit.tags || [],
            geneticCode: animalToEdit.geneticCode || '',
            fatherId_public: animalToEdit.fatherId_public || null,
            motherId_public: animalToEdit.motherId_public || null,
            breederId_public: animalToEdit.breederId_public || null,
            ownerName: animalToEdit.ownerName || '',
            currentOwner: animalToEdit.currentOwner || '',
            isPregnant: animalToEdit.isPregnant || false,
            isNursing: animalToEdit.isNursing || false,
            isInMating: animalToEdit.isInMating || false,
            isOwned: animalToEdit.isOwned ?? true,
            isDisplay: animalToEdit.isDisplay ?? false,
            // New fields for comprehensive mammal profile
            microchipNumber: animalToEdit.microchipNumber || '',
            pedigreeRegistrationId: animalToEdit.pedigreeRegistrationId || '',
            breed: animalToEdit.breed || '',
            strain: animalToEdit.strain || '',
            coatPattern: animalToEdit.coatPattern || '',
            bodyWeight: animalToEdit.bodyWeight || '',
            bodyLength: animalToEdit.bodyLength || '',
            heightAtWithers: animalToEdit.heightAtWithers || '',
            bodyConditionScore: animalToEdit.bodyConditionScore || '',
            origin: animalToEdit.origin || 'Captive-bred',
            isNeutered: animalToEdit.isNeutered || false,
            isInfertile: animalToEdit.isInfertile || false,
            heatStatus: animalToEdit.heatStatus || '',
            lastHeatDate: animalToEdit.lastHeatDate ? new Date(animalToEdit.lastHeatDate).toISOString().substring(0, 10) : '',
            ovulationDate: animalToEdit.ovulationDate ? new Date(animalToEdit.ovulationDate).toISOString().substring(0, 10) : '',
            matingDates: animalToEdit.matingDates || '',
            expectedDueDate: animalToEdit.expectedDueDate ? new Date(animalToEdit.expectedDueDate).toISOString().substring(0, 10) : '',
            litterCount: animalToEdit.litterCount || '',
            nursingStartDate: animalToEdit.nursingStartDate ? new Date(animalToEdit.nursingStartDate).toISOString().substring(0, 10) : '',
            weaningDate: animalToEdit.weaningDate ? new Date(animalToEdit.weaningDate).toISOString().substring(0, 10) : '',
            // Stud/Fertility fields (sire role)
            isStudAnimal: animalToEdit.isStudAnimal || false,
            fertilityStatus: animalToEdit.fertilityStatus || 'Unknown',
            lastMatingDate: animalToEdit.lastMatingDate ? new Date(animalToEdit.lastMatingDate).toISOString().substring(0, 10) : '',
            successfulMatings: animalToEdit.successfulMatings || '',
            fertilityNotes: animalToEdit.fertilityNotes || '',
            // Dam/Fertility fields (dam role)
            isDamAnimal: animalToEdit.isDamAnimal || false,
            damFertilityStatus: animalToEdit.damFertilityStatus || 'Unknown',
            lastPregnancyDate: animalToEdit.lastPregnancyDate ? new Date(animalToEdit.lastPregnancyDate).toISOString().substring(0, 10) : '',
            offspringCount: animalToEdit.offspringCount || '',
            damFertilityNotes: animalToEdit.damFertilityNotes || '',
            medicalConditions: animalToEdit.medicalConditions || '',
            allergies: animalToEdit.allergies || '',
            medications: animalToEdit.medications || '',
            vetVisits: animalToEdit.vetVisits || '',
            primaryVet: animalToEdit.primaryVet || '',
            dietType: animalToEdit.dietType || '',
            feedingSchedule: animalToEdit.feedingSchedule || '',
            supplements: animalToEdit.supplements || '',
            housingType: animalToEdit.housingType || '',
            bedding: animalToEdit.bedding || '',
            temperatureRange: animalToEdit.temperatureRange || '',
            humidity: animalToEdit.humidity || '',
            lighting: animalToEdit.lighting || '',
            noise: animalToEdit.noise || '',
            enrichment: animalToEdit.enrichment || '',
            temperament: animalToEdit.temperament || '',
            handlingTolerance: animalToEdit.handlingTolerance || '',
            socialStructure: animalToEdit.socialStructure || '',
            activityCycle: animalToEdit.activityCycle || '',
            lifeStage: animalToEdit.lifeStage || '',
            causeOfDeath: animalToEdit.causeOfDeath || '',
            necropsyResults: animalToEdit.necropsyResults || '',
            insurance: animalToEdit.insurance || '',
            legalStatus: animalToEdit.legalStatus || '',
            ownershipHistory: animalToEdit.ownershipHistory || [],
        } : {
            species: species, 
            breederyId: '',
            prefix: '',
            suffix: '',
            name: '',
            gender: 'Unknown',
            birthDate: '', 
            deceasedDate: '',
            status: 'Pet',
            color: '',
            coat: '',
			earset: '', 
            remarks: '',
            tags: [],
            geneticCode: '',
            fatherId_public: null,
            motherId_public: null,
            breederId_public: null,
            ownerName: '',
            currentOwner: '',
            isPregnant: false,
            isNursing: false,
            isInMating: false,
            isOwned: true,
            isDisplay: true,
            // New fields defaults
            microchipNumber: '',
            pedigreeRegistrationId: '',
            breed: '',
            strain: '',
            coatPattern: '',
            bodyWeight: '',
            bodyLength: '',
            heightAtWithers: '',
            bodyConditionScore: '',
            origin: 'Captive-bred',
            isNeutered: false,
            isInfertile: false,
            heatStatus: '',
            lastHeatDate: '',
            ovulationDate: '',
            matingDates: '',
            expectedDueDate: '',
            litterCount: '',
            nursingStartDate: '',
            weaningDate: '',
            // Stud/Fertility fields (sire role)
            isStudAnimal: false,
            fertilityStatus: 'Unknown',
            lastMatingDate: '',
            successfulMatings: '',
            fertilityNotes: '',
            // Dam/Fertility fields (dam role)
            isDamAnimal: false,
            damFertilityStatus: 'Unknown',
            lastPregnancyDate: '',
            offspringCount: '',
            damFertilityNotes: '',
            medicalConditions: '',
            allergies: '',
            medications: '',
            vetVisits: '',
            primaryVet: '',
            dietType: '',
            feedingSchedule: '',
            supplements: '',
            housingType: '',
            bedding: '',
            temperatureRange: '',
            humidity: '',
            lighting: '',
            noise: '',
            enrichment: '',
            temperament: '',
            handlingTolerance: '',
            socialStructure: '',
            activityCycle: '',
            lifeStage: '',
            causeOfDeath: '',
            necropsyResults: '',
            insurance: '',
            legalStatus: '',
            ownershipHistory: [],
        }
    );
    // Growth tracking state
    const [growthRecords, setGrowthRecords] = useState(
        animalToEdit?.growthRecords || []
    );
    const [measurementUnits, setMeasurementUnits] = useState({
        weight: animalToEdit?.measurementUnits?.weight || 'g',
        length: animalToEdit?.measurementUnits?.length || 'cm'
    });
    const [newMeasurement, setNewMeasurement] = useState({
        date: new Date().toISOString().substring(0, 10),
        weight: '',
        length: '',
        bcs: '',
        notes: ''
    });
    
    // Health Records with Dates
    const [vaccinationRecords, setVaccinationRecords] = useState(() => {
        // Try to parse from database field 'vaccinations' first, then fallback to 'vaccinationRecords'
        const data = animalToEdit?.vaccinations || animalToEdit?.vaccinationRecords;
        if (!data) return [];
        if (typeof data === 'string') {
            try { 
                const parsed = JSON.parse(data);
                console.log('[AnimalForm] Parsed vaccinationRecords from database:', parsed);
                return parsed;
            } catch { 
                console.error('[AnimalForm] Failed to parse vaccinationRecords:', data);
                return []; 
            }
        }
        return Array.isArray(data) ? data : [];
    });
    const [newVaccination, setNewVaccination] = useState({
        date: new Date().toISOString().substring(0, 10),
        name: '',
        notes: ''
    });
    
    const [dewormingRecordsArray, setDewormingRecordsArray] = useState(() => {
        // Parse from database field 'dewormingRecords'
        const data = animalToEdit?.dewormingRecords;
        if (!data) return [];
        if (typeof data === 'string') {
            try { 
                const parsed = JSON.parse(data);
                console.log('[AnimalForm] Parsed dewormingRecords from database:', parsed);
                return parsed;
            } catch { 
                console.error('[AnimalForm] Failed to parse dewormingRecords:', data);
                return []; 
            }
        }
        return Array.isArray(data) ? data : [];
    });
    const [newDeworming, setNewDeworming] = useState({
        date: new Date().toISOString().substring(0, 10),
        medication: '',
        notes: ''
    });
    
    const [parasiteControlRecords, setParasiteControlRecords] = useState(() => {
        // Parse from database field 'parasiteControl'
        const data = animalToEdit?.parasiteControl;
        if (!data) return [];
        if (typeof data === 'string') {
            try { 
                const parsed = JSON.parse(data);
                console.log('[AnimalForm] Parsed parasiteControl from database:', parsed);
                return parsed;
            } catch { 
                console.error('[AnimalForm] Failed to parse parasiteControl:', data);
                return []; 
            }
        }
        return Array.isArray(data) ? data : [];
    });
    const [newParasiteControl, setNewParasiteControl] = useState({
        date: new Date().toISOString().substring(0, 10),
        treatment: '',
        notes: ''
    });
    
    const [medicalConditionsArray, setMedicalConditionsArray] = useState(() => {
        const data = animalToEdit?.medicalConditions;
        if (!data) return [];
        if (typeof data === 'string') {
            try { 
                const parsed = JSON.parse(data);
                return parsed;
            } catch { 
                return []; 
            }
        }
        return Array.isArray(data) ? data : [];
    });
    const [newMedicalCondition, setNewMedicalCondition] = useState({
        name: '',
        notes: ''
    });
    
    const [allergiesArray, setAllergiesArray] = useState(() => {
        const data = animalToEdit?.allergies;
        if (!data) return [];
        if (typeof data === 'string') {
            try { 
                const parsed = JSON.parse(data);
                return parsed;
            } catch { 
                return []; 
            }
        }
        return Array.isArray(data) ? data : [];
    });
    const [newAllergy, setNewAllergy] = useState({
        name: '',
        notes: ''
    });
    
    const [medicationsArray, setMedicationsArray] = useState(() => {
        const data = animalToEdit?.medications;
        if (!data) return [];
        if (typeof data === 'string') {
            try { 
                const parsed = JSON.parse(data);
                return parsed;
            } catch { 
                return []; 
            }
        }
        return Array.isArray(data) ? data : [];
    });
    const [newMedication, setNewMedication] = useState({
        name: '',
        notes: ''
    });
    
    const [vetVisitsArray, setVetVisitsArray] = useState(() => {
        const data = animalToEdit?.vetVisits;
        if (!data) return [];
        if (typeof data === 'string') {
            try { 
                const parsed = JSON.parse(data);
                return parsed;
            } catch { 
                return []; 
            }
        }
        return Array.isArray(data) ? data : [];
    });
    const [newVetVisit, setNewVetVisit] = useState({
        date: new Date().toISOString().substring(0, 10),
        reason: '',
        notes: ''
    });
    
    const [medicalProcedureRecords, setMedicalProcedureRecords] = useState(() => {
        // Parse from database field 'medicalProcedures'
        const data = animalToEdit?.medicalProcedures;
        if (!data) return [];
        if (typeof data === 'string') {
            try { return JSON.parse(data); } catch { return []; }
        }
        return Array.isArray(data) ? data : [];
    });
    const [newProcedure, setNewProcedure] = useState({
        date: new Date().toISOString().substring(0, 10),
        name: '',
        notes: ''
    });
    
    const [labResultRecords, setLabResultRecords] = useState(() => {
        // Parse from database field 'labResults'
        const data = animalToEdit?.labResults;
        if (!data) return [];
        if (typeof data === 'string') {
            try { return JSON.parse(data); } catch { return []; }
        }
        return Array.isArray(data) ? data : [];
    });
    const [newLabResult, setNewLabResult] = useState({
        date: new Date().toISOString().substring(0, 10),
        testName: '',
        result: '',
        notes: ''
    });
    
    // Keep a ref for immediate pedigree selection (avoids lost state if user selects then immediately saves)
    const pedigreeRef = useRef({ father: (animalToEdit && animalToEdit.fatherId_public) || null, mother: (animalToEdit && animalToEdit.motherId_public) || null });
    // Small cached info for selected parents so we can show name/prefix next to CTID
    const [fatherInfo, setFatherInfo] = useState(null); // { id_public, prefix, name }
    const [motherInfo, setMotherInfo] = useState(null);
    const [breederInfo, setBreederInfo] = useState(null); // { id_public, personalName, breederName, showBreederName }
    const lastFetchedParentIds = useRef({ father: null, mother: null });

    // Helper: fetch a summary for an animal by public id. Try local (authenticated) first, then global display.
    const fetchAnimalSummary = async (idPublic) => {
        if (!idPublic) return null;
        try {
            // Try local animals endpoint with auth (returns array)
            const localResp = await axios.get(`${API_BASE_URL}/animals?id_public=${encodeURIComponent(idPublic)}`, { headers: { Authorization: `Bearer ${authToken}` } });
            if (Array.isArray(localResp.data) && localResp.data.length > 0) {
                const a = localResp.data[0];
                return { id_public: a.id_public, prefix: a.prefix || '', suffix: a.suffix || '', name: a.name || '', backendId: a._id || a.id_backend || null };
            }
        } catch (err) {
            // ignore and try global
        }

        try {
            const globalResp = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(idPublic)}`);
            if (Array.isArray(globalResp.data) && globalResp.data.length > 0) {
                const a = globalResp.data[0];
                return { id_public: a.id_public, prefix: a.prefix || '', suffix: a.suffix || '', name: a.name || '', backendId: a._id || a.id_backend || null };
            }
        } catch (err) {
            // ignore
        }
        return null;
    };

    // Helper: fetch breeder/user info by public id
    const fetchBreederInfo = async (idPublic) => {
        if (!idPublic) return null;
        try {
            const response = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${idPublic}&limit=1`);
            if (Array.isArray(response.data) && response.data.length > 0) {
                const user = response.data[0];
                return {
                    id_public: user.id_public,
                    personalName: user.personalName || '',
                    breederName: user.breederName || '',
                    showBreederName: user.showBreederName || false
                };
            }
        } catch (err) {
            console.warn('Failed to fetch breeder info:', err);
        }
        return null;
    };
    const [loading, setLoading] = useState(false);
    const [modalTarget, setModalTarget] = useState(null); 
    const [pendingParentForRole, setPendingParentForRole] = useState(null); // 'father' or 'mother' - tracks which parent role to assign to selected Intersex/Unknown animal
    const [pendingParentAnimal, setPendingParentAnimal] = useState(null); // The full animal object awaiting role assignment
    const [animalImageFile, setAnimalImageFile] = useState(null);
    const [animalImagePreview, setAnimalImagePreview] = useState(animalToEdit?.imageUrl || animalToEdit?.photoUrl || null);
    const [deleteImage, setDeleteImage] = useState(false);
    const [showCommunityGeneticsModal, setShowCommunityGeneticsModal] = useState(false);
    const [activeTab, setActiveTab] = useState(1); // Tab navigation state

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };
            
            // If deceased date is being set, automatically set status to Deceased
            if (name === 'deceasedDate' && value) {
                updated.status = 'Deceased';
            }
            // If deceased date is being cleared, don't automatically change status
            // (user might want to keep it as is)
            
            return updated;
        });
    };
    
        const handleSelectPedigree = async (idOrAnimal, assignedRole = null) => {
            const id = idOrAnimal && typeof idOrAnimal === 'object' ? idOrAnimal.id_public : idOrAnimal;
            
            // Handle breeder selection differently
            if (modalTarget === 'breeder') {
                setFormData(prev => ({ ...prev, breederId_public: id }));
                if (idOrAnimal && typeof idOrAnimal === 'object') {
                    // User object from search
                    const user = idOrAnimal;
                    const info = {
                        id_public: user.id_public,
                        personalName: user.personalName || '',
                        breederName: user.breederName || '',
                        showBreederName: user.showBreederName || false
                    };
                    setBreederInfo(info);
                } else if (id) {
                    // Fetch user info
                    try {
                        const info = await fetchBreederInfo(id);
                        setBreederInfo(info);
                    } catch (err) {
                        console.warn('Failed to fetch breeder info', err);
                    }
                } else {
                    setBreederInfo(null);
                }
                setModalTarget(null);
                return;
            }
            
            // Handle 'other-parent' case: show role selection modal if not already assigned
            if (modalTarget === 'other-parent' && !assignedRole) {
                if (idOrAnimal && typeof idOrAnimal === 'object') {
                    setPendingParentAnimal(idOrAnimal);
                    setModalTarget(null); // Close the search modal
                } else {
                    console.warn('Other parent selection requires animal object');
                }
                return;
            }
            
            // Determine target based on assignedRole (for 'other-parent') or modalTarget
            const effectiveTarget = assignedRole || modalTarget;
            
            // Handle parent selection
            const idKey = effectiveTarget === 'father' ? 'fatherId_public' : 'motherId_public';
            setFormData(prev => ({ ...prev, [idKey]: id }));
        // Update ref immediately so save uses the latest selection even if state update is pending
        if (effectiveTarget === 'father') {
            pedigreeRef.current.father = id;
        } else {
            pedigreeRef.current.mother = id;
        }

        // If caller passed the whole animal object, use it directly to avoid refetch
        if (idOrAnimal && typeof idOrAnimal === 'object') {
            const a = idOrAnimal;
            const info = { id_public: a.id_public, prefix: a.prefix || '', suffix: a.suffix || '', name: a.name || '', backendId: a._id || a.id_backend || null };
            if (effectiveTarget === 'father') {
                setFatherInfo(info);
                pedigreeRef.current.fatherBackendId = info.backendId;
            } else {
                setMotherInfo(info);
                pedigreeRef.current.motherBackendId = info.backendId;
            }
        } else if (id) {
            // Fetch a small summary for display (non-blocking for the user)
            try {
                console.debug('Selecting parent id:', id, 'for effectiveTarget:', effectiveTarget);
                const info = await fetchAnimalSummary(id);
                console.debug('Fetched parent summary:', info);
                if (effectiveTarget === 'father') {
                    setFatherInfo(info);
                    pedigreeRef.current.fatherBackendId = info?.backendId || null;
                }
                else {
                    setMotherInfo(info);
                    pedigreeRef.current.motherBackendId = info?.backendId || null;
                }
            } catch (err) {
                console.warn('Failed to fetch parent summary', err);
            }
        } else {
            // cleared selection
            if (effectiveTarget === 'father') setFatherInfo(null);
            else setMotherInfo(null);
        }

        setModalTarget(null);
    };

    // Clear a selected parent (father or mother)
    const clearParentSelection = (which) => {
        console.log(`[DEBUG] Clearing ${which} parent - Before:`, {
            formData: {
                fatherId_public: formData.fatherId_public,
                motherId_public: formData.motherId_public
            },
            pedigreeRef: {
                father: pedigreeRef.current.father,
                mother: pedigreeRef.current.mother,
                fatherBackendId: pedigreeRef.current.fatherBackendId,
                motherBackendId: pedigreeRef.current.motherBackendId
            }
        });
        
        if (which === 'father') {
            setFormData(prev => ({ ...prev, fatherId_public: null }));
            pedigreeRef.current.father = null;
            pedigreeRef.current.fatherBackendId = null;
            setFatherInfo(null);
        } else {
            setFormData(prev => ({ ...prev, motherId_public: null }));
            pedigreeRef.current.mother = null;
            pedigreeRef.current.motherBackendId = null;
            setMotherInfo(null);
        }
        
        console.log(`[DEBUG] Clearing ${which} parent - After:`, {
            pedigreeRef: {
                father: pedigreeRef.current.father,
                mother: pedigreeRef.current.mother,
                fatherBackendId: pedigreeRef.current.fatherBackendId,
                motherBackendId: pedigreeRef.current.motherBackendId
            }
        });
    };

    // Clear breeder selection
    const clearBreederSelection = () => {
        setFormData(prev => ({ ...prev, breederId_public: null }));
        setBreederInfo(null);
    };

    // When editing an existing animal, initialize parent and breeder info
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (animalToEdit) {
                const fId = animalToEdit.fatherId_public || null;
                const mId = animalToEdit.motherId_public || null;
                const bId = animalToEdit.breederId_public || null;
                console.log('Loading parent info for animal:', animalToEdit.id_public, 'fatherId:', fId, 'motherId:', mId, 'breederId:', bId);
                if (fId) {
                    try {
                        const info = await fetchAnimalSummary(fId);
                        console.log('Fetched father info:', info, 'for fatherId:', fId);
                        if (mounted) setFatherInfo(info);
                    } catch (e) { console.error('Failed to fetch father info:', e); }
                } else {
                    setFatherInfo(null);
                }
                if (mId) {
                    try {
                        const info = await fetchAnimalSummary(mId);
                        console.log('Fetched mother info:', info, 'for motherId:', mId);
                        if (mounted) setMotherInfo(info);
                    } catch (e) { console.error('Failed to fetch mother info:', e); }
                } else {
                    setMotherInfo(null);
                }
                if (bId) {
                    try {
                        const info = await fetchBreederInfo(bId);
                        console.log('Fetched breeder info:', info, 'for breederId:', bId);
                        if (mounted) setBreederInfo(info);
                    } catch (e) { console.error('Failed to fetch breeder info:', e); }
                } else {
                    setBreederInfo(null);
                }
            }
        })();
        return () => { mounted = false; };
    }, [animalToEdit]);

    // Fetch parent info when parent IDs change (for newly selected parents)
    useEffect(() => {
        const fetchParentNames = async () => {
            // Fetch father info only if ID changed
            if (formData.fatherId_public !== lastFetchedParentIds.current.father) {
                lastFetchedParentIds.current.father = formData.fatherId_public;
                
                if (formData.fatherId_public) {
                    try {
                        const info = await fetchAnimalSummary(formData.fatherId_public);
                        console.log('[PARENT FETCH] Fetched FATHER info for ID', formData.fatherId_public, ':', info);
                        setFatherInfo(info);
                    } catch (e) { 
                        console.error('[PARENT FETCH] Failed to fetch father info:', e);
                        setFatherInfo(null);
                    }
                } else {
                    console.log('[PARENT FETCH] Clearing father info (no ID)');
                    setFatherInfo(null);
                }
            }
            
            // Fetch mother info only if ID changed
            if (formData.motherId_public !== lastFetchedParentIds.current.mother) {
                lastFetchedParentIds.current.mother = formData.motherId_public;
                
                if (formData.motherId_public) {
                    try {
                        const info = await fetchAnimalSummary(formData.motherId_public);
                        console.log('[PARENT FETCH] Fetched MOTHER info for ID', formData.motherId_public, ':', info);
                        setMotherInfo(info);
                    } catch (e) { 
                        console.error('[PARENT FETCH] Failed to fetch mother info:', e);
                        setMotherInfo(null);
                    }
                } else {
                    console.log('[PARENT FETCH] Clearing mother info (no ID)');
                    setMotherInfo(null);
                }
            }
        };
        
        fetchParentNames();
    }, [formData.fatherId_public, formData.motherId_public]);

    const addMeasurement = () => {
        if (!newMeasurement.date || !newMeasurement.weight) {
            showModalMessage('Missing Data', 'Please enter at least a date and weight.');
            return;
        }
        const newRecord = {
            id: Date.now().toString(),
            date: newMeasurement.date,
            weight: newMeasurement.weight,
            length: newMeasurement.length || null,
            bcs: newMeasurement.bcs || null,
            notes: newMeasurement.notes || ''
        };
        setGrowthRecords([...growthRecords, newRecord]);
        setNewMeasurement({ date: '', weight: '', length: '', bcs: '', notes: '' });
    };

    // Health Record Functions
    const addVaccination = () => {
        if (!newVaccination.date || !newVaccination.name) {
            showModalMessage('Missing Data', 'Please enter at least a date and vaccination name.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            date: newVaccination.date,
            name: newVaccination.name,
            notes: newVaccination.notes || ''
        };
        setVaccinationRecords([...vaccinationRecords, record]);
        setNewVaccination({ date: new Date().toISOString().substring(0, 10), name: '', notes: '' });
    };

    const addDeworming = () => {
        if (!newDeworming.date || !newDeworming.medication) {
            showModalMessage('Missing Data', 'Please enter at least a date and medication.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            date: newDeworming.date,
            medication: newDeworming.medication,
            notes: newDeworming.notes || ''
        };
        setDewormingRecordsArray([...dewormingRecordsArray, record]);
        setNewDeworming({ date: new Date().toISOString().substring(0, 10), medication: '', notes: '' });
    };

    const addParasiteControl = () => {
        if (!newParasiteControl.date || !newParasiteControl.treatment) {
            showModalMessage('Missing Data', 'Please enter at least a date and treatment.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            date: newParasiteControl.date,
            treatment: newParasiteControl.treatment,
            notes: newParasiteControl.notes || ''
        };
        setParasiteControlRecords([...parasiteControlRecords, record]);
        setNewParasiteControl({ date: new Date().toISOString().substring(0, 10), treatment: '', notes: '' });
    };
    
    const addMedicalCondition = () => {
        if (!newMedicalCondition.name) {
            showModalMessage('Missing Data', 'Please enter a condition name.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            name: newMedicalCondition.name,
            notes: newMedicalCondition.notes || ''
        };
        setMedicalConditionsArray([...medicalConditionsArray, record]);
        setNewMedicalCondition({ name: '', notes: '' });
    };
    
    const addAllergy = () => {
        if (!newAllergy.name) {
            showModalMessage('Missing Data', 'Please enter an allergy name.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            name: newAllergy.name,
            notes: newAllergy.notes || ''
        };
        setAllergiesArray([...allergiesArray, record]);
        setNewAllergy({ name: '', notes: '' });
    };
    
    const addMedication = () => {
        if (!newMedication.name) {
            showModalMessage('Missing Data', 'Please enter a medication name.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            name: newMedication.name,
            notes: newMedication.notes || ''
        };
        setMedicationsArray([...medicationsArray, record]);
        setNewMedication({ name: '', notes: '' });
    };
    
    const addVetVisit = () => {
        if (!newVetVisit.date || !newVetVisit.reason) {
            showModalMessage('Missing Data', 'Please enter at least a date and visit reason.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            date: newVetVisit.date,
            reason: newVetVisit.reason,
            notes: newVetVisit.notes || ''
        };
        setVetVisitsArray([...vetVisitsArray, record]);
        setNewVetVisit({ date: new Date().toISOString().substring(0, 10), reason: '', notes: '' });
    };

    const addMedicalProcedure = () => {
        if (!newProcedure.date || !newProcedure.name) {
            showModalMessage('Missing Data', 'Please enter at least a date and procedure name.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            date: newProcedure.date,
            name: newProcedure.name,
            notes: newProcedure.notes || ''
        };
        setMedicalProcedureRecords([...medicalProcedureRecords, record]);
        setNewProcedure({ date: new Date().toISOString().substring(0, 10), name: '', notes: '' });
    };

    const addLabResult = () => {
        if (!newLabResult.date || !newLabResult.testName) {
            showModalMessage('Missing Data', 'Please enter at least a date and test name.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            date: newLabResult.date,
            testName: newLabResult.testName,
            result: newLabResult.result || '',
            notes: newLabResult.notes || ''
        };
        setLabResultRecords([...labResultRecords, record]);
        setNewLabResult({ date: new Date().toISOString().substring(0, 10), testName: '', result: '', notes: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const method = animalToEdit ? 'put' : 'post';
        const url = animalToEdit ? `${API_BASE_URL}/animals/${animalToEdit.id_public}` : `${API_BASE_URL}/animals`;

        try {
            // Upload animal image first (if selected)
                let uploadedFilename = null;
                if (animalImageFile) {
                console.log('[IMAGE UPLOAD] Starting upload:', {
                    fileName: animalImageFile.name,
                    fileSize: animalImageFile.size,
                    fileType: animalImageFile.type
                });
                try {
                    const fd = new FormData();
                    fd.append('file', animalImageFile);
                    fd.append('type', 'animal');
                    console.log('[IMAGE UPLOAD] Sending to:', `${API_BASE_URL}/upload`);
                    const uploadResp = await axios.post(`${API_BASE_URL}/upload`, fd, { 
                        headers: { 
                            'Content-Type': 'multipart/form-data', 
                            Authorization: `Bearer ${authToken}` 
                        },
                        timeout: 60000 // 60 second timeout
                    });
                    console.log('[IMAGE UPLOAD] Response received:', uploadResp?.status, uploadResp?.data);
                    // Build payload explicitly instead of mutating state directly
                    if (uploadResp?.data?.url) {
                        formData.imageUrl = uploadResp.data.url;
                        console.log('[IMAGE UPLOAD] URL set:', uploadResp.data.url);
                    }
                    if (uploadResp?.data?.filename) {
                        uploadedFilename = uploadResp.data.filename;
                    }
                } catch (uploadErr) {
                    console.error('[IMAGE UPLOAD] Upload failed:', {
                        message: uploadErr.message,
                        response: uploadErr?.response?.data,
                        status: uploadErr?.response?.status
                    });
                    showModalMessage('Image Upload', 'Failed to upload animal image. The record will be saved without the image.');
                }
            } else {
                console.log('[IMAGE UPLOAD] No image file to upload');
            }

            // Validate parents were alive at animal's birth date
            if (formData.birthDate && (formData.fatherId_public || formData.motherId_public)) {
                const animalBirthDate = new Date(formData.birthDate);
                
                // Check father
                if (formData.fatherId_public && fatherInfo) {
                    try {
                        // Fetch full father details to get deceased date
                        const fatherResp = await axios.get(`${API_BASE_URL}/animals?id_public=${encodeURIComponent(formData.fatherId_public)}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        const father = fatherResp.data?.[0];
                        if (father?.deceasedDate) {
                            const fatherDeceasedDate = new Date(father.deceasedDate);
                            if (fatherDeceasedDate < animalBirthDate) {
                                setLoading(false);
                                showModalMessage('Error', `Father (${father.name}) was deceased before this animal's birth date`);
                                return;
                            }
                        }
                    } catch (err) {
                        console.warn('Could not validate father deceased date:', err);
                    }
                }
                
                // Check mother
                if (formData.motherId_public && motherInfo) {
                    try {
                        // Fetch full mother details to get deceased date
                        const motherResp = await axios.get(`${API_BASE_URL}/animals?id_public=${encodeURIComponent(formData.motherId_public)}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        const mother = motherResp.data?.[0];
                        if (mother?.deceasedDate) {
                            const motherDeceasedDate = new Date(mother.deceasedDate);
                            if (motherDeceasedDate < animalBirthDate) {
                                setLoading(false);
                                showModalMessage('Error', `Mother (${mother.name}) was deceased before this animal's birth date`);
                                return;
                            }
                        }
                    } catch (err) {
                        console.warn('Could not validate mother deceased date:', err);
                    }
                }
            }

            // Prepare explicit payload to send to the API and log it for debugging
            // Merge in any immediate pedigree selections stored in `pedigreeRef` to avoid race conditions
            const payloadToSave = { ...formData };
            
            // Include growth records
            payloadToSave.growthRecords = growthRecords;
            payloadToSave.measurementUnits = measurementUnits;
            
            // Include health records - map to correct field names and serialize if needed
            payloadToSave.vaccinations = vaccinationRecords.length > 0 ? JSON.stringify(vaccinationRecords) : null;
            payloadToSave.vaccinationRecords = vaccinationRecords; // Keep for backward compat
            payloadToSave.dewormingRecords = dewormingRecordsArray.length > 0 ? JSON.stringify(dewormingRecordsArray) : null;
            payloadToSave.dewormingRecordsArray = dewormingRecordsArray; // Keep for backward compat
            payloadToSave.parasiteControl = parasiteControlRecords.length > 0 ? JSON.stringify(parasiteControlRecords) : null;
            payloadToSave.parasiteControlRecords = parasiteControlRecords; // Keep for backward compat
            payloadToSave.medicalConditions = medicalConditionsArray.length > 0 ? JSON.stringify(medicalConditionsArray) : null;
            payloadToSave.allergies = allergiesArray.length > 0 ? JSON.stringify(allergiesArray) : null;
            payloadToSave.medications = medicationsArray.length > 0 ? JSON.stringify(medicationsArray) : null;
            payloadToSave.vetVisits = vetVisitsArray.length > 0 ? JSON.stringify(vetVisitsArray) : null;
            payloadToSave.medicalProcedures = medicalProcedureRecords.length > 0 ? JSON.stringify(medicalProcedureRecords) : null;
            payloadToSave.medicalProcedureRecords = medicalProcedureRecords; // Keep for backward compat
            payloadToSave.labResults = labResultRecords.length > 0 ? JSON.stringify(labResultRecords) : null;
            payloadToSave.labResultRecords = labResultRecords; // Keep for backward compat
            
            // Debug log for health records
            console.log('[DEBUG] Health records in payload:', {
                vaccinations: payloadToSave.vaccinations,
                dewormingRecords: payloadToSave.dewormingRecords,
                parasiteControl: payloadToSave.parasiteControl,
                medicalConditions: payloadToSave.medicalConditions,
                allergies: payloadToSave.allergies,
                medications: payloadToSave.medications,
                vaccinationRecordsCount: vaccinationRecords.length,
                dewormingRecordsCount: dewormingRecordsArray.length,
                parasiteControlCount: parasiteControlRecords.length
            });
            
            // Update ownership history only when saving (not on every form change)
            if (formData.currentOwner) {
                const ownershipHistory = payloadToSave.ownershipHistory || [];
                const existingIndex = ownershipHistory.findIndex(h => h.name === formData.currentOwner);
                
                if (existingIndex >= 0) {
                    // Update existing entry - set endDate to empty (current owner)
                    ownershipHistory[existingIndex] = {
                        ...ownershipHistory[existingIndex],
                        endDate: null
                    };
                } else {
                    // Add new owner to history with today's date
                    const today = new Date().toISOString().substring(0, 10);
                    ownershipHistory.push({
                        name: formData.currentOwner,
                        startDate: today,
                        endDate: null
                    });
                }
                payloadToSave.ownershipHistory = ownershipHistory;
            }
            
            // Handle image deletion
            if (deleteImage && animalToEdit) {
                payloadToSave.imageUrl = null;
                payloadToSave.photoUrl = null;
                payloadToSave.profileImage = null;
                payloadToSave.image_path = null;
                console.log('[IMAGE DELETE] Image deletion requested');
            }
            
            // Validate deceased date: remove if it's before birth date
            if (payloadToSave.deceasedDate && payloadToSave.birthDate) {
                const birthDate = new Date(payloadToSave.birthDate);
                const deceasedDate = new Date(payloadToSave.deceasedDate);
                if (deceasedDate < birthDate) {
                    console.log('[VALIDATION] Deceased date is before birth date, removing it');
                    payloadToSave.deceasedDate = '';
                }
            }
            
            // Determine final parent values (pedigreeRef takes precedence if set, otherwise use formData)
            const finalFatherId = pedigreeRef.current.father !== undefined ? pedigreeRef.current.father : formData.fatherId_public;
            const finalMotherId = pedigreeRef.current.mother !== undefined ? pedigreeRef.current.mother : formData.motherId_public;
            
            console.log('[DEBUG] Parent removal check:', {
                pedigreeRefFather: pedigreeRef.current.father,
                pedigreeRefMother: pedigreeRef.current.mother,
                formDataFather: formData.fatherId_public,
                formDataMother: formData.motherId_public,
                finalFatherId,
                finalMotherId
            });
            
            // include backend objectIds for parents when available (but not if null - clearing)
            if (pedigreeRef.current.fatherBackendId) {
                payloadToSave.father = pedigreeRef.current.fatherBackendId;
            } else if (finalFatherId === null) {
                payloadToSave.father = null;
            }
            if (pedigreeRef.current.motherBackendId) {
                payloadToSave.mother = pedigreeRef.current.motherBackendId;
            } else if (finalMotherId === null) {
                payloadToSave.mother = null;
            }
            
            payloadToSave.fatherId_public = finalFatherId;
            payloadToSave.motherId_public = finalMotherId;

            // Include common alias fields (keep as strings to support CTU/CTC format)
            // Always send father fields (even if null to clear)
            payloadToSave.fatherId = finalFatherId;
            payloadToSave.father_id = finalFatherId;
            payloadToSave.father_public = finalFatherId;
            payloadToSave.sireId_public = finalFatherId;
            
            // Always send mother fields (even if null to clear)
            payloadToSave.motherId = finalMotherId;
            payloadToSave.mother_id = finalMotherId;
            payloadToSave.mother_public = finalMotherId;
            payloadToSave.damId_public = finalMotherId;
            
            console.log('[DEBUG] Final payload parent fields:', {
                fatherId_public: payloadToSave.fatherId_public,
                motherId_public: payloadToSave.motherId_public,
                sireId_public: payloadToSave.sireId_public,
                damId_public: payloadToSave.damId_public
            });
            
            console.log('[DEBUG] Breeder field in payload:', {
                breederId_public: payloadToSave.breederId_public,
                ownerName: payloadToSave.ownerName
            });

            // If an image URL was set by the upload step, also populate common alternate keys
            // so backend implementations that expect different field names still receive the URL.
            const returnedUrl = payloadToSave.imageUrl || payloadToSave.photoUrl || payloadToSave.profileImage || payloadToSave.image_path || null;
            if (returnedUrl) {
                payloadToSave.imageUrl = payloadToSave.imageUrl || returnedUrl;
                payloadToSave.photoUrl = payloadToSave.photoUrl || returnedUrl;
                payloadToSave.profileImage = payloadToSave.profileImage || returnedUrl;
                payloadToSave.profileImageUrl = payloadToSave.profileImageUrl || returnedUrl;
                payloadToSave.image_path = payloadToSave.image_path || returnedUrl;
                payloadToSave.photo = payloadToSave.photo || returnedUrl;
                payloadToSave.image_url = payloadToSave.image_url || returnedUrl;
            }

            // Expose the final payload to the page for easy runtime inspection in DevTools
            try {
                try {
                    window.__lastAnimalPayload = payloadToSave;
                    console.debug('window.__lastAnimalPayload set (inspect in console)');
                } catch (exposeErr) {
                    console.warn('Could not set window.__lastAnimalPayload:', exposeErr);
                }
                console.debug('Animal payload about to be saved:', payloadToSave);

                await onSave(method, url, payloadToSave);
            } catch (saveErr) {
                // If we uploaded a file but the animal save failed, attempt cleanup to avoid orphan files.
                if (uploadedFilename) {
                    try {
                        await axios.delete(`${API_BASE_URL}/upload/${uploadedFilename}`, { headers: { Authorization: `Bearer ${authToken}` } });
                    } catch (cleanupErr) {
                        console.warn('Failed to cleanup uploaded file after save failure:', cleanupErr?.response?.data || cleanupErr.message);
                    }
                }
                throw saveErr;
            }

            // Notify other parts of the app that animals changed so lists refresh
            try { window.dispatchEvent(new Event('animals-changed')); } catch (e) { /* ignore */ }

            showModalMessage('Success', `Animal ${formData.name} successfully ${animalToEdit ? 'updated' : 'added'}!`);
            onCancel(); 
        } catch (error) {
            console.error('Animal Save Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || `Failed to ${animalToEdit ? 'update' : 'add'} animal.`);
        } finally {
            setLoading(false);
        }
    };
    
    const currentId = animalToEdit?.id_public;
    const requiredGender = modalTarget === 'father' ? 'Male' : modalTarget === 'mother' ? 'Female' : modalTarget === 'other-parent' ? ['Intersex', 'Unknown'] : null;

    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg">
            {/* --- Parent Search Modal --- */}
            {modalTarget && modalTarget !== 'breeder' && modalTarget !== 'other-parent' && ( 
                <ParentSearchModal
                    title={modalTarget === 'father' ? 'Sire' : 'Dam'} 
                    currentId={currentId} 
                    onSelect={handleSelectPedigree} 
                    onClose={() => setModalTarget(null)} 
                    authToken={authToken} 
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={LoadingSpinner}
                    requiredGender={requiredGender}
                    birthDate={formData.birthDate}
                    species={formData.species}
                /> 
            )}

            {/* --- Other Parent Search Modal (Intersex/Unknown) --- */}
            {modalTarget === 'other-parent' && ( 
                <ParentSearchModal
                    title="Other Parent" 
                    currentId={currentId} 
                    onSelect={handleSelectPedigree} 
                    onClose={() => setModalTarget(null)} 
                    authToken={authToken} 
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={LoadingSpinner}
                    requiredGender={requiredGender}
                    birthDate={formData.birthDate}
                    species={formData.species}
                /> 
            )}

            {/* --- Breeder Search Modal --- */}
            {modalTarget === 'breeder' && (
                <UserSearchModal
                    onClose={() => setModalTarget(null)}
                    onSelectUser={handleSelectPedigree}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    modalTarget={modalTarget}
                    userProfile={userProfile}
                />
            )}

            {/* --- Parent Role Selection Modal (for Intersex/Unknown) --- */}
            {pendingParentAnimal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Assign Parent Role</h3>
                        <p className="text-gray-600 mb-6">
                            {pendingParentAnimal.prefix && `${pendingParentAnimal.prefix} `}
                            {pendingParentAnimal.name}
                            {pendingParentAnimal.suffix && ` ${pendingParentAnimal.suffix}`}
                            <br />
                            <span className="text-sm text-gray-500">({pendingParentAnimal.id_public})</span>
                        </p>
                        <p className="text-gray-700 mb-4 font-medium">
                            How would you like to assign this {pendingParentAnimal.gender} animal?
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setPendingParentForRole('father');
                                    handleSelectPedigree(pendingParentAnimal, 'father');
                                    setPendingParentAnimal(null);
                                    setPendingParentForRole(null);
                                }}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                            >
                                As Sire
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setPendingParentForRole('mother');
                                    handleSelectPedigree(pendingParentAnimal, 'mother');
                                    setPendingParentAnimal(null);
                                    setPendingParentForRole(null);
                                }}
                                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                            >
                                As Dam
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setPendingParentAnimal(null);
                                setPendingParentForRole(null);
                            }}
                            className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                <span>
                    <PlusCircle size={24} className="inline mr-2 text-primary" /> 
                    {formTitle}
                </span>
                <button 
                    onClick={onCancel} 
                    className="text-gray-500 hover:text-gray-700 transition duration-150 p-2 rounded-lg"
                    title="Back to List"
                >
                    <ArrowLeft size={24} />
                </button>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Tab Navigation */}
                <div className="border border-gray-300 -mx-6 px-6 pt-4">
                    <div className="flex flex-wrap gap-1 pb-px">
                        {[
                            { id: 1, label: 'Overview', icon: '📋' },
                            { id: 2, label: 'Status & Privacy', icon: '🔒' },
                            { id: 3, label: 'Physical', icon: '🎨' },
                            { id: 4, label: 'Identification', icon: '🏷️' },
                            { id: 5, label: 'Lineage', icon: '🌳' },
                            { id: 6, label: 'Breeding', icon: '🫘' },
                            { id: 7, label: 'Health', icon: '🏥' },
                            { id: 8, label: 'Husbandry', icon: '🏠' },
                            { id: 9, label: 'Behavior', icon: '🧠' },
                            { id: 10, label: 'Records', icon: '📝' },
                            { id: 11, label: 'End of Life', icon: '🕊️' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded border transition-colors ${
                                    activeTab === tab.id 
                                        ? 'bg-primary text-black border-gray-400' 
                                        : 'bg-gray-50 text-gray-600 hover:text-gray-800 border-gray-300'
                                }`}
                                title={tab.label}
                            >
                                <span className="mr-1">{tab.icon}</span>
                                <span className="hidden lg:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Tab 1: Overview - Core Identity */}
                {activeTab === 1 && (
                    <div className="space-y-6">
                        {/* Image Upload */}
                        <div>
                            <AnimalImageUpload 
                                imageUrl={animalImagePreview} 
                                onFileChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const original = e.target.files[0];
                                        try {
                                            let compressedBlob = null;
                                            try {
                                                compressedBlob = await compressImageWithWorker(original, 200 * 1024, { maxWidth: 1200, maxHeight: 1200, startQuality: 0.85 });
                                            } catch (werr) {
                                                compressedBlob = null;
                                            }
                                            if (!compressedBlob) {
                                                try {
                                                    compressedBlob = await compressImageToMaxSize(original, 200 * 1024, { maxWidth: 1200, maxHeight: 1200, startQuality: 0.85 });
                                                } catch (err) {
                                                    compressedBlob = await compressImageFile(original, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
                                                }
                                            }
                                            const baseName = original.name.replace(/\.[^/.]+$/, '') || 'image';
                                            const compressedFile = new File([compressedBlob], `${baseName}.jpg`, { type: 'image/jpeg' });
                                            if (compressedBlob.size > 200 * 1024) {
                                                showModalMessage('Image Compression', 'Image was compressed but is still larger than 200KB.');
                                            }
                                            setAnimalImageFile(compressedFile);
                                            setAnimalImagePreview(URL.createObjectURL(compressedFile));
                                        } catch (err) {
                                            setAnimalImageFile(original);
                                            setAnimalImagePreview(URL.createObjectURL(original));
                                        }
                                    }
                                }}
                                onDeleteImage={() => {
                                    setAnimalImageFile(null);
                                    setAnimalImagePreview(null);
                                    setDeleteImage(true);
                                }}
                                disabled={loading}
                                Trash2={Trash2}
                            />
                        </div>
                        
                        {/* Identity Fields */}
                        <div data-tutorial-target="general-info-container" className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Identity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Prefix</label>
                                    <input type="text" name="prefix" value={formData.prefix} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name*</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Suffix</label>
                                    <input type="text" name="suffix" value={formData.suffix} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender*</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} required 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth*</label>
                                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} min="1800-01-01" max={new Date().toISOString().split('T')[0]} required 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Status*</label>
                                    <select name="status" value={formData.status} onChange={handleChange} required 
                                        data-tutorial-target="status-dropdown"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        <option value="Pet">Pet - Personal animal, not for breeding/sale</option>
                                        <option value="Breeder">Breeder - Active breeding animal</option>
                                        <option value="Available">Available - For sale (shown in public showcase)</option>
                                        <option value="Sold">Sold - Sold to new owner</option>
                                        <option value="Retired">Retired - No longer breeding</option>
                                        <option value="Deceased">Deceased - Animal has passed away</option>
                                        <option value="Rehomed">Rehomed - Given to new home</option>
                                        <option value="Unknown">Unknown</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Status controls visibility and business features. "Available" + Public = Appears in showcase.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Tab 2: Status & Privacy */}
                {activeTab === 2 && (
                    <div className="space-y-6">
                        {/* Ownership */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Ownership</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition">
                                    <input type="checkbox" name="isOwned" checked={formData.isOwned} onChange={handleChange} 
                                        className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
                                    <span className="text-sm font-medium text-gray-700">Currently Owned by Me</span>
                                </label>
                            </div>
                            
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Breeder</label>
                                <div 
                                    onClick={() => !loading && setModalTarget('breeder')}
                                    className="flex flex-col items-start p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-primary transition"
                                >
                                    <div className="flex items-center space-x-2 w-full">
                                        {formData.breederId_public && breederInfo ? (
                                            <span className="text-gray-800">
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
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">
                                                {formData.breederId_public ? 'Loading...' : 'Click to Select Breeder'}
                                            </span>
                                        )}
                                        {formData.breederId_public && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); clearBreederSelection(); }}
                                                title="Clear breeder selection"
                                                className="text-sm text-red-500 hover:text-red-700 p-1 rounded"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Current Owner */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Current Owner</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('owner')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.owner ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.owner ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Owner Name</label>
                                <input 
                                    type="text" 
                                    name="currentOwner" 
                                    value={formData.currentOwner} 
                                    onChange={handleChange}
                                    placeholder="Name of current owner"
                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                />
                                <p className="text-xs text-gray-500 mt-1">Records owner changes in ownership history.</p>
                            </div>
                        </div>
                        
                        {/* Visibility */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Visibility</h3>
                            <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition">
                                <input type="checkbox" name="isDisplay" checked={formData.isDisplay} onChange={handleChange} 
                                    className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
                                <span className="text-sm font-medium text-gray-700">Public Profile</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-2">Public animals with "Available" status will appear in the global showcase.</p>
                        </div>
                    </div>
                )}
                
                {/* Tab 3: Physical Profile */}
                {activeTab === 3 && (
                    <div className="space-y-6">
                        {/* Appearance */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Appearance</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('appearance')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.appearance ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.appearance ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Color</label>
                                    <input type="text" name="color" value={formData.color} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Coat Type</label>
                                    <input type="text" name="coat" value={formData.coat} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Short, Long, Rex" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Coat Pattern</label>
                                    <input type="text" name="coatPattern" value={formData.coatPattern} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Solid, Hooded, Brindle" />
                                </div>
                                
                                {(formData.species === 'Rat' || formData.species === 'Fancy Rat') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Earset</label>
                                        <input type="text" name="earset" value={formData.earset} onChange={handleChange} 
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="e.g., Standard, Dumbo" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Genetic Code */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Genetic Code</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('genetics')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.genetics ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.genetics ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            <GeneticCodeBuilder
                                species={formData.species}
                                gender={formData.gender}
                                value={formData.geneticCode}
                                onChange={(value) => setFormData(prev => ({ ...prev, geneticCode: value }))}
                                onOpenCommunityForm={() => setShowCommunityGeneticsModal(true)}
                            />
                        </div>

                        {/* Life Stage */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Life Stage</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('lifeStage')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.lifeStage ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.lifeStage ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Current Life Stage</label>
                                    <select name="lifeStage" value={formData.lifeStage} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        <option value="">Select Life Stage</option>
                                        <option value="Juvenile">Juvenile</option>
                                        <option value="Adult">Adult</option>
                                        <option value="Senior">Senior</option>
                                        <option value="Elderly">Elderly</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Measurements & Growth Tracking */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Measurements & Growth Tracking</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('measurements')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.measurements ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.measurements ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            
                            {/* Current Measurement Display */}
                            {growthRecords.length > 0 && (() => {
                                const sorted = [...growthRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
                                const mostRecentWeight = sorted[0];
                                const mostRecentLength = sorted.find(r => r.length);
                                
                                return (
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Measurements</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                            <div>
                                                <span className="text-xs text-gray-600">Weight:</span>
                                                <p className="font-medium">{mostRecentWeight.weight} {measurementUnits.weight}</p>
                                            </div>
                                            {mostRecentLength && mostRecentLength.length && (
                                                <div>
                                                    <span className="text-xs text-gray-600">Length:</span>
                                                    <p className="font-medium">{mostRecentLength.length} {measurementUnits.length}</p>
                                                </div>
                                            )}
                                            {mostRecentWeight.bcs && (
                                                <div>
                                                    <span className="text-xs text-gray-600">BCS:</span>
                                                    <p className="font-medium">{mostRecentWeight.bcs}</p>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-xs text-gray-600">Date:</span>
                                                <p className="font-medium">{mostRecentWeight.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Growth Curve Chart */}
                            {growthRecords.length > 1 && (() => {
                                const sorted = [...growthRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
                                const weights = sorted.map(r => parseFloat(r.weight) || 0).filter(w => w > 0);
                                
                                if (weights.length < 2) return null;
                                
                                const minWeight = Math.min(...weights);
                                const maxWeight = Math.max(...weights);
                                const padding = (maxWeight - minWeight) * 0.1 || 5;
                                const chartMin = Math.max(0, minWeight - padding);
                                const chartMax = maxWeight + padding;
                                const range = chartMax - chartMin;
                                
                                const width = 500;
                                const height = 300;
                                const margin = { top: 20, right: 30, bottom: 50, left: 70 };
                                const graphWidth = width - margin.left - margin.right;
                                const graphHeight = height - margin.top - margin.bottom;
                                
                                const points = sorted.map((record, idx) => ({
                                    x: margin.left + (idx / (sorted.length - 1)) * graphWidth,
                                    y: margin.top + graphHeight - ((parseFloat(record.weight) - chartMin) / range) * graphHeight,
                                    weight: record.weight,
                                    length: record.length,
                                    bcs: record.bcs,
                                    notes: record.notes,
                                    date: record.date
                                }));
                                
                                const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                
                                return (
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Growth Curve (Weight)</h4>
                                        <svg width="100%" height="350" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: '100%' }} preserveAspectRatio="xMidYMid meet">
                                            {/* Grid lines */}
                                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                                const y = margin.top + graphHeight * (1 - ratio);
                                                const weightLabel = (chartMin + range * ratio).toFixed(1);
                                                return (
                                                    <g key={`grid-${i}`}>
                                                        <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                                                        <text x={margin.left - 12} y={y} textAnchor="end" dy="0.3em" fontSize="11" fill="#666">{weightLabel}</text>
                                                    </g>
                                                );
                                            })}
                                            
                                            {/* Axes */}
                                            <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#333" strokeWidth="2" />
                                            <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#333" strokeWidth="2" />
                                            
                                            {/* Y-axis label */}
                                            <text x={20} y={margin.top + graphHeight / 2} textAnchor="middle" fontSize="12" fill="#333" fontWeight="600" transform={`rotate(-90 20 ${margin.top + graphHeight / 2})`}>
                                                Weight ({measurementUnits.weight})
                                            </text>
                                            
                                            {/* X-axis label */}
                                            <text x={margin.left + graphWidth / 2} y={height - 8} textAnchor="middle" fontSize="12" fill="#333" fontWeight="600">
                                                Date
                                            </text>
                                            
                                            {/* X-axis date labels */}
                                            {points.map((p, i) => (
                                                i % Math.max(1, Math.floor(points.length / 5)) === 0 && (
                                                    <text key={`date-${i}`} x={p.x} y={height - margin.bottom + 25} textAnchor="middle" fontSize="10" fill="#666">
                                                        {new Date(p.date).toLocaleDateString()}
                                                    </text>
                                                )
                                            ))}
                                            
                                            {/* Curve */}
                                            <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            
                                            {/* Points */}
                                            {points.map((p, i) => {
                                                const tooltipText = [
                                                    `Date: ${new Date(p.date).toLocaleDateString()}`,
                                                    `Weight: ${p.weight} ${measurementUnits.weight}`,
                                                    p.length ? `Length: ${p.length} ${measurementUnits.length}` : null,
                                                    p.bcs ? `BCS: ${p.bcs}` : null,
                                                    p.notes ? `Notes: ${p.notes}` : null
                                                ].filter(Boolean).join('\n');
                                                
                                                // Color gradient from green (earliest) to red (latest)
                                                const colorRatio = points.length > 1 ? i / (points.length - 1) : 0;
                                                let dotColor;
                                                if (colorRatio < 0.5) {
                                                    // Green to Yellow
                                                    const t = colorRatio * 2;
                                                    const r = Math.round(144 + (255 - 144) * t);
                                                    const g = 191;
                                                    const b = Math.round(71 + (0 - 71) * t);
                                                    dotColor = `rgb(${r}, ${g}, ${b})`;
                                                } else {
                                                    // Yellow to Red
                                                    const t = (colorRatio - 0.5) * 2;
                                                    const r = 255;
                                                    const g = Math.round(191 - (191) * t);
                                                    const b = 0;
                                                    dotColor = `rgb(${r}, ${g}, ${b})`;
                                                }
                                                
                                                return (
                                                    <circle key={`point-${i}`} cx={p.x} cy={p.y} r="5" fill={dotColor} stroke="#fff" strokeWidth="2">
                                                        <title>{tooltipText}</title>
                                                    </circle>
                                                );
                                            })}
                                        </svg>
                                        <p className="text-xs text-gray-500 mt-2">Hover over points to see full measurement details including length, BCS, and notes.</p>
                                    </div>
                                );
                            })()}
                            
                            {/* Growth Records */}
                            <div className="space-y-3 mt-6">
                                <h4 className="text-sm font-semibold text-gray-600">Growth History</h4>
                                
                                {/* Unit Selection */}
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <p className="text-xs font-medium text-gray-700 mb-2">Measurement Units</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Weight Unit</label>
                                            <select 
                                                value={measurementUnits.weight}
                                                onChange={(e) => setMeasurementUnits({...measurementUnits, weight: e.target.value})}
                                                className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white"
                                            >
                                                <option value="g">Grams (g)</option>
                                                <option value="kg">Kilograms (kg)</option>
                                                <option value="lb">Pounds (lb)</option>
                                                <option value="oz">Ounces (oz)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Length Unit</label>
                                            <select 
                                                value={measurementUnits.length}
                                                onChange={(e) => setMeasurementUnits({...measurementUnits, length: e.target.value})}
                                                className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white"
                                            >
                                                <option value="cm">Centimeters (cm)</option>
                                                <option value="m">Meters (m)</option>
                                                <option value="in">Inches (in)</option>
                                                <option value="ft">Feet (ft)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Add New Measurement */}
                                <div className="bg-white p-3 rounded-lg border border-gray-300 space-y-3">
                                    <p className="text-xs font-medium text-gray-600">Add New Measurement</p>
                                    
                                    {/* Row 1: Date, Weight, Length */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Date</label>
                                            <input 
                                                type="date" 
                                                value={newMeasurement.date}
                                                onChange={(e) => setNewMeasurement({...newMeasurement, date: e.target.value})}
                                                className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Weight ({measurementUnits.weight})</label>
                                            <input 
                                                type="number" 
                                                step="0.1"
                                                value={newMeasurement.weight}
                                                onChange={(e) => setNewMeasurement({...newMeasurement, weight: e.target.value})}
                                                placeholder={`e.g., ${measurementUnits.weight === 'g' ? '450' : measurementUnits.weight === 'kg' ? '0.45' : measurementUnits.weight === 'lb' ? '1' : '16'}`}
                                                className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Length ({measurementUnits.length}) - optional</label>
                                            <input 
                                                type="number" 
                                                step="0.1"
                                                value={newMeasurement.length}
                                                onChange={(e) => setNewMeasurement({...newMeasurement, length: e.target.value})}
                                                placeholder={`e.g., ${measurementUnits.length === 'cm' ? '20' : measurementUnits.length === 'm' ? '0.2' : measurementUnits.length === 'in' ? '8' : '0.66'}`}
                                                className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Row 2: BCS, Notes */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Body Condition Score - optional</label>
                                            <select 
                                                value={newMeasurement.bcs}
                                                onChange={(e) => setNewMeasurement({...newMeasurement, bcs: e.target.value})}
                                                className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                                <option value="">Select BCS</option>
                                                <option value="1">1 - Emaciated</option>
                                                <option value="2">2 - Thin</option>
                                                <option value="3">3 - Ideal</option>
                                                <option value="4">4 - Overweight</option>
                                                <option value="5">5 - Obese</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Notes - optional</label>
                                            <input 
                                                type="text" 
                                                value={newMeasurement.notes}
                                                onChange={(e) => setNewMeasurement({...newMeasurement, notes: e.target.value})}
                                                placeholder="e.g., pregnant, sick"
                                                className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={addMeasurement}
                                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
                                    >
                                        Add Measurement
                                    </button>
                                </div>
                                
                                {/* Measurements List */}
                                {growthRecords.length > 0 && (
                                    <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                                        {growthRecords.map((record) => (
                                            <div key={record.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 text-sm">
                                                <div className="flex gap-4 text-gray-700 flex-1">
                                                    <span className="font-medium">{record.date}</span>
                                                    <span>{record.weight} {measurementUnits.weight}</span>
                                                    {record.length && (
                                                        <span>{record.length} {measurementUnits.length}</span>
                                                    )}
                                                    {record.bcs && (
                                                        <>
                                                            <span className="mx-2">•</span>
                                                            <span className="text-gray-700">BCS: {record.bcs}</span>
                                                        </>
                                                    )}
                                                    {record.notes && (
                                                        <span className="ml-2 text-xs text-gray-500 italic">({record.notes})</span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setGrowthRecords(growthRecords.filter(r => r.id !== record.id))}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                    title="Delete measurement"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
                
                {/* Tab 4: Identification */}
                {activeTab === 4 && (
                    <div className="space-y-6">
                        {/* Identification Numbers */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Identification Numbers</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('identification')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.identification ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.identification ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Identification</label>
                                    <input type="text" name="breederyId" value={formData.breederyId} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="Breeder ID or Registry Code" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Microchip Number</label>
                                    <input type="text" name="microchipNumber" value={formData.microchipNumber} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Pedigree Registration ID</label>
                                    <input type="text" name="pedigreeRegistrationId" value={formData.pedigreeRegistrationId} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Classification */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Classification</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Species</label>
                                    <input type="text" value={formData.species} disabled 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600" />
                                    <p className="text-xs text-gray-500 mt-1">Cannot be changed after creation</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Breed</label>
                                    <input type="text" name="breed" value={formData.breed} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Strain <span className="text-xs text-gray-500">(rodents)</span></label>
                                    <input type="text" name="strain" value={formData.strain} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., C57BL/6, Wistar, Syrian" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Tags */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200" data-tutorial-target="tags-edit-section">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Lines, Enclosures, etc)</label>
                            <input 
                                type="text" 
                                placeholder="Enter tags separated by commas (e.g., Line A, Enclosure 1)" 
                                value={formData.tags.join(', ')} 
                                onChange={(e) => {
                                    const tagString = e.target.value;
                                    const newTags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                                    setFormData({ ...formData, tags: newTags });
                                }}
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                            />
                            {formData.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {formData.tags.map((tag, idx) => (
                                        <span key={idx} className="inline-flex items-center bg-primary text-black text-xs font-semibold px-3 py-1 rounded-full">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newTags = formData.tags.filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, tags: newTags });
                                                }}
                                                className="ml-2 text-black hover:text-gray-600"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Tab 5: Lineage & Origin */}
                {activeTab === 5 && (
                    <div className="space-y-6">
                        {/* Pedigree Section */}
                        <div 
                            data-tutorial-target="pedigree-section"
                            className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4"
                        >
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Pedigree: Sire and Dam 🌳</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className='flex flex-col'>
                                    <label className='text-sm font-medium text-gray-600 mb-1'>Sire (Father)</label>
                                    <div 
                                        onClick={() => !loading && setModalTarget('father')}
                                        className="flex flex-col items-start p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-primary transition disabled:opacity-50"
                                    >
                                        <div className="flex items-center space-x-2 w-full">
                                        {formData.fatherId_public && fatherInfo ? (
                                            <span className="text-gray-800">
                                                {fatherInfo.prefix && `${fatherInfo.prefix} `}{fatherInfo.name}
                                            </span>
                                        ) : (
                                            <span className={formData.fatherId_public ? "text-gray-800 font-mono" : "text-gray-400"}>
                                                {formData.fatherId_public ? `${formData.fatherId_public}` : 'Click to Select Sire'}
                                            </span>
                                        )}
                                        {formData.fatherId_public && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); clearParentSelection('father'); }}
                                                title="Clear sire selection"
                                                className="text-sm text-red-500 hover:text-red-700 p-1 rounded"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                        </div>
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <label className='text-sm font-medium text-gray-600 mb-1'>Dam (Mother)</label>
                                    <div 
                                        onClick={() => !loading && setModalTarget('mother')}
                                        className="flex flex-col items-start p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-primary transition disabled:opacity-50"
                                    >
                                        <div className="flex items-center space-x-2 w-full">
                                            {formData.motherId_public && motherInfo ? (
                                                <span className="text-gray-800">
                                                    {motherInfo.prefix && `${motherInfo.prefix} `}{motherInfo.name}
                                                </span>
                                            ) : (
                                                <span className={formData.motherId_public ? "text-gray-800 font-mono" : "text-gray-400"}>
                                                    {formData.motherId_public ? `${formData.motherId_public}` : 'Click to Select Dam'}
                                                </span>
                                            )}
                                            {formData.motherId_public && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); clearParentSelection('mother'); }}
                                                    title="Clear dam selection"
                                                    className="text-sm text-red-500 hover:text-red-700 p-1 rounded"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <label className='text-sm font-medium text-gray-600 mb-1'>Other Parent</label>
                                    <div 
                                        onClick={() => !loading && setModalTarget('other-parent')}
                                        className="flex flex-col items-start p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-primary transition disabled:opacity-50"
                                    >
                                        <div className="flex items-center space-x-2 w-full">
                                            <span className="text-gray-400">
                                                Non-binary/Unknown
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Origin Section */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Origin</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('origin')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.origin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.origin ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Origin</label>
                                    <select name="origin" value={formData.origin} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        <option value="Captive-bred">Captive-bred</option>
                                        <option value="Wild-caught">Wild-caught</option>
                                        <option value="Rescue">Rescue</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Ownership History */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Ownership History</h3>
                            <p className="text-sm text-gray-600 mb-3">Ownership changes are tracked here. Add/edit owners in the Status & Privacy tab.</p>
                            {formData.ownershipHistory && formData.ownershipHistory.length > 0 ? (
                                <div className="space-y-2">
                                    {formData.ownershipHistory.map((owner, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{owner.name}</p>
                                                <p className="text-xs text-gray-500">From: {owner.startDate || 'N/A'} {owner.endDate ? `To: ${owner.endDate}` : '(Current)'}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = formData.ownershipHistory.filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, ownershipHistory: updated });
                                                }}
                                                className="text-red-500 hover:text-red-700 p-2"
                                                title="Remove owner record"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No ownership history recorded yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab 6: Reproduction & Breeding */}
                {activeTab === 6 && (
                    <div className="space-y-6">
                        {/* Reproductive Status - Key Status Indicators */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">⚪ Reproductive Status</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('reproductive')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.reproductive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.reproductive ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition">
                                    <input
                                        type="checkbox"
                                        name="isNeutered"
                                        checked={formData.isNeutered}
                                        onChange={handleChange}
                                        className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        {formData.gender === 'Female' ? 'Spayed' : (formData.gender === 'Intersex' || formData.gender === 'Unknown') ? 'Neutered / Spayed' : 'Neutered'}
                                    </span>
                                </label>
                                
                                {!formData.isNeutered && !formData.isInfertile && (
                                    <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition">
                                        <input
                                            type="checkbox"
                                            name="isInMating"
                                            checked={formData.isInMating}
                                            onChange={handleChange}
                                            className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-gray-700">In Mating</span>
                                    </label>
                                )}

                                <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition">
                                    <input
                                        type="checkbox"
                                        name="isInfertile"
                                        checked={formData.isInfertile || false}
                                        onChange={handleChange}
                                        className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Infertile</span>
                                </label>

                                {(formData.gender === 'Female' || formData.gender === 'Intersex' || formData.gender === 'Unknown') && (
                                    <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition">
                                        <input
                                            type="checkbox"
                                            name="isPregnant"
                                            checked={formData.isPregnant}
                                            onChange={handleChange}
                                            disabled={formData.isNeutered}
                                            className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Pregnant</span>
                                    </label>
                                )}

                                {(formData.gender === 'Female' || formData.gender === 'Intersex' || formData.gender === 'Unknown') && (
                                    <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition">
                                        <input
                                            type="checkbox"
                                            name="isNursing"
                                            checked={formData.isNursing}
                                            onChange={handleChange}
                                            disabled={formData.isNeutered}
                                            className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Nursing</span>
                                    </label>
                                )}

                                {formData.gender === 'Male' && !formData.isNeutered && !formData.isInfertile && (
                                    <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition">
                                        <input
                                            type="checkbox"
                                            name="isStudAnimal"
                                            checked={formData.isStudAnimal}
                                            onChange={handleChange}
                                            disabled={formData.isNeutered || formData.isInfertile}
                                            className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Stud Animal</span>
                                    </label>
                                )}

                                {formData.gender === 'Female' && !formData.isNeutered && !formData.isInfertile && (
                                    <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition">
                                        <input
                                            type="checkbox"
                                            name="isDamAnimal"
                                            checked={formData.isDamAnimal || false}
                                            onChange={handleChange}
                                            disabled={formData.isNeutered || formData.isInfertile}
                                            className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Breeding Dam</span>
                                    </label>
                                )}

                                {(formData.gender === 'Intersex' || formData.gender === 'Unknown') && !formData.isNeutered && !formData.isInfertile && (
                                    <>
                                        <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition">
                                            <input
                                                type="checkbox"
                                                name="isStudAnimal"
                                                checked={formData.isStudAnimal}
                                                onChange={handleChange}
                                                disabled={formData.isNeutered || formData.isInfertile}
                                                className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Can Sire</span>
                                        </label>
                                        
                                        <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition">
                                            <input
                                                type="checkbox"
                                                name="isDamAnimal"
                                                checked={formData.isDamAnimal || false}
                                                onChange={handleChange}
                                                disabled={formData.isNeutered || formData.isInfertile}
                                                className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Can Bear</span>
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Estrus/Cycle - Only for females (not hidden when neutered) */}
                        {(formData.gender === 'Female' || formData.gender === 'Intersex' || formData.gender === 'Unknown') && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Estrus/Cycle</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Heat Status</label>
                                        <select name="heatStatus" value={formData.heatStatus} onChange={handleChange}
                                            disabled={formData.isNeutered}
                                            className={`block w-full p-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary ${formData.isNeutered ? 'bg-gray-100 border-gray-200' : 'border-gray-300'}`}>
                                            <option value="">Select status...</option>
                                            <option value="Pre-estrus">Pre-estrus</option>
                                            <option value="Estrus">Estrus</option>
                                            <option value="Post-estrus">Post-estrus</option>
                                            <option value="Anestrus">Anestrus</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Heat Date</label>
                                        <input type="date" name="lastHeatDate" value={formData.lastHeatDate} onChange={handleChange}
                                            disabled={formData.isNeutered}
                                            className={`block w-full p-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary ${formData.isNeutered ? 'bg-gray-100 border-gray-200' : 'border-gray-300'}`} />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ovulation Date</label>
                                        <input type="date" name="ovulationDate" value={formData.ovulationDate} onChange={handleChange}
                                            disabled={formData.isNeutered}
                                            className={`block w-full p-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary ${formData.isNeutered ? 'bg-gray-100 border-gray-200' : 'border-gray-300'}`} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mating - Hidden when neutered/spayed */}
                        {!formData.isNeutered && !formData.isInfertile && (formData.gender === 'Female' || formData.gender === 'Intersex' || formData.gender === 'Unknown' || formData.gender === 'Male') && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Mating {formData.isNeutered && <span className="text-xs font-normal text-gray-500">(History)</span>}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mating Date</label>
                                        <input type="date" name="matingDates" value={formData.matingDates} onChange={handleChange} 
                                            disabled={formData.isNeutered}
                                            className={`block w-full p-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary ${formData.isNeutered ? 'bg-gray-100 border-gray-200' : 'border-gray-300'}`}
                                            placeholder="e.g., 2025-01-15" />
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Stud Information - Only when Stud Animal/Can Sire is checked and not neutered */}
                        {!formData.isNeutered && ((formData.gender === 'Male' && formData.isStudAnimal) || (formData.gender === 'Intersex' && formData.isStudAnimal) || (formData.gender === 'Unknown' && formData.isStudAnimal)) && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex-1">Stud Information <span className="text-xs font-normal text-gray-500">(Active Status)</span></h3>
                                    {formData.gender === 'Unknown' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded ml-2 whitespace-nowrap">Sperm Fertility</span>}
                                    {formData.gender === 'Intersex' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded ml-2 whitespace-nowrap">Sire Role</span>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Sire Fertility Status <span className="text-xs text-gray-500 font-normal">(Sperm Production)</span></label>
                                        <select name="fertilityStatus" value={formData.fertilityStatus} onChange={handleChange} 
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                            <option value="Unknown">Unknown</option>
                                            <option value="Fertile">Fertile</option>
                                            <option value="Subfertile">Subfertile</option>
                                        </select>
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fertility & Genetics Notes</label>
                                        <textarea name="fertilityNotes" value={formData.fertilityNotes} onChange={handleChange} 
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="e.g., Any genetic concerns, fertility issues, or special breeding notes"
                                            rows="3" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dam Information - Only when Breeding Dam/Can Bear is checked and not neutered/spayed */}
                        {!formData.isNeutered && ((formData.gender === 'Female' && formData.isDamAnimal) || (formData.gender === 'Intersex' && formData.isDamAnimal) || (formData.gender === 'Unknown' && formData.isDamAnimal)) && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex-1">Dam Information <span className="text-xs font-normal text-gray-500">(Active Status)</span></h3>
                                    {formData.gender === 'Unknown' && <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded ml-2 whitespace-nowrap">Egg Fertility</span>}
                                    {formData.gender === 'Intersex' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded ml-2 whitespace-nowrap">Dam Role</span>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Dam Fertility Status <span className="text-xs text-gray-500 font-normal">(Egg/Gestation)</span></label>
                                        <select name="damFertilityStatus" value={formData.damFertilityStatus || formData.fertilityStatus} onChange={(e) => handleChange({target: {name: 'damFertilityStatus', value: e.target.value}})} 
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                            <option value="Unknown">Unknown</option>
                                            <option value="Fertile">Fertile</option>
                                            <option value="Subfertile">Subfertile</option>
                                        </select>
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fertility & Genetics Notes</label>
                                        <textarea name="damFertilityNotes" value={formData.damFertilityNotes || formData.fertilityNotes} onChange={(e) => handleChange({target: {name: 'damFertilityNotes', value: e.target.value}})} 
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="e.g., Any genetic concerns, fertility issues, or special breeding notes"
                                            rows="3" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Breeding History (All animals - Historical Data) */}
                        {(formData.gender === 'Male' || formData.gender === 'Female' || formData.gender === 'Intersex' || formData.gender === 'Unknown') && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center"><span className="text-blue-600 mr-2">📋</span>Breeding History <span className="text-xs font-normal text-gray-500">(Historical Data)</span></h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(formData.gender === 'Male' || formData.gender === 'Intersex' || formData.gender === 'Unknown') && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Mating Date <span className="text-xs text-gray-500 font-normal">(Sire)</span></label>
                                                <input type="date" name="lastMatingDate" value={formData.lastMatingDate} onChange={handleChange} 
                                                    className="block w-full p-2 border border-blue-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Successful Matings (Count)</label>
                                                <input type="number" name="successfulMatings" value={formData.successfulMatings} onChange={handleChange} 
                                                    className="block w-full p-2 border border-blue-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                    placeholder="Number of successful breedings" min="0" />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Total Offspring Produced</label>
                                                <input type="number" name="offspringCount" value={formData.offspringCount} onChange={handleChange} 
                                                    className="block w-full p-2 border border-blue-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                    placeholder="Total number of offspring" min="0" />
                                            </div>
                                        </>
                                    )}
                                    
                                    {(formData.gender === 'Female' || formData.gender === 'Intersex' || formData.gender === 'Unknown') && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Pregnancy Date <span className="text-xs text-gray-500 font-normal">(Dam)</span></label>
                                                <input type="date" name="lastPregnancyDate" value={formData.lastPregnancyDate || ''} onChange={handleChange} 
                                                    className="block w-full p-2 border border-blue-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Litter Count</label>
                                                <input type="number" name="litterCount" value={formData.litterCount} onChange={handleChange} 
                                                    className="block w-full p-2 border border-blue-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                    placeholder="Total number of litters" />
                                            </div>
                                            
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Total Offspring Produced</label>
                                                <input type="number" name="offspringCount" value={formData.offspringCount} onChange={handleChange} 
                                                    className="block w-full p-2 border border-blue-200 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                    placeholder="Total number of offspring" min="0" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 7: Health & Veterinary */}
                {activeTab === 7 && (
                    <div className="space-y-6">
                        {/* Preventive Care */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-6">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Health & Veterinary</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('health')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.health ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.health ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            
                            {/* Preventive Care Sub-section */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Preventive Care</h4>
                            </div>
                            
                            {/* Vaccinations */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">Vaccinations</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Date</label>
                                            <input type="date" value={newVaccination.date} onChange={(e) => setNewVaccination({...newVaccination, date: e.target.value})}
                                                className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Vaccination Name</label>
                                            <input type="text" value={newVaccination.name} onChange={(e) => setNewVaccination({...newVaccination, name: e.target.value})}
                                                placeholder="e.g., Rabies, Distemper" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Notes (optional)</label>
                                            <input type="text" value={newVaccination.notes} onChange={(e) => setNewVaccination({...newVaccination, notes: e.target.value})}
                                                placeholder="e.g., Booster, Clinic name" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addVaccination} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">
                                        Add Vaccination Record
                                    </button>
                                </div>
                                {vaccinationRecords.length > 0 && (
                                    <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                                        {vaccinationRecords.map((record) => (
                                            <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                                                <div className="flex-1">
                                                    <strong>{record.date}:</strong> {record.name}
                                                    {record.notes && <span className="text-xs text-gray-500 ml-2">({record.notes})</span>}
                                                </div>
                                                <button type="button" onClick={() => setVaccinationRecords(vaccinationRecords.filter(r => r.id !== record.id))}
                                                    className="text-red-500 hover:text-red-700 p-1" title="Delete record">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Deworming */}
                            <div className="space-y-3 border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700">Deworming Records</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Date</label>
                                            <input type="date" value={newDeworming.date} onChange={(e) => setNewDeworming({...newDeworming, date: e.target.value})}
                                                className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Medication</label>
                                            <input type="text" value={newDeworming.medication} onChange={(e) => setNewDeworming({...newDeworming, medication: e.target.value})}
                                                placeholder="e.g., Fenbendazole, Panacur" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Notes (optional)</label>
                                            <input type="text" value={newDeworming.notes} onChange={(e) => setNewDeworming({...newDeworming, notes: e.target.value})}
                                                placeholder="e.g., Dosage, vet notes" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addDeworming} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">
                                        Add Deworming Record
                                    </button>
                                </div>
                                {dewormingRecordsArray.length > 0 && (
                                    <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                                        {dewormingRecordsArray.map((record) => (
                                            <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                                                <div className="flex-1">
                                                    <strong>{record.date}:</strong> {record.medication}
                                                    {record.notes && <span className="text-xs text-gray-500 ml-2">({record.notes})</span>}
                                                </div>
                                                <button type="button" onClick={() => setDewormingRecordsArray(dewormingRecordsArray.filter(r => r.id !== record.id))}
                                                    className="text-red-500 hover:text-red-700 p-1" title="Delete record">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Parasite Control */}
                            <div className="space-y-3 border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700">Parasite Control</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Date</label>
                                            <input type="date" value={newParasiteControl.date} onChange={(e) => setNewParasiteControl({...newParasiteControl, date: e.target.value})}
                                                className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Treatment</label>
                                            <input type="text" value={newParasiteControl.treatment} onChange={(e) => setNewParasiteControl({...newParasiteControl, treatment: e.target.value})}
                                                placeholder="e.g., Flea/tick, mite treatment" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Notes (optional)</label>
                                            <input type="text" value={newParasiteControl.notes} onChange={(e) => setNewParasiteControl({...newParasiteControl, notes: e.target.value})}
                                                placeholder="e.g., Product name, vet notes" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addParasiteControl} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">
                                        Add Parasite Control Record
                                    </button>
                                </div>
                                {parasiteControlRecords.length > 0 && (
                                    <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                                        {parasiteControlRecords.map((record) => (
                                            <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                                                <div className="flex-1">
                                                    <strong>{record.date}:</strong> {record.treatment}
                                                    {record.notes && <span className="text-xs text-gray-500 ml-2">({record.notes})</span>}
                                                </div>
                                                <button type="button" onClick={() => setParasiteControlRecords(parasiteControlRecords.filter(r => r.id !== record.id))}
                                                    className="text-red-500 hover:text-red-700 p-1" title="Delete record">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Procedures & Diagnostics */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-6">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Procedures & Diagnostics</h3>
                            
                            {/* Medical Procedures */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">Medical Procedures</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Date</label>
                                            <input type="date" value={newProcedure.date} onChange={(e) => setNewProcedure({...newProcedure, date: e.target.value})}
                                                className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Procedure Name</label>
                                            <input type="text" value={newProcedure.name} onChange={(e) => setNewProcedure({...newProcedure, name: e.target.value})}
                                                placeholder="e.g., Neutering, Surgery" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Notes (optional)</label>
                                            <input type="text" value={newProcedure.notes} onChange={(e) => setNewProcedure({...newProcedure, notes: e.target.value})}
                                                placeholder="e.g., Vet clinic, outcome" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addMedicalProcedure} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">
                                        Add Procedure Record
                                    </button>
                                </div>
                                {medicalProcedureRecords.length > 0 && (
                                    <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                                        {medicalProcedureRecords.map((record) => (
                                            <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                                                <div className="flex-1">
                                                    <strong>{record.date}:</strong> {record.name}
                                                    {record.notes && <span className="text-xs text-gray-500 ml-2">({record.notes})</span>}
                                                </div>
                                                <button type="button" onClick={() => setMedicalProcedureRecords(medicalProcedureRecords.filter(r => r.id !== record.id))}
                                                    className="text-red-500 hover:text-red-700 p-1" title="Delete record">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Lab Results */}
                            <div className="space-y-3 border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700">Laboratory Results</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Date</label>
                                            <input type="date" value={newLabResult.date} onChange={(e) => setNewLabResult({...newLabResult, date: e.target.value})}
                                                className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Test Name</label>
                                            <input type="text" value={newLabResult.testName} onChange={(e) => setNewLabResult({...newLabResult, testName: e.target.value})}
                                                placeholder="e.g., Blood work, DNA test" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Result/Findings</label>
                                            <input type="text" value={newLabResult.result} onChange={(e) => setNewLabResult({...newLabResult, result: e.target.value})}
                                                placeholder="e.g., Negative, Normal, Abnormal" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Notes (optional)</label>
                                            <input type="text" value={newLabResult.notes} onChange={(e) => setNewLabResult({...newLabResult, notes: e.target.value})}
                                                placeholder="e.g., Lab name, reference range" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addLabResult} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">
                                        Add Lab Result
                                    </button>
                                </div>
                                {labResultRecords.length > 0 && (
                                    <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                                        {labResultRecords.map((record) => (
                                            <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                                                <div className="flex-1">
                                                    <strong>{record.date}:</strong> {record.testName} - {record.result}
                                                    {record.notes && <span className="text-xs text-gray-500 ml-2">({record.notes})</span>}
                                                </div>
                                                <button type="button" onClick={() => setLabResultRecords(labResultRecords.filter(r => r.id !== record.id))}
                                                    className="text-red-500 hover:text-red-700 p-1" title="Delete record">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Veterinary Care */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Medical History</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('medicalHistory')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.medicalHistory ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.medicalHistory ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            <div className="space-y-4">
                                {/* Medical Conditions */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700">Medical Conditions</h4>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Condition Name</label>
                                                <input type="text" value={newMedicalCondition.name} onChange={(e) => setNewMedicalCondition({...newMedicalCondition, name: e.target.value})}
                                                    placeholder="e.g., Diabetes, Respiratory infection" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Notes (optional)</label>
                                                <input type="text" value={newMedicalCondition.notes} onChange={(e) => setNewMedicalCondition({...newMedicalCondition, notes: e.target.value})}
                                                    placeholder="e.g., Ongoing treatment" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                        <button type="button" onClick={addMedicalCondition} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">
                                            Add Medical Condition
                                        </button>
                                    </div>
                                    {medicalConditionsArray.length > 0 && (
                                        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                                            {medicalConditionsArray.map((record) => (
                                                <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                                                    <div className="flex-1">
                                                        <strong>{record.name}</strong>
                                                        {record.notes && <span className="text-xs text-gray-500 ml-2">({record.notes})</span>}
                                                    </div>
                                                    <button type="button" onClick={() => setMedicalConditionsArray(medicalConditionsArray.filter(r => r.id !== record.id))}
                                                        className="text-red-500 hover:text-red-700 p-1" title="Delete record">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Allergies */}
                                <div className="space-y-3 border-t border-gray-200 pt-4">
                                    <h4 className="text-sm font-semibold text-gray-700">Allergies</h4>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Allergy Name</label>
                                                <input type="text" value={newAllergy.name} onChange={(e) => setNewAllergy({...newAllergy, name: e.target.value})}
                                                    placeholder="e.g., Peanuts, Penicillin" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Notes (optional)</label>
                                                <input type="text" value={newAllergy.notes} onChange={(e) => setNewAllergy({...newAllergy, notes: e.target.value})}
                                                    placeholder="e.g., Severe reaction" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                        <button type="button" onClick={addAllergy} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">
                                            Add Allergy
                                        </button>
                                    </div>
                                    {allergiesArray.length > 0 && (
                                        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                                            {allergiesArray.map((record) => (
                                                <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                                                    <div className="flex-1">
                                                        <strong>{record.name}</strong>
                                                        {record.notes && <span className="text-xs text-gray-500 ml-2">({record.notes})</span>}
                                                    </div>
                                                    <button type="button" onClick={() => setAllergiesArray(allergiesArray.filter(r => r.id !== record.id))}
                                                        className="text-red-500 hover:text-red-700 p-1" title="Delete record">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Medications */}
                                <div className="space-y-3 border-t border-gray-200 pt-4">
                                    <h4 className="text-sm font-semibold text-gray-700">Current Medications</h4>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Medication Name</label>
                                                <input type="text" value={newMedication.name} onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                                                    placeholder="e.g., Antibiotic, Pain reliever" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Notes (optional)</label>
                                                <input type="text" value={newMedication.notes} onChange={(e) => setNewMedication({...newMedication, notes: e.target.value})}
                                                    placeholder="e.g., Dosage, frequency" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                        <button type="button" onClick={addMedication} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">
                                            Add Medication
                                        </button>
                                    </div>
                                    {medicationsArray.length > 0 && (
                                        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                                            {medicationsArray.map((record) => (
                                                <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                                                    <div className="flex-1">
                                                        <strong>{record.name}</strong>
                                                        {record.notes && <span className="text-xs text-gray-500 ml-2">({record.notes})</span>}
                                                    </div>
                                                    <button type="button" onClick={() => setMedicationsArray(medicationsArray.filter(r => r.id !== record.id))}
                                                        className="text-red-500 hover:text-red-700 p-1" title="Delete record">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Veterinary Care */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Veterinary Care</h3>
                            <div className="space-y-4">
                                {/* Veterinary Visits */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700">Veterinary Visits</h4>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Date</label>
                                                <input type="date" value={newVetVisit.date} onChange={(e) => setNewVetVisit({...newVetVisit, date: e.target.value})}
                                                    className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Visit Reason</label>
                                                <input type="text" value={newVetVisit.reason} onChange={(e) => setNewVetVisit({...newVetVisit, reason: e.target.value})}
                                                    placeholder="e.g., Annual checkup, Emergency" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Notes (optional)</label>
                                                <input type="text" value={newVetVisit.notes} onChange={(e) => setNewVetVisit({...newVetVisit, notes: e.target.value})}
                                                    placeholder="e.g., Vaccines given, Diagnosis" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                        <button type="button" onClick={addVetVisit} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">
                                            Add Veterinary Visit
                                        </button>
                                    </div>
                                    {vetVisitsArray.length > 0 && (
                                        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                                            {vetVisitsArray.map((record) => (
                                                <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                                                    <div className="flex-1">
                                                        <strong>{record.date}:</strong> {record.reason}
                                                        {record.notes && <span className="text-xs text-gray-500 ml-2">({record.notes})</span>}
                                                    </div>
                                                    <button type="button" onClick={() => setVetVisitsArray(vetVisitsArray.filter(r => r.id !== record.id))}
                                                        className="text-red-500 hover:text-red-700 p-1" title="Delete record">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Veterinarian</label>
                                    <input type="text" name="primaryVet" value={formData.primaryVet} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Dr. Smith, ABC Veterinary Clinic" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 8: Nutrition & Husbandry */}
                {activeTab === 8 && (
                    <div className="space-y-6">
                        {/* Diet */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Husbandry</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('husbandry')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.husbandry ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.husbandry ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            
                            {/* Nutrition Sub-section */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Nutrition</h4>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
                                    <input type="text" name="dietType" value={formData.dietType} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Pellets, fresh vegetables, lab blocks" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Feeding Schedule</label>
                                    <textarea name="feedingSchedule" value={formData.feedingSchedule} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Morning and evening, free feeding" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Supplements</label>
                                    <textarea name="supplements" value={formData.supplements} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Vitamin D, calcium powder" />
                                </div>
                            </div>

                            {/* Husbandry Sub-section */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Husbandry</h4>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Housing Type</label>
                                    <input type="text" name="housingType" value={formData.housingType} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Wire cage, glass aquarium, multi-level enclosure" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bedding / Substrate</label>
                                    <input type="text" name="bedding" value={formData.bedding} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Aspen shavings, paper bedding, fleece liners" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Enrichment Items</label>
                                    <textarea name="enrichment" value={formData.enrichment} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Exercise wheel, tunnels, chew toys, hammocks" />
                                </div>
                            </div>
                        </div>

                        {/* Environment */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Environment</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('environment')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.environment ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.environment ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature Range</label>
                                    <input type="text" name="temperatureRange" value={formData.temperatureRange} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., 68-72°F, 20-22°C" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Humidity</label>
                                    <input type="text" name="humidity" value={formData.humidity} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., 40-60%, 50%" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Lighting</label>
                                    <input type="text" name="lighting" value={formData.lighting} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., 12:12 hour cycle, LED lights, UVB" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Noise Level</label>
                                    <input type="text" name="noise" value={formData.noise} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Quiet, moderate, high" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 9: Behavior & Welfare */}
                {activeTab === 9 && (
                    <div className="space-y-6">
                        {/* Behavior */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Behavior</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('behavior')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.behavior ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.behavior ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperament</label>
                                    <input type="text" name="temperament" value={formData.temperament} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Friendly, skittish, aggressive, calm" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Handling Tolerance</label>
                                    <input type="text" name="handlingTolerance" value={formData.handlingTolerance} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Enjoys handling, tolerates briefly, avoids contact" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Social Structure</label>
                                    <textarea name="socialStructure" value={formData.socialStructure} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Lives with 2 cage mates, solitary, dominant in group" />
                                </div>
                            </div>
                        </div>

                        {/* Activity */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Activity</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('activity')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.activity ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.activity ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Cycle</label>
                                <select name="activityCycle" value={formData.activityCycle} onChange={handleChange} 
                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                    <option value="">Select Activity Pattern</option>
                                    <option value="Diurnal">Diurnal (Active during day)</option>
                                    <option value="Nocturnal">Nocturnal (Active at night)</option>
                                    <option value="Crepuscular">Crepuscular (Active dawn/dusk)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 10: Records & Notes */}
                {activeTab === 10 && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center border-b pb-2 mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Remarks & Notes</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('remarks')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.remarks ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.remarks ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Remarks / Notes</label>
                            <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="5"
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                placeholder="General notes, observations, and records..." />
                            <p className="text-xs text-gray-500 mt-2">Future features: File attachments, change timeline, and detailed record keeping will be added here.</p>
                        </div>
                    </div>
                )}

                {/* Tab 11: End of Life & Legal */}
                {activeTab === 11 && (
                    <div className="space-y-6">
                        {/* End of Life */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">End of Life</h3>
                                <button
                                    type="button"
                                    onClick={() => toggleSectionPrivacy('endOfLife')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        sectionPrivacy[animalToEdit?.id_public]?.endOfLife ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {sectionPrivacy[animalToEdit?.id_public]?.endOfLife ? '🌍 Public' : '🔒 Private'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Death</label>
                                    <input type="date" name="deceasedDate" value={formData.deceasedDate || ''} onChange={handleChange} 
                                        min="1800-01-01" max={new Date().toISOString().split('T')[0]} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cause of Death</label>
                                    <input type="text" name="causeOfDeath" value={formData.causeOfDeath} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Natural causes, illness, injury" />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Necropsy Results</label>
                                    <textarea name="necropsyResults" value={formData.necropsyResults} onChange={handleChange} rows="3"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="Post-mortem examination findings..." />
                                </div>
                            </div>
                        </div>

                        {/* Legal / Administrative */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Legal / Administrative</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Insurance</label>
                                    <textarea name="insurance" value={formData.insurance} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Pet insurance policy details, provider, coverage" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Legal Status</label>
                                    <textarea name="legalStatus" value={formData.legalStatus} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Ownership documents, permits, registration" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Submit/Delete Buttons (always visible outside tabs) */}
                <div className="mt-8 flex justify-between items-center border-t pt-4">
                    <div className="flex space-x-4">
                        <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2">
                            <ArrowLeft size={18} />
                            <span>Back to Profile</span>
                        </button>
                            <button
                                type="submit"
                                disabled={loading}
                                data-tutorial-target="save-animal-btn"
                                onClick={(e) => {
                                    try {
                                        console.log('Save button clicked (frontend debug)');
                                        const form = e.target && e.target.closest ? e.target.closest('form') : document.querySelector('form');
                                        if (form) {
                                            console.log('form.checkValidity():', form.checkValidity());
                                            Array.from(form.elements).forEach(el => {
                                                if (el.willValidate && !el.checkValidity()) {
                                                    console.warn('INVALID FIELD:', el.name || el.id || el.placeholder, el.validity, el.value);
                                                }
                                            });
                                        }
                                    } catch (err) {
                                        console.error('Save-button debug failed', err);
                                    }
                                }}
                                className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                <span>{loading ? 'Saving...' : 'Save Animal'}</span>
                            </button>
                    </div>
                    {animalToEdit && onDelete && (
                        <button 
                            type="button"
                            data-tutorial-target="delete-animal-btn"
                            onClick={() => { 
                                // Check if this animal was transferred TO the current user (not back to original owner)
                                const isTransferredToMe = animalToEdit.originalOwnerId && userProfile && animalToEdit.originalOwnerId !== userProfile.userId_backend;
                                const confirmMessage = isTransferredToMe 
                                    ? `Return ${animalToEdit.name} to the original owner? This will remove the animal from your account.`
                                    : `Are you sure you want to delete ${animalToEdit.name}? This action cannot be undone.`;
                                if(window.confirm(confirmMessage)) { 
                                    onDelete(animalToEdit.id_public); 
                                } 
                            }} 
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2"
                        > 
                            {animalToEdit.originalOwnerId && userProfile && animalToEdit.originalOwnerId !== userProfile.userId_backend ? <RotateCcw size={18} /> : <Trash2 size={18} />}
                            <span>{animalToEdit.originalOwnerId && userProfile && animalToEdit.originalOwnerId !== userProfile.userId_backend ? 'Return Animal' : 'Delete'}</span> 
                        </button>
                    )}
                </div>
            </form>
            
            {/* Community Genetics Submission Modal */}
            {showCommunityGeneticsModal && (
                <CommunityGeneticsModal
                    species={formData.species}
                    onClose={() => setShowCommunityGeneticsModal(false)}
                    authToken={authToken}
                    API_BASE_URL={API_BASE_URL}
                    showModalMessage={showModalMessage}
                />
            )}
        </div>
    );
};

const UserProfileCard = ({ userProfile }) => {
    if (!userProfile) return null;

    const formattedCreationDate = userProfile.creationDate
        ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(userProfile.creationDate))
        : 'N/A';

    const isPersonalNameVisible = userProfile.showPersonalName ?? true;
    const isBreederNameVisible = userProfile.showBreederName ?? false;

    return (
        <div className="bg-white p-3 rounded-xl shadow-lg flex flex-col items-center text-center" style={{minWidth: '200px', maxWidth: '220px'}}>
            {/* Names at top */}
            <div className="mb-2 w-full">
                {isPersonalNameVisible && (
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                        {userProfile.personalName}
                    </h3>
                )}
                
                {(isBreederNameVisible && userProfile.breederName) && (
                    <div className="text-xs text-gray-700 font-semibold line-clamp-1">
                        {userProfile.breederName}
                    </div>
                )}

                {(!isPersonalNameVisible && !isBreederNameVisible) && (
                    <h3 className="text-xs font-bold text-gray-500">
                        (Name Hidden)
                    </h3>
                )}
            </div>

            {/* Image centered */}
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden shadow-inner mb-2">
                {(userProfile.profileImage || userProfile.profileImageUrl || userProfile.imageUrl || userProfile.avatarUrl || userProfile.avatar || userProfile.profile_image) ? (
                    <img src={userProfile.profileImage || userProfile.profileImageUrl || userProfile.imageUrl || userProfile.avatarUrl || userProfile.avatar || userProfile.profile_image} alt={userProfile.personalName} className="w-full h-full object-cover" />
                ) : (
                    <User size={32} />
                )}
            </div>

            {/* Other info below image */}
            <div className="w-full space-y-1">
                <div className="text-sm font-extrabold text-accent">
                    {userProfile.id_public}
                </div>
                
                <div className="text-xs text-gray-600">
                    {formattedCreationDate}
                </div>
            </div>
        </div>
    );
};

const ProfileEditForm = ({ userProfile, showModalMessage, onSaveSuccess, onCancel, authToken }) => {
    console.log('[ProfileEditForm] userProfile.allowMessages:', userProfile.allowMessages);
    
    const [personalName, setPersonalName] = useState(userProfile.personalName);
    const [breederName, setBreederName] = useState(userProfile.breederName || '');
    const [showPersonalName, setShowPersonalName] = useState(userProfile.showPersonalName ?? false); 
    const [showBreederName, setShowBreederName] = useState(userProfile.showBreederName ?? false); 
    const [websiteURL, setWebsiteURL] = useState(userProfile.websiteURL || '');
    const [showWebsiteURL, setShowWebsiteURL] = useState(userProfile.showWebsiteURL ?? false);
    const [showEmailPublic, setShowEmailPublic] = useState(userProfile.showEmailPublic ?? false); 
    const [showGeneticCodePublic, setShowGeneticCodePublic] = useState(userProfile.showGeneticCodePublic ?? false);
    const [showRemarksPublic, setShowRemarksPublic] = useState(userProfile.showRemarksPublic ?? false);
    const [allowMessages, setAllowMessages] = useState(userProfile.allowMessages === undefined ? true : !!userProfile.allowMessages);
    const [emailNotificationPreference, setEmailNotificationPreference] = useState(userProfile.emailNotificationPreference || 'none');
    const [country, setCountry] = useState(userProfile.country || '');

    // Keep allowMessages in sync if userProfile updates (e.g., after save or refetch)
    useEffect(() => {
        const next = userProfile.allowMessages === undefined ? true : !!userProfile.allowMessages;
        setAllowMessages(next);
        // Also sync email notification preference and country
        setEmailNotificationPreference(userProfile.emailNotificationPreference || 'none');
        setCountry(userProfile.country || '');
    }, [userProfile.allowMessages, userProfile.emailNotificationPreference, userProfile.country]);
    
    console.log('[ProfileEditForm] Initial allowMessages state:', allowMessages);

    const [profileImageFile, setProfileImageFile] = useState(null); 
    const [profileImageURL, setProfileImageURL] = useState(
        userProfile.profileImage || userProfile.profileImageUrl || userProfile.imageUrl || userProfile.avatarUrl || userProfile.avatar || userProfile.profile_image || null
    ); 
    const [profileLoading, setProfileLoading] = useState(false);

    // Keep local preview in sync when parent `userProfile` updates (e.g., after save)
    useEffect(() => {
        const img = userProfile.profileImage || userProfile.profileImageUrl || userProfile.imageUrl || userProfile.avatarUrl || userProfile.avatar || userProfile.profile_image || null;
        setProfileImageURL(img);
    }, [userProfile]);

    const [email, setEmail] = useState(userProfile.email);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [securityLoading, setSecurityLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleImageChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const original = e.target.files[0];
            try {
                const compressedBlob = await compressImageToMaxSize(original, 200 * 1024, { maxWidth: 1200, maxHeight: 1200, startQuality: 0.85 });
                const mime = compressedBlob.type || original.type;
                const baseName = original.name.replace(/\.[^/.]+$/, '');
                const ext = mime === 'image/png' ? '.png' : '.jpg';
                const compressedFile = new File([compressedBlob], `${baseName}${ext}`, { type: mime });
                if (compressedBlob.size > 200 * 1024) {
                    showModalMessage('Image Compression', 'Image was compressed but remains larger than 200KB. Consider using a smaller image for faster uploads.');
                }
                setProfileImageFile(compressedFile);
                setProfileImageURL(URL.createObjectURL(compressedFile));
            } catch (err) {
                console.warn('Profile image compression failed, using original file', err);
                setProfileImageFile(original);
                setProfileImageURL(URL.createObjectURL(original));
            }
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        
        const payload = {
            personalName: personalName,
            breederName: breederName || null,
            showPersonalName: showPersonalName,
            showBreederName: showBreederName,
            websiteURL: websiteURL || null,
            showWebsiteURL: websiteURL ? showWebsiteURL : false,
            showEmailPublic: showEmailPublic,
            showGeneticCodePublic: showGeneticCodePublic,
            showRemarksPublic: showRemarksPublic,
            allowMessages: allowMessages,
            emailNotificationPreference: emailNotificationPreference,
            country: country || null,
        };
        
        console.log('[PROFILE UPDATE] allowMessages being sent:', allowMessages, 'Type:', typeof allowMessages);
        
        console.log('[PROFILE UPDATE] Sending payload:', {
            showBreederName: payload.showBreederName,
            breederName: payload.breederName,
            showBreederNameType: typeof payload.showBreederName
        });

        try {
            let uploadSucceeded = false;
            let uploadData = null;

            if (profileImageFile) {
                try {
                    const fd = new FormData();
                    fd.append('file', profileImageFile);
                    fd.append('type', 'profile');
                    console.log('Profile: attempting upload to', `${API_BASE_URL}/upload`);
                    const uploadResp = await axios.post(`${API_BASE_URL}/upload`, fd, { headers: { Authorization: `Bearer ${authToken}` } });
                    console.log('Profile upload response:', uploadResp.status, uploadResp.data);
                    if (uploadResp?.data) {
                        uploadData = uploadResp.data;
                        const returnedUrl = uploadResp.data.url || uploadResp.data.path || (uploadResp.data.data && (uploadResp.data.data.url || uploadResp.data.data.path));
                        if (returnedUrl) {
                            payload.profileImage = returnedUrl;
                            payload.profileImageUrl = returnedUrl;
                            payload.imageUrl = returnedUrl;
                            payload.avatarUrl = returnedUrl;
                            payload.profile_image = returnedUrl;
                            uploadSucceeded = true;
                        }
                    }
                } catch (uploadErr) {
                    console.error('Profile image upload failed:', uploadErr?.response?.data || uploadErr.message);
                    showModalMessage('Image Upload', 'Upload endpoint failed — will attempt fallback save (file included in profile PUT).');
                }
            }

            if (uploadSucceeded) {
                console.log('Profile: sending JSON profile update with image URL', payload.profileImageUrl);
                const resp = await axios.put(`${API_BASE_URL}/users/profile`, payload, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                // Try to obtain updated user object from response
                const updatedUser = resp?.data?.user || resp?.data || null;
                if (onSaveSuccess) await onSaveSuccess(updatedUser);
            } else if (profileImageFile) {
                try {
                    const form = new FormData();
                    form.append('profileImage', profileImageFile);
                    form.append('avatar', profileImageFile);
                    form.append('file', profileImageFile);
                    Object.keys(payload).forEach(k => {
                        if (payload[k] !== undefined && payload[k] !== null) form.append(k, payload[k]);
                    });
                    console.log('Profile: attempting multipart PUT to users/profile with form keys:', Array.from(form.keys()));
                    const profileResp = await axios.put(`${API_BASE_URL}/users/profile`, form, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    console.log('Profile multipart PUT response:', profileResp.status, profileResp.data);
                    const updatedUser = profileResp?.data?.user || profileResp?.data || null;
                    if (onSaveSuccess) await onSaveSuccess(updatedUser);
                } catch (fmErr) {
                    console.error('Profile multipart PUT failed:', fmErr?.response?.data || fmErr.message);
                    showModalMessage('Error', 'Failed to save profile with image. See console/network logs for details.');
                    throw fmErr;
                }
            } else {
                const resp = await axios.put(`${API_BASE_URL}/users/profile`, payload, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const updatedUser = resp?.data?.user || resp?.data || null;
                if (onSaveSuccess) await onSaveSuccess(updatedUser);
            }
            showModalMessage('Success', 'Profile information updated successfully.');
            // If onSaveSuccess wasn't called with an updatedUser above, call it now without args
            if (onSaveSuccess) await onSaveSuccess(); 
        } catch (error) {
            console.error('Profile Update Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || 'Failed to update profile information.');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleEmailUpdate = async (e) => {
        e.preventDefault();
        if (email === userProfile.email) {
            showModalMessage('Info', 'Email is already set to this value.');
            return;
        }
        setSecurityLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/auth/change-email`, { newEmail: email }, { headers: { Authorization: `Bearer ${authToken}` } });
            showModalMessage('Email Changed', 'Your email has been updated. You may need to log in again with the new email.');
            await onSaveSuccess(); 
        } catch (error) {
            console.error('Email Update Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || 'Failed to update email address.');
            setEmail(userProfile.email); 
        } finally {
            setSecurityLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showModalMessage('Warning', 'All password fields are required to change your password.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            showModalMessage('Warning', 'New password and confirmation do not match.');
            return;
        }
        setPasswordLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/auth/change-password`, { currentPassword, newPassword }, { headers: { Authorization: `Bearer ${authToken}` } });
            showModalMessage('Success', 'Your password has been changed successfully. You will need to re-login with the new password.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error) {
            console.error('Password Update Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || 'Failed to change password. Check your current password.');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }
        
        setDeleteLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/users/account`, { 
                headers: { Authorization: `Bearer ${authToken}` } 
            });
            showModalMessage('Account Deleted', 'Your account and all data have been permanently deleted.');
            // Clear token and redirect to home
            localStorage.removeItem('authToken');
            window.location.href = '/';
        } catch (error) {
            console.error('Account Deletion Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || 'Failed to delete account.');
            setShowDeleteConfirm(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Settings size={24} className="mr-3 text-primary-dark" />
                    Edit Profile
                </h2>
                <button 
                    onClick={onCancel} 
                    className="flex items-center text-gray-600 hover:text-gray-800 transition" 
                    disabled={profileLoading || securityLoading || passwordLoading}
                >
                    <ArrowLeft size={18} className="mr-1" /> Back to Profile
                </button>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6 mb-8 p-4 sm:p-6 border rounded-lg bg-gray-50 overflow-x-hidden">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Public Profile Information</h3>
                
                <ProfileImagePlaceholder 
                    url={profileImageURL} 
                    onFileChange={handleImageChange} 
                    disabled={profileLoading} 
                />

                <div className="space-y-4 min-w-0">
                    <input type="text" name="personalName" placeholder="Personal Name *" value={personalName} onChange={(e) => setPersonalName(e.target.value)} required 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border" disabled={profileLoading} />
                    <input type="text" name="breederName" placeholder="Breeder Name (Optional)" value={breederName} onChange={(e) => setBreederName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border" disabled={profileLoading} />
                    <input type="url" name="websiteURL" placeholder="Website URL (Optional) e.g., https://example.com" value={websiteURL} onChange={(e) => setWebsiteURL(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border" disabled={profileLoading} />
                    
                    <select value={country} onChange={(e) => setCountry(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border" disabled={profileLoading}>
                        <option value="">Select Country (Optional)</option>
                        <option value="US">🇺🇸 United States</option>
                        <option value="CA">🇨🇦 Canada</option>
                        <option value="GB">🇬🇧 United Kingdom</option>
                        <option value="AU">🇦🇺 Australia</option>
                        <option value="NZ">🇳🇿 New Zealand</option>
                        <option value="DE">🇩🇪 Germany</option>
                        <option value="FR">🇫🇷 France</option>
                        <option value="IT">🇮🇹 Italy</option>
                        <option value="ES">🇪🇸 Spain</option>
                        <option value="NL">🇳🇱 Netherlands</option>
                        <option value="SE">🇸🇪 Sweden</option>
                        <option value="NO">🇳🇴 Norway</option>
                        <option value="DK">🇩🇰 Denmark</option>
                        <option value="CH">🇨🇭 Switzerland</option>
                        <option value="BE">🇧🇪 Belgium</option>
                        <option value="AT">🇦🇹 Austria</option>
                        <option value="PL">🇵🇱 Poland</option>
                        <option value="CZ">🇨🇿 Czech Republic</option>
                        <option value="IE">🇮🇪 Ireland</option>
                        <option value="PT">🇵🇹 Portugal</option>
                        <option value="GR">🇬🇷 Greece</option>
                        <option value="RU">🇷🇺 Russia</option>
                        <option value="JP">🇯🇵 Japan</option>
                        <option value="KR">🇰🇷 South Korea</option>
                        <option value="CN">🇨🇳 China</option>
                        <option value="IN">🇮🇳 India</option>
                        <option value="BR">🇧🇷 Brazil</option>
                        <option value="MX">🇲🇽 Mexico</option>
                        <option value="ZA">🇿🇦 South Africa</option>
                        <option value="NZ">🇳🇿 New Zealand</option>
                        <option value="SG">🇸🇬 Singapore</option>
                        <option value="HK">🇭🇰 Hong Kong</option>
                        <option value="MY">🇲🇾 Malaysia</option>
                        <option value="TH">🇹🇭 Thailand</option>
                    </select>

                    <div className="pt-2 space-y-2">
                        <h4 className="text-base font-medium text-gray-800 pt-2 border-t border-gray-200">Public Profile Visibility:</h4>
                        
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" checked={showPersonalName} onChange={(e) => setShowPersonalName(e.target.checked)} 
                                className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                            <span>Display **Personal Name** on your public profile card.</span>
                        </label>
                        
                        {breederName && (
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input type="checkbox" checked={showBreederName} onChange={(e) => setShowBreederName(e.target.checked)} 
                                    className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                                <span>Display **Breeder Name** on your public profile card.</span>
                            </label>
                        )}
                        
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" checked={showEmailPublic} onChange={(e) => setShowEmailPublic(e.target.checked)} 
                                className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                            <span>Display **Email Address** on your public profile card.</span>
                        </label>
                        
                        {websiteURL && (
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input type="checkbox" checked={showWebsiteURL} onChange={(e) => setShowWebsiteURL(e.target.checked)} 
                                    className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                                <span>Display **Website URL** on your public profile card.</span>
                            </label>
                        )}
                    </div>

                    <div className="pt-4 space-y-2 border-t border-gray-200">
                        <h4 className="text-base font-medium text-gray-800">Messaging Preferences:</h4>
                        
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" checked={allowMessages} onChange={(e) => setAllowMessages(e.target.checked)} 
                                className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                            <span>Allow other breeders to message me</span>
                        </label>
                    </div>

                    <div className="pt-4 space-y-3 border-t border-gray-200">
                        <h4 className="text-base font-medium text-gray-800">Email Notifications:</h4>
                        <p className="text-sm text-gray-600">Choose what types of notifications to receive via email:</p>
                        
                        <div className="space-y-2 pl-2">
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input 
                                    type="radio" 
                                    name="emailNotificationPreference" 
                                    value="none"
                                    checked={emailNotificationPreference === 'none'}
                                    onChange={(e) => setEmailNotificationPreference(e.target.value)}
                                    className="text-primary-dark focus:ring-primary-dark" 
                                    disabled={profileLoading} 
                                />
                                <span><strong>None</strong> - Don't send me email notifications</span>
                            </label>
                            
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input 
                                    type="radio" 
                                    name="emailNotificationPreference" 
                                    value="requestsOnly"
                                    checked={emailNotificationPreference === 'requestsOnly'}
                                    onChange={(e) => setEmailNotificationPreference(e.target.value)}
                                    className="text-primary-dark focus:ring-primary-dark" 
                                    disabled={profileLoading} 
                                />
                                <span><strong>Requests Only</strong> - Send breeder requests, transfers, and breeding requests</span>
                            </label>
                            
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input 
                                    type="radio" 
                                    name="emailNotificationPreference" 
                                    value="messagesOnly"
                                    checked={emailNotificationPreference === 'messagesOnly'}
                                    onChange={(e) => setEmailNotificationPreference(e.target.value)}
                                    className="text-primary-dark focus:ring-primary-dark" 
                                    disabled={profileLoading} 
                                />
                                <span><strong>Messages Only</strong> - Send new messages from other breeders</span>
                            </label>
                            
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input 
                                    type="radio" 
                                    name="emailNotificationPreference" 
                                    value="all"
                                    checked={emailNotificationPreference === 'all'}
                                    onChange={(e) => setEmailNotificationPreference(e.target.value)}
                                    className="text-primary-dark focus:ring-primary-dark" 
                                    disabled={profileLoading} 
                                />
                                <span><strong>All</strong> - Send all notifications by email</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={profileLoading}
                        className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {profileLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                        Save Profile Info
                    </button>
                </div>
            </form>
            
            <form onSubmit={handleEmailUpdate} className="space-y-4 mb-8 p-4 sm:p-6 border rounded-lg bg-gray-50 overflow-x-hidden">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Change Email Address</h3>
                <input type="email" placeholder="New Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border" disabled={securityLoading} />
                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={securityLoading} 
                        className="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {securityLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Mail size={20} className="mr-2" />}
                        Update Email
                    </button>
                </div>
            </form>

            <form onSubmit={handlePasswordUpdate} className="space-y-4 p-4 sm:p-6 border rounded-lg bg-gray-50 overflow-x-hidden">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Change Password</h3>
                <input type="password" placeholder="Current Password *" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border" disabled={passwordLoading} />
                <input type="password" placeholder="New Password *" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border" disabled={passwordLoading} />
                <input type="password" placeholder="Confirm New Password *" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border" disabled={passwordLoading} />
                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={passwordLoading}
                        className="bg-primary-dark hover:bg-primary text-black font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {passwordLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                        Set New Password
                    </button>
                </div>
            </form>
            
            <div className="mt-8 p-4 sm:p-6 border-2 border-red-300 rounded-lg bg-red-50 overflow-x-hidden">
                <h3 className="text-xl font-semibold text-red-800 border-b border-red-200 pb-2 mb-4">Danger Zone</h3>
                <p className="text-sm text-gray-700 mb-4">
                    Deleting your account is permanent and cannot be undone. All your animals, litters, and profile data will be permanently deleted.
                </p>
                {!showDeleteConfirm ? (
                    <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
                    >
                        <Trash2 size={18} />
                        Delete Account
                    </button>
                ) : (
                    <div className="space-y-3">
                        <p className="text-red-700 font-semibold">Are you absolutely sure? This cannot be undone!</p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {deleteLoading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                Yes, Delete Everything
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleteLoading}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const DonationView = ({ onBack }) => {
    return (
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg">
            {/* Back Button */}
            <button 
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-800 font-medium mb-6 transition"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-pink-500 to-red-500 p-3 rounded-full">
                    <Heart size={32} className="text-white fill-current" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Support CritterTrack</h1>
                    <p className="text-gray-500 text-sm">Help keep this platform running</p>
                </div>
            </div>

            {/* Description */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 rounded-lg p-6 mb-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                    CritterTrack is provided <strong>completely free of charge</strong> to all users. There are no premium tiers, 
                    paywalls, or required subscriptions. However, hosting, maintaining, and improving this platform requires resources.
                </p>
                <p className="text-gray-700 leading-relaxed">
                    If you find CritterTrack valuable for managing your breeding program, please consider supporting its 
                    continued development with a voluntary donation. Every contribution, no matter the size, helps keep this 
                    platform running and improving.
                </p>
            </div>

            {/* Personal Note */}
            <div className="bg-accent/10 border-2 border-accent/30 rounded-lg p-5 mb-6">
                <p className="text-sm text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Heart size={18} className="text-accent fill-current" />
                    A note from the developer
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                    CritterTrack is developed and maintained by a single developer who is passionate about helping breeders 
                    manage their programs effectively. Your support directly contributes to server costs, new features, 
                    and ongoing maintenance. Thank you for being part of this community!
                </p>
            </div>

            {/* Donation Options */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Choose Your Support Method</h2>
            <div className="space-y-4">
                {/* One-Time Donation */}
                <div className="border-2 border-primary/30 rounded-lg p-6 bg-gradient-to-r from-primary/5 to-accent/5 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/20 p-3 rounded-lg">
                            <DollarSign size={24} className="text-primary-dark" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">One-Time Donation</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Make a one-time contribution of any amount you choose. Perfect for showing your appreciation 
                                or celebrating a milestone in your breeding program.
                            </p>
                            <form action="https://www.paypal.com/donate" method="post" target="_blank">
                                <input type="hidden" name="business" value="mouserymorningstar@gmail.com" />
                                <input type="hidden" name="no_recurring" value="0" />
                                <input type="hidden" name="item_name" value="Support CritterTrack Development" />
                                <input type="hidden" name="currency_code" value="USD" />
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md flex items-center justify-center gap-2"
                                >
                                    <Heart size={18} />
                                    Donate via PayPal
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Monthly Subscription */}
                <div className="border-2 border-accent/30 rounded-lg p-6 bg-gradient-to-r from-accent/5 to-primary/5 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                        <div className="bg-accent/20 p-3 rounded-lg">
                            <RefreshCw size={24} className="text-accent-dark" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">Monthly Support</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Become a recurring supporter with a monthly contribution. Your ongoing support helps ensure 
                                CritterTrack's long-term sustainability. Cancel anytime through your PayPal account.
                            </p>
                            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                                <input type="hidden" name="cmd" value="_xclick-subscriptions" />
                                <input type="hidden" name="business" value="mouserymorningstar@gmail.com" />
                                <input type="hidden" name="item_name" value="CritterTrack Monthly Support" />
                                <input type="hidden" name="currency_code" value="USD" />
                                <input type="hidden" name="a3" value="5.00" />
                                <input type="hidden" name="p3" value="1" />
                                <input type="hidden" name="t3" value="M" />
                                <input type="hidden" name="src" value="1" />
                                <input type="hidden" name="sra" value="1" />
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent-dark hover:to-accent text-white font-semibold py-3 px-6 rounded-lg transition shadow-md flex items-center justify-center gap-2"
                                >
                                    <Heart size={18} className="fill-current" />
                                    Support for $5/month
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                    All donations are processed securely through PayPal. You are not required to have a PayPal account to donate. 
                    Monthly subscriptions can be cancelled at any time through your PayPal account settings.
                </p>
            </div>

            {/* Thank You */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 italic">
                    Thank you for considering supporting CritterTrack. Your generosity is deeply appreciated! ❤️
                </p>
            </div>
        </div>
    );
};

const ProfileView = ({ userProfile, showModalMessage, fetchUserProfile, authToken, onProfileUpdated, onProfileEditButtonClicked }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [checkingForUpdates, setCheckingForUpdates] = useState(false);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    // Note: Donation button is now globally available via fixed button in top-left corner

    const handleShare = () => {
        const url = `${window.location.origin}/user/${userProfile.id_public}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handleCheckForUpdates = async () => {
        setCheckingForUpdates(true);
        setUpdateAvailable(false);
        
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    console.log('[ProfileView] Manually checking for service worker updates...');
                    await registration.update();
                    console.log('[ProfileView] Update check complete');
                    
                    // Set up listener for update found event
                    const handleUpdateAvailable = () => {
                        console.log('[ProfileView] Update is available!');
                        setUpdateAvailable(true);
                        showModalMessage('Update Available', 'A new version of CritterTrack is available. Please refresh the page to update.');
                        // Remove listener after it fires
                        window.removeEventListener('sw-update-available', handleUpdateAvailable);
                    };
                    
                    window.addEventListener('sw-update-available', handleUpdateAvailable);
                    
                    // Check if update was already found (SW_UPDATE_AVAILABLE flag)
                    if (window.SW_UPDATE_AVAILABLE) {
                        handleUpdateAvailable();
                    }
                    
                    showModalMessage('Check Complete', 'CritterTrack is up to date. You\'re running the latest version!');
                } else {
                    showModalMessage('Error', 'Service worker is not installed. Please refresh the page.');
                }
            }
        } catch (error) {
            console.error('[ProfileView] Error checking for updates:', error);
            showModalMessage('Error', 'Failed to check for updates. Please try again later.');
        } finally {
            setCheckingForUpdates(false);
        }
    };

    if (!userProfile) return <LoadingSpinner />;

    if (isEditing) {
        return (
            <ProfileEditForm 
                userProfile={userProfile} 
                showModalMessage={showModalMessage} 
                onSaveSuccess={(updatedUser) => { 
                    if (updatedUser && typeof onProfileUpdated === 'function') {
                        onProfileUpdated(updatedUser);
                    } else {
                        fetchUserProfile(authToken);
                    }
                    setIsEditing(false);
                }} 
                onCancel={() => setIsEditing(false)} 
                authToken={authToken} 
            />
        );
    }

    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Settings size={24} className="mr-3 text-primary-dark" />
                    Profile Settings
                </h2>
                <button
                    onClick={handleShare}
                    className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-2"
                >
                    <Link size={16} />
                    {copySuccess ? 'Link Copied!' : 'Share Profile'}
                </button>
            </div>
            <div className="space-y-4 overflow-x-hidden">
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-x-hidden">
                    <p className="text-lg font-semibold text-gray-700 mb-3">Public Visibility Status</p>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2">
                        <span className="text-sm sm:text-base text-gray-800 truncate">Personal Name ({userProfile.personalName})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${ 
                            (userProfile.showPersonalName ?? true) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showPersonalName ?? true) ? 'Public' : 'Private'}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2">
                        <span className="text-sm sm:text-base text-gray-800 truncate">Breeder Name ({userProfile.breederName || 'N/A'})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${ 
                            (userProfile.showBreederName ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showBreederName ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2">
                        <span className="text-sm sm:text-base text-gray-800 truncate">Website URL ({userProfile.websiteURL || 'N/A'})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${ 
                            (userProfile.showWebsiteURL ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showWebsiteURL ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2">
                        <span className="text-sm sm:text-base text-gray-800 truncate">Messages</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                            (userProfile.allowMessages === true) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.allowMessages === true) ? 'Allowed' : 'Disabled'}
                        </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2">
                        <span className="text-sm sm:text-base text-gray-800 truncate">Email Address ({userProfile.email})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${ 
                            (userProfile.showEmailPublic ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showEmailPublic ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2">
                        <span className="text-sm sm:text-base text-gray-800 truncate">Genetic Code on Public Animals</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${ 
                            (userProfile.showGeneticCodePublic ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showGeneticCodePublic ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2">
                        <span className="text-sm sm:text-base text-gray-800 truncate">Remarks/Notes on Public Animals</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${ 
                            (userProfile.showRemarksPublic ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showRemarksPublic ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-x-hidden">
                    <p className="text-lg font-semibold text-gray-700">Personal ID:</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-accent truncate">{userProfile.id_public}</p>
                </div>
            </div>
            
            <button 
                onClick={() => {
                    setIsEditing(true);
                    onProfileEditButtonClicked(true);
                }}
                data-tutorial-target="profile-edit-btn"
                className="mt-6 bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 shadow-md flex items-center"
            >
                <Edit size={20} className="mr-2" /> Edit Profile
            </button>
            
            <button 
                onClick={handleCheckForUpdates}
                disabled={checkingForUpdates}
                className="mt-3 bg-primary hover:bg-primary/90 text-black font-semibold py-3 px-6 rounded-lg transition duration-150 shadow-md flex items-center disabled:opacity-50"
            >
                {checkingForUpdates ? (
                    <>
                        <Loader2 size={20} className="mr-2 animate-spin" /> Checking for Updates...
                    </>
                ) : updateAvailable ? (
                    <>
                        <CheckCircle size={20} className="mr-2 text-green-600" /> Update Available!
                    </>
                ) : (
                    <>
                        <RefreshCw size={20} className="mr-2" /> Check for Updates
                    </>
                )}
            </button>
        </div>
    );
};

const AuthView = ({ onLoginSuccess, showModalMessage, isRegister, setIsRegister, mainTitle, onShowTerms, onShowPrivacy }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [personalName, setPersonalName] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationStep, setVerificationStep] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (isRegister && !verificationStep) {
            // Step 1: Request verification code
            if (!agreedToTerms) {
                showModalMessage('Terms Required', 'You must agree to the Terms of Service and Privacy Policy to register.');
                setLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                showModalMessage('Password Mismatch', 'Passwords do not match. Please try again.');
                setLoading(false);
                return;
            }
            try {
                await axios.post(`${API_BASE_URL}/auth/register-request`, {
                    email,
                    password,
                    personalName
                });
                setVerificationStep(true);
                showModalMessage('Verification Code Sent', 'Please check your email for a 6-digit verification code.');
            } catch (error) {
                console.error('Registration request error:', error.response?.data || error.message);
                showModalMessage(
                    'Registration Failed',
                    error.response?.data?.message || 'Failed to send verification code. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        } else if (isRegister && verificationStep) {
            // Step 2: Verify code and complete registration
            try {
                const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
                    email,
                    code: verificationCode
                });
                showModalMessage('Registration Success', 'Your account has been verified! You are now logged in.');
                onLoginSuccess(response.data.token);
                setVerificationStep(false);
                setVerificationCode('');
            } catch (error) {
                console.error('Verification error:', error.response?.data || error.message);
                showModalMessage(
                    'Verification Failed',
                    error.response?.data?.message || 'Invalid or expired verification code. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        } else {
            // Login flow (unchanged)
            try {
                const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
                onLoginSuccess(response.data.token);
            } catch (error) {
                console.error('Login error:', error.response?.data || error.message);
                showModalMessage(
                    'Login Failed',
                    error.response?.data?.message || 'An unexpected error occurred. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/auth/resend-verification`, { email });
            showModalMessage('Code Resent', 'A new verification code has been sent to your email.');
        } catch (error) {
            console.error('Resend error:', error.response?.data || error.message);
            showModalMessage('Resend Failed', error.response?.data?.message || 'Failed to resend code.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToRegistration = () => {
        setVerificationStep(false);
        setVerificationCode('');
    };

    return (
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                {verificationStep ? 'Verify Your Email' : mainTitle}
            </h2>

            {verificationStep ? (
                // Step 2: Verification Code Form
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">
                            We sent a 6-digit code to <strong>{email}</strong>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Code expires in 10 minutes
                        </p>
                    </div>
                    
                    <input 
                        type="text" 
                        placeholder="Enter 6-digit code" 
                        value={verificationCode} 
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                        required 
                        maxLength={6}
                        pattern="[0-9]{6}"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition text-center text-2xl tracking-widest font-mono"
                    />
                    
                    <button
                        type="submit"
                        disabled={loading || verificationCode.length !== 6}
                        className="w-full bg-primary text-black font-bold py-3 rounded-lg shadow-md hover:bg-primary/90 transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Verify & Create Account'}
                    </button>

                    <div className="flex flex-col space-y-2 mt-4">
                        <button 
                            type="button" 
                            onClick={handleResendCode}
                            disabled={loading}
                            className="text-sm text-accent hover:text-accent/80 transition duration-150 font-medium"
                        >
                            Resend Code
                        </button>
                        <button 
                            type="button" 
                            onClick={handleBackToRegistration}
                            className="text-sm text-gray-600 hover:text-gray-800 transition duration-150"
                        >
                            ← Back to Registration
                        </button>
                    </div>
                </form>
            ) : (
                // Step 1: Registration/Login Form
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {isRegister && (
                        <input type="text" placeholder="Your Personal Name *" value={personalName} onChange={(e) => setPersonalName(e.target.value)} required 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" />
                    )}
                    
                    <input type="email" placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} required 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" />
                    <input type="password" placeholder="Password *" value={password} onChange={(e) => setPassword(e.target.value)} required 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" />
                    
                    {isRegister && (
                        <input 
                            type="password" 
                            placeholder="Confirm Password *" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" 
                        />
                    )}
                    
                    {isRegister && (
                        <label className="flex items-start space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                required
                                className="mt-1 h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                            />
                            <span className="text-sm text-gray-700">
                                I agree to the{' '}
                                <button
                                    type="button"
                                    onClick={onShowTerms}
                                    className="text-accent hover:text-accent/80 underline font-medium"
                                >
                                    Terms of Service
                                </button>
                                {' '}and{' '}
                                <button
                                    type="button"
                                    onClick={onShowPrivacy}
                                    className="text-accent hover:text-accent/80 underline font-medium"
                                >
                                    Privacy Policy
                                </button>
                            </span>
                        </label>
                    )}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-black font-bold py-3 rounded-lg shadow-md hover:bg-primary/90 transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : (isRegister ? <><UserPlus size={20} className="mr-2" /> Register</> : <><LogIn size={20} className="mr-2" /> Log In</>)}
                    </button>
                </form>
            )}
            
            {!verificationStep && (
                <>
                    <div className="mt-6 text-center">
                        <button type="button" onClick={() => setIsRegister(prev => !prev)}
                            className="text-sm text-accent hover:text-accent/80 transition duration-150 font-medium"
                        >
                            {isRegister ? 'Already have an account? Log In' : "Don't have an account? Register Here"}
                        </button>
                    </div>
                    
                    <div className="mt-4">
                        <InstallPWA />
                    </div>
                </>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500 space-x-4">
                <button onClick={onShowTerms} className="hover:text-primary transition">
                    Terms of Service
                </button>
                <span>|</span>
                <button onClick={onShowPrivacy} className="hover:text-primary transition">
                    Privacy Policy
                </button>
            </div>
        </div>
    );
};

    const ParentCard = ({ parentId, parentType, authToken, API_BASE_URL, onViewAnimal }) => {
        const [parentData, setParentData] = React.useState(null);
        const [loading, setLoading] = React.useState(false);
        const [notFound, setNotFound] = React.useState(false);

        React.useEffect(() => {
            if (!parentId) {
                setParentData(null);
                setNotFound(false);
                return;
            }

            const fetchParent = async () => {
                setLoading(true);
                setNotFound(false);
                try {
                    console.log(`[ParentCard] Fetching parent ${parentId} of type ${parentType}`);
                    // Try to fetch from authenticated endpoint (can access any animal globally)
                    try {
                        const response = await axios.get(`${API_BASE_URL}/animals/any/${parentId}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        if (response.data) {
                            console.log(`[ParentCard] Found parent ${parentId} via /animals/any:`, response.data);
                            setParentData(response.data);
                            setLoading(false);
                            return;
                        }
                    } catch (authError) {
                        // If authenticated endpoint fails, try public
                        console.log(`[ParentCard] Parent ${parentId} not found in /animals/any, trying public. Error:`, authError.response?.status, authError.response?.data);
                    }

                    // Try fetching from global public animals database
                    const publicResponse = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${parentId}`);
                    if (publicResponse.data && publicResponse.data.length > 0) {
                        console.log(`[ParentCard] Found parent ${parentId} via public endpoint`);
                        setParentData(publicResponse.data[0]);
                    } else {
                        // Animal not found in either collection - treat as if no parent recorded
                        console.warn(`[ParentCard] Parent ${parentId} not found in local or public collections`);
                        setNotFound(true);
                        setParentData(null);
                    }
                } catch (error) {
                    console.error(`[ParentCard] Error fetching ${parentType}:`, error);
                    setNotFound(true);
                    setParentData(null);
                } finally {
                    setLoading(false);
                }
            };

            fetchParent();
        }, [parentId, parentType, authToken, API_BASE_URL]);

    if (!parentId || notFound) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">No {parentType} recorded</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="border-2 border-gray-300 rounded-lg p-4 flex justify-center items-center">
                <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (!parentData) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">Loading {parentType} data...</p>
            </div>
        );
    }

    const imgSrc = parentData.imageUrl || parentData.photoUrl || null;

    return (
        <div 
            className="border-2 border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onViewAnimal(parentData)}
        >
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
                <p className="text-xs font-semibold text-gray-600">{parentType}</p>
            </div>
            <div className="p-3 flex flex-col items-center">
                {/* Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center mb-2">
                    {imgSrc ? (
                        <img src={imgSrc} alt={parentData.name} className="w-full h-full object-cover" />
                    ) : (
                        <Cat size={28} className="text-gray-400" />
                    )}
                </div>

                {/* Icon row */}
                <div className="flex justify-center items-center space-x-2 mb-2">
                    {parentData.isOwned ? (
                        <Heart size={12} className="text-black" />
                    ) : (
                        <HeartOff size={12} className="text-black" />
                    )}
                    {parentData.showOnPublicProfile ? (
                        <Eye size={12} className="text-black" />
                    ) : (
                        <EyeOff size={12} className="text-black" />
                    )}
                    {parentData.isInMating && <Hourglass size={12} className="text-black" />}
                    {parentData.isPregnant && <Bean size={12} className="text-black" />}
                    {parentData.isNursing && <Milk size={12} className="text-black" />}
                </div>

                {/* Name */}
                <div className="text-center mb-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                        {parentData.prefix ? `${parentData.prefix} ` : ''}{parentData.name}{parentData.suffix ? ` ${parentData.suffix}` : ''}
                    </p>
                </div>

                {/* ID */}
                <div className="text-center mb-2">
                    <p className="text-xs text-gray-500">{parentData.id_public}</p>
                </div>

                {/* Status bar */}
                <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300">
                    <p className="text-xs font-medium text-gray-700">{parentData.status || 'Unknown'}</p>
                </div>
            </div>
        </div>
    );
};

const AnimalList = ({ authToken, showModalMessage, onEditAnimal, onViewAnimal, fetchHiddenAnimals, navigate }) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    
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
    const [selectedSpecies, setSelectedSpecies] = useState(() => {
        try {
            const saved = localStorage.getItem('animalList_selectedSpecies');
            return saved ? JSON.parse(saved) : [...DEFAULT_SPECIES_OPTIONS];
        } catch { return [...DEFAULT_SPECIES_OPTIONS]; }
    });
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
    const [ownedFilterActive, setOwnedFilterActive] = useState(() => {
        try {
            const saved = localStorage.getItem('animalList_ownedFilterActive');
            return saved !== null ? saved === 'true' : true;
        } catch { return true; }
    });
    const [publicFilter, setPublicFilter] = useState(() => {
        try {
            return localStorage.getItem('animalList_publicFilter') || '';
        } catch { return ''; }
    });
    const [bulkDeleteMode, setBulkDeleteMode] = useState({}); // { species: true/false }
    const [selectedAnimals, setSelectedAnimals] = useState({}); // { species: [id1, id2, ...] }
    
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
    
    useEffect(() => {
        try {
            localStorage.setItem('animalList_selectedSpecies', JSON.stringify(selectedSpecies));
        } catch (e) { console.warn('Failed to save selectedSpecies', e); }
    }, [selectedSpecies]);
    
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
            localStorage.setItem('animalList_ownedFilterActive', ownedFilterActive.toString());
        } catch (e) { console.warn('Failed to save ownedFilterActive', e); }
    }, [ownedFilterActive]);
    
    useEffect(() => {
        try {
            localStorage.setItem('animalList_publicFilter', publicFilter);
        } catch (e) { console.warn('Failed to save publicFilter', e); }
    }, [publicFilter]);
    
    const fetchAnimals = useCallback(async () => {
        setLoading(true);
        try {
            let params = [];
            if (statusFilter) {
                params.push(`status=${statusFilter}`);
            }
            if (appliedNameFilter) {
                params.push(`name=${encodeURIComponent(appliedNameFilter)}`);
            }
            if (statusFilterPregnant) {
                params.push(`isPregnant=true`);
            }
            if (statusFilterNursing) {
                params.push(`isNursing=true`);
            }
            if (statusFilterMating) {
                params.push(`isInMating=true`);
            }
            if (ownedFilterActive) {
                params.push(`isOwned=true`);
            }
            const queryString = params.length > 0 ? `?${params.join('&')}` : '';
            const url = `${API_BASE_URL}/animals${queryString}`;

            console.log('[fetchAnimals] Fetching with ownedFilterActive:', ownedFilterActive, 'URL:', url);
            const response = await axios.get(url, { headers: { Authorization: `Bearer ${authToken}` } });
            let data = response.data || [];
            console.log('[fetchAnimals] Received', data.length, 'animals from backend');
            
            // Log a sample of animals to see their ownership status
            if (data.length > 0) {
                console.log('[fetchAnimals] Sample animals:', data.slice(0, 3).map(a => ({
                    id: a.id_public,
                    isViewOnly: a.isViewOnly,
                    ownerId: a.ownerId_public
                })));
            }
            
            // Client-side fallback filtering in case the API doesn't apply the `name` filter reliably
            if (appliedNameFilter) {
                const term = appliedNameFilter.toLowerCase();
                data = data.filter(a => {
                    const name = (a.name || '').toString().toLowerCase();
                    const registry = (a.breederyId || a.registryCode || '').toString().toLowerCase();
                    const idPublic = (a.id_public || '').toString().toLowerCase();
                    const tags = (a.tags || []).map(t => t.toLowerCase());
                    const tagsMatch = tags.some(tag => tag.includes(term));
                    return name.includes(term) || registry.includes(term) || idPublic.includes(term.replace(/^ct-?/,'').toLowerCase()) || tagsMatch;
                });
            }

            // Filter by selected species (if not all are selected)
            if (selectedSpecies.length > 0 && selectedSpecies.length < DEFAULT_SPECIES_OPTIONS.length) {
                data = data.filter(a => selectedSpecies.includes(a.species));
            }

            // Filter by selected genders (if not all are selected, or if none are selected show nothing)
            if (selectedGenders.length === 0) {
                // No genders selected = show no animals
                data = [];
            } else if (selectedGenders.length < GENDER_OPTIONS.length) {
                // Some genders selected = filter to those
                data = data.filter(a => selectedGenders.includes(a.gender));
            }

            // Filter out view-only animals when "My Animals" filter is active
            if (ownedFilterActive) {
                data = data.filter(a => !a.isViewOnly);
            }

            // Enforce that males are excluded when pregnant or nursing filters are active
            if (statusFilterPregnant || statusFilterNursing) {
                data = data.filter(a => {
                    const gender = (a.gender || '').toString().toLowerCase();
                    return gender !== 'male';
                });
            }

            // Ensure only animals with the actual boolean flags are shown when those filters are enabled
            if (statusFilterPregnant) {
                data = data.filter(a => a.isPregnant === true);
            }
            if (statusFilterNursing) {
                data = data.filter(a => a.isNursing === true);
            }
            if (statusFilterMating) {
                data = data.filter(a => a.isInMating === true);
            }

            // Filter by public/private status
            if (publicFilter === 'public') {
                data = data.filter(a => a.showOnPublicProfile === true);
            } else if (publicFilter === 'private') {
                data = data.filter(a => !a.showOnPublicProfile);
            }

            // Cache-bust any image URLs so updated uploads appear immediately
            data = data.map(a => {
                const img = a.imageUrl || a.photoUrl || null;
                if (img) {
                    const busted = img.includes('?') ? `${img}&t=${Date.now()}` : `${img}?t=${Date.now()}`;
                    return { ...a, imageUrl: busted, photoUrl: busted };
                }
                return a;
            });

            setAnimals(data);
        } catch (error) {
            console.error('Fetch animals error:', error);
            showModalMessage('Error', 'Failed to fetch animal list.');
        } finally {
            setLoading(false);
        }
    }, [authToken, statusFilter, selectedGenders, selectedSpecies, appliedNameFilter, statusFilterPregnant, statusFilterNursing, statusFilterMating, ownedFilterActive, publicFilter, showModalMessage]);

    useEffect(() => {
        fetchAnimals();
    }, [fetchAnimals]);

    // Refresh animals when other parts of the app signal a change (e.g., after upload/save)
    useEffect(() => {
        const handleAnimalsChanged = () => {
            try { fetchAnimals(); } catch (e) { /* ignore */ }
        };
        window.addEventListener('animals-changed', handleAnimalsChanged);
        return () => window.removeEventListener('animals-changed', handleAnimalsChanged);
    }, [fetchAnimals]);

    const groupedAnimals = useMemo(() => {
        return animals.reduce((groups, animal) => {
            const species = animal.species || 'Unspecified Species';
            if (!groups[species]) {
                groups[species] = [];
            }
            groups[species].push(animal);
            return groups;
        }, {});
    }, [animals]);
    
    const speciesNames = Object.keys(groupedAnimals).sort((a, b) => {
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
    
    const handleRefresh = async () => {
        try {
            setLoading(true);
            
            // Fetch animals first
            const currentAnimals = await axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            // Recalculate COI for all animals with parents
            for (const animal of currentAnimals.data) {
                if (animal.fatherId_public || animal.motherId_public || animal.sireId_public || animal.damId_public) {
                    try {
                        await axios.get(`${API_BASE_URL}/animals/${animal.id_public}/inbreeding`, {
                            params: { generations: 50 },
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                    } catch (error) {
                        console.log(`Failed to calculate COI for ${animal.name}:`, error);
                    }
                }
            }

            // Refresh the list with updated COI values
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
            // empty -> clear filter and fetch all
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

    const toggleAnimalSelection = (species, animalId) => {
        setSelectedAnimals(prev => {
            const current = prev[species] || [];
            const updated = current.includes(animalId)
                ? current.filter(id => id !== animalId)
                : [...current, animalId];
            return { ...prev, [species]: updated };
        });
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

    const AnimalCard = ({ animal, onEditAnimal, species, isSelectable, isSelected, onToggleSelect }) => {
        const birth = animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : '';
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
                    className={`relative bg-white rounded-xl shadow-sm w-44 h-56 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 pt-3 ${
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
                    {/* Birthdate top-left - only show if not in selection mode */}
                    {birth && !isSelectable && (
                        <div className="absolute top-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-0.5 rounded">
                            {birth}
                        </div>
                    )}

                    {/* Gender badge top-right */}
                    {animal.gender && (
                        <div className={`absolute top-2 right-2`} title={animal.gender}>
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
                        {animal.isOwned ? (
                            <Heart size={14} className="text-black" />
                        ) : (
                            <HeartOff size={14} className="text-black" />
                        )}
                        {animal.showOnPublicProfile ? (
                            <Eye size={14} className="text-black" />
                        ) : (
                            <EyeOff size={14} className="text-black" />
                        )}
                        {animal.isInMating && <Hourglass size={14} className="text-black" />}
                        {animal.isPregnant && <Bean size={14} className="text-black" />}
                        {animal.isNursing && <Milk size={14} className="text-black" />}
                    </div>
                    
                    {/* Prefix / Name under image */}
                    <div className="w-full text-center px-2 pb-1">
                        <div className="text-sm font-semibold text-gray-800 line-clamp-2">{animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}</div>
                    </div>

                    {/* Edit is available when viewing full card; remove inline edit icon from dashboard cards */}

                    {/* ID bottom-right */}
                    <div className="w-full px-2 pb-2 flex justify-between items-center">
                        {/* Transfer icon bottom-left */}
                        {(animal.soldStatus || animal.isViewOnly) && (
                            <div className="text-black" title="Transferred Animal">
                                <ArrowLeftRight size={14} strokeWidth={2.5} />
                            </div>
                        )}
                        {/* Spacer if no transfer icon */}
                        {!(animal.soldStatus || animal.isViewOnly) && <div></div>}
                        <div className="text-xs text-gray-500">{animal.id_public}</div>
                    </div>
                    
                    {/* Status bar at bottom */}
                    <div className={`w-full py-1 text-center border-t border-gray-300 mt-auto ${
                        animal.isViewOnly ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                        <div className={`text-xs font-medium ${
                            animal.isViewOnly ? 'text-orange-800' : 'text-gray-700'
                        }`}>{animal.isViewOnly ? 'Sold' : (animal.status || 'Unknown')}</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                <div className='flex items-center'>
                    <ClipboardList size={24} className="mr-3 text-primary-dark" />
                    My Animals ({animals.length})
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => { navigate('/hidden-animals'); fetchHiddenAnimals(); }}
                        data-tutorial-target="hidden-animals-btn"
                        className="text-gray-600 hover:text-gray-800 transition flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                        title="View Hidden Animals"
                    >
                        <Archive size={18} />
                        <span className="text-sm font-medium">Hidden</span>
                    </button>
                    <button 
                        onClick={handleRefresh} 
                        disabled={loading}
                        className="text-gray-600 hover:text-primary transition disabled:opacity-50 flex items-center"
                        title="Refresh List"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    </button>
                </div>
            </h2>

            <div className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-3">
                {/* Search and Add buttons - Stack on mobile */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                        type="text"
                        placeholder="Search by Animal Name..."
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        onKeyPress={(e) => { if (e.key === 'Enter') triggerSearch(); }}
                        className="flex-grow p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition"
                        disabled={loading}
                        data-tutorial-target="my-animals-search"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={triggerSearch}
                            disabled={loading}
                            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center justify-center space-x-1"
                            title="Search"
                        >
                            <Search size={18} />
                            <span>Search</span>
                        </button>
                        <button 
                            onClick={() => navigate('/select-species')} 
                            className="flex-1 sm:flex-none bg-accent hover:bg-accent/90 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center justify-center space-x-1 whitespace-nowrap"
                            data-tutorial-target="add-animal-btn"
                        >
                            <PlusCircle size={18} /> <span>Add Animal</span>
                        </button>
                    </div>
                </div>

                {/* Species dropdown, Gender icons, and Status dropdown - all in one row */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200 justify-between">
                    <div className="flex gap-3 items-center flex-wrap">
                        {/* Species dropdown */}
                        <div className="flex gap-2 items-center" data-tutorial-target="species-filter">
                            <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Species:</span>
                            <select 
                                value={selectedSpecies.length === speciesNames.length ? '' : selectedSpecies[0] || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                        setSelectedSpecies([...speciesNames]);
                                    } else {
                                        setSelectedSpecies([value]);
                                    }
                                }}
                                className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition min-w-[150px]"
                            >
                                <option value="">All Species</option>
                                {speciesNames.map(species => (
                                    <option key={species} value={species}>{getSpeciesDisplayName(species)}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Gender filter with icons */}
                        <div className="flex gap-2 items-center" data-tutorial-target="gender-filter">
                            <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Gender:</span>
                            {GENDER_OPTIONS.map(gender => {
                                const isSelected = selectedGenders.includes(gender);
                                let Icon, bgColor;
                                
                                switch(gender) {
                                    case 'Male':
                                        Icon = Mars;
                                        bgColor = isSelected ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400';
                                        break;
                                    case 'Female':
                                        Icon = Venus;
                                        bgColor = isSelected ? 'bg-pink-400' : 'bg-gray-300 hover:bg-gray-400';
                                        break;
                                    case 'Intersex':
                                        Icon = VenusAndMars;
                                        bgColor = isSelected ? 'bg-purple-400' : 'bg-gray-300 hover:bg-gray-400';
                                        break;
                                    case 'Unknown':
                                        Icon = Circle;
                                        bgColor = isSelected ? 'bg-teal-400' : 'bg-gray-300 hover:bg-gray-400';
                                        break;
                                    default:
                                        Icon = Circle;
                                        bgColor = 'bg-gray-300 hover:bg-gray-400';
                                }
                                
                                return (
                                    <button key={gender} onClick={() => toggleGender(gender)}
                                        className={`p-2 rounded-lg transition duration-150 shadow-sm ${bgColor}`}
                                        title={gender}
                                    >
                                        <Icon size={18} className="text-black" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Status dropdown on right */}
                    <div className="flex gap-2 items-center" data-tutorial-target="status-filter">
                        <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Status:</span>
                        <select value={statusFilter} onChange={handleStatusFilterChange} 
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition min-w-[150px]"
                        >
                            <option value="">All</option>
                            {STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Ownership/Special filters on left, Visibility filter on right */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200 justify-between">
                    <div className="flex flex-wrap items-center gap-2" data-tutorial-target="collection-filters">
                        <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Show:</span>
                        
                        <button onClick={() => setOwnedFilterActive(prev => !prev)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center gap-1.5 ${ 
                                ownedFilterActive ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {ownedFilterActive ? <Heart size={16} /> : <HeartHandshake size={16} />}
                            <span>{ownedFilterActive ? 'My Animals' : 'All Animals'}</span>
                        </button>

                        <button onClick={handleFilterMating}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center space-x-1 ${ 
                                statusFilterMating ? 'bg-accent text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <Hourglass size={16} /> <span>Mating</span>
                        </button>
                        <button onClick={handleFilterPregnant}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center space-x-1 ${ 
                                statusFilterPregnant ? 'bg-accent text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <Bean size={16} /> <span>Pregnant</span>
                        </button>
                        <button onClick={handleFilterNursing}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center space-x-1 ${ 
                                statusFilterNursing ? 'bg-accent text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <Milk size={16} /> <span>Nursing</span>
                        </button>
                    </div>

                    <div className="flex gap-2 items-center" data-tutorial-target="visibility-filter">
                        <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Visibility:</span>
                        {['All', 'Public', 'Private'].map(option => {
                            const value = option === 'All' ? '' : option.toLowerCase();
                            const isSelected = publicFilter === value;
                            return (
                                <button key={option} onClick={() => setPublicFilter(value)}
                                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm ${ 
                                        isSelected ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : animals.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <Cat size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-600">No animals found.</p>
                    <p className="text-gray-500">Try adjusting your filters or add a new animal!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {speciesNames.map(species => {
                        const isBulkMode = bulkDeleteMode[species] || false;
                        const selected = selectedAnimals[species] || [];
                        
                        return (
                        <div key={species} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between bg-gray-100 p-4 border-b">
                                <h3 className="text-lg font-bold text-gray-700">
                                    {getSpeciesDisplayName(species)} ({groupedAnimals[species].length})
                                </h3>
                                <div className="flex items-center gap-2">
                                    {isBulkMode && (
                                        <>
                                            <span className="text-sm text-gray-600">
                                                {selected.length} selected
                                            </span>
                                            <button
                                                onClick={() => handleBulkDelete(species)}
                                                disabled={selected.length === 0}
                                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Delete Selected
                                            </button>
                                            <button
                                                onClick={() => toggleBulkDeleteMode(species)}
                                                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded-lg transition"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                    {!isBulkMode && (
                                        <button
                                            onClick={() => toggleBulkDeleteMode(species)}
                                            data-tutorial-target="bulk-delete-btn"
                                            className="p-2 hover:bg-gray-200 rounded-lg transition"
                                            title="Delete Multiple"
                                        >
                                            <Trash2 size={18} className="text-red-500" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {groupedAnimals[species].map(animal => (
                                    <AnimalCard 
                                        key={animal.id_public} 
                                        animal={animal} 
                                        onEditAnimal={onEditAnimal}
                                        species={species}
                                        isSelectable={isBulkMode}
                                        isSelected={selected.includes(animal.id_public)}
                                        onToggleSelect={toggleAnimalSelection}
                                    />
                                ))}
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Messages View Component
const MessagesView = ({ authToken, API_BASE_URL, onClose, showModalMessage, selectedConversation, setSelectedConversation, userProfile }) => {
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        
        // Poll for new conversations every 5 seconds
        const interval = setInterval(() => {
            fetchConversations();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.otherUserId);
        }
    }, [selectedConversation]);

    useEffect(() => {
        // Poll for new messages every 3 seconds when a conversation is open
        if (!selectedConversation) return;
        
        const interval = setInterval(() => {
            fetchMessages(selectedConversation.otherUserId);
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedConversation]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/messages/conversations`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setConversations(response.data || []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (otherUserId) => {
        try {
            console.log('[MessagesView] Fetching messages for:', otherUserId);
            const response = await axios.get(`${API_BASE_URL}/messages/conversation/${otherUserId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('[MessagesView] Got messages:', response.data?.messages?.length || 0, 'messages');
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('[MessagesView] Error fetching messages:', error.response?.data || error.message);
            showModalMessage && showModalMessage('Error', 'Failed to load messages');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) {
            console.log('[MessagesView] Cannot send: newMessage or selectedConversation missing');
            return;
        }

        console.log('[MessagesView] Sending message to:', selectedConversation.otherUserId);
        setSending(true);
        try {
            await axios.post(`${API_BASE_URL}/messages/send`, {
                receiverId: selectedConversation.otherUserId,
                message: newMessage.trim()
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('[MessagesView] Message sent successfully');
            setNewMessage('');
            await fetchMessages(selectedConversation.otherUserId);
            await fetchConversations(); // Refresh conversation list
        } catch (error) {
            console.error('[MessagesView] Error sending message:', error.response?.data || error.message);
            showModalMessage && showModalMessage('Error', error.response?.data?.error || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const getDisplayName = (user) => {
        if (!user) return 'Unknown User';
        return (user.showBreederName && user.breederName) 
            ? user.breederName 
            : (user.showPersonalName ? user.personalName : `User ${user.id_public}`);
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/messages/${messageId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            await fetchMessages(selectedConversation.otherUserId);
        } catch (error) {
            showModalMessage && showModalMessage('Error', 'Failed to delete message');
        }
    };

    const handleDeleteConversation = async () => {
        if (!window.confirm('Delete entire conversation? This cannot be undone.')) return;
        try {
            await axios.delete(`${API_BASE_URL}/messages/conversation/${selectedConversation.otherUserId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setSelectedConversation(null);
            await fetchConversations();
            showModalMessage && showModalMessage('Success', 'Conversation deleted');
        } catch (error) {
            showModalMessage && showModalMessage('Error', 'Failed to delete conversation');
        }
    };

    const handleBlockUser = async () => {
        if (!window.confirm(`Block ${getDisplayName(selectedConversation.otherUser)}?`)) return;
        try {
            await axios.post(`${API_BASE_URL}/messages/block/${selectedConversation.otherUserId}`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setSelectedConversation(null);
            await fetchConversations();
            showModalMessage && showModalMessage('Success', 'User blocked');
        } catch (error) {
            showModalMessage && showModalMessage('Error', 'Failed to block user');
        }
    };

    const handleReportUser = async () => {
        const reason = window.prompt('Why are you reporting this user? (max 1000 characters)');
        if (!reason) return;
        if (reason.length > 1000) {
            showModalMessage && showModalMessage('Error', 'Report reason too long');
            return;
        }
        try {
            const lastMsg = messages[messages.length - 1];
            if (!lastMsg) {
                showModalMessage && showModalMessage('Error', 'No message to report');
                return;
            }
            await axios.post(`${API_BASE_URL}/messages/report`, {
                messageId: lastMsg._id,
                reportedUserId: selectedConversation.otherUserId,
                reason: reason.trim()
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage && showModalMessage('Success', 'Report submitted to support team');
        } catch (error) {
            showModalMessage && showModalMessage('Error', 'Failed to submit report');
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else if (diffInHours < 168) { // Less than a week
            return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare size={24} className="text-blue-500" />
                        Messages
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Conversations List - Hidden on mobile when conversation selected */}
                    <div className={`${selectedConversation ? 'hidden sm:flex' : 'flex'} sm:w-1/3 w-full border-r overflow-y-auto flex-col`}>
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="animate-spin text-gray-400" size={32} />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                <MessageSquare size={48} className="mx-auto mb-2 text-gray-300" />
                                <p>No conversations yet</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv.conversationId}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                                        selectedConversation?.conversationId === conv.conversationId ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                            {conv.otherUser?.profileImage ? (
                                                <img src={conv.otherUser.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <User size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <p className="font-semibold text-sm truncate">{getDisplayName(conv.otherUser)}</p>
                                                {conv.unreadCount > 0 && (
                                                    <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                                            <p className="text-xs text-gray-400">{formatTime(conv.lastMessageDate)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Messages Thread */}
                    <div className="flex-1 flex flex-col">
                        {!selectedConversation ? (
                            <div className="flex items-center justify-center h-full text-gray-400 px-4">
                                <div className="text-center">
                                    <MessageSquare size={64} className="mx-auto mb-4 text-gray-200" />
                                    <p>Select a conversation to view messages</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Conversation Header */}
                                <div className="p-4 border-b bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setSelectedConversation(null)}
                                                className="sm:hidden text-gray-600 hover:text-gray-800 transition"
                                            >
                                                <ArrowLeft size={20} />
                                            </button>
                                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                                {selectedConversation.otherUser?.profileImage ? (
                                                    <img src={selectedConversation.otherUser.profileImage} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{getDisplayName(selectedConversation.otherUser)}</p>
                                                <p className="text-xs text-gray-500">{selectedConversation.otherUser?.id_public}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleBlockUser}
                                                className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition"
                                                title="Block user"
                                            >
                                                <Ban size={18} />
                                            </button>
                                            <button
                                                onClick={handleReportUser}
                                                className="p-2 text-gray-600 hover:bg-orange-100 hover:text-orange-600 rounded-lg transition"
                                                title="Report user"
                                            >
                                                <Flag size={18} />
                                            </button>
                                            <button
                                                onClick={handleDeleteConversation}
                                                className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition"
                                                title="Delete conversation"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <p>No messages yet. Start the conversation!</p>
                                        </div>
                                    ) : (
                                        messages.map(msg => {
                                            const isSentByMe = msg.senderId.toString() === selectedConversation.otherUserId ? false : true;
                                            return (
                                                <div key={msg._id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} group`}>
                                                    <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                                        isSentByMe 
                                                            ? 'bg-blue-500 text-white' 
                                                            : 'bg-gray-200 text-gray-800'
                                                    }`}>
                                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                                        <div className="flex items-center justify-between gap-2 mt-1">
                                                            <p className={`text-xs ${isSentByMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                {formatTime(msg.createdAt)}
                                                            </p>
                                                            {isSentByMe && (
                                                                <button
                                                                    onClick={() => handleDeleteMessage(msg._id)}
                                                                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-white hover:bg-opacity-20 rounded"
                                                                    title="Delete message"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Send Message Form */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                                    {userProfile?.allowMessages === false ? (
                                        <div className="text-center py-2 text-sm text-gray-500">
                                            You have disabled messages. Enable them in your profile settings to send messages.
                                        </div>
                                    ) : selectedConversation.otherUser?.allowMessages === false ? (
                                        <div className="text-center py-2 text-sm text-gray-500">
                                            This user has disabled messages
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type a message..."
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                disabled={sending}
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || !newMessage.trim()}
                                                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {sending ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={16} />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    'Send'
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Notification Panel Component
const NotificationPanel = ({ authToken, API_BASE_URL, onClose, showModalMessage, onNotificationChange, onViewAnimal }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            console.log('[Notifications] Fetching from:', `${API_BASE_URL}/notifications`);
            const response = await axios.get(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('[Notifications] Received:', response.data);
            
            // Fetch missing animal images for notifications that don't have them
            const notificationsWithImages = await Promise.all(
                (response.data || []).map(async (notification) => {
                    // If animalImageUrl is missing, try to fetch the animal details
                    if (!notification.animalImageUrl && notification.animalId_public) {
                        try {
                            const animalRes = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${notification.animalId_public}`, {
                                headers: { Authorization: `Bearer ${authToken}` }
                            });
                            if (animalRes.data?.length > 0) {
                                notification.animalImageUrl = animalRes.data[0].imageUrl || '';
                            }
                        } catch (err) {
                            console.warn('Failed to fetch image for animal:', notification.animalId_public, err);
                        }
                    }
                    return notification;
                })
            );
            
            setNotifications(notificationsWithImages || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (notificationId) => {
        setProcessing(notificationId);
        try {
            await axios.post(`${API_BASE_URL}/notifications/${notificationId}/reject`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Rejected', 'Request rejected and link removed');
            fetchNotifications();
            if (onNotificationChange) onNotificationChange();
        } catch (error) {
            console.error('Error rejecting notification:', error);
            showModalMessage('Error', 'Failed to reject request');
        } finally {
            setProcessing(null);
        }
    };

    const handleAcceptTransfer = async (transferId) => {
        setProcessing(transferId);
        try {
            await axios.post(`${API_BASE_URL}/transfers/${transferId}/accept`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'Transfer accepted! Animal has been added to your account.');
            fetchNotifications();
            if (onNotificationChange) onNotificationChange();
        } catch (error) {
            console.error('Error accepting transfer:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to accept transfer');
        } finally {
            setProcessing(null);
        }
    };

    const handleDeclineTransfer = async (transferId) => {
        setProcessing(transferId);
        try {
            await axios.post(`${API_BASE_URL}/transfers/${transferId}/decline`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Declined', 'Transfer declined');
            fetchNotifications();
            if (onNotificationChange) onNotificationChange();
        } catch (error) {
            console.error('Error declining transfer:', error);
            showModalMessage('Error', 'Failed to decline transfer');
        } finally {
            setProcessing(null);
        }
    };

    const handleAcceptViewOnly = async (transferId) => {
        setProcessing(transferId);
        try {
            await axios.post(`${API_BASE_URL}/transfers/${transferId}/accept-view-only`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'View-only access accepted');
            fetchNotifications();
            if (onNotificationChange) onNotificationChange();
        } catch (error) {
            console.error('Error accepting view-only:', error);
            showModalMessage('Error', 'Failed to accept view-only access');
        } finally {
            setProcessing(null);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            console.log('[handleDelete] Deleting notification:', notificationId);
            await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            // Wait for the backend to process before refreshing
            await fetchNotifications();
            
            if (onNotificationChange) {
                console.log('[handleDelete] Calling onNotificationChange');
                // Small delay to ensure backend count is updated
                setTimeout(() => onNotificationChange(), 100);
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const pendingNotifications = notifications.filter(n => n.status === 'pending');
    const otherNotifications = notifications.filter(n => n.status !== 'pending');

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-xl font-bold text-gray-800">Notifications</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin" size={32} />
                        </div>
                    ) : notifications.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No notifications</p>
                    ) : (
                        <>
                            {pendingNotifications.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-2">Pending Requests</h4>
                                    {pendingNotifications.map(notification => (
                                        <div key={notification._id} className={`border rounded-lg p-4 mb-2 ${!notification.read ? 'bg-primary/20 border-primary' : 'bg-white'}`}>
                                            <div className="flex items-start space-x-3 mb-2">
                                                {/* Animal Thumbnail */}
                                                <div 
                                                    className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => {
                                                        if (notification.animalId_public && onViewAnimal) {
                                                            onViewAnimal(notification.animalId_public, true);
                                                        }
                                                    }}
                                                    title="Click to view animal"
                                                >
                                                    {notification.animalImageUrl ? (
                                                        <img 
                                                            src={notification.animalImageUrl} 
                                                            alt={notification.animalName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold text-lg">
                                                            {notification.animalName?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Notification Message */}
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-700">{notification.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                {/* Transfer Request */}
                                                {notification.type === 'transfer_request' && notification.transferId && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAcceptTransfer(notification.transferId)}
                                                            disabled={processing === notification.transferId}
                                                            className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                        >
                                                            <CheckCircle size={14} />
                                                            <span>Accept</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeclineTransfer(notification.transferId)}
                                                            disabled={processing === notification.transferId}
                                                            className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                        >
                                                            <XCircle size={14} />
                                                            <span>Decline</span>
                                                        </button>
                                                    </>
                                                )}
                                                {/* View-Only Offer */}
                                                {notification.type === 'view_only_offer' && notification.transferId && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAcceptViewOnly(notification.transferId)}
                                                            disabled={processing === notification.transferId}
                                                            className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                        >
                                                            <CheckCircle size={14} />
                                                            <span>Accept</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeclineTransfer(notification.transferId)}
                                                            disabled={processing === notification.transferId}
                                                            className="flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                        >
                                                            <XCircle size={14} />
                                                            <span>Decline</span>
                                                        </button>
                                                    </>
                                                )}
                                                {/* Link Request (old functionality) */}
                                                {notification.type === 'link_request' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleReject(notification._id)}
                                                            disabled={processing === notification._id}
                                                            className="flex items-center space-x-1 bg-primary border-2 border-black text-black hover:bg-primary/90 px-3 py-1 rounded text-sm disabled:opacity-50"
                                                        >
                                                            <XCircle size={14} />
                                                            <span>Reject</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(notification._id)}
                                                            className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                                        >
                                                            <Trash2 size={14} />
                                                            <span>Delete</span>
                                                        </button>
                                                    </>
                                                )}
                                                {/* Breeder and Parent Requests */}
                                                {(notification.type === 'breeder_request' || notification.type === 'parent_request') && (
                                                    <>
                                                        <button
                                                            onClick={() => handleReject(notification._id)}
                                                            disabled={processing === notification._id}
                                                            className="flex items-center space-x-1 bg-accent hover:bg-accent/80 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                        >
                                                            <XCircle size={14} />
                                                            <span>Reject</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(notification._id)}
                                                            className="flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                                                        >
                                                            <Trash2 size={14} />
                                                            <span>Delete</span>
                                                        </button>
                                                    </>
                                                )}
                                                {/* Delete button for other notifications */}
                                                {notification.type !== 'link_request' && 
                                                 notification.type !== 'breeder_request' &&
                                                 notification.type !== 'parent_request' &&
                                                 notification.type !== 'transfer_request' && 
                                                 notification.type !== 'view_only_offer' && (
                                                    <button
                                                        onClick={() => handleDelete(notification._id)}
                                                        className="flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                                                    >
                                                        <Trash2 size={14} />
                                                        <span>Delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {otherNotifications.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-2">History</h4>
                                    {otherNotifications.map(notification => (
                                        <div key={notification._id} className="border rounded-lg p-4 mb-2 bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-grow">
                                                    <p className="text-sm text-gray-700 mb-1">{notification.message}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(notification.createdAt).toLocaleString()} • 
                                                        <span className={`ml-1 ${notification.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {notification.status}
                                                        </span>
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(notification._id)}
                                                    className="text-gray-400 hover:text-red-600 ml-2"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
    const [userProfile, setUserProfile] = useState(null);
    const [hasSkippedTutorialThisSession, setHasSkippedTutorialThisSession] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    // Derive currentView from URL path
    const currentView = location.pathname.split('/')[1] || 'list';
    
    // Detect mobile/app environment
    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Tutorial context hook
    const { hasSeenInitialTutorial, markInitialTutorialSeen, hasCompletedOnboarding, isLoading: tutorialLoading, markTutorialCompleted, completedTutorials, isTutorialCompleted, hasSeenWelcomeBanner, dismissWelcomeBanner } = useTutorial(); 
    const [animalToEdit, setAnimalToEdit] = useState(null);
    const [speciesToAdd, setSpeciesToAdd] = useState(null); 
    const [speciesOptions, setSpeciesOptions] = useState([]); 
    const [speciesSearchTerm, setSpeciesSearchTerm] = useState('');
    const [speciesCategoryFilter, setSpeciesCategoryFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState({ title: '', message: '' });
    const [isRegister, setIsRegister] = useState(false); 
    
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    
    const [showMessages, setShowMessages] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    const [showUserSearchModal, setShowUserSearchModal] = useState(false);
    const [viewingPublicProfile, setViewingPublicProfile] = useState(null);
    const [viewingPublicAnimal, setViewingPublicAnimal] = useState(null);
    const [viewAnimalBreederInfo, setViewAnimalBreederInfo] = useState(null);
    const [animalToView, setAnimalToView] = useState(null);
    const [detailViewTab, setDetailViewTab] = useState(1); // Tab for detail view
    const [showTabs, setShowTabs] = useState(true); // Toggle for collapsible tabs panel
    const [sireData, setSireData] = useState(null);
    const [damData, setDamData] = useState(null);
    const [offspringData, setOffspringData] = useState([]);
    const [sectionPrivacy, setSectionPrivacy] = useState({}); // Track which sections are public per animal
    
    // Fetch parent animals when viewing an animal
    React.useEffect(() => {
        if (!animalToView) {
            setSireData(null);
            setDamData(null);
            setOffspringData([]);
            setSectionPrivacy({});
            return;
        }
        
        // Initialize section privacy settings from animal data
        const animalId = animalToView.id_public;
        setSectionPrivacy(prev => ({
            ...prev,
            [animalId]: animalToView.sectionPrivacy || {
                appearance: true,
                identification: true,
                health: true,
                reproductive: true,
                genetics: true,
                husbandry: true,
                behavior: true,
                records: true,
                endOfLife: true,
                remarks: true,
                owner: true,
                lifeStage: true,
                measurements: true,
                origin: true,
                medicalHistory: true,
                environment: true,
                activity: true
            }
        }));
        
        const fetchPedigreeData = async () => {
            try {
                const sireId = animalToView.sireId_public || animalToView.fatherId_public;
                const damId = animalToView.damId_public || animalToView.motherId_public;
                
                // Fetch parents
                if (sireId) {
                    const response = await axios.get(`${API_BASE_URL}/animals/${sireId}`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    setSireData(response.data);
                }
                
                if (damId) {
                    const response = await axios.get(`${API_BASE_URL}/animals/${damId}`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    setDamData(response.data);
                }
                
                // Fetch offspring using the dedicated offspring endpoint
                try {
                    const offspringResponse = await axios.get(`${API_BASE_URL}/animals/${animalToView.id_public}/offspring`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    
                    const litters = offspringResponse.data || [];
                    // Flatten offspring from all litters into a single array
                    const allOffspring = [];
                    litters.forEach(litter => {
                        if (litter.offspring && Array.isArray(litter.offspring)) {
                            allOffspring.push(...litter.offspring);
                        }
                    });
                    
                    console.log('Fetched offspring from API:', allOffspring);
                    setOffspringData(allOffspring);
                } catch (e) {
                    console.log('No offspring endpoint available or no offspring found:', e.message);
                    setOffspringData([]);
                }
            } catch (error) {
                console.error('Error fetching pedigree data:', error);
            }
        };
        
        fetchPedigreeData();
    }, [animalToView, authToken]);
    
    const [showPedigreeChart, setShowPedigreeChart] = useState(false);
    const [copySuccessAnimal, setCopySuccessAnimal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);
    
    const [showBugReportModal, setShowBugReportModal] = useState(false);
    const [bugReportCategory, setBugReportCategory] = useState('Bug');
    const [bugReportDescription, setBugReportDescription] = useState('');
    const [bugReportSubmitting, setBugReportSubmitting] = useState(false);
    
    const [hasSeenDonationHighlight, setHasSeenDonationHighlight] = useState(() => {
        return localStorage.getItem('hasSeenDonationHighlight') === 'true';
    });
    
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    
    // Animals for genetics calculator
    const [myAnimalsForCalculator, setMyAnimalsForCalculator] = useState([]);
    
    // Available animals showcase
    const [availableAnimals, setAvailableAnimals] = useState([]);
    const [currentAvailableIndex, setCurrentAvailableIndex] = useState(0);
    
    // Transfer modal states
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferAnimal, setTransferAnimal] = useState(null);
    const [preSelectedTransferAnimal, setPreSelectedTransferAnimal] = useState(null);
    const [preSelectedTransactionType, setPreSelectedTransactionType] = useState(null);
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);
    const [transferUserQuery, setTransferUserQuery] = useState('');
    const [transferUserResults, setTransferUserResults] = useState([]);
    const [transferSelectedUser, setTransferSelectedUser] = useState(null);
    const [transferSearching, setTransferSearching] = useState(false);
    const [transferPrice, setTransferPrice] = useState('');
    const [transferNotes, setTransferNotes] = useState('');
    
    // Community banner states
    const [newestUsers, setNewestUsers] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const scrollContainerRef = useRef(null);
    const tutorialOverlayRef = useRef(null);
    const litterFormDataRef = useRef(null);

    // Tutorial modal states
    const [showInfoTab, setShowInfoTab] = useState(false);
    const [currentTutorialId, setCurrentTutorialId] = useState(null);
    const [showTutorialOverlay, setShowTutorialOverlay] = useState(false);
    const [currentTutorialIndex, setCurrentTutorialIndex] = useState(0);
    const [currentTutorialStep, setCurrentTutorialStep] = useState(null);
    const [litterFormOpen, setLitterFormOpen] = useState(false);
    const [profileEditButtonClicked, setProfileEditButtonClicked] = useState(false);

    const timeoutRef = useRef(null);
    const activeEvents = ['mousemove', 'keydown', 'scroll', 'click'];

    const showModalMessage = useCallback((title, message) => {
        setModalMessage({ title, message });
        setShowModal(true);
    }, []);

    // Toggle section privacy and save to animal
    const toggleSectionPrivacy = useCallback(async (sectionName) => {
        if (!animalToView) return;
        
        const animalId = animalToView.id_public;
        const currentPrivacy = sectionPrivacy[animalId] || {};
        const newPrivacy = {
            ...currentPrivacy,
            [sectionName]: !currentPrivacy[sectionName]
        };
        
        // Update local state immediately for responsiveness
        setSectionPrivacy(prev => ({
            ...prev,
            [animalId]: newPrivacy
        }));
        
        // Save to backend
        try {
            await axios.put(`${API_BASE_URL}/animals/${animalId}`, {
                sectionPrivacy: newPrivacy
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
        } catch (error) {
            console.error('Error saving section privacy:', error);
            // Revert on error
            setSectionPrivacy(prev => ({
                ...prev,
                [animalId]: currentPrivacy
            }));
            showModalMessage('Error', 'Failed to save privacy settings');
        }
    }, [animalToView, sectionPrivacy, authToken, API_BASE_URL, showModalMessage]);

    const handleLogout = useCallback((expired = false) => {
        setAuthToken(null);
        setUserProfile(null);
        navigate('/');
        localStorage.removeItem('authToken');
        if (expired) {
            showModalMessage('Session Expired', 'You were logged out due to 15 minutes of inactivity.');
        }
    }, [showModalMessage]);

    const resetIdleTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            if (authToken) {
                handleLogout(true);
            }
        }, IDLE_TIMEOUT_MS);
    }, [authToken, handleLogout]);

     useEffect(() => {
        if (authToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
            resetIdleTimer();

            activeEvents.forEach(event => window.addEventListener(event, resetIdleTimer));
        } else {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            activeEvents.forEach(event => window.removeEventListener(event, resetIdleTimer));
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            activeEvents.forEach(event => window.removeEventListener(event, resetIdleTimer));
        };
    }, [authToken, resetIdleTimer]);

    // Show initial tutorial on first login
    useEffect(() => {
        if (authToken && !hasCompletedOnboarding && !tutorialLoading && userProfile) {
            // Show the initial welcome tutorial
            // This will automatically trigger the InitialTutorialModal through the tutorial context
        }
    }, [authToken, hasCompletedOnboarding, tutorialLoading, userProfile]);

    // Auto-advance tutorial when view changes (indicating step completion)
    useEffect(() => {
        if (!showTutorialOverlay || currentTutorialId !== 'create-animals' || !tutorialOverlayRef.current) {
            return;
        }

        // Determine expected step based on current view and state
        let expectedStep = undefined;

        if (currentView === 'list') {
            expectedStep = 0; // Start Adding Animals
        } else if (currentView === 'select-species') {
            expectedStep = 1; // Select a Species
        } else if (currentView === 'add-animal' && speciesToAdd) {
            expectedStep = 2; // Species selected - advances to step 3 (Fill in Basic Information)
        } else if (currentView === 'form') {
            expectedStep = 3;
        }

        if (expectedStep !== undefined && currentTutorialStep && expectedStep > currentTutorialStep.stepNumber - 1) {
            // Auto-advance to the next step
            tutorialOverlayRef.current.advanceStep();
        }
    }, [currentView, speciesToAdd, showTutorialOverlay, currentTutorialId, currentTutorialStep]);

    // Auto-advance tutorial for lesson 3 (assign-parents) when entering edit view
    useEffect(() => {
        if (!showTutorialOverlay || currentTutorialId !== 'assign-parents' || !tutorialOverlayRef.current) {
            return;
        }

        // When editing an animal, advance to step 2 (where pedigree section is highlighted)
        if (currentView === 'edit-animal' && currentTutorialStep?.stepNumber === 1) {
            tutorialOverlayRef.current.advanceStep();
        }
    }, [currentView, showTutorialOverlay, currentTutorialId, currentTutorialStep]);

    // Auto-advance tutorial for lesson 4 (create-litters) when entering litters view
    useEffect(() => {
        if (!showTutorialOverlay || currentTutorialId !== 'create-litters' || !tutorialOverlayRef.current) {
            return;
        }

        // When viewing litters, advance to step 2 (where new litter button is highlighted)
        if (currentView === 'litters' && currentTutorialStep?.stepNumber === 1) {
            tutorialOverlayRef.current.advanceStep();
        }
    }, [currentView, showTutorialOverlay, currentTutorialId, currentTutorialStep]);

    // Auto-advance tutorial for lesson 4 (profile-settings) when entering profile view
    useEffect(() => {
        if (!showTutorialOverlay || currentTutorialId !== 'profile-settings' || !tutorialOverlayRef.current) {
            return;
        }

        // When viewing profile, advance to step 2 (where edit button is highlighted)
        if (currentView === 'profile' && currentTutorialStep?.stepNumber === 1) {
            tutorialOverlayRef.current.advanceStep();
        }
    }, [currentView, showTutorialOverlay, currentTutorialId, currentTutorialStep]);

    // Auto-advance tutorial for lesson 4 step 3 when edit profile button is clicked
    useEffect(() => {
        if (!showTutorialOverlay || currentTutorialId !== 'profile-settings' || !tutorialOverlayRef.current) {
            return;
        }

        // When edit profile button is clicked, advance to step 3 (privacy settings)
        if (profileEditButtonClicked && currentTutorialStep?.stepNumber === 2) {
            tutorialOverlayRef.current.advanceStep();
            setProfileEditButtonClicked(false);
        }
    }, [profileEditButtonClicked, showTutorialOverlay, currentTutorialId, currentTutorialStep]);

    // Auto-advance tutorial for lesson 6 (budget-basics) when entering budget view
    useEffect(() => {
        if (!showTutorialOverlay || currentTutorialId !== 'budget-basics' || !tutorialOverlayRef.current) {
            return;
        }

        // When viewing budget, advance to step 2 (where add transaction button is explained)
        if (currentView === 'budget' && currentTutorialStep?.stepNumber === 1) {
            tutorialOverlayRef.current.advanceStep();
        }
    }, [currentView, showTutorialOverlay, currentTutorialId, currentTutorialStep]);

    // Auto-advance tutorial for lesson 6 (budget-basics) step 2 when Add Transaction clicked
    useEffect(() => {
        if (!showTutorialOverlay || currentTutorialId !== 'budget-basics' || !tutorialOverlayRef.current) {
            return;
        }

        // When Add Transaction is clicked, advance from step 2 to step 3 (manual vs transfer)
        if (budgetModalOpen && currentTutorialStep?.stepNumber === 2) {
            tutorialOverlayRef.current.advanceStep();
            setBudgetModalOpen(false); // Reset for next time
        }
    }, [budgetModalOpen, showTutorialOverlay, currentTutorialId, currentTutorialStep]);

    // Clear pre-selected transfer data when leaving budget view
    useEffect(() => {
        if (currentView !== 'budget') {
            setPreSelectedTransferAnimal(null);
            setPreSelectedTransactionType(null);
        }
    }, [currentView]);

    // Auto-advance tutorial for lesson 4 step 2 when form opens
    useEffect(() => {
        if (!showTutorialOverlay || currentTutorialId !== 'create-litters' || !tutorialOverlayRef.current) {
            return;
        }

        // When new litter form opens, advance to step 3 (where parents section is highlighted)
        if (litterFormOpen && currentTutorialStep?.stepNumber === 2) {
            tutorialOverlayRef.current.advanceStep();
        }
    }, [showTutorialOverlay, currentTutorialId, currentTutorialStep, litterFormOpen]);

    // Auto-advance tutorial for lesson 4 step 3 when parents and birthdate are filled
    useEffect(() => {
        if (!showTutorialOverlay || currentTutorialId !== 'create-litters' || !tutorialOverlayRef.current) {
            return;
        }

        // When parents and birthdate are set, advance from step 3 to step 4 (offspring sections)
        if (currentTutorialStep?.stepNumber === 3 && litterFormDataRef.current) {
            const { sireId_public, damId_public, birthDate } = litterFormDataRef.current;
            if (sireId_public && damId_public && birthDate) {
                tutorialOverlayRef.current.advanceStep();
            }
        }
    }, [showTutorialOverlay, currentTutorialId, currentTutorialStep, litterFormDataRef.current?.sireId_public, litterFormDataRef.current?.damId_public, litterFormDataRef.current?.birthDate]);

    useEffect(() => {
        if (authToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
            fetchUserProfile(authToken);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('authToken');
            setUserProfile(null);
            navigate('/');
        }
    }, [authToken]);

    const fetchUserProfile = useCallback(async (token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
            // Normalize profile image keys for UI compatibility and add a cache-busting query
            const user = response.data || {};
            const img = user.profileImage || user.profileImageUrl || user.imageUrl || user.avatarUrl || user.avatar || user.profile_image || null;
            if (img) {
                const busted = img.includes('?') ? `${img}&t=${Date.now()}` : `${img}?t=${Date.now()}`;
                // prefer `profileImage` and also set `profileImageUrl` for backwards compatibility
                user.profileImage = busted;
                user.profileImageUrl = busted;
            }
            setUserProfile(user);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            showModalMessage('Authentication Error', 'Could not load user profile. Please log in again.');
            setAuthToken(null);
        }
    }, [showModalMessage]);

    // Fetch animals for genetics calculator when needed
    useEffect(() => {
        const fetchAnimalsForCalculator = async () => {
            if (currentView === 'genetics-calculator' && authToken) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/animals?isOwned=true`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    setMyAnimalsForCalculator(response.data || []);
                } catch (error) {
                    console.error('Failed to fetch animals for calculator:', error);
                    setMyAnimalsForCalculator([]);
                }
            }
        };
        fetchAnimalsForCalculator();
    }, [currentView, authToken, API_BASE_URL]);

    // Fetch and cycle through available animals
    useEffect(() => {
        const fetchAvailableAnimals = async () => {
            if (authToken) {
                try {
                    console.log('[Available Animals] Fetching available animals...');
                    // Get public animals with status=Available using query parameter
                    const response = await axios.get(`${API_BASE_URL}/public/global/animals?status=Available`);
                    console.log('[Available Animals] API Response:', response.data);
                    if (response.data && response.data.length > 0) {
                        // Log all unique status values to see what's actually in the data
                        const uniqueStatuses = [...new Set(response.data.map(a => a.status))];
                        console.log('[Available Animals] All unique status values:', uniqueStatuses);
                        console.log('[Available Animals] First animal status:', response.data[0].status);
                        
                        // Check if specific Available animals are in the response
                        const testIds = ['CTC432', 'CTC24', 'CTC20', 'CTC17', 'CTC18'];
                        testIds.forEach(id => {
                            const found = response.data.find(a => a.id_public === id);
                            console.log(`[Available Animals] Looking for ${id}:`, found ? `FOUND - status: ${found.status}` : 'NOT FOUND');
                        });
                        
                        // The /public/global/animals endpoint already returns only public animals
                        // We just need to filter by status='Available' client-side
                        const filtered = response.data.filter(animal => 
                            animal.status === 'Available'
                        );
                        console.log('[Available Animals] Filtered count:', filtered.length, 'animals');

                        // Enrich animals with owner country so we can render flag on the showcase card
                        const ownerIds = [...new Set(filtered.map(animal => animal.ownerId_public).filter(Boolean))];
                        const ownerProfiles = await Promise.all(ownerIds.map(async (id_public) => {
                            try {
                                const profileResp = await axios.get(`${API_BASE_URL}/public/profile/${id_public}`);
                                return { id_public, country: profileResp.data?.country || null };
                            } catch (err) {
                                console.warn('[Available Animals] Failed to fetch profile for', id_public, err?.message);
                                return { id_public, country: null };
                            }
                        }));
                        const ownerCountryMap = new Map(ownerProfiles.map(p => [p.id_public, p.country]));
                        const enriched = filtered.map(animal => ({
                            ...animal,
                            ownerCountry: ownerCountryMap.get(animal.ownerId_public) || null,
                        }));

                        // Shuffle to show random animals
                        const shuffled = enriched.sort(() => Math.random() - 0.5);
                        setAvailableAnimals(shuffled);
                        setCurrentAvailableIndex(0);
                    } else {
                        console.log('[Available Animals] No animals found in response');
                        // Clear if no available animals found
                        setAvailableAnimals([]);
                    }
                } catch (error) {
                    console.error('[Available Animals] Failed to fetch:', error);
                    setAvailableAnimals([]);
                }
            } else {
                console.log('[Available Animals] No authToken, skipping fetch');
            }
        };
        
        // Store the function for manual refresh
        window.refreshAvailableAnimals = fetchAvailableAnimals;
        
        // Initial fetch
        fetchAvailableAnimals();
        
        // Continuous refresh every 2 minutes to check for new available animals
        const refreshInterval = setInterval(fetchAvailableAnimals, 120000);
        
        return () => {
            clearInterval(refreshInterval);
            delete window.refreshAvailableAnimals;
        };
    }, [authToken, API_BASE_URL]);

    // Auto-cycle through available animals every 30 seconds
    useEffect(() => {
        if (availableAnimals.length > 1 && authToken) {
            const cycleInterval = setInterval(() => {
                setCurrentAvailableIndex(prev => (prev + 1) % availableAnimals.length);
            }, 30000);
            
            return () => clearInterval(cycleInterval);
        }
    }, [availableAnimals.length, authToken]);

    // Fetch breeder info when viewing an animal
    useEffect(() => {
        const fetchViewBreederInfo = async () => {
            if (animalToView?.breederId_public && currentView === 'view-animal') {
                try {
                    const response = await axios.get(
                        `${API_BASE_URL}/public/profiles/search?query=${animalToView.breederId_public}&limit=1`
                    );
                    if (response.data && response.data.length > 0) {
                        setViewAnimalBreederInfo(response.data[0]);
                    }
                } catch (error) {
                    console.error('Failed to fetch breeder info for view:', error);
                    setViewAnimalBreederInfo(null);
                }
            } else {
                setViewAnimalBreederInfo(null);
            }
        };
        fetchViewBreederInfo();
    }, [animalToView, currentView, API_BASE_URL]);

    const fetchNotificationCount = useCallback(async () => {
        if (!authToken) return;
        try {
            console.log('[fetchNotificationCount] Fetching notification count...');
            const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('[fetchNotificationCount] Response:', response.data);
            console.log('[fetchNotificationCount] Setting count to:', response.data?.count || 0);
            setNotificationCount(response.data?.count || 0);
        } catch (error) {
            console.error('Failed to fetch notification count:', error);
        }
    }, [authToken, API_BASE_URL]);

    const fetchUnreadMessageCount = useCallback(async () => {
        if (!authToken) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/messages/unread-count`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setUnreadMessageCount(response.data?.count || 0);
        } catch (error) {
            console.error('Failed to fetch message count:', error);
        }
    }, [authToken, API_BASE_URL]);

    useEffect(() => {
        if (authToken) {
            fetchNotificationCount();
            fetchUnreadMessageCount();
            // Poll for new notifications and messages every 30 seconds
            const interval = setInterval(() => {
                fetchNotificationCount();
                fetchUnreadMessageCount();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [authToken, fetchNotificationCount, fetchUnreadMessageCount]);

    // Mark donation highlight as seen after 8 seconds
    useEffect(() => {
        if (authToken && !hasSeenDonationHighlight) {
            const timer = setTimeout(() => {
                setHasSeenDonationHighlight(true);
                localStorage.setItem('hasSeenDonationHighlight', 'true');
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [authToken, hasSeenDonationHighlight]);
	
    // Fetch global species list
    useEffect(() => {
        const fetchSpecies = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/species`);
                setSpeciesOptions(response.data);
            } catch (error) {
                console.error('Failed to fetch species:', error);
                // Fallback to defaults if API fails
                setSpeciesOptions([
                    { name: 'Mouse', category: 'Rodent', isDefault: true },
                    { name: 'Rat', category: 'Rodent', isDefault: true },
                    { name: 'Hamster', category: 'Rodent', isDefault: true }
                ]);
            }
        };
        fetchSpecies();
    }, [API_BASE_URL]);
	
    // Fetch community users (newest + active)
    useEffect(() => {
        const fetchCommunityUsers = async () => {
            try {
                const [newestResponse, activeResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/public/users/newest?limit=5`),
                    axios.get(`${API_BASE_URL}/public/users/active?minutes=15`)
                ]);
                const newest = newestResponse.data || [];
                const active = activeResponse.data || [];
                
                // Remove duplicates: filter out active users who are already in newest
                const newestIds = new Set(newest.map(u => u.id_public));
                const uniqueActive = active.filter(u => !newestIds.has(u.id_public));
                
                setNewestUsers(newest);
                setActiveUsers(uniqueActive);
            } catch (error) {
                console.error('Error fetching community users:', error);
            }
        };
        
        if (authToken) {
            fetchCommunityUsers();
            // Refresh community users every 2 minutes
            const interval = setInterval(fetchCommunityUsers, 120000);
            return () => clearInterval(interval);
        }
    }, [authToken, API_BASE_URL]);
    
    // Auto-scroll effect for community banner - back and forth on desktop
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer || (!newestUsers.length && !activeUsers.length)) return;
        
        // Disable auto-scroll on mobile to prevent jittery behavior
        const isMobile = window.innerWidth < 768;
        if (isMobile) return;
        
        let scrollInterval;
        let isPaused = false;
        let isScrollingRight = true;
        const scrollSpeed = 0.5; // pixels per interval
        
        const startScroll = () => {
            scrollInterval = setInterval(() => {
                if (!isPaused && scrollContainer) {
                    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
                    let currentScroll = scrollContainer.scrollLeft;

                    if (isScrollingRight) {
                        currentScroll += scrollSpeed;
                        if (currentScroll >= maxScroll) {
                            currentScroll = maxScroll;
                            isScrollingRight = false;
                        }
                    } else {
                        currentScroll -= scrollSpeed;
                        if (currentScroll <= 0) {
                            currentScroll = 0;
                            isScrollingRight = true;
                        }
                    }
                    
                    scrollContainer.scrollLeft = currentScroll;
                }
            }, 50);
        };
        
        const handleMouseEnter = () => { isPaused = true; };
        const handleMouseLeave = () => { isPaused = false; };
        
        scrollContainer.addEventListener('mouseenter', handleMouseEnter);
        scrollContainer.addEventListener('mouseleave', handleMouseLeave);
        
        startScroll();
        
        return () => {
            clearInterval(scrollInterval);
            scrollContainer?.removeEventListener('mouseenter', handleMouseEnter);
            scrollContainer?.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [newestUsers, activeUsers]);
	
    const handleBugReportSubmit = async (e) => {
        e.preventDefault();
        if (!bugReportDescription.trim()) {
            showModalMessage('Error', 'Please enter a description for your report.');
            return;
        }
        
        setBugReportSubmitting(true);
        try {
            await axios.post(`${API_BASE_URL}/bug-reports`, {
                category: bugReportCategory,
                description: bugReportDescription,
                page: currentView
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            showModalMessage('Success', 'Thank you for your report! We will review it soon.');
            setShowBugReportModal(false);
            setBugReportDescription('');
            setBugReportCategory('Bug');
        } catch (error) {
            console.error('Failed to submit bug report:', error);
            showModalMessage('Error', 'Failed to submit report. Please try again.');
        } finally {
            setBugReportSubmitting(false);
        }
    };
    
    const handleLoginSuccess = (token) => {
        setAuthToken(token);
        try {
            localStorage.setItem('authToken', token);
        } catch (e) {
            console.warn('Could not persist authToken to localStorage', e);
        }
        navigate('/');
        setIsRegister(false);
    };

    const handleEditAnimal = (animal) => {
        setAnimalToEdit(animal);
        setSpeciesToAdd(animal.species); 
        navigate('/edit-animal');
    };

    const handleViewAnimal = (animal) => {
        console.log('[handleViewAnimal] Viewing animal:', animal);
        
        // Normalize parent field names (backend uses sireId_public/damId_public, frontend uses fatherId_public/motherId_public)
        const normalizedAnimal = {
            ...animal,
            fatherId_public: animal.fatherId_public || animal.sireId_public,
            motherId_public: animal.motherId_public || animal.damId_public
        };
        
        // Set initial inbreeding coefficient for immediate display
        if (!normalizedAnimal.fatherId_public && !normalizedAnimal.motherId_public) {
            // Animals with no parents have 0% COI by definition
            normalizedAnimal.inbreedingCoefficient = 0;
        }
        // Use existing COI if available, will be updated in background
        
        console.log('[handleViewAnimal] Father ID:', normalizedAnimal.fatherId_public, 'Mother ID:', normalizedAnimal.motherId_public);
        setAnimalToView(normalizedAnimal);
        navigate('/view-animal');
        
        // Recalculate COI in background (non-blocking) for animals with parents
        if ((normalizedAnimal.fatherId_public || normalizedAnimal.motherId_public) && authToken) {
            axios.get(`${API_BASE_URL}/animals/${normalizedAnimal.id_public}/inbreeding`, {
                params: { generations: 50 },
                headers: { Authorization: `Bearer ${authToken}` }
            })
            .then(coiResponse => {
                // Update the animal with fresh COI
                setAnimalToView(prev => ({
                    ...prev,
                    inbreedingCoefficient: coiResponse.data.inbreedingCoefficient
                }));
            })
            .catch(error => {
                console.log(`Could not calculate COI for animal ${normalizedAnimal.id_public}:`, error);
            });
        }
    };

    // Set up global handler for viewing public animals from search modal
    useEffect(() => {
        window.handleViewPublicAnimal = (animal) => {
            setViewingPublicAnimal(animal);
        };
        return () => {
            delete window.handleViewPublicAnimal;
        };
    }, []);

    const handleSaveAnimal = async (method, url, data) => {
        if (userProfile && !data.ownerId_public) {
            data.ownerId_public = userProfile.id_public;
        }
        try {
            console.debug('handleSaveAnimal called:', method, url, data);
            const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
            let response;
            if (method === 'post') {
                response = await axios.post(url, data, { headers });
            } else if (method === 'put') {
                response = await axios.put(url, data, { headers });
            }
            
            // After saving, if we were editing an animal, refetch it to get updated data
            if (method === 'put' && animalToEdit) {
                try {
                    const refreshedAnimal = await axios.get(`${API_BASE_URL}/animals/${animalToEdit.id_public}`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    setAnimalToView(refreshedAnimal.data);
                } catch (refreshError) {
                    console.error('Failed to refresh animal data after save:', refreshError);
                    // Still use the old data if refresh fails
                    setAnimalToView(animalToEdit);
                }
            }
            
            return response;
        } catch (error) {
            console.error('handleSaveAnimal error:', error.response?.data || error.message || error);
            throw error;
        }
    };

        const handleDeleteAnimal = async (id_public) => {
        try {
            await axios.delete(`${API_BASE_URL}/animals/${id_public}`);
            navigate('/');
            showModalMessage('Success', `Animal with ID ${id_public} has been successfully deleted.`);
        } catch (error) {
            console.error('Failed to delete animal:', error);
            showModalMessage('Error', `Failed to delete animal: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleHideViewOnlyAnimal = async (id_public) => {
        if (!window.confirm('Hide this view-only animal? You can restore it later from the hidden animals list.')) {
            return;
        }
        try {
            await axios.post(`${API_BASE_URL}/animals/${id_public}/hide`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            navigate('/');
            showModalMessage('Success', 'View-only animal hidden. You can restore it anytime from the hidden animals section.');
        } catch (error) {
            console.error('Failed to hide animal:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to hide animal');
        }
    };

    const handleRestoreViewOnlyAnimal = async (id_public) => {
        try {
            await axios.post(`${API_BASE_URL}/animals/${id_public}/restore`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'View-only animal restored to your list!');
            // Refresh the view
            if (currentView === 'hidden-animals') {
                fetchHiddenAnimals();
            }
        } catch (error) {
            console.error('Failed to restore animal:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to restore animal');
        }
    };

    const [hiddenAnimals, setHiddenAnimals] = useState([]);
    const [loadingHidden, setLoadingHidden] = useState(false);

    const fetchHiddenAnimals = async () => {
        setLoadingHidden(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/animals/hidden/list`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setHiddenAnimals(response.data || []);
        } catch (error) {
            console.error('Failed to fetch hidden animals:', error);
            showModalMessage('Error', 'Failed to load hidden animals');
        } finally {
            setLoadingHidden(false);
        }
    };

    const handleSearchTransferUser = async () => {
        if (transferUserQuery.length < 2) return;
        
        setTransferSearching(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/public-profiles/search`, {
                params: { query: transferUserQuery },
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setTransferUserResults(response.data || []);
        } catch (error) {
            console.error('Error searching users:', error);
            setTransferUserResults([]);
        } finally {
            setTransferSearching(false);
        }
    };

    const handleSubmitTransfer = async () => {
        if (!transferSelectedUser || !transferPrice) {
            showModalMessage('Error', 'Please select a buyer and enter a price');
            return;
        }

        try {
            const transactionData = {
                type: 'sale',
                animalId: transferAnimal.id_public,
                animalName: transferAnimal.name,
                price: parseFloat(transferPrice),
                buyer: transferSelectedUser.breederName || transferSelectedUser.personalName,
                buyerUserId: transferSelectedUser.userId_backend,
                date: new Date().toISOString().split('T')[0],
                notes: transferNotes
            };

            await axios.post(`${API_BASE_URL}/budget/transactions`, transactionData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            showModalMessage('Success', `Transfer request sent to ${transferSelectedUser.breederName || transferSelectedUser.personalName}!`);
            setShowTransferModal(false);
            setTransferAnimal(null);
            setTransferUserQuery('');
            setTransferUserResults([]);
            setTransferSelectedUser(null);
            setTransferPrice('');
            setTransferNotes('');
            navigate('/');
        } catch (error) {
            console.error('Error creating transfer:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to create transfer');
        }
    };

    if (!authToken) {
        // Allow unauthenticated users to access search and genetics calculator
        const mainTitle = isRegister ? 'Create Account' : 'Welcome';
        
        // Handle public profile viewing for non-logged-in users
        if (viewingPublicProfile) {
            return (
                <div className="min-h-screen bg-page-bg flex flex-col items-center p-6 font-sans">
                    {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
                    {viewingPublicAnimal && (
                        <ViewOnlyAnimalDetail 
                            animal={viewingPublicAnimal}
                            onClose={() => setViewingPublicAnimal(null)}
                            API_BASE_URL={API_BASE_URL}
                            onViewProfile={(user) => setViewingPublicProfile(user)}
                        />
                    )}
                    
                    <header className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                        <CustomAppLogo size="w-10 h-10" />
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => setShowUserSearchModal(true)}
                                className="px-3 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition flex items-center"
                                data-tutorial-target="global-search-btn"
                            >
                                <Search size={18} className="mr-1" /> Search
                            </button>
                            <button 
                                onClick={() => { setViewingPublicProfile(null); navigate('/'); }}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition flex items-center"
                            >
                                <LogIn size={18} className="mr-1" /> Login
                            </button>
                        </div>
                    </header>
                    
                    {showUserSearchModal && (
                        <UserSearchModal 
                            onClose={() => setShowUserSearchModal(false)} 
                            showModalMessage={showModalMessage} 
                            API_BASE_URL={API_BASE_URL}
                            onSelectUser={(user) => {
                                setShowUserSearchModal(false);
                                setViewingPublicProfile(user);
                            }}
                        />
                    )}
                    
                    <PublicProfileView 
                        profile={viewingPublicProfile}
                        onBack={() => { setViewingPublicProfile(null); navigate('/'); }}
                        onViewAnimal={(animal) => setViewingPublicAnimal(animal)}
                        API_BASE_URL={API_BASE_URL}
                    />
                </div>
            );
        }
        
        // Genetics calculator for non-logged-in users
        if (currentView === 'genetics-calculator') {
            return (
                <div className="min-h-screen bg-page-bg flex flex-col items-center p-6 font-sans">
                    {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
                    
                    <header className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                        <CustomAppLogo size="w-10 h-10" />
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => setShowUserSearchModal(true)}
                                className="px-3 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition flex items-center"
                            >
                                <Search size={18} className="mr-1" /> Search
                            </button>
                            <button 
                                onClick={() => navigate('/')}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition flex items-center"
                            >
                                <LogIn size={18} className="mr-1" /> Login
                            </button>
                        </div>
                    </header>
                    
                    {showUserSearchModal && (
                        <UserSearchModal 
                            onClose={() => setShowUserSearchModal(false)} 
                            showModalMessage={showModalMessage} 
                            API_BASE_URL={API_BASE_URL}
                            onSelectUser={(user) => {
                                setShowUserSearchModal(false);
                                setViewingPublicProfile(user);
                            }}
                        />
                    )}
                    
                    {viewingPublicAnimal && (
                        <ViewOnlyAnimalDetail 
                            animal={viewingPublicAnimal}
                            onClose={() => setViewingPublicAnimal(null)}
                            API_BASE_URL={API_BASE_URL}
                            onViewProfile={(user) => setViewingPublicProfile(user)}
                        />
                    )}
                    
                    <MouseGeneticsCalculator
                        API_BASE_URL={API_BASE_URL}
                        authToken={null}
                    />
                </div>
            );
        }
        
        // Donation view for non-logged-in users
        if (currentView === 'donation') {
            return (
                <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6 font-sans">
                    {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
                    
                    <DonationView onBack={() => navigate('/')} />
                </div>
            );
        }
        
        // Default auth view with search button
        return (
            <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6 font-sans">
                {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
                
                {/* Public navigation header */}
                <header className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                    <CustomAppLogo size="w-10 h-10" />
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => setShowUserSearchModal(true)}
                            className="px-3 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition flex items-center"
                            data-tutorial-target="global-search-btn"
                        >
                            <Search size={18} className="mr-1" /> Search
                        </button>
                        <button 
                            onClick={() => navigate('/genetics-calculator')}
                            className="px-3 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition flex items-center"
                        >
                            <Cat size={18} className="mr-1" /> Genetics
                        </button>
                    </div>
                </header>
                
                {showUserSearchModal && (
                    <UserSearchModal 
                        onClose={() => setShowUserSearchModal(false)} 
                        showModalMessage={showModalMessage} 
                        API_BASE_URL={API_BASE_URL}
                        onSelectUser={(user) => {
                            setShowUserSearchModal(false);
                            setViewingPublicProfile(user);
                        }}
                    />
                )}
                
                {viewingPublicAnimal && (
                    <ViewOnlyAnimalDetail 
                        animal={viewingPublicAnimal}
                        onClose={() => setViewingPublicAnimal(null)}
                        API_BASE_URL={API_BASE_URL}
                        onViewProfile={(user) => setViewingPublicProfile(user)}
                    />
                )}
                
                {/* Logo above all content */}
                <div className="flex flex-col items-center mb-6">
                    <CustomAppLogo size="w-32 h-32" />
                </div>
                
                {/* 3-Column Layout: Donation | Auth Form | Features */}
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* LEFT: Donation Section */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-gradient-to-r from-pink-500 to-red-500 p-2.5 rounded-full">
                                <Heart size={24} className="text-white fill-current" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Support CritterTrack</h3>
                        </div>
                        
                        <p className="text-sm text-gray-700 leading-relaxed mb-4">
                            CritterTrack is <strong>completely free</strong> and developed by a single independent developer 
                            passionate about helping breeders manage their programs.
                        </p>
                        
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            Your support helps cover server costs and enables continuous improvements. Every contribution, 
                            no matter the size, makes a difference!
                        </p>
                        
                        <button
                            onClick={() => navigate('/donation')}
                            className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition flex items-center justify-center gap-2"
                        >
                            <Heart size={18} className="fill-current" />
                            Learn More & Donate
                        </button>
                    </div>
                    
                    {/* MIDDLE: Auth Form */}
                    <div>
                        <AuthView 
                            onLoginSuccess={handleLoginSuccess} 
                            showModalMessage={showModalMessage} 
                            isRegister={isRegister} 
                            setIsRegister={setIsRegister} 
                            mainTitle={mainTitle}
                            onShowTerms={() => setShowTermsModal(true)}
                            onShowPrivacy={() => setShowPrivacyModal(true)}
                        />
                    </div>
                    
                    {/* RIGHT: Features Summary */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">What's Included</h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg mt-0.5">
                                    <ClipboardList size={18} className="text-primary-dark" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">Animal Management</h4>
                                    <p className="text-xs text-gray-600">Track your animals with detailed records, photos, and genetic codes</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg mt-0.5">
                                    <BookOpen size={18} className="text-primary-dark" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">Litter Tracking</h4>
                                    <p className="text-xs text-gray-600">Manage breeding pairs, track litters, and monitor offspring</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg mt-0.5">
                                    <Cat size={18} className="text-primary-dark" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">Genetics Calculator</h4>
                                    <p className="text-xs text-gray-600">Predict offspring outcomes and calculate inbreeding coefficients</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg mt-0.5">
                                    <DollarSign size={18} className="text-primary-dark" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">Budget Tracking</h4>
                                    <p className="text-xs text-gray-600">Monitor expenses and income for your breeding program</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg mt-0.5">
                                    <Search size={18} className="text-primary-dark" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">Public Profiles</h4>
                                    <p className="text-xs text-gray-600">Share your animals and connect with other breeders</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {showTermsModal && <TermsOfService onClose={() => setShowTermsModal(false)} />}
                {showPrivacyModal && <PrivacyPolicy onClose={() => setShowPrivacyModal(false)} />}
            </div>
        );
    }

     return (
        <div className="min-h-screen bg-page-bg flex flex-col font-sans">
            {/* Fixed Donation Button - Top Left */}
            <div className="fixed top-4 left-4 z-[60]">
                <button
                    onClick={() => {
                        navigate('/');
                        if (!hasSeenDonationHighlight) {
                            setHasSeenDonationHighlight(true);
                            localStorage.setItem('hasSeenDonationHighlight', 'true');
                        }
                    }}
                    className={`bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white p-2.5 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center ${
                        !hasSeenDonationHighlight ? 'animate-pulse ring-4 ring-pink-300 ring-opacity-50' : ''
                    }`}
                    title="Support CritterTrack"
                    aria-label="Support CritterTrack"
                >
                    <Heart size={20} className="fill-current" />
                </button>
                
                {/* First-time tooltip */}
                {!hasSeenDonationHighlight && (
                    <div className="absolute top-full mt-2 left-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap animate-bounce">
                        <div className="absolute bottom-full left-4 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-gray-900"></div>
                        💝 Support CritterTrack
                    </div>
                )}
            </div>
            
            {/* Available Animal Showcase - Top Right */}
            {currentView === 'list' && (() => {
                console.log('[Available Animals Showcase] availableAnimals.length:', availableAnimals.length, 'currentIndex:', currentAvailableIndex);
                return availableAnimals.length > 0 && availableAnimals[currentAvailableIndex];
            })() && (
                <div className="hidden lg:block absolute top-20 right-4 z-[60] w-48">
                    <div 
                        key={currentAvailableIndex}
                        onClick={() => setViewingPublicAnimal(availableAnimals[currentAvailableIndex])}
                        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] animate-fadeInScale"
                        style={{
                            animation: 'fadeInScale 0.5s ease-in-out'
                        }}
                    >
                        <div className="bg-gradient-to-r from-primary to-accent p-2 relative">
                            <p className="text-xs font-semibold text-black text-center flex items-center justify-center gap-1">
                                <span>🏷️</span> Available Now
                            </p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.refreshAvailableAnimals && window.refreshAvailableAnimals();
                                }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded transition-colors"
                                title="Refresh available animals"
                            >
                                <RefreshCw size={14} className="text-black" />
                            </button>
                        </div>
                        {availableAnimals[currentAvailableIndex].imageUrl && (
                            <img 
                                src={availableAnimals[currentAvailableIndex].imageUrl} 
                                alt={availableAnimals[currentAvailableIndex].name}
                                className="w-full h-32 object-cover"
                            />
                        )}
                        <div className="p-2">
                            <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-800 truncate">
                                        {availableAnimals[currentAvailableIndex].prefix && `${availableAnimals[currentAvailableIndex].prefix} `}
                                        {availableAnimals[currentAvailableIndex].name}
                                        {availableAnimals[currentAvailableIndex].suffix && ` ${availableAnimals[currentAvailableIndex].suffix}`}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                        {availableAnimals[currentAvailableIndex].species}
                                        {availableAnimals[currentAvailableIndex].variety && ` • ${availableAnimals[currentAvailableIndex].variety}`}
                                    </p>
                                </div>
                                {availableAnimals[currentAvailableIndex].ownerCountry && (
                                    <span
                                        className={`${getCountryFlag(availableAnimals[currentAvailableIndex].ownerCountry)} inline-block h-4 w-6 flex-shrink-0 mt-1`}
                                        title={getCountryName(availableAnimals[currentAvailableIndex].ownerCountry)}
                                    ></span>
                                )}
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    {availableAnimals[currentAvailableIndex].gender}
                                </span>
                                <span className="text-xs text-accent font-medium">
                                    Click to view →
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Welcome Banner - Shows once to new users within first month */}
            {authToken && !hasSeenWelcomeBanner && !tutorialLoading && userProfile && (() => {
                // Check if account is less than 30 days old
                const accountCreationDate = new Date(userProfile.creationDate);
                const now = new Date();
                const daysSinceCreation = Math.floor((now - accountCreationDate) / (1000 * 60 * 60 * 24));
                return daysSinceCreation <= 30;
            })() && (
                <WelcomeBanner 
                    isMobile={isMobile}
                    onStartTutorial={() => {
                        // Find the first incomplete lesson to resume from
                        let startIndex = 0;
                        for (let i = 0; i < TUTORIAL_LESSONS.onboarding.length; i++) {
                            if (!isTutorialCompleted(TUTORIAL_LESSONS.onboarding[i].id)) {
                                startIndex = i;
                                break;
                            }
                        }
                        
                        setCurrentTutorialIndex(startIndex);
                        setCurrentTutorialId(TUTORIAL_LESSONS.onboarding[startIndex].id);
                        setShowTutorialOverlay(true);
                        dismissWelcomeBanner();
                    }}
                    onDismiss={dismissWelcomeBanner}
                />
            )}
            
            <div className="flex flex-col items-center p-6 flex-1">
            {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
            {showUserSearchModal && (
                <UserSearchModal 
                    onClose={() => setShowUserSearchModal(false)} 
                    showModalMessage={showModalMessage} 
                    API_BASE_URL={API_BASE_URL}
                    onSelectUser={(user) => {
                        setShowUserSearchModal(false);
                        navigate(`/user/${user.id_public}`);
                    }}
                />
            )}
            {viewingPublicAnimal && (
                <ViewOnlyAnimalDetail 
                    animal={viewingPublicAnimal}
                    onClose={() => setViewingPublicAnimal(null)}
                    API_BASE_URL={API_BASE_URL}
                    onViewProfile={(user) => navigate(`/user/${user.id_public}`)}
                />
            )}
            
            <header className="w-full bg-white p-4 rounded-xl shadow-lg mb-6 max-w-4xl">
                {/* Desktop: Single row layout */}
                <div className="hidden md:flex justify-between items-center">
                    <CustomAppLogo size="w-10 h-10" />
                    
                    <nav className="flex space-x-3">
                        <button onClick={() => navigate('/')} className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'list' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <ClipboardList size={18} className="mb-1" />
                            <span>Animals</span>
                        </button>
                        <button onClick={() => navigate('/litters')} data-tutorial-target="litters-btn" className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'litters' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <BookOpen size={18} className="mb-1" />
                            <span>Litters</span>
                        </button>
                        <button onClick={() => navigate('/budget')} data-tutorial-target="budget-btn" className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'budget' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <DollarSign size={18} className="mb-1" />
                            <span>Budget</span>
                        </button>
                        <button onClick={() => navigate('/genetics-calculator')} data-tutorial-target="genetics-btn" className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'genetics-calculator' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <Cat size={18} className="mb-1" />
                            <span>Genetics</span>
                        </button>
                        <button onClick={() => navigate('/profile')} data-tutorial-target="profile-btn" className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'profile' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <User size={18} className="mb-1" />
                            <span>Profile</span>
                        </button>
                        {!isMobile && (
                            <button onClick={() => setShowInfoTab(true)} className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center text-gray-600 hover:bg-gray-100`} title="Tutorials & Help">
                                <BookOpen size={18} className="mb-1" />
                                <span>Help</span>
                            </button>
                        )}
                    </nav>

                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => setShowUserSearchModal(true)} 
                            className="flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-3 rounded-lg transition duration-150 shadow-sm"
                            title="Search Users by Name or ID"
                            data-tutorial-target="global-search-btn"
                        >
                            <Search size={18} className="mb-1" />
                            <span className="text-xs">Search</span>
                        </button>

                        <button
                            onClick={() => {
                                setShowNotifications(true);
                                setNotificationCount(0);
                                fetchNotificationCount();
                            }}
                            data-tutorial-target="notification-bell"
                            className="relative flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-3 rounded-lg transition duration-150 shadow-sm"
                            title="Notifications"
                        >
                            <Bell size={18} />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </button>
                        
                        <button
                            onClick={() => setShowMessages(true)}
                            className="relative flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-3 rounded-lg transition duration-150 shadow-sm"
                            title="Messages"
                        >
                            <MessageSquare size={18} />
                            {unreadMessageCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                </span>
                            )}
                        </button>
                        
                        <button 
                            onClick={() => handleLogout(false)} 
                            title="Log Out"
                            className="bg-accent hover:bg-accent/80 text-white font-semibold py-2 px-3 rounded-lg transition duration-150 shadow-md flex flex-col items-center"
                        >
                            <LogOut size={18} className="mb-1" />
                            <span className="text-xs">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Mobile: Two row layout */}
                <div className="md:hidden">
                    {/* First row: Logo and action buttons */}
                    <div className="flex justify-between items-center mb-3">
                        <CustomAppLogo size="w-8 h-8" />
                        
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={() => setShowUserSearchModal(true)} 
                                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition duration-150 shadow-sm"
                                title="Search"
                                data-tutorial-target="global-search-btn"
                            >
                                <Search size={18} />
                            </button>

                            <button
                                onClick={() => {
                                    setShowNotifications(true);
                                    setNotificationCount(0);
                                    fetchNotificationCount();
                                }}
                                data-tutorial-target="notification-bell"
                                className="relative flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition duration-150 shadow-sm"
                                title="Notifications"
                            >
                                <Bell size={18} />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </span>
                                )}
                            </button>
                            
                            <button
                                onClick={() => setShowMessages(true)}
                                className="relative flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition duration-150 shadow-sm"
                                title="Messages"
                            >
                                <MessageSquare size={18} />
                                {unreadMessageCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                    </span>
                                )}
                            </button>
                            
                            <button 
                                onClick={() => handleLogout(false)} 
                                title="Log Out"
                                className="bg-accent hover:bg-accent/80 text-white font-semibold p-2 rounded-lg transition duration-150 shadow-md"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Second row: Navigation */}
                    <nav className="flex justify-between space-x-1">
                        <button onClick={() => navigate('/')} className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition duration-150 ${currentView === 'list' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <ClipboardList size={16} className="inline mb-0.5" />
                            <span className="block">Animals</span>
                        </button>
                        <button onClick={() => navigate('/litters')} data-tutorial-target="litters-btn" className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition duration-150 ${currentView === 'litters' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <BookOpen size={16} className="inline mb-0.5" />
                            <span className="block">Litters</span>
                        </button>
                        <button onClick={() => navigate('/budget')} data-tutorial-target="budget-btn" className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition duration-150 ${currentView === 'budget' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <DollarSign size={16} className="inline mb-0.5" />
                            <span className="block">Budget</span>
                        </button>
                        <button onClick={() => navigate('/genetics-calculator')} data-tutorial-target="genetics-btn" className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition duration-150 ${currentView === 'genetics-calculator' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <Cat size={16} className="inline mb-0.5" />
                            <span className="block">Genetics</span>
                        </button>
                        <button onClick={() => navigate('/profile')} data-tutorial-target="profile-btn" className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition duration-150 ${currentView === 'profile' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <User size={16} className="inline mb-0.5" />
                            <span className="block">Profile</span>
                        </button>
                        <button onClick={() => setShowInfoTab(true)} className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition duration-150 text-gray-600 hover:bg-gray-100`}>
                            <BookOpen size={16} className="inline mb-0.5" />
                            <span className="block">Help</span>
                        </button>
                    </nav>
                </div>
            </header>

            {showNotifications && (
                <NotificationPanel
                    authToken={authToken}
                    API_BASE_URL={API_BASE_URL}
                    onClose={() => {
                        setShowNotifications(false);
                        fetchNotificationCount();
                    }}
                    onNotificationChange={fetchNotificationCount}
                    showModalMessage={showModalMessage}
                    onViewAnimal={(animalId_public, viewFromNotification) => {
                        // Fetch animal with notification flag to override private animal access
                        axios.get(`${API_BASE_URL}/animals/any/${animalId_public}?viewFromNotification=${viewFromNotification}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        })
                            .then(res => {
                                setAnimalToView(res.data);
                                navigate('/view-animal');
                                setShowNotifications(false);
                            })
                            .catch(err => {
                                console.error('Failed to load animal:', err);
                                showModalMessage('Error', 'Could not load animal details.');
                            });
                    }}
                />
            )}
            
            {showMessages && (
                <MessagesView
                    authToken={authToken}
                    API_BASE_URL={API_BASE_URL}
                    onClose={() => {
                        setShowMessages(false);
                        setSelectedConversation(null);
                        fetchUnreadMessageCount();
                    }}
                    showModalMessage={showModalMessage}
                    selectedConversation={selectedConversation}
                    setSelectedConversation={setSelectedConversation}
                    userProfile={userProfile}
                />
            )}
            
            {showBugReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Report Issue / Bug</h2>
                            <button 
                                onClick={() => setShowBugReportModal(false)}
                                className="text-gray-500 hover:text-gray-700 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleBugReportSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={bugReportCategory}
                                    onChange={(e) => setBugReportCategory(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                >
                                    <option value="Bug">Bug</option>
                                    <option value="Feature Request">Feature Request</option>
                                    <option value="General Feedback">General Feedback</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={bugReportDescription}
                                    onChange={(e) => setBugReportDescription(e.target.value)}
                                    placeholder="Please describe the issue or feedback in detail..."
                                    rows={6}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary resize-none"
                                />
                            </div>
                            
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowBugReportModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={bugReportSubmitting}
                                    className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {bugReportSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16} />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Report'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tutorial Info Tab Modal */}
            {showInfoTab && (
                <InfoTab 
                    onClose={() => setShowInfoTab(false)}
                    isMobile={isMobile}
                    onStartTutorial={(lessonId) => {
                        setCurrentTutorialId(lessonId);
                        setShowTutorialOverlay(true);
                    }}
                />
            )}

            {/* Tutorial Overlay Modal */}
            {showTutorialOverlay && currentTutorialId && (
                <TutorialOverlay
                    ref={tutorialOverlayRef}
                    lessonId={currentTutorialId}
                    onStepChange={(stepIndex, step) => {
                        setCurrentTutorialStep(step);
                    }}
                    onClose={() => {
                        // Close tutorial and don't show again this session (like "Skip for Now")
                        setShowTutorialOverlay(false);
                        setCurrentTutorialId(null);
                        setCurrentTutorialIndex(0);
                        setCurrentTutorialStep(null);
                        setHasSkippedTutorialThisSession(true);
                    }}
                    onComplete={(signal) => {
                        // Handle "start-advanced" signal from onboarding completion
                        if (signal === 'start-advanced') {
                            // Start the first advanced features tutorial
                            setCurrentTutorialIndex(0);
                            setCurrentTutorialId(TUTORIAL_LESSONS.features[0].id);
                            setCurrentTutorialStep(null);
                            setShowTutorialOverlay(true); // Ensure overlay stays visible
                            return;
                        }

                        // Determine which tutorial array we're in
                        const isInOnboarding = TUTORIAL_LESSONS.onboarding.some(lesson => lesson.id === currentTutorialId);
                        const isInFeatures = TUTORIAL_LESSONS.features.some(lesson => lesson.id === currentTutorialId);

                        if (isInOnboarding) {
                            // Move to next lesson in onboarding sequence
                            setCurrentTutorialIndex(prevIndex => {
                                const nextIndex = prevIndex + 1;
                                if (nextIndex < TUTORIAL_LESSONS.onboarding.length) {
                                    // Show next lesson
                                    setCurrentTutorialId(TUTORIAL_LESSONS.onboarding[nextIndex].id);
                                    setCurrentTutorialStep(null);
                                    return nextIndex;
                                } else {
                                    // All onboarding lessons completed
                                    setShowTutorialOverlay(false);
                                    setCurrentTutorialId(null);
                                    setCurrentTutorialStep(null);
                                    return 0;
                                }
                            });
                        } else if (isInFeatures) {
                            // Move to next lesson in features sequence
                            setCurrentTutorialIndex(prevIndex => {
                                const nextIndex = prevIndex + 1;
                                if (nextIndex < TUTORIAL_LESSONS.features.length) {
                                    // Show next lesson
                                    setCurrentTutorialId(TUTORIAL_LESSONS.features[nextIndex].id);
                                    setCurrentTutorialStep(null);
                                    return nextIndex;
                                } else {
                                    // All feature lessons completed
                                    setShowTutorialOverlay(false);
                                    setCurrentTutorialId(null);
                                    setCurrentTutorialStep(null);
                                    return 0;
                                }
                            });
                        } else {
                            // Fallback: just close the tutorial
                            setShowTutorialOverlay(false);
                            setCurrentTutorialId(null);
                            setCurrentTutorialStep(null);
                        }
                    }}
                />
            )}

            {/* Tutorial Highlight - highlights elements during tutorial */}
            {showTutorialOverlay && currentTutorialStep && currentTutorialStep.highlightElement && (
                <TutorialHighlight 
                    elementSelector={currentTutorialStep.highlightElement}
                    onHighlightClose={() => {}}
                />
            )}

            {/* Profile Card and Community Activity - shown only on list view */}
            {currentView === 'list' && (
                <div className="w-full max-w-4xl mb-6 flex flex-col sm:flex-row gap-4">
                    {/* Profile Card */}
                    {currentView !== 'profile' && userProfile && <UserProfileCard userProfile={userProfile} />}
                    
                    {/* Community Activity Banner */}
                    {(newestUsers.length > 0 || activeUsers.length > 0) && (
                        <div className="flex-1 min-w-0 bg-gradient-to-r from-primary/20 to-accent/20 p-3 rounded-lg border border-primary/30" data-tutorial-target="community-activity">
                            <h3 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
                                <Users size={14} className="mr-2 text-primary-dark" />
                                Community Activity
                            </h3>
                            <div 
                                ref={scrollContainerRef}
                                className="flex overflow-x-auto gap-3 pb-2 scroll-smooth"
                                style={{ scrollbarWidth: 'thin' }}
                            >
                                {/* Newest Members */}
                                {newestUsers.map(user => {
                                    const displayName = (user.showBreederName && user.breederName) 
                                        ? user.breederName 
                                        : ((user.showPersonalName ?? false) ? user.personalName : 'Anonymous');
                                    
                                    return (
                                        <div 
                                            key={`new-${user.id_public}`}
                                            className="flex-shrink-0 bg-white rounded-lg p-2 shadow-sm border-2 border-primary/40 hover:shadow-md transition cursor-pointer min-w-[120px]"
                                            onClick={() => {
                                                navigate(`/user/${user.id_public}`);
                                            }}
                                        >
                                            <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden mx-auto mb-1">
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs font-semibold text-gray-800 text-center truncate">
                                                {displayName}
                                            </p>
                                            <p className="text-xs text-gray-500 text-center truncate">{user.id_public}</p>
                                        </div>
                                    );
                                })}
                                
                                {/* Active Users */}
                                {activeUsers.map(user => {
                                    const displayName = (user.showBreederName && user.breederName) 
                                        ? user.breederName 
                                        : ((user.showPersonalName ?? false) ? user.personalName : 'Anonymous');
                                    
                                    return (
                                        <div 
                                            key={`active-${user.id_public}`}
                                            className="flex-shrink-0 bg-white rounded-lg p-2 shadow-sm border-2 border-accent/40 hover:shadow-md transition cursor-pointer min-w-[120px]"
                                            onClick={() => {
                                                navigate(`/user/${user.id_public}`);
                                            }}
                                        >
                                            <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden mx-auto mb-1">
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs font-semibold text-gray-800 text-center truncate">
                                                {displayName}
                                            </p>
                                            <p className="text-xs text-gray-500 text-center truncate">{user.id_public}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <main className="w-full flex-grow max-w-4xl">
                <Routes>
                    <Route path="/" element={
                        <AnimalList 
                            authToken={authToken} 
                            showModalMessage={showModalMessage} 
                            onEditAnimal={handleEditAnimal} 
                            onViewAnimal={handleViewAnimal}
                            fetchHiddenAnimals={fetchHiddenAnimals}
                            navigate={navigate}
                        />
                    } />
                    <Route path="/list" element={
                        <AnimalList 
                            authToken={authToken} 
                            showModalMessage={showModalMessage} 
                            onEditAnimal={handleEditAnimal} 
                            onViewAnimal={handleViewAnimal}
                            fetchHiddenAnimals={fetchHiddenAnimals}
                            navigate={navigate}
                        />
                    } />
                    <Route path="/donation" element={<DonationView onBack={() => navigate('/')} />} />
                    <Route path="/profile" element={<ProfileView userProfile={userProfile} showModalMessage={showModalMessage} fetchUserProfile={fetchUserProfile} authToken={authToken} onProfileUpdated={setUserProfile} onProfileEditButtonClicked={setProfileEditButtonClicked} />} />
                    <Route path="/litters" element={
                        <LitterManagement
                            authToken={authToken}
                            API_BASE_URL={API_BASE_URL}
                            userProfile={userProfile}
                            showModalMessage={showModalMessage}
                            onViewAnimal={handleViewAnimal}
                            formDataRef={litterFormDataRef}
                            onFormOpenChange={setLitterFormOpen}
                        />
                    } />
                    <Route path="/budget" element={
                        <BudgetingTab
                            authToken={authToken}
                            API_BASE_URL={API_BASE_URL}
                            showModalMessage={showModalMessage}
                            preSelectedAnimal={preSelectedTransferAnimal}
                            preSelectedType={preSelectedTransactionType}
                            onAddModalOpen={() => setBudgetModalOpen(true)}
                        />
                    } />
                    <Route path="/genetics-calculator" element={
                        <MouseGeneticsCalculator
                            API_BASE_URL={API_BASE_URL}
                            authToken={authToken}
                            myAnimals={myAnimalsForCalculator}
                        />
                    } />
                    <Route path="/select-species" element={
                        <SpeciesSelector 
                            speciesOptions={speciesOptions} 
                            onSelectSpecies={(species) => { 
                                setSpeciesToAdd(species); 
                                navigate('/add-animal'); 
                            }} 
                            onManageSpecies={() => navigate('/manage-species')}
                            searchTerm={speciesSearchTerm}
                            setSearchTerm={setSpeciesSearchTerm}
                            categoryFilter={speciesCategoryFilter}
                            setCategoryFilter={setSpeciesCategoryFilter}
                        />
                    } />
                    <Route path="/manage-species" element={
                        <SpeciesManager 
                            speciesOptions={speciesOptions} 
                            setSpeciesOptions={setSpeciesOptions} 
                            onCancel={() => navigate('/select-species')}
                            showModalMessage={showModalMessage}
                            authToken={authToken}
                            API_BASE_URL={API_BASE_URL}
                        />
                    } />
                    <Route path="/add-animal" element={
                        !speciesToAdd ? (
                            <SpeciesSelector
                                speciesOptions={speciesOptions}
                                onSelectSpecies={(species) => {
                                    setSpeciesToAdd(species);
                                    navigate('/add-animal');
                                }}
                                onManageSpecies={() => navigate('/manage-species')}
                                searchTerm={speciesSearchTerm}
                                setSearchTerm={setSpeciesSearchTerm}
                                categoryFilter={speciesCategoryFilter}
                                setCategoryFilter={setSpeciesCategoryFilter}
                            />
                        ) : (
                            <AnimalForm
                                formTitle={`Add New ${speciesToAdd}`}
                                animalToEdit={null}
                                species={speciesToAdd}
                                onSave={handleSaveAnimal}
                                onCancel={() => { navigate('/'); setSpeciesToAdd(null); }}
                                onDelete={null}
                                authToken={authToken}
                                showModalMessage={showModalMessage}
                                API_BASE_URL={API_BASE_URL}
                                userProfile={userProfile}
                                X={X}
                                Search={Search}
                                Loader2={Loader2}
                                LoadingSpinner={LoadingSpinner}
                                PlusCircle={PlusCircle}
                                ArrowLeft={ArrowLeft}
                                Save={Save}
                                Trash2={Trash2}
                                RotateCcw={RotateCcw}
                                GENDER_OPTIONS={GENDER_OPTIONS}
                                STATUS_OPTIONS={STATUS_OPTIONS}
                                AnimalImageUpload={AnimalImageUpload}
                                sectionPrivacy={sectionPrivacy}
                                toggleSectionPrivacy={toggleSectionPrivacy}
                            />
                        )
                    } />
                    <Route path="/edit-animal" element={
                        animalToEdit && (
                            <AnimalForm 
                                formTitle={`Edit ${animalToEdit.name}`}
                                animalToEdit={animalToEdit} 
                                species={animalToEdit.species} 
                                onSave={handleSaveAnimal} 
                                onCancel={() => navigate('/')} 
                                onDelete={handleDeleteAnimal}
                                authToken={authToken} 
                                showModalMessage={showModalMessage}
                                API_BASE_URL={API_BASE_URL}
                                userProfile={userProfile}
                                X={X}
                                Search={Search}
                                Loader2={Loader2}
                                LoadingSpinner={LoadingSpinner}
                                PlusCircle={PlusCircle}
                                ArrowLeft={ArrowLeft}
                                Save={Save}
                                Trash2={Trash2}
                                RotateCcw={RotateCcw}
                                GENDER_OPTIONS={GENDER_OPTIONS}
                                STATUS_OPTIONS={STATUS_OPTIONS}
                                AnimalImageUpload={AnimalImageUpload}
                                sectionPrivacy={sectionPrivacy}
                                toggleSectionPrivacy={toggleSectionPrivacy}
                            />
                        )
                    } />
                    <Route path="/view-animal" element={
                        animalToView && (
                            (() => {
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
                                const formattedBirthDate = animalToView.birthDate
                                    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(animalToView.birthDate))
                                    : '—';
                                const handleShareAnimal = () => {
                                    const url = `${window.location.origin}/animal/${animalToView.id_public}`;
                                    navigator.clipboard.writeText(url).then(() => {
                                        setCopySuccessAnimal(true);
                                        setTimeout(() => setCopySuccessAnimal(false), 2000);
                                    });
                                };
                                return (
                                    <>
                                    <div className="w-full max-w-4xl mx-auto">
                                        <div className="bg-white border border-gray-300 rounded-t-lg p-6 mb-0">
                                            <div className="flex items-start justify-between mb-0">
                                                <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-gray-800 font-medium">
                                                    <ArrowLeft size={20} className="mr-2" />
                                                    Back to Dashboard
                                                </button>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        onClick={handleShareAnimal}
                                                        className="p-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center justify-center"
                                                        title={copySuccessAnimal ? 'Link Copied!' : 'Share Link'}
                                                    >
                                                        <Link size={18} />
                                                    </button>
                                                    {userProfile && animalToView.ownerId_public === userProfile.id_public && !animalToView.isViewOnly && (
                                                        <>
                                                            <button 
                                                                data-tutorial-target="edit-animal-btn"
                                                                onClick={() => { setAnimalToEdit(animalToView); setSpeciesToAdd(animalToView.species); navigate('/edit-animal'); }} 
                                                                className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => { 
                                                                    setPreSelectedTransferAnimal(animalToView);
                                                                    setPreSelectedTransactionType('animal-sale');
                                                                    navigate('/budget');
                                                                }}
                                                                data-tutorial-target="transfer-animal-btn"
                                                                className="bg-accent hover:bg-accent/90 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
                                                            >
                                                                <ArrowLeftRight size={16} />
                                                                Transfer
                                                            </button>
                                                        </>
                                                    )}
                                                    {animalToView.isViewOnly && (
                                                        <button
                                                            onClick={() => handleHideViewOnlyAnimal(animalToView.id_public)}
                                                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition flex items-center gap-2"
                                                        >
                                                            <Archive size={16} />
                                                            Hide
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Tab Navigation - Collapsible */}
                                        <div className="bg-white border border-t-0 border-gray-300">
                                            {/* Toggle Button */}
                                            <div className="px-4 py-2 flex items-center justify-between border-b border-gray-200">
                                                <span className="text-sm font-semibold text-gray-700">Tabs</span>
                                                <button
                                                    onClick={() => setShowTabs(!showTabs)}
                                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                    title={showTabs ? "Collapse tabs" : "Expand tabs"}
                                                >
                                                    {showTabs ? '▼' : '▶'} 
                                                </button>
                                            </div>

                                            {/* Collapsible Tab Panel */}
                                            {showTabs && (
                                                <div className="px-4 py-3 flex flex-wrap gap-2">
                                                    {[
                                                        { id: 1, label: 'Overview', icon: '📋' },
                                                        { id: 2, label: 'Status & Privacy', icon: '🔒' },
                                                        { id: 3, label: 'Physical', icon: '🎨' },
                                                        { id: 4, label: 'Identification', icon: '🏷️' },
                                                        { id: 5, label: 'Lineage', icon: '🌳' },
                                                        { id: 6, label: 'Breeding', icon: '🫘' },
                                                        { id: 7, label: 'Health', icon: '🏥' },
                                                        { id: 8, label: 'Husbandry', icon: '🏠' },
                                                        { id: 9, label: 'Behavior', icon: '🧠' },
                                                        { id: 10, label: 'Records', icon: '📝' },
                                                        { id: 11, label: 'End of Life', icon: '🕊️' }
                                                    ].map(tab => (
                                                        <button
                                                            key={tab.id}
                                                            onClick={() => setDetailViewTab(tab.id)}
                                                            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded transition-colors ${
                                                                detailViewTab === tab.id 
                                                                    ? 'bg-primary text-black' 
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                            title={tab.label}
                                                        >
                                                            <span className="mr-1">{tab.icon}</span>
                                                            {tab.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Tab Content Wrapper */}
                                        <div className="bg-white border border-t-0 border-gray-300 rounded-b-lg p-6">
                                        {/* Tab 1: Overview */}
                                        {detailViewTab === 1 && (
                                            <div className="space-y-6">
                                                {/* Main Card - Two Column Layout */}
                                                <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden relative">
                                                    {/* Public Profile Toggle - Top Right */}
                                                    <div className="absolute top-4 right-4 z-10">
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                const newIsDisplay = !animalToView.isDisplay;
                                                                try {
                                                                    const response = await fetch(`${API_BASE_URL}/animals/${animalToView.id_public}`, {
                                                                        method: 'PUT',
                                                                        headers: {
                                                                            'Content-Type': 'application/json',
                                                                            'Authorization': `Bearer ${authToken}`
                                                                        },
                                                                        body: JSON.stringify({ isDisplay: newIsDisplay })
                                                                    });
                                                                    if (response.ok) {
                                                                        setAnimalToView({ ...animalToView, isDisplay: newIsDisplay });
                                                                        showModalMessage('Success', `Animal is now ${newIsDisplay ? 'public' : 'private'}.`);
                                                                    } else {
                                                                        showModalMessage('Error', 'Failed to update visibility.');
                                                                    }
                                                                } catch (err) {
                                                                    console.error('Error updating visibility:', err);
                                                                    showModalMessage('Error', 'Failed to update visibility.');
                                                                }
                                                            }}
                                                            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                                                animalToView.isDisplay ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {animalToView.isDisplay ? '🌍 Public' : '🔒 Private'}
                                                        </button>
                                                    </div>
                                                    <div className="flex relative">
                                                        {/* Left Column - Image */}
                                                        <div className="w-1/3 p-4 sm:p-6 flex flex-col items-center justify-center relative min-h-80">
                                                            {/* Birthdate badge */}
                                                            {animalToView.birthDate && (
                                                                <div className="absolute top-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-0.5 rounded">
                                                                    {new Date(animalToView.birthDate).toLocaleDateString()}
                                                                </div>
                                                            )}

                                                            {/* Gender badge */}
                                                            <div className="absolute top-2 right-2">
                                                                {animalToView.gender === 'Male' ? <Mars size={20} strokeWidth={2.5} className="text-blue-600" /> : animalToView.gender === 'Female' ? <Venus size={20} strokeWidth={2.5} className="text-pink-600" /> : animalToView.gender === 'Intersex' ? <VenusAndMars size={20} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={20} strokeWidth={2.5} className="text-gray-500" />}
                                                            </div>

                                                            {/* Profile Image */}
                                                            <div className="flex items-center justify-center h-40 w-full">
                                                                {(animalToView.imageUrl || animalToView.photoUrl) ? (
                                                                    <img src={animalToView.imageUrl || animalToView.photoUrl} alt={animalToView.name} className="max-w-32 max-h-32 w-auto h-auto object-contain rounded-md" />
                                                                ) : (
                                                                    <div className="w-32 h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                                        <Cat size={48} />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Icon row */}
                                                            <div className="flex justify-center items-center space-x-2 py-2 mt-2">
                                                                {animalToView.isOwned ? (
                                                                    <Heart size={14} className="text-black" />
                                                                ) : (
                                                                    <HeartOff size={14} className="text-black" />
                                                                )}
                                                                {animalToView.showOnPublicProfile ? (
                                                                    <Eye size={14} className="text-black" />
                                                                ) : (
                                                                    <EyeOff size={14} className="text-black" />
                                                                )}
                                                                {animalToView.isInMating && <Hourglass size={14} className="text-black" />}
                                                                {animalToView.isPregnant && <Bean size={14} className="text-black" />}
                                                                {animalToView.isNursing && <Milk size={14} className="text-black" />}
                                                                {animalToView.isNeutered && <Scissors size={14} className="text-black" />}
                                                            </div>

                                                            {/* Status text */}
                                                            <div className="text-sm font-medium text-gray-700 mt-2">
                                                                {animalToView.isViewOnly ? 'Sold' : (animalToView.status || 'Unknown')}
                                                            </div>
                                                        </div>

                                                        {/* Right Column - Info */}
                                                        <div className="w-2/3 p-4 sm:p-6 flex flex-col border-l border-gray-300 space-y-3">
                                                            {/* Species/Breed/Strain/CTC - At Top */}
                                                            <p className="text-sm text-gray-600">
                                                                {animalToView.species}
                                                                {animalToView.breed && ` • ${animalToView.breed}`}
                                                                {animalToView.strain && ` • ${animalToView.strain}`}
                                                                {animalToView.id_public && ` • ${animalToView.id_public}`}
                                                            </p>

                                                            {/* Name */}
                                                            <h2 className="text-2xl font-bold text-gray-800">
                                                                {animalToView.prefix ? `${animalToView.prefix} ` : ''}
                                                                {animalToView.name}
                                                                {animalToView.suffix ? ` ${animalToView.suffix}` : ''}
                                                            </h2>

                                                            {/* Appearance */}
                                                            {animalToView.birthDate && (
                                                                <div className="text-sm text-gray-700 space-y-1">
                                                                    <p>
                                                                        Date of Birth: {new Date(animalToView.birthDate).toLocaleDateString()} ~ {(() => {
                                                                            const birth = new Date(animalToView.birthDate);
                                                                            const endDate = animalToView.deceasedDate ? new Date(animalToView.deceasedDate) : new Date();
                                                                            let age = endDate.getFullYear() - birth.getFullYear();
                                                                            const monthDiff = endDate.getMonth() - birth.getMonth();
                                                                            if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birth.getDate())) age--;
                                                                            const months = (endDate.getMonth() - birth.getMonth() + 12) % 12;
                                                                            let days = endDate.getDate() - birth.getDate();
                                                                            if (days < 0) {
                                                                                days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
                                                                            }
                                                                            if (age > 0) {
                                                                                return `${age}y ${months}m ${days}d`;
                                                                            } else if (months > 0) {
                                                                                return `${months}m ${days}d`;
                                                                            } else {
                                                                                return `${days}d`;
                                                                            }
                                                                        })()}
                                                                    </p>
                                                                    {animalToView.deceasedDate && (
                                                                        <p className="text-red-600">
                                                                            Deceased: {new Date(animalToView.deceasedDate).toLocaleDateString()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Tags at bottom of right column */}
                                                            {animalToView.tags && animalToView.tags.length > 0 && (
                                                                <div className="border-t border-gray-200 pt-3 mt-3">
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {animalToView.tags.map((tag, idx) => (
                                                                            <span key={idx} className="inline-flex items-center bg-primary text-black text-xs font-semibold px-2 py-1 rounded-full">
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Identification Card */}
                                                {(animalToView.microchipNumber || animalToView.registryCode || animalToView.breederyId || animalToView.pedigreeRegId) && (
                                                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-700 mb-2">Identification</h4>
                                                        <div className="text-sm space-y-1">
                                                            {animalToView.microchipNumber && <div><strong>Microchip:</strong> {animalToView.microchipNumber}</div>}
                                                            {animalToView.registryCode && <div><strong>Registry:</strong> {animalToView.registryCode}</div>}
                                                            {animalToView.breederyId && <div><strong>Identification:</strong> {animalToView.breederyId}</div>}
                                                            {animalToView.pedigreeRegId && <div><strong>Pedigree Reg ID:</strong> {animalToView.pedigreeRegId}</div>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Genetic Code Card */}
                                                {animalToView.geneticCode && (
                                                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-700 mb-2">Genetic Code</h4>
                                                        <div className="text-sm font-mono bg-gray-50 p-2 rounded border border-gray-200">
                                                            {animalToView.geneticCode}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Health Card */}
                                                {(animalToView.currentWeight || animalToView.bcs || animalToView.growthRecords?.length > 0 || animalToView.medicalConditions || animalToView.medications) && (
                                                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-700 mb-2">Health</h4>
                                                        <div className="space-y-3 text-sm">
                                                            {/* Current Measurements Summary */}
                                                            {(() => {
                                                                // Compute current measurements from growth records if available
                                                                let currentWeight = null;
                                                                let currentLength = null;
                                                                let growthRecords = animalToView.growthRecords;
                                                                
                                                                // Parse growthRecords if it's a string
                                                                if (typeof growthRecords === 'string') {
                                                                    try {
                                                                        growthRecords = JSON.parse(growthRecords);
                                                                    } catch (e) {
                                                                        growthRecords = [];
                                                                    }
                                                                }
                                                                
                                                                if (growthRecords && Array.isArray(growthRecords) && growthRecords.length > 0) {
                                                                    const sorted = [...growthRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
                                                                    currentWeight = sorted[0].weight;
                                                                    const withLength = sorted.find(r => r.length);
                                                                    currentLength = withLength ? withLength.length : null;
                                                                }
                                                                
                                                                return (currentWeight || animalToView.bcs || currentLength) && (
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {currentWeight && (
                                                                            <div>
                                                                                <strong>Weight:</strong> {currentWeight}{animalToView.measurementUnits?.weight || 'g'}
                                                                                {animalToView.weightTrend && (
                                                                                    <span className={animalToView.weightTrend === 'up' ? 'text-red-600' : animalToView.weightTrend === 'down' ? 'text-green-600' : 'text-gray-600'}>
                                                                                        {animalToView.weightTrend === 'up' ? ' ↑' : animalToView.weightTrend === 'down' ? ' ↓' : ' →'}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {animalToView.bcs && <div><strong>BCS:</strong> {animalToView.bcs}</div>}
                                                                        {currentLength && (
                                                                            <div><strong>Length:</strong> {currentLength} {animalToView.measurementUnits?.length || 'cm'}</div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                            
                                                            {/* Conditions and Medications */}
                                                            {(animalToView.medicalConditions || animalToView.medications) && (
                                                                <div className="border-t border-gray-200 pt-2 space-y-2">
                                                                    {animalToView.medicalConditions && (() => {
                                                                        const parsed = parseHealthRecords(animalToView.medicalConditions);
                                                                        return parsed && parsed.length > 0 ? (
                                                                            <div>
                                                                                <strong>Conditions:</strong>
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
                                                                    {animalToView.medications && (() => {
                                                                        const parsed = parseHealthRecords(animalToView.medications);
                                                                        return parsed && parsed.length > 0 ? (
                                                                            <div>
                                                                                <strong>Medications:</strong>
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
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Reproductive Status Card */}
                                                {!animalToView.isNeutered && (animalToView.heatStatus || animalToView.lastHeatDate || animalToView.matingDates) && (
                                                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-700 mb-2">Reproductive Status</h4>
                                                        <div className="text-sm space-y-1">
                                                            {animalToView.heatStatus && <div><strong>Heat Status:</strong> {animalToView.heatStatus}</div>}
                                                            {animalToView.lastHeatDate && <div><strong>Last Heat:</strong> {new Date(animalToView.lastHeatDate).toLocaleDateString()}</div>}
                                                            {animalToView.matingDates && <div><strong>Last Mating:</strong> {animalToView.matingDates}</div>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Parents Card */}
                                                {(sireData || damData) && (
                                                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-700 mb-4">Parents</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Sire Card */}
                                                            {sireData && (
                                                                <div 
                                                                    onClick={() => {
                                                                        setAnimalToView(sireData);
                                                                        setDetailViewTab(1);
                                                                    }}
                                                                    className="bg-gray-50 rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition"
                                                                >
                                                                    <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center mb-3">
                                                                        <AnimalImage src={sireData.imageUrl || sireData.photoUrl} alt={sireData.name} className="w-full h-full object-cover" iconSize={32} />
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <p className="font-semibold text-gray-800 text-sm">
                                                                            {sireData.prefix ? `${sireData.prefix} ` : ''}{sireData.name}{sireData.suffix ? ` ${sireData.suffix}` : ''}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                            {sireData.gender}
                                                                        </p>
                                                                        {sireData.birthDate && (
                                                                            <p className="text-xs text-gray-500 mt-2">
                                                                                Born: {new Date(sireData.birthDate).toLocaleDateString()}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Dam Card */}
                                                            {damData && (
                                                                <div 
                                                                    onClick={() => {
                                                                        setAnimalToView(damData);
                                                                        setDetailViewTab(1);
                                                                    }}
                                                                    className="bg-gray-50 rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition"
                                                                >
                                                                    <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center mb-3">
                                                                        <AnimalImage src={damData.imageUrl || damData.photoUrl} alt={damData.name} className="w-full h-full object-cover" iconSize={32} />
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <p className="font-semibold text-gray-800 text-sm">
                                                                            {damData.prefix ? `${damData.prefix} ` : ''}{damData.name}{damData.suffix ? ` ${damData.suffix}` : ''}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                            {damData.gender}
                                                                        </p>
                                                                        {damData.birthDate && (
                                                                            <p className="text-xs text-gray-500 mt-2">
                                                                                Born: {new Date(damData.birthDate).toLocaleDateString()}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Offspring Card */}
                                                {offspringData && offspringData.length > 0 && (
                                                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-700 mb-4">Offspring ({offspringData.length})</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {offspringData.map(offspring => (
                                                                <div 
                                                                    key={offspring.id_public}
                                                                    onClick={() => {
                                                                        setAnimalToView(offspring);
                                                                        setDetailViewTab(1);
                                                                    }}
                                                                    className="bg-gray-50 rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition"
                                                                >
                                                                    <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center mb-3">
                                                                        <AnimalImage src={offspring.imageUrl || offspring.photoUrl} alt={offspring.name} className="w-full h-full object-cover" iconSize={32} />
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <p className="font-semibold text-gray-800 text-sm">
                                                                            {offspring.prefix ? `${offspring.prefix} ` : ''}{offspring.name}{offspring.suffix ? ` ${offspring.suffix}` : ''}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                            {offspring.gender}
                                                                        </p>
                                                                        {offspring.birthDate && (
                                                                            <p className="text-xs text-gray-500 mt-2">
                                                                                Born: {new Date(offspring.birthDate).toLocaleDateString()}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}


                                            </div>
                                        )}

                                        {/* Tab 2: Status & Privacy */}
                                        {detailViewTab === 2 && (
                                            <div className="space-y-6">
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <span className="text-sm text-gray-600">Status</span>
                                                            <p className="font-medium">{animalToView.status || 'Unknown'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm text-gray-600">Current Owner</span>
                                                            <p className="font-medium">{animalToView.currentOwner || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm text-gray-600">Public Profile</span>
                                                            <p className="font-medium">{animalToView.showOnPublicProfile ? 'Yes' : 'No'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm text-gray-600">Owned</span>
                                                            <p className="font-medium">{animalToView.isOwned ? 'Yes' : 'No'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {animalToView.ownershipHistory && animalToView.ownershipHistory.length > 0 && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700">Ownership History</h3>
                                                        <div className="space-y-2">
                                                            {animalToView.ownershipHistory.map((owner, idx) => (
                                                                <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                                                                    <p className="font-medium text-gray-800">{owner.name}</p>
                                                                    <p className="text-xs text-gray-500">From: {owner.startDate || 'N/A'} {owner.endDate ? `To: ${owner.endDate}` : '(Current)'}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Breeder Info</h3>
                                                    <div className="text-sm">
                                                        <strong>Breeder:</strong>{' '}
                                                        {animalToView.breederId_public ? (
                                                            viewAnimalBreederInfo ? (
                                                                <span>
                                                                    {(() => {
                                                                        const showPersonal = viewAnimalBreederInfo.showPersonalName ?? false;
                                                                        const showBreeder = viewAnimalBreederInfo.showBreederName ?? false;
                                                                        
                                                                        if (showPersonal && showBreeder && viewAnimalBreederInfo.personalName && viewAnimalBreederInfo.breederName) {
                                                                            return `${viewAnimalBreederInfo.personalName} (${viewAnimalBreederInfo.breederName})`;
                                                                        } else if (showBreeder && viewAnimalBreederInfo.breederName) {
                                                                            return viewAnimalBreederInfo.breederName;
                                                                        } else if (showPersonal && viewAnimalBreederInfo.personalName) {
                                                                            return viewAnimalBreederInfo.personalName;
                                                                        } else {
                                                                            return 'Unknown Breeder';
                                                                        }
                                                                    })()}
                                                                </span>
                                                            ) : (
                                                                <span className="font-mono text-accent">{animalToView.breederId_public}</span>
                                                            )
                                                        ) : (
                                                            <span className="text-gray-500 italic">Not specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tab 3: Physical Profile */}
                                        {detailViewTab === 3 && (
                                            <div className="space-y-6">
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                    <h3 className="text-lg font-semibold text-gray-700">Appearance</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div><span className="text-gray-600">Color:</span> <strong>{animalToView.color || '—'}</strong></div>
                                                        <div><span className="text-gray-600">Coat Type:</span> <strong>{animalToView.coat || '—'}</strong></div>
                                                        <div><span className="text-gray-600">Coat Pattern:</span> <strong>{animalToView.coatPattern || '—'}</strong></div>
                                                        {(animalToView.species === 'Fancy Rat' || animalToView.species === 'Rat') && (
                                                            <div><span className="text-gray-600">Earset:</span> <strong>{animalToView.earset || '—'}</strong></div>
                                                        )}
                                                    </div>
                                                </div>
                                                {animalToView.geneticCode && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Genetic Code</h3>
                                                        <p className="text-sm font-mono">{animalToView.geneticCode}</p>
                                                    </div>
                                                )}
                                                {animalToView.lifeStage && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <span className="text-sm text-gray-600">Life Stage:</span> <strong>{animalToView.lifeStage}</strong>
                                                    </div>
                                                )}

                                                {/* Current Measurements */}
                                                {(() => {
                                                    let growthRecords = animalToView.growthRecords;
                                                    if (typeof growthRecords === 'string') {
                                                        try {
                                                            growthRecords = JSON.parse(growthRecords);
                                                        } catch (e) {
                                                            growthRecords = [];
                                                        }
                                                    }
                                                    
                                                    // Compute current weight and length from growth records
                                                    let currentWeight = null;
                                                    let currentLength = null;
                                                    if (growthRecords && Array.isArray(growthRecords) && growthRecords.length > 0) {
                                                        const sorted = [...growthRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
                                                        currentWeight = sorted[0].weight;
                                                        const withLength = sorted.find(r => r.length);
                                                        currentLength = withLength ? withLength.length : null;
                                                    }
                                                    
                                                    // Fallback to stored values if no growth records
                                                    if (!currentWeight) currentWeight = animalToView.currentWeight;
                                                    
                                                    return (currentWeight || animalToView.bcs || currentLength) && (
                                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                            <h3 className="text-lg font-semibold text-gray-700">Current Measurements</h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                {currentWeight && (
                                                                    <div><span className="text-gray-600">Weight:</span> <strong>{currentWeight} {animalToView.measurementUnits?.weight || 'g'}</strong></div>
                                                                )}
                                                                {animalToView.bcs && (
                                                                    <div><span className="text-gray-600">BCS:</span> <strong>{animalToView.bcs}</strong></div>
                                                                )}
                                                                {currentLength && (
                                                                    <div><span className="text-gray-600">Length:</span> <strong>{currentLength} {animalToView.measurementUnits?.length || 'cm'}</strong></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* Growth Curve Chart */}
                                                {(() => {
                                                    let growthRecords = animalToView.growthRecords;
                                                    if (typeof growthRecords === 'string') {
                                                        try {
                                                            growthRecords = JSON.parse(growthRecords);
                                                        } catch (e) {
                                                            growthRecords = [];
                                                        }
                                                    }
                                                    
                                                    // Ensure growthRecords is an array
                                                    if (!growthRecords) growthRecords = [];
                                                    
                                                    // If fewer than 2 entries, show empty chart placeholder
                                                    if (growthRecords.length < 2) {
                                                        return (
                                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Growth Curve (Weight)</h3>
                                                                <svg width="100%" height="350" viewBox="0 0 500 300" style={{ maxWidth: '100%' }} preserveAspectRatio="xMidYMid meet">
                                                                    {/* Grid lines */}
                                                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                                                        const y = 20 + 260 * (1 - ratio);
                                                                        return (
                                                                            <g key={`grid-${i}`}>
                                                                                <line x1={70} y1={y} x2={470} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                                                                                <text x={58} y={y} textAnchor="end" dy="0.3em" fontSize="11" fill="#999">—</text>
                                                                            </g>
                                                                        );
                                                                    })}
                                                                    
                                                                    {/* Axes */}
                                                                    <line x1={70} y1={20} x2={70} y2={280} stroke="#333" strokeWidth="2" />
                                                                    <line x1={70} y1={280} x2={470} y2={280} stroke="#333" strokeWidth="2" />
                                                                    
                                                                    {/* Y-axis label */}
                                                                    <text x={20} y={150} textAnchor="middle" fontSize="12" fill="#999" fontWeight="600" transform="rotate(-90 20 150)">
                                                                        Weight ({animalToView.measurementUnits?.weight || 'g'})
                                                                    </text>
                                                                    
                                                                    {/* X-axis label */}
                                                                    <text x={270} y={295} textAnchor="middle" fontSize="12" fill="#999" fontWeight="600">
                                                                        Date
                                                                    </text>
                                                                    
                                                                    {/* Empty state message */}
                                                                    <text x={270} y={150} textAnchor="middle" fontSize="14" fill="#999">
                                                                        Add more entries to see growth chart
                                                                    </text>
                                                                </svg>
                                                                <p className="text-xs text-gray-500 mt-2">Growth curve will appear once you have 2 or more measurement entries.</p>
                                                            </div>
                                                        );
                                                    }
                                                    
                                                    // Full interactive chart with 2+ entries
                                                    return (() => {
                                                        const sorted = [...growthRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
                                                        const weights = sorted.map(r => parseFloat(r.weight) || 0).filter(w => w > 0);
                                                        
                                                        if (weights.length < 2) return null;
                                                    
                                                    const minWeight = Math.min(...weights);
                                                    const maxWeight = Math.max(...weights);
                                                    const padding = (maxWeight - minWeight) * 0.1 || 5;
                                                    const chartMin = Math.max(0, minWeight - padding);
                                                    const chartMax = maxWeight + padding;
                                                    const range = chartMax - chartMin;
                                                    
                                                    const width = 500;
                                                    const height = 300;
                                                    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
                                                    const graphWidth = width - margin.left - margin.right;
                                                    const graphHeight = height - margin.top - margin.bottom;
                                                    
                                                    const points = sorted.map((record, idx) => ({
                                                        x: margin.left + (idx / (sorted.length - 1)) * graphWidth,
                                                        y: margin.top + graphHeight - ((parseFloat(record.weight) - chartMin) / range) * graphHeight,
                                                        weight: record.weight,
                                                        length: record.length,
                                                        bcs: record.bcs,
                                                        notes: record.notes,
                                                        date: record.date
                                                    }));
                                                    
                                                    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                                    
                                                    return (
                                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Growth Curve (Weight)</h3>
                                                            <svg width="100%" height="350" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: '100%' }} preserveAspectRatio="xMidYMid meet">
                                                                {/* Grid lines */}
                                                                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                                                    const y = margin.top + graphHeight * (1 - ratio);
                                                                    const weightLabel = (chartMin + range * ratio).toFixed(1);
                                                                    return (
                                                                        <g key={`grid-${i}`}>
                                                                            <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                                                                            <text x={margin.left - 12} y={y} textAnchor="end" dy="0.3em" fontSize="11" fill="#666">{weightLabel}</text>
                                                                        </g>
                                                                    );
                                                                })}
                                                                
                                                                {/* Axes */}
                                                                <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#333" strokeWidth="2" />
                                                                <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#333" strokeWidth="2" />
                                                                
                                                                {/* Y-axis label */}
                                                                <text x={20} y={margin.top + graphHeight / 2} textAnchor="middle" fontSize="12" fill="#333" fontWeight="600" transform={`rotate(-90 20 ${margin.top + graphHeight / 2})`}>
                                                                    Weight ({animalToView.measurementUnits?.weight || 'g'})
                                                                </text>
                                                                
                                                                {/* X-axis label */}
                                                                <text x={margin.left + graphWidth / 2} y={height - 8} textAnchor="middle" fontSize="12" fill="#333" fontWeight="600">
                                                                    Date
                                                                </text>
                                                                
                                                                {/* X-axis date labels */}
                                                                {points.map((p, i) => (
                                                                    i % Math.max(1, Math.floor(points.length / 5)) === 0 && (
                                                                        <text key={`date-${i}`} x={p.x} y={height - margin.bottom + 25} textAnchor="middle" fontSize="10" fill="#666">
                                                                            {new Date(p.date).toLocaleDateString()}
                                                                        </text>
                                                                    )
                                                                ))}
                                                                
                                                                {/* Curve */}
                                                                <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                
                                                                {/* Points */}
                                                                {points.map((p, i) => {
                                                                    const tooltipText = [
                                                                        `Date: ${new Date(p.date).toLocaleDateString()}`,
                                                                        `Weight: ${p.weight} ${animalToView.measurementUnits?.weight || 'g'}`,
                                                                        p.length ? `Length: ${p.length} ${animalToView.measurementUnits?.length || 'cm'}` : null,
                                                                        p.bcs ? `BCS: ${p.bcs}` : null,
                                                                        p.notes ? `Notes: ${p.notes}` : null
                                                                    ].filter(Boolean).join('\n');
                                                                    
                                                                    // Color gradient from green (earliest) to red (latest)
                                                                    const colorRatio = points.length > 1 ? i / (points.length - 1) : 0;
                                                                    let dotColor;
                                                                    if (colorRatio < 0.5) {
                                                                        // Green to Yellow
                                                                        const t = colorRatio * 2;
                                                                        const r = Math.round(144 + (255 - 144) * t);
                                                                        const g = 191;
                                                                        const b = Math.round(71 + (0 - 71) * t);
                                                                        dotColor = `rgb(${r}, ${g}, ${b})`;
                                                                    } else {
                                                                        // Yellow to Red
                                                                        const t = (colorRatio - 0.5) * 2;
                                                                        const r = 255;
                                                                        const g = Math.round(191 - (191) * t);
                                                                        const b = 0;
                                                                        dotColor = `rgb(${r}, ${g}, ${b})`;
                                                                    }
                                                                    
                                                                    return (
                                                                        <circle key={`point-${i}`} cx={p.x} cy={p.y} r="5" fill={dotColor} stroke="#fff" strokeWidth="2">
                                                                            <title>{tooltipText}</title>
                                                                        </circle>
                                                                    );
                                                                })}
                                                            </svg>
                                                            <p className="text-xs text-gray-500 mt-2">Hover over points to see full measurement details including length, BCS, and notes.</p>
                                                        </div>
                                                    );
                                                    })();
                                                })()}
                                            </div>
                                        )}

                                        {/* Tab 4: Identification */}
                                        {detailViewTab === 4 && (
                                            <div className="space-y-6">
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                    <h3 className="text-lg font-semibold text-gray-700">Identification Numbers</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div><span className="text-gray-600">Identification:</span> <strong>{animalToView.breederyId || '—'}</strong></div>
                                                        <div><span className="text-gray-600">Microchip:</span> <strong>{animalToView.microchipNumber || '—'}</strong></div>
                                                        <div><span className="text-gray-600">Pedigree Reg ID:</span> <strong>{animalToView.pedigreeRegistrationId || '—'}</strong></div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                    <h3 className="text-lg font-semibold text-gray-700">Classification</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div><span className="text-gray-600">Species:</span> <strong>{animalToView.species}</strong></div>
                                                        <div><span className="text-gray-600">Breed:</span> <strong>{animalToView.breed || '—'}</strong></div>
                                                        <div><span className="text-gray-600">Strain:</span> <strong>{animalToView.strain || '—'}</strong></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tab 5: Lineage */}
                                        {detailViewTab === 5 && (
                                            <div className="space-y-6">
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-lg font-semibold text-gray-700">Parents</h3>
                                                        <button
                                                            onClick={() => setShowPedigreeChart(true)}
                                                            data-tutorial-target="pedigree-btn"
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-black text-sm font-semibold rounded-lg transition"
                                                        >
                                                            <FileText size={16} />
                                                            Pedigree
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                                                        <ParentCard 
                                                            parentId={animalToView.fatherId_public} 
                                                            parentType="Father"
                                                            authToken={authToken}
                                                            API_BASE_URL={API_BASE_URL}
                                                            onViewAnimal={handleViewAnimal}
                                                        />
                                                        <ParentCard 
                                                            parentId={animalToView.motherId_public} 
                                                            parentType="Mother"
                                                            authToken={authToken}
                                                            API_BASE_URL={API_BASE_URL}
                                                            onViewAnimal={handleViewAnimal}
                                                        />
                                                    </div>
                                                </div>
                                                {animalToView.origin && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <span className="text-sm text-gray-600">Origin:</span> <strong>{animalToView.origin}</strong>
                                                    </div>
                                                )}
                                                <OffspringSection
                                                    animalId={animalToView.id_public}
                                                    API_BASE_URL={API_BASE_URL}
                                                    authToken={authToken}
                                                    onViewAnimal={handleViewAnimal}
                                                />
                                            </div>
                                        )}

                                        {/* Tab 6: Breeding */}
                                        {detailViewTab === 6 && (
                                            <div className="space-y-6">
                                                {(animalToView.isNeutered || animalToView.heatStatus || animalToView.isPregnant || animalToView.isNursing || animalToView.matingDates) && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700">Reproductive Status</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                            <div><span className="text-gray-600">Neutered/Spayed:</span> <strong>{animalToView.isNeutered ? 'Yes' : 'No'}</strong></div>
                                                            <div><span className="text-gray-600">Heat Status:</span> <strong>{animalToView.heatStatus || '—'}</strong></div>
                                                            <div><span className="text-gray-600">Last Heat Date:</span> <strong>{animalToView.lastHeatDate ? new Date(animalToView.lastHeatDate).toLocaleDateString() : '—'}</strong></div>
                                                            <div><span className="text-gray-600">Mating Dates:</span> <strong>{animalToView.matingDates || '—'}</strong></div>
                                                            <div><span className="text-gray-600">Expected Due Date:</span> <strong>{animalToView.expectedDueDate ? new Date(animalToView.expectedDueDate).toLocaleDateString() : '—'}</strong></div>
                                                            <div><span className="text-gray-600">Litter Count:</span> <strong>{animalToView.litterCount || '—'}</strong></div>
                                                            <div><span className="text-gray-600">Nursing Start Date:</span> <strong>{animalToView.nursingStartDate ? new Date(animalToView.nursingStartDate).toLocaleDateString() : '—'}</strong></div>
                                                            <div><span className="text-gray-600">Weaning Date:</span> <strong>{animalToView.weaningDate ? new Date(animalToView.weaningDate).toLocaleDateString() : '—'}</strong></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Tab 7: Health */}
                                        {detailViewTab === 7 && (
                                            <div className="space-y-6">
                                                {(animalToView.vaccinations || animalToView.dewormingRecords || animalToView.parasiteControl || animalToView.primaryVet) && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700">Health Records</h3>
                                                        {animalToView.vaccinations && (
                                                            <div>
                                                                <strong>Vaccinations:</strong>
                                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                                    {(() => {
                                                                        const data = animalToView.vaccinations;
                                                                        const parsed = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return []; } })() : Array.isArray(data) ? data : [];
                                                                        return parsed.map((vacc, idx) => (
                                                                            <li key={idx} className="text-gray-700">
                                                                                {vacc.name} {vacc.date && `(${new Date(vacc.date).toLocaleDateString()})`}
                                                                                {vacc.notes && <span className="text-gray-600"> - {vacc.notes}</span>}
                                                                            </li>
                                                                        ));
                                                                    })()}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {animalToView.dewormingRecords && (
                                                            <div>
                                                                <strong>Deworming:</strong>
                                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                                    {(() => {
                                                                        const data = animalToView.dewormingRecords;
                                                                        const parsed = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return []; } })() : Array.isArray(data) ? data : [];
                                                                        return parsed.map((record, idx) => (
                                                                            <li key={idx} className="text-gray-700">
                                                                                {record.medication} {record.date && `(${new Date(record.date).toLocaleDateString()})`}
                                                                                {record.notes && <span className="text-gray-600"> - {record.notes}</span>}
                                                                            </li>
                                                                        ));
                                                                    })()}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {animalToView.parasiteControl && (
                                                            <div>
                                                                <strong>Parasite Control:</strong>
                                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                                    {(() => {
                                                                        const data = animalToView.parasiteControl;
                                                                        const parsed = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return []; } })() : Array.isArray(data) ? data : [];
                                                                        return parsed.map((record, idx) => (
                                                                            <li key={idx} className="text-gray-700">
                                                                                {record.treatment} {record.date && `(${new Date(record.date).toLocaleDateString()})`}
                                                                                {record.notes && <span className="text-gray-600"> - {record.notes}</span>}
                                                                            </li>
                                                                        ));
                                                                    })()}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {animalToView.primaryVet && <div><strong>Primary Vet:</strong> <p className="text-sm mt-1">{animalToView.primaryVet}</p></div>}
                                                    </div>
                                                )}
                                                {(animalToView.medicalConditions || animalToView.allergies || animalToView.medications) && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700">Medical Information</h3>
                                                        {animalToView.medicalConditions && (() => {
                                                            const parsed = parseHealthRecords(animalToView.medicalConditions);
                                                            return parsed && parsed.length > 0 ? (
                                                                <div>
                                                                    <strong>Medical Conditions:</strong>
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
                                                        {animalToView.allergies && (() => {
                                                            const parsed = parseHealthRecords(animalToView.allergies);
                                                            return parsed && parsed.length > 0 ? (
                                                                <div>
                                                                    <strong>Allergies:</strong>
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
                                                        {animalToView.medications && (() => {
                                                            const parsed = parseHealthRecords(animalToView.medications);
                                                            return parsed && parsed.length > 0 ? (
                                                                <div>
                                                                    <strong>Medications:</strong>
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
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Tab 8: Husbandry */}
                                        {detailViewTab === 8 && (
                                            <div className="space-y-6">
                                                {(animalToView.dietType || animalToView.feedingSchedule || animalToView.supplements) && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700">Nutrition</h3>
                                                        {animalToView.dietType && <div><strong>Diet Type:</strong> <p className="text-sm mt-1">{animalToView.dietType}</p></div>}
                                                        {animalToView.feedingSchedule && <div><strong>Feeding Schedule:</strong> <p className="text-sm mt-1">{animalToView.feedingSchedule}</p></div>}
                                                        {animalToView.supplements && <div><strong>Supplements:</strong> <p className="text-sm mt-1">{animalToView.supplements}</p></div>}
                                                    </div>
                                                )}
                                                {(animalToView.housingType || animalToView.bedding || animalToView.enrichment) && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700">Husbandry</h3>
                                                        {animalToView.housingType && <div><strong>Housing Type:</strong> <p className="text-sm mt-1">{animalToView.housingType}</p></div>}
                                                        {animalToView.bedding && <div><strong>Bedding:</strong> <p className="text-sm mt-1">{animalToView.bedding}</p></div>}
                                                        {animalToView.enrichment && <div><strong>Enrichment:</strong> <p className="text-sm mt-1">{animalToView.enrichment}</p></div>}
                                                    </div>
                                                )}
                                                {(animalToView.temperatureRange || animalToView.humidity || animalToView.lighting || animalToView.noise) && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700">Environment</h3>
                                                        {animalToView.temperatureRange && <div><strong>Temperature Range:</strong> <p className="text-sm mt-1">{animalToView.temperatureRange}</p></div>}
                                                        {animalToView.humidity && <div><strong>Humidity:</strong> <p className="text-sm mt-1">{animalToView.humidity}</p></div>}
                                                        {animalToView.lighting && <div><strong>Lighting:</strong> <p className="text-sm mt-1">{animalToView.lighting}</p></div>}
                                                        {animalToView.noise && <div><strong>Noise Level:</strong> <p className="text-sm mt-1">{animalToView.noise}</p></div>}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Tab 9: Behavior */}
                                        {detailViewTab === 9 && (
                                            <div className="space-y-6">
                                                {(animalToView.temperament || animalToView.handlingTolerance || animalToView.socialStructure || animalToView.activityCycle) && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700">Behavior & Welfare</h3>
                                                        {animalToView.temperament && <div><strong>Temperament:</strong> <p className="text-sm mt-1">{animalToView.temperament}</p></div>}
                                                        {animalToView.handlingTolerance && <div><strong>Handling Tolerance:</strong> <p className="text-sm mt-1">{animalToView.handlingTolerance}</p></div>}
                                                        {animalToView.socialStructure && <div><strong>Social Structure:</strong> <p className="text-sm mt-1">{animalToView.socialStructure}</p></div>}
                                                        {animalToView.activityCycle && <div><strong>Activity Cycle:</strong> <p className="text-sm mt-1">{animalToView.activityCycle}</p></div>}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Tab 10: Records */}
                                        {detailViewTab === 10 && (
                                            <div className="space-y-6">
                                                {animalToView.remarks && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Remarks / Notes</h3>
                                                        <p className="text-sm">{animalToView.remarks}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Tab 11: End of Life */}
                                        {detailViewTab === 11 && (
                                            <div className="space-y-6">
                                                {(animalToView.deceasedDate || animalToView.causeOfDeath || animalToView.insurance || animalToView.legalStatus) && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700">End of Life & Legal</h3>
                                                        {animalToView.deceasedDate && <div><strong>Deceased Date:</strong> <p className="text-sm mt-1">{new Date(animalToView.deceasedDate).toLocaleDateString()}</p></div>}
                                                        {animalToView.causeOfDeath && <div><strong>Cause of Death:</strong> <p className="text-sm mt-1">{animalToView.causeOfDeath}</p></div>}
                                                        {animalToView.necropsyResults && <div><strong>Necropsy Results:</strong> <p className="text-sm mt-1">{animalToView.necropsyResults}</p></div>}
                                                        {animalToView.insurance && <div><strong>Insurance:</strong> <p className="text-sm mt-1">{animalToView.insurance}</p></div>}
                                                        {animalToView.legalStatus && <div><strong>Legal Status:</strong> <p className="text-sm mt-1">{animalToView.legalStatus}</p></div>}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        </div>
                                    </div>

                                    {/* Pedigree Chart Modal */}
                                    {showPedigreeChart && animalToView && (
                                        <PedigreeChart
                                            animalData={animalToView}
                                            onClose={() => setShowPedigreeChart(false)}
                                            API_BASE_URL={API_BASE_URL}
                                            authToken={authToken}
                                        />
                                    )}
                                    </>
                                );
                            })()
                        )
                    } />
                    <Route path="/hidden-animals" element={
                        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-start justify-between mb-6">
                                <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-gray-800 font-medium">
                                    <ArrowLeft size={20} className="mr-2" />
                                    Back to Dashboard
                                </button>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Archive size={24} className="mr-3 text-gray-600" />
                                Hidden View-Only Animals
                            </h2>
                            {loadingHidden ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin" size={32} />
                                </div>
                            ) : hiddenAnimals.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No hidden animals</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {hiddenAnimals.map(animal => (
                                        <div key={animal.id_public} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                                    {animal.imageUrl || animal.photoUrl ? (
                                                        <img src={animal.imageUrl || animal.photoUrl} alt={animal.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Cat size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-800">
                                                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">{animal.id_public}</p>
                                                    <p className="text-xs text-gray-500">{animal.species} • {animal.gender}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRestoreViewOnlyAnimal(animal.id_public)}
                                                    className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                                                >
                                                    <Eye size={16} />
                                                    Restore
                                                </button>
                                                <button
                                                    onClick={() => handleViewAnimal(animal)}
                                                    className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    } />
                </Routes>
            </main>

            <footer className="w-full mt-6 text-center text-sm pt-4 border-t border-gray-200 max-w-4xl">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-2">
                    <button
                        onClick={() => setShowBugReportModal(true)}
                        className="text-gray-600 hover:text-primary transition font-medium flex items-center gap-1"
                    >
                        <AlertCircle size={14} />
                        Report Issue / Bug
                    </button>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <button
                        onClick={() => setShowTermsModal(true)}
                        className="text-gray-600 hover:text-primary transition"
                    >
                        Terms of Service
                    </button>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <button
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-gray-600 hover:text-primary transition"
                    >
                        Privacy Policy
                    </button>
                </div>
                <p className="text-gray-500">&copy; {new Date().getFullYear()} CritterTrack Pedigree System.</p>
            </footer>
            
            {showTermsModal && <TermsOfService onClose={() => setShowTermsModal(false)} />}
            {showPrivacyModal && <PrivacyPolicy onClose={() => setShowPrivacyModal(false)} />}
            
            {/* Transfer Animal Modal */}
            {showTransferModal && transferAnimal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <ArrowLeftRight size={24} className="text-blue-600" />
                                Transfer Animal
                            </h2>
                            <button
                                onClick={() => {
                                    setShowTransferModal(false);
                                    setTransferAnimal(null);
                                    setTransferUserQuery('');
                                    setTransferUserResults([]);
                                    setTransferSelectedUser(null);
                                    setTransferPrice('');
                                    setTransferNotes('');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Animal Info */}
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Transferring:</p>
                                <p className="font-semibold text-gray-800">{transferAnimal.id_public} - {transferAnimal.name}</p>
                            </div>

                            {/* Buyer Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search for Buyer *
                                </label>
                                {transferSelectedUser ? (
                                    <div className="flex items-center justify-between p-2 border border-gray-300 rounded-lg bg-gray-50">
                                        <span className="text-gray-700">
                                            {transferSelectedUser.breederName || transferSelectedUser.personalName}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setTransferSelectedUser(null);
                                                setTransferUserResults([]);
                                            }}
                                            className="text-gray-500 hover:text-red-500"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={transferUserQuery}
                                                onChange={(e) => setTransferUserQuery(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSearchTransferUser();
                                                    }
                                                }}
                                                placeholder="Search by name or ID (min 2 chars)..."
                                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                            />
                                            <button
                                                onClick={handleSearchTransferUser}
                                                disabled={transferSearching}
                                                className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <Search className="w-4 h-4" />
                                                {transferSearching ? 'Searching...' : 'Search'}
                                            </button>
                                        </div>
                                        {transferUserQuery.length >= 2 && transferUserResults.length > 0 && (
                                            <div className="mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {transferUserResults.map(user => {
                                                    const hasVisibleBreederName = user.breederName && user.showBreederName;
                                                    const hasVisiblePersonalName = user.personalName && user.showPersonalName;
                                                    
                                                    let displayName;
                                                    if (hasVisibleBreederName && hasVisiblePersonalName) {
                                                        displayName = `${user.personalName} (${user.breederName})`;
                                                    } else if (hasVisibleBreederName) {
                                                        displayName = user.breederName;
                                                    } else {
                                                        displayName = user.personalName;
                                                    }
                                                    
                                                    return (
                                                        <button
                                                            key={user.id_public}
                                                            onClick={() => {
                                                                setTransferSelectedUser(user);
                                                                setTransferUserQuery('');
                                                                setTransferUserResults([]);
                                                            }}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="font-medium">{user.id_public}</div>
                                                            <div className="text-sm text-gray-600">{displayName}</div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {transferUserQuery.length >= 2 && transferUserResults.length === 0 && !transferSearching && (
                                            <div className="mt-1 p-4 bg-white border border-gray-300 rounded-lg text-center text-gray-500 text-sm">
                                                No users found
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sale Price * ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={transferPrice}
                                    onChange={(e) => setTransferPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={transferNotes}
                                    onChange={(e) => setTransferNotes(e.target.value)}
                                    placeholder="Add any additional notes..."
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                />
                            </div>

                            {/* Info Box */}
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-xs text-blue-800">
                                        <p className="font-semibold mb-1">🎉 How Transfer Works</p>
                                        <p>The buyer will receive a notification to accept the transfer. Once accepted, the animal will be transferred to their account and you'll keep view-only access to track lineage.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSubmitTransfer}
                                    disabled={!transferSelectedUser || !transferPrice}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition disabled:cursor-not-allowed"
                                >
                                    Send Transfer Request
                                </button>
                                <button
                                    onClick={() => {
                                        setShowTransferModal(false);
                                        setTransferAnimal(null);
                                        setTransferUserQuery('');
                                        setTransferUserResults([]);
                                        setTransferSelectedUser(null);
                                        setTransferPrice('');
                                        setTransferNotes('');
                                    }}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

// Public Animal Page Component
const PublicAnimalPage = () => {
    const { animalId } = useParams();
    const navigate = useNavigate();
    const [animal, setAnimal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchAnimal = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${animalId}`);
                setAnimal(response.data?.[0] || null);
                if (!response.data?.[0]) {
                    setNotFound(true);
                }
                setLoading(false);
            } catch (error) {
                console.error('Animal not found or not public:', error);
                setNotFound(true);
                setLoading(false);
            }
        };
        fetchAnimal();
    }, [animalId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-page-bg flex items-center justify-center p-6">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Animal Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        This animal either doesn't exist or is not publicly visible.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
                    >
                        Login / Register
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-page-bg flex flex-col items-center p-6">
            <header className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                <CustomAppLogo size="w-10 h-10" />
                <button
                    onClick={() => navigate('/')}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                    Home
                </button>
            </header>
            <ViewOnlyAnimalDetail
                animal={animal}
                onClose={() => navigate('/')}
                API_BASE_URL={API_BASE_URL}
                onViewProfile={(user) => navigate(`/user/${user.id_public}`)}
            />
        </div>
    );
};

// Public Profile Page Component
const PublicProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/public/profile/${userId}`);
                setProfile(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Profile not found or not public:', error);
                setNotFound(true);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-page-bg flex items-center justify-center p-6">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        This profile either doesn't exist or is not publicly visible.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
                    >
                        Login / Register
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-page-bg flex flex-col items-center p-6">
            <header className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                <CustomAppLogo size="w-10 h-10" />
                <button
                    onClick={() => navigate('/')}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                    Home
                </button>
            </header>
            <PublicProfileView
                profile={profile}
                onBack={() => navigate('/')}
                onViewAnimal={(animal) => navigate(`/animal/${animal.id_public}`)}
                API_BASE_URL={API_BASE_URL}
            />
        </div>
    );
};

// Router Wrapper Component
const AppRouter = () => {
    return (
        <Routes>
            <Route path="/animal/:animalId" element={<PublicAnimalPage />} />
            <Route path="/user/:userId" element={<PublicProfilePage />} />
            <Route path="/*" element={<AppWithTutorial />} />
        </Routes>
    );
};

// Wrapper component - TutorialProvider is now inside App to access auth state
const AppWithTutorial = () => {
    return (
        <TutorialProvider 
            userId={localStorage.getItem('userId')}
            authToken={localStorage.getItem('authToken')}
            API_BASE_URL={API_BASE_URL}
        >
            <App />
        </TutorialProvider>
    );
};

export default AppRouter;
