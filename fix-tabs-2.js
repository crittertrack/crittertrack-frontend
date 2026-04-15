#!/usr/bin/env node
// fix-tabs-2.js — handles remaining tab renaming
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const hasCRLF = content.includes('\r\n');
if (hasCRLF) content = content.replace(/\r\n/g, '\n');

let count = 0;

function replace(from, to) {
  const parts = content.split(from);
  if (parts.length - 1 === 0) { console.warn('[MISS]', JSON.stringify(from.slice(0, 60))); return; }
  console.log(`[OK x${parts.length - 1}]`, JSON.stringify(from.slice(0, 60)));
  content = parts.join(to);
  count += parts.length - 1;
}

// ── 1. VOPAD + VOAD: Lineage / Family (20-space indent, 2 occurrences expected) ──
replace(
  '                    {/* Tab 5: Lineage */}\n                    {detailViewTab === 5 && (',
  '                    {/* Tab 6: Family */}\n                    {detailViewTab === 6 && ('
);

// ── 2. VOAD navigation link: setDetailViewTab(14) → (5) for Beta Pedigree ────
replace(
  'onClick={() => setDetailViewTab(14)} className="underline hover:text-orange-600 transition">Beta Pedigree</button>',
  'onClick={() => setDetailViewTab(5)} className="underline hover:text-orange-600 transition">Beta Pedigree</button>'
);

// ── 3. AnimalForm comment fix: Tab 15 → Tab 5 ───────────────────────────────
replace(
  '                {/* Tab 15: Beta Pedigree */}\n                {(() => {',
  '                {/* Tab 5: Beta Pedigree */}\n                {(() => {'
);

// ── 4. 4th INLINE COMPONENT (40-space indent): Physical Profile 3 → Tab 4 Appearance ──
replace(
  '                                        {/* Tab 3: Physical Profile */}\n                                        {detailViewTab === 3 && (',
  '                                        {/* Tab 4: Appearance */}\n                                        {detailViewTab === 4 && ('
);

// ── 5. Identification 4 → Tab 3 ───────────────────────────────────────────────
replace(
  '                                        {/* Tab 4: Identification */}\n                                        {detailViewTab === 4 && (',
  '                                        {/* Tab 3: Identification */}\n                                        {detailViewTab === 3 && ('
);

// ── 6. Lineage 5 → Tab 6 Family ───────────────────────────────────────────────
replace(
  '                                        {/* Tab 5: Lineage */}\n                                        {detailViewTab === 5 && (',
  '                                        {/* Tab 6: Family */}\n                                        {detailViewTab === 6 && ('
);

// ── 7. Health 7 → Tab 8 (resolves conflict with Fertility already at tab 7) ──
replace(
  '                                        {/* Tab 7: Health */}\n                                        {detailViewTab === 7 && (',
  '                                        {/* Tab 8: Health */}\n                                        {detailViewTab === 8 && ('
);

// ── 8. Husbandry 8 → Tab 9 Care ───────────────────────────────────────────────
replace(
  '                                        {/* Tab 8: Husbandry */}\n                                        {detailViewTab === 8 && (',
  '                                        {/* Tab 9: Care */}\n                                        {detailViewTab === 9 && ('
);

// ── 9. Behavior 9 → Tab 10 ────────────────────────────────────────────────────
replace(
  '                                        {/* Tab 9: Behavior */}\n                                        {detailViewTab === 9 && (',
  '                                        {/* Tab 10: Behavior */}\n                                        {detailViewTab === 10 && ('
);

// ── 10. Records 10 → Tab 11 Notes ─────────────────────────────────────────────
replace(
  '                                        {/* Tab 10: Records */}\n                                        {detailViewTab === 10 && (',
  '                                        {/* Tab 11: Notes */}\n                                        {detailViewTab === 11 && ('
);

// Restore CRLF
if (hasCRLF) content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nDone. Applied ${count} replacements.`);
