/**
 * Campbell's Dwarf Hamster — Multi-locus phenotype combination rules
 *
 * Built from docs/genetics/CAMPBELLS_DWARF_HAMSTER_GENETICS_MAP.md (2026-08-26).
 * Priority-ordered: the first rule whose `match` conditions ALL pass wins.
 * Rule shape mirrors fancyRatPhenotypeRules.js / syrianHamsterPhenotypeRules.js:
 *   { match: { [locusKey]: string[] }, phenotype: string }
 *
 * Locus key convention: lowercase mutant symbol. Wildtype allele = same
 * letters capitalized (recessive mutants), or vice versa for dominant
 * mutants (mo, mi, si). Genotype notation = `Allele1/Allele2`.
 *
 * Loci: a, b, d, p, c, di, dg   (color genes)
 *       u, mo, mi                (pattern genes — appended as suffixes)
 *       si                        (Platinum — overrides color, combines with Dilute)
 *       rx, sa, wa                (coat genes — appended as suffixes)
 *
 * A-locus shorthands:
 *   BLACK  = a/a   (Black base)
 *   AGOUTI = A/A or A/a   (Agouti base)
 */

const BLACK  = ['a/a'];
const AGOUTI = ['A/A', 'A/a'];

// Genotype notations are matched as exact strings, so any input with alleles in
// reverse order (e.g. 'a/A') must be canonicalized first. Order: dominant/uppercase
// allele wins, then alphabetical.
function normalizeNotation(notation) {
  if (typeof notation !== 'string' || !notation.includes('/')) return notation;
  const [a, b] = notation.split('/');
  if (!a || !b) return notation;
  const aUpper = a[0] === a[0].toUpperCase() && a[0] !== a[0].toLowerCase();
  const bUpper = b[0] === b[0].toUpperCase() && b[0] !== b[0].toLowerCase();
  if (aUpper && !bUpper) return notation;
  if (!aUpper && bUpper) return `${b}/${a}`;
  return a.localeCompare(b) <= 0 ? notation : `${b}/${a}`;
}

function normalizeCampbellsGenotype(genotype) {
  const normalized = {};
  for (const [locus, notation] of Object.entries(genotype)) {
    normalized[locus] = normalizeNotation(notation);
  }
  return normalized;
}

// =========================================================
// BASE COLOR RULES — Albino (fully epistatic) → Platinum (overrides A/B/D/P,
// combines with Dilute) → Dark Grey (own mutation, ignores B/D/P entirely) →
// plain A/B/D/P table. Each tier ordered most-specific first.
// =========================================================

const ALBINO_RULES = [
  { match: { c: ['c/c'] }, phenotype: 'Albino' },
];

const PLATINUM_RULES = [
  { match: { si: ['Si/si'] }, phenotype: 'Platinum' },
];

const DARK_GREY_RULES = [
  // dg/dg ignores b/d/p entirely — only the A locus matters once dg/dg is present.
  { match: { a: BLACK, dg: ['dg/dg'] },  phenotype: 'Dark Grey' },
  { match: { a: AGOUTI, dg: ['dg/dg'] }, phenotype: 'Dark Grey Agouti' },
];

const BASE_RULES = [
  // Black base (a/a), most-specific (3-locus) first.
  { match: { a: BLACK, b: ['b/b'], p: ['p/p'], d: ['d/d'] }, phenotype: 'Champagne' },
  { match: { a: BLACK, d: ['d/d'], p: ['p/p'] },             phenotype: 'Red Eyed Lilac' },
  { match: { a: BLACK, b: ['b/b'], p: ['p/p'] },             phenotype: 'Dark Beige' },
  { match: { a: BLACK, b: ['b/b'], d: ['d/d'] },             phenotype: 'Lilac' },
  { match: { a: BLACK, p: ['p/p'] },                         phenotype: 'Dove' },
  { match: { a: BLACK, b: ['b/b'] },                         phenotype: 'Chocolate' },
  { match: { a: BLACK, d: ['d/d'] },                         phenotype: 'Blue' },
  { match: { a: BLACK },                                     phenotype: 'Black' },

  // Agouti base (A/-), most-specific (3-locus) first.
  { match: { a: AGOUTI, b: ['b/b'], d: ['d/d'], p: ['p/p'] }, phenotype: 'Blue Beige' },
  { match: { a: AGOUTI, b: ['b/b'], d: ['d/d'] },             phenotype: 'Lilac Fawn' },
  { match: { a: AGOUTI, d: ['d/d'], p: ['p/p'] },             phenotype: 'Blue Fawn' },
  { match: { a: AGOUTI, b: ['b/b'], p: ['p/p'] },             phenotype: 'Beige' },
  { match: { a: AGOUTI, d: ['d/d'] },                         phenotype: 'Opal' },
  { match: { a: AGOUTI, b: ['b/b'] },                         phenotype: 'Black Eyed Argente' },
  { match: { a: AGOUTI, p: ['p/p'] },                         phenotype: 'Argente' },
  { match: { a: AGOUTI },                                     phenotype: 'Agouti' },
];

const CAMPBELLS_BASE_PHENOTYPE_RULES = [...ALBINO_RULES, ...PLATINUM_RULES, ...DARK_GREY_RULES, ...BASE_RULES];

function computeBasePhenotype(genotype) {
  for (const rule of CAMPBELLS_BASE_PHENOTYPE_RULES) {
    const allMatch = Object.entries(rule.match).every(([locus, allowed]) => {
      const notation = genotype[locus];
      return notation != null && allowed.includes(notation);
    });
    if (allMatch) return rule.phenotype;
  }
  return 'Standard';
}

// di/di prefixes "Dilute " onto the computed color. Albino has no pigment to
// dilute, so it's excluded (c/c always stays plain "Albino").
function applyDilutePrefix(phenotype, genotype) {
  if (genotype.di === 'di/di' && genotype.c !== 'c/c' && phenotype !== 'Standard') {
    return `Dilute ${phenotype}`;
  }
  return phenotype;
}

// =========================================================
// PATTERN/COAT SUFFIXES — independent of color (survive Albino/Platinum
// epistasis). Mo and Mi are two distinct genes; together they combine into
// "Double (Ruby Eyed) Mottled" instead of stacking both suffixes.
// =========================================================

function applyUmbrous(phenotype, genotype) {
  return genotype.u === 'u/u' ? `${phenotype} Umbrous` : phenotype;
}

function applyMottled(phenotype, genotype) {
  const hasMo = genotype.mo === 'Mo/mo' || genotype.mo === 'Mo/Mo';
  const hasMi = genotype.mi === 'Mi/mi';

  if (hasMo && hasMi) return `${phenotype} Double (Ruby Eyed) Mottled`;
  if (hasMo) return `${phenotype} Mottled`;
  if (hasMi) return `${phenotype} Ruby Eyed Mottled`;
  return phenotype;
}

function applyCoatGenes(phenotype, genotype) {
  const suffixes = [];
  if (genotype.rx === 'rx/rx') suffixes.push('Rex');
  if (genotype.sa === 'sa/sa') suffixes.push('Satin');
  if (genotype.wa === 'wa/wa') suffixes.push('Wavy');
  return suffixes.length ? `${phenotype} ${suffixes.join(' ')}` : phenotype;
}

// =========================================================
// CARRIERS — every Recessive-type locus is carried when het. Carrier labels
// use the original mutation name (Full gene list table), not the
// base-dependent phenotype name. Dominant loci (Mo, Mi, Si) are visible in
// any dosage, so they are never silent "carried" traits.
// =========================================================

const SIMPLE_RECESSIVE_CARRIERS = {
  a:  { het: 'A/a',   trait: 'Black' },
  b:  { het: 'B/b',   trait: 'Chocolate' },
  d:  { het: 'D/d',   trait: 'Blue' },
  p:  { het: 'P/p',   trait: 'Pink Eye Dilute' },
  c:  { het: 'C/c',   trait: 'Albino' },
  di: { het: 'Di/di', trait: 'Dilute' },
  dg: { het: 'Dg/dg', trait: 'Dark Grey' },
  u:  { het: 'U/u',   trait: 'Umbrous' },
  rx: { het: 'Rx/rx', trait: 'Rex' },
  sa: { het: 'Sa/sa', trait: 'Satin' },
  wa: { het: 'Wa/wa', trait: 'Wavy' },
};

export function getCampbellsDwarfHamsterCarriers(genotype) {
  genotype = normalizeCampbellsGenotype(genotype);
  const carriers = [];
  for (const [locus, { het, trait }] of Object.entries(SIMPLE_RECESSIVE_CARRIERS)) {
    if (genotype[locus] === het) carriers.push(trait);
  }
  return carriers;
}

/**
 * Evaluate a Campbell's Dwarf Hamster genotype against the documented phenotype rules.
 * @param {Object} genotype - e.g. { a: 'a/a', d: 'd/d', mo: 'Mo/mo', ... }
 * @returns {{ phenotype: string, carriers: string[], notes: string[] }}
 */
export function matchCampbellsDwarfHamsterPhenotype(genotype) {
  genotype = normalizeCampbellsGenotype(genotype);

  if (genotype.mi === 'Mi/Mi') {
    return { phenotype: 'LETHAL (Mi/Mi)', carriers: getCampbellsDwarfHamsterCarriers(genotype), notes: [] };
  }
  if (genotype.si === 'Si/Si') {
    return { phenotype: 'LETHAL (Si/Si)', carriers: getCampbellsDwarfHamsterCarriers(genotype), notes: [] };
  }

  let phenotype = computeBasePhenotype(genotype);
  phenotype = applyDilutePrefix(phenotype, genotype);
  phenotype = applyUmbrous(phenotype, genotype);
  phenotype = applyMottled(phenotype, genotype);
  phenotype = applyCoatGenes(phenotype, genotype);

  return { phenotype, carriers: getCampbellsDwarfHamsterCarriers(genotype), notes: [] };
}

// ---------------------------------------------------------------------------
// CAMPBELLS DWARF HAMSTER GENE LOCI — metadata for GeneticCodeBuilder visual
// selector and GeneticsCalculator dropdowns.
// ---------------------------------------------------------------------------

export const CAMPBELLS_DWARF_HAMSTER_GENE_LOCI = {
  // --- Color genes ---
  a:  { name: 'Black/Agouti', description: 'A/- = Agouti, a/a = Black.', combinations: ['A/A', 'A/a', 'a/a'] },
  b:  { name: 'Chocolate',    description: 'Recessive. b/b = Chocolate (Black base) or Black Eyed Argente (Agouti base).', combinations: ['B/B', 'B/b', 'b/b'] },
  d:  { name: 'Blue (Dilution)', description: 'Recessive. d/d = Blue (Black base) or Opal (Agouti base).', combinations: ['D/D', 'D/d', 'd/d'] },
  p:  { name: 'Pink Eye Dilute', description: 'Recessive. p/p = Dove (Black base) or Argente (Agouti base).', combinations: ['P/P', 'P/p', 'p/p'] },
  c:  { name: 'Albino',       description: 'Recessive, fully epistatic for color. c/c = Albino regardless of other color loci (still shows pattern/coat suffixes).', combinations: ['C/C', 'C/c', 'c/c'] },
  di: { name: 'Dilute',       description: 'Recessive. di/di prefixes "Dilute " onto the computed color (e.g. Dilute Platinum). Does not affect Albino.', combinations: ['Di/Di', 'Di/di', 'di/di'] },
  dg: { name: 'Dark Grey',    description: 'Recessive, own independent color mutation — overrides b/d/p entirely. dg/dg = Dark Grey (Black base) or Dark Grey Agouti (Agouti base).', combinations: ['Dg/Dg', 'Dg/dg', 'dg/dg'] },
  // --- Pattern genes ---
  u:  { name: 'Umbrous',      description: 'Recessive. u/u = Umbrous (suffix).', combinations: ['U/U', 'U/u', 'u/u'] },
  mo: { name: 'Mottled',      description: 'Dominant. Mo/mo or Mo/Mo = Mottled. Mo/Mo is viable (just more mottling).', combinations: ['mo/mo', 'Mo/mo', 'Mo/Mo'] },
  mi: { name: 'Ruby Eyed Mottled', description: 'Dominant, homozygous lethal. Mi/mi = Ruby Eyed Mottled. Distinct gene from Mo — together they produce "Double (Ruby Eyed) Mottled".', combinations: ['mi/mi', 'Mi/mi'] },
  si: { name: 'Platinum',     description: 'Dominant, homozygous lethal. Si/si = Platinum, overrides A/B/D/P base color (still combines with Dilute prefix and pattern/coat suffixes).', combinations: ['si/si', 'Si/si'] },
  // --- Coat genes ---
  rx: { name: 'Rex',   description: 'Recessive coat texture. rx/rx = Rex.', combinations: ['Rx/Rx', 'Rx/rx', 'rx/rx'] },
  sa: { name: 'Satin', description: 'Recessive coat texture. sa/sa = Satin.', combinations: ['Sa/Sa', 'Sa/sa', 'sa/sa'] },
  wa: { name: 'Wavy',  description: 'Recessive coat texture. wa/wa = Wavy.', combinations: ['Wa/Wa', 'Wa/wa', 'wa/wa'] },
};
