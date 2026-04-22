# Collections View / Custom Grouping Plan

## Confirmed Direction
This feature should not be added into the existing Management view tabs/sections.

Instead, the app should eventually support three top-level animal views:
- All Animals
- Collections
- Management

Collections will act as a second list-style view focused on user-defined organization (folders/sections/groups), while All Animals remains the simple oversight list and Management remains the operational dashboard.

## Problem Statement
Users need flexible organization without losing the simple overview of the current My Animals list and without overloading the already busy Management view.

The goal is to preserve:
- All Animals as the fast, complete overview
- Management as the daily operations workspace
- Collections as the customizable organizational layer

## Goals
- Add a dedicated Collections view between All Animals and Management.
- Let users create custom folders/sections/groups inside Collections.
- Let users assign one or more animals to those collections.
- Keep All Animals visually simple and unchanged for users who prefer easy oversight.
- Keep the feature user-specific and private by default.
- Eventually let users choose which of the three views opens by default.

## Proposed Scope (MVP)
- Add a third top-level toggle/tab in the My Animals area:
  - All Animals
  - Collections
  - Management
- Build Collections as a duplicate/variant of the All Animals list view, but with custom organization added.
- Add collection CRUD:
  - Create collection
  - Rename collection
  - Delete collection
- Add assignment UI:
  - Add/remove animals from collections
  - Support single-animal actions first; bulk actions can come later
- Add optional grouping display modes inside Collections:
  - By collection/folder
  - Ungrouped animals
- Persist per-user collections and assignments in backend.

## Default View Preference
After the three-view structure exists, add a user preference for default landing view.

Possible values:
- All Animals
- Collections
- Management

Expected behavior:
- The app opens the user into their saved preferred animal view.
- If no preference is set, default to All Animals.
- The preference should be editable in Settings and possibly also from the animal-view header.

## Recommended Rollout Order
1. Add Collections as a new third view, without touching Management logic.
2. Reuse as much of the All Animals list UI as possible.
3. Add collection creation and assignment.
4. Add collection-based display/grouping inside Collections.
5. Add default-view preference after the three views are stable.

## Current Code Anchors
Current implementation is centered in the existing AnimalList component.

Confirmed entry points:
- `src/components/AnimalList/index.jsx`
  - `animalView` local state currently has two modes: `list` and `management`
  - Header title switches based on `animalView`
  - The top toggle is currently hardcoded to two buttons: `My Animals` and `Management`
  - Management-only sub-screens already hang off this same component:
    - Activity Log
    - Supplies
    - Archive
    - Duplicates
- `src/AppRoutes.jsx`
  - `/` and `/list` both render the same `AnimalList` component
  - There is currently no separate route or prop for a third list-style animal view

## Implementation Status
Initial safe scaffolding has now been started in `src/components/AnimalList/index.jsx`.

Completed:
- Added a third local `animalView` mode: `collections`
- Updated the top toggle from two views to three views:
  - My Animals
  - Collections
  - Management
- Kept Collections on the same render path as the current list view for safety
- Added a temporary in-app notice explaining that Collections currently mirrors My Animals until custom folders/assignments are built

Not implemented yet:
- Backend collection data model
- Collection CRUD
- Assigning animals to collections
- Grouped/foldered Collections rendering
- Saved default-view preference

This means the least disruptive starting point is likely:
- keep `AnimalList` as the shared surface
- expand `animalView` from two values to three values
- extract/reuse the current list rendering so both `All Animals` and `Collections` can share most of the same UI base

## Recommended Technical Approach
Phase 1 should avoid introducing a completely separate page component if it is not necessary.

Safer first direction:
- Expand `animalView` from:
  - `list`
  - `management`
- To:
  - `list`
  - `collections`
  - `management`

Then split the render flow conceptually into:
- shared animal-list header/filter logic
- All Animals renderer
- Collections renderer
- Management renderer

This gives a clean path to reuse the current My Animals list behavior while layering collection-specific grouping on top.

## Why This Approach Fits Better
- It preserves the existing My Animals experience for users who want simple oversight.
- It avoids stuffing custom folders into Management, which already has a separate operational purpose.
- It keeps the new feature discoverable by placing it directly between All Animals and Management in the existing toggle area.
- It gives a straightforward place to attach future default-view preference logic.

## Default View Preference Notes
The default-view preference should not just set a visual tab after mount if that causes flicker.

Preferred behavior:
- Read the saved preference before or during AnimalList initialization.
- Initialize `animalView` from saved user preference when available.
- Fall back to `list` / All Animals when no preference exists.

Likely eventual storage options:
- user profile field in backend
- temporary localStorage fallback until backend preference is added

Suggested preference key/shape later:
- `defaultAnimalView: 'list' | 'collections' | 'management'`

## Suggested First Implementation Slice
When work starts, the smallest safe first coding slice is probably:
1. Refactor the current two-button toggle into a three-button toggle.
2. Add `collections` as a valid `animalView` state.
3. Initially render Collections using the same list output as All Animals.
4. Only after that, layer in collection CRUD and grouped rendering.

That reduces risk because the first change is mostly navigation/state plumbing, not backend data modeling.

## Data Model Notes (Draft)
- User-scoped collection entity:
  - id
  - ownerId_public
  - name
  - color (optional)
  - sortOrder (optional)
  - createdAt / updatedAt
- Animal reference:
  - collectionIds: string[]

Optional future fields:
- icon
- archived flag
- description

## API Notes (Draft)
- Collection CRUD endpoints (user-scoped)
- Assignment endpoint(s):
  - assign animal to collection
  - remove animal from collection
- Preference endpoint/field:
  - save default animal view
- Validation:
  - unique collection name per user (case-insensitive)
  - max collections per user (optional safety limit)

## UX Notes
- Keep All Animals unchanged as the fast master list.
- Add a new Collections toggle between All Animals and Management.
- Collections should feel familiar by reusing the current list layout where possible.
- Show collection chips/tags on cards inside Collections, and optionally on All Animals later if desired.
- Empty state: "No collections yet" with CTA.
- Confirm before delete; optionally remove assignments or move animals to another collection.
- Default-view preference belongs in Settings, not inside Management.

## Naming Notes
Current preferred three-view naming:
- All Animals
- Collections
- Management

Alternative label if "Collections" tests poorly:
- Folders
- Groups
- Sections

## Acceptance Criteria
- User can switch between All Animals, Collections, and Management.
- All Animals remains usable without collection features getting in the way.
- User can create a collection and assign at least one animal to it.
- Collections view displays animals grouped/organized by user-created collections.
- Collection data is isolated per user.
- Deleting a collection removes or cleans assignments safely.
- User can choose a default animal view preference.
- The app loads the preferred default animal view on future visits.

## Implementation Checklist
- [ ] Finalize view naming: All Animals / Collections / Management
- [ ] Identify current list-view toggle/header implementation
- [ ] Add third top-level animal view route/state
- [ ] Reuse or extract All Animals list UI for Collections view
- [ ] Define backend schema changes for collections + assignments
- [ ] Implement collection CRUD + assignment routes
- [ ] Add frontend hooks/state for collections
- [ ] Build collection CRUD UI
- [ ] Build assign/remove controls on animals
- [ ] Build grouped Collections rendering
- [ ] Add default-view preference storage and settings UI
- [ ] Load preferred default view on app startup/navigation
- [ ] Add tests for view switching, collection CRUD, assignment, and preference loading

## Notes
Requested on 2026-04-22 to track future implementation work.

Refined direction on 2026-04-22:
- Do not overload Management with custom folders/groups.
- Introduce a separate Collections view.
- Support three view modes long-term: All Animals / Collections / Management.
- Add a saved default-view preference after the three-view model is in place.
