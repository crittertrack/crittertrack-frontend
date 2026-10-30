import React from 'react';
import { ChartNoAxesColumnIncreasing, Baby, Frown, HeartCrack, Milk } from 'lucide-react';
import { setSexCount, setStillbornSex, setLossSex, toggleExtractStillborn, toggleExtractLosses } from '../litterFormModel';
import { Checkbox, FieldRow, NumberInput } from '../fields';

const ReadOnlyTotal = ({ label, value, hint }) => (
    <FieldRow label={label} hint={hint}>
        <input type="number" readOnly value={value ?? 0} className="w-full h-[40px] px-3 py-2 text-sm rounded-lg border border-[#D0D9E6] bg-white dark:bg-dark-surface text-gray-800 dark:text-dark-text cursor-not-allowed font-semibold focus:outline-none" />
    </FieldRow>
);

const CardHeader = ({ icon: Icon, iconBg, title, subtitle }) => (
    <div className="flex items-start gap-3">
        <div className={`shrink-0 w-10 h-10 rounded-full ${iconBg} flex items-center justify-center text-[#111B35]`}>
            <Icon size={20} />
        </div>
        <div>
            <h3 className="text-[16px] font-bold text-[#111B35] dark:text-dark-text">{title}</h3>
            <p className="text-[13px] text-[#7284A3] dark:text-dark-text-muted">{subtitle}</p>
        </div>
    </div>
);

const cardClass = 'bg-white dark:bg-dark-card-bg rounded-[13px] border border-gray-100 dark:border-dark-border shadow-sm p-5 space-y-4';
const inputClass = 'w-full h-[40px] px-3 py-2 text-sm rounded-lg border border-[#D0D9E6] bg-white dark:bg-dark-surface text-gray-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#9CE4EC]';

export default function StatsSection({ form, setForm, setField, linkedCounts, warnings }) {
    const minFor = (gender) => linkedCounts[gender] || 0;
    const belowLinked = (gender, value) => minFor(gender) > 0 && (value || 0) < minFor(gender);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-4 mb-[18px]">
                <div className="w-[46px] h-[46px] rounded-full bg-[#F8D4FA] flex items-center justify-center text-[#111B35] shrink-0">
                    <ChartNoAxesColumnIncreasing size={22} />
                </div>
                <div>
                    <h1 className="text-[22px] font-bold text-[#111B35] dark:text-dark-text">Litter Counts</h1>
                    <p className="text-[14px] text-[#7284A3] dark:text-dark-text-muted">Enter the counts for this litter. Total born is the sum of males, females and unknown.</p>
                </div>
            </div>

            <div className={cardClass}>
                <CardHeader icon={Baby} iconBg="bg-[#DFE5FF]" title="Born" subtitle="Record the number of live born animals." />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ReadOnlyTotal label="Total born" value={form.litterSizeBorn} hint="Auto-calculated from M + F + U" />
                    {[["maleCount","Males","Male"],["femaleCount","Females","Female"],["unknownCount","Unknown","Unknown"]].map(([key,label,gender]) => (
                        <FieldRow key={key} label={label} error={belowLinked(gender, form[key]) ? `At least ${minFor(gender)} (linked animals).` : undefined}>
                            <NumberInput value={form[key]} min={minFor(gender)} onChange={(v)=>setForm(fd=>setSexCount(fd,key,v))} placeholder="0" className={inputClass} />
                        </FieldRow>
                    ))}
                </div>
            </div>

            <div className={cardClass}>
                <CardHeader icon={Frown} iconBg="bg-[#B9F6E3]" title="Stillborn" subtitle="Record stillborn animals (not included in total born)." />
                <label className="flex items-start gap-2 text-sm text-[#111B35] dark:text-dark-text cursor-pointer">
                    <input type="checkbox" className="mt-0.5" checked={!!form.extractStillbornFromTotal} onChange={(e)=>setForm(fd=>toggleExtractStillborn(fd,e.target.checked))} />
                    <span>
                        <span className="font-medium">Extract stillborn from total counts</span>
                        <span className="block text-xs text-[#7284A3] dark:text-dark-text-muted">Reduces the M/F/U counts above by the stillborn amounts, leaving only live-born.</span>
                    </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ReadOnlyTotal label="Total stillborn" value={form.stillbornCount} hint="Auto-calculated" />
                    {[["maleStillborn","Male"],["femaleStillborn","Female"],["unknownStillborn","Unknown"]].map(([key,label]) => (
                        <FieldRow key={key} label={`${label} stillborn`}>
                            <NumberInput value={form[key]} onChange={(v)=>setForm(fd=>setStillbornSex(fd,key,v))} placeholder="0" className={inputClass} />
                        </FieldRow>
                    ))}
                </div>
            </div>

            <div className={cardClass}>
                <CardHeader icon={HeartCrack} iconBg="bg-[#FFDDE2]" title="Losses" subtitle="Record any losses after birth (not stillborn)." />
                <label className="flex items-start gap-2 text-sm text-[#111B35] dark:text-dark-text cursor-pointer">
                    <input type="checkbox" className="mt-0.5" checked={!!form.extractLossesFromTotal} onChange={(e)=>setForm(fd=>toggleExtractLosses(fd,e.target.checked))} />
                    <span>
                        <span className="font-medium">Extract losses from total counts</span>
                        <span className="block text-xs text-[#7284A3] dark:text-dark-text-muted">Reduces the M/F/U counts above by the loss amounts, leaving only survivors.</span>
                    </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ReadOnlyTotal label="Total losses" value={form.lossesCount} hint="Auto-calculated" />
                    {[["maleLosses","Male"],["femaleLosses","Female"],["unknownLosses","Unknown"]].map(([key,label]) => (
                        <FieldRow key={key} label={`${label} losses`}>
                            <NumberInput value={form[key]} onChange={(v)=>setForm(fd=>setLossSex(fd,key,v))} placeholder="0" className={inputClass} />
                        </FieldRow>
                    ))}
                </div>
                <label className="flex items-start gap-2 text-sm text-[#111B35] dark:text-dark-text cursor-pointer">
                    <input type="checkbox" className="mt-0.5" checked={!!form.hasCulls} onChange={(e)=>setForm(fd=>({ ...fd, hasCulls: e.target.checked, cullsCount: e.target.checked ? fd.cullsCount : null }))} />
                    <span>
                        <span className="font-medium">Some losses were culls</span>
                        <span className="block text-xs text-[#7284A3] dark:text-dark-text-muted">Culls are a subset of total losses.</span>
                    </span>
                </label>
                {form.hasCulls && (
                    <div className="max-w-xs">
                        <FieldRow label="Culls"><NumberInput value={form.cullsCount} onChange={(v)=>setField("cullsCount",v)} placeholder="0" className={inputClass} /></FieldRow>
                    </div>
                )}
            </div>

            <div className={cardClass}>
                <CardHeader icon={Milk} iconBg="bg-[#C9F7FA]" title="Weaned" subtitle="Record how many animals were weaned from this litter." />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ReadOnlyTotal label="Total weaned" value={form.litterSizeWeaned} hint="Auto-calculated" />
                    {[["maleWeaned","Males"],["femaleWeaned","Females"],["unknownWeaned","Unknown"]].map(([key,label]) => (
                        <FieldRow key={key} label={`${label} weaned`}>
                            <NumberInput value={form[key]} onChange={(v)=>setField(key,v)} placeholder="0" className={inputClass} />
                        </FieldRow>
                    ))}
                </div>
            </div>

            {warnings.length > 0 && (
                <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-semibold">Check these numbers (you can still save):</p>
                    <ul className="list-disc ml-5">{warnings.map(w => <li key={w}>{w}</li>)}</ul>
                </div>
            )}
        </div>
    );
}
