import React from 'react';
import { formatDate } from '../../../utils/dateFormatter';
import { Panel, DetailRow, isBlank } from './ui';

const known = (v) => (isBlank(v) || v === 'Unknown' ? null : v);
const dateOr = (d) => (d ? formatDate(d) : null);

export default function EventDetailsRow({ litter, status }) {
    const born = status === 'born';
    const birthDate = litter.birthDate ? formatDate(litter.birthDate) : (litter.birthDateUnknown ? 'Date unknown' : null);
    const assistance = litter.assistanceRequired === true ? 'Yes' : litter.assistanceRequired === false ? 'No' : null;
    const weaningActual = litter.weaningConfirmed ? dateOr(litter.weaningDate) : null;
    const weaningExpected = litter.weaningConfirmed ? null : dateOr(litter.weaningDate);

    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-3">Mating, pregnancy &amp; birth details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Panel title="Mating" testId="mating-panel">
                    <DetailRow label="Mating date" value={dateOr(litter.matingDate || litter.pairingDate)} />
                    <DetailRow label="Mating method" value={known(litter.breedingMethod)} />
                    <DetailRow label="Mating condition" value={known(litter.breedingConditionAtTime)} />
                    <DetailRow label="Mating outcome" value={known(litter.outcome)} />
                    {litter.pregnancyLost && <DetailRow label="Pregnancy lost" value={litter.pregnancyLostReason || 'Yes'} />}
                </Panel>

                <Panel title="Birth" testId="birth-panel">
                    <DetailRow label="Birth date" value={birthDate} />
                    <DetailRow label="Birth method" value={known(litter.birthMethod)} />
                    <DetailRow label="Complications" value={litter.birthComplications} />
                    <DetailRow label="Birth outcome" value={known(litter.birthOutcome)} />
                    <DetailRow label="Assistance required" value={assistance} />
                    <DetailRow label="Notes" value={litter.birthNotes} />
                </Panel>

                <Panel title="Weaning" testId="weaning-panel">
                    <DetailRow label="Expected weaning date" value={weaningExpected} />
                    <DetailRow label="Actual weaning date" value={weaningActual || (born && !litter.weaningConfirmed ? 'Pending' : null)} />
                    <DetailRow label="Weaning outcome" value={known(litter.weaningOutcome)} />
                    <DetailRow label="Notes" value={litter.weaningNotes} />
                </Panel>
            </div>
        </div>
    );
}
