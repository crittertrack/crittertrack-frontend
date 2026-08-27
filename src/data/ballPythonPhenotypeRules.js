/**
 * Ball Python — Multi-locus phenotype combination rules
 *
 * Built from docs/genetics/BALL_PYTHON_GENETICS_MAP.md (2026-08-27).
 * Rule shape mirrors campbellsDwarfHamsterPhenotypeRules.js / syrianHamsterPhenotypeRules.js.
 *
 * Locus key convention: lowercase mutant symbol = Recessive gene (wildtype
 * capitalized), uppercase mutant symbol = Incomplete Dominant/Dominant gene
 * (wildtype lowercase). Genotype notation = `Allele1/Allele2`.
 *
 * Loci: pi, cl, gs, ax, hy, cml,
 *       dg, sun, rax, tof, lav, ult, leo           (Recessive — dg/rax/lav/ult are
 *         distinct non-complementary lines from ax/albCdy, not the same gene)
 *       cry, mig                                  (Recessive — mig is a distinct,
 *         non-complementary line from cry, same simplification style as rax/lav/ult;
 *         added batch 11, 2026-08-29)
 *       pas, en, fi, cho, van,
 *       pin, puz, wom, sab, od,
 *       ban, cg, yb, grv, spc, rus, spe, mys, chn, hon, bam,
 *       spn, asp                                  (Incomplete Dominant,
 *         own Super name — see 2026-08-27/2026-08-28 correction/expansion notes below)
 *       jol, lor, raz, bon                         (Incomplete Dominant, own Super name;
 *         added batch 11, 2026-08-29 — see addendum below)
 *       sch                                        (Incomplete Dominant, own homozygous name
 *         but NOT called "Super" — Sch/Sch is called "Scaleless", not "Super Scaleless Head")
 *       cha                                       (Incomplete Dominant, homozygous LETHAL)
 *       sp                                        (Dominant, no distinct homozygous form)
 *       les, moj, but, pha                        (BEL complex — see belComplexName())
 *       cinBp                                     (true multi-allelic locus: n/Cin/Bp)
 *       albCdy                                    (true multi-allelic locus: n/Alb/Cdy — see
 *         ALBINO_COMPLEX_NAMES; Albino and Candy are recessive alleles of the SAME gene)
 *       lacGhi                                     (true multi-allelic locus: n/Lac/Ghi — see
 *         LACE_GHI_NAMES; Lace and GHI are Incomplete Dominant alleles of the SAME gene,
 *         "proven allelic with genetic testing" per source site, added 2026-08-28 BATCH 9)
 *
 * CORRECTION (2026-08-27, verified against worldofballpythons.com/en/morphs):
 * an earlier "Yellow Belly complex" (yb/spc/rus/sst sharing a Gravel/Ivory
 * collapse) and "Banana/Coral Glow multi-allelic locus" (banCg) design was
 * WRONG and has been reverted. Yellow Belly, Gravel, Special, Russo, Specter,
 * and Banana are each confirmed independent standalone genes ("Base Morph"
 * with their own "Super" homozygous form on that site) — they do NOT share a
 * locus or collapse into a combined name. "Superstripe" is NOT a standalone
 * gene at all — it is the combo name for Specter + Yellow Belly (see
 * BALL_PYTHON_COMBO_ALIASES).
 *
 * EXPANSION (2026-08-27, same source): Coral Glow was re-added as its own
 * standalone gene `cg` — the plain "coral-glow" page was mistagged
 * "Designer Morph" but its "(female)" variant confirms it's a real
 * "Base Morph", Incomplete Dominant. NOTE: the site describes it as
 * "sex linked with frequent crossing over" — that inheritance mechanic is
 * NOT modeled here (this engine has no sex-linked/crossover support for any
 * species yet), so Coral Glow is simplified to plain autosomal Incomplete
 * Dominant like every other gene, same as the Axanthic-lines simplification.
 * Also added: Mystic (`mys`), Chino (`chn`), Honey (`hon` — site states
 * Honey and Mocha are "genetically identical", modeled as one locus using
 * "Honey" as the canonical name). These + Special/Russo/Mojave form a wider
 * "BEL-adjacent" family confirmed by two more combo names: Crystal (Mojave +
 * Special) and Mystic Potion (Mojave + Mystic) — see BALL_PYTHON_COMBO_ALIASES.
 * Deliberately NOT expanding `belComplexName()`/BEL_COMPLEX_MEMBERS itself to
 * include these — unlike Lesser/Mojave/Butter/Phantom (which always collapse
 * to ONE shared name, "Blue-Eyed Leucistic"), each of these outer members
 * gets its OWN distinct combo name with Mojave (Crystal, Mystic Potion), so a
 * universal-collapse rule would be factually wrong for this group; per-pair
 * combo aliases are the correct mechanism instead.
 * Deliberately NOT added: "Special Noco" (site confirms it's genetically
 * DISTINCT from regular Special, a separate breeder line) — same kind of
 * simplification as collapsing the real multiple non-complementary Axanthic
 * lines into one `ax` locus, to avoid over-proliferating near-identical loci.
 *
 * FURTHER EXPANSION (2026-08-27, same source, same session): confirmed
 * Bamboo (`bam`) as another standalone Incomplete Dominant gene, and found
 * concrete evidence resolving the previously-open Russo↔BEL question: "Opal
 * Diamond" = Russo + Phantom ("a combo made by combining Russo and
 * Phantom") and "cassandra" = Honey/Mocha + Russo ("An amazing combination
 * from the bel complex") — both explicitly tied to the BEL complex, same as
 * Crystal/Mystic Potion above. Modeled as 2 more combo aliases (Opal
 * Diamond, Cassandra), again WITHOUT touching belComplexName()/
 * BEL_COMPLEX_MEMBERS itself, for the same reason: each pair gets its own
 * distinct name rather than collapsing to the single shared "Blue-Eyed
 * Leucistic" name. The site's own detail page for "Mojave - Russo" 404s
 * even when reached via the search UI's own result-row click (a site bug,
 * not a slug-guessing mistake on our part) — left unconfirmed/unmodeled. *
 * BATCH 8 (2026-08-28, "finalize standalone genes" pass, same source):
 * confirmed 4 more independent standalone Incomplete Dominant genes not
 * previously modeled: Lace (`lac`, first produced 2002 by Cv Exotics),
 * Scaleless Head (`sch`, first produced 2010 by Brian Barczyk/Bhb
 * Reptiles — NOTE unusual naming: Sch/Sch is called "Scaleless", NOT
 * "Super Scaleless Head", though "(Super Scaleless Head)" is a documented
 * alias for it), Spotnose (`spn`, first produced 2005 by VPI), and
 * Asphalt (`asp`, first produced 2009 by Todd Constable). Also confirmed
 * "Sterling" is NOT a standalone gene at all — it is a breeder trade
 * nickname for Cinnamon-based designer combos (e.g. "Sterling Bee" =
 * "Cinnamon Spider Super Pastel"), so nothing was added for it. Checked
 * "Black Eyed Leucistic" — not found/cataloged on this source site under
 * any tried slug or search term, left unmodeled (unconfirmed).
 *
 * BATCH 8 also converts `alb` (Albino) from a plain recessive locus into a
 * true multi-allelic locus `albCdy` (n/Alb/Cdy), matching the `cinBp`
 * pattern: the site's Candy page explicitly states Candy "is allelic with
 * regular Albino", and the compound Alb/Cdy genotype has its own confirmed
 * name, "Candino" ("the combination of Candy and Albino"). Unlike cinBp
 * (whose alleles are each Incomplete Dominant, visible with 1 copy), Albino
 * and Candy are each RECESSIVE — a single copy of either allele (Alb/n or
 * Cdy/n) is an invisible carrier state (see ALBINO_COMPLEX_CARRIERS), and
 * only paired-mutant genotypes (Alb/Alb, Cdy/Cdy, or the Alb/Cdy compound)
 * produce a visible name. See ALBINO_COMPLEX_NAMES below.
 *
 * BATCH 9 (2026-08-28, start of "combo aliases" pass, same source): found
 * that many famous "Designer Morph"-tagged combo pages (Pewter, Queen Bee,
 * Lemonback) have NO "Description" text confirming their exact composition
 * — only "Allelic combo" pages and a minority of "Designer Morph" pages
 * reliably state it. Two more combos WERE confirmed via explicit
 * "Description" text and added below: Vanilla Cream (Vanilla + Fire) and
 * Chocolate Chip (Pastel + Sable + Spider, confirmed via its "(Pastel Sable
 * Spider)" heading alias). Also discovered this site names individual BEL
 * complex pairs separately (e.g. "Lesser Mojave" = Lesser+Mojave, "Purple
 * Passion" = Mojave+Phantom) rather than universally as "Blue-Eyed
 * Leucistic" — this is NOT modeled as separate aliases here, since it would
 * contradict the existing (well-established, universal hobby term)
 * BEL_COMPLEX_MEMBERS collapse-to-one-name design; these are treated as
 * historical/breeder marketing nicknames for the same BEL outcome.
 *
 * BATCH 9 also found this source site's full morph list (`/en/morphs`,
 * paginated "Show more" table — previously missed, this DOES exist despite
 * earlier sessions concluding there was no browse/filter UI) explicitly
 * states "Lace and Ghi have been proven to be allelic with genetic
 * testing." This is a real architecture correction, same shape as the
 * Cinnamon/Black Pastel and Albino/Candy migrations: `lac` (Lace) and `ghi`
 * (GHI) were merged into a true multi-allelic locus `lacGhi` (n/Lac/Ghi).
 * This ALSO fixes a separate pre-existing bug: `ghi` had been modeled as
 * Recessive since batch 2, but the site's own Ghi page states its genetics
 * is actually Incomplete Dominant (matching the existing "Super Ghi"
 * cataloged entry, which only makes sense for an Incomplete Dominant gene)
 * — so both Lace and GHI are visible with a single copy, unlike Albino/
 * Candy. Lac/Ghi compound = "Lace Ghi" (its own confirmed name, matches
 * the site's own "Lace Ghi" detail page). Also added "Parkway" combo alias
 * (Asphalt + Specter, explicit "Description" text). Discovered other
 * "Allelic combo" entries (Crypton = Cryptic + Clown, Russo Daddy = Russo +
 * "Daddy" gene, Lori - Razor, Saar - Sable) that involve genes NOT modeled
 * in this engine (Cryptic, Daddy, Lori, Razor, Saar) — left unmodeled,
 * would require adding new standalone genes (out of Phase B's combo-only
 * scope); noted in docs/genetics/BALL_PYTHON_UNVERIFIED_COMBO_CANDIDATES.md.
 *
 * BATCH 11 (2026-08-29, user requested reopening Phase A: "eventually our
 * calculator needs to have all genes"): added 6 more standalone genes found
 * via combo-page dependencies during BATCH 9/10 research: Jolt (`jol`),
 * Lori (`lor`), Razor (`raz`), Bongo (`bon`) — all confirmed Incomplete
 * Dominant "Base Morph" with their own "Super" name — plus Cryptic (`cry`)
 * and Migraine (`mig`), both confirmed Recessive. Migraine's own page
 * states "Migraine is a line of Cryptic" with an identical phenotype
 * description and the SAME "Cryptic" genetic test — modeled as a separate
 * locus anyway (not collapsed), matching this file's existing convention
 * for other confirmed-distinct "lines" of a base gene (rax/lav/ult). Also
 * discovered "Saar" is NOT a separate gene at all — its own page states
 * "Proherper genetic testing has proven this to be identical to Chocolate",
 * i.e. a straight synonym (same pattern as Honey/Mocha) — no new locus was
 * added for it, `cho` (Chocolate) is reused instead.
 *
 * This unblocked 8 combo aliases: Crypton (Cryptic+Clown) and Mixer
 * (Migraine+Clown) were confirmed via explicit "Description" text. Lori
 * Razor, Saar Sable, Jolt Lori, Jolt Razor, Enchi Jolt, and Bongo Saar all
 * have a correctly-loading page `<title>` (confirming the exact name/
 * composition) but their page body 404s — the same site-bug pattern seen
 * with "Mojave - Russo" and "Enchi - Jolt" in earlier batches — so their
 * composition is inferred from the title/name rather than an explicit
 * Description. "Russo Daddy" remains unmodeled: its dependency, "Daddy",
 * 404s even as a standalone gene page with no usable title, so it could
 * not be confirmed as a real gene name at all. */

// Genotype notations are matched as exact strings, so any input with alleles in
// reverse order must be canonicalized first. Order: dominant/uppercase allele
// wins, then alphabetical (same convention as the hamster/rat rule files).
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

function normalizeBallPythonGenotype(genotype) {
  const normalized = {};
  for (const [locus, notation] of Object.entries(genotype)) {
    normalized[locus] = normalizeNotation(notation);
  }
  return normalized;
}

// =========================================================
// CINNAMON / BLACK PASTEL — true multi-allelic locus (`cinBp`), confirmed
// 2026-08-27: these are different alleles of ONE gene, not two independent
// loci. Cin/Bp is its own compound name, never collapsed into either Super
// form.
// =========================================================

const BLACK_COMPLEX_NAMES = {
  'Cin/n': 'Cinnamon',
  'Bp/n': 'Black Pastel',
  'Cin/Cin': 'Super Cinnamon',
  'Bp/Bp': 'Super Black Pastel',
  'Bp/Cin': 'Cinnamon Black Pastel',
};

// =========================================================
// BEL COMPLEX — Lesser/Mojave/Butter/Phantom are different mutations at
// essentially the same gene. ANY 2 mutant copies across these 4 loci
// (same gene twice, or two different genes) collapse to Blue-Eyed
// Leucistic instead of stacking the individual names.
// =========================================================

const BEL_COMPLEX_MEMBERS = [
  { locus: 'les', symbol: 'Les', name: 'Lesser' },
  { locus: 'moj', symbol: 'Moj', name: 'Mojave' },
  { locus: 'but', symbol: 'But', name: 'Butter' },
  { locus: 'pha', symbol: 'Pha', name: 'Phantom' },
];

function belComplexName(genotype) {
  let totalCopies = 0;
  let singleName = null;
  for (const { locus, symbol, name } of BEL_COMPLEX_MEMBERS) {
    const notation = genotype[locus];
    if (!notation) continue;
    const copies = notation.split('/').filter((allele) => allele === symbol).length;
    if (copies > 0) {
      totalCopies += copies;
      singleName = name;
    }
  }
  if (totalCopies >= 2) return 'Blue-Eyed Leucistic';
  if (totalCopies === 1) return singleName;
  return null;
}

// =========================================================
// STANDALONE INCOMPLETE DOMINANT GENES — each has its own het name and a
// distinct homozygous "Super" name (Champagne and Spider are handled
// separately since they don't follow this same het/homo shape).
// Yellow Belly/Gravel/Special/Russo/Specter/Banana each confirmed as
// independent standalone genes (2026-08-27, worldofballpythons.com) — NOT
// a shared complex, contrary to an earlier (incorrect) design.
// =========================================================

const SIMPLE_INCOMPLETE_DOMINANT_RULES = [
  { locus: 'cho', het: 'Cho/cho', homo: 'Cho/Cho', hetName: 'Chocolate', homoName: 'Super Chocolate' },
  { locus: 'fi', het: 'Fi/fi', homo: 'Fi/Fi', hetName: 'Fire', homoName: 'Black Fire' },
  { locus: 'en', het: 'En/en', homo: 'En/En', hetName: 'Enchi', homoName: 'Super Enchi' },
  { locus: 'pas', het: 'Pas/pas', homo: 'Pas/Pas', hetName: 'Pastel', homoName: 'Super Pastel' },
  { locus: 'van', het: 'Van/van', homo: 'Van/Van', hetName: 'Vanilla', homoName: 'Super Vanilla' },
  { locus: 'pin', het: 'Pin/pin', homo: 'Pin/Pin', hetName: 'Pinstripe', homoName: 'Super Pinstripe' },
  { locus: 'puz', het: 'Puz/puz', homo: 'Puz/Puz', hetName: 'Puzzle', homoName: 'Super Puzzle' },
  { locus: 'wom', het: 'Wom/wom', homo: 'Wom/Wom', hetName: 'Woma', homoName: 'Super Woma' },
  { locus: 'sab', het: 'Sab/sab', homo: 'Sab/Sab', hetName: 'Sable', homoName: 'Super Sable' },
  { locus: 'od', het: 'Od/od', homo: 'Od/Od', hetName: 'Orange Dream', homoName: 'Super Orange Dream' },
  { locus: 'ban', het: 'Ban/ban', homo: 'Ban/Ban', hetName: 'Banana', homoName: 'Super Banana' },
  { locus: 'cg', het: 'Cg/cg', homo: 'Cg/Cg', hetName: 'Coral Glow', homoName: 'Super Coral Glow' },
  { locus: 'yb', het: 'Yb/yb', homo: 'Yb/Yb', hetName: 'Yellow Belly', homoName: 'Super Yellow Belly' },
  { locus: 'grv', het: 'Grv/grv', homo: 'Grv/Grv', hetName: 'Gravel', homoName: 'Super Gravel' },
  { locus: 'spc', het: 'Spc/spc', homo: 'Spc/Spc', hetName: 'Special', homoName: 'Super Special' },
  { locus: 'rus', het: 'Rus/rus', homo: 'Rus/Rus', hetName: 'Russo', homoName: 'Super Russo' },
  { locus: 'spe', het: 'Spe/spe', homo: 'Spe/Spe', hetName: 'Specter', homoName: 'Super Specter' },
  { locus: 'mys', het: 'Mys/mys', homo: 'Mys/Mys', hetName: 'Mystic', homoName: 'Super Mystic' },
  { locus: 'chn', het: 'Chn/chn', homo: 'Chn/Chn', hetName: 'Chino', homoName: 'Super Chino' },
  { locus: 'hon', het: 'Hon/hon', homo: 'Hon/Hon', hetName: 'Honey', homoName: 'Super Honey' },
  { locus: 'bam', het: 'Bam/bam', homo: 'Bam/Bam', hetName: 'Bamboo', homoName: 'Super Bamboo' },
  { locus: 'sch', het: 'Sch/sch', homo: 'Sch/Sch', hetName: 'Scaleless Head', homoName: 'Scaleless' },
  { locus: 'spn', het: 'Spn/spn', homo: 'Spn/Spn', hetName: 'Spotnose', homoName: 'Super Spotnose' },
  { locus: 'asp', het: 'Asp/asp', homo: 'Asp/Asp', hetName: 'Asphalt', homoName: 'Super Asphalt' },
  { locus: 'jol', het: 'Jol/jol', homo: 'Jol/Jol', hetName: 'Jolt', homoName: 'Super Jolt' },
  { locus: 'lor', het: 'Lor/lor', homo: 'Lor/Lor', hetName: 'Lori', homoName: 'Super Lori' },
  { locus: 'raz', het: 'Raz/raz', homo: 'Raz/Raz', hetName: 'Razor', homoName: 'Super Razor' },
  { locus: 'bon', het: 'Bon/bon', homo: 'Bon/Bon', hetName: 'Bongo', homoName: 'Super Bongo' },
];

// =========================================================
// ALBINO / CANDY — true multi-allelic locus (`albCdy`), confirmed
// 2026-08-28: Candy "is allelic with regular Albino" (same gene, different
// mutant allele). Both are RECESSIVE — a single copy of either allele is an
// invisible carrier (see ALBINO_COMPLEX_CARRIERS below); only paired-mutant
// genotypes are visible. Alb/Cdy compound = "Candino", its own confirmed name.
// =========================================================

const ALBINO_COMPLEX_NAMES = {
  'Alb/Alb': 'Albino',
  'Cdy/Cdy': 'Candy',
  'Alb/Cdy': 'Candino',
};

const ALBINO_COMPLEX_CARRIERS = {
  'Alb/n': 'Albino',
  'Cdy/n': 'Candy',
};

// =========================================================
// LACE / GHI — true multi-allelic locus (`lacGhi`), confirmed 2026-08-28:
// "Lace and Ghi have been proven to be allelic with genetic testing."
// CORRECTION: GHI was previously (wrongly) modeled as Recessive — the site
// confirms it's actually Incomplete Dominant, same shape as Lace, so both
// are visible with a single copy (unlike Albino/Candy). Ghi/Lac compound =
// "Lace Ghi", its own confirmed name.
// =========================================================

const LACE_GHI_NAMES = {
  'Lac/n': 'Lace',
  'Ghi/n': 'GHI',
  'Lac/Lac': 'Super Lace',
  'Ghi/Ghi': 'Super Ghi',
  'Ghi/Lac': 'Lace Ghi',
};

// =========================================================
// RECESSIVE GENES — homozygous mutant only.
// =========================================================

const RECESSIVE_RULES = [
  { locus: 'pi', homo: 'pi/pi', name: 'Piebald' },
  { locus: 'cl', homo: 'cl/cl', name: 'Clown' },
  { locus: 'gs', homo: 'gs/gs', name: 'Genetic Stripe' },
  { locus: 'ax', homo: 'ax/ax', name: 'Axanthic' },
  { locus: 'hy', homo: 'hy/hy', name: 'Hypo' },
  { locus: 'cml', homo: 'cml/cml', name: 'Caramel' },
  { locus: 'dg', homo: 'dg/dg', name: 'Desert Ghost' },
  { locus: 'sun', homo: 'sun/sun', name: 'Sunset' },
  { locus: 'rax', homo: 'rax/rax', name: 'Red Axanthic' },
  { locus: 'tof', homo: 'tof/tof', name: 'Toffee' },
  { locus: 'lav', homo: 'lav/lav', name: 'Lavender Albino' },
  { locus: 'ult', homo: 'ult/ult', name: 'Ultramel' },
  { locus: 'leo', homo: 'leo/leo', name: 'Leopard' },
  { locus: 'cry', homo: 'cry/cry', name: 'Cryptic' },
  { locus: 'mig', homo: 'mig/mig', name: 'Migraine' },
];

// =========================================================
// CARRIERS — Recessive loci are carried when het. Incomplete Dominant /
// Dominant loci (including BEL complex + black complex members) are
// visible in any dosage, so they are never silently "carried."
// =========================================================

const SIMPLE_RECESSIVE_CARRIERS = {
  pi: { het: 'Pi/pi', trait: 'Piebald' },
  cl: { het: 'Cl/cl', trait: 'Clown' },
  gs: { het: 'Gs/gs', trait: 'Genetic Stripe' },
  ax: { het: 'Ax/ax', trait: 'Axanthic' },
  hy: { het: 'Hy/hy', trait: 'Hypo' },
  cml: { het: 'Cml/cml', trait: 'Caramel' },
  dg: { het: 'Dg/dg', trait: 'Desert Ghost' },
  sun: { het: 'Sun/sun', trait: 'Sunset' },
  rax: { het: 'Rax/rax', trait: 'Red Axanthic' },
  tof: { het: 'Tof/tof', trait: 'Toffee' },
  lav: { het: 'Lav/lav', trait: 'Lavender Albino' },
  ult: { het: 'Ult/ult', trait: 'Ultramel' },
  leo: { het: 'Leo/leo', trait: 'Leopard' },
  cry: { het: 'Cry/cry', trait: 'Cryptic' },
  mig: { het: 'Mig/mig', trait: 'Migraine' },
};

export function getBallPythonCarriers(genotype) {
  genotype = normalizeBallPythonGenotype(genotype);
  const carriers = [];
  for (const [locus, { het, trait }] of Object.entries(SIMPLE_RECESSIVE_CARRIERS)) {
    if (genotype[locus] === het) carriers.push(trait);
  }
  const albinoCarrier = ALBINO_COMPLEX_CARRIERS[genotype.albCdy];
  if (albinoCarrier) carriers.push(albinoCarrier);
  return carriers;
}

// =========================================================
// "DESIGNER" COMBO ALIASES — same mechanic as Blue+Chocolate="Lilac" in the
// hamster rule files: two independent genes stacked together get their own
// hobby-recognized name instead of two words. Only the handful of combos
// below are confident/well-established; every other simultaneous-gene
// combination just falls back to the plain space-joined stacked names
// (no alias is invented). Order matters — more specific (homozygous) rules
// must be checked before their heterozygous counterparts.
// =========================================================

const BALL_PYTHON_COMBO_ALIASES = [
  { requires: { pas: ['Pas/Pas'], sp: ['Sp/sp', 'Sp/Sp'] }, remove: ['Super Pastel', 'Spider'], alias: 'Killer Bee' },
  { requires: { pas: ['Pas/pas'], sp: ['Sp/sp', 'Sp/Sp'] }, remove: ['Pastel', 'Spider'], alias: 'Bumblebee' },
  { requires: { pas: ['Pas/pas'], puz: ['Puz/puz'] }, remove: ['Pastel', 'Puzzle'], alias: 'Pastave' },
  { requires: { spe: ['Spe/spe'], yb: ['Yb/yb'] }, remove: ['Specter', 'Yellow Belly'], alias: 'Super Stripe' },
  { requires: { grv: ['Grv/grv'], yb: ['Yb/yb'] }, remove: ['Gravel', 'Yellow Belly'], alias: 'Highway' },
  { requires: { rus: ['Rus/rus'], spc: ['Spc/spc'] }, remove: ['Russo', 'Special'], alias: 'The Diamond' },
  { requires: { moj: ['Moj/moj', 'Moj/Moj'], spc: ['Spc/spc', 'Spc/Spc'] }, remove: ['Mojave', 'Special'], alias: 'Crystal' },
  { requires: { moj: ['Moj/moj', 'Moj/Moj'], mys: ['Mys/mys', 'Mys/Mys'] }, remove: ['Mojave', 'Mystic'], alias: 'Mystic Potion' },
  { requires: { rus: ['Rus/rus', 'Rus/Rus'], pha: ['Pha/pha', 'Pha/Pha'] }, remove: ['Russo', 'Phantom'], alias: 'Opal Diamond' },
  { requires: { hon: ['Hon/hon', 'Hon/Hon'], rus: ['Rus/rus', 'Rus/Rus'] }, remove: ['Honey', 'Russo'], alias: 'Cassandra' },
  { requires: { van: ['Van/van'], fi: ['Fi/fi'] }, remove: ['Vanilla', 'Fire'], alias: 'Vanilla Cream' },
  { requires: { pas: ['Pas/pas'], sab: ['Sab/sab'], sp: ['Sp/sp', 'Sp/Sp'] }, remove: ['Pastel', 'Sable', 'Spider'], alias: 'Chocolate Chip' },
  { requires: { asp: ['Asp/asp'], spe: ['Spe/spe'] }, remove: ['Asphalt', 'Specter'], alias: 'Parkway' },
  { requires: { hon: ['Hon/hon', 'Hon/Hon'], pha: ['Pha/pha', 'Pha/Pha'] }, remove: ['Honey', 'Phantom'], alias: 'Leche' },
  { requires: { cry: ['cry/cry'], cl: ['cl/cl'] }, remove: ['Cryptic', 'Clown'], alias: 'Crypton' },
  { requires: { mig: ['mig/mig'], cl: ['cl/cl'] }, remove: ['Migraine', 'Clown'], alias: 'Mixer' },
  { requires: { lor: ['Lor/lor', 'Lor/Lor'], raz: ['Raz/raz', 'Raz/Raz'] }, remove: ['Lori', 'Super Lori', 'Razor', 'Super Razor'], alias: 'Lori Razor' },
  { requires: { cho: ['Cho/cho', 'Cho/Cho'], sab: ['Sab/sab', 'Sab/Sab'] }, remove: ['Chocolate', 'Super Chocolate', 'Sable', 'Super Sable'], alias: 'Saar Sable' },
  { requires: { jol: ['Jol/jol', 'Jol/Jol'], lor: ['Lor/lor', 'Lor/Lor'] }, remove: ['Jolt', 'Super Jolt', 'Lori', 'Super Lori'], alias: 'Jolt Lori' },
  { requires: { jol: ['Jol/jol', 'Jol/Jol'], raz: ['Raz/raz', 'Raz/Raz'] }, remove: ['Jolt', 'Super Jolt', 'Razor', 'Super Razor'], alias: 'Jolt Razor' },
  { requires: { en: ['En/en', 'En/En'], jol: ['Jol/jol', 'Jol/Jol'] }, remove: ['Enchi', 'Super Enchi', 'Jolt', 'Super Jolt'], alias: 'Enchi Jolt' },
  { requires: { bon: ['Bon/bon', 'Bon/Bon'], cho: ['Cho/cho', 'Cho/Cho'] }, remove: ['Bongo', 'Super Bongo', 'Chocolate', 'Super Chocolate'], alias: 'Bongo Saar' },
];

function applyComboAliases(traits, genotype) {
  for (const rule of BALL_PYTHON_COMBO_ALIASES) {
    const matches = Object.entries(rule.requires).every(([locus, allowed]) => allowed.includes(genotype[locus]));
    if (!matches) continue;
    let insertAt = traits.length;
    for (const name of rule.remove) {
      const idx = traits.indexOf(name);
      if (idx !== -1) {
        insertAt = Math.min(insertAt, idx);
        traits.splice(idx, 1);
      }
    }
    traits.splice(insertAt, 0, rule.alias);
  }
  return traits;
}

/**
 * Evaluate a Ball Python genotype against the documented phenotype rules.
 * @param {Object} genotype - e.g. { cinBp: 'Cin/n', pas: 'Pas/pas', ... }
 * @returns {{ phenotype: string, carriers: string[], notes: string[] }}
 */
export function matchBallPythonPhenotype(genotype) {
  genotype = normalizeBallPythonGenotype(genotype);

  if (genotype.cha === 'Cha/Cha') {
    return { phenotype: 'LETHAL (Cha/Cha)', carriers: getBallPythonCarriers(genotype), notes: [] };
  }

  const traits = [];

  const blackComplex = BLACK_COMPLEX_NAMES[genotype.cinBp];
  if (blackComplex) traits.push(blackComplex);

  for (const rule of SIMPLE_INCOMPLETE_DOMINANT_RULES) {
    if (genotype[rule.locus] === rule.homo) traits.push(rule.homoName);
    else if (genotype[rule.locus] === rule.het) traits.push(rule.hetName);
  }

  if (genotype.cha === 'Cha/cha') traits.push('Champagne');
  if (genotype.sp === 'Sp/sp' || genotype.sp === 'Sp/Sp') traits.push('Spider');

  const bel = belComplexName(genotype);
  if (bel) traits.push(bel);

  const albinoComplex = ALBINO_COMPLEX_NAMES[genotype.albCdy];
  if (albinoComplex) traits.push(albinoComplex);

  const laceGhiComplex = LACE_GHI_NAMES[genotype.lacGhi];
  if (laceGhiComplex) traits.push(laceGhiComplex);

  for (const rule of RECESSIVE_RULES) {
    if (genotype[rule.locus] === rule.homo) traits.push(rule.name);
  }

  applyComboAliases(traits, genotype);

  const phenotype = traits.length ? traits.join(' ') : 'Normal';

  return { phenotype, carriers: getBallPythonCarriers(genotype), notes: [] };
}

// ---------------------------------------------------------------------------
// BALL PYTHON GENE LOCI — metadata for GeneticCodeBuilder visual selector and
// GeneticsCalculator dropdowns.
// ---------------------------------------------------------------------------

export const BALL_PYTHON_GENE_LOCI = {
  // --- Recessive genes ---
  pi: { name: 'Piebald', description: 'Recessive. pi/pi = Piebald.', combinations: ['Pi/Pi', 'Pi/pi', 'pi/pi'] },
  cl: { name: 'Clown', description: 'Recessive. cl/cl = Clown. Cl + Cry combo = "Crypton"; Cl + Mig combo = "Mixer" (added batch 11, 2026-08-29, see BALL_PYTHON_COMBO_ALIASES).', combinations: ['Cl/Cl', 'Cl/cl', 'cl/cl'] },
  gs: { name: 'Genetic Stripe', description: 'Recessive. gs/gs = Genetic Stripe.', combinations: ['Gs/Gs', 'Gs/gs', 'gs/gs'] },
  ax: { name: 'Axanthic', description: 'Recessive. ax/ax = Axanthic. Simplified as a single locus for v1 — real hobby axanthic has multiple non-complementary lines (VPI/TSK/Joppa/etc.).', combinations: ['Ax/Ax', 'Ax/ax', 'ax/ax'] },
  hy: { name: 'Hypo (Ghost)', description: 'Recessive. hy/hy = Hypomelanistic ("Hypo"/"Ghost").', combinations: ['Hy/Hy', 'Hy/hy', 'hy/hy'] },
  cml: { name: 'Caramel', description: 'Recessive. cml/cml = Caramel.', combinations: ['Cml/Cml', 'Cml/cml', 'cml/cml'] },
  dg: { name: 'Desert Ghost', description: 'Recessive. dg/dg = Desert Ghost.', combinations: ['Dg/Dg', 'Dg/dg', 'dg/dg'] },
  sun: { name: 'Sunset', description: 'Recessive. sun/sun = Sunset.', combinations: ['Sun/Sun', 'Sun/sun', 'sun/sun'] },
  rax: { name: 'Red Axanthic', description: 'Recessive. rax/rax = Red Axanthic. Distinct, non-complementary line from the generic Axanthic (`ax`) locus above.', combinations: ['Rax/Rax', 'Rax/rax', 'rax/rax'] },
  tof: { name: 'Toffee', description: 'Recessive. tof/tof = Toffee.', combinations: ['Tof/Tof', 'Tof/tof', 'tof/tof'] },
  lav: { name: 'Lavender Albino', description: 'Recessive. lav/lav = Lavender Albino. Distinct, non-complementary line from the regular Albino/Candy (`albCdy`) locus above.', combinations: ['Lav/Lav', 'Lav/lav', 'lav/lav'] },
  ult: { name: 'Ultramel', description: 'Recessive. ult/ult = Ultramel. Distinct, non-complementary hypo/albino-adjacent line.', combinations: ['Ult/Ult', 'Ult/ult', 'ult/ult'] },
  leo: { name: 'Leopard', description: 'Recessive. leo/leo = Leopard.', combinations: ['Leo/Leo', 'Leo/leo', 'leo/leo'] },
  cry: { name: 'Cryptic', description: 'Recessive (added batch 11, 2026-08-29). cry/cry = Cryptic (striped neck, missing eye stripes). Cry + Cl combo = "Crypton" (see BALL_PYTHON_COMBO_ALIASES).', combinations: ['Cry/Cry', 'Cry/cry', 'cry/cry'] },
  mig: { name: 'Migraine', description: 'Recessive (added batch 11, 2026-08-29). Distinct, non-complementary line from Cryptic (`cry`) per source site ("Migraine is a line of Cryptic") — modeled as its own locus, same simplification style as rax/lav/ult vs. their base genes. mig/mig = Migraine. Mig + Cl combo = "Mixer" (see BALL_PYTHON_COMBO_ALIASES).', combinations: ['Mig/Mig', 'Mig/mig', 'mig/mig'] },
  // --- Incomplete Dominant genes (own Super name) ---
  pas: { name: 'Pastel', description: 'Incomplete Dominant. Pas/pas = Pastel, Pas/Pas = Super Pastel.', combinations: ['pas/pas', 'Pas/pas', 'Pas/Pas'] },
  en: { name: 'Enchi', description: 'Incomplete Dominant. En/en = Enchi, En/En = Super Enchi. En + Jol combo = "Enchi Jolt" (added batch 11, 2026-08-29, see BALL_PYTHON_COMBO_ALIASES).', combinations: ['en/en', 'En/en', 'En/En'] },
  fi: { name: 'Fire', description: 'Incomplete Dominant. Fi/fi = Fire, Fi/Fi = Black Fire.', combinations: ['fi/fi', 'Fi/fi', 'Fi/Fi'] },
  cho: { name: 'Chocolate', description: 'Incomplete Dominant. Cho/cho = Chocolate, Cho/Cho = Super Chocolate. "Saar" is a documented synonym — source site states genetic testing has proven Saar identical to Chocolate, so no separate locus is modeled for it. Cho + Sab combo = "Saar Sable"; Bon + Cho combo = "Bongo Saar" (added batch 11, 2026-08-29, see BALL_PYTHON_COMBO_ALIASES).', combinations: ['cho/cho', 'Cho/cho', 'Cho/Cho'] },
  van: { name: 'Vanilla', description: 'Incomplete Dominant. Van/van = Vanilla, Van/Van = Super Vanilla.', combinations: ['van/van', 'Van/van', 'Van/Van'] },
  yb: { name: 'Yellow Belly', description: 'Incomplete Dominant, independent standalone gene (confirmed 2026-08-27, not part of a shared complex). Yb/yb = Yellow Belly, Yb/Yb = Super Yellow Belly.', combinations: ['yb/yb', 'Yb/yb', 'Yb/Yb'] },
  grv: { name: 'Gravel', description: 'Incomplete Dominant, independent standalone gene — visually similar to Yellow Belly but genetically distinct (confirmed 2026-08-27). Grv/grv = Gravel, Grv/Grv = Super Gravel. Grv + Yb combo = "Highway" (see BALL_PYTHON_COMBO_ALIASES).', combinations: ['grv/grv', 'Grv/grv', 'Grv/Grv'] },
  spc: { name: 'Special', description: 'Incomplete Dominant, independent standalone gene (confirmed 2026-08-27, NOT part of a Yellow Belly complex). Spc/spc = Special, Spc/Spc = Super Special. Spc + Rus combo = "The Diamond" (see BALL_PYTHON_COMBO_ALIASES).', combinations: ['spc/spc', 'Spc/spc', 'Spc/Spc'] },
  rus: { name: 'Russo', description: 'Incomplete Dominant, independent standalone gene (confirmed 2026-08-27, NOT part of a Yellow Belly complex). Rus/rus = Russo, Rus/Rus = Super Russo. CONFIRMED (2026-08-27) BEL-adjacent: Rus + Pha combo = "Opal Diamond" ("a combo made by combining Russo and Phantom") — modeled as a combo alias, NOT by expanding belComplexName()/BEL_COMPLEX_MEMBERS (each BEL-adjacent pair gets its own distinct name instead of collapsing to one shared name). Rus + Hon combo = "Cassandra" ("from the bel complex").', combinations: ['rus/rus', 'Rus/rus', 'Rus/Rus'] },
  spe: { name: 'Specter', description: 'Incomplete Dominant, independent standalone gene (confirmed 2026-08-27). Spe/spe = Specter, Spe/Spe = Super Specter. Spe + Yb combo = "Super Stripe"/"Superstripe" (see BALL_PYTHON_COMBO_ALIASES).', combinations: ['spe/spe', 'Spe/spe', 'Spe/Spe'] },
  mys: { name: 'Mystic', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-27). Mys/mys = Mystic, Mys/Mys = Super Mystic. Mys + Moj combo = "Mystic Potion" (see BALL_PYTHON_COMBO_ALIASES).', combinations: ['mys/mys', 'Mys/mys', 'Mys/Mys'] },
  chn: { name: 'Chino', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-27) — described as looking like "a brighter Phantom" (a BEL complex member), but modeled as its own separate locus pending stronger confirmation of any allelic relationship.', combinations: ['chn/chn', 'Chn/chn', 'Chn/Chn'] },
  hon: { name: 'Honey', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-27). Hon/hon = Honey, Hon/Hon = Super Honey. "Mocha" is a documented synonym — the source site states Honey and Mocha are genetically identical, so only one locus is modeled (Honey chosen as the canonical display name). Hon + Rus combo = "Cassandra" ("from the bel complex", see BALL_PYTHON_COMBO_ALIASES). Hon + Pha combo = "Leche" (added batch 10, 2026-08-28, "from the BEL complex").', combinations: ['hon/hon', 'Hon/hon', 'Hon/Hon'] },
  bam: { name: 'Bamboo', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-27, first produced by Eb Noah in 2013). Bam/bam = Bamboo, Bam/Bam = Super Bamboo. Site notes it "dominates almost every other morph it is combined with" visually — cosmetic note only, not modeled as an epistasis rule (no specific combo names confirmed yet for this locus).', combinations: ['bam/bam', 'Bam/bam', 'Bam/Bam'] },
  sch: { name: 'Scaleless Head', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-28, first produced by Brian Barczyk / Bhb Reptiles in 2010). Sch/sch = Scaleless Head (missing scales between the eyes, divided anal scale, reduced pattern); Sch/Sch is called Scaleless (full-body scaleless), NOT Super Scaleless Head — unusual naming vs. the rest of this group.', combinations: ['sch/sch', 'Sch/sch', 'Sch/Sch'] },
  spn: { name: 'Spotnose', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-28, first produced by VPI in 2005). Spn/spn = Spotnose, Spn/Spn = Super Spotnose.', combinations: ['spn/spn', 'Spn/spn', 'Spn/Spn'] },
  asp: { name: 'Asphalt', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-28, first produced by Todd Constable in 2009). Asp/asp = Asphalt (looks almost normal except extensive flaming — genetic testing recommended), Asp/Asp = Super Asphalt.', combinations: ['asp/asp', 'Asp/asp', 'Asp/Asp'] },
  jol: { name: 'Jolt', description: 'Incomplete Dominant, independent standalone gene (added batch 11, 2026-08-29, first produced by Outback Reptiles). Jol/jol = Jolt, Jol/Jol = Super Jolt. Jol + Lor combo = "Jolt Lori"; Jol + Raz combo = "Jolt Razor"; En + Jol combo = "Enchi Jolt" (composition inferred from title — detail pages 404 despite correct page title, same site-bug pattern seen elsewhere).', combinations: ['jol/jol', 'Jol/jol', 'Jol/Jol'] },
  lor: { name: 'Lori', description: 'Incomplete Dominant, independent standalone gene (added batch 11, 2026-08-29, first produced by Brian Barczyk/Bhb Reptiles). Lor/lor = Lori (genetic black back, increased pigmentation, darker look), Lor/Lor = Super Lori. Lor + Raz combo = "Lori Razor" (composition inferred from title — detail page 404s).', combinations: ['lor/lor', 'Lor/lor', 'Lor/Lor'] },
  raz: { name: 'Razor', description: 'Incomplete Dominant, independent standalone gene (added batch 11, 2026-08-29). Raz/raz = Razor (high contrast, black background, gold/rust patterning), Raz/Raz = Super Razor.', combinations: ['raz/raz', 'Raz/raz', 'Raz/Raz'] },
  bon: { name: 'Bongo', description: "Incomplete Dominant, independent standalone gene (added batch 11, 2026-08-29, first produced by Eb Noah in 2012). Bon/bon = Bongo (black back, slightly darker overall color, reduced alien heads), Bon/Bon = Super Bongo. Bon + Cho combo = \"Bongo Saar\" (site's \"Saar\" is a confirmed genetic synonym for Chocolate — see `cho` locus; composition inferred from title, detail page 404s).", combinations: ['bon/bon', 'Bon/bon', 'Bon/Bon'] },
  pin: { name: 'Pinstripe', description: 'Incomplete Dominant. Pin/pin = Pinstripe, Pin/Pin = Super Pinstripe.', combinations: ['pin/pin', 'Pin/pin', 'Pin/Pin'] },
  puz: { name: 'Puzzle', description: 'Incomplete Dominant. Puz/puz = Puzzle, Puz/Puz = Super Puzzle.', combinations: ['puz/puz', 'Puz/puz', 'Puz/Puz'] },
  wom: { name: 'Woma', description: 'Incomplete Dominant. Wom/wom = Woma, Wom/Wom = Super Woma. NOTE: an older hobby claim that homozygous Woma is lethal is generally considered outdated — Super Woma is a real, viable, established morph, unlike Champagne.', combinations: ['wom/wom', 'Wom/wom', 'Wom/Wom'] },
  sab: { name: 'Sable', description: 'Incomplete Dominant. Sab/sab = Sable, Sab/Sab = Super Sable. Cho + Sab combo = "Saar Sable" (added batch 11, 2026-08-29, see BALL_PYTHON_COMBO_ALIASES).', combinations: ['sab/sab', 'Sab/sab', 'Sab/Sab'] },
  od: { name: 'Orange Dream', description: 'Incomplete Dominant. Od/od = Orange Dream, Od/Od = Super Orange Dream.', combinations: ['od/od', 'Od/od', 'Od/Od'] },
  // --- Incomplete Dominant, homozygous lethal ---
  cha: { name: 'Champagne', description: 'Incomplete Dominant, homozygous lethal. Cha/cha = Champagne. Cha/Cha excluded from combinations (embryonic non-viable).', combinations: ['cha/cha', 'Cha/cha'] },
  // --- Dominant, no distinct homozygous form ---
  sp: { name: 'Spider', description: 'Dominant. Sp/sp = Spider; Sp/Sp shows the same phenotype (no distinct homozygous form documented). Associated with a well-documented neurological "wobble" condition.', combinations: ['sp/sp', 'Sp/sp', 'Sp/Sp'] },
  // --- BEL complex ---
  les: { name: 'Lesser', description: 'Incomplete Dominant, member of the BEL complex with Mojave/Butter/Phantom — any 2 mutant copies across those 4 loci (same or different genes) = Blue-Eyed Leucistic instead of stacking.', combinations: ['les/les', 'Les/les', 'Les/Les'] },
  moj: { name: 'Mojave', description: 'Incomplete Dominant, member of the BEL complex with Lesser/Butter/Phantom — any 2 mutant copies across those 4 loci (same or different genes) = Blue-Eyed Leucistic instead of stacking.', combinations: ['moj/moj', 'Moj/moj', 'Moj/Moj'] },
  but: { name: 'Butter', description: 'Incomplete Dominant, member of the BEL complex with Lesser/Mojave/Phantom — any 2 mutant copies across those 4 loci (same or different genes) = Blue-Eyed Leucistic instead of stacking.', combinations: ['but/but', 'But/but', 'But/But'] },
  pha: { name: 'Phantom', description: 'Incomplete Dominant, member of the BEL complex with Lesser/Mojave/Butter — any 2 mutant copies across those 4 loci (same or different genes) = Blue-Eyed Leucistic instead of stacking. Rus + Pha combo = "Opal Diamond"; Hon + Pha combo = "Leche" (added batch 10, 2026-08-28) — each BEL-adjacent pair gets its own distinct name instead of collapsing to Blue-Eyed Leucistic.', combinations: ['pha/pha', 'Pha/pha', 'Pha/Pha'] },
  // --- Cinnamon / Black Pastel — true multi-allelic locus ---
  cinBp: { name: 'Cinnamon / Black Pastel', description: 'True multi-allelic locus — Cinnamon and Black Pastel are different alleles of the SAME gene. Cin/Cin = Super Cinnamon, Bp/Bp = Super Black Pastel, Cin/Bp = Cinnamon Black Pastel compound (neither super form).', combinations: ['n/n', 'Cin/n', 'Bp/n', 'Cin/Cin', 'Bp/Bp', 'Bp/Cin'] },
  // --- Albino / Candy — true multi-allelic locus ---
  albCdy: { name: 'Albino / Candy', description: 'True multi-allelic locus — Albino and Candy are different alleles of the SAME recessive gene (added 2026-08-28: source site states Candy "is allelic with regular Albino"). Both are recessive: a single copy of either allele (Alb/n or Cdy/n) is an invisible carrier, not a visible trait. Alb/Alb = Albino, Cdy/Cdy = Candy, Alb/Cdy = Candino ("the combination of Candy and Albino").', combinations: ['n/n', 'Alb/n', 'Cdy/n', 'Alb/Alb', 'Cdy/Cdy', 'Alb/Cdy'] },
  // --- Lace / GHI — true multi-allelic locus ---
  lacGhi: { name: 'Lace / GHI', description: 'True multi-allelic locus — Lace and GHI are different alleles of the SAME gene (confirmed 2026-08-28, "proven to be allelic with genetic testing"). CORRECTION: GHI was previously modeled as a separate Recessive locus, but the site confirms it is actually Incomplete Dominant, same as Lace — both visible with a single copy. Lac/n = Lace, Ghi/n = GHI, Lac/Lac = Super Lace, Ghi/Ghi = Super Ghi, Ghi/Lac = Lace Ghi compound (own confirmed name).', combinations: ['n/n', 'Lac/n', 'Ghi/n', 'Lac/Lac', 'Ghi/Ghi', 'Ghi/Lac'] },
  ban: { name: 'Banana', description: 'Incomplete Dominant, independent standalone gene (confirmed 2026-08-27 — "Coral Glow" removed as a Banana allele; it is actually an unrelated "Designer Morph" combo, not a Banana allele). Ban/ban = Banana, Ban/Ban = Super Banana.', combinations: ['ban/ban', 'Ban/ban', 'Ban/Ban'] },
  cg: { name: 'Coral Glow', description: 'Incomplete Dominant, independent standalone gene (re-added 2026-08-27, own "Base Morph"). Cg/cg = Coral Glow, Cg/Cg = Super Coral Glow. NOTE: source site describes this gene as "sex linked with frequent crossing over" in reality — that inheritance mechanic is NOT modeled here (simplified to plain autosomal Incomplete Dominant like every other gene, consistent with the Axanthic-lines simplification).', combinations: ['cg/cg', 'Cg/cg', 'Cg/Cg'] },
};
