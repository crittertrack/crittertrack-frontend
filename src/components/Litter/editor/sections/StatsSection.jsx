
import React from 'react';
import {
    ChartNoAxesColumnIncreasing,
    Baby,
    Frown,
    HeartCrack,
    Milk
} from 'lucide-react';

import {
    setSexCount,
    setStillbornSex,
    setLossSex,
    setCullSex,
    setWeanedSex,
    toggleExtractStillborn,
    toggleExtractLosses
} from '../litterFormModel';

import { FieldRow, NumberInput } from '../fields';

import {
    getLitterFieldLabel,
    isEggLayingSpecies
} from '../../../../utils/litterSpeciesPresentation';

const ReadOnlyTotal = ({ label, value, hint }) => (
    <FieldRow label={label} hint={hint}>
        <input
            type="number"
            readOnly
            value={value ?? 0}
            className="w-full h-[40px] px-3 py-2 text-sm rounded-lg border border-[#D0D9E6] bg-white dark:bg-dark-surface text-gray-800 dark:text-dark-text cursor-not-allowed font-semibold focus:outline-none"
        />
    </FieldRow>
);

const CardHeader = ({ icon: Icon, iconBg, title, subtitle }) => (
    <div className="flex items-start gap-3">
        <div className={`shrink-0 w-10 h-10 rounded-full ${iconBg} flex items-center justify-center text-[#111B35]`}>
            <Icon size={20} />
        </div>

        <div>
            <h3 className="text-[16px] font-bold text-[#111B35] dark:text-dark-text">
                {title}
            </h3>
            <p className="text-[13px] text-[#7284A3] dark:text-dark-text-muted">
                {subtitle}
            </p>
        </div>
    </div>
);

const cardClass =
    'bg-white dark:bg-dark-card-bg rounded-[13px] border border-gray-100 dark:border-dark-border shadow-sm p-5 space-y-4';

const inputClass =
    'w-full h-[40px] px-3 py-2 text-sm rounded-lg border border-[#D0D9E6] bg-white dark:bg-dark-surface text-gray-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#9CE4EC]';

export default function StatsSection({
    form,
    setForm,
    setField,
    linkedCounts,
    warnings,
    species = '',
    speciesOptions = []
}) {
    const minFor = (gender) => linkedCounts[gender] || 0;

    const belowLinked = (gender, value) =>
        minFor(gender) > 0 && (value || 0) < minFor(gender);

    const eggLaying = isEggLayingSpecies(species, speciesOptions);

    const bornTitle = eggLaying
        ? 'Clutch / hatchling counts'
        : 'Born';

    const bornSubtitle = eggLaying
        ? 'Record the clutch or brood size and any hatchlings recorded.'
        : 'Record the number of live born animals.';

    const nonViableTitle = eggLaying
        ? 'Unhatched / non-viable eggs'
        : 'Stillborn';

    const nonViableSubtitle = eggLaying
        ? 'Record eggs that did not hatch or were not viable.'
        : 'Record stillborn animals.';

    const lossesTitle = 'Losses & Culls';

    const lossDescription = eggLaying
        ? 'Record losses after hatching (not unhatched eggs).'
        : 'Record any losses after birth (not stillborn).';

    const independentTitle = eggLaying
        ? 'Fledged / independent'
        : 'Weaned';

    const independentDescription = eggLaying
        ? 'Record how many young fledged or became independent.'
        : 'Record how many animals were weaned from this litter.';

    return (
        <div className="space-y-3">

            {/* BORN */}
            <div className="flex items-center gap-4 mb-[18px]">
                <div className="w-[46px] h-[46px] rounded-full bg-[#F8D4FA] flex items-center justify-center text-[#111B35] shrink-0">
                    <ChartNoAxesColumnIncreasing size={22} />
                </div>

                <div>
                    <h1 className="text-[22px] font-bold text-[#111B35] dark:text-dark-text">
                        Litter Counts
                    </h1>
                    <p className="text-[14px] text-[#7284A3] dark:text-dark-text-muted">
                        {eggLaying
                            ? 'Enter clutch, hatchling, and offspring counts using the existing litter count fields.'
                            : 'Enter the counts for this litter. Total born is the sum of males, females and unknown.'}
                    </p>
                </div>
            </div>

            <div className={cardClass}>
                <CardHeader
                    icon={Baby}
                    iconBg="bg-[#DFE5FF]"
                    title={bornTitle}
                    subtitle={bornSubtitle}
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ReadOnlyTotal
                        label={getLitterFieldLabel(
                            'litterSizeBorn',
                            species,
                            'Total born',
                            speciesOptions
                        )}
                        value={form.litterSizeBorn}
                        hint="Auto-calculated from M + F + U"
                    />

                    {[
                        ['maleCount', eggLaying ? 'Male hatchlings' : 'Males', 'Male'],
                        ['femaleCount', eggLaying ? 'Female hatchlings' : 'Females', 'Female'],
                        ['unknownCount', eggLaying ? 'Unknown hatchlings' : 'Unknown', 'Unknown']
                    ].map(([key, label, gender]) => (
                        <FieldRow
                            key={key}
                            label={label}
                            error={
                                belowLinked(gender, form[key])
                                    ? `At least ${minFor(gender)} (linked animals).`
                                    : undefined
                            }
                        >
                            <NumberInput
                                value={form[key]}
                                min={minFor(gender)}
                                onChange={(v) =>
                                    setForm(fd => setSexCount(fd, key, v))
                                }
                                placeholder="0"
                                className={inputClass}
                            />
                        </FieldRow>
                    ))}
                </div>
            </div>

            {/* STILLBORN */}
            <div className={cardClass}>
                <CardHeader
                    icon={Frown}
                    iconBg="bg-[#B9F6E3]"
                    title={nonViableTitle}
                    subtitle={nonViableSubtitle}
                />

                <label className="flex items-start gap-2 text-sm text-[#111B35] dark:text-dark-text cursor-pointer">
                    <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={!!form.extractStillbornFromTotal}
                        onChange={(e) =>
                            setForm(fd =>
                                toggleExtractStillborn(fd, e.target.checked)
                            )
                        }
                    />

                    <span>
                        <span className="font-medium">
                            {eggLaying
                                ? 'Extract non-viable eggs from total offspring on overview'
                                : 'Extract stillborn from total offspring on overview'}
                        </span>
                    </span>
                </label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ReadOnlyTotal
                        label={getLitterFieldLabel(
                            'stillbornCount',
                            species,
                            'Total stillborn',
                            speciesOptions
                        )}
                        value={form.stillbornCount}
                        hint="Auto-calculated"
                    />

                    {[
                        ['maleStillborn', 'Male'],
                        ['femaleStillborn', 'Female'],
                        ['unknownStillborn', 'Unknown']
                    ].map(([key, label]) => (
                        <FieldRow
                            key={key}
                            label={
                                eggLaying
                                    ? `${label} non-viable eggs`
                                    : `${label} stillborn`
                            }
                        >
                            <NumberInput
                                value={form[key]}
                                onChange={(v) =>
                                    setForm(fd => setStillbornSex(fd, key, v))
                                }
                                placeholder="0"
                                className={inputClass}
                            />
                        </FieldRow>
                    ))}
                </div>
            </div>

            {/* LOSSES & CULLS */}
            <div className={cardClass}>
                <CardHeader
                    icon={HeartCrack}
                    iconBg="bg-[#FFDDE2]"
                    title={lossesTitle}
                    subtitle={lossDescription}
                />

                <label className="flex items-start gap-2 text-sm text-[#111B35] dark:text-dark-text cursor-pointer">
                    <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={!!form.extractLossesFromTotal}
                        onChange={(e) =>
                            setForm(fd =>
                                toggleExtractLosses(fd, e.target.checked)
                            )
                        }
                    />

                    <span>
                        <span className="font-medium">
                            Extract losses & culls from total offspring on overview
                        </span>
                    </span>
                </label>

                {/* LOSSES */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ReadOnlyTotal
                        label="Total losses"
                        value={form.lossesCount}
                        hint="Auto-calculated"
                    />

                    {[
                        ['maleLosses', 'Male'],
                        ['femaleLosses', 'Female'],
                        ['unknownLosses', 'Unknown']
                    ].map(([key, label]) => (
                        <FieldRow
                            key={key}
                            label={`${label} losses`}
                        >
                            <NumberInput
                                value={form[key]}
                                onChange={(v) =>
                                    setForm(fd => setLossSex(fd, key, v))
                                }
                                placeholder="0"
                                className={inputClass}
                            />
                        </FieldRow>
                    ))}
                </div>

                {/* CULLS - always visible */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ReadOnlyTotal
                        label="Total culls"
                        value={form.cullsCount}
                        hint="Auto-calculated"
                    />

                    {['maleCulls', 'femaleCulls', 'unknownCulls'].map((key) => {
                        const labelMap = { maleCulls: 'Male', femaleCulls: 'Female', unknownCulls: 'Unknown' };
                        return (
                            <FieldRow
                                key={key}
                                label={`${labelMap[key]} culls`}
                            >
                                <NumberInput
                                    value={form[key]}
                                    min={0}
                                   onChange={(v) => setForm(fd => setCullSex(fd, key, v))}
                                    placeholder="0"
                                    className={inputClass}
                                />
                            </FieldRow>
                        );
                    })}
                </div>
            </div>

            {/* WEANED / INDEPENDENT */}
            <div className={cardClass}>
                <CardHeader
                    icon={Milk}
                    iconBg="bg-[#C9F7FA]"
                    title={independentTitle}
                    subtitle={independentDescription}
                />

                {/* Fill from surviving button */}
                {form.birthDate && !form.weaningConfirmed && (form.maleCount != null || form.femaleCount != null || form.unknownCount != null) && (
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setForm(fd => ({
                                    ...fd,
                                    maleWeaned: fd.maleCount != null ? Number(fd.maleCount) : 0,
                                    femaleWeaned: fd.femaleCount != null ? Number(fd.femaleCount) : 0,
                                    unknownWeaned: fd.unknownCount != null ? Number(fd.unknownCount) : 0,
                                    litterSizeWeaned: (fd.maleWeaned != null ? Number(fd.maleWeaned) : 0) + (fd.femaleWeaned != null ? Number(fd.femaleWeaned) : 0) + (fd.unknownWeaned != null ? Number(fd.unknownWeaned) : 0),
                                }));
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-green-400"
                            title="Fill weaned counts from surviving animals (M/F/U)"
                        >
                            <span className="align-middle">Fill from surviving</span>
                        </button>
                    </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ReadOnlyTotal
                        label={getLitterFieldLabel(
                            'litterSizeWeaned',
                            species,
                            'Total weaned',
                            speciesOptions
                        )}
                        value={form.litterSizeWeaned}
                        hint="Auto-calculated"
                    />

                    {[
                        ['maleWeaned', 'Males'],
                        ['femaleWeaned', 'Females'],
                        ['unknownWeaned', 'Unknown']
                    ].map(([key, label]) => (
                        <FieldRow
                            key={key}
                            label={
                                eggLaying
                                    ? `${label} fledged / independent`
                                    : `${label} weaned`
                            }
                        >
                            <NumberInput
                                value={form[key]}
                                onChange={(v) => setForm(fd => setWeanedSex(fd, key, v))}
                                placeholder="0"
                                className={inputClass}
                            />
                        </FieldRow>
                    ))}
                </div>
            </div>

            {/* VALIDATION WARNINGS */}
            {warnings.length > 0 && (
                <div
                    role="status"
                    className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-800 dark:text-amber-200"
                >
                    <p className="font-semibold">
                        Check these numbers (you can still save):
                    </p>

                    <ul className="list-disc ml-5">
                        {warnings.map((w, index) => (
                            <li key={index}>{w}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
