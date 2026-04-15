#!/usr/bin/env node
// fix-hide-if-empty.js
// Removes outer section-level "hide if empty" wrappers from Health/Care/Behavior/Legal tabs.
// Strategy: within target line ranges, find lines that open a section condition
// `{(animal.FIELDS) && (` (possibly multi-line) at 28-space indent, then find
// the matching closing `)}` at 28 spaces, and remove both.

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app.jsx');
let raw = fs.readFileSync(filePath, 'utf8');
const hasCRLF = raw.includes('\r\n');
if (hasCRLF) raw = raw.replace(/\r\n/g, '\n');

const lines = raw.split('\n');

// Tab line ranges where we want to remove outer section conditions.
// These cover Health (8), Care (9), Behavior (10), Legal (13) in PAD/VOPAD/VOAD.
// Using generous ranges to be safe.
const removeRanges = [
  { label: 'PAD  Health/Care/Behavior/Legal', start: 6267, end: 6733 },
  { label: 'VOPAD Health/Care/Behavior/Legal', start: 8416, end: 8835 },
  { label: 'VOAD  Health/Care/Behavior/Legal', start: 10385, end: 10855 },
];

// Also handle 4th component (animalToView) - Health/Care/Behavior sections
// These are at 48-space indent (nested inside many wrappers).
const removeRanges4th = [
  { label: '4th-comp Health/Care/Behavior', start: 37939, end: 38165 },
];

function inRange(lineNum, ranges) {
  return ranges.some(r => lineNum >= r.start && lineNum <= r.end);
}

const INDENT28 = ' '.repeat(28);
const INDENT48 = ' '.repeat(48);

const result = [];
let skipCloser = false;   // waiting for 28-space closer
let skipCloser4th = false; // waiting for 48-space closer
let skipCount = 0;
let skipper4thCount = 0;
let openerLineAccumulating = false; // for multi-line openers (28-space)
let opener4thLineAccumulating = false; // for multi-line openers (48-space)

for (let i = 0; i < lines.length; i++) {
  const lineNum = i + 1;
  const line = lines[i];

  // ── Handle multi-line opener accumulation (28-space) ────────────────────────
  if (openerLineAccumulating) {
    if (line.trimEnd().endsWith('&& (')) {
      openerLineAccumulating = false;
      skipCloser = true;
    }
    continue; // skip ALL lines of the opener
  }

  // ── Handle multi-line opener accumulation (48-space) ────────────────────────
  if (opener4thLineAccumulating) {
    if (line.trimEnd().endsWith('&& (')) {
      opener4thLineAccumulating = false;
      skipCloser4th = true;
    }
    continue; // skip ALL lines of the opener
  }

  // ── 28-space outer conditions in PAD/VOPAD/VOAD ───────────────────────────
  if (inRange(lineNum, removeRanges)) {
    // Single-line opener: starts with {(animal. at 28-space and ends with && (
    if (line.startsWith(INDENT28 + '{(animal.') && line.trimEnd().endsWith('&& (')) {
      skipCloser = true;
      skipCount++;
      continue; // skip opener
    }
    // Multi-line opener: starts with {(animal. at 28-space but doesn't end with && (
    if (line.startsWith(INDENT28 + '{(animal.') && !line.trimEnd().endsWith('&& (')) {
      openerLineAccumulating = true;
      skipCount++;
      continue; // skip first line of multi-line opener
    }
    // Closer for 28-space: a line that is exactly '{spaces})}'
    if (skipCloser && line === INDENT28 + ')}') {
      skipCloser = false;
      continue; // skip the closer
    }
  }

  // ── 4th component: 48-space outer conditions (animalToView) ─────────────────
  if (inRange(lineNum, removeRanges4th)) {
    // Single-line opener
    if (line.startsWith(INDENT48 + '{(animalToView.') && line.trimEnd().endsWith('&& (')) {
      skipCloser4th = true;
      skipper4thCount++;
      continue;
    }
    // Multi-line opener
    if (line.startsWith(INDENT48 + '{(animalToView.') && !line.trimEnd().endsWith('&& (')) {
      opener4thLineAccumulating = true;
      skipper4thCount++;
      continue;
    }
    if (skipCloser4th && line === INDENT48 + ')}') {
      skipCloser4th = false;
      continue;
    }
  }

  result.push(line);
}

const newContent = result.join('\n');
const changed = (lines.length - result.length);
console.log(`Lines removed: ${changed} (from ${lines.length} → ${result.length})`);
console.log(`Openers removed (28sp): ${skipCount}`);
console.log(`Openers removed (40sp): ${skipper4thCount}`);

let out = newContent;
if (hasCRLF) out = out.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, out, 'utf8');
console.log('\nDone.');
