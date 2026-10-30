// Pure helpers for the full-page litter editor (Stage 2). Everything here is copied from, and
// must stay behaviourally identical to, the save logic in LitterManagement/index.jsx so the
// existing status / count / payload semantics are preserved. No React, no network.
import { litterStatusPatch } from '../../../utils/litterStatus';

export const EMPTY_LITTER_FORM = {
    breedingPairCodeName: '',
    sireId_public: '',
    damId_public: '',
    species: '',
    birthDate: '',
    birthDateUnknown: false,
    maleCount: null,
    femaleCount: null,
    unknownCount: null,
    maleLosses: null,
    femaleLosses: null,
    unknownLosses: null,
    hasCulls: false,
    cullsCount: null,
    maleStillborn: null,
    femaleStillborn: null,
    unknownStillborn: null,
    extractStillbornFromTotal: false,
    extractLossesFromTotal: false,
    notes: '',
    pairingNotes: '',
    tags: [],
    linkedOffspringIds: [],
    breedingMethod: 'Unknown',
    breedingConditionAtTime: '',
    matingDate: '',
    outcome: 'Unknown',
    birthMethod: '',
    birthComplications: '',
    birthOutcome: '',
    assistanceRequired: '', // '' = not recorded, 'yes' | 'no'
    birthNotes: '',
    weaningOutcome: '',
    weaningNotes: '',
    breedingObjectives: [],
    objectivesNotes: '',
    objectivesEvaluation: '',
    pregnancyLost: false,
    pregnancyLostReason: null,
    pregnancyLostNotes: null,
    litterSizeBorn: null,
    litterSizeWeaned: null,
    stillbornCount: null,
    lossesCount: null,
    expectedDueDate: '',
    weaningDate: '',
    weaningConfirmed: false,
};

/** Date inputs want YYYY-MM-DD. */
export const toDateInput = (value) => {
    if (!value) return '';
    try {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.split('T')[0];
        return new Date(value).toISOString().split('T')[0];
    } catch {
        return '';
    }
};

/** Positive integer or null (matches the monolith's `value || null` behaviour for counts). */
export const countOrNull = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
};

/** Stored litter -> editable form state (mirror of handleEditLitter). */
export const formFromLitter = (litter) => ({
    ...EMPTY_LITTER_FORM,
    breedingPairCodeName: litter.breedingPairCodeName || '',
    sireId_public: litter.sireId_public,
    damId_public: litter.damId_public,
    birthDate: litter.birthDateUnknown ? '' : toDateInput(litter.birthDate),
    birthDateUnknown: !!litter.birthDateUnknown,
    maleCount: litter.maleCount || null,
    femaleCount: litter.femaleCount || null,
    unknownCount: litter.unknownCount || null,
    notes: litter.notes || '',
    pairingNotes: litter.pairingNotes || '',
    tags: Array.isArray(litter.tags) ? litter.tags : [],
    linkedOffspringIds: litter.offspringIds_public || [],
    species: litter.sire?.species || litter.dam?.species || '',
    breedingMethod: litter.breedingMethod || 'Unknown',
    breedingConditionAtTime: litter.breedingConditionAtTime || '',
    matingDate: toDateInput(litter.matingDate || litter.pairingDate),
    outcome: litter.outcome || 'Unknown',
    birthMethod: litter.birthMethod || '',
    litterSizeBorn: litter.litterSizeBorn || litter.numberBorn || null,
    litterSizeWeaned: litter.litterSizeWeaned || litter.numberWeaned || null,
    stillbornCount: litter.stillbornCount || litter.stillborn || null,
    lossesCount: litter.lossesCount || litter.losses || null,
    maleStillborn: litter.maleStillbornCount || null,
    femaleStillborn: litter.femaleStillbornCount || null,
    unknownStillborn: litter.unknownStillbornCount || null,
    maleLosses: litter.maleLossesCount || null,
    femaleLosses: litter.femaleLossesCount || null,
    unknownLosses: litter.unknownLossesCount || null,
    hasCulls: !!litter.hasCulls,
    cullsCount: litter.hasCulls ? (litter.cullsCount ?? null) : null,
    extractStillbornFromTotal: !!litter.extractStillbornFromTotal,
    extractLossesFromTotal: !!litter.extractLossesFromTotal,
    expectedDueDate: toDateInput(litter.expectedDueDate),
    weaningDate: toDateInput(litter.weaningDate),
    weaningConfirmed: litter.weaningConfirmed || false,
    birthComplications: litter.birthComplications || '',
    birthOutcome: litter.birthOutcome || '',
    assistanceRequired: litter.assistanceRequired === true ? 'yes' : litter.assistanceRequired === false ? 'no' : '',
    birthNotes: litter.birthNotes || '',
    weaningOutcome: litter.weaningOutcome || '',
    weaningNotes: litter.weaningNotes || '',
    breedingObjectives: Array.isArray(litter.breedingObjectives) ? litter.breedingObjectives : [],
    objectivesNotes: litter.objectivesNotes || '',
    objectivesEvaluation: litter.objectivesEvaluation || '',
    pregnancyLost: !!litter.pregnancyLost,
    pregnancyLostReason: litter.pregnancyLostReason || null,
    pregnancyLostNotes: litter.pregnancyLostNotes || null,
});

/** Whether the optional "mating extra" / "birth extra" groups should start expanded. */
export const initialExtras = (litter) => ({
    matingExtra: !!(litter.breedingConditionAtTime || (litter.breedingMethod && litter.breedingMethod !== 'Unknown') || (litter.outcome && litter.outcome !== 'Unknown') || litter.pregnancyLost),
    birthExtra: !!(litter.birthMethod || litter.birthComplications || litter.birthOutcome || litter.birthNotes || typeof litter.assistanceRequired === 'boolean'),
    weaningExtra: !!(litter.weaningOutcome || litter.weaningNotes),
});

/**
 * Save-time reconciliation (identical rules to the monolith):
 *  - gender sum > total  -> bump total (silent)
 *  - stillborn / losses / weaned / culls exceeding the total -> warn, never auto-correct
 */
export const reconcileLitterFormCounts = (fd, linkedAnimals = []) => {
    const linkedMales = linkedAnimals.filter(a => a.gender === 'Male').length;
    const linkedFemales = linkedAnimals.filter(a => a.gender === 'Female').length;
    const linkedUnknown = linkedAnimals.filter(a => a.gender !== 'Male' && a.gender !== 'Female').length;
    const maleCount = Math.max(parseInt(fd.maleCount) || 0, linkedMales);
    const femaleCount = Math.max(parseInt(fd.femaleCount) || 0, linkedFemales);
    const unknownCount = Math.max(parseInt(fd.unknownCount) || 0, linkedUnknown);
    const genderSum = maleCount + femaleCount + unknownCount;
    const linkedCount = linkedAnimals.length;
    const manualTotal = parseInt(fd.litterSizeBorn) || 0;
    const litterSizeBorn = Math.max(manualTotal, genderSum, linkedCount) || null;
    const stillborn = parseInt(fd.stillbornCount) || 0;
    const losses = parseInt(fd.lossesCount) || 0;
    const weaned = parseInt(fd.litterSizeWeaned) || 0;
    const culls = fd.hasCulls ? (parseInt(fd.cullsCount) || 0) : 0;
    const warnings = [];
    if (litterSizeBorn && stillborn > litterSizeBorn) warnings.push(`Stillborn (${stillborn}) exceeds Total Born (${litterSizeBorn}).`);
    if (litterSizeBorn && losses > litterSizeBorn) warnings.push(`Losses (${losses}) exceeds Total Born (${litterSizeBorn}).`);
    if (culls > losses) warnings.push(`Culls (${culls}) exceeds Total Losses (${losses}).`);
    if (litterSizeBorn && weaned > litterSizeBorn) warnings.push(`Weaned (${weaned}) exceeds Total Born (${litterSizeBorn}).`);
    if (litterSizeBorn && (stillborn + losses + weaned) > litterSizeBorn) {
        warnings.push(`Stillborn + Losses + Weaned (${stillborn + losses + weaned}) exceeds Total Born (${litterSizeBorn}).`);
    }
    return {
        correctedCounts: { maleCount: maleCount || null, femaleCount: femaleCount || null, unknownCount: unknownCount || null, litterSizeBorn, numberBorn: litterSizeBorn },
        warnings,
    };
};

/**
 * Field-level validation shown next to the inputs. Returns { fieldName: message }.
 * `sire` / `dam` are the resolved animal objects (may be null while unresolved).
 */
export const validateLitterForm = (fd, { sire, dam } = {}) => {
    const errors = {};
    if (!fd.sireId_public) errors.sireId_public = 'Select a sire.';
    if (!fd.damId_public) errors.damId_public = 'Select a dam.';
    if (fd.sireId_public && fd.damId_public && fd.sireId_public === fd.damId_public) {
        errors.damId_public = 'Sire and dam must be different animals.';
    }
    if (sire?.species && dam?.species && sire.species !== dam.species) {
        errors.damId_public = 'Parents must be the same species.';
    }
    if (fd.birthDate && !fd.birthDateUnknown && dam?.deceasedDate) {
        const damDied = new Date(dam.deceasedDate).toISOString().slice(0, 10);
        const born = new Date(fd.birthDate).toISOString().slice(0, 10);
        if (damDied < born) errors.birthDate = `Dam (${dam.name}) was deceased before this birth date.`;
    }
    if (fd.matingDate && fd.birthDate && !fd.birthDateUnknown && fd.birthDate < fd.matingDate) {
        errors.birthDate = 'Birth date cannot be before the mating date.';
    }
    return errors;
};

/** Fields shared by the create (POST) and update (PUT) payloads. */
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
    litterSizeWeaned: fd.litterSizeWeaned || null,
    stillbornCount: fd.stillbornCount || null,
    lossesCount: fd.lossesCount || null,
    weaningDate: fd.weaningDate || null,
    weaningConfirmed: fd.weaningConfirmed || false,
    extractStillbornFromTotal: fd.extractStillbornFromTotal || false,
    extractLossesFromTotal: fd.extractLossesFromTotal || false,
    maleStillbornCount: fd.maleStillborn || null,
    femaleStillbornCount: fd.femaleStillborn || null,
    unknownStillbornCount: fd.unknownStillborn || null,
    maleLossesCount: fd.maleLosses || null,
    femaleLossesCount: fd.femaleLosses || null,
    unknownLossesCount: fd.unknownLosses || null,
    hasCulls: !!fd.hasCulls,
    cullsCount: fd.cullsCount || null,
    birthComplications: fd.birthComplications || null,
    birthOutcome: fd.birthOutcome || null,
    assistanceRequired: fd.assistanceRequired === 'yes' ? true : fd.assistanceRequired === 'no' ? false : null,
    birthNotes: fd.birthNotes || null,
    weaningOutcome: fd.weaningOutcome || null,
    weaningNotes: fd.weaningNotes || null,
    breedingObjectives: Array.isArray(fd.breedingObjectives) ? fd.breedingObjectives : [],
    objectivesNotes: fd.objectivesNotes || null,
    objectivesEvaluation: fd.objectivesEvaluation || null,
    pairingNotes: fd.pairingNotes || null,
    tags: Array.isArray(fd.tags) ? fd.tags : [],
});

/** POST /litters body. Status (isPlanned) follows the dates via litterStatusPatch. */
export const buildCreatePayload = (fd, counts, offspringIds) => ({
    ...sharedPayload(fd, counts, offspringIds),
    ...litterStatusPatch(fd, null),
    ...(fd.pregnancyLost ? {
        pregnancyLost: true,
        pregnancyLostReason: fd.pregnancyLostReason || 'Unknown',
        pregnancyLostNotes: fd.pregnancyLostNotes || null,
    } : {}),
});

/** PUT /litters/:id body. isPlanned is only sent when a date edit actually changes the status. */
export const buildUpdatePayload = (fd, counts, offspringIds, original) => ({
    ...sharedPayload(fd, counts, offspringIds),
    breedingPairCodeName: fd.breedingPairCodeName,
    notes: fd.notes,
    ...litterStatusPatch(fd, original),
    pregnancyLost: !!fd.pregnancyLost,
    pregnancyLostReason: fd.pregnancyLost ? (fd.pregnancyLostReason || 'Unknown') : null,
    pregnancyLostNotes: fd.pregnancyLost ? (fd.pregnancyLostNotes || null) : null,
});

/** Offspring creation bodies for "create new animals" (names M1.., F1.., U1..). */
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
        ...make('M', 'Male', parseInt(counts.males || 0)),
        ...make('F', 'Female', parseInt(counts.females || 0)),
        ...make('U', 'Unknown', parseInt(counts.unknown || 0)),
    ];
};

// ---- Sex-breakdown arithmetic (mirrors the inline handlers in LitterManagement) -------------
const n = (v) => parseInt(v, 10) || 0;
const orNull = (v) => v || null;

/** Edit one of maleCount / femaleCount / unknownCount; Total Born is always their sum. */
export const setSexCount = (fd, key, value) => {
    const next = { ...fd, [key]: value };
    return { ...next, litterSizeBorn: orNull(n(next.maleCount) + n(next.femaleCount) + n(next.unknownCount)) };
};

/** Edit one of male/female/unknownStillborn; Total Stillborn is their sum. */
export const setStillbornSex = (fd, key, value) => {
    const next = { ...fd, [key]: value };
    return { ...next, stillbornCount: orNull(n(next.maleStillborn) + n(next.femaleStillborn) + n(next.unknownStillborn)) };
};

const LOSS_TO_COUNT = { maleLosses: 'maleCount', femaleLosses: 'femaleCount', unknownLosses: 'unknownCount' };

/**
 * Edit one of male/female/unknownLosses. Total Losses is their sum. When losses are extracted
 * from the totals, the matching M/F/U count moves the opposite way by the change in losses.
 */
export const setLossSex = (fd, key, value) => {
    const next = { ...fd, [key]: value };
    next.lossesCount = orNull(n(next.maleLosses) + n(next.femaleLosses) + n(next.unknownLosses));
    if (fd.extractLossesFromTotal) {
        const countKey = LOSS_TO_COUNT[key];
        next[countKey] = orNull(Math.max(0, n(fd[countKey]) + (n(fd[key]) - n(value))));
        next.litterSizeBorn = orNull(n(next.maleCount) + n(next.femaleCount) + n(next.unknownCount));
    }
    return next;
};

const toggleExtract = (fd, flag, lossKeys, on) => {
    const sign = on ? -1 : 1;
    const apply = (count, loss) => {
        const v = n(fd[count]) + sign * n(fd[loss]);
        return on ? Math.max(0, v) : v;
    };
    const maleCount = apply('maleCount', lossKeys.male);
    const femaleCount = apply('femaleCount', lossKeys.female);
    const unknownCount = apply('unknownCount', lossKeys.unknown);
    return {
        ...fd,
        [flag]: on,
        maleCount: orNull(maleCount),
        femaleCount: orNull(femaleCount),
        unknownCount: orNull(unknownCount),
        litterSizeBorn: orNull(maleCount + femaleCount + unknownCount),
    };
};

/** "Extract stillborn from total counts" checkbox. */
export const toggleExtractStillborn = (fd, on) =>
    toggleExtract(fd, 'extractStillbornFromTotal', { male: 'maleStillborn', female: 'femaleStillborn', unknown: 'unknownStillborn' }, on);

/** "Extract losses from total counts" checkbox. */
export const toggleExtractLosses = (fd, on) =>
    toggleExtract(fd, 'extractLossesFromTotal', { male: 'maleLosses', female: 'femaleLosses', unknown: 'unknownLosses' }, on);

// ---- Offspring linking (mirrors the "Link Existing Animals" / "Create New Offspring" blocks) ----
const dayOnly = (d) => (d ? String(d).split('T')[0] : '');

/** Animals the user owns that have this litter's sire + dam (and its birth date, when both have one). */
export const linkableOffspring = (animals, fd) => animals.filter((a) => {
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

export const unlinkOffspring = (fd, id_public) => ({
    ...fd,
    linkedOffspringIds: (fd.linkedOffspringIds || []).filter((id) => id !== id_public),
});

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
