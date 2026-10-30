import React from 'react';
import { CheckCircle } from 'lucide-react';
import { remainingToCreate } from '../litterFormModel';
import { FieldRow, NumberInput, SectionTitle, cardClass, secondaryBtn } from '../fields';

const asCount = (v) => parseInt(v, 10) || 0;

/** "Create placeholder animals" (M1.., F1.., U1..) - only offered once the litter has a birth date. */
export default function CreatePlaceholdersCard({ form, linkedCounts, createCounts, setCreateCounts }) {
    const remaining = remainingToCreate(form, linkedCounts);
    const hasCountInfo = asCount(form.maleCount) > 0 || asCount(form.femaleCount) > 0 || asCount(form.unknownCount) > 0;
    const toCreate = asCount(createCounts.males) + asCount(createCounts.females) + asCount(createCounts.unknown);
    const rows = [
        ['Males', form.maleCount, linkedCounts.Male, remaining.males],
        ['Females', form.femaleCount, linkedCounts.Female, remaining.females],
        ['Unknown', form.unknownCount, linkedCounts.Unknown, remaining.unknown],
    ];

    return (
        <div className={cardClass}>
            <SectionTitle
                title="Create placeholder animals"
                description="Created with names M1, M2… / F1, F2… You can edit names and details after saving."
            />
            {!hasCountInfo ? (
                <p className="text-xs italic text-gray-500 dark:text-dark-text-muted">Set the male, female and unknown counts (Statistics) to see smart creation options.</p>
            ) : (
                <div className="text-xs text-gray-600 dark:text-dark-text-secondary grid grid-cols-3 gap-3">
                    {rows.map(([label, total, linked, left]) => (
                        <div key={label} className="rounded-lg border border-gray-200 dark:border-dark-border p-2">
                            <div className="font-semibold">{label}</div>
                            <div>Set: {total || 0} · Linked: {linked || 0}</div>
                            <div>Remaining: <span className={left > 0 ? 'font-bold' : 'font-bold text-green-600'}>{left}</span></div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-3 gap-3">
                {[['males', 'New males'], ['females', 'New females'], ['unknown', 'New unknown']].map(([key, label]) => (
                    <FieldRow key={key} label={label}>
                        <NumberInput value={asCount(createCounts[key]) || null} onChange={(v) => setCreateCounts(c => ({ ...c, [key]: v ?? 0 }))} placeholder="0" />
                    </FieldRow>
                ))}
            </div>

            {remaining.total > 0 && (
                <button
                    type="button"
                    className={secondaryBtn}
                    onClick={() => setCreateCounts({ males: remaining.males, females: remaining.females, unknown: remaining.unknown })}
                >
                    Fill all remaining ({remaining.males}M + {remaining.females}F + {remaining.unknown}U = {remaining.total})
                </button>
            )}
            {hasCountInfo && remaining.total === 0 && (
                <p className="text-xs font-semibold text-green-600 flex items-center gap-1"><CheckCircle size={13} /> All offspring are accounted for via linked animals.</p>
            )}
            {toCreate > 0 && <p className="text-xs font-semibold text-green-600">Will create {toCreate} new animal(s) when you save.</p>}
        </div>
    );
}
