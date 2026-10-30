import React, { useState } from 'react';
import { X, Target, Star, ClipboardList, Dna, House } from 'lucide-react';
import { FieldRow, SectionTitle, cardClass, inputClass, secondaryBtn } from '../fields';

const MAX_OBJECTIVES = 12;
const GOALS = [
  'Colour / Pattern',
  'Coat Type / Length',
  'Morph / Gene',
  'Improve Type',
  'Outcross / New Line',
  'Maintain Line',
  'Temperament',
  'Pet Quality',
  'Future Breeder(s)',
  'Other',
];

const KEEPER_OPTIONS = [
  'Undecided',
  'Yes, planning to keep grow-outs',
  'Maybe, depending on results',
  'No grow-outs planned',
];
const PLACEMENT_OPTIONS = [
  'Undecided',
  'Keeping entire litter',
  'Some available for placement',
  'Entire litter available',
  'Already reserved / allocated',
];

export default function ObjectivesSection({ form, setField }) {
    const [draft, setDraft] = useState('');
    const objectives = Array.isArray(form.breedingObjectives) ? form.breedingObjectives : [];

    const toggleGoal = (goal) => {
        if (objectives.includes(goal)) {
            setField('breedingObjectives', objectives.filter(g => g !== goal));
        } else {
            setField('breedingObjectives', [...objectives, goal]);
        }
    };

    const add = () => {
        const label = draft.trim();
        if (!label || objectives.length >= MAX_OBJECTIVES) return;
        if (objectives.some(o => o.toLowerCase() === label.toLowerCase())) { setDraft(''); return; }
        setField('breedingObjectives', [...objectives, label]);
        setDraft('');
    };

    return (
        <>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                    <Target size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Breeding objectives</h1>
                    <p className="text-sm text-gray-500 dark:text-dark-text-muted">Define your goals, expected outcomes, and plans for this litter.</p>
                </div>
            </div>

            <div className={cardClass}>
                <SectionTitle title="Main goals" description="Select the breeding goals you hope to achieve with this pairing." icon={Star} iconBg="bg-cyan-100" iconColor="text-cyan-600" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {GOALS.map(g => (
                        <label key={g} className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-text cursor-pointer">
                            <input type="checkbox" checked={objectives.includes(g)} onChange={() => toggleGoal(g)} />
                            <span>{g}</span>
                        </label>
                    ))}
                </div>
                <FieldRow label="Custom goals" hint={`Short labels, up to ${MAX_OBJECTIVES}.`}>
                    <div className="flex gap-2">
                        <input type="text" className={inputClass} value={draft} maxLength={40} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder="Add an objective..." />
                        <button type="button" onClick={add} disabled={!draft.trim() || objectives.length >= MAX_OBJECTIVES} className={`${secondaryBtn} disabled:opacity-40`}>Add</button>
                    </div>
                    {objectives.filter(o => !GOALS.includes(o)).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {objectives.filter(o => !GOALS.includes(o)).map(o => (
                                <span key={o} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                    {o}
                                    <button type="button" aria-label={`Remove ${o}`} onClick={() => setField('breedingObjectives', objectives.filter(x => x !== o))}><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                    )}
                </FieldRow>
            </div>

            <div className={cardClass}>
                <SectionTitle title="Expected outcomes" description="Describe the traits or results you expect from this pairing." icon={ClipboardList} iconBg="bg-purple-100" iconColor="text-purple-600" />
                <FieldRow label="Expected outcomes">
                    <textarea rows={5} className={inputClass} style={{ minHeight: '110px' }} value={form.expectedOutcomes || ''} onChange={(e) => setField('expectedOutcomes', e.target.value)} placeholder="Expected colours, patterns, coat types, traits, or other breeding results..." />
                </FieldRow>
            </div>

            <div className={cardClass}>
                <SectionTitle title="Genetic notes" description="Record relevant genetic considerations for this pairing." icon={Dna} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
                <FieldRow label="Genetic notes">
                    <textarea rows={5} className={inputClass} style={{ minHeight: '110px' }} value={form.geneticNotes || ''} onChange={(e) => setField('geneticNotes', e.target.value)} placeholder="Possible carriers, inheritance considerations, genetic uncertainties, or genes being evaluated..." />
                </FieldRow>
            </div>

            <div className={cardClass}>
                <SectionTitle title="Keepers & placement plans" description="Plan which offspring you may retain and how the others will be placed." icon={House} iconBg="bg-pink-100" iconColor="text-pink-600" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow label="Keeping grow-outs">
                        <select className={inputClass} value={form.keepersGrowouts || 'Undecided'} onChange={(e) => setField('keepersGrowouts', e.target.value)}>
                            {KEEPER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </FieldRow>
                    <FieldRow label="Placement plans">
                        <select className={inputClass} value={form.placementPlans || 'Undecided'} onChange={(e) => setField('placementPlans', e.target.value)}>
                            {PLACEMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </FieldRow>
                </div>
            </div>
        </>
    );
}
