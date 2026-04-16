import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Flame, Gem, Loader2, Moon, Save, Search, Star, User } from 'lucide-react';

const API_BASE_URL = '/api';

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
                                <option value="owner">ðŸ  Owner</option>
                                <option value="breeder">â­ Active Breeder</option>
                                <option value="retired">ðŸŒ™ Retired Breeder</option>
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


const BreederDirectory = ({ authToken, API_BASE_URL, onBack }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [breeders, setBreeders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Initialize filters from URL params
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedSpecies, setSelectedSpecies] = useState(searchParams.get('species') || '');
    const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || '');
    const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
    const [availableSpecies, setAvailableSpecies] = useState([]);
    const [availableCountries, setAvailableCountries] = useState([]);
    const [availableStates, setAvailableStates] = useState([]);

    // Update URL params when filters change
    useEffect(() => {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (selectedSpecies) params.species = selectedSpecies;
        if (selectedCountry) params.country = selectedCountry;
        if (selectedState) params.state = selectedState;
        setSearchParams(params, { replace: true });
    }, [searchQuery, selectedSpecies, selectedCountry, selectedState]);

    // Fetch breeders on mount
    useEffect(() => {
        fetchBreeders();
    }, []);

    const fetchBreeders = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/users/breeder-directory`, {
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
            });
            setBreeders(response.data || []);
            
            // Extract unique species from all breeders
            const speciesSet = new Set();
            response.data.forEach(breeder => {
                if (breeder.breedingStatus) {
                    Object.keys(breeder.breedingStatus).forEach(species => {
                        if (breeder.breedingStatus[species] === 'breeder' || breeder.breedingStatus[species] === 'retired') {
                            speciesSet.add(species);
                        }
                    });
                }
            });
            setAvailableSpecies(Array.from(speciesSet).sort());
            
            // Extract unique countries from all breeders
            const countrySet = new Set();
            response.data.forEach(breeder => {
                if (breeder.country) {
                    countrySet.add(breeder.country);
                }
            });
            setAvailableCountries(Array.from(countrySet).sort());

            // Extract unique US states from US breeders
            const stateSet = new Set();
            response.data.forEach(breeder => {
                if (breeder.country === 'US' && breeder.state) {
                    stateSet.add(breeder.state);
                }
            });
            setAvailableStates(Array.from(stateSet).sort());
        } catch (error) {
            console.error('Failed to fetch breeders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort breeders
    const filteredBreeders = useMemo(() => {
        let result = breeders;

        // Filter out breeders with no public names
        result = result.filter(breeder => {
            const hasPersonalName = breeder.showPersonalName && breeder.personalName;
            const hasBreederName = breeder.showBreederName && breeder.breederName;
            return hasPersonalName || hasBreederName;
        });

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(breeder => {
                const personalName = breeder.personalName?.toLowerCase() || '';
                const breederName = breeder.breederName?.toLowerCase() || '';
                const id = breeder.id_public?.toLowerCase() || '';
                return personalName.includes(query) || breederName.includes(query) || id.includes(query);
            });
        }

        // Filter by selected species
        if (selectedSpecies) {
            result = result.filter(breeder => {
                if (!breeder.breedingStatus) return false;
                return breeder.breedingStatus[selectedSpecies] === 'breeder' || 
                       breeder.breedingStatus[selectedSpecies] === 'retired';
            });
        }

        // Filter by selected country
        if (selectedCountry) {
            result = result.filter(breeder => breeder.country === selectedCountry);
        }

        // Filter by selected US state
        if (selectedState) {
            result = result.filter(breeder => breeder.state === selectedState);
        }

        return result;
    }, [breeders, searchQuery, selectedSpecies, selectedCountry, selectedState]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded transition"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Star size={24} className="text-primary" />
                            Breeders Registry
                        </h1>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <select
                                value={selectedSpecies}
                                onChange={(e) => setSelectedSpecies(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="">All Species</option>
                                {availableSpecies.map(species => (
                                    <option key={species} value={species}>
                                        {getSpeciesDisplayName(species)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <select
                                value={selectedCountry}
                                onChange={(e) => { setSelectedCountry(e.target.value); if (e.target.value !== 'US') setSelectedState(''); }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="">All Countries</option>
                                {availableCountries.map(country => (
                                    <option key={country} value={country}>
                                        {getCountryName(country)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedCountry === 'US' && availableStates.length > 0 && (
                            <div className="flex-1">
                                <select
                                    value={selectedState}
                                    onChange={(e) => setSelectedState(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                >
                                    <option value="">All States</option>
                                    {availableStates.map(stateCode => (
                                        <option key={stateCode} value={stateCode}>
                                            {getStateName(stateCode)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                ) : filteredBreeders.length === 0 ? (
                    <div className="text-center py-20">
                        <Star size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-600">No breeders found</p>
                        {(searchQuery || selectedSpecies || selectedCountry || selectedState) && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedSpecies('');
                                    setSelectedCountry('');
                                    setSelectedState('');
                                }}
                                className="mt-3 text-primary hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredBreeders.map(breeder => {
                            // Build display name based on what's public
                            let displayName = '';
                            const hasPersonalName = breeder.showPersonalName && breeder.personalName;
                            const hasBreederName = breeder.showBreederName && breeder.breederName;
                            
                            if (hasPersonalName && hasBreederName) {
                                displayName = `${breeder.personalName} (${breeder.breederName})`;
                            } else if (hasBreederName) {
                                displayName = breeder.breederName;
                            } else if (hasPersonalName) {
                                displayName = breeder.personalName;
                            } else {
                                displayName = breeder.id_public;
                            }

                            return (
                                <div
                                    key={breeder.id_public}
                                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
                                >
                                    {/* Header Row */}
                                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                                        {/* Profile Picture */}
                                        <div className="flex-shrink-0">
                                            <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden">
                                                {breeder.profileImage ? (
                                                    <img 
                                                        src={breeder.profileImage} 
                                                        alt={displayName} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <User size={36} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Name and CTU Badge */}
                                        <div className="flex-1 min-w-0">
                                            <div className="mb-1">
                                                <h3 className="text-xl font-bold text-gray-800 inline">{displayName}</h3>
                                                <span className="ml-1 inline-block"><DonationBadge user={breeder} size="sm" /></span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-xs bg-primary text-black px-2.5 py-1 rounded font-medium">
                                                    {breeder.id_public}
                                                </span>
                                                {breeder.country && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className={`${getCountryFlag(breeder.country)} inline-block h-4 w-6 flex-shrink-0`}></span>
                                                        <span>{getCountryName(breeder.country)}{breeder.country === 'US' && breeder.state ? `, ${getStateName(breeder.state)}` : ''}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* View Profile Button */}
                                        <button
                                            onClick={() => navigate(`/user/${breeder.id_public}`)}
                                            className="px-4 py-2 bg-primary hover:bg-primary/80 text-black text-sm font-medium rounded transition flex-shrink-0 w-full sm:w-auto"
                                        >
                                            View Profile
                                        </button>
                                    </div>

                                    {/* Bio */}
                                    {breeder.bio && (
                                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                                            {breeder.bio}
                                        </p>
                                    )}

                                    {/* Breeding Species */}
                                    <div className="flex flex-wrap gap-3">
                                        {breeder.breedingStatus && Object.entries(breeder.breedingStatus).map(([species, status]) => {
                                            if (status !== 'breeder' && status !== 'retired') return null;
                                            
                                            return (
                                                <div 
                                                    key={species} 
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200"
                                                >
                                                    {status === 'breeder' ? (
                                                        <Star size={14} className="text-primary" />
                                                    ) : (
                                                        <Moon size={14} className="text-gray-500" />
                                                    )}
                                                    <span className="text-sm font-medium text-gray-800">{getSpeciesDisplayName(species)}</span>
                                                    <span className="text-xs text-gray-500">
                                                        ({status === 'breeder' ? 'Active' : 'Retired'})
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};


export { BreederDirectorySettings };
export default BreederDirectory;
