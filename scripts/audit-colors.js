/**
 * Regenerates ../../colors.md — scans src/ for hardcoded hex colors (CSS + JSX inline
 * styles), cross-references them against the official palette in tailwind.config.js,
 * and clusters near-duplicate shades so they can be consolidated onto a single token
 * instead of migrating every literal 1:1.
 * Run with: node scripts/audit-colors.js
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const OUTPUT_FILE = path.join(__dirname, '..', '..', 'colors.md');
const SCAN_EXTENSIONS = new Set(['.css', '.js', '.jsx']);
const HEX_PATTERN = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g;

// Distance thresholds are CIE76 Delta-E (perceptual Lab-space distance, ~2.3 = just
// noticeable, ~10 = clearly related shades, >49 = unrelated colors). Plain RGB Euclidean
// distance was tried first but wrongly matched e.g. pale grays to a pale pink token
// purely because both are high-lightness — Lab space separates hue/chroma from lightness.
const OFFICIAL_MATCH_THRESHOLD = 12; // "close enough to reuse an existing token"
const CLUSTER_THRESHOLD = 10; // "close enough to merge into one new token"

// Official palette, read directly from the Tailwind config so this never drifts.
const tailwindConfig = require('../tailwind.config.js');
const officialColors = tailwindConfig.theme.extend.colors;
const officialByHex = new Map(
    Object.entries(officialColors).map(([name, hex]) => [hex.toLowerCase(), name])
);

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(fullPath, files);
        } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
            files.push(fullPath);
        }
    }
    return files;
}

// Expands #abc/#abcd to #aabbcc/#aabbccdd, then returns [r,g,b] (alpha ignored for distance).
function hexToRgb(hex) {
    let h = hex.slice(1);
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return [r, g, b];
}

// sRGB -> CIE Lab, so distance can separate hue/chroma from plain lightness.
function rgbToLab([r, g, b]) {
    const toLinear = (c) => {
        c /= 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const [rl, gl, bl] = [toLinear(r), toLinear(g), toLinear(b)];
    const x = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) / 0.95047;
    const y = (rl * 0.2126 + gl * 0.7152 + bl * 0.0722) / 1.0;
    const z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) / 1.08883;
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + 16 / 116);
    const [fx, fy, fz] = [f(x), f(y), f(z)];
    return [(116 * fy) - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

// CIE76 Delta-E between two hex colors.
function colorDistance(hexA, hexB) {
    const [l1, a1, b1] = rgbToLab(hexToRgb(hexA));
    const [l2, a2, b2] = rgbToLab(hexToRgb(hexB));
    return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

// value -> { css: Set<"relPath:line">, inline: Set<"relPath:line"> }
const findings = new Map();

for (const file of walk(SRC_DIR)) {
    const relPath = path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '\\');
    const isCss = path.extname(file) === '.css';
    const lines = fs.readFileSync(file, 'utf8').split('\n');

    lines.forEach((line, idx) => {
        const matches = line.match(HEX_PATTERN);
        if (!matches) return;
        for (const raw of matches) {
            if (!findings.has(raw)) findings.set(raw, { css: new Set(), inline: new Set() });
            const bucket = isCss ? findings.get(raw).css : findings.get(raw).inline;
            bucket.add(`${relPath}:${idx + 1}`);
        }
    });
}

function locationsFor(value) {
    const entry = findings.get(value);
    return [...entry.css, ...entry.inline].sort();
}
function usageCountFor(value) {
    return locationsFor(value).length;
}
function renderLocations(locations) {
    return locations.join('<br>');
}

// Sort entries alphabetically by hex value for stable output.
const sortedValues = [...findings.keys()].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

const exactOfficialMatches = sortedValues.filter((v) => officialByHex.has(v.toLowerCase()));
const remaining1 = sortedValues.filter((v) => !officialByHex.has(v.toLowerCase()));

// Among remaining, find those close (but not exact) to an official token.
const closeOfficialMatches = [];
const remaining2 = [];
for (const value of remaining1) {
    let best = null;
    for (const [hex, name] of officialByHex.entries()) {
        const d = colorDistance(value, hex);
        if (d <= OFFICIAL_MATCH_THRESHOLD && (!best || d < best.distance)) {
            best = { name, hex, distance: d };
        }
    }
    if (best) {
        closeOfficialMatches.push({ value, ...best });
    } else {
        remaining2.push(value);
    }
}

// Greedy clustering of whatever's left: most-used colors become cluster representatives first.
const byUsageDesc = [...remaining2].sort((a, b) => usageCountFor(b) - usageCountFor(a));
const assigned = new Set();
const clusters = [];
for (const value of byUsageDesc) {
    if (assigned.has(value)) continue;
    const members = [value];
    assigned.add(value);
    for (const other of byUsageDesc) {
        if (assigned.has(other)) continue;
        if (colorDistance(value, other) <= CLUSTER_THRESHOLD) {
            members.push(other);
            assigned.add(other);
        }
    }
    clusters.push({ representative: value, members });
}
const multiMemberClusters = clusters.filter((c) => c.members.length > 1);
const singletons = clusters.filter((c) => c.members.length === 1).map((c) => c.representative);

function renderTable(values) {
    return values.map((value) => `| \`${value}\` | ${renderLocations(locationsFor(value))} |`).join('\n');
}

const generatedAt = new Date().toISOString().slice(0, 10);

const md = `# Project Color Map

_Auto-generated by \`scripts/audit-colors.js\` on ${generatedAt}. Do not hand-edit — rerun the script instead._

This document outlines all the colors used in the crittertrack-frontend application. The goal is to centralize all colors into \`tailwind.config.js\` to facilitate theming and dark mode implementation.

Consolidation strategy: before creating a new Tailwind token for every stray hex value, first (a) reuse an existing token when a stray color is close enough to it, and (b) merge near-duplicate stray shades onto a single new token. This keeps the palette small instead of growing 1:1 with every literal ever pasted into the code.

## 1. Official Palette (\`tailwind.config.js\`)

| Name | Value | Tailwind Utility |
| :--- | :--- | :--- |
${Object.entries(officialColors).map(([name, hex]) => `| \`${name}\` | \`${hex}\` | \`bg-${name}\`, \`text-${name}\` |`).join('\n')}

## 2. Exact Duplicates of the Official Palette

Already match a token exactly but are written as raw hex — straightforward find/replace with the Tailwind class.

| Value | Matches Token | Location(s) |
| :--- | :--- | :--- |
${exactOfficialMatches.map((v) => `| \`${v}\` | \`${officialByHex.get(v.toLowerCase())}\` | ${renderLocations(locationsFor(v))} |`).join('\n')}

## 3. Close Matches to the Official Palette (reuse existing token)

Within a small perceptual distance (Delta-E ≤${OFFICIAL_MATCH_THRESHOLD}) of an existing token — most likely the same intended color with drift from manual re-typing. Candidates to replace with the existing class rather than inventing a new one.

| Value | Closest Token | Distance | Location(s) |
| :--- | :--- | :--- | :--- |
${closeOfficialMatches.map((m) => `| \`${m.value}\` | \`${m.name}\` (${m.hex}) | ${m.distance.toFixed(1)} | ${renderLocations(locationsFor(m.value))} |`).join('\n')}

## 4. Suggested Consolidation Groups (one new token each)

Stray colors that are close to each other (Delta-E ≤${CLUSTER_THRESHOLD}) but not close to anything official — group candidates for a *single* new Tailwind token per group, picking the most-used shade as the representative.

${multiMemberClusters.map((c, i) => {
    const header = `### Group ${i + 1}: \`${c.representative}\` (${usageCountFor(c.representative)} uses) — ${c.members.length} shades to merge`;
    const rows = c.members
        .sort((a, b) => usageCountFor(b) - usageCountFor(a))
        .map((v) => `| \`${v}\` | ${usageCountFor(v)} | ${renderLocations(locationsFor(v))} |`)
        .join('\n');
    return `${header}\n\n| Value | Uses | Location(s) |\n| :--- | :--- | :--- |\n${rows}`;
}).join('\n\n')}

## 5. True One-Offs (no close relatives found)

No other stray or official color is within range — each needs its own call: promote to a new token, or leave as an intentional one-off.

| Value | Uses | Location(s) |
| :--- | :--- | :--- |
${singletons.map((v) => `| \`${v}\` | ${usageCountFor(v)} | ${renderLocations(locationsFor(v))} |`).join('\n')}

---

## Notes
- Regenerate this file after color-related changes: \`node scripts/audit-colors.js\` (run from \`crittertrack-frontend/\`).
- Scan covers hex literals only (\`#fff\`, \`#ffffff\`, with/without alpha) — \`rgb()\`/\`rgba()\`/named CSS colors are not currently captured.
- Distance is CIE76 Delta-E (Lab space), not the newer CIEDE2000 formula — good enough for spotting near-duplicates, but review borderline cases (distance close to the threshold) by eye before merging.
- Delta-E naturally compresses near white/near-black (very light or very dark colors read as "close" even with a hue tint). Large consolidation groups near those extremes may bundle multiple pale/dark hues (e.g. pale blue + pale pink + pale gray) that you may still want as separate tokens (e.g. info-bg vs error-bg vs neutral-bg) — split those by eye rather than merging blindly.
- Summary: ${sortedValues.length} distinct hex values found · ${exactOfficialMatches.length} exact official duplicates · ${closeOfficialMatches.length} close official matches · ${multiMemberClusters.length} consolidation groups (${multiMemberClusters.reduce((sum, c) => sum + c.members.length, 0)} shades) · ${singletons.length} true one-offs.
`;

fs.writeFileSync(OUTPUT_FILE, md, 'utf8');
console.log(`Wrote ${OUTPUT_FILE}`);
console.log(`${sortedValues.length} distinct hex values: ${exactOfficialMatches.length} exact official duplicates, ${closeOfficialMatches.length} close official matches, ${multiMemberClusters.length} consolidation groups (${multiMemberClusters.reduce((sum, c) => sum + c.members.length, 0)} shades), ${singletons.length} true one-offs.`);
