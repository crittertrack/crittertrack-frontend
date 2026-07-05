# Animals Page Refactor Plan

## Goal
Create a clearer, more visual Animals page experience that keeps all current animal-management functionality intact while reorganizing the page into a more structured overview-driven layout.

## Scope
This plan applies only to the Animals page experience.

Do not change:
- Community feed
- MyFeed / community-related pages
- Non-animals routes
- Existing animal list logic, filters, search, or management actions

## Required Content to Fold Into the Animals Page
The Animals page should incorporate the same kinds of information currently surfaced in the community-style feed, but only as part of the Animals page experience.

These features should be planned as Animals-page modules:
- Favorite animals
- Favorite breeders
- Recently updated favorite animals
- Available animals from favorited breeders
- Lightweight search within those sections
- Quick entry points to open animal or breeder profiles

These should be visualized as optional, secondary panels or compact modules within the Animals page, not as separate standalone pages or community features.

## Core Design Direction
The Animals page should feel like a dashboard with three layers:
1. Overview layer
   - a compact summary section at the top
   - quick signals for counts, status, and action items
2. Working layer
   - the existing My Animals list and filters remain the main working area
3. Management layer
   - existing tools like collections, enclosures, reproduction, health, feeding, archive, and duplicates remain available

## Page Structure Plan

### 1. Top Header
Keep the current page title and action buttons, but make the header more intentional.

Visual treatment:
- Page title remains prominent
- Primary actions stay visible: Add Animal, Refresh, Alerts, Archive, Duplicates
- The Alerts control becomes a single centralized button that opens a preferences panel or modal
- Keep the current layout familiar so the page does not feel disruptive

Purpose:
- Preserve navigation clarity
- Make the page feel like a command center
- Consolidate alert/reminder settings into one place

### 2. Main Dashboard Section
Replace the current Reminders & News area with a dedicated main dashboard section directly beneath the header.

Suggested content blocks:
- Total animals
- Owned vs unowned animals
- Public vs private animals
- Animals with special statuses
  - Pregnant
  - Nursing
  - Mating
  - Available / For Sale
- Quick reminders / action hints
  - feeding due
  - care tasks due
  - supplies low
  - upcoming births / matings
  - other alerts
- Compact linked panels for:
  - favorite animals
  - favorite breeders
  - recently updated favorite animals
  - available animals from favorited breeders

Visual approach:
- Use a grid of small cards or tiles for the summary data
- Use a compact alert/reminder strip for the action hints
- Keep the section visually prominent but not overly dense
- Make this the primary landing surface for the Animals page

### 3. Quick Actions Bar
Add a compact quick actions bar immediately below the main dashboard section.

Purpose:
- Provide a lightweight row of high-frequency controls without crowding the header
- Move bulk actions here so they feel more contextual to the current list view
- Keep the alerts modal accessible from the same compact control area

Suggested actions:
- Set all public
- Set all private
- Set all owned
- Set all unowned
- Refresh
- Alerts

Visual treatment:
- Small pill-style buttons or compact chips
- Aligned horizontally with room to wrap on smaller screens
- Visually lighter than the main header actions but still prominent enough to discover

### 4. Primary Content Area
The main content remains the existing Animals list experience, but it should be refactored to match the clean reference layout.

This section should continue to support:
- search
- filters
- species grouping
- card view and list view
- ownership visibility toggles
- bulk actions

Reference-driven layout:
- Top row: search input, key filters, and a compact columns/settings menu
- Below top row: bulk actions bar for selected animals, refresh, and alerts
- Main list (listview): table-style rows with a clear checkbox selection column and row-level controls
- Each row should include:
  - selection checkbox
  - owned/unowned toggle
  - private/public toggle
  - image
  - gender icon
  - animal name (including prefix/suffix)
  - variety
  - CTC ID
  - birthdate
  - status
  - assigned enclosure
  - reproductive status (mating/pregnant/nursing)
  - breeding lines
- The list view should still separate animals by species and allow users to decide the order of species sections
- Pagination controls at the bottom with rows-per-page selector
- leave current my animals card view the same (keep the cards, you can change other parts to match)

Visual approach:
- Use a lighter, more open table layout for the My Animals list
- Keep the main list as the dominant body of the page
- Use spacing and section separation so the overview feels like a guide, not a replacement
- Place the favorite / recent / available modules as secondary panels either above the list or as a compact second column on larger screens

### 3.1 Filter Area Redesign
The current filter area is too dense and will become more cluttered as additional filters are added.

Proposed approach:
- Replace the current long stacked filter controls with a cleaner, more compact filter system
- Use a top filter row similar to the reference layout: search input on the left, key selects next to it, and utility menus (Filters, Columns, More) on the right
- Group related filters into sections such as:
  - Basic filters: species, status, visibility, gender, enclosure, diet type
  - Display filters: view mode, sorting, column settings
  - Special filters: pregnant, nursing, mating, breeding lines, ownership
- Keep the most commonly used filters visible by default, and move advanced filters into an expandable panel or popover
- Add a clear “Apply” and “Clear” pattern to reduce accidental filter changes
- Use a lightweight “Filters” button to open the advanced filter drawer for less-frequent criteria

Sorting additions:
- Add name sorting: A–Z and Z–A
- Add age sorting: youngest–oldest and oldest–youngest
- Make sorting controls visually lightweight, ideally as compact dropdowns or segmented controls rather than a long row of buttons

Bulk-action toolbar:
- Add a compact bulk actions row beneath the filter row, matching the reference style
- Include actions for selected rows: Mark Fed, Reschedule, Change Food, Edit Amount, Skip Feeding, Delete, Clear Selection
- In our case, use: Set all public, Set all private, Set all owned, Set all unowned, Refresh, Alerts

Visual strategy:
- Reduce visual noise by grouping controls into a single compact toolbar
- Use icons sparingly and consistently
- Keep text labels short and predictable
- Preserve the existing filter behavior while making it easier to scan

### 4. Secondary Management Views
The existing subviews remain available but should be visually framed as secondary modes of the same page.

These include:
- Collections
- Enclosures
- Reproduction
- Health
- Feeding & Care

#### Reproduction Tab
The Reproduction tab should function as an overview and quick action hub, not the primary place to manage every reproduction record.

Summary cards:
- Active matings
- Matings pending pregnancy confirmation
- Confirmed pregnancies
- Upcoming births

Primary purpose:
- Surface reproductive status summaries
- Provide quick entry points to create a mating, confirm pregnancy, or open the litter record
- Keep detailed litter management in the existing litter workflow rather than in the tab itself

Filters and search:
- Search by animal name or pair label
- All species
- Mating status
- All enclosures

Quick actions:
- plan a new mating
- Confirm a mating
- Confirm pregnancy on an existing mating
- Convert a confirmed pregnancy to a litter
- View current litters

Row layout:
- selection checkbox
- quick info doe
- quick info sire
- mating status
- pregnancy confirmation status
- due date
- born date

Integration with existing litter management:
- Existing litter records remain the downstream representation of a confirmed pregnancy
- The tab should send users to the litter workflow for detailed litter edits
- The tab is mainly a dashboard and launcher for mating/pregnancy actions

This makes the reproduction tab a high-level hub while preserving the current litter management flow.

#### Health Tab
The Health tab should be a dedicated overview and action hub for medical care, with a row-focused list and detail panel.

Summary cards:
- Total under treatment
- Total in quarantine
- Total vet visits this month

Filters and search:
- Search animals by name
- Search enclosures
- Search by health status
- Filters for condition type, treatment status, enclosure, and urgency

Row layout:
- selection checkbox
- image
- animal name
- health status pill
- last vet check
- active conditions
- active treatments
- next due treatment

Primary purpose:
- surface the most important health cases quickly
- let users jump into an animal’s health detail without losing the broader list
- keep care actions accessible from the list toolbar

Animal health detail:
When a row is clicked, show an animal health overview with:
- basic animal info
- current health status
- last vet check
- active conditions
- medical notes
- recent treatments
- recent tests

Tabbed detail layout:
- Medical records tab (active and history)
- Active treatments tab
- Recent tests + results (or pending) tab
- Notes tab

This tab should act as the health dashboard, while detailed medical history and treatment updates remain organized by animal in the detail panel.

#### Enclosures Tab
The Enclosures tab should behave like a dedicated management dashboard.

Top summary row:
- Total enclosures
- Occupied enclosures (count and percentage)
- Animals housed
- Animals unassigned

Search and filters:
- Search enclosures by name
- Filters for location, type, status, and size
- Keep the filter row compact and easily accessible

Enclosure cards:
- Show each enclosure as a card
- Include image
- Name with occupied/empty pill
- Location and size
- Amount of animals assigned
- Temperature and humidity

Enclosure detail page:
When an enclosure card is clicked, open a dedicated page with:
- enclosure name and occupied/empty pill
- image

Tabbed detail layout:
- Overview tab
  - type
  - size
  - location
  - capacity
  - occupancy
  - temperature
  - humidity
  - last cleaned
  - next cleaning
  - description
  - maintenance due
- Animals tab
  - listview of all animals assigned to the enclosure

Archive:
- Archive should be moved out of the main list view flow and treated as a separate secondary destination
- It should remain quickly accessible from the header or a compact utility menu

Utilities:
- Find Duplicates

How to visualize them:
- Keep the main management views as tabs or view switches at the top of the content area
- Treat Archive as a secondary destination with its own entry point rather than a regular main-list tab
- Treat Find Duplicates as a utility action or secondary tool, not as a primary management view
- Give them a lighter visual treatment so they do not compete with the core animal-management sections
- Avoid making the page feel like a completely different app when switching views

## Content Mapping by Area

### A. Main Dashboard Cards
Use these cards to show high-level information quickly:
- Animals total
- Owned animals
- Unowned animals
- Public animals
- Private animals
- Pregnant animals
- Nursing animals
- Mating animals
- Available animals

Visualization style:
- 2-column on mobile, 4-column on larger screens
- Each card uses a soft background and icon
- Values appear large and bold
- Optional footer text for context

### B. Alerts / Action Panel
This should be a compact, focused block for live management needs.

Suggested items:
- Feeding overdue
- Care tasks due
- Maintenance tasks due
- Supplies low or due for reorder
- Upcoming litters / expected births
- Recently updated animals

Visualization style:
- A narrow panel or compact stacked list
- Show only the most relevant 3–6 items
- Each row includes:
  - icon
  - short label / status
  - timestamp or “due today” language

Alert configuration behavior:
- The Alerts button opens a single preferences experience
- Users can choose which reminder groups they want to receive
- Example options include:
  - feeding reminders
  - care reminders
  - maintenance reminders
  - supply reminders
  - breeding / birth reminders
  - announcements / news
- The selected preferences should control which reminders appear in the page’s alerts area

### C. My Animals List
This remains the core interaction zone.

Visualization style:
- Keep current grouping by species
- Keep existing cards and list view options
- Add visual hierarchy around the content area so it reads as the main work surface

Filter and sort presentation:
- The filter toolbar should feel lightweight and intentionally compact
- Sorting should be available via a small control near the top of the list, not as a separate noisy block
- The page should allow users to quickly change sort order without overwhelming the workspace

### D. Favorite / Activity Modules (moved into Animals page)
These should appear as compact, secondary modules inside the Animals page.

Planned modules:
- Favorite Animals
- Favorite Breeders
- Recently Updated Favorites
- Available Animals from Favorited Breeders

Visualization style:
- Use small card-style panels with headers and short lists
- Keep them visually lighter than the main animal list
- Show only a compact preview list, not a full feature-heavy experience
- Each module should include a quick action entry point to open the related profile or detail page

### E. Collections / Management Modules
These should be visually distinct but still connected to the main page.

How to present them:
- Use a simple content switcher with clear labels
- Each core management module receives its own box or card container
- Keep the same palette and spacing system for continuity

Archive treatment:
- Archive should be positioned as a separate secondary destination with its own entry point
- It should not sit alongside the core management tabs as a main list mode

Utilities treatment:
- Find Duplicates should be accessed through a lighter utility section or compact action menu
- They should not take equal visual weight to the core management views

## Visual Hierarchy Recommendation
The page should read in this order:
1. Header actions
2. Main dashboard section
3. Main work surface (My Animals list or selected subview)
4. Secondary details and management tools as needed

This prevents the page from feeling cluttered while still exposing everything users need.

## Interaction Model
The user should be able to:
- scan the page quickly from the overview section
- jump into the main animal list immediately
- switch to a management view without losing context
- see the most urgent animal-management information without opening a separate screen
- open one Alerts button and choose which reminder categories they want to receive

## Implementation Strategy

### Phase 1: Layout Structure
- Add the overview section above the main list
- Keep the current header and action area intact
- Introduce a consistent card-based visual system for summary blocks

### Phase 2: Filter and Sort Consolidation
- Rework the filter toolbar into a cleaner, grouped layout
- Move advanced filters into a compact expandable panel
- Add name sorting and age sorting with a simple, compact control pattern
- Ensure the controls remain discoverable but visually lighter

### Phase 3: Content Mapping
- Connect the overview to existing animal data already available in the component
- Use current animal state and filters to populate counts and status summaries
- Keep the content derived from the existing animal list data rather than introducing new data sources

### Phase 4: Refinement
- Tune spacing, density, and responsiveness
- Ensure mobile and desktop layouts both work cleanly
- Preserve current interaction patterns for search, filters, and actions

### Phase 5: Polish
- Add subtle icons and color accents
- Keep the page visually calm and professional
- Avoid overloading the page with too many cards or too much text

## Design Principles
- Preserve familiarity
- Make the page easier to scan
- Keep important actions visible
- Keep the list as the primary experience
- Avoid introducing new navigation complexity

## Note on Availability / For Sale Flow
The current process for making an animal available or actually putting it up for sale is too fragmented and requires multiple steps.

Planned direction:
- Remove the separate For Sale / Available button from the Animals page
- Rely on the regular filters and status logic for availability visibility
- Later improve the actual flow so a user can complete the process more directly and with fewer steps
- This improvement should ideally simplify the path from status selection to public visibility and sale configuration in one place

## Success Criteria
The page should feel:
- more organized
- easier to understand at a glance
- less cluttered than a single long list of tools and content
- still fully functional for everyday animal management

## Proposed Page Composition

Top area:
- page title
- primary actions

Below that:
- main dashboard cards
- compact alerts/action panel
- quick actions bar for bulk actions and alerts

Main content:
- current animal list with existing filters and controls

Optional secondary modes:
- collections
- enclosures
- reproduction
- health
- feeding
- supplies
- archive
- duplicates
- duplicates

## Notes for the Implementation Phase
The implementation should be incremental and low-risk.

Recommended order:
1. Add the overview cards section
2. Add the reminders/action block
3. Leave the existing list behavior untouched
4. Ensure subviews continue to work as before
5. Refine only after the structure is stable
