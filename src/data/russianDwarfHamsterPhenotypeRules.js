/**
 * Russian Dwarf Hamster (Winter White / Djungarian) — Multi-locus phenotype combination rules
 *
 * Built from docs/genetics/RUSSIAN_DWARF_HAMSTER_GENETICS_MAP.md (2026-08-26).
 * Priority-ordered: the first rule whose `match` conditions ALL pass wins.
 * Rule shape mirrors campbellsDwarfHamsterPhenotypeRules.js:
 *   { match: { [locusKey]: string[] }, phenotype: string }
 *
 * Locus key convention: lowercase mutant symbol. Wildtype allele = same
 * letters capitalized (recessive mutants), or vice versa for dominant
 * mutants (pe, me, ma, mi, wh, u). Genotype notation = `Allele1/Allele2`.
 *
 * Loci: a, d, p, m                (base color genes)
 *       ma                         (Mandarin — overrides base color entirely, own named series)
 *       pe, me, u, mi, s, wh       (marking genes — appended as suffixes)
 *       rx, sa, wa                 (coat genes — appended as suffixes, Campbells-hybrid ancestry)
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

function normalizeRussianDwarfGenotype(genotype) {
  const normalized = {};
  for (const [locus, notation] of Object.entries(genotype)) {
    normalized[locus] = normalizeNotation(notation);
  }
  return normalized;
}

// =========================================================
// BASE COLOR RULES — Mandarin (Ma/ma, overrides base color entirely, own
// named series) → plain A/D/P/M base table. Each tier ordered most-specific
// first. p/p + m/m overrides d entirely in both tiers (d becomes irrelevant
// once p/p m/m are both present — confirmed 2026-08-26).
// =========================================================

const MANDARIN_RULES = [
  { match: { p: ['p/p'], m: ['m/m'] }, phenotype: 'Pink Eyed Mandarin Beige' },
  { match: { d: ['d/d'], p: ['p/p'] }, phenotype: 'Pink Eyed Camel' },
  { match: { d: ['d/d'], m: ['m/m'] }, phenotype: 'Mandarin Beige' },
  { match: { p: ['p/p'] },             phenotype: 'Pink Eyed Mandarin' },
  { match: { m: ['m/m'] },             phenotype: 'Diluted Mandarin' },
  { match: { d: ['d/d'] },             phenotype: 'Camel' },
  { match: {},                         phenotype: 'Mandarin' },
];

const BASE_RULES = [
  // Black base (a/a), most-specific first.
  { match: { a: BLACK, p: ['p/p'], m: ['m/m'] }, phenotype: 'Champagne' },
  { match: { a: BLACK, d: ['d/d'], p: ['p/p'] }, phenotype: 'Pink Eyed Lilac' },
  { match: { a: BLACK, d: ['d/d'], m: ['m/m'] }, phenotype: 'Black Eyed Lilac' },
  { match: { a: BLACK, p: ['p/p'] },             phenotype: 'Dove' },
  { match: { a: BLACK, m: ['m/m'] },             phenotype: 'Chocolate' },
  { match: { a: BLACK, d: ['d/d'] },             phenotype: 'Russian Blue' },
  { match: { a: BLACK },                         phenotype: 'Black' },

  // Agouti base (A/-), most-specific first.
  { match: { a: AGOUTI, p: ['p/p'], m: ['m/m'] }, phenotype: 'Beige Blonde' },
  { match: { a: AGOUTI, d: ['d/d'], p: ['p/p'] }, phenotype: 'Yellow Blue Fawn' },
  { match: { a: AGOUTI, d: ['d/d'], m: ['m/m'] }, phenotype: 'Beige' },
  { match: { a: AGOUTI, p: ['p/p'] },             phenotype: 'Yellow Agouti' },
  { match: { a: AGOUTI, m: ['m/m'] },             phenotype: 'Brown' },
  { match: { a: AGOUTI, d: ['d/d'] },             phenotype: 'Sapphire' },
  { match: { a: AGOUTI },                         phenotype: 'Agouti' },
];

function computeBasePhenotype(genotype) {
  const hasMa = genotype.ma === 'Ma/ma' || genotype.ma === 'Ma/Ma';
  const rules = hasMa ? MANDARIN_RULES : BASE_RULES;
  for (const rule of rules) {
    const allMatch = Object.entries(rule.match).every(([locus, allowed]) => {
      const notation = genotype[locus];
      return notation != null && allowed.includes(notation);
    });
    if (allMatch) return rule.phenotype;
  }
  return 'Standard';
}

// =========================================================
// MARKING/COAT SUFFIXES — generic suffixes that combine with any computed
// base (including Mandarin-series names). Stacking order (not explicitly
// specified by source data — assumed consistent): Pearl → Merle → Umbrous →
// Ruby Eyed Mottled → Pied → Imperial → coat genes (Rex/Satin/Wavy).
// =========================================================

function applyPearl(phenotype, genotype) {
  const hasPe = genotype.pe === 'Pe/pe' || genotype.pe === 'Pe/Pe';
  return hasPe ? `${phenotype} Pearl` : phenotype;
}

function applyMerle(phenotype, genotype) {
  const hasMe = genotype.me === 'Me/me' || genotype.me === 'Me/Me';
  return hasMe ? `${phenotype} Merle` : phenotype;
}

function applyUmbrous(phenotype, genotype) {
  const hasU = genotype.u === 'U/u' || genotype.u === 'U/U';
  return hasU ? `${phenotype} Umbrous` : phenotype;
}

// Ruby Eyed Mottled: hybrid/shared gene with Campbells, identical rules (Mi/Mi lethal).
function applyRubyEyedMottled(phenotype, genotype) {
  return genotype.mi === 'Mi/mi' ? `${phenotype} Ruby Eyed Mottled` : phenotype;
}

function applyPied(phenotype, genotype) {
  return genotype.s === 's/s' ? `${phenotype} Pied` : phenotype;
}

// Imperial: hybrid/shared gene with Syrian Hamster, but always "Imperial" here
// (no e-locus naming split like Syrian Hamster). Wh/Wh is lethal.
function applyImperial(phenotype, genotype) {
  return genotype.wh === 'Wh/wh' ? `${phenotype} Imperial` : phenotype;
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
// base-dependent phenotype name. Dominant loci (Pe, Me, Ma, Mi, Wh, U) are
// visible in any dosage, so they are never silent "carried" traits.
// =========================================================

const SIMPLE_RECESSIVE_CARRIERS = {
  a:  { het: 'A/a', trait: 'Black' },
  d:  { het: 'D/d', trait: 'Sapphire' },
  p:  { het: 'P/p', trait: 'Dove' },
  m:  { het: 'M/m', trait: 'Chocolate' },
  s:  { het: 'S/s', trait: 'Pied' },
  rx: { het: 'Rx/rx', trait: 'Rex' },
  sa: { het: 'Sa/sa', trait: 'Satin' },
  wa: { het: 'Wa/wa', trait: 'Wavy' },
};

// Recessive loci eligible for "possible het" (unconfirmed/probability-based carrier) notes.
export const RUSSIAN_DWARF_HAMSTER_POSSIBLE_HET_LOCI = Object.entries(SIMPLE_RECESSIVE_CARRIERS).map(([locus, { trait }]) => ({ locus, name: trait }));

export function getRussianDwarfHamsterCarriers(genotype) {
  genotype = normalizeRussianDwarfGenotype(genotype);
  const carriers = [];
  for (const [locus, { het, trait }] of Object.entries(SIMPLE_RECESSIVE_CARRIERS)) {
    if (genotype[locus] === het) carriers.push(trait);
  }
  return carriers;
}

/**
 * Evaluate a Russian Dwarf Hamster genotype against the documented phenotype rules.
 * @param {Object} genotype - e.g. { a: 'a/a', d: 'd/d', ma: 'Ma/ma', ... }
 * @returns {{ phenotype: string, carriers: string[], notes: string[] }}
 */
export function matchRussianDwarfHamsterPhenotype(genotype) {
  genotype = normalizeRussianDwarfGenotype(genotype);

  if (genotype.mi === 'Mi/Mi') {
    return { phenotype: 'LETHAL (Mi/Mi)', carriers: getRussianDwarfHamsterCarriers(genotype), notes: [] };
  }
  if (genotype.wh === 'Wh/Wh') {
    return { phenotype: 'LETHAL (Wh/Wh)', carriers: getRussianDwarfHamsterCarriers(genotype), notes: [] };
  }

  const colorPart = computeBasePhenotype(genotype);
  let phenotype = applyPearl(colorPart, genotype);
  phenotype = applyMerle(phenotype, genotype);
  phenotype = applyUmbrous(phenotype, genotype);
  phenotype = applyRubyEyedMottled(phenotype, genotype);
  phenotype = applyPied(phenotype, genotype);
  phenotype = applyImperial(phenotype, genotype);
  const markingsPart = phenotype.slice(colorPart.length).trim();
  const beforeCoat = phenotype;
  phenotype = applyCoatGenes(phenotype, genotype);
  const coatPart = phenotype.slice(beforeCoat.length).trim();

  // Categorized breakdown for the "Seed to Appearance" feature, derived from
  // the same sequential build above (no change to the derivation logic).
  const breakdown = { color: colorPart, markings: markingsPart, coat: coatPart, body: '' };

  return { phenotype, carriers: getRussianDwarfHamsterCarriers(genotype), notes: [], breakdown };
}

// ---------------------------------------------------------------------------
// RUSSIAN DWARF HAMSTER GENE LOCI — metadata for GeneticCodeBuilder visual
// selector and GeneticsCalculator dropdowns.
// ---------------------------------------------------------------------------

export const RUSSIAN_DWARF_HAMSTER_GENE_LOCI = {
  // --- Color genes ---
  a:  { name: 'Black/Agouti',   description: 'A/- = Agouti, a/a = Black.', combinations: ['A/A', 'A/a', 'a/a'] },
  d:  { name: 'Sapphire (Dilution)', description: 'Recessive. d/d = Sapphire (Agouti base) or Russian Blue (Black base).', combinations: ['D/D', 'D/d', 'd/d'] },
  p:  { name: 'Dove (Pink Eye Dilute)', description: 'Recessive. p/p = Yellow Agouti (Agouti base) or Dove (Black base).', combinations: ['P/P', 'P/p', 'p/p'] },
  m:  { name: 'Chocolate', description: 'Recessive. m/m = Brown (Agouti base) or Chocolate (Black base).', combinations: ['M/M', 'M/m', 'm/m'] },
  ma: { name: 'Mandarin', description: 'Dominant. Ma/ma or Ma/Ma overrides the base color entirely with its own named series (Mandarin, Camel, Pink Eyed Mandarin, etc.), regardless of A/a.', combinations: ['ma/ma', 'Ma/ma', 'Ma/Ma'] },
  // --- Pattern/marking genes ---
  pe: { name: 'Pearl', description: 'Dominant. Pe/pe or Pe/Pe = " Pearl" suffix onto the base color.', combinations: ['pe/pe', 'Pe/pe', 'Pe/Pe'] },
  me: { name: 'Merle', description: 'Dominant. Me/me or Me/Me = " Merle" suffix onto the base color.', combinations: ['me/me', 'Me/me', 'Me/Me'] },
  u:  { name: 'Umbrous', description: 'Dominant, dosage-independent. U/u or U/U = " Umbrous" suffix.', combinations: ['u/u', 'U/u', 'U/U'] },
  mi: { name: 'Ruby Eyed Mottled', description: 'Dominant, homozygous lethal, hybrid/shared gene with Campbells. Mi/mi = " Ruby Eyed Mottled" suffix.', combinations: ['mi/mi', 'Mi/mi'] },
  s:  { name: 'Pied', description: 'Recessive. s/s = " Pied" suffix.', combinations: ['S/S', 'S/s', 's/s'] },
  wh: { name: 'Imperial', description: 'Incomplete dominant, homozygous lethal, hybrid/shared gene with Syrian Hamster. Wh/wh = " Imperial" suffix.', combinations: ['wh/wh', 'Wh/wh'] },
  // --- Coat genes (Campbells-hybrid ancestry) ---
  rx: { name: 'Rex',   description: 'Recessive coat texture. rx/rx = Rex.', combinations: ['Rx/Rx', 'Rx/rx', 'rx/rx'] },
  sa: { name: 'Satin', description: 'Recessive coat texture. sa/sa = Satin.', combinations: ['Sa/Sa', 'Sa/sa', 'sa/sa'] },
  wa: { name: 'Wavy',  description: 'Recessive coat texture. wa/wa = Wavy.', combinations: ['Wa/Wa', 'Wa/wa', 'wa/wa'] },
};
