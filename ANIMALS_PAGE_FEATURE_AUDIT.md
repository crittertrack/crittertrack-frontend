# Animals Page Feature Audit

## Purpose
Document the current feature coverage for the Animals page redesign in `crittertrack-frontend`, including:
- features already present and can remain as-is,
- features present but requiring modification,
- features that need to be built,
- features that should be removed from the Animals page.

This audit is scoped to the Animals page experience and related workflows that should be surfaced or linked from it.

---

## 1. Features already present and can stay as-is

### Core Animals list and filters
- `crittertrack-frontend/src/components/AnimalList/index.jsx` already contains the main My Animals list.
- Existing search, status filters, gender filters, breeding line filters, species filtering, public/private toggles, and owned/unowned toggles are implemented.
- Card view and list/table view are both supported.
- The current list already includes row-level controls, animal selection, and bulk actions hooks.
- Sorting by default fields exists in the list implementation even if name/age sorting is not fully surfaced yet.
- Animal detail navigation is already wired into the list via `onViewAnimal` / `onEditAnimal` callbacks, so the Animals page can link directly into detail workflows.

### Management view infrastructure
- `AnimalList/index.jsx` already supports management subviews keyed by `animalView`: `collections`, `enclosures`, `reproduction`, `health`, `feeding`.
- Management sections already exist as collapsible panels with dedicated UI for each workflow.
- The tab system and default-view persistence are already built.
- `PrivateAnimalDetail.jsx` and `ViewOnlyPrivateAnimalDetail.jsx` already provide rich animal detail experiences, including Health, Care, Fertility, Pedigree, Family, Offspring & Litters, and Enclosure info.
- All Animals page subviews should be viewed as summaries or navigational hubs; animal-specific detail data for medical records, treatments, care tasks, reproduction history, feeding schedules, and housing should ultimately come from the animal detail model.

### Enclosure management
- Enclosure CRUD is implemented in `AnimalList/index.jsx` with:
  - create/edit/delete enclosure forms,
  - assign/unassign animals to enclosures,
  - enclosure task tracking and completion.
- Enclosures are grouped by purpose: general, reproduction, and health.
- Enclosure maps are already created and used to render occupant cards.

### Reproduction status tracking
- `AnimalList/index.jsx` already tracks animal reproductive statuses via `isInMating`, `isPregnant`, and `isNursing`.
- Quick action buttons already exist to move animals from mating → pregnant → nursing → clear.
- Reproduction cards are shown inside reproduction enclosures and in unassigned reproduction lists.
- The underlying state update logic is implemented via `handleReproStatusUpdate`.

### Health / medical management
- `AnimalList/index.jsx` already has a Medical/Quarantine section with:
  - quarantine and treatment animal groups,
  - health enclosure grouping,
  - condition/medication displays,
  - `handleUnquarantine` and `handleDischargeTreatment` actions.
- Health-related animals can already be shown in dedicated health enclosures or unassigned groups.

### Feeding / care workflows
- Feeding schedule and animal care task UI are already built in `AnimalList/index.jsx`.
- Tasks show due/ok/no schedule groupings.
- Actions exist for `Mark Fed`, `Skip`, `Done`, and `Skip` on care tasks.
- Enclosure cleaning tasks and maintenance tracking are also present.
- Nutrition, care tasks, and housing details should use animal detail fields such as `feedingSchedule`, `animalCareTasks`, `careTasks`, `housingType`, `bedding`, `enrichment`, and related medical/care fields rather than separate list-level state.

### Archive and duplicates utility screens
- `ArchiveScreen.jsx` provides a working archive UI with sold/transferred animals and unarchive actions.
- `AnimalList/index.jsx` already toggles `showArchiveScreen` and `showDuplicatesScreen`.
- Duplicate group detection and rendering exist in AnimalList.

### Litter and mating workflow
- `crittertrack-frontend/src/components/LitterManagement/index.jsx` contains the full litter management flow and mating quick-add logic.
- Mating creation, editing, litter linking, offspring management, and COI calculation are already implemented.
- The existing litter workflow is the correct downstream place for detailed breeding management.

### Supplies and inventory
- `crittertrack-frontend/src/components/SuppliesPage.jsx` exists as a separate page.
- Supplies data is already used in feeding forms and supply-related workflows.

### Family tree and pedigree views
- `crittertrack-frontend/src/components/tools/FamilyTreePage.jsx` and `src/components/FamilyTree/FamilyTreeView.jsx` provide family tree functionality.
- The AnimalList route includes a `familyTree` view option.

### Community favorites / breeder signals
- `crittertrack-frontend/src/components/Community/MyFeed.jsx` already supports:
  - favorite animals,
  - favorite breeders,
  - recently updated favorite animals,
  - available animals from favorited breeders.
- This data can be surfaced in the Animals page as compact modules rather than a separate community page.

### Routing and integration
- `crittertrack-frontend/src/AppRoutes.jsx` already wires AnimalList and LitterManagement into app routes.
- Animal detail and edit navigation flows are already managed via `PrivateAnimalDetail`, `AnimalForm`, and routing logic.

---

## 2. Features present but need modification

### Animals page layout and dashboard
- Existing AnimalList is not currently organized as a dashboard-first page.
- The current layout is more vertical and management-panel oriented, so it needs refactoring into:
  - top summary cards,
  - quick reminders/action hints,
  - compact quick actions bar,
  - primary list working surface,
  - secondary modules.

### Filters and sorting
- Current filters are dense and stacked.
- Need a cleaner top-row filter toolbar with:
  - search,
  - primary filter selectors,
  - advanced filters drawer/modal,
  - column settings,
  - name/age sorting.
- The filtering logic exists, but UI needs rework.

### Reproduction tab
- Current reproduction section is a management panel rather than a dedicated overview hub.
- Existing functionality should be refactored into a reproduction dashboard with:
  - summary cards for matings, pregnancies, nursing, and upcoming births,
  - quick actions for new mating, confirm pregnancy, convert to litter,
  - search/filter by animal/enclosure/status,
  - list rows that link to the litter workflow.
- The current direct state transitions should be preserved as quick actions but presented more clearly.
- Animal detail currently includes Fertility, Family, and Offspring/Litters sections, so the reproduction hub should connect with those detail tabs for per-animal context.
- Reproductive status values and mating/pregnancy/treatment history should be sourced from the same animal detail record used by `PrivateAnimalDetail`, not from duplicated list-view state.

### Health tab
- Current health section already has medical status and enclosure grouping, but needs modification to match the dedicated health tab spec.
- Needs row-based health list, detail-specific drill-in, and improved filters/search for health status, enclosure, condition, and urgency.
- The existing quarantine/treatment actions can remain, but the UI should be reorganized around health workflows.
- Animal detail already includes a full `Health` tab with preventive care, procedures, active medical conditions, medications, vet visits, and clearance fields.
- Every health and treatment detail shown on the Animals page should be derived from the animal detail record or should link to the animal detail view; the Animals page should not maintain separate health data copies.

### Enclosures tab/dashboard
- Enclosure management exists, but it needs to be framed as a secondary destination rather than a full primary tab.
- Existing enclosures UI can remain but should be surfaced through the management tab and via an enclosure detail drill-in if required.
- AnimalDetail also exposes assigned enclosure info and housing details, so enclosure dashboard links should target that detail context when appropriate.

### Archive treatment
- Archive is currently implemented as a special screen toggle in AnimalList.
- It should be kept, but treated as secondary utility, not a primary tab.
- Update UI and navigation labels to reflect that intent.

### For Sale / Available view
- The available animals view is currently a toggle in AnimalList.
- It can stay as an auxiliary panel, but should not be elevated to primary screen weight.

### Alerts and reminders
- There is no consolidated alerts modal/button in AnimalList today.
- The existing header and page actions need a new centralized alerts entry point.
- Current reminder indicators live in section cards, but they are not unified into a single alert hub.

### Favorites and community modules
- Favorite animals/breeders data exists in `Community/MyFeed.jsx` but is not embedded in the Animals page.
- Need to link or embed these modules into the Animals page dashboard.

### Activity log references
- AnimalList contains a comment placeholder for Activity Log, but no dedicated implementation.
- Since the redesign removes Activity Log from Animals page scope, any remaining references should be cleaned.

---

## 3. Features that need to be built

### Dashboard-first Animals page
- Main Animals page summary section with counts and status tiles.
- Quick reminder/action hints section.
- Compact quick actions bar below the dashboard.
- Secondary linked modules for favorites and marketplace signals.

### Alerts button/modal
- Consolidated Alerts control accessible from the Animals page header or quick actions.
- Alert preferences panel/modal for reminders, low supplies, upcoming births, due care tasks, etc.

### Health tab detail experience
- Dedicated health list with animal rows and health status pills.
- Drill-in or slideout health overview when selecting a row.
- Vet visit / condition / medication summary as part of the health hub.

### Reproduction overview hub
- Reproduction summary cards and counts.
- Quick actions for adding a mating plan and confirming pregnancy.
- Explicit navigation to `LitterManagement` for detailed litter editing.

### Name/age sorting UI
- New sorting controls for A→Z / Z→A and youngest→oldest / oldest→youngest.
- Integration with the current list state and localStorage persistence.

### Secondary enclosure detail page (optional)
- If required by the new design, add an enclosure detail screen or dedicated card drill-in beyond the current grouped enclosure panel.

### Favorites/community integration
- Embed favorite animals, favorite breeders, recently updated favorites, and favorite-breeder available animals into the Animals page.
- Keep these as compact modules rather than full standalone pages.

### Filter redesign
- Advanced filter drawer or popover for special filters.
- Group related filters into Basic / Display / Special categories.
- Preserve existing filter behavior while reducing density.

### Archive as utility
- Update Archive entry-point so it feels secondary and optional, using button/modal navigation rather than a primary tab treatment.

---

## 4. Features to remove from the Animals page

### Activity Log
- Remove Activity Log from the Animals page experience.
- Do not add or expose an Animals-page Activity Log tab or primary link.

### Orphaned Activity-related UI
- Remove any leftover AnimalList comments, buttons, or tab labels that imply the Animals page still contains an Activity Log.

---

## 5. Notes / recommended link points

- Keep the existing `LitterManagement` component as the downstream detailed breeding workflow.
- Surface reproduction quick actions from AnimalList, but send users to `LitterManagement` for any litter record editing.
- Keep archive and duplicates as utility actions in the AnimalList header, not as primary navigation tabs.
- Use `Community/MyFeed.jsx` as the source for favorites/community modules to avoid duplicating backend calls.
- Preserve the existing animal list and management logic while refactoring layout and navigation.
