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
    'info-indigo': { hex: '#6366f1', absorbs: ['#2563eb'] },
    'info-blue': { hex: '#3b82f6', absorbs: ['#007bff', '#667eea'] },
    'info-blue-dark': { hex: '#1976d2', absorbs: ['#1565c0', '#0056b3', '#0d47a1'] },
    // Reuses the existing page-bg token instead of a new one — these are all pale
    // pink/rose shades within Delta-E 12 of it (see colors.md §3).
    'page-bg': {
        hex: '#F1D1DC',
        absorbs: [
            '#F2E4E9', '#f3e5f5', '#f5c6cb', '#f8d7da', '#fcc',
            '#fce4ec', '#fce7f3', '#fdecea', '#fdeef6', '#fecaca', '#fee',
            '#fee2e2', '#ffcdd2', '#ffebee',
        ],
    },
    // Not dark-mode tokens — these light-mode grays only *look* close to the
    // dark-* palette by coincidence. Route them to Tailwind's built-in gray
    // scale instead so they stay independent of the dark theme.
    'gray-900': { hex: '#111827', absorbs: ['#000', '#000000', '#0f172a', '#1a1a1a'] },
    'gray-800': { hex: '#1f2937', absorbs: ['#1e293b', '#2c2c2c', '#333'] },
    'gray-700': { hex: '#374151', absorbs: ['#334155', '#424242'] },
    'gray-600': { hex: '#4b5563', absorbs: ['#495057', '#555', '#5a6268', '#616161'] },
    'gray-500': { hex: '#6b7280', absorbs: ['#666', '#6c757d', '#757575', '#888'] },
    'gray-400': { hex: '#9ca3af', absorbs: ['#8ea0ba', '#94a3b8', '#999'] },
    // Also absorbs several near-white "card background/divider" grays (colors.md §3)
    // that were mis-clustered near pedigree-female-bg/pedigree-male-bg purely by
    // Delta-E-near-white coincidence — they're plain neutral grays, not pink/blue washes.
    'gray-300': { hex: '#d1d5db', absorbs: ['#ccc', '#d0d0d0', '#bbb', '#ddd', '#cbd5e1'] },
    'gray-200': { hex: '#e5e7eb', absorbs: ['#e0e0e0', '#e8e8e8', '#e2e8f0', '#dee2e6', '#e9ecef'] },
    'gray-100': { hex: '#f3f4f6', absorbs: ['#eee', '#f0f0f0', '#f5f5f5', '#f1f5f9'] },
    'gray-50': { hex: '#f9fafb', absorbs: ['#f8f9fa', '#fafafa', '#f9f9f9', '#fafbfc', '#f8fafc', '#f8f8f8'] },
    // Semantic status-color clusters (colors.md §4) — all canonical values below are
    // Tailwind's own built-in shades, reused instead of inventing new tokens.
    'red-700': { hex: '#b91c1c', absorbs: ['#c62828', '#b71c1c', '#c33', '#c82333'] },
    'red-600': { hex: '#dc2626', absorbs: ['#d32f2f', '#f44336'] },
    'red-500': { hex: '#ef4444', absorbs: ['#dc3545', '#ef5350'] },
    // Pale red/danger background (colors.md §3) — was mis-clustered near
    // pedigree-female-bg, but actually pairs with text-red-600 (error states).
    'red-50': { hex: '#fef2f2', absorbs: [] },
    'green-600': { hex: '#16a34a', absorbs: ['#28a745', '#4caf50', '#4CAF50', '#45a049'] },
    'green-800': { hex: '#166534', absorbs: ['#1b5e20'] },
    'amber-500': { hex: '#f59e0b', absorbs: ['#ff9800'] },
    'amber-800': { hex: '#92400e', absorbs: ['#9a3412'] },
    'amber-400': { hex: '#fbbf24', absorbs: ['#ffc107', '#ffb300', '#FFBB28'] },
    'orange-600': { hex: '#ea580c', absorbs: ['#e65100'] },
    // Absorbs #ff6f00 (colors.md §4 Group 2) — same orange-500 family, hand-typed drift.
    'orange-500': { hex: '#f97316', absorbs: ['#f57c00', '#ff7300', '#ff6f00'] },
    // Pale success/warning/danger "chip background" families (colors.md §4 groups
    // 1/3/4/5 + related §3 false-positives). These were mis-clustered together (or
    // against pedigree-*-bg) purely because Delta-E compresses perceptual distance
    // near white — verified via actual usage context (paired text/border colors)
    // that each family below is genuinely distinct.
    'green-50': { hex: '#f0fdf4', absorbs: ['#e8f5e9', '#efe', '#e8f5e8', '#ecfdf5', '#f9fdf9'] },
    'green-100': { hex: '#dcfce7', absorbs: [] },
    'green-200': { hex: '#bbf7d0', absorbs: ['#cfc'] },
    'amber-50': { hex: '#fffbeb', absorbs: ['#fff3e0', '#fff3cd', '#fff8e1'] },
    'amber-100': { hex: '#fef3c7', absorbs: [] },
    'yellow-50': { hex: '#fefce8', absorbs: [] },
    'yellow-100': { hex: '#fef9c3', absorbs: [] },
    'orange-50': { hex: '#fff7ed', absorbs: [] },
    'orange-200': { hex: '#ffe0b2', absorbs: [] },
    // Custom token companions (src/utils/themeColors.js) — absorbing the pale
    // purple/blue/green washes that got mis-clustered near pedigree-*-bg.
    'accent-purple-bg': { hex: '#f3e8ff', absorbs: ['#ede9fe', '#f5f3ff', '#e9d5ff', '#faf5ff'] },
    'info-bg': { hex: '#e3f2fd', absorbs: ['#dbeafe', '#e0e7ff', '#eef2ff', '#eff6ff'] },
    'pedigree-neutral-bg': { hex: '#eef2f7', absorbs: ['#f3f6fb'] },
    'success-green-dark': { hex: '#388e3c', absorbs: ['#218838', '#2e7d32'] },
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
