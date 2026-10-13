import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { Users, Star, Edit, ShoppingBag, UserPlus, Search, Loader2, Cat, Mars, Venus, VenusAndMars, Circle, User } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/locationUtils';
import { formatAnimalDisplayName } from '../../utils/animalDisplayName';

const MyFeed = ({ authToken, API_BASE_URL }) => {
    const navigate = useNavigate();
    const [favoriteAnimals, setFavoriteAnimals] = useState([]);
    const [favoriteUsers, setFavoriteUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favoritesSearch, setFavoritesSearch] = useState('');
    const [error, setError] = useState('');

    // Fetch favorites and activity feeds
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                const [favAnimalsRes, favUsersRes] = await Promise.all([
                    apiClient.get(`/favorites/animals`),
                    apiClient.get(`/favorites/users`),
                ]);

                const favAnimals = favAnimalsRes.data || [];
                const favUsers = favUsersRes.data || [];
                setFavoriteAnimals(favAnimals);
                setFavoriteUsers(favUsers);

            } catch (error) {
                console.error('Error fetching community data:', error);
                setError(error.response?.data?.message || 'Could not load favorites. Please try again.');
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
                await apiClient.delete(`/favorites/animals/${animalId}`);
                setFavoriteAnimals(prev => prev.filter(a => a.id_public !== animalId));
            } else {
                await apiClient.post(`/favorites/animals/${animalId}`, {});
                // Refetch to get full animal data
                const res = await apiClient.get(`/favorites/animals`);
                setFavoriteAnimals(res.data || []);
            }
        } catch (error) {
            console.error('Error toggling favorite animal:', error);
            setError(error.response?.data?.message || 'Could not update this animal favorite. Please try again.');
        }
    };

    const toggleFavoriteUser = async (userId) => {
        try {
            const isFavorited = favoriteUsers.some(u => u.id_public === userId);
            if (isFavorited) {
                await apiClient.delete(`/favorites/users/${userId}`);
                setFavoriteUsers(prev => prev.filter(u => u.id_public !== userId));
            } else {
                await apiClient.post(`/favorites/users/${userId}`, {});
                // Refetch to get full user data
                const res = await apiClient.get(`/favorites/users`);
                setFavoriteUsers(res.data || []);
            }
        } catch (error) {
            console.error('Error toggling favorite user:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-dark-card-bg rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-4 flex items-center gap-2">
                <Star className="text-purple-500" />
                Favorites
            </h2>
            <div className="relative mb-4">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-muted" />
                <input
                    type="text"
                    placeholder="Search favorite animals and breeders..."
                    aria-label="Search favorite animals and breeders"
                    value={favoritesSearch}
                    onChange={e => setFavoritesSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-dark-text dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted rounded-lg focus:outline-none focus:border-primary"
                />
            </div>
            {error && (
                <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Favorite Animals (left) */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text-secondary mb-3">
                    Favorite Animals ({favoriteAnimals.length})
                </h3>
                {favoriteAnimals.length === 0 ? (
                    <p className="text-gray-500 dark:text-dark-text-muted text-sm">No favorite animals yet. Visit animal profiles to add favorites!</p>
                ) : (
                    <>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {favoriteAnimals.filter(animal => {
                            if (!favoritesSearch.trim()) return true;
                            const q = favoritesSearch.toLowerCase();
                            const fullName = formatAnimalDisplayName(animal).toLowerCase();
                            return fullName.includes(q) || (animal.id_public || '').toLowerCase().includes(q) || (animal.species || '').toLowerCase().includes(q);
                        }).map(animal => {
                            const VARIETY_KEYS = ['color', 'markings', 'earset', 'coat'];
                            const variety = VARIETY_KEYS.map(k => animal[k]).filter(Boolean).join(' ');
                            const fullName = formatAnimalDisplayName(animal);
                            const imgSrc = animal.imageUrl || animal.photoUrl || animal.images?.[0];
                            return (
                                <div
                                    key={animal.id_public}
                                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition cursor-pointer"
                                    onClick={() => navigate(`/animal/${animal.id_public}`)}
                                >
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-dark-surface rounded overflow-hidden flex-shrink-0">
                                        {imgSrc ? (
                                            <img src={imgSrc} alt={fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-dark-text-muted">
                                                <Cat size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 dark:text-dark-text truncate flex items-center gap-1">
                                            {fullName}
                                            {animal.gender === 'Male' ? <Mars size={14} strokeWidth={2.5} className="text-primary flex-shrink-0" /> : animal.gender === 'Female' ? <Venus size={14} strokeWidth={2.5} className="text-accent flex-shrink-0" /> : animal.gender === 'Intersex' ? <VenusAndMars size={14} strokeWidth={2.5} className="text-purple-500 flex-shrink-0" /> : <Circle size={14} strokeWidth={2.5} className="text-gray-400 flex-shrink-0" />}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-dark-text-muted truncate">{animal.id_public} – {animal.species}</p>
                                        {variety && <p className="text-xs text-gray-400 dark:text-dark-text-muted truncate">{variety}</p>}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavoriteAnimal(animal.id_public);
                                        }}
                                        className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition flex-shrink-0"
                                    >
                                        <Star size={18} fill="currentColor" />
                                    </button>
                                </div>
                            );
                        })}
                        </div>
                    </>
                )}
            </div>

            {/* Favorite Breeders (right) */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text-secondary mb-3">
                    Favorite Breeders ({favoriteUsers.length})
                </h3>
                {favoriteUsers.length === 0 ? (
                    <p className="text-gray-500 dark:text-dark-text-muted text-sm">No favorite breeders yet. Visit breeder profiles to add favorites!</p>
                ) : (
                    <>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {favoriteUsers.filter(user => {
                            if (!favoritesSearch.trim()) return true;
                            const q = favoritesSearch.toLowerCase();
                            const displayName = ((user.showBreederName && user.breederName) ? user.breederName : ((user.showPersonalName ?? false) ? user.personalName : '')).toLowerCase();
                            return displayName.includes(q) || (user.id_public || '').toLowerCase().includes(q);
                        }).map(user => {
                            const displayName = (user.showBreederName && user.breederName)
                                ? user.breederName
                                : ((user.showPersonalName ?? false) ? user.personalName : 'Anonymous');
                            return (
                                <div
                                    key={user.id_public}
                                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition cursor-pointer"
                                    onClick={() => navigate(`/user/${user.id_public}`)}
                                >
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-dark-surface rounded-full overflow-hidden flex-shrink-0">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-dark-text-muted">
                                                <User size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-800 dark:text-dark-text truncate">{displayName}</p>
                                        <p className="text-xs text-gray-500 dark:text-dark-text-muted truncate">{user.id_public}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavoriteUser(user.id_public);
                                        }}
                                        className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition"
                                    >
                                        <Star size={18} fill="currentColor" />
                                    </button>
                                </div>
                            );
                        })}
                        </div>
                    </>
                )}
            </div>
            </div>
        </div>
    );
};

export default MyFeed;
