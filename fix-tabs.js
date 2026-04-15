#!/usr/bin/env node
// Script to rename/renumber all remaining tab content blocks
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings for matching, then restore
const hasCRLF = content.includes('\r\n');
if (hasCRLF) content = content.replace(/\r\n/g, '\n');

const replacements = [
  // ── SHARED ACROSS ALL VIEW COMPONENTS (PAD, VOPAD, VOAD) ─────────────────
  // These all use detailViewTab === N

  // Physical → Appearance in VOPAD + VOAD (PAD already done)
  // PAD's Physical was already renamed with unique "Appearance - Always show" context
  // VOPAD and VOAD still have {/* Tab 3: Physical */} + detailViewTab === 3
  ['                    {/* Tab 3: Physical */}\n                    {detailViewTab === 3 && (\n                        <div className="space-y-6">\n                            {/* Appearance */}',
   '                    {/* Tab 4: Appearance */}\n                    {detailViewTab === 4 && (\n                        <div className="space-y-6">\n                            {/* Appearance */}'],

  // Identification tab: 4 → 3 (all 3 views — PAD, VOPAD, VOAD all have same text)
  ['                    {/* Tab 4: Identification */}\n                    {detailViewTab === 4 && (',
   '                    {/* Tab 3: Identification */}\n                    {detailViewTab === 3 && ('],

  // Breeding → Fertility: 6 → 7 (all 3 views)
  ['                    {/* Tab 6: Breeding */}\n                    {detailViewTab === 6 && (',
   '                    {/* Tab 7: Fertility */}\n                    {detailViewTab === 7 && ('],

  // Health: 7 → 8 (all 3 views)
  ['                    {/* Tab 7: Health */}\n                    {detailViewTab === 7 && (',
   '                    {/* Tab 8: Health */}\n                    {detailViewTab === 8 && ('],

  // Husbandry/Care: 8 → 9 (all 3 views)
  ['                    {/* Tab 8: Husbandry */}\n                    {detailViewTab === 8 && (',
   '                    {/* Tab 9: Care */}\n                    {detailViewTab === 9 && ('],

  // Behavior: 9 → 10 (all 3 views)
  ['                    {/* Tab 9: Behavior */}\n                    {detailViewTab === 9 && (',
   '                    {/* Tab 10: Behavior */}\n                    {detailViewTab === 10 && ('],

  // Records → Notes: 10 → 11 (all 3 views)
  ['                    {/* Tab 10: Records */}\n                    {detailViewTab === 10 && (',
   '                    {/* Tab 11: Notes */}\n                    {detailViewTab === 11 && ('],

  // End of Life: 11 → 14 (all 3 views)
  // IMPORTANT: VOAD Beta Pedigree must already be at === 14 or we create a conflict
  // But VOAD Beta Pedigree is handled BELOW (changing from 14 → 5 using the IIFE comment)
  // We do the Beta Pedigree change FIRST before End of Life change (order matters in array)

  // ── VOPAD SPECIFIC ────────────────────────────────────────────────────────
  // VOPAD Tab 16 Beta Pedigree → Tab 5
  ['{/* Tab 16: Beta Pedigree */}\n                {detailViewTab === 16 && (() => {',
   '{/* Tab 5: Beta Pedigree */}\n                {detailViewTab === 5 && (() => {'],

  // VOPAD useEffect: detailViewTab !== 16 → !==5 (Beta Pedigree enrichment)
  // This appears in both PAD and VOPAD; PAD was already changed (was '!==16' → '!==5')
  // Actually PAD's was changed too: let's check. 
  // Actually PAD's Beta Pedigree block was changed to === 5 by batch 2.
  // The useEffect at line 4302 says: if (detailViewTab !== 16) return;
  // The useEffect at line 7161 says: if (detailViewTab !== 16) return;
  // Both need to become !== 5.
  // But they're identical strings! Let them both change via global replace:
  // Actually the PAD one is in a different function context. Let me handle with .replace (global)

  // ── VOAD SPECIFIC ─────────────────────────────────────────────────────────
  // VOAD Tab 14 Beta Pedigree → Tab 5 (MUST come before End of Life change to avoid conflict)
  ['{/* Tab 14: Beta Pedigree */}\n                {detailViewTab === 14 && (() => {',
   '{/* Tab 5: Beta Pedigree */}\n                {detailViewTab === 5 && (() => {'],

  // Now safe to change End of Life 11 → 14 (VOAD Beta Pedigree is no longer at 14)
  // End of Life: 11 → 14 (all 3 views — PAD, VOPAD, VOAD)
  // Note: The comment text differs slightly: PAD/VOPAD use "})\n                    {/* Tab 11: End of Life */" inline
  // and VOAD uses standard "\n                    {/* Tab 11: End of Life */"
  // Let's handle both patterns:
  [')}                    {/* Tab 11: End of Life */}\n                    {detailViewTab === 11 && (',
   ')}                    {/* Tab 14: End of Life */}\n                    {detailViewTab === 14 && ('],

  // Also handle standard form (VOAD's version which has a newline before the comment):
  ['\n                    {/* Tab 11: End of Life */}\n                    {detailViewTab === 11 && (',
   '\n                    {/* Tab 14: End of Life */}\n                    {detailViewTab === 14 && ('],

  // ── ANIMAL FORM SPECIFIC ──────────────────────────────────────────────────
  // AnimalForm uses activeTab (not detailViewTab), and has unique comments

  // Physical Profile → Appearance: 3 → 4
  ['{/* Tab 3: Physical Profile */}\n                {activeTab === 3 && (',
   '{/* Tab 4: Appearance */}\n                {activeTab === 4 && ('],

  // Identification: 4 → 3
  ['{/* Tab 4: Identification */}\n                {activeTab === 4 && (',
   '{/* Tab 3: Identification */}\n                {activeTab === 3 && ('],

  // Lineage & Offspring → Family: 5 → 6
  ['{/* Tab 5: Lineage & Offspring */}\n                {activeTab === 5 && (',
   '{/* Tab 6: Family */}\n                {activeTab === 6 && ('],

  // Reproduction & Breeding → Fertility: 6 → 7
  ['{/* Tab 6: Reproduction & Breeding */}\n                {activeTab === 6 && (',
   '{/* Tab 7: Fertility */}\n                {activeTab === 7 && ('],

  // Health: 7 → 8
  ['{/* Tab 7: Health */}\n                {activeTab === 7 && (',
   '{/* Tab 8: Health */}\n                {activeTab === 8 && ('],

  // Animal Care → Care: 8 → 9
  ['{/* Tab 8: Animal Care */}\n                {activeTab === 8 && (',
   '{/* Tab 9: Care */}\n                {activeTab === 9 && ('],

  // Behavior & Welfare → Behavior: 9 → 10
  ['{/* Tab 9: Behavior & Welfare */}\n                {activeTab === 9 && (',
   '{/* Tab 10: Behavior */}\n                {activeTab === 10 && ('],

  // Records & Notes → Notes: 10 → 11
  ['{/* Tab 10: Records & Notes */}\n                {activeTab === 10 && (',
   '{/* Tab 11: Notes */}\n                {activeTab === 11 && ('],

  // End of Life & Legal → End of Life: 11 → 14
  ['{/* Tab 11: End of Life & Legal */}\n                {activeTab === 11 && (',
   '{/* Tab 14: End of Life */}\n                {activeTab === 14 && ('],

  // Gallery: 14 → 15 (AnimalForm has unique comment "Tab 14: Gallery")
  ['{/* Tab 14: Gallery */}\n                {activeTab === 14 && (',
   '{/* Tab 15: Gallery */}\n                {activeTab === 15 && ('],

  // Beta Pedigree IIFE in AnimalForm: activeTab !== 15 → !== 5
  ['if (activeTab !== 15) return ctcModal;',
   'if (activeTab !== 5) return ctcModal;'],

  // ── USEFFECTS AND NAVIGATION LINKS ────────────────────────────────────────
  // Beta Pedigree enrichment useEffect in PAD and VOPAD: !== 16 → !== 5
  ['if (detailViewTab !== 16) return;\n        let cancelled = false;',
   'if (detailViewTab !== 5) return;\n        let cancelled = false;'],

  // Logs fetch useEffect in PAD: !== 14 → !== 16 (fixing existing bug AND renaming)
  ['if (detailViewTab !== 14 || animalLogs !== null || !animal?.id_public || !authToken) return;',
   'if (detailViewTab !== 16 || animalLogs !== null || !animal?.id_public || !authToken) return;'],

  // Beta Pedigree enrichment useEffect in VOAD: !== 14 → !== 5
  ['if (detailViewTab !== 14) return;\n        let cancelled = false;',
   'if (detailViewTab !== 5) return;\n        let cancelled = false;'],

  // Navigation links: setDetailViewTab(16) → setDetailViewTab(5) (Family/Lineage tab link)
  ['setDetailViewTab(16)', 'setDetailViewTab(5)'],
  // Navigation in VOAD was: setDetailViewTab(14) for Beta Pedigree
  // But we already changed VOAD Beta Pedigree to 5, so this link should point to 5
  // BUT setDetailViewTab(14) now means End of Life, not Beta Pedigree!
  // The navigation link in Lineage tab that said "Pedigree chart available on Beta Pedigree tab"
  // was at line 9878: setDetailViewTab(14). Need to change to setDetailViewTab(5).
  // Let's specifically find this pattern (it's inside a <button> in the Lineage section):
  // "Pedigree chart available on the <button onClick={() => setDetailViewTab(14)}"
  ['setDetailViewTab(14)" className="underline hover:text-orange-600 transition">Beta Pedigree</button>',
   'setDetailViewTab(5)" className="underline hover:text-orange-600 transition">Beta Pedigree</button>'],

  // Tutorial target data attribute in AnimalForm - update old IDs to new
  ['tab.id === 3 ? \'physical-tab\' : tab.id === 4 ? \'identification-tab\' : tab.id === 5 ? \'lineage-tab\' : tab.id === 6 ? \'breeding-tab\' : tab.id === 7 ? \'health-tab\' : tab.id === 8 ? \'husbandry-tab\' : tab.id === 9 ? \'behavior-tab\' : tab.id === 10 ? \'records-tab\' : tab.id === 11 ? \'end-of-life-tab\' : tab.id === 12 ? \'show-tab\'',
   'tab.id === 3 ? \'identification-tab\' : tab.id === 4 ? \'appearance-tab\' : tab.id === 5 ? \'beta-pedigree-tab\' : tab.id === 6 ? \'family-tab\' : tab.id === 7 ? \'fertility-tab\' : tab.id === 8 ? \'health-tab\' : tab.id === 9 ? \'care-tab\' : tab.id === 10 ? \'behavior-tab\' : tab.id === 11 ? \'notes-tab\' : tab.id === 12 ? \'show-tab\''],
];

let changeCount = 0;
for (const [from, to] of replacements) {
  const occurrences = content.split(from).length - 1;
  if (occurrences === 0) {
    console.warn(`  [WARN] Not found: ${from.substring(0, 60).replace(/\n/g, '\\n')}...`);
  } else {
    content = content.split(from).join(to);
    console.log(`  [OK x${occurrences}] ${from.substring(0, 60).replace(/\n/g, '\\n')}...`);
    changeCount += occurrences;
  }
}

// Restore CRLF
if (hasCRLF) content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nDone. Applied ${changeCount} replacements.`);
