import React from 'react';
import { UtensilsCrossed, Home, Droplets, Thermometer, Scissors, CheckSquare, Sun, Wind, Bug, Activity } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { useDetailFieldTemplate, DetailJsonList, parseJsonField } from './utils';
import { InfoCard, InfoItem } from './DashboardComponents';

// Helper to render tasks
const TaskList = ({ tasks, label }) => {
    if (!tasks || tasks.length === 0) return null;
    return (
        <div>
            <h4 className="text-sm font-semibold text-gray-600 mt-3 mb-1">{label}</h4>
            <div className="space-y-1">
                {tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-gray-100 px-2 py-1.5 rounded border border-gray-200">
                        <span className="font-medium text-gray-700">{task.taskName}</span>
                        <div className="flex items-center gap-2 text-gray-500">
                            {task.frequencyDays && <span>Every {task.frequencyDays}d</span>}
                            {task.lastDoneDate && <span>Last: {formatDate(task.lastDoneDate)}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CareTabContent = ({ animal, API_BASE_URL }) => {
    const { getLabel } = useDetailFieldTemplate(animal?.species, API_BASE_URL);

    const careTasks = parseJsonField(animal.careTasks);
    const animalCareTasks = parseJsonField(animal.animalCareTasks);
    
    // New structured records
    const sheddingRecords = parseJsonField(animal.sheddingRecords);
    const moltingRecords = parseJsonField(animal.moltingRecords);
    const waterParameterChecks = parseJsonField(animal.waterParameterChecks);
    const dietSupplies = parseJsonField(animal.dietSupplies);
    const supplementSupplies = parseJsonField(animal.supplementSupplies);
    const nutritionSchedule = animal.nutritionSchedule ? (typeof animal.nutritionSchedule === 'string' ? JSON.parse(animal.nutritionSchedule) : animal.nutritionSchedule) : null;

    const hasNutrition = animal.dietType || animal.feedingSchedule || animal.supplements || dietSupplies.length > 0 || supplementSupplies.length > 0 || nutritionSchedule;
    const hasHousing = animal.housingType || animal.bedding || animal.enrichment;
    const hasEnvironment = animal.temperatureRange || animal.humidity || animal.lighting || animal.noise || animal.lastBulbChange;
    const hasGrooming = animal.groomingNeeds || animal.sheddingLevel;

    return (
        <div className="space-y-6">
            {/* Nutrition & Feeding */}
            <InfoCard title="Nutrition & Feeding" icon={<UtensilsCrossed size={18} className="text-gray-400" />}>
                {hasNutrition || animal.portionSize || animal.feedingMethod || animal.waterAccess || animal.feedingBehaviorNotes || animal.lastFedDate || animal.feedingFrequencyDays ? (
                    <div className="space-y-4">
                        {nutritionSchedule && (
                            <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded mb-4">
                                <p className="text-xs font-semibold text-green-700 mb-2">📋 Nutrition Schedule</p>
                                <div className="text-sm text-green-900 space-y-1">
                                    <p><strong>Status:</strong> {nutritionSchedule.enabled ? 'Active' : 'Inactive'}</p>
                                    {nutritionSchedule.startDate && <p><strong>Started:</strong> {formatDate(nutritionSchedule.startDate)}</p>}
                                    {nutritionSchedule.frequency && nutritionSchedule.unit && <p><strong>Frequency:</strong> Every {nutritionSchedule.frequency} {nutritionSchedule.unit}</p>}
                                    {nutritionSchedule.timesPerDay && <p><strong>Daily Feedings:</strong> {nutritionSchedule.timesPerDay}x</p>}
                                    {nutritionSchedule.notes && <p><strong>Notes:</strong> {nutritionSchedule.notes}</p>}
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {animal.dietType && <InfoItem label="Diet Type" value={animal.dietType} />}
                            {animal.feedingSchedule && <InfoItem label="Feeding Schedule" value={animal.feedingSchedule} />}
                            {animal.portionSize && <InfoItem label="Portion Size" value={animal.portionSize} />}
                            {animal.feedingMethod && <InfoItem label="Feeding Method" value={animal.feedingMethod} />}
                            {animal.feedingLocation && <InfoItem label="Feeding Location" value={animal.feedingLocation} />}
                            {animal.waterAccess && <InfoItem label="Water Access" value={animal.waterAccess} />}
                            {animal.lastFedDate && <InfoItem label="Last Fed Date" value={formatDate(animal.lastFedDate)} />}
                            {animal.feedingFrequencyDays && <InfoItem label="Feeding Frequency" value={`Every ${animal.feedingFrequencyDays} days`} />}
                            {animal.supplements && <InfoItem label="Supplements" value={animal.supplements} />}
                        </div>
                        {(dietSupplies.length > 0 || supplementSupplies.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                                {dietSupplies.length > 0 && <DetailJsonList label="Diet Supplies" data={dietSupplies} renderItem={d => d.name ? `${d.name}${d.quantity ? ` (${d.quantity})` : ''}` : 'Diet supply'} />}
                                {supplementSupplies.length > 0 && <DetailJsonList label="Supplement Supplies" data={supplementSupplies} renderItem={s => s.name ? `${s.name}${s.dosage ? ` (${s.dosage})` : ''}` : 'Supplement'} />}
                            </div>
                        )}
                        {animal.feedingBehaviorNotes && <div className="md:col-span-2 lg:col-span-3 pt-2 border-t"><InfoItem label="Feeding Behavior Notes"><p className="whitespace-pre-wrap text-sm">{animal.feedingBehaviorNotes}</p></InfoItem></div>}
                    </div>
                ) : <p className="text-sm text-gray-400">No nutrition information.</p>}
            </InfoCard>

            {/* Dietary Preferences & Restrictions */}
            {(animal.dietaryRestrictions || animal.dietaryPreferences) && (
                <InfoCard title="Dietary Information" icon={<UtensilsCrossed size={18} className="text-gray-400" />}>
                    <div className="space-y-4">
                        {animal.dietaryRestrictions && <InfoItem label="Dietary Restrictions"><p className="whitespace-pre-wrap text-sm">{animal.dietaryRestrictions}</p></InfoItem>}
                        {animal.dietaryPreferences && <InfoItem label="Dietary Preferences"><p className="whitespace-pre-wrap text-sm">{animal.dietaryPreferences}</p></InfoItem>}
                    </div>
                </InfoCard>
            )}

            {/* Housing & Environment */}
            <InfoCard title="Housing & Environment" icon={<Home size={18} className="text-gray-400" />}>
                {hasHousing || hasEnvironment ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {animal.housingType && <InfoItem label={getLabel('housingType', 'Housing Type')} value={animal.housingType} />}
                        {animal.bedding && <InfoItem label={getLabel('bedding', 'Bedding')} value={animal.bedding} />}
                        {animal.enclosureId && <InfoItem label="Enclosure ID" value={animal.enclosureId} />}
                        {animal.temperatureRange && <InfoItem label="Temperature Range" value={animal.temperatureRange} icon={<Thermometer size={14} />} />}
                        {animal.humidity && <InfoItem label={getLabel('humidity', 'Humidity')} value={animal.humidity} icon={<Wind size={14} />} />}
                    </div>
                ) : <p className="text-sm text-gray-400">No housing or environment details.</p>}
            </InfoCard>

            {/* Lighting & Environmental Controls */}
            {(animal.lightingType || animal.lightingSchedule) && (
                <InfoCard title="Lighting & Controls" icon={<Sun size={18} className="text-gray-400" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {animal.lightingType && <InfoItem label="Lighting Type" value={animal.lightingType} />}
                        {animal.lightingSchedule && <InfoItem label="Lighting Schedule" value={animal.lightingSchedule} />}
                        {animal.lastBulbChange && <InfoItem label="Last Bulb Change" value={formatDate(animal.lastBulbChange)} />}
                    </div>
                </InfoCard>
            )}

            {/* Noise & Sound Environment */}
            {(animal.noiseToleranceLevel || animal.soundPreferences) && (
                <InfoCard title="Noise & Sound Environment" icon={<Wind size={18} className="text-gray-400" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {animal.noiseToleranceLevel && <InfoItem label="Noise Tolerance Level" value={animal.noiseToleranceLevel} />}
                        {animal.soundPreferences && <InfoItem label="Sound Preferences" value={animal.soundPreferences} />}
                    </div>
                </InfoCard>
            )}

            {/* Enrichment & Environmental Maintenance */}
            {(animal.enrichment || animal.enrichmentNeeds || animal.enrichmentFrequency) && (
                <InfoCard title="Enrichment & Environmental Maintenance" icon={<Activity size={18} className="text-gray-400" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {animal.enrichment && <InfoItem label="Current Enrichment" value={animal.enrichment} />}
                        {animal.enrichmentFrequency && <InfoItem label="Enrichment Rotation Frequency" value={animal.enrichmentFrequency} />}
                        {animal.enrichmentNeeds && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Enrichment Needs"><p className="whitespace-pre-wrap text-sm">{animal.enrichmentNeeds}</p></InfoItem></div>}
                        {animal.environmentNotes && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Environment Notes"><p className="whitespace-pre-wrap text-sm">{animal.environmentNotes}</p></InfoItem></div>}
                    </div>
                </InfoCard>
            )}

            {/* Cleaning & Maintenance Schedule */}
            {(animal.spotCleaningFrequency || animal.deepCleaningFrequency || animal.cleaningChecklist || animal.maintenanceTasksDue) && (
                <InfoCard title="Cleaning & Maintenance Schedule" icon={<Scissors size={18} className="text-gray-400" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {animal.spotCleaningFrequency && <InfoItem label="Spot Cleaning Frequency" value={animal.spotCleaningFrequency} />}
                        {animal.deepCleaningFrequency && <InfoItem label="Deep Cleaning Frequency" value={animal.deepCleaningFrequency} />}
                        {animal.lastMaintenanceDate && <InfoItem label="Last Maintenance Date" value={formatDate(animal.lastMaintenanceDate)} />}
                        {animal.maintenanceFrequencyDays && <InfoItem label="Maintenance Frequency" value={`Every ${animal.maintenanceFrequencyDays} days`} />}
                        {animal.cleaningChecklist && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Cleaning Checklist"><p className="whitespace-pre-wrap text-sm">{animal.cleaningChecklist}</p></InfoItem></div>}
                        {animal.maintenanceTasksDue && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Maintenance Tasks Due"><p className="whitespace-pre-wrap text-sm">{animal.maintenanceTasksDue}</p></InfoItem></div>}
                    </div>
                </InfoCard>
            )}

            {/* Detailed Grooming */}
            {(animal.groomingNeeds || animal.sheddingLevel || animal.brushingFrequency || animal.bathingFrequency || animal.coatCareNotes || animal.nailCareRequirements || animal.beakHoofScaleMaintenance || animal.skinEarCareNeeds || animal.dentalCareRequirements || animal.groomingNotes) && (
                <InfoCard title="Grooming & Personal Care" icon={<Scissors size={18} className="text-gray-400" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {animal.groomingNeeds && <InfoItem label={getLabel('groomingNeeds', 'Grooming Needs')} value={animal.groomingNeeds} />}
                        {animal.sheddingLevel && <InfoItem label={getLabel('sheddingLevel', 'Shedding Level')} value={animal.sheddingLevel} />}
                        {animal.brushingFrequency && <InfoItem label="Brushing Frequency" value={animal.brushingFrequency} />}
                        {animal.bathingFrequency && <InfoItem label="Bathing Frequency" value={animal.bathingFrequency} />}
                        {animal.nailCareRequirements && <InfoItem label="Nail Care Requirements" value={animal.nailCareRequirements} />}
                        {animal.beakHoofScaleMaintenance && <InfoItem label="Beak/Hoof/Scale Maintenance" value={animal.beakHoofScaleMaintenance} />}
                        {animal.skinEarCareNeeds && <InfoItem label="Skin & Ear Care Needs" value={animal.skinEarCareNeeds} />}
                        {animal.dentalCareRequirements && <InfoItem label="Dental Care Requirements" value={animal.dentalCareRequirements} />}
                        {animal.coatCareNotes && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Coat Care Notes"><p className="whitespace-pre-wrap text-sm">{animal.coatCareNotes}</p></InfoItem></div>}
                        {animal.groomingNotes && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Grooming Notes"><p className="whitespace-pre-wrap text-sm">{animal.groomingNotes}</p></InfoItem></div>}
                    </div>
                </InfoCard>
            )}

            {/* Special Care & Health Monitoring */}
            {(animal.specialCareRequirements || animal.specialCareNeeds || animal.healthMonitoringNotes || animal.additionalSpecialRequirements) && (
                <InfoCard title="Special Care & Health Monitoring" icon={<Droplets size={18} className="text-gray-400" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {animal.specialCareRequirements && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Special Care Requirements"><p className="whitespace-pre-wrap text-sm">{animal.specialCareRequirements}</p></InfoItem></div>}
                        {animal.specialCareNeeds && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Special Care Needs"><p className="whitespace-pre-wrap text-sm">{animal.specialCareNeeds}</p></InfoItem></div>}
                        {animal.healthMonitoringNotes && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Health Monitoring Notes"><p className="whitespace-pre-wrap text-sm">{animal.healthMonitoringNotes}</p></InfoItem></div>}
                        {animal.additionalSpecialRequirements && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Additional Special Requirements"><p className="whitespace-pre-wrap text-sm">{animal.additionalSpecialRequirements}</p></InfoItem></div>}
                    </div>
                </InfoCard>
            )}

            {/* Scheduled Tasks */}
            <InfoCard title="Scheduled Tasks" icon={<Activity size={18} className="text-gray-400" />}>
                <TaskList tasks={animalCareTasks} label="Animal-Specific Tasks" />
                <TaskList tasks={careTasks} label="Enclosure-Related Tasks" />
                {animalCareTasks.length === 0 && careTasks.length === 0 && <p className="text-sm text-gray-400">No scheduled care tasks.</p>}
            </InfoCard>

            {/* Shedding History */}
            <InfoCard title="Shedding History" icon={<Bug size={18} className="text-gray-400" />}>
                {sheddingRecords.length > 0 ? (
                    <DetailJsonList label="" data={sheddingRecords.filter(Boolean)} renderItem={r => `${formatDate(r.date)} ${r.notes ? `- ${r.notes}` : ''}`} />
                ) : <p className="text-sm text-gray-400">No shedding records.</p>}
            </InfoCard>

            {/* Molting History */}
            <InfoCard title="Molting History" icon={<Bug size={18} className="text-gray-400" />}>
                {moltingRecords.length > 0 ? (
                    <DetailJsonList label="" data={moltingRecords.filter(Boolean)} renderItem={r => `${formatDate(r.date)} ${r.notes ? `- ${r.notes}` : ''}`} />
                ) : <p className="text-sm text-gray-400">No molting records.</p>}
            </InfoCard>

            {/* Water Quality Checks */}
            <InfoCard title="Water Quality Checks" icon={<Droplets size={18} className="text-gray-400" />}>
                {waterParameterChecks.length > 0 ? (
                    <DetailJsonList label="" data={waterParameterChecks.filter(Boolean)} renderItem={r => `${formatDate(r.date)} - pH: ${r.ph}, Ammonia: ${r.ammonia}`} />
                ) : <p className="text-sm text-gray-400">No water quality records.</p>}
            </InfoCard>
        </div>
    );
};
