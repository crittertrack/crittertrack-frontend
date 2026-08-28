# Ball Python — unverified combo alias candidates (Phase B)

Tracking list only — **none of these are coded into `BALL_PYTHON_COMBO_ALIASES`
yet**. Unlike the combos already added to
`ballPythonPhenotypeRules.js` (Killer Bee, Bumblebee, Pastave, Super Stripe,
Highway, The Diamond, Crystal, Mystic Potion, Opal Diamond, Cassandra,
Vanilla Cream, Chocolate Chip, Parkway, Leche, Crypton, Mixer, Lori Razor,
Saar Sable, Jolt Lori, Jolt Razor, Enchi Jolt, Bongo Saar, Blitz Trick), these are NOT confirmed via an explicit
"Description" field (or composition-listing heading alias) on
worldofballpythons.com — their compositions below are from general ball
python hobby knowledge only. Add to this list as more candidates come up;
move an entry to the real code + `BALL_PYTHON_GENETICS_MAP.md` "BATCH N"
section (with a throwaway verification script) only once explicitly
approved.

| Candidate name | Best-guess composition | Confidence | Notes |
|---|---|---|---|
| _(none currently pending)_ | | | All prior rows in this table have been resolved — see "Resolved" sections below. |

## Resolved (2026-08-28) — Crimson Spice (was "Leopard Ball Spotnose Stranger")

Confirmed composition: **Leopard + Spotnose + Stranger**, branded name
**"Crimson Spice"**. WOBP's own page title ("Leopard Ball Spotnose
Stranger") has the H1/subtitle pattern reversed from the site's usual
convention — a plain-looking gene-name concatenation as the H1, with the
actual branded name "(Crimson Spice)" in the subtitle. "Ball" is NOT a
modeled gene or a real component; independently confirmed via Delta7 Ball
Python's breeder blog (ameblo.jp), whose own image caption reads "Crimson
Spice aka Leopard Spotnose Stranger" and describes the phenotype as
Spotnose + Leopard's combined pattern-disrupting effect plus Stranger's
characteristic expression — no fourth gene. Coded as
`{ leo: 'leo/leo', spn: ['Spn/spn','Spn/Spn'], stg: ['Stg/stg','Stg/Stg'] } → 'Crimson Spice'`
(Leopard is Recessive/homo-only). Verified via a throwaway 5-test script
(5/5 passed, including confirming Ravenclaw — the other Leopard combo —
is unaffected).

## Resolved (2026-08-28) — redirected to standalone-gene modeling, not a combo

**Lemonback** — turned out not to be a combo question at all. ChatGPT's research
claimed it's a standalone Incomplete Dominant gene in a "Black-Eyed Leucistic"
complex; direct WOBP checks of both `/morphs/lemonback` and
`/morphs/super-lemonback` contradicted this (both tagged "Designer Morph",
"Genetics: N/A", no subtitle/Description — the same pattern used elsewhere in
this project to EXCLUDE candidates like Fader). Cross-referenced
via MorphMarket's Morphpedia instead (same external-cross-reference exception
precedent as Adder/Pewter), which confirmed: Type "Incomplete Dominant", first
produced by Pro Exotics (2008), own Complex "Black Eyed Leucistic (BlkEL)" —
note this is a DIFFERENT complex from this engine's `les`/`moj`/`but`/`pha`
"Blue-Eyed Leucistic" `BEL_COMPLEX_MEMBERS` group (matches the existing
"Disco Vanilla (Black-Eyed Leucistic)" combo's complex name instead). Added as
a new standalone locus (`lmb`) in `SIMPLE_INCOMPLETE_DOMINANT_RULES` /
`BALL_PYTHON_GENE_LOCI`, NOT folded into `BEL_COMPLEX_MEMBERS`/`belComplexName()`.
MorphMarket lists Brite/Lucifer/Mota/Sauce as proven-identical lines/aliases of
this same gene (not separate genes) — not modeled as separate loci, same
treatment as Saar=Chocolate. No Lemonback+Fire/Vanilla/Disco combo aliases
added yet (separate future task if needed). Verified 4/4 via throwaway script.


## Also checked this batch, confirmed NOT to exist under these names/slugs on the site
(original terse note, superseded by the deeper re-check below)

## Re-checked (2026-08-28) — Mojave Fire, Black Ice, Banana Cream, Yeti

- **Mojave Fire** — no standalone WOBP page, but the combination itself is
  real and needs NO alias rule: it's just Mojave (`moj`) + Fire (`fi`), two
  independent genes with no branded portmanteau name — this engine already
  displays it correctly via default trait stacking ("Mojave Fire").
  Confirmed via WOBP's "Mojave Fire Yellow Belly" page (plain gene-name
  concatenation title, no branded subtitle).
- **Black Ice** — re-confirmed 404 directly on worldofballpythons.com
  ("Page not found"). No credible ball-python source found elsewhere
  either. Not a real ball-python morph name; excluded.
- **Banana Cream** — real branded name, but genuinely ambiguous: WOBP has
  it as the AKA for at least TWO unrelated combos ("Banana Calico Pastel
  Piebald" and "Albino Banana Ball Genetic Stripe"). Since the same
  phenotype name maps to different genotypes depending on breeder/line,
  it cannot be safely coded as a single `{requires} → alias` rule.
  **Left out entirely** — not modeled.
- **Yeti** — confirmed to be a Western Hognose combo (Conda/Snow), NOT a
  ball python morph at all. Excluded from ball python matching.

## Resolved (2026-08-28) — "Daddy" confirmed real, added as 5th BEL-complex member

"Daddy" (displayed as **Het Daddy**, matching WOBP's own convention) is a
real Incomplete Dominant gene, first produced by Ralph Davis/Ralph Davis
Reptiles. Confirmed via TWO independent explicit WOBP statements — its
own base page ("is part of the blue eyed leucistic complex... barely
noticable without those combos") and its "Mojave Daddy" combo page ("two
morphs from the Blue eyed Leucy complex") — stronger confirmation than
the "Leuzist. Blue Eye" tag test used for Lesser/Mojave/Butter/Phantom.
Added as the 5th true `BEL_COMPLEX_MEMBERS` entry (`dad`), so it now
participates fully in `belComplexName()`'s collapse behavior. This
unblocked all 3 previously-blocked rows:
- **Russo Daddy** and **Mystic Daddy** — Russo/Mystic are NOT BEL members
  (same as Opal Diamond/Crystal precedent), so these just need default
  trait stacking, no new alias rule — confirmed via WOBP's own plain-name
  pages ("Russo Daddy"/"Mystic Daddy", Mutation: "Allelic combo").
- **Phantom Daddy** — Phantom IS a BEL member, so Phantom+Daddy already
  auto-collapses to generic "Blue-Eyed Leucistic" with zero new code,
  confirmed via WOBP's own page: "two morphs from the blue eyed
  leucistic complex."
Verified via two throwaway scripts (7/7 then 3/3 passed), including
regression checks confirming Lesser/Mojave/Butter/Phantom behavior is
unaffected.
## Resolved (2026-08-28) — "Huffman" confirmed real, standalone gene

"Huffman" is a real, standalone Incomplete Dominant gene — confirmed
directly on its own WOBP page (Base Morph, Complex "Huffman", Genetics
"Incomplete dominant", First Produced By Chris Huffman, Description:
"genetic black back with increased pigmentation and an overal darked
look"). Alt spelling "Hufman" noted on the same page. No BEL/complex
membership claim on this page (unrelated to the BEL-complex work above).
Added as standalone locus `huf` (Huf/huf = Huffman, Huf/Huf = Super
Huffman), matching the existing Jolt/Lori/Razor/Bongo pattern.

Both combo pages exist with a correctly-loading `<title>` ("Huffman
Jolt"/"Huffman Lori") but 404 content — the same known site-bug pattern
already used to confirm Jolt Lori/Jolt Razor/Lori Razor, so composition
was inferred from title with the same confidence level:
- **Huffman - Jolt** → `huf` + `jol`, added as combo alias "Huffman Jolt".
- **Huffman - Lori** → `huf` + `lor`, added as combo alias "Huffman Lori".

Verified via throwaway script, 5/5 passed (including a regression check
confirming the existing "Jolt Lori" alias is unaffected).
---

## Blocked — composition not confirmed by any source

Unlike the table above, this remaining candidate's composition is NOT
confirmed via explicit "Description"/subtitle text on worldofballpythons.com
or any independent source found so far — it's listed here because even
the exact gene list is uncertain, not just because a component gene is
unmodeled.

| Candidate name | Confirmed composition | Blocked on |
|---|---|---|
| Darkling Fusion Mojave | Uncertain — Fusion (`fsn`) + Mojave (`moj`) + possibly a third "Darkling" gene | Own page has NO subtitle/composition text and NO Description (Genetics: N/A) — same "undocumented" exclusion pattern as Fader, not codeable regardless of gene identity. Discovered 2026-08-29 batch-16 combo scoping pass. Re-checked 2026-08-28: "Darkling" IS confirmed real (MorphMarket's own "The Darkling" page — Incomplete Dominant, First Produced By Hognose UK/Barry Summerhayes, 2014), but this specific combo's exact composition is still unconfirmed by any source — a ChatGPT-cited corroborating WOBP page ("Darklings Mojave Pinstripe") was directly checked and is ALSO undocumented (Designer Morph, Genetics: N/A, no subtitle/Description), and MorphMarket's Darkling page has no structured "Fusion" combo entry. Remains excluded. |

## Excluded (2026-08-28) — "Fader" is polygenic/line-bred, not a Mendelian locus (The Ablaze)

"The Ablaze" (own subtitle "(Hidden Gene Woma Granite Fader Yellow Belly
Fire Pastel)") is permanently excluded, not just blocked-pending-research.

Per ChatGPT-provided research (NOT independently re-verified via direct
fetch this round — the fetch was interrupted and the user opted to accept
the finding and skip re-verification): "Fader" is a real, historically
used NERD term, but MorphMarket's own Morphpedia classifies it as
**Polygenic** (originating from selective breeding for blush/contrast
within NERD's Pastel/Citrus line), not a single incomplete-dominant/
dominant/recessive gene. MorphMarket is also reported to explicitly use
Fader as its own example of a polygenic trait, and to warn that
historical "Fader (Dominant)" labels (including on WOBP's own older
material) are misleading — "Super Fader" is a strength-of-expression
label, not a true homozygous genotype.

This engine's `SIMPLE_INCOMPLETE_DOMINANT_RULES`/`RECESSIVE_RULES`
architecture only models discrete Mendelian loci with deterministic
het/homo genotypes — a polygenic/line-bred trait like Fader cannot be
represented this way at all, regardless of how well its composition is
documented. "The Ablaze" is therefore excluded on principle, not just
pending confirmation. No code changes made.

## Resolved (2026-08-28) — "Orange Belly" confirmed real, standalone gene (Ob Redhead)

"Orange Belly" is a real gene, confirmed directly via WOBP's own dedicated
Base Morph page: Incomplete Dominant, own **Complex: "Orange Belly"**
(distinct from a "Yellow Belly complex"), description "intense flaming and
blushing... related to yellow belly", aliases "(Ob, Orangebelly,
Orange-belly, orngebelly)".

MorphMarket's own Yellow Belly Morphpedia page instead lists "Orange
Belly" as an **Alias** and a **Proven Line** of Yellow Belly (First
Produced By: Unknown) — this parallels the "Lemon Pastel" situation, but
the resolution differs: unlike "Lemon" (which never had its own WOBP Base
Morph page at all), "Orange Belly" has its own dedicated WOBP page with
its own distinct Complex field. Per the established **Cypress precedent**
(WOBP's own Complex field is authoritative when it disagrees with
MorphMarket), Orange Belly is modeled as its own independent standalone
locus `ob` — matching the existing Yellow Belly/Gravel/Special/Russo/
Specter/Spark pattern of "visually similar to Yellow Belly but modeled as
a separate locus."

"Ob Redhead" (own subtitle "(Orange Belly Redhead)", Designer Morph,
First Produced By The Mad Baller, 2013) added as a combo alias: `ob` +
`rhd` → "Ob Redhead". Verified via throwaway script, 7/7 passed.

## Resolved (2026-08-28) — "Lemon" is NOT a standalone gene (Lemon Drop/Lemon Blast recomposed)

"Lemon" is NOT a real standalone ball python gene — independently
confirmed via MorphMarket's own Pastel Morphpedia page, which lists
"Lemon Pastel" only as a **Proven Line** (breeder-line name) of Pastel,
first produced by NERD in 2000, not a separate genetic locus.

This recomposed both blocked candidates without adding any new gene:
- **Lemon Drop** — WOBP's own subtitle says "(Acid Lemon Pastel)", but
  MorphMarket's own Acid Morphpedia page independently lists "Lemon
  Drop — 2 Trait Combination — Pastel Acid" (only 2 genes). WOBP's extra
  "Lemon" token is a naming quirk, same class as the extraneous "Ball"
  token in Crimson Spice. Added as combo alias: `acd` + `pas` →
  "Lemon Drop".
- **Lemon Blast** — own WOBP page has NO subtitle/Description (Genetics:
  N/A, previously excluded under the Fader pattern). Independently
  cross-referenced via MorphMarket's own Pastel Morphpedia page (same
  method already used for Pewter/Black Pewter/Queen Bee), which lists
  "Lemon Blast — 2 Trait Combination — Pastel Pinstripe". Added as combo
  alias: `pas` + `pin` → "Lemon Blast".

As a side effect, MorphMarket's Pastel page also independently listed
"Pastave — 2 Trait Combination — Mojave Pastel", re-confirming this
engine's earlier Pastave bugfix (Mojave+Pastel, not Pastel+Puzzle) was
correct.

Verified via throwaway script, 5/5 passed (including regression checks
confirming Angel/Acid/Pastel are unaffected).

## Resolved (2026-08-28) — "Granite" confirmed real, standalone gene

"Granite" is a real, standalone Incomplete Dominant gene — confirmed
directly on its own WOBP page (Base Morph, Complex "Granite", First
Produced By Ralph Davis/Ralph Davis Reptiles) and its own Super Granite
page (first produced 2003). Description: "orange right behind the head,
a striped neck and dots behind the head." Added as standalone locus `gra`
(Gra/gra = Granite, Gra/Gra = Super Granite).

This resolved **Soul Reaper** (own subtitle "(Granite Hidden Gene Woma
Lesser Nova Pastel)", Designer Morph/Genetics N/A but subtitle present —
codeable, same pattern as Static Electricity/Lithium Blaze). Added as a
5-gene combo alias (`gra`+`wom`+`les`+`nov`+`pas`, het-level only, matching
the site's own subtitle exactly, same convention as Lithium Blaze).

**The Ablaze** is now permanently excluded on "Fader" alone (Granite no
longer a blocker) — "Fader" was determined to be polygenic/line-bred, not
a Mendelian locus; see the "Excluded" section below.

Verified via throwaway script, 5/5 passed (including a regression check
confirming Lithium Blaze is unaffected).

## Resolved (2026-08-28) — "Cypress" confirmed real, standalone gene

"Cypress" is a real, standalone Incomplete Dominant gene — confirmed
directly on its own WOBP page (Base Morph, Complex "Cypress", First
Produced By Outback Reptiles, has its own dedicated genetic test link —
strong confirmation of a distinct locus). Description: "Cypress have
orange, chocolate brown tones and a (completely) striped back." Added
as standalone locus `cyp` (Cyp/cyp = Cypress, Cyp/Cyp = Super Cypress).

All 3 previously-blocked combo pages exist with a correctly-loading
`<title>` but 404 content (same site-bug pattern as Jolt/Lori/Razor/
Wookie combos) — composition inferred from title:
- **Cypress - Saar** → `cyp` + `cho`, added as combo alias "Cypress Saar".
- **Black Head - Cypress** → `cyp` + `bh`, added as combo alias
  "Black Head Cypress".
- **Cypress - Wookie** → `cyp` + `wke`, added as combo alias
  "Cypress Wookie".

Verified via throwaway script, 7/7 passed (including regression checks
confirming Black Head Chocolate and Sable Wookie are unaffected).

**Resolved (2026-08-28, external cross-reference)**: "Pewter" (previously
listed in the candidates table above as "Pastel + Black Pastel, High
confidence") was corrected and coded. WOBP's own pages for Pewter, Black
Pewter, Pewter Bee, and Super Pewter were all individually re-checked and
confirmed to have NO subtitle/Description (Genetics: N/A across the
board) — so, per the Adder/Black Adder precedent, an external cross-check
was run instead. Multiple independent breeder-history sources (MorphMarket
structured combo data, Graziani Reptiles' own mutation history, Ralph
Davis Reptiles, Northwest Reptiles) all converge on **Pewter = Cinnamon +
Pastel**, NOT Black Pastel + Pastel as originally guessed — that distinct
combination is a separately-named "Black Pewter" combo, which was NOT
added (still unconfirmed/unmodeled). Coded as
`{ cinBp: 'Cin/n', pas: ['Pas/pas','Pas/Pas'] } → 'Pewter'`, positioned
before "50 Shades Of Grey" (which requires the same two genes plus Black
Head) so the more specific combo can subsume it. Verified via a throwaway
5-test script (5/5 passed, including confirming Black Pastel + Pastel
does NOT trigger "Pewter" and that "50 Shades Of Grey" no longer stacks
with "Pewter"). "Black Pewter" (Black Pastel + Pastel, `cinBp:'Bp/n'` +
`pas`) was also added the same day at the user's request, using the same
external-cross-reference sources. Verified via a separate 5-test script
(5/5 passed, including confirming a genotype with both Acid+Black Pastel
and Pastel correctly shows both "Black Pewter" and "Black Acid"
independently rather than incorrectly deduping, since they're genuinely
different 2-gene combos sharing only the `Bp/n` allele). See
`ballPythonPhenotypeRules.js`'s Pewter/Black Pewter rule comments for the
full citation list.

**Resolved (2026-08-28)**: "Queen Bee" (previously listed in the
candidates table above as "Pastel + Spider + Mojave") was corrected and
coded. External research (cross-checking multiple breeder sources)
identified the correct third gene as **Lesser**, not Mojave — Mojave,
Lesser, and Butter are all BEL-complex members, which was likely the
source of the original guess's confusion. This was then confirmed
directly on WOBP itself: "Spotnose Queen Bee"'s own page subtitle reads
"(Pastel Spotnose Spider Lesser)" — subtracting Spotnose gives Pastel +
Spider + Lesser, the same derivative-page confirmation pattern already
used for Stinger Bee/Krg Pepper Back. Coded as
`{ pas: 'Pas/pas', sp: ['Sp/sp','Sp/Sp'], les: 'Les/les' } → 'Queen Bee'`,
positioned after Bumblebee (a strict subset: Pastel+Spider) so it can
subsume it. Verified via a throwaway 5-test script (5/5 passed). Note:
the research also surfaced "Killer Queen Bee" (Super Pastel + Butter +
Spider) and "Bumble Bee Butter" (Pastel + Butter + Spider) as related but
distinct, NOT yet researched/added combos.

## Needs further research — contradicts an established architecture assumption

None remaining — Mocha Mojave and Disco Vanilla (below) were the last two
entries in this section; both resolved 2026-08-29.


**Resolved in batch 11 (2026-08-29)**: Crypton, Mixer, Lori Razor,
Saar Sable, Jolt Lori, Jolt Razor, Enchi Jolt, and Bongo Saar were all
unblocked after adding Jolt (`jol`), Lori (`lor`), Razor (`raz`), Bongo
(`bon`), Cryptic (`cry`), and Migraine (`mig`) as new standalone loci —
see `BALL_PYTHON_GENETICS_MAP.md`'s BATCH 11 section. "Saar" turned out
to be a genetic synonym for Chocolate (not a new gene), confirmed via its
own detail page.

**Resolved in batch 12 (2026-08-29)**: Bamboo Russo, Bongo Sable,
Chino Honey, Chino Russo, Enchi Razor, Saar Spider, Bamboo Chino,
Bamboo Honey, Bongo Spider, Butter Chino, Butter Honey, Chino Mojave,
Chino Mystic, Honey Mystic, Mystic Russo, and Mojave Russo were all
confirmed and added — see `BALL_PYTHON_GENETICS_MAP.md`'s BATCH 12
section. "Chino Mocha", "Bamboo Mocha", "Butter Mocha", and
"Mocha Mystic" were also seen on the site as separate page titles but
are exact duplicates of the Honey-named combos above (Mocha is a pure
synonym of Honey, see `hon` locus notes) — no separate alias needed for
those.

**Resolved in batch 18 (2026-08-29)**: Puma was confirmed as a real combo
(Spark `spk` + Yellow Belly `yb`) via its own explicit Description text
("produced by combining Spark and Yellow belly") and added directly to
`BALL_PYTHON_COMBO_ALIASES` — see `BALL_PYTHON_GENETICS_MAP.md`'s BATCH 18
section. This was never listed in this tracking file (it was already noted
as a likely-but-unconfirmed candidate in the `spk` locus metadata comment
since batch 13); noting the resolution here for completeness.

**Resolved (2026-08-29, external cross-reference)**: the "Super Adder"
(Colin Thomas lineage) ambiguity, previously flagged in batch 15 and
re-checked with no new info in batch 18, was resolved by cross-referencing
MorphMarket's Morphpedia (worldofballpythons.com alone was insufficient —
this is the one case in the whole project where a second source was used
as tie-breaker, at the user's explicit direction). MorphMarket's official
"Adder" wiki entry lists "Aliases: Black Adder" — i.e. Adder (Colin Thomas,
2006) and Black Adder (`bad`, Regius Club, 2006) are the SAME gene, not two
independent mutations. This explains WOBP's confusing duplicate "Super
Adder" (Colin Thomas)/"Super Black Adder" (Regius Club) pages — both are
rival-attribution duplicates for the same homozygous phenotype, not a
distinct unmodeled gene. No new locus was added; `bad`'s metadata comment
was updated to record this resolution. See `ballPythonPhenotypeRules.js`'s
`bad` locus comment for the full note.

**Resolved (2026-08-29, combo scoping pass)**: Saar - Wookie (`cho`+`wke`)
and Bongo - Wookie (`bon`+`wke`) both individually re-checked — same
correctly-loading-`<title>`/404-body pattern as many prior combos — added
directly as `BALL_PYTHON_COMBO_ALIASES` entries ("Saar Wookie"/"Bongo
Wookie"). **Mocha Mojave** resolved as a rival-attribution duplicate of the
already-coded "Mohoney" combo (Honey `hon` + Mojave `moj`) — its own page
(John Griffis Exotic Ball Pythons, 2014) shares the same "(Leuzist. Blue
Eye)" subtitle as Mohoney (Guy Montecalvo, 2013) but is a separate,
poorly-documented page ("Designer Morph"/"Genetics: N/A", no Description),
same duplicate-page pattern as Adder/Black Adder and the two "Super
Adder" pages — since Mocha is a confirmed pure synonym of Honey, this is
the SAME underlying combo as Mohoney, not a 5th BEL-complex member; no new
code needed, `hon`/`moj` stay exactly as modeled. **Disco Vanilla**
confirmed as a real, fully-documented Allelic combo (own Complex "Disco
Vanilla", Incomplete dominant, Description: "This is a striking combo
from the Black eyed leucistic complex.") — added as a `BALL_PYTHON_COMBO_ALIASES`
entry (`dsc`+`van` → "Disco Vanilla (Black-Eyed Leucistic)"). Confirmed
this is a DIFFERENT named complex from the existing "Blue-Eyed Leucistic"
(BEL, les/moj/but/pha) — the combo's own Complex field literally reads
"Disco Vanilla", not "Black Eyed Leucistic", and batch 8 already confirmed
no standalone "Black Eyed Leucistic" gene exists on the site under any
name — so this is its own distinct named combo, NOT folded into
`belComplexName()`/`BEL_COMPLEX_MEMBERS`. Verified with a throwaway
10-test script (10/10 passed).

