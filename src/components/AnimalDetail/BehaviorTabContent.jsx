import React from 'react';
import { MessageSquare, Activity, AlertTriangle } from 'lucide-react';
import { useDetailFieldTemplate } from './utils';
import { InfoCard, InfoItem } from './DashboardComponents';

export const BehaviorTabContent = ({ animal, API_BASE_URL }) => {
    const { getLabel } = useDetailFieldTemplate(animal?.species, API_BASE_URL);

    const hasBehavior = animal.temperament || animal.handlingTolerance || animal.socialStructure;
    const hasActivity = animal.activityCycle || animal.exerciseRequirements || animal.dailyExerciseMinutes || animal.trainingLevel || animal.trainingDisciplines || animal.workingRole || animal.certifications;
    const hasKnownIssues = animal.behavioralIssues || animal.biteHistory || animal.reactivityNotes;
    const hasAnyData = hasBehavior || hasActivity || hasKnownIssues;

    if (!hasAnyData) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg text-gray-400">
                <MessageSquare size={48} className="mb-2" />
                <p className="text-sm">No behavior information recorded.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard title="Temperament & Social" icon={<MessageSquare size={18} className="text-gray-400" />}>
                {hasBehavior ? (
                    <dl className="space-y-4">
                        {animal.temperament && <InfoItem label="Temperament" value={animal.temperament} />}
                        {animal.handlingTolerance && <InfoItem label={getLabel('handlingTolerance', 'Handling Tolerance')} value={animal.handlingTolerance} />}
                        {animal.socialStructure && <InfoItem label="Social Structure" value={animal.socialStructure} />}
                    </dl>
                ) : <p className="text-sm text-gray-400">No temperament or social information recorded.</p>}
            </InfoCard>
            <InfoCard title="Activity & Training" icon={<Activity size={18} className="text-gray-400" />}>
                {hasActivity ? (
                     <dl className="space-y-4">
                        {animal.activityCycle && <InfoItem label="Activity Cycle" value={animal.activityCycle} />}
                        {animal.exerciseRequirements && <InfoItem label={getLabel('exerciseRequirements', 'Exercise Requirements')} value={animal.exerciseRequirements} />}
                        {animal.dailyExerciseMinutes && <InfoItem label={getLabel('dailyExerciseMinutes', 'Daily Exercise (min)')} value={animal.dailyExerciseMinutes} />}
                        {animal.trainingLevel && <InfoItem label={getLabel('trainingLevel', 'Training Level')} value={animal.trainingLevel} />}
                        {animal.trainingDisciplines && <InfoItem label={getLabel('trainingDisciplines', 'Training Disciplines')} value={animal.trainingDisciplines} />}
                        {animal.workingRole && <InfoItem label={getLabel('workingRole', 'Working Role')} value={animal.workingRole} />}
                        {animal.certifications && <InfoItem label={getLabel('certifications', 'Certifications')} value={animal.certifications} />}
                    </dl>
                ) : <p className="text-sm text-gray-400">No activity or training information recorded.</p>}
            </InfoCard>
            <InfoCard title="Known Issues" icon={<AlertTriangle size={18} className="text-gray-400" />}>
                {hasKnownIssues ? (
                    <dl className="space-y-4">
                        {animal.behavioralIssues && <InfoItem label={getLabel('behavioralIssues', 'Behavioral Issues')}><p className="whitespace-pre-wrap">{animal.behavioralIssues}</p></InfoItem>}
                        {animal.biteHistory && <InfoItem label={getLabel('biteHistory', 'Bite History')}><p className="whitespace-pre-wrap">{animal.biteHistory}</p></InfoItem>}
                        {animal.reactivityNotes && <InfoItem label={getLabel('reactivityNotes', 'Reactivity Notes')}><p className="whitespace-pre-wrap">{animal.reactivityNotes}</p></InfoItem>}
                    </dl>
                ) : <p className="text-sm text-gray-400">No known issues recorded.</p>}
            </InfoCard>
        </div>
    );
};