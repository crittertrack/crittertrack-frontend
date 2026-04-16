import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, Edit, ShoppingBag, UserPlus, Search, Loader2, Cat, Mars, Venus, VenusAndMars, Circle, User } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/locationUtils';

const CommunityPage = ({ authToken, API_BASE_URL, userProfile }) => {
    const navigate = useNavigate();
    const [communityUsers, setCommunityUsers] = useState([]);
    const [favoriteAnimals, setFavoriteAnimals] = useState([]);
    const [favoriteUsers, setFavoriteUsers] = useState([]);
    const [recentEdits, setRecentEdits] = useState([]);
    const [newAvailableAnimals, setNewAvailableAnimals] = useState([]);
    const [newUsers, setNewUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [animalSearch, setAnimalSearch] = useState('');
    const [breederSearch, setBreederSearch] = useState('');

    // Fetch active community users (last 5 active only)
    useEffect(() => {
        const fetchCommunityUsers = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/public/users/active?minutes=60&limit=5`);
                let active = response.data || [];
                
                const hasVisibleName = (u) => (u.showBreederName && u.breederName) || (u.showPersonalName && u.personalName);
                const clean = active.filter(u => u.id_public && u.accountStatus !== 'banned' && u.id_public !== 'CTU1' && hasVisibleName(u));
                
                setCommunityUsers(clean.slice(0, 5).map(u => ({ ...u, isActive: true })));
            } catch (error) {
                console.error('Error fetching community users:', error);
            }
        };

        if (authToken) {
            fetchCommunityUsers();
            const interval = setInterval(fetchCommunityUsers, 120000); // Refresh every 2 minutes
            return () => clearInterval(interval);
        }
    }, [authToken, API_BASE_URL]);

    // Fetch favorites and activity feeds
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [favAnimalsRes, favUsersRes, newUsersRes] = await Promise.all([
                    // Fetch favorite animals
                    axios.get(`${API_BASE_URL}/favorites/animals`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    }).catch(() => ({ data: [] })),
                    // Fetch favorite users
                    axios.get(`${API_BASE_URL}/favorites/users`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    }).catch(() => ({ data: [] })),
                    // Fetch new users (public only)
                    axios.get(`${API_BASE_URL}/public/users/newest?limit=25`).catch(() => ({ data: [] }))
                ]);

                const favAnimals = favAnimalsRes.data || [];
                const favUsers = favUsersRes.data || [];
                setFavoriteAnimals(favAnimals);
                setFavoriteUsers(favUsers);

                // Available animals from favorited users – use marketplace endpoint (known working)
                const favUserIds = new Set(favUsers.map(u => u.id_public).filter(Boolean));
                if (favUserIds.size > 0) {
                    const availRes = await axios.get(
                        `${API_BASE_URL}/public/marketplace?limit=100&type=all`
                    ).catch(() => ({ data: { animals: [] } }));
                    const allAvailable = availRes.data?.animals || availRes.data || [];
                    const fromFavUsers = allAvailable.filter(a => favUserIds.has(a.ownerId_public));
                    setNewAvailableAnimals(fromFavUsers);
                } else {
                    setNewAvailableAnimals([]);
                }

                // Derive recently updated from already-fetched favorite animals – only animals with a valid updatedAt
                const sorted = [...favAnimals]
                    .filter(a => a.updatedAt && !isNaN(new Date(a.updatedAt)))
                    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                setRecentEdits(sorted);
                
                // Filter new users to only show public ones
                const hasVisibleName = (u) => (u.showBreederName && u.breederName) || (u.showPersonalName && u.personalName);
                const publicUsers = (newUsersRes.data || []).filter(u => 
                    u.id_public && 
                    u.accountStatus !== 'banned' && 
                    u.id_public !== 'CTU1' && 
                    hasVisibleName(u)
                );
                setNewUsers(publicUsers.slice(0, 5));
            } catch (error) {
                console.error('Error fetching community data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (authToken) {
            fetchData();
        }
    }, [authToken, API_BASE_URL]);

    const toggleFavoriteAnimal = async (animalId) => {
        try {
            const isFavorited = favoriteAnimals.some(a => a.id_public === animalId);
            if (isFavorited) {
                await axios.delete(`${API_BASE_URL}/favorites/animals/${animalId}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setFavoriteAnimals(prev => prev.filter(a => a.id_public !== animalId));
            } else {
                await axios.post(`${API_BASE_URL}/favorites/animals/${animalId}`, {}, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                // Refetch to get full animal data
                const res = await axios.get(`${API_BASE_URL}/favorites/animals`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setFavoriteAnimals(res.data || []);
            }
        } catch (error) {
            console.error('Error toggling favorite animal:', error);
        }
    };

    const toggleFavoriteUser = async (userId) => {
        try {
            const isFavorited = favoriteUsers.some(u => u.id_public === userId);
            if (isFavorited) {
                await axios.delete(`${API_BASE_URL}/favorites/users/${userId}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setFavoriteUsers(prev => prev.filter(u => u.id_public !== userId));
            } else {
                await axios.post(`${API_BASE_URL}/favorites/users/${userId}`, {}, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                // Refetch to get full user data
                const res = await axios.get(`${API_BASE_URL}/favorites/users`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setFavoriteUsers(res.data || []);
            }
        } catch (error) {
            console.error('Error toggling favorite user:', error);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Users size={32} className="text-primary" />
                My Feed
            </h1>

            {/* Active Community Members */}
            {communityUsers.length > 0 && (
                <div className="mb-6 bg-gradient-to-r from-primary/20 to-accent/20 p-4 rounded-lg border border-primary/30">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Users size={20} className="text-primary-dark" />
                        Recently Active Members
                    </h2>
                    <div className="flex gap-3 overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0">
                        {communityUsers.map(user => {
                            const displayName = (user.showBreederName && user.breederName)
                                ? user.breederName
                                : ((user.showPersonalName ?? false) ? user.personalName : 'Anonymous');
                            return (
                                <div
                                    key={user.id_public}
                                    className="relative bg-white rounded-lg p-3 shadow-sm border-2 border-primary/40 hover:shadow-md transition cursor-pointer text-center flex-shrink-0 w-32 sm:flex-1 sm:w-auto sm:min-w-0"
                                    onClick={() => navigate(`/user/${user.id_public}`)}
                                >
                                    <span className="absolute top-2 right-2 w-3 h-3 bg-green-400 border-2 border-white rounded-full" title="Active now" />
                                    <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden mx-auto mb-2">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <p className="font-semibold text-sm text-gray-800 break-words line-clamp-2 leading-tight">{displayName}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.id_public}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Favorite Animals */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Heart size={20} className="text-purple-500" />
                            Favorite Animals ({favoriteAnimals.length})
                        </h2>
                        {favoriteAnimals.length === 0 ? (
                            <p className="text-gray-500 text-sm">No favorite animals yet. Visit animal profiles to add favorites!</p>
                        ) : (
                            <>
                                <div className="relative mb-2">
                                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search favorites..."
                                        value={animalSearch}
                                        onChange={e => setAnimalSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {favoriteAnimals.filter(animal => {
                                    if (!animalSearch.trim()) return true;
                                    const q = animalSearch.toLowerCase();
                                    const fullName = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ').toLowerCase();
                                    return fullName.includes(q) || (animal.id_public || '').toLowerCase().includes(q) || (animal.species || '').toLowerCase().includes(q);
                                }).map(animal => {
                                    const VARIETY_KEYS = ['color', 'coatPattern', 'coat', 'earset', 'phenotype', 'morph', 'markings'];
                                    const variety = VARIETY_KEYS.map(k => animal[k]).filter(Boolean).join(' ');
                                    const fullName = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ');
                                    const imgSrc = animal.imageUrl || animal.photoUrl || animal.images?.[0];
                                    return (
                                        <div
                                            key={animal.id_public}
                                            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() => navigate(`/animal/${animal.id_public}`)}
                                        >
                                            <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                {imgSrc ? (
                                                    <img src={imgSrc} alt={fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Cat size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 truncate flex items-center gap-1">
                                                    {fullName}
                                                    {animal.gender === 'Male' ? <Mars size={14} strokeWidth={2.5} className="text-primary flex-shrink-0" /> : animal.gender === 'Female' ? <Venus size={14} strokeWidth={2.5} className="text-accent flex-shrink-0" /> : animal.gender === 'Intersex' ? <VenusAndMars size={14} strokeWidth={2.5} className="text-purple-500 flex-shrink-0" /> : <Circle size={14} strokeWidth={2.5} className="text-gray-400 flex-shrink-0" />}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{animal.id_public} – {animal.species}</p>
                                                {variety && <p className="text-xs text-gray-400 truncate">{variety}</p>}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavoriteAnimal(animal.id_public);
                                                }}
                                                className="p-2 text-purple-500 hover:bg-purple-50 rounded transition flex-shrink-0"
                                            >
                                                <Heart size={18} fill="currentColor" />
                                            </button>
                                        </div>
                                    );
                                })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Favorite Users */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Heart size={20} className="text-purple-500" />
                            Favorite Breeders ({favoriteUsers.length})
                        </h2>
                        {favoriteUsers.length === 0 ? (
                            <p className="text-gray-500 text-sm">No favorite breeders yet. Visit breeder profiles to add favorites!</p>
                        ) : (
                            <>
                                <div className="relative mb-2">
                                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search favorites..."
                                        value={breederSearch}
                                        onChange={e => setBreederSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {favoriteUsers.filter(user => {
                                    if (!breederSearch.trim()) return true;
                                    const q = breederSearch.toLowerCase();
                                    const displayName = ((user.showBreederName && user.breederName) ? user.breederName : ((user.showPersonalName ?? false) ? user.personalName : '')).toLowerCase();
                                    return displayName.includes(q) || (user.id_public || '').toLowerCase().includes(q);
                                }).map(user => {
                                    const displayName = (user.showBreederName && user.breederName)
                                        ? user.breederName
                                        : ((user.showPersonalName ?? false) ? user.personalName : 'Anonymous');
                                    return (
                                        <div
                                            key={user.id_public}
                                            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() => navigate(`/user/${user.id_public}`)}
                                        >
                                            <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <User size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 truncate">{displayName}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.id_public}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavoriteUser(user.id_public);
                                                }}
                                                className="p-2 text-purple-500 hover:bg-purple-50 rounded transition"
                                            >
                                                <Heart size={18} fill="currentColor" />
                                            </button>
                                        </div>
                                    );
                                })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Recently Edited Favorite Animals */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Edit size={20} className="text-blue-500" />
                            Recently Updated Favorites
                        </h2>
                        {recentEdits.length === 0 ? (
                            <p className="text-gray-500 text-sm">No recent updates to your favorite animals.</p>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {recentEdits.slice(0, 10).map(animal => {
                                    const VARIETY_KEYS = ['color', 'coatPattern', 'coat', 'earset', 'phenotype', 'morph', 'markings'];
                                    const variety = VARIETY_KEYS.map(k => animal[k]).filter(Boolean).join(' ');
                                    const fullName = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ');
                                    const imgSrc = animal.imageUrl || animal.photoUrl || animal.images?.[0];
                                    return (
                                        <div
                                            key={animal.id_public}
                                            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() => navigate(`/animal/${animal.id_public}`)}
                                        >
                                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                {imgSrc ? (
                                                    <img src={imgSrc} alt={fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Cat size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 text-sm truncate flex items-center gap-1">
                                                    {fullName}
                                                    {animal.gender === 'Male' ? <Mars size={13} strokeWidth={2.5} className="text-primary flex-shrink-0" /> : animal.gender === 'Female' ? <Venus size={13} strokeWidth={2.5} className="text-accent flex-shrink-0" /> : animal.gender === 'Intersex' ? <VenusAndMars size={13} strokeWidth={2.5} className="text-purple-500 flex-shrink-0" /> : <Circle size={13} strokeWidth={2.5} className="text-gray-400 flex-shrink-0" />}
                                                </p>
                                                {variety && <p className="text-xs text-gray-400 truncate">{variety}</p>}
                                                <p className="text-xs text-gray-500">Updated {formatTimeAgo(animal.updatedAt)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Available from Favorited Breeders */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <ShoppingBag size={20} className="text-green-500" />
                            Available from Favorited Breeders
                        </h2>
                        {newAvailableAnimals.length === 0 ? (
                            <p className="text-gray-500 text-sm">{favoriteUsers.length === 0 ? 'Favorite some breeders to see their available animals here.' : 'No available animals from your favorite breeders.'}</p>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {newAvailableAnimals.map(animal => {
                                    const VARIETY_KEYS = ['color', 'coatPattern', 'coat', 'earset', 'phenotype', 'morph', 'markings'];
                                    const variety = VARIETY_KEYS.map(k => animal[k]).filter(Boolean).join(' ');
                                    const fullName = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ');
                                    const imgSrc = animal.imageUrl || animal.photoUrl || animal.images?.[0];
                                    return (
                                        <div
                                            key={animal.id_public}
                                            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() => navigate(`/animal/${animal.id_public}`)}
                                        >
                                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                {imgSrc ? (
                                                    <img src={imgSrc} alt={fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Cat size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 text-sm truncate flex items-center gap-1">
                                                    {fullName}
                                                    {animal.gender === 'Male' ? <Mars size={13} strokeWidth={2.5} className="text-primary flex-shrink-0" /> : animal.gender === 'Female' ? <Venus size={13} strokeWidth={2.5} className="text-accent flex-shrink-0" /> : animal.gender === 'Intersex' ? <VenusAndMars size={13} strokeWidth={2.5} className="text-purple-500 flex-shrink-0" /> : <Circle size={13} strokeWidth={2.5} className="text-gray-400 flex-shrink-0" />}
                                                </p>
                                                <p className="text-xs text-gray-500">{animal.species}</p>
                                                {variety && <p className="text-xs text-gray-400 truncate">{variety}</p>}
                                            </div>
                                            <div className="flex flex-col gap-1 items-end flex-shrink-0">
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{animal.isForSale ? 'For Sale' : 'For Stud'}</span>
                                                {animal.isForSale && (
                                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                        {animal.salePriceCurrency === 'Negotiable' || !animal.salePriceAmount ? 'Negotiable' : `${getCurrencySymbol(animal.salePriceCurrency)}${animal.salePriceAmount}`}
                                                    </span>
                                                )}
                                                {!animal.isForSale && animal.availableForBreeding && animal.studFeeAmount && (
                                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                        {animal.studFeeCurrency === 'Negotiable' ? 'Negotiable' : `${getCurrencySymbol(animal.studFeeCurrency)}${animal.studFeeAmount}`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* New Users */}
                    <div className="bg-white rounded-lg shadow-md p-4 lg:col-span-2">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <UserPlus size={20} className="text-indigo-500" />
                            New Members
                        </h2>
                        {newUsers.length === 0 ? (
                            <p className="text-gray-500 text-sm">No new members recently.</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {newUsers.map(user => {
                                    const displayName = (user.showBreederName && user.breederName)
                                        ? user.breederName
                                        : ((user.showPersonalName ?? false) ? user.personalName : 'Anonymous');
                                    return (
                                        <div
                                            key={user.id_public}
                                            className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition cursor-pointer text-center"
                                            onClick={() => navigate(`/user/${user.id_public}`)}
                                        >
                                            <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden mx-auto mb-2">
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <User size={28} />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-semibold text-sm text-gray-800 break-words line-clamp-2 leading-tight">{displayName}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.id_public}</p>
                                            <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">NEW</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityPage;
