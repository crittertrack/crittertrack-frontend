import React from 'react';
import { Feather, Scale } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { useDetailFieldTemplate } from './utils';
import { InfoCard, InfoItem } from './DashboardComponents';

export const EndOfLifeTabContent = ({ animal, API_BASE_URL }) => {
    const { getLabel } = useDetailFieldTemplate(animal?.species, API_BASE_URL);
    const hasAnyData = animal.deceasedDate || animal.causeOfDeath || animal.necropsyResults || animal.endOfLifeCareNotes;

    if (!hasAnyData) {
        return null; // Don't render the card if there's no data
    }

    return (
        <InfoCard title="End of Life Information" icon={<Scale size={18} className="text-gray-400" />}>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {animal.deceasedDate && <InfoItem label="Deceased Date" value={formatDate(animal.deceasedDate)} />}
                {animal.causeOfDeath && <InfoItem label="Cause of Death" value={animal.causeOfDeath} />}
                {animal.necropsyResults && <InfoItem label="Necropsy Results" value={animal.necropsyResults} />}
                {animal.endOfLifeCareNotes && <InfoItem label={getLabel('endOfLifeCareNotes', 'End of Life Care Notes')}><p className="whitespace-pre-wrap">{animal.endOfLifeCareNotes}</p></InfoItem>}
            </dl>
        </InfoCard>
    );
};