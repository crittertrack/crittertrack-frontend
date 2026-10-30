import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FieldRow, SectionTitle, cardClass, inputClass, secondaryBtn } from '../fields';

const MAX_OBJECTIVES = 12;

export default function ObjectivesSection({ form, setField }) {
    const [draft, setDraft] = useState('');
    const objectives = Array.isArray(form.breedingObjectives) ? form.breedingObjectives : [];

    const add = () => {
        const label = draft.trim();
        if (!label || objectives.length >= MAX_OBJECTIVES) return;
        if (objectives.some(o => o.toLowerCase() === label.toLowerCase())) { setDraft(''); return; }
        setField('breedingObjectives', [...objectives, label]);
        setDraft('');
    };

    return (
        <div className={cardClass}>
            <SectionTitle title="Breeding objectives" description="What you hoped to achieve with this pairing." />

            <FieldRow label="Objectives" hint={`Short labels, e.g. “Better type” or “Solid colour”. Up to ${MAX_OBJECTIVES}.`}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className={inputClass}
                        value={draft}
                        maxLength={40}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                        placeholder="Add an objective…"
                    />
                    <button type="button" onClick={add} disabled={!draft.trim() || objectives.length >= MAX_OBJECTIVES} className={`${secondaryBtn} disabled:opacity-40`}>Add</button>
                </div>
                {objectives.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {objectives.map(o => (
                            <span key={o} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                {o}
                                <button type="button" aria-label={`Remove ${o}`} onClick={() => setField('breedingObjectives', objectives.filter(x => x !== o))}><X size={12} /></button>
                            </span>
                        ))}
                    </div>
                )}
            </FieldRow>

            <FieldRow label="Notes">
                <textarea rows={3} className={inputClass} value={form.objectivesNotes || ''} onChange={(e) => setField('objectivesNotes', e.target.value)} />
            </FieldRow>

            <FieldRow label="Objective evaluation" hint="How well did the litter meet these objectives?">
                <textarea rows={3} className={inputClass} value={form.objectivesEvaluation || ''} onChange={(e) => setField('objectivesEvaluation', e.target.value)} />
            </FieldRow>
        </div>
    );
}
