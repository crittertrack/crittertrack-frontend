import React from 'react';
import { litterStatusPatch } from '../../../utils/litterStatus';

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
    // Enforce the linked minimums on the per-sex counts as well as the total.
    fd.maleCount = orNull(Math.max(male, linkedBySex.Male)) || null;
    fd.femaleCount = orNull(Math.max(female, linkedBySex.Female)) || null;
    fd.unknownCount = orNull(Math.max(unknown, linkedBySex.Unknown)) || null;
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

/**
 * Helpers removed by the 009706322 refactor, restored here so the editor sections,
 * the save workflow and the unsaved-changes guard keep working. Pure helpers — no React,
 * no network. Field names match the current form shape in this file.
 */

/** Linked animals by sex, in the buckets the count fields use (Male / Female / everything else). */
export const countLinkedBySex = (animals, linkedIds = []) => {
    const linked = animals.filter((a) => linkedIds.includes(a.id_public));
    return {
        Male: linked.filter((a) => a.gender === 'Male').length,
        Female: linked.filter((a) => a.gender === 'Female').length,
        Unknown: linked.filter((a) => a.gender !== 'Male' && a.gender !== 'Female').length,
    };
};

/** How many placeholder animals are still needed per sex to match the M/F/U counts. */
export const remainingToCreate = (fd, linkedCounts) => {
    const males = Math.max(0, n(fd.maleCount) - (linkedCounts.Male || 0));
    const females = Math.max(0, n(fd.femaleCount) - (linkedCounts.Female || 0));
    const unknown = Math.max(0, n(fd.unknownCount) - (linkedCounts.Unknown || 0));
    return { males, females, unknown, total: males + females + unknown };
};

/** Used by the unsaved-changes guard. */
export const isFormDirty = (current, baseline) => JSON.stringify(current) !== JSON.stringify(baseline);

/** Date inputs want YYYY-MM-DD. */
const dayOnly = (d) => (d ? String(d).split('T')[0] : '');

/** Animals the user owns that match this litter's parents (and birth date, when both have one). */
export const linkableOffspring = (animals, fd) =>
    animals.filter((a) => {
        const matchesParents = a.sireId_public === fd.sireId_public && a.damId_public === fd.damId_public;
        if (!matchesParents) return false;
        if (fd.birthDate && a.birthDate) return dayOnly(fd.birthDate) === dayOnly(a.birthDate);
        return true;
    });

/**
 * Link an animal. Returns { form } on success, or { needsConfirm: { animalDate, litterDate } } when
 * the animal's birth date differs from the litter's (caller confirms, then calls again with
 * `acceptDateChange: true`, which moves the litter's birth date to the animal's).
 */
export const linkOffspring = (fd, animal, { acceptDateChange = false } = {}) => {
    const linkedOffspringIds = [...(fd.linkedOffspringIds || []), animal.id_public];
    if (fd.birthDate && animal.birthDate) {
        const litterDate = dayOnly(fd.birthDate);
        const animalDate = dayOnly(animal.birthDate);
        if (litterDate !== animalDate) {
            if (!acceptDateChange) return { needsConfirm: { animalDate, litterDate } };
            return { form: { ...fd, birthDate: animalDate, linkedOffspringIds } };
        }
    }
    const next = { ...fd, linkedOffspringIds };
    if (!fd.birthDate && animal.birthDate) {
        next.birthDate = dayOnly(animal.birthDate);
        next.birthDateUnknown = false;
    }
    return { form: next };
};

/** Remove one linked animal. */
export const unlinkOffspring = (fd, id_public) => ({
    ...fd,
    linkedOffspringIds: (fd.linkedOffspringIds || []).filter((id) => id !== id_public),
});

const LOSS_TO_COUNT = {
    maleLosses: 'maleCount',
    femaleLosses: 'femaleCount',
    unknownLosses: 'unknownCount',
};

/** Edit one of maleCount / femaleCount / unknownCount; Total Born is always their sum. */
export const setSexCount = (fd, key, value) => {
    const next = { ...fd, [key]: value };
    return { ...next, litterSizeBorn: orNull(n(next.maleCount) + n(next.femaleCount) + n(next.unknownCount)) || null };
};

/** Edit one of maleStillborn / femaleStillborn / unknownStillborn; Total Stillborn is their sum. */
export const setStillbornSex = (fd, key, value) => {
    const next = { ...fd, [key]: value };
    return {
        ...next,
        stillbornCount: orNull(n(next.maleStillborn) + n(next.femaleStillborn) + n(next.unknownStillborn)) || null,
    };
};
const toggleExtract = (fd, flag, lossKeys, on) => {
    const sign = on ? -1 : 1;
    const apply = (count, lossKey) => {
        const v = n(fd[count]) + sign * n(fd[lossKey]);
        return on ? Math.max(0, v) : v;
    };
    const maleCount = apply('maleCount', lossKeys.male);
    const femaleCount = apply('femaleCount', lossKeys.female);
    const unknownCount = apply('unknownCount', lossKeys.unknown);
    return {
        ...fd,
        [flag]: on,
        maleCount: orNull(maleCount) || null,
        femaleCount: orNull(femaleCount) || null,
        unknownCount: orNull(unknownCount) || null,
        litterSizeBorn: orNull(maleCount + femaleCount + unknownCount) || null,
    };
};

/** "Extract stillborn from total" checkbox: subtracts stillborn from M/F/U, restores when off. */
export const toggleExtractStillborn = (fd, on) =>
    toggleExtract(fd, 'extractStillbornFromTotal', { male: 'maleStillborn', female: 'femaleStillborn', unknown: 'unknownStillborn' }, on);

/** "Extract losses from total" checkbox: subtracts losses from M/F/U, restores when off. */
export const toggleExtractLosses = (fd, on) =>
    toggleExtract(fd, 'extractLossesFromTotal', { male: 'maleLosses', female: 'femaleLosses', unknown: 'unknownLosses' }, on);

/** Fields shared by the create (POST) and update (PUT) litter payloads. */
const sharedPayload = (fd, counts, offspringIds) => ({
    breedingPairCodeName: fd.breedingPairCodeName || null,
    sireId_public: fd.sireId_public,
    damId_public: fd.damId_public,
    birthDate: fd.birthDate || null,
    birthDateUnknown: !!fd.birthDateUnknown,
    notes: fd.notes || '',
    offspringIds_public: offspringIds,
    ...counts,
    breedingMethod: fd.breedingMethod || 'Unknown',
    breedingConditionAtTime: fd.breedingConditionAtTime || null,
    matingDate: fd.matingDate || null,
    expectedDueDate: fd.expectedDueDate || null,
    outcome: fd.outcome || 'Unknown',
    birthMethod: fd.birthMethod || null,
    litterSizeWeaned: fd.litterSizeWeaned ?? null,
    stillbornCount: fd.stillbornCount ?? null,
    lossesCount: fd.lossesCount ?? null,
    weaningDate: fd.weaningDate || null,
    weaningConfirmed: !!fd.weaningConfirmed,
    extractStillbornFromTotal: !!fd.extractStillbornFromTotal,
    extractLossesFromTotal: !!fd.extractLossesFromTotal,
    maleStillbornCount: fd.maleStillborn ?? null,
    femaleStillbornCount: fd.femaleStillborn ?? null,
    unknownStillbornCount: fd.unknownStillborn ?? null,
    maleLossesCount: fd.maleLosses ?? null,
    femaleLossesCount: fd.femaleLosses ?? null,
    unknownLossesCount: fd.unknownLosses ?? null,
    hasCulls: !!fd.hasCulls,
    cullsCount: fd.cullsCount ?? null,
    breedingObjectives: Array.isArray(fd.breedingObjectives) ? fd.breedingObjectives : [],
    expectedOutcomes: fd.expectedOutcomes ?? null,
    geneticNotes: fd.geneticNotes ?? null,
    keepersGrowouts: fd.keepersGrowouts ?? 'Undecided',
    placementPlans: fd.placementPlans ?? 'Undecided',
    objectivesNotes: fd.objectivesNotes ?? null,
    objectivesEvaluation: fd.objectivesEvaluation ?? null,
    pregnancyLostReason: fd.pregnancyLostReason || null,
    pregnancyLostNotes: fd.pregnancyLostNotes || null,
    pairingNotes: fd.pairingNotes || '',
    tags: Array.isArray(fd.tags) ? fd.tags : [],
    birthComplications: fd.birthComplications || '',
    birthOutcome: fd.birthOutcome || '',
    assistanceRequired: fd.assistanceRequired === true ? 'yes' : fd.assistanceRequired === false ? 'no' : '',
    birthNotes: fd.birthNotes || '',
    weaningOutcome: fd.weaningOutcome || '',
    weaningNotes: fd.weaningNotes || '',
});

/** POST /litters body. `isPlanned` follows the dates via litterStatusPatch. */
export const buildCreatePayload = (fd, counts, offspringIds) => ({
    ...sharedPayload(fd, counts, offspringIds),
    ...litterStatusPatch(fd, null),
    ...(fd.pregnancyLost
        ? {
              pregnancyLost: true,
              pregnancyLostReason: fd.pregnancyLostReason || 'Unknown',
              pregnancyLostNotes: fd.pregnancyLostNotes || null,
          }
        : {}),
});

/** PUT /litters/:id body. `isPlanned` is only sent when a date edit changes the status. */
export const buildUpdatePayload = (fd, counts, offspringIds, original) => ({
    ...sharedPayload(fd, counts, offspringIds),
    breedingPairCodeName: fd.breedingPairCodeName,
    notes: fd.notes,
    ...litterStatusPatch(fd, original),
    pregnancyLost: !!fd.pregnancyLost,
    pregnancyLostReason: fd.pregnancyLost ? fd.pregnancyLostReason || 'Unknown' : null,
    pregnancyLostNotes: fd.pregnancyLost ? fd.pregnancyLostNotes || null : null,
});

/** Placeholder-animal request bodies (M1.., F1.., U1..) for "create new offspring". */
export const buildNewOffspringBodies = ({ counts, species, birthDate, sireId, damId, breederId }) => {
    const make = (prefix, gender, n) => Array.from({ length: n }, (_, i) => ({
        name: `${prefix}${i + 1}`,
        species,
        gender,
        birthDate,
        status: 'Pet',
        sireId_public: sireId,
        damId_public: damId,
        isOwned: true,
        breederId_public: breederId,
        creatorId_public: breederId,
    }));
    return [
        ...make('M', 'Male', parseInt(counts.males || 0, 10)),
        ...make('F', 'Female', parseInt(counts.females || 0, 10)),
        ...make('U', 'Unknown', parseInt(counts.unknown || 0, 10)),
    ];
};

/**
 * Edit one of maleLosses / femaleLosses / unknownLosses; Total Losses is their sum. When
 * extracting losses from the total, the matching M/F/U count moves by the change in losses
 * (never below zero).
 */
export const setLossSex = (fd, key, value) => {
    const next = { ...fd, [key]: value };
    next.lossesCount = orNull(n(next.maleLosses) + n(next.femaleLosses) + n(next.unknownLosses)) || null;
    if (fd.extractLossesFromTotal) {
        const countKey = LOSS_TO_COUNT[key];
        const current = n(fd[countKey]);
        const delta = n(value) - n(fd[key]);
        next[countKey] = orNull(Math.max(0, current - delta)) || null;
        next.litterSizeBorn = orNull(n(next.maleCount) + n(next.femaleCount) + n(next.unknownCount)) || null;
    }
    return next;
};
