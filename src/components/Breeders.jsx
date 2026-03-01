import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, X, Star, Moon, ArrowLeft, Loader2 } from 'lucide-react';

const getBreederDonationBadge = (user) => {
    if (!user) return null;
    const now = new Date();
    if (user.monthlyDonationActive) return { icon: '💎', title: 'Monthly Supporter', className: 'bg-gradient-to-r from-blue-400 to-purple-500 text-white' };
    if (user.lastDonationDate) {
        const days = Math.floor((now - new Date(user.lastDonationDate)) / 86400000);
        if (days <= 31) return { icon: '🎁', title: 'Recent Supporter', className: 'bg-gradient-to-r from-green-400 to-blue-500 text-white' };
    }
    return null;
};

const BreederBadge = ({ breeder }) => {
    const badge = getBreederDonationBadge(breeder);
    if (!badge) return null;
    return (
        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium shadow-sm ${badge.className}`} title={badge.title}>
            {badge.icon}
        </span>
    );
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.crittertrack.app';

const Breeders = ({ authToken }) => {
    const navigate = useNavigate();
    const [breeders, setBreeders] = useState([]);
    const [filteredBreeders, setFilteredBreeders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState([]);
    const [sortBy, setSortBy] = useState('username-asc'); // username-asc, username-desc, country-asc, country-desc, join-newest, join-oldest
    const [availableSpecies, setAvailableSpecies] = useState([]);

    useEffect(() => {
        fetchBreeders();
    }, []);

    useEffect(() => {
        filterAndSortBreeders();
    }, [breeders, searchQuery, selectedSpecies, sortBy]);

    const fetchBreeders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/users/breeders`, {
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
            });
            
            setBreeders(response.data.breeders || []);
            
            // Extract unique species from all breeders
            const speciesSet = new Set();
            (response.data.breeders || []).forEach(breeder => {
                if (breeder.breedingStatus) {
                    Object.keys(breeder.breedingStatus).forEach(species => {
                        if (breeder.breedingStatus[species] === 'breeder' || breeder.breedingStatus[species] === 'retired') {
                            speciesSet.add(species);
                        }
                    });
                }
            });
            setAvailableSpecies(Array.from(speciesSet).sort());
            setLoading(false);
        } catch (error) {
            console.error('Error fetching breeders:', error);
            setLoading(false);
        }
    };

    const filterAndSortBreeders = () => {
        let filtered = [...breeders];

        // Filter by search query (personal name or breeder name)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(breeder => 
                (breeder.personalName && breeder.personalName.toLowerCase().includes(query)) ||
                (breeder.breederName && breeder.breederName.toLowerCase().includes(query)) ||
                (breeder.username && breeder.username.toLowerCase().includes(query))
            );
        }

        // Filter by selected species
        if (selectedSpecies.length > 0) {
            filtered = filtered.filter(breeder => {
                if (!breeder.breedingStatus) return false;
                return selectedSpecies.some(species => 
                    breeder.breedingStatus[species] === 'breeder' || 
                    breeder.breedingStatus[species] === 'retired'
                );
            });
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'username-asc':
                    const nameA = (a.personalName || a.breederName || a.username || '').toLowerCase();
                    const nameB = (b.personalName || b.breederName || b.username || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                case 'username-desc':
                    const nameA2 = (a.personalName || a.breederName || a.username || '').toLowerCase();
                    const nameB2 = (b.personalName || b.breederName || b.username || '').toLowerCase();
                    return nameB2.localeCompare(nameA2);
                case 'country-asc':
                    return (a.country || '').localeCompare(b.country || '');
                case 'country-desc':
                    return (b.country || '').localeCompare(a.country || '');
                case 'join-newest':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case 'join-oldest':
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                default:
                    return 0;
            }
        });

        setFilteredBreeders(filtered);
    };

    const toggleSpecies = (species) => {
        setSelectedSpecies(prev => 
            prev.includes(species) 
                ? prev.filter(s => s !== species)
                : [...prev, species]
        );
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const handleViewProfile = (userId) => {
        navigate(`/user/${userId}`);
    };

    const getBreedingSpecies = (breedingStatus) => {
        if (!breedingStatus) return [];
        return Object.entries(breedingStatus)
            .filter(([_, status]) => status === 'breeder' || status === 'retired')
            .map(([species, status]) => ({ species, status }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={48} />
                    <p className="text-gray-600">Loading breeders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Breeders</h1>
                            <p className="text-sm text-gray-600">{filteredBreeders.length} breeders found</p>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="space-y-3">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* Filters Row */}
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Species Filter */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-sm font-medium text-gray-700 flex items-center">Species:</span>
                                {availableSpecies.map(species => (
                                    <button
                                        key={species}
                                        onClick={() => toggleSpecies(species)}
                                        className={`px-3 py-1 text-sm rounded-full transition ${
                                            selectedSpecies.includes(species)
                                                ? 'bg-primary text-black font-semibold'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {species}
                                    </button>
                                ))}
                            </div>

                            {/* Sort Dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="ml-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            >
                                <option value="username-asc">Name (A-Z)</option>
                                <option value="username-desc">Name (Z-A)</option>
                                <option value="country-asc">Country (A-Z)</option>
                                <option value="country-desc">Country (Z-A)</option>
                                <option value="join-newest">Newest Members</option>
                                <option value="join-oldest">Oldest Members</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Breeders List */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {filteredBreeders.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No breeders found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBreeders.map(breeder => {
                            const breedingSpecies = getBreedingSpecies(breeder.breedingStatus);
                            const displayName = breeder.personalName || breeder.breederName || breeder.username;
                            const showBothNames = breeder.personalName && breeder.breederName;

                            return (
                                <div
                                    key={breeder._id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition flex items-center gap-4"
                                >
                                    {/* Profile Picture */}
                                    <div className="flex-shrink-0">
                                        {breeder.profilePicture ? (
                                            <img
                                                src={breeder.profilePicture}
                                                alt={displayName}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl border-2 border-gray-300">
                                                {displayName?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Section */}
                                    <div className="flex-1 min-w-0">
                                        {/* Name and Badge */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-gray-800 truncate">
                                                {showBothNames 
                                                    ? `${breeder.personalName} (${breeder.breederName})`
                                                    : displayName
                                                }
                                            </h3>
                                            <BreederBadge breeder={breeder} />
                                            {breeder.isCTU && (
                                                <span className="px-2 py-0.5 bg-primary text-black text-xs font-bold rounded">
                                                    CTU
                                                </span>
                                            )}
                                        </div>

                                        {/* Bio */}
                                        {breeder.bio && (
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                {breeder.bio}
                                            </p>
                                        )}

                                        {/* Breeding Species */}
                                        <div className="flex flex-wrap gap-2">
                                            {breedingSpecies.map(({ species, status }) => (
                                                <div
                                                    key={species}
                                                    className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
                                                >
                                                    {status === 'breeder' ? (
                                                        <Star size={14} className="text-yellow-500" />
                                                    ) : (
                                                        <Moon size={14} className="text-blue-500" />
                                                    )}
                                                    <span className="font-medium text-gray-700">{species}</span>
                                                    <span className="text-gray-500 text-xs">
                                                        ({status === 'breeder' ? 'Active' : 'Retired'})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* View Profile Button */}
                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={() => handleViewProfile(breeder._id)}
                                            className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition whitespace-nowrap"
                                        >
                                            View Profile
                                        </button>
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

export default Breeders;
