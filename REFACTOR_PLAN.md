# CritterTrack Frontend — Full app.jsx Refactor Plan

**Current state (post Phases 1, 3, 4, 5, 6):** `src/app.jsx` = 17,333 lines  
**Target:** ~500 lines (routing + top-level App state only)  
**Remaining to extract:** ~22,100 lines across 7 phases

---

## Phase 2 — Animal Detail Views (~7,200 lines)

**Target folder:** `src/components/AnimalDetail/`

| Component | Lines in app.jsx | Est. Size | Notes |
|---|---|---|---|
| `useDetailFieldTemplate` | 4113–4126 | ~14 | Custom hook |
| `parseJsonField` | 4127–4132 | ~6 | Util |
| `DetailJsonList` | 4133–4148 | ~16 | Small UI |
| `computeRelationships` | 4149–4244 | ~96 | Pure function |
| `PrivateAnimalDetail` | 4245–7016 | ~2,772 | Authenticated animal detail |
| `ViewOnlyPrivateAnimalDetail` | 7017–8936 | ~1,920 | View-only for owned animals |
| `ViewOnlyAnimalDetail` | 8937–10901 | ~1,965 | Public-facing animal detail |
| `ViewOnlyParentCard` | 10902–11042 | ~141 | Used inside detail views |
| `ParentMiniCard` | 11043–11100 | ~58 | Small parent display card |
| `OffspringSection` | 11101–11308 | ~208 | Offspring listing |

**Files to create:**
- `src/components/AnimalDetail/PrivateAnimalDetail.jsx`
- `src/components/AnimalDetail/ViewOnlyPrivateAnimalDetail.jsx`
- `src/components/AnimalDetail/ViewOnlyAnimalDetail.jsx`
- `src/components/AnimalDetail/utils.js` (hook + helpers + small sub-components)

**Key dependencies:**
- `axios`, `lucide-react`
- `formatDateDisplay`, `formatTimeAgo`, `litterAge` (still in app.jsx — share via import after Phase 9)
- `AnimalImage`, `LoadingSpinner` (still in app.jsx — share via import after Phase 8)
- `AnimalImageUpload` (still in app.jsx)
- The `ParentCard` component (already in app.jsx inside the main `App` render scope at line ~17227)

**Risk:** High — `PrivateAnimalDetail` is complex with many nested tabs, editing, COI, pedigree tree, and gallery. Test all tabs after extraction.

---

## Phase 3 — Public Profile & Breeder Directory (~3,000 lines)

**Target folder:** `src/components/PublicProfile/`

| Component | Lines in app.jsx | Est. Size | Notes |
|---|---|---|---|
| `renderBreederInfoMarkdown` | 2786–2798 | ~13 | Util, used only by PublicProfileView |
| `RatingStarRow` | 2799–2814 | ~16 | Tiny star rating row |
| `PublicProfileView` | 2815–4112 | ~1,298 | Full public breeder profile |
| `BreederDirectorySettings` | 1705–1847 | ~143 | Settings for directory listing |
| `BreederDirectory` | 15917–16249 | ~333 | Browse all breeders |
| `GlobalSearchBar` | 2506–2758 | ~253 | Global search for animals/users |
| `QRModal` | 2759–2785 | ~27 | Simple QR code modal |

**Files to create:**
- `src/components/PublicProfile/PublicProfileView.jsx`
- `src/components/PublicProfile/BreederDirectory.jsx`
- `src/components/PublicProfile/GlobalSearchBar.jsx`

**Key dependencies:**
- `RatingStarRow`, `renderBreederInfoMarkdown` can be local to `PublicProfileView.jsx`
- `BreederDirectorySettings` can be local to `BreederDirectory.jsx` or its own file
- `QRModal` → move to `src/components/Modals/` (see Phase 7)

---

## Phase 4 — Profile Edit & Account (~3,200 lines)

**Target folder:** `src/components/Profile/`

| Component | Lines in app.jsx | Est. Size | Notes |
|---|---|---|---|
| `ProfileImagePlaceholder` | 1848–1879 | ~32 | Simple image upload placeholder |
| `UserProfileCard` | 12271–12353 | ~83 | Displays user profile summary |
| `FormattedTextarea` | 12354–12389 | ~36 | Text input with char counter |
| `ProfileEditForm` | 12390–15222 | ~2,833 | Full profile editing — large |
| `ProfileView` | 16250–16478 | ~229 | Profile page container |

**Files to create:**
- `src/components/Profile/ProfileEditForm.jsx`
- `src/components/Profile/ProfileView.jsx`
- `src/components/Profile/ProfileImagePlaceholder.jsx`

**Key dependencies:**
- `ProfileEditForm` uses `AnimalImageUpload`, `FormattedTextarea`, `ProfileImagePlaceholder`
- Requires `breedingLineDefs`, `toggleAnimalBreedingLine`, `BL_PRESETS_APP` from App state

**Risk:** Medium — `ProfileEditForm` is large (~2,833 lines) with breeding line management, image upload, public/private settings, and country/state dropdowns.

---

## Phase 7 — Modals & Species (~2,500 lines)

**Target folder:** `src/components/Modals/`

| Component | Lines in app.jsx | Est. Size | Notes |
|---|---|---|---|
| `ConflictResolutionModal` | 355–463 | ~109 | Litter sync conflict resolver |
| `LitterSyncConflictModal` | 464–1704 | ~1,241 | Litter sync conflict list — large |
| `ParentSearchModal` | 1880–2110 | ~231 | Search for parent animals |
| `LocalAnimalSearchModal` | 2111–2227 | ~117 | Search local animals |
| `UserSearchModal` | 2228–2505 | ~278 | Search for users |
| `SpeciesPickerModal` | 11309–11461 | ~153 | Pick species from grid |
| `SpeciesManager` | 11462–11734 | ~273 | Add/remove species |
| `SpeciesSelector` | 11735–11889 | ~155 | Species selector with filter |
| `CommunityGeneticsModal` | 12114–12270 | ~157 | Community genetics viewer |
| `MessagesView` | 17382–17824 | ~443 | Direct messaging view |

**Files to create:**
- `src/components/Modals/LitterConflictModals.jsx` (ConflictResolutionModal + LitterSyncConflictModal)
- `src/components/Modals/SearchModals.jsx` (ParentSearchModal + LocalAnimalSearchModal + UserSearchModal)
- `src/components/Modals/SpeciesModals.jsx` (SpeciesPickerModal + SpeciesManager + SpeciesSelector)
- `src/components/Modals/CommunityGeneticsModal.jsx`
- `src/components/Messages/MessagesView.jsx`

**Risk:** Medium — `LitterSyncConflictModal` is 1,241 lines and has complex state.

---

## Phase 8 — Community, Donations & Shared Components (~1,600 lines)

| Component | Lines in app.jsx | Est. Size | Target |
|---|---|---|---|
| `ModalMessage` | 289–303 | ~15 | `src/components/shared/` |
| `CustomAppLogo` | 304–316 | ~13 | `src/components/shared/` |
| `LoadingSpinner` | 317–324 | ~8 | `src/components/shared/` |
| `AnimalImage` | 325–354 | ~30 | `src/components/shared/` |
| `DonationBadge` | 171–191 | ~21 | `src/components/shared/` |
| `AnimalImageUpload` | 11890–12072 | ~183 | `src/components/AnimalImageUpload/` |
| `compressImageWithWorker` | 12073–12113 | ~41 | `src/components/AnimalImageUpload/` |
| `DonationView` | 15223–15425 | ~203 | `src/components/Donation/` |
| `CommunityPage` | 15426–15916 | ~491 | `src/components/Community/` |

**Files to create:**
- `src/components/shared/index.jsx` (ModalMessage, LoadingSpinner, AnimalImage, DonationBadge, CustomAppLogo)
- `src/components/AnimalImageUpload/index.jsx`
- `src/components/Donation/DonationView.jsx`
- `src/components/Community/CommunityPage.jsx`

**Note:** `AnimalImageUpload` is used by both `AnimalForm` and `ProfileEditForm` — must be extracted before those work independently without app.jsx.

---

## Phase 9 — Utility Functions (~600 lines)

Move pure utility functions out of app.jsx into `src/utils/`.

| Function(s) | Lines | Target file |
|---|---|---|
| `getSpeciesDisplayName`, `getSpeciesLatinName` | 47–79 | `src/utils/speciesUtils.js` |
| `getCountryFlag`, `getCountryName`, `US_STATES`, `getStateName`, `getCurrencySymbol` | 80–136 | `src/utils/locationUtils.js` |
| `getDonationBadge` | 137–170 | `src/utils/donationUtils.js` |
| `formatDateDisplay`, `litterAge`, `formatTimeAgo` | 192–245 | `src/utils/dateUtils.js` (extend existing) |
| `getActionLabel`, `getActionColor` | 246–288 | `src/utils/activityUtils.js` |
| `GENDER_OPTIONS`, `STATUS_OPTIONS`, `DEFAULT_SPECIES_OPTIONS` | 42–45 | `src/utils/constants.js` |

---

## Phase 10 — App Component Decomposition (~4,900 lines)

The `App` component (lines 19675–24593, ~4,919 lines) contains all top-level state, routing, and event wiring. After all other phases are done, break it down:

**Sub-tasks:**
1. Extract pedigree/family-tree view into `src/components/Pedigree/`
2. Extract all modal state management into a context or reducer
3. Extract routing into `src/AppRoutes.jsx`
4. Extract `PrivateAnimalScreen`, `PublicAnimalPage`, `PublicProfilePage` standalone page components
5. Final `App` should only contain: auth state, global modals, top-level routing

**Target:** `App` < 300 lines after full decomposition.

---

## Summary Table

| Phase | What | Lines Removed | Status |
|---|---|---|---|
| 1 | LitterManagement, AnimalForm, AnimalList | ~13,746 | ✅ Done |
| 5 | Auth | ~900 | ✅ Done |
| 6 | Notifications & Banners | ~1,850 | ✅ Done |
| 3 | Public Profile & Breeder Directory | ~3,000 | ✅ Done |
| 4 | Profile Edit & Account | ~3,200 | ✅ Done |
| 2 | Animal Detail Views (3 variants + helpers) | ~7,200 | ⬜ Next |
| 7 | Modals & Species + Messages | ~2,500 | ⬜ |
| 8 | Community, Donations & Shared components | ~1,600 | ⬜ |
| 9 | Utility functions | ~600 | ⬜ |
| 10 | App component decomposition | ~4,600 | ⬜ |
| **Total** | | **~39,196** | |

**Final app.jsx target:** ~500 lines (imports + AppRouter only)

---

## Recommended Order

Phases 8 and 9 (shared utilities) unblock later phases because extracted components need to import `AnimalImageUpload`, `LoadingSpinner`, etc. from somewhere. The pragmatic order is:

1. **Phase 2** — biggest win, most isolated
2. **Phase 9** — utilities first so later phases can import cleanly
3. **Phase 8** — shared components
4. **Phases 3–7** — in any order (all depend on shared components being extracted)
5. **Phase 10** — last, once everything else is out

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
| `src/components/Marketplace.jsx` | — | Already existed |
| `src/components/MouseGeneticsCalculator.jsx` | — | Already existed |
| `src/utils/treeComponentUtils.js` | — | Pedigree tree helpers |
