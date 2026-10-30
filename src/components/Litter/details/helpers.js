// Pure calculations for the litter details page. No React, no network.

const isNum = (v) => v !== null && v !== undefined && v !== '' && !isNaN(Number(v));
const numOrNull = (v) => (isNum(v) ? Number(v) : null);

/** Local-midnight Date for a stored date / ISO string, or null. */
export const dayOf = (d) => {
    if (!d) return null;
    const t = new Date(`${String(d).substring(0, 10)}T00:00:00`);
    return isNaN(t.getTime()) ? null : t;
};

const startOfDay = (now) => { const t = new Date(now); t.setHours(0, 0, 0, 0); return t; };
const diffDays = (date, now) => Math.round((dayOf(date) - startOfDay(now)) / 86400000);

export const relativeDaysLabel = (days) => {
    if (days === 0) return 'Today';
    return days > 0 ? `in ${days}d` : `${Math.abs(days)}d overdue`;
};

/**
 * Litter statistics without double counting.
 *  - lossesCount INCLUDES culls (cullsCount is "of the losses, how many were culls"), so
 *    postnatal losses shown on their own = losses - culls.
 *  - stillborn are a separate bucket, never part of lossesCount.
 *  - When the "extract ... from total" flags are on, the stored M/F/U counts and litterSizeBorn
 *    were already reduced, so the true total born is rebuilt by adding them back.
 *  - null always means "not recorded"; 0 is a recorded zero.
 */
export const computeLitterStats = (litter, status) => {
    const male = numOrNull(litter.maleCount);
    const female = numOrNull(litter.femaleCount);
    const unknown = numOrNull(litter.unknownCount);
    const sexRecorded = [male, female, unknown].some(v => v !== null);
    const sexSum = (male || 0) + (female || 0) + (unknown || 0);

    const storedBorn = numOrNull(litter.litterSizeBorn ?? litter.numberBorn) ?? (sexRecorded ? sexSum : null);
    const stillborn = numOrNull(litter.stillbornCount ?? litter.stillborn);
    const losses = numOrNull(litter.lossesCount ?? litter.losses);
    const culls = litter.hasCulls ? numOrNull(litter.cullsCount) : null;

    const addBack = (litter.extractStillbornFromTotal ? (stillborn || 0) : 0)
        + (litter.extractLossesFromTotal ? (losses || 0) : 0);
    const totalBorn = storedBorn === null ? null : storedBorn + addBack;
    const liveBorn = totalBorn === null ? null : Math.max(0, totalBorn - (stillborn || 0));
    const surviving = liveBorn === null ? null : Math.max(0, liveBorn - (losses || 0));
    const postnatal = losses === null ? null : Math.max(0, losses - (culls || 0));

    const weaned = numOrNull(litter.litterSizeWeaned ?? litter.numberWeaned);
    const isBorn = status === 'born';
    const weanedState = weaned !== null ? 'value' : (isBorn && !litter.weaningConfirmed ? 'pending' : 'missing');
    const survivalPct = (weaned !== null && liveBorn > 0 && (litter.weaningConfirmed || weaned > 0))
        ? Math.min(100, Math.round((weaned / liveBorn) * 100))
        : null;

    const pick = (a, b, c) => [a, b, c].map(numOrNull);
    return {
        male, female, unknown, sexRecorded, sexSum,
        sexExcludesLosses: !!(litter.extractStillbornFromTotal || litter.extractLossesFromTotal),
        totalBorn, liveBorn, surviving, stillborn, losses, culls, postnatal,
        weaned, weanedState, survivalPct,
        stillbornBySex: pick(litter.maleStillbornCount, litter.femaleStillbornCount, litter.unknownStillbornCount),
        lossesBySex: pick(litter.maleLossesCount, litter.femaleLossesCount, litter.unknownLossesCount),
        anyLossRecorded: stillborn !== null || losses !== null || culls !== null,
    };
};

/** Ordered reproductive timeline. `done` = the step has happened; `missing` = nothing recorded. */
export const buildTimeline = (litter, status) => {
    const born = status === 'born';
    const steps = [
        {
            key: 'mating',
            label: status === 'planned' ? 'Planned mating' : 'Mated',
            date: litter.matingDate || litter.pairingDate || null,
            done: status !== 'planned' && !!(litter.matingDate || litter.pairingDate),
        },
        { key: 'pregnancy', label: 'Pregnancy confirmed', date: litter.pregnancyDate || null, done: !!litter.pregnancyDate },
        { key: 'due', label: 'Expected due', date: litter.expectedDueDate || null, done: born },
        {
            key: 'birth',
            label: 'Born',
            date: litter.birthDate || null,
            note: litter.birthDateUnknown && !litter.birthDate ? 'Date unknown' : null,
            done: born,
        },
        {
            key: 'weaning',
            label: litter.weaningConfirmed ? 'Weaned' : 'Expected weaning',
            date: litter.weaningDate || null,
            done: !!litter.weaningConfirmed,
        },
    ];
    return steps.map(s => ({ ...s, missing: !s.date && !s.note }));
};

/** The next thing coming up for this litter, or null when there is nothing left to do. */
export const nextMilestone = (litter, status, now = new Date()) => {
    if (litter.pregnancyLost) return null;
    let label = null;
    let date = null;
    if (status === 'born') {
        if (!litter.weaningConfirmed && litter.weaningDate) { label = 'Weaning'; date = litter.weaningDate; }
    } else if (status === 'planned' && (litter.matingDate || litter.pairingDate) && dayOf(litter.matingDate || litter.pairingDate) >= startOfDay(now)) {
        label = 'Mating'; date = litter.matingDate || litter.pairingDate;
    } else if (litter.expectedDueDate) {
        label = 'Birth due'; date = litter.expectedDueDate;
    }
    if (!label || !dayOf(date)) return null;
    return { label, date, days: diffDays(date, now) };
};

/** Variety text for a parent, built the same way as the animal modal's "Variety" field. */
export const varietyOf = (a) => (a
    ? [a.color, a.markings, a.earset, a.coat, a.eyeColor, a.body].filter(Boolean).join(' ')
    : '');
