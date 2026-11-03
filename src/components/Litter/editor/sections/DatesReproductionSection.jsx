import React from 'react';
import DatePicker from '../../../DatePicker';
import { deriveLitterFormStatus, LITTER_STATUS_LABELS } from '../../../../utils/litterStatus';
import { CalendarDays, Heart, Baby, List } from 'lucide-react';
import { Checkbox, FieldRow, SectionTitle, cardClass, inputClass } from '../fields';
import { getLitterFieldLabel, getLitterSpeciesCategory, isEggLayingSpecies } from '../../../../utils/litterSpeciesPresentation';
import { isFieldHiddenForSpecies } from '../../../../utils/speciesFieldTemplates';

const STATUS_HINTS = {
    planned: 'No mating yet, or the mating date is in the future.',
    mated: 'Mating date is today or earlier.',
    pregnant: 'A pregnancy has been confirmed.',
    born: 'A birth date (or "born, date unknown") is recorded.',
};

export default function DatesReproductionSection({ form, setField, setFields, errors, original, species = '', speciesOptions = [], autoCalcDueDate, autoCalcWeaningDate, autoCalcAvailable }) {
    const status = deriveLitterFormStatus(form, original);
    const speciesCategory = getLitterSpeciesCategory(species, speciesOptions);
    const eggLaying = isEggLayingSpecies(species, speciesOptions);
    const hideWeaningDate = isFieldHiddenForSpecies('weaningDate', species, speciesCategory);
    const matingLabel = getLitterFieldLabel('matingDate', species, 'Mating date', speciesOptions);
    const expectedLabel = getLitterFieldLabel('expectedDueDate', species, 'Expected due date', speciesOptions);
    const birthLabel = getLitterFieldLabel('birthDate', species, 'Birth date', speciesOptions);
    const dateSectionTitle = eggLaying ? 'Hatch / laying & independence dates' : 'Birth & weaning dates';
    const dateSectionDescription = eggLaying
        ? 'Record when eggs are laid or offspring hatch, along with any applicable independence date.'
        : 'Enter the birth and weaning dates once the litter is born.';
    const statusHints = eggLaying ? {
        planned: 'No pairing yet, or the pairing date is in the future.',
        mated: 'Pairing date is today or earlier.',
        pregnant: 'A gravid or egg-producing state has been confirmed.',
        born: 'A laying, hatching, or birth date (or unknown date) is recorded.',
    } : STATUS_HINTS;
    const statusLabels = eggLaying ? {
        ...LITTER_STATUS_LABELS,
        mated: 'Paired',
        pregnant: 'Gravid',
        born: 'Eggs laid / offspring recorded',
    } : LITTER_STATUS_LABELS;

    return (
        <>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                    <CalendarDays size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Dates & status</h1>
                    <p className="text-sm text-gray-500 dark:text-dark-text-muted">{eggLaying ? 'Enter the important pairing, laying, and hatch dates for this clutch.' : 'Enter the important dates and choose the current status for this litter.'}</p>
                </div>
            </div>

            <div className={cardClass}>
                <SectionTitle title={eggLaying ? 'Pairing information' : 'Mating information'} description={eggLaying ? 'When were the animals paired, and when are eggs expected to hatch?' : 'When was this pairing done, and when is the litter expected?'} icon={Heart} iconBg="bg-cyan-100" iconColor="text-cyan-600" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FieldRow label={matingLabel} error={errors.matingDate}>
                            <DatePicker value={form.matingDate || ''} onChange={(e) => setField('matingDate', e.target.value)} className="px-3 py-2" />
                        </FieldRow>
                        <div className="mt-2">
                            <Checkbox
                                checked={!form.matingDate && form.matingDate === '' ? false : false}
                                onChange={() => {}}
                                label="No mating date yet (planned pairing)"
                            />
                        </div>
                    </div>
                    <div>
                        <FieldRow label={expectedLabel} hint={autoCalcAvailable && autoCalcDueDate ? `Automatically calculated from the ${eggLaying ? 'pairing' : 'mating'} date if left blank.` : undefined}>
                            <DatePicker value={form.expectedDueDate || ''} onChange={(e) => setField('expectedDueDate', e.target.value)} className="px-3 py-2" />
                        </FieldRow>
                    </div>
                </div>
            </div>

            <div className={cardClass}>
                <SectionTitle title={dateSectionTitle} description={dateSectionDescription} icon={Baby} iconBg="bg-cyan-100" iconColor="text-cyan-600" />
                <div className={`grid grid-cols-1 ${hideWeaningDate ? '' : 'md:grid-cols-2'} gap-4`}>
                    <div>
                        <FieldRow label={birthLabel} error={errors.birthDate}>
                            <DatePicker value={form.birthDate || ''} onChange={(e) => setFields({ birthDate: e.target.value, birthDateUnknown: e.target.value ? false : form.birthDateUnknown })} disabled={!!form.birthDateUnknown} className="px-3 py-2" />
                        </FieldRow>
                        <div className="mt-2">
                            <Checkbox checked={form.birthDateUnknown} onChange={(checked) => setFields({ birthDateUnknown: checked, birthDate: checked ? '' : form.birthDate })} label={`${eggLaying ? 'Laying / hatch date' : 'Born, birth date'} unknown`} />
                        </div>
                    </div>
                    {!hideWeaningDate && (
                        <div>
                            <FieldRow label={getLitterFieldLabel('weaningDate', species, 'Weaning date', speciesOptions)} hint={autoCalcAvailable && autoCalcWeaningDate ? `Filled in automatically from the ${eggLaying ? 'hatch' : 'birth'} date if left blank.` : undefined}>
                                <DatePicker value={form.weaningDate || ''} onChange={(e) => setField('weaningDate', e.target.value)} className="px-3 py-2" />
                            </FieldRow>
                            <div className="mt-2">
                                <Checkbox checked={form.weaningConfirmed} onChange={(checked) => setField('weaningConfirmed', checked)} label={getLitterFieldLabel('weaningConfirmed', species, 'Confirm weaning', speciesOptions)} hint={eggLaying ? 'Marks the young as fledged or independent.' : "Ends the dam's nursing status."} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={cardClass}>
                <SectionTitle title="Current status" description="Set the current status for this litter." icon={List} iconBg="bg-cyan-100" iconColor="text-cyan-600" />
                <div className="space-y-3">
                    <select className={inputClass} value={status} onChange={() => {}} disabled>
                        {Object.keys(statusLabels).map(k => <option key={k} value={k}>{statusLabels[k]}</option>)}
                    </select>
                    <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 text-sm">
                        <span className="font-semibold text-indigo-700 dark:text-indigo-300">{statusLabels[status]}</span>
                        <span className="text-gray-600 dark:text-dark-text-secondary"> — {statusHints[status]}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
