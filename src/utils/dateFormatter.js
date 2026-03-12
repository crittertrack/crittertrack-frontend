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
        // Match YYYY-MM-DD (with optional time component)
        const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (dateOnlyMatch) {
            // Construct as local time to avoid UTC off-by-one for users in negative UTC offsets
            return new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]));
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
