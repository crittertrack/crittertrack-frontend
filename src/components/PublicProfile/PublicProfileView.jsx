import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    ArrowLeft, Calendar, Cat, CheckCircle, ChevronDown, ChevronUp, Circle,
    DollarSign, Flame, Gem, Globe, Heart, Key, Link, Loader2,
    Mail, Mars, MessageSquare, Moon, QrCode, Search, Share2, Sparkles, Sprout,
    Star, User, Venus, VenusAndMars, X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from '../../utils/dateFormatter';
import ReportButton from '../ReportButton';

const API_BASE_URL = '/api';

const STATUS_OPTIONS = ['Pet', 'Breeder', 'Available', 'Booked', 'Sold', 'Retired', 'Deceased', 'Rehomed', 'Unknown']; 

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

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin text-primary-dark mr-2" size={24} />
    <span className="text-gray-600">Loading...</span>
  </div>
);

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
        <div className="w-full max-w-7xl bg-white p-6 rounded-xl shadow-lg">
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

            {/* Profile Header â€¢ two equal columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4 pb-4 border-b">
                {/* Left column: name â€¢ avatar â€¢ ctu â€¢ member since â€¢ country â€¢ centered */}
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

            {/* Email + website + social â€¢ full width under both columns */}
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                                <p className="text-xs text-gray-500">{animal.species}{ageStr ? ` Â· ${ageStr}` : ''}</p>
                                {isSale && priceLabel && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 w-fit">
                                        <DollarSign size={11} /> {priceLabel}
                                    </span>
                                )}
                                {isStud && studLabel && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5 w-fit">
                                        <Heart size={11} /> Stud â€” {studLabel}
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
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {forSale.map(a => <AnimalSaleCard key={a.id_public} animal={a} />)}
                                </div>
                            </div>
                        )}
                        {forStud.length > 0 && (
                            <div>
                                <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <Heart size={16} className="text-purple-500" /> Available for Stud <span className="text-sm font-normal text-gray-400">({forStud.length})</span>
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                        
                        {/* Second line: Sire â€¢ Dam mini-cards */}
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
                                        <span className="text-gray-400 mx-2">Â·</span>
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

export { QRModal };
export default PublicProfileView;
