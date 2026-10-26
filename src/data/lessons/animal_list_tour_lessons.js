export const ANIMAL_LIST_TOUR_LESSONS = [
  {
    id: 'animal-list-overview',
    title: 'My Animals: The Main List',
    description: 'A closer look at the dashboard stats, filters, and both view modes on your main animal list.',
    steps: [
      {
        stepNumber: 1,
        title: 'The dashboard stat row',
        content: 'Five stat cards sit above the list: Total Animals (click to expand a species-category breakdown), Owned, Public, Sold/Archived, and Needs Attention. Owned, Public, and Needs Attention also expand into breakdowns when clicked.',
      },
      {
        stepNumber: 2,
        title: 'Owned vs. All - applies to every tab',
        content: 'The Owned/All toggle under Total Animals isn\'t just for this list - it filters Collections, Enclosures, Reproduction, Health, and Feeding & Care too, so unowned animals stay out of your way everywhere until you switch it to "All."',
      },
      {
        stepNumber: 3,
        title: 'Bulk ownership and visibility',
        content: 'The Owned and Public stat cards each have "Set All" buttons beneath them - Set All Owned/Unowned and Set All Public/Private - for flipping every animal\'s status at once instead of one at a time.',
      },
      {
        stepNumber: 4,
        title: 'Sold/Archived and Needs Attention',
        content: 'The Sold/Archived card\'s button opens the Archive screen (covered in its own lesson). Needs Attention rolls up anything due across Feeding & Care, Health, Reproduction, and Enclosures - clicking an item in its breakdown jumps straight to that animal or tab.',
      },
      {
        stepNumber: 5,
        title: 'Card view vs. List (table) view',
        content: 'The grid/list icons at the left of the filter bar switch between Card view (animals grouped into collapsible species sections) and List view (a sortable table). The pin icon next to them saves whichever mode is currently active as your default for next time.',
      },
      {
        stepNumber: 6,
        title: 'Search and filters',
        content: 'The filter bar covers Search (by name), Category, Species, Status, Gender, and - if you\'ve set up breeding lines - a Breeding Line filter too. A pink "Filtered" badge appears next to the page title whenever any filter is active, so you don\'t forget one is on.',
      },
      {
        stepNumber: 7,
        title: 'Sorting',
        content: 'Two sort buttons - A-Z and Age - sit at the right of the filter bar. Click one to sort by it, click again to flip between ascending and descending.',
      },
      {
        stepNumber: 8,
        title: 'Choosing table columns',
        content: 'In List view, a Columns button (gear/list icon) opens a dropdown to toggle which columns show: Animal, Species, Variety, Enclosure, Life Stage, Status, Health, Birthdate/Age, Breeding Lines, and Tags.',
      },
      {
        stepNumber: 9,
        title: 'Species groups in Card view',
        content: 'Card view groups animals by species into collapsible sections you can reorder with the up/down arrows next to each header. Each group header also has its own Make All Public/Private buttons.',
      },
      {
        stepNumber: 10,
        title: 'Bulk delete and archive',
        content: 'Also on each species group header: Delete Multiple and Archive Multiple buttons. Clicking either switches that group into a selection mode - check the animals you want, then confirm with "Delete Selected" or "Archive Selected," or back out with Cancel.',
      },
      {
        stepNumber: 11,
        title: 'Find Duplicates',
        content: 'The "Find Duplicates" button (top-right, magnifying glass) scans for animals that look like accidental duplicates so you can review and clean them up.',
      },
      {
        stepNumber: 12,
        title: 'Pin your favorite tab',
        content: 'Tip: hover any tab in the row above the dashboard (My Animals, Collections, Enclosures, Reproduction, Health, Feeding & Care) and click its pin icon to set that tab as your default view - it\'ll open automatically next time you visit.',
      },
    ],
  },
  {
    id: 'animal-collections',
    title: 'Organizing Animals with Collections',
    description: 'Custom folders for grouping your animals however you like.',
    steps: [
      {
        stepNumber: 1,
        title: 'Creating a collection',
        content: 'Switch to the Collections view and click "Manage Collections" to open the manager. Type a name in the "New collection name…" box and click Create. Click the small icon button next to the name box (or next to an existing collection\'s name) to open a picker with preset colors and a curated set of icons - your choice shows up in the collection\'s section header and in the "Add to collection" menu, making it easier to tell collections apart at a glance.',
      },
      {
        stepNumber: 2,
        title: 'Adding animals to a collection',
        content: 'Uncategorized animals show a small Plus button on their card (or row, in table view). Click it and pick a collection from the "Add to collection:" list. Each animal can only be in one collection at a time - once assigned, it moves out of Uncategorized and that Plus button disappears.',
      },
      {
        stepNumber: 3,
        title: 'Removing an animal from a collection',
        content: 'Inside a collection, each animal has an X button - click it to remove that animal from that collection. The animal itself stays in your account and reappears under Uncategorized, ready to be added to a different collection.',
      },
      {
        stepNumber: 4,
        title: 'Renaming and deleting collections',
        content: 'In the collection manager, use Rename to edit a collection\'s name in place, or Delete to remove the collection entirely. Deleting a collection unassigns every animal that was in it (they fall back to Uncategorized) - it does not delete the animal records themselves.',
      },
      {
        stepNumber: 5,
        title: 'Card view vs. Table view',
        content: 'Like the main list, Collections view has its own Card/Table toggle, and each collection section (plus the Uncategorized group) can be collapsed independently.',
      },
    ],
  },
  {
    id: 'enclosures-overview',
    title: 'Managing Enclosures',
    description: 'Set up housing, track occupants, and stay on top of cleaning tasks.',
    steps: [
      {
        stepNumber: 1,
        title: 'Card view vs. Section view',
        content: 'The Enclosures tab has its own Card/Section toggle in the top-left. Card view shows a photo-forward grid of every enclosure; Section view lists each enclosure as a collapsible row with its occupants underneath - pin whichever you use most as your default with the pin icon next to the toggle.',
      },
      {
        stepNumber: 2,
        title: 'Adding an enclosure',
        content: 'Click "Add Enclosure" to open the form. Only Name is required - everything else (Type, Purpose, Building/Room, Dimensions, Capacity, Temp/Humidity ranges, Lighting schedule, Bedding, Enrichment, Notes, Tags, and Suitable Species) is optional and fills in as much detail as you want to track.',
      },
      {
        stepNumber: 3,
        title: 'Buildings, rooms, and Purpose',
        content: 'Building and Room dropdowns are populated from whatever locations you\'ve set up - click "Manage Locations" in the filter bar to add or edit them. Purpose (General, Nursery/Breeding, Medical, Quarantine, For Sale, Other) helps enclosures surface in the right places, like the Reproduction and Health tabs\' dedicated enclosure panels.',
      },
      {
        stepNumber: 4,
        title: 'Cleaning tasks',
        content: 'Inside an enclosure\'s edit form, add recurring Tasks with a name, type (Cleaning/Maintenance/Feeding/Other), frequency, notes, and any supplies used. Set the quantity and unit for each assigned supply. The "Show enclosure details and tasks on public animal profiles" option is on by default; when enabled, it shares environment details, notes, task names, schedules, and task notes for animals assigned to that enclosure. Overdue tasks show up as warning badges on the enclosure card and count toward the "Needs Attention" total on the dashboard.',
      },
      {
        stepNumber: 5,
        title: 'Assigning and removing animals in Card view',
        content: 'Cards are read-only summaries - click into an enclosure to open its detail modal, then use its "Animals" tab: an "Assign Animal" button opens a searchable/filterable picker of unassigned animals to add, while each current occupant gets a "Remove"/trash icon (visible on hover) to unassign it.',
      },
      {
        stepNumber: 6,
        title: 'Assigning and removing animals in Section view',
        content: 'Everything happens inline on the page instead: each unassigned animal has its own "Assign" button that reveals a dropdown of enclosures right on its card - pick one and it\'s assigned instantly. Occupants shown under each enclosure row have their own "Remove" button that unassigns them immediately, no confirmation needed. Either way (Section or Card view), removing an animal only unassigns it - it never affects the animal\'s own record.',
      },
      {
        stepNumber: 7,
        title: 'Filtering and deleting enclosures',
        content: 'Use the Search box plus the Status (Occupied/Empty), Building, Room, and Suitable Species filters to narrow the enclosure list. Deleting an enclosure (trash icon) unassigns every animal inside it back to Unassigned - it does not delete or archive the animals themselves.',
      },
    ],
  },
  {
    id: 'reproduction-tracking',
    title: 'Tracking Reproduction',
    description: 'Follow animals through planned matings, pregnancy, and nursing.',
    steps: [
      {
        stepNumber: 1,
        title: 'The four status sections',
        content: 'The Reproduction tab groups animals into Planned Matings, Currently In Mating, Pregnant, and Nursing. Each row shows the relevant dates (mating, due/born, weaning) and a status pill, plus a quick action button that advances that animal to the next stage. "Mated today" moves a planned pairing into Mating, "Assign Pregnant" moves it to Pregnant, "Born today" moves it to Nursing, and "Mark Weaned" closes out the cycle and clears the active weaning alert.',
      },
      {
        stepNumber: 2,
        title: 'Starting a planned mating',
        content: 'In Litter Management, click "+ Add" and choose a Sire and Dam (by search, local or global). The form automatically calculates the pairing\'s inbreeding coefficient (COI) once both parents are selected, so you can check compatibility before confirming.',
      },
      {
        stepNumber: 3,
        title: 'This tab vs. Litter Management',
        content: 'The Reproduction tab only tracks each parent animal\'s current status (planned/mating/pregnant/nursing) - it doesn\'t record offspring. Actual litters, birth counts, and individual offspring are created and managed in the separate Litter Management feature; recording a birth or weaning there automatically syncs the parent\'s status here.',
      },
      {
        stepNumber: 4,
        title: 'Clearing a status',
        content: 'Each row also has a small X "Clear Status" button for correcting a mistaken entry (e.g. a pairing that didn\'t take) without waiting for it to progress through every stage.',
      },
      {
        stepNumber: 5,
        title: 'Breeding/Nursery enclosures',
        content: 'A dedicated Enclosures panel at the top lists any enclosure marked with the "Nursery / Breeding" purpose - use its Add button to create one. By default, animals housed there are excluded from the four status lists below since they\'re already grouped by enclosure. Check "Also show Breeding/Nursery enclosure animals in the lists below" if you\'d rather see them in both places.',
      },
      {
        stepNumber: 6,
        title: 'Reproduction Needs Attention alerts',
        content: 'When a planned mating, due date, or weaning date arrives (or passes) without you clicking the corresponding action, it shows up in the dashboard\'s "Needs Attention" breakdown so nothing falls through the cracks.',
      },
    ],
  },
  {
    id: 'health-tracking',
    title: 'Tracking Health',
    description: 'Manage quarantine, active treatments, and keep tabs on overall health status.',
    steps: [
      {
        stepNumber: 1,
        title: 'Quarantine and Treatment lists',
        content: 'The Health tab splits animals into a Quarantine list and an In Treatment list, each row showing the relevant dates/reason and a status pill. "Release" clears an animal from Quarantine, and "End Full Treatment" discharges it from active treatment by finishing every active medication at once - both without affecting the animal\'s own record.',
      },
      {
        stepNumber: 2,
        title: 'Assigning Quarantine or Treatment',
        content: 'Click "Assign Quarantine/Treatment" to open the bulk assign modal. Choose Quarantine (Status: Quarantine/Isolation, Type/Reason, Notes, Start/End dates) or Treatment (a medication\'s Name, Dose, Reason, Start/Stop dates, Dose Interval, and Notes - an active medication is what actually marks an animal "In Treatment"). Search and check off as many animals as you like to apply the same assignment to all of them at once.',
      },
      {
        stepNumber: 3,
        title: 'Managing medication doses',
        content: 'Each active medication on an animal in Treatment gets its own dose actions: confirm a dose was given, prolong the medication, or finish it early - these are also how a medication stops counting toward "dose due" alerts.',
      },
      {
        stepNumber: 4,
        title: 'The overall health status pill',
        content: 'Healthy / Monitoring / Concern / Critical is calculated automatically from active quarantine (weighted by type - e.g. a contagious disease counts far more than a routine new-arrival hold), active treatment, medication count, medical conditions, and allergies. You can\'t set this pill directly from the Health tab - it can only be manually overridden from the animal\'s own edit form (Health tab → Health Status Override).',
      },
      {
        stepNumber: 5,
        title: 'Medical/Quarantine enclosures',
        content: 'A dedicated Enclosures panel lists any enclosure marked with the "Medical" or "Quarantine" purpose - use its Add button to create one. Animals housed there are automatically excluded from the Quarantine/Treatment lists below, since they\'re already grouped by enclosure.',
      },
      {
        stepNumber: 6,
        title: 'Health Needs Attention alerts',
        content: 'A medication dose becoming due, a quarantine end date being reached, or an animal\'s status calculating to Concern or Critical all show up in the dashboard\'s "Needs Attention" breakdown so nothing gets missed.',
      },
    ],
  },
  {
    id: 'feeding-care',
    title: 'Feeding & Care',
    description: 'Keep up with feeding schedules, grooming, training, and any custom care tasks.',
    steps: [
      {
        stepNumber: 1,
        title: 'Four collapsible sections',
        content: 'The Feeding & Care tab is split into Feeding, Grooming & Special Care, Training, and Custom Animal Care. Each section shows a "X due" badge (or a total count when nothing\'s due) and can be collapsed independently.',
      },
      {
        stepNumber: 2,
        title: 'Marking a feeding',
        content: 'Click "Fed" to open the Record Feeding modal. If the animal has a matching food supply assigned in its Routine Care diet, the modal selects it and fills in the assigned amount and a compatible unit. Otherwise, choose a food supply manually. "Deduct from stock" starts unchecked. Turn it on to review or change the quantity and unit (for example, g, kg, ml, or l) and subtract that amount from inventory when you save. Add notes if needed. "Skip" (only shown once a feeding is overdue) logs a skipped feeding without opening the modal.',
      },
      {
        stepNumber: 3,
        title: 'Grooming, Special Care, and Training',
        content: 'These aren\'t single generic schedules - each specific type (Grooming, Brushing, Bathing, Nail/Claw/Hoof Care, Dental Care, Daily Exercise, Crate/Litter/Leash Training, and more) is tracked completely separately per animal, only appearing once you\'ve set a frequency for it. "Done" logs it as completed today; "Skip" (shown only when overdue) logs it as skipped instead.',
      },
      {
        stepNumber: 4,
        title: 'Custom Animal Care tasks',
        content: 'For anything without a dedicated schedule type - a weekly weigh-in, a monthly nail trim, whatever you define - Custom Animal Care tasks work the same way, with their own name, frequency, and Done/Skip actions.',
      },
      {
        stepNumber: 5,
        title: 'Where schedules get set up',
        content: 'This tab only tracks and marks progress - it doesn\'t create new schedules. Feeding, Grooming, and Special Care schedules are set up from the animal\'s own edit form on the Routine Care tab; Training schedules are set up on the Behavior tab.',
      },
      {
        stepNumber: 6,
        title: 'Feeding & Care Needs Attention alerts',
        content: 'Any overdue feeding, grooming/special-care schedule, training schedule, or custom care task shows up in the dashboard\'s "Needs Attention" breakdown, grouped by animal so you can see exactly what each one needs.',
      },
    ],
  },
  {
    id: 'archive-overview',
    title: 'Archive, Duplicates & Alerts',
    description: 'The rest of the My Animals page: the Archive screen, finding duplicate animals, and the notification alerts dropdown.',
    steps: [
      {
        stepNumber: 1,
        title: 'Opening the Archive screen',
        content: 'The Sold/Archived stat card shows the total count (transferred + archived). Use the "Archive" button just below it to open the Archive screen. It has two sections: Sold/Transferred (animals you no longer own, kept view-only for history/pedigree) and Archived Animals (yours, just hidden from your main lists) - plus a search box that searches both by name, prefix/suffix, or ID.',
      },
      {
        stepNumber: 2,
        title: 'Unarchiving and filtering by recipient',
        content: 'Each archived animal has an "Unarchive" button to bring it back into your active lists - it never went anywhere, just hidden. If your sold/transferred animals have gone to more than one different recipient over time, a "Filter by recipient" dropdown appears above the Sold/Transferred list to narrow it down to just one; clicking a recipient\'s name/avatar opens their public profile.',
      },
      {
        stepNumber: 3,
        title: 'Finding duplicate animals',
        content: 'The "Find Duplicates" button (magnifying glass, top-right) scans your animals for likely accidental duplicates - flagged by an exact or similar name match, matching birthdate + species, or matching parents - and groups each match with the reason(s) it was flagged.',
      },
      {
        stepNumber: 4,
        title: 'Merge vs. Dismiss',
        content: '"Merge" keeps one animal and permanently deletes the other, re-pointing all its litters, offspring links, logs, and transactions onto the one you kept - this can\'t be undone, so double-check which one you\'re keeping. "Dismiss" instead just marks the pair as "not a duplicate" so it stops showing up here, without changing either animal.',
      },
      {
        stepNumber: 5,
        title: 'The Alerts dropdown',
        content: 'The "Alerts On/Off" button (bell icon) in the dashboard row opens a checklist of categories - Feeding, Grooming/Special Care, Training, Reproduction, Medical/Quarantine, Enclosure Maintenance, Supply Restocking, and Birthdays - controlling which of these show up in the notification ticker at the very top of every page, not just this one.',
      },
    ],
  },
];

// "Profile & Settings: A Tab-by-Tab Tour" section - the 8 tabs under the avatar → Profile → Profile Settings page.\n