# CritterTrack Frontend — Full app.jsx Refactor Plan

**Current state (post Phases 1, 3, 4, 5, 6, 8, 9):** `src/app.jsx` = 16,119 lines  
**Target:** ~500 lines (routing + top-level App state only)  
**Remaining to extract:** ~15,600 lines across 3 phases

---

## Phase 2 — Animal Detail Views (~7,200 lines)

**Target folder:** `src/components/AnimalDetail/`

| Component | Lines in app.jsx | Est. Size | Notes |
|---|---|---|---|
| `useDetailFieldTemplate` | 2341–2354 | ~14 | Custom hook |
| `parseJsonField` | 2355–2360 | ~6 | Util |
| `DetailJsonList` | 2361–2376 | ~16 | Small UI |
| `computeRelationships` | 2377–2472 | ~96 | Pure function |
| `PrivateAnimalDetail` | 2473–5244 | ~2,772 | Authenticated animal detail |
| `ViewOnlyPrivateAnimalDetail` | 5245–7164 | ~1,920 | View-only for owned animals |
| `ViewOnlyAnimalDetail` | 7165–9129 | ~1,965 | Public-facing animal detail |
| `ViewOnlyParentCard` | 9130–9270 | ~141 | Used inside detail views |
| `ParentMiniCard` | 9271–9328 | ~58 | Small parent display card |
| `OffspringSection` | 9329–9536 | ~208 | Offspring listing |

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

## Phase 7 — Modals & Species (~2,500 lines)

**Target folder:** `src/components/Modals/`

| Component | Lines in app.jsx | Est. Size | Notes |
|---|---|---|---|
| `ConflictResolutionModal` | 365–473 | ~109 | Litter sync conflict resolver |
| `LitterSyncConflictModal` | 474–1714 | ~1,241 | Litter sync conflict list — large |
| `ParentSearchModal` | 1715–1945 | ~231 | Search for parent animals |
| `LocalAnimalSearchModal` | 1946–2062 | ~117 | Search local animals |
| `UserSearchModal` | 2063–2340 | ~278 | Search for users |
| `SpeciesPickerModal` | 9537–9689 | ~153 | Pick species from grid |
| `SpeciesManager` | 9690–9962 | ~273 | Add/remove species |
| `SpeciesSelector` | 9963–10117 | ~155 | Species selector with filter |
| `CommunityGeneticsModal` | 10342–10498 | ~157 | Community genetics viewer |
| `MessagesView` | 11193–11773 | ~581 | Direct messaging view |

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
| `DonationBadge` | 181–298 | ~21 | `src/components/shared/` |
| `ModalMessage` | 299–313 | ~15 | `src/components/shared/` |
| `CustomAppLogo` | 314–326 | ~13 | `src/components/shared/` |
| `LoadingSpinner` | 327–334 | ~8 | `src/components/shared/` |
| `AnimalImage` | 335–364 | ~30 | `src/components/shared/` |
| `AnimalImageUpload` | 10118–10300 | ~183 | `src/components/AnimalImageUpload/` |
| `compressImageWithWorker` | 10301–10341 | ~41 | `src/components/AnimalImageUpload/` |
| `DonationView` | 10499–10701 | ~203 | `src/components/Donation/` |
| `CommunityPage` | 10702–11192 | ~491 | `src/components/Community/` |

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
| `GENDER_OPTIONS`, `STATUS_OPTIONS`, `DEFAULT_SPECIES_OPTIONS` | 52–55 | `src/utils/constants.js` |
| `getSpeciesDisplayName`, `getSpeciesLatinName` | 57–89 | `src/utils/speciesUtils.js` |
| `getCountryFlag`, `getCountryName`, `US_STATES`, `getStateName`, `getCurrencySymbol` | 90–146 | `src/utils/locationUtils.js` |
| `getDonationBadge` | 147–180 | `src/utils/donationUtils.js` |
| `formatDateDisplay`, `litterAge`, `formatTimeAgo` | 202–255 | `src/utils/dateUtils.js` (extend existing) |
| `getActionLabel`, `getActionColor` | 256–298 | `src/utils/activityUtils.js` |

---

## Phase 10 — App Component Decomposition (~4,900 lines)

The `App` component (lines 11774–17333, ~5,560 lines) contains all top-level state, routing, and event wiring. After all other phases are done, break it down:

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
| 8 | Community, Donations & Shared components | ~1,600 | ✅ |
| 9 | Utility functions | ~600 | ✅ |
| 10 | App component decomposition | ~4,600 | ⬜ |
| **Total** | | **~39,196** | |

**Current app.jsx:** 16,119 lines | **Final target:** ~500 lines (imports + AppRouter only)

---

## Recommended Order

Phases 8 and 9 are now complete. Next priorities:

1. **Phase 2** — Animal Detail Views (~7,200 lines) — biggest win, but HIGH RISK
2. **Phase 7** — Modals & Species (~2,500 lines) — medium risk
3. **Phase 10** — App component decomposition (~4,600 lines) — must be last

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
