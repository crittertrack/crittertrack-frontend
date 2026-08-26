import React, { useState, useMemo, useEffect } from 'react';
import { Target, Dna, Loader2, Search, Settings, Palette, PlusCircle, X, ChevronUp, ChevronDown } from 'lucide-react';
import { GENE_LOCI as MOUSE_GENE_LOCI } from '../GeneticsCalculator';
import { matchFancyRatPhenotype, RAT_GENE_LOCI as SHARED_RAT_GENE_LOCI } from '../../data/fancyRatPhenotypeRules';
import InfoButton from '../shared/InfoButton';

// ---------------------------------------------------------------------------
// Fancy Rat trait chips — generated directly from fancyRatPhenotypeRules.js so
// this page can never drift out of sync with the real genetics rules again.
// Multiple genotype combinations that produce the *same* phenotype label
// (e.g. "Badger" from both White Spot and Headspot) are automatically merged
// into a single dropdown entry backed by all matching alternatives — the
// probability calculation considers every alternative, not just one.
// ---------------------------------------------------------------------------
const RAT_BASE_GENOTYPE = { A: 'a/a', C: 'C/C' };
const RAT_LETHAL_EXCLUSIONS = { H: ['Hre/Hre'], Ws: ['Ws/Ws'], Mx: ['Mx/Mx'], Pe: ['Pe/Pe'] };

function ratCombosFor(locus) {
  const excluded = new Set(RAT_LETHAL_EXCLUSIONS[locus] || []);
  return SHARED_RAT_GENE_LOCI[locus].combinations.filter(c => !excluded.has(c));
}

function ratCartesian(lociMap) {
  let patches = [{}];
  for (const [locus, combos] of Object.entries(lociMap)) {
    const next = [];
    for (const patch of patches) for (const combo of combos) next.push({ ...patch, [locus]: combo });
    patches = next;
  }
  return patches;
}

function stripRatColorPrefix(phenotype) {
  return (phenotype || '').replace(/^Black\s*/, '').trim();
}

function groupRatPatchesByLabel(patches, groups, { includeEmpty = false } = {}) {
  for (const patch of patches) {
    const result = matchFancyRatPhenotype({ ...RAT_BASE_GENOTYPE, ...patch });
    const label = stripRatColorPrefix(result?.phenotype);
    const key = label || (includeEmpty ? 'Self' : null);
    if (key === null) continue;
    if (!groups[key]) groups[key] = [];
    groups[key].push(patch);
  }
  return groups;
}

// Drop alternatives that are a strict superset of a simpler alternative already
// producing the same label (e.g. an unrelated locus tagging along for the ride
// without actually affecting the phenotype) — keeps the probability calculation
// honest and avoids flagging pairings as "unconfirmed" over irrelevant loci.
function pruneRedundantRatAlternatives(groups) {
  for (const label of Object.keys(groups)) {
    const patches = groups[label];
    groups[label] = patches.filter(p => {
      const pKeys = Object.keys(p);
      return !patches.some(q => {
        if (q === p) return false;
        const qKeys = Object.keys(q);
        if (qKeys.length >= pKeys.length) return false;
        return qKeys.every(k => p[k] === q[k]);
      });
    });
  }
  return groups;
}

function ratDefsFromGroups(groups, group, idPrefix) {
  return Object.entries(groups).map(([label, alternatives]) => ({
    id: `${idPrefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
    label,
    group,
    alternatives,
  }));
}

function buildRatMarkingTraitDefs() {
  const hCombos = ratCombosFor('H');
  const groups = {};
  groupRatPatchesByLabel(ratCartesian({ H: hCombos }), groups, { includeEmpty: true });
  groupRatPatchesByLabel(ratCartesian({ Dal: ['Dal/Dal', 'Dal/dal'], H: hCombos }), groups);
  groupRatPatchesByLabel(ratCartesian({ Wh: ['wh/wh'], H: hCombos }), groups);
  groupRatPatchesByLabel(ratCartesian({ Ro: ['ro/ro'], H: hCombos }), groups);
  groupRatPatchesByLabel(ratCartesian({ Ws: ['Ws/w'], H: hCombos }), groups);
  groupRatPatchesByLabel(ratCartesian({ Hs: ['hs/hs'], H: hCombos }), groups);
  groupRatPatchesByLabel(ratCartesian({ Dw: ['Dw/Dw', 'Dw/dw'], H: hCombos }), groups);
  groupRatPatchesByLabel([{ Sf: 'sf/sf' }], groups);
  groupRatPatchesByLabel([{ Ma: 'Ma/Ma' }, { Ma: 'Ma/ma' }], groups);
  pruneRedundantRatAlternatives(groups);
  return ratDefsFromGroups(groups, 'Marking', 'rat-marking');
}

function buildRatCoatTraitDefs() {
  const groups = {};
  const reCombos = ['Re/Re', 'Re/re'];
  const veCombos = ['Ve/Ve', 'Ve/ve'];
  groupRatPatchesByLabel(ratCartesian({ Re: reCombos }), groups);
  groupRatPatchesByLabel(ratCartesian({ Ve: veCombos }), groups);
  groupRatPatchesByLabel(ratCartesian({ Re: reCombos, Ve: veCombos }), groups);
  groupRatPatchesByLabel(ratCartesian({ Sm: ['Sm/Sm', 'Sm/sm'] }), groups);
  groupRatPatchesByLabel(ratCartesian({ Lu: ['Lu/Lu', 'Lu/lu'] }), groups);
  groupRatPatchesByLabel(ratCartesian({ Sy: ['Sy/Sy', 'Sy/sy'] }), groups);
  groupRatPatchesByLabel(ratCartesian({ Sk: ['Sk/Sk', 'Sk/sk'] }), groups);
  groupRatPatchesByLabel([{ sa: 'sa/sa' }], groups);
  groupRatPatchesByLabel([{ hrl: 'hrl/hrl' }], groups);
  groupRatPatchesByLabel([{ hr: 'hr/hr' }], groups);
  groupRatPatchesByLabel([{ nz: 'nz/nz' }], groups);
  groupRatPatchesByLabel([{ fz: 'fz/fz' }], groups);
  groupRatPatchesByLabel([{ pw: 'pw/pw' }], groups);
  pruneRedundantRatAlternatives(groups);
  return ratDefsFromGroups(groups, 'Coat & Texture', 'rat-coat');
}

function buildRatEarTraitDefs() {
  const groups = {};
  groupRatPatchesByLabel([{ Du: 'du/du' }], groups);
  return ratDefsFromGroups(groups, 'Ear Type', 'rat-ear');
}

function buildRatBodyTraitDefs() {
  const groups = {};
  groupRatPatchesByLabel([{ dr: 'dr/dr' }], groups);
  groupRatPatchesByLabel([{ Mx: 'Mx/mx' }], groups);
  return ratDefsFromGroups(groups, 'Body Type', 'rat-body');
}

function buildRatModifierTraitDefs() {
  const groups = {};
  groupRatPatchesByLabel([{ M: 'm/m', Pe: 'Pe/pe' }], groups);
  groupRatPatchesByLabel([{ M: 'm/m', Me: 'Me/me' }, { M: 'm/m', Me: 'Me/Me' }], groups);
  return ratDefsFromGroups(groups, 'Modifiers', 'rat-modifier');
}

const RAT_COLOR_TRAIT_DEFS = [
  { id: 'rat-black',         label: 'Black',               group: 'Base Color — Black',  alternatives: [{ A: 'a/a' }] },
  { id: 'rat-chocolate',     label: 'Chocolate',           group: 'Base Color — Black',  alternatives: [{ A: 'a/a', B: 'b/b' }] },
  { id: 'rat-russian-blue',  label: 'Russian Blue',        group: 'Base Color — Black',  alternatives: [{ A: 'a/a', D: 'd/d' }] },
  { id: 'rat-american-blue', label: 'American Blue',       group: 'Base Color — Black',  alternatives: [{ A: 'a/a', G: 'g/g' }] },
  { id: 'rat-mink',          label: 'Mink',                group: 'Base Color — Black',  alternatives: [{ A: 'a/a', M: 'm/m' }] },
  { id: 'rat-champagne',     label: 'Champagne',           group: 'Base Color — Black',  alternatives: [{ A: 'a/a', P: 'p/p' }] },
  { id: 'rat-beige',         label: 'Beige',               group: 'Base Color — Black',  alternatives: [{ A: 'a/a', R: 'r/r' }] },
  { id: 'rat-agouti',        label: 'Agouti',              group: 'Base Color — Agouti', alternatives: [{ A: 'A/A' }] },
  { id: 'rat-choc-agouti',   label: 'Chocolate Agouti',    group: 'Base Color — Agouti', alternatives: [{ A: 'A/A', B: 'b/b' }] },
  { id: 'rat-rub-agouti',    label: 'Russian Blue Agouti', group: 'Base Color — Agouti', alternatives: [{ A: 'A/A', D: 'd/d' }] },
  { id: 'rat-opal',          label: 'Opal',                group: 'Base Color — Agouti', alternatives: [{ A: 'A/A', G: 'g/g' }] },
  { id: 'rat-cinnamon',      label: 'Cinnamon',            group: 'Base Color — Agouti', alternatives: [{ A: 'A/A', M: 'm/m' }] },
  { id: 'rat-silver-fawn',   label: 'Silver Fawn',         group: 'Base Color — Agouti', alternatives: [{ A: 'A/A', P: 'p/p' }] },
  { id: 'rat-topaz',         label: 'Topaz',               group: 'Base Color — Agouti', alternatives: [{ A: 'A/A', R: 'r/r' }] },
  { id: 'rat-albino',        label: 'Albino',              group: 'C-locus & Color Modifier', alternatives: [{ C: 'c/c' }] },
  { id: 'rat-himalayan',     label: 'Himalayan',           group: 'C-locus & Color Modifier', alternatives: [{ C: 'ch/c' }] },
  { id: 'rat-siamese',       label: 'Siamese',             group: 'C-locus & Color Modifier', alternatives: [{ C: 'ch/ch' }] },
  { id: 'rat-tonkinese',     label: 'Tonkinese',           group: 'C-locus & Color Modifier', alternatives: [{ C: 'ct/ct' }] },
  { id: 'rat-marten',        label: 'Ivory Marten',        group: 'C-locus & Color Modifier', alternatives: [{ C: 'cm/c' }] },
  { id: 'rat-burmese',       label: 'Burmese',             group: 'C-locus & Color Modifier', alternatives: [{ Bu: 'Bu/bu', C: 'ct/ct' }] },
  { id: 'rat-sable',         label: 'Sable',               group: 'C-locus & Color Modifier', alternatives: [{ Bu: 'Bu/Bu', C: 'ct/ct' }] },
];

const RAT_TRAIT_DEFS = [
  ...RAT_COLOR_TRAIT_DEFS,
  ...buildRatMarkingTraitDefs(),
  ...buildRatCoatTraitDefs(),
  ...buildRatEarTraitDefs(),
  ...buildRatBodyTraitDefs(),
  ...buildRatModifierTraitDefs(),
];

const TARGET_OUTCOME_TRAIT_CHIPS = {
    'Fancy Mouse': [
        // Base Colors
        { id: 'black',              label: 'Black',             code: 'a/a',            group: 'Base Color' },
        { id: 'agouti',             label: 'Agouti',            code: 'A/-',            group: 'Base Color' },
        { id: 'am-brindle',         label: 'Am. Brindle',       code: 'Avy/-',          group: 'Base Color' },
        { id: 'dom-red',            label: 'Dominant Red',      code: 'Ay/-',           group: 'Base Color' },

        // Tan, Fox & Shaded
        { id: 'tan',                label: 'Tan',               code: 'any + −/at',     group: 'Tan, Fox & Shaded' },
        { id: 'fox',                label: 'Fox',               code: 'any + −/at + C',       group: 'Tan, Fox & Shaded' },
        { id: 'sable',              label: 'Sable',             code: 'Ay/- + −/at + U/- or -/at + e/e + U/*', group: 'Tan, Fox & Shaded' },
        { id: 'Snowtiger',          label: 'Snowtiger',         code: 'Avy/- + C', group: 'Tan, Fox & Shaded' },
        { id: 'marten sable',        label: 'Marten Sable',     code: 'Ay/- + −/at + cch/cch + U/- or -/at + cch/cch + e/e + U/*', group: 'Tan, Fox & Shaded' },

        // Brown Dilutes
        { id: 'chocolate',          label: 'Chocolate',         code: 'b/b',            group: 'Brown Dilute' },
        { id: 'cinnamon',           label: 'Cinnamon',          code: 'A/- b/b',        group: 'Brown Dilute' },

        // Albino & Dilution
        { id: 'albino',             label: 'Albino',            code: 'c/c',            group: 'Albino & Dilution' },
        { id: 'himalayan',          label: 'Himalayan',         code: 'c/ch',           group: 'Albino & Dilution' },
        { id: 'bone',               label: 'Bone',              code: 'c/ce',           group: 'Albino & Dilution' },
        { id: 'siamese',            label: 'Siamese',           code: 'ch/ch',          group: 'Albino & Dilution' },
        { id: 'burmese',            label: 'Burmese',           code: 'ch/cch',         group: 'Albino & Dilution' },
        { id: 'stone',              label: 'Stone',             code: 'c/cch',          group: 'Albino & Dilution' },
        { id: 'beige',              label: 'Beige',             code: 'ce/ce',          group: 'Albino & Dilution' },
        { id: 'colorpoint-beige',   label: 'Colorpoint Beige',  code: 'ch/ce',          group: 'Albino & Dilution' },
        { id: 'mock-choc',          label: 'Mock Chocolate',    code: 'ce/cch',         group: 'Albino & Dilution' },
        { id: 'sepia',              label: 'Sepia',             code: 'a/a cch/cch',    group: 'Albino & Dilution' },
        { id: 'silver-agouti',      label: 'Silver Agouti',     code: 'A/- cch/cch',    group: 'Albino & Dilution' },
        

        // Blue Dilutes
        { id: 'blue',               label: 'Blue',              code: 'd/d',            group: 'Blue Dilute' },
        { id: 'blue-agouti',        label: 'Blue Agouti',       code: 'A/- d/d',        group: 'Blue Dilute' },
        { id: 'blue-brindle',       label: 'Blue Brindle',      code: 'Avy/- p/p',      group: 'Blue Dilute' },
        { id: 'Dominant Amber',     label: 'Amber (Dom.)',      code: 'Ay/- d/d',       group: 'Blue Dilute' },
        { id: 'Recessive Amber',    label: 'Amber (Rec.)',      code: 'd/d e/e',        group: 'Blue Dilute' },

        // Red Dilute
        { id: 'rec-red',            label: 'Recessive Red',     code: 'e/e',            group: 'Red Dilute' },

        // Leaden
        { id: 'Leaden',            label: 'Leaden',            code: 'ln/ln',          group: 'Leaden' },

        // Pink Eye Dilutes
        { id: 'dove',               label: 'Dove',              code: 'p/p',            group: 'Pink Eye Dilute' },
        { id: 'argente',            label: 'Argente',           code: 'A/- p/p',        group: 'Pink Eye Dilute' },

        // Dilutes — Double/Triple
        { id: 'lilac',              label: 'Lilac',             code: 'b/b d/d',        group: 'Dilutes — Double/Triple' },
        { id: 'champagne',          label: 'Champagne',         code: 'b/b p/p',        group: 'Dilutes — Double/Triple' },
        { id: 'silver',             label: 'Silver',            code: 'd/d p/p',        group: 'Dilutes — Double/Triple' },
        { id: 'lavender',           label: 'Lavender',          code: 'b/b d/d p/p',    group: 'Dilutes — Double/Triple' },
        { id: 'cinnamon-argente',   label: 'Cinnamon Argente',  code: 'A/- b/b p/p',   group: 'Dilutes — Double/Triple' },
    
        // Pied
        { id: 'pied',               label: 'Pied',              code: 's/s',            group: 'Pied' },
        { id: 'Hereford',           label: 'Hereford',          code: 's/s+',           group: 'Pied' },
        { id: 'Dutch',              label: 'Dutch',             code: 's/s+',           group: 'Pied' },
        { id: 'Berkshire',          label: 'Berkshire',         code: 's/s+',           group: 'Pied' },

        // Dominant Spotting
        { id: 'variegated',         label: 'Variegated',        code: 'W/w',            group: 'Dominant Spotting' },
        { id: 'banded',             label: 'Banded',            code: 'Wsh/w',          group: 'Dominant Spotting' },
        { id: 'Rumpwhite',          label: 'Rumpwhite',         code: 'Rw/w',           group: 'Dominant Spotting' },

        // Xbrindle
        { id: 'xbrindle',           label: 'Xbrindle',          code: 'Mobr/mobr',      group: 'Xbrindle' },
       
        // Splashed
        { id: 'splashed',           label: 'Splashed',          code: 'Spl/spl',        group: 'Splashed' },

        // Merle
        { id: 'merle',              label: 'Merle',             code: 'rn/rn',          group: 'Merle' },

        // Pearl
        { id: 'pearl',              label: 'Pearl',             code: 'si/si',          group: 'Pearl' },

        // Umbrous
        { id: 'umbrous',            label: 'Umbrous',           code: 'U/-',            group: 'Umbrous' },

        // Shorthair/Longhair
        { id: 'shorthair',          label: 'Shorthair',         code: 'Go/-',           group: 'Shorthair/Longhair' },
        { id: 'longhair',           label: 'Longhair',          code: 'go/go',          group: 'Shorthair/Longhair' },

        // Satin
        { id: 'satin',              label: 'Satin',             code: 'sa/sa',          group: 'Satin' },

        // Astrex & Texel
        { id: 'astrex',             label: 'Astrex',            code: 'Re/-',           group: 'Astrex & Texel' },
        { id: 'texel',              label: 'Texel',             code: 'Re/- go/go',     group: 'Astrex & Texel' },

        // Rosette
        { id: 'rosette',            label: 'Rosette',           code: 'rst/rst',        group: 'Rosette' },

        // Fuzz
        { id: 'fuzz',               label: 'Fuzz',              code: 'fz/fz',          group: 'Fuzz' },

        // Dominant Hairless
        { id: 'dom-hairless',       label: 'Dominant Hairless', code: 'Nu/-',           group: 'Dominant Hairless' },
    ],
    'Fancy Rat': RAT_TRAIT_DEFS,
};

const getLociForSpecies = (species) => {
  if (species === 'Fancy Rat') return SHARED_RAT_GENE_LOCI;
  return MOUSE_GENE_LOCI; // Default to mouse
};

const TraitSelector = ({ species, selectedTraits, onTraitChange, disabled }) => {
  const traitGroups = useMemo(() => {
    const chips = TARGET_OUTCOME_TRAIT_CHIPS[species] || [];
    const groups = {};
    chips.forEach(chip => {
      if (!groups[chip.group]) {
        groups[chip.group] = [];
      }
      groups[chip.group].push(chip);
    });
    return Object.entries(groups).map(([groupName, chips]) => ({ groupName, chips }));
  }, [species]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {traitGroups.map(({ groupName, chips }) => (
        <div key={groupName}>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">{groupName}</label>
          <select value={selectedTraits[groupName] || ''} onChange={(e) => onTraitChange(groupName, e.target.value)} disabled={disabled} className="w-full p-2 border border-gray-300 dark:border-dark-text rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text">
            <option value="">- None -</option>
            {chips.map(chip => (<option key={chip.id} value={chip.id}>{chip.label}</option>))}
          </select>
        </div>
      ))}
    </div>
  );
};

const parseGeneticCode = (codeString, species) => {
  if (!codeString) return {};
  const genotype = {};
  const parts = codeString.trim().split(/[ \t]+/);
  const ALL_LOCI = getLociForSpecies(species);

  for (const part of parts) {
    if (!part.includes('/')) continue;

    let partFound = false;
    for (const [locus, data] of Object.entries(ALL_LOCI)) {
      if (data.combinations.includes(part)) {
        genotype[locus] = part.split('/').sort();
        partFound = true;
        break;
      }
    }

    if (partFound) continue;

    const [a1, a2] = part.split('/');
    if (a1 && a2) {
      const reversedPart = `${a2}/${a1}`;
      for (const [locus, data] of Object.entries(ALL_LOCI)) {
        if (data.combinations.includes(reversedPart)) {
          genotype[locus] = reversedPart.split('/').sort();
          break;
        }
      }
    }
  }
  return genotype;
};

const buildPrototypeGenotypeFromTraits = (selectedTraits, species = 'Fancy Mouse') => {
    const genotype = {};
    const assumptions = [];

    if (species === 'Fancy Rat') {
        const selectedAlternatives = [];
        selectedTraits.forEach((id) => {
            const def = RAT_TRAIT_DEFS.find(d => d.id === id);
            if (!def) return;
            selectedAlternatives.push({ id, label: def.label, alternatives: def.alternatives });
            // Merge the first alternative into the flat genotype — used only as a representative
            // example (e.g. for anything that just wants "a" matching genotype), never for the
            // actual probability calculation, which considers every alternative via
            // `selectedAlternatives` instead.
            Object.assign(genotype, def.alternatives[0]);
        });
        return { genotype, selectedAlternatives, assumptions };
    }

    selectedTraits.forEach((id) => {
        switch (id) {
            // Base Color — Black series
            case 'black':            genotype.A  = 'a/a';     break;
            case 'tan':              genotype.A  = 'at/a';    break;
            case 'chocolate':        genotype.A  = 'a/a';  genotype.B = 'b/b'; break;
            case 'blue':             genotype.A  = 'a/a';  genotype.D = 'd/d'; break;
            case 'dove':             genotype.A  = 'a/a';  genotype.P = 'p/p'; break;
            case 'lilac':            genotype.A  = 'a/a';  genotype.B = 'b/b'; genotype.D = 'd/d'; break;
            case 'champagne':        genotype.A  = 'a/a';  genotype.B = 'b/b'; genotype.P = 'p/p'; break;
            case 'silver':           genotype.A  = 'a/a';  genotype.D = 'd/d'; genotype.P = 'p/p'; break;
            case 'lavender':         genotype.A  = 'a/a';  genotype.B = 'b/b'; genotype.D = 'd/d'; genotype.P = 'p/p'; break;
            // Base Color — Agouti series
            case 'agouti':           genotype.A  = 'A/A';     break;
            case 'cinnamon':         genotype.A  = 'A/A';  genotype.B = 'b/b'; break;
            case 'blue-agouti':      genotype.A  = 'A/A';  genotype.D = 'd/d'; break;
            case 'argente':          genotype.A  = 'A/A';  genotype.P = 'p/p'; break;
            case 'cinnamon-argente': genotype.A  = 'A/A';  genotype.B = 'b/b'; genotype.P = 'p/p'; break;
            // Base Color — Other
            case 'dom-red':          genotype.A  = 'Ay/a';    break;
            case 'rec-red':          genotype.E  = 'e/e';     break;
            case 'Leaden':          genotype.Ln = 'ln/ln';   break;
            // Albino & Dilution — C locus
            case 'albino':           genotype.C  = 'c/c';     break;
            case 'himalayan':        genotype.C  = 'c/ch';    break;
            case 'bone':             genotype.C  = 'c/ce';    break;
            case 'siamese':          genotype.C  = 'ch/ch';   break;
            case 'burmese':          genotype.C  = 'ch/cch';  break;
            case 'stone':            genotype.C  = 'c/cch';   break;
            case 'beige':            genotype.C  = 'ce/ce';   break;
            case 'colorpoint-beige': genotype.C  = 'ch/ce';   break;
            case 'mock-choc':        genotype.C  = 'ce/cch';  break;
            case 'sepia':            genotype.A  = 'a/a'; genotype.C = 'cch/cch'; break;
            case 'silver-agouti':    genotype.A  = 'A/A'; genotype.C = 'cch/cch'; break;
            case 'fox':              genotype.A  = 'at/a';    break; // pair with a C chip for full fox expression
            // Pattern & Markings
            case 'am-brindle':       genotype.A  = 'Avy/a';   break;
            case 'xbrindle':         genotype.Mobr = 'Mobr/mobr'; break;
            case 'pied':             genotype.S  = 's/s';     break;
            case 'variegated':       genotype.W  = 'W/w';     break;
            case 'banded':           genotype.W  = 'Wsh/w';   break;
            case 'splashed':         genotype.Spl = 'Spl/spl'; break;
            case 'merle':            genotype.Rn = 'rn/rn';   break;
            case 'pearl':            genotype.Si = 'si/si';   break;
            case 'umbrous':          genotype.U  = 'U/u';     break;
            // Coat & Texture
            case 'shorthair':        genotype.Go = 'Go/Go';   break;
            case 'longhair':         genotype.Go = 'go/go';   break;
            case 'satin':            genotype.Sa = 'sa/sa';   break;
            case 'astrex':           genotype.Re = 'Re/re';   break;
            case 'texel':            genotype.Re = 'Re/re'; genotype.Go = 'go/go'; break;
            case 'rosette':          genotype.Rst = 'rst/rst'; break;
            case 'fuzz':             genotype.Fz = 'fz/fz';  break;
            case 'dom-hairless':     genotype.Nu = 'Nu/nu';   break;
            default: break;
        }
    });

    return { genotype, assumptions };
};

// Rat-specific pairing engine: unlike the mouse flow (one flat target genotype), each selected
// rat trait may be backed by MULTIPLE alternative genotype patches that all produce the same
// phenotype label (see RAT_TRAIT_DEFS above). A pairing's probability for a given trait is the
// SUM of the probabilities across all of that trait's alternatives (OR-semantics), and the overall
// pairing probability is the PRODUCT across all independently-selected traits (AND-semantics).
const findRatTraitPairings = (allAnimals, selectedAlternatives) => {
  if (!selectedAlternatives || selectedAlternatives.length === 0) {
    return Promise.resolve({ pairings: [], unconfirmedPairings: [], targetLoci: {} });
  }

  // Flat union of every locus referenced by any alternative of any selected trait — used only by
  // ResultCard to decide which loci to bold in the displayed genotype, not for probability math.
  const targetLoci = {};
  selectedAlternatives.forEach(({ alternatives }) => {
    alternatives.forEach(patch => {
      Object.keys(patch).forEach((locus) => { targetLoci[locus] = true; });
    });
  });

  const getAlleleProbability = (parentAlleles, desiredAllele) => {
    if (!parentAlleles) return 0;
    const count = parentAlleles.filter(a => a === desiredAllele).length;
    return count / 2;
  };

  const calculateLocusProbability = (sireAlleles, damAlleles, targetAlleles) => {
    const [t1, t2] = targetAlleles;
    const p_t1_sire = getAlleleProbability(sireAlleles, t1);
    const p_t2_sire = getAlleleProbability(sireAlleles, t2);
    const p_t1_dam = getAlleleProbability(damAlleles, t1);
    const p_t2_dam = getAlleleProbability(damAlleles, t2);
    if (t1 === t2) return p_t1_sire * p_t1_dam;
    return p_t1_sire * p_t2_dam + p_t2_sire * p_t1_dam;
  };

  // Probability that a single trait (one or more alternative genotype patches) is produced by a
  // given sire x dam pairing. Returns { probability, unknown } where probability is null when
  // every alternative was unresolvable (missing locus data), and unknown flags a partially-known
  // result so the caller can bucket the pairing as "needs confirmation" instead of silently
  // reporting a possibly-inflated/deflated number.
  const calculateTraitProbability = (alternatives, sireLoci, damLoci) => {
    let total = 0;
    let anyKnownNonZero = false;
    let anyUnknown = false;
    for (const patch of alternatives) {
      let patchProbability = 1;
      let patchUnknown = false;
      for (const [locus, comboStr] of Object.entries(patch)) {
        const targetAlleles = comboStr.split('/');
        const sireAlleles = sireLoci[locus];
        const damAlleles = damLoci[locus];
        if (!sireAlleles || !damAlleles || sireAlleles.includes('-') || damAlleles.includes('-')) {
          patchUnknown = true;
          continue;
        }
        patchProbability *= calculateLocusProbability(sireAlleles, damAlleles, targetAlleles);
      }
      if (patchUnknown) { anyUnknown = true; continue; }
      total += patchProbability;
      if (patchProbability > 0) anyKnownNonZero = true;
    }
    if (!anyKnownNonZero) return { probability: anyUnknown ? null : 0, unknown: anyUnknown };
    return { probability: total, unknown: anyUnknown };
  };

  const sires = allAnimals.filter(a => a.gender === 'Male');
  const dams = allAnimals.filter(a => a.gender === 'Female');
  const pairings = [];
  const unconfirmedPairings = [];

  for (const sire of sires) {
    for (const dam of dams) {
      const sireLoci = parseGeneticCode(sire.geneticCode, 'Fancy Rat');
      const damLoci = parseGeneticCode(dam.geneticCode, 'Fancy Rat');
      let totalProbability = 1;
      let possible = true;
      let hasUnknownLocus = false;

      for (const { alternatives } of selectedAlternatives) {
        const { probability, unknown } = calculateTraitProbability(alternatives, sireLoci, damLoci);
        if (probability === null) { hasUnknownLocus = true; continue; }
        if (probability === 0) { possible = false; break; }
        if (unknown) hasUnknownLocus = true;
        totalProbability *= probability;
      }
      if (!possible) continue;
      if (hasUnknownLocus) {
        unconfirmedPairings.push({ sire, dam });
      } else if (totalProbability > 0) {
        pairings.push({ sire, dam, probability: totalProbability });
      }
    }
  }

  pairings.sort((a, b) => b.probability - a.probability);
  return new Promise(resolve => setTimeout(() => resolve({ pairings, unconfirmedPairings, targetLoci }), 250));
};

const findPotentialPairings = (allAnimals, target, mode, species) => {
  console.log(`Finding pairings for ${mode}:`, target);

  if (mode === 'traits' && species === 'Fancy Rat') {
    const { selectedAlternatives } = buildPrototypeGenotypeFromTraits(target, species);
    return findRatTraitPairings(allAnimals, selectedAlternatives);
  }

  let targetLoci;

  if (mode === 'genetics') {
    targetLoci = parseGeneticCode(target, species);
  } else if (mode === 'traits') {
    const { genotype } = buildPrototypeGenotypeFromTraits(target, species);
    // Convert genotype strings to allele arrays
    targetLoci = Object.entries(genotype).reduce((acc, [locus, combo]) => {
      acc[locus] = combo.split('/');
      return acc;
    }, {});
  } else {
    return Promise.resolve({ pairings: [], unconfirmedPairings: [], targetLoci: {} });
  }

  if (!targetLoci || Object.keys(targetLoci).length === 0) {
    return Promise.resolve({ pairings: [], unconfirmedPairings: [], targetLoci: {} });
  }

  const getAlleleProbability = (parentAlleles, desiredAllele) => {
    if (!parentAlleles) return 0;
    const count = parentAlleles.filter(a => a === desiredAllele).length;
    return count / 2;
  };

  const calculateLocusProbability = (sireAlleles, damAlleles, targetAlleles) => {
    const [t1, t2] = targetAlleles;
    const p_t1_sire = getAlleleProbability(sireAlleles, t1);
    const p_t2_sire = getAlleleProbability(sireAlleles, t2);
    const p_t1_dam = getAlleleProbability(damAlleles, t1);
    const p_t2_dam = getAlleleProbability(damAlleles, t2);

    if (t1 === t2) {
      return p_t1_sire * p_t1_dam;
    } else {
      const prob1 = p_t1_sire * p_t2_dam;
      const prob2 = p_t2_sire * p_t1_dam;
      return prob1 + prob2;
    }
  };

  // Requiring a fully-specified geneticCode excluded most animals in practice — genetic codes are
  // an optional, manually-entered field, so plenty of eligible sires/dams simply don't have one.
  const sires = allAnimals.filter(a => a.gender === 'Male');
  const dams = allAnimals.filter(a => a.gender === 'Female');
  const pairings = [];
  const unconfirmedPairings = [];

  for (const sire of sires) {
    for (const dam of dams) {
      const sireLoci = parseGeneticCode(sire.geneticCode, species);
      const damLoci = parseGeneticCode(dam.geneticCode, species);
      let totalProbability = 1;
      let possible = true;
      let hasUnknownLocus = false;
      for (const [locus, targetAlleles] of Object.entries(targetLoci)) {
        const sireAlleles = sireLoci[locus];
        const damAlleles = damLoci[locus];
        // Locus not recorded at all, or recorded with a '-' placeholder (dominant allele known,
        // other allele unspecified, e.g. "Ay/-") for either parent — we can't rule this pairing out,
        // but we also can't honestly score it, so it goes to the "needs confirmation" bucket instead
        // of being silently dropped (previous behavior: any unresolved locus = flat 0% = excluded).
        if (!sireAlleles || !damAlleles || sireAlleles.includes('-') || damAlleles.includes('-')) {
          hasUnknownLocus = true;
          continue;
        }
        const locusProbability = calculateLocusProbability(sireAlleles, damAlleles, targetAlleles);
        if (locusProbability === 0) {
            possible = false;
            break;
        }
        totalProbability *= locusProbability;
      }
      if (!possible) continue;
      if (hasUnknownLocus) {
        unconfirmedPairings.push({ sire, dam });
      } else if (totalProbability > 0) {
        pairings.push({ sire, dam, probability: totalProbability });
      }
    }
  }

  pairings.sort((a, b) => b.probability - a.probability);
  return new Promise(resolve => setTimeout(() => resolve({ pairings, unconfirmedPairings, targetLoci }), 250));
};

const getFullName = (animal) => [animal?.prefix, animal?.name, animal?.suffix].filter(Boolean).join(' ');

/**
 * A dedicated page for the Target Outcome Calculator.
 */
const TargetOutcomePage = ({ myAnimals, authToken, API_BASE_URL, speciesOptions }) => {
  const [mode, setMode] = useState('traits'); // 'traits' or 'genetics'
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [targetGenetics, setTargetGenetics] = useState('');
  const [selectedTraits, setSelectedTraits] = useState({});
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isSpeciesSupported = useMemo(() => {
    // Currently, detailed trait and genetic code calculations are supported for Fancy Mouse and Fancy Rat.
    return ['Fancy Mouse', 'Fancy Rat'].includes(selectedSpecies);
  }, [selectedSpecies]);

  const availableSpecies = useMemo(() => {
    if (!myAnimals) return [];
    const speciesSet = new Set(myAnimals.map(a => a.species));
    return speciesOptions.filter(s => speciesSet.has(s.name));
  }, [myAnimals, speciesOptions]);

  useEffect(() => {
    if (availableSpecies.length === 1 && !selectedSpecies) {
      setSelectedSpecies(availableSpecies[0].name);
    }
  }, [availableSpecies, selectedSpecies]);

  useEffect(() => {
    setSelectedTraits({});
    setResults(null);
  }, [selectedSpecies]);

  const handleTraitChange = (group, chipId) => {
    setResults(null);

    let nextTraits = { ...selectedTraits, [group]: chipId };
    if (!chipId) {
        delete nextTraits[group];
        // Note: Does not handle reverse dependency clearing for simplicity.
        // Clearing a dropdown will not automatically clear the things that depend on it.
        setSelectedTraits(nextTraits);
        return;
    }

    const fullDependencies = {
        'chocolate': { 'Base Color': 'black' },
        'blue': { 'Base Color': 'black' },
        'dove': { 'Base Color': 'black' },
        'lilac': { 'Base Color': 'black', 'Brown Dilute': 'chocolate', 'Blue Dilute': 'blue' },
        'champagne': { 'Base Color': 'black', 'Brown Dilute': 'chocolate', 'Pink Eye Dilute': 'dove' },
        'silver': { 'Base Color': 'black', 'Blue Dilute': 'blue', 'Pink Eye Dilute': 'dove' },
        'lavender': { 'Base Color': 'black', 'Brown Dilute': 'chocolate', 'Blue Dilute': 'blue', 'Pink Eye Dilute': 'dove' },
        'cinnamon': { 'Base Color': 'agouti' },
        'blue-agouti': { 'Base Color': 'agouti' },
        'argente': { 'Base Color': 'agouti' },
        'cinnamon-argente': { 'Base Color': 'agouti', 'Brown Dilute': 'cinnamon', 'Pink Eye Dilute': 'argente' },
        'Dominant Amber': { 'Base Color': 'dom-red' },
        'Recessive Amber': { 'Red Dilute': 'rec-red' },
        'sable': { 'Base Color': 'dom-red', 'Umbrous': 'umbrous' },
        'texel': { 'Astrex & Texel': 'astrex', 'Shorthair/Longhair': 'longhair' },
    };

    const blackBasedDilutes = new Set(['chocolate', 'blue', 'dove', 'lilac', 'champagne', 'silver', 'lavender']);
    const agoutiBasedDilutes = new Set(['cinnamon', 'blue-agouti', 'argente', 'cinnamon-argente']);

    const queue = [chipId];
    const processed = new Set();

    while (queue.length > 0) {
        const currentId = queue.shift();
        if (processed.has(currentId)) continue;
        processed.add(currentId);

        // Apply dependencies
        const deps = fullDependencies[currentId];
        if (deps) {
            for (const depGroup in deps) {
                const depChipId = deps[depGroup];
                if (nextTraits[depGroup] !== depChipId) {
                    nextTraits[depGroup] = depChipId;
                    queue.push(depChipId);
                }
            }
        }
    }

    // Handle exclusivity between black and agouti based dilutes
    const selectedIds = new Set(Object.values(nextTraits));
    const hasBlackDilute = [...selectedIds].some(id => blackBasedDilutes.has(id));
    const hasAgoutiDilute = [...selectedIds].some(id => agoutiBasedDilutes.has(id));

    if (hasBlackDilute && hasAgoutiDilute) {
        // Last selected type wins. If the user just selected a black-based dilute, clear agouti ones.
        if (blackBasedDilutes.has(chipId)) {
            Object.keys(nextTraits).forEach(g => {
                if (agoutiBasedDilutes.has(nextTraits[g])) {
                    delete nextTraits[g];
                }
            });
        } else if (agoutiBasedDilutes.has(chipId)) {
            Object.keys(nextTraits).forEach(g => {
                if (blackBasedDilutes.has(nextTraits[g])) {
                    delete nextTraits[g];
                }
            });
        }
    }

    setSelectedTraits(nextTraits);
  };

  const handleFindPairings = async () => {
    const isTraitsMode = mode === 'traits';
    const hasTarget = isTraitsMode ? Object.keys(selectedTraits).length > 0 : targetGenetics.trim();

    if (!hasTarget) {
      setError(isTraitsMode ? 'Please select at least one trait.' : 'Please enter the desired genetic code.');
      return;
    }
    setError('');
    setIsLoading(true);
    setResults(null);
    try {
      const target = isTraitsMode ? Object.values(selectedTraits).filter(Boolean) : targetGenetics;
      const animalsOfSpecies = myAnimals.filter(a => a.species === selectedSpecies);
      const potentialPairings = await findPotentialPairings(animalsOfSpecies, target, mode, selectedSpecies);
      setResults(potentialPairings);

    } catch (err) {
      console.error("Target Outcome Calculation Error:", err);
      setError(err.response?.data?.message || 'Failed to find pairings.');
    } finally {
      setIsLoading(false);
    }
  };

  const [expandedGroups, setExpandedGroups] = useState({ high: true, medium: true, low: true, unconfirmed: false });

  const groupedResults = useMemo(() => {
    if (!results?.pairings) return null;
    const groups = {
        high: [], // > 50%
        medium: [], // 10-50%
        low: [], // < 10%
    };
    results.pairings.forEach(result => {
        if (result.probability >= 0.5) {
            groups.high.push(result);
        } else if (result.probability >= 0.1) {
            groups.medium.push(result);
        } else {
            groups.low.push(result);
        }
    });
    return groups;
  }, [results]);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const ResultCard = ({ sire, dam, probability, targetLoci, species }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const sireLoci = useMemo(() => parseGeneticCode(sire.geneticCode, species), [sire.geneticCode, species]);
    const damLoci = useMemo(() => parseGeneticCode(dam.geneticCode, species), [dam.geneticCode, species]);

    const renderGenotype = (animalLoci) => {
        const allLoci = getLociForSpecies(species);
        const geneOrder = Object.keys(allLoci);

        const relevantLoci = geneOrder.filter(locus => animalLoci[locus]);

        if (relevantLoci.length === 0) {
            return <span className="text-gray-400 dark:text-dark-text-muted italic">No genetic code recorded.</span>;
        }

        return (
            <div className="font-mono text-xs flex flex-wrap gap-x-2 gap-y-1">
                {relevantLoci.map(locus => {
                    const isResponsible = targetLoci.hasOwnProperty(locus);
                    const combo = animalLoci[locus].join('/');
                    return (
                        <span key={locus} className={isResponsible ? 'font-bold text-black dark:text-dark-text' : 'text-gray-500 dark:text-dark-text-muted'}>
                            {combo}
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-dark-card-bg border border-gray-200 dark:border-dark-text rounded-lg">
            <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-surface-hover" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <p><span className="font-semibold text-blue-700 dark:text-blue-400">Sire:</span> <span className="dark:text-dark-text">{getFullName(sire)} ({sire.id_public})</span></p>
                        <p><span className="font-semibold text-pink-700 dark:text-pink-400">Dam:</span> <span className="dark:text-dark-text">{getFullName(dam)} ({dam.id_public})</span></p>
                    </div>
                    <div className="text-center ml-4 flex-shrink-0">
                        <p className="text-2xl font-bold text-primary">{(probability * 100).toFixed(1)}%</p>
                        <p className="text-xs text-gray-500 dark:text-dark-text-muted">Chance</p>
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="border-t dark:border-dark-text bg-gray-50 dark:bg-dark-card-bg p-4 space-y-2">
                    <div>
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Sire Genotype:</p>
                        {renderGenotype(sireLoci)}
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-pink-700 dark:text-pink-400 mb-1">Dam Genotype:</p>
                        {renderGenotype(damLoci)}
                    </div>
                </div>
            )}
        </div>
    );
  };

  const UnconfirmedPairingCard = ({ sire, dam }) => (
    <div className="bg-white dark:bg-dark-card-bg border border-gray-200 dark:border-dark-text rounded-lg p-4">
      <div className="text-sm">
        <p><span className="font-semibold text-blue-700 dark:text-blue-400">Sire:</span> <span className="dark:text-dark-text">{getFullName(sire)} ({sire.id_public})</span></p>
        <p><span className="font-semibold text-pink-700 dark:text-pink-400">Dam:</span> <span className="dark:text-dark-text">{getFullName(dam)} ({dam.id_public})</span></p>
      </div>
    </div>
  );

  const CollapsibleGroup = ({ title, count, children, isOpen, onToggle }) => (
    <div className="border border-gray-200 dark:border-dark-text rounded-lg">
        <button onClick={onToggle} className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface-hover transition">
            <div className="flex items-center gap-2"><h4 className="font-bold text-gray-700 dark:text-dark-text">{title}</h4><span className="text-xs bg-gray-300 dark:bg-dark-card-bg text-gray-700 dark:text-dark-text-secondary font-semibold px-2 py-0.5 rounded-full">{count}</span></div>
            {isOpen ? <ChevronUp size={20} className="dark:text-dark-text" /> : <ChevronDown size={20} className="dark:text-dark-text" />}
        </button>
        {isOpen && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );

  return (
    <div className="w-full h-full bg-white dark:bg-dark-card-bg rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-dark-text flex-shrink-0 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <Target size={32} className="text-primary flex-shrink-0" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-dark-text flex items-center gap-2">
              Target Outcome Calculator
              <InfoButton title="Target Outcome Calculator" lessonId="target-outcome-calculator">
                <p>Find potential sire/dam pairings from your animals that are likely to produce a specific genetic trait or outcome.</p>
              </InfoButton>
            </h2>
            <p className="text-gray-600 dark:text-dark-text-secondary text-xs sm:text-sm mt-1">Find potential pairings to produce a specific genetic outcome.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Species and Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1">
              <label htmlFor="species-select" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Species
              </label>
              <select
                id="species-select"
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                disabled={isLoading}
                className="w-full p-2 border border-gray-300 dark:border-dark-text rounded-lg bg-white dark:bg-dark-card-bg dark:text-dark-text"
              >
                <option value="" disabled>Select a species</option>
                {availableSpecies.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 self-end">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Calculator Mode
              </label>
              <div className="flex rounded-lg border border-gray-300 dark:border-dark-text p-1 bg-gray-200 dark:bg-dark-card-bg">
                <button onClick={() => setMode('traits')} disabled={isLoading} className={`w-1/2 p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition ${mode === 'traits' ? 'bg-white dark:bg-dark-surface shadow dark:text-dark-text' : 'text-gray-600 dark:text-dark-text-muted hover:bg-gray-300 dark:hover:bg-dark-surface-hover'}`}><Palette size={16} /> Visual Traits</button>
                <button onClick={() => setMode('genetics')} disabled={isLoading} className={`w-1/2 p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition ${mode === 'genetics' ? 'bg-white dark:bg-dark-surface shadow dark:text-dark-text' : 'text-gray-600 dark:text-dark-text-muted hover:bg-gray-300 dark:hover:bg-dark-surface-hover'}`}><Settings size={16} /> Genetic Code</button>
              </div>
            </div>
          </div>

          <div className="mb-8 p-4 sm:p-6 border border-gray-200 dark:border-dark-text rounded-lg bg-gray-50 dark:bg-dark-card-bg">
            {!selectedSpecies ? (
              <p className="text-center text-gray-500 dark:text-dark-text-muted">Please select a species to begin.</p>
            ) : mode === 'traits' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-4">Select Desired Traits</h3>
                {Object.values(selectedTraits).includes('fox') && !selectedTraits['Albino & Dilution'] && (
                    <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg text-sm">
                        <p><b>Note:</b> For the 'Fox' phenotype to be expressed, a selection from 'Albino & Dilution' (like Siamese, Himalayan, etc.) is also required.</p>
                    </div>
                )}
                <TraitSelector
                  species={selectedSpecies}
                  selectedTraits={selectedTraits}
                  onTraitChange={handleTraitChange}
                  disabled={isLoading || !isSpeciesSupported}
                />
              </div>
            ) : (
              <div>
                <label htmlFor="targetGenetics" className="block text-lg font-semibold text-gray-800 dark:text-dark-text mb-4">
                  Enter Desired Genetic Code
                </label>
                <div className="relative">
                  <input
                    id="targetGenetics"
                    type="text"
                    placeholder="e.g., a/a d/d e/e"
                    value={targetGenetics}
                    onChange={(e) => setTargetGenetics(e.target.value)}
                    disabled={isLoading || !isSpeciesSupported}
                    className="w-full p-3 border border-gray-300 dark:border-dark-text dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted rounded-lg"
                  />
                  <Dna size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-muted" />
                </div>
                <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-2">Enter the genetic combination you want to achieve in the offspring.</p>
              </div>
            )}
            {!isSpeciesSupported && selectedSpecies && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-dark-info-blue/20 border border-blue-200 dark:border-dark-info-blue text-blue-800 dark:text-dark-text rounded-lg text-sm">
                <p>
                  Detailed trait and genetic code calculations are currently available for Fancy Mouse and Fancy Rat. Support for other species is in development!
                </p>
              </div>
            )}
          </div>

          <div className="text-center mb-6">
            <button
              onClick={handleFindPairings}
              disabled={!selectedSpecies || isLoading}
              className="px-8 py-3 bg-primary dark:bg-dark-primary text-black font-semibold rounded-lg shadow-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              {isLoading ? (
                <><Loader2 size={20} className="animate-spin" /> Searching...</>
              ) : (
                <><Search size={20} /> Find Potential Pairings</>
              )}
            </button>
          </div>

          {error && <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg text-center"><p>{error}</p></div>}

          {results && (
            <div className="bg-gray-50 dark:bg-dark-card-bg border border-gray-200 dark:border-dark-text rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-4 text-center">Potential Pairings Found ({results.pairings.length})</h3>
              {results.pairings.length > 0 ? (
                <div className="space-y-4">
                  {groupedResults.high.length > 0 && (
                    <CollapsibleGroup title="High Probability (>50%)" count={groupedResults.high.length} isOpen={expandedGroups.high} onToggle={() => toggleGroup('high')}>
                      {groupedResults.high.map(r => <ResultCard key={r.sire.id_public + r.dam.id_public} {...r} targetLoci={results.targetLoci} species={selectedSpecies} />)}
                    </CollapsibleGroup>
                  )}
                  {groupedResults.medium.length > 0 && (
                    <CollapsibleGroup title="Medium Probability (10-50%)" count={groupedResults.medium.length} isOpen={expandedGroups.medium} onToggle={() => toggleGroup('medium')}>
                      {groupedResults.medium.map(r => <ResultCard key={r.sire.id_public + r.dam.id_public} {...r} targetLoci={results.targetLoci} species={selectedSpecies} />)}
                    </CollapsibleGroup>
                  )}
                  {groupedResults.low.length > 0 && (
                    <CollapsibleGroup title="Low Probability (<10%)" count={groupedResults.low.length} isOpen={expandedGroups.low} onToggle={() => toggleGroup('low')}>
                      {groupedResults.low.map(r => <ResultCard key={r.sire.id_public + r.dam.id_public} {...r} targetLoci={results.targetLoci} species={selectedSpecies} />)}
                    </CollapsibleGroup>
                  )}
                </div>
              ) : (<p className="text-center text-gray-600 dark:text-dark-text-secondary">No potential pairings found in your animals that can produce the target genetics.</p>)}

              {results.unconfirmedPairings?.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs text-gray-500 dark:text-dark-text-muted mb-2 text-center">
                    These pairs have at least one parent whose genetic code doesn't fully specify a trait needed for this outcome (e.g. "Ay/-"), so a percentage can't be calculated — but the outcome may still be possible.
                  </p>
                  <CollapsibleGroup title="Needs Genotype Confirmation" count={results.unconfirmedPairings.length} isOpen={expandedGroups.unconfirmed} onToggle={() => toggleGroup('unconfirmed')}>
                    {results.unconfirmedPairings.map(r => <UnconfirmedPairingCard key={r.sire.id_public + r.dam.id_public} {...r} />)}
                  </CollapsibleGroup>
                </div>
              )}
            </div>
          )}

          {!results && !isLoading && (
             <div className="text-center text-gray-400 dark:text-dark-text-muted mt-8">
                <Target size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select your target criteria above to begin.</p>
                <p className="text-sm mt-2">The calculator will search your animals for pairs that could produce the desired outcome.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TargetOutcomePage;