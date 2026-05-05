# Fancy Rat Genetics — Phenotype Mapping Status

> Live DB genes: **A, B, Bu, C, D, G, M, P, R** (9 genes)
> Removed / not added: ~~Am~~, ~~Mo~~, ~~Rb~~

---

## Color Genes in DB

### A — Agouti locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| A/A | Agouti | ✅ (base constant `AGOUTI`) |
| A/a | Agouti (carrier Black) | ✅ (base constant `AGOUTI`) |
| a/a | Black | ✅ (base constant `BLACK`) |

---

### C — Color (dilution) locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| c/c | Albino | ✅ |
| ch/c | Himalayan | ✅ (Black & Agouti base) |
| ch/ch | Siamese | ✅ (Black & Agouti base) |
| cm/ch | Pointed Marten | ✅ (Black & Agouti base) |
| cm/cm | Marten | ✅ (Black & Agouti base) |
| ct/ct | Tonkinese | ✅ (Black & Agouti base) |
| ct/cm | Unknown (ct/cm) | ✅ (flagged Unknown) |
| ct/ch | Unknown (ct/ch) | ✅ (flagged Unknown) |
| ct/c | Unknown (ct/c) | ✅ (flagged Unknown) |
| cm/c | Unknown (cm/c) | ✅ (flagged Unknown) |
| C/C, C/ct, C/cm, C/ch, C/c | Full pigment / carrier | ✅ (no special phenotype, grouped as `FULL_C`) |

> ⚠️ C-locus interactions with dilution genes (e.g. Chocolate Siamese, Mink Himalayan) — **not yet mapped**

---

### B — Brown locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| B/B, B/b | No effect | ✅ (falls through to base) |
| b/b + Black base (a/a) | Chocolate | ✅ |
| b/b + Agouti base (A/-) | Chocolate Agouti | ✅ |

---

### D — Dilute locus (English/Russian Blue)
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| D/D, D/d | No effect | ✅ |
| d/d + Black base | Russian Blue | ✅ |
| d/d + Agouti base | Russian Blue Agouti | ✅ |

---

### G — Gray locus (American Blue)
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| G/G, G/g | No effect | ✅ |
| g/g + Black base | American Blue | ✅ |
| g/g + Agouti base | American Blue Agouti (Opal) | ✅ |

---

### M — Mink locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| M/M, M/m | No effect | ✅ |
| m/m + Black base | Mink ⚠️ | ✅ (flagged unconfirmed — may not be visually distinct) |
| m/m + Agouti base | Cinnamon | ✅ |

---

### P — Pink-eyed Dilution locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| P/P, P/p | No effect | ✅ |
| p/p + Black base | Champagne | ✅ |
| p/p + Agouti base | Silver Fawn (Amber) | ✅ |

---

### R — Red-eye Dilution locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| R/R, R/r | No effect | ✅ |
| r/r + Black base | Beige | ✅ |
| r/r + Agouti base | Topaz | ✅ |

---

### Bu — Burmese locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| bu/bu | No effect | ✅ |
| Bu/bu + full C | Burmese | ✅ (Black & Agouti base, requires FULL_C) |
| Bu/Bu + full C | Double Burmese | ✅ (Black & Agouti base, requires FULL_C) |
| Bu/- + non-full C | C-locus phenotype takes priority | ✅ (falls through to C-locus rule) |

---

## Compound Dilutions — TODO

Two or more recessive dilutions expressed together. These are **not yet mapped** and fall through to unresolved.

| Genes | Notation | Expected Phenotype | Status |
|-------|----------|--------------------|--------|
| B + D | b/b + d/d | Lilac (Black base) | ❌ |
| B + D | b/b + d/d | Lilac Agouti (Agouti base) | ❌ |
| B + P | b/b + p/p | Buff (Black base) | ❌ |
| B + P | b/b + p/p | Buff Agouti (Agouti base) | ❌ |
| D + P | d/d + p/p | Russian Blue Champagne (Black base) | ❌ |
| D + P | d/d + p/p | Russian Blue Silver Fawn (Agouti base) | ❌ |
| G + P | g/g + p/p | ? | ❌ |
| M + B | m/m + b/b | Chocolate Mink (Agouti base) | ❌ |
| M + D | m/m + d/d | Mink Russian Blue? | ❌ |
| M + P | m/m + p/p | ? | ❌ |
| B + D + P | b/b + d/d + p/p | Lilac Champagne | ❌ |
| B + R | b/b + r/r | ? | ❌ |
| D + R | d/d + r/r | ? | ❌ |
| P + R | p/p + r/r | ? | ❌ |

---

## C-locus × Dilution Interactions — TODO

C-locus phenotypes (Siamese, Himalayan, Marten etc.) combined with dilution genes.

| Example | Expected Phenotype | Status |
|---------|--------------------|--------|
| Siamese + Chocolate (b/b) | Chocolate Siamese / Chocolate Point | ❌ |
| Siamese + Russian Blue (d/d) | Blue Point Siamese | ❌ |
| Himalayan + Chocolate (b/b) | Chocolate Himalayan | ❌ |
| Marten + Chocolate (b/b) | Chocolate Marten | ❌ |
| Siamese + Mink (m/m) | Mink Siamese | ❌ |
| Himalayan + Champagne (p/p) | Champagne Point | ❌ |
| ... | ... | ❌ |

---

## Genes Not Yet Added to DB

These exist in the backup JSON or are planned but not yet live:

| Symbol | Name | Notes |
|--------|------|-------|
| ~~Am~~ | American Mink | Removed — not adding |
| ~~Mo~~ | Mock Mink | Removed — not adding |
| Rb | Russian Blue (separate locus) | In backup JSON but not in live DB; D-locus covers Russian Blue for now |

---

## Marking / Coat Genes — Not in DB Yet

These are planned for a future phase:

| Symbol | Name | Category |
|--------|------|----------|
| Dal | Dalmatian | Marking |
| Du | Dumbo | Ear type |
| H | Hooded | Marking |
| Ma | Marble | Marking |
| Me | Merle | Marking |
| Pe | Pearl | Marking |
| Ro | Roan | Marking |
| Wh | Whiteside | Marking |
| Ws | Dominant White Spotting | Marking |
| Re | Rex | Coat |
| Ve | Velveteen | Coat |
| Br | Bristle | Coat |
| wo | Woolly | Coat |
| Wa | Wavy | Coat |
| Ki | Kinky | Coat |
| Sh | Shaggy | Coat |
