import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, Trash2, Edit, Save, PlusCircle, Plus, ArrowLeft, Loader2, RefreshCw, User, ClipboardList, BookOpen, Settings, Mail, Globe, Egg, Milk, Search, X, Mars, Venus, Eye, EyeOff, Home, Heart, HeartOff, Bell, XCircle, Download, FileText, Link, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import MouseGeneticsCalculator from './components/MouseGeneticsCalculator';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import InstallPWA from './components/InstallPWA';

// const API_BASE_URL = 'http://localhost:5000/api'; // Local development
const API_BASE_URL = 'https://crittertrack-pedigree-production.up.railway.app/api'; // Direct Railway (for testing)
// const API_BASE_URL = '/api'; // Production via Vercel proxy

const GENDER_OPTIONS = ['Male', 'Female'];
const STATUS_OPTIONS = ['Pet', 'Breeder', 'Available', 'Retired', 'Deceased', 'Rehomed', 'Unknown']; 

const DEFAULT_SPECIES_OPTIONS = ['Mouse', 'Rat', 'Hamster'];

// Helper function to get plural/display names for species
const getSpeciesDisplayName = (species) => {
    const displayNames = {
        'Mouse': 'Fancy Mice',
        'Rat': 'Rats',
        'Hamster': 'Hamsters'
    };
    return displayNames[species] || species;
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
                                const breederName = breeder.showBreederName && breeder.personalName && breeder.breederName 
                                    ? `${breeder.personalName} (${breeder.breederName})` 
                                    : (breeder.showBreederName && breeder.breederName 
                                        ? breeder.breederName 
                                        : breeder.personalName || `${animalInfo.breederId_public}`);
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
                        {animal.prefix && `${animal.prefix} `}{animal.name}
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
                        {animal.prefix && `${animal.prefix} `}{animal.name}
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
                        {animal.prefix && `${animal.prefix} `}{animal.name}
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
                    {animal.prefix && `${animal.prefix} `}{animal.name}
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
                <div className="font-semibold text-xs text-gray-800 truncate leading-tight">
                    {animal.prefix && `${animal.prefix} `}{animal.name}
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
        
        // Add personal name if available
        if (ownerProfile.personalName) {
            lines.push(ownerProfile.personalName);
        }
        
        // Add breeder name if it's public and available
        if (ownerProfile.showBreederName && ownerProfile.breederName) {
            lines.push(ownerProfile.breederName);
        }
        
        return { 
            lines: lines.length > 0 ? lines : [userId || 'Unknown'], 
            userId 
        };
    };
    
    // Bottom left - 1 line (CTID - Personal Name - Breeder Name)
    const getOwnerDisplayInfoBottomLeft = () => {
        if (!ownerProfile) return 'Unknown Owner';
        
        const userId = ownerProfile.id_public || pedigreeData?.ownerId_public || pedigreeData?.breederId_public;
        const parts = [];
        
        // Add CTID first
        if (userId) {
            parts.push(userId);
        }
        
        // Add personal name if available
        if (ownerProfile.personalName) {
            parts.push(ownerProfile.personalName);
        }
        
        // Add breeder name if it's public and available
        if (ownerProfile.showBreederName && ownerProfile.breederName) {
            parts.push(ownerProfile.breederName);
        }
        
        return parts.length > 0 ? parts.join(' - ') : 'Unknown';
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
                            <h3 className="text-lg font-bold text-gray-800">{pedigreeData?.species || 'Unknown Species'}</h3>
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
                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}
                    </p>
                    <p className="text-xs text-gray-500">{animal.id_public}</p>
                    <p className="text-sm text-gray-600">
                        {animal.species} • {animal.gender} • {animal.status || 'Unknown'}
                    </p>
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

        // Detect ID searches (CT1234 or 1234)
        const idMatch = trimmedSearchTerm.match(/^\s*(?:CT[- ]?)?(\d+)\s*$/i);
        const isIdSearch = !!idMatch;
        const idValue = isIdSearch ? idMatch[1] : null;

        // --- CONSTRUCT FILTER QUERIES ---
        const genderQuery = requiredGender ? `&gender=${requiredGender}` : '';
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
                const filteredLocal = localResponse.data.filter(a => a.id_public !== currentId);
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
                const filteredGlobal = globalResponse.data.filter(a => a.id_public !== currentId);
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
                <p className="font-semibold text-gray-800">{animal.prefix} {animal.name} ({animal.id_public})</p>
                <p className="text-sm text-gray-600">
                    {animal.species} | {animal.gender} | {animal.status}
                </p>
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
        
        // Determine display name(s)
        const showBothNames = user.showBreederName && user.personalName && user.breederName;
        const displayName = showBothNames 
            ? `${user.personalName} (${user.breederName})`
            : (user.showBreederName && user.breederName ? user.breederName : user.personalName || 'Anonymous Breeder');
        
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
                        {animal.prefix && `${animal.prefix} `}{animal.name}
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
const PublicProfileView = ({ profile, onBack, onViewAnimal, API_BASE_URL }) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    const handleShare = () => {
        const url = `${window.location.origin}/user/${profile.id_public}`;
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

    const memberSince = profile.createdAt 
        ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(profile.createdAt))
        : (profile.updatedAt ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(profile.updatedAt)) : 'Unknown');

    // Determine display name(s)
    const showBothNames = profile.showBreederName && profile.personalName && profile.breederName;
    const displayName = showBothNames 
        ? `${profile.personalName} (${profile.breederName})`
        : (profile.showBreederName && profile.breederName ? profile.breederName : profile.personalName || 'Anonymous Breeder');

    // Apply filters
    const filteredAnimals = animals.filter(animal => {
        if (speciesFilter && animal.species !== speciesFilter) return false;
        if (genderFilter && animal.gender !== genderFilter) return false;
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
            <div className="flex justify-between items-start mb-6">
                <button 
                    onClick={onBack} 
                    className="flex items-center text-gray-600 hover:text-gray-800 transition"
                >
                    <ArrowLeft size={18} className="mr-1" /> Back
                </button>
                <button
                    onClick={handleShare}
                    className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-2"
                >
                    <Link size={16} />
                    {copySuccess ? 'Link Copied!' : 'Share Profile'}
                </button>
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
                    <p className="text-gray-600">Public ID: <span className="font-mono text-accent">{profile.id_public}</span></p>
                    <p className="text-sm text-gray-500 mt-1">Member since {memberSince}</p>
                </div>
            </div>

            {/* Public Animals */}
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Public Animals ({filteredAnimals.length})</h3>
            
            {/* Filters */}
            {animals.length > 0 && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-3">
                    {/* Status dropdown */}
                    <div className="flex gap-2 items-center">
                        <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Status:</span>
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)} 
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-full sm:w-auto sm:min-w-[150px]"
                        >
                            <option value="">All</option>
                            {STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Species and Gender filters */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200">
                        {/* Species filter */}
                        <div className="flex gap-2 items-center flex-wrap">
                            <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Species:</span>
                            {['All', ...DEFAULT_SPECIES_OPTIONS].map(species => {
                                const value = species === 'All' ? '' : species;
                                const isCurrentSelected = speciesFilter === value;
                                const displayName = species === 'All' ? 'All' : getSpeciesDisplayName(species);
                                
                                return (
                                    <button key={species} onClick={() => setSpeciesFilter(value)}
                                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm ${ 
                                            isCurrentSelected ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {displayName}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Gender filter */}
                    <div className="flex gap-2 items-center flex-wrap pt-2 border-t border-gray-200">
                        <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Gender:</span>
                        {['All', ...GENDER_OPTIONS].map(gender => {
                            const value = gender === 'All' ? '' : gender;
                            const isCurrentSelected = genderFilter === value;
                            let selectedClasses = isCurrentSelected ? (gender === 'Male' ? 'bg-primary text-black' : gender === 'Female' ? 'bg-accent text-white' : 'bg-primary-dark text-black') : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
                            
                            return (
                                <button key={gender} onClick={() => setGenderFilter(value)}
                                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm ${selectedClasses}`}
                                >
                                    {gender}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            
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
                                                className="relative bg-white rounded-xl shadow-sm w-44 h-56 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border border-gray-300 pt-3"
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
                                                        {animal.gender === 'Male' ? <Mars size={16} strokeWidth={2.5} className="text-primary" /> : <Venus size={16} strokeWidth={2.5} className="text-accent" />}
                                                    </div>
                                                )}

                                                {/* Centered profile image */}
                                                <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                    <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                                                        <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={36} />
                                                    </div>
                                                </div>
                                                
                                                {/* Prefix / Name under image */}
                                                <div className="w-full text-center px-2 pb-1 mt-2">
                                                    <div className="text-sm font-semibold text-gray-800 truncate">{animal.prefix ? `${animal.prefix} ` : ''}{animal.name}</div>
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
    const [ownerPrivacySettings, setOwnerPrivacySettings] = useState(null);
    const [showPedigree, setShowPedigree] = useState(false);
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
    
    // Fetch owner's privacy settings
    React.useEffect(() => {
        const fetchOwnerPrivacy = async () => {
            if (animal?.ownerId_public) {
                try {
                    const response = await axios.get(
                        `${API_BASE_URL}/public/profiles/search?query=${animal.ownerId_public}&limit=1`
                    );
                    console.log('Owner privacy response:', response.data);
                    if (response.data && response.data.length > 0) {
                        const settings = {
                            showGeneticCodePublic: response.data[0].showGeneticCodePublic ?? false,
                            showRemarksPublic: response.data[0].showRemarksPublic ?? false
                        };
                        console.log('Owner privacy settings:', settings);
                        setOwnerPrivacySettings(settings);
                    }
                } catch (error) {
                    console.error('Failed to fetch owner privacy settings:', error);
                    setOwnerPrivacySettings({ showGeneticCodePublic: false, showRemarksPublic: false });
                }
            } else {
                setOwnerPrivacySettings({ showGeneticCodePublic: false, showRemarksPublic: false });
            }
        };
        fetchOwnerPrivacy();
    }, [animal?.ownerId_public, API_BASE_URL]);
    
    if (!animal) return null;

    const imgSrc = animal.imageUrl || animal.photoUrl || null;
    const birthDate = animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : 'Unknown';

    // Only show remarks and genetic code if owner's privacy settings allow AND data exists
    const showRemarks = ownerPrivacySettings?.showRemarksPublic && animal.remarks;
    const showGeneticCode = ownerPrivacySettings?.showGeneticCodePublic && animal.geneticCode;
    
    console.log('Animal data:', { 
        ownerId_public: animal.ownerId_public,
        hasRemarks: !!animal.remarks, 
        hasGeneticCode: !!animal.geneticCode,
        ownerPrivacySettings,
        showRemarks,
        showGeneticCode
    });

    return (
        <div className="fixed inset-0 bg-accent/10 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-primary rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="bg-white rounded-lg p-4 mb-6">
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
                                {copySuccess ? 'Link Copied!' : 'Share Link'}
                            </button>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={28} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Image with Name, ID, Species, Status below */}
                    <div className="w-full flex flex-col items-center">
                        <div className="w-48 h-48 bg-gray-100 rounded-lg shadow-lg overflow-hidden flex items-center justify-center">
                            <AnimalImage 
                                src={imgSrc} 
                                alt={animal.name} 
                                className="w-full h-full object-cover"
                                iconSize={64}
                            />
                        </div>
                        <div className="mt-4 space-y-2">
                            <h2 className="text-3xl font-bold text-gray-900 text-center">
                                {animal.prefix && `${animal.prefix} `}{animal.name}
                            </h2>
                            <p className="text-center">
                                <span className="text-base font-medium text-gray-700">{animal.id_public}</span>
                                <span className="mx-2 text-gray-400">•</span>
                                <span className="text-base font-medium text-gray-700">{animal.species}</span>
                            </p>
                            {animal.status && (
                                <div className="flex justify-center">
                                    <div className="bg-gray-100 px-4 py-1 rounded border border-gray-300">
                                        <span className="text-xs font-medium text-gray-700">{animal.status}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Info */}
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Gender</p>
                                <p className="text-lg">{animal.gender}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Birth Date</p>
                                <p className="text-lg">{birthDate}</p>
                            </div>
                            {animal.color && (
                                <div>
                                    <p className="text-sm text-gray-600">Color</p>
                                    <p className="text-lg">{animal.color}</p>
                                </div>
                            )}
                            {animal.coat && (
                                <div>
                                    <p className="text-sm text-gray-600">Coat</p>
                                    <p className="text-lg">{animal.coat}</p>
                                </div>
                            )}
                            {animal.breederyId && (
                                <div>
                                    <p className="text-sm text-gray-600">Breedery ID</p>
                                    <p className="text-lg">{animal.breederyId}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Genetic Code (only if public) */}
                    {showGeneticCode && (
                        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Genetic Code</h3>
                            <p className="text-gray-700 font-mono">{animal.geneticCode}</p>
                        </div>
                    )}

                    {/* Remarks (only if public) */}
                    {showRemarks && (
                        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Remarks / Notes</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{animal.remarks}</p>
                        </div>
                    )}

                    {/* Breeder */}
                    {animal.breederId_public && (
                        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Breeder</h3>
                            <p className="text-gray-700">
                                {breederInfo ? (
                                    <button
                                        onClick={() => onViewProfile && onViewProfile(breederInfo)}
                                        className="text-primary hover:text-primary-dark underline font-medium transition"
                                    >
                                        {breederInfo.showBreederName && breederInfo.personalName && breederInfo.breederName 
                                            ? `${breederInfo.personalName} (${breederInfo.breederName})` 
                                            : (breederInfo.showBreederName && breederInfo.breederName 
                                                ? breederInfo.breederName 
                                                : breederInfo.personalName || 'Anonymous Breeder')}
                                    </button>
                                ) : (
                                    <span className="font-mono text-accent">{animal.breederId_public}</span>
                                )}
                            </p>
                        </div>
                    )}

                    {/* Parents */}
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Parents</h3>
                            <button
                                onClick={() => setShowPedigree(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-black text-sm font-semibold rounded-lg transition"
                            >
                                <FileText size={16} />
                                Pedigree
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ViewOnlyParentCard 
                                parentId={animal.fatherId_public || animal.sireId_public} 
                                parentType="Father"
                                API_BASE_URL={API_BASE_URL}
                                onViewAnimal={(parent) => {
                                    if (window.handleViewPublicAnimal) {
                                        window.handleViewPublicAnimal(parent);
                                    }
                                }}
                            />
                            <ViewOnlyParentCard 
                                parentId={animal.motherId_public || animal.damId_public} 
                                parentType="Mother"
                                API_BASE_URL={API_BASE_URL}
                                onViewAnimal={(parent) => {
                                    if (window.handleViewPublicAnimal) {
                                        window.handleViewPublicAnimal(parent);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Offspring */}
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
                
                // Fetch offspring - use different endpoints based on authentication
                const offspringEndpoint = authToken 
                    ? `${API_BASE_URL}/animals/${animalId}/offspring`  // Authenticated: private endpoint
                    : `${API_BASE_URL}/public/animal/${animalId}/offspring`;  // Unauthenticated: public endpoint
                
                const offspringResponse = await axios.get(offspringEndpoint, { headers });
                
                // Fetch current animal to know which parent we are
                let animal = null;
                try {
                    if (authToken) {
                        // Authenticated: use /animals/any to access owned or related animals
                        const animalResponse = await axios.get(
                            `${API_BASE_URL}/animals/any/${animalId}`,
                            { headers }
                        );
                        animal = animalResponse.data;
                    } else {
                        // Unauthenticated: fetch from public endpoint
                        const publicResponse = await axios.get(
                            `${API_BASE_URL}/public/animal/${animalId}`
                        );
                        animal = publicResponse.data;
                    }
                } catch (err) {
                    console.error('Error fetching current animal:', err);
                    // If public endpoint fails, animal will be null and we'll skip parent display
                }
                
                setCurrentAnimal(animal);
                setOffspring(offspringResponse.data || []);
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
                                                {animal.isPregnant && <Egg size={12} className="text-black" />}
                                                {animal.isNursing && <Milk size={12} className="text-black" />}
                                            </div>
                                        )}
                                        
                                        {/* Name */}
                                        <div className="w-full text-center px-2 pb-1">
                                            <div className="text-sm font-semibold text-gray-800 truncate">
                                                {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}
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
const LitterManagement = ({ authToken, API_BASE_URL, userProfile, showModalMessage, onViewAnimal }) => {
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
        maleCount: 0,
        femaleCount: 0,
        notes: '',
        linkedOffspringIds: []
    });
    const [linkingAnimals, setLinkingAnimals] = useState(false);
    const [availableToLink, setAvailableToLink] = useState({ litter: null, animals: [] });
    const [expandedLitter, setExpandedLitter] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [addingOffspring, setAddingOffspring] = useState(null);
    const [newOffspringData, setNewOffspringData] = useState({
        name: '',
        gender: '',
        color: '',
        coat: '',
        remarks: ''
    });

    useEffect(() => {
        fetchLitters();
        fetchMyAnimals();
    }, []);

    const fetchLitters = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/litters`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const littersData = response.data || [];
            
            // Recalculate COI for each litter
            for (const litter of littersData) {
                try {
                    const coiResponse = await axios.get(`${API_BASE_URL}/inbreeding/pairing`, {
                        params: {
                            sireId: litter.sireId_public,
                            damId: litter.damId_public,
                            generations: 50
                        },
                        headers: { Authorization: `Bearer ${authToken}` }
                    });

                    if (coiResponse.data.inbreedingCoefficient != null) {
                        // Always set the COI value from the calculation
                        litter.inbreedingCoefficient = coiResponse.data.inbreedingCoefficient;
                        
                        // Update database if needed
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
            
            setLitters(littersData);
        } catch (error) {
            console.error('Error fetching litters:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyAnimals = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const animalsData = response.data || [];
            
            // Recalculate COI for animals with parents
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
                    // Animals with no parents have 0% COI by definition
                    animal.inbreedingCoefficient = 0;
                    console.log(`[fetchMyAnimals] Set COI to 0 for animal ${animal.id_public} (no parents)`);
                }
            }
            
            console.log('[fetchMyAnimals] Final animals data:', animalsData.map(a => ({ id: a.id_public, coi: a.inbreedingCoefficient })));
            setMyAnimals(animalsData);
        } catch (error) {
            console.error('Error fetching animals:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.sireId_public || !formData.damId_public) {
            showModalMessage('Error', 'Please select both parents');
            return;
        }

        if (!formData.birthDate) {
            showModalMessage('Error', 'Birth date is required');
            return;
        }

        const totalNewOffspring = parseInt(formData.maleCount) + parseInt(formData.femaleCount);
        const totalLinkedOffspring = formData.linkedOffspringIds?.length || 0;
        
        // Allow litter creation with either counts for tracking OR linked animals
        if (totalNewOffspring === 0 && totalLinkedOffspring === 0) {
            showModalMessage('Error', 'Please specify offspring counts for tracking and/or link existing animals');
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

            // Create litter with offspring counts for tracking
            const totalCount = parseInt(formData.maleCount) + parseInt(formData.femaleCount);
            const litterPayload = {
                breedingPairCodeName: formData.breedingPairCodeName || null,
                sireId_public: formData.sireId_public,
                damId_public: formData.damId_public,
                pairingDate: formData.pairingDate || null,
                birthDate: formData.birthDate,
                numberBorn: totalCount, // Track total count
                maleCount: parseInt(formData.maleCount) || 0,
                femaleCount: parseInt(formData.femaleCount) || 0,
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

            // Create offspring animals
            // NOTE: Animals are NO LONGER automatically created from male/female counts.
            // Those counts are for tracking purposes only.
            // Only linked existing animals will be associated with this litter.
            const offspringPromises = [];
            
            // If user wants to create placeholder animals, they can do so via the "Add Offspring" feature after creation
            
            const createdAnimals = await Promise.all(offspringPromises);

            // Extract the IDs from created animals
            const newOffspringIds = createdAnimals.map(response => response.data.id_public);
            
            // Use linked offspring IDs only
            const allOffspringIds = [...(formData.linkedOffspringIds || [])];
            
            // Update litter with linked offspring
            await axios.put(`${API_BASE_URL}/litters/${litterId}`, {
                offspringIds_public: allOffspringIds
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            const linkedCount = formData.linkedOffspringIds?.length || 0;
            const trackingCount = parseInt(formData.maleCount) + parseInt(formData.femaleCount);
            let successMsg = 'Litter created successfully!';
            if (linkedCount > 0 && trackingCount > 0) {
                successMsg = `Litter created with ${linkedCount} linked animal(s) and ${trackingCount} tracked offspring!`;
            } else if (linkedCount > 0) {
                successMsg = `Litter created with ${linkedCount} linked animal(s)!`;
            } else if (trackingCount > 0) {
                successMsg = `Litter created with ${trackingCount} tracked offspring (counts only)!`;
            }
            showModalMessage('Success', successMsg);
            setShowAddForm(false);
            setFormData({
                breedingPairCodeName: '',
                sireId_public: '',
                damId_public: '',
                pairingDate: '',
                birthDate: '',
                maleCount: 0,
                femaleCount: 0,
                notes: '',
                linkedOffspringIds: []
            });
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
            showModalMessage('Error', error.response?.data?.message || 'Failed to delete litter');
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

    const maleAnimals = myAnimals.filter(a => a.gender === 'Male');
    const femaleAnimals = myAnimals.filter(a => a.gender === 'Female');

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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <BookOpen size={24} className="mr-3 text-primary-dark" />
                    Litter Management
                </h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                    {showAddForm ? <X size={20} /> : <Plus size={20} />}
                    {showAddForm ? 'Cancel' : 'New Litter'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6 border-2 border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Litter</h3>
                    
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sire (Father) <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.sireId_public}
                                onChange={(e) => setFormData({...formData, sireId_public: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            >
                                <option value="">Select Sire</option>
                                {maleAnimals.map(animal => (
                                    <option key={animal.id_public} value={animal.id_public}>
                                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name} - {animal.id_public} ({animal.species})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dam Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dam (Mother) <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.damId_public}
                                onChange={(e) => setFormData({...formData, damId_public: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            >
                                <option value="">Select Dam</option>
                                {femaleAnimals.map(animal => (
                                    <option key={animal.id_public} value={animal.id_public}>
                                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name} - {animal.id_public} ({animal.species})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Birth Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Birth Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Male Count */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Males (for tracking)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.maleCount}
                                onChange={(e) => setFormData({...formData, maleCount: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Female Count */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Females (for tracking)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.femaleCount}
                                onChange={(e) => setFormData({...formData, femaleCount: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Link Existing Offspring */}
                    <div className="mb-4 border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link Existing Animals as Offspring (Optional)
                        </label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-3">
                                Select animals with matching parents and birth date to link them to this litter instead of creating new offspring.
                            </p>
                            {formData.sireId_public && formData.damId_public && formData.birthDate ? (
                                <div className="space-y-2">
                                    {myAnimals
                                        .filter(animal => {
                                            const matchesSire = animal.fatherId_public === formData.sireId_public || animal.sireId_public === formData.sireId_public;
                                            const matchesDam = animal.motherId_public === formData.damId_public || animal.damId_public === formData.damId_public;
                                            const matchesBirthDate = animal.birthDate && new Date(animal.birthDate).toDateString() === new Date(formData.birthDate).toDateString();
                                            return matchesSire && matchesDam && matchesBirthDate;
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
                                                        setFormData({...formData, linkedOffspringIds: newLinked});
                                                    }}
                                                    className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                                />
                                                <span className="text-sm text-gray-800">
                                                    {animal.prefix && `${animal.prefix} `}{animal.name} - {animal.id_public} ({animal.gender})
                                                </span>
                                            </label>
                                        ))
                                    }
                                    {myAnimals.filter(animal => {
                                        const matchesSire = animal.fatherId_public === formData.sireId_public || animal.sireId_public === formData.sireId_public;
                                        const matchesDam = animal.motherId_public === formData.damId_public || animal.damId_public === formData.damId_public;
                                        const matchesBirthDate = animal.birthDate && new Date(animal.birthDate).toDateString() === new Date(formData.birthDate).toDateString();
                                        return matchesSire && matchesDam && matchesBirthDate;
                                    }).length === 0 && (
                                        <p className="text-xs text-gray-500 italic">No matching animals found</p>
                                    )}
                                    {formData.linkedOffspringIds?.length > 0 && (
                                        <p className="text-xs text-green-600 font-semibold mt-2">
                                            {formData.linkedOffspringIds.length} animal(s) selected
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 italic">
                                    Select parents and birth date first to see matching animals
                                </p>
                            )}
                        </div>
                    </div>

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

                    <div className="bg-primary/20 border border-primary rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-800">
                            <strong>Note:</strong> Male/female counts are for tracking purposes only and will NOT automatically create animal records. 
                            Use "Link Existing Animals" above to associate already-created animals with this litter, or add offspring manually after creation.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3 px-4 rounded-lg"
                    >
                        Create Litter
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
                        <div className="flex gap-2 items-center flex-wrap pt-2 border-t border-gray-200">
                            <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Species:</span>
                            {['All', ...DEFAULT_SPECIES_OPTIONS].map(species => {
                                const value = species === 'All' ? '' : species;
                                const isCurrentSelected = speciesFilter === value;
                                const displayName = species === 'All' ? 'All' : getSpeciesDisplayName(species);
                                
                                return (
                                    <button key={species} onClick={() => setSpeciesFilter(value)}
                                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm ${ 
                                            isCurrentSelected ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {displayName}
                                    </button>
                                );
                            })}
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
                                            <span className="text-gray-600">Sire:</span> {sire ? `${sire.prefix ? sire.prefix + ' ' : ''}${sire.name}` : `${litter.sireId_public}`}
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-600">Dam:</span> {dam ? `${dam.prefix ? dam.prefix + ' ' : ''}${dam.name}` : `${litter.damId_public}`}
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
                                                                    {sire.prefix ? `${sire.prefix} ` : ''}{sire.name}
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
                                                                    {dam.prefix ? `${dam.prefix} ` : ''}{dam.name}
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
                                                <h4 className="text-sm font-bold text-gray-700 mb-2">Offspring ({offspringList.length})</h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                    {offspringList.map(animal => (
                                                        <div
                                                            key={animal.id_public}
                                                            onClick={() => onViewAnimal(animal)}
                                                            className="relative bg-white rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border border-gray-300 pt-2"
                                                        >
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
                                                                {animal.isPregnant && <Egg size={12} className="text-black" />}
                                                                {animal.isNursing && <Milk size={12} className="text-black" />}
                                                            </div>
                                                            
                                                            {/* Name */}
                                                            <div className="w-full text-center px-2 pb-1">
                                                                <div className="text-sm font-semibold text-gray-800 truncate">
                                                                    {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}
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
                                                    {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}
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
                { name: trimmedName, category: selectedCategory },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            // Add to local state
            setSpeciesOptions(prev => [...prev, response.data.species]);
            setNewSpeciesName('');
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

            <form onSubmit={handleAddSpecies} className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-3">
                <div className="flex space-x-3">
                    <input
                        type="text"
                        placeholder="Enter new species name..."
                        value={newSpeciesName}
                        onChange={(e) => setNewSpeciesName(e.target.value)}
                        required
                        disabled={loading}
                        className="flex-grow p-2 border border-gray-300 rounded-lg"
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        disabled={loading}
                        className="p-2 border border-gray-300 rounded-lg"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} className="mr-2" />}
                        {loading ? 'Adding...' : 'Add'}
                    </button>
                </div>
                <p className="text-xs text-gray-500">💡 Species you add will be available to all users globally!</p>
            </form>

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
                    className="p-2 border border-gray-300 rounded-lg"
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
                            className="p-6 border-2 border-primary-dark text-lg font-semibold text-gray-800 rounded-lg hover:bg-primary/50 transition duration-150 shadow-md bg-primary relative"
                        >
                            {species.name}
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
const AnimalImageUpload = ({ imageUrl, onFileChange, disabled = false }) => (
    <div className="flex items-center space-x-4">
        <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border">
            <AnimalImage src={imageUrl} alt="Animal" className="w-full h-full object-cover" iconSize={36} />
        </div>
        <div className="flex-1">
            <label className={`inline-flex items-center px-4 py-2 bg-primary text-black rounded-md cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}>
                Change Photo
                <input type="file" accept="image/*" onChange={onFileChange} disabled={disabled} className="hidden" />
            </label>
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
        if (blob.size <= maxBytes) return blob;
        quality -= qualityStep;
    }

    // Second pass: gradually reduce dimensions and retry quality sweep
    while (Math.max(targetW, targetH) > minDimension) {
        targetW = Math.max(Math.round(targetW * 0.8), minDimension);
        targetH = Math.max(Math.round(targetH * 0.8), minDimension);
        quality = startQuality;
        while (quality >= minQuality) {
            const blob = await tryCompress(targetW, targetH, quality);
            if (!blob) break;
            if (blob.size <= maxBytes) return blob;
            quality -= qualityStep;
        }
    }

    // As a last resort, return the smallest we could create (use minQuality and minDimension)
    const finalBlob = await tryCompress(minDimension, minDimension, minQuality);
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
    PlusCircle, ArrowLeft, Save, Trash2,
    GENDER_OPTIONS, STATUS_OPTIONS,
    AnimalImageUpload // Assuming this component is defined elsewhere
}) => {
    
    // Initial state setup (using the passed props for options)
    const [formData, setFormData] = useState(
        animalToEdit ? {
            species: animalToEdit.species,
            breederyId: animalToEdit.breederyId || animalToEdit.registryCode || '',
            prefix: animalToEdit.prefix || '',
            name: animalToEdit.name || '',
            gender: animalToEdit.gender || GENDER_OPTIONS[0],
            birthDate: animalToEdit.birthDate ? new Date(animalToEdit.birthDate).toISOString().substring(0, 10) : '',
            status: animalToEdit.status || 'Pet',
            color: animalToEdit.color || '',
            coat: animalToEdit.coat || '',
			earset: animalToEdit.earset || '', 
            remarks: animalToEdit.remarks || '',
            geneticCode: animalToEdit.geneticCode || '',
            fatherId_public: animalToEdit.fatherId_public || null,
            motherId_public: animalToEdit.motherId_public || null,
            breederId_public: animalToEdit.breederId_public || null,
            ownerName: animalToEdit.ownerName || '',
            isPregnant: animalToEdit.isPregnant || false,
            isNursing: animalToEdit.isNursing || false,
            isOwned: animalToEdit.isOwned ?? true,
            isDisplay: animalToEdit.isDisplay ?? false,
        } : {
            species: species, 
            breederyId: '',
            prefix: '',
            name: '',
            gender: GENDER_OPTIONS[0],
            birthDate: '', 
            status: 'Pet',
            color: '',
            coat: '',
			earset: '', 
            remarks: '',
            geneticCode: '',
            fatherId_public: null,
            motherId_public: null,
            breederId_public: null,
            ownerName: '',
            isPregnant: false,
            isNursing: false,
            isOwned: true,
            isDisplay: false,
        }
    );
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
                return { id_public: a.id_public, prefix: a.prefix || '', name: a.name || '', backendId: a._id || a.id_backend || null };
            }
        } catch (err) {
            // ignore and try global
        }

        try {
            const globalResp = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(idPublic)}`);
            if (Array.isArray(globalResp.data) && globalResp.data.length > 0) {
                const a = globalResp.data[0];
                return { id_public: a.id_public, prefix: a.prefix || '', name: a.name || '', backendId: a._id || a.id_backend || null };
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
    const [animalImageFile, setAnimalImageFile] = useState(null);
    const [animalImagePreview, setAnimalImagePreview] = useState(animalToEdit?.imageUrl || animalToEdit?.photoUrl || null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
        const handleSelectPedigree = async (idOrAnimal) => {
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
            
            // Handle parent selection
            const idKey = modalTarget === 'father' ? 'fatherId_public' : 'motherId_public';
            setFormData(prev => ({ ...prev, [idKey]: id }));
        // Update ref immediately so save uses the latest selection even if state update is pending
        if (modalTarget === 'father') {
            pedigreeRef.current.father = id;
        } else {
            pedigreeRef.current.mother = id;
        }

        // If caller passed the whole animal object, use it directly to avoid refetch
        if (idOrAnimal && typeof idOrAnimal === 'object') {
            const a = idOrAnimal;
            const info = { id_public: a.id_public, prefix: a.prefix || '', name: a.name || '', backendId: a._id || a.id_backend || null };
            if (modalTarget === 'father') {
                setFatherInfo(info);
                pedigreeRef.current.fatherBackendId = info.backendId;
            } else {
                setMotherInfo(info);
                pedigreeRef.current.motherBackendId = info.backendId;
            }
        } else if (id) {
            // Fetch a small summary for display (non-blocking for the user)
            try {
                console.debug('Selecting parent id:', id, 'for modalTarget:', modalTarget);
                const info = await fetchAnimalSummary(id);
                console.debug('Fetched parent summary:', info);
                if (modalTarget === 'father') {
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
            if (modalTarget === 'father') setFatherInfo(null);
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

            // Prepare explicit payload to send to the API and log it for debugging
            // Merge in any immediate pedigree selections stored in `pedigreeRef` to avoid race conditions
            const payloadToSave = { ...formData };
            
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
    const requiredGender = modalTarget === 'father' ? 'Male' : 'Female';

    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg">
            {/* --- Parent Search Modal --- */}
            {modalTarget && modalTarget !== 'breeder' && ( 
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
                
                {/* ------------------------------------------- */}
                {/* STATUS & PRIVACY FLAGS */}
                {/* ------------------------------------------- */}
                <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">Status & Privacy Flags</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" name="isOwned" checked={formData.isOwned} onChange={handleChange} 
                                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
                            <span>Currently Owned by me</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" name="isDisplay" checked={formData.isDisplay} onChange={handleChange} 
                                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
                            <span>Public</span>
                        </label>
                        {formData.gender === 'Female' && (
                            <>
                                <label className="flex items-center space-x-2 text-sm text-gray-700">
                                    <input type="checkbox" name="isPregnant" checked={formData.isPregnant} onChange={handleChange} 
                                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
                                    <span>Female is Pregnant 🥚</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm text-gray-700">
                                    <input type="checkbox" name="isNursing" checked={formData.isNursing} onChange={handleChange} 
                                        className="h-4 w-4 bg-primary text-black rounded border-gray-300 focus:ring-primary" />
                                    <span>Female is Nursing 🥛</span>
                                </label>
                            </>
                        )}
                    </div>
                </div>
                {/* ------------------------------------------- */}

                {/* Image Upload Placeholder */}
                <AnimalImageUpload imageUrl={animalImagePreview} onFileChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                        const original = e.target.files[0];
                        try {
                            // Compress to target <=200KB if possible. Prefer a Web Worker-based compressor
                            // (non-blocking) and fall back to the existing main-thread functions when unavailable.
                            let compressedBlob = null;

                            try {
                                compressedBlob = await compressImageWithWorker(original, 200 * 1024, { maxWidth: 1200, maxHeight: 1200, startQuality: 0.85 });
                            } catch (werr) {
                                console.warn('Worker compression failed unexpectedly:', werr);
                                compressedBlob = null;
                            }

                            if (!compressedBlob) {
                                // Worker not available or failed — fallback to main-thread compression
                                try {
                                    compressedBlob = await compressImageToMaxSize(original, 200 * 1024, { maxWidth: 1200, maxHeight: 1200, startQuality: 0.85 });
                                } catch (err) {
                                    console.warn('Compression-to-size failed, falling back to single-pass compress:', err);
                                    compressedBlob = await compressImageFile(original, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
                                }
                            }
                            // If compressImageFile returned the original File/Blob, wrap if needed
                            // Always use JPEG format for compatibility
                            const baseName = original.name.replace(/\.[^/.]+$/, '') || 'image';
                            const compressedFile = new File([compressedBlob], `${baseName}.jpg`, { type: 'image/jpeg' });
                            // Warn if we couldn't reach target size (best-effort)
                            if (compressedBlob.size > 200 * 1024) {
                                showModalMessage('Image Compression', 'Image was compressed but is still larger than 200KB. It will be uploaded but consider using a smaller image.');
                            }
                            setAnimalImageFile(compressedFile);
                            setAnimalImagePreview(URL.createObjectURL(compressedFile));
                        } catch (err) {
                            console.warn('Image compression failed, using original file', err);
                            setAnimalImageFile(original);
                            setAnimalImagePreview(URL.createObjectURL(original));
                        }
                    }
                }} disabled={loading} />

                {/* ------------------------------------------- */}
                {/* PRIMARY INPUT FIELDS (THE MISSING SECTION) */}
                {/* ------------------------------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg">
                    					
					{/* Breedery ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Breedery ID</label>
                        <input type="text" name="breederyId" value={formData.breederyId} onChange={handleChange} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
					{/* Prefix */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prefix</label>
                        <input type="text" name="prefix" value={formData.prefix} onChange={handleChange} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
					{/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name*</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
					{/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Color</label>
                        <input type="text" name="color" value={formData.color} onChange={handleChange} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
					{/* Coat */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Coat</label>
                        <input type="text" name="coat" value={formData.coat} onChange={handleChange} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
                    {/* --- NEW: EARSET ENTRY (CONDITIONAL ON SPECIES === 'Rat') --- */}
                    {formData.species === 'Rat' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Earset</label>
                            <input type="text" name="earset" value={formData.earset} onChange={handleChange} 
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                        </div>
                    )}
                    
                    {/* Genetic Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Genetic Code</label>
                        <input type="text" name="geneticCode" value={formData.geneticCode} onChange={handleChange} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
					{/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender*</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" >
                            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
					
					 {/* Birthdate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Birthdate*</label>
                        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
					{/* Deceased Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deceased Date</label>
                        <input type="date" name="deceasedDate" value={formData.deceasedDate || ''} onChange={handleChange} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
					{/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status*</label>
                        <select name="status" value={formData.status} onChange={handleChange} required 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                {/* ------------------------------------------- */}

                {/* ------------------------------------------- */}
                {/* Pedigree Section */}
                {/* ------------------------------------------- */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Pedigree: Sire and Dam 🌳</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    </div>
                </div>
                {/* ------------------------------------------- */}

                {/* ------------------------------------------- */}
                {/* Breeder & Owner Section */}
                {/* ------------------------------------------- */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Breeder & Owner</h3>
                    <div className="space-y-4">
                        <div className='flex flex-col'>
                            <label className='text-sm font-medium text-gray-600 mb-1'>Breeder</label>
                            <div 
                                onClick={() => !loading && setModalTarget('breeder')}
                                className="flex flex-col items-start p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-primary transition disabled:opacity-50"
                            >
                                <div className="flex items-center space-x-2 w-full">
                                    {formData.breederId_public && breederInfo ? (
                                        <span className="text-gray-800">
                                            {breederInfo.showBreederName && breederInfo.personalName && breederInfo.breederName 
                                                ? `${breederInfo.personalName} (${breederInfo.breederName})` 
                                                : (breederInfo.showBreederName && breederInfo.breederName 
                                                    ? breederInfo.breederName 
                                                    : breederInfo.personalName || 'Anonymous Breeder')}
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
                        <div className='flex flex-col'>
                            <label className='text-sm font-medium text-gray-600 mb-1'>Owner Name</label>
                            <input 
                                type="text" 
                                name="ownerName" 
                                value={formData.ownerName} 
                                onChange={handleChange}
                                placeholder="Leave empty to not display"
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                            />
                            <p className="text-xs text-gray-500 mt-1">This field is only shown in your private view, not on public profiles.</p>
                        </div>
                    </div>
                </div>
                {/* ------------------------------------------- */}
                
                {/* Remarks */}
                <div className='mt-4'>
                    <label className="block text-sm font-medium text-gray-700">Remarks / Notes</label>
                    <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="3"
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                </div>
                
                {/* Submit/Delete Buttons */}
                <div className="mt-8 flex justify-between items-center border-t pt-4">
                    <div className="flex space-x-4">
                        <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2">
                            <ArrowLeft size={18} />
                            <span>Back to Profile</span>
                        </button>
                            <button
                                type="submit"
                                disabled={loading}
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
                        <button type="button" onClick={() => { if(window.confirm(`Are you sure you want to delete ${animalToEdit.name}? This action cannot be undone.`)) { onDelete(animalToEdit.id_public); } }} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2" > 
                            <Trash2 size={18} /> 
                            <span>Delete</span> 
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

const UserProfileCard = ({ userProfile }) => {
    if (!userProfile) return null;

    const formattedCreationDate = userProfile.creationDate
        ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(userProfile.creationDate))
        : 'N/A';
    
    const ProfileImage = () => {
        const img = userProfile.profileImage || userProfile.profileImageUrl || userProfile.imageUrl || userProfile.avatarUrl || userProfile.avatar || userProfile.profile_image || null;
        if (img) {
            return (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden shadow-inner">
                    <img src={img} alt={userProfile.personalName} className="w-full h-full object-cover" />
                </div>
            );
        }

        return (
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden shadow-inner">
                <User size={40} />
            </div>
        );
    };

    const isPersonalNameVisible = userProfile.showPersonalName ?? true;
    const isBreederNameVisible = userProfile.showBreederName ?? false;


    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg mb-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <ProfileImage />

            <div className="flex-grow text-center sm:text-left">
                
                {isPersonalNameVisible && (
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        {userProfile.personalName}
                    </h3>
                )}
                
                {(isBreederNameVisible && userProfile.breederName) && (
                    <div className="text-xl text-gray-700 font-semibold">
                        {userProfile.breederName}
                    </div>
                )}

                {(!isPersonalNameVisible && !isBreederNameVisible) && (
                    <h3 className="text-2xl font-bold text-gray-500 mb-2">
                        (Name Hidden)
                    </h3>
                )}

                <div className="mt-4 space-y-1 text-sm text-gray-700">
                    {((userProfile.showEmailPublic ?? false)) && (
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <Mail size={16} className="text-gray-500" />
                            <a href={`mailto:${userProfile.email}`} className="text-gray-700 hover:text-primary transition duration-150">
                                {userProfile.email}
                            </a>
                        </div>
                    )}
                    
                    {(userProfile.websiteURL && userProfile.showWebsiteURL) && (
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <Globe size={16} className="text-gray-500" />
                            <a 
                                href={userProfile.websiteURL} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-primary-dark hover:underline transition duration-150 truncate max-w-full sm:max-w-xs"
                            >
                                {userProfile.websiteURL.replace(/https?:\/\/(www.)?/, '')}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full sm:w-auto sm:text-right space-y-2 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-200 sm:pl-6">
                
                    <div className="mb-2"> 
                    <span className="text-2xl font-extrabold text-accent">
                        {userProfile.id_public}
                    </span>
                </div>

                <div className="text-sm text-gray-600">
                    <span className="font-semibold">Member Since:</span> {formattedCreationDate}
                </div>
            </div>
        </div>
    );
};

const ProfileEditForm = ({ userProfile, showModalMessage, onSaveSuccess, onCancel, authToken }) => {
    const [personalName, setPersonalName] = useState(userProfile.personalName);
    const [breederName, setBreederName] = useState(userProfile.breederName || '');
    const [showPersonalName, setShowPersonalName] = useState(userProfile.showPersonalName ?? true); 
    const [showBreederName, setShowBreederName] = useState(userProfile.showBreederName ?? false); 
    const [websiteURL, setWebsiteURL] = useState(userProfile.websiteURL || '');
    const [showWebsiteURL, setShowWebsiteURL] = useState(userProfile.showWebsiteURL ?? false);
    const [showEmailPublic, setShowEmailPublic] = useState(userProfile.showEmailPublic ?? false); 
    const [showGeneticCodePublic, setShowGeneticCodePublic] = useState(userProfile.showGeneticCodePublic ?? false);
    const [showRemarksPublic, setShowRemarksPublic] = useState(userProfile.showRemarksPublic ?? false); 

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
        };
        
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
            
            <form onSubmit={handleProfileUpdate} className="space-y-6 mb-8 p-6 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Public Profile Information</h3>
                
                <ProfileImagePlaceholder 
                    url={profileImageURL} 
                    onFileChange={handleImageChange} 
                    disabled={profileLoading} 
                />

                <div className="space-y-4">
                    <input type="text" name="personalName" placeholder="Personal Name *" value={personalName} onChange={(e) => setPersonalName(e.target.value)} required 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" disabled={profileLoading} />
                    <input type="text" name="breederName" placeholder="Breeder Name (Optional)" value={breederName} onChange={(e) => setBreederName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" disabled={profileLoading} />
                    <input type="url" name="websiteURL" placeholder="Website URL (Optional) e.g., https://example.com" value={websiteURL} onChange={(e) => setWebsiteURL(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" disabled={profileLoading} />

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
                        <h4 className="text-base font-medium text-gray-800">Animal Privacy Settings:</h4>
                        
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" checked={showGeneticCodePublic} onChange={(e) => setShowGeneticCodePublic(e.target.checked)} 
                                className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                            <span>Show **Genetic Code** on public animal views</span>
                        </label>
                        
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" checked={showRemarksPublic} onChange={(e) => setShowRemarksPublic(e.target.checked)} 
                                className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                            <span>Show **Remarks/Notes** on public animal views</span>
                        </label>
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
            
            <form onSubmit={handleEmailUpdate} className="space-y-4 mb-8 p-6 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Change Email Address</h3>
                <input type="email" placeholder="New Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" disabled={securityLoading} />
                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={securityLoading} 
                        className="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {securityLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Mail size={20} className="mr-2" />}
                        Update Email
                    </button>
                </div>
            </form>

            <form onSubmit={handlePasswordUpdate} className="space-y-4 p-6 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Change Password</h3>
                <input type="password" placeholder="Current Password *" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" disabled={passwordLoading} />
                <input type="password" placeholder="New Password *" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" disabled={passwordLoading} />
                <input type="password" placeholder="Confirm New Password *" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" disabled={passwordLoading} />
                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={passwordLoading}
                        className="bg-primary-dark hover:bg-primary text-black font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {passwordLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                        Set New Password
                    </button>
                </div>
            </form>
            
            <div className="mt-8 p-6 border-2 border-red-300 rounded-lg bg-red-50">
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

const ProfileView = ({ userProfile, showModalMessage, fetchUserProfile, authToken, onProfileUpdated }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleShare = () => {
        const url = `${window.location.origin}/user/${userProfile.id_public}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
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
            <div className="space-y-4">
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-700 mb-2">Public Visibility Status</p>
                    
                    <div className="flex justify-between items-center py-1">
                        <span className="text-base text-gray-800">Personal Name ({userProfile.personalName})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ 
                            (userProfile.showPersonalName ?? true) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showPersonalName ?? true) ? 'Public' : 'Private'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                        <span className="text-base text-gray-800">Breeder Name ({userProfile.breederName || 'N/A'})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ 
                            (userProfile.showBreederName ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showBreederName ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                        <span className="text-base text-gray-800">Website URL ({userProfile.websiteURL || 'N/A'})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ 
                            (userProfile.showWebsiteURL ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showWebsiteURL ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-1">
                        <span className="text-base text-gray-800">Email Address ({userProfile.email})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ 
                            (userProfile.showEmailPublic ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showEmailPublic ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-1">
                        <span className="text-base text-gray-800">Genetic Code on Public Animals</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ 
                            (userProfile.showGeneticCodePublic ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showGeneticCodePublic ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-1">
                        <span className="text-base text-gray-800">Remarks/Notes on Public Animals</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ 
                            (userProfile.showRemarksPublic ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showRemarksPublic ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-700">Personal ID:</p>
                    <p className="text-3xl font-extrabold text-accent">{userProfile.id_public}</p>
                </div>
            </div>
            
            <button 
                onClick={() => setIsEditing(true)} 
                className="mt-6 bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 shadow-md flex items-center"
            >
                <Edit size={20} className="mr-2" /> Edit Profile
            </button>
        </div>
    );
};

const AuthView = ({ onLoginSuccess, showModalMessage, isRegister, setIsRegister, mainTitle, onShowTerms, onShowPrivacy }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [personalName, setPersonalName] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationStep, setVerificationStep] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (isRegister && !verificationStep) {
            // Step 1: Request verification code
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
                    {parentData.isPregnant && <Egg size={12} className="text-black" />}
                    {parentData.isNursing && <Milk size={12} className="text-black" />}
                </div>

                {/* Name */}
                <div className="text-center mb-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                        {parentData.prefix ? `${parentData.prefix} ` : ''}{parentData.name}
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

const AnimalList = ({ authToken, showModalMessage, onEditAnimal, onViewAnimal, onSetCurrentView }) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    // Manual search: `searchInput` is the controlled input, `appliedNameFilter` is sent to the API
    const [searchInput, setSearchInput] = useState('');
    const [appliedNameFilter, setAppliedNameFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [statusFilterPregnant, setStatusFilterPregnant] = useState(false);
    const [statusFilterNursing, setStatusFilterNursing] = useState(false);
    const [ownedFilter, setOwnedFilter] = useState('owned');
    
    const fetchAnimals = useCallback(async () => {
        setLoading(true);
        try {
            let params = [];
            if (statusFilter) {
                params.push(`status=${statusFilter}`);
            }
            if (genderFilter) {
                params.push(`gender=${genderFilter}`);
            }
            if (speciesFilter) {
                params.push(`species=${encodeURIComponent(speciesFilter)}`);
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
            if (ownedFilter === 'owned') {
                params.push(`isOwned=true`);
            }
            const queryString = params.length > 0 ? `?${params.join('&')}` : '';
            const url = `${API_BASE_URL}/animals${queryString}`;

            const response = await axios.get(url, { headers: { Authorization: `Bearer ${authToken}` } });
            let data = response.data || [];
            // Client-side fallback filtering in case the API doesn't apply the `name` filter reliably
            if (appliedNameFilter) {
                const term = appliedNameFilter.toLowerCase();
                data = data.filter(a => {
                    const name = (a.name || '').toString().toLowerCase();
                    const registry = (a.breederyId || a.registryCode || '').toString().toLowerCase();
                    const idPublic = (a.id_public || '').toString().toLowerCase();
                    return name.includes(term) || registry.includes(term) || idPublic.includes(term.replace(/^ct-?/,'').toLowerCase());
                });
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
    }, [authToken, statusFilter, genderFilter, speciesFilter, appliedNameFilter, statusFilterPregnant, statusFilterNursing, ownedFilter, showModalMessage]);

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
    const handleGenderFilterChange = (gender) => setGenderFilter(gender);
    const handleFilterPregnant = () => { setStatusFilterPregnant(prev => !prev); setStatusFilterNursing(false); };
    const handleFilterNursing = () => { setStatusFilterNursing(prev => !prev); setStatusFilterPregnant(false); };
    
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

    const AnimalCard = ({ animal, onEditAnimal }) => {
        const birth = animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : '';
        const imgSrc = animal.imageUrl || animal.photoUrl || null;

        return (
            <div className="w-full flex justify-center">
                <div
                    onClick={() => onViewAnimal(animal)}
                    className="relative bg-white rounded-xl shadow-sm w-44 h-56 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border border-gray-300 pt-3"
                >
                    {/* Birthdate top-left */}
                    {birth && (
                        <div className="absolute top-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-0.5 rounded">
                            {birth}
                        </div>
                    )}

                    {/* Gender badge top-right */}
                    {animal.gender && (
                        <div className={`absolute top-2 right-2`} title={animal.gender}>
                            {animal.gender === 'Male' ? <Mars size={16} strokeWidth={2.5} className="text-primary" /> : <Venus size={16} strokeWidth={2.5} className="text-accent" />}
                        </div>
                    )}

                    {/* Centered profile image */}
                    <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                        {imgSrc ? (
                            <img src={imgSrc} alt={animal.name} className="w-24 h-24 object-cover rounded-md" />
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
                        {animal.isPregnant && <Egg size={14} className="text-black" />}
                        {animal.isNursing && <Milk size={14} className="text-black" />}
                    </div>
                    
                    {/* Prefix / Name under image */}
                    <div className="w-full text-center px-2 pb-1">
                        <div className="text-sm font-semibold text-gray-800 truncate">{animal.prefix ? `${animal.prefix} ` : ''}{animal.name}</div>
                    </div>

                    {/* Edit is available when viewing full card; remove inline edit icon from dashboard cards */}

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
    };

    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                <div className='flex items-center'>
                    <ClipboardList size={24} className="mr-3 text-primary-dark" />
                    My Animals ({animals.length})
                </div>
                <button 
                    onClick={handleRefresh} 
                    disabled={loading}
                    className="text-gray-600 hover:text-primary transition disabled:opacity-50 flex items-center"
                    title="Refresh List"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                </button>
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
                            onClick={() => onSetCurrentView('select-species')} 
                            className="flex-1 sm:flex-none bg-accent hover:bg-accent/90 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center justify-center space-x-1 whitespace-nowrap"
                        >
                            <PlusCircle size={18} /> <span>Add Animal</span>
                        </button>
                    </div>
                </div>

                {/* Status filter and Gender buttons - Stack on mobile */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200">
                    <select value={statusFilter} onChange={handleStatusFilterChange} 
                        className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-full sm:w-1/3 sm:min-w-[150px]"
                    >
                        <option value="">All</option>
                        {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    
                    <div className="flex gap-2 items-center">
                        <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Gender:</span>
                        {['All', ...GENDER_OPTIONS].map(gender => {
                            const value = gender === 'All' ? '' : gender;
                            const isCurrentSelected = genderFilter === value;
                            let selectedClasses = isCurrentSelected ? (gender === 'Male' ? 'bg-primary text-black' : gender === 'Female' ? 'bg-accent text-white' : 'bg-primary-dark text-black') : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
                            
                            return (
                                <button key={gender} onClick={() => handleGenderFilterChange(value)}
                                    className={`flex-1 px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm ${selectedClasses}`}
                                >
                                    {gender}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                {/* Species filter */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200">
                    <div className="flex gap-2 items-center flex-wrap">
                        <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Species:</span>
                        {['All', ...DEFAULT_SPECIES_OPTIONS].map(species => {
                            const value = species === 'All' ? '' : species;
                            const isCurrentSelected = speciesFilter === value;
                            const displayName = species === 'All' ? 'All' : getSpeciesDisplayName(species);
                            
                            return (
                                <button key={species} onClick={() => setSpeciesFilter(value)}
                                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm ${ 
                                        isCurrentSelected ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {displayName}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                {/* Additional filters - Already wrapping */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
                    <span className='text-sm font-medium text-gray-700 whitespace-nowrap'>Filter By:</span>
                    
                    {['Owned', 'All'].map(option => {
                        const value = option.toLowerCase();
                        const isSelected = ownedFilter === value;
                        return (
                            <button key={value} onClick={() => setOwnedFilter(value)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm ${ 
                                    isSelected ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {option}
                            </button>
                        );
                    })}

                    <button onClick={handleFilterPregnant}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center space-x-1 ${ 
                            statusFilterPregnant ? 'bg-accent text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        <Egg size={16} /> <span>Pregnant</span>
                    </button>
                    <button onClick={handleFilterNursing}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center space-x-1 ${ 
                            statusFilterNursing ? 'bg-accent text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        <Milk size={16} /> <span>Nursing</span>
                    </button>
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
                    {speciesNames.map(species => (
                        <div key={species} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <h3 className="text-lg font-bold bg-gray-100 p-4 border-b text-gray-700">
                                {getSpeciesDisplayName(species)} ({groupedAnimals[species].length})
                            </h3>
                            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {groupedAnimals[species].map(animal => (
                                    <AnimalCard key={animal.id_public} animal={animal} onEditAnimal={onEditAnimal} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Notification Panel Component
const NotificationPanel = ({ authToken, API_BASE_URL, onClose, showModalMessage, onNotificationChange }) => {
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
            setNotifications(response.data || []);
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
                                                <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
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
                                                    <X size={14} />
                                                    <span>Delete</span>
                                                </button>
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
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
    const [userProfile, setUserProfile] = useState(null);
    const [currentView, setCurrentView] = useState('list'); 
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

    const [showUserSearchModal, setShowUserSearchModal] = useState(false);
    const [viewingPublicProfile, setViewingPublicProfile] = useState(null);
    const [viewingPublicAnimal, setViewingPublicAnimal] = useState(null);
    const [viewAnimalBreederInfo, setViewAnimalBreederInfo] = useState(null);
    const [animalToView, setAnimalToView] = useState(null);
    const [showPedigreeChart, setShowPedigreeChart] = useState(false);
    const [copySuccessAnimal, setCopySuccessAnimal] = useState(false);
    
    const [showBugReportModal, setShowBugReportModal] = useState(false);
    const [bugReportCategory, setBugReportCategory] = useState('Bug');
    const [bugReportDescription, setBugReportDescription] = useState('');
    const [bugReportSubmitting, setBugReportSubmitting] = useState(false);
    
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    const timeoutRef = useRef(null);
    const activeEvents = ['mousemove', 'keydown', 'scroll', 'click'];

    const showModalMessage = useCallback((title, message) => {
        setModalMessage({ title, message });
        setShowModal(true);
    }, []);

    const handleLogout = useCallback((expired = false) => {
        setAuthToken(null);
        setUserProfile(null);
        setCurrentView('auth');
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


        useEffect(() => {
        if (authToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
            fetchUserProfile(authToken);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('authToken');
            setUserProfile(null);
            setCurrentView('list');
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

    useEffect(() => {
        if (authToken) {
            fetchNotificationCount();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotificationCount, 30000);
            return () => clearInterval(interval);
        }
    }, [authToken, fetchNotificationCount]);
	
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
        setCurrentView('list');
        setIsRegister(false);
    };

    const handleEditAnimal = (animal) => {
        setAnimalToEdit(animal);
        setSpeciesToAdd(animal.species); 
        setCurrentView('edit-animal');
    };

    const handleViewAnimal = async (animal) => {
        console.log('[handleViewAnimal] Viewing animal:', animal);
        
        // Normalize parent field names (backend uses sireId_public/damId_public, frontend uses fatherId_public/motherId_public)
        const normalizedAnimal = {
            ...animal,
            fatherId_public: animal.fatherId_public || animal.sireId_public,
            motherId_public: animal.motherId_public || animal.damId_public
        };
        
        // Always recalculate COI to ensure it reflects current pedigree state
        if (!normalizedAnimal.fatherId_public && !normalizedAnimal.motherId_public) {
            // Animals with no parents have 0% COI by definition
            normalizedAnimal.inbreedingCoefficient = 0;
        } else if (authToken) {
            // Animals with parents - always recalculate COI from current pedigree
            try {
                const coiResponse = await axios.get(`${API_BASE_URL}/animals/${normalizedAnimal.id_public}/inbreeding`, {
                    params: { generations: 50 },
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                normalizedAnimal.inbreedingCoefficient = coiResponse.data.inbreedingCoefficient;
            } catch (error) {
                console.log(`Could not calculate COI for animal ${normalizedAnimal.id_public}:`, error);
                normalizedAnimal.inbreedingCoefficient = null;
            }
        }
        
        console.log('[handleViewAnimal] Father ID:', normalizedAnimal.fatherId_public, 'Mother ID:', normalizedAnimal.motherId_public);
        setAnimalToView(normalizedAnimal);
        setCurrentView('view-animal');
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
            setCurrentView('list');
            showModalMessage('Success', `Animal with ID ${id_public} has been successfully deleted.`);
        } catch (error) {
            console.error('Failed to delete animal:', error);
            showModalMessage('Error', `Failed to delete animal: ${error.response?.data?.message || error.message}`);
        }
    };

    const renderView = () => {
        switch (currentView) {
            case 'publicProfile':
                return (
                    <PublicProfileView 
                        profile={viewingPublicProfile}
                        onBack={() => { setViewingPublicProfile(null); setCurrentView('list'); }}
                        onViewAnimal={(animal) => setViewingPublicAnimal(animal)}
                        API_BASE_URL={API_BASE_URL}
                    />
                );
            case 'profile':
                return <ProfileView userProfile={userProfile} showModalMessage={showModalMessage} fetchUserProfile={fetchUserProfile} authToken={authToken} onProfileUpdated={setUserProfile} />;
            case 'select-species':
                const speciesList = speciesOptions.join('/');
                const selectorTitle = `Add New ${speciesList}/Custom`;
                return (
                    <SpeciesSelector 
                        speciesOptions={speciesOptions} 
                        onSelectSpecies={(species) => { 
                            setSpeciesToAdd(species); 
                            setCurrentView('add-animal'); 
                        }} 
                        onManageSpecies={() => setCurrentView('manage-species')}
                        searchTerm={speciesSearchTerm}
                        setSearchTerm={setSpeciesSearchTerm}
                        categoryFilter={speciesCategoryFilter}
                        setCategoryFilter={setSpeciesCategoryFilter}
                    />
                );
            case 'manage-species':
                return (
                    <SpeciesManager 
                        speciesOptions={speciesOptions} 
                        setSpeciesOptions={setSpeciesOptions} 
                        onCancel={() => setCurrentView('select-species')}
                        showModalMessage={showModalMessage}
                        authToken={authToken}
                        API_BASE_URL={API_BASE_URL}
                    />
                );
            case 'add-animal':
                // If no species has been selected yet, show the selector first
                if (!speciesToAdd) {
                    return (
                        <SpeciesSelector
                            speciesOptions={speciesOptions}
                            onSelectSpecies={(species) => {
                                setSpeciesToAdd(species);
                                setCurrentView('add-animal');
                            }}
                            onManageSpecies={() => setCurrentView('manage-species')}
                            searchTerm={speciesSearchTerm}
                            setSearchTerm={setSpeciesSearchTerm}
                            categoryFilter={speciesCategoryFilter}
                            setCategoryFilter={setSpeciesCategoryFilter}
                        />
                    );
                }

                // speciesToAdd is set — render the AnimalForm
                const addFormTitle = `Add New ${speciesToAdd}`;
                return (
                    <AnimalForm
                        formTitle={addFormTitle}
                        animalToEdit={null}
                        species={speciesToAdd}
                        onSave={handleSaveAnimal}
                        onCancel={() => { setCurrentView('list'); setSpeciesToAdd(null); }}
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
                        GENDER_OPTIONS={GENDER_OPTIONS}
                        STATUS_OPTIONS={STATUS_OPTIONS}
                        AnimalImageUpload={AnimalImageUpload}
                    />
                );
            case 'edit-animal':
                const editFormTitle = `Edit ${animalToEdit.name}`;
                return (
                    <AnimalForm 
                        formTitle={editFormTitle} 
                        animalToEdit={animalToEdit} 
                        species={animalToEdit.species} 
                        onSave={handleSaveAnimal} 
                        onCancel={() => setCurrentView('list')} 
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
                        GENDER_OPTIONS={GENDER_OPTIONS}
                        STATUS_OPTIONS={STATUS_OPTIONS}
                        AnimalImageUpload={AnimalImageUpload}
                    />
                );
            case 'view-animal':
                if (!animalToView) return null;
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
                    <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-start justify-between mb-6">
                            <button onClick={() => setCurrentView('list')} className="flex items-center text-gray-600 hover:text-gray-800 font-medium">
                                <ArrowLeft size={20} className="mr-2" />
                                Back to Dashboard
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleShareAnimal}
                                    className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-2"
                                >
                                    <Link size={16} />
                                    {copySuccessAnimal ? 'Link Copied!' : 'Share Link'}
                                </button>
                                {/* Only show edit button if user owns this animal */}
                                {userProfile && animalToView.ownerId_public === userProfile.id_public && (
                                    <button onClick={() => { setAnimalToEdit(animalToView); setSpeciesToAdd(animalToView.species); setCurrentView('edit-animal'); }} className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg">Edit</button>
                                )}
                            </div>
                        </div>

                        {/* Main Info Section */}
                        <div className="border-2 border-gray-300 rounded-lg p-4 sm:p-6 mb-6">
                            <div className="flex flex-col sm:flex-row items-start sm:space-x-6 space-y-4 sm:space-y-0">
                                <div className="w-full sm:w-auto flex flex-col items-center sm:items-start">
                                    <div className="w-40 h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                        { (animalToView.imageUrl || animalToView.photoUrl) ? (
                                            <img src={animalToView.imageUrl || animalToView.photoUrl} alt={animalToView.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Cat size={72} className="text-gray-400" />
                                        ) }
                                    </div>
                                    {/* Status bar */}
                                    <div className="w-40 bg-gray-200 py-2 text-center mt-2 rounded border-2 border-gray-400">
                                        <div className="text-sm font-semibold text-gray-800">{animalToView.status || 'Unknown'}</div>
                                    </div>
                                    {/* Icon row */}
                                    <div className="w-40 flex justify-center items-center space-x-3 py-2">
                                        {animalToView.isOwned ? (
                                            <Heart size={18} className="text-black" />
                                        ) : (
                                            <HeartOff size={18} className="text-black" />
                                        )}
                                        {animalToView.showOnPublicProfile ? (
                                            <Eye size={18} className="text-black" />
                                        ) : (
                                            <EyeOff size={18} className="text-black" />
                                        )}
                                        {animalToView.isPregnant && <Egg size={18} className="text-black" />}
                                        {animalToView.isNursing && <Milk size={18} className="text-black" />}
                                    </div>
                                </div>
                                <div className="flex-1 w-full">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{animalToView.prefix ? `${animalToView.prefix} ` : ''}{animalToView.name}</h2>
                                    <p className="text-sm text-gray-600 mb-4">{animalToView.species} &nbsp; • &nbsp; {animalToView.id_public}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                                        <div><strong>Gender:</strong> {animalToView.gender}</div>
                                        <div><strong>Color:</strong> {animalToView.color || '—'}</div>
                                        <div><strong>Coat:</strong> {animalToView.coat || '—'}</div>
                                        <div><strong>Breedery ID:</strong> {animalToView.breederyId || animalToView.registryCode || '—'}</div>
                                        <div><strong>Inbreeding COI:</strong> {animalToView.inbreedingCoefficient != null ? `${animalToView.inbreedingCoefficient.toFixed(2)}%` : 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Genetic Code Section */}
                        <div className="border-2 border-gray-300 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Genetic Code</h3>
                            {animalToView.geneticCode ? (
                                <p className="text-gray-700 text-sm font-mono">{animalToView.geneticCode}</p>
                            ) : (
                                <p className="text-gray-500 text-sm italic">No genetic code recorded.</p>
                            )}
                        </div>

                        {/* Breeder & Owner Section */}
                        <div className="border-2 border-gray-300 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Breeder & Owner</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                                <div>
                                    <strong>Breeder:</strong>{' '}
                                    {animalToView.breederId_public ? (
                                        viewAnimalBreederInfo ? (
                                            <span>
                                                {viewAnimalBreederInfo.showBreederName && viewAnimalBreederInfo.personalName && viewAnimalBreederInfo.breederName 
                                                    ? `${viewAnimalBreederInfo.personalName} (${viewAnimalBreederInfo.breederName})` 
                                                    : (viewAnimalBreederInfo.showBreederName && viewAnimalBreederInfo.breederName 
                                                        ? viewAnimalBreederInfo.breederName 
                                                        : viewAnimalBreederInfo.personalName || 'Anonymous Breeder')}
                                            </span>
                                        ) : (
                                            <span className="font-mono text-accent">{animalToView.breederId_public}</span>
                                        )
                                    ) : (
                                        <span className="text-gray-500 italic">Not specified</span>
                                    )}
                                </div>
                                {animalToView.ownerName && (
                                    <div>
                                        <strong>Owner:</strong> {animalToView.ownerName}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Remarks / Notes Section */}
                        <div className="border-2 border-gray-300 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Remarks / Notes</h3>
                            {animalToView.remarks ? (
                                <p className="text-gray-700 text-sm">{animalToView.remarks}</p>
                            ) : (
                                <p className="text-gray-500 text-sm italic">No remarks recorded.</p>
                            )}
                        </div>

                        {/* Parents Section */}
                        <div className="border-2 border-gray-300 rounded-lg p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Parents</h3>
                                <button
                                    onClick={() => setShowPedigreeChart(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-black text-sm font-semibold rounded-lg transition"
                                >
                                    <FileText size={16} />
                                    Pedigree
                                </button>
                            </div>
                            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                                {/* Father Card */}
                                <ParentCard 
                                    parentId={animalToView.fatherId_public} 
                                    parentType="Father"
                                    authToken={authToken}
                                    API_BASE_URL={API_BASE_URL}
                                    onViewAnimal={handleViewAnimal}
                                />
                                {/* Mother Card */}
                                <ParentCard 
                                    parentId={animalToView.motherId_public} 
                                    parentType="Mother"
                                    authToken={authToken}
                                    API_BASE_URL={API_BASE_URL}
                                    onViewAnimal={handleViewAnimal}
                                />
                            </div>
                        </div>

                        {/* Offspring Section */}
                        <OffspringSection
                            animalId={animalToView.id_public}
                            API_BASE_URL={API_BASE_URL}
                            authToken={authToken}
                            onViewAnimal={handleViewAnimal}
                        />
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
            case 'genetics-calculator':
                return (
                    <MouseGeneticsCalculator
                        API_BASE_URL={API_BASE_URL}
                        authToken={authToken}
                    />
                );
            case 'litters':
                return (
                    <LitterManagement
                        authToken={authToken}
                        API_BASE_URL={API_BASE_URL}
                        userProfile={userProfile}
                        showModalMessage={showModalMessage}
                        onViewAnimal={handleViewAnimal}
                    />
                );
            case 'list':
            default:
                return (
                    <AnimalList 
                        authToken={authToken} 
                        showModalMessage={showModalMessage} 
                        onEditAnimal={handleEditAnimal} 
                        onViewAnimal={handleViewAnimal}
                        onSetCurrentView={setCurrentView}
                    />
                );
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
                            >
                                <Search size={18} className="mr-1" /> Search
                            </button>
                            <button 
                                onClick={() => { setViewingPublicProfile(null); setCurrentView('auth'); }}
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
                        onBack={() => { setViewingPublicProfile(null); setCurrentView('auth'); }}
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
                                onClick={() => setCurrentView('genetics-calculator')}
                                className="px-3 py-2 bg-primary text-black font-semibold rounded-lg transition flex items-center"
                            >
                                <Cat size={18} className="mr-1" /> Genetics
                            </button>
                            <button 
                                onClick={() => setCurrentView('auth')}
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
                        >
                            <Search size={18} className="mr-1" /> Search
                        </button>
                        <button 
                            onClick={() => setCurrentView('genetics-calculator')}
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
                
                <div className="flex flex-col items-center mb-4"> 
                    <CustomAppLogo size="w-32 h-32" /> 
                </div>
                <AuthView 
                    onLoginSuccess={handleLoginSuccess} 
                    showModalMessage={showModalMessage} 
                    isRegister={isRegister} 
                    setIsRegister={setIsRegister} 
                    mainTitle={mainTitle}
                    onShowTerms={() => setShowTermsModal(true)}
                    onShowPrivacy={() => setShowPrivacyModal(true)}
                />
                
                {showTermsModal && <TermsOfService onClose={() => setShowTermsModal(false)} />}
                {showPrivacyModal && <PrivacyPolicy onClose={() => setShowPrivacyModal(false)} />}
            </div>
        );
    }

     return (
        <div className="min-h-screen bg-page-bg flex flex-col items-center p-6 font-sans">
            {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
            {showUserSearchModal && (
                <UserSearchModal 
                    onClose={() => setShowUserSearchModal(false)} 
                    showModalMessage={showModalMessage} 
                    API_BASE_URL={API_BASE_URL}
                    onSelectUser={(user) => {
                        setShowUserSearchModal(false);
                        setViewingPublicProfile(user);
                        setCurrentView('publicProfile');
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
            
            <header className="w-full bg-white p-4 rounded-xl shadow-lg mb-6 max-w-4xl">
                {/* Desktop: Single row layout */}
                <div className="hidden md:flex justify-between items-center">
                    <CustomAppLogo size="w-10 h-10" />
                    
                    <nav className="flex space-x-4">
                        <button onClick={() => setCurrentView('list')} className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${currentView === 'list' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <ClipboardList size={18} className="inline mr-1" /> Animals
                        </button>
                        <button onClick={() => setCurrentView('litters')} className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${currentView === 'litters' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <BookOpen size={18} className="inline mr-1" /> Litters
                        </button>
                        <button onClick={() => setCurrentView('genetics-calculator')} className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${currentView === 'genetics-calculator' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <Cat size={18} className="inline mr-1" /> Genetics
                        </button>
                        <button onClick={() => setCurrentView('profile')} className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${currentView === 'profile' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <User size={18} className="inline mr-1" /> Profile
                        </button>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setShowUserSearchModal(true)} 
                            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-3 rounded-lg transition duration-150 shadow-sm"
                            title="Search Users by Name or ID"
                        >
                            <Search size={20} className="mr-1" />
                            <span className="text-sm">Search</span>
                        </button>

                        <button
                            onClick={() => {
                                setShowNotifications(true);
                                fetchNotificationCount();
                            }}
                            className="relative flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-3 rounded-lg transition duration-150 shadow-sm"
                            title="Notifications"
                        >
                            <Bell size={20} />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </button>
                        
                        <button 
                            onClick={() => handleLogout(false)} 
                            title="Log Out"
                            className="bg-accent hover:bg-accent/80 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-1"
                        >
                            <LogOut size={18} />
                            <span className="text-sm">Logout</span>
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
                            >
                                <Search size={18} />
                            </button>

                            <button
                                onClick={() => {
                                    setShowNotifications(true);
                                    fetchNotificationCount();
                                }}
                                className="relative flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition duration-150 shadow-sm"
                                title="Notifications"
                            >
                                <Bell size={18} />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                                        {notificationCount > 9 ? '9+' : notificationCount}
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
                        <button onClick={() => setCurrentView('list')} className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition duration-150 ${currentView === 'list' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <ClipboardList size={16} className="inline mb-0.5" />
                            <span className="block">Animals</span>
                        </button>
                        <button onClick={() => setCurrentView('litters')} className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition duration-150 ${currentView === 'litters' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <BookOpen size={16} className="inline mb-0.5" />
                            <span className="block">Litters</span>
                        </button>
                        <button onClick={() => setCurrentView('genetics-calculator')} className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition duration-150 ${currentView === 'genetics-calculator' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <Cat size={16} className="inline mb-0.5" />
                            <span className="block">Genetics</span>
                        </button>
                        <button onClick={() => setCurrentView('profile')} className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition duration-150 ${currentView === 'profile' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <User size={16} className="inline mb-0.5" />
                            <span className="block">Profile</span>
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

            {currentView !== 'profile' && userProfile && <UserProfileCard userProfile={userProfile} />}

            <main className="w-full flex-grow max-w-4xl">
                {renderView()}
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
                const response = await axios.get(`${API_BASE_URL}/public/animal/${animalId}`);
                setAnimal(response.data);
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
            <Route path="/" element={<App />} />
            <Route path="/animal/:animalId" element={<PublicAnimalPage />} />
            <Route path="/user/:userId" element={<PublicProfilePage />} />
        </Routes>
    );
};

export default AppRouter;
