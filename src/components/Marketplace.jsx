import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter, ChevronLeft, ChevronRight, DollarSign, Heart, Mail, MapPin, Loader2, ShoppingBag, Tag, MessageSquare, Send } from 'lucide-react';
import axios from 'axios';
import 'flag-icons/css/flag-icons.min.css';

const API_BASE_URL = '/api';

// Currency symbols
const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'CA$',
    'AUD': 'A$',
    'NZD': 'NZ$'
};

const formatPrice = (amount, currency) => {
    if (!amount) return 'Contact for price';
    const symbol = currencySymbols[currency] || currency + ' ';
    return `${symbol}${amount.toLocaleString()}`;
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

const Marketplace = ({ onViewAnimal, onViewProfile, authToken, userProfile, onStartConversation, showModalMessage }) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Inquiry modal state
    const [showInquiryModal, setShowInquiryModal] = useState(false);
    const [inquiryAnimal, setInquiryAnimal] = useState(null);
    const [inquiryMessage, setInquiryMessage] = useState('');
    const [sendingInquiry, setSendingInquiry] = useState(false);
    
    // Filters
    const [listingType, setListingType] = useState('all'); // 'all', 'sale', 'stud'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Available filter options
    const [speciesOptions, setSpeciesOptions] = useState([]);
    
    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    // Fetch available species for filter
    useEffect(() => {
        const fetchSpecies = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/public/marketplace/species`);
                setSpeciesOptions(response.data || []);
            } catch (err) {
                console.error('Failed to fetch species:', err);
            }
        };
        fetchSpecies();
    }, []);

    // Fetch marketplace animals
    const fetchAnimals = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', pagination.limit);
            params.append('type', listingType);
            
            if (searchQuery.trim()) {
                params.append('search', searchQuery.trim());
            }
            if (selectedSpecies) {
                params.append('species', selectedSpecies);
            }
            if (selectedGender) {
                params.append('gender', selectedGender);
            }

            const response = await axios.get(`${API_BASE_URL}/public/marketplace?${params.toString()}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            setAnimals(response.data.animals || []);
            setPagination(response.data.pagination || { page: 1, total: 0, totalPages: 0 });
        } catch (err) {
            console.error('Failed to fetch marketplace:', err);
            setError('Failed to load marketplace. Please try again.');
            setAnimals([]);
        } finally {
            setLoading(false);
        }
    }, [listingType, searchQuery, selectedSpecies, selectedGender, pagination.limit]);

    // Fetch on mount and filter changes
    useEffect(() => {
        fetchAnimals(1);
    }, [listingType, selectedSpecies, selectedGender]);

    // Handle search submit
    const handleSearch = (e) => {
        e.preventDefault();
        fetchAnimals(1);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchAnimals(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Reset filters
    const resetFilters = () => {
        setSearchQuery('');
        setSelectedSpecies('');
        setSelectedGender('');
        setListingType('all');
    };

    const hasActiveFilters = searchQuery || selectedSpecies || selectedGender || listingType !== 'all';

    // Handle opening inquiry modal
    const handleOpenInquiry = (animal) => {
        if (!authToken) {
            showModalMessage?.('Login Required', 'Please log in to contact sellers.');
            return;
        }
        if (!userProfile) {
            showModalMessage?.('Profile Required', 'Please complete your profile before contacting sellers.');
            return;
        }
        // Check if trying to message own animal
        if (animal.ownerInfo?.id_public === userProfile?.id_public) {
            showModalMessage?.('Info', 'This is your own listing.');
            return;
        }
        
        // Pre-fill message with animal info
        const listingType = animal.isForSale ? 'for sale' : 'for stud';
        const animalDisplayName = `${animal.prefix ? animal.prefix + ' ' : ''}${animal.name}${animal.suffix ? ' ' + animal.suffix : ''}`;
        const defaultMessage = `Hi! I'm interested in your ${animal.species || 'animal'} "${animalDisplayName}" (${animal.id_public}) that you have listed ${listingType}. Could you please provide more information?`;
        
        setInquiryAnimal(animal);
        setInquiryMessage(defaultMessage);
        setShowInquiryModal(true);
    };

    // Handle sending inquiry
    const handleSendInquiry = async () => {
        if (!inquiryAnimal || !inquiryMessage.trim()) return;
        
        setSendingInquiry(true);
        try {
            // Get the owner's backend user ID
            const ownerResponse = await axios.get(`${API_BASE_URL}/public/profile/${inquiryAnimal.ownerInfo.id_public}`);
            const ownerBackendId = ownerResponse.data.userId_backend;
            
            if (!ownerBackendId) {
                throw new Error('Could not find seller information');
            }

            // Check if owner allows messages
            if (ownerResponse.data.allowMessages === false) {
                showModalMessage?.('Cannot Send', 'This seller has disabled messages.');
                setShowInquiryModal(false);
                return;
            }

            // Send the message
            await axios.post(`${API_BASE_URL}/messages/send`, {
                receiverId: ownerBackendId,
                message: inquiryMessage.trim()
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            showModalMessage?.('Success', 'Your inquiry has been sent! Check your messages for a reply.');
            setShowInquiryModal(false);
            setInquiryAnimal(null);
            setInquiryMessage('');
            
            // Optionally open the messages panel
            if (onStartConversation) {
                onStartConversation({
                    otherUserId: ownerBackendId,
                    otherUser: {
                        id_public: ownerResponse.data.id_public,
                        personalName: ownerResponse.data.personalName,
                        breederName: ownerResponse.data.breederName,
                        showPersonalName: ownerResponse.data.showPersonalName,
                        showBreederName: ownerResponse.data.showBreederName,
                        profileImage: ownerResponse.data.profileImage
                    }
                });
            }
        } catch (err) {
            console.error('Failed to send inquiry:', err);
            const errorMsg = err.response?.data?.error || err.message || 'Failed to send inquiry';
            showModalMessage?.('Error', errorMsg);
        } finally {
            setSendingInquiry(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag className="text-accent" />
                    Marketplace
                </h1>
                <p className="text-gray-600 mt-1">Browse animals available for sale or stud services</p>
            </div>

            {/* Listing Type Tabs */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setListingType('all')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                        listingType === 'all' 
                            ? 'bg-accent text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    All Listings
                </button>
                <button
                    onClick={() => setListingType('sale')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                        listingType === 'sale' 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    <Tag size={18} />
                    For Sale
                </button>
                <button
                    onClick={() => setListingType('stud')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                        listingType === 'stud' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    <Heart size={18} />
                    For Stud
                </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition"
                    >
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                            showFilters || hasActiveFilters
                                ? 'bg-accent text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Filter size={18} />
                        Filters
                        {hasActiveFilters && !showFilters && (
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>
                </div>
            </form>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                            <select
                                value={selectedSpecies}
                                onChange={(e) => setSelectedSpecies(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                            >
                                <option value="">All Species</option>
                                {speciesOptions.map((species) => (
                                    <option key={species} value={species}>{species}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select
                                value={selectedGender}
                                onChange={(e) => setSelectedGender(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                            >
                                <option value="">Any Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            {hasActiveFilters && (
                                <button
                                    onClick={resetFilters}
                                    className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center justify-center gap-2"
                                >
                                    <X size={18} />
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Results Count */}
            <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                <span>
                    {loading ? 'Loading...' : `${pagination.total} listing${pagination.total !== 1 ? 's' : ''} found`}
                </span>
                {pagination.totalPages > 1 && (
                    <span>Page {pagination.page} of {pagination.totalPages}</span>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-accent" size={40} />
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => fetchAnimals(1)}
                        className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && animals.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <ShoppingBag className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No listings found</h3>
                    <p className="text-gray-500 mb-4">
                        {hasActiveFilters 
                            ? 'Try adjusting your filters or search terms' 
                            : 'Check back later for new listings'}
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            )}

            {/* Animal Cards */}
            {!loading && !error && animals.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {animals.map((animal) => (
                        <AnimalCard 
                            key={animal._id || animal.id_public} 
                            animal={animal}
                            onViewAnimal={onViewAnimal}
                            onViewProfile={onViewProfile}
                            onContactOwner={() => handleOpenInquiry(animal)}
                            isOwnListing={animal.ownerInfo?.id_public === userProfile?.id_public}
                            isLoggedIn={!!authToken}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                            pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                        } else {
                            pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-10 h-10 rounded-lg transition ${
                                    pageNum === pagination.page
                                        ? 'bg-accent text-white'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* Inquiry Modal */}
            {showInquiryModal && inquiryAnimal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <MessageSquare className="text-accent" size={20} />
                                Contact Seller
                            </h3>
                            <button 
                                onClick={() => {
                                    setShowInquiryModal(false);
                                    setInquiryAnimal(null);
                                    setInquiryMessage('');
                                }}
                                className="text-gray-500 hover:text-gray-700 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Animal Info */}
                        <div className="p-4 bg-gray-50 border-b">
                            <div className="flex gap-3">
                                {(inquiryAnimal.imageUrl || inquiryAnimal.photoUrl) ? (
                                    <img 
                                        src={inquiryAnimal.imageUrl || inquiryAnimal.photoUrl} 
                                        alt={inquiryAnimal.name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                        <ShoppingBag className="text-gray-400" size={24} />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800">{inquiryAnimal.prefix && `${inquiryAnimal.prefix} `}{inquiryAnimal.name}{inquiryAnimal.suffix && ` ${inquiryAnimal.suffix}`}</h4>
                                    <p className="text-sm text-gray-600">{inquiryAnimal.species} • {inquiryAnimal.id_public}</p>
                                    <div className="flex gap-2 mt-1">
                                        {inquiryAnimal.isForSale && (
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                                For Sale
                                            </span>
                                        )}
                                        {inquiryAnimal.availableForBreeding && (
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                                For Stud
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {inquiryAnimal.ownerInfo && (
                                <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                                    <span className="font-medium">Seller:</span> {inquiryAnimal.ownerInfo.displayName}
                                    {inquiryAnimal.ownerInfo.country && (
                                        <span className="ml-2 text-gray-500">
                                            <MapPin size={12} className="inline mr-1" />
                                            {getCountryName(inquiryAnimal.ownerInfo.country)}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Message
                            </label>
                            <textarea
                                value={inquiryMessage}
                                onChange={(e) => setInquiryMessage(e.target.value)}
                                placeholder="Write your message to the seller..."
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent resize-none"
                                rows={5}
                                maxLength={1000}
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">
                                {inquiryMessage.length}/1000
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t flex gap-3">
                            <button
                                onClick={() => {
                                    setShowInquiryModal(false);
                                    setInquiryAnimal(null);
                                    setInquiryMessage('');
                                }}
                                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendInquiry}
                                disabled={sendingInquiry || !inquiryMessage.trim()}
                                className="flex-1 py-2 px-4 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sendingInquiry ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Inquiry
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Animal Card Component
const AnimalCard = ({ animal, onViewAnimal, onViewProfile, onContactOwner, isOwnListing, isLoggedIn }) => {
    const isForSale = animal.isForSale;
    const isForStud = animal.availableForBreeding;
    
    // Calculate age
    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const now = new Date();
        const months = Math.floor((now - birth) / (1000 * 60 * 60 * 24 * 30.44));
        
        if (months < 1) {
            const weeks = Math.floor((now - birth) / (1000 * 60 * 60 * 24 * 7));
            return `${weeks} week${weeks !== 1 ? 's' : ''}`;
        } else if (months < 12) {
            return `${months} month${months !== 1 ? 's' : ''}`;
        } else {
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            if (remainingMonths === 0) {
                return `${years} year${years !== 1 ? 's' : ''}`;
            }
            return `${years}y ${remainingMonths}m`;
        }
    };

    const age = calculateAge(animal.birthDate);
    
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-100">
            {/* Image */}
            <div className="relative h-48 bg-gray-100">
                {animal.imageUrl || animal.photoUrl ? (
                    <img
                        src={animal.imageUrl || animal.photoUrl}
                        alt={animal.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-animal.png';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag size={48} />
                    </div>
                )}
                
                {/* Listing Type Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                    {isForSale && (
                        <span className="bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <Tag size={12} />
                            For Sale
                        </span>
                    )}
                    {isForStud && (
                        <span className="bg-purple-600 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <Heart size={12} />
                            For Stud
                        </span>
                    )}
                </div>
                
                {/* Gender Badge */}
                {animal.gender && (
                    <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full ${
                        animal.gender === 'Male' 
                            ? 'bg-blue-100 text-blue-800' 
                            : animal.gender === 'Female'
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                        {animal.gender}
                    </span>
                )}
            </div>
            
            {/* Content */}
            <div className="p-4">
                {/* Name and ID */}
                <div className="flex justify-between items-start mb-2">
                    <h3 
                        className="font-semibold text-gray-800 text-lg cursor-pointer hover:text-accent transition"
                        onClick={() => onViewAnimal && onViewAnimal(animal.id_public)}
                    >
                        {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`}
                    </h3>
                    <span className="text-xs text-gray-500 font-mono">
                        {animal.id_public}
                    </span>
                </div>
                
                {/* Species and Age */}
                <div className="text-sm text-gray-600 mb-3">
                    <span>{animal.species}</span>
                    {age && <span className="mx-1">•</span>}
                    {age && <span>{age} old</span>}
                </div>
                
                {/* Price */}
                <div className="flex flex-col gap-1 mb-3">
                    {isForSale && (
                        <div className="flex items-center text-yellow-600">
                            <span className="font-medium">
                                {formatPrice(animal.salePriceAmount, animal.salePriceCurrency)}
                            </span>
                        </div>
                    )}
                    {isForStud && (
                        <div className="flex items-center gap-2 text-purple-700">
                            <Heart size={16} />
                            <span className="font-medium">
                                Stud Fee: {formatPrice(animal.studFeeAmount, animal.studFeeCurrency)}
                            </span>
                        </div>
                    )}
                </div>
                
                {/* Owner Info */}
                {animal.ownerInfo && (
                    <div className="border-t pt-3 mt-3">
                        <div 
                            className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-accent transition"
                            onClick={() => onViewProfile && onViewProfile(animal.ownerInfo.id_public)}
                        >
                            {animal.ownerInfo.profileImage ? (
                                <img 
                                    src={animal.ownerInfo.profileImage} 
                                    alt=""
                                    className="w-6 h-6 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">
                                        {animal.ownerInfo.displayName?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                </div>
                            )}
                            <span className="font-medium truncate">
                                {animal.ownerInfo.displayName}
                            </span>
                            {isOwnListing && (
                                <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    Your listing
                                </span>
                            )}
                        </div>
                        {animal.ownerInfo.country && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 ml-8">
                                <span className={`${getCountryFlag(animal.ownerInfo.country)} inline-block h-3 w-4`}></span>
                                <span>{getCountryName(animal.ownerInfo.country)}</span>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={() => onViewAnimal && onViewAnimal(animal.id_public)}
                        className="flex-1 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium text-sm"
                    >
                        View Details
                    </button>
                    {!isOwnListing && (
                        <button
                            onClick={onContactOwner}
                            className="py-2 px-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center gap-1"
                            title={isLoggedIn ? "Contact seller" : "Log in to contact seller"}
                        >
                            <MessageSquare size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
