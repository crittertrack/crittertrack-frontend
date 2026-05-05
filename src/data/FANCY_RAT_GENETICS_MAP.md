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
| m/m + Black base | Mink | ✅ |
| m/m + Agouti base | Cinnamon | ✅ |

---

### P — Pink-eyed Dilution locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| P/P, P/p | No effect | ✅ |
| p/p + Black base | Champagne | ✅ |
| p/p + Agouti base | Silver Fawn | ✅ |

---

### R — Red-eye Dilution locus
| Notation | Phenotype | Mapped |
|----------|-----------|--------|
| R/R, R/r | No effect | ✅ |
| r/r + Black base | Beige | ✅ |
| r/r + Agouti base | Topaz | ✅ |

---

### Bu — Burmese locus
| Notation | Base | C-locus | Phenotype | Mapped |
|----------|------|---------|-----------|--------|
| bu/bu | any | any | No effect | ✅ |
| Bu/bu or Bu/Bu | any | C/C, C/ct, C/cm, C/ch, C/c (full) | Base color (note: Bu doesn’t express) | ✅ |
| Bu/bu | Black (a/a) | ch/ch or ch/c | Burmese | ✅ |
| Bu/Bu | Black (a/a) | ch/ch or ch/c | Sable | ✅ |
| Bu/bu | Agouti (A/-) | ch/ch or ch/c | Wheaten Burmese | ✅ |
| Bu/Bu | Agouti (A/-) | ch/ch or ch/c | Wheaten Sable | ✅ |
| Bu/bu | Black (a/a) | cm/cm, cm/ch, or cm/c | Burmese Marten | ✅ |
| Bu/bu | Agouti (A/-) | cm/cm, cm/ch, or cm/c | Wheaten Marten | ✅ |
| Bu/bu or Bu/Bu | Black (a/a) | c/c | Stone | ✅ |
| Bu/bu or Bu/Bu | Agouti (A/-) | c/c | Wheaten Stone | ✅ |

> **Note:** Bu/Bu on a Marten (cm) base is not yet mapped — phenotype unconfirmed.

---

## Compound Dilutions

| Genes | Black base (a/a) | Agouti base (A/-) | Mapped |
|-------|-----------------|-------------------|--------|
| D + R | Russian Beige | Russian Topaz | ✅ |
| D + P | Russian Champagne | Russian Silver Fawn | ✅ |
| D + G | Russian Silver | Russian Silver Agouti | ✅ |
| D + M | Russian Dove | Russian Cinnamon | ✅ |
| B + D | Russian Chocolate | Russian Chocolate Agouti | ✅ |
| G + R | Blue Silver | Opal Fawn | ✅ |
| G + P | Apricot | Apricot Agouti | ✅ |
| B + G | Platinum | Platinum Agouti | ✅ |
| G + M | Lavender | Lavender Agouti | ✅ |
| R + M | Mocha | Argente | ✅ |
| P + M | Honey | Honey Agouti | ✅ |
| B + M | Coffee | Coffee Agouti | ✅ |
| B + R | Caramel | Saffron | ✅ |
| B + P | Creme | Creme Agouti | ✅ |
| P + R | Champagne Beige | Silver Topaz | ✅ |
| D + G + M | Russian Lavender | Russian Lavender Agouti | ✅ |
| B + D + G | Russian Platinum | Russian Platinum Agouti | ✅ |
| D + R + M | Russian Mocha | Russian Argente | ✅ |
| B + D + M | Russian Coffee | Russian Coffee Agouti | ✅ |
| B + D + R | Russian Caramel | Russian Saffron | ✅ |
| B + D + P | Russian Creme | Russian Creme Agouti | ✅ |
| D + G + R | Russian Silver Beige | Russian Silver Fawn | ✅ |
| D + G + P | Russian Apricot | Russian Apricot Agouti | ✅ |
| D + P + M | Russian Honey | Russian Honey Agouti | ✅ |
| G + R + M | Lavender Beige | Lavender Fawn | ✅ |
| G + P + M | Lavender Champagne | Lavender Silver Fawn | ✅ |
| B + G + R | Blue Caramel | Blue Saffron | ✅ |
| B + G + P | Blue Creme | Blue Creme Agouti | ✅ |
| B + R + M | Chocolate Mocha | Cinnamon Argente | ✅ |
| B + P + M | Chocolate Honey | Cinnamon Honey | ✅ |
| B + G + M | Lavender Chocolate | Lavender Chocolate Agouti | ✅ |
| B + P + R | Caramel Champagne | Saffron Silver Fawn | ✅ |
| D + P + R | Russian Champagne Beige | Russian Silver Topaz | ✅ |
| G + P + R | Apricot Beige | Apricot Topaz | ✅ |
| M + P + R | Honey Beige | Honey Topaz | ✅ |

---

## C-locus × Dilution Interactions

| C genotype | Dilution | Phenotype | Mapped |
|------------|----------|-----------|--------|
| ch/ch | d/d + m/m | Dove Point Siamese | ✅ |
| ch/ch | d/d | Russian Point Siamese | ✅ |
| ch/ch | m/m | Mink Point Siamese | ✅ |
| ch/c | d/d | Russian Point Himalayan | ✅ |
| cm/* (Black) | d/d | Russian Marten | ✅ |
| cm/* (Black) | m/m | Mink Marten | ✅ |
| ch/* + b/b | — | Chocolate Point / Chocolate Siamese | ❌ |
| cm/* + b/b | — | Chocolate Marten | ❌ |
| ch/* + p/p | — | Champagne Point | ❌ |
| ch/* + g/g | — | Blue Point | ❌ |

---

## Pearl (Pe) & Merle (Me) × Mink

> Pe and Me are **not yet in the live DB**. Rules are pre-written and will activate once the genes are added.
> Both only visually alter phenotype on `m/m` — they have no effect on other base colors.

| Gene | Base | Phenotype | Mapped |
|------|------|-----------|--------|
| Pe/pe | Agouti + m/m | Cinnamon Pearl | ✅ (pending DB) |
| Pe/pe | Black + m/m | Pearl | ✅ (pending DB) |
| Me/me | Agouti + m/m | Cinnamon Merle | ✅ (pending DB) |
| Me/me | Black + m/m | Merle | ✅ (pending DB) |

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
