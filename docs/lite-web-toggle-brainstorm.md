# Brainstorm: "Lite" toggle inside crittertrack-frontend (web)

Status: early discussion only, nothing implemented yet.

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

## Known top-level nav areas in crittertrack-frontend (from `app.jsx`)

Not yet triaged — just an inventory to start from:

- Animals (list/detail) — core, definitely stays in Lite mode.
- Litters — core breeding tracking, likely stays.
- Marketplace — browsing/listing animals for sale/stud.
- Community — news, polls, broadcasts, supporters.
- Tools dropdown (`ToolsDropdown.jsx`) — likely genetics calculator, resources, etc.
- Finance dropdown (`FinanceDropdown.jsx`) — budgeting/expense tracking.
- Enclosures — housing/cleaning schedules.
- AVK / Average Kinship tool — advanced breeding-math feature.
- Admin/Moderator panel — n/a for regular users, already role-gated separately.

This list needs to be verified against the actual current nav (some items may have moved) and
each area triaged into "core" / "advanced, hide by default in Lite mode" / "always hidden
regardless of mode" before any implementation work starts.

## Open questions for next discussion

1. Is "Lite mode" a single on/off switch, or could a user selectively re-enable specific
   advanced features while staying "Lite" overall?
2. Where does the toggle live — profile/settings page, or a quick-access control like the
   theme toggle?
3. Does Lite mode change navigation only (hide menu items, keep the underlying pages
   reachable by direct URL), or does it also simplify the pages themselves (e.g. hide advanced
   fields inside Animal forms, matching crittertrack-lite's own field scoping)?
4. Should switching modes require a confirmation, or should it be freely reversible at any
   time from the same place?
5. New account default: does the signup flow ask which mode to start in, or does everyone
   start in "full" mode and opt into Lite later?

## Next steps (not started)

- Confirm/expand the nav inventory above against the real current app structure.
- Decide the per-area triage (core / advanced / hidden) together.
- Design the account preference field + toggle UI once scope is agreed.
