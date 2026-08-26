# Campbell's Dwarf Hamster Genetics — Gene/Allele Mapping

> Status: fully resolved and wired into code 2026-08-26. See
> `src/data/campbellsDwarfHamsterPhenotypeRules.js`, wired into
> `GeneticsCalculator.jsx` and `GeneticCodeBuilder.jsx`.

Locus key convention (matches Fancy Rat / Syrian Hamster in this repo):
**locus key = the lowercase mutant symbol**, wildtype allele = same letters
capitalized (recessive mutants), or vice versa for dominant mutants (mutant
= capitalized symbol, wildtype = lowercase). Genotype notation =
`Allele1/Allele2`.

---

## Full gene list

| Locus key | Symbol (mutant) | Mutation name | Type | Wildtype allele |
|-----------|-----------------|---------------|------|------------------|
| a  | a  | Black | Recessive | A (Agouti) |
| b  | b  | Chocolate | Recessive | B |
| d  | d  | Blue (Dilution) | Recessive | D |
| p  | p  | Pink Eye Dilute | Recessive | P |
| c  | c  | Albino | Recessive, **fully epistatic** — overrides all other color | C |
| di | di | Dilute | Recessive — universal prefix modifier ("Dilute " + whatever else) | Di |
| dg | dg | Dark Grey | Recessive — prefix modifier on Black/Agouti base | Dg |
| u  | u  | Umbrous | Recessive (opposite dominance direction from Syrian Hamster's U) | U |
| mo | Mo | Mottled | Dominant — Mo/Mo homozygous is viable (just more mottling) | mo |
| mi | Mi | Ruby Eyed Mottled | Dominant — **Mi/Mi homozygous lethal**. Distinct gene from Mo, not an allele of it. | mi |
| si | Si | Platinum | Dominant — **Si/Si homozygous lethal**. Epistatic/overriding, but combines with Dilute prefix. | si |
| rx | rx | Rex | Recessive — coat texture | Rx |
| sa | sa | Satin | Recessive — coat texture | Sa |
| wa | wa | Wavy | Recessive — coat texture | Wa |

---

## Base color table (A/B/D/P system)

### Black base (a/a)
| Notation | Phenotype |
|----------|-----------|
| a/a | Black |
| a/a d/d | Blue |
| a/a b/b | Chocolate |
| a/a p/p | Dove |
| a/a b/b d/d | Lilac |
| a/a b/b p/p | Dark Beige |
| a/a d/d p/p | Red Eyed Lilac |
| a/a b/b p/p d/d | Champagne |

### Agouti base (A/-)
| Notation | Phenotype |
|----------|-----------|
| A/- | Agouti |
| A/- p/p | Argente |
| A/- b/b | Black Eyed Argente |
| A/- d/d | Opal |
| A/- b/b p/p | Beige |
| A/- d/d p/p | Blue Fawn |
| A/- b/b d/d | Lilac Fawn |
| A/- b/b d/d p/p | Blue Beige |

---

## Epistatic / override genes

- **c/c → Albino.** Epistatic for COLOR only (overrides A/B/D/P base entirely) — but does NOT suppress pattern/coat suffix modifiers, confirmed 2026-08-26:
  - `c/c Mo/-` → Albino Mottled
  - `c/c Mi/mi` → Albino Ruby Eyed Mottled
  - `c/c u/u` → Albino Umbrous
  - `c/c sa/sa` → Albino Satin
- **si/Si → Platinum (Si/si).** Overrides the A/B/D/P base color entirely (P locus irrelevant — confirmed 2026-08-26). Also does NOT suppress pattern/coat suffix modifiers, confirmed 2026-08-26:
  - `Si/si sa/sa` → Platinum Satin
  - `Si/si Mo/-` → Platinum Mottled
  - `Si/si u/u` → Platinum Umbrous
  - Still combines with the Dilute prefix: `di/di + Si/si → "Dilute Platinum"`. `Si/Si` is homozygous lethal.
- **dg/dg → Dark Grey.** Its own independent color mutation, NOT a prefix on top of the B/D/P modifiers — confirmed 2026-08-26: "anything a/a dg/dg is dark grey (regardless of other genes)." Overrides/ignores b/d/p entirely:
  - `a/a dg/dg` (regardless of b/d/p) → **Dark Grey**
  - `A/- dg/dg` (regardless of b/d/p) → **Dark Grey Agouti**
  - Do NOT invent names like "Dark Grey Chocolate" or "Dark Grey Blue" for `bb dg/dg`/`dd dg/dg`/`pp dg/dg` — those still just collapse to "Dark Grey" (Black base) or "Dark Grey Agouti" (Agouti base), only the A locus matters once `dg/dg` is present.
  - Still combines with the Dilute prefix (see below): `di/di + a/a dg/dg → "Dilute Dark Grey"`.
  - OPEN QUESTION: interaction with Platinum (`Si/si`) not specified — assuming Platinum still takes precedence over Dark Grey if both present (unconfirmed edge case).

## Prefix modifiers (order: Dilute always outermost/frontmost)

- **di/di → "Dilute " prefix**, applied on top of whatever the computed phenotype is (base color, Dark Grey, OR Platinum). Confirmed 2026-08-26: "if di/di = present, prefix with dilute."

## Suffix modifiers (appended after base + prefixes)

- **u/u → Umbrous.** Recessive here (opposite direction from Syrian Hamster). Appended as a suffix, e.g. "Black Umbrous".
- **Mo/- → Mottled.** Dominant, Mo/Mo viable. Suffix, e.g. "Black Mottled".
- **Mi/mi → Ruby Eyed Mottled.** Dominant, distinct gene from Mo (confirmed 2026-08-26: "Mo and Mi are two different things"). Mi/Mi lethal. Suffix, e.g. "Agouti Ruby Eyed Mottled".
  - **Mo/- + Mi/mi together → "Double (Ruby Eyed) Mottled"** — confirmed 2026-08-26, replaces both individual suffixes (not stacked).
- **rx/rx → Rex**, **sa/sa → Satin**, **wa/wa → Wavy**: independent coat-texture suffixes, same pattern as Syrian Hamster's hr/l/rx/sa. Appended last, after markings.

## Carriers

Confirmed 2026-08-26: same convention as Syrian Hamster — carrier labels use the
original mutation name, not a base-dependent phenotype name. Every recessive
locus shows up when het: `a` → Carries Black, `b` → Carries Chocolate,
`d` → Carries Blue, `p` → Carries Pink Eye Dilute,
`c` → Carries Albino, `di` → Carries Dilute, `dg` → Carries Dark Grey,
`u` → Carries Umbrous, `rx` → Carries Rex, `sa` → Carries Satin,
`wa` → Carries Wavy. Dominant loci (`Mo`, `Mi`, `Si`) are visible in any
dosage, so they are never silent "carried" traits.

---

## Still needed / open questions

1. ~~Confirm Dark Grey generalization~~ — RESOLVED 2026-08-26: `dg/dg` is its own independent color mutation (not a prefix), collapses to "Dark Grey" (Black base) or "Dark Grey Agouti" (Agouti base) regardless of b/d/p.
2. ~~Confirm Mo+Mi co-occurrence~~ — RESOLVED 2026-08-26: `Mo/- + Mi/mi` together → "Double (Ruby Eyed) Mottled" (replaces both individual suffixes).
3. ~~Confirm suffixes survive epistasis~~ — RESOLVED 2026-08-26: Albino and Platinum are epistatic for COLOR only, do NOT suppress marking/coat suffixes (e.g. "Albino Mottled", "Platinum Satin" are both valid).
4. ~~Carrier-list naming~~ — RESOLVED 2026-08-26: use original mutation names, same convention as Syrian Hamster.
5. ~~`p` locus mutation name~~ — RESOLVED 2026-08-26: **Pink Eye Dilute**.
