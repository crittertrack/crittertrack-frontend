import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Cat } from 'lucide-react';

const AnimalCard = ({ animal }) => (
    <Link
        to={`/animal/${animal.id_public}`}
        className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition block"
    >
        <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            {animal.imageUrl || animal.photoUrl ? (
                <img
                    src={animal.imageUrl || animal.photoUrl}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <Cat size={32} className="text-gray-400" />
            )}
        </div>
        <h4 className="font-semibold text-gray-800 truncate">
            {[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}
        </h4>
        <p className="text-xs text-gray-500 mt-1 font-mono">
            {animal.id_public}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
            <span className="px-2 py-1 bg-gray-100 rounded">
                {animal.species}
            </span>
            {animal.gender && (
                <span className="px-2 py-1 bg-gray-100 rounded">
                    {animal.gender}
                </span>
            )}
        </div>
    </Link>
);

const OwnedAnimals = () => {
    const { contactData } = useOutletContext();
    const { ownedAnimals } = contactData;

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">Owned Animals ({ownedAnimals.length})</h2>
            {ownedAnimals.length === 0 ? (
                <div className="text-center py-12">
                    <Cat size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">
                        No animals owned by this contact.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {ownedAnimals.map(animal => (
                        <AnimalCard key={animal.id_public} animal={animal} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default OwnedAnimals;