import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Checkbox, FieldRow, Select, SectionTitle, cardClass, inputClass } from '../fields';

const METHODS = [
    { value: 'Natural', label: 'Natural' },
    { value: 'AI', label: 'Artificial Insemination' },
    { value: 'Assisted', label: 'Assisted' },
    { value: 'Unknown', label: 'Unknown' },
];
const CONDITIONS = ['Good', 'Okay', 'Poor'];
const MATING_OUTCOMES = ['Successful', 'Unsuccessful', 'Unknown'];
const LOSS_REASONS = [
    { value: 'Cannibalized', label: 'Cannibalized (mom ate litter)' },
    'All Stillborn',
    'Reabsorbed',
    'Unknown',
];
const BIRTH_METHODS = ['Natural', 'C-Section', 'Assisted', 'Induced', 'Unknown'];
const BIRTH_OUTCOMES = ['Healthy litter', 'Some losses', 'Dam complications', 'All lost', 'Unknown'];
const WEANING_OUTCOMES = ['All weaned', 'Some losses', 'Early weaning', 'Late weaning', 'Unknown'];

const Collapsible = ({ title, open, onToggle, children }) => (
    <div className="border border-gray-200 dark:border-dark-border rounded-lg">
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
            <span className="font-semibold text-gray-700 dark:text-dark-text-secondary">
                {title} <span className="ml-1 text-xs font-normal text-gray-400 dark:text-dark-text-muted">(optional)</span>
            </span>
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {open && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
);

export default function MatingBirthSection({ form, setField, setFields, extras, setExtras }) {
    return (
        <div className={cardClass}>
            <SectionTitle title="Mating & birth" description="Optional detail about how the mating and birth went." />

            <Collapsible title="Mating information" open={extras.matingExtra} onToggle={() => setExtras(p => ({ ...p, matingExtra: !p.matingExtra }))}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FieldRow label="Method"><Select value={form.breedingMethod || 'Unknown'} onChange={(v) => setField('breedingMethod', v)} options={METHODS} /></FieldRow>
                    <FieldRow label="Condition at mating"><Select value={form.breedingConditionAtTime} onChange={(v) => setField('breedingConditionAtTime', v)} options={CONDITIONS} placeholder="Select condition..." /></FieldRow>
                    <FieldRow label="Outcome"><Select value={form.outcome || 'Unknown'} onChange={(v) => setField('outcome', v)} options={MATING_OUTCOMES} /></FieldRow>
                </div>

                <Checkbox
                    checked={form.pregnancyLost}
                    onChange={(checked) => setFields({
                        pregnancyLost: checked,
                        pregnancyLostReason: checked ? (form.pregnancyLostReason || 'Unknown') : null,
                        pregnancyLostNotes: checked ? form.pregnancyLostNotes : null,
                    })}
                    label="Pregnancy lost"
                />
                {form.pregnancyLost && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldRow label="Reason"><Select value={form.pregnancyLostReason || 'Unknown'} onChange={(v) => setField('pregnancyLostReason', v)} options={LOSS_REASONS} /></FieldRow>
                        <FieldRow label="Notes">
                            <input type="text" className={inputClass} value={form.pregnancyLostNotes || ''} onChange={(e) => setField('pregnancyLostNotes', e.target.value)} />
                        </FieldRow>
                    </div>
                )}
            </Collapsible>

            <Collapsible title="Birth information" open={extras.birthExtra} onToggle={() => setExtras(p => ({ ...p, birthExtra: !p.birthExtra }))}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow label="Birth method"><Select value={form.birthMethod} onChange={(v) => setField('birthMethod', v)} options={BIRTH_METHODS} placeholder="Select method..." /></FieldRow>
                    <FieldRow label="Birth outcome" hint={form.birthOutcome === 'All lost' ? 'Saving will clear the dam’s pregnant / nursing status.' : undefined}>
                        <Select value={form.birthOutcome} onChange={(v) => setField('birthOutcome', v)} options={BIRTH_OUTCOMES} placeholder="Select outcome..." />
                    </FieldRow>
                </div>
                <FieldRow label="Assistance required">
                    <Select
                        value={form.assistanceRequired}
                        onChange={(v) => setField('assistanceRequired', v)}
                        options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                        placeholder="Not recorded"
                    />
                </FieldRow>
                <FieldRow label="Complications">
                    <textarea rows={2} className={inputClass} value={form.birthComplications || ''} onChange={(e) => setField('birthComplications', e.target.value)} />
                </FieldRow>
                <FieldRow label="Birth notes">
                    <textarea rows={2} className={inputClass} value={form.birthNotes || ''} onChange={(e) => setField('birthNotes', e.target.value)} />
                </FieldRow>
            </Collapsible>

            <Collapsible title="Weaning information" open={!!extras.weaningExtra} onToggle={() => setExtras(p => ({ ...p, weaningExtra: !p.weaningExtra }))}>
                <FieldRow label="Weaning outcome">
                    <Select value={form.weaningOutcome} onChange={(v) => setField('weaningOutcome', v)} options={WEANING_OUTCOMES} placeholder="Select outcome..." />
                </FieldRow>
                <FieldRow label="Weaning notes">
                    <textarea rows={2} className={inputClass} value={form.weaningNotes || ''} onChange={(e) => setField('weaningNotes', e.target.value)} />
                </FieldRow>
            </Collapsible>
        </div>
    );
}
