# Litter UI: Species-Specific Field Labels and Visibility

This document maps proposed **UI-only** label and visibility changes for litter and offspring screens. It does not propose changing stored field names, API payloads, or genetics calculations.

## Appearance fields

The offspring appearance fields currently include Color, Markings, Coat, Earset, Eye Color, and Body. The same underlying fields can be displayed with species-appropriate labels.

| Species or category | Color | Markings | Coat | Earset | Eye Color | Body |
| --- | --- | --- | --- | --- | --- | --- |
| Fancy Mouse | Color | Markings | Coat type | Hide | Eye color | Body |
| Fancy Rat | Color | Markings | Coat type | Earset | Eye color | Body |
| Syrian, Campbell's Dwarf, and Russian Dwarf Hamsters | Color | Markings | Coat type | Hide | Eye color | Body |
| Ball Python and other reptiles | Morph | Scale pattern | Scalation | Hide | Eye color | Review whether useful |
| Birds | Color | Plumage pattern | Plumage | Hide | Eye color | Body |
| Amphibians | Morph | Skin pattern | Skin | Hide | Eye color | Review whether useful |
| Fish | Morph | Pattern | Skin | Hide | Eye color | Review whether useful |
| Invertebrates | Morph | Pattern | Coloring | Hide | Eye color | Review whether useful |

For broad categories, use wording appropriate to the individual species where possible. In particular, "Skin" may not be the best label for every fish or invertebrate; "Coloring" and "Pattern" are more general alternatives.

## Reproduction and litter terminology

Egg-laying species should use terminology that describes laying and hatching rather than mammalian pregnancy and birth.

| Current label or field | Birds | Reptiles, fish, amphibians, and invertebrates |
| --- | --- | --- |
| Expected due date | Expected hatch date | Expected hatch date; consider species-specific terms where appropriate |
| Birth date | Hatch date | Hatch date |
| Stillborn | Unhatched / non-viable eggs | Unhatched / non-viable eggs |
| Birth method | Laying method | Laying method |
| Weaned / weaning date | Fledged / independent; keep only where applicable | Hide mammal-specific weaning UI |
| Pregnancy lost | Review / replace with an egg or clutch outcome | Hide mammal-specific pregnancy-loss UI |
| Nursing status and fields | Hide mammal-specific nursing UI | Hide mammal-specific nursing UI |

Egg terminology varies: an egg sac, ootheca, clutch, or brood may be more accurate depending on species. Prefer species-specific wording when the UI has enough information to provide it; avoid implying that all species lay eggs in the same way.

Counts and post-hatch losses can remain useful. Prefer adapting their labels (for example, clutch or brood count) over disabling them solely because the species is not a mammal.

## Genetics-supported species

The currently mapped offspring genetics species are Fancy Mouse, Fancy Rat, Syrian Hamster, Campbell's Dwarf Hamster, Russian Dwarf Hamster, and Ball Python.

- Rodent appearance labels can remain largely unchanged.
- Show Earset for Fancy Rats only; hide it for mice and hamsters.
- Ball Python appearance fields should use reptile terminology: Morph, Scale pattern, and Scalation. Hide Earset; review whether Body is useful. Eye Color can remain.

## UI surfaces to update

- `src/components/Litter/details/GeneticsTab.jsx` — observed appearance fields used by confirmed traits and genetic discoveries.
- `src/components/Litter/details/OffspringTab.jsx` — appearance summary on offspring cards.
- `src/components/Litter/details/AddOffspringModal.jsx` — quick-add appearance inputs.
- `src/components/Litter/editor/sections/StatsSection.jsx` — offspring, stillborn, loss, and weaned counts.
- `src/components/Litter/editor/sections/DatesReproductionSection.jsx` — due, birth/hatch, and weaning dates.
- `src/components/Litter/editor/sections/MatingBirthSection.jsx` — mating, birth/laying, and weaning information.
- `src/utils/speciesFieldTemplates.js` — existing animal-form category label and hidden-field conventions that may be reused.

## Implementation notes

- Keep underlying field names and persisted data unchanged; change visible labels and conditional rendering only.
- Resolve the species from the litter and, where needed, assigned parents.
- Use a shared species-aware label/visibility helper rather than maintaining separate wording rules in each screen.
- Hide fields only when they are not meaningful for the species; do not hide counts or observations that remain useful under a better label.
- Add UI tests for representative mammals, Ball Python, and at least one egg-laying species outside the currently mapped genetics species.
