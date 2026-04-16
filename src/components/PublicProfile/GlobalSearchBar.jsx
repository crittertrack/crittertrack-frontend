import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Flame, Gem, Loader2, Search, User, Cat } from 'lucide-react';

const API_BASE_URL = '/api';

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

export default GlobalSearchBar;
