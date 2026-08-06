import React from 'react';
import { MessageSquare, Activity, AlertTriangle, CheckSquare, Dumbbell } from 'lucide-react';
import { formatScheduleValue } from './utils';
import { InfoCard, InfoItem } from './DashboardComponents';
import { isFieldHiddenForSpecies } from '../../utils/speciesFieldTemplates';

export const BehaviorTabContent = ({ animal }) => {
    const species = animal.species;
    const hidden = (field) => isFieldHiddenForSpecies(field, species);
    const hasBehavior = animal.temperament || animal.handlingTolerance || animal.socialStructure || animal.handlingNotes || animal.socializationNotes;
    const hasActivity = (!hidden('exerciseRequirements') && animal.exerciseRequirements) || (!hidden('dailyExerciseMinutes') && animal.dailyExerciseMinutes) || (!hidden('trainingLevel') && animal.trainingLevel) || (!hidden('trainingDisciplines') && animal.trainingDisciplines) || (!hidden('workingRole') && animal.workingRole) || (!hidden('certifications') && animal.certifications) || animal.activityCycle;
    const hasTraining = (!hidden('crateTrained') && animal.crateTrained) || (!hidden('litterTrained') && animal.litterTrained) || (!hidden('leashTrained') && animal.leashTrained) || (!hidden('freeFlightTrained') && animal.freeFlightTrained);
    const hasKnownIssues = animal.behavioralIssues || animal.biteHistory || animal.reactivityNotes;
    const trainingSchedules = [
        { key: 'exerciseSchedule', label: 'Daily Exercise' },
        { key: 'crateTrainingSchedule', label: 'Crate Training' },
        { key: 'litterTrainingSchedule', label: 'Litter Training' },
        { key: 'leashTrainingSchedule', label: 'Leash Training' },
        { key: 'freeFlightTrainingSchedule', label: 'Free-Flight Training' },
        { key: 'workingRoleTrainingSchedule', label: 'Working Role Training' },
        { key: 'behavioralIssueTrainingSchedule', label: 'Behavioral Issue Training' },
        { key: 'reactivityTrainingSchedule', label: 'Reactivity Training' },
        { key: 'flightRiskTrainingSchedule', label: 'Flight Risk Training' },
    ].filter(def => !hidden(def.key) && formatScheduleValue(animal[def.key]));
    const hasAnyData = hasBehavior || hasActivity || hasTraining || hasKnownIssues || trainingSchedules.length > 0;


    return (
        <div className="space-y-6">
            <InfoCard title="Temperament & Social" icon={<MessageSquare size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                {hasBehavior ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {animal.temperament && <InfoItem label="Temperament" value={animal.temperament} />}
                        {animal.handlingTolerance && <InfoItem label="Handling Tolerance" value={animal.handlingTolerance} />}
                        {animal.socialStructure && <InfoItem label="Social Structure" value={animal.socialStructure} />}
                        {animal.handlingNotes && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Handling Notes"><p className="whitespace-pre-wrap text-sm">{animal.handlingNotes}</p></InfoItem></div>}
                        {animal.socializationNotes && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Socialization Notes"><p className="whitespace-pre-wrap text-sm">{animal.socializationNotes}</p></InfoItem></div>}
                    </div>
                ) : <p className="text-sm text-gray-400 dark:text-dark-text-muted">No temperament or social information recorded.</p>}
            </InfoCard>

            <InfoCard title="Activity & Training" icon={<Activity size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                {hasActivity ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {animal.activityCycle && <InfoItem label="Activity Cycle" value={animal.activityCycle} />}
                        {animal.exerciseRequirements && !hidden('exerciseRequirements') && <InfoItem label="Exercise Requirements" value={animal.exerciseRequirements} />}
                        {animal.dailyExerciseMinutes && !hidden('dailyExerciseMinutes') && <InfoItem label="Daily Exercise (min)" value={animal.dailyExerciseMinutes} />}
                        {animal.trainingLevel && !hidden('trainingLevel') && <InfoItem label="Training Level" value={animal.trainingLevel} />}
                        {animal.trainingDisciplines && !hidden('trainingDisciplines') && <InfoItem label="Training Disciplines" value={animal.trainingDisciplines} />}
                        {animal.workingRole && !hidden('workingRole') && <InfoItem label="Working Role" value={animal.workingRole} />}
                        {animal.certifications && !hidden('certifications') && <InfoItem label="Certifications" value={animal.certifications} />}
                    </div>
                ) : <p className="text-sm text-gray-400 dark:text-dark-text-muted">No activity or training information recorded.</p>}
            </InfoCard>

            {/* Training Status */}
            {hasTraining && (
                <InfoCard title="Training Status" icon={<CheckSquare size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                    <div className="flex flex-wrap gap-2">
                        {animal.crateTrained && !hidden('crateTrained') && <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full flex items-center gap-1"><CheckSquare size={12}/> Crate Trained</span>}
                        {animal.litterTrained && !hidden('litterTrained') && <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full flex items-center gap-1"><CheckSquare size={12}/> Litter Trained</span>}
                        {animal.leashTrained && !hidden('leashTrained') && <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full flex items-center gap-1"><CheckSquare size={12}/> Leash Trained</span>}
                        {animal.freeFlightTrained && !hidden('freeFlightTrained') && <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full flex items-center gap-1"><CheckSquare size={12}/> Free Flight Trained</span>}
                    </div>
                </InfoCard>
            )}

            {/* Training Schedules — dedicated, individually-tracked recurring training/exercise items */}
            {trainingSchedules.length > 0 && (
                <InfoCard title="Training Schedules" icon={<Dumbbell size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trainingSchedules.map(def => (
                            <InfoItem key={def.key} label={def.label} value={formatScheduleValue(animal[def.key])} />
                        ))}
                    </div>
                </InfoCard>
            )}

            <InfoCard title="Known Issues" icon={<AlertTriangle size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                {hasKnownIssues ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {animal.behavioralIssues && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Behavioral Issues"><p className="whitespace-pre-wrap text-sm">{animal.behavioralIssues}</p></InfoItem></div>}
                        {animal.biteHistory && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Bite History"><p className="whitespace-pre-wrap text-sm">{animal.biteHistory}</p></InfoItem></div>}
                        {animal.reactivityNotes && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Reactivity Notes"><p className="whitespace-pre-wrap text-sm">{animal.reactivityNotes}</p></InfoItem></div>}
                    </div>
                ) : <p className="text-sm text-gray-400 dark:text-dark-text-muted">No known issues recorded.</p>}
            </InfoCard>
        </div>
    );
};