import React from 'react';
import { Leaf, RefreshCw, Mars, Venus } from 'lucide-react';
import { useDetailFieldTemplate } from './utils';
import { formatDate } from '../../utils/dateFormatter';
import { InfoCard, InfoItem } from './DashboardComponents';

export const BreedingTabContent = ({ animal, API_BASE_URL }) => {
    const { getLabel } = useDetailFieldTemplate(animal?.species, API_BASE_URL);

    const isFemale = animal.gender === 'Female' || animal.gender === 'Intersex' || animal.gender === 'Unknown';
    const isMale = animal.gender === 'Male' || animal.gender === 'Intersex' || animal.gender === 'Unknown';

    const hasReproStatus = animal.isNeutered || animal.isInfertile || animal.isInMating || (isFemale && (animal.isPregnant || animal.isNursing)) || (isMale && animal.isStudAnimal) || (isFemale && animal.isDamAnimal);
    const hasCycleInfo = isFemale && !animal.isNeutered && (animal.heatStatus || animal.lastHeatDate || animal.ovulationDate || animal.estrusCycleLength);
    const hasSireInfo = isMale && !animal.isNeutered && !animal.isInfertile && (animal.fertilityStatus || animal.fertilityNotes || animal.reproductiveClearances || animal.reproductiveComplications);
    const hasDamInfo = isFemale && !animal.isNeutered && !animal.isInfertile && (animal.fertilityStatus || animal.gestationLength || animal.deliveryMethod || animal.lastDeliveryDate || animal.reproductiveHealthNotes || animal.reproductiveClearances || animal.reproductiveComplications);

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
        <div className="space-y-6">
                <InfoCard title="Reproductive Status" icon={<Leaf size={18} className="text-gray-400" />}>
                    {hasReproStatus ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoItem label="Neutered/Spayed" value={animal.isNeutered ? 'Yes' : 'No'} />
                            <InfoItem label="Infertile" value={animal.isInfertile ? 'Yes' : 'No'} />
                            {!animal.isNeutered && !animal.isInfertile && <InfoItem label="In Mating" value={animal.isInMating ? 'Yes' : 'No'} />}
                            {isFemale && !animal.isNeutered && <InfoItem label={getLabel('isPregnant', 'Pregnant')} value={animal.isPregnant ? 'Yes' : 'No'} />}
                            {isFemale && !animal.isNeutered && <InfoItem label={getLabel('isNursing', 'Nursing')} value={animal.isNursing ? 'Yes' : 'No'} />}
                            {isMale && !animal.isNeutered && !animal.isInfertile && <InfoItem label="Stud Animal" value={animal.isStudAnimal ? 'Yes' : 'No'} />}
                            {isFemale && !animal.isNeutered && !animal.isInfertile && <InfoItem label="Breeding Dam" value={animal.isDamAnimal ? 'Yes' : 'No'} />}
                            {animal.reproductiveStateOverride && (
                                <div className="p-2 bg-purple-50 border-l-4 border-purple-400">
                                    <p className="text-xs font-semibold text-purple-700">Reproductive State Override</p>
                                    {animal.reproductiveStateOverrideReason && <p className="text-sm text-purple-900">{animal.reproductiveStateOverrideReason}</p>}
                                </div>
                            )}
                        </div>
                    ) : <p className="text-sm text-gray-400">No reproductive status information recorded.</p>}
                </InfoCard>
                <InfoCard title="Estrus/Cycle Information" icon={<RefreshCw size={18} className="text-gray-400" />}>
                    {hasCycleInfo || isFemale ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {animal.heatStatus && <InfoItem label="Heat Status" value={animal.heatStatus} />}
                            {animal.lastHeatDate && <InfoItem label="Last Heat Date" value={formatDate(animal.lastHeatDate)} />}
                            {animal.lastReproductiveEventDate && <InfoItem label="Last Reproductive Event Date" value={formatDate(animal.lastReproductiveEventDate)} />}
                            {animal.ovulationDate && <InfoItem label={getLabel('ovulationDate', 'Ovulation Date')} value={formatDate(animal.ovulationDate)} />}
                            {animal.estrusCycleLength && <InfoItem label="Estrus Cycle Length" value={`${animal.estrusCycleLength} days`} />}
                            {animal.currentReproductiveEventPhase && <InfoItem label="Current Reproductive Phase" value={animal.currentReproductiveEventPhase} />}
                            {animal.reproductiveEventCycleLength && <InfoItem label="Reproductive Event Cycle Length" value={`${animal.reproductiveEventCycleLength} days`} />}
                        </div>
                    ) : <p className="text-sm text-gray-400">No estrus or cycle information recorded.</p>}
                </InfoCard>
                {/* Mating & Conception */}
                {(animal.matingDate || animal.lastMatingDate || animal.lastConceptionDate || animal.successfulConceptionCount) && (
                    <InfoCard title="Mating & Conception History" icon={<RefreshCw size={18} className="text-gray-400" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {animal.matingDate && <InfoItem label="Mating Date" value={formatDate(animal.matingDate)} />}
                            {animal.lastMatingDate && <InfoItem label="Last Mating Date" value={formatDate(animal.lastMatingDate)} />}
                            {animal.lastConceptionDate && <InfoItem label="Last Conception Date" value={formatDate(animal.lastConceptionDate)} />}
                            {animal.successfulConceptionCount && <InfoItem label="Successful Conceptions" value={animal.successfulConceptionCount} />}
                            {animal.unsuccessfulConceptionAttempts && <InfoItem label="Unsuccessful Conception Attempts" value={animal.unsuccessfulConceptionAttempts} />}
                        </div>
                    </InfoCard>
                )}
                {/* Pregnancy & Development */}
                {(animal.expectedDueDate || animal.developmentPeriodStart || animal.developmentPeriodLength || animal.expectedDeliveryDate || animal.developmentMethod) && (
                    <InfoCard title="Pregnancy & Development" icon={<Leaf size={18} className="text-gray-400" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {animal.expectedDueDate && <InfoItem label="Expected Due Date" value={formatDate(animal.expectedDueDate)} />}
                            {animal.developmentPeriodStart && <InfoItem label="Development Period Start" value={formatDate(animal.developmentPeriodStart)} />}
                            {animal.developmentPeriodLength && <InfoItem label="Development Period Length" value={`${animal.developmentPeriodLength} days`} />}
                            {animal.expectedDeliveryDate && <InfoItem label="Expected Delivery Date" value={formatDate(animal.expectedDeliveryDate)} />}
                            {animal.developmentMethod && <InfoItem label="Development Method" value={animal.developmentMethod} />}
                        </div>
                    </InfoCard>
                )}
                <InfoCard title="Sire/Male Information" icon={<Mars size={18} className="text-gray-400" />}>
                    {hasSireInfo ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {animal.fertilityStatus && <InfoItem label="Fertility Status" value={animal.fertilityStatus} />}
                            {animal.successfulMatings && <InfoItem label="Successful Matings" value={animal.successfulMatings} />}
                            {animal.fertilityNotes && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Notes"><p className="whitespace-pre-wrap text-sm">{animal.fertilityNotes}</p></InfoItem></div>}
                            {animal.reproductiveClearances && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Reproductive Clearances"><p className="whitespace-pre-wrap text-sm">{animal.reproductiveClearances}</p></InfoItem></div>}
                            {animal.reproductiveComplications && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Reproductive Complications"><p className="whitespace-pre-wrap text-sm">{animal.reproductiveComplications}</p></InfoItem></div>}
                        </div>
                    ) : <p className="text-sm text-gray-400">No sire-specific fertility information recorded.</p>}
                </InfoCard>
                <InfoCard title="Dam/Female Information" icon={<Venus size={18} className="text-gray-400" />}>
                    {hasDamInfo ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {animal.fertilityStatus && <InfoItem label="Fertility Status" value={animal.fertilityStatus} />}
                            {animal.lastDeliveryDate && <InfoItem label="Last Delivery Date" value={formatDate(animal.lastDeliveryDate)} />}
                            {animal.deliveryMethod && <InfoItem label={getLabel('deliveryMethod', 'Delivery Method')} value={animal.deliveryMethod} />}
                            {animal.lastReproductiveInterventionDate && <InfoItem label="Last Reproductive Intervention" value={formatDate(animal.lastReproductiveInterventionDate)} />}
                            {animal.reproductiveHealthNotes && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Reproductive Health Notes"><p className="whitespace-pre-wrap text-sm">{animal.reproductiveHealthNotes}</p></InfoItem></div>}
                            {animal.reproductiveClearances && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Reproductive Clearances"><p className="whitespace-pre-wrap text-sm">{animal.reproductiveClearances}</p></InfoItem></div>}
                            {animal.reproductiveComplications && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Reproductive Complications"><p className="whitespace-pre-wrap text-sm">{animal.reproductiveComplications}</p></InfoItem></div>}
                        </div>
                    ) : <p className="text-sm text-gray-400">No dam-specific fertility information recorded.</p>}
                </InfoCard>
                {/* Offspring & Litter Information */}
                {(animal.litterCount || animal.litterSizeBorn || animal.litterSizeWeaned || animal.totalOffspringProduced || animal.viableOffspringCount || animal.offspringCount) && (
                    <InfoCard title="Offspring & Litter Information" icon={<Leaf size={18} className="text-gray-400" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {animal.litterCount && <InfoItem label="Litter Count" value={animal.litterCount} />}
                            {animal.litterSizeBorn && <InfoItem label="Litter Size (Born)" value={animal.litterSizeBorn} />}
                            {animal.litterSizeWeaned && <InfoItem label="Litter Size (Weaned)" value={animal.litterSizeWeaned} />}
                            {animal.stillbornCount && <InfoItem label="Stillborn Count" value={animal.stillbornCount} />}
                            {animal.totalOffspringProduced && <InfoItem label="Total Offspring Produced" value={animal.totalOffspringProduced} />}
                            {animal.viableOffspringCount && <InfoItem label="Viable Offspring Count" value={animal.viableOffspringCount} />}
                            {animal.offspringCount && <InfoItem label="Offspring Count" value={animal.offspringCount} />}
                            {animal.reproductiveEventOutcome && <InfoItem label="Reproductive Event Outcome" value={animal.reproductiveEventOutcome} />}
                        </div>
                    </InfoCard>
                )}
                {/* Breeding Records */}
                {animal.breedingRecords && Array.isArray(animal.breedingRecords) && animal.breedingRecords.length > 0 && (
                    <InfoCard title="Breeding Records" icon={<RefreshCw size={18} className="text-gray-400" />}>
                        <div className="space-y-3">
                            {animal.breedingRecords.map((record, idx) => (
                                <div key={record.id || idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        {record.breedingMethod && <div><span className="font-semibold">Method:</span> {record.breedingMethod}</div>}
                                        {record.matingDate && <div><span className="font-semibold">Mating Date:</span> {formatDate(record.matingDate)}</div>}
                                        {record.mate && <div><span className="font-semibold">Mate:</span> {record.mate}</div>}
                                        {record.outcome && <div><span className="font-semibold">Outcome:</span> {record.outcome}</div>}
                                        {record.birthEventDate && <div><span className="font-semibold">Birth Date:</span> {formatDate(record.birthEventDate)}</div>}
                                        {record.litterSizeBorn && <div><span className="font-semibold">Litter Size:</span> {record.litterSizeBorn}</div>}
                                    </div>
                                    {record.notes && <p className="text-xs text-gray-600 whitespace-pre-wrap">{record.notes}</p>}
                                </div>
                            ))}
                        </div>
                    </InfoCard>
                )}
                {/* Pregnancy History */}
                {animal.pregnancyHistory && Array.isArray(animal.pregnancyHistory) && animal.pregnancyHistory.length > 0 && (
                    <InfoCard title="Pregnancy History" icon={<Leaf size={18} className="text-gray-400" />}>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">Total confirmations: {animal.pregnancyHistory.length}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {animal.pregnancyHistory.map((date, idx) => (
                                    <div key={idx} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                                        <span className="font-semibold">🤰 Confirmed:</span> {formatDate(date)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </InfoCard>
                )}
                {/* Nursing & Dependency */}
                {(animal.nursingStartDate || animal.weaningDate || animal.dependentCareRequired || animal.dependentCareEndDate) && (
                    <InfoCard title="Nursing & Dependency" icon={<Leaf size={18} className="text-gray-400" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {animal.nursingStartDate && <InfoItem label="Nursing Start Date" value={formatDate(animal.nursingStartDate)} />}
                            {animal.weaningDate && <InfoItem label="Weaning Date" value={formatDate(animal.weaningDate)} />}
                            {animal.dependentCareRequired !== undefined && <InfoItem label="Dependent Care Required" value={animal.dependentCareRequired ? 'Yes' : 'No'} />}
                            {animal.dependentCareEndDate && <InfoItem label="Dependent Care End Date" value={formatDate(animal.dependentCareEndDate)} />}
                        </div>
                    </InfoCard>
                )}
                {/* Artificial Reproduction */}
                {(animal.artificialInseminationUsed || animal.artificialReproductionMethod) && (
                    <InfoCard title="Artificial Reproduction Methods" icon={<Leaf size={18} className="text-gray-400" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {animal.artificialInseminationUsed !== undefined && <InfoItem label="Artificial Insemination Used" value={animal.artificialInseminationUsed ? 'Yes' : 'No'} />}
                            {animal.artificialReproductionMethod && <InfoItem label="Artificial Reproduction Method" value={animal.artificialReproductionMethod} />}
                        </div>
                    </InfoCard>
                )}
            </div>
    );
};