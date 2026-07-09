import { differenceInDays } from 'date-fns';

/**
 * Calculates age for breeding purposes where a month is consistently 28 days.
 * @param {string | Date | null} birthDate - The birth date of the animal.
 * @param {string | Date | null} [endDate] - The date to calculate age until (e.g., deceasedDate or today). Defaults to the current date.
 * @returns {string} The formatted age string (e.g., "1y 2m", "3m 4d", "5d"), or '—' if the birth date is invalid.
 */
export const calculateBreedingAge = (birthDate, endDate) => {
    if (!birthDate) return '—';

    const start = new Date(birthDate);
    const end = endDate ? new Date(endDate) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return '—';
    }

    const totalDays = Math.abs(differenceInDays(end, start));

    const daysInBreedingMonth = 28; // 4 weeks
    const daysInBreedingYear = 365;

    const years = Math.floor(totalDays / daysInBreedingYear);
    const remainingDaysAfterYears = totalDays % daysInBreedingYear;

    const months = Math.floor(remainingDaysAfterYears / daysInBreedingMonth);
    const remainingDays = remainingDaysAfterYears % daysInBreedingMonth;

    if (years > 0) return `${years}y ${months}m`;
    if (months > 0) return `${months}m ${remainingDays}d`;
    return `${remainingDays}d`;
};

/**
 * Formats a date string into the user's local date format (e.g., MM/DD/YYYY or DD/MM/YYYY).
 * @param {string | Date | null} date - The date to format.
 * @returns {string} The locally formatted date string, or '—' if invalid.
 */
export const formatLocalDate = (date) => {
    if (!date) return '—';
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : '—';
};