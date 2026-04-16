# Animal Navigation State & Functions Analysis

**File:** [src/app.jsx](src/app.jsx)
**Analysis Date:** April 16, 2026
**Status:** Research Only - No Modifications Made

---

## Executive Summary

The `app.jsx` component manages animal navigation through two parallel systems:
1. **Private Animal Viewing** - For authenticated user-owned animals with edit capabilities
2. **Public Animal Viewing** - For public profiles and shared animals without edit capabilities

Both systems implement a **history-stack navigation pattern** allowing users to drill down through related animals (e.g., view animal → view sire → view grandsire → back).

---

## PRIVATE ANIMAL NAVIGATION STATE

### Core Viewing State

#### 1. **animalToView**
- **Line:** [408](src/app.jsx#L408)
- **Type:** `useState(null)`
- **Default:** `null`
- **Purpose:** Currently viewed private animal object (full animal record with all fields)
- **Dependencies:** 
  - Updated by: `handleViewAnimal()`, `handleBackFromAnimal()`
  - Cleared by: `handleCloseAllAnimals()`, effect at line 478-482
  - Used by: Pedigree fetch effect (line 497-551), Breeder info fetch (line 1318-1333)
- **Related Handlers:** `handleViewAnimal`, `handleBackFromAnimal`, `handleCloseAllAnimals`
- **Size Estimate:** ~5 KB per animal (includes full nested data)

#### 2. **animalViewHistory**
- **Line:** [409](src/app.jsx#L409)
- **Type:** `useState([])`
- **Default:** `[]` (empty array)
- **Purpose:** Navigation history stack for previously viewed private animals (enables "back" button)
- **Structure:** Array of animal objects in reverse chronological order (newest at end)
- **Dependencies:**
  - Pushed to by: `handleViewAnimal()` (line 1545-1547)
  - Popped from by: `handleBackFromAnimal()` (line 1608-1609)
  - Cleared by: `handleCloseAllAnimals()`, effect at line 478-482
- **Max Size:** ~50 KB (typical: 5-10 animals)
- **Size Estimate:** ~50 KB total
- **Related Functions:** `handleViewAnimal`, `handleBackFromAnimal`, `handleCloseAllAnimals`

#### 3. **viewReturnPathRef**
- **Line:** [410](src/app.jsx#L410)
- **Type:** `React.useRef('/') `
- **Default:** `'/'`
- **Purpose:** Stores the URL path to return to when closing the entire animal detail view (set when entering view)
- **Examples:** `'/'`, `'/litters'`, `'/budget'`
- **Dependencies:**
  - Set by: `handleViewAnimal()` (line 1574)
  - Read by: `handleBackFromAnimal()` (line 1614), `handleCloseAllAnimals()` (line 1626)
  - Reset by: Navigation handlers
- **Size Estimate:** ~50 bytes per path
- **Usage Pattern:** Enables "X" button to return to original view (not just previous animal)

#### 4. **editReturnPathRef**
- **Line:** [411](src/app.jsx#L411)
- **Type:** `React.useRef('/view-animal')`
- **Default:** `'/view-animal'`
- **Purpose:** Stores the URL path to return to when closing the edit-animal form
- **Dependencies:**
  - Set by: `handleEditAnimal()` (line 1529)
  - Read by: AnimalForm component (not shown in app.jsx)
- **Size Estimate:** ~50 bytes per path
- **Related Handler:** `handleEditAnimal`

---

### Private Animal Tab Management

#### 5. **detailViewTab**
- **Line:** [412](src/app.jsx#L412)
- **Type:** `useState(1)`
- **Default:** `1` (Info tab)
- **Purpose:** Current tab index in private animal detail view
- **Tabs:**
  - `1` = Info/Basic details
  - `2` = Breeding records
  - `3` = Litters
  - `4` = Genetics/COI
  - `5` = Lineage (triggers parent card refresh)
  - Other tabs managed by detail component
- **Dependencies:**
  - Set by: PrivateAnimalDetail component (managed internally)
  - Triggers effect: Line 493-496 (when tab === 5, refresh parent cards)
- **Size Estimate:** ~5 bytes
- **Related State:** `parentCardKey`, pedigree data states

#### 6. **privateAnimalInitialTab**
- **Line:** [405](src/app.jsx#L405)
- **Type:** `useState(1)`
- **Default:** `1`
- **Purpose:** The tab index to display when first opening a private animal detail view
- **Dependencies:**
  - Set by: `handleViewAnimal()` with `initialTab` parameter (line 1575)
  - Reset by: Navigation handlers to default 1
- **Size Estimate:** ~5 bytes
- **Related Handler:** `handleViewAnimal`
- **Note:** Allows deep-linking to specific tabs (e.g., show Genetics tab when opened from calculator)

#### 7. **privateBetaView**
- **Line:** [406](src/app.jsx#L406)
- **Type:** `useState('vertical')`
- **Default:** `'vertical'`
- **Purpose:** Layout preference for detail view ('vertical' or 'horizontal')
- **Dependencies:**
  - Set by: `handleViewAnimal()` with `initialBetaView` parameter (line 1576)
  - Used by: PrivateAnimalDetail component for layout selection
- **Size Estimate:** ~20 bytes
- **Related Handler:** `handleViewAnimal`

---

### Private Animal Pedigree Data (Nested)

#### 8. **sireData**
- **Line:** [473](src/app.jsx#L473)
- **Type:** `useState(null)`
- **Default:** `null`
- **Purpose:** Fetched sire/father animal object (for lineage display)
- **Source:** Fetched via `GET /animals/any/{sireId}` (line 509-513)
- **Dependencies:**
  - Fetched by: Effect at line 497-551 when `animalToView` changes
  - Cleared by: Effect when `animalToView` becomes null (line 479-481)
  - Used by: PrivateAnimalDetail component (ParentCard child component)
- **Size Estimate:** ~3 KB per animal
- **Related Fetch:** `handleViewAnimal()` triggers fetching via async effect
- **Note:** Fetched asynchronously; initial state is null, updates in background

#### 9. **damData**
- **Line:** [474](src/app.jsx#L474)
- **Type:** `useState(null)`
- **Default:** `null`
- **Purpose:** Fetched dam/mother animal object (for lineage display)
- **Source:** Fetched via `GET /animals/any/{damId}` (line 515-519)
- **Dependencies:**
  - Fetched by: Same effect as sireData (line 497-551)
  - Cleared by: Same effect as sireData (line 479-481)
  - Used by: PrivateAnimalDetail component (ParentCard child component)
- **Size Estimate:** ~3 KB per animal
- **Related Fetch:** Parallel to sireData fetch
- **Note:** Fetched asynchronously; initial state is null, updates in background

#### 10. **offspringData**
- **Line:** [475](src/app.jsx#L475)
- **Type:** `useState([])`
- **Default:** `[]` (empty array)
- **Purpose:** Array of offspring animals for the currently viewed animal
- **Source:** Fetched via `GET /animals/{animalId}/offspring` (line 521-537)
- **Structure:** Flattened array of all offspring across all litters
  ```javascript
  // Structure:
  [
    { id_public, name, gender, birthDate, ... },
    { id_public, name, gender, birthDate, ... },
    ...
  ]
  ```
- **Dependencies:**
  - Fetched by: Same effect as sireData/damData (line 497-551)
  - Cleared by: Same effect as sireData/damData (line 479-481)
  - Used by: PrivateAnimalDetail component (OffspringSection child component)
- **Size Estimate:** ~50 KB (typical: 10-20 offspring per animal)
- **Error Handling:** Falls back to empty array if endpoint unavailable (line 537-540)
- **Note:** Can be significant for prolific animals; fetched asynchronously

---

### Private Animal Related State

#### 11. **animalToEdit**
- **Line:** [393](src/app.jsx#L393)
- **Type:** `useState(null)`
- **Default:** `null`
- **Purpose:** Animal being edited in the AnimalForm component
- **Dependencies:**
  - Set by: `handleEditAnimal()` (line 1529)
  - Clear method: Navigation back clears this via route
  - Used by: `handleSaveAnimal()` to determine refresh logic (line 1707)
- **Size Estimate:** ~5 KB per animal
- **Related Handler:** `handleEditAnimal`, `handleSaveAnimal`

#### 12. **viewAnimalBreederInfo**
- **Line:** [407](src/app.jsx#L407)
- **Type:** `useState(null)`
- **Default:** `null`
- **Purpose:** Fetched breeder profile for the viewed animal (ownerId_public)
- **Source:** Fetched via `GET /public/profiles/search?query={breederId}` (line 1325)
- **Dependencies:**
  - Fetched by: Effect at line 1318-1333 when `animalToView` or `currentView` changes
  - Cleared by: Same effect when conditions not met (line 1329)
  - Used by: PrivateAnimalDetail component to show breeder info
- **Size Estimate:** ~2 KB per profile
- **Related Handler:** Async fetch effect triggered by animal navigation

#### 13. **parentCardKey**
- **Line:** [469](src/app.jsx#L469)
- **Type:** `useState(0)`
- **Default:** `0`
- **Purpose:** React key for forcing parent cards to remount/refetch when Lineage tab opens
- **Dependencies:**
  - Incremented by: Effect at line 493-496 when `detailViewTab === 5`
  - Used by: PrivateAnimalDetail component for parent card keys
- **Size Estimate:** ~10 bytes
- **Related State:** `detailViewTab`, `sireData`, `damData`
- **Note:** Forces re-fetch of fresh parent data when user navigates to Lineage tab

#### 14. **showTabs**
- **Line:** [471](src/app.jsx#L471)
- **Type:** `useState(true)`
- **Default:** `true`
- **Purpose:** Toggle for collapsible tabs panel in detail view
- **Dependencies:**
  - Set by: User interaction in PrivateAnimalDetail component
  - Used by: Render logic for tabs visibility
- **Size Estimate:** ~5 bytes

---

## PUBLIC ANIMAL NAVIGATION STATE

### Core Viewing State (Public)

#### 15. **viewingPublicAnimal**
- **Line:** [402](src/app.jsx#L402)
- **Type:** `useState(null)`
- **Default:** `null`
- **Purpose:** Currently viewed public animal from public profiles (read-only)
- **Dependencies:**
  - Set by: `handleViewPublicAnimal()` (line 1640)
  - Cleared by: `handleCloseAllPublicAnimals()`, effect at line 486-489
  - Used by: ViewOnlyAnimalDetail component
  - Triggers history: Line 486-489 clears history when view closes
- **Size Estimate:** ~5 KB per animal
- **Related Handlers:** `handleViewPublicAnimal`, `handleBackFromPublicAnimal`, `handleCloseAllPublicAnimals`
- **Note:** No edit capabilities; displayed in modal-like overlay

#### 16. **publicAnimalViewHistory**
- **Line:** [403](src/app.jsx#L403)
- **Type:** `useState([])`
- **Default:** `[]` (empty array)
- **Purpose:** Navigation history stack for previously viewed public animals
- **Structure:** Array of public animal objects in reverse chronological order
- **Dependencies:**
  - Pushed to by: `handleViewPublicAnimal()` (line 1637-1638)
  - Popped from by: `handleBackFromPublicAnimal()` (line 1651-1652)
  - Cleared by: `handleCloseAllPublicAnimals()`, effect at line 486-489
- **Max Size:** ~50 KB (typical: 5-10 animals)
- **Size Estimate:** ~50 KB total
- **Related Functions:** `handleViewPublicAnimal`, `handleBackFromPublicAnimal`, `handleCloseAllPublicAnimals`

#### 17. **publicAnimalInitialTab**
- **Line:** [404](src/app.jsx#L404)
- **Type:** `useState(1)`
- **Default:** `1`
- **Purpose:** The tab index to display when first opening a public animal detail view
- **Dependencies:**
  - Set by: `handleViewPublicAnimal()` with `initialTab` parameter (line 1638)
  - Reset by: Navigation handlers
- **Size Estimate:** ~5 bytes
- **Related Handler:** `handleViewPublicAnimal`

---

## HANDLER FUNCTIONS - PRIVATE ANIMALS

### Navigation Handlers

#### 18. **handleViewAnimal(animal, initialTab = 1, initialBetaView = 'vertical')**
- **Line:** [1535-1598](src/app.jsx#L1535-L1598)
- **Parameters:**
  - `animal`: Animal object to view
  - `initialTab` (optional): Tab index to open (1-5)
  - `initialBetaView` (optional): Layout mode ('vertical' or 'horizontal')
- **Function Type:** `async`
- **Size Estimate:** ~65 lines
- **Key Operations:**
  1. Pushes current `animalToView` to `animalViewHistory` if exists (line 1545-1547)
  2. Fetches latest animal data from `/animals/any/{id}` for current privacy settings (line 1550-1558)
  3. Normalizes parent field names (sireId_public → fatherId_public, etc.) (line 1564-1568)
  4. Sets `viewReturnPathRef.current` to current path (line 1573)
  5. Sets tab and view preferences (line 1575-1576)
  6. Updates `animalToView` state (line 1577)
  7. Navigates to `/view-animal` route (line 1578)
  8. Async background fetch of COI if animal has parents (line 1581-1594)
- **Dependencies:**
  - Uses: `authToken`, `API_BASE_URL`, `location`, `navigate`
  - Reads: Current `animalToView` state
  - Sets: `animalViewHistory`, `viewReturnPathRef`, `privateAnimalInitialTab`, `privateBetaView`, `animalToView`, triggers COI fetch
- **Related Effects:** Pedigree fetch effect (line 497-551) triggered when `animalToView` changes
- **Error Handling:** Falls back to passed animal if fetch fails (line 1558)
- **Note:** Implements history stack for deep navigation into related animals

#### 19. **handleBackFromAnimal()**
- **Line:** [1600-1618](src/app.jsx#L1600-L1618)
- **No Parameters**
- **Function Type:** `sync`
- **Size Estimate:** ~19 lines
- **Key Operations:**
  1. Checks if `animalViewHistory.length > 0` (line 1601)
  2. If yes: Pop last animal from history, update `animalToView`, remain on `/view-animal` (line 1603-1608)
  3. If no: Clear history, close detail view, navigate back to `viewReturnPathRef.current` path (line 1610-1615)
- **Dependencies:**
  - Reads: `animalViewHistory`, `viewReturnPathRef`
  - Sets: `animalViewHistory`, `animalToView`
  - Navigates: Only if history empty
- **Related State:** `viewReturnPathRef`, `animalViewHistory`, `animalToView`
- **Use Case:** Back arrow/chevron button in detail view header

#### 20. **handleCloseAllAnimals()**
- **Line:** [1619-1627](src/app.jsx#L1619-L1627)
- **No Parameters**
- **Function Type:** `sync`
- **Size Estimate:** ~9 lines
- **Key Operations:**
  1. Clears `animalToView` (line 1620)
  2. Clears `animalViewHistory` (line 1621)
  3. Navigates back to `viewReturnPathRef.current` path (line 1623-1625)
  4. Resets `viewReturnPathRef.current` to '/' (line 1625)
- **Dependencies:**
  - Reads: `viewReturnPathRef`
  - Sets: All three states to null/empty
  - Navigates: Always
- **Related State:** `viewReturnPathRef`, `animalViewHistory`, `animalToView`
- **Use Case:** X/close button in detail view header (closes entire stack)

#### 21. **handleEditAnimal(animal)**
- **Line:** [1528-1533](src/app.jsx#L1528-L1533)
- **Parameters:** `animal` - Animal object to edit
- **Function Type:** `sync`
- **Size Estimate:** ~6 lines
- **Key Operations:**
  1. Saves current path to `editReturnPathRef.current` (line 1529)
  2. Sets `animalToEdit` state (line 1530)
  3. Sets `speciesToAdd` to animal's species (line 1531)
  4. Navigates to `/edit-animal` route (line 1532)
- **Dependencies:**
  - Uses: `location`, `navigate`
  - Sets: `editReturnPathRef`, `animalToEdit`, `speciesToAdd`
- **Related State:** `editReturnPathRef`, `animalToEdit`, `speciesToAdd`
- **Related Refs:** `editReturnPathRef`
- **Use Case:** Edit button in detail view header

---

### Animal Modification Handlers

#### 22. **handleSaveAnimal(method, url, data)**
- **Line:** [1677-1720](src/app.jsx#L1677-L1720)
- **Parameters:**
  - `method`: 'post' or 'put'
  - `url`: API endpoint URL
  - `data`: Animal data object (large, includes image data)
- **Function Type:** `async`
- **Size Estimate:** ~44 lines
- **Key Operations:**
  1. Adds `ownerId_public` if not present (line 1680)
  2. Makes POST or PUT request to API (line 1686-1693)
  3. If PUT (edit): Refetches animal and updates `animalToView` (line 1695-1705)
  4. Dispatches custom 'animal-updated' event for listening components (line 1705)
  5. Error handling with console logging (line 1712-1713)
- **Dependencies:**
  - Uses: `authToken`, `API_BASE_URL`, `userProfile`
  - Reads: `animalToEdit` state
  - Sets: `animalToView`
  - Triggers: Custom event dispatch
- **Error Handling:** Catches and re-throws errors with logging
- **Data Size:** ~500 KB typical (includes image data)
- **Related Handler:** Called by AnimalForm component

#### 23. **handleArchiveAnimal(animal)**
- **Line:** [1722-1754](src/app.jsx#L1722-L1754)
- **Parameters:** `animal` - Animal to archive/unarchive
- **Function Type:** `async`
- **Size Estimate:** ~33 lines
- **Key Operations:**
  1. Determines action based on current `archived` status (line 1723)
  2. Shows confirmation dialog to user (line 1724-1727)
  3. POSTs to `/animals/{id}/{archive|unarchive}` endpoint (line 1730-1732)
  4. Updates `animalToView` if this animal is currently viewed (line 1739-1741)
  5. Dispatches custom 'animal-archived' event (line 1744-1745)
  6. Closes detail view if archiving (line 1747-1749)
- **Dependencies:**
  - Reads: `animalToView` state
  - Sets: `animalToView`
  - Shows: Modal message on success/error
  - Navigates: Back to '/' if archiving
- **Error Handling:** Shows error modal with backend message
- **Related State:** `animalToView`
- **Use Case:** Archive/Restore button in detail view

#### 24. **handleDeleteAnimal(id_public, animalData = null)**
- **Line:** [1756-1774](src/app.jsx#L1756-L1774)
- **Parameters:**
  - `id_public`: Animal ID to delete
  - `animalData` (optional): Animal object for display in message
- **Function Type:** `async`
- **Size Estimate:** ~19 lines
- **Key Operations:**
  1. DELETEs animal via `/animals/{id_public}` endpoint (line 1763-1766)
  2. Navigates back to '/' on success (line 1767)
  3. Checks response for `reverted` flag (animals returned to original owner) (line 1768-1773)
  4. Shows appropriate success/error message (line 1768-1773)
- **Dependencies:**
  - Uses: `authToken`, `API_BASE_URL`
  - Navigates: Back to home
  - Shows: Modal message
- **Error Handling:** Catches errors and shows modal with backend message
- **Related State:** Indirectly affects `animalToView` via navigation
- **Use Case:** Delete button in detail view

#### 25. **toggleAnimalOwned(animalId, newOwnedValue)**
- **Line:** [1776-1793](src/app.jsx#L1776-L1793)
- **Parameters:**
  - `animalId`: Animal ID to toggle
  - `newOwnedValue`: boolean - true if owned, false if unowned
- **Function Type:** `async`
- **Size Estimate:** ~18 lines
- **Key Operations:**
  1. PUTs to `/animals/{animalId}` with new `isOwned` value (line 1778-1783)
  2. Updates `animalToView` if this animal is currently viewed (line 1786-1788)
- **Dependencies:**
  - Reads: `animalToView` state
  - Sets: `animalToView`
  - Uses: `authToken`, `API_BASE_URL`
- **Error Handling:** Shows error modal on failure
- **Related State:** `animalToView`
- **Use Case:** Toggle owned/unowned status in detail view

#### 26. **handleRestoreViewOnlyAnimal(id_public)**
- **Line:** [1795-1805](src/app.jsx#L1795-L1805)
- **Parameters:** `id_public` - View-only animal ID to restore
- **Function Type:** `async`
- **Size Estimate:** ~11 lines
- **Key Operations:**
  1. POSTs to `/animals/{id_public}/restore` endpoint (line 1798-1801)
  2. Shows success message (line 1802)
- **Dependencies:**
  - Uses: `authToken`, `API_BASE_URL`
  - Shows: Modal message
- **Error Handling:** Shows error modal with backend message
- **Use Case:** Restore button in view-only animal detail

---

## HANDLER FUNCTIONS - PUBLIC ANIMALS

### Public Navigation Handlers

#### 27. **handleViewPublicAnimal(animal, initialTab = 1)**
- **Line:** [1629-1641](src/app.jsx#L1629-L1641)
- **Parameters:**
  - `animal`: Public animal object to view
  - `initialTab` (optional): Tab index to open (default 1)
- **Function Type:** `sync` (doesn't navigate - modal overlay)
- **Size Estimate:** ~13 lines
- **Key Operations:**
  1. Pushes current `viewingPublicAnimal` to `publicAnimalViewHistory` if exists (line 1635-1637)
  2. Sets `publicAnimalInitialTab` (line 1638)
  3. Updates `viewingPublicAnimal` state (line 1639)
  4. No route navigation (displayed as modal/overlay) (line 1639)
- **Dependencies:**
  - Reads: `viewingPublicAnimal` state
  - Sets: `publicAnimalViewHistory`, `publicAnimalInitialTab`, `viewingPublicAnimal`
- **Related State:** `viewingPublicAnimal`, `publicAnimalViewHistory`, `publicAnimalInitialTab`
- **Note:** Implemented as state change only; ViewOnlyAnimalDetail handles rendering
- **Global Setup:** Registered as `window.handleViewPublicAnimal` (line 1668-1673)

#### 28. **handleBackFromPublicAnimal()**
- **Line:** [1643-1659](src/app.jsx#L1643-L1659)
- **No Parameters**
- **Function Type:** `sync`
- **Size Estimate:** ~17 lines
- **Key Operations:**
  1. Checks if `publicAnimalViewHistory.length > 0` (line 1644)
  2. If yes: Pop last animal from history, update `viewingPublicAnimal`, reset tab (line 1646-1653)
  3. If no: Close detail view entirely, clear all public animal state (line 1655-1658)
- **Dependencies:**
  - Reads: `publicAnimalViewHistory`, `viewingPublicAnimal`
  - Sets: `publicAnimalViewHistory`, `publicAnimalInitialTab`, `viewingPublicAnimal`
- **Related State:** `publicAnimalViewHistory`, `publicAnimalInitialTab`, `viewingPublicAnimal`
- **Use Case:** Back arrow/chevron in ViewOnlyAnimalDetail header

#### 29. **handleCloseAllPublicAnimals()**
- **Line:** [1661-1666](src/app.jsx#L1661-L1666)
- **No Parameters**
- **Function Type:** `sync`
- **Size Estimate:** ~6 lines
- **Key Operations:**
  1. Clears `viewingPublicAnimal` (line 1662)
  2. Clears `publicAnimalViewHistory` (line 1663)
  3. Resets `publicAnimalInitialTab` to 1 (line 1664)
- **Dependencies:**
  - Sets: All three public animal view states to null/empty
- **Related State:** `viewingPublicAnimal`, `publicAnimalViewHistory`, `publicAnimalInitialTab`
- **Use Case:** X/close button in ViewOnlyAnimalDetail header (closes entire stack)

---

## RELATED COMPONENTS & EFFECTS

### Pedigree Data Fetch Effect
- **Line:** [497-551](src/app.jsx#L497-L551)
- **Trigger:** When `animalToView` changes
- **Operations:**
  - Fetches sire/father via `/animals/any/{sireId}`
  - Fetches dam/mother via `/animals/any/{damId}`
  - Fetches offspring via `/animals/{animalId}/offspring`
  - Flattens offspring data from litters
- **Sets:** `sireData`, `damData`, `offspringData`
- **Clears:** All three when `animalToView` becomes null
- **Size Estimate:** ~55 lines

### Breeder Info Fetch Effect
- **Line:** [1318-1333](src/app.jsx#L1318-L1333)
- **Trigger:** When `animalToView` or `currentView` changes
- **Operations:**
  - Fetches breeder profile if `animalToView.breederId_public` exists
  - Only runs when on 'view-animal' route
- **Sets:** `viewAnimalBreederInfo`
- **Size Estimate:** ~16 lines

### History Cleanup Effects
- **Line:** [478-489](src/app.jsx#L478-L489)
- **Purpose:** Clean up history stacks when modals close
- **Operations:**
  - Clears `animalViewHistory` when `animalToView` becomes null
  - Clears `publicAnimalViewHistory` when `viewingPublicAnimal` becomes null
- **Size Estimate:** ~12 lines

### Parent Card Refresh Effect
- **Line:** [493-496](src/app.jsx#L493-L496)
- **Purpose:** Force parent cards to refetch when Lineage tab opened
- **Operations:**
  - Increments `parentCardKey` when `detailViewTab === 5`
  - Causes parent cards to remount and refetch fresh data
- **Size Estimate:** ~4 lines

---

## EXTRACTION PLAN - ORGANIZATION INTO HOOKS

### Proposed Hook 1: `usePrivateAnimalNavigation.ts`

**Should Extract:**
- State: `animalToView`, `animalViewHistory`, `viewReturnPathRef`, `editReturnPathRef`
- State: `privateAnimalInitialTab`, `privateBetaView`, `detailViewTab`, `parentCardKey`, `showTabs`
- State: `sireData`, `damData`, `offspringData`
- State: `animalToEdit`, `speciesToAdd`
- State: `viewAnimalBreederInfo`
- Handlers: `handleViewAnimal`, `handleEditAnimal`, `handleBackFromAnimal`, `handleCloseAllAnimals`
- Handlers: `handleSaveAnimal`, `handleArchiveAnimal`, `handleDeleteAnimal`
- Handlers: `toggleAnimalOwned`, `handleRestoreViewOnlyAnimal`
- Effects: Pedigree fetch effect (lines 497-551)
- Effects: Breeder info fetch effect (lines 1318-1333)
- Effects: History cleanup effect (lines 478-482)
- Effects: Parent card refresh effect (lines 493-496)

**Estimated Size:** ~400 lines (including effects and handlers)

**Dependencies to Pass In:**
- `authToken` (for API calls)
- `API_BASE_URL` (for endpoints)
- `userProfile` (for owner ID)
- `location` (for pathname)
- `navigate` (for routing)
- `showModalMessage` (for notifications)

**Return Object:**
```typescript
{
  // Viewing state
  animalToView,
  animalViewHistory,
  viewReturnPathRef,
  editReturnPathRef,
  
  // Tab management
  privateAnimalInitialTab,
  privateBetaView,
  detailViewTab,
  setDetailViewTab,
  parentCardKey,
  showTabs,
  setShowTabs,
  
  // Pedigree data
  sireData,
  damData,
  offspringData,
  
  // Edit state
  animalToEdit,
  setAnimalToEdit,
  speciesToAdd,
  setSpeciesToAdd,
  
  // Breeder info
  viewAnimalBreederInfo,
  
  // Handlers
  handleViewAnimal,
  handleEditAnimal,
  handleBackFromAnimal,
  handleCloseAllAnimals,
  handleSaveAnimal,
  handleArchiveAnimal,
  handleDeleteAnimal,
  toggleAnimalOwned,
  handleRestoreViewOnlyAnimal
}
```

---

### Proposed Hook 2: `usePublicAnimalNavigation.ts`

**Should Extract:**
- State: `viewingPublicAnimal`, `publicAnimalViewHistory`, `publicAnimalInitialTab`
- Handlers: `handleViewPublicAnimal`, `handleBackFromPublicAnimal`, `handleCloseAllPublicAnimals`
- Effects: History cleanup effect for public animals (lines 486-489)
- Global handler setup (lines 1668-1673)

**Estimated Size:** ~80 lines

**Dependencies to Pass In:**
- None (self-contained; just manages state)

**Return Object:**
```typescript
{
  // Viewing state
  viewingPublicAnimal,
  publicAnimalViewHistory,
  publicAnimalInitialTab,
  
  // Handlers
  handleViewPublicAnimal,
  handleBackFromPublicAnimal,
  handleCloseAllPublicAnimals
}
```

---

## STATE SIZE SUMMARY

### Total Memory Footprint in app.jsx:

| State Variable | Type | Typical Size | Peak Size |
|---|---|---|---|
| `animalToView` | object | 5 KB | 5 KB |
| `animalViewHistory` | array | 10 KB | 50 KB |
| `viewReturnPathRef` | ref | <1 KB | <1 KB |
| `editReturnPathRef` | ref | <1 KB | <1 KB |
| `detailViewTab` | number | <1 KB | <1 KB |
| `privateAnimalInitialTab` | number | <1 KB | <1 KB |
| `privateBetaView` | string | <1 KB | <1 KB |
| `sireData` | object | 3 KB | 5 KB |
| `damData` | object | 3 KB | 5 KB |
| `offspringData` | array | 20 KB | 100 KB |
| `parentCardKey` | number | <1 KB | <1 KB |
| `showTabs` | boolean | <1 KB | <1 KB |
| `animalToEdit` | object | 5 KB | 5 KB |
| `viewAnimalBreederInfo` | object | 2 KB | 2 KB |
| `viewingPublicAnimal` | object | 5 KB | 5 KB |
| `publicAnimalViewHistory` | array | 10 KB | 50 KB |
| `publicAnimalInitialTab` | number | <1 KB | <1 KB |
| | | | |
| **TOTAL** | | **~68 KB** | **~282 KB** |

---

## DEPENDENCIES & INTERACTION MAP

```
handleViewAnimal()
  └─ Sets: animalToView, animalViewHistory, viewReturnPathRef, privateAnimalInitialTab, privateBetaView
  └─ Triggers: Pedigree fetch effect → sireData, damData, offspringData
  └─ Triggers: Breeder info fetch effect → viewAnimalBreederInfo
  └─ Triggers: COI fetch (background)

handleBackFromAnimal()
  └─ Reads: animalViewHistory, viewReturnPathRef
  └─ Sets: animalToView, animalViewHistory, navigate()

handleEditAnimal()
  └─ Sets: animalToEdit, speciesToAdd, editReturnPathRef
  └─ Navigates: /edit-animal

handleSaveAnimal()
  └─ Uses: animalToEdit, authToken
  └─ Triggers: animal refetch → animalToView update
  └─ Dispatches: Custom 'animal-updated' event

detailViewTab (state)
  └─ Triggers: Parent card refresh effect
  └─ Sets: parentCardKey (increments on tab 5)

handleViewPublicAnimal()
  └─ Sets: viewingPublicAnimal, publicAnimalViewHistory, publicAnimalInitialTab
  └─ No route navigation

handleBackFromPublicAnimal()
  └─ Reads: publicAnimalViewHistory
  └─ Sets: viewingPublicAnimal, publicAnimalViewHistory, publicAnimalInitialTab
```

---

## RECOMMENDATIONS FOR EXTRACTION

1. **Extract `usePrivateAnimalNavigation` first** - It's larger and more complex, with interdependent effects
2. **Extract `usePublicAnimalNavigation` second** - Simpler, can follow the same pattern
3. **Keep both hooks separate** - They manage different concerns and user flows
4. **Pass dependencies as parameters** - Makes hooks testable and composable
5. **Maintain ref pattern** - Don't convert `viewReturnPathRef` and `editReturnPathRef` to state; refs are correct for this use case
6. **Keep event dispatching** - The custom 'animal-updated' event is important for AnimalList synchronization
7. **Consider splitting further** - Could extract pedigree fetching into separate `usePedigreeData` hook for reusability

---

## NOTES ON ARCHITECTURE

- **History Stack Pattern**: Both private and public animal navigation use a stack-based history system, allowing deep drilling into related animals (viewing grandparents via parent links)
- **Ref vs State**: Navigation paths are stored in refs (not state) because they don't trigger renders and should persist across navigation
- **Async Data**: Pedigree data (sire, dam, offspring) is fetched asynchronously; initial state is null, UI shows loading states
- **Error Resilience**: Fetches have fallbacks (e.g., COI calculation non-blocking, breeder info optional)
- **Event-Driven Updates**: Custom events allow child components (AnimalList, etc.) to stay in sync without prop drilling
- **Modal vs Route Pattern**: Private animals use route-based navigation (`/view-animal`), public animals use state-only modal overlay (no route change)

