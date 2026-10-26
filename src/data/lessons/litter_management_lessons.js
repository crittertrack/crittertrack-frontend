export const LITTER_MANAGEMENT_LESSONS = [
  {
    id: 'litter-management',
    title: 'Litter Management: Overview',
    description: 'What the Litter Management page tracks, and how to find your way around the list.',
    steps: [
      {
        stepNumber: 1,
        title: 'What this page tracks',
        content: 'Every pairing you record - from a planned mating all the way through birth and weaning - lives in one list here. Litters are always sorted with the most active statuses first (Pregnant, then Mated, then Planned, then Born), and newest date first within each status.',
      },
      {
        stepNumber: 2,
        title: 'Quick stats and recalculating counts',
        content: 'The stats bar at the top shows your total litters plus running Male/Female/Unknown offspring counts. If those numbers ever look off (e.g. after editing offspring directly), the "Recalculate" button reconciles every litter\'s gender counts and totals against its actually-linked offspring.',
      },
      {
        stepNumber: 3,
        title: 'Searching, filtering, and sorting',
        content: 'Search by CTL-ID, litter nickname, or sire/dam name or ID. The status pills (All/Pregnant/Mated/Planned/Born) narrow the list to one stage at a time, and the Species and Year dropdowns filter further - Year is based on birth date (or mating/pairing date if unborn).',
      },
      {
        stepNumber: 4,
        title: 'Making litters public',
        content: 'The eye icon on each card toggles that one litter\'s visibility on your public profile\'s Pairings tab. The "Make All Public" button (top of the list) flips every currently-filtered litter at once, and shows "All Public" once none are hidden.',
      },
    ],
  },
  {
    id: 'litter-planned-mating',
    title: 'Adding an Entry: Planned, Mated or Born',
    description: 'How the single + Add button works, from a planned pairing through to a born litter.',
    steps: [
      {
        stepNumber: 1,
        title: 'One + Add button',
        content: 'The "+ Add" button opens one form for the whole cycle. Start with just a species, sire and dam; add a mating date, due date, birth date or weaning date whenever you have them, or come back and edit the entry later. Species is required and, once set, locks in place - you can\'t change a litter\'s species after starting it.',
      },
      {
        stepNumber: 2,
        title: 'Picking sire and dam',
        content: 'Sire and Dam each open a search modal that can look through your own animals, the global database, or both (toggle at the top). Sire search is filtered to Male/Intersex/Mixed/Unknown, Dam to Female/Intersex/Mixed/Unknown, and both must match the litter\'s species - a dam who died before the litter\'s birth date is blocked from being selected.',
      },
      {
        stepNumber: 3,
        title: 'Predicted inbreeding coefficient',
        content: 'As soon as both parents are picked, a "Predicted COI" percentage calculates automatically (shown while a "Calculating..." spinner runs). It\'s cached per sire/dam pairing for the rest of your session so switching back and forth doesn\'t re-fetch it every time.',
      },
      {
        stepNumber: 4,
        title: 'The Dates section sets the status',
        content: 'The status is worked out from the dates, so you never pick it by hand. No dates, or a mating date in the future = Planned. A mating date of today or earlier = Mated. A birth date = Born. Expected Due Date and Weaning Date sit in the same section, and the Birth Date has a "Born, but I don\'t know the birth date" checkbox for litters you want to record as born without a date - those count nursing from the day you save.',
      },
      {
        stepNumber: 5,
        title: 'Optional mating and birth information',
        content: 'Two collapsible sections hold the extras. Mating information has Method, Condition and Mating Outcome (plus the "pregnancy confirmed but no litter" option for mated entries). Birth information has Birth Method, Complications and Birth Outcome. Open them only when you need them.',
      },
      {
        stepNumber: 6,
        title: 'Offspring and photos',
        content: 'The Offspring section holds Total Born, Males, Females and Unknown, then Stillborn and Losses (each with its "extract from total" checkbox). Once a sire and dam are chosen you can link existing animals, and once there is also a birth date you can create new offspring animals right from the form. Photos come last, and can be added once the entry is born. Press "Save Entry" when you\'re done.',
      },
    ],
  },
  {
    id: 'litter-status-transitions',
    title: 'From Planned to Born: Status Transitions',
    description: 'How a pairing moves through its stages, and the shortcuts for doing it quickly.',
    steps: [
      {
        stepNumber: 1,
        title: 'Status badges',
        content: 'Every card shows one status badge: Planned (purple, dashed border), Mated (sky blue), Pregnant (pink), or Born (gray). The badge and border color are the fastest way to scan the list for where each pairing stands.',
      },
      {
        stepNumber: 2,
        title: 'One-click transitions',
        content: 'Instead of opening the full edit form, small pill buttons right on the card header let you advance a pairing instantly: "Mated Today", "Assign Pregnant", "Born Today", and "Wean Today" - each one stamps today\'s date and updates the dam\'s state (e.g. marking her pregnant or nursing) in a single click.',
      },
      {
        stepNumber: 3,
        title: 'Editing any entry',
        content: 'The Edit button on any card - Planned, Mated, Pregnant or Born - opens the same form with everything filled in. Change a date and the status follows: add a birth date to turn a Mated entry into Born, or move a mating date into the future to make it Planned again. Editing other details (like notes) never changes the status by itself.',
      },
    ],
  },
  {
    id: 'litter-birth-details',
    title: 'Recording Birth Details',
    description: 'Everything you can fill in once a litter has actually arrived.',
    steps: [
      {
        stepNumber: 1,
        title: 'Litter identity',
        content: 'Once created, a litter gets an auto-assigned, read-only CTL-ID for system linkage. The Litter Name field is an optional nickname (e.g. "Summer 2025 Litter A") that shows on the card header instead of the raw ID.',
      },
      {
        stepNumber: 2,
        title: 'Dates and birth method',
        content: 'Birth Date and Weaning Date are both date pickers (birth date can\'t be in the future). Birth Method sits in the Breeding Information section alongside Mating Date and Expected Due Date, and is available from the start: Natural, C-Section, Assisted, Induced, or Unknown.',
      },
      {
        stepNumber: 3,
        title: 'Breeding outcome',
        content: 'A "Breeding Outcome" dropdown in the Breeding Information section tracks whether the pairing was Successful, Unsuccessful, or Unknown - separate from the litter\'s status badge, so you can flag a mating as unsuccessful without deleting the record.',
      },
      {
        stepNumber: 4,
        title: 'Recording a lost pregnancy',
        content: 'If a dam was mated but never produced a litter, check "Pregnancy confirmed but no litter produced" (only shown once a Mating Date is set and no Birth Date exists yet). This reveals a Reason dropdown - Cannibalized, All Stillborn, Reabsorbed, or Unknown - plus an optional Notes field for extra detail.',
      },
      {
        stepNumber: 5,
        title: 'Gender counts and total born',
        content: 'Male, Female, and Unknown fields track the gender breakdown. Total Born is read-only and auto-calculates as the largest of: your manual entry, the M+F+U sum, or however many offspring are actually linked - so it can never drop below what\'s already linked.',
      },
      {
        stepNumber: 6,
        title: 'Stillborn and losses',
        content: 'Checking "Extract stillborn from total counts" (or the equivalent for losses) subtracts gender-specific stillborn/loss entries from your M/F/U counts automatically, so the same offspring aren\'t double-counted as both born and lost. Weaned count is a separate, fully manual field.',
      },
      {
        stepNumber: 7,
        title: 'Notes and photos',
        content: 'Notes is a free-text field for anything worth remembering about the litter. Up to 5 photos can be attached (PNG/JPEG, 500 KB max each) - hover a thumbnail to delete it, and in the expanded card view you can click any photo for a fullscreen lightbox with a download button.',
      },
    ],
  },
  {
    id: 'litter-offspring-management',
    title: 'Managing Offspring',
    description: 'Getting the actual animal records connected to (or created from) a litter.',
    steps: [
      {
        stepNumber: 1,
        title: 'Linking existing animals',
        content: 'If animals matching the litter\'s sire, dam, and birth date already exist in your herd, they show up as a checklist - tick any to link them to this litter. If an animal\'s birthdate doesn\'t match the litter\'s yet, you\'ll be asked to confirm before it\'s linked.',
      },
      {
        stepNumber: 2,
        title: 'Creating offspring in bulk',
        content: 'Once sire, dam, and birth date are all set, buttons like "+ Add 3 remaining males" appear based on your gender counts minus whatever\'s already linked. Clicking one creates placeholder animals (named M1, M2, F1, F2, U1, etc.) with species, parents, and birthdate pre-filled - fully editable afterward.',
      },
      {
        stepNumber: 3,
        title: 'Adding one at a time',
        content: 'The expanded card also has an inline "Add Offspring" form for creating a single animal on the spot - Name and Gender are required, with Color, Coat, and Remarks optional.',
      },
      {
        stepNumber: 4,
        title: 'The offspring grid',
        content: 'Linked offspring show as a card grid with status icons (Heart for owned, Eye for public, Hourglass/ScanHeart/Droplet for in-mating/pregnant/nursing). The orange Unlink icon removes an animal from the litter without deleting its record, while a separate bulk-delete mode (red Trash button) lets you select multiple and delete the animals themselves.',
      },
    ],
  },
  {
    id: 'litter-expanded-view',
    title: 'The Expanded Litter Card',
    description: 'What you see when you click a card open, beyond the compact summary.',
    steps: [
      {
        stepNumber: 1,
        title: 'Parents and COI',
        content: 'Sire and dam appear as clickable mini-cards (photo, name, species, ID) - clicking either opens that animal\'s full record, unless they\'ve been transferred away. The inbreeding coefficient badge sits between them, showing a loading skeleton until the calculation finishes.',
      },
      {
        stepNumber: 2,
        title: 'Breeding and birth info',
        content: 'A dedicated block lists every date and detail you\'ve recorded - mating date, expected due date, breeding method/condition, outcome (green for Successful, red for Unsuccessful), birth method, birth date with calculated age, and weaning date.',
      },
      {
        stepNumber: 3,
        title: 'Stats and photos',
        content: 'A tally section shows Born, Stillborn, Weaned, and Losses alongside the Male/Female/Unknown breakdown. Below that, any attached photos appear as a thumbnail gallery you can click through in the lightbox.',
      },
      {
        stepNumber: 4,
        title: 'Pedigree and editing',
        content: 'Horizontal and Vertical Pedigree buttons (shown once both parents are set) open that pairing\'s family tree. The Edit button reopens the full litter form - or the Edit/Convert chooser if the pairing is still only Planned.',
      },
    ],
  },
  // NOTE: the day counts below mirror crittertrack-pedigree/utils/autoWeaningDate.js (the
  // source of truth). Update both together if a species value changes.
  {
    id: 'litter-auto-calculations',
    title: 'Auto-Calculated Due & Weaning Dates',
    description: 'How the Auto due date and Auto weaning date options work, and the values used for each species.',
    searchTerms: ['auto due date', 'auto weaning date', 'gestation', 'weaning age', 'expected due date', 'wean', 'checkbox', 'species days'],
    steps: [
      {
        stepNumber: 1,
        title: 'What it does',
        content: 'Two optional helpers fill in dates for you, so the birth-due and weaning reminders work without typing anything. Auto due date sets the Expected Due Date to the mating date plus the species\' gestation. Auto weaning date sets the Weaning Date to the birth date plus the species\' weaning age. Each has its own checkbox at the top of Litter Management, and both are on by default.',
      },
      {
        stepNumber: 2,
        title: 'When a date is filled in',
        content: 'The due date is filled once a litter has a mating date, and the weaning date once it has a birth date. The species comes from the litter itself, or else from the dam, then the sire. If the species can\'t be worked out, or isn\'t in the lists below, nothing is filled in and the date stays blank for you to enter.',
      },
      {
        stepNumber: 3,
        title: 'Values: rodents and small mammals',
        content: 'Species: days from mating to birth (due date) / days from birth to weaning\nFancy Mouse: 19 / 31\nFancy Rat: 21 / 40\nSyrian Hamster: 16 / 28\nDwarf Hamsters (Russian, Campbells, Chinese, Roborovski): 18 / 24\nGuinea Pig: 63 / 21\nGerbil: 24 / 21\nFat-tailed Gerbil: 19 / 21\nNatal Rats: 23 / 21\nDeer Mouse: 22 / 21\nAfrican Pygmy Mouse: 18 / 21\nAfrican Pygmy Dormouse: 24 / 35\nDegu: 87 / 28\nChinchilla: 105 / 42\nPrairie Dog: 34 / 42',
      },
      {
        stepNumber: 4,
        title: 'Values: other mammals',
        content: 'Species: days from mating to birth (due date) / days from birth to weaning\nRabbit (also Rabbit (Domesticated)): 28 / 28\nFerret: 41 / 42\nCat: 63 / 42\nDog: 58 / 42\nHedgehog: 34 / 28\n\nSpecies that aren\'t listed (for example Sugar Gliders), and all fish, reptiles, invertebrates, birds and amphibians, get no automatic dates.',
      },
      {
        stepNumber: 5,
        title: 'Treat them as estimates',
        content: 'The numbers are the low end of each species\' typical range, so a reminder arrives a little early rather than late. Real gestation can run several days longer - guinea pigs especially, where 63 to 68 days is normal. Use the date as a heads-up and enter the actual date when the birth or weaning happens.',
      },
      {
        stepNumber: 6,
        title: 'What it never overwrites',
        content: 'A date you typed yourself is never replaced. A litter you\'ve confirmed with \"Wean Today\", and a litter marked as a lost pregnancy, are left alone. If a date was filled in automatically and you later correct the mating or birth date (or the species), it updates to match. Clearing a date and saving fills it in again while the option is on.',
      },
      {
        stepNumber: 7,
        title: 'Turning it off',
        content: 'Untick Auto due date or Auto weaning date to stop that one - they are independent, and your choice is saved to your account. Turning one off only stops new dates being filled in: dates already on your litters stay until you edit them. Reminders and the Calendar use whatever date is on the litter, so with an option off, no reminder appears until you enter a date yourself.',
      },
      {
        stepNumber: 8,
        title: 'How long a weaning reminder lasts',
        content: 'The weaning reminder keeps showing from the weaning date until a cut-off counted from the birth date. After that, a litter nobody confirmed is closed automatically and the dam\'s Nursing status clears. The cut-off is the weaning age plus 14 days for rodents and plus 31 days for other mammals - for example a Fancy Mouse litter closes 45 days after birth (31 + 14), and a Rabbit litter 59 days after birth (28 + 31). Tap \"Wean Today\" to close a litter sooner.',
      },
    ],
  },
];

// "More Pages & Tools" section - Contacts, Marketplace, Calendar, Community, the Tools
// calculators, Finance, Messages/Notifications, Breeder Directory, and support pages.\n