import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Cat, User } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import { formatAnimalDisplayName } from '../../utils/animalDisplayName';
import SectionCard, { linkClass } from './SectionCard';

const rowClass = 'w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition text-left';
const PREVIEW = 2;

const FavoritesSummaryCard = ({ authToken, API_BASE_URL }) => {
    const navigate = useNavigate();
    const [animals, setAnimals] = useState([]);
    const [breeders, setBreeders] = useState([]);
    const [counts, setCounts] = useState({ animals: null, breeders: null });

    useEffect(() => {
        if (!authToken) return;
        Promise.all([
            apiClient.get('/favorites/animals').catch(() => null),
            apiClient.get('/favorites/users').catch(() => null),
        ]).then(([a, u]) => {
            const animalList = a ? (a.data || []) : [];
            const userList = u ? (u.data || []) : [];
            setAnimals(animalList.slice(0, PREVIEW));
            setBreeders(userList.slice(0, PREVIEW));
            setCounts({ animals: a ? animalList.length : null, breeders: u ? userList.length : null });
        });
    }, [authToken, API_BASE_URL]);

    const breederName = breeder => ((breeder.showBreederName && breeder.breederName)
        ? breeder.breederName
        : ((breeder.showPersonalName ?? false) ? breeder.personalName : 'Anonymous'));

    return (
        <SectionCard
            title="Favorites"
            icon={Star}
            iconClass="text-purple-500"
            action={<Link to="/community/favorites" className={linkClass}>View favorites →</Link>}
        >
            <div className="space-y-1">
                <div className="space-y-1">
                    {animals.length > 0 ? (
                        animals.map(animal => {
                            const animalImg = animal.imageUrl || animal.photoUrl || animal.images?.[0];
                            return (
                                <button key={animal.id_public} type="button" className={rowClass} onClick={() => navigate(`/animal/${animal.id_public}`)}>
                                    <span className="w-11 h-11 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-surface flex items-center justify-center text-gray-400 dark:text-dark-text-muted">
                                        {animalImg ? <img src={animalImg} alt="" loading="lazy" className="w-full h-full object-cover" /> : <Cat size={22} />}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-semibold text-gray-800 dark:text-dark-text truncate">{formatAnimalDisplayName(animal)}</span>
                                        <span className="block text-xs text-gray-500 dark:text-dark-text-muted truncate">
                                            Favorite animal{counts.animals > PREVIEW ? ` · +${counts.animals - PREVIEW} more` : ''}
                                        </span>
                                    </span>
                                </button>
                            );
                        })
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-dark-text-muted p-2">No favorite animals yet.</p>
                    )}
                </div>
                <div className="space-y-1">
                    {breeders.length > 0 ? (
                        breeders.map(breeder => {
                            const name = breederName(breeder);
                            return (
                                <button key={breeder.id_public} type="button" className={rowClass} onClick={() => navigate(`/user/${breeder.id_public}`)}>
                                    <span className="w-11 h-11 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-surface flex items-center justify-center text-gray-400 dark:text-dark-text-muted">
                                        {breeder.profileImage ? <img src={breeder.profileImage} alt="" loading="lazy" className="w-full h-full object-cover" /> : <User size={22} />}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-semibold text-gray-800 dark:text-dark-text truncate">{name}</span>
                                        <span className="block text-xs text-gray-500 dark:text-dark-text-muted truncate">
                                            Favorite breeder{counts.breeders > PREVIEW ? ` · +${counts.breeders - PREVIEW} more` : ''}
                                        </span>
                                    </span>
                                </button>
                            );
                        })
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-dark-text-muted p-2">No favorite breeders yet.</p>
                    )}
                </div>
            </div>
        </SectionCard>
    );
};

export default FavoritesSummaryCard;
