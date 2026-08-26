# Syrian Hamster Genetics — Gene/Allele Mapping (WORKING DRAFT)

> Status: gene list defined 2026-08-26; first batch of confirmed
> base-color + compound phenotype examples added 2026-08-26 (see per-locus
> tables and "Still needed" below for open gaps). Nothing has been wired
> into the calculator code yet — this is still documentation-only.

Locus key convention (matches Fancy Rat in this repo): **locus key = the
lowercase mutant symbol**, wildtype allele = same letters capitalized.
Genotype notation = `Allele1/Allele2`.

---

## Full gene list

| Locus key | Symbol (mutant) | Mutation name | Type | Wildtype allele |
|-----------|-----------------|---------------|------|------------------|
| a  | a  | Black | Recessive | A (Agouti / Golden Agouti) |
| b  | b  | Rust | Recessive | B |
| cd | cd | Dark Eared White | Recessive | Cd |
| ce | ce | Extreme Dilute | Recessive | Ce |
| d  | d  | Blue (Dilution) | Recessive | D — confirmed 2026-08-26 (not in the original 21-gene list, but a real separate locus) |
| dg | dg | Dark Grey | Recessive | Dg |
| e  | e  | Black Eyed Cream | Recessive | E |
| hr | hr | Hairless | Recessive | Hr |
| l  | l  | Longhair | Recessive | L |
| p  | p  | Cinnamon | Recessive | P |
| rx | rx | Rex | Recessive | Rx |
| s  | s  | Pied | Recessive | S |
| rd | rd | Recessive Dappled | Recessive | Rd |
| ba | Ba | Banded | Dominant | ba (wildtype) |
| u  | U  | Umbrous | Dominant | u (wildtype) |
| ds | Ds | Dominant Spot | Incomplete Dominant — **Ds/Ds homozygous lethal** | ds (wildtype) |
| wh | Wh | Anophthalmic White / Roan | Incomplete Dominant — **Wh/Wh homozygous lethal** | wh (wildtype) |
| lg | Lg | Light Grey | Incomplete Dominant — **Lg/Lg homozygous lethal** | lg (wildtype) |
| sa | Sa | Satin | Incomplete Dominant — Sa/Sa NOT lethal, but "problematic" (health/coat quality issues) | sa (wildtype) |
| sg | Sg | Silver Grey | Incomplete Dominant (no lethality noted) | sg (wildtype) |
| to | To | Yellow | Sex-linked (X-linked) Dominant | to (wildtype) |

---

## Per-locus allele combinations

### A — Agouti / Black locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| A/A, A/a | (Golden) Agouti | ✅ confirmed display name `(Golden) Agouti` |
| a/a | Black | ✅ |

### B — Rust locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| B/B, B/b | No effect (carries Rust if het) | ✅ |
| a/a b/b | Chocolate | ✅ |
| A/- b/b | Rust | ✅ |
| a/a b/b d/d | Lavender | ✅ |
| A/- b/b ce/ce | Extreme Dilute Rust | ✅ |
| b/b dg/dg | Beige | ✅ (see Dg section — confirmed applies regardless of A-locus genotype) |
| b/b e/e U/* | Chocolate Sable | ✅ |
| e/e b/b p/p U/* | Copper | ✅ |
| e/e b/b Sg/sg U/*, e/e b/b Lg/lg U/* | Silver Chocolate Sable | ✅ |

### Cd — Dark Eared White locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| Cd/Cd, Cd/cd | No effect | ✅ |
| cd/cd (any A genotype) | Dark-Eared White | ✅ epistatic — same result on Black or Agouti base |
| a/a cd/cd p/p | Red Eyed White | ✅ compound with Cinnamon |

### Ce — Extreme Dilute locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| Ce/Ce, Ce/ce | No effect | ✅ |
| a/a ce/ce | Extreme Dilute Black | ✅ |
| A/- ce/ce | Extreme Dilute Golden | ✅ |
| A/- b/b ce/ce | Extreme Dilute Rust | ✅ |
| e/e ce/ce | Extreme Dilute Black Eyed Cream | ✅ |

### D — Blue (Dilution) locus — ✅ confirmed
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| D/D, D/d | No effect | ✅ (assumed) |
| a/a d/d | Blue | ✅ |
| A/- d/d | Golden Dilute | ✅ |
| a/a d/d U/* | Blue Umbrous | ✅ |
| a/a p/p d/d | Dove Dilute | ✅ |
| a/a d/d To/Y | Blue Yellow (male) | ✅ |
| a/a d/d To/To | Blue Yellow (female) | ✅ |
| a/a d/d To/to | Blue Tortoiseshell (female) | ✅ |

### Dg — Dark Grey locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| Dg/Dg, Dg/dg | No effect | ✅ |
| a/a dg/dg | Dingy Black | ✅ |
| A/- dg/dg | Dark Grey | ✅ |
| b/b dg/dg | Beige | ✅ confirmed applies regardless of A-locus genotype, like e/e and cd/cd |
| e/e dg/dg | Ivory | ✅ |
| e/e dg/dg p/p | Red Eyed Ivory | ✅ |
| e/e b/b dg/dg U/* | Silver Chocolate Sable | ✅ (dg treated interchangeably with Sg/Lg here) |
| e/e dg/dg p/p U/* | Blue Mink | ✅ |
| A/- dg/dg p/p | Lilac | ✅ |
| A/- dg/dg To/Y | Smoke Pearl (male) | ✅ |
| A/- dg/dg To/to | Smoke Tortoiseshell (female) | ✅ |
| A/- dg/dg To/To | Smoke Pearl (female) | ✅ |
| A/- dg/dg p/p To/Y | Lilac Pearl (male) | ✅ |
| A/- dg/dg p/p To/to | Lilac Tortoiseshell (female) | ✅ |
| A/- dg/dg p/p To/To | Lilac Pearl (female) | ✅ |
| a/a p/p dg/dg | Dingy Dove | ✅ |

### E — Black Eyed Cream locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| E/E, E/e | No effect | ✅ |
| e/e (any A genotype) | Black Eyed Cream | ✅ epistatic — same result on Black or Agouti base |
| a/a e/e U/* | Sable | ✅ |
| a/a e/e Sg/sg, a/a e/e dg/dg | Ivory | ✅ |
| e/e p/p | Red Eyed Cream | ✅ |
| b/b e/e U/* | Chocolate Sable | ✅ |
| e/e p/p U/* | Mink | ✅ |
| e/e ce/ce | Extreme Dilute Black Eyed Cream | ✅ |

### hr — Hairless locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| Hr/Hr | No effect | ✅ |
| Hr/hr | No effect (carries Hairless) | ✅ |
| hr/hr | Hairless | ✅ |

### l — Longhair locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| L/L | Shorthair | ✅ |
| L/l | Shorthair (carries Longhair) | ✅ |
| l/l | Longhair | ✅ |
| l/l rx/rx | Longhair Rex | ✅ |

### p — Cinnamon locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| P/P, P/p | No effect | ✅ |
| a/a p/p | Dove | ✅ |
| A/- p/p | Cinnamon | ✅ |
| A/- p/p To/Y | Honey (male) | ✅ |
| A/- p/p To/to | Cinnamon Tortoiseshell (female) | ✅ |
| A/- p/p To/To | Honey (female) | ✅ |

### rx — Rex locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| Rx/Rx | No effect | ✅ |
| Rx/rx | No effect (carries Rex) | ✅ |
| rx/rx | Rex | ✅ |

### s — Pied locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| S/S, S/s | No effect (carries Pied if het) | ✅ |
| s/s | Pied | ✅ |
| To/to + s/s | Tricolor | ✅ (marking gene co-occurring with tortoiseshell) |

### rd — Recessive Dappled locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| Rd/Rd | No effect | ✅ |
| Rd/rd | No effect (carries Recessive Dappled) | ✅ |
| rd/rd | Recessive Dappled | ✅ |
| To/to + rd/rd | Tortoiseshell Recessive Dappled | ✅ **named differently from the other Tricolor combos — Dappled does not fold into "Tricolor"** |

### Ba — Banded locus (Dominant)
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| ba/ba | No effect (wildtype) | ✅ |
| Ba/ba, Ba/Ba ("Ba/*") | Banded — **same name regardless of dosage** | ✅ |
| To/to + Ba/* | Tricolor | ✅ |

### U — Umbrous locus (Dominant)
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| u/u | No effect (wildtype) | ✅ |
| U/u, U/U ("U/*") | Umbrous — **same name regardless of dosage** | ✅ |
| a/a U/* | Mahogany | ✅ |
| A/- U/* | Golden Umbrous | ✅ |
| a/a e/e U/* | Sable | ✅ |
| a/a d/d U/* | Blue Umbrous | ✅ |
| b/b e/e U/* | Chocolate Sable | ✅ |
| e/e p/p U/* | Mink | ✅ |
| e/e Sg/* U/*, e/e Lg/lg U/* | Silver Sable | ✅ |
| e/e dg/dg p/p U/* | Blue Mink | ✅ |
| e/e b/b p/p U/* | Copper | ✅ |
| e/e b/b Sg/sg U/*, e/e b/b Lg/lg U/* | Silver Chocolate Sable | ✅ |
| A/- Sg/* U/* To/Y | Silver Pearl Umbrous (male) | ✅ |
| A/- Sg/* U/* To/to | Silver Umbrous Tortoiseshell (female) | ✅ |
| A/- Sg/* U/* To/To | Silver Pearl Umbrous (female) | ✅ |
| A/- Lg/lg U/* To/Y | Silver Pearl Umbrous (male) | ✅ |
| A/- Lg/lg U/* To/to | Silver Umbrous Tortoiseshell (female) | ✅ |
| A/- Lg/lg U/* To/To | Silver Pearl Umbrous (female) | ✅ |

### Ds — Dominant Spot locus (Incomplete Dominant, homozygous lethal)
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| ds/ds | No effect (wildtype) | ✅ |
| Ds/ds | Dominant Spot | ✅ |
| To/to + Ds/ds | Tricolor | ✅ |
| Ds/Ds | **LETHAL in utero** (excluded from selectable parent genotypes) | ✅ |

### Wh — Anophthalmic White / Roan locus (Incomplete Dominant, homozygous lethal)
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| wh/wh | No effect (wildtype) | ✅ |
| Wh/wh e/e | Roan | ✅ **universal — every `e/e` base is "Roan" regardless of any other locus** |
| Wh/wh E/- | White Bellied | ✅ **universal — every non-`e/e` (`E/-`) base is "White Bellied" regardless of any other locus** |
| Wh/Wh | **LETHAL** (excluded from selectable parent genotypes) | ✅ |

### Lg — Light Grey locus (Incomplete Dominant, homozygous lethal)
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| lg/lg | No effect (wildtype) | ✅ |
| a/a Lg/lg | Dingy Black | ✅ |
| A/- Lg/lg | Light Grey | ✅ |
| A/- Lg/lg p/p | Blonde | ✅ |
| e/e Lg/lg | Ivory | ✅ |
| e/e Lg/lg p/p | Red Eyed Ivory | ✅ |
| e/e Lg/lg U/* | Silver Sable | ✅ (interchangeable with Sg/* here) |
| e/e b/b Lg/lg U/* | Silver Chocolate Sable | ✅ |
| A/- Lg/lg To/Y | Silver Pearl (male) | ✅ |
| A/- Lg/lg To/to | Silver Tortoiseshell (female) | ✅ |
| A/- Lg/lg To/To | Silver Pearl (female) | ✅ |
| Lg/Lg | **LETHAL** (excluded from selectable parent genotypes) | ✅ (per original gene list) |

### Sa — Satin locus (Incomplete Dominant, not lethal but homozygote is high-risk)
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| sa/sa | No effect (wildtype) | ✅ |
| Sa/sa | Satin | ✅ |
| Sa/Sa | Super Satin — **high risk of complications** (needs display warning text) | ✅ |

### Sg — Silver Grey locus (Incomplete Dominant)
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| sg/sg | No effect (wildtype) | ✅ |
| a/a Sg/sg | Dingy Black | ✅ dosage matters on Black base |
| a/a Sg/Sg | Silver Black | ✅ dosage matters on Black base |
| A/- Sg/sg, A/- Sg/Sg ("Sg/*") | Silver Grey | ✅ **dosage does NOT matter on Agouti base** |
| A/- Sg/sg p/p | Blonde | ✅ |
| A/- Sg/Sg p/p | Silver Blonde | ✅ dosage matters again once p/p added |
| a/a p/p Sg/sg, a/a p/p Sg/* | Silver Dove | ✅ |
| e/e Sg/sg | Ivory | ✅ |
| e/e Sg/Sg | Black-Eyed White | ✅ dosage matters |
| e/e Sg/sg p/p | Red Eyed Ivory | ✅ |
| e/e Sg/Sg p/p | Silver White | ✅ dosage matters |
| e/e Sg/* U/* | Silver Sable | ✅ |
| e/e b/b Sg/sg U/* | Silver Chocolate Sable | ✅ |
| A/- Sg/* To/Y | Silver Pearl (male) | ✅ |
| A/- Sg/* To/to | Silver Tortoiseshell (female) | ✅ |
| A/- Sg/* To/To | Silver Pearl (female) | ✅ |
| A/- Sg/* U/* To/Y | Silver Pearl Umbrous (male) | ✅ |
| A/- Sg/* U/* To/to | Silver Umbrous Tortoiseshell (female) | ✅ |
| A/- Sg/* U/* To/To | Silver Pearl Umbrous (female) | ✅ |

### To — Yellow locus (Sex-linked/X-linked Dominant)

Pattern confirmed by breeder examples: **males (`To/Y`) and homozygous females
(`To/To`) always show the same "solid" name; heterozygous females (`To/to`)
show a "Tortoiseshell" variant instead** (X-inactivation mosaic). The solid
name is NOT always `<base> + "Yellow"` — some combos have their own
traditional name (e.g. Honey, Silver Pearl, Smoke Pearl, Lilac Pearl).

| Base / modifiers | Male (`To/Y`) | Female het (`To/to`) | Female hom (`To/To`) | Mapped |
|---|---|---|---|---|
| a/a (Black) | Yellow Black | Black Tortoiseshell | Yellow Black | ✅ |
| A/- (Agouti) | Yellow | (Golden) Agouti Tortoiseshell | Yellow | ✅ |
| A/- Sg/* or A/- Lg/lg | Silver Pearl | Silver Tortoiseshell | Silver Pearl | ✅ |
| A/- Sg/* U/* or A/- Lg/lg U/* | Silver Pearl Umbrous | Silver Umbrous Tortoiseshell | Silver Pearl Umbrous | ✅ |
| A/- dg/dg | Smoke Pearl | Smoke Tortoiseshell | Smoke Pearl | ✅ |
| A/- dg/dg p/p | Lilac Pearl | Lilac Tortoiseshell | Lilac Pearl | ✅ |
| A/- p/p | Honey | Cinnamon Tortoiseshell | Honey | ✅ |
| a/a d/d | Blue Yellow | Blue Tortoiseshell | Blue Yellow | ✅ |
| a/a ce/ce | Extreme Dilute Yellow Black | Extreme Dilute Black Tortoiseshell | Extreme Dilute Yellow Black | ✅ |

Marking-gene compounds (independent of base color, so far):
| Combo | Phenotype | Mapped |
|---|---|---|
| To/to + Ds/ds, or + Ba/*, or + s/s | Tricolor | ✅ |
| To/to + rd/rd | Tortoiseshell Recessive Dappled | ✅ (does NOT fold into "Tricolor") |

---

## Still needed before building the phenotype rule engine

_(none — all open items resolved as of 2026-08-26)_

**Rule precedence / engine design — resolved**: `Sg`, `Lg`, and `dg` are
treated as one interchangeable "grey-family" group for single-dose rules —
`e/e Sg/sg`, `e/e Lg/lg`, and `e/e dg/dg` are all just "Ivory", no matter
which of the three genes is present. The only exception is `Sg/Sg`
(homozygous double-dose), which is its own distinct rule ("Black-Eyed
White") and takes precedence over the grey-family grouping.

### Resolved from the 2026-08-26 breeder examples
- Base names: `A/-` → **(Golden) Agouti**, `a/a` → **Black**.
- `Ba` (Banded) and `U` (Umbrous) show the **same name regardless of
  dosage** (`Ba/ba` = `Ba/Ba` = "Banded"; `U/u` = `U/U` = "Golden
  Umbrous"/"Mahogany"). `Sg` (Silver Grey) is the opposite — dosage matters
  on Black/Cream bases (Dingy Black vs Silver Black; Ivory vs
  Black-Eyed White) but NOT on plain Agouti base (`Sg/*` = "Silver Grey"
  either way).
- `Wh/wh` naming is universal by E locus, regardless of any other base or
  marking gene: `e/e` → "Roan", `E/-` → "White Bellied". `Ds/Ds` lethality
  is explicitly "in utero". `Rd/rd` is a silent carrier (no visible effect,
  same as `Rd/Rd`) — only `rd/rd` shows "Recessive Dappled".
- `b/b dg/dg` = "Beige" confirmed to apply regardless of A-locus genotype.
- Marking genes (`Ds`, `Ba`, `s`, `rd`, `Wh`) do **not** form special named
  combos when stacked with each other — they simply "add up"/co-occur
  visually with no new compound name (unlike their interaction with `To`,
  which does produce named combos like "Tricolor").
- Coat genes (`hr`, `l`, `rx`, `sa`) also just "add up" with no special
  compound names, with the one exception of Rex + Longhair = "Longhair
  Rex" (a plain combined name, not a distinct trait like "Teddy Bear").
- **Carrier list**: every Recessive-type locus is carried when het —
  `a`, `b`, `cd`, `ce`, `d`, `dg`, `e`, `hr`, `l`, `p`, `rx`, `s`, `rd` all
  show up in the "Carries: ..." UI when het. Carrier labels use the
  original **mutation name** from the Full gene list table (not the
  base-dependent phenotype name), e.g. `B/b` → "Carries Rust", `P/p` →
  "Carries Cinnamon", `Dg/dg` → "Carries Dark Grey", `D/d` → "Carries Blue",
  `Ce/ce` → "Carries Extreme Dilute" — regardless of the animal's actual
  A-locus base.
  Dominant/Incomplete Dominant loci (`Ba`, `U`, `Ds`, `Wh`, `Lg`, `Sa`,
  `Sg`, `To`) are visible in any dosage, so they are never silent
  "carried" traits.
- `e/e` (Black Eyed Cream) and `cd/cd` (Dark-Eared White) are **epistatic**
  — same phenotype regardless of A-locus genotype.
- Sex-linked `To` family fully mapped for the base/modifier combos given
  (see the `To` section above) — solid name for male/homozygous-female,
  "Tortoiseshell" variant for heterozygous female.
