/**
 * Syrian Hamster — Multi-locus phenotype combination rules
 *
 * Built from docs/genetics/SYRIAN_HAMSTER_GENETICS_MAP.md (2026-08-26 breeder
 * examples). Priority-ordered: the first rule whose `match` conditions ALL
 * pass wins. Rule shape mirrors fancyRatPhenotypeRules.js:
 *   { match: { [locusKey]: string[] }, phenotype: string }
 *
 * Locus key convention: lowercase mutant symbol (e.g. `a`, `b`, `cd`, `to`).
 * Wildtype allele = same letters capitalized. Genotype notation = `Allele1/Allele2`
 * (sex-linked `to` locus uses `allele/Y` for males).
 *
 * Loci: a, b, cd, ce, d, dg, e, p, sg, lg, u   (color genes)
 *       ba, ds, wh, s, rd                       (marking genes — appended as suffixes)
 *       hr, l, rx, sa                           (coat genes — appended as suffixes)
 *       to                                      (sex-linked/X-linked Yellow)
 *
 * A-locus shorthands:
 *   BLACK  = a/a   (Black base)
 *   AGOUTI = A/A or A/a  ((Golden) Agouti base)
 */

const BLACK  = ['a/a'];
const AGOUTI = ['A/A', 'A/a'];
const SG_ANY = ['Sg/sg', 'Sg/Sg'];
const U_ANY  = ['U/u', 'U/U'];
const TO_YELLOW = ['To/Y', 'To/To'];   // males (To/Y) and homozygous females (To/To) share the "solid" name
const TO_TORT   = ['To/to'];           // heterozygous females only — "Tortoiseshell" variant

// Genotype notations are matched as exact strings, so any input with alleles in
// reverse order (e.g. 'a/A') must be canonicalized first. Order: dominant/uppercase
// allele wins, then alphabetical. Sex-linked `allele/Y` notation is left untouched.
function normalizeNotation(notation) {
  if (typeof notation !== 'string' || !notation.includes('/')) return notation;
  const [a, b] = notation.split('/');
  if (!a || !b) return notation;
  if (b === 'Y') return notation;
  const aUpper = a[0] === a[0].toUpperCase() && a[0] !== a[0].toLowerCase();
  const bUpper = b[0] === b[0].toUpperCase() && b[0] !== b[0].toLowerCase();
  if (aUpper && !bUpper) return notation;
  if (!aUpper && bUpper) return `${b}/${a}`;
  return a.localeCompare(b) <= 0 ? notation : `${b}/${a}`;
}

function normalizeHamsterGenotype(genotype) {
  const normalized = {};
  for (const [locus, notation] of Object.entries(genotype)) {
    normalized[locus] = normalizeNotation(notation);
  }
  return normalized;
}

// =========================================================
// BASE COLOR RULES — Cd (fully epistatic) → E/Black-Eyed-Cream branch →
// To (sex-linked) branch → plain A-locus branch. Each tier is ordered most-
// specific (most loci) first, per rule-ordering convention.
// =========================================================

const CD_RULES = [
  // Cd — Dark Eared White locus: fully epistatic, overrides all other color loci.
  { match: { cd: ['cd/cd'], p: ['p/p'] }, phenotype: 'Red Eyed White' },
  { match: { cd: ['cd/cd'] },             phenotype: 'Dark-Eared White' },
];

const E_RULES = [
  // E — Black Eyed Cream locus: epistatic over A, but combines with B/Dg/P/Sg/Lg/U.
  { match: { e: ['e/e'], b: ['b/b'], p: ['p/p'], u: U_ANY },     phenotype: 'Copper' },
  { match: { e: ['e/e'], dg: ['dg/dg'], p: ['p/p'], u: U_ANY },  phenotype: 'Blue Mink' },
  { match: { e: ['e/e'], p: ['p/p'], u: U_ANY },                 phenotype: 'Mink' },
  { match: { e: ['e/e'], b: ['b/b'], dg: ['dg/dg'], u: U_ANY },  phenotype: 'Silver Chocolate Sable' },
  { match: { e: ['e/e'], b: ['b/b'], sg: ['Sg/sg'], u: U_ANY },  phenotype: 'Silver Chocolate Sable' },
  { match: { e: ['e/e'], b: ['b/b'], lg: ['Lg/lg'], u: U_ANY },  phenotype: 'Silver Chocolate Sable' },
  { match: { e: ['e/e'], b: ['b/b'], u: U_ANY },                 phenotype: 'Chocolate Sable' },
  { match: { e: ['e/e'], sg: SG_ANY, u: U_ANY },                 phenotype: 'Silver Sable' },
  { match: { e: ['e/e'], lg: ['Lg/lg'], u: U_ANY },              phenotype: 'Silver Sable' },
  { match: { e: ['e/e'], u: U_ANY },                             phenotype: 'Sable' },
  { match: { e: ['e/e'], dg: ['dg/dg'], p: ['p/p'] },            phenotype: 'Red Eyed Ivory' },
  { match: { e: ['e/e'], sg: ['Sg/sg'], p: ['p/p'] },            phenotype: 'Red Eyed Ivory' },
  { match: { e: ['e/e'], lg: ['Lg/lg'], p: ['p/p'] },            phenotype: 'Red Eyed Ivory' },
  { match: { e: ['e/e'], sg: ['Sg/Sg'], p: ['p/p'] },            phenotype: 'Silver White' },
  { match: { e: ['e/e'], sg: ['Sg/Sg'] },                        phenotype: 'Black-Eyed White' },
  { match: { e: ['e/e'], dg: ['dg/dg'] },                        phenotype: 'Ivory' },
  { match: { e: ['e/e'], sg: ['Sg/sg'] },                        phenotype: 'Ivory' },
  { match: { e: ['e/e'], lg: ['Lg/lg'] },                        phenotype: 'Ivory' },
  { match: { e: ['e/e'], p: ['p/p'] },                           phenotype: 'Red Eyed Cream' },
  { match: { e: ['e/e'], ce: ['ce/ce'] },                        phenotype: 'Extreme Dilute Black Eyed Cream' },
  { match: { e: ['e/e'] },                                       phenotype: 'Black Eyed Cream' },
];

const TO_RULES = [
  // To — Yellow locus: sex-linked/X-linked. Male (To/Y) and homozygous female
  // (To/To) always share the "solid" name; heterozygous female (To/to) gets
  // the "Tortoiseshell" variant instead.
  { match: { a: AGOUTI, sg: SG_ANY, u: U_ANY, to: TO_YELLOW },     phenotype: 'Silver Pearl Umbrous' },
  { match: { a: AGOUTI, lg: ['Lg/lg'], u: U_ANY, to: TO_YELLOW },  phenotype: 'Silver Pearl Umbrous' },
  { match: { a: AGOUTI, sg: SG_ANY, u: U_ANY, to: TO_TORT },       phenotype: 'Silver Umbrous Tortoiseshell' },
  { match: { a: AGOUTI, lg: ['Lg/lg'], u: U_ANY, to: TO_TORT },    phenotype: 'Silver Umbrous Tortoiseshell' },
  { match: { a: AGOUTI, dg: ['dg/dg'], p: ['p/p'], to: TO_YELLOW }, phenotype: 'Lilac Pearl' },
  { match: { a: AGOUTI, dg: ['dg/dg'], p: ['p/p'], to: TO_TORT },   phenotype: 'Lilac Tortoiseshell' },
  { match: { a: AGOUTI, sg: SG_ANY, to: TO_YELLOW },               phenotype: 'Silver Pearl' },
  { match: { a: AGOUTI, lg: ['Lg/lg'], to: TO_YELLOW },            phenotype: 'Silver Pearl' },
  { match: { a: AGOUTI, sg: SG_ANY, to: TO_TORT },                 phenotype: 'Silver Tortoiseshell' },
  { match: { a: AGOUTI, lg: ['Lg/lg'], to: TO_TORT },              phenotype: 'Silver Tortoiseshell' },
  { match: { a: AGOUTI, dg: ['dg/dg'], to: TO_YELLOW },            phenotype: 'Smoke Pearl' },
  { match: { a: AGOUTI, dg: ['dg/dg'], to: TO_TORT },              phenotype: 'Smoke Tortoiseshell' },
  { match: { a: AGOUTI, p: ['p/p'], to: TO_YELLOW },               phenotype: 'Honey' },
  { match: { a: AGOUTI, p: ['p/p'], to: TO_TORT },                 phenotype: 'Cinnamon Tortoiseshell' },
  { match: { a: BLACK, d: ['d/d'], to: TO_YELLOW },                phenotype: 'Blue Yellow' },
  { match: { a: BLACK, d: ['d/d'], to: TO_TORT },                  phenotype: 'Blue Tortoiseshell' },
  { match: { a: BLACK, ce: ['ce/ce'], to: TO_YELLOW },             phenotype: 'Extreme Dilute Yellow Black' },
  { match: { a: BLACK, ce: ['ce/ce'], to: TO_TORT },               phenotype: 'Extreme Dilute Black Tortoiseshell' },
  { match: { a: BLACK, to: TO_YELLOW },                            phenotype: 'Yellow Black' },
  { match: { a: BLACK, to: TO_TORT },                              phenotype: 'Black Tortoiseshell' },
  { match: { a: AGOUTI, to: TO_YELLOW },                           phenotype: 'Yellow' },
  { match: { a: AGOUTI, to: TO_TORT },                             phenotype: '(Golden) Agouti Tortoiseshell' },
];

const BASE_RULES = [
  // Plain A/B/Ce/D/Dg/P/Sg/Lg/U combos (no Cd, no e/e, no To).
  { match: { a: BLACK, b: ['b/b'], d: ['d/d'] },        phenotype: 'Lavender' },
  { match: { a: AGOUTI, b: ['b/b'], ce: ['ce/ce'] },    phenotype: 'Extreme Dilute Rust' },
  { match: { a: BLACK, d: ['d/d'], u: U_ANY },          phenotype: 'Blue Umbrous' },
  { match: { a: BLACK, p: ['p/p'], d: ['d/d'] },        phenotype: 'Dove Dilute' },
  { match: { a: BLACK, p: ['p/p'], dg: ['dg/dg'] },     phenotype: 'Dingy Dove' },
  { match: { a: BLACK, p: ['p/p'], sg: SG_ANY },        phenotype: 'Silver Dove' },
  { match: { a: AGOUTI, dg: ['dg/dg'], p: ['p/p'] },    phenotype: 'Lilac' },
  { match: { a: AGOUTI, sg: ['Sg/Sg'], p: ['p/p'] },    phenotype: 'Silver Blonde' },
  { match: { a: AGOUTI, sg: ['Sg/sg'], p: ['p/p'] },    phenotype: 'Blonde' },
  { match: { a: AGOUTI, lg: ['Lg/lg'], p: ['p/p'] },    phenotype: 'Blonde' },
  { match: { b: ['b/b'], dg: ['dg/dg'] },               phenotype: 'Beige' }, // applies regardless of A-locus
  { match: { a: BLACK, u: U_ANY },                      phenotype: 'Mahogany' },
  { match: { a: AGOUTI, u: U_ANY },                     phenotype: 'Golden Umbrous' },
  { match: { a: BLACK, sg: ['Sg/Sg'] },                 phenotype: 'Silver Black' },
  { match: { a: BLACK, sg: ['Sg/sg'] },                 phenotype: 'Dingy Black' },
  { match: { a: BLACK, lg: ['Lg/lg'] },                 phenotype: 'Dingy Black' },
  { match: { a: BLACK, dg: ['dg/dg'] },                 phenotype: 'Dingy Black' },
  { match: { a: BLACK, ce: ['ce/ce'] },                 phenotype: 'Extreme Dilute Black' },
  { match: { a: BLACK, d: ['d/d'] },                    phenotype: 'Blue' },
  { match: { a: BLACK, p: ['p/p'] },                    phenotype: 'Dove' },
  { match: { a: BLACK, b: ['b/b'] },                    phenotype: 'Chocolate' },
  { match: { a: AGOUTI, sg: ['Sg/sg'] },                phenotype: 'Silver Grey' },
  { match: { a: AGOUTI, sg: ['Sg/Sg'] },                phenotype: 'Silver Grey' },
  { match: { a: AGOUTI, lg: ['Lg/lg'] },                phenotype: 'Light Grey' },
  { match: { a: AGOUTI, dg: ['dg/dg'] },                phenotype: 'Dark Grey' },
  { match: { a: AGOUTI, d: ['d/d'] },                   phenotype: 'Golden Dilute' },
  { match: { a: AGOUTI, ce: ['ce/ce'] },                phenotype: 'Extreme Dilute Golden' },
  { match: { a: AGOUTI, b: ['b/b'] },                   phenotype: 'Rust' },
  { match: { a: AGOUTI, p: ['p/p'] },                   phenotype: 'Cinnamon' },
  { match: { a: BLACK },                                phenotype: 'Black' },
  { match: { a: AGOUTI },                               phenotype: '(Golden) Agouti' },
];

const SYRIAN_HAMSTER_BASE_PHENOTYPE_RULES = [...CD_RULES, ...E_RULES, ...TO_RULES, ...BASE_RULES];

function computeBasePhenotype(genotype) {
  for (const rule of SYRIAN_HAMSTER_BASE_PHENOTYPE_RULES) {
    const allMatch = Object.entries(rule.match).every(([locus, allowed]) => {
      const notation = genotype[locus];
      return notation != null && allowed.includes(notation);
    });
    if (allMatch) return rule.phenotype;
  }
  return 'Standard';
}

// =========================================================
// MARKING GENES (Ba, Ds, s, rd, Wh) — appended as suffixes, independent of base
// color. They do NOT form special combined names with each other ("just add
// up"), except when paired with a heterozygous To/to female: Ds/ds, Ba/*, or
// s/s each fold into "Tricolor"; rd/rd instead makes "Tortoiseshell Recessive
// Dappled". Wh/wh is named by E locus (Roan on e/e, White Bellied otherwise)
// and does not participate in the Tricolor/Dappled combos.
// =========================================================

function applyMarkings(phenotype, genotype) {
  const hasBa = genotype.ba === 'Ba/ba' || genotype.ba === 'Ba/Ba';
  const hasDs = genotype.ds === 'Ds/ds';
  const hasS  = genotype.s === 's/s';
  const hasRd = genotype.rd === 'rd/rd';
  const isTort = genotype.to === 'To/to';

  // The base color rules already bake "Tortoiseshell" into the phenotype name for To/to females;
  // strip it here so the suffixes below can supply the correct combined wording (Tricolor /
  // Tortoiseshell Recessive Dappled / plain Tortoiseshell) exactly once instead of duplicating it.
  if (isTort) {
    phenotype = phenotype.replace(/\s*Tortoiseshell\b/, '').trim();
  }

  const suffixes = [];

  const triColor = isTort && (hasBa || hasDs || hasS);
  if (triColor) {
    suffixes.push('Tricolor');
  } else {
    if (hasBa) suffixes.push('Banded');
    if (hasDs) suffixes.push('Dominant Spot');
    if (hasS) suffixes.push('Pied');
  }

  if (hasRd) {
    suffixes.push(isTort ? 'Tortoiseshell Recessive Dappled' : 'Recessive Dappled');
  } else if (isTort && !triColor) {
    suffixes.push('Tortoiseshell');
  }

  if (genotype.wh === 'Wh/wh') {
    suffixes.push(genotype.e === 'e/e' ? 'Roan' : 'White Bellied');
  }

  return suffixes.length ? `${phenotype} ${suffixes.join(' ')}` : phenotype;
}

// =========================================================
// COAT GENES (hr, l, rx, sa) — appended as suffixes, independent of color and
// markings ("just add up"), except Longhair + Rex = "Longhair Rex" (a plain
// combined name, not a distinct trait). Sa/Sa ("Super Satin") carries a
// high-risk-of-complications note.
// =========================================================

function applyCoatGenes(phenotype, genotype, notes) {
  const hasHr = genotype.hr === 'hr/hr';
  const hasL  = genotype.l === 'l/l';
  const hasRx = genotype.rx === 'rx/rx';
  const hasSa = genotype.sa === 'Sa/sa';
  const hasSuperSa = genotype.sa === 'Sa/Sa';

  const suffixes = [];
  if (hasHr) suffixes.push('Hairless');
  if (hasL && hasRx) {
    suffixes.push('Longhair Rex');
  } else {
    if (hasL) suffixes.push('Longhair');
    if (hasRx) suffixes.push('Rex');
  }
  if (hasSa) suffixes.push('Satin');
  if (hasSuperSa) {
    suffixes.push('Super Satin');
    notes.push('Super Satin (Sa/Sa) carries a high risk of health complications.');
  }

  return suffixes.length ? `${phenotype} ${suffixes.join(' ')}` : phenotype;
}

// =========================================================
// CARRIERS — every Recessive-type locus is carried when het. Carrier labels
// use the original mutation name (Full gene list table), not the
// base-dependent phenotype name.
// =========================================================

const SIMPLE_RECESSIVE_CARRIERS = {
  a:  { het: 'A/a',   trait: 'Black' },
  b:  { het: 'B/b',   trait: 'Rust' },
  cd: { het: 'Cd/cd', trait: 'Dark Eared White' },
  ce: { het: 'Ce/ce', trait: 'Extreme Dilute' },
  d:  { het: 'D/d',   trait: 'Blue' },
  dg: { het: 'Dg/dg', trait: 'Dark Grey' },
  e:  { het: 'E/e',   trait: 'Black Eyed Cream' },
  hr: { het: 'Hr/hr', trait: 'Hairless' },
  l:  { het: 'L/l',   trait: 'Longhair' },
  p:  { het: 'P/p',   trait: 'Cinnamon' },
  rx: { het: 'Rx/rx', trait: 'Rex' },
  s:  { het: 'S/s',   trait: 'Pied' },
  rd: { het: 'Rd/rd', trait: 'Recessive Dappled' },
};

// Recessive loci eligible for "possible het" (unconfirmed/probability-based carrier) notes.
export const SYRIAN_HAMSTER_POSSIBLE_HET_LOCI = Object.entries(SIMPLE_RECESSIVE_CARRIERS).map(([locus, { trait }]) => ({ locus, name: trait }));

export function getSyrianHamsterCarriers(genotype) {
  genotype = normalizeHamsterGenotype(genotype);
  const carriers = [];
  for (const [locus, { het, trait }] of Object.entries(SIMPLE_RECESSIVE_CARRIERS)) {
    if (genotype[locus] === het) carriers.push(trait);
  }
  return carriers;
}

/**
 * Evaluate a Syrian Hamster genotype against the documented phenotype rules.
 * @param {Object} genotype - e.g. { a: 'a/a', d: 'd/d', to: 'To/to', ... }
 * @returns {{ phenotype: string, carriers: string[], notes: string[] }}
 */
export function matchSyrianHamsterPhenotype(genotype) {
  genotype = normalizeHamsterGenotype(genotype);

  if (genotype.ds === 'Ds/Ds') {
    return { phenotype: 'LETHAL (Ds/Ds — in utero)', carriers: getSyrianHamsterCarriers(genotype), notes: [] };
  }
  if (genotype.wh === 'Wh/Wh') {
    return { phenotype: 'LETHAL (Wh/Wh)', carriers: getSyrianHamsterCarriers(genotype), notes: [] };
  }
  if (genotype.lg === 'Lg/Lg') {
    return { phenotype: 'LETHAL (Lg/Lg)', carriers: getSyrianHamsterCarriers(genotype), notes: [] };
  }

  let phenotype = computeBasePhenotype(genotype);
  phenotype = applyMarkings(phenotype, genotype);
  const notes = [];
  phenotype = applyCoatGenes(phenotype, genotype, notes);

  return { phenotype, carriers: getSyrianHamsterCarriers(genotype), notes };
}

// ---------------------------------------------------------------------------
// SYRIAN HAMSTER GENE LOCI — metadata for GeneticCodeBuilder visual selector
// and GeneticsCalculator dropdowns.
// ---------------------------------------------------------------------------

export const SYRIAN_HAMSTER_GENE_LOCI = {
  // --- Color genes ---
  a:  { name: 'Agouti',            description: 'A/- = (Golden) Agouti, a/a = Black', combinations: ['A/A', 'A/a', 'a/a'] },
  b:  { name: 'Rust',              description: 'Recessive. b/b = Rust (Agouti) or Chocolate (Black).', combinations: ['B/B', 'B/b', 'b/b'] },
  cd: { name: 'Dark Eared White',  description: 'Recessive, epistatic. cd/cd = Dark-Eared White regardless of base (Red Eyed White with p/p).', combinations: ['Cd/Cd', 'Cd/cd', 'cd/cd'] },
  ce: { name: 'Extreme Dilute',    description: 'Recessive. ce/ce = Extreme Dilute Black (Black) or Extreme Dilute Golden (Agouti).', combinations: ['Ce/Ce', 'Ce/ce', 'ce/ce'] },
  d:  { name: 'Blue (Dilution)',   description: 'Recessive. d/d = Blue (Black) or Golden Dilute (Agouti).', combinations: ['D/D', 'D/d', 'd/d'] },
  dg: { name: 'Dark Grey',         description: 'Recessive. dg/dg = Dingy Black (Black), Dark Grey (Agouti), Ivory (Black Eyed Cream).', combinations: ['Dg/Dg', 'Dg/dg', 'dg/dg'] },
  e:  { name: 'Black Eyed Cream',  description: 'Recessive, epistatic. e/e = Black Eyed Cream regardless of A-locus base.', combinations: ['E/E', 'E/e', 'e/e'] },
  p:  { name: 'Cinnamon',          description: 'Recessive. p/p = Cinnamon (Agouti) or Dove (Black).', combinations: ['P/P', 'P/p', 'p/p'] },
  sg: { name: 'Silver Grey',       description: 'Incomplete Dominant. Sg/sg = Silver Grey (Agouti, dosage-independent) or Dingy Black (Black). Sg/Sg = Silver Black (Black) — dosage matters on Black/Cream bases only.', combinations: ['sg/sg', 'Sg/sg', 'Sg/Sg'] },
  lg: { name: 'Light Grey',        description: 'Incomplete Dominant, homozygous lethal. Lg/lg = Light Grey (Agouti) or Dingy Black (Black).', combinations: ['lg/lg', 'Lg/lg'] },
  u:  { name: 'Umbrous',           description: 'Dominant. U/u = U/U = Umbrous (same name regardless of dosage) — Mahogany (Black) or Golden Umbrous (Agouti).', combinations: ['u/u', 'U/u', 'U/U'] },
  // --- Marking genes ---
  ba: { name: 'Banded',            description: 'Dominant. Ba/ba = Ba/Ba = Banded (same name regardless of dosage). Folds into Tricolor with To/to.', combinations: ['ba/ba', 'Ba/ba', 'Ba/Ba'] },
  ds: { name: 'Dominant Spot',     description: 'Incomplete Dominant, homozygous lethal in utero. Ds/ds = Dominant Spot. Folds into Tricolor with To/to.', combinations: ['ds/ds', 'Ds/ds'] },
  wh: { name: 'Roan',              description: 'Incomplete Dominant, homozygous lethal. Wh/wh = Roan (on e/e base) or White Bellied (on other bases).', combinations: ['wh/wh', 'Wh/wh'] },
  s:  { name: 'Pied',              description: 'Recessive. s/s = Pied. Folds into Tricolor with To/to.', combinations: ['S/S', 'S/s', 's/s'] },
  rd: { name: 'Recessive Dappled', description: 'Recessive. rd/rd = Recessive Dappled (Tortoiseshell Recessive Dappled with To/to).', combinations: ['Rd/Rd', 'Rd/rd', 'rd/rd'] },
  // --- Coat genes ---
  hr: { name: 'Hairless',          description: 'Recessive. hr/hr = Hairless.', combinations: ['Hr/Hr', 'Hr/hr', 'hr/hr'] },
  l:  { name: 'Longhair',          description: 'Recessive. l/l = Longhair. l/l + rx/rx = Longhair Rex.', combinations: ['L/L', 'L/l', 'l/l'] },
  rx: { name: 'Rex',               description: 'Recessive. rx/rx = Rex. l/l + rx/rx = Longhair Rex.', combinations: ['Rx/Rx', 'Rx/rx', 'rx/rx'] },
  sa: { name: 'Satin',             description: 'Incomplete Dominant, not lethal but homozygote is high-risk. Sa/sa = Satin. Sa/Sa = Super Satin (high risk of complications).', combinations: ['sa/sa', 'Sa/sa', 'Sa/Sa'] },
  // --- Sex-linked ---
  to: {
    name: 'Yellow',
    description: 'Sex-linked (X-linked) Dominant. Males (To/Y) and homozygous females (To/To) share the "solid" name; heterozygous females (To/to) show a "Tortoiseshell" variant.',
    combinations: ['to/to', 'To/to', 'To/To'],
    maleCombinations: ['to/Y', 'To/Y'],
  },
};
