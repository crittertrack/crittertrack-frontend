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

    const hasNutrition = animal.dietType || animal.feedingSchedule || animal.supplements;
    const hasHousing = animal.housingType || animal.bedding || animal.enrichment;
    const hasEnvironment = animal.temperatureRange || animal.humidity || animal.lighting || animal.noise || animal.lastBulbChange;
    const hasGrooming = animal.groomingNeeds || animal.sheddingLevel;
    const hasTraining = animal.crateTrained || animal.litterTrained || animal.leashTrained || animal.freeFlightTrained;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="space-y-6">
                <InfoCard title="Nutrition" icon={<UtensilsCrossed size={18} className="text-gray-400" />}>
                    {hasNutrition ? (
                        <>
                            {animal.dietType && <InfoItem label="Diet Type" value={animal.dietType} />}
                            {animal.feedingSchedule && <InfoItem label="Feeding Schedule" value={animal.feedingSchedule} />}
                            {animal.supplements && <InfoItem label="Supplements" value={animal.supplements} />}
                        </>
                    ) : <p className="text-sm text-gray-400">No nutrition information.</p>}
                </InfoCard>

                <InfoCard title="Housing & Environment" icon={<Home size={18} className="text-gray-400" />}>
                    {hasHousing || hasEnvironment ? (
                        <>
                            {animal.housingType && <InfoItem label={getLabel('housingType', 'Housing Type')} value={animal.housingType} />}
                            {animal.bedding && <InfoItem label={getLabel('bedding', 'Bedding')} value={animal.bedding} />}
                            {animal.enrichment && <InfoItem label="Enrichment" value={animal.enrichment} />}
                            
                            {hasEnvironment && <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
                                {animal.temperatureRange && <InfoItem label="Temperature Range" value={animal.temperatureRange} icon={<Thermometer size={14} />} />}
                                {animal.humidity && <InfoItem label={getLabel('humidity', 'Humidity')} value={animal.humidity} icon={<Wind size={14} />} />}
                                {animal.lighting && <InfoItem label="Lighting" value={animal.lighting} icon={<Sun size={14} />} />}
                                {animal.lastBulbChange && <InfoItem label="Last Bulb Change" value={formatDate(animal.lastBulbChange)} icon={<Sun size={14} />} />}
                                {animal.noise && <InfoItem label={getLabel('noise', 'Noise Level')} value={animal.noise} />}
                            </div>}
                        </>
                    ) : <p className="text-sm text-gray-400">No housing or environment details.</p>}
                </InfoCard>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
                <InfoCard title="Animal Care & Grooming" icon={<Droplets size={18} className="text-gray-400" />}>
                    {animal.specialCareRequirements && <InfoItem label="Special Care Requirements">
                        <p className="whitespace-pre-wrap">{animal.specialCareRequirements}</p>
                    </InfoItem>}
                    
                    {hasGrooming && <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
                        {animal.groomingNeeds && <InfoItem label={getLabel('groomingNeeds', 'Grooming Needs')} value={animal.groomingNeeds} icon={<Scissors size={14} />} />}
                        {animal.sheddingLevel && <InfoItem label={getLabel('sheddingLevel', 'Shedding Level')} value={animal.sheddingLevel} />}
                    </div>}

                    {hasTraining && <div className="pt-3 mt-3 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-600 mb-2">Training</h4>
                        <div className="flex flex-wrap gap-2">
                            {animal.crateTrained && <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1"><CheckSquare size={12}/> {getLabel('crateTrained', 'Crate Trained')}</span>}
                            {animal.litterTrained && <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1"><CheckSquare size={12}/> {getLabel('litterTrained', 'Litter Trained')}</span>}
                            {animal.leashTrained && <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1"><CheckSquare size={12}/> {getLabel('leashTrained', 'Leash Trained')}</span>}
                            {animal.freeFlightTrained && <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1"><CheckSquare size={12}/> {getLabel('freeFlightTrained', 'Free Flight Trained')}</span>}
                        </div>
                    </div>}
                </InfoCard>

                <InfoCard title="Scheduled Tasks" icon={<Activity size={18} className="text-gray-400" />}>
                    <TaskList tasks={animalCareTasks} label="Animal-Specific Tasks" />
                    <TaskList tasks={careTasks} label="Enclosure-Related Tasks" />
                    {animalCareTasks.length === 0 && careTasks.length === 0 && <p className="text-sm text-gray-400">No scheduled care tasks.</p>}
                </InfoCard>
            </div>

            {/* Column 3 */}
            <div className="space-y-6">
                <InfoCard title="Shedding History" icon={<Bug size={18} className="text-gray-400" />}>
                    {sheddingRecords.length > 0 ? (
                        <DetailJsonList label="" data={sheddingRecords.filter(Boolean)} renderItem={r => `${formatDate(r.date)} ${r.notes ? `- ${r.notes}` : ''}`} />
                    ) : <p className="text-sm text-gray-400">No shedding records.</p>}
                </InfoCard>
                <InfoCard title="Molting History" icon={<Bug size={18} className="text-gray-400" />}>
                    {moltingRecords.length > 0 ? (
                        <DetailJsonList label="" data={moltingRecords.filter(Boolean)} renderItem={r => `${formatDate(r.date)} ${r.notes ? `- ${r.notes}` : ''}`} />
                    ) : <p className="text-sm text-gray-400">No molting records.</p>}
                </InfoCard>
                <InfoCard title="Water Quality Checks" icon={<Droplets size={18} className="text-gray-400" />}>
                    {waterParameterChecks.length > 0 ? (
                        <DetailJsonList label="" data={waterParameterChecks.filter(Boolean)} renderItem={r => `${formatDate(r.date)} - pH: ${r.ph}, Ammonia: ${r.ammonia}`} />
                    ) : <p className="text-sm text-gray-400">No water quality records.</p>}
                </InfoCard>
            </div>
        </div>
    );
};