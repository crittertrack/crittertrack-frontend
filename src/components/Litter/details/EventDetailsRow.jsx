import React from 'react';
import { formatDate } from '../../../utils/dateFormatter';
import { Panel, DetailRow, isBlank } from './ui';
import { getLitterFieldLabel, getLitterSpecies, isEggLayingSpecies } from '../../../utils/litterSpeciesPresentation';

const known = (v) => (isBlank(v) || v === 'Unknown' ? null : v);
const dateOr = (d) => (d ? formatDate(d) : null);
const eggValueLabels = {
    'Natural': 'Natural laying / hatch',
    'C-Section': 'Surgical assistance',
    'Healthy litter': 'Healthy clutch / brood',
    'Dam complications': 'Parent complications',
    'All lost': 'All eggs / clutch lost',
    Cannibalized: 'Eggs / clutch consumed',
    'All Stillborn': 'No viable eggs / hatchlings',
    Reabsorbed: 'Eggs reabsorbed',
    'All weaned': 'All fledged / independent',
    'Some losses': 'Some failed to fledge / become independent',
    'Early weaning': 'Early independence',
    'Late weaning': 'Late independence',
};

export default function EventDetailsRow({ litter, status, speciesOptions = [] }) {
    const born = status === 'born';
    const species = getLitterSpecies(litter);
    const eggLaying = isEggLayingSpecies(species, speciesOptions);
    const displayValue = value => {
        const normalized = known(value);
        return eggLaying && normalized ? eggValueLabels[normalized] || normalized : normalized;
    };
    const birthDate = litter.birthDate ? formatDate(litter.birthDate) : (litter.birthDateUnknown ? 'Date unknown' : null);
    const assistance = litter.assistanceRequired === true ? 'Yes' : litter.assistanceRequired === false ? 'No' : null;
    const weaningActual = litter.weaningConfirmed ? dateOr(litter.weaningDate) : null;
    const weaningExpected = litter.weaningConfirmed ? null : dateOr(litter.weaningDate);

    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-3">{eggLaying ? 'Pairing, egg laying & hatch details' : 'Mating, pregnancy & birth details'}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Panel title={eggLaying ? 'Pairing' : 'Mating'} testId="mating-panel">
                    <DetailRow label={getLitterFieldLabel('matingDate', species, 'Mating date', speciesOptions)} value={dateOr(litter.matingDate || litter.pairingDate)} />
                    <DetailRow label={eggLaying ? 'Pairing method' : 'Mating method'} value={displayValue(litter.breedingMethod)} />
                    <DetailRow label={eggLaying ? 'Condition at pairing' : 'Mating condition'} value={known(litter.breedingConditionAtTime)} />
                    <DetailRow label={eggLaying ? 'Pairing outcome' : 'Mating outcome'} value={displayValue(litter.outcome)} />
                    {litter.pregnancyLost && <DetailRow label={getLitterFieldLabel('pregnancyLost', species, 'Pregnancy lost', speciesOptions)} value={displayValue(litter.pregnancyLostReason) || 'Yes'} />}
                </Panel>

                <Panel title={eggLaying ? 'Laying & hatch' : 'Birth'} testId="birth-panel">
                    <DetailRow label={getLitterFieldLabel('birthDate', species, 'Birth date', speciesOptions)} value={birthDate} />
                    <DetailRow label={eggLaying ? 'Laying / hatch method' : 'Birth method'} value={displayValue(litter.birthMethod)} />
                    <DetailRow label={eggLaying ? 'Laying / hatch complications' : 'Complications'} value={litter.birthComplications} />
                    <DetailRow label={eggLaying ? 'Clutch / hatch outcome' : 'Birth outcome'} value={displayValue(litter.birthOutcome)} />
                    <DetailRow label={eggLaying ? 'Laying / hatch assistance required' : 'Assistance required'} value={assistance} />
                    <DetailRow label={eggLaying ? 'Clutch / hatch notes' : 'Notes'} value={litter.birthNotes} />
                </Panel>

                <Panel title={eggLaying ? 'Fledging / independence' : 'Weaning'} testId="weaning-panel">
                    <DetailRow label={`Expected ${getLitterFieldLabel('weaningDate', species, 'weaning date', speciesOptions).toLowerCase()}`} value={weaningExpected} />
                    <DetailRow label={`Actual ${getLitterFieldLabel('weaningDate', species, 'weaning date', speciesOptions).toLowerCase()}`} value={weaningActual || (born && !litter.weaningConfirmed ? 'Pending' : null)} />
                    <DetailRow label={getLitterFieldLabel('weaningOutcome', species, 'Weaning outcome', speciesOptions)} value={displayValue(litter.weaningOutcome)} />
                    <DetailRow label={getLitterFieldLabel('weaningNotes', species, 'Notes', speciesOptions)} value={litter.weaningNotes} />
                </Panel>
            </div>
        </div>
    );
}
