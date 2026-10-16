// Litter status for the single Add/Edit entry form. The status is not picked by hand — it
// follows the dates the user fills in:
//   birth date, or "born, date unknown"  -> born
//   (a stored pregnancy date, no birth)  -> pregnant   (set elsewhere; never derived from the form)
//   mating date after today              -> planned    (a scheduled mating)
//   mating date today or earlier         -> mated
//   nothing entered                      -> planned
// The server keeps using the existing isPlanned flag, so reminders, the calendar and the
// parent reproductive status keep working unchanged.

export const LITTER_STATUS_LABELS = { planned: 'Planned', mated: 'Mated', pregnant: 'Pregnant', born: 'Born' };

const dayOf = (d) => (d ? String(d).substring(0, 10) : '');

const startOfToday = (now) => { const t = new Date(now); t.setHours(0, 0, 0, 0); return t; };

/** Status implied by the form's current dates. `original` = the stored litter when editing. */
export const deriveLitterFormStatus = (fd, original = null, now = new Date()) => {
    if (!fd) return 'planned';
    if (fd.birthDate || fd.birthDateUnknown) return 'born';
    if (original && original.pregnancyDate) return 'pregnant';
    const mating = dayOf(fd.matingDate);
    if (mating) {
        const m = new Date(`${mating}T00:00:00`);
        if (!isNaN(m.getTime())) return m > startOfToday(now) ? 'planned' : 'mated';
    }
    return 'planned';
};

/** Status of a stored litter, using the same rules the cards use. */
export const deriveStoredStatus = (litter) => {
    if (!litter) return 'planned';
    if (litter.birthDate || litter.birthDateUnknown) return 'born';
    if (litter.pregnancyDate) return 'pregnant';
    if (litter.isPlanned) return 'planned';
    return litter.matingDate ? 'mated' : 'planned';
};

/**
 * isPlanned to send with a save.
 *  - new entry: always sent (planned = true, otherwise false);
 *  - edit: only sent when the mating/birth dates were changed AND that changes the status, so
 *    editing notes on a Planned entry whose mating date has passed doesn't silently mark it Mated.
 */
export const litterStatusPatch = (fd, original = null, now = new Date()) => {
    const next = deriveLitterFormStatus(fd, original, now);
    if (!original) return { isPlanned: next === 'planned' };

    const datesChanged =
        dayOf(original.matingDate) !== dayOf(fd.matingDate) ||
        !!(original.birthDate || original.birthDateUnknown) !== !!(fd.birthDate || fd.birthDateUnknown);
    if (!datesChanged) return {};
    if (next === deriveStoredStatus(original)) return {};
    return { isPlanned: next === 'planned' };
};
