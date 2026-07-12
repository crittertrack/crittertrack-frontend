import React from 'react';
import { UtensilsCrossed, Home, Droplets, Thermometer, Scissors, Check } from 'lucide-react';
import { useDetailFieldTemplate, DetailJsonList } from './utils';
import { InfoCard, InfoItem } from './shared/DashboardComponents';

const parseCareRecords = (data) => {
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

export const CareTabContent = ({ animal, API_BASE_URL, enclosureInfo }) => {
    const { getLabel } = useDetailFieldTemplate(animal?.species, API_BASE_URL);

    const animalCareTasks = parseCareRecords(animal.animalCareTasks);
    const enclosureCareTasks = parseCareRecords(animal.careTasks);

    const hasNutrition = animal.dietType || animal.feedingSchedule || animal.supplements;
    const hasHousing = enclosureInfo || animal.housingType || animal.bedding || animal.enrichment || enclosureCareTasks.length > 0;
    const hasAnimalCare = animalCareTasks.length > 0 || animal.handlingNotes || animal.socializationNotes || animal.specialCareRequirements;
    const hasEnvironment = animal.temperatureRange || animal.humidity || animal.lighting || animal.noise;
    const hasGrooming = animal.groomingNeeds || animal.sheddingLevel || animal.crateTrained || animal.litterTrained || animal.leashTrained || animal.freeFlightTrained;

    const trainingFlags = [
        { key: 'crateTrained', label: 'Crate Trained' },
        { key: 'litterTrained', label: 'Litter Trained' },
        { key: 'leashTrained', label: 'Leash Trained' },
        { key: 'freeFlightTrained', label: 'Free Flight Trained' },
    ].filter(f => animal[f.key]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
                <InfoCard title="Nutrition" icon={<UtensilsCrossed size={18} className="text-gray-400" />}>
                    {hasNutrition ? (
                        <dl className="space-y-4">
                            {animal.dietType && <InfoItem label={getLabel('dietType', 'Diet Type')} value={animal.dietType} />}
                            {animal.feedingSchedule && <InfoItem label={getLabel('feedingSchedule', 'Feeding Schedule')} value={animal.feedingSchedule} />}
                            {animal.supplements && <InfoItem label={getLabel('supplements', 'Supplements')} value={animal.supplements} />}
                        </dl>
                    ) : <p className="text-sm text-gray-400">No nutrition information recorded.</p>}
                </InfoCard>

                <InfoCard title="Environment" icon={<Thermometer size={18} className="text-gray-400" />}>
                    {hasEnvironment ? (
                        <dl className="space-y-4">
                            {animal.temperatureRange && <InfoItem label={getLabel('temperatureRange', 'Temperature Range')} value={animal.temperatureRange} />}
                            {animal.humidity && <InfoItem label={getLabel('humidity', 'Humidity')} value={animal.humidity} />}
                            {animal.lighting && <InfoItem label={getLabel('lighting', 'Lighting')} value={animal.lighting} />}
                            {animal.noise && <InfoItem label={getLabel('noise', 'Noise Level')} value={animal.noise} />}
                        </dl>
                    ) : <p className="text-sm text-gray-400">No environment details recorded.</p>}
                </InfoCard>
            </div>

            <div className="space-y-6">
                <InfoCard title="Housing & Enclosure" icon={<Home size={18} className="text-gray-400" />}>
                    {hasHousing ? (
                        <dl className="space-y-4">
                            {enclosureInfo && <InfoItem label="Enclosure" value={enclosureInfo.name} />}
                            {animal.housingType && <InfoItem label={getLabel('housingType', 'Housing Type')} value={animal.housingType} />}
                            {animal.bedding && <InfoItem label={getLabel('bedding', 'Bedding')} value={animal.bedding} />}
                            {animal.enrichment && <InfoItem label={getLabel('enrichment', 'Enrichment')} value={animal.enrichment} />}
                            {enclosureCareTasks.length > 0 && <DetailJsonList label="Enclosure Care Tasks" data={enclosureCareTasks} renderItem={t => `${t.taskName} (Every ${t.frequencyDays}d)`} />}
                        </dl>
                    ) : <p className="text-sm text-gray-400">No housing information recorded.</p>}
                </InfoCard>

                <InfoCard title="Grooming & Training" icon={<Scissors size={18} className="text-gray-400" />}>
                    {hasGrooming ? (
                        <dl className="space-y-4">
                            {animal.groomingNeeds && <InfoItem label={getLabel('groomingNeeds', 'Grooming Needs')} value={animal.groomingNeeds} />}
                            {animal.sheddingLevel && <InfoItem label={getLabel('sheddingLevel', 'Shedding Level')} value={animal.sheddingLevel} />}
                            {trainingFlags.length > 0 && (
                                <div>
                                    <dt className="text-xs text-gray-500">Training</dt>
                                    <dd className="flex flex-wrap gap-2 mt-1">
                                        {trainingFlags.map(f => (
                                            <span key={f.key} className="inline-flex items-center bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-semibold">
                                                <Check size={12} className="mr-1" /> {f.label}
                                            </span>
                                        ))}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    ) : <p className="text-sm text-gray-400">No grooming or training details recorded.</p>}
                </InfoCard>
            </div>

            <div className="space-y-6">
                <InfoCard title="Animal Care" icon={<Droplets size={18} className="text-gray-400" />}>
                    {hasAnimalCare ? (
                        <dl className="space-y-4">
                            {animal.handlingNotes && <InfoItem label={getLabel('handlingNotes', 'Handling Notes')}><p className="whitespace-pre-wrap">{animal.handlingNotes}</p></InfoItem>}
                            {animal.socializationNotes && <InfoItem label={getLabel('socializationNotes', 'Socialization Notes')}><p className="whitespace-pre-wrap">{animal.socializationNotes}</p></InfoItem>}
                            {animal.specialCareRequirements && <InfoItem label={getLabel('specialCareRequirements', 'Special Care Requirements')}><p className="whitespace-pre-wrap">{animal.specialCareRequirements}</p></InfoItem>}
                            {animalCareTasks.length > 0 && <DetailJsonList label="Animal Care Tasks" data={animalCareTasks} renderItem={t => `${t.taskName} (Every ${t.frequencyDays}d)`} />}
                        </dl>
                    ) : <p className="text-sm text-gray-400">No specific animal care information recorded.</p>}
                </InfoCard>
            </div>
        </div>
    );
};