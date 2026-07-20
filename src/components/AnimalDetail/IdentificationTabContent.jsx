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

export const IdentificationTabContent = ({ 
    animal, 
    breedingLineDefs = [], 
    animalBreedingLines = {},
    toggleAnimalBreedingLine,
    setAnimalBreedingLinesDirect
}) => {
    return (
        <div className="space-y-6">
            <InfoCard title="Identification Numbers" icon={<Hash size={18} className="text-gray-400" />}>
                    <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoItem label="Species" value={animal.species} />
                        {animal.breed && <InfoItem label="Breed" value={animal.breed} />}
                        {animal.strain && <InfoItem label="Strain" value={animal.strain} />}
                    </dl>
            </InfoCard>
            <InfoCard title="Origin" icon={<Globe size={18} className="text-gray-400" />}>
                    <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                {(() => {
                    // Only show breeding lines if props were passed (editable mode)
                    if (!breedingLineDefs || breedingLineDefs.length === 0) {
                        return null;
                    }
                    
                    const namedLines = breedingLineDefs.filter(l => l.name);
                    if (namedLines.length === 0) {
                        return <p className="text-sm text-gray-400">No breeding lines available.</p>;
                    }

                    const assignedIds = animalBreedingLines[animal.id_public] || [];
                    
                    // Compute lines inherited from parents
                    const sireId = animal.sireId_public || animal.fatherId_public;
                    const damId = animal.damId_public || animal.motherId_public;
                    const parentLineIds = [...new Set([
                        ...(sireId ? (animalBreedingLines[sireId] || []) : []),
                        ...(damId ? (animalBreedingLines[damId] || []) : []),
                    ])];
                    const uninheritedParentLines = parentLineIds.filter(id => !assignedIds.includes(id));
                    const inheritedLineNames = uninheritedParentLines
                        .map(id => breedingLineDefs.find(l => l.id === id)?.name)
                        .filter(Boolean);

                    return (
                        <div>
                            <div className="flex items-center justify-end flex-wrap gap-2 -mt-2 -mr-1 mb-3">
                                {uninheritedParentLines.length > 0 && setAnimalBreedingLinesDirect && toggleAnimalBreedingLine && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const merged = [...new Set([
                                                ...assignedIds,
                                                ...parentLineIds
                                            ])];
                                            setAnimalBreedingLinesDirect(animal.id_public, merged);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-400 text-purple-700 bg-purple-50 hover:bg-purple-100 text-xs font-medium transition"
                                        title={`Inherit: ${inheritedLineNames.join(', ')}`}
                                    >
                                        <span>↑</span> Inherit from parents
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {namedLines.map(l => {
                                    const assigned = assignedIds.includes(l.id);
                                    const isEditable = toggleAnimalBreedingLine !== null && toggleAnimalBreedingLine !== undefined;
                                    return (
                                        <button 
                                            key={l.id} 
                                            type="button"
                                            disabled={!isEditable}
                                            onClick={() => toggleAnimalBreedingLine && toggleAnimalBreedingLine(animal.id_public, l.id)}
                                            style={{ 
                                                borderColor: l.color, 
                                                color: assigned ? '#fff' : l.color, 
                                                backgroundColor: assigned ? l.color : 'transparent',
                                                cursor: isEditable ? 'pointer' : 'default',
                                                opacity: isEditable ? 1 : 0.6
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full border-2 text-sm font-medium transition hover:opacity-80"
                                        >
                                            <span>&#x25C6;</span> {l.name}
                                        </button>
                                    );
                                })}
                            </div>
                            {assignedIds.length === 0 && parentLineIds.length === 0 && (
                                <p className="text-sm text-gray-400 mt-2">No breeding lines assigned.</p>
                            )}
                        </div>
                    );
                })()}
            </InfoCard>
        </div>
    );
};