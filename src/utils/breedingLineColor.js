// Detects the special CSS-gradient sentinel stored in a breeding line's `color` field
// (dev-only exception for multi-color lines - never offered via the color-swatch picker).
export const isGradientColor = (color) => typeof color === 'string' && color.startsWith('linear-gradient');

// Style for rendering a line's color as TEXT (e.g. the diamond glyph) - `color` can't take
// a gradient directly, so fall back to the background-clip:text trick.
export const breedingLineTextStyle = (color) => isGradientColor(color)
    ? { backgroundImage: color, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' }
    : { color };

// Style for rendering a line's color as a solid fill (backgroundColor usage, e.g. legend dots).
export const breedingLineBgStyle = (color) => isGradientColor(color)
    ? { backgroundImage: color }
    : { backgroundColor: color };

// Glyph shown for a line - the dev-only gradient line gets a star instead of the usual diamond.
export const breedingLineGlyph = (color) => isGradientColor(color) ? '\u2605' : '\u25C6';

// Stable-sorts a list of line defs so gradient (star) lines render before regular (diamond) ones.
export const sortLinesGradientFirst = (lines) => lines
    .map((line, idx) => ({ line, idx }))
    .sort((a, b) => (isGradientColor(b.line.color) - isGradientColor(a.line.color)) || (a.idx - b.idx))
    .map(({ line }) => line);

// Dev-only: once the combo "Legacy" star is assigned to an animal, the individual legacy
// diamonds it was built from are redundant - hide them from read-only display lists.
const LEGACY_TRIPLE_IDS = [0, 1, 2];
export const hideRedundantLegacyLines = (lines) => lines.some(l => isGradientColor(l.color))
    ? lines.filter(l => !LEGACY_TRIPLE_IDS.includes(l.id))
    : lines;

// Breeding-line defs assigned to BOTH given animals (by id_public) - used to warn when a
// sire/dam pairing shares a tracked line, since named lines are usually meant to stay separate.
export const getCommonBreedingLines = (sireId, damId, animalBreedingLines = {}, breedingLineDefs = []) => {
    if (!sireId || !damId) return [];
    const sireLines = animalBreedingLines[sireId] || [];
    const damLines = animalBreedingLines[damId] || [];
    const commonIds = sireLines.filter(id => damLines.includes(id));
    if (commonIds.length === 0) return [];
    return breedingLineDefs.filter(l => commonIds.includes(l.id) && l.name && l.enabled !== false);
};

// Style for the assignable line "chip" button, which needs border/fill/text color together.
export const breedingLineButtonStyle = (color, assigned) => {
    if (isGradientColor(color)) {
        const firstStop = (color.match(/#[0-9a-fA-F]{3,8}/) || [])[0] || '#999';
        return assigned
            ? { borderColor: firstStop, backgroundImage: color, color: '#fff' }
            : { borderColor: firstStop, backgroundImage: color, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' };
    }
    return {
        borderColor: color,
        color: assigned ? '#fff' : color,
        backgroundColor: assigned ? color : 'transparent',
    };
};
