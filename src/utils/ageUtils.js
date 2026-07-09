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
 * Format animal age from birth date into an object.
 * @param {string|Date} birthDate - Animal birth date
 * @returns {object} Object with years, months, label (e.g., { years: 1, months: 2, label: "1y 2m" }), or null.
 */
export const formatAnimalAge = (birthDate) => {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const today = new Date();
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    if (months < 0) {
        years--;
        months += 12;
    }
    
    if (years < 0) return null;
    
    const ageLabel = years > 0 
        ? `${years}y ${months}m`
        : `${months}m`;
    
    return { years, months, label: ageLabel };
};

/**
 * Returns a human-friendly age string from a birth date (e.g. "1y 2m 10d", "3m 5d", "9d").
 * @param {string|Date} birthDate - The birth date.
 * @returns {string|null} The formatted age string, or null if invalid.
 */
export const calculateAgeDetailed = (birthDate) => {
    if (!birthDate) return null;
    const born = new Date(birthDate);
    const now = new Date();
    if (isNaN(born.getTime()) || born > now) return null;
    let years = now.getFullYear() - born.getFullYear();
    let months = now.getMonth() - born.getMonth();
    let days = now.getDate() - born.getDate();
    if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    if (years > 0) return `${years}y ${months}m ${days}d`;
    if (months > 0) return `${months}m ${days}d`;
    return `${days}d`;
};