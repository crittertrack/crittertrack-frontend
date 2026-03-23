/**
 * Date formatting utility for consistent date display across the application
 * Uses browser's locale for formatting
 */

/**
 * Parses a date value as local time to avoid UTC off-by-one errors.
 * Date-only strings (YYYY-MM-DD) are parsed as midnight local time.
 * Full ISO strings and Date objects are handled normally.
 */
const parseLocalDate = (date) => {
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
