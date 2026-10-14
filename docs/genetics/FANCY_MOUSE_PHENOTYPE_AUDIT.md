# Fancy Mouse Phenotype Audit

> Status: findings #1 to #11 are fixed (section 3), and so are the follow-up items for pink-eye,
> leaden, Sable and umbrous, white-bellied agouti, and recessive red (section 4). The final
> 25,920-combination sweep is in section 5. Open items are in section 6.
> All changes are in `GeneticsCalculator.jsx`, plus `GeneticCodeBuilder.jsx` (parser fix) and
> `TargetOutcomePage.jsx` (labels and chips). Sections 1 and 2 describe the original audit method
> and the source rules.
>
> Note: the file was written in stages during one working session. Where an early section and a
> later section disagree, the later section is current.

## 1. Scope and method

- **Surfaces covered:** the Genetics Calculator and the Genetic Code Builder button. Both use the
  same `GENE_LOCI` list and `calculatePhenotype()` in
  `src/components/GeneticsCalculator.jsx`, so they produce **identical phenotypes**.
- **Combinations tested:** every combination of the color loci, run through the real
  `calculatePhenotype()` with a temporary Jest harness (since deleted):
  - A: 27 combinations (the `/-` wildcards and lethal entries excluded)
  - C: 15
  - B, D, P, E and Ln: 2 each
  - Total: 27 × 15 × 2⁵ = **12,960**
- **Not covered:** markings and coat loci (S, W, Spl, Rn, Si, Mobr, Go, Re, Sa, Rst, Fz, Nu) and U
  (Sable / Marten Sable). Shorthair was stripped from names before comparing.
- **Results:** no combination returned an empty phenotype, "Unknown", "Incomplete" or threw an
  error. The 12,960 combinations produced **285 distinct names**.
- **Main source:** the Finnish Show and Pet Mice Club genetics pages (hiiret.fi). Where a source
  is silent this file says so instead of inventing a name.

### Sources

| Topic | URL |
|---|---|
| A-locus: Ay | https://hiiret.fi/eng/breeding/?pg=5&sub=3&ala=1 |
| A-locus: Avy / Ahvy | https://hiiret.fi/eng/breeding/?pg=5&sub=3&ala=2 |
| A-locus: Aw | https://hiiret.fi/eng/breeding/?pg=5&sub=3&ala=3 |
| A-locus: A | https://hiiret.fi/eng/breeding/?ala=4&pg=5&sub=3 |
| A-locus: at | https://hiiret.fi/eng/breeding/?ala=5&pg=5&sub=3 |
| Table of genes | https://hiiret.fi/eng/breeding/?ala=4&pg=5&sub=2 |
| B-locus | https://hiiret.fi/eng/breeding/?ala=4&pg=5&sub=4 |
| C-locus intro, ci, cch, ce, ch | `?pg=5&sub=5&ala=0` to `ala=7` |
| D-locus | https://hiiret.fi/eng/breeding/?pg=5&sub=6&ala=1 |
| P-locus | https://hiiret.fi/eng/breeding/?pg=5&sub=7&ala=1 |
| Unstandardized colors | https://afrma.org/miceunstdnonrec.htm |

## 2. Gene rules from the sources

| Locus / allele | Rule |
|---|---|
| A-locus dominance | Ay > Avy > Aw > A > at > a > ae. Aw is dominant over A, at, a and ae, and recessive to Ay and Avy. |
| Ay | Top dominant. Removes black pigment, leaving a red or yellow mouse. Lethal when homozygous. Ay/Avy and Ay/Aw look like ordinary reds. |
| Avy | Brindle: a striped coat. The stripe color follows the other A-locus allele (agouti stripes with A, black stripes with a). Dilutions change stripe and base color the same way as on non-brindle mice. |
| Aw | White or cream belly with an agouti back. Aw/A, Aw/at, Aw/a and Aw/ae all look the same. |
| at | Tan belly. Dominant on the belly, recessive on the back. |
| B (b / bc) | Black becomes brown. Almost no effect on red or yellow pigment. |
| D (d) | Yellow is diluted to about half, black becomes blue, brown becomes lilac. |
| P (p) | Black becomes dove, brown becomes champagne, blue becomes silver. Almost no effect on red. P and C are linked. |
| cch | Strongly dilutes yellow (cream, or white on a tan belly). Does not affect brown. |
| ce | Stronger on yellow than cch. Also dilutes black (beige). Dilutes brown less than black (coffee). |
| ch | Himalayan: points. Reduces yellow to white, so no red or yellow can show without C. |
| c | Albino. Hides everything. |

C-locus alleles are co-dominant with each other, so heterozygotes look intermediate.

## 3. Findings #1 to #11: all fixed

Each finding was reviewed one at a time and approved before the change. "Before" is what the
calculator gave when the audit ran; "Now" is what it gives today.

| # | Genotype | Before | Now | Basis |
|---|---|---|---|---|
| 1 | Avy/A p/p | Cinnamon Argente Brindle | **Argente Brindle** | hiiret: with p/p the striping is argente |
| 2 | Avy/A b/b d/d | Cinnamon Argente Brindle | **Lilac Agouti Brindle** | hiiret: both dilutions give lilac agouti stripes |
| 3 | Avy/A b/b p/p | Cinnamon Brindle (p/p dropped) | **Cinnamon Argente Brindle** | Same logic as the non-brindle name |
| 3 | Avy/A d/d p/p | Blue Agouti Brindle (p/p dropped) | **Blue Argente Brindle** | Calculator's own name (hiiret gives none) |
| 4 | Avy/a B/B p/p | Champagne Brindle | **Dove Brindle** | Reading of hiiret's "d/bri" photo caption |
| 4 | Avy/at B/B p/p | Champagne Brindle Tan | **Dove Brindle Tan** | Matches "Dove Tan" |
| 5 | Avy/a b/b p/p | Chocolate Brindle (p/p dropped) | **Champagne Brindle** | Matches a/a b/b p/p |
| 5 | Avy/a d/d p/p | Blue Brindle (p/p dropped) | **Silver Brindle** | Matches a/a d/d p/p |
| 5 | Avy/at b/b p/p, d/d p/p | p/p dropped | **Champagne Brindle Tan**, **Silver Brindle Tan** | Matches at/a naming |
| 6 | A/\*, Aw/\*, A/at b/b d/d | Cinnamon Argente (same as b/b p/p) | **Lilac Agouti** (+ Tan, Fox) | hiiret: "blue cinnamon or lilac agouti" |
| 6 | A/\*, Aw/\*, A/at d/d p/p | Argente (same as p/p) | **Blue Argente** (+ Tan, Fox) | Calculator's own name (hiiret: unnamed) |
| 6 | A/at b/b p/p | Argente Tan (brown dropped) | **Cinnamon Argente Tan** | Found during the fix, not in the original audit |
| 7 | Ay/at b/b p/p | Dominant Fawn Chocolate | **Dominant Fawn Chocolate Tan** | Plain p/p already keeps "Tan" |
| 7 | Ay/at d/d p/p | Dominant Fawn Amber | **Dominant Fawn Amber Tan** | Same |
| 8 | Ay with cch/c | Dominant Red Stone | Name kept, **note added** | hiiret: off-white to white |
| 9 | Ay with cch/ce | Dominant Red Mock Chocolate | Name kept, **note added** | hiiret: creamish, almost white |
| 10 | A/A, A/a, A/ae cch/cch | Silver Agouti (every combination) | **Grey Agouti / Grey Cinnamon / Blue Grey Agouti / Lilac Grey Agouti** | hiiret: grey agouti; chinchilla does not dilute brown |
| 11 | A/at, Aw/\* cch/cch b/b | Chinchilla (brown dropped) | **Cinnamon Chinchilla** | Chosen by owner; hiiret gives no name |
| 11 | A/at, Aw/\* cch/cch b/b d/d | Blue Chinchilla | **Lilac Chinchilla** | Same |

Notes:
- #10 renamed the existing "Silver Agouti" to hiiret's "Grey Agouti" everywhere it appeared: the
  calculator output, the Examples tab entry and the Target Outcome chip label (the chip id
  `silver-agouti` was kept so nothing else breaks). "Silver" now only means a/a d/d p/p.
- #4 rests on a photo caption I interpreted ("d/bri"), not on explicit text.
- #8 and #9 kept their names because the owner chose a note over a rename.
- The new names were added to the Examples tab bolding map. No new example images or entries
  were added for Lilac Agouti, Blue Argente or the chinchilla variants.

## 4. Follow-up work after findings #1 to #11

Each item was decided one at a time. Names marked "own" are the calculator's own names, not names
from hiiret.fi, AFRMA or farbmausfarben.de.

### 4.1 Pink-eye (p/p) on agouti, Aw and tan mice with a C-dilute
- A/\*, Aw/\* and A/at with cch/cch p/p (plain B/B D/D) is now **Argente Creme** (hiiret and AFRMA).
- Other pink-eyed combinations keep their names. **No note** is shown: the note I first proposed
  claimed the P and C genes are linked, and the owner pointed out they are not linked by default.

### 4.2 Leaden (ln/ln)
Leaden is a "blue mimic" (farbmausfarben.de, AFRMA): it looks like blue (d/d). A leaden mouse is
named like the d/d version of the same genotype.

| Genotype (ln/ln) | Now |
|---|---|
| a/a, a/a b/b, a/a p/p | Blue, Lilac, Silver |
| at/a | Blue Tan |
| A/A, Aw/Aw | Blue Agouti, Blue Agouti Fox |
| Ay/a | Dominant Amber |
| Avy/a | Blue Brindle |
| e/e (not Ay) | Keeps its normal name |

- **Note on leaden mice:** "Leaden looks like Blue; tan belly can stay richer."
- **Note on e/e leaden mice:** "Leaden might mask recessive red."
- A mouse that is both Ay and e/e follows the Ay rule (Dominant Amber). The sources only cover
  each case separately, so this is a judgment call.
- Correction made during the work: I first made Ay + leaden keep its red name. The farbmausfarben
  recessive yellow page says Ay + leaden is "dominant Amber", so that was wrong and was fixed.

### 4.3 White-bellied agouti (Aw) names and note
| Genotype | Name without U | Name with U |
|---|---|---|
| Aw/Aw, Aw/A, Aw/a, Aw/ae | White-Bellied Agouti | White-Bellied Agouti Umbrous |
| Aw/at | White-Bellied Agouti Tan | White-Bellied Agouti Tan Umbrous |

- Only the plain colour is renamed. Dilutions (Cinnamon Fox, Blue Agouti Fox and so on) and the
  C-locus colours keep their "Fox" names.
- **Note** on every Aw genotype except cch/cch, and not on white mice: "Belly may appear tan,
  cream or fox due to Aw."
- Ay/Aw and Avy/Aw with U get this note too, in place of the "May appear fox due to Aw" wording
  that was drafted and then replaced.


### 4.4 Sable, Marten Sable and umbrous (U)
Before this work the U gene had no effect on Ay/at mice, so Sable and Marten Sable could never be
produced even though the Examples tab lists a Sable genotype. A true Sable is **Ay/at + U**
(hiiret.fi, AFRMA); only Ay/at + U is called Sable.

**Ay/at + U (U/u or U/U), E/E:**
- Full colour (C/C, C/c, C/ch, C/ce, C/cch): Sable, Chocolate Sable, Blue Sable, Lilac Sable,
  Dove Sable (hiiret/AFRMA names), plus Champagne Sable, Silver Sable, Lavender Sable (own).
- cch/cch: Marten Sable, Chocolate, Blue and Lilac Marten Sable (hiiret/AFRMA), plus Dove,
  Champagne, Silver and Lavender Marten Sable (own).
- Other C-dilutes (cch/c, cch/ce, ch/cch, ce/ch and so on): the core name gets "Sable" added, e.g.
  "Dominant Red Stone Fox Sable", "Colorpoint Beige Fox Sable". No note.
- White mice (Albino, Pink Eye White, Black Eye White) hide the pattern: no Sable name, no note.

**Other U mice (not true Sable):**

| Genotype with U | Name | Note |
|---|---|---|
| Ay, no tan (Ay/a, Ay/A, Ay/ae, Ay/Aw, Ay/Avy) | Dominant Red Umbrous | "Often called sable in the hobby." |
| Avy, with or without tan, no Ay | Brindle Umbrous, Brindle Tan Umbrous | "Often called Brindle Sable in the hobby." |
| Ay/Aw and Avy/Aw | as above | the Aw belly note as well (see 4.3) |
| e/e, no Ay/Avy | e.g. Recessive Red Umbrous | "Often called sable in the hobby." |
| a/a, A/A, at/a, A/at, Aw/\* and the rest | e.g. Black Umbrous, Agouti Tan Umbrous | none |

- Tan, fox and C-dilute names that used to omit "Umbrous" (Sepia Fox, Beige Fox, Sealpoint Siamese
  and so on) now say it, placed after the colour name and before any markings.
- Notes I first wrote for the at-without-Ay and no-tan cases, and a long "no standard name" note on
  Ay/at, were removed at the owner's request. All notes that named a source (hiiret, farbmausfarben,
  AFRMA) were shortened and the source removed.

### 4.5 Recessive red (e/e)
- **e/e with at** stays "Recessive Red Tan" (decided: keep).
- **e/e with a C-dilute** keeps "Recessive Red" and adds the C-dilute name (own names):
  Recessive Red Chinchilla, Siamese, Himalayan, Beige, Bone, Colorpoint Beige, Stone, Burmese, Mock
  Chocolate. d/d and p/p change the base: Recessive Amber Siamese, Recessive Fawn Siamese.
- **Tan e/e with a C-dilute** is always a Fox: "Recessive Red Siamese Fox", "Recessive Red Chinchilla
  Fox", and so on. This includes Aw/at.
- **Aw/at with e/e, no C-dilute** is "Recessive Red Tan", like the other at mice. Aw/Aw, Aw/A and
  Aw/a with e/e stay "Recessive Red".
- **d/d p/p** stays "Recessive Fawn Amber" (decided: keep; farbmausfarben calls it "rec. Pink Eyed
  Amber").
- **Ay or Avy together with e/e** (with or without U) gets this note: "Ay, Avy and e/e can look
  identical so which are present can only be determined by genotype." It is not shown on white mice.
- **Ay/at + e/e + U** is a Sable, like Ay/at + E/E + U (Sable, Chocolate Sable, Marten Sable and so
  on, with the same names as in 4.4). It carries only the "can look identical" note, no hobby note
  (checked on 80 non-white genotypes: all named Sable, none with a hobby note).
- **Ay or Avy + e/e + U** (not Ay/at) is named like its E/E version: "Dominant Red Umbrous",
  "Brindle Umbrous", "Snowtiger Umbrous", and so on. It carries the same hobby note as its E/E
  version ("Often called sable in the hobby." for Ay, "Often called Brindle Sable in the hobby." for
  Avy) in addition to the "can look identical" note. This change was made after the final sweep in
  section 5, so the sweep still shows 2,304 of these results without "Umbrous"; they are fixed now
  (checked on 536 non-white genotypes: 0 without Umbrous, 0 with it twice).

### 4.6 "Sepia Fox" versus "Black Fox"
Decided: keep the calculator's "Sepia Fox" names and add the source names as a note, not as a rename
and not in the separate "Also known as" line.

| Genotype (tan, cch/cch) | Name shown | Note |
|---|---|---|
| none | Sepia Fox | Also known as Black Fox. |
| b/b | Chocolate Sepia Fox | Also known as Chocolate Fox. |
| d/d | Blue Sepia Fox | Also known as Blue Fox. |
| b/b d/d | Lilac Sepia Fox | Also known as Lilac Fox. |
| p/p | Dove Sepia Fox | Also known as Dove Fox. |
| b/b p/p | Champagne Sepia Fox | Also known as Champagne Fox. |
| d/d p/p | Silver Sepia Fox | Also known as Silver Fox. |
| b/b d/d p/p | Lavender Sepia Fox | Also known as Lavender Fox. |

- The first four names and aliases come from the sources (hiiret.fi, AFRMA). The pink-eyed four
  (Dove, Champagne, Silver, Lavender) are the calculator's own, following the self colours: before
  this change pink-eye did not change a tan + cch/cch name at all.
- Applies to tan (at) with cch/cch, with or without U, markings and leaden (a leaden Sepia Fox is
  named Blue Sepia Fox and gets "Also known as Blue Fox."; a leaden pink-eyed one is Silver Sepia
  Fox). Not applied to recessive red (e/e), which keeps its "Recessive Red ... Fox" names.
- Checked across all 25,920 combinations: 96 results are Sepia Fox names, every one matches its
  B, D and P genotype and carries the right alias, and no other mouse carries an alias note.

### 4.7 Notes on Ay with a C-dilute
- Ay with cch/c (Stone): "Likely off-white to white, depending on modifiers."
- Ay with cch/ce (Mock Chocolate): "Likely creamish to white, depending on modifiers."
- Ay with ch/cch or cch/ch (Dominant Red Burmese, and the Fox version with tan): name kept, note
  "Likely off-white to white." Hiiret says himalayan reduces yellow to white, and that Ay with
  ci/ch "would require testing", so this is an inference. The note also appears on the Ay/at Sable
  version (for example "Dominant Red Burmese Fox Sable"), as it does for Ay/at with cch/c.
- Ay with ce/ch (colorpoint beige type) used to read "Colorpoint Beige". It is now named with the
  Ay dilution names and a "Colorpoint" prefix (own names), with the note "Likely off-white to
  white.":

  | Dilutions (Ay, ce/ch) | Name |
  |---|---|
  | none | Colorpoint Dominant Red |
  | b/b | Colorpoint Dominant Red Chocolate |
  | d/d | Colorpoint Dominant Amber |
  | b/b d/d | Colorpoint Dominant Red Lilac |
  | p/p | Colorpoint Dominant Fawn |
  | b/b p/p | Colorpoint Dominant Fawn Chocolate |
  | d/d p/p | Colorpoint Dominant Fawn Amber |
  | b/b d/d p/p | Colorpoint Dominant Red Lavender |

  Tan adds "Fox" (Colorpoint Dominant Red Fox). Checked on 48 Ay genotypes with E/E: all start with
  "Colorpoint Dominant", all carry the note, and no non-Ay mouse carries it. Other genotypes with
  ce/ch (a/a, A/A, at/a, Avy/a) are unchanged.


## 5. Final sweep

The sweep covers every combination of A (27, excluding `/-` and lethal), C (15) and two options each
for B, D, P, E and Ln, with and without U: 27 x 15 x 2^5 x 2 = **25,920 combinations**, run through
the real `calculatePhenotype()`.

| Check | Result |
|---|---|
| Empty, unknown or error phenotypes | 0 |
| Distinct names without U | 373 (301 after findings #1 to #11, 285 originally) |
| Distinct names including U | 754 |
| Notes that name a source (hiiret, farbmausfarben, AFRMA) | 0 |

Rules checked across all 25,920 results, each with **0 violations**: Aw belly note placement; the
two "often called sable" notes; Sable names only on Ay/at + U; leaden notes only on ln/ln;
White-Bellied names only on Aw mice; Argente Creme only on p/p + cch/cch; the Ay/Avy + e/e note;
"Umbrous" never appearing without U and never twice; tan e/e + C-dilute always a Fox and Fox never
without tan; e/e + C-dilute always starting with "Recessive"; true Sables carrying no sable note.

The one check that did not pass is listed in section 6. Results carry between 0 and 4 notes
(0: 5,304; 1: 11,672; 2: 7,608; 3: 1,288; 4: 48). The 4-note case is Ay/Aw with c/cch, leaden and U;
the owner chose to keep all four notes.

## 5b. Genetic code builder and Target Outcome page

Checked by reading the code and running the page's real genotype-building function against the
calculator. The app itself was not opened.

- **Target Outcome never calls the calculator.** It only imports the gene list, so none of the new
  names or notes appear there. It builds a target genotype from the selected chips.
- **Seed to Appearance (builder):** the pink-eyed fox names (Dove Sepia Fox and so on) left the
  seeded colour as "Sepia Fox". Fixed: the seeded colour now matches the name. Checked against the
  original file from git: no genotype that had a seed colour lost it, and for every non-Aw genotype
  the seeded colour is the start of the phenotype name. The seed colour is empty for 5,120 non-Aw
  genotypes, the same as in the original code.
- **Target Outcome chips that were wrong or built nothing** (all in `TargetOutcomePage.jsx`):

  | Chip | Before | Now |
  |---|---|---|
  | Sable | Built Ay/a + U (now "Dominant Red Umbrous", not Sable) | Builds Ay/at + U = Sable |
  | Dominant Red | Overwrote Ay/at with Ay/a | No longer overwrites an A locus that is already Ay/\* |
  | Marten Sable | Built nothing | Builds Ay/at + cch/cch, and auto-selects Dominant Red and Umbrous = Marten Sable |
  | Snowtiger | Built nothing | Builds Avy/a, and C = cch/cch only if no other chip set C; auto-selects Am. Brindle = Snowtiger |
  | Blue Brindle | Built nothing; label said `Avy/- p/p` | Builds d/d and auto-selects Am. Brindle = Blue Brindle; label corrected to `Avy/- d/d` |
  | Amber (Dom.) | Built nothing | Builds d/d, auto-selects Dominant Red = Dominant Amber |
  | Amber (Rec.) | Built nothing | Builds d/d, auto-selects Recessive Red = Recessive Amber |
  | Rumpwhite | Built nothing | Builds W = Rw/w = Rumpwhite |
  | Hereford, Dutch, Berkshire | Built nothing | All build S = s/s+ (the calculator calls it Pied, with a note) |

- **Known limits:** chips that also set the A locus (Sepia, Grey Agouti, Fox, Chocolate, Blue and so
  on) overwrite the A locus chosen by a brindle or Sable chip, as they always did; for example
  Snowtiger + Chocolate gives a/a b/b cch/cch. Marten Sable shares a dropdown group with Sable, so it
  cannot select the Sable chip and brings in Sable's two dependencies instead.

## 6. Still open

| Item | Detail |
|---|---|
| Notes in the builder | Notes appear only inside the builder popup, joined as "Note: a; b". The animal form's summary box and the animal detail view show the phenotype and carriers but not notes, so the hobby-sable, Aw belly, leaden and "Also known as" notes are not visible there. Not changed. |
| Example images | No example images or entries were added for the new names (Lilac Agouti, Blue Argente, the Sable dilutions, White-Bellied Agouti and so on). |

### Builder versus calculator parser (fixed)
`parseMouseGeneticCode()` in `GeneticCodeBuilder.jsx` only matched alleles in the stored order, so
reversed input such as `A/Aw`, `ch/c` or `ae/a` was silently dropped (35 cases) and `a/A` was read
as the wrong genotype `a/a`. An exact reverse-order match now runs before the case-insensitive
fallback, matching the calculator's parser. All 27 A-locus combinations parse in both orders.

### `s+` parsing (fixed)
`S/s+` and `s/s+` (Pied with modifiers, used for Hereford and Dutch) were dropped by the parser
in both stored and reversed order, because the allele pattern only accepted letters. A code such as
`a/a s/s+ B/B` lost its S locus silently. Both parsers' patterns now accept one trailing `+` on an
allele. Checked on the builder's real parser: all 104 stored-order combinations and every reversed
combination parse to themselves, and `s/s+`, `S/s+`, `s+/s` and `s+/S` all parse correctly, alone or
inside a longer code. The calculator's own parser lives inside the component and could not be called
from a test, so only its pattern was tested (it accepts `s/s+`, `S/s+` and `s+/s`, and rejects
`s/s++` and `+/s`); that change has not been run end to end.

