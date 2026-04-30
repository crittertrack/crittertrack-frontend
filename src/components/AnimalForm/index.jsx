import React, { useState, useEffect, useCallback, useRef, useMemo, useImperativeHandle } from 'react';
import axios from 'axios';
import {
    Activity, AlertCircle, AlertTriangle, ArrowLeft, Ban, Camera, Cat,
    ChevronDown, ChevronRight, ClipboardList, Dna, Download, Droplets, Egg, EyeOff, Feather,
    FileText, Flame, FolderOpen, Gem, Globe, Hash, Home, Hospital, Images, Key, Leaf,
    Loader2, Lock, Mars, Medal, MessageSquare, Microscope, Pill, Plus, PlusCircle,
    RefreshCw, RotateCcw, Ruler, Save, Scissors, Search, Shield, Sparkles,
    Sprout, Star, Stethoscope, Tag, Target, Thermometer, Trash2, TreeDeciduous,
    Upload, User, UtensilsCrossed, Venus, X, Check, Edit, Heart, ChevronUp,
    ChevronLeft, Circle, Hourglass, Network, Bean, Milk, VenusAndMars, BookOpen,
    Calculator, Calendar, CheckCircle, Dumbbell, Brain, Trophy, Scale, FileCheck,
    Palette, Wrench, Utensils, Package, ScrollText, Link, Unlink, Baby, Bell
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDate, formatDateShort } from '../../utils/dateFormatter';
import { FamilyTabContent } from '../AnimalDetail/FamilyTabContent';
import DatePicker from '../DatePicker';
import GeneticCodeBuilder from '../GeneticCodeBuilder';

const getCountryFlag = (countryCode) => {
    if (!countryCode || countryCode.length !== 2) return '';
    return 'fi fi-' + countryCode.toLowerCase();
};

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

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin text-primary-dark mr-2" size={24} />
    <span className="text-gray-600">Loading...</span>
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

// Conflict Resolution Modal Component

async function compressImageFile(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {}) {
    if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('Not an image file');
    // Reject GIFs (animations not allowed) ? the server accepts PNG/JPEG only
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


﻿const ConflictResolutionModal = ({ conflicts, litter, onResolve, onCancel }) => {
    const [resolutions, setResolutions] = useState({});

    useEffect(() => {
        // Initialize resolutions with default 'breeding' choice for all conflicts
        const initialResolutions = {};
        conflicts.forEach(conflict => {
            initialResolutions[conflict.field] = 'breeding';
        });
        setResolutions(initialResolutions);
    }, [conflicts]);

    const handleResolutionChange = (field, choice) => {
        setResolutions(prev => ({
            ...prev,
            [field]: choice
        }));
    };

    const handleResolve = () => {
        const resolutionArray = Object.entries(resolutions).map(([field, choice]) => ({
            field,
            choice
        }));
        onResolve(resolutionArray);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Resolve Data Conflicts</h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                        <strong>Linking to Litter:</strong> {litter.litter_id_public}
                    </p>
                    <p className="text-yellow-800 text-sm">
                        Some data conflicts were found between your breeding record and the litter. Please choose which values to keep.
                    </p>
                </div>

                <div className="space-y-4">
                    {conflicts.map((conflict) => (
                        <div key={conflict.field} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-700 mb-3">{conflict.label}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={conflict.field}
                                        value="breeding"
                                        checked={resolutions[conflict.field] === 'breeding'}
                                        onChange={() => handleResolutionChange(conflict.field, 'breeding')}
                                        className="text-blue-600"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-blue-600">Keep Breeding Record Value</div>
                                        <div className="text-sm text-gray-600">{conflict.breedingValue}</div>
                                    </div>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={conflict.field}
                                        value="litter"
                                        checked={resolutions[conflict.field] === 'litter'}
                                        onChange={() => handleResolutionChange(conflict.field, 'litter')}
                                        className="text-green-600"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-green-600">Use Litter Value</div>
                                        <div className="text-sm text-gray-600">{conflict.litterValue}</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="flex gap-4 mt-6">
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleResolve}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Resolve Conflicts & Link
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Litter Sync Conflict Modal -----------------------------------------------
// Shown after an animal save when a breeding record's values differ from its
// linked litter document. Lets the user pick the "truth" for each field; the
// winning value is written to BOTH sides.

const LitterSyncConflictModal = ({ items, onResolve, onSkip }) => {
    const [choices, setChoices] = useState({});

    useEffect(() => {
        const init = {};
        items.forEach(item => {
            item.conflicts.forEach(c => {
                init[`${item.litter._id}__${c.field}`] = 'record';
            });
        });
        setChoices(init);
    }, [items]);

    const set = (litterId, field, val) =>
        setChoices(prev => ({ ...prev, [`${litterId}__${field}`]: val }));

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-600 text-xl">††</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Litter Sync Conflicts</h3>
                        <p className="text-sm text-gray-500">Your breeding record and litter card have different values. Pick which is correct — it will be saved to both.</p>
                    </div>
                </div>

                {/* Conflict list */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
                    {items.map(item => (
                        <div key={item.litter._id} className="space-y-3">
                            {items.length > 1 && (
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Litter {item.litter.litter_id_public}
                                </div>
                            )}
                            {item.conflicts.map(c => {
                                const key = `${item.litter._id}__${c.field}`;
                                const chosen = choices[key] ?? 'record';
                                return (
                                    <div key={c.field} className="rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                                            <span className="text-sm font-semibold text-gray-700">{c.label}</span>
                                        </div>
                                        <div className="grid grid-cols-2 divide-x divide-gray-200">
                                            {/* Breeding record option */}
                                            <label className={`flex items-start gap-3 p-4 cursor-pointer transition ${chosen === 'record' ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                                <input
                                                    type="radio"
                                                    name={key}
                                                    value="record"
                                                    checked={chosen === 'record'}
                                                    onChange={() => set(item.litter._id, c.field, 'record')}
                                                    className="mt-0.5 accent-blue-600"
                                                />
                                                <div>
                                                    <div className={`text-xs font-semibold mb-1 ${chosen === 'record' ? 'text-blue-600' : 'text-gray-500'}`}>Breeding Record</div>
                                                    <div className={`text-sm font-bold ${chosen === 'record' ? 'text-blue-800' : 'text-gray-700'}`}>{c.recordValue ?? '?'}</div>
                                                </div>
                                            </label>
                                            {/* Litter card option */}
                                            <label className={`flex items-start gap-3 p-4 cursor-pointer transition ${chosen === 'litter' ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                                                <input
                                                    type="radio"
                                                    name={key}
                                                    value="litter"
                                                    checked={chosen === 'litter'}
                                                    onChange={() => set(item.litter._id, c.field, 'litter')}
                                                    className="mt-0.5 accent-green-600"
                                                />
                                                <div>
                                                    <div className={`text-xs font-semibold mb-1 ${chosen === 'litter' ? 'text-green-600' : 'text-gray-500'}`}>Litter Card</div>
                                                    <div className={`text-sm font-bold ${chosen === 'litter' ? 'text-green-800' : 'text-gray-700'}`}>{c.litterValue ?? '?'}</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onSkip}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition text-sm"
                    >
                        Skip Litter Sync
                    </button>
                    <button
                        type="button"
                        onClick={() => onResolve(choices)}
                        className="flex-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition text-sm"
                    >
                        Save to Both Sides
                    </button>
                </div>
            </div>
        </div>
    );
};

// Pedigree Chart Component
const PedigreeChart = React.forwardRef(({ animalId, animalData, onClose, API_BASE_URL, authToken = null, inline = false, manualData = null, onViewAnimal = null }, ref) => {
    const [pedigreeData, setPedigreeData] = useState(null);
    const [displayData, setDisplayData] = useState(null);
    const [ownerProfile, setOwnerProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [stackedPedigree, setStackedPedigree] = useState(null); // For nested pedigree viewing
    const [isSaving, setIsSaving] = useState(false);
    const pedigreeRef = useRef(null);

    // Merge manual ancestors into fetched pedigree tree wherever API returned nothing
    useEffect(() => {
        if (!pedigreeData) { setDisplayData(null); return; }
        if (!manualData) { setDisplayData(pedigreeData); return; }
        const slotToAnimal = (slot) => {
            if (!slot) return null;
            if (!slot.ctcId && !slot.name && !slot.prefix && !slot.suffix) return null;
            return {
                name: slot.name || '', prefix: slot.prefix || '', suffix: slot.suffix || '',
                color: slot.variety || '', imageUrl: slot.imageUrl || null, photoUrl: slot.imageUrl || null,
                birthDate: slot.birthDate || null, deceasedDate: slot.deceasedDate || null,
                breederName: slot.breederName || '',
                gender: slot.gender || '', id_public: slot.ctcId || null, geneticCode: slot.genCode || '',
            };
        };
        const d = JSON.parse(JSON.stringify(pedigreeData));
        // Level 1 • parents
        if (!d.father && manualData.sire) d.father = slotToAnimal(manualData.sire);
        if (!d.mother && manualData.dam)  d.mother = slotToAnimal(manualData.dam);
        // Level 2 • grandparents
        if (d.father) {
            if (!d.father.father && manualData.sireSire) d.father.father = slotToAnimal(manualData.sireSire);
            if (!d.father.mother && manualData.sireDam)  d.father.mother = slotToAnimal(manualData.sireDam);
        }
        if (d.mother) {
            if (!d.mother.father && manualData.damSire) d.mother.father = slotToAnimal(manualData.damSire);
            if (!d.mother.mother && manualData.damDam)  d.mother.mother = slotToAnimal(manualData.damDam);
        }
        // Level 3 • great-grandparents
        if (d.father?.father) {
            if (!d.father.father.father && manualData.sireSireSire) d.father.father.father = slotToAnimal(manualData.sireSireSire);
            if (!d.father.father.mother && manualData.sireSireDam)  d.father.father.mother = slotToAnimal(manualData.sireSireDam);
        }
        if (d.father?.mother) {
            if (!d.father.mother.father && manualData.sireDamSire) d.father.mother.father = slotToAnimal(manualData.sireDamSire);
            if (!d.father.mother.mother && manualData.sireDamDam)  d.father.mother.mother = slotToAnimal(manualData.sireDamDam);
        }
        if (d.mother?.father) {
            if (!d.mother.father.father && manualData.damSireSire) d.mother.father.father = slotToAnimal(manualData.damSireSire);
            if (!d.mother.father.mother && manualData.damSireDam)  d.mother.father.mother = slotToAnimal(manualData.damSireDam);
        }
        if (d.mother?.mother) {
            if (!d.mother.mother.father && manualData.damDamSire) d.mother.mother.father = slotToAnimal(manualData.damDamSire);
            if (!d.mother.mother.mother && manualData.damDamDam)  d.mother.mother.mother = slotToAnimal(manualData.damDamDam);
        }
        setDisplayData(d);
    }, [pedigreeData, manualData]);

    useEffect(() => {
        // Inline mode with animalData already supplied: skip the expensive recursive fetch.
        // The merge useEffect will overlay manualData ancestors on top.
        if (inline && animalData) {
            setPedigreeData(animalData);
            setLoading(false);
            // Still fetch the breeder profile for display purposes
            const breederId = animalData.breederId_public;
            if (breederId) {
                axios.get(`${API_BASE_URL}/public/profiles/search?query=${breederId}&limit=1`)
                    .then(r => { if (r.data?.[0]) setOwnerProfile(r.data[0]); })
                    .catch(() => {});
            }
            return;
        }

        const fetchPedigreeData = async () => {
            setLoading(true);
            try {
                // Enhanced recursive function to fetch animal, ancestors, and descendants
                // resultCache: Map<id, data> ? avoids redundant API calls but allows the same
                //   ancestor to appear in *multiple* pedigree positions (inbreeding).
                // pathIds: Set of IDs in the current call-chain ? detects true circular loops only.
                const resultCache = new Map();
                const fetchAnimalWithFamily = async (id, depth = 0, pathIds = new Set()) => {
                    if (!id || depth > 4) return null;
                    if (pathIds.has(id)) return null; // circular reference ? stop this branch

                    // Return cached result so the same ancestor shows in multiple pedigree
                    // positions (inbreeding) without redundant API calls
                    if (resultCache.has(id)) return resultCache.get(id);

                    let animalInfo = null;
                    let foundViaOwned = false;

                    // Try to fetch from owned animals first if authToken is available
                    if (authToken) {
                        // Skip the /animals/:id endpoint if id looks like a public ID (CTC format or numeric)
                        const isPublicId = /^CTC\d+|^\d+$/.test(id);
                        
                        if (!isPublicId) {
                            try {
                                // Try /animals/:id_backend endpoint for backend ObjectIds (owned animals)
                                const response = await axios.get(`${API_BASE_URL}/animals/${id}`, {
                                    headers: { Authorization: `Bearer ${authToken}` }
                                });
                                animalInfo = response.data;
                                foundViaOwned = true; // Only set when truly owned by the user
                            } catch (error) {
                                // Not found as backend ID, continue to try other endpoints
                            }
                        }

                        // Try /animals/any endpoint for public IDs or related animals
                        if (!animalInfo) {
                            try {
                                const response = await axios.get(`${API_BASE_URL}/animals/any/${id}`, {
                                    headers: { Authorization: `Bearer ${authToken}` }
                                });
                                animalInfo = response.data;
                                // Do NOT set foundViaOwned = true here — animal is accessible but not owned.
                                // This ensures the showOnPublicProfile check below still applies,
                                // consistent with how ViewOnlyParentCard handles the same case.
                            } catch (error2) {
                                console.log(`Animal ${id} not accessible via any endpoint:`, error2.message);
                            }
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
                            console.log(`Animal ${id} not found in public database:`, error.message);
                            // Don't return null here - continue to check if we should show hidden marker
                        }
                    }

                    // If animal exists but is not public/accessible (has ID but no data), return hidden marker
                    // This ensures parents always show even if they're private
                    if (!animalInfo && id) {
                        return { isHidden: true, id_public: id };
                    }
                    
                    if (!animalInfo) return null;

                    // If not the user's own animal and not publicly visible, hide it and all its ancestors
                    if (!foundViaOwned && !animalInfo.showOnPublicProfile) {
                        return { isHidden: true, id_public: id };
                    }

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

                    // Recursively fetch parents ? each branch gets its own path copy so that
                    // an ancestor appearing on BOTH sides (inbreeding) isn't blocked.
                    const fatherId = animalInfo.fatherId_public || animalInfo.sireId_public;
                    const motherId = animalInfo.motherId_public || animalInfo.damId_public;
                    const childPath = new Set([...pathIds, id]);

                    const father = fatherId ? await fetchAnimalWithFamily(fatherId, depth + 1, childPath) : null;
                    const mother = motherId ? await fetchAnimalWithFamily(motherId, depth + 1, childPath) : null;

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
                                    const childData = await fetchAnimalWithFamily(child.id_public, depth + 1, childPath);
                                    if (childData) {
                                        offspring.push(childData);
                                    }
                                }
                            }
                        } catch (error) {
                            console.log(`No offspring data available for ${id}:`, error.message);
                        }
                    }

                    const result = {
                        ...animalInfo,
                        father,
                        mother,
                        offspring: offspring.length > 0 ? offspring : undefined
                    };
                    resultCache.set(id, result);
                    return result;
                };

                const data = await fetchAnimalWithFamily(animalId || animalData?.id_public);
                setPedigreeData(data);

                // Fetch breeder profile for the main animal
                if (data?.breederId_public) {
                    try {
                        const breederId = data.breederId_public;
                        console.log('[PEDIGREE] Fetching breeder profile for ID:', breederId);
                        const ownerResponse = await axios.get(
                            `${API_BASE_URL}/public/profiles/search?query=${breederId}&limit=1`
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
        setIsSaving(true);
        try {
            const el = pedigreeRef.current;
            const orig = { w: el.style.width, h: el.style.height, mh: el.style.minHeight, ov: el.style.overflow, p: el.style.padding };
            el.style.width = '2000px';
            el.style.height = 'auto';
            el.style.minHeight = 'unset';
            el.style.overflow = 'visible';
            el.style.padding = '40px 20px 32px 20px';
            const ggpStyle = document.createElement('style');
            ggpStyle.textContent = '.ggp-chart-img { display: none !important; }';
            document.head.appendChild(ggpStyle);
            await new Promise(r => setTimeout(r, 500));
            const srcCanvas = await html2canvas(el, {
                scale: 2, backgroundColor: '#ffffff', logging: false,
                useCORS: true, allowTaint: true, letterRendering: true,
                windowWidth: 2000, windowHeight: 9999,
                imageTimeout: 15000, scrollX: 0, scrollY: 0
            });
            document.head.removeChild(ggpStyle);
            Object.assign(el.style, { width: orig.w, height: orig.h, minHeight: orig.mh, overflow: orig.ov, padding: orig.p });
            // Fit into A4 landscape (297 × 210mm) with 4mm padding using mm-based jsPDF
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pageW = 297, pageH = 210, pad_mm = 4;
            const maxW = pageW - pad_mm * 2, maxH = pageH - pad_mm * 2;
            pdf.addImage(srcCanvas.toDataURL('image/png'), 'PNG',
                (pageW - maxW) / 2, (pageH - maxH) / 2, maxW, maxH);
            pdf.save(`pedigree-${pedigreeData?.name || 'chart'}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const downloadImage = async () => {
        if (!pedigreeRef.current) return;
        setIsSaving(true);
        try {
            const el = pedigreeRef.current;
            const orig = { w: el.style.width, h: el.style.height, mh: el.style.minHeight, ov: el.style.overflow, p: el.style.padding };
            el.style.width = '2000px';
            el.style.height = 'auto';
            el.style.minHeight = 'unset';
            el.style.overflow = 'visible';
            el.style.padding = '40px 20px 32px 20px';
            const ggpStyle2 = document.createElement('style');
            ggpStyle2.textContent = '.ggp-chart-img { display: none !important; }';
            document.head.appendChild(ggpStyle2);
            await new Promise(r => setTimeout(r, 500));
            const srcCanvas = await html2canvas(el, {
                scale: 2, backgroundColor: '#ffffff', logging: false,
                useCORS: true, allowTaint: true, letterRendering: true,
                windowWidth: 2000, windowHeight: 9999,
                imageTimeout: 15000, scrollX: 0, scrollY: 0
            });
            document.head.removeChild(ggpStyle2);
            Object.assign(el.style, { width: orig.w, height: orig.h, minHeight: orig.mh, overflow: orig.ov, padding: orig.p });
            // Fit into A4 landscape canvas at 200dpi (2339 × 1654) with 30px padding
            const a4W = 2339, a4H = 1654, pad = 30;
            const maxW = a4W - pad * 2, maxH = a4H - pad * 2;
            const out = document.createElement('canvas');
            out.width = a4W; out.height = a4H;
            const ctx = out.getContext('2d');
            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, a4W, a4H);
            ctx.drawImage(srcCanvas, (a4W - maxW) / 2, (a4H - maxH) / 2, maxW, maxH);
            const link = document.createElement('a');
            link.download = `pedigree-${pedigreeData?.name || 'chart'}.png`;
            link.href = out.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Error generating image:', error);
        } finally {
            setIsSaving(false);
        }
    };

    useImperativeHandle(ref, () => ({
        downloadPDF,
        downloadImage,
        get imagesLoaded() { return imagesLoaded; },
        get isSaving() { return isSaving; },
    }), [downloadPDF, downloadImage, imagesLoaded, isSaving]);

    // Render card for main animal (larger with image)
    const renderMainAnimalCard = (animal) => {
        if (!animal) return null;
        
        const imgSrc = animal.imageUrl || animal.photoUrl || null;
        const colorCoat = [animal.color, animal.coatPattern, animal.coat].filter(Boolean).join(' ') || 'N/A';
        
        // Determine gender-based styling
        const isMale = animal.gender === 'Male';
        const bgColor = isMale ? 'bg-[#d4f1f5]' : 'bg-[#f8e8ee]';
        const GenderIcon = isMale ? Mars : Venus;
        
        return (
            <div className={`border border-gray-700 rounded-lg p-2 ${bgColor} relative flex gap-3 items-center`} style={{height: window.innerWidth < 640 ? '140px' : '160px'}}>
                {/* Image */}
                <div className="hide-for-pdf w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-gray-900">
                    {imgSrc ? (
                        <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={window.innerWidth < 640 ? 24 : 32} />
                    ) : (
                        <Cat size={window.innerWidth < 640 ? 24 : 32} className="text-gray-400" />
                    )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-start gap-2 py-2">
                    {/* Name */}
                    <div className="text-sm text-gray-900 font-bold leading-tight" style={{lineHeight: '1.2'}}>
                        {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`}
                    </div>
                    
                    {/* Variety */}
                    <div className="text-xs text-gray-900 leading-tight" style={{lineHeight: '1.2'}}>
                        {colorCoat}
                    </div>
                    
                    {/* Genetic Code */}
                    {animal.geneticCode && (
                        <div className="text-xs text-gray-900 leading-tight" style={{lineHeight: '1.2'}}>
                            {animal.geneticCode}
                        </div>
                    )}
                    
                    {/* Birth Date */}
                    <div className="text-xs text-gray-900 leading-tight" style={{lineHeight: '1.2'}}>
                        {animal.birthDate ? formatDate(animal.birthDate) : 'N/A'}
                    </div>
                    
                    {/* Deceased Date */}
                    {animal.deceasedDate ? (
                        <div className="text-red-600 leading-tight font-semibold text-xs" style={{lineHeight: '1.2'}}>
                            ? {formatDate(animal.deceasedDate)}
                        </div>
                    ) : null}
                    
                    {/* Breeder Info */}
                    <div className="text-xs text-gray-700 leading-tight italic" style={{lineHeight: '1.2'}}>
                        {animal.breederName || 'N/A'}
                    </div>
                </div>
                
                {/* Gender Icon - Top Right */}
                <div className="absolute top-2 right-2">
                    <GenderIcon size={24} className="text-gray-900" strokeWidth={2.5} />
                </div>
                
                {/* CT ID - Bottom Right */}
                <div className="absolute bottom-2 right-2 text-xs font-mono text-gray-700">
                    {animal.id_public}
                </div>
            </div>
        );
    };

    // Render card for parents (medium with image)
    const renderParentCard = (animal, isSire, onClick = null) => {
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
                        <GenderIcon size={24} className="text-gray-900" strokeWidth={2.5} />
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
                        <GenderIcon size={24} className="text-gray-900" strokeWidth={2.5} />
                    </div>
                </div>
            );
        }
        
        const imgSrc = animal.imageUrl || animal.photoUrl || null;
        const colorCoat = [animal.color, animal.coatPattern, animal.coat].filter(Boolean).join(' ') || 'N/A';
        
        return (
            <div 
                className={`border ${getBorderColor(animal)} rounded p-1.5 ${bgColor} relative flex gap-2 h-full items-center ${onClick ? 'cursor-pointer hover:opacity-80 transition' : ''}`}
                onClick={onClick ? () => onClick(animal) : undefined}
            >
                {/* Image - 1/3 width */}
                <div className="hide-for-pdf w-1/4 aspect-square bg-gray-100 rounded-lg border-2 border-gray-900 overflow-hidden flex items-center justify-center flex-shrink-0 pointer-events-none">
                    {imgSrc ? (
                        <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={window.innerWidth < 640 ? 24 : 32} />
                    ) : (
                        <Cat size={window.innerWidth < 640 ? 24 : 32} className="text-gray-400" />
                    )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-start gap-1.5 py-1 pointer-events-none">
                    {/* Name */}
                    <div className="text-xs text-gray-900 font-bold leading-tight" style={{lineHeight: '1.2'}}>
                        {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`}
                    </div>
                    
                    {/* Variety */}
                    <div className="text-xs text-gray-900 leading-tight" style={{lineHeight: '1.2'}}>
                        {colorCoat}
                    </div>
                    
                    {/* Genetic Code */}
                    {animal.geneticCode && (
                        <div className="text-xs text-gray-900 leading-tight" style={{lineHeight: '1.2'}}>
                            {animal.geneticCode}
                        </div>
                    )}
                    
                    {/* Birth Date */}
                    <div className="text-xs text-gray-900 leading-tight" style={{lineHeight: '1.2'}}>
                        {animal.birthDate ? formatDate(animal.birthDate) : 'N/A'}
                    </div>
                    
                    {/* Deceased Date */}
                    {animal.deceasedDate && (
                        <div className="text-red-600 leading-tight font-semibold text-xs" style={{lineHeight: '1.2'}}>
                            ? {formatDate(animal.deceasedDate)}
                        </div>
                    )}
                    
                    {/* Breeder */}
                    <div className="text-xs text-gray-700 leading-tight italic" style={{lineHeight: '1.2'}}>
                        {animal.breederName || 'N/A'}
                    </div>
                </div>
                
                {/* Gender Icon - Top Right */}
                <div className="absolute top-2 right-2 pointer-events-none">
                    <GenderIcon size={20} className="text-gray-900" strokeWidth={2.5} />
                </div>
                
                {/* CT ID - Bottom Right */}
                <div className="absolute bottom-2 right-2 text-xs font-mono text-gray-700 pointer-events-none">
                    {animal.id_public}
                </div>
            </div>
        );
    };

    // Render card for grandparents (with image)
    const renderGrandparentCard = (animal, isSire, onClick = null) => {
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
                    {/* Image placeholder - 1/4 width */}
                    <div className="hide-for-pdf w-1/4 aspect-square bg-gray-100 rounded-lg border-2 border-gray-900 overflow-hidden flex items-center justify-center flex-shrink-0">
                        <Cat size={18} className="text-gray-400" />
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
                    {/* Icon placeholder - 1/4 width */}
                    <div className="hide-for-pdf w-1/4 aspect-square bg-gray-100 rounded-lg border-2 border-gray-900 overflow-hidden flex items-center justify-center flex-shrink-0">
                        <EyeOff size={18} className="text-gray-500" />
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
        const colorCoat = [animal.color, animal.coatPattern, animal.coat].filter(Boolean).join(' ') || 'N/A';
        
        return (
            <div 
                className={`border ${getBorderColor(animal)} rounded p-1 ${bgColor} relative flex gap-1.5 h-full items-center ${onClick ? 'cursor-pointer hover:opacity-80 transition' : ''}`}
                onClick={onClick ? () => onClick(animal) : undefined}
            >
                {/* Image - 1/4 width */}
                <div className="hide-for-pdf w-1/4 aspect-square bg-gray-100 rounded-lg border-2 border-gray-900 overflow-hidden flex items-center justify-center flex-shrink-0 pointer-events-none">
                    {imgSrc ? (
                        <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={18} />
                    ) : (
                        <Cat size={20} className="text-gray-400" />
                    )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-start gap-1 py-0.5 pointer-events-none">
                    {/* Name */}
                    <div className="text-gray-900 font-bold leading-tight" style={{fontSize: '0.65rem', lineHeight: '1.2'}}>
                        {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`}
                    </div>
                    
                    {/* Variety */}
                    <div className="text-gray-900 leading-tight" style={{fontSize: '0.65rem', lineHeight: '1.2'}}>
                        {colorCoat}
                    </div>
                    
                    {/* Genetic Code */}
                    {animal.geneticCode && (
                        <div className="text-gray-900 leading-tight" style={{fontSize: '0.65rem', lineHeight: '1.2'}}>
                            {animal.geneticCode}
                        </div>
                    )}
                    
                    {/* Birth Date */}
                    <div className="text-gray-900 leading-tight" style={{fontSize: '0.65rem', lineHeight: '1.2'}}>
                        {animal.birthDate ? formatDate(animal.birthDate) : 'N/A'}
                    </div>
                    
                    {/* Deceased Date */}
                    {animal.deceasedDate ? (
                        <div className="text-red-600 leading-tight font-semibold" style={{fontSize: '0.65rem', lineHeight: '1.2'}}>
                            ? {formatDate(animal.deceasedDate)}
                        </div>
                    ) : null}
                    
                    {/* Breeder */}
                    <div className="text-gray-700 leading-tight italic" style={{fontSize: '0.65rem', lineHeight: '1.2'}}>
                        {animal.breederName || 'N/A'}
                    </div>
                </div>
                
                {/* Gender Icon - Top Right */}
                <div className="absolute top-1 right-1 pointer-events-none">
                    <GenderIcon size={14} className="text-gray-900" strokeWidth={2.5} />
                </div>
                
                {/* CT ID - Bottom Right */}
                <div className="absolute bottom-2 right-1 text-xs font-mono text-gray-700 pointer-events-none">
                    {animal.id_public}
                </div>
            </div>
        );
    };

    // Render card for great-grandparents (text only, no image)
    const renderGreatGrandparentCard = (animal, isSire, onClick = null) => {
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
                <div className={`border ${getBorderColor(animal)} rounded p-1 ${bgColor} flex gap-1 h-full items-center relative`}>
                    {/* Icon placeholder */}
                    <div className="hide-for-pdf ggp-chart-img w-8 h-8 bg-gray-100 rounded-lg border border-gray-900 overflow-hidden flex items-center justify-center flex-shrink-0">
                        <EyeOff size={12} className="text-gray-500" />
                    </div>
                    {/* Text */}
                    <div className="flex-1 flex items-center justify-start">
                        <span className="text-xs text-gray-600 font-semibold">Hidden</span>
                    </div>
                    <div className="absolute top-0.5 right-0.5">
                        <GenderIcon size={12} className="text-gray-900" strokeWidth={2.5} />
                    </div>
                </div>
            );
        }
        
        const imgSrc = animal.imageUrl || animal.photoUrl || null;
        const colorCoat = [animal.color, animal.coatPattern, animal.coat].filter(Boolean).join(' ') || 'N/A';
        
        return (
            <div 
                className={`border ${getBorderColor(animal)} rounded p-1 ${bgColor} relative h-full flex gap-1 items-center ${onClick ? 'cursor-pointer hover:opacity-80 transition' : ''}`}
                onClick={onClick ? () => onClick(animal) : undefined}
            >
                {/* Image */}
                <div className="hide-for-pdf ggp-chart-img w-8 h-8 bg-gray-100 rounded-lg border border-gray-900 overflow-hidden flex items-center justify-center flex-shrink-0 pointer-events-none">
                    {imgSrc ? (
                        <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={12} />
                    ) : (
                        <Cat size={12} className="text-gray-400" />
                    )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-start gap-0.5 py-0.5 pointer-events-none">
                    {/* Name */}
                    <div className="text-gray-900 font-bold leading-tight" style={{fontSize: '0.65rem', lineHeight: '1.3'}}>
                        {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`}
                    </div>
                
                    {/* Variety */}
                    <div className="text-gray-900 leading-tight" style={{fontSize: '0.65rem', lineHeight: '1.3'}}>
                        {colorCoat}
                    </div>
                    
                    {/* Birth Date */}
                    <div className="text-gray-900 leading-tight" style={{fontSize: '0.65rem', lineHeight: '1.3'}}>
                        {animal.birthDate ? formatDate(animal.birthDate) : 'N/A'}
                    </div>
                    
                    {/* Deceased Date */}
                    {animal.deceasedDate ? (
                        <div className="text-red-600 leading-tight font-semibold" style={{fontSize: '0.65rem', lineHeight: '1.3'}}>
                            ? {formatDate(animal.deceasedDate)}
                        </div>
                    ) : null}
                    
                    {/* Breeder */}
                    <div className="text-gray-700 leading-tight italic" style={{fontSize: '0.65rem', lineHeight: '1.3'}}>
                        {animal.breederName || 'N/A'}
                    </div>
                </div>
                
                {/* Gender Icon - Top Right */}
                <div className="absolute top-0.5 right-0.5 pointer-events-none">
                    <GenderIcon size={12} className="text-gray-900" strokeWidth={2.5} />
                </div>
                
                {/* CT ID - Bottom Right */}
                <div className="absolute bottom-1.5 right-0.5 text-xs font-mono text-gray-700 pointer-events-none">
                    {animal.id_public}
                </div>
            </div>
        );
    };

    const renderPedigreeTree = (animal) => {
        if (!animal) return null;

        // Handler for clicking on pedigree cards
        const handleCardClick = (clickedAnimal) => {
            if (clickedAnimal && clickedAnimal.id_public) {
                if (onViewAnimal) {
                    onViewAnimal(clickedAnimal, 16, 'chart');
                } else {
                    setStackedPedigree(clickedAnimal);
                }
            }
        };

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

        // Responsive heights - reasonable mobile sizing
        const isMobile = window.innerWidth < 640; // sm breakpoint
        const contentHeight = isMobile ? 600 : 900; // Increased height to fit text
        const gap = isMobile ? 4 : 8; // gap-1 = 4px, gap-2 = 8px
        const gapClass = isMobile ? 'gap-1' : 'gap-2';
        
        // Calculate card heights accounting for gaps to ensure equal total column heights
        const parentHeight = (contentHeight - gap) / 2; // 2 cards, 1 gap
        const grandparentHeight = (contentHeight - (3 * gap)) / 4; // 4 cards, 3 gaps
        const greatGrandparentHeight = (contentHeight - (7 * gap)) / 8; // 8 cards, 7 gaps

        return (
            <div className={`flex ${gapClass} w-full`} style={{height: `${contentHeight}px`, minWidth: isMobile ? '600px' : 'auto'}}>
                    {/* Column 1: Parents (2 rows, each takes 1/2 height) */}
                    <div className={`w-1/3 flex flex-col ${gapClass}`}>
                        <div style={{height: `${parentHeight}px`}}>
                            {renderParentCard(father, true, handleCardClick)}
                        </div>
                        <div style={{height: `${parentHeight}px`}}>
                            {renderParentCard(mother, false, handleCardClick)}
                        </div>
                    </div>

                    {/* Column 2: Grandparents (4 rows, each takes 1/4 height) */}
                    <div className={`w-1/3 flex flex-col ${gapClass}`}>
                        <div style={{height: `${grandparentHeight}px`}}>
                            {renderGrandparentCard(paternalGrandfather, true, handleCardClick)}
                        </div>
                        <div style={{height: `${grandparentHeight}px`}}>
                            {renderGrandparentCard(paternalGrandmother, false, handleCardClick)}
                        </div>
                        <div style={{height: `${grandparentHeight}px`}}>
                            {renderGrandparentCard(maternalGrandfather, true, handleCardClick)}
                        </div>
                        <div style={{height: `${grandparentHeight}px`}}>
                            {renderGrandparentCard(maternalGrandmother, false, handleCardClick)}
                        </div>
                    </div>

                    {/* Column 3: Great-Grandparents (8 rows, each takes 1/8 height) */}
                    <div className={`w-1/3 flex flex-col ${gapClass}`}>
                        <div style={{height: `${greatGrandparentHeight}px`}}>
                            {renderGreatGrandparentCard(pgfFather, true, handleCardClick)}
                        </div>
                        <div style={{height: `${greatGrandparentHeight}px`}}>
                            {renderGreatGrandparentCard(pgfMother, false, handleCardClick)}
                        </div>
                        <div style={{height: `${greatGrandparentHeight}px`}}>
                            {renderGreatGrandparentCard(pgmFather, true, handleCardClick)}
                        </div>
                        <div style={{height: `${greatGrandparentHeight}px`}}>
                            {renderGreatGrandparentCard(pgmMother, false, handleCardClick)}
                        </div>
                        <div style={{height: `${greatGrandparentHeight}px`}}>
                            {renderGreatGrandparentCard(mgfFather, true, handleCardClick)}
                        </div>
                        <div style={{height: `${greatGrandparentHeight}px`}}>
                            {renderGreatGrandparentCard(mgfMother, false, handleCardClick)}
                        </div>
                        <div style={{height: `${greatGrandparentHeight}px`}}>
                            {renderGreatGrandparentCard(mgmFather, true, handleCardClick)}
                        </div>
                        <div style={{height: `${greatGrandparentHeight}px`}}>
                            {renderGreatGrandparentCard(mgmMother, false, handleCardClick)}
                        </div>
                    </div>
                </div>
        );
    };

    if (loading) {
        if (inline) {
            return <div className="flex items-center justify-center py-12 gap-2 text-gray-400"><Loader2 size={18} className="animate-spin" /><span className="text-sm">Loading pedigree chart…</span></div>;
        }
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
        if (!ownerProfile) return null;
        
        const userId = ownerProfile.id_public;
        const lines = [];
        
        const showPersonalName = ownerProfile.showPersonalName ?? false;
        const showBreederName = ownerProfile.showBreederName ?? false;
        
        if (showPersonalName && ownerProfile.personalName) {
            lines.push(ownerProfile.personalName);
        }
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
        if (!ownerProfile) return '';
        
        const userId = ownerProfile.id_public;
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

    if (inline) {
        return (
            <>
                <div ref={pedigreeRef} className="bg-white rounded-xl border border-gray-200 relative w-full overflow-x-auto">
                    <div style={{minWidth: '700px'}}>
                        <div className="flex gap-0.5 sm:gap-2 mb-0.5 sm:mb-2 items-start">
                            <div className="w-1/3">{pedigreeData && renderMainAnimalCard(pedigreeData)}</div>
                            <div className="w-1/3 flex items-center justify-center">
                                <div className="text-center">
                                    <h3 className="text-xs sm:text-lg font-bold text-gray-800">{pedigreeData?.species || 'Unknown Species'}</h3>
                                    {pedigreeData?.species && getSpeciesLatinName(pedigreeData.species) && (
                                        <p className="text-xs sm:text-sm italic text-gray-600">{getSpeciesLatinName(pedigreeData.species)}</p>
                                    )}
                                </div>
                            </div>
                            {ownerProfile && (
                            <div className="w-1/3 flex items-center justify-end gap-0.5 sm:gap-3">
                                <div className="text-right">
                                    {(() => {
                                        const ownerInfo = getOwnerDisplayInfoTopRight();
                                        if (!ownerInfo) return null;
                                        return (<>{ownerInfo.lines.map((line, idx) => (<div key={idx} className="text-xs sm:text-base font-semibold text-gray-800 leading-tight">{line}</div>))}{ownerInfo.userId && <div className="text-xs text-gray-600 mt-1">{ownerInfo.userId}</div>}</>);
                                    })()}
                                </div>
                                <div className="w-6 h-6 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                                    {(ownerProfile?.profileImage || ownerProfile?.profileImageUrl) ? <img src={ownerProfile.profileImage || ownerProfile.profileImageUrl} alt="Breeder" className="w-full h-full object-cover" /> : <User size={12} className="text-gray-400 sm:w-8 sm:h-8" />}
                                </div>
                            </div>
                            )}
                        </div>
                        <div>{renderPedigreeTree(displayData)}</div>
                        <div className="mt-4 pt-3 pb-2 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                            <div>{getOwnerDisplayInfoBottomLeft()}</div>
                            <div>{formatDate(new Date())}</div>
                        </div>
                    </div>
                </div>
                {stackedPedigree && (
                    <div className="fixed inset-0 z-[90]">
                        <PedigreeChart animalId={stackedPedigree.id_public} animalData={stackedPedigree} onClose={() => setStackedPedigree(null)} API_BASE_URL={API_BASE_URL} authToken={authToken} />
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen flex justify-center pt-2 sm:pt-4 pb-2 sm:pb-4 px-2 sm:px-4">
                <div className="bg-white rounded-xl shadow-2xl h-fit w-full max-w-[98vw] sm:max-w-[95vw]">
                    {/* Header */}
                    <div className="flex justify-between items-center px-2 sm:px-6 py-2 sm:py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
                            <FileText className="mr-1 sm:mr-2" size={18} />
                            <span className="hidden sm:inline">Pedigree Chart</span>
                            <span className="sm:hidden"><TreeDeciduous size={14} className="inline-block align-middle mr-1 flex-shrink-0" /> Pedigree</span>
                        </h2>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={downloadPDF}
                                disabled={!imagesLoaded}
                                data-tutorial-target="download-pdf-btn"
                                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 font-semibold rounded-lg transition text-xs sm:text-base ${
                                    imagesLoaded 
                                        ? 'bg-primary hover:bg-primary/90 text-black cursor-pointer' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                title={!imagesLoaded ? 'Waiting for images to load...' : 'Download PDF'}
                            >
                                <Download size={16} />
                                <span className="hidden sm:inline">{isSaving ? 'Saving...' : imagesLoaded ? 'Save PDF' : 'Loading...'}</span>
                                <span className="sm:hidden">{isSaving ? '...' : imagesLoaded ? 'PDF' : '...'}</span>
                            </button>
                            <button
                                onClick={downloadImage}
                                disabled={!imagesLoaded || isSaving}
                                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 font-semibold rounded-lg transition text-xs sm:text-base ${
                                    imagesLoaded && !isSaving
                                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 cursor-pointer'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                title={!imagesLoaded ? 'Waiting for images to load...' : 'Save as Image (A4 Landscape)'}
                            >
                                <Images size={16} />
                                <span className="hidden sm:inline">{isSaving ? 'Saving...' : imagesLoaded ? 'Save Image' : 'Loading...'}</span>
                                <span className="sm:hidden">{isSaving ? '...' : imagesLoaded ? 'Img' : '...'}</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-1 sm:p-6" style={{paddingBottom: window.innerWidth < 640 ? '80px' : '1.5rem'}}>

                {/* Pedigree Chart - Responsive on mobile, fixed aspect ratio for PDF */}
                <div ref={pedigreeRef} className="bg-white p-1 sm:p-6 rounded-lg border-2 border-gray-300 relative w-full" style={{minHeight: window.innerWidth < 640 ? '320px' : '400px'}}>
                    {/* Entire content scrollable horizontally inside the white container */}
                    <div className="overflow-x-auto overflow-y-visible sm:overflow-hidden" style={{minWidth: 'auto'}}>
                        <div style={{minWidth: window.innerWidth < 640 ? '800px' : 'auto'}}>
                            {/* Top Row: 3 columns - Main Animal | Species | Owner */}
                            <div className="flex gap-0.5 sm:gap-2 mb-0.5 sm:mb-2 items-start">
                                {/* Left: Main Animal - Same width as parent cards */}
                                <div className="w-1/3">
                                    {pedigreeData && renderMainAnimalCard(pedigreeData)}
                                </div>

                                {/* Species */}
                                <div className="w-1/3 flex items-center justify-center">
                                    <div className="text-center">
                                        <h3 className="text-xs sm:text-lg font-bold text-gray-800">{pedigreeData?.species || 'Unknown Species'}</h3>
                                        {pedigreeData?.species && getSpeciesLatinName(pedigreeData.species) && (
                                            <p className="text-xs sm:text-sm italic text-gray-600">{getSpeciesLatinName(pedigreeData.species)}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Breeder Profile */}
                                {ownerProfile && (
                                    <div className="w-1/3 flex items-center justify-end gap-0.5 sm:gap-3">
                                        <div className="text-right">
                                            {(() => {
                                                const ownerInfo = getOwnerDisplayInfoTopRight();
                                                if (!ownerInfo) return null;
                                                return (
                                                    <>
                                                        {ownerInfo.lines.map((line, idx) => (
                                                            <div key={idx} className="text-xs sm:text-base font-semibold text-gray-800 leading-tight">{line}</div>
                                                        ))}
                                                        {ownerInfo.userId && (
                                                            <div className="text-xs text-gray-600 mt-1">{ownerInfo.userId}</div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        <div className="hide-for-pdf w-6 h-6 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                                            {(ownerProfile?.profileImage || ownerProfile?.profileImageUrl) ? (
                                                <img src={ownerProfile.profileImage || ownerProfile.profileImageUrl} alt="Breeder" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={12} className="text-gray-400 sm:w-8 sm:h-8" />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pedigree Tree */}
                            <div>
                                {renderPedigreeTree(displayData)}
                            </div>

                            {/* Footer - Inside scrollable content */}
                            <div className="mt-4 pt-3 pb-4 border-t-2 border-gray-300 flex justify-between items-center text-sm text-gray-600">
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

            {/* Stacked Pedigree Modal - Higher z-index to appear above main pedigree */}
            {stackedPedigree && (
                <div className="fixed inset-0 z-[90]">
                    <PedigreeChart
                        animalId={stackedPedigree.id_public}
                        animalData={stackedPedigree}
                        onClose={() => setStackedPedigree(null)}
                        API_BASE_URL={API_BASE_URL}
                        authToken={authToken}
                        onViewAnimal={onViewAnimal}
                    />
                </div>
            )}
        </div>
        </div>
    );
});

// (Removed unused `AnimalListItem` component to reduce redundancy)


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
                        {animal.species} &bull; {animal.gender} &bull; {animal.status || 'Unknown'}
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
                const trimmedTerm = searchTerm.trim();
                const numericMatch = trimmedTerm.match(/(\d+)/);
                const numericId = numericMatch ? numericMatch[1] : null;
                
                // Check if it's a user ID pattern (CTU or just numbers)
                const hasCTU = /CTU/i.test(trimmedTerm);
                const isNumericOnly = /^\d+$/.test(trimmedTerm);
                
                let searchQuery = trimmedTerm;
                if ((hasCTU || isNumericOnly) && numericId) {
                    searchQuery = `CTU${numericId}`;
                }
                
                const url = `${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(searchQuery)}&limit=50`;
                console.log('Fetching users from:', url);
                const response = await axios.get(url);
                console.log('User search response:', response.data);
                if (response.data && response.data.length > 0) {
                    console.log('First user object keys:', Object.keys(response.data[0]));
                    console.log('First user object:', response.data[0]);
                }
                
                // Filter out completely anonymous users (both names hidden/unavailable)
                const filteredUsers = (response.data || []).filter(user => {
                    const showPersonalName = user.showPersonalName ?? false;
                    const showBreederName = user.showBreederName ?? false;
                    const hasPersonalName = showPersonalName && user.personalName;
                    const hasBreederName = showBreederName && user.breederName;
                    
                    // Only include users who have at least one name visible
                    return hasPersonalName || hasBreederName;
                });
                
                setUserResults(filteredUsers);
                setAnimalResults([]);
            } else {
                // Search for animals globally
                const trimmedTerm = searchTerm.trim();
                const numericMatch = trimmedTerm.match(/(\d+)/);
                const numericId = numericMatch ? numericMatch[1] : null;
                
                // Check if it's an animal ID pattern (CTC, CT, or just numbers)
                const hasCTC = /CTC/i.test(trimmedTerm);
                const hasCT = /^CT[- ]?\d+$/i.test(trimmedTerm);
                const isNumericOnly = /^\d+$/.test(trimmedTerm);
                
                let url;
                if ((hasCTC || hasCT || isNumericOnly) && numericId) {
                    // Format the ID as CTCXXX
                    url = `${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(`CTC${numericId}`)}`;
                } else {
                    url = `${API_BASE_URL}/public/global/animals?name=${encodeURIComponent(trimmedTerm)}&species=${encodeURIComponent(trimmedTerm)}`;
                }
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
            ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(user.createdAt))
            : (user.updatedAt ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(user.updatedAt)) : null);
        
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
                        <p className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            {displayName}
                            <DonationBadge badge={getDonationBadge(user)} size="sm" />
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
                    <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-gray-800">
                            {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`}
                        </p>
                    </div>
                    <p className="text-sm text-gray-600">
                        {animal.species} &bull; {animal.gender} &bull; <span className="font-mono">{animal.id_public}</span>
                    </p>
                    {animal.color && <p className="text-xs text-gray-500 mt-1">{animal.color}</p>}
                    {(animal.manualBreederName || animal.breederName) && (
                        <p className="text-xs text-gray-500 mt-1">
                            Breeder: {animal.manualBreederName || animal.breederName}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    const results = searchType === 'users' ? userResults : animalResults;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">Global Search <Search size={18} className="flex-shrink-0" /></h3>
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

// Global search bar component with dropdown results

const ViewOnlyParentCard = ({ parentId, parentType, API_BASE_URL, onViewAnimal, authToken }) => {
    const [parentData, setParentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [foundViaOwned, setFoundViaOwned] = useState(false);

    React.useEffect(() => {
        if (!parentId) {
            setParentData(null);
            setNotFound(false);
            setFoundViaOwned(false);
            return;
        }

        const fetchParent = async () => {
            setLoading(true);
            setNotFound(false);
            setFoundViaOwned(false);
            try {
                // If authToken is available, try fetching from owned animals first
                if (authToken) {
                    try {
                        const ownedResponse = await axios.get(`${API_BASE_URL}/animals/${parentId}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        if (ownedResponse.data) {
                            // Found in user's own animals ? always show, even if private
                            setParentData(ownedResponse.data);
                            setFoundViaOwned(true);
                            setLoading(false);
                            return;
                        }
                    } catch (ownedError) {
                        // Not in owned animals, try /animals/any for sold/transferred animals
                        try {
                            const anyResponse = await axios.get(`${API_BASE_URL}/animals/any/${parentId}`, {
                                headers: { Authorization: `Bearer ${authToken}` }
                            });
                            if (anyResponse.data) {
                                // Found via related (not owned) ? respect isPrivate flag
                                setParentData(anyResponse.data);
                                setLoading(false);
                                return;
                            }
                        } catch (anyError) {
                            console.log(`${parentType} not in owned or related animals, checking public database`);
                        }
                    }
                }

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
    }, [parentId, parentType, API_BASE_URL, authToken]);

    if (!parentId) {
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

    if (notFound || (!foundViaOwned && !parentData?.showOnPublicProfile)) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <EyeOff size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm font-semibold">Private {parentType}</p>
                <p className="text-xs text-gray-400 mt-0.5">This animal is not public</p>
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
                `${API_BASE_URL}/api/species-genetics-feedback`,
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




﻿
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
    speciesConfigs,        // Field replacements per species (legacy - to be phased out)
    initialValues,         // Optional: pre-fill defaults for new animal (e.g. Add Sibling)
    X, 
    Search, 
    Loader2, 
    LoadingSpinner,
    PlusCircle, ArrowLeft, Save, Trash2, RotateCcw,
    GENDER_OPTIONS, STATUS_OPTIONS,
    AnimalImageUpload // Assuming this component is defined elsewhere
}) => {
    
    // State for field template (new system)
    const [fieldTemplate, setFieldTemplate] = useState(null);
    const [loadingTemplate, setLoadingTemplate] = useState(false);
    const [enclosureOptions, setEnclosureOptions] = useState([]);
    const [showQuickEnclosureForm, setShowQuickEnclosureForm] = useState(false);
    const [quickEnclosureName, setQuickEnclosureName] = useState('');
    const [quickEnclosureType, setQuickEnclosureType] = useState('');
    const [quickEnclosureSize, setQuickEnclosureSize] = useState('');
    const [newCareTaskName, setNewCareTaskName] = useState('');
    const [newCareTaskFreq, setNewCareTaskFreq] = useState('');
    const [newAnimalCareTaskName, setNewAnimalCareTaskName] = useState('');
    const [newAnimalCareTaskFreq, setNewAnimalCareTaskFreq] = useState('');
    // Keeper History add-entry states
    const [khMode, setKhMode] = useState('manual'); // 'manual' | 'user'
    const [khName, setKhName] = useState('');
    const [khCountry, setKhCountry] = useState('');
    const [khSelectedUser, setKhSelectedUser] = useState(null);
    const [khUserSearch, setKhUserSearch] = useState('');
    const [khUserResults, setKhUserResults] = useState([]);
    const [khSearching, setKhSearching] = useState(false);

    // Fetch user's enclosures for the dropdown
    useEffect(() => {
        if (!authToken) return;
        axios.get(`${API_BASE_URL}/enclosures`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => setEnclosureOptions(res.data))
            .catch(() => {});
    }, [authToken, API_BASE_URL]);
    
    // Default field labels - can be overridden by species config
    const defaultFieldLabels = {
        breederAssignedId: 'Identification',
        strain: 'Strain',
        heatStatus: 'Heat Status',
        earset: 'Ear Set',
        housingType: 'Housing Type',
        noise: 'Noise Level',
        bedding: 'Bedding Type',
        geneticCode: 'Genetic Code'
    };
    
    // Get field label - uses field template, then species config, then default
    const getFieldLabel = (fieldName, defaultLabel) => {
        // Priority 1: Field template (new system)
        if (fieldTemplate?.fields?.[fieldName]?.label) {
            return fieldTemplate.fields[fieldName].label;
        }
        
        // Priority 2: Species config (legacy system)
        const config = speciesConfigs?.[formData.species];
        if (config?.fieldReplacements?.[fieldName]) {
            return config.fieldReplacements[fieldName];
        }
        
        // Priority 3: Default labels
        return defaultLabel || defaultFieldLabels[fieldName] || fieldName;
    };
    
    // Check if a field is hidden for the current species
    // CRITICAL: Never hide fields that have existing data (backward compatibility)
    // Legal fields are always shown for all species regardless of template settings
    const ALWAYS_VISIBLE_FIELDS = new Set([
        'licenseNumber', 'licenseJurisdiction', 'insurance', 'legalStatus',
        'breedingRestrictions', 'exportRestrictions',
    ]);

    const isFieldHidden = (fieldName) => {
        // Legal/ownership fields are always visible regardless of template
        if (ALWAYS_VISIBLE_FIELDS.has(fieldName)) return false;

        // Template takes priority ? if field is explicitly disabled, always hide it
        // (even if the animal has existing data in that field)
        if (fieldTemplate) {
            const fieldConfig = fieldTemplate.fields?.[fieldName];
            if (fieldConfig) {
                const isHidden = fieldConfig.enabled === false;
                if (fieldName === 'coat' || fieldName === 'earset' || fieldName === 'strain') {
                    console.log(`[AnimalForm] Field ${fieldName}:`, { enabled: fieldConfig.enabled, isHidden });
                }
                return isHidden;
            }
            // Field not listed in template ? show it (fail-safe)
            return false;
        }

        // No template loaded ? fall back to "has data" safety check for edit mode
        if (animalToEdit && formData[fieldName] && formData[fieldName] !== '' && formData[fieldName] !== null) {
            return false; // Always show fields with existing data when no template
        }

        // Fall back to old SpeciesConfig system
        const config = speciesConfigs?.[formData.species];
        return config?.hiddenFields?.includes(fieldName) || false;
    };
    
    // Initial state setup (using the passed props for options)
    const [formData, setFormData] = useState(
        animalToEdit ? {
            species: animalToEdit.species,
            breederAssignedId: animalToEdit.breederAssignedId || animalToEdit.breederyId || animalToEdit.registryCode || '',
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
            fatherId_public: animalToEdit.fatherId_public || animalToEdit.sireId_public || null,
            motherId_public: animalToEdit.motherId_public || animalToEdit.damId_public || null,
            breederId_public: animalToEdit.breederId_public || null,
            keeperName: animalToEdit.keeperName || animalToEdit.ownerName || animalToEdit.currentOwner || animalToEdit.currentOwnerDisplay || '',
            groupRole: animalToEdit.groupRole || '',
                isPregnant: animalToEdit.isPregnant || false,
            isNursing: animalToEdit.isNursing || false,
            isInMating: animalToEdit.isInMating || false,
            isQuarantine: animalToEdit.isQuarantine || false,
            enclosureId: animalToEdit.enclosureId || '',
            lastFedDate: animalToEdit.lastFedDate ? new Date(animalToEdit.lastFedDate).toISOString().split('T')[0] : '',
            feedingFrequencyDays: animalToEdit.feedingFrequencyDays || '',
            lastMaintenanceDate: animalToEdit.lastMaintenanceDate ? new Date(animalToEdit.lastMaintenanceDate).toISOString().split('T')[0] : '',
            maintenanceFrequencyDays: animalToEdit.maintenanceFrequencyDays || '',
            careTasks: animalToEdit.careTasks || [],
            animalCareTasks: animalToEdit.animalCareTasks || [],
            isOwned: animalToEdit.isOwned ?? true,
            isDisplay: animalToEdit.isDisplay ?? false,
            // New fields for comprehensive mammal profile
            microchipNumber: animalToEdit.microchipNumber || '',
            pedigreeRegistrationId: animalToEdit.pedigreeRegistrationId || '',
            colonyId: animalToEdit.colonyId || '',
            breed: animalToEdit.breed || '',
            strain: animalToEdit.strain || '',
            coatPattern: animalToEdit.coatPattern || '',
            phenotype: animalToEdit.phenotype || '',
            morph: animalToEdit.morph || '',
            markings: animalToEdit.markings || '',
            eyeColor: animalToEdit.eyeColor || '',
            nailColor: animalToEdit.nailColor || '',
            size: animalToEdit.size || '',
            carrierTraits: animalToEdit.carrierTraits || '',
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
            matingDate: animalToEdit.matingDate || '',
            expectedDueDate: animalToEdit.expectedDueDate ? new Date(animalToEdit.expectedDueDate).toISOString().substring(0, 10) : '',
            litterCount: animalToEdit.litterCount || '',
            litterSizeBorn: animalToEdit.litterSizeBorn || '',
            litterSizeWeaned: animalToEdit.litterSizeWeaned || '',
            stillbornCount: animalToEdit.stillbornCount || '',
            nursingStartDate: animalToEdit.nursingStartDate ? new Date(animalToEdit.nursingStartDate).toISOString().substring(0, 10) : '',
            weaningDate: animalToEdit.weaningDate ? new Date(animalToEdit.weaningDate).toISOString().substring(0, 10) : '',
            // Stud/Fertility fields (sire role)
            isStudAnimal: animalToEdit.isStudAnimal || false,
            availableForBreeding: animalToEdit.availableForBreeding || false,
            studFeeCurrency: animalToEdit.studFeeCurrency || 'USD',
            studFeeAmount: animalToEdit.studFeeAmount || '',
            // Sale fields
            isForSale: animalToEdit.isForSale || false,
            salePriceCurrency: animalToEdit.salePriceCurrency || 'USD',
            salePriceAmount: animalToEdit.salePriceAmount || '',
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
            keeperHistory: animalToEdit.keeperHistory || [],
            // Show tab fields
            showTitles: animalToEdit.showTitles || '',
            showRatings: animalToEdit.showRatings || '',
            judgeComments: animalToEdit.judgeComments || '',
            workingTitles: animalToEdit.workingTitles || '',
            performanceScores: animalToEdit.performanceScores || '',
            // Dog/Cat specific - Physical measurements (duplicate entries removed)
            // heightAtWithers: animalToEdit.heightAtWithers || '', // Already defined above
            // bodyLength: animalToEdit.bodyLength || '', // Already defined above
            chestGirth: animalToEdit.chestGirth || '',
            adultWeight: animalToEdit.adultWeight || '',
            // bodyConditionScore: animalToEdit.bodyConditionScore || '', // Already defined above
            // Dog/Cat specific - Identification
            licenseNumber: animalToEdit.licenseNumber || '',
            licenseJurisdiction: animalToEdit.licenseJurisdiction || '',
            rabiesTagNumber: animalToEdit.rabiesTagNumber || '',
            tattooId: animalToEdit.tattooId || '',
            akcRegistrationNumber: animalToEdit.akcRegistrationNumber || '',
            fciRegistrationNumber: animalToEdit.fciRegistrationNumber || '',
            cfaRegistrationNumber: animalToEdit.cfaRegistrationNumber || '',
            workingRegistryIds: animalToEdit.workingRegistryIds || '',
            // Dog/Cat specific - Reproduction
            estrusCycleLength: animalToEdit.estrusCycleLength || '',
            gestationLength: animalToEdit.gestationLength || '',
            artificialInseminationUsed: animalToEdit.artificialInseminationUsed || false,
            whelpingDate: animalToEdit.whelpingDate ? new Date(animalToEdit.whelpingDate).toISOString().substring(0, 10) : '',
            queeningDate: animalToEdit.queeningDate ? new Date(animalToEdit.queeningDate).toISOString().substring(0, 10) : '',
            deliveryMethod: animalToEdit.deliveryMethod || '',
            reproductiveComplications: animalToEdit.reproductiveComplications || '',
            reproductiveClearances: animalToEdit.reproductiveClearances || '',
            // Dog/Cat specific - Health
            spayNeuterDate: animalToEdit.spayNeuterDate ? new Date(animalToEdit.spayNeuterDate).toISOString().substring(0, 10) : '',
            parasitePreventionSchedule: animalToEdit.parasitePreventionSchedule || '',
            heartwormStatus: animalToEdit.heartwormStatus || '',
            hipElbowScores: animalToEdit.hipElbowScores || '',
            geneticTestResults: animalToEdit.geneticTestResults || '',
            eyeClearance: animalToEdit.eyeClearance || '',
            cardiacClearance: animalToEdit.cardiacClearance || '',
            dentalRecords: animalToEdit.dentalRecords || '',
            chronicConditions: animalToEdit.chronicConditions || '',
            // Dog/Cat specific - Husbandry
            exerciseRequirements: animalToEdit.exerciseRequirements || '',
            dailyExerciseMinutes: animalToEdit.dailyExerciseMinutes || '',
            groomingNeeds: animalToEdit.groomingNeeds || '',
            sheddingLevel: animalToEdit.sheddingLevel || '',
            crateTrained: animalToEdit.crateTrained || false,
            litterTrained: animalToEdit.litterTrained || false,
            leashTrained: animalToEdit.leashTrained || false,
            freeFlightTrained: animalToEdit.freeFlightTrained || false,
            // Dog/Cat specific - Training & Behavior
            trainingLevel: animalToEdit.trainingLevel || '',
            trainingDisciplines: animalToEdit.trainingDisciplines || '',
            certifications: animalToEdit.certifications || '',
            workingRole: animalToEdit.workingRole || '',
            behavioralIssues: animalToEdit.behavioralIssues || '',
            biteHistory: animalToEdit.biteHistory || '',
            reactivityNotes: animalToEdit.reactivityNotes || '',
            // Dog/Cat specific - Legal & Ownership
            endOfLifeCareNotes: animalToEdit.endOfLifeCareNotes || '',
            coOwnership: animalToEdit.coOwnership || '',
            transferHistory: animalToEdit.transferHistory || '',
            breedingRestrictions: animalToEdit.breedingRestrictions || '',
            exportRestrictions: animalToEdit.exportRestrictions || '',
            legalDocuments: animalToEdit.legalDocuments || [],
        } : {
            species: species, 
            breederAssignedId: '',
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
            // Apply any sibling/template pre-fills (spread last so they override defaults)
            ...(initialValues || {}),
            keeperName: '',
            groupRole: '',
            isPregnant: false,
            isNursing: false,
            isInMating: false,
            isQuarantine: false,
            enclosureId: '',
            lastFedDate: '',
            feedingFrequencyDays: '',
            lastMaintenanceDate: '',
            maintenanceFrequencyDays: '',
            careTasks: [],
            animalCareTasks: [],
            breedingRole: 'both',
            isOwned: true,
            isDisplay: true,
            // New fields defaults
            microchipNumber: '',
            pedigreeRegistrationId: '',
            colonyId: '',
            breed: '',
            strain: '',
            coatPattern: '',
            phenotype: '',
            morph: '',
            markings: '',
            eyeColor: '',
            nailColor: '',
            size: '',
            carrierTraits: '',
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
            matingDate: '',
            expectedDueDate: '',
            litterCount: '',
            litterSizeBorn: '',
            litterSizeWeaned: '',
            stillbornCount: '',
            nursingStartDate: '',
            weaningDate: '',
            // Stud/Fertility fields (sire role)
            isStudAnimal: false,
            availableForBreeding: false,
            studFeeCurrency: 'USD',
            studFeeAmount: '',
            // Sale fields
            isForSale: false,
            salePriceCurrency: 'USD',
            salePriceAmount: '',
            fertilityStatus: '',
            lastMatingDate: '',
            successfulMatings: '',
            fertilityNotes: '',
            // Dam/Fertility fields (dam role)
            isDamAnimal: false,
            damFertilityStatus: '',
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
            keeperHistory: [],
            // Show tab fields
            showTitles: '',
            showRatings: '',
            judgeComments: '',
            workingTitles: '',
            performanceScores: '',
            // Dog/Cat specific - Physical measurements (duplicate entries removed)
            // heightAtWithers: '', // Already defined above
            // bodyLength: '', // Already defined above  
            chestGirth: '',
            adultWeight: '',
            // bodyConditionScore: '', // Already defined above
            // Dog/Cat specific - Identification
            licenseNumber: '',
            licenseJurisdiction: '',
            rabiesTagNumber: '',
            tattooId: '',
            akcRegistrationNumber: '',
            fciRegistrationNumber: '',
            cfaRegistrationNumber: '',
            workingRegistryIds: '',
            // Dog/Cat specific - Reproduction
            estrusCycleLength: '',
            gestationLength: '',
            artificialInseminationUsed: false,
            whelpingDate: '',
            queeningDate: '',
            deliveryMethod: '',
            reproductiveComplications: '',
            reproductiveClearances: '',
            // Dog/Cat specific - Health
            spayNeuterDate: '',
            parasitePreventionSchedule: '',
            heartwormStatus: '',
            hipElbowScores: '',
            geneticTestResults: '',
            eyeClearance: '',
            cardiacClearance: '',
            dentalRecords: '',
            chronicConditions: '',
            // Dog/Cat specific - Husbandry
            exerciseRequirements: '',
            dailyExerciseMinutes: '',
            groomingNeeds: '',
            sheddingLevel: '',
            crateTrained: false,
            litterTrained: false,
            leashTrained: false,
            freeFlightTrained: false,
            trainingLevel: '',
            trainingDisciplines: '',
            certifications: '',
            workingRole: '',
            behavioralIssues: '',
            biteHistory: '',
            reactivityNotes: '',
            // Dog/Cat specific - Legal & Ownership
            endOfLifeCareNotes: '',
            coOwnership: '',
            transferHistory: '',
            breedingRestrictions: '',
            exportRestrictions: '',
            legalDocuments: [],
        }
    );
    
    // Fetch field template when species changes
    useEffect(() => {
        if (!formData.species) return;
        
        const fetchFieldTemplate = async () => {
            try {
                setLoadingTemplate(true);
                const response = await axios.get(
                    `${API_BASE_URL}/species/with-template/${encodeURIComponent(formData.species)}`
                );
                
                console.log('[AnimalForm] Field template response:', response.data);
                
                if (response.data?.fieldTemplate) {
                    setFieldTemplate(response.data.fieldTemplate);
                    console.log('[AnimalForm] Field template loaded:', response.data.fieldTemplate.name);
                    console.log('[AnimalForm] Template fields structure:', Object.keys(response.data.fieldTemplate.fields || {}).length + ' fields');
                } else {
                    setFieldTemplate(null); // No template - show all fields
                    console.log('[AnimalForm] No field template available for species:', formData.species);
                }
            } catch (error) {
                console.error('[AnimalForm] Error fetching field template:', error);
                setFieldTemplate(null); // On error, show all fields for safety
            } finally {
                setLoadingTemplate(false);
            }
        };
        
        fetchFieldTemplate();
    }, [formData.species, API_BASE_URL]);
    
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
    // Tag input state (for typing tags before adding them)
    const [tagInput, setTagInput] = useState('');
    
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
    
    const [breedingRecords, setBreedingRecords] = useState(() => {
        // Parse from database field 'breedingRecords'
        const data = animalToEdit?.breedingRecords;
        console.log('[DEBUG] Loading breeding records from database:', data);
        if (!data) return [];
        if (Array.isArray(data)) {
            console.log('[DEBUG] Breeding records loaded (array):', data);
            // Log mate information specifically
            data.forEach((record, index) => {
                console.log(`[DEBUG] Record ${index} mate data:`, {
                    mate: record.mate,
                    mateAnimalId: record.mateAnimalId,
                    litterId: record.litterId,
                    id: record.id
                });
            });
            return data;
        }
        if (typeof data === 'string') {
            try { 
                const parsed = JSON.parse(data);
                console.log('[DEBUG] Breeding records loaded (parsed):', parsed);
                // Log mate information specifically
                if (Array.isArray(parsed)) {
                    parsed.forEach((record, index) => {
                        console.log(`[DEBUG] Record ${index} mate data:`, {
                            mate: record.mate,
                            mateAnimalId: record.mateAnimalId,
                            litterId: record.litterId,
                            id: record.id
                        });
                    });
                }
                return Array.isArray(parsed) ? parsed : [];
            } catch { 
                return []; 
            }
        }
        return [];
    });
    const [newBreedingRecord, setNewBreedingRecord] = useState({
        breedingMethod: 'Unknown',
        breedingConditionAtTime: null,
        matingDate: '',
        mate: '',
        mateAnimalId: null,
        outcome: 'Unknown',
        birthEventDate: '',
        birthMethod: null,
        litterSizeBorn: null,
        litterSizeWeaned: null,
        stillbornCount: null,
        maleCount: null,
        femaleCount: null,
        unknownCount: null,
        litterId: null,
        notes: ''
    });
    const [mateInfo, setMateInfo] = useState(null);
    
    // Modal states for create/link litter
    const [showCreateLitterModal, setShowCreateLitterModal] = useState(false);
    const [showLinkLitterModal, setShowLinkLitterModal] = useState(false);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [conflictData, setConflictData] = useState(null);
    const [showLitterSyncModal, setShowLitterSyncModal] = useState(false);
    const [litterSyncConflictData, setLitterSyncConflictData] = useState(null);
    const [breedingRecordForLitter, setBreedingRecordForLitter] = useState(null);
    const [existingLitters, setExistingLitters] = useState([]);
    const [litterSearchLoading, setLitterSearchLoading] = useState(false);
    const [expandedBreedingRecords, setExpandedBreedingRecords] = useState({});
    const [breedingRecordOffspring, setBreedingRecordOffspring] = useState({}); // Store offspring by record ID
    const [breedingRecordLitters, setBreedingRecordLitters] = useState({}); // Store litter data by record ID
    
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
    const pedigreeRef = useRef({ father: (animalToEdit && (animalToEdit.fatherId_public || animalToEdit.sireId_public)) || null, mother: (animalToEdit && (animalToEdit.motherId_public || animalToEdit.damId_public)) || null });
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
    const [collapsedHealthSections, setCollapsedHealthSections] = useState({});
    // Manual Pedigree (Beta) ? Tab 15
    const [mpEditForm, setMpEditForm] = useState(() => animalToEdit?.manualPedigree || {});
    const [mpCTCOpenSlot, setMpCTCOpenSlot] = useState(null);
    const [mpSlotUploading, setMpSlotUploading] = useState({});
    const mpAutoFetchedRef = useRef(false);

    // Auto-fill all generations when Beta Pedigree tab is first opened in edit.
    // Refreshes existing CTC-linked slots, backfills sire/dam from lineage fields,
    // and recursively walks up the tree to fill grandparents & great-grandparents.
    useEffect(() => {
        if (activeTab !== 5 || mpAutoFetchedRef.current || !authToken) return;
        mpAutoFetchedRef.current = true;

        const pedigree = animalToEdit?.manualPedigree || {};

        const MP_SLOT_CHILDREN = {
            sire:    { father: 'sireSire',     mother: 'sireDam'     },
            dam:     { father: 'damSire',      mother: 'damDam'      },
            sireSire:{ father: 'sireSireSire', mother: 'sireSireDam' },
            sireDam: { father: 'sireDamSire',  mother: 'sireDamDam'  },
            damSire: { father: 'damSireSire',  mother: 'damSireDam'  },
            damDam:  { father: 'damDamSire',   mother: 'damDamDam'   },
        };

        const toSlot = (a, notes = '') => {
            const variety = ['color','coatPattern','coat','earset','phenotype','morph','markings'].map(f => a[f]).filter(Boolean).join(' ');
            return { mode: 'ctc', ctcId: a.id_public, prefix: a.prefix || '', name: a.name || '', suffix: a.suffix || '', variety, genCode: a.geneticCode || '', birthDate: a.birthDate ? String(a.birthDate).slice(0,10) : '', breederName: a.breederName || a.manualBreederName || '', gender: a.gender || '', imageUrl: a.imageUrl || a.photoUrl || '', notes };
        };

        const fetchAnimal = (ctcId) =>
            axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(ctcId)}`, { headers: { Authorization: `Bearer ${authToken}` } })
                .then(r => r.data || null).catch(() => null);

        // Seed queue: existing CTC slots + sire/dam from lineage fields if slots empty
        const updates = {};
        const queue = []; // { slotKey, ctcId, notes }
        const queued = new Set();

        const enqueue = (slotKey, ctcId, notes = '') => {
            if (!ctcId || queued.has(slotKey)) return;
            queued.add(slotKey);
            queue.push({ slotKey, ctcId, notes });
        };

        const allSlots = ['sire','dam','sireSire','sireDam','damSire','damDam',
            'sireSireSire','sireSireDam','sireDamSire','sireDamDam',
            'damSireSire','damSireDam','damDamSire','damDamDam'];

        // Existing CTC-linked slots
        allSlots.forEach(k => { if (pedigree[k]?.mode === 'ctc' && pedigree[k]?.ctcId) enqueue(k, pedigree[k].ctcId, pedigree[k].notes || ''); });

        // Backfill sire/dam from lineage fields if not already in pedigree
        const sireId = animalToEdit?.fatherId_public || animalToEdit?.sireId_public;
        const damId  = animalToEdit?.motherId_public || animalToEdit?.damId_public;
        if (sireId && !pedigree.sire?.ctcId) enqueue('sire', sireId);
        if (damId  && !pedigree.dam?.ctcId)  enqueue('dam',  damId);

        if (!queue.length) return;

        // Process queue iteratively, expanding children as each ancestor is fetched
        const processQueue = async () => {
            while (queue.length) {
                const batch = queue.splice(0, queue.length);
                await Promise.all(batch.map(async ({ slotKey, ctcId, notes }) => {
                    const a = await fetchAnimal(ctcId);
                    if (!a) return;
                    updates[slotKey] = toSlot(a, notes);
                    // Enqueue children if this slot has children defined
                    const children = MP_SLOT_CHILDREN[slotKey];
                    if (!children) return;
                    const fId = a.fatherId_public || a.sireId_public;
                    const mId = a.motherId_public || a.damId_public;
                    if (fId && !pedigree[children.father]?.ctcId) enqueue(children.father, fId);
                    if (mId && !pedigree[children.mother]?.ctcId) enqueue(children.mother, mId);
                }));
            }
            if (Object.keys(updates).length) setMpEditForm(f => ({ ...f, ...updates }));
        };

        processQueue();
    }, [activeTab, authToken, API_BASE_URL, animalToEdit?.manualPedigree]);
    // Gallery state (edit-only; changes are applied immediately via API)
    const [editGalleryImages, setEditGalleryImages] = useState(animalToEdit?.extraImages || []);
    const [galleryUploading, setGalleryUploading] = useState(false);
    const [galleryUploadError, setGalleryUploadError] = useState(null);
    const [movePhotoPrompt, setMovePhotoPrompt] = useState(null); // URL of current profile photo when user selects a new one
    const galleryEditFileRef = useRef(null); // collapse health tab sections

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        console.log('[AnimalForm] handleChange called:', { name, value, type, checked });
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };
            
            console.log('[AnimalForm] Updated formData:', updated);
            
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
                setFormData(prev => ({ ...prev, breederId_public: id, manualBreederName: '' }));
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
        setFormData(prev => ({ ...prev, breederId_public: null, manualBreederName: '' }));
        setBreederInfo(null);
    };

    // Handle mate selection from modal
    const handleSelectMate = async (idOrAnimal) => {
        const id = idOrAnimal && typeof idOrAnimal === 'object' ? idOrAnimal.id_public : idOrAnimal;
        
        // Set mate animal ID and clear manual text
        setNewBreedingRecord(prev => ({ 
            ...prev, 
            mateAnimalId: id, 
            mate: '' 
        }));
        
        // Store animal info
        if (idOrAnimal && typeof idOrAnimal === 'object') {
            const a = idOrAnimal;
            const info = { 
                id_public: a.id_public, 
                prefix: a.prefix || '', 
                suffix: a.suffix || '', 
                name: a.name || '', 
                backendId: a._id || a.id_backend || null 
            };
            setMateInfo(info);
        } else if (id) {
            // Fetch animal summary
            try {
                const info = await fetchAnimalSummary(id);
                setMateInfo(info);
            } catch (err) {
                console.warn('Failed to fetch mate summary', err);
            }
        }
        
        setModalTarget(null);
    };

    // Clear mate selection
    const clearMateSelection = () => {
        setNewBreedingRecord(prev => ({ ...prev, mateAnimalId: null, mate: '' }));
        setMateInfo(null);
    };

    // When editing an existing animal, initialize parent and breeder info
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (animalToEdit) {
                const fId = animalToEdit.fatherId_public || animalToEdit.sireId_public || null;
                const mId = animalToEdit.motherId_public || animalToEdit.damId_public || null;
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

    useEffect(() => {
        const handleAnimalUpdated = (e) => {
            const updated = e.detail;
            if (!updated?.id_public) return;

            const fatherId = formData.fatherId_public;
            const motherId = formData.motherId_public;

            if (fatherId && updated.id_public === fatherId) {
                setFatherInfo(prev => prev ? { ...prev, ...updated } : prev);
            }

            if (motherId && updated.id_public === motherId) {
                setMotherInfo(prev => prev ? { ...prev, ...updated } : prev);
            }
        };

        window.addEventListener('animal-updated', handleAnimalUpdated);
        return () => window.removeEventListener('animal-updated', handleAnimalUpdated);
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

    // Enhanced breeding record creation with bidirectional sync
    const addBreedingRecord = async () => {
        // All fields are now optional - no validation required
        const record = {
            id: Date.now().toString(),
            recordDate: new Date().toISOString(),
            breedingMethod: newBreedingRecord.breedingMethod,
            breedingConditionAtTime: newBreedingRecord.breedingConditionAtTime || null,
            matingDate: newBreedingRecord.matingDate,
            mate: newBreedingRecord.mate || (mateInfo ? `${mateInfo.prefix || ''} ${mateInfo.name}`.trim() : null),
            mateAnimalId: newBreedingRecord.mateAnimalId || null,
            outcome: newBreedingRecord.outcome || null,
            birthEventDate: newBreedingRecord.birthEventDate || null,
            birthMethod: newBreedingRecord.birthMethod || null,
            litterSizeBorn: newBreedingRecord.litterSizeBorn !== null ? parseInt(newBreedingRecord.litterSizeBorn) : null,
            litterSizeWeaned: newBreedingRecord.litterSizeWeaned !== null ? parseInt(newBreedingRecord.litterSizeWeaned) : null,
            stillbornCount: newBreedingRecord.stillbornCount !== null ? parseInt(newBreedingRecord.stillbornCount) : null,
            maleCount: newBreedingRecord.maleCount !== null && newBreedingRecord.maleCount !== '' ? parseInt(newBreedingRecord.maleCount) : null,
            femaleCount: newBreedingRecord.femaleCount !== null && newBreedingRecord.femaleCount !== '' ? parseInt(newBreedingRecord.femaleCount) : null,
            unknownCount: newBreedingRecord.unknownCount !== null && newBreedingRecord.unknownCount !== '' ? parseInt(newBreedingRecord.unknownCount) : null,
            litterId: newBreedingRecord.litterId || null,
            notes: newBreedingRecord.notes || ''
        };
        
        console.log('[DEBUG] Adding new breeding record with mate data:', {
            mate: record.mate,
            mateAnimalId: record.mateAnimalId,
            mateInfo: mateInfo,
            newBreedingRecord_mate: newBreedingRecord.mate,
            newBreedingRecord_mateAnimalId: newBreedingRecord.mateAnimalId
        });
        
        // Validate offspring counts if provided
        const countValidation = validateOffspringCounts(record);
        if (!countValidation.isValid) {
            showModalMessage('Count Validation Error', `Offspring counts don't add up: ${countValidation.message}`);
            return;
        }
        
        setBreedingRecords([...breedingRecords, record]);
        
        // Create bidirectional breeding record if mate is from database
        if (record.mateAnimalId && mateInfo) {
            try {
                await createBidirectionalBreedingRecord(record, mateInfo);
                showModalMessage('Success', `Breeding record created for both ${formData.name || animalToEdit?.name} and ${mateInfo.name}`);
            } catch (error) {
                console.error('Error creating bidirectional record:', error);
                showModalMessage('Notice', `Breeding record created for ${formData.name || animalToEdit?.name}. Could not create record for mate: ${error.message}`);
            }
        }
        
        // Reset form
        setNewBreedingRecord({
            breedingMethod: 'Unknown',
            breedingConditionAtTime: null,
            matingDate: '',
            mate: '',
            mateAnimalId: null,
            outcome: 'Unknown',
            birthEventDate: '',
            birthMethod: null,
            litterSizeBorn: null,
            litterSizeWeaned: null,
            stillbornCount: null,
            maleCount: null,
            femaleCount: null,
            unknownCount: null,
            litterId: null,
            notes: ''
        });
        setMateInfo(null);
    };
    
    // Validate offspring counts across all methods
    const validateOffspringCounts = (record) => {
        const born = record.litterSizeBorn || 0;
        const weaned = record.litterSizeWeaned || 0;
        const stillborn = record.stillbornCount || 0;
        
        // Check if any counts are provided
        if (born === 0 && weaned === 0 && stillborn === 0) {
            return { isValid: true }; // No counts provided is valid
        }
        
        // Stillborn + Weaned should not exceed Total Born
        if ((stillborn + weaned) > born && born > 0) {
            return { 
                isValid: false, 
                message: `Stillborn (${stillborn}) + Weaned (${weaned}) = ${stillborn + weaned} exceeds Total Born (${born})` 
            };
        }
        
        // Weaned cannot exceed born
        if (weaned > born && born > 0) {
            return { 
                isValid: false, 
                message: `Weaned (${weaned}) cannot exceed Total Born (${born})` 
            };
        }
        
        // Stillborn cannot exceed born
        if (stillborn > born && born > 0) {
            return { 
                isValid: false, 
                message: `Stillborn (${stillborn}) cannot exceed Total Born (${born})` 
            };
        }
        
        return { isValid: true };
    };
    
    // Create bidirectional breeding record on mate's account
    const createBidirectionalBreedingRecord = async (originalRecord, mateInfo) => {
        if (!authToken || !mateInfo.backendId) {
            console.warn('Cannot create bidirectional record: missing auth or mate backend ID');
            return;
        }
        
        // Get the mate's current data
        const mateResponse = await axios.get(`${API_BASE_URL}/animals/${mateInfo.backendId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        const mateAnimal = mateResponse.data;
        
        // Create reciprocal breeding record 
        const reciprocalRecord = {
            id: (Date.now() + 1).toString(), // Slightly different ID
            recordDate: originalRecord.recordDate,
            breedingMethod: originalRecord.breedingMethod,
            breedingConditionAtTime: originalRecord.breedingConditionAtTime,
            matingDate: originalRecord.matingDate,
            mate: `${formData.prefix || ''} ${formData.name || animalToEdit?.name || ''}`.trim(),
            mateAnimalId: formData.id_public || animalToEdit?.id_public,
            outcome: originalRecord.outcome,
            birthEventDate: originalRecord.birthEventDate,
            birthMethod: originalRecord.birthMethod,
            litterSizeBorn: originalRecord.litterSizeBorn,
            litterSizeWeaned: originalRecord.litterSizeWeaned,
            stillbornCount: originalRecord.stillbornCount,
            maleCount: originalRecord.maleCount ?? null,
            femaleCount: originalRecord.femaleCount ?? null,
            unknownCount: originalRecord.unknownCount ?? null,
            litterId: originalRecord.litterId,
            notes: `[Auto-generated] ${originalRecord.notes}`.trim()
        };
        
        // Add to mate's breeding records
        const updatedMateData = {
            ...mateAnimal,
            breedingRecords: [...(mateAnimal.breedingRecords || []), reciprocalRecord]
        };
        
        // Save updated mate data
        await axios.put(`${API_BASE_URL}/animals/${mateInfo.backendId}`, updatedMateData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        window.dispatchEvent(new CustomEvent('animal-updated', { detail: updatedMateData }));
        
        console.log('[BIDIRECTIONAL] Created reciprocal breeding record on mate account');
    };
    
    // Handler for creating a litter from breeding record
    const handleCreateLitterFromBreeding = async (litterData) => {
        try {
            setLoading(true);
            
            // Prepare litter creation payload with proper parent handling
            const currentAnimal = formData.id_public || animalToEdit?.id_public;
            const breedingRecord = breedingRecordForLitter;
            
            const payload = {
                ...litterData,
                species: formData.species,
                // Link breeding record
                breedingRecordId: breedingRecord?.id,
                // Set parents based on current animal's gender and breeding record mate
                ...(formData.gender === 'Male' || formData.gender === 'Intersex' ? {
                    sireId_public: currentAnimal,
                    // Set dam from mate (either ID or manual name)
                    ...(breedingRecord?.mateAnimalId ? 
                        { damId_public: breedingRecord.mateAnimalId } : 
                        { manualDamName: breedingRecord?.mate || 'Unknown' }
                    )
                } : {
                    damId_public: currentAnimal,
                    // Set sire from mate (either ID or manual name)
                    ...(breedingRecord?.mateAnimalId ? 
                        { sireId_public: breedingRecord.mateAnimalId } : 
                        { manualSireName: breedingRecord?.mate || 'Unknown' }
                    )
                })
            };
            
            console.log('[CREATE LITTER] Payload:', payload);
            
            // Create the litter via API
            const response = await axios.post(`${API_BASE_URL}/litters`, payload, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            const newLitter = response.data;
            console.log('[CREATE LITTER] Created litter:', newLitter);
            
            // Update the breeding record with the litter ID
            if (breedingRecordForLitter && newLitter.litter_id_public) {
                const updatedRecords = breedingRecords.map(r => 
                    r.id === breedingRecordForLitter.id 
                        ? { ...r, litterId: newLitter.litter_id_public }
                        : r
                );
                setBreedingRecords(updatedRecords);
                
                showModalMessage('Success', `Litter ${newLitter.litter_id_public} created and linked!`);
            }
            
            setShowCreateLitterModal(false);
            setBreedingRecordForLitter(null);
        } catch (error) {
            console.error('Error creating litter:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to create litter');
        } finally {
            setLoading(false);
        }
    };
    
    // Handler for linking existing litter to breeding record
    const handleLinkLitterToBreeding = (litter) => {
        if (breedingRecordForLitter) {
            const updatedRecords = breedingRecords.map(r => 
                r.id === breedingRecordForLitter.id 
                    ? { ...r, litterId: litter.litter_id_public }
                    : r
            );
            setBreedingRecords(updatedRecords);
            
            showModalMessage('Success', `Breeding record linked to litter ${litter.litter_id_public}!`);
            
            setShowLinkLitterModal(false);
            setBreedingRecordForLitter(null);
        } else {
            // Check for conflicts between breeding record and litter data
            const conflicts = [];
            
            // Date conflicts
            if (newBreedingRecord.birthEventDate && litter.birthDate && 
                newBreedingRecord.birthEventDate !== litter.birthDate) {
                conflicts.push({
                    field: 'birthEventDate',
                    label: 'Birth Date',
                    breedingValue: newBreedingRecord.birthEventDate,
                    litterValue: litter.birthDate
                });
            }
            
            // Number conflicts
            if (newBreedingRecord.litterSizeBorn && litter.numberBorn &&
                parseInt(newBreedingRecord.litterSizeBorn) !== parseInt(litter.numberBorn)) {
                conflicts.push({
                    field: 'litterSizeBorn',
                    label: 'Number Born',
                    breedingValue: newBreedingRecord.litterSizeBorn,
                    litterValue: litter.numberBorn
                });
            }
            
            if (newBreedingRecord.stillbornCount && litter.stillborn &&
                parseInt(newBreedingRecord.stillbornCount) !== parseInt(litter.stillborn)) {
                conflicts.push({
                    field: 'stillbornCount',
                    label: 'Stillborn Count',
                    breedingValue: newBreedingRecord.stillbornCount,
                    litterValue: litter.stillborn
                });
            }
            
            if (newBreedingRecord.litterSizeWeaned && litter.numberWeaned &&
                parseInt(newBreedingRecord.litterSizeWeaned) !== parseInt(litter.numberWeaned)) {
                conflicts.push({
                    field: 'litterSizeWeaned',
                    label: 'Number Weaned',
                    breedingValue: newBreedingRecord.litterSizeWeaned,
                    litterValue: litter.numberWeaned
                });
            }
            
            if (newBreedingRecord.matingDate && (litter.matingDate || litter.pairingDate) &&
                newBreedingRecord.matingDate !== (litter.matingDate || litter.pairingDate)) {
                conflicts.push({
                    field: 'matingDate',
                    label: 'Mating Date',
                    breedingValue: newBreedingRecord.matingDate,
                    litterValue: litter.matingDate || litter.pairingDate
                });
            }
            
            if (conflicts.length > 0) {
                // Show conflict resolution modal
                setConflictData({ litter, conflicts });
                setShowConflictModal(true);
            } else {
                // No conflicts - proceed with auto-fill
                performLitterLink(litter);
            }
        }
    };
    
    // Perform the litter link with auto-fill
    const performLitterLink = (litter) => {
        const updates = { litterId: litter.litter_id_public };
        
        // Auto-fill only if field is empty
        if (!newBreedingRecord.birthEventDate && litter.birthDate) {
            updates.birthEventDate = litter.birthDate;
        }
        if (!newBreedingRecord.litterSizeBorn && litter.numberBorn) {
            updates.litterSizeBorn = litter.numberBorn;
        }
        if (!newBreedingRecord.stillbornCount && litter.stillborn) {
            updates.stillbornCount = litter.stillborn;
        }
        if (!newBreedingRecord.litterSizeWeaned && litter.numberWeaned) {
            updates.litterSizeWeaned = litter.numberWeaned;
        }
        if (!newBreedingRecord.matingDate && (litter.matingDate || litter.pairingDate)) {
            updates.matingDate = litter.matingDate || litter.pairingDate;
        }
        if (!newBreedingRecord.maleCount && litter.maleCount) {
            updates.maleCount = litter.maleCount;
        }
        if (!newBreedingRecord.femaleCount && litter.femaleCount) {
            updates.femaleCount = litter.femaleCount;
        }
        if (!newBreedingRecord.unknownCount && litter.unknownCount) {
            updates.unknownCount = litter.unknownCount;
        }
        // Recalculate litterSizeBorn from gender counts if any were just set
        const m = updates.maleCount ?? newBreedingRecord.maleCount ?? 0;
        const f = updates.femaleCount ?? newBreedingRecord.femaleCount ?? 0;
        const u = updates.unknownCount ?? newBreedingRecord.unknownCount ?? 0;
        if ((m + f + u) > 0) updates.litterSizeBorn = m + f + u;
        
        setNewBreedingRecord(prev => ({ ...prev, ...updates }));
        setShowLinkLitterModal(false);
        
        showModalMessage('Success', `Linked to litter ${litter.litter_id_public} with auto-filled data!`);
    };
    
    // Handle conflict resolution
    const handleConflictResolution = (resolutions) => {
        const litter = conflictData.litter;
        const updates = { litterId: litter.litter_id_public };
        
        // Apply conflict resolutions
        resolutions.forEach(resolution => {
            const conflict = conflictData.conflicts.find(c => c.field === resolution.field);
            if (conflict) {
                if (resolution.choice === 'litter') {
                    updates[resolution.field] = conflict.litterValue;
                }
                // If choice is 'breeding', keep existing value (don't update)
            }
        });
        
        // Auto-fill empty fields (no conflicts)
        if (!newBreedingRecord.birthEventDate && litter.birthDate && !updates.birthEventDate) {
            updates.birthEventDate = litter.birthDate;
        }
        if (!newBreedingRecord.litterSizeBorn && litter.numberBorn && !updates.litterSizeBorn) {
            updates.litterSizeBorn = litter.numberBorn;
        }
        if (!newBreedingRecord.stillbornCount && litter.stillborn && !updates.stillbornCount) {
            updates.stillbornCount = litter.stillborn;
        }
        if (!newBreedingRecord.litterSizeWeaned && litter.numberWeaned && !updates.litterSizeWeaned) {
            updates.litterSizeWeaned = litter.numberWeaned;
        }
        if (!newBreedingRecord.matingDate && (litter.matingDate || litter.pairingDate) && !updates.matingDate) {
            updates.matingDate = litter.matingDate || litter.pairingDate;
        }
        if (!newBreedingRecord.maleCount && litter.maleCount && !updates.maleCount) {
            updates.maleCount = litter.maleCount;
        }
        if (!newBreedingRecord.femaleCount && litter.femaleCount && !updates.femaleCount) {
            updates.femaleCount = litter.femaleCount;
        }
        if (!newBreedingRecord.unknownCount && litter.unknownCount && !updates.unknownCount) {
            updates.unknownCount = litter.unknownCount;
        }
        // Recalculate litterSizeBorn from gender counts if any were just set
        const m = updates.maleCount ?? newBreedingRecord.maleCount ?? 0;
        const f = updates.femaleCount ?? newBreedingRecord.femaleCount ?? 0;
        const u = updates.unknownCount ?? newBreedingRecord.unknownCount ?? 0;
        if ((m + f + u) > 0) updates.litterSizeBorn = m + f + u;
        
        setNewBreedingRecord(prev => ({ ...prev, ...updates }));
        setShowLinkLitterModal(false);
        setShowConflictModal(false);
        setConflictData(null);
        
        showModalMessage('Success', `Linked to litter ${litter.litter_id_public} with resolved conflicts!`);
    };

    // Handle conflict resolution from the litter-sync modal (fires after animal save)
    const handleLitterSyncResolve = async (choices) => {
        if (!litterSyncConflictData) return;
        setShowLitterSyncModal(false);
        setLitterSyncConflictData(null);
        try {
            let updatedBreedingRecords = [...breedingRecords];
            let animalNeedsResave = false;

            for (const item of litterSyncConflictData.items) {
                const { litter, conflicts } = item;
                const litterUpdates = {};
                const recordPatch = {};

                for (const c of conflicts) {
                    const key = `${litter._id}__${c.field}`;
                    const choice = choices[key] ?? 'record';
                    if (choice === 'record') {
                        // Record wins ? push record's value to the litter
                        litterUpdates[c.lwk] = c.recordValue;
                        if (c.lwkAlso) litterUpdates[c.lwkAlso] = c.recordValue;
                    } else {
                        // Litter wins ? pull litter's value into the breeding record
                        recordPatch[c.field] = c.litterValue;
                        // Also set the litter key in case it wasn't already there
                        litterUpdates[c.lwk] = c.litterValue;
                        if (c.lwkAlso) litterUpdates[c.lwkAlso] = c.litterValue;
                        animalNeedsResave = true;
                    }
                }

                // Always write the resolved values to the litter
                if (Object.keys(litterUpdates).length > 0) {
                    await axios.put(`${API_BASE_URL}/litters/${litter._id}`, litterUpdates, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                }

                // Apply litter-wins patches to our local breedingRecords array
                if (Object.keys(recordPatch).length > 0) {
                    updatedBreedingRecords = updatedBreedingRecords.map(r =>
                        r.litterId === item.record.litterId ? { ...r, ...recordPatch } : r
                    );
                }
            }

            // If any litter values beat the breeding record, re-save the animal
            // so the updated breedingRecords are persisted server-side too.
            if (animalNeedsResave && animalToEdit?._id) {
                setBreedingRecords(updatedBreedingRecords);
                await axios.put(
                    `${API_BASE_URL}/animals/${animalToEdit._id}`,
                    { breedingRecords: updatedBreedingRecords },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                console.log('[LITTER SYNC] Re-saved animal breedingRecords after litter-wins resolution.');
            }

            showModalMessage('Saved', 'Conflicts resolved ? data saved to both breeding record and litter card.');
        } catch (err) {
            console.error('[LITTER SYNC] Error during conflict resolution:', err);
            showModalMessage('Error', 'Failed to save resolved values. Please try again.');
        }
    };
    
    // Fetch existing litters for linking (filtered by species and animal as sire/dam)
    const fetchLittersForLinking = async () => {
        try {
            setLitterSearchLoading(true);
            
            // Fetch all litters for current species
            const response = await axios.get(
                `${API_BASE_URL}/litters?species=${encodeURIComponent(formData.species)}`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            let filtered = Array.isArray(response.data) ? response.data : [];
            
            // Filter: current animal as sire/dam/other parent
            // Only show litters that match current animal's gender role
            const animalPublicId = formData.id_public || animalToEdit?.id_public;
            
            if (formData.gender === 'Male' || (formData.gender === 'Intersex')) {
                // Can be a sire - filter litters where this animal is sire or unknown sire
                filtered = filtered.filter(litter => 
                    !litter.sireId_public || litter.sireId_public === animalPublicId
                );
            } else if (formData.gender === 'Female' || (formData.gender === 'Intersex')) {
                // Can be a dam - filter litters where this animal is dam or unknown dam
                filtered = filtered.filter(litter => 
                    !litter.damId_public || litter.damId_public === animalPublicId
                );
            }
            
            // If mate animal is selected (not manual text), filter by that parent too
            if (newBreedingRecord.mateAnimalId && mateInfo) {
                const mateId = newBreedingRecord.mateAnimalId;
                if (formData.gender === 'Male') {
                    // Current animal is sire, mate should be dam
                    filtered = filtered.filter(litter => 
                        !litter.damId_public || litter.damId_public === mateId
                    );
                } else if (formData.gender === 'Female') {
                    // Current animal is dam, mate should be sire
                    filtered = filtered.filter(litter => 
                        !litter.sireId_public || litter.sireId_public === mateId
                    );
                }
            }
            
            // Filter by birth date if entered
            if (newBreedingRecord.birthEventDate) {
                filtered = filtered.filter(litter => 
                    !litter.birthDate || litter.birthDate === newBreedingRecord.birthEventDate
                );
            }
            
            // Enrich litters with gender counts derived from linked offspring animals
            // REMOVED from link modal ? not needed for litter selection and causes slow double-fetch

            setExistingLitters(filtered);
        } catch (error) {
            console.error('Error fetching litters:', error);
            showModalMessage('Error', 'Failed to fetch litters');
        } finally {
            setLitterSearchLoading(false);
        }
    };
    
    // Trigger litter fetch when link modal is opened or filter criteria change
    useEffect(() => {
        if (showLinkLitterModal && formData.species) {
            fetchLittersForLinking();
        }
    }, [showLinkLitterModal, newBreedingRecord.mateAnimalId, newBreedingRecord.birthEventDate]);
    
    // Fetch offspring for a breeding record when expanded
    const fetchOffspringForBreedingRecord = async (recordId, litterId) => {
        if (!litterId) return;
        
        try {
            // Fetch the litter to get offspring IDs
            const litterResponse = await axios.get(
                `${API_BASE_URL}/litters`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            const litter = litterResponse.data.find(l => l.litter_id_public === litterId);
            if (!litter) {
                setBreedingRecordOffspring(prev => ({ ...prev, [recordId]: [] }));
                return;
            }
            
            // Store the litter data for display
            setBreedingRecordLitters(prev => ({ ...prev, [recordId]: litter }));
            
            if (!litter.offspringIds_public || litter.offspringIds_public.length === 0) {
                setBreedingRecordOffspring(prev => ({ ...prev, [recordId]: [] }));
                return;
            }
            
            // Fetch animals that match the offspring IDs
            const animalsResponse = await axios.get(
                `${API_BASE_URL}/animals`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            const offspring = animalsResponse.data.filter(a => 
                litter.offspringIds_public.includes(a.id_public)
            );
            
            setBreedingRecordOffspring(prev => ({ ...prev, [recordId]: offspring }));
        } catch (error) {
            console.error('Error fetching offspring for breeding record:', error);
            setBreedingRecordOffspring(prev => ({ ...prev, [recordId]: [] }));
        }
    };
    
    // Fetch offspring when a breeding record is expanded
    useEffect(() => {
        Object.entries(expandedBreedingRecords).forEach(([recordId, isExpanded]) => {
            if (isExpanded) {
                const record = breedingRecords.find(r => r.id === recordId);
                if (record && record.litterId && !breedingRecordOffspring[recordId]) {
                    fetchOffspringForBreedingRecord(recordId, record.litterId);
                }
            }
        });
    }, [expandedBreedingRecords, breedingRecords]);
    
    // Fetch litter data for all breeding records with litterId (for collapsed view display)
    useEffect(() => {
        const fetchAllLitterData = async () => {
            try {
                const litterResponse = await axios.get(
                    `${API_BASE_URL}/litters`,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                
                const litters = litterResponse.data;
                const litterMap = {};
                
                breedingRecords.forEach(record => {
                    if (record.litterId && !breedingRecordLitters[record.id]) {
                        const litter = litters.find(l => l.litter_id_public === record.litterId);
                        if (litter) {
                            litterMap[record.id] = litter;
                        }
                    }
                });
                
                if (Object.keys(litterMap).length > 0) {
                    setBreedingRecordLitters(prev => ({ ...prev, ...litterMap }));
                }
            } catch (error) {
                console.error('Error fetching litter data for breeding records:', error);
            }
        };
        
        if (breedingRecords.length > 0) {
            fetchAllLitterData();
        }
    }, [breedingRecords]);
    
    // Fetch offspring for all breeding records with litterId (on initial load when editing)
    useEffect(() => {
        const fetchAllOffspring = async () => {
            try {
                // Get all litters first
                const litterResponse = await axios.get(
                    `${API_BASE_URL}/litters`,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                
                // Get all animals
                const animalsResponse = await axios.get(
                    `${API_BASE_URL}/animals`,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                
                const litters = litterResponse.data;
                const allAnimals = animalsResponse.data;
                const offspringMap = {};
                
                breedingRecords.forEach(record => {
                    if (record.litterId && !breedingRecordOffspring[record.id]) {
                        const litter = litters.find(l => l.litter_id_public === record.litterId);
                        if (litter && litter.offspringIds_public && litter.offspringIds_public.length > 0) {
                            const offspring = allAnimals.filter(a => 
                                litter.offspringIds_public.includes(a.id_public)
                            );
                            if (offspring.length > 0) {
                                offspringMap[record.id] = offspring;
                            }
                        }
                    }
                });
                
                if (Object.keys(offspringMap).length > 0) {
                    setBreedingRecordOffspring(prev => ({ ...prev, ...offspringMap }));
                }
            } catch (error) {
                console.error('Error fetching offspring for breeding records:', error);
            }
        };
        
        if (breedingRecords.length > 0) {
            fetchAllOffspring();
        }
    }, [breedingRecords]);
    
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
        setLoading(false);

        // Validate all required fields regardless of which tab is currently active.
        // Tab switching does not submit the form so HTML5 `required` attributes are
        // bypassed ? we must enforce these explicitly before any network call.
        const missingFields = [];
        if (!formData.name?.trim())    missingFields.push('Name (Overview tab)');
        if (!formData.species?.trim()) missingFields.push('Species (Overview tab)');
        if (!formData.gender?.trim())  missingFields.push('Gender (Overview tab)');
        if (!formData.status?.trim())  missingFields.push('Status (Overview tab)');

        if (missingFields.length > 0) {
            showModalMessage(
                'Required Fields Missing',
                `Please fill in the following required fields before saving:\n\n· ${missingFields.join('\n· ')}`
            );
            return;
        }

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
            payloadToSave.manualPedigree = mpEditForm;
            
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
            
            // Include breeding records (clean up enum fields to prevent validation errors)
            payloadToSave.breedingRecords = breedingRecords.map(record => ({
                ...record,
                breedingMethod: record.breedingMethod || 'Unknown',
                outcome: record.outcome || 'Unknown',
                breedingConditionAtTime: record.breedingConditionAtTime || null,
                birthMethod: record.birthMethod || null,
                // Cache litter name from linked litter so view panels can show it without a separate fetch
                litterName: breedingRecordLitters[record.id]?.breedingPairCodeName || record.litterName || null,
            }));
            
            // Debug log for breeding records
            console.log('[DEBUG] Breeding records being saved:', payloadToSave.breedingRecords);
            payloadToSave.breedingRecords.forEach((record, index) => {
                console.log(`[DEBUG] Saving record ${index} mate data:`, {
                    mate: record.mate,
                    mateAnimalId: record.mateAnimalId,
                    litterId: record.litterId,
                    id: record.id
                });
            });
            
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
            
            // keeperHistory (Keeper History) is managed directly in formData by the user
            
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
            
            // Use formData parent values by default (these are always in sync)
            // pedigreeRef is only used for backend IDs, not for determining the final public IDs to save
            const finalFatherId = formData.fatherId_public;
            const finalMotherId = formData.motherId_public;
            
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
                manualBreederName: payloadToSave.manualBreederName,
                keeperName: payloadToSave.keeperName
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
                console.log('[APPEARANCE FIELDS] Checking payload:', {
                    size: payloadToSave.size,
                    phenotype: payloadToSave.phenotype,
                    morph: payloadToSave.morph,
                    markings: payloadToSave.markings,
                    eyeColor: payloadToSave.eyeColor,
                    nailColor: payloadToSave.nailColor,
                    weight: payloadToSave.weight,
                    length: payloadToSave.length
                });

                console.log('[SAVE] About to call onSave:', { method, url });
                const saveResponse = await onSave(method, url, payloadToSave);
                console.log('[SAVE] onSave completed successfully:', saveResponse?.status);

                // Sync breeding record fields ? linked litter documents (with conflict detection)
                const LITTER_SYNC_FIELDS = [
                    { rk: 'maleCount',             lrk: 'maleCount',             lwk: 'maleCount',             label: 'Males Born' },
                    { rk: 'femaleCount',            lrk: 'femaleCount',           lwk: 'femaleCount',           label: 'Females Born' },
                    { rk: 'unknownCount',           lrk: 'unknownCount',          lwk: 'unknownCount',          label: 'Unknown / Intersex' },
                    { rk: 'litterSizeBorn',         lrk: 'litterSizeBorn',  lrkFb: 'numberBorn',        lwk: 'litterSizeBorn', lwkAlso: 'numberBorn',   label: 'Total Born' },
                    { rk: 'stillbornCount',         lrk: 'stillbornCount',  lrkFb: 'stillborn',         lwk: 'stillbornCount', lwkAlso: 'stillborn',    label: 'Stillborn' },
                    { rk: 'litterSizeWeaned',       lrk: 'litterSizeWeaned', lrkFb: 'numberWeaned',     lwk: 'litterSizeWeaned', lwkAlso: 'numberWeaned', label: 'Weaned' },
                    { rk: 'breedingMethod',         lrk: 'breedingMethod',        lwk: 'breedingMethod',        label: 'Breeding Method' },
                    { rk: 'breedingConditionAtTime',lrk: 'breedingConditionAtTime', lrkFb: 'breedingCondition', lwk: 'breedingConditionAtTime', label: 'Breeding Condition' },
                    { rk: 'matingDate',             lrk: 'matingDate',     lrkFb: 'pairingDate',              lwk: 'matingDate',            label: 'Mating Date' },
                    { rk: 'outcome',                lrk: 'outcome',               lwk: 'outcome',               label: 'Outcome' },
                    { rk: 'birthEventDate',         lrk: 'birthDate',             lwk: 'birthDate',             label: 'Birth Date' },
                    { rk: 'birthMethod',            lrk: 'birthMethod',           lwk: 'birthMethod',           label: 'Birth Method' },
                ];
                const recordsWithLitters = breedingRecords.filter(r => r.litterId);
                if (recordsWithLitters.length > 0) {
                    try {
                        const littersRes = await axios.get(`${API_BASE_URL}/litters`, { headers: { Authorization: `Bearer ${authToken}` } });
                        const conflictItems = [];
                        for (const record of recordsWithLitters) {
                            const litter = littersRes.data.find(l => l.litter_id_public === record.litterId);
                            if (!litter) continue;
                            const conflicts = [];
                            const noConflictUpdates = {};
                            for (const f of LITTER_SYNC_FIELDS) {
                                const recVal = record[f.rk];
                                const litVal = litter[f.lrk] ?? (f.lrkFb ? litter[f.lrkFb] : undefined);
                                if (recVal == null || recVal === '') continue; // record has nothing to contribute
                                if (litVal != null && litVal !== '' && String(recVal) !== String(litVal)) {
                                    // Both sides have a value and they disagree ? conflict
                                    conflicts.push({ field: f.rk, label: f.label, lwk: f.lwk, lwkAlso: f.lwkAlso, recordValue: recVal, litterValue: litVal });
                                } else {
                                    // No conflict ? record value wins (or litter was empty)
                                    noConflictUpdates[f.lwk] = recVal;
                                    if (f.lwkAlso) noConflictUpdates[f.lwkAlso] = recVal;
                                }
                            }
                            // Always push no-conflict updates immediately
                            if (Object.keys(noConflictUpdates).length > 0) {
                                await axios.put(`${API_BASE_URL}/litters/${litter._id}`, noConflictUpdates, { headers: { Authorization: `Bearer ${authToken}` } });
                            }
                            if (conflicts.length > 0) {
                                conflictItems.push({ record, litter, conflicts });
                            }
                        }
                        if (conflictItems.length > 0) {
                            setLitterSyncConflictData({ items: conflictItems });
                            setShowLitterSyncModal(true);
                        }
                    } catch (syncErr) {
                        console.warn('[LITTER SYNC] Could not sync breeding record fields to litters:', syncErr);
                    }
                }
            } catch (saveErr) {
                // If we uploaded a file but the animal save failed, attempt cleanup to avoid orphan files.
                console.error('[SAVE] Error in onSave:', saveErr);
                if (uploadedFilename) {
                    try {
                        await axios.delete(`${API_BASE_URL}/upload/${uploadedFilename}`, { headers: { Authorization: `Bearer ${authToken}` } });
                    } catch (cleanupErr) {
                        console.warn('Failed to cleanup uploaded file after save failure:', cleanupErr?.response?.data || cleanupErr.message);
                    }
                }
                throw saveErr;
            }

            // For new animals, notify the list to reload. For edits, the list
            // is updated in-place by handleSaveAnimal - no full reload needed.
            if (!animalToEdit) {
                try { window.dispatchEvent(new Event('animals-changed')); } catch (e) { /* ignore */ }
            }

            console.log('[SAVE] Showing success message and closing form');
            // Only show success modal for new animals; edits open the view modal which makes it redundant
            if (!animalToEdit) {
                showModalMessage('Success', `Animal ${formData.name} successfully added!`);
            }
            onCancel(); 
        } catch (error) {
            console.error('Animal Save Error:', error.response?.data || error.message);
            console.error('Animal Save Error (full):', error);
            showModalMessage('Error', error.response?.data?.message || `Failed to ${animalToEdit ? 'update' : 'add'} animal.`);
        } finally {
            console.log('[SAVE] Setting loading to false');
            setLoading(false);
        }
    };
    
    const currentId = animalToEdit?.id_public;
    const requiredGender = modalTarget === 'father' ? 'Male' : 
                           modalTarget === 'mother' ? 'Female' : 
                           modalTarget === 'other-parent' ? ['Intersex', 'Unknown'] : 
                           modalTarget === 'mate' ? (
                               formData.gender === 'Male' ? ['Female', 'Intersex', 'Unknown'] :
                               formData.gender === 'Female' ? ['Male', 'Intersex', 'Unknown'] :
                               null // Intersex/Unknown can mate with any gender
                           ) : null;

    return (
        <div className="w-full max-w-6xl mx-auto bg-[#E1F2F5] p-6 rounded-xl shadow-2xl my-4">
            {/* --- Parent Search Modal --- */}
            {modalTarget && modalTarget !== 'breeder' && modalTarget !== 'other-parent' && modalTarget !== 'mate' && ( 
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

            {/* --- Mate Search Modal (for breeding records) --- */}
            {modalTarget === 'mate' && (
                <ParentSearchModal
                    title="Mate"
                    currentId={currentId}
                    onSelect={handleSelectMate}
                    onClose={() => setModalTarget(null)}
                    authToken={authToken}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={LoadingSpinner}
                    requiredGender={requiredGender}
                    birthDate={null}
                    species={formData.species}
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

            {/* --- Create Litter Modal --- */}
            {showCreateLitterModal && breedingRecordForLitter && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-96 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Create Litter</h3>
                            <button onClick={() => setShowCreateLitterModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const litterData = {
                                sireId_public: formData.get('sireId_public') || (formData.get('gender') === 'Male' ? animalToEdit?.id_public : null),
                                damId_public: formData.get('damId_public') || (formData.get('gender') === 'Female' ? animalToEdit?.id_public : null),
                                species: formData.get('species'),
                                birthDate: formData.get('birthDate') || breedingRecordForLitter.birthEventDate,
                                litterSizeBorn: parseInt(formData.get('litterSizeBorn')) || breedingRecordForLitter.litterSizeBorn || 0,
                                stillbornCount: parseInt(formData.get('stillbornCount')) || breedingRecordForLitter.stillbornCount || 0,
                                litterSizeWeaned: parseInt(formData.get('litterSizeWeaned')) || breedingRecordForLitter.litterSizeWeaned || 0,
                                // Legacy fields for backward compatibility
                                numberBorn: parseInt(formData.get('litterSizeBorn')) || breedingRecordForLitter.litterSizeBorn || 0,
                                stillborn: parseInt(formData.get('stillbornCount')) || breedingRecordForLitter.stillbornCount || 0,
                                numberWeaned: parseInt(formData.get('litterSizeWeaned')) || breedingRecordForLitter.litterSizeWeaned || 0,
                                // Enhanced breeding record fields
                                breedingMethod: formData.get('breedingMethod') || breedingRecordForLitter.breedingMethod || 'Unknown',
                                breedingConditionAtTime: formData.get('breedingConditionAtTime') || breedingRecordForLitter.breedingConditionAtTime || null,
                                matingDate: formData.get('matingDate') || breedingRecordForLitter.matingDate || '',
                                outcome: formData.get('outcome') || breedingRecordForLitter.outcome || 'Unknown',
                                birthMethod: formData.get('birthMethod') || breedingRecordForLitter.birthMethod || null,
                                notes: formData.get('notes') || breedingRecordForLitter.notes || ''
                            };
                            handleCreateLitterFromBreeding(litterData);
                        }} className="space-y-3">
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Sire ID</label>
                                <input type="text" name="sireId_public" defaultValue={formData.gender === 'Male' || formData.gender === 'Intersex' ? animalToEdit?.id_public : ''} 
                                    className="w-full text-xs p-2 border border-gray-300 rounded-md" placeholder="Leave blank if unknown" />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Dam ID</label>
                                <input type="text" name="damId_public" defaultValue={formData.gender === 'Female' || formData.gender === 'Intersex' ? animalToEdit?.id_public : ''} 
                                    className="w-full text-xs p-2 border border-gray-300 rounded-md" placeholder="Leave blank if unknown" />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Species</label>
                                <input type="text" name="species" value={formData.species} readOnly 
                                    className="w-full text-xs p-2 border border-gray-300 rounded-md bg-gray-100" />
                            </div>

                            {/* Enhanced breeding information */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Breeding Method</label>
                                    <select name="breedingMethod" defaultValue={breedingRecordForLitter.breedingMethod || 'Unknown'} 
                                        className="w-full text-xs p-2 border border-gray-300 rounded-md">
                                        <option value="Natural">Natural</option>
                                        <option value="AI">AI</option>
                                        <option value="Assisted">Assisted</option>
                                        <option value="Unknown">Unknown</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
                                    <select name="breedingConditionAtTime" defaultValue={breedingRecordForLitter.breedingConditionAtTime || ''} 
                                        className="w-full text-xs p-2 border border-gray-300 rounded-md">
                                        <option value="">Unknown</option>
                                        <option value="Good">Good</option>
                                        <option value="Okay">Okay</option>
                                        <option value="Poor">Poor</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Mating Dates</label>
                                <input type="text" name="matingDate" defaultValue={breedingRecordForLitter.matingDate || ''} 
                                    className="w-full text-xs p-2 border border-gray-300 rounded-md" placeholder="e.g., 2024-01-15" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Birth Method</label>
                                    <select name="birthMethod" defaultValue={breedingRecordForLitter.birthMethod || ''} 
                                        className="w-full text-xs p-2 border border-gray-300 rounded-md">
                                        <option value="">Unknown</option>
                                        <option value="Natural">Natural</option>
                                        <option value="C-Section">C-Section</option>
                                        <option value="Assisted">Assisted</option>
                                        <option value="Induced">Induced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Outcome</label>
                                    <select name="outcome" defaultValue={breedingRecordForLitter.outcome || 'Unknown'} 
                                        className="w-full text-xs p-2 border border-gray-300 rounded-md">
                                        <option value="Successful">Successful</option>
                                        <option value="Unsuccessful">Unsuccessful</option>
                                        <option value="Unknown">Unknown</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Birth Date</label>
                                <input type="date" name="birthDate" defaultValue={breedingRecordForLitter.birthEventDate ? new Date(breedingRecordForLitter.birthEventDate).toISOString().substring(0, 10) : ''} 
                                    className="w-full text-xs p-2 border border-gray-300 rounded-md" />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Born</label>
                                    <input type="number" name="litterSizeBorn" defaultValue={breedingRecordForLitter.litterSizeBorn || 0} min="0"
                                        className="w-full text-xs p-2 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Stillborn</label>
                                    <input type="number" name="stillbornCount" defaultValue={breedingRecordForLitter.stillbornCount || 0} min="0"
                                        className="w-full text-xs p-2 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Weaned</label>
                                    <input type="number" name="litterSizeWeaned" defaultValue={breedingRecordForLitter.litterSizeWeaned || 0} min="0"
                                        className="w-full text-xs p-2 border border-gray-300 rounded-md" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                                <textarea name="notes" defaultValue={breedingRecordForLitter.notes || ''} rows="2"
                                    className="w-full text-xs p-2 border border-gray-300 rounded-md" placeholder="Litter notes..." />
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition">
                                    {loading ? 'Creating...' : 'Create Litter'}
                                </button>
                                <button type="button" onClick={() => setShowCreateLitterModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Link Litter Modal --- */}
            {showLinkLitterModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-96 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Link Existing Litter</h3>
                            <button onClick={() => setShowLinkLitterModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        
                        {litterSearchLoading ? (
                            <div className="space-y-2">
                                {[0,1,2,3].map(i => (
                                    <div key={i} className="animate-pulse border border-gray-100 rounded-lg p-3">
                                        <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                                        <div className="h-3 w-40 bg-gray-100 rounded mb-1" />
                                        <div className="h-3 w-32 bg-gray-100 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : existingLitters.length === 0 ? (
                            <div className="text-center py-6 text-gray-600">
                                <p>No matching litters found for {formData.species}</p>
                                <p className="text-xs text-gray-500 mt-2">Try creating a new litter instead</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {existingLitters.map((litter) => (
                                    <button
                                        key={litter._id}
                                        type="button"
                                        onClick={() => handleLinkLitterToBreeding(litter)}
                                        className="w-full text-left p-3 border border-green-200 rounded-lg hover:bg-green-50 transition"
                                    >
                                        <div className="font-semibold text-green-700">{litter.litter_id_public}</div>
                                        <div className="text-xs text-gray-600 space-y-1">
                                            {litter.sireId_public && <div>Sire: {litter.sireId_public}</div>}
                                            {litter.damId_public && <div>Dam: {litter.damId_public}</div>}
                                            {litter.birthDate && <div>Born: {formatDate(litter.birthDate)}</div>}
                                            {litter.numberBorn && <div>{litter.numberBorn} born &bull; {litter.stillborn || 0} stillborn &bull; {litter.numberWeaned || 0} weaned</div>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        <button type="button" onClick={() => setShowLinkLitterModal(false)} className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* --- Conflict Resolution Modal --- */}
            {showConflictModal && conflictData && (
                <ConflictResolutionModal 
                    conflicts={conflictData.conflicts}
                    litter={conflictData.litter}
                    onResolve={handleConflictResolution}
                    onCancel={() => {
                        setShowConflictModal(false);
                        setConflictData(null);
                        setShowLinkLitterModal(false);
                    }}
                />
            )}

            {/* --- Litter Sync Conflict Modal (fires after animal save when values differ) --- */}
            {showLitterSyncModal && litterSyncConflictData && (
                <LitterSyncConflictModal
                    items={litterSyncConflictData.items}
                    onResolve={handleLitterSyncResolve}
                    onSkip={() => {
                        setShowLitterSyncModal(false);
                        setLitterSyncConflictData(null);
                    }}
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
                
                {/* Tab Navigation */}
                <div className="bg-[#E1F2F5] border-b border-gray-300 -mx-6 px-2 py-2">
                    <div className="flex flex-wrap gap-2">
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
                                onClick={() => setActiveTab(tab.id)}
                                data-tutorial-target={tab.id === 2 ? 'status-privacy-tab' : tab.id === 3 ? 'identification-tab' : tab.id === 4 ? 'appearance-tab' : tab.id === 5 ? 'beta-pedigree-tab' : tab.id === 6 ? 'family-tab' : tab.id === 7 ? 'fertility-tab' : tab.id === 8 ? 'health-tab' : tab.id === 9 ? 'care-tab' : tab.id === 10 ? 'behavior-tab' : tab.id === 11 ? 'notes-tab' : tab.id === 12 ? 'show-tab' : tab.id === 13 ? 'legal-tab' : tab.id === 14 ? 'end-of-life-tab' : tab.id === 15 ? 'gallery-tab' : undefined}
                                className={`flex-shrink-0 px-5 py-2 text-sm font-medium rounded border-2 transition-colors ${
                                    activeTab === tab.id 
                                        ? 'bg-[#F2E4E9] text-black border-gray-300' 
                                        : 'bg-white text-gray-600 hover:text-gray-800 border-gray-300'
                                }`}
                                title={tab.label}
                            >
                                {React.createElement(tab.icon, { size: 15, className: `inline-block align-middle flex-shrink-0 mr-1 ${tab.color || ''}` })}
                                {tab.label}
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
                                        // Offer to move the current saved photo to the gallery
                                        const oldPhotoUrl = animalToEdit?.imageUrl || animalToEdit?.photoUrl;
                                        if (oldPhotoUrl && editGalleryImages.length < 20) {
                                            setMovePhotoPrompt(oldPhotoUrl);
                                        }
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
                                    setMovePhotoPrompt(null);
                                }}
                                disabled={loading}
                                Trash2={Trash2}
                            />
                            {movePhotoPrompt && animalToEdit && (
                                <div className="mt-3 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
                                    <Images size={16} className="text-amber-600 shrink-0" />
                                    <span className="text-amber-800 flex-1">Move current profile photo to the gallery before replacing it?</span>
                                    <button
                                        type="button"
                                        disabled={galleryUploading}
                                        onClick={async () => {
                                            setGalleryUploading(true);
                                            try {
                                                const galRes = await axios.post(
                                                    `${API_BASE_URL}/animals/${animalToEdit.id_public}/gallery`,
                                                    { url: movePhotoPrompt },
                                                    { headers: { Authorization: `Bearer ${authToken}` } }
                                                );
                                                setEditGalleryImages(galRes.data.extraImages);
                                            } catch (err) {
                                                // silently ignore ? don't block the photo change
                                            } finally {
                                                setGalleryUploading(false);
                                                setMovePhotoPrompt(null);
                                            }
                                        }}
                                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-medium disabled:opacity-50 shrink-0"
                                    >
                                        {galleryUploading ? <Loader2 size={12} className="animate-spin" /> : 'Yes, move it'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMovePhotoPrompt(null)}
                                        className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-md text-xs font-medium shrink-0"
                                    >
                                        No
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Identity Fields */}
                        <div data-tutorial-target="animal-name-section" className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Identity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {!isFieldHidden('prefix') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Prefix</label>
                                    <input type="text" name="prefix" value={formData.prefix} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                )}
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name*</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                
                                {!isFieldHidden('suffix') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Suffix</label>
                                    <input type="text" name="suffix" value={formData.suffix} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender*</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} required 
                                        data-tutorial-target="animal-gender-select"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <DatePicker name="birthDate" value={formData.birthDate} onChange={handleChange} maxDate={new Date()}
                                        data-tutorial-target="animal-birthdate-input"
                                        className="mt-1 p-2" />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Status*</label>
                                    <select name="status" value={formData.status} onChange={handleChange} required 
                                        data-tutorial-target="animal-status-select"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        <option value="Pet">Pet - Personal animal, not for breeding/sale</option>
                                        <option value="Breeder">Breeder - Active breeding animal</option>
                                        <option value="Available">Available - For sale</option>
                                        <option value="Booked">Booked - Reserved/deposit received</option>
                                        <option value="Retired">Retired - No longer breeding</option>
                                        <option value="Deceased">Deceased - Animal has passed away</option>
                                        <option value="Rehomed">Rehomed - Sold/given to new home</option>
                                        <option value="Unknown">Unknown</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Status tracks the animal's current state. Use "For Sale" or "For Stud" options in the Privacy tab to control showcase visibility.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Tab 2: Ownership */}
                {activeTab === 2 && (
                    <div className="space-y-6">
                        {/* Ownership */}
                        <div data-tutorial-target="ownership-section" className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-1.5"><Star size={16} className="flex-shrink-0 text-gray-400" /> Breeder</h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Breeder (User)</label>
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

                                {!isFieldHidden('manualBreederName') && (
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Breeder (Manual Name)</label>
                                    <input 
                                        type="text" 
                                        name="manualBreederName" 
                                        value={formData.manualBreederName || ''} 
                                        onChange={(e) => {
                                            handleChange(e);
                                            if (e.target.value.trim() && formData.breederId_public) {
                                                clearBreederSelection();
                                            }
                                        }}
                                        placeholder="Enter breeder name (if not a registered user)"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Use this if the breeder is not a registered user on the platform.</p>
                                </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Current Owner */}
                        <div data-tutorial-target="current-owner-field" className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Keeper</h3>
                            {!isFieldHidden('isOwned') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition">
                                    <input type="checkbox" name="isOwned" checked={formData.isOwned} onChange={handleChange} 
                                        className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
                                    <span className="text-sm font-medium text-gray-700">Currently Owned by Me</span>
                                </label>
                            </div>
                            )}
                            {!isFieldHidden('keeperName') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>{getFieldLabel('keeperName', 'Keeper Name')}</label>
                                    <input 
                                        type="text" 
                                        name="keeperName" 
                                        value={formData.keeperName || ''} 
                                        onChange={handleChange}
                                        placeholder="Keeper name (person caring for this animal)"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Records keeper changes in keeper history.</p>
                                </div>
                            </div>
                            )}

                            {/* Co-ownership - Template controlled */}
                            {!isFieldHidden('coOwnership') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('coOwnership', 'Co-Ownership')}</label>
                                    <textarea name="coOwnership" value={formData.coOwnership || ''} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="Co-owner name, terms, breeding rights" />
                                </div>
                            )}
                        </div>

                        {/* Keeper History */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Keeper History</h3>

                            {/* Existing entries */}
                            {(formData.keeperHistory || []).length > 0 && (
                                <div className="space-y-2">
                                    {(formData.keeperHistory || []).map((entry, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {entry.country && <span className={`${getCountryFlag(entry.country)} inline-block h-4 w-6 flex-shrink-0`}></span>}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{entry.name || 'Anonymous'}</p>
                                                    {entry.userId_public && <p className="text-xs text-gray-400 font-mono">{entry.userId_public}</p>}
                                                    {entry.country && <p className="text-xs text-gray-500">{getCountryName(entry.country)}</p>}
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, keeperHistory: (prev.keeperHistory || []).filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0 ml-2">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add new entry */}
                            <div className="bg-white border border-dashed border-gray-300 rounded-lg p-3 space-y-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Add Entry</p>

                                {/* Mode toggle */}
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => { setKhMode('manual'); setKhSelectedUser(null); setKhUserSearch(''); setKhUserResults([]); }} className={`px-3 py-1 text-xs rounded-full border transition ${khMode === 'manual' ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'}`}>Manual Name</button>
                                    <button type="button" onClick={() => setKhMode('user')} className={`px-3 py-1 text-xs rounded-full border transition ${khMode === 'user' ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'}`}>Select User</button>
                                </div>

                                {khMode === 'manual' ? (
                                    <input type="text" value={khName} onChange={e => setKhName(e.target.value)} placeholder="Keeper name" className="block w-full p-2 border border-gray-300 rounded text-sm focus:ring-primary focus:border-primary" />
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input type="text" value={khUserSearch} onChange={e => { setKhUserSearch(e.target.value); setKhUserResults([]); setKhSelectedUser(null); setKhName(''); }} placeholder="Search by name or CTUID" className="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-primary focus:border-primary" />
                                            <button type="button" disabled={khSearching || !khUserSearch.trim()} onClick={async () => {
                                                if (!khUserSearch.trim()) return;
                                                setKhSearching(true);
                                                try {
                                                    const res = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(khUserSearch.trim())}&limit=10`);
                                                    setKhUserResults(res.data || []);
                                                } catch(e) {}
                                                setKhSearching(false);
                                            }} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm rounded disabled:opacity-40 transition flex-shrink-0">
                                                {khSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                                            </button>
                                        </div>
                                        {khUserResults.length > 0 && !khSelectedUser && (
                                            <div className="border border-gray-200 rounded divide-y divide-gray-100 max-h-44 overflow-y-auto bg-white shadow-sm">
                                                {khUserResults.map(u => {
                                                    const showP = u.showPersonalName ?? false;
                                                    const showB = u.showBreederName ?? false;
                                                    const dName = (showP && showB && u.personalName && u.breederName) ? `${u.personalName} (${u.breederName})` : (showB && u.breederName) ? u.breederName : (showP && u.personalName) ? u.personalName : 'Anonymous';
                                                    return (
                                                        <button key={u.id_public} type="button" onClick={() => { setKhSelectedUser(u); setKhName(dName); setKhCountry(u.country || ''); setKhUserResults([]); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2">
                                                            {u.profileImage && u.profileImage !== 'present' ? <img src={u.profileImage} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="" /> : <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><User size={12} className="text-gray-400" /></div>}
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium text-gray-800 truncate">{dName}</p>
                                                                <p className="text-xs text-gray-400 font-mono">{u.id_public}</p>
                                                            </div>
                                                            {u.country && <span className={`${getCountryFlag(u.country)} inline-block h-4 w-6 flex-shrink-0`}></span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {khSelectedUser && (
                                            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-2">
                                                {khSelectedUser.profileImage && khSelectedUser.profileImage !== 'present' ? <img src={khSelectedUser.profileImage} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" /> : <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><User size={14} className="text-gray-400" /></div>}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{khName}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{khSelectedUser.id_public}</p>
                                                </div>
                                                {khSelectedUser.country && <span className={`${getCountryFlag(khSelectedUser.country)} inline-block h-4 w-6 flex-shrink-0`}></span>}
                                                <button type="button" onClick={() => { setKhSelectedUser(null); setKhName(''); setKhUserSearch(''); setKhCountry(''); }} className="text-gray-400 hover:text-gray-600 p-0.5"><X size={13} /></button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Country dropdown */}
                                <select value={khCountry} onChange={e => setKhCountry(e.target.value)} className="block w-full p-2 border border-gray-300 rounded text-sm focus:ring-primary focus:border-primary">
                                    <option value="">Country (optional)</option>
                                    {[['US','United States'],['CA','Canada'],['GB','United Kingdom'],['AU','Australia'],['NZ','New Zealand'],['DE','Germany'],['FR','France'],['IT','Italy'],['ES','Spain'],['NL','Netherlands'],['SE','Sweden'],['NO','Norway'],['DK','Denmark'],['CH','Switzerland'],['BE','Belgium'],['AT','Austria'],['PL','Poland'],['CZ','Czech Republic'],['IE','Ireland'],['PT','Portugal'],['GR','Greece'],['RU','Russia'],['JP','Japan'],['KR','South Korea'],['CN','China'],['IN','India'],['BR','Brazil'],['MX','Mexico'],['ZA','South Africa'],['SG','Singapore'],['HK','Hong Kong'],['MY','Malaysia'],['TH','Thailand']].map(([code, name]) => (
                                        <option key={code} value={code}>{name}</option>
                                    ))}
                                </select>

                                <button type="button" disabled={!khName.trim()} onClick={() => {
                                    const entry = { name: khName.trim(), userId_public: khSelectedUser?.id_public || null, country: khCountry || null };
                                    setFormData(prev => ({ ...prev, keeperHistory: [...(prev.keeperHistory || []), entry] }));
                                    setKhName(''); setKhCountry(''); setKhSelectedUser(null); setKhUserSearch(''); setKhUserResults([]);
                                }} className="w-full py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded transition disabled:opacity-40 disabled:cursor-not-allowed">
                                    + Add Entry
                                </button>
                            </div>
                        </div>
                        
                        {/* Availability for Sale/Stud */}
                        <div data-tutorial-target="availability-for-sale-stud" className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2"><Tag size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Availability for Sale or Stud</h3>
                            <p className="text-xs text-gray-500">Enable "For Sale" or "For Stud" to make this animal visible in the public showcase (requires Public Profile enabled)</p>
                            
                            {/* For Sale Section */}
                            {!isFieldHidden('isForSale') && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" name="isForSale" checked={formData.isForSale} onChange={handleChange} 
                                        className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
                                    <span className="text-sm font-medium text-gray-700"><Tag size={14} className="inline-block align-middle mr-1" /> Available for Sale</span>
                                </div>
                                {formData.isForSale && (
                                    <div className="ml-7 flex gap-2">
                                        <select name="salePriceCurrency" value={formData.salePriceCurrency} onChange={handleChange} 
                                            className="block w-24 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="CAD">CAD (C$)</option>
                                            <option value="AUD">AUD (A$)</option>
                                            <option value="JPY">JPY (¥)</option>
                                            <option value="Negotiable">Negotiable</option>
                                        </select>
                                        <input type="number" name="salePriceAmount" value={formData.salePriceAmount || ''} onChange={handleChange} 
                                            className="block flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="Price amount" min="0" step="0.01" disabled={formData.salePriceCurrency === 'Negotiable'} />
                                    </div>
                                )}
                            </div>
                            )}
                            
                            {/* For Stud Section */}
                            {!isFieldHidden('availableForBreeding') && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" name="availableForBreeding" checked={formData.availableForBreeding} onChange={handleChange} 
                                        className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
                                    <span className="text-sm font-medium text-gray-700"><Egg size={14} className="inline-block align-middle mr-1" /> Available for Stud</span>
                                </div>
                                {formData.availableForBreeding && (
                                    <div className="ml-7 flex gap-2">
                                        <select name="studFeeCurrency" value={formData.studFeeCurrency || 'USD'} onChange={handleChange} 
                                            className="block w-24 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="CAD">CAD (C$)</option>
                                            <option value="AUD">AUD (A$)</option>
                                            <option value="JPY">JPY (¥)</option>
                                            <option value="Negotiable">Negotiable</option>
                                        </select>
                                        <input type="number" name="studFeeAmount" value={formData.studFeeAmount || ''} onChange={handleChange} 
                                            className="block flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="Fee amount" min="0" step="0.01" disabled={formData.studFeeCurrency === 'Negotiable'} />
                                    </div>
                                )}
                            </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Tab 4: Appearance */}
                {activeTab === 4 && (
                    <div className="space-y-6">
                        {/* Appearance */}
                        <div data-tutorial-target="appearance-section" className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2"><Sparkles size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Appearance</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {!isFieldHidden('color') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('color', 'Color')}</label>
                                    <input type="text" name="color" value={formData.color} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                )}
                                
                                {!isFieldHidden('coatPattern') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('coatPattern', 'Pattern')}</label>
                                    <input type="text" name="coatPattern" value={formData.coatPattern} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Solid, Hooded, Brindle" />
                                </div>
                                )}
                                
                                {!isFieldHidden('coat') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{getFieldLabel('coat', 'Coat Type')}</label>
                                        <input type="text" name="coat" value={formData.coat} onChange={handleChange} 
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="e.g., Short, Long, Rex" />
                                    </div>
                                )}
                                
                                {!isFieldHidden('earset') && (formData.species === 'Rat' || formData.species === 'Fancy Rat') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{getFieldLabel('earset', 'Earset')}</label>
                                        <input type="text" name="earset" value={formData.earset} onChange={handleChange} 
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="e.g., Standard, Dumbo" />
                                    </div>
                                )}
                                
                                {!isFieldHidden('phenotype') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('phenotype', 'Phenotype')}</label>
                                    <input type="text" name="phenotype" value={formData.phenotype || ''} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="Observable traits" />
                                </div>
                                )}
                                
                                {!isFieldHidden('morph') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('morph', 'Morph')}</label>
                                    <input type="text" name="morph" value={formData.morph || ''} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="Mutation/Morph" />
                                </div>
                                )}
                                
                                {!isFieldHidden('markings') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('markings', 'Markings')}</label>
                                    <input type="text" name="markings" value={formData.markings || ''} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="Body markings/patterns" />
                                </div>
                                )}
                                
                                {!isFieldHidden('eyeColor') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('eyeColor', 'Eye Color')}</label>
                                    <input type="text" name="eyeColor" value={formData.eyeColor || ''} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="Eye color" />
                                </div>
                                )}
                                
                                {!isFieldHidden('nailColor') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('nailColor', 'Nail Color')}</label>
                                    <input type="text" name="nailColor" value={formData.nailColor || ''} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="Nail/claw color" />
                                </div>
                                )}
                                
                                {!isFieldHidden('size') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('size', 'Size')}</label>
                                    <input type="text" name="size" value={formData.size || ''} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Standard, Dwarf" />
                                </div>
                                )}

                                {!isFieldHidden('carrierTraits') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('carrierTraits', 'Carrier Traits')}</label>
                                    <input type="text" name="carrierTraits" value={formData.carrierTraits || ''} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="Genetic traits carried" />
                                </div>
                                )}
                            </div>


                        </div>

                        {/* Genetic Code */}
                        {!isFieldHidden('geneticCode') && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4"><Dna size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> {getFieldLabel('geneticCode', 'Genetic Code')}</h3>
                                <GeneticCodeBuilder
                                    species={formData.species}
                                    gender={formData.gender}
                                    value={formData.geneticCode}
                                    onChange={(value) => setFormData(prev => ({ ...prev, geneticCode: value }))}
                                    onOpenCommunityForm={() => setShowCommunityGeneticsModal(true)}
                                />
                            </div>
                        )}

                        {/* Life Stage */}
                        {!isFieldHidden('lifeStage') && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><Sprout size={18} className="inline-block align-middle mr-2" /> Life Stage</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <select name="lifeStage" value={formData.lifeStage} onChange={handleChange} 
                                        data-tutorial-target="life-stage-select"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        <option value="">Select Life Stage</option>
                                        <option value="Newborn">Newborn</option>
                                        <option value="Juvenile">Juvenile</option>
                                        <option value="Adult">Adult</option>
                                        <option value="Senior">Senior</option>
                                        <option value="Unknown">Unknown</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        )}

                        {/* Measurements & Growth Tracking */}
                        <div data-tutorial-target="measurements-growth-section" className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Ruler size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Measurements & Growth Tracking</h3>
                                <p className="text-xs text-gray-600 mt-1">Current measurements & growth history</p>
                            </div>
                            
                            {/* Current Measurement Display */}
                            {growthRecords.length > 0 && (() => {
                                const sorted = [...growthRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
                                const mostRecentWeight = sorted[0];
                                const mostRecentLength = sorted.find(r => r.length);
                                const mostRecentHeight = sorted.find(r => r.height);
                                const mostRecentGirth = sorted.find(r => r.chestGirth);
                                
                                return (
                                    <div data-tutorial-target="current-measurements-growth-chart" className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Measurements</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                                            <div>
                                                <span className="text-xs text-gray-600">Weight:</span>
                                                <p className="font-medium">{mostRecentWeight.weight} {measurementUnits.weight}</p>
                                            </div>
                                            {mostRecentLength && mostRecentLength.length && (
                                                <div>
                                                    <span className="text-xs text-gray-600">Body Length:</span>
                                                    <p className="font-medium">{mostRecentLength.length} {measurementUnits.length}</p>
                                                </div>
                                            )}
                                            {mostRecentHeight && mostRecentHeight.height && (
                                                <div>
                                                    <span className="text-xs text-gray-600">Height:</span>
                                                    <p className="font-medium">{mostRecentHeight.height} {measurementUnits.length}</p>
                                                </div>
                                            )}
                                            {mostRecentGirth && mostRecentGirth.chestGirth && (
                                                <div>
                                                    <span className="text-xs text-gray-600">Chest Girth:</span>
                                                    <p className="font-medium">{mostRecentGirth.chestGirth} {measurementUnits.length}</p>
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

                            {/* Growth Curve Charts - Weight, Length, and Height */}
                            {growthRecords.length > 0 && (() => {
                                const sorted = [...growthRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
                                const weights = sorted.map(r => parseFloat(r.weight) || 0).filter(w => w > 0);
                                const lengths = sorted
                                    .filter(record => record.length && !isNaN(parseFloat(record.length)))
                                    .map(record => parseFloat(record.length));
                                const heights = sorted
                                    .filter(record => record.height && !isNaN(parseFloat(record.height)))
                                    .map(record => parseFloat(record.height));
                                
                                if (weights.length < 1) return null;
                                
                                const width = 500;
                                const height = 250;
                                const margin = { top: 20, right: 30, bottom: 50, left: 70 };
                                const graphWidth = width - margin.left - margin.right;
                                const graphHeight = height - margin.top - margin.bottom;
                                
                                // Weight chart setup
                                const minWeight = Math.min(...weights);
                                const maxWeight = Math.max(...weights);
                                const weightPadding = (maxWeight - minWeight) * 0.1 || 5;
                                const weightChartMin = Math.max(0, minWeight - weightPadding);
                                const weightChartMax = maxWeight + weightPadding;
                                const weightRange = weightChartMax - weightChartMin;
                                
                                // Length chart setup
                                const hasLengthData = lengths.length >= 1;
                                let minLength, maxLength, lengthRange, lengthChartMin, lengthChartMax;
                                if (hasLengthData) {
                                    minLength = Math.min(...lengths);
                                    maxLength = Math.max(...lengths);
                                    const lengthPadding = (maxLength - minLength) * 0.1 || 1;
                                    lengthChartMin = Math.max(0, minLength - lengthPadding);
                                    lengthChartMax = maxLength + lengthPadding;
                                    lengthRange = lengthChartMax - lengthChartMin;
                                }
                                
                                // Height chart setup
                                const hasHeightData = heights.length >= 1;
                                let minHeight, maxHeight, heightRange, heightChartMin, heightChartMax;
                                if (hasHeightData) {
                                    minHeight = Math.min(...heights);
                                    maxHeight = Math.max(...heights);
                                    const heightPadding = (maxHeight - minHeight) * 0.1 || 1;
                                    heightChartMin = Math.max(0, minHeight - heightPadding);
                                    heightChartMax = maxHeight + heightPadding;
                                    heightRange = heightChartMax - heightChartMin;
                                }
                                
                                // Create points for weight
                                const weightPoints = sorted.map((record, idx) => ({
                    x: margin.left + (idx / Math.max(1, sorted.length - 1)) * graphWidth,
                    y: margin.top + graphHeight - ((parseFloat(record.weight) - weightChartMin) / weightRange) * graphHeight,
                    weight: record.weight,
                    length: record.length,
                    height: record.height,
                    bcs: record.bcs,
                    notes: record.notes,
                    date: record.date
                }));
                
                // Create points for length
                const lengthPoints = hasLengthData ? sorted.filter(r => r.length).map((record, idx) => ({
                    x: margin.left + (sorted.indexOf(record) / Math.max(1, sorted.length - 1)) * graphWidth,
                    y: margin.top + graphHeight - ((parseFloat(record.length) - lengthChartMin) / lengthRange) * graphHeight,
                    weight: record.weight,
                    length: record.length,
                    height: record.height,
                    bcs: record.bcs,
                    notes: record.notes,
                    date: record.date
                })) : [];
                
                // Create points for height
                const heightPoints = hasHeightData ? sorted.filter(r => r.height).map((record, idx) => ({
                    x: margin.left + (sorted.indexOf(record) / Math.max(1, sorted.length - 1)) * graphWidth,
                                    length: record.length,
                                    height: record.height,
                                    bcs: record.bcs,
                                    notes: record.notes,
                                    date: record.date
                                })) : [];
                                
                                const weightPathData = weightPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                const lengthPathData = lengthPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                const heightPathData = heightPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                
                                const getBCSDescription = (bcsValue) => {
                                    const bcsMap = {
                                        '1': 'Emaciated',
                                        '2': 'Thin',
                                        '3': 'Ideal',
                                        '4': 'Overweight',
                                        '5': 'Obese'
                                    };
                                    return bcsMap[bcsValue] || bcsValue;
                                };
                                
                                const renderChart = (points, label, color, pathData, chartMin, chartMax) => {
                                    const range = chartMax - chartMin;
                                    return (
                                        <svg key={`chart-${label}`} width="100%" height="300" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: '100%' }} preserveAspectRatio="xMidYMid meet">
                                            {/* Grid lines */}
                                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                                const y = margin.top + graphHeight * (1 - ratio);
                                                const axisLabel = (chartMin + range * ratio).toFixed(1);
                                                return (
                                                    <g key={`grid-${i}`}>
                                                        <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                                                        <text x={margin.left - 12} y={y} textAnchor="end" dy="0.3em" fontSize="11" fill="#666">{axisLabel}</text>
                                                    </g>
                                                );
                                            })}
                                            
                                            {/* Axes */}
                                            <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke={color} strokeWidth="2" />
                                            <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#333" strokeWidth="2" />
                                            
                                            {/* Y-axis label */}
                                            <text x={20} y={margin.top + graphHeight / 2} textAnchor="middle" fontSize="12" fill={color} fontWeight="600" transform={`rotate(-90 20 ${margin.top + graphHeight / 2})`}>
                                                {label} ({label === 'Weight' ? measurementUnits.weight : measurementUnits.length})
                                            </text>
                                            
                                            {/* X-axis label */}
                                            <text x={margin.left + graphWidth / 2} y={height - 8} textAnchor="middle" fontSize="12" fill="#333" fontWeight="600">
                                                Date
                                            </text>
                                            
                                            {/* X-axis date labels */}
                                            {points.map((p, i) => (
                                                i % Math.max(1, Math.floor(points.length / 5)) === 0 && (
                                                    <text key={`date-${i}`} x={p.x} y={height - margin.bottom + 25} textAnchor="middle" fontSize="10" fill="#666">
                                                        {formatDate(p.date)}
                                                    </text>
                                                )
                                            ))}
                                            
                                            {/* Curve */}
                                            <path d={pathData} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            
                                            {/* Points */}
                                            {points.map((p, i) => {
                                                const tooltipText = [
                                                    `Date: ${formatDate(p.date)}`,
                                                    `Weight: ${p.weight} ${measurementUnits.weight}`,
                                                    p.length ? `Length: ${p.length} ${measurementUnits.length}` : null,
                                                    p.bcs ? `BCS: ${p.bcs} - ${getBCSDescription(p.bcs)}` : null,
                                                    p.notes ? `Notes: ${p.notes}` : null
                                                ].filter(Boolean).join('\n');
                                                
                                                // Color gradient from green (earliest) to red (latest)
                                                const colorRatio = points.length > 1 ? i / (points.length - 1) : 0;
                                                let dotColor;
                                                if (colorRatio < 0.5) {
                                                    const t = colorRatio * 2;
                                                    const r = Math.round(144 + (255 - 144) * t);
                                                    const g = 191;
                                                    const b = Math.round(71 + (0 - 71) * t);
                                                    dotColor = `rgb(${r}, ${g}, ${b})`;
                                                } else {
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
                                    );
                                };
                                
                                return (
                                    <div className="space-y-4">
                                        {/* Weight Chart */}
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <span className="inline-block w-3 h-1 bg-blue-500 rounded"></span>
                                                Weight Growth Curve
                                            </h4>
                                            {renderChart(weightPoints, 'Weight', '#3b82f6', weightPathData, weightChartMin, weightChartMax)}
                                            <p className="text-xs text-gray-500 mt-2">Hover over points to see detailed measurements and notes.</p>
                                        </div>
                                        
                                        {/* Length Chart */}
                                        {hasLengthData && (
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                    <span className="inline-block w-3 h-1 bg-orange-500 rounded"></span>
                                                    Body Length Growth Curve
                                                </h4>
                                                {renderChart(lengthPoints, 'Length', '#ff8c42', lengthPathData, lengthChartMin, lengthChartMax)}
                                                <p className="text-xs text-gray-500 mt-2">Hover over points to see detailed measurements and notes.</p>
                                            </div>
                                        )}
                                        
                                        {/* Height at Withers Chart */}
                                        {hasHeightData && (
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                    <span className="inline-block w-3 h-1 bg-purple-500 rounded"></span>
                                                    Height at Withers Growth Curve
                                                </h4>
                                                {renderChart(heightPoints, 'Height', '#9333ea', heightPathData, heightChartMin, heightChartMax)}
                                                <p className="text-xs text-gray-500 mt-2">Hover over points to see detailed measurements and notes.</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                            
                            {/* Growth Records */}
                            <div className="space-y-3 mt-6">
                                <h4 className="text-sm font-semibold text-gray-600">Growth History</h4>
                                
                                {/* Unit Selection */}
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200" data-tutorial-target="measurement-units-select">
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
                                    
                                    {/* Row 1: Date, Weight, Body Length, Height at Withers (Dog/Cat only) */}
                                    <div className={`grid gap-3 ${(formData.species === 'Dog' || formData.species === 'Cat') ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Date</label>
                                            <DatePicker 
                                                value={newMeasurement.date}
                                                onChange={(e) => setNewMeasurement({...newMeasurement, date: e.target.value})}
                                                className="mt-1 p-2 text-sm"
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
                                            <label className="block text-xs font-medium text-gray-700">{getFieldLabel('length', 'Body Length')} ({measurementUnits.length})</label>
                                            <input 
                                                type="number" 
                                                step="0.1"
                                                value={newMeasurement.length}
                                                onChange={(e) => setNewMeasurement({...newMeasurement, length: e.target.value})}
                                                placeholder={`e.g., ${measurementUnits.length === 'cm' ? '20' : measurementUnits.length === 'm' ? '0.2' : measurementUnits.length === 'in' ? '8' : '0.66'}`}
                                                className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            />
                                        </div>
                                        {(formData.species === 'Dog' || formData.species === 'Cat') && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Height at Withers ({measurementUnits.length})</label>
                                                <input 
                                                    type="number" 
                                                    step="0.1"
                                                    value={newMeasurement.height}
                                                    onChange={(e) => setNewMeasurement({...newMeasurement, height: e.target.value})}
                                                    placeholder={`e.g., ${measurementUnits.length === 'cm' ? '25' : measurementUnits.length === 'm' ? '0.25' : measurementUnits.length === 'in' ? '10' : '0.83'}`}
                                                    className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Row 2: Chest Girth (Dog/Cat only), BCS, Notes */}
                                    <div className={`grid gap-3 ${(formData.species === 'Dog' || formData.species === 'Cat') ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                                        {(formData.species === 'Dog' || formData.species === 'Cat') && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Chest Girth ({measurementUnits.length})</label>
                                                <input 
                                                    type="number" 
                                                    step="0.1"
                                                    value={newMeasurement.chestGirth}
                                                    onChange={(e) => setNewMeasurement({...newMeasurement, chestGirth: e.target.value})}
                                                    placeholder={`e.g., ${measurementUnits.length === 'cm' ? '30' : measurementUnits.length === 'm' ? '0.3' : measurementUnits.length === 'in' ? '12' : '1'}`}
                                                    className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Body Condition Score</label>
                                            <select 
                                                value={newMeasurement.bcs}
                                                onChange={(e) => setNewMeasurement({...newMeasurement, bcs: e.target.value})}
                                                className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                                <option value="">Select BCS</option>
                                                {formData.species === 'Dog' ? (
                                                    <>
                                                        <option value="1">1 - Emaciated</option>
                                                        <option value="2">2 - Very Thin</option>
                                                        <option value="3">3 - Thin</option>
                                                        <option value="4">4 - Underweight</option>
                                                        <option value="5">5 - Ideal</option>
                                                        <option value="6">6 - Overweight</option>
                                                        <option value="7">7 - Heavy</option>
                                                        <option value="8">8 - Obese</option>
                                                        <option value="9">9 - Severely Obese</option>
                                                    </>
                                                ) : formData.species === 'Cat' ? (
                                                    <>
                                                        <option value="1">1 - Emaciated</option>
                                                        <option value="2">2 - Lean</option>
                                                        <option value="3">3 - Ideal</option>
                                                        <option value="4">4 - Overweight</option>
                                                        <option value="5">5 - Obese</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="1">1 - Emaciated</option>
                                                        <option value="2">2 - Thin</option>
                                                        <option value="3">3 - Ideal</option>
                                                        <option value="4">4 - Overweight</option>
                                                        <option value="5">5 - Obese</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Notes</label>
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
                                        data-tutorial-target="add-measurement-btn"
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
                                                <div className="flex gap-4 text-gray-700 flex-1 flex-wrap">
                                                    <span className="font-medium">{record.date}</span>
                                                    <span>{record.weight} {measurementUnits.weight}</span>
                                                    {record.length && (
                                                        <span>L: {record.length} {measurementUnits.length}</span>
                                                    )}
                                                    {record.height && (
                                                        <span>H: {record.height} {measurementUnits.length}</span>
                                                    )}
                                                    {record.chestGirth && (
                                                        <span>G: {record.chestGirth} {measurementUnits.length}</span>
                                                    )}
                                                    {record.bcs && (
                                                        <>
                                                            <span className="mx-2"></span>
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
                
                {/* Tab 3: Identification */}
                {activeTab === 3 && (
                    <div className="space-y-6">
                        {/* Identification Numbers */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2"><Hash size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Identification Numbers</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!isFieldHidden('breederAssignedId') && (
                                <div data-tutorial-target="identification-breeder-id">
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('breederAssignedId', 'Identification')}</label>
                                    <input type="text" name="breederAssignedId" value={formData.breederAssignedId} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder={getFieldLabel('breederAssignedId', 'Identification')} />
                                </div>
                                )}
                                
                                {!isFieldHidden('microchipNumber') && (
                                <div data-tutorial-target="microchip-input">
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('microchipNumber', 'Microchip Number')}</label>
                                    <input type="text" name="microchipNumber" value={formData.microchipNumber} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                )}
                                
                                {!isFieldHidden('pedigreeRegistrationId') && (
                                <div data-tutorial-target="registration-id-input">
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('pedigreeRegistrationId', 'Pedigree Registration ID')}</label>
                                    <input type="text" name="pedigreeRegistrationId" value={formData.pedigreeRegistrationId} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                )}
                                
                                {!isFieldHidden('colonyId') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('colonyId', 'Colony ID')}</label>
                                    <input type="text" name="colonyId" value={formData.colonyId || ''} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="Colony or group identifier" />
                                </div>
                                )}

                                {/* Licensing fields moved to Tab 13: Legal & Documentation */}
                                {!isFieldHidden('rabiesTagNumber') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Rabies Tag Number</label>
                                        <input type="text" name="rabiesTagNumber" value={formData.rabiesTagNumber || ''} onChange={handleChange} 
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                    </div>
                                )}
                                {!isFieldHidden('tattooId') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tattoo ID</label>
                                        <input type="text" name="tattooId" value={formData.tattooId || ''} onChange={handleChange} 
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                    </div>
                                )}
                            </div>

                            {/* Dog/Cat Registry Numbers - integrated */}
                            {(formData.species === 'Dog' || formData.species === 'Cat') && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {formData.species === 'Dog' && (
                                            <>
                                                {!isFieldHidden('akcRegistrationNumber') && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">AKC Registration #</label>
                                                    <input type="text" name="akcRegistrationNumber" value={formData.akcRegistrationNumber || ''} onChange={handleChange} 
                                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                                </div>
                                                )}
                                                {!isFieldHidden('fciRegistrationNumber') && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">FCI Registration #</label>
                                                    <input type="text" name="fciRegistrationNumber" value={formData.fciRegistrationNumber || ''} onChange={handleChange} 
                                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                                </div>
                                                )}
                                            </>
                                        )}
                                        {formData.species === 'Cat' && !isFieldHidden('cfaRegistrationNumber') && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">CFA Registration #</label>
                                                <input type="text" name="cfaRegistrationNumber" value={formData.cfaRegistrationNumber || ''} onChange={handleChange} 
                                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        )}
                                        {!isFieldHidden('workingRegistryIds') && (
                                        <div className={formData.species === 'Cat' ? '' : 'md:col-span-2'}>
                                            <label className="block text-sm font-medium text-gray-700">Working Registry IDs</label>
                                            <input type="text" name="workingRegistryIds" value={formData.workingRegistryIds || ''} onChange={handleChange} 
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                placeholder="Herding, Hunting, Service registrations" />
                                        </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {/* Classification */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4" data-tutorial-target="classification-section">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2"><FolderOpen size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Classification</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Species</label>
                                    <input type="text" value={formData.species} disabled 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600" />
                                    <p className="text-xs text-gray-500 mt-1">Cannot be changed after creation</p>
                                </div>
                                
                                {!isFieldHidden('breed') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('breed', 'Breed')}</label>
                                    <input type="text" name="breed" value={formData.breed} onChange={handleChange} 
                                        data-tutorial-target="breed-select"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                )}
                                
                                {!isFieldHidden('strain') && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">{getFieldLabel('strain', 'Strain')} {!fieldTemplate?.fields?.strain?.label && !speciesConfigs?.[formData.species]?.fieldReplacements?.strain && <span className="text-xs text-gray-500">(small mammals)</span>}</label>
                                        <input type="text" name="strain" value={formData.strain} onChange={handleChange} 
                                            data-tutorial-target="strain-input"
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder={getFieldLabel('strain', 'e.g., C57BL/6, Wistar, Syrian')} />
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Origin */}
                        {!isFieldHidden('origin') && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3"><Globe size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Origin</h3>
                                <label className="block text-sm font-medium text-gray-700">{getFieldLabel('origin', 'Origin')}</label>
                                <select name="origin" value={formData.origin || ''} onChange={handleChange}
                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                    <option value="">Select Origin</option>
                                    <option value="Captive-bred">Captive-bred</option>
                                    <option value="Wild-caught">Wild-caught</option>
                                    <option value="Rescue">Rescue</option>
                                </select>
                            </div>
                        )}

                        {/* Tags */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200" data-tutorial-target="tags-section">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3"><Tag size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Tags</h3>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Lines, Enclosures, etc)</label>
                            <input 
                                type="text" 
                                placeholder="Type and press Enter or comma to add tags" 
                                value={tagInput} 
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ',') {
                                        e.preventDefault();
                                        const trimmed = tagInput.trim();
                                        if (trimmed && !formData.tags.includes(trimmed)) {
                                            setFormData({ ...formData, tags: [...formData.tags, trimmed] });
                                            setTagInput('');
                                        }
                                    } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
                                        // Remove last tag if backspace on empty input
                                        setFormData({ ...formData, tags: formData.tags.slice(0, -1) });
                                    }
                                }}
                                onBlur={() => {
                                    // Add tag on blur if there's content
                                    const trimmed = tagInput.trim();
                                    if (trimmed && !formData.tags.includes(trimmed)) {
                                        setFormData({ ...formData, tags: [...formData.tags, trimmed] });
                                        setTagInput('');
                                    }
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
                                            <Trash2 size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Tab 6: Family */}
                {activeTab === 6 && (
                    <FamilyTabContent
                        animal={animalToEdit}
                        API_BASE_URL={API_BASE_URL}
                        authToken={authToken}
                        onViewAnimal={null}
                    />
                )}

                {/* Tab 7: Fertility */}
                {activeTab === 7 && (
                    <div className="space-y-6">
                        {/* Reproductive Status - Key Status Indicators */}
                        {(!isFieldHidden('isNeutered') || !isFieldHidden('isInfertile') || !isFieldHidden('isPregnant') || !isFieldHidden('isNursing') || !isFieldHidden('isInMating')) && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4" data-tutorial-target="reproductive-status-section">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2"><Leaf size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Reproductive Status</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {!isFieldHidden('isNeutered') && (
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
                                )}
                                
                                {!isFieldHidden('isInMating') && !formData.isNeutered && !formData.isInfertile && (
                                    <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition" data-tutorial-target="mating-pregnancy-checkbox">
                                        <input
                                            type="checkbox"
                                            name="isInMating"
                                            checked={formData.isInMating}
                                            onChange={handleChange}
                                            className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{getFieldLabel('isInMating', 'In Mating')}</span>
                                    </label>
                                )}

                                {!isFieldHidden('isInfertile') && (
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
                                )}

                                {!isFieldHidden('isPregnant') && (formData.gender === 'Female' || formData.gender === 'Intersex' || formData.gender === 'Unknown') && !formData.isNeutered && !formData.isInfertile && (
                                    <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition" data-tutorial-target="mating-pregnancy-checkbox">
                                        <input
                                            type="checkbox"
                                            name="isPregnant"
                                            checked={formData.isPregnant}
                                            onChange={handleChange}
                                            className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{getFieldLabel('isPregnant', 'Pregnant')}</span>
                                    </label>
                                )}

                                {!isFieldHidden('isNursing') && (formData.gender === 'Female' || formData.gender === 'Intersex' || formData.gender === 'Unknown') && (
                                    <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg bg-white hover:bg-gray-50 transition" data-tutorial-target="nursing-checkbox">
                                        <input
                                            type="checkbox"
                                            name="isNursing"
                                            checked={formData.isNursing}
                                            onChange={handleChange}
                                            className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{getFieldLabel('isNursing', 'Nursing')}</span>
                                    </label>
                                )}

                            </div>
                        </div>
                        )}

                        {/* Estrus/Cycle - Only for females when not neutered */}
                        {!isFieldHidden('heatStatus') && (formData.gender === 'Female' || formData.gender === 'Intersex' || formData.gender === 'Unknown') && !formData.isNeutered && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4" data-tutorial-target="estrus-cycle-section">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4"><RefreshCw size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Estrus/Cycle</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('heatStatus', 'Heat Status')}</label>
                                        <select name="heatStatus" value={formData.heatStatus} onChange={handleChange}
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                            <option value="">Select status...</option>
                                            <option value="Pre-estrus">Pre-estrus</option>
                                            <option value="Estrus">Estrus</option>
                                            <option value="Post-estrus">Post-estrus</option>
                                            <option value="Anestrus">Anestrus</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Heat Date</label>
                                        <DatePicker value={formData.lastHeatDate} onChange={(e) => handleChange({ target: { name: 'lastHeatDate', value: e.target.value } })}
                                            className="p-2" />
                                    </div>
                                    
                                    {!isFieldHidden('ovulationDate') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ovulation Date</label>
                                        <DatePicker value={formData.ovulationDate} onChange={(e) => handleChange({ target: { name: 'ovulationDate', value: e.target.value } })}
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                    </div>
                                    )}
                                    
                                    {/* Estrus Cycle Length */}
                                    {!isFieldHidden('estrusCycleLength') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('estrusCycleLength', 'Estrus Cycle Length (days)')}</label>
                                            <input type="number" name="estrusCycleLength" value={formData.estrusCycleLength || ''} onChange={handleChange} 
                                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                placeholder="Cycle length in days" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Stud Information - Always shown when not neutered and not infertile */}
                        {!formData.isNeutered && !formData.isInfertile && (formData.gender === 'Male' || formData.gender === 'Intersex' || formData.gender === 'Unknown') && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4" data-tutorial-target="stud-info-section">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Mars size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Sire Information <span className="text-xs font-normal text-gray-500">(Active Status)</span></h3>
                                    {formData.gender === 'Unknown' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block">Fertility</span>}
                                    {formData.gender === 'Intersex' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded mt-1 inline-block">Sire Role</span>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {!isFieldHidden('fertilityStatus') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('fertilityStatus', 'Sire Fertility Status')}</label>
                                        <select name="fertilityStatus" value={formData.fertilityStatus} onChange={handleChange} 
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                            <option value="Unknown">Unknown</option>
                                            <option value="Fertile">Fertile</option>
                                            <option value="Subfertile">Subfertile</option>
                                            <option value="Infertile">Infertile</option>
                                        </select>
                                    </div>
                                    )}
                                    
                                    {!isFieldHidden('fertilityNotes') && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('fertilityNotes', 'Fertility Notes')}</label>
                                        <textarea name="fertilityNotes" value={formData.fertilityNotes} onChange={handleChange} 
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="e.g., Any genetic concerns, fertility issues, or special breeding notes for sire role"
                                            rows="3" />
                                    </div>
                                    )}
                                    
                                    {/* Reproductive Clearances & Complications */}
                                    {(!isFieldHidden('reproductiveClearances') || !isFieldHidden('reproductiveComplications')) && (
                                        <>
                                            {!isFieldHidden('reproductiveClearances') && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('reproductiveClearances', 'Reproductive Clearances')}</label>
                                                <textarea name="reproductiveClearances" value={formData.reproductiveClearances || ''} onChange={handleChange} rows="2"
                                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                    placeholder="Brucellosis test, progesterone timing, etc." />
                                            </div>
                                            )}
                                            {!isFieldHidden('reproductiveComplications') && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('reproductiveComplications', 'Reproductive Complications')}</label>
                                                <textarea name="reproductiveComplications" value={formData.reproductiveComplications || ''} onChange={handleChange} rows="2"
                                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                    placeholder="Any complications during breeding" />
                                            </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Dam Information - Always shown when not neutered and not infertile */}
                        {!formData.isNeutered && !formData.isInfertile && (formData.gender === 'Female' || formData.gender === 'Intersex' || formData.gender === 'Unknown') && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4" data-tutorial-target="dam-info-section">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Venus size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Dam Information <span className="text-xs font-normal text-gray-500">(Active Status)</span></h3>
                                    {formData.gender === 'Unknown' && <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded mt-1 inline-block">Egg Fertility</span>}
                                    {formData.gender === 'Intersex' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded mt-1 inline-block">Dam Role</span>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {!isFieldHidden('damFertilityStatus') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Dam Fertility Status <span className="text-xs text-gray-500 font-normal">(Egg/Gestation)</span></label>
                                        <select name="damFertilityStatus" value={formData.damFertilityStatus || formData.fertilityStatus} onChange={(e) => handleChange({target: {name: 'damFertilityStatus', value: e.target.value}})} 
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                            <option value="Unknown">Unknown</option>
                                            <option value="Fertile">Fertile</option>
                                            <option value="Subfertile">Subfertile</option>
                                            <option value="Infertile">Infertile</option>
                                        </select>
                                    </div>
                                    )}
                                    
                                    {!isFieldHidden('damFertilityNotes') && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('damFertilityNotes', 'Dam Fertility Notes')}</label>
                                        <textarea name="damFertilityNotes" value={formData.damFertilityNotes || ''} onChange={handleChange} 
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="e.g., Any genetic concerns, fertility issues, or special breeding notes for dam role"
                                            rows="3" />
                                    </div>
                                    )}
                                    
                                    {/* Dog/Cat Pregnancy & Delivery Details */}
                                    {/* Gestation, Delivery, Dates - Template controlled */}
                                    {(!isFieldHidden('gestationLength') || !isFieldHidden('deliveryMethod') || !isFieldHidden('whelpingDate') || !isFieldHidden('queeningDate') || !isFieldHidden('reproductiveClearances') || !isFieldHidden('reproductiveComplications')) && (
                                        <>
                                            {!isFieldHidden('gestationLength') && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('gestationLength', 'Gestation Length (days)')}</label>
                                                <input type="number" name="gestationLength" value={formData.gestationLength || ''} onChange={handleChange} 
                                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                    placeholder="Length in days" />
                                            </div>
                                            )}
                                            {!isFieldHidden('deliveryMethod') && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('deliveryMethod', 'Delivery Method')}</label>
                                                <select name="deliveryMethod" value={formData.deliveryMethod || ''} onChange={handleChange} 
                                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                                    <option value="">Select...</option>
                                                    <option value="Natural">Natural</option>
                                                    <option value="C-Section">C-Section</option>
                                                    <option value="Assisted">Assisted</option>
                                                </select>
                                            </div>
                                            )}
                                            {!isFieldHidden('whelpingDate') && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('whelpingDate', 'Whelping Date')}</label>
                                                <DatePicker name="whelpingDate" value={formData.whelpingDate || ''} onChange={handleChange} 
                                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            )}
                                            {!isFieldHidden('queeningDate') && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('queeningDate', 'Queening Date')}</label>
                                                <DatePicker name="queeningDate" value={formData.queeningDate || ''} onChange={handleChange} 
                                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            )}
                                            {!isFieldHidden('reproductiveClearances') && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('reproductiveClearances', 'Reproductive Clearances')}</label>
                                                <textarea name="reproductiveClearances" value={formData.reproductiveClearances || ''} onChange={handleChange} rows="2"
                                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                    placeholder="Brucellosis test, progesterone timing, etc." />
                                            </div>
                                            )}
                                            {!isFieldHidden('reproductiveComplications') && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('reproductiveComplications', 'Reproductive Complications')}</label>
                                                <textarea name="reproductiveComplications" value={formData.reproductiveComplications || ''} onChange={handleChange} rows="2"
                                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                    placeholder="Any complications during breeding/delivery" />
                                            </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 8: Health */}
                {activeTab === 8 && (
                    <div className="space-y-6">
                        {/* Preventive Care */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200" data-tutorial-target="preventive-care-section">
                            <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, preventiveCare: !p.preventiveCare}))} className="w-full flex items-center justify-between text-left group">
                                <h3 className="text-lg font-semibold text-gray-700"><Shield size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Preventive Care</h3>
                                <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.preventiveCare ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                            </button>
                            {!collapsedHealthSections.preventiveCare && (<div className="space-y-6 mt-4">
                            {/* Vaccinations */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">Vaccinations</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Date</label>
                                            <DatePicker value={newVaccination.date} onChange={(e) => setNewVaccination({...newVaccination, date: e.target.value})}
                                                className="mt-1 p-2 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Vaccination Name</label>
                                            <input type="text" value={newVaccination.name} onChange={(e) => setNewVaccination({...newVaccination, name: e.target.value})}
                                                placeholder="e.g., Rabies, Distemper" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Notes</label>
                                            <input type="text" value={newVaccination.notes} onChange={(e) => setNewVaccination({...newVaccination, notes: e.target.value})}
                                                placeholder="e.g., Booster, Clinic name" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addVaccination} className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-lg text-sm font-medium">
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
                                                    className="text-red-500 hover:text-red-700 p-1" title="Delete record"><Trash2 size={14} /></button>
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
                                            <DatePicker value={newDeworming.date} onChange={(e) => setNewDeworming({...newDeworming, date: e.target.value})}
                                                className="mt-1 p-2 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Medication</label>
                                            <input type="text" value={newDeworming.medication} onChange={(e) => setNewDeworming({...newDeworming, medication: e.target.value})}
                                                placeholder="e.g., Fenbendazole, Panacur" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Notes</label>
                                            <input type="text" value={newDeworming.notes} onChange={(e) => setNewDeworming({...newDeworming, notes: e.target.value})}
                                                placeholder="e.g., Dosage, vet notes" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addDeworming} className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-lg text-sm font-medium">
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
                                                    className="text-red-500 hover:text-red-700 p-1" title="Delete record"><Trash2 size={14} /></button>
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
                                            <DatePicker value={newParasiteControl.date} onChange={(e) => setNewParasiteControl({...newParasiteControl, date: e.target.value})}
                                                className="mt-1 p-2 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Treatment</label>
                                            <input type="text" value={newParasiteControl.treatment} onChange={(e) => setNewParasiteControl({...newParasiteControl, treatment: e.target.value})}
                                                placeholder="e.g., Flea/tick, mite treatment" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Notes</label>
                                            <input type="text" value={newParasiteControl.notes} onChange={(e) => setNewParasiteControl({...newParasiteControl, notes: e.target.value})}
                                                placeholder="e.g., Product name, vet notes" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addParasiteControl} className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-lg text-sm font-medium">
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
                                                    className="text-red-500 hover:text-red-700 p-1" title="Delete record"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            </div>)}
                        </div>

                        {/* Procedures & Diagnostics */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200" data-tutorial-target="procedures-section">
                            <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, proceduresDiagnostics: !p.proceduresDiagnostics}))} className="w-full flex items-center justify-between text-left group">
                                <h3 className="text-lg font-semibold text-gray-700"><Microscope size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Procedures & Diagnostics</h3>
                                <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.proceduresDiagnostics ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                            </button>
                            {!collapsedHealthSections.proceduresDiagnostics && (<div className="space-y-6 mt-4">
                            {/* Medical Procedures */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">Medical Procedures</h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Date</label>
                                            <DatePicker value={newProcedure.date} onChange={(e) => setNewProcedure({...newProcedure, date: e.target.value})}
                                                className="mt-1 p-2 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Procedure Name</label>
                                            <input type="text" value={newProcedure.name} onChange={(e) => setNewProcedure({...newProcedure, name: e.target.value})}
                                                placeholder="e.g., Neutering, Surgery" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Notes</label>
                                            <input type="text" value={newProcedure.notes} onChange={(e) => setNewProcedure({...newProcedure, notes: e.target.value})}
                                                placeholder="e.g., Vet clinic, outcome" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addMedicalProcedure} className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-lg text-sm font-medium">
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
                                                    className="text-red-500 hover:text-red-700 p-1" title="Delete record"><Trash2 size={14} /></button>
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
                                            <DatePicker value={newLabResult.date} onChange={(e) => setNewLabResult({...newLabResult, date: e.target.value})}
                                                className="mt-1 p-2 text-sm" />
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
                                    <button type="button" onClick={addLabResult} className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-lg text-sm font-medium">
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
                                                    className="text-red-500 hover:text-red-700 p-1" title="Delete record"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            </div>)}
                        </div>

                        {/* Active Medical Records */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200" data-tutorial-target="medical-history-section">
                            <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, activeMedical: !p.activeMedical}))} className="w-full flex items-center justify-between text-left group">
                                <h3 className="text-lg font-semibold text-gray-700"><Pill size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Active Medical Records</h3>
                                <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.activeMedical ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                            </button>
                            {!collapsedHealthSections.activeMedical && (<div className="space-y-4 mt-4">
                            {/* Quarantine toggle */}
                            <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg bg-white hover:bg-orange-50 transition">
                                <input
                                    type="checkbox"
                                    name="isQuarantine"
                                    checked={formData.isQuarantine || false}
                                    onChange={handleChange}
                                    className="form-checkbox h-5 w-5 text-orange-500 rounded focus:ring-orange-400"
                                />
                                <span className="text-sm font-medium text-gray-700">In Quarantine / Isolation</span>
                            </label>
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
                                        <button type="button" onClick={addMedicalCondition} className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-lg text-sm font-medium">
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
                                                        className="text-red-500 hover:text-red-700 p-1" title="Delete record"><Trash2 size={14} /></button>
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
                                        <button type="button" onClick={addAllergy} className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-lg text-sm font-medium">
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
                                                        className="text-red-500 hover:text-red-700 p-1" title="Delete record"><Trash2 size={14} /></button>
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
                                        <button type="button" onClick={addMedication} className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-lg text-sm font-medium">
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
                                                        className="text-red-500 hover:text-red-700 p-1" title="Delete record"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                            </div>
                            </div>)}
                        </div>

                        {/* Health Clearances & Screening */}
                        {(!isFieldHidden('spayNeuterDate') || !isFieldHidden('heartwormStatus') || !isFieldHidden('hipElbowScores') || !isFieldHidden('eyeClearance') || !isFieldHidden('cardiacClearance') || !isFieldHidden('dentalRecords') || !isFieldHidden('geneticTestResults') || !isFieldHidden('chronicConditions')) && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, healthClearances: !p.healthClearances}))} className="w-full flex items-center justify-between text-left group">
                                <h3 className="text-lg font-semibold text-gray-700"><Hospital size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Health Clearances & Screening</h3>
                                <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.healthClearances ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                            </button>
                            {!collapsedHealthSections.healthClearances && (<div className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {!isFieldHidden('spayNeuterDate') && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">{getFieldLabel('spayNeuterDate', 'Spay/Neuter Date')}</label>
                                    <DatePicker value={formData.spayNeuterDate || ''} onChange={(e) => handleChange({ target: { name: 'spayNeuterDate', value: e.target.value } })}
                                        className="mt-1 p-2" />
                                </div>
                                )}
                                {!isFieldHidden('heartwormStatus') && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">{getFieldLabel('heartwormStatus', 'Heartworm Status')}</label>
                                    <select name="heartwormStatus" value={formData.heartwormStatus || ''} onChange={handleChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        <option value="">Select...</option>
                                        <option value="Negative">Negative</option>
                                        <option value="Positive">Positive</option>
                                        <option value="On Prevention">On Prevention</option>
                                        <option value="Unknown">Unknown</option>
                                    </select>
                                </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!isFieldHidden('hipElbowScores') && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">{getFieldLabel('hipElbowScores', 'Hip/Elbow Scores')}</label>
                                    <input type="text" name="hipElbowScores" value={formData.hipElbowScores || ''} onChange={handleChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        placeholder="e.g., OFA Good, PennHIP 0.32" />
                                </div>
                                )}
                                {!isFieldHidden('eyeClearance') && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">{getFieldLabel('eyeClearance', 'Eye Clearance')}</label>
                                    <input type="text" name="eyeClearance" value={formData.eyeClearance || ''} onChange={handleChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        placeholder="e.g., CAER Clear 2024" />
                                </div>
                                )}
                                {!isFieldHidden('cardiacClearance') && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">{getFieldLabel('cardiacClearance', 'Cardiac Clearance')}</label>
                                    <input type="text" name="cardiacClearance" value={formData.cardiacClearance || ''} onChange={handleChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        placeholder="e.g., OFA Cardiac Normal" />
                                </div>
                                )}
                                {!isFieldHidden('dentalRecords') && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">{getFieldLabel('dentalRecords', 'Dental Records')}</label>
                                    <input type="text" name="dentalRecords" value={formData.dentalRecords || ''} onChange={handleChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        placeholder="e.g., Last cleaning 01/2024" />
                                </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!isFieldHidden('geneticTestResults') && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">{getFieldLabel('geneticTestResults', 'Genetic Test Results')}</label>
                                    <textarea name="geneticTestResults" value={formData.geneticTestResults || ''} onChange={handleChange} rows="2"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        placeholder="e.g., Embark: Clear for DM, vWD, DCM" />
                                </div>
                                )}
                                {!isFieldHidden('chronicConditions') && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">{getFieldLabel('chronicConditions', 'Chronic Conditions')}</label>
                                    <textarea name="chronicConditions" value={formData.chronicConditions || ''} onChange={handleChange} rows="2"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        placeholder="e.g., Allergies, arthritis, epilepsy" />
                                </div>
                                )}
                            </div>
                            </div>)}
                        </div>
                        )}

                        {/* Veterinary Care */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200" data-tutorial-target="vet-care-section">
                            <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, vetCare: !p.vetCare}))} className="w-full flex items-center justify-between text-left group">
                                <h3 className="text-lg font-semibold text-gray-700"><Stethoscope size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Veterinary Care</h3>
                                <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.vetCare ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                            </button>
                            {!collapsedHealthSections.vetCare && (<div className="space-y-4 mt-4">
                            <div className="space-y-4">
                                {/* Veterinary Visits */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700">Veterinary Visits</h4>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Date</label>
                                                <DatePicker value={newVetVisit.date} onChange={(e) => setNewVetVisit({...newVetVisit, date: e.target.value})}
                                                    className="mt-1 p-2 text-sm" />
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
                                        <button type="button" onClick={addVetVisit} className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-lg text-sm font-medium">
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
                                                        className="text-red-500 hover:text-red-700 p-1" title="Delete record"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {!isFieldHidden('primaryVet') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Veterinarian</label>
                                    <input type="text" name="primaryVet" value={formData.primaryVet} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Dr. Smith, ABC Veterinary Clinic" />
                                </div>
                                )}

                                {!isFieldHidden('parasitePreventionSchedule') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('parasitePreventionSchedule', 'Parasite Prevention Schedule')}</label>
                                    <textarea name="parasitePreventionSchedule" value={formData.parasitePreventionSchedule || ''} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        placeholder="e.g., Ivermectin every 3 months, flea/tick monthly" />
                                </div>
                                )}


                            </div>
                            </div>)}
                        </div>
                    </div>
                )}

                {/* Tab 9: Care */}
                {activeTab === 9 && (
                    <div className="space-y-6">
                        {/* 1st Section: Nutrition */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4" data-tutorial-target="nutrition-section">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><UtensilsCrossed size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Nutrition</h3>
                            <div className="space-y-4">
                                {!isFieldHidden('dietType') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
                                    <input type="text" name="dietType" value={formData.dietType} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Pellets, fresh vegetables, lab blocks" />
                                </div>
                                )}
                                
                                {!isFieldHidden('feedingSchedule') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Feeding Schedule</label>
                                    <textarea name="feedingSchedule" value={formData.feedingSchedule} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Morning and evening, free feeding" />
                                </div>
                                )}

                                {/* Feeding tracking ? powers Management view */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Fed Date</label>
                                        <input type="date" name="lastFedDate" value={formData.lastFedDate || ''} onChange={handleChange}
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Feeding Every (days)</label>
                                        <input type="number" name="feedingFrequencyDays" value={formData.feedingFrequencyDays || ''} onChange={handleChange}
                                            min="1" className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                            placeholder="e.g. 1 = daily, 3 = every 3 days" />
                                    </div>
                                </div>
                                
                                {!isFieldHidden('supplements') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Supplements</label>
                                    <textarea name="supplements" value={formData.supplements} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Vitamin D, calcium powder" />
                                </div>
                                )}
                            </div>
                        </div>

                        {/* 2nd Section: Housing & Enclosure */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4" data-tutorial-target="housing-section">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Housing & Enclosure</h3>
                            <div className="space-y-4">
                                {/* Enclosure assignment */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Assigned Enclosure</label>
                                        <button type="button"
                                            onClick={() => setShowQuickEnclosureForm(prev => !prev)}
                                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium">
                                            <Plus size={13} /> New Enclosure
                                        </button>
                                    </div>
                                    <select name="enclosureId" value={formData.enclosureId || ''} onChange={handleChange}
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        <option value="">* None / Unassigned *</option>
                                        {enclosureOptions.map(enc => (
                                            <option key={enc._id} value={enc._id}>
                                                {enc.name}{enc.enclosureType ? ` (${enc.enclosureType})` : ''}{enc.size ? ` · ${enc.size}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {showQuickEnclosureForm && (
                                        <div className="mt-2 p-3 border border-primary/30 rounded-lg bg-primary/5 space-y-2">
                                            <p className="text-xs font-semibold text-gray-600">Quick-create enclosure</p>
                                            <input type="text" value={quickEnclosureName} onChange={e => setQuickEnclosureName(e.target.value)}
                                                placeholder="Enclosure name *"
                                                className="block w-full p-1.5 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                                            <div className="flex gap-2">
                                                <input type="text" value={quickEnclosureType} onChange={e => setQuickEnclosureType(e.target.value)}
                                                    placeholder="Type (e.g. Cage, Tank)"
                                                    className="flex-1 p-1.5 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                                                <input type="text" value={quickEnclosureSize} onChange={e => setQuickEnclosureSize(e.target.value)}
                                                    placeholder="Size"
                                                    className="flex-1 p-1.5 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button type="button" onClick={() => { setShowQuickEnclosureForm(false); setQuickEnclosureName(''); setQuickEnclosureType(''); setQuickEnclosureSize(''); }}
                                                    className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100">Cancel</button>
                                                <button type="button" disabled={!quickEnclosureName.trim()} onClick={async () => {
                                                    if (!quickEnclosureName.trim()) return;
                                                    try {
                                                        const res = await axios.post(`${API_BASE_URL}/enclosures`,
                                                            { name: quickEnclosureName.trim(), enclosureType: quickEnclosureType.trim(), size: quickEnclosureSize.trim(), notes: '', cleaningTasks: [] },
                                                            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } });
                                                        const newEnc = res.data;
                                                        setEnclosureOptions(prev => [...prev, newEnc]);
                                                        setFormData(prev => ({ ...prev, enclosureId: newEnc._id }));
                                                        setShowQuickEnclosureForm(false);
                                                        setQuickEnclosureName(''); setQuickEnclosureType(''); setQuickEnclosureSize('');
                                                    } catch (err) {
                                                        alert(err.response?.data?.message || 'Failed to create enclosure');
                                                    }
                                                }} className="text-xs px-3 py-1.5 rounded bg-primary text-black font-semibold hover:bg-primary/80 disabled:opacity-50">
                                                    Create &amp; Assign
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {!isFieldHidden('housingType') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('housingType', 'Housing Type')}</label>
                                        <input type="text" name="housingType" value={formData.housingType} onChange={handleChange} 
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="e.g., Wire cage, glass aquarium, multi-level enclosure" />
                                    </div>
                                )}

                                {!isFieldHidden('bedding') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('bedding', 'Bedding / Substrate')}</label>
                                        <input type="text" name="bedding" value={formData.bedding} onChange={handleChange} 
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="e.g., Aspen shavings, paper bedding, fleece liners" />
                                    </div>
                                )}
                                
                                {!isFieldHidden('enrichment') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Enrichment Items</label>
                                    <textarea name="enrichment" value={formData.enrichment} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Exercise wheel, tunnels, chew toys, hammocks" />
                                </div>
                                )}

                                {/* Enclosure Maintenance tracking ? powers Management view */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Maintenance Date</label>
                                        <input type="date" name="lastMaintenanceDate" value={formData.lastMaintenanceDate || ''} onChange={handleChange}
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Every (days)</label>
                                        <input type="number" name="maintenanceFrequencyDays" value={formData.maintenanceFrequencyDays || ''} onChange={handleChange}
                                            min="1" className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                            placeholder="e.g. 7 = weekly, 30 = monthly" />
                                    </div>
                                </div>

                                {/* Enclosure Care Tasks ? flexible recurring tasks for enclosure maintenance */}
                                <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-sm font-medium text-gray-700">Enclosure Care Tasks</label>
                                        <span className="text-xs text-gray-400">Deep clean, spot clean, water change, etc.</span>
                                    </div>
                                    {(formData.careTasks || []).length === 0 ? (
                                        <p className="text-xs text-gray-400">No enclosure care tasks yet.</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {(formData.careTasks || []).map((task, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 rounded px-2 py-1.5">
                                                    <span className="flex-1 font-medium text-gray-700">{task.taskName}</span>
                                                    {task.frequencyDays && <span className="text-xs text-gray-400">Every {task.frequencyDays}d</span>}
                                                    {task.lastDoneDate && <span className="text-xs text-gray-400">Last: {new Date(task.lastDoneDate).toLocaleDateString()}</span>}
                                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, careTasks: (prev.careTasks || []).filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600 p-0.5" title="Remove"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                        <input type="text" value={newCareTaskName} onChange={e => setNewCareTaskName(e.target.value)}
                                            placeholder="Task name (e.g. Deep clean, Spot clean, Water change)"
                                            className="flex-1 p-1.5 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                                        <div className="flex gap-2">
                                            <input type="number" value={newCareTaskFreq} onChange={e => setNewCareTaskFreq(e.target.value)}
                                                placeholder="Days" min="1"
                                                className="flex-1 sm:w-20 p-1.5 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                                            <button type="button" onClick={() => {
                                                if (!newCareTaskName.trim()) return;
                                                setFormData(prev => ({ ...prev, careTasks: [...(prev.careTasks || []), { taskName: newCareTaskName.trim(), frequencyDays: newCareTaskFreq ? Number(newCareTaskFreq) : null, lastDoneDate: null }] }));
                                                setNewCareTaskName(''); setNewCareTaskFreq('');
                                            }} className="px-3 py-1.5 bg-primary text-black text-sm font-medium rounded-md hover:bg-primary/80 whitespace-nowrap flex-shrink-0">+ Add</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3rd Section: Animal Care */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4" data-tutorial-target="animal-care-section">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><Droplets size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Animal Care</h3>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">Track recurring care tasks specific to this animal, such as health checks, grooming, weighing, and handling routines.</p>

                                {/* Animal Care Tasks ? flexible recurring tasks for animal care */}
                                <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-sm font-medium text-gray-700">Animal Care Tasks</label>
                                        <span className="text-xs text-gray-400">Weigh, nail trim, health check, handling, etc.</span>
                                    </div>
                                    {(formData.animalCareTasks || []).length === 0 ? (
                                        <p className="text-xs text-gray-400">No animal care tasks yet.</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {(formData.animalCareTasks || []).map((task, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 rounded px-2 py-1.5">
                                                    <span className="flex-1 font-medium text-gray-700">{task.taskName}</span>
                                                    {task.frequencyDays && <span className="text-xs text-gray-400">Every {task.frequencyDays}d</span>}
                                                    {task.lastDoneDate && <span className="text-xs text-gray-400">Last: {new Date(task.lastDoneDate).toLocaleDateString()}</span>}
                                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, animalCareTasks: (prev.animalCareTasks || []).filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600 p-0.5" title="Remove"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                        <input type="text" value={newAnimalCareTaskName} onChange={e => setNewAnimalCareTaskName(e.target.value)}
                                            placeholder="Task name (e.g. Weigh, Nail trim, Health check)"
                                            className="flex-1 p-1.5 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                                        <div className="flex gap-2">
                                            <input type="number" value={newAnimalCareTaskFreq} onChange={e => setNewAnimalCareTaskFreq(e.target.value)}
                                                placeholder="Days" min="1"
                                                className="flex-1 sm:w-20 p-1.5 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                                            <button type="button" onClick={() => {
                                                if (!newAnimalCareTaskName.trim()) return;
                                                setFormData(prev => ({ ...prev, animalCareTasks: [...(prev.animalCareTasks || []), { taskName: newAnimalCareTaskName.trim(), frequencyDays: newAnimalCareTaskFreq ? Number(newAnimalCareTaskFreq) : null, lastDoneDate: null }] }));
                                                setNewAnimalCareTaskName(''); setNewAnimalCareTaskFreq('');
                                            }} className="px-3 py-1.5 bg-primary text-black text-sm font-medium rounded-md hover:bg-primary/80 whitespace-nowrap flex-shrink-0">+ Add</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Animal Care Fields */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Handling Notes</label>
                                    <textarea name="handlingNotes" value={formData.handlingNotes || ''} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Prefers gentle handling, allow time to acclimate, hand-feeds well" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Socialization Notes</label>
                                    <textarea name="socializationNotes" value={formData.socializationNotes || ''} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Gets along with cage mates, needs solo time, enjoys interaction" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Care Requirements</label>
                                    <textarea name="specialCareRequirements" value={formData.specialCareRequirements || ''} onChange={handleChange} rows="3"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Requires daily medication, sensitive to stress, special diet needs" />
                                </div>
                            </div>
                        </div>

                        {/* 4th Section: Environment */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4" data-tutorial-target="environment-section">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><Thermometer size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Environment</h3>
                            <div className="space-y-4">
                                {!isFieldHidden('temperatureRange') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature Range</label>
                                    <input type="text" name="temperatureRange" value={formData.temperatureRange} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., 68-72?F, 20-22?C" />
                                </div>
                                )}

                                {!isFieldHidden('humidity') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Humidity</label>
                                    <input type="text" name="humidity" value={formData.humidity} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., 40-60%, 50%" />
                                </div>
                                )}

                                {!isFieldHidden('lighting') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Lighting</label>
                                    <input type="text" name="lighting" value={formData.lighting} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., 12:12 hour cycle, LED lights, UVB" />
                                </div>
                                )}

                                {!isFieldHidden('noise') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('noise', 'Noise Level')}</label>
                                        <input type="text" name="noise" value={formData.noise} onChange={handleChange} 
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="e.g., Quiet, moderate, high" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 5th Section: Exercise & Grooming */}
                        {(!isFieldHidden('groomingNeeds') || !isFieldHidden('sheddingLevel')) && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4" data-tutorial-target="exercise-grooming-section">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><Scissors size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Grooming</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!isFieldHidden('groomingNeeds') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('groomingNeeds', 'Grooming Needs')}</label>
                                    <select name="groomingNeeds" value={formData.groomingNeeds || ''} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        <option value="">Select...</option>
                                        {getFieldLabel('groomingNeeds', 'Grooming Needs').toLowerCase().includes('shed') ? <>
                                            <option value="Normal">Normal (clean sheds)</option>
                                            <option value="Occasional">Occasional stuck shed</option>
                                            <option value="Frequent">Frequent stuck shed (dysecdysis)</option>
                                            <option value="Requires soaking">Requires soaking during shed</option>
                                        </> : <>
                                            <option value="Low">Low - minimal brushing</option>
                                            <option value="Moderate">Moderate - weekly grooming</option>
                                            <option value="High">High - daily brushing</option>
                                            <option value="Professional">Professional - regular groomer</option>
                                        </>}
                                    </select>
                                </div>
                                )}
                                {!isFieldHidden('sheddingLevel') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('sheddingLevel', 'Shedding Level')}</label>
                                    <select name="sheddingLevel" value={formData.sheddingLevel || ''} onChange={handleChange} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        <option value="">Select...</option>
                                        <option value="None">None - hypoallergenic</option>
                                        <option value="Low">Low</option>
                                        <option value="Moderate">Moderate</option>
                                        <option value="Heavy">Heavy</option>
                                        <option value="Seasonal">Seasonal blowouts</option>
                                    </select>
                                </div>
                                )}
                            </div>
                        </div>
                        )}
                    </div>
                )}

                {/* Tab 10: Behavior */}
                {activeTab === 10 && (
                    <div className="space-y-6">
                        {/* Behavior */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><MessageSquare size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Behavior</h3>
                            <div className="space-y-4" data-tutorial-target="behavior-items-section">
                                {!isFieldHidden('temperament') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperament</label>
                                    <input type="text" name="temperament" value={formData.temperament} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Friendly, skittish, aggressive, calm" />
                                </div>
                                )}
                                
                                {!isFieldHidden('handlingTolerance') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Handling Tolerance</label>
                                    <input type="text" name="handlingTolerance" value={formData.handlingTolerance} onChange={handleChange} 
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Enjoys handling, tolerates briefly, avoids contact" />
                                </div>
                                )}
                                
                                {!isFieldHidden('socialStructure') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Social Structure</label>
                                    <textarea name="socialStructure" value={formData.socialStructure} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Lives with 2 cage mates, solitary, dominant in group" />
                                </div>
                                )}
                            </div>
                        </div>

                        {/* Activity */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><Activity size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Activity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {!isFieldHidden('activityCycle') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Cycle</label>
                                <select name="activityCycle" value={formData.activityCycle} onChange={handleChange} data-tutorial-target="activity-pattern-select"
                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                    <option value="">Select Activity Pattern</option>
                                    <option value="Diurnal">Diurnal (Active during day)</option>
                                    <option value="Nocturnal">Nocturnal (Active at night)</option>
                                    <option value="Crepuscular">Crepuscular (Active dawn/dusk)</option>
                                </select>
                            </div>
                            )}
                            {!isFieldHidden('exerciseRequirements') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{getFieldLabel('exerciseRequirements', 'Exercise Requirements')}</label>
                                <select name="exerciseRequirements" value={formData.exerciseRequirements || ''} onChange={handleChange} 
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                    <option value="">Select...</option>
                                    <option value="Low">Low</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="High">High</option>
                                    <option value="Very High">Very High</option>
                                </select>
                            </div>
                            )}
                            {!isFieldHidden('dailyExerciseMinutes') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{getFieldLabel('dailyExerciseMinutes', 'Daily Exercise (minutes)')}</label>
                                <input type="number" name="dailyExerciseMinutes" value={formData.dailyExerciseMinutes || ''} onChange={handleChange} 
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                    placeholder="e.g., 60" />
                            </div>
                            )}
                            </div>

                            {/* Training & Behavior - Template controlled */}
                            {(!isFieldHidden('trainingLevel') || !isFieldHidden('trainingDisciplines') || !isFieldHidden('workingRole') || !isFieldHidden('certifications')) && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {!isFieldHidden('trainingLevel') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">{getFieldLabel('trainingLevel', 'Training Level')}</label>
                                            <select name="trainingLevel" value={formData.trainingLevel || ''} onChange={handleChange} 
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                                <option value="">Select...</option>
                                                <option value="None">None</option>
                                                <option value="Basic">Basic obedience</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                                <option value="Competition">Competition level</option>
                                            </select>
                                        </div>
                                        )}
                                        {!isFieldHidden('trainingDisciplines') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">{getFieldLabel('trainingDisciplines', 'Training Disciplines')}</label>
                                            <input type="text" name="trainingDisciplines" value={formData.trainingDisciplines || ''} onChange={handleChange} 
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                placeholder="e.g., Agility, Rally, Herding, Nosework" />
                                        </div>
                                        )}
                                        {!isFieldHidden('workingRole') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">{getFieldLabel('workingRole', 'Working Role')}</label>
                                            <input type="text" name="workingRole" value={formData.workingRole || ''} onChange={handleChange} 
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                                placeholder="e.g., Service Dog, Therapy, SAR" />
                                        </div>
                                        )}
                                    </div>
                                    {!isFieldHidden('certifications') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{getFieldLabel('certifications', 'Certifications')}</label>
                                        <textarea name="certifications" value={formData.certifications || ''} onChange={handleChange} rows="2"
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="e.g., CGC, TDI, AKC titles" />
                                    </div>
                                    )}
                                </>
                            )}
                            {(!isFieldHidden('crateTrained') || !isFieldHidden('litterTrained') || !isFieldHidden('leashTrained') || !isFieldHidden('freeFlightTrained')) && (
                            <div className="flex flex-wrap gap-6 pt-2">
                                {!isFieldHidden('crateTrained') && (
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" name="crateTrained" checked={formData.crateTrained || false} onChange={handleChange} 
                                        className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
                                    <span className="text-sm font-medium text-gray-700">{getFieldLabel('crateTrained', 'Crate Trained')}</span>
                                </div>
                                )}
                                {!isFieldHidden('litterTrained') && (
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" name="litterTrained" checked={formData.litterTrained || false} onChange={handleChange} 
                                        className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
                                    <span className="text-sm font-medium text-gray-700">{getFieldLabel('litterTrained', 'Litter Trained')}</span>
                                </div>
                                )}
                                {!isFieldHidden('leashTrained') && (
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" name="leashTrained" checked={formData.leashTrained || false} onChange={handleChange} 
                                        className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
                                    <span className="text-sm font-medium text-gray-700">{getFieldLabel('leashTrained', 'Leash Trained')}</span>
                                </div>
                                )}
                                {!isFieldHidden('freeFlightTrained') && (
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" name="freeFlightTrained" checked={formData.freeFlightTrained || false} onChange={handleChange} 
                                        className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
                                    <span className="text-sm font-medium text-gray-700">{getFieldLabel('freeFlightTrained', 'Free Flight Trained')}</span>
                                </div>
                                )}
                            </div>
                            )}
                        </div>

                        {/* Known Issues */}
                        {(!isFieldHidden('behavioralIssues') || !isFieldHidden('biteHistory') || !isFieldHidden('reactivityNotes')) && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><AlertTriangle size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Known Issues</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!isFieldHidden('behavioralIssues') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('behavioralIssues', 'Behavioral Issues')}</label>
                                    <textarea name="behavioralIssues" value={formData.behavioralIssues || ''} onChange={handleChange} rows="2"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Resource guarding, separation anxiety" />
                                </div>
                                )}
                                {!isFieldHidden('biteHistory') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('biteHistory', 'Bite History')}</label>
                                    <textarea name="biteHistory" value={formData.biteHistory || ''} onChange={handleChange} rows="2"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="Any bite incidents, context, and outcome" />
                                </div>
                                )}
                            </div>
                            {!isFieldHidden('reactivityNotes') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{getFieldLabel('reactivityNotes', 'Reactivity Notes')}</label>
                                <textarea name="reactivityNotes" value={formData.reactivityNotes || ''} onChange={handleChange} rows="2"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                    placeholder="Triggers, thresholds, management strategies" />
                            </div>
                            )}
                        </div>
                        )}

                    </div>
                )}

                {/* Tab 11: Notes */}
                {activeTab === 11 && (
                    <div className="space-y-6">
                        {!isFieldHidden('remarks') && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200" data-tutorial-target="remarks-section">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><FileText size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Remarks & Notes</h3>
                            <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="5"
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                placeholder="General notes, observations, and records..." />
                        </div>
                        )}
                    </div>
                )}

                {/* Tab 14: End of Life */}
                {activeTab === 14 && (
                    <div className="space-y-6">
                        {/* End of Life */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><Feather size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Death</label>
                                    <DatePicker value={formData.deceasedDate || ''} onChange={(e) => handleChange({ target: { name: 'deceasedDate', value: e.target.value } })} data-tutorial-target="date-of-death-input"
                                        maxDate={new Date()}
                                        className="p-2" />
                                </div>
                                
                                {!isFieldHidden('causeOfDeath') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cause of Death</label>
                                    <input type="text" name="causeOfDeath" value={formData.causeOfDeath} onChange={handleChange} data-tutorial-target="cause-of-death-input"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Natural causes, illness, injury" />
                                </div>
                                )}
                                
                                {!isFieldHidden('necropsyResults') && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Necropsy Results</label>
                                    <textarea name="necropsyResults" value={formData.necropsyResults} onChange={handleChange} rows="3" data-tutorial-target="necropsy-results-textarea"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="Post-mortem examination findings..." />
                                </div>
                                )}

                                {!isFieldHidden('endOfLifeCareNotes') && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('endOfLifeCareNotes', 'End of Life Care Notes')}</label>
                                        <textarea name="endOfLifeCareNotes" value={formData.endOfLifeCareNotes || ''} onChange={handleChange} rows="2"
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="Wishes for cremation, burial, memorial" />
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}

                {/* Tab 12: Show */}
                {activeTab === 12 && (
                    <div className="space-y-6">
                        {/* Show Titles & Ratings */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4" data-tutorial-target="show-titles-section">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><Medal size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Show Titles & Ratings</h3>
                            <div className="space-y-4">
                                {!isFieldHidden('showTitles') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Show Titles</label>
                                    <textarea name="showTitles" value={formData.showTitles || ''} onChange={handleChange} rows="3"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Champion (CH), Grand Champion (GCH), Best in Show" />
                                    <p className="text-xs text-gray-500 mt-1">List official show titles earned</p>
                                </div>
                                )}
                                
                                {!isFieldHidden('showRatings') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Show Ratings</label>
                                    <textarea name="showRatings" value={formData.showRatings || ''} onChange={handleChange} rows="3"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="e.g., Excellent, Very Good, ratings from shows" />
                                    <p className="text-xs text-gray-500 mt-1">Ratings and scores from shows or competitions</p>
                                </div>
                                )}
                                
                                {!isFieldHidden('judgeComments') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Judge Comments</label>
                                    <textarea name="judgeComments" value={formData.judgeComments || ''} onChange={handleChange} rows="4" data-tutorial-target="judge-comments-textarea"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                        placeholder="Notable comments from judges at shows or competitions" />
                                </div>
                                )}
                            </div>
                        </div>

                        {/* Working & Performance - Template controlled */}
                        {!isFieldHidden('workingTitles') && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2"><Target size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Working & Performance</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('workingTitles', 'Working Titles')}</label>
                                        <textarea name="workingTitles" value={formData.workingTitles || ''} onChange={handleChange} rows="3"
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="e.g., CGC (Canine Good Citizen), TKN (Trick Dog Novice), HT (Herding Tested)" />
                                        <p className="text-xs text-gray-500 mt-1">Working, obedience, agility, or performance titles</p>
                                    </div>
                                    {!isFieldHidden('performanceScores') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('performanceScores', 'Performance Scores')}</label>
                                        <textarea name="performanceScores" value={formData.performanceScores || ''} onChange={handleChange} rows="3"
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                                            placeholder="e.g., Agility Q scores, obedience scores, rally scores" />
                                        <p className="text-xs text-gray-500 mt-1">Scores from performance events and trials</p>
                                    </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 13: Legal & Documentation */}
                {activeTab === 13 && (
                    <div className="space-y-6">
                        {/* Licensing */}
                        {(!isFieldHidden('licenseNumber') || !isFieldHidden('licenseJurisdiction')) && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><Key size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Licensing & Permits</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!isFieldHidden('licenseNumber') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('licenseNumber', 'License Number')}</label>
                                    <input type="text" name="licenseNumber" value={formData.licenseNumber || ''} onChange={handleChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        placeholder={getFieldLabel('licenseNumber', 'License / permit number')} />
                                </div>
                                )}
                                {!isFieldHidden('licenseJurisdiction') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('licenseJurisdiction', 'License Jurisdiction')}</label>
                                    <input type="text" name="licenseJurisdiction" value={formData.licenseJurisdiction || ''} onChange={handleChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        placeholder="e.g., Los Angeles County" />
                                </div>
                                )}
                            </div>
                        </div>
                        )}

                        {/* Insurance & Legal Status */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4" data-tutorial-target="legal-admin-section">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><ClipboardList size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Legal / Administrative</h3>
                            <div className="space-y-4">
                                {!isFieldHidden('insurance') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('insurance', 'Insurance')}</label>
                                    <textarea name="insurance" value={formData.insurance || ''} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        placeholder="e.g., Pet insurance policy details, provider, coverage" />
                                </div>
                                )}
                                {!isFieldHidden('legalStatus') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{getFieldLabel('legalStatus', 'Legal Status')}</label>
                                    <textarea name="legalStatus" value={formData.legalStatus || ''} onChange={handleChange} rows="2"
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        placeholder="e.g., Ownership documents, permits, CITES registration" />
                                </div>
                                )}
                            </div>
                        </div>

                        {/* Restrictions */}
                        {(!isFieldHidden('breedingRestrictions') || !isFieldHidden('exportRestrictions')) && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><Ban size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Restrictions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!isFieldHidden('breedingRestrictions') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('breedingRestrictions', 'Breeding Restrictions')}</label>
                                    <textarea name="breedingRestrictions" value={formData.breedingRestrictions || ''} onChange={handleChange} rows="2"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        placeholder="Limited registration, spay/neuter contract" />
                                </div>
                                )}
                                {!isFieldHidden('exportRestrictions') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('exportRestrictions', 'Export Restrictions')}</label>
                                    <textarea name="exportRestrictions" value={formData.exportRestrictions || ''} onChange={handleChange} rows="2"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                        placeholder="Country restrictions, registry limitations" />
                                </div>
                                )}
                            </div>
                        </div>
                        )}

                        {/* Legal Documents */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4"><FileText size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Legal Documents</h3>
                            <div className="space-y-3">
                                {/* Document List */}
                                {formData.legalDocuments && formData.legalDocuments.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.legalDocuments.map((doc, idx) => (
                                            <div key={doc.id || idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <FileText size={16} className="text-gray-400 flex-shrink-0" />
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline truncate">
                                                        {doc.filename}
                                                    </a>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(f => ({
                                                        ...f,
                                                        legalDocuments: f.legalDocuments.filter((_, i) => i !== idx)
                                                    }))}
                                                    className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {(!formData.legalDocuments || formData.legalDocuments.length === 0) && (
                                    <p className="text-sm text-gray-400 italic">No documents uploaded yet</p>
                                )}
                                {/* Upload Button */}
                                <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                                    <Upload size={14} />
                                    Upload Document (PDF/DOC/DOCX)
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.pages"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.apple.pages'];
                                            if (!validTypes.includes(file.type)) {
                                                showModalMessage('Invalid File Type', 'Please upload a PDF, DOC, DOCX, or PAGES file');
                                                e.target.value = '';
                                                return;
                                            }
                                            if (file.size > 10 * 1024 * 1024) {
                                                showModalMessage('File Too Large', 'Maximum file size is 10MB');
                                                e.target.value = '';
                                                return;
                                            }
                                            // Upload file
                                            const fd = new FormData();
                                            fd.append('file', file);
                                            setLoadingTemplate(true); // Reuse loading state
                                            axios.post(`${API_BASE_URL}/upload-document`, fd, {
                                                headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'multipart/form-data' }
                                            }).then(res => {
                                                setFormData(f => ({
                                                    ...f,
                                                    legalDocuments: [
                                                        ...(f.legalDocuments || []),
                                                        {
                                                            id: Math.random().toString(36).substr(2, 9),
                                                            filename: file.name,
                                                            url: res.data.url,
                                                            uploadedAt: new Date().toISOString()
                                                        }
                                                    ]
                                                }));
                                                e.target.value = '';
                                            }).catch(err => {
                                                showModalMessage('Upload Failed', err.response?.data?.message || 'Failed to upload document');
                                                e.target.value = '';
                                            }).finally(() => setLoadingTemplate(false));
                                        }}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 5: Pedigree */}
                {(() => {
                    // Hoisted so the CTC modal (rendered outside the tab guard) can always call linkAnimal
                    const mpEmptySlot = () => ({ mode: 'ctc', ctcId: '', prefix: '', name: '', suffix: '', variety: '', genCode: '', birthDate: '', breederName: '', gender: '', imageUrl: '', notes: '' });
                    const mpToSlot = (a) => {
                        const variety = ['color','coatPattern','coat','earset','phenotype','morph','markings'].map(k => a[k]).filter(Boolean).join(' ');
                        return { mode: 'ctc', ctcId: a.id_public, prefix: a.prefix || '', name: a.name || '', suffix: a.suffix || '', variety, genCode: a.geneticCode || '', birthDate: a.birthDate ? a.birthDate.slice(0,10) : '', breederName: a.breederName || a.manualBreederName || '', gender: a.gender || '', imageUrl: a.imageUrl || a.photoUrl || '', notes: '' };
                    };
                    const mpFetchByCtc = async (id) => {
                        try {
                            const res = await axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${authToken}` } });
                            return res.data || null;
                        } catch { return null; }
                    };
                    const MP_SLOT_CHILDREN = {
                        sire:    { father: 'sireSire',    mother: 'sireDam'    },
                        dam:     { father: 'damSire',     mother: 'damDam'     },
                        sireSire:{ father: 'sireSireSire',mother: 'sireSireDam'},
                        sireDam: { father: 'sireDamSire', mother: 'sireDamDam' },
                        damSire: { father: 'damSireSire', mother: 'damSireDam' },
                        damDam:  { father: 'damDamSire',  mother: 'damDamDam'  },
                    };
                    const mpLinkAnimal = async (slotKey, a) => {
                        const updates = { [slotKey]: mpToSlot(a) };
                        const queue = [{ animal: a, slot: slotKey }];
                        while (queue.length) {
                            const { animal: cur, slot } = queue.shift();
                            const children = MP_SLOT_CHILDREN[slot];
                            if (!children) continue;
                            const fatherId = cur.fatherId_public || cur.sireId_public;
                            const motherId = cur.motherId_public || cur.damId_public;
                            if (fatherId) { const f = await mpFetchByCtc(fatherId); if (f) { updates[children.father] = mpToSlot(f); queue.push({ animal: f, slot: children.father }); } }
                            if (motherId) { const m = await mpFetchByCtc(motherId); if (m) { updates[children.mother] = mpToSlot(m); queue.push({ animal: m, slot: children.mother }); } }
                        }
                        setMpEditForm(f => ({ ...f, ...updates }));
                        // Sync canonical parent fields so the overview shows the linked parent after save
                        if (slotKey === 'sire') {
                            setFormData(prev => ({ ...prev, fatherId_public: a.id_public }));
                            pedigreeRef.current.father = a.id_public;
                            pedigreeRef.current.fatherBackendId = a._id || null;
                        } else if (slotKey === 'dam') {
                            setFormData(prev => ({ ...prev, motherId_public: a.id_public }));
                            pedigreeRef.current.mother = a.id_public;
                            pedigreeRef.current.motherBackendId = a._id || null;
                        }
                    };

                    // CTC selector modal ? always rendered so it works regardless of activeTab
                    const ctcModal = mpCTCOpenSlot ? (
                        <ParentSearchModal
                            title={mpCTCOpenSlot.endsWith('Sire') || mpCTCOpenSlot === 'sire' ? 'Sire' : 'Dam'}
                            currentId={animalToEdit?.id_public}
                            onSelect={async (a) => { setMpCTCOpenSlot(null); if (a) await mpLinkAnimal(mpCTCOpenSlot, a); }}
                            onClose={() => setMpCTCOpenSlot(null)}
                            authToken={authToken}
                            showModalMessage={showModalMessage}
                            API_BASE_URL={API_BASE_URL}
                            X={X}
                            Search={Search}
                            Loader2={Loader2}
                            LoadingSpinner={LoadingSpinner}
                            requiredGender={mpCTCOpenSlot.endsWith('Sire') || mpCTCOpenSlot === 'sire' ? 'Male' : 'Female'}
                            species={formData.species}
                        />
                    ) : null;

                    if (activeTab !== 5) return ctcModal;

                    const getSlot = (key) => mpEditForm[key] || mpEmptySlot();
                    const setSlotField = (key, field, val) => setMpEditForm(f => ({ ...f, [key]: { ...(f[key] || mpEmptySlot()), [field]: val } }));

                    const renderEditSlot = (slotKey, label, sideColor) => {
                        const d = getSlot(slotKey);
                        const isSire = slotKey === 'sire' || slotKey.endsWith('Sire');
                        const isCTC = d.mode === 'ctc';
                        const isParent = slotKey === 'sire' || slotKey === 'dam';
                        const bdr = isSire ? 'border-blue-200 bg-blue-50/40' : 'border-pink-200 bg-pink-50/40';
                        const lbl = isSire ? 'text-blue-500' : 'text-pink-500';

                        return (
                            <div key={slotKey} className={`rounded-lg border ${isParent ? 'p-4' : 'p-3'} space-y-2 text-xs ${bdr}`}>
                                <div className="flex items-center justify-between">
                                    <p className={`${isParent ? 'text-xs' : 'text-[10px]'} font-bold uppercase tracking-widest ${lbl}`}>{label}</p>
                                    <div className="flex rounded border border-gray-300 overflow-hidden text-[10px]">
                                        <button type="button" onClick={() => setSlotField(slotKey, 'mode', 'manual')}
                                            className={`px-2 py-0.5 transition-colors ${!isCTC ? 'bg-gray-200 font-semibold text-gray-800' : 'text-gray-400 hover:bg-gray-100'}`}>Manual</button>
                                        <button type="button" onClick={() => setSlotField(slotKey, 'mode', 'ctc')}
                                            className={`px-2 py-0.5 transition-colors ${isCTC ? 'bg-primary font-semibold text-black' : 'text-gray-400 hover:bg-gray-100'}`}>Link CTC</button>
                                    </div>
                                </div>

                                {isCTC ? (
                                    d.ctcId ? (
                                        <div className="space-y-1.5">
                                            <div className={`flex items-center gap-3 ${isParent ? 'p-3' : 'p-2'} bg-white rounded border border-primary/30`}>
                                                {d.imageUrl
                                                    ? <img src={d.imageUrl} className={`${isParent ? 'w-16 h-16' : 'w-10 h-10'} rounded-full object-cover flex-shrink-0`} alt="" />
                                                    : <div className={`${isParent ? 'w-16 h-16' : 'w-10 h-10'} rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}><Cat size={isParent ? 22 : 16} className="text-gray-300" /></div>
                                                }
                                                <div className="flex-1 min-w-0">
                                                    <p className={`${isParent ? 'text-sm' : 'text-xs'} font-semibold text-gray-800 truncate`}>{[d.prefix,d.name,d.suffix].filter(Boolean).join(' ')}</p>
                                                    {d.variety && <p className={`${isParent ? 'text-xs' : 'text-[11px]'} text-gray-500 truncate`}>{d.variety}</p>}
                                                    <p className="text-[10px] font-mono text-gray-500">{d.ctcId}</p>
                                                </div>
                                            </div>
                                            <button type="button"
                                                onClick={() => {
                                                    setMpEditForm(f => ({ ...f, [slotKey]: { ...f[slotKey], mode: 'ctc', ctcId: '' } }));
                                                    if (slotKey === 'sire') {
                                                        setFormData(prev => ({ ...prev, fatherId_public: null }));
                                                        pedigreeRef.current.father = null;
                                                        pedigreeRef.current.fatherBackendId = null;
                                                    } else if (slotKey === 'dam') {
                                                        setFormData(prev => ({ ...prev, motherId_public: null }));
                                                        pedigreeRef.current.mother = null;
                                                        pedigreeRef.current.motherBackendId = null;
                                                    }
                                                }}
                                                className="text-[10px] text-red-400 hover:text-red-600 transition-colors">Unlink</button>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <button type="button" onClick={() => setMpCTCOpenSlot(slotKey)}
                                                className={`w-full px-2 ${isParent ? 'py-4 text-sm' : 'py-1.5 text-xs'} border border-dashed border-primary/40 rounded text-primary hover:bg-primary/5 transition flex items-center gap-1.5 justify-center`}>
                                                <Search size={isParent ? 15 : 12} /> Search CTC Animal?
                                            </button>
                                        </div>
                                    )
                                ) : (
                                    <>
                                        <input placeholder="Name" value={d.name || ''} onChange={e => setSlotField(slotKey, 'name', e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-primary focus:border-primary" />
                                        <input placeholder="Variety / Morph" value={d.variety || ''} onChange={e => setSlotField(slotKey, 'variety', e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-primary focus:border-primary" />
                                        <input placeholder="Genetic Code" value={d.genCode || ''} onChange={e => setSlotField(slotKey, 'genCode', e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:ring-1 focus:ring-primary focus:border-primary" />
                                        <input type="date" value={d.birthDate || ''} onChange={e => setSlotField(slotKey, 'birthDate', e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-primary focus:border-primary" />
                                        <input placeholder="Breeder Name" value={d.breederName || ''} onChange={e => setSlotField(slotKey, 'breederName', e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-primary focus:border-primary" />
                                        <div className="flex items-center gap-2">
                                            {d.imageUrl && <img src={d.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-200" />}
                                            <label className={`flex-1 flex items-center gap-1.5 px-2 py-1 border border-gray-300 rounded text-xs cursor-pointer bg-white hover:bg-gray-50 transition ${mpSlotUploading[slotKey] ? 'opacity-50 pointer-events-none' : ''}`}>
                                                {mpSlotUploading[slotKey] ? <><Loader2 size={11} className="animate-spin" /> Uploading?</> : <><Camera size={11} /> {d.imageUrl ? 'Change Photo' : 'Add Photo'}</>}
                                                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    e.target.value = '';
                                                    if (!file) return;
                                                    setMpSlotUploading(p => ({ ...p, [slotKey]: true }));
                                                    try {
                                                        let blob;
                                                        try { blob = await compressImageWithWorker(file, 480 * 1024, { maxWidth: 1200, maxHeight: 1200, startQuality: 0.85 }); } catch { blob = null; }
                                                        if (!blob) { try { blob = await compressImageToMaxSize(file, 480 * 1024, { maxWidth: 1200, maxHeight: 1200 }); } catch { blob = await compressImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82 }); } }
                                                        const fd = new FormData();
                                                        fd.append('file', new File([blob], 'ancestor.jpg', { type: 'image/jpeg' }));
                                                        const up = await axios.post(`${API_BASE_URL}/upload`, fd, { headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'multipart/form-data' } });
                                                        setSlotField(slotKey, 'imageUrl', up.data.url);
                                                    } catch { showModalMessage('Upload failed', 'Could not upload ancestor image. Please try again.'); }
                                                    setMpSlotUploading(p => ({ ...p, [slotKey]: false }));
                                                }} />
                                            </label>
                                            {d.imageUrl && <button type="button" onClick={() => setSlotField(slotKey, 'imageUrl', '')} className="text-[10px] text-red-400 hover:text-red-600 transition-colors flex-shrink-0">Remove</button>}
                                        </div>

                                    </>
                                )}
                            </div>
                        );
                    };

                    return (<>
                        {ctcModal}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Dna size={18} className="text-orange-500" />
                                <h3 className="text-base font-semibold text-gray-700">Beta Pedigree</h3>
                            </div>
                            <p className="text-xs text-gray-400 -mt-3">This Beta Pedigree displays both linked CritterTrack ancestors (with CTC IDs) and manually entered ancestors. Only linked CritterTrack ancestry is used for COI calculations. Manual entries are for display/reference only and do not affect COI or the main pedigree chart. Changes are saved when you click Save Animal.</p>

                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 1 — Parents</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {renderEditSlot('sire', 'Sire', 'sire')}
                                    {renderEditSlot('dam', 'Dam', 'dam')}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 2 — Grandparents</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Paternal</p>
                                        {renderEditSlot('sireSire', 'Grandsire', 'sire')}
                                        {renderEditSlot('sireDam', 'Granddam', 'sire')}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest">Maternal</p>
                                        {renderEditSlot('damSire', 'Grandsire', 'dam')}
                                        {renderEditSlot('damDam', 'Granddam', 'dam')}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 3 — Great-Grandparents</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Paternal</p>
                                        <p className="text-[10px] text-gray-400 -mt-1 mb-0.5">via Grandsire</p>
                                        {renderEditSlot('sireSireSire', 'Great-Grandsire', 'sire')}
                                        {renderEditSlot('sireSireDam', 'Great-Granddam', 'sire')}
                                        <p className="text-[10px] text-gray-400 mt-1 mb-0.5">via Granddam</p>
                                        {renderEditSlot('sireDamSire', 'Great-Grandsire', 'sire')}
                                        {renderEditSlot('sireDamDam', 'Great-Granddam', 'sire')}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest">Maternal</p>
                                        <p className="text-[10px] text-gray-400 -mt-1 mb-0.5">via Grandsire</p>
                                        {renderEditSlot('damSireSire', 'Great-Grandsire', 'dam')}
                                        {renderEditSlot('damSireDam', 'Great-Granddam', 'dam')}
                                        <p className="text-[10px] text-gray-400 mt-1 mb-0.5">via Granddam</p>
                                        {renderEditSlot('damDamSire', 'Great-Grandsire', 'dam')}
                                        {renderEditSlot('damDamDam', 'Great-Granddam', 'dam')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>);
                })()}

                {/* Tab 15: Gallery */}
                {activeTab === 15 && (
                    <div className="space-y-4">
                        {!animalToEdit ? (
                            <div className="text-center py-12 text-gray-400 text-sm">Save this animal first to manage gallery photos.</div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700"><Images size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Photo Gallery</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">{editGalleryImages.length} / 20 photos</p>
                                    </div>
                                    {editGalleryImages.length < 20 && (
                                        <button
                                            type="button"
                                            onClick={() => galleryEditFileRef.current?.click()}
                                            disabled={galleryUploading}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                                        >
                                            {galleryUploading
                                                ? <><Loader2 size={14} className="animate-spin" /> Uploading?</>
                                                : <><Plus size={14} /> Add Photo</>
                                            }
                                        </button>
                                    )}
                                    <input
                                        ref={galleryEditFileRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            e.target.value = '';
                                            if (!file) return;
                                            setGalleryUploading(true);
                                            setGalleryUploadError(null);
                                            try {
                                                // Compress before uploading (target 480KB, under the 500KB server limit)
                                                let fileToUpload = file;
                                                try {
                                                    let compressedBlob = null;
                                                    try {
                                                        compressedBlob = await compressImageWithWorker(file, 480 * 1024, { maxWidth: 1920, maxHeight: 1920, startQuality: 0.85 });
                                                    } catch (_) { compressedBlob = null; }
                                                    if (!compressedBlob) {
                                                        try {
                                                            compressedBlob = await compressImageToMaxSize(file, 480 * 1024, { maxWidth: 1920, maxHeight: 1920, startQuality: 0.85 });
                                                        } catch (_) {
                                                            compressedBlob = await compressImageFile(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.82 });
                                                        }
                                                    }
                                                    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'gallery';
                                                    fileToUpload = new File([compressedBlob], `${baseName}.jpg`, { type: 'image/jpeg' });
                                                } catch (_) { /* compression failed ? try original */ }
                                                const fd = new FormData();
                                                fd.append('file', fileToUpload);
                                                const upRes = await axios.post(`${API_BASE_URL}/upload`, fd, {
                                                    headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'multipart/form-data' }
                                                });
                                                const galRes = await axios.post(`${API_BASE_URL}/animals/${animalToEdit.id_public}/gallery`, { url: upRes.data.url }, {
                                                    headers: { Authorization: `Bearer ${authToken}` }
                                                });
                                                setEditGalleryImages(galRes.data.extraImages);
                                            } catch (err) {
                                                setGalleryUploadError(err.response?.data?.message || 'Upload failed. Please try again.');
                                            } finally {
                                                setGalleryUploading(false);
                                            }
                                        }}
                                    />
                                </div>

                                {galleryUploadError && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                        <AlertCircle size={14} /> {galleryUploadError}
                                    </div>
                                )}

                                {editGalleryImages.length === 0 ? (
                                    <div className="text-center py-16 text-gray-400">
                                        <Camera size={48} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium">No extra photos yet</p>
                                        <p className="text-xs mt-1">Add up to 20 extra photos for this animal.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {editGalleryImages.map((url, idx) => (
                                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                                <img
                                                    src={url}
                                                    alt={`Gallery photo ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    title="Remove photo"
                                                    onClick={async () => {
                                                        if (!window.confirm('Remove this photo from the gallery?')) return;
                                                        try {
                                                            const galRes = await axios.delete(`${API_BASE_URL}/animals/${animalToEdit.id_public}/gallery`, {
                                                                headers: { Authorization: `Bearer ${authToken}` },
                                                                data: { url }
                                                            });
                                                            setEditGalleryImages(galRes.data.extraImages);
                                                        } catch (err) {
                                                            showModalMessage('Failed to remove photo: ' + (err.response?.data?.message || err.message), 'error');
                                                        }
                                                    }}
                                                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X size={12} />
                                                </button>
                                                <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] rounded px-1 py-0.5">#{idx + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
                
                {/* Submit/Delete Buttons (always visible outside tabs) */}
                <div className="mt-8 flex justify-between items-center border-t pt-4">
                    <div className="flex space-x-4">
                        <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2">
                            <ArrowLeft size={18} />
                            <span>Back to Profile</span>
                        </button>
                        {animalToEdit && onDelete && (
                            <button 
                                type="button"
                                data-tutorial-target="delete-animal-btn"
                                onClick={() => { 
                                    // Ownership logic:
                                    // - If I created it and still own it ? Can delete it
                                    // - If I created it but transferred it away ? Someone else owns it (I'd be in ViewOnly)
                                    // - If it was transferred TO me ? I own it but can only return it (not delete)
                                    
                                    // Check if this animal was transferred TO the current user
                                    const iWasTransferredThisAnimal = animalToEdit.originalOwnerId && animalToEdit.ownerId_public === userProfile?.id_public;
                                    
                                    const confirmMessage = iWasTransferredThisAnimal 
                                        ? `Return ${animalToEdit.name} to ${animalToEdit.breederName || 'the original breeder'}? This will remove the animal from your account.`
                                        : `Are you sure you want to delete ${animalToEdit.name}? This action cannot be undone.`;
                                    if(window.confirm(confirmMessage)) { 
                                        onDelete(animalToEdit.id_public, animalToEdit); 
                                    } 
                                }} 
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2"
                            > 
                                {(() => {
                                    const iWasTransferredThisAnimal = animalToEdit.originalOwnerId && animalToEdit.ownerId_public === userProfile?.id_public;
                                    return iWasTransferredThisAnimal ? <RotateCcw size={18} /> : <Trash2 size={18} />;
                                })()}
                                <span>{(() => {
                                    const iWasTransferredThisAnimal = animalToEdit.originalOwnerId && animalToEdit.ownerId_public === userProfile?.id_public;
                                    return iWasTransferredThisAnimal ? 'Return Animal' : 'Delete';
                                })()}</span> 
                            </button>
                        )}
                    </div>
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

export default AnimalForm;
export { PedigreeChart };
