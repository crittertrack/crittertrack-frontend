import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Cat, User } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import { formatAnimalDisplayName } from '../../utils/animalDisplayName';
import SectionCard, { linkClass } from './SectionCard';

const rowClass = 'w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition text-left';

const FavoritesSummaryCard = ({ authToken, API_BASE_URL }) => {
    const navigate = useNavigate();
    const [animal, setAnimal] = useState(null);
    const [breeder, setBreeder] = useState(null);
    const [counts, setCounts] = useState({ animals: null, breeders: null });

    useEffect(() => {
        if (!authToken) return;
        Promise.all([
            apiClient.get('/favorites/animals').catch(() => null),
            apiClient.get('/favorites/users').catch(() => null),
        ]).then(([a, u]) => {
            const animals = a ? (a.data || []) : [];
            const users = u ? (u.data || []) : [];
            setAnimal(animals[0] || null);
            setBreeder(users[0] || null);
            setCounts({ animals: a ? animals.length : null, breeders: u ? users.length : null });
        });
    }, [authToken, API_BASE_URL]);

    const animalImg = animal && (animal.imageUrl || animal.photoUrl || animal.images?.[0]);
    const breederName = breeder && ((breeder.showBreederName && breeder.breederName)
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
                {animal ? (
                    <button type="button" className={rowClass} onClick={() => navigate(`/animal/${animal.id_public}`)}>
                        <span className="w-11 h-11 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-surface flex items-center justify-center text-gray-400 dark:text-dark-text-muted">
                            {animalImg ? <img src={animalImg} alt="" loading="lazy" className="w-full h-full object-cover" /> : <Cat size={22} />}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-gray-800 dark:text-dark-text truncate">{formatAnimalDisplayName(animal)}</span>
                            <span className="block text-xs text-gray-500 dark:text-dark-text-muted truncate">
                                Favorite animal{counts.animals > 1 ? ` · +${counts.animals - 1} more` : ''}
                            </span>
                        </span>
                    </button>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-dark-text-muted p-2">No favorite animals yet.</p>
                )}
                {breeder ? (
                    <button type="button" className={rowClass} onClick={() => navigate(`/user/${breeder.id_public}`)}>
                        <span className="w-11 h-11 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-surface flex items-center justify-center text-gray-400 dark:text-dark-text-muted">
                            {breeder.profileImage ? <img src={breeder.profileImage} alt="" loading="lazy" className="w-full h-full object-cover" /> : <User size={22} />}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-gray-800 dark:text-dark-text truncate">{breederName}</span>
                            <span className="block text-xs text-gray-500 dark:text-dark-text-muted truncate">
                                Favorite breeder{counts.breeders > 1 ? ` · +${counts.breeders - 1} more` : ''}
                            </span>
                        </span>
                    </button>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-dark-text-muted p-2">No favorite breeders yet.</p>
                )}
            </div>
        </SectionCard>
    );
};

export default FavoritesSummaryCard;
