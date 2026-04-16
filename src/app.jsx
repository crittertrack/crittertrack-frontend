// CritterTrack Frontend Application
import React, { useState, useEffect, useCallback, useRef, useMemo, useImperativeHandle } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams, Routes, Route, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Trash2, Edit, Save, PlusCircle, Plus, ArrowLeft, Loader2, RefreshCw, User, Users, ClipboardList, BookOpen, Settings, Mail, Globe, Bean, Milk, Search, X, Mars, Venus, Eye, EyeOff, Heart, HeartOff, HeartHandshake, Bell, XCircle, CheckCircle, Download, Upload, FileText, Link, Unlink, AlertCircle, DollarSign, Archive, ArrowLeftRight, RotateCcw, Info, Hourglass, MessageSquare, Ban, Flag, Scissors, VenusAndMars, Circle, Shield, Lock, AlertTriangle, ShoppingBag, Check, Star, Moon, MoonStar, Calculator, Network, TableOfContents, LayoutGrid, Home, Utensils, Wrench, Activity, ScrollText, Package, Calendar, Sparkles, QrCode, Images, Share2, Hash, Dna, TreeDeciduous, Tag, Egg, Hospital, Brain, Trophy, Scale, FileCheck, Palette, Sprout, Ruler, FolderOpen, Leaf, Microscope, Pill, Stethoscope, UtensilsCrossed, Droplets, Thermometer, Feather, Medal, Target, Key, Dumbbell, Gem, Flame, Baby, PawPrint, ArrowRight, LockOpen, Camera, BarChart2, Bird, Fish, Bug, Worm, Turtle, SlidersHorizontal } from 'lucide-react';
import ArchiveScreen from './components/ArchiveScreen';
import { QRCodeSVG } from 'qrcode.react';
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
import { TUTORIAL_LESSONS } from './data/tutorialLessonsNew';
import DatePicker from './components/DatePicker';
import InfoTab from './components/InfoTab';
import WelcomeGuideModal from './components/WelcomeGuideModal';
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

// App version for cache invalidation - increment to force cache clear
const APP_VERSION = '7.0.4';

const GENDER_OPTIONS = ['Male', 'Female', 'Intersex', 'Unknown'];
const STATUS_OPTIONS = ['Pet', 'Breeder', 'Available', 'Booked', 'Sold', 'Retired', 'Deceased', 'Rehomed', 'Unknown']; 

const DEFAULT_SPECIES_OPTIONS = ['Fancy Mouse', 'Fancy Rat', 'Russian Dwarf Hamster', 'Campbells Dwarf Hamster', 'Chinese Dwarf Hamster', 'Syrian Hamster', 'Guinea Pig'];

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

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

// Helper function to format date strings for display
const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    try {
        // Pass the raw string to formatDateShort so it can parse as local time
        return formatDateShort(dateString);
    } catch (e) {
        return dateString; // Return as-is if parsing fails
    }
};

// Returns a human-friendly age string from a birth date, matching the animal age format (e.g. "9d", "3m 5d", "1y 2m 10d")
const litterAge = (birthDate) => {
    if (!birthDate) return null;
    const born = new Date(birthDate);
    const now = new Date();
    if (isNaN(born.getTime()) || born > now) return null;
    let years = now.getFullYear() - born.getFullYear();
    let months = now.getMonth() - born.getMonth();
    let days = now.getDate() - born.getDate();
    if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    if (years > 0) return `${years}y ${months}m ${days}d`;
    if (months > 0) return `${months}m ${days}d`;
    return `${days}d`;
};

// Formats a date/ISO string as a relative time phrase (e.g. "2 hours ago")
const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const then = new Date(dateStr);
    if (isNaN(then.getTime())) return '';
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMo = Math.floor(diffDays / 30);
    if (diffMo < 12) return `${diffMo}mo ago`;
    return `${Math.floor(diffMo / 12)}y ago`;
};

// Maps an activity action code to a human-readable label
const getActionLabel = (action) => {
    const labels = {
        login: 'Logged in',
        logout: 'Logged out',
        password_change: 'Changed password',
        profile_update: 'Updated profile',
        profile_image_change: 'Changed profile photo',
        privacy_settings_change: 'Updated privacy settings',
        animal_create: 'Added a new animal',
        animal_update: 'Updated animal',
        animal_delete: 'Deleted animal',
        animal_image_upload: 'Uploaded animal photo',
        animal_image_delete: 'Deleted animal photo',
        animal_visibility_change: 'Changed animal visibility',
        animal_transfer_initiate: 'Initiated animal transfer',
        animal_transfer_accept: 'Accepted animal transfer',
        animal_transfer_reject: 'Rejected animal transfer',
        litter_create: 'Recorded a new litter',
        litter_update: 'Updated litter',
        litter_delete: 'Deleted litter',
        message_send: 'Sent a message',
        message_delete: 'Deleted a message',
        report_submit: 'Submitted a report',
        transaction_create: 'Added a budget transaction',
        transaction_delete: 'Deleted a budget transaction',
    };
    return labels[action] || action?.replace(/_/g, ' ') || 'Unknown action';
};

// Maps an activity action code to a Tailwind bg color class for indicator dots
const getActionColor = (action) => {
    if (!action) return 'bg-gray-300';
    if (action.startsWith('animal_')) return 'bg-accent';
    if (action.startsWith('litter_')) return 'bg-purple-400';
    if (action.startsWith('litter_')) return 'bg-purple-400';
    if (action.startsWith('transaction_')) return 'bg-emerald-400';
    if (action.startsWith('message_')) return 'bg-blue-400';
    if (action === 'login' || action === 'logout') return 'bg-gray-400';
    if (action.startsWith('profile_') || action.startsWith('privacy_')) return 'bg-yellow-400';
    if (action === 'report_submit') return 'bg-red-400';
    return 'bg-gray-300';
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

// Conflict Resolution Modal Component
const ConflictResolutionModal = ({ conflicts, litter, onResolve, onCancel }) => {
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
                        try {
                            // First try /animals endpoint for owned animals (includes private)
                            const response = await axios.get(`${API_BASE_URL}/animals/${id}`, {
                                headers: { Authorization: `Bearer ${authToken}` }
                            });
                            animalInfo = response.data;
                            foundViaOwned = true; // Only set when truly owned by the user
                        } catch (error) {
                            // Not owned, try /animals/any endpoint for related/accessible animals
                            try {
                                const response = await axios.get(`${API_BASE_URL}/animals/any/${id}`, {
                                    headers: { Authorization: `Bearer ${authToken}` }
                                });
                                animalInfo = response.data;
                                // Do NOT set foundViaOwned = true here ? animal is accessible but not owned.
                                // This ensures the showOnPublicProfile check below still applies,
                                // consistent with how ViewOnlyParentCard handles the same case.
                            } catch (error2) {
                                console.log(`Animal ${id} not accessible via owned or related endpoints:`, error2.message);
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
                    Add some animals to your collection to manage your breeding status and appear in the Breeders Registry.
                </p>
            </div>
        );
    }

    return (
        <div className="mb-8 p-4 sm:p-6 border rounded-lg bg-gray-50 overflow-x-hidden" data-tutorial-target="breeding-status-section">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Species & Breeding Status</h3>
            <p className="text-sm text-gray-600 mb-1">
                Set your breeding status for each species. Marking yourself as an <strong>Active Breeder</strong> or <strong>Retired Breeder</strong> will make you visible in the Breeders Registry.
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
const GlobalSearchBar = ({ API_BASE_URL, onSelectUser, onSelectAnimal, className = '' }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [animalResults, setAnimalResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = React.useRef(null);
    const debounceTimerRef = React.useRef(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search function
    const performSearch = async (term) => {
        if (!term || term.trim().length < 2) {
            setUserResults([]);
            setAnimalResults([]);
            setShowResults(false);
            return;
        }

        setLoading(true);
        setShowResults(true);
        
        try {
            // Search both users and animals in parallel
            const trimmedTerm = term.trim();
            
            // Check for specific ID patterns
            const hasCTU = /CTU/i.test(trimmedTerm);
            const hasCTC = /CTC/i.test(trimmedTerm);
            const hasCT = /^CT[- ]?\d+$/i.test(trimmedTerm);
            const isNumericOnly = /^\d+$/.test(trimmedTerm);
            
            // Extract the numeric part from any pattern
            const numericMatch = trimmedTerm.match(/(\d+)/);
            const numericId = numericMatch ? numericMatch[1] : null;
            
            console.log('Search term:', trimmedTerm);
            console.log('Has CTU:', hasCTU, 'Has CTC:', hasCTC, 'Has CT:', hasCT, 'Numeric only:', isNumericOnly);
            console.log('Numeric ID:', numericId);
            
            let userUrl = null;
            let animalUrl = null;
            
            if (hasCTU && numericId) {
                // CTU1279 - only search users
                userUrl = `${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(`CTU${numericId}`)}&limit=10`;
            } else if (hasCTC && numericId) {
                // CTC1279 - only search animals
                animalUrl = `${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(`CTC${numericId}`)}`;
            } else if ((hasCT || isNumericOnly) && numericId) {
                // CT1279 or 1279 - search both
                userUrl = `${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(`CTU${numericId}`)}&limit=10`;
                animalUrl = `${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(`CTC${numericId}`)}`;
            } else {
                // Regular text search - search both by name/species
                userUrl = `${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(trimmedTerm)}&limit=10`;
                animalUrl = `${API_BASE_URL}/public/global/animals?name=${encodeURIComponent(trimmedTerm)}&species=${encodeURIComponent(trimmedTerm)}&limit=10`;
            }
            
            console.log('User URL:', userUrl);
            console.log('Animal URL:', animalUrl);
            
            // Only make the requests that are needed
            const promises = [];
            if (userUrl) promises.push(axios.get(userUrl));
            else promises.push(Promise.resolve({ data: [] }));
            
            if (animalUrl) promises.push(axios.get(animalUrl));
            else promises.push(Promise.resolve({ data: [] }));
            
            const [usersResponse, animalsResponse] = await Promise.all(promises);
            
            console.log('Animals response:', animalsResponse.data);
            console.log('Users response:', usersResponse.data);
            
            // Filter out completely anonymous users (both names hidden/unavailable)
            const filteredUsers = (usersResponse.data || []).filter(user => {
                const showPersonalName = user.showPersonalName ?? false;
                const showBreederName = user.showBreederName ?? false;
                const hasPersonalName = showPersonalName && user.personalName;
                const hasBreederName = showBreederName && user.breederName;
                
                // Only include users who have at least one name visible
                return hasPersonalName || hasBreederName;
            });
            
            setUserResults(filteredUsers);
            setAnimalResults(animalsResponse.data || []);
        } catch (error) {
            console.error('Search error:', error);
            setUserResults([]);
            setAnimalResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search input
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
            performSearch(value);
        }, 300);
    };

    const handleUserClick = (user) => {
        setShowResults(false);
        setSearchTerm('');
        onSelectUser(user);
    };

    const handleAnimalClick = (animal) => {
        setShowResults(false);
        setSearchTerm('');
        onSelectAnimal(animal);
    };

    const totalResults = userResults.length + animalResults.length;

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search users, animals, IDs..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => searchTerm.trim().length >= 2 && setShowResults(true)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition text-sm"
                />
                {loading && (
                    <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                )}
            </div>

            {/* Results dropdown */}
            {showResults && searchTerm.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">
                            <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                            <p className="text-sm">Searching...</p>
                        </div>
                    ) : totalResults === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            <p className="text-sm">No results found for "{searchTerm}"</p>
                        </div>
                    ) : (
                        <>
                            {/* User results */}
                            {userResults.length > 0 && (
                                <div className="border-b border-gray-100">
                                    <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Users ({userResults.length})
                                    </div>
                                    {userResults.map(user => {
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
                                                key={user.id_public}
                                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer transition flex items-center gap-3"
                                                onClick={() => handleUserClick(user)}
                                            >
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt={displayName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <User size={20} className="text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate flex items-center gap-2">
                                                        {displayName}
                                                        {getDonationBadge(user) && <DonationBadge badge={getDonationBadge(user)} size="xs" />}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-mono">{user.id_public}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Animal results */}
                            {animalResults.length > 0 && (
                                <div>
                                    <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Animals ({animalResults.length})
                                    </div>
                                    {animalResults.map(animal => (
                                        <div
                                            key={animal.id_public}
                                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer transition flex items-center gap-3"
                                            onClick={() => handleAnimalClick(animal)}
                                        >
                                            <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                <AnimalImage 
                                                    src={animal.imageUrl || animal.photoUrl} 
                                                    alt={animal.name} 
                                                    className="w-full h-full object-cover" 
                                                    iconSize={20} 
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">
                                                    {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {animal.species} · {animal.gender} · {animal.id_public}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// Reusable QR code share modal
const QRModal = ({ url, title, onClose }) => {
    const [copied, setCopied] = React.useState(false);
    const handleCopy = () => navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 w-72" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between w-full">
                    <h3 className="font-semibold text-gray-800 text-sm truncate pr-2">{title || 'Share'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                    <QRCodeSVG value={url} size={196} bgColor="#ffffff" fgColor="#111827" level="M" />
                </div>
                <p className="text-xs text-gray-400 break-all text-center leading-relaxed">{url}</p>
                <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg text-sm transition"
                >
                    {copied ? <><CheckCircle size={14} /> Copied!</> : <><Link size={14} /> Copy Link</>}
                </button>
            </div>
        </div>
    );
};

// Safely renders bold/italic markdown in breeder info text.
// HTML entities are escaped first to prevent XSS, then markdown syntax is applied.
const renderBreederInfoMarkdown = (text) => {
    if (!text) return '';
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return escaped
        .replace(/\*\*(.+?)\*\*/gs, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/gs, '<em>$1</em>')
        .replace(/\n/g, '<br>');
};

// Reusable star row ? defined at module level so React never unmounts/remounts it between renders
const RatingStarRow = ({ score, interactive, onSelect }) => (
    <div className="flex gap-1">
        {[1,2,3,4,5].map(n => (
            <button
                key={n}
                type="button"
                onClick={() => interactive && onSelect && onSelect(n)}
                className={`text-2xl leading-none transition ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'} ${n <= score ? 'text-amber-400' : 'text-gray-200'}`}
                aria-label={`${n} star`}
                disabled={!interactive}
            ><Star size={20} className="inline-block align-middle fill-current" /></button>
        ))}
    </div>
);

// Public Profile View Component - Shows a breeder's public animals
const PublicProfileView = ({ profile, onBack, onViewAnimal, API_BASE_URL, onStartMessage, authToken, setModCurrentContext, currentUserIdPublic = null, currentUserRole = 'user' }) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [activeTab, setActiveTab] = useState('animals');
    const [animalSearch, setAnimalSearch] = useState('');
    const [bioExpanded, setBioExpanded] = useState(false);
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [genderFilters, setGenderFilters] = useState({ Male: true, Female: true, Intersex: true, Unknown: true });
    const [statusFilter, setStatusFilter] = useState('');
    const [freshProfile, setFreshProfile] = useState(profile);
    const [expandedInfoFields, setExpandedInfoFields] = useState(new Set());
    const [publicLitters, setPublicLitters] = useState([]);
    const [litterYearFilter, setLitterYearFilter] = useState(''); // filter litters by birth year
    const [ratingData, setRatingData] = useState({ average: 0, count: 0, distribution: {1:0,2:0,3:0,4:0,5:0}, ratings: [] });
    const [myRating, setMyRating] = useState(null);         // own existing rating object or null
    const [ratingForm, setRatingForm] = useState({ score: 0, comment: '' });
    const [submittingRating, setSubmittingRating] = useState(false);
    const [canRate, setCanRate] = useState(false);           // auth + not own profile
    const [reportingRating, setReportingRating] = useState(null);   // rating object being reported
    const [reportRatingReason, setReportRatingReason] = useState('');
    const [reportRatingLoading, setReportRatingLoading] = useState(false);
    const [reportRatingSuccess, setReportRatingSuccess] = useState(null); // _id of successfully reported rating
    const [removingRatingId, setRemovingRatingId] = useState(null);
    const [ratingError, setRatingError] = useState('');
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoritePending, setFavoritePending] = useState(false);
    const toggleInfoField = (key) => setExpandedInfoFields(prev => {
        const next = new Set(prev);
        next.has(key) ? next.delete(key) : next.add(key);
        return next;
    });

    const isModOrAdmin = ['moderator', 'admin'].includes(currentUserRole);

    // Check if this user is favorited
    useEffect(() => {
        const checkFavorited = async () => {
            if (!authToken || !profile.id_public) return;
            
            // Don't allow favoriting yourself
            if (currentUserIdPublic === profile.id_public) return;
            
            try {
                const res = await axios.get(`${API_BASE_URL}/favorites/users`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const favorited = (res.data || []).some(u => u.id_public === profile.id_public);
                setIsFavorited(favorited);
            } catch (error) {
                console.error('Error checking favorite status:', error);
            }
        };
        
        checkFavorited();
    }, [authToken, profile.id_public, currentUserIdPublic, API_BASE_URL]);

    const toggleFavorite = async () => {
        if (!authToken || favoritePending) return;
        
        setFavoritePending(true);
        try {
            if (isFavorited) {
                await axios.delete(`${API_BASE_URL}/favorites/users/${profile.id_public}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setIsFavorited(false);
            } else {
                await axios.post(`${API_BASE_URL}/favorites/users/${profile.id_public}`, {}, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setIsFavorited(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setFavoritePending(false);
        }
    };

    const handleSubmitRating = async () => {
        if (!ratingForm.score || ratingForm.score < 1) return;
        setSubmittingRating(true);
        setRatingError('');
        try {
            const resp = await axios.post(
                `${API_BASE_URL}/ratings/${freshProfile?.id_public || profile.id_public}`,
                { score: ratingForm.score, comment: ratingForm.comment },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setMyRating(resp.data?.rating || { score: ratingForm.score, comment: ratingForm.comment });
            const pub = await axios.get(`${API_BASE_URL}/public/ratings/${freshProfile?.id_public || profile.id_public}`);
            setRatingData({
                average: pub.data?.average ?? 0,
                count: pub.data?.count ?? 0,
                distribution: pub.data?.distribution ?? {1:0,2:0,3:0,4:0,5:0},
                ratings: pub.data?.ratings ?? [],
            });
        } catch (err) {
            console.error('Failed to submit rating', err);
            setRatingError(err.response?.data?.message || 'Failed to submit rating. Please try again.');
        } finally {
            setSubmittingRating(false);
        }
    };

    const handleDeleteRating = async () => {
        setSubmittingRating(true);
        setRatingError('');
        try {
            await axios.delete(
                `${API_BASE_URL}/ratings/${freshProfile?.id_public || profile.id_public}`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setMyRating(null);
            setRatingForm({ score: 0, comment: '' });
            const pub = await axios.get(`${API_BASE_URL}/public/ratings/${freshProfile?.id_public || profile.id_public}`);
            setRatingData({
                average: pub.data?.average ?? 0,
                count: pub.data?.count ?? 0,
                distribution: pub.data?.distribution ?? {1:0,2:0,3:0,4:0,5:0},
                ratings: pub.data?.ratings ?? [],
            });
        } catch (err) {
            console.error('Failed to delete rating', err);
            setRatingError(err.response?.data?.message || 'Failed to remove rating. Please try again.');
        } finally {
            setSubmittingRating(false);
        }
    };

    const handleReportRating = async (ratingId) => {
        if (!reportRatingReason.trim()) return;
        setReportRatingLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/reports/rating`, {
                ratingId,
                targetId_public: freshProfile?.id_public || profile.id_public,
                reason: reportRatingReason.trim()
            }, { headers: { Authorization: `Bearer ${authToken}` } });
            setReportingRating(null);
            setReportRatingReason('');
            setReportRatingSuccess(ratingId);
            setTimeout(() => setReportRatingSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to submit rating report', err);
        } finally {
            setReportRatingLoading(false);
        }
    };

    const handleModRemoveRating = async (ratingId) => {
        if (!window.confirm('Remove this rating? This cannot be undone.')) return;
        setRemovingRatingId(ratingId);
        try {
            await axios.delete(`${API_BASE_URL}/moderation/ratings/${ratingId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const pub = await axios.get(`${API_BASE_URL}/public/ratings/${profile.id_public}`);
            setRatingData({
                average: pub.data?.average ?? 0,
                count: pub.data?.count ?? 0,
                distribution: pub.data?.distribution ?? {1:0,2:0,3:0,4:0,5:0},
                ratings: pub.data?.ratings ?? [],
            });
        } catch (err) {
            console.error('Failed to remove rating', err);
        } finally {
            setRemovingRatingId(null);
        }
    };
    
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

    useEffect(() => {
        const fetchPublicLitters = async () => {
            if (!profile?.id_public) return;
            try {
                const resp = await axios.get(`${API_BASE_URL}/public/litters/user/${profile.id_public}`);
                setPublicLitters(resp.data || []);
            } catch {
                setPublicLitters([]);
            }
        };
        fetchPublicLitters();
    }, [profile?.id_public, API_BASE_URL]);

    useEffect(() => {
        const fetchRatings = async () => {
            if (!profile?.id_public) return;
            try {
                const resp = await axios.get(`${API_BASE_URL}/public/ratings/${profile.id_public}`);
                const data = resp.data || {};
                setRatingData({
                    average: data.average ?? 0,
                    count: data.count ?? 0,
                    distribution: data.distribution ?? {1:0,2:0,3:0,4:0,5:0},
                    ratings: data.ratings ?? [],
                });
            } catch {
                setRatingData({ average: 0, count: 0, distribution: {1:0,2:0,3:0,4:0,5:0}, ratings: [] });
            }
            // canRate: logged in + not viewing own profile
            const canRateNow = !!authToken && !!profile?.id_public && profile.id_public !== currentUserIdPublic;
            setCanRate(canRateNow);

            // If authenticated, fetch own existing rating for this breeder
            if (authToken) {
                try {
                    const resp = await axios.get(`${API_BASE_URL}/ratings/${profile.id_public}/mine`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    if (resp.data?.score) {
                        setMyRating(resp.data);
                        setRatingForm({ score: resp.data.score, comment: resp.data.comment || '' });
                    }
                } catch (err) {
                    // 401/403/network ? ignore, canRate already set above
                }
            }
        };
        fetchRatings();
    }, [profile?.id_public, API_BASE_URL, authToken, currentUserIdPublic]);

    const memberSince = (freshProfile?.createdAt || profile.createdAt)
        ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(freshProfile?.createdAt || profile.createdAt))
        : ((freshProfile?.updatedAt || profile.updatedAt) ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(freshProfile?.updatedAt || profile.updatedAt)) : 'Unknown');

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
        if (animal.isOwned === false) return false;
        if (speciesFilter && animal.species !== speciesFilter) return false;
        // Show nothing if both genders are unchecked
        if (!genderFilters.Male && !genderFilters.Female) return false;
        // Filter by selected genders
        if (!genderFilters[animal.gender]) return false;
        if (statusFilter && animal.status !== statusFilter) return false;
        if (animalSearch) {
            const q = animalSearch.toLowerCase();
            const name = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ').toLowerCase();
            if (!name.includes(q) && !(animal.id_public || '').toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const hasBreederInfo = !!(freshProfile?.breederInfo &&
        (Object.entries(freshProfile.breederInfo)
            .some(([k, v]) => k !== 'customFields' && typeof v === 'string' && v.trim()) ||
         (Array.isArray(freshProfile.breederInfo.customFields) &&
          freshProfile.breederInfo.customFields.some(cf => cf.title?.trim() && cf.value?.trim()))));

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
                    {authToken && currentUserIdPublic !== profile.id_public && (
                        <button
                            onClick={toggleFavorite}
                            disabled={favoritePending}
                            className={`px-3 py-1.5 font-semibold rounded-lg transition flex items-center gap-2 ${
                                isFavorited 
                                    ? 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            } ${favoritePending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
                            {isFavorited ? 'Favorited' : 'Favorite'}
                        </button>
                    )}
                    <button
                        onClick={() => setShowQR(true)}
                        className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-2"
                    >
                        <QrCode size={16} />
                        Share Profile
                    </button>
                    {showQR && <QRModal url={`${window.location.origin}/user/${freshProfile?.id_public || profile.id_public}`} title={freshProfile?.breederName || freshProfile?.personalName || 'Share Profile'} onClose={() => setShowQR(false)} />}
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

            {/* Profile Header • two equal columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4 pb-4 border-b">
                {/* Left column: name • avatar • ctu • member since • country • centered */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="flex items-center justify-center flex-wrap">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight inline">{displayName}</h2>
                        <span className="ml-1 inline-block"><DonationBadge user={freshProfile || profile} size="sm" /></span>
                    </div>
                    {profile.profileImage ? (
                        <img src={profile.profileImage} alt={displayName} className="w-24 h-24 rounded-lg object-cover shadow-md" />
                    ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center shadow-md">
                            <User size={40} className="text-gray-400" />
                        </div>
                    )}
                    <span className="font-mono text-accent font-semibold text-sm">
                        {['CTU1', 'CTU2'].includes(freshProfile?.id_public || profile.id_public) && (
                            <Key size={14} className="inline-block align-middle mr-1 text-amber-500" />
                        )}
                        {['CTU3', 'CTU4', 'CTU5', 'CTU6', 'CTU7', 'CTU9', 'CTU10', 'CTU11'].includes(freshProfile?.id_public || profile.id_public) && (
                            <Sprout size={14} className="inline-block align-middle mr-1 text-green-500" />
                        )}
                        {freshProfile?.id_public || profile.id_public}
                    </span>
                    {ratingData.count > 0 && (
                        <button onClick={() => setActiveTab('ratings')} className="flex items-center gap-1 text-xs text-amber-500 font-semibold hover:text-amber-600 transition" title="See ratings">
                            <Star size={12} className="inline-block align-middle fill-current" />
                            <span>{ratingData.average.toFixed(1)}</span>
                            <span className="text-gray-400 font-normal">({ratingData.count})</span>
                        </button>
                    )}
                    <span className="text-xs text-gray-500">Member since {memberSince}</span>
                    {(freshProfile?.country || profile.country) && (
                        <span className="flex items-center justify-center gap-1 text-xs text-gray-500">
                            <span className={`${getCountryFlag(freshProfile?.country || profile.country)} inline-block h-3.5 w-5 flex-shrink-0`}></span>
                            <span>{getCountryName(freshProfile?.country || profile.country)}{(freshProfile?.country || profile.country) === 'US' && (freshProfile?.state || profile.state) ? `, ${getStateName(freshProfile?.state || profile.state)}` : ''}</span>
                        </span>
                    )}
                    {/* Breeding status pills */}
                    {(() => {
                        const bs = freshProfile?.breedingStatus || profile.breedingStatus;
                        if (!bs) return null;
                        const active = Object.entries(bs).filter(([, v]) => v === 'breeder' || v === 'retired');
                        if (!active.length) return null;
                        return (
                            <div className="flex flex-wrap justify-center gap-2 mt-1">
                                {active.map(([species, status]) => (
                                    <div key={species} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-full border border-gray-200">
                                        {status === 'breeder'
                                            ? <Star size={12} className="text-primary" />
                                            : <Moon size={12} className="text-gray-500" />}
                                        <span className="text-xs font-medium text-gray-800">{getSpeciesDisplayName(species)}</span>
                                        <span className="text-xs text-gray-400">({status === 'breeder' ? 'Active' : 'Retired'})</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {/* Right column: bio only */}
                <div className="flex flex-col items-center gap-1.5">
                    {(freshProfile?.showBio ?? profile.showBio ?? true) && (freshProfile?.bio || profile.bio) && (
                        <>
                            <p className={`w-full text-sm text-gray-700 text-left whitespace-pre-wrap break-words${!bioExpanded ? ' line-clamp-[15]' : ''}`}>
                                {freshProfile?.bio || profile.bio}
                            </p>
                            {(freshProfile?.bio || profile.bio || '').split('\n').length > 15 || (freshProfile?.bio || profile.bio || '').length > 600 ? (
                                <button onClick={() => setBioExpanded(v => !v)} className="text-xs text-accent hover:underline mt-0.5">
                                    {bioExpanded ? 'Show less' : 'Read more'}
                                </button>
                            ) : null}
                        </>
                    )}
                </div>
            </div>

            {/* Email + website + social • full width under both columns */}
            {((freshProfile?.showEmailPublic ?? profile.showEmailPublic) && (freshProfile?.email || profile.email)) ||
             ((freshProfile?.showWebsiteURL ?? profile.showWebsiteURL) && (freshProfile?.websiteURL || profile.websiteURL)) ||
             ((freshProfile?.showSocialMediaURL ?? profile.showSocialMediaURL) && (freshProfile?.socialMediaURL || profile.socialMediaURL)) ? (
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mb-4 pb-4 border-b">
                    {(freshProfile?.showEmailPublic ?? profile.showEmailPublic) && (freshProfile?.email || profile.email) && (
                        <a href={`mailto:${freshProfile?.email || profile.email}`} className="text-sm text-gray-600 flex items-center gap-1.5 hover:text-accent transition break-all">
                            <Mail size={14} className="text-accent flex-shrink-0" />
                            {freshProfile?.email || profile.email}
                        </a>
                    )}
                    {(freshProfile?.showWebsiteURL ?? profile.showWebsiteURL) && (freshProfile?.websiteURL || profile.websiteURL) && (
                        <a href={freshProfile?.websiteURL || profile.websiteURL} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 flex items-center gap-1.5 hover:text-accent transition break-all">
                            <Globe size={14} className="text-accent flex-shrink-0" />
                            {freshProfile?.websiteURL || profile.websiteURL}
                        </a>
                    )}
                    {(freshProfile?.showSocialMediaURL ?? profile.showSocialMediaURL) && (freshProfile?.socialMediaURL || profile.socialMediaURL) && (
                        <a href={freshProfile?.socialMediaURL || profile.socialMediaURL} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 flex items-center gap-1.5 hover:text-accent transition break-all">
                            <Share2 size={14} className="text-accent flex-shrink-0" />
                            {freshProfile?.socialMediaURL || profile.socialMediaURL}
                        </a>
                    )}
                </div>
            ) : null}

            {/* Tab Bar */}
            <div className="flex flex-wrap border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('animals')}
                    className={`flex-shrink-0 whitespace-nowrap text-center px-3 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${activeTab === 'animals' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                    Animals ({animals.filter(a => a.isOwned !== false).length})
                </button>
                {hasBreederInfo && (
                    <button
                        onClick={() => setActiveTab('info-adoption')}
                        className={`flex-shrink-0 whitespace-nowrap text-center px-3 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${activeTab === 'info-adoption' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Info &amp; Adoption
                    </button>
                )}
                {publicLitters.length > 0 && (
                    <button
                        onClick={() => setActiveTab('litters')}
                        className={`flex-shrink-0 whitespace-nowrap text-center px-3 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${activeTab === 'litters' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Pairings ({publicLitters.length})
                    </button>
                )}
                {animals.some(a => a.isForSale || a.availableForBreeding) && (
                    <button
                        onClick={() => setActiveTab('for-sale-stud')}
                        className={`flex-shrink-0 whitespace-nowrap text-center px-3 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${activeTab === 'for-sale-stud' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        For Sale / Stud ({animals.filter(a => a.isForSale || a.availableForBreeding).length})
                    </button>
                )}
                {(freshProfile?.showStatsTab ?? true) && (
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex-shrink-0 whitespace-nowrap text-center px-3 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${activeTab === 'stats' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Stats
                    </button>
                )}
                <button
                    onClick={() => setActiveTab('ratings')}
                    className={`flex-shrink-0 whitespace-nowrap text-center px-3 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${activeTab === 'ratings' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                    Ratings{ratingData.count > 0 && ` (${ratingData.count})`}
                </button>
            </div>

            {/* Animals Tab */}
            {activeTab === 'animals' && (<>
            {/* Filters */}
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    {/* Search + Species dropdown, Gender icons, and Status dropdown */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between">
                        <div className="flex gap-3 items-center flex-wrap">
                            {/* Name / ID search */}
                            <div className="flex gap-2 items-center">
                                <Search size={16} className="text-gray-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={animalSearch}
                                    onChange={(e) => setAnimalSearch(e.target.value)}
                                    placeholder="Search by name or ID?"
                                    className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition min-w-[160px]"
                                />
                            </div>
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
            </>)}

            {/* For Sale / Stud Tab */}
            {activeTab === 'for-sale-stud' && (() => {
                const forSale = animals.filter(a => a.isForSale);
                const forStud = animals.filter(a => a.availableForBreeding);
                const AnimalSaleCard = ({ animal }) => {
                    const imgSrc = animal.imageUrl || animal.photoUrl || null;
                    const isSale = animal.isForSale;
                    const isStud = animal.availableForBreeding;
                    const priceLabel = isSale
                        ? (animal.salePriceCurrency === 'Negotiable' || !animal.salePriceAmount
                            ? 'Negotiable'
                            : `${getCurrencySymbol(animal.salePriceCurrency)}${animal.salePriceAmount}`)
                        : null;
                    const studLabel = isStud
                        ? (animal.studFeeCurrency === 'Negotiable' || !animal.studFeeAmount
                            ? 'Negotiable'
                            : `${getCurrencySymbol(animal.studFeeCurrency)}${animal.studFeeAmount}`)
                        : null;
                    const ageStr = animal.birthDate ? (() => {
                        const months = Math.floor((Date.now() - new Date(animal.birthDate)) / (1000 * 60 * 60 * 24 * 30.44));
                        return months < 24 ? `${months}mo` : `${Math.floor(months / 12)}yr`;
                    })() : null;
                    return (
                        <div onClick={() => onViewAnimal(animal)}
                            className="bg-white rounded-xl border-2 border-gray-200 hover:border-primary hover:shadow-md transition cursor-pointer overflow-hidden flex flex-col"
                        >
                            <div className="relative h-36 bg-gray-50 flex items-center justify-center">
                                {imgSrc
                                    ? <img src={imgSrc} alt={animal.name} className="max-h-32 max-w-full object-contain" />
                                    : <Cat size={40} className="text-gray-300" />}
                                {animal.gender && (
                                    <span className="absolute top-2 right-2">
                                        {animal.gender === 'Male' ? <Mars size={16} strokeWidth={2.5} className="text-primary" /> : animal.gender === 'Female' ? <Venus size={16} strokeWidth={2.5} className="text-accent" /> : animal.gender === 'Intersex' ? <VenusAndMars size={16} strokeWidth={2.5} className="text-purple-500" /> : null}
                                    </span>
                                )}
                            </div>
                            <div className="p-3 flex flex-col gap-1.5 flex-1">
                                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}</p>
                                <p className="text-xs text-gray-500">{animal.species}{ageStr ? ` · ${ageStr}` : ''}</p>
                                {isSale && priceLabel && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 w-fit">
                                        <DollarSign size={11} /> {priceLabel}
                                    </span>
                                )}
                                {isStud && studLabel && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5 w-fit">
                                        <Heart size={11} /> Stud — {studLabel}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                };
                return (
                    <div className="space-y-8">
                        {forSale.length > 0 && (
                            <div>
                                <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <DollarSign size={16} className="text-green-600" /> For Sale <span className="text-sm font-normal text-gray-400">({forSale.length})</span>
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {forSale.map(a => <AnimalSaleCard key={a.id_public} animal={a} />)}
                                </div>
                            </div>
                        )}
                        {forStud.length > 0 && (
                            <div>
                                <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <Heart size={16} className="text-purple-500" /> Available for Stud <span className="text-sm font-normal text-gray-400">({forStud.length})</span>
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {forStud.map(a => <AnimalSaleCard key={a.id_public} animal={a} />)}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Info & Adoption Tab */}
            {activeTab === 'info-adoption' && hasBreederInfo && (
                <div className="space-y-2">
                    {[
                        { key: 'aboutProgram',       label: 'About My Program / Breeding Goals' },
                        { key: 'adoptionRules',      label: 'Adoption / Rehoming Rules' },
                        { key: 'careRequirements',   label: 'House / Care Requirements for Adopters' }, // legacy field
                        { key: 'enclosureCare',      label: 'Enclosure / Enclosure Care Requirements' },
                        { key: 'routineCare',        label: 'Routine Care (Food, Medical, etc.)' },
                        { key: 'healthGuarantee',    label: 'Health Guarantee' },
                        { key: 'waitlistInfo',       label: 'Waitlist and Booking Info' },
                        { key: 'pricingNotes',       label: 'Pricing / Fee Notes' },
                        { key: 'contactPreferences', label: 'Contact Preferences' },
                    ].filter(f => (freshProfile?.breederInfo?.[f.key] || '').trim()).map(f => {
                        const isOpen = expandedInfoFields.has(f.key);
                        return (
                            <div key={f.key} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => toggleInfoField(f.key)}
                                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 transition"
                                >
                                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{f.label}</span>
                                    {isOpen ? <ChevronUp size={15} className="text-gray-400 shrink-0" /> : <ChevronDown size={15} className="text-gray-400 shrink-0" />}
                                </button>
                                {isOpen && (
                                    <div className="px-4 pb-4 text-gray-800 text-sm leading-relaxed border-t border-gray-200 pt-3"
                                        dangerouslySetInnerHTML={{ __html: renderBreederInfoMarkdown(freshProfile.breederInfo[f.key]) }} />
                                )}
                            </div>
                        );
                    })}
                    {(freshProfile?.breederInfo?.customFields || [])
                        .filter(cf => cf.title?.trim() && cf.value?.trim())
                        .map((cf, idx) => {
                            const key = `custom-${idx}`;
                            const isOpen = expandedInfoFields.has(key);
                            return (
                                <div key={key} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => toggleInfoField(key)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 transition"
                                    >
                                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{cf.title}</span>
                                        {isOpen ? <ChevronUp size={15} className="text-gray-400 shrink-0" /> : <ChevronDown size={15} className="text-gray-400 shrink-0" />}
                                    </button>
                                    {isOpen && (
                                        <div className="px-4 pb-4 text-gray-800 text-sm leading-relaxed border-t border-gray-200 pt-3"
                                            dangerouslySetInnerHTML={{ __html: renderBreederInfoMarkdown(cf.value) }} />
                                    )}
                                </div>
                            );
                        })
                    }
                </div>
            )}

            {/* Litters Tab */}
            {activeTab === 'litters' && publicLitters.length > 0 && (() => {
                const formatLitterDate = (d) => d ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(d)) : null;
                const today = new Date();
                const mated = publicLitters.filter(l => l.isPlanned && l.matingDate && new Date(l.matingDate) <= today);
                const plannedOnly = publicLitters.filter(l => l.isPlanned && !(l.matingDate && new Date(l.matingDate) <= today));
                let born = publicLitters.filter(l => !l.isPlanned);
                
                // Extract unique years from born litters
                const bornYears = [...new Set(born
                    .filter(l => l.birthDate)
                    .map(l => new Date(l.birthDate).getFullYear())
                )].sort((a, b) => b - a); // newest first
                
                // Filter born litters by selected year
                if (litterYearFilter) {
                    born = born.filter(l => {
                        if (!l.birthDate) return false;
                        return new Date(l.birthDate).getFullYear().toString() === litterYearFilter;
                    });
                }
                const ParentMiniCard = ({ role, animal }) => {
                    if (!animal) return null;
                    const imgUrl = animal.imageUrl || animal.photoUrl || null;
                    const fullName = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ');
                    const isSire = role === 'Sire';
                    return (
                        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-100 min-w-0">
                            {imgUrl
                                ? <img src={imgUrl} alt={fullName} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                                : <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold ${isSire ? 'bg-blue-300' : 'bg-pink-300'}`}>{isSire ? <Mars size={16} /> : <Venus size={16} />}</div>
                            }
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">{role}</p>
                                <p className="text-xs font-semibold text-gray-800 truncate">{fullName || animal.id_public}</p>
                                {animal.variety && <p className="text-[10px] text-gray-500 truncate">{animal.variety}</p>}
                                <p className="text-[10px] font-mono text-gray-400">{animal.id_public}</p>
                            </div>
                        </div>
                    );
                };
                const LitterPublicCard = ({ l, isMated }) => (
                    <div className={`bg-white rounded-xl border p-4 pb-6 space-y-2.5 relative ${isMated ? 'border-purple-300' : l.isPlanned ? 'border-indigo-300' : 'border-gray-300'}`}>
                        {/* First line: centered breeding pair name */}
                        <div className="text-center min-h-[1.25rem] flex items-center justify-center">
                            {l.breedingPairCodeName && (
                                <span className="text-sm font-semibold text-gray-800">{l.breedingPairCodeName}</span>
                            )}
                        </div>
                        
                        {/* Second line: Sire • Dam mini-cards */}
                        {(l.sireAnimal || l.damAnimal) && (
                            <div className="flex items-center gap-2">
                                <ParentMiniCard role="Sire" animal={l.sireAnimal} />
                                <div className="w-px h-12 bg-gray-200 flex-shrink-0"></div>
                                <ParentMiniCard role="Dam" animal={l.damAnimal} />
                            </div>
                        )}
                        
                        {/* Visual divider */}
                        <div className="border-t border-gray-200 my-2"></div>
                        
                        {/* Born stats - full width */}
                        {!l.isPlanned && l.litterSizeBorn != null && (
                            <div className="flex items-center justify-center text-xs">
                                <span className="font-semibold text-gray-700">{l.litterSizeBorn} born</span>
                                {(l.maleCount != null || l.femaleCount != null || l.unknownCount != null) && (
                                    <>
                                        <span className="text-gray-400 mx-2">·</span>
                                        <span>
                                            <span className="text-blue-500 font-semibold">{l.maleCount ?? 0}M</span>
                                            <span className="text-gray-400 mx-0.5">/</span>
                                            <span className="text-pink-500 font-semibold">{l.femaleCount ?? 0}F</span>
                                            <span className="text-gray-400 mx-0.5">/</span>
                                            <span className="text-purple-500 font-semibold">{l.unknownCount ?? 0}U</span>
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                        
                        {/* Dates - full width centered */}
                        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                            {l.matingDate && <span><span className="font-medium">{isMated ? 'Mated:' : l.isPlanned ? 'Planned Mating:' : 'Mated:'}</span> {formatLitterDate(l.matingDate)}</span>}
                            {l.expectedDueDate && l.isPlanned && <span><span className="font-medium">Due:</span> {formatLitterDate(l.expectedDueDate)}</span>}
                            {l.birthDate && !l.isPlanned && <span><span className="font-medium">Born:</span> {formatLitterDate(l.birthDate)}{litterAge(l.birthDate) && <span className="ml-1 font-semibold text-green-600">? {litterAge(l.birthDate)}</span>}</span>}
                        </div>
                        
                        {/* CTL ID - bottom right corner */}
                        {l.litter_id_public && (
                            <div className="absolute bottom-2 right-3 text-[10px] font-mono text-gray-400">
                                {l.litter_id_public}
                            </div>
                        )}
                    </div>
                );
                return (
                    <div className="space-y-8">
                        {mated.length > 0 && (
                            <div>
                                <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <Heart size={16} className="text-purple-500" /> Mated Pairings <span className="text-sm font-normal text-gray-400">({mated.length})</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {mated.map(l => <LitterPublicCard key={l._id} l={l} isMated={true} />)}
                                </div>
                            </div>
                        )}
                        {plannedOnly.length > 0 && (
                            <div>
                                <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <Calendar size={16} className="text-indigo-500" /> Planned Pairings <span className="text-sm font-normal text-gray-400">({plannedOnly.length})</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {plannedOnly.map(l => <LitterPublicCard key={l._id} l={l} />)}
                                </div>
                            </div>
                        )}
                        {born.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                                        <Sparkles size={16} className="text-green-500" /> Past Pairings <span className="text-sm font-normal text-gray-400">({born.length})</span>
                                    </h3>
                                    {bornYears.length > 1 && (
                                        <select
                                            value={litterYearFilter}
                                            onChange={(e) => setLitterYearFilter(e.target.value)}
                                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition"
                                        >
                                            <option value="">All Years</option>
                                            {bornYears.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {born.map(l => <LitterPublicCard key={l._id} l={l} />)}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Stats Tab */}
            {activeTab === 'stats' && (freshProfile?.showStatsTab ?? true) && (() => {
                // ---- compute stats from existing state ----
                const animalsBySpecies = animals.reduce((acc, a) => {
                    const s = a.species || 'Unspecified';
                    acc[s] = (acc[s] || 0) + 1;
                    return acc;
                }, {});

                const bornLitters = publicLitters.filter(l => !l.isPlanned);
                const plannedLitters = publicLitters.filter(l => l.isPlanned && !(l.matingDate && new Date(l.matingDate) <= new Date()));

                const totalOffspring = bornLitters.reduce((sum, l) => sum + (l.litterSizeBorn ?? 0), 0);

                const littersBySpecies = {};
                const offspringBySpecies = {};
                bornLitters.forEach(l => {
                    const s = l.sireAnimal?.species || l.damAnimal?.species || 'Unspecified';
                    littersBySpecies[s] = (littersBySpecies[s] || 0) + 1;
                    offspringBySpecies[s] = (offspringBySpecies[s] || 0) + (l.litterSizeBorn ?? 0);
                });

                const littersByYear = {};
                const offspringByYear = {};
                bornLitters.forEach(l => {
                    if (!l.birthDate) return;
                    const yr = new Date(l.birthDate).getFullYear().toString();
                    littersByYear[yr] = (littersByYear[yr] || 0) + 1;
                    offspringByYear[yr] = (offspringByYear[yr] || 0) + (l.litterSizeBorn ?? 0);
                });

                const availableForSale = animals.filter(a => a.isForSale).length;
                const availableForStud = animals.filter(a => a.availableForBreeding).length;
                const forSaleOrStud = animals.filter(a => a.isForSale || a.availableForBreeding).length;
                const withBreederStatus = animals.filter(a => a.status === 'Breeder').length;
                const withPetStatus = animals.filter(a => a.status === 'Pet').length;
                const today = new Date();
                const matedLitters = publicLitters.filter(l => l.isPlanned && l.matingDate && new Date(l.matingDate) <= today).length;

                const StatCard = ({ label, value, sub }) => (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-1">
                        <span className="text-2xl font-bold text-gray-900">{value}</span>
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                        {sub && <span className="text-xs text-gray-400">{sub}</span>}
                    </div>
                );

                const BreakdownTable = ({ title, data, sortByValue = true }) => {
                    const entries = sortByValue
                        ? Object.entries(data).sort((a, b) => b[1] - a[1])
                        : Object.entries(data).sort((a, b) => b[0].localeCompare(a[0]));
                    if (!entries.length) return null;
                    const max = Math.max(...entries.map(([, v]) => v));
                    return (
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
                            <div className="space-y-2">
                                {entries.map(([key, val]) => (
                                    <div key={key} className="flex items-center gap-3">
                                        <span className="text-xs text-gray-600 w-28 shrink-0 truncate">{key}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full" style={{ width: `${max > 0 ? Math.round((val / max) * 100) : 0}%` }} />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700 w-6 text-right shrink-0">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                };

                return (
                    <div className="space-y-6">
                        {/* Summary cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard label="Total Animals" value={animals.length} />
                            <StatCard label="Breeder Status" value={withBreederStatus} />
                            <StatCard label="Pet Status" value={withPetStatus} />
                            <StatCard label="For Sale / Stud" value={forSaleOrStud} />
                            <StatCard label="Total Litters" value={publicLitters.length} />
                            <StatCard label="Mated Pairings" value={matedLitters} />
                            <StatCard label="Planned Pairings" value={plannedLitters.length} />
                            <StatCard label="Total Offspring" value={totalOffspring} />
                        </div>

                        {/* Breakdowns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.keys(animalsBySpecies).length > 1 && (
                                <BreakdownTable title="Animals by Species" data={animalsBySpecies} />
                            )}
                            {Object.keys(littersBySpecies).length > 1 && (
                                <BreakdownTable title="Pairings by Species" data={littersBySpecies} />
                            )}
                            {Object.keys(littersByYear).length > 0 && (
                                <BreakdownTable title="Pairings by Year" sortByValue={false} data={littersByYear} />
                            )}
                            {Object.keys(offspringByYear).length > 0 && (
                                <BreakdownTable title="Offspring by Year" sortByValue={false} data={offspringByYear} />
                            )}
                            {Object.keys(offspringBySpecies).length > 1 && (
                                <BreakdownTable title="Offspring by Species" data={offspringBySpecies} />
                            )}
                        </div>

                        {animals.length === 0 && publicLitters.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                <p className="text-sm">No public data available yet.</p>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Ratings Tab */}
            {activeTab === 'ratings' && (() => {
                const maxDist = Math.max(...Object.values(ratingData.distribution), 1);

                return (
                    <div className="space-y-6">
                        {/* Aggregate */}
                        {ratingData.count > 0 ? (
                            <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                                {/* Big average */}
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <span className="text-5xl font-bold text-gray-900">{ratingData.average.toFixed(1)}</span>
                                    <div className="flex gap-0.5">
                                        {[1,2,3,4,5].map(n => (
                                            <Star key={n} size={20} className={`inline-block align-middle ${n <= Math.round(ratingData.average) ? 'fill-current text-amber-400' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-400">{ratingData.count} {ratingData.count === 1 ? 'rating' : 'ratings'}</span>
                                </div>
                                {/* Distribution bars */}
                                <div className="flex-1 space-y-1.5 w-full">
                                    {[5,4,3,2,1].map(n => (
                                        <div key={n} className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 w-3 shrink-0">{n}</span>
                                            <Star size={12} className="inline-block align-middle fill-current text-amber-400 flex-shrink-0" />
                                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                                                <div
                                                    className="bg-amber-400 h-2 rounded-full transition-all"
                                                    style={{ width: `${Math.round(((ratingData.distribution[n] || 0) / maxDist) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400 w-4 text-right shrink-0">{ratingData.distribution[n] || 0}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p className="mb-2 flex justify-center"><Star size={32} className="text-gray-200" /></p>
                                <p className="text-sm">No ratings yet.</p>
                            </div>
                        )}

                        {/* Rate / Edit form */}
                        {canRate && (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">
                                    {myRating ? 'Edit Your Rating' : 'Rate This User'}
                                </h4>
                                <RatingStarRow
                                    score={ratingForm.score}
                                    interactive
                                    onSelect={(n) => setRatingForm(prev => ({ ...prev, score: n }))}
                                />
                                <textarea
                                    value={ratingForm.comment}
                                    onChange={(e) => setRatingForm(prev => ({ ...prev, comment: e.target.value.slice(0, 500) }))}
                                    placeholder="Optional comment (max 500 characters)?"
                                    rows={3}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:ring-primary focus:border-primary transition"
                                />
                                {ratingError && (
                                    <p className="text-xs text-red-500 font-medium">{ratingError}</p>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleSubmitRating}
                                        disabled={!ratingForm.score || submittingRating}
                                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-black text-sm font-semibold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {submittingRating ? 'Saving?' : (myRating ? 'Update Rating' : 'Submit Rating')}
                                    </button>
                                    {myRating && (
                                        <button
                                            type="button"
                                            onClick={handleDeleteRating}
                                            disabled={submittingRating}
                                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg border border-red-200 transition disabled:opacity-40"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        {!authToken && (
                            <p className="text-center text-sm text-gray-400">Sign in to leave a rating.</p>
                        )}

                        {/* Reviews list */}
                        {ratingData.ratings.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">Recent Reviews</h4>
                                {ratingData.ratings.map((r, i) => (
                                    <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-0.5">
                                                    {[1,2,3,4,5].map(n => (
                                                        <Star key={n} size={14} className={`inline-block align-middle ${n <= r.score ? 'fill-current text-amber-400' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-semibold text-gray-700">{r.raterName || r.raterId_public}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 shrink-0">
                                                    {new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(r.createdAt))}
                                                </span>
                                                {isModOrAdmin && (
                                                    <button
                                                        onClick={() => handleModRemoveRating(r._id)}
                                                        disabled={removingRatingId === r._id}
                                                        className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition disabled:opacity-40"
                                                        title="Remove this rating (moderator)"
                                                    >
                                                        {removingRatingId === r._id ? 'X' : 'Remove'}
                                                    </button>
                                                )}
                                                {authToken && r.raterId_public !== currentUserIdPublic && !isModOrAdmin && (
                                                    <button
                                                        onClick={() => { setReportingRating(r); setReportRatingReason(''); }}
                                                        className="text-xs px-2 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 transition"
                                                        title="Report this rating"
                                                    >
                                                        Report
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {r.comment?.trim() && (
                                            <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                                        )}
                                        {reportRatingSuccess === r._id && (
                                            <p className="text-xs text-green-600 font-medium">Report submitted. Thank you.</p>
                                        )}
                                        {reportingRating?._id === r._id && (
                                            <div className="mt-2 space-y-2 border-t border-gray-100 pt-2">
                                                <p className="text-xs font-semibold text-gray-600">Why are you reporting this rating?</p>
                                                <textarea
                                                    value={reportRatingReason}
                                                    onChange={(e) => setReportRatingReason(e.target.value.slice(0, 500))}
                                                    placeholder="Describe the issue (required)?"
                                                    rows={2}
                                                    className="w-full p-2 border border-gray-300 rounded-lg text-xs resize-none focus:ring-primary focus:border-primary"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleReportRating(r._id)}
                                                        disabled={!reportRatingReason.trim() || reportRatingLoading}
                                                        className="px-3 py-1 bg-primary hover:bg-primary/90 text-black text-xs font-semibold rounded-lg transition disabled:opacity-40"
                                                    >
                                                        {reportRatingLoading ? 'Submitting?' : 'Submit Report'}
                                                    </button>
                                                    <button
                                                        onClick={() => { setReportingRating(null); setReportRatingReason(''); }}
                                                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
};

// ==================== DETAIL VIEW TEMPLATE HOOK ====================
// Custom hook for template-aware labels in all detail views
const useDetailFieldTemplate = (species, API_BASE_URL) => {
    const [fieldTemplate, setFieldTemplate] = useState(null);
    useEffect(() => {
        if (!species || !API_BASE_URL) return;
        axios.get(`${API_BASE_URL}/species/with-template/${encodeURIComponent(species)}`)
            .then(res => setFieldTemplate(res.data?.fieldTemplate || null))
            .catch(() => setFieldTemplate(null));
    }, [species, API_BASE_URL]);
    const getLabel = (fieldName, defaultLabel) =>
        fieldTemplate?.fields?.[fieldName]?.label || defaultLabel;
    return { fieldTemplate, getLabel };
};

// ==================== DETAIL VIEW HELPERS ====================
const parseJsonField = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try { return JSON.parse(data); } catch { return []; }
};

const DetailJsonList = ({ label, data, renderItem }) => {
    const items = parseJsonField(data);
    if (!items.length) return null;
    return (
        <div>
            <strong className="text-sm text-gray-700">{label}:</strong>
            <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                {items.map((item, i) => <li key={i} className="text-gray-700">{renderItem(item)}</li>)}
            </ul>
        </div>
    );
};

// ==================== RELATIONSHIP INSIGHTS HELPER ====================
// Computes related animals (up to 3 generations) from the user's own animal collection.
// Returns array of { animal, rel } sorted by proximity (parents first).
const computeRelationships = (animal, userAnimals) => {
    if (!animal || !userAnimals || userAnimals.length === 0) return [];
    const id = animal.id_public;
    const sireId = animal.fatherId_public || animal.sireId_public;
    const damId = animal.motherId_public || animal.damId_public;

    // Quick-lookup map
    const map = {};
    userAnimals.forEach(a => { if (a.id_public) map[a.id_public] = a; });

    const results = [];
    const addedIds = new Set([id]); // prevent duplicates & self-reference
    const add = (a, rel) => {
        if (!a || addedIds.has(a.id_public)) return;
        addedIds.add(a.id_public);
        results.push({ animal: a, rel });
    };
    const g = (male, female, neutral, gender) =>
        gender === 'Male' ? male : gender === 'Female' ? female : neutral;

    // Helper: return parent ids for any animal id
    const parentsOf = (pid) => {
        const p = map[pid];
        if (!p) return [];
        return [
            p.fatherId_public || p.sireId_public,
            p.motherId_public || p.damId_public
        ].filter(Boolean);
    };

    // Gen 1 • Parents
    if (sireId && map[sireId]) add(map[sireId], 'Sire (Father)');
    if (damId && map[damId]) add(map[damId], 'Dam (Mother)');

    // Gen 1 • Full siblings & half-siblings; track sibling ids for niece/nephew
    const siblingIds = new Set();
    userAnimals.forEach(a => {
        if (a.id_public === id) return;
        const aSire = a.fatherId_public || a.sireId_public;
        const aDam = a.motherId_public || a.damId_public;
        const shareSire = sireId && aSire && sireId === aSire;
        const shareDam = damId && aDam && damId === aDam;
        if (shareSire && shareDam) { add(a, g('Full Brother', 'Full Sister', 'Full Sibling', a.gender)); siblingIds.add(a.id_public); }
        else if (shareSire) { add(a, g('Half-Brother (via Sire)', 'Half-Sister (via Sire)', 'Half-Sibling (via Sire)', a.gender)); siblingIds.add(a.id_public); }
        else if (shareDam) { add(a, g('Half-Brother (via Dam)', 'Half-Sister (via Dam)', 'Half-Sibling (via Dam)', a.gender)); siblingIds.add(a.id_public); }
    });

    // Nieces & Nephews • offspring of siblings
    userAnimals.forEach(a => {
        if (a.id_public === id) return;
        const aSire = a.fatherId_public || a.sireId_public;
        const aDam = a.motherId_public || a.damId_public;
        if ((aSire && siblingIds.has(aSire)) || (aDam && siblingIds.has(aDam))) {
            add(a, g('Nephew', 'Niece', 'Niece / Nephew', a.gender));
        }
    });

    // Gen 2 • Grandparents; track grandparent ids for aunt/uncle detection
    const sireGrandparentIds = sireId ? new Set(parentsOf(sireId)) : new Set();
    const damGrandparentIds  = damId  ? new Set(parentsOf(damId))  : new Set();
    const allGrandparentIds  = new Set([...sireGrandparentIds, ...damGrandparentIds]);
    const genTwoIds = new Set();
    sireGrandparentIds.forEach(gpId => {
        if (map[gpId]) { add(map[gpId], g('Paternal Grandfather', 'Paternal Grandmother', 'Paternal Grandparent', map[gpId].gender)); genTwoIds.add(gpId); }
    });
    damGrandparentIds.forEach(gpId => {
        if (map[gpId]) { add(map[gpId], g('Maternal Grandfather', 'Maternal Grandmother', 'Maternal Grandparent', map[gpId].gender)); genTwoIds.add(gpId); }
    });

    // Aunts & Uncles • siblings of parents (share a grandparent with this animal's parent)
    userAnimals.forEach(a => {
        if (a.id_public === id) return;
        if (a.id_public === sireId || a.id_public === damId) return; // skip parents themselves
        const aSire = a.fatherId_public || a.sireId_public;
        const aDam = a.motherId_public || a.damId_public;
        const sharesPaternalGP = (aSire && sireGrandparentIds.has(aSire)) || (aDam && sireGrandparentIds.has(aDam));
        const sharesMaternalGP = (aSire && damGrandparentIds.has(aSire)) || (aDam && damGrandparentIds.has(aDam));
        if (sharesPaternalGP && sharesMaternalGP) add(a, g('Uncle', 'Aunt', 'Aunt / Uncle', a.gender));
        else if (sharesPaternalGP) add(a, g('Paternal Uncle', 'Paternal Aunt', 'Paternal Aunt / Uncle', a.gender));
        else if (sharesMaternalGP) add(a, g('Maternal Uncle', 'Maternal Aunt', 'Maternal Aunt / Uncle', a.gender));
    });

    // Gen 3 • Great-grandparents
    genTwoIds.forEach(gpId => {
        const label = sireGrandparentIds.has(gpId) ? 'Paternal' : 'Maternal';
        parentsOf(gpId).forEach(ggpId => {
            if (map[ggpId]) add(map[ggpId], g(`${label} Great-Grandfather`, `${label} Great-Grandmother`, `${label} Great-Grandparent`, map[ggpId].gender));
        });
    });

    return results;
};

// ==================== PRIVATE ANIMAL DETAIL (OWNER VIEW) ====================
// Shows ALL data for animal owners viewing their own animals (ignores privacy toggles)
// Accessed from: MY ANIMALS LIST
const PrivateAnimalDetail = ({ animal, onClose, onCloseAll, onEdit, onArchive, API_BASE_URL, authToken, setShowImageModal, setEnlargedImageUrl, onUpdateAnimal, showModalMessage, onTransfer, onViewAnimal, onViewPublicAnimal, onToggleOwned, userProfile, userAnimals = [], breedingLineDefs = [], animalBreedingLines = {}, toggleAnimalBreedingLine, initialTab = 1, initialBetaView = 'vertical' }) => {
    const [breederInfo, setBreederInfo] = useState(null);
    const [showPedigree, setShowPedigree] = useState(false);
    const [detailViewTab, setDetailViewTab] = useState(initialTab);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [enclosureInfo, setEnclosureInfo] = useState(null);
    const [animalLogs, setAnimalLogs] = useState(null); // null = not yet fetched
    const [animalLogsLoading, setAnimalLogsLoading] = useState(false);
    const [animalCOI, setAnimalCOI] = useState(null);
    const [loadingCOI, setLoadingCOI] = useState(false);
    const [collapsedHealthSections, setCollapsedHealthSections] = useState({});
    const [breedingRecordOffspring, setBreedingRecordOffspring] = useState({});
    const [expandedBreedingRecords, setExpandedBreedingRecords] = useState({});
    const [animalLitters, setAnimalLitters] = useState(null);
    const [pedigreeOffspring, setPedigreeOffspring] = useState(null);
    const [expandedPedigreeRecords, setExpandedPedigreeRecords] = useState({});
    const [ownedAnimals, setOwnedAnimals] = useState(userAnimals); // may be pre-seeded from parent or fetched lazily
    const ownedAnimalsLoadedRef = useRef(userAnimals.length > 0);
    const [globalRels, setGlobalRels] = useState(null); // null = not yet fetched
    const [globalRelsLoading, setGlobalRelsLoading] = useState(false);
    const [parentCardKey, setParentCardKey] = useState(0); // increment to force parent cards to refetch
    // Manual Pedigree (Beta) • Tab 16
    const [mpDownloading, setMpDownloading] = useState(false);
    const [mpLoading, setMpLoading] = useState(false);
    const mpTreeRef = useRef(null);
    const chartRef = useRef(null);
    const [mpEnrichedData, setMpEnrichedData] = useState(null);
    const [betaPedigreeView, setBetaPedigreeView] = useState(initialBetaView);
    useEffect(() => {
        if (detailViewTab !== 5) return;
        let cancelled = false;
        setMpLoading(true);
        (async () => {
            const manual = animal?.manualPedigree || {};
            const toSlot = (a) => {
                const variety = ['color','coatPattern','coat','earset','phenotype','morph','markings'].map(k => a[k]).filter(Boolean).join(' ');
                return { mode: 'ctc', ctcId: a.id_public || '', prefix: a.prefix || '', name: a.name || '', suffix: a.suffix || '', variety, genCode: a.geneticCode || '', birthDate: a.birthDate ? String(a.birthDate).slice(0,10) : '', deceasedDate: a.deceasedDate ? String(a.deceasedDate).slice(0,10) : '', breederName: a.breederName || a.manualBreederName || '', gender: a.gender || '', imageUrl: a.imageUrl || a.photoUrl || '', notes: '' };
            };
            const fetchOne = async (id) => {
                if (!id) return null;
                try { const r = await axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${authToken}` } }); return r.data || null; }
                catch { return null; }
            };
            // Level 1: parents
            const [sire, dam] = await Promise.all([
                fetchOne(animal?.sireId_public || animal?.fatherId_public),
                fetchOne(animal?.damId_public  || animal?.motherId_public),
            ]);
            if (cancelled) return;
            // Level 2: grandparents
            const [ss, sd, ds, dd] = await Promise.all([
                fetchOne(sire?.sireId_public || sire?.fatherId_public),
                fetchOne(sire?.damId_public  || sire?.motherId_public),
                fetchOne(dam?.sireId_public  || dam?.fatherId_public),
                fetchOne(dam?.damId_public   || dam?.motherId_public),
            ]);
            if (cancelled) return;
            // Level 3: great-grandparents
            const [sss, ssd, sds, sdd, dss, dsd, dds, ddd] = await Promise.all([
                fetchOne(ss?.sireId_public || ss?.fatherId_public),
                fetchOne(ss?.damId_public  || ss?.motherId_public),
                fetchOne(sd?.sireId_public || sd?.fatherId_public),
                fetchOne(sd?.damId_public  || sd?.motherId_public),
                fetchOne(ds?.sireId_public || ds?.fatherId_public),
                fetchOne(ds?.damId_public  || ds?.motherId_public),
                fetchOne(dd?.sireId_public || dd?.fatherId_public),
                fetchOne(dd?.damId_public  || dd?.motherId_public),
            ]);
            if (cancelled) return;
            // Build seeded slots from linked ancestry
            const seeded = {};
            if (sire) seeded.sire         = toSlot(sire);
            if (dam)  seeded.dam          = toSlot(dam);
            if (ss)   seeded.sireSire     = toSlot(ss);
            if (sd)   seeded.sireDam      = toSlot(sd);
            if (ds)   seeded.damSire      = toSlot(ds);
            if (dd)   seeded.damDam       = toSlot(dd);
            if (sss)  seeded.sireSireSire = toSlot(sss);
            if (ssd)  seeded.sireSireDam  = toSlot(ssd);
            if (sds)  seeded.sireDamSire  = toSlot(sds);
            if (sdd)  seeded.sireDamDam   = toSlot(sdd);
            if (dss)  seeded.damSireSire  = toSlot(dss);
            if (dsd)  seeded.damSireDam   = toSlot(dsd);
            if (dds)  seeded.damDamSire   = toSlot(dds);
            if (ddd)  seeded.damDamDam    = toSlot(ddd);
            // Overlay seeded (real CTC links) on top of manual entries • seed wins
            const merged = {};
            Object.entries(manual).forEach(([k, v]) => {
                if (v && (v.ctcId || v.name || v.prefix || v.suffix)) merged[k] = v;
            });
            Object.assign(merged, seeded);
            if (!cancelled) { setMpEnrichedData(merged); setMpLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [detailViewTab, animal?.id_public]);
    useEffect(() => { setMpEnrichedData(null); setMpLoading(false); }, [animal?.id_public]);
    useEffect(() => { setDetailViewTab(initialTab); setBetaPedigreeView(initialBetaView); }, [animal?.id_public, initialTab, initialBetaView]);

    // Fetch ALL animals on the account + global relationships on mount
    useEffect(() => {
        if (ownedAnimalsLoadedRef.current || !authToken || !animal?.id_public) return;
        ownedAnimalsLoadedRef.current = true;
        // Fetch all account animals and filter to only truly owned ones (My Animals + Archived)
        axios.get(`${API_BASE_URL}/animals`, {
            headers: { Authorization: `Bearer ${authToken}` }
        }).then(res => {
            const userAnimalIds = new Set(userAnimals.map(a => a.id_public));
            const ownedOrArchived = (res.data || []).filter(a => 
                userAnimalIds.has(a.id_public) || a.archived || a.status === 'Sold'
            );
            setOwnedAnimals(ownedOrArchived);
        }).catch(() => {});
        // Fetch cross-platform relationships from backend
        setGlobalRelsLoading(true);
        axios.get(`${API_BASE_URL}/animals/${animal.id_public}/relationships`, {
            headers: { Authorization: `Bearer ${authToken}` }
        }).then(res => setGlobalRels(res.data || null)).catch(() => setGlobalRels(null)).finally(() => setGlobalRelsLoading(false));
    }, [authToken, API_BASE_URL, animal?.id_public, userAnimals];

    // Relationship Insights • computed from all account animals (shown in Lineage tab)
    const relationships = useMemo(() => computeRelationships(animal, ownedAnimals), [animal, ownedAnimals]);
    const ownedIds = useMemo(() => new Set(ownedAnimals.map(a => a.id_public)), [ownedAnimals]);
    // Flatten global relationships from backend, exclude own-collection animals, add group label
    const externalRelGroups = useMemo(() => {
        if (!globalRels) return [];
        const groupDefs = [
            { key: 'parents',           label: 'Parents' },
            { key: 'siblings',          label: 'Siblings' },
            { key: 'nephewsNieces',     label: 'Nieces & Nephews' },
            { key: 'auntsUncles',       label: 'Aunts & Uncles' },
            { key: 'grandparents',      label: 'Grandparents' },
            { key: 'greatGrandparents', label: 'Great-Grandparents' },
            { key: 'cousins',           label: 'Cousins' },
        ];
        return groupDefs.map(({ key, label }) => ({
            label,
            animals: (globalRels[key] || []).filter(a => !ownedIds.has(a.id_public) && a.id_public !== animal.id_public),
        })).filter(g => g.animals.length > 0);
    }, [globalRels, ownedIds, animal?.id_public]);
    const getExternalRelLabel = (groupLabel, rel) => {
        const isMale = rel.gender === 'Male';
        const isFemale = rel.gender === 'Female';
        const side = rel._side === 'paternal' ? 'Paternal ' : rel._side === 'maternal' ? 'Maternal ' : '';
        switch (groupLabel) {
            case 'Parents':
                if (rel.id_public === animal?.sireId_public) return 'Sire (Father)';
                if (rel.id_public === animal?.damId_public) return 'Dam (Mother)';
                return isMale ? 'Sire (Father)' : isFemale ? 'Dam (Mother)' : 'Parent';
            case 'Siblings':
                return isMale ? 'Brother' : isFemale ? 'Sister' : 'Sibling';
            case 'Nieces & Nephews':
                return isMale ? 'Nephew' : isFemale ? 'Niece' : 'Niece / Nephew';
            case 'Aunts & Uncles':
                return isMale ? `${side}Uncle` : isFemale ? `${side}Aunt` : `${side}Aunt / Uncle`;
            case 'Grandparents':
                return isMale ? `${side}Grandfather` : isFemale ? `${side}Grandmother` : `${side}Grandparent`;
            case 'Great-Grandparents':
                return isMale ? `${side}Great-Grandfather` : isFemale ? `${side}Great-Grandmother` : `${side}Great-Grandparent`;
            case 'Cousins': return 'Cousin';
            default: return groupLabel;
        }
    };
    const [relInsightsOpen, setRelInsightsOpen] = useState(true);
    const [relOwnOpen, setRelOwnOpen] = useState(true);
    const [relExternalOpen, setRelExternalOpen] = useState(false);
    const [offspringOpen, setOffspringOpen] = useState(true);
    const pedigreeIssues = useMemo(() => {
        const issues = [];
        const map = {};
        ownedAnimals.forEach(a => { if (a.id_public) map[a.id_public] = a; });
        const sireId = animal.fatherId_public || animal.sireId_public;
        const damId  = animal.motherId_public  || animal.damId_public;
        const externalParents = globalRels?.parents || [];
        const sireFull = map[sireId] || (sireId ? externalParents.find(p => p.id_public === sireId) : null);
        const damFull  = map[damId]  || (damId  ? externalParents.find(p => p.id_public === damId)  : null);
        const animalBirth = animal.birthDate ? new Date(animal.birthDate) : null;
        // 1. Self-reference
        if (sireId && sireId === animal.id_public) issues.push({ severity: 'error', field: 'Sire', message: 'This animal is listed as its own sire — impossible self-reference.' });
        if (damId  && damId  === animal.id_public) issues.push({ severity: 'error', field: 'Dam',  message: 'This animal is listed as its own dam — impossible self-reference.' });
        // 2. Broken parent link (only after globalRels has finished loading to avoid false positives)
        if (sireId && !sireFull && ownedAnimals.length > 0 && !globalRelsLoading) issues.push({ severity: 'warning', field: 'Sire', message: 'Sire is linked but not found in your collection or known platform animals.' });
        if (damId  && !damFull  && ownedAnimals.length > 0 && !globalRelsLoading) issues.push({ severity: 'warning', field: 'Dam',  message: 'Dam is linked but not found in your collection or known platform animals.' });
        // 3. Parent born on or after offspring
        if (animalBirth) {
            if (sireFull?.birthDate && new Date(sireFull.birthDate) >= animalBirth)
                issues.push({ severity: 'error', field: 'Sire', message: `Sire "${[sireFull.prefix, sireFull.name].filter(Boolean).join(' ')}" was born on or after this animal — impossible parentage.` });
            if (damFull?.birthDate && new Date(damFull.birthDate) >= animalBirth)
                issues.push({ severity: 'error', field: 'Dam',  message: `Dam "${[damFull.prefix, damFull.name].filter(Boolean).join(' ')}" was born on or after this animal — impossible parentage.` });
        }
        // 4. Same-sex parents
        if (sireFull && damFull) {
            const sg = sireFull.gender; const dg = damFull.gender;
            if (sg && dg && sg !== 'Unknown' && dg !== 'Unknown' && sg === dg)
                issues.push({ severity: 'error', field: 'Parents', message: `Both linked parents are ${sg} — a sire/dam pair must be male and female.` });
        }
        // 5. Species mismatch
        if (sireFull?.species && animal.species && sireFull.species !== animal.species)
            issues.push({ severity: 'warning', field: 'Sire', message: `Sire is ${sireFull.species} but this animal is ${animal.species} — species mismatch.` });
        if (damFull?.species && animal.species && damFull.species !== animal.species)
            issues.push({ severity: 'warning', field: 'Dam',  message: `Dam is ${damFull.species} but this animal is ${animal.species} — species mismatch.` });
        // 6. Circular lineage
        const seen = new Set();
        const hasCycle = (pid) => {
            if (!pid || !map[pid]) return false;
            if (pid === animal.id_public) return true;
            if (seen.has(pid)) return false;
            seen.add(pid);
            const p = map[pid];
            return hasCycle(p.fatherId_public || p.sireId_public) || hasCycle(p.motherId_public || p.damId_public);
        };
        if (hasCycle(sireId) || hasCycle(damId))
            issues.push({ severity: 'error', field: 'Lineage', message: 'Circular lineage detected — this animal appears in its own ancestry chain.' });
        return issues;
    }, [animal, ownedAnimals, globalRels, globalRelsLoading]);
    const [pedigreeValidationOpen, setPedigreeValidationOpen] = useState(true);

    // Fetch all litters where this animal is sire or dam
    React.useEffect(() => {
        if (!animal?.id_public || !authToken) return;
        let cancelled = false;
        axios.get(`${API_BASE_URL}/litters`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => {
                if (cancelled) return;
                const linked = (res.data || []).filter(l =>
                    l.sireId_public === animal.id_public || l.damId_public === animal.id_public
                );
                setAnimalLitters(linked);
                linked.forEach(litter => {
                    const lid = litter.litter_id_public;
                    if (!lid) return;
                    if (!litter.offspringIds_public?.length) {
                        setBreedingRecordOffspring(prev => ({ ...prev, [lid]: [] }));
                        return;
                    }
                    axios.get(`${API_BASE_URL}/litters/${lid}/offspring`, { headers: { Authorization: `Bearer ${authToken}` } })
                        .then(r => { if (!cancelled) setBreedingRecordOffspring(prev => ({ ...prev, [lid]: r.data })); })
                        .catch(() => { if (!cancelled) setBreedingRecordOffspring(prev => ({ ...prev, [lid]: [] })); });
                });
            })
            .catch(() => { if (!cancelled) setAnimalLitters([]); });
        return () => { cancelled = true; };
    }, [animal?.id_public, authToken, API_BASE_URL]);

    // Fetch pedigree-based offspring groups (not in litter management)
    React.useEffect(() => {
        if (!animal?.id_public || !authToken) return;
        let cancelled = false;
        axios.get(`${API_BASE_URL}/animals/${animal.id_public}/offspring`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => {
                if (cancelled) return;
                // Only groups without a formal litter record (no CTL ID)
                const unmanaged = (res.data || []).filter(l => !l.litter_id_public);
                setPedigreeOffspring(unmanaged);
            })
            .catch(() => { if (!cancelled) setPedigreeOffspring([]); });
        return () => { cancelled = true; };
    }, [animal?.id_public, authToken, API_BASE_URL]);

    const { fieldTemplate, getLabel } = useDetailFieldTemplate(animal?.species, API_BASE_URL);

    // Fetch assigned enclosure info
    React.useEffect(() => {
        if (!animal?.enclosureId || !authToken) { setEnclosureInfo(null); return; }
        axios.get(`${API_BASE_URL}/enclosures`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => setEnclosureInfo(res.data.find(e => e._id === animal.enclosureId) || null))
            .catch(() => setEnclosureInfo(null));
    }, [animal?.enclosureId, authToken, API_BASE_URL]);

    // Fetch logs when Logs tab is opened (lazy, once per animal)
    React.useEffect(() => {
        if (detailViewTab !== 16 || animalLogs !== null || !animal?.id_public || !authToken) return;
        setAnimalLogsLoading(true);
        axios.get(`${API_BASE_URL}/animals/${animal.id_public}/logs`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => setAnimalLogs(res.data || []))
            .catch(() => setAnimalLogs([]))
            .finally(() => setAnimalLogsLoading(false));
    }, [detailViewTab, animal?.id_public, authToken, API_BASE_URL, animalLogs]);
    
    // Fetch COI when component mounts or animal changes (if animal has both parents)
    React.useEffect(() => {
        const fetchCOI = async () => {
            const sireId = animal?.fatherId_public || animal?.sireId_public;
            const damId = animal?.motherId_public || animal?.damId_public;
            
            if (animal?.id_public && sireId && damId) {
                setLoadingCOI(true);
                try {
                    const response = await axios.get(
                        `${API_BASE_URL}/animals/${animal.id_public}/inbreeding`,
                        { headers: { Authorization: `Bearer ${authToken}` } }
                    );
                    if (response.data && response.data.inbreedingCoefficient != null) {
                        setAnimalCOI(response.data.inbreedingCoefficient);
                    }
                } catch (error) {
                    console.error('Failed to fetch COI:', error);
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
                            <button onClick={onCloseAll || onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex justify-center gap-1.5 flex-wrap">
                            <button
                                onClick={() => setShowQR(true)}
                                className="px-2 py-1 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-1 text-xs"
                            >
                                <QrCode size={14} />
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
                            {onArchive && (
                                <button
                                    onClick={() => onArchive(animal)}
                                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition flex items-center gap-1 text-xs"
                                    title={animal.archived ? "Unarchive animal" : "Archive animal"}
                                >
                                    <Archive size={14} />
                                    {animal.archived ? 'Unarchive' : 'Archive'}
                                </button>
                            )}
                            {onTransfer && (() => {
                                const iWasTransferredThisAnimal = animal.originalOwnerId && animal.ownerId_public === userProfile?.id_public;
                                if (iWasTransferredThisAnimal) {
                                    return (
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Return ${animal.name} to ${animal.breederName || 'the breeder'}? This will remove the animal from your account.`)) {
                                                    try {
                                                        await axios.post(`${API_BASE_URL}/animals/${animal.id_public}/return`, {}, {
                                                            headers: { Authorization: `Bearer ${authToken}` }
                                                        });
                                                        onClose();
                                                        showModalMessage('Success', `Animal has been returned to ${animal.breederName || 'the breeder'}.`);
                                                    } catch (error) {
                                                        console.error('Failed to return animal:', error);
                                                        showModalMessage('Error', `Failed to return animal: ${error.response?.data?.message || error.message}`);
                                                    }
                                                }
                                            }}
                                            className="px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold rounded-lg transition flex items-center gap-1 text-xs"
                                            title="Return to breeder"
                                        >
                                            <RotateCcw size={14} />
                                            Return
                                        </button>
                                    );
                                }
                                return (
                                    <button
                                        onClick={() => onTransfer(animal)}
                                        className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition flex items-center gap-1 text-xs"
                                        title="Transfer"
                                    >
                                        <ArrowLeftRight size={14} />
                                        Transfer
                                    </button>
                                );
                            })()}
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
                            <button
                                onClick={() => setShowQR(true)}
                                className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-2"
                            >
                                <QrCode size={16} />
                                Share
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
                            {onArchive && (
                                <button
                                    onClick={() => onArchive(animal)}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition flex items-center gap-2"
                                    title={animal.archived ? "Restore from archive" : "Archive animal"}
                                >
                                    <Archive size={16} />
                                    {animal.archived ? 'Unarchive' : 'Archive'}
                                </button>
                            )}
                            {onTransfer && (() => {
                                const iWasTransferredThisAnimal = animal.originalOwnerId && animal.ownerId_public === userProfile?.id_public;
                                if (iWasTransferredThisAnimal) {
                                    return (
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Return ${animal.name} to ${animal.breederName || 'the breeder'}? This will remove the animal from your account.`)) {
                                                    try {
                                                        await axios.post(`${API_BASE_URL}/animals/${animal.id_public}/return`, {}, {
                                                            headers: { Authorization: `Bearer ${authToken}` }
                                                        });
                                                        onClose();
                                                        showModalMessage('Success', `Animal has been returned to ${animal.breederName || 'the breeder'}.`);
                                                    } catch (error) {
                                                        console.error('Failed to return animal:', error);
                                                        showModalMessage('Error', `Failed to return animal: ${error.response?.data?.message || error.message}`);
                                                    }
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold rounded-lg transition flex items-center gap-2"
                                            title="Return to breeder"
                                        >
                                            <RotateCcw size={16} />
                                            Return Animal
                                        </button>
                                    );
                                }
                                return (
                                    <button
                                        onClick={() => onTransfer(animal)}
                                        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition flex items-center gap-2"
                                        title="Transfer this animal"
                                    >
                                        <ArrowLeftRight size={16} />
                                        Transfer
                                    </button>
                                );
                            })()}
                            <button onClick={onCloseAll || onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={28} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs - ALL 11 TABS */}
                <div className="bg-white border-b border-gray-300 px-2 sm:px-6 pt-2 sm:pt-4">
                    <div className="flex flex-wrap gap-1 sm:gap-1 pb-2 sm:pb-4">
                        {[
                            { id: 1, label: 'Overview', icon: ClipboardList, color: 'text-blue-500' },
                            { id: 2, label: 'Status & Privacy', icon: Lock, color: 'text-slate-500' },
                            { id: 3, label: 'Identification', icon: Tag, color: 'text-amber-500' },
                            { id: 4, label: 'Appearance', icon: Palette, color: 'text-pink-500' },
                            { id: 5, label: 'Beta Pedigree', icon: Dna, color: 'text-orange-500' },
                            { id: 6, label: 'Family', icon: TreeDeciduous, color: 'text-green-600' },
                            { id: 7, label: 'Fertility', icon: Egg, color: 'text-yellow-500' },
                            { id: 8, label: 'Health', icon: Hospital, color: 'text-red-500' },
                            { id: 9, label: 'Care', icon: Home, color: 'text-teal-500' },
                            { id: 10, label: 'Behavior', icon: Brain, color: 'text-purple-500' },
                            { id: 11, label: 'Notes', icon: FileText, color: 'text-indigo-500' },
                            { id: 12, label: 'Show', icon: Trophy, color: 'text-yellow-600' },
                            { id: 13, label: 'Legal', icon: FileCheck, color: 'text-blue-600' },
                            { id: 14, label: 'End of Life', icon: Scale, color: 'text-gray-500' },
                            { id: 15, label: 'Gallery', icon: Images, color: 'text-rose-500' },
                            { id: 16, label: 'Logs', icon: ScrollText, color: 'text-gray-600' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setDetailViewTab(tab.id)}
                                className={`flex-shrink-0 px-2.5 sm:px-3 py-2 sm:py-2 text-xs sm:text-sm font-medium rounded border transition-colors ${
                                    detailViewTab === tab.id 
                                        ? 'bg-primary text-black border-gray-400' 
                                        : 'bg-gray-50 text-gray-600 hover:text-gray-800 border-gray-300'
                                }`}
                                title={tab.label}
                            >
                                {React.createElement(tab.icon, { size: 14, className: `inline-block align-middle flex-shrink-0 mr-1.5 ${tab.color || ''}` })}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white border border-t-0 border-gray-300 rounded-b-lg p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-160px)] sm:max-h-[calc(90vh-180px)]">
                    {/* Tab 1: Overview */}
                    {detailViewTab === 1 && (
                        <div className="space-y-3">
                            {/* Main info card */}
                            <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    {/* Left: Photo + status + badges */}
                                    <div className="w-full md:w-1/4 p-4 flex flex-col items-center gap-2 border-b md:border-b-0 md:border-r border-gray-300">
                                        <div className="relative w-full flex justify-center">
                                            <div className="absolute top-0 right-0">
                                                {animal.gender === 'Male' ? <Mars size={16} strokeWidth={2.5} className="text-blue-600" /> : animal.gender === 'Female' ? <Venus size={16} strokeWidth={2.5} className="text-pink-600" /> : animal.gender === 'Intersex' ? <VenusAndMars size={16} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={16} strokeWidth={2.5} className="text-gray-500" />}
                                            </div>
                                            {(animal.imageUrl || animal.photoUrl) ? (
                                                <img
                                                    src={animal.imageUrl || animal.photoUrl}
                                                    alt={animal.name}
                                                    className="w-28 h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                                                    onClick={() => {
                                                        if (setEnlargedImageUrl && setShowImageModal) {
                                                            setEnlargedImageUrl(animal.imageUrl || animal.photoUrl);
                                                            setShowImageModal(true);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                    <Cat size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm font-medium text-gray-700">{animal.status || 'Unknown'}</div>
                                        {animal.isForSale && (
                                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Tag size={11} /> For Sale{animal.salePriceCurrency !== 'Negotiable' && animal.salePriceAmount ? ` · ${getCurrencySymbol(animal.salePriceCurrency)}${animal.salePriceAmount}` : ''}
                                            </span>
                                        )}
                                        {animal.availableForBreeding && (
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Tag size={11} /> Stud{animal.studFeeCurrency !== 'Negotiable' && animal.studFeeAmount ? ` · ${getCurrencySymbol(animal.studFeeCurrency)}${animal.studFeeAmount}` : ''}
                                            </span>
                                        )}
                                        {animal.tags && animal.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {animal.tags.map((tag, idx) => (
                                                    <span key={idx} className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Right: All info */}
                                    <div className="flex-1 p-4 space-y-2">
                                        {/* Top row: species/CTC + toggles */}
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <p className="text-sm text-gray-500">
                                                {animal.species || 'Unknown'}
                                                {animal.breed && ` \u2022 ${animal.breed}`}
                                                {animal.strain && ` \u2022 ${animal.strain}`}
                                                {animal.id_public && ` \u2022 ${animal.id_public}`}
                                            </p>
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => { onToggleOwned && onToggleOwned(animal.id_public, !animal.isOwned); }}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-xs transition ${animal.isOwned ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                                    title="Toggle owned status"
                                                    data-tutorial-target="detail-owned-toggle"
                                                >
                                                    {animal.isOwned ? <Heart size={13} /> : <HeartOff size={13} />}
                                                    <span>{animal.isOwned ? 'Owned' : 'Not Owned'}</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newIsDisplay = !animal.isDisplay;
                                                        axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { isDisplay: newIsDisplay }, {
                                                            headers: { Authorization: `Bearer ${authToken}` }
                                                        }).then(() => {
                                                            if (onUpdateAnimal) onUpdateAnimal({ ...animal, isDisplay: newIsDisplay });
                                                        }).catch(err => console.error('Failed to update isDisplay:', err));
                                                    }}
                                                    data-tutorial-target="detail-private-toggle"
                                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-xs transition ${animal.isDisplay ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                                    title="Toggle public profile visibility"
                                                >
                                                    {animal.isDisplay ? <Eye size={13} /> : <EyeOff size={13} />}
                                                    <span>{animal.isDisplay ? 'Public' : 'Private'}</span>
                                                </button>
                                            </div>
                                        </div>
                                        {/* Name */}
                                        <h2 className="text-xl font-bold text-gray-800 leading-tight">
                                            {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                                        </h2>
                                        {/* DOB + age */}
                                        {animal.birthDate && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Born:</span> {formatDate(animal.birthDate)} {(() => {
                                                    const birth = new Date(animal.birthDate);
                                                    const endDate = animal.deceasedDate ? new Date(animal.deceasedDate) : new Date();
                                                    let years = endDate.getFullYear() - birth.getFullYear();
                                                    let months = endDate.getMonth() - birth.getMonth();
                                                    let days = endDate.getDate() - birth.getDate();
                                                    if (days < 0) { months--; days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate(); }
                                                    if (months < 0) { years--; months += 12; }
                                                    const ageStr = years > 0 ? `${years}y ${months}m ${days}d` : (months > 0 ? `${months}m ${days}d` : `${days}d`);
                                                    if (animal.deceasedDate) {
                                                        return <span className="text-red-600 font-semibold ml-2">{"†"} {formatDate(animal.deceasedDate)} (Lived {ageStr})</span>;
                                                    } else {
                                                        return <span>(~{ageStr})</span>;
                                                    }
                                                })()}
                                            </p>
                                        )}
                                        {/* Variety */}
                                        {[animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).length > 0 && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Variety:</span> {[animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).join(' ')}
                                            </p>
                                        )}
                                        {animal.carrierTraits && (
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Carrier:</span> {animal.carrierTraits}</p>
                                        )}
                                        {animal.geneticCode && (
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Genetic Code:</span> <code className="bg-gray-100 px-1 rounded font-mono">{animal.geneticCode}</code></p>
                                        )}
                                        {animal.remarks && (
                                            <p className="text-sm text-gray-700 line-clamp-2"><span className="font-semibold">Remarks:</span> {animal.remarks}</p>
                                        )}
                                        {/* Breeder + IDs */}
                                        <div className="border-t border-gray-200 pt-2 space-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">Breeder:</span>{' '}
                                                {breederInfo ? (() => {
                                                    const showPersonal = breederInfo.showPersonalName ?? false;
                                                    const showBreeder = breederInfo.showBreederName ?? false;
                                                    let bDisplayName;
                                                    if (showPersonal && showBreeder && breederInfo.personalName && breederInfo.breederName) {
                                                        bDisplayName = `${breederInfo.personalName} (${breederInfo.breederName})`;
                                                    } else if (showBreeder && breederInfo.breederName) {
                                                        bDisplayName = breederInfo.breederName;
                                                    } else if (showPersonal && breederInfo.personalName) {
                                                        bDisplayName = breederInfo.personalName;
                                                    } else {
                                                        bDisplayName = 'Unknown Breeder';
                                                    }
                                                    return <RouterLink to={`/user/${breederInfo.id_public}`} className="text-blue-600 hover:underline font-semibold">{bDisplayName}</RouterLink>;
                                                })() : <span className="font-mono text-accent">{animal.manualBreederName || animal.breederId_public || '\u2014'}</span>}
                                            </div>
                                            {(animal.breederAssignedId || animal.microchipNumber || animal.pedigreeRegistrationId) && (
                                                <hr className="border-gray-200" />
                                            )}
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                {animal.breederAssignedId && <div><span className="text-gray-500">Assigned ID:</span> <strong>{animal.breederAssignedId}</strong></div>}
                                                {animal.microchipNumber && <div><span className="text-gray-500">Microchip:</span> <strong>{animal.microchipNumber}</strong></div>}
                                                {animal.pedigreeRegistrationId && <div><span className="text-gray-500">Pedigree Reg:</span> <strong>{animal.pedigreeRegistrationId}</strong></div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Parents */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Parents</h3>
                                    {animalCOI != null && <span className="text-sm text-gray-700"><span className="font-medium">COI:</span> {animalCOI.toFixed(2)}%</span>}
                                    {loadingCOI && <span className="text-xs text-gray-400">Calculating COI...</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <ViewOnlyParentCard
                                        parentId={animal.fatherId_public || animal.sireId_public}
                                        parentType="Sire"
                                        API_BASE_URL={API_BASE_URL}
                                        onViewAnimal={onViewAnimal}
                                        authToken={authToken}
                                    />
                                    <ViewOnlyParentCard
                                        parentId={animal.motherId_public || animal.damId_public}
                                        parentType="Dam"
                                        API_BASE_URL={API_BASE_URL}
                                        onViewAnimal={onViewAnimal}
                                        authToken={authToken}
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
                                <h3 className="text-lg font-semibold text-gray-700"><Users size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Ownership</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Currently Owned:</span>
                                        <strong>{animal.isOwned ? 'Yes' : 'No'}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Breeder:</span>
                                        {breederInfo
                                            ? <RouterLink to={`/user/${breederInfo.id_public}`} className="text-blue-600 hover:underline font-semibold">{breederInfo.breederName || breederInfo.personalName || 'Unknown'}</RouterLink>
                                            : <strong>{animal.manualBreederName || animal.breederId_public || ''}</strong>}
                                    </div>
                                </div>
                            </div>

                            {/* 2nd Section: Current Owner */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Keeper</h3>
                                <div className="text-sm space-y-2">
                                    {(animal.keeperName || animal.isOwned) && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Keeper Name:</span>
                                        <strong>{animal.keeperName || (animal.isOwned ? 'Me' : '')}</strong>
                                    </div>
                                    )}
                                    {animal.coOwnership && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">Co-Ownership:</span>
                                            <strong>{animal.coOwnership}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3rd Section: Keeper History */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Keeper History</h3>
                                {(animal.keeperHistory || []).length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No entries yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {(animal.keeperHistory || []).map((entry, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800">{entry.name || 'Unknown'}</p>
                                                    {entry.userId_public && <p className="text-xs text-gray-400 font-mono">{entry.userId_public}</p>}
                                                </div>
                                                {entry.country && (
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <span className={`${getCountryFlag(entry.country)} inline-block h-4 w-6`}></span>
                                                        <span className="text-xs text-gray-500">{getCountryName(entry.country)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 4th Section: Availability for Sale or Stud */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Tag size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Availability for Sale or Stud</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">For Sale:</span>
                                        <strong>{animal.isForSale ? `Yes - ${getCurrencySymbol(animal.salePriceCurrency)} ${animal.salePriceAmount || 'Negotiable'}`.trim() : 'No'}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">For Stud:</span>
                                        <strong>{animal.availableForBreeding ? `Yes - ${getCurrencySymbol(animal.studFeeCurrency)} ${animal.studFeeAmount || 'Negotiable'}`.trim() : 'No'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Appearance */}
                    {detailViewTab === 4 && (
                        <div className="space-y-6">
                            {/* Appearance - Always show */}
                            {(() => {
                                const fields = [
                                    { key: 'color', label: 'Color' },
                                    { key: 'coatPattern', label: 'Pattern' },
                                    { key: 'coat', label: 'Coat Type' },
                                    { key: 'earset', label: 'Earset' },
                                    { key: 'phenotype', label: 'Phenotype' },
                                    { key: 'morph', label: 'Morph' },
                                    { key: 'markings', label: 'Markings' },
                                    { key: 'eyeColor', label: 'Eye Color' },
                                    { key: 'nailColor', label: 'Nail/Claw Color' },
                                    { key: 'size', label: 'Size' },
                                    { key: 'carrierTraits', label: 'Carrier Traits' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Sparkles size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Appearance</h3>
                                        {fields.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                {fields.map(f => (
                                                    <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500">No appearance data recorded yet.</div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Genetic Code - Always show */}
                            {fieldTemplate?.fields?.geneticCode?.enabled !== false && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Dna size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> {getLabel('geneticCode', 'Genetic Code')}</h3>
                                    <p className="text-gray-700 font-mono text-sm break-all">{animal.geneticCode || 'Not specified'}</p>
                                </div>
                            )}

                            {/* Life Stage - Always show */}
                            {fieldTemplate?.fields?.lifeStage?.enabled !== false && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Sprout size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> {getLabel('lifeStage', 'Life Stage')}</h3>
                                    <p className="text-gray-700 text-sm">{animal.lifeStage || 'Not specified'}</p>
                                </div>
                            )}

                            {/* Current Measurements & Growth Tracking - Always show */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Ruler size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Measurements & Growth Tracking</h3>
                                {(() => {
                                    let growthRecords = animal.growthRecords;
                                    if (typeof growthRecords === 'string') {
                                        try { growthRecords = JSON.parse(growthRecords); } catch (e) { growthRecords = []; }
                                    }
                                    if (!Array.isArray(growthRecords)) growthRecords = [];
                                    
                                    if (growthRecords.length > 0) {
                                        const sorted = [...growthRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
                                        const latest = sorted[0];
                                        return (
                                            <div className="text-sm space-y-1">
                                                <p><span className="text-gray-600">Latest Weight:</span> <strong>{latest.weight} {animal.measurementUnits?.weight || 'g'}</strong></p>
                                                {latest.length && <p><span className="text-gray-600">Latest Length:</span> <strong>{latest.length} {animal.measurementUnits?.length || 'cm'}</strong></p>}
                                                {latest.height && <p><span className="text-gray-600">Latest Height:</span> <strong>{latest.height} {animal.measurementUnits?.length || 'cm'}</strong></p>}
                                                <p className="text-gray-600 text-xs mt-2">Total measurements: {growthRecords.length} entries</p>
                                            </div>
                                        );
                                    }
                                    
                                    const mFields = [
                                        { key: 'bodyWeight', label: 'Weight' },
                                        { key: 'bodyLength', label: 'Body Length' },
                                        { key: 'heightAtWithers', label: 'Height at Withers' },
                                        { key: 'chestGirth', label: 'Chest Girth' },
                                        { key: 'adultWeight', label: 'Adult Weight' },
                                        { key: 'bodyConditionScore', label: 'Body Condition Score' },
                                        { key: 'length', label: 'Length' },
                                    ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                    
                                    return mFields.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {mFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">No measurements recorded yet.</div>
                                    );
                                })()}
                            </div>

                            {/* Growth Curve Charts */}
                            {(() => {
                                let growthRecords = animal.growthRecords;
                                if (typeof growthRecords === 'string') {
                                    try { growthRecords = JSON.parse(growthRecords); } catch (e) { growthRecords = []; }
                                }
                                if (!Array.isArray(growthRecords)) growthRecords = [];
                                
                                if (growthRecords.length < 1) return null;
                                
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
                                    y: margin.top + graphHeight - ((parseFloat(record.height) - heightChartMin) / heightRange) * graphHeight,
                                    weight: record.weight,
                                    length: record.length,
                                    height: record.height,
                                    bcs: record.bcs,
                                    notes: record.notes,
                                    date: record.date
                                })) : [];
                                
                                const weightPathData = weightPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                const lengthPathData = lengthPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                const heightPathData = heightPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                
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
                                                {label} ({label === 'Weight' ? (animal.measurementUnits?.weight || 'g') : (animal.measurementUnits?.length || 'cm')})
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
                                                        <title>{`Date: ${formatDate(p.date)}\nWeight: ${p.weight} ${animal.measurementUnits?.weight || 'g'}${p.length ? `\nLength: ${p.length} ${animal.measurementUnits?.length || 'cm'}` : ''}${p.bcs ? `\nBCS: ${p.bcs}` : ''}${p.notes ? `\nNotes: ${p.notes}` : ''}`}</title>
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
                                        
                                        {/* Height Chart */}
                                        {hasHeightData && (
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                    <span className="inline-block w-3 h-1 bg-purple-500 rounded"></span>
                                                    Height Growth Curve
                                                </h4>
                                                {renderChart(heightPoints, 'Height', '#9333ea', heightPathData, heightChartMin, heightChartMax)}
                                                <p className="text-xs text-gray-500 mt-2">Hover over points to see detailed measurements and notes.</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tab 3: Identification */}
                    {detailViewTab === 3 && (
                        <div className="space-y-6">
                            {/* Identification Numbers */}
                            {(() => {
                                const idFields = [
                                    { key: 'breederAssignedId', label: 'Identification' },
                                    { key: 'microchipNumber', label: 'Microchip Number' },
                                    { key: 'pedigreeRegistrationId', label: 'Pedigree Registration ID' },
                                    { key: 'colonyId', label: 'Colony ID' },
                                    { key: 'rabiesTagNumber', label: 'Rabies Tag Number' },
                                    { key: 'tattooId', label: 'Tattoo ID' },
                                    { key: 'akcRegistrationNumber', label: 'AKC Registration #' },
                                    { key: 'fciRegistrationNumber', label: 'FCI Registration #' },
                                    { key: 'cfaRegistrationNumber', label: 'CFA Registration #' },
                                    { key: 'workingRegistryIds', label: 'Working Registry IDs' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Hash size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Identification Numbers</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div><span className="text-gray-600">CritterTrack ID:</span> <strong>{animal.id_public || ''}</strong></div>
                                            {idFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Classification */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><FolderOpen size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Classification</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Species:</span> <strong>{animal.species || ''}</strong></div>
                                    {fieldTemplate?.fields?.breed?.enabled !== false && animal.breed && (
                                        <div><span className="text-gray-600">{getLabel('breed', 'Breed')}:</span> <strong>{animal.breed}</strong></div>
                                    )}
                                    {fieldTemplate?.fields?.strain?.enabled !== false && animal.strain && (
                                        <div><span className="text-gray-600">{getLabel('strain', 'Strain')}:</span> <strong>{animal.strain}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* Origin */}
                            {animal.origin && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Globe size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Origin</h3>
                                <p className="text-sm text-gray-700">{animal.origin}</p>
                            </div>
                            )}
                            {/* Tags */}
                            {animal.tags && animal.tags.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Tag size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {animal.tags.map((tag, idx) => (
                                            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Breeding Lines */}
                            {(() => {
                                const namedLines = breedingLineDefs.filter(l => l.name);
                                if (namedLines.length === 0 || !toggleAnimalBreedingLine) return null;
                                const assignedIds = animalBreedingLines[animal.id_public] || [];
                                return (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-1.5"><TableOfContents size={16} className="flex-shrink-0 text-gray-400" /> Breeding Lines</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {namedLines.map(l => {
                                                const assigned = assignedIds.includes(l.id);
                                                return (
                                                    <button key={l.id} type="button"
                                                        onClick={() => toggleAnimalBreedingLine(animal.id_public, l.id)}
                                                        style={{ borderColor: l.color, color: assigned ? '#fff' : l.color, backgroundColor: assigned ? l.color : 'transparent' }}
                                                        className="flex items-center gap-1.5 px-3 py-1 rounded-full border-2 text-sm font-medium transition"
                                                    ><span>&#x25C6;</span> {l.name}</button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tab 6: Family */}
                    {detailViewTab === 6 && (
                        <div className="space-y-6">
                            {/* Pedigree & Litter links */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="text-xs text-orange-500 font-medium">📊 Pedigree chart available on the <button onClick={() => setDetailViewTab(5)} className="underline hover:text-orange-600 transition">Beta Pedigree</button> tab</span>
                                <RouterLink to="/litters" className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 underline"><BookOpen size={12} className="inline-block align-middle" /> Litter Management</RouterLink>
                            </div>

                            {/* Relationship Insights */}
                            {(relationships.length > 0 || externalRelGroups.length > 0 || globalRelsLoading) && (
                                <div className="bg-blue-50 rounded-lg border border-blue-200">
                                    <button
                                        type="button"
                                        onClick={() => setRelInsightsOpen(o => !o)}
                                        className="w-full flex items-center justify-between p-4 text-left"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                                            <Network size={20} className="text-blue-600 mr-2" />
                                            Relationship Insights
                                            {relationships.length > 0 && (
                                                <span className="ml-2 text-xs font-normal text-gray-500 bg-white border border-blue-200 rounded-full px-2 py-0.5">
                                                    {relationships.length} in your collection
                                                </span>
                                            )}
                                            {externalRelGroups.length > 0 && (
                                                <span className="ml-1 text-xs font-normal text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                                                    +{externalRelGroups.reduce((s, g) => s + g.animals.length, 0)} from other breeders
                                                </span>
                                            )}
                                        </h3>
                                        {relInsightsOpen
                                            ? <ChevronUp size={18} className="text-blue-400 flex-shrink-0" />
                                            : <ChevronDown size={18} className="text-blue-400 flex-shrink-0" />}
                                    </button>
                                    {relInsightsOpen && (
                                        <div className="px-4 pb-4 space-y-5">
                                            {/* Own collection */}
                                            {relationships.length > 0 && (
                                                <div className="space-y-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setRelOwnOpen(o => !o)}
                                                        className="w-full flex items-center gap-2 text-left"
                                                    >
                                                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Your Collection</span>
                                                        <div className="flex-1 h-px bg-blue-200" />
                                                        {relOwnOpen ? <ChevronUp size={13} className="text-blue-400 flex-shrink-0" /> : <ChevronDown size={13} className="text-blue-400 flex-shrink-0" />}
                                                    </button>
                                                    {relOwnOpen && (<>
                                                    {[
                                                        ['Parents',            ['Sire (Father)', 'Dam (Mother)']],  
                                                        ['Siblings',           ['Full Sibling', 'Full Brother', 'Full Sister', 'Half-Sibling (via Sire)', 'Half-Brother (via Sire)', 'Half-Sister (via Sire)', 'Half-Sibling (via Dam)', 'Half-Brother (via Dam)', 'Half-Sister (via Dam)']],
                                                        ['Nieces & Nephews',   ['Niece / Nephew', 'Niece', 'Nephew']],
                                                        ['Aunts & Uncles',     ['Aunt / Uncle', 'Aunt', 'Uncle', 'Paternal Aunt / Uncle', 'Paternal Aunt', 'Paternal Uncle', 'Maternal Aunt / Uncle', 'Maternal Aunt', 'Maternal Uncle']],
                                                        ['Grandparents',       ['Paternal Grandparent', 'Paternal Grandfather', 'Paternal Grandmother', 'Maternal Grandparent', 'Maternal Grandfather', 'Maternal Grandmother']],
                                                        ['Great-Grandparents', ['Paternal Great-Grandparent', 'Paternal Great-Grandfather', 'Paternal Great-Grandmother', 'Maternal Great-Grandparent', 'Maternal Great-Grandfather', 'Maternal Great-Grandmother']],
                                                    ].map(([groupLabel, relTypes]) => {
                                                        const group = relationships.filter(r => relTypes.includes(r.rel));
                                                        if (!group.length) return null;
                                                        return (
                                                            <div key={groupLabel}>
                                                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{groupLabel}</h4>
                                                                <div className="space-y-2">
                                                                    {group.map(({ animal: rel, rel: relLabel }) => (
                                                                        <div
                                                                            key={rel.id_public}
                                                                            className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
                                                                            onClick={() => onViewAnimal && onViewAnimal(rel)}
                                                                        >
                                                                            <div className="flex items-center gap-2 min-w-0">
                                                                                {(rel.imageUrl || rel.photoUrl) ? (
                                                                                    <img src={rel.imageUrl || rel.photoUrl} alt={rel.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                                                                                ) : (
                                                                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-sm text-blue-600 font-semibold">
                                                                                        {rel.species?.charAt(0).toUpperCase()}
                                                                                    </div>
                                                                                )}
                                                                                <div className="min-w-0">
                                                                                    <div className="text-sm font-medium text-gray-800 truncate">{rel.prefix ? `${rel.prefix} ` : ''}{rel.name}</div>
                                                                                    <div className="text-xs text-gray-500">{rel.gender}{[rel.color, rel.coatPattern, rel.coat].filter(Boolean).join(' ') ? ` · ${[rel.color, rel.coatPattern, rel.coat].filter(Boolean).join(' ')}` : ''}{rel.birthDate ? ` · ${formatDate(rel.birthDate)}` : ''}</div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                                                <span className="text-xs text-blue-700 bg-blue-100 rounded-full px-2 py-0.5 font-medium whitespace-nowrap">{relLabel}</span>
                                                                                <ChevronRight size={14} className="text-gray-400" />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    </>)}
                                                </div>
                                            )}

                                            {/* Other breeders */}
                                            {globalRelsLoading && (
                                                <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
                                                    <Loader2 size={13} className="animate-spin" />
                                                    Searching across platform?
                                                </div>
                                            )}
                                            {!globalRelsLoading && externalRelGroups.length > 0 && (
                                                <div className="space-y-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setRelExternalOpen(o => !o)}
                                                        className="w-full flex items-center gap-2 text-left"
                                                    >
                                                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">From Other Breeders</span>
                                                        <div className="flex-1 h-px bg-amber-200" />
                                                        {relExternalOpen ? <ChevronUp size={13} className="text-amber-400 flex-shrink-0" /> : <ChevronDown size={13} className="text-amber-400 flex-shrink-0" />}
                                                    </button>
                                                    {relExternalOpen && (<>
                                                    {externalRelGroups.map(({ label: groupLabel, animals: groupAnimals }) => (
                                                        <div key={groupLabel}>
                                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{groupLabel}</h4>
                                                            <div className="space-y-2">
                                                                {groupAnimals.map(rel => (
                                                                    <div
                                                                        key={rel.id_public}
                                                                        className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-100 hover:border-amber-300 transition-colors cursor-pointer"
                                                                        onClick={() => onViewAnimal && onViewAnimal(rel)}
                                                                    >
                                                                        <div className="flex items-center gap-2 min-w-0">
                                                                            {(rel.imageUrl || rel.photoUrl) ? (
                                                                                <img src={rel.imageUrl || rel.photoUrl} alt={rel.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                                                                            ) : (
                                                                                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-sm text-amber-700 font-semibold">
                                                                                    {rel.species?.charAt(0).toUpperCase()}
                                                                                </div>
                                                                            )}
                                                                            <div className="min-w-0">
                                                                                <div className="text-sm font-medium text-gray-800 truncate">{rel.prefix ? `${rel.prefix} ` : ''}{rel.name}{rel.suffix ? ` ${rel.suffix}` : ''}</div>
                                                                                <div className="text-xs text-gray-500">{rel.gender}{[rel.color, rel.coatPattern, rel.coat].filter(Boolean).join(' ') ? ` · ${[rel.color, rel.coatPattern, rel.coat].filter(Boolean).join(' ')}` : ''}{rel.birthDate ? ` · ${formatDate(rel.birthDate)}` : ''}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                                            <span className="text-xs text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 font-medium whitespace-nowrap">{getExternalRelLabel(groupLabel, rel)}</span>
                                                                            <Globe size={13} className="text-amber-400" />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    </>)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 2nd Section: Offspring & Litters - merged litters + pedigree offspring */}
                            {(animalLitters === null || pedigreeOffspring === null) ? (
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <div className="text-sm text-gray-500 animate-pulse">Loading offspring & litters</div>
                                </div>
                            ) : (() => {
                                const litterItems = (animalLitters || []).map(l => ({ ...l, _recordType: 'litter' }));
                                const pedItems = (pedigreeOffspring || []).map(l => ({ ...l, _recordType: 'pedigree' }));
                                const _offspringToday = new Date();
                                const allRecords = [...litterItems, ...pedItems].sort((a, b) => {
                                    const aIsMated = a.isPlanned && a.matingDate && new Date(a.matingDate) <= _offspringToday;
                                    const bIsMated = b.isPlanned && b.matingDate && new Date(b.matingDate) <= _offspringToday;
                                    const aRank = aIsMated ? 0 : a.isPlanned ? 1 : 2;
                                    const bRank = bIsMated ? 0 : b.isPlanned ? 1 : 2;
                                    if (aRank !== bRank) return aRank - bRank;
                                    const aDate = a.birthDate || a.matingDate;
                                    const bDate = b.birthDate || b.matingDate;
                                    if (!aDate) return 1;
                                    if (!bDate) return -1;
                                    return new Date(bDate) - new Date(aDate);
                                });
                                if (allRecords.length === 0) return null;
                                return (
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-3">
                                        <button type="button" onClick={() => setOffspringOpen(o => !o)} className="w-full flex items-center justify-between text-left">
                                            <h3 className="text-lg font-semibold text-gray-700 flex items-center"><Users size={20} className="text-purple-600 mr-2" />Offspring & Litters</h3>
                                            {offspringOpen ? <ChevronUp size={18} className="text-purple-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-purple-400 flex-shrink-0" />}
                                        </button>
                                        {offspringOpen && <div className="space-y-2">
                                            {allRecords.map((litter) => {
                                                if (litter._recordType === 'litter') {
                                                    const lid = litter.litter_id_public;
                                                    const isSire = litter.sireId_public === animal.id_public;
                                                    const mate = isSire ? litter.dam : litter.sire;
                                                    const isExpanded = expandedBreedingRecords[lid];
                                                    const displayName = litter.breedingPairCodeName;
                                                    const lIsMated = litter.isPlanned && litter.matingDate && new Date(litter.matingDate) <= _offspringToday;
                                                    const lIsPlannedOnly = litter.isPlanned && !lIsMated;
                                                    return (
                                                        <div key={lid} className={`bg-white rounded border transition-all ${isExpanded ? 'border-purple-300 shadow-md' : 'border-purple-100'}`}>
                                                            <div
                                                                onClick={() => setExpandedBreedingRecords({...expandedBreedingRecords, [lid]: !isExpanded})}
                                                                className="p-2 sm:p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition rounded"
                                                            >
                                                                {/* Mobile: stacked */}
                                                                <div className="flex-1 sm:hidden">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <p className="font-bold text-gray-800 text-sm">{displayName || <span className="text-gray-400 font-normal">Unnamed Litter</span>}</p>
                                                                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                                            {lid && <span className="text-xs font-mono bg-purple-100 px-1.5 py-0.5 rounded text-purple-700">{lid}</span>}
                                                                            {lIsPlannedOnly && <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5"><Hourglass size={12} className="inline-block align-middle mr-0.5" /> Planned</span>}
                                                                            {lIsMated && <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5"><Heart size={12} className="inline-block align-middle mr-0.5" /> Mated</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 flex gap-2 flex-wrap items-center">
                                                                        {!litter.isPlanned && litter.birthDate && <span>{formatDate(litter.birthDate)}{litterAge(litter.birthDate) && <span className="ml-1 font-semibold text-green-600">• {litterAge(litter.birthDate)}</span>}</span>}
                                                                        {lIsMated && <span className="text-purple-600">{formatDate(litter.matingDate)}</span>}
                                                                        {lIsPlannedOnly && litter.matingDate && <span className="text-indigo-600">{formatDate(litter.matingDate)}</span>}
                                                                        {mate?.name && <span className="truncate max-w-[120px]">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</span>}
                                                                        {litter.inbreedingCoefficient != null && <span className="text-gray-500">{litter.inbreedingCoefficient.toFixed(2)}%</span>}
                                                                        {!litter.isPlanned && (litter.litterSizeBorn != null || litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && (
                                                                            <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                                                                {litter.litterSizeBorn != null && <span className="font-bold text-gray-900">{litter.litterSizeBorn}</span>}
                                                                                {litter.litterSizeBorn != null && (litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && <span className="text-gray-400">•</span>}
                                                                                {(litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && (
                                                                                    <span className="inline-flex gap-0.5 font-semibold">
                                                                                        <span className="text-blue-500">{litter.maleCount ?? 0}M</span>
                                                                                        <span className="text-gray-400">/</span>
                                                                                        <span className="text-pink-500">{litter.femaleCount ?? 0}F</span>
                                                                                        <span className="text-gray-400">/</span>
                                                                                        <span className="text-purple-500">{litter.unknownCount ?? 0}U</span>
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {/* Desktop: 6-column grid */}
                                                                <div className="hidden sm:grid flex-1 grid-cols-6 gap-3 items-center min-w-0">
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold text-gray-800 text-sm truncate">{displayName || <span className="text-gray-400 font-normal text-xs">Unnamed</span>}</p>
                                                                        {lIsPlannedOnly && <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5 inline-block mt-0.5"><Hourglass size={12} className="inline-block align-middle mr-0.5" /> Planned</span>}
                                                                        {lIsMated && <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5 inline-block mt-0.5"><Heart size={12} className="inline-block align-middle mr-0.5" /> Mated</span>}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        {lid ? <span className="text-xs font-mono bg-purple-100 px-2 py-0.5 rounded text-purple-700 block w-fit">{lid}</span> : <span className="text-xs text-gray-400">•</span>}
                                                                    </div>
                                                                    <div>
                                                                        {lIsPlannedOnly ? (<>
                                                                            <span className="text-indigo-400 text-[10px] uppercase tracking-wide font-semibold block">Planned</span>
                                                                            <span className="text-sm font-semibold text-indigo-700">{formatDate(litter.matingDate) || '?'}</span>
                                                                        </>) : lIsMated ? (<>
                                                                            <span className="text-purple-400 text-[10px] uppercase tracking-wide font-semibold block">Mated</span>
                                                                            <span className="text-sm font-semibold text-purple-700">{formatDate(litter.matingDate) || '?'}</span>
                                                                        </>) : (<>
                                                                            <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Birth</span>
                                                                            <span className="text-sm font-semibold text-gray-800">{formatDate(litter.birthDate) || '?'}{litter.birthDate && litterAge(litter.birthDate) && <span className="ml-1 text-xs font-semibold text-green-600">• {litterAge(litter.birthDate)}</span>}</span>
                                                                        </>)}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Mate</span>
                                                                        <span className="text-sm font-semibold text-gray-800 truncate block">{mate ? [mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ') : '•'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">COI</span>
                                                                        <span className="text-sm font-semibold text-gray-800">{litter.inbreedingCoefficient != null ? `${litter.inbreedingCoefficient.toFixed(2)}%` : '•'}</span>
                                                                    </div>
                                                                    <div>
                                                                        {lIsPlannedOnly ? (<>
                                                                            <span className="text-indigo-400 text-[10px] uppercase tracking-wide font-semibold block">Due</span>
                                                                            <span className="text-sm font-semibold text-indigo-700">{formatDate(litter.expectedDueDate) || '•'}</span>
                                                                        </>) : lIsMated ? (<>
                                                                            <span className="text-purple-400 text-[10px] uppercase tracking-wide font-semibold block">Status</span>
                                                                            <span className="text-xs font-semibold text-purple-500">Awaiting birth</span>
                                                                        </>) : (<>
                                                                            <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Born</span>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-sm font-bold text-gray-800">{litter.litterSizeBorn ?? litter.numberBorn ?? 0}</span>
                                                                                {(litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && (
                                                                                    <span className="text-xs ml-1">
                                                                                        <span className="text-blue-500 font-semibold">{litter.maleCount ?? 0}M</span>
                                                                                        <span className="text-gray-400 mx-0.5">/</span>
                                                                                        <span className="text-pink-500 font-semibold">{litter.femaleCount ?? 0}F</span>
                                                                                        <span className="text-gray-400 mx-0.5">/</span>
                                                                                        <span className="text-purple-500 font-semibold">{litter.unknownCount ?? 0}U</span>
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </>)}
                                                                    </div>
                                                                </div>
                                                                <ChevronDown size={18} className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`} />
                                                            </div>
                                                            {isExpanded && (
                                                                <div className="border-t border-purple-100 p-3 bg-purple-50 space-y-3">
                                                                    {/* -- 1. Name+CTL | COI | Mate ----------------------------- */}
                                                                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-start sm:items-center">
                                                                        {/* Left: Litter Name + CTL ID */}
                                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm h-full grid grid-cols-2 divide-x divide-gray-200 gap-3">
                                                                            <div>
                                                                                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Litter Name</div>
                                                                                {displayName
                                                                                    ? <div className="text-sm font-bold text-gray-800">{displayName}</div>
                                                                                    : <div className="text-sm text-gray-400 italic">?</div>}
                                                                            </div>
                                                                            <div className="pl-3">
                                                                                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">CTL ID</div>
                                                                                {lid
                                                                                    ? <div className="font-mono text-sm font-bold text-purple-700">{lid}</div>
                                                                                    : <div className="text-sm text-gray-400 italic">?</div>}
                                                                            </div>
                                                                        </div>
                                                                        {/* Center: COI */}
                                                                        <div className="flex flex-col items-center px-2">
                                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">COI</div>
                                                                            {litter.inbreedingCoefficient != null
                                                                                ? <div className="text-base font-medium text-gray-800">{litter.inbreedingCoefficient.toFixed(2)}%</div>
                                                                                : <div className="text-base font-medium text-gray-300">•</div>}
                                                                        </div>
                                                                        {/* Right: Mate card */}
                                                                        {mate ? (
                                                                            <div onClick={() => onViewAnimal && onViewAnimal(mate)} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition shadow-sm">
                                                                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                                    {mate.imageUrl || mate.photoUrl
                                                                                        ? <img src={mate.imageUrl || mate.photoUrl} alt={mate.name} className="w-full h-full object-cover" />
                                                                                        : <div className="w-full h-full flex items-center justify-center text-gray-400"><Cat size={18} /></div>}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mate</div>
                                                                                    <p className="font-bold text-gray-800 truncate text-sm">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</p>
                                                                                    <p className="text-xs text-gray-500">{mate.species}</p>
                                                                                    <p className="text-[10px] text-gray-400 font-mono">{mate.id_public}</p>
                                                                                </div>
                                                                            </div>
                                                                        ) : <div />}
                                                                    </div>
                                                                    {/* -- 2. Breeding & Birth ---------------------------------- */}
                                                                    {(litter.matingDate || litter.pairingDate || litter.breedingMethod || litter.breedingConditionAtTime || litter.outcome || litter.birthDate || litter.birthMethod || litter.expectedDueDate || litter.weaningDate) && (
                                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                                            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Breeding &amp; Birth</h4>
                                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                                                                                {(litter.matingDate || litter.pairingDate) && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mating Date</div><div className="font-semibold text-gray-800">{formatDate(litter.matingDate || litter.pairingDate)}</div></div>}
                                                                                {litter.expectedDueDate && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Expected Due Date</div><div className="font-semibold text-gray-800">{formatDate(litter.expectedDueDate)}</div></div>}
                                                                                {litter.breedingMethod && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Breeding Method</div><div className="font-semibold text-gray-800">{litter.breedingMethod}</div></div>}
                                                                                {litter.breedingConditionAtTime && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Breeding Condition</div><div className="font-semibold text-gray-800">{litter.breedingConditionAtTime}</div></div>}
                                                                                {litter.outcome && !(litter.isPlanned && litter.outcome === 'Unknown') && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Outcome</div><div className={`font-semibold ${litter.outcome === 'Successful' ? 'text-green-600' : litter.outcome === 'Unsuccessful' ? 'text-red-500' : 'text-gray-800'}`}>{litter.outcome}</div></div>}
                                                                                {!litter.isPlanned && litter.birthMethod && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Birth Method</div><div className="font-semibold text-gray-800">{litter.birthMethod}</div></div>}
                                                                                {!litter.isPlanned && litter.birthDate && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Birth Date</div><div className="font-semibold text-gray-800">{formatDate(litter.birthDate)}{litterAge(litter.birthDate) && <span className="ml-2 text-xs font-semibold text-green-600">{litterAge(litter.birthDate)}</span>}</div></div>}
                                                                                {!litter.isPlanned && litter.weaningDate && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Weaning Date</div><div className="font-semibold text-gray-800">{formatDate(litter.weaningDate)}</div></div>}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {/* -- 3. Stats bar ----------------------------------------- */}
                                                                    {!litter.isPlanned && <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                                        <div className="grid grid-cols-2 divide-x divide-gray-200">
                                                                            <div className="grid grid-cols-3 pr-3">
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Born</div><div className="text-lg font-bold text-gray-800">{litter.litterSizeBorn ?? litter.numberBorn ?? 0}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Stillborn</div><div className="text-lg font-bold text-gray-400">{litter.stillbornCount ?? litter.stillborn ?? 0}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Weaned</div><div className="text-lg font-bold text-green-600">{litter.litterSizeWeaned ?? litter.numberWeaned ?? 0}</div></div>
                                                                            </div>
                                                                            <div className="grid grid-cols-3 pl-3">
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Males</div><div className="text-lg font-bold text-blue-500">{litter.maleCount ?? 0}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Females</div><div className="text-lg font-bold text-pink-500">{litter.femaleCount ?? 0}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Unknown</div><div className="text-lg font-bold text-purple-500">{litter.unknownCount ?? 0}</div></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>}
                                                                    {/* -- 4. Notes --------------------------------------------- */}
                                                                    {litter.notes && <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm"><h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</h4><p className="text-sm text-gray-700 italic leading-relaxed">{litter.notes}</p></div>}
                                                                    {/* -- 4b. Photos ----------------------------------------- */}
                                                                    {!litter.isPlanned && litter.images && litter.images.length > 0 && (
                                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                                            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Photos</h4>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {litter.images.map((img, idx) => (
                                                                                    <div key={img.r2Key || idx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                                                                        <img src={img.url} alt={"Gallery " + (idx + 1)} className="w-full h-full object-cover cursor-pointer" onClick={() => window.open(img.url, '_blank')} />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {/* -- 5. Linked Offspring ---------------------------------- */}
                                                                    {lid && breedingRecordOffspring[lid] === undefined && (
                                                                        <div className="bg-white p-3 rounded border border-purple-100">
                                                                            <div className="text-sm font-semibold text-gray-700 mb-3">Offspring</div>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                                                {[...Array(3)].map((_, i) => (
                                                                                    <div key={i} className="rounded-lg border-2 border-gray-200 h-52 animate-pulse bg-gray-50 flex flex-col items-center pt-2">
                                                                                        <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                                            <div className="w-20 h-20 bg-gray-200 rounded-md" />
                                                                                        </div>
                                                                                        <div className="w-full px-2 pb-2">
                                                                                            <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-1" />
                                                                                            <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto" />
                                                                                        </div>
                                                                                        <div className="w-full bg-gray-100 py-1 border-t border-gray-200 mt-auto" />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {lid && breedingRecordOffspring[lid] && breedingRecordOffspring[lid].length > 0 && (
                                                                        <div className="bg-white p-3 rounded border border-purple-100">
                                                                            <div className="text-sm font-semibold text-gray-700 mb-3">Offspring ({breedingRecordOffspring[lid].length})</div>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                                                {breedingRecordOffspring[lid].map(offspring => (
                                                                                    offspring.isPrivate ? (
                                                                                        <div key={offspring.id_public} className="relative bg-gray-50 rounded-lg border-2 border-gray-200 h-52 flex flex-col items-center overflow-hidden pt-2">
                                                                                            <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                                                <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-2xl">•</div>
                                                                                            </div>
                                                                                            <div className="w-full text-center px-2 pb-1">
                                                                                                <div className="text-sm font-semibold text-gray-500 truncate">Private Animal</div>
                                                                                            </div>
                                                                                            <div className="w-full px-2 pb-2 flex justify-end">
                                                                                                <div className="text-xs text-gray-400 font-mono">{offspring.id_public}</div>
                                                                                            </div>
                                                                                            <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                                                                                <div className="text-xs font-medium text-gray-500">{offspring.gender || '•'}</div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div key={offspring.id_public} onClick={() => onViewAnimal && onViewAnimal(offspring)} className="relative bg-white rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 border-gray-200 pt-2">
                                                                                            {offspring.gender && (
                                                                                                <div className="absolute top-1.5 right-1.5">
                                                                                                    {offspring.gender === 'Male'
                                                                                                        ? <Mars size={14} strokeWidth={2.5} className="text-primary" />
                                                                                                        : <Venus size={14} strokeWidth={2.5} className="text-accent" />
                                                                                                    }
                                                                                                </div>
                                                                                            )}
                                                                                            <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                                                {offspring.imageUrl || offspring.photoUrl ? (
                                                                                                    <img src={offspring.imageUrl || offspring.photoUrl} alt={offspring.name} className="w-20 h-20 object-cover rounded-md" />
                                                                                                ) : (
                                                                                                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                                                                        <Cat size={32} />
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="w-full text-center px-2 pb-1">
                                                                                                <div className="text-sm font-semibold text-gray-800 truncate">
                                                                                                    {[offspring.prefix, offspring.name, offspring.suffix].filter(Boolean).join(' ')}
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="w-full px-2 pb-2 flex justify-end">
                                                                                                <div className="text-xs text-gray-500">{offspring.id_public}</div>
                                                                                            </div>
                                                                                            <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                                                                                <div className="text-xs font-medium text-gray-700">{offspring.status || offspring.gender || 'Unknown'}</div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                } else {
                                                    // Pedigree-only record (no CTL/litter management entry)
                                                    const recKey = `${litter.birthDate || 'unknown'}_${litter.otherParent?.id_public || 'none'}`;
                                                    const mate = litter.otherParent;
                                                    const isExpanded = expandedPedigreeRecords[recKey];
                                                    const offspringList = litter.offspring || [];
                                                    const maleCount = offspringList.filter(o => o.gender === 'Male').length;
                                                    const femaleCount = offspringList.filter(o => o.gender === 'Female').length;
                                                    const unknownCount = offspringList.filter(o => o.gender !== 'Male' && o.gender !== 'Female').length;
                                                    const coi = offspringList.find(o => o.inbreedingCoefficient != null)?.inbreedingCoefficient ?? null;
                                                    return (
                                                        <div key={recKey} className={`bg-white rounded border transition-all ${isExpanded ? 'border-purple-300 shadow-md' : 'border-purple-100'}`}>
                                                            <div
                                                                onClick={() => setExpandedPedigreeRecords({...expandedPedigreeRecords, [recKey]: !isExpanded})}
                                                                className="p-2 sm:p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition rounded"
                                                            >
                                                                {/* Mobile: stacked */}
                                                                <div className="flex-1 sm:hidden">
                                                                    <div className="text-xs text-gray-600 flex gap-2 flex-wrap items-center">
                                                                        {litter.birthDate && <span>{formatDate(litter.birthDate)}</span>}
                                                                        {mate?.name && <span className="truncate max-w-[120px]">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</span>}
                                                                        <span>{offspringList.length} born</span>
                                                                        {coi != null && <span className="text-gray-500">COI {coi.toFixed(2)}%</span>}
                                                                        {offspringList.length > 0 && (
                                                                            <span className="inline-flex gap-0.5 font-semibold">
                                                                                    <span className="text-blue-500">{maleCount}M</span>
                                                                                    <span className="text-gray-400">/</span>
                                                                                    <span className="text-pink-500">{femaleCount}F</span>
                                                                                    <span className="text-gray-400">/</span>
                                                                                    <span className="text-purple-500">{unknownCount}U</span>
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {/* Desktop: 4-column grid */}
                                                                <div className="hidden sm:grid flex-1 grid-cols-4 gap-3 items-center min-w-0">
                                                                    <div>
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Birth</span>
                                                                        <span className="text-sm font-semibold text-gray-800">{formatDate(litter.birthDate) || '•'}</span>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Mate</span>
                                                                        <span className="text-sm font-semibold text-gray-800 truncate block">{mate ? [mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ') : '•'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">COI</span>
                                                                        <span className="text-sm font-semibold text-gray-800">{coi != null ? `${coi.toFixed(2)}%` : '•'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Born</span>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-sm font-bold text-gray-800">{offspringList.length}</span>
                                                                            {offspringList.length > 0 && (
                                                                                <span className="text-xs ml-1">
                                                                                    <span className="text-blue-500 font-semibold">{maleCount}M</span>
                                                                                    <span className="text-gray-400 mx-0.5">/</span>
                                                                                    <span className="text-pink-500 font-semibold">{femaleCount}F</span>
                                                                                    <span className="text-gray-400 mx-0.5">/</span>
                                                                                    <span className="text-purple-500 font-semibold">{unknownCount}U</span>
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <ChevronDown size={18} className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`} />
                                                            </div>
                                                            {isExpanded && (
                                                                <div className="border-t border-purple-100 p-3 bg-purple-50 space-y-3">
                                                                    {/* -- 1. Birthdate | COI | Mate ----------------------------- */}
                                                                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-start sm:items-center">
                                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm h-full">
                                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Birth Date</div>
                                                                            {litter.birthDate
                                                                                ? <div className="text-sm font-bold text-gray-800">{formatDate(litter.birthDate)}</div>
                                                                                : <div className="text-sm text-gray-400 italic">•</div>}
                                                                        </div>
                                                                        <div className="flex flex-col items-center px-2">
                                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">COI</div>
                                                                            {coi != null ? <div className="text-base font-medium text-gray-800">{coi.toFixed(2)}%</div> : <div className="text-base font-medium text-gray-300">•</div>}
                                                                        </div>
                                                                        {mate ? (
                                                                            <div onClick={() => onViewAnimal && onViewAnimal(mate)} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition shadow-sm">
                                                                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                                    {mate.imageUrl || mate.photoUrl
                                                                                        ? <img src={mate.imageUrl || mate.photoUrl} alt={mate.name} className="w-full h-full object-cover" />
                                                                                        : <div className="w-full h-full flex items-center justify-center text-gray-400"><Cat size={18} /></div>}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mate</div>
                                                                                    <p className="font-bold text-gray-800 truncate text-sm">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</p>
                                                                                    <p className="text-xs text-gray-500">{mate.species}</p>
                                                                                    <p className="text-[10px] text-gray-400 font-mono">{mate.id_public}</p>
                                                                                </div>
                                                                            </div>
                                                                        ) : <div className="text-base font-medium text-gray-300">•</div>}
                                                                    </div>
                                                                    {/* -- 2. Slim stats ---------------------------------------- */}
                                                                    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                                        <div className="grid grid-cols-4 gap-3">
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Born</div><div className="text-lg font-bold text-gray-800">{offspringList.length}</div></div>
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Males</div><div className="text-lg font-bold text-blue-500">{maleCount}</div></div>
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Females</div><div className="text-lg font-bold text-pink-500">{femaleCount}</div></div>
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Unknown</div><div className="text-lg font-bold text-purple-500">{unknownCount}</div></div>
                                                                        </div>
                                                                    </div>
                                                                    {/* -- 3. Offspring cards ----------------------------------- */}
                                                                    {offspringList.length > 0 && (
                                                                        <div className="bg-white p-3 rounded border border-purple-100">
                                                                            <div className="text-sm font-semibold text-gray-700 mb-3">Offspring ({offspringList.length})</div>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                                                {offspringList.map(offspring => (
                                                                                    <div key={offspring.id_public || offspring._id} onClick={() => onViewAnimal && onViewAnimal(offspring)} className="relative bg-white rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 border-gray-200 pt-2">
                                                                                        {offspring.gender && (
                                                                                            <div className="absolute top-1.5 right-1.5">
                                                                                                {offspring.gender === 'Male'
                                                                                                    ? <Mars size={14} strokeWidth={2.5} className="text-primary" />
                                                                                                    : <Venus size={14} strokeWidth={2.5} className="text-accent" />
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                        <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                                            {offspring.imageUrl || offspring.photoUrl ? (
                                                                                                <img src={offspring.imageUrl || offspring.photoUrl} alt={offspring.name} className="w-20 h-20 object-cover rounded-md" />
                                                                                            ) : (
                                                                                                <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                                                                    <Cat size={32} />
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="w-full text-center px-2 pb-1">
                                                                                            <div className="text-sm font-semibold text-gray-800 truncate">
                                                                                                {[offspring.prefix, offspring.name, offspring.suffix].filter(Boolean).join(' ')}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="w-full px-2 pb-2 flex justify-end">
                                                                                            <div className="text-xs text-gray-500">{offspring.id_public}</div>
                                                                                        </div>
                                                                                        <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                                                                            <div className="text-xs font-medium text-gray-700">{offspring.status || offspring.gender || 'Unknown'}</div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                            })}
                                        </div>}
                                    </div>
                                );
                            })()}

                        </div>
                    )}

                    {/* Tab 7: Fertility */}
                    {detailViewTab === 7 && (
                        <div className="space-y-6">
                            {/* 1st Section: Reproductive Status */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Leaf size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Reproductive Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Neutered/Spayed:</span> <strong>{animal.isNeutered ? 'Yes' : 'No'}</strong></div>
                                    <div><span className="text-gray-600">Infertile:</span> <strong>{animal.isInfertile ? 'Yes' : 'No'}</strong></div>
                                    {!animal.isNeutered && !animal.isInfertile && (
                                        <div><span className="text-gray-600">In Mating:</span> <strong>{animal.isInMating ? 'Yes' : 'No'}</strong></div>
                                    )}
                                    {(animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && !animal.isNeutered && (
                                        <>
                                            <div><span className="text-gray-600">{getLabel('isPregnant', 'Pregnant')}:</span> <strong>{animal.isPregnant ? 'Yes' : 'No'}</strong></div>
                                            <div><span className="text-gray-600">{getLabel('isNursing', 'Nursing')}:</span> <strong>{animal.isNursing ? 'Yes' : 'No'}</strong></div>
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
                                    <h3 className="text-lg font-semibold text-gray-700"><RefreshCw size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Estrus/Cycle</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Heat Status:</span> <strong>{animal.heatStatus || ''}</strong></div>
                                        <div><span className="text-gray-600">Last Heat Date:</span> <strong>{animal.lastHeatDate ? formatDate(animal.lastHeatDate) : ''}</strong></div>
                                        <div><span className="text-gray-600">{getLabel('ovulationDate', 'Ovulation Date')}:</span> <strong>{animal.ovulationDate ? formatDate(animal.ovulationDate) : ''}</strong></div>
                                        {animal.estrusCycleLength && (
                                            <div><span className="text-gray-600">Estrus Cycle Length:</span> <strong>{`${animal.estrusCycleLength} days`}</strong></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 4th Section: Stud Information */}
                            {!animal.isNeutered && !animal.isInfertile && (animal.gender === 'Male' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Mars size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Sire Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Fertility Status:</span> <strong>{animal.fertilityStatus || ''}</strong></div>
                                    </div>
                                    {animal.fertilityNotes && (
                                        <div className="text-sm"><span className="text-gray-600">Notes:</span> <strong className="whitespace-pre-wrap">{animal.fertilityNotes}</strong></div>
                                    )}
                                    {animal.reproductiveClearances && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Clearances:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveClearances}</strong></div>
                                    )}
                                    {animal.reproductiveComplications && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Complications:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveComplications}</strong></div>
                                    )}
                                </div>
                            )}

                            {/* 5th Section: Dam Information */}
                            {!animal.isNeutered && !animal.isInfertile && (animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Venus size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Dam Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">{getLabel('damFertilityStatus', 'Dam Fertility Status')}:</span> <strong>{animal.damFertilityStatus || animal.fertilityStatus || ''}</strong></div>
                                        {animal.gestationLength && (
                                            <div><span className="text-gray-600">{getLabel('gestationLength', 'Gestation Length')}:</span> <strong>{`${animal.gestationLength} days`}</strong></div>
                                        )}
                                        {animal.deliveryMethod && (
                                            <div><span className="text-gray-600">{getLabel('deliveryMethod', 'Delivery Method')}:</span> <strong>{animal.deliveryMethod}</strong></div>
                                        )}
                                        {animal.whelpingDate && (
                                            <div><span className="text-gray-600">{getLabel('whelpingDate', 'Whelping Date')}:</span> <strong>{formatDate(animal.whelpingDate)}</strong></div>
                                        )}
                                        {animal.queeningDate && (
                                            <div><span className="text-gray-600">{getLabel('queeningDate', 'Queening Date')}:</span> <strong>{formatDate(animal.queeningDate)}</strong></div>
                                        )}
                                    </div>
                                    {animal.damFertilityNotes && (
                                        <div className="text-sm"><span className="text-gray-600">Notes:</span> <strong className="whitespace-pre-wrap">{animal.damFertilityNotes}</strong></div>
                                    )}
                                    {animal.reproductiveClearances && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Clearances:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveClearances}</strong></div>
                                    )}
                                    {animal.reproductiveComplications && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Complications:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveComplications}</strong></div>
                                    )}
                                </div>
                            )}

                        </div>
                    )}

                    {/* Tab 8: Health */}
                    {detailViewTab === 8 && (
                        <div className="space-y-6">
                            {/* 1st Section: Preventive Care */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, preventiveCare: !p.preventiveCare}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Shield size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Preventive Care</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.preventiveCare ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.preventiveCare && (<div className="space-y-4 mt-4">
                                    {animal.vaccinations && (
                                        <DetailJsonList
                                            label={getLabel('vaccinations', 'Vaccinations')}
                                            data={animal.vaccinations}
                                            renderItem={v => <>{v.name} {v.date && `(${formatDate(v.date)})`}{v.notes && <span className="text-gray-600"> - {v.notes}</span>}</>}
                                        />
                                    )}
                                    {animal.dewormingRecords && (
                                        <DetailJsonList
                                            label="Deworming Records"
                                            data={animal.dewormingRecords}
                                            renderItem={r => <>{r.medication} {r.date && `(${formatDate(r.date)})`}{r.notes && <span className="text-gray-600"> - {r.notes}</span>}</>}
                                        />
                                    )}
                                    {animal.parasiteControl && (
                                        <DetailJsonList
                                            label="Parasite Control"
                                            data={animal.parasiteControl}
                                            renderItem={r => <>{r.treatment} {r.date && `(${formatDate(r.date)})`}{r.notes && <span className="text-gray-600"> - {r.notes}</span>}</>}
                                        />
                                    )}
                                    {fieldTemplate?.fields?.parasitePreventionSchedule?.enabled !== false && animal.parasitePreventionSchedule && (
                                        <div className="text-sm">
                                            <span className="text-gray-600">{getLabel('parasitePreventionSchedule', 'Parasite Prevention Schedule')}:</span>
                                            <strong className="whitespace-pre-wrap">{animal.parasitePreventionSchedule}</strong>
                                        </div>
                                    )}
                                </div>)}
                            </div>

                            {/* 2nd Section: Procedures & Diagnostics */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, proceduresDiagnostics: !p.proceduresDiagnostics}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Microscope size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Procedures & Diagnostics</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.proceduresDiagnostics ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.proceduresDiagnostics && (<div className="space-y-4 mt-4">
                                    {animal.medicalProcedures && (
                                        <DetailJsonList
                                            label="Medical Procedures"
                                            data={animal.medicalProcedures}
                                            renderItem={p => <>{p.name} {p.date && `(${formatDate(p.date)})`}{p.notes && <span className="text-gray-600"> - {p.notes}</span>}</>}
                                        />
                                    )}
                                    {(animal.labResults || animal.laboratoryResults) && (
                                        <DetailJsonList
                                            label="Laboratory Results"
                                            data={animal.labResults || animal.laboratoryResults}
                                            renderItem={r => <>{r.testName} - {r.result} {r.date && `(${formatDate(r.date)})`}{r.notes && <span className="text-gray-600"> - {r.notes}</span>}</>}
                                        />
                                    )}
                                </div>)}
                            </div>

                            {/* 3rd Section: Active Medical Records */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, activeMedical: !p.activeMedical}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Pill size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Active Medical Records</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.activeMedical ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.activeMedical && (<div className="space-y-3 mt-4">
                                    {animal.medicalConditions && (() => {
                                        const d = animal.medicalConditions;
                                        const parsed = typeof d === 'string' ? (() => { try { return JSON.parse(d); } catch { return null; } })() : Array.isArray(d) ? d : null;
                                        return parsed && parsed.length > 0 ? (
                                            <div>
                                                <span className="text-gray-600 text-sm font-semibold">Medical Conditions:</span>
                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                    {parsed.map((item, i) => (
                                                        <li key={i} className="text-gray-700">
                                                            {item.condition || item.name}
                                                            {item.notes && <span className="text-gray-500"> • {item.notes}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : <div><span className="text-gray-600 text-sm font-semibold">Medical Conditions:</span><strong className="text-sm whitespace-pre-wrap">{d}</strong></div>;
                                    })()}
                                    {animal.allergies && (() => {
                                        const d = animal.allergies;
                                        const parsed = typeof d === 'string' ? (() => { try { return JSON.parse(d); } catch { return null; } })() : Array.isArray(d) ? d : null;
                                        return parsed && parsed.length > 0 ? (
                                            <div>
                                                <span className="text-gray-600 text-sm font-semibold">Allergies:</span>
                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                    {parsed.map((item, i) => (
                                                        <li key={i} className="text-gray-700">
                                                            {item.allergen || item.name}
                                                            {item.notes && <span className="text-gray-500"> ? {item.notes}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : <div><span className="text-gray-600 text-sm font-semibold">Allergies:</span><strong className="text-sm whitespace-pre-wrap">{d}</strong></div>;
                                    })()}
                                    {animal.medications && (() => {
                                        const d = animal.medications;
                                        const parsed = typeof d === 'string' ? (() => { try { return JSON.parse(d); } catch { return null; } })() : Array.isArray(d) ? d : null;
                                        return parsed && parsed.length > 0 ? (
                                            <div>
                                                <span className="text-gray-600 text-sm font-semibold">Current Medications:</span>
                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                    {parsed.map((item, i) => (
                                                        <li key={i} className="text-gray-700">
                                                            {item.medication || item.name}
                                                            {item.notes && <span className="text-gray-500"> • {item.notes}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : <div><span className="text-gray-600 text-sm font-semibold">Current Medications:</span><strong className="text-sm whitespace-pre-wrap">{d}</strong></div>;
                                    })()}
                                </div>)}
                            </div>

                            {/* 4th Section: Health Clearances & Screening */}
                            {(() => {
                                const clearanceFields = [
                                    { key: 'heartwormStatus', label: 'Heartworm Status' },
                                    { key: 'hipElbowScores', label: 'Hip/Elbow Scores' },
                                    { key: 'eyeClearance', label: 'Eye Clearance' },
                                    { key: 'cardiacClearance', label: 'Cardiac Clearance' },
                                    { key: 'dentalRecords', label: 'Dental Records' },
                                    { key: 'geneticTestResults', label: 'Genetic Test Results' },
                                    { key: 'chronicConditions', label: 'Chronic Conditions' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                const spayDate = fieldTemplate?.fields?.spayNeuterDate?.enabled !== false && animal.spayNeuterDate;
                                return (clearanceFields.length > 0 || spayDate) && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, healthClearances: !p.healthClearances}))} className="w-full flex items-center justify-between text-left group">
                                            <h3 className="text-lg font-semibold text-gray-700"><Hospital size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Health Clearances & Screening</h3>
                                            <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.healthClearances ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                        </button>
                                        {!collapsedHealthSections.healthClearances && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                                            {spayDate && <div><span className="text-gray-600">{getLabel('spayNeuterDate', 'Spay/Neuter Date')}:</span> <strong>{formatDate(animal.spayNeuterDate)}</strong></div>}
                                            {clearanceFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>)}
                                    </div>
                                );
                            })()}

                            {/* 5th Section: Veterinary Care */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, vetCare: !p.vetCare}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Stethoscope size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Veterinary Care</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.vetCare ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.vetCare && (<div className="space-y-4 text-sm mt-4">
                                    {animal.primaryVet && <div><span className="text-gray-600">Primary Veterinarian:</span> <strong>{animal.primaryVet}</strong></div>}
                                    {animal.vetVisits && (
                                        <DetailJsonList
                                            label="Veterinary Visits"
                                            data={animal.vetVisits}
                                            renderItem={v => <>{v.reason} {v.date && `(${formatDate(v.date)})`}{v.notes && <span className="text-gray-600"> - {v.notes}</span>}</>}
                                        />
                                    )}
                                </div>)}
                            </div>
                        </div>
                    )}

                    {/* Tab 9: Care */}
                    {detailViewTab === 9 && (
                        <div className="space-y-6">
                            {/* 1st Section: Nutrition */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><UtensilsCrossed size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Nutrition</h3>
                                <div className="space-y-3 text-sm">
                                    {animal.dietType && <div><span className="text-gray-600">Diet Type:</span> <strong>{animal.dietType}</strong></div>}
                                    {animal.feedingSchedule && <div><span className="text-gray-600">Feeding Schedule:</span> <strong>{animal.feedingSchedule}</strong></div>}
                                    {animal.supplements && <div><span className="text-gray-600">Supplements:</span> <strong>{animal.supplements}</strong></div>}
                                </div>
                            </div>

                            {/* 2nd Section: Housing & Enclosure */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Housing & Enclosure</h3>
                                <div className="space-y-3 text-sm">
                                    {enclosureInfo && (<div><span className="text-gray-600">Enclosure:</span> <strong>{enclosureInfo.name}</strong></div>)}
                                    {fieldTemplate?.fields?.housingType?.enabled !== false && animal.housingType && <div><span className="text-gray-600">{getLabel('housingType', 'Housing Type')}:</span> <strong>{animal.housingType}</strong></div>}
                                    {fieldTemplate?.fields?.bedding?.enabled !== false && animal.bedding && <div><span className="text-gray-600">{getLabel('bedding', 'Bedding')}:</span> <strong>{animal.bedding}</strong></div>}
                                    {animal.enrichment && <div><span className="text-gray-600">Enrichment:</span> <strong>{animal.enrichment}</strong></div>}
                                </div>
                                {animal.careTasks && animal.careTasks.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="text-sm font-semibold text-gray-700 mb-2">Enclosure Care Tasks</div>
                                        <div className="space-y-1">
                                            {animal.careTasks.map((task, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs bg-white px-2 py-1.5 rounded border border-gray-200">
                                                    <span className="font-medium text-gray-700">{task.taskName}</span>
                                                    <div className="flex items-center gap-3 text-gray-500">
                                                        {task.frequencyDays && <span>Every {task.frequencyDays}d</span>}
                                                        {task.lastDoneDate && <span>Last: {formatDate(task.lastDoneDate)}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3rd Section: Animal Care */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Droplets size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Animal Care</h3>
                                <div className="space-y-3 text-sm">
                                    {animal.animalCareTasks && animal.animalCareTasks.length > 0 && (
                                        <div>
                                            <div className="text-sm font-semibold text-gray-700 mb-2">Animal Care Tasks</div>
                                            <div className="space-y-1">
                                                {animal.animalCareTasks.map((task, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-xs bg-white px-2 py-1.5 rounded border border-gray-200">
                                                        <span className="font-medium text-gray-700">{task.taskName}</span>
                                                        <div className="flex items-center gap-3 text-gray-500">
                                                            {task.frequencyDays && <span>Every {task.frequencyDays}d</span>}
                                                            {task.lastDoneDate && <span>Last: {formatDate(task.lastDoneDate)}</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {animal.handlingNotes && <div className="flex items-baseline gap-1"><span className="text-gray-600 font-semibold shrink-0">Handling Notes:</span><strong className="whitespace-pre-wrap">{animal.handlingNotes}</strong></div>}
                                    {animal.socializationNotes && <div className="flex items-baseline gap-1"><span className="text-gray-600 font-semibold shrink-0">Socialization Notes:</span><strong className="whitespace-pre-wrap">{animal.socializationNotes}</strong></div>}
                                    {animal.specialCareRequirements && <div className="flex items-baseline gap-1"><span className="text-gray-600 font-semibold shrink-0">Special Care Requirements:</span><strong className="whitespace-pre-wrap">{animal.specialCareRequirements}</strong></div>}
                                </div>
                            </div>

                            {/* 3rd Section: Environment */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Thermometer size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Environment</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {animal.temperatureRange && <div><span className="text-gray-600">Temperature Range:</span> <strong>{animal.temperatureRange}</strong></div>}
                                    {fieldTemplate?.fields?.humidity?.enabled !== false && animal.humidity && <div><span className="text-gray-600">{getLabel('humidity', 'Humidity')}:</span> <strong>{animal.humidity}</strong></div>}
                                    {animal.lighting && <div><span className="text-gray-600">Lighting:</span> <strong>{animal.lighting}</strong></div>}
                                    {fieldTemplate?.fields?.noise?.enabled !== false && animal.noise && <div><span className="text-gray-600">{getLabel('noise', 'Noise Level')}:</span> <strong>{animal.noise}</strong></div>}
                                </div>
                            </div>

                            {/* 4th Section: Exercise & Grooming */}
                            {(() => {
                                const egFields = [
                                    { key: 'exerciseRequirements', label: 'Exercise Requirements' },
                                    { key: 'dailyExerciseMinutes', label: 'Daily Exercise (min)' },
                                    { key: 'groomingNeeds', label: 'Grooming Needs' },
                                    { key: 'sheddingLevel', label: 'Shedding Level' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                const trainFlags = [
                                    { key: 'crateTrained', label: 'Crate Trained' },
                                    { key: 'litterTrained', label: 'Litter Trained' },
                                    { key: 'leashTrained', label: 'Leash Trained' },
                                    { key: 'freeFlightTrained', label: 'Free Flight Trained' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return (egFields.length > 0 || trainFlags.length > 0) && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Scissors size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Grooming</h3>
                                        {egFields.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                {egFields.map(f => (
                                                    <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                                ))}
                                            </div>
                                        )}
                                        {trainFlags.length > 0 && (
                                            <div className="flex flex-wrap gap-3 text-sm">
                                                {trainFlags.map(f => (
                                                    <span key={f.key} className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">&#x2713; {getLabel(f.key, f.label)}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tab 10: Behavior */}
                    {detailViewTab === 10 && (
                        <div className="space-y-6">
                            {/* 1st Section: Behavior */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><MessageSquare size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Behavior</h3>
                                <div className="space-y-3 text-sm">
                                    {animal.temperament && <div><span className="text-gray-600">Temperament:</span> <strong>{animal.temperament}</strong></div>}
                                    {fieldTemplate?.fields?.handlingTolerance?.enabled !== false && animal.handlingTolerance && <div><span className="text-gray-600">{getLabel('handlingTolerance', 'Handling Tolerance')}:</span> <strong>{animal.handlingTolerance}</strong></div>}
                                    {animal.socialStructure && <div><span className="text-gray-600">Social Structure:</span> <strong>{animal.socialStructure}</strong></div>}
                                </div>
                            </div>

                            {/* 2nd Section: Activity */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Activity size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Activity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {animal.activityCycle && <div><span className="text-gray-600">Activity Cycle:</span> <strong>{animal.activityCycle}</strong></div>}
                                    {fieldTemplate?.fields?.exerciseRequirements?.enabled !== false && animal.exerciseRequirements && <div><span className="text-gray-600">{getLabel('exerciseRequirements', 'Exercise Requirements')}:</span> <strong>{animal.exerciseRequirements}</strong></div>}
                                    {fieldTemplate?.fields?.dailyExerciseMinutes?.enabled !== false && animal.dailyExerciseMinutes && <div><span className="text-gray-600">{getLabel('dailyExerciseMinutes', 'Daily Exercise (min)')}:</span> <strong>{animal.dailyExerciseMinutes}</strong></div>}
                                    {fieldTemplate?.fields?.trainingLevel?.enabled !== false && animal.trainingLevel && <div><span className="text-gray-600">{getLabel('trainingLevel', 'Training Level')}:</span> <strong>{animal.trainingLevel}</strong></div>}
                                    {fieldTemplate?.fields?.trainingDisciplines?.enabled !== false && animal.trainingDisciplines && <div><span className="text-gray-600">{getLabel('trainingDisciplines', 'Training Disciplines')}:</span> <strong>{animal.trainingDisciplines}</strong></div>}
                                    {fieldTemplate?.fields?.workingRole?.enabled !== false && animal.workingRole && <div><span className="text-gray-600">{getLabel('workingRole', 'Working Role')}:</span> <strong>{animal.workingRole}</strong></div>}
                                    {fieldTemplate?.fields?.certifications?.enabled !== false && animal.certifications && <div className="col-span-2"><span className="text-gray-600">{getLabel('certifications', 'Certifications')}:</span> <strong>{animal.certifications}</strong></div>}
                                </div>
                                {(animal.crateTrained || animal.litterTrained || animal.leashTrained || animal.freeFlightTrained) && (
                                    <div className="flex flex-wrap gap-3 text-sm pt-2">
                                        {fieldTemplate?.fields?.crateTrained?.enabled !== false && animal.crateTrained && <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold"><Check size={12} className="inline-block align-middle mr-0.5" /> {getLabel('crateTrained', 'Crate Trained')}</span>}
                                        {fieldTemplate?.fields?.litterTrained?.enabled !== false && animal.litterTrained && <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold"><Check size={12} className="inline-block align-middle mr-0.5" /> {getLabel('litterTrained', 'Litter Trained')}</span>}
                                        {fieldTemplate?.fields?.leashTrained?.enabled !== false && animal.leashTrained && <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold"><Check size={12} className="inline-block align-middle mr-0.5" /> {getLabel('leashTrained', 'Leash Trained')}</span>}
                                        {fieldTemplate?.fields?.freeFlightTrained?.enabled !== false && animal.freeFlightTrained && <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold"><Check size={12} className="inline-block align-middle mr-0.5" /> {getLabel('freeFlightTrained', 'Free Flight Trained')}</span>}
                                    </div>
                                )}
                            </div>

                            {/* 3rd Section: Known Issues */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><AlertTriangle size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Known Issues</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {fieldTemplate?.fields?.behavioralIssues?.enabled !== false && animal.behavioralIssues && <div className="flex items-baseline gap-1"><span className="text-gray-600 shrink-0">{getLabel('behavioralIssues', 'Behavioral Issues')}:</span><strong className="whitespace-pre-wrap">{animal.behavioralIssues}</strong></div>}
                                    {fieldTemplate?.fields?.biteHistory?.enabled !== false && animal.biteHistory && <div className="flex items-baseline gap-1"><span className="text-gray-600 shrink-0">{getLabel('biteHistory', 'Bite History')}:</span><strong className="whitespace-pre-wrap">{animal.biteHistory}</strong></div>}
                                    {fieldTemplate?.fields?.reactivityNotes?.enabled !== false && animal.reactivityNotes && <div className="col-span-2 flex items-baseline gap-1"><span className="text-gray-600 shrink-0">{getLabel('reactivityNotes', 'Reactivity Notes')}:</span><strong className="whitespace-pre-wrap">{animal.reactivityNotes}</strong></div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 11: Notes */}
                    {detailViewTab === 11 && (
                        <div className="space-y-6">
                            {/* 1st Section: Remarks & Notes */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><FileText size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Remarks & Notes</h3>
                                <strong className="block text-sm text-gray-700 whitespace-pre-wrap">{animal.remarks || ''}</strong>
                            </div>
                        </div>
                    )}                    {/* Tab 14: End of Life */}
                    {detailViewTab === 14 && (
                        <div className="space-y-6">
                            {/* End of Life */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Feather size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Deceased Date:</span> <strong>{animal.deceasedDate ? formatDate(animal.deceasedDate) : ''}</strong></div>
                                    <div><span className="text-gray-600">Cause of Death:</span> <strong>{animal.causeOfDeath || ''}</strong></div>
                                    <div><span className="text-gray-600">Necropsy Results:</span> <strong>{animal.necropsyResults || ''}</strong></div>
                                    {animal.endOfLifeCareNotes && (
                                        <div><span className="text-gray-600">{getLabel('endOfLifeCareNotes', 'End of Life Care Notes')}:</span> <strong className="whitespace-pre-wrap">{animal.endOfLifeCareNotes}</strong></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 12: Show */}
                    {detailViewTab === 12 && (
                        <div className="space-y-6">
                            {/* Show Titles & Ratings */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Medal size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Show Titles & Ratings</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Titles:</span> <strong>{animal.showTitles || ''}</strong></div>
                                    <div><span className="text-gray-600">Ratings:</span> <strong>{animal.showRatings || ''}</strong></div>
                                    <div><span className="text-gray-600">Judge Comments:</span> <strong className="whitespace-pre-wrap">{animal.judgeComments || ''}</strong></div>
                                </div>
                            </div>

                            {/* Working Titles & Performance */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Target size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Working & Performance</h3>
                                    <div className="space-y-3 text-sm">
                                        <div><span className="text-gray-600">Working Titles:</span> <strong>{animal.workingTitles || ''}</strong></div>
                                        <div><span className="text-gray-600">Performance Scores:</span> <strong>{animal.performanceScores || ''}</strong></div>
                                    </div>
                                </div>
                        </div>
                    )}

                    {/* Tab 13: Legal & Documentation */}
                    {detailViewTab === 13 && (
                        <div className="space-y-6">
                            {/* Licensing & Permits */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Key size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Licensing & Permits</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {fieldTemplate?.fields?.licenseNumber?.enabled !== false && animal.licenseNumber && (
                                        <div><span className="text-gray-600">{getLabel('licenseNumber', 'License Number')}:</span> <strong>{animal.licenseNumber}</strong></div>
                                    )}
                                    {fieldTemplate?.fields?.licenseJurisdiction?.enabled !== false && animal.licenseJurisdiction && (
                                        <div><span className="text-gray-600">{getLabel('licenseJurisdiction', 'License Jurisdiction')}:</span> <strong>{animal.licenseJurisdiction}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* Legal / Administrative */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><ClipboardList size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Legal / Administrative</h3>
                                <div className="space-y-3 text-sm">
                                    {fieldTemplate?.fields?.insurance?.enabled !== false && animal.insurance && (
                                        <div><span className="text-gray-600">{getLabel('insurance', 'Insurance')}:</span> <strong className="whitespace-pre-wrap">{animal.insurance}</strong></div>
                                    )}
                                    {fieldTemplate?.fields?.legalStatus?.enabled !== false && animal.legalStatus && (
                                        <div><span className="text-gray-600">{getLabel('legalStatus', 'Legal Status')}:</span> <strong className="whitespace-pre-wrap">{animal.legalStatus}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* Restrictions */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Ban size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Restrictions</h3>
                                <div className="space-y-3 text-sm">
                                    {animal.breedingRestrictions && (
                                        <div><span className="text-gray-600">{getLabel('breedingRestrictions', 'Breeding Restrictions')}:</span> <strong className="whitespace-pre-wrap">{animal.breedingRestrictions}</strong></div>
                                    )}
                                    {animal.exportRestrictions && (
                                        <div><span className="text-gray-600">{getLabel('exportRestrictions', 'Export Restrictions')}:</span> <strong className="whitespace-pre-wrap">{animal.exportRestrictions}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* No data fallback */}
                            {!animal.licenseNumber && !animal.licenseJurisdiction && !animal.insurance && !animal.legalStatus && !animal.breedingRestrictions && !animal.exportRestrictions && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center text-gray-500">
                                    <p>No legal or documentation records</p>
                                </div>
                            )}
                        </div>
                    )}

                {/* -- TAB 15 : Gallery (read-only • manage photos in Edit) --- */}
                {detailViewTab === 15 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700"><Images size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Photo Gallery</h3>
                                <p className="text-xs text-gray-400 mt-0.5">{(animal.extraImages || []).length} / 20 photos • manage in <strong>Edit</strong></p>
                            </div>
                        </div>

                        {(animal.extraImages || []).length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <Camera size={48} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-medium">No extra photos yet</p>
                                <p className="text-xs mt-1">Add photos from the Edit screen.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {(animal.extraImages || []).map((url, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                        <img
                                            src={url}
                                            alt={`Gallery photo ${idx + 1}`}
                                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => { setEnlargedImageUrl(url); setShowImageModal(true); }}
                                        />
                                        <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] rounded px-1 py-0.5">#{idx + 1}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* -- TAB 16 : Logs -------------------------------------------------- */}
                {detailViewTab === 16 && (
                    <div className="space-y-6 p-1">
                        {animalLogsLoading ? (
                            <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                Loading logs...
                            </div>
                        ) : !animalLogs || animalLogs.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-sm">No changes recorded yet. Logs are created when you edit or feed this animal.</div>
                        ) : (() => {
                            const feedingLogs = animalLogs.filter(l => l.category === 'feeding');
                            const careLogs    = animalLogs.filter(l => l.category === 'care');
                            const fieldLogs   = animalLogs.filter(l => l.category === 'field');
                            const fmtVal = v => v === null || v === undefined ? '?' : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v).slice(0, 80);
                            return (
                                <>
                                    {/* Feeding History */}
                                    {feedingLogs.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 pb-1 border-b border-green-200">
                                                <Edit size={16} className="inline-block align-middle" />
                                                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Feeding History</h3>
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{feedingLogs.length}</span>
                                            </div>
                                            {feedingLogs.map(log => {
                                                const ev = log.changes?.[0]?.newValue || {};
                                                const foodLabel = ev.supplyName
                                                    ? `${ev.supplyName}${ev.feederType ? ` (${ev.feederType}${ev.feederSize ? ` · ${ev.feederSize}` : ''})` : ''}`
                                                    : null;
                                                const qtyLabel = ev.quantity != null ? `${ev.quantity}${ev.unit ? ` ${ev.unit}` : ''}` : null;
                                                return (
                                                    <div key={log._id} className="bg-green-50 border border-green-100 rounded-lg p-3">
                                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-green-600 font-medium text-sm flex items-center gap-0.5"><Check size={12} className="flex-shrink-0" /> Fed</span>
                                                                {foodLabel && <span className="text-gray-700 text-sm font-medium">{foodLabel}</span>}
                                                                {qtyLabel && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">• {qtyLabel}</span>}
                                                            </div>
                                                            <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                                                        </div>
                                                        {!foodLabel && <p className="text-xs text-gray-400 mt-1">No food recorded</p>}
                                                        {ev.notes && <p className="text-xs text-gray-500 mt-1 italic">"{ev.notes}"</p>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Care Schedule Updates */}
                                    {careLogs.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 pb-1 border-b border-blue-200">
                                                <Edit size={16} className="inline-block align-middle" />
                                                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Care Schedule Updates</h3>
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{careLogs.length}</span>
                                            </div>
                                            {careLogs.map(log => (
                                                <div key={log._id} className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-1.5">
                                                    <span className="text-xs font-medium text-blue-500">{new Date(log.createdAt).toLocaleString()}</span>
                                                    {log.changes.map((c, i) => (
                                                        <div key={i} className="text-sm">
                                                            <span className="font-medium text-gray-700">{c.label}:</span>{' '}
                                                            {c.field === 'careTasks' ? (
                                                                <span className="text-gray-500">Task list updated</span>
                                                            ) : c.field === 'careTaskDone' ? (
                                                                <span className="text-green-600 flex items-center gap-0.5"><Check size={12} className="flex-shrink-0" /> Completed: {c.newValue}</span>
                                                            ) : (
                                                                <span className="text-gray-500">
                                                                    {c.oldValue != null ? <span className="line-through text-red-400 mr-1">{fmtVal(c.oldValue)}</span> : <span className="text-gray-400 mr-1">none</span>}
                                                                    <ArrowRight size={14} className="inline-block align-middle mr-0.5" /> <span className="text-green-600">{fmtVal(c.newValue)}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Field Edits */}
                                    {fieldLogs.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
                                                <Edit size={16} className="inline-block align-middle" />
                                                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Field Edits</h3>
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{fieldLogs.length}</span>
                                            </div>
                                            {fieldLogs.map(log => (
                                                <div key={log._id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1.5">
                                                    <span className="text-xs font-medium text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
                                                    {log.changes.map((c, i) => (
                                                        <div key={i} className="text-sm flex items-start gap-1.5 flex-wrap">
                                                            <span className="font-medium text-gray-700 shrink-0">{c.label}:</span>
                                                            <span className="text-gray-500">
                                                                {c.oldValue != null ? <span className="line-through text-red-400 mr-1">{fmtVal(c.oldValue)}</span> : <span className="text-gray-400 mr-1">•</span>}
                                                                <ArrowRight size={14} className="inline-block align-middle mr-0.5" /> <span className="text-green-600">{fmtVal(c.newValue)}</span>
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* -- TAB 5: Beta Pedigree -- */}
                {detailViewTab === 5 && (() => {
                    if (mpLoading) return <div className="flex items-center justify-center py-16 gap-2 text-gray-400"><Loader2 size={18} className="animate-spin" /><span className="text-sm">Loading ancestry</span></div>;
                    const mpData = mpEnrichedData || animal?.manualPedigree || {};
                    const emptySlot = () => ({ mode: 'manual', ctcId: '', prefix: '', name: '', suffix: '', variety: '', genCode: '', birthDate: '', breederName: '', gender: '', imageUrl: '', notes: '' });
                    const getSlot = (key) => mpData[key] || emptySlot();
                    const hasAnyData = ['sire','dam','sireSire','sireDam','damSire','damDam',
                        'sireSireSire','sireSireDam','sireDamSire','sireDamDam',
                        'damSireSire','damSireDam','damDamSire','damDamDam'].some(k => {
                        const d = mpData[k];
                        return d && (d.ctcId || Object.entries(d).some(([fk,v]) => fk !== 'mode' && v && String(v).trim()));
                    });
                    const handleDownloadMP = async () => {
                        if (!mpTreeRef.current) return;
                        setMpDownloading(true);
                        try {
                            const srcCanvas = await html2canvas(mpTreeRef.current, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
                            const a4W = 1654, a4H = 2339, pad = 80;
                            const maxW = a4W - pad * 2, maxH = a4H - pad * 2;
                            const ratio = Math.min(maxW / srcCanvas.width, maxH / srcCanvas.height);
                            const dw = Math.round(srcCanvas.width * ratio), dh = Math.round(srcCanvas.height * ratio);
                            const out = document.createElement('canvas');
                            out.width = a4W; out.height = a4H;
                            const ctx = out.getContext('2d');
                            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, a4W, a4H);
                            ctx.drawImage(srcCanvas, Math.round((a4W - dw) / 2), Math.round((a4H - dh) / 2), dw, dh);
                            const link = document.createElement('a');
                            link.download = `manual-pedigree-${animal.name || animal.id_public}.png`;
                            link.href = out.toDataURL('image/png');
                            link.click();
                        } catch(e) { console.error('Manual pedigree download failed', e); }
                        finally { setMpDownloading(false); }
                    };
                    const handleDownloadMPPDF = async () => {
                        if (!mpTreeRef.current) return;
                        setMpDownloading(true);
                        try {
                            const srcCanvas = await html2canvas(mpTreeRef.current, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
                            const a4W = 1654, a4H = 2339, pad = 80;
                            const maxW = a4W - pad * 2, maxH = a4H - pad * 2;
                            const ratio = Math.min(maxW / srcCanvas.width, maxH / srcCanvas.height);
                            const dw = Math.round(srcCanvas.width * ratio), dh = Math.round(srcCanvas.height * ratio);
                            const out = document.createElement('canvas');
                            out.width = a4W; out.height = a4H;
                            const ctx = out.getContext('2d');
                            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, a4W, a4H);
                            ctx.drawImage(srcCanvas, Math.round((a4W - dw) / 2), Math.round((a4H - dh) / 2), dw, dh);
                            const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [a4W, a4H] });
                            pdf.addImage(out.toDataURL('image/png'), 'PNG', 0, 0, a4W, a4H);
                            pdf.save(`pedigree-${animal.name || animal.id_public}.pdf`);
                        } catch(e) { console.error('Pedigree PDF failed', e); }
                        finally { setMpDownloading(false); }
                    };

                    const renderSlot = (slotKey, label, sideColor) => {
                        const d = getSlot(slotKey);
                        const hasData = d && (d.ctcId || Object.entries(d).some(([fk,v]) => fk !== 'mode' && v && String(v).trim()));
                        const fullName = [d.prefix, d.name, d.suffix].filter(Boolean).join(' ');
                        const slotGender = (slotKey === 'sire' || slotKey.endsWith('Sire')) ? 'Male' : 'Female';
                        const isSire = slotGender === 'Male';
                        const GIcon = isSire ? Mars : Venus;
                        const gColor = isSire ? 'text-blue-400' : 'text-pink-400';
                        const handleSlotClick = d.ctcId && onViewAnimal ? async () => {
                            try {
                                const res = await axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(d.ctcId)}`, { headers: { Authorization: `Bearer ${authToken}` } });
                                if (res.data) onViewAnimal(res.data, 16);
                            } catch { /* not accessible */ }
                        } : undefined;
                        return (
                            <div key={slotKey} onClick={handleSlotClick} className={`rounded-lg border-2 p-3 h-full relative ${handleSlotClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${hasData ? (isSire ? 'border-blue-200 bg-blue-50/40' : 'border-pink-200 bg-pink-50/40') : 'border-dashed border-gray-200 bg-gray-50'}`}>
                                <div className={`flex items-center gap-1 mb-1.5 ${isSire ? 'text-blue-400' : 'text-pink-400'}`}>
                                    <GIcon size={11} className={`flex-shrink-0 ${gColor}`} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
                                </div>
                                {hasData ? (
                                    <div className="flex gap-2.5">
                                        {d.imageUrl && (
                                            <img src={d.imageUrl} alt={fullName} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200 self-start" />
                                        )}
                                        <div className="flex-1 min-w-0 space-y-0.5 pb-4">
                                            {fullName && <p className="text-xs font-semibold text-gray-800 leading-tight">{fullName}</p>}
                                            {d.variety && <p className="text-[11px] text-gray-500">{d.variety}</p>}
                                            {d.genCode && <p className="text-[11px] font-mono text-indigo-600">{d.genCode}</p>}
                                            {d.birthDate && <p className="text-[11px] text-gray-400">{formatDate(d.birthDate)}</p>}
                                            {d.deceasedDate && <p className="text-[11px] text-red-600 font-semibold">† {formatDate(d.deceasedDate)}</p>}
                                            {d.breederName && <p className="text-[11px] text-gray-500 italic">{d.breederName}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2.5">
                                        <div className="flex-1 min-w-0 space-y-0.5 pb-4">
                                            <p className="text-[11px] text-gray-300 italic">•</p>
                                        </div>
                                    </div>
                                )}
                                {d.ctcId && <p className="absolute bottom-1.5 right-2 text-[10px] font-mono text-gray-800">{d.ctcId}</p>}
                            </div>
                        );
                    };

                    return (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <Dna size={18} className="text-orange-500" />
                                    <h3 className="text-base font-semibold text-gray-700">Beta Pedigree</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex rounded border border-gray-300 overflow-hidden text-xs">
                                        <button onClick={() => setBetaPedigreeView('vertical')} className={`px-2 py-1 transition-colors ${betaPedigreeView === 'vertical' ? 'bg-gray-200 font-semibold text-gray-800' : 'text-gray-400 hover:bg-gray-100'}`}>Vertical</button>
                                        <button onClick={() => setBetaPedigreeView('chart')} className={`px-2 py-1 transition-colors ${betaPedigreeView === 'chart' ? 'bg-primary font-semibold text-black' : 'text-gray-400 hover:bg-gray-100'}`}>Horizontal</button>
                                    </div>
                                    {hasAnyData && betaPedigreeView === 'vertical' && (
                                        <>
                                        <button onClick={handleDownloadMPPDF} disabled={mpDownloading}
                                            className="px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-black rounded-lg border border-primary/40 transition flex items-center gap-1.5 disabled:opacity-60 font-semibold">
                                            {mpDownloading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Download size={14} /> Save PDF</>}
                                        </button>
                                        <button onClick={handleDownloadMP} disabled={mpDownloading}
                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition flex items-center gap-1.5 disabled:opacity-60">
                                            {mpDownloading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Images size={14} /> Save Image</>}
                                        </button>
                                        </>
                                    )}
                                    {betaPedigreeView === 'chart' && (
                                        <>
                                        <button onClick={() => chartRef.current?.downloadPDF()} disabled={!chartRef.current?.imagesLoaded || chartRef.current?.isSaving}
                                            className="px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-black rounded-lg border border-primary/40 transition flex items-center gap-1.5 disabled:opacity-60 font-semibold">
                                            <Download size={14} /> Save PDF
                                        </button>
                                        <button onClick={() => chartRef.current?.downloadImage()} disabled={!chartRef.current?.imagesLoaded || chartRef.current?.isSaving}
                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition flex items-center gap-1.5 disabled:opacity-60">
                                            <Images size={14} /> Save Image
                                        </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 -mt-3">This Beta Pedigree displays both linked CritterTrack ancestors (with CTC IDs) and manually entered ancestors. Only linked CritterTrack ancestry is used for COI calculations. Manual entries are for display/reference only and do not affect COI or the main pedigree chart. To add or edit manual ancestors, use the Edit button.</p>

                            <div className={betaPedigreeView === 'chart' ? '' : 'hidden'}>
                                <PedigreeChart ref={chartRef} inline animalId={animal.id_public} animalData={animal} API_BASE_URL={API_BASE_URL} authToken={authToken} onClose={() => {}} manualData={mpEnrichedData} onViewAnimal={onViewAnimal} />
                            </div>
                            <div className={betaPedigreeView === 'vertical' ? '' : 'hidden'}>
                            <div ref={mpTreeRef} className="space-y-6 bg-white p-4 rounded-xl">

                            {(() => {
                                const subjectVariety = ['color','coatPattern','coat','earset','phenotype','morph','markings'].map(k => animal[k]).filter(Boolean).join(' ');
                                const subjectImgUrl = animal.imageUrl || animal.photoUrl || null;
                                const subjectName = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ');
                                const isMale = animal.gender === 'Male';
                                const SubjectGenderIcon = isMale ? Mars : Venus;
                                const subjectGColor = isMale ? 'text-blue-500' : 'text-pink-500';
                                const ownerImgUrl = breederInfo?.profileImage || breederInfo?.profileImageUrl || null;
                                const ownerShowPersonal = breederInfo?.showPersonalName ?? true;
                                const ownerShowBreeder = breederInfo?.showBreederName ?? true;
                                const ownerLines = [];
                                if (ownerShowPersonal && breederInfo?.personalName) ownerLines.push(breederInfo.personalName);
                                if (ownerShowBreeder && breederInfo?.breederName) ownerLines.push(breederInfo.breederName);
                                const ownerUserId = breederInfo?.id_public || null;
                                const ownerQrUrl = ownerUserId ? `${window.location.origin}/user/${ownerUserId}` : null;
                                return (
                                    <div className="rounded-xl border-2 border-primary bg-primary/10 overflow-hidden relative">
                                        {/* Owner/breeder • top-right corner */}
                                        {breederInfo && (
                                        <div className="absolute top-2 right-2 flex flex-col items-center gap-1 text-center z-10">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                                                {ownerImgUrl ? <img src={ownerImgUrl} alt="Breeder" className="w-full h-full object-cover" /> : <User size={18} className="text-gray-400" />}
                                            </div>
                                            <div className="space-y-0">
                                                {ownerLines.length > 0 ? ownerLines.map((l,i) => <p key={i} className="text-xs font-semibold text-gray-700 leading-tight">{l}</p>) : null}
                                                {ownerUserId && <p className="text-[10px] font-mono text-gray-400">{ownerUserId}</p>}
                                            </div>
                                            {ownerQrUrl && <QRCodeSVG value={ownerQrUrl} size={52} bgColor="transparent" fgColor="#374151" level="M" />}
                                        </div>
                                        )}
                                        {/* Animal info • centered */}
                                        <div className="flex flex-col items-center gap-2 text-center p-4 relative">
                                            {animal.species && <div className="absolute top-2 left-2 text-left"><p className="text-xs font-semibold text-gray-600 leading-tight">{animal.species}</p>{getSpeciesLatinName(animal.species) && <p className="text-[10px] italic text-gray-400 leading-tight">{getSpeciesLatinName(animal.species)}</p>}</div>}
                                            {subjectImgUrl ? (
                                                <img src={subjectImgUrl} alt={subjectName} className="w-20 h-20 rounded-full object-cover border-2 border-primary/30" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-300"><Cat size={32} /></div>
                                            )}
                                            <div className="flex items-center gap-1 justify-center">
                                                <SubjectGenderIcon size={14} className={`flex-shrink-0 ${subjectGColor}`} />
                                                <p className="text-base font-bold text-gray-800 leading-tight">{subjectName}</p>
                                            </div>
                                            {subjectVariety && <p className="text-xs text-gray-500 -mt-1">{subjectVariety}</p>}
                                            {animal.geneticCode && <p className="text-xs font-mono text-indigo-600">{animal.geneticCode}</p>}
                                            {animal.birthDate && <p className="text-xs text-gray-400">{formatDate(animal.birthDate)}</p>}
                                            {(animal.manualBreederName || (breederInfo && (breederInfo.breederName || breederInfo.personalName))) && <p className="text-xs text-gray-500 italic">{animal.manualBreederName || breederInfo.breederName || breederInfo.personalName}</p>}
                                            {animal.remarks && <p className="text-xs text-gray-400 border-t border-primary/20 pt-1 mt-1 max-w-xs">{animal.remarks}</p>}
                                            {animal.id_public && <p className="text-xs font-mono text-gray-400">{animal.id_public}</p>}
                                        </div>
                                    </div>
                                );
                            })()}

                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 1 — Parents</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {renderSlot('sire', 'Sire', 'sire')}
                                    {renderSlot('dam', 'Dam', 'dam')}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 2 — Grandparents</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Paternal</p>
                                    <p className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest">Maternal</p>
                                    {renderSlot('sireSire', 'Grandsire', 'sire')}
                                    {renderSlot('damSire', 'Grandsire', 'dam')}
                                    {renderSlot('sireDam', 'Granddam', 'sire')}
                                    {renderSlot('damDam', 'Granddam', 'dam')}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 3 — Great-Grandparents</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Paternal</p>
                                    <p className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest">Maternal</p>
                                    <p className="text-[10px] text-gray-400 mb-0.5">via Grandsire</p>
                                    <p className="text-[10px] text-gray-400 mb-0.5">via Grandsire</p>
                                    {renderSlot('sireSireSire', 'Great-Grandsire', 'sire')}
                                    {renderSlot('damSireSire', 'Great-Grandsire', 'dam')}
                                    {renderSlot('sireSireDam', 'Great-Granddam', 'sire')}
                                    {renderSlot('damSireDam', 'Great-Granddam', 'dam')}
                                    <p className="text-[10px] text-gray-400 mt-1 mb-0.5">via Granddam</p>
                                    <p className="text-[10px] text-gray-400 mt-1 mb-0.5">via Granddam</p>
                                    {renderSlot('sireDamSire', 'Great-Grandsire', 'sire')}
                                    {renderSlot('damDamSire', 'Great-Grandsire', 'dam')}
                                    {renderSlot('sireDamDam', 'Great-Granddam', 'sire')}
                                    {renderSlot('damDamDam', 'Great-Granddam', 'dam')}
                                </div>
                            </div>
                            </div>
                            </div>
                        </div>
                    );
                })()}

                {/* QR Share Modal */}
                {showQR && <QRModal url={`${window.location.origin}/animal/${animal.id_public}`} title={animal.name} onClose={() => setShowQR(false)} />}

                {/* Pedigree Chart Modal */}
                {showPedigree && (
                    <PedigreeChart
                        animalId={animal.id_public}
                        API_BASE_URL={API_BASE_URL}
                        authToken={authToken}
                        onClose={() => setShowPedigree(false)}
                        onViewAnimal={onViewAnimal}
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
const ViewOnlyPrivateAnimalDetail = ({ animal, onClose, onCloseAll, API_BASE_URL, authToken, setShowImageModal, setEnlargedImageUrl, showModalMessage, onViewAnimal, breedingLineDefs = [], animalBreedingLines = {}, toggleAnimalBreedingLine, initialTab = 1, initialBetaView = 'vertical' }) => {
    const [breederInfo, setBreederInfo] = useState(null);
    const [showPedigree, setShowPedigree] = useState(false);
    const [detailViewTab, setDetailViewTab] = useState(initialTab);
    const [enclosureInfo, setEnclosureInfo] = useState(null);
    const [collapsedHealthSections, setCollapsedHealthSections] = useState({});
    const [breedingRecordOffspring, setBreedingRecordOffspring] = useState({});
    const [expandedBreedingRecords, setExpandedBreedingRecords] = useState({});
    const [animalLitters, setAnimalLitters] = useState(null);
    const [pedigreeOffspring, setPedigreeOffspring] = useState(null);
    const [expandedPedigreeRecords, setExpandedPedigreeRecords] = useState({});
    const [mpDownloading, setMpDownloading] = useState(false);
    const [mpLoading, setMpLoading] = useState(false);
    const mpTreeRef = useRef(null);
    const chartRef = useRef(null);
    const [mpEnrichedData, setMpEnrichedData] = useState(null);
    const [betaPedigreeView, setBetaPedigreeView] = useState(initialBetaView);
    useEffect(() => {
        if (detailViewTab !== 5) return;
        let cancelled = false;
        setMpLoading(true);
        (async () => {
            const manual = animal?.manualPedigree || {};
            const toSlot = (a) => {
                const variety = ['color','coatPattern','coat','earset','phenotype','morph','markings'].map(k => a[k]).filter(Boolean).join(' ');
                return { mode: 'ctc', ctcId: a.id_public || '', prefix: a.prefix || '', name: a.name || '', suffix: a.suffix || '', variety, genCode: a.geneticCode || '', birthDate: a.birthDate ? String(a.birthDate).slice(0,10) : '', deceasedDate: a.deceasedDate ? String(a.deceasedDate).slice(0,10) : '', breederName: a.breederName || a.manualBreederName || '', gender: a.gender || '', imageUrl: a.imageUrl || a.photoUrl || '', notes: '' };
            };
            const fetchOne = async (id) => {
                if (!id) return null;
                try { const r = await axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${authToken}` } }); return r.data || null; }
                catch { return null; }
            };
            // Level 1: parents
            const [sire, dam] = await Promise.all([
                fetchOne(animal?.sireId_public || animal?.fatherId_public),
                fetchOne(animal?.damId_public  || animal?.motherId_public),
            ]);
            if (cancelled) return;
            // Level 2: grandparents
            const [ss, sd, ds, dd] = await Promise.all([
                fetchOne(sire?.sireId_public || sire?.fatherId_public),
                fetchOne(sire?.damId_public  || sire?.motherId_public),
                fetchOne(dam?.sireId_public  || dam?.fatherId_public),
                fetchOne(dam?.damId_public   || dam?.motherId_public),
            ]);
            if (cancelled) return;
            // Level 3: great-grandparents
            const [sss, ssd, sds, sdd, dss, dsd, dds, ddd] = await Promise.all([
                fetchOne(ss?.sireId_public || ss?.fatherId_public),
                fetchOne(ss?.damId_public  || ss?.motherId_public),
                fetchOne(sd?.sireId_public || sd?.fatherId_public),
                fetchOne(sd?.damId_public  || sd?.motherId_public),
                fetchOne(ds?.sireId_public || ds?.fatherId_public),
                fetchOne(ds?.damId_public  || ds?.motherId_public),
                fetchOne(dd?.sireId_public || dd?.fatherId_public),
                fetchOne(dd?.damId_public  || dd?.motherId_public),
            ]);
            if (cancelled) return;
            // Build seeded slots from linked ancestry
            const seeded = {};
            if (sire) seeded.sire         = toSlot(sire);
            if (dam)  seeded.dam          = toSlot(dam);
            if (ss)   seeded.sireSire     = toSlot(ss);
            if (sd)   seeded.sireDam      = toSlot(sd);
            if (ds)   seeded.damSire      = toSlot(ds);
            if (dd)   seeded.damDam       = toSlot(dd);
            if (sss)  seeded.sireSireSire = toSlot(sss);
            if (ssd)  seeded.sireSireDam  = toSlot(ssd);
            if (sds)  seeded.sireDamSire  = toSlot(sds);
            if (sdd)  seeded.sireDamDam   = toSlot(sdd);
            if (dss)  seeded.damSireSire  = toSlot(dss);
            if (dsd)  seeded.damSireDam   = toSlot(dsd);
            if (dds)  seeded.damDamSire   = toSlot(dds);
            if (ddd)  seeded.damDamDam    = toSlot(ddd);
            // Overlay seeded (real CTC links) on top of manual entries • seed wins
            const merged = {};
            Object.entries(manual).forEach(([k, v]) => {
                if (v && (v.ctcId || v.name || v.prefix || v.suffix)) merged[k] = v;
            });
            Object.assign(merged, seeded);
            if (!cancelled) { setMpEnrichedData(merged); setMpLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [detailViewTab, animal?.id_public]);
    useEffect(() => { setMpEnrichedData(null); setMpLoading(false); }, [animal?.id_public]);
    useEffect(() => { setDetailViewTab(initialTab); setBetaPedigreeView(initialBetaView); }, [animal?.id_public, initialTab, initialBetaView]);

    // Fetch all litters where this animal is sire or dam
    React.useEffect(() => {
        if (!animal?.id_public || !authToken) return;
        let cancelled = false;
        axios.get(`${API_BASE_URL}/litters`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => {
                if (cancelled) return;
                const linked = (res.data || []).filter(l =>
                    l.sireId_public === animal.id_public || l.damId_public === animal.id_public
                );
                setAnimalLitters(linked);
                linked.forEach(litter => {
                    const lid = litter.litter_id_public;
                    if (!lid) return;
                    if (!litter.offspringIds_public?.length) {
                        setBreedingRecordOffspring(prev => ({ ...prev, [lid]: [] }));
                        return;
                    }
                    axios.get(`${API_BASE_URL}/litters/${lid}/offspring`, { headers: { Authorization: `Bearer ${authToken}` } })
                        .then(r => { if (!cancelled) setBreedingRecordOffspring(prev => ({ ...prev, [lid]: r.data })); })
                        .catch(() => { if (!cancelled) setBreedingRecordOffspring(prev => ({ ...prev, [lid]: [] })); });
                });
            })
            .catch(() => { if (!cancelled) setAnimalLitters([]); });
        return () => { cancelled = true; };
    }, [animal?.id_public, authToken, API_BASE_URL]);

    // Fetch pedigree-based offspring groups (not in litter management)
    React.useEffect(() => {
        if (!animal?.id_public || !authToken) return;
        let cancelled = false;
        axios.get(`${API_BASE_URL}/animals/${animal.id_public}/offspring`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => {
                if (cancelled) return;
                // Only groups without a formal litter record (no CTL ID)
                const unmanaged = (res.data || []).filter(l => !l.litter_id_public);
                setPedigreeOffspring(unmanaged);
            })
            .catch(() => { if (!cancelled) setPedigreeOffspring([]); });
        return () => { cancelled = true; };
    }, [animal?.id_public, authToken, API_BASE_URL]);

    const { fieldTemplate, getLabel } = useDetailFieldTemplate(animal?.species, API_BASE_URL);

    // Fetch assigned enclosure info
    React.useEffect(() => {
        if (!animal?.enclosureId || !authToken) { setEnclosureInfo(null); return; }
        axios.get(`${API_BASE_URL}/enclosures`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => setEnclosureInfo(res.data.find(e => e._id === animal.enclosureId) || null))
            .catch(() => setEnclosureInfo(null));
    }, [animal?.enclosureId, authToken, API_BASE_URL]);

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
                            <button onClick={onCloseAll || onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={24} />
                            </button>
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
                            <button onClick={onCloseAll || onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={28} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs - ALL 11 TABS (same as PrivateAnimalDetail) */}
                <div className="bg-white border-b border-gray-300 px-6 pt-4">
                    <div className="flex flex-wrap gap-1 pb-4">
                        {[
                            { id: 1, label: 'Overview', icon: ClipboardList, color: 'text-blue-500' },
                            { id: 2, label: 'Status & Privacy', icon: Lock, color: 'text-slate-500' },
                            { id: 3, label: 'Identification', icon: Tag, color: 'text-amber-500' },
                            { id: 4, label: 'Appearance', icon: Palette, color: 'text-pink-500' },
                            { id: 5, label: 'Beta Pedigree', icon: Dna, color: 'text-orange-500' },
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
                                onClick={() => setDetailViewTab(tab.id)}
                                className={`flex-shrink-0 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded border transition-colors ${
                                    detailViewTab === tab.id 
                                        ? 'bg-primary text-black border-gray-400' 
                                        : 'bg-gray-50 text-gray-600 hover:text-gray-800 border-gray-300'
                                }`}
                                title={tab.label}
                            >
                                {React.createElement(tab.icon, { size: 14, className: `inline-block align-middle flex-shrink-0 mr-1.5 ${tab.color || ''}` })}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content - COPY OF PRIVATE DETAIL (no edit/delete/privacy toggle in Tab 1) */}
                <div className="bg-white border border-t-0 border-gray-300 rounded-b-lg p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Tab 1: Overview - NO PRIVACY TOGGLE */}
                    {detailViewTab === 1 && (
                        <div className="space-y-3">
                            {/* Main info card */}
                            <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    {/* Left: Photo + status + badges */}
                                    <div className="w-full md:w-1/4 p-4 flex flex-col items-center gap-2 border-b md:border-b-0 md:border-r border-gray-300">
                                        <div className="relative w-full flex justify-center">
                                            <div className="absolute top-0 right-0">
                                                {animal.gender === 'Male' ? <Mars size={16} strokeWidth={2.5} className="text-blue-600" /> : animal.gender === 'Female' ? <Venus size={16} strokeWidth={2.5} className="text-pink-600" /> : animal.gender === 'Intersex' ? <VenusAndMars size={16} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={16} strokeWidth={2.5} className="text-gray-500" />}
                                            </div>
                                            {(animal.imageUrl || animal.photoUrl) ? (
                                                <img
                                                    src={animal.imageUrl || animal.photoUrl}
                                                    alt={animal.name}
                                                    className="w-28 h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                                                    onClick={() => {
                                                        if (setEnlargedImageUrl && setShowImageModal) {
                                                            setEnlargedImageUrl(animal.imageUrl || animal.photoUrl);
                                                            setShowImageModal(true);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                    <Cat size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm font-medium text-gray-700">
                                            {animal.breederId_public && animal.ownerId_public && animal.breederId_public !== animal.ownerId_public ? (
                                                <div className="space-y-0.5 text-center">
                                                    <div>Sold</div>
                                                    {animal.status && <div>{animal.status}</div>}
                                                </div>
                                            ) : (
                                                <span>{animal.status || 'Unknown'}</span>
                                            )}
                                        </div>
                                        {animal.isForSale && (
                                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Tag size={11} /> For Sale{animal.salePriceCurrency !== 'Negotiable' && animal.salePriceAmount ? ` · ${getCurrencySymbol(animal.salePriceCurrency)}${animal.salePriceAmount}` : ''}
                                            </span>
                                        )}
                                        {animal.availableForBreeding && (
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Tag size={11} /> Stud{animal.studFeeCurrency !== 'Negotiable' && animal.studFeeAmount ? ` · ${getCurrencySymbol(animal.studFeeCurrency)}${animal.studFeeAmount}` : ''}
                                            </span>
                                        )}
                                        {animal.tags && animal.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {animal.tags.map((tag, idx) => (
                                                    <span key={idx} className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Right: All info */}
                                    <div className="flex-1 p-4 space-y-2">
                                        {/* Species/CTC row */}
                                        <p className="text-sm text-gray-500">
                                            {animal.species || 'Unknown'}
                                            {animal.breed && ` \u2022 ${animal.breed}`}
                                            {animal.strain && ` \u2022 ${animal.strain}`}
                                            {animal.id_public && ` \u2022 ${animal.id_public}`}
                                        </p>
                                        {/* Name */}
                                        <h2 className="text-xl font-bold text-gray-800 leading-tight">
                                            {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                                        </h2>
                                        {/* DOB + age */}
                                        {animal.birthDate && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Born:</span> {formatDate(animal.birthDate)} {(() => {
                                                    const birth = new Date(animal.birthDate);
                                                    const endDate = animal.deceasedDate ? new Date(animal.deceasedDate) : new Date();
                                                    let years = endDate.getFullYear() - birth.getFullYear();
                                                    let months = endDate.getMonth() - birth.getMonth();
                                                    let days = endDate.getDate() - birth.getDate();
                                                    if (days < 0) { months--; days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate(); }
                                                    if (months < 0) { years--; months += 12; }
                                                    const ageStr = years > 0 ? `${years}y ${months}m ${days}d` : (months > 0 ? `${months}m ${days}d` : `${days}d`);
                                                    if (animal.deceasedDate) {
                                                        return <span className="text-red-600 font-semibold ml-2">{"†"} {formatDate(animal.deceasedDate)} (Lived {ageStr})</span>;
                                                    } else {
                                                        return <span>(~{ageStr})</span>;
                                                    }
                                                })()}
                                            </p>
                                        )}
                                        {/* Variety */}
                                        {[animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).length > 0 && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Variety:</span> {[animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).join(' ')}
                                            </p>
                                        )}
                                        {animal.carrierTraits && (
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Carrier:</span> {animal.carrierTraits}</p>
                                        )}
                                        {animal.geneticCode && (
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Genetic Code:</span> <code className="bg-gray-100 px-1 rounded font-mono">{animal.geneticCode}</code></p>
                                        )}
                                        {animal.remarks && (
                                            <p className="text-sm text-gray-700 line-clamp-2"><span className="font-semibold">Remarks:</span> {animal.remarks}</p>
                                        )}
                                        {/* Breeder + IDs */}
                                        <div className="border-t border-gray-200 pt-2 space-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">Breeder:</span>{' '}
                                                {breederInfo ? (() => {
                                                    const showPersonal = breederInfo.showPersonalName ?? false;
                                                    const showBreeder = breederInfo.showBreederName ?? false;
                                                    let bDisplayName;
                                                    if (showPersonal && showBreeder && breederInfo.personalName && breederInfo.breederName) {
                                                        bDisplayName = `${breederInfo.personalName} (${breederInfo.breederName})`;
                                                    } else if (showBreeder && breederInfo.breederName) {
                                                        bDisplayName = breederInfo.breederName;
                                                    } else if (showPersonal && breederInfo.personalName) {
                                                        bDisplayName = breederInfo.personalName;
                                                    } else {
                                                        bDisplayName = 'Unknown Breeder';
                                                    }
                                                    return <RouterLink to={`/user/${breederInfo.id_public}`} className="text-blue-600 hover:underline font-semibold">{bDisplayName}</RouterLink>;
                                                })() : <span className="font-mono text-accent">{animal.manualBreederName || animal.breederId_public || '\u2014'}</span>}
                                            </div>
                                            {(animal.breederAssignedId || animal.microchipNumber || animal.pedigreeRegistrationId) && (
                                                <hr className="border-gray-200" />
                                            )}
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                {animal.breederAssignedId && <div><span className="text-gray-500">Assigned ID:</span> <strong>{animal.breederAssignedId}</strong></div>}
                                                {animal.microchipNumber && <div><span className="text-gray-500">Microchip:</span> <strong>{animal.microchipNumber}</strong></div>}
                                                {animal.pedigreeRegistrationId && <div><span className="text-gray-500">Pedigree Reg:</span> <strong>{animal.pedigreeRegistrationId}</strong></div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Parents */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Parents</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <ViewOnlyParentCard
                                        parentId={animal.fatherId_public || animal.sireId_public}
                                        parentType="Sire"
                                        API_BASE_URL={API_BASE_URL}
                                        onViewAnimal={onViewAnimal}
                                        authToken={authToken}
                                    />
                                    <ViewOnlyParentCard
                                        parentId={animal.motherId_public || animal.damId_public}
                                        parentType="Dam"
                                        API_BASE_URL={API_BASE_URL}
                                        onViewAnimal={onViewAnimal}
                                        authToken={authToken}
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
                                <h3 className="text-lg font-semibold text-gray-700"><Users size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Ownership</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Currently Owned:</span>
                                        <strong>{animal.isOwned ? 'Yes' : 'No'}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Breeder:</span>
                                        {breederInfo
                                            ? <RouterLink to={`/user/${breederInfo.id_public}`} className="text-blue-600 hover:underline font-semibold">{breederInfo.breederName || breederInfo.personalName || 'Unknown'}</RouterLink>
                                            : <strong>{animal.manualBreederName || animal.breederId_public || ''}</strong>}
                                    </div>
                                </div>
                            </div>

                            {/* 2nd Section: Current Owner */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Keeper</h3>
                                <div className="text-sm space-y-2">
                                    {(animal.keeperName || animal.isOwned) && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Keeper Name:</span>
                                        <strong>{animal.keeperName || (animal.isOwned ? 'Me' : '')}</strong>
                                    </div>
                                    )}
                                    {animal.coOwnership && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">Co-Ownership:</span>
                                            <strong>{animal.coOwnership}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3rd Section: Keeper History */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Keeper History</h3>
                                {(animal.keeperHistory || []).length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No entries yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {(animal.keeperHistory || []).map((entry, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800">{entry.name || 'Unknown'}</p>
                                                    {entry.userId_public && <p className="text-xs text-gray-400 font-mono">{entry.userId_public}</p>}
                                                </div>
                                                {entry.country && (
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <span className={`${getCountryFlag(entry.country)} inline-block h-4 w-6`}></span>
                                                        <span className="text-xs text-gray-500">{getCountryName(entry.country)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 4th Section: Availability for Sale or Stud */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Tag size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Availability for Sale or Stud</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">For Sale:</span>
                                        <strong>{animal.isForSale ? `Yes - ${animal.salePriceCurrency || ''} ${animal.salePriceAmount || 'Negotiable'}`.trim() : 'No'}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">For Stud:</span>
                                        <strong>{animal.availableForBreeding ? `Yes - ${animal.studFeeCurrency || ''} ${animal.studFeeAmount || 'Negotiable'}`.trim() : 'No'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Appearance */}
                    {detailViewTab === 4 && (
                        <div className="space-y-6">
                            {/* Appearance */}
                            {(() => {
                                const fields = [
                                    { key: 'color', label: 'Color' },
                                    { key: 'coatPattern', label: 'Pattern' },
                                    { key: 'coat', label: 'Coat Type' },
                                    { key: 'earset', label: 'Earset' },
                                    { key: 'phenotype', label: 'Phenotype' },
                                    { key: 'morph', label: 'Morph' },
                                    { key: 'markings', label: 'Markings' },
                                    { key: 'eyeColor', label: 'Eye Color' },
                                    { key: 'nailColor', label: 'Nail/Claw Color' },
                                    { key: 'size', label: 'Size' },
                                    { key: 'carrierTraits', label: 'Carrier Traits' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return fields.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Sparkles size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Appearance</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {fields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Genetic Code */}
                            {fieldTemplate?.fields?.geneticCode?.enabled !== false && animal.geneticCode && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Dna size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> {getLabel('geneticCode', 'Genetic Code')}</h3>
                                    <p className="text-gray-700 font-mono text-sm break-all">{animal.geneticCode}</p>
                                </div>
                            )}

                            {/* Life Stage */}
                            {fieldTemplate?.fields?.lifeStage?.enabled !== false && animal.lifeStage && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Sprout size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> {getLabel('lifeStage', 'Life Stage')}</h3>
                                    <p className="text-gray-700 text-sm">{animal.lifeStage}</p>
                                </div>
                            )}

                            {/* Measurements */}
                            {(() => {
                                const mFields = [
                                    { key: 'bodyWeight', label: 'Weight' },
                                    { key: 'bodyLength', label: 'Body Length' },
                                    { key: 'heightAtWithers', label: 'Height at Withers' },
                                    { key: 'chestGirth', label: 'Chest Girth' },
                                    { key: 'adultWeight', label: 'Adult Weight' },
                                    { key: 'bodyConditionScore', label: 'Body Condition Score' },
                                    { key: 'length', label: 'Length' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return mFields.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Ruler size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Measurements</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {mFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tab 3: Identification */}
                    {detailViewTab === 3 && (
                        <div className="space-y-6">
                            {/* Identification Numbers */}
                            {(() => {
                                const idFields = [
                                    { key: 'breederAssignedId', label: 'Identification' },
                                    { key: 'microchipNumber', label: 'Microchip Number' },
                                    { key: 'pedigreeRegistrationId', label: 'Pedigree Registration ID' },
                                    { key: 'colonyId', label: 'Colony ID' },
                                    { key: 'rabiesTagNumber', label: 'Rabies Tag Number' },
                                    { key: 'tattooId', label: 'Tattoo ID' },
                                    { key: 'akcRegistrationNumber', label: 'AKC Registration #' },
                                    { key: 'fciRegistrationNumber', label: 'FCI Registration #' },
                                    { key: 'cfaRegistrationNumber', label: 'CFA Registration #' },
                                    { key: 'workingRegistryIds', label: 'Working Registry IDs' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Hash size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Identification Numbers</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div><span className="text-gray-600">CritterTrack ID:</span> <strong>{animal.id_public || ''}</strong></div>
                                            {idFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Classification */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><FolderOpen size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Classification</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Species:</span> <strong>{animal.species || ''}</strong></div>
                                    {fieldTemplate?.fields?.breed?.enabled !== false && animal.breed && (
                                        <div><span className="text-gray-600">{getLabel('breed', 'Breed')}:</span> <strong>{animal.breed}</strong></div>
                                    )}
                                    {fieldTemplate?.fields?.strain?.enabled !== false && animal.strain && (
                                        <div><span className="text-gray-600">{getLabel('strain', 'Strain')}:</span> <strong>{animal.strain}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* Tags */}
                            {animal.tags && animal.tags.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Tag size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {animal.tags.map((tag, idx) => (
                                            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Breeding Lines */}
                            {(() => {
                                const namedLines = breedingLineDefs.filter(l => l.name);
                                if (namedLines.length === 0 || !toggleAnimalBreedingLine) return null;
                                const assignedIds = animalBreedingLines[animal.id_public] || [];
                                return (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-1.5"><TableOfContents size={16} className="flex-shrink-0 text-gray-400" /> Breeding Lines</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {namedLines.map(l => {
                                                const assigned = assignedIds.includes(l.id);
                                                return (
                                                    <button key={l.id} type="button"
                                                        onClick={() => toggleAnimalBreedingLine(animal.id_public, l.id)}
                                                        style={{ borderColor: l.color, color: assigned ? '#fff' : l.color, backgroundColor: assigned ? l.color : 'transparent' }}
                                                        className="flex items-center gap-1.5 px-3 py-1 rounded-full border-2 text-sm font-medium transition"
                                                    ><span>&#x25C6;</span> {l.name}</button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Origin */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Globe size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Origin</h3>
                                <p className="text-sm text-gray-700">{animal.origin || ''}</p>
                            </div>
                        </div>
                    )}

                    {/* Tab 6: Family */}
                    {detailViewTab === 6 && (
                        <div className="space-y-6">
                            {/* Pedigree link */}
                            <div>
                                <span className="text-xs text-orange-500 font-medium">&#x1F4CA; Pedigree chart available on the <button onClick={() => setDetailViewTab(5)} className="underline hover:text-orange-600 transition">Beta Pedigree</button> tab</span>
                            </div>

                            {/* 2nd Section: Keeper History */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Keeper History</h3>
                                {(animal.keeperHistory || []).length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No entries yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {(animal.keeperHistory || []).map((entry, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800">{entry.name || 'Unknown'}</p>
                                                    {entry.userId_public && <p className="text-xs text-gray-400 font-mono">{entry.userId_public}</p>}
                                                </div>
                                                {entry.country && (
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <span className={`${getCountryFlag(entry.country)} inline-block h-4 w-6`}></span>
                                                        <span className="text-xs text-gray-500">{getCountryName(entry.country)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 2nd Section: Offspring & Litters - merged litters + pedigree offspring */}
                            {(animalLitters === null || pedigreeOffspring === null) ? (
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <div className="text-sm text-gray-500 animate-pulse">Loading offspring & litters?</div>
                                </div>
                            ) : (() => {
                                const litterItems = (animalLitters || []).map(l => ({ ...l, _recordType: 'litter' }));
                                const pedItems = (pedigreeOffspring || []).map(l => ({ ...l, _recordType: 'pedigree' }));
                                const today2 = new Date();
                                const allRecords = [...litterItems, ...pedItems].sort((a, b) => {
                                    const aIsMated = a.isPlanned && a.matingDate && new Date(a.matingDate) <= today2;
                                    const bIsMated = b.isPlanned && b.matingDate && new Date(b.matingDate) <= today2;
                                    const aRank = aIsMated ? 0 : a.isPlanned ? 1 : 2;
                                    const bRank = bIsMated ? 0 : b.isPlanned ? 1 : 2;
                                    if (aRank !== bRank) return aRank - bRank;
                                    const aDate = a.birthDate || a.matingDate;
                                    const bDate = b.birthDate || b.matingDate;
                                    if (!aDate) return 1;
                                    if (!bDate) return -1;
                                    return new Date(bDate) - new Date(aDate);
                                });
                                if (allRecords.length === 0) return null;
                                return (
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-3">
                                        <h3 className="text-lg font-semibold text-gray-700 flex items-center"><Users size={20} className="text-purple-600 mr-2" />Offspring & Litters</h3>
                                        <div className="space-y-2">
                                            {allRecords.map((litter) => {
                                                if (litter._recordType === 'litter') {
                                                    const lid = litter.litter_id_public;
                                                    const isSire = litter.sireId_public === animal.id_public;
                                                    const mate = isSire ? litter.dam : litter.sire;
                                                    const isExpanded = expandedBreedingRecords[lid];
                                                    const displayName = litter.breedingPairCodeName;
                                                    const lIsMated = litter.isPlanned && litter.matingDate && new Date(litter.matingDate) <= today2;
                                                    const lIsPlannedOnly = litter.isPlanned && !lIsMated;
                                                    return (
                                                        <div key={lid} className={`bg-white rounded border transition-all ${isExpanded ? 'border-purple-300 shadow-md' : 'border-purple-100'}`}>
                                                            <div
                                                                onClick={() => setExpandedBreedingRecords({...expandedBreedingRecords, [lid]: !isExpanded})}
                                                                className="p-2 sm:p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition rounded"
                                                            >
                                                                {/* Mobile: stacked */}
                                                                <div className="flex-1 sm:hidden">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <p className="font-bold text-gray-800 text-sm">{displayName || <span className="text-gray-400 font-normal">Unnamed Litter</span>}</p>
                                                                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                                            {lid && <span className="text-xs font-mono bg-purple-100 px-1.5 py-0.5 rounded text-purple-700">{lid}</span>}
                                                                            {lIsPlannedOnly && <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5"><Hourglass size={12} className="inline-block align-middle mr-0.5" /> Planned</span>}
                                                                            {lIsMated && <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5"><Heart size={12} className="inline-block align-middle mr-0.5" /> Mated</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 flex gap-2 flex-wrap items-center">
                                                                        {!litter.isPlanned && litter.birthDate && <span>{formatDate(litter.birthDate)}{litterAge(litter.birthDate) && <span className="ml-1 font-semibold text-green-600">? {litterAge(litter.birthDate)}</span>}</span>}
                                                                        {lIsMated && <span className="text-purple-600">{formatDate(litter.matingDate)}</span>}
                                                                        {lIsPlannedOnly && litter.matingDate && <span className="text-indigo-600">{formatDate(litter.matingDate)}</span>}
                                                                        {mate?.name && <span className="truncate max-w-[120px]">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</span>}
                                                                        {litter.inbreedingCoefficient != null && <span className="text-gray-500">{litter.inbreedingCoefficient.toFixed(2)}%</span>}
                                                                        {!litter.isPlanned && (litter.litterSizeBorn != null || litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && (
                                                                            <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                                                                {litter.litterSizeBorn != null && <span className="font-bold text-gray-900">{litter.litterSizeBorn}</span>}
                                                                                {litter.litterSizeBorn != null && (litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && <span className="text-gray-400">•</span>}
                                                                                {(litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && (
                                                                                    <span className="inline-flex gap-0.5 font-semibold">
                                                                                        <span className="text-blue-500">{litter.maleCount ?? 0}M</span>
                                                                                        <span className="text-gray-400">/</span>
                                                                                        <span className="text-pink-500">{litter.femaleCount ?? 0}F</span>
                                                                                        <span className="text-gray-400">/</span>
                                                                                        <span className="text-purple-500">{litter.unknownCount ?? 0}U</span>
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {/* Desktop: 6-column grid */}
                                                                <div className="hidden sm:grid flex-1 grid-cols-6 gap-3 items-center min-w-0">
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold text-gray-800 text-sm truncate">{displayName || <span className="text-gray-400 font-normal text-xs">Unnamed</span>}</p>
                                                                        {lIsPlannedOnly && <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5 inline-block mt-0.5"><Hourglass size={12} className="inline-block align-middle mr-0.5" /> Planned</span>}
                                                                        {lIsMated && <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5 inline-block mt-0.5"><Heart size={12} className="inline-block align-middle mr-0.5" /> Mated</span>}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        {lid ? <span className="text-xs font-mono bg-purple-100 px-2 py-0.5 rounded text-purple-700 block w-fit">{lid}</span> : <span className="text-xs text-gray-400">•</span>}
                                                                    </div>
                                                                    <div>
                                                                        {lIsPlannedOnly ? (<>
                                                                            <span className="text-indigo-400 text-[10px] uppercase tracking-wide font-semibold block">Planned</span>
                                                                            <span className="text-sm font-semibold text-indigo-700">{formatDate(litter.matingDate) || '?'}</span>
                                                                        </>) : lIsMated ? (<>
                                                                            <span className="text-purple-400 text-[10px] uppercase tracking-wide font-semibold block">Mated</span>
                                                                            <span className="text-sm font-semibold text-purple-700">{formatDate(litter.matingDate) || '?'}</span>
                                                                        </>) : (<>
                                                                            <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Birth</span>
                                                                            <span className="text-sm font-semibold text-gray-800">{formatDate(litter.birthDate) || '?'}{litter.birthDate && litterAge(litter.birthDate) && <span className="ml-1 text-xs font-semibold text-green-600">• {litterAge(litter.birthDate)}</span>}</span>
                                                                        </>)}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Mate</span>
                                                                        <span className="text-sm font-semibold text-gray-800 truncate block">{mate ? [mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ') : '•'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">COI</span>
                                                                        <span className="text-sm font-semibold text-gray-800">{litter.inbreedingCoefficient != null ? `${litter.inbreedingCoefficient.toFixed(2)}%` : '•'}</span>
                                                                    </div>
                                                                    <div>
                                                                        {lIsPlannedOnly ? (<>
                                                                            <span className="text-indigo-400 text-[10px] uppercase tracking-wide font-semibold block">Due</span>
                                                                            <span className="text-sm font-semibold text-indigo-700">{formatDate(litter.expectedDueDate) || '•'}</span>
                                                                        </>) : lIsMated ? (<>
                                                                            <span className="text-purple-400 text-[10px] uppercase tracking-wide font-semibold block">Status</span>
                                                                            <span className="text-xs font-semibold text-purple-500">Awaiting birth</span>
                                                                        </>) : (<>
                                                                            <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Born</span>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-sm font-bold text-gray-800">{litter.litterSizeBorn ?? litter.numberBorn ?? 0}</span>
                                                                                {(litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && (
                                                                                    <span className="text-xs ml-1">
                                                                                        <span className="text-blue-500 font-semibold">{litter.maleCount ?? 0}M</span>
                                                                                        <span className="text-gray-400 mx-0.5">/</span>
                                                                                        <span className="text-pink-500 font-semibold">{litter.femaleCount ?? 0}F</span>
                                                                                        <span className="text-gray-400 mx-0.5">/</span>
                                                                                        <span className="text-purple-500 font-semibold">{litter.unknownCount ?? 0}U</span>
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </>)}
                                                                    </div>
                                                                </div>
                                                                <ChevronDown size={18} className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`} />
                                                            </div>
                                                            {isExpanded && (
                                                                <div className="border-t border-purple-100 p-3 bg-purple-50 space-y-3">
                                                                    {/* -- 1. Name+CTL | COI | Mate ----------------------------- */}
                                                                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-start sm:items-center">
                                                                        {/* Left: Litter Name + CTL ID */}
                                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm h-full grid grid-cols-2 divide-x divide-gray-200 gap-3">
                                                                            <div>
                                                                                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Litter Name</div>
                                                                                {displayName
                                                                                    ? <div className="text-sm font-bold text-gray-800">{displayName}</div>
                                                                                    : <div className="text-sm text-gray-400 italic">•</div>}
                                                                            </div>
                                                                            <div className="pl-3">
                                                                                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">CTL ID</div>
                                                                                {lid
                                                                                    ? <div className="font-mono text-sm font-bold text-purple-700">{lid}</div>
                                                                                    : <div className="text-sm text-gray-400 italic">•</div>}
                                                                            </div>
                                                                        </div>
                                                                        {/* Center: COI */}
                                                                        <div className="flex flex-col items-center px-2">
                                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">COI</div>
                                                                            {litter.inbreedingCoefficient != null
                                                                                ? <div className="text-base font-medium text-gray-800">{litter.inbreedingCoefficient.toFixed(2)}%</div>
                                                                                : <div className="text-base font-medium text-gray-300">•</div>}
                                                                        </div>
                                                                        {/* Right: Mate card */}
                                                                        {mate ? (
                                                                            <div onClick={() => onViewAnimal && onViewAnimal(mate)} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition shadow-sm">
                                                                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                                    {mate.imageUrl || mate.photoUrl
                                                                                        ? <img src={mate.imageUrl || mate.photoUrl} alt={mate.name} className="w-full h-full object-cover" />
                                                                                        : <div className="w-full h-full flex items-center justify-center text-gray-400"><Cat size={18} /></div>}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mate</div>
                                                                                    <p className="font-bold text-gray-800 truncate text-sm">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ') || '•'}</p>
                                                                                    <p className="text-xs text-gray-500">{mate.species || '•'}</p>
                                                                                    <p className="text-[10px] text-gray-400 font-mono">{mate.id_public || '•'}</p>
                                                                                </div>
                                                                            </div>
                                                                        ) : <div />}
                                                                    </div>
                                                                    {/* -- 2. Breeding & Birth ---------------------------------- */}
                                                                    {(litter.matingDate || litter.pairingDate || litter.breedingMethod || litter.breedingConditionAtTime || litter.outcome || litter.birthDate || litter.birthMethod || litter.expectedDueDate || litter.weaningDate) && (
                                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                                            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Breeding &amp; Birth</h4>
                                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                                                                                {(litter.matingDate || litter.pairingDate) && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mating Date</div><div className="font-semibold text-gray-800">{formatDate(litter.matingDate || litter.pairingDate)}</div></div>}
                                                                                {litter.expectedDueDate && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Expected Due Date</div><div className="font-semibold text-gray-800">{formatDate(litter.expectedDueDate)}</div></div>}
                                                                                {litter.breedingMethod && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Breeding Method</div><div className="font-semibold text-gray-800">{litter.breedingMethod}</div></div>}
                                                                                {litter.breedingConditionAtTime && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Breeding Condition</div><div className="font-semibold text-gray-800">{litter.breedingConditionAtTime}</div></div>}
                                                                                {litter.outcome && !(litter.isPlanned && litter.outcome === 'Unknown') && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Outcome</div><div className={`font-semibold ${litter.outcome === 'Successful' ? 'text-green-600' : litter.outcome === 'Unsuccessful' ? 'text-red-500' : 'text-gray-800'}`}>{litter.outcome}</div></div>}
                                                                                {!litter.isPlanned && litter.birthMethod && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Birth Method</div><div className="font-semibold text-gray-800">{litter.birthMethod}</div></div>}
                                                                                {!litter.isPlanned && litter.birthDate && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Birth Date</div><div className="font-semibold text-gray-800">{formatDate(litter.birthDate)}{litterAge(litter.birthDate) && <span className="ml-2 text-xs font-semibold text-green-600">{litterAge(litter.birthDate)}</span>}</div></div>}
                                                                                {!litter.isPlanned && litter.weaningDate && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Weaning Date</div><div className="font-semibold text-gray-800">{formatDate(litter.weaningDate)}</div></div>}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {/* -- 3. Stats bar ----------------------------------------- */}
                                                                    {!litter.isPlanned && <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                                        <div className="grid grid-cols-2 divide-x divide-gray-200">
                                                                            <div className="grid grid-cols-3 pr-3">
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Born</div><div className="text-lg font-bold text-gray-800">{litter.litterSizeBorn ?? litter.numberBorn ?? 0}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Stillborn</div><div className="text-lg font-bold text-gray-400">{litter.stillbornCount ?? litter.stillborn ?? 0}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Weaned</div><div className="text-lg font-bold text-green-600">{litter.litterSizeWeaned ?? litter.numberWeaned ?? 0}</div></div>
                                                                            </div>
                                                                            <div className="grid grid-cols-3 pl-3">
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Males</div><div className="text-lg font-bold text-blue-500">{litter.maleCount ?? 0}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Females</div><div className="text-lg font-bold text-pink-500">{litter.femaleCount ?? 0}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Unknown</div><div className="text-lg font-bold text-purple-500">{litter.unknownCount ?? 0}</div></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>}
                                                                    {/* -- 4. Notes --------------------------------------------- */}
                                                                    {litter.notes && <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm"><h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</h4><p className="text-sm text-gray-700 italic leading-relaxed">{litter.notes}</p></div>}
                                                                    {/* -- 4b. Photos ----------------------------------------- */}
                                                                    {!litter.isPlanned && litter.images && litter.images.length > 0 && (
                                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                                            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Photos</h4>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {litter.images.map((img, idx) => (
                                                                                    <div key={img.r2Key || idx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                                                                        <img src={img.url} alt={"Gallery " + (idx + 1)} className="w-full h-full object-cover cursor-pointer" onClick={() => window.open(img.url, '_blank')} />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {/* -- 5. Linked Offspring ---------------------------------- */}
                                                                    {lid && breedingRecordOffspring[lid] === undefined && (
                                                                        <div className="bg-white p-3 rounded border border-purple-100">
                                                                            <div className="text-sm font-semibold text-gray-700 mb-3">Offspring</div>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                                                {[...Array(3)].map((_, i) => (
                                                                                    <div key={i} className="rounded-lg border-2 border-gray-200 h-52 animate-pulse bg-gray-50 flex flex-col items-center pt-2">
                                                                                        <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                                            <div className="w-20 h-20 bg-gray-200 rounded-md" />
                                                                                        </div>
                                                                                        <div className="w-full px-2 pb-2">
                                                                                            <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-1" />
                                                                                            <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto" />
                                                                                        </div>
                                                                                        <div className="w-full bg-gray-100 py-1 border-t border-gray-200 mt-auto" />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {lid && breedingRecordOffspring[lid] && breedingRecordOffspring[lid].length > 0 && (
                                                                        <div className="bg-white p-3 rounded border border-purple-100">
                                                                            <div className="text-sm font-semibold text-gray-700 mb-3">Offspring ({breedingRecordOffspring[lid].length})</div>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                                                {breedingRecordOffspring[lid].map(offspring => (
                                                                                    offspring.isPrivate ? (
                                                                                        <div key={offspring.id_public} className="relative bg-gray-50 rounded-lg border-2 border-gray-200 h-52 flex flex-col items-center overflow-hidden pt-2">
                                                                                            <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                                                <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-2xl">??</div>
                                                                                            </div>
                                                                                            <div className="w-full text-center px-2 pb-1">
                                                                                                <div className="text-sm font-semibold text-gray-500 truncate">Private Animal</div>
                                                                                            </div>
                                                                                            <div className="w-full px-2 pb-2 flex justify-end">
                                                                                                <div className="text-xs text-gray-400 font-mono">{offspring.id_public}</div>
                                                                                            </div>
                                                                                            <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                                                                                <div className="text-xs font-medium text-gray-500">{offspring.gender || '?'}</div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div key={offspring.id_public} onClick={() => onViewAnimal && onViewAnimal(offspring)} className="relative bg-white rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 border-gray-200 pt-2">
                                                                                            {offspring.gender && (
                                                                                                <div className="absolute top-1.5 right-1.5">
                                                                                                    {offspring.gender === 'Male'
                                                                                                        ? <Mars size={14} strokeWidth={2.5} className="text-primary" />
                                                                                                        : <Venus size={14} strokeWidth={2.5} className="text-accent" />
                                                                                                    }
                                                                                                </div>
                                                                                            )}
                                                                                            <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                                                {offspring.imageUrl || offspring.photoUrl ? (
                                                                                                    <img src={offspring.imageUrl || offspring.photoUrl} alt={offspring.name} className="w-20 h-20 object-cover rounded-md" />
                                                                                                ) : (
                                                                                                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                                                                        <Cat size={32} />
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="w-full text-center px-2 pb-1">
                                                                                                <div className="text-sm font-semibold text-gray-800 truncate">
                                                                                                    {[offspring.prefix, offspring.name, offspring.suffix].filter(Boolean).join(' ')}
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="w-full px-2 pb-2 flex justify-end">
                                                                                                <div className="text-xs text-gray-500">{offspring.id_public}</div>
                                                                                            </div>
                                                                                            <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                                                                                <div className="text-xs font-medium text-gray-700">{offspring.status || offspring.gender || 'Unknown'}</div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                } else {
                                                    // Pedigree-only record (no CTL/litter management entry)
                                                    const recKey = `${litter.birthDate || 'unknown'}_${litter.otherParent?.id_public || 'none'}`;
                                                    const mate = litter.otherParent;
                                                    const isExpanded = expandedPedigreeRecords[recKey];
                                                    const offspringList = litter.offspring || [];
                                                    const maleCount = offspringList.filter(o => o.gender === 'Male').length;
                                                    const femaleCount = offspringList.filter(o => o.gender === 'Female').length;
                                                    const unknownCount = offspringList.filter(o => o.gender !== 'Male' && o.gender !== 'Female').length;
                                                    const coi = offspringList.find(o => o.inbreedingCoefficient != null)?.inbreedingCoefficient ?? null;
                                                    return (
                                                        <div key={recKey} className={`bg-white rounded border transition-all ${isExpanded ? 'border-purple-300 shadow-md' : 'border-purple-100'}`}>
                                                            <div
                                                                onClick={() => setExpandedPedigreeRecords({...expandedPedigreeRecords, [recKey]: !isExpanded})}
                                                                className="p-2 sm:p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition rounded"
                                                            >
                                                                {/* Mobile: stacked */}
                                                                <div className="flex-1 sm:hidden">
                                                                    <div className="text-xs text-gray-600 flex gap-2 flex-wrap items-center">
                                                                        {litter.birthDate && <span>{formatDate(litter.birthDate)}</span>}
                                                                        {mate?.name && <span className="truncate max-w-[120px]">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</span>}
                                                                        <span>{offspringList.length} born</span>
                                                                        {coi != null && <span className="text-gray-500">COI {coi.toFixed(2)}%</span>}
                                                                        {offspringList.length > 0 && (
                                                                            <span className="inline-flex gap-0.5 font-semibold">
                                                                                    <span className="text-blue-500">{maleCount}M</span>
                                                                                    <span className="text-gray-400">/</span>
                                                                                    <span className="text-pink-500">{femaleCount}F</span>
                                                                                    <span className="text-gray-400">/</span>
                                                                                    <span className="text-purple-500">{unknownCount}U</span>
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {/* Desktop: 4-column grid */}
                                                                <div className="hidden sm:grid flex-1 grid-cols-4 gap-3 items-center min-w-0">
                                                                    <div>
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Birth</span>
                                                                        <span className="text-sm font-semibold text-gray-800">{formatDate(litter.birthDate) || '?'}</span>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Mate</span>
                                                                        <span className="text-sm font-semibold text-gray-800 truncate block">{mate ? [mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ') : '?'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">COI</span>
                                                                        <span className="text-sm font-semibold text-gray-800">{coi != null ? `${coi.toFixed(2)}%` : '?'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Born</span>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-sm font-bold text-gray-800">{offspringList.length}</span>
                                                                            {offspringList.length > 0 && (
                                                                                <span className="text-xs ml-1">
                                                                                    <span className="text-blue-500 font-semibold">{maleCount}M</span>
                                                                                    <span className="text-gray-400 mx-0.5">/</span>
                                                                                    <span className="text-pink-500 font-semibold">{femaleCount}F</span>
                                                                                    <span className="text-gray-400 mx-0.5">/</span>
                                                                                    <span className="text-purple-500 font-semibold">{unknownCount}U</span>
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <ChevronDown size={18} className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`} />
                                                            </div>
                                                            {isExpanded && (
                                                                <div className="border-t border-purple-100 p-3 bg-purple-50 space-y-3">
                                                                    {/* -- 1. Birthdate | COI | Mate ----------------------------- */}
                                                                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-start sm:items-center">
                                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm h-full">
                                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Birth Date</div>
                                                                            {litter.birthDate
                                                                                ? <div className="text-sm font-bold text-gray-800">{formatDate(litter.birthDate)}</div>
                                                                                : <div className="text-sm text-gray-400 italic">?</div>}
                                                                        </div>
                                                                        <div className="flex flex-col items-center px-2">
                                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">COI</div>
                                                                            {coi != null ? <div className="text-base font-medium text-gray-800">{coi.toFixed(2)}%</div> : <div className="text-base font-medium text-gray-300">?</div>}
                                                                        </div>
                                                                        {mate ? (
                                                                            <div onClick={() => onViewAnimal && onViewAnimal(mate)} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition shadow-sm">
                                                                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                                    {mate.imageUrl || mate.photoUrl
                                                                                        ? <img src={mate.imageUrl || mate.photoUrl} alt={mate.name} className="w-full h-full object-cover" />
                                                                                        : <div className="w-full h-full flex items-center justify-center text-gray-400"><Cat size={18} /></div>}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mate</div>
                                                                                    <p className="font-bold text-gray-800 truncate text-sm">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</p>
                                                                                    <p className="text-xs text-gray-500">{mate.species}</p>
                                                                                    <p className="text-[10px] text-gray-400 font-mono">{mate.id_public}</p>
                                                                                </div>
                                                                            </div>
                                                                        ) : <div />}
                                                                    </div>
                                                                    {/* -- 2. Slim stats ---------------------------------------- */}
                                                                    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                                        <div className="grid grid-cols-4 gap-3">
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Born</div><div className="text-lg font-bold text-gray-800">{offspringList.length}</div></div>
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Males</div><div className="text-lg font-bold text-blue-500">{maleCount}</div></div>
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Females</div><div className="text-lg font-bold text-pink-500">{femaleCount}</div></div>
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Unknown</div><div className="text-lg font-bold text-purple-500">{unknownCount}</div></div>
                                                                        </div>
                                                                    </div>
                                                                    {/* -- 3. Offspring cards ----------------------------------- */}
                                                                    {offspringList.length > 0 && (
                                                                        <div className="bg-white p-3 rounded border border-purple-100">
                                                                            <div className="text-sm font-semibold text-gray-700 mb-3">Offspring ({offspringList.length})</div>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                                                {offspringList.map(offspring => (
                                                                                    <div key={offspring.id_public || offspring._id} onClick={() => onViewAnimal && onViewAnimal(offspring)} className="relative bg-white rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 border-gray-200 pt-2">
                                                                                        {offspring.gender && (
                                                                                            <div className="absolute top-1.5 right-1.5">
                                                                                                {offspring.gender === 'Male'
                                                                                                    ? <Mars size={14} strokeWidth={2.5} className="text-primary" />
                                                                                                    : <Venus size={14} strokeWidth={2.5} className="text-accent" />
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                        <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                                            {offspring.imageUrl || offspring.photoUrl ? (
                                                                                                <img src={offspring.imageUrl || offspring.photoUrl} alt={offspring.name} className="w-20 h-20 object-cover rounded-md" />
                                                                                            ) : (
                                                                                                <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                                                                    <Cat size={32} />
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="w-full text-center px-2 pb-1">
                                                                                            <div className="text-sm font-semibold text-gray-800 truncate">
                                                                                                {[offspring.prefix, offspring.name, offspring.suffix].filter(Boolean).join(' ')}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="w-full px-2 pb-2 flex justify-end">
                                                                                            <div className="text-xs text-gray-500">{offspring.id_public}</div>
                                                                                        </div>
                                                                                        <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                                                                            <div className="text-xs font-medium text-gray-700">{offspring.status || offspring.gender || 'Unknown'}</div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}

                        </div>
                    )}

                    {/* Tab 7: Fertility */}
                    {detailViewTab === 7 && (
                        <div className="space-y-6">
                            {/* 1st Section: Reproductive Status */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Leaf size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Reproductive Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Neutered/Spayed:</span> <strong>{animal.isNeutered ? 'Yes' : 'No'}</strong></div>
                                    <div><span className="text-gray-600">Infertile:</span> <strong>{animal.isInfertile ? 'Yes' : 'No'}</strong></div>
                                    {!animal.isNeutered && !animal.isInfertile && (
                                        <div><span className="text-gray-600">In Mating:</span> <strong>{animal.isInMating ? 'Yes' : 'No'}</strong></div>
                                    )}
                                    {(animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && !animal.isNeutered && (
                                        <>
                                            <div><span className="text-gray-600">{getLabel('isPregnant', 'Pregnant')}:</span> <strong>{animal.isPregnant ? 'Yes' : 'No'}</strong></div>
                                            <div><span className="text-gray-600">{getLabel('isNursing', 'Nursing')}:</span> <strong>{animal.isNursing ? 'Yes' : 'No'}</strong></div>
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
                                    <h3 className="text-lg font-semibold text-gray-700"><RefreshCw size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Estrus/Cycle</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Heat Status:</span> <strong>{animal.heatStatus || ''}</strong></div>
                                        <div><span className="text-gray-600">Last Heat Date:</span> <strong>{animal.lastHeatDate ? formatDate(animal.lastHeatDate) : ''}</strong></div>
                                        <div><span className="text-gray-600">{getLabel('ovulationDate', 'Ovulation Date')}:</span> <strong>{animal.ovulationDate ? formatDate(animal.ovulationDate) : ''}</strong></div>
                                        {animal.estrusCycleLength && (
                                            <div><span className="text-gray-600">Estrus Cycle Length:</span> <strong>{`${animal.estrusCycleLength} days`}</strong></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 4th Section: Stud Information */}
                            {!animal.isNeutered && !animal.isInfertile && (animal.gender === 'Male' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Mars size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Sire Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Fertility Status:</span> <strong>{animal.fertilityStatus || ''}</strong></div>
                                    </div>
                                    {animal.fertilityNotes && (
                                        <div className="text-sm"><span className="text-gray-600">Notes:</span> <strong className="whitespace-pre-wrap">{animal.fertilityNotes}</strong></div>
                                    )}
                                    {animal.reproductiveClearances && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Clearances:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveClearances}</strong></div>
                                    )}
                                    {animal.reproductiveComplications && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Complications:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveComplications}</strong></div>
                                    )}
                                </div>
                            )}

                            {/* 5th Section: Dam Information */}
                            {!animal.isNeutered && !animal.isInfertile && (animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Venus size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Dam Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">{getLabel('damFertilityStatus', 'Dam Fertility Status')}:</span> <strong>{animal.damFertilityStatus || animal.fertilityStatus || ''}</strong></div>
                                        {animal.gestationLength && (
                                            <div><span className="text-gray-600">{getLabel('gestationLength', 'Gestation Length')}:</span> <strong>{`${animal.gestationLength} days`}</strong></div>
                                        )}
                                        {animal.deliveryMethod && (
                                            <div><span className="text-gray-600">{getLabel('deliveryMethod', 'Delivery Method')}:</span> <strong>{animal.deliveryMethod}</strong></div>
                                        )}
                                        {animal.whelpingDate && (
                                            <div><span className="text-gray-600">{getLabel('whelpingDate', 'Whelping Date')}:</span> <strong>{formatDate(animal.whelpingDate)}</strong></div>
                                        )}
                                        {animal.queeningDate && (
                                            <div><span className="text-gray-600">{getLabel('queeningDate', 'Queening Date')}:</span> <strong>{formatDate(animal.queeningDate)}</strong></div>
                                        )}
                                    </div>
                                    {animal.damFertilityNotes && (
                                        <div className="text-sm"><span className="text-gray-600">Notes:</span> <strong className="whitespace-pre-wrap">{animal.damFertilityNotes}</strong></div>
                                    )}
                                    {animal.reproductiveClearances && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Clearances:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveClearances}</strong></div>
                                    )}
                                    {animal.reproductiveComplications && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Complications:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveComplications}</strong></div>
                                    )}
                                </div>
                            )}

                            {/* 6th Section: Breeding History */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center"><span className="text-blue-600 mr-2">??</span>Litter Records</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {(animal.gender === 'Male' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                        <>
                                            <div><span className="text-gray-600">{getLabel('lastMatingDate', 'Last Mating Date')}:</span> <strong>{animal.lastMatingDate ? formatDate(animal.lastMatingDate) : ''}</strong></div>
                                            </>
                                    )}
                                    {(animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                        <>
                                            <div><span className="text-gray-600">{getLabel('lastPregnancyDate', 'Last Pregnancy Date')}:</span> <strong>{animal.lastPregnancyDate ? formatDate(animal.lastPregnancyDate) : ''}</strong></div>
                                            <div><span className="text-gray-600">{getLabel('litterCount', 'Litter Count')}:</span> <strong>{animal.litterCount || ''}</strong></div>
                                        </>
                                    )}
                                    <div><span className="text-gray-600">Total Offspring:</span> <strong>{animal.offspringCount || ''}</strong></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 8: Health */}
                    {detailViewTab === 8 && (
                        <div className="space-y-6">
                            {/* 1st Section: Preventive Care */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, preventiveCare: !p.preventiveCare}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Shield size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Preventive Care</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.preventiveCare ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.preventiveCare && (<div className="space-y-4 mt-4">
                                    {animal.vaccinations && (
                                        <DetailJsonList
                                            label={getLabel('vaccinations', 'Vaccinations')}
                                            data={animal.vaccinations}
                                            renderItem={v => <>{v.name} {v.date && `(${formatDate(v.date)})`}{v.notes && <span className="text-gray-600"> - {v.notes}</span>}</>}
                                        />
                                    )}
                                    {animal.dewormingRecords && (
                                        <DetailJsonList
                                            label="Deworming Records"
                                            data={animal.dewormingRecords}
                                            renderItem={r => <>{r.medication} {r.date && `(${formatDate(r.date)})`}{r.notes && <span className="text-gray-600"> - {r.notes}</span>}</>}
                                        />
                                    )}
                                    {animal.parasiteControl && (
                                        <DetailJsonList
                                            label="Parasite Control"
                                            data={animal.parasiteControl}
                                            renderItem={r => <>{r.treatment} {r.date && `(${formatDate(r.date)})`}{r.notes && <span className="text-gray-600"> - {r.notes}</span>}</>}
                                        />
                                    )}
                                    {fieldTemplate?.fields?.parasitePreventionSchedule?.enabled !== false && animal.parasitePreventionSchedule && (
                                        <div className="text-sm">
                                            <span className="text-gray-600">{getLabel('parasitePreventionSchedule', 'Parasite Prevention Schedule')}:</span>
                                            <strong className="whitespace-pre-wrap">{animal.parasitePreventionSchedule}</strong>
                                        </div>
                                    )}
                                </div>)}
                            </div>

                            {/* 2nd Section: Procedures & Diagnostics */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, proceduresDiagnostics: !p.proceduresDiagnostics}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Microscope size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Procedures & Diagnostics</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.proceduresDiagnostics ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.proceduresDiagnostics && (<div className="space-y-4 mt-4">
                                    {animal.medicalProcedures && (
                                        <DetailJsonList
                                            label="Medical Procedures"
                                            data={animal.medicalProcedures}
                                            renderItem={p => <>{p.name} {p.date && `(${formatDate(p.date)})`}{p.notes && <span className="text-gray-600"> - {p.notes}</span>}</>}
                                        />
                                    )}
                                    {(animal.labResults || animal.laboratoryResults) && (
                                        <DetailJsonList
                                            label="Laboratory Results"
                                            data={animal.labResults || animal.laboratoryResults}
                                            renderItem={r => <>{r.testName} - {r.result} {r.date && `(${formatDate(r.date)})`}{r.notes && <span className="text-gray-600"> - {r.notes}</span>}</>}
                                        />
                                    )}
                                </div>)}
                            </div>

                            {/* 3rd Section: Active Medical Records */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, activeMedical: !p.activeMedical}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Pill size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Active Medical Records</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.activeMedical ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.activeMedical && (<div className="space-y-3 mt-4">
                                    {animal.medicalConditions && (() => {
                                        const d = animal.medicalConditions;
                                        const parsed = typeof d === 'string' ? (() => { try { return JSON.parse(d); } catch { return null; } })() : Array.isArray(d) ? d : null;
                                        return parsed && parsed.length > 0 ? (
                                            <div>
                                                <span className="text-gray-600 text-sm font-semibold">Medical Conditions:</span>
                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                    {parsed.map((item, i) => (
                                                        <li key={i} className="text-gray-700">
                                                            {item.condition || item.name}
                                                            {item.notes && <span className="text-gray-500"> ? {item.notes}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : <div><span className="text-gray-600 text-sm font-semibold">Medical Conditions:</span><strong className="text-sm whitespace-pre-wrap">{d}</strong></div>;
                                    })()}
                                    {animal.allergies && (() => {
                                        const d = animal.allergies;
                                        const parsed = typeof d === 'string' ? (() => { try { return JSON.parse(d); } catch { return null; } })() : Array.isArray(d) ? d : null;
                                        return parsed && parsed.length > 0 ? (
                                            <div>
                                                <span className="text-gray-600 text-sm font-semibold">Allergies:</span>
                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                    {parsed.map((item, i) => (
                                                        <li key={i} className="text-gray-700">
                                                            {item.allergen || item.name}
                                                            {item.notes && <span className="text-gray-500"> ? {item.notes}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : <div><span className="text-gray-600 text-sm font-semibold">Allergies:</span><strong className="text-sm whitespace-pre-wrap">{d}</strong></div>;
                                    })()}
                                    {animal.medications && (() => {
                                        const d = animal.medications;
                                        const parsed = typeof d === 'string' ? (() => { try { return JSON.parse(d); } catch { return null; } })() : Array.isArray(d) ? d : null;
                                        return parsed && parsed.length > 0 ? (
                                            <div>
                                                <span className="text-gray-600 text-sm font-semibold">Current Medications:</span>
                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                    {parsed.map((item, i) => (
                                                        <li key={i} className="text-gray-700">
                                                            {item.medication || item.name}
                                                            {item.notes && <span className="text-gray-500"> ? {item.notes}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : <div><span className="text-gray-600 text-sm font-semibold">Current Medications:</span><strong className="text-sm whitespace-pre-wrap">{d}</strong></div>;
                                    })()}
                                </div>)}
                            </div>

                            {/* 4th Section: Health Clearances & Screening */}
                            {(() => {
                                const clearanceFields = [
                                    { key: 'heartwormStatus', label: 'Heartworm Status' },
                                    { key: 'hipElbowScores', label: 'Hip/Elbow Scores' },
                                    { key: 'eyeClearance', label: 'Eye Clearance' },
                                    { key: 'cardiacClearance', label: 'Cardiac Clearance' },
                                    { key: 'dentalRecords', label: 'Dental Records' },
                                    { key: 'geneticTestResults', label: 'Genetic Test Results' },
                                    { key: 'chronicConditions', label: 'Chronic Conditions' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                const spayDate = fieldTemplate?.fields?.spayNeuterDate?.enabled !== false && animal.spayNeuterDate;
                                return (clearanceFields.length > 0 || spayDate) && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, healthClearances: !p.healthClearances}))} className="w-full flex items-center justify-between text-left group">
                                            <h3 className="text-lg font-semibold text-gray-700"><Hospital size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Health Clearances & Screening</h3>
                                            <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.healthClearances ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                        </button>
                                        {!collapsedHealthSections.healthClearances && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                                            {spayDate && <div><span className="text-gray-600">{getLabel('spayNeuterDate', 'Spay/Neuter Date')}:</span> <strong>{formatDate(animal.spayNeuterDate)}</strong></div>}
                                            {clearanceFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>)}
                                    </div>
                                );
                            })()}

                            {/* 5th Section: Veterinary Care */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, vetCare: !p.vetCare}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Stethoscope size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Veterinary Care</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.vetCare ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.vetCare && (<div className="space-y-4 text-sm mt-4">
                                    {animal.primaryVet && <div><span className="text-gray-600">Primary Veterinarian:</span> <strong>{animal.primaryVet}</strong></div>}
                                    {animal.vetVisits && (
                                        <DetailJsonList
                                            label="Veterinary Visits"
                                            data={animal.vetVisits}
                                            renderItem={v => <>{v.reason} {v.date && `(${formatDate(v.date)})`}{v.notes && <span className="text-gray-600"> - {v.notes}</span>}</>}
                                        />
                                    )}
                                </div>)}
                            </div>
                        </div>
                    )}

                    {/* Tab 9: Care */}
                    {detailViewTab === 9 && (
                        <div className="space-y-6">
                            {/* 1st Section: Nutrition */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><UtensilsCrossed size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Nutrition</h3>
                                <div className="space-y-3 text-sm">
                                    {animal.dietType && <div><span className="text-gray-600">Diet Type:</span> <strong>{animal.dietType}</strong></div>}
                                    {animal.feedingSchedule && <div><span className="text-gray-600">Feeding Schedule:</span> <strong>{animal.feedingSchedule}</strong></div>}
                                    {animal.supplements && <div><span className="text-gray-600">Supplements:</span> <strong>{animal.supplements}</strong></div>}
                                </div>
                            </div>

                            {/* 2nd Section: Husbandry */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Droplets size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Animal Care</h3>
                                <div className="space-y-3 text-sm">
                                    {enclosureInfo && (<div><span className="text-gray-600">Enclosure:</span> <strong>{enclosureInfo.name}</strong></div>)}
                                    {fieldTemplate?.fields?.housingType?.enabled !== false && animal.housingType && <div><span className="text-gray-600">{getLabel('housingType', 'Housing Type')}:</span> <strong>{animal.housingType}</strong></div>}
                                    {fieldTemplate?.fields?.bedding?.enabled !== false && animal.bedding && <div><span className="text-gray-600">{getLabel('bedding', 'Bedding')}:</span> <strong>{animal.bedding}</strong></div>}
                                    {animal.enrichment && <div><span className="text-gray-600">Enrichment:</span> <strong>{animal.enrichment}</strong></div>}
                                </div>
                            </div>

                            {/* 3rd Section: Environment */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Thermometer size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Environment</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {animal.temperatureRange && <div><span className="text-gray-600">Temperature Range:</span> <strong>{animal.temperatureRange}</strong></div>}
                                    {fieldTemplate?.fields?.humidity?.enabled !== false && animal.humidity && <div><span className="text-gray-600">{getLabel('humidity', 'Humidity')}:</span> <strong>{animal.humidity}</strong></div>}
                                    {animal.lighting && <div><span className="text-gray-600">Lighting:</span> <strong>{animal.lighting}</strong></div>}
                                    {fieldTemplate?.fields?.noise?.enabled !== false && animal.noise && <div><span className="text-gray-600">{getLabel('noise', 'Noise Level')}:</span> <strong>{animal.noise}</strong></div>}
                                </div>
                            </div>

                            {/* 4th Section: Exercise & Grooming */}
                            {(() => {
                                const egFields = [
                                    { key: 'exerciseRequirements', label: 'Exercise Requirements' },
                                    { key: 'dailyExerciseMinutes', label: 'Daily Exercise (min)' },
                                    { key: 'groomingNeeds', label: 'Grooming Needs' },
                                    { key: 'sheddingLevel', label: 'Shedding Level' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                const trainFlags = [
                                    { key: 'crateTrained', label: 'Crate Trained' },
                                    { key: 'litterTrained', label: 'Litter Trained' },
                                    { key: 'leashTrained', label: 'Leash Trained' },
                                    { key: 'freeFlightTrained', label: 'Free Flight Trained' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return (egFields.length > 0 || trainFlags.length > 0) && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Scissors size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Grooming</h3>
                                        {egFields.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                {egFields.map(f => (
                                                    <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                                ))}
                                            </div>
                                        )}
                                        {trainFlags.length > 0 && (
                                            <div className="flex flex-wrap gap-3 text-sm">
                                                {trainFlags.map(f => (
                                                    <span key={f.key} className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">&#x2713; {getLabel(f.key, f.label)}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tab 10: Behavior */}
                    {detailViewTab === 10 && (
                        <div className="space-y-6">
                            {/* 1st Section: Behavior */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><MessageSquare size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Behavior</h3>
                                <div className="space-y-3 text-sm">
                                    {animal.temperament && <div><span className="text-gray-600">Temperament:</span> <strong>{animal.temperament}</strong></div>}
                                    {fieldTemplate?.fields?.handlingTolerance?.enabled !== false && animal.handlingTolerance && <div><span className="text-gray-600">{getLabel('handlingTolerance', 'Handling Tolerance')}:</span> <strong>{animal.handlingTolerance}</strong></div>}
                                    {animal.socialStructure && <div><span className="text-gray-600">Social Structure:</span> <strong>{animal.socialStructure}</strong></div>}
                                </div>
                            </div>

                            {/* 2nd Section: Activity */}
                            {animal.activityCycle && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Activity size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Activity</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Activity Cycle:</span> <strong>{animal.activityCycle}</strong></div>
                                </div>
                            </div>
                            )}

                            {/* 3rd Section: Training & Working */}
                            {(() => {
                                const trainFields = [
                                    { key: 'trainingLevel', label: 'Training Level' },
                                    { key: 'trainingDisciplines', label: 'Training Disciplines' },
                                    { key: 'workingRole', label: 'Working Role' },
                                    { key: 'certifications', label: 'Certifications' },
                                    { key: 'behavioralIssues', label: 'Behavioral Issues' },
                                    { key: 'biteHistory', label: 'Bite History' },
                                    { key: 'reactivityNotes', label: 'Reactivity Notes' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return trainFields.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Dumbbell size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Training & Working</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {trainFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tab 11: Notes */}
                    {detailViewTab === 11 && (
                        <div className="space-y-6">
                            {/* 1st Section: Remarks & Notes */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><FileText size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Remarks & Notes</h3>
                                <strong className="block text-sm text-gray-700 whitespace-pre-wrap">{animal.remarks || ''}</strong>
                            </div>
                        </div>
                    )}                    {/* Tab 14: End of Life */}
                    {detailViewTab === 14 && (
                        <div className="space-y-6">
                            {/* End of Life */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Feather size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Deceased Date:</span> <strong>{animal.deceasedDate ? formatDate(animal.deceasedDate) : ''}</strong></div>
                                    <div><span className="text-gray-600">Cause of Death:</span> <strong>{animal.causeOfDeath || ''}</strong></div>
                                    <div><span className="text-gray-600">Necropsy Results:</span> <strong>{animal.necropsyResults || ''}</strong></div>
                                    {animal.endOfLifeCareNotes && (
                                        <div><span className="text-gray-600">{getLabel('endOfLifeCareNotes', 'End of Life Care Notes')}:</span> <strong className="whitespace-pre-wrap">{animal.endOfLifeCareNotes}</strong></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 12: Show */}
                    {detailViewTab === 12 && (
                        <div className="space-y-6">
                            {/* Show Titles & Ratings */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Medal size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Show Titles & Ratings</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Titles:</span> <strong>{animal.showTitles || ''}</strong></div>
                                    <div><span className="text-gray-600">Ratings:</span> <strong>{animal.showRatings || ''}</strong></div>
                                    <div><span className="text-gray-600">Judge Comments:</span> <strong className="whitespace-pre-wrap">{animal.judgeComments || ''}</strong></div>
                                </div>
                            </div>

                            {/* Working Titles & Performance */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Target size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Working & Performance</h3>
                                    <div className="space-y-3 text-sm">
                                        <div><span className="text-gray-600">Working Titles:</span> <strong>{animal.workingTitles || ''}</strong></div>
                                        <div><span className="text-gray-600">Performance Scores:</span> <strong>{animal.performanceScores || ''}</strong></div>
                                    </div>
                                </div>
                        </div>
                    )}

                    {/* Tab 13: Legal & Documentation */}
                    {detailViewTab === 13 && (
                        <div className="space-y-6">
                            {/* Licensing & Permits */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Key size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Licensing & Permits</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {fieldTemplate?.fields?.licenseNumber?.enabled !== false && animal.licenseNumber && (
                                        <div><span className="text-gray-600">{getLabel('licenseNumber', 'License Number')}:</span> <strong>{animal.licenseNumber}</strong></div>
                                    )}
                                    {fieldTemplate?.fields?.licenseJurisdiction?.enabled !== false && animal.licenseJurisdiction && (
                                        <div><span className="text-gray-600">{getLabel('licenseJurisdiction', 'License Jurisdiction')}:</span> <strong>{animal.licenseJurisdiction}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* Legal / Administrative */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><ClipboardList size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Legal / Administrative</h3>
                                <div className="space-y-3 text-sm">
                                    {fieldTemplate?.fields?.insurance?.enabled !== false && animal.insurance && (
                                        <div><span className="text-gray-600">{getLabel('insurance', 'Insurance')}:</span> <strong className="whitespace-pre-wrap">{animal.insurance}</strong></div>
                                    )}
                                    {fieldTemplate?.fields?.legalStatus?.enabled !== false && animal.legalStatus && (
                                        <div><span className="text-gray-600">{getLabel('legalStatus', 'Legal Status')}:</span> <strong className="whitespace-pre-wrap">{animal.legalStatus}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* Restrictions */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Ban size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Restrictions</h3>
                                <div className="space-y-3 text-sm">
                                    {animal.breedingRestrictions && (
                                        <div><span className="text-gray-600">{getLabel('breedingRestrictions', 'Breeding Restrictions')}:</span> <strong className="whitespace-pre-wrap">{animal.breedingRestrictions}</strong></div>
                                    )}
                                    {animal.exportRestrictions && (
                                        <div><span className="text-gray-600">{getLabel('exportRestrictions', 'Export Restrictions')}:</span> <strong className="whitespace-pre-wrap">{animal.exportRestrictions}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* No data fallback */}
                            {!animal.licenseNumber && !animal.licenseJurisdiction && !animal.insurance && !animal.legalStatus && !animal.breedingRestrictions && !animal.exportRestrictions && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center text-gray-500">
                                    <p>No legal or documentation records</p>
                                </div>
                            )}
                        </div>
                    )}

                {/* -- TAB 15 : Gallery (read-only) --- */}
                {detailViewTab === 15 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700"><Images size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Photo Gallery</h3>
                                <p className="text-xs text-gray-400 mt-0.5">{(animal.extraImages || []).length} photos</p>
                            </div>
                        </div>

                        {(animal.extraImages || []).length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <Camera size={48} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-medium">No photos</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {(animal.extraImages || []).map((url, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                        <img
                                            src={url}
                                            alt={`Gallery photo ${idx + 1}`}
                                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => { setEnlargedImageUrl(url); setShowImageModal(true); }}
                                        />
                                        <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] rounded px-1 py-0.5">#{idx + 1}</span>
                                    </div>
                                ))}
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
                        onViewAnimal={onViewAnimal}
                    />
                )}

                {/* Tab 5: Beta Pedigree */}
                {detailViewTab === 5 && (() => {
                    if (mpLoading) return <div className="flex items-center justify-center py-16 gap-2 text-gray-400"><Loader2 size={18} className="animate-spin" /><span className="text-sm">Loading ancestry?</span></div>;
                    const mpData = mpEnrichedData || animal?.manualPedigree || {};
                    const emptySlot = () => ({ mode: 'manual', ctcId: '', prefix: '', name: '', suffix: '', variety: '', genCode: '', birthDate: '', breederName: '', gender: '', imageUrl: '', notes: '' });
                    const getSlot = (key) => mpData[key] || emptySlot();
                    const hasAnyData = ['sire','dam','sireSire','sireDam','damSire','damDam',
                        'sireSireSire','sireSireDam','sireDamSire','sireDamDam',
                        'damSireSire','damSireDam','damDamSire','damDamDam'].some(k => {
                        const d = mpData[k];
                        return d && (d.ctcId || Object.entries(d).some(([fk,v]) => fk !== 'mode' && v && String(v).trim()));
                    });
                    const handleDownloadMP = async () => {
                        if (!mpTreeRef.current) return;
                        setMpDownloading(true);
                        try {
                            const srcCanvas = await html2canvas(mpTreeRef.current, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
                            const a4W = 1654, a4H = 2339, pad = 80;
                            const maxW = a4W - pad * 2, maxH = a4H - pad * 2;
                            const ratio = Math.min(maxW / srcCanvas.width, maxH / srcCanvas.height);
                            const dw = Math.round(srcCanvas.width * ratio), dh = Math.round(srcCanvas.height * ratio);
                            const out = document.createElement('canvas');
                            out.width = a4W; out.height = a4H;
                            const ctx = out.getContext('2d');
                            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, a4W, a4H);
                            ctx.drawImage(srcCanvas, Math.round((a4W - dw) / 2), Math.round((a4H - dh) / 2), dw, dh);
                            const link = document.createElement('a');
                            link.download = `manual-pedigree-${animal.name || animal.id_public}.png`;
                            link.href = out.toDataURL('image/png');
                            link.click();
                        } catch(e) { console.error('Manual pedigree download failed', e); }
                        finally { setMpDownloading(false); }
                    };
                    const handleDownloadMPPDF = async () => {
                        if (!mpTreeRef.current) return;
                        setMpDownloading(true);
                        try {
                            const srcCanvas = await html2canvas(mpTreeRef.current, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
                            const a4W = 1654, a4H = 2339, pad = 80;
                            const maxW = a4W - pad * 2, maxH = a4H - pad * 2;
                            const ratio = Math.min(maxW / srcCanvas.width, maxH / srcCanvas.height);
                            const dw = Math.round(srcCanvas.width * ratio), dh = Math.round(srcCanvas.height * ratio);
                            const out = document.createElement('canvas');
                            out.width = a4W; out.height = a4H;
                            const ctx = out.getContext('2d');
                            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, a4W, a4H);
                            ctx.drawImage(srcCanvas, Math.round((a4W - dw) / 2), Math.round((a4H - dh) / 2), dw, dh);
                            const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [a4W, a4H] });
                            pdf.addImage(out.toDataURL('image/png'), 'PNG', 0, 0, a4W, a4H);
                            pdf.save(`pedigree-${animal.name || animal.id_public}.pdf`);
                        } catch(e) { console.error('Pedigree PDF failed', e); }
                        finally { setMpDownloading(false); }
                    };
                    const renderSlot = (slotKey, label) => {
                        const d = getSlot(slotKey);
                        const hasData = d && (d.ctcId || Object.entries(d).some(([fk,v]) => fk !== 'mode' && v && String(v).trim()));
                        const fullName = [d.prefix, d.name, d.suffix].filter(Boolean).join(' ');
                        const isSire = slotKey === 'sire' || slotKey.endsWith('Sire');
                        const GIcon = isSire ? Mars : Venus;
                        const gColor = isSire ? 'text-blue-400' : 'text-pink-400';
                        const handleSlotClick = d.ctcId && onViewAnimal ? async () => {
                            try {
                                const res = await axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(d.ctcId)}`, { headers: { Authorization: `Bearer ${authToken}` } });
                                if (res.data) onViewAnimal(res.data, 16);
                            } catch { /* not accessible */ }
                        } : undefined;
                        return (
                            <div key={slotKey} onClick={handleSlotClick} className={`rounded-lg border-2 p-3 h-full relative ${handleSlotClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${hasData ? (isSire ? 'border-blue-200 bg-blue-50/40' : 'border-pink-200 bg-pink-50/40') : 'border-dashed border-gray-200 bg-gray-50'}`}>
                                <div className={`flex items-center gap-1 mb-1.5 ${isSire ? 'text-blue-400' : 'text-pink-400'}`}>
                                    <GIcon size={11} className={`flex-shrink-0 ${gColor}`} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
                                </div>
                                {hasData ? (
                                    <div className="flex gap-2.5">
                                        {d.imageUrl && <img src={d.imageUrl} alt={fullName} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200 self-start" />}
                                        <div className="flex-1 min-w-0 space-y-0.5 pb-4">
                                            {fullName && <p className="text-xs font-semibold text-gray-800 leading-tight">{fullName}</p>}
                                            {d.variety && <p className="text-[11px] text-gray-500">{d.variety}</p>}
                                            {d.genCode && <p className="text-[11px] font-mono text-indigo-600">{d.genCode}</p>}
                                            {d.birthDate && <p className="text-[11px] text-gray-400">{formatDate(d.birthDate)}</p>}
                                            {d.deceasedDate && <p className="text-[11px] text-red-600 font-semibold">† {formatDate(d.deceasedDate)}</p>}
                                            {d.breederName && <p className="text-[11px] text-gray-500 italic">{d.breederName}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2.5">
                                        <div className="flex-1 min-w-0 space-y-0.5 pb-4">
                                            <p className="text-[11px] text-gray-300 italic">?</p>
                                        </div>
                                    </div>
                                )}
                                {d.ctcId && <p className="absolute bottom-1.5 right-2 text-[10px] font-mono text-gray-800">{d.ctcId}</p>}
                            </div>
                        );
                    };
                    return (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <Dna size={18} className="text-orange-500" />
                                    <h3 className="text-base font-semibold text-gray-700">Beta Pedigree</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex rounded border border-gray-300 overflow-hidden text-xs">
                                        <button onClick={() => setBetaPedigreeView('vertical')} className={`px-2 py-1 transition-colors ${betaPedigreeView === 'vertical' ? 'bg-gray-200 font-semibold text-gray-800' : 'text-gray-400 hover:bg-gray-100'}`}>Vertical</button>
                                        <button onClick={() => setBetaPedigreeView('chart')} className={`px-2 py-1 transition-colors ${betaPedigreeView === 'chart' ? 'bg-primary font-semibold text-black' : 'text-gray-400 hover:bg-gray-100'}`}>Chart</button>
                                    </div>
                                    {hasAnyData && betaPedigreeView === 'vertical' && (
                                        <>
                                        <button onClick={handleDownloadMPPDF} disabled={mpDownloading}
                                            className="px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-black rounded-lg border border-primary/40 transition flex items-center gap-1.5 disabled:opacity-60 font-semibold">
                                            {mpDownloading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Download size={14} /> Save PDF</>}
                                        </button>
                                        <button onClick={handleDownloadMP} disabled={mpDownloading}
                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition flex items-center gap-1.5 disabled:opacity-60">
                                            {mpDownloading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Images size={14} /> Save Image</>}
                                        </button>
                                        </>
                                    )}
                                    {betaPedigreeView === 'chart' && (
                                        <>
                                        <button onClick={() => chartRef.current?.downloadPDF()} disabled={!chartRef.current?.imagesLoaded || chartRef.current?.isSaving}
                                            className="px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-black rounded-lg border border-primary/40 transition flex items-center gap-1.5 disabled:opacity-60 font-semibold">
                                            <Download size={14} /> Save PDF
                                        </button>
                                        <button onClick={() => chartRef.current?.downloadImage()} disabled={!chartRef.current?.imagesLoaded || chartRef.current?.isSaving}
                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition flex items-center gap-1.5 disabled:opacity-60">
                                            <Images size={14} /> Save Image
                                        </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 -mt-3">This Beta Pedigree displays both linked CritterTrack ancestors (with CTC IDs) and manually entered ancestors. Only linked CritterTrack ancestry is used for COI calculations. Manual entries are for display/reference only and do not affect COI or the main pedigree chart.</p>
                            <div className={betaPedigreeView === 'chart' ? '' : 'hidden'}>
                                <PedigreeChart ref={chartRef} inline animalId={animal.id_public} animalData={animal} API_BASE_URL={API_BASE_URL} authToken={authToken} onClose={() => {}} manualData={mpEnrichedData} onViewAnimal={onViewAnimal} />
                            </div>
                            <div className={betaPedigreeView === 'vertical' ? '' : 'hidden'}>
                            <div ref={mpTreeRef} className="space-y-6 bg-white p-4 rounded-xl">
                            {(() => {
                                const subjectVariety = ['color','coatPattern','coat','earset','phenotype','morph','markings'].map(k => animal[k]).filter(Boolean).join(' ');
                                const subjectImgUrl = animal.imageUrl || animal.photoUrl || null;
                                const subjectName = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ');
                                const isMale = animal.gender === 'Male';
                                const SubjectGenderIcon = isMale ? Mars : Venus;
                                const subjectGColor = isMale ? 'text-blue-500' : 'text-pink-500';
                                const ownerImgUrl = breederInfo?.profileImage || null;
                                const ownerShowPersonal = breederInfo?.showPersonalName ?? true;
                                const ownerShowBreeder = breederInfo?.showBreederName ?? true;
                                const ownerLines = [];
                                if (ownerShowPersonal && breederInfo?.personalName) ownerLines.push(breederInfo.personalName);
                                if (ownerShowBreeder && breederInfo?.breederName) ownerLines.push(breederInfo.breederName);
                                const ownerUserId = breederInfo?.id_public || null;
                                const ownerQrUrl = ownerUserId ? `${window.location.origin}/user/${ownerUserId}` : null;
                                return (
                                    <div className="rounded-xl border-2 border-primary bg-primary/10 overflow-hidden relative">
                                        {/* Owner/breeder ? top-right corner */}
                                        {breederInfo && (
                                        <div className="absolute top-2 right-2 flex flex-col items-center gap-1 text-center z-10">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                                                {ownerImgUrl ? <img src={ownerImgUrl} alt="Breeder" className="w-full h-full object-cover" /> : <User size={18} className="text-gray-400" />}
                                            </div>
                                            <div className="space-y-0">
                                                {ownerLines.length > 0 ? ownerLines.map((l,i) => <p key={i} className="text-xs font-semibold text-gray-700 leading-tight">{l}</p>) : null}
                                                {ownerUserId && <p className="text-[10px] font-mono text-gray-400">{ownerUserId}</p>}
                                            </div>
                                            {ownerQrUrl && <QRCodeSVG value={ownerQrUrl} size={52} bgColor="transparent" fgColor="#374151" level="M" />}
                                        </div>
                                        )}
                                        {/* Animal info ? centered */}
                                        <div className="flex flex-col items-center gap-2 text-center p-4 relative">
                                            {animal.species && <div className="absolute top-2 left-2 text-left"><p className="text-xs font-semibold text-gray-600 leading-tight">{animal.species}</p>{getSpeciesLatinName(animal.species) && <p className="text-[10px] italic text-gray-400 leading-tight">{getSpeciesLatinName(animal.species)}</p>}</div>}
                                            {subjectImgUrl ? <img src={subjectImgUrl} alt={subjectName} className="w-20 h-20 rounded-full object-cover border-2 border-primary/30" /> : <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-300"><Cat size={32} /></div>}
                                            <div className="flex items-center gap-1 justify-center">
                                                <SubjectGenderIcon size={14} className={`flex-shrink-0 ${subjectGColor}`} />
                                                <p className="text-base font-bold text-gray-800 leading-tight">{subjectName}</p>
                                            </div>
                                            {subjectVariety && <p className="text-xs text-gray-500 -mt-1">{subjectVariety}</p>}
                                            {animal.geneticCode && <p className="text-xs font-mono text-indigo-600">{animal.geneticCode}</p>}
                                            {animal.birthDate && <p className="text-xs text-gray-400">{formatDate(animal.birthDate)}</p>}
                                            {(animal.manualBreederName || (breederInfo && (breederInfo.breederName || breederInfo.personalName))) && <p className="text-xs text-gray-500 italic">{animal.manualBreederName || breederInfo.breederName || breederInfo.personalName}</p>}
                                            {animal.id_public && <p className="text-xs font-mono text-gray-400">{animal.id_public}</p>}
                                        </div>
                                    </div>
                                );
                            })()}
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 1 — Parents</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {renderSlot('sire', 'Sire')}
                                    {renderSlot('dam', 'Dam')}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 2 — Grandparents</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Paternal</p>
                                    <p className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest">Maternal</p>
                                    {renderSlot('sireSire', 'Grandsire')}
                                    {renderSlot('damSire', 'Grandsire')}
                                    {renderSlot('sireDam', 'Granddam')}
                                    {renderSlot('damDam', 'Granddam')}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 3 — Great-Grandparents</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Paternal</p>
                                    <p className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest">Maternal</p>
                                    <p className="text-[10px] text-gray-400 mb-0.5">via Grandsire</p>
                                    <p className="text-[10px] text-gray-400 mb-0.5">via Grandsire</p>
                                    {renderSlot('sireSireSire', 'Great-Grandsire')}
                                    {renderSlot('damSireSire', 'Great-Grandsire')}
                                    {renderSlot('sireSireDam', 'Great-Granddam')}
                                    {renderSlot('damSireDam', 'Great-Granddam')}
                                    <p className="text-[10px] text-gray-400 mt-1 mb-0.5">via Granddam</p>
                                    <p className="text-[10px] text-gray-400 mt-1 mb-0.5">via Granddam</p>
                                    {renderSlot('sireDamSire', 'Great-Grandsire')}
                                    {renderSlot('damDamSire', 'Great-Grandsire')}
                                    {renderSlot('sireDamDam', 'Great-Granddam')}
                                    {renderSlot('damDamDam', 'Great-Granddam')}
                                </div>
                            </div>
                            </div>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    </div>
    );
};
// Respects privacy toggles - only shows public sections
// Accessed from: Global search, user profiles, offspring links
const ViewOnlyAnimalDetail = ({ animal, onClose, onCloseAll, API_BASE_URL, onViewProfile, onViewAnimal, authToken, setModCurrentContext, setShowImageModal, setEnlargedImageUrl, initialTab = 1 }) => {
    const [breederInfo, setBreederInfo] = useState(null);
    const [showPedigree, setShowPedigree] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [detailViewTab, setDetailViewTab] = useState(initialTab);
    const [mpDownloading, setMpDownloading] = useState(false);
    const [mpLoading, setMpLoading] = useState(false);
    const mpTreeRef = useRef(null);
    const chartRef = useRef(null);
    const [mpEnrichedData, setMpEnrichedData] = useState(null);
    const [betaPedigreeView, setBetaPedigreeView] = useState('vertical');
    useEffect(() => {
        if (detailViewTab !== 5) return;
        let cancelled = false;
        setMpLoading(true);
        (async () => {
            const manual = animal?.manualPedigree || {};
            const toSlot = (a) => {
                const variety = ['color','coatPattern','coat','earset','phenotype','morph','markings'].map(k => a[k]).filter(Boolean).join(' ');
                return { mode: 'ctc', ctcId: a.id_public || '', prefix: a.prefix || '', name: a.name || '', suffix: a.suffix || '', variety, genCode: a.geneticCode || '', birthDate: a.birthDate ? String(a.birthDate).slice(0,10) : '', deceasedDate: a.deceasedDate ? String(a.deceasedDate).slice(0,10) : '', breederName: a.breederName || a.manualBreederName || '', gender: a.gender || '', imageUrl: a.imageUrl || a.photoUrl || '', notes: '' };
            };
            const fetchOne = async (id) => {
                if (!id) return null;
                try { const r = await axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${authToken}` } }); return r.data || null; }
                catch { return null; }
            };
            // Level 1: parents
            const [sire, dam] = await Promise.all([
                fetchOne(animal?.sireId_public || animal?.fatherId_public),
                fetchOne(animal?.damId_public  || animal?.motherId_public),
            ]);
            if (cancelled) return;
            // Level 2: grandparents
            const [ss, sd, ds, dd] = await Promise.all([
                fetchOne(sire?.sireId_public || sire?.fatherId_public),
                fetchOne(sire?.damId_public  || sire?.motherId_public),
                fetchOne(dam?.sireId_public  || dam?.fatherId_public),
                fetchOne(dam?.damId_public   || dam?.motherId_public),
            ]);
            if (cancelled) return;
            // Level 3: great-grandparents
            const [sss, ssd, sds, sdd, dss, dsd, dds, ddd] = await Promise.all([
                fetchOne(ss?.sireId_public || ss?.fatherId_public),
                fetchOne(ss?.damId_public  || ss?.motherId_public),
                fetchOne(sd?.sireId_public || sd?.fatherId_public),
                fetchOne(sd?.damId_public  || sd?.motherId_public),
                fetchOne(ds?.sireId_public || ds?.fatherId_public),
                fetchOne(ds?.damId_public  || ds?.motherId_public),
                fetchOne(dd?.sireId_public || dd?.fatherId_public),
                fetchOne(dd?.damId_public  || dd?.motherId_public),
            ]);
            if (cancelled) return;
            // Build seeded slots from linked ancestry
            const seeded = {};
            if (sire) seeded.sire         = toSlot(sire);
            if (dam)  seeded.dam          = toSlot(dam);
            if (ss)   seeded.sireSire     = toSlot(ss);
            if (sd)   seeded.sireDam      = toSlot(sd);
            if (ds)   seeded.damSire      = toSlot(ds);
            if (dd)   seeded.damDam       = toSlot(dd);
            if (sss)  seeded.sireSireSire = toSlot(sss);
            if (ssd)  seeded.sireSireDam  = toSlot(ssd);
            if (sds)  seeded.sireDamSire  = toSlot(sds);
            if (sdd)  seeded.sireDamDam   = toSlot(sdd);
            if (dss)  seeded.damSireSire  = toSlot(dss);
            if (dsd)  seeded.damSireDam   = toSlot(dsd);
            if (dds)  seeded.damDamSire   = toSlot(dds);
            if (ddd)  seeded.damDamDam    = toSlot(ddd);
            // Overlay seeded (real CTC links) on top of manual entries ? seed wins
            const merged = {};
            Object.entries(manual).forEach(([k, v]) => {
                if (v && (v.ctcId || v.name || v.prefix || v.suffix)) merged[k] = v;
            });
            Object.assign(merged, seeded);
            if (!cancelled) { setMpEnrichedData(merged); setMpLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [detailViewTab, animal?.id_public]);
    // Reset tab when navigating to a different animal
    React.useEffect(() => { setDetailViewTab(initialTab); setMpEnrichedData(null); setMpLoading(false); }, [animal?.id_public, initialTab]);
    const [animalCOI, setAnimalCOI] = useState(null);
    const [loadingCOI, setLoadingCOI] = useState(false);
    const [expandedBreedingRecords, setExpandedBreedingRecords] = useState({});
    const [animalLitters, setAnimalLitters] = useState(null);
    const [breedingRecordOffspring, setBreedingRecordOffspring] = useState({});
    const [pedigreeOffspring, setPedigreeOffspring] = useState(null);
    const [expandedPedigreeRecords, setExpandedPedigreeRecords] = useState({});
    const [collapsedHealthSections, setCollapsedHealthSections] = useState({});
    const [parentCardKey, setParentCardKey] = useState(0); // increment to force parent cards to refetch
    const [isAnimalFavorited, setIsAnimalFavorited] = useState(false);
    const [animalFavoritePending, setAnimalFavoritePending] = useState(false);
    const { fieldTemplate, getLabel } = useDetailFieldTemplate(animal?.species, API_BASE_URL);

    // Force parent cards to refetch when Lineage tab opens
    React.useEffect(() => {
        if (detailViewTab === 5) {
            setParentCardKey(k => k + 1);
        }
    }, [detailViewTab]);

    // Fetch all litters where this animal is sire or dam
    React.useEffect(() => {
        if (!animal?.id_public || !authToken) return;
        let cancelled = false;
        axios.get(`${API_BASE_URL}/litters`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => {
                if (cancelled) return;
                const linked = (res.data || []).filter(l =>
                    l.sireId_public === animal.id_public || l.damId_public === animal.id_public
                );
                setAnimalLitters(linked);
                linked.forEach(litter => {
                    const lid = litter.litter_id_public;
                    if (!lid) return;
                    if (!litter.offspringIds_public?.length) {
                        setBreedingRecordOffspring(prev => ({ ...prev, [lid]: [] }));
                        return;
                    }
                    axios.get(`${API_BASE_URL}/litters/${lid}/offspring`, { headers: { Authorization: `Bearer ${authToken}` } })
                        .then(r => { if (!cancelled) setBreedingRecordOffspring(prev => ({ ...prev, [lid]: r.data })); })
                        .catch(() => { if (!cancelled) setBreedingRecordOffspring(prev => ({ ...prev, [lid]: [] })); });
                });
            })
            .catch(() => { if (!cancelled) setAnimalLitters([]); });
        return () => { cancelled = true; };
    }, [animal?.id_public, authToken, API_BASE_URL]);

    // Fetch pedigree-based offspring groups (not in litter management)
    React.useEffect(() => {
        if (!animal?.id_public || !authToken) return;
        let cancelled = false;
        axios.get(`${API_BASE_URL}/animals/${animal.id_public}/offspring`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => {
                if (cancelled) return;
                const unmanaged = (res.data || []).filter(l => !l.litter_id_public);
                setPedigreeOffspring(unmanaged);
            })
            .catch(() => { if (!cancelled) setPedigreeOffspring([]); });
        return () => { cancelled = true; };
    }, [animal?.id_public, authToken, API_BASE_URL]);

    // Get section privacy settings from animal data (default to true/public if not set)
    // Note: All sections now follow the main animal's public/private status
    // Individual section privacy has been removed for simplicity
    
    console.log('ViewOnlyAnimalDetail rendering', { 
        animalId: animal.id_public,
        animalName: animal.name,
        detailViewTab,
        hasRemarks: !!animal.remarks,
        hasGeneticCode: !!animal.geneticCode
    });
    
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

    // Check if this animal is favorited
    React.useEffect(() => {
        const checkFavorited = async () => {
            if (!authToken || !animal?.id_public) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/favorites/animals`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const favorited = (res.data || []).some(a => a.id_public === animal.id_public);
                setIsAnimalFavorited(favorited);
            } catch (error) {
                // Silently fail
            }
        };
        checkFavorited();
    }, [authToken, animal?.id_public, API_BASE_URL]);

    const toggleAnimalFavorite = async () => {
        if (!authToken || animalFavoritePending) return;
        setAnimalFavoritePending(true);
        try {
            if (isAnimalFavorited) {
                await axios.delete(`${API_BASE_URL}/favorites/animals/${animal.id_public}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setIsAnimalFavorited(false);
            } else {
                await axios.post(`${API_BASE_URL}/favorites/animals/${animal.id_public}`, {}, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setIsAnimalFavorited(true);
            }
        } catch (error) {
            console.error('Error toggling animal favorite:', error);
        } finally {
            setAnimalFavoritePending(false);
        }
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
    
    // Fetch COI when component mounts or animal changes (if animal has both parents)
    React.useEffect(() => {
        const fetchCOI = async () => {
            const sireId = animal?.fatherId_public || animal?.sireId_public;
            const damId = animal?.motherId_public || animal?.damId_public;
            
            if (animal?.id_public && sireId && damId) {
                setLoadingCOI(true);
                try {
                    const response = await axios.get(
                        `${API_BASE_URL}/public/animal/${animal.id_public}/inbreeding`
                    );
                    if (response.data && response.data.inbreedingCoefficient != null) {
                        setAnimalCOI(response.data.inbreedingCoefficient);
                    }
                } catch (error) {
                    console.error('Failed to fetch COI:', error);
                    setAnimalCOI(null);
                } finally {
                    setLoadingCOI(false);
                }
            } else {
                setAnimalCOI(null);
            }
        };
        fetchCOI();
    }, [animal?.id_public, animal?.fatherId_public, animal?.sireId_public, animal?.motherId_public, animal?.damId_public, API_BASE_URL]);
    
    if (!animal) return null;

    // All sections are now publicly visible if the animal is public
    // Privacy is controlled at the animal level, not per-section
    
    console.log('ViewOnlyAnimalDetail rendering animal:', { 
        animalId: animal.id_public,
        animalName: animal.name,
        detailViewTab,
        hasRemarks: !!animal.remarks,
        hasGeneticCode: !!animal.geneticCode
    });

    return (
        <div className="fixed inset-0 bg-accent/10 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-primary rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto my-2 sm:my-0">
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
                            {authToken && (
                                <button
                                    onClick={toggleAnimalFavorite}
                                    disabled={animalFavoritePending}
                                    className={`px-3 py-1.5 font-semibold rounded-lg transition flex items-center gap-2 ${
                                        isAnimalFavorited
                                            ? 'bg-purple-100 hover:bg-purple-200 text-purple-600'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    } ${animalFavoritePending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={isAnimalFavorited ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    <Heart size={16} fill={isAnimalFavorited ? 'currentColor' : 'none'} />
                                    {isAnimalFavorited ? 'Favorited' : 'Favorite'}
                                </button>
                            )}
                            <button
                                onClick={() => setShowQR(true)}
                                className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-2"
                            >
                                <QrCode size={16} />
                                Share
                            </button>
                            {showQR && <QRModal url={`${window.location.origin}/animal/${animal.id_public}`} title={animal.name} onClose={() => setShowQR(false)} />}
                            <ReportButton
                                contentType="animal"
                                contentId={animal.id_public}
                                contentOwnerId={animal.ownerId}
                                authToken={authToken}
                                tooltipText="Report this animal"
                            />
                            <button onClick={onCloseAll || onClose} className="text-gray-500 hover:text-gray-800">
                                <X size={28} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs - PUBLIC VIEW: 8 tabs (Records + End of Life combined) */}
                <div className="bg-white border-b border-gray-300">
                    <div className="flex flex-wrap">
                        {[
                            { id: 1, label: 'Overview', icon: ClipboardList, color: 'text-blue-500' },
                            { id: 2, label: 'Status', icon: Lock, color: 'text-slate-500' },
                            { id: 3, label: 'Identification', icon: Tag, color: 'text-amber-500' },
                            { id: 4, label: 'Appearance', icon: Palette, color: 'text-pink-500' },
                            { id: 5, label: 'Beta Pedigree', icon: Dna, color: 'text-orange-500' },
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
                                onClick={() => setDetailViewTab(tab.id)}
                                className={`flex-1 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 px-3 py-3 text-sm font-medium whitespace-nowrap text-center transition ${
                                    detailViewTab === tab.id
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                {React.createElement(tab.icon, { size: 14, className: `inline-block align-middle flex-shrink-0 mr-1.5 ${tab.color || ''}` })}{tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white border border-t-0 border-gray-300 rounded-b-lg p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-160px)] sm:max-h-[calc(90vh-180px)] pb-8">
                    {/* Tab 1: Overview */}
                    {detailViewTab === 1 && (
                        <div className="space-y-3">
                            {/* Main info card */}
                            <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    {/* Left: Photo + status + badges */}
                                    <div className="w-full md:w-1/4 p-4 flex flex-col items-center gap-2 border-b md:border-b-0 md:border-r border-gray-300">
                                        <div className="relative w-full flex justify-center">
                                            <div className="absolute top-0 right-0">
                                                {animal.gender === 'Male' ? <Mars size={16} strokeWidth={2.5} className="text-blue-600" /> : animal.gender === 'Female' ? <Venus size={16} strokeWidth={2.5} className="text-pink-600" /> : animal.gender === 'Intersex' ? <VenusAndMars size={16} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={16} strokeWidth={2.5} className="text-gray-500" />}
                                            </div>
                                            {(animal.imageUrl || animal.photoUrl) ? (
                                                <img
                                                    src={animal.imageUrl || animal.photoUrl}
                                                    alt={animal.name}
                                                    className="w-28 h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                                                    onClick={() => {
                                                        if (setEnlargedImageUrl && setShowImageModal) {
                                                            setEnlargedImageUrl(animal.imageUrl || animal.photoUrl);
                                                            setShowImageModal(true);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                    <Cat size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm font-medium text-gray-700">{animal.status || 'Unknown'}</div>
                                        {animal.isForSale && (
                                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Tag size={11} /> For Sale{animal.salePriceCurrency !== 'Negotiable' && animal.salePriceAmount ? ` · ${getCurrencySymbol(animal.salePriceCurrency)}${animal.salePriceAmount}` : ''}
                                            </span>
                                        )}
                                        {animal.availableForBreeding && (
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Tag size={11} /> Stud{animal.studFeeCurrency !== 'Negotiable' && animal.studFeeAmount ? ` · ${getCurrencySymbol(animal.studFeeCurrency)}${animal.studFeeAmount}` : ''}
                                            </span>
                                        )}
                                        {animal.tags && animal.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {animal.tags.map((tag, idx) => (
                                                    <span key={idx} className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Right: All info */}
                                    <div className="flex-1 p-4 space-y-2">
                                        {/* Species/CTC row */}
                                        <p className="text-sm text-gray-500">
                                            {animal.species}
                                            {animal.breed && ` \u2022 ${animal.breed}`}
                                            {animal.strain && ` \u2022 ${animal.strain}`}
                                            {animal.id_public && ` \u2022 ${animal.id_public}`}
                                        </p>
                                        {/* Name */}
                                        <h2 className="text-xl font-bold text-gray-800 leading-tight">
                                            {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                                        </h2>
                                        {/* DOB + age */}
                                        {animal.birthDate && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Born:</span> {formatDate(animal.birthDate)} {(() => {
                                                    const birth = new Date(animal.birthDate);
                                                    const endDate = animal.deceasedDate ? new Date(animal.deceasedDate) : new Date();
                                                    let years = endDate.getFullYear() - birth.getFullYear();
                                                    let months = endDate.getMonth() - birth.getMonth();
                                                    let days = endDate.getDate() - birth.getDate();
                                                    if (days < 0) { months--; days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate(); }
                                                    if (months < 0) { years--; months += 12; }
                                                    const ageStr = years > 0 ? `${years}y ${months}m ${days}d` : (months > 0 ? `${months}m ${days}d` : `${days}d`);
                                                    if (animal.deceasedDate) {
                                                        return <span className="text-red-600 font-semibold ml-2">{"†"} {formatDate(animal.deceasedDate)} (Lived {ageStr})</span>;
                                                    } else {
                                                        return <span>(~{ageStr})</span>;
                                                    }
                                                })()}
                                            </p>
                                        )}
                                        {/* Variety */}
                                        {(animal.color || animal.coat || animal.coatPattern || animal.earset) && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Variety:</span> {[animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).join(' ')}
                                            </p>
                                        )}
                                        {animal.carrierTraits && (
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Carrier:</span> {animal.carrierTraits}</p>
                                        )}
                                        {animal.geneticCode && (
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Genetic Code:</span> <code className="bg-gray-100 px-1 rounded font-mono">{animal.geneticCode}</code></p>
                                        )}
                                        {animal.remarks && (
                                            <p className="text-sm text-gray-700 line-clamp-2"><span className="font-semibold">Remarks:</span> {animal.remarks}</p>
                                        )}
                                        {/* Breeder + IDs */}
                                        {animal.breederId_public && (
                                            <div className="border-t border-gray-200 pt-2 space-y-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Breeder:</span>{' '}
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
                                                </div>
                                                {(animal.breederAssignedId || animal.microchipNumber || animal.pedigreeRegistrationId) && (
                                                    <hr className="border-gray-200" />
                                                )}
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                    {animal.breederAssignedId && <div><span className="text-gray-500">Assigned ID:</span> <strong>{animal.breederAssignedId}</strong></div>}
                                                    {animal.microchipNumber && <div><span className="text-gray-500">Microchip:</span> <strong>{animal.microchipNumber}</strong></div>}
                                                    {animal.pedigreeRegistrationId && <div><span className="text-gray-500">Pedigree Reg:</span> <strong>{animal.pedigreeRegistrationId}</strong></div>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Parents */}
                            {(animal.fatherId_public || animal.sireId_public || animal.motherId_public || animal.damId_public) && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Parents</h3>
                                        {animalCOI != null && <span className="text-sm text-gray-700"><span className="font-medium">COI:</span> {animalCOI.toFixed(2)}%</span>}
                                        {loadingCOI && <span className="text-xs text-gray-400">Calculating COI...</span>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <ViewOnlyParentCard
                                            parentId={animal.fatherId_public || animal.sireId_public}
                                            parentType="Sire"
                                            API_BASE_URL={API_BASE_URL}
                                            onViewAnimal={onViewAnimal}
                                            authToken={authToken}
                                        />
                                        <ViewOnlyParentCard
                                            parentId={animal.motherId_public || animal.damId_public}
                                            parentType="Dam"
                                            API_BASE_URL={API_BASE_URL}
                                            onViewAnimal={onViewAnimal}
                                            authToken={authToken}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Status & Privacy */}
                    {detailViewTab === 2 && (
                        <div className="space-y-6">
                            {/* 1st Section: Ownership */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Users size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Ownership</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Currently Owned:</span>
                                        <strong>{animal.isOwned ? 'Yes' : 'No'}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Breeder:</span>
                                        {breederInfo ? (
                                            <button
                                                onClick={() => onViewProfile && onViewProfile(breederInfo)}
                                                className="text-primary hover:underline font-semibold"
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
                                            <strong>{animal.manualBreederName || animal.breederId_public || ''}</strong>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 2nd Section: Current Owner */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Keeper</h3>
                                <div className="text-sm space-y-2">
                                    {(animal.keeperName || animal.isOwned) && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Keeper Name:</span>
                                        <strong>{animal.keeperName || (animal.isOwned ? 'Me' : '')}</strong>
                                    </div>
                                    )}
                                    {animal.coOwnership && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">Co-Ownership:</span>
                                            <strong>{animal.coOwnership}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3rd Section: Keeper History */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Keeper History</h3>
                                {(animal.keeperHistory || []).length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No entries yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {(animal.keeperHistory || []).map((entry, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800">{entry.name || 'Unknown'}</p>
                                                    {entry.userId_public && <p className="text-xs text-gray-400 font-mono">{entry.userId_public}</p>}
                                                </div>
                                                {entry.country && (
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <span className={`${getCountryFlag(entry.country)} inline-block h-4 w-6`}></span>
                                                        <span className="text-xs text-gray-500">{getCountryName(entry.country)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 4th Section: Availability for Sale or Stud */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Tag size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Availability for Sale or Stud</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">For Sale:</span>
                                        <strong>{animal.isForSale ? `Yes - ${animal.salePriceCurrency || ''} ${animal.salePriceAmount || 'Negotiable'}`.trim() : 'No'}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">For Stud:</span>
                                        <strong>{animal.availableForBreeding ? `Yes - ${animal.studFeeCurrency || ''} ${animal.studFeeAmount || 'Negotiable'}`.trim() : 'No'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Appearance */}
                    {detailViewTab === 4 && (
                        <div className="space-y-6">
                            {/* Appearance */}
                            {(() => {
                                const fields = [
                                    { key: 'color', label: 'Color' },
                                    { key: 'coatPattern', label: 'Pattern' },
                                    { key: 'coat', label: 'Coat Type' },
                                    { key: 'earset', label: 'Earset' },
                                    { key: 'phenotype', label: 'Phenotype' },
                                    { key: 'morph', label: 'Morph' },
                                    { key: 'markings', label: 'Markings' },
                                    { key: 'eyeColor', label: 'Eye Color' },
                                    { key: 'nailColor', label: 'Nail/Claw Color' },
                                    { key: 'size', label: 'Size' },
                                    { key: 'carrierTraits', label: 'Carrier Traits' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return fields.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Sparkles size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Appearance</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {fields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Genetic Code */}
                            {fieldTemplate?.fields?.geneticCode?.enabled !== false && animal.geneticCode && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Dna size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> {getLabel('geneticCode', 'Genetic Code')}</h3>
                                    <p className="text-gray-700 font-mono text-sm break-all">{animal.geneticCode}</p>
                                </div>
                            )}

                            {/* Life Stage */}
                            {fieldTemplate?.fields?.lifeStage?.enabled !== false && animal.lifeStage && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Sprout size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> {getLabel('lifeStage', 'Life Stage')}</h3>
                                    <p className="text-gray-700 text-sm">{animal.lifeStage}</p>
                                </div>
                            )}

                            {/* Measurements */}
                            {(() => {
                                const mFields = [
                                    { key: 'bodyWeight', label: 'Weight' },
                                    { key: 'bodyLength', label: 'Body Length' },
                                    { key: 'heightAtWithers', label: 'Height at Withers' },
                                    { key: 'chestGirth', label: 'Chest Girth' },
                                    { key: 'adultWeight', label: 'Adult Weight' },
                                    { key: 'bodyConditionScore', label: 'Body Condition Score' },
                                    { key: 'length', label: 'Length' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return mFields.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Ruler size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Measurements</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {mFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tab 3: Identification */}
                    {detailViewTab === 3 && (
                        <div className="space-y-6">
                            {/* Identification Numbers */}
                            {(() => {
                                const idFields = [
                                    { key: 'breederAssignedId', label: 'Identification' },
                                    { key: 'microchipNumber', label: 'Microchip Number' },
                                    { key: 'pedigreeRegistrationId', label: 'Pedigree Registration ID' },
                                    { key: 'colonyId', label: 'Colony ID' },
                                    { key: 'rabiesTagNumber', label: 'Rabies Tag Number' },
                                    { key: 'tattooId', label: 'Tattoo ID' },
                                    { key: 'akcRegistrationNumber', label: 'AKC Registration #' },
                                    { key: 'fciRegistrationNumber', label: 'FCI Registration #' },
                                    { key: 'cfaRegistrationNumber', label: 'CFA Registration #' },
                                    { key: 'workingRegistryIds', label: 'Working Registry IDs' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Hash size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Identification Numbers</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div><span className="text-gray-600">CritterTrack ID:</span> <strong>{animal.id_public || ''}</strong></div>
                                            {idFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Classification */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><FolderOpen size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Classification</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Species:</span> <strong>{animal.species || ''}</strong></div>
                                    {fieldTemplate?.fields?.breed?.enabled !== false && animal.breed && (
                                        <div><span className="text-gray-600">{getLabel('breed', 'Breed')}:</span> <strong>{animal.breed}</strong></div>
                                    )}
                                    {fieldTemplate?.fields?.strain?.enabled !== false && animal.strain && (
                                        <div><span className="text-gray-600">{getLabel('strain', 'Strain')}:</span> <strong>{animal.strain}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* Tags */}
                            {animal.tags && animal.tags.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Tag size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {animal.tags.map((tag, idx) => (
                                            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Origin */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Globe size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Origin</h3>
                                <p className="text-sm text-gray-700">{animal.origin || ''}</p>
                            </div>
                        </div>
                    )}

                    {/* Tab 6: Family */}
                    {detailViewTab === 6 && (
                        <div className="space-y-6">
                            {/* Pedigree link */}
                            <div>
                                <span className="text-xs text-orange-500 font-medium">&#x1F4CA; Pedigree chart available on the <button onClick={() => setDetailViewTab(5)} className="underline hover:text-orange-600 transition">Beta Pedigree</button> tab</span>
                            </div>

                            {/* Offspring & Litters - merged litters + pedigree offspring */}
                            {(animalLitters === null || pedigreeOffspring === null) ? (
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <div className="text-sm text-gray-500 animate-pulse">Loading offspring & litters?</div>
                                </div>
                            ) : (() => {
                                const litterItems = (animalLitters || []).map(l => ({ ...l, _recordType: 'litter' }));
                                const pedItems = (pedigreeOffspring || []).map(l => ({ ...l, _recordType: 'pedigree' }));
                                const _pubToday = new Date();
                                const allRecords = [...litterItems, ...pedItems].sort((a, b) => {
                                    const aIsMated = a.isPlanned && a.matingDate && new Date(a.matingDate) <= _pubToday;
                                    const bIsMated = b.isPlanned && b.matingDate && new Date(b.matingDate) <= _pubToday;
                                    const aRank = aIsMated ? 0 : a.isPlanned ? 1 : 2;
                                    const bRank = bIsMated ? 0 : b.isPlanned ? 1 : 2;
                                    if (aRank !== bRank) return aRank - bRank;
                                    const aDate = a.birthDate || a.matingDate;
                                    const bDate = b.birthDate || b.matingDate;
                                    if (!aDate) return 1;
                                    if (!bDate) return -1;
                                    return new Date(bDate) - new Date(aDate);
                                });
                                if (allRecords.length === 0) return null;
                                return (
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-3">
                                        <h3 className="text-lg font-semibold text-gray-700 flex items-center"><Users size={20} className="text-purple-600 mr-2" />Offspring & Litters</h3>
                                        <div className="space-y-2">
                                            {allRecords.map((litter) => {
                                                if (litter._recordType === 'litter') {
                                                    const lid = litter.litter_id_public;
                                                    const isSire = litter.sireId_public === animal.id_public;
                                                    const mate = isSire ? litter.dam : litter.sire;
                                                    const isExpanded = expandedBreedingRecords[lid];
                                                    const displayName = litter.breedingPairCodeName;
                                                    const lIsMated = litter.isPlanned && litter.matingDate && new Date(litter.matingDate) <= _pubToday;
                                                    const lIsPlannedOnly = litter.isPlanned && !lIsMated;
                                                    return (
                                                        <div key={lid} className={`bg-white rounded border transition-all ${isExpanded ? 'border-purple-300 shadow-md' : 'border-purple-100'}`}>
                                                            <div
                                                                onClick={() => setExpandedBreedingRecords({...expandedBreedingRecords, [lid]: !isExpanded})}
                                                                className="p-2 sm:p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition rounded"
                                                            >
                                                                {/* Mobile: stacked */}
                                                                <div className="flex-1 sm:hidden">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <p className="font-bold text-gray-800 text-sm">{displayName || <span className="text-gray-400 font-normal">Unnamed Litter</span>}</p>
                                                                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                                            {lid && <span className="text-xs font-mono bg-purple-100 px-1.5 py-0.5 rounded text-purple-700">{lid}</span>}
                                                                            {lIsPlannedOnly && <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5"><Hourglass size={12} className="inline-block align-middle mr-0.5" /> Planned</span>}
                                                                            {lIsMated && <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5"><Heart size={12} className="inline-block align-middle mr-0.5" /> Mated</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 flex gap-2 flex-wrap items-center">
                                                                        {!litter.isPlanned && litter.birthDate && <span>{formatDate(litter.birthDate)}{litterAge(litter.birthDate) && <span className="ml-1 font-semibold text-green-600">? {litterAge(litter.birthDate)}</span>}</span>}
                                                                        {lIsMated && <span className="text-purple-600">{formatDate(litter.matingDate)}</span>}
                                                                        {lIsPlannedOnly && litter.matingDate && <span className="text-indigo-600">{formatDate(litter.matingDate)}</span>}
                                                                        {mate?.name && <span className="truncate max-w-[120px]">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</span>}
                                                                        {litter.inbreedingCoefficient != null && <span className="text-gray-500">{litter.inbreedingCoefficient.toFixed(2)}%</span>}
                                                                        {(litter.litterSizeBorn != null || litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && (
                                                                            <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                                                                {litter.litterSizeBorn != null && <span className="font-bold text-gray-900">{litter.litterSizeBorn}</span>}
                                                                                {litter.litterSizeBorn != null && (litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && <span className="text-gray-400">?</span>}
                                                                                {(litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && (
                                                                                    <span className="inline-flex gap-0.5 font-semibold">
                                                                                        <span className="text-blue-500">{litter.maleCount ?? 0}M</span>
                                                                                        <span className="text-gray-400">/</span>
                                                                                        <span className="text-pink-500">{litter.femaleCount ?? 0}F</span>
                                                                                        <span className="text-gray-400">/</span>
                                                                                        <span className="text-purple-500">{litter.unknownCount ?? 0}U</span>
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {/* Desktop: 6-column grid */}
                                                                <div className="hidden sm:grid flex-1 grid-cols-6 gap-3 items-center min-w-0">
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold text-gray-800 text-sm truncate">{displayName || <span className="text-gray-400 font-normal text-xs">Unnamed</span>}</p>
                                                                        {lIsPlannedOnly && <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5 inline-block mt-0.5"><Hourglass size={12} className="inline-block align-middle mr-0.5" /> Planned</span>}
                                                                        {lIsMated && <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5 inline-block mt-0.5"><Heart size={12} className="inline-block align-middle mr-0.5" /> Mated</span>}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        {lid ? <span className="text-xs font-mono bg-purple-100 px-2 py-0.5 rounded text-purple-700 block w-fit">{lid}</span> : <span className="text-xs text-gray-400">?</span>}
                                                                    </div>
                                                                    <div>
                                                                        {lIsPlannedOnly ? (<>
                                                                            <span className="text-indigo-400 text-[10px] uppercase tracking-wide font-semibold block">Planned</span>
                                                                            <span className="text-sm font-semibold text-indigo-700">{formatDate(litter.matingDate) || '?'}</span>
                                                                        </>) : lIsMated ? (<>
                                                                            <span className="text-purple-400 text-[10px] uppercase tracking-wide font-semibold block">Mated</span>
                                                                            <span className="text-sm font-semibold text-purple-700">{formatDate(litter.matingDate) || '?'}</span>
                                                                        </>) : (<>
                                                                            <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Birth</span>
                                                                            <span className="text-sm font-semibold text-gray-800">{formatDate(litter.birthDate) || '?'}{litter.birthDate && litterAge(litter.birthDate) && <span className="ml-1 text-xs font-semibold text-green-600">? {litterAge(litter.birthDate)}</span>}</span>
                                                                        </>)}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Mate</span>
                                                                        <span className="text-sm font-semibold text-gray-800 truncate block">{mate ? [mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ') : '?'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">COI</span>
                                                                        <span className="text-sm font-semibold text-gray-800">{litter.inbreedingCoefficient != null ? `${litter.inbreedingCoefficient.toFixed(2)}%` : '?'}</span>
                                                                    </div>
                                                                    <div>
                                                                        {lIsPlannedOnly ? (<>
                                                                            <span className="text-indigo-400 text-[10px] uppercase tracking-wide font-semibold block">Due</span>
                                                                            <span className="text-sm font-semibold text-indigo-700">{formatDate(litter.expectedDueDate) || '?'}</span>
                                                                        </>) : lIsMated ? (<>
                                                                            <span className="text-purple-400 text-[10px] uppercase tracking-wide font-semibold block">Status</span>
                                                                            <span className="text-xs font-semibold text-purple-500">Awaiting birth</span>
                                                                        </>) : (<>
                                                                            <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Born</span>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-sm font-bold text-gray-800">{litter.litterSizeBorn ?? litter.numberBorn ?? 0}</span>
                                                                                {(litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && (
                                                                                    <span className="text-xs ml-1">
                                                                                        <span className="text-blue-500 font-semibold">{litter.maleCount ?? 0}M</span>
                                                                                        <span className="text-gray-400 mx-0.5">/</span>
                                                                                        <span className="text-pink-500 font-semibold">{litter.femaleCount ?? 0}F</span>
                                                                                        <span className="text-gray-400 mx-0.5">/</span>
                                                                                        <span className="text-purple-500 font-semibold">{litter.unknownCount ?? 0}U</span>
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </>)}
                                                                    </div>
                                                                </div>
                                                                <ChevronDown size={18} className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`} />
                                                            </div>
                                                            {isExpanded && (
                                                                <div className="border-t border-purple-100 p-3 bg-purple-50 space-y-3">
                                                                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-start sm:items-center">
                                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm h-full grid grid-cols-2 divide-x divide-gray-200 gap-3">
                                                                            <div>
                                                                                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Litter Name</div>
                                                                                {displayName ? <div className="text-sm font-bold text-gray-800">{displayName}</div> : <div className="text-sm text-gray-400 italic">?</div>}
                                                                            </div>
                                                                            <div className="pl-3">
                                                                                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">CTL ID</div>
                                                                                {lid ? <div className="font-mono text-sm font-bold text-purple-700">{lid}</div> : <div className="text-sm text-gray-400 italic">?</div>}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col items-center px-2">
                                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">COI</div>
                                                                            {litter.inbreedingCoefficient != null ? <div className="text-base font-medium text-gray-800">{litter.inbreedingCoefficient.toFixed(2)}%</div> : <div className="text-base font-medium text-gray-300">?</div>}
                                                                        </div>
                                                                        {mate ? (
                                                                            <div onClick={() => onViewAnimal && onViewAnimal(mate)} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition shadow-sm">
                                                                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                                    {mate.imageUrl || mate.photoUrl ? <img src={mate.imageUrl || mate.photoUrl} alt={mate.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><Cat size={18} /></div>}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mate</div>
                                                                                    <p className="font-bold text-gray-800 truncate text-sm">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</p>
                                                                                    <p className="text-xs text-gray-500">{mate.species}</p>
                                                                                    <p className="text-[10px] text-gray-400 font-mono">{mate.id_public}</p>
                                                                                </div>
                                                                            </div>
                                                                        ) : <div />}
                                                                    </div>
                                                                    {(litter.matingDate || litter.pairingDate || litter.breedingMethod || litter.breedingConditionAtTime || litter.outcome || litter.birthDate || litter.birthMethod || litter.expectedDueDate || litter.weaningDate) && (
                                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                                            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Breeding &amp; Birth</h4>
                                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mating Date</div><div className="font-semibold text-gray-800">{formatDate(litter.matingDate || litter.pairingDate) || '?'}</div></div>
                                                                                {litter.expectedDueDate && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Expected Due Date</div><div className="font-semibold text-gray-800">{formatDate(litter.expectedDueDate)}</div></div>}
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Breeding Method</div><div className="font-semibold text-gray-800">{litter.breedingMethod || '?'}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Breeding Condition</div><div className="font-semibold text-gray-800">{litter.breedingConditionAtTime || '?'}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Outcome</div><div className={`font-semibold ${litter.outcome === 'Successful' ? 'text-green-600' : litter.outcome === 'Unsuccessful' ? 'text-red-500' : 'text-gray-800'}`}>{litter.outcome || '?'}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Birth Method</div><div className="font-semibold text-gray-800">{litter.birthMethod || '?'}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Birth Date</div><div className="font-semibold text-gray-800">{formatDate(litter.birthDate) || '?'}{litter.birthDate && !litter.isPlanned && litterAge(litter.birthDate) && <span className="ml-2 text-xs font-semibold text-green-600">{litterAge(litter.birthDate)}</span>}</div></div>
                                                                                {litter.weaningDate && <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Weaning Date</div><div className="font-semibold text-gray-800">{formatDate(litter.weaningDate)}</div></div>}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                                        <div className="grid grid-cols-2 divide-x divide-gray-200">
                                                                            <div className="grid grid-cols-3 pr-3">
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Born</div><div className="text-lg font-bold text-gray-800">{litter.litterSizeBorn ?? litter.numberBorn ?? 0}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Stillborn</div><div className="text-lg font-bold text-gray-400">{litter.stillbornCount ?? litter.stillborn ?? 0}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Weaned</div><div className="text-lg font-bold text-green-600">{litter.litterSizeWeaned ?? litter.numberWeaned ?? 0}</div></div>
                                                                            </div>
                                                                            <div className="grid grid-cols-3 pl-3">
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Males</div><div className="text-lg font-bold text-blue-500">{litter.maleCount ?? 0}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Females</div><div className="text-lg font-bold text-pink-500">{litter.femaleCount ?? 0}</div></div>
                                                                                <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Unknown</div><div className="text-lg font-bold text-purple-500">{litter.unknownCount ?? 0}</div></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {litter.notes && <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm"><h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</h4><p className="text-sm text-gray-700 italic leading-relaxed">{litter.notes}</p></div>}
                                                                    {/* -- 4b. Photos ----------------------------------------- */}
                                                                    {!litter.isPlanned && litter.images && litter.images.length > 0 && (
                                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                                            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Photos</h4>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {litter.images.map((img, idx) => (
                                                                                    <div key={img.r2Key || idx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                                                                        <img src={img.url} alt={"Gallery " + (idx + 1)} className="w-full h-full object-cover cursor-pointer" onClick={() => window.open(img.url, '_blank')} />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {lid && breedingRecordOffspring[lid] === undefined && (
                                                                        <div className="bg-white p-3 rounded border border-purple-100">
                                                                            <div className="text-sm font-semibold text-gray-700 mb-3">Offspring</div>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                                                {[...Array(3)].map((_, i) => (
                                                                                    <div key={i} className="rounded-lg border-2 border-gray-200 h-52 animate-pulse bg-gray-50 flex flex-col items-center pt-2">
                                                                                        <div className="flex-1 flex items-center justify-center w-full px-2 mt-1"><div className="w-20 h-20 bg-gray-200 rounded-md" /></div>
                                                                                        <div className="w-full px-2 pb-2"><div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-1" /><div className="h-2 bg-gray-200 rounded w-1/2 mx-auto" /></div>
                                                                                        <div className="w-full bg-gray-100 py-1 border-t border-gray-200 mt-auto" />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {lid && breedingRecordOffspring[lid] && breedingRecordOffspring[lid].length > 0 && (
                                                                        <div className="bg-white p-3 rounded border border-purple-100">
                                                                            <div className="text-sm font-semibold text-gray-700 mb-3">Offspring ({breedingRecordOffspring[lid].length})</div>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                                                {breedingRecordOffspring[lid].map(offspring => (
                                                                                    offspring.isPrivate ? (
                                                                                        <div key={offspring.id_public} className="relative bg-gray-50 rounded-lg border-2 border-gray-200 h-52 flex flex-col items-center overflow-hidden pt-2">
                                                                                            <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                                                <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center">
                                                                                                    <EyeOff size={28} className="text-gray-300" />
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="w-full text-center px-2 pb-1"><div className="text-sm font-semibold text-gray-400 truncate">Private</div></div>
                                                                                            <div className="w-full px-2 pb-2 flex justify-end"><div className="text-xs text-gray-300 font-mono">?</div></div>
                                                                                            <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-200 mt-auto"><div className="text-xs font-medium text-gray-400">{offspring.gender || '?'}</div></div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div key={offspring.id_public} onClick={() => onViewAnimal && onViewAnimal(offspring)} className="relative bg-white rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 border-gray-200 pt-2">
                                                                                            {offspring.gender && (
                                                                                                <div className="absolute top-1.5 right-1.5">
                                                                                                    {offspring.gender === 'Male' ? <Mars size={14} strokeWidth={2.5} className="text-primary" /> : offspring.gender === 'Female' ? <Venus size={14} strokeWidth={2.5} className="text-accent" /> : offspring.gender === 'Intersex' ? <VenusAndMars size={14} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={14} strokeWidth={2.5} className="text-gray-400" />}
                                                                                                </div>
                                                                                            )}
                                                                                            <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                                                {offspring.imageUrl || offspring.photoUrl ? <img src={offspring.imageUrl || offspring.photoUrl} alt={offspring.name} className="w-20 h-20 object-cover rounded-md" /> : <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400"><Cat size={32} /></div>}
                                                                                            </div>
                                                                                            <div className="w-full text-center px-2 pb-1"><div className="text-sm font-semibold text-gray-800 truncate">{[offspring.prefix, offspring.name, offspring.suffix].filter(Boolean).join(' ')}</div></div>
                                                                                            <div className="w-full px-2 pb-2 flex justify-end"><div className="text-xs text-gray-500">{offspring.id_public}</div></div>
                                                                                            <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto"><div className="text-xs font-medium text-gray-700">{offspring.status || offspring.gender || 'Unknown'}</div></div>
                                                                                        </div>
                                                                                    )
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                } else {
                                                    const recKey = `${litter.birthDate || 'unknown'}_${litter.otherParent?.id_public || 'none'}`;
                                                    const mate = litter.otherParent;
                                                    const isExpanded = expandedPedigreeRecords[recKey];
                                                    const offspringList = litter.offspring || [];
                                                    const maleCount = offspringList.filter(o => o.gender === 'Male').length;
                                                    const femaleCount = offspringList.filter(o => o.gender === 'Female').length;
                                                    const unknownCount = offspringList.filter(o => o.gender !== 'Male' && o.gender !== 'Female').length;
                                                    const coi = offspringList.find(o => o.inbreedingCoefficient != null)?.inbreedingCoefficient ?? null;
                                                    return (
                                                        <div key={recKey} className={`bg-white rounded border transition-all ${isExpanded ? 'border-purple-300 shadow-md' : 'border-purple-100'}`}>
                                                            <div
                                                                onClick={() => setExpandedPedigreeRecords({...expandedPedigreeRecords, [recKey]: !isExpanded})}
                                                                className="p-2 sm:p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition rounded"
                                                            >
                                                                <div className="flex-1 sm:hidden">
                                                                    <div className="text-xs text-gray-600 flex gap-2 flex-wrap items-center">
                                                                        {litter.birthDate && <span>{formatDate(litter.birthDate)}</span>}
                                                                        {mate?.name && <span className="truncate max-w-[120px]">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</span>}
                                                                        <span>{offspringList.length} born</span>
                                                                        {coi != null && <span className="text-gray-500">COI {coi.toFixed(2)}%</span>}
                                                                        {offspringList.length > 0 && (
                                                                            <span className="inline-flex gap-0.5 font-semibold">
                                                                                <span className="text-blue-500">{maleCount}M</span><span className="text-gray-400">/</span><span className="text-pink-500">{femaleCount}F</span><span className="text-gray-400">/</span><span className="text-purple-500">{unknownCount}U</span>
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="hidden sm:grid flex-1 grid-cols-4 gap-3 items-center min-w-0">
                                                                    <div><span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Birth</span><span className="text-sm font-semibold text-gray-800">{formatDate(litter.birthDate) || '?'}</span></div>
                                                                    <div className="min-w-0"><span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Mate</span><span className="text-sm font-semibold text-gray-800 truncate block">{mate ? [mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ') : '?'}</span></div>
                                                                    <div><span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">COI</span><span className="text-sm font-semibold text-gray-800">{coi != null ? `${coi.toFixed(2)}%` : '?'}</span></div>
                                                                    <div><span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Born</span><div className="flex items-center gap-1.5"><span className="text-sm font-bold text-gray-800">{offspringList.length}</span>{offspringList.length > 0 && (<span className="text-xs ml-1"><span className="text-blue-500 font-semibold">{maleCount}M</span><span className="text-gray-400 mx-0.5">/</span><span className="text-pink-500 font-semibold">{femaleCount}F</span><span className="text-gray-400 mx-0.5">/</span><span className="text-purple-500 font-semibold">{unknownCount}U</span></span>)}</div></div>
                                                                </div>
                                                                <ChevronDown size={18} className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`} />
                                                            </div>
                                                            {isExpanded && (
                                                                <div className="border-t border-purple-100 p-3 bg-purple-50 space-y-3">
                                                                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-start sm:items-center">
                                                                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm h-full">
                                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Birth Date</div>
                                                                            {litter.birthDate ? <div className="text-sm font-bold text-gray-800">{formatDate(litter.birthDate)}</div> : <div className="text-sm text-gray-400 italic">?</div>}
                                                                        </div>
                                                                        <div className="flex flex-col items-center px-2">
                                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">COI</div>
                                                                            {coi != null ? <div className="text-base font-medium text-gray-800">{coi.toFixed(2)}%</div> : <div className="text-base font-medium text-gray-300">?</div>}
                                                                        </div>
                                                                        {mate ? (
                                                                            <div onClick={() => onViewAnimal && onViewAnimal(mate)} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition shadow-sm">
                                                                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                                    {mate.imageUrl || mate.photoUrl ? <img src={mate.imageUrl || mate.photoUrl} alt={mate.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><Cat size={18} /></div>}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mate</div>
                                                                                    <p className="font-bold text-gray-800 truncate text-sm">{[mate.prefix, mate.name, mate.suffix].filter(Boolean).join(' ')}</p>
                                                                                    <p className="text-xs text-gray-500">{mate.species}</p>
                                                                                    <p className="text-[10px] text-gray-400 font-mono">{mate.id_public}</p>
                                                                                </div>
                                                                            </div>
                                                                        ) : <div />}
                                                                    </div>
                                                                    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                                                                        <div className="grid grid-cols-4 gap-3">
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Born</div><div className="text-lg font-bold text-gray-800">{offspringList.length}</div></div>
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Males</div><div className="text-lg font-bold text-blue-500">{maleCount}</div></div>
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Females</div><div className="text-lg font-bold text-pink-500">{femaleCount}</div></div>
                                                                            <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Unknown</div><div className="text-lg font-bold text-purple-500">{unknownCount}</div></div>
                                                                        </div>
                                                                    </div>
                                                                    {offspringList.length > 0 && (
                                                                        <div className="bg-white p-3 rounded border border-purple-100">
                                                                            <div className="text-sm font-semibold text-gray-700 mb-3">Offspring ({offspringList.length})</div>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                                                {offspringList.map(offspring => (
                                                                                    <div key={offspring.id_public || offspring._id} onClick={() => onViewAnimal && onViewAnimal(offspring)} className="relative bg-white rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border-2 border-gray-200 pt-2">
                                                                                        {offspring.gender && (
                                                                                            <div className="absolute top-1.5 right-1.5">{offspring.gender === 'Male' ? <Mars size={14} strokeWidth={2.5} className="text-primary" /> : offspring.gender === 'Female' ? <Venus size={14} strokeWidth={2.5} className="text-accent" /> : offspring.gender === 'Intersex' ? <VenusAndMars size={14} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={14} strokeWidth={2.5} className="text-gray-400" />}</div>
                                                                                        )}
                                                                                        <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                                            {offspring.imageUrl || offspring.photoUrl ? <img src={offspring.imageUrl || offspring.photoUrl} alt={offspring.name} className="w-20 h-20 object-cover rounded-md" /> : <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400"><Cat size={32} /></div>}
                                                                                        </div>
                                                                                        <div className="w-full text-center px-2 pb-1"><div className="text-sm font-semibold text-gray-800 truncate">{[offspring.prefix, offspring.name, offspring.suffix].filter(Boolean).join(' ')}</div></div>
                                                                                        <div className="w-full px-2 pb-2 flex justify-end"><div className="text-xs text-gray-500">{offspring.id_public}</div></div>
                                                                                        <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto"><div className="text-xs font-medium text-gray-700">{offspring.status || offspring.gender || 'Unknown'}</div></div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}

                        </div>
                    )}                    {/* Tab 7: Fertility */}
                    {detailViewTab === 7 && (
                        <div className="space-y-6">
                            {/* 1st Section: Reproductive Status */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Leaf size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Reproductive Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Neutered/Spayed:</span> <strong>{animal.isNeutered ? 'Yes' : 'No'}</strong></div>
                                    <div><span className="text-gray-600">Infertile:</span> <strong>{animal.isInfertile ? 'Yes' : 'No'}</strong></div>
                                    {!animal.isNeutered && !animal.isInfertile && (
                                        <div><span className="text-gray-600">In Mating:</span> <strong>{animal.isInMating ? 'Yes' : 'No'}</strong></div>
                                    )}
                                    {(animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && !animal.isNeutered && (
                                        <>
                                            <div><span className="text-gray-600">{getLabel('isPregnant', 'Pregnant')}:</span> <strong>{animal.isPregnant ? 'Yes' : 'No'}</strong></div>
                                            <div><span className="text-gray-600">{getLabel('isNursing', 'Nursing')}:</span> <strong>{animal.isNursing ? 'Yes' : 'No'}</strong></div>
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
                                    <h3 className="text-lg font-semibold text-gray-700"><RefreshCw size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Estrus/Cycle</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Heat Status:</span> <strong>{animal.heatStatus || ''}</strong></div>
                                        <div><span className="text-gray-600">Last Heat Date:</span> <strong>{animal.lastHeatDate ? formatDate(animal.lastHeatDate) : ''}</strong></div>
                                        <div><span className="text-gray-600">{getLabel('ovulationDate', 'Ovulation Date')}:</span> <strong>{animal.ovulationDate ? formatDate(animal.ovulationDate) : ''}</strong></div>
                                        {animal.estrusCycleLength && (
                                            <div><span className="text-gray-600">Estrus Cycle Length:</span> <strong>{`${animal.estrusCycleLength} days`}</strong></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 4th Section: Stud Information */}
                            {!animal.isNeutered && !animal.isInfertile && (animal.gender === 'Male' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Mars size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Sire Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Fertility Status:</span> <strong>{animal.fertilityStatus || ''}</strong></div>
                                    </div>
                                    {animal.fertilityNotes && (
                                        <div className="text-sm"><span className="text-gray-600">Notes:</span> <strong className="whitespace-pre-wrap">{animal.fertilityNotes}</strong></div>
                                    )}
                                    {animal.reproductiveClearances && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Clearances:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveClearances}</strong></div>
                                    )}
                                    {animal.reproductiveComplications && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Complications:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveComplications}</strong></div>
                                    )}
                                </div>
                            )}

                            {/* 5th Section: Dam Information */}
                            {!animal.isNeutered && !animal.isInfertile && (animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown') && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Venus size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Dam Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">{getLabel('damFertilityStatus', 'Dam Fertility Status')}:</span> <strong>{animal.damFertilityStatus || animal.fertilityStatus || ''}</strong></div>
                                        {animal.gestationLength && (
                                            <div><span className="text-gray-600">{getLabel('gestationLength', 'Gestation Length')}:</span> <strong>{`${animal.gestationLength} days`}</strong></div>
                                        )}
                                        {animal.deliveryMethod && (
                                            <div><span className="text-gray-600">{getLabel('deliveryMethod', 'Delivery Method')}:</span> <strong>{animal.deliveryMethod}</strong></div>
                                        )}
                                        {animal.whelpingDate && (
                                            <div><span className="text-gray-600">{getLabel('whelpingDate', 'Whelping Date')}:</span> <strong>{formatDate(animal.whelpingDate)}</strong></div>
                                        )}
                                        {animal.queeningDate && (
                                            <div><span className="text-gray-600">{getLabel('queeningDate', 'Queening Date')}:</span> <strong>{formatDate(animal.queeningDate)}</strong></div>
                                        )}
                                    </div>
                                    {animal.damFertilityNotes && (
                                        <div className="text-sm"><span className="text-gray-600">Notes:</span> <strong className="whitespace-pre-wrap">{animal.damFertilityNotes}</strong></div>
                                    )}
                                    {animal.reproductiveClearances && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Clearances:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveClearances}</strong></div>
                                    )}
                                    {animal.reproductiveComplications && (
                                        <div className="text-sm"><span className="text-gray-600">Reproductive Complications:</span> <strong className="whitespace-pre-wrap">{animal.reproductiveComplications}</strong></div>
                                    )}
                                </div>
                            )}

                        </div>
                    )}

                    {/* Tab 8: Health */}
                    {detailViewTab === 8 && (
                        <div className="space-y-6">
                            {/* 1st Section: Preventive Care */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, preventiveCare: !p.preventiveCare}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Shield size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Preventive Care</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.preventiveCare ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.preventiveCare && (<div className="space-y-4 mt-4">
                                    {animal.vaccinations && (
                                        <DetailJsonList
                                            label={getLabel('vaccinations', 'Vaccinations')}
                                            data={animal.vaccinations}
                                            renderItem={v => <>{v.name} {v.date && `(${formatDate(v.date)})`}{v.notes && <span className="text-gray-600"> - {v.notes}</span>}</>}
                                        />
                                    )}
                                    {animal.dewormingRecords && (
                                        <DetailJsonList
                                            label="Deworming Records"
                                            data={animal.dewormingRecords}
                                            renderItem={r => <>{r.medication} {r.date && `(${formatDate(r.date)})`}{r.notes && <span className="text-gray-600"> - {r.notes}</span>}</>}
                                        />
                                    )}
                                    {animal.parasiteControl && (
                                        <DetailJsonList
                                            label="Parasite Control"
                                            data={animal.parasiteControl}
                                            renderItem={r => <>{r.treatment} {r.date && `(${formatDate(r.date)})`}{r.notes && <span className="text-gray-600"> - {r.notes}</span>}</>}
                                        />
                                    )}
                                    {fieldTemplate?.fields?.parasitePreventionSchedule?.enabled !== false && animal.parasitePreventionSchedule && (
                                        <div className="text-sm">
                                            <span className="text-gray-600">{getLabel('parasitePreventionSchedule', 'Parasite Prevention Schedule')}:</span>
                                            <strong className="whitespace-pre-wrap">{animal.parasitePreventionSchedule}</strong>
                                        </div>
                                    )}
                                </div>)}
                            </div>

                            {/* 2nd Section: Procedures & Diagnostics */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, proceduresDiagnostics: !p.proceduresDiagnostics}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Microscope size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Procedures & Diagnostics</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.proceduresDiagnostics ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.proceduresDiagnostics && (<div className="space-y-4 mt-4">
                                    {animal.medicalProcedures && (
                                        <DetailJsonList
                                            label="Medical Procedures"
                                            data={animal.medicalProcedures}
                                            renderItem={p => <>{p.name} {p.date && `(${formatDate(p.date)})`}{p.notes && <span className="text-gray-600"> - {p.notes}</span>}</>}
                                        />
                                    )}
                                    {(animal.labResults || animal.laboratoryResults) && (
                                        <DetailJsonList
                                            label="Laboratory Results"
                                            data={animal.labResults || animal.laboratoryResults}
                                            renderItem={r => <>{r.testName} - {r.result} {r.date && `(${formatDate(r.date)})`}{r.notes && <span className="text-gray-600"> - {r.notes}</span>}</>}
                                        />
                                    )}
                                </div>)}
                            </div>

                            {/* 3rd Section: Active Medical Records */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, activeMedical: !p.activeMedical}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Pill size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Active Medical Records</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.activeMedical ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.activeMedical && (<div className="space-y-3 mt-4">
                                    {animal.medicalConditions && (() => {
                                        const d = animal.medicalConditions;
                                        const parsed = typeof d === 'string' ? (() => { try { return JSON.parse(d); } catch { return null; } })() : Array.isArray(d) ? d : null;
                                        return parsed && parsed.length > 0 ? (
                                            <div>
                                                <span className="text-gray-600 text-sm font-semibold">Medical Conditions:</span>
                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                    {parsed.map((item, i) => (
                                                        <li key={i} className="text-gray-700">
                                                            {item.condition || item.name}
                                                            {item.notes && <span className="text-gray-500"> ? {item.notes}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : <div><span className="text-gray-600 text-sm font-semibold">Medical Conditions:</span><strong className="text-sm whitespace-pre-wrap">{d}</strong></div>;
                                    })()}
                                    {animal.allergies && (() => {
                                        const d = animal.allergies;
                                        const parsed = typeof d === 'string' ? (() => { try { return JSON.parse(d); } catch { return null; } })() : Array.isArray(d) ? d : null;
                                        return parsed && parsed.length > 0 ? (
                                            <div>
                                                <span className="text-gray-600 text-sm font-semibold">Allergies:</span>
                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                    {parsed.map((item, i) => (
                                                        <li key={i} className="text-gray-700">
                                                            {item.allergen || item.name}
                                                            {item.notes && <span className="text-gray-500"> ? {item.notes}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : <div><span className="text-gray-600 text-sm font-semibold">Allergies:</span><strong className="text-sm whitespace-pre-wrap">{d}</strong></div>;
                                    })()}
                                    {animal.medications && (() => {
                                        const d = animal.medications;
                                        const parsed = typeof d === 'string' ? (() => { try { return JSON.parse(d); } catch { return null; } })() : Array.isArray(d) ? d : null;
                                        return parsed && parsed.length > 0 ? (
                                            <div>
                                                <span className="text-gray-600 text-sm font-semibold">Current Medications:</span>
                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                    {parsed.map((item, i) => (
                                                        <li key={i} className="text-gray-700">
                                                            {item.medication || item.name}
                                                            {item.notes && <span className="text-gray-500"> ? {item.notes}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : <div><span className="text-gray-600 text-sm font-semibold">Current Medications:</span><strong className="text-sm whitespace-pre-wrap">{d}</strong></div>;
                                    })()}
                                </div>)}
                            </div>

                            {/* 4th Section: Health Clearances & Screening */}
                            {(() => {
                                const clearanceFields = [
                                    { key: 'heartwormStatus', label: 'Heartworm Status' },
                                    { key: 'hipElbowScores', label: 'Hip/Elbow Scores' },
                                    { key: 'eyeClearance', label: 'Eye Clearance' },
                                    { key: 'cardiacClearance', label: 'Cardiac Clearance' },
                                    { key: 'dentalRecords', label: 'Dental Records' },
                                    { key: 'geneticTestResults', label: 'Genetic Test Results' },
                                    { key: 'chronicConditions', label: 'Chronic Conditions' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                const spayDate = fieldTemplate?.fields?.spayNeuterDate?.enabled !== false && animal.spayNeuterDate;
                                return (clearanceFields.length > 0 || spayDate) && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, healthClearances: !p.healthClearances}))} className="w-full flex items-center justify-between text-left group">
                                            <h3 className="text-lg font-semibold text-gray-700"><Hospital size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Health Clearances & Screening</h3>
                                            <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.healthClearances ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                        </button>
                                        {!collapsedHealthSections.healthClearances && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                                            {spayDate && <div><span className="text-gray-600">{getLabel('spayNeuterDate', 'Spay/Neuter Date')}:</span> <strong>{formatDate(animal.spayNeuterDate)}</strong></div>}
                                            {clearanceFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>)}
                                    </div>
                                );
                            })()}

                            {/* 5th Section: Veterinary Care */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => setCollapsedHealthSections(p => ({...p, vetCare: !p.vetCare}))} className="w-full flex items-center justify-between text-left group">
                                    <h3 className="text-lg font-semibold text-gray-700"><Stethoscope size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Veterinary Care</h3>
                                    <span className="text-gray-400 group-hover:text-gray-600">{collapsedHealthSections.vetCare ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}</span>
                                </button>
                                {!collapsedHealthSections.vetCare && (<div className="space-y-4 text-sm mt-4">
                                    {animal.primaryVet && <div><span className="text-gray-600">Primary Veterinarian:</span> <strong>{animal.primaryVet}</strong></div>}
                                    {animal.vetVisits && (
                                        <DetailJsonList
                                            label="Veterinary Visits"
                                            data={animal.vetVisits}
                                            renderItem={v => <>{v.reason} {v.date && `(${formatDate(v.date)})`}{v.notes && <span className="text-gray-600"> - {v.notes}</span>}</>}
                                        />
                                    )}
                                </div>)}
                            </div>
                        </div>
                    )}

                    {/* Tab 9: Care */}
                    {detailViewTab === 9 && (
                        <div className="space-y-6">
                            {/* 1st Section: Nutrition */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><UtensilsCrossed size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Nutrition</h3>
                                {animal.dietType && <div><strong className="text-sm">Diet Type:</strong> <p className="text-sm mt-1">{animal.dietType}</p></div>}
                                {animal.feedingSchedule && <div><strong className="text-sm">Feeding Schedule:</strong> <p className="text-sm mt-1">{animal.feedingSchedule}</p></div>}
                                {animal.supplements && <div><strong className="text-sm">Supplements:</strong> <p className="text-sm mt-1">{animal.supplements}</p></div>}
                                {!animal.dietType && !animal.feedingSchedule && !animal.supplements && <p className="text-sm text-gray-600"></p>}
                            </div>

                            {/* 2nd Section: Housing & Enclosure */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Housing & Enclosure</h3>
                                {animal.housingType && <div><strong className="text-sm">{getLabel('housingType', 'Housing Type')}:</strong> <p className="text-sm mt-1">{animal.housingType}</p></div>}
                                {animal.bedding && <div><strong className="text-sm">{getLabel('bedding', 'Bedding')}:</strong> <p className="text-sm mt-1">{animal.bedding}</p></div>}
                                {animal.enrichment && <div><strong className="text-sm">Enrichment:</strong> <p className="text-sm mt-1">{animal.enrichment}</p></div>}
                                {!animal.housingType && !animal.bedding && !animal.enrichment && <p className="text-sm text-gray-600"></p>}
                                {animal.careTasks && animal.careTasks.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-gray-300">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Enclosure Care Tasks</h4>
                                        <div className="space-y-1">
                                            {animal.careTasks.map((task, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs bg-white px-2 py-1.5 rounded border border-gray-200">
                                                    <span className="font-medium text-gray-700">{task.taskName}</span>
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        {task.frequencyDays && <span>Every {task.frequencyDays}d</span>}
                                                        {task.lastDoneDate && <span>Last: {formatDateShort(task.lastDoneDate)}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3rd Section: Animal Care */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Droplets size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Animal Care</h3>
                                {animal.animalCareTasks && animal.animalCareTasks.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Animal Care Tasks</h4>
                                        <div className="space-y-1">
                                            {animal.animalCareTasks.map((task, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs bg-white px-2 py-1.5 rounded border border-gray-200">
                                                    <span className="font-medium text-gray-700">{task.taskName}</span>
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        {task.frequencyDays && <span>Every {task.frequencyDays}d</span>}
                                                        {task.lastDoneDate && <span>Last: {formatDateShort(task.lastDoneDate)}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-3 text-sm">
                                    {animal.handlingNotes && <div><strong className="text-sm">Handling Notes:</strong> <strong className="text-sm whitespace-pre-wrap">{animal.handlingNotes}</strong></div>}
                                    {animal.socializationNotes && <div><strong className="text-sm">Socialization Notes:</strong> <strong className="text-sm whitespace-pre-wrap">{animal.socializationNotes}</strong></div>}
                                    {animal.specialCareRequirements && <div><strong className="text-sm">Special Care Requirements:</strong> <strong className="text-sm whitespace-pre-wrap">{animal.specialCareRequirements}</strong></div>}
                                </div>
                            </div>

                            {/* 4th Section: Environment */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Thermometer size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Environment</h3>
                                {animal.temperatureRange && <div><strong className="text-sm">Temperature Range:</strong> <p className="text-sm mt-1">{animal.temperatureRange}</p></div>}
                                {animal.humidity && <div><strong className="text-sm">{getLabel('humidity', 'Humidity')}:</strong> <p className="text-sm mt-1">{animal.humidity}</p></div>}
                                {animal.lighting && <div><strong className="text-sm">Lighting:</strong> <p className="text-sm mt-1">{animal.lighting}</p></div>}
                                {animal.noise && <div><strong className="text-sm">{getLabel('noise', 'Noise Level')}:</strong> <p className="text-sm mt-1">{animal.noise}</p></div>}
                                {!animal.temperatureRange && !animal.humidity && !animal.lighting && !animal.noise && <p className="text-sm text-gray-600"></p>}
                            </div>

                            {/* 5th Section: Exercise & Grooming */}
                            {(() => {
                                const egFields = [
                                    { key: 'exerciseRequirements', label: 'Exercise Requirements' },
                                    { key: 'dailyExerciseMinutes', label: 'Daily Exercise (min)' },
                                    { key: 'groomingNeeds', label: 'Grooming Needs' },
                                    { key: 'sheddingLevel', label: 'Shedding Level' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                const trainFlags = [
                                    { key: 'crateTrained', label: 'Crate Trained' },
                                    { key: 'litterTrained', label: 'Litter Trained' },
                                    { key: 'leashTrained', label: 'Leash Trained' },
                                    { key: 'freeFlightTrained', label: 'Free Flight Trained' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return (egFields.length > 0 || trainFlags.length > 0) && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Scissors size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Grooming</h3>
                                        {egFields.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                {egFields.map(f => (
                                                    <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                                ))}
                                            </div>
                                        )}
                                        {trainFlags.length > 0 && (
                                            <div className="flex flex-wrap gap-3 text-sm">
                                                {trainFlags.map(f => (
                                                    <span key={f.key} className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">&#x2713; {getLabel(f.key, f.label)}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tab 10: Behavior */}
                    {detailViewTab === 10 && (
                        <div className="space-y-6">
                            {/* 1st Section: Behavior */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><MessageSquare size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Behavior</h3>
                                {animal.temperament && <div><strong className="text-sm">Temperament:</strong> <p className="text-sm mt-1">{animal.temperament}</p></div>}
                                {animal.handlingTolerance && <div><strong className="text-sm">{getLabel('handlingTolerance', 'Handling Tolerance')}:</strong> <p className="text-sm mt-1">{animal.handlingTolerance}</p></div>}
                                {animal.socialStructure && <div><strong className="text-sm">Social Structure:</strong> <p className="text-sm mt-1">{animal.socialStructure}</p></div>}
                                {!animal.temperament && !animal.handlingTolerance && !animal.socialStructure && <p className="text-sm text-gray-600"></p>}
                            </div>

                            {/* 2nd Section: Activity */}
                            {animal.activityCycle && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Activity size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Activity</h3>
                                {animal.activityCycle && <div><strong className="text-sm">Activity Cycle:</strong> <p className="text-sm mt-1">{animal.activityCycle}</p></div>}
                                {!animal.activityCycle && <p className="text-sm text-gray-600"></p>}
                            </div>
                            )}

                            {/* 3rd Section: Training & Working */}
                            {(() => {
                                const trainFields = [
                                    { key: 'trainingLevel', label: 'Training Level' },
                                    { key: 'trainingDisciplines', label: 'Training Disciplines' },
                                    { key: 'workingRole', label: 'Working Role' },
                                    { key: 'certifications', label: 'Certifications' },
                                    { key: 'behavioralIssues', label: 'Behavioral Issues' },
                                    { key: 'biteHistory', label: 'Bite History' },
                                    { key: 'reactivityNotes', label: 'Reactivity Notes' },
                                ].filter(f => fieldTemplate?.fields?.[f.key]?.enabled !== false && animal[f.key]);
                                return trainFields.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700"><Dumbbell size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Training & Working</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {trainFields.map(f => (
                                                <div key={f.key}><span className="text-gray-600">{getLabel(f.key, f.label)}:</span> <strong>{animal[f.key]}</strong></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Tab 11: Notes */}
                    {detailViewTab === 11 && (
                        <div className="space-y-6">
                            {/* Remarks & Notes */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><FileText size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Remarks & Notes</h3>
                                <strong className="block text-sm text-gray-700 whitespace-pre-wrap">{animal.remarks || ''}</strong>
                            </div>
                        </div>
                    )}

                    {/* Tab 14: End of Life */}
                    {detailViewTab === 14 && (
                        <div className="space-y-6">
                            {/* End of Life */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Feather size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Deceased Date:</span> <strong>{animal.deceasedDate ? formatDate(animal.deceasedDate) : ''}</strong></div>
                                    <div><span className="text-gray-600">Cause of Death:</span> <strong>{animal.causeOfDeath || ''}</strong></div>
                                    <div><span className="text-gray-600">Necropsy Results:</span> <strong>{animal.necropsyResults || ''}</strong></div>
                                    {animal.endOfLifeCareNotes && (
                                        <div><span className="text-gray-600">{getLabel('endOfLifeCareNotes', 'End of Life Care Notes')}:</span> <strong className="whitespace-pre-wrap">{animal.endOfLifeCareNotes}</strong></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 12: Show */}
                    {detailViewTab === 12 && (
                        <div className="space-y-6">
                            {/* Show Titles & Ratings */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Medal size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Show Titles & Ratings</h3>
                                <div className="space-y-3 text-sm">
                                    {animal.showTitles && <div><span className="text-gray-600">Titles:</span> <strong>{animal.showTitles}</strong></div>}
                                    {animal.showRatings && <div><span className="text-gray-600">Ratings:</span> <strong>{animal.showRatings}</strong></div>}
                                    {animal.judgeComments && <div><span className="text-gray-600">Judge Comments:</span> <strong className="whitespace-pre-wrap">{animal.judgeComments}</strong></div>}
                                </div>
                            </div>

                            {/* Working Titles & Performance */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Target size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Working & Performance</h3>
                                    <div className="space-y-3 text-sm">
                                        {animal.workingTitles && <div><span className="text-gray-600">Working Titles:</span> <strong>{animal.workingTitles}</strong></div>}
                                        {animal.performanceScores && <div><span className="text-gray-600">Performance Scores:</span> <strong>{animal.performanceScores}</strong></div>}
                                    </div>
                                </div>

                            {/* Show message if no data */}
                            {!animal.showTitles && !animal.showRatings && !animal.judgeComments && !(animal.workingTitles || animal.performanceScores) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center text-gray-500">
                                    <p>No show information available</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 13: Legal & Documentation */}
                    {detailViewTab === 13 && (
                        <div className="space-y-6">
                            {/* Licensing & Permits */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Key size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Licensing & Permits</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {fieldTemplate?.fields?.licenseNumber?.enabled !== false && animal.licenseNumber && (
                                        <div><span className="text-gray-600">{getLabel('licenseNumber', 'License Number')}:</span> <strong>{animal.licenseNumber}</strong></div>
                                    )}
                                    {fieldTemplate?.fields?.licenseJurisdiction?.enabled !== false && animal.licenseJurisdiction && (
                                        <div><span className="text-gray-600">{getLabel('licenseJurisdiction', 'License Jurisdiction')}:</span> <strong>{animal.licenseJurisdiction}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* Legal / Administrative */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><ClipboardList size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Legal / Administrative</h3>
                                <div className="space-y-3 text-sm">
                                    {fieldTemplate?.fields?.insurance?.enabled !== false && animal.insurance && (
                                        <div><span className="text-gray-600">{getLabel('insurance', 'Insurance')}:</span> <strong className="whitespace-pre-wrap">{animal.insurance}</strong></div>
                                    )}
                                    {fieldTemplate?.fields?.legalStatus?.enabled !== false && animal.legalStatus && (
                                        <div><span className="text-gray-600">{getLabel('legalStatus', 'Legal Status')}:</span> <strong className="whitespace-pre-wrap">{animal.legalStatus}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* Restrictions */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Ban size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Restrictions</h3>
                                <div className="space-y-3 text-sm">
                                    {animal.breedingRestrictions && (
                                        <div><span className="text-gray-600">{getLabel('breedingRestrictions', 'Breeding Restrictions')}:</span> <strong className="whitespace-pre-wrap">{animal.breedingRestrictions}</strong></div>
                                    )}
                                    {animal.exportRestrictions && (
                                        <div><span className="text-gray-600">{getLabel('exportRestrictions', 'Export Restrictions')}:</span> <strong className="whitespace-pre-wrap">{animal.exportRestrictions}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* No data fallback */}
                            {!animal.licenseNumber && !animal.licenseJurisdiction && !animal.insurance && !animal.legalStatus && !animal.breedingRestrictions && !animal.exportRestrictions && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center text-gray-500">
                                    <p>No legal or documentation records</p>
                                </div>
                            )}
                        </div>
                    )}

                {/* -- TAB 15 : Gallery (read-only) --- */}
                {detailViewTab === 15 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700"><Images size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Photo Gallery</h3>
                                <p className="text-xs text-gray-400 mt-0.5">{(animal.extraImages || []).length} photos</p>
                            </div>
                        </div>

                        {(animal.extraImages || []).length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <Camera size={48} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-medium">No photos</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {(animal.extraImages || []).map((url, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                        <img
                                            src={url}
                                            alt={`Gallery photo ${idx + 1}`}
                                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => { setEnlargedImageUrl(url); setShowImageModal(true); }}
                                        />
                                        <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] rounded px-1 py-0.5">#{idx + 1}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 5: Beta Pedigree */}
                {detailViewTab === 5 && (() => {
                    if (mpLoading) return <div className="flex items-center justify-center py-16 gap-2 text-gray-400"><Loader2 size={18} className="animate-spin" /><span className="text-sm">Loading ancestry?</span></div>;
                    const mpData = mpEnrichedData || animal?.manualPedigree || {};
                    const emptySlot = () => ({ mode: 'manual', ctcId: '', prefix: '', name: '', suffix: '', variety: '', genCode: '', birthDate: '', breederName: '', gender: '', imageUrl: '', notes: '' });
                    const getSlot = (key) => mpData[key] || emptySlot();
                    const hasAnyData = ['sire','dam','sireSire','sireDam','damSire','damDam',
                        'sireSireSire','sireSireDam','sireDamSire','sireDamDam',
                        'damSireSire','damSireDam','damDamSire','damDamDam'].some(k => {
                        const d = mpData[k];
                        return d && (d.ctcId || Object.entries(d).some(([fk,v]) => fk !== 'mode' && v && String(v).trim()));
                    });
                    const handleDownloadMP = async () => {
                        if (!mpTreeRef.current) return;
                        setMpDownloading(true);
                        try {
                            const el = mpTreeRef.current;
                            const srcCanvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
                            const a4W = 1654, a4H = 2339, pad = 60;
                            const maxW = a4W - pad * 2, maxH = a4H - pad * 2;
                            const ratio = Math.min(maxW / srcCanvas.width, maxH / srcCanvas.height, 1);
                            const dw = srcCanvas.width * ratio, dh = srcCanvas.height * ratio;
                            const outCanvas = document.createElement('canvas');
                            outCanvas.width = a4W; outCanvas.height = a4H;
                            const ctx = outCanvas.getContext('2d');
                            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, a4W, a4H);
                            ctx.drawImage(srcCanvas, (a4W - dw) / 2, pad, dw, dh);
                            const link = document.createElement('a');
                            link.download = `beta-pedigree-${animal.name || animal.id_public}.png`;
                            link.href = outCanvas.toDataURL('image/png');
                            link.click();
                        } catch(e) { console.error('Beta pedigree download failed', e); }
                        finally { setMpDownloading(false); }
                    };
                    const handleDownloadMPPDF = async () => {
                        if (!mpTreeRef.current) return;
                        setMpDownloading(true);
                        try {
                            const srcCanvas = await html2canvas(mpTreeRef.current, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
                            const a4W = 1654, a4H = 2339, pad = 60;
                            const maxW = a4W - pad * 2, maxH = a4H - pad * 2;
                            const ratio = Math.min(maxW / srcCanvas.width, maxH / srcCanvas.height, 1);
                            const dw = srcCanvas.width * ratio, dh = srcCanvas.height * ratio;
                            const outCanvas = document.createElement('canvas');
                            outCanvas.width = a4W; outCanvas.height = a4H;
                            const ctx = outCanvas.getContext('2d');
                            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, a4W, a4H);
                            ctx.drawImage(srcCanvas, (a4W - dw) / 2, pad, dw, dh);
                            const imgData = outCanvas.toDataURL('image/png');
                            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
                            pdf.save(`pedigree-${animal.name || animal.id_public}.pdf`);
                        } catch(e) { console.error('Pedigree PDF failed', e); }
                        finally { setMpDownloading(false); }
                    };
                    const renderSlot = (slotKey, label) => {
                        const d = getSlot(slotKey);
                        const hasData = d && (d.ctcId || Object.entries(d).some(([fk,v]) => fk !== 'mode' && v && String(v).trim()));
                        const fullName = [d.prefix, d.name, d.suffix].filter(Boolean).join(' ');
                        const isSire = slotKey === 'sire' || slotKey.endsWith('Sire');
                        const GIcon = isSire ? Mars : Venus;
                        const gColor = isSire ? 'text-blue-400' : 'text-pink-400';
                        const handleSlotClick = d.ctcId && onViewAnimal ? async () => {
                            try {
                                const res = await axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(d.ctcId)}`, { headers: { Authorization: `Bearer ${authToken}` } });
                                if (res.data) onViewAnimal(res.data, 14);
                            } catch { /* not accessible */ }
                        } : undefined;
                        return (
                            <div key={slotKey} onClick={handleSlotClick} className={`rounded-lg border-2 p-3 h-full relative ${handleSlotClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${hasData ? (isSire ? 'border-blue-200 bg-blue-50/40' : 'border-pink-200 bg-pink-50/40') : 'border-dashed border-gray-200 bg-gray-50'}`}>
                                <div className={`flex items-center gap-1 mb-1.5 ${isSire ? 'text-blue-400' : 'text-pink-400'}`}>
                                    <GIcon size={11} className={`flex-shrink-0 ${gColor}`} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
                                </div>
                                {hasData ? (
                                    <div className="flex gap-2.5">
                                        {d.imageUrl && <img src={d.imageUrl} alt={fullName} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200 self-start" />}
                                        <div className="flex-1 min-w-0 space-y-0.5 pb-4">
                                            {fullName && <p className="text-xs font-semibold text-gray-800 leading-tight">{fullName}</p>}
                                            {d.variety && <p className="text-[11px] text-gray-500">{d.variety}</p>}
                                            {d.genCode && <p className="text-[11px] font-mono text-indigo-600">{d.genCode}</p>}
                                            {d.birthDate && <p className="text-[11px] text-gray-400">{formatDate(d.birthDate)}</p>}
                                            {d.deceasedDate && <p className="text-[11px] text-red-600 font-semibold">† {formatDate(d.deceasedDate)}</p>}
                                            {d.breederName && <p className="text-[11px] text-gray-500 italic">{d.breederName}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2.5">
                                        <div className="flex-1 min-w-0 space-y-0.5 pb-4">
                                            <p className="text-[11px] text-gray-300 italic">?</p>
                                        </div>
                                    </div>
                                )}
                                {d.ctcId && <p className="absolute bottom-1.5 right-2 text-[10px] font-mono text-gray-800">{d.ctcId}</p>}
                            </div>
                        );
                    };
                    return (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <Dna size={18} className="text-orange-500" />
                                    <h3 className="text-base font-semibold text-gray-700">Beta Pedigree</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex rounded border border-gray-300 overflow-hidden text-xs">
                                        <button onClick={() => setBetaPedigreeView('vertical')} className={`px-2 py-1 transition-colors ${betaPedigreeView === 'vertical' ? 'bg-gray-200 font-semibold text-gray-800' : 'text-gray-400 hover:bg-gray-100'}`}>Vertical</button>
                                        <button onClick={() => setBetaPedigreeView('chart')} className={`px-2 py-1 transition-colors ${betaPedigreeView === 'chart' ? 'bg-primary font-semibold text-black' : 'text-gray-400 hover:bg-gray-100'}`}>Chart</button>
                                    </div>
                                    {hasAnyData && betaPedigreeView === 'vertical' && (
                                        <>
                                        <button onClick={handleDownloadMPPDF} disabled={mpDownloading}
                                            className="px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-black rounded-lg border border-primary/40 transition flex items-center gap-1.5 disabled:opacity-60 font-semibold">
                                            {mpDownloading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Download size={14} /> Save PDF</>}
                                        </button>
                                        <button onClick={handleDownloadMP} disabled={mpDownloading}
                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition flex items-center gap-1.5 disabled:opacity-60">
                                            {mpDownloading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Images size={14} /> Save Image</>}
                                        </button>
                                        </>
                                    )}
                                    {betaPedigreeView === 'chart' && (
                                        <>
                                        <button onClick={() => chartRef.current?.downloadPDF()} disabled={!chartRef.current?.imagesLoaded || chartRef.current?.isSaving}
                                            className="px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-black rounded-lg border border-primary/40 transition flex items-center gap-1.5 disabled:opacity-60 font-semibold">
                                            <Download size={14} /> Save PDF
                                        </button>
                                        <button onClick={() => chartRef.current?.downloadImage()} disabled={!chartRef.current?.imagesLoaded || chartRef.current?.isSaving}
                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition flex items-center gap-1.5 disabled:opacity-60">
                                            <Images size={14} /> Save Image
                                        </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 -mt-3">This Beta Pedigree displays both linked CritterTrack ancestors (with CTC IDs) and manually entered ancestors. Only linked CritterTrack ancestry is used for COI calculations. Manual entries are for display/reference only and do not affect COI or the main pedigree chart.</p>
                            <div className={betaPedigreeView === 'chart' ? '' : 'hidden'}>
                                <PedigreeChart ref={chartRef} inline animalId={animal.id_public} animalData={animal} API_BASE_URL={API_BASE_URL} authToken={authToken} onClose={() => {}} manualData={mpEnrichedData} onViewAnimal={onViewAnimal} />
                            </div>
                            <div className={betaPedigreeView === 'vertical' ? '' : 'hidden'}>
                            <div ref={mpTreeRef} className="space-y-6 bg-white p-4 rounded-xl">
                                {(() => {
                                    const subjectVariety = ['color','coatPattern','coat','earset','phenotype','morph','markings'].map(k => animal[k]).filter(Boolean).join(' ');
                                    const subjectImgUrl = animal.imageUrl || animal.photoUrl || null;
                                    const subjectName = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ');
                                    const isMale = animal.gender === 'Male';
                                    const SubjectGenderIcon = isMale ? Mars : Venus;
                                    const subjectGColor = isMale ? 'text-blue-500' : 'text-pink-500';
                                    const ownerImgUrl = breederInfo?.profileImage || breederInfo?.profileImageUrl || null;
                                    const ownerShowPersonal = breederInfo?.showPersonalName ?? true;
                                    const ownerShowBreeder = breederInfo?.showBreederName ?? true;
                                    const ownerLines = [];
                                    if (ownerShowPersonal && breederInfo?.personalName) ownerLines.push(breederInfo.personalName);
                                    if (ownerShowBreeder && breederInfo?.breederName) ownerLines.push(breederInfo.breederName);
                                    const ownerUserId = breederInfo?.id_public || null;
                                    const ownerQrUrl = ownerUserId ? `${window.location.origin}/user/${ownerUserId}` : null;
                                    return (
                                        <div className="rounded-xl border-2 border-primary bg-primary/10 overflow-hidden relative">
                                            {/* Owner/breeder ? top-right corner */}
                                            {breederInfo && (
                                            <div className="absolute top-2 right-2 flex flex-col items-center gap-1 text-center z-10">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                                                    {ownerImgUrl ? <img src={ownerImgUrl} alt="Breeder" className="w-full h-full object-cover" /> : <User size={18} className="text-gray-400" />}
                                                </div>
                                                <div className="space-y-0">
                                                    {ownerLines.length > 0 ? ownerLines.map((l,i) => <p key={i} className="text-xs font-semibold text-gray-700 leading-tight">{l}</p>) : null}
                                                    {ownerUserId && <p className="text-[10px] font-mono text-gray-400">{ownerUserId}</p>}
                                                </div>
                                                {ownerQrUrl && <QRCodeSVG value={ownerQrUrl} size={52} bgColor="transparent" fgColor="#374151" level="M" />}
                                            </div>
                                            )}
                                            {/* Animal info ? centered */}
                                            <div className="flex flex-col items-center gap-2 text-center p-4 relative">
                                                {animal.species && <div className="absolute top-2 left-2 text-left"><p className="text-xs font-semibold text-gray-600 leading-tight">{animal.species}</p>{getSpeciesLatinName(animal.species) && <p className="text-[10px] italic text-gray-400 leading-tight">{getSpeciesLatinName(animal.species)}</p>}</div>}
                                                {subjectImgUrl ? <img src={subjectImgUrl} alt={subjectName} className="w-20 h-20 rounded-full object-cover border-2 border-primary/30" /> : <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-300"><Cat size={32} /></div>}
                                                <div className="flex items-center gap-1 justify-center">
                                                    <SubjectGenderIcon size={14} className={`flex-shrink-0 ${subjectGColor}`} />
                                                    <p className="text-base font-bold text-gray-800 leading-tight">{subjectName}</p>
                                                </div>
                                                {subjectVariety && <p className="text-xs text-gray-500 -mt-1">{subjectVariety}</p>}
                                                {animal.geneticCode && <p className="text-xs font-mono text-indigo-600">{animal.geneticCode}</p>}
                                                {animal.birthDate && <p className="text-xs text-gray-400">{formatDate(animal.birthDate)}</p>}
                                                {(animal.manualBreederName || (breederInfo && (breederInfo.breederName || breederInfo.personalName))) && <p className="text-xs text-gray-500 italic">{animal.manualBreederName || breederInfo.breederName || breederInfo.personalName}</p>}
                                                {animal.id_public && <p className="text-xs font-mono text-gray-400">{animal.id_public}</p>}
                                            </div>
                                        </div>
                                    );
                                })()}
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 1 — Parents</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {renderSlot('sire', 'Sire')}
                                        {renderSlot('dam', 'Dam')}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 2 — Grandparents</p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Paternal</p>
                                        <p className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest">Maternal</p>
                                        {renderSlot('sireSire', 'Grandsire')}
                                        {renderSlot('damSire', 'Grandsire')}
                                        {renderSlot('sireDam', 'Granddam')}
                                        {renderSlot('damDam', 'Granddam')}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Generation 3 — Great-Grandparents</p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Paternal</p>
                                        <p className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest">Maternal</p>
                                        <p className="text-[10px] text-gray-400 mb-0.5">via Grandsire</p>
                                        <p className="text-[10px] text-gray-400 mb-0.5">via Grandsire</p>
                                        {renderSlot('sireSireSire', 'Great-Grandsire')}
                                        {renderSlot('damSireSire', 'Great-Grandsire')}
                                        {renderSlot('sireSireDam', 'Great-Granddam')}
                                        {renderSlot('damSireDam', 'Great-Granddam')}
                                        <p className="text-[10px] text-gray-400 mt-1 mb-0.5">via Granddam</p>
                                        <p className="text-[10px] text-gray-400 mt-1 mb-0.5">via Granddam</p>
                                        {renderSlot('sireDamSire', 'Great-Grandsire')}
                                        {renderSlot('damDamSire', 'Great-Grandsire')}
                                        {renderSlot('sireDamDam', 'Great-Granddam')}
                                        {renderSlot('damDamDam', 'Great-Granddam')}
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Pedigree Chart Modal */}
                {showPedigree && (
                    <PedigreeChart
                        animalId={animal.id_public}
                        onClose={() => setShowPedigree(false)}
                        API_BASE_URL={API_BASE_URL}
                        authToken={authToken}
                        onViewAnimal={onViewAnimal}
                    />
                )}
            </div>
        </div>
    </div>
);
};

// View-Only Parent Card Component
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

    // Determine if the parent is clickable (owned by user or public)
    const isClickable = !parent.isHidden;

    return (
        <div 
            className={`flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-200 ${isClickable ? 'cursor-pointer hover:bg-gray-100' : 'opacity-75'} transition`}
            style={{ width: 'auto', minWidth: '180px' }}
            onClick={isClickable ? (() => onViewAnimal && onViewAnimal(parent)) : undefined}
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
                                        authToken={authToken}
                                    />
                            )}
                            
                            {/* Mother Card */}
                            {(litter.damId_public || litter.otherParentType === 'dam') && (
                                <ParentMiniCard 
                                    parent={litter.otherParentType === 'dam' ? litter.otherParent : currentAnimal}
                                    label="Mother"
                                    onViewAnimal={onViewAnimal}
                                        authToken={authToken}
                                    />
                            )}
                        </div>

                        {/* Litter Info - Centered */}
                        <div className="flex justify-center mb-4">
                            <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200 inline-block">
                                {litter.litter_id_public && (
                                    <p className="text-xs font-mono bg-gray-300 text-gray-800 px-2 py-1 rounded mb-2 text-center">
                                        {litter.litter_id_public}
                                    </p>
                                )}
                                {litter.litterName && (
                                    <p className="text-sm font-semibold text-gray-800 text-center mb-1">
                                        {litter.litterName}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <span>Born: {formatDate(litter.birthDate)}</span>
                                    {litter.numberBorn && (
                                        <>
                                            <span></span>
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
                                                {formatDate(animal.birthDate)}
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

// Compact species picker modal used in Litter Management
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center border-b p-4 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-800">Select Species</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={22} /></button>
                </div>

                {/* Search + Category */}
                <div className="p-4 border-b flex-shrink-0 space-y-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or latin name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCat(c)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                                    cat === c ? 'bg-primary text-black' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Star size={11} className="fill-current" /> Favourites
                        </p>
                    )}
                    {filtered.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No species found.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {filtered.map((s, idx) => {
                                const isFav = favorites.includes(s.name);
                                const prevFav = idx > 0 && favorites.includes(filtered[idx - 1].name);
                                const showDivider = !search && !isFav && prevFav;
                                return (
                                    <React.Fragment key={s._id || s.name}>
                                        {showDivider && (
                                            <div className="col-span-full border-t border-gray-200 my-1" />
                                        )}
                                        <div className="relative group">
                                            <button
                                                type="button"
                                                onClick={() => onSelect(s.name)}
                                                className={`w-full h-20 flex flex-col items-start justify-center p-2 border-2 rounded-lg text-left transition hover:shadow-md relative ${
                                                    isFav
                                                        ? 'border-amber-300 bg-amber-50 hover:bg-amber-100'
                                                        : s.isDefault
                                                        ? 'border-primary bg-primary/10 hover:bg-primary/20'
                                                        : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span className="font-medium text-sm text-gray-800 leading-tight pr-5 line-clamp-1">
                                                    {s.name}
                                                </span>
                                                {s.latinName && (
                                                    <span className="text-xs italic text-gray-500 mt-0.5 leading-tight line-clamp-1">{s.latinName}</span>
                                                )}
                                                {s.category && (
                                                    <span className="absolute bottom-1 left-2 text-gray-400">
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
                                                className={`absolute top-2 right-2 transition ${isFav ? 'text-amber-400 opacity-100' : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-amber-400'}`}
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
                <div className="border-t p-3 flex-shrink-0 flex justify-between items-center">
                    <span className="text-xs text-gray-400">{filtered.length} species{favCount > 0 ? ` · ${favCount} favourited` : ''}</span>
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 transition">Cancel</button>
                </div>
            </div>
        </div>
    );
};

// Litter Management Component
const LitterManagement = ({ authToken, API_BASE_URL, userProfile, showModalMessage, onViewAnimal, formDataRef, onFormOpenChange, speciesOptions = [] }) => {
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
        expectedDueDate: '',
        weaningDate: ''
    });
    const [createOffspringCounts, setCreateOffspringCounts] = useState({
        males: 0,
        females: 0,
        unknown: 0
    });
    // Search filters for parent selection (UI not yet implemented)
    // const [sireSearch, setSireSearch] = useState('');
    // const [damSearch, setDamSearch] = useState('');
    // const [sireSpeciesFilter, setSireSpeciesFilter] = useState('');
    // const [damSpeciesFilter, setDamSpeciesFilter] = useState('');
    const [linkingAnimals, setLinkingAnimals] = useState(false);
    const [availableToLink, setAvailableToLink] = useState({ litter: null, animals: [] });
    const [expandedLitter, setExpandedLitter] = useState(null);
    const [editingLitter, setEditingLitter] = useState(null);
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
    const [selectedTpSireAnimal, setSelectedTpSireAnimal] = useState(null);
    const [selectedTpDamAnimal, setSelectedTpDamAnimal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
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
    const [myAnimalsLoaded, setMyAnimalsLoaded] = useState(false);
    const [litterOffspringMap, setLitterOffspringMap] = useState({}); // litter._id ? offspring array (undefined = not yet loaded)
    const [offspringRefetchToken, setOffspringRefetchToken] = useState(0); // increment to force offspring re-fetch
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
    const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
    const [calendarTooltip, setCalendarTooltip] = useState(null); // { litterId, eventType, litter, x, y }
    const [urgencyEnabled, setUrgencyEnabled] = useState(() => {
        try { return localStorage.getItem('ct_urgency_enabled') !== 'false'; } catch { return true; }
    });
    const toggleUrgency = () => {
        const next = !urgencyEnabled;
        setUrgencyEnabled(next);
        try {
            localStorage.setItem('ct_urgency_enabled', next ? 'true' : 'false');
            window.dispatchEvent(new StorageEvent('storage', { key: 'ct_urgency_enabled' }));
        } catch {}
    };

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

    // Test Pairing modal state
    const [showTestPairingModal, setShowTestPairingModal] = useState(false);
    const [tpSireId, setTpSireId] = useState('');
    const [tpDamId, setTpDamId] = useState('');
    const [tpCOI, setTpCOI] = useState(null);
    const [tpCalculating, setTpCalculating] = useState(false);
    const [tpError, setTpError] = useState(null);
    const handleCalculateTestPairing = async () => {
        if (!tpSireId || !tpDamId) return;
        const cacheKey = `${tpSireId}:${tpDamId}`;
        if (coiCacheRef.current[cacheKey] != null) {
            setTpCOI(coiCacheRef.current[cacheKey]);
            return;
        }
        setTpCalculating(true);
        setTpError(null);
        setTpCOI(null);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            const res = await axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
                params: { sireId: tpSireId, damId: tpDamId, generations: 20 },
                headers: { Authorization: `Bearer ${authToken}` },
                signal: controller.signal,
            });
            const val = res.data.inbreedingCoefficient ?? 0;
            coiCacheRef.current[cacheKey] = val;
            setTpCOI(val);
        } catch (err) {
            if (axios.isCancel(err)) setTpError('Request timed out ? please try again.');
            else setTpError('Failed to calculate COI. Please try again.');
        } finally {
            clearTimeout(timeout);
            setTpCalculating(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Load litters first so cards appear immediately; animals fetch silently in background
                await fetchLitters();
            } catch (error) {
                console.error('Error loading litters:', error);
            } finally {
                setLoading(false);
            }
            // Background ? populates offspring cards as soon as it resolves
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
            // Clear offspring cache so expanded litter re-fetches fresh data
            // (skip when caller has already applied an optimistic update)
            if (!preserveOffspring) {
                setLitterOffspringMap({});
            }
            setOffspringRefetchToken(t => t + 1);
            const response = await axios.get(`${API_BASE_URL}/litters`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const littersData = Array.isArray(response.data) ? response.data : [];
            
            // Set litters immediately so UI can render
            setLitters(littersData);
            
            // Calculate COI for each litter that doesn't have it yet.
            // Each litter updates independently so cards pop in as they resolve.
            // Only calculate COI for litters not already cached this session
            const littersNeedingCOI = littersData.filter(l => {
                if (!l.sireId_public || !l.damId_public) return false;
                if (l.inbreedingCoefficient != null) return false; // already stored in DB
                const cacheKey = `${l.sireId_public}:${l.damId_public}`;
                if (coiCacheRef.current[cacheKey] != null) {
                    // Already computed this session ? patch state immediately, no API call
                    setLitters(prev => prev.map(x => x._id === l._id ? { ...x, inbreedingCoefficient: coiCacheRef.current[cacheKey] } : x));
                    return false;
                }
                return true;
            });
            if (littersNeedingCOI.length > 0) {
                setCoiCalculating(new Set(littersNeedingCOI.map(l => l._id)));
                littersNeedingCOI.forEach(async (litter) => {
                    const cacheKey = `${litter.sireId_public}:${litter.damId_public}`;
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 15000);
                    try {
                        const coiResponse = await axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
                            params: { sireId: litter.sireId_public, damId: litter.damId_public, generations: 20 },
                            headers: { Authorization: `Bearer ${authToken}` },
                            signal: controller.signal,
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
        } else if (modalTarget === 'tp-sire') {
            setTpSireId(animal?.id_public || '');
            setSelectedTpSireAnimal(animal || null);
            setTpCOI(null);
            setTpError(null);
        } else if (modalTarget === 'tp-dam') {
            setTpDamId(animal?.id_public || '');
            setSelectedTpDamAnimal(animal || null);
            setTpCOI(null);
            setTpError(null);
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
                const resp = await axios.post(`${API_BASE_URL}/litters`, payload, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                litterBackendId = resp.data.litterId_backend;
            }
            if (matingCOI != null) {
                axios.put(`${API_BASE_URL}/litters/${litterBackendId}`, { inbreedingCoefficient: matingCOI }, {
                    headers: { Authorization: `Bearer ${authToken}` }
                }).catch(() => {});
            }
            showModalMessage('Success', editingMatingId ? 'Planned mating updated!' : 'Planned mating recorded! Edit the entry to add birth details when the litter arrives.');
            setShowAddMatingForm(false);
            resetMatingForm();
            fetchLitters();
        } catch (error) {
            console.error('Error recording planned mating:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to record mating');
        }
    };

    const handleMarkAsMated = async (litter) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await axios.put(`${API_BASE_URL}/litters/${litter._id}`, { matingDate: today }, {
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
            fetchLitters();
        } catch (err) {
            showModalMessage('Error', 'Failed to mark as mated');
        }
    };

    // -- Litter form save-time reconciliation ---------------------------------
    // Returns { correctedCounts, warnings[] } based on form values + linked animals.
    // Rule 1: gender sum > total ? bump total (silent)
    // Rule 2: stillborn or weaned > total ? warn, do NOT auto-correct
    const reconcileLitterFormCounts = (fd, linkedAnimals = []) => {
        const linkedMales   = linkedAnimals.filter(a => a.gender === 'Male').length;
        const linkedFemales = linkedAnimals.filter(a => a.gender === 'Female').length;
        const linkedUnknown = linkedAnimals.filter(a => a.gender !== 'Male' && a.gender !== 'Female').length;
        // Always keep manual entries ? only enforce minimum equal to linked count
        const maleCount    = Math.max(parseInt(fd.maleCount)    || 0, linkedMales);
        const femaleCount  = Math.max(parseInt(fd.femaleCount)  || 0, linkedFemales);
        const unknownCount = Math.max(parseInt(fd.unknownCount) || 0, linkedUnknown);
        const genderSum    = maleCount + femaleCount + unknownCount;
        const linkedCount  = linkedAnimals.length;
        const manualTotal  = parseInt(fd.litterSizeBorn) || 0;
        const litterSizeBorn = Math.max(manualTotal, genderSum, linkedCount) || null;
        const stillborn    = parseInt(fd.stillbornCount) || 0;
        const weaned       = parseInt(fd.litterSizeWeaned) || 0;
        const warnings     = [];
        if (litterSizeBorn && stillborn > litterSizeBorn)
            warnings.push(`Stillborn (${stillborn}) exceeds Total Born (${litterSizeBorn}).`);
        if (litterSizeBorn && weaned > litterSizeBorn)
            warnings.push(`Weaned (${weaned}) exceeds Total Born (${litterSizeBorn}).`);
        if (litterSizeBorn && (stillborn + weaned) > litterSizeBorn)
            warnings.push(`Stillborn + Weaned (${stillborn + weaned}) exceeds Total Born (${litterSizeBorn}).`);
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
            // Get parent details ? fall back to cached selected animals for global (non-owned) ones
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
                weaningDate: formData.weaningDate || null
            };

            const litterResponse = await axios.post(`${API_BASE_URL}/litters`, litterPayload, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            const litterId = litterResponse.data.litterId_backend;

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

            // Optimistic update ? add new litter to state immediately so it shows without waiting for refetch
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
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `M${i}`, species: sire.species, gender: 'Male', birthDate: formData.birthDate, status: 'Pet', fatherId_public: formData.sireId_public, motherId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, ownerId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }
                
                // Create females
                for (let i = 1; i <= parseInt(createOffspringCounts.females || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `F${i}`, species: sire.species, gender: 'Female', birthDate: formData.birthDate, status: 'Pet', fatherId_public: formData.sireId_public, motherId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, ownerId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }

                // Create unknown/intersex
                for (let i = 1; i <= parseInt(createOffspringCounts.unknown || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `U${i}`, species: sire.species, gender: 'Unknown', birthDate: formData.birthDate, status: 'Pet', fatherId_public: formData.sireId_public, motherId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, ownerId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
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
    //  4. stillborn/weaned are never touched here
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
            // Use already-loaded myAnimals ? no network call needed
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
            // Only bump total born if linked count exceeds stored value ? never touch gender counts
            const newBorn = Math.max(litter.litterSizeBorn || 0, allLinked.length);

            await axios.put(`${API_BASE_URL}/litters/${litter._id}`, {
                offspringIds_public: updatedOffspringIds,
                litterSizeBorn: newBorn || null,
                numberBorn: newBorn || null,
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            // Optimistically add to offspring list immediately
            if (addedAnimal) {
                setLitterOffspringMap(prev => ({
                    ...prev,
                    [litter._id]: [...(prev[litter._id] || []), addedAnimal]
                }));
            }

            showModalMessage('Success', 'Animal linked to litter!');
            
            // Remove from available list
            setAvailableToLink({
                ...availableToLink,
                animals: availableToLink.animals.filter(a => a.id_public !== animalId)
            });
            
            // Refresh litters to show updated count without clearing offspring cache
            fetchLitters({ preserveOffspring: true });
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
            // Only bump total born if linked count exceeds stored value ? never touch gender counts
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
            
            // Clear available list
            setAvailableToLink({
                ...availableToLink,
                animals: []
            });
            
            // Refresh litters to show updated count without clearing offspring cache
            fetchLitters({ preserveOffspring: true });
        } catch (error) {
            console.error('Error linking animals to litter:', error);
            showModalMessage('Error', 'Failed to link animals to litter');
        }
    };

    const handleUnlinkOffspring = async (litter, animalId_public) => {
        if (!window.confirm('Remove this animal from the litter? The animal record will NOT be deleted ? only the link to this litter will be removed.')) return;
        try {
            const updatedOffspringIds = (litter.offspringIds_public || []).filter(id => id !== animalId_public);
            const remainingOffspring = (litterOffspringMap[litter._id] || []).filter(a => a.id_public !== animalId_public);
            // Only update the link list ? never modify gender counts or total born on unlink
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
            // Get parent details ? fall back to cached selected animals for global (non-owned) ones
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
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `M${i}`, species: offspringSpecies, gender: 'Male', birthDate: formData.birthDate, status: 'Pet', fatherId_public: formData.sireId_public, motherId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, ownerId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }
                for (let i = 1; i <= parseInt(createOffspringCounts.females || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `F${i}`, species: offspringSpecies, gender: 'Female', birthDate: formData.birthDate, status: 'Pet', fatherId_public: formData.sireId_public, motherId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, ownerId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }
                for (let i = 1; i <= parseInt(createOffspringCounts.unknown || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `U${i}`, species: offspringSpecies, gender: 'Unknown', birthDate: formData.birthDate, status: 'Pet', fatherId_public: formData.sireId_public, motherId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, ownerId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
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
                weaningDate: formData.weaningDate || null
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

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

            // Calculate inbreeding coefficient in the background ? don't block the save
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
    
    // Filtered animals are handled directly in the render sections below
    
    // Get unique species from all animals (currently for debugging)
    // const allSpecies = [...new Set(myAnimals.map(a => a.species).filter(Boolean))].sort();
    
    console.log('[LitterManagement] Male animals:', maleAnimals.length);
    console.log('[LitterManagement] Female animals:', femaleAnimals.length);

    // Filter litters based on search query and species
    const filteredLitters = litters.filter(litter => {
        // Use populated parent data first (covers transferred/hidden animals), fall back to myAnimals
        const sire = litter.sire || myAnimals.find(a => a.id_public === litter.sireId_public);
        const dam  = litter.dam  || myAnimals.find(a => a.id_public === litter.damId_public);
        
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
        // Sort order: Mated (isPlanned + past matingDate) ? Planned-only ? Born (newest first)
        const today = new Date();
        const aIsMated = a.isPlanned && a.matingDate && new Date(a.matingDate) <= today;
        const bIsMated = b.isPlanned && b.matingDate && new Date(b.matingDate) <= today;
        const aIsPlannedOnly = a.isPlanned && !aIsMated;
        const bIsPlannedOnly = b.isPlanned && !bIsMated;
        const rank = (l, isMated, isPlannedOnly) => isMated ? 0 : isPlannedOnly ? 1 : 2;
        const aRank = rank(a, aIsMated, aIsPlannedOnly);
        const bRank = rank(b, bIsMated, bIsPlannedOnly);
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
        <div className="w-full max-w-6xl bg-white p-3 sm:p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800 flex items-center">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary-dark" />
                    Litter Management
                </h2>
                <div className="flex gap-2 flex-wrap">
                    {/* View Toggle */}
                    <div className="flex rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            <BookOpen size={14} /> List
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors border-l border-gray-200 ${viewMode === 'calendar' ? 'bg-primary text-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Calendar size={14} /> Calendar
                        </button>
                    </div>
                    {/* Urgency Alerts Toggle */}
                    <button
                        onClick={toggleUrgency}
                        title={urgencyEnabled ? 'Urgency alerts on ? click to disable' : 'Urgency alerts off ? click to enable'}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border shadow-sm transition-colors ${urgencyEnabled ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                    >
                        <Bell size={14} />
                        <span className="hidden sm:inline">Alerts {urgencyEnabled ? 'On' : 'Off'}</span>
                    </button>
                    {/* Test Pairing Button */}
                    <button
                        onClick={() => { setShowTestPairingModal(true); setTpSireId(''); setTpDamId(''); setTpCOI(null); setTpError(null); setTpCalculating(false); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border shadow-sm bg-white border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        title="Test a sire/dam pairing to predict COI"
                    >
                        <Calculator size={14} />
                        <span className="hidden sm:inline">Test Pairing</span>
                    </button>
                    <button
                        onClick={handleRecalculateOffspringCounts}
                        className="bg-primary hover:bg-primary/90 text-black font-semibold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg flex items-center"
                        title="Recalculate offspring counts for all litters"
                    >
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    {/* + Mating / + Litter ? grouped so they never split across rows */}
                    <div className="flex rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        {/* Mating button */}
                        <button
                            onClick={() => {
                                if (!showAddMatingForm) { setShowAddForm(false); setEditingLitter(null); }
                                setShowAddMatingForm(!showAddMatingForm);
                                if (showAddMatingForm) resetMatingForm();
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border-r border-gray-200 ${showAddMatingForm ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-primary text-black hover:bg-primary-dark'}`}
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
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${showAddForm ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-primary text-black hover:bg-primary-dark'}`}
                        >
                            {showAddForm ? <X size={14} /> : <Plus size={14} />}
                            <span>Litter</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-4 sm:mb-6 pl-0.5">
                <span><span className="font-semibold text-gray-700">{litterStats.litters}</span> Litters</span>
                <span className="text-gray-300">|</span>
                <span><span className="font-semibold text-blue-600">{litterStats.males}</span> Males</span>
                <span className="text-gray-300">|</span>
                <span><span className="font-semibold text-pink-500">{litterStats.females}</span> Females</span>
                <span className="text-gray-300">|</span>
                <span><span className="font-semibold text-gray-500">{litterStats.unknown}</span> Unknown</span>
            </div>

            {loading && litters.length === 0 && (
                /* Skeleton litter cards ? shown only until first fetch completes */
                <div className="space-y-3 animate-pulse mt-2">
                    {[0,1,2,3].map(i => (
                        <div key={i} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-5 w-40 bg-gray-200 rounded" />
                                <div className="h-5 w-20 bg-gray-200 rounded" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="h-4 bg-gray-100 rounded" />
                                <div className="h-4 bg-gray-100 rounded" />
                                <div className="h-4 bg-gray-100 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Litter Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center border-b p-4">
                            <h3 className="text-xl font-bold text-gray-800">{editingLitter ? 'Edit Litter' : 'Create New Litter'}</h3>
                            <button 
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingLitter(null);
                                    setSelectedSireAnimal(null);
                                    setSelectedDamAnimal(null);
                                    setShowSpeciesPicker(false);
                                }}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4">
                            <form onSubmit={editingLitter ? handleUpdateLitter : handleSubmit} id="litter-form" className="space-y-4">
                                {/* Litter Photos ? top of form, always visible for born litters */}
                                {(editingLitter ? (() => { const tl = litters.find(l => l._id === editingLitter || l.litterId_backend === editingLitter); return tl && !tl.isPlanned; })() : true) && (
                                    <div className="mb-2 p-4 border border-amber-200 rounded-lg bg-amber-50">
                                        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Camera size={16} className="inline-block align-middle mr-1" /> Litter Photos
                                            <span className="text-xs font-normal text-gray-400">({editingLitter ? litterImages.filter(i => i.r2Key !== '__uploading__').length : pendingLitterImages.length}/5)</span>
                                        </h4>

                                        {/* Thumbnail grid */}
                                        {editingLitter ? (
                                            litterImages.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {litterImages.map((img, idx) => (
                                                        <div key={img.r2Key || idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
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
                                                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
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
                                        <p className="text-xs text-gray-400 mt-2">{editingLitter ? 'PNG or JPEG, max 500 KB each. Up to 5 photos.' : 'Photos will be uploaded when you save the litter.'}</p>
                                    </div>
                                )}

                                {/* Auto-assigned CTL-ID (read-only) */}
                                {editingLitter && editingLitter.litter_id_public && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            System Litter ID (CTL-ID)
                                        </label>
                                        <input
                                            type="text"
                                            value={editingLitter.litter_id_public}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-mono"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Auto-assigned for system linkage</p>
                                    </div>
                                )}
                                
                                {/* Litter Name - Full Width */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Litter Name/ID
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.breedingPairCodeName}
                                        onChange={(e) => setFormData({...formData, breedingPairCodeName: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="e.g., Summer 2025 Litter A, Disney's Hakuna Matata"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Your custom name for this breeding pair</p>
                                </div>

                                {/* Species Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Species {!editingLitter && <span className="text-red-500">*</span>}
                                        {editingLitter && <span className="ml-1 text-xs text-gray-400 font-normal">(locked ? cannot change on edit)</span>}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => !editingLitter && setShowSpeciesPicker(true)}
                                        disabled={!!editingLitter}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-left transition focus:ring-2 focus:ring-primary focus:border-transparent ${
                                            editingLitter
                                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-75'
                                                : 'bg-white hover:bg-gray-50'
                                        }`}
                                    >
                                        {formData.species ? (
                                            <span className="font-medium text-gray-800">{