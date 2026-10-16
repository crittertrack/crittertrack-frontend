// Validation for the Help Center "Suggest values for a species" form. Mirrors the server's rules in
// crittertrack-pedigree/utils/speciesValueSuggestion.js: a species, plus at least one of gestation /
// weaning (whole days, 1..MAX_DAYS). An empty box just means "not provided".
export const MAX_DAYS = 1000;

const blank = (raw) => String(raw ?? '').trim() === '';

const checkDays = (raw, label) => {
    if (blank(raw)) return { provided: false };
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 1 || n > MAX_DAYS) {
        return { provided: true, error: `${label} must be a whole number of days between 1 and ${MAX_DAYS}.` };
    }
    return { provided: true };
};

/** Returns an error message, or null when the suggestion can be sent. */
export const validateSuggestion = ({ species, gestationDays, weaningDays }) => {
    if (!species) return 'Please select a species.';
    const g = checkDays(gestationDays, 'Gestation');
    const w = checkDays(weaningDays, 'Weaning');
    if (g.error) return g.error;
    if (w.error) return w.error;
    if (!g.provided && !w.provided) return 'Enter gestation days, weaning days, or both.';
    return null;
};

/** The JSON body to send: an empty box becomes null, a filled one a number. */
export const buildSuggestionBody = ({ species, gestationDays, weaningDays }) => ({
    species,
    gestationDays: blank(gestationDays) ? null : Number(gestationDays),
    weaningDays: blank(weaningDays) ? null : Number(weaningDays),
});
