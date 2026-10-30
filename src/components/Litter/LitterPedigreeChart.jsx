import React, { useState, useEffect } from 'react';
import { PawPrint, Cat } from 'lucide-react';
import AnimalImage from '../shared/AnimalImage';
import { formatAnimalDisplayName } from '../../utils/animalDisplayName';
import apiClient from '../../utils/apiClient';

/**
 * LitterPedigreeChart
 * Renders a simple horizontal or vertical chart of the litter with sire/dam.
 * The litter is shown as a placeholder animal.
 */
const LitterPedigreeChart = ({
    sireId,
    damId,
    litter,
    view = 'horizontal',
    showImages = true,
    onViewAnimal,
}) => {
    const [sire, setSire] = useState(null);
    const [dam, setDam] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const fetchParent = async (id, setter) => {
            if (!id) return;
            try {
                const response = await apiClient.get(
                    `/animals/any/${encodeURIComponent(id)}`
                );
                if (!cancelled) setter(response.data);
            } catch (err) {
                if (!cancelled) setError(err.message);
            }
        };

        setLoading(true);
        setError(null);
        Promise.all([fetchParent(sireId, setSire), fetchParent(damId, setDam)]).finally(
            () => {
                if (!cancelled) setLoading(false);
            }
        );

        return () => {
            cancelled = true;
        };
    }, [sireId, damId]);

    if (loading && (!sire || !dam)) {
        return (
            <div className="flex items-center justify-center py-8">
                <span className="text-sm text-gray-400">Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-sm text-red-500">
                Error loading parents: {error}
            </div>
        );
    }

    const getSireData = () => {
        return litter?.sire && litter.sire.id_public ? litter.sire : sire;
    };

    const getDamData = () => {
        return litter?.dam && litter.dam.id_public ? litter.dam : dam;
    };

    const getLitterData = () => litter;

    const renderAnimalNode = (animal, isPlaceholder = false) => {
        if (!animal) return null;

        return (
            <div
                className={`flex flex-col items-center cursor-pointer transition hover:shadow-md ${
                    isPlaceholder ? 'opacity-70' : ''
                }`}
                onClick={() => onViewAnimal?.(animal)}
            >
                <div
                    className={`h-24 w-24 rounded-xl border-2 flex items-center justify-center mb-2 ${
                        isPlaceholder
                            ? 'border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-dark-card-bg'
                            : animal.gender === 'Male'
                            ? 'border-blue-500 bg-blue-50 dark:bg-dark-primary'
                            : animal.gender === 'Female'
                            ? 'border-pink-500 bg-pink-50 dark:bg-dark-primary'
                            : 'border-gray-300 bg-gray-100 dark:bg-dark-card-bg'
                }`}
                >
                    {animal.imageUrl || animal.photoUrl ? (
                        <AnimalImage
                            src={animal.imageUrl || animal.photoUrl}
                            alt={animal.name || 'Animal'}
                            className="w-full h-full object-cover"
                            iconSize={34}
                        />
                    ) : isPlaceholder ? (
                        <div className="flex items-center justify-center text-gray-400">
                            <PawPrint size={40} strokeWidth={1.5} aria-hidden="true" />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center text-gray-400">
                            <Cat size={40} strokeWidth={1.5} aria-hidden="true" />
                        </div>
                    )}
                </div>
                <p className="text-xs font-medium text-gray-800 text-center leading-tight">
                    {formatAnimalDisplayName(animal)}
                </p>
                <p className="text-[10px] text-gray-500 text-center">
                    {isPlaceholder
                        ? 'Litter'
                        : animal.gender === 'Male'
                        ? 'Sire'
                        : animal.gender === 'Female'
                        ? 'Dam'
                        : 'Unknown'}
                </p>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4">
            {view === 'horizontal' ? (
                <div className="flex items-center justify-center gap-4 sm:gap-10 py-4">
                    {renderAnimalNode(getSireData())}
                    <div className="flex flex-col items-center">
                        {renderAnimalNode(getLitterData(), true)}
                    </div>
                    {renderAnimalNode(getDamData())}
                </div>
            ) : (
                <div className="flex flex-col items-center py-4">
                    <div className="flex items-center gap-4">
                        {getSireData() && renderAnimalNode(getSireData())}
                        {getDamData() && renderAnimalNode(getDamData())}
                    </div>
                    <div className="flex flex-col items-center">
                        {renderAnimalNode(getLitterData(), true)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LitterPedigreeChart;
