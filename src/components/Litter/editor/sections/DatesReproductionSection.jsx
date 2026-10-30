import React from 'react';
import DatePicker from '../../../DatePicker';
import { deriveLitterFormStatus, LITTER_STATUS_LABELS } from '../../../../utils/litterStatus';
import { Checkbox, FieldRow, SectionTitle, cardClass } from '../fields';

const STATUS_HINTS = {
    planned: 'No mating yet, or the mating date is in the future.',
    mated: 'Mating date is today or earlier.',
    pregnant: 'A pregnancy has been confirmed.',
    born: 'A birth date (or "born, date unknown") is recorded.',
};

export default function DatesReproductionSection({ form, setField, setFields, errors, original, autoCalcDueDate, autoCalcWeaningDate, autoCalcAvailable }) {
    const status = deriveLitterFormStatus(form, original);

    return (
        <div className={cardClass}>
            <SectionTitle
                title="Dates & status"
                description="The status follows the dates you enter, so you can start with a planned mating and come back later."
            />

            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 text-sm">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">{LITTER_STATUS_LABELS[status]}</span>
                <span className="text-gray-600 dark:text-dark-text-secondary"> — {STATUS_HINTS[status]}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldRow label="Mating date" error={errors.matingDate}>
                    <DatePicker value={form.matingDate || ''} onChange={(e) => setField('matingDate', e.target.value)} className="px-3 py-2" />
                </FieldRow>

                <FieldRow
                    label="Expected due date"
                    hint={autoCalcAvailable && autoCalcDueDate ? 'Filled in automatically from the mating date if left blank.' : undefined}
                >
                    <DatePicker value={form.expectedDueDate || ''} onChange={(e) => setField('expectedDueDate', e.target.value)} className="px-3 py-2" />
                </FieldRow>

                <FieldRow label="Birth date" error={errors.birthDate}>
                    <DatePicker
                        value={form.birthDate || ''}
                        onChange={(e) => setFields({ birthDate: e.target.value, birthDateUnknown: e.target.value ? false : form.birthDateUnknown })}
                        disabled={!!form.birthDateUnknown}
                        className="px-3 py-2"
                    />
                    <div className="mt-2">
                        <Checkbox
                            checked={form.birthDateUnknown}
                            onChange={(checked) => setFields({ birthDateUnknown: checked, birthDate: checked ? '' : form.birthDate })}
                            label="Born, birth date unknown"
                        />
                    </div>
                </FieldRow>

                <FieldRow
                    label="Weaning date"
                    hint={autoCalcAvailable && autoCalcWeaningDate ? 'Filled in automatically from the birth date if left blank.' : undefined}
                >
                    <DatePicker value={form.weaningDate || ''} onChange={(e) => setField('weaningDate', e.target.value)} className="px-3 py-2" />
                    <div className="mt-2">
                        <Checkbox
                            checked={form.weaningConfirmed}
                            onChange={(checked) => setField('weaningConfirmed', checked)}
                            label="Confirm weaning"
                            hint="Ends the dam’s nursing status."
                        />
                    </div>
                </FieldRow>
            </div>
        </div>
    );
}
