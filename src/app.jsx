// CritterTrack Frontend Application
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Routes, Route, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, Trash2, Edit, Save, PlusCircle, Plus, ArrowLeft, Loader2, RefreshCw, User, Users, ClipboardList, BookOpen, Settings, Mail, Globe, Bean, Milk, Search, X, Mars, Venus, Eye, EyeOff, Heart, HeartOff, HeartHandshake, Bell, XCircle, CheckCircle, Download, FileText, Link, AlertCircle, DollarSign, Archive, ArrowLeftRight, RotateCcw, Info, Hourglass, MessageSquare, Ban, Flag, Scissors, VenusAndMars, Circle, Shield, Lock, AlertTriangle, ShoppingBag, Check, Star, Moon, MoonStar, Calculator } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'flag-icons/css/flag-icons.min.css';
import { formatDate, formatDateShort } from './utils/dateFormatter';
import MouseGeneticsCalculator from './components/MouseGeneticsCalculator';
import GeneticCodeBuilder from './components/GeneticCodeBuilder';
import BudgetingTab from './components/BudgetingTab';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import InstallPWA from './components/InstallPWA';
import AdminPanel from './components/EnhancedAdminPanel';
import MaintenanceMode from './MaintenanceMode';
import { TutorialProvider, useTutorial } from './contexts/TutorialContext';
import { TutorialOverlay, TutorialHighlight } from './components/TutorialOverlay';
import { TUTORIAL_LESSONS } from './data/tutorialLessonsNew';
import InfoTab from './components/InfoTab';
import WelcomeBanner from './components/WelcomeBanner';
import ReportButton from './components/ReportButton';
import ModerationAuthModal from './components/moderation/ModerationAuthModal';
import ModOversightPanel from './components/moderation/ModOversightPanel';
import ModeratorActionSidebar from './components/moderation/ModeratorActionSidebar';
import Marketplace from './components/Marketplace';
import FamilyTree from './components/FamilyTree';
import AnimalTree from './components/AnimalTree';

// const API_BASE_URL = 'http://localhost:5000/api'; // Local development
// const API_BASE_URL = 'https://crittertrack-pedigree-production.up.railway.app/api'; // Direct Railway (for testing)
const API_BASE_URL = '/api'; // Production via Vercel proxy - v2

const GENDER_OPTIONS = ['Male', 'Female', 'Intersex', 'Unknown'];
const STATUS_OPTIONS = ['Pet', 'Breeder', 'Available', 'Booked', 'Sold', 'Retired', 'Deceased', 'Rehomed', 'Unknown']; 

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

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

// Helper function to format date strings for display
const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return formatDateShort(date);
    } catch (e) {
        return dateString; // Return as-is if parsing fails
    }
};

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
                // Enhanced recursive function to fetch animal, ancestors, and descendants
                const fetchAnimalWithFamily = async (id, depth = 0, fetchedIds = new Set()) => {
                    if (!id || depth > 4 || fetchedIds.has(id)) return null; // Limit to 5 generations (0-4) and prevent infinite loops
                    
                    fetchedIds.add(id); // Track this ID to prevent circular references

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

                    // Recursively fetch parents
                    const fatherId = animalInfo.fatherId_public || animalInfo.sireId_public;
                    const motherId = animalInfo.motherId_public || animalInfo.damId_public;

                    const father = fatherId ? await fetchAnimalWithFamily(fatherId, depth + 1, fetchedIds) : null;
                    const mother = motherId ? await fetchAnimalWithFamily(motherId, depth + 1, fetchedIds) : null;

                    // Fetch offspring (children) if user is authenticated and depth allows
                    let offspring = [];
                    if (authToken && depth < 3) { // Limit offspring fetching to prevent too deep trees
                        try {
                            const offspringResponse = await axios.get(
                                `${API_BASE_URL}/animals/${id}/offspring`,
                                { headers: { Authorization: `Bearer ${authToken}` } }
                            );
                            
                            if (offspringResponse.data && offspringResponse.data.length > 0) {
                                // Recursively fetch offspring details but limit depth to prevent infinite expansion
                                for (const child of offspringResponse.data.slice(0, 15)) { // Limit to first 15 offspring per animal to accommodate larger mouse litters
                                    if (!fetchedIds.has(child.id_public)) {
                                        const childData = await fetchAnimalWithFamily(child.id_public, depth + 1, fetchedIds);
                                        if (childData) {
                                            offspring.push(childData);
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            console.log(`No offspring data available for ${id}:`, error.message);
                        }
                    }

                    return {
                        ...animalInfo,
                        father,
                        mother,
                        offspring: offspring.length > 0 ? offspring : undefined
                    };
                };

                const data = await fetchAnimalWithFamily(animalId || animalData?.id_public);
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
            // Store original styles
            const originalWidth = pedigreeRef.current.style.width;
            const originalHeight = pedigreeRef.current.style.height;
            const originalAspectRatio = pedigreeRef.current.style.aspectRatio;
            const originalMinHeight = pedigreeRef.current.style.minHeight;

            // Set fixed dimensions for PDF generation
            pedigreeRef.current.style.width = '1123px';
            pedigreeRef.current.style.height = '794px';
            pedigreeRef.current.style.aspectRatio = 'unset';
            pedigreeRef.current.style.minHeight = 'unset';

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

            // Restore original styles and elements
            pedigreeRef.current.style.width = originalWidth;
            pedigreeRef.current.style.height = originalHeight;
            pedigreeRef.current.style.aspectRatio = originalAspectRatio;
            pedigreeRef.current.style.minHeight = originalMinHeight;
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
                        {animal.birthDate ? formatDate(animal.birthDate) : 'N/A'}
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
        
        // Get border color based on actual gender
        const getBorderColor = (animal) => {
            if (!animal || !animal.gender) return 'border-gray-700';
            return animal.gender === 'Male' ? 'border-blue-500' : 'border-pink-500';
        };
        
        // Direct parents always show - either full data, "Unknown", or "Hidden" (private)
        if (!animal) {
            return (
                <div className={`border ${getBorderColor(null)} rounded p-2 ${bgColor} relative h-full flex items-center justify-center`}>
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
                <div className={`border ${getBorderColor(animal)} rounded p-2 ${bgColor} relative h-full flex items-center justify-center`}>
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
            <div className={`border ${getBorderColor(animal)} rounded p-1.5 ${bgColor} relative flex gap-2 h-full items-center`}>
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
                        {animal.birthDate ? formatDate(animal.birthDate) : 'N/A'}
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
        
        // Get border color based on actual gender
        const getBorderColor = (animal) => {
            if (!animal || !animal.gender) return 'border-gray-700';
            return animal.gender === 'Male' ? 'border-blue-500' : 'border-pink-500';
        };
        
        if (!animal) {
            return (
                <div className={`border ${getBorderColor(null)} rounded p-1.5 ${bgColor} flex gap-1.5 h-full items-center relative`}>
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
                <div className={`border ${getBorderColor(animal)} rounded p-1.5 ${bgColor} flex gap-1.5 h-full items-center relative`}>
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
            <div className={`border ${getBorderColor(animal)} rounded p-1 ${bgColor} relative flex gap-1.5 h-full items-center`}>
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
                        {animal.birthDate ? formatDate(animal.birthDate) : 'N/A'}
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
        
        // Get border color based on actual gender
        const getBorderColor = (animal) => {
            if (!animal || !animal.gender) return 'border-gray-700';
            return animal.gender === 'Male' ? 'border-blue-500' : 'border-pink-500';
        };
        
        if (!animal) {
            return (
                <div className={`border ${getBorderColor(null)} rounded p-1 ${bgColor} flex items-center justify-center h-full relative`}>
                    <span className="text-xs text-gray-400">Unknown</span>
                    <div className="absolute top-0.5 right-0.5">
                        <GenderIcon size={12} className="text-gray-900" strokeWidth={2.5} />
                    </div>
                </div>
            );
        }
        
        if (animal.isHidden) {
            return (
                <div className={`border ${getBorderColor(animal)} rounded p-1 ${bgColor} flex flex-col items-center justify-center h-full relative`}>
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
            <div className={`border ${getBorderColor(animal)} rounded p-0.5 ${bgColor} relative h-full flex flex-col justify-start gap-1 py-1`}>
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

    const renderPedigreeTree = (animal) => {
        if (!animal) return null;

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
            <div className="min-h-screen flex justify-center pt-4 pb-4 px-4">
                <div className="bg-white rounded-xl shadow-2xl h-fit w-full max-w-[95vw]">
                    {/* Header */}
                    <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                            <FileText className="mr-2" size={24} />
                            Pedigree Chart
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={downloadPDF}
                                disabled={!imagesLoaded}
                                data-tutorial-target="download-pdf-btn"
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-semibold rounded-lg transition text-sm sm:text-base ${
                                    imagesLoaded 
                                        ? 'bg-primary hover:bg-primary/90 text-black cursor-pointer' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                title={!imagesLoaded ? 'Waiting for images to load...' : 'Download PDF'}
                            >
                                <Download size={18} />
                                <span className="hidden sm:inline">{imagesLoaded ? 'Download PDF' : 'Loading...'}</span>
                                <span className="sm:hidden">{imagesLoaded ? 'PDF' : '...'}</span>
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
                    <div className="p-3 sm:p-6">

                {/* Pedigree Chart - Responsive width but fixed for PDF download */}
                <div ref={pedigreeRef} className="bg-white p-3 sm:p-6 rounded-lg border-2 border-gray-300 relative w-full overflow-hidden" style={{minHeight: '500px', aspectRatio: '1123/794'}}>
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
                        <div>{formatDate(new Date())}</div>
                    </div>
                </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// (Removed unused `AnimalListItem` component to reduce redundancy)

const BreederDirectorySettings = ({ authToken, API_BASE_URL, showModalMessage, userProfile }) => {
    const [breedingStatus, setBreedingStatus] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [userAnimals, setUserAnimals] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch user's animals
            const animalsResponse = await axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setUserAnimals(animalsResponse.data || []);

            // Fetch breeding status
            const statusResponse = await axios.get(`${API_BASE_URL}/users/breeding-status`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setBreedingStatus(statusResponse.data.breedingStatus || {});
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoadingStatus(false);
        }
    };

    // Get unique species from user's animals
    const userSpecies = [...new Set(userAnimals.map(animal => animal.species))];
    
    // Get species that are marked as breeder or retired (even if no animals)
    const markedSpecies = Object.keys(breedingStatus).filter(
        species => breedingStatus[species] === 'breeder' || breedingStatus[species] === 'retired'
    );
    
    // Combine: species with animals + species marked as breeder/retired
    const displaySpecies = [...new Set([...userSpecies, ...markedSpecies])].sort();

    const handleStatusChange = (species, status) => {
        setBreedingStatus(prev => {
            const updated = { ...prev };
            if (status === 'owner' || status === '') {
                // Remove from object if set to owner (default)
                delete updated[species];
            } else {
                updated[species] = status;
            }
            return updated;
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.put(
                `${API_BASE_URL}/users/breeding-status`,
                { breedingStatus },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            showModalMessage('Success', 'Breeding status updated successfully.');
        } catch (error) {
            console.error('Error updating breeding status:', error);
            showModalMessage('Error', 'Failed to update breeding status.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingStatus) {
        return (
            <div className="mb-8 p-4 sm:p-6 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin mr-2" size={24} />
                    <span>Loading breeding status...</span>
                </div>
            </div>
        );
    }

    if (displaySpecies.length === 0) {
        return (
            <div className="mb-8 p-4 sm:p-6 border rounded-lg bg-gray-50 overflow-x-hidden">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Species & Breeding Status</h3>
                <p className="text-sm text-gray-600">
                    Add some animals to your collection to manage your breeding status and appear in the Breeders directory.
                </p>
            </div>
        );
    }

    return (
        <div className="mb-8 p-4 sm:p-6 border rounded-lg bg-gray-50 overflow-x-hidden">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Species & Breeding Status</h3>
            <p className="text-sm text-gray-600 mb-1">
                Set your breeding status for each species. Marking yourself as an <strong>Active Breeder</strong> or <strong>Retired Breeder</strong> will make you visible in the Breeders directory.
            </p>
            <p className="text-xs text-gray-500 mb-4">
                Note: Species marked as Active or Retired will remain in your list even if you have no animals of that species.
            </p>

            <div className="space-y-3 mb-4">
                {displaySpecies.map(species => {
                    const animalCount = userAnimals.filter(a => a.species === species).length;
                    const currentStatus = breedingStatus[species] || 'owner';
                    
                    return (
                        <div key={species} className="flex items-center justify-between py-2 border-b border-gray-200">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700">{species}</span>
                                <span className="text-xs text-gray-500">{animalCount} animal{animalCount !== 1 ? 's' : ''}</span>
                            </div>
                            <select
                                value={currentStatus}
                                onChange={(e) => handleStatusChange(species, e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                                disabled={loading}
                            >
                                <option value="owner">🏠 Owner</option>
                                <option value="breeder">⭐ Active Breeder</option>
                                <option value="retired">🌙 Retired Breeder</option>
                            </select>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end pt-2">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                    Save Breeding Status
                </button>
            </div>
        </div>
    );
};

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
                            disabled={((scope === 'local' || scope === 'both') && loadingLocal) || ((scope === 'global' || scope === 'both') && loadingGlobal) || searchTerm.trim().length < 1}
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
    }, [profile?.id_public, profile, API_BASE_URL]);
    
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pb-6 border-b">
                {profile.profileImage ? (
                    <img src={profile.profileImage} alt={displayName} className="w-24 h-24 rounded-lg object-cover shadow-md flex-shrink-0" />
                ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                        <User size={48} className="text-gray-400" />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{displayName}</h2>
                    <p className="text-gray-600">Public ID: <span className="font-mono text-accent">{freshProfile?.id_public || profile.id_public}</span></p>
                    <p className="text-sm text-gray-500 mt-1">Member since {memberSince}</p>
                    
                    {/* Country - Show if available */}
                    {(freshProfile?.country || profile.country) && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                            <span className={`${getCountryFlag(freshProfile?.country || profile.country)} inline-block h-5 w-7 flex-shrink-0`}></span>
                            <span>{getCountryName(freshProfile?.country || profile.country)}</span>
                        </p>
                    )}
                    
                    {/* Bio - Show if available and public */}
                    {(freshProfile?.showBio ?? profile.showBio ?? true) && (freshProfile?.bio || profile.bio) && (
                        <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap break-words">
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
                        <p className="text-sm text-gray-700 mt-2 flex items-start gap-2 break-all">
                            <Globe size={16} className="text-accent flex-shrink-0 mt-0.5" />
                            <a href={freshProfile?.websiteURL || profile.websiteURL} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition underline break-all">
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
                                    const birth = animal.birthDate ? formatDate(animal.birthDate) : '';
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

// ==================== PRIVATE ANIMAL DETAIL (OWNER VIEW) ====================
// Shows ALL data for animal owners viewing their own animals (ignores privacy toggles)
// Accessed from: MY ANIMALS LIST
const PrivateAnimalDetail = ({ animal, onClose, onEdit, API_BASE_URL, authToken, setShowImageModal, setEnlargedImageUrl, toggleSectionPrivacy, onUpdateAnimal, onHideAnimal, showModalMessage, onTransfer, onViewAnimal }) => {
    const [breederInfo, setBreederInfo] = useState(null);
    const [showPedigree, setShowPedigree] = useState(false);
    const [detailViewTab, setDetailViewTab] = useState(1);
    const [copySuccess, setCopySuccess] = useState(false);
    
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
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex justify-center gap-1.5 flex-wrap">
                            <button
                                onClick={handleShare}
                                className="px-2 py-1 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-1 text-xs"
                                title="Copy public link"
                            >
                                <Link size={14} />
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
                            {onTransfer && (
                                <button
                                    onClick={() => onTransfer(animal)}
                                    className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition flex items-center gap-1 text-xs"
                                    title="Transfer"
                                >
                                    <ArrowLeftRight size={14} />
                                    Transfer
                                </button>
                            )}
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
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                                👁️ OWNER VIEW - All Data Visible
                            </span>
                            <button
                                onClick={handleShare}
                                className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-2"
                                title="Copy public link to clipboard"
                            >
                                <Link size={16} />
                                {copySuccess ? 'Link Copied!' : 'Share'}
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
                            {onTransfer && (
                                <button
                                    onClick={() => onTransfer(animal)}
                                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition flex items-center gap-2"
                                    title="Transfer this animal"
                                >
                                    <ArrowLeftRight size={16} />
                                    Transfer
                                </button>
                            )}
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={28} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs - ALL 11 TABS */}
                <div className="bg-white border-b border-gray-300 px-2 sm:px-6 pt-2 sm:pt-4">
                    <div className="flex flex-wrap gap-1 sm:gap-1 pb-2 sm:pb-4">
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
                            { id: 11, label: 'End of Life', icon: '⚖️' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setDetailViewTab(tab.id)}
                                className={`flex-shrink-0 px-2.5 sm:px-3 py-2 sm:py-2 text-base sm:text-sm font-medium rounded border transition-colors ${
                                    detailViewTab === tab.id 
                                        ? 'bg-primary text-black border-gray-400' 
                                        : 'bg-gray-50 text-gray-600 hover:text-gray-800 border-gray-300'
                                }`}
                                title={tab.label}
                            >
                                <span className="sm:mr-1">{tab.icon}</span>
                                <span className="hidden lg:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white border border-t-0 border-gray-300 rounded-b-lg p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-160px)] sm:max-h-[calc(90vh-180px)]">
                    {/* Tab 1: Overview */}
                    {detailViewTab === 1 && (
                        <div className="space-y-4">
                            <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                                <div className="flex flex-col md:flex-row relative">
                                    <div className="w-full md:w-1/3 p-4 sm:p-6 flex flex-col items-center justify-center relative min-h-60 md:min-h-80">
                                        <div className="absolute top-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-0.5 rounded">
                                            {animal.birthDate ? formatDate(animal.birthDate) : ''}
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            {animal.gender === 'Male' ? <Mars size={20} strokeWidth={2.5} className="text-blue-600" /> : animal.gender === 'Female' ? <Venus size={20} strokeWidth={2.5} className="text-pink-600" /> : animal.gender === 'Intersex' ? <VenusAndMars size={20} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={20} strokeWidth={2.5} className="text-gray-500" />}
                                        </div>
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
                                        <div className="text-sm font-medium text-gray-700 mt-2">
                                            {animal.status || 'Unknown'}
                                        </div>
                                    </div>

                                    <div className="w-full md:w-2/3 p-4 sm:p-6 flex flex-col border-t md:border-t-0 md:border-l border-gray-300 space-y-3 relative">
                                        {/* Public Profile Toggle - Top Right */}
                                        <button
                                            onClick={() => {
                                                const newIsDisplay = !animal.isDisplay;
                                                axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { isDisplay: newIsDisplay }, {
                                                    headers: { Authorization: `Bearer ${authToken}` }
                                                }).then(() => {
                                                    // Update animal state directly without closing modal
                                                    if (onUpdateAnimal) {
                                                        onUpdateAnimal({ ...animal, isDisplay: newIsDisplay });
                                                    }
                                                }).catch(err => {
                                                    console.error('Failed to update isDisplay:', err);
                                                });
                                            }}
                                            className="absolute top-4 right-4 px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer"
                                            style={{
                                                backgroundColor: animal.isDisplay ? '#dbeafe' : '#f3f4f6',
                                                color: animal.isDisplay ? '#1e40af' : '#374151'
                                            }}
                                            title="Toggle public profile visibility"
                                        >
                                            <span>{animal.isDisplay ? '🌍 Public' : '🔒 Private'}</span>
                                        </button>

                                        {/* Species/Breed/Strain/CTC - At Top */}
                                        <p className="text-sm text-gray-600">
                                            {animal.species || 'Unknown'}
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
                                        {animal.isForSale && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                                <span className="text-lg"></span>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">For Sale</p>
                                                    <p className="text-sm text-gray-600">
                                                        {animal.salePriceCurrency === 'Negotiable' || !animal.salePriceAmount ? 'Negotiable' : `${animal.salePriceCurrency === 'USD' ? '$' : animal.salePriceCurrency === 'EUR' ? '?' : animal.salePriceCurrency === 'GBP' ? '?' : animal.salePriceCurrency === 'CAD' ? 'C$' : animal.salePriceCurrency === 'AUD' ? 'A$' : animal.salePriceCurrency === 'JPY' ? '?' : animal.salePriceCurrency}${animal.salePriceAmount ? ` ${animal.salePriceAmount}` : ''}`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* For Stud Badge */}
                                        {animal.availableForBreeding && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                                                <span className="text-lg"></span>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">Available for Stud</p>
                                                    <p className="text-sm text-gray-600">
                                                        {animal.studFeeCurrency === 'Negotiable' || !animal.studFeeAmount ? 'Negotiable' : `${animal.studFeeCurrency === 'USD' ? '$' : animal.studFeeCurrency === 'EUR' ? '?' : animal.studFeeCurrency === 'GBP' ? '?' : animal.studFeeCurrency === 'CAD' ? 'C$' : animal.studFeeCurrency === 'AUD' ? 'A$' : animal.studFeeCurrency === 'JPY' ? '?' : animal.studFeeCurrency}${animal.studFeeAmount ? ` ${animal.studFeeAmount}` : ''}`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Appearance */}
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Appearance:</span> {[
                                                animal.color,
                                                animal.coatPattern,
                                                animal.coat,
                                                animal.earset
                                            ].filter(Boolean).join(', ') || ''}
                                        </p>

                                        {/* Genetic Code */}
                                        {animal.geneticCode && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Genetic Code:</span> <code className="bg-gray-100 px-1 rounded font-mono">{animal.geneticCode}</code>
                                            </p>
                                        )}

                                        {/* Date of Birth and Age/Deceased */}
                                        <div className="text-sm text-gray-700 space-y-1">
                                            <p>
                                                <span className="font-semibold">Date of Birth:</span> {animal.birthDate ? `${formatDate(animal.birthDate)} (~${(() => {
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
                                                })()})` : ''}
                                            </p>
                                            {animal.deceasedDate && (
                                                <p className="text-red-600 font-semibold">
                                                    Deceased: {formatDate(animal.deceasedDate)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Remarks */}
                                        {animal.remarks && (
                                            <div className="text-sm text-gray-700">
                                                <span className="font-semibold">Remarks:</span>
                                                <p className="mt-1 whitespace-pre-wrap">{animal.remarks}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Breeder Section */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Breeder</h3>
                                <p className="text-gray-700">
                                    {breederInfo ? (() => {
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
                                    })() : ((animal.manualBreederName || animal.breederId_public) ? <span className="font-mono text-accent">{animal.manualBreederName || animal.breederId_public}</span> : '')}
                                </p>
                            </div>

                            {/* Identification Numbers Section */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Identification Numbers</h3>
                                <div className="space-y-2">
                                    <p className="text-sm"><span className="font-medium">CritterTrack ID:</span> {animal.id_public || ''}</p>
                                    <p className="text-sm"><span className="font-medium">Identification:</span> {animal.breederyId || ''}</p>
                                    <p className="text-sm"><span className="font-medium">Microchip:</span> {animal.microchipNumber || ''}</p>
                                    <p className="text-sm"><span className="font-medium">Pedigree Reg ID:</span> {animal.pedigreeRegistrationId || ''}</p>
                                </div>
                            </div>

                            {/* Genetic Code Display Section */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Genetic Code</h3>
                                <p className="text-gray-700 font-mono text-sm break-all">{animal.geneticCode || ''}</p>
                            </div>

                            {/* Parents Section */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Parents</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ViewOnlyParentCard 
                                        parentId={animal.fatherId_public || animal.sireId_public} 
                                        parentType="Sire"
                                        API_BASE_URL={API_BASE_URL}
                                        onViewAnimal={onViewAnimal}
                                    />
                                    <ViewOnlyParentCard 
                                        parentId={animal.motherId_public || animal.damId_public} 
                                        parentType="Dam"
                                        API_BASE_URL={API_BASE_URL}
                                        onViewAnimal={onViewAnimal}
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
                                <h3 className="text-lg font-semibold text-gray-700">Ownership</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Currently Owned:</span>
                                        <strong>{animal.isOwned ? 'Yes' : 'No'}</strong>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 block mb-1">Breeder:</span>
                                        <strong>{breederInfo ? `${breederInfo.breederName || breederInfo.personalName || 'Unknown'}` : (animal.manualBreederName || animal.breederId_public || '')}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* 2nd Section: Current Owner */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Current Owner</h3>
                                <div className="text-sm space-y-2">
                                    <div>
                                        <span className="text-gray-600">Owner Name:</span>
                                        <strong className="block mt-1">{animal.currentOwner || ''}</strong>
                                    </div>
                                    {(animal.species === 'Dog' || animal.species === 'Cat') && animal.coOwnership && (
                                        <div>
                                            <span className="text-gray-600">Co-Ownership:</span>
                                            <strong className="block mt-1 whitespace-pre-wrap">{animal.coOwnership}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3rd Section: Availability for Sale or Stud */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Availability for Sale or Stud</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">For Sale:</span>
                                        <strong className="block mt-1">
                                            {animal.isForSale ? `Yes - ${animal.salePriceCurrency || ''} ${animal.salePriceAmount || 'Negotiable'}`.trim() : 'No'}
                                        </strong>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">For Stud:</span>
                                        <strong className="block mt-1">
                                            {animal.availableForBreeding ? `Yes - ${animal.studFeeCurrency || ''} ${animal.studFeeAmount || 'Negotiable'}`.trim() : 'No'}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Physical */}
                    {detailViewTab === 3 && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Appearance</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Color:</span> <strong>{animal.color || ''}</strong></div>
                                    <div><span className="text-gray-600">Coat Pattern:</span> <strong>{animal.coatPattern || ''}</strong></div>
                                    <div><span className="text-gray-600">Coat Type:</span> <strong>{animal.coat || ''}</strong></div>
                                    {animal.species === 'Fancy Rat' && <div><span className="text-gray-600">Earset:</span> <strong>{animal.earset || ''}</strong></div>}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Genetic Code</h3>
                                <p className="text-gray-700 font-mono text-sm break-all">{animal.geneticCode || ''}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Life Stage</h3>
                                <p className="text-gray-700 text-sm">{animal.lifeStage || ''}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Measurements</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Weight:</span> <strong>{animal.bodyWeight || ''}</strong></div>
                                    <div><span className="text-gray-600">Length:</span> <strong>{animal.bodyLength || ''}</strong></div>
                                    <div><span className="text-gray-600">Height:</span> <strong>{animal.heightAtWithers || ''}</strong></div>
                                    <div><span className="text-gray-600">Body Condition:</span> <strong>{animal.bodyConditionScore || ''}</strong></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Identification */}
                    {detailViewTab === 4 && (
                        <div className="space-y-6">
                            {/* 1st Section: Identification Numbers */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Identification Numbers</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">CritterTrack ID:</span> <strong>{animal.id_public || ''}</strong></div>
                                    <div><span className="text-gray-600">Identification:</span> <strong>{animal.breederyId || ''}</strong></div>
                                    <div><span className="text-gray-600">Microchip Number:</span> <strong>{animal.microchipNumber || ''}</strong></div>
                                    <div><span className="text-gray-600">Pedigree Registration ID:</span> <strong>{animal.pedigreeRegistrationId || ''}</strong></div>
                                </div>
                            </div>

                            {/* 2nd Section: Classification */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Classification</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Species:</span> <strong>{animal.species || ''}</strong></div>
                                    <div><span className="text-gray-600">Breed:</span> <strong>{animal.breed || ''}</strong></div>
                                    <div><span className="text-gray-600">Strain:</span> <strong>{animal.strain || ''}</strong></div>
                                </div>
                            </div>

                            {/* 3rd Section: Tags */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Tags</h3>
                                {animal.tags && animal.tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {animal.tags.map((tag, idx) => (
                                            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-700 text-sm"></p>}
                            </div>
                        </div>
                    )}

                    {/* Tab 5: Lineage */}
                    {detailViewTab === 5 && (
                        <div className="space-y-6">
                            {/* 1st Section: Pedigree */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-700">Pedigree: Sire and Dam </h3>
                                    <button
                                        onClick={() => setShowPedigree(true)}
                                        data-tutorial-target="pedigree-btn"
                                        className="px-3 py-1 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition text-sm"
                                    >
                                        View Pedigree Chart
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ViewOnlyParentCard 
                                        parentId={animal.fatherId_public || animal.sireId_public} 
                                        parentType="Sire"
                                        API_BASE_URL={API_BASE_URL}
                                        onViewAnimal={onViewAnimal}
                                    />
                                    <ViewOnlyParentCard 
                                        parentId={animal.motherId_public || animal.damId_public} 
                                        parentType="Dam"
                                        API_BASE_URL={API_BASE_URL}
                                        onViewAnimal={onViewAnimal}
                                    />
                                </div>
                            </div>

                            {/* 2nd Section: Origin */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Origin</h3>
                                <p className="text-sm text-gray-700">{animal.origin || ''}</p>
                            </div>

                            {/* 3rd Section: Ownership History */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Ownership History</h3>
                                <p className="text-sm text-gray-700"></p>
                            </div>

                            {/* Offspring Section */}
                            <OffspringSection animalId={animal.id_public} API_BASE_URL={API_BASE_URL} authToken={authToken} onViewAnimal={onViewAnimal} />
                        </div>
                    )}

                    {/* Tab 6: Breeding */}
                    {detailViewTab === 6 && (
                        <div className="space-y-6">
                            {/* 1st Section: Reproductive Status */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Reproductive Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Neutered/Spayed:</span> <strong>{animal.isNeutered ? 'Yes' : 'No'}</strong></div>
                                    <div><span className="text-gray-600">Infertile:</span> <strong>{animal.isInfertile ? 'Yes' : 'No'}</strong></div>
                                    {!animal.isNeutered && !animal.isInfertile && (
                                        <div><span className="text-gray-600">In Mating:</span> <strong>{animal.isInMating ? 'Yes' : 'No'}</strong></div>
                                    )}
                                    {(animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && !animal.isNeutered && (
                                        <>
                                            <div><span className="text-gray-600">Pregnant:</span> <strong>{animal.isPregnant ? 'Yes' : 'No'}</strong></div>
                                            <div><span className="text-gray-600">Nursing:</span> <strong>{animal.isNursing ? 'Yes' : 'No'}</strong></div>
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
                                    <h3 className="text-lg font-semibold text-gray-700">Estrus/Cycle</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Heat Status:</span> <strong>{animal.heatStatus || ''}</strong></div>
                                        <div><span className="text-gray-600">Last Heat Date:</span> <strong>{animal.lastHeatDate ? formatDate(animal.lastHeatDate) : ''}</strong></div>
                                        <div><span className="text-gray-600">Ovulation Date:</span> <strong>{animal.ovulationDate ? formatDate(animal.ovulationDate) : ''}</strong></div>
                                        {(animal.species === 'Dog' || animal.species === 'Cat') && (
                                            <div><span className="text-gray-600">Estrus Cycle Length:</span> <strong>{animal.estrusCycleLength ? `${animal.estrusCycleLength} days` : ''}</strong></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 3rd Section: Mating */}
                            {!animal.isNeutered && !animal.isInfertile && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700">Mating</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Mating Date:</span> <strong>{formatDateDisplay(animal.matingDates)}</strong></div>
                                        <div><span className="text-gray-600">Expected Due Date:</span> <strong>{formatDateDisplay(animal.expectedDueDate)}</strong></div>
                                        {(animal.species === 'Dog' || animal.species === 'Cat') && (
                                            <div><span className="text-gray-600">Artificial Insemination:</span> <strong>{animal.artificialInseminationUsed ? 'Yes' : 'No'}</strong></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 4th Section: Stud Information */}
                            {!animal.isNeutered && !animal.isInfertile && (animal.gender === 'Male' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700">Stud Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Fertility Status:</span> <strong>{animal.fertilityStatus || ''}</strong></div>
                                        <div><span className="text-gray-600">Successful Matings:</span> <strong>{animal.successfulMatings || ''}</strong></div>
                                    </div>
                                    {animal.fertilityNotes && (
                                        <div className="text-sm"><span className="text-gray-600">Notes:</span> <p className="text-gray-700 mt-1 whitespace-pre-wrap">{animal.fertilityNotes}</p></div>
                                    )}
                                    {(animal.species === 'Dog' || animal.species === 'Cat') && (
                                        <>
                                            {animal.reproductiveClearances && (
                                                <div className="text-sm"><span className="text-gray-600">Reproductive Clearances:</span> <p className="text-gray-700 mt-1 whitespace-pre-wrap">{animal.reproductiveClearances}</p></div>
                                            )}
                                            {animal.reproductiveComplications && (
                                                <div className="text-sm"><span className="text-gray-600">Reproductive Complications:</span> <p className="text-gray-700 mt-1 whitespace-pre-wrap">{animal.reproductiveComplications}</p></div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 5th Section: Dam Information */}
                            {!animal.isNeutered && !animal.isInfertile && (animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700">Dam Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Dam Fertility Status:</span> <strong>{animal.damFertilityStatus || animal.fertilityStatus || ''}</strong></div>
                                        {(animal.species === 'Dog' || animal.species === 'Cat') && (
                                            <>
                                                <div><span className="text-gray-600">Gestation Length:</span> <strong>{animal.gestationLength ? `${animal.gestationLength} days` : ''}</strong></div>
                                                <div><span className="text-gray-600">Delivery Method:</span> <strong>{animal.deliveryMethod || ''}</strong></div>
                                                {animal.species === 'Dog' && animal.whelpingDate && (
                                                    <div><span className="text-gray-600">Whelping Date:</span> <strong>{formatDate(animal.whelpingDate)}</strong></div>
                                                )}
                                                {animal.species === 'Cat' && animal.queeningDate && (
                                                    <div><span className="text-gray-600">Queening Date:</span> <strong>{formatDate(animal.queeningDate)}</strong></div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    {animal.damFertilityNotes && (
                                        <div className="text-sm"><span className="text-gray-600">Notes:</span> <p className="text-gray-700 mt-1 whitespace-pre-wrap">{animal.damFertilityNotes}</p></div>
                                    )}
                                    {(animal.species === 'Dog' || animal.species === 'Cat') && (
                                        <>
                                            {animal.reproductiveClearances && (
                                                <div className="text-sm"><span className="text-gray-600">Reproductive Clearances:</span> <p className="text-gray-700 mt-1 whitespace-pre-wrap">{animal.reproductiveClearances}</p></div>
                                            )}
                                            {animal.reproductiveComplications && (
                                                <div className="text-sm"><span className="text-gray-600">Reproductive Complications:</span> <p className="text-gray-700 mt-1 whitespace-pre-wrap">{animal.reproductiveComplications}</p></div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 6th Section: Breeding History */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center"><span className="text-blue-600 mr-2"></span>Breeding History</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {(animal.gender === 'Male' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                        <>
                                            <div><span className="text-gray-600">Last Mating Date:</span> <strong>{animal.lastMatingDate ? formatDate(animal.lastMatingDate) : ''}</strong></div>
                                            <div><span className="text-gray-600">Successful Matings:</span> <strong>{animal.successfulMatings || ''}</strong></div>
                                        </>
                                    )}
                                    {(animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                        <>
                                            <div><span className="text-gray-600">Last Pregnancy Date:</span> <strong>{animal.lastPregnancyDate ? formatDate(animal.lastPregnancyDate) : ''}</strong></div>
                                            <div><span className="text-gray-600">Litter Count:</span> <strong>{animal.litterCount || ''}</strong></div>
                                        </>
                                    )}
                                    <div><span className="text-gray-600">Total Offspring:</span> <strong>{animal.offspringCount || ''}</strong></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 7: Health */}
                    {detailViewTab === 7 && (
                        <div className="space-y-6">
                            {/* 1st Section: Preventive Care */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Preventive Care</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Vaccinations:</span> <strong>{animal.vaccinations || ''}</strong></div>
                                    <div><span className="text-gray-600">Deworming Records:</span> <strong>{animal.dewormingRecords || ''}</strong></div>
                                    <div><span className="text-gray-600">Parasite Control:</span> <strong>{animal.parasiteControl || ''}</strong></div>
                                </div>
                            </div>

                            {/* 2nd Section: Procedures & Diagnostics */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Procedures & Diagnostics</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Medical Procedures:</span> <strong>{animal.medicalProcedures && (
                                    <div>
                                        <strong className="text-sm">Medical Procedures:</strong>
                                        <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                            {(() => {
                                                const data = animal.medicalProcedures;
                                                const parsed = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return []; } })() : Array.isArray(data) ? data : [];
                                                return parsed.map((proc, idx) => (
                                                    <li key={idx} className="text-gray-700">
                                                        {proc.name} {proc.date && `(${formatDate(proc.date)})`}
                                                        {proc.notes && <span className="text-gray-600"> - {proc.notes}</span>}
                                                    </li>
                                                ));
                                            })()}
                                        </ul>
                                    </div>
                                )}</strong></div>
                                    <div><span className="text-gray-600">Laboratory Results:</span> <strong>{animal.laboratoryResults || ''}</strong></div>
                                </div>
                            </div>

                            {/* 3rd Section: Active Medical Records */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Active Medical Records</h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-gray-600 text-sm font-semibold">Medical Conditions:</span>
                                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{animal.medicalConditions || ''}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Allergies:</span> <strong>{animal.allergies || ''}</strong></div>
                                        <div><span className="text-gray-600">Current Medications:</span> <strong>{animal.medications || ''}</strong></div>
                                    </div>
                                </div>
                            </div>

                            {/* 4th Section: Veterinary Care */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Veterinary Care</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Primary Veterinarian:</span> <strong>{animal.primaryVet || ''}</strong></div>
                                    <div><span className="text-gray-600">Veterinary Visits:</span> <strong>{animal.vetVisits && (
                                    <div>
                                        <strong className="text-sm">Veterinary Visits:</strong>
                                        <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                            {(() => {
                                                const data = animal.vetVisits;
                                                const parsed = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return []; } })() : Array.isArray(data) ? data : [];
                                                return parsed.map((visit, idx) => (
                                                    <li key={idx} className="text-gray-700">
                                                        {visit.reason} {visit.date && `(${formatDate(visit.date)})`}
                                                        {visit.notes && <span className="text-gray-600"> - {visit.notes}</span>}
                                                    </li>
                                                ));
                                            })()}
                                        </ul>
                                    </div>
                                )}</strong></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 8: Husbandry */}
                    {detailViewTab === 8 && (
                        <div className="space-y-6">
                            {/* 1st Section: Nutrition */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Nutrition</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Diet Type:</span> <strong>{animal.dietType || ''}</strong></div>
                                    <div><span className="text-gray-600">Feeding Schedule:</span> <strong>{animal.feedingSchedule || ''}</strong></div>
                                    <div><span className="text-gray-600">Supplements:</span> <strong>{animal.supplements || ''}</strong></div>
                                </div>
                            </div>

                            {/* 2nd Section: Husbandry */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Husbandry</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Housing Type:</span> <strong>{animal.housingType || ''}</strong></div>
                                    <div><span className="text-gray-600">Bedding:</span> <strong>{animal.bedding || ''}</strong></div>
                                    <div><span className="text-gray-600">Enrichment:</span> <strong>{animal.enrichment || ''}</strong></div>
                                </div>
                            </div>

                            {/* 3rd Section: Environment */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Environment</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Temperature Range:</span> <strong>{animal.temperatureRange || ''}</strong></div>
                                    <div><span className="text-gray-600">Humidity:</span> <strong>{animal.humidity || ''}</strong></div>
                                    <div><span className="text-gray-600">Lighting:</span> <strong>{animal.lighting || ''}</strong></div>
                                    <div><span className="text-gray-600">Noise Level:</span> <strong>{animal.noise || ''}</strong></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 9: Behavior */}
                    {detailViewTab === 9 && (
                        <div className="space-y-6">
                            {/* 1st Section: Behavior */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Behavior</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Temperament:</span> <strong>{animal.temperament || ''}</strong></div>
                                    <div><span className="text-gray-600">Handling Tolerance:</span> <strong>{animal.handlingTolerance || ''}</strong></div>
                                    <div><span className="text-gray-600">Social Structure:</span> <strong>{animal.socialStructure || ''}</strong></div>
                                </div>
                            </div>

                            {/* 2nd Section: Activity */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Activity</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Activity Cycle:</span> <strong>{animal.activityCycle || ''}</strong></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 10: Records */}
                    {detailViewTab === 10 && (
                        <div className="space-y-6">
                            {/* 1st Section: Remarks & Notes */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Remarks & Notes</h3>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{animal.remarks || ''}</p>
                            </div>
                        </div>
                    )}                    {/* Tab 11: End of Life */}
                    {detailViewTab === 11 && (
                        <div className="space-y-6">
                            {/* 1st Section: Information */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Deceased Date:</span> <strong>{animal.deceasedDate ? formatDate(animal.deceasedDate) : ''}</strong></div>
                                    <div><span className="text-gray-600">Cause of Death:</span> <strong>{animal.causeOfDeath || ''}</strong></div>
                                    <div><span className="text-gray-600">Necropsy Results:</span> <strong>{animal.necropsyResults || ''}</strong></div>
                                    {(animal.species === 'Dog' || animal.species === 'Cat') && animal.endOfLifeCareNotes && (
                                        <div><span className="text-gray-600">End of Life Care Notes:</span> <p className="text-gray-700 mt-1 whitespace-pre-wrap">{animal.endOfLifeCareNotes}</p></div>
                                    )}
                                </div>
                            </div>

                            {/* 2nd Section: Legal/Administrative */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Legal/Administrative</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Insurance:</span> <strong>{animal.insurance || ''}</strong></div>
                                    <div><span className="text-gray-600">Legal Status:</span> <strong>{animal.legalStatus || ''}</strong></div>
                                </div>
                            </div>

                            {/* 3rd Section: Restrictions (Dog/Cat only) */}
                            {(animal.species === 'Dog' || animal.species === 'Cat') && (animal.breedingRestrictions || animal.exportRestrictions) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700">Restrictions</h3>
                                    <div className="space-y-3 text-sm">
                                        {animal.breedingRestrictions && (
                                            <div><span className="text-gray-600">Breeding Restrictions:</span> <p className="text-gray-700 mt-1 whitespace-pre-wrap">{animal.breedingRestrictions}</p></div>
                                        )}
                                        {animal.exportRestrictions && (
                                            <div><span className="text-gray-600">Export Restrictions:</span> <p className="text-gray-700 mt-1 whitespace-pre-wrap">{animal.exportRestrictions}</p></div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 12: Show */}
                    {detailViewTab === 12 && (
                        <div className="space-y-6">
                            {/* Show Titles & Ratings */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Show Titles & Ratings</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Titles:</span> <strong>{animal.showTitles || ''}</strong></div>
                                    <div><span className="text-gray-600">Ratings:</span> <strong>{animal.showRatings || ''}</strong></div>
                                    <div><span className="text-gray-600">Judge Comments:</span> <p className="text-gray-700 mt-1 whitespace-pre-wrap">{animal.judgeComments || ''}</p></div>
                                </div>
                            </div>

                            {/* Working Titles & Performance - Dog only */}
                            {animal.species === 'Dog' && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700">Working & Performance</h3>
                                    <div className="space-y-3 text-sm">
                                        <div><span className="text-gray-600">Working Titles:</span> <strong>{animal.workingTitles || ''}</strong></div>
                                        <div><span className="text-gray-600">Performance Scores:</span> <strong>{animal.performanceScores || ''}</strong></div>
                                    </div>
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
                    />
                )}
            </div>
        </div>
    </div>
    );
};

// ==================== VIEW-ONLY PRIVATE ANIMAL DETAIL (SOLD/TRANSFERRED) ====================
// Identical to PrivateAnimalDetail but without edit/delete and privacy controls
// Used for animals you have view-only access to (sold, transferred, purchased)
const ViewOnlyPrivateAnimalDetail = ({ animal, onClose, API_BASE_URL, authToken, setShowImageModal, setEnlargedImageUrl, onHideAnimal, showModalMessage, onViewAnimal }) => {
    const [breederInfo, setBreederInfo] = useState(null);
    const [showPedigree, setShowPedigree] = useState(false);
    const [detailViewTab, setDetailViewTab] = useState(1);
    
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
                            <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-medium">
                                📋 VIEW-ONLY
                            </span>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex justify-center gap-1.5 flex-wrap">
                            {onHideAnimal && (
                                <button
                                    onClick={() => {
                                        if (window.confirm(`Hide ${animal.name || 'this animal'}? You can restore it anytime from the hidden animals section.`)) {
                                            onHideAnimal(animal.id_public);
                                            onClose();
                                        }
                                    }}
                                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                                    title="Hide this animal - move to hidden section"
                                >
                                    <Eye size={14} />
                                    Hide
                                </button>
                            )}
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
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">
                                📋 VIEW-ONLY - Read Only Access
                            </span>
                            {onHideAnimal && (
                                <button
                                    onClick={() => {
                                        if (window.confirm(`Hide ${animal.name || 'this animal'}? You can restore it anytime from the hidden animals section.`)) {
                                            onHideAnimal(animal.id_public);
                                            onClose();
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition flex items-center gap-2"
                                    title="Hide this animal - move to hidden section"
                                >
                                    <Eye size={16} />
                                    Hide
                                </button>
                            )}
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={28} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs - ALL 11 TABS (same as PrivateAnimalDetail) */}
                <div className="bg-white border-b border-gray-300 px-6 pt-4">
                    <div className="flex flex-wrap gap-1 pb-4">
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
                            { id: 11, label: 'End of Life', icon: '⚖️' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setDetailViewTab(tab.id)}
                                className={`flex-shrink-0 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded border transition-colors ${
                                    detailViewTab === tab.id 
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

                {/* Tab Content - COPY OF PRIVATE DETAIL (no edit/delete/privacy toggle in Tab 1) */}
                <div className="bg-white border border-t-0 border-gray-300 rounded-b-lg p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Tab 1: Overview - NO PRIVACY TOGGLE */}
                    {detailViewTab === 1 && (
                        <div className="space-y-4">
                            <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                                <div className="flex flex-col md:flex-row relative">
                                    <div className="w-full md:w-1/3 p-4 sm:p-6 flex flex-col items-center justify-center relative min-h-60 md:min-h-80">
                                        <div className="absolute top-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-0.5 rounded">
                                            {animal.birthDate ? formatDate(animal.birthDate) : ''}
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            {animal.gender === 'Male' ? <Mars size={20} strokeWidth={2.5} className="text-blue-600" /> : animal.gender === 'Female' ? <Venus size={20} strokeWidth={2.5} className="text-pink-600" /> : animal.gender === 'Intersex' ? <VenusAndMars size={20} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={20} strokeWidth={2.5} className="text-gray-500" />}
                                        </div>
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
                                        <div className="text-sm font-medium mt-2">
                                            {animal.breederId_public && animal.ownerId_public && animal.breederId_public !== animal.ownerId_public ? (
                                                <div className="space-y-1">
                                                    <div className="text-gray-700">Sold</div>
                                                    {animal.status && <div className="text-gray-700">{animal.status}</div>}
                                                </div>
                                            ) : (
                                                <span className="text-gray-700">{animal.status || 'Unknown'}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full md:w-2/3 p-4 sm:p-6 flex flex-col border-t md:border-t-0 md:border-l border-gray-300 space-y-3">
                                        {/* Species/Breed/Strain/CTC - At Top (NO PRIVACY TOGGLE) */}
                                        <p className="text-sm text-gray-600">
                                            {animal.species || 'Unknown'}
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
                                        {animal.isForSale && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                                <span className="text-lg"></span>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">For Sale</p>
                                                    <p className="text-sm text-gray-600">
                                                        {animal.salePriceCurrency === 'Negotiable' || !animal.salePriceAmount ? 'Negotiable' : `${animal.salePriceCurrency === 'USD' ? '$' : animal.salePriceCurrency === 'EUR' ? '?' : animal.salePriceCurrency === 'GBP' ? '?' : animal.salePriceCurrency === 'CAD' ? 'C$' : animal.salePriceCurrency === 'AUD' ? 'A$' : animal.salePriceCurrency === 'JPY' ? '?' : animal.salePriceCurrency}${animal.salePriceAmount ? ` ${animal.salePriceAmount}` : ''}`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* For Stud Badge */}
                                        {animal.availableForBreeding && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                                                <span className="text-lg"></span>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">Available for Stud</p>
                                                    <p className="text-sm text-gray-600">
                                                        {animal.studFeeCurrency === 'Negotiable' || !animal.studFeeAmount ? 'Negotiable' : `${animal.studFeeCurrency === 'USD' ? '$' : animal.studFeeCurrency === 'EUR' ? '?' : animal.studFeeCurrency === 'GBP' ? '?' : animal.studFeeCurrency === 'CAD' ? 'C$' : animal.studFeeCurrency === 'AUD' ? 'A$' : animal.studFeeCurrency === 'JPY' ? '?' : animal.studFeeCurrency}${animal.studFeeAmount ? ` ${animal.studFeeAmount}` : ''}`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Appearance */}
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Appearance:</span> {[
                                                animal.color,
                                                animal.coatPattern,
                                                animal.coat,
                                                animal.earset
                                            ].filter(Boolean).join(', ') || ''}
                                        </p>

                                        {/* Genetic Code */}
                                        {animal.geneticCode && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Genetic Code:</span> <code className="bg-gray-100 px-1 rounded font-mono">{animal.geneticCode}</code>
                                            </p>
                                        )}

                                        {/* Date of Birth and Age/Deceased */}
                                        <div className="text-sm text-gray-700 space-y-1">
                                            <p>
                                                <span className="font-semibold">Date of Birth:</span> {animal.birthDate ? `${formatDate(animal.birthDate)} (~${(() => {
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
                                                })()})` : ''}
                                            </p>
                                            {animal.deceasedDate && (
                                                <p className="text-red-600 font-semibold">
                                                    Deceased: {formatDate(animal.deceasedDate)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Remarks */}
                                        {animal.remarks && (
                                            <div className="text-sm text-gray-700">
                                                <span className="font-semibold">Remarks:</span>
                                                <p className="mt-1 whitespace-pre-wrap">{animal.remarks}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Breeder Section */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Breeder</h3>
                                <p className="text-gray-700">
                                    {breederInfo ? (() => {
