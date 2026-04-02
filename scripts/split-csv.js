#!/usr/bin/env node
/**
 * split-csv.js
 * Splits a CSV file into multiple chunks, preserving the header row in each chunk.
 *
 * Usage:
 *   node scripts/split-csv.js <inputFile> [--lines <n>] [--outDir <dir>]
 *
 * Defaults: --lines 5000, --outDir same directory as input file
 */

const fs = require('fs');
const path = require('path');

// Parse args
const args = process.argv.slice(2);
const inputFile = args[0];
if (!inputFile) {
    console.error('Usage: node scripts/split-csv.js <inputFile> [--lines <n>] [--outDir <dir>]');
    process.exit(1);
}

let maxLines = 5000;
let outDir = null;

for (let i = 1; i < args.length; i++) {
    if (args[i] === '--lines' && args[i + 1]) {
        maxLines = parseInt(args[++i], 10);
    } else if (args[i] === '--outDir' && args[i + 1]) {
        outDir = args[++i];
    }
}

const absoluteInput = path.resolve(inputFile);
if (!fs.existsSync(absoluteInput)) {
    console.error(`File not found: ${absoluteInput}`);
    process.exit(1);
}

if (!outDir) {
    outDir = path.dirname(absoluteInput);
}
fs.mkdirSync(outDir, { recursive: true });

const allLines = fs.readFileSync(absoluteInput, 'utf8').split('\n');
const header = allLines[0];
const dataLines = allLines.slice(1).filter(l => l.trim() !== '');

const baseName = path.basename(absoluteInput, path.extname(absoluteInput));
const ext = path.extname(absoluteInput);

let partNum = 1;
let written = 0;

while (written < dataLines.length) {
    const chunk = dataLines.slice(written, written + maxLines);
    const outPath = path.join(outDir, `${baseName}-part${partNum}${ext}`);
    fs.writeFileSync(outPath, [header, ...chunk].join('\n'), 'utf8');
    console.log(`  Written: ${outPath} (${chunk.length} data rows)`);
    written += chunk.length;
    partNum++;
}

console.log(`\nDone. ${partNum - 1} file(s) created in ${outDir}`);
