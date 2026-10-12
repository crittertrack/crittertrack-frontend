# CritterTrack Product Inventory and Help Center Consolidation

## Purpose and scope

This document inventories the user-facing product surfaces currently represented in the
frontend and compares them with the current tutorial catalog. It is the planning baseline
for a redesigned Help Center.

**Help Center requirements already decided**

- Help Center belongs in the profile-image dropdown.
- Help content is text-only: remove screenshots and avoid screenshot-dependent instructions.
- There must be one canonical answer per task. Do not retain duplicate tutorials and FAQs
  that explain the same workflow in parallel.
- Reuse and consolidate the useful current tutorial content rather than discarding it.
- Keep existing `/tutorials` links working by redirecting or mapping that route to the new
  Help Center.

This is a feature/workflow inventory, not a literal transcription of every rendered JSX
button or every conditional form field. The application has many context-sensitive controls;
the inventory captures user-visible actions and choices by page/workflow so the eventual
article set can cover them without documenting the same control in several places. Validate
conditional and role-specific details against the live UI when writing final articles.

## Product map

The product is a React single-page application with authenticated workspace screens,
public profile/animal views, responsive navigation, Lite mode, PWA behavior, and a
Capacitor-based Android app.

### Entry, navigation, account, and support

| Surface | User-facing capabilities and actions |
|---|---|
| Login and registration | Log in, register, verify registration, keep signed in, recover/reset password, accept Terms and Privacy links. Login presents **Get the Android app on Google Play** above the PWA install option. |
| Main navigation | Open Animals, Litters, Contacts, Marketplace, Calendar, Community, Tools, and Finance. Desktop and mobile have different layouts. |
| Header actions | Global search for users/animals; theme preference; push-notification controls; Lite/Full mode switch; notifications; messages; profile avatar menu. |
| Profile menu | Open own public profile, report an issue, moderation/panel entry where authorized, and log out. This is the intended place to add **Help Center**. |
| Contextual help | `InfoButton` popovers give local explanations and sometimes link to a lesson. These hints should become short contextual links/snippets that point to the same canonical Help Center article, not separate competing answers. |
| Responsive/native behavior | Mobile navigation; PWA add-to-home-screen prompt and iOS instructions; Android Play Store listing; Android hardware back navigation. The native app shares the frontend UI. |
| Lite mode | A user-selectable reduced navigation and workflow mode; it trims some views and hides Contacts, Marketplace, Calendar, and Community from the primary navigation. It is not a separate animal-data system. |
| Global feedback and alerts | News ticker, offline/sync banners, notification strip, modal confirmations/errors, and report/support entry points. Explain what users can do from a banner only where that action is user-controllable. |

### Animals and animal records

| Surface | User-facing capabilities and actions/options |
|---|---|
| Animal list | Add animal; choose species; search, filter, sort, and change list/card presentation; open, view, or edit a record; select records for supported bulk operations; manage archive/duplicates and ownership state. |
| Species selection/management | Search/select a species or category; manage custom species where permitted; proceed to the add-animal form. |
| Add/edit animal | Enter or update identification, ownership/visibility, appearance/genetics, health, routine care, behavior, reproduction, pedigree, gallery, timeline/records, and display/customization data. Save, cancel, and (when editing) delete are conditional on the form/state. Some animal forms and sections are configurable by species. |
| Animal detail | Review the record by tabs; open related parent/offspring/litter records; view calculated relationship/COI information; access available edit, archive, visibility, sharing, and record-specific actions. |
| Identification and ownership | Record identity and keeper/breeder ownership context; visibility/public profile choices determine what other users can see. A transfer workflow is initiated, sent to another user, and remains pending until accepted. |
| Appearance/genetics | Record appearance and genetic traits; use the genetic-code builder where supported; record life stage and measurements. |
| Health and care | Review or set health status/manual override; track quarantine; log treatments/medications, conditions, allergies, clearances/screening, vaccinations/deworming, and routine care as supported by species and record state. |
| Feeding and care | Record feed/care events; view assigned diet/supplies and enclosure context; choose supply and quantity/unit; opt in to supply deduction when recording feeding; view relevant enclosure task/care details. |
| Reproduction | Record reproductive/fertility state, cycle/conception and pregnancy/development events, outcomes, nursing, and weaning. Reminders/alerts may be derived from the animal/litter state. |
| Pedigree | Link ancestors to real CritterTrack animal records; inspect pedigree relationships and calculated inbreeding information. |
| Gallery | Add/upload images; rotate/crop; manage multiple photos and the animal gallery. |
| Timeline and records | Review chronological animal events and ownership/record history; add or inspect supported records. |
| Customize | Hide/show supported animal fields or tabs for a species; preferences affect how records are presented, not whether underlying data should be assumed deleted. |
| Archive/duplicates/alerts | Archive and restore records where supported; review duplicate candidates and alerts; distinguish alert resolution from removing/deleting an animal. |

### Organization, husbandry, breeding, and planning

| Surface | User-facing capabilities and actions/options |
|---|---|
| Collections | Create/manage named collections and organize animals into them. |
| Enclosures | Create/edit enclosures; manage enclosure details, occupants, task schedules and assigned supplies, including quantities/units; choose whether enclosure details/tasks are included in public animal details. The basic enclosure is intended to be public by default. Open enclosure detail from linked enclosure references. |
| Health tracking | Review health-related animals and treatment/quarantine follow-up, record care actions and follow-up status. |
| Reproduction tracking | Review reproductive animals and reminders; update reproductive state, including marking weaned, so derived reminders no longer apply. |
| Litter management | Record planned mating; progress litter state from planned through born; record birth details; create/link offspring; manage offspring and expand/collapse litter details; control litter visibility where available. |
| Genetics tools | Use Offspring Calculator, COI Calculator, Target Outcome, and Family Tree. Calculator inputs, species/trait availability, and saved-record context can differ; state prerequisites and whether a result is predictive/calculated. |
| Calendar | Navigate calendar dates/views and review scheduled care/breeding events where available. |
| Supplies and inventory | Add/edit supplies, quantities/units, and stock; assign supplies to diets or enclosure tasks; opt in to stock deductions when recording an event; reconcile stock changes and undo where supported. |
| Budget | Review/add/edit budget transactions; associate supported animal/type context and inspect transaction history. |

### Breeder, public, and community surfaces

| Surface | User-facing capabilities and actions/options |
|---|---|
| Own profile/settings | Edit name, image, website/social links, bio, country/location and public profile information; save/cancel. Profile data and account preferences are separate from animal visibility. |
| Settings tabs | Profile; Info & Adoption; Directory; Ratings; Breeding Lines; Dropdown Lists; Data Portability; Account. Options include directory participation, editable breeding-line definitions/assignments, custom dropdown values, import/export, and account/security/notification preferences, subject to each tab's actual controls. |
| Public profile | Browse public breeder information, animals, ratings, breeding lines, and available contact/profile actions. Only fields shared by the owner are public. |
| Breeder directory | Find/browse breeders and open their public profile. Availability depends on profile/directory visibility. |
| Contacts | List/search contacts; add, open, edit contacts; inspect overview and owned/bred animal groupings; preserve contacts as records distinct from the user's own animals. |
| Marketplace | Browse/filter listings and open animals/profiles; initiate contact/conversation or supported marketplace interactions. Public listing visibility depends on animal/profile settings. |
| Community and ratings | Browse community content; open profiles; view or submit supported ratings/feedback. |
| Messages | Open inbox/conversations, select a conversation, read/respond, and track unread state. Some moderator/admin messages can require a response. |
| Ownership transfers | Select/initiate transfer for an animal, choose recipient and relevant transfer details, wait for recipient acceptance, and track the result. |
| Public animal | View the shared animal details and public enclosure summary/details when enabled; navigate to the owner/profile and related public animals where available. |

### Notifications, resources, and administration

| Surface | User-facing capabilities and actions/options |
|---|---|
| Notifications | Open notification center/quick actions; review notification and reminder types; follow linked animals/items and act on derived care or reproduction reminders. Notification categories and dismiss/resolve behavior differ; articles must explain the specific source state rather than implying every notification is a stored record. |
| Alert ticker | Review high-level alert/notification banner; follow available links/actions; dismiss only where offered. It is distinct from the full notifications center. |
| Reports | Submit an issue/report and review own reports/responses where available. |
| Resources | Browse external resource links; filter by species/topic/tag; suggest a resource for review. |
| Admin/moderation | Admins/moderators may have a moderation panel, oversight/user/report workflows, and role-gated controls. Admin-only settings/species/resource management are not general-user instructions and should be labeled as restricted. |
| Legal/support pages | Read Terms/Privacy, public policy information, supporters/donation pages where linked. |

## Route and implementation anchors

These are code-navigation references for validating the inventory; they are not user-facing
documentation links.

- Authenticated workspace route registration: `src/AppRoutes.jsx`.
- Main application header/navigation, account menus, and application shell: `src/app.jsx`.
- Public animal/profile entry routes: `src/app.jsx`; public API surface: backend
  `routes/publicRoutes.js`.
- Lite mode behavior: `src/utils/liteMode.js`.
- Tools dropdown: `src/components/ToolsDropdown.jsx`.
- Profile settings tabs: `src/components/Profile/ProfileEditForm.jsx`.
- Help Center route: `/help` in `src/AppRoutes.jsx`; `/tutorials` remains a compatibility
  route for old links and bookmarks.
- Text-only searchable Help Center: `src/components/tools/HelpCenterPage.jsx`.
- Existing lesson source: `src/data/tutorialLessonsNew.js`.
- The lesson source is currently reused for canonical article records. Search, categories,
  and popular guides point to those same records instead of maintaining a duplicate FAQ.
- Screenshot viewer and resolver have been removed; the new Help Center does not load or
  depend on tutorial images.
- Backend route/auth split: backend `index.js` and `middleware/authMiddleware.js`.

## Current tutorial catalog

The catalog contains **60 lessons, 265 prose steps, and six sections**. It is organized as
tab/feature tours rather than as searchable answers to user questions.

| Existing section | Current lessons |
|---|---|
| Getting Started (5) | App Layout Tour; Creating and Editing Animals; Transferring Animal Ownership; Account Settings & the Breeder Registry; My Animals — The Basics |
| The Animal Record (13) | Dashboard; Identification; Appearance; Health; Routine Care; Behavior; Breeding; Pedigree; Gallery; Timeline; Records; View-Only Extras; Customize |
| The Animal List (7) | My Animals: The Main List; Organizing Animals with Collections; Managing Enclosures; Tracking Reproduction; Tracking Health; Feeding & Care; Archive, Duplicates & Alerts |
| Profile & Settings (9) | Viewing a Profile; Profile; Info & Adoption; Directory; Ratings; Breeding Lines; Dropdown Lists; Data Portability; Account |
| Litter Management (6) | Litter Management: Overview; Recording a Planned Mating; From Planned to Born: Status Transitions; Recording Birth Details; Managing Offspring; The Expanded Litter Card |
| More Pages & Tools (20) | Lite Mode; Installing the Android App; Contacts; Adding a Contact; A Contact's Profile; Editing a Contact; Marketplace; Calendar; Community; Offspring Calculator; COI Calculator; Target Outcome Calculator; Family Tree Explorer; Budget Tracker; Supplies & Inventory; Messages; Notifications; Alert Ticker; Report an Issue; Helpful Resources |

Existing navigation/access patterns:

- Users reach the Help Center from **Profile → Help Center** on desktop and mobile.
- The route is `/help`; `/tutorials?lesson=<id>` remains available for old links.
- `InfoButton` instances can link to a lesson ID.
- Search, topic cards, popular guides and article detail are available without screenshots.
- Popular guides and search/category listings refer to the same article records; no separate
  FAQ copy is maintained.
- Article prose is still sourced from `tutorialLessonsNew.js` and remains scheduled for
  content consolidation and accuracy review.

## Coverage assessment

| Product topic | Current coverage | Consolidation assessment |
|---|---|---|
| Navigation/onboarding | Layout tour, list basics, settings and InfoButton explanations | Merge into one “Getting around CritterTrack” article. Keep concise, note desktop/mobile/Lite differences once. |
| Animal creation and records | Broad add/edit lesson plus per-tab animal-record tours and contextual hints | Strong coverage, but split by a user's task rather than one article per tab. One “Create/edit an animal” overview links to canonical articles for identity, health/care, genetics, pedigree, images, reproduction, records and visibility. Avoid repeating save/edit basics in each. |
| Animal list and organization | Main list basics plus collection/enclosure and archive lessons | Merge list search/filter/sort/view actions into one list article; keep collections, enclosures and archive/duplicate resolution as distinct task articles. |
| Care and reminders | Separate feeding, health and reproduction lessons; alert ticker and notifications lessons | Explain the source-of-truth state in each canonical workflow article; one separate “Understand notifications and reminders” article explains where to act and why derived reminders appear/disappear. |
| Enclosures and supplies | Managing Enclosures and Supplies & Inventory; feeding references assigned supplies | Cross-link but do not duplicate: one enclosure/task article owns assignments; one stock article owns quantities/units/deduction; feeding article describes choosing/confirming the assigned amount and links to both. |
| Reproduction and litters | Reproduction tracking, animal breeding tab and six litter lessons | Consolidate into a breeding/litter lifecycle guide with distinct task sections: record mating, pregnancy/development, birth, offspring, weaning and reminders. Animal record overview links to relevant section instead of restating it. |
| Profile/settings | Account Settings & Breeder Registry plus dedicated profile and eight settings lessons | Make a settings index article with one canonical article for profile visibility, directory, Info & Adoption, ratings, breeding lines, custom dropdowns, data portability, and account/security. Remove duplicated onboarding descriptions. |
| Contacts/community/marketplace | Dedicated overviews and contact add/detail/edit; community/marketplace descriptions | Contacts CRUD can be a single “Manage contacts” article with overview/detail/edit sections. Keep Marketplace and Community separate if their user goals differ; cross-link messages/contact flow rather than duplicate. |
| Calculators and family tree | Dedicated article per tool | Retain one article per tool, but remove repeated generic navigation instructions and describe inputs, outputs, prerequisites and limitations. |
| Calendar, budget, inventory | One article per area | Keep separate canonical task articles; link budget/inventory when explaining supply deductions and care events. |
| Messages and reports | Dedicated messages/report lessons; contextual links also exist | Keep one article for each distinct workflow, with role-gated moderator messaging clearly labeled. |
| Help/resources and Android/PWA | Helpful Resources and Installing Android App lessons | Keep resource discovery and installing the app as canonical articles. Update Play Store information to public release; explain PWA separately, not as an Android beta alternative. |
| Screenshots | Legacy viewer and screenshot assets were removed for the text-only Help Center | No screenshot UI, assets, screenshot resolver, or image-generation script remains. |

### Known content/implementation issues to reconcile

- Some animal-form and litter `InfoButton`s only show inline hints, not lesson links. The
  Help Center plan should keep useful hints short and link to the one matching article.
- A Breeder Directory info link appears to target the Community lesson; verify and correct it
  when contextual Help Center links are migrated.
- Browser/native entry resolution is not assumed by this content audit. Confirm the shipped
  build entry separately before writing platform-specific routing instructions.

## Proposed single-source Help Center information architecture

Use one article record per user goal/workflow. Search, category browsing, contextual Info
links and any “popular questions” should all resolve to those same records. Do not create a
second FAQ copy or a separate duplicate Tutorials catalog.

| Category | Canonical article groups |
|---|---|
| Start here | Account access and password recovery; navigate the app; Full vs Lite; install Android app; install the PWA. |
| Animals | Create/edit an animal; list search/filter/sort; privacy and ownership; health and routine-care records; appearance/genetics; pedigree and gallery; archive/restore and duplicates; transfer ownership. |
| Daily care | Collections; enclosures and public details; feeding and assigned supplies; stock quantities/units/deduction; health and treatment; reproduction tracking; calendar; notifications and derived reminders. |
| Breeding | Planned mating; pregnancy/development; birth details; offspring; weaning and litter lifecycle; offspring calculator; COI; target outcomes; family tree. |
| Profile and settings | Edit public profile; directory visibility; Info & Adoption; ratings; breeding lines; custom dropdown lists; import/export; account/security and notification preferences. |
| Contacts and community | Contacts; marketplace; community; messages; ratings/feedback; reports and issue follow-up. |
| Planning and resources | Budget; supplies; helpful resources; suggest a resource; donation/support information where relevant. |
| Admin/moderation (restricted) | Separate role-gated material only if needed; never expose admin-only instructions as ordinary user actions. |

### Canonical article format

Each article should answer one task without screenshots:

1. **When to use it** — user goal and prerequisites.
2. **Steps** — exact navigation and action sequence in text.
3. **Options and effects** — what each consequential checkbox, visibility setting, unit or
   status does.
4. **What happens next** — saved state, who can see it, stock/notification effects, and
   expected sync/acceptance behavior.
5. **Troubleshooting** — the most likely mistakes and recovery steps.
6. **Related articles** — links to canonical records, never copied answers.

Search should index article title, aliases/questions, category, keywords and body. Search
results should open the canonical article (optionally anchored to a section), not a second
FAQ answer. Category pages may feature/popularize articles but should not repeat their
explanations.

## Migration and verification plan

1. **Freeze this inventory** and reconcile catalog section/lesson counts from the actual data.
2. **Map every current lesson ID** to one canonical article or mark it retired as duplicate,
   outdated, or no longer supported. Preserve useful deep links through redirects/ID mapping.
3. **Audit article prose against current UI**—especially control labels, defaults, role
   gating, public visibility, unit conversions, supply deductions, notification sources, and
   Android/PWA installation.
4. **Consolidate article content**: merge overlapping existing lessons into canonical
   workflow articles, preserving old lesson IDs as anchors/aliases where needed.
5. **Put one Help Center item in the avatar menu** on mobile and desktop. Remove the duplicate
   Tools → Tutorials entry; keep `/tutorials` as a compatibility route.
6. **Migrate contextual help** to Help Center article links and fix stale/mismatched lesson
   references.
7. **Verify**: every current lesson ID maps once or is intentionally retired; duplicate
   workflow explanations have one canonical owner; search finds aliases; direct legacy links
   resolve; role-gated material is not shown to unauthorized users; articles work on mobile,
   desktop, PWA and native Android without screenshots.

## Evidence and limits

Primary source files reviewed:

- `src/AppRoutes.jsx`, `src/app.jsx`
- `src/components/tools/HelpCenterPage.jsx`
- `src/data/tutorialLessonsNew.js` (legacy source for the initial article records)
- `src/components/ToolsDropdown.jsx`, `src/components/shared/InfoButton.jsx`
- `src/components/Profile/ProfileEditForm.jsx`, `src/utils/liteMode.js`
- Backend `index.js`, `middleware/authMiddleware.js`, and `routes/publicRoutes.js`

The first Help Center interface is implemented and uses the old lesson data as its initial
text source. The inventory still does not claim every conditional form field, admin action,
or permission edge case has been manually enumerated; those require screen-level walkthroughs
against the deployed app before corresponding article content is considered final.
