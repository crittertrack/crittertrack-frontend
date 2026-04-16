# CritterTrack Frontend — Full app.jsx Refactor Plan

**Current state (post Phases 1–9):** `src/app.jsx` = 6,221 lines  
**Target:** ~500 lines (routing + top-level App state only)  
**Remaining to extract:** ~5,700 lines (Phase 10 only)

---

## Phase 10 — App Component Decomposition (~5,700 lines)

**Status:** 🚀 IN PROGRESS (10a ✅, 10b ✅, 10c ✅, 10d–10g remaining)

The `App` component (lines ~80–5,180, ~5,100 lines remaining) contains top-level state, routing, and event wiring. Break into 4 remaining sub-phases.

### 📊 Current State Analysis

| Category | Count | Lines |
|----------|-------|-------|
| State variables | 70+ | ~1,200 |
| useEffect hooks | 30+ | ~1,500 |
| Handler functions | 20+ | ~500 |
| Route definitions | 13 | ~400 |
| JSX/UI rendering | — | ~1,800 |

### 🎯 Phase 10 Sub-Phases

#### **10a: Extract Authentication Logic** (~150 lines)
**Status:** ✅ COMPLETE (commit 75fee1b8)

**Files created:**
- `src/hooks/useAppAuth.ts` (120 lines) — Auth state + profile fetching + 10-second auto-refresh
- `src/hooks/useIdleTimeout.ts` (140 lines) — 30-minute idle timeout + activity reset + suspension detection

**Extracted from App:**
- `authToken`, `setAuthToken` → useAppAuth hook
- `userProfile`, `setUserProfile` → useAppAuth hook
- `fetchUserProfile()` function (45 lines)
- Idle timeout effect (60 lines) + refs
- Auth interceptor effect

**Result:** App reduced from 5,560 → 5,380 lines (~180 lines removed)
- Build tested: ✅ Zero compilation errors
- Production bundle: Ready to deploy

---

#### **10b: Extract Modal State Management** (~300 lines)
**Status:** ✅ COMPLETE (commit 17b917fc)

**Files created:**
- `src/hooks/useAppModals.ts` (415 lines) — Consolidated all modal states and helpers

**Features:**
- 80+ modal-related states consolidated:
  - 25+ visibility states (show*, modals)
  - 50+ data states (related to each modal)
- 4 helper functions: `openModal()`, `closeModal()`, `toggleModal()`, `clearAllModals()`
- 18 logical state groups for organization
- Full TypeScript with documentation

**Integration:**
- Imported in app.jsx (line 74)
- Hook initialized early in component (line 230)
- All states accessible via `modals.*` prefix for future full integration
- Old useState declarations kept for gradual migration

**Result:** useAppModals hook ready for full integration in Phase 10c+
- Build tested: ✅ Zero compilation errors
- Production bundle: Ready to deploy
- Partial integration complete; old states still in place

---

#### **10c: Extract Animal Navigation** (~460 lines)
**Status:** ✅ COMPLETE (commit 7aeee77b)

**Files created:**
- `src/hooks/usePrivateAnimalNavigation.ts` (380 lines) — Private animal viewing/editing
  * States: animalToView, animalToEdit, animalViewHistory, tab management, pedigree data
  * Handlers: 9 functions for view/edit/save/archive/delete/toggle operations
  * Pedigree fetching: async from /animals/any/ endpoints (sire, dam, offspring)
  * Navigation refs: viewReturnPathRef, editReturnPathRef for context routing
  * Events: Listen for animal-updated and animal-archived for external sync
  * Effects: Auto-fetch pedigree, history clearing, parent card refresh

- `src/hooks/usePublicAnimalNavigation.ts` (80 lines) — Public animal viewing
  * States: viewingPublicAnimal, publicAnimalViewHistory, publicAnimalInitialTab
  * Handlers: 3 functions for view/back/close navigation
  * History stack pattern for modal-based navigation

**Result:** App loses 460 lines, full animal navigation encapsulated
- Build verified: ✅ Zero compilation errors

---

#### **10d: Extract Transfer Workflow** (~150 lines)
**Status:** 🚀 IN PROGRESS

**Files to create:**
- `src/hooks/useTransferWorkflow.ts` — Animal transfer + user search

**Extract:**
- Transfer modal state: `showTransferModal`, `budgetModalOpen`
- Transfer animal: `transferAnimal`, `preSelectedTransferAnimal`, `preSelectedTransactionType`
- User search: `transferUserQuery`, `transferUserResults`, `transferSelectedUser`, `transferSearching`, `transferSearchPerformed`
- Transaction: `transferPrice`, `transferNotes`
- Handlers: `handleSearchTransferUser()`, `handleSubmitTransfer()` + related setters

**Expected Result:** App loses 150 lines, transfer workflow fully isolated

---

#### **10e: Extract Breeding Lines System** (~100 lines)
**Files to create:**
- `src/hooks/useBreedingLines.ts` — Color-coded breeding line management

**Extract:**
- `breedingLineDefs`, `animalBreedingLines`
- `BL_PRESETS_APP` constant
- `saveBreedingLineDefs()`, `toggleAnimalBreedingLine()`
- Backend sync effect + localStorage fallback
- Ref: `breedingLineDefsRef`

**Result:** App loses 90 lines, self-contained breeding lines system

---

#### **10f: Extract Moderation Mode** (~200 lines)
**Files to create:**
- `src/hooks/useModerationMode.ts` — Admin/mod panel + flag handling

**Extract:**
- `inModeratorMode`, `showAdminPanel`, `showModReportQueue`, `showModerationAuthModal`
- `modCurrentContext` state
- `handleModQuickFlag()` function (200+ lines of mod action handlers)
- Authentication check effect

**Risk:** `handleModQuickFlag` is complex (8 conditional branches for warn/suspend/ban/lift/flag/edit/etc.)

**Result:** App loses 190 lines, mod logic fully isolated

---

#### **10g: Extract Public Pages & Finalize App** (~500 lines)
**Files to create:**
- `src/components/Pages/PublicAnimalPage.jsx` — Public animal viewing (not owned)
- `src/components/Pages/PublicProfilePage.jsx` — Public breeder profile
- `src/AppRoutes.jsx` — All route definitions (extracted from App return JSX)
- Remaining App.jsx (~500 lines)

**Extract to AppRoutes:**
- All 13 `<Route path="...">` definitions
- Route guards (auth checks, role-based)

**Remaining in App (~500 lines):**
- Auth wrapper + redirect for not-logged-in
- Header layout + navigation buttons
- Global UI: donation button, feedback modals
- Main `<Routes>` wrapper
- Error boundary (if added)
- Modal portal/provider setup

**Result:** App.jsx becomes clean routing + layout orchestrator

---

### 📈 Expected Outcomes

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| **app.jsx lines** | 5,560 | 500–700 | **87–91%** |
| **App state variables** | 70+ | 10–15 | **80%** |
| **App useEffect hooks** | 30+ | 4–6 | **80%** |
| **Cyclomatic complexity** | Very High | Medium | ~**60%** |
| **File understandability** | 2+ hours | 20 min | **83%** |
| **Test coverage potential** | Very hard | Per-hook easy | **~90%** |

---

### ✅ Recommended Order of Execution

1. **10a** → Authenticate + Idle (foundational, enables 10b–10f)
2. **10b** → Modal consolidation (used by all pages)
3. **10c** → Animal navigation (core user workflow)
4. **10d** → Transfer workflow (relies on 10a, 10b, 10c)
5. **10e** → Breeding lines (independent, can parallel with 10d)
6. **10f** → Moderation (uses 10a for auth)
7. **10g** → Public pages + finalize (last step, integrates all others)

**Estimated total time:** 8–12 hours for full Phase 10 completion

---

---

## Summary of Progress

| Phase | What | Lines | Status |
|---|---|---|---|
| 1 | LitterManagement, AnimalForm, AnimalList | 13,746 | ✅ Complete |
| 2 | Animal Detail Views (3 variants + helpers) | 7,200 | ✅ Complete |
| 3 | Public Profile & Breeder Directory | 3,000 | ✅ Complete |
| 4 | Profile Edit & Account | 3,200 | ✅ Complete |
| 5 | Auth (Login, Register, Forgot Password) | 900 | ✅ Complete |
| 6 | Notifications & Banners (5 components) | 1,850 | ✅ Complete |
| 7 | Modals & Messages (5 files, 2,732 lines) | 2,732 | ✅ Complete |
| 8 | Community, Donations & Shared | 1,600 | ✅ Complete |
| 9 | Utility functions (formatDate, speciesUtils, etc.) | 600 | ✅ Complete |
| 10 | App component decomposition | ~5,700 | 🚀 **IN PROGRESS** |
| **TOTAL EXTRACTED** | | **~34,400+** | |

**Original app.jsx:** 16,119 lines  
**Current app.jsx:** 6,221 lines (62% extracted)  
**Final target:** ~500 lines

---

## Existing Extracted Components (for reference)

| File | Lines | Description |
|---|---|---|
| `src/components/LitterManagement/index.jsx` | 4,441 | Litter creation, COI |
| `src/components/AnimalForm/index.jsx` | 8,658 | Animal create/edit form |
| `src/components/AnimalList/index.jsx` | 3,923 | Animal listing & filtering |
| `src/components/Auth/AuthView.jsx` | 760 | Login, register, forgot password |
| `src/components/Notifications/Banners.jsx` | 1,019 | WarningBanner, InformBanner, BroadcastPoll, 4 more |
| `src/components/Notifications/NotificationsHub.jsx` | 461 | Notification aggregator with polling |
| `src/components/Notifications/NotificationPanel.jsx` | 415 | Full notification panel |
| `src/components/PublicProfile/GlobalSearchBar.jsx` | — | Global search bar |
| `src/components/PublicProfile/PublicProfileView.jsx` | — | Public breeder profile + QRModal |
| `src/components/PublicProfile/BreederDirectory.jsx` | — | Breeder directory + settings |
| `src/components/Profile/ProfileEditForm.jsx` | 3,133 | Full profile editor |
| `src/components/Profile/ProfileView.jsx` | — | Profile page container |
| `src/components/Profile/UserProfileCard.jsx` | — | User profile summary card |
| `src/components/shared/ModalMessage.jsx` | — | Reusable modal for title + message dialogs |
| `src/components/shared/CustomAppLogo.jsx` | — | Logo component with BETA badge overlay |
| `src/components/shared/LoadingSpinner.jsx` | — | Standard loading indicator with animated icon |
| `src/components/shared/AnimalImage.jsx` | — | Image display with error handling and fallback icon |
| `src/components/AnimalImageUpload/index.jsx` | — | File upload UI with image preview/deletion |
| `src/utils/imageCompression.js` | — | Client-side image compression utilities |
| `src/components/Donation/DonationView.jsx` | — | Donation page with PayPal integration |
| `src/components/Community/CommunityPage.jsx` | — | Community feed with favorites and activity |
| `src/utils/constants.js` | — | GENDER_OPTIONS, STATUS_OPTIONS (Phase 9) |
| `src/utils/speciesUtils.js` | — | getSpeciesDisplayName, getSpeciesLatinName (Phase 9) |
| `src/utils/dateFormatter.js` | — | formatDate, formatTimeAgo, litterAge, etc. (Phase 9) |
| `src/utils/locationUtils.js` | — | getCountryFlag, getStateName, getCurrencySymbol (Phase 9) |
| `src/utils/donationUtils.jsx` | — | getDonationBadge, DonationBadge component (Phase 9) |
| `src/utils/activityUtils.js` | — | getActionLabel, getActionColor (Phase 9) |
| `src/components/Marketplace.jsx` | — | Already existed |
| `src/components/MouseGeneticsCalculator.jsx` | — | Already existed |
| `src/utils/treeComponentUtils.js` | — | Pedigree tree helpers |
