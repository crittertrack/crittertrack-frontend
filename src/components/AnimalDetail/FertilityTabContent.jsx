import React from 'react';
import { Leaf, RefreshCw, Mars, Venus } from 'lucide-react';
import { useDetailFieldTemplate } from './utils';
import { formatDate } from '../../utils/dateFormatter';
import { InfoCard, InfoItem } from './DashboardComponents';

export const FertilityTabContent = ({ animal, API_BASE_URL }) => {
    const { getLabel } = useDetailFieldTemplate(animal?.species, API_BASE_URL);

    const isFemale = animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown';
    const isMale = animal.gender === 'Male' || animal.gender === 'Intersex' || animal.gender === 'Unknown';

    const hasReproStatus = animal.isNeutered || animal.isInfertile || animal.isInMating || (isFemale && (animal.isPregnant || animal.isNursing)) || (isMale && animal.isStudAnimal) || (isFemale && animal.isDamAnimal);
    const hasCycleInfo = isFemale && !animal.isNeutered && (animal.heatStatus || animal.lastHeatDate || animal.ovulationDate || animal.estrusCycleLength);
    const hasSireInfo = isMale && !animal.isNeutered && !animal.isInfertile && (animal.fertilityStatus || animal.fertilityNotes || animal.reproductiveClearances || animal.reproductiveComplications);
    const hasDamInfo = isFemale && !animal.isNeutered && !animal.isInfertile && (animal.damFertilityStatus || animal.fertilityStatus || animal.gestationLength || animal.deliveryMethod || animal.whelpingDate || animal.queeningDate || animal.damFertilityNotes || animal.reproductiveClearances || animal.reproductiveComplications);

    const hasAnyData = hasReproStatus || hasCycleInfo || hasSireInfo || hasDamInfo;

    if (!hasAnyData) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg text-gray-400">
                <Leaf size={48} className="mb-2" />
                <p className="text-sm">No fertility information recorded.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <InfoCard title="Reproductive Status" icon={<Leaf size={18} className="text-gray-400" />}>
                    {hasReproStatus ? (
                        <dl className="grid grid-cols-2 gap-4">
                            <InfoItem label="Neutered/Spayed" value={animal.isNeutered ? 'Yes' : 'No'} />
                            <InfoItem label="Infertile" value={animal.isInfertile ? 'Yes' : 'No'} />
                            {!animal.isNeutered && !animal.isInfertile && <InfoItem label="In Mating" value={animal.isInMating ? 'Yes' : 'No'} />}
                            {isFemale && !animal.isNeutered && <InfoItem label={getLabel('isPregnant', 'Pregnant')} value={animal.isPregnant ? 'Yes' : 'No'} />}
                            {isFemale && !animal.isNeutered && <InfoItem label={getLabel('isNursing', 'Nursing')} value={animal.isNursing ? 'Yes' : 'No'} />}
                            {isMale && !animal.isNeutered && !animal.isInfertile && <InfoItem label="Stud Animal" value={animal.isStudAnimal ? 'Yes' : 'No'} />}
                            {isFemale && !animal.isNeutered && !animal.isInfertile && <InfoItem label="Breeding Dam" value={animal.isDamAnimal ? 'Yes' : 'No'} />}
                        </dl>
                    ) : <p className="text-sm text-gray-400">No reproductive status information recorded.</p>}
                </InfoCard>
                <InfoCard title="Estrus/Cycle" icon={<RefreshCw size={18} className="text-gray-400" />}>
                    {hasCycleInfo ? (
                        <dl className="grid grid-cols-2 gap-4">
                            <InfoItem label="Heat Status" value={animal.heatStatus} />
                            <InfoItem label="Last Heat Date" value={animal.lastHeatDate ? formatDate(animal.lastHeatDate) : null} />
                            <InfoItem label={getLabel('ovulationDate', 'Ovulation Date')} value={animal.ovulationDate ? formatDate(animal.ovulationDate) : null} />
                            {animal.estrusCycleLength && <InfoItem label="Estrus Cycle Length" value={`${animal.estrusCycleLength} days`} />}
                        </dl>
                    ) : <p className="text-sm text-gray-400">No estrus or cycle information recorded.</p>}
                </InfoCard>
            </div>
            <div className="space-y-6">
                <InfoCard title="Sire Information" icon={<Mars size={18} className="text-gray-400" />}>
                    {hasSireInfo ? (
                        <dl className="space-y-4">
                            <InfoItem label="Fertility Status" value={animal.fertilityStatus} />
                            {animal.fertilityNotes && <InfoItem label="Notes"><p className="whitespace-pre-wrap">{animal.fertilityNotes}</p></InfoItem>}
                            {animal.reproductiveClearances && <InfoItem label="Reproductive Clearances"><p className="whitespace-pre-wrap">{animal.reproductiveClearances}</p></InfoItem>}
                            {animal.reproductiveComplications && <InfoItem label="Reproductive Complications"><p className="whitespace-pre-wrap">{animal.reproductiveComplications}</p></InfoItem>}
                        </dl>
                    ) : <p className="text-sm text-gray-400">No sire-specific fertility information recorded.</p>}
                </InfoCard>
                <InfoCard title="Dam Information" icon={<Venus size={18} className="text-gray-400" />}>
                    {hasDamInfo ? (
                        <dl className="space-y-4">
                            <InfoItem label={getLabel('damFertilityStatus', 'Dam Fertility Status')} value={animal.damFertilityStatus || animal.fertilityStatus} />
                            {animal.gestationLength && <InfoItem label={getLabel('gestationLength', 'Gestation Length')} value={`${animal.gestationLength} days`} />}
                            {animal.deliveryMethod && <InfoItem label={getLabel('deliveryMethod', 'Delivery Method')} value={animal.deliveryMethod} />}
                            {animal.whelpingDate && <InfoItem label={getLabel('whelpingDate', 'Whelping Date')} value={formatDate(animal.whelpingDate)} />}
                            {animal.queeningDate && <InfoItem label={getLabel('queeningDate', 'Queening Date')} value={formatDate(animal.queeningDate)} />}
                            {animal.damFertilityNotes && <InfoItem label="Notes"><p className="whitespace-pre-wrap">{animal.damFertilityNotes}</p></InfoItem>}
                            {animal.reproductiveClearances && <InfoItem label="Reproductive Clearances"><p className="whitespace-pre-wrap">{animal.reproductiveClearances}</p></InfoItem>}
                            {animal.reproductiveComplications && <InfoItem label="Reproductive Complications"><p className="whitespace-pre-wrap">{animal.reproductiveComplications}</p></InfoItem>}
                        </dl>
                    ) : <p className="text-sm text-gray-400">No dam-specific fertility information recorded.</p>}
                </InfoCard>
            </div>
        </div>
    );
};