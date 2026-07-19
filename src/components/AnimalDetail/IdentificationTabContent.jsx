import React from 'react';
import { Hash, FolderOpen, Globe, Tag, Users } from 'lucide-react';
import { InfoCard, InfoItem } from './DashboardComponents';

const parseJsonArrayField = (data) => {
    if (!data) return [];
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    return Array.isArray(data) ? data : [];
};

export const IdentificationTabContent = ({ animal, breedingLineDefs = [], animalBreedingLines = {} }) => {
    return (
        <div className="space-y-6">
            <InfoCard title="Identification Numbers" icon={<Hash size={18} className="text-gray-400" />}>
                    <dl className="space-y-4">
                        <InfoItem label="CritterTrack ID" value={animal.id_public} />
                        {animal.breederAssignedId && <InfoItem label="Breeder Assigned ID" value={animal.breederAssignedId} />}
                        {animal.microchipNumber && <InfoItem label="Microchip Number" value={animal.microchipNumber} />}
                        {animal.tattooId && <InfoItem label="Tattoo" value={animal.tattooId} />}
                        {animal.ringId && <InfoItem label="Ring ID" value={animal.ringId} />}
                        {animal.eartagNumber && <InfoItem label="Ear Tag" value={animal.eartagNumber} />}
                        {animal.pedigreeRegistrationId && <InfoItem label="Pedigree Registration" value={animal.pedigreeRegistrationId} />}
                        {animal.colonyId && <InfoItem label="Colony ID" value={animal.colonyId} />}
                        {parseJsonArrayField(animal.identifiers).map((identifier, index) => (
                            <InfoItem key={index} label={identifier.title} value={identifier.value} />
                        ))}
                    </dl>
            </InfoCard>
            <InfoCard title="Classification" icon={<FolderOpen size={18} className="text-gray-400" />}>
                    <dl className="space-y-4">
                        <InfoItem label="Species" value={animal.species} />
                        {animal.breed && <InfoItem label="Breed" value={animal.breed} />}
                        {animal.strain && <InfoItem label="Strain" value={animal.strain} />}
                    </dl>
            </InfoCard>
            <InfoCard title="Origin" icon={<Globe size={18} className="text-gray-400" />}>
                    <dl>
                        <InfoItem label="Origin" value={animal.origin} />
                    </dl>
            </InfoCard>
            <InfoCard title="Tags" icon={<Tag size={18} className="text-gray-400" />}>
                    {animal.tags && animal.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {animal.tags.map(tag => (
                                <span key={tag} className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No tags recorded.</p>
                    )}
            </InfoCard>
            <InfoCard title="Breeding Lines" icon={<Users size={18} className="text-gray-400" />}>
                    {breedingLineDefs.length > 0 && (animalBreedingLines[animal.id_public] || []).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {(animalBreedingLines[animal.id_public] || []).map(lineId => breedingLineDefs.find(l => l.id === lineId)).filter(Boolean).map(line => <span key={line.id} style={{ backgroundColor: line.color, color: '#fff' }} className="text-xs font-semibold px-2 py-0.5 rounded-full">{line.name}</span>)}
                            </div>
                    ) : (
                        <p className="text-sm text-gray-400">No breeding lines assigned.</p>
                    )}
            </InfoCard>
        </div>
    );
};