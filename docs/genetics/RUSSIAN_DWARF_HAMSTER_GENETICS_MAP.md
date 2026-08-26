# Russian Dwarf Hamster (Winter White / Djungarian) Genetics — Gene/Allele Mapping

> Status: fully resolved and wired into code 2026-08-26. See
> `src/data/russianDwarfHamsterPhenotypeRules.js`, wired into
> `GeneticsCalculator.jsx` and `GeneticCodeBuilder.jsx`.

Locus key convention (matches Fancy Rat / Syrian Hamster / Campbells in this
repo): **locus key = the lowercase mutant symbol**, wildtype allele = same
letters capitalized (recessive mutants), or vice versa for dominant mutants
(mutant = capitalized symbol, wildtype = lowercase). Genotype notation =
`Allele1/Allele2`.

---

## Full gene list

| Locus key | Symbol (mutant) | Mutation name | Type | Wildtype allele |
|-----------|-----------------|---------------|------|------------------|
| a  | a  | Black | Recessive | A (Agouti) |
| d  | d  | Sapphire/Russian Blue (dilution) | Recessive | D |
| p  | p  | Yellow Agouti/Dove (pink-eye dilute) | Recessive | P |
| m  | m  | Brown/Chocolate | Recessive — analogous to Campbells' `b` (chocolate) locus | M |
| pe | Pe | Pearl | Dominant — generic marking, appends as suffix onto base | pe |
| me | Me | Merle | Dominant — generic marking, appends as suffix onto base | me |
| ma | Ma | Mandarin | Dominant — **overrides base color entirely**, own named series (regardless of A/a locus) | ma |
| mi | Mi | Ruby Eyed Mottled | Dominant, hybrid/shared gene with Campbells — **Mi/Mi homozygous lethal** | mi |
| s  | s  | Pied | Recessive — generic marking suffix. Distinct gene from Campbells' `si` (Platinum); coincidental letter overlap only | S |
| wh | Wh | Imperial | Incomplete Dominant, shared/hybrid gene with Syrian Hamster — **Wh/Wh homozygous lethal**. Unlike Syrian Hamster, naming does NOT split by an `e` locus (Russian Dwarf has none) — always "Imperial" | wh |
| u  | U  | Umbrous | Dominant, dosage-independent (U/u = U/U), matches Syrian Hamster's direction (opposite of Campbells' recessive `u`) | u |
| rx | rx | Rex | Recessive — coat texture, from Campbells-hybrid ancestry | Rx |
| sa | sa | Satin | Recessive — coat texture, from Campbells-hybrid ancestry | Sa |
| wa | wa | Wavy | Recessive — coat texture, from Campbells-hybrid ancestry | Wa |

Winter Whites have no coat-texture genes of their own; `rx`/`sa`/`wa` only
show up via Campbells-hybrid lines, but are included since this app tracks
the species as a whole (hybrids included) — same as Campbells' own coat genes.

---

## Base color table (A/D/P/M system — no Mandarin)

### Agouti base (A/-)
| Notation | Phenotype |
|----------|-----------|
| A/- | Agouti |
| A/- d/d | Sapphire |
| A/- p/p | Yellow Agouti |
| A/- m/m | Brown |
| A/- d/d p/p | Yellow Blue Fawn |
| A/- d/d m/m | Beige |
| A/- p/p m/m | Beige Blonde |
| A/- d/d p/p m/m | Beige Blonde (same as p/p m/m — `d` becomes irrelevant once `p/p m/m` both present) |

### Black base (a/a)
| Notation | Phenotype |
|----------|-----------|
| a/a | Black |
| a/a d/d | Russian Blue |
| a/a p/p | Dove |
| a/a m/m | Chocolate |
| a/a d/d p/p | Pink Eyed Lilac |
| a/a d/d m/m | Black Eyed Lilac |
| a/a p/p m/m | Champagne |
| a/a d/d p/p m/m | Champagne (same as p/p m/m — confirmed 2026-08-26, mirrors the Agouti-base override pattern) |

---

## Mandarin series (Ma/ma — overrides base color entirely)

Confirmed 2026-08-26: Mandarin has its own traditional combination names
(not a simple suffix) and **overrides the A/a base color entirely** —
applies the same regardless of Agouti or Black base.

| Notation (+ Ma/ma) | Phenotype |
|---------------------|-----------|
| (none) | Mandarin |
| d/d | Camel |
| p/p | Pink Eyed Mandarin |
| d/d p/p | Pink Eyed Camel |
| m/m | Diluted Mandarin |
| d/d m/m | Mandarin Beige |
| p/p m/m | Pink Eyed Mandarin Beige |
| d/d p/p m/m | Pink Eyed Mandarin Beige (same as p/p m/m — `d` irrelevant once `p/p m/m` present, mirrors base-table override pattern) |

(Naming note: user's raw answer said "Red-Eyed Mandarin Beige" for the last
two rows — normalized to "Pink Eyed" per the explicit 2026-08-26 decision to
use original terminology consistently, i.e. "Pink Eyed" not "Red-Eyed".)

---

## Generic marking modifiers (append as suffix onto whatever base/Mandarin phenotype was computed)

Confirmed 2026-08-26 — unlike Mandarin, these are simple suffixes that combine
with ANY computed base (including Mandarin-series names):

- **Pe/pe → " Pearl"** e.g. `a/a Pe/pe` → "Black Pearl", `A/- d/d Pe/pe` → "Sapphire Pearl".
- **Me/me → " Merle"** e.g. `a/a Me/me` → "Black Merle".
- **U/u or U/U → " Umbrous"** (dosage-independent, same name either way).
- **s/s → " Pied"**.
- **Wh/wh → " Imperial"**. `Wh/Wh` is homozygous lethal.
- **Mi/mi → " Ruby Eyed Mottled"** (hybrid/shared gene with Campbells, identical rules). `Mi/Mi` is homozygous lethal.
- **rx/rx → " Rex"**, **sa/sa → " Satin"**, **wa/wa → " Wavy"** (coat texture, Campbells-hybrid ancestry, independent stacking suffixes appended last).

Stacking order (not explicitly specified by source data — assumed consistent
ordering, most-specific-color-modifier first): Pearl → Merle → Umbrous →
Ruby Eyed Mottled → Pied → Imperial → coat genes (Rex/Satin/Wavy).

## Carriers

Same convention as Campbells/Syrian Hamster: recessive loci show "Carries
[mutation name]" when het: `a` → Carries Black, `d` → Carries Sapphire/Russian
Blue, `p` → Carries Yellow Agouti/Dove, `m` → Carries Brown/Chocolate,
`rx` → Carries Rex, `sa` → Carries Satin, `wa` → Carries Wavy, `s` → Carries
Pied. Dominant loci (`Pe`, `Me`, `Ma`, `Mi`, `Wh`, `U`) are visible in any
dosage, so they are never silently "carried".

---

## Resolved questions log (2026-08-26)

1. `A/a` heterozygous shows Agouti (same as Campbells' A/a system) — RESOLVED.
2. Pearl/Merle/Mandarin combine with the underlying base color (not
   Agouti-only) — RESOLVED.
3. Pearl/Merle are generic suffixes onto any base; Mandarin uses its own
   traditional combination names instead — RESOLVED.
4. Base-name precision: use full original names (Russian Blue, Pink Eyed
   Mandarin), not the shorthand (Blue, Red-Eyed) used in later answers —
   RESOLVED.
5. `Wh/wh` always means "Imperial" regardless of other genes (no `e`-locus
   split like Syrian Hamster); `Wh/Wh` is lethal — RESOLVED.
6. Umbrous is dosage-independent (`U/u` = `U/U`) and a simple suffix, no
   special named combos — RESOLVED.
7. `Mi/mi` identical rules to Campbells (suffix, `Mi/Mi` lethal); no separate
   `Mo` gene exists in Russian Dwarf — RESOLVED.
8. `s/s` (Pied) is a simple suffix — RESOLVED.
9. Black-base `p/p m/m` (no `d/d`) = Champagne, mirroring the Agouti-base
   override pattern — RESOLVED.
10. Missing Mandarin combos (`d/d m/m`, `p/p m/m`, `d/d p/p m/m`) = Mandarin
    Beige / Pink Eyed Mandarin Beige / Pink Eyed Mandarin Beige — RESOLVED.
11. Coat genes (Rex/Satin/Wavy) apply via Campbells-hybrid ancestry, same
    rules as Campbells — RESOLVED.
12. Carrier-list naming convention — same as other species — RESOLVED.

