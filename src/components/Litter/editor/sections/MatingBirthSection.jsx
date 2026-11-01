import React from 'react';
import { Heart, Link, Baby, Milk } from 'lucide-react';
import { Checkbox, FieldRow, Select, inputClass } from '../fields';
import { getLitterFieldLabel, isEggLayingSpecies } from '../../../../utils/litterSpeciesPresentation';

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

export default function MatingBirthSection({ form, setField, setFields, species = '', speciesOptions = [] }) {
    const eggLaying = isEggLayingSpecies(species, speciesOptions);
    const lossReasons = LOSS_REASONS.map(reason => {
        const option = typeof reason === 'string' ? { value: reason, label: reason } : reason;
        if (!eggLaying) return option;
        const label = {
            Cannibalized: 'Eggs / clutch consumed',
            'All Stillborn': 'No viable eggs / hatchlings',
            Reabsorbed: 'Eggs reabsorbed',
        }[option.value] || option.label;
        return { ...option, label };
    });
    const birthMethods = eggLaying
        ? BIRTH_METHODS.map(method => ({ value: method, label: method === 'C-Section' ? 'Surgical assistance' : method }))
        : BIRTH_METHODS;
    const birthOutcomes = eggLaying
        ? BIRTH_OUTCOMES.map(outcome => ({ value: outcome, label: ({
            'Healthy litter': 'Healthy clutch / brood',
            'Dam complications': 'Parent complications',
            'All lost': 'All eggs / clutch lost',
        })[outcome] || outcome }))
        : BIRTH_OUTCOMES;
    const weaningOutcomes = eggLaying
        ? WEANING_OUTCOMES.map(outcome => ({ value: outcome, label: ({
            'All weaned': 'All fledged / independent',
            'Some losses': 'Some failed to fledge / become independent',
            'Early weaning': 'Early independence',
            'Late weaning': 'Late independence',
        })[outcome] || outcome }))
        : WEANING_OUTCOMES;

    return (
        <>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
                    <Heart size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text">{eggLaying ? 'Pairing, clutch & hatch' : 'Mating & birth'}</h1>
                    <p className="text-sm text-gray-500 dark:text-dark-text-muted">{eggLaying ? 'Add optional details about pairing, egg laying, and hatching.' : 'Add optional details about how the mating and birth went.'}</p>
                </div>
            </div>

            <div className={cardClass}>
                <SectionHeader icon={Link} title={eggLaying ? 'Pairing information' : 'Mating information'} subtitle={eggLaying ? 'Details about the pairing and its outcome.' : 'Details about the mating and its outcome.'} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FieldRow label={eggLaying ? 'Pairing method' : 'Mating method'}>
                        <Select value={form.breedingMethod || 'Unknown'} onChange={(v) => setField('breedingMethod', v)} options={METHODS} />
                    </FieldRow>
                    <FieldRow label={eggLaying ? 'Condition at pairing' : 'Condition at mating'}>
                        <Select value={form.breedingConditionAtTime} onChange={(v) => setField('breedingConditionAtTime', v)} options={CONDITIONS} placeholder="Select condition..." />
                    </FieldRow>
                    <FieldRow label={eggLaying ? 'Pairing outcome' : 'Outcome'}>
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
                    label={getLitterFieldLabel('pregnancyLost', species, 'Pregnancy lost', speciesOptions)}
                    hint={eggLaying ? 'Mark if the eggs or clutch failed or were lost.' : 'Mark if the dam did not become pregnant or lost the pregnancy.'}
                />
                {form.pregnancyLost && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldRow label={eggLaying ? 'Clutch / egg loss reason' : 'Reason'}>
                            <Select value={form.pregnancyLostReason || 'Unknown'} onChange={(v) => setField('pregnancyLostReason', v)} options={lossReasons} />
                        </FieldRow>
                        <FieldRow label="Notes">
                            <input type="text" className={inputClass} value={form.pregnancyLostNotes || ''} onChange={(e) => setField('pregnancyLostNotes', e.target.value)} />
                        </FieldRow>
                    </div>
                )}
            </div>

            <div className={cardClass}>
                <SectionHeader icon={Baby} title={eggLaying ? 'Laying & hatch information' : 'Birth information'} subtitle={eggLaying ? 'Details about laying, hatching, and any assistance or complications.' : 'Details about the birth and any assistance or complications.'} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FieldRow label={eggLaying ? 'Laying / hatch method' : 'Birth method'}>
                        <Select value={form.birthMethod} onChange={(v) => setField('birthMethod', v)} options={birthMethods} placeholder="Select method..." />
                    </FieldRow>
                    <FieldRow label={eggLaying ? 'Clutch / hatch outcome' : 'Birth outcome'} hint={form.birthOutcome === 'All lost' ? (eggLaying ? 'Saving records that the clutch was lost.' : 'Saving will clear the dam’s pregnant / nursing status.') : undefined}>
                        <Select value={form.birthOutcome} onChange={(v) => setField('birthOutcome', v)} options={birthOutcomes} placeholder="Select outcome..." />
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
                    <FieldRow label={eggLaying ? 'Laying / hatch complications' : 'Complications'}>
                        <textarea rows={3} className={inputClass} style={{ minHeight: '80px' }} value={form.birthComplications || ''} onChange={(e) => setField('birthComplications', e.target.value)} />
                    </FieldRow>
                    <FieldRow label={eggLaying ? 'Clutch / hatch notes' : 'Birth notes'}>
                        <textarea rows={3} className={inputClass} style={{ minHeight: '80px' }} value={form.birthNotes || ''} onChange={(e) => setField('birthNotes', e.target.value)} />
                    </FieldRow>
                </div>
            </div>

            <div className={cardClass}>
                <SectionHeader icon={Milk} title={eggLaying ? 'Fledging / independence information' : 'Weaning information'} subtitle={eggLaying ? 'Record when offspring become independent and any related observations.' : 'Record how weaning went and any observations about the litter.'} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow label={getLitterFieldLabel('weaningOutcome', species, 'Weaning outcome', speciesOptions)}>
                        <Select value={form.weaningOutcome} onChange={(v) => setField('weaningOutcome', v)} options={weaningOutcomes} placeholder="Select outcome..." />
                    </FieldRow>
                    <FieldRow label={getLitterFieldLabel('weaningNotes', species, 'Weaning notes', speciesOptions)}>
                        <textarea rows={3} className={inputClass} style={{ minHeight: '80px' }} value={form.weaningNotes || ''} onChange={(e) => setField('weaningNotes', e.target.value)} />
                    </FieldRow>
                </div>
            </div>
        </>
    );
}
