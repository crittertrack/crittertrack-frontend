import { differenceInDays } from 'date-fns';
/**
 * Date formatting utility for consistent date display across the application
 * Uses browser's locale for formatting
 */

/**
 * Parses a date value as local time to avoid UTC off-by-one errors.
 * Date-only strings (YYYY-MM-DD) are parsed as midnight local time.
 * Full ISO strings and Date objects are handled normally.
 */
export const parseLocalDate = (date) => {
    if (date instanceof Date) return date;
    if (typeof date === 'string') {
        // Match YYYY-MM-DD (no time component) — parse as local midnight
        const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (dateOnlyMatch) {
            return new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]));
        }
        // Match full ISO strings where time is midnight UTC (e.g. from MongoDB)
        // e.g. 2026-03-24T00:00:00.000Z — treat as local date to avoid off-by-one
        const isoMidnightMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})T00:00:00/);
        if (isoMidnightMatch) {
            return new Date(Number(isoMidnightMatch[1]), Number(isoMidnightMatch[2]) - 1, Number(isoMidnightMatch[3]));
        }
    }
    return new Date(date);
};

export const formatDate = (date) => {
    if (!date) return '';
    
    const d = parseLocalDate(date);
    if (isNaN(d.getTime())) return '';
    
    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(d);
};

export const formatDateShort = (date) => {
    if (!date) return '';
    
    const d = parseLocalDate(date);
    if (isNaN(d.getTime())) return '';
    
    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(d);
};

/**
 * Formats a date string into the user's local date format (e.g., MM/DD/YYYY or DD/MM/YYYY).
 * @param {string | Date | null} date - The date to format.
 * @returns {string} The locally formatted date string, or '—' if invalid.
 */
export const formatLocalDate = (date) => {
    if (!date) return '—';
    const dateObj = parseLocalDate(date);
    return !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : '—';
};

// Formats a date/ISO string as a relative time phrase (e.g. "2 hours ago")
export const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const then = new Date(dateStr);
    if (isNaN(then.getTime())) return '';
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMo = Math.floor(diffDays / 30);
    if (diffMo < 12) return `${diffMo}mo ago`;
    return `${Math.floor(diffMo / 12)}y ago`;
};

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

export const litterAge = calculateBreedingAge;

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
