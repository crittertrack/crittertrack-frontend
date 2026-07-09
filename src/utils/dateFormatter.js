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
