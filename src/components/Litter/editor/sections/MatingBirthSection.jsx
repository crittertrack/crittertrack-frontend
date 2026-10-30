import React from 'react';
import { Heart, Link, Baby, Milk } from 'lucide-react';
import { Checkbox, FieldRow, Select, inputClass } from '../fields';

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

const cardClass = 'rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-5 space-y-4 shadow-sm';

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-start gap-3 mb-4">
        <div className="shrink-0 w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Icon size={20} />
        </div>
        <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text">
                {title}{' '}
                <span className="text-sm font-normal text-gray-400 dark:text-dark-text-muted">(optional)</span>
            </h2>
            {subtitle && <p className="text-sm text-gray-500 dark:text-dark-text-muted">{subtitle}</p>}
        </div>
    </div>
);

export default function MatingBirthSection({ form, setField, setFields }) {
    return (
        <>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
                    <Heart size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Mating & birth</h1>
                    <p className="text-sm text-gray-500 dark:text-dark-text-muted">Add optional details about how the mating and birth went.</p>
                </div>
            </div>

            <div className={cardClass}>
                <SectionHeader icon={Link} title="Mating information" subtitle="Details about the mating and its outcome." />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FieldRow label="Mating method">
                        <Select value={form.breedingMethod || 'Unknown'} onChange={(v) => setField('breedingMethod', v)} options={METHODS} />
                    </FieldRow>
                    <FieldRow label="Condition at mating">
                        <Select value={form.breedingConditionAtTime} onChange={(v) => setField('breedingConditionAtTime', v)} options={CONDITIONS} placeholder="Select condition..." />
                    </FieldRow>
                    <FieldRow label="Outcome">
                        <Select value={form.outcome || 'Unknown'} onChange={(v) => setField('outcome', v)} options={MATING_OUTCOMES} />
                    </FieldRow>
                </div>
                <Checkbox
                    checked={form.pregnancyLost}
                    onChange={(checked) => setFields({
                        pregnancyLost: checked,
                        pregnancyLostReason: checked ? (form.pregnancyLostReason || 'Unknown') : null,
                        pregnancyLostNotes: checked ? form.pregnancyLostNotes : null,
                    })}
                    label="Pregnancy lost"
                    hint="Mark if the dam did not become pregnant or lost the pregnancy."
                />
                {form.pregnancyLost && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldRow label="Reason">
                            <Select value={form.pregnancyLostReason || 'Unknown'} onChange={(v) => setField('pregnancyLostReason', v)} options={LOSS_REASONS} />
                        </FieldRow>
                        <FieldRow label="Notes">
                            <input type="text" className={inputClass} value={form.pregnancyLostNotes || ''} onChange={(e) => setField('pregnancyLostNotes', e.target.value)} />
                        </FieldRow>
                    </div>
                )}
            </div>

            <div className={cardClass}>
                <SectionHeader icon={Baby} title="Birth information" subtitle="Details about the birth and any assistance or complications." />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FieldRow label="Birth method">
                        <Select value={form.birthMethod} onChange={(v) => setField('birthMethod', v)} options={BIRTH_METHODS} placeholder="Select method..." />
                    </FieldRow>
                    <FieldRow label="Birth outcome" hint={form.birthOutcome === 'All lost' ? 'Saving will clear the dam’s pregnant / nursing status.' : undefined}>
                        <Select value={form.birthOutcome} onChange={(v) => setField('birthOutcome', v)} options={BIRTH_OUTCOMES} placeholder="Select outcome..." />
                    </FieldRow>
                    <FieldRow label="Assistance required">
                        <Select
                            value={form.assistanceRequired}
                            onChange={(v) => setField('assistanceRequired', v)}
                            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                            placeholder="Not recorded"
                        />
                    </FieldRow>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow label="Complications">
                        <textarea rows={3} className={inputClass} style={{ minHeight: '80px' }} value={form.birthComplications || ''} onChange={(e) => setField('birthComplications', e.target.value)} />
                    </FieldRow>
                    <FieldRow label="Birth notes">
                        <textarea rows={3} className={inputClass} style={{ minHeight: '80px' }} value={form.birthNotes || ''} onChange={(e) => setField('birthNotes', e.target.value)} />
                    </FieldRow>
                </div>
            </div>

            <div className={cardClass}>
                <SectionHeader icon={Milk} title="Weaning information" subtitle="Record how weaning went and any observations about the litter." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow label="Weaning outcome">
                        <Select value={form.weaningOutcome} onChange={(v) => setField('weaningOutcome', v)} options={WEANING_OUTCOMES} placeholder="Select outcome..." />
                    </FieldRow>
                    <FieldRow label="Weaning notes">
                        <textarea rows={3} className={inputClass} style={{ minHeight: '80px' }} value={form.weaningNotes || ''} onChange={(e) => setField('weaningNotes', e.target.value)} />
                    </FieldRow>
                </div>
            </div>
        </>
    );
}
