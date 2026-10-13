import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cat, Loader2, Image as ImageIcon } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import SectionCard, { linkClass } from './SectionCard';

const PREVIEW = 4;
const FETCH = 24;

const RecentlyAddedAnimalsSection = ({ authToken, API_BASE_URL }) => {
    const navigate = useNavigate();
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (!authToken) return;
        apiClient.get(`/public/animals/newest?limit=${FETCH}`)
            .then(res => setAnimals(res.data || []))
            .catch(error => console.error('Error fetching newest animals:', error))
            .finally(() => setLoading(false));
    }, [authToken, API_BASE_URL]);

    const visible = showAll ? animals : animals.slice(0, PREVIEW);

    return (
        <SectionCard
            title="Recently Added Animals"
            icon={Cat}
            iconClass="text-orange-500"
            action={animals.length > PREVIEW && (
                <button type="button" onClick={() => setShowAll(v => !v)} className={linkClass}>
                    {showAll ? 'Show less' : 'View all →'}
                </button>
            )}
        >
            {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={32} /></div>
            ) : animals.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-dark-text-muted">No public animals have been published yet.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {visible.map(animal => {
                        const img = animal.imageUrl || animal.photoUrl;
                        const title = [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ');
                        return (
                            <button
                                key={animal.id_public}
                                type="button"
                                onClick={() => navigate(`/animal/${animal.id_public}`)}
                                className="text-left group"
                            >
                                <span className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-surface flex items-center justify-center text-gray-400 dark:text-dark-text-muted">
                                    {img ? (
                                        <img src={img} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    ) : <ImageIcon size={32} />}
                                </span>
                                <span className="block mt-2 font-semibold text-sm text-gray-800 dark:text-dark-text truncate">{title}</span>
                                <span className="block text-xs text-gray-500 dark:text-dark-text-muted truncate">{[animal.species, animal.id_public].filter(Boolean).join(' · ')}</span>
                                {animal.breederName && (
                                    <span className="block text-xs text-gray-400 dark:text-dark-text-muted truncate">Breeder: {animal.breederName}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </SectionCard>
    );
};

export default RecentlyAddedAnimalsSection;
