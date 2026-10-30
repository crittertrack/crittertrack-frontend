import React from 'react';
import { ChartNoAxesColumn } from 'lucide-react';
import {
    setSexCount, setStillbornSex, setLossSex, toggleExtractStillborn, toggleExtractLosses,
} from '../litterFormModel';
import { Checkbox, FieldRow, NumberInput, SectionTitle, cardClass, inputClass } from '../fields';

const ReadOnlyTotal = ({ label, value, hint }) => (
    <FieldRow label={label} hint={hint}>
        <input type="number" readOnly value={value ?? ''} placeholder="0" className={`${inputClass} cursor-not-allowed font-semibold bg-gray-50 dark:bg-dark-surface`} />
    </FieldRow>
);

export default function StatsSection({ form, setForm, setField, linkedCounts, warnings }) {
    const minFor = (gender) => linkedCounts[gender] || 0;
    const belowLinked = (gender, value) => minFor(gender) > 0 && (value || 0) < minFor(gender);

    return (
        <>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                    <ChartNoAxesColumn size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Litter Counts</h1>
                    <p className="text-sm text-gray-500 dark:text-dark-text-muted">Record births, stillbirths, losses, and weaning numbers.</p>
                </div>
            </div>
            <div className={cardClass}>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ReadOnlyTotal label="Total born" value={form.litterSizeBorn} hint="Auto-calculated from M + F + U" />
                {[['maleCount', 'Males', 'Male'], ['femaleCount', 'Females', 'Female'], ['unknownCount', 'Unknown', 'Unknown']].map(([key, label, gender]) => (
                    <FieldRow
                        key={key}
                        label={label}
                        error={belowLinked(gender, form[key]) ? `At least ${minFor(gender)} (linked animals).` : undefined}
                    >
                        <NumberInput value={form[key]} min={minFor(gender)} onChange={(v) => setForm(fd => setSexCount(fd, key, v))} placeholder="0" />
                    </FieldRow>
                ))}
            </div>

            <div className="space-y-3 border-t border-gray-100 dark:border-dark-border pt-4">
                <h3 className="font-semibold text-gray-800 dark:text-dark-text">Stillborn</h3>
                <Checkbox
                    checked={form.extractStillbornFromTotal}
                    onChange={(on) => setForm(fd => toggleExtractStillborn(fd, on))}
                    label="Extract stillborn from total counts"
                    hint="Reduces the M/F/U counts above by the stillborn amounts, leaving only live-born."
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ReadOnlyTotal label="Total stillborn" value={form.stillbornCount} hint="Auto-calculated" />
                    {[['maleStillborn', 'Male'], ['femaleStillborn', 'Female'], ['unknownStillborn', 'Unknown']].map(([key, label]) => (
                        <FieldRow key={key} label={`${label} stillborn`}>
                            <NumberInput value={form[key]} onChange={(v) => setForm(fd => setStillbornSex(fd, key, v))} placeholder="0" />
                        </FieldRow>
                    ))}
                </div>
            </div>

            <div className="space-y-3 border-t border-gray-100 dark:border-dark-border pt-4">
                <h3 className="font-semibold text-gray-800 dark:text-dark-text">Losses</h3>
                <Checkbox
                    checked={form.extractLossesFromTotal}
                    onChange={(on) => setForm(fd => toggleExtractLosses(fd, on))}
                    label="Extract losses from total counts"
                    hint="Reduces the M/F/U counts above by the loss amounts, leaving only survivors."
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ReadOnlyTotal label="Total losses" value={form.lossesCount} hint="Auto-calculated" />
                    {[['maleLosses', 'Male'], ['femaleLosses', 'Female'], ['unknownLosses', 'Unknown']].map(([key, label]) => (
                        <FieldRow key={key} label={`${label} losses`}>
                            <NumberInput value={form[key]} onChange={(v) => setForm(fd => setLossSex(fd, key, v))} placeholder="0" />
                        </FieldRow>
                    ))}
                </div>
                <Checkbox
                    checked={form.hasCulls}
                    onChange={(checked) => setForm(fd => ({ ...fd, hasCulls: checked, cullsCount: checked ? fd.cullsCount : null }))}
                    label="Some losses were culls"
                    hint="Culls are a subset of total losses."
                />
                {form.hasCulls && (
                    <div className="max-w-xs">
                        <FieldRow label="Culls"><NumberInput value={form.cullsCount} onChange={(v) => setField('cullsCount', v)} placeholder="0" /></FieldRow>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-100 dark:border-dark-border pt-4 max-w-xs">
                <FieldRow label="Weaned"><NumberInput value={form.litterSizeWeaned} onChange={(v) => setField('litterSizeWeaned', v)} placeholder="0" /></FieldRow>
            </div>

            {warnings.length > 0 && (
                <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-semibold">Check these numbers (you can still save):</p>
                    <ul className="list-disc ml-5">{warnings.map(w => <li key={w}>{w}</li>)}</ul>
                </div>
            )}
</div>
        </>
    );
}
