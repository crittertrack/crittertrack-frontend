import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import {
    Baby, Bird, BookOpen, Bug, Calendar, Camera, Cat, CheckCircle,
    ChevronDown, ChevronUp, ClipboardList,
    Circle, Dna, Download, Edit, Eye, EyeOff, Fish, Hash, Heart, HeartOff,
    Images, Link, Loader2, Mars, PawPrint, Plus, RefreshCw, ScrollText, Search, Star,
    Trash2, Turtle, Unlink, Venus, VenusAndMars, Worm, X, Droplet, ScanHeart, Hourglass, AlertTriangle, FileText, FilePlus, FileMinus, FileX, FileCheck, FileWarning,
} from 'lucide-react';
import { formatDate, formatDateShort, parseLocalDate } from '../../utils/dateFormatter';
import { resolveDuplicateLitter } from '../../utils/litterDuplicate';
import DatePicker from '../DatePicker';
import { calculatePhenotype } from '../GeneticsCalculator';
import { matchFancyRatPhenotype } from '../../data/fancyRatPhenotypeRules';
import { PedigreeChart } from '../AnimalForm';
import InfoButton from '../shared/InfoButton';

const AnimalImage = ({ src, alt = 'Animal', className = 'w-full h-full object-cover', iconSize = 24 }) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageSrc, setImageSrc] = React.useState(src);
    React.useEffect(() => { setImageSrc(src); setImageError(false); }, [src]);
    if (!imageSrc || imageError) return <Cat size={iconSize} className="text-gray-400 dark:text-dark-text-muted" />;
    return <img src={imageSrc} alt={alt} className={className} onError={() => setImageError(true)} loading="lazy" />;
};

const DEFAULT_SPECIES_OPTIONS = ['Fancy Mouse', 'Fancy Rat', 'Russian Dwarf Hamster', 'Campbells Dwarf Hamster', 'Chinese Dwarf Hamster', 'Syrian Hamster', 'Guinea Pig'];

const getSpeciesDisplayName = (species) => {
    const displayNames = {
        'Fancy Mouse': 'Fancy Mice', 'Mouse': 'Fancy Mice',
        'Fancy Rat': 'Fancy Rats', 'Rat': 'Fancy Rats',
        'Russian Dwarf Hamster': 'Russian Dwarf Hamsters',
        'Campbells Dwarf Hamster': 'Campbells Dwarf Hamsters',
        'Chinese Dwarf Hamster': 'Chinese Dwarf Hamsters',
        'Syrian Hamster': 'Syrian Hamsters', 'Hamster': 'Hamsters',
        'Guinea Pig': 'Guinea Pigs'
    };
    return displayNames[species] || species;
};


const litterAge = (birthDate) => {
    if (!birthDate) return null;
    const born = new Date(birthDate);
    const now = new Date();
    if (isNaN(born.getTime()) || born > now) return null;
    let years = now.getFullYear() - born.getFullYear();
    let months = now.getMonth() - born.getMonth();
    let days = now.getDate() - born.getDate();
    if (days < 0) { months--; const pm = new Date(now.getFullYear(), now.getMonth(), 0); days += pm.getDate(); }
    if (months < 0) { years--; months += 12; }
    if (years > 0) return years + 'y ' + months + 'm ' + days + 'd';
    if (months > 0) return months + 'm ' + days + 'd';
    return days + 'd';
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin text-primary-dark mr-2" size={24} />
    <span className="text-gray-600 dark:text-dark-text-secondary">Loading...</span>
  </div>
);

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
        if (blob.size <= maxBytes) {
            return blob;
        }
        quality -= qualityStep;
    }

    // Second pass: gradually reduce dimensions while preserving aspect ratio
    const aspectRatio = image.width / image.height;
    while (Math.max(targetW, targetH) > minDimension) {
        // Reduce dimensions proportionally to maintain aspect ratio
        const scale = 0.8;
        targetW = Math.round(targetW * scale);
        targetH = Math.round(targetH * scale);
        
        // Ensure neither dimension goes below minDimension while preserving aspect ratio
        if (Math.max(targetW, targetH) < minDimension) {
            if (aspectRatio >= 1) {
                targetW = minDimension;
                targetH = Math.round(minDimension / aspectRatio);
            } else {
                targetH = minDimension;
                targetW = Math.round(minDimension * aspectRatio);
            }
        }
        
        quality = startQuality;
        while (quality >= minQuality) {
            const blob = await tryCompress(targetW, targetH, quality);
            if (!blob) break;
            if (blob.size <= maxBytes) {
                return blob;
            }
            quality -= qualityStep;
        }
    }

    // As a last resort, return the smallest we could create (use minQuality and minimum dimensions while preserving aspect ratio)
    const finalW = aspectRatio >= 1 ? minDimension : Math.round(minDimension * aspectRatio);
    const finalH = aspectRatio <= 1 ? minDimension : Math.round(minDimension / aspectRatio);
    const finalBlob = await tryCompress(finalW, finalH, minQuality);
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


const SpeciesPickerModal = ({ speciesOptions, onSelect, onClose, X, Search }) => {
    const categories = ['All', 'Mammal', 'Reptile', 'Bird', 'Amphibian', 'Fish', 'Invertebrate', 'Other'];
    const [search, setSearch] = useState('');
    const [cat, setCat] = useState('All');
    const [favorites, setFavorites] = useState(() => {
        try { return JSON.parse(localStorage.getItem('speciesFavorites') || '[]'); } catch { return []; }
    });

    const toggleFavorite = (e, name) => {
        e.stopPropagation();
        setFavorites(prev => {
            const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
            localStorage.setItem('speciesFavorites', JSON.stringify(next));
            // Dispatch custom event for backend sync
            window.dispatchEvent(new CustomEvent('speciesFavoritesChanged', { detail: next }));
            return next;
        });
    };

    const filtered = speciesOptions
        .filter(s => {
            const matchesCat = cat === 'All' || s.category === cat;
            const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.latinName && s.latinName.toLowerCase().includes(search.toLowerCase()));
            return matchesCat && matchesSearch;
        })
        .sort((a, b) => {
            const aFav = favorites.includes(a.name);
            const bFav = favorites.includes(b.name);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return a.name.localeCompare(b.name);
        });

    const favCount = filtered.filter(s => favorites.includes(s.name)).length;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-dark-card-bg border border-transparent dark:border-dark-text-muted rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center border-b dark:border-dark-text-muted p-4 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text">Select Species</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-dark-text-muted hover:text-gray-800 dark:hover:text-dark-text"><X size={22} /></button>
                </div>

                {/* Search + Category */}
                <div className="p-4 border-b dark:border-dark-text-muted flex-shrink-0 space-y-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by name or latin name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg text-sm bg-white dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCat(c)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                                    cat === c ? 'bg-primary dark:bg-dark-primary text-black' : 'bg-gray-100 dark:bg-dark-card-bg text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-surface-hover'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Species grid */}
                <div className="flex-grow overflow-y-auto p-4">
                    {favCount > 0 && !search && (
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Star size={11} className="fill-current" /> Favourites
                        </p>
                    )}
                    {filtered.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-dark-text-muted py-8">No species found.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {filtered.map((s, idx) => {
                                const isFav = favorites.includes(s.name);
                                const prevFav = idx > 0 && favorites.includes(filtered[idx - 1].name);
                                const showDivider = !search && !isFav && prevFav;
                                return (
                                    <React.Fragment key={s._id || s.name}>
                                        {showDivider && (
                                            <div className="col-span-full border-t border-gray-200 dark:border-dark-text-muted my-1" />
                                        )}
                                        <div className="relative group">
                                            <button
                                                type="button"
                                                onClick={() => onSelect(s.name)}
                                                className={`w-full h-20 flex flex-col items-start justify-center p-2 border-2 rounded-lg text-left transition hover:shadow-md relative ${
                                                    isFav
                                                        ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                                                        : s.isDefault
                                                        ? 'border-primary bg-primary/10 hover:bg-primary/20'
                                                        : 'border-gray-200 dark:border-dark-text-muted bg-white dark:bg-dark-card-bg hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-dark-surface-hover'
                                                }`}
                                            >
                                                <span className={`font-medium text-sm leading-tight pr-5 line-clamp-1 ${isFav ? 'text-amber-800 dark:text-amber-200' : 'text-gray-800 dark:text-dark-text'}`}>
                                                    {s.name}
                                                </span>
                                                {s.latinName && (
                                                    <span className={`text-xs italic mt-0.5 leading-tight line-clamp-1 ${isFav ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500 dark:text-dark-text-muted'}`}>{s.latinName}</span>
                                                )}
                                                {s.category && (
                                                    <span className={`absolute bottom-1 left-2 ${isFav ? 'text-amber-600 dark:text-amber-500' : 'text-gray-400 dark:text-dark-text-muted'}`}>
                                                        {s.category === 'Mammal' && <Cat size={12} />}
                                                        {s.category === 'Reptile' && <Turtle size={12} />}
                                                        {s.category === 'Bird' && <Bird size={12} />}
                                                        {s.category === 'Amphibian' && <Worm size={12} />}
                                                        {s.category === 'Fish' && <Fish size={12} />}
                                                        {s.category === 'Invertebrate' && <Bug size={12} />}
                                                        {s.category === 'Other' && <PawPrint size={12} />}
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={e => toggleFavorite(e, s.name)}
                                                title={isFav ? 'Remove from favourites' : 'Add to favourites'}
                                                className={`absolute top-2 right-2 transition ${isFav ? 'text-amber-400 dark:text-amber-500 opacity-100' : 'text-gray-300 dark:text-dark-text-muted opacity-0 group-hover:opacity-100 hover:text-amber-400 dark:hover:text-amber-500'}`}
                                            >
                                                <Star size={13} className={isFav ? 'fill-current' : ''} />
                                            </button>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t dark:border-dark-text-muted p-3 flex-shrink-0 flex justify-between items-center">
                    <span className="text-xs text-gray-400 dark:text-dark-text-muted">{filtered.length} species{favCount > 0 ? ` · ${favCount} favourited` : ''}</span>
                    <button onClick={onClose} className="text-sm text-gray-500 dark:text-dark-text-muted hover:text-gray-800 dark:hover:text-dark-text transition">Cancel</button>
                </div>
            </div>
        </div>
    );
};




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
                className="flex items-center space-x-3 p-3 border-b dark:border-dark-text-muted hover:bg-gray-50 dark:hover:bg-dark-surface-hover cursor-pointer" 
                onClick={() => onSelect(animal)}
            >
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-gray-100 dark:bg-dark-card-bg rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={24} />
                </div>
                
                {/* Info */}
                <div className="flex-grow">
                    <p className="font-semibold text-gray-800 dark:text-dark-text">
                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-muted">{animal.id_public}</p>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                        {animal.species} &bull; {animal.gender} &bull; {animal.status || 'Unknown'}
                    </p>
                    {getSpeciesLatinName(animal.species) && (
                        <p className="text-xs italic text-gray-500 dark:text-dark-text-muted">{getSpeciesLatinName(animal.species)}</p>
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
                // Filter out current animal and females deceased before offspring birth date
                const filteredLocal = localResponse.data.filter(a => {
                    if (a.id_public === currentId) return false;
                    // Only check deceased date for females (dams must be alive at offspring birth)
                    // Males (sires) can be deceased as long as they mated before death
                    if (birthDate && a.deceasedDate && (a.gender === 'Female' || a.gender === 'Intersex')) {
                        const offspringBirth = new Date(birthDate);
                        const parentDeceased = new Date(a.deceasedDate);
                        if (parentDeceased < offspringBirth) return false; // Dam died before offspring born
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
                // Filter out current animal and females deceased before offspring birth date
                const filteredGlobal = globalResponse.data.filter(a => {
                    if (a.id_public === currentId) return false;
                    // Only check deceased date for females (dams must be alive at offspring birth)
                    // Males (sires) can be deceased as long as they mated before death
                    if (birthDate && a.deceasedDate && (a.gender === 'Female' || a.gender === 'Intersex')) {
                        const offspringBirth = new Date(birthDate);
                        const parentDeceased = new Date(a.deceasedDate);
                        if (parentDeceased < offspringBirth) return false; // Dam died before offspring born
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
            <div className="bg-white dark:bg-dark-card-bg border border-transparent dark:border-dark-text-muted rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b dark:border-dark-text-muted pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text">{title} Selector</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-dark-text-muted hover:text-gray-800 dark:hover:text-dark-text"><X size={24} /></button>
                </div>

                {/* Scope Toggle + Search Bar (Manual Search) */}
                <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Search Scope:</span>
                        {['local','global','both'].map(s => (
                            <button key={s} type="button" onClick={() => setScope(s)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 ${scope === s ? 'bg-primary dark:bg-dark-primary text-black' : 'bg-gray-200 dark:bg-dark-card-bg text-gray-700 dark:text-dark-text-secondary hover:bg-gray-300 dark:hover:bg-dark-surface-hover'}`}>
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
                            className="flex-grow p-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted focus:ring-primary focus:border-primary transition"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={((scope === 'local' || scope === 'both') && loadingLocal) || ((scope === 'global' || scope === 'both') && loadingGlobal) || searchTerm.trim().length < 1}
                            className="bg-primary dark:bg-dark-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                        >
                            { (loadingLocal || loadingGlobal) ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} /> }
                        </button>
                    </div>
                </div>
                
                {/* Results Area */}
                <div className="flex-grow overflow-y-auto space-y-4">
                    {/* Local Results */}
                    {loadingLocal ? <LoadingSpinner message="Searching your animals..." /> : localAnimals.length > 0 && (
                        <div className="border dark:border-dark-text-muted p-3 rounded-lg bg-white dark:bg-dark-card-bg shadow-sm">
                            <h4 className="font-bold text-gray-700 dark:text-dark-text-secondary mb-2 border-b dark:border-dark-text-muted pb-1">Your Animals ({localAnimals.length})</h4>
                            {localAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={false} />)}
                        </div>
                    )}
                    
                    {/* Global Results */}
                    {loadingGlobal ? <LoadingSpinner message="Searching global animals..." /> : globalAnimals.length > 0 && (
                        <div className="border dark:border-dark-text-muted p-3 rounded-lg bg-white dark:bg-dark-card-bg shadow-sm">
                            <h4 className="font-bold text-gray-700 dark:text-dark-text-secondary mb-2 border-b dark:border-dark-text-muted pb-1">Global Display Animals ({globalAnimals.length})</h4>
                            {globalAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={true} />)}
                        </div>
                    )}
                    
                    {/* Updated no results check */}
                    {hasSearched && searchTerm.trim().length >= 1 && localAnimals.length === 0 && globalAnimals.length === 0 && !loadingLocal && !loadingGlobal && (
                        <p className="text-center text-gray-500 dark:text-dark-text-muted py-4">No animals found matching your search term or filters.</p>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t dark:border-dark-text-muted">
                    <button 
                        onClick={() => onSelect(null)} 
                        className="w-full text-sm text-gray-500 dark:text-dark-text-muted hover:text-red-500 transition"
                    >
                        Clear {title} ID
                    </button>
                </div>
            </div>
        </div>
    );
};

// Litter Management Component

const LitterManagement = ({ authToken, API_BASE_URL, userProfile, showModalMessage, onViewAnimal, handleViewAnimal, handleEditAnimal, formDataRef, onFormOpenChange, speciesOptions = [], cachedLitters = null, setCachedLitters, litterCacheTimestamp = 0, setLitterCacheTimestamp }) => {
    const [litters, setLitters] = useState([]);
    const [myAnimals, setMyAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        breedingPairCodeName: '',
        sireId_public: '',
        damId_public: '',
        species: '',
        birthDate: '',
        maleCount: null,
        femaleCount: null,
        unknownCount: null,
        maleLosses: null,
        femaleLosses: null,
        unknownLosses: null,
        extractLossesFromTotal: false,
        notes: '',
        linkedOffspringIds: [],
        // Enhanced breeding record fields
        breedingMethod: 'Unknown',
        breedingConditionAtTime: '',
        matingDate: '',
        outcome: 'Unknown',
        birthMethod: '',
        litterSizeBorn: null,
        litterSizeWeaned: null,
        stillbornCount: null,
        lossesCount: null,
        expectedDueDate: '',
        weaningDate: ''
    });
    const [createOffspringCounts, setCreateOffspringCounts] = useState({
        males: 0,
        females: 0,
        unknown: 0
    });
    
    // Track losses to extract from gender counts when creating placeholders
    const [extractLosses, setExtractLosses] = useState({
        fromMales: 0,
        fromFemales: 0,
        fromUnknown: 0
    });
    const [excludeLossesFromCreation, setExcludeLossesFromCreation] = useState(false);
    // Search filters for parent selection (UI not yet implemented)
    // const [sireSearch, setSireSearch] = useState('');
    // const [damSearch, setDamSearch] = useState('');
    // const [sireSpeciesFilter, setSireSpeciesFilter] = useState('');
    // const [damSpeciesFilter, setDamSpeciesFilter] = useState('');
    const [linkingAnimals, setLinkingAnimals] = useState(false);
    const [availableToLink, setAvailableToLink] = useState({ litter: null, animals: [] });
    const [expandedLitter, setExpandedLitter] = useState(null);
    const [editingLitter, setEditingLitter] = useState(null);
    const [certLitter, setCertLitter] = useState(null); // { litter_id_public, vertical }
    const [litterImages, setLitterImages] = useState([]);
    const [litterImageUploading, setLitterImageUploading] = useState(false);
    const [pendingLitterImages, setPendingLitterImages] = useState([]);
    const [showLitterImageModal, setShowLitterImageModal] = useState(false);
    const [enlargedLitterImageUrl, setEnlargedLitterImageUrl] = useState(null);

    const handleLitterImageDownload = async (imageUrl) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `crittertrack-litter-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Failed to download image:', error);
        }
    };
    const [modalTarget, setModalTarget] = useState(null);
    const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);
    const [selectedSireAnimal, setSelectedSireAnimal] = useState(null);
    const [selectedDamAnimal, setSelectedDamAnimal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [litterStatusFilter, setLitterStatusFilter] = useState('all'); // 'all' | 'planned' | 'mated' | 'pregnant' | 'born'
    // COI calculation state
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
    const [coiCalculating, setCoiCalculating] = useState(new Set()); // litter._id values currently computing COI
    // Session-level cache: key = `${sireId}:${damId}` or `litter:${_id}`, value = COI number
    // Prevents re-fetching the same pairing every time fetchLitters is called
    const coiCacheRef = useRef({});
    const fetchLittersAbortControllerRef = useRef(null); // Track current fetch to prevent stale requests
    const [myAnimalsLoaded, setMyAnimalsLoaded] = useState(false);
    const [litterOffspringMap, setLitterOffspringMap] = useState({}); // litter._id ? offspring array (undefined = not yet loaded)
    const [offspringRefetchToken, setOffspringRefetchToken] = useState(0); // increment to force offspring re-fetch

    // Mating quick-add form state
    const [showAddMatingForm, setShowAddMatingForm] = useState(false);
    const [editingMatingId, setEditingMatingId] = useState(null); // null = create, set = edit
    const [matingEditChoice, setMatingEditChoice] = useState(null); // litter object awaiting edit/convert choice
    const [matingData, setMatingData] = useState({ sireId_public: '', damId_public: '', matingDate: '', expectedDueDate: '', breedingMethod: 'Natural', breedingConditionAtTime: '', species: '', notes: '' });
    const [selectedMatingSire, setSelectedMatingSire] = useState(null);
    const [selectedMatingDam, setSelectedMatingDam] = useState(null);
    const [showMatingBreedingDetails, setShowMatingBreedingDetails] = useState(false);
    const [matingCOI, setMatingCOI] = useState(null);
    const [matingCalcCOI, setMatingCalcCOI] = useState(false);
    const [showMatingSpeciesPicker, setShowMatingSpeciesPicker] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Check if we have cached litters
                if (cachedLitters && cachedLitters.length > 0) {
                    setLitters(cachedLitters);
                    setLoading(false);
                    // Still fetch fresh data in background, but properly coordinated
                    try {
                        await fetchLitters();
                    } catch (error) {
                        console.error('Background litter fetch failed:', error);
                    }
                } else {
                    // Load litters first so cards appear immediately
                    await fetchLitters();
                }
            } catch (error) {
                console.error('Error loading litters:', error);
            } finally {
                setLoading(false);
            }
            // Background – populates offspring cards as soon as it resolves (no await to keep UI responsive)
            fetchMyAnimals().catch(err => console.error('Error loading animals:', err));
        };
        loadData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    // Listen for animal updates and refetch litters when pair animals or offspring change
    useEffect(() => {
        const handleAnimalUpdated = (event) => {
            const updatedAnimal = event.detail; // detail IS the animal object
            if (!updatedAnimal?.id_public || !litters.length) return;

            // Patch offspring map in-place so cards reflect changes immediately
            setLitterOffspringMap(prev => {
                let changed = false;
                const updated = { ...prev };
                for (const litterId in updated) {
                    const list = updated[litterId];
                    if (!Array.isArray(list)) continue;
                    const idx = list.findIndex(o => o.id_public === updatedAnimal.id_public);
                    if (idx !== -1) {
                        updated[litterId] = list.map((o, i) =>
                            i === idx ? { ...o, ...updatedAnimal } : o
                        );
                        changed = true;
                    }
                }
                return changed ? updated : prev;
            });
        };

        window.addEventListener('animal-updated', handleAnimalUpdated);
        return () => window.removeEventListener('animal-updated', handleAnimalUpdated);
    }, [litters, setLitterOffspringMap]);

    // Fallback: fetch offspring for a specific litter if not yet loaded when expanded
    // (normally fetchLitters pre-loads all offspring, this is just a safety net)
    useEffect(() => {
        if (!expandedLitter || !authToken) return;
        if (litterOffspringMap[expandedLitter] !== undefined) return; // already loaded
        const litter = litters.find(l => l._id === expandedLitter);
        if (!litter) return;
        axios.get(`${API_BASE_URL}/litters/${litter.litter_id_public}/offspring`, {
            headers: { Authorization: `Bearer ${authToken}` }
        }).then(res => {
            setLitterOffspringMap(prev => ({ ...prev, [expandedLitter]: res.data || [] }));
        }).catch(() => {
            setLitterOffspringMap(prev => ({ ...prev, [expandedLitter]: [] }));
        });
    }, [expandedLitter, litters, authToken, API_BASE_URL, offspringRefetchToken]); // eslint-disable-line react-hooks/exhaustive-deps

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

    const fetchLitters = async ({ preserveOffspring = false } = {}) => {
        try {
            // Cancel any previous fetchLitters request to prevent race conditions on mobile
            if (fetchLittersAbortControllerRef.current) {
                fetchLittersAbortControllerRef.current.abort();
            }
            const controller = new AbortController();
            fetchLittersAbortControllerRef.current = controller;
            
            // Clear offspring cache so expanded litter re-fetches fresh data
            // (skip when caller has already applied an optimistic update)
            if (!preserveOffspring) {
                setLitterOffspringMap({});
            }
            setOffspringRefetchToken(t => t + 1);
            const response = await axios.get(`${API_BASE_URL}/litters`, {
                headers: { Authorization: `Bearer ${authToken}` },
                signal: controller.signal
            });
            if (!Array.isArray(response.data)) {
                console.warn('Unexpected litters payload shape; preserving existing litter list.');
                return;
            }
            const littersData = response.data;
            
            // Set litters immediately so UI can render
            setLitters(littersData);
            
            // Cache the litters at parent level to prevent re-fetching on navigation
            if (setCachedLitters) {
                setCachedLitters(littersData);
                if (setLitterCacheTimestamp) {
                    setLitterCacheTimestamp(Date.now());
                }
            }
            
            // Calculate COI for each litter that doesn't have it yet.
            // Each litter updates independently so cards pop in as they resolve.
            // Only calculate COI for litters not already cached this session
            const littersNeedingCOI = littersData.filter(l => {
                if (!l.sireId_public || !l.damId_public) return false;
                if (l.inbreedingCoefficient != null) return false; // already stored in DB
                const cacheKey = `${l.sireId_public}:${l.damId_public}`;
                if (coiCacheRef.current[cacheKey] != null) {
                    // Already computed this session — patch state immediately, no API call
                    setLitters(prev => prev.map(x => x._id === l._id ? { ...x, inbreedingCoefficient: coiCacheRef.current[cacheKey] } : x));
                    return false;
                }
                return true;
            });
            if (littersNeedingCOI.length > 0) {
                setCoiCalculating(new Set(littersNeedingCOI.map(l => l._id)));
                littersNeedingCOI.forEach(async (litter) => {
                    const cacheKey = `${litter.sireId_public}:${litter.damId_public}`;
                    const coiController = new AbortController();
                    const timeout = setTimeout(() => coiController.abort(), 15000);
                    try {
                        const coiResponse = await axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
                            params: { sireId: litter.sireId_public, damId: litter.damId_public, generations: 20 },
                            headers: { Authorization: `Bearer ${authToken}` },
                            signal: coiController.signal,
                        });
                        const coi = coiResponse.data.inbreedingCoefficient ?? 0;
                        coiCacheRef.current[cacheKey] = coi;
                        setLitters(prev => prev.map(l => l._id === litter._id ? { ...l, inbreedingCoefficient: coi } : l));
                        axios.put(`${API_BASE_URL}/litters/${litter._id}`, { inbreedingCoefficient: coi }, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }).catch(() => {});
                    } catch { coiCacheRef.current[cacheKey] = 0; /* prevent retry loops on error */ }
                    finally {
                        clearTimeout(timeout);
                        setCoiCalculating(prev => { const next = new Set(prev); next.delete(litter._id); return next; });
                    }
                });
            }

            // Fetch offspring for all litters in parallel right away (no need to wait for expand)
            littersData.forEach(litter => {
                axios.get(`${API_BASE_URL}/litters/${litter.litter_id_public}/offspring`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                }).then(res => {
                    const offspring = Array.isArray(res.data) ? res.data : [];
                    setLitterOffspringMap(prev => ({ ...prev, [litter._id]: offspring }));

                    // Silently reconcile counts if linked offspring exceed stored values
                    if (offspring.length === 0) return;
                    const linkedMales   = offspring.filter(a => a.gender === 'Male').length;
                    const linkedFemales = offspring.filter(a => a.gender === 'Female').length;
                    const linkedUnknown = offspring.filter(a => a.gender !== 'Male' && a.gender !== 'Female').length;
                    const linkedTotal   = offspring.length;
                    const storedMales   = litter.maleCount   ?? 0;
                    const storedFemales = litter.femaleCount  ?? 0;
                    const storedUnknown = litter.unknownCount ?? 0;
                    const storedBorn    = litter.litterSizeBorn ?? litter.numberBorn ?? 0;
                    // Only auto-update total born if linked offspring exceed stored value.
                    // Never overwrite manually-entered gender counts.
                    const newBorn = Math.max(storedBorn, linkedTotal);
                    if (newBorn !== storedBorn) {
                        const patch = { litterSizeBorn: newBorn || null, numberBorn: newBorn || null };
                        setLitters(prev => prev.map(l => l._id === litter._id ? { ...l, ...patch } : l));
                        axios.put(`${API_BASE_URL}/litters/${litter._id}`, patch, { headers: { Authorization: `Bearer ${authToken}` } }).catch(() => {});
                    }
                }).catch(() => {
                    setLitterOffspringMap(prev => ({ ...prev, [litter._id]: [] }));
                });
            });
        } catch (error) {
            console.error('Error fetching litters:', error);
            // Preserve current list on transient failures so the UI doesn't appear to lose all litters.
        }
    };

    const fetchMyAnimals = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const animalsData = response.data || [];
            
            // Set animals immediately so UI can render
            setMyAnimals(animalsData);
            setMyAnimalsLoaded(true);
            
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
                            // COI calculation failed silently - non-critical
                        }
                    } else {
                        animal.inbreedingCoefficient = 0;
                    }
                }
                setMyAnimals([...animalsData]);
            });
        } catch (error) {
            console.error('[fetchMyAnimals] Error fetching animals:', error?.response?.status, error?.message);
            setMyAnimals([]);
        } finally {
            setMyAnimalsLoaded(true);
        }
    };

    const handleSelectOtherParentForLitter = (animal) => {
        if (modalTarget === 'sire-litter') {
            setFormData(prev => ({...prev, sireId_public: animal?.id_public || '', species: prev.species || animal?.species || ''}));
            setSelectedSireAnimal(animal || null);
        } else if (modalTarget === 'dam-litter') {
            setFormData(prev => ({...prev, damId_public: animal?.id_public || '', species: prev.species || animal?.species || ''}));
            setSelectedDamAnimal(animal || null);
        } else if (modalTarget === 'other-parent1-litter') {
            setFormData(prev => ({...prev, otherParent1Id_public: animal?.id_public || ''}));
        } else if (modalTarget === 'other-parent2-litter') {
            setFormData(prev => ({...prev, otherParent2Id_public: animal?.id_public || ''}));
        } else if (modalTarget === 'sire-mating') {
            setMatingData(prev => ({...prev, sireId_public: animal?.id_public || '', species: prev.species || animal?.species || ''}));
            setSelectedMatingSire(animal || null);
            setMatingCOI(null);
        } else if (modalTarget === 'dam-mating') {
            setMatingData(prev => ({...prev, damId_public: animal?.id_public || '', species: prev.species || animal?.species || ''}));
            setSelectedMatingDam(animal || null);
            setMatingCOI(null);
        }
        setModalTarget(null);
    };

    // Auto-calculate COI for mating form when both parents are selected
    useEffect(() => {
        if (!matingData.sireId_public || !matingData.damId_public) { setMatingCOI(null); return; }
        const sireId = matingData.sireId_public;
        const damId = matingData.damId_public;
        const cacheKey = `${sireId}:${damId}`;
        if (coiCacheRef.current[cacheKey] != null) { setMatingCOI(coiCacheRef.current[cacheKey]); return; }
        setMatingCalcCOI(true);
        setMatingCOI(null);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
            params: { sireId, damId, generations: 20 },
            headers: { Authorization: `Bearer ${authToken}` },
            signal: controller.signal,
        }).then(res => {
            const val = res.data.inbreedingCoefficient ?? 0;
            coiCacheRef.current[cacheKey] = val;
            setMatingCOI(val);
        }).catch(() => {}).finally(() => { clearTimeout(timeout); setMatingCalcCOI(false); });
    }, [matingData.sireId_public, matingData.damId_public]); // eslint-disable-line react-hooks/exhaustive-deps

    const resetMatingForm = () => {
        setMatingData({ sireId_public: '', damId_public: '', matingDate: '', expectedDueDate: '', breedingMethod: 'Natural', breedingConditionAtTime: '', species: '', notes: '' });
        setSelectedMatingSire(null);
        setSelectedMatingDam(null);
        setShowMatingBreedingDetails(false);
        setShowMatingSpeciesPicker(false);
        setMatingCOI(null);
        setMatingCalcCOI(false);
        setEditingMatingId(null);
    };

    const handleEditMating = (litter) => {
        const fmt = (d) => !d ? '' : (typeof d === 'string' && d.match(/^\d{4}-\d{2}-\d{2}/) ? d.split('T')[0] : new Date(d).toISOString().split('T')[0]);
        setEditingMatingId(litter._id);
        setMatingData({
            sireId_public: litter.sireId_public || '',
            damId_public: litter.damId_public || '',
            matingDate: fmt(litter.matingDate || litter.pairingDate),
            expectedDueDate: fmt(litter.expectedDueDate),
            breedingMethod: litter.breedingMethod || 'Natural',
            breedingConditionAtTime: litter.breedingConditionAtTime || '',
            species: litter.sire?.species || litter.dam?.species || '',
            notes: litter.notes || '',
        });
        setSelectedMatingSire(litter.sire || null);
        setSelectedMatingDam(litter.dam || null);
        if (litter.inbreedingCoefficient != null) setMatingCOI(litter.inbreedingCoefficient);
        setMatingEditChoice(null);
        setShowAddMatingForm(true);
    };

    const handleSubmitMating = async (e) => {
        e.preventDefault();
        if (!matingData.sireId_public || !matingData.damId_public) {
            showModalMessage('Error', 'Please select both a Sire and a Dam');
            return;
        }
        try {
            const sire = myAnimals.find(a => a.id_public === matingData.sireId_public) || selectedMatingSire;
            const dam = myAnimals.find(a => a.id_public === matingData.damId_public) || selectedMatingDam;
            if (!sire || !dam) {
                showModalMessage('Error', 'Selected parents not found. Please re-select sire and dam.');
                return;
            }
            const payload = {
                sireId_public: matingData.sireId_public,
                damId_public: matingData.damId_public,
                species: matingData.species || sire.species,
                matingDate: matingData.matingDate || null,
                expectedDueDate: matingData.expectedDueDate || null,
                breedingMethod: matingData.breedingMethod || 'Natural',
                breedingConditionAtTime: matingData.breedingConditionAtTime || null,
                notes: matingData.notes || '',
                isPlanned: true,
                numberBorn: 0,
            };
            let litterBackendId;
            if (editingMatingId) {
                await axios.put(`${API_BASE_URL}/litters/${editingMatingId}`, payload, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                litterBackendId = editingMatingId;
            } else {
                try {
                    const resp = await axios.post(`${API_BASE_URL}/litters`, payload, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    litterBackendId = resp.data.litterId_backend;
                } catch (createError) {
                    const duplicate = createError.response?.status === 409 && createError.response.data?.duplicate;
                    if (!duplicate) throw createError;
                    const resolution = await resolveDuplicateLitter({ duplicate, authToken, API_BASE_URL });
                    if (resolution.action === 'adopted') {
                        showModalMessage('Success', 'Adopted the existing litter into your Litter Management!');
                        setShowAddMatingForm(false);
                        resetMatingForm();
                        await fetchLitters();
                        return;
                    }
                    if (resolution.action === 'create-anyway') {
                        const retryResp = await axios.post(`${API_BASE_URL}/litters`, { ...payload, confirmDuplicate: true }, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        litterBackendId = retryResp.data.litterId_backend;
                    } else {
                        return;
                    }
                }
            }
            if (matingCOI != null) {
                axios.put(`${API_BASE_URL}/litters/${litterBackendId}`, { inbreedingCoefficient: matingCOI }, {
                    headers: { Authorization: `Bearer ${authToken}` }
                }).catch(() => {});
            }
            showModalMessage('Success', editingMatingId ? 'Planned mating updated!' : 'Planned mating recorded! Edit the entry to add birth details when the litter arrives.');
            setShowAddMatingForm(false);
            resetMatingForm();
            await fetchLitters();
        } catch (error) {
            console.error('Error recording planned mating:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to record mating');
        }
    };

    const handleMarkAsMated = async (litter) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await axios.put(`${API_BASE_URL}/litters/${litter._id}`, { matingDate: today, isPlanned: false }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            // Auto-dismiss the "mating due today" urgency notification for this litter
            try {
                const key = `${litter._id}-mated-${today}`;
                const prev = JSON.parse(localStorage.getItem('ct_urgency_dismissed') || '{}');
                prev[key] = true;
                localStorage.setItem('ct_urgency_dismissed', JSON.stringify(prev));
                window.dispatchEvent(new StorageEvent('storage', { key: 'ct_urgency_dismissed' }));
            } catch {}
            await fetchLitters();
            // Small delay to allow React to process state updates
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
            showModalMessage('Error', 'Failed to mark as mated');
        }
    };

    const handleMarkAsPregnant = async (litter) => {
        if (!litter.damId_public) {
            showModalMessage('Error', 'This litter has no dam assigned.');
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        try {
            // Set pregnancyDate on litter and mark dam as pregnant (clear isInMating)
            await Promise.all([
                axios.put(`${API_BASE_URL}/litters/${litter._id}`, { pregnancyDate: today }, {
                    headers: { Authorization: `Bearer ${authToken}` }
                }),
                axios.put(`${API_BASE_URL}/animals/${litter.damId_public}`, { isPregnant: true, isInMating: false }, {
                    headers: { Authorization: `Bearer ${authToken}` }
                })
            ]);
            await Promise.all([fetchLitters(), fetchMyAnimals()]);
            // Small delay to allow React to process state updates before dispatching event
            await new Promise(resolve => setTimeout(resolve, 100));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: litter.damId_public, isPregnant: true, isInMating: false } }));
        } catch (err) {
            showModalMessage('Error', 'Failed to mark dam as pregnant');
        }
    };

    const handleBornToday = async (litter) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await axios.put(`${API_BASE_URL}/litters/${litter._id}`, { birthDate: today }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            // Sync dam to nursing state
            await syncDamPostBirth(litter.damId_public);
            await fetchLitters();
            // Small delay to allow React to process state updates
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
            showModalMessage('Error', 'Failed to mark as born');
        }
    };

    // Auto-transition a dam from Pregnant -> Nursing whenever a litter's birthDate is
    // recorded for the first time (covers both new litters created with a birth date,
    // and planned/mated litters being converted to a litter via "Convert to Litter").
    const syncDamPostBirth = async (damId_public) => {
        if (!damId_public) return;
        try {
            await axios.put(`${API_BASE_URL}/animals/${damId_public}`, { isPregnant: false, isNursing: true }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            await fetchMyAnimals();
            // Small delay to allow React to process state updates
            await new Promise(resolve => setTimeout(resolve, 100));
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: damId_public, isPregnant: false, isNursing: true } }));
        } catch (err) {
            console.warn('Failed to sync dam nursing state after birth:', err?.response?.data?.message || err?.message);
        }
    };

    // Explicit "Wean Today" action — weaningConfirmed is only ever set here, so recording/
    // correcting a plain weaningDate elsewhere never ends nursing on its own.
    const handleMarkAsWeaned = async (litter) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await axios.put(`${API_BASE_URL}/litters/${litter._id}`, { weaningDate: today, weaningConfirmed: true }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (litter.damId_public) {
                await axios.put(`${API_BASE_URL}/animals/${litter.damId_public}`, { isNursing: false }, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            }
            await Promise.all([fetchLitters(), fetchMyAnimals()]);
            await new Promise(resolve => setTimeout(resolve, 100));
            if (litter.damId_public) {
                window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: litter.damId_public, isNursing: false } }));
            }
        } catch (err) {
            showModalMessage('Error', 'Failed to mark as weaned');
        }
    };

    // -- Litter form save-time reconciliation ---------------------------------
    // Returns { correctedCounts, warnings[] } based on form values + linked animals.
    // Rule 1: gender sum > total — bump total (silent)
    // Rule 2: stillborn, losses, or weaned > total — warn, do NOT auto-correct
    const reconcileLitterFormCounts = (fd, linkedAnimals = []) => {
        const linkedMales   = linkedAnimals.filter(a => a.gender === 'Male').length;
        const linkedFemales = linkedAnimals.filter(a => a.gender === 'Female').length;
        const linkedUnknown = linkedAnimals.filter(a => a.gender !== 'Male' && a.gender !== 'Female').length;
        // Always keep manual entries — only enforce minimum equal to linked count
        const maleCount    = Math.max(parseInt(fd.maleCount)    || 0, linkedMales);
        const femaleCount  = Math.max(parseInt(fd.femaleCount)  || 0, linkedFemales);
        const unknownCount = Math.max(parseInt(fd.unknownCount) || 0, linkedUnknown);
        const genderSum    = maleCount + femaleCount + unknownCount;
        const linkedCount  = linkedAnimals.length;
        const manualTotal  = parseInt(fd.litterSizeBorn) || 0;
        const litterSizeBorn = Math.max(manualTotal, genderSum, linkedCount) || null;
        const stillborn    = parseInt(fd.stillbornCount) || 0;
        const losses      = parseInt(fd.lossesCount) || 0;
        const weaned       = parseInt(fd.litterSizeWeaned) || 0;
        const warnings     = [];
        if (litterSizeBorn && stillborn > litterSizeBorn)
            warnings.push(`Stillborn (${stillborn}) exceeds Total Born (${litterSizeBorn}).`);
        if (litterSizeBorn && losses > litterSizeBorn)
            warnings.push(`Losses (${losses}) exceeds Total Born (${litterSizeBorn}).`);
        if (litterSizeBorn && weaned > litterSizeBorn)
            warnings.push(`Weaned (${weaned}) exceeds Total Born (${litterSizeBorn}).`);
        if (litterSizeBorn && (stillborn + losses + weaned) > litterSizeBorn)
            warnings.push(`Stillborn + Losses + Weaned (${stillborn + losses + weaned}) exceeds Total Born (${litterSizeBorn}).`);
        return {
            correctedCounts: { maleCount: maleCount || null, femaleCount: femaleCount || null, unknownCount: unknownCount || null, litterSizeBorn, numberBorn: litterSizeBorn },
            warnings,
        };
    };
    // -------------------------------------------------------------------------

    // Migration function to set isDisplay to true for all existing animals
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.sireId_public || !formData.damId_public) {
            showModalMessage('Error', 'Please select both a Sire and a Dam');
            return;
        }

        try {
            // Get parent details — fall back to cached selected animals for global (non-owned) ones
            const sire = myAnimals.find(a => a.id_public === formData.sireId_public) || selectedSireAnimal;
            const dam = myAnimals.find(a => a.id_public === formData.damId_public) || selectedDamAnimal;

            if (!sire || !dam) {
                showModalMessage('Error', 'Selected parents not found. Please re-select sire and dam.');
                return;
            }

            if (sire.species && dam.species && sire.species !== dam.species) {
                showModalMessage('Error', 'Parents must be the same species');
                return;
            }

            // Validate dam was alive at litter birth date (only females need to be alive at birth)
            if (formData.birthDate) {
                const litterBirthDate = new Date(formData.birthDate);
                
                // Only validate dam (female) - sires (males) can be deceased
                if (dam.deceasedDate) {
                    const damDeceasedDate = new Date(dam.deceasedDate);
                    if (damDeceasedDate < litterBirthDate) {
                        showModalMessage('Error', `Dam (${dam.name}) was deceased before the litter birth date`);
                        return;
                    }
                }
            }

            // Reconcile counts against logic model before saving
            const linkedForCreate = myAnimals.filter(a => (formData.linkedOffspringIds || []).includes(a.id_public));
            const { correctedCounts: createCounts, warnings: createWarnings } = reconcileLitterFormCounts(formData, linkedForCreate);
            if (createWarnings.length > 0) {
                const proceed = window.confirm(`Warning:\n${createWarnings.join('\n')}\n\nSave anyway?`);
                if (!proceed) return;
            }

            const litterPayload = {
                breedingPairCodeName: formData.breedingPairCodeName || null,
                sireId_public: formData.sireId_public,
                damId_public: formData.damId_public,
                birthDate: formData.birthDate || null,
                notes: formData.notes || '',
                offspringIds_public: formData.linkedOffspringIds || [],
                ...createCounts,
                // Enhanced breeding record fields
                breedingMethod: formData.breedingMethod || 'Unknown',
                breedingConditionAtTime: formData.breedingConditionAtTime || null,
                matingDate: formData.matingDate || null,
                expectedDueDate: formData.expectedDueDate || null,
                outcome: formData.outcome || 'Unknown',
                birthMethod: formData.birthMethod || null,
                litterSizeWeaned: formData.litterSizeWeaned || null,
                stillbornCount: formData.stillbornCount || null,
                lossesCount: formData.lossesCount || null,
                weaningDate: formData.weaningDate || null,
                // Extraction flags
                extractStillbornFromTotal: formData.extractStillbornFromTotal || false,
                extractLossesFromTotal: formData.extractLossesFromTotal || false,
                // Gender-specific stillborn
                maleStillbornCount: formData.maleStillborn || null,
                femaleStillbornCount: formData.femaleStillborn || null,
                unknownStillbornCount: formData.unknownStillborn || null,
                // Gender-specific losses
                maleLossesCount: formData.maleLosses || null,
                femaleLossesCount: formData.femaleLosses || null,
                unknownLossesCount: formData.unknownLosses || null
            };

            let litterResponse;
            try {
                litterResponse = await axios.post(`${API_BASE_URL}/litters`, litterPayload, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            } catch (createError) {
                const duplicate = createError.response?.status === 409 && createError.response.data?.duplicate;
                if (!duplicate) throw createError;
                const resolution = await resolveDuplicateLitter({ duplicate, authToken, API_BASE_URL });
                if (resolution.action === 'adopted') {
                    showModalMessage('Success', 'Adopted the existing litter into your Litter Management!');
                    setShowAddForm(false);
                    setEditingLitter(null);
                    fetchLitters();
                    return;
                }
                if (resolution.action === 'create-anyway') {
                    litterResponse = await axios.post(`${API_BASE_URL}/litters`, { ...litterPayload, confirmDuplicate: true }, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                } else {
                    return; // user cancelled
                }
            }

            const litterId = litterResponse.data.litterId_backend;

            // Litter was created with a birth date already recorded — dam transitions to nursing
            if (formData.birthDate) {
                syncDamPostBirth(formData.damId_public);
            }

            // Upload any images that were staged during creation
            if (pendingLitterImages.length > 0) {
                for (const { file } of pendingLitterImages) {
                    try {
                        const compressedBlob = await compressImageToMaxSize(file, 480 * 1024, { maxWidth: 1920, maxHeight: 1920, startQuality: 0.85 });
                        const fd = new FormData();
                        fd.append('image', compressedBlob, file.name || 'litter-photo.jpg');
                        const imgResp = await axios.post(`${API_BASE_URL}/litters/${litterId}/images`, fd, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        litterResponse.data.images = imgResp.data.images;
                    } catch (err) {
                        console.error('Failed to upload litter image:', err);
                    }
                }
                setPendingLitterImages([]);
            }

            // Optimistic update — add new litter to state immediately so it shows without waiting for refetch
            setLitters(prev => [litterResponse.data, ...prev]);

            // Calculate inbreeding coefficient in the background (non-blocking)
            axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
                params: { sireId: formData.sireId_public, damId: formData.damId_public, generations: 20 },
                headers: { Authorization: `Bearer ${authToken}` }
            }).then(coiResponse => {
                const coi = coiResponse.data.inbreedingCoefficient;
                if (coi != null) {
                    axios.put(`${API_BASE_URL}/litters/${litterId}`, { inbreedingCoefficient: coi }, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    }).catch(() => {});
                    // Patch the optimistic entry with the COI once it arrives
                    setLitters(prev => prev.map(l => l.litterId_backend === litterId ? { ...l, inbreedingCoefficient: coi } : l));
                }
            }).catch(() => {});

            // Create offspring animals if requested
            const offspringPromises = [];
            const totalToCreate = parseInt(createOffspringCounts.males || 0) + parseInt(createOffspringCounts.females || 0) + parseInt(createOffspringCounts.unknown || 0);
            
            if (totalToCreate > 0) {
                // Need birthdate to create animals
                if (!formData.birthDate) {
                    showModalMessage('Error', 'Birth date is required to create new offspring animals');
                    return;
                }
                
                // Create males
                for (let i = 1; i <= parseInt(createOffspringCounts.males || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `M${i}`, species: sire.species, gender: 'Male', birthDate: formData.birthDate, status: 'Pet', sireId_public: formData.sireId_public, damId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, creatorId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }
                
                // Create females
                for (let i = 1; i <= parseInt(createOffspringCounts.females || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `F${i}`, species: sire.species, gender: 'Female', birthDate: formData.birthDate, status: 'Pet', sireId_public: formData.sireId_public, damId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, creatorId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }

                // Create unknown/intersex
                for (let i = 1; i <= parseInt(createOffspringCounts.unknown || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `U${i}`, species: sire.species, gender: 'Unknown', birthDate: formData.birthDate, status: 'Pet', sireId_public: formData.sireId_public, damId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, creatorId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }
            }
            
            const createdAnimals = await Promise.all(offspringPromises);

            // Extract the IDs from created animals
            const newOffspringIds = createdAnimals.map(response => response.data.id_public);
            
            // Combine created and linked offspring IDs
            const allOffspringIds = [...newOffspringIds, ...(formData.linkedOffspringIds || [])];
            
            // Calculate inbreeding for each NEW offspring in the background (non-blocking)
            newOffspringIds.forEach(animalId => {
                axios.get(`${API_BASE_URL}/animals/${animalId}/inbreeding`, {
                    params: { generations: 20 },
                    headers: { Authorization: `Bearer ${authToken}` }
                }).catch(() => {});
            });
            
            // Update litter with all offspring
            await axios.put(`${API_BASE_URL}/litters/${litterId}`, {
                offspringIds_public: allOffspringIds,
                numberBorn: allOffspringIds.length
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            // COI will arrive and patch state via the background request fired above

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
            setPendingLitterImages(prev => { prev.forEach(item => URL.revokeObjectURL(item.previewUrl)); return []; });
            setSelectedSireAnimal(null);
            setSelectedDamAnimal(null);
            setFormData({
                breedingPairCodeName: '',
                sireId_public: '',
                damId_public: '',
                species: '',
                birthDate: '',
                maleCount: null,
                femaleCount: null,
                unknownCount: null,
                notes: '',
                linkedOffspringIds: [],
                // Enhanced breeding record fields
                breedingMethod: 'Unknown',
                breedingConditionAtTime: '',
                matingDate: '',
                expectedDueDate: '',
                outcome: 'Unknown',
                birthMethod: '',
                litterSizeBorn: null,
                litterSizeWeaned: null,
                stillbornCount: null,
                lossesCount: null,
                weaningDate: ''
            });
            setCreateOffspringCounts({ males: 0, females: 0, unknown: 0 });
            // setSireSearch('');
            // setDamSearch('');
            // setSireSpeciesFilter('');
            // setDamSpeciesFilter('');
            setPredictedCOI(null);
            fetchLitters();
            fetchMyAnimals();
        } catch (error) {
            console.error('Error creating litter:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to create litter');
        }
    };

    // -- Shared litter count recalculation ------------------------------------
    // Rules:
    //  1. Linked animals are ground truth for gender counts (always overwrite)
    //  2. litterSizeBorn = max(current manual total, gender sum, linked count)
    //  3. numberBorn stays in sync with litterSizeBorn
    //  4. stillborn/losses/weaned are never touched here
    const calcLitterCounts = (litter, allLinkedAnimals) => {
        const maleCount   = allLinkedAnimals.filter(a => a.gender === 'Male').length;
        const femaleCount = allLinkedAnimals.filter(a => a.gender === 'Female').length;
        const unknownCount = allLinkedAnimals.filter(a => a.gender !== 'Male' && a.gender !== 'Female').length;
        const genderSum   = maleCount + femaleCount + unknownCount;
        const linkedCount = allLinkedAnimals.length;
        const litterSizeBorn = Math.max(litter.litterSizeBorn || 0, genderSum, linkedCount);
        return { maleCount, femaleCount, unknownCount, litterSizeBorn, numberBorn: litterSizeBorn };
    };
    // -------------------------------------------------------------------------

    const handleLinkAnimals = (litter) => {
        // Search for animals with matching parents and birthdate
        // Require birthdate to be set first
        if (!litter.birthDate) {
            showModalMessage('Required', 'Please enter a birth date for the litter before linking animals.');
            return;
        }

        try {
            // Use already-loaded myAnimals — no network call needed
            const linkedIds = litter.offspringIds_public || [];
            
            const matching = myAnimals.filter(animal => {
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
            const litter = availableToLink.litter;
            const updatedOffspringIds = [...(litter.offspringIds_public || []), animalId];
            const addedAnimal = availableToLink.animals.find(a => a.id_public === animalId);
            const existingOffspring = myAnimals.filter(a => (litter.offspringIds_public || []).includes(a.id_public));
            const allLinked = [...existingOffspring, ...(addedAnimal ? [addedAnimal] : [])];
            // Only bump total born if linked count exceeds stored value — never touch gender counts
            const newBorn = Math.max(litter.litterSizeBorn || 0, allLinked.length);

            // Update the litter's offspring list
            await axios.put(`${API_BASE_URL}/litters/${litter._id}`, {
                offspringIds_public: updatedOffspringIds,
                litterSizeBorn: newBorn || null,
                numberBorn: newBorn || null,
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            // Update the animal's parents to match the litter's parents
            if (addedAnimal) {
                const parentPatch = { sireId_public: litter.sireId_public || null, damId_public: litter.damId_public || null };
                await axios.put(`${API_BASE_URL}/animals/${addedAnimal.id_public}`, parentPatch, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: addedAnimal.id_public, ...parentPatch } }));
            }
            
            // Optimistically add to offspring list immediately
            if (addedAnimal) {
                setLitterOffspringMap(prev => ({
                    ...prev,
                    [litter._id]: [...(prev[litter._id] || []), addedAnimal]
                }));
            }

            showModalMessage('Success', 'Animal linked to litter!');
            
            // Remove from available list
            const remainingAnimals = availableToLink.animals.filter(a => a.id_public !== animalId);
            setAvailableToLink({
                ...availableToLink,
                animals: remainingAnimals
            });
            
            // Close modal if no more animals to link
            if (remainingAnimals.length === 0) {
                setLinkingAnimals(false);
            }
            
            // Refresh litters to show updated count without clearing offspring cache
            await fetchLitters({ preserveOffspring: true });
        } catch (error) {
            console.error('Error linking animal to litter:', error);
            showModalMessage('Error', 'Failed to link animal to litter');
        }
    };

    const handleAddAllToLitter = async () => {
        try {
            if (!availableToLink.animals || availableToLink.animals.length === 0) return;
            const litter = availableToLink.litter;
            const animalIdsToAdd = availableToLink.animals.map(a => a.id_public);
            const updatedOffspringIds = [...(litter.offspringIds_public || []), ...animalIdsToAdd];
            const existingOffspring = myAnimals.filter(a => (litter.offspringIds_public || []).includes(a.id_public));
            const allLinked = [...existingOffspring, ...availableToLink.animals];
            // Only bump total born if linked count exceeds stored value — never touch gender counts
            const newBorn = Math.max(litter.litterSizeBorn || 0, allLinked.length);

            await axios.put(`${API_BASE_URL}/litters/${litter._id}`, {
                offspringIds_public: updatedOffspringIds,
                litterSizeBorn: newBorn || null,
                numberBorn: newBorn || null,
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            // Optimistically add all to offspring list immediately
            setLitterOffspringMap(prev => ({
                ...prev,
                [litter._id]: [...(prev[litter._id] || []), ...availableToLink.animals]
            }));

            showModalMessage('Success', `${animalIdsToAdd.length} animal(s) linked to litter!`);
            
            // Close modal and clear available list
            setLinkingAnimals(false);
            setAvailableToLink({
                litter: null,
                animals: []
            });
            
            // Refresh litters to show updated count without clearing offspring cache
            await fetchLitters({ preserveOffspring: true });
        } catch (error) {
            console.error('Error linking animals to litter:', error);
            showModalMessage('Error', 'Failed to link animals to litter');
        }
    };

    const handleUnlinkOffspring = async (litter, animalId_public) => {
        if (!window.confirm('Remove this animal from the litter? The animal record will NOT be deleted — only the link to this litter will be removed.')) return;
        try {
            const updatedOffspringIds = (litter.offspringIds_public || []).filter(id => id !== animalId_public);
            const remainingOffspring = (litterOffspringMap[litter._id] || []).filter(a => a.id_public !== animalId_public);
            // Only update the link list — never modify gender counts or total born on unlink
            await axios.put(`${API_BASE_URL}/litters/${litter._id}`, {
                offspringIds_public: updatedOffspringIds,
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            // Optimistic update
            setLitterOffspringMap(prev => ({
                ...prev,
                [litter._id]: remainingOffspring
            }));
            fetchLitters({ preserveOffspring: true });
        } catch (error) {
            console.error('Error unlinking offspring:', error);
            showModalMessage('Error', 'Failed to unlink animal from litter.');
        }
    };

    const toggleOffspringOwned = async (litterId, animalId_public, newOwnedValue) => {
        setLitterOffspringMap(prev => ({
            ...prev,
            [litterId]: (prev[litterId] || []).map(a => a.id_public === animalId_public ? { ...a, isOwned: newOwnedValue } : a)
        }));
        window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animalId_public, isOwned: newOwnedValue } }));
        try {
            await axios.put(`${API_BASE_URL}/animals/${animalId_public}`, { isOwned: newOwnedValue }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
        } catch (error) {
            console.error('Error updating owned status:', error);
            setLitterOffspringMap(prev => ({
                ...prev,
                [litterId]: (prev[litterId] || []).map(a => a.id_public === animalId_public ? { ...a, isOwned: !newOwnedValue } : a)
            }));
            showModalMessage('Error', 'Failed to update owned status.');
        }
    };

    const toggleOffspringPrivacy = async (litterId, animalId_public, newPrivacyValue) => {
        setLitterOffspringMap(prev => ({
            ...prev,
            [litterId]: (prev[litterId] || []).map(a => a.id_public === animalId_public ? { ...a, showOnPublicProfile: newPrivacyValue, isDisplay: newPrivacyValue } : a)
        }));
        window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animalId_public, showOnPublicProfile: newPrivacyValue, isDisplay: newPrivacyValue } }));
        try {
            await axios.put(`${API_BASE_URL}/animals/${animalId_public}`, { showOnPublicProfile: newPrivacyValue, isDisplay: newPrivacyValue }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
        } catch (error) {
            console.error('Error updating privacy setting:', error);
            setLitterOffspringMap(prev => ({
                ...prev,
                [litterId]: (prev[litterId] || []).map(a => a.id_public === animalId_public ? { ...a, showOnPublicProfile: !newPrivacyValue, isDisplay: !newPrivacyValue } : a)
            }));
            showModalMessage('Error', 'Failed to update privacy setting.');
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
            await fetchLitters();
        } catch (error) {
            console.error('Error deleting litter:', error);
            showModalMessage('Error', 'Failed to delete litter');
        }
    };

    const handleRecalculateOffspringCounts = async () => {
        if (!window.confirm('This will recalculate offspring counts and gender tallies for all litters based on linked animals. Continue?')) {
            return;
        }

        try {
            setLoading(true);
            let updatedCount = 0;

            for (const litter of litters) {
                const linkedAnimals = myAnimals.filter(a => (litter.offspringIds_public || []).includes(a.id_public));
                const counts = calcLitterCounts(litter, linkedAnimals);

                const needsUpdate =
                    litter.numberBorn !== counts.numberBorn ||
                    (litter.litterSizeBorn || 0) !== counts.litterSizeBorn ||
                    litter.maleCount !== counts.maleCount ||
                    litter.femaleCount !== counts.femaleCount ||
                    litter.unknownCount !== counts.unknownCount;

                if (needsUpdate) {
                    await axios.put(`${API_BASE_URL}/litters/${litter._id}`, counts, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    updatedCount++;
                }
            }

            showModalMessage('Success', `Recalculated counts for ${updatedCount} litter(s)!`);
            fetchLitters();
        } catch (error) {
            console.error('Error recalculating offspring counts:', error);
            showModalMessage('Error', 'Failed to recalculate offspring counts');
        } finally {
            setLoading(false);
        }
    };

    const toggleAllPublic = async () => {
        const allPublic = filteredLitters.every(l => l.showOnPublicProfile);
        const newVal = !allPublic;
        setLitters(prev => prev.map(l =>
            filteredLitters.some(fl => fl._id === l._id) ? { ...l, showOnPublicProfile: newVal } : l
        ));
        try {
            await Promise.all(
                filteredLitters.map(l =>
                    axios.put(`${API_BASE_URL}/litters/${l._id}`, { showOnPublicProfile: newVal }, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    })
                )
            );
        } catch (err) {
            // Revert on failure
            setLitters(prev => prev.map(l =>
                filteredLitters.some(fl => fl._id === l._id) ? { ...l, showOnPublicProfile: !newVal } : l
            ));
        }
    };

    const toggleLitterPublic = async (litter) => {
        const newVal = !litter.showOnPublicProfile;
        setLitters(prev => prev.map(l => l._id === litter._id ? { ...l, showOnPublicProfile: newVal } : l));
        try {
            await axios.put(`${API_BASE_URL}/litters/${litter._id}`, { showOnPublicProfile: newVal }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
        } catch (err) {
            // Revert on failure
            setLitters(prev => prev.map(l => l._id === litter._id ? { ...l, showOnPublicProfile: !newVal } : l));
        }
    };

    const handleEditLitter = (litter) => {
        // Format birthDate and matingDate for date inputs
        // Date inputs expect YYYY-MM-DD format
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            try {
                // If it's already in YYYY-MM-DD format, return as-is
                if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
                    return dateString.split('T')[0];
                }
                // Otherwise parse and format
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            } catch (e) {
                return '';
            }
        };

        setEditingLitter(litter._id);
        setCreateOffspringCounts({ males: 0, females: 0, unknown: 0 });
        setLitterImages(litter.images || []);
        // Restore cached parent animal objects for display (supports global animals)
        setSelectedSireAnimal(litter.sire || null);
        setSelectedDamAnimal(litter.dam || null);
        setFormData({
            breedingPairCodeName: litter.breedingPairCodeName || '',
            sireId_public: litter.sireId_public,
            damId_public: litter.damId_public,
            birthDate: formatDateForInput(litter.birthDate),
            maleCount: litter.maleCount || null,
            femaleCount: litter.femaleCount || null,
            unknownCount: litter.unknownCount || null,
            notes: litter.notes || '',
            linkedOffspringIds: litter.offspringIds_public || [],
            species: litter.sire?.species || litter.dam?.species || '',
            // Enhanced breeding record fields
            breedingMethod: litter.breedingMethod || 'Unknown',
            breedingConditionAtTime: litter.breedingConditionAtTime || '',
            matingDate: litter.matingDate || litter.pairingDate,
            outcome: litter.outcome || 'Unknown',
            birthMethod: litter.birthMethod || '',
            litterSizeBorn: litter.litterSizeBorn || litter.numberBorn || null,
            litterSizeWeaned: litter.litterSizeWeaned || litter.numberWeaned || null,
            stillbornCount: litter.stillbornCount || litter.stillborn || null,
            lossesCount: litter.lossesCount || litter.losses || null,
            // Sex-specific stillborn counts
            maleStillborn: litter.maleStillbornCount || null,
            femaleStillborn: litter.femaleStillbornCount || null,
            unknownStillborn: litter.unknownStillbornCount || null,
            // Sex-specific losses counts
            maleLosses: litter.maleLossesCount || null,
            femaleLosses: litter.femaleLossesCount || null,
            unknownLosses: litter.unknownLossesCount || null,
            expectedDueDate: formatDateForInput(litter.expectedDueDate),
            weaningDate: formatDateForInput(litter.weaningDate)
        });
        setShowAddForm(true);
        setExpandedLitter(null);
    };

    const handleLitterImageUpload = async (file) => {
        if (litterImages.length >= 5) {
            showModalMessage('Error', 'Maximum of 5 images per litter');
            return;
        }
        // Show local preview immediately while uploading
        const localPreview = URL.createObjectURL(file);
        setLitterImages(prev => [...prev, { url: localPreview, r2Key: '__uploading__' }]);
        setLitterImageUploading(true);
        try {
            const compressedBlob = await compressImageToMaxSize(file, 480 * 1024, { maxWidth: 1920, maxHeight: 1920, startQuality: 0.85 });
            const fd = new FormData();
            fd.append('image', compressedBlob, file.name || 'litter-photo.jpg');
            const resp = await axios.post(`${API_BASE_URL}/litters/${editingLitter}/images`, fd, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            URL.revokeObjectURL(localPreview);
            setLitterImages(resp.data.images || []);
            setLitters(prev => prev.map(l => l._id === editingLitter || l.litterId_backend === editingLitter ? { ...l, images: resp.data.images } : l));
        } catch (err) {
            URL.revokeObjectURL(localPreview);
            setLitterImages(prev => prev.filter(img => img.r2Key !== '__uploading__'));
            showModalMessage('Error', err.response?.data?.message || 'Failed to upload image');
        } finally {
            setLitterImageUploading(false);
        }
    };

    const handleLitterImageDelete = async (r2Key) => {
        try {
            const resp = await axios.delete(`${API_BASE_URL}/litters/${editingLitter}/images/${encodeURIComponent(r2Key)}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setLitterImages(resp.data.images || []);
            setLitters(prev => prev.map(l => l._id === editingLitter || l.litterId_backend === editingLitter ? { ...l, images: resp.data.images } : l));
        } catch (err) {
            showModalMessage('Error', err.response?.data?.message || 'Failed to delete image');
        }
    };

    const handleUpdateLitter = async (e) => {
        e.preventDefault();

        
        if (!formData.sireId_public || !formData.damId_public) {
            showModalMessage('Error', 'Please select both a Sire and a Dam');
            return;
        }

        try {
            // Get parent details — fall back to cached selected animals for global (non-owned) ones
            const sire = myAnimals.find(a => a.id_public === formData.sireId_public) || selectedSireAnimal;
            const dam = myAnimals.find(a => a.id_public === formData.damId_public) || selectedDamAnimal;
            const offspringSpecies = sire?.species || dam?.species || formData.species || '';


            // Create offspring animals if requested
            const offspringPromises = [];
            const totalToCreate = parseInt(createOffspringCounts.males || 0) + parseInt(createOffspringCounts.females || 0) + parseInt(createOffspringCounts.unknown || 0);
            
            if (totalToCreate > 0) {
                // Need birthdate to create animals
                if (!formData.birthDate) {
                    showModalMessage('Error', 'Birth date is required to create new offspring animals');
                    return;
                }
                
                for (let i = 1; i <= parseInt(createOffspringCounts.males || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `M${i}`, species: offspringSpecies, gender: 'Male', birthDate: formData.birthDate, status: 'Pet', sireId_public: formData.sireId_public, damId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, creatorId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }
                for (let i = 1; i <= parseInt(createOffspringCounts.females || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `F${i}`, species: offspringSpecies, gender: 'Female', birthDate: formData.birthDate, status: 'Pet', sireId_public: formData.sireId_public, damId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, creatorId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }
                for (let i = 1; i <= parseInt(createOffspringCounts.unknown || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `U${i}`, species: offspringSpecies, gender: 'Unknown', birthDate: formData.birthDate, status: 'Pet', sireId_public: formData.sireId_public, damId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, creatorId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }
            }
            
            const createdAnimals = await Promise.all(offspringPromises);
            const newOffspringIds = createdAnimals.map(response => response.data.id_public);
            const allOffspringIds = [...newOffspringIds, ...(formData.linkedOffspringIds || [])];

            // Reconcile counts against logic model before saving
            const linkedForUpdate = myAnimals.filter(a => allOffspringIds.includes(a.id_public));
            const { correctedCounts: updateCounts, warnings: updateWarnings } = reconcileLitterFormCounts(formData, linkedForUpdate);
            if (updateWarnings.length > 0) {
                const proceed = window.confirm(`Warning:\n${updateWarnings.join('\n')}\n\nSave anyway?`);
                if (!proceed) return;
            }

            // Detect a first-time birth recording (no birthDate previously — one now) so we
            // can auto-transition the dam from Pregnant -> Nursing after the litter save succeeds.
            const originalLitter = litters.find(l => l._id === editingLitter);
            const isNewBirth = !!formData.birthDate && !originalLitter?.birthDate;

            await axios.put(`${API_BASE_URL}/litters/${editingLitter}`, {
                breedingPairCodeName: formData.breedingPairCodeName,
                sireId_public: formData.sireId_public,
                damId_public: formData.damId_public,
                birthDate: formData.birthDate,
                notes: formData.notes,
                offspringIds_public: allOffspringIds,
                ...updateCounts,
                // Enhanced breeding record fields
                // Use || null / || 'Unknown' to prevent sending empty strings
                // into strict enum fields, which causes a 500 validation error.
                breedingMethod: formData.breedingMethod || 'Unknown',
                breedingConditionAtTime: formData.breedingConditionAtTime || null,
                matingDate: formData.matingDate || null,
                expectedDueDate: formData.expectedDueDate || null,
                outcome: formData.outcome || 'Unknown',
                birthMethod: formData.birthMethod || null,
                litterSizeWeaned: formData.litterSizeWeaned || null,
                stillbornCount: formData.stillbornCount || null,
                lossesCount: formData.lossesCount || null,
                weaningDate: formData.weaningDate || null,
                // Extraction flags
                extractStillbornFromTotal: formData.extractStillbornFromTotal || false,
                extractLossesFromTotal: formData.extractLossesFromTotal || false,
                // Gender-specific stillborn
                maleStillbornCount: formData.maleStillborn || null,
                femaleStillbornCount: formData.femaleStillborn || null,
                unknownStillbornCount: formData.unknownStillborn || null,
                // Gender-specific losses
                maleLossesCount: formData.maleLosses || null,
                femaleLossesCount: formData.femaleLosses || null,
                unknownLossesCount: formData.unknownLosses || null
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            // First-time birth recorded on this litter — dam transitions Pregnant -> Nursing
            if (isNewBirth) {
                syncDamPostBirth(formData.damId_public);
            }

            // Update all linked offspring to have the correct parents.
            // Use allSettled so that offspring the user no longer owns (transferred/sold)
            // don't abort the litter save — those animals are skipped silently.
            const linkedOffspringIds = formData.linkedOffspringIds || [];
            if (linkedOffspringIds.length > 0) {
                const parentPatch = { sireId_public: formData.sireId_public || null, damId_public: formData.damId_public || null };
                const updateOffspringPromises = linkedOffspringIds.map(offspringId =>
                    axios.put(`${API_BASE_URL}/animals/${offspringId}`, parentPatch, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    }).then(() => window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: offspringId, ...parentPatch } })))
                      .catch(err => console.warn(`[updateLitter] Could not update parent links for offspring ${offspringId} (may no longer be owned):`, err?.response?.data?.message || err?.message))
                );
                await Promise.allSettled(updateOffspringPromises);
            }

            showModalMessage('Success', 'Litter updated successfully!');
            setShowAddForm(false);
            setEditingLitter(null);
            setLitterImages([]);
            setSelectedSireAnimal(null);
            setSelectedDamAnimal(null);
            setFormData({
                breedingPairCodeName: '',
                sireId_public: '',
                damId_public: '',
                species: '',
                otherParent1Id_public: '',
                otherParent1Role: '',
                birthDate: '',
                maleCount: null,
                femaleCount: null,
                notes: '',
                linkedOffspringIds: [],
                // Enhanced breeding record fields
                breedingMethod: 'Unknown',
                breedingConditionAtTime: '',
                matingDate: '',
                expectedDueDate: '',
                outcome: 'Unknown',
                birthMethod: '',
                litterSizeBorn: null,
                litterSizeWeaned: null,
                stillbornCount: null,
                lossesCount: null,
                weaningDate: ''
            });
            setCreateOffspringCounts({ males: 0, females: 0, unknown: 0 });
            // setSireSearch('');
            // setDamSearch('');
            // setSireSpeciesFilter('');
            // setDamSpeciesFilter('');
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
            // Fall back to litter's populated sire/dam data for global animals
            const sire = myAnimals.find(a => a.id_public === addingOffspring.sireId_public);
            const offspringSpecies = sire?.species || addingOffspring.sire?.species || addingOffspring.dam?.species || '';
            
            const animalData = {
                name: newOffspringData.name,
                species: offspringSpecies,
                gender: newOffspringData.gender,
                birthDate: addingOffspring.birthDate,
                status: 'Pet',
                sireId_public: addingOffspring.sireId_public,
                damId_public: addingOffspring.damId_public,
                color: newOffspringData.color || null,
                coat: newOffspringData.coat || null,
                remarks: newOffspringData.remarks || null,
                isOwned: true,
                breederId_public: userProfile.id_public,
                creatorId_public: userProfile.id_public
            };

            const response = await axios.post(`${API_BASE_URL}/animals`, animalData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            const newAnimalId = response.data.id_public;

            // Calculate inbreeding coefficient in the background — don't block the save
            axios.get(`${API_BASE_URL}/animals/${newAnimalId}/inbreeding`, {
                params: { generations: 50 },
                headers: { Authorization: `Bearer ${authToken}` }
            }).catch(() => {});

            // Link to litter and recalculate gender + total counts
            const updatedOffspringIds = [...(addingOffspring.offspringIds_public || []), newAnimalId];
            const existingOffspring = myAnimals.filter(a => (addingOffspring.offspringIds_public || []).includes(a.id_public));
            const allLinked = [...existingOffspring, { gender: newOffspringData.gender }];
            const counts = calcLitterCounts(addingOffspring, allLinked);

            await axios.put(`${API_BASE_URL}/litters/${addingOffspring._id}`, {
                offspringIds_public: updatedOffspringIds,
                ...counts
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            // Optimistically add the new animal to the offspring list immediately
            // so it appears in the UI without waiting for the full fetchLitters() refetch.
            const newAnimal = response.data;
            setLitterOffspringMap(prev => ({
                ...prev,
                [addingOffspring._id]: [...(prev[addingOffspring._id] || []), newAnimal]
            }));

            showModalMessage('Success', 'Offspring added to litter!');
            setAddingOffspring(null);
            fetchLitters({ preserveOffspring: true });
            fetchMyAnimals();
        } catch (error) {
            console.error('Error adding offspring:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to add offspring');
        }
    };

    const maleAnimals = myAnimals.filter(a => a.gender === 'Male');
    const femaleAnimals = myAnimals.filter(a => a.gender === 'Female');
    const availableYears = useMemo(() => {
        const years = litters
            .map(litter => litter.birthDate || litter.matingDate || litter.pairingDate)
            .filter(Boolean)
            .map(dateStr => {
                const parsedDate = new Date(dateStr);
                return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.getFullYear();
            })
            .filter(Boolean);
        const uniqueYears = [...new Set(years)];
        uniqueYears.sort((a, b) => b - a);
        return uniqueYears;
    }, [litters]);
    // Species actually present among current litters (via sire, falling back to dam) — keeps the
    // filter dropdown from listing species the user has no litters for.
    const availableSpeciesInLitters = useMemo(() => {
        const speciesSet = new Set();
        litters.forEach(litter => {
            const sire = litter.sire || myAnimals.find(a => a.id_public === litter.sireId_public);
            const dam = litter.dam || myAnimals.find(a => a.id_public === litter.damId_public);
            const species = sire?.species || dam?.species;
            if (species) speciesSet.add(species);
        });
        return DEFAULT_SPECIES_OPTIONS.filter(s => speciesSet.has(s));
    }, [litters, myAnimals]);
    
    // Filtered animals are handled directly in the render sections below
    
    // Get unique species from all animals (currently for debugging)
    // const allSpecies = [...new Set(myAnimals.map(a => a.species).filter(Boolean))].sort();
    
    // Filter litters based on search query and species
    const filteredLitters = litters.filter(litter => {
        // Use populated parent data first (covers transferred/hidden animals), fall back to myAnimals
        const sire = litter.sire || myAnimals.find(a => a.id_public === litter.sireId_public);
        const dam  = litter.dam  || myAnimals.find(a => a.id_public === litter.damId_public);

        // Status filter
        if (litterStatusFilter !== 'all') {
            const hasBirth = !!litter.birthDate;
            const hasPregnancy = !!litter.pregnancyDate;
            const isMated = !litter.isPlanned && !!litter.matingDate && !hasPregnancy && !hasBirth;
            const isPregnant = hasPregnancy && !hasBirth;
            const isPlannedOnly = litter.isPlanned && !hasPregnancy && !hasBirth;
            const isBorn = hasBirth;
            if (litterStatusFilter === 'planned' && !isPlannedOnly) return false;
            if (litterStatusFilter === 'mated'   && !isMated)       return false;
            if (litterStatusFilter === 'pregnant' && !isPregnant)   return false;
            if (litterStatusFilter === 'born'    && !isBorn)        return false;
        }

        // Species filter
        if (speciesFilter) {
            if (sire?.species !== speciesFilter) return false;
        }

        // Year filter (birthDate fallback to matingDate/pairingDate)
        if (yearFilter) {
            const referenceDate = litter.birthDate || litter.matingDate || litter.pairingDate;
            if (!referenceDate) return false;
            const parsedDate = new Date(referenceDate);
            const litterYear = Number.isNaN(parsedDate.getTime()) ? null : parsedDate.getFullYear();
            if (!litterYear || litterYear.toString() !== yearFilter) return false;
        }
        
        // Search filter
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        
        // Search by CTL-ID
        if (litter.litter_id_public && litter.litter_id_public.toLowerCase().includes(query)) return true;
        
        // Search by litter name
        if (litter.breedingPairCodeName && litter.breedingPairCodeName.toLowerCase().includes(query)) return true;
        
        // Search by sire name or ID
        if (sire?.name?.toLowerCase().includes(query)) return true;
        if (sire?.id_public?.toString().includes(query)) return true;
        if (litter.sireId_public?.toString().includes(query)) return true;
        
        // Search by dam name or ID
        if (dam?.name?.toLowerCase().includes(query)) return true;
        if (dam?.id_public?.toString().includes(query)) return true;
        if (litter.damId_public?.toString().includes(query)) return true;
        
        return false;
    }).sort((a, b) => {
        // Sort order: Planned → Mated → Pregnant → Born (newest first)
        const aHasBirth = !!a.birthDate;
        const bHasBirth = !!b.birthDate;
        const aHasPregnancy = !!a.pregnancyDate;
        const bHasPregnancy = !!b.pregnancyDate;
        const aIsPlannedOnly = a.isPlanned && !aHasPregnancy && !aHasBirth;
        const bIsPlannedOnly = b.isPlanned && !bHasPregnancy && !bHasBirth;
        const aIsMated = !a.isPlanned && !!a.matingDate && !aHasPregnancy && !aHasBirth;
        const bIsMated = !b.isPlanned && !!b.matingDate && !bHasPregnancy && !bHasBirth;
        const aIsPregnant = aHasPregnancy && !aHasBirth;
        const bIsPregnant = bHasPregnancy && !bHasBirth;
        const rank = (l, isPlannedOnly, isMated, isPregnant) => isPregnant ? 0 : isMated ? 1 : isPlannedOnly ? 2 : 3;
        const aRank = rank(a, aIsPlannedOnly, aIsMated, aIsPregnant);
        const bRank = rank(b, bIsPlannedOnly, bIsMated, bIsPregnant);
        if (aRank !== bRank) return aRank - bRank;
        // Within same group: newest date first
        const aDate = (a.birthDate || a.matingDate) ? new Date(a.birthDate || a.matingDate).getTime() : null;
        const bDate = (b.birthDate || b.matingDate) ? new Date(b.birthDate || b.matingDate).getTime() : null;
        if (aDate === null && bDate === null) return 0;
        if (aDate === null) return 1;
        if (bDate === null) return -1;
        return bDate - aDate;
    });

    const litterStats = filteredLitters.reduce((acc, l) => {
        acc.litters++;
        acc.males   += l.maleCount   ?? 0;
        acc.females += l.femaleCount ?? 0;
        acc.unknown += l.unknownCount ?? 0;
        return acc;
    }, { litters: 0, males: 0, females: 0, unknown: 0 });

    return (
        <div className="w-full max-w-7xl bg-white dark:bg-dark-card-bg border border-transparent dark:border-dark-text-muted p-3 sm:p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-dark-text flex items-center gap-2">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary-dark" />Litter Management
                    <InfoButton title="Litter Management" lessonId="litter-management">
                        <p>Record planned matings, track pregnancies, and log litters with offspring counts and details.</p>
                    </InfoButton>
                </h2>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={handleRecalculateOffspringCounts}
                        className="bg-primary dark:bg-dark-primary hover:bg-primary/90 text-black font-semibold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg flex items-center"
                        title="Recalculate offspring counts for all litters"
                    >
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    {/* + Mating / + Litter — grouped so they never split across rows */}
                    <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-dark-text-muted shadow-sm">
                        {/* Mating button */}
                        <button
                            onClick={() => {
                                if (!showAddMatingForm) { setShowAddForm(false); setEditingLitter(null); setCreateOffspringCounts({ males: 0, females: 0, unknown: 0 }); }
                                setShowAddMatingForm(!showAddMatingForm);
                                if (showAddMatingForm) resetMatingForm();
                            }}
                            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors border-r border-gray-200 dark:border-dark-text-muted whitespace-nowrap ${showAddMatingForm ? 'bg-gray-100 dark:bg-dark-card-bg text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-surface-hover' : 'bg-primary dark:bg-dark-primary text-black hover:bg-primary-dark'}`}
                            title="Record a planned mating"
                        >
                            {showAddMatingForm ? <X size={14} /> : <Plus size={14} />}
                            <span>Mating</span>
                        </button>
                        {/* Litter button */}
                        <button
                            onClick={() => {
                                if (showAddForm) {
                                    setEditingLitter(null);
                                    setCreateOffspringCounts({ males: 0, females: 0, unknown: 0 });
                                    setPredictedCOI(null);
                                    setFormData({
                                        breedingPairCodeName: '',
                                        sireId_public: '',
                                        damId_public: '',
                                        otherParent1Id_public: '',
                                        otherParent1Role: '',
                                        otherParent2Id_public: '',
                                        otherParent2Role: '',
                                        birthDate: '',
                                        maleCount: '',
                                        femaleCount: '',
                                        notes: '',
                                        linkedOffspringIds: []
                                    });
                                }
                                if (!showAddForm) setShowAddMatingForm(false);
                                setShowAddForm(!showAddForm);
                            }}
                            data-tutorial-target="new-litter-btn"
                            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${showAddForm ? 'bg-gray-100 dark:bg-dark-card-bg text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-surface-hover' : 'bg-primary dark:bg-dark-primary text-black hover:bg-primary-dark'}`}
                        >
                            {showAddForm ? <X size={14} /> : <Plus size={14} />}
                            <span>Litter</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-dark-text-muted mb-4 sm:mb-6 pl-0.5">
                <span><span className="font-semibold text-gray-700 dark:text-dark-text-secondary">{litterStats.litters}</span> Litters</span>
                <span className="border-l border-gray-200 dark:border-dark-text-muted pl-4"><span className="font-semibold text-blue-600 dark:text-blue-400">{litterStats.males}</span> Males</span>
                <span className="border-l border-gray-200 dark:border-dark-text-muted pl-4"><span className="font-semibold text-pink-500 dark:text-pink-400">{litterStats.females}</span> Females</span>
                <span className="border-l border-gray-200 dark:border-dark-text-muted pl-4"><span className="font-semibold text-gray-500 dark:text-dark-text-muted">{litterStats.unknown}</span> Unknown</span>
                <InfoButton title="The Expanded Litter Card" lessonId="litter-expanded-view">
                    <p>Click any litter card to expand it — status transition buttons (Mated today, Assign Pregnant, Born today, Mark Weaned) and offspring management both live inside the expanded view.</p>
                </InfoButton>
            </div>

            {loading && litters.length === 0 && (
                /* Skeleton litter cards ? shown only until first fetch completes */
                <div className="space-y-3 animate-pulse mt-2">
                    {[0,1,2,3].map(i => (
                        <div key={i} className="border border-gray-200 dark:border-dark-text-muted rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-5 w-40 bg-gray-200 dark:bg-dark-card-bg rounded" />
                                <div className="h-5 w-20 bg-gray-200 dark:bg-dark-card-bg rounded" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="h-4 bg-gray-100 dark:bg-dark-card-bg rounded" />
                                <div className="h-4 bg-gray-100 dark:bg-dark-card-bg rounded" />
                                <div className="h-4 bg-gray-100 dark:bg-dark-card-bg rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Litter Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-dark-card-bg border border-transparent dark:border-dark-text-muted rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center border-b dark:border-dark-text-muted p-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text flex items-center gap-2">
                                {editingLitter ? 'Edit Litter' : 'Create New Litter'}
                                {/* No lessonId — this is an open, unsaved form, so no "View related tutorial" nav-away link. */}
                                <InfoButton title="Recording Birth Details">
                                    <p>Birth Date, Litter Size (by sex), and Notes here create a real Litter record — this is what counts toward pedigrees, offspring links, and COI, unlike a manual pedigree-only note.</p>
                                </InfoButton>
                            </h3>
                            <button 
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingLitter(null);
                                    setCreateOffspringCounts({ males: 0, females: 0, unknown: 0 });
                                    setSelectedSireAnimal(null);
                                    setSelectedDamAnimal(null);
                                    setShowSpeciesPicker(false);
                                }}
                                className="text-gray-500 dark:text-dark-text-muted hover:text-gray-800 dark:hover:text-dark-text"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4">
                            <form onSubmit={editingLitter ? handleUpdateLitter : handleSubmit} id="litter-form" className="space-y-4">
                                {/* Litter Photos ? always visible, including while converting a still-Planned litter */}
                                <div className="mb-2 p-4 border border-amber-200 dark:border-amber-800/40 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                        <h4 className="text-md font-semibold text-gray-700 dark:text-dark-text-secondary mb-3 flex items-center gap-2">
                                            <Camera size={16} className="inline-block align-middle mr-1" /> Litter Photos
                                            <span className="text-xs font-normal text-gray-400 dark:text-dark-text-muted">({editingLitter ? litterImages.filter(i => i.r2Key !== '__uploading__').length : pendingLitterImages.length}/5)</span>
                                        </h4>

                                        {/* Thumbnail grid */}
                                        {editingLitter ? (
                                            litterImages.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {litterImages.map((img, idx) => (
                                                        <div key={img.r2Key || idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-dark-text-muted group">
                                                            <img src={img.url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                                            {img.r2Key === '__uploading__' ? (
                                                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                                                    <Hourglass size={12} className="inline-block align-middle text-white" />
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleLitterImageDelete(img.r2Key)}
                                                                className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Remove photo"
                                                            ><X size={14} /></button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        ) : (
                                            pendingLitterImages.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {pendingLitterImages.map((item, idx) => (
                                                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-dark-text-muted group">
                                                            <img src={item.previewUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    URL.revokeObjectURL(item.previewUrl);
                                                                    setPendingLitterImages(prev => prev.filter((_, i) => i !== idx));
                                                                }}
                                                                className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Remove photo"
                                            ><X size={14} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        )}

                                        {/* Upload button */}
                                        {(editingLitter ? litterImages.length : pendingLitterImages.length) < 5 && (
                                            <label className={`flex items-center gap-2 px-3 py-2 border-2 border-dashed border-amber-400 rounded-lg cursor-pointer hover:bg-amber-100 transition w-fit text-sm font-medium text-amber-700 ${litterImageUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        if (editingLitter) {
                                                            handleLitterImageUpload(file);
                                                        } else {
                                                            if (pendingLitterImages.length >= 5) return;
                                                            const previewUrl = URL.createObjectURL(file);
                                                            setPendingLitterImages(prev => [...prev, { file, previewUrl }]);
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                />
                                                {litterImageUploading ? <><Loader2 size={14} className="inline-block align-middle animate-spin mr-1" />Uploading?</> : '+ Add Photo'}
                                            </label>
                                        )}
                                        <p className="text-xs text-gray-400 dark:text-dark-text-muted mt-2">{editingLitter ? 'PNG or JPEG, max 500 KB each. Up to 5 photos.' : 'Photos will be uploaded when you save the litter.'}</p>
                                    </div>

                                {/* Auto-assigned CTL-ID (read-only) */}
                                {editingLitter && editingLitter.litter_id_public && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                            System Litter ID (CTL-ID)
                                        </label>
                                        <input
                                            type="text"
                                            value={editingLitter.litter_id_public}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-gray-100 dark:bg-dark-card-bg text-gray-600 dark:text-dark-text-secondary font-mono"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">Auto-assigned for system linkage</p>
                                    </div>
                                )}
                                
                                {/* Litter Name - Full Width */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                        Litter Name/ID
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.breedingPairCodeName}
                                        onChange={(e) => setFormData({...formData, breedingPairCodeName: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="e.g., Summer 2025 Litter A, Disney's Hakuna Matata"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">Your custom name for this breeding pair</p>
                                </div>

                                {/* Species Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                        Species {!editingLitter && <span className="text-red-500">*</span>}
                                        {editingLitter && <span className="ml-1 text-xs text-gray-400 dark:text-dark-text-muted font-normal">(locked ? cannot change on edit)</span>}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => !editingLitter && setShowSpeciesPicker(true)}
                                        disabled={!!editingLitter}
                                        className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg text-left transition focus:ring-2 focus:ring-primary focus:border-transparent ${
                                            editingLitter
                                                ? 'bg-gray-100 dark:bg-dark-card-bg text-gray-500 dark:text-dark-text-muted cursor-not-allowed opacity-75'
                                                : 'bg-white dark:bg-dark-card-bg hover:bg-gray-50 dark:hover:bg-dark-surface-hover'
                                        }`}
                                    >
                                        {formData.species ? (
                                            <span className="font-medium text-gray-800 dark:text-dark-text">{formData.species}</span>
                                        ) : (
                                            <span className="text-gray-400 dark:text-dark-text-muted">Click to select species...</span>
                                        )}
                                    </button>
                                    {!editingLitter && <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">Choose species to filter the sire &amp; dam search</p>}
                                </div>

                                {/* Sire & Dam Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Sire Selection */}
                                    <div data-tutorial-target="sire-dam-section">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                            Sire (Father) {!editingLitter && <span className="text-red-500">*</span>}
                                            {editingLitter && <span className="ml-1 text-xs text-gray-400 dark:text-dark-text-muted font-normal">(locked)</span>}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => !editingLitter && setModalTarget('sire-litter')}
                                            disabled={!!editingLitter || !formData.species}
                                            className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text text-left transition focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-dark-surface disabled:opacity-75 disabled:cursor-not-allowed${editingLitter ? '' : ' hover:bg-gray-50 dark:hover:bg-dark-surface-hover'}`}
                                        >
                                            {formData.sireId_public ? (
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">
                                                            {myAnimals.find(a => a.id_public === formData.sireId_public)?.name || selectedSireAnimal?.name || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-dark-text-muted">
                                                            {formData.sireId_public}
                                                        </div>
                                                    </div>
                                                    {!myAnimals.find(a => a.id_public === formData.sireId_public) && selectedSireAnimal && (
                                                        <span className="text-xs text-black bg-primary dark:bg-dark-primary px-2 py-1 rounded-full flex-shrink-0">Global</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 dark:text-dark-text-muted">{formData.species ? 'Select Sire...' : 'Select species first'}</div>
                                            )}
                                        </button>
                                    </div>

                                    {/* Dam Selection */}
                                    <div data-tutorial-target="sire-dam-section">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                            Dam (Mother) {!editingLitter && <span className="text-red-500">*</span>}
                                            {editingLitter && <span className="ml-1 text-xs text-gray-400 dark:text-dark-text-muted font-normal">(locked)</span>}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => !editingLitter && setModalTarget('dam-litter')}
                                            disabled={!!editingLitter || !formData.species}
                                            className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text text-left transition focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-dark-surface disabled:opacity-75 disabled:cursor-not-allowed${editingLitter ? '' : ' hover:bg-gray-50 dark:hover:bg-dark-surface-hover'}`}
                                        >
                                            {formData.damId_public ? (
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">
                                                            {myAnimals.find(a => a.id_public === formData.damId_public)?.name || selectedDamAnimal?.name || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-dark-text-muted">
                                                            {formData.damId_public}
                                                        </div>
                                                    </div>
                                                    {!myAnimals.find(a => a.id_public === formData.damId_public) && selectedDamAnimal && (
                                                        <span className="text-xs text-black bg-primary dark:bg-dark-primary px-2 py-1 rounded-full flex-shrink-0">Global</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 dark:text-dark-text-muted">{formData.species ? 'Select Dam...' : 'Select species first'}</div>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Breeding Information */}
                                <div className="mb-6 p-4 border border-purple-200 dark:border-purple-800/40 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-dark-text-secondary mb-4 flex items-center">
                                        <Dna size={18} className="inline-block align-middle text-purple-600 mr-2 flex-shrink-0" />Breeding Information
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        {/* Breeding Method */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Breeding Method
                                            </label>
                                            <select
                                                value={formData.breedingMethod || 'Unknown'}
                                                onChange={(e) => setFormData({...formData, breedingMethod: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="Natural">Natural</option>
                                                <option value="AI">Artificial Insemination</option>
                                                <option value="Assisted">Assisted</option>
                                                <option value="Unknown">Unknown</option>
                                            </select>
                                        </div>

                                        {/* Breeding Condition */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                                Breeding Condition
                                            </label>
                                            <select
                                                value={formData.breedingConditionAtTime || ''}
                                                onChange={(e) => setFormData({...formData, breedingConditionAtTime: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select Condition...</option>
                                                <option value="Good">Good</option>
                                                <option value="Okay">Okay</option>
                                                <option value="Poor">Poor</option>
                                            </select>
                                        </div>

                                        {/* Outcome Status */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                                Breeding Outcome
                                            </label>
                                            <select
                                                value={formData.outcome || 'Unknown'}
                                                onChange={(e) => setFormData({...formData, outcome: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="Successful">Successful</option>
                                                <option value="Unsuccessful">Unsuccessful</option>
                                                <option value="Unknown">Unknown</option>
                                            </select>
                                        </div>

                                        {/* Pregnancy Lost Checkbox - only show for mated litters without birth date */}
                                        {formData.matingDate && !formData.birthDate && (
                                            <div className="col-span-full">
                                                <label className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.pregnancyLost || false}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            pregnancyLost: e.target.checked,
                                                            pregnancyLostReason: e.target.checked ? (formData.pregnancyLostReason || 'Unknown') : null,
                                                            pregnancyLostNotes: e.target.checked ? formData.pregnancyLostNotes : null
                                                        })}
                                                        className="form-checkbox h-5 w-5 text-amber-600 rounded focus:ring-amber-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                                                        Pregnancy confirmed but no litter produced
                                                    </span>
                                                </label>
                                                
                                                {formData.pregnancyLost && (
                                                    <div className="mt-3 space-y-3 pl-7">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                                                Reason
                                                            </label>
                                                            <select
                                                                value={formData.pregnancyLostReason || 'Unknown'}
                                                                onChange={(e) => setFormData({...formData, pregnancyLostReason: e.target.value})}
                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                                            >
                                                                <option value="Cannibalized">Cannibalized (mom ate litter)</option>
                                                                <option value="All Stillborn">All Stillborn</option>
                                                                <option value="Reabsorbed">Reabsorbed</option>
                                                                <option value="Unknown">Unknown</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                                                Notes (optional)
                                                            </label>
                                                            <textarea
                                                                value={formData.pregnancyLostNotes || ''}
                                                                onChange={(e) => setFormData({...formData, pregnancyLostNotes: e.target.value})}
                                                                placeholder="Additional details about the pregnancy loss..."
                                                                rows={2}
                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Mating Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                                Mating Date
                                            </label>
                                            <DatePicker
                                                value={formData.matingDate || ''}
                                                onChange={(e) => setFormData({...formData, matingDate: e.target.value})}
                                                maxDate={new Date()}
                                                className="px-3 py-2"
                                            />
                                            <p className="text-xs text-gray-400 dark:text-dark-text-muted mt-1">Use + Mating to schedule a future mating</p>
                                        </div>

                                        {/* Expected Due Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                                Expected Due Date
                                            </label>
                                            <DatePicker
                                                value={formData.expectedDueDate || ''}
                                                onChange={(e) => setFormData({...formData, expectedDueDate: e.target.value})}
                                                className="px-3 py-2"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">Optional — shows on calendar</p>
                                        </div>

                                        {/* Birth Method */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                                Birth Method
                                            </label>
                                            <select
                                                value={formData.birthMethod || ''}
                                                onChange={(e) => setFormData({...formData, birthMethod: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select Method...</option>
                                                <option value="Natural">Natural</option>
                                                <option value="C-Section">C-Section</option>
                                                <option value="Assisted">Assisted</option>
                                                <option value="Induced">Induced</option>
                                                <option value="Unknown">Unknown</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Birth Date & Offspring Counts */}
                                <div className="mb-6 p-4 border border-blue-200 dark:border-blue-800/40 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-dark-text-secondary mb-4 flex items-center">
                                        <Baby size={18} className="inline-block align-middle text-blue-600 mr-2 flex-shrink-0" />Birth & Offspring Details
                                    </h4>

                                    {/* Row 1: Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" data-tutorial-target="litter-dates-counts">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                                Birth Date <span className="text-xs text-gray-400 dark:text-dark-text-muted font-normal">(optional)</span>
                                            </label>
                                            <DatePicker
                                                value={formData.birthDate}
                                                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                                                maxDate={new Date()}
                                                className="px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                                Weaning Date <span className="text-xs text-gray-400 dark:text-dark-text-muted font-normal">(optional — shows on calendar)</span>
                                            </label>
                                            <DatePicker
                                                value={formData.weaningDate || ''}
                                                onChange={(e) => setFormData({...formData, weaningDate: e.target.value})}
                                                className="px-3 py-2"
                                            />

                                        </div>
                                    </div>

                                    {/* Row 2: Total Born (auto) + sex breakdown */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        {/* Total Born - read-only, summed from M+F+U */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                                Total Born
                                            </label>
                                            <input
                                                type="number"
                                                value={typeof formData.litterSizeBorn === 'number' ? formData.litterSizeBorn : (formData.litterSizeBorn || '')}
                                                readOnly
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg text-gray-700 dark:text-dark-text-secondary cursor-not-allowed font-semibold"
                                                placeholder="0"
                                            />
                                            <p className="text-xs text-gray-400 dark:text-dark-text-muted mt-1">Auto-calculated from M + F + U</p>
                                        </div>

                                        {/* Male Count */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Males</label>
                                            <input
                                                type="number"
                                                value={typeof formData.maleCount === 'number' ? formData.maleCount : (formData.maleCount || '')}
                                                onChange={(e) => {
                                                    const v = e.target.value ? parseInt(e.target.value) : null;
                                                    const f = formData.femaleCount || 0;
                                                    const u = formData.unknownCount || 0;
                                                    setFormData({...formData, maleCount: v, litterSizeBorn: (v || 0) + f + u || null});
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="0"
                                                min={myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && a.gender === 'Male').length || 0}
                                            />
                                            {(() => { const lm = myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && a.gender === 'Male').length; return lm > 0 && (formData.maleCount || 0) < lm ? (<p className="text-xs text-red-600 mt-1">⚠ {lm} male{lm > 1 ? 's' : ''} linked — can't be below {lm}</p>) : lm > 0 ? (<p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">{lm} male{lm > 1 ? 's' : ''} linked</p>) : null; })()}
                                        </div>

                                        {/* Female Count */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Females</label>
                                            <input
                                                type="number"
                                                value={typeof formData.femaleCount === 'number' ? formData.femaleCount : (formData.femaleCount || '')}
                                                onChange={(e) => {
                                                    const v = e.target.value ? parseInt(e.target.value) : null;
                                                    const m = formData.maleCount || 0;
                                                    const u = formData.unknownCount || 0;
                                                    setFormData({...formData, femaleCount: v, litterSizeBorn: m + (v || 0) + u || null});
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="0"
                                                min={myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && a.gender === 'Female').length || 0}
                                            />
                                            {(() => { const lf = myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && a.gender === 'Female').length; return lf > 0 && (formData.femaleCount || 0) < lf ? (<p className="text-xs text-red-600 mt-1">⚠ {lf} female{lf > 1 ? 's' : ''} linked — can't be below {lf}</p>) : lf > 0 ? (<p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">{lf} female{lf > 1 ? 's' : ''} linked</p>) : null; })()}
                                        </div>

                                        {/* Unknown/Intersex Count */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Unknown / Intersex</label>
                                            <input
                                                type="number"
                                                value={typeof formData.unknownCount === 'number' ? formData.unknownCount : (formData.unknownCount || '')}
                                                onChange={(e) => {
                                                    const v = e.target.value ? parseInt(e.target.value) : null;
                                                    const m = formData.maleCount || 0;
                                                    const f = formData.femaleCount || 0;
                                                    setFormData({...formData, unknownCount: v, litterSizeBorn: m + f + (v || 0) || null});
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="0"
                                                min={myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && (a.gender === 'Unknown' || a.gender === 'Intersex' || !a.gender)).length || 0}
                                            />
                                            {(() => { const lu = myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && (a.gender === 'Unknown' || a.gender === 'Intersex' || !a.gender)).length; return lu > 0 && (formData.unknownCount || 0) < lu ? (<p className="text-xs text-red-600 mt-1">⚠ {lu} unknown linked — can't be below {lu}</p>) : lu > 0 ? (<p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">{lu} unknown linked</p>) : null; })()}
                                        </div>
                                    </div>

                                    {/* Row 3: Outcomes */}
                                    <div className="space-y-4">
                                        {/* Stillborn - matching Total Born layout */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                                                Stillborn (Born dead)
                                            </label>
                                            
                                            {/* Checkbox to extract from total counts */}
                                            <div className="mb-3">
                                                <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-dark-text-secondary cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.extractStillbornFromTotal || false}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setFormData(prev => {
                                                                if (checked) {
                                                                    // Extract stillborn from gender counts
                                                                    const newMale = Math.max(0, (prev.maleCount || 0) - (prev.maleStillborn || 0));
                                                                    const newFemale = Math.max(0, (prev.femaleCount || 0) - (prev.femaleStillborn || 0));
                                                                    const newUnknown = Math.max(0, (prev.unknownCount || 0) - (prev.unknownStillborn || 0));
                                                                    return {
                                                                        ...prev,
                                                                        extractStillbornFromTotal: true,
                                                                        maleCount: newMale || null,
                                                                        femaleCount: newFemale || null,
                                                                        unknownCount: newUnknown || null,
                                                                        litterSizeBorn: (newMale + newFemale + newUnknown) || null
                                                                    };
                                                                } else {
                                                                    // Add stillborn back to gender counts
                                                                    const newMale = (prev.maleCount || 0) + (prev.maleStillborn || 0);
                                                                    const newFemale = (prev.femaleCount || 0) + (prev.femaleStillborn || 0);
                                                                    const newUnknown = (prev.unknownCount || 0) + (prev.unknownStillborn || 0);
                                                                    return {
                                                                        ...prev,
                                                                        extractStillbornFromTotal: false,
                                                                        maleCount: newMale || null,
                                                                        femaleCount: newFemale || null,
                                                                        unknownCount: newUnknown || null,
                                                                        litterSizeBorn: (newMale + newFemale + newUnknown) || null
                                                                    };
                                                                }
                                                            });
                                                        }}
className="rounded border-gray-300 dark:border-dark-text-muted text-primary focus:ring-primary"
                                                    />
                                                    <span>Extract stillborn from total counts (reduce M/F/U counts by stillborn amounts)</span>
                                                </label>
                                                <p className="text-xs text-gray-400 dark:text-dark-text-muted mt-1 ml-6">
                                                    When enabled, stillborn will be subtracted from the gender counts above, showing only live-born offspring.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                {/* Total Stillborn - read-only, summed from M+F+U */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                                        Total Stillborn
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={typeof formData.stillbornCount === 'number' ? formData.stillbornCount : (formData.stillbornCount || '')}
                                                        readOnly
                                                        className="w-full px-3 py-2 border border-gray-200 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg text-gray-700 dark:text-dark-text-secondary cursor-not-allowed font-semibold"
                                                        placeholder="0"
                                                    />
                                                    <p className="text-xs text-gray-400 dark:text-dark-text-muted mt-1">Auto-calculated from M + F + U</p>
                                                </div>

                                                {/* Male Stillborn */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Male Stillborn</label>
                                                    <input
                                                        type="number"
                                                        value={typeof formData.maleStillborn === 'number' ? formData.maleStillborn : (formData.maleStillborn || '')}
                                                        onChange={(e) => {
                                                            const v = e.target.value ? parseInt(e.target.value) : null;
                                                            const f = formData.femaleStillborn || 0;
                                                            const u = formData.unknownStillborn || 0;
                                                            setFormData({...formData, maleStillborn: v, stillbornCount: (v || 0) + f + u || null});
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>

                                                {/* Female Stillborn */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Female Stillborn</label>
                                                    <input
                                                        type="number"
                                                        value={typeof formData.femaleStillborn === 'number' ? formData.femaleStillborn : (formData.femaleStillborn || '')}
                                                        onChange={(e) => {
                                                            const v = e.target.value ? parseInt(e.target.value) : null;
                                                            const m = formData.maleStillborn || 0;
                                                            const u = formData.unknownStillborn || 0;
                                                            setFormData({...formData, femaleStillborn: v, stillbornCount: m + (v || 0) + u || null});
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>

                                                {/* Unknown Stillborn */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Unknown Stillborn</label>
                                                    <input
                                                        type="number"
                                                        value={typeof formData.unknownStillborn === 'number' ? formData.unknownStillborn : (formData.unknownStillborn || '')}
                                                        onChange={(e) => {
                                                            const v = e.target.value ? parseInt(e.target.value) : null;
                                                            const m = formData.maleStillborn || 0;
                                                            const f = formData.femaleStillborn || 0;
                                                            setFormData({...formData, unknownStillborn: v, stillbornCount: m + f + (v || 0) || null});
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Losses - matching Total Born layout */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                                                Losses (Died after birth)
                                            </label>
                                            
                                            {/* Checkbox to extract from total counts */}
                                            <div className="mb-3">
                                                <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-dark-text-secondary cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.extractLossesFromTotal || false}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setFormData(prev => {
                                                                if (checked) {
                                                                    // Extract losses from gender counts
                                                                    const newMale = Math.max(0, (prev.maleCount || 0) - (prev.maleLosses || 0));
                                                                    const newFemale = Math.max(0, (prev.femaleCount || 0) - (prev.femaleLosses || 0));
                                                                    const newUnknown = Math.max(0, (prev.unknownCount || 0) - (prev.unknownLosses || 0));
                                                                    return {
                                                                        ...prev,
                                                                        extractLossesFromTotal: true,
                                                                        maleCount: newMale || null,
                                                                        femaleCount: newFemale || null,
                                                                        unknownCount: newUnknown || null,
                                                                        litterSizeBorn: (newMale + newFemale + newUnknown) || null
                                                                    };
                                                                } else {
                                                                    // Add losses back to gender counts
                                                                    const newMale = (prev.maleCount || 0) + (prev.maleLosses || 0);
                                                                    const newFemale = (prev.femaleCount || 0) + (prev.femaleLosses || 0);
                                                                    const newUnknown = (prev.unknownCount || 0) + (prev.unknownLosses || 0);
                                                                    return {
                                                                        ...prev,
                                                                        extractLossesFromTotal: false,
                                                                        maleCount: newMale || null,
                                                                        femaleCount: newFemale || null,
                                                                        unknownCount: newUnknown || null,
                                                                        litterSizeBorn: (newMale + newFemale + newUnknown) || null
                                                                    };
                                                                }
                                                            });
                                                        }}
                                                        className="rounded border-gray-300 dark:border-dark-text-muted text-primary focus:ring-primary"
                                                    />
                                                    <span>Extract losses from total counts (reduce M/F/U counts by loss amounts)</span>
                                                </label>
                                                <p className="text-xs text-gray-400 dark:text-dark-text-muted mt-1 ml-6">
                                                    When enabled, losses will be subtracted from the gender counts above, showing only surviving offspring.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                {/* Total Losses - read-only, summed from M+F+U */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                                        Total Losses
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={typeof formData.lossesCount === 'number' ? formData.lossesCount : (formData.lossesCount || '')}
                                                        readOnly
                                                        className="w-full px-3 py-2 border border-gray-200 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg text-gray-700 dark:text-dark-text-secondary cursor-not-allowed font-semibold"
                                                        placeholder="0"
                                                    />
                                                    <p className="text-xs text-gray-400 dark:text-dark-text-muted mt-1">Auto-calculated from M + F + U</p>
                                                </div>

                                                {/* Male Losses */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Male Losses</label>
                                                    <input
                                                        type="number"
                                                        value={typeof formData.maleLosses === 'number' ? formData.maleLosses : (formData.maleLosses || '')}
                                                        onChange={(e) => {
                                                            const v = e.target.value ? parseInt(e.target.value) : null;
                                                            const f = formData.femaleLosses || 0;
                                                            const u = formData.unknownLosses || 0;
                                                            setFormData({...formData, maleLosses: v, lossesCount: (v || 0) + f + u || null});
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>

                                                {/* Female Losses */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Female Losses</label>
                                                    <input
                                                        type="number"
                                                        value={typeof formData.femaleLosses === 'number' ? formData.femaleLosses : (formData.femaleLosses || '')}
                                                        onChange={(e) => {
                                                            const v = e.target.value ? parseInt(e.target.value) : null;
                                                            const m = formData.maleLosses || 0;
                                                            const u = formData.unknownLosses || 0;
                                                            setFormData({...formData, femaleLosses: v, lossesCount: m + (v || 0) + u || null});
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>

                                                {/* Unknown Losses */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Unknown Losses</label>
                                                    <input
                                                        type="number"
                                                        value={typeof formData.unknownLosses === 'number' ? formData.unknownLosses : (formData.unknownLosses || '')}
                                                        onChange={(e) => {
                                                            const v = e.target.value ? parseInt(e.target.value) : null;
                                                            const m = formData.maleLosses || 0;
                                                            const f = formData.femaleLosses || 0;
                                                            setFormData({...formData, unknownLosses: v, lossesCount: m + f + (v || 0) || null});
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Total Weaned */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                                Total Weaned
                                            </label>
                                            <input
                                                type="number"
                                                value={typeof formData.litterSizeWeaned === 'number' ? formData.litterSizeWeaned : (formData.litterSizeWeaned || '')}
                                                onChange={(e) => setFormData({...formData, litterSizeWeaned: e.target.value ? parseInt(e.target.value) : null})}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="0"
                                                min="0"
                                            />
                                            <p className="text-xs text-gray-400 dark:text-dark-text-muted mt-1">Survived to weaning</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Link Existing Offspring */}
                                {formData.sireId_public && formData.damId_public && (
                                    <div className="mb-4 border-t dark:border-dark-text-muted pt-4" data-tutorial-target="litter-offspring-sections">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                                            Link Existing Animals as Offspring
                                        </label>
                                        <div className="bg-gray-50 dark:bg-dark-card-bg p-3 rounded-lg">
                                            <p className="text-xs text-gray-600 dark:text-dark-text-secondary mb-3">
                                                Select animals with matching parents to link them to this litter. {formData.birthDate ? 'Only animals with matching birth date are shown.' : 'Birth date will be filled automatically from selected animals.'}
                                            </p>
                                            <div className="space-y-2">
                                                {myAnimals
                                                    .filter(animal => {
                                                        const matchesSire = animal.fatherId_public === formData.sireId_public || animal.sireId_public === formData.sireId_public;
                                                        const matchesDam = animal.motherId_public === formData.damId_public || animal.damId_public === formData.damId_public;
                                                        
                                                        // If litter has birthdate, only show animals with matching birthdate
                                                        if (formData.birthDate && animal.birthDate) {
                                                            const litterDate = formData.birthDate.split('T')[0];
                                                            const animalDate = animal.birthDate.split('T')[0];
                                                            return matchesSire && matchesDam && litterDate === animalDate;
                                                        }
                                                        
                                                        return matchesSire && matchesDam;
                                                    })
                                                    .map(animal => (
                                                        <label key={animal.id_public} className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-dark-surface-hover rounded cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.linkedOffspringIds?.includes(animal.id_public)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        // Check if litter has a birthdate and animal has a different birthdate
                                                                        if (formData.birthDate && animal.birthDate) {
                                                                            const litterDate = formData.birthDate.split('T')[0];
                                                                            const animalDate = animal.birthDate.split('T')[0];
                                                                            
                                                                            if (litterDate !== animalDate) {
                                                                                const confirmChange = window.confirm(
                                                                                    `This animal has a different birth date (${animalDate}) than the litter (${litterDate}).\n\n` +
                                                                                    `Click OK to update the litter birth date to match the animal's date, or Cancel to abort linking.`
                                                                                );
                                                                                
                                                                                if (!confirmChange) {
                                                                                    // User cancelled, abort the link
                                                                                    return;
                                                                                }
                                                                                
                                                                                // User accepted, update litter birthdate and link the animal
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    birthDate: animalDate,
                                                                                    linkedOffspringIds: [...(formData.linkedOffspringIds || []), animal.id_public]
                                                                                });
                                                                                return;
                                                                            }
                                                                        }
                                                                        
                                                                        // Normal linking flow
                                                                        const newLinked = [...(formData.linkedOffspringIds || []), animal.id_public];
                                                                        const newFormData = { ...formData, linkedOffspringIds: newLinked };
                                                                        
                                                                        // Auto-fill birthdate from offspring if litter has no birthdate
                                                                        if (!formData.birthDate && animal.birthDate) {
                                                                            newFormData.birthDate = animal.birthDate.split('T')[0];
                                                                        }
                                                                        
                                                                        setFormData(newFormData);
                                                                    } else {
                                                                        // Unlinking
                                                                        const newLinked = (formData.linkedOffspringIds || []).filter(id => id !== animal.id_public);
                                                                        setFormData({ ...formData, linkedOffspringIds: newLinked });
                                                                    }
                                                                }}
                                                                className="h-4 w-4 text-primary rounded border-gray-300 dark:border-dark-text-muted focus:ring-primary"
                                                            />
                                                            <span className="text-sm text-gray-800 dark:text-dark-text">
                                                                {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`} - {animal.id_public} ({animal.gender}{animal.birthDate ? `, ${new Date(animal.birthDate).toLocaleDateString()}` : ''})
                                                            </span>
                                                        </label>
                                                    ))
                                                }
                                                {myAnimals.filter(animal => {
                                                    const matchesSire = animal.fatherId_public === formData.sireId_public || animal.sireId_public === formData.sireId_public;
                                                    const matchesDam = animal.motherId_public === formData.damId_public || animal.damId_public === formData.damId_public;
                                                    
                                                    // If litter has birthdate, only show animals with matching birthdate
                                                    if (formData.birthDate && animal.birthDate) {
                                                        const litterDate = formData.birthDate.split('T')[0];
                                                        const animalDate = animal.birthDate.split('T')[0];
                                                        return matchesSire && matchesDam && litterDate === animalDate;
                                                    }
                                                    
                                                    return matchesSire && matchesDam;
                                                }).length === 0 && (
                                                    <p className="text-xs text-gray-500 dark:text-dark-text-muted italic">No matching animals found</p>
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
                                    <div className="mb-4 border-t dark:border-dark-text-muted pt-4" data-tutorial-target="litter-offspring-sections">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                                            Create New Offspring Animals
                                        </label>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800/40">
                                            <p className="text-xs text-blue-800 dark:text-blue-300 mb-3">
                                                <strong>Create placeholder animals:</strong> Created with names M1, M2? / F1, F2? You can edit names and details after saving.
                                            </p>
                                            {(() => {
                                                const linkedMales = myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && a.gender === 'Male').length;
                                                const linkedFemales = myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && a.gender === 'Female').length;
                                                const linkedUnknown = myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && (a.gender === 'Unknown' || a.gender === 'Intersex' || !a.gender)).length;
                                                const totalMales = formData.maleCount || 0;
                                                const totalFemales = formData.femaleCount || 0;
                                                const totalUnknown = formData.unknownCount || 0;
                                                const remainingMales = Math.max(0, totalMales - linkedMales);
                                                const remainingFemales = Math.max(0, totalFemales - linkedFemales);
                                                const remainingUnknown = Math.max(0, totalUnknown - linkedUnknown);
                                                const hasCountInfo = totalMales > 0 || totalFemales > 0 || totalUnknown > 0;
                                                return (
                                                    <>
                                                        {hasCountInfo && (
                                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                                {totalMales > 0 && (
                                                                    <div className="bg-white dark:bg-dark-card-bg rounded-lg border border-blue-200 dark:border-blue-800/40 p-3">
                                                                        <div className="flex items-center gap-1 mb-1">
                                                                            <Mars size={13} className="text-blue-500" />
                                                                            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">Males</span>
                                                                        </div>
                                                                        <div className="text-xs text-gray-600 dark:text-dark-text-secondary space-y-0.5">
                                                                            <div>Total set: <span className="font-semibold">{totalMales}</span></div>
                                                                            <div>Already linked: <span className="font-semibold">{linkedMales}</span></div>
                                                                            <div>Remaining: <span className={`font-bold ${remainingMales > 0 ? 'text-blue-600' : 'text-green-600'}`}>{remainingMales}</span></div>
                                                                        </div>
                                                                        {remainingMales > 0 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setCreateOffspringCounts(c => ({...c, males: remainingMales.toString()}))}
                                                                                className="mt-2 w-full px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-semibold rounded transition"
                                                                            >
                                                                                + Add {remainingMales} remaining male{remainingMales > 1 ? 's' : ''}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {totalFemales > 0 && (
                                                                    <div className="bg-white dark:bg-dark-card-bg rounded-lg border border-pink-200 dark:border-pink-800/40 p-3">
                                                                        <div className="flex items-center gap-1 mb-1">
                                                                            <Venus size={13} className="text-pink-500" />
                                                                            <span className="text-pink-600 dark:text-pink-400 font-bold text-sm">Females</span>
                                                                        </div>
                                                                        <div className="text-xs text-gray-600 dark:text-dark-text-secondary space-y-0.5">
                                                                            <div>Total set: <span className="font-semibold">{totalFemales}</span></div>
                                                                            <div>Already linked: <span className="font-semibold">{linkedFemales}</span></div>
                                                                            <div>Remaining: <span className={`font-bold ${remainingFemales > 0 ? 'text-pink-600' : 'text-green-600'}`}>{remainingFemales}</span></div>
                                                                        </div>
                                                                        {remainingFemales > 0 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setCreateOffspringCounts(c => ({...c, females: remainingFemales.toString()}))}
                                                                                className="mt-2 w-full px-2 py-1 bg-pink-100 hover:bg-pink-200 text-pink-800 text-xs font-semibold rounded transition"
                                                                            >
                                                                                + Add {remainingFemales} remaining female{remainingFemales > 1 ? 's' : ''}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {hasCountInfo && (remainingMales > 0 || remainingFemales > 0 || remainingUnknown > 0) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setCreateOffspringCounts({ males: remainingMales.toString(), females: remainingFemales.toString(), unknown: remainingUnknown.toString() })}
                                                                className="w-full mb-3 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition"
                                                            >
                                                                Fill all remaining ({remainingMales}M + {remainingFemales}F + {remainingUnknown}U = {remainingMales + remainingFemales + remainingUnknown} animals)
                                                            </button>
                                                        )}
                                                        {!hasCountInfo && (
                                                            <p className="text-xs text-gray-500 dark:text-dark-text-muted italic">Set the male, female, and unknown counts above to see smart creation options.</p>
                                                        )}
                                                        {hasCountInfo && remainingMales === 0 && remainingFemales === 0 && remainingUnknown === 0 && (
                                                            <p className="text-xs text-green-600 font-semibold flex items-center gap-1"><CheckCircle size={13} /> All offspring are accounted for via linked animals.</p>
                                                        )}
                                                        {(parseInt(createOffspringCounts.males || 0) > 0 || parseInt(createOffspringCounts.females || 0) > 0 || parseInt(createOffspringCounts.unknown || 0) > 0) && (
                                                            <p className="text-xs text-green-600 font-semibold mt-2">
                                                                Will create {(parseInt(createOffspringCounts.males || 0)) + (parseInt(createOffspringCounts.females || 0)) + (parseInt(createOffspringCounts.unknown || 0))} new animal(s)
                                                            </p>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                                        rows="3"
                                        placeholder="Additional notes about this litter..."
                                    />
                                </div>

                            </form>
                    </div>

                    <div className="border-t dark:border-dark-text-muted p-4 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingLitter(null);
                                setCreateOffspringCounts({ males: 0, females: 0, unknown: 0 });
                                setLitterImages([]);
                                pendingLitterImages.forEach(item => URL.revokeObjectURL(item.previewUrl));
                                setPendingLitterImages([]);
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-dark-text-muted text-gray-700 dark:text-dark-text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover font-semibold"
                        >
                            Cancel</button>
                        <button
                            type="submit"
                            form="litter-form"
                            data-tutorial-target="create-litter-btn"
                            className="bg-primary dark:bg-dark-primary hover:bg-primary/90 text-black font-bold py-2 px-6 rounded-lg"
                        >
                            {editingLitter ? 'Update Litter' : 'Create Litter'}
                        </button>
                    </div>
                </div>
            </div>
            )}

            {/* Planned Mating Quick-Add Modal */}
            {showAddMatingForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-dark-card-bg border border-transparent dark:border-dark-text-muted rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="flex justify-between items-center border-b dark:border-dark-text-muted p-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text flex items-center gap-2">
                                <Heart size={18} className="text-indigo-500" />
                                {editingMatingId ? 'Edit Planned Mating' : 'Record Planned Mating'}
                                {/* No lessonId — this is an open, unsaved form, so no "View related tutorial" nav-away link. */}
                                <InfoButton title="Recording a Planned Mating">
                                    <p>Pick a Sire and Dam to start tracking a pairing — status (Mated, Pregnant, Born) is updated later by editing this same entry as things progress.</p>
                                </InfoButton>
                            </h3>
                            <button onClick={() => { setShowAddMatingForm(false); resetMatingForm(); }} className="text-gray-500 dark:text-dark-text-muted hover:text-gray-800 dark:hover:text-dark-text">
                                <X size={22} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitMating} className="p-4 space-y-4 overflow-y-auto max-h-[75vh]">
                            {/* Species */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Species <span className="text-red-500">*</span></label>
                                <button
                                    type="button"
                                    onClick={() => setShowMatingSpeciesPicker(true)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg text-left hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    {matingData.species
                                        ? <span className="font-medium text-gray-800 dark:text-dark-text">{matingData.species}</span>
                                        : <span className="text-gray-400 dark:text-dark-text-muted">Click to select species...</span>}
                                </button>
                                <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">Choose species to filter the sire &amp; dam search</p>
                            </div>
                            {/* Sire */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Sire (Father) <span className="text-red-500">*</span></label>
                                <button
                                    type="button"
                                    onClick={() => setModalTarget('sire-mating')}
                                    disabled={!matingData.species}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text text-left hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-dark-surface disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    {matingData.sireId_public ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{(myAnimals.find(a => a.id_public === matingData.sireId_public) || selectedMatingSire)?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500 dark:text-dark-text-muted">{matingData.sireId_public}</div>
                                            </div>
                                        </div>
                                    ) : <span className="text-gray-400 dark:text-dark-text-muted">{matingData.species ? 'Select Sire...' : 'Select species first'}</span>}
                                </button>
                            </div>
                            {/* Dam */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Dam (Mother) <span className="text-red-500">*</span></label>
                                <button
                                    type="button"
                                    onClick={() => setModalTarget('dam-mating')}
                                    disabled={!matingData.species}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text text-left hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-dark-surface disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    {matingData.damId_public ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{(myAnimals.find(a => a.id_public === matingData.damId_public) || selectedMatingDam)?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500 dark:text-dark-text-muted">{matingData.damId_public}</div>
                                            </div>
                                        </div>
                                    ) : <span className="text-gray-400 dark:text-dark-text-muted">{matingData.species ? 'Select Dam...' : 'Select species first'}</span>}
                                </button>
                            </div>
                            {/* COI display */}
                            {(matingCalcCOI || matingCOI != null) && (
                                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${matingCalcCOI ? 'bg-gray-50 dark:bg-dark-card-bg text-gray-500 dark:text-dark-text-muted' : 'bg-gray-50 dark:bg-dark-card-bg text-gray-700 dark:text-dark-text-secondary'}`}>
                                    {matingCalcCOI
                                        ? <><span className="inline-block w-4 h-4 rounded-full border-2 border-gray-300 dark:border-dark-text-muted border-t-gray-600 dark:border-t-dark-text animate-spin" /> Calculating COI...</>
                                        : <><span className="font-semibold">Predicted COI:</span> {matingCOI.toFixed(2)}%
                                            {matingCOI === 0 && <span className="text-xs ml-1">(unrelated)</span>}
                                          </>
                                    }
                                </div>
                            )}
                            {/* Mating Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Mating Date</label>
                                <DatePicker value={matingData.matingDate} onChange={(e) => setMatingData({...matingData, matingDate: e.target.value})} minDate={new Date()} className="px-3 py-2" />
                                <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">Today or future — shows on calendar as "Mated"</p>
                            </div>
                            {/* Expected Due Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Expected Due Date</label>
                                <DatePicker value={matingData.expectedDueDate} onChange={(e) => setMatingData({...matingData, expectedDueDate: e.target.value})} minDate={matingData.matingDate ? new Date(matingData.matingDate) : new Date()} className="px-3 py-2" />
                                <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">Must be on or after mating date — shows on calendar as "Due"</p>
                            </div>
                            {/* Expandable breeding details */}
                            <button
                                type="button"
                                onClick={() => setShowMatingBreedingDetails(p => !p)}
                                className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                {showMatingBreedingDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                {showMatingBreedingDetails ? 'Hide breeding details' : '+ Breeding details (optional)'}
                            </button>
                            {showMatingBreedingDetails && (
                                <div className="space-y-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Breeding Method</label>
                                        <select
                                            value={matingData.breedingMethod}
                                            onChange={(e) => setMatingData({...matingData, breedingMethod: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                                        >
                                            <option value="Natural">Natural</option>
                                            <option value="AI">Artificial Insemination</option>
                                            <option value="Assisted">Assisted</option>
                                            <option value="Unknown">Unknown</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Breeding Condition</label>
                                        <select
                                            value={matingData.breedingConditionAtTime}
                                            onChange={(e) => setMatingData({...matingData, breedingConditionAtTime: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                                        >
                                            <option value="">Select Condition...</option>
                                            <option value="Good">Good</option>
                                            <option value="Okay">Okay</option>
                                            <option value="Poor">Poor</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Notes</label>
                                <textarea
                                    value={matingData.notes}
                                    onChange={(e) => setMatingData({...matingData, notes: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted focus:ring-2 focus:ring-indigo-400 text-sm"
                                    rows="2"
                                    placeholder="Any notes about this mating..."
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-dark-text-muted">The entry will appear as <span className="font-semibold text-indigo-600 dark:text-indigo-400">Planned</span> until you edit it and add a birth date.</p>
                            <div className="flex gap-3 justify-end border-t dark:border-dark-text-muted pt-3">
                                <button type="button" onClick={() => { setShowAddMatingForm(false); resetMatingForm(); }} className="px-4 py-2 border border-gray-300 dark:border-dark-text-muted text-gray-700 dark:text-dark-text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover font-semibold text-sm">Cancel</button>
                                <button type="submit" className="bg-indigo-600 dark:bg-dark-accent-purple hover:bg-indigo-700 dark:hover:bg-dark-accent-purple/80 text-white font-bold py-2 px-5 rounded-lg text-sm">Save Mating</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Mating Edit Choice Modal */}
            {matingEditChoice && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-dark-card-bg border border-transparent dark:border-dark-text-muted rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text mb-1">Planned Mating</h3>
                        <p className="text-sm text-gray-500 dark:text-dark-text-muted mb-5">
                            {matingEditChoice.litter_id_public && <span className="font-mono bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded text-xs mr-2">{matingEditChoice.litter_id_public}</span>}
                            {[matingEditChoice.sire?.prefix, matingEditChoice.sire?.name].filter(Boolean).join(' ') || matingEditChoice.sireId_public || '?'}
                            {' x '}
                            {[matingEditChoice.dam?.prefix, matingEditChoice.dam?.name].filter(Boolean).join(' ') || matingEditChoice.damId_public || '?'}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleEditMating(matingEditChoice)}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition text-left"
                            >
                                <Heart size={18} className="text-indigo-500 flex-shrink-0" />
                                <div>
                                    <div className="font-semibold text-indigo-800 dark:text-indigo-300 text-sm">Edit Mating</div>
                                    <div className="text-xs text-indigo-500 dark:text-indigo-400">Update sire, dam, dates or notes</div>
                                </div>
                            </button>
                            <button
                                onClick={() => { handleEditLitter(matingEditChoice); setMatingEditChoice(null); }}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition text-left"
                            >
                                <ClipboardList size={18} className="text-violet-600 flex-shrink-0" />
                                <div>
                                    <div className="font-semibold text-violet-800 dark:text-violet-300 text-sm">Convert to Litter</div>
                                    <div className="text-xs text-violet-600 dark:text-violet-400">Record birth date and offspring details</div>
                                </div>
                            </button>
                        </div>
                        <button onClick={() => setMatingEditChoice(null)} className="mt-4 w-full text-center text-sm text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary">Cancel</button>
                    </div>
                </div>
            )}

            {/* Litter List */}
            <div className="space-y-4">
                {/* Search Bar */}
                {litters.length > 0 && (
                    <div className="bg-gray-50 dark:bg-dark-card-bg p-2 sm:p-4 rounded-lg border-2 border-gray-200 dark:border-dark-text-muted space-y-2 sm:space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-muted w-4 h-4 sm:w-5 sm:h-5" />
                            <input
                                type="text"
                                placeholder="Search litters..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        
                        {/* Status filter */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mr-0.5">Show:</span>
                            {[['all','All'],['pregnant','Pregnant'],['mated','Mated'],['planned','Planned'],['born','Born']].map(([val, label]) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setLitterStatusFilter(val)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                                        litterStatusFilter === val
                                            ? val === 'planned' ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                                            : val === 'mated'   ? 'bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                                            : val === 'pregnant' ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300'
                                            : val === 'born'    ? 'bg-violet-100 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300'
                                            : 'bg-primary dark:bg-dark-primary border-primary/50 text-black'
                                            : 'bg-white dark:bg-dark-card-bg border-gray-200 dark:border-dark-text-muted text-gray-500 dark:text-dark-text-muted hover:bg-gray-50 dark:hover:bg-dark-surface-hover'
                                    }`}
                                >{label}</button>
                            ))}
                        </div>

                        {/* Species filter */}
                        <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-gray-200 dark:border-dark-text-muted">
                            <div className="flex items-center gap-2">
                                {filteredLitters.length > 0 && (
                                    <button
                                        onClick={toggleAllPublic}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                                            filteredLitters.every(l => l.showOnPublicProfile)
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                                                : 'bg-gray-100 dark:bg-dark-card-bg border-gray-300 dark:border-dark-text-muted text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-surface-hover'
                                        }`}
                                        title={filteredLitters.every(l => l.showOnPublicProfile) ? 'Hide all from public profile' : 'Show all on public profile'}
                                    >
                                        {filteredLitters.every(l => l.showOnPublicProfile) ? <Eye size={13} /> : <EyeOff size={13} />}
                                        {filteredLitters.every(l => l.showOnPublicProfile) ? 'All Public' : 'Make All Public'}
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="litter-species-filter" className='text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap'>Species:</label>
                                <select
                                    id="litter-species-filter"
                                    value={speciesFilter}
                                    onChange={(e) => setSpeciesFilter(e.target.value)}
                                    disabled={availableSpeciesInLitters.length === 0}
                                    className="px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                >
                                    <option value="">All Species</option>
                                    {availableSpeciesInLitters.map(species => (
                                        <option key={species} value={species}>
                                            {getSpeciesDisplayName(species)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                                <label htmlFor="litter-year-filter" className='text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-secondary whitespace-nowrap'>Year:</label>
                                <select
                                    id="litter-year-filter"
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                    disabled={availableYears.length === 0}
                                >
                                    <option value="">All Years</option>
                                    {availableYears.map(year => (
                                        <option key={year} value={year.toString()}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {filteredLitters.length === 0 && litters.length > 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-dark-card-bg rounded-lg">
                        <Search size={48} className="text-gray-400 dark:text-dark-text-muted mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-dark-text-secondary">No litters match your search.</p>
                    </div>
                ) : filteredLitters.length === 0 && !loading ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-dark-card-bg rounded-lg">
                        <BookOpen size={48} className="text-gray-400 dark:text-dark-text-muted mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-dark-text-secondary">No litters yet. Create your first litter above!</p>
                    </div>
                ) : (
                    filteredLitters.map(litter => {
                        // Use parent data from litter object (includes transferred/hidden animals)
                        const sire = litter.sire || myAnimals.find(a => a.id_public === litter.sireId_public);
                        const dam = litter.dam || myAnimals.find(a => a.id_public === litter.damId_public);
                        const isExpanded = expandedLitter === litter._id;
                        // Use endpoint-fetched offspring (includes transferred animals) with fallback to myAnimals
                        const offspringList = litterOffspringMap[litter._id] ?? [];
                        const offspringLoading = isExpanded && litterOffspringMap[litter._id] === undefined;
                        // Mating state helpers
                        const hasBirth = !!litter.birthDate;
                        const hasPregnancy = !!litter.pregnancyDate;
                        const isMated = !litter.isPlanned && !!litter.matingDate && !hasPregnancy && !hasBirth;
                        const isPregnant = hasPregnancy && !hasBirth;
                        const isPlannedOnly = litter.isPlanned && !hasPregnancy && !hasBirth;
                        // Mirror the Reproduction tab: rely on the dam's isNursing flag, which the backend
                        // already recomputes using each species' maxNursingDays safety-net cutoff — not just
                        // weaningConfirmed — so a litter past that window stops showing as nursing here too.
                        const isNursing = hasBirth && (dam ? !!dam.isNursing : !litter.weaningConfirmed);
                        
                        return (
                            <div key={litter._id} className={`border-2 ${isPlannedOnly ? 'border-dashed border-indigo-300 dark:border-indigo-800/60 bg-indigo-50/20 dark:bg-indigo-900/10' : isMated ? 'border-dashed border-sky-300 dark:border-sky-800/60 bg-sky-50/20 dark:bg-sky-900/10' : isPregnant ? 'border-dashed border-pink-300 dark:border-pink-800/60 bg-pink-50/20 dark:bg-pink-900/10' : 'border-gray-200 dark:border-dark-text-muted bg-white dark:bg-dark-card-bg'} rounded-lg hover:shadow-md transition`} data-tutorial-target="litter-card">
                                {/* Compact Header - Always Visible */}
                                <div 
                                    className="p-2 sm:p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-dark-surface-hover/60"
                                    onClick={() => setExpandedLitter(isExpanded ? null : litter._id)}
                                >
                                    {/* Public profile toggle — before litter name */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleLitterPublic(litter); }}
                                        title={litter.showOnPublicProfile ? 'Shown on public profile — click to hide' : 'Hidden from public profile — click to show'}
                                        className={`flex-shrink-0 mr-2 p-1 rounded transition ${litter.showOnPublicProfile ? 'text-green-500 hover:text-green-600' : 'text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary'}`}
                                    >
                                        {litter.showOnPublicProfile ? <Eye size={15} /> : <EyeOff size={15} />}
                                    </button>
                                    {/* Mobile layout: stacked info */}
                                    <div className="flex-1 sm:hidden">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800 dark:text-dark-text text-sm">
                                                    {isPlannedOnly && <span className="text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded mr-2">Planned</span>}
                                                    {isMated && <span className="text-[10px] font-semibold bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded mr-2">Mated</span>}
                                                    {isPregnant && <span className="text-[10px] font-semibold bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-1.5 py-0.5 rounded mr-2">Pregnant</span>}
                                                    {litter.litter_id_public && <span className="text-xs font-mono bg-gray-100 dark:bg-dark-card-bg text-gray-700 dark:text-dark-text-secondary px-1.5 py-0.5 rounded mr-2">{litter.litter_id_public}</span>}
                                                    {litter.breedingPairCodeName && <span className="truncate">{litter.breedingPairCodeName}</span>}
                                                    {!litter.breedingPairCodeName && !litter.litter_id_public && <span>Unnamed Litter</span>}
                                                </p>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700 dark:text-dark-text-secondary ml-2">{isPlannedOnly ? 'Planned' : isMated ? 'Mated' : isPregnant ? 'Pregnant' : `${litter.litterSizeBorn ?? litter.numberBorn ?? 0} pups`}</span>
                                        </div>
                                        <div className="flex gap-3 text-xs text-gray-600 dark:text-dark-text-secondary">
                                            <span><span className="font-medium">S:</span> {sire ? `${sire.prefix ? `${sire.prefix} ` : ''}${sire.name}${sire.suffix ? ` ${sire.suffix}` : ''}` : litter.sireId_public}</span>
                                            <span><span className="font-medium">D:</span> {dam ? `${dam.prefix ? `${dam.prefix} ` : ''}${dam.name}${dam.suffix ? ` ${dam.suffix}` : ''}` : litter.damId_public}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 dark:text-dark-text-muted mt-0.5">
                                            {formatDate(litter.birthDate)}
                                            {!litter.isPlanned && litter.birthDate && litterAge(litter.birthDate) && <span className="ml-1 font-semibold text-blue-600 dark:text-blue-400">~ {litterAge(litter.birthDate)}</span>}
                                        </p>
                                        {(litter.inbreedingCoefficient != null || coiCalculating.has(litter._id)) && (
                                            <p className="text-[10px] text-gray-500 dark:text-dark-text-muted mt-0.5">
                                                <span className="font-medium">COI:</span>{' '}
                                                {coiCalculating.has(litter._id)
                                                    ? <span className="inline-block w-12 h-2.5 bg-gray-200 dark:bg-dark-card-bg rounded animate-pulse align-middle" />
                                                    : `${litter.inbreedingCoefficient.toFixed(2)}%`}
                                            </p>
                                        )}
                                    </div>
                                    
                                    {/* Desktop layout: grid */}
                                    <div className="hidden sm:grid flex-1 grid-cols-6 gap-3 items-center min-w-0">
                                        {/* Col 1: Litter name */}
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-800 dark:text-dark-text text-sm truncate">{litter.breedingPairCodeName || <span className="text-gray-400 dark:text-dark-text-muted font-normal text-xs">Unnamed</span>}</p>
                                        </div>
                                        {/* Col 2: CTL + date / planned status */}
                                        <div className="min-w-0">
                                            {litter.litter_id_public
                                                ? <span className="text-xs font-mono bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded text-purple-700 dark:text-purple-300 block mb-0.5 w-fit">{litter.litter_id_public}</span>
                                                : <span className="text-xs text-gray-400 dark:text-dark-text-muted">—</span>}
                                            {isPlannedOnly
                                                ? <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400"><Calendar size={12} className="inline-block align-middle mr-0.5" /> Planned</span>
                                                : isMated
                                                ? <span className="text-xs font-semibold text-sky-600 dark:text-sky-400"><Hourglass size={12} className="inline-block align-middle mr-0.5" /> Awaiting pregnancy</span>
                                                : isPregnant
                                                ? <span className="text-xs font-semibold text-pink-600 dark:text-pink-400"><ScanHeart size={12} className="inline-block align-middle mr-0.5 fill-current" /> Awaiting birth</span>
                                                : <span className="text-xs text-gray-500 dark:text-dark-text-muted">{formatDate(litter.birthDate) || '—'}{litter.birthDate && litterAge(litter.birthDate) && <span className="ml-1 font-semibold text-blue-600 dark:text-blue-400">~ {litterAge(litter.birthDate)}</span>}</span>}
                                        </div>
                                        {/* Col 3: Sire */}
                                        <div className="min-w-0">
                                            <span className="text-gray-500 dark:text-dark-text-muted text-[10px] uppercase tracking-wide font-semibold block">Sire</span>
                                            <span className="text-sm font-semibold text-gray-800 dark:text-dark-text truncate block">{sire ? [sire.prefix, sire.name, sire.suffix].filter(Boolean).join(' ') : (litter.sireId_public || '—')}</span>
                                        </div>
                                        {/* Col 4: Dam */}
                                        <div className="min-w-0">
                                            <span className="text-gray-500 dark:text-dark-text-muted text-[10px] uppercase tracking-wide font-semibold block">Dam</span>
                                            <span className="text-sm font-semibold text-gray-800 dark:text-dark-text truncate block">{dam ? [dam.prefix, dam.name, dam.suffix].filter(Boolean).join(' ') : (litter.damId_public || '—')}</span>
                                        </div>
                                        {/* Col 5: COI */}
                                        <div>
                                            <span className="text-gray-500 dark:text-dark-text-muted text-[10px] uppercase tracking-wide font-semibold block">COI</span>
                                            {coiCalculating.has(litter._id)
                                                ? <span className="inline-block w-10 h-3 bg-gray-200 dark:bg-dark-card-bg rounded animate-pulse mt-0.5" />
                                                : <span className="text-sm font-semibold text-gray-800 dark:text-dark-text">
                                                    {litter.inbreedingCoefficient != null ? `${litter.inbreedingCoefficient.toFixed(2)}%` : '—'}
                                                  </span>}
                                        </div>
                                        {/* Col 6: Born with M/F/U */}
                                        <div>
                                            <span className="text-gray-500 dark:text-dark-text-muted text-[10px] uppercase tracking-wide font-semibold block">{litter.isPlanned ? 'Status' : 'Born'}</span>
                                            {isPlannedOnly
                                                ? <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleMarkAsMated(litter); }}
                                                    title="Mark as mated today"
                                                    className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/40 rounded-lg px-2 py-1 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition flex items-center gap-1"
                                                  >
                                                    <Hourglass size={12} /> Mated Today
                                                  </button>
                                                : isMated
                                                ? <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleMarkAsPregnant(litter); }}
                                                    title="Mark dam as pregnant"
                                                    className="text-[11px] font-semibold text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800/40 rounded-lg px-2 py-1 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition flex items-center gap-1"
                                                  >
                                                    <ScanHeart size={12} className="fill-current" /> Assign Pregnant
                                                  </button>
                                                : isPregnant
                                                ? <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleBornToday(litter); }}
                                                    title="Mark litter as born today"
                                                    className="text-[11px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 rounded-lg px-2 py-1 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition flex items-center gap-1"
                                                  >
                                                    <Droplet size={12} /> Born today
                                                  </button>
                                                : <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-bold text-gray-800 dark:text-dark-text">{litter.litterSizeBorn ?? litter.numberBorn ?? 0}</span>
                                                    {(litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && (
                                                        <span className="text-xs ml-1">
                                                            <span className="text-blue-500 dark:text-blue-400 font-semibold">{litter.maleCount ?? 0}M</span>
                                                            <span className="text-gray-400 dark:text-dark-text-muted mx-0.5">/</span>
                                                            <span className="text-pink-500 dark:text-pink-400 font-semibold">{litter.femaleCount ?? 0}F</span>
                                                            <span className="text-gray-400 dark:text-dark-text-muted mx-0.5">/</span>
                                                            <span className="text-purple-500 dark:text-purple-400 font-semibold">{litter.unknownCount ?? 0}U</span>
                                                        </span>
                                                    )}
                                                  </div>
                                            }
                                        </div>
                                    </div>
                                    {isNursing && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleMarkAsWeaned(litter); }}
                                            title="Mark as weaned today"
                                            className="flex-shrink-0 flex items-center gap-1 mr-1 px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                                        >
                                            <Baby size={11} /> Wean today
                                        </button>
                                    )}
                                    {(litter.images?.length > 0) && (
                                        <span className="flex items-center gap-0.5 text-[11px] text-gray-400 dark:text-dark-text-muted mr-1 flex-shrink-0">
                                            <Images size={12} />
                                            <span>{litter.images.length}</span>
                                        </span>
                                    )}
                                    <ChevronDown
                                        size={18}
                                        className={`text-gray-400 dark:text-dark-text-muted transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t-2 border-gray-200 dark:border-dark-text-muted p-2 sm:p-4 bg-gray-50 dark:bg-dark-card-bg">
                                        <div className="flex flex-wrap justify-end gap-1 sm:gap-2 mb-3 sm:mb-4">
                                            {isPlannedOnly && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleMarkAsMated(litter); }}
                                                    className="flex items-center gap-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
                                                >
                                                    <Hourglass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    <span>Mated Today</span>
                                                </button>
                                            )}
                                            {isMated && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleMarkAsPregnant(litter); }}
                                                    className="flex items-center gap-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
                                                >
                                                    <ScanHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                                                    <span>Assign Pregnant</span>
                                                </button>
                                            )}
                                            {isPregnant && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleBornToday(litter); }}
                                                    className="flex items-center gap-1 bg-violet-500 hover:bg-violet-600 text-white font-semibold px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
                                                >
                                                    <Droplet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    <span>Born Today</span>
                                                </button>
                                            )}
                                            {isNursing && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleMarkAsWeaned(litter); }}
                                                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
                                                >
                                                    <Baby className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    <span>Wean Today</span>
                                                </button>
                                            )}
                                            {(sire || dam) && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setCertLitter({ litter_id_public: litter.litter_id_public, vertical: false }); }}
                                                        className="flex items-center gap-1 bg-primary dark:bg-dark-primary hover:bg-primary/90 text-black font-semibold px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
                                                    >
                                                        <ScrollText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        <span className="hidden sm:inline">Horizontal Pedigree</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setCertLitter({ litter_id_public: litter.litter_id_public, vertical: true }); }}
                                                        className="flex items-center gap-1 bg-accent hover:bg-accent/90 text-white font-semibold px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
                                                    >
                                                        <ScrollText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        <span className="hidden sm:inline">Vertical Pedigree</span>
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (litter.isPlanned) { setMatingEditChoice(litter); } else { handleEditLitter(litter); }
                                                }}
                                                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
                                            >
                                                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                <span className="hidden sm:inline">Edit</span>
                                            </button>
                                        </div>

                                        {/* -- 1. Parents + COI ------------------------------------- */}
                                        {(sire || dam) && (
                                            <div className="mb-4">
                                                <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-text-muted uppercase tracking-wide mb-2">Parents</h4>
                                                <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-center">
                                                    {/* Sire */}
                                                    {sire ? (
                                                        <div
                                                            onClick={sire.isTransferred ? undefined : () => onViewAnimal(sire)}
                                                            className={`bg-white dark:bg-dark-card-bg rounded-xl border border-gray-200 dark:border-dark-text-muted p-3 flex items-center gap-3 ${sire.isTransferred ? 'opacity-75' : 'cursor-pointer hover:shadow-md'} transition shadow-sm`}
                                                        >
                                                            <div className="w-14 h-14 bg-gray-100 dark:bg-dark-card-bg rounded-lg overflow-hidden flex-shrink-0">
                                                                {sire.imageUrl || sire.photoUrl
                                                                    ? <img src={sire.imageUrl || sire.photoUrl} alt={sire.name} className="w-full h-full object-cover" />
                                                                    : <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-dark-text-muted"><Cat size={24} /></div>}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1 mb-0.5">
                                                                    <Mars size={12} className="text-primary flex-shrink-0" />
                                                                    <span className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide">Sire</span>
                                                                </div>
                                                                <p className="font-bold text-gray-800 dark:text-dark-text truncate text-sm">{sire.prefix ? `${sire.prefix} ` : ''}{sire.name}{sire.suffix ? ` ${sire.suffix}` : ''}</p>
                                                                <p className="text-xs text-gray-500 dark:text-dark-text-muted">{sire.species}</p>
                                                                <p className="text-[10px] text-gray-400 dark:text-dark-text-muted font-mono">{sire.id_public}</p>
                                                            </div>
                                                        </div>
                                                    ) : <div />}
                                                    {/* COI badge between parents */}
                                                    <div className="flex flex-col items-center px-2">
                                                        <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-1">COI</div>
                                                        {coiCalculating.has(litter._id)
                                                            ? <div className="w-14 h-5 bg-gray-200 dark:bg-dark-card-bg rounded animate-pulse" />
                                                            : litter.inbreedingCoefficient != null
                                                                ? <div className="text-base font-medium text-gray-800 dark:text-dark-text">{litter.inbreedingCoefficient.toFixed(2)}%</div>
                                                                : <div className="text-base font-medium text-gray-300 dark:text-dark-text-muted">—</div>}
                                                    </div>
                                                    {/* Dam */}
                                                    {dam ? (
                                                        <div
                                                            onClick={dam.isTransferred ? undefined : () => onViewAnimal(dam)}
                                                            className={`bg-white dark:bg-dark-card-bg rounded-xl border border-gray-200 dark:border-dark-text-muted p-3 flex items-center gap-3 ${dam.isTransferred ? 'opacity-75' : 'cursor-pointer hover:shadow-md'} transition shadow-sm`}
                                                        >
                                                            <div className="w-14 h-14 bg-gray-100 dark:bg-dark-card-bg rounded-lg overflow-hidden flex-shrink-0">
                                                                {dam.imageUrl || dam.photoUrl
                                                                    ? <img src={dam.imageUrl || dam.photoUrl} alt={dam.name} className="w-full h-full object-cover" />
                                                                    : <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-dark-text-muted"><Cat size={24} /></div>}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1 mb-0.5">
                                                                    <Venus size={12} className="text-accent flex-shrink-0" />
                                                                    <span className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide">Dam</span>
                                                                </div>
                                                                <p className="font-bold text-gray-800 dark:text-dark-text truncate text-sm">{dam.prefix ? `${dam.prefix} ` : ''}{dam.name}{dam.suffix ? ` ${dam.suffix}` : ''}</p>
                                                                <p className="text-xs text-gray-500 dark:text-dark-text-muted">{dam.species}</p>
                                                                <p className="text-[10px] text-gray-400 dark:text-dark-text-muted font-mono">{dam.id_public}</p>
                                                            </div>
                                                        </div>
                                                    ) : <div />}
                                                </div>
                                            </div>
                                        )}

                                        {/* -- 2. Breeding info -------------------------------------- */}
                                        {((litter.matingDate || litter.pairingDate) || litter.breedingMethod || litter.breedingCondition || litter.breedingConditionAtTime || litter.outcome || litter.birthMethod || litter.birthDate || litter.expectedDueDate || litter.weaningDate) && (
                                            <div className="bg-white dark:bg-dark-card-bg rounded-xl border border-gray-200 dark:border-dark-text-muted p-4 mb-4 shadow-sm">
                                                <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-text-muted uppercase tracking-wide mb-3">Breeding &amp; Birth</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                                                    {(litter.matingDate || litter.pairingDate) && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Mating Date</div>
                                                            <div className="font-semibold text-gray-800 dark:text-dark-text">{formatDate(litter.matingDate || litter.pairingDate)}</div>
                                                        </div>
                                                    )}
                                                    {litter.expectedDueDate && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Expected Due Date</div>
                                                            <div className="font-semibold text-gray-800 dark:text-dark-text">{formatDate(litter.expectedDueDate)}</div>
                                                        </div>
                                                    )}
                                                    {litter.breedingMethod && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Breeding Method</div>
                                                            <div className="font-semibold text-gray-800 dark:text-dark-text">{litter.breedingMethod}</div>
                                                        </div>
                                                    )}
                                                    {(litter.breedingCondition || litter.breedingConditionAtTime) && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Breeding Condition</div>
                                                            <div className="font-semibold text-gray-800 dark:text-dark-text">{litter.breedingCondition || litter.breedingConditionAtTime}</div>
                                                        </div>
                                                    )}
                                                    {litter.outcome && !(litter.isPlanned && litter.outcome === 'Unknown') && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Outcome</div>
                                                            <div className={`font-semibold ${litter.outcome === 'Successful' ? 'text-green-600 dark:text-green-400' : litter.outcome === 'Unsuccessful' ? 'text-red-500 dark:text-red-400' : 'text-gray-800 dark:text-dark-text'}`}>{litter.outcome}</div>
                                                        </div>
                                                    )}
                                                    {litter.birthMethod && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Birth Method</div>
                                                            <div className="font-semibold text-gray-800 dark:text-dark-text">{litter.birthMethod}</div>
                                                        </div>
                                                    )}
                                                    {litter.birthDate && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Birth Date</div>
                                                            <div className="font-semibold text-gray-800 dark:text-dark-text">{formatDate(litter.birthDate)}{litterAge(litter.birthDate) && <span className="ml-2 text-xs font-semibold text-blue-600 dark:text-blue-400">~ {litterAge(litter.birthDate)}</span>}</div>
                                                        </div>
                                                    )}
                                                    {litter.weaningDate && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Weaning Date</div>
                                                            <div className="font-semibold text-gray-800 dark:text-dark-text">{formatDate(litter.weaningDate)}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* -- 3. Litter Stats: left = counts, right = sex ------------ */}
                                        {!litter.isPlanned && <div className="bg-white dark:bg-dark-card-bg rounded-xl border border-gray-200 dark:border-dark-text-muted p-4 mb-4 shadow-sm">
                                            <div className="flex flex-col sm:grid sm:grid-cols-2 sm:divide-x divide-gray-200 dark:divide-dark-text-muted gap-3 sm:gap-0">
                                                {/* Left: Born / Stillborn / Weaned / Losses */}
                                                <div className="grid grid-cols-4 sm:pr-4">
                                                    <div>
                                                        <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Born</div>
                                                        <div className="text-xl font-bold text-gray-800 dark:text-dark-text">{litter.litterSizeBorn ?? litter.numberBorn ?? 0}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Stillborn</div>
                                                        <div className="text-xl font-bold text-gray-400 dark:text-dark-text-muted">{litter.stillbornCount ?? litter.stillborn ?? '0'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Weaned</div>
                                                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{litter.litterSizeWeaned ?? litter.numberWeaned ?? 0}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Losses</div>
                                                        <div className="text-xl font-bold text-red-500 dark:text-red-400">{litter.lossesCount ?? litter.losses ?? 0}</div>
                                                    </div>
                                                </div>
                                                {/* Right: Males / Females / Unknown */}
                                                <div className="grid grid-cols-3 sm:pl-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-200 dark:border-dark-text-muted">
                                                    <div>
                                                        <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Males</div>
                                                        <div className="text-xl font-bold text-blue-500 dark:text-blue-400">{litter.maleCount ?? 0}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Females</div>
                                                        <div className="text-xl font-bold text-pink-500 dark:text-pink-400">{litter.femaleCount ?? 0}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-semibold text-gray-400 dark:text-dark-text-muted uppercase tracking-wide mb-0.5">Unknown</div>
                                                        <div className="text-xl font-bold text-purple-500 dark:text-purple-400">{litter.unknownCount ?? 0}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>}

                                        {/* -- 4. Photos -------------------------------------------- */}
                                        {!litter.isPlanned && litter.images?.length > 0 && (
                                            <div className="bg-white dark:bg-dark-card-bg rounded-xl border border-gray-200 dark:border-dark-text-muted p-4 mb-4 shadow-sm">
                                                <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-text-muted uppercase tracking-wide mb-3">Photos</h4>
                                                <div className="flex gap-2 flex-wrap">
                                                    {litter.images.map((img, idx) => (
                                                        <button
                                                            key={img.r2Key || idx}
                                                            onClick={(e) => { e.stopPropagation(); setEnlargedLitterImageUrl(img.url); setShowLitterImageModal(true); }}
                                                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-dark-text-muted hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition flex-shrink-0 focus:outline-none"
                                                        >
                                                            <img src={img.url} alt={`Litter photo ${idx + 1}`} className="w-full h-full object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* -- 5. Notes ---------------------------------------------- */}
                                        {litter.notes && (
                                            <div className="bg-white dark:bg-dark-card-bg rounded-xl border border-gray-200 dark:border-dark-text-muted p-4 mb-4 shadow-sm">
                                                <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-text-muted uppercase tracking-wide mb-1">Notes</h4>
                                                <p className="text-sm text-gray-700 dark:text-dark-text-secondary italic leading-relaxed">{litter.notes}</p>
                                            </div>
                                        )}

                                        {/* Offspring skeleton while dedicated offspring fetch is in flight */}
                                        {offspringLoading && (
                                            <div className="mb-4">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                    {[0, 1, 2].map((i) => (
                                                        <div key={i} className="bg-white dark:bg-dark-card-bg rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden border-2 border-gray-200 dark:border-dark-text-muted animate-pulse">
                                                            <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                <div className="w-20 h-20 bg-gray-200 dark:bg-dark-card-bg rounded-md" />
                                                            </div>
                                                            <div className="w-full px-4 pb-3 space-y-1.5">
                                                                <div className="h-3 bg-gray-200 dark:bg-dark-card-bg rounded w-3/4 mx-auto" />
                                                                <div className="h-2 bg-gray-200 dark:bg-dark-card-bg rounded w-1/2 mx-auto" />
                                                            </div>
                                                            <div className="w-full bg-gray-100 dark:bg-dark-card-bg py-1 border-t border-gray-200 dark:border-dark-text-muted">
                                                                <div className="h-3 bg-gray-200 dark:bg-dark-card-bg rounded w-1/3 mx-auto" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {/* Offspring Cards */}
                                        {offspringList.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-bold text-gray-700 dark:text-dark-text-secondary">Offspring ({offspringList.length})</h4>
                                                    <div className="flex items-center gap-2">
                                                        {bulkDeleteMode[litter._id] && (
                                                            <>
                                                                <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
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
                                                                    className="px-3 py-1 bg-gray-300 dark:bg-dark-card-bg hover:bg-gray-400 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text text-sm font-semibold rounded-lg transition"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                        {!bulkDeleteMode[litter._id] && (
                                                            <button
                                                                onClick={() => toggleBulkDeleteMode(litter._id)}
                                                                className="p-2 hover:bg-gray-200 dark:hover:bg-dark-surface-hover rounded-lg transition"
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
                                                                    // Inject litter's parent IDs as fallback so animals whose DB links
                                                                    // were wiped still display (and re-save) the correct parents
                                                                    const animalWithParents = {
                                                                        ...animal,
                                                                        sireId_public: animal.sireId_public || litter.sireId_public || null,
                                                                        damId_public: animal.damId_public || litter.damId_public || null,
                                                                    };
                                                                    // If animal is owned by current user, open edit view; otherwise open read-only view
                                                                    const isOwnedByUser = animal.creatorId_public === userProfile?.id_public;
                                                                    if (isOwnedByUser) {
                                                                        handleViewAnimal && handleViewAnimal(animalWithParents);
                                                                    } else {
                                                                        onViewAnimal(animalWithParents);
                                                                    }
                                                                }
                                                            }}
                                                            className={`relative bg-white dark:bg-dark-card-bg rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden transition border-2 pt-2 ${
                                                                isSelected ? 'border-red-500 cursor-pointer hover:shadow-md' : 'border-gray-300 dark:border-dark-text-muted cursor-pointer hover:shadow-md'
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
                                                            {!isBulkMode && (
                                                                <div className="absolute top-1.5 left-1.5 z-10" onClick={(e) => e.stopPropagation()}>
                                                                    <button
                                                                        onClick={() => handleUnlinkOffspring(litter, animal.id_public)}
                                                                        className="p-1 rounded bg-white/80 hover:bg-orange-100 text-gray-300 hover:text-orange-500 transition"
                                                                        title="Unlink from litter (does not delete the animal)"
                                                                    >
                                                                        <Unlink size={12} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {/* Gender badge top-right */}
                                                            {(animal.gender === 'Male' || animal.gender === 'Female') && (
                                                                <div className="absolute top-1.5 right-1.5">
                                                                    {animal.gender === 'Male' ? <Mars size={14} strokeWidth={2.5} className="text-primary" /> : animal.gender === 'Female' ? <Venus size={14} strokeWidth={2.5} className="text-accent" /> : animal.gender === 'Intersex' ? <VenusAndMars size={14} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={14} strokeWidth={2.5} className="text-gray-400" />}
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
                                                                    <div className="w-20 h-20 bg-gray-100 dark:bg-dark-card-bg rounded-md flex items-center justify-center text-gray-400 dark:text-dark-text-muted">
                                                                        <Cat size={32} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Reproductive State Pill */}
                                                            <div className="w-full flex justify-center items-center px-1">
                                                                {(() => {
                                                                    let state = null;
                                                                    if (animal.isPregnant) {
                                                                        state = { label: 'Pregnant', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300', icon: <ScanHeart size={11} className="fill-current" /> };
                                                                    } else if (animal.isNursing) {
                                                                        state = { label: 'Nursing', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300', icon: <Droplet size={11} /> };
                                                                    } else if (animal.isInMating) {
                                                                        state = { label: 'In Mating', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300', icon: <Hourglass size={11} /> };
                                                                    } else if (animal.isPlannedMating) {
                                                                        state = { label: 'Planned Mating', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300', icon: <Calendar size={11} /> };
                                                                    }
                                                                    return state ? (
                                                                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap ${state.color}`}>
                                                                            {state.icon} {state.label}
                                                                        </span>
                                                                    ) : null;
                                                                })()}
                                                            </div>

                                                            {/* Icon row */}
                                                            <div className="w-full flex justify-center items-center space-x-2 py-1" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleOffspringOwned(litter._id, animal.id_public, !animal.isOwned)}
                                                                    className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition"
                                                                    title={animal.isOwned ? 'Click to mark as Not Owned' : 'Click to mark as Owned'}
                                                                >
                                                                    {animal.isOwned ? (
                                                                        <Heart size={12} className="text-red-600 dark:text-red-400" />
                                                                    ) : (
                                                                        <HeartOff size={12} className="text-gray-500 dark:text-dark-text-muted" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleOffspringPrivacy(litter._id, animal.id_public, !(animal.showOnPublicProfile || animal.isDisplay))}
                                                                    className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition"
                                                                    title={(animal.showOnPublicProfile || animal.isDisplay) ? 'Click to make Private' : 'Click to make Public'}
                                                                >
                                                                    {(animal.showOnPublicProfile || animal.isDisplay) ? (
                                                                        <Eye size={12} className="text-green-600 dark:text-green-400" />
                                                                    ) : (
                                                                        <EyeOff size={12} className="text-gray-500 dark:text-dark-text-muted" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            
                                                            {/* Name */}
                                                            <div className="w-full text-center px-2 pb-1">
                                                                <div className="text-sm font-semibold text-gray-800 dark:text-dark-text truncate">
                                                                    {[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}
                                                                </div>
                                                            </div>

                                                            {/* ID bottom-right */}
                                                            <div className="w-full px-2 pb-2 flex justify-end">
                                                                <div className="text-xs text-gray-500 dark:text-dark-text-muted">{animal.id_public}</div>
                                                            </div>
                                                            
                                                            {/* Status bar */}
                                                            <div className="w-full bg-gray-100 dark:bg-dark-card-bg py-1 text-center border-t border-gray-300 dark:border-dark-text-muted mt-auto">
                                                                <div className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">{animal.status || 'Unknown'}</div>
                                                            </div>
                                                        </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Add Offspring Section */}
                                        {!litter.isPlanned && addingOffspring && addingOffspring._id === litter._id ? (
                                            <>
                                            <div className="bg-white dark:bg-dark-card-bg rounded-lg border-2 border-primary p-4">
                                                <h4 className="text-sm font-bold text-gray-700 dark:text-dark-text-secondary mb-3">Add New Offspring</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Name *</label>
                                                        <input
                                                            type="text"
                                                            value={newOffspringData.name}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, name: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Enter name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Gender *</label>
                                                        <select
                                                            value={newOffspringData.gender}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, gender: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
                                                        >
                                                            <option value="">Select gender</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Color</label>
                                                        <input
                                                            type="text"
                                                            value={newOffspringData.color}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, color: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Optional"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Coat</label>
                                                        <input
                                                            type="text"
                                                            value={newOffspringData.coat}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, coat: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Optional"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Remarks</label>
                                                        <textarea
                                                            value={newOffspringData.remarks}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, remarks: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
                                                            rows="2"
                                                            placeholder="Optional notes"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-700 p-3 mb-4 rounded">
                                                    <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Auto-Assigned Parent Information</div>
                                                    <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                                                        <div><span className="font-semibold">Species:</span> {sire?.species || addingOffspring.sire?.species || addingOffspring.dam?.species || 'Unknown'}</div>
                                                        <div><span className="font-semibold">Birth Date:</span> {formatDate(litter.birthDate)}</div>
                                                        <div><span className="font-semibold">Sire (Father):</span> {litter.sirePrefixName ? `${litter.sirePrefixName}` : litter.sireId_public || 'Not set'}</div>
                                                        <div><span className="font-semibold">Dam (Mother):</span> {litter.damPrefixName ? `${litter.damPrefixName}` : litter.damId_public || 'Not set'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSaveNewOffspring}
                                                        className="flex items-center gap-1 bg-primary dark:bg-dark-primary hover:bg-primary/90 text-black font-semibold px-4 py-2 rounded-lg"
                                                    >
                                                        <Plus size={16} />
                                                        Save Offspring
                                                    </button>
                                                    <button
                                                        onClick={() => setAddingOffspring(null)}
                                                        className="bg-gray-300 dark:bg-dark-card-bg hover:bg-gray-400 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text font-semibold px-4 py-2 rounded-lg"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteLitter(litter._id);
                                                    }}
                                                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-2 rounded-lg text-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {!litter.isPlanned && (
                                                        <>
                                                            <button
                                                                onClick={() => handleAddOffspringToLitter(litter)}
                                                                className="flex items-center gap-1 bg-accent hover:bg-accent/90 text-white font-semibold px-3 py-2 rounded-lg text-sm"
                                                            >
                                                                <Plus size={16} />
                                                                Add Offspring
                                                            </button>
                                                            <button
                                                                onClick={() => handleLinkAnimals(litter)}
                                                                data-tutorial-target="link-animals-btn"
                                                                className="flex items-center gap-1 bg-primary dark:bg-dark-primary hover:bg-primary/90 text-black font-semibold px-3 py-2 rounded-lg text-sm"
                                                            >
                                                                <Link className="w-4 h-4" />
                                                                <span>Link Offspring</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteLitter(litter._id);
                                                    }}
                                                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-2 rounded-lg text-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
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
                    <div className="bg-white dark:bg-dark-card-bg border border-transparent dark:border-dark-text-muted rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center border-b dark:border-dark-text-muted p-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text">Link Animals to Litter</h3>
                            <button onClick={() => setLinkingAnimals(false)} className="text-gray-500 dark:text-dark-text-muted hover:text-gray-800 dark:hover:text-dark-text">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4">
                            {availableToLink.animals && availableToLink.animals.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-dark-text-muted py-8">No unlinked animals found with matching parents and birth date.</p>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
                                        Found {availableToLink.animals?.length || 0} unlinked animal(s) with matching parents and birth date:
                                    </p>
                                    {availableToLink.animals?.map(animal => (
                                        <div key={animal.id_public} className="border dark:border-dark-text-muted rounded-lg p-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-dark-text">
                                                    {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                                                    {animal.id_public} &bull; {animal.gender} &bull; {animal.species}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleAddToLitter(animal.id_public)}
                                                className="bg-primary dark:bg-dark-primary hover:bg-primary/90 text-black font-semibold px-3 py-1 rounded text-sm"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border-t dark:border-dark-text-muted p-4 space-y-2">
                            {availableToLink.animals && availableToLink.animals.length > 0 && (
                                <button
                                    onClick={handleAddAllToLitter}
                                    className="w-full bg-primary dark:bg-dark-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg"
                                >
                                    Add All ({availableToLink.animals.length})
                                </button>
                            )}
                            <button
                                onClick={() => setLinkingAnimals(false)}
                                className="w-full bg-gray-200 dark:bg-dark-card-bg hover:bg-gray-300 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text font-semibold py-2 px-4 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Species Picker Modal */}
            {showSpeciesPicker && (
                <SpeciesPickerModal
                    speciesOptions={speciesOptions}
                    onSelect={(speciesName) => {
                        setFormData(prev => ({...prev, species: speciesName, sireId_public: '', damId_public: ''}));
                        setSelectedSireAnimal(null);
                        setSelectedDamAnimal(null);
                        setShowSpeciesPicker(false);
                    }}
                    onClose={() => setShowSpeciesPicker(false)}
                    X={X}
                    Search={Search}
                />
            )}

            {/* Sire Modal */}
            {modalTarget === 'sire-litter' && (
                <ParentSearchModal
                    title="Select Sire"
                    onSelect={handleSelectOtherParentForLitter}
                    onClose={() => setModalTarget(null)}
                    authToken={authToken}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={LoadingSpinner}
                    requiredGender={['Male', 'Intersex', 'Mixed', 'Unknown']}
                    species={formData.species || undefined}
                />
            )}

            {/* Dam Modal */}
            {modalTarget === 'dam-litter' && (
                <ParentSearchModal
                    title="Select Dam"
                    onSelect={handleSelectOtherParentForLitter}
                    onClose={() => setModalTarget(null)}
                    authToken={authToken}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={LoadingSpinner}
                    requiredGender={['Female', 'Intersex', 'Mixed', 'Unknown']}
                    species={formData.species || undefined}
                />
            )}

            {/* Mating Form ? Species Picker */}
            {showMatingSpeciesPicker && (
                <SpeciesPickerModal
                    speciesOptions={speciesOptions}
                    onSelect={(speciesName) => {
                        setMatingData(prev => ({...prev, species: speciesName, sireId_public: '', damId_public: ''}));
                        setSelectedMatingSire(null);
                        setSelectedMatingDam(null);
                        setMatingCOI(null);
                        setShowMatingSpeciesPicker(false);
                    }}
                    onClose={() => setShowMatingSpeciesPicker(false)}
                    X={X}
                    Search={Search}
                />
            )}

            {/* Mating Form ? Sire Modal */}
            {modalTarget === 'sire-mating' && (
                <ParentSearchModal
                    title="Select Sire"
                    onSelect={handleSelectOtherParentForLitter}
                    onClose={() => setModalTarget(null)}
                    authToken={authToken}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={LoadingSpinner}
                    requiredGender={['Male', 'Intersex', 'Mixed', 'Unknown']}
                    species={matingData.species || undefined}
                />
            )}

            {/* Mating Form ? Dam Modal */}
            {modalTarget === 'dam-mating' && (
                <ParentSearchModal
                    title="Select Dam"
                    onSelect={handleSelectOtherParentForLitter}
                    onClose={() => setModalTarget(null)}
                    authToken={authToken}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={LoadingSpinner}
                    requiredGender={['Female', 'Intersex', 'Mixed', 'Unknown']}
                    species={matingData.species || undefined}
                />
            )}

            {/* Litter Photo Modal */}
            {showLitterImageModal && enlargedLitterImageUrl && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4"
                    onClick={() => setShowLitterImageModal(false)}
                >
                    <div className="relative max-w-7xl max-h-full flex flex-col items-center gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowLitterImageModal(false); }}
                            className="self-end text-white hover:text-gray-300 transition"
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={enlargedLitterImageUrl}
                            alt="Litter photo"
                            className="max-w-full max-h-[75vh] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={(e) => { e.stopPropagation(); handleLitterImageDownload(enlargedLitterImageUrl); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
                        >
                            <Download size={20} />
                            Download Image
                        </button>
                    </div>
                </div>
            )}

            {certLitter && (
                <PedigreeChart
                    litterId={certLitter.litter_id_public}
                    vertical={certLitter.vertical}
                    currentUserIdPublic={userProfile?.id_public}
                    API_BASE_URL={API_BASE_URL}
                    authToken={authToken}
                    onClose={() => setCertLitter(null)}
                    onViewAnimal={onViewAnimal}
                />
            )}
        </div>
    );
};

export default LitterManagement;
