const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Founder line definitions (IDs of founders)
const FOUNDER_LINES = [
  { key: 'legacy_red', name: 'Legacy Red Line', founders: ['CTC37'] },
  { key: 'polish', name: 'Polish Line', founders: ['CTC31'] },
  { key: 'legacy_brindle', name: 'Legacy Brindle Line', founders: ['CTC191', 'CTC200'] },
  { key: 'legacy_merle_1', name: 'Legacy Merle Line 1', founders: ['CTC268'] },
  { key: 'legacy_merle_2', name: 'Legacy Merle Line 2', founders: ['CTC196'] },
  { key: 'banded', name: 'Banded Line', founders: ['CTC269'] },
  { key: 'quattro', name: 'Quattro Line', founders: ['CTC61', 'CTC330'] },
  { key: 'pawfriends', name: 'Pawfriends Line', founders: ['CTC184', 'CTC105', 'CTC104', 'CTC100', 'CTC98', 'CTC76', 'CTC99'] },
  { key: 'new_merle', name: 'New Merle Line', founders: ['CTC265'] },
  { key: 'broken', name: 'Broken Line', founders: ['CTC272'] }
];

const HYBRID_LINES = [
  { key: 'daikon', name: 'Daikon Line', requiresAll: ['quattro', 'pawfriends'] },
  { key: 'gianni', name: 'Gianni Line', requiresAll: ['legacy_merle_1', 'banded'] }
];

function listInputFiles(dataDir) {
  return fs
    .readdirSync(dataDir)
    .filter((f) => /^family-tree-\d{4}-\d{2}-\d{2}-part\d+\.csv$/i.test(f))
    .sort((a, b) => {
      const an = Number(a.match(/part(\d+)\.csv$/i)?.[1] || 0);
      const bn = Number(b.match(/part(\d+)\.csv$/i)?.[1] || 0);
      return an - bn;
    });
}

function loadRowsFromSplits(dataDir) {
  const files = listInputFiles(dataDir);
  if (files.length === 0) throw new Error(`No split files found in ${dataDir}`);

  const rows = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
    const parsed = parse(content, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      bom: true
    });
    for (const r of parsed) rows.push(r);
  }
  return rows;
}

function normalize(val) {
  const s = (val ?? '').toString().trim();
  return s === '' ? '' : s;
}

function buildIndex(rows) {
  const byId = new Map();
  for (const r of rows) {
    const id = normalize(r['ID']);
    if (!id) continue;

    // Prefer the most complete row if duplicates occur across splits
    const existing = byId.get(id);
    const next = {
      id,
      fullName: normalize(r['Full Name']),
      owner: normalize(r['Owner CTU ID']),
      owned: normalize(r['Owned']),
      sire: normalize(r['Sire ID']),
      dam: normalize(r['Dam ID'])
    };
    if (!existing) {
      byId.set(id, next);
    } else {
      // merge: keep non-empty values from either
      byId.set(id, {
        id,
        fullName: existing.fullName || next.fullName,
        owner: existing.owner || next.owner,
        owned: existing.owned || next.owned,
        sire: existing.sire || next.sire,
        dam: existing.dam || next.dam
      });
    }
  }
  return byId;
}

function ancestorsOf(byId, startId) {
  const seen = new Set();
  const stack = [startId];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || seen.has(cur)) continue;
    seen.add(cur);
    const node = byId.get(cur);
    if (!node) continue;
    if (node.sire) stack.push(node.sire);
    if (node.dam) stack.push(node.dam);
  }
  return seen;
}

function computeFounderTags(byId, id) {
  const anc = ancestorsOf(byId, id);

  const tags = new Map(); // key -> boolean
  for (const line of FOUNDER_LINES) {
    const hit = line.founders.some((fid) => anc.has(fid));
    if (hit) tags.set(line.key, true);
  }

  // hybrids
  for (const hybrid of HYBRID_LINES) {
    const ok = hybrid.requiresAll.every((k) => tags.get(k));
    if (ok) tags.set(hybrid.key, true);
  }

  // return ordered display names
  const display = [];
  for (const line of FOUNDER_LINES) if (tags.get(line.key)) display.push(line.name);
  for (const hybrid of HYBRID_LINES) if (tags.get(hybrid.key)) display.push(hybrid.name);
  return display;
}

function csvEscape(value) {
  const s = (value ?? '').toString();
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(filePath, header, rows) {
  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(','));
  }
  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8');
}

function main() {
  const dataDir = path.join(__dirname, '..', 'data');
  const rows = loadRowsFromSplits(dataDir);
  const byId = buildIndex(rows);

  // Build output for all animals we have rows for
  const all = [];
  for (const [id, node] of byId.entries()) {
    const founderLines = computeFounderTags(byId, id).join('; ');
    all.push([
      id,
      node.fullName,
      node.owner,
      node.owned,
      founderLines
    ]);
  }

  // stable sort by ID
  all.sort((a, b) => a[0].localeCompare(b[0]));

  const outAll = path.join(dataDir, 'founder-lines-all.csv');
  writeCsv(outAll, ['ID', 'Full Name', 'Owner CTU ID', 'Owned', 'Founder Lines'], all);

  const current = all.filter((r) => r[2] === 'CTU2' && r[3] === 'Yes');
  const outCurrent = path.join(dataDir, 'founder-lines-ctu2-current.csv');
  writeCsv(outCurrent, ['ID', 'Full Name', 'Owner CTU ID', 'Owned', 'Founder Lines'], current);

  console.log(`Wrote ${outAll} (${all.length} rows)`);
  console.log(`Wrote ${outCurrent} (${current.length} rows)`);
}

main();
