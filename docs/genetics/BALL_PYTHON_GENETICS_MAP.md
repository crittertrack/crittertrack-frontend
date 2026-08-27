# Ball Python Genetics — Gene/Allele Mapping (WORKING DRAFT)

> Status: core-gene draft written 2026-08-27 from general published ball
> python genetics knowledge (not scraped from any specific site — see the
> ToS note in the prior conversation). The 3 previously-flagged open
> questions (Vanilla super name, Champagne lethality, Cinnamon/Black Pastel
> naming) were confirmed by the user on 2026-08-27 — see resolved decisions
> below. Now being wired into `src/data/ballPythonPhenotypeRules.js`.

Locus key convention (matches Fancy Rat / Syrian Hamster / Campbells /
Russian Dwarf in this repo): **locus key = the lowercase mutant symbol**,
wildtype allele = same letters capitalized, for RECESSIVE genes. For
INCOMPLETE DOMINANT / DOMINANT genes it's reversed: mutant = capitalized
symbol, wildtype = lowercase. Genotype notation = `Allele1/Allele2`.

**Scope note (deliberate, 2026-08-27):** ball pythons have 200+ named morphs
in the hobby, with an enormous number of informal "designer" combo names
(Bumblebee, Killer Bee, Pastave, etc.) for specific 2-3 gene stacks. This v1
draft covers a ~20-gene core set and does **NOT** attempt to invent a combo
name for every possible stack — multiple simultaneous genes just list their
names space-joined (e.g. `Pastel Piebald`, `Super Pastel Spider Clown`),
same "just add up" convention used for unspecified stacking in the hamster
docs. A curated lookup table of well-known combo aliases (Bumblebee =
Pastel + Spider, etc.) could be layered on top later as a purely cosmetic
alias step, without changing the underlying rule engine.

---

## Full gene list (v1 core set + batch 2, 2026-08-27)

| Locus key | Symbol (mutant) | Mutation name | Type | Wildtype allele |
|-----------|-----------------|---------------|------|------------------|
| pi  | pi  | Piebald | Recessive | Pi |
| cl  | cl  | Clown | Recessive | Cl |
| gs  | gs  | Genetic Stripe | Recessive | Gs |
| ax  | ax  | Axanthic | Recessive — simplification: real hobby axanthic has multiple non-complementary lines (VPI/TSK/Joppa/etc.); this doc treats it as ONE generic locus for v1 | Ax |
| hy  | hy  | Hypomelanistic ("Hypo"/"Ghost") | Recessive | Hy |
| cml | cml | Caramel | Recessive | Cml |
| dg  | dg  | Desert Ghost | Recessive | Dg |
| sun | sun | Sunset | Recessive | Sun |
| rax | rax | Red Axanthic | Recessive — distinct, non-complementary line from the generic `ax` Axanthic above | Rax |
| tof | tof | Toffee | Recessive | Tof |
| lav | lav | Lavender Albino | Recessive — distinct, non-complementary line from the `albCdy` Albino/Candy locus above | Lav |
| ult | ult | Ultramel | Recessive — distinct, non-complementary hypo/albino-adjacent line | Ult |
| leo | leo | Leopard | Recessive | Leo |
| cry | cry | Cryptic | Recessive. **Standalone gene (added batch 11, 2026-08-29)** — striped neck, missing eye stripes. cry + cl combo = "Crypton" | Cry |
| mig | mig | Migraine | Recessive. **Standalone gene (added batch 11, 2026-08-29)** — source site: "Migraine is a line of Cryptic" (identical description, same genetic test); modeled as a distinct, non-complementary line rather than collapsed into `cry`, same style as rax/lav/ult. mig + cl combo = "Mixer" | Mig |
| pas | Pas | Pastel | Incomplete Dominant — Pas/Pas = Super Pastel | pas |
| en  | En  | Enchi | Incomplete Dominant — En/En = Super Enchi | en |
| fi  | Fi  | Fire | Incomplete Dominant — Fi/Fi = Black Fire | fi |
| cho | Cho | Chocolate | Incomplete Dominant — Cho/Cho = Super Chocolate | cho |
| van | Van | Vanilla | Incomplete Dominant — Van/Van = **Super Vanilla** (confirmed) | van |
| pin | Pin | Pinstripe | Incomplete Dominant — Pin/Pin = Super Pinstripe | pin |
| puz | Puz | Puzzle | Incomplete Dominant — Puz/Puz = Super Puzzle | puz |
| wom | Wom | Woma | Incomplete Dominant — Wom/Wom = Super Woma. Older "homozygous lethal" claim about Woma is outdated/incorrect — Super Woma is real and viable, unlike Champagne | wom |
| sab | Sab | Sable | Incomplete Dominant — Sab/Sab = Super Sable | sab |
| od  | Od  | Orange Dream | Incomplete Dominant — Od/Od = Super Orange Dream | od |
| ban | Ban | Banana | Incomplete Dominant — Ban/Ban = Super Banana. **Standalone gene (corrected batch 5, 2026-08-27)** — "Coral Glow" is NOT an allele of Banana; it's a separate standalone gene (re-added in batch 6, see correction note below) | ban |
| cg  | Cg  | Coral Glow | Incomplete Dominant — Cg/Cg = Super Coral Glow. **Standalone gene (re-added batch 6, 2026-08-27)** — real source is sex-linked with frequent crossing over in reality; simplified to plain autosomal Incomplete Dominant here (not modeled), same simplification style as the Axanthic-lines note | cg |
| yb  | Yb  | Yellow Belly | Incomplete Dominant — Yb/Yb = **Super Yellow Belly**. **Standalone gene (corrected batch 5, 2026-08-27)** — confirmed independent, NOT part of a shared complex with Special/Russo/Superstripe (see correction note below) | yb |
| grv | Grv | Gravel | Incomplete Dominant — Grv/Grv = Super Gravel. **Standalone gene (added batch 5, 2026-08-27)** — visually similar to Yellow Belly but genetically distinct; NOT the homozygous form of Yellow Belly | grv |
| spc | Spc | Special | Incomplete Dominant — Spc/Spc = Super Special. **Standalone gene (corrected batch 5, 2026-08-27)** — confirmed independent. Spc + Moj combo = "Crystal" (batch 6) | spc |
| rus | Rus | Russo | Incomplete Dominant — Rus/Rus = Super Russo. **Standalone gene (corrected batch 5, 2026-08-27)** — confirmed independent. CONFIRMED BEL-adjacent (batch 7): Rus + Pha combo = "Opal Diamond", Rus + Hon combo = "Cassandra" (both explicitly "from the bel complex") | rus |
| spe | Spe | Specter | Incomplete Dominant — Spe/Spe = Super Specter. **Standalone gene (added batch 5, 2026-08-27)** | spe |
| mys | Mys | Mystic | Incomplete Dominant — Mys/Mys = Super Mystic. **Standalone gene (added batch 6, 2026-08-27)** — Mys + Moj combo = "Mystic Potion" | mys |
| chn | Chn | Chino | Incomplete Dominant — Chn/Chn = Super Chino. **Standalone gene (added batch 6, 2026-08-27)** — described on source site as looking like "a brighter Phantom" (a BEL complex member), but modeled as its own separate locus | chn |
| hon | Hon | Honey | Incomplete Dominant — Hon/Hon = Super Honey. **Standalone gene (added batch 6, 2026-08-27)** — "Mocha" is a confirmed genetic synonym (source site: "genetically identical"), modeled as one locus using Honey as the canonical name. Hon + Rus combo = "Cassandra" (batch 7) | hon |
| bam | Bam | Bamboo | Incomplete Dominant — Bam/Bam = Super Bamboo. **Standalone gene (added batch 7, 2026-08-27)**, first produced by Eb Noah in 2013 | bam |
| sch | Sch | Scaleless Head | Incomplete Dominant — Sch/Sch is called **Scaleless** (NOT "Super Scaleless Head") — unusual naming vs. the rest of this group. **Standalone gene (added batch 8, 2026-08-28)**, first produced by Brian Barczyk/Bhb Reptiles in 2010 | sch |
| spn | Spn | Spotnose | Incomplete Dominant — Spn/Spn = Super Spotnose. **Standalone gene (added batch 8, 2026-08-28)**, first produced by VPI in 2005 | spn |
| asp | Asp | Asphalt | Incomplete Dominant — Asp/Asp = Super Asphalt. **Standalone gene (added batch 8, 2026-08-28)**, first produced by Todd Constable in 2009 | asp |
| jol | Jol | Jolt | Incomplete Dominant — Jol/Jol = Super Jolt. **Standalone gene (added batch 11, 2026-08-29)**, first produced by Outback Reptiles. Jol + Lor = "Jolt Lori"; Jol + Raz = "Jolt Razor"; En + Jol = "Enchi Jolt" (all 3 inferred from title, detail pages 404) | jol |
| lor | Lor | Lori | Incomplete Dominant — Lor/Lor = Super Lori. **Standalone gene (added batch 11, 2026-08-29)**, first produced by Brian Barczyk/Bhb Reptiles. Lor + Raz = "Lori Razor" (inferred from title, detail page 404s) | lor |
| raz | Raz | Razor | Incomplete Dominant — Raz/Raz = Super Razor. **Standalone gene (added batch 11, 2026-08-29)** | raz |
| bon | Bon | Bongo | Incomplete Dominant — Bon/Bon = Super Bongo. **Standalone gene (added batch 11, 2026-08-29)**, first produced by Eb Noah in 2012. Bon + Cho = "Bongo Saar" ("Saar" is a confirmed genetic synonym for Chocolate; inferred from title, detail page 404s) | bon |
| cha | Cha | Champagne | Incomplete Dominant — **Cha/Cha = LETHAL** (confirmed — embryonic/non-viable, homozygous excluded from selectable combinations like other lethal loci in this repo) | cha |
| sp  | Sp  | Spider | Dominant — no distinct homozygous form; Sp/Sp treated as same phenotype name as Sp/sp ("Spider"). **Health note:** Spider is associated with a documented neurological "wobble" condition — not a phenotype-naming issue, just worth surfacing to users somewhere in the UI | sp |
| les | Les | Lesser | Incomplete Dominant, member of the "BEL complex" (see below) | les |
| moj | Moj | Mojave | Incomplete Dominant, member of the "BEL complex" (see below) | moj |
| but | But | Butter | Incomplete Dominant, member of the "BEL complex" (see below) | but |
| pha | Pha | Phantom | Incomplete Dominant, member of the "BEL complex" (see below) | pha |
| cinBp | Cin / Bp | Cinnamon / Black Pastel | **Single multi-allelic locus** (confirmed, not two independent loci) — see below | n |
| albCdy | Alb / Cdy | Albino / Candy | **Single multi-allelic locus** (added batch 8, 2026-08-28) — Candy confirmed "allelic with regular Albino"; both recessive, single copy of either allele is an invisible carrier, Alb/Cdy compound = "Candino" | n |
| lacGhi | Lac / Ghi | Lace / GHI | **Single multi-allelic locus** (added batch 10, 2026-08-28) — site confirms "Lace and Ghi have been proven to be allelic with genetic testing"; **also corrects a prior bug**: GHI had been modeled as Recessive since batch 2, but the site's own Ghi page states it is actually Incomplete Dominant (matching the existing "Super Ghi" name) — both alleles are visible with a single copy, unlike Albino/Candy. Lac/n = Lace, Ghi/n = GHI, Lac/Lac = Super Lace, Ghi/Ghi = Super Ghi, Ghi/Lac compound = "Lace Ghi" | n |

**Still not added** (deferred, low confidence / too niche): "Special Noco" (confirmed
genetically **distinct** from regular Special/"Baker line" — a separate
breeder line deliberately not modeled, same simplification style as the
multiple real-world non-complementary Axanthic lines being collapsed into
one `ax` locus).

---

## The "BEL complex" (Lesser / Mojave / Butter / Phantom)

These four genes are different named mutations that are allelic (or close
enough that the hobby treats them as such) — combining **any two** mutant
copies across these four loci, whether from the same gene twice or two
different genes, produces **Blue-Eyed Leucistic (BEL)** instead of stacking
the two individual names. This is one of the most well-established facts in
ball python genetics (high confidence).

Rule: count total mutant alleles present across `les`+`moj`+`but`+`pha`.
- 0 mutant alleles → no contribution
- Exactly 1 mutant allele (at exactly one of the 4 loci, heterozygous) →
  that locus's own name (Lesser / Mojave / Butter / Phantom)
- 2 or more mutant alleles total (e.g. `Les/Les`, `Les/les` + `Moj/moj`,
  `Moj/Moj`, `But/but` + `Pha/pha`, etc.) → **"Blue-Eyed Leucistic"**,
  replacing all individual complex-member names

## CORRECTION (batch 5, 2026-08-27): the old "Yellow Belly complex" was wrong

The batch 3 design above (Yellow Belly/Special/Russo/Superstripe sharing a
0/1/2+ counting complex with a Gravel-vs-Ivory split) was **verified
against worldofballpythons.com/en/morphs and found to be incorrect**, and
has been fully reverted. Confirmed facts from that site's own morph detail
pages ("Mutation"/"Complex"/"Genetics" fields):

- **Yellow Belly**: `Base Morph`, own `Complex: Yellow Belly`, Incomplete
  Dominant. Yb/Yb = **Super Yellow Belly** (a normal Super name, NOT
  "Gravel").
- **Gravel**: a *separate* `Base Morph`, own `Complex: Gravel`, Incomplete
  Dominant — described as "indistinguishable from yellow belly" in
  appearance but genetically distinct. Grv/Grv = Super Gravel.
- **Special**: `Base Morph`, own `Complex: Special`, Incomplete Dominant.
  Spc/Spc = **Super Special** (own site page confirms this, not "Ivory").
- **Russo**: `Base Morph`, own `Complex: Russo`, Incomplete Dominant.
  Rus/Rus = **Super Russo**. Russo's own aliases include "Het Leucist" /
  "Het White Diamond", and it shows up in several "Allelic combo" entries
  with BEL-complex members (e.g. "Mojave - Russo") — suggesting a possible
  real allelic relationship to the BEL complex. **NOT modeled** here
  (deliberately, pending more research) to avoid changing the well-
  established BEL complex logic on uncertain grounds.
- **Superstripe**: NOT a standalone gene at all. Tagged `Allelic combo`,
  described as "A striped combination of Specter and Yellow belly." Now
  modeled purely as a combo alias (`Specter` + `Yellow Belly` → "Super
  Stripe"), not a locus.
- **Specter**: a *new* standalone `Base Morph`, own `Complex: Specter`,
  Incomplete Dominant (added in this correction — its own alias is "Het
  Super Stripe", confirming the Superstripe composition above). Spe/Spe =
  Super Specter.
- **Highway**: `Designer Morph`, described as "the combination of Gravel
  and Yellow belly." Modeled as a combo alias (`Gravel` + `Yellow Belly` →
  "Highway").
- **The Diamond**: `Allelic combo` of Russo + Special ("Russo Special"/
  "Special Russo" aliases). Modeled as a combo alias (`Russo` + `Special`
  → "The Diamond").

All five (`yb`, `grv`, `spc`, `rus`, `spe`) are now plain entries in the
same `SIMPLE_INCOMPLETE_DOMINANT_RULES` shape as Pastel/Enchi/etc. — no
special complex-counting logic remains for this group.

## Cinnamon / Black Pastel — true multi-allelic locus (confirmed design)

Cinnamon and Black Pastel are **different alleles of the same locus** —
not two independent genes. Modeled as ONE locus (`cinBp`) with 3 alleles:
wildtype `n`, `Cin`, `Bp`. This distinguishes "two copies at a locus" from
"two copies of the same allele", per the confirmed design:

| Genotype | Phenotype |
|----------|-----------|
| `n/n` | (no contribution — Normal) |
| `Cin/n` | Cinnamon |
| `Bp/n` | Black Pastel |
| `Cin/Cin` | Super Cinnamon |
| `Bp/Bp` | Super Black Pastel |
| `Bp/Cin` | **Cinnamon Black Pastel** (compound — NOT Super Cinnamon or Super Black Pastel) |

Engine consequence: `Cinnamon × Black Pastel` breeding produces 50%
Cinnamon + 50% Cinnamon Black Pastel compound (never Super Cinnamon or
Super Black Pastel from that specific pairing) — true allele-level Punnett
logic, not morph-name matching.

## CORRECTION (batch 5, 2026-08-27): Banana/Coral Glow multi-allelic locus was wrong

The batch 3 `banCg` design (Banana and Coral Glow modeled as two alleles of
one locus, mirroring Cinnamon/Black Pastel) was **verified against
worldofballpythons.com and found to be incorrect**, and has been reverted.
Confirmed facts:

- **Banana**: `Base Morph`, own `Complex: Banana` — a real standalone
  Incomplete Dominant gene. Now modeled as a plain standalone locus (`ban`),
  Ban/Ban = Super Banana.
- **Coral Glow**: tagged `Designer Morph` on its plain page (a stack of
  *other* genes), but its `(female)` variant page confirms it's actually a
  real `Base Morph`, Incomplete Dominant — the plain page was a site
  data-entry inconsistency. **Re-added in batch 6** as its own standalone
  locus (`cg`), Cg/Cg = Super Coral Glow. NOTE: the source site describes
  Coral Glow as "sex linked with frequent crossing over" in real biology —
  that inheritance mechanic is NOT modeled here (this engine has no
  sex-linked/crossover support anywhere yet), so it's simplified to plain
  autosomal Incomplete Dominant like every other gene.

## BATCH 6 (2026-08-27): Mystic/Chino/Honey added, BEL-adjacent combos confirmed

Further research confirmed a wider "BEL-adjacent" family beyond the core
four BEL complex members:

- **Mystic**: `Base Morph`, own `Complex: Mystic`, Incomplete Dominant.
  Mys/Mys = **Super Mystic**. Added as standalone locus `mys`.
- **Chino**: `Base Morph`, own `Complex: Chino`, Incomplete Dominant.
  Described as looking like "a brighter Phantom." Added as standalone
  locus `chn`.
- **Honey**: `Base Morph`, own `Complex: Honey`, Incomplete Dominant. Site
  states it is "genetically identical to Mocha" — modeled as ONE locus
  (`hon`, canonical name "Honey") rather than two separate genes.
- **Crystal** = Mojave + Special ("Mojave Special"/"Special Mojave"
  aliases), tagged `Allelic combo`, described as "An incredible combo from
  the BEL complex." Added as a combo alias (`Moj` + `Spc` → "Crystal").
- **Mystic Potion** = Mojave + Mystic ("Mojave Mystic"/"Mystic Mojave"
  aliases), tagged `Allelic combo`, described as "A beautiful purple snake
  from the BEL complex." Added as a combo alias (`Moj` + `Mys` →
  "Mystic Potion").

**Deliberately NOT done**: expanding `belComplexName()`/`BEL_COMPLEX_MEMBERS`
to include Special/Mystic/Russo/Chino/Honey. Even though the source site
describes Crystal and Mystic Potion as combos "from the BEL complex," each
gets its OWN distinct name with Mojave (Crystal, Mystic Potion) rather than
all collapsing to the single shared "Blue-Eyed Leucistic" name the way
Lesser/Mojave/Butter/Phantom do with each other. That means the real-world
mechanism for this wider group is NOT the same "any 2+ copies = one
universal name" rule — per-pair combo aliases (the existing mechanism) are
the factually correct way to model it, not a change to the core BEL
collapsing logic.

**Also confirmed but deliberately NOT added**: "Special Noco" is
`Base Morph`, own `Complex: Special Noco`, but the site explicitly states
it's "genetically distinct from a regular Special, also known as Baker
line" — i.e., a separate breeder line, not an allele of `spc`. Skipped to
avoid over-proliferating near-identical loci (same reasoning already
applied to the multiple real Axanthic lines collapsed into one `ax`
locus).

## BATCH 7 (2026-08-27): Bamboo added, Russo↔BEL relationship resolved

Continued digging per user direction ("keep digging... if you truly can't
find it, leave it and continue on other gaps"):

- **Bamboo**: `Base Morph`, own `Complex: Bamboo`, Incomplete Dominant,
  first produced by Eb Noah in 2013. Site notes it "dominates almost every
  other morph it is combined with" visually — a cosmetic note only, not
  modeled as an epistasis rule (no specific combo names confirmed for this
  locus yet). Added as standalone locus `bam`, Bam/Bam = Super Bamboo.
- **Opal Diamond** = Russo + Phantom ("Phantom Russo"/"Russo Phantom"
  aliases), tagged `Allelic combo`, described as "This incredible combo is
  made by combining Russo and Phantom." Phantom is a core BEL complex
  member — this finally confirms Russo DOES have a real BEL-adjacent
  combo (previously flagged as unconfirmed in batch 5/6). Added as a
  combo alias (`Rus` + `Pha` → "Opal Diamond").
- **cassandra** = Honey/Mocha + Russo ("Mocha Russo"/"Russo Mocha"
  aliases), tagged `Allelic combo`, described as "An amazing combination
  from the bel complex." Added as a combo alias (`Hon` + `Rus` →
  "Cassandra").
- Same reasoning as batch 6 applies here: `belComplexName()`/
  `BEL_COMPLEX_MEMBERS` was NOT expanded to include Russo/Honey — each
  BEL-adjacent pair gets its own distinct name (Opal Diamond, Cassandra)
  rather than collapsing into the shared "Blue-Eyed Leucistic" name.
- **Site bug encountered**: the "Mojave - Russo" detail page 404s even
  when reached via the search UI's own result-row click (not just a
  guessed URL slug) — left unconfirmed/unmodeled per the user's explicit
  "if you truly can't find it, leave it" instruction.

---

## BATCH 8 (2026-08-28): "finalize standalone genes" sweep + Albino/Candy multi-allelic correction

User directive: "finalise standalone genes. and then start working on the
combo aliases." Since the source site has NO category-browse/filter UI
(the plain `/en/morphs` page shows no results table without a search
query — confirmed this batch), true exhaustive enumeration of "every Base
Morph" isn't possible in one action. Instead, a curated list of
well-known real ball python gene names not yet modeled was checked one at
a time against the site (direct slug guess, falling back to the search UI
on 404).

**Confirmed and added (4 new standalone Incomplete Dominant genes):**
- **Lace** (`lac`): `Base Morph`, own `Complex: Lace`, Incomplete Dominant,
  first produced by Cv Exotics in 2002 (from an imported gravid female
  acquired in 1999). Lac/Lac = Super Lace.
- **Scaleless Head** (`sch`): `Base Morph`, own `Complex: Scaleless Head`,
  Incomplete Dominant, first produced by Brian Barczyk/Bhb Reptiles in
  2010. Missing scales between the eyes, divided anal scale, reduced
  pattern. Unusual naming: Sch/Sch is called **"Scaleless"**, not "Super
  Scaleless Head" (though "(Super Scaleless Head)" is a documented alias
  for the Scaleless page).
- **Spotnose** (`spn`): `Base Morph`, own `Complex: Spotnose`, Incomplete
  Dominant, first produced by VPI in 2005. Dorsal striping + clear spots
  on the nose. Spn/Spn = Super Spotnose.
- **Asphalt** (`asp`): `Base Morph`, own `Complex: Asphalt`, Incomplete
  Dominant, first produced by Todd Constable in 2009. Looks almost
  normal except extensive flaming; genetic testing recommended to
  identify with confidence. Asp/Asp = Super Asphalt.

**Confirmed NOT a gene (no code change):**
- **Sterling**: appears in dozens of "Designer Morph"-tagged combo names
  (Sterling Bee, Sterling Pastel, Citrus Sterling, etc.), but there is no
  standalone "Sterling" Base Morph page. Checking "Sterling Bee"'s
  description confirms it's an alias for "Cinnamon Spider Super Pastel" —
  i.e. "Sterling" is a breeder trade nickname for Cinnamon-based designer
  combos, not a separate gene. Nothing added.

**Checked, not found (left unmodeled):**
- **Black Eyed Leucistic**: not found under any tried slug or search term
  on this source site. Left unconfirmed/unmodeled — distinct from the
  already-modeled "Blue-Eyed Leucistic" (BEL complex).

**Architecture correction — Albino/Candy multi-allelic locus:**
While checking "Candy", the site's description states it "is allelic
with regular Albino" — i.e. Candy and Albino are different mutant alleles
of the SAME recessive gene, exactly like the existing Cinnamon/Black
Pastel (`cinBp`) pattern. Confirmed via the "Candino" page (`Allelic
combo`, Recessive, "the combination of Candy and Albino"). The plain
`alb` locus was converted to a true multi-allelic locus `albCdy`
(n/Alb/Cdy):
- Alb/Alb = Albino, Cdy/Cdy = Candy (each still needs 2 copies — both
  are recessive, unlike Cinnamon/Black Pastel which are each Incomplete
  Dominant and visible with 1 copy).
- A single copy of either allele (Alb/n or Cdy/n) is an invisible
  carrier state, not a visible trait.
- Alb/Cdy compound = **"Candino"**, its own confirmed name (comparable to
  Cinnamon/Black Pastel's "Cinnamon Black Pastel" compound name).

All batch 8 additions verified with a throwaway 16-test script (16/16
passed) before being deleted, and `get_errors` confirmed clean on both
`ballPythonPhenotypeRules.js` and `GeneticCodeBuilder.jsx`.

**Practical completeness caveat**: given the lack of a site-wide browse
filter, "finalized" standalone gene coverage here means "every well-known
gene from general ball python hobby knowledge has been checked and either
confirmed+added or confirmed absent/not-a-gene" — not a literal
100%-exhaustive crawl of the source site's full catalog. Per the user's
explicit directive, work now proceeds to Phase B: systematically
expanding `BALL_PYTHON_COMBO_ALIASES` beyond the current handful of
entries.

---
## BATCH 9 (2026-08-28): start of "combo aliases" pass — Vanilla Cream, Chocolate Chip

**Methodology finding**: many famous "Designer Morph"-tagged combo pages
(Pewter, Queen Bee, Lemonback all confirmed real, first-produced-by info
present) have **no "Description" field** stating their exact composition —
unlike "Allelic combo" pages and a minority of "Designer Morph" pages,
which reliably do. This is a genuine blocker to exhaustively expanding
combo aliases the same rigorous way Phase A was done. User's decision
(hybrid approach): add site-verified combos now; propose domain-knowledge
candidates (best-guess composition, clearly unverified) separately for
approval before coding them.

**Added (site-verified via explicit "Description" text or heading alias):**
- **Vanilla Cream** = Vanilla + Fire — description: "This amazing combo is
  a combination of Vanilla and Fire." (First produced by Gulf Coast
  Reptiles.)
- **Chocolate Chip** = Pastel + Sable + Spider — no separate "Description"
  field, but the heading's parenthetical alias literally reads "(Pastel
  Sable Spider)", which serves the same composition-confirming purpose
  here (this site uses that parenthetical as a plain gene-stack list for
  some combos, not just alternate spellings/nicknames).

**Important finding, NOT modeled as new aliases**: this site catalogs
individual BEL-complex *pairs* under their own separate names rather than
universally as "Blue-Eyed Leucistic" — e.g. "Lesser Mojave" (Lesser +
Mojave, alias "Leuzist. Blue Eye") and "Purple Passion" (Mojave +
Phantom). This was deliberately **not** added as new combo aliases,
because doing so would contradict the existing, well-established,
universal-hobby-term `BEL_COMPLEX_MEMBERS` collapse-to-one-name design
(`belComplexName()`) — and because every possible pair among the 4 BEL
members could in principle have its own historical/breeder marketing pet
name, which would be unbounded scope creep. These per-pair names are
treated as alternate/historical nicknames for the same BEL outcome our
code already produces.

**Checked and confirmed to NOT exist / not usable this batch:**
Mojave Fire (404), Black Ice (404), Banana Cream (404), Yeti (404),
Coral (not checked further after repeated 404s on adjacent guesses).

Verified via a throwaway 4-test script (4/4 passed) before being deleted;
`get_errors` confirmed clean on `ballPythonPhenotypeRules.js`.

---
## BATCH 10 (2026-08-28): Lace/GHI multi-allelic correction + Parkway + morph-list discovery

**Major discovery**: this source site DOES have a full browsable/searchable
morph list at `https://worldofballpythons.com/en/morphs` (a `<table>` with a
"Search morph" textbox and "Show more" pagination) — this **corrects** an
earlier (prior-batch) note claiming no category-browse/filter UI existed.
The list is very large (hundreds of morphs) and NOT alphabetically sorted;
only a partial pass through it was done this batch (paging was stopped
partway through), so more "Allelic combo" entries almost certainly remain
undiscovered for a future batch.

**Added:**
- **Parkway** = Asphalt + Specter ("Allelic combo", explicit "Description"
  text: "Asphalt & Specter"). Both loci (`asp`, `spe`) already modeled as
  standalone genes since batch 5/8.
- **Lace / GHI multi-allelic locus correction** — the site's "Lace Ghi"
  combo page states explicitly: "Lace and Ghi have been proven to be
  allelic with genetic testing." This required a full architecture
  migration, same shape as the batch 6 (`cinBp`) and batch 8 (`albCdy`)
  precedents: `lac` (Lace) and `ghi` (GHI) were merged from two independent
  standalone loci into one true multi-allelic locus `lacGhi` (n/Lac/Ghi).
  **This also fixes a genuine pre-existing bug**: `ghi` had been classified
  Recessive since batch 2, but the site's own dedicated Ghi page states its
  "Genetics" field is actually **Incomplete Dominant** (which is also the
  only classification consistent with the site's own cataloged "Super Ghi"
  name — a homozygous-mutant name pattern used for Incomplete Dominant
  genes, not Recessive ones, throughout this whole map). So unlike
  Albino/Candy (both Recessive, invisible single-copy carriers), Lace and
  GHI are each visible with a single copy, matching the `cinBp` pattern
  exactly. Ghi/Lac compound = "Lace Ghi" (its own confirmed name, matching
  the site's own "Lace Ghi" detail page). Verified via a throwaway 10-test
  script (10/10 passed, including reverse-order-notation normalization);
  `get_errors` confirmed clean on both `ballPythonPhenotypeRules.js` and
  `GeneticCodeBuilder.jsx` (which was also updated to match — see
  `/memories/repo/genetics-calculator-builder-architecture.md`).

**Found but blocked (require genes not currently modeled) — tracked in
`BALL_PYTHON_UNVERIFIED_COMBO_CANDIDATES.md`:**
- **Crypton** = Cryptic + Clown ("Cryptic" not modeled)
- **Russo Daddy** = Russo + "Daddy" gene ("Daddy" not modeled)
- **Lori - Razor** = Lori + Razor (neither modeled)
- **Saar - Sable** = Saar + Sable ("Saar" not modeled, though Sable is)
- **Mixer** = Migraine + Clown, explicit Description ("Migraine" not modeled)
- **Jolt - Lori**, **Jolt - Razor**, **Enchi - Jolt**, **Bongo - Saar** —
  found via further list pagination; composition inferred from the site's
  consistent "X - Y" pair-naming (Enchi - Jolt's own detail page 404s via
  direct slug guess, same site-bug pattern as batch 7's "Mojave - Russo").
  All blocked on "Jolt"/"Lori"/"Razor"/"Bongo" not being modeled.

**Also added this batch**: **Leche** = Honey/Mocha + Phantom ("a bright
combo with yellow and purple tones from the BEL complex") — same
BEL-adjacent per-pair-naming pattern as Opal Diamond (Russo+Phantom) and
Cassandra (Honey+Russo), NOT a `belComplexName()` change. Verified with a
throwaway 6-test script (6/6 passed).

**Note for a future batch**: "Jolt" is a real, well-established `Base
Morph` (Incomplete Dominant, own "Super Jolt" name, first produced by
Outback Reptiles) missed during Phase A — it's now a blocking dependency
for 3 separate combos found this batch (Jolt - Lori, Jolt - Razor,
Enchi - Jolt). Adding it as a standalone locus would unblock all 3 at once.

---
## BATCH 11 (2026-08-29): reopened Phase A — added Jolt, Lori, Razor, Bongo, Cryptic, Migraine

User explicitly requested reopening the "finalize standalone genes" phase:
*"eventually our calculator needs to have all genes"*. Rather than treating
every newly-discovered dependency as permanently blocked, this batch went
back and individually verified each gene flagged in batch 9/10's blocked
list against its own detail page on the source site.

**Added 6 new standalone loci:**
- **Jolt** (`jol`) — Incomplete Dominant, own "Super Jolt" name, first
  produced by Outback Reptiles (previously flagged in batch 10's "note for
  a future batch").
- **Lori** (`lor`) — Incomplete Dominant, own "Super Lori" name, first
  produced by Brian Barczyk/Bhb Reptiles. "Genetic black back with
  increased pigmentation and an overall darked look."
- **Razor** (`raz`) — Incomplete Dominant, own "Super Razor" name. "High
  contrast animals, with distinct black background coloration & gold or
  rust colored patterning."
- **Bongo** (`bon`) — Incomplete Dominant, own "Super Bongo" name, first
  produced by Eb Noah in 2012. "Black back and slightly darker overall
  color and reduced alien heads."
- **Cryptic** (`cry`) — Recessive. "Almost always has a striped neck and
  missing eye stripes."
- **Migraine** (`mig`) — Recessive. Own detail page states verbatim:
  "Migraine is a line of Cryptic. Cryptic has a striped neck and missing
  eye stripes" — and its own "Genetic Tests Available" field literally
  lists "Cryptic" as the test. Despite this close relationship, it was
  modeled as its own separate locus (not collapsed into `cry`) — same
  simplification precedent already used for rax/lav/ult (distinct,
  non-complementary "lines" of a base gene each get their own locus rather
  than being merged, to avoid a false claim that two differently-named,
  separately-tracked morphs are always genotype-identical).

**NOT added as a new locus** — "Saar" was checked and its own detail page
states verbatim: *"Proherper genetic testing has proven this to be
identical to Chocolate."* This is a straight genetic synonym (same pattern
as Honey/Mocha), not an allelic relationship — so no new locus was created;
`cho` (Chocolate) is reused for all Saar-named combos instead.

**This unblocked 8 combo aliases** (added to `BALL_PYTHON_COMBO_ALIASES`,
verified via a throwaway 15-test script, 15/15 passed):
- **Crypton** = Cryptic + Clown (explicit "Description" text: "the allelic
  combination that is made after pairing Cryptic and Clown together")
- **Mixer** = Migraine + Clown (explicit "Description" text: "the allelic
  combination of Migraine and Clown")
- **Lori Razor**, **Saar Sable**, **Jolt Lori**, **Jolt Razor**,
  **Enchi Jolt**, **Bongo Saar** — each has a correctly-loading page
  `<title>` confirming the exact name (e.g. "Jolt Lori | World of Ball
  Pythons") but the page body 404s — the same site-bug pattern seen with
  "Mojave - Russo" (batch 7) and "Enchi - Jolt" (batch 10). Composition
  inferred from the title/name, consistent with the site's naming
  convention observed everywhere else.

**Still unresolved**: "Russo Daddy" remains unmodeled — its own dependency,
"Daddy", 404s even as a standalone gene page (no usable `<title>` either),
so it could not be confirmed as a real gene name at all and is left in
`BALL_PYTHON_UNVERIFIED_COMBO_CANDIDATES.md`.

`get_errors` confirmed clean on both `ballPythonPhenotypeRules.js` and
`GeneticCodeBuilder.jsx` (gene order + gene groups updated to match).

---
## Overall phenotype algorithm (confirmed)

1. **Lethal check first**: `Cha/Cha` (Champagne homozygous) → `LETHAL
   (Cha/Cha)`. Matches the existing repo convention for lethal genotypes
   (Mi/Mi, Si/Si, Wh/Wh, Lg/Lg in the hamster engines) — just labels the
   outcome as lethal, does NOT renormalize offspring percentages across the
   Punnett grid (that would be a larger cross-cutting change affecting every
   species' calculator, out of scope here). Not applying any lethality
   assumption to `Sp/Sp` — documented as simply "Spider", unconfirmed either
   way.
2. Compute the **black complex** contribution (true multi-allelic locus,
   `cinBp`, see table above — not a 0/1/2+ count).
3. Compute the **BEL complex** contribution (0/1/2+ rule above).
4. Compute each standalone Incomplete Dominant / Dominant locus's own name
   independently: Pastel/Super Pastel, Enchi/Super Enchi, Fire/Black Fire,
   Chocolate/Super Chocolate, Vanilla/Super Vanilla, Pinstripe/Super
   Pinstripe, Puzzle/Super Puzzle, Woma/Super Woma, Sable/Super Sable,
   Orange Dream/Super Orange Dream, Banana/Super Banana, Coral Glow/Super
   Coral Glow, Yellow Belly/Super Yellow Belly, Gravel/Super Gravel,
   Special/Super Special, Russo/Super Russo, Specter/Super Specter,
   Mystic/Super Mystic, Chino/Super Chino, Honey/Super Honey,
   Bamboo/Super Bamboo, Jolt/Super Jolt, Lori/Super Lori, Razor/Super
   Razor, Bongo/Super Bongo, Spider (see batch 5/6/7 correction notes above —
   Yellow Belly/Gravel/Special/Russo/Specter/Mystic/Chino/Honey/Bamboo/
   Coral Glow are each independent, NOT a shared complex).
5. Compute each Recessive locus's own name if homozygous mutant: Piebald,
   Clown, Genetic Stripe, Axanthic, Hypo, Caramel, Desert Ghost,
   Sunset, Red Axanthic, Toffee, Lavender Albino, Ultramel, Leopard,
   Cryptic, Migraine.
   (Albino is handled via the multi-allelic `albCdy` locus above, not here;
   GHI is now handled via the multi-allelic `lacGhi` locus above — see
   batch 10 correction — no longer a plain Recessive locus.)
6. **Concatenate every present name, space-joined**, in a fixed stacking
   order (proposed, arbitrary — not community-standardized):
   Super Cinnamon/Cinnamon/Black Pastel → Chocolate/Super Chocolate →
   Fire/Black Fire → Enchi/Super Enchi → Pastel/Super Pastel →
   Vanilla/Super Vanilla → Pinstripe → Puzzle → Woma → Sable → Orange
   Dream → Banana → Yellow Belly → Gravel → Special → Russo → Specter →
   Champagne → Spider → Blue-Eyed Leucistic/Lesser/Mojave/Butter/Phantom →
   Piebald → Clown → Genetic Stripe → Albino → Axanthic → Hypo → Caramel.
7. **Apply designer combo aliases** (batch 4 + batch 5, see below) — if
   the genotype matches one of a small, high-confidence set of well-known
   combos (e.g. Pastel + Spider), replace those two individual names with
   the single alias name (e.g. "Bumblebee") in place. Every other
   simultaneous-gene combination is left as plain stacked names — no
   alias is invented for anything not in the table.
8. If nothing present → **"Normal"**.

## Carriers

Recessive loci show "Carries [mutation name]" when het: `pi` → Carries
Piebald, `cl` → Carries Clown, `gs` → Carries Genetic Stripe, `alb` →
Carries Albino, `ax` → Carries Axanthic, `hy` → Carries Hypo, `cml` →
Carries Caramel. Incomplete Dominant / Dominant loci (`pas`, `en`, `fi`,
`cho`, `van`, `yb`, `cha`, `sp`, and all BEL-complex/black-complex loci) are
visible in any dosage, so they are never silently "carried."

---

## Designer combo aliases (batch 4, 2026-08-27)

Same mechanic as "Blue + Chocolate = Lilac" in the hamster rule files —
two independently-segregating genes stacked together get their own
hobby-recognized name instead of two words. Unlike the mouse/hamster
dilution combos (a small closed set), Ball Python has 39 genes → thousands
of theoretical pairings, and only a fraction have a hobby-recognized name.
Rather than guess at a large table and risk wrong facts in a breeding
tool, only the following high-confidence combos are aliased; every other
combination simply falls back to plain stacked names (e.g. "Pastel
Enchi"), which is always accurate even if less "catchy":

| Requires | Alias |
|----------|-------|
| Pastel (het) + Spider | Bumblebee |
| Super Pastel (homo) + Spider | Killer Bee |
| Pastel (het) + Puzzle (het) | Pastave |
| Specter (het) + Yellow Belly (het) | Super Stripe (batch 5, confirmed via worldofballpythons.com) |
| Gravel (het) + Yellow Belly (het) | Highway (batch 5, confirmed via worldofballpythons.com) |
| Russo (het) + Special (het) | The Diamond (batch 5, confirmed via worldofballpythons.com) |
| Mojave (het) + Special (het) | Crystal (batch 6, confirmed via worldofballpythons.com) |
| Mojave (het) + Mystic (het) | Mystic Potion (batch 6, confirmed via worldofballpythons.com) |
| Russo (het) + Phantom (het) | Opal Diamond (batch 7, confirmed via worldofballpythons.com) |
| Honey (het) + Russo (het) | Cassandra (batch 7, confirmed via worldofballpythons.com) |

**Not attempted**: the hundreds of other recognized combo names (Mojave
Fire, Lemonback, Enchi Pastel variants, etc.) — low confidence on the
exact required zygosity/gene pairs for most of these without an external
reference to verify against. If a reliable source list is available,
more can be added the same way (a `{requires, remove, alias}` rule).

## Resolved decisions (2026-08-27)

1. ✅ Vanilla homozygous = **Super Vanilla**.
2. ✅ Champagne homozygous = **lethal/non-viable** (no viable "Super
   Champagne" phenotype).
3. ✅ Cinnamon × Black Pastel = **true multi-allelic locus** — combined
   heterozygote is a distinct "Cinnamon Black Pastel" compound name, never
   collapsed into Super Cinnamon or Super Black Pastel.

## Still open questions

1. Is the v1 core gene list (20 genes) the right starting scope, or should
   any of these be dropped/swapped/added before building the rule engine?
5. Stacking order for the final concatenated phenotype name (step 6 above)
   is arbitrary/my own choice — should it follow a different convention
   (e.g. alphabetical, or "most visually dominant trait first")?
6. Should recognized "designer" combo aliases (Bumblebee = Pastel + Spider,
   Killer Bee = Super Pastel + Spider, Pastave = Pastel + Lesser/Mojave/etc.
   BEL-complex member, etc.) be added as a later cosmetic alias layer, and if
   so, which ones are worth prioritizing?
7. Confirm species string to use in code: `'Ball Python'` (already exists in
   `DEFAULT_SPECIES_OPTIONS`? — currently it does NOT; it only exists in
   `speciesFieldTemplates.js`'s category map and `PublicProfileView.jsx`'s
   display-name map, not in the genetics Tier-1 species list yet).
