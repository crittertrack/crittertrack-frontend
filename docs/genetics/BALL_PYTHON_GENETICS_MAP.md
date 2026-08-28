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
| vnt | vnt | Vanta | Recessive. **Standalone gene (added batch 17, 2026-08-29)**, first produced by Jurgen Wuyts/Proherper — own page explicitly states "It resembles Zebra, but is genetically different" (confirmed distinct from `zbr`) | Vnt |
| zbr | zbr | Zebra | Recessive. **Standalone gene (added batch 17, 2026-08-29)**, first produced by Steve Roussis/Roussis Reptiles and Adam Chesla/Chesla Reptiles; has its own genetic test named "Zebra" | Zbr |
| shr | shr | Sahara | Recessive. **Standalone gene (added batch 17, 2026-08-29)**, first produced by Eb Noah — own page says "very similar to Desert ghost, and expected to be the same genetically" (hedged claim, kept separate from `dg`) | Shr |
| rbw | rbw | Rainbow | Recessive. **Standalone gene (added batch 17, 2026-08-29)**, first produced by Herman Van Hellem/Albinoreptiles in 2015; described as "a type of albino" but has its OWN distinct genetic test named "Rainbow" — modeled as non-complementary with `albCdy`, same style as lav/rax | Rbw |
| snt | snt | Sentinel | Recessive. **Standalone gene (added batch 18, 2026-08-29)**, first produced by Ben Siegel/Ben Siegal Reptiles Inc in 2010 — own page says "Suspected to be the same or allelic with Paint" (hedged claim, kept separate from `pnt` and `spd`); Description word-for-word identical to Speckled's | Snt |
| spd | spd | Speckled | Recessive. **Standalone gene (added batch 18, 2026-08-29)**, first produced by Mark Haas in 2007 — own page says "suspected to be the same or allelic with Paint" (hedged claim, kept separate from `pnt` and `snt`); Description word-for-word identical to Sentinel's | Spd |
| pnt | pnt | Paint | Recessive. **Standalone gene (added batch 18, 2026-08-29)**, first produced by Charles Glaspie in 2008; base page mistagged Mutation "Designer Morph" but explicit Genetics "Recessive" (same quirk as Gobi/Creme/Nanny) | Pnt |
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
| ob  | Ob  | Orange Belly | Incomplete Dominant — Ob/Ob = Super Orange Belly. **Standalone gene (added 2026-08-28)** — own WOBP Complex: "Orange Belly" (distinct from Yellow Belly complex); MorphMarket instead lists it as a Proven Line/alias of Yellow Belly, but WOBP's own distinct Complex field is treated as authoritative (same precedent as Cypress). Ob + Rhd combo = "Ob Redhead" | ob |
| rus | Rus | Russo | Incomplete Dominant — Rus/Rus = Super Russo. **Standalone gene (corrected batch 5, 2026-08-27)** — confirmed independent. CONFIRMED BEL-adjacent (batch 7): Rus + Pha combo = "Opal Diamond", Rus + Hon combo = "Cassandra" (both explicitly "from the bel complex") | rus |
| spe | Spe | Specter | Incomplete Dominant — Spe/Spe = Super Specter. **Standalone gene (added batch 5, 2026-08-27)** | spe |
| mys | Mys | Mystic | Incomplete Dominant — Mys/Mys = Super Mystic. **Standalone gene (added batch 6, 2026-08-27)** — Mys + Moj combo = "Mystic Potion" | mys |
| chn | Chn | Chino | Incomplete Dominant — Chn/Chn = Super Chino. **Standalone gene (added batch 6, 2026-08-27)** — described on source site as looking like "a brighter Phantom" (a BEL complex member), but modeled as its own separate locus | chn |
| hon | Hon | Honey | Incomplete Dominant — Hon/Hon = Super Honey. **Standalone gene (added batch 6, 2026-08-27)** — "Mocha" is a confirmed genetic synonym (source site: "genetically identical"), modeled as one locus using Honey as the canonical name. Hon + Rus combo = "Cassandra" (batch 7). Hon + Moj combo = "Mohoney" (added 2026-08-29) | hon |
| bam | Bam | Bamboo | Incomplete Dominant — Bam/Bam = Super Bamboo. **Standalone gene (added batch 7, 2026-08-27)**, first produced by Eb Noah in 2013 | bam |
| sch | Sch | Scaleless Head | Incomplete Dominant — Sch/Sch is called **Scaleless** (NOT "Super Scaleless Head") — unusual naming vs. the rest of this group. **Standalone gene (added batch 8, 2026-08-28)**, first produced by Brian Barczyk/Bhb Reptiles in 2010 | sch |
| spn | Spn | Spotnose | Incomplete Dominant — Spn/Spn = Super Spotnose. **Standalone gene (added batch 8, 2026-08-28)**, first produced by VPI in 2005 | spn |
| asp | Asp | Asphalt | Incomplete Dominant — Asp/Asp = Super Asphalt. **Standalone gene (added batch 8, 2026-08-28)**, first produced by Todd Constable in 2009 | asp |
| jol | Jol | Jolt | Incomplete Dominant — Jol/Jol = Super Jolt. **Standalone gene (added batch 11, 2026-08-29)**, first produced by Outback Reptiles. Jol + Lor = "Jolt Lori"; Jol + Raz = "Jolt Razor"; En + Jol = "Enchi Jolt" (all 3 inferred from title, detail pages 404) | jol |
| lor | Lor | Lori | Incomplete Dominant — Lor/Lor = Super Lori. **Standalone gene (added batch 11, 2026-08-29)**, first produced by Brian Barczyk/Bhb Reptiles. Lor + Raz = "Lori Razor" (inferred from title, detail page 404s) | lor |
| raz | Raz | Razor | Incomplete Dominant — Raz/Raz = Super Razor. **Standalone gene (added batch 11, 2026-08-29)** | raz |
| bon | Bon | Bongo | Incomplete Dominant — Bon/Bon = Super Bongo. **Standalone gene (added batch 11, 2026-08-29)**, first produced by Eb Noah in 2012. Bon + Cho = "Bongo Saar" ("Saar" is a confirmed genetic synonym for Chocolate; inferred from title, detail page 404s) | bon |
| huf | Huf | Huffman | Incomplete Dominant — Huf/Huf = Super Huffman. **Standalone gene (added 2026-08-28)**, first produced by Chris Huffman, own WOBP page confirms directly (no MorphMarket cross-reference needed). Huf + Jol = "Huffman Jolt"; Huf + Lor = "Huffman Lori" (both composition inferred from title — combo pages 404 despite correct `<title>`, same pattern as Jolt Lori/Jolt Razor) | huf |
| cyp | Cyp | Cypress | Incomplete Dominant — Cyp/Cyp = Super Cypress. **Standalone gene (added 2026-08-28)**, first produced by Outback Reptiles; confirmed directly via own WOBP page, which also has its own dedicated genetic test link. Cyp + Cho = "Cypress Saar"; Cyp + Bh = "Black Head Cypress"; Cyp + Wke = "Cypress Wookie" (all 3 composition inferred from title — combo pages 404 despite correct `<title>`, same pattern as Wookie/Black Head combos) | cyp |
| gra | Gra | Granite | Incomplete Dominant — Gra/Gra = Super Granite. **Standalone gene (added 2026-08-28)**, first produced by Ralph Davis/Ralph Davis Reptiles; Super Granite first produced 2003. Gra + Wom + Les + Nov + Pas combo = "Soul Reaper" (own subtitle "(Granite Hidden Gene Woma Lesser Nova Pastel)", het-level only, matching site's own naming) | gra |
| cha | Cha | Champagne | Incomplete Dominant — **Cha/Cha = LETHAL** (confirmed — embryonic/non-viable, homozygous excluded from selectable combinations like other lethal loci in this repo) | cha |
| jav | Jav | Java | Incomplete Dominant — Jav/Jav = Super Java. **Standalone gene (added batch 13, 2026-08-29)**, first produced by Markus Jayne Ball Pythons in 2011 | jav |
| bld | Bld | Blade | Incomplete Dominant — Bld/Bld = Super Blade. **Standalone gene (added batch 13, 2026-08-29)**, first produced by Mark Mandic/Markus Jayne Ball Pythons in 2002 | bld |
| cal | Cal | Calico | Dominant (site label; has a distinct Super name so modeled the same as the Incomplete Dominant genes) — Cal/Cal = Super Calico. **Standalone gene (added batch 13, 2026-08-29)**, first produced by Kevin Mccurley/NERD in 2002 | cal |
| dst | Dst | Desert | Dominant (site label; has a distinct Super name so modeled the same as the Incomplete Dominant genes) — Dst/Dst = Super Desert. **Standalone gene (added batch 13, 2026-08-29)** — explicitly confirmed DISTINCT from Desert Ghost (`dg`) despite the similar name | dst |
| dsc | Dsc | Disco | Incomplete Dominant — Dsc/Dsc = Super Disco. **Standalone gene (added batch 13, 2026-08-29)**, first produced by Ted Thompson in 2004 | dsc |
| bh  | Bh  | Black Head | Incomplete Dominant — Bh/Bh = Super Black Head. **Standalone gene (added batch 13, 2026-08-29)**, first produced by Ralph Davis Reptiles in 2002; aliases "Bh"/"Blackhead" | bh |
| spk | Spk | Spark | Incomplete Dominant — Spk/Spk = Super Spark. **Standalone gene (added batch 13, 2026-08-29)**, first produced by Amir Soleymani in 2007; has a genetic test available | spk |
| jag | Jag | Jaguar | Incomplete Dominant — Jag/Jag = Super Jaguar. **Standalone gene (added batch 13, 2026-08-29)**, first produced by Kevin Mccurley/NERD | jag |
| krg | Krg | Krg ("Kalabash Reduction Gene") | Dominant (site label; has a distinct Super name so modeled the same as the Incomplete Dominant genes) — Krg/Krg = Super Krg. **Standalone gene (added batch 13, 2026-08-29)**, first documented by Tom Carlton/Cypress Creek Reptiles | krg |
| ahi | Ahi | Ahi | Dominant — Ahi/Ahi = Super Ahi. **Standalone gene (added batch 14, 2026-08-29)**, first produced by Yellow Belly Ball. Lower confidence: base "Ahi" detail page 404s and doesn't appear in site search (only "Super Ahi" does) | ahi |
| dot | Dot | Dot | Incomplete Dominant — Dot/Dot = Super Dot. **Standalone gene (added batch 14, 2026-08-29)**, first produced by Benfis Exotics in 2009 | dot |
| web | Web | Web | Dominant (site label; has a distinct Super name so modeled the same as the Incomplete Dominant genes) — Web/Web = Super Web. **Standalone gene (added batch 14, 2026-08-29)**, first produced by The Florida Reptile Ranch | web |
| acd | Acd | Acid | Dominant (site label; has a distinct Super name so modeled the same as the Incomplete Dominant genes) — Acd/Acd = Super Acid. **Standalone gene (added batch 14, 2026-08-29)**, first produced by Josh Jensen in 2014 | acd |
| bng | Bng | Bang | Incomplete Dominant — Bng/Bng = Super Bang. **Standalone gene (added batch 14, 2026-08-29)**, first produced by Sterling Nelson in 2014 | bng |
| caf | Caf | Cafe | Dominant (site label on base page; Super page says Incomplete dominant — same kind of inconsistency as Calico/Desert/Krg) — Caf/Caf = Super Cafe. **Standalone gene (added batch 14, 2026-08-29)**, first produced by Northwest Reptiles in 2013 | caf |
| gob | Gob | Gobi | Incomplete Dominant (both pages tagged Mutation "Designer Morph" as a site data-entry quirk, not a real designer-combo) — Gob/Gob = Super Gobi. **Standalone gene (added batch 14, 2026-08-29)**, first produced by Burger Balls | gob |
| grm | Grm | Grim | Incomplete Dominant — Grm/Grm = Super Grim (alt-name "grimreaper", NOT the same as the separate unmodeled "Reaper" gene). **Standalone gene (added batch 14, 2026-08-29)**, first produced by Tropical Hut | grm |
| jed | Jed | Jedi | Incomplete Dominant — Jed/Jed = Super Jedi. **Standalone gene (added batch 14, 2026-08-29)**, first produced by John Berry in 2006 | jed |
| nov | Nov | Nova | Dominant (site label; has a distinct Super name so modeled the same as the Incomplete Dominant genes) — Nov/Nov = Super Nova. **Standalone gene (added batch 14, 2026-08-29)**, first produced by Dan Wolfe in 2010 | nov |
| bad | Bad | Black Adder | Dominant — Bad/Bad = Super Black Adder. **Standalone gene (added batch 15, 2026-08-29)**, first produced by Regius Club in 2006; plain "Adder" is NOT a separate gene, it's an official alt-name of Black Adder | bad |
| bgo | Bgo | Bingo | Dominant — Bgo/Bgo = Super Bingo. **Standalone gene (added batch 15, 2026-08-29)**, first produced by Rolf Dennison | bgo |
| blz | Blz | Blaze | Dominant — Blz/Blz = Super Blaze. **Standalone gene (added batch 15, 2026-08-29)**, first produced by Sweball | blz |
| blt | Blt | Blitz | Incomplete Dominant — Blt/Blt = Super Blitz. **Standalone gene (added batch 15, 2026-08-29)**, first produced by Hardy Reptiles in 2010; has a genetic test named "Hurricane" (not an alternate morph name) | blt |
| crm | Crm | Creme | Incomplete Dominant (both pages tagged Mutation "Designer Morph" as a site data-entry quirk) — Crm/Crm = Super Creme. **Standalone gene (added batch 15, 2026-08-29)**, first produced by M&s Reptilien | crm |
| gnx | Gnx | Genex | Incomplete Dominant — Gnx/Gnx = Super Genex. **Standalone gene (added batch 15, 2026-08-29)**, first produced by Justin Kobylka/Kinova in 2015 | gnx |
| nya | Nya | Nyala | Dominant (site label; has a distinct Super name so modeled the same as the Incomplete Dominant genes) — Nya/Nya = Super Nyala. **Standalone gene (added batch 15, 2026-08-29)**, first produced by Wally Van Der Walt in 2013 | nya |
| orb | Orb | Orbit | Incomplete Dominant — Orb/Orb = Super Orbit. **Standalone gene (added batch 15, 2026-08-29)**, first produced by Philipp & Reinhold Danch in 2016; granite-family visual overlap with Pixel/Grim, kept as a separate locus | orb |
| pxl | Pxl | Pixel | Incomplete Dominant — Pxl/Pxl = Super Pixel. **Standalone gene (added batch 15, 2026-08-29)**, first produced by Justin Kobylka/Kinova; granite-family visual overlap with Orbit/Grim, kept as a separate locus | pxl |
| qke | Qke | Quake | Incomplete Dominant — Qke/Qke = Super Quake. **Standalone gene (added batch 15, 2026-08-29)**, first produced by Dan Wolfe in 2012 | qke |
| sat | Sat | Satin | Incomplete Dominant — Sat/Sat = Super Satin. **Standalone gene (added batch 16, 2026-08-29)**, first produced by Mike Jones Reptiles | sat |
| hur | Hur | Hurricane | Incomplete Dominant — Hur/Hur = Super Hurricane. **Standalone gene (added batch 16, 2026-08-29)**, first produced by Hans Winner in 2010; has a genetic test named "Hurricane". Coded IN PLACE OF the gap list's "Trick" — Trick's own page states "Trick is genetically identical to Hurricane" (pure alias, not a separate locus) | hur |
| cpr | Cpr | Copper | Incomplete Dominant — Cpr/Cpr = Super Copper. **Standalone gene (added batch 16, 2026-08-29)**; no "First Produced By" credit listed on either page | cpr |
| fsn | Fsn | Fusion | Incomplete Dominant — Fsn/Fsn = Super Fusion. **Standalone gene (added batch 16, 2026-08-29)**, first produced by The Florida Reptile Ranch in 2016 | fsn |
| ksm | Ksm | Kosmos | Incomplete Dominant — Ksm/Ksm = Super Kosmos. **Standalone gene (added batch 16, 2026-08-29)**, first produced by Ralf Simm/Reptizon in 2012; granite-family visual overlap with Orbit/Pixel/Grim/Reaper, kept as a separate locus | ksm |
| rpr | Rpr | Reaper | Incomplete Dominant — Rpr/Rpr = Super Reaper. **Standalone gene (added batch 16, 2026-08-29)**, first produced by Bill Buchmann; granite-family visual overlap with Orbit/Pixel/Grim/Kosmos, kept as a separate locus; confirmed distinct from Super Grim's "grimreaper" nickname | rpr |
| stc | Stc | Static | Dominant (site label; has a distinct Super name so modeled the same as the Incomplete Dominant genes) — Stc/Stc = Super Static. **Standalone gene (added batch 16, 2026-08-29)**, first produced by Fred Kick in 2008; own Description says "likely to be similar to Acid and Confusion" | stc |
| trj | Trj | Trojan | Incomplete Dominant — Trj/Trj = Super Trojan. **Standalone gene (added batch 16, 2026-08-29)**, first produced by Major League Reptile | trj |
| wke | Wke | Wookie | Incomplete Dominant — Wke/Wke = Super Wookie. **Standalone gene (added batch 16, 2026-08-29)**, first produced by The Herp Vault in 2013; has a genetic test named "Wookie" | wke |
| zwd | Zwd | Zuwadi | Incomplete Dominant — Zwd/Zwd = Super Zuwadi. **Standalone gene (added batch 16, 2026-08-29)**, first produced by Visionary Exotics | zwd |
| mar | Mar | Mario | Incomplete Dominant — Mar/Mar = Super Mario. **Standalone gene (added batch 17, 2026-08-29)**, first produced by Sabala Serpents And Mike Wonka in 2012 | mar |
| pch | Pch | Peach | Incomplete Dominant — Pch/Pch = Super Peach. **Standalone gene (added batch 17, 2026-08-29)**, first produced by Justin Kobylka | pch |
| rvn | Rvn | Raven | Incomplete Dominant — Rvn/Rvn = Super Raven. **Standalone gene (added batch 17, 2026-08-29)**, first produced by Ben Cole in 2011; Description word-for-word identical to Satin's, kept as its own separate locus | rvn |
| sgr | Sgr | Sugar | Dominant (site label; has a distinct Super name so modeled the same as the Incomplete Dominant genes) — Sgr/Sgr = Super Sugar. **Standalone gene (added batch 17, 2026-08-29)**, first produced by Ryv Reptiles; own Description says "probably the same as Calico" (hedged, not collapsed) | sgr |
| vdo | Vdo | Vudoo | Incomplete Dominant — Vdo/Vdo = Super Vudoo. **Standalone gene (added batch 17, 2026-08-29)**, first produced by Bob Vu; Description word-for-word identical to Zuwadi's, kept as its own separate locus | vdo |
| mos | Mos | Mosaic | Incomplete Dominant — Mos/Mos = Super Mosaic. **Standalone gene (added batch 17, 2026-08-29)**, first produced by Bradford Cole Herpteculture Inc | mos |
| rgn | Rgn | Red Gene | Dominant (site label; has a distinct Super name) — Rgn/Rgn = Super Red Gene. **Standalone gene (added batch 18, 2026-08-29)**, no breeder credit listed | rgn |
| rhd | Rhd | Redhead | Incomplete Dominant — Rhd/Rhd = Super Redhead. **Standalone gene (added batch 18, 2026-08-29)**, first produced by The Mad Baller in 2013 | rhd |
| stk | Stk | Striker | Incomplete Dominant — Stk/Stk = Super Striker. **Standalone gene (added batch 18, 2026-08-29)**, first produced by Ball Python Morphs Co Za; own Description says "The super resembles Zebra but is genetically distinct" (kept separate from `zbr`) | stk |
| tar | Tar | Taronja | Incomplete Dominant — Tar/Tar = Super Taronja. **Standalone gene (added batch 18, 2026-08-29)**, first produced by Freek Nuyt in 2006 | tar |
| mck | Mck | Mckenzie | Incomplete Dominant — Mck/Mck = Super Mckenzie. **Standalone gene (added batch 18, 2026-08-29)**, no breeder credit listed; own Description says "the super is very different from a Super Fire" (kept separate from `fi`) | mck |
| stg | Stg | Stranger | Dominant (site label; has a distinct Super name) — Stg/Stg = Super Stranger. **Standalone gene (added batch 18, 2026-08-29)**, first produced by Roland Van Den Oever/Ires in 2012 | stg |
| nny | Nny | Nanny | Incomplete Dominant — Nny/Nny = Super Nanny. **Standalone gene (added batch 18, 2026-08-29)**, first produced by Herps Etc Reptiles in 2011; base page mistagged Mutation "Designer Morph" but explicit Genetics "Incomplete dominant" (same quirk as Gobi/Creme) | nny |
| lmb | Lmb | Lemonback | Incomplete Dominant — Lmb/Lmb = Super Lemonback. **Standalone gene (added 2026-08-28)**, first produced by Pro Exotics in 2008. WOBP's own Lemonback/Super Lemonback pages both fit the "Fader" exclusion pattern (Designer Morph, Genetics N/A, no subtitle/Description) — confirmed instead via MorphMarket Morphpedia cross-reference (Type "Incomplete Dominant", own Complex "Black Eyed Leucistic (BlkEL)" — a DIFFERENT complex from this engine's `les`/`moj`/`but`/`pha`/`dad` "Blue-Eyed Leucistic" group, matches the existing "Disco Vanilla (Black-Eyed Leucistic)" combo's complex name instead). NOT folded into `BEL_COMPLEX_MEMBERS`/`belComplexName()`. MorphMarket lists Brite/Lucifer/Mota/Sauce as proven-identical lines/aliases of this gene (not separate genes, not modeled) | lmb |
| sp  | Sp  | Spider | Dominant — no distinct homozygous form; Sp/Sp treated as same phenotype name as Sp/sp ("Spider"). **Health note:** Spider is associated with a documented neurological "wobble" condition — not a phenotype-naming issue, just worth surfacing to users somewhere in the UI | sp |
| les | Les | Lesser | Incomplete Dominant, member of the "BEL complex" (see below) | les |
| moj | Moj | Mojave | Incomplete Dominant, member of the "BEL complex" (see below) | moj |
| but | But | Butter | Incomplete Dominant, member of the "BEL complex" (see below) | but |
| pha | Pha | Phantom | Incomplete Dominant, member of the "BEL complex" (see below) | pha |
| dad | Dad | Het Daddy | Incomplete Dominant, 5th member of the "BEL complex" (see below). **Added 2026-08-28**, first produced by Ralph Davis/Ralph Davis Reptiles; confirmed via TWO explicit WOBP statements (own page: "is part of the blue eyed leucistic complex"; Mojave Daddy page: "two morphs from the Blue eyed Leucy complex") — stronger than the "Leuzist. Blue Eye" tag test used for the other 4. Displayed name is "Het Daddy" (WOBP's own convention), not plain "Daddy" | dad |
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
- 2 or more mutant alleles, all from the SAME single locus (e.g. `Les/Les`,
  `Moj/Moj`, `But/But`, `Pha/Pha`) → that locus's own "Super X" name PLUS
  a note, e.g. **"Super Mojave (Blue-Eyed Leucistic)"** (refined
  2026-08-29 — see addendum below)
- 2 or more mutant alleles spread across DIFFERENT loci (e.g. `Les/les` +
  `Moj/moj`, `But/but` + `Pha/pha`, etc.) → plain **"Blue-Eyed
  Leucistic"**, replacing all individual complex-member names

**Addendum (2026-08-29) — keep the specific "Super X" name for same-locus
doubling**: originally, doubling a single locus (e.g. `Moj/Moj`) also just
collapsed to the plain generic "Blue-Eyed Leucistic" name, discarding the
more specific "Super Mojave" identity. Per user direction ("if it has an
actual morph combo name, use that one and alt to blue-eyed leucistic"),
`belComplexName()` was updated to keep the specific name for the
same-locus case and append a "(Blue-Eyed Leucistic)" note, e.g. `Moj/Moj`
now reads "Super Mojave (Blue-Eyed Leucistic)" instead of just
"Blue-Eyed Leucistic". This is backed by direct WOBP verification that
Super Lesser/Super Mojave/Super Butter are each individually tagged with
the alt-name "Leuzist. Blue Eye" on their own dedicated pages. Combining
TWO DIFFERENT loci still collapses to the plain shared name, since no
more specific name is known for those pairings (there isn't a distinct
hobby name for e.g. "Lesser + Mojave" specifically — it's just BEL). The
same "(Blue-Eyed Leucistic)" note was also appended to the existing
BEL-adjacent combo aliases whose own descriptions confirm they ARE a form
of blue-eyed leucism: **Crystal**, **Mystic Potion**, **Opal Diamond**,
**Cassandra**, **Leche**, and **Mohoney** all now read as `<Name>
(Blue-Eyed Leucistic)` — see the combo alias table below. (**The
Diamond**, Russo+Special, is NOT changed — its own description makes no
BEL/blue-eyed-leucistic mention.)

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

## Addendum (2026-08-28): "Daddy" added as a TRUE 5th BEL_COMPLEX_MEMBERS locus (not BEL-adjacent like Russo/Mystic/Special)

At first glance this looks like it should follow the batch 6/7 precedent
above (Russo/Mystic/Special are BEL-adjacent but kept as separate loci,
each pairing with a true member to form its own distinctly-branded combo
name — Crystal, Mystic Potion, Opal Diamond, Cassandra). Daddy is
different, and the distinction is the naming pattern of its own combo
pages:

- Russo/Mystic/Special's combos with true BEL members get their own
  **distinct branded names** (Crystal, Mystic Potion, Opal Diamond,
  Cassandra) — evidence they're a different-but-compatible gene, not the
  same locus.
- Daddy's combos with OTHER genes (Butter Daddy, Mojave Daddy, Phantom
  Daddy, Russo Daddy, Mystic Daddy) are all just **plain "X Daddy"
  concatenations** (WOBP's own alt-name lists for these pages are only
  spelling/spacing permutations, e.g. "Russo Het Daddy"/"Het Daddy
  Russo" — never a distinct branded name). Mutation tagged "Allelic
  combo" on all of them.
- Two of Daddy's own pages explicitly state complex MEMBERSHIP (not just
  compatibility): its own base page — "is part of the blue eyed
  leucistic complex... barely noticable without those combos" — and
  "Phantom Daddy" — "made up of Phantom and het Daddy, **two morphs from
  the blue eyed leucistic complex**" (matches the exact phrasing used to
  justify true BEL membership, not the softer "can create... combinations"
  language used on Russo's own page).

So Daddy (`dad`) was added as the 5th true `BEL_COMPLEX_MEMBERS` entry —
`belComplexName()` needed zero code changes and automatically handles it.
This means Phantom Daddy (2 true members) auto-collapses to generic
"Blue-Eyed Leucistic" with no new rule, while Russo Daddy/Mystic Daddy
(Daddy + a BEL-adjacent-but-separate locus) just need default trait
stacking ("Russo Het Daddy"/"Mystic Het Daddy"), also no new rule needed.
Verified via two throwaway scripts (7/7, then 3/3 passed).

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

**Post-batch addendum (2026-08-29) — Mohoney discovered via MorphMarket
cross-reference**: while investigating an unrelated ambiguity (Super
Adder), the user asked to check MorphMarket's Honey wiki page, which
lists "Mojave" under Honey's Related Traits and tags Honey as part of
the "Blue Eyed Leucistic (BluEL)" complex. Following up directly on
worldofballpythons.com confirmed a dedicated "Mohoney" page (Mutation:
Allelic combo, alt-name "Honey Mojave", First Produced By Guy Montecalvo,
2013) with an explicit Description: "This blue eyed leucistic is the
combination of Mojave and Honey." Added as a new combo alias (Hon + Moj,
both het/homo permutations) — same BEL-adjacent per-pair-naming pattern
as Cassandra/Leche, not a `belComplexName()` change. Also independently
re-verified via WOBP that doubling any single core BEL gene (checked
Super Lesser, Super Mojave, Super Butter) is *already* tagged with the
alt-name "Leuzist. Blue Eye" by the site itself — confirming the existing
`belComplexName()` same-locus-doubling-also-equals-BEL behavior is
correct and needed no change. Verified with a throwaway 8-test script
(8/8 passed, including regression checks that Cassandra/Leche/plain BEL
collapsing are all unaffected).

**Post-batch addendum (2026-08-29) — naming refinement: keep specific
names for BEL-family combos**: per user direction, `belComplexName()` and
the 6 BEL-adjacent combo aliases (Crystal, Mystic Potion, Opal Diamond,
Cassandra, Leche, Mohoney) were updated so that whenever an actual,
specific morph/combo name exists, that name is used (not the generic
"Blue-Eyed Leucistic"), with a "(Blue-Eyed Leucistic)" note appended so
the family relationship is still visible — e.g. `Moj/Moj` alone now reads
"Super Mojave (Blue-Eyed Leucistic)" instead of just "Blue-Eyed
Leucistic", and the Honey+Mojave combo reads "Mohoney (Blue-Eyed
Leucistic)". Combining two DIFFERENT core BEL loci (e.g. Lesser+Mojave)
still collapses to the plain "Blue-Eyed Leucistic" name since no more
specific name is known for those pairings. Verified with a throwaway
19-test script (19/19 passed) covering all 4 same-locus-doubling cases,
2 different-locus regression cases, all 6 renamed combo aliases at both
het/homo permutations where applicable, and one non-BEL combo (The
Diamond) confirmed unaffected.

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

## BATCH 12 (2026-08-29): continued Phase B — 16 more site-confirmed combos

Continued paging the full `/en/morphs` list from where batch 11 left off.
This revealed a much larger space of pairwise "Allelic combo" pages than
previously seen — the site appears to give many pairings among the same
recurring set of Incomplete Dominant genes (Bamboo, Bongo, Butter, Chino,
Honey/Mocha, Mystic, Russo, Mojave, Chocolate/Saar, Spider, Enchi, Razor,
Sable) their own dedicated combo page, each following the same
correctly-loading-`<title>`-but-404-body pattern established in batches
7/10/11.

**Added 16 new combo aliases** (all both-loci-already-modeled, composition
inferred from title, verified via a throwaway script):
- **Bamboo Russo** = Bamboo + Russo — this one had a FULLY working page
  (not just a title): "This nice morph is the combination of two morphs,
  Bamboo and Russo het Leucistic."
- **Bongo Sable**, **Chino Honey**, **Chino Russo**, **Enchi Razor**,
  **Saar Spider**, **Bamboo Chino**, **Bamboo Honey**, **Bongo Spider**,
  **Butter Chino**, **Butter Honey**, **Chino Mojave**, **Chino Mystic**,
  **Honey Mystic**, **Mystic Russo** — title-confirmed only (404 body).
- **Mojave Russo** — this was flagged as unconfirmed/blocked back in
  batch 7 (page 404'd entirely); re-checked this batch and its page now
  correctly renders a `<title>` of "Mojave Russo", so it's unblocked.

**Duplicate names, no separate alias needed**: "Chino Mocha",
"Bamboo Mocha", "Butter Mocha", and "Mocha Mystic" are all separate page
titles on the site, but since Mocha is a pure synonym of Honey (same
locus, confirmed batch 6), these are functionally identical to
Chino Honey / Bamboo Honey / Butter Honey / Honey Mystic respectively —
already covered by those same alias rules.

**NOT coded — flagged for further research**: "Mocha Mojave" has a fully
working page (unlike most others this batch), labeled "Designer Morph"
(not "Allelic combo"), "Genetics: N/A", with subtitle "(Leuzist. Blue
Eye)". This implies Honey/Mocha + a single copy of Mojave alone might
produce a Blue-Eyed-Leucistic-like look, which would contradict the
batch 6/7 decision to model Honey as fully independent from the BEL
complex. Left undecided in
`BALL_PYTHON_UNVERIFIED_COMBO_CANDIDATES.md` rather than risk silently
changing every existing Honey/Mocha phenotype — needs a deliberate
follow-up decision, not a quick guess.

**Still blocked on unmodeled genes** (added to the candidates doc, not
individually re-verified this batch): Mystic Daddy, Phantom Daddy
(both blocked on "Daddy", same as batch 9/10/11's Russo Daddy),
Blitz - Trick, Saar - Wookie, Bongo - Wookie, Huffman - Jolt,
Huffman - Lori, Cypress - Saar, Disco Vanilla.

Verified via a throwaway 16-test script (16/16 passed, one per new
alias). `get_errors` confirmed clean on `ballPythonPhenotypeRules.js`.

---
## BATCH 13 (2026-08-29): full-scope gene audit — 9 new standalone genes

User requested a complete, exhaustive audit of ALL standalone ball python
genes (not just combo aliases) before continuing. Cross-referenced the full
filterable gene list on ballpython.ca against everything already modeled in
this repo, then verified each candidate directly against
worldofballpythons.com detail pages (using direct `/en/morphs/{slug}` URLs,
much faster/more reliable than clicking table rows or paging). Found ~30
confirmed gaps total; this batch codes the first, highest-confidence 10
(9 coded, 1 excluded):

**Coded as new standalone genes** (all verified via their own detail page +
a matching `/super-{slug}` homozygous page, all follow the standard
het/homo `SIMPLE_INCOMPLETE_DOMINANT_RULES` shape):
- **Java** (`jav`) — Base Morph, Incomplete dominant. Jav/Jav = Super Java.
  "Java are darker, more pigmented animals with a busy pattern."
- **Blade** (`bld`) — Base Morph, Incomplete dominant. Bld/Bld = Super Blade.
  "Significant reduced pattern, but no impact on the overall color."
- **Calico** (`cal`) — Base Morph, site labels Genetics "Dominant" (not
  "Incomplete dominant"), but a confirmed distinct "Super Calico" page
  exists, so modeled identically to the IncDom genes (unlike Spider, which
  has NO distinct homozygous name). Two independent lines (Flora and Fauna,
  NERD) are stated to be genetically the same.
- **Desert** (`dst`) — Base Morph, site labels Genetics "Dominant", has a
  confirmed "Super Desert" page. Its own page explicitly states: "Not to
  be confused with Desert ghost, a completely unrelated morph" — confirming
  it is NOT the same gene as the already-modeled `dg` (Desert Ghost) locus.
  Breeding-safety note (not modeled genetically): "females are always egg
  bound, so these should never be bred! Males can be reproduced without
  issues."
- **Disco** (`dsc`) — Base Morph, Incomplete dominant. Dsc/Dsc = Super
  Disco. "A subtle Fire-Like morph... comparable in appearance but less
  bright as a Fire, and the super is also very different."
- **Black Head** (`bh`) — Base Morph, Incomplete dominant, aliases
  "Bh"/"Blackhead". Bh/Bh = Super Black Head. "Has a dark appearance and
  the opposite effect of some severe Spider complex morphs, which reduces
  the wobble in these combinations."
- **Spark** (`spk`) — Base Morph, Incomplete dominant, HAS a genetic test
  available (unusual for this batch — most have none). Spk/Spk = Super
  Spark. "Indistinguishable from yellow belly and has more flames, easily
  identified by yellow checkerboard like pattern on the ventral side."
  NOTE: "Puma" is NOT Spark's homozygous form — Puma is a separate
  Designer-Morph combo (Spark + Yellow Belly, confirmed via its own
  description); "Het Puma" on Spark's alt-names list is informal breeder
  shorthand for single-copy Spark, a pre-Puma-combo carrier.
- **Jaguar** (`jag`) — Base Morph, Incomplete dominant. Jag/Jag = Super
  Jaguar (confirmed via direct detail page). "Bright golden tone and a
  reduced pattern."
- **Krg** (`krg`) — Base Morph, site labels Genetics "Dominant", has a
  confirmed "Super Krg" (seen during earlier pagination). Full name
  "Kalabash Reduction Gene" — first documented in a 2006 herpetology book,
  originally in Tom Carlton/Cypress Creek Reptiles' collection. Notably the
  ORIGINAL individual snake happened to also be het Pied (an unrelated
  coincidence of that one animal's history, not a genetic link between Krg
  and Piebald).

**Deliberately EXCLUDED — Fader**: despite appearing in dozens of combo
names across the site (Black Pastel Fader, Bumble Bee Fader, Calico Fader
Pastel, etc.), Fader's OWN detail page is tagged Mutation: "Designer
Morph" and Genetics: "N/A" — the site itself does not specify an
inheritance pattern for it, unlike all 9 genes coded above. This mirrors
the earlier "Mocha Mojave" anomaly (batch 12): a name that's common in
combos but whose own genetics are undocumented cannot be safely modeled as
a discrete locus. Left unmodeled, flagged in
`BALL_PYTHON_UNVERIFIED_COMBO_CANDIDATES.md` pending further research.

**Ruled OUT as genes entirely** (zero results or clearly not standalone
genes): Sulphur, Ringer (zero site search results), standalone "Ghost"
(no distinct page — informal shorthand for Desert Ghost), "Black Velvet"
(searches surface Lace/Lace Sable results — appears to be a nickname for
the existing Lace+Sable combo, not its own gene), Axanthic MJ / Hidden Gene
Woma (lines/full-names of already-modeled genes), Normal / Supers / Paradox
(not genes).

**Remaining ~20 confirmed gaps** intentionally left for future batches:
Ahi, Dot, Web, Acid, Bang, Cafe, Gobi, Grim, Jedi, Nova, Adder, Bingo,
Blaze, Blitz, Creme, Genex, Nyala, Orbit, Pixel, Quake, Satin, Trick,
Copper, Fusion, Kosmos, Reaper, Static, Trojan, Wookie, Zuwadi, Mario,
Peach, Raven, Sugar, Vanta, Vudoo, Zebra, Mosaic, Sahara, Rainbow, Red
Gene, Redhead, Striker, Taronja, Mckenzie, Sentinel, Speckled, Stranger.

Verified via a throwaway 19-test script (19/19 passed, including a
Desert+Desert-Ghost combined-genotype test confirming the two loci don't
collide). `get_errors` confirmed clean on `ballPythonPhenotypeRules.js`
and `GeneticCodeBuilder.jsx`.

---
## BATCH 14 (2026-08-29): continued gene audit — 10 new standalone genes

Continuation of the batch 13 full-scope audit — coded the next 10 of the
~20 remaining confirmed gaps. All 10 confirmed codeable this round (no
Fader-style exclusion needed):

- **Dot** (`dot`) — Base Morph, Incomplete dominant. Dot/Dot = Super Dot.
  First produced by Benfis Exotics in 2009. "Dot has a typical Granite
  like appearance." (A "Butter Dot" Designer Morph combo also exists on
  the site but was not verified/added as a combo alias this batch.)
- **Web** (`web`) — Base Morph, site labels Genetics "Dominant", confirmed
  distinct "Super Web" page. First produced by The Florida Reptile Ranch.
  "The Web ball python has a golden color and a reduced pattern."
- **Acid** (`acd`) — Base Morph, alt-name "(Acd)", site labels Genetics
  "Dominant", confirmed distinct "Super Acid" page. First produced by Josh
  Jensen in 2014. "Acid is a granite like Morph, that is likely to be
  similar to Confusion and Static." (Static is also on the remaining gap
  list — the site treats each as its own distinct Base Morph/Complex, no
  indication of a shared locus, so do not assume they're related genes
  without individually confirming each.)
- **Bang** (`bng`) — Base Morph, Incomplete dominant. Bng/Bng = Super Bang.
  First produced by Sterling Nelson in 2014. "Bang has a brighter Orange,
  OD like appearance."
- **Cafe** (`caf`) — Base Morph, site labels Genetics "Dominant", but its
  confirmed "Super Cafe" page says "Incomplete dominant" — same kind of
  label inconsistency as Calico/Desert/Krg (batch 13); modeled the same
  het/homo shape regardless. First produced by Northwest Reptiles in 2013.
  "The cafe is a darker animal, with nice white flames and the high
  contrast really makes the 'alien head' and 'Key Hole' patterns stand
  out."
- **Gobi** (`gob`) — BOTH Gobi's own page and Super Gobi's page are tagged
  Mutation "Designer Morph" (not "Base Morph"/"Super") YET both explicitly
  state "Genetics: Incomplete dominant" with their own distinct Complex
  name ("Gobi" / "Super Gobi") — treated as a site data-entry quirk (same
  pattern as Coral Glow's mistagged bare page in batch 6), NOT the same
  red flag as Fader (whose Genetics was "N/A", i.e. genuinely
  undocumented). First produced by Burger Balls. "Gobi is a reduced,
  bright morph."
- **Grim** (`grm`) — Base Morph, Incomplete dominant. Grm/Grm = Super Grim
  (alt-name "grimreaper" — just a nickname for Super Grim, NOT the same as
  the separate still-unmodeled "Reaper" gene on the gap list; don't
  conflate the two if Reaper is researched later). First produced by
  Tropical Hut. "Grim is a Granite-like morph with typical features of
  orange right behind the head, a striped neck and dots behind the head."
- **Jedi** (`jed`) — Base Morph, Incomplete dominant. Jed/Jed = Super Jedi.
  First produced by John Berry in 2006. "Jedi has a striped appearance,
  more reduced and excessive flames."
- **Nova** (`nov`) — Base Morph, site labels Genetics "Dominant", confirmed
  distinct "Super Nova" page. First produced by Dan Wolfe in 2010. "The
  Nova ball python morph is a darker morph with reduced alien heads, white
  speckles in the flames."
- **Ahi** (`ahi`) — LOWER CONFIDENCE than every other gene in this file:
  its own `/ahi` detail page 404s, AND the site's own search for "ahi"
  surfaces ONLY a "Super Ahi" row — no plain "Ahi" base row appears at
  all (unlike every other gene researched across all batches, which
  always had a directly-confirmable base page or table row). Modeled
  anyway based on the confirmed "Super Ahi" page (Mutation: Super,
  Complex: "Super Ahi", Genetics: Dominant, first produced by Yellow Belly
  Ball) and this file's consistent "Super X implies base X" naming
  convention — same risk tolerance as several title-only batch 10/11
  combos, but flagged here as the single lowest-confidence entry in the
  file. If future research finds evidence Ahi isn't a real standalone
  base morph, this entry should be reconsidered.

Verified via a throwaway 20-test script (20/20 passed — het + homo for
each of the 10 new genes). `get_errors` confirmed clean on
`ballPythonPhenotypeRules.js` and `GeneticCodeBuilder.jsx`.

**Remaining ~10 confirmed gaps** left for future batches: Adder, Bingo,
Blaze, Blitz, Creme, Genex, Nyala, Orbit, Pixel, Quake, Satin, Trick,
Copper, Fusion, Kosmos, Reaper, Static, Trojan, Wookie, Zuwadi, Mario,
Peach, Raven, Sugar, Vanta, Vudoo, Zebra, Mosaic, Sahara, Rainbow, Red
Gene, Redhead, Striker, Taronja, Mckenzie, Sentinel, Speckled, Stranger
(list carried over from batch 13, not yet re-verified for continued
accuracy).

---

## BATCH 15 (2026-08-29): continued gene audit — 10 new standalone genes

Continuation of the batch 13/14 full-scope audit — coded the next 10 of
the remaining confirmed gaps. All 10 confirmed codeable this round (no
Fader-style exclusion needed):

- **Black Adder** (`bad`) — coded IN PLACE OF the gap list's bare
  "Adder": Adder's own `/adder` slug 404s and does not exist as its own
  base page. Searching the site for "adder" surfaces "Black Adder" (Base
  Morph, Dominant), whose own alt-names paragraph explicitly lists
  "(Blackadder, adder)" — confirming "adder" is just an informal alias
  for Black Adder, not a separate gene. First produced by Regius Club in
  2006. "Black adder is a genetic black back." Bad/Bad = Super Black
  Adder (confirmed matching breeder/year). NOTE: a separate,
  unconnected `/super-adder` page also exists (First Produced By: Colin
  Thomas — a DIFFERENT breeder) with no confirmable matching base page —
  left unmodeled and flagged in
  `BALL_PYTHON_UNVERIFIED_COMBO_CANDIDATES.md` as an unresolved ambiguity,
  do not conflate with Black Adder.
- **Bingo** (`bgo`) — Base Morph, Dominant, alt-name "(Bigno)". Bgo/Bgo =
  Super Bingo. First produced by Rolf Dennison. "Behind the head there is
  a Y-shaped marking, they also have a significant tail stripe and neck
  stripe and the patterning is very irregular through their body."
- **Blaze** (`blz`) — Base Morph, Dominant, alt-name "(Blaz)". Blz/Blz =
  Super Blaze. First produced by Sweball. "Blaze is a highlighter gene,
  something that is rather subtle but makes most combos brighter."
- **Blitz** (`blt`) — Base Morph, Incomplete dominant, alt-name "(Bltz)".
  Blt/Blt = Super Blitz. First produced by Hardy Reptiles in 2010. Has a
  genetic test literally named "Hurricane" listed on both the base and
  Super pages — this is just the test/product name, NOT an alternate
  homozygous morph name (Super Blitz's own Complex field is confirmed
  plain "Super Blitz"). "Blitz is a pattern mutation, with broken up alien
  heads that swirl around as a Hurricane."
- **Creme** (`crm`) — BOTH Creme's own page and Super Creme's page are
  tagged Mutation "Designer Morph" (not "Base Morph"/"Super") YET both
  explicitly state "Genetics: Incomplete dominant" with their own
  distinct Complex name — same site data-entry quirk as Gobi (batch 14).
  First produced by M&s Reptilien. "Creme is a morph with a significantly
  reduced appearance, with clean sides and a striped back."
- **Genex** (`gnx`) — Base Morph, Incomplete dominant, aliases
  "(Gene-x, Genx)". Gnx/Gnx = Super Genex. First produced by Justin
  Kobylka/Kinova in 2015. "GeneX is a highlighter gene mostly used in
  piebald combinations."
- **Nyala** (`nya`) — Base Morph, site labels Genetics "Dominant",
  confirmed distinct "Super Nyala" page, alt-names "(Nyal, Nylaa)".
  First produced by Wally Van Der Walt in 2013. "The Nyala ball python
  morph has a darker appearance, with intensive flaming and a dorsal
  stripe. The start of the neck has a faded orange color."
- **Orbit** (`orb`) — Base Morph, Incomplete dominant, alt-name "(Orbt)".
  Orb/Orb = Super Orbit. First produced by Philipp & Reinhold Danch in
  2016. "The Orbit ball python is a morph with typical features of a
  granite type morph with orange right behind the head, a striped neck
  and dots behind the head." NOTE: this Description is word-for-word
  near-identical to Pixel's and very similar to Grim's (batch 14) —
  likely a convergent "granite family" of independently-discovered but
  visually similar mutations (see also Dot/Acid/Static/Confusion) —
  modeled as its own distinct locus per the site's own separate
  Complex/breeder listing, NOT merged with Pixel or Grim.
- **Pixel** (`pxl`) — Base Morph, Incomplete dominant, alt-name "(Pixl)".
  Pxl/Pxl = Super Pixel. First produced by Justin Kobylka/Kinova. "The
  Pixel ball python is a morph with typical features of a granite type
  morph with orange right behind the head, a striped neck and dots behind
  the head." Same granite-family caveat as Orbit above — kept as its own
  separate locus.
- **Quake** (`qke`) — Base Morph, Incomplete dominant, alt-name "(Quak)".
  Qke/Qke = Super Quake. First produced by Dan Wolfe in 2012. "The Quake
  ball python morph often has a genetic black back with increased
  pigmentation and an overal darked look."

Verified via a throwaway 20-test script (20/20 passed — het + homo for
each of the 10 new genes). `get_errors` confirmed clean on
`ballPythonPhenotypeRules.js` and `GeneticCodeBuilder.jsx`.

**Remaining ~28 confirmed/unverified gaps** left for future batches:
Satin, Trick, Copper, Fusion, Kosmos, Reaper, Static, Trojan, Wookie,
Zuwadi, Mario, Peach, Raven, Sugar, Vanta, Vudoo, Zebra, Mosaic, Sahara,
Rainbow, Red Gene, Redhead, Striker, Taronja, Mckenzie, Sentinel,
Speckled, Stranger (list carried over from batch 13/14, not yet
re-verified for continued accuracy). Plus the unresolved "Super Adder"
(Colin Thomas lineage) ambiguity flagged above.

---

## BATCH 16 (2026-08-29): continued gene audit — 10 gap-list names, 9 new standalone genes

Continuation of the batch 13/14/15 full-scope audit — researched the next
10 of the remaining confirmed gaps. 9 yielded a real new locus; 1 (Trick)
resolved as a pure synonym for a different real gene (Hurricane), which
was researched and coded instead:

- **Satin** (`sat`) — Base Morph, Incomplete dominant, alt-name "(Satn)".
  Sat/Sat = Super Satin. First produced by Mike Jones Reptiles. "The Satin
  ball python morph often has a black back, additional spotting and an
  overal darker appearance."
- **Trick → resolved as NOT a standalone gene**: Trick's own page (Base
  Morph, Incomplete dominant, Complex "Trick", alt-names "Liesen Line
  Trick, Llt, Trck", first produced by Gary Liesen in 2006, has a genetic
  test named "Hurricane") explicitly states in its Description: **"Trick
  is genetically identical to Hurricane."** This is the same
  strong-synonym pattern as the "Saar is proven identical to Chocolate"
  precedent (batch 11) — Trick is a pure alias, not modeled as its own
  locus.
- **Hurricane** (`hur`) — coded IN PLACE OF Trick per the above. Base
  Morph, Incomplete dominant, alt-names "(Huricane, Hurrican, Hur)". First
  produced by Hans Winner in 2010. Has its own genetic test named
  "Hurricane". "Hurricane has increased pigmentation and disturbed alien
  heads, often resulting in swirls that resemble a hurricane." Hur/Hur =
  Super Hurricane (alt-names include nickname "Hayabusa"/"superhurricane",
  same breeder). NOTE: Blitz (`blt`, batch 15) ALSO lists a genetic test
  literally named "Hurricane" but its own page does NOT claim genetic
  identity with Hurricane (just a descriptive metaphor, "swirl around as a
  Hurricane") and has its own distinct Complex/breeder (Hardy Reptiles,
  2010, vs. Hans Winner, 2010) — this matches the "Migraine is a line of
  Cryptic but kept separate" precedent (batch 11), not the Saar/Chocolate
  collapse precedent, so Blitz correctly stays a separate locus, no
  changes needed there. Confirmed via the site's own "Blitz Trick" combo
  page (title loads, body 404s — same site-bug pattern as several batch
  10-12 combo pages) that Blitz + Hurricane(=Trick) is a real documented
  pairing — added as a `BALL_PYTHON_COMBO_ALIASES` entry ("Blitz Trick").
- **Copper** (`cpr`) — Base Morph, Incomplete dominant, alt-name
  "(Coppr)", NO "First Produced By" field shown (unusual but not
  blocking — Base Morph + confirmed Super page is sufficient).
  "Coppers are similar in appearance to Mahogany. They have granite like
  alien heads and are darker in appearance." (Mahogany referenced as
  visually similar but not currently on the gap list — flag only, not
  investigated.) Cpr/Cpr = Super Copper.
- **Fusion** (`fsn`) — Base Morph, Incomplete dominant, alt-name
  "(Fusin)". First produced by The Florida Reptile Ranch in 2016. "Fusion
  is a highlighter gene." Fsn/Fsn = Super Fusion.
- **Kosmos** (`ksm`) — Base Morph, Incomplete dominant, alt-name
  "(Kosms)". First produced by Ralf Simm/Reptizon in 2012. "Kosmos is an
  extreme Granite-like morph with typical features of orange right behind
  the head, a striped neck and dots behind the head. There is also
  extreme pigmentation in the alien heads." Ksm/Ksm = Super Kosmos.
  Granite-family visual overlap with Orbit/Pixel/Grim/Reaper (batches
  14-15) — kept as its own distinct locus.
- **Reaper** (`rpr`) — Base Morph, Incomplete dominant, alt-name
  "(Reapr)". First produced by Bill Buchmann. "The Reaper ball python is
  a morph with typical features of a granite type morph with orange right
  behind the head, a striped neck and dots behind the head." Rpr/Rpr =
  Super Reaper. Independently confirmed as its own distinct locus (own
  Complex/breeder), NOT to be confused with Super Grim's "grimreaper"
  nickname (batch 14 caution note) — no changes needed to the existing
  Grim entry.
- **Static** (`stc`) — Base Morph, site labels Genetics "Dominant",
  confirmed distinct "Super Static" page, alt-name "(Statc)". First
  produced by Fred Kick in 2008. "Static is a granite like Morph, that is
  likely to be similar to Acid and Confusion." Stc/Stc = Super Static.
  Same granite-family caveat as Kosmos/Reaper above — kept as its own
  separate locus (the site treats each as its own distinct Base
  Morph/Complex with no stated shared-locus relationship).
- **Trojan** (`trj`) — Base Morph, Incomplete dominant, alt-name
  "(Trojn)". First produced by Major League Reptile. "The Trojan ball
  python morph has alien heads and an intense orange color." Trj/Trj =
  Super Trojan.
- **Wookie** (`wke`) — Base Morph, Incomplete dominant, alt-name
  "(Wokie)". First produced by The Herp Vault in 2013. Has its own genetic
  test named "Wookie" (matches its own name, no ambiguity). "The Wookie
  ball python has a dark appearance, reduced alien heads and also smaller
  in size and intense flaming." Wke/Wke = Super Wookie. This unblocks the
  previously-flagged "Saar - Wookie"/"Bongo - Wookie" combo candidates —
  still NOT added as confirmed combo aliases this batch since no explicit
  Description-field composition was found for either (only inferred from
  page titles); left as a note for future verification.
- **Zuwadi** (`zwd`) — Base Morph, Incomplete dominant, alt-name
  "(Zuwad)". First produced by Visionary Exotics. "The Zuwadi ball python
  is a morph with a striped neck, dots behind the head and pixilated
  alien heads." Zwd/Zwd = Super Zuwadi.

Verified via a throwaway 21-test script (21/21 passed — het + homo for
each of the 9 new genes, plus the "Blitz Trick" combo alias).
`get_errors` confirmed clean on `ballPythonPhenotypeRules.js` and
`GeneticCodeBuilder.jsx`.

### Batch 17 (2026-08-29) — Mario, Peach, Raven, Sugar, Vanta, Vudoo, Zebra, Mosaic, Sahara, Rainbow

- **Mario** (`mar`) — Base Morph, Incomplete dominant, alt-name "(Mari)".
  First produced by Sabala Serpents And Mike Wonka in 2012 (base page)/2016
  (Super Mario page — same breeder credited both times, differing years,
  not a blocker). "Mario has a golden colour with sharp flames and white
  lining around those flames. It looks similar to Jungle woma" (Jungle
  Woma not on the gap list — flagged as a note only). Mar/Mar = Super
  Mario.
- **Peach** (`pch`) — Base Morph, Incomplete dominant, alt-name "(Pech)".
  First produced by Justin Kobylka. "The peach ball python morph has a
  more orange appearance and reduction of the alien heads." Pch/Pch =
  Super Peach.
- **Raven** (`rvn`) — Base Morph, Incomplete dominant, alt-name "(Ravn)".
  First produced by Ben Cole in 2011. "The Raven ball python morph often
  has a black back, additional spotting and an overal darker appearance"
  — word-for-word identical Description to Satin's (`sat`, batch 16), but
  different breeder/Complex — kept as its own separate locus, same
  "convergent family" pattern as the granite genes. Rvn/Rvn = Super Raven.
- **Sugar** (`sgr`) — Base Morph, site labels Genetics "Dominant",
  confirmed distinct "Super Sugar" page, alt-name "(Sugr)". First
  produced by Ryv Reptiles. "The Sugar ball python morph has a genetic
  black back and usually white speckling on the sides, especially when
  combined with Pastel. It's probably the same as Calico." This hedged
  "probably the same as" claim is weaker than the unhedged "genetically
  identical to"/"proven identical" language that triggered the Trick =
  Hurricane and Saar = Chocolate collapses — Sugar is kept as its own
  separate locus, NOT merged into Calico (`cal`, batch 13). Sgr/Sgr =
  Super Sugar.
- **Vanta** (`vnt`) — Base Morph, **Recessive** (first Recessive
  additions since batch 11's Cryptic/Migraine). First produced by Jurgen
  Wuyts, Proherper. No alt-name paragraph shown, no genetic test. "The
  Vanta ball python is a reduced pattern morph and has a darker
  appearance. It resembles Zebra, but is genetically different" — an
  explicit site confirmation of distinctness from Zebra (`zbr`, below).
  vnt/vnt = Vanta. No Super Vanta page (not expected for a Recessive
  gene under this codebase's homozygous-only convention).
- **Vudoo** (`vdo`) — Base Morph, Incomplete dominant, alt-name "(Vudo)".
  First produced by Bob Vu. "The Vudoo ball python is a morph with a
  striped neck, dots behind the head and pixilated alien heads" —
  word-for-word identical Description to Zuwadi's (`zwd`, batch 16), but
  different breeder/Complex — kept as its own separate locus. Vdo/Vdo =
  Super Vudoo.
- **Zebra** (`zbr`) — Base Morph, **Recessive**, alt-name "(Zebr)". First
  produced by Steve Roussis/Roussis Reptiles and Adam Chesla/Chesla
  Reptiles. Has its own genetic test named "Zebra" (matches its own
  name). "The Zebra ball python is a reduced pattern morph and has a
  darker appearance." Confirmed distinct from Vanta per Vanta's own page
  (see above). zbr/zbr = Zebra. No Super Zebra page found (consistent
  with the Recessive convention).
- **Mosaic** (`mos`) — Base Morph, Incomplete dominant. First produced by
  Bradford Cole Herpteculture Inc. "Mosaic often have a dorsal stripe
  with a brighter appearance. The alien heads are outlined with dark
  black and white lined flames." Mos/Mos = Super Mosaic.
- **Sahara** (`shr`) — Base Morph, **Recessive**, alt-name "(Sahar)".
  First produced by Eb Noah. "The Sahara ball python morph is a bright
  morph that also get better looking and brighter as it ages. It is very
  similar to Desert ghost, and expected to be the same genetically." This
  hedged "expected to be the same" claim is judged the same weight class
  as Sugar's "probably the same as Calico" (not the unhedged "proven
  identical" wording used for actual collapses) — Sahara is kept as its
  own separate locus, NOT merged into Desert Ghost (`dg`). shr/shr =
  Sahara. No Super Sahara page (Recessive convention).
- **Rainbow** (`rbw`) — Base Morph, **Recessive**, alt-name "(Rainbw)".
  First produced by Herman Van Hellem, Albinoreptiles, in 2015. Has its
  own genetic test named "Rainbow (NEW!)". "The Rainbow ball python is a
  type of albino and has incredible orange, purple tones." Despite being
  described as "a type of albino," Rainbow has its OWN distinct genetic
  test (different from Albino/Candy's test) — modeled as its own
  NON-complementary standalone locus, same treatment as Lavender Albino
  (`lav`)/Red Axanthic (`rax`) vs. their base genes, NOT folded into the
  `albCdy` multi-allelic locus. rbw/rbw = Rainbow. No Super Rainbow page
  (Recessive convention).

Verified via a throwaway 20-test script (20/20 passed — het + homo/homo
phenotype resolution for all 10 new genes, plus carrier checks for the
4 new Recessive loci). `get_errors` confirmed clean on
`ballPythonPhenotypeRules.js` and `GeneticCodeBuilder.jsx`.

All 8 gap-list names from batch 17's "Remaining ~17 confirmed/unverified
gaps" list were coded in batch 18 below, closing out this list.

### Batch 18 (2026-08-29) — Red Gene, Redhead, Striker, Taronja, Mckenzie, Sentinel, Speckled, Stranger, Paint, Nanny (+ Puma combo)

Coded the final 8 gap-list names PLUS resolved 3 long-standing loose
ends (Paint, Nanny, Puma) that were flagged for individual checking at
the end of batch 17. All research done via worldofballpythons.com
before any code was written, per the established workflow.

- **Red Gene** (`rgn`) — Base Morph, Dominant (site label; has a
  distinct Super name so modeled the same as the Incomplete Dominant
  genes), alt-names "(Rg, Redgene)". No First Produced By credit listed.
  "The Red gene ball python morph has a more darker orange look and
  often pops up in Black head combo's." Rgn/Rgn = Super Red Gene.
- **Redhead** (`rhd`) — Base Morph, Incomplete dominant, alt-names
  "(Rh, Red Head, Red Hed)". First produced by The Mad Baller in 2013.
  "The Redhead ball python morph is a high contrast animal, with
  distinct black background coloration and gold or rust colored
  patterning, white lines around the alien heads and a granite like
  neck pattern." Rhd/Rhd = Super Redhead.
- **Striker** (`stk`) — Base Morph, Incomplete dominant, alt-name
  "(Strikr)". First produced by Ball Python Morphs Co Za. "The Striker
  ball python morph has stretched out alien heads. The super resembles
  Zebra but is genetically distinct." This explicit "genetically
  distinct" language confirms non-identity with Zebra (`zbr`, batch
  17) — kept as its own separate locus, same tier-2 hedge treatment as
  Vanta/Zebra. Stk/Stk = Super Striker.
- **Taronja** (`tar`) — Base Morph, Incomplete dominant, alt-name
  "(Taronj)". First produced by Freek Nuyt in 2006. "The Taronja ball
  python morph has a reduced pattern, black back and intense orange
  color." Tar/Tar = Super Taronja.
- **Mckenzie** (`mck`) — Base Morph, Incomplete dominant, alt-names
  "(Mckenzi, Mckenzy, Mc Kenzie)". No First Produced By credit listed.
  "McKenzie has a brighter look with a typical Fire headstamp. However,
  the super is very different from a Super Fire." Explicit "very
  different" language confirms non-identity with Fire (`fi`) — kept
  separate. Mck/Mck = Super Mckenzie.
- **Stranger** (`stg`) — Base Morph, Dominant (site label; has a
  distinct Super name), alt-name "(Strangr)". First produced by Roland
  Van Den Oever/Ires in 2012. "The stranger ball python morph has a
  dark appearance, with large, white pixilated alien heads and a
  dorsal stripe." Stg/Stg = Super Stranger.
- **Sentinel** (`snt`) — Base Morph, **Recessive**, alt-name
  "(Sentinl)". First produced by Ben Siegel/Ben Siegal Reptiles Inc in
  2010. "The Sentinel ball python is a spectacular dark morph with
  strong dorsal striping, pixelated alien heads and intense blushings.
  Suspected to be the same or allelic with Paint." snt/snt = Sentinel.
  No Super Sentinel page (Recessive convention).
- **Speckled** (`spd` — NOT `spk`, already taken by Spark, batch 13) —
  Base Morph, **Recessive**, alt-name "(Speckld)". First produced by
  Mark Haas in 2007. Description word-for-word identical to Sentinel's
  (minus capitalization of the opening word), including "suspected to
  be the same or allelic with Paint." spd/spd = Speckled. No Super
  Speckled page (Recessive convention).
- **Paint** (`pnt`) — Mutation tagged "Designer Morph" but Genetics
  explicitly "Recessive" (same mistagged-Mutation-field quirk as
  Gobi/Creme/Nanny). First produced by Charles Glaspie in 2008. "The
  Paint ball python is a spectacular dark morph with strong dorsal
  striping, pixelated alien heads and intense blushings." (near-
  identical opening to Sentinel/Speckled's Descriptions, minus their
  "suspected... allelic" sentence). pnt/pnt = Paint. No Super Paint
  page (Recessive).
- **Nanny** (`nny`) — Mutation tagged "Designer Morph" but Genetics
  explicitly "Incomplete dominant" (same mistagged-Mutation-field quirk
  as Gobi/Creme). First produced by Herps Etc Reptiles in 2011. "A
  granite type morph." Confirmed matching Super Nanny page (same
  breeder/year, Complex "Super Nanny", Incomplete dominant). Nny/Nny =
  Super Nanny.
- **Puma** — NOT coded as a standalone locus. Mutation "Designer
  Morph", Incomplete dominant, first produced by Amir Soleymani in
  2007. Alt-names list every permutation of "Spark Yellow Belly".
  Description explicitly states: "An exceptionally good looking snake
  that is produced by combining Spark and Yellow belly." Added as a
  new `BALL_PYTHON_COMBO_ALIASES` entry (Spark `spk` + Yellow Belly
  `yb` = "Puma"), resolving a note that had existed in the `spk`
  locus metadata comment since batch 13.

Sentinel/Speckled/Paint's shared "suspected to be the same or allelic"
claim is a hedged, unconfirmed statement (tier-3 hedge — not "proven"/
"identical") — per the established precedent (Sugar/Calico,
Sahara/Desert Ghost, batch 17), all three are modeled as 3 fully
separate Recessive loci, not merged. The "Super Adder" (Colin Thomas
lineage) ambiguity from batch 15 was re-checked this batch via
`/en/morphs/super-adder` — no new information was found on WOBP alone.

**Post-batch addendum (2026-08-29) — Super Adder resolved via external
cross-reference**: at the user's explicit direction, MorphMarket's
Morphpedia was consulted as a tie-breaker (the only case in this project
where a second source was used instead of relying on WOBP alone).
MorphMarket's official "Adder" wiki page lists "Aliases: Black Adder" —
confirming Adder (Colin Thomas, 2006) and Black Adder (`bad`, Regius
Club, 2006) are the SAME gene, not independent mutations. This resolves
the ambiguity: WOBP's "Super Adder" (Colin Thomas) and "Super Black
Adder" (Regius Club) pages are rival-attribution duplicates for the same
homozygous phenotype already modeled as `bad`'s `Bad/Bad` = "Super Black
Adder" — NOT a distinct unmodeled gene. No new locus was added; `bad`'s
`BALL_PYTHON_GENE_LOCI` metadata comment was updated to record this
resolution, and the flag was removed from
`BALL_PYTHON_UNVERIFIED_COMBO_CANDIDATES.md`.

Verified via a throwaway 21-test script (21/21 passed — het + homo/homo
phenotype resolution for the 7 Incomplete Dominant/Dominant-with-Super
genes, homo-only + carrier checks for the 3 new Recessive genes, plus
the new Puma combo alias). `get_errors` confirmed clean on
`ballPythonPhenotypeRules.js` and `GeneticCodeBuilder.jsx`.

This closes out the entire confirmed gap list first identified at the
start of this project (batches 13-18, 2026-08-29) — every gap-list name
has now been individually researched and either coded as its own
locus, resolved as a synonym/combo, or left deliberately excluded with
a documented reason (Fader, Disco Vanilla, Mocha Mojave — see
`BALL_PYTHON_UNVERIFIED_COMBO_CANDIDATES.md`). With the Super Adder
addendum above, there are no remaining open ambiguities from the
original gap-list audit.

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
| Mojave (het/homo) + Pastel (het/homo) | Pastave (**CORRECTED 2026-08-28** — was previously miscoded as Pastel + Puzzle; WOBP's own page confirms subtitle "(Mojave Pastel)". Pastel + Puzzle has its own separate, plain-named "Pastel Puzzle" WOBP page instead — no alias needed, default stacking handles it) |
| Specter (het) + Yellow Belly (het) | Super Stripe (batch 5, confirmed via worldofballpythons.com) |
| Gravel (het) + Yellow Belly (het) | Highway (batch 5, confirmed via worldofballpythons.com) |
| Russo (het) + Special (het) | The Diamond (batch 5, confirmed via worldofballpythons.com) |
| Mojave (het/homo) + Special (het/homo) | Crystal (Blue-Eyed Leucistic) (batch 6, confirmed via worldofballpythons.com; BEL note added 2026-08-29) |
| Mojave (het/homo) + Mystic (het/homo) | Mystic Potion (Blue-Eyed Leucistic) (batch 6, confirmed via worldofballpythons.com; BEL note added 2026-08-29) |
| Russo (het/homo) + Phantom (het/homo) | Opal Diamond (Blue-Eyed Leucistic) (batch 7, confirmed via worldofballpythons.com; BEL note added 2026-08-29) |
| Honey (het/homo) + Russo (het/homo) | Cassandra (Blue-Eyed Leucistic) (batch 7, confirmed via worldofballpythons.com; BEL note added 2026-08-29) |
| Honey (het/homo) + Phantom (het/homo) | Leche (Blue-Eyed Leucistic) (batch 10, confirmed via worldofballpythons.com; BEL note added 2026-08-29) |
| Honey (het/homo) + Mojave (het/homo) | Mohoney (Blue-Eyed Leucistic) (added 2026-08-29, confirmed via worldofballpythons.com's own Mohoney page: "This blue eyed leucistic is the combination of Mojave and Honey" — cross-referenced against MorphMarket's Honey wiki page, which independently lists Mojave under Honey's "Related Traits" and tags Honey as part of the "Blue Eyed Leucistic (BluEL)" complex) |
| Chocolate/Saar (het/homo) + Wookie (het/homo) | Saar Wookie (added 2026-08-29, combo scoping pass — composition inferred from correctly-loading page title, 404 body, same site-bug pattern as several batch 10-12 entries) |
| Bongo (het/homo) + Wookie (het/homo) | Bongo Wookie (added 2026-08-29, combo scoping pass — same title-inference pattern as Saar Wookie) |
| Disco (het/homo) + Vanilla (het/homo) | Disco Vanilla (Black-Eyed Leucistic) (added 2026-08-29, combo scoping pass — confirmed Allelic combo, own Complex "Disco Vanilla", Description: "This is a striking combo from the Black eyed leucistic complex." This is a DIFFERENT named complex from the core Blue-Eyed Leucistic complex, not a typo — see BALL_PYTHON_UNVERIFIED_COMBO_CANDIDATES.md for the full resolution) |
| Butter (het) + Calico (het/homo) + Super Pastel (homo only) + Pinstripe (het/homo) | Angel (added 2026-08-29, combo scoping pass — confirmed via own page subtitle "(Butter Calico Super Pastel Pinstripe)") |
| Albino (homo) + Desert (het/homo) + Enchi (het/homo) | Albino Tiger (added 2026-08-29, combo scoping pass — confirmed via own page subtitle "(Albino Desert Enchi)") |
| Desert (het/homo) + Lesser (het) + Pinstripe (het/homo) + Yellow Belly (het/homo) | Angel Dust (added 2026-08-29, combo scoping pass — confirmed via own page subtitle "(Desert Lesser Pinstripe Yellow Belly)") |
| Black Head (het/homo) + Chocolate/Saar (het/homo) | Black Head Chocolate (added 2026-08-29, combo scoping pass — title-inference pattern; "Black Head - Saar" is the same combo, page-duplicate synonym) |
| Black Head (het/homo) + Bongo (het/homo) | Black Head Bongo (added 2026-08-29, combo scoping pass — title-inference pattern) |
| Black Head (het/homo) + Sable (het/homo) | Black Head Sable (added 2026-08-29, combo scoping pass — title-inference pattern) |
| Black Head (het/homo) + Spider | Black Head Spider (added 2026-08-29, combo scoping pass — confirmed via full page load, first produced by Ralph Davis Reptiles 2005) |
| Black Head (het/homo) + Wookie (het/homo) | Black Head Wookie (added 2026-08-29, combo scoping pass — title-inference pattern) |
| Black Head (het/homo) + Spotnose (het/homo) | Black Head Spotnose (added 2026-08-29, combo scoping pass — title-inference pattern) |
| Black Head (het/homo) + Champagne | Black Head Champagne (added 2026-08-29, combo scoping pass — title-inference pattern; Champagne is homozygous lethal so only the het form applies) |
| Black Head (het/homo) + Woma (het/homo) | Black Head Hidden Gene Woma (added 2026-08-29, combo scoping pass — title-inference pattern) |
| Black Head (het/homo) + Cinnamon + Pastel (het/homo) | 50 Shades Of Grey (added 2026-08-29, combo scoping pass — confirmed via own page subtitle "(Pewter Black Head, Black Head Cinnamon Pastel)"; now that Pewter is modeled (see row below), this confirms the two alt-names are equivalent; the Pewter rule is positioned before this one so it can be subsumed) |
| Enchi (het/homo) + Spider | Stinger Bee (added 2026-08-29, combo scoping pass — confirmed via "Krg Pepper Back"'s own subtitle equating "Kalabash Reduction Gene Enchi Spider" with "Kalabash Reduction Stinger Bee") |
| Krg (het/homo) + Enchi (het/homo) + Spider | Krg Pepper Back (added 2026-08-29, combo scoping pass — confirmed via own page subtitle "(Kalabash Reduction Gene Enchi Spider, Kalabash Reduction Stinger Bee)") |
| Spark (het) + Yellow Belly (het) | Puma (added 2026-08-29, combo scoping pass — confirmed via own page Description: "produced by combining Spark and Yellow belly") |
| Red Axanthic (het carrier) + Mojave (het) + Vanilla (het) | Dota (added 2026-08-29, batch-14 combo scoping — confirmed via own page subtitle "(Het Red Axanthic Mojave Vanilla)") |
| Fire (het) + Pastel (het) + Web (het) | Firefly Web (added 2026-08-29, batch-14 combo scoping — confirmed via own page subtitle "(Fire Pastel Web)") |
| Spider + Spotnose (het/homo) | Spotted Web (added 2026-08-29, batch-14 combo scoping — confirmed via own page subtitle "(Spider Spotnose)"; does NOT involve the `web` locus despite the name) |
| Acid (het) + Black Pastel (`cinBp`='Bp/n') | Black Acid (added 2026-08-29, batch-14 combo scoping — confirmed via own page subtitle "(Acid Black Pastel)") |
| Cafe (het) + Mojave (het) | Barista (added 2026-08-29, batch-14 combo scoping — confirmed via own page subtitle "(Cafe Mojave)" + full Description) |
| Cafe (het) + Pastel (het) | Decaf (added 2026-08-29, batch-14 combo scoping — confirmed via own page subtitle "(Cafe Pastel)" + full Description) |
| Butter (het) + Cinnamon (`cinBp`='Cin/n') + Fire (het) + Pastel (het) | Lithium Blaze (added 2026-08-29, batch-15 combo scoping — confirmed via own page subtitle "(Butter Cinnamon Fire Pastel)"; does NOT involve the `blz` locus despite the name) |
| Sable (het/homo) + Wookie (het/homo) | Sable Wookie (added 2026-08-29, batch-16 combo scoping — title-inference pattern, same as Saar Wookie/Bongo Wookie) |
| Spider + Wookie (het/homo) | Spider Wookie (added 2026-08-29, batch-16 combo scoping — title-inference pattern) |
| Spotnose (het/homo) + Wookie (het/homo) | Spotnose Wookie (added 2026-08-29, batch-16 combo scoping — title-inference pattern) |
| Woma (het/homo) + Wookie (het/homo) | Hidden Gene Woma Wookie (added 2026-08-29, batch-16 combo scoping — title-inference pattern) |
| Static (het/homo) + Pastel (het/homo) + Yellow Belly (het/homo) | Static Electricity (added 2026-08-29, batch-16 combo scoping — confirmed via own page subtitle "(Static Pastel Yellow Belly)"; Genetics field is N/A but subtitle is sufficient per established convention) |
| Super Russo (`Rus/Rus`) + Taronja (het/homo) | Peach Diamond (added 2026-08-29, batch-17 combo scoping — confirmed via own page subtitle "(Super Russo Taronja)"; does NOT involve Peach despite the name) |
| Leopard (homo) + Woma (het/homo) | Ravenclaw (added 2026-08-29, batch-17 combo scoping — confirmed via own page subtitle "(Leopard Woma)"; does NOT involve Raven despite being surfaced by a Raven search; "Butter Ravenclaw" needs no separate rule, default stacking suffices) |
| Fire (het) + Sugar (het) + Super Pastel (`Pas/Pas`) | Brown Sugar (added 2026-08-29, batch-17 combo scoping — confirmed via own page subtitle "(Fire Sugar Super Pastel)") |
| Butter (het) + Sugar (het) + Woma (het/homo) | Bubi Ball (added 2026-08-29, batch-17 combo scoping — confirmed via own page subtitle "(Butter Sugar Woma)") |
| Zebra (homo) + Pastel (het/homo) | Killer Zebra (added 2026-08-29, batch-17 combo scoping — confirmed via own page subtitle "(Super Zebra Pastel)") |
| Redhead (het) + Pastel (het) + Spider | Red Bee (added 2026-08-29, batch-18 combo scoping — confirmed via own page subtitle "(Redhead Pastel Spider, Redhead Bumble Bee)"; positioned after Red Widow/Bumblebee so it subsumes both simpler aliases) |
| Redhead (het) + Spotnose (het) | Red Spot (added 2026-08-29, batch-18 combo scoping — confirmed via own page subtitle "(Redhead Spotnose)") |
| Redhead (het) + Spider | Red Widow (added 2026-08-29, batch-18 combo scoping — confirmed via own page subtitle "(Redhead Spider)") |
| Taronja (het) + Russo (het) + Pastel (het) | Taronja Citrine (added 2026-08-29, batch-18 combo scoping — confirmed via own page subtitle "(Taronja Russo Het Leucistic Pastel)"; "Russo Het Leucistic" is this site's alt name for het Russo) |
| Fire (het) + Spider + Taronja (het) | Luca Ball (added 2026-08-29, batch-18 combo scoping — confirmed via own page subtitle "(Fire Spider Taronja)") |
| Super Sentinel (`snt/snt`) + Yellow Belly (het) | Morpheus (added 2026-08-29, batch-18 combo scoping — confirmed via own page subtitle "(Super Sentinel Yellow Belly)"; Sentinel is Recessive/homo-only so "Super Sentinel" = homozygous) |
| Calico (het) + Super Paint (`pnt/pnt`) | Graffiti (added 2026-08-29, batch-18 combo scoping — confirmed via own page subtitle "(Calico Super Paint)"; Paint is Recessive/homo-only so "Super Paint" = homozygous) |
| Cinnamon (`cinBp`='Cin/n') + Pastel (het/homo) | Pewter (added 2026-08-28 - WOBP's own page has NO subtitle/Description (Genetics: N/A); confirmed instead via external cross-reference: MorphMarket structured combo data + Graziani Reptiles' own breeder history + Ralph Davis Reptiles + Northwest Reptiles, same one-time exception precedent as Adder/Black Adder; "Black Pastel + Pastel" is the separately-named, unmodeled "Black Pewter" combo, NOT the same thing) |
| Black Pastel (`cinBp`='Bp/n') + Pastel (het/homo) | Black Pewter (added 2026-08-28 - same external cross-reference as Pewter, WOBP page also has no subtitle/Description; distinct from Pewter since Cinnamon and Black Pastel are different alleles of the `cinBp` locus) |
| Pastel (het) + Spider + Lesser (het) | Queen Bee (added 2026-08-28 — confirmed via "Spotnose Queen Bee"'s own page subtitle "(Pastel Spotnose Spider Lesser)"; original candidate-table guess of "Mojave" as the third gene was wrong, corrected to Lesser via external research) |
| Leopard (homo) + Spotnose (het/homo) + Stranger (het/homo) | Crimson Spice (added 2026-08-28 — own page title "Leopard Ball Spotnose Stranger" has the H1/subtitle reversed from the usual pattern; "Ball" is not a gene, independently confirmed via Delta7 Ball Python's breeder blog captioning the same combo "Crimson Spice aka Leopard Spotnose Stranger") |
| Russo (het) + Het Daddy (het) | Russo Het Daddy (added 2026-08-28 — default trait stacking, no alias rule needed; Russo is BEL-adjacent, not a true BEL_COMPLEX_MEMBERS locus) |
| Mystic (het) + Het Daddy (het) | Mystic Het Daddy (added 2026-08-28 — same as Russo Het Daddy, default stacking) |
| Phantom (het) + Het Daddy (het) | Blue-Eyed Leucistic (added 2026-08-28 — both true BEL_COMPLEX_MEMBERS, auto-collapses via existing `belComplexName()`, no new code) |
| Huffman (het/homo) + Jolt (het/homo) | Huffman Jolt (added 2026-08-28 — composition inferred from title, combo page 404s) |
| Huffman (het/homo) + Lori (het/homo) | Huffman Lori (added 2026-08-28 — same title-loads/body-404 pattern) |
| Cypress (het/homo) + Chocolate/Saar (het/homo) | Cypress Saar (added 2026-08-28 — composition inferred from title) |
| Black Head (het/homo) + Cypress (het/homo) | Black Head Cypress (added 2026-08-28) |
| Cypress (het/homo) + Wookie (het/homo) | Cypress Wookie (added 2026-08-28) |
| Granite (het) + Hidden Gene Woma (het) + Lesser (het) + Nova (het) + Pastel (het) | Soul Reaper (added 2026-08-28 — own subtitle "(Granite Hidden Gene Woma Lesser Nova Pastel)", Designer Morph/Genetics N/A but subtitle present) |
| Acid (het/homo) + Pastel (het/homo) | Lemon Drop (added 2026-08-28 — WOBP's own subtitle says "(Acid Lemon Pastel)" but "Lemon" is not a real gene, independently confirmed via MorphMarket's own Acid page listing only 2 traits: Pastel + Acid) |
| Pastel (het/homo) + Pinstripe (het/homo) | Lemon Blast (added 2026-08-28 — own WOBP page undocumented (Genetics: N/A), independently cross-referenced via MorphMarket's own Pastel Morphpedia page, same method as Pewter/Black Pewter/Queen Bee) |
| Orange Belly (het/homo) + Redhead (het/homo) | Ob Redhead (added 2026-08-28 — own subtitle "(Orange Belly Redhead)"; "Orange Belly" confirmed real via WOBP's own dedicated page with distinct Complex field, modeled as independent standalone locus per the Cypress precedent) |

**Note**: this table only tracks a representative history of combo aliases
added batch-by-batch — `BALL_PYTHON_COMBO_ALIASES` in
`ballPythonPhenotypeRules.js` is the canonical, complete, up-to-date list
(~96 entries as of 2026-08-28, after the FINAL batch-18 combo-scoping
pass plus externally/independently-confirmed additions: Pewter, Black
Pewter, Queen Bee, Crimson Spice, Huffman Jolt/Lori, Cypress Saar/Black
Head Cypress/Cypress Wookie, Soul Reaper, Lemon Drop, and Lemon Blast)
and should always be checked
directly for the full current set.

**Not attempted**: the hundreds of other recognized combo names (Mojave
Fire, Enchi Pastel variants, etc.) — low confidence on the
exact required zygosity/gene pairs for most of these without an external
reference to verify against. If a reliable source list is available,
more can be added the same way (a `{requires, remove, alias}` rule).
(Lemonback was investigated as a possible combo candidate but turned out
to be a standalone Incomplete Dominant gene instead — see its entry in
the main locus table above and the `lmb` locus.)

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
