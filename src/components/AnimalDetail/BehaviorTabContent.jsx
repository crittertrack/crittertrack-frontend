import React from 'react';
import { MessageSquare, Activity, AlertTriangle, CheckSquare } from 'lucide-react';
import { useDetailFieldTemplate } from './utils';
import { InfoCard, InfoItem } from './DashboardComponents';

export const BehaviorTabContent = ({ animal, API_BASE_URL }) => {
    const { getLabel } = useDetailFieldTemplate(animal?.species, API_BASE_URL);

    const hasBehavior = animal.temperament || animal.handlingTolerance || animal.socialStructure || animal.handlingNotes || animal.socializationNotes;
    const hasActivity = animal.activityCycle || animal.exerciseRequirements || animal.dailyExerciseMinutes || animal.trainingLevel || animal.trainingDisciplines || animal.workingRole || animal.certifications;
    const hasTraining = animal.crateTrained || animal.litterTrained || animal.leashTrained || animal.freeFlightTrained;
    const hasKnownIssues = animal.behavioralIssues || animal.biteHistory || animal.reactivityNotes;
    const hasAnyData = hasBehavior || hasActivity || hasTraining || hasKnownIssues;

    return (
        <div className="space-y-6">
            <InfoCard title="Temperament & Social" icon={<MessageSquare size={18} className="text-gray-400" />}>
                {hasBehavior ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {animal.temperament && <InfoItem label="Temperament" value={animal.temperament} />}
                        {animal.handlingTolerance && <InfoItem label={getLabel('handlingTolerance', 'Handling Tolerance')} value={animal.handlingTolerance} />}
                        {animal.socialStructure && <InfoItem label="Social Structure" value={animal.socialStructure} />}
                        {animal.handlingNotes && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Handling Notes"><p className="whitespace-pre-wrap text-sm">{animal.handlingNotes}</p></InfoItem></div>}
                        {animal.socializationNotes && <div className="md:col-span-2 lg:col-span-3"><InfoItem label="Socialization Notes"><p className="whitespace-pre-wrap text-sm">{animal.socializationNotes}</p></InfoItem></div>}
                    </div>
                ) : <p className="text-sm text-gray-400">No temperament or social information recorded.</p>}
            </InfoCard>

            <InfoCard title="Activity & Training" icon={<Activity size={18} className="text-gray-400" />}>
                {hasActivity ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {animal.activityCycle && <InfoItem label="Activity Cycle" value={animal.activityCycle} />}
                        {animal.exerciseRequirements && <InfoItem label={getLabel('exerciseRequirements', 'Exercise Requirements')} value={animal.exerciseRequirements} />}
                        {animal.dailyExerciseMinutes && <InfoItem label={getLabel('dailyExerciseMinutes', 'Daily Exercise (min)')} value={animal.dailyExerciseMinutes} />}
                        {animal.trainingLevel && <InfoItem label={getLabel('trainingLevel', 'Training Level')} value={animal.trainingLevel} />}
                        {animal.trainingDisciplines && <InfoItem label={getLabel('trainingDisciplines', 'Training Disciplines')} value={animal.trainingDisciplines} />}
                        {animal.workingRole && <InfoItem label={getLabel('workingRole', 'Working Role')} value={animal.workingRole} />}
                        {animal.certifications && <InfoItem label={getLabel('certifications', 'Certifications')} value={animal.certifications} />}
                    </div>
                ) : <p className="text-sm text-gray-400">No activity or training information recorded.</p>}
            </InfoCard>

            {/* Training Status */}
            {hasTraining && (
                <InfoCard title="Training Status" icon={<CheckSquare size={18} className="text-gray-400" />}>
                    <div className="flex flex-wrap gap-2">
                        {animal.crateTrained && <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1"><CheckSquare size={12}/> {getLabel('crateTrained', 'Crate Trained')}</span>}
                        {animal.litterTrained && <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1"><CheckSquare size={12}/> {getLabel('litterTrained', 'Litter Trained')}</span>}
                        {animal.leashTrained && <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1"><CheckSquare size={12}/> {getLabel('leashTrained', 'Leash Trained')}</span>}
                        {animal.freeFlightTrained && <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1"><CheckSquare size={12}/> {getLabel('freeFlightTrained', 'Free Flight Trained')}</span>}
                    </div>
                </InfoCard>
            )}

            <InfoCard title="Known Issues" icon={<AlertTriangle size={18} className="text-gray-400" />}>
                {hasKnownIssues ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {animal.behavioralIssues && <div className="md:col-span-2 lg:col-span-3"><InfoItem label={getLabel('behavioralIssues', 'Behavioral Issues')}><p className="whitespace-pre-wrap text-sm">{animal.behavioralIssues}</p></InfoItem></div>}
                        {animal.biteHistory && <div className="md:col-span-2 lg:col-span-3"><InfoItem label={getLabel('biteHistory', 'Bite History')}><p className="whitespace-pre-wrap text-sm">{animal.biteHistory}</p></InfoItem></div>}
                        {animal.reactivityNotes && <div className="md:col-span-2 lg:col-span-3"><InfoItem label={getLabel('reactivityNotes', 'Reactivity Notes')}><p className="whitespace-pre-wrap text-sm">{animal.reactivityNotes}</p></InfoItem></div>}
                    </div>
                ) : <p className="text-sm text-gray-400">No known issues recorded.</p>}
            </InfoCard>
        </div>
    );
};