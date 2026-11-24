import React from 'react';

/** Parse a stored date to a YYYY-MM-DD input value, or '' when blank/invalid. */
export const toDateInput = (d) => {
    if (!d) return '';
    const s = String(d).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
};

const n = (v) => (v === null || v === undefined || v === '' ? 0 : Number(v) || 0);
const orNull = (v) => (v === 0 && !Number.isFinite(v) ? null : v);

/** Default empty litter form state. */
export const EMPTY_LITTER_FORM = {
    sireId_public: '', damId_public: '', species: '', notes: '',
    matingDate: '', pregnancyDate: '', expectedDueDate: '', birthDate: '',
    birthDateUnknown: false, isPlanned: false, breedingConditionAtTime: null,
    breedingMethod: 'Unknown', birthMethod: null, outcome: 'Unknown',
    litterSizeBorn: null, numberBorn: null, maleCount: null, femaleCount: null, unknownCount: null,
    stillbornCount: null, maleStillborn: null, femaleStillborn: null, unknownStillborn: null,
    lossesCount: null, maleLosses: null, femaleLosses: null, unknownLosses: null,
    hasCulls: false, cullsCount: null,
    litterSizeWeaned: null, maleWeaned: null, femaleWeaned: null, unknownWeaned: null,
    weaningDate: '', weaningConfirmed: false,
    extractStillbornFromTotal: false, extractLossesFromTotal: false,
    offspringIds_public: [], linkedOffspringIds: [],
    pregnancyLost: false, pregnancyLostReason: null, pregnancyLostNotes: null,
    expectedOutcomes: null, geneticNotes: null,
    keepersGrowouts: 'Undecided', placementPlans: 'Undecided',
    objectivesNotes: null, objectivesEvaluation: null,
};

export const formFromLitter = (litter) => ({
    sireId_public: litter.sireId_public || '', damId_public: litter.damId_public || '',
    species: litter.species || '', notes: litter.notes || '',
    matingDate: toDateInput(litter.matingDate || litter.pairingDate || ''),
    pregnancyDate: toDateInput(litter.pregnancyDate),
    expectedDueDate: toDateInput(litter.expectedDueDate),
    birthDate: toDateInput(litter.birthDate), birthDateUnknown: !!litter.birthDateUnknown,
    isPlanned: !!litter.isPlanned, breedingConditionAtTime: litter.breedingConditionAtTime || null,
    breedingMethod: litter.breedingMethod || 'Unknown', birthMethod: litter.birthMethod || null,
    outcome: litter.outcome || 'Unknown',
    litterSizeBorn: litter.litterSizeBorn ?? litter.numberBorn ?? null,
    numberBorn: litter.numberBorn ?? null,
    maleCount: litter.maleCount ?? null, femaleCount: litter.femaleCount ?? null,
    unknownCount: litter.unknownCount ?? null,
    stillbornCount: litter.stillbornCount ?? litter.stillborn ?? null,
    maleStillborn: litter.maleStillbornCount ?? null,
    femaleStillborn: litter.femaleStillbornCount ?? null,
    unknownStillborn: litter.unknownStillbornCount ?? null,
    lossesCount: litter.lossesCount ?? litter.losses ?? null,
    maleLosses: litter.maleLossesCount ?? null,
    femaleLosses: litter.femaleLossesCount ?? null,
    unknownLosses: litter.unknownLossesCount ?? null,
    hasCulls: !!litter.hasCulls,
    cullsCount: litter.hasCulls ? (litter.cullsCount ?? null) : null,
    litterSizeWeaned: litter.litterSizeWeaned ?? litter.numberWeaned ?? null,
    maleWeaned: litter.maleWeaned ?? null, femaleWeaned: litter.femaleWeaned ?? null,
    unknownWeaned: litter.unknownWeaned ?? null,
    weaningDate: toDateInput(litter.weaningDate), weaningConfirmed: !!litter.weaningConfirmed,
    extractStillbornFromTotal: !!litter.extractStillbornFromTotal,
    extractLossesFromTotal: !!litter.extractLossesFromTotal,
    offspringIds_public: litter.offspringIds_public || [],
    linkedOffspringIds: litter.linkedOffspringIds || [],
    pregnancyLost: !!litter.pregnancyLost,
    pregnancyLostReason: litter.pregnancyLostReason || null,
    pregnancyLostNotes: litter.pregnancyLostNotes || null,
    expectedOutcomes: litter.expectedOutcomes ?? null,
    geneticNotes: litter.geneticNotes ?? null,
    keepersGrowouts: litter.keepersGrowouts ?? 'Undecided',
    placementPlans: litter.placementPlans ?? 'Undecided',
    objectivesNotes: litter.objectivesNotes ?? null,
    objectivesEvaluation: litter.objectivesEvaluation ?? null,
});

export const initialExtras = (litter) => ({
    matingExtra: !!(litter.breedingMethod && litter.breedingMethod !== 'Unknown'),
    birthExtra: !!(litter.birthMethod || litter.assistanceRequired),
    weaningExtra: !!(litter.weaningOutcome || litter.weaningConfirmed),
});

/** Save-time reconciliation: correct totals, enforce minimums from linked animals, collect warnings. */
export const reconcileLitterFormCounts = (form, linkedAnimals = []) => {
    const fd = { ...form }; const warnings = [];
    const male = n(fd.maleCount), female = n(fd.femaleCount), unknown = n(fd.unknownCount);
    const genderSum = male + female + unknown;
    const manualTotal = n(fd.litterSizeBorn);
    const linkedBySex = countLinkedBySex(linkedAnimals, fd.linkedOffspringIds);
    const linkedTotal = linkedBySex.Male + linkedBySex.Female + linkedBySex.Unknown;
    fd.litterSizeBorn = orNull(Math.max(manualTotal, genderSum, linkedTotal) || null);
    fd.numberBorn = fd.litterSizeBorn;
    const stillborn = n(fd.stillbornCount), losses = n(fd.lossesCount);
    const weaned = n(fd.litterSizeWeaned), culls = n(fd.cullsCount);
    if (fd.litterSizeBorn && stillborn > fd.litterSizeBorn) {
        warnings.push(`Stillborn (${stillborn}) exceeds Total Born (${fd.litterSizeBorn}).`);
    }
    if (fd.litterSizeBorn && fd.maleCount != null && n(fd.maleStillborn) > male) {
        warnings.push(`Male stillborn (${n(fd.maleStillborn)}) exceeds Born males (${male}).`);
    }
    if (fd.litterSizeBorn && fd.femaleCount != null && n(fd.femaleStillborn) > female) {
        warnings.push(`Female stillborn (${n(fd.femaleStillborn)}) exceeds Born females (${female}).`);
    }
    if (fd.litterSizeBorn && fd.unknownCount != null && n(fd.unknownStillborn) > unknown) {
        warnings.push(`Unknown stillborn (${n(fd.unknownStillborn)}) exceeds Born unknown (${unknown}).`);
    }
    const liveBorn = Math.max(0, fd.litterSizeBorn - stillborn);
    if (fd.litterSizeBorn && losses > liveBorn) {
        warnings.push(`Postnatal losses (${losses}) exceed live-born animals (${liveBorn}).`);
    }
    const surviving = Math.max(0, liveBorn - losses);
    if (fd.litterSizeBorn && surviving < 0) {
        warnings.push('Surviving count would be negative.');
    }
    if (fd.litterSizeBorn && weaned > surviving) {
        warnings.push(`Weaned (${weaned}) exceeds Surviving (${surviving}).`);
    }
    if (fd.hasCulls && culls > losses) {
        warnings.push(`Culls (${culls}) exceeds Total Losses (${losses}).`);
    }
    if (fd.litterSizeBorn && (stillborn + losses + weaned) > fd.litterSizeBorn) {
        warnings.push(`Stillborn + Losses + Weaned (${stillborn + losses + weaned}) exceeds Total Born (${fd.litterSizeBorn}).`);
    }
    return { correctedCounts: fd, warnings };
};
/** Field-level validation. */
export const validateLitterForm = (form, { sire, dam } = {}) => {
    const errors = {};
    if (!form.sireId_public) errors.sireId_public = 'Select a sire.';
    if (!form.damId_public) errors.damId_public = 'Select a dam.';
    if (form.sireId_public && form.damId_public && form.sireId_public === form.damId_public) {
        errors.damId_public = 'Sire and dam must be different animals.';
    }
    if (sire && dam && sire.species !== dam.species) {
        errors.damId_public = 'Sire and dam must be the same species.';
    }
    if (dam && dam.deceasedDate && form.birthDate && form.birthDate > dam.deceasedDate.slice(0, 10)) {
        errors.birthDate = 'Birth date is after the dam\u2019s deceased date.';
    }
    if (form.matingDate && form.birthDate && form.birthDate < form.matingDate.slice(0, 10)) {
        errors.birthDate = 'Birth date is before the mating date.';
    }
    return errors;
};
