/**
 * Consolidates a batch of near-duplicate hex colors (see colors.md) onto a single
 * Tailwind token each. For CSS files: standalone declarations (color/background/
 * background-color/border-color/outline-color/fill/stroke: #hex;) become `@apply
 * <prefix>-<token>;`. Anything else containing the hex (shorthands, custom/invalid
 * props) just gets the literal value swapped to the token's canonical hex, with a
 * trailing comment for traceability.
 *
 * Edit MAPPING below for each batch, then run: node scripts/consolidate-colors.js
 * Only touches .css files — JS/JSX usages need manual review (chart color arrays,
 * conditional style objects, etc. can't be safely regex-replaced).
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

// tokenName -> { hex: canonical value, absorbs: [other hexes that become this token] }
const MAPPING = {
    'accent-purple': { hex: '#7c3aed', absorbs: ['#9333ea', '#8b5cf6'] },
    'accent-purple-dark': { hex: '#6a1b9a', absorbs: ['#7b1fa2', '#9c27b0'] },
    // Reuses the existing page-bg token instead of a new one — these are all pale
    // pink/rose shades within Delta-E 12 of it (see colors.md §3).
    'page-bg': {
        hex: '#F1D1DC',
        absorbs: [
            '#F2E4E9', '#f3e5f5', '#f3e8ff', '#f5c6cb', '#f8d7da', '#fcc',
            '#fce4ec', '#fce7f3', '#fdecea', '#fdeef6', '#fecaca', '#fee',
            '#fee2e2', '#ffcdd2', '#ffebee',
        ],
    },
};

const PROPERTY_PREFIX = {
    color: 'text',
    'background-color': 'bg',
    background: 'bg',
    'border-color': 'border',
    'outline-color': 'outline',
    fill: 'fill',
    stroke: 'stroke',
};

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(fullPath, files);
        else if (path.extname(entry.name) === '.css') files.push(fullPath);
    }
    return files;
}

// value -> tokenName, for every hex (canonical + absorbed) across the whole mapping.
const hexToToken = new Map();
for (const [token, { hex, absorbs }] of Object.entries(MAPPING)) {
    hexToToken.set(hex.toLowerCase(), token);
    for (const alt of absorbs) hexToToken.set(alt.toLowerCase(), token);
}
// Longest-first so e.g. "#fee2e2" is tried before "#fee" (which would otherwise
// match its first 4 chars and leave "2e2" dangling).
const allHexes = [...hexToToken.keys()].sort((a, b) => b.length - a.length);
const hexAlternation = allHexes.map((h) => h.replace('#', '\#')).join('|');
// Guards against matching a short hex as a prefix of a longer one still.
const hexBoundary = '(?![0-9a-fA-F])';

let filesChanged = 0;
let applyCount = 0;
let literalSwapCount = 0;

for (const file of walk(SRC_DIR)) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;

    // Pass 1: standalone declarations -> @apply
    for (const [prop, prefix] of Object.entries(PROPERTY_PREFIX)) {
        const propPattern = prop.replace('-', '\\-');
        // Negative lookbehind so e.g. the "color" pattern doesn't match the tail of
        // "border-color"/"background-color"/"outline-color".
        const re = new RegExp('(?<![a-zA-Z-])' + propPattern + '\\s*:\\s*(' + hexAlternation + ')' + hexBoundary + '\\s*;', 'gi');
        content = content.replace(re, (match, hex) => {
            const token = hexToToken.get(hex.toLowerCase());
            if (!token) return match;
            applyCount += 1;
            return `@apply ${prefix}-${token};`;
        });
    }

    // Pass 2: anything left referencing an absorbed hex (shorthands, invalid custom
    // props like `ring-color`) -> swap to the token's canonical hex + traceability note.
    const leftoverRe = new RegExp(`(${hexAlternation})${hexBoundary}`, 'gi');
    content = content.replace(leftoverRe, (match) => {
        const token = hexToToken.get(match.toLowerCase());
        if (!token) return match;
        const canonical = MAPPING[token].hex;
        if (match.toLowerCase() === canonical.toLowerCase()) return match;
        literalSwapCount += 1;
        return `${canonical} /* consolidated: ${token} */`;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        filesChanged += 1;
        console.log(`Updated ${path.relative(path.join(__dirname, '..'), file)}`);
    }
}

console.log(`\n${filesChanged} file(s) changed, ${applyCount} declaration(s) converted to @apply, ${literalSwapCount} literal value(s) swapped.`);
