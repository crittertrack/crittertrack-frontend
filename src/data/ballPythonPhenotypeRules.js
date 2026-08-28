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
 *       vnt, zbr, shr, rbw                        (Recessive; added batch 17,
 *         2026-08-29 — vnt/zbr confirmed distinct from each other, shr kept
 *         separate from dg despite a hedged "expected to be the same" claim,
 *         rbw kept separate from albCdy despite being "a type of albino")
 *       snt, spd, pnt                              (Recessive; added batch 18,
 *         2026-08-29 — all three "suspected to be the same or allelic" per
 *         their own hedged Description text, kept as 3 separate loci)
 *       pas, en, fi, cho, van,
 *       pin, puz, wom, sab, od,
 *       ban, cg, yb, grv, spc, rus, spe, mys, chn, hon, bam,
 *       spn, asp                                  (Incomplete Dominant,
 *         own Super name — see 2026-08-27/2026-08-28 correction/expansion notes below)
 *       jol, lor, raz, bon                         (Incomplete Dominant, own Super name;
 *         added batch 11, 2026-08-29 — see addendum below)
 *       jav, bld, cal, dst, dsc, bh, spk, jag, krg (Incomplete/Dominant, own Super name;
 *         added batch 13, 2026-08-29 — see addendum below)
 *       ahi, dot, web, acd, bng, caf, gob, grm, jed, nov (Incomplete/Dominant,
 *         own Super name; added batch 14, 2026-08-29 — see addendum below)
 *       bad, bgo, blz, blt, crm, gnx, nya, orb, pxl, qke (Incomplete/Dominant,
 *         own Super name; added batch 15, 2026-08-29 — see addendum below)
 *       sat, hur, cpr, fsn, ksm, rpr, stc, trj, wke, zwd (Incomplete/Dominant,
 *         own Super name; added batch 16, 2026-08-29 — see addendum below.
 *         NOTE: `hur` (Hurricane) replaces the gap list's "Trick", a confirmed
 *         pure synonym of Hurricane — no separate `trk` locus was added)
 *       mar, pch, rvn, sgr, vdo, mos               (Incomplete/Dominant,
 *         own Super name; added batch 17, 2026-08-29 — see addendum below)
 *       rgn, rhd, stk, tar, mck, stg, nny           (Incomplete/Dominant,
 *         own Super name; added batch 18, 2026-08-29 — see addendum below)
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

/* BATCH 13 (2026-08-29, "truly scope all genes" pass): a full-scope audit
 * (cross-referencing worldofballpythons.com's own search against a
 * breeder-gallery gene list from ballpython.ca) found ~30 standalone genes
 * that existed on the source site but had never been modeled — far more
 * than the handful of combo aliases each prior batch added. This batch
 * codes the first, highest-confidence group of 10: Java, Blade, Calico,
 * Desert, Disco, Black Head, Spark, Jaguar, and Krg — each confirmed via
 * its own detail page (Mutation: Base Morph, Genetics: Dominant or
 * Incomplete dominant, plus a distinct "Super X" homozygous page) and
 * modeled with the same het/homo `SIMPLE_INCOMPLETE_DOMINANT_RULES` shape
 * used throughout this file, regardless of whether the site labels the
 * gene "Dominant" or "Incomplete dominant" (Calico/Desert/Krg are labeled
 * plain "Dominant" but still have a distinct Super name, unlike Spider).
 * "Fader" was investigated and deliberately EXCLUDED: despite appearing in
 * dozens of combo names, its own detail page is tagged "Designer Morph"
 * with "Genetics: N/A" — the site itself doesn't know/state its exact
 * inheritance, so it cannot be safely modeled as a discrete locus (same
 * caution as the pre-existing Mocha Mojave flag). Desert's page explicitly
 * confirms it is NOT the same gene as the already-modeled Desert Ghost
 * (`dg`) despite the similar name. Also investigated and ruled OUT as new
 * genes: Sulphur and Ringer (zero site search results — not real,
 * recognized names), standalone "Ghost" (no distinct page found — appears
 * to be informal shorthand for Desert Ghost), and "Black Velvet" (searching
 * it surfaces Lace/Lace Sable results — appears to be a nickname for the
 * existing Lace+Sable combo, not a new gene). The remaining ~20 confirmed
 * gaps (Ahi, Dot, Web, Acid, Bang, Cafe, Gobi, Grim, Jedi, Nova, Adder,
 * Bingo, Blaze, Blitz, Creme, Genex, Nyala, Orbit, Pixel, Quake, Satin,
 * Trick, Copper, Fusion, Kosmos, Reaper, Static, Trojan, Wookie, Zuwadi,
 * plus Puma/Nanny/Paint pending individual confirmation) are intentionally
 * left for future batches — see /memories/repo/genetics-calculator-builder-architecture.md
 * for the full running list. */

/* BATCH 14 (2026-08-29, continued "truly scope all genes" implementation):
 * coded the next 10 confirmed gaps: Ahi, Dot, Web, Acid, Bang, Cafe, Gobi,
 * Grim, Jedi, Nova — all 10 confirmed codeable (no Fader-style exclusion
 * this batch). Each verified via its own detail page + a matching
 * "/super-{slug}" page, same het/homo shape as batch 13 regardless of
 * whether the site literally labels Genetics "Dominant" or "Incomplete
 * dominant" (Web/Acid/Cafe/Nova say plain "Dominant" but still have a
 * distinct Super name). Two notable quirks: (1) "Ahi" itself has no
 * working base detail page and doesn't appear as its own row in site
 * search (only "Super Ahi" does) — modeled anyway based on the confirmed
 * Super Ahi page and this file's consistent naming convention, same risk
 * tolerance as several title-only batch 10/11 combos. (2) "Gobi" and
 * "Super Gobi" are both tagged Mutation "Designer Morph" (not "Base
 * Morph"/"Super") YET both explicitly state "Genetics: Incomplete
 * dominant" with their own distinct Complex name — treated as a site
 * data-entry quirk (same as Coral Glow's mistagged bare page in batch 6),
 * NOT the same kind of red flag as Fader (whose Genetics was "N/A", i.e.
 * genuinely undocumented) — the presence of an explicit inheritance type
 * is what determines codeability, not the Mutation tag wording. "Super
 * Grim" has an alt-name "grimreaper" — this is just a nickname for Super
 * Grim, NOT the same as the separate still-unmodeled "Reaper" gene on the
 * gap list; don't conflate the two if Reaper is researched later. */

/* BATCH 15 (2026-08-29, continued "truly scope all genes" implementation):
 * coded the next 10 confirmed gaps: Black Adder (in place of the gap
 * list's bare "Adder"), Bingo, Blaze, Blitz, Creme, Genex, Nyala, Orbit,
 * Pixel, Quake — all 10 confirmed codeable. Each verified via its own
 * detail page + a matching "/super-{slug}" page, same het/homo shape as
 * prior batches regardless of whether the site literally labels Genetics
 * "Dominant" or "Incomplete dominant". Notable quirks: (1) "Adder" itself
 * 404s on its own slug and is NOT a standalone gene — its detail page
 * doesn't exist, but "Black Adder"'s own alt-names paragraph explicitly
 * lists "adder" as an alias, confirming Adder = Black Adder, not a
 * separate locus. A different, unconnected "/super-adder" page also
 * exists (First Produced By: Colin Thomas — a different breeder than
 * Black Adder's Regius Club) with no matching confirmable base page; left
 * unmodeled and flagged in BALL_PYTHON_UNVERIFIED_COMBO_CANDIDATES.md as
 * an unresolved ambiguity, NOT conflated with Black Adder. (2) "Creme"
 * and "Super Creme" are both tagged Mutation "Designer Morph" (not "Base
 * Morph"/"Super") yet both explicitly state "Genetics: Incomplete
 * dominant" — same site data-entry quirk as Gobi (batch 14)/Coral Glow
 * (batch 6), still codeable. (3) Blitz has a genetic test literally named
 * "Hurricane" — this is just a test/product name, NOT an alternate
 * homozygous name; Super Blitz's own Complex field is confirmed plain
 * "Super Blitz". (4) Orbit and Pixel have word-for-word near-identical
 * Description text (both granite-type morphs with orange behind the
 * head/striped neck/dots) and Grim (batch 14) is very similar too — likely
 * a convergent "granite family" of independently-discovered but visually
 * similar mutations (see also Dot/Acid/Static/Confusion) — modeled as 3
 * fully separate loci per the site's own separate Complex/breeder
 * listings for each, NOT merged together. */

/* BATCH 16 (2026-08-29, continued "truly scope all genes" implementation):
 * coded the next 10 gap-list genes: Satin, Trick, Copper, Fusion, Kosmos,
 * Reaper, Static, Trojan, Wookie, Zuwadi — 9 of the 10 yielded a real new
 * locus (Satin `sat`, Copper `cpr`, Fusion `fsn`, Kosmos `ksm`, Reaper
 * `rpr`, Static `stc`, Trojan `trj`, Wookie `wke`, Zuwadi `zwd`). Notable
 * quirks: (1) "Trick" is NOT its own locus — its own detail page
 * explicitly states "Trick is genetically identical to Hurricane" (same
 * strong-synonym pattern as the "Saar is proven identical to Chocolate"
 * precedent from batch 11) — so "Hurricane" (`hur`) was researched and
 * coded instead, with Trick treated as a pure alias, no separate locus.
 * This is DISTINCT from the "Migraine is a line of Cryptic" precedent
 * (batch 11), where Migraine WAS kept as its own separate locus because
 * it lacked an explicit "identical to"/"proven identical" claim — the
 * determining factor is the STRENGTH of the site's stated relationship.
 * (2) Blitz (`blt`, batch 15) also lists a genetic test literally named
 * "Hurricane" but its own page does NOT claim genetic identity with
 * Hurricane (just a descriptive metaphor) and has its own distinct
 * Complex/breeder (Hardy Reptiles, 2010, vs. Hurricane's Hans Winner,
 * 2010) — correctly stays a separate locus, no changes needed there.
 * Confirmed via the site's own "Blitz Trick" combo page (title loads,
 * body 404s — same site-bug pattern as several batch 10-12 combo pages)
 * that Blitz + Hurricane(=Trick) is a real documented pairing, added as
 * a BALL_PYTHON_COMBO_ALIASES entry. (3) Reaper independently confirmed
 * as its own distinct locus (Complex "Reaper", breeder Bill Buchmann),
 * NOT to be confused with Super Grim's "grimreaper" nickname (batch 14
 * caution note) — no changes needed to the existing Grim entry.
 * (4) Static, Kosmos, and Reaper are further members of the same likely
 * convergent "granite family" as Dot/Acid/Grim/Orbit/Pixel (batches
 * 13-15) — Static's own Description even explicitly says "likely to be
 * similar to Acid and Confusion" — all modeled as fully separate loci per
 * the site's own separate Complex/breeder listings, NOT merged together.
 * (5) Wookie has a genetic test literally named "Wookie" (matches its own
 * name, no ambiguity) — this unblocks the previously-flagged "Saar -
 * Wookie"/"Bongo - Wookie" combo candidates, though those still are NOT
 * added as confirmed combo aliases since no explicit Description-field
 * composition was found for either (only inferred from page titles);
 * left as a note for future verification. (6) Copper's Description notes
 * visual similarity to "Mahogany" (an unresearched gene, not currently on
 * the gap list) — flagged as a note only, not investigated further. */

/* BATCH 17 (2026-08-29, continued "truly scope all genes" implementation):
 * coded the next 10 gap-list genes: Mario, Peach, Raven, Sugar, Vanta,
 * Vudoo, Zebra, Mosaic, Sahara, Rainbow — all 10 confirmed codeable as
 * their own distinct loci (no collapses/exclusions this round, unlike
 * batch 16's Trick=Hurricane). 6 Incomplete Dominant (`mar`/`pch`/`rvn`/
 * `sgr`/`vdo`/`mos`), 4 Recessive (`vnt`/`zbr`/`shr`/`rbw`) — the first
 * Recessive additions since batch 11 (Cryptic/Migraine). Notable quirks:
 * (1) Raven's Description is word-for-word identical to Satin's (batch
 * 16), and Vudoo's Description is word-for-word identical to Zuwadi's
 * (batch 16) — same "near-identical Description, different breeder/
 * Complex, kept separate" pattern as the granite family (Dot/Acid/Grim/
 * Orbit/Pixel/Kosmos/Reaper/Static). (2) Vanta's own page explicitly
 * states "It resembles Zebra, but is genetically different" — an
 * explicit NON-identity confirmation, both kept as separate Recessive
 * loci. (3) Sugar's Description says "It's probably the same as Calico"
 * and Sahara's says "very similar to Desert ghost, and expected to be
 * the same genetically" — both are HEDGED claims ("probably"/"expected
 * to be", not "proven"/"genetically identical to"), so — unlike the
 * Trick=Hurricane and Saar=Chocolate collapses, which used unambiguous
 * identity language — both Sugar and Sahara were kept as their own
 * separate loci, NOT merged into Calico/Desert Ghost. This refines the
 * collapse-vs-separate test introduced in batch 11 and reinforced in
 * batch 16: the site must use strong, unhedged "identical"/"proven"
 * language to trigger a collapse; "probably"/"expected to be"/"likely
 * similar to" (Acid's own wording re: Confusion/Static, batch 14) all
 * fall short of that bar and keep their own locus. (4) Rainbow is
 * described as "a type of albino" but has its OWN distinct genetic test
 * (named "Rainbow", different from the existing Albino/Candy test) —
 * modeled as its own NON-complementary standalone locus, same treatment
 * as Lavender Albino/Red Axanthic vs. their base genes, NOT folded into
 * the `albCdy` multi-allelic locus. */

/* BATCH 18 (2026-08-29, continued "truly scope all genes" implementation):
 * coded the final 8 gap-list names: Red Gene, Redhead, Striker, Taronja,
 * Mckenzie, Sentinel, Speckled, Stranger — plus resolved 3 long-standing
 * loose ends: Paint (confirmed real Recessive locus despite a "Designer
 * Morph" mistag), Nanny (confirmed real Incomplete Dominant locus despite
 * a "Designer Morph" mistag, same quirk as Gobi/Creme), and Puma (confirmed
 * NOT a standalone locus — its own Description literally says "produced by
 * combining Spark and Yellow belly" — added as a new `BALL_PYTHON_COMBO_ALIASES`
 * entry instead). All 10 real loci coded, ZERO exclusions. 7 Incomplete
 * Dominant/Dominant-with-Super-name (`rgn`/`rhd`/`stk`/`tar`/`mck`/`stg`/`nny`),
 * 3 Recessive (`snt`/`spd`/`pnt`). Notable quirks: (1) Striker's own
 * Description explicitly states "The super resembles Zebra but is
 * genetically distinct" — a THIRD independent site confirmation (after
 * Vanta and Zebra's own mutual cross-references, batch 17) that visually
 * "zebra-like" reduced-pattern morphs are being treated as genuinely
 * distinct loci by the source site, not a single gene. (2) Mckenzie's own
 * Description explicitly states "the super is very different from a Super
 * Fire" despite otherwise describing "a typical Fire headstamp" — kept
 * separate from Fire (`fi`). (3) Sentinel and Speckled have WORD-FOR-WORD
 * identical Descriptions to each other (different breeders/years — Ben
 * Siegel 2010 vs. Mark Haas 2007), and BOTH say "suspected to be the same
 * or allelic with Paint" (Paint's own Description shares the same opening
 * sentence too) — all THREE are hedged claims ("suspected", not "proven"/
 * "identical"), so per the refined batch-17 precedent, Sentinel/Speckled/
 * Paint are modeled as 3 fully separate Recessive loci, not merged. (4)
 * This closes out the entire ~30-gene "truly scope all genes" gap list
 * first reported at the start of this project (batches 13-18, 2026-08-29)
 * — every confirmed gap-list name has now been individually researched
 * and either coded as its own locus or resolved as a synonym/combo/
 * excluded-as-undocumented. */

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
// Leucistic instead of stacking the individual names. Doubling a SINGLE
// locus (e.g. Moj/Moj) keeps its own specific "Super X" name (confirmed
// 2026-08-29: Super Lesser/Super Mojave/Super Butter are each individually
// tagged "Leuzist. Blue Eye" on worldofballpythons.com) with a
// "(Blue-Eyed Leucistic)" note appended, rather than being flattened to
// the plain shared name the way two DIFFERENT loci combined are.
// =========================================================

const BEL_COMPLEX_MEMBERS = [
  { locus: 'les', symbol: 'Les', name: 'Lesser' },
  { locus: 'moj', symbol: 'Moj', name: 'Mojave' },
  { locus: 'but', symbol: 'But', name: 'Butter' },
  { locus: 'pha', symbol: 'Pha', name: 'Phantom' },
  // Daddy (added 2026-08-28): confirmed via TWO explicit WOBP statements
  // (Het Daddy's own page: "is part of the blue eyed leucistic complex";
  // Mojave Daddy's page: "two morphs from the Blue eyed Leucy complex") —
  // stronger confirmation than the "Leuzist. Blue Eye" tag test used for
  // the other 4. Displayed het name is "Het Daddy" (matches WOBP's own
  // convention, unlike the other members which use plain trait names).
  { locus: 'dad', symbol: 'Dad', name: 'Het Daddy' },
];

function belComplexName(genotype) {
  let totalCopies = 0;
  let singleName = null;
  let distinctLoci = 0;
  for (const { locus, symbol, name } of BEL_COMPLEX_MEMBERS) {
    const notation = genotype[locus];
    if (!notation) continue;
    const copies = notation.split('/').filter((allele) => allele === symbol).length;
    if (copies > 0) {
      totalCopies += copies;
      singleName = name;
      distinctLoci += 1;
    }
  }
  if (totalCopies >= 2 && distinctLoci === 1) return `Super ${singleName} (Blue-Eyed Leucistic)`;
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
  { locus: 'ob', het: 'Ob/ob', homo: 'Ob/Ob', hetName: 'Orange Belly', homoName: 'Super Orange Belly' },
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
  { locus: 'huf', het: 'Huf/huf', homo: 'Huf/Huf', hetName: 'Huffman', homoName: 'Super Huffman' },
  { locus: 'cyp', het: 'Cyp/cyp', homo: 'Cyp/Cyp', hetName: 'Cypress', homoName: 'Super Cypress' },
  { locus: 'gra', het: 'Gra/gra', homo: 'Gra/Gra', hetName: 'Granite', homoName: 'Super Granite' },
  { locus: 'jav', het: 'Jav/jav', homo: 'Jav/Jav', hetName: 'Java', homoName: 'Super Java' },
  { locus: 'bld', het: 'Bld/bld', homo: 'Bld/Bld', hetName: 'Blade', homoName: 'Super Blade' },
  { locus: 'cal', het: 'Cal/cal', homo: 'Cal/Cal', hetName: 'Calico', homoName: 'Super Calico' },
  { locus: 'dst', het: 'Dst/dst', homo: 'Dst/Dst', hetName: 'Desert', homoName: 'Super Desert' },
  { locus: 'dsc', het: 'Dsc/dsc', homo: 'Dsc/Dsc', hetName: 'Disco', homoName: 'Super Disco' },
  { locus: 'bh', het: 'Bh/bh', homo: 'Bh/Bh', hetName: 'Black Head', homoName: 'Super Black Head' },
  { locus: 'spk', het: 'Spk/spk', homo: 'Spk/Spk', hetName: 'Spark', homoName: 'Super Spark' },
  { locus: 'jag', het: 'Jag/jag', homo: 'Jag/Jag', hetName: 'Jaguar', homoName: 'Super Jaguar' },
  { locus: 'krg', het: 'Krg/krg', homo: 'Krg/Krg', hetName: 'Krg', homoName: 'Super Krg' },
  { locus: 'ahi', het: 'Ahi/ahi', homo: 'Ahi/Ahi', hetName: 'Ahi', homoName: 'Super Ahi' },
  { locus: 'dot', het: 'Dot/dot', homo: 'Dot/Dot', hetName: 'Dot', homoName: 'Super Dot' },
  { locus: 'web', het: 'Web/web', homo: 'Web/Web', hetName: 'Web', homoName: 'Super Web' },
  { locus: 'acd', het: 'Acd/acd', homo: 'Acd/Acd', hetName: 'Acid', homoName: 'Super Acid' },
  { locus: 'bng', het: 'Bng/bng', homo: 'Bng/Bng', hetName: 'Bang', homoName: 'Super Bang' },
  { locus: 'caf', het: 'Caf/caf', homo: 'Caf/Caf', hetName: 'Cafe', homoName: 'Super Cafe' },
  { locus: 'gob', het: 'Gob/gob', homo: 'Gob/Gob', hetName: 'Gobi', homoName: 'Super Gobi' },
  { locus: 'grm', het: 'Grm/grm', homo: 'Grm/Grm', hetName: 'Grim', homoName: 'Super Grim' },
  { locus: 'jed', het: 'Jed/jed', homo: 'Jed/Jed', hetName: 'Jedi', homoName: 'Super Jedi' },
  { locus: 'nov', het: 'Nov/nov', homo: 'Nov/Nov', hetName: 'Nova', homoName: 'Super Nova' },
  { locus: 'bad', het: 'Bad/bad', homo: 'Bad/Bad', hetName: 'Black Adder', homoName: 'Super Black Adder' },
  { locus: 'bgo', het: 'Bgo/bgo', homo: 'Bgo/Bgo', hetName: 'Bingo', homoName: 'Super Bingo' },
  { locus: 'blz', het: 'Blz/blz', homo: 'Blz/Blz', hetName: 'Blaze', homoName: 'Super Blaze' },
  { locus: 'blt', het: 'Blt/blt', homo: 'Blt/Blt', hetName: 'Blitz', homoName: 'Super Blitz' },
  { locus: 'crm', het: 'Crm/crm', homo: 'Crm/Crm', hetName: 'Creme', homoName: 'Super Creme' },
  { locus: 'gnx', het: 'Gnx/gnx', homo: 'Gnx/Gnx', hetName: 'Genex', homoName: 'Super Genex' },
  { locus: 'nya', het: 'Nya/nya', homo: 'Nya/Nya', hetName: 'Nyala', homoName: 'Super Nyala' },
  { locus: 'orb', het: 'Orb/orb', homo: 'Orb/Orb', hetName: 'Orbit', homoName: 'Super Orbit' },
  { locus: 'pxl', het: 'Pxl/pxl', homo: 'Pxl/Pxl', hetName: 'Pixel', homoName: 'Super Pixel' },
  { locus: 'qke', het: 'Qke/qke', homo: 'Qke/Qke', hetName: 'Quake', homoName: 'Super Quake' },
  { locus: 'sat', het: 'Sat/sat', homo: 'Sat/Sat', hetName: 'Satin', homoName: 'Super Satin' },
  { locus: 'hur', het: 'Hur/hur', homo: 'Hur/Hur', hetName: 'Hurricane', homoName: 'Super Hurricane' },
  { locus: 'cpr', het: 'Cpr/cpr', homo: 'Cpr/Cpr', hetName: 'Copper', homoName: 'Super Copper' },
  { locus: 'fsn', het: 'Fsn/fsn', homo: 'Fsn/Fsn', hetName: 'Fusion', homoName: 'Super Fusion' },
  { locus: 'ksm', het: 'Ksm/ksm', homo: 'Ksm/Ksm', hetName: 'Kosmos', homoName: 'Super Kosmos' },
  { locus: 'rpr', het: 'Rpr/rpr', homo: 'Rpr/Rpr', hetName: 'Reaper', homoName: 'Super Reaper' },
  { locus: 'stc', het: 'Stc/stc', homo: 'Stc/Stc', hetName: 'Static', homoName: 'Super Static' },
  { locus: 'trj', het: 'Trj/trj', homo: 'Trj/Trj', hetName: 'Trojan', homoName: 'Super Trojan' },
  { locus: 'wke', het: 'Wke/wke', homo: 'Wke/Wke', hetName: 'Wookie', homoName: 'Super Wookie' },
  { locus: 'zwd', het: 'Zwd/zwd', homo: 'Zwd/Zwd', hetName: 'Zuwadi', homoName: 'Super Zuwadi' },
  { locus: 'mar', het: 'Mar/mar', homo: 'Mar/Mar', hetName: 'Mario', homoName: 'Super Mario' },
  { locus: 'pch', het: 'Pch/pch', homo: 'Pch/Pch', hetName: 'Peach', homoName: 'Super Peach' },
  { locus: 'rvn', het: 'Rvn/rvn', homo: 'Rvn/Rvn', hetName: 'Raven', homoName: 'Super Raven' },
  { locus: 'sgr', het: 'Sgr/sgr', homo: 'Sgr/Sgr', hetName: 'Sugar', homoName: 'Super Sugar' },
  { locus: 'vdo', het: 'Vdo/vdo', homo: 'Vdo/Vdo', hetName: 'Vudoo', homoName: 'Super Vudoo' },
  { locus: 'mos', het: 'Mos/mos', homo: 'Mos/Mos', hetName: 'Mosaic', homoName: 'Super Mosaic' },
  { locus: 'rgn', het: 'Rgn/rgn', homo: 'Rgn/Rgn', hetName: 'Red Gene', homoName: 'Super Red Gene' },
  { locus: 'rhd', het: 'Rhd/rhd', homo: 'Rhd/Rhd', hetName: 'Redhead', homoName: 'Super Redhead' },
  { locus: 'stk', het: 'Stk/stk', homo: 'Stk/Stk', hetName: 'Striker', homoName: 'Super Striker' },
  { locus: 'tar', het: 'Tar/tar', homo: 'Tar/Tar', hetName: 'Taronja', homoName: 'Super Taronja' },
  { locus: 'mck', het: 'Mck/mck', homo: 'Mck/Mck', hetName: 'Mckenzie', homoName: 'Super Mckenzie' },
  { locus: 'stg', het: 'Stg/stg', homo: 'Stg/Stg', hetName: 'Stranger', homoName: 'Super Stranger' },
  { locus: 'nny', het: 'Nny/nny', homo: 'Nny/Nny', hetName: 'Nanny', homoName: 'Super Nanny' },
  { locus: 'lmb', het: 'Lmb/lmb', homo: 'Lmb/Lmb', hetName: 'Lemonback', homoName: 'Super Lemonback' },
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
  { locus: 'vnt', homo: 'vnt/vnt', name: 'Vanta' },
  { locus: 'zbr', homo: 'zbr/zbr', name: 'Zebra' },
  { locus: 'shr', homo: 'shr/shr', name: 'Sahara' },
  { locus: 'rbw', homo: 'rbw/rbw', name: 'Rainbow' },
  { locus: 'snt', homo: 'snt/snt', name: 'Sentinel' },
  { locus: 'spd', homo: 'spd/spd', name: 'Speckled' },
  { locus: 'pnt', homo: 'pnt/pnt', name: 'Paint' },
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
  vnt: { het: 'Vnt/vnt', trait: 'Vanta' },
  zbr: { het: 'Zbr/zbr', trait: 'Zebra' },
  shr: { het: 'Shr/shr', trait: 'Sahara' },
  rbw: { het: 'Rbw/rbw', trait: 'Rainbow' },
  snt: { het: 'Snt/snt', trait: 'Sentinel' },
  spd: { het: 'Spd/spd', trait: 'Speckled' },
  pnt: { het: 'Pnt/pnt', trait: 'Paint' },
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
  // "Queen Bee" = Pastel + Spider + Lesser — confirmed via "Spotnose Queen
  // Bee"'s own subtitle "(Pastel Spotnose Spider Lesser)" (subtracting
  // Spotnose gives the base combo). WOBP's own Queen Bee page has no
  // subtitle/Description, but this derivative-page confirmation is the
  // same established pattern as Krg Pepper Back confirming Stinger Bee.
  // Positioned after Bumblebee (a strict subset: Pastel+Spider) so it can
  // subsume it via the remove list.
  { requires: { pas: ['Pas/pas'], sp: ['Sp/sp', 'Sp/Sp'], les: ['Les/les'] }, remove: ['Pastel', 'Spider', 'Bumblebee', 'Lesser'], alias: 'Queen Bee' },
  // "Pastave" CORRECTED 2026-08-28: WOBP's own page confirms subtitle
  // "(Mojave Pastel)" — this is Mojave + Pastel, NOT Pastel + Puzzle as
  // previously (incorrectly) modeled. Also confirmed Pastel + Puzzle has
  // its own separate, plain-named "Pastel Puzzle" WOBP page (no branded
  // alias) — default stacking already produces that name correctly once
  // this rule no longer intercepts it. No "(Blue-Eyed Leucistic)" suffix
  // here (unlike Crystal/Mystic Potion) — WOBP's Pastave page has no such
  // tag despite Mojave being a BEL-complex member.
  { requires: { moj: ['Moj/moj', 'Moj/Moj'], pas: ['Pas/pas', 'Pas/Pas'] }, remove: ['Mojave', 'Super Mojave (Blue-Eyed Leucistic)', 'Pastel', 'Super Pastel'], alias: 'Pastave' },
  { requires: { spe: ['Spe/spe'], yb: ['Yb/yb'] }, remove: ['Specter', 'Yellow Belly'], alias: 'Super Stripe' },
  { requires: { grv: ['Grv/grv'], yb: ['Yb/yb'] }, remove: ['Gravel', 'Yellow Belly'], alias: 'Highway' },
  { requires: { rus: ['Rus/rus'], spc: ['Spc/spc'] }, remove: ['Russo', 'Special'], alias: 'The Diamond' },
  { requires: { moj: ['Moj/moj', 'Moj/Moj'], spc: ['Spc/spc', 'Spc/Spc'] }, remove: ['Mojave', 'Super Mojave (Blue-Eyed Leucistic)', 'Special', 'Super Special'], alias: 'Crystal (Blue-Eyed Leucistic)' },
  { requires: { moj: ['Moj/moj', 'Moj/Moj'], mys: ['Mys/mys', 'Mys/Mys'] }, remove: ['Mojave', 'Super Mojave (Blue-Eyed Leucistic)', 'Mystic', 'Super Mystic'], alias: 'Mystic Potion (Blue-Eyed Leucistic)' },
  { requires: { rus: ['Rus/rus', 'Rus/Rus'], pha: ['Pha/pha', 'Pha/Pha'] }, remove: ['Russo', 'Super Russo', 'Phantom', 'Super Phantom (Blue-Eyed Leucistic)'], alias: 'Opal Diamond (Blue-Eyed Leucistic)' },
  { requires: { hon: ['Hon/hon', 'Hon/Hon'], rus: ['Rus/rus', 'Rus/Rus'] }, remove: ['Honey', 'Super Honey', 'Russo', 'Super Russo'], alias: 'Cassandra (Blue-Eyed Leucistic)' },
  { requires: { van: ['Van/van'], fi: ['Fi/fi'] }, remove: ['Vanilla', 'Fire'], alias: 'Vanilla Cream' },
  { requires: { pas: ['Pas/pas'], sab: ['Sab/sab'], sp: ['Sp/sp', 'Sp/Sp'] }, remove: ['Pastel', 'Sable', 'Spider'], alias: 'Chocolate Chip' },
  { requires: { asp: ['Asp/asp'], spe: ['Spe/spe'] }, remove: ['Asphalt', 'Specter'], alias: 'Parkway' },
  { requires: { hon: ['Hon/hon', 'Hon/Hon'], pha: ['Pha/pha', 'Pha/Pha'] }, remove: ['Honey', 'Super Honey', 'Phantom', 'Super Phantom (Blue-Eyed Leucistic)'], alias: 'Leche (Blue-Eyed Leucistic)' },
  { requires: { hon: ['Hon/hon', 'Hon/Hon'], moj: ['Moj/moj', 'Moj/Moj'] }, remove: ['Honey', 'Super Honey', 'Mojave', 'Super Mojave (Blue-Eyed Leucistic)'], alias: 'Mohoney (Blue-Eyed Leucistic)' },
  { requires: { cry: ['cry/cry'], cl: ['cl/cl'] }, remove: ['Cryptic', 'Clown'], alias: 'Crypton' },
  { requires: { mig: ['mig/mig'], cl: ['cl/cl'] }, remove: ['Migraine', 'Clown'], alias: 'Mixer' },
  { requires: { lor: ['Lor/lor', 'Lor/Lor'], raz: ['Raz/raz', 'Raz/Raz'] }, remove: ['Lori', 'Super Lori', 'Razor', 'Super Razor'], alias: 'Lori Razor' },
  { requires: { cho: ['Cho/cho', 'Cho/Cho'], sab: ['Sab/sab', 'Sab/Sab'] }, remove: ['Chocolate', 'Super Chocolate', 'Sable', 'Super Sable'], alias: 'Saar Sable' },
  { requires: { jol: ['Jol/jol', 'Jol/Jol'], lor: ['Lor/lor', 'Lor/Lor'] }, remove: ['Jolt', 'Super Jolt', 'Lori', 'Super Lori'], alias: 'Jolt Lori' },
  { requires: { jol: ['Jol/jol', 'Jol/Jol'], raz: ['Raz/raz', 'Raz/Raz'] }, remove: ['Jolt', 'Super Jolt', 'Razor', 'Super Razor'], alias: 'Jolt Razor' },
  { requires: { en: ['En/en', 'En/En'], jol: ['Jol/jol', 'Jol/Jol'] }, remove: ['Enchi', 'Super Enchi', 'Jolt', 'Super Jolt'], alias: 'Enchi Jolt' },
  { requires: { bon: ['Bon/bon', 'Bon/Bon'], cho: ['Cho/cho', 'Cho/Cho'] }, remove: ['Bongo', 'Super Bongo', 'Chocolate', 'Super Chocolate'], alias: 'Bongo Saar' },
  // "Huffman - Jolt"/"Huffman - Lori" (2026-08-28): Huffman (`huf`) confirmed
  // real via its own WOBP page (Base Morph, Incomplete Dominant, first
  // produced by Chris Huffman). Both combo pages 404 despite a correctly
  // loading <title> ("Huffman Jolt"/"Huffman Lori") — same site-bug pattern
  // as Jolt Lori/Jolt Razor above; composition inferred from title.
  { requires: { huf: ['Huf/huf', 'Huf/Huf'], jol: ['Jol/jol', 'Jol/Jol'] }, remove: ['Huffman', 'Super Huffman', 'Jolt', 'Super Jolt'], alias: 'Huffman Jolt' },
  { requires: { huf: ['Huf/huf', 'Huf/Huf'], lor: ['Lor/lor', 'Lor/Lor'] }, remove: ['Huffman', 'Super Huffman', 'Lori', 'Super Lori'], alias: 'Huffman Lori' },
  // BATCH 12 (2026-08-29) — more site-confirmed pairings found while paging
  // the full /en/morphs list. Each has a correctly-loading page <title> but
  // a 404 body (same site-bug pattern as several batch 10/11 entries) —
  // composition inferred from the title, consistent with the site's naming
  // convention observed everywhere else.
  { requires: { bam: ['Bam/bam', 'Bam/Bam'], rus: ['Rus/rus', 'Rus/Rus'] }, remove: ['Bamboo', 'Super Bamboo', 'Russo', 'Super Russo'], alias: 'Bamboo Russo' },
  { requires: { bon: ['Bon/bon', 'Bon/Bon'], sab: ['Sab/sab', 'Sab/Sab'] }, remove: ['Bongo', 'Super Bongo', 'Sable', 'Super Sable'], alias: 'Bongo Sable' },
  { requires: { chn: ['Chn/chn', 'Chn/Chn'], hon: ['Hon/hon', 'Hon/Hon'] }, remove: ['Chino', 'Super Chino', 'Honey', 'Super Honey'], alias: 'Chino Honey' },
  { requires: { chn: ['Chn/chn', 'Chn/Chn'], rus: ['Rus/rus', 'Rus/Rus'] }, remove: ['Chino', 'Super Chino', 'Russo', 'Super Russo'], alias: 'Chino Russo' },
  { requires: { en: ['En/en', 'En/En'], raz: ['Raz/raz', 'Raz/Raz'] }, remove: ['Enchi', 'Super Enchi', 'Razor', 'Super Razor'], alias: 'Enchi Razor' },
  { requires: { cho: ['Cho/cho', 'Cho/Cho'], sp: ['Sp/sp', 'Sp/Sp'] }, remove: ['Chocolate', 'Super Chocolate', 'Spider'], alias: 'Saar Spider' },
  { requires: { bam: ['Bam/bam', 'Bam/Bam'], chn: ['Chn/chn', 'Chn/Chn'] }, remove: ['Bamboo', 'Super Bamboo', 'Chino', 'Super Chino'], alias: 'Bamboo Chino' },
  { requires: { bam: ['Bam/bam', 'Bam/Bam'], hon: ['Hon/hon', 'Hon/Hon'] }, remove: ['Bamboo', 'Super Bamboo', 'Honey', 'Super Honey'], alias: 'Bamboo Honey' },
  { requires: { bon: ['Bon/bon', 'Bon/Bon'], sp: ['Sp/sp', 'Sp/Sp'] }, remove: ['Bongo', 'Super Bongo', 'Spider'], alias: 'Bongo Spider' },
  { requires: { but: ['But/but', 'But/But'], chn: ['Chn/chn', 'Chn/Chn'] }, remove: ['Butter', 'Chino', 'Super Chino'], alias: 'Butter Chino' },
  { requires: { but: ['But/but', 'But/But'], hon: ['Hon/hon', 'Hon/Hon'] }, remove: ['Butter', 'Honey', 'Super Honey'], alias: 'Butter Honey' },
  { requires: { chn: ['Chn/chn', 'Chn/Chn'], moj: ['Moj/moj', 'Moj/Moj'] }, remove: ['Chino', 'Super Chino', 'Mojave'], alias: 'Chino Mojave' },
  { requires: { chn: ['Chn/chn', 'Chn/Chn'], mys: ['Mys/mys', 'Mys/Mys'] }, remove: ['Chino', 'Super Chino', 'Mystic', 'Super Mystic'], alias: 'Chino Mystic' },
  { requires: { hon: ['Hon/hon', 'Hon/Hon'], mys: ['Mys/mys', 'Mys/Mys'] }, remove: ['Honey', 'Super Honey', 'Mystic', 'Super Mystic'], alias: 'Honey Mystic' },
  { requires: { mys: ['Mys/mys', 'Mys/Mys'], rus: ['Rus/rus', 'Rus/Rus'] }, remove: ['Mystic', 'Super Mystic', 'Russo', 'Super Russo'], alias: 'Mystic Russo' },
  { requires: { moj: ['Moj/moj', 'Moj/Moj'], rus: ['Rus/rus', 'Rus/Rus'] }, remove: ['Mojave', 'Russo', 'Super Russo'], alias: 'Mojave Russo' },
  // BATCH 16 (2026-08-29) — unblocked after adding Hurricane (`hur`, in
  // place of the gap list's "Trick", a confirmed pure synonym of Hurricane).
  // Same correctly-loading-title/404-body pattern as several batch 10-12
  // entries — composition inferred from the title.
  { requires: { blt: ['Blt/blt', 'Blt/Blt'], hur: ['Hur/hur', 'Hur/Hur'] }, remove: ['Blitz', 'Super Blitz', 'Hurricane', 'Super Hurricane'], alias: 'Blitz Trick' },
  // COMBO SCOPING PASS (2026-08-29) — resolving remaining flagged items
  // from BALL_PYTHON_UNVERIFIED_COMBO_CANDIDATES.md now that all
  // standalone genes from the full-scope audit are modeled.
  { requires: { cho: ['Cho/cho', 'Cho/Cho'], wke: ['Wke/wke', 'Wke/Wke'] }, remove: ['Chocolate', 'Super Chocolate', 'Wookie', 'Super Wookie'], alias: 'Saar Wookie' },
  // NOTE: "Chocolate - Wookie" (own page title "Chocolate Wookie", body
  // 404s) is a page-duplicate synonym of "Saar - Wookie" above (Chocolate
  // IS Saar, same `cho` locus) — no separate rule needed, same "Black
  // Head - Saar"/"Black Head Chocolate" duplicate pattern from batch 13.
  { requires: { bon: ['Bon/bon', 'Bon/Bon'], wke: ['Wke/wke', 'Wke/Wke'] }, remove: ['Bongo', 'Super Bongo', 'Wookie', 'Super Wookie'], alias: 'Bongo Wookie' },
  // BATCH 16 COMBO SCOPING (2026-08-29 continued) — found while searching
  // Satin/Hurricane/Copper/Fusion/Kosmos/Reaper/Static/Trojan/Wookie/
  // Zuwadi. Five more "<Gene> - Wookie" Allelic combo pages, same
  // title-loads/body-404s pattern as Saar Wookie/Bongo Wookie above —
  // composition inferred from each own title.
  { requires: { sab: ['Sab/sab', 'Sab/Sab'], wke: ['Wke/wke', 'Wke/Wke'] }, remove: ['Sable', 'Super Sable', 'Wookie', 'Super Wookie'], alias: 'Sable Wookie' },
  { requires: { sp: ['Sp/sp', 'Sp/Sp'], wke: ['Wke/wke', 'Wke/Wke'] }, remove: ['Spider', 'Wookie', 'Super Wookie'], alias: 'Spider Wookie' },
  { requires: { spn: ['Spn/spn', 'Spn/Spn'], wke: ['Wke/wke', 'Wke/Wke'] }, remove: ['Spotnose', 'Super Spotnose', 'Wookie', 'Super Wookie'], alias: 'Spotnose Wookie' },
  // NOTE: "Black Head - Wookie" NOT duplicated here — already coded as
  // part of the pre-existing Black Head family block below (bh+wke ==
  // same pair regardless of which gene's search surfaced it).
  { requires: { wom: ['Wom/wom', 'Wom/Wom'], wke: ['Wke/wke', 'Wke/Wke'] }, remove: ['Woma', 'Super Woma', 'Wookie', 'Super Wookie'], alias: 'Hidden Gene Woma Wookie' },
  // "Static Electricity": own page subtitle "(Static Pastel Yellow
  // Belly)" — Genetics: N/A but subtitle present, same codeable pattern
  // as Angel/Puma/etc. (only NO-subtitle-AND-NO-Description pages, like
  // Fader, get excluded).
  { requires: { stc: ['Stc/stc', 'Stc/Stc'], pas: ['Pas/pas', 'Pas/Pas'], yb: ['Yb/yb', 'Yb/Yb'] }, remove: ['Static', 'Super Static', 'Pastel', 'Super Pastel', 'Yellow Belly', 'Super Yellow Belly'], alias: 'Static Electricity' },
  // "Cypress" (2026-08-28): confirmed real via its own WOBP page (Base
  // Morph, Incomplete Dominant, first produced by Outback Reptiles, has
  // its own dedicated genetic test). All 3 combo pages below share the
  // title-loads/body-404 pattern used throughout this file — composition
  // inferred from title.
  { requires: { cho: ['Cho/cho', 'Cho/Cho'], cyp: ['Cyp/cyp', 'Cyp/Cyp'] }, remove: ['Chocolate', 'Super Chocolate', 'Cypress', 'Super Cypress'], alias: 'Cypress Saar' },
  { requires: { bh: ['Bh/bh', 'Bh/Bh'], cyp: ['Cyp/cyp', 'Cyp/Cyp'] }, remove: ['Black Head', 'Super Black Head', 'Cypress', 'Super Cypress'], alias: 'Black Head Cypress' },
  { requires: { cyp: ['Cyp/cyp', 'Cyp/Cyp'], wke: ['Wke/wke', 'Wke/Wke'] }, remove: ['Cypress', 'Super Cypress', 'Wookie', 'Super Wookie'], alias: 'Cypress Wookie' },
  // NOTE: "Darkling Fusion Mojave" checked and skipped — has NO
  // subtitle/composition text and NO Description on its own page
  // (Genetics: N/A), same "undocumented" exclusion pattern as "Fader".
  // Re-checked 2026-08-28: "Darkling" IS a real gene (confirmed via
  // MorphMarket's own dedicated "The Darkling" page: Incomplete Dominant,
  // First Produced By Hognose UK/Barry Summerhayes, 2014) — but that does
  // NOT resolve this specific combo's composition. WOBP's own "Darklings
  // Mojave Pinstripe" page (a candidate corroborating source) is ALSO
  // undocumented (Designer Morph, Genetics: N/A, no subtitle/Description)
  // despite a claim otherwise, and MorphMarket's Darkling page has no
  // structured "Fusion" combo entry at all — still excluded, unconfirmed.
  // NOTE: "Hayabusa" = alt-name/nickname for Super Hurricane (own
  // subtitle "(Super Hurricane)"), NOT a real 2-gene combo — same
  // "rival nickname" pattern as Super Grim's "grimreaper".
  // NOTE: "Cinnamon Flame" = alt-name/nickname for Copper (own subtitle
  // "(Copper Body)"), NOT a real Cinnamon+Copper combo — same "rival
  // nickname" pattern as Hayabusa/grimreaper.
  // Satin, Kosmos, Reaper, Trojan, and Zuwadi searched and found clean —
  // no bespoke/branded combo names beyond plain concatenations and the
  // already-known Grim Reaper/Soul Reaper entries.
  // "Disco Vanilla": confirmed Allelic combo, own Complex "Disco Vanilla",
  // Incomplete dominant, Description: "This is a striking combo from the
  // Black eyed leucistic complex." NOTE: "Black Eyed Leucistic" is a
  // DIFFERENT named complex from this engine's existing "Blue-Eyed
  // Leucistic" (BEL, les/moj/but/pha) — batch 8 confirmed no standalone
  // "Black Eyed Leucistic" gene exists on the source site under any name,
  // and this combo's own Complex field is literally "Disco Vanilla" (not
  // "Black Eyed Leucistic"), so it is modeled as its own distinct named
  // combo, NOT folded into `belComplexName()`/`BEL_COMPLEX_MEMBERS`.
  { requires: { dsc: ['Dsc/dsc', 'Dsc/Dsc'], van: ['Van/van', 'Van/Van'] }, remove: ['Disco', 'Super Disco', 'Vanilla', 'Super Vanilla'], alias: 'Disco Vanilla (Black-Eyed Leucistic)' },
  // "Angel": confirmed real via its own page subtitle "(Butter Calico
  // Super Pastel Pinstripe)" — a 4-gene Designer Morph combo (Genetics:
  // N/A, like many designer combos, but composition is explicitly given
  // in the subtitle, same as several other Designer-Morph-tagged combos
  // treated as codeable in prior batches, e.g. Puma). Note "Super Pastel"
  // in the name means Pastel must be homozygous specifically (not het).
  { requires: { but: ['But/but'], cal: ['Cal/cal', 'Cal/Cal'], pas: ['Pas/Pas'], pin: ['Pin/pin', 'Pin/Pin'] }, remove: ['Butter', 'Calico', 'Super Calico', 'Super Pastel', 'Pinstripe', 'Super Pinstripe'], alias: 'Angel' },
  // "Albino Tiger": confirmed via own page subtitle "(Albino Desert Enchi)".
  { requires: { albCdy: ['Alb/Alb'], dst: ['Dst/dst', 'Dst/Dst'], en: ['En/en', 'En/En'] }, remove: ['Albino', 'Desert', 'Super Desert', 'Enchi', 'Super Enchi'], alias: 'Albino Tiger' },
  // "Angel Dust": confirmed via own page subtitle "(Desert Lesser Pinstripe
  // Yellow Belly)". Lesser (`les`) is a BEL-complex member but appears
  // alone here (no other BEL members present), so it resolves to plain
  // "Lesser" via belComplexName(), not a BEL-collapsed name.
  { requires: { dst: ['Dst/dst', 'Dst/Dst'], les: ['Les/les'], pin: ['Pin/pin', 'Pin/Pin'], yb: ['Yb/yb', 'Yb/Yb'] }, remove: ['Desert', 'Super Desert', 'Lesser', 'Pinstripe', 'Super Pinstripe', 'Yellow Belly', 'Super Yellow Belly'], alias: 'Angel Dust' },
  // Black Head (`bh`) has an unusually large family of confirmed "Allelic
  // combo"-tagged pairings with other already-modeled genes — all
  // individually confirmed via the correctly-loading-title/404-body
  // pattern (Black Head Spider's page fully loaded and confirmed the
  // plain-concatenation naming convention these all follow). "Black Head
  // - Saar" is a separate page from "Black Head - Chocolate" but both
  // just refer to the same bh+cho pairing (Saar is a confirmed pure
  // synonym for Chocolate, same locus) — only one alias needed. "Black
  // Head - Cypress" now resolved (2026-08-28), see "Black Head Cypress"
  // alias near the Wookie combo cluster above.
  { requires: { bh: ['Bh/bh', 'Bh/Bh'], cho: ['Cho/cho', 'Cho/Cho'] }, remove: ['Black Head', 'Super Black Head', 'Chocolate', 'Super Chocolate'], alias: 'Black Head Chocolate' },
  { requires: { bh: ['Bh/bh', 'Bh/Bh'], bon: ['Bon/bon', 'Bon/Bon'] }, remove: ['Black Head', 'Super Black Head', 'Bongo', 'Super Bongo'], alias: 'Black Head Bongo' },
  { requires: { bh: ['Bh/bh', 'Bh/Bh'], sab: ['Sab/sab', 'Sab/Sab'] }, remove: ['Black Head', 'Super Black Head', 'Sable', 'Super Sable'], alias: 'Black Head Sable' },
  { requires: { bh: ['Bh/bh', 'Bh/Bh'], sp: ['Sp/sp', 'Sp/Sp'] }, remove: ['Black Head', 'Super Black Head', 'Spider'], alias: 'Black Head Spider' },
  { requires: { bh: ['Bh/bh', 'Bh/Bh'], wke: ['Wke/wke', 'Wke/Wke'] }, remove: ['Black Head', 'Super Black Head', 'Wookie', 'Super Wookie'], alias: 'Black Head Wookie' },
  { requires: { bh: ['Bh/bh', 'Bh/Bh'], spn: ['Spn/spn', 'Spn/Spn'] }, remove: ['Black Head', 'Super Black Head', 'Spotnose', 'Super Spotnose'], alias: 'Black Head Spotnose' },
  { requires: { bh: ['Bh/bh', 'Bh/Bh'], cha: ['Cha/cha'] }, remove: ['Black Head', 'Super Black Head', 'Champagne'], alias: 'Black Head Champagne' },
  { requires: { bh: ['Bh/bh', 'Bh/Bh'], wom: ['Wom/wom', 'Wom/Wom'] }, remove: ['Black Head', 'Super Black Head', 'Woma', 'Super Woma'], alias: 'Black Head Hidden Gene Woma' },
  // "Pewter" = Cinnamon (`cinBp` = 'Cin/n') + Pastel. WOBP's own page has
  // NO subtitle/Description (Genetics: N/A), so this is NOT confirmed via
  // the usual site-only method - confirmed instead via external
  // cross-reference (MorphMarket structured combo data + Graziani
  // Reptiles' own breeder history + Ralph Davis Reptiles + Northwest
  // Reptiles, all independently agreeing on Cinnamon + Pastel, NOT Black
  // Pastel + Pastel - that distinct combination is separately named
  // "Black Pewter" and was NOT added here/not modeled). Same one-time
  // external-source exception precedent as the Adder/Black Adder
  // resolution. Approved by the user 2026-08-28. Positioned BEFORE "50
  // Shades Of Grey" so that combo (a strict superset adding `bh`) can
  // subsume it via its own remove list.
  { requires: { cinBp: ['Cin/n'], pas: ['Pas/pas', 'Pas/Pas'] }, remove: ['Cinnamon', 'Pastel', 'Super Pastel'], alias: 'Pewter' },
  // "Black Pewter" = Black Pastel (`cinBp` = 'Bp/n') + Pastel — the
  // distinct combo Pewter's own external sources named separately. Same
  // external-cross-reference confirmation as Pewter (WOBP's page also has
  // NO subtitle/Description). Approved by the user 2026-08-28.
  { requires: { cinBp: ['Bp/n'], pas: ['Pas/pas', 'Pas/Pas'] }, remove: ['Black Pastel', 'Pastel', 'Super Pastel'], alias: 'Black Pewter' },
  // "50 Shades Of Grey": own page lists TWO alt-name compositions -
  // "(Pewter Black Head, Black Head Cinnamon Pastel)" - now that Pewter
  // (Cinnamon + Pastel) is modeled above, this confirms the two names are
  // equivalent. Modeled as Black Head + Cinnamon (`cinBp` = 'Cin/n') +
  // Pastel; 'Pewter' is in the remove list since that rule independently
  // matches the same cinBp+pas genotype and would otherwise stack.
  { requires: { bh: ['Bh/bh', 'Bh/Bh'], cinBp: ['Cin/n'], pas: ['Pas/pas', 'Pas/Pas'] }, remove: ['Black Head', 'Super Black Head', 'Cinnamon', 'Pastel', 'Super Pastel', 'Pewter'], alias: '50 Shades Of Grey' },
  // "Stinger Bee": branded 2004 Sweball combo. Own page has no Description/
  // subtitle, but "Krg Pepper Back"'s subtitle explicitly equates
  // "Kalabash Reduction Gene Enchi Spider" with "Kalabash Reduction
  // Stinger Bee" — i.e. confirms Enchi + Spider = Stinger Bee.
  { requires: { en: ['En/en', 'En/En'], sp: ['Sp/sp', 'Sp/Sp'] }, remove: ['Enchi', 'Super Enchi', 'Spider'], alias: 'Stinger Bee' },
  // "Krg Pepper Back": own page subtitle "(Kalabash Reduction Gene Enchi
  // Spider, Kalabash Reduction Stinger Bee)" = Krg + Enchi + Spider (same
  // as Krg + Stinger Bee). Remove list covers both the raw trait names and
  // the "Stinger Bee" alias in case that rule already fired first.
  { requires: { krg: ['Krg/krg', 'Krg/Krg'], en: ['En/en', 'En/En'], sp: ['Sp/sp', 'Sp/Sp'] }, remove: ['Krg', 'Super Krg', 'Enchi', 'Super Enchi', 'Spider', 'Stinger Bee'], alias: 'Krg Pepper Back' },
  { requires: { spk: ['Spk/spk'], yb: ['Yb/yb'] }, remove: ['Spark', 'Yellow Belly'], alias: 'Puma' },
  // BATCH 14 COMBO SCOPING (2026-08-29 continued) — found while searching
  // the newly-modeled batch-14 genes (Ahi/Dot/Web/Acid/Bang/Cafe/Gobi/
  // Grim/Jedi/Nova) for combo pairings.
  // "Dota": own page subtitle "(Het Red Axanthic Mojave Vanilla)" — note
  // `rax` het is an invisible carrier (goes to the `carriers` list, never
  // `traits`), so no 'Red Axanthic' removal is needed here.
  { requires: { rax: ['Rax/rax'], moj: ['Moj/moj'], van: ['Van/van'] }, remove: ['Mojave', 'Vanilla'], alias: 'Dota' },
  // "Firefly Web": own page subtitle "(Fire Pastel Web)".
  { requires: { fi: ['Fi/fi'], pas: ['Pas/pas'], web: ['Web/web'] }, remove: ['Fire', 'Pastel', 'Web'], alias: 'Firefly Web' },
  // "Spotted Web": own page subtitle "(Spider Spotnose)" — despite the
  // name, this combo does NOT involve the `web` locus at all.
  { requires: { sp: ['Sp/sp', 'Sp/Sp'], spn: ['Spn/spn', 'Spn/Spn'] }, remove: ['Spider', 'Spotnose', 'Super Spotnose'], alias: 'Spotted Web' },
  // "Black Acid": own page subtitle "(Acid Black Pastel)" — Black Pastel
  // is the `cinBp` locus's 'Bp/n' allele (see the Cinnamon/Black Pastel
  // multi-allelic locus above), not a separate gene.
  { requires: { acd: ['Acd/acd'], cinBp: ['Bp/n'] }, remove: ['Acid', 'Black Pastel'], alias: 'Black Acid' },
  // "Barista": own page subtitle "(Cafe Mojave)", full Description confirms.
  { requires: { caf: ['Caf/caf'], moj: ['Moj/moj'] }, remove: ['Cafe', 'Mojave'], alias: 'Barista' },
  // "Decaf": own page subtitle "(Cafe Pastel)", full Description confirms.
  { requires: { caf: ['Caf/caf'], pas: ['Pas/pas'] }, remove: ['Cafe', 'Pastel'], alias: 'Decaf' },
  // NOTE: "Grim Reaper" checked and NOT added — it's just a rival nickname
  // for Super Grim (same breeder "Tropical Hut", matches Super Grim's own
  // site alt-name "grimreaper"), not a real Grim+Reaper 2-gene combo.
  // "Soul Reaper" (2026-08-28): own subtitle "(Granite Hidden Gene Woma
  // Lesser Nova Pastel)", Designer Morph/Genetics N/A but subtitle present
  // (codeable, same pattern as Static Electricity/Lithium Blaze). "Granite"
  // now confirmed + modeled as standalone locus `gra`. Only het-level
  // required for each gene, matching the site's own subtitle exactly (same
  // convention as Lithium Blaze below).
  { requires: { gra: ['Gra/gra'], wom: ['Wom/wom'], les: ['Les/les'], nov: ['Nov/nov'], pas: ['Pas/pas'] }, remove: ['Granite', 'Woma', 'Lesser', 'Nova', 'Pastel'], alias: 'Soul Reaper' },
  // "Lemon Drop" (2026-08-28): own WOBP subtitle says "(Acid Lemon
  // Pastel)", but "Lemon" is NOT a real standalone gene — independently
  // confirmed via MorphMarket's own Pastel Morphpedia page, which lists
  // "Lemon Pastel" only as a Proven Line/breeder-line name of Pastel
  // (first produced by NERD, 2000), not a separate locus. MorphMarket's
  // own Acid Morphpedia page independently lists "Lemon Drop — 2 Trait
  // Combination — Pastel Acid" (only 2 genes) — WOBP's extra "Lemon"
  // token is a naming quirk, same class as "Ball" in Crimson Spice.
  { requires: { acd: ['Acd/acd', 'Acd/Acd'], pas: ['Pas/pas', 'Pas/Pas'] }, remove: ['Acid', 'Super Acid', 'Pastel', 'Super Pastel'], alias: 'Lemon Drop' },
  // "Lemon Blast" (2026-08-28): own WOBP page has NO subtitle/Description
  // (Genetics: N/A) — undocumented, same exclusion pattern as Fader.
  // Independently cross-referenced via MorphMarket's own Pastel Morphpedia
  // page (same source/method already used for Pewter/Black Pewter/Queen
  // Bee), which lists "Lemon Blast — 2 Trait Combination — Pastel
  // Pinstripe" with no "Lemon" gene involved.
  { requires: { pas: ['Pas/pas', 'Pas/Pas'], pin: ['Pin/pin', 'Pin/Pin'] }, remove: ['Pastel', 'Super Pastel', 'Pinstripe', 'Super Pinstripe'], alias: 'Lemon Blast' },
  // NOTE: "Silver Web" and "Trick Nova" checked and skipped — each has NO
  // subtitle/composition text and NO Description on its own page
  // (Genetics: N/A), same "undocumented, can't confirm composition"
  // exclusion pattern as "Fader".
  // BATCH 15 COMBO SCOPING (2026-08-29) — searched Adder/Bingo/Blaze/
  // Blitz/Creme/Genex/Nyala/Orbit/Pixel/Quake.
  // "Lithium Blaze": own page subtitle "(Butter Cinnamon Fire Pastel)" —
  // despite the name, does NOT involve the `blz` locus at all.
  { requires: { but: ['But/but'], cinBp: ['Cin/n'], fi: ['Fi/fi'], pas: ['Pas/pas'] }, remove: ['Butter', 'Cinnamon', 'Fire', 'Pastel'], alias: 'Lithium Blaze' },
  // NOTE: "The Ablaze" (own subtitle "(Hidden Gene Woma Granite Fader
  // Yellow Belly Fire Pastel)") NOT added — "Granite" is now confirmed +
  // modeled (`gra`, see Soul Reaper above), but still blocked on "Fader"
  // (unmodeled, Genetics: N/A with no Description — the established
  // Fader exclusion pattern); see BALL_PYTHON_UNVERIFIED_COMBO_CANDIDATES.md.
  // CORRECTION (batch-15 combo scoping, same pass): "Blitz - Trick" and
  // "Blitz - Hurricane" (both site-tagged "Allelic combo") were initially
  // flagged here as blocked, but are ALREADY covered by the existing
  // "Blitz Trick" alias above (batch 16 standalone-gene-scoping pass) —
  // "Trick" is a confirmed pure synonym of Hurricane (`hur`), and that
  // rule already matches Blitz (`blt`) + Hurricane (`hur`) in any
  // het/homo combination. No new rule needed; nothing left blocked here.
  // NOTE: "Blitz Special" and "Moê Ball" checked and skipped — each has NO
  // subtitle/composition text and NO Description on its own page
  // (Genetics: N/A), same "undocumented" exclusion pattern as "Fader".
  // BATCH 17 COMBO SCOPING (2026-08-29) — searched Mario/Peach/Raven/
  // Sugar/Vanta/Vudoo/Zebra/Mosaic/Sahara/Rainbow.
  // "Peach Diamond": own page subtitle "(Super Russo Taronja)" — despite
  // the name, does NOT involve Peach at all.
  { requires: { rus: ['Rus/Rus'], tar: ['Tar/tar', 'Tar/Tar'] }, remove: ['Russo', 'Super Russo', 'Taronja', 'Super Taronja'], alias: 'Peach Diamond' },
  // "Ravenclaw": own page subtitle "(Leopard Woma)" — despite being
  // surfaced by a Raven search, does NOT involve Raven at all. "Butter
  // Ravenclaw" (own subtitle "(Butter Leopard Woma)") needs NO separate
  // rule — default trait stacking with Butter already produces the
  // equivalent combined output once Ravenclaw itself is coded.
  { requires: { leo: ['leo/leo'], wom: ['Wom/wom', 'Wom/Wom'] }, remove: ['Leopard', 'Woma', 'Super Woma'], alias: 'Ravenclaw' },
  // NOTE: "Hydra Woma" checked and skipped — own subtitle is just
  // "(Raven)", a single-gene nickname (likely for Raven itself), not a
  // real Raven+Woma 2-gene combo. "Spider Raven" checked and skipped —
  // plain Spider+Raven concatenation, not a portmanteau.
  // "Brown Sugar": own page subtitle "(Fire Sugar Super Pastel)".
  { requires: { fi: ['Fi/fi'], sgr: ['Sgr/sgr'], pas: ['Pas/Pas'] }, remove: ['Fire', 'Sugar', 'Super Pastel'], alias: 'Brown Sugar' },
  // "Bubi Ball": own page subtitle "(Butter Sugar Woma)".
  { requires: { but: ['But/but'], sgr: ['Sgr/sgr'], wom: ['Wom/wom', 'Wom/Wom'] }, remove: ['Butter', 'Sugar', 'Woma', 'Super Woma'], alias: 'Bubi Ball' },
  // NOTE: "Atomic Sugar" and "Black Sugar" checked and skipped — each has
  // NO subtitle/composition text and NO Description (Genetics: N/A), same
  // "undocumented" exclusion pattern as "Fader". "Atomic Fire Sugar"
  // checked and skipped — own subtitle is just "(Eclipse)", a single-name
  // nickname, not a decomposable 2-gene combo. "Calico - Nerd Line"
  // checked and skipped — just a breeder-line nickname for plain Calico,
  // not a real combo (its own detail page 404s, title has no other gene
  // names). Remaining Sugar search results are all plain multi-gene-name
  // concatenation noise (e.g. "Champagne Cinnamon Pastel Sugar"), not
  // individually checked per established convention.
  // "Killer Zebra": own page subtitle "(Super Zebra Pastel)".
  { requires: { zbr: ['zbr/zbr'], pas: ['Pas/pas', 'Pas/Pas'] }, remove: ['Zebra', 'Pastel', 'Super Pastel'], alias: 'Killer Zebra' },
  // NOTE: "Zebra Bee" (Zebra+Spider) and "Zebra Pastel" (Zebra+Pastel)
  // checked and skipped — plain concatenations, not portmanteaus. "Super
  // Sahara" checked and skipped — mistagged "Designer Morph" page with NO
  // subtitle/composition and NO Description (Genetics: N/A); Sahara is
  // Recessive in this engine (homo-only), so a "Super" form doesn't apply
  // anyway. Mario, Vanta, Vudoo, Mosaic, Rainbow — zero combos found,
  // only Super/Base rows and plain-concatenation Designer Morph noise.
  // BATCH 18 COMBO SCOPING (2026-08-29) — searched Red Gene/Redhead/
  // Striker/Taronja/Mckenzie/Sentinel/Speckled/Stranger/Nanny/Paint.
  // This is the FINAL batch of the combo-scoping pass.
  // "Red Spot": own page subtitle "(Redhead Spotnose)".
  { requires: { rhd: ['Rhd/rhd'], spn: ['Spn/spn'] }, remove: ['Redhead', 'Spotnose'], alias: 'Red Spot' },
  // "Red Widow": own page subtitle "(Redhead Spider)".
  { requires: { rhd: ['Rhd/rhd'], sp: ['Sp/sp', 'Sp/Sp'] }, remove: ['Redhead', 'Spider'], alias: 'Red Widow' },
  // "Red Bee": own page subtitle "(Redhead Pastel Spider, Redhead Bumble
  // Bee)" — two equivalent alt-name compositions for the same combo.
  // Positioned AFTER Red Widow (and the earlier Bumblebee rule) so it can
  // subsume both simpler aliases when all three genes are present
  // together (Redhead+Pastel+Spider independently satisfies Bumblebee's
  // and Red Widow's own `requires`, so without this cleanup all three
  // aliases would stack).
  { requires: { rhd: ['Rhd/rhd'], pas: ['Pas/pas'], sp: ['Sp/sp', 'Sp/Sp'] }, remove: ['Redhead', 'Pastel', 'Spider', 'Bumblebee', 'Red Widow'], alias: 'Red Bee' },
  // "Ob Redhead" (2026-08-28): own subtitle "(Orange Belly Redhead)".
  // "Orange Belly" confirmed real via WOBP's own dedicated Base Morph
  // page (Incomplete Dominant, Complex: "Orange Belly" — its own complex,
  // not "Yellow Belly complex"). MorphMarket lists Orange Belly as a
  // Proven Line/alias of Yellow Belly instead, but per the established
  // Cypress precedent, WOBP's own distinct Complex field is treated as
  // authoritative — modeled as its own independent standalone locus `ob`,
  // matching the existing Yellow Belly/Gravel/Special/Russo/Specter/Spark
  // pattern (visually-similar-but-modeled-separately).
  { requires: { ob: ['Ob/ob', 'Ob/Ob'], rhd: ['Rhd/rhd', 'Rhd/Rhd'] }, remove: ['Orange Belly', 'Super Orange Belly', 'Redhead', 'Super Redhead'], alias: 'Ob Redhead' },
  // NOTE: "Enchi Redhead", "Enchi Redhead Spotnose", "Ghost Redhead
  // Spider", "Gravel Redhead Spotnose" are plain multi-gene-name
  // concatenations, not portmanteaus — skipped.
  // Red Gene, Striker, Mckenzie — zero combos found, only Super/Base rows
  // and plain-concatenation Designer Morph noise.
  // "Taronja Citrine": own page subtitle "(Taronja Russo Het Leucistic
  // Pastel)" — "Russo Het Leucistic" is this site's alt name for
  // heterozygous Russo (our engine already displays het Russo as plain
  // "Russo", so this is just Taronja + Russo(het) + Pastel(het)).
  { requires: { tar: ['Tar/tar'], rus: ['Rus/rus'], pas: ['Pas/pas'] }, remove: ['Taronja', 'Russo', 'Pastel'], alias: 'Taronja Citrine' },
  // "Luca Ball": own page subtitle "(Fire Spider Taronja)".
  { requires: { fi: ['Fi/fi'], sp: ['Sp/sp', 'Sp/Sp'], tar: ['Tar/tar'] }, remove: ['Fire', 'Spider', 'Taronja'], alias: 'Luca Ball' },
  // "Crimson Spice" (2026-08-28): own page title is "Leopard Ball Spotnose
  // Stranger" with subtitle "(Crimson Spice)" — the reverse of the usual
  // pattern. "Ball" is NOT a modeled gene; independently confirmed via
  // Delta7 Ball Python's breeder blog, which captions this exact combo
  // "Crimson Spice aka Leopard Spotnose Stranger" and describes it as
  // Spotnose + Leopard's pattern-disrupting effect plus Stranger's
  // expression — no fourth gene. Leopard is Recessive (homo-only).
  { requires: { leo: ['leo/leo'], spn: ['Spn/spn', 'Spn/Spn'], stg: ['Stg/stg', 'Stg/Stg'] }, remove: ['Leopard', 'Spotnose', 'Super Spotnose', 'Stranger', 'Super Stranger'], alias: 'Crimson Spice' },
  // Remaining Stranger results are all plain multi-gene-name
  // concatenations (e.g. "Butter Pastel Stranger Clown"), not checked
  // individually per established convention.
  // "Morpheus": own page subtitle "(Super Sentinel Yellow Belly)" —
  // Sentinel is Recessive (homo-only) in this engine, so "Super Sentinel"
  // = homozygous Sentinel (snt/snt).
  { requires: { snt: ['snt/snt'], yb: ['Yb/yb'] }, remove: ['Sentinel', 'Yellow Belly'], alias: 'Morpheus' },
  // NOTE: "Super Speckled" checked and skipped — mistagged "Designer
  // Morph" page with NO subtitle/composition and NO Description
  // (Genetics: N/A), same pattern as "Super Sahara". Remaining Speckled
  // results (Bumble Bee Speckled, Pastel Speckled, Spider Speckled, etc.)
  // are plain concatenations, not portmanteaus.
  // "Graffiti": own page subtitle "(Calico Super Paint)" — Paint is
  // Recessive (homo-only) in this engine, so "Super Paint" = homozygous
  // Paint (pnt/pnt); "Calico" alone (no "Super" prefix) = heterozygous
  // Calico (Cal/cal).
  { requires: { cal: ['Cal/cal'], pnt: ['pnt/pnt'] }, remove: ['Calico', 'Paint'], alias: 'Graffiti' },
  // NOTE: Nanny search results ("Darkling Nanny Ball", "Spotnose Nanny
  // Ball", "Leopard Nanny Ball Pastel", "Mocha Nanny Pinstripe", "Mystic
  // Nanny", etc.) are all plain gene-name concatenations (the recurring
  // "Ball" suffix appears to be a breeder-line/naming convention, not a
  // modeled gene) — skipped, no portmanteaus found. Remaining Paint
  // results ("Calico Piebald Paint", "Paint Pastel Yellow Belly", "Calico
  // Paint Ball Yellow Belly") are plain concatenations — skipped.
  // THIS CLOSES OUT THE ENTIRE COMBO-SCOPING PASS across all modeled
  // Ball Python genes (batches 1-18 complete).
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
  vnt: { name: 'Vanta', description: 'Recessive (added batch 17, 2026-08-29, first produced by Jurgen Wuyts/Proherper). vnt/vnt = Vanta (reduced pattern, darker appearance). Own page explicitly states "It resembles Zebra, but is genetically different" — CONFIRMED distinct, non-complementary from Zebra (`zbr`), same simplification style as rax/lav/ult/mig.', combinations: ['Vnt/Vnt', 'Vnt/vnt', 'vnt/vnt'] },
  zbr: { name: 'Zebra', description: 'Recessive, independent standalone gene (added batch 17, 2026-08-29, first produced by Steve Roussis/Roussis Reptiles and Adam Chesla/Chesla Reptiles; has a genetic test available named "Zebra"). zbr/zbr = Zebra (reduced pattern, darker appearance). Confirmed distinct from Vanta (`vnt`) per Vanta\'s own page.', combinations: ['Zbr/Zbr', 'Zbr/zbr', 'zbr/zbr'] },
  shr: { name: 'Sahara', description: 'Recessive (added batch 17, 2026-08-29, first produced by Eb Noah). shr/shr = Sahara (a bright morph that gets better looking/brighter with age). Own page says "very similar to Desert ghost (`dg`), and expected to be the same genetically" — a HEDGED claim ("expected to be", not "proven"/"identical"), same weight class as Sugar\'s "probably the same as Calico" — kept as its own separate locus, NOT collapsed into Desert Ghost.', combinations: ['Shr/Shr', 'Shr/shr', 'shr/shr'] },
  rbw: { name: 'Rainbow', description: 'Recessive, independent standalone gene (added batch 17, 2026-08-29, first produced by Herman Van Hellem/Albinoreptiles in 2015; has a genetic test available named "Rainbow"). rbw/rbw = Rainbow ("a type of albino" with orange/purple tones). Despite being described as "a type of albino," has its OWN distinct genetic test (different from Albino/Candy\'s), so modeled as its own NON-complementary standalone locus — same treatment as Lavender Albino (`lav`)/Red Axanthic (`rax`) vs. their base genes, NOT folded into the `albCdy` multi-allelic locus.', combinations: ['Rbw/Rbw', 'Rbw/rbw', 'rbw/rbw'] },
  pnt: { name: 'Paint', description: 'Recessive, independent standalone gene (added batch 18, 2026-08-29, first produced by Charles Glaspie in 2008). Base page mistagged Mutation "Designer Morph" despite explicitly stating "Genetics: Recessive" — same site data-entry quirk as Gobi/Creme/Nanny. pnt/pnt = Paint (dark morph, strong dorsal striping, pixelated alien heads, intense blushings). Sentinel (`snt`) and Speckled (`spd`) are each "suspected to be the same or allelic with Paint" per their own pages — a HEDGED claim ("suspected", not "proven"/"identical"), so all three are kept as separate loci, same refined precedent as Sugar/Sahara (batch 17).', combinations: ['Pnt/Pnt', 'Pnt/pnt', 'pnt/pnt'] },
  snt: { name: 'Sentinel', description: 'Recessive, independent standalone gene (added batch 18, 2026-08-29, first produced by Ben Siegel/Ben Siegal Reptiles Inc in 2010). snt/snt = Sentinel (dark morph, strong dorsal striping, pixelated alien heads, intense blushings). Own Description says "Suspected to be the same or allelic with Paint" (`pnt`) — hedged, kept separate. Description is word-for-word identical to Speckled\'s (`spd`, different breeder) — same "near-identical Description, different breeder, kept separate" pattern as the granite family.', combinations: ['Snt/Snt', 'Snt/snt', 'snt/snt'] },
  spd: { name: 'Speckled', description: 'Recessive, independent standalone gene (added batch 18, 2026-08-29, first produced by Mark Haas in 2007). spd/spd = Speckled (dark morph, strong dorsal striping, pixelated alien heads, intense blushings). Own Description says "suspected to be the same or allelic with Paint" (`pnt`) — hedged, kept separate. Description is word-for-word identical to Sentinel\'s (`snt`, different breeder) — same "near-identical Description, different breeder, kept separate" pattern as the granite family.', combinations: ['Spd/Spd', 'Spd/spd', 'spd/spd'] },
  // --- Incomplete Dominant genes (own Super name) ---
  pas: { name: 'Pastel', description: 'Incomplete Dominant. Pas/pas = Pastel, Pas/Pas = Super Pastel.', combinations: ['pas/pas', 'Pas/pas', 'Pas/Pas'] },
  en: { name: 'Enchi', description: 'Incomplete Dominant. En/en = Enchi, En/En = Super Enchi. En + Jol combo = "Enchi Jolt" (added batch 11, 2026-08-29, see BALL_PYTHON_COMBO_ALIASES).', combinations: ['en/en', 'En/en', 'En/En'] },
  fi: { name: 'Fire', description: 'Incomplete Dominant. Fi/fi = Fire, Fi/Fi = Black Fire.', combinations: ['fi/fi', 'Fi/fi', 'Fi/Fi'] },
  cho: { name: 'Chocolate', description: 'Incomplete Dominant. Cho/cho = Chocolate, Cho/Cho = Super Chocolate. "Saar" is a documented synonym — source site states genetic testing has proven Saar identical to Chocolate, so no separate locus is modeled for it. Cho + Sab combo = "Saar Sable"; Bon + Cho combo = "Bongo Saar" (added batch 11, 2026-08-29, see BALL_PYTHON_COMBO_ALIASES).', combinations: ['cho/cho', 'Cho/cho', 'Cho/Cho'] },
  van: { name: 'Vanilla', description: 'Incomplete Dominant. Van/van = Vanilla, Van/Van = Super Vanilla.', combinations: ['van/van', 'Van/van', 'Van/Van'] },
  yb: { name: 'Yellow Belly', description: 'Incomplete Dominant, independent standalone gene (confirmed 2026-08-27, not part of a shared complex). Yb/yb = Yellow Belly, Yb/Yb = Super Yellow Belly. Yb + Spk combo = "Puma" (added batch 18, 2026-08-29, see BALL_PYTHON_COMBO_ALIASES).', combinations: ['yb/yb', 'Yb/yb', 'Yb/Yb'] },
  grv: { name: 'Gravel', description: 'Incomplete Dominant, independent standalone gene — visually similar to Yellow Belly but genetically distinct (confirmed 2026-08-27). Grv/grv = Gravel, Grv/Grv = Super Gravel. Grv + Yb combo = "Highway" (see BALL_PYTHON_COMBO_ALIASES).', combinations: ['grv/grv', 'Grv/grv', 'Grv/Grv'] },
  spc: { name: 'Special', description: 'Incomplete Dominant, independent standalone gene (confirmed 2026-08-27, NOT part of a Yellow Belly complex). Spc/spc = Special, Spc/Spc = Super Special. Spc + Rus combo = "The Diamond" (see BALL_PYTHON_COMBO_ALIASES).', combinations: ['spc/spc', 'Spc/spc', 'Spc/Spc'] },
  ob: { name: 'Orange Belly', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-28, own WOBP Complex: "Orange Belly", distinct from Yellow Belly complex; MorphMarket instead lists it as a Proven Line/alias of Yellow Belly, but WOBP\'s own distinct Complex field is treated as authoritative per the Cypress precedent). Ob/ob = Orange Belly (intense flaming/blushing, related to Yellow Belly), Ob/Ob = Super Orange Belly. Ob + Rhd combo = "Ob Redhead" (own subtitle "(Orange Belly Redhead)").', combinations: ['ob/ob', 'Ob/ob', 'Ob/Ob'] },
  rus: { name: 'Russo', description: 'Incomplete Dominant, independent standalone gene (confirmed 2026-08-27, NOT part of a Yellow Belly complex). Rus/rus = Russo, Rus/Rus = Super Russo. CONFIRMED (2026-08-27) BEL-adjacent: Rus + Pha combo = "Opal Diamond" ("a combo made by combining Russo and Phantom") — modeled as a combo alias, NOT by expanding belComplexName()/BEL_COMPLEX_MEMBERS (each BEL-adjacent pair gets its own distinct name instead of collapsing to one shared name). Rus + Hon combo = "Cassandra" ("from the bel complex").', combinations: ['rus/rus', 'Rus/rus', 'Rus/Rus'] },
  spe: { name: 'Specter', description: 'Incomplete Dominant, independent standalone gene (confirmed 2026-08-27). Spe/spe = Specter, Spe/Spe = Super Specter. Spe + Yb combo = "Super Stripe"/"Superstripe" (see BALL_PYTHON_COMBO_ALIASES).', combinations: ['spe/spe', 'Spe/spe', 'Spe/Spe'] },
  mys: { name: 'Mystic', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-27). Mys/mys = Mystic, Mys/Mys = Super Mystic. Mys + Moj combo = "Mystic Potion" (see BALL_PYTHON_COMBO_ALIASES).', combinations: ['mys/mys', 'Mys/mys', 'Mys/Mys'] },
  chn: { name: 'Chino', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-27) — described as looking like "a brighter Phantom" (a BEL complex member), but modeled as its own separate locus pending stronger confirmation of any allelic relationship.', combinations: ['chn/chn', 'Chn/chn', 'Chn/Chn'] },
  hon: { name: 'Honey', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-27). Hon/hon = Honey, Hon/Hon = Super Honey. "Mocha" is a documented synonym — the source site states Honey and Mocha are genetically identical, so only one locus is modeled (Honey chosen as the canonical display name). Hon + Rus combo = "Cassandra" ("from the bel complex", see BALL_PYTHON_COMBO_ALIASES). Hon + Pha combo = "Leche" (added batch 10, 2026-08-28, "from the BEL complex"). Hon + Moj combo = "Mohoney" (confirmed 2026-08-29 via its own explicit Description: "This blue eyed leucistic is the combination of Mojave and Honey").', combinations: ['hon/hon', 'Hon/hon', 'Hon/Hon'] },
  bam: { name: 'Bamboo', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-27, first produced by Eb Noah in 2013). Bam/bam = Bamboo, Bam/Bam = Super Bamboo. Site notes it "dominates almost every other morph it is combined with" visually — cosmetic note only, not modeled as an epistasis rule (no specific combo names confirmed yet for this locus).', combinations: ['bam/bam', 'Bam/bam', 'Bam/Bam'] },
  sch: { name: 'Scaleless Head', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-28, first produced by Brian Barczyk / Bhb Reptiles in 2010). Sch/sch = Scaleless Head (missing scales between the eyes, divided anal scale, reduced pattern); Sch/Sch is called Scaleless (full-body scaleless), NOT Super Scaleless Head — unusual naming vs. the rest of this group.', combinations: ['sch/sch', 'Sch/sch', 'Sch/Sch'] },
  spn: { name: 'Spotnose', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-28, first produced by VPI in 2005). Spn/spn = Spotnose, Spn/Spn = Super Spotnose.', combinations: ['spn/spn', 'Spn/spn', 'Spn/Spn'] },
  asp: { name: 'Asphalt', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-28, first produced by Todd Constable in 2009). Asp/asp = Asphalt (looks almost normal except extensive flaming — genetic testing recommended), Asp/Asp = Super Asphalt.', combinations: ['asp/asp', 'Asp/asp', 'Asp/Asp'] },
  jol: { name: 'Jolt', description: 'Incomplete Dominant, independent standalone gene (added batch 11, 2026-08-29, first produced by Outback Reptiles). Jol/jol = Jolt, Jol/Jol = Super Jolt. Jol + Lor combo = "Jolt Lori"; Jol + Raz combo = "Jolt Razor"; En + Jol combo = "Enchi Jolt" (composition inferred from title — detail pages 404 despite correct page title, same site-bug pattern seen elsewhere).', combinations: ['jol/jol', 'Jol/jol', 'Jol/Jol'] },
  lor: { name: 'Lori', description: 'Incomplete Dominant, independent standalone gene (added batch 11, 2026-08-29, first produced by Brian Barczyk/Bhb Reptiles). Lor/lor = Lori (genetic black back, increased pigmentation, darker look), Lor/Lor = Super Lori. Lor + Raz combo = "Lori Razor" (composition inferred from title — detail page 404s).', combinations: ['lor/lor', 'Lor/lor', 'Lor/Lor'] },
  raz: { name: 'Razor', description: 'Incomplete Dominant, independent standalone gene (added batch 11, 2026-08-29). Raz/raz = Razor (high contrast, black background, gold/rust patterning), Raz/Raz = Super Razor.', combinations: ['raz/raz', 'Raz/raz', 'Raz/Raz'] },
  bon: { name: 'Bongo', description: "Incomplete Dominant, independent standalone gene (added batch 11, 2026-08-29, first produced by Eb Noah in 2012). Bon/bon = Bongo (black back, slightly darker overall color, reduced alien heads), Bon/Bon = Super Bongo. Bon + Cho combo = \"Bongo Saar\" (site's \"Saar\" is a confirmed genetic synonym for Chocolate — see `cho` locus; composition inferred from title, detail page 404s).", combinations: ['bon/bon', 'Bon/bon', 'Bon/Bon'] },
  huf: { name: 'Huffman', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-28, first produced by Chris Huffman). Huf/huf = Huffman (genetic black back, increased pigmentation, overall darker look), Huf/Huf = Super Huffman. Huf + Jol combo = "Huffman Jolt"; Huf + Lor combo = "Huffman Lori" (composition inferred from title — detail pages 404 despite correct page title, same site-bug pattern as Jolt Lori/Jolt Razor).', combinations: ['huf/huf', 'Huf/huf', 'Huf/Huf'] },
  cyp: { name: 'Cypress', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-28, first produced by Outback Reptiles, has its own dedicated genetic test on WOBP). Cyp/cyp = Cypress (orange, chocolate brown tones, completely striped back), Cyp/Cyp = Super Cypress. Cyp + Cho combo = "Cypress Saar"; Cyp + Bh combo = "Black Head Cypress"; Cyp + Wke combo = "Cypress Wookie" (all 3 composition inferred from title — detail pages 404 despite correct page title, same site-bug pattern as other Wookie/Black Head combos).', combinations: ['cyp/cyp', 'Cyp/cyp', 'Cyp/Cyp'] },
  gra: { name: 'Granite', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-28, first produced by Ralph Davis/Ralph Davis Reptiles; Super Granite first produced 2003). Gra/gra = Granite (orange behind the head, striped neck, dots behind the head), Gra/Gra = Super Granite. Gra + Wom + Les + Nov + Pas combo = "Soul Reaper" (own subtitle "(Granite Hidden Gene Woma Lesser Nova Pastel)", see BALL_PYTHON_COMBO_ALIASES).', combinations: ['gra/gra', 'Gra/gra', 'Gra/Gra'] },
  jav: { name: 'Java', description: 'Incomplete Dominant, independent standalone gene (added batch 13, 2026-08-29, first produced by Markus Jayne Ball Pythons in 2011). Jav/jav = Java (darker, more pigmented animals with a busy pattern), Jav/Jav = Super Java.', combinations: ['jav/jav', 'Jav/jav', 'Jav/Jav'] },
  bld: { name: 'Blade', description: 'Incomplete Dominant, independent standalone gene (added batch 13, 2026-08-29, first produced by Mark Mandic/Markus Jayne Ball Pythons in 2002). Bld/bld = Blade (significantly reduced pattern, no impact on overall color), Bld/Bld = Super Blade.', combinations: ['bld/bld', 'Bld/bld', 'Bld/Bld'] },
  cal: { name: 'Calico', description: 'Dominant (site labels it plain "Dominant" but a distinct "Super Calico" homozygous form exists, so it is modeled the same as the Incomplete Dominant genes above; added batch 13, 2026-08-29, first produced by Kevin Mccurley/NERD in 2002). Cal/cal = Calico (genetic black back, white speckling especially combined with Pastel; two independent lines — Flora and Fauna, and NERD — expected identical), Cal/Cal = Super Calico.', combinations: ['cal/cal', 'Cal/cal', 'Cal/Cal'] },
  dst: { name: 'Desert', description: 'Dominant (site labels it plain "Dominant" but a distinct "Super Desert" homozygous form exists, modeled same as the Incomplete Dominant genes above; added batch 13, 2026-08-29). Dst/dst = Desert, Dst/Dst = Super Desert. Explicitly confirmed DISTINCT/unrelated to Desert Ghost (`dg`) — not the same gene despite the similar name. NOTE (breeding caution, not modeled): source site states Desert females are always egg-bound and should never be bred; males are fine.', combinations: ['dst/dst', 'Dst/dst', 'Dst/Dst'] },
  dsc: { name: 'Disco', description: 'Incomplete Dominant, independent standalone gene (added batch 13, 2026-08-29, first produced by Ted Thompson in 2004). Dsc/dsc = Disco (subtle Fire-like appearance, less bright than Fire), Dsc/Dsc = Super Disco (described as "very different" from Black Fire).', combinations: ['dsc/dsc', 'Dsc/dsc', 'Dsc/Dsc'] },
  bh: { name: 'Black Head', description: 'Incomplete Dominant, independent standalone gene (added batch 13, 2026-08-29, first produced by Ralph Davis Reptiles in 2002; aliases "Bh"/"Blackhead"). Bh/bh = Black Head (dark appearance; reduces the neurological "wobble" in severe Spider-complex combinations), Bh/Bh = Super Black Head.', combinations: ['bh/bh', 'Bh/bh', 'Bh/Bh'] },
  spk: { name: 'Spark', description: 'Incomplete Dominant, independent standalone gene (added batch 13, 2026-08-29, first produced by Amir Soleymani in 2007; has a genetic test available). Spk/spk = Spark (near-indistinguishable from Yellow Belly but with more flames and a yellow checkerboard belly pattern), Spk/Spk = Super Spark. Spk + Yb combo = "Puma" (confirmed batch 18, 2026-08-29, via Puma\'s own Description: "produced by combining Spark and Yellow belly" — see BALL_PYTHON_COMBO_ALIASES).', combinations: ['spk/spk', 'Spk/spk', 'Spk/Spk'] },
  jag: { name: 'Jaguar', description: 'Incomplete Dominant, independent standalone gene (added batch 13, 2026-08-29, first produced by Kevin Mccurley/NERD). Jag/jag = Jaguar (bright golden tone, reduced pattern), Jag/Jag = Super Jaguar.', combinations: ['jag/jag', 'Jag/jag', 'Jag/Jag'] },
  krg: { name: 'Krg', description: 'Dominant (site labels it plain "Dominant" but a distinct "Super Krg" homozygous form exists, modeled same as the Incomplete Dominant genes above; added batch 13, 2026-08-29 — full name "Kalabash Reduction Gene", first documented by Tom Carlton/Cypress Creek Reptiles). Krg/krg = Krg, Krg/Krg = Super Krg.', combinations: ['krg/krg', 'Krg/krg', 'Krg/Krg'] },
  ahi: { name: 'Ahi', description: 'Dominant (added batch 14, 2026-08-29, first produced by Yellow Belly Ball). Ahi/ahi = Ahi, Ahi/Ahi = Super Ahi. NOTE lower confidence than most other loci here: the base "Ahi" detail page 404s and does not appear as its own row in site search (only "Super Ahi" does) — het name/type inferred from the confirmed Super Ahi page and this file\'s consistent naming convention, same risk tolerance as several batch 10/11 title-only combos.', combinations: ['ahi/ahi', 'Ahi/ahi', 'Ahi/Ahi'] },
  dot: { name: 'Dot', description: 'Incomplete Dominant, independent standalone gene (added batch 14, 2026-08-29, first produced by Benfis Exotics in 2009). Dot/dot = Dot ("typical Granite like appearance"), Dot/Dot = Super Dot.', combinations: ['dot/dot', 'Dot/dot', 'Dot/Dot'] },
  web: { name: 'Web', description: 'Dominant (added batch 14, 2026-08-29, first produced by The Florida Reptile Ranch). Web/web = Web (golden color, reduced pattern), Web/Web = Super Web. Distinct "Super Web" homozygous form confirmed, so modeled same as the Incomplete Dominant genes above despite the plain "Dominant" label.', combinations: ['web/web', 'Web/web', 'Web/Web'] },
  acd: { name: 'Acid', description: 'Dominant (added batch 14, 2026-08-29, first produced by Josh Jensen in 2014; alias "Acd"). Acd/acd = Acid ("a granite like Morph, likely similar to Confusion and Static"), Acd/Acd = Super Acid. Distinct "Super Acid" homozygous form confirmed, so modeled same as the Incomplete Dominant genes above despite the plain "Dominant" label.', combinations: ['acd/acd', 'Acd/acd', 'Acd/Acd'] },
  bng: { name: 'Bang', description: 'Incomplete Dominant, independent standalone gene (added batch 14, 2026-08-29, first produced by Sterling Nelson in 2014; alias "Bng"). Bng/bng = Bang ("brighter Orange, OD like appearance"), Bng/Bng = Super Bang.', combinations: ['bng/bng', 'Bng/bng', 'Bng/Bng'] },
  caf: { name: 'Cafe', description: 'Dominant (added batch 14, 2026-08-29, first produced by Northwest Reptiles in 2013; alias "Caf"). Caf/caf = Cafe (darker animal, white flames, high contrast), Caf/Caf = Super Cafe. NOTE: Cafe\'s own page says "Dominant" but Super Cafe\'s page says "Incomplete dominant" — same kind of label inconsistency as Calico/Desert/Krg; modeled the same het/homo shape regardless since a distinct Super name exists.', combinations: ['caf/caf', 'Caf/caf', 'Caf/Caf'] },
  gob: { name: 'Gobi', description: 'Incomplete Dominant (added batch 14, 2026-08-29, first produced by Burger Balls). Gob/gob = Gobi ("reduced, bright morph"), Gob/Gob = Super Gobi. NOTE: both Gobi\'s and Super Gobi\'s own pages are tagged Mutation "Designer Morph" (not "Base Morph"/"Super") despite explicitly stating "Genetics: Incomplete dominant" and having a distinct Complex name each — treated as a site data-entry quirk (same pattern as Coral Glow\'s mistagged bare page in batch 6) rather than a real designer-combo/undocumented-inheritance case like Fader, since the inheritance type IS specified here (unlike Fader\'s "N/A").', combinations: ['gob/gob', 'Gob/gob', 'Gob/Gob'] },
  grm: { name: 'Grim', description: 'Incomplete Dominant, independent standalone gene (added batch 14, 2026-08-29, first produced by Tropical Hut; alias "Grm"). Grm/grm = Grim (Granite-like, orange behind the head, striped neck, dots behind the head), Grm/Grm = Super Grim (aka "Grim Reaper" nickname per site alt-name "grimreaper" — NOT the same as the separate unmodeled "Reaper" gene name on the full gap list, don\'t confuse the two).', combinations: ['grm/grm', 'Grm/grm', 'Grm/Grm'] },
  jed: { name: 'Jedi', description: 'Incomplete Dominant, independent standalone gene (added batch 14, 2026-08-29, first produced by John Berry in 2006; alias "Jed"). Jed/jed = Jedi (striped appearance, more reduced, excessive flames), Jed/Jed = Super Jedi.', combinations: ['jed/jed', 'Jed/jed', 'Jed/Jed'] },
  nov: { name: 'Nova', description: 'Dominant (added batch 14, 2026-08-29, first produced by Dan Wolfe in 2010; alias "Nov"). Nov/nov = Nova (darker morph, reduced alien heads, white speckles in the flames), Nov/Nov = Super Nova. Distinct "Super Nova" homozygous form confirmed, so modeled same as the Incomplete Dominant genes above despite the plain "Dominant" label.', combinations: ['nov/nov', 'Nov/nov', 'Nov/Nov'] },
  bad: { name: 'Black Adder', description: 'Dominant (added batch 15, 2026-08-29, first produced by Regius Club in 2006; alt-name "adder"). Bad/bad = Black Adder (genetic black back), Bad/Bad = Super Black Adder. RESOLVED (2026-08-29, cross-referenced against MorphMarket Morphpedia since WOBP alone left this ambiguous): MorphMarket\'s official "Adder" wiki entry lists "Black Adder" as a plain Alias of Adder (Colin Thomas, 2006) — i.e. Adder and Black Adder are confirmed to be the SAME gene, not two independent mutations. This explains WOBP\'s separate "Super Adder" page (credited to Colin Thomas, no Description) — it is a duplicate/rival-attribution page for the SAME homozygous phenotype as "Super Black Adder" (credited to Regius Club), not a distinct unmodeled gene. No new locus added; "Super Adder" is treated as a synonym of "Super Black Adder".', combinations: ['bad/bad', 'Bad/bad', 'Bad/Bad'] },
  bgo: { name: 'Bingo', description: 'Dominant (added batch 15, 2026-08-29, first produced by Rolf Dennison). Bgo/bgo = Bingo (Y-shaped marking behind the head, significant tail/neck stripe, irregular body patterning), Bgo/Bgo = Super Bingo.', combinations: ['bgo/bgo', 'Bgo/bgo', 'Bgo/Bgo'] },
  blz: { name: 'Blaze', description: 'Dominant (added batch 15, 2026-08-29, first produced by Sweball). Blz/blz = Blaze ("a highlighter gene... makes most combos brighter"), Blz/Blz = Super Blaze.', combinations: ['blz/blz', 'Blz/blz', 'Blz/Blz'] },
  blt: { name: 'Blitz', description: 'Incomplete Dominant, independent standalone gene (added batch 15, 2026-08-29, first produced by Hardy Reptiles in 2010; has a genetic test available named "Hurricane" — that is just the test/product name, NOT the homozygous morph name, which is plain "Super Blitz"). Blt/blt = Blitz (broken-up alien heads that swirl around like a hurricane), Blt/Blt = Super Blitz.', combinations: ['blt/blt', 'Blt/blt', 'Blt/Blt'] },
  crm: { name: 'Creme', description: 'Incomplete Dominant (added batch 15, 2026-08-29, first produced by M&s Reptilien). Crm/crm = Creme (significantly reduced appearance, clean sides, striped back), Crm/Crm = Super Creme. NOTE: both Creme\'s and Super Creme\'s own pages are tagged Mutation "Designer Morph" (not "Base Morph"/"Super") despite explicitly stating "Genetics: Incomplete dominant" — same site data-entry quirk as Gobi (batch 14)/Coral Glow (batch 6), not a Fader-style undocumented-inheritance exclusion.', combinations: ['crm/crm', 'Crm/crm', 'Crm/Crm'] },
  gnx: { name: 'Genex', description: 'Incomplete Dominant, independent standalone gene (added batch 15, 2026-08-29, first produced by Justin Kobylka/Kinova in 2015; aliases "Gene-x"/"Genx"). Gnx/gnx = Genex ("a highlighter gene mostly used in piebald combinations"), Gnx/Gnx = Super Genex.', combinations: ['gnx/gnx', 'Gnx/gnx', 'Gnx/Gnx'] },
  nya: { name: 'Nyala', description: 'Dominant (added batch 15, 2026-08-29, first produced by Wally Van Der Walt in 2013). Nya/nya = Nyala (darker appearance, intensive flaming, dorsal stripe, faded orange color at the start of the neck), Nya/Nya = Super Nyala. Distinct "Super Nyala" homozygous form confirmed, so modeled same as the Incomplete Dominant genes above despite the plain "Dominant" label.', combinations: ['nya/nya', 'Nya/nya', 'Nya/Nya'] },
  orb: { name: 'Orbit', description: 'Incomplete Dominant, independent standalone gene (added batch 15, 2026-08-29, first produced by Philipp & Reinhold Danch in 2016). Orb/orb = Orbit (granite-type morph, orange right behind the head, striped neck, dots behind the head), Orb/Orb = Super Orbit. NOTE: Orbit\'s own Description text is WORD-FOR-WORD near-identical to Pixel\'s (`pxl`) and very similar to Grim\'s (`grm`) — part of a likely convergent "granite family" of independently-discovered but visually similar mutations (see also Dot/Acid/Static/Confusion) — modeled as its own distinct locus per the site\'s own separate Complex/breeder listing, NOT merged with Pixel or Grim.', combinations: ['orb/orb', 'Orb/orb', 'Orb/Orb'] },
  pxl: { name: 'Pixel', description: 'Incomplete Dominant, independent standalone gene (added batch 15, 2026-08-29, first produced by Justin Kobylka/Kinova). Pxl/pxl = Pixel (granite-type morph, orange right behind the head, striped neck, dots behind the head), Pxl/Pxl = Super Pixel. NOTE: Pixel\'s own Description text is WORD-FOR-WORD identical to Orbit\'s (`orb`) — part of the same likely convergent "granite family" as Orbit/Grim/Dot/Acid — modeled as its own distinct locus per the site\'s own separate Complex/breeder listing, NOT merged with Orbit.', combinations: ['pxl/pxl', 'Pxl/pxl', 'Pxl/Pxl'] },
  qke: { name: 'Quake', description: 'Incomplete Dominant, independent standalone gene (added batch 15, 2026-08-29, first produced by Dan Wolfe in 2012). Qke/qke = Quake (genetic black back, increased pigmentation, overall darker look), Qke/Qke = Super Quake.', combinations: ['qke/qke', 'Qke/qke', 'Qke/Qke'] },
  sat: { name: 'Satin', description: 'Incomplete Dominant, independent standalone gene (added batch 16, 2026-08-29, first produced by Mike Jones Reptiles). Sat/sat = Satin (black back, additional spotting, overall darker appearance), Sat/Sat = Super Satin.', combinations: ['sat/sat', 'Sat/sat', 'Sat/Sat'] },
  hur: { name: 'Hurricane', description: 'Incomplete Dominant, independent standalone gene (added batch 16, 2026-08-29, first produced by Hans Winner in 2010; has a genetic test available named "Hurricane"). Hur/hur = Hurricane (increased pigmentation, disturbed alien heads, swirls resembling a hurricane), Hur/Hur = Super Hurricane (alt-name "Hayabusa"). NOTE: the gap list\'s "Trick" is NOT a separate gene — Trick\'s own page explicitly states "Trick is genetically identical to Hurricane" (same strong-synonym pattern as Saar=Chocolate, batch 11) — modeled ONLY as `hur`, no separate `trk` locus added. Unlike Migraine ("a line of Cryptic" but kept SEPARATE since it has its own Complex/page), Trick\'s wording is an explicit identity claim, not a lineage note, so it was collapsed instead of split. Blitz (`blt`, batch 15) ALSO lists the same "Hurricane" genetic test but its own page does NOT claim identity with Hurricane — modeled as a separate locus per the Migraine precedent (own Complex/breeder/page, no explicit "identical to" statement).', combinations: ['hur/hur', 'Hur/hur', 'Hur/Hur'] },
  cpr: { name: 'Copper', description: 'Incomplete Dominant, independent standalone gene (added batch 16, 2026-08-29). Cpr/cpr = Copper ("similar in appearance to Mahogany", granite-like alien heads, darker appearance), Cpr/Cpr = Super Copper. No First Produced By credit listed on either page.', combinations: ['cpr/cpr', 'Cpr/cpr', 'Cpr/Cpr'] },
  fsn: { name: 'Fusion', description: 'Incomplete Dominant, independent standalone gene (added batch 16, 2026-08-29, first produced by The Florida Reptile Ranch in 2016). Fsn/fsn = Fusion ("a highlighter gene"), Fsn/Fsn = Super Fusion.', combinations: ['fsn/fsn', 'Fsn/fsn', 'Fsn/Fsn'] },
  ksm: { name: 'Kosmos', description: 'Incomplete Dominant, independent standalone gene (added batch 16, 2026-08-29, first produced by Ralf Simm/Reptizon in 2012). Ksm/ksm = Kosmos ("extreme Granite-like morph", orange behind the head, striped neck, dots behind the head, extreme pigmentation in the alien heads), Ksm/Ksm = Super Kosmos. Part of the same likely convergent "granite family" as Dot/Acid/Static/Grim/Orbit/Pixel/Reaper — modeled as its own distinct locus, NOT merged with any of them.', combinations: ['ksm/ksm', 'Ksm/ksm', 'Ksm/Ksm'] },
  rpr: { name: 'Reaper', description: 'Incomplete Dominant, independent standalone gene (added batch 16, 2026-08-29, first produced by Bill Buchmann). Rpr/rpr = Reaper (granite-type morph, orange behind the head, striped neck, dots behind the head), Rpr/Rpr = Super Reaper. CONFIRMED genuinely distinct from Grim (`grm`, batch 14) — Super Grim\'s alt-name "grimreaper" is just a nickname for Super Grim, NOT this gene; Reaper has its own separate Complex/breeder (Bill Buchmann vs. Grim\'s Tropical Hut). Part of the same likely convergent "granite family" as Dot/Acid/Static/Kosmos/Orbit/Pixel.', combinations: ['rpr/rpr', 'Rpr/rpr', 'Rpr/Rpr'] },
  stc: { name: 'Static', description: 'Dominant (site label; has a distinct Super name so modeled the same as the Incomplete Dominant genes; added batch 16, 2026-08-29, first produced by Fred Kick in 2008). Stc/stc = Static ("a granite like Morph"), Stc/Stc = Super Static. Static\'s own description explicitly says "likely to be similar to Acid and Confusion" — part of the same likely convergent "granite family" as Dot/Acid/Kosmos/Grim/Orbit/Pixel/Reaper, but the site treats each as its own distinct Base Morph/Complex with no stated shared-locus relationship, so modeled as its own distinct locus.', combinations: ['stc/stc', 'Stc/stc', 'Stc/Stc'] },
  trj: { name: 'Trojan', description: 'Incomplete Dominant, independent standalone gene (added batch 16, 2026-08-29, first produced by Major League Reptile). Trj/trj = Trojan (alien heads, intense orange color), Trj/Trj = Super Trojan.', combinations: ['trj/trj', 'Trj/trj', 'Trj/Trj'] },
  wke: { name: 'Wookie', description: 'Incomplete Dominant, independent standalone gene (added batch 16, 2026-08-29, first produced by The Herp Vault in 2013; has a genetic test available named "Wookie"). Wke/wke = Wookie (dark appearance, reduced alien heads, smaller size, intense flaming), Wke/Wke = Super Wookie. This unblocks the previously-flagged "Saar - Wookie"/"Bongo - Wookie" combo candidates in BALL_PYTHON_UNVERIFIED_COMBO_CANDIDATES.md (still not added as confirmed aliases — no explicit Description-field composition confirmed for either combo yet, just inferred from the page title).', combinations: ['wke/wke', 'Wke/wke', 'Wke/Wke'] },
  zwd: { name: 'Zuwadi', description: 'Incomplete Dominant, independent standalone gene (added batch 16, 2026-08-29, first produced by Visionary Exotics). Zwd/zwd = Zuwadi (striped neck, dots behind the head, pixilated alien heads), Zwd/Zwd = Super Zuwadi.', combinations: ['zwd/zwd', 'Zwd/zwd', 'Zwd/Zwd'] },
  mar: { name: 'Mario', description: 'Incomplete Dominant, independent standalone gene (added batch 17, 2026-08-29, first produced by Sabala Serpents And Mike Wonka in 2012). Mar/mar = Mario (golden colour, sharp flames, white lining around flames; "similar to Jungle Woma"), Mar/Mar = Super Mario.', combinations: ['mar/mar', 'Mar/mar', 'Mar/Mar'] },
  pch: { name: 'Peach', description: 'Incomplete Dominant, independent standalone gene (added batch 17, 2026-08-29, first produced by Justin Kobylka). Pch/pch = Peach (more orange appearance, reduction of the alien heads), Pch/Pch = Super Peach.', combinations: ['pch/pch', 'Pch/pch', 'Pch/Pch'] },
  rvn: { name: 'Raven', description: 'Incomplete Dominant, independent standalone gene (added batch 17, 2026-08-29, first produced by Ben Cole in 2011). Rvn/rvn = Raven (black back, additional spotting, overall darker appearance), Rvn/Rvn = Super Raven. NOTE: Raven\'s Description is word-for-word identical to Satin\'s (`sat`, batch 16) \u2014 modeled as its own distinct locus per the site\'s own separate Complex/breeder listing, NOT merged with Satin.', combinations: ['rvn/rvn', 'Rvn/rvn', 'Rvn/Rvn'] },
  sgr: { name: 'Sugar', description: 'Dominant (added batch 17, 2026-08-29, first produced by Ryv Reptiles). Sgr/sgr = Sugar (genetic black back, white speckling on the sides especially combined with Pastel), Sgr/Sgr = Super Sugar. Sugar\'s own Description says "It\'s probably the same as Calico" (`cal`, batch 13) \u2014 a hedged/unconfirmed claim (same weight class as Acid\'s "likely similar to Confusion and Static", NOT the strong "genetically identical to"/"proven identical" wording that triggered the Trick=Hurricane and Saar=Chocolate collapses) \u2014 kept as its own separate locus, not merged with Calico.', combinations: ['sgr/sgr', 'Sgr/sgr', 'Sgr/Sgr'] },
  vdo: { name: 'Vudoo', description: 'Incomplete Dominant, independent standalone gene (added batch 17, 2026-08-29, first produced by Bob Vu). Vdo/vdo = Vudoo (striped neck, dots behind the head, pixilated alien heads), Vdo/Vdo = Super Vudoo. NOTE: Vudoo\'s Description is word-for-word identical to Zuwadi\'s (`zwd`, batch 16) \u2014 modeled as its own distinct locus per the site\'s own separate Complex/breeder listing, NOT merged with Zuwadi.', combinations: ['vdo/vdo', 'Vdo/vdo', 'Vdo/Vdo'] },
  mos: { name: 'Mosaic', description: 'Incomplete Dominant, independent standalone gene (added batch 17, 2026-08-29, first produced by Bradford Cole Herpteculture Inc). Mos/mos = Mosaic (dorsal stripe, brighter appearance, alien heads outlined with dark black and white lined flames), Mos/Mos = Super Mosaic.', combinations: ['mos/mos', 'Mos/mos', 'Mos/Mos'] },
  rgn: { name: 'Red Gene', description: 'Dominant (site label; has a distinct Super name so modeled the same as the Incomplete Dominant genes), added batch 18, 2026-08-29. No First Produced By credit listed on either page. Rgn/rgn = Red Gene (darker orange look, often pops up in Black Head combos), Rgn/Rgn = Super Red Gene.', combinations: ['rgn/rgn', 'Rgn/rgn', 'Rgn/Rgn'] },
  rhd: { name: 'Redhead', description: 'Incomplete Dominant, independent standalone gene (added batch 18, 2026-08-29, first produced by The Mad Baller in 2013). Rhd/rhd = Redhead (high contrast, black background, gold/rust patterning, white lines around alien heads, granite-like neck pattern), Rhd/Rhd = Super Redhead.', combinations: ['rhd/rhd', 'Rhd/rhd', 'Rhd/Rhd'] },
  stk: { name: 'Striker', description: 'Incomplete Dominant, independent standalone gene (added batch 18, 2026-08-29, first produced by Ball Python Morphs Co Za). Stk/stk = Striker (stretched out alien heads), Stk/Stk = Super Striker. Own Description explicitly states "The super resembles Zebra but is genetically distinct" — confirmed non-complementary with Zebra (`zbr`, batch 17).', combinations: ['stk/stk', 'Stk/stk', 'Stk/Stk'] },
  tar: { name: 'Taronja', description: 'Incomplete Dominant, independent standalone gene (added batch 18, 2026-08-29, first produced by Freek Nuyt in 2006). Tar/tar = Taronja (reduced pattern, black back, intense orange color), Tar/Tar = Super Taronja.', combinations: ['tar/tar', 'Tar/tar', 'Tar/Tar'] },
  mck: { name: 'Mckenzie', description: 'Incomplete Dominant, independent standalone gene (added batch 18, 2026-08-29). No First Produced By credit listed on either page. Mck/mck = Mckenzie (brighter look, typical Fire headstamp), Mck/Mck = Super Mckenzie. Own Description explicitly states "the super is very different from a Super Fire" — confirmed non-complementary with Fire (`fi`).', combinations: ['mck/mck', 'Mck/mck', 'Mck/Mck'] },
  stg: { name: 'Stranger', description: 'Dominant (site label; has a distinct Super name so modeled the same as the Incomplete Dominant genes), added batch 18, 2026-08-29, first produced by Roland Van Den Oever/Ires. Stg/stg = Stranger (dark appearance, large white pixilated alien heads, dorsal stripe), Stg/Stg = Super Stranger.', combinations: ['stg/stg', 'Stg/stg', 'Stg/Stg'] },
  nny: { name: 'Nanny', description: 'Incomplete Dominant, independent standalone gene (added batch 18, 2026-08-29, first produced by Herps Etc Reptiles in 2011). Base page mistagged Mutation "Designer Morph" despite explicitly stating "Genetics: Incomplete dominant" and having a confirmed matching Super Nanny page (same breeder/year, own Complex "Super Nanny") — same site data-entry quirk as Gobi/Creme (batches 14/15), NOT a Fader-style exclusion. Nny/nny = Nanny ("a granite type morph"), Nny/Nny = Super Nanny.', combinations: ['nny/nny', 'Nny/nny', 'Nny/Nny'] },
  lmb: { name: 'Lemonback', description: 'Incomplete Dominant, independent standalone gene (added 2026-08-28, first produced by Pro Exotics in 2008). WOBP\'s own Lemonback/Super Lemonback pages both fit the "Fader" exclusion pattern (Designer Morph, Genetics: N/A, no subtitle/Description) — confirmed instead via external cross-reference (MorphMarket Morphpedia: Type "Incomplete Dominant", own Complex "Black Eyed Leucistic (BlkEL)"), same one-time exception precedent as Adder/Pewter. Lmb/lmb = Lemonback, Lmb/Lmb = Super Lemonback. NOTE: this "Black Eyed Leucistic" complex is DIFFERENT from this engine\'s `les`/`moj`/`but`/`pha`/`dad` "Blue-Eyed Leucistic" BEL_COMPLEX_MEMBERS group (matches the pre-existing "Disco Vanilla (Black-Eyed Leucistic)" combo\'s complex name) — NOT folded into belComplexName(). MorphMarket lists Brite/Lucifer/Mota/Sauce as documented proven-identical lines/aliases of this same gene (not separate genes) — same treatment as Saar=Chocolate; not modeled as separate loci. No Lemonback+Fire/Vanilla/Disco combo aliases added yet (separate future task).', combinations: ['lmb/lmb', 'Lmb/lmb', 'Lmb/Lmb'] },
  dad: { name: 'Het Daddy', description: 'Incomplete Dominant, 5th member of the "BEL complex" (see below) — added 2026-08-28, first produced by Ralph Davis/Ralph Davis Reptiles. Confirmed via WOBP\'s own Het Daddy page ("is part of the blue eyed leucistic complex... barely noticable without those combos") and Mojave Daddy page ("two morphs from the Blue eyed Leucy complex"). Displayed name is "Het Daddy" (matches WOBP convention) not plain "Daddy". Dad/dad = Het Daddy, Dad/Dad = Super Het Daddy.', combinations: ['dad/dad', 'Dad/dad', 'Dad/Dad'] },
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
  les: { name: 'Lesser', description: 'Incomplete Dominant, member of the BEL complex with Mojave/Butter/Phantom. Doubling this one locus (Les/Les) keeps its own name: "Super Lesser (Blue-Eyed Leucistic)". Combining with a DIFFERENT BEL member collapses to the plain shared "Blue-Eyed Leucistic" name (confirmed 2026-08-29 via Super Lesser\'s own "Leuzist. Blue Eye" alt-name on worldofballpythons.com).', combinations: ['les/les', 'Les/les', 'Les/Les'] },
  moj: { name: 'Mojave', description: 'Incomplete Dominant, member of the BEL complex with Lesser/Butter/Phantom. Doubling this one locus (Moj/Moj) keeps its own name: "Super Mojave (Blue-Eyed Leucistic)". Combining with a DIFFERENT BEL member collapses to the plain shared "Blue-Eyed Leucistic" name (confirmed 2026-08-29 via Super Mojave\'s own "Leuzist. Blue Eye" alt-name). Hon + Moj combo = "Mohoney (Blue-Eyed Leucistic)" (added 2026-08-29).', combinations: ['moj/moj', 'Moj/moj', 'Moj/Moj'] },
  but: { name: 'Butter', description: 'Incomplete Dominant, member of the BEL complex with Lesser/Mojave/Phantom. Doubling this one locus (But/But) keeps its own name: "Super Butter (Blue-Eyed Leucistic)". Combining with a DIFFERENT BEL member collapses to the plain shared "Blue-Eyed Leucistic" name (confirmed 2026-08-29 via Super Butter\'s own "Leuzist. Blue Eye" alt-name).', combinations: ['but/but', 'But/but', 'But/But'] },
  pha: { name: 'Phantom', description: 'Incomplete Dominant, member of the BEL complex with Lesser/Mojave/Butter. Doubling this one locus (Pha/Pha) keeps its own name: "Super Phantom (Blue-Eyed Leucistic)". Combining with a DIFFERENT BEL member collapses to the plain shared "Blue-Eyed Leucistic" name. Rus + Pha combo = "Opal Diamond (Blue-Eyed Leucistic)"; Hon + Pha combo = "Leche (Blue-Eyed Leucistic)" (added batch 10, 2026-08-28) — each BEL-adjacent pair gets its own distinct name plus a BEL note instead of collapsing to the plain shared name.', combinations: ['pha/pha', 'Pha/pha', 'Pha/Pha'] },
  // --- Cinnamon / Black Pastel — true multi-allelic locus ---
  cinBp: { name: 'Cinnamon / Black Pastel', description: 'True multi-allelic locus — Cinnamon and Black Pastel are different alleles of the SAME gene. Cin/Cin = Super Cinnamon, Bp/Bp = Super Black Pastel, Cin/Bp = Cinnamon Black Pastel compound (neither super form).', combinations: ['n/n', 'Cin/n', 'Bp/n', 'Cin/Cin', 'Bp/Bp', 'Bp/Cin'] },
  // --- Albino / Candy — true multi-allelic locus ---
  albCdy: { name: 'Albino / Candy', description: 'True multi-allelic locus — Albino and Candy are different alleles of the SAME recessive gene (added 2026-08-28: source site states Candy "is allelic with regular Albino"). Both are recessive: a single copy of either allele (Alb/n or Cdy/n) is an invisible carrier, not a visible trait. Alb/Alb = Albino, Cdy/Cdy = Candy, Alb/Cdy = Candino ("the combination of Candy and Albino").', combinations: ['n/n', 'Alb/n', 'Cdy/n', 'Alb/Alb', 'Cdy/Cdy', 'Alb/Cdy'] },
  // --- Lace / GHI — true multi-allelic locus ---
  lacGhi: { name: 'Lace / GHI', description: 'True multi-allelic locus — Lace and GHI are different alleles of the SAME gene (confirmed 2026-08-28, "proven to be allelic with genetic testing"). CORRECTION: GHI was previously modeled as a separate Recessive locus, but the site confirms it is actually Incomplete Dominant, same as Lace — both visible with a single copy. Lac/n = Lace, Ghi/n = GHI, Lac/Lac = Super Lace, Ghi/Ghi = Super Ghi, Ghi/Lac = Lace Ghi compound (own confirmed name).', combinations: ['n/n', 'Lac/n', 'Ghi/n', 'Lac/Lac', 'Ghi/Ghi', 'Ghi/Lac'] },
  ban: { name: 'Banana', description: 'Incomplete Dominant, independent standalone gene (confirmed 2026-08-27 — "Coral Glow" removed as a Banana allele; it is actually an unrelated "Designer Morph" combo, not a Banana allele). Ban/ban = Banana, Ban/Ban = Super Banana.', combinations: ['ban/ban', 'Ban/ban', 'Ban/Ban'] },
  cg: { name: 'Coral Glow', description: 'Incomplete Dominant, independent standalone gene (re-added 2026-08-27, own "Base Morph"). Cg/cg = Coral Glow, Cg/Cg = Super Coral Glow. NOTE: source site describes this gene as "sex linked with frequent crossing over" in reality — that inheritance mechanic is NOT modeled here (simplified to plain autosomal Incomplete Dominant like every other gene, consistent with the Axanthic-lines simplification).', combinations: ['cg/cg', 'Cg/cg', 'Cg/Cg'] },
};
