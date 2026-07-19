import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    ArrowLeft, ClipboardList, Dna, FileText, Home, Hospital, Images, Clock, Shield, Pill, Microscope, Stethoscope, Scissors, MessageSquare, AlertTriangle, Activity, Cat,
    Lock, Palette, PlusCircle, Save, Tag, Trash2, TreeDeciduous, Egg, Brain, Trophy, FileCheck, Scale, X, User, Heart, Eye, EyeOff, Edit, Users, HeartPulse,
    Hash, Sparkles, Ruler, Sprout, Key, FolderOpen, Globe, Leaf, UtensilsCrossed, Droplets, CheckSquare,
    Thermometer, Feather, Medal, Target, Ban, Package, ScrollText, Link, Unlink, Baby, Bell, Plus, RotateCcw, Camera, Upload, Search, Star, ArrowRight,
    Loader2, ChevronDown, ChevronUp, ChevronRight, Info, AlertCircle, DollarSign,
} from 'lucide-react';
import DatePicker from '../DatePicker';
import { formatDate } from '../../utils/dateFormatter';
import { getCurrencySymbol } from '../../utils/locationUtils';
import AnimalImageUpload from '../AnimalImageUpload';
import GeneticCodeBuilder from '../GeneticCodeBuilder';

const LoadingSpinner = ({ message = 'Loading...' }) => (
    <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary-dark mr-2" size={24} />
        <span className="text-gray-600">{message}</span>
    </div>
);

// Utility functions
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

const AnimalImage = ({ src, alt = "Animal", className = "w-full h-full object-cover", iconSize = 24 }) => {
    const [imageError, setImageError] = useState(false);
    const [imageSrc, setImageSrc] = useState(src);

    useEffect(() => {
        setImageSrc(src);
        setImageError(false);
    }, [src]);

    const handleError = () => {
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

const parseJsonArrayField = (data) => {
    if (!data) return [];
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch (e) {
            return [];
        }
    }
    return Array.isArray(data) ? data.filter(Boolean) : [];
};

const getContactDisplayName = (contact) => {
    const personalName = contact?.personalName?.trim();
    const breederName = contact?.breederName?.trim();
    const prefix = contact?.prefix?.trim();
    const suffix = contact?.suffix?.trim();

    if (personalName && breederName) {
        return `${personalName} (${breederName})`;
    }
    if (personalName) {
        return [prefix, personalName, suffix].filter(Boolean).join(' ');
    }
    if (breederName) {
        return [prefix, breederName, suffix].filter(Boolean).join(' ');
    }
    return [prefix, personalName, suffix].filter(Boolean).join(' ') || 'Unnamed Contact';
};

const getContactInfoString = (contact) => {
    const addr = contact?.address || {};
    const parts = [addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean);
    return parts.join(', ');
};

const ContactDisplayField = ({ label, value, onEdit }) => (
    <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">{label}</label>
        <div
            onClick={onEdit}
            className="mt-1 flex justify-between items-center p-2.5 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer hover:border-primary"
        >
            <span className={`text-sm ${value ? "text-gray-900" : "text-gray-400"}`}>{value || `Click to assign ${label}`}</span>
            <Edit size={16} className="text-gray-400" />
        </div>
    </div>
);

const AssignContactModal = ({ isOpen, onClose, onSelect, target, API_BASE_URL, authToken }) => {
    if (!isOpen) return null;

    const [mode, setMode] = useState('user'); // 'user', 'contact', 'manual'
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [manualName, setManualName] = useState('');
    const [contacts, setContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(false);

    useEffect(() => {
        if (mode === 'contact' && contacts.length === 0) {
            setLoadingContacts(true);
            axios.get(`${API_BASE_URL}/contacts`, { headers: { Authorization: `Bearer ${authToken}` } })
                .then(res => setContacts(res.data || []))
                .catch(err => console.error(err))
                .finally(() => setLoadingContacts(false));
        }
    }, [mode, authToken, API_BASE_URL, contacts.length]);

    const handleUserSearch = async () => {
        if (!searchTerm.trim()) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(searchTerm.trim())}&limit=20`);
            setSearchResults(res.data || []);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Assign {target}</h3>
                </div>
                <div className="p-4 border-b flex gap-2">
                    <button type="button" onClick={() => setMode('user')} className={`px-3 py-1 text-sm rounded-full ${mode === 'user' ? 'bg-primary text-black' : 'bg-gray-200'}`}>Search User</button>
                    <button type="button" onClick={() => setMode('contact')} className={`px-3 py-1 text-sm rounded-full ${mode === 'contact' ? 'bg-primary text-black' : 'bg-gray-200'}`}>Select Contact</button>
                    <button type="button" onClick={() => setMode('manual')} className={`px-3 py-1 text-sm rounded-full ${mode === 'manual' ? 'bg-primary text-black' : 'bg-gray-200'}`}>Manual Entry</button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                    {mode === 'user' && (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or CTU ID" className="w-full p-2 border rounded-md" onKeyPress={e => e.key === 'Enter' && handleUserSearch()} />
                                <button type="button" onClick={handleUserSearch} disabled={loading} className="p-2 bg-primary rounded-md disabled:opacity-50">{loading ? <Loader2 className="animate-spin" /> : <Search />}</button>
                            </div>
                            <div className="space-y-1">
                                {searchResults.map(user => (
                                    <div key={user.id_public} onClick={() => onSelect({ name: user.breederName || user.personalName, userId: user.id_public })} className="p-2 border rounded-md hover:bg-gray-100 cursor-pointer">
                                        <p className="font-semibold">{user.breederName || user.personalName}</p>
                                        <p className="text-xs text-gray-500">{user.id_public}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {mode === 'contact' && (
                        <div className="space-y-1">
                            {loadingContacts ? <Loader2 className="animate-spin" /> : contacts.map(contact => (
                                <div key={contact._id} onClick={() => onSelect({ name: getContactDisplayName(contact), userId: contact.linkedCTUID, contactInfo: getContactInfoString(contact) })} className="p-2 border rounded-md hover:bg-gray-100 cursor-pointer">
                                    <p className="font-semibold">{getContactDisplayName(contact)}</p>
                                    {contact.linkedCTUID && <p className="text-xs text-gray-500">{contact.linkedCTUID}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                    {mode === 'manual' && (
                        <div className="space-y-2">
                            <input type="text" value={manualName} onChange={e => setManualName(e.target.value)} placeholder={`Enter ${target} name`} className="w-full p-2 border rounded-md" />
                            <button type="button" onClick={() => onSelect({ name: manualName })} className="w-full p-2 bg-primary rounded-md">Assign Name</button>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t">
                    <button type="button" onClick={onClose} className="w-full p-2 bg-gray-200 rounded-md">Cancel</button>
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
    requiredGender,
    species
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [localAnimals, setLocalAnimals] = useState([]);
    const [globalAnimals, setGlobalAnimals] = useState([]);
    const [loadingLocal, setLoadingLocal] = useState(false);
    const [loadingGlobal, setLoadingGlobal] = useState(false);
    const [scope, setScope] = useState('both'); // 'local' | 'global' | 'both'

    const SearchResultItem = ({ animal, isGlobal }) => {
        const imgSrc = animal.imageUrl || animal.photoUrl || null;

        return (
            <div
                className="flex items-center space-x-3 p-3 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect(animal)}
            >
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={24} />
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-gray-800">
                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">{animal.id_public}</p>
                    <p className="text-sm text-gray-600">
                        {animal.species} &bull; {animal.gender} &bull; {animal.status || 'Unknown'}
                    </p>
                </div>
                {isGlobal && <span className="text-xs text-black bg-primary px-2 py-1 rounded-full flex-shrink-0">Global</span>}
            </div>
        );
    };

    const handleSearch = async () => {
        setHasSearched(true);
        const trimmedSearchTerm = searchTerm.trim();
        if (!trimmedSearchTerm) return;

        const idMatch = trimmedSearchTerm.match(/^\s*(?:CTC?[- ]?)?(\d+)\s*$/i);
        const isIdSearch = !!idMatch;
        const idValue = isIdSearch ? `CTC${idMatch[1]}` : null;

        const genderQuery = requiredGender ? (Array.isArray(requiredGender) ? `&gender=${requiredGender.map(g => encodeURIComponent(g)).join('&gender=')}` : `&gender=${requiredGender}`) : '';
        const speciesQuery = species ? `&species=${encodeURIComponent(species)}` : '';

        setLoadingLocal(scope === 'local' || scope === 'both');
        setLoadingGlobal(scope === 'global' || scope === 'both');

        if (scope === 'local' || scope === 'both') {
            try {
                const localUrl = isIdSearch
                    ? `${API_BASE_URL}/animals?id_public=${encodeURIComponent(idValue)}`
                    : `${API_BASE_URL}/animals?name=${encodeURIComponent(trimmedSearchTerm)}${genderQuery}${speciesQuery}`;
                const localResponse = await axios.get(localUrl, { headers: { Authorization: `Bearer ${authToken}` } });
                setLocalAnimals(localResponse.data.filter(a => a.id_public !== currentId));
            } catch (error) {
                showModalMessage('Search Error', 'Failed to search your animals.');
                setLocalAnimals([]);
            } finally {
                setLoadingLocal(false);
            }
        }

        if (scope === 'global' || scope === 'both') {
            try {
                const globalUrl = isIdSearch
                    ? `${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(idValue)}`
                    : `${API_BASE_URL}/public/global/animals?name=${encodeURIComponent(trimmedSearchTerm)}${genderQuery}${speciesQuery}`;
                const globalResponse = await axios.get(globalUrl);
                setGlobalAnimals(globalResponse.data.filter(a => a.id_public !== currentId));
            } catch (error) {
                setGlobalAnimals([]);
            } finally {
                setLoadingGlobal(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-[100]">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title} Selector</h3>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">Search Scope:</span>
                        {['local', 'global', 'both'].map(s => (
                            <button key={s} type="button" onClick={() => setScope(s)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 ${scope === s ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Search by Name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-grow p-2 border border-gray-300 rounded-lg"
                        />
                        <button
                            type="button"
                            onClick={handleSearch}
                            disabled={loadingLocal || loadingGlobal || !searchTerm.trim()}
                            className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition flex items-center disabled:opacity-50"
                        >
                            {loadingLocal || loadingGlobal ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto space-y-4">
                    {loadingLocal ? <LoadingSpinner message="Searching your animals..." /> : localAnimals.length > 0 && (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Your Animals ({localAnimals.length})</h4>
                            {localAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={false} />)}
                        </div>
                    )}
                    {loadingGlobal ? <LoadingSpinner message="Searching global animals..." /> : globalAnimals.length > 0 && (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Global Animals ({globalAnimals.length})</h4>
                            {globalAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={true} />)}
                        </div>
                    )}
                    {hasSearched && !loadingLocal && !loadingGlobal && localAnimals.length === 0 && globalAnimals.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No animals found.</p>
                    )}
                </div>
                <div className="mt-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => onSelect(null)}
                        className="w-full text-sm text-gray-500 hover:text-red-500 transition"
                    >
                        Clear Selection
                    </button>
                </div>
            </div>
        </div>
    );
};

// Image Editor Modal with Rotate, Crop, Compress, Validate
const ImageEditorModal = ({ files, onComplete, onCancel }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [processedImages, setProcessedImages] = useState([]);
    const [rotation, setRotation] = useState(0);
    const [cropMode, setCropMode] = useState(false);
    const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 100, height: 100 });
    const [processing, setProcessing] = useState(false);
    const [fileSizeWarning, setFileSizeWarning] = useState('');
    const [imageBox, setImageBox] = useState(null); // rendered image position/size relative to preview container
    const imgRef = useRef(null);
    const previewContainerRef = useRef(null);
    const dragStateRef = useRef(null);

    const MAX_FILE_SIZE = 200 * 1024; // 200KB

    useEffect(() => {
        if (files.length > currentIndex && imgRef.current) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imgRef.current.src = e.target.result;
            };
            reader.readAsDataURL(files[currentIndex]);
            setRotation(0);
            setCropMode(false);
            setCropBox({ x: 0, y: 0, width: 100, height: 100 });
            setFileSizeWarning('');
        }
    }, [currentIndex, files]);

    const rotateImage = () => {
        setRotation((rot) => (rot + 90) % 360);
    };

    const getRotationStyle = () => ({
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center',
        transition: 'transform 0.3s ease'
    });

    // Recompute the rendered image's box relative to the preview container so the
    // crop overlay can be positioned/sized correctly (accounts for object-contain
    // scaling and CSS rotation transforms).
    const updateImageBox = useCallback(() => {
        if (!imgRef.current || !previewContainerRef.current) return;
        const imgRect = imgRef.current.getBoundingClientRect();
        const containerRect = previewContainerRef.current.getBoundingClientRect();
        if (imgRect.width === 0 || imgRect.height === 0) return;
        setImageBox({
            left: imgRect.left - containerRect.left,
            top: imgRect.top - containerRect.top,
            width: imgRect.width,
            height: imgRect.height,
        });
    }, []);

    useEffect(() => {
        // Rotation changes the visual bounding box (getBoundingClientRect reflects
        // the CSS transform), so recompute after the rotation transition settles.
        updateImageBox();
        const timeout = setTimeout(updateImageBox, 320);
        window.addEventListener('resize', updateImageBox);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', updateImageBox);
        };
    }, [rotation, currentIndex, updateImageBox]);

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const handleCropDragStart = (e, mode) => {
        e.preventDefault();
        e.stopPropagation();
        if (!imgRef.current) return;
        const imageRect = imgRef.current.getBoundingClientRect();
        dragStateRef.current = {
            mode,
            startCropBox: { ...cropBox },
            imageRect,
            startClientX: e.clientX,
            startClientY: e.clientY,
        };
        window.addEventListener('mousemove', handleCropDragMove);
        window.addEventListener('mouseup', handleCropDragEnd);
    };

    const handleCropDragMove = (e) => {
        const drag = dragStateRef.current;
        if (!drag || !drag.imageRect.width || !drag.imageRect.height) return;
        const { mode, startCropBox, imageRect, startClientX, startClientY } = drag;
        const dxPct = ((e.clientX - startClientX) / imageRect.width) * 100;
        const dyPct = ((e.clientY - startClientY) / imageRect.height) * 100;
        const MIN_SIZE = 5;

        if (mode === 'move') {
            const x = clamp(startCropBox.x + dxPct, 0, 100 - startCropBox.width);
            const y = clamp(startCropBox.y + dyPct, 0, 100 - startCropBox.height);
            setCropBox((prev) => ({ ...prev, x: Math.round(x), y: Math.round(y) }));
            return;
        }

        let left = startCropBox.x;
        let top = startCropBox.y;
        let right = startCropBox.x + startCropBox.width;
        let bottom = startCropBox.y + startCropBox.height;

        if (mode.includes('l')) left = clamp(startCropBox.x + dxPct, 0, right - MIN_SIZE);
        if (mode.includes('r')) right = clamp(right + dxPct, left + MIN_SIZE, 100);
        if (mode.includes('t')) top = clamp(startCropBox.y + dyPct, 0, bottom - MIN_SIZE);
        if (mode.includes('b')) bottom = clamp(bottom + dyPct, top + MIN_SIZE, 100);

        setCropBox({
            x: Math.round(left),
            y: Math.round(top),
            width: Math.round(right - left),
            height: Math.round(bottom - top),
        });
    };

    const handleCropDragEnd = () => {
        dragStateRef.current = null;
        window.removeEventListener('mousemove', handleCropDragMove);
        window.removeEventListener('mouseup', handleCropDragEnd);
    };

    useEffect(() => () => {
        window.removeEventListener('mousemove', handleCropDragMove);
        window.removeEventListener('mouseup', handleCropDragEnd);
    }, []);

    const processCurrentImage = async () => {
        const file = files[currentIndex];
        try {
            setProcessing(true);

            // Step 1: Rotate if needed
            let processedFile = file;
            if (rotation !== 0) {
                const rotatedBlob = await rotateImageFile(file, rotation);
                processedFile = new File([rotatedBlob], file.name, { type: file.type });
            }

            // Step 2: Crop if enabled
            if (cropMode) {
                const croppedBlob = await cropImageFile(processedFile, cropBox);
                processedFile = new File([croppedBlob], file.name, { type: 'image/jpeg' });
            }

            // Step 3: Compress
            const compressed = await compressImageFile(processedFile);
            const finalSize = compressed.size;

            // Step 4: Validate
            let warning = '';
            if (finalSize > MAX_FILE_SIZE) {
                warning = `⚠️ Image is ${(finalSize / 1024).toFixed(1)}KB - recommended max is 200KB`;
            }

            setProcessedImages((prev) => [
                ...prev,
                {
                    id: `processed-${Date.now()}-${Math.random()}`,
                    file: compressed,
                    url: URL.createObjectURL(compressed),
                    originalSize: file.size,
                    finalSize: finalSize,
                    warning: warning,
                }
            ]);

            // Move to next image or complete
            if (currentIndex < files.length - 1) {
                setCurrentIndex((i) => i + 1);
            } else {
                setProcessedImages((prev) => {
                    onComplete(prev);
                    return prev;
                });
            }
        } catch (error) {
            console.error('Image processing error:', error);
            setFileSizeWarning('Failed to process image');
        } finally {
            setProcessing(false);
        }
    };

    const rotateImageFile = (file, degrees) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const radians = (degrees * Math.PI) / 180;
                    const sin = Math.abs(Math.sin(radians));
                    const cos = Math.abs(Math.cos(radians));
                    canvas.width = img.height * sin + img.width * cos;
                    canvas.height = img.height * cos + img.width * sin;

                    const ctx = canvas.getContext('2d');
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    ctx.rotate(radians);
                    ctx.drawImage(img, -img.width / 2, -img.height / 2);

                    canvas.toBlob(resolve, 'image/jpeg', 0.85);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const cropImageFile = (file, cropBox) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const scaleX = img.width / 100;
                    const scaleY = img.height / 100;
                    canvas.width = cropBox.width * scaleX;
                    canvas.height = cropBox.height * scaleY;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(
                        img,
                        cropBox.x * scaleX,
                        cropBox.y * scaleY,
                        cropBox.width * scaleX,
                        cropBox.height * scaleY,
                        0,
                        0,
                        cropBox.width * scaleX,
                        cropBox.height * scaleY
                    );

                    canvas.toBlob(resolve, 'image/jpeg', 0.85);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const compressImageFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxWidth = 1200;
                    const maxHeight = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            const resultFile = new File([blob], file.name, { type: 'image/jpeg' });
                            resolve(resultFile);
                        },
                        'image/jpeg',
                        0.8
                    );
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const current = files[currentIndex];
    const progress = `${currentIndex + 1} / ${files.length}`;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Edit Image ({progress})</h2>
                    <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Preview */}
                    <div ref={previewContainerRef} className="relative bg-gray-100 rounded-lg p-4 flex items-center justify-center h-96 overflow-hidden">
                        <img
                            ref={imgRef}
                            style={getRotationStyle()}
                            className="max-w-full max-h-full object-contain"
                            alt="Preview"
                            onLoad={updateImageBox}
                        />
                        {cropMode && imageBox && (
                            <div
                                onMouseDown={(e) => handleCropDragStart(e, 'move')}
                                className="absolute border-2 border-primary bg-primary/10 cursor-move"
                                style={{
                                    left: imageBox.left + (cropBox.x / 100) * imageBox.width,
                                    top: imageBox.top + (cropBox.y / 100) * imageBox.height,
                                    width: (cropBox.width / 100) * imageBox.width,
                                    height: (cropBox.height / 100) * imageBox.height,
                                }}
                            >
                                <div
                                    onMouseDown={(e) => handleCropDragStart(e, 'tl')}
                                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-primary border-2 border-white rounded-full shadow cursor-nwse-resize"
                                />
                                <div
                                    onMouseDown={(e) => handleCropDragStart(e, 'tr')}
                                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-primary border-2 border-white rounded-full shadow cursor-nesw-resize"
                                />
                                <div
                                    onMouseDown={(e) => handleCropDragStart(e, 'bl')}
                                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-primary border-2 border-white rounded-full shadow cursor-nesw-resize"
                                />
                                <div
                                    onMouseDown={(e) => handleCropDragStart(e, 'br')}
                                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-primary border-2 border-white rounded-full shadow cursor-nwse-resize"
                                />
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        {/* Rotate */}
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-2">
                                Rotation: {rotation}°
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={rotateImage}
                                    disabled={processing}
                                    className="flex-1 px-3 py-2 bg-primary text-black rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={16} />
                                    Rotate 90°
                                </button>
                                <select
                                    value={rotation}
                                    onChange={(e) => setRotation(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value={0}>0°</option>
                                    <option value={90}>90°</option>
                                    <option value={180}>180°</option>
                                    <option value={270}>270°</option>
                                </select>
                            </div>
                        </div>

                        {/* Crop Toggle */}
                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={cropMode}
                                    onChange={(e) => setCropMode(e.target.checked)}
                                    disabled={processing}
                                    className="form-checkbox h-4 w-4 text-primary rounded"
                                />
                                <span className="text-xs font-medium text-gray-700">Enable Crop</span>
                            </label>
                        </div>

                        {/* Crop Controls */}
                        {cropMode && (
                            <div className="bg-white p-3 rounded border border-gray-200 space-y-2">
                                <p className="text-xs text-gray-500">Drag the corners or adjust dimensions:</p>
                                <div className="grid grid-cols-4 gap-2">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">X</label>
                                        <input
                                            type="number"
                                            value={cropBox.x}
                                            onChange={(e) => setCropBox({ ...cropBox, x: Math.max(0, parseInt(e.target.value)) })}
                                            min="0"
                                            max="100"
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">Y</label>
                                        <input
                                            type="number"
                                            value={cropBox.y}
                                            onChange={(e) => setCropBox({ ...cropBox, y: Math.max(0, parseInt(e.target.value)) })}
                                            min="0"
                                            max="100"
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">Width</label>
                                        <input
                                            type="number"
                                            value={cropBox.width}
                                            onChange={(e) => setCropBox({ ...cropBox, width: Math.min(100, parseInt(e.target.value)) })}
                                            min="10"
                                            max="100"
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">Height</label>
                                        <input
                                            type="number"
                                            value={cropBox.height}
                                            onChange={(e) => setCropBox({ ...cropBox, height: Math.min(100, parseInt(e.target.value)) })}
                                            min="10"
                                            max="100"
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* File Size Info */}
                    {current && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-800">
                                <strong>Original:</strong> {(current.size / 1024).toFixed(1)}KB →{' '}
                                <strong>After compression:</strong> ~100-150KB (estimated)
                            </p>
                            {fileSizeWarning && (
                                <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                                    <AlertTriangle size={14} />
                                    {fileSizeWarning}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={processCurrentImage}
                        disabled={processing}
                        className="px-4 py-2 bg-primary text-black rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
                    >
                        {processing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                {currentIndex === files.length - 1 ? 'Finish & Add to Gallery' : 'Next Image'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AssignEnclosureModal = ({ isOpen, onClose, onSelect, availableEnclosures, loadingEnclosures, API_BASE_URL, authToken, showModalMessage }) => {
    if (!isOpen) return null;

    const [mode, setMode] = useState('search'); // 'search' | 'create' | 'manual'
    const [searchTerm, setSearchTerm] = useState('');
    const [newEnclosureForm, setNewEnclosureForm] = useState({
        name: '',
        roomType: '',
        location: '',
        capacity: '',
        dimensions: { length: '', width: '', height: '', unit: 'cm' },
        temperatureRange: { min: '', max: '', unit: 'C' },
        humidityRange: { min: '', max: '' },
        description: ''
    });
    const [manualName, setManualName] = useState('');
    const [creatingEnclosure, setCreatingEnclosure] = useState(false);

    const handleCreateEnclosure = async () => {
        if (!newEnclosureForm.name.trim()) {
            showModalMessage('Validation Error', 'Enclosure name is required.');
            return;
        }

        setCreatingEnclosure(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/enclosures`, newEnclosureForm, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (response.data) {
                onSelect(response.data);
                onClose();
            }
        } catch (err) {
            console.error('Failed to create enclosure:', err);
            showModalMessage('Error', 'Failed to create enclosure. Please try again.');
        } finally {
            setCreatingEnclosure(false);
        }
    };

    const filteredEnclosures = availableEnclosures.filter(e => 
        e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-[95] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Assign Enclosure</h3>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                </div>

                <div className="flex gap-2 p-4 border-b">
                    <button
                        type="button"
                        onClick={() => { setMode('search'); setSearchTerm(''); }}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${mode === 'search' ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Search Existing
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('create'); setNewEnclosureForm({ name: '', roomType: '', location: '', capacity: '', dimensions: { length: '', width: '', height: '', unit: 'cm' }, temperatureRange: { min: '', max: '', unit: 'C' }, humidityRange: { min: '', max: '' }, description: '' }); }}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${mode === 'create' ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Create New
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('manual'); setManualName(''); }}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${mode === 'manual' ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Manual Entry
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {mode === 'search' && (
                        <>
                            <input
                                type="text"
                                placeholder="Search by name or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-2 px-3 text-sm border border-gray-300 rounded-md"
                            />
                            {loadingEnclosures && <p className="text-center text-gray-500 py-4">Loading enclosures...</p>}
                            {!loadingEnclosures && filteredEnclosures.length === 0 && <p className="text-center text-gray-500 py-4">No enclosures found</p>}
                            <div className="space-y-2">
                                {filteredEnclosures.map(enclosure => (
                                    <div
                                        key={enclosure.id}
                                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => {
                                            onSelect(enclosure);
                                            onClose();
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">{enclosure.name}</p>
                                                <p className="text-xs text-gray-500">{enclosure.location} • {enclosure.roomType || 'N/A'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-semibold text-gray-700">{enclosure.currentAnimals || 0}/{enclosure.capacity || '?'}</p>
                                                <p className="text-[11px] text-gray-500">Animals</p>
                                            </div>
                                        </div>
                                        {enclosure.description && <p className="text-xs text-gray-600 mt-1">{enclosure.description}</p>}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {mode === 'create' && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Enclosure Name *</label>
                                <input
                                    type="text"
                                    value={newEnclosureForm.name}
                                    onChange={(e) => setNewEnclosureForm({ ...newEnclosureForm, name: e.target.value })}
                                    className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                    placeholder="e.g., Aquatic Habitat A"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Room/Type</label>
                                    <input
                                        type="text"
                                        value={newEnclosureForm.roomType}
                                        onChange={(e) => setNewEnclosureForm({ ...newEnclosureForm, roomType: e.target.value })}
                                        className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                        placeholder="e.g., Tank, Cage, Vivarium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={newEnclosureForm.location}
                                        onChange={(e) => setNewEnclosureForm({ ...newEnclosureForm, location: e.target.value })}
                                        className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                        placeholder="e.g., Room 2, Shelf 1"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Capacity</label>
                                <input
                                    type="number"
                                    value={newEnclosureForm.capacity}
                                    onChange={(e) => setNewEnclosureForm({ ...newEnclosureForm, capacity: e.target.value })}
                                    className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                    placeholder="Max animals"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Dimensions (L x W x H)</label>
                                <div className="grid grid-cols-3 gap-2 items-end">
                                    <input
                                        type="number"
                                        value={newEnclosureForm.dimensions.length}
                                        onChange={(e) => setNewEnclosureForm({ ...newEnclosureForm, dimensions: { ...newEnclosureForm.dimensions, length: e.target.value } })}
                                        placeholder="Length"
                                        className="py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                    />
                                    <input
                                        type="number"
                                        value={newEnclosureForm.dimensions.width}
                                        onChange={(e) => setNewEnclosureForm({ ...newEnclosureForm, dimensions: { ...newEnclosureForm.dimensions, width: e.target.value } })}
                                        placeholder="Width"
                                        className="py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                    />
                                    <select
                                        value={newEnclosureForm.dimensions.unit}
                                        onChange={(e) => setNewEnclosureForm({ ...newEnclosureForm, dimensions: { ...newEnclosureForm.dimensions, unit: e.target.value } })}
                                        className="py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                    >
                                        <option value="cm">cm</option>
                                        <option value="in">in</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newEnclosureForm.description}
                                    onChange={(e) => setNewEnclosureForm({ ...newEnclosureForm, description: e.target.value })}
                                    className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md resize-none"
                                    rows="2"
                                    placeholder="Any notes about this enclosure..."
                                />
                            </div>
                        </div>
                    )}

                    {mode === 'manual' && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">Enter a custom enclosure name (will be stored locally):</p>
                            <input
                                type="text"
                                value={manualName}
                                onChange={(e) => setManualName(e.target.value)}
                                className="w-full py-2 px-3 text-sm border border-gray-300 rounded-md"
                                placeholder="e.g., Outdoor Pen, Temporary Setup"
                            />
                        </div>
                    )}
                </div>

                <div className="p-4 border-t flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (mode === 'create') {
                                handleCreateEnclosure();
                            } else if (mode === 'manual') {
                                if (!manualName.trim()) {
                                    showModalMessage('Validation Error', 'Please enter an enclosure name.');
                                    return;
                                }
                                onSelect({ name: manualName, isManual: true });
                                onClose();
                            }
                        }}
                        disabled={creatingEnclosure || (mode === 'manual' && !manualName.trim())}
                        className="flex-1 px-3 py-2 text-sm font-medium bg-primary text-black rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {creatingEnclosure ? (
                            <>
                                <Loader2 size={16} className="inline animate-spin mr-1" />
                                Creating...
                            </>
                        ) : (
                            'Confirm'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const FormSection = ({ title, icon, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <h3 className="text-base font-semibold text-gray-700 flex items-center gap-1.5">{icon}{title}</h3>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isOpen && <div className="mt-3 pt-3 border-t space-y-3">{children}</div>}
        </div>
    );
};

const AnimalFormTestModal = ({
    formTitle = "Create New Animal",
    animalToEdit,
    species,
    initialValues,
    onSave,
    onCancel,
    onDelete,
    authToken,
    API_BASE_URL,
    showModalMessage,
    userProfile,
    speciesConfigs,
    GENDER_OPTIONS = ['Male', 'Female', 'Intersex', 'Unknown'],
    STATUS_OPTIONS = ['Pet', 'Growout', 'Breeder', 'Available', 'Booked', 'Retired', 'Deceased', 'Rehomed', 'Unknown']
}) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignModalTarget, setAssignModalTarget] = useState(null); // 'breeder' or 'keeper'
    const [uploadingDocument, setUploadingDocument] = useState(false);
    const [breederInfo, setBreederInfo] = useState(null);
    const [parentSearchModalOpen, setParentSearchModalOpen] = useState(false);
    const [parentSearchModalConfig, setParentSearchModalConfig] = useState({});
    const [newBreedingRecord, setNewBreedingRecord] = useState({
        breedingMethod: 'Unknown',
        matingDate: '',
        mate: '',
        mateAnimalId: null,
        outcome: 'Unknown',
        birthEventDate: '',
        litterSizeBorn: '',
        notes: ''
    });
    const [mateInfo, setMateInfo] = useState(null);

    // Breeding fertility tracking states (21 fields)
    const [reproductiveStateOverride, setReproductiveStateOverride] = useState(null);
    
    // Section 2: Fertility Status
    const [currentReproductiveState, setCurrentReproductiveState] = useState({
        fertilityStatus: animalToEdit?.fertilityStatus || 'Unknown'
    });

    // Section 3: Reproductive Cycle (conditional - hidden if spayed/neutered)
    const [reproductiveCycle, setReproductiveCycle] = useState({
        lastReproductiveEventDate: animalToEdit?.lastReproductiveEventDate || '',
        reproductiveEventCycleLength: animalToEdit?.reproductiveEventCycleLength || '',
        currentReproductiveEventPhase: animalToEdit?.currentReproductiveEventPhase || 'Unknown'
    });

    // Section 4: Conception & Mating History (conditional)
    const [conceptionHistory, setConceptionHistory] = useState({
        lastConceptionDate: animalToEdit?.lastConceptionDate || '',
        successfulConceptionCount: animalToEdit?.successfulConceptionCount || '',
        unsuccessfulConceptionAttempts: animalToEdit?.unsuccessfulConceptionAttempts || ''
    });

    // Section 5: Pregnancy/Development Details (conditional)
    const [developmentDetails, setDevelopmentDetails] = useState({
        developmentPeriodStart: animalToEdit?.developmentPeriodStart || '',
        developmentPeriodLength: animalToEdit?.developmentPeriodLength || '',
        expectedDeliveryDate: animalToEdit?.expectedDeliveryDate || '',
        developmentMethod: animalToEdit?.developmentMethod || 'Natural'
    });

    // Section 6: Reproductive Outcomes & Nursing
    const [reproductiveOutcomes, setReproductiveOutcomes] = useState({
        totalOffspringProduced: animalToEdit?.totalOffspringProduced || '',
        viableOffspringCount: animalToEdit?.viableOffspringCount || '',
        reproductiveEventCount: animalToEdit?.reproductiveEventCount || '',
        reproductiveEventOutcome: animalToEdit?.reproductiveEventOutcome || 'Unknown',
        dependentCareEndDate: animalToEdit?.dependentCareEndDate || ''
    });

    // Section 7: Reproductive Health & Procedures
    const [reproductiveHealth, setReproductiveHealth] = useState({
        artificialReproductionMethod: animalToEdit?.artificialReproductionMethod || 'None',
        lastReproductiveInterventionDate: animalToEdit?.lastReproductiveInterventionDate || '',
        dependentCareRequired: animalToEdit?.dependentCareRequired || false,
        reproductiveHealthNotes: animalToEdit?.reproductiveHealthNotes || ''
    });

    // Override tracking
    const [reproductiveStateOverrideReason, setReproductiveStateOverrideReason] = useState('');
    const [newVaccination, setNewVaccination] = useState({ date: new Date().toISOString().substring(0, 10), name: '', notes: '' });
    const [newDeworming, setNewDeworming] = useState({ date: new Date().toISOString().substring(0, 10), medication: '', notes: '' });
    const [newParasiteControl, setNewParasiteControl] = useState({ date: new Date().toISOString().substring(0, 10), treatment: '', notes: '' });
    const [newProcedure, setNewProcedure] = useState({ date: new Date().toISOString().substring(0, 10), name: '', notes: '' });
    const [newLabResult, setNewLabResult] = useState({ date: new Date().toISOString().substring(0, 10), testName: '', result: '', notes: '' });
    const [newMedicalCondition, setNewMedicalCondition] = useState({ name: '', notes: '' });
    const [newAllergy, setNewAllergy] = useState({ name: '', notes: '' });
    const [newMedication, setNewMedication] = useState({ name: '', dose: '', notes: '', startDate: '', stopDate: '', intervalValue: '', intervalUnit: 'hours' });
    const [newVetVisit, setNewVetVisit] = useState({ date: new Date().toISOString().substring(0, 10), reason: '', notes: '' });
    const [newCareTaskName, setNewCareTaskName] = useState('');
    const [newCareTaskFreq, setNewCareTaskFreq] = useState('');
    const [newAnimalCareTaskName, setNewAnimalCareTaskName] = useState('');
    const [newAnimalCareTaskFreq, setNewAnimalCareTaskFreq] = useState('');
    const [newMilestoneLabel, setNewMilestoneLabel] = useState('');
    const [newMilestoneDate, setNewMilestoneDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [newMilestoneInterval, setNewMilestoneInterval] = useState('');
    const [newMilestoneUnit, setNewMilestoneUnit] = useState('week');
    
    // Parasite prevention schedule event state
    const [newParasiteScheduleTreatment, setNewParasiteScheduleTreatment] = useState('');
    const [newParasiteScheduleDate, setNewParasiteScheduleDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [newParasiteScheduleInterval, setNewParasiteScheduleInterval] = useState('');
    const [newParasiteScheduleUnit, setNewParasiteScheduleUnit] = useState('month');
    
    const [newMeasurement, setNewMeasurement] = useState({ date: new Date().toISOString().substring(0, 10), weight: '', length: '', height: '', chestGirth: '', bcs: '', notes: '' });
    const [measurementUnits, setMeasurementUnits] = useState({
        weight: animalToEdit?.measurementUnits?.weight || 'g',
        length: animalToEdit?.measurementUnits?.length || 'cm'
    });
    const [newShow, setNewShow] = useState({ date: new Date().toISOString().substring(0, 10), showName: '', titleEarned: '', judgeName: '', score: '', judgeComments: '' });
    const [newHealthClearance, setNewHealthClearance] = useState({ clearanceType: '', result: '', dateIssued: new Date().toISOString().substring(0, 10), certificateId: '', notes: '' });

    // Ownership History add-entry states
    const [ohMode, setOhMode] = useState('manual'); // 'manual' | 'user'
    const [ohOwnerName, setOhOwnerName] = useState('');
    const [ohOwnershipType, setOhOwnershipType] = useState('');
    const [ohStartDate, setOhStartDate] = useState('');
    const [ohCountry, setOhCountry] = useState('');
    const [ohSelectedUser, setOhSelectedUser] = useState(null);
    const [ohUserSearch, setOhUserSearch] = useState('');
    const [ohUserResults, setOhUserResults] = useState([]);
    const [ohSearching, setOhSearching] = useState(false);
    const [lastOwnerId, setLastOwnerId] = useState('');

    // Sale/Purchase information states
    const [purchaseDate, setPurchaseDate] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [sellerName, setSellerName] = useState('');
    const [sellerContact, setSellerContact] = useState('');
    const [saleDate, setSaleDate] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [buyerName, setBuyerName] = useState('');
    const [buyerContact, setBuyerContact] = useState('');
    const [breedingRightsPurchased, setBreedingRightsPurchased] = useState('');
    const [showRightsPurchased, setShowRightsPurchased] = useState('');
    const [exportRightsPurchased, setExportRightsPurchased] = useState('');
    const [studServicesAllowed, setStudServicesAllowed] = useState('');
    const [resaleRestrictions, setResaleRestrictions] = useState('');
    const [breederBuybackClause, setBreederBuybackClause] = useState('');

    // Medication supply selection states
    const [medicationMode, setMedicationMode] = useState('manual'); // 'manual' | 'supply'
    const [selectedMedicationSupply, setSelectedMedicationSupply] = useState(null);
    const [availableMedicationSupplies, setAvailableMedicationSupplies] = useState([]);
    const [medicationSupplySearch, setMedicationSupplySearch] = useState('');
    const [loadingMedicationSupplies, setLoadingMedicationSupplies] = useState(false);

    // Diet/Nutrition supply selection states
    const [dietMode, setDietMode] = useState('manual'); // 'manual' | 'supply'
    const [selectedDietSupply, setSelectedDietSupply] = useState(null);
    const [availableDietSupplies, setAvailableDietSupplies] = useState([]);
    const [dietSupplySearch, setDietSupplySearch] = useState('');
    const [loadingDietSupplies, setLoadingDietSupplies] = useState(false);
    const [dietManualEntry, setDietManualEntry] = useState({ name: '' });

    // Supplement supply selection states
    const [supplementMode, setSupplementMode] = useState('manual'); // 'manual' | 'supply'
    const [selectedSupplementSupply, setSelectedSupplementSupply] = useState(null);
    const [availableSupplementSupplies, setAvailableSupplementSupplies] = useState([]);
    const [supplementSupplySearch, setSupplementSupplySearch] = useState('');
    const [supplementManualEntry, setSupplementManualEntry] = useState({ name: '', dosage: '' });
    const [loadingSupplementSupplies, setLoadingSupplementSupplies] = useState(false);

    // Health status override states
    const [healthStatusOverride, setHealthStatusOverride] = useState(animalToEdit?.healthStatusOverride || null);
    const [healthStatusOverrideNotes, setHealthStatusOverrideNotes] = useState(animalToEdit?.healthStatusOverrideNotes || '');

    // Enclosure assignment states
    const [selectedEnclosure, setSelectedEnclosure] = useState(animalToEdit?.enclosureId || null);
    const [manualEnclosureName, setManualEnclosureName] = useState('');
    const [showEnclosureModal, setShowEnclosureModal] = useState(false);
    const [availableEnclosures, setAvailableEnclosures] = useState([]);
    const [enclosureSearch, setEnclosureSearch] = useState('');
    const [loadingEnclosures, setLoadingEnclosures] = useState(false);
    const [enclosureModalMode, setEnclosureModalMode] = useState('search'); // 'search' | 'create' | 'manual'
    const [newEnclosureForm, setNewEnclosureForm] = useState({
        name: '',
        roomType: '',
        location: '',
        capacity: '',
        dimensions: { length: '', width: '', height: '', unit: 'cm' },
        temperatureRange: { min: '', max: '', unit: 'C' },
        humidityRange: { min: '', max: '' },
        description: ''
    });

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
            height: newMeasurement.height || null,
            chestGirth: newMeasurement.chestGirth || null,
            bcs: newMeasurement.bcs || null,
            notes: newMeasurement.notes || ''
        };
        setFormData(prev => ({
            ...prev,
            growthRecords: [...(parseJsonArrayField(prev.growthRecords) || []), newRecord],
            measurementUnits: measurementUnits
        }));
        setNewMeasurement({ date: new Date().toISOString().substring(0, 10), weight: '', length: '', height: '', chestGirth: '', bcs: '', notes: '' });
    };


    const [ownerInfo, setOwnerInfo] = useState(null);
    const [sectionsCollapsed, setSectionsCollapsed] = useState({
        identity: false,
        breederOwner: true,
        availability: true,
        identificationNumbers: false,
        classification: false,
        origin: false,
        tags: false,
    });

    // Persist section collapse state in localStorage to survive re-renders
    useEffect(() => {
        try {
            localStorage.setItem('crittertrack_sections_collapsed', JSON.stringify(sectionsCollapsed));
        } catch (e) {
            // Ignore localStorage errors
        }
    }, [sectionsCollapsed]);
    const [newIdentifier, setNewIdentifier] = useState({ title: '', value: '' });

    // Timeline tab states
    const [timelineNotes, setTimelineNotes] = useState(parseJsonArrayField(animalToEdit?.timelineNotes) || []);
    const [eventVisibility, setEventVisibility] = useState({
        health: true,
        breeding: true,
        keeper: true,
        show: true,
        milestones: true,
        status: true
    });
    const [pinnedEvents, setPinnedEvents] = useState(parseJsonArrayField(animalToEdit?.pinnedEvents) || []);
    const [newTimelineNote, setNewTimelineNote] = useState({ eventId: '', noteText: '' });
    const [showNoteForm, setShowNoteForm] = useState(false);

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: (parseJsonArrayField(prev[field]) || []).filter((_, i) => i !== index)
        }));
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
        setFormData(prev => ({
            ...prev,
            medicalConditions: [...(parseJsonArrayField(prev.medicalConditions) || []), record]
        }));
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
        setFormData(prev => ({
            ...prev,
            allergies: [...(parseJsonArrayField(prev.allergies) || []), record]
        }));
        setNewAllergy({ name: '', notes: '' });
    };

    const addMedication = () => {
        if (medicationMode === 'supply') {
            if (!selectedMedicationSupply) {
                showModalMessage('Missing Data', 'Please select a medication supply.');
                return;
            }
            const record = {
                id: Date.now().toString(),
                name: selectedMedicationSupply.name,
                dose: newMedication.dose || '',
                supplyId: selectedMedicationSupply.id || selectedMedicationSupply._id,
                supplyName: selectedMedicationSupply.name,
                notes: newMedication.notes || '',
                startDate: newMedication.startDate || null,
                stopDate: newMedication.stopDate || null,
                intervalValue: newMedication.intervalValue ? Number(newMedication.intervalValue) : null,
                intervalUnit: newMedication.intervalUnit || 'hours',
                source: 'supply'
            };
            setFormData(prev => ({
                ...prev,
                medications: [...(parseJsonArrayField(prev.medications) || []), record]
            }));
            setSelectedMedicationSupply(null);
            setNewMedication({ name: '', dose: '', notes: '', startDate: '', stopDate: '', intervalValue: '', intervalUnit: 'hours' });
            setMedicationMode('manual');
        } else {
            if (!newMedication.name) {
                showModalMessage('Missing Data', 'Please enter a medication name.');
                return;
            }
            const record = {
                id: Date.now().toString(),
                name: newMedication.name,
                dose: newMedication.dose || '',
                notes: newMedication.notes || '',
                startDate: newMedication.startDate || null,
                stopDate: newMedication.stopDate || null,
                intervalValue: newMedication.intervalValue ? Number(newMedication.intervalValue) : null,
                intervalUnit: newMedication.intervalUnit || 'hours',
                source: 'manual'
            };
            setFormData(prev => ({
                ...prev,
                medications: [...(parseJsonArrayField(prev.medications) || []), record]
            }));
            setNewMedication({ name: '', dose: '', notes: '', startDate: '', stopDate: '', intervalValue: '', intervalUnit: 'hours' });
        }
    };

    const calculateHealthStatus = () => {
        const medications = parseJsonArrayField(formData.medications) || [];
        const conditions = parseJsonArrayField(formData.medicalConditions) || [];
        const allergies = parseJsonArrayField(formData.allergies) || [];
        const quarantine = formData.quarantineDetails || {};
        
        let score = 5; // Start at excellent
        let factors = [];

        // Quarantine assessment
        if (quarantine.status === 'Quarantine' || quarantine.status === 'Isolation') {
            const qType = quarantine.type || 'unknown';
            if (qType.includes('Medical') || qType.includes('Illness') || qType.includes('Disease')) {
                score -= 2;
                factors.push('Active medical quarantine');
            } else if (qType.includes('Preventive') || qType.includes('New')) {
                score -= 1;
                factors.push('Preventive quarantine (new arrival)');
            } else {
                score -= 1.5;
                factors.push(`${quarantine.status} status`);
            }
        }

        // Medications count
        if (medications.length > 0) {
            const deduction = Math.min(medications.length, 2); // Max 2 points deducted
            score -= deduction;
            factors.push(`${medications.length} active medication(s)`);
        }

        // Conditions count
        if (conditions.length > 0) {
            const deduction = Math.min(conditions.length, 2);
            score -= deduction;
            factors.push(`${conditions.length} medical condition(s)`);
        }

        // Allergies
        if (allergies.length > 2) {
            score -= 0.5;
            factors.push(`Multiple allergies (${allergies.length})`);
        }

        // Determine calculated status
        let calculatedStatus = 'Excellent';
        
        if (score >= 4.5) {
            calculatedStatus = 'Excellent';
        } else if (score >= 3.5) {
            calculatedStatus = 'Good';
        } else if (score >= 2.5) {
            calculatedStatus = 'Fair';
        } else if (score >= 1.5) {
            calculatedStatus = 'Poor';
        } else {
            calculatedStatus = 'Critical';
        }

        // Determine final status (override if set)
        const status = healthStatusOverride || calculatedStatus;
        const isOverridden = !!healthStatusOverride;

        // Color coding
        const colorMap = {
            'Excellent': 'bg-green-100 text-green-800 border-green-200',
            'Good': 'bg-blue-100 text-blue-800 border-blue-200',
            'Fair': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Poor': 'bg-orange-100 text-orange-800 border-orange-200',
            'Critical': 'bg-red-100 text-red-800 border-red-200'
        };

        const badgeColor = colorMap[status] || colorMap['Excellent'];

        return { status, calculatedStatus, badgeColor, score, factors, isOverridden };
    };

    const handleQuarantineChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, quarantineDetails: { ...(prev.quarantineDetails || { status: 'None', type: '', reason: '', startDate: '', endDate: '' }), [name]: value } }));
    };

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
        setFormData(prev => ({
            ...prev,
            vaccinations: [...(parseJsonArrayField(prev.vaccinations) || []), record]
        }));
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
        setFormData(prev => ({
            ...prev,
            dewormingRecords: [...(parseJsonArrayField(prev.dewormingRecords) || []), record]
        }));
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
        setFormData(prev => ({
            ...prev,
            parasiteControl: [...(parseJsonArrayField(prev.parasiteControl) || []), record]
        }));
        setNewParasiteControl({ date: new Date().toISOString().substring(0, 10), treatment: '', notes: '' });
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
        setFormData(prev => ({
            ...prev,
            medicalProcedures: [...(parseJsonArrayField(prev.medicalProcedures) || []), record]
        }));
        setNewProcedure({ date: new Date().toISOString().substring(0, 10), name: '', notes: '' });
    };

     const addHealthClearance = () => {
        if (!newHealthClearance.clearanceType || !newHealthClearance.result || !newHealthClearance.dateIssued) {
            showModalMessage('Missing Data', 'Please enter clearance type, result, and date issued.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            clearanceType: newHealthClearance.clearanceType,
            result: newHealthClearance.result,
            dateIssued: newHealthClearance.dateIssued,
            certificateId: newHealthClearance.certificateId || '',
            notes: newHealthClearance.notes || ''
        };
        setFormData(prev => ({
            ...prev,
            healthClearances: [...(prev.healthClearances || []), record]
        }));
        setNewHealthClearance({ clearanceType: '', result: '', dateIssued: new Date().toISOString().substring(0, 10), certificateId: '', notes: '' });
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
        setFormData(prev => ({
            ...prev,
            labResults: [...(parseJsonArrayField(prev.labResults) || []), record]
        }));
        setNewLabResult({ date: new Date().toISOString().substring(0, 10), testName: '', result: '', notes: '' });
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
        setFormData(prev => ({
            ...prev,
            vetVisits: [...(parseJsonArrayField(prev.vetVisits) || []), record]
        }));
        setNewVetVisit({ date: new Date().toISOString().substring(0, 10), reason: '', notes: '' });
    };

    const addMilestone = () => {
        if (!newMilestoneLabel.trim() || !newMilestoneDate) return;
        const entry = {
            label: newMilestoneLabel.trim(),
            startDate: newMilestoneDate,
            interval: newMilestoneInterval ? Number(newMilestoneInterval) : null,
            intervalUnit: newMilestoneInterval ? newMilestoneUnit : null,
        };
        setFormData(prev => ({ ...prev, milestones: [...(prev.milestones || []), entry] }));
        setNewMilestoneLabel('');
        setNewMilestoneDate(new Date().toISOString().split('T')[0]);
        setNewMilestoneInterval('');
        setNewMilestoneUnit('week');
    };

    const addParasiteScheduleEvent = () => {
        if (!newParasiteScheduleTreatment.trim() || !newParasiteScheduleDate) return;
        const entry = {
            treatment: newParasiteScheduleTreatment.trim(),
            startDate: newParasiteScheduleDate,
            interval: newParasiteScheduleInterval ? Number(newParasiteScheduleInterval) : null,
            intervalUnit: newParasiteScheduleInterval ? newParasiteScheduleUnit : null,
        };
        setFormData(prev => ({ ...prev, parasitePreventionSchedule: [...(prev.parasitePreventionSchedule || []), entry] }));
        setNewParasiteScheduleTreatment('');
        setNewParasiteScheduleDate(new Date().toISOString().split('T')[0]);
        setNewParasiteScheduleInterval('');
        setNewParasiteScheduleUnit('month');
    };

    const addBreedingRecord = () => {
        const record = {
            id: Date.now().toString(),
            ...newBreedingRecord,
            mate: newBreedingRecord.mate || (mateInfo ? `${mateInfo.prefix || ''} ${mateInfo.name}`.trim() : null),
        };
        setFormData(prev => ({
            ...prev,
            breedingRecords: [...(parseJsonArrayField(prev.breedingRecords) || []), record]
        }));
        setNewBreedingRecord({
            breedingMethod: 'Unknown',
            matingDate: '',
            mate: '',
            mateAnimalId: null,
            outcome: 'Unknown',
            birthEventDate: '',
            litterSizeBorn: '',
            notes: ''
        });
        setMateInfo(null);
    };

    const addShow = () => {
        if (!newShow.date || !newShow.showName) {
            showModalMessage('Missing Data', 'Please enter at least a date and show name.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            date: newShow.date,
            showName: newShow.showName,
            titleEarned: newShow.titleEarned || '',
            judgeName: newShow.judgeName || '',
            score: newShow.score || '',
            judgeComments: newShow.judgeComments || ''
        };
        setFormData(prev => ({
            ...prev,
            shows: [...(parseJsonArrayField(prev.shows) || []), record]
        }));
        setNewShow({ date: new Date().toISOString().substring(0, 10), showName: '', titleEarned: '', judgeName: '', score: '', judgeComments: '' });
    };

    const clearMateSelection = () => {
        setNewBreedingRecord(prev => ({ ...prev, mateAnimalId: null, mate: '' }));
        setMateInfo(null);
    };

    const handleSelectMate = (animal) => {
        if (animal) {
            setMateInfo({
                id_public: animal.id_public,
                prefix: animal.prefix || '',
                suffix: animal.suffix || '',
                name: animal.name || '',
            });
            setNewBreedingRecord(prev => ({
                ...prev,
                mateAnimalId: animal.id_public,
                mate: '',
            }));
        } else {
            clearMateSelection();
        }
        setParentSearchModalOpen(false);
    };
    const toggleSection = (section) => {
        setSectionsCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const [tagInput, setTagInput] = useState('');

    // ============================================================
    // BACKWARDS COMPATIBILITY LAYER
    // ============================================================
    // These helpers ensure data from old database fields is read correctly
    // while new code uses the standardized field names.
    // Migration plan: See MIGRATION_PLAN.md
    
    const getDateValue = (obj, newField, oldField) => {
        const value = obj?.[newField] || obj?.[oldField];
        return value ? new Date(value).toISOString().substring(0, 10) : '';
    };
    
    const getFieldValue = (obj, newField, oldField, defaultValue = '') => {
        return obj?.[newField] || obj?.[oldField] || defaultValue;
    };
    
    const getIdValue = (obj, newField, oldField, defaultValue = null) => {
        return obj?.[newField] || obj?.[oldField] || defaultValue;
    };
    
    // Ownership history: consolidates from old keeperHistory if not present
    const getOwnershipHistory = (obj) => {
        if (obj?.ownershipHistory && Array.isArray(obj.ownershipHistory)) {
            return obj.ownershipHistory;
        }
        // Fallback: convert old keeperHistory format to new ownershipHistory
        if (obj?.keeperHistory && Array.isArray(obj.keeperHistory)) {
            return obj.keeperHistory.map(keeper => ({
                ownerName: keeper.name || '',
                userId_public: keeper.userId_public || null,
                startDate: '',
                endDate: '',
                ownershipType: '',
                country: keeper.country || ''
            }));
        }
        return [];
    };

    const [formData, setFormData] = useState(
        animalToEdit ? {
            ...animalToEdit,
            species: animalToEdit.species,
            breederAssignedId: animalToEdit.breederAssignedId || animalToEdit.breederyId || animalToEdit.registryCode || '',
            prefix: animalToEdit.prefix || '',
            suffix: animalToEdit.suffix || '',
            name: animalToEdit.name || '',
            gender: animalToEdit.gender || 'Unknown',
            birthDate: animalToEdit.birthDate ? new Date(animalToEdit.birthDate).toISOString().substring(0, 10) : '',
            deceasedDate: getDateValue(animalToEdit, 'deceasedDate', 'dateOfDeath'),
            status: animalToEdit.status || 'Pet',
            color: animalToEdit.color || '',
            coat: animalToEdit.coat || '',
            earset: animalToEdit.earset || '',
            remarks: animalToEdit.remarks || '',
            tags: animalToEdit.tags || [],
            geneticCode: animalToEdit.geneticCode || '',
            fatherId_public: getIdValue(animalToEdit, 'fatherId_public', 'sireId_public'),
            motherId_public: getIdValue(animalToEdit, 'motherId_public', 'damId_public'),
            breederId_public: animalToEdit.breederId_public || null,
            manualBreederName: animalToEdit.manualBreederName || '',
            ownerId_public: getIdValue(animalToEdit, 'ownerId_public', 'ownerId'),
            manualownerName: getFieldValue(animalToEdit, 'manualownerName', 'currentOwner') || getFieldValue(animalToEdit, 'manualownerName', 'currentOwnerDisplay'),
            isDisplay: animalToEdit.isDisplay ?? false,
            coOwnership: animalToEdit.coOwnership || '',
            isForSale: animalToEdit.isForSale || false, // This will be superseded by status='Available'
            salePriceCurrency: animalToEdit.salePriceCurrency || 'USD',
            salePriceAmount: animalToEdit.salePriceAmount || '',
            availableForBreeding: animalToEdit.availableForBreeding || false,
            studFeeCurrency: animalToEdit.studFeeCurrency || 'USD',
            studFeeAmount: animalToEdit.studFeeAmount || '',
            groupRole: animalToEdit.groupRole || '',
            enclosureId: animalToEdit.enclosureId || '',
            lastFedDate: animalToEdit.lastFedDate ? new Date(animalToEdit.lastFedDate).toISOString().split('T')[0] : '',
            feedingFrequencyDays: animalToEdit.feedingFrequencyDays || '',
            lastMaintenanceDate: animalToEdit.lastMaintenanceDate ? new Date(animalToEdit.lastMaintenanceDate).toISOString().split('T')[0] : '',
            maintenanceFrequencyDays: animalToEdit.maintenanceFrequencyDays || '',
            careTasks: animalToEdit.careTasks || [],
            animalCareTasks: animalToEdit.animalCareTasks || [],
            milestones: (animalToEdit.milestones || []).map(m => ({
                ...m,
                startDate: m.startDate ? new Date(m.startDate).toISOString().split('T')[0] : '',
            })),
            isOwned: animalToEdit.isOwned ?? true,
            quarantineDetails: animalToEdit.quarantineDetails
                ? (typeof animalToEdit.quarantineDetails === 'string' ? JSON.parse(animalToEdit.quarantineDetails) : animalToEdit.quarantineDetails)
                : {
                    status: animalToEdit.isQuarantine ? 'Quarantine' : 'None',
                    reason: '',
                    startDate: animalToEdit.isQuarantine ? new Date().toISOString().substring(0, 10) : '',
                    endDate: ''
                  },
            identifiers: parseJsonArrayField(animalToEdit.identifiers),
            microchipNumber: animalToEdit.microchipNumber || '',
            pedigreeRegistrationId: animalToEdit.pedigreeRegistrationId || '',
            colonyId: animalToEdit.colonyId || '',
            tattooId: animalToEdit.tattooId || '',
            ringId: animalToEdit.ringId || '',
            eartagNumber: animalToEdit.eartagNumber || '',
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
            fertilityStatus: animalToEdit.fertilityStatus || 'Unknown',
            lastMatingDate: animalToEdit.lastMatingDate ? new Date(animalToEdit.lastMatingDate).toISOString().substring(0, 10) : '',
            successfulMatings: animalToEdit.successfulMatings || '',
            pregnancyHistory: Array.isArray(animalToEdit.pregnancyHistory) ? animalToEdit.pregnancyHistory : [],
            offspringCount: animalToEdit.offspringCount || '',
            medicalConditions: parseJsonArrayField(animalToEdit.medicalConditions),
            allergies: parseJsonArrayField(animalToEdit.allergies),
            medications: parseJsonArrayField(animalToEdit.medications),
            breedingRecords: parseJsonArrayField(animalToEdit.breedingRecords),
            vetVisits: parseJsonArrayField(animalToEdit.vetVisits),
            primaryVet: animalToEdit.primaryVet || '',
            // Backward compatible legacy fields
            dietType: animalToEdit.dietType || '',
            feedingSchedule: animalToEdit.feedingSchedule || '',
            supplements: animalToEdit.supplements || '',
            // New structured nutrition fields (used by new UI)
            dietSupplies: Array.isArray(animalToEdit.dietSupplies)
                ? animalToEdit.dietSupplies
                : (typeof animalToEdit.dietSupplies === 'string' ? (JSON.parse(animalToEdit.dietSupplies) || []) : []),
            supplementSupplies: Array.isArray(animalToEdit.supplementSupplies)
                ? animalToEdit.supplementSupplies
                : (typeof animalToEdit.supplementSupplies === 'string' ? (JSON.parse(animalToEdit.supplementSupplies) || []) : []),
            nutritionSchedule: animalToEdit.nutritionSchedule && typeof animalToEdit.nutritionSchedule === 'string'
                ? (JSON.parse(animalToEdit.nutritionSchedule) || {})
                : (animalToEdit.nutritionSchedule || {}),

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
            deceasedDate: animalToEdit.deceasedDate ? new Date(animalToEdit.deceasedDate).toISOString().substring(0, 10) : '',
            necropsyResults: animalToEdit.necropsyResults || '',
            insurance: animalToEdit.insurance || '',
            legalStatus: animalToEdit.legalStatus || '',
            ownershipHistory: getOwnershipHistory(animalToEdit),
            shows: parseJsonArrayField(animalToEdit.shows),
            showTitles: animalToEdit.showTitles || '',
            showRatings: animalToEdit.showRatings || '',
            judgeComments: animalToEdit.judgeComments || '',
            workingTitles: animalToEdit.workingTitles || '',
            performanceScores: animalToEdit.performanceScores || '',
            chestGirth: animalToEdit.chestGirth || '',
            licenseNumber: animalToEdit.licenseNumber || '',
            licenseJurisdiction: animalToEdit.licenseJurisdiction || '',
            lastDeliveryDate: animalToEdit.lastDeliveryDate ? new Date(animalToEdit.lastDeliveryDate).toISOString().substring(0, 10) : '',
            deliveryMethod: animalToEdit.deliveryMethod || '',
            reproductiveComplications: animalToEdit.reproductiveComplications || '',
            reproductiveClearances: animalToEdit.reproductiveClearances || '',
            spayNeuterDate: animalToEdit.spayNeuterDate ? new Date(animalToEdit.spayNeuterDate).toISOString().substring(0, 10) : '',
            parasitePreventionSchedule: parseJsonArrayField(animalToEdit.parasitePreventionSchedule),
            heartwormStatus: animalToEdit.heartwormStatus || '',
            hipElbowScores: animalToEdit.hipElbowScores || '',
            geneticTestResults: animalToEdit.geneticTestResults || '',
            eyeClearance: animalToEdit.eyeClearance || '',
            cardiacClearance: animalToEdit.cardiacClearance || '',
            dentalRecords: animalToEdit.dentalRecords || '',
            chronicConditions: animalToEdit.chronicConditions || '',
            healthClearances: parseJsonArrayField(animalToEdit.healthClearances),
            exerciseRequirements: animalToEdit.exerciseRequirements || '',
            dailyExerciseMinutes: animalToEdit.dailyExerciseMinutes || '',
            groomingNeeds: animalToEdit.groomingNeeds || '',
            sheddingLevel: animalToEdit.sheddingLevel || '',
            crateTrained: animalToEdit.crateTrained || false,
            litterTrained: animalToEdit.litterTrained || false,
            leashTrained: animalToEdit.leashTrained || false,
            freeFlightTrained: animalToEdit.freeFlightTrained || false,
            trainingLevel: animalToEdit.trainingLevel || '',
            trainingDisciplines: animalToEdit.trainingDisciplines || '',
            certifications: animalToEdit.certifications || '',
            workingRole: animalToEdit.workingRole || '',
            behavioralIssues: animalToEdit.behavioralIssues || '',
            biteHistory: animalToEdit.biteHistory || '',
            reactivityNotes: animalToEdit.reactivityNotes || '',
            endOfLifeCareNotes: animalToEdit.endOfLifeCareNotes || '',
            transferHistory: animalToEdit.transferHistory || '',
            breedingRestrictions: animalToEdit.breedingRestrictions || '',
            exportRestrictions: animalToEdit.exportRestrictions || '',
            purchaseDate: animalToEdit.purchaseDate ? new Date(animalToEdit.purchaseDate).toISOString().substring(0, 10) : '',
            purchaseLocation: animalToEdit.purchaseLocation || '',
            purchasePrice: animalToEdit.purchasePrice || '',
            purchasePriceCurrency: animalToEdit.purchasePriceCurrency || 'USD',
            sellerName: animalToEdit.sellerName || '',
            sellerContact: animalToEdit.sellerContact || '',
            saleDate: animalToEdit.saleDate ? new Date(animalToEdit.saleDate).toISOString().substring(0, 10) : '',
            salePrice: animalToEdit.salePrice || '',
            salePriceCurrency: animalToEdit.salePriceCurrency || 'USD',
            buyerName: animalToEdit.buyerName || '',
            buyerContact: animalToEdit.buyerContact || '',
            breedingRightsPurchased: animalToEdit.breedingRightsPurchased || '',
            showRightsPurchased: animalToEdit.showRightsPurchased || '',
            exportRightsPurchased: animalToEdit.exportRightsPurchased || '',
            studServicesAllowed: animalToEdit.studServicesAllowed || '',
            resaleRestrictions: animalToEdit.resaleRestrictions || '',
            breederBuybackClause: animalToEdit.breederBuybackClause || '',
            legalDocuments: animalToEdit.legalDocuments || [],
            growthRecords: parseJsonArrayField(animalToEdit.growthRecords),
            measurementUnits: animalToEdit.measurementUnits || { weight: 'g', length: 'cm' },
            healthStatus: animalToEdit.healthStatus || 'Unknown',
            quarantineStatus: animalToEdit.quarantineStatus || { active: false },
            vaccinations: parseJsonArrayField(animalToEdit.vaccinations),
            dewormingRecords: parseJsonArrayField(animalToEdit.dewormingRecords),
            parasiteControl: parseJsonArrayField(animalToEdit.parasiteControl),
            medicalProcedures: parseJsonArrayField(animalToEdit.medicalProcedures),
            labResults: parseJsonArrayField(animalToEdit.labResults || animalToEdit.laboratoryResults),
            timelineNotes: parseJsonArrayField(animalToEdit.timelineNotes),
            pinnedEvents: parseJsonArrayField(animalToEdit.pinnedEvents)
        } : {
            ...(initialValues || {}),
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
            manualownerName: '',
            groupRole: '',
            enclosureId: '',
            lastFedDate: '',
            feedingFrequencyDays: '',
            lastMaintenanceDate: '',
            maintenanceFrequencyDays: '',
            careTasks: [],
            animalCareTasks: [],
            milestones: [],
            breedingRole: 'both',
            isOwned: true,
            isDisplay: true,
             quarantineDetails: { status: 'None', reason: '', startDate: '', endDate: '' },
            identifiers: [],
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
            availableForBreeding: false,
            studFeeCurrency: 'USD',
            studFeeAmount: '',
            isForSale: false,
            salePriceCurrency: 'USD',
            salePriceAmount: '',
            fertilityStatus: '',
            lastMatingDate: '',
            successfulMatings: '',
            pregnancyHistory: [],
            offspringCount: '',
            medicalConditions: [],
            allergies: [],
            medications: [],
            breedingRecords: [],
            pregnancyHistory: [],
            vetVisits: '',
            primaryVet: '',
            // Backward compatible legacy fields
            dietType: '',
            feedingSchedule: '',
            supplements: '',
            // New structured nutrition fields
            dietSupplies: [],
            supplementSupplies: [],
            nutritionSchedule: {
                enabled: true,
                startDate: '',
                frequency: '',
                unit: 'days',
                timesPerDay: '',
                notes: '',
            },

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
            deceasedDate: '',
            necropsyResults: '',
            insurance: '',
            legalStatus: '',
            ownershipHistory: [],
            shows: [],
            showTitles: '',
            showRatings: '',
            judgeComments: '',
            workingTitles: '',
            performanceScores: '',
            chestGirth: '',
            licenseNumber: '',
            licenseJurisdiction: '',
            tattooId: '',
            eartagNumber: '',
            lastDeliveryDate: '',
            deliveryMethod: '',
            reproductiveComplications: '',
            reproductiveClearances: '',
            spayNeuterDate: '',
            parasitePreventionSchedule: [],
            heartwormStatus: '',
            hipElbowScores: '',
            geneticTestResults: '',
            eyeClearance: '',
            cardiacClearance: '',
            dentalRecords: '',
            chronicConditions: '',
            healthClearances: [],
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
            endOfLifeCareNotes: '',
            coOwnership: '',
            transferHistory: '',
            breedingRestrictions: '',
            exportRestrictions: '',
            purchaseDate: '',
            purchaseLocation: '',
            purchasePrice: '',
            purchasePriceCurrency: 'USD',
            sellerName: '',
            sellerContact: '',
            saleDate: '',
            salePrice: '',
            salePriceCurrency: 'USD',
            buyerName: '',
            buyerContact: '',
            breedingRightsPurchased: '',
            showRightsPurchased: '',
            exportRightsPurchased: '',
            studServicesAllowed: '',
            resaleRestrictions: '',
            breederBuybackClause: '',
            legalDocuments: [],
            growthRecords: [],
            measurementUnits: { weight: 'g', length: 'cm' },
            healthStatus: 'Unknown',
            quarantineStatus: { active: false },
            vaccinations: [],
            dewormingRecords: [],
            parasiteControl: [],
            medicalProcedures: [],
            labResults: [],
            ownerId_public: null,
            ringId: '',
            timelineNotes: [],
            pinnedEvents: []
        }
    );

    const [galleryImages, setGalleryImages] = useState([]);
    const [imageEditorOpen, setImageEditorOpen] = useState(false);
    const [imagesToEdit, setImagesToEdit] = useState([]);

    useEffect(() => {
        const initialImages = [];
        if (animalToEdit) {
            const primaryUrl = animalToEdit.imageUrl || animalToEdit.photoUrl;
            if (primaryUrl) {
                initialImages.push({ id: `existing-${primaryUrl}`, url: primaryUrl, file: null });
            }
            const extraUrls = (animalToEdit.extraImages || []).filter(url => url !== primaryUrl);
            extraUrls.forEach((url, index) => {
                initialImages.push({ id: `existing-${url}-${index}`, url: url, file: null });
            });
        }
        setGalleryImages(initialImages);
    }, [animalToEdit]);

    // Track owner changes and auto-populate ownership history
    useEffect(() => {
        const currentOwner = formData.ownerId_public || formData.manualownerName;
        const ownerChanged = lastOwnerId !== currentOwner;
        
        if (ownerChanged && lastOwnerId) {
            // There was a previous owner that just changed
            setFormData(prev => {
                const updated = { ...prev };
                const ownershipHistory = updated.ownershipHistory || [];
                
                // End-date the last entry if it doesn't have an end date
                if (ownershipHistory.length > 0) {
                    const lastEntry = ownershipHistory[ownershipHistory.length - 1];
                    if (!lastEntry.endDate) {
                        const today = new Date().toISOString().substring(0, 10);
                        ownershipHistory[ownershipHistory.length - 1] = { ...lastEntry, endDate: today };
                    }
                }
                
                // Add new ownership entry if new owner exists
                if (currentOwner) {
                    const today = new Date().toISOString().substring(0, 10);
                    const newEntry = {
                        ownerName: formData.manualownerName || '',
                        userId_public: formData.ownerId_public || null,
                        startDate: today,
                        endDate: '',
                        ownershipType: '',
                        country: ''
                    };
                    ownershipHistory.push(newEntry);
                }
                
                return { ...updated, ownershipHistory };
            });
        }
        
        if (currentOwner) {
            setLastOwnerId(currentOwner);
        } else if (lastOwnerId) {
            // Owner was cleared - still update lastOwnerId but don't create empty entry
            setLastOwnerId('');
        }
    }, [formData.ownerId_public, formData.manualownerName]);

    useEffect(() => {
        if (formData.breederId_public) {
            axios.get(`${API_BASE_URL}/public/profiles/search?query=${formData.breederId_public}&limit=1`)
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        setBreederInfo(res.data[0]);
                    }
                })
                .catch(err => console.error('Failed to fetch breeder info', err));
        } else {
            setBreederInfo(null);
        }
    }, [formData.breederId_public, API_BASE_URL]);

    useEffect(() => {
        if (formData.ownerId_public) {
            axios.get(`${API_BASE_URL}/public/profiles/search?query=${formData.ownerId_public}&limit=1`)
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        setOwnerInfo(res.data[0]);
                    }
                })
                .catch(err => console.error('Failed to fetch owner info', err));
        } else {
            setOwnerInfo(null);
        }
    }, [formData.ownerId_public, API_BASE_URL]);

    // Sync breeding fertility state to formData
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            fertilityStatus: currentReproductiveState.fertilityStatus,
            lastReproductiveEventDate: reproductiveCycle.lastReproductiveEventDate,
            reproductiveEventCycleLength: reproductiveCycle.reproductiveEventCycleLength,
            currentReproductiveEventPhase: reproductiveCycle.currentReproductiveEventPhase,
            lastConceptionDate: conceptionHistory.lastConceptionDate,
            successfulConceptionCount: conceptionHistory.successfulConceptionCount,
            unsuccessfulConceptionAttempts: conceptionHistory.unsuccessfulConceptionAttempts,
            developmentPeriodStart: developmentDetails.developmentPeriodStart,
            developmentPeriodLength: developmentDetails.developmentPeriodLength,
            expectedDeliveryDate: developmentDetails.expectedDeliveryDate,
            developmentMethod: developmentDetails.developmentMethod,
            totalOffspringProduced: reproductiveOutcomes.totalOffspringProduced,
            viableOffspringCount: reproductiveOutcomes.viableOffspringCount,
            reproductiveEventCount: reproductiveOutcomes.reproductiveEventCount,
            reproductiveEventOutcome: reproductiveOutcomes.reproductiveEventOutcome,
            dependentCareEndDate: reproductiveOutcomes.dependentCareEndDate,
            artificialReproductionMethod: reproductiveHealth.artificialReproductionMethod,
            lastReproductiveInterventionDate: reproductiveHealth.lastReproductiveInterventionDate,
            dependentCareRequired: reproductiveHealth.dependentCareRequired,
            reproductiveHealthNotes: reproductiveHealth.reproductiveHealthNotes,
            reproductiveStateOverride: reproductiveStateOverride ? true : false,
            reproductiveStateOverrideReason: reproductiveStateOverrideReason
        }));
    }, [currentReproductiveState, reproductiveCycle, conceptionHistory, developmentDetails, reproductiveOutcomes, reproductiveHealth, reproductiveStateOverride, reproductiveStateOverrideReason]);

    // Sync timeline data to formData
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            timelineNotes: timelineNotes,
            pinnedEvents: pinnedEvents
        }));
    }, [timelineNotes, pinnedEvents]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            setImagesToEdit(filesArray);
            setImageEditorOpen(true);
        }
    };

    const handleImageEditorComplete = (processedImages) => {
        // Add processed images to gallery
        const newGalleryImages = processedImages.map((img, idx) => ({
            id: img.id,
            url: img.url,
            file: img.file,
            originalSize: img.originalSize,
            finalSize: img.finalSize,
            warning: img.warning,
        }));
        setGalleryImages(prevImages => [...prevImages, ...newGalleryImages]);
        setImageEditorOpen(false);
        setImagesToEdit([]);
    };

    const setAsPrimaryImage = (id) => {
        setGalleryImages(prevImages => {
            const imageToMove = prevImages.find(img => img.id === id);
            if (!imageToMove) return prevImages;
            const otherImages = prevImages.filter(img => img.id !== id);
            return [imageToMove, ...otherImages];
        });
    };
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
            if (name === 'deceasedDate' && value) {
                updated.status = 'Deceased';
            }
            return updated;
        });
    };

    // Pedigree edit state (Manual Pedigree Beta)
    const [mpEditForm, setMpEditForm] = useState(() => animalToEdit?.manualPedigree || {});
    const [mpCTCOpenSlot, setMpCTCOpenSlot] = useState(null);
    const [mpSlotUploading, setMpSlotUploading] = useState({});
    const mpAutoFetchedRef = useRef(false);
    const animalToEditIdRef = useRef(animalToEdit?._id);
    const prevIsPregnantRef = useRef(false);

    const handleSelectContact = (selection) => {
        if (assignModalTarget === 'breeder') {
            setFormData(prev => ({
                ...prev,
                breederId_public: selection.userId || null,
                manualBreederName: selection.name || '',
            }));
        } else if (assignModalTarget === 'owner') {
            setFormData(prev => ({
                ...prev,
                ownerId_public: selection.userId || null, // The new linked user ID
                manualownerName: selection.name || '', // The manual name, falls back for display
            }));
        } else if (assignModalTarget === 'seller') {
            setFormData(prev => ({
                ...prev,
                sellerName: selection.name || '',
                sellerContact: selection.contactInfo || selection.userId || '',
            }));
        } else if (assignModalTarget === 'buyer') {
            setFormData(prev => ({
                ...prev,
                buyerName: selection.name || '',
                buyerContact: selection.contactInfo || selection.userId || '',
            }));
        }
        setAssignModalOpen(false);
        setAssignModalTarget(null);
    };

    const clearContactSelection = (target) => {
        if (target === 'breeder') {
            setFormData(prev => ({
                ...prev,
                breederId_public: null,
                manualBreederName: '',
            }));
            setBreederInfo(null);
        } else if (target === 'owner') {
            setFormData(prev => ({
                ...prev,
                ownerId_public: null,
                manualownerName: '',
            }));
            setOwnerInfo(null);
        }
    };

    const handleDocumentUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingDocument(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await axios.post(`${API_BASE_URL}/upload-document`, fd, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${authToken}` }
            });
            setFormData(prev => ({
                ...prev,
                legalDocuments: [
                    ...(prev.legalDocuments || []),
                    {
                        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                        filename: file.name,
                        url: res.data.url,
                        uploadedAt: new Date().toISOString(),
                        uploadedBy: userProfile?.id_public || null,
                    }
                ]
            }));
        } catch (err) {
            showModalMessage('Error', err.response?.data?.message || 'Failed to upload document. Allowed types: PDF, DOC, DOCX, Pages. Max size 10MB.');
        } finally {
            setUploadingDocument(false);
            e.target.value = '';
        }
    };

    const handleRemoveDocument = (id) => {
        setFormData(prev => ({
            ...prev,
            legalDocuments: (prev.legalDocuments || []).filter(doc => doc.id !== id)
        }));
    };

    const addIdentifier = () => {
        if (!newIdentifier.title.trim() || !newIdentifier.value.trim()) {
            showModalMessage('Missing Data', 'Please enter both a title and a value for the identifier.');
            return;
        }
        setFormData(prev => ({
            ...prev,
            identifiers: [...(prev.identifiers || []), { ...newIdentifier }]
        }));
        setNewIdentifier({ title: '', value: '' });
    };

     const removeIdentifier = (index) => {
        setFormData(prev => ({
            ...prev,
            identifiers: (prev.identifiers || []).filter((_, i) => i !== index)
        }));
    };

    // Timeline helper functions
    const aggregateTimelineEvents = () => {
        const events = [];
        const addEvent = (type, date, title, description, id) => {
            if (date) {
                events.push({
                    id: id || `${type}-${Date.now()}`,
                    type,
                    date: new Date(date).toISOString().split('T')[0],
                    title,
                    description,
                    isPinned: pinnedEvents.includes(id || `${type}-${Date.now()}`)
                });
            }
        };

        // Health events
        if (eventVisibility.health) {
            if (formData.quarantineDetails?.startDate) {
                addEvent('health', formData.quarantineDetails.startDate, 'Quarantine Started', formData.quarantineDetails.reason || 'Quarantine');
            }
            if (formData.spayNeuterDate) {
                addEvent('health', formData.spayNeuterDate, 'Spay/Neuter Surgery', 'Surgical sterilization');
            }
            (parseJsonArrayField(formData.vetVisits) || []).forEach((visit, idx) => {
                if (visit?.date) addEvent('health', visit.date, 'Vet Visit', visit.reason || 'Veterinary visit', `vet-${visit.date}-${idx}`);
            });
            (parseJsonArrayField(formData.vaccinations) || []).forEach((vacc, idx) => {
                if (vacc?.date) addEvent('health', vacc.date, 'Vaccination', vacc.name || 'Vaccination', `vacc-${vacc.date}-${idx}`);
            });
            (parseJsonArrayField(formData.medicalProcedures) || []).forEach((proc, idx) => {
                if (proc?.date) addEvent('health', proc.date, 'Medical Procedure', proc.name || proc.procedure || 'Procedure', `proc-${proc.date}-${idx}`);
            });
            (parseJsonArrayField(formData.labResults) || []).forEach((lab, idx) => {
                if (lab?.date) addEvent('health', lab.date, 'Lab Results', lab.testName || lab.name || 'Lab test', `lab-${lab.date}-${idx}`);
            });
            (parseJsonArrayField(formData.dewormingRecords) || []).forEach((deworming, idx) => {
                if (deworming?.date) addEvent('health', deworming.date, 'Deworming Treatment', deworming.type || 'Deworming', `deworming-${deworming.date}-${idx}`);
            });
            (parseJsonArrayField(formData.parasiteControl) || []).forEach((parasite, idx) => {
                if (parasite?.date) addEvent('health', parasite.date, 'Parasite Prevention', parasite.type || 'Parasite control', `parasite-${parasite.date}-${idx}`);
            });
        }

        // Breeding events
        if (eventVisibility.breeding) {
            if (formData.lastHeatDate) {
                addEvent('breeding', formData.lastHeatDate, 'Heat Cycle', 'Last estrus cycle');
            }
            if (formData.lastReproductiveEventDate) {
                addEvent('breeding', formData.lastReproductiveEventDate, 'Reproductive Event', 'Last reproductive event');
            }
            if (formData.lastMatingDate) {
                addEvent('breeding', formData.lastMatingDate, 'Last Mating', 'Previous mating event');
            }
            if (formData.lastConceptionDate) {
                addEvent('breeding', formData.lastConceptionDate, 'Conception', 'Successful conception');
            }
            if (formData.matingDate) {
                addEvent('breeding', formData.matingDate, 'Mating', 'Animal mating date');
            }
            if (formData.expectedDueDate) {
                addEvent('breeding', formData.expectedDueDate, 'Expected Delivery', 'Expected delivery/birth date');
            }
            if (formData.developmentPeriodStart) {
                addEvent('breeding', formData.developmentPeriodStart, 'Development Period Started', 'Pregnancy/development period beginning');
            }
            if (formData.nursingStartDate) {
                addEvent('breeding', formData.nursingStartDate, 'Nursing Started', 'Nursing period began');
            }
            if (formData.weaningDate) {
                addEvent('breeding', formData.weaningDate, 'Weaning', 'Offspring weaning date');
            }
            if (formData.lastPregnancyDate) {
                addEvent('breeding', formData.lastPregnancyDate, 'Last Pregnancy', 'Previous pregnancy occurrence');
            }
            (parseJsonArrayField(formData.breedingRecords) || []).forEach((record, idx) => {
                if (record?.birthEventDate) addEvent('breeding', record.birthEventDate, 'Birth/Hatching Event', `Litter size: ${record.litterSizeBorn || 'Unknown'}`, `birth-${record.birthEventDate}-${idx}`);
            });
        }

        // Keeper events
        if (eventVisibility.keeper) {
            (formData.ownershipHistory || []).forEach((ownership, idx) => {
                if (ownership?.startDate) addEvent('keeper', ownership.startDate, 'Keeper Changed', `New keeper: ${ownership.ownerName || 'Unknown'}`, `keeper-${ownership.startDate}-${idx}`);
            });
            if (formData.purchaseDate) {
                addEvent('keeper', formData.purchaseDate, 'Animal Purchased', `Purchased for: ${formData.purchasePrice ? `${getCurrencySymbol(formData.purchasePriceCurrency)}${formData.purchasePrice}` : 'Unknown price'}`);
            }
            if (formData.saleDate) {
                addEvent('keeper', formData.saleDate, 'Animal Sold', `Sold for: ${formData.salePrice ? `${getCurrencySymbol(formData.salePriceCurrency)}${formData.salePrice}` : 'Unknown price'}`);
            }
        }

        // Show events
        if (eventVisibility.show) {
            (parseJsonArrayField(formData.shows) || []).forEach((show, idx) => {
                if (show?.date) {
                    const titleText = show.titleEarned ? ` - ${show.titleEarned}` : '';
                    const scoreText = show.score ? ` (${show.score})` : '';
                    addEvent('show', show.date, `Show: ${show.showName}${titleText}`, `Judge: ${show.judgeName || 'Unknown'}${scoreText}${show.judgeComments ? ` - ${show.judgeComments}` : ''}`, `show-${show.date}-${idx}`);
                }
            });
        }

        // Milestones
        if (eventVisibility.milestones) {
            (parseJsonArrayField(formData.milestones) || []).forEach((milestone, idx) => {
                if (milestone?.startDate) addEvent('milestones', milestone.startDate, milestone.label || 'Milestone', milestone.description || '', `milestone-${milestone.startDate}-${idx}`);
            });
        }

        // Parasite Prevention Schedule
        if (eventVisibility.health) {
            (parseJsonArrayField(formData.parasitePreventionSchedule) || []).forEach((schedule, idx) => {
                if (schedule?.startDate) {
                    const frequency = schedule.interval && schedule.intervalUnit ? ` (every ${schedule.interval} ${schedule.intervalUnit}s)` : '';
                    addEvent('health', schedule.startDate, 'Parasite Prevention', `${schedule.treatment}${frequency}`, `parasite-schedule-${schedule.startDate}-${idx}`);
                }
            });
        }

        // Status changes
        if (eventVisibility.status) {
            if (formData.dateOfDeath) {
                addEvent('status', formData.dateOfDeath, 'Animal Deceased', `Status: ${formData.status || 'Deceased'}`);
            }
        }

        return events.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const addTimelineNote = () => {
        if (!newTimelineNote.eventId || !newTimelineNote.noteText.trim()) {
            showModalMessage('Missing Data', 'Please select an event and enter a note.');
            return;
        }
        const note = {
            id: Date.now().toString(),
            eventId: newTimelineNote.eventId,
            noteText: newTimelineNote.noteText,
            dateAdded: new Date().toISOString().split('T')[0]
        };
        setTimelineNotes([...timelineNotes, note]);
        setNewTimelineNote({ eventId: '', noteText: '' });
        setShowNoteForm(false);
    };

    const deleteTimelineNote = (noteId) => {
        setTimelineNotes(timelineNotes.filter(n => n.id !== noteId));
    };

    const toggleEventPin = (eventId) => {
        if (pinnedEvents.includes(eventId)) {
            setPinnedEvents(pinnedEvents.filter(id => id !== eventId));
        } else {
            setPinnedEvents([...pinnedEvents, eventId]);
        }
    };

    const getNotesForEvent = (eventId) => {
        return timelineNotes.filter(n => n.eventId === eventId);
    };

    // Pedigree helper functions
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
    };

    // Auto-fill pedigree when tab opens
    useEffect(() => {
        if (activeTab !== 'pedigree' || mpAutoFetchedRef.current || !authToken) return;
        mpAutoFetchedRef.current = true;

        const pedigree = animalToEdit?.manualPedigree || {};

        const toSlot = (a, notes = '') => {
            const variety = ['color','coatPattern','coat','earset','phenotype','morph','markings'].map(f => a[f]).filter(Boolean).join(' ');
            return { mode: 'ctc', ctcId: a.id_public, prefix: a.prefix || '', name: a.name || '', suffix: a.suffix || '', variety, genCode: a.geneticCode || '', birthDate: a.birthDate ? String(a.birthDate).slice(0,10) : '', breederName: a.breederName || a.manualBreederName || '', gender: a.gender || '', imageUrl: a.imageUrl || a.photoUrl || '', notes };
        };

        const fetchAnimal = (ctcId) =>
            axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(ctcId)}`, { headers: { Authorization: `Bearer ${authToken}` } })
                .then(r => r.data || null).catch(() => null);

        const updates = {};
        const queue = [];
        const queued = new Set();

        const enqueue = (slotKey, ctcId, notes = '') => {
            if (!ctcId || queued.has(slotKey)) return;
            queued.add(slotKey);
            queue.push({ slotKey, ctcId, notes });
        };

        const allSlots = ['sire','dam','sireSire','sireDam','damSire','damDam',
            'sireSireSire','sireSireDam','sireDamSire','sireDamDam',
            'damSireSire','damSireDam','damDamSire','damDamDam'];

        allSlots.forEach(k => { if (pedigree[k]?.mode === 'ctc' && pedigree[k]?.ctcId) enqueue(k, pedigree[k].ctcId, pedigree[k].notes || ''); });

        const sireId = animalToEdit?.fatherId_public || animalToEdit?.sireId_public;
        const damId  = animalToEdit?.motherId_public || animalToEdit?.damId_public;
        if (sireId && !pedigree.sire?.ctcId) enqueue('sire', sireId);
        if (damId  && !pedigree.dam?.ctcId)  enqueue('dam',  damId);

        if (!queue.length) return;

        const processQueue = async () => {
            while (queue.length) {
                const batch = queue.splice(0, queue.length);
                await Promise.all(batch.map(async ({ slotKey, ctcId, notes }) => {
                    const a = await fetchAnimal(ctcId);
                    if (!a) return;
                    updates[slotKey] = toSlot(a, notes);
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

    // Fetch medication supplies when switching to supply mode
    useEffect(() => {
        if (medicationMode === 'supply' && availableMedicationSupplies.length === 0 && !loadingMedicationSupplies) {
            setLoadingMedicationSupplies(true);
            axios.get(`${API_BASE_URL}/supplies?category=medication`, { headers: { Authorization: `Bearer ${authToken}` } })
                .then(res => {
                    setAvailableMedicationSupplies(res.data || []);
                })
                .catch(err => {
                    console.error('Failed to fetch medication supplies:', err);
                    showModalMessage('Error', 'Failed to load available medication supplies.');
                })
                .finally(() => setLoadingMedicationSupplies(false));
        }
    }, [medicationMode, availableMedicationSupplies.length, loadingMedicationSupplies, API_BASE_URL, authToken, showModalMessage]);

    // Reset form when switching medication mode
    useEffect(() => {
        setMedicationSupplySearch('');
        setSelectedMedicationSupply(null);
        if (medicationMode === 'manual') {
            setNewMedication({ name: '', dose: '', notes: '', startDate: '', stopDate: '', intervalValue: '', intervalUnit: 'hours' });
        }
    }, [medicationMode]);

    // Fetch diet supplies when switching to supply mode
    useEffect(() => {
        if (dietMode === 'supply' && availableDietSupplies.length === 0 && !loadingDietSupplies) {
            setLoadingDietSupplies(true);
            axios.get(`${API_BASE_URL}/supplies?category=diet`, { headers: { Authorization: `Bearer ${authToken}` } })
                .then(res => {
                    setAvailableDietSupplies(res.data || []);
                })
                .catch(err => {
                    console.error('Failed to fetch diet supplies:', err);
                    showModalMessage('Error', 'Failed to load available diet supplies.');
                })
                .finally(() => setLoadingDietSupplies(false));
        }
    }, [dietMode, availableDietSupplies.length, loadingDietSupplies, API_BASE_URL, authToken, showModalMessage]);

    // Reset form when switching diet mode
    useEffect(() => {
        setDietSupplySearch('');
        setSelectedDietSupply(null);
    }, [dietMode]);

    // Fetch supplement supplies when switching to supply mode
    useEffect(() => {
        if (supplementMode === 'supply' && availableSupplementSupplies.length === 0 && !loadingSupplementSupplies) {
            setLoadingSupplementSupplies(true);
            axios.get(`${API_BASE_URL}/supplies?category=supplement`, { headers: { Authorization: `Bearer ${authToken}` } })
                .then(res => {
                    setAvailableSupplementSupplies(res.data || []);
                })
                .catch(err => {
                    console.error('Failed to fetch supplement supplies:', err);
                    showModalMessage('Error', 'Failed to load available supplement supplies.');
                })
                .finally(() => setLoadingSupplementSupplies(false));
        }
    }, [supplementMode, availableSupplementSupplies.length, loadingSupplementSupplies, API_BASE_URL, authToken, showModalMessage]);

    // Reset form when switching supplement mode
    useEffect(() => {
        setSupplementSupplySearch('');
        setSelectedSupplementSupply(null);
    }, [supplementMode]);

    // Auto-capture pregnancy dates when isPregnant is set to true
    useEffect(() => {
        if (formData.isPregnant && !prevIsPregnantRef.current) {
            // Changed from false to true - add today's date to history
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({
                ...prev,
                pregnancyHistory: [...(prev.pregnancyHistory || []), today]
            }));
        }
        
        prevIsPregnantRef.current = formData.isPregnant;
    }, [formData.isPregnant]);

    // Fetch enclosures when opening modal
    useEffect(() => {
        if (showEnclosureModal && availableEnclosures.length === 0 && !loadingEnclosures) {
            setLoadingEnclosures(true);
            axios.get(`${API_BASE_URL}/enclosures`, { headers: { Authorization: `Bearer ${authToken}` } })
                .then(res => {
                    setAvailableEnclosures(res.data || []);
                })
                .catch(err => {
                    console.error('Failed to fetch enclosures:', err);
                    // For now, continue gracefully even if API fails
                })
                .finally(() => setLoadingEnclosures(false));
        }
    }, [showEnclosureModal, availableEnclosures.length, loadingEnclosures, API_BASE_URL, authToken]);

    const deleteImage = (id) => {
        setGalleryImages(prevImages => prevImages.filter(img => img.id !== id));
    };

    const moveImage = (index, direction) => {
        setGalleryImages(prevImages => {
            const newImages = [...prevImages];
            const targetIndex = direction === 'left' ? index - 1 : index + 1;

            if (targetIndex < 0 || targetIndex >= newImages.length) {
                return newImages; // Out of bounds
            }

            // Swap elements
            [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

            return newImages;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const missingFields = [];
        if (!formData.name?.trim()) missingFields.push('Name (Dashboard tab)');
        if (!formData.species?.trim()) missingFields.push('Species (Dashboard tab)');
        if (!formData.gender?.trim()) missingFields.push('Gender (Dashboard tab)');
        if (!formData.status?.trim()) missingFields.push('Status (Dashboard tab)');

        if (missingFields.length > 0) {
            showModalMessage('Required Fields Missing', `Please fill in the following required fields:\n\n· ${missingFields.join('\n· ')}`);
            setLoading(false);
            return;
        }

        const method = animalToEdit ? 'put' : 'post';
        const url = animalToEdit ? `${API_BASE_URL}/animals/${animalToEdit.id_public}` : `${API_BASE_URL}/animals`;

        try {
            const newImagesToUpload = galleryImages.filter(img => img.file);
            const existingImageUrls = galleryImages.filter(img => !img.file).map(img => img.url);

            const uploadPromises = newImagesToUpload.map(img => {
                const fd = new FormData();
                fd.append('file', img.file);
                fd.append('type', 'animal');
                return axios.post(`${API_BASE_URL}/upload`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${authToken}` }
                }).then(res => ({
                    id: img.id,
                    url: res.data.url
                }));
            });

            const uploadedImages = await Promise.all(uploadPromises);
            const uploadedUrlMap = new Map(uploadedImages.map(img => [img.id, img.url]));

            const finalImageUrls = galleryImages.map(img => {
                return img.file ? uploadedUrlMap.get(img.id) : img.url;
            }).filter(Boolean);

            const primaryImageUrl = finalImageUrls[0] || null;
            const extraImages = finalImageUrls.slice(1);

            const payloadToSave = { ...formData };
            payloadToSave.imageUrl = primaryImageUrl;
            payloadToSave.photoUrl = primaryImageUrl;
            payloadToSave.extraImages = extraImages;
            
            // Add manual pedigree data
            if (Object.keys(mpEditForm).length > 0) {
                payloadToSave.manualPedigree = mpEditForm;
            }

            // Serialize array fields that the backend schema stores as a JSON string.
            // NOTE: Most array fields (growthRecords, vaccinations, milestones, breedingRecords, etc.)
            // are real Mongoose embedded-array schemas on the backend and must be sent as actual
            // arrays, NOT JSON strings, or `findOneAndUpdate` with runValidators will throw a
            // "Cast to embedded failed" error. Only `identifiers` is stored as a String column.
            const arrayFields = ['identifiers'];

            arrayFields.forEach(field => {
                if (Array.isArray(payloadToSave[field]) && payloadToSave[field].length > 0) {
                    payloadToSave[field] = JSON.stringify(payloadToSave[field]);
                } else if (Array.isArray(payloadToSave[field]) && payloadToSave[field].length === 0) {
                    payloadToSave[field] = null; // Send null for empty arrays
                }
            });

            // Serialize structured nutrition schedule (object) as JSON
            if (payloadToSave.nutritionSchedule && typeof payloadToSave.nutritionSchedule === 'object') {
                payloadToSave.nutritionSchedule = JSON.stringify(payloadToSave.nutritionSchedule);
            }


            if (galleryImages.length === 0) {
                payloadToSave.imageUrl = null;
                payloadToSave.photoUrl = null;
                payloadToSave.extraImages = [];
            }

            await onSave(method, url, payloadToSave);

            if (!animalToEdit) {
                window.dispatchEvent(new Event('animals-changed'));
                showModalMessage('Success', `Animal ${formData.name} successfully added!`);
            }
            onCancel();
        } catch (error) {
            console.error('Animal Save Error:', JSON.stringify(error.response?.data ?? { message: error.message }, null, 2));
            showModalMessage('Error', error.response?.data?.message || `Failed to ${animalToEdit ? 'update' : 'add'} animal.`);
        } finally {
            setLoading(false);
        }
    };

    const TABS = [
        { id: 'dashboard', label: 'Dashboard', icon: Info },
        { id: 'identification', label: 'Identification', icon: Hash },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'health', label: 'Health', icon: HeartPulse },
        { id: 'care', label: 'Routine Care', icon: Droplets },
        { id: 'behavior', label: 'Behavior', icon: Brain },
        { id: 'breeding', label: 'Breeding', icon: Users },
        { id: 'pedigree', label: 'Pedigree', icon: Dna },
        { id: 'gallery', label: 'Gallery', icon: Images },
        { id: 'timeline', label: 'Timeline', icon: Clock },
        { id: 'records', label: 'Records', icon: FileText },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[80] backdrop-blur-sm">
            <AssignContactModal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                onSelect={handleSelectContact}
                target={assignModalTarget}
                API_BASE_URL={API_BASE_URL}
                authToken={authToken}
                userProfile={userProfile}
            />
            <form onSubmit={handleSubmit} className="bg-[#e1f2f5] rounded-xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-300 flex-shrink-0">
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-between">
                        <span>
                            <PlusCircle size={24} className="inline mr-2 text-primary" />
                            {formTitle}
                        </span>
                        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700 transition duration-150 p-2 rounded-lg" title="Cancel">
                            <X size={24} />
                        </button>
                    </h2>
                </div>

                {/* Tabs */}
                <div className="bg-[#e1f2f5] z-10 border-b border-gray-300 px-6 py-2">
                    <div className="flex flex-wrap gap-2">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 px-5 py-2 text-sm font-medium rounded border-2 transition-colors ${activeTab === tab.id ? 'bg-[#F2E4E9] text-black border-gray-300' : 'bg-white text-gray-600 hover:text-gray-800 border-gray-300'}`}
                                title={tab.label}
                            >
                                {React.createElement(tab.icon, { size: 15, className: `inline-block align-middle flex-shrink-0 mr-1 ${tab.color || ''}` })}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'dashboard' && ( // DASHBOARD
                            <div className="flex gap-4">
                                {/* Left Column: Image Upload */}
                                <div className="w-1/4 flex-shrink-0 flex flex-col gap-2">
                                    {(() => {
                                        const mainImage = galleryImages[0];
                                        const thumbnailImages = galleryImages.slice(1, 4);
                                        return (
                                            <>
                                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-300 relative group">
                                                    {mainImage ? (
                                                        <img src={mainImage.url} alt="Main animal" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-gray-400 flex flex-col items-center gap-2">
                                                            <Camera size={48} />
                                                            <span className="text-sm">No Image</span>
                                                        </div>
                                                    )}
                                                    {mainImage && (
                                                        <button type="button" onClick={() => deleteImage(mainImage.id)} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {thumbnailImages.map(img => (
                                                        <button key={img.id} type="button" onClick={() => setAsPrimaryImage(img.id)} className="aspect-square rounded-md overflow-hidden border-2 border-gray-300 relative group focus:outline-none focus:ring-2 focus:ring-primary">
                                                            <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Set as primary">
                                                                <Star size={20} className="text-white" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {Array.from({ length: Math.max(0, 3 - thumbnailImages.length) }).map((_, i) => (
                                                        <div key={`placeholder-${i}`} className="aspect-square bg-gray-100 rounded-md border-2 border-gray-300" />
                                                    ))}
                                                    <label className="aspect-square bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 hover:border-gray-400 transition">
                                                        <PlusCircle size={24} />
                                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                                    </label>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Right Column: Identity Fields */}
                                <div className="w-3/4 flex-1 flex flex-col gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <button type="button" onClick={() => toggleSection('identity')} className="w-full flex justify-between items-center text-left hover:bg-gray-100 p-2 rounded transition-colors">
                                            <h3 className="text-base font-semibold text-gray-700">Identity</h3>
                                            <div className="text-gray-700 flex-shrink-0">
                                                {sectionsCollapsed.identity ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </button>
                                        {!sectionsCollapsed.identity && (
                                            <div className="mt-3 pt-3 border-t space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700">Prefix</label>
                                                        <input type="text" name="prefix" value={formData.prefix} onChange={handleChange}
                                                            className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700">Name*</label>
                                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                                            className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700">Suffix</label>
                                                        <input type="text" name="suffix" value={formData.suffix} onChange={handleChange}
                                                            className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700">Gender*</label>
                                                        <select name="gender" value={formData.gender} onChange={handleChange} required
                                                            className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                                            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700">Date of Birth</label>
                                                        <DatePicker name="birthDate" value={formData.birthDate} onChange={handleChange} maxDate={new Date()}
                                                            className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700">Status*</label>
                                                        <select name="status" value={formData.status} onChange={handleChange} required
                                                            className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                    {formData.status === 'Deceased' && (
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700">Deceased Date</label>
                                                            <input type="date" name="deceasedDate" value={formData.deceasedDate} onChange={handleChange}
                                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="md:col-span-3">
                                                    <label className="block text-xs font-medium text-gray-700">Remarks</label>
                                                    <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="3"
                                                        className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                        placeholder="General notes, observations, and records..." />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Breeder & Keeper */}
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <button type="button" onClick={() => toggleSection('breederOwner')} className="w-full flex justify-between items-center text-left hover:bg-gray-100 p-2 rounded transition-colors">
                                            <h3 className="text-base font-semibold text-gray-700 flex items-center gap-1.5"><User size={16} />Breeder & Owner</h3>
                                            <div className="text-gray-700 flex-shrink-0">
                                                {sectionsCollapsed.breederOwner ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </button>
                                        {!sectionsCollapsed.breederOwner && (
                                            <div className="mt-3 pt-3 border-t space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-end gap-2">
                                                        <div className="flex-1">
                                                            <ContactDisplayField
                                                                label="Breeder"
                                                                value={breederInfo ? (breederInfo.breederName || breederInfo.personalName) : formData.manualBreederName}
                                                                onEdit={() => { setAssignModalTarget('breeder'); setAssignModalOpen(true); }}
                                                            />
                                                        </div>
                                                        {(breederInfo || formData.manualBreederName) && (
                                                            <button type="button" onClick={() => clearContactSelection('breeder')} className="text-gray-500 hover:text-red-500 transition p-1 mb-1" title="Clear Breeder">
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-end gap-2">
                                                        <div className="flex-1">
                                                            <ContactDisplayField
                                                                label="Owner"
                                                                value={ownerInfo ? (ownerInfo.breederName || ownerInfo.personalName) : formData.manualownerName}
                                                                onEdit={() => { setAssignModalTarget('owner'); setAssignModalOpen(true); }}
                                                            />
                                                        </div>
                                                        {(ownerInfo || formData.manualownerName) && (
                                                            <button type="button" onClick={() => clearContactSelection('owner')} className="text-gray-500 hover:text-red-500 transition p-1 mb-1" title="Clear Owner">
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-medium text-gray-700">Co-Ownership Details</label>
                                                        <textarea name="coOwnership" value={formData.coOwnership} onChange={handleChange} rows="2"
                                                            className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                            placeholder="Co-owner name, terms, breeding rights, etc." />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Availability */}
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <button type="button" onClick={() => toggleSection('availability')} className="w-full flex justify-between items-center text-left hover:bg-gray-100 p-2 rounded transition-colors">
                                            <h3 className="text-base font-semibold text-gray-700">Availability</h3>
                                            <div className="text-gray-700 flex-shrink-0">
                                                {sectionsCollapsed.availability ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </button>
                                        {!sectionsCollapsed.availability && (
                                            <div className="mt-3 pt-3 border-t space-y-3">
                                                {/* For Sale */}
                                                <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                                    <label className="flex items-center space-x-2">
                                                        <input type="checkbox" name="isForSale" checked={formData.isForSale} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary rounded" />
                                                        <span className="text-xs font-medium text-gray-700">Available for Sale</span>
                                                    </label>
                                                    {formData.isForSale && (
                                                        <div className="flex gap-2 pl-6">
                                                            <select name="salePriceCurrency" value={formData.salePriceCurrency} onChange={handleChange} className="py-1.5 px-2 border border-gray-300 rounded-md text-xs">
                                                                <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="CAD">CAD</option><option value="AUD">AUD</option><option value="Negotiable">Negotiable</option>
                                                            </select>
                                                            <input type="number" name="salePriceAmount" value={formData.salePriceAmount} onChange={handleChange} disabled={formData.salePriceCurrency === 'Negotiable'} placeholder="Price" className="flex-1 py-1.5 px-2 border border-gray-300 rounded-md text-xs" />
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        This animal will appear in the public Marketplace if its profile is also set to Public (Eye toggle in the top right of the detail view).
                                                    </p>
                                                </div>
                                                {/* For Stud */}
                                                <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                                    <label className="flex items-center space-x-2">
                                                        <input type="checkbox" name="availableForBreeding" checked={formData.availableForBreeding} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary rounded" />
                                                        <span className="text-xs font-medium text-gray-700">Available for Stud/Breeding</span>
                                                    </label>
                                                    {formData.availableForBreeding && (
                                                        <div className="flex gap-2 pl-6">
                                                            <select name="studFeeCurrency" value={formData.studFeeCurrency} onChange={handleChange} className="py-1.5 px-2 border border-gray-300 rounded-md text-xs">
                                                                <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="CAD">CAD</option><option value="AUD">AUD</option><option value="Negotiable">Negotiable</option>
                                                            </select>
                                                            <input type="number" name="studFeeAmount" value={formData.studFeeAmount} onChange={handleChange} disabled={formData.studFeeCurrency === 'Negotiable'} placeholder="Fee" className="flex-1 py-1.5 px-2 border border-gray-300 rounded-md text-xs" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'identification' && (
                            <div className="space-y-4">
                                {/* Identification Numbers */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <button type="button" onClick={() => toggleSection('identificationNumbers')} className="w-full flex justify-between items-center text-left hover:bg-gray-100 p-2 rounded transition-colors">
                                        <h3 className="text-base font-semibold text-gray-700 flex items-center gap-1.5"><Hash size={16} className="flex-shrink-0" /> Identification Numbers</h3>
                                        <div className="text-gray-700 flex-shrink-0">
                                            {sectionsCollapsed.identificationNumbers ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </button>
                                    {!sectionsCollapsed.identificationNumbers && (
                                        <div className="mt-3 pt-3 border-t space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Breeder Assigned ID</label>
                                                <input type="text" name="breederAssignedId" value={formData.breederAssignedId || ''} onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Microchip Number</label>
                                                <input type="text" name="microchipNumber" value={formData.microchipNumber || ''} onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Pedigree Registration ID</label>
                                                <input type="text" name="pedigreeRegistrationId" value={formData.pedigreeRegistrationId || ''} onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Colony ID</label>
                                                <input type="text" name="colonyId" value={formData.colonyId || ''} onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Tattoo ID</label>
                                                <input type="text" name="tattooId" value={formData.tattooId || ''} onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Ring ID</label>
                                                <input type="text" name="ringId" value={formData.ringId || ''} onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Ear Tag</label>
                                                <input type="text" name="eartagNumber" value={formData.eartagNumber || ''} onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                        {/* Additional Identifiers */}
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Additional Identifiers</h4>
                                            {(formData.identifiers || []).filter(Boolean).map((identifier, index) => (
                                                <div key={index} className="flex items-center gap-2 mb-2 p-2 bg-white border rounded-md">
                                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                                        <input type="text" value={identifier.title} readOnly className="text-sm p-1 bg-gray-100 border-gray-200 rounded" />
                                                        <input type="text" value={identifier.value} readOnly className="text-sm p-1 bg-gray-100 border-gray-200 rounded" />
                                                    </div>
                                                    <button type="button" onClick={() => removeIdentifier(index)} className="p-1 text-red-500 hover:text-red-700">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="flex items-center gap-2 p-2 bg-white border border-dashed rounded-md">
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Identifier Title (e.g., DNA ID)"
                                                        value={newIdentifier.title}
                                                        onChange={(e) => setNewIdentifier({ ...newIdentifier, title: e.target.value })}
                                                        className="text-sm p-1 border-gray-300 rounded"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Identifier Value"
                                                        value={newIdentifier.value}
                                                        onChange={(e) => setNewIdentifier({ ...newIdentifier, value: e.target.value })}
                                                        className="text-sm p-1 border-gray-300 rounded"
                                                    />
                                                </div>
                                                <button type="button" onClick={addIdentifier} className="p-1 text-green-600 hover:text-green-700">
                                                    <PlusCircle size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        </div>
                                    )}
                                </div>

                                {/* Classification */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <button type="button" onClick={() => toggleSection('classification')} className="w-full flex justify-between items-center text-left hover:bg-gray-100 p-2 rounded transition-colors">
                                        <h3 className="text-base font-semibold text-gray-700 flex items-center gap-1.5"><FolderOpen size={16} className="flex-shrink-0" /> Classification</h3>
                                        <div className="text-gray-700 flex-shrink-0">
                                            {sectionsCollapsed.classification ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </button>
                                    {!sectionsCollapsed.classification && (
                                        <div className="mt-3 pt-3 border-t space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Species</label>
                                                <input type="text" value={formData.species} disabled
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600" />
                                                <p className="text-xs text-gray-500 mt-1">Cannot be changed after creation</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Breed</label>
                                                <input type="text" name="breed" value={formData.breed || ''} onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-700">Strain</label>
                                                <input type="text" name="strain" value={formData.strain || ''} onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                    placeholder="e.g., C57BL/6, Wistar, Syrian" />
                                            </div>
                                        </div>
                                        </div>
                                    )}
                                </div>

                                {/* Origin */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <button type="button" onClick={() => toggleSection('origin')} className="w-full flex justify-between items-center text-left hover:bg-gray-100 p-2 rounded transition-colors">
                                        <h3 className="text-base font-semibold text-gray-700 flex items-center gap-1.5"><Globe size={16} className="flex-shrink-0" /> Origin</h3>
                                        <div className="text-gray-700 flex-shrink-0">
                                            {sectionsCollapsed.origin ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </button>
                                    {!sectionsCollapsed.origin && (
                                        <div className="mt-3 pt-3 border-t space-y-3">
                                            <label className="block text-xs font-medium text-gray-700">Origin</label>
                                            <select name="origin" value={formData.origin || ''} onChange={handleChange}
                                                className="block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                                <option value="">Select Origin</option>
                                                <option value="Captive-bred">Captive-bred</option>
                                                <option value="Wild-caught">Wild-caught</option>
                                                <option value="Rescue">Rescue</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Tags */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <button type="button" onClick={() => toggleSection('tags')} className="w-full flex justify-between items-center text-left hover:bg-gray-100 p-2 rounded transition-colors">
                                        <h3 className="text-base font-semibold text-gray-700 flex items-center gap-1.5"><Tag size={16} className="flex-shrink-0" /> Tags</h3>
                                        <div className="text-gray-700 flex-shrink-0">
                                            {sectionsCollapsed.tags ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </button>
                                    {!sectionsCollapsed.tags && (
                                        <div className="mt-3 pt-3 border-t space-y-3">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Tags (Lines, Enclosures, etc)</label>
                                            <input type="text" placeholder="Type and press Enter or comma to add tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); const trimmed = tagInput.trim(); if (trimmed && !formData.tags.includes(trimmed)) { setFormData({ ...formData, tags: [...formData.tags, trimmed] }); setTagInput(''); } } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) { setFormData({ ...formData, tags: formData.tags.slice(0, -1) }); } }} onBlur={() => { const trimmed = tagInput.trim(); if (trimmed && !formData.tags.includes(trimmed)) { setFormData({ ...formData, tags: [...formData.tags, trimmed] }); setTagInput(''); } }} className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            {formData.tags.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {formData.tags.map((tag, idx) => (
                                                        <span key={idx} className="inline-flex items-center bg-primary text-black text-xs font-semibold px-3 py-1 rounded-full">
                                                            {tag}
                                                            <button type="button" onClick={() => { const newTags = formData.tags.filter((_, i) => i !== idx); setFormData({ ...formData, tags: newTags }); }} className="ml-2 text-black hover:text-gray-600"><Trash2 size={12} /></button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <FormSection title="Appearance" icon={<Palette size={16} />} initiallyOpen>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Color</label>
                                            <input type="text" name="color" value={formData.color} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Pattern</label>
                                            <input type="text" name="coatPattern" value={formData.coatPattern} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="e.g., Solid, Hooded, Brindle" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Coat Type</label>
                                            <input type="text" name="coat" value={formData.coat} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="e.g., Short, Long, Rex" />
                                        </div>
                                        {(formData.species === 'Rat' || formData.species === 'Fancy Rat') && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Earset</label>
                                                <input type="text" name="earset" value={formData.earset} onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                    placeholder="e.g., Standard, Dumbo" />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Phenotype</label>
                                            <input type="text" name="phenotype" value={formData.phenotype || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="Observable traits" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Morph</label>
                                            <input type="text" name="morph" value={formData.morph || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="Mutation/Morph" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Markings</label>
                                            <input type="text" name="markings" value={formData.markings || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="Body markings/patterns" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Eye Color</label>
                                            <input type="text" name="eyeColor" value={formData.eyeColor || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="Eye color" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Nail Color</label>
                                            <input type="text" name="nailColor" value={formData.nailColor || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="Nail/claw color" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Size</label>
                                            <input type="text" name="size" value={formData.size || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="e.g., Standard, Dwarf" />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Carrier Traits</label>
                                            <input type="text" name="carrierTraits" value={formData.carrierTraits || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="Genetic traits carried" />
                                        </div>
                                    </div>
                                </FormSection>
                                <FormSection title="Genetic Code" icon={<Dna size={16} />}>
                                    <GeneticCodeBuilder species={formData.species} gender={formData.gender} value={formData.geneticCode} onChange={(v) => setFormData(p => ({ ...p, geneticCode: v }))} />
                                </FormSection>
                                <FormSection title="Life Stage" icon={<Sprout size={16} />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Life Stage</label>
                                            <select name="lifeStage" value={formData.lifeStage} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                                <option value="">Unknown</option>
                                                <option value="Newborn">Newborn</option>
                                                <option value="Juvenile">Juvenile</option>
                                                <option value="Sub-Adult">Sub-Adult</option>
                                                <option value="Adult">Adult</option>
                                                <option value="Senior">Senior</option>
                                                <option value="Mixed">Mixed</option>
                                            </select>
                                        </div>
                                    </div>
                                </FormSection>
                                <FormSection title="Measurements & Growth Tracking" icon={<Ruler size={16} />}>
                                    <div className="space-y-6">
                                        {/* Current Measurement Display */}
                                        {(parseJsonArrayField(formData.growthRecords) || []).length > 0 && (() => {
                                            const sorted = [...(parseJsonArrayField(formData.growthRecords) || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
                                            const mostRecentWeight = sorted[0];
                                            const mostRecentLength = sorted.find(r => r.length);
                                            const mostRecentHeight = sorted.find(r => r.height);
                                            const mostRecentGirth = sorted.find(r => r.chestGirth);
                                            
                                            return (
                                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
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

                                        {/* Weight Growth Curve (shown once 2+ dated weight entries exist) */}
                                        {(() => {
                                            const records = parseJsonArrayField(formData.growthRecords) || [];
                                            const sorted = records
                                                .filter(r => r.date && r.weight && !isNaN(parseFloat(r.weight)))
                                                .sort((a, b) => new Date(a.date) - new Date(b.date));
                                            if (sorted.length < 2) return null;

                                            const weights = sorted.map(r => parseFloat(r.weight));
                                            const width = 500;
                                            const height = 220;
                                            const margin = { top: 16, right: 20, bottom: 36, left: 60 };
                                            const graphWidth = width - margin.left - margin.right;
                                            const graphHeight = height - margin.top - margin.bottom;

                                            const minWeight = Math.min(...weights);
                                            const maxWeight = Math.max(...weights);
                                            const padding = (maxWeight - minWeight) * 0.1 || 5;
                                            const chartMin = Math.max(0, minWeight - padding);
                                            const chartMax = maxWeight + padding;
                                            const range = chartMax - chartMin || 1;

                                            const points = sorted.map((r, idx) => ({
                                                x: margin.left + (idx / Math.max(1, sorted.length - 1)) * graphWidth,
                                                y: margin.top + graphHeight - ((parseFloat(r.weight) - chartMin) / range) * graphHeight,
                                                weight: r.weight,
                                                date: r.date,
                                                notes: r.notes,
                                            }));

                                            const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                                            return (
                                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                        <span className="inline-block w-3 h-1 bg-blue-500 rounded"></span>
                                                        Weight Growth Curve
                                                    </h4>
                                                    <svg width="100%" height="220" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: '100%' }} preserveAspectRatio="xMidYMid meet">
                                                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                                            const y = margin.top + graphHeight * (1 - ratio);
                                                            const axisLabel = (chartMin + range * ratio).toFixed(1);
                                                            return (
                                                                <g key={`weight-grid-${i}`}>
                                                                    <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                                                                    <text x={margin.left - 10} y={y} textAnchor="end" dy="0.3em" fontSize="10" fill="#666">{axisLabel}</text>
                                                                </g>
                                                            );
                                                        })}
                                                        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#3b82f6" strokeWidth="2" />
                                                        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#333" strokeWidth="2" />
                                                        {points.map((p, i) => (
                                                            i % Math.max(1, Math.floor(points.length / 5)) === 0 && (
                                                                <text key={`weight-date-${i}`} x={p.x} y={height - margin.bottom + 16} textAnchor="middle" fontSize="9" fill="#666">
                                                                    {new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                </text>
                                                            )
                                                        ))}
                                                        <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        {points.map((p, i) => (
                                                            <circle key={`weight-point-${i}`} cx={p.x} cy={p.y} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1.5">
                                                                <title>{`Date: ${p.date}\nWeight: ${p.weight} ${measurementUnits.weight}${p.notes ? `\nNotes: ${p.notes}` : ''}`}</title>
                                                            </circle>
                                                        ))}
                                                    </svg>
                                                    <p className="text-xs text-gray-500 mt-1">Hover over points to see exact values.</p>
                                                </div>
                                            );
                                        })()}

                                        {/* Measurement Units */}
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                            <p className="text-xs font-medium text-gray-700 mb-2">Measurement Units</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600">Weight Unit</label>
                                                    <select value={measurementUnits.weight} onChange={(e) => setMeasurementUnits({...measurementUnits, weight: e.target.value})} className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white">
                                                        <option value="g">Grams (g)</option>
                                                        <option value="kg">Kilograms (kg)</option>
                                                        <option value="lb">Pounds (lb)</option>
                                                        <option value="oz">Ounces (oz)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600">Length Unit</label>
                                                    <select value={measurementUnits.length} onChange={(e) => setMeasurementUnits({...measurementUnits, length: e.target.value})} className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white">
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
                                            <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Date</label>
                                                    <DatePicker value={newMeasurement.date} onChange={(e) => setNewMeasurement({...newMeasurement, date: e.target.value})} className="mt-1 p-2 text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Weight ({measurementUnits.weight})</label>
                                                    <input type="number" step="0.1" value={newMeasurement.weight} onChange={(e) => setNewMeasurement({...newMeasurement, weight: e.target.value})} placeholder={`e.g., ${measurementUnits.weight === 'g' ? '450' : measurementUnits.weight === 'kg' ? '0.45' : measurementUnits.weight === 'lb' ? '1' : '16'}`} className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Body Length ({measurementUnits.length})</label>
                                                    <input type="number" step="0.1" value={newMeasurement.length} onChange={(e) => setNewMeasurement({...newMeasurement, length: e.target.value})} placeholder={`e.g., ${measurementUnits.length === 'cm' ? '20' : measurementUnits.length === 'm' ? '0.2' : measurementUnits.length === 'in' ? '8' : '0.66'}`} className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Height at Withers ({measurementUnits.length})</label>
                                                    <input type="number" step="0.1" value={newMeasurement.height} onChange={(e) => setNewMeasurement({...newMeasurement, height: e.target.value})} placeholder={`e.g., ${measurementUnits.length === 'cm' ? '25' : measurementUnits.length === 'm' ? '0.25' : measurementUnits.length === 'in' ? '10' : '0.83'}`} className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                                </div>
                                            </div>
                                            <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Chest Girth ({measurementUnits.length})</label>
                                                    <input type="number" step="0.1" value={newMeasurement.chestGirth} onChange={(e) => setNewMeasurement({...newMeasurement, chestGirth: e.target.value})} placeholder={`e.g., ${measurementUnits.length === 'cm' ? '30' : measurementUnits.length === 'm' ? '0.3' : measurementUnits.length === 'in' ? '12' : '1'}`} className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Body Condition Score</label>
                                                    <select value={newMeasurement.bcs} onChange={(e) => setNewMeasurement({...newMeasurement, bcs: e.target.value})} className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
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
                                                    <input type="text" value={newMeasurement.notes} onChange={(e) => setNewMeasurement({...newMeasurement, notes: e.target.value})} placeholder="e.g., pregnant, sick" className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                                </div>
                                            </div>
                                            <button type="button" onClick={addMeasurement} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">Add Measurement</button>
                                        </div>

                                        {/* Measurements List */}
                                        {(parseJsonArrayField(formData.growthRecords) || []).length > 0 && (
                                            <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                                                {(parseJsonArrayField(formData.growthRecords) || []).map((record) => (
                                                    <div key={record.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 text-sm">
                                                        <div className="flex gap-4 text-gray-700 flex-1 flex-wrap">
                                                            <span className="font-medium">{record.date}</span>
                                                            <span>{record.weight} {measurementUnits.weight}</span>
                                                            {record.length && (<span>L: {record.length} {measurementUnits.length}</span>)}
                                                            {record.height && (<span>H: {record.height} {measurementUnits.length}</span>)}
                                                            {record.chestGirth && (<span>G: {record.chestGirth} {measurementUnits.length}</span>)}
                                                            {record.bcs && (<><span className="mx-2"></span><span className="text-gray-700">BCS: {record.bcs}</span></>)}
                                                            {record.notes && (<span className="ml-2 text-xs text-gray-500 italic">({record.notes})</span>)}
                                                        </div>
                                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, growthRecords: (parseJsonArrayField(prev.growthRecords) || []).filter(r => r.id !== record.id) }))} className="text-red-500 hover:text-red-700 p-1" title="Delete measurement">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </FormSection>
                            </div>
                        )}

                        {activeTab === 'gallery' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Gallery Management</h3>
                                <p className="text-sm text-gray-500">
                                    Use the arrows to reorder images. The first image is the primary one. Click the star to move an image to the first position.
                                </p>
                                {galleryImages.length === 0 ? (
                                    <div className="text-center py-16 text-gray-400">
                                        <Camera size={48} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium">No images yet</p>
                                        <p className="text-xs mt-1">Add images using the uploader in the main section.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {galleryImages.map((img, index) => (
                                            <div key={img.id} className={`relative group aspect-square rounded-lg overflow-hidden border-2 bg-gray-100
                                                ${index === 0 ? 'border-primary' : 'border-gray-200'}`}>
                                                <img src={img.url} alt={`Gallery item ${index + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setAsPrimaryImage(img.id)}
                                                        className={`p-2 rounded-full transition-colors ${index === 0 ? 'bg-primary text-black' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                                        title="Set as primary image"
                                                    >
                                                        <Star size={18} fill={index === 0 ? 'currentColor' : 'none'} />
                                                    </button>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveImage(index, 'left')}
                                                            disabled={index === 0}
                                                            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-30"
                                                            title="Move left"
                                                        >
                                                            <ArrowLeft size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveImage(index, 'right')}
                                                            disabled={index === galleryImages.length - 1}
                                                            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-30"
                                                            title="Move right"
                                                        >
                                                            <ArrowRight size={16} />
                                                        </button>
                                                    </div>
                                                    <button type="button" onClick={() => deleteImage(img.id)} className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600" title="Delete image">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] rounded px-1.5 py-0.5 font-bold">
                                                    {index + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'health' && (
                            <div className="space-y-4">
                                <FormSection title={
                                    (() => {
                                        const { status, badgeColor, factors, isOverridden, calculatedStatus } = calculateHealthStatus();
                                        return (
                                            <div className="flex items-center justify-between w-full">
                                                <span>Active Medical Records</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-right">
                                                        <div className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColor} inline-block`}>
                                                            {isOverridden && <span className="text-xs font-bold mr-1">⚙️ OVERRIDE:</span>}
                                                            {status}
                                                        </div>
                                                        {isOverridden && (
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                (calculated: {calculatedStatus})
                                                            </div>
                                                        )}
                                                    </div>
                                                    {factors.length > 0 && (
                                                        <div className="group relative">
                                                            <Info size={16} className="text-gray-500 cursor-help" />
                                                            <div className="hidden group-hover:block absolute right-0 bg-gray-800 text-white text-xs p-2 rounded-md whitespace-nowrap z-10 -mr-2">
                                                                <p className="font-semibold mb-1">Factors:</p>
                                                                {factors.map((f, i) => <p key={i}>• {f}</p>)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()
                                } icon={<Pill size={16} />}>
                                    {/* Health Status Override */}
                                    <div className="space-y-2 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-semibold text-gray-700">Manual Override</label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (healthStatusOverride) {
                                                        setHealthStatusOverride(null);
                                                        setHealthStatusOverrideNotes('');
                                                        setFormData(prev => ({ ...prev, healthStatusOverride: null, healthStatusOverrideNotes: '' }));
                                                    } else {
                                                        setHealthStatusOverride('Good');
                                                        setFormData(prev => ({ ...prev, healthStatusOverride: 'Good', healthStatusOverrideNotes: '' }));
                                                    }
                                                }}
                                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${healthStatusOverride ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                            >
                                                {healthStatusOverride ? 'Disable Override' : 'Enable Override'}
                                            </button>
                                        </div>
                                        {healthStatusOverride && (
                                            <div className="space-y-3 mt-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Status</label>
                                                    <select 
                                                        value={healthStatusOverride} 
                                                        onChange={(e) => {
                                                            setHealthStatusOverride(e.target.value);
                                                            setFormData(prev => ({ ...prev, healthStatusOverride: e.target.value }));
                                                        }}
                                                        className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                    >
                                                        <option value="Excellent">Excellent</option>
                                                        <option value="Good">Good</option>
                                                        <option value="Fair">Fair</option>
                                                        <option value="Poor">Poor</option>
                                                        <option value="Critical">Critical</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Reason for Override</label>
                                                    <textarea 
                                                        value={healthStatusOverrideNotes}
                                                        onChange={(e) => {
                                                            setHealthStatusOverrideNotes(e.target.value);
                                                            setFormData(prev => ({ ...prev, healthStatusOverrideNotes: e.target.value }));
                                                        }}
                                                        placeholder="e.g., Well-managed chronic condition, good prognosis, owner very attentive..."
                                                        className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md resize-none"
                                                        rows="2"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quarantine Status */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-700">Quarantine Status</h4>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Status</label>
                                                    <select name="status" value={formData.quarantineDetails?.status || 'None'} onChange={handleQuarantineChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                        <option value="None">None</option>
                                                        <option value="Quarantine">Quarantine</option>
                                                        <option value="Isolation">Isolation</option>
                                                    </select>
                                                </div>
                                                {(formData.quarantineDetails?.status === 'Quarantine' || formData.quarantineDetails?.status === 'Isolation') && (
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700">Type/Reason</label>
                                                        <select name="type" value={formData.quarantineDetails?.type || ''} onChange={handleQuarantineChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                            <option value="">Select type...</option>
                                                            <option value="Preventive - New Arrival">Preventive - New Arrival</option>
                                                            <option value="Preventive - Intake">Preventive - Intake</option>
                                                            <option value="Medical - Illness/URI">Medical - Illness/URI</option>
                                                            <option value="Medical - Contagious Disease">Medical - Contagious Disease</option>
                                                            <option value="Medical - Recovery">Medical - Recovery</option>
                                                            <option value="Behavioral - Aggression">Behavioral - Aggression</option>
                                                            <option value="Behavioral - Fear/Stress">Behavioral - Fear/Stress</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Additional Notes</label>
                                                    <input type="text" name="reason" value={formData.quarantineDetails?.reason || ''} onChange={handleQuarantineChange} placeholder="e.g., Specific illness, concerns, observations" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Start Date</label>
                                                    <DatePicker name="startDate" value={formData.quarantineDetails?.startDate || ''} onChange={handleQuarantineChange} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">End Date (Optional)</label>
                                                    <DatePicker name="endDate" value={formData.quarantineDetails?.endDate || ''} onChange={handleQuarantineChange} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medications */}
                                    <div className="space-y-2 pt-3 border-t">
                                        <h4 className="text-sm font-semibold text-gray-700">Active Medications</h4>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                            {/* Mode Toggle */}
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setMedicationMode('manual')} className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${medicationMode === 'manual' ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Manual Entry</button>
                                                <button type="button" onClick={() => setMedicationMode('supply')} className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${medicationMode === 'supply' ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>From Supplies</button>
                                            </div>

                                            {medicationMode === 'manual' ? (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <input type="text" value={newMedication.name} onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })} placeholder="Medication Name" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                        <input type="text" value={newMedication.dose} onChange={(e) => setNewMedication({ ...newMedication, dose: e.target.value })} placeholder="Dose (e.g., 0.1ml)" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                        <DatePicker value={newMedication.startDate} onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })} placeholder="Start Date" className="py-1.5 px-2 text-sm" />
                                                        <DatePicker value={newMedication.stopDate} onChange={(e) => setNewMedication({ ...newMedication, stopDate: e.target.value })} placeholder="Stop Date" className="py-1.5 px-2 text-sm" />
                                                        <div className="col-span-2 flex gap-2 items-center">
                                                            <input type="number" value={newMedication.intervalValue} onChange={(e) => setNewMedication({ ...newMedication, intervalValue: e.target.value })} placeholder="Interval" className="w-20 py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                            <select value={newMedication.intervalUnit} onChange={(e) => setNewMedication({ ...newMedication, intervalUnit: e.target.value })} className="py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                                <option value="hours">Hours</option><option value="days">Days</option><option value="weeks">Weeks</option>
                                                            </select>
                                                            <input type="text" value={newMedication.notes} onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })} placeholder="Notes" className="flex-1 py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={addMedication} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Medication</button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="space-y-2">
                                                        <label className="block text-xs font-medium text-gray-700">Search & Select Medication Supply</label>
                                                        <input type="text" value={medicationSupplySearch} onChange={(e) => setMedicationSupplySearch(e.target.value)} placeholder="Search for medication supplies..." className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                    </div>

                                                    {loadingMedicationSupplies && (
                                                        <div className="text-xs text-gray-500 py-2">Loading supplies...</div>
                                                    )}

                                                    {!loadingMedicationSupplies && (
                                                        <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                                                            {availableMedicationSupplies.filter(supply =>
                                                                supply.name?.toLowerCase().includes(medicationSupplySearch.toLowerCase()) ||
                                                                supply.category?.toLowerCase().includes(medicationSupplySearch.toLowerCase())
                                                            ).length > 0 ? (
                                                                availableMedicationSupplies.filter(supply =>
                                                                    supply.name?.toLowerCase().includes(medicationSupplySearch.toLowerCase()) ||
                                                                    supply.category?.toLowerCase().includes(medicationSupplySearch.toLowerCase())
                                                                ).map(supply => (
                                                                    <button
                                                                        key={supply.id || supply._id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedMedicationSupply(supply);
                                                                            setMedicationSupplySearch('');
                                                                        }}
                                                                        className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${selectedMedicationSupply?.id === supply.id || selectedMedicationSupply?._id === supply._id ? 'bg-primary text-black' : 'hover:bg-gray-100'}`}
                                                                    >
                                                                        <div className="font-medium">{supply.name}</div>
                                                                        {supply.quantity && <div className="text-xs text-gray-600">Stock: {supply.quantity}</div>}
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <div className="px-3 py-2 text-xs text-gray-500 text-center">No medication supplies found</div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {selectedMedicationSupply && (
                                                        <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                                                            <p className="text-xs text-gray-600 mb-2"><strong>Selected:</strong> {selectedMedicationSupply.name}</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700">Dose</label>
                                                                    <input type="text" value={newMedication.dose} onChange={(e) => setNewMedication({ ...newMedication, dose: e.target.value })} placeholder="e.g., 0.1ml" className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700">Start Date</label>
                                                                    <DatePicker value={newMedication.startDate} onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })} className="w-full py-1.5 px-2 text-sm" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700">Stop Date</label>
                                                                    <DatePicker value={newMedication.stopDate} onChange={(e) => setNewMedication({ ...newMedication, stopDate: e.target.value })} className="w-full py-1.5 px-2 text-sm" />
                                                                </div>
                                                                <div className="flex gap-2 items-end">
                                                                    <div className="flex-1">
                                                                        <label className="block text-xs font-medium text-gray-700">Interval</label>
                                                                        <input type="number" value={newMedication.intervalValue} onChange={(e) => setNewMedication({ ...newMedication, intervalValue: e.target.value })} placeholder="e.g., 12" className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <label className="block text-xs font-medium text-gray-700">Unit</label>
                                                                        <select value={newMedication.intervalUnit} onChange={(e) => setNewMedication({ ...newMedication, intervalUnit: e.target.value })} className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                                            <option value="hours">Hours</option>
                                                                            <option value="days">Days</option>
                                                                            <option value="weeks">Weeks</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <label className="block text-xs font-medium text-gray-700">Notes</label>
                                                                    <input type="text" value={newMedication.notes} onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })} placeholder="Additional notes" className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                                </div>
                                                            </div>
                                                            <button type="button" onClick={addMedication} className="w-full px-3 py-1.5 mt-2 bg-green-500 text-white rounded-md text-xs font-medium hover:bg-green-600">Add from Supply</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {(formData.medications || []).filter(Boolean).map((rec, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border">
                                                <span>
                                                    {rec.name} {rec.dose} {rec.source === 'supply' && <span className="text-xs text-blue-600 font-medium">(from supply)</span>} (From: {rec.startDate || 'N/A'} To: {rec.stopDate || 'N/A'})
                                                </span>
                                                <button type="button" onClick={() => removeArrayItem('medications', i)}><Trash2 size={14} className="text-red-500" /></button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Medical Conditions */}
                                    <div className="space-y-2 pt-3 border-t">
                                        <h4 className="text-sm font-semibold text-gray-700">Medical Conditions</h4>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input type="text" value={newMedicalCondition.name} onChange={(e) => setNewMedicalCondition({ ...newMedicalCondition, name: e.target.value })} placeholder="Condition Name" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newMedicalCondition.notes} onChange={(e) => setNewMedicalCondition({ ...newMedicalCondition, notes: e.target.value })} placeholder="Notes" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addMedicalCondition} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Medical Condition</button>
                                        </div>
                                        {(formData.medicalConditions || []).filter(Boolean).map((rec, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border">
                                                <span>{rec.name} {rec.notes && `(${rec.notes})`}</span>
                                                <button type="button" onClick={() => removeArrayItem('medicalConditions', i)}><Trash2 size={14} className="text-red-500" /></button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Allergies */}
                                    <div className="space-y-2 pt-3 border-t">
                                        <h4 className="text-sm font-semibold text-gray-700">Allergies</h4>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input type="text" value={newAllergy.name} onChange={(e) => setNewAllergy({ ...newAllergy, name: e.target.value })} placeholder="Allergy Name" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newAllergy.notes} onChange={(e) => setNewAllergy({ ...newAllergy, notes: e.target.value })} placeholder="Notes" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addAllergy} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Allergy</button>
                                        </div>
                                        {(formData.allergies || []).filter(Boolean).map((rec, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border">
                                                <span>{rec.name} {rec.notes && `(${rec.notes})`}</span>
                                                <button type="button" onClick={() => removeArrayItem('allergies', i)}><Trash2 size={14} className="text-red-500" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </FormSection>

                                <FormSection title="Preventive Care" icon={<Shield size={16} />} initiallyOpen>
                                    {/* Vaccinations */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-700">Vaccinations</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <DatePicker value={newVaccination.date} onChange={(e) => setNewVaccination({ ...newVaccination, date: e.target.value })} className="py-1.5 px-2 text-sm" />
                                                <input type="text" value={newVaccination.name} onChange={(e) => setNewVaccination({ ...newVaccination, name: e.target.value })} placeholder="Vaccination Name" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newVaccination.notes} onChange={(e) => setNewVaccination({ ...newVaccination, notes: e.target.value })} placeholder="Notes" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addVaccination} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Vaccination</button>
                                        </div>
                                    {(formData.vaccinations || []).filter(Boolean).map((rec, i) => <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border"><span>{rec.date}: {rec.name} {rec.notes && `(${rec.notes})`}</span><button type="button" onClick={() => removeArrayItem('vaccinations', i)}><Trash2 size={14} className="text-red-500" /></button></div>)}
                                    </div>
                                    {/* Deworming */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="text-sm font-semibold text-gray-700">Deworming</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <DatePicker value={newDeworming.date} onChange={(e) => setNewDeworming({ ...newDeworming, date: e.target.value })} className="py-1.5 px-2 text-sm" />
                                                <input type="text" value={newDeworming.medication} onChange={(e) => setNewDeworming({ ...newDeworming, medication: e.target.value })} placeholder="Medication" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newDeworming.notes} onChange={(e) => setNewDeworming({ ...newDeworming, notes: e.target.value })} placeholder="Notes" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addDeworming} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Deworming</button>
                                        </div>
                                    {(formData.dewormingRecords || []).filter(Boolean).map((rec, i) => <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border"><span>{rec.date}: {rec.medication} {rec.notes && `(${rec.notes})`}</span><button type="button" onClick={() => removeArrayItem('dewormingRecords', i)}><Trash2 size={14} className="text-red-500" /></button></div>)}
                                    </div>
                                    {/* Parasite Control */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="text-sm font-semibold text-gray-700">Parasite Control</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <DatePicker value={newParasiteControl.date} onChange={(e) => setNewParasiteControl({ ...newParasiteControl, date: e.target.value })} className="py-1.5 px-2 text-sm" />
                                                <input type="text" value={newParasiteControl.treatment} onChange={(e) => setNewParasiteControl({ ...newParasiteControl, treatment: e.target.value })} placeholder="e.g., Flea/tick treatment" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newParasiteControl.notes} onChange={(e) => setNewParasiteControl({ ...newParasiteControl, notes: e.target.value })} placeholder="Notes" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addParasiteControl} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Parasite Control</button>
                                        </div>
                                    {(formData.parasiteControl || []).filter(Boolean).map((rec, i) => <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border"><span>{rec.date}: {rec.treatment} {rec.notes && `(${rec.notes})`}</span><button type="button" onClick={() => removeArrayItem('parasiteControl', i)}><Trash2 size={14} className="text-red-500" /></button></div>)}
                                    
                                    {/* Parasite Prevention Schedule - Timeline Events */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="text-sm font-semibold text-gray-700">Prevention Schedule (Recurring Events)</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <input type="text" value={newParasiteScheduleTreatment} onChange={(e) => setNewParasiteScheduleTreatment(e.target.value)} placeholder="e.g., Flea/Tick Prevention, Deworming" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <DatePicker value={newParasiteScheduleDate} onChange={(e) => setNewParasiteScheduleDate(e.target.value)} className="py-1.5 px-2 text-sm" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Interval</label>
                                                    <input type="number" value={newParasiteScheduleInterval} onChange={(e) => setNewParasiteScheduleInterval(e.target.value)} placeholder="e.g., 1, 30, 90" min="1" className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                                                    <select value={newParasiteScheduleUnit} onChange={(e) => setNewParasiteScheduleUnit(e.target.value)} className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                        <option value="day">Days</option>
                                                        <option value="week">Weeks</option>
                                                        <option value="month">Months</option>
                                                        <option value="year">Years</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button type="button" onClick={addParasiteScheduleEvent} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Schedule Event</button>
                                        </div>
                                        {(parseJsonArrayField(formData.parasitePreventionSchedule) || []).filter(Boolean).map((schedule, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-blue-50 rounded border border-blue-200">
                                                <span>
                                                    <strong>{schedule.treatment}</strong> starting {schedule.startDate}
                                                    {schedule.interval && schedule.intervalUnit ? ` (every ${schedule.interval} ${schedule.intervalUnit}s)` : ''}
                                                </span>
                                                <button type="button" onClick={() => removeArrayItem('parasitePreventionSchedule', i)}><Trash2 size={14} className="text-red-500" /></button>
                                            </div>
                                        ))}
                                    </div>
                                    </div>
                                </FormSection>

                                <FormSection title="Health Clearances & Screening" icon={<Hospital size={16} />}>
                                    <div className="space-y-4">
                                        {/* Structured Health Clearances */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                            <h4 className="text-sm font-semibold text-gray-700">Add Health Clearance</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <select value={newHealthClearance.clearanceType} onChange={(e) => setNewHealthClearance({ ...newHealthClearance, clearanceType: e.target.value })} className="py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                    <option value="">Select Clearance Type...</option>
                                                    <option value="OFA Hips">OFA Hips</option>
                                                    <option value="OFA Elbows">OFA Elbows</option>
                                                    <option value="OFA Cardiac">OFA Cardiac</option>
                                                    <option value="OFA Eyes">OFA Eyes</option>
                                                    <option value="PennHIP Hips">PennHIP Hips</option>
                                                    <option value="CAER Eyes">CAER Eyes</option>
                                                    <option value="Genetic Test">Genetic Test</option>
                                                    <option value="Health Panel">Health Panel</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <input type="text" value={newHealthClearance.result} onChange={(e) => setNewHealthClearance({ ...newHealthClearance, result: e.target.value })} placeholder="Result (e.g., Excellent, Good)" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <DatePicker value={newHealthClearance.dateIssued} onChange={(e) => setNewHealthClearance({ ...newHealthClearance, dateIssued: e.target.value })} className="py-1.5 px-2 text-sm" />
                                                <input type="text" value={newHealthClearance.certificateId} onChange={(e) => setNewHealthClearance({ ...newHealthClearance, certificateId: e.target.value })} placeholder="Certificate ID (e.g., XX-12345E24M)" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <textarea value={newHealthClearance.notes} onChange={(e) => setNewHealthClearance({ ...newHealthClearance, notes: e.target.value })} placeholder="Additional notes (optional)" rows="2" className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            <button type="button" onClick={addHealthClearance} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Clearance</button>
                                        </div>

                                        {/* Display existing clearances */}
                                        {(formData.healthClearances || []).length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold text-gray-700">Recorded Clearances</h4>
                                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                                    {(formData.healthClearances || []).map((clearance, i) => (
                                                        <div key={i} className="p-2 bg-green-50 rounded-md border border-green-200 flex justify-between items-start">
                                                            <div className="flex-1 text-xs">
                                                                <p className="font-semibold text-gray-800">{clearance.clearanceType}</p>
                                                                <p className="text-gray-600">Result: <span className="font-medium">{clearance.result}</span></p>
                                                                <p className="text-gray-600">Date: {formatDate(clearance.dateIssued)}</p>
                                                                {clearance.certificateId && <p className="text-gray-600">ID: <span className="font-mono text-xs">{clearance.certificateId}</span></p>}
                                                                {clearance.notes && <p className="text-gray-600 mt-1 italic">Note: {clearance.notes}</p>}
                                                            </div>
                                                            <button type="button" onClick={() => removeArrayItem('healthClearances', i)} className="ml-2 flex-shrink-0">
                                                                <Trash2 size={14} className="text-red-500" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Legacy fields - still available for reference */}
                                        <div className="border-t pt-3 mt-3">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Other Health Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Spay/Neuter Date</label>
                                                    <DatePicker name="spayNeuterDate" value={formData.spayNeuterDate || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Heartworm Status</label>
                                                    <select name="heartwormStatus" value={formData.heartwormStatus || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                        <option value="">Select...</option>
                                                        <option value="Negative">Negative</option>
                                                        <option value="Positive">Positive</option>
                                                        <option value="On Prevention">On Prevention</option>
                                                        <option value="Unknown">Unknown</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Genetic Test Results</label>
                                                    <textarea name="geneticTestResults" value={formData.geneticTestResults || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Embark: Clear for DM, vWD" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Chronic Conditions</label>
                                                    <textarea name="chronicConditions" value={formData.chronicConditions || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Allergies, arthritis" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </FormSection>

                                <FormSection title="Procedures & Diagnostics" icon={<Microscope size={16} />}>
                                    {/* Medical Procedures */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-700">Medical Procedures</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <DatePicker value={newProcedure.date} onChange={(e) => setNewProcedure({ ...newProcedure, date: e.target.value })} className="py-1.5 px-2 text-sm" />
                                                <input type="text" value={newProcedure.name} onChange={(e) => setNewProcedure({ ...newProcedure, name: e.target.value })} placeholder="Procedure Name" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newProcedure.notes} onChange={(e) => setNewProcedure({ ...newProcedure, notes: e.target.value })} placeholder="Notes" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addMedicalProcedure} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Procedure</button>
                                        </div>
                                    {(formData.medicalProcedures || []).filter(Boolean).map((rec, i) => <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border"><span>{rec.date}: {rec.name} {rec.notes && `(${rec.notes})`}</span><button type="button" onClick={() => removeArrayItem('medicalProcedures', i)}><Trash2 size={14} className="text-red-500" /></button></div>)}
                                    </div>
                                    {/* Lab Results */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="text-sm font-semibold text-gray-700">Lab Results</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <DatePicker value={newLabResult.date} onChange={(e) => setNewLabResult({ ...newLabResult, date: e.target.value })} className="py-1.5 px-2 text-sm" />
                                                <input type="text" value={newLabResult.testName} onChange={(e) => setNewLabResult({ ...newLabResult, testName: e.target.value })} placeholder="Test Name" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newLabResult.result} onChange={(e) => setNewLabResult({ ...newLabResult, result: e.target.value })} placeholder="Result" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addLabResult} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Lab Result</button>
                                        </div>
                                    {(formData.labResults || []).filter(Boolean).map((rec, i) => <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border"><span>{rec.date}: {rec.testName} - {rec.result}</span><button type="button" onClick={() => removeArrayItem('labResults', i)}><Trash2 size={14} className="text-red-500" /></button></div>)}
                                    </div>
                                </FormSection>

                                <FormSection title="Veterinary Care" icon={<Stethoscope size={16} />}>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Primary Veterinarian</label>
                                        <input type="text" name="primaryVet" value={formData.primaryVet} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                    </div>
                                    {/* Vet Visits */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="text-sm font-semibold text-gray-700">Veterinary Visits</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <DatePicker value={newVetVisit.date} onChange={(e) => setNewVetVisit({ ...newVetVisit, date: e.target.value })} className="py-1.5 px-2 text-sm" />
                                                <input type="text" value={newVetVisit.reason} onChange={(e) => setNewVetVisit({ ...newVetVisit, reason: e.target.value })} placeholder="Reason for visit" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newVetVisit.notes} onChange={(e) => setNewVetVisit({ ...newVetVisit, notes: e.target.value })} placeholder="Notes" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addVetVisit} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Vet Visit</button>
                                        </div>
                                    {(formData.vetVisits || []).filter(Boolean).map((rec, i) => <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border"><span>{rec.date}: {rec.reason} {rec.notes && `(${rec.notes})`}</span><button type="button" onClick={() => removeArrayItem('vetVisits', i)}><Trash2 size={14} className="text-red-500" /></button></div>)}
                                    </div>
                                </FormSection>

                                <FormSection title="End of Life" icon={<Scale size={16} />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Deceased Date</label>
                                            <DatePicker name="deceasedDate" value={formData.deceasedDate} onChange={handleChange} maxDate={new Date()} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Cause of Death</label>
                                            <input type="text" name="causeOfDeath" value={formData.causeOfDeath} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Necropsy Results</label>
                                            <textarea name="necropsyResults" value={formData.necropsyResults} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">End of Life Care Notes</label>
                                            <textarea name="endOfLifeCareNotes" value={formData.endOfLifeCareNotes || ''} onChange={handleChange} rows="2"
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                placeholder="Wishes for cremation, burial, memorial" />
                                        </div>
                                    </div>
                                </FormSection>
                            </div>
                        )}
                        {activeTab === 'care' && (
                            <div className="space-y-4">
                                <FormSection title="Nutrition" icon={<UtensilsCrossed size={16} />} initiallyOpen>
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Diet</h4>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Diet Type</label>
                                                <input
                                                    type="text"
                                                    name="dietType"
                                                    value={formData.dietType}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                    placeholder="e.g., Pellets, fresh greens, mixed"
                                                />
                                            </div>

                                            <div className="pt-2 border-t">
                                                <label className="block text-xs font-semibold text-gray-700 mb-2">Diet Supplies</label>
                                                <div className="flex gap-2 mb-2">
                                                    <button type="button" onClick={() => setDietMode('manual')} className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dietMode === 'manual' ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Manual Entry</button>
                                                    <button type="button" onClick={() => setDietMode('supply')} className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dietMode === 'supply' ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>From Supplies</button>
                                                </div>
                                                {dietMode === 'manual' ? (
                                                    <div className="space-y-2">
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="e.g., Brand X Pellets"
                                                                value={dietManualEntry.name}
                                                                onChange={(e) => setDietManualEntry({ name: e.target.value })}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        if (!dietManualEntry.name.trim()) return;
                                                                        const existing = parseJsonArrayField(formData.dietSupplies) || [];
                                                                        setFormData(prev => ({ ...prev, dietSupplies: [...existing, { name: dietManualEntry.name.trim() }] }));
                                                                        setDietManualEntry({ name: '' });
                                                                    }
                                                                }}
                                                                className="flex-1 py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (!dietManualEntry.name.trim()) return;
                                                                    const existing = parseJsonArrayField(formData.dietSupplies) || [];
                                                                    setFormData(prev => ({ ...prev, dietSupplies: [...existing, { name: dietManualEntry.name.trim() }] }));
                                                                    setDietManualEntry({ name: '' });
                                                                }}
                                                                className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-black hover:bg-primary-dark flex items-center gap-1 flex-shrink-0"
                                                            >
                                                                <PlusCircle size={14} /> Add
                                                            </button>
                                                        </div>
                                                        {parseJsonArrayField(formData.dietSupplies).length > 0 ? (
                                                            <div className="space-y-1">
                                                                {parseJsonArrayField(formData.dietSupplies).map((s, i) => (
                                                                    <div key={i} className="flex justify-between items-center p-1.5 bg-blue-50 rounded text-xs">
                                                                        <span>{s.name}</span>
                                                                        <button type="button" onClick={() => {
                                                                            const updated = parseJsonArrayField(formData.dietSupplies).filter((_, idx) => idx !== i);
                                                                            setFormData(prev => ({ ...prev, dietSupplies: updated }));
                                                                        }} className="text-red-500"><Trash2 size={12} /></button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-gray-400 italic">No diet supplies added yet.</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Search diet supplies..."
                                                            value={dietSupplySearch}
                                                            onChange={(e) => setDietSupplySearch(e.target.value)}
                                                            className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                        />
                                                        {loadingDietSupplies && <p className="text-xs text-gray-500">Loading supplies...</p>}
                                                        <div className="bg-gray-50 border border-gray-300 rounded-md max-h-40 overflow-y-auto">
                                                            {availableDietSupplies
                                                                .filter(s => s.name?.toLowerCase().includes(dietSupplySearch.toLowerCase()))
                                                                .map(supply => (
                                                                    <div key={supply.id} className="p-2 border-b hover:bg-gray-100 cursor-pointer flex justify-between items-center text-xs" onClick={() => {
                                                                        setSelectedDietSupply(supply);
                                                                        const existing = parseJsonArrayField(formData.dietSupplies) || [];
                                                                        const newSupply = { id: supply.id, name: supply.name, category: supply.category };
                                                                        setFormData(prev => ({ ...prev, dietSupplies: [...existing, newSupply] }));
                                                                        setDietSupplySearch('');
                                                                    }}>
                                                                        <span>{supply.name}</span>
                                                                        <PlusCircle size={14} className="text-primary" />
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {parseJsonArrayField(formData.dietSupplies).map((s, i) => (
                                                                <div key={i} className="flex justify-between items-center p-1 bg-blue-50 rounded mt-1">
                                                                    <span>{s.name}</span>
                                                                    <button type="button" onClick={() => {
                                                                        const updated = parseJsonArrayField(formData.dietSupplies).filter((_, idx) => idx !== i);
                                                                        setFormData(prev => ({ ...prev, dietSupplies: updated }));
                                                                    }} className="text-red-500"><Trash2 size={12} /></button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Supplements</h4>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Supplements (legacy text)</label>
                                                <textarea
                                                    name="supplements"
                                                    value={formData.supplements}
                                                    onChange={handleChange}
                                                    rows="2"
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                    placeholder="Optional notes or list of supplements"
                                                />
                                            </div>

                                            <div className="pt-2 border-t">
                                                <label className="block text-xs font-semibold text-gray-700 mb-2">Supplement Supplies</label>
                                                <div className="flex gap-2 mb-2">
                                                    <button type="button" onClick={() => setSupplementMode('manual')} className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${supplementMode === 'manual' ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Manual Entry</button>
                                                    <button type="button" onClick={() => setSupplementMode('supply')} className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${supplementMode === 'supply' ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>From Supplies</button>
                                                </div>
                                                {supplementMode === 'manual' ? (
                                                    <div className="space-y-2">
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Name (e.g., Vitamin D3)"
                                                                value={supplementManualEntry.name}
                                                                onChange={(e) => setSupplementManualEntry(prev => ({ ...prev, name: e.target.value }))}
                                                                className="flex-1 py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Dosage (e.g., 1000 IU)"
                                                                value={supplementManualEntry.dosage}
                                                                onChange={(e) => setSupplementManualEntry(prev => ({ ...prev, dosage: e.target.value }))}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        if (!supplementManualEntry.name.trim()) return;
                                                                        const existing = parseJsonArrayField(formData.supplementSupplies) || [];
                                                                        setFormData(prev => ({ ...prev, supplementSupplies: [...existing, { name: supplementManualEntry.name.trim(), dosage: supplementManualEntry.dosage.trim() }] }));
                                                                        setSupplementManualEntry({ name: '', dosage: '' });
                                                                    }
                                                                }}
                                                                className="w-32 py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (!supplementManualEntry.name.trim()) return;
                                                                    const existing = parseJsonArrayField(formData.supplementSupplies) || [];
                                                                    setFormData(prev => ({ ...prev, supplementSupplies: [...existing, { name: supplementManualEntry.name.trim(), dosage: supplementManualEntry.dosage.trim() }] }));
                                                                    setSupplementManualEntry({ name: '', dosage: '' });
                                                                }}
                                                                className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-black hover:bg-primary-dark flex items-center gap-1 flex-shrink-0"
                                                            >
                                                                <PlusCircle size={14} /> Add
                                                            </button>
                                                        </div>
                                                        {parseJsonArrayField(formData.supplementSupplies).length > 0 ? (
                                                            <div className="space-y-1">
                                                                {parseJsonArrayField(formData.supplementSupplies).map((s, i) => (
                                                                    <div key={i} className="flex justify-between items-center p-1.5 bg-purple-50 rounded text-xs">
                                                                        <span>{s.name} {s.dosage && `(${s.dosage})`}</span>
                                                                        <button type="button" onClick={() => {
                                                                            const updated = parseJsonArrayField(formData.supplementSupplies).filter((_, idx) => idx !== i);
                                                                            setFormData(prev => ({ ...prev, supplementSupplies: updated }));
                                                                        }} className="text-red-500"><Trash2 size={12} /></button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-gray-400 italic">No supplements added yet.</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Search supplement supplies..."
                                                            value={supplementSupplySearch}
                                                            onChange={(e) => setSupplementSupplySearch(e.target.value)}
                                                            className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                        />
                                                        {loadingSupplementSupplies && <p className="text-xs text-gray-500">Loading supplies...</p>}
                                                        <div className="bg-gray-50 border border-gray-300 rounded-md max-h-40 overflow-y-auto">
                                                            {availableSupplementSupplies
                                                                .filter(s => s.name?.toLowerCase().includes(supplementSupplySearch.toLowerCase()))
                                                                .map(supply => (
                                                                    <div key={supply.id} className="p-2 border-b hover:bg-gray-100 cursor-pointer flex justify-between items-center text-xs" onClick={() => {
                                                                        setSelectedSupplementSupply(supply);
                                                                        const existing = parseJsonArrayField(formData.supplementSupplies) || [];
                                                                        const newSupply = { id: supply.id, name: supply.name, category: supply.category, dosage: supply.dosage || '' };
                                                                        setFormData(prev => ({ ...prev, supplementSupplies: [...existing, newSupply] }));
                                                                        setSupplementSupplySearch('');
                                                                    }}>
                                                                        <span>{supply.name}</span>
                                                                        <PlusCircle size={14} className="text-primary" />
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {parseJsonArrayField(formData.supplementSupplies).map((s, i) => (
                                                                <div key={i} className="flex justify-between items-center p-1 bg-purple-50 rounded mt-1">
                                                                    <span>{s.name} {s.dosage && `(${s.dosage})`}</span>
                                                                    <button type="button" onClick={() => {
                                                                        const updated = parseJsonArrayField(formData.supplementSupplies).filter((_, idx) => idx !== i);
                                                                        setFormData(prev => ({ ...prev, supplementSupplies: updated }));
                                                                    }} className="text-red-500"><Trash2 size={12} /></button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                            <h4 className="text-sm font-semibold text-gray-700">Schedule (feeds Feeding & Care tab later)</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Enabled</label>
                                                    <select
                                                        name="nutritionScheduleEnabled"
                                                        value={formData.nutritionSchedule?.enabled ? 'yes' : 'no'}
                                                        onChange={(e) => {
                                                            const enabled = e.target.value === 'yes';
                                                            setFormData(prev => ({ ...prev, nutritionSchedule: { ...(prev.nutritionSchedule || {}), enabled } }));
                                                        }}
                                                        className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                    >
                                                        <option value="yes">Yes</option>
                                                        <option value="no">No</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Start Date</label>
                                                    <DatePicker
                                                        value={formData.nutritionSchedule?.startDate || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setFormData(prev => ({ ...prev, nutritionSchedule: { ...(prev.nutritionSchedule || {}), startDate: val } }));
                                                        }}
                                                        className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Frequency</label>
                                                    <input
                                                        type="number"
                                                        value={formData.nutritionSchedule?.frequency || ''}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setFormData(prev => ({ ...prev, nutritionSchedule: { ...(prev.nutritionSchedule || {}), frequency: v } }));
                                                        }}
                                                        className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                        placeholder="e.g., 7"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Unit</label>
                                                    <select
                                                        value={formData.nutritionSchedule?.unit || 'days'}
                                                        onChange={(e) => {
                                                            const unit = e.target.value;
                                                            setFormData(prev => ({ ...prev, nutritionSchedule: { ...(prev.nutritionSchedule || {}), unit } }));
                                                        }}
                                                        className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                    >
                                                        <option value="hours">Hours</option>
                                                        <option value="days">Days</option>
                                                        <option value="weeks">Weeks</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Times/Day</label>
                                                    <input
                                                        type="number"
                                                        value={formData.nutritionSchedule?.timesPerDay || ''}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setFormData(prev => ({ ...prev, nutritionSchedule: { ...(prev.nutritionSchedule || {}), timesPerDay: v } }));
                                                        }}
                                                        className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                        placeholder="e.g., 2"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Notes</label>
                                                <textarea
                                                    value={formData.nutritionSchedule?.notes || ''}
                                                    onChange={(e) => {
                                                        const notes = e.target.value;
                                                        setFormData(prev => ({ ...prev, nutritionSchedule: { ...(prev.nutritionSchedule || {}), notes } }));
                                                    }}
                                                    rows="2"
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                    placeholder="e.g., reduce for juveniles"
                                                />
                                            </div>

                                            <div className="pt-2 border-t">
                                                <label className="block text-xs font-medium text-gray-700">Feeding Schedule (legacy text)</label>
                                                <textarea
                                                    name="feedingSchedule"
                                                    value={formData.feedingSchedule}
                                                    onChange={handleChange}
                                                    rows="2"
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Feeding Details & Management</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Portion Size/Amount Per Feeding</label><input type="text" name="portionSize" value={formData.portionSize || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., 2 cups, 50g, 1/4 cup pellets + 2 tbsp fresh" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Feeding Method</label><input type="text" name="feedingMethod" value={formData.feedingMethod || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Hand-fed, Self-fed, Free-choice, Timed bowl, Force-feeding" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Feeding Location/Container</label><input type="text" name="feedingLocation" value={formData.feedingLocation || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Separate bowl, Feeding station, Enclosure floor, Ceramic dish, Stainless steel feeder" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Water Access</label><input type="text" name="waterAccess" value={formData.waterAccess || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Free access, Water bottle, Water bowl (changed daily), Misting system, Soaking dish" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Feeding Pace & Behavior Notes</label><textarea name="feedingBehaviorNotes" value={formData.feedingBehaviorNotes || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Fast eater, needs to be monitored, Slow feeder requires time, Aggressive during feeding, Picky about presentation" /></div>
                                        </div>
                                    </div>

                                </FormSection>
                                <FormSection title="Housing & Environment" icon={<Home size={16} />}>
                                    {/* Enclosure Assignment */}
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-2 mb-4">
                                        <label className="block text-xs font-semibold text-gray-700">Enclosure Assignment</label>
                                        {selectedEnclosure ? (
                                            <div className="flex items-center justify-between p-2 bg-white border border-blue-300 rounded-md">
                                                <span className="text-sm font-medium text-gray-800">
                                                    {typeof selectedEnclosure === 'string' ? selectedEnclosure : selectedEnclosure.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedEnclosure(null);
                                                        setFormData(prev => ({ ...prev, enclosureId: null }));
                                                    }}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={manualEnclosureName}
                                                    onChange={(e) => {
                                                        setManualEnclosureName(e.target.value);
                                                        setFormData(prev => ({ ...prev, enclosureId: e.target.value || null }));
                                                    }}
                                                    placeholder="Enter enclosure name manually..."
                                                    className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEnclosureModal(true)}
                                                    className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
                                                >
                                                    Search & Assign Enclosure
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Other housing fields */}
                                    <div><label className="block text-xs font-medium text-gray-700">Housing Type</label><input type="text" name="housingType" value={formData.housingType} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Bedding/Substrate</label><input type="text" name="bedding" value={formData.bedding} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Temperature Range</label><input type="text" name="temperatureRange" value={formData.temperatureRange} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Humidity</label><input type="text" name="humidity" value={formData.humidity} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                </FormSection>

                                {/* Environment Setup */}
                                <FormSection title="Environment Setup" icon={<Leaf size={16} />}>
                                    <div className="space-y-3">
                                        {/* Lighting */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Lighting</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Lighting Type</label><input type="text" name="lightingType" value={formData.lightingType || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., LED, UVB bulbs, Natural sunlight, Infrared heat lamp" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Lighting Schedule (On/Off Times)</label><input type="text" name="lightingSchedule" value={formData.lightingSchedule || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., 12 hours on / 12 hours off, 14h on / 10h off" /></div>
                                        </div>

                                        {/* Sound & Noise */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Sound & Noise</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Noise Level Tolerance</label><input type="text" name="noiseToleranceLevel" value={formData.noiseToleranceLevel || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Quiet environment essential, Moderate noise okay, Tolerates loud sounds" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Sound Preferences & Triggers</label><input type="text" name="soundPreferences" value={formData.soundPreferences || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Avoids high frequencies, Enjoys soft music, Stressed by vacuum sounds" /></div>
                                        </div>

                                        {/* Enrichment */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Enrichment & Activity</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Enrichment Needs</label><textarea name="enrichmentNeeds" value={formData.enrichmentNeeds || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Climbing structures, Puzzle feeders, Toys, Digging substrate, Social interaction" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Enrichment Schedule/Frequency</label><input type="text" name="enrichmentFrequency" value={formData.enrichmentFrequency || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Daily rotation, Weekly new items, Continuous availability" /></div>
                                        </div>

                                        {/* Cleaning & Maintenance */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Cleaning & Maintenance Routines</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Spot Cleaning Frequency</label><input type="text" name="spotCleaningFrequency" value={formData.spotCleaningFrequency || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Daily, Every 2-3 days" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Deep Cleaning Frequency</label><input type="text" name="deepCleaningFrequency" value={formData.deepCleaningFrequency || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Weekly, Bi-weekly, Monthly" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Cleaning Checklist & Notes</label><textarea name="cleaningChecklist" value={formData.cleaningChecklist || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Remove soiled bedding, Wipe surfaces, Replace water, Check equipment function" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Maintenance Tasks Due</label><textarea name="maintenanceTasksDue" value={formData.maintenanceTasksDue || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Inspect lighting (monthly), Deep clean substrate change (quarterly), Equipment maintenance (annually)" /></div>
                                        </div>

                                        {/* Environment Notes */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Additional Environment Notes</h4>
                                            <textarea name="environmentNotes" value={formData.environmentNotes || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="Any other environmental considerations, sensitivities, or special requirements" />
                                        </div>
                                    </div>
                                </FormSection>

                                {/* Grooming & Coat Care */}
                                <FormSection title="Grooming & Coat Care" icon={<Scissors size={16} />}>
                                    <div className="space-y-3">
                                        {/* General Grooming */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">General Grooming</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Grooming Needs</label><input type="text" name="groomingNeeds" value={formData.groomingNeeds} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Regular brushing, professional grooming" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Shedding Level</label><input type="text" name="sheddingLevel" value={formData.sheddingLevel} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Heavy, Moderate, Minimal" /></div>
                                        </div>

                                        {/* Brushing & Bathing */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Brushing & Bathing</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Brushing Frequency</label><input type="text" name="brushingFrequency" value={formData.brushingFrequency || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Daily, 3x per week, Weekly" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Bathing Frequency & Requirements</label><input type="text" name="bathingFrequency" value={formData.bathingFrequency || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Monthly, As needed, Never (dry species)" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Coat/Feather/Scale Care Notes</label><textarea name="coatCareNotes" value={formData.coatCareNotes || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Double coat requires undercoat removal, oils for feathers, misting for scales" /></div>
                                        </div>

                                        {/* Specialized Care */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Specialized Care</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Nail/Claw/Hoof Care Requirements</label><input type="text" name="nailCareRequirements" value={formData.nailCareRequirements || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Monthly trim, File sharp edges, Natural wear" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Beak/Hoof/Scale Maintenance</label><input type="text" name="beakHoofScaleMaintenance" value={formData.beakHoofScaleMaintenance || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Beak trimming, Hoof conditioning, Scale inspection" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Skin & Ear Care Needs</label><input type="text" name="skinEarCareNeeds" value={formData.skinEarCareNeeds || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Ears cleaned weekly, Skin check for mites, Moisturizing needed" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Dental Care Requirements</label><input type="text" name="dentalCareRequirements" value={formData.dentalCareRequirements || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Regular brushing, Professional cleaning, Chew toys for wear" /></div>
                                        </div>

                                        {/* General Notes */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Grooming Notes & Preferences</h4>
                                            <textarea name="groomingNotes" value={formData.groomingNotes || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="Any additional grooming preferences, sensitivities, or special handling notes" />
                                        </div>
                                    </div>
                                </FormSection>

                                {/* Special Requirements */}
                                <FormSection title="Special Requirements & Preferences" icon={<Heart size={16} />}>
                                    <div className="space-y-3">
                                        {/* Dietary */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Dietary Requirements & Restrictions</h4>
                                            <textarea name="dietaryRestrictions" value={formData.dietaryRestrictions || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Allergies (dairy, grain), Food sensitivities, Picky eater, Requires specific protein source" />
                                        </div>

                                        {/* Dietary Preferences */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Dietary Preferences</h4>
                                            <textarea name="dietaryPreferences" value={formData.dietaryPreferences || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Prefers wet food, Loves treats, Refuses certain vegetables, Needs hand-feeding" />
                                        </div>

                                        {/* Special Care Needs */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Special Care Needs</h4>
                                            <textarea name="specialCareNeeds" value={formData.specialCareNeeds || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Requires medication at specific times, Needs isolation during molting, Heat lamp essential, Water depth requirements" />
                                        </div>

                                        {/* Medical/Health Monitoring Notes */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Health Monitoring & Special Observations</h4>
                                            <textarea name="healthMonitoringNotes" value={formData.healthMonitoringNotes || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Monitor for respiratory issues, Watch for weight changes, Check skin condition weekly" />
                                        </div>

                                        {/* General Special Requirements */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Additional Special Requirements</h4>
                                            <textarea name="additionalSpecialRequirements" value={formData.additionalSpecialRequirements || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="Any other special needs, preferences, or important care notes" />
                                        </div>
                                    </div>
                                </FormSection>

                                {/* Custom Care Tasks */}
                                <FormSection title="Custom Care Tasks" icon={<CheckSquare size={16} />}>
                                    <div className="space-y-3">
                                        {/* Add New Care Task */}
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Add Care Task</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <input type="text" value={newCareTaskName} onChange={e => setNewCareTaskName(e.target.value)} placeholder="Task name (e.g., Nail trim, Water change)" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newCareTaskFreq} onChange={e => setNewCareTaskFreq(e.target.value)} placeholder="Frequency (e.g., Weekly, Monthly, As needed)" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={() => {
                                                if (newCareTaskName.trim()) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        careTasks: [...(prev.careTasks || []), { name: newCareTaskName.trim(), frequency: newCareTaskFreq.trim() }]
                                                    }));
                                                    setNewCareTaskName('');
                                                    setNewCareTaskFreq('');
                                                }
                                            }} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">+ Add Care Task</button>
                                        </div>

                                        {/* Existing Care Tasks */}
                                        {(formData.careTasks || []).length > 0 && (
                                            <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                                <h4 className="text-sm font-semibold text-gray-700">Care Tasks ({(formData.careTasks || []).length})</h4>
                                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                                    {(formData.careTasks || []).map((task, i) => (
                                                        <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200 text-xs">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-gray-700 truncate">{task.name}</p>
                                                                {task.frequency && <p className="text-gray-500 text-xs">{task.frequency}</p>}
                                                            </div>
                                                            <button type="button" onClick={() => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    careTasks: (prev.careTasks || []).filter((_, idx) => idx !== i)
                                                                }));
                                                            }} className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </FormSection>
                            </div>
                        )}
                        {activeTab === 'behavior' && (
                            <div className="space-y-4">
                                <FormSection title="Behavior & Temperament" icon={<MessageSquare size={16} />} initiallyOpen>
                                    <div><label className="block text-xs font-medium text-gray-700">Temperament</label><input type="text" name="temperament" value={formData.temperament} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Friendly, skittish, aggressive, calm" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Handling Tolerance</label><input type="text" name="handlingTolerance" value={formData.handlingTolerance} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Enjoys handling, tolerates briefly" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Social Structure</label><textarea name="socialStructure" value={formData.socialStructure} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Lives with 2 cage mates, solitary" /></div>
                                </FormSection>

                                <FormSection title="Activity & Training" icon={<Brain size={16} />}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Activity Cycle</label>
                                            <select name="activityCycle" value={formData.activityCycle} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                <option value="">Select...</option>
                                                <option value="Diurnal">Diurnal (day active)</option>
                                                <option value="Nocturnal">Nocturnal (night active)</option>
                                                <option value="Crepuscular">Crepuscular (dawn/dusk)</option>
                                            </select>
                                        </div>
                                        <div><label className="block text-xs font-medium text-gray-700">Exercise Requirements</label><input type="text" name="exerciseRequirements" value={formData.exerciseRequirements} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Daily Exercise (min)</label><input type="number" name="dailyExerciseMinutes" value={formData.dailyExerciseMinutes} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    </div>
                                    <div><label className="block text-xs font-medium text-gray-700">Training Level</label><input type="text" name="trainingLevel" value={formData.trainingLevel} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Training Disciplines</label><input type="text" name="trainingDisciplines" value={formData.trainingDisciplines} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <label className="flex items-center gap-2"><input type="checkbox" name="crateTrained" checked={!!formData.crateTrained} onChange={handleChange} className="form-checkbox h-4 w-4" /> Crate Trained</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="litterTrained" checked={!!formData.litterTrained} onChange={handleChange} className="form-checkbox h-4 w-4" /> Litter Trained</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="leashTrained" checked={!!formData.leashTrained} onChange={handleChange} className="form-checkbox h-4 w-4" /> Leash Trained</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="freeFlightTrained" checked={!!formData.freeFlightTrained} onChange={handleChange} className="form-checkbox h-4 w-4" /> Free-Flight Trained</label>
                                    </div>
                                </FormSection>

                                <FormSection title="Working Role & Certifications" icon={<Trophy size={16} />}>
                                    <div className="space-y-3">
                                        <div><label className="block text-xs font-medium text-gray-700">Working Role</label><input type="text" name="workingRole" value={formData.workingRole || ''} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Service dog, Therapy dog, Show dog, Guard dog, Working animal" /></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Certifications & Titles</label><textarea name="certifications" value={formData.certifications || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., CGC, AKC titles (CH, GCH), Service Dog Certified, Therapy Dog International, Show wins" /></div>
                                    </div>
                                </FormSection>

                                <FormSection title="Known Issues & Safety Concerns" icon={<AlertTriangle size={16} />}>
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Behavioral Issues</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Behavioral Issues</label><textarea name="behavioralIssues" value={formData.behavioralIssues} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Resource guarding, separation anxiety" /></div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Bite History</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Bite History</label><textarea name="biteHistory" value={formData.biteHistory} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="Any bite incidents, context, and outcome" /></div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Reactivity & Triggers</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Reactivity Notes</label><textarea name="reactivityNotes" value={formData.reactivityNotes} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="Triggers, thresholds, management strategies" /></div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Escape & Flight Risk</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Escape Risk Level</label><select name="escapeRiskLevel" value={formData.escapeRiskLevel || 'Low'} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"><option value="None">No Risk</option><option value="Low">Low</option><option value="Moderate">Moderate</option><option value="High">High</option><option value="Critical">Critical</option></select></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Escape Methods & Flight Triggers</label><textarea name="escapeBehavior" value={formData.escapeBehavior || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Climbs, digs, flies, jumps; triggered by loud noises, open doors, stress" /></div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Stereotypic & Stress Behaviors</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Stereotypic Behaviors Present</label><textarea name="stereotypicBehaviors" value={formData.stereotypicBehaviors || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Pacing, feather plucking, bar biting, over-grooming, head bobbing, spinning" /></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Stress Indicators</label><textarea name="stressIndicators" value={formData.stressIndicators || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Panting, freezing, hiding, aggression, loss of appetite" /></div>
                                        </div>
                                    </div>
                                </FormSection>

                                <FormSection title="Temperament Assessment (1-5 Scale)" icon={<Brain size={16} />}>
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-semibold text-gray-700">Aggression Level</label>
                                                <span className="text-xs bg-primary text-black px-2 py-1 rounded">{formData.aggressionLevel || 3}</span>
                                            </div>
                                            <input type="range" name="aggressionLevel" min="1" max="5" value={formData.aggressionLevel || 3} onChange={handleChange} className="w-full" />
                                            <p className="text-xs text-gray-500">1=Passive | 3=Neutral | 5=Highly Aggressive</p>
                                            <div><label className="block text-xs font-medium text-gray-700 mt-2">Aggression Triggers & Types</label><textarea name="aggressionTriggers" value={formData.aggressionTriggers || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Territorial aggression, food guarding, fear-based, dominance, predatory drive" /></div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-semibold text-gray-700">Fear/Anxiety Level</label>
                                                <span className="text-xs bg-primary text-black px-2 py-1 rounded">{formData.fearAnxietyLevel || 3}</span>
                                            </div>
                                            <input type="range" name="fearAnxietyLevel" min="1" max="5" value={formData.fearAnxietyLevel || 3} onChange={handleChange} className="w-full" />
                                            <p className="text-xs text-gray-500">1=Very Confident | 3=Moderate | 5=Highly Fearful/Anxious</p>
                                            <div><label className="block text-xs font-medium text-gray-700 mt-2">Specific Fears & Coping Mechanisms</label><textarea name="specificFears" value={formData.specificFears || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Afraid of loud noises, uses hiding as coping, needs reassurance, freezes when scared" /></div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-semibold text-gray-700">Boldness/Exploratory Level</label>
                                                <span className="text-xs bg-primary text-black px-2 py-1 rounded">{formData.boldnessLevel || 3}</span>
                                            </div>
                                            <input type="range" name="boldnessLevel" min="1" max="5" value={formData.boldnessLevel || 3} onChange={handleChange} className="w-full" />
                                            <p className="text-xs text-gray-500">1=Very Cautious | 3=Moderate | 5=Highly Bold/Adventurous</p>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-semibold text-gray-700">Sociability Level</label>
                                                <span className="text-xs bg-primary text-black px-2 py-1 rounded">{formData.sociabilityLevel || 3}</span>
                                            </div>
                                            <input type="range" name="sociabilityLevel" min="1" max="5" value={formData.sociabilityLevel || 3} onChange={handleChange} className="w-full" />
                                            <p className="text-xs text-gray-500">1=Solitary/Aloof | 3=Moderate Social | 5=Highly Social/Bonded</p>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-semibold text-gray-700">Independence Level</label>
                                                <span className="text-xs bg-primary text-black px-2 py-1 rounded">{formData.independenceLevel || 3}</span>
                                            </div>
                                            <input type="range" name="independenceLevel" min="1" max="5" value={formData.independenceLevel || 3} onChange={handleChange} className="w-full" />
                                            <p className="text-xs text-gray-500">1=Highly Dependent | 3=Moderate | 5=Very Independent</p>
                                        </div>
                                    </div>
                                </FormSection>

                                <FormSection title="Specialized Behavioral Traits" icon={<Sparkles size={16} />}>
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Prey Drive & Hunting Behavior</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Prey Drive Level</label><select name="preyDriveLevel" value={formData.preyDriveLevel || 'Unknown'} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"><option value="Unknown">Unknown</option><option value="None">None</option><option value="Low">Low</option><option value="Moderate">Moderate</option><option value="High">High</option><option value="Very High">Very High</option></select></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Hunting/Predatory Behavior Notes</label><textarea name="huntingBehavior" value={formData.huntingBehavior || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Stalks small animals, pounces, tracking instincts, bird/rodent specific" /></div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Feeding Behavior & Food Behavior</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <div><label className="block text-xs font-medium text-gray-700">Food Aggression Level</label><select name="foodAggressionLevel" value={formData.foodAggressionLevel || 'None'} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"><option value="None">None</option><option value="Mild">Mild</option><option value="Moderate">Moderate</option><option value="Severe">Severe</option></select></div>
                                                <div><label className="block text-xs font-medium text-gray-700">Eating Speed</label><select name="eatingSpeed" value={formData.eatingSpeed || 'Normal'} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"><option value="Very Slow">Very Slow</option><option value="Slow">Slow</option><option value="Normal">Normal</option><option value="Fast">Fast</option><option value="Very Fast">Very Fast</option></select></div>
                                            </div>
                                            <div><label className="block text-xs font-medium text-gray-700">Food Preferences & Pickiness</label><textarea name="foodPreferences" value={formData.foodPreferences || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Picky eater, refuses certain foods, competitive feeding, hoards food" /></div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Bonding & Attachment Style</h4>
                                            <div><label className="block text-xs font-medium text-gray-700">Attachment Type</label><select name="attachmentStyle" value={formData.attachmentStyle || 'Unknown'} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"><option value="Unknown">Unknown</option><option value="Solitary">Solitary (no bonding)</option><option value="Pair Bonded">Pair Bonded</option><option value="Group Bonded">Group Bonded</option><option value="Handler Bonded">Bonded to Handler</option><option value="Multi-individual">Multi-individual Bonds</option></select></div>
                                            <div><label className="block text-xs font-medium text-gray-700">Bonding Behavior & Preferences</label><textarea name="bondingBehavior" value={formData.bondingBehavior || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Seeks out handler, displays affection, bond with specific individuals, forms hierarchies" /></div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Sensory Sensitivities</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <div><label className="block text-xs font-medium text-gray-700">Noise Sensitivity</label><select name="noiseSensitivity" value={formData.noiseSensitivity || 'Normal'} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"><option value="Normal">Normal</option><option value="Mildly Sensitive">Mildly Sensitive</option><option value="Highly Sensitive">Highly Sensitive</option></select></div>
                                                <div><label className="block text-xs font-medium text-gray-700">Touch Sensitivity</label><select name="touchSensitivity" value={formData.touchSensitivity || 'Normal'} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"><option value="Normal">Normal</option><option value="Mildly Sensitive">Mildly Sensitive</option><option value="Highly Sensitive">Highly Sensitive</option></select></div>
                                                <div><label className="block text-xs font-medium text-gray-700">Light Sensitivity</label><select name="lightSensitivity" value={formData.lightSensitivity || 'Normal'} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"><option value="Normal">Normal</option><option value="Prefers Dim">Prefers Dim</option><option value="Highly Sensitive">Highly Sensitive</option></select></div>
                                            </div>
                                            <div><label className="block text-xs font-medium text-gray-700">Sensory Sensitivity Notes</label><textarea name="sensoryNotes" value={formData.sensoryNotes || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Avoids certain textures, loud noises trigger panic, prefers darkness" /></div>
                                        </div>
                                    </div>
                                </FormSection>
                            </div>
                        )}
                        {activeTab === 'breeding' && (
                            <div className="space-y-4">
                                {/* SECTION 1: Current Reproductive State */}
                                <FormSection title="Current Reproductive State" icon={<Heart size={16} />}>
                                    {/* Auto-calculated display */}
                                    <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                                        <h4 className="text-sm font-semibold text-gray-700">Auto-Calculated from Litters:</h4>
                                        <div className="space-y-1 text-sm text-gray-700">
                                            <div>📋 Planned Mating: {formData.isPlannedMating ? '✓' : '✗'}</div>
                                            <div>⚡ In Mating: {formData.isInMating ? '✓' : '✗'}</div>
                                            {formData.gender !== 'Male' && <div>🤰 Pregnant: {formData.isPregnant ? '✓' : '✗'}</div>}
                                            {formData.gender !== 'Male' && <div>🍼 Nursing: {formData.isNursing ? '✓' : '✗'}</div>}
                                        </div>
                                        {(formData.isPlannedMating || formData.isInMating || (formData.gender !== 'Male' && (formData.isPregnant || formData.isNursing))) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!window.confirm('Clear all current reproductive state flags (Planned Mating, In Mating, Pregnant, Nursing)? Use this once a litter/mating cycle is fully finished.')) return;
                                                    setFormData(p => ({ ...p, isPlannedMating: false, isInMating: false, isPregnant: false, isNursing: false }));
                                                }}
                                                className="mt-1 w-full px-3 py-1.5 text-xs font-medium rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                                            >
                                                Finish Cycle / Clear State
                                            </button>
                                        )}
                                    </div>

                                    {/* Override controls */}
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-semibold text-gray-700">Manual Override</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (reproductiveStateOverride) {
                                                    setReproductiveStateOverride(null);
                                                    setReproductiveStateOverrideReason('');
                                                } else {
                                                    setReproductiveStateOverride({});
                                                }
                                            }}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${reproductiveStateOverride ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                        >
                                            {reproductiveStateOverride ? 'Clear Override' : 'Enable Override'}
                                        </button>
                                    </div>

                                    {/* Override options */}
                                    {reproductiveStateOverride && (
                                        <div className="space-y-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={!!formData.isPlannedMating} onChange={(e) => setFormData(p => ({...p, isPlannedMating: e.target.checked}))} /> <label className="text-xs font-medium">Mark as: Planned Mating</label></div>
                                            <div className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={!!formData.isInMating} onChange={(e) => setFormData(p => ({...p, isInMating: e.target.checked}))} /> <label className="text-xs font-medium">Mark as: In Mating</label></div>
                                            {formData.gender !== 'Male' && <div className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={!!formData.isPregnant} onChange={(e) => setFormData(p => ({...p, isPregnant: e.target.checked}))} /> <label className="text-xs font-medium">Mark as: Pregnant</label></div>}
                                            {formData.gender !== 'Male' && formData.pregnancyHistory && formData.pregnancyHistory.length > 0 && (
                                                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
                                                    <p className="text-xs font-semibold text-blue-700">Pregnancy History ({formData.pregnancyHistory.length})</p>
                                                    <div className="space-y-1">
                                                        {formData.pregnancyHistory.map((date, idx) => (
                                                            <div key={idx} className="flex items-center justify-between text-xs p-1 bg-white border border-blue-100 rounded">
                                                                <span>🤰 {new Date(date + 'T00:00:00').toLocaleDateString()}</span>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => setFormData(p => ({...p, pregnancyHistory: p.pregnancyHistory.filter((_, i) => i !== idx)}))}
                                                                    className="text-red-500 hover:text-red-700 font-bold"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {formData.gender !== 'Male' && <div className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={!!formData.isNursing} onChange={(e) => setFormData(p => ({...p, isNursing: e.target.checked}))} /> <label className="text-xs font-medium">Mark as: Nursing</label></div>}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Override</label>
                                                <textarea value={reproductiveStateOverrideReason} onChange={(e) => setReproductiveStateOverrideReason(e.target.value)} placeholder="Why overriding auto-calculated state..." className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md resize-none" rows="2" />
                                            </div>
                                        </div>
                                    )}
                                </FormSection>

                                {/* SECTION 2: Fertility Status */}
                                <FormSection title="Fertility Status" icon={<Sparkles size={16} />}>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Fertility Status</label>
                                        <select value={currentReproductiveState.fertilityStatus} onChange={(e) => setCurrentReproductiveState({...currentReproductiveState, fertilityStatus: e.target.value})} className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                            <option>Fertile</option>
                                            <option>Subfertile</option>
                                            <option>Infertile</option>
                                            {(formData.gender === 'Female' || formData.gender === 'Intersex' || formData.gender === 'Unknown') && <option>Spayed (Female)</option>}
                                            {(formData.gender === 'Male' || formData.gender === 'Intersex' || formData.gender === 'Unknown') && <option>Neutered (Male)</option>}
                                            <option>Castrated</option>
                                            <option>Unknown</option>
                                            <option>Not Applicable</option>
                                        </select>
                                    </div>
                                </FormSection>

                                {/* SECTION 3: Reproductive Cycle (Conditional) */}
                                {['Fertile', 'Subfertile', 'Infertile', 'Unknown'].includes(currentReproductiveState.fertilityStatus) && (
                                    <FormSection title="Reproductive Cycle" icon={<Activity size={16} />}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Last Reproductive Event Date</label>
                                                <DatePicker value={reproductiveCycle.lastReproductiveEventDate} onChange={(e) => setReproductiveCycle({...reproductiveCycle, lastReproductiveEventDate: e.target.value})} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Cycle Length (days)</label>
                                                <input type="number" value={reproductiveCycle.reproductiveEventCycleLength} onChange={(e) => setReproductiveCycle({...reproductiveCycle, reproductiveEventCycleLength: e.target.value})} placeholder="e.g., 21" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-700">Current Reproductive Phase</label>
                                                <select value={reproductiveCycle.currentReproductiveEventPhase} onChange={(e) => setReproductiveCycle({...reproductiveCycle, currentReproductiveEventPhase: e.target.value})} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                    <option>Available</option>
                                                    <option>In Cycle</option>
                                                    <option>Resting</option>
                                                    <option>Unknown</option>
                                                </select>
                                            </div>
                                        </div>
                                    </FormSection>
                                )}

                                {/* SECTION 4: Conception & Mating History (Conditional) */}
                                {['Fertile', 'Subfertile', 'Infertile', 'Unknown'].includes(currentReproductiveState.fertilityStatus) && (
                                    <FormSection title="Conception & Mating History" icon={<MessageSquare size={16} />}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Last Conception Date</label>
                                                <DatePicker value={conceptionHistory.lastConceptionDate} onChange={(e) => setConceptionHistory({...conceptionHistory, lastConceptionDate: e.target.value})} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Successful Conceptions (Lifetime)</label>
                                                <input type="number" value={conceptionHistory.successfulConceptionCount} onChange={(e) => setConceptionHistory({...conceptionHistory, successfulConceptionCount: e.target.value})} placeholder="e.g., 5" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-700">Unsuccessful Conception Attempts</label>
                                                <input type="number" value={conceptionHistory.unsuccessfulConceptionAttempts} onChange={(e) => setConceptionHistory({...conceptionHistory, unsuccessfulConceptionAttempts: e.target.value})} placeholder="e.g., 2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                        </div>
                                    </FormSection>
                                )}

                                {/* SECTION 5: Pregnancy/Development Details (Conditional, not applicable to males) */}
                                {formData.gender !== 'Male' && ['Fertile', 'Subfertile', 'Infertile', 'Unknown'].includes(currentReproductiveState.fertilityStatus) && (
                                    <FormSection title="Pregnancy/Development Details" icon={<AlertTriangle size={16} />}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Development Period Start</label>
                                                <DatePicker value={developmentDetails.developmentPeriodStart} onChange={(e) => setDevelopmentDetails({...developmentDetails, developmentPeriodStart: e.target.value})} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Development Period Length (days)</label>
                                                <input type="number" value={developmentDetails.developmentPeriodLength} onChange={(e) => setDevelopmentDetails({...developmentDetails, developmentPeriodLength: e.target.value})} placeholder="e.g., 63" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Expected Delivery Date</label>
                                                <DatePicker value={developmentDetails.expectedDeliveryDate} onChange={(e) => setDevelopmentDetails({...developmentDetails, expectedDeliveryDate: e.target.value})} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Development Method</label>
                                                <select value={developmentDetails.developmentMethod} onChange={(e) => setDevelopmentDetails({...developmentDetails, developmentMethod: e.target.value})} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                    <option>Natural</option>
                                                    <option>Assisted</option>
                                                    <option>Artificial Incubation</option>
                                                    <option>Unknown</option>
                                                </select>
                                            </div>
                                        </div>
                                    </FormSection>
                                )}

                                {/* SECTION 6: Reproductive Outcomes & Nursing */}
                                <FormSection title="Reproductive Outcomes & Nursing" icon={<Trophy size={16} />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Total Offspring Produced (Lifetime)</label>
                                            <input type="number" value={reproductiveOutcomes.totalOffspringProduced} onChange={(e) => setReproductiveOutcomes({...reproductiveOutcomes, totalOffspringProduced: e.target.value})} placeholder="e.g., 45" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Viable Offspring Count</label>
                                            <input type="number" value={reproductiveOutcomes.viableOffspringCount} onChange={(e) => setReproductiveOutcomes({...reproductiveOutcomes, viableOffspringCount: e.target.value})} placeholder="e.g., 43" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Reproductive Event Count (Litters/Clutches)</label>
                                            <input type="number" value={reproductiveOutcomes.reproductiveEventCount} onChange={(e) => setReproductiveOutcomes({...reproductiveOutcomes, reproductiveEventCount: e.target.value})} placeholder="e.g., 8" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Reproductive Event Outcome</label>
                                            <select value={reproductiveOutcomes.reproductiveEventOutcome} onChange={(e) => setReproductiveOutcomes({...reproductiveOutcomes, reproductiveEventOutcome: e.target.value})} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                <option>Successful</option>
                                                <option>Partial</option>
                                                <option>Failed</option>
                                                <option>Unknown</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Dependent Care End Date (Weaning/Fledging/Independence)</label>
                                            <DatePicker value={reproductiveOutcomes.dependentCareEndDate} onChange={(e) => setReproductiveOutcomes({...reproductiveOutcomes, dependentCareEndDate: e.target.value})} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                        </div>
                                    </div>
                                </FormSection>

                                {/* SECTION 7: Reproductive Health & Procedures */}
                                <FormSection title="Reproductive Health & Procedures" icon={<Leaf size={16} />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Artificial Reproduction Method</label>
                                            <select value={reproductiveHealth.artificialReproductionMethod} onChange={(e) => setReproductiveHealth({...reproductiveHealth, artificialReproductionMethod: e.target.value})} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                <option>None</option>
                                                <option>AI (Artificial Insemination)</option>
                                                <option>Embryo Transfer</option>
                                                <option>In Vitro</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Last Reproductive Intervention Date</label>
                                            <DatePicker value={reproductiveHealth.lastReproductiveInterventionDate} onChange={(e) => setReproductiveHealth({...reproductiveHealth, lastReproductiveInterventionDate: e.target.value})} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" id="dependentCare" checked={reproductiveHealth.dependentCareRequired} onChange={(e) => setReproductiveHealth({...reproductiveHealth, dependentCareRequired: e.target.checked})} className="w-4 h-4" />
                                                <label htmlFor="dependentCare" className="text-xs font-medium text-gray-700">Dependent Care Required (Species Needs Parental Care)</label>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Reproductive Health Notes (Clearances, Restrictions, Procedures)</label>
                                            <textarea value={reproductiveHealth.reproductiveHealthNotes} onChange={(e) => setReproductiveHealth({...reproductiveHealth, reproductiveHealthNotes: e.target.value})} placeholder="e.g., PennHIP certified, genetic clearances pending, spay/neuter date..." className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md resize-none" rows="3" />
                                        </div>
                                    </div>
                                </FormSection>

                                {/* Delivery & Breeding Health Details */}
                                <FormSection title="Delivery & Breeding Health" icon={<Heart size={16} />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Last Delivery Date</label>
                                            <DatePicker value={formData.lastDeliveryDate} onChange={(e) => setFormData({...formData, lastDeliveryDate: e.target.value})} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Delivery Method</label>
                                            <input type="text" value={formData.deliveryMethod} onChange={(e) => setFormData({...formData, deliveryMethod: e.target.value})} placeholder="e.g., Natural, C-section, Assisted" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Reproductive Complications</label>
                                            <input type="text" value={formData.reproductiveComplications} onChange={(e) => setFormData({...formData, reproductiveComplications: e.target.value})} placeholder="e.g., Dystocia, retained placenta, infection" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Reproductive Clearances</label>
                                            <input type="text" value={formData.reproductiveClearances} onChange={(e) => setFormData({...formData, reproductiveClearances: e.target.value})} placeholder="e.g., OFA certified, genetic screening passed" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                    </div>
                                </FormSection>

                                {/* Original Breeding Records Section (kept for history) */}
                                <FormSection title="Add Breeding Record" icon={<Egg size={16} />} initiallyOpen>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Breeding Method</label>
                                            <select name="breedingMethod" value={newBreedingRecord.breedingMethod} onChange={(e) => setNewBreedingRecord(p => ({ ...p, breedingMethod: e.target.value }))} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                <option>Natural</option><option>AI</option><option>Assisted</option><option>Unknown</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Mating Date</label>
                                            <DatePicker value={newBreedingRecord.matingDate} onChange={(e) => setNewBreedingRecord(p => ({ ...p, matingDate: e.target.value }))} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Mate</label>
                                            {mateInfo ? (
                                                <div className="flex items-center gap-2 mt-1 p-2 border rounded-md bg-white">
                                                    <span className="flex-1">{[mateInfo.prefix, mateInfo.name, mateInfo.suffix].filter(Boolean).join(' ')} ({mateInfo.id_public})</span>
                                                    <button type="button" onClick={clearMateSelection} className="text-red-500"><X size={16} /></button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <input type="text" value={newBreedingRecord.mate} onChange={(e) => setNewBreedingRecord(p => ({ ...p, mate: e.target.value, mateAnimalId: null }))} placeholder="Enter mate name manually" className="flex-1 py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                    <button type="button" onClick={() => { setParentSearchModalConfig({ title: 'Select Mate', onSelect: handleSelectMate, requiredGender: formData.gender === 'Male' ? ['Female', 'Intersex', 'Unknown'] : ['Male', 'Intersex', 'Unknown'] }); setParentSearchModalOpen(true); }} className="px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Select from DB</button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Outcome</label>
                                            <select name="outcome" value={newBreedingRecord.outcome} onChange={(e) => setNewBreedingRecord(p => ({ ...p, outcome: e.target.value }))} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                <option>Successful</option><option>Unsuccessful</option><option>Pending</option><option>Unknown</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Birth/Lay Date</label>
                                            <DatePicker value={newBreedingRecord.birthEventDate} onChange={(e) => setNewBreedingRecord(p => ({ ...p, birthEventDate: e.target.value }))} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Litter Size</label>
                                            <input type="number" value={newBreedingRecord.litterSizeBorn} onChange={(e) => setNewBreedingRecord(p => ({ ...p, litterSizeBorn: e.target.value }))} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Notes</label>
                                            <textarea value={newBreedingRecord.notes} onChange={(e) => setNewBreedingRecord(p => ({ ...p, notes: e.target.value }))} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addBreedingRecord} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-sm font-medium mt-2">Add Breeding Record</button>
                                </FormSection>
                            </div>
                        )}
                        {activeTab === 'pedigree' && (() => {
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
                                                                // Simplified image compression - using standard fetch
                                                                const fd = new FormData();
                                                                fd.append('file', file);
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
                                        <h3 className="text-base font-semibold text-gray-700">Pedigree</h3>
                                    </div>
                                    <p className="text-xs text-gray-400 -mt-3">This Pedigree displays both linked CritterTrack ancestors (with CTC IDs) and manually entered ancestors. Only linked CritterTrack ancestry is used for COI calculations. Manual entries are for display/reference only and do not affect COI or the main pedigree chart. Changes are saved when you click Save Animal.</p>

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
                        
                        
                        
                        {activeTab === 'timeline' && (
                            <div className="space-y-4">
                                {/* Event Visibility Toggles */}
                                <FormSection title="Event Filters" icon={<Eye size={16} />} initiallyOpen>
                                    <div className="space-y-2">
                                        {[
                                            { key: 'health', label: 'Health Events' },
                                            { key: 'breeding', label: 'Breeding Events' },
                                            { key: 'keeper', label: 'Keeper & Ownership Events' },
                                            { key: 'show', label: 'Show Events' },
                                            { key: 'milestones', label: 'Milestones' },
                                            { key: 'status', label: 'Status Changes' }
                                        ].map(({key, label}) => (
                                            <label key={key} className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded transition">
                                                <input
                                                    type="checkbox"
                                                    checked={eventVisibility[key]}
                                                    onChange={(e) => setEventVisibility({...eventVisibility, [key]: e.target.checked})}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                                />
                                                <span className="text-sm font-medium text-gray-700">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </FormSection>

                                {/* Milestones Section */}
                                <FormSection title="Milestones" icon={<Target size={16} />} initiallyOpen>
                                    {(formData.milestones || []).length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            {(formData.milestones || []).map((milestone, idx) => (
                                                <div key={idx} className="flex items-start justify-between bg-white border border-yellow-200 rounded-lg p-3">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-800">{milestone.label}</p>
                                                        <p className="text-xs text-gray-500">{formatDate(milestone.startDate)}</p>
                                                        {milestone.description && <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updatedMilestones = formData.milestones.filter((_, i) => i !== idx);
                                                            setFormData(prev => ({...prev, milestones: updatedMilestones}));
                                                        }}
                                                        className="text-red-400 hover:text-red-600 transition-colors ml-2"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <input
                                            type="text"
                                            placeholder="Milestone label"
                                            value={newMilestoneLabel}
                                            onChange={(e) => setNewMilestoneLabel(e.target.value)}
                                            className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                        />
                                        <DatePicker
                                            value={newMilestoneDate}
                                            onChange={setNewMilestoneDate}
                                            label="Date"
                                            className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="Interval"
                                                value={newMilestoneInterval}
                                                onChange={(e) => setNewMilestoneInterval(e.target.value)}
                                                className="flex-1 py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                            />
                                            <select
                                                value={newMilestoneUnit}
                                                onChange={(e) => setNewMilestoneUnit(e.target.value)}
                                                className="flex-1 py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                            >
                                                <option>week</option>
                                                <option>month</option>
                                                <option>year</option>
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!newMilestoneLabel.trim() || !newMilestoneDate) {
                                                    showModalMessage('Missing Data', 'Please enter a label and date.');
                                                    return;
                                                }
                                                const newMilestone = {
                                                    id: Date.now().toString(),
                                                    label: newMilestoneLabel,
                                                    startDate: newMilestoneDate,
                                                    interval: newMilestoneInterval || null,
                                                    intervalUnit: newMilestoneUnit,
                                                    description: ''
                                                };
                                                setFormData(prev => ({
                                                    ...prev,
                                                    milestones: [...(prev.milestones || []), newMilestone]
                                                }));
                                                setNewMilestoneLabel('');
                                                setNewMilestoneDate(new Date().toISOString().split('T')[0]);
                                                setNewMilestoneInterval('');
                                            }}
                                            className="w-full py-1.5 px-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-1"
                                        >
                                            <Plus size={16} /> Add Milestone
                                        </button>
                                    </div>
                                </FormSection>

                                {/* Timeline Events */}
                                <FormSection title="Timeline Events" icon={<Clock size={16} />} initiallyOpen>
                                    {(() => {
                                        const events = aggregateTimelineEvents();
                                        const pinnedEvents_filtered = events.filter(e => pinnedEvents.includes(e.id));
                                        const regularEvents = events.filter(e => !pinnedEvents.includes(e.id));
                                        
                                        return (
                                            <div className="space-y-3">
                                                {/* Pinned Events */}
                                                {pinnedEvents_filtered.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="text-xs font-semibold text-gray-600 uppercase">📌 Pinned Events</h4>
                                                        {pinnedEvents_filtered.map(event => (
                                                            <div key={event.id} className="border-l-4 border-yellow-400 bg-yellow-50 p-3 rounded-lg">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-semibold text-gray-800">{event.title}</p>
                                                                        <p className="text-xs text-gray-600">{event.date} • {event.type}</p>
                                                                        {event.description && <p className="text-xs text-gray-700 mt-1">{event.description}</p>}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleEventPin(event.id)}
                                                                        className="text-yellow-500 hover:text-yellow-700 transition-colors ml-2"
                                                                    >
                                                                        <Star size={16} fill="currentColor" />
                                                                    </button>
                                                                </div>
                                                                {getNotesForEvent(event.id).length > 0 && (
                                                                    <div className="mt-2 space-y-1">
                                                                        {getNotesForEvent(event.id).map(note => (
                                                                            <div key={note.id} className="text-xs bg-white p-2 rounded border border-yellow-200">
                                                                                <p className="text-gray-700">{note.noteText}</p>
                                                                                <div className="flex justify-between items-center mt-1">
                                                                                    <span className="text-gray-400 text-[10px]">{note.dateAdded}</span>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => deleteTimelineNote(note.id)}
                                                                                        className="text-red-400 hover:text-red-600"
                                                                                    >
                                                                                        <Trash2 size={12} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Regular Events */}
                                                {regularEvents.length > 0 && (
                                                    <div className="space-y-2">
                                                        {pinnedEvents_filtered.length > 0 && <hr className="my-3" />}
                                                        <h4 className="text-xs font-semibold text-gray-600 uppercase">All Events</h4>
                                                        {regularEvents.map(event => (
                                                            <div key={event.id} className="border-l-4 border-gray-300 bg-gray-50 p-3 rounded-lg">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-semibold text-gray-800">{event.title}</p>
                                                                        <p className="text-xs text-gray-600">{event.date} • {event.type}</p>
                                                                        {event.description && <p className="text-xs text-gray-700 mt-1">{event.description}</p>}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleEventPin(event.id)}
                                                                        className="text-gray-400 hover:text-yellow-500 transition-colors ml-2"
                                                                    >
                                                                        <Star size={16} />
                                                                    </button>
                                                                </div>
                                                                {getNotesForEvent(event.id).length > 0 && (
                                                                    <div className="mt-2 space-y-1">
                                                                        {getNotesForEvent(event.id).map(note => (
                                                                            <div key={note.id} className="text-xs bg-white p-2 rounded border border-gray-200">
                                                                                <p className="text-gray-700">{note.noteText}</p>
                                                                                <div className="flex justify-between items-center mt-1">
                                                                                    <span className="text-gray-400 text-[10px]">{note.dateAdded}</span>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => deleteTimelineNote(note.id)}
                                                                                        className="text-red-400 hover:text-red-600"
                                                                                    >
                                                                                        <Trash2 size={12} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {events.length === 0 && (
                                                    <p className="text-sm text-gray-500 italic text-center py-4">No events to display. Check the filters or add milestones to get started.</p>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </FormSection>

                                {/* Add Event Note */}
                                <FormSection title="Event Annotations" icon={<MessageSquare size={16} />} initiallyOpen={showNoteForm}>
                                    {!showNoteForm ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowNoteForm(true)}
                                            className="w-full py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-1"
                                        >
                                            <Plus size={16} /> Add Note to Event
                                        </button>
                                    ) : (
                                        <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700">Select Event</label>
                                            <select
                                                value={newTimelineNote.eventId}
                                                onChange={(e) => setNewTimelineNote({...newTimelineNote, eventId: e.target.value})}
                                                className="w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"
                                            >
                                                <option value="">Choose an event...</option>
                                                {aggregateTimelineEvents().map(event => (
                                                    <option key={event.id} value={event.id}>
                                                        {event.title} ({event.date})
                                                    </option>
                                                ))}
                                            </select>
                                            <label className="block text-sm font-medium text-gray-700 mt-2">Note</label>
                                            <textarea
                                                value={newTimelineNote.noteText}
                                                onChange={(e) => setNewTimelineNote({...newTimelineNote, noteText: e.target.value})}
                                                placeholder="Add context or notes about this event..."
                                                className="w-full py-2 px-2 text-sm border border-gray-300 rounded-md resize-none"
                                                rows={3}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={addTimelineNote}
                                                    className="flex-1 py-1.5 px-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                                                >
                                                    Save Note
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowNoteForm(false);
                                                        setNewTimelineNote({ eventId: '', noteText: '' });
                                                    }}
                                                    className="flex-1 py-1.5 px-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </FormSection>
                            </div>
                        )}
                        {activeTab === 'records' && (
                            <div className="space-y-4">
                                <FormSection title="Ownership History" icon={<Home size={16} />} initiallyOpen>
                                    {/* Existing entries */}
                                    {(formData.ownershipHistory || []).length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            {(formData.ownershipHistory || []).map((entry, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                        {entry.country && <span className={`${getCountryFlag(entry.country)} inline-block h-4 w-6 flex-shrink-0`}></span>}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium text-gray-800 truncate">{entry.ownerName || 'Unnamed'}</p>
                                                            {entry.userId_public && <p className="text-xs text-gray-400 font-mono">{entry.userId_public}</p>}
                                                            <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                                                <span>{entry.startDate || 'TBD'}</span>
                                                                {entry.endDate && <span>→ {entry.endDate}</span>}
                                                                {entry.ownershipType && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{entry.ownershipType}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, ownershipHistory: (prev.ownershipHistory || []).filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0 ml-2">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add new entry */}
                                    <div className="bg-white border border-dashed border-gray-300 rounded-lg p-3 space-y-3">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Add Manual Entry</p>

                                        {/* Mode toggle */}
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => { setOhMode('manual'); setOhSelectedUser(null); setOhUserSearch(''); setOhUserResults([]); }} className={`px-3 py-1 text-xs rounded-full border transition ${ohMode === 'manual' ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'}`}>Manual Name</button>
                                            <button type="button" onClick={() => setOhMode('user')} className={`px-3 py-1 text-xs rounded-full border transition ${ohMode === 'user' ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'}`}>Select User</button>
                                        </div>

                                        {ohMode === 'manual' ? (
                                            <input type="text" value={ohOwnerName} onChange={e => setOhOwnerName(e.target.value)} placeholder="Owner name" className="block w-full p-2 border border-gray-300 rounded text-sm focus:ring-primary focus:border-primary" />
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <input type="text" value={ohUserSearch} onChange={e => { setOhUserSearch(e.target.value); setOhUserResults([]); setOhSelectedUser(null); setOhOwnerName(''); }} placeholder="Search by name or CTUID" className="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-primary focus:border-primary" />
                                                    <button type="button" disabled={ohSearching || !ohUserSearch.trim()} onClick={async () => {
                                                        if (!ohUserSearch.trim()) return;
                                                        setOhSearching(true);
                                                        try {
                                                            const res = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(ohUserSearch.trim())}&limit=10`);
                                                            setOhUserResults(res.data || []);
                                                        } catch(e) {}
                                                        setOhSearching(false);
                                                    }} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm rounded disabled:opacity-40 transition flex-shrink-0">
                                                        {ohSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                                                    </button>
                                                </div>
                                                {ohUserResults.length > 0 && !ohSelectedUser && (
                                                    <div className="border border-gray-200 rounded divide-y divide-gray-100 max-h-44 overflow-y-auto bg-white shadow-sm">
                                                        {ohUserResults.map(u => {
                                                            const showP = u.showPersonalName ?? false;
                                                            const showB = u.showBreederName ?? false;
                                                            const dName = (showP && showB && u.personalName && u.breederName) ? `${u.personalName} (${u.breederName})` : (showB && u.breederName) ? u.breederName : (showP && u.personalName) ? u.personalName : 'Anonymous';
                                                            return (
                                                                <button key={u.id_public} type="button" onClick={() => { setOhSelectedUser(u); setOhOwnerName(dName); setOhCountry(u.country || ''); setOhUserResults([]); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2">
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
                                                {ohSelectedUser && (
                                                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-2">
                                                        {ohSelectedUser.profileImage && ohSelectedUser.profileImage !== 'present' ? <img src={ohSelectedUser.profileImage} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" /> : <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><User size={14} className="text-gray-400" /></div>}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate">{ohOwnerName}</p>
                                                            <p className="text-xs text-gray-500 font-mono">{ohSelectedUser.id_public}</p>
                                                        </div>
                                                        {ohSelectedUser.country && <span className={`${getCountryFlag(ohSelectedUser.country)} inline-block h-4 w-6 flex-shrink-0`}></span>}
                                                        <button type="button" onClick={() => { setOhSelectedUser(null); setOhOwnerName(''); setOhUserSearch(''); setOhCountry(''); }} className="text-gray-400 hover:text-gray-600 p-0.5"><X size={13} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Ownership Type */}
                                        <select value={ohOwnershipType} onChange={e => setOhOwnershipType(e.target.value)} className="block w-full p-2 border border-gray-300 rounded text-sm focus:ring-primary focus:border-primary">
                                            <option value="">Ownership Type (optional)</option>
                                            <option value="Breeder">Breeder</option>
                                            <option value="Pet Owner">Pet Owner</option>
                                            <option value="Sanctuary">Sanctuary</option>
                                            <option value="Foster">Foster</option>
                                            <option value="Show Home">Show Home</option>
                                            <option value="Research">Research</option>
                                            <option value="Other">Other</option>
                                        </select>

                                        {/* Start Date */}
                                        <input type="date" value={ohStartDate} onChange={e => setOhStartDate(e.target.value)} placeholder="Start Date" className="block w-full p-2 border border-gray-300 rounded text-sm focus:ring-primary focus:border-primary" />

                                        {/* Country dropdown */}
                                        <select value={ohCountry} onChange={e => setOhCountry(e.target.value)} className="block w-full p-2 border border-gray-300 rounded text-sm focus:ring-primary focus:border-primary">
                                            <option value="">Country (optional)</option>
                                            {[['US','United States'],['CA','Canada'],['GB','United Kingdom'],['AU','Australia'],['NZ','New Zealand'],['DE','Germany'],['FR','France'],['IT','Italy'],['ES','Spain'],['NL','Netherlands'],['SE','Sweden'],['NO','Norway'],['DK','Denmark'],['CH','Switzerland'],['BE','Belgium'],['AT','Austria'],['PL','Poland'],['CZ','Czech Republic'],['IE','Ireland'],['PT','Portugal'],['GR','Greece'],['RU','Russia'],['JP','Japan'],['KR','South Korea'],['CN','China'],['IN','India'],['BR','Brazil'],['MX','Mexico'],['ZA','South Africa'],['SG','Singapore'],['HK','Hong Kong'],['MY','Malaysia'],['TH','Thailand']].map(([code, name]) => (
                                                <option key={code} value={code}>{name}</option>
                                            ))}
                                        </select>

                                        <button type="button" disabled={!ohOwnerName.trim()} onClick={() => {
                                            const entry = { ownerName: ohOwnerName.trim(), userId_public: ohSelectedUser?.id_public || null, country: ohCountry || null, startDate: ohStartDate || '', endDate: '', ownershipType: ohOwnershipType || '' };
                                            setFormData(prev => ({ ...prev, ownershipHistory: [...(prev.ownershipHistory || []), entry] }));
                                            setOhOwnerName(''); setOhCountry(''); setOhSelectedUser(null); setOhUserSearch(''); setOhUserResults([]); setOhOwnershipType(''); setOhStartDate('');
                                        }} className="w-full py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded transition disabled:opacity-40 disabled:cursor-not-allowed">
                                            + Add Entry
                                        </button>
                                    </div>
                                </FormSection>
                                <FormSection title="Show & Performance" icon={<Trophy size={16} />}>
                                    {/* Structured Show Events */}
                                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-700">Show Events</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                <DatePicker value={newShow.date} onChange={(e) => setNewShow({ ...newShow, date: e.target.value })} className="py-1.5 px-2 text-sm" />
                                                <input type="text" value={newShow.showName} onChange={(e) => setNewShow({ ...newShow, showName: e.target.value })} placeholder="Show Name (e.g., Westminster)" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newShow.titleEarned} onChange={(e) => setNewShow({ ...newShow, titleEarned: e.target.value })} placeholder="Title Earned (e.g., Best in Show)" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newShow.judgeName} onChange={(e) => setNewShow({ ...newShow, judgeName: e.target.value })} placeholder="Judge Name" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newShow.score} onChange={(e) => setNewShow({ ...newShow, score: e.target.value })} placeholder="Score/Placement (e.g., 95/100)" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <textarea value={newShow.judgeComments} onChange={(e) => setNewShow({ ...newShow, judgeComments: e.target.value })} placeholder="Judge Comments" rows="2" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md md:col-span-2 lg:col-span-1" />
                                            </div>
                                            <button type="button" onClick={addShow} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">+ Add Show Event</button>
                                        </div>
                                        {(parseJsonArrayField(formData.shows) || []).map((show, i) => (
                                            <div key={i} className="flex justify-between items-start text-xs p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded border border-purple-200">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-purple-900">{show.showName}</div>
                                                    <div className="text-gray-700">{show.date}: {show.titleEarned || '(no title)'}</div>
                                                    {show.judgeName && <div className="text-gray-600">Judge: {show.judgeName}</div>}
                                                    {show.score && <div className="text-gray-600">Score: {show.score}</div>}
                                                    {show.judgeComments && <div className="text-gray-600 italic">{show.judgeComments}</div>}
                                                </div>
                                                <button type="button" onClick={() => removeArrayItem('shows', i)} className="ml-2"><Trash2 size={14} className="text-red-500" /></button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Legacy Text Fields for Backward Compatibility */}
                                    <div className="space-y-2 text-xs text-gray-500 italic">
                                        <p className="font-semibold">Legacy Fields (for import compatibility)</p>
                                        <div><label className="block text-xs font-medium text-gray-700">Show Titles</label><textarea name="showTitles" value={formData.showTitles} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Working Titles</label><textarea name="workingTitles" value={formData.workingTitles} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Show Ratings & Placements</label><textarea name="showRatings" value={formData.showRatings || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Grand Champion 2024, Reserve Winner, Points: 50" /></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Judge Comments & Evaluations</label><textarea name="judgeComments" value={formData.judgeComments || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="Notable feedback from judges, critiques, recommendations" /></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Performance Scores & Assessments</label><textarea name="performanceScores" value={formData.performanceScores || ''} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Agility: 9/10, Obedience: 8/10, Temperament: 10/10" /></div>
                                    </div>
                                </FormSection>
                                <FormSection title="Sale & Purchase" icon={<DollarSign size={16} />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200">
                                        <div><label className="block text-xs font-medium text-gray-700">Purchase Date</label><input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                        <div className="flex gap-2">
                                            <div className="flex-1"><label className="block text-xs font-medium text-gray-700">Purchase Price</label><input type="text" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} placeholder="e.g., 500, 250" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                            <div className="w-24"><label className="block text-xs font-medium text-gray-700">Currency</label><select name="purchasePriceCurrency" value={formData.purchasePriceCurrency} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"><option value="USD">USD $</option><option value="EUR">EUR €</option><option value="GBP">GBP £</option><option value="CAD">CAD C$</option><option value="AUD">AUD A$</option><option value="JPY">JPY ¥</option><option value="CHF">CHF</option><option value="INR">INR ₹</option><option value="AED">AED د.إ</option></select></div>
                                        </div>
                                        <div><label className="block text-xs font-medium text-gray-700">Seller/Breeder Name</label><input type="text" name="sellerName" value={formData.sellerName} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <label className="block text-xs font-medium text-gray-700">Seller Contact Info</label>
                                                <button type="button" onClick={() => { setAssignModalTarget('seller'); setAssignModalOpen(true); }} className="text-xs text-primary-dark font-medium hover:underline">Select Contact</button>
                                            </div>
                                            <input type="text" name="sellerContact" value={formData.sellerContact} onChange={handleChange} placeholder="Phone, email, or address" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200">
                                        <div><label className="block text-xs font-medium text-gray-700">Sale Date</label><input type="date" name="saleDate" value={formData.saleDate} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                        <div className="flex gap-2">
                                            <div className="flex-1"><label className="block text-xs font-medium text-gray-700">Sale Price</label><input type="text" name="salePrice" value={formData.salePrice} onChange={handleChange} placeholder="e.g., 800, 400" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                            <div className="w-24"><label className="block text-xs font-medium text-gray-700">Currency</label><select name="salePriceCurrency" value={formData.salePriceCurrency} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"><option value="USD">USD $</option><option value="EUR">EUR €</option><option value="GBP">GBP £</option><option value="CAD">CAD C$</option><option value="AUD">AUD A$</option><option value="JPY">JPY ¥</option><option value="CHF">CHF</option><option value="INR">INR ₹</option><option value="AED">AED د.إ</option></select></div>
                                        </div>
                                        <div><label className="block text-xs font-medium text-gray-700">Buyer Name</label><input type="text" name="buyerName" value={formData.buyerName} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <label className="block text-xs font-medium text-gray-700">Buyer Contact Info</label>
                                                <button type="button" onClick={() => { setAssignModalTarget('buyer'); setAssignModalOpen(true); }} className="text-xs text-primary-dark font-medium hover:underline">Select Contact</button>
                                            </div>
                                            <input type="text" name="buyerContact" value={formData.buyerContact} onChange={handleChange} placeholder="Phone, email, or address" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div><label className="block text-xs font-medium text-gray-700">Breeding Rights</label><select name="breedingRightsPurchased" value={formData.breedingRightsPurchased} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"><option value="">Not Specified</option><option value="yes">Yes - Breeding Rights Included</option><option value="conditional">Conditional - Limited Terms</option><option value="no">No - Breeding Rights Not Included</option></select></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Show Rights</label><select name="showRightsPurchased" value={formData.showRightsPurchased} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"><option value="">Not Specified</option><option value="yes">Yes - Show Rights Included</option><option value="conditional">Conditional - Limited Terms</option><option value="no">No - Show Rights Not Included</option></select></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Export Rights</label><select name="exportRightsPurchased" value={formData.exportRightsPurchased} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"><option value="">Not Specified</option><option value="yes">Yes - Export Rights Included</option><option value="no">No - Export Rights Not Included</option></select></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Stud Services Allowed</label><select name="studServicesAllowed" value={formData.studServicesAllowed} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"><option value="">Not Specified</option><option value="yes">Yes</option><option value="conditional">Conditional</option><option value="no">No</option></select></div>
                                    </div>
                                    <div className="space-y-3 mt-4">
                                        <div><label className="block text-xs font-medium text-gray-700">Resale Restrictions</label><textarea name="resaleRestrictions" value={formData.resaleRestrictions} onChange={handleChange} rows="2" placeholder="Any restrictions on reselling or transferring this animal" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Breeder Buyback Clause</label><textarea name="breederBuybackClause" value={formData.breederBuybackClause} onChange={handleChange} rows="2" placeholder="Details on whether original breeder has right to repurchase or buyback terms" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    </div>
                                </FormSection>
                                <FormSection title="Legal & Documentation" icon={<FileCheck size={16} />}>
                                    <div><label className="block text-xs font-medium text-gray-700">License Number</label><input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">License Jurisdiction</label><input type="text" name="licenseJurisdiction" value={formData.licenseJurisdiction} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Insurance</label><input type="text" name="insurance" value={formData.insurance} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Legal Status</label><input type="text" name="legalStatus" value={formData.legalStatus} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Breeding Restrictions</label><textarea name="breedingRestrictions" value={formData.breedingRestrictions} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Export Restrictions</label><textarea name="exportRestrictions" value={formData.exportRestrictions} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>

                                    {/* Document uploads (PDF, DOC, DOCX, Pages — max 10MB) */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Documents (Registration papers, contracts, health certificates, etc.)</label>
                                        {(formData.legalDocuments || []).length > 0 && (
                                            <div className="space-y-1 mb-2">
                                                {formData.legalDocuments.map(doc => (
                                                    <div key={doc.id} className="flex items-center justify-between gap-2 p-2 border border-gray-300 rounded-md bg-white">
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-dark hover:underline truncate min-w-0">
                                                            <FileText size={14} className="flex-shrink-0" />
                                                            <span className="truncate">{doc.filename || 'Document'}</span>
                                                        </a>
                                                        <button type="button" onClick={() => handleRemoveDocument(doc.id)} className="text-red-500 hover:text-red-700 flex-shrink-0" title="Remove document">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <label className={`flex items-center justify-center gap-2 w-full py-2 px-3 text-sm font-medium rounded-md border-2 border-dashed cursor-pointer transition-colors ${uploadingDocument ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-primary text-primary-dark hover:bg-primary/10'}`}>
                                            {uploadingDocument ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                            <span>{uploadingDocument ? 'Uploading...' : 'Upload Document'}</span>
                                            <input type="file" accept=".pdf,.doc,.docx,.pages,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.apple.pages" onChange={handleDocumentUpload} disabled={uploadingDocument} className="hidden" />
                                        </label>
                                    </div>
                                </FormSection>
                            </div>
                        )}
                    </div>
                </div>

                {parentSearchModalOpen && (
                    <ParentSearchModal
                        title={parentSearchModalConfig.title}
                        currentId={animalToEdit?.id_public}
                        onSelect={parentSearchModalConfig.onSelect}
                        onClose={() => setParentSearchModalOpen(false)}
                        authToken={authToken}
                        API_BASE_URL={API_BASE_URL}
                        showModalMessage={showModalMessage}
                        requiredGender={parentSearchModalConfig.requiredGender}
                        species={formData.species}
                    />
                )}
                
                {imageEditorOpen && (
                    <ImageEditorModal
                        files={imagesToEdit}
                        onComplete={handleImageEditorComplete}
                        onCancel={() => {
                            setImageEditorOpen(false);
                            setImagesToEdit([]);
                        }}
                    />
                )}

                {showEnclosureModal && (
                    <AssignEnclosureModal
                        isOpen={showEnclosureModal}
                        onClose={() => setShowEnclosureModal(false)}
                        onSelect={(enclosure) => {
                            setSelectedEnclosure(enclosure);
                            setFormData(prev => ({ ...prev, enclosureId: enclosure.id || enclosure.name }));
                        }}
                        availableEnclosures={availableEnclosures}
                        loadingEnclosures={loadingEnclosures}
                        API_BASE_URL={API_BASE_URL}
                        authToken={authToken}
                        showModalMessage={showModalMessage}
                    />
                )}
                
                {/* Footer */}
                <div className="p-6 border-t border-gray-300 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                            <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2">
                                <ArrowLeft size={18} />
                                <span>Cancel</span>
                            </button>
                            {animalToEdit && onDelete && (
                                <button type="button" onClick={() => onDelete(animalToEdit.id_public)} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2">
                                    <Trash2 size={18} />
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>
                        <button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2 disabled:opacity-50">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            <span>{loading ? 'Saving...' : 'Save Animal'}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AnimalFormTestModal;