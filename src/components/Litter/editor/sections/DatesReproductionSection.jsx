import React from 'react';
import DatePicker from '../../../DatePicker';
import { deriveLitterFormStatus, LITTER_STATUS_LABELS } from '../../../../utils/litterStatus';
import { CalendarDays, Heart, Baby, List } from 'lucide-react';
import { Checkbox, FieldRow, SectionTitle, cardClass, inputClass } from '../fields';

const STATUS_HINTS = {
    planned: 'No mating yet, or the mating date is in the future.',
    mated: 'Mating date is today or earlier.',
    pregnant: 'A pregnancy has been confirmed.',
    born: 'A birth date (or "born, date unknown") is recorded.',
};

export default function DatesReproductionSection({ form, setField, setFields, errors, original, autoCalcDueDate, autoCalcWeaningDate, autoCalcAvailable }) {
    const status = deriveLitterFormStatus(form, original);

    return (
        <>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                    <CalendarDays size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Dates & status</h1>
                    <p className="text-sm text-gray-500 dark:text-dark-text-muted">Enter the important dates and choose the current status for this litter.</p>
                </div>
            </div>

            <div className={cardClass}>
                <SectionTitle title="Mating information" description="When was this pairing done, and when is the litter expected?" icon={Heart} iconBg="bg-cyan-100" iconColor="text-cyan-600" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FieldRow label="Mating date" error={errors.matingDate}>
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
                        <FieldRow label="Expected due date" hint={autoCalcAvailable && autoCalcDueDate ? 'Automatically calculated from the mating date if left blank.' : undefined}>
                            <DatePicker value={form.expectedDueDate || ''} onChange={(e) => setField('expectedDueDate', e.target.value)} className="px-3 py-2" />
                        </FieldRow>
                    </div>
                </div>
            </div>

            <div className={cardClass}>
                <SectionTitle title="Birth & weaning dates" description="Enter the birth and weaning dates once the litter is born." icon={Baby} iconBg="bg-cyan-100" iconColor="text-cyan-600" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FieldRow label="Birth date" error={errors.birthDate}>
                            <DatePicker value={form.birthDate || ''} onChange={(e) => setFields({ birthDate: e.target.value, birthDateUnknown: e.target.value ? false : form.birthDateUnknown })} disabled={!!form.birthDateUnknown} className="px-3 py-2" />
                        </FieldRow>
                        <div className="mt-2">
                            <Checkbox checked={form.birthDateUnknown} onChange={(checked) => setFields({ birthDateUnknown: checked, birthDate: checked ? '' : form.birthDate })} label="Born, birth date unknown" />
                        </div>
                    </div>
                    <div>
                        <FieldRow label="Weaning date" hint={autoCalcAvailable && autoCalcWeaningDate ? 'Filled in automatically from the birth date if left blank.' : undefined}>
                            <DatePicker value={form.weaningDate || ''} onChange={(e) => setField('weaningDate', e.target.value)} className="px-3 py-2" />
                        </FieldRow>
                        <div className="mt-2">
                            <Checkbox checked={form.weaningConfirmed} onChange={(checked) => setField('weaningConfirmed', checked)} label="Confirm weaning" hint="Ends the dam's nursing status." />
                        </div>
                    </div>
                </div>
            </div>

            <div className={cardClass}>
                <SectionTitle title="Current status" description="Set the current status for this litter." icon={List} iconBg="bg-cyan-100" iconColor="text-cyan-600" />
                <div className="space-y-3">
                    <select className={inputClass} value={status} onChange={() => {}} disabled>
                        {Object.keys(LITTER_STATUS_LABELS).map(k => <option key={k} value={k}>{LITTER_STATUS_LABELS[k]}</option>)}
                    </select>
                    <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 text-sm">
                        <span className="font-semibold text-indigo-700 dark:text-indigo-300">{LITTER_STATUS_LABELS[status]}</span>
                        <span className="text-gray-600 dark:text-dark-text-secondary"> — {STATUS_HINTS[status]}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
