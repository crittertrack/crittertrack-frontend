import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    AlertTriangle, ArrowLeft, CheckCircle, ChevronDown, ChevronUp,
    Download, FileText, Flame, Gem, Globe, Loader2, Mail, Plus, Save,
    Search, Settings, Star, TableOfContents, Trash2, Upload, User, X
} from 'lucide-react';
import { BreederDirectorySettings } from '../PublicProfile/BreederDirectory';

const API_BASE_URL = '/api';

const STATUS_OPTIONS = ['Pet', 'Growout', 'Breeder', 'Available', 'Booked', 'Sold', 'Retired', 'Deceased', 'Rehomed', 'Unknown']; 
const DEFAULT_SPECIES_OPTIONS = ['Fancy Mouse', 'Fancy Rat', 'Russian Dwarf Hamster', 'Campbells Dwarf Hamster', 'Chinese Dwarf Hamster', 'Syrian Hamster', 'Guinea Pig'];

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

const US_STATES = [
    {code:'AL',name:'Alabama'},{code:'AK',name:'Alaska'},{code:'AZ',name:'Arizona'},{code:'AR',name:'Arkansas'},
    {code:'CA',name:'California'},{code:'CO',name:'Colorado'},{code:'CT',name:'Connecticut'},{code:'DE',name:'Delaware'},
    {code:'FL',name:'Florida'},{code:'GA',name:'Georgia'},{code:'HI',name:'Hawaii'},{code:'ID',name:'Idaho'},
    {code:'IL',name:'Illinois'},{code:'IN',name:'Indiana'},{code:'IA',name:'Iowa'},{code:'KS',name:'Kansas'},
    {code:'KY',name:'Kentucky'},{code:'LA',name:'Louisiana'},{code:'ME',name:'Maine'},{code:'MD',name:'Maryland'},
    {code:'MA',name:'Massachusetts'},{code:'MI',name:'Michigan'},{code:'MN',name:'Minnesota'},{code:'MS',name:'Mississippi'},
    {code:'MO',name:'Missouri'},{code:'MT',name:'Montana'},{code:'NE',name:'Nebraska'},{code:'NV',name:'Nevada'},
    {code:'NH',name:'New Hampshire'},{code:'NJ',name:'New Jersey'},{code:'NM',name:'New Mexico'},{code:'NY',name:'New York'},
    {code:'NC',name:'North Carolina'},{code:'ND',name:'North Dakota'},{code:'OH',name:'Ohio'},{code:'OK',name:'Oklahoma'},
    {code:'OR',name:'Oregon'},{code:'PA',name:'Pennsylvania'},{code:'RI',name:'Rhode Island'},{code:'SC',name:'South Carolina'},
    {code:'SD',name:'South Dakota'},{code:'TN',name:'Tennessee'},{code:'TX',name:'Texas'},{code:'UT',name:'Utah'},
    {code:'VT',name:'Vermont'},{code:'VA',name:'Virginia'},{code:'WA',name:'Washington'},{code:'WV',name:'West Virginia'},
    {code:'WI',name:'Wisconsin'},{code:'WY',name:'Wyoming'},{code:'DC',name:'Washington D.C.'}
];
const getStateName = (stateCode) => {
    if (!stateCode) return '';
    const found = US_STATES.find(s => s.code === stateCode);
    return found ? found.name : stateCode;
};

// Get currency symbol from currency code
const getCurrencySymbol = (currencyCode) => {
    const currencySymbols = {
        'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CNY': '¥', 'KRW': '₩',
        'CAD': 'C$', 'AUD': 'A$', 'CHF': 'CHF', 'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr',
        'PLN': 'zł', 'CZK': 'Kč', 'HUF': 'Ft', 'RON': 'lei', 'BGN': 'лв', 'HRK': 'kn',
        'RUB': '₽', 'UAH': '₴', 'TRY': '₺', 'ILS': '₪', 'AED': 'د.إ', 'SAR': '﷼',
        'INR': '₹', 'PKR': '₨', 'BDT': '৳', 'LKR': 'Rs', 'THB': '฿', 'VND': '₫',
        'IDR': 'Rp', 'MYR': 'RM', 'SGD': 'S$', 'PHP': '₱', 'HKD': 'HK$', 'TWD': 'NT$',
        'NZD': 'NZ$', 'ZAR': 'R', 'EGP': 'E£', 'NGN': '₦', 'KES': 'Sh', 'GHS': '₵',
        'BRL': 'R$', 'ARS': '$', 'CLP': '$', 'COP': '$', 'PEN': 'S/', 'MXN': '$'
    };
    return currencySymbols[currencyCode] || currencyCode || '';
};

// Helper function to get donation badge for a user
const getDonationBadge = (user) => {
    if (!user) return null;
    
    const now = new Date();
    
    // Check for monthly subscription (diamond badge)
    if (user.monthlyDonationActive) {
        return {
            type: 'diamond',
            icon: <Gem size={16} />,
            title: 'Monthly Supporter',
            className: 'bg-gradient-to-r from-blue-400 to-pink-500 text-white'
        };
    }
    
    // Check for one-time donation within last 31 days (gift badge)
    if (user.lastDonationDate) {
        const lastDonation = new Date(user.lastDonationDate);
        const daysSince = Math.floor((now - lastDonation) / (1000 * 60 * 60 * 24));
        
        if (daysSince <= 31) {
            return {
                type: 'gift',
                icon: <Flame size={16} />,
                title: 'Recent Supporter',
                className: 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
            };
        }
    }
    
    return null;
};

// Donation Badge Component
const DonationBadge = ({ user, badge: badgeProp, size = 'sm' }) => {
    const badge = badgeProp ?? getDonationBadge(user);
    if (!badge) return null;
    
    const sizeClasses = {
        xs: 'text-sm',
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-xl'
    };
    
    return (
        <span className={`inline-flex items-center ${sizeClasses[size]}`} title={badge.title}>
            {badge.icon}
        </span>
    );
};

﻿async function compressImageToMaxSize(file, maxBytes = 200 * 1024, opts = {}) {
    if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('Not an image file');
    // Reject GIFs (animations not allowed) ? the server accepts PNG/JPEG only
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
            console.log('[COMPRESSION DEBUG] ? Success with quality reduction. Final:', { width: targetW, height: targetH, size: blob.size, quality: quality.toFixed(2) });
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
                console.log('[COMPRESSION DEBUG] ? Success with dimension reduction. Final:', { width: targetW, height: targetH, size: blob.size, quality: quality.toFixed(2) });
                return blob;
            }
            quality -= qualityStep;
        }
    }

    // As a last resort, return the smallest we could create (use minQuality and minimum dimensions while preserving aspect ratio)
    const finalW = aspectRatio >= 1 ? minDimension : Math.round(minDimension * aspectRatio);
    const finalH = aspectRatio <= 1 ? minDimension : Math.round(minDimension / aspectRatio);
    console.log('[COMPRESSION DEBUG] ? Using fallback dimensions:', { finalW, finalH, aspectRatio: aspectRatio.toFixed(3) });
    const finalBlob = await tryCompress(finalW, finalH, minQuality);
    console.log('[COMPRESSION DEBUG] Final result:', { width: finalW, height: finalH, size: finalBlob?.size });
    return finalBlob || file;
}

// Attempt to compress an image in a Web Worker (public/imageWorker.js).
// Returns a Blob on success, or null if worker not available or reports an error.

﻿const ProfileImagePlaceholder = ({ url, onFileChange, disabled }) => (
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

﻿﻿const FormattedTextarea = ({ value, onChange, rows, maxLength, placeholder, disabled, className }) => {
    const taRef = useRef(null);
    const applyFormat = (prefix, suffix) => {
        const ta = taRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = value.slice(start, end);
        const newValue = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
        onChange({ target: { value: newValue } });
        requestAnimationFrame(() => {
            if (!taRef.current) return;
            taRef.current.focus();
            taRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
        });
    };
    return (
        <div>
            <div className="flex gap-1 mb-1.5">
                <button type="button" disabled={disabled}
                    onMouseDown={(e) => { e.preventDefault(); applyFormat('**', '**'); }}
                    className="px-2 py-0.5 text-xs font-bold border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-40 transition leading-5"
                    title="Bold (**text**)"
                >B</button>
                <button type="button" disabled={disabled}
                    onMouseDown={(e) => { e.preventDefault(); applyFormat('*', '*'); }}
                    className="px-2 py-0.5 text-xs italic border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-40 transition leading-5"
                    title="Italic (*text*)"
                >I</button>
            </div>
            <textarea ref={taRef} value={value} onChange={onChange} rows={rows} maxLength={maxLength}
                placeholder={placeholder} disabled={disabled} className={className} />
        </div>
    );
};

const ProfileEditForm = ({ userProfile, showModalMessage, onSaveSuccess, onCancel, authToken, breedingLineDefs = [], animalBreedingLines = {}, saveBreedingLineDefs, toggleAnimalBreedingLine, BL_PRESETS_APP = [] }) => {
    console.log('[ProfileEditForm] userProfile.allowMessages:', userProfile.allowMessages);
    
    const [personalName, setPersonalName] = useState(userProfile.personalName);
    const [breederName, setBreederName] = useState(userProfile.breederName || '');
    const [showPersonalName, setShowPersonalName] = useState(userProfile.showPersonalName ?? false); 
    const [showBreederName, setShowBreederName] = useState(userProfile.showBreederName ?? false); 
    const [websiteURL, setWebsiteURL] = useState(userProfile.websiteURL || '');
    const [showWebsiteURL, setShowWebsiteURL] = useState(userProfile.showWebsiteURL ?? false);
    const [socialMediaURL, setSocialMediaURL] = useState(userProfile.socialMediaURL || '');
    const [showSocialMediaURL, setShowSocialMediaURL] = useState(userProfile.showSocialMediaURL ?? false);
    const [showEmailPublic, setShowEmailPublic] = useState(userProfile.showEmailPublic ?? false); 
    const [showGeneticCodePublic, setShowGeneticCodePublic] = useState(userProfile.showGeneticCodePublic ?? false);
    const [showRemarksPublic, setShowRemarksPublic] = useState(userProfile.showRemarksPublic ?? false);
    const [bio, setBio] = useState(userProfile.bio || '');
    const [showBio, setShowBio] = useState(userProfile.showBio ?? true);
    const [showStatsTab, setShowStatsTab] = useState(userProfile.showStatsTab ?? true);
    const [allowMessages, setAllowMessages] = useState(userProfile.allowMessages === undefined ? true : !!userProfile.allowMessages);
    const [emailNotificationPreference, setEmailNotificationPreference] = useState(userProfile.emailNotificationPreference || 'none');
    const [country, setCountry] = useState(userProfile.country || '');
    const [usState, setUsState] = useState(userProfile.state || '');
    const [breederInfoOpen, setBreederInfoOpen] = useState(false);
    const [breederInfoLoading, setBreederInfoLoading] = useState(false);
    const [breederInfo, setBreederInfo] = useState({
        aboutProgram:       userProfile.breederInfo?.aboutProgram       || '',
        adoptionRules:      userProfile.breederInfo?.adoptionRules      || '',
        enclosureCare:      userProfile.breederInfo?.enclosureCare      || '',
        routineCare:        userProfile.breederInfo?.routineCare        || '',
        healthGuarantee:    userProfile.breederInfo?.healthGuarantee    || '',
        waitlistInfo:       userProfile.breederInfo?.waitlistInfo       || '',
        pricingNotes:       userProfile.breederInfo?.pricingNotes       || '',
        contactPreferences: userProfile.breederInfo?.contactPreferences || '',
        customFields:       userProfile.breederInfo?.customFields       || [],
    });

    // Keep allowMessages in sync if userProfile updates (e.g., after save or refetch)
    useEffect(() => {
        const next = userProfile.allowMessages === undefined ? true : !!userProfile.allowMessages;
        setAllowMessages(next);
        // Also sync email notification preference and country
        setEmailNotificationPreference(userProfile.emailNotificationPreference || 'none');
        setCountry(userProfile.country || '');
        setUsState(userProfile.country === 'US' ? (userProfile.state || '') : '');
    }, [userProfile.allowMessages, userProfile.emailNotificationPreference, userProfile.country, userProfile.state]);

    // Keep breederInfo form fields in sync when userProfile updates after save/refetch
    useEffect(() => {
        setBreederInfo({
            aboutProgram:       userProfile.breederInfo?.aboutProgram       || '',
            adoptionRules:      userProfile.breederInfo?.adoptionRules      || '',
            enclosureCare:      userProfile.breederInfo?.enclosureCare      || '',
            routineCare:        userProfile.breederInfo?.routineCare        || '',
            healthGuarantee:    userProfile.breederInfo?.healthGuarantee    || '',
            waitlistInfo:       userProfile.breederInfo?.waitlistInfo       || '',
            pricingNotes:       userProfile.breederInfo?.pricingNotes       || '',
            contactPreferences: userProfile.breederInfo?.contactPreferences || '',
            customFields:       userProfile.breederInfo?.customFields       || [],
        });
    }, [userProfile.breederInfo]);
    
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
    const [dangerZoneOpen, setDangerZoneOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState('profile');
    const [myReceivedRatings, setMyReceivedRatings] = useState(null);
    const [myReceivedRatingsLoading, setMyReceivedRatingsLoading] = useState(false);

    // Breeding lines ? local draft state (not saved until user clicks Save)
    const [localBLDefs, setLocalBLDefs] = useState(breedingLineDefs);
    const [blSaving, setBlSaving] = useState(false);
    const [blSaved, setBlSaved] = useState(false);
    useEffect(() => { setLocalBLDefs(breedingLineDefs); }, [breedingLineDefs]);

    useEffect(() => {
        if (settingsTab !== 'ratings' || !userProfile?.id_public) return;
        setMyReceivedRatingsLoading(true);
        axios.get(`${API_BASE_URL}/public/ratings/${userProfile.id_public}`)
            .then(r => setMyReceivedRatings(r.data))
            .catch(() => setMyReceivedRatings({ ratings: [], average: 0, count: 0 }))
            .finally(() => setMyReceivedRatingsLoading(false));
    }, [settingsTab, userProfile?.id_public]);

    useEffect(() => {
        if (settingsTab !== 'data') return;
        axios.get(`${API_BASE_URL}/species`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(r => setZeSpeciesList(Array.isArray(r.data) ? r.data : []))
            .catch(() => {});
    }, [settingsTab, API_BASE_URL, authToken]);

    // Data Portability ? Export
    const [exportSections, setExportSections] = useState({ animals: true, litters: true, enclosures: true, supplies: true, budget: true });
    const [exportFormat, setExportFormat] = useState('json');
    const [exportIncludeArchived, setExportIncludeArchived] = useState(false);
    const [exportIncludeSold, setExportIncludeSold] = useState(false);
    const [exportEmbedImages, setExportEmbedImages] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    // Data Portability ? Import
    const [importFile, setImportFile] = useState(null);

    // ZooEasy Import
    const [zeAnimalsFile, setZeAnimalsFile] = useState(null);
    const [zePairsFile, setZePairsFile] = useState(null);
    const [zeSpecies, setZeSpecies] = useState('');
    const [zeNewSpeciesName, setZeNewSpeciesName] = useState('');
    const [zeAddingSpecies, setZeAddingSpecies] = useState(false);
    const [zePreview, setZePreview] = useState(null);
    const [zeConflictResolutions, setZeConflictResolutions] = useState({});
    const [zeLoading, setZeLoading] = useState(false);
    const [zeConfirmLoading, setZeConfirmLoading] = useState(false);
    const [zeResult, setZeResult] = useState(null);
    const [zeSelectedAnimals, setZeSelectedAnimals] = useState(() => new Set());
    const [zeSelectedLitters, setZeSelectedLitters] = useState(() => new Set());
    const [zeManualMappings, setZeManualMappings] = useState({});
    const [zeMappingSearch, setZeMappingSearch] = useState({ regNum: null, query: '', results: [], loading: false });
    const [zeSpeciesList, setZeSpeciesList] = useState([]);

    // Kintraks Import
    const [ktkAnimalsFile, setKtkAnimalsFile] = useState(null);
    const [ktkBreedingFile, setKtkBreedingFile] = useState(null);
    const [ktkSpecies, setKtkSpecies] = useState('');
    const [ktkNewSpeciesName, setKtkNewSpeciesName] = useState('');
    const [ktkAddingSpecies, setKtkAddingSpecies] = useState(false);
    const [ktkPreview, setKtkPreview] = useState(null);
    const [ktkConflictResolutions, setKtkConflictResolutions] = useState({});
    const [ktkLoading, setKtkLoading] = useState(false);
    const [ktkConfirmLoading, setKtkConfirmLoading] = useState(false);
    const [ktkResult, setKtkResult] = useState(null);
    const [ktkSelectedAnimals, setKtkSelectedAnimals] = useState(() => new Set());
    const [ktkSelectedLitters, setKtkSelectedLitters] = useState(() => new Set());
    const [ktkManualMappings, setKtkManualMappings] = useState({});
    const [ktkMappingSearch, setKtkMappingSearch] = useState({ registration: null, query: '', results: [], loading: false });
    const [ktkLitterMappings, setKtkLitterMappings] = useState({});
    const [ktkLitterMappingSearch, setKtkLitterMappingSearch] = useState({ litterIndex: null, side: null, query: '', results: [], loading: false });

    const [importPreview, setImportPreview] = useState(null);
    const [importConflictResolutions, setImportConflictResolutions] = useState({});
    const [importLoading, setImportLoading] = useState(false);
    const [importConfirmLoading, setImportConfirmLoading] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [importSectionActions, setImportSectionActions] = useState({});
    const [importConflictsExpanded, setImportConflictsExpanded] = useState({});

    // SimpleBreed Import
    const [sbUrl, setSbUrl] = useState('');
    const [sbPreviewLoading, setSbPreviewLoading] = useState(false);
    const [sbPreview, setSbPreview] = useState(null); // { animals: [...], profileUrl }
    const [sbSelectedIds, setSbSelectedIds] = useState(() => new Set());
    const [sbConflictResolutions, setSbConflictResolutions] = useState({}); // { sbId: 'skip'|'import_anyway' }
    const [sbManualMappings, setSbManualMappings] = useState({}); // { sbId: { id_public, name } }
    const [sbMappingSearch, setSbMappingSearch] = useState({ sbId: null, query: '', results: [], loading: false });
    const [sbSpeciesOverrides, setSbSpeciesOverrides] = useState({}); // { sbId: 'species' } for animals where SB couldn't determine species
    const [sbFavoriteSpecies, setSbFavoriteSpecies] = useState(() => {
        try { return JSON.parse(localStorage.getItem('speciesFavorites') || '[]'); } catch { return []; }
    });
    useEffect(() => {
        const onFavChange = (e) => setSbFavoriteSpecies(e.detail || []);
        window.addEventListener('speciesFavoritesChanged', onFavChange);
        return () => window.removeEventListener('speciesFavoritesChanged', onFavChange);
    }, []);
    const [sbImportLoading, setSbImportLoading] = useState(false);
    const [sbResult, setSbResult] = useState(null);

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
            socialMediaURL: socialMediaURL || null,
            showSocialMediaURL: socialMediaURL ? showSocialMediaURL : false,
            showEmailPublic: showEmailPublic,
            showGeneticCodePublic: showGeneticCodePublic,
            showRemarksPublic: showRemarksPublic,
            bio: bio || null,
            showBio: bio ? showBio : true,
            showStatsTab: showStatsTab,
            allowMessages: allowMessages,
            emailNotificationPreference: emailNotificationPreference,
            country: country || null,
            state: country === 'US' ? (usState || null) : null,
        };
        
        console.log('[PROFILE UPDATE] allowMessages being sent:', allowMessages, 'Type:', typeof allowMessages);
        console.log('[PROFILE UPDATE] Bio state:', bio, 'Type:', typeof bio, 'Length:', bio ? bio.length : 'null');
        console.log('[PROFILE UPDATE] showBio state:', showBio, 'Type:', typeof showBio);
        
        console.log('[PROFILE UPDATE] Sending payload:', {
            showBreederName: payload.showBreederName,
            breederName: payload.breederName,
            bio: payload.bio,
            showBio: payload.showBio,
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
                    showModalMessage('Image Upload', 'Upload endpoint failed ? will attempt fallback save (file included in profile PUT).');
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

    const handleBreederInfoSave = async (e) => {
        e.preventDefault();
        setBreederInfoLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/users/profile`, { breederInfo }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'Info & Adoption page saved successfully.');
            if (onSaveSuccess) await onSaveSuccess();
        } catch (error) {
            showModalMessage('Error', error.response?.data?.message || 'Failed to save Info & Adoption content.');
        } finally {
            setBreederInfoLoading(false);
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

    // -- Data Portability handlers ---------------------------------------------

    const handleExport = async () => {
        const selectedSections = Object.entries(exportSections)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(',');
        if (!selectedSections) return;
        setExportLoading(true);
        try {
            const params = new URLSearchParams({
                sections: selectedSections,
                format: exportFormat,
                includeArchived: String(exportIncludeArchived),
                includeSold: String(exportIncludeSold),
                embedImages: String(exportEmbedImages),
            });
            const response = await fetch(`${API_BASE_URL}/export?${params}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `Export failed (${response.status})`);
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const ts = new Date().toISOString().slice(0, 10);
            a.download = exportFormat === 'csv' ? `crittertrack_export_${ts}.zip` : `crittertrack_export_${ts}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            showModalMessage('Export Failed', err.message);
        } finally {
            setExportLoading(false);
        }
    };

    const handleImportPreview = async () => {
        if (!importFile) return;
        setImportLoading(true);
        setImportPreview(null);
        setImportResult(null);
        setImportConflictResolutions({});
        try {
            const formData = new FormData();
            formData.append('file', importFile);
            const resp = await axios.post(`${API_BASE_URL}/import`, formData, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const preview = resp.data.preview || {};
            setImportPreview(preview);
            // Default all conflicts to 'skip'
            const defaults = {};
            for (const [section, info] of Object.entries(preview)) {
                if (info.conflicts?.length) {
                    defaults[section] = {};
                    for (const conflict of info.conflicts) {
                        const key = conflict.id_public || conflict.litter_id_public || conflict.name || '';
                        defaults[section][key] = 'skip';
                    }
                }
            }
            setImportConflictResolutions(defaults);
            // Default bulk section action to 'skip' for all conflicting sections
            const sectionDefaults = {};
            for (const [section, info] of Object.entries(preview)) {
                if (info.conflicts?.length) sectionDefaults[section] = 'skip';
            }
            setImportSectionActions(sectionDefaults);
            setImportConflictsExpanded({});
        } catch (err) {
            showModalMessage('Parse Failed', err.response?.data?.message || err.message);
        } finally {
            setImportLoading(false);
        }
    };

    const handleImportConfirm = async () => {
        if (!importFile || !importPreview) return;
        setImportConfirmLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', importFile);
            formData.append('confirm', 'true');
            formData.append('conflictResolutions', JSON.stringify(importConflictResolutions));
            const resp = await axios.post(`${API_BASE_URL}/import`, formData, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setImportResult(resp.data);
            setImportPreview(null);
            setImportFile(null);
        } catch (err) {
            showModalMessage('Import Failed', err.response?.data?.message || err.message);
        } finally {
            setImportConfirmLoading(false);
        }
    };

    const setConflictResolution = (section, key, action) => {
        setImportConflictResolutions(prev => ({
            ...prev,
            [section]: { ...(prev[section] || {}), [key]: action },
        }));
    };

    const handleSectionBulkAction = (section, action, conflicts) => {
        setImportSectionActions(prev => ({ ...prev, [section]: action }));
        setImportConflictResolutions(prev => {
            const updated = {};
            for (const conflict of conflicts) {
                const key = conflict.id_public || conflict.litter_id_public || conflict.name || '';
                updated[key] = action;
            }
            return { ...prev, [section]: updated };
        });
    };

    return (
        <div className="w-full max-w-7xl bg-white p-6 rounded-xl shadow-lg">
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
            
            {/* Settings Tabs */}
            <div className="flex flex-wrap border-b border-gray-200 mb-6">
                {[
                    { id: 'profile',         label: 'Profile' },
                    { id: 'info-adoption',   label: 'Info & Adoption' },
                    { id: 'directory',       label: 'Directory' },
                    { id: 'ratings',         label: 'Ratings' },
                    { id: 'breeding-lines',  label: 'Breeding Lines' },
                    { id: 'data',            label: 'Data Portability' },
                    { id: 'account',         label: 'Account' },
                ].map(tab => (
                    <button key={tab.id} type="button" onClick={() => setSettingsTab(tab.id)}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${settingsTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >{tab.label}</button>
                ))}
            </div>

            {settingsTab === 'profile' && <>
            <form id="profile-info-form" onSubmit={handleProfileUpdate} className="space-y-6 mb-4 p-4 sm:p-6 border rounded-lg bg-gray-50 overflow-x-hidden">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Public Profile Information</h3>
                
                <div data-tutorial-target="profile-image-upload">
                    <ProfileImagePlaceholder 
                        url={profileImageURL} 
                        onFileChange={handleImageChange} 
                        disabled={profileLoading} 
                    />
                </div>

                <div className="space-y-4 min-w-0">
                    <div data-tutorial-target="name-fields" className="space-y-4">
                        <input type="text" name="personalName" placeholder="Personal Name *" value={personalName} onChange={(e) => setPersonalName(e.target.value)} required 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border" disabled={profileLoading} />
                        <input type="text" name="breederName" placeholder="Breeder Name (Optional)" value={breederName} onChange={(e) => setBreederName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border" disabled={profileLoading} />
                    </div>
                    <div data-tutorial-target="website-country-fields" className="space-y-4">
                        <input type="url" name="websiteURL" placeholder="Website URL (Optional) e.g., https://example.com" value={websiteURL} onChange={(e) => setWebsiteURL(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border" disabled={profileLoading} />
                        <input type="url" name="socialMediaURL" placeholder="Social Media Link (Optional) e.g., https://instagram.com/yourpage" value={socialMediaURL} onChange={(e) => setSocialMediaURL(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border" disabled={profileLoading} />
                    
                        <textarea 
                            name="bio" 
                            placeholder="Bio (Optional) - Tell other breeders about yourself and your breeding program" 
                            value={bio} 
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val.split('\n').length > 15) return;
                                if (val.length > 1000) return;
                                setBio(val);
                            }}
                            rows="4"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border resize-none" 
                            disabled={profileLoading}
                        />
                        {bio && <p className="text-xs text-gray-500 mt-1">{bio.length}/1000 characters ? {bio.split('\n').length}/15 lines</p>}

                        <select value={country} onChange={(e) => { setCountry(e.target.value); if (e.target.value !== 'US') setUsState(''); }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border" disabled={profileLoading}>
                        <option value="">Select Country (Optional)</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="NZ">New Zealand</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="IT">Italy</option>
                        <option value="ES">Spain</option>
                        <option value="NL">Netherlands</option>
                        <option value="SE">Sweden</option>
                        <option value="NO">Norway</option>
                        <option value="DK">Denmark</option>
                        <option value="CH">Switzerland</option>
                        <option value="BE">Belgium</option>
                        <option value="AT">Austria</option>
                        <option value="PL">Poland</option>
                        <option value="CZ">Czech Republic</option>
                        <option value="IE">Ireland</option>
                        <option value="PT">Portugal</option>
                        <option value="GR">Greece</option>
                        <option value="RU">Russia</option>
                        <option value="JP">Japan</option>
                        <option value="KR">South Korea</option>
                        <option value="CN">China</option>
                        <option value="IN">India</option>
                        <option value="BR">Brazil</option>
                        <option value="MX">Mexico</option>
                        <option value="ZA">South Africa</option>
                        <option value="SG">Singapore</option>
                        <option value="HK">Hong Kong</option>
                        <option value="MY">Malaysia</option>
                        <option value="TH">Thailand</option>
                        </select>

                        {country === 'US' && (
                            <select value={usState} onChange={(e) => setUsState(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border mt-2" disabled={profileLoading}>
                                <option value="">Select State (Optional)</option>
                                {US_STATES.map(s => (
                                    <option key={s.code} value={s.code}>{s.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div data-tutorial-target="public-visibility-checkboxes" className="pt-2 space-y-2">
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
                        {socialMediaURL && (
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input type="checkbox" checked={showSocialMediaURL} onChange={(e) => setShowSocialMediaURL(e.target.checked)} 
                                    className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                                <span>Display **Social Media Link** on your public profile card.</span>
                            </label>
                        )}
                        
                        {bio && (
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input type="checkbox" checked={showBio} onChange={(e) => setShowBio(e.target.checked)} 
                                    className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                                <span>Display **Bio** on your public profile card.</span>
                            </label>
                        )}
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" checked={showStatsTab} onChange={(e) => setShowStatsTab(e.target.checked)} 
                                className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                            <span>Show **Stats** tab on your public profile.</span>
                        </label>
                    </div>

                    <div data-tutorial-target="messaging-preferences" className="pt-4 space-y-2 border-t border-gray-200">
                        <h4 className="text-base font-medium text-gray-800">Messaging Preferences:</h4>
                        
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" checked={allowMessages} onChange={(e) => setAllowMessages(e.target.checked)} 
                                className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                            <span>Allow other breeders to message me</span>
                        </label>
                    </div>

                    <div data-tutorial-target="email-notifications" className="pt-4 space-y-3 border-t border-gray-200">
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

            </form>
            <div className="flex justify-end mb-2">
                <button type="submit" form="profile-info-form" disabled={profileLoading}
                    className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                >
                    {profileLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                    Save Profile Info
                </button>
            </div>
            </>}

            {settingsTab === 'info-adoption' && <>
            <form onSubmit={handleBreederInfoSave} className="space-y-4 p-4 sm:p-6 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Info &amp; Adoption</h3>
                <p className="text-sm text-gray-500">Shown on your public profile under the <strong>Info &amp; Adoption</strong> tab. Leave fields blank to hide them.</p>
                {[
                    { key: 'aboutProgram',       label: 'About My Program / Breeding Goals' },
                    { key: 'adoptionRules',      label: 'Adoption / Rehoming Rules' },
                    { key: 'enclosureCare',      label: 'Enclosure / Enclosure Care Requirements' },
                    { key: 'routineCare',        label: 'Routine Care (Food, Medical, etc.)' },
                    { key: 'healthGuarantee',    label: 'Health Guarantee' },
                    { key: 'waitlistInfo',       label: 'Waitlist and Booking Info' },
                    { key: 'pricingNotes',       label: 'Pricing / Fee Notes' },
                    { key: 'contactPreferences', label: 'Contact Preferences' },
                ].map(({ key, label }) => (
                    <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <FormattedTextarea
                            value={breederInfo[key]}
                            onChange={(e) => setBreederInfo(v => ({ ...v, [key]: e.target.value }))}
                            rows={3}
                            maxLength={2000}
                            placeholder={`Enter ${label.toLowerCase()}\u2026`}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border resize-none"
                            disabled={breederInfoLoading}
                        />
                        {breederInfo[key] && <p className="text-xs text-gray-400 mt-0.5 text-right">{breederInfo[key].length}/2000</p>}
                    </div>
                ))}

                {/* Custom Fields */}
                <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700">Custom Fields</h4>
                            <p className="text-xs text-gray-400 mt-0.5">Add your own sections with custom titles. Up to 10 fields.</p>
                        </div>
                        {breederInfo.customFields.length < 10 && (
                            <button
                                type="button"
                                disabled={breederInfoLoading}
                                onClick={() => setBreederInfo(v => ({ ...v, customFields: [...v.customFields, { title: '', value: '' }] }))}
                                className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 disabled:opacity-50 transition"
                            >
                                <Plus size={15} /> Add Field
                            </button>
                        )}
                    </div>
                    {breederInfo.customFields.length === 0 && (
                        <p className="text-sm text-gray-400 italic">No custom fields yet. Click &ldquo;Add Field&rdquo; to create one.</p>
                    )}
                    <div className="space-y-4">
                        {breederInfo.customFields.map((cf, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={cf.title}
                                        onChange={(e) => {
                                            const updated = breederInfo.customFields.map((f, i) => i === idx ? { ...f, title: e.target.value } : f);
                                            setBreederInfo(v => ({ ...v, customFields: updated }));
                                        }}
                                        maxLength="100"
                                        placeholder="Section title (e.g. Transport Policy)"
                                        className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border"
                                        disabled={breederInfoLoading}
                                    />
                                    <button
                                        type="button"
                                        disabled={breederInfoLoading}
                                        onClick={() => {
                                            const updated = breederInfo.customFields.filter((_, i) => i !== idx);
                                            setBreederInfo(v => ({ ...v, customFields: updated }));
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 transition rounded"
                                        title="Remove field"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <FormattedTextarea
                                    value={cf.value}
                                    onChange={(e) => {
                                        const updated = breederInfo.customFields.map((f, i) => i === idx ? { ...f, value: e.target.value } : f);
                                        setBreederInfo(v => ({ ...v, customFields: updated }));
                                    }}
                                    rows={3}
                                    maxLength={2000}
                                    placeholder={"Enter content\u2026"}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition box-border resize-none"
                                    disabled={breederInfoLoading}
                                />
                                {cf.value && <p className="text-xs text-gray-400 mt-0.5 text-right">{cf.value.length}/2000</p>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={breederInfoLoading}
                        className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {breederInfoLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                        Save Info &amp; Adoption
                    </button>
                </div>
            </form>
            </>}

            {settingsTab === 'directory' && <>
            <BreederDirectorySettings
                authToken={authToken}
                API_BASE_URL={API_BASE_URL}
                showModalMessage={showModalMessage}
                userProfile={userProfile}
            />
            </>}

            {settingsTab === 'ratings' && <>
            <div className="p-4 sm:p-6 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Ratings Received</h3>
                {myReceivedRatingsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={28} /></div>
                ) : !myReceivedRatings || myReceivedRatings.count === 0 ? (
                    <p className="text-gray-500 text-sm py-4 text-center">No ratings yet.</p>
                ) : (
                    <>
                        <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-lg border">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-800">{myReceivedRatings.average.toFixed(1)}</div>
                                <div className="text-yellow-400 text-xl">
                                    {[1,2,3,4,5].map(n => <span key={n}>{n <= Math.round(myReceivedRatings.average) ? <Star size={16} className="inline-block align-middle fill-current text-amber-400" /> : <Star size={16} className="inline-block align-middle text-gray-200" />}</span>)}
                                </div>
                                <div className="text-xs text-gray-500">{myReceivedRatings.count} rating{myReceivedRatings.count !== 1 ? 's' : ''}</div>
                            </div>
                            <div className="flex-1 space-y-1">
                                {[5,4,3,2,1].map(star => (
                                    <div key={star} className="flex items-center gap-2 text-xs">
                                        <span className="w-4 text-right text-gray-500">{star}</span>
                                        <Star size={14} className="inline-block align-middle fill-current text-yellow-400" />
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${myReceivedRatings.count > 0 ? ((myReceivedRatings.distribution?.[star] || 0) / myReceivedRatings.count) * 100 : 0}%` }} />
                                        </div>
                                        <span className="w-4 text-gray-500">{myReceivedRatings.distribution?.[star] || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            {myReceivedRatings.ratings.map(r => (
                                <div key={r._id} className="bg-white rounded-lg border p-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-gray-800 text-sm">{r.raterName || r.raterId_public}</span>
                                        <span className="text-yellow-400 text-sm">
                                            {[1,2,3,4,5].map(n => <span key={n}>{n <= r.score ? <Star size={14} className="inline-block align-middle fill-current text-amber-400" /> : <Star size={14} className="inline-block align-middle text-gray-200" />}</span>)}
                                        </span>
                                    </div>
                                    {r.comment && <p className="text-gray-600 text-sm mt-1">{r.comment}</p>}
                                    <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
            </>}

            {settingsTab === 'breeding-lines' && (
                <div className="p-4 sm:p-6 border rounded-lg bg-gray-50 space-y-5">
                    <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-1.5"><TableOfContents size={16} className="flex-shrink-0 text-gray-400" /> Breeding Lines</h3>
                    <p className="text-sm text-gray-600">Define up to 10 personal breeding lines. These are private and only visible to you. Assign them to animals in the animal&apos;s detail view under the Identification tab.</p>
                    <div className="space-y-3">
                        {localBLDefs.map((line, idx) => (
                            <div key={line.id} className="flex items-center gap-3 flex-wrap">
                                <span className="text-sm text-gray-400 w-4 text-right">{idx + 1}</span>
                                <div className="flex gap-1">
                                    {BL_PRESETS_APP.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setLocalBLDefs(localBLDefs.map((l, i) => i === idx ? { ...l, color } : l))}
                                            style={{ backgroundColor: color, outline: line.color === color ? '3px solid #374151' : 'none', outlineOffset: '2px' }}
                                            className="w-5 h-5 rounded-full transition hover:scale-110 flex-shrink-0"
                                            title={color}
                                        />
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder={`Line ${idx + 1} name`}
                                    value={line.name}
                                    maxLength={30}
                                    onChange={(e) => setLocalBLDefs(localBLDefs.map((l, i) => i === idx ? { ...l, name: e.target.value } : l))}
                                    className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
                                />
                                <span style={{ color: line.color }} className="text-xl leading-none" title={line.name || `Line ${idx + 1}`}>&#x25C6;</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                        <button
                            type="button"
                            disabled={blSaving}
                            onClick={async () => {
                                setBlSaving(true);
                                setBlSaved(false);
                                await saveBreedingLineDefs(localBLDefs, animalBreedingLines);
                                setBlSaving(false);
                                setBlSaved(true);
                                setTimeout(() => setBlSaved(false), 3000);
                            }}
                            className="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-5 rounded-lg shadow-md transition duration-150 flex items-center gap-2 disabled:opacity-50"
                        >
                            {blSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            {blSaving ? 'Saving?' : 'Save Breeding Lines'}
                        </button>
                        {blSaved && <span className="text-sm text-green-600 font-medium">&#x2713; Saved to your account!</span>}
                    </div>
                </div>
            )}

            {settingsTab === 'account' && <>
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
            </>}

            {settingsTab === 'data' && <>
            <div className="p-4 sm:p-6 border rounded-lg bg-gray-50 overflow-x-hidden space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Data Portability</h3>
                <p className="text-sm text-gray-500 -mt-2">Export your records as a backup, or import data from a previous CritterTrack export or another service.</p>

                {/* -- Export -------------------------------------------------- */}
                <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Download size={16} /> Export</h4>

                    <p className="text-xs text-gray-500 mb-3">Select which sections to include:</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                        {['animals','litters','enclosures','supplies','budget'].map(s => (
                            <label key={s} className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="checkbox" checked={exportSections[s]} onChange={() => setExportSections(prev => ({ ...prev, [s]: !prev[s] }))}
                                    className="rounded" />
                                <span className="capitalize">{s}</span>
                            </label>
                        ))}
                    </div>

                    <p className="text-xs text-gray-500 mb-2">Format:</p>
                    <div className="flex gap-5 mb-4">
                        {[['json','JSON (single file)'],['csv','CSV (zip bundle)']].map(([val, label]) => (
                            <label key={val} className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input type="radio" name="exportFmt" value={val} checked={exportFormat === val} onChange={() => setExportFormat(val)} />
                                {label}
                            </label>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4 text-sm">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={exportIncludeArchived} onChange={e => setExportIncludeArchived(e.target.checked)} className="rounded" />
                            Include archived
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={exportIncludeSold} onChange={e => setExportIncludeSold(e.target.checked)} className="rounded" />
                            Include sold animals
                        </label>
                        {exportFormat === 'json' && (
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" checked={exportEmbedImages} onChange={e => setExportEmbedImages(e.target.checked)} className="rounded" />
                                Embed images (base64)
                            </label>
                        )}
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={exportLoading || !Object.values(exportSections).some(Boolean)}
                        className="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {exportLoading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                        Export Data
                    </button>
                </div>

                {/* -- Import -------------------------------------------------- */}
                <div className="border-t pt-5">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Upload size={16} /> Import</h4>
                    <p className="text-xs text-gray-500 mb-3">Upload a <code>.json</code> or <code>.zip</code> (CSV bundle) previously exported from CritterTrack.</p>

                    {/* File picker */}
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition mb-4 relative">
                        <input type="file" accept=".json,.zip" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={e => { setImportFile(e.target.files?.[0] || null); setImportPreview(null); setImportResult(null); }} />
                        {importFile
                            ? <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><FileText size={16} />{importFile.name}</p>
                            : <>
                                <Upload size={22} className="text-gray-400 mb-1" />
                                <p className="text-sm text-gray-500">Click or drag to upload .json / .zip</p>
                              </>
                        }
                    </label>

                    {importFile && !importPreview && !importResult && (
                        <button onClick={handleImportPreview} disabled={importLoading}
                            className="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {importLoading ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                            Preview Import
                        </button>
                    )}

                    {/* Import preview */}
                    {importPreview && (
                        <div className="space-y-4 mt-2">
                            <h5 className="font-semibold text-gray-700">Preview</h5>
                            <div className="overflow-x-auto rounded border">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium text-gray-600">Section</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-600">Records</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-600">New</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-600">Conflicts</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {Object.entries(importPreview).map(([section, info]) => (
                                            <tr key={section} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 capitalize font-medium">{section}</td>
                                                <td className="px-3 py-2">{info.total}</td>
                                                <td className="px-3 py-2 text-green-700">{info.new}</td>
                                                <td className="px-3 py-2 text-amber-600">{info.conflicts?.length || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Conflict resolution */}
                            {Object.entries(importPreview).some(([_s, info]) => info.conflicts?.length > 0) && (
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-amber-700 flex items-center gap-1.5">
                                        <AlertTriangle size={15} /> Duplicate records found ? choose how to handle each section:
                                    </p>
                                    {Object.entries(importPreview).map(([section, info]) => {
                                        if (!info.conflicts?.length) return null;
                                        const bulkAction = importSectionActions[section] || 'skip';
                                        const expanded = importConflictsExpanded[section] || false;
                                        return (
                                            <div key={section} className="rounded border bg-amber-50 overflow-hidden">
                                                {/* Section header: bulk action */}
                                                <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                                                    <span className="text-xs font-semibold text-gray-700 uppercase capitalize flex-1">{section}</span>
                                                    <span className="text-xs text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 font-medium">
                                                        {info.conflicts.length} duplicate{info.conflicts.length !== 1 ? 's' : ''}
                                                    </span>
                                                    <select
                                                        value={bulkAction}
                                                        onChange={e => handleSectionBulkAction(section, e.target.value, info.conflicts)}
                                                        className="text-xs border rounded px-2 py-1 bg-white font-medium"
                                                    >
                                                        <option value="skip">Skip all</option>
                                                        <option value="overwrite">Overwrite all</option>
                                                        <option value="createNew">Create all as new</option>
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => setImportConflictsExpanded(prev => ({ ...prev, [section]: !prev[section] }))}
                                                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-0.5 whitespace-nowrap"
                                                    >
                                                        {expanded ? 'Hide' : 'Override individually'}
                                                        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                    </button>
                                                </div>
                                                {/* Per-item overrides (collapsed by default) */}
                                                {expanded && (
                                                    <div className="border-t bg-white px-3 pb-3 pt-2 space-y-1 max-h-52 overflow-y-auto">
                                                        {info.conflicts.map(conflict => {
                                                            const key = conflict.id_public || conflict.litter_id_public || conflict.name || '';
                                                            const displayName = conflict.name || conflict.litter_id_public || conflict.id_public || key;
                                                            const currentAction = importConflictResolutions[section]?.[key] || bulkAction;
                                                            const isOverridden = currentAction !== bulkAction;
                                                            return (
                                                                <div key={key} className="flex flex-wrap items-center gap-2 text-xs py-0.5">
                                                                    <span className="font-mono bg-gray-100 border rounded px-1.5 py-0.5">{key}</span>
                                                                    <span className="text-gray-500 flex-1 min-w-0 truncate">{displayName !== key ? displayName : ''}</span>
                                                                    <select
                                                                        value={currentAction}
                                                                        onChange={e => setConflictResolution(section, key, e.target.value)}
                                                                        className={`text-xs border rounded px-2 py-0.5 ${isOverridden ? 'bg-blue-50 border-blue-300 font-semibold' : 'bg-white'}`}
                                                                    >
                                                                        <option value="skip">Skip</option>
                                                                        <option value="overwrite">Overwrite</option>
                                                                        <option value="createNew">Create as new</option>
                                                                    </select>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button onClick={handleImportConfirm} disabled={importConfirmLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {importConfirmLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                    Confirm Import
                                </button>
                                <button onClick={() => { setImportPreview(null); setImportFile(null); }}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Import result */}
                    {importResult && (
                        <div className="mt-3 p-4 rounded-lg border bg-green-50 border-green-200">
                            <p className="font-semibold text-green-800 flex items-center gap-1.5 mb-2"><CheckCircle size={16} /> Import complete</p>
                            {importResult.written && (
                                <div className="text-sm text-gray-700 space-y-0.5 mb-2">
                                    {Object.entries(importResult.written).map(([s, n]) => (
                                        <p key={s}><span className="capitalize font-medium">{s}</span>: {n} written{importResult.skipped?.[s] ? `, ${importResult.skipped[s]} skipped` : ''}</p>
                                    ))}
                                </div>
                            )}
                            {importResult.errors?.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm font-semibold text-red-700 flex items-center gap-1"><AlertTriangle size={13} /> {importResult.errors.length} error(s):</p>
                                    <ul className="text-xs text-red-600 list-disc list-inside mt-1 space-y-0.5 max-h-32 overflow-y-auto">
                                        {importResult.errors.map((e, i) => (
                                            <li key={i}>[{e.section}] {e.id}: {e.error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <button onClick={() => setImportResult(null)} className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline">Dismiss</button>
                        </div>
                    )}
                </div>

                {/* -- Third-party import disclaimer ---------------------------- */}
                <div className="border-t pt-5">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 flex gap-2.5">
                        <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800 space-y-1">
                            <p className="font-semibold">Important ? please read before importing</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                <li><strong>Images are not imported</strong> ? ZooEasy, Kintraks, and SimpleBreed imports do not transfer any animal photos. You will need to upload images manually after importing.</li>
                                <li><strong>Use at your own risk</strong> ? importing may overwrite existing animal records, parent links, and other data. Always export a backup first.</li>
                                <li><strong>Parent links may be inaccurate</strong> ? parent names and relationships are matched by name and date; mismatches or missing links can occur and should be reviewed after import.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* -- ZooEasy Import ------------------------------------------- */}
                <div className="border-t pt-5">
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center gap-2"><Upload size={16} /> Import from ZooEasy</h4>
                    <p className="text-xs text-gray-500 mb-4">Export your animals and/or breeding pairs from ZooEasy as CSV, then upload them here. Duplicates are detected across all CritterTrack users by registration number and name + birth date.</p>

                    {/* Species */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Species <span className="text-red-500">*</span> (required when importing animals)</label>
                        <div className="flex items-center gap-2 max-w-xs">
                            <select
                                value={zeSpecies}
                                onChange={e => setZeSpecies(e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary bg-white"
                            >
                                <option value="">? select species ?</option>
                                {(zeSpeciesList || []).map(s => (
                                    <option key={s.name} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                title="Add new species"
                                onClick={() => { setZeAddingSpecies(v => !v); setZeNewSpeciesName(''); }}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600 transition"
                            >
                                <Plus size={15} />
                            </button>
                        </div>
                        {zeAddingSpecies && (
                            <div className="flex items-center gap-2 mt-2 max-w-xs">
                                <input
                                    type="text"
                                    placeholder="New species name"
                                    value={zeNewSpeciesName}
                                    onChange={e => setZeNewSpeciesName(e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
                                    onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                                />
                                <button
                                    type="button"
                                    disabled={!zeNewSpeciesName.trim()}
                                    onClick={async () => {
                                        const name = zeNewSpeciesName.trim();
                                        if (!name) return;
                                        try {
                                            const resp = await axios.post(`${API_BASE_URL}/species`,
                                                { name, category: 'Mammal' },
                                                { headers: { Authorization: `Bearer ${authToken}` } }
                                            );
                                            const added = resp.data.species;
                                            setZeSpeciesList(prev => [...prev, added]);
                                            setZeSpecies(added.name);
                                            setZeAddingSpecies(false);
                                            setZeNewSpeciesName('');
                                        } catch (err) {
                                            if (err.response?.status === 409) {
                                                // Already exists ? just select it
                                                const existing = err.response.data.existing?.name || name;
                                                setZeSpecies(existing);
                                                setZeAddingSpecies(false);
                                            } else {
                                                showModalMessage('Error', err.response?.data?.message || 'Failed to add species.');
                                            }
                                        }
                                    }}
                                    className="px-3 py-2 bg-primary hover:bg-primary-dark text-black text-xs font-bold rounded-lg transition disabled:opacity-40"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setZeAddingSpecies(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* File pickers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {[['animals', zeAnimalsFile, setZeAnimalsFile, 'Animals CSV (animals.csv)'],
                          ['breedingpairs', zePairsFile, setZePairsFile, 'Breeding Pairs CSV (breedingpairs.csv)']].map(
                            ([key, file, setter, label]) => (
                                <label key={key} className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition relative">
                                    <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        onChange={e => { setter(e.target.files?.[0] || null); setZePreview(null); setZeResult(null); }} />
                                    {file
                                        ? <p className="text-xs font-medium text-gray-700 flex items-center gap-1"><FileText size={13} />{file.name}</p>
                                        : <>
                                            <Upload size={16} className="text-gray-400 mb-1" />
                                            <p className="text-xs text-gray-500 text-center px-2">{label}</p>
                                          </>
                                    }
                                </label>
                            )
                        )}
                    </div>

                    {(zeAnimalsFile || zePairsFile) && !zePreview && !zeResult && (
                        <button
                            onClick={async () => {
                                if (zeAnimalsFile && !zeSpecies.trim()) {
                                    showModalMessage('Species Required', 'Please enter a species name before previewing.');
                                    return;
                                }
                                setZeLoading(true);
                                setZePreview(null);
                                setZeResult(null);
                                setZeConflictResolutions({});
                                try {
                                    const fd = new FormData();
                                    if (zeAnimalsFile) fd.append('animals', zeAnimalsFile);
                                    if (zePairsFile) fd.append('breedingpairs', zePairsFile);
                                    fd.append('species', zeSpecies.trim());
                                    const resp = await axios.post(`${API_BASE_URL}/import/zooeasy`, fd, {
                                        headers: { Authorization: `Bearer ${authToken}` },
                                    });
                                    const preview = resp.data.preview || {};
                                    setZePreview(preview);
                                    // Select all animals by default
                                    setZeSelectedAnimals(new Set((preview.animals?.items || []).map(a => a.zeRegNum).filter(Boolean)));
                                    // Select non-duplicate litters by default
                                    setZeSelectedLitters(new Set((preview.litters?.items || []).filter(l => !l.isDuplicate).map(l => l.litterIndex)));
                                    setZeManualMappings({});
                                    setZeMappingSearch({ regNum: null, query: '', results: [], loading: false });
                                    // Default conflicts to 'use_existing' (keep CT ID for lineage, don't re-import)
                                    const defaults = {};
                                    for (const c of (preview.animals?.conflicts || [])) {
                                        defaults[c.zeRegNum] = 'use_existing';
                                    }
                                    setZeConflictResolutions(defaults);
                                } catch (err) {
                                    showModalMessage('ZooEasy Preview Failed', err.response?.data?.message || err.message);
                                } finally {
                                    setZeLoading(false);
                                }
                            }}
                            disabled={zeLoading}
                            className="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {zeLoading ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                            Preview Import
                        </button>
                    )}

                    {/* Preview */}
                    {zePreview && (
                        <div className="space-y-5 mt-3">

                            {/* Animals table */}
                            {zePreview.animals && (
                                <div>
                                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                        <h5 className="font-semibold text-gray-700">
                                            Animals &mdash; {zePreview.animals.total} total
                                            {zePreview.animals.conflicts?.length > 0 && (() => {
                                                const high = zePreview.animals.conflicts.filter(c => c.confidence !== 'possible').length;
                                                const possible = zePreview.animals.conflicts.filter(c => c.confidence === 'possible').length;
                                                return (
                                                    <span className="ml-2 text-xs font-normal">
                                                        {high > 0 && <span className="text-amber-600">{high} duplicate{high !== 1 ? 's' : ''}</span>}
                                                        {high > 0 && possible > 0 && <span className="text-gray-400"> ? </span>}
                                                        {possible > 0 && <span className="text-orange-500">{possible} possible match{possible !== 1 ? 'es' : ''}</span>}
                                                    </span>
                                                );
                                            })()}
                                        </h5>
                                        <div className="flex gap-2 text-xs flex-wrap">
                                            <button type="button"
                                                onClick={() => setZeSelectedAnimals(new Set((zePreview.animals.items || []).map(a => a.zeRegNum).filter(Boolean)))}
                                                className="px-2 py-1 border rounded bg-white hover:bg-gray-50 text-gray-600">Select all</button>
                                            <button type="button"
                                                onClick={() => setZeSelectedAnimals(new Set())}
                                                className="px-2 py-1 border rounded bg-white hover:bg-gray-50 text-gray-600">Deselect all</button>
                                            <span className="border-l mx-1"></span>
                                            <button type="button"
                                                onClick={() => { const conflictRegs = new Set((zePreview.animals.conflicts || []).map(c => c.zeRegNum)); setZeSelectedAnimals(new Set((zePreview.animals.items || []).filter(a => !conflictRegs.has(a.zeRegNum)).map(a => a.zeRegNum).filter(Boolean))); }}
                                                className="px-2 py-1 border rounded bg-white hover:bg-gray-50 text-green-700">New only</button>
                                            <button type="button"
                                                onClick={() => { const dupRegs = new Set((zePreview.animals.conflicts || []).filter(c => c.confidence !== 'possible').map(c => c.zeRegNum)); setZeSelectedAnimals(new Set((zePreview.animals.items || []).filter(a => dupRegs.has(a.zeRegNum)).map(a => a.zeRegNum).filter(Boolean))); }}
                                                className="px-2 py-1 border rounded bg-white hover:bg-gray-50 text-amber-700">Duplicates only</button>
                                            <button type="button"
                                                onClick={() => { const possRegs = new Set((zePreview.animals.conflicts || []).filter(c => c.confidence === 'possible').map(c => c.zeRegNum)); setZeSelectedAnimals(new Set((zePreview.animals.items || []).filter(a => possRegs.has(a.zeRegNum)).map(a => a.zeRegNum).filter(Boolean))); }}
                                                className="px-2 py-1 border rounded bg-white hover:bg-gray-50 text-orange-700">Possible only</button>
                                        </div>
                                    </div>
                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                            <table className="min-w-full text-xs">
                                                <thead className="bg-gray-100 sticky top-0 z-10">
                                                    <tr>
                                                        <th className="px-2 py-2 w-8"></th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Name</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Gender</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Born</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Reg #</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Sire #</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Dam #</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Color</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Coat</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y bg-white">
                                                    {(zePreview.animals.items || []).map(a => {
                                                        const isSelected = zeSelectedAnimals.has(a.zeRegNum);
                                                        const conflict = zePreview.animals.conflicts?.find(c => c.zeRegNum === a.zeRegNum);
                                                        const resolution = zeConflictResolutions[a.zeRegNum] || 'use_existing';
                                                        return (
                                                            <React.Fragment key={a.zeRegNum || a.name}>
                                                                <tr className={`transition ${!isSelected ? 'opacity-40 bg-gray-50' : conflict ? 'bg-amber-50' : ''}`}>
                                                                    <td className="px-2 py-1.5 text-center">
                                                                        <input type="checkbox" checked={isSelected}
                                                                            onChange={e => setZeSelectedAnimals(prev => {
                                                                                const next = new Set(prev);
                                                                                if (e.target.checked) next.add(a.zeRegNum); else next.delete(a.zeRegNum);
                                                                                return next;
                                                                            })}
                                                                            className="rounded" />
                                                                    </td>
                                                                    <td className="px-2 py-1.5 font-medium text-gray-800 whitespace-nowrap">{[a.prefix, a.name, a.suffix].filter(Boolean).join(' ')}</td>
                                                                    <td className="px-2 py-1.5 text-gray-600">{a.gender || '?'}</td>
                                                                    <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{a.birthDate || '?'}</td>
                                                                    <td className="px-2 py-1.5 font-mono text-gray-500">{a.zeRegNum || '?'}</td>
                                                                    <td className="px-2 py-1.5 font-mono text-gray-400">{a.sireRegNum || '?'}</td>
                                                                    <td className="px-2 py-1.5 font-mono text-gray-400">{a.damRegNum || '?'}</td>
                                                                    <td className="px-2 py-1.5 text-gray-600">{a.color || '?'}</td>
                                                                    <td className="px-2 py-1.5 text-gray-600">{a.coat || '?'}</td>
                                                                    <td className="px-2 py-1.5">
                                                                        {conflict
                                                                            ? conflict.confidence === 'possible'
                                                                                ? <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">Possible match</span>
                                                                                : <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">Duplicate</span>
                                                                            : zeManualMappings[a.zeRegNum]
                                                                                ? <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">Mapped</span>
                                                                                : <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">New</span>}
                                                                    </td>
                                                                </tr>
                                                                {/* Manual mapping sub-row for New/Mapped rows */}
                                                                {!conflict && isSelected && (
                                                                    <tr className={zeManualMappings[a.zeRegNum] ? 'bg-blue-50' : 'bg-gray-50'}>
                                                                        <td></td>
                                                                        <td colSpan="9" className="px-3 pb-2 pt-0">
                                                                            {zeManualMappings[a.zeRegNum] ? (
                                                                                <div className="flex items-center gap-2 text-xs pt-1">
                                                                                    <span className="text-blue-700">&#x21AA; Mapped to <span className="font-mono font-semibold">{zeManualMappings[a.zeRegNum].id_public}</span> &mdash; {zeManualMappings[a.zeRegNum].name}</span>
                                                                                    <button type="button" onClick={() => setZeManualMappings(prev => { const n = { ...prev }; delete n[a.zeRegNum]; return n; })}
                                                                                        className="text-gray-400 hover:text-red-500 transition ml-1" title="Remove mapping"><X size={11} /></button>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="pt-1">
                                                                                    {zeMappingSearch.regNum === a.zeRegNum ? (
                                                                                        <div className="flex flex-col gap-1.5">
                                                                                            <div className="flex items-center gap-1.5">
                                                                                                <input autoFocus type="text" placeholder="Search CT animal by name?"
                                                                                                    value={zeMappingSearch.query}
                                                                                                    onChange={async e => {
                                                                                                        const q = e.target.value;
                                                                                                        setZeMappingSearch(prev => ({ ...prev, query: q, loading: true, results: [] }));
                                                                                                        if (!q.trim()) { setZeMappingSearch(prev => ({ ...prev, loading: false })); return; }
                                                                                                        try {
                                                                                                            const [privateRes, publicRes] = await Promise.allSettled([
                                                                                                                axios.get(`${API_BASE_URL}/animals`, { params: { name: q }, headers: { Authorization: `Bearer ${authToken}` } }),
                                                                                                                axios.get(`${API_BASE_URL}/public/global/animals`, { params: { name: q, limit: 10 } }),
                                                                                                            ]);
                                                                                                            const own = privateRes.status === 'fulfilled' ? privateRes.value.data : [];
                                                                                                            const pub = publicRes.status === 'fulfilled' ? publicRes.value.data : [];
                                                                                                            const seen = new Set(own.map(a => a.id_public));
                                                                                                            const merged = [...own, ...pub.filter(a => !seen.has(a.id_public))];
                                                                                                            setZeMappingSearch(prev => ({ ...prev, results: merged.slice(0, 10), loading: false }));
                                                                                                        } catch { setZeMappingSearch(prev => ({ ...prev, loading: false })); }
                                                                                                    }}
                                                                                                    className="flex-1 max-w-xs text-xs border rounded px-2 py-1 focus:ring-primary focus:border-primary"
                                                                                                />
                                                                                                {zeMappingSearch.loading && <Loader2 size={11} className="animate-spin text-gray-400" />}
                                                                                                <button type="button" onClick={() => setZeMappingSearch({ regNum: null, query: '', results: [], loading: false })}
                                                                                                    className="text-gray-400 hover:text-gray-600"><X size={11} /></button>
                                                                                            </div>
                                                                                            {zeMappingSearch.results.length > 0 && (
                                                                                                <div className="border rounded bg-white shadow-sm divide-y max-w-sm max-h-40 overflow-y-auto">
                                                                                                    {zeMappingSearch.results.map(r => (
                                                                                                        <button key={r.id_public} type="button"
                                                                                                            onClick={() => {
                                                                                                                setZeManualMappings(prev => ({ ...prev, [a.zeRegNum]: { id_public: r.id_public, name: [r.prefix, r.name, r.suffix].filter(Boolean).join(' ') } }));
                                                                                                                setZeMappingSearch({ regNum: null, query: '', results: [], loading: false });
                                                                                                            }}
                                                                                                            className="w-full text-left px-2 py-1.5 hover:bg-blue-50 transition text-xs"
                                                                                                        >
                                                                                                            <span className="font-medium text-gray-800">{[r.prefix, r.name, r.suffix].filter(Boolean).join(' ')}</span>
                                                                                                            <span className="text-gray-400 ml-2 font-mono">{r.id_public}</span>
                                                                                                            {r.birthDate && <span className="text-gray-400 ml-1">&middot; {String(r.birthDate).slice(0,10)}</span>}
                                                                                                            {r.gender && <span className="text-gray-400 ml-1">&middot; {r.gender}</span>}
                                                                                                            {r.breederName && <span className="text-gray-300 ml-1">&middot; {r.breederName}</span>}
                                                                                                        </button>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <button type="button"
                                                                                            onClick={() => setZeMappingSearch({ regNum: a.zeRegNum, query: '', results: [], loading: false })}
                                                                                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                                                                        >
                                                                                            + Map to existing CT animal (for parent links)
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                {conflict && isSelected && (
                                                                    <tr className={`bg-${conflict.confidence === 'possible' ? 'orange' : 'amber'}-50`}>
                                                                        <td></td>
                                                                        <td colSpan="9" className="px-3 pb-2 pt-0">
                                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-amber-800 pt-1">
                                                                                <AlertTriangle size={11} className="shrink-0 text-amber-500" />
                                                                                <span>
                                                                                    {conflict.confidence === 'possible' ? 'Possible match: ' : 'Matches '}
                                                                                    <span className="font-mono">{conflict.existingId}</span>
                                                                                    {conflict.existingName && conflict.existingName !== conflict.name && <span> &ldquo;{conflict.existingName}&rdquo;</span>}
                                                                                    {conflict.existingBirthDate && <span> &middot; {conflict.existingBirthDate}</span>}
                                                                                    {' '}({conflict.isOwnedByImporter ? 'your animal' : `owned by ${conflict.existingOwner}`})
                                                                                    {' ? matched by '}{conflict.matchType === 'id' ? 'registration number' : conflict.matchType === 'name+birthDate' ? 'name + birth date' : 'name only'}
                                                                                </span>
                                                                                <select
                                                                                    value={resolution}
                                                                                    onChange={e => setZeConflictResolutions(prev => ({ ...prev, [a.zeRegNum]: e.target.value }))}
                                                                                    className="border rounded px-2 py-0.5 bg-white text-gray-700 font-medium text-xs"
                                                                                >
                                                                                    <option value="use_existing">Use existing CT animal for parent links (skip import)</option>
                                                                                    <option value="import_anyway">Import anyway as new entry</option>
                                                                                </select>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {zeSelectedAnimals.size} of {zePreview.animals.total} selected
                                        {(() => {
                                            const dupeLinks = [...zeSelectedAnimals].filter(r => {
                                                const c = zePreview.animals.conflicts?.find(x => x.zeRegNum === r);
                                                return c && (zeConflictResolutions[r] || 'use_existing') === 'use_existing';
                                            }).length;
                                            return dupeLinks > 0 ? ` \u00b7 ${dupeLinks} duplicate${dupeLinks !== 1 ? 's' : ''} will link to existing CT animals` : '';
                                        })()}
                                    </p>
                                </div>
                            )}

                            {/* Litters table */}
                            {zePreview.litters?.items?.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-semibold text-gray-700">Litters &mdash; {zePreview.litters.total} total</h5>
                                        <div className="flex gap-2 text-xs">
                                            <button type="button" onClick={() => setZeSelectedLitters(new Set(zePreview.litters.items.map(l => l.litterIndex)))} className="text-primary hover:underline">Select all</button>
                                            <button type="button" onClick={() => setZeSelectedLitters(new Set())} className="text-gray-400 hover:underline">Deselect all</button>
                                        </div>
                                    </div>
                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="overflow-x-auto max-h-48 overflow-y-auto">
                                            <table className="min-w-full text-xs">
                                                <thead className="bg-gray-100 sticky top-0">
                                                    <tr>
                                                        <th className="px-2 py-2"></th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Nest letter</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Mating date</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Birth date</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Sire</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Dam</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Born count</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y bg-white">
                                                    {zePreview.litters.items.map((l, i) => {
                                                        const isSelected = zeSelectedLitters.has(l.litterIndex);
                                                        return (
                                                            <tr key={i} className={`transition ${!isSelected ? 'opacity-40 bg-gray-50' : l.isDuplicate ? 'bg-amber-50' : ''}`}>
                                                                <td className="px-2 py-1.5 text-center">
                                                                    <input type="checkbox" checked={isSelected}
                                                                        onChange={e => setZeSelectedLitters(prev => {
                                                                            const next = new Set(prev);
                                                                            if (e.target.checked) next.add(l.litterIndex); else next.delete(l.litterIndex);
                                                                            return next;
                                                                        })}
                                                                        className="rounded" />
                                                                </td>
                                                                <td className="px-2 py-1.5 font-medium text-gray-700">{l.nestLetter || '?'}</td>
                                                                <td className="px-2 py-1.5 text-gray-600">{l.matingDate ? String(l.matingDate).slice(0,10) : '?'}</td>
                                                                <td className="px-2 py-1.5 text-gray-600">{l.birthDate ? String(l.birthDate).slice(0,10) : '?'}</td>
                                                                <td className="px-2 py-1.5 text-gray-700" title={l.maleRegNum || ''}>
                                                                    {l.maleName || l.maleRegNum || '?'}
                                                                    {l.maleCtId && <span className="ml-1.5 px-1 py-0.5 text-xs font-mono bg-green-100 text-green-700 rounded">{l.maleCtId}</span>}
                                                                    {!l.maleCtId && l.maleRegNum && <span className="ml-1.5 px-1 py-0.5 text-xs bg-gray-100 text-gray-400 rounded">no CT match</span>}
                                                                </td>
                                                                <td className="px-2 py-1.5 text-gray-700" title={l.femaleRegNum || ''}>
                                                                    {l.femaleName || l.femaleRegNum || '?'}
                                                                    {l.femaleCtId && <span className="ml-1.5 px-1 py-0.5 text-xs font-mono bg-green-100 text-green-700 rounded">{l.femaleCtId}</span>}
                                                                    {!l.femaleCtId && l.femaleRegNum && <span className="ml-1.5 px-1 py-0.5 text-xs bg-gray-100 text-gray-400 rounded">no CT match</span>}
                                                                </td>
                                                                <td className="px-2 py-1.5 text-gray-600">{l.litterSizeBorn != null ? l.litterSizeBorn : '?'}</td>
                                                                <td className="px-2 py-1.5">
                                                                    {l.isDuplicate
                                                                        ? <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium" title={l.existingLitterId || ''}>Duplicate</span>
                                                                        : <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">New</span>}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={async () => {
                                        setZeConfirmLoading(true);
                                        try {
                                            const fd = new FormData();
                                            if (zeAnimalsFile) fd.append('animals', zeAnimalsFile);
                                            if (zePairsFile) fd.append('breedingpairs', zePairsFile);
                                            fd.append('species', zeSpecies.trim());
                                            fd.append('confirm', 'true');
                                            fd.append('selectedAnimals', JSON.stringify([...zeSelectedAnimals]));
                                            fd.append('selectedLitters', JSON.stringify([...zeSelectedLitters]));
                                            // Merge manual mappings into conflictResolutions as map_to:<id>
                                            const finalResolutions = { ...zeConflictResolutions };
                                            for (const [regNum, mapping] of Object.entries(zeManualMappings)) {
                                                finalResolutions[regNum] = `map_to:${mapping.id_public}`;
                                            }
                                            fd.append('conflictResolutions', JSON.stringify(finalResolutions));
                                            const resp = await axios.post(`${API_BASE_URL}/import/zooeasy`, fd, {
                                                headers: { Authorization: `Bearer ${authToken}` },
                                            });
                                            setZeResult(resp.data);
                                            setZePreview(null);
                                            setZeAnimalsFile(null);
                                            setZePairsFile(null);
                                        } catch (err) {
                                            showModalMessage('ZooEasy Import Failed', err.response?.data?.message || err.message);
                                        } finally {
                                            setZeConfirmLoading(false);
                                        }
                                    }}
                                    disabled={zeConfirmLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {zeConfirmLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                    Confirm Import
                                </button>
                                <button
                                    onClick={() => { setZePreview(null); setZeAnimalsFile(null); setZePairsFile(null); setZeManualMappings({}); setZeMappingSearch({ regNum: null, query: '', results: [], loading: false }); setZeSelectedLitters(new Set()); }}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {zeResult && (
                        <div className="mt-3 p-4 rounded-lg border bg-green-50 border-green-200">
                            <p className="font-semibold text-green-800 flex items-center gap-1.5 mb-2"><CheckCircle size={16} /> ZooEasy import complete</p>
                            <div className="text-sm text-gray-700 space-y-0.5 mb-2">
                                {zeResult.written && Object.entries(zeResult.written).map(([s, n]) => (
                                    <p key={s}><span className="capitalize font-medium">{s}</span>: {n} imported{zeResult.skipped?.[s] ? `, ${zeResult.skipped[s]} skipped (duplicates)` : ''}</p>
                                ))}
                            </div>
                            {zeResult.errors?.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm font-semibold text-red-700 flex items-center gap-1"><AlertTriangle size={13} /> {zeResult.errors.length} error(s):</p>
                                    <ul className="text-xs text-red-600 list-disc list-inside mt-1 space-y-0.5 max-h-32 overflow-y-auto">
                                        {zeResult.errors.map((e, i) => (
                                            <li key={i}>[{e.section}] {e.id}: {e.error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <button onClick={() => setZeResult(null)} className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline">Dismiss</button>
                        </div>
                    )}
                </div>

                {/* -- Kintraks Import --------------------------------------- */}
                <div className="border-t pt-5">
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center gap-2"><Upload size={16} /> Import from Kintraks</h4>
                    <p className="text-xs text-gray-500 mb-4">Export your animals (Export) and breeding records (Breeding Record - All Records) from Kintraks as CSV, then upload them here.</p>

                    {/* Species */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Species <span className="text-red-500">*</span> (required when importing animals)</label>
                        <div className="flex items-center gap-2 max-w-xs">
                            <select
                                value={ktkSpecies}
                                onChange={e => setKtkSpecies(e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary bg-white"
                            >
                                <option value="">? select species ?</option>
                                {(zeSpeciesList || []).map(s => (
                                    <option key={s.name} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                title="Add new species"
                                onClick={() => { setKtkAddingSpecies(v => !v); setKtkNewSpeciesName(''); }}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600 transition"
                            >
                                <Plus size={15} />
                            </button>
                        </div>
                        {ktkAddingSpecies && (
                            <div className="flex items-center gap-2 mt-2 max-w-xs">
                                <input
                                    type="text"
                                    placeholder="New species name"
                                    value={ktkNewSpeciesName}
                                    onChange={e => setKtkNewSpeciesName(e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
                                    onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                                />
                                <button
                                    type="button"
                                    disabled={!ktkNewSpeciesName.trim()}
                                    onClick={async () => {
                                        const name = ktkNewSpeciesName.trim();
                                        if (!name) return;
                                        try {
                                            const resp = await axios.post(`${API_BASE_URL}/species`,
                                                { name, category: 'Mammal' },
                                                { headers: { Authorization: `Bearer ${authToken}` } }
                                            );
                                            const added = resp.data.species;
                                            setZeSpeciesList(prev => [...prev, added]);
                                            setKtkSpecies(added.name);
                                            setKtkAddingSpecies(false);
                                            setKtkNewSpeciesName('');
                                        } catch (err) {
                                            if (err.response?.status === 409) {
                                                const existing = err.response.data.existing?.name || name;
                                                setKtkSpecies(existing);
                                                setKtkAddingSpecies(false);
                                            } else {
                                                showModalMessage('Error', err.response?.data?.message || 'Failed to add species.');
                                            }
                                        }
                                    }}
                                    className="px-3 py-2 bg-primary hover:bg-primary-dark text-black text-xs font-bold rounded-lg transition disabled:opacity-40"
                                >
                                    Add
                                </button>
                                <button type="button" onClick={() => setKtkAddingSpecies(false)} className="p-2 text-gray-400 hover:text-gray-600 transition">
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* File pickers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {[['animals', ktkAnimalsFile, setKtkAnimalsFile, 'Animals CSV (Export_*.csv)'],
                          ['breedingrecords', ktkBreedingFile, setKtkBreedingFile, 'Breeding Records CSV']].map(
                            ([key, file, setter, label]) => (
                                <label key={key} className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition relative">
                                    <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        onChange={e => { setter(e.target.files?.[0] || null); setKtkPreview(null); setKtkResult(null); }} />
                                    {file
                                        ? <p className="text-xs font-medium text-gray-700 flex items-center gap-1"><FileText size={13} />{file.name}</p>
                                        : <><Upload size={16} className="text-gray-400 mb-1" /><p className="text-xs text-gray-500 text-center px-2">{label}</p></>
                                    }
                                </label>
                            )
                        )}
                    </div>

                    {(ktkAnimalsFile || ktkBreedingFile) && !ktkPreview && !ktkResult && (
                        <button
                            onClick={async () => {
                                if (ktkAnimalsFile && !ktkSpecies.trim()) {
                                    showModalMessage('Species Required', 'Please select a species before previewing.');
                                    return;
                                }
                                setKtkLoading(true);
                                setKtkPreview(null);
                                setKtkResult(null);
                                setKtkConflictResolutions({});
                                try {
                                    const fd = new FormData();
                                    if (ktkAnimalsFile) fd.append('animals', ktkAnimalsFile);
                                    if (ktkBreedingFile) fd.append('breedingrecords', ktkBreedingFile);
                                    fd.append('species', ktkSpecies.trim());
                                    const resp = await axios.post(`${API_BASE_URL}/import/kintraks`, fd, {
                                        headers: { Authorization: `Bearer ${authToken}` },
                                    });
                                    const preview = resp.data.preview || {};
                                    setKtkPreview(preview);
                                    setKtkSelectedAnimals(new Set((preview.animals?.items || []).map(a => a.registration || a.kintrakId).filter(Boolean)));
                                    setKtkSelectedLitters(new Set((preview.litters?.items || []).map(l => l.litterIndex)));
                                    setKtkManualMappings({});
                                    setKtkMappingSearch({ registration: null, query: '', results: [], loading: false });
                                    const defaults = {};
                                    for (const c of (preview.animals?.conflicts || [])) {
                                        defaults[c.registration || c.kintrakId] = 'use_existing';
                                    }
                                    setKtkConflictResolutions(defaults);
                                } catch (err) {
                                    showModalMessage('Kintraks Preview Failed', err.response?.data?.message || err.message);
                                } finally {
                                    setKtkLoading(false);
                                }
                            }}
                            disabled={ktkLoading}
                            className="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {ktkLoading ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                            Preview Import
                        </button>
                    )}

                    {/* Preview */}
                    {ktkPreview && (
                        <div className="space-y-5 mt-3">

                            {/* Animals table */}
                            {ktkPreview.animals && (
                                <div>
                                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                        <h5 className="font-semibold text-gray-700">
                                            Animals &mdash; {ktkPreview.animals.total} total
                                            {ktkPreview.animals.conflicts?.length > 0 && (() => {
                                                const high     = ktkPreview.animals.conflicts.filter(c => c.confidence !== 'possible').length;
                                                const possible = ktkPreview.animals.conflicts.filter(c => c.confidence === 'possible').length;
                                                return (
                                                    <span className="ml-2 text-xs font-normal">
                                                        {high > 0 && <span className="text-amber-600">{high} duplicate{high !== 1 ? 's' : ''}</span>}
                                                        {high > 0 && possible > 0 && <span className="text-gray-400"> ? </span>}
                                                        {possible > 0 && <span className="text-orange-500">{possible} possible match{possible !== 1 ? 'es' : ''}</span>}
                                                    </span>
                                                );
                                            })()}
                                        </h5>
                                        <div className="flex gap-2 text-xs flex-wrap">
                                            <button type="button"
                                                onClick={() => setKtkSelectedAnimals(new Set((ktkPreview.animals.items || []).map(a => a.registration || a.kintrakId).filter(Boolean)))}
                                                className="px-2 py-1 border rounded bg-white hover:bg-gray-50 text-gray-600">Select all</button>
                                            <button type="button"
                                                onClick={() => setKtkSelectedAnimals(new Set())}
                                                className="px-2 py-1 border rounded bg-white hover:bg-gray-50 text-gray-600">Deselect all</button>
                                            <span className="border-l mx-1"></span>
                                            <button type="button"
                                                onClick={() => { const conflictKtIds = new Set((ktkPreview.animals.conflicts || []).map(c => c.kintrakId)); setKtkSelectedAnimals(new Set((ktkPreview.animals.items || []).filter(a => !conflictKtIds.has(a.kintrakId)).map(a => a.registration || a.kintrakId).filter(Boolean))); }}
                                                className="px-2 py-1 border rounded bg-white hover:bg-gray-50 text-green-700">New only</button>
                                            <button type="button"
                                                onClick={() => { const dupKtIds = new Set((ktkPreview.animals.conflicts || []).filter(c => c.confidence !== 'possible').map(c => c.kintrakId)); setKtkSelectedAnimals(new Set((ktkPreview.animals.items || []).filter(a => dupKtIds.has(a.kintrakId)).map(a => a.registration || a.kintrakId).filter(Boolean))); }}
                                                className="px-2 py-1 border rounded bg-white hover:bg-gray-50 text-amber-700">Duplicates only</button>
                                            <button type="button"
                                                onClick={() => { const possKtIds = new Set((ktkPreview.animals.conflicts || []).filter(c => c.confidence === 'possible').map(c => c.kintrakId)); setKtkSelectedAnimals(new Set((ktkPreview.animals.items || []).filter(a => possKtIds.has(a.kintrakId)).map(a => a.registration || a.kintrakId).filter(Boolean))); }}
                                                className="px-2 py-1 border rounded bg-white hover:bg-gray-50 text-orange-700">Possible only</button>
                                        </div>
                                    </div>
                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                            <table className="min-w-full text-xs">
                                                <thead className="bg-gray-100 sticky top-0 z-10">
                                                    <tr>
                                                        <th className="px-2 py-2 w-8"></th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Name</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Gender</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Born</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Reg #</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Color</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Coat</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y bg-white">
                                                    {(ktkPreview.animals.items || []).map(a => {
                                                        const aKey = a.registration || a.kintrakId;
                                                        const isSelected = ktkSelectedAnimals.has(aKey);
                                                        const conflict   = ktkPreview.animals.conflicts?.find(c => c.kintrakId === a.kintrakId);
                                                        const resolution = ktkConflictResolutions[aKey] || 'use_existing';
                                                        return (
                                                            <React.Fragment key={aKey}>
                                                                <tr className={`transition ${!isSelected ? 'opacity-40 bg-gray-50' : conflict ? (conflict.confidence === 'possible' ? 'bg-orange-50' : 'bg-amber-50') : ''}`}>
                                                                    <td className="px-2 py-1.5 text-center">
                                                                        <input type="checkbox" checked={isSelected}
                                                                            onChange={e => setKtkSelectedAnimals(prev => {
                                                                                const next = new Set(prev);
                                                                                if (e.target.checked) next.add(aKey); else next.delete(aKey);
                                                                                return next;
                                                                            })}
                                                                            className="rounded" />
                                                                    </td>
                                                                    <td className="px-2 py-1.5 font-medium text-gray-800 whitespace-nowrap">{[a.prefix, a.name, a.suffix].filter(Boolean).join(' ')}</td>
                                                                    <td className="px-2 py-1.5 text-gray-600">{a.gender || '?'}</td>
                                                                    <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{a.birthDate ? String(a.birthDate).slice(0,10) : '?'}</td>
                                                                    <td className="px-2 py-1.5 font-mono text-gray-500">{a.registration || '?'}</td>
                                                                    <td className="px-2 py-1.5 text-gray-600">{a.color || '?'}</td>
                                                                    <td className="px-2 py-1.5 text-gray-600">{a.coat || '?'}</td>
                                                                    <td className="px-2 py-1.5">
                                                                        {conflict
                                                                            ? conflict.confidence === 'possible'
                                                                                ? <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">Possible match</span>
                                                                                : <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">Duplicate</span>
                                                                            : ktkManualMappings[aKey]
                                                                                ? <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">Mapped</span>
                                                                                : <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">New</span>}
                                                                    </td>
                                                                </tr>
                                                                {/* Manual mapping sub-row for New/Mapped rows */}
                                                                {!conflict && isSelected && (
                                                                    <tr className={ktkManualMappings[aKey] ? 'bg-blue-50' : 'bg-gray-50'}>
                                                                        <td></td>
                                                                        <td colSpan="7" className="px-3 pb-2 pt-0">
                                                                            {ktkManualMappings[aKey] ? (
                                                                                <div className="flex items-center gap-2 text-xs pt-1">
                                                                                    <span className="text-blue-700">&#x21AA; Mapped to <span className="font-mono font-semibold">{ktkManualMappings[aKey].id_public}</span> &mdash; {ktkManualMappings[aKey].name}</span>
                                                                                    <button type="button" onClick={() => setKtkManualMappings(prev => { const n = { ...prev }; delete n[aKey]; return n; })}
                                                                                        className="text-gray-400 hover:text-red-500 transition ml-1" title="Remove mapping"><X size={11} /></button>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="pt-1">
                                                                                    {ktkMappingSearch.registration === aKey ? (
                                                                                        <div className="flex flex-col gap-1.5">
                                                                                            <div className="flex items-center gap-1.5">
                                                                                                <input autoFocus type="text" placeholder="Search CT animal by name?"
                                                                                                    value={ktkMappingSearch.query}
                                                                                                    onChange={async e => {
                                                                                                        const q = e.target.value;
                                                                                                        setKtkMappingSearch(prev => ({ ...prev, query: q, loading: true, results: [] }));
                                                                                                        if (!q.trim()) { setKtkMappingSearch(prev => ({ ...prev, loading: false })); return; }
                                                                                                        try {
                                                                                                            const [privateRes, publicRes] = await Promise.allSettled([
                                                                                                                axios.get(`${API_BASE_URL}/animals`, { params: { name: q }, headers: { Authorization: `Bearer ${authToken}` } }),
                                                                                                                axios.get(`${API_BASE_URL}/public/global/animals`, { params: { name: q, limit: 10 } }),
                                                                                                            ]);
                                                                                                            const own = privateRes.status === 'fulfilled' ? privateRes.value.data : [];
                                                                                                            const pub = publicRes.status === 'fulfilled' ? publicRes.value.data : [];
                                                                                                            const seen = new Set(own.map(x => x.id_public));
                                                                                                            const merged = [...own, ...pub.filter(x => !seen.has(x.id_public))];
                                                                                                            setKtkMappingSearch(prev => ({ ...prev, results: merged.slice(0, 10), loading: false }));
                                                                                                        } catch { setKtkMappingSearch(prev => ({ ...prev, loading: false })); }
                                                                                                    }}
                                                                                                    className="flex-1 max-w-xs text-xs border rounded px-2 py-1 focus:ring-primary focus:border-primary"
                                                                                                />
                                                                                                {ktkMappingSearch.loading && <Loader2 size={11} className="animate-spin text-gray-400" />}
                                                                                                <button type="button" onClick={() => setKtkMappingSearch({ registration: null, query: '', results: [], loading: false })}
                                                                                                    className="text-gray-400 hover:text-gray-600"><X size={11} /></button>
                                                                                            </div>
                                                                                            {ktkMappingSearch.results.length > 0 && (
                                                                                                <div className="border rounded bg-white shadow-sm divide-y max-w-sm max-h-40 overflow-y-auto">
                                                                                                    {ktkMappingSearch.results.map(r => (
                                                                                                        <button key={r.id_public} type="button"
                                                                                                            onClick={() => {
                                                                                                                setKtkManualMappings(prev => ({ ...prev, [aKey]: { id_public: r.id_public, name: [r.prefix, r.name, r.suffix].filter(Boolean).join(' ') } }));
                                                                                                                setKtkMappingSearch({ registration: null, query: '', results: [], loading: false });
                                                                                                            }}
                                                                                                            className="w-full text-left px-2 py-1.5 hover:bg-blue-50 transition text-xs"
                                                                                                        >
                                                                                                            <span className="font-medium text-gray-800">{[r.prefix, r.name, r.suffix].filter(Boolean).join(' ')}</span>
                                                                                                            <span className="text-gray-400 ml-2 font-mono">{r.id_public}</span>
                                                                                                            {r.birthDate && <span className="text-gray-400 ml-1">&middot; {String(r.birthDate).slice(0,10)}</span>}
                                                                                                            {r.gender && <span className="text-gray-400 ml-1">&middot; {r.gender}</span>}
                                                                                                            {r.breederName && <span className="text-gray-300 ml-1">&middot; {r.breederName}</span>}
                                                                                                        </button>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <button type="button"
                                                                                            onClick={() => setKtkMappingSearch({ registration: aKey, query: '', results: [], loading: false })}
                                                                                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                                                                        >
                                                                                            + Map to existing CT animal (for parent links)
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                {conflict && isSelected && (
                                                                    <tr className={`bg-${conflict.confidence === 'possible' ? 'orange' : 'amber'}-50`}>
                                                                        <td></td>
                                                                        <td colSpan="7" className="px-3 pb-2 pt-0">
                                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-amber-800 pt-1">
                                                                                <AlertTriangle size={11} className="shrink-0 text-amber-500" />
                                                                                <span>
                                                                                    {conflict.confidence === 'possible' ? 'Possible match: ' : 'Matches '}
                                                                                    <span className="font-mono">{conflict.existingId}</span>
                                                                                    {conflict.existingName && conflict.existingName !== conflict.name && <span> &ldquo;{conflict.existingName}&rdquo;</span>}
                                                                                    {conflict.existingBirthDate && <span> &middot; {conflict.existingBirthDate}</span>}
                                                                                    {' '}({conflict.isOwnedByImporter ? 'your animal' : `owned by ${conflict.existingOwner}`})
                                                                                    {' ? matched by '}{conflict.matchType === 'id' ? 'registration number' : conflict.matchType === 'name+birthDate' ? 'name + birth date' : 'name only'}
                                                                                </span>
                                                                                <select
                                                                                    value={resolution}
                                                                                    onChange={e => setKtkConflictResolutions(prev => ({ ...prev, [aKey]: e.target.value }))}
                                                                                    className="border rounded px-2 py-0.5 bg-white text-gray-700 font-medium text-xs"
                                                                                >
                                                                                    <option value="use_existing">Use existing CT animal for parent links (skip import)</option>
                                                                                    <option value="import_anyway">Import anyway as new entry</option>
                                                                                </select>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {ktkSelectedAnimals.size} of {ktkPreview.animals.total} selected
                                        {(() => {
                                            const dupeLinks = [...ktkSelectedAnimals].filter(r => {
                                                const c = ktkPreview.animals.conflicts?.find(x => (x.registration || x.kintrakId) === r);
                                                return c && (ktkConflictResolutions[r] || 'use_existing') === 'use_existing';
                                            }).length;
                                            return dupeLinks > 0 ? ` · ${dupeLinks} duplicate${dupeLinks !== 1 ? 's' : ''} will link to existing CT animals` : '';
                                        })()}
                                    </p>
                                </div>
                            )}

                            {/* Litters table */}
                            {ktkPreview.litters?.items?.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-semibold text-gray-700">Breeding Records &mdash; {ktkPreview.litters.total} total</h5>
                                        <div className="flex gap-2 text-xs">
                                            <button type="button" onClick={() => setKtkSelectedLitters(new Set(ktkPreview.litters.items.map(l => l.litterIndex)))} className="text-primary hover:underline">Select all</button>
                                            <button type="button" onClick={() => setKtkSelectedLitters(new Set())} className="text-gray-400 hover:underline">Deselect all</button>
                                        </div>
                                    </div>
                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="overflow-x-auto max-h-48 overflow-y-auto">
                                            <table className="min-w-full text-xs">
                                                <thead className="bg-gray-100 sticky top-0">
                                                    <tr>
                                                        <th className="px-2 py-2"></th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Nest letter</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Mating date</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Birth date</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Weaning date</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Sire</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Dam</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Born count</th>
                                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y bg-white">
                                                    {ktkPreview.litters.items.map((l, i) => {
                                                        const isSelected = ktkSelectedLitters.has(l.litterIndex);
                                                        const lm = ktkLitterMappings[l.litterIndex] || {};
                                                        const effectiveSireId = lm.sire?.id_public || l.maleCtId;
                                                        const effectiveDamId  = lm.dam?.id_public  || l.femaleCtId;
                                                        const showSubRow = isSelected && ((!l.maleCtId && !l.sireInThisImport && l.sireName) || (!l.femaleCtId && !l.damInThisImport && l.damName) || lm.sire || lm.dam);
                                                        return (
                                                            <React.Fragment key={i}>
                                                            <tr className={`transition ${!isSelected ? 'opacity-40 bg-gray-50' : l.isDuplicate ? 'bg-amber-50' : ''}`}>
                                                                <td className="px-2 py-1.5 text-center">
                                                                    <input type="checkbox" checked={isSelected}
                                                                        onChange={e => setKtkSelectedLitters(prev => {
                                                                            const next = new Set(prev);
                                                                            if (e.target.checked) next.add(l.litterIndex); else next.delete(l.litterIndex);
                                                                            return next;
                                                                        })}
                                                                        className="rounded" />
                                                                </td>
                                                                <td className="px-2 py-1.5 font-medium text-gray-700">{l.nestLetter || '?'}</td>
                                                                <td className="px-2 py-1.5 text-gray-600">{l.matingDate ? String(l.matingDate).slice(0,10) : '?'}</td>
                                                                <td className="px-2 py-1.5 text-gray-600">{l.birthDate ? String(l.birthDate).slice(0,10) : '?'}</td>
                                                                <td className="px-2 py-1.5 text-gray-600">{l.weaningDate ? String(l.weaningDate).slice(0,10) : '?'}</td>
                                                                <td className="px-2 py-1.5 text-gray-700">
                                                                    {l.sirePrefix && <span className="text-gray-400 mr-0.5">({l.sirePrefix})</span>}{l.sireName || '?'}
                                                                    {effectiveSireId && <span className="ml-1.5 px-1 py-0.5 text-xs font-mono bg-green-100 text-green-700 rounded">{effectiveSireId}</span>}
                                                                    {!effectiveSireId && l.sireInThisImport && <span className="ml-1.5 px-1 py-0.5 text-xs bg-blue-100 text-blue-600 rounded" title="Will be linked after import">in this import</span>}
                                                                    {!effectiveSireId && !l.sireInThisImport && l.sireName && <span className="ml-1.5 px-1 py-0.5 text-xs bg-gray-100 text-gray-400 rounded">no CT match</span>}
                                                                </td>
                                                                <td className="px-2 py-1.5 text-gray-700">
                                                                    {l.damPrefix && <span className="text-gray-400 mr-0.5">({l.damPrefix})</span>}{l.damName || '?'}
                                                                    {effectiveDamId && <span className="ml-1.5 px-1 py-0.5 text-xs font-mono bg-green-100 text-green-700 rounded">{effectiveDamId}</span>}
                                                                    {!effectiveDamId && l.damInThisImport && <span className="ml-1.5 px-1 py-0.5 text-xs bg-blue-100 text-blue-600 rounded" title="Will be linked after import">in this import</span>}
                                                                    {!effectiveDamId && !l.damInThisImport && l.damName && <span className="ml-1.5 px-1 py-0.5 text-xs bg-gray-100 text-gray-400 rounded">no CT match</span>}
                                                                </td>
                                                                <td className="px-2 py-1.5 text-gray-600">{l.litterSizeBorn != null ? l.litterSizeBorn : '?'}</td>
                                                                <td className="px-2 py-1.5">
                                                                    {l.isDuplicate
                                                                        ? <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium" title={l.existingLitterId || ''}>Duplicate</span>
                                                                        : <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">New</span>}
                                                                </td>
                                                            </tr>
                                                            {showSubRow && (
                                                                <tr className="bg-blue-50 border-b">
                                                                    <td colSpan="9" className="px-4 pb-2 pt-1">
                                                                        <div className="flex flex-wrap gap-4">
                                                                            {/* Sire mapping */}
                                                                            {((!l.maleCtId && !l.sireInThisImport && l.sireName) || lm.sire) && (
                                                                                <div className="flex items-center gap-1.5 text-xs">
                                                                                    <span className="font-medium text-gray-500 min-w-[28px]">Sire:</span>
                                                                                    {lm.sire ? (
                                                                                        <>
                                                                                            <span className="text-blue-700">&#x21AA; <span className="font-mono font-semibold">{lm.sire.id_public}</span> &mdash; {lm.sire.name}</span>
                                                                                            <button type="button" onClick={() => setKtkLitterMappings(prev => { const n = { ...prev }; const e = { ...n[l.litterIndex] }; delete e.sire; n[l.litterIndex] = e; return n; })} className="text-gray-400 hover:text-red-500 transition" title="Remove mapping"><X size={11} /></button>
                                                                                        </>
                                                                                    ) : ktkLitterMappingSearch.litterIndex === l.litterIndex && ktkLitterMappingSearch.side === 'sire' ? (
                                                                                        <div className="flex flex-col gap-1">
                                                                                            <div className="flex items-center gap-1">
                                                                                                <input autoFocus type="text" placeholder="Search CT animal?"
                                                                                                    value={ktkLitterMappingSearch.query}
                                                                                                    onChange={async e => {
                                                                                                        const q = e.target.value;
                                                                                                        setKtkLitterMappingSearch(prev => ({ ...prev, query: q, loading: true, results: [] }));
                                                                                                        if (!q.trim()) { setKtkLitterMappingSearch(prev => ({ ...prev, loading: false })); return; }
                                                                                                        try {
                                                                                                            const [pr, pub] = await Promise.allSettled([
                                                                                                                axios.get(`${API_BASE_URL}/animals`, { params: { name: q }, headers: { Authorization: `Bearer ${authToken}` } }),
                                                                                                                axios.get(`${API_BASE_URL}/public/global/animals`, { params: { name: q, limit: 10 } }),
                                                                                                            ]);
                                                                                                            const own = pr.status === 'fulfilled' ? pr.value.data : [];
                                                                                                            const pub2 = pub.status === 'fulfilled' ? pub.value.data : [];
                                                                                                            const seen = new Set(own.map(x => x.id_public));
                                                                                                            setKtkLitterMappingSearch(prev => ({ ...prev, results: [...own, ...pub2.filter(x => !seen.has(x.id_public))].slice(0, 10), loading: false }));
                                                                                                        } catch { setKtkLitterMappingSearch(prev => ({ ...prev, loading: false })); }
                                                                                                    }}
                                                                                                    className="text-xs border rounded px-2 py-1 focus:ring-primary focus:border-primary w-48"
                                                                                                />
                                                                                                {ktkLitterMappingSearch.loading && <Loader2 size={11} className="animate-spin text-gray-400" />}
                                                                                                <button type="button" onClick={() => setKtkLitterMappingSearch({ litterIndex: null, side: null, query: '', results: [], loading: false })} className="text-gray-400 hover:text-gray-600"><X size={11} /></button>
                                                                                            </div>
                                                                                            {ktkLitterMappingSearch.results.length > 0 && (
                                                                                                <div className="border rounded bg-white shadow-sm divide-y max-w-xs max-h-36 overflow-y-auto">
                                                                                                    {ktkLitterMappingSearch.results.map(r => (
                                                                                                        <button key={r.id_public} type="button"
                                                                                                            onClick={() => {
                                                                                                                setKtkLitterMappings(prev => ({ ...prev, [l.litterIndex]: { ...prev[l.litterIndex], sire: { id_public: r.id_public, name: [r.prefix, r.name, r.suffix].filter(Boolean).join(' ') } } }));
                                                                                                                setKtkLitterMappingSearch({ litterIndex: null, side: null, query: '', results: [], loading: false });
                                                                                                            }}
                                                                                                            className="w-full text-left px-2 py-1.5 hover:bg-blue-50 text-xs"
                                                                                                        >
                                                                                                            <span className="font-medium text-gray-800">{[r.prefix, r.name, r.suffix].filter(Boolean).join(' ')}</span>
                                                                                                            <span className="text-gray-400 ml-2 font-mono">{r.id_public}</span>
                                                                                                            {r.birthDate && <span className="text-gray-400 ml-1">&middot; {String(r.birthDate).slice(0,10)}</span>}
                                                                                                            {r.gender && <span className="text-gray-400 ml-1">&middot; {r.gender}</span>}
                                                                                                        </button>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <button type="button" onClick={() => setKtkLitterMappingSearch({ litterIndex: l.litterIndex, side: 'sire', query: '', results: [], loading: false })} className="text-xs text-blue-600 hover:text-blue-800 hover:underline">+ Map to CT animal</button>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                            {/* Dam mapping */}
                                                                            {((!l.femaleCtId && !l.damInThisImport && l.damName) || lm.dam) && (
                                                                                <div className="flex items-center gap-1.5 text-xs">
                                                                                    <span className="font-medium text-gray-500 min-w-[28px]">Dam:</span>
                                                                                    {lm.dam ? (
                                                                                        <>
                                                                                            <span className="text-blue-700">&#x21AA; <span className="font-mono font-semibold">{lm.dam.id_public}</span> &mdash; {lm.dam.name}</span>
                                                                                            <button type="button" onClick={() => setKtkLitterMappings(prev => { const n = { ...prev }; const e = { ...n[l.litterIndex] }; delete e.dam; n[l.litterIndex] = e; return n; })} className="text-gray-400 hover:text-red-500 transition" title="Remove mapping"><X size={11} /></button>
                                                                                        </>
                                                                                    ) : ktkLitterMappingSearch.litterIndex === l.litterIndex && ktkLitterMappingSearch.side === 'dam' ? (
                                                                                        <div className="flex flex-col gap-1">
                                                                                            <div className="flex items-center gap-1">
                                                                                                <input autoFocus type="text" placeholder="Search CT animal?"
                                                                                                    value={ktkLitterMappingSearch.query}
                                                                                                    onChange={async e => {
                                                                                                        const q = e.target.value;
                                                                                                        setKtkLitterMappingSearch(prev => ({ ...prev, query: q, loading: true, results: [] }));
                                                                                                        if (!q.trim()) { setKtkLitterMappingSearch(prev => ({ ...prev, loading: false })); return; }
                                                                                                        try {
                                                                                                            const [pr, pub] = await Promise.allSettled([
                                                                                                                axios.get(`${API_BASE_URL}/animals`, { params: { name: q }, headers: { Authorization: `Bearer ${authToken}` } }),
                                                                                                                axios.get(`${API_BASE_URL}/public/global/animals`, { params: { name: q, limit: 10 } }),
                                                                                                            ]);
                                                                                                            const own = pr.status === 'fulfilled' ? pr.value.data : [];
                                                                                                            const pub2 = pub.status === 'fulfilled' ? pub.value.data : [];
                                                                                                            const seen = new Set(own.map(x => x.id_public));
                                                                                                            setKtkLitterMappingSearch(prev => ({ ...prev, results: [...own, ...pub2.filter(x => !seen.has(x.id_public))].slice(0, 10), loading: false }));
                                                                                                        } catch { setKtkLitterMappingSearch(prev => ({ ...prev, loading: false })); }
                                                                                                    }}
                                                                                                    className="text-xs border rounded px-2 py-1 focus:ring-primary focus:border-primary w-48"
                                                                                                />
                                                                                                {ktkLitterMappingSearch.loading && <Loader2 size={11} className="animate-spin text-gray-400" />}
                                                                                                <button type="button" onClick={() => setKtkLitterMappingSearch({ litterIndex: null, side: null, query: '', results: [], loading: false })} className="text-gray-400 hover:text-gray-600"><X size={11} /></button>
                                                                                            </div>
                                                                                            {ktkLitterMappingSearch.results.length > 0 && (
                                                                                                <div className="border rounded bg-white shadow-sm divide-y max-w-xs max-h-36 overflow-y-auto">
                                                                                                    {ktkLitterMappingSearch.results.map(r => (
                                                                                                        <button key={r.id_public} type="button"
                                                                                                            onClick={() => {
                                                                                                                setKtkLitterMappings(prev => ({ ...prev, [l.litterIndex]: { ...prev[l.litterIndex], dam: { id_public: r.id_public, name: [r.prefix, r.name, r.suffix].filter(Boolean).join(' ') } } }));
                                                                                                                setKtkLitterMappingSearch({ litterIndex: null, side: null, query: '', results: [], loading: false });
                                                                                                            }}
                                                                                                            className="w-full text-left px-2 py-1.5 hover:bg-blue-50 text-xs"
                                                                                                        >
                                                                                                            <span className="font-medium text-gray-800">{[r.prefix, r.name, r.suffix].filter(Boolean).join(' ')}</span>
                                                                                                            <span className="text-gray-400 ml-2 font-mono">{r.id_public}</span>
                                                                                                            {r.birthDate && <span className="text-gray-400 ml-1">&middot; {String(r.birthDate).slice(0,10)}</span>}
                                                                                                            {r.gender && <span className="text-gray-400 ml-1">&middot; {r.gender}</span>}
                                                                                                        </button>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <button type="button" onClick={() => setKtkLitterMappingSearch({ litterIndex: l.litterIndex, side: 'dam', query: '', results: [], loading: false })} className="text-xs text-blue-600 hover:text-blue-800 hover:underline">+ Map to CT animal</button>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={async () => {
                                        setKtkConfirmLoading(true);
                                        try {
                                            const fd = new FormData();
                                            if (ktkAnimalsFile) fd.append('animals', ktkAnimalsFile);
                                            if (ktkBreedingFile) fd.append('breedingrecords', ktkBreedingFile);
                                            fd.append('species', ktkSpecies.trim());
                                            fd.append('confirm', 'true');
                                            fd.append('selectedAnimals', JSON.stringify([...ktkSelectedAnimals]));
                                            fd.append('selectedLitters', JSON.stringify([...ktkSelectedLitters]));
                                            fd.append('litterMappings', JSON.stringify(ktkLitterMappings));
                                            const finalResolutions = { ...ktkConflictResolutions };
                                            for (const [reg, mapping] of Object.entries(ktkManualMappings)) {
                                                finalResolutions[reg] = `map_to:${mapping.id_public}`;
                                            }
                                            fd.append('conflictResolutions', JSON.stringify(finalResolutions));
                                            const resp = await axios.post(`${API_BASE_URL}/import/kintraks`, fd, {
                                                headers: { Authorization: `Bearer ${authToken}` },
                                            });
                                            setKtkResult(resp.data);
                                            setKtkPreview(null);
                                            setKtkAnimalsFile(null);
                                            setKtkBreedingFile(null);
                                        } catch (err) {
                                            showModalMessage('Kintraks Import Failed', err.response?.data?.message || err.message);
                                        } finally {
                                            setKtkConfirmLoading(false);
                                        }
                                    }}
                                    disabled={ktkConfirmLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {ktkConfirmLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                    Confirm Import
                                </button>
                                <button
                                    onClick={() => { setKtkPreview(null); setKtkAnimalsFile(null); setKtkBreedingFile(null); setKtkManualMappings({}); setKtkMappingSearch({ registration: null, query: '', results: [], loading: false }); setKtkLitterMappings({}); setKtkLitterMappingSearch({ litterIndex: null, side: null, query: '', results: [], loading: false }); setKtkSelectedLitters(new Set()); }}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {ktkResult && (
                        <div className="mt-3 p-4 rounded-lg border bg-green-50 border-green-200">
                            <p className="font-semibold text-green-800 flex items-center gap-1.5 mb-2"><CheckCircle size={16} /> Kintraks import complete</p>
                            <div className="text-sm text-gray-700 space-y-0.5 mb-2">
                                {ktkResult.written && Object.entries(ktkResult.written).map(([s, n]) => (
                                    <p key={s}><span className="capitalize font-medium">{s}</span>: {n} imported{ktkResult.skipped?.[s] ? `, ${ktkResult.skipped[s]} skipped (duplicates)` : ''}</p>
                                ))}
                            </div>
                            {ktkResult.errors?.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm font-semibold text-red-700 flex items-center gap-1"><AlertTriangle size={13} /> {ktkResult.errors.length} error(s):</p>
                                    <ul className="text-xs text-red-600 list-disc list-inside mt-1 space-y-0.5 max-h-32 overflow-y-auto">
                                        {ktkResult.errors.map((e, i) => (
                                            <li key={i}>[{e.section}] {e.id}: {e.error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <button onClick={() => setKtkResult(null)} className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline">Dismiss</button>
                        </div>
                    )}
                </div>
            </div>

            {/* -- SimpleBreed Import --------------------------------------- */}
            <div className="mt-4 border border-sky-200 rounded-xl bg-white overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-sky-50 border-b border-sky-200">
                    <Globe size={18} className="text-sky-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-sky-800 text-sm">Import from SimpleBreed</h3>
                        <p className="text-xs text-sky-600">Paste a SimpleBreed profile URL or username to import animals with parents, colour and status. Duplicates are detected across all CritterTrack users by SB ID and name + birth date. If a species can't be detected, you'll be prompted to pick one ? the dropdown shows <span className="font-medium">only your starred species</span> (star them via the species selector when adding an animal).</p>
                    </div>
                </div>
                <div className="p-4 space-y-3">
                    {/* URL input */}
                    {!sbPreview && !sbResult && (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600">SimpleBreed profile URL or username</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={sbUrl}
                                    onChange={e => setSbUrl(e.target.value)}
                                    placeholder="https://www.simplebreed.com/morningstardb"
                                    className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                    onKeyDown={async e => {
                                        if (e.key !== 'Enter' || sbPreviewLoading || !sbUrl.trim()) return;
                                        setSbPreviewLoading(true); setSbResult(null); setSbPreview(null); setSbSelectedIds(new Set()); setSbConflictResolutions({}); setSbManualMappings({}); setSbMappingSearch({ sbId: null, query: '', results: [], loading: false }); setSbSpeciesOverrides({});
                                        try {
                                            const r = await axios.post(`${API_BASE_URL}/import/simplebreed/preview`, { profileUrl: sbUrl.trim() }, { headers: { Authorization: `Bearer ${authToken}` } });
                                            setSbPreview(r.data);
                                            setSbSelectedIds(new Set((r.data.items || []).map(a => a.sbId)));
                                            const defaults = {};
                                            for (const c of (r.data.conflicts || [])) defaults[c.sbId] = 'use_existing';
                                            setSbConflictResolutions(defaults);
                                        } catch (err) { showModalMessage('SimpleBreed Preview Failed', err.response?.data?.message || err.message); }
                                        finally { setSbPreviewLoading(false); }
                                    }}
                                />
                                <button
                                    onClick={async () => {
                                        if (!sbUrl.trim() || sbPreviewLoading) return;
                                        setSbPreviewLoading(true); setSbResult(null); setSbPreview(null); setSbSelectedIds(new Set()); setSbConflictResolutions({}); setSbManualMappings({}); setSbMappingSearch({ sbId: null, query: '', results: [], loading: false }); setSbSpeciesOverrides({});
                                        try {
                                            const r = await axios.post(`${API_BASE_URL}/import/simplebreed/preview`, { profileUrl: sbUrl.trim() }, { headers: { Authorization: `Bearer ${authToken}` } });
                                            setSbPreview(r.data);
                                            setSbSelectedIds(new Set((r.data.items || []).map(a => a.sbId)));
                                            const defaults = {};
                                            for (const c of (r.data.conflicts || [])) defaults[c.sbId] = 'use_existing';
                                            setSbConflictResolutions(defaults);
                                        } catch (err) { showModalMessage('SimpleBreed Preview Failed', err.response?.data?.message || err.message); }
                                        finally { setSbPreviewLoading(false); }
                                    }}
                                    disabled={!sbUrl.trim() || sbPreviewLoading}
                                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg flex items-center gap-1.5"
                                >
                                    {sbPreviewLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                                    {sbPreviewLoading ? 'Fetching?' : 'Fetch Animals'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Preview table */}
                    {sbPreview && !sbResult && (() => {
                        const sbItems = sbPreview.items || [];
                        const sbConflicts = sbPreview.conflicts || [];
                        const conflictIds = new Set(sbConflicts.map(c => c.sbId));
                        // Treat mapped animals as duplicates for selection/counting
                        const isDuplicateOrMapped = a => conflictIds.has(a.sbId) || !!sbManualMappings[a.sbId];
                        const isNewAnimal = a => !conflictIds.has(a.sbId) && !sbManualMappings[a.sbId];
                        const highConflictCount = sbConflicts.filter(c => c.confidence !== 'possible').length;
                        const possibleConflictCount = sbConflicts.filter(c => c.confidence === 'possible').length;
                        // Selectable: new animals + conflicts with "import anyway" chosen
                        const isSelectableAnimal = a => isNewAnimal(a) || (conflictIds.has(a.sbId) && (sbConflictResolutions[a.sbId] || 'use_existing') === 'import_anyway');
                        const selectableIds = new Set(sbItems.filter(isSelectableAnimal).map(a => a.sbId));
                        // Only count selected selectable animals for import
                        const selectedNewCount = [...sbSelectedIds].filter(id => selectableIds.has(id)).length;
                        return (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <h5 className="font-semibold text-gray-700">
                                        {sbPreview.total} animal{sbPreview.total !== 1 ? 's' : ''} found
                                        {(highConflictCount > 0 || possibleConflictCount > 0) && (
                                            <span className="ml-2 text-xs font-normal">
                                                {highConflictCount > 0 && <span className="text-amber-600">{highConflictCount} duplicate{highConflictCount !== 1 ? 's' : ''}</span>}
                                                {highConflictCount > 0 && possibleConflictCount > 0 && <span className="text-gray-400"> ? </span>}
                                                {possibleConflictCount > 0 && <span className="text-orange-500">{possibleConflictCount} possible match{possibleConflictCount !== 1 ? 'es' : ''}</span>}
                                            </span>
                                        )}
                                    </h5>
                                    <div className="flex gap-2 text-xs flex-wrap">
                                        <button type="button"
                                            onClick={() => setSbSelectedIds(new Set(sbItems.filter(isNewAnimal).map(a => a.sbId)))}
                                            className="px-2 py-1 border rounded bg-white hover:bg-gray-50 text-gray-600">Select all new</button>
                                        <button type="button"
                                            onClick={() => setSbSelectedIds(new Set())}
                                            className="px-2 py-1 border rounded bg-white hover:bg-gray-50 text-gray-600">Deselect all</button>
                                    </div>
                                </div>

                                {/* Bulk species assign ? shown when any animal has no detected species */}
                                {sbItems.some(a => !a.species || a.species === 'Unknown') && (
                                    <div className="flex items-center gap-2 text-xs bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                                        <span className="text-orange-700 font-medium shrink-0">Species not detected for some animals.</span>
                                        <span className="text-orange-600 shrink-0">Set all to:</span>
                                        <select
                                            defaultValue=""
                                            onChange={e => {
                                                if (!e.target.value) return;
                                                const overrides = {};
                                                for (const a of sbItems) {
                                                    if (!a.species || a.species === 'Unknown') overrides[a.sbId] = e.target.value;
                                                }
                                                setSbSpeciesOverrides(prev => ({ ...prev, ...overrides }));
                                            }}
                                            className="border border-orange-300 rounded px-2 py-0.5 bg-white text-gray-700 font-medium"
                                        >
                                            <option value="">? pick species ?</option>
                                            {(sbFavoriteSpecies.length > 0 ? sbFavoriteSpecies : DEFAULT_SPECIES_OPTIONS).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        {Object.keys(sbSpeciesOverrides).length > 0 && (
                                            <button type="button" onClick={() => setSbSpeciesOverrides({})} className="text-orange-400 hover:text-red-500 underline ml-1">Clear</button>
                                        )}
                                    </div>
                                )}

                                <div className="border rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                        <table className="min-w-full text-xs">
                                            <thead className="bg-gray-100 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-2 py-2 w-8"></th>
                                                    <th className="px-2 py-2 text-left font-medium text-gray-600">Name</th>
                                                    <th className="px-2 py-2 text-left font-medium text-gray-600">Born</th>
                                                    <th className="px-2 py-2 text-left font-medium text-gray-600">SB ID</th>
                                                    <th className="px-2 py-2 text-left font-medium text-gray-600">Species</th>
                                                    <th className="px-2 py-2 text-left font-medium text-gray-600">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y bg-white">
                                                {sbItems.map(a => {
                                                    const conflict = sbConflicts.find(c => c.sbId === a.sbId);
                                                    const resolution = sbConflictResolutions[a.sbId] || 'use_existing';
                                                    // Selectable if new, or if user chose "import anyway" on a conflict
                                                    const isSelectable = isNewAnimal(a) || (!!conflict && resolution === 'import_anyway');
                                                    const isSelected = isSelectable && (sbSelectedIds.has(a.sbId) || (!!conflict && resolution === 'import_anyway'));
                                                    return (
                                                        <React.Fragment key={a.sbId}>
                                                            <tr className={`transition ${!isSelected ? 'opacity-40 bg-gray-50' : conflict ? (conflict.confidence === 'possible' ? 'bg-orange-50' : 'bg-amber-50') : ''}`}>
                                                                <td className="px-2 py-1.5 text-center">
                                                                    <input type="checkbox" checked={isSelected}
                                                                        disabled={!isSelectable}
                                                                        onChange={e => {
                                                                            if (!isSelectable) return;
                                                                            setSbSelectedIds(prev => {
                                                                                const next = new Set(prev);
                                                                                if (e.target.checked) next.add(a.sbId); else next.delete(a.sbId);
                                                                                return next;
                                                                            });
                                                                        }}
                                                                        className="rounded" />
                                                                </td>
                                                                <td className="px-2 py-1.5 font-medium text-gray-800 whitespace-nowrap">{a.name}</td>
                                                                <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{a.birthDate || '?'}</td>
                                                                <td className="px-2 py-1.5 font-mono text-gray-500">{a.sbIdKey || a.sbId}</td>
                                                                <td className="px-2 py-1.5">
                                                                    {(!a.species || a.species === 'Unknown')
                                                                        ? <select
                                                                            value={sbSpeciesOverrides[a.sbId] || ''}
                                                                            onChange={e => setSbSpeciesOverrides(prev => ({ ...prev, [a.sbId]: e.target.value }))}
                                                                            className={`border rounded px-1 py-0.5 text-xs font-medium ${sbSpeciesOverrides[a.sbId] ? 'bg-white text-gray-700 border-gray-300' : 'bg-orange-50 text-orange-600 border-orange-300'}`}
                                                                          >
                                                                            <option value="">? pick ?</option>
                                                                            {(sbFavoriteSpecies.length > 0 ? sbFavoriteSpecies : DEFAULT_SPECIES_OPTIONS).map(s => <option key={s} value={s}>{s}</option>)}
                                                                          </select>
                                                                        : <span className="text-gray-500">{a.species}</span>}
                                                                </td>
                                                                <td className="px-2 py-1.5">
                                                                    {conflict
                                                                        ? conflict.confidence === 'possible'
                                                                            ? <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">Possible match</span>
                                                                            : <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">Duplicate</span>
                                                                        : sbManualMappings[a.sbId]
                                                                            ? <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">Duplicate</span>
                                                                            : <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">New</span>}
                                                                </td>
                                                            </tr>
                                                            {conflict && (
                                                                <tr className={conflict.confidence === 'possible' ? 'bg-orange-50' : 'bg-amber-50'}>
                                                                    <td></td>
                                                                    <td colSpan="5" className="px-3 pb-2 pt-0">
                                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-amber-800 pt-1">
                                                                            <AlertTriangle size={11} className="shrink-0 text-amber-500" />
                                                                            <span>
                                                                                {conflict.confidence === 'possible' ? 'Possible match: ' : 'Matches '}
                                                                                <span className="font-mono">{conflict.existingId}</span>
                                                                                {conflict.existingName && conflict.existingName !== a.name && <span> &ldquo;{conflict.existingName}&rdquo;</span>}
                                                                                {conflict.existingBirthDate && <span> &middot; {conflict.existingBirthDate}</span>}
                                                                                {' '}({conflict.isOwnedByImporter ? 'your animal' : `owned by ${conflict.existingOwner}`})
                                                                                {' ? matched by '}
                                                                                <span className="font-semibold">{conflict.matchType === 'id' ? 'SB ID' : conflict.matchType === 'name+birthDate' ? 'name + birth date' : 'name only'}</span>
                                                                            </span>
                                                                            <select
                                                                                value={resolution}
                                                                                onChange={e => {
                                                                                    const val = e.target.value;
                                                                                    setSbConflictResolutions(prev => ({ ...prev, [a.sbId]: val }));
                                                                                    setSbSelectedIds(prev => {
                                                                                        const next = new Set(prev);
                                                                                        if (val === 'import_anyway') next.add(a.sbId); else next.delete(a.sbId);
                                                                                        return next;
                                                                                    });
                                                                                }}
                                                                                className="border rounded px-2 py-0.5 bg-white text-gray-700 font-medium text-xs"
                                                                            >
                                                                                <option value="use_existing">Use existing CT animal for parent links (skip import)</option>
                                                                                <option value="import_anyway">Import anyway as new entry</option>
                                                                            </select>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            {/* Manual mapping sub-row for New/Mapped rows */}
                                                            {!conflict && (isSelected || sbManualMappings[a.sbId]) && (
                                                                <tr className={sbManualMappings[a.sbId] ? 'bg-blue-50' : 'bg-gray-50'}>
                                                                    <td></td>
                                                                    <td colSpan="5" className="px-3 pb-2 pt-0">
                                                                        {sbManualMappings[a.sbId] ? (
                                                                            <div className="flex items-center gap-2 text-xs pt-1">
                                                                                <span className="text-blue-700">&#x21AA; Mapped to <span className="font-mono font-semibold">{sbManualMappings[a.sbId].id_public}</span> &mdash; {sbManualMappings[a.sbId].name}</span>
                                                                                <button type="button" onClick={() => setSbMappingSearch({ sbId: a.sbId, query: '', results: [], loading: false })}
                                                                                    className="text-xs text-blue-500 hover:text-blue-700 hover:underline ml-1">Change</button>
                                                                                <button type="button" onClick={() => { setSbManualMappings(prev => { const n = { ...prev }; delete n[a.sbId]; return n; }); setSbMappingSearch({ sbId: null, query: '', results: [], loading: false }); }}
                                                                                    className="text-gray-400 hover:text-red-500 transition ml-1" title="Remove mapping"><X size={11} /></button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="pt-1">
                                                                                {sbMappingSearch.sbId === a.sbId ? (
                                                                                    <div className="flex flex-col gap-1.5">
                                                                                        <div className="flex items-center gap-1.5">
                                                                                            <input autoFocus type="text" placeholder="Search by name or CT ID?"
                                                                                                value={sbMappingSearch.query}
                                                                                                onChange={async e => {
                                                                                                    const q = e.target.value;
                                                                                                    setSbMappingSearch(prev => ({ ...prev, query: q, loading: q.length >= 2, results: [] }));
                                                                                                    if (q.length < 2) { setSbMappingSearch(prev => ({ ...prev, loading: false })); return; }
                                                                                                    try {
                                                                                                        const [privateRes, publicRes] = await Promise.allSettled([
                                                                                                            axios.get(`${API_BASE_URL}/animals`, { params: { name: q }, headers: { Authorization: `Bearer ${authToken}` } }),
                                                                                                            axios.get(`${API_BASE_URL}/public/global/animals`, { params: { name: q, limit: 10 } }),
                                                                                                        ]);
                                                                                                        const own = privateRes.status === 'fulfilled' ? privateRes.value.data : [];
                                                                                                        const pub = publicRes.status === 'fulfilled' ? publicRes.value.data : [];
                                                                                                        const seen = new Set(own.map(r => r.id_public));
                                                                                                        const merged = [...own, ...pub.filter(r => !seen.has(r.id_public))];
                                                                                                        // Discard stale results if query changed while this request was in-flight
                                                                                                        setSbMappingSearch(prev => prev.query !== q ? prev : { ...prev, results: merged.slice(0, 10), loading: false });
                                                                                                    } catch { setSbMappingSearch(prev => ({ ...prev, loading: false })); }
                                                                                                }}
                                                                                                className="flex-1 max-w-xs text-xs border rounded px-2 py-1 focus:ring-primary focus:border-primary"
                                                                                            />
                                                                                            {sbMappingSearch.loading && <Loader2 size={11} className="animate-spin text-gray-400" />}
                                                                                            <button type="button" onClick={() => setSbMappingSearch({ sbId: null, query: '', results: [], loading: false })}
                                                                                                className="text-gray-400 hover:text-gray-600"><X size={11} /></button>
                                                                                        </div>
                                                                                        {sbMappingSearch.results.length > 0 && (
                                                                                            <div className="border rounded bg-white shadow-sm divide-y max-w-sm max-h-40 overflow-y-auto">
                                                                                                {sbMappingSearch.results.map(r => (
                                                                                                    <button key={r.id_public} type="button"
                                                                                                        onClick={() => {
                                                                                                            setSbManualMappings(prev => ({ ...prev, [a.sbId]: { id_public: r.id_public, name: [r.prefix, r.name, r.suffix].filter(Boolean).join(' ') } }));
                                                                                                            setSbMappingSearch({ sbId: null, query: '', results: [], loading: false });
                                                                                                        }}
                                                                                                        className="w-full text-left px-2 py-1.5 hover:bg-blue-50 transition text-xs"
                                                                                                    >
                                                                                                        <span className="font-medium text-gray-800">{[r.prefix, r.name, r.suffix].filter(Boolean).join(' ')}</span>
                                                                                                        <span className="text-gray-400 ml-2 font-mono">{r.id_public}</span>
                                                                                                        {r.birthDate && <span className="text-gray-400 ml-1">&middot; {String(r.birthDate).slice(0,10)}</span>}
                                                                                                        {r.gender && <span className="text-gray-400 ml-1">&middot; {r.gender}</span>}
                                                                                                        {r.breederName && <span className="text-gray-300 ml-1">&middot; {r.breederName}</span>}
                                                                                                    </button>
                                                                                                ))}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ) : (
                                                                                    <button type="button"
                                                                                        onClick={() => setSbMappingSearch({ sbId: a.sbId, query: '', results: [], loading: false })}
                                                                                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                                                                    >
                                                                                        + Map to existing CT animal (for parent links)
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-400">
                                    {selectedNewCount} of {sbItems.filter(isNewAnimal).length} new animal{sbItems.filter(isNewAnimal).length !== 1 ? 's' : ''} selected
                                    {(() => {
                                        const dupeLinks = [...sbSelectedIds].filter(id => {
                                            const c = sbConflicts.find(x => x.sbId === id);
                                            return c && (sbConflictResolutions[id] || 'use_existing') === 'use_existing';
                                        }).length;
                                        const mappedLinks = [...sbSelectedIds].filter(id => !!sbManualMappings[id]).length;
                                        let msg = '';
                                        if (dupeLinks > 0) msg += ` · ${dupeLinks} duplicate${dupeLinks !== 1 ? 's' : ''} will link to existing CT animals`;
                                        if (mappedLinks > 0) msg += ` · ${mappedLinks} mapped animal${mappedLinks !== 1 ? 's' : ''} will link to existing CT animals`;
                                        return msg;
                                    })()}
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={async () => {
                                            const finalResolutions = { ...sbConflictResolutions };
                                            // Convert auto-detected use_existing conflicts ? map_to:<existingId>
                                            // so the backend knows exactly which CT animal to tag with the SB ID
                                            for (const conflict of sbConflicts) {
                                                if (!finalResolutions[conflict.sbId] || finalResolutions[conflict.sbId] === 'use_existing') {
                                                    if (conflict.existingId) finalResolutions[conflict.sbId] = `map_to:${conflict.existingId}`;
                                                }
                                            }
                                            for (const [sbId, mapping] of Object.entries(sbManualMappings)) {
                                                finalResolutions[sbId] = `map_to:${mapping.id_public}`;
                                            }
                                            const confirmCount = Object.values(finalResolutions).filter(v => typeof v === 'string' && v.startsWith('map_to:')).length;
                                            if ((!selectedNewCount && !confirmCount) || sbImportLoading) return;
                                            setSbImportLoading(true);
                                            try {
                                                const speciesMap = {
                                                    ...Object.fromEntries(
                                                        (sbPreview.items || []).map(a => [a.sbId, a.species]).filter(([, s]) => s && s !== 'Unknown')
                                                    ),
                                                    ...sbSpeciesOverrides,
                                                };
                                                const selectedNewIds = [...sbSelectedIds].filter(id => selectableIds.has(id));
                                                const r = await axios.post(`${API_BASE_URL}/import/simplebreed/import`, {
                                                    selectedIds: selectedNewIds,
                                                    conflictResolutions: finalResolutions,
                                                    speciesMap,
                                                    confirm: true,
                                                }, { headers: { Authorization: `Bearer ${authToken}` } });
                                                setSbResult(r.data);
                                                setSbPreview(null);
                                                if (typeof fetchAnimals === 'function') fetchAnimals(); // eslint-disable-line no-undef
                                            } catch (err) {
                                                showModalMessage('Import Failed', err.response?.data?.message || err.message);
                                            } finally {
                                                setSbImportLoading(false);
                                            }
                                        }}
                                        disabled={(() => {
                                            const finalRes = { ...sbConflictResolutions };
                                            for (const c of sbConflicts) { if (!finalRes[c.sbId] || finalRes[c.sbId] === 'use_existing') { if (c.existingId) finalRes[c.sbId] = `map_to:${c.existingId}`; } }
                                            for (const [sbId, m] of Object.entries(sbManualMappings)) finalRes[sbId] = `map_to:${m.id_public}`;
                                            const confirmCount = Object.values(finalRes).filter(v => typeof v === 'string' && v.startsWith('map_to:')).length;
                                            return (!selectedNewCount && !confirmCount) || sbImportLoading;
                                        })()}
                                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg flex items-center gap-1.5"
                                    >
                                        {sbImportLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                        {sbImportLoading ? 'Importing?' : selectedNewCount > 0 ? `Import ${selectedNewCount} Animal${selectedNewCount !== 1 ? 's' : ''}` : 'Confirm Stubs'}
                                    </button>
                                    <button onClick={() => { setSbPreview(null); setSbSelectedIds(new Set()); setSbConflictResolutions({}); setSbManualMappings({}); setSbMappingSearch({ sbId: null, query: '', results: [], loading: false }); setSbSpeciesOverrides({}); }} className="text-xs text-gray-400 hover:text-gray-600 underline">Cancel</button>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Result */}
                    {sbResult && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm space-y-1">
                            <p className="font-semibold text-green-800 flex items-center gap-1"><CheckCircle size={14} /> Import complete!</p>
                            <p className="text-green-700">{sbResult.written?.animals ?? 0} animal{sbResult.written?.animals !== 1 ? 's' : ''} imported · {sbResult.skipped?.animals ?? 0} skipped · {sbResult.parentLinked ?? 0} parent link{sbResult.parentLinked !== 1 ? 's' : ''} set{sbResult.stubsLinked > 0 ? ` · ${sbResult.stubsLinked} stub${sbResult.stubsLinked !== 1 ? 's' : ''} linked` : ''}{sbResult.imagesUploaded > 0 ? ` · ${sbResult.imagesUploaded} image${sbResult.imagesUploaded !== 1 ? 's' : ''} uploaded` : ''}</p>
                            {sbResult.errors?.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-red-600">{sbResult.errors.length} error(s):</p>
                                    <ul className="text-xs text-red-500 list-disc list-inside max-h-24 overflow-y-auto">
                                        {sbResult.errors.map((e, i) => <li key={i}>#{e.sbId}: {e.error}</li>)}
                                    </ul>
                                </div>
                            )}
                            <button onClick={() => { setSbResult(null); setSbUrl(''); }} className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline">Dismiss</button>
                        </div>
                    )}
                </div>
            </div>
            </>}

            {settingsTab === 'account' && <>
            <div className="mt-2 border-2 border-red-300 rounded-lg bg-red-50 overflow-x-hidden">
                <button type="button" onClick={() => setDangerZoneOpen(v => !v)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-red-100 transition"
                >
                    <h3 className="text-xl font-semibold text-red-800">Danger Zone</h3>
                    {dangerZoneOpen ? <ChevronUp size={20} className="text-red-400" /> : <ChevronDown size={20} className="text-red-400" />}
                </button>
                {dangerZoneOpen && <div className="px-4 sm:px-6 pb-6">
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
                </div>}
            </div>
            </>}
        </div>
    );
};

export default ProfileEditForm;
