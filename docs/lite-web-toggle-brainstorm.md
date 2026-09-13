# Brainstorm: "Lite" toggle inside crittertrack-frontend (web)

Status: the account-level toggle (field + header button) exists and is live; the actual
simplified Lite UI it's supposed to switch to is not built yet.

## The idea

A toggle inside the full `crittertrack-frontend` web app (not a redirect to the separate
`crittertrack-lite` app/codebase) that switches a user into a simplified UI: fewer visible
features, less overwhelming navigation, for users who don't need/want the whole feature set.

## Decisions made so far

- **Scope**: in-app mode, not a link-out to the actual crittertrack-lite build. Same
  codebase, same account/data, just a different UI surface.
- **Motivation**: simplicity/reducing feature overwhelm, not performance. (If it also happens
  to reduce bundle/render weight, that's a bonus, not the goal.)
- **Persistence**: saved to the account (e.g. a field on `userProfile`), so it syncs across
  devices, similar to how theme preference could work but account-scoped instead of
  per-device local storage.
- **Platform scope (added 2026-09-13): desktop/PWA web only.** `crittertrack-frontend` also
  ships as a native Android app via Capacitor (the "full" app), which is a separate product
  from the native `crittertrack-lite` Android app. Lite mode must NOT appear or apply inside
  that native full-app build — it's strictly a web-only feature for people using the full site
  in a browser/installed PWA. Every Lite-mode gate (the toggle button itself, and later the
  actual simplified UI) must check `!Capacitor.isNativePlatform()` in addition to
  `userProfile?.uiMode === 'lite'`, matching the existing `Capacitor.isNativePlatform()`
  convention already used elsewhere in this codebase (e.g. `InstallPWA.jsx`). The
  `LiteModeToggle` component already does this (returns `null` on native).

  Target matrix:
  | Build | Toggle shown? |
  |---|---|
  | Full website, desktop browser | Yes |
  | Full website, installed PWA | Yes |
  | Full website, native Android app (Capacitor) | No — full only |
  | `crittertrack-lite` native Android app | No — separate codebase, lite only |
  | Full website, native iOS app (future) | No — full only |

  `Capacitor.isNativePlatform()` is platform-agnostic (true on both Android and iOS native
  builds), so this same check already covers a future iOS build with no extra code needed.


## Prior art to reuse: crittertrack-lite's own scoping decisions

`crittertrack-lite/RECORDS_SCOPE.md` already did this exact "what's essential vs.
administrative/back-office" exercise once, for the Animal Records tab specifically. Its
categorization is a good starting template for the same kind of triage across the rest of the
app:

- **High value / quick-capture**: Vet Visits, Medications, Vaccinations, Deworming Records.
- **Medium value, simplified**: Medical Conditions, Allergies (name + notes only, no
  status/severity enums).
- **Low value / skip**: Parasite Control, Medical Procedures, Lab Results, Health Clearances,
  Legal/Purchase-Sale/Rights, Shows, Milestones — "administrative paperwork, not something a
  breeder needs mid-chore".

The same "quick task on the go" vs. "administrative back-office" lens likely applies well
beyond the Records tab.

## Even better prior art: crittertrack-lite's actual, live feature set

Rather than re-deriving "core vs. advanced" from scratch, `crittertrack-lite` is itself a
working answer to "what's essential" — it already ships a real, tested feature scope. Per
`crittertrack-lite/TODO.md` and repo memory (`lite-messages-transfer-archive-system.md`), Lite
currently HAS:

- Animals (list/detail: Summary, Records, Photos, Pedigree tabs)
- Litters / Breeding
- Enclosures
- Messages, Notifications/Requests
- Transfer, Archive
- Push notification preferences
- Dark mode, offline support

Lite does NOT have (per `crittertrack-lite/docs/animaldetail-feature-gap-analysis.md`'s Tier 3
"skip" list and the nav inventory below):

- Marketplace / Public profile / For-sale / Stud listings
- Finance / Budgeting
- AVK (Average Kinship) as a standalone tool
- Genetics Calculator (standalone tool)
- Breeding Lines (custom line color-coding)
- Community / News page (Lite only has Notifications/Requests, not the full broadcast feed)
- Admin/Moderator panel

This gives a concrete, low-effort starting definition for full-site Lite mode: **hide
Marketplace, the Finance dropdown, AVK, Genetics Calculator, Breeding Lines, and Community from
the nav; keep everything Lite already has.** No new scoping work needed, just reuse the
boundary Lite already draws.

## Top-level nav in Lite mode (decided, revised 2026-09-13)

Originally decided as 4 buttons inside the existing top header row; revised to match
`crittertrack-lite`'s own split more closely: a **top bar** (unchanged) plus a **separate
bottom nav bar** (new), instead of cramming nav buttons into the top row.

- **Top bar stays exactly as it is today**: logo, and the icon row (theme toggle, push
  toggle, Notifications bell, Messages, profile avatar — plus the future Lite/Full toggle).
  No nav buttons live here anymore in Lite mode.
- **Logo swaps to the Lite branding when Lite mode is on**: `crittertrack-lite` already has a
  dedicated `src/assets/lite-logo.png` (same mouse-tree icon, with a "Lite" wordmark baked in),
  shown next to a "CritterTrack Lite" text label in its own `BrandHeader.jsx`. Confirmed
  feasible — copy that asset into `crittertrack-frontend` and swap `CustomAppLogo` for it (+
  the text label) whenever Lite mode is active, mirroring Lite's own header exactly.
- **New bottom nav bar** (Lite mode only): a full-width bar docked to the bottom of the
  viewport containing the same **4 buttons — Animals, Collections, Enclosures, Litters** —
  same labels/order as `crittertrack-lite`'s `BottomNav.jsx`, but using **the full website's
  own existing icons for each** (see "Icons/colors" note below), not Lite's icon choices.
  Unlike Lite's compact mobile bar, this is a full-width desktop-style bar (evenly spaced
  across the row, not a small centered pill), since the web app has much more horizontal
  space to work with.
- **Collections** and **Enclosures** still need to be promoted to standalone nav
  destinations (today they're internal sub-tabs of `AnimalList/index.jsx`), same as before —
  only *where* the 4 buttons live changed, not that part of the decision.
- **Reproduction**, **Health**, and **Feeding & Care** sub-tabs (and their dashboard
  stat-card counters) are still dropped entirely, same reasoning as before (that data folds
  into each animal's Records tab instead).
- "My Animals" nav label still shortens to just "Animals", matching Lite.

Still needs a final pass to confirm no nav items were missed, and to decide how this bottom
bar behaves at narrow/mobile-web widths (full site currently has its own separate mobile
header layout — not yet reconciled with this new bottom bar).

## Decisions (confirmed)

1. **Single on/off switch**, no granular re-enabling of individual advanced features —
   customization/granularity already lives in Full mode.
2. **Toggle lives in the header**, alongside the existing action icons (theme toggle, push
   notification toggle, Notifications bell, Messages) — not tucked away in Profile/Settings.
3. **Scope is bigger than nav-only**: hides the nav items in the hide-list above (Marketplace,
   Finance, AVK, Genetics Calculator, Breeding Lines, Community) AND simplifies the Animals and
   management tabs themselves (mirroring `crittertrack-lite`'s own field scoping, e.g.
   `RECORDS_SCOPE.md`) — not just menu visibility.
4. **Requires a confirmation step** before switching. Flipping this changes a large portion of
   the UI at once, so it shouldn't be a single accidental click either direction.
5. **Default: Full mode for everyone**, new and existing users. No signup-time prompt — people
   opt into Lite later, once they've formed an opinion on what they need.
6. **Guiding principle: match `crittertrack-lite` as closely as possible**, for scope, labels,
   nav order, tab names, and bottom-bar layout, rather than inventing a new "simplified
   desktop" design from scratch — with one exception below. When in doubt on any future
   detail (copy, empty states, spacing), default to copying what Lite already does instead of
   designing a new answer. Full-site Lite mode should feel like the same app as
   `crittertrack-lite`, just on a wider screen.
7. **Icons and colors: the full website is always the source of truth (added 2026-09-13)**,
   never `crittertrack-lite`. Where Lite invented its own icon for something (e.g. its
   `BottomNav.jsx` uses `PawPrint`/`LayoutGrid`/`Baby`), the full-site Lite mode instead reuses
   whatever icon the full site already uses for that same concept elsewhere, so it stays
   visually consistent with the rest of the full site. Confirmed mapping for the new bottom
   bar: **Animals** → `Cat` (already used in the full site's top nav), **Collections** →
   `FolderOpen` (already used in `AnimalList`'s own internal Collections tab), **Enclosures**
   → `Home` (already used in `AnimalList`'s own internal Enclosures tab — happens to match
   Lite's choice too), **Litters** → `BookOpen` (already used in the full site's top nav).
   Same logic applies to any future color choices — use the full site's existing Tailwind
   theme tokens (`primary`, `dark-primary`, etc.), not colors invented for Lite.

## Onboarding/documentation follow-up (not started)

Once this ships, it needs a mention in the app's own onboarding materials, not just be a silent
new icon:

- `WelcomeGuideModal.jsx` (the first-login welcome modal) — likely a new short blurb card
  alongside the existing Breeder Name/Country/Community/Registry cards.
- `tutorialLessonsNew.js` → `getting-started-layout-tour` lesson, step 6 ("Top-right icons") —
  currently lists theme toggle, push notification toggle, Notifications bell, and Messages;
  the new Lite/Full toggle icon needs to be added to that same step's description once it has a
  final icon/position.

## Full-site Animal detail simplification (decided)

For decision 3's page-level simplification, Lite mode on the full site drops the Animal
detail's 11 tabs (Dashboard, Identification, Appearance, Health, Routine Care, Behavior,
Breeding, Pedigree, Gallery, Timeline, Records) down to the same 4 tabs `crittertrack-lite`
already uses: **Dashboard, Records, Gallery, Pedigree**.

To keep naming consistent between the two apps, `crittertrack-lite`'s `AnimalDetail.jsx` tabs
were renamed (display-only, done 2026-09-13): "Summary" → "Dashboard", "Photos" → "Gallery".
Records and Pedigree were already named that. See repo memory
`lite-messages-transfer-archive-system.md` for the exact code change.

### Where the other 7 tabs' data goes (decided)

Reusing `crittertrack-lite`'s existing Records/Dashboard field scope (`RECORDS_SCOPE.md`)
as-is, rather than re-deriving it:

| Full-site tab | What happens in Lite mode |
|---|---|
| Health | Vet Visits, Medications, Vaccinations, Deworming, Medical Conditions, Allergies → folded into **Records** |
| Routine Care | Feeding schedule, Care Tasks → folded into **Records** |
| Identification | Microchip/Breeder ID/Registration/Tattoo/Ring/Eartag, Breeder/Owner/Co-Owner → folded into **Dashboard** |
| Appearance | Variety/genetic code/species fields → folded into **Dashboard** |
| Breeding | Reproduction state (planned/mated/pregnant/nursing) → folded into **Records**; litter management stays on its own separate Litters/Breeding nav item, unaffected |
| Behavior | **Dropped entirely** — grooming/training schedules aren't in Lite today either |
| Timeline | **Dropped entirely** — shows/milestones deemed "administrative paperwork," same call `RECORDS_SCOPE.md` already made |

## Next steps

- ✅ **Done (2026-09-13)**: `uiMode` field added to the User model (`'full' | 'lite'`, default
  `'full'`), exposed on `userProfile`, updatable via the existing `PUT /api/users/profile`
  route. New `LiteModeToggle` header component (Feather icon, `window.confirm` before
  switching, matching decision 4) wired into both the desktop and mobile header icon rows in
  `app.jsx`, next to `PushToggleButton`. This is inert so far — flipping it only persists the
  preference, it doesn't change any UI yet. Verified with `get_errors` + `npm run build:ci`.
- Not started: build the actual Lite-mode rendering — the new bottom nav bar, the logo swap,
  promoting Collections/Enclosures out of the Animals page's internal tabs, dropping
  Reproduction/Health/Feeding & Care sub-tabs, hiding Contacts/Marketplace/Calendar/Community/
  Tools/Finance, and the Animal detail tab consolidation — all gated behind
  `userProfile?.uiMode === 'lite'`.
- Not started: add the onboarding mentions (`WelcomeGuideModal.jsx`,
  `tutorialLessonsNew.js`'s `getting-started-layout-tour` step 6) once the toggle has visible
  effects worth mentioning.
