// Tutorial lessons content is being reworked — rebuilt one lesson at a time.
const GETTING_STARTED_LESSONS = [
  {
    id: 'getting-started-welcome',
    title: "Welcome — You're Logged In",
    description: "A quick orientation to what this Getting Started section covers before diving into the rest of CritterTrack.",
    steps: [
      {
        stepNumber: 1,
        title: "You're in!",
        content: "If you're reading this, you've already signed up and verified your email — that's how you got here. This Getting Started section picks up right after your first login.",
      },
      {
        stepNumber: 2,
        title: "What we'll cover",
        content: "Next up: a quick tour of the app's layout and navigation, how to create and edit your first animal, and the account settings worth checking early on (like your public profile visibility and the Breeder Registry).",
      },
    ],
  },
  {
    id: 'getting-started-layout-tour',
    title: 'App Layout Tour',
    description: 'A quick tour of the main navigation bar and the icons/menus you\'ll use every day.',
    steps: [
      {
        stepNumber: 1,
        title: 'Main navigation',
        content: 'Across the top: Animals, Litters, Contacts, Marketplace, Calendar, Community, Tools, and Finance. Each one takes you to a full page for that area of the app.',
      },
      {
        stepNumber: 2,
        title: 'Tools menu',
        content: 'The Tools dropdown holds: Tutorials (this page), Offspring Calculator, COI Calculator, Target Outcome Calculator, and Family Tree Explorer.',
      },
      {
        stepNumber: 3,
        title: 'Finance menu',
        content: 'The Finance dropdown holds: Budget Tracker and Supplies.',
      },
      {
        stepNumber: 4,
        title: 'Top-right icons',
        content: 'From left to right: the theme toggle (light/dark/auto), a push notifications quick-toggle for this device, the Notifications bell (purple badge = unread count), and the Messages icon (red badge = a message from CritterTrack staff, purple = a message from another user).',
      },
      {
        stepNumber: 5,
        title: 'Your profile avatar',
        content: 'Click your avatar (top-right corner) to open a menu with Profile, Report an Issue and Logout.',
      },
      {
        stepNumber: 6,
        title: 'Info buttons',
        content: 'Look for a small ⓘ icon near a page\'s title — click it for a quick contextual hint about that page, including a link to a related tutorial like this one when available.',
      },
    ],
  },
  {
    id: 'getting-started-animals',
    title: 'Creating and Editing Animals',
    description: 'How to add a new animal, what the edit form covers, and a few things that trip people up early on.',
    steps: [
      {
        stepNumber: 1,
        title: 'Click "Add Animal"',
        content: 'From the My Animals page, click the "Add Animal" button (top of the list on desktop, or the + icon in the title row on mobile).',
      },
      {
        stepNumber: 2,
        title: 'Pick a species',
        content: 'This opens the Select Species screen first. Search by name, filter by category, or star a species to favorite it for next time. Don\'t see your exact species? Click "Add New Species" to define a custom one.',
      },
      {
        stepNumber: 3,
        title: 'Fill out the new animal form',
        content: 'Picking a species opens the "Add New [Species]" form. Name is the only field you truly have to fill in — everything else can be filled in now or left for later.',
      },
      {
        stepNumber: 4,
        title: 'The form is organized into tabs',
        content: 'Dashboard, Identification, Appearance, Health, Routine Care, Behavior, Breeding, Pedigree, Gallery, Timeline, and Records. You don\'t need to fill out every tab right away — save with just the required field and come back later.',
      },
      {
        stepNumber: 5,
        title: 'Editing an existing animal',
        content: 'Click an animal\'s card and use the Edit (pencil) icon, or open its detail view and click Edit in the header.',
      },
      {
        stepNumber: 6,
        title: 'Linking a Sire/Dam',
        content: 'On the Pedigree tab, each ancestor slot (Sire, Dam, and further generations) has a Manual / Link CTC toggle. "Link CTC" searches for a real animal already on CritterTrack to connect as the actual parent — it can be one of your own animals, or any other public animal on the site. To link this way, the parent needs to already exist as an animal record on CritterTrack. "Manual" just lets you type in a name and details by hand for a parent that isn\'t tracked in CritterTrack — this only fills in the display for this specific animal\'s own pedigree, it doesn\'t create a real link, doesn\'t carry over to siblings/offspring/other relatives, and isn\'t used in COI calculations.',
      },
      {
        stepNumber: 7,
        title: 'Public vs. Private',
        content: 'Each animal has its own Eye (public, green) / Eye-off (private, gray) icon on its card in My Animals. Public animals can appear on your public breeder profile and pedigrees; Private animals are fully hidden from everyone else. This is set per-animal.',
      },
      {
        stepNumber: 8,
        title: 'Owned vs. Unowned',
        content: 'Every animal you create defaults to "Owned." Use the Heart / Heart-off button on its card to flip this label — handy for animals you created but don\'t currently have in your possession (co-owned, borrowed, or only added for pedigree). The "Owned"/"All" buttons at the top of the list just filter by this same label, and bulk actions exist to mark many animals at once. Flipping this label never sells, transfers, or archives an animal — actually transferring ownership to another user is a separate process, covered in the next lesson.',
      },
      {
        stepNumber: 9,
        title: 'A few features live here but are managed elsewhere',
        content: 'Enclosure assignment, Health/Quarantine & Treatment, Feeding/Grooming/Training schedules, Marketplace availability, Breeding Line assignment, and Seller/Buyer contact linkage can all be set from this same edit form, but you\'ll do the day-to-day work on their own dedicated pages — each covered in a later lesson.',
      },
    ],
  },
  {
    id: 'getting-started-transfers',
    title: 'Transferring Animal Ownership',
    description: 'A closer look at the Transfer feature — this one trips people up, so it gets its own lesson.',
    steps: [
      {
        stepNumber: 1,
        title: 'Starting a transfer',
        content: 'The two-way-arrows "Transfer" button lives in the animal\'s detail view header, next to Edit. Click it and search for the recipient by name or CTU ID.',
      },
      {
        stepNumber: 2,
        title: 'Nothing changes until they accept',
        content: 'Sending a transfer doesn\'t move ownership right away — the recipient gets a notification with Accept or Decline options, and the animal stays fully yours until they act on it.',
      },
      {
        stepNumber: 3,
        title: 'Withdrawing a pending transfer',
        content: 'While a transfer is pending, that same header button becomes a "Withdraw" action (shown in red) so you can cancel it before the recipient responds.',
      },
      {
        stepNumber: 4,
        title: 'What happens after acceptance',
        content: 'Once accepted, the recipient becomes the new owner with full edit access. You\'re automatically kept on as the original breeder with permanent view-only access, so pedigree and history stay intact.',
      },
      {
        stepNumber: 5,
        title: 'Returning an animal to its original breeder',
        content: 'If you\'re ever on the receiving end of a transfer, a "Return to original breeder" button (amber) appears in that animal\'s header, letting you hand it straight back whenever you want.',
      },
      {
        stepNumber: 6,
        title: 'Where transferred animals end up on your list',
        content: 'Once an animal is transferred away, it\'s automatically pulled from your active My Animals list and counted under "Sold/Archived" instead — a dedicated lesson later covers that Archive section in full.',
      },
    ],
  },
  {
    id: 'getting-started-account-settings',
    title: 'Account Settings & the Breeder Registry',
    description: 'Where your public profile visibility and breeder status actually live, and why a "blank" profile is usually just a checkbox.',
    steps: [
      {
        stepNumber: 1,
        title: 'Getting to Settings',
        content: 'Click your avatar (top-right) → Profile to view your own public profile, then click the "Profile Settings" button (gear icon) to open Settings.',
      },
      {
        stepNumber: 2,
        title: 'Settings has 7 tabs',
        content: 'Profile, Info & Adoption, Directory, Ratings, Breeding Lines, Data Portability, and Account.',
      },
      {
        stepNumber: 3,
        title: 'Public Profile Visibility',
        content: 'On the Profile tab, a "Public Profile Visibility" checklist controls what shows on your public profile card: Display Personal Name, Display Breeder Name (only appears once you\'ve set a breeder name), Display Email Address, Display Website URL, Display Social Media Link, Display Bio, and Show Stats tab. Only Display Personal Name is on by default — if your public profile looks empty or your breeder name isn\'t showing, check these boxes first.',
      },
      {
        stepNumber: 4,
        title: 'Fully anonymous is possible, but hides you completely',
        content: "If you turn off both Display Personal Name and Display Breeder Name, you won't be visible anywhere on the site's public side — including the Breeders Registry, Community Feed, and Marketplace listings — even if you've opted into any of those separately.",
      },
      {
        stepNumber: 5,
        title: 'The Breeder Registry (Directory tab)',
        content: 'This isn\'t one on/off switch — it\'s a "Species & Breeding Status" dropdown per species you own animals of: 🏠 Owner (default, not listed), ⭐ Active Breeder, or 🌙 Retired Breeder. Marking a species as Active or Retired Breeder is what makes you searchable there. Save with the "Save Breeding Status" button.',
      },
      {
        stepNumber: 6,
        title: 'Directory listing also needs a public name',
        content: "Opting a species into the Registry isn't enough on its own — you also need Display Personal Name or Display Breeder Name checked on the Profile tab, or you still won't appear in Directory search results.",
      },
    ],
  },
  {
    id: 'getting-started-list-basics',
    title: 'My Animals — The Basics',
    description: 'The one thing worth knowing early about your main list, before the full tour later on.',
    steps: [
      {
        stepNumber: 1,
        title: 'A stat row lives up top',
        content: 'Total Animals, Owned, Public, Sold/Archived, and Needs Attention — most are clickable for a quick breakdown. The Owned/All toggle here filters every tab (Collections, Enclosures, Reproduction, Health, Feeding & Care), not just this list.',
      },
      {
        stepNumber: 2,
        title: 'More on this later',
        content: 'Filters, sorting, Card vs. Table view, bulk actions, and everything else on this page gets its own full lesson in "The Animal List: A Tab-by-Tab Tour" section.',
      },
    ],
  },
];

// "The Animal Record" section — one lesson per form tab, built one at a time.
const ANIMAL_RECORD_TAB_LESSONS = [
  {
    id: 'animal-tab-dashboard',
    title: 'Animal Record: Dashboard Tab',
    description: 'Photos, identity, breeder/owner assignment, and Marketplace availability.',
    steps: [
      {
        stepNumber: 1,
        title: 'Photos',
        content: 'A main photo on the left with up to 3 thumbnails below it. Click the dashed + tile to upload more. Hover a thumbnail and click its star to make that image the main photo instead.',
      },
      {
        stepNumber: 2,
        title: 'Identity',
        content: 'Prefix / Name / Suffix, Gender, Date of Birth, Status (with a Deceased Date field that only appears once Status is set to Deceased). Changing Status to Rehomed pops up a confirmation asking if you\'d also like to archive the animal\'s record — archiving hides it from your main lists but keeps it fully intact in pedigrees. A free-text Remarks box is also here for general notes.',
      },
      {
        stepNumber: 3,
        title: 'Assigning a Breeder or Owner',
        content: 'Click the Breeder or Owner field to open the Assign modal. It has 3 modes: "Search User" (find any CritterTrack user by name or CTU ID), "Select Contact" (pick from your own saved Contacts), or "Manual Entry" (just type a name for someone not on CritterTrack). The same modal and 3 modes are reused later for Seller/Buyer on the Records tab.',
      },
      {
        stepNumber: 4,
        title: 'Co-Ownership Details',
        content: 'A free-text note field below Breeder/Owner for writing out co-ownership terms, breeding rights, or any other arrangement — this is just a note, not a linked contact.',
      },
      {
        stepNumber: 5,
        title: 'Availability',
        content: 'Two independent checkboxes: "Available for Sale" (with a price + currency, or "Negotiable") and "Available for Stud/Breeding" (with a fee + currency). Checking one is what actually puts the animal on the Marketplace — but only once the animal\'s own Public/Private toggle is also set to Public.',
      },
    ],
  },
  {
    id: 'animal-tab-identification',
    title: 'Animal Record: Identification Tab',
    description: 'ID numbers, classification, origin, and tags — all in collapsible sections.',
    steps: [
      {
        stepNumber: 1,
        title: 'Identification Numbers',
        content: 'Breeder Assigned ID and Colony ID are always available. Microchip Number, Pedigree Registration ID, Tattoo ID, Ring ID, and Ear Tag only appear if your species uses them — this keeps the form from showing irrelevant fields like "Ear Tag" on a fish.',
      },
      {
        stepNumber: 2,
        title: 'Additional Identifiers',
        content: 'Need to track something with no dedicated field (e.g. a DNA test ID or a club registration number)? Type a Title and Value, then click the green + button to add it as its own row. Add as many as you like, and click the trash icon on any row to remove it.',
      },
      {
        stepNumber: 3,
        title: 'Classification',
        content: 'Species is locked and can never be changed after the animal is created. Breed is free text, and Strain (for species that use it) is a free-text field for genetic/research lines like "C57BL/6" or "Wistar".',
      },
      {
        stepNumber: 4,
        title: 'Origin',
        content: 'A simple dropdown for species that track it: Captive-bred, Wild-caught, or Rescue.',
      },
      {
        stepNumber: 5,
        title: 'Tags',
        content: 'A free-form tagging field for anything you want to group by — lines, enclosures, projects, etc. Type a tag and press Enter or comma to add it, Backspace on an empty field removes the last tag, and each tag shows as a pill you can click the × on to remove individually.',
      },
    ],
  },
  {
    id: 'animal-tab-appearance',
    title: 'Animal Record: Appearance Tab',
    description: 'Descriptive traits, the visual Genetic Code Builder, Life Stage, and growth tracking.',
    steps: [
      {
        stepNumber: 1,
        title: 'Appearance fields',
        content: 'Color, Pattern, Coat Type, Morph, Markings, Eye Color, Size, and Carrier Traits are free text so you can describe your animal however your species/hobby community does. A few fields are species-specific and only appear when relevant — e.g. Earset only shows up for Rats, and Nail Color only for species that track it.',
      },
      {
        stepNumber: 2,
        title: 'Genetic Code Builder',
        content: 'For Fancy Mouse and Fancy Rat, click the "Add" button to open a full visual builder: a dropdown per gene locus, with a live-updating Phenotype and Carried gene preview as you pick genotypes. Use "Switch to Manual" to type/paste a code directly instead (e.g. "A/A B/b C/C"). For every other species, it\'s a simple manual text field — if your species isn\'t supported yet, you can click "Submit Genetics Info" to help the community add it.',
      },
      {
        stepNumber: 3,
        title: 'Life Stage',
        content: 'A dropdown: Newborn, Juvenile, Sub-Adult, Adult, Senior, or Mixed. This isn\'t auto-calculated from age — you set it manually.',
      },
      {
        stepNumber: 4,
        title: 'Adding a measurement',
        content: 'Under "Add New Measurement," pick a date and enter Weight, Body Length, Height at Withers, Chest Girth, and/or a Body Condition Score (the BCS scale itself changes based on species — Dogs use a 1-9 scale, Cats and others use 1-5). Add optional Notes, then click "Add Measurement" to save it as a new dated entry.',
      },
      {
        stepNumber: 5,
        title: 'Tracking growth over time',
        content: 'A "Current Measurements" summary always shows the most recent values. Once you\'ve logged 2+ weight entries, a Weight Growth Curve chart appears automatically — hover any point to see its exact date/weight/notes. You can switch Weight and Length units anytime (g/kg/lb/oz, cm/m/in/ft), and delete any past entry from the Measurements list with the trash icon.',
      },
    ],
  },
  {
    id: 'animal-tab-health',
    title: 'Animal Record: Health Tab',
    description: 'Health status, quarantine, treatment, preventive care, clearances, and end-of-life records.',
    steps: [
      {
        stepNumber: 1,
        title: 'Health Status & Manual Override',
        content: 'The badge at the top (Healthy / Monitoring / Concern / Critical) is calculated automatically from what\'s recorded on this tab — hover the info icon to see exactly which factors are driving it. Disagree with the calculation? Click "Enable Override" to set your own status and write a reason (e.g. "well-managed chronic condition, good prognosis") — the calculated status is still shown alongside it for reference.',
      },
      {
        stepNumber: 2,
        title: 'Quarantine Status',
        content: 'Set Status to Quarantine or Isolation, pick a Type/Reason (Preventive - New Arrival, Medical - Contagious Disease, Behavioral - Aggression, etc.), and a Start Date. Add an End Date once it\'s over — a past/today End Date automatically clears the status. Quarantined animals also collect in the Health management tab (My Animals → Health) under a dedicated Quarantine section, where you can review Type/Start/End at a glance and click "Release" to end quarantine without opening the animal at all.',
      },
      {
        stepNumber: 3,
        title: 'Treatment (Medications)',
        content: 'Adding an active medication is what marks the animal as "In Treatment" and factors into its health status. Choose "Manual Entry" to type a medication\'s name/dose/reason/dates yourself, or "From Supplies" to search and pick one from your own tracked Supplies inventory (which pre-fills the name and lets you set dose/reason/dates on top of it). Either way, set an optional recurring Interval (e.g. every 12 hours) if it\'s a repeating dose. Like Quarantine, animals In Treatment collect in the Health management tab\'s In Treatment section, showing each active medication\'s next dose due time with quick Confirm/Prolong/Finish buttons, plus an "End Treatment" button to close it out entirely.',
      },
      {
        stepNumber: 4,
        title: 'Medical Conditions & Allergies',
        content: 'Two simple running lists below Treatment — add a Condition or Allergy with a name and optional notes, and remove any entry with its trash icon. These are separate from Treatment: a chronic condition doesn\'t need an active medication to be logged here.',
      },
      {
        stepNumber: 5,
        title: 'Preventive Care',
        content: 'Log Vaccinations, Deworming, and Parasite Control treatments, each with a date and notes. For recurring prevention (e.g. monthly flea/tick treatment), use "Prevention Schedule" to set a treatment name, start date, and repeat interval — this creates a recurring reminder rather than a one-time record.',
      },
      {
        stepNumber: 6,
        title: 'Health Clearances & Screening',
        content: 'Add structured clearances like OFA Hips/Elbows/Cardiac/Eyes, PennHIP, CAER Eyes, or a general Genetic Test/Health Panel — each with a Result, Date Issued, and optional Certificate ID. Below that, a few free-text "Other Health Information" fields remain for Spay/Neuter Date, Heartworm Status, Genetic Test Results, and Chronic Conditions notes.',
      },
      {
        stepNumber: 7,
        title: 'Procedures, Labs & Vet Visits',
        content: 'Medical Procedures and Lab Results are both simple dated entries with a name/test and notes or result. Veterinary Care holds your Primary Veterinarian\'s name plus a running log of Veterinary Visits (date, reason, notes) — useful for a quick history without digging through the Timeline tab.',
      },
      {
        stepNumber: 8,
        title: 'End of Life',
        content: 'Only relevant once Status is set to Deceased on the Dashboard tab: Deceased Date, Cause of Death, Necropsy Results, and End of Life Care Notes (e.g. wishes for cremation, burial, or memorial).',
      },
    ],
  },
  {
    id: 'animal-tab-care',
    title: 'Animal Record: Care Tab',
    description: 'Feeding, enclosure assignment, environment, grooming, and recurring care tasks.',
    steps: [
      {
        stepNumber: 1,
        title: 'Nutrition',
        content: 'Set a Feeding Schedule with "Feed Every (hours)" — type a value or click a quick preset chip (6h, 8h, 12h, 24h, 48h, 72h, 1wk); Last Fed is read-only here and only updates when you log a "Fed" action in the Feeding & Care tab. This schedule is what drives that animal\'s entry in the Feeding & Care management view, showing you exactly when it\'s next due to be fed. For Diet and Supplements, choose "Manual Entry" to type a name (and dosage, for supplements) yourself, or "From Supplies" to search and add items straight from your own tracked Supplies inventory — either way you can add multiple and remove any with its trash icon. Round it out with free-text Portion Size, Feeding Method, Feeding Location, Water Access, and Feeding Pace & Behavior Notes.',
      },
      {
        stepNumber: 2,
        title: 'Enclosure Assignment',
        content: 'Click "Search & Assign Enclosure" to open the enclosure picker. Once assigned, the enclosure\'s card shows its photo, occupancy (current/capacity), dimensions, purpose, type, temperature/humidity ranges, lighting, bedding, and enrichment at a glance — click the unlink icon to unassign without deleting the enclosure itself.',
      },
      {
        stepNumber: 3,
        title: 'Creating a new enclosure on the fly',
        content: 'Don\'t have the right enclosure yet? In that same picker, switch to the "Create" tab instead of "Search". Fill in Name (required), Type, Purpose, Building/Room, Dimensions, Capacity, and Environment details (temperature/humidity range, lighting, bedding, enrichment), then click Confirm — the enclosure is created and automatically assigned to this animal in one step, no need to leave the animal record first. It also immediately shows up in the Enclosures management tab (My Animals → Enclosures) alongside every other enclosure, ready to edit, view occupancy, or reassign later.',
      },
      {
        stepNumber: 4,
        title: 'Environment Needs',
        content: 'Free-text fields for anything about the animal\'s surroundings that isn\'t tied to the enclosure record itself: Lighting Type & Schedule, Noise Level Tolerance & Sound Preferences/Triggers, and Enrichment Needs & Schedule/Frequency.',
      },
      {
        stepNumber: 5,
        title: 'Grooming & Coat Care',
        content: 'Covers General Grooming Needs & Shedding Level, Brushing & Bathing Frequency (plus Coat/Feather/Scale Care Notes), and Specialized Care like Nail/Claw/Hoof, Beak/Hoof/Scale, Skin & Ear, and Dental care requirements. Most of these have their own optional recurring schedule ("Every N days") — set the frequency here, then mark each one done from the Feeding & Care management view, which is also where its "last done" date will show up.',
      },
      {
        stepNumber: 6,
        title: 'Special Requirements & Preferences',
        content: 'Dietary Requirements & Restrictions and Dietary Preferences cover food-specific notes (allergies, favorite treats, refusals). Special Care Needs and Special Observations (each with their own optional recurring schedule) are for anything else worth tracking on a schedule — medication timing quirks, molting isolation, heat lamp requirements. Additional Special Requirements is a catch-all free-text box for anything that doesn\'t fit elsewhere.',
      },
      {
        stepNumber: 7,
        title: 'Animal Care Tasks',
        content: 'For direct, hands-on tasks that aren\'t feeding and aren\'t medical (e.g. Nail Trim, Weigh-In, Litter Box Spot-Change, Handling/Socialization Session) — type a task name (suggestions appear as you type), an optional recurring frequency in days, and optional notes, then click "+ Add Animal Care Task". Every task you add here shows up in the "Scheduled Care" section of the Feeding & Care management view, where you\'ll actually mark it done day to day.',
      },
    ],
  },
  {
    id: 'animal-tab-behavior',
    title: 'Animal Record: Behavior Tab',
    description: 'Temperament, training, safety concerns, and detailed behavioral traits.',
    steps: [
      {
        stepNumber: 1,
        title: 'Behavior & Temperament',
        content: 'The basics: free-text Temperament (e.g. friendly, skittish, aggressive), Handling Tolerance (how well it takes being handled), and Social Structure (who it lives with — cage mates, solitary, group housing).',
      },
      {
        stepNumber: 2,
        title: 'Activity & Training',
        content: 'Activity Cycle is a dropdown (Diurnal/Nocturnal/Crepuscular). Exercise Requirements and Daily Exercise (minutes), Training Level, and Training Disciplines are species-conditional free-text/number fields. Checkboxes mark Crate Trained, Litter Trained, Leash Trained, and Free-Flight Trained — whichever apply to that species.',
      },
      {
        stepNumber: 3,
        title: 'Working Role & Certifications',
        content: 'For animals with a job or titles: Working Role (e.g. Service dog, Therapy dog, Show dog, Guard dog) and a free-text Certifications & Titles box (e.g. CGC, AKC titles, Service Dog Certified, show wins).',
      },
      {
        stepNumber: 4,
        title: 'Known Issues & Safety Concerns',
        content: 'Five focused notes fields: Behavioral Issues (e.g. resource guarding, separation anxiety), Bite History, Reactivity & Triggers (thresholds and management strategies), Escape & Flight Risk (a Risk Level dropdown from No Risk to Critical, plus Escape Methods & Flight Triggers notes), and Stereotypic & Stress Behaviors (repetitive behaviors like pacing or feather plucking, plus general stress indicators).',
      },
      {
        stepNumber: 5,
        title: 'Training Schedules',
        content: 'Optional recurring schedules ("Every N days") for Daily Exercise, Crate/Litter/Leash/Free-Flight Training, Working Role Training, Behavioral Issue Training, Reactivity Training, and Flight Risk Training. Set the frequency here, then mark sessions done from the Feeding & Care management view, where these all cluster together and show their "last done" date.',
      },
      {
        stepNumber: 6,
        title: 'Temperament Assessment (1-5 Scale)',
        content: 'Five slider-based ratings for a quick numeric snapshot: Aggression Level (with Triggers & Types notes), Fear/Anxiety Level (with Specific Fears & Coping Mechanisms notes), Boldness/Exploratory Level, Sociability Level, and Independence Level. Each slider runs 1-5 with the meaning of each end labeled underneath.',
      },
      {
        stepNumber: 7,
        title: 'Specialized Behavioral Traits',
        content: 'Deeper traits for animals where they matter: Prey Drive & Hunting Behavior (level dropdown plus notes), Feeding Behavior (Food Aggression Level, Eating Speed, and Food Preferences/Pickiness notes), Bonding & Attachment Style (Attachment Type dropdown plus Bonding Behavior notes, species-conditional), and Sensory Sensitivities (Noise/Touch/Light sensitivity dropdowns plus general notes).',
      },
    ],
  },
  {
    id: 'animal-tab-breeding',
    title: 'Animal Record: Breeding Tab',
    description: 'Reproductive state, fertility, cycle tracking, outcomes, and manual breeding logs.',
    steps: [
      {
        stepNumber: 1,
        title: 'Current Reproductive State',
        content: 'Planned Mating, In Mating, Pregnant, and Nursing flags are all auto-calculated from real Litter Management records — you don\'t normally set these directly. Once a cycle fully wraps up, click "Finish Cycle / Clear State" to reset all four flags at once. Need to correct the calculation? Click "Enable Override" to manually check/uncheck each flag and give a Reason — a running Pregnancy History list (with delete buttons) also appears here once there are past pregnancies on record. Whichever state is active shows as a colored pill right on the animal\'s card in My Animals (Pregnant takes priority, then Nursing, then In Mating, then Planned Mating), and all of these animals are grouped together in the Reproduction management tab (My Animals → Reproduction).',
      },
      {
        stepNumber: 2,
        title: 'Fertility Status',
        content: 'A single dropdown — Fertile, Subfertile, Infertile, Spayed/Neutered/Castrated, Unknown, or Not Applicable (gender determines which spay/neuter option shows). This choice controls what else appears further down: the Reproductive Cycle, Conception & Mating History, and Pregnancy/Development Details sections only show up when Fertility Status is Fertile, Subfertile, Infertile, or Unknown.',
      },
      {
        stepNumber: 3,
        title: 'Reproductive Cycle & Conception History',
        content: 'Reproductive Cycle tracks Last Reproductive Event Date, Cycle Length (days), and Current Reproductive Phase (Available/In Cycle/Resting/Unknown). Conception & Mating History tracks Last Conception Date plus lifetime Successful Conception Count and Unsuccessful Conception Attempts.',
      },
      {
        stepNumber: 4,
        title: 'Pregnancy/Development Details',
        content: 'Not shown for males. Covers Development Period Start and Length (days), Expected Delivery Date, and Development Method (Natural, Assisted, Artificial Incubation, Unknown) — useful for anything from live-bearing gestation to egg incubation.',
      },
      {
        stepNumber: 5,
        title: 'Reproductive Outcomes & Nursing',
        content: 'Lifetime totals: Total Offspring Produced, Viable Offspring Count, Reproductive Event Count (litters/clutches), and overall Reproductive Event Outcome (Successful/Partial/Failed/Unknown). Dependent Care End Date marks when weaning, fledging, or independence happened for the most recent litter.',
      },
      {
        stepNumber: 6,
        title: 'Reproductive Health & Delivery',
        content: 'Reproductive Health & Procedures covers Artificial Reproduction Method (AI, Embryo Transfer, In Vitro), Last Reproductive Intervention Date, a "Dependent Care Required" checkbox for species that need parental care, and a free-text Reproductive Health Notes box for clearances/restrictions. Delivery & Breeding Health tracks Last Delivery Date, Delivery Method, Reproductive Complications, and (species-conditional) Reproductive Clearances.',
      },
      {
        stepNumber: 7,
        title: 'Add Breeding Record (Manual Log)',
        content: 'A red warning banner is there for a reason: this only adds a manual note — it does NOT create a real Litter, link offspring, or affect pedigree/COI calculations. Use it for quick historical logging (Breeding Method, Mating Date, Mate — pick "Select from DB" to link an existing animal or type a name manually, Outcome, Birth/Lay Date, Litter Size, Notes). For anything that should actually appear in pedigrees and inbreeding calculations, use Litter Management instead to record a real litter.',
      },
    ],
  },
  {
    id: 'animal-tab-pedigree',
    title: 'Animal Record: Pedigree Tab',
    description: 'Editing ancestry directly on the animal record, three generations deep.',
    steps: [
      {
        stepNumber: 1,
        title: 'Manual vs. Link CTC, and what actually counts',
        content: 'As covered in the Getting Started tour, every ancestor slot has a Manual / Link CTC toggle. It\'s worth repeating here because it drives everything else on this tab: only Link CTC ancestors (real animal records on CritterTrack) are used for COI calculations and the main pedigree chart. Manual entries are purely for this animal\'s own display — they don\'t create a real link, don\'t affect COI, and don\'t propagate to that ancestor\'s other relatives\' pedigrees. Nothing here saves until you click Save Animal.',
      },
      {
        stepNumber: 2,
        title: 'Linking a CritterTrack ancestor',
        content: 'Switch a slot to "Link CTC" and click "Search CTC Animal?" to open the search modal — it can match one of your own animals or any other public animal on the site, and automatically filters to the correct gender for that slot (e.g. only males for a Sire slot). Once linked, the slot shows that animal\'s photo, name, variety, and CTC ID; click "Unlink" to remove the connection without deleting anything.',
      },
      {
        stepNumber: 3,
        title: 'Entering a manual ancestor',
        content: 'Switch a slot to "Manual" to type in Name, Variety/Morph, Genetic Code, Birth Date, and Breeder Name by hand, plus optionally upload a photo just for this ancestor slot. Use this for ancestors that aren\'t (or can\'t be) tracked as real CritterTrack records.',
      },
      {
        stepNumber: 4,
        title: 'Three generations of ancestors',
        content: 'Generation 1 is Sire and Dam. Generation 2 splits into Paternal (Grandsire/Granddam via the Sire) and Maternal (Grandsire/Granddam via the Dam). Generation 3 goes one step further — Great-Grandparents are grouped by which grandparent they came through ("via Grandsire" / "via Granddam") on each side. Every one of these slots supports Manual or Link CTC independently, so you can mix and match — for example, a linked Sire with a manual, unlinked Great-Grandsire.',
      },
    ],
  },
  {
    id: 'animal-tab-gallery',
    title: 'Animal Record: Gallery Tab',
    description: 'Uploading photos and managing the animal\'s photo gallery.',
    steps: [
      {
        stepNumber: 1,
        title: 'Adding photos (from the Dashboard tab)',
        content: 'Photos aren\'t added from the Gallery tab itself — click the "+" tile next to the main photo on the Dashboard tab (or the empty main image box) to pick one or more files. Each one opens in an editor where you can rotate and crop before it\'s added; images are also automatically compressed toward a small file size so galleries stay fast to load.',
      },
      {
        stepNumber: 2,
        title: 'Managing the gallery',
        content: 'Once you have photos, switch to the Gallery tab for the full management view. Hover any image for controls: the star sets it as the primary photo (the one shown on cards and as the main Dashboard image — outlined in your accent color), the left/right arrows reorder it, and the trash icon deletes it. A number badge on each photo always shows its current position, with position 1 being primary.',
      },
    ],
  },
  {
    id: 'animal-tab-timeline',
    title: 'Animal Record: Timeline Tab',
    description: 'An auto-built history of everything that\'s happened to this animal, plus milestones and notes.',
    steps: [
      {
        stepNumber: 1,
        title: 'Event Filters',
        content: 'The Timeline auto-aggregates events from across the whole animal record — Health Events, Breeding Events, Keeper & Ownership Events, Show Events, Milestones, Status Changes, Feeding History, Care Schedule Updates, and Field Edits. Uncheck any category here to hide it from the Timeline Events list below without deleting anything.',
      },
      {
        stepNumber: 2,
        title: 'Milestones',
        content: 'Add your own custom timeline entries that aren\'t auto-generated — a Label, a Date, and an optional recurring Interval (every N weeks/months/years) for things like "First Show" or a recurring "Anniversary of Adoption". Remove any milestone with its trash icon.',
      },
      {
        stepNumber: 3,
        title: 'Timeline Events',
        content: 'All events (auto-aggregated + your Milestones) appear here in one combined list, each showing its date, type, and description. Click the star on any event to pin it — pinned events move up into their own "Pinned Events" section above "All Events", so the moments that matter most stay easy to find without scrolling. This same event list also seeds the "Recent Activity" card on the animal\'s read-only Dashboard view (its top 5 most recent events) — so anything the Timeline picks up shows there too.',
      },
      {
        stepNumber: 4,
        title: 'Event Annotations',
        content: 'Click "Add Note to Event" to attach a free-text note to any specific event on the Timeline — pick the event from the dropdown, write your note, and Save. Notes show up directly under that event (with their own delete button), letting you add context (e.g. "Vet said this was just stress-related, not a real relapse") without editing the original record.',
      },
    ],
  },
  {
    id: 'animal-tab-records',
    title: 'Animal Record: Records Tab',
    description: 'Ownership history, show results, sale/purchase terms, and legal documentation.',
    steps: [
      {
        stepNumber: 1,
        title: 'Ownership History',
        content: 'Log past keepers with "Manual Name" (just type a name) or "Select User" (search any CritterTrack user by name or CTU ID and pick them from the results). Add an Ownership Type (Breeder, Pet Owner, Sanctuary, Foster, Show Home, Research, Other), Start Date, and Country — each entry then shows in a list with its flag, dates, and type, removable with its X button.',
      },
      {
        stepNumber: 2,
        title: 'Show & Performance',
        content: 'Add structured Show Events with Date, Show Name, Title Earned, Judge Name, Score/Placement, and Judge Comments — each becomes its own removable entry. Below that, a set of legacy free-text fields (Show Titles, Working Titles, Show Ratings & Placements, Judge Comments & Evaluations, Performance Scores & Assessments) remain for backward compatibility with older/imported data.',
      },
      {
        stepNumber: 3,
        title: 'Sale & Purchase',
        content: 'Purchase side: Purchase Date, Purchase Price + Currency, Seller Name, and Seller Contact Info (click "Select Contact" to reuse the same Assign modal from the Dashboard tab — Search User / Select Contact / Manual Entry). Sale side mirrors it with Sale Date, Sale Price + Currency, Buyer Name, and Buyer Contact Info. Below that: Breeding/Show/Export Rights and Stud Services Allowed dropdowns, plus free-text Resale Restrictions and Breeder Buyback Clause.',
      },
      {
        stepNumber: 4,
        title: 'Legal & Documentation',
        content: 'Free-text fields for License Number & Jurisdiction, Insurance, Legal Status, and Breeding/Export Restrictions. "Upload Document" accepts PDF, DOC, DOCX, or Pages files up to 10MB — useful for registration papers, contracts, or health certificates. Uploaded documents show as a clickable list (opens in a new tab) with a trash icon to remove any of them.',
      },
    ],
  },
  {
    id: 'animal-tab-view-only',
    title: 'Animal Record: View-Only Extras',
    description: 'A few things that only appear when viewing an animal (not editing it) — most fields you see while viewing are just read-only mirrors of the edit form, but these are new.',
    steps: [
      {
        stepNumber: 1,
        title: 'Header badges & buttons',
        content: 'The pill badges next to the animal\'s name reflect its current state: Owned/Not Owned, Public/Private, an optional Status and Life Stage pill, its Health Status (Healthy/Monitoring/Concern/Critical/etc.), a reproductive state pill when applicable (Pregnant, Nursing, In Mating, or Planned Mating), and For Sale / Stud pills with price when those are set. In your own (private) view, the header buttons are: the Heart toggle (Owned/Not Owned), the Eye toggle (Public/Private), Edit, Transfer (or Withdraw if a transfer is already pending, or Return to Original Breeder if this animal was transferred to you), Add Sibling, and Archive. On a public profile or someone else\'s animal, those owner-only buttons are replaced with Favorite, Share (copyable link + QR code), and Report instead.',
      },
      {
        stepNumber: 2,
        title: 'Relationship Insights',
        content: 'On the read-only Dashboard view, "Relationship Insights" auto-builds this animal\'s wider family tree — Parents, Siblings, Nieces & Nephews, Aunts & Uncles, Grandparents, and Great-Grandparents — grouped and labeled automatically (with Paternal/Maternal sides split where relevant). This is computed from linked pedigree data across your whole collection, not just what\'s entered directly on this one record, so it can surface relatives you didn\'t manually connect. Click any relative\'s card to jump straight to their own record.',
      },
      {
        stepNumber: 3,
        title: 'Offspring & Litters',
        content: 'Also on the Dashboard view, "Offspring & Litters" combines two sources into one list: real Litter Management records where this animal is sire or dam (showing Planned/Mated/Pregnant/Born status, mate, COI, and birth counts by sex), plus any "pedigree-only" offspring — animals whose Pedigree tab links back to this one as a parent but that were never entered as a formal Litter. Click any entry to expand full details (dates, notes, photos) and click any offspring thumbnail to open that animal\'s own record.',
      },
      {
        stepNumber: 4,
        title: 'Coefficient of Inbreeding (COI)',
        content: 'When both parents are linked via "Link CTC" (not manually entered), the Dashboard view automatically calculates and displays this animal\'s actual Coefficient of Inbreeding as a percentage, plus how many common ancestors it was calculated from. To test a hypothetical pairing before breeding two specific animals, use the standalone COI Calculator (My Tools) instead — currently supported for Fancy Mouse and Fancy Rat.',
      },
      {
        stepNumber: 5,
        title: 'Pedigree Certificates',
        content: 'On the read-only Pedigree tab, "Open Horizontal Certificate" and "Open Vertical Certificate" generate a formatted, printable/shareable pedigree chart spanning several generations — combining both Linked CTC ancestors and Manual entries into one certificate layout, distinct from the simple ancestor list shown underneath. A generation slider (1–4) controls how many ancestor rows are shown, and a "Customise" panel lets you set the certificate\'s title text, footer text, font colour, border colour, background colour, and even upload your own background image — these preferences are saved in your browser and reused for every certificate you open afterward. The "Breeder" and "Current Owner" shown on the certificate are looked up automatically: Breeder comes from the animal\'s linked breeder account if one is set, falling back to the free-text "Manual Breeder Name" if not; "Current Owner" only appears at all when the animal\'s current owner differs from that original breeder (e.g. after a transfer or sale) — if the two are the same person, only "Breeder" is shown.',
      },
    ],
  },
];

// "The Animal List: A Tab-by-Tab Tour" section — Collections, Enclosures, Archive, and the shared pin-tab tip.
const ANIMAL_LIST_TOUR_LESSONS = [
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
        title: 'Owned vs. All — applies to every tab',
        content: 'The Owned/All toggle under Total Animals isn\'t just for this list — it filters Collections, Enclosures, Reproduction, Health, and Feeding & Care too, so unowned animals stay out of your way everywhere until you switch it to "All."',
      },
      {
        stepNumber: 3,
        title: 'Bulk ownership and visibility',
        content: 'The Owned and Public stat cards each have "Set All" buttons beneath them — Set All Owned/Unowned and Set All Public/Private — for flipping every animal\'s status at once instead of one at a time.',
      },
      {
        stepNumber: 4,
        title: 'Sold/Archived and Needs Attention',
        content: 'The Sold/Archived card\'s button opens the Archive screen (covered in its own lesson). Needs Attention rolls up anything due across Feeding & Care, Health, Reproduction, and Enclosures — clicking an item in its breakdown jumps straight to that animal or tab.',
      },
      {
        stepNumber: 5,
        title: 'Card view vs. List (table) view',
        content: 'The grid/list icons at the left of the filter bar switch between Card view (animals grouped into collapsible species sections) and List view (a sortable table). The pin icon next to them saves whichever mode is currently active as your default for next time.',
      },
      {
        stepNumber: 6,
        title: 'Search and filters',
        content: 'The filter bar covers Search (by name), Category, Species, Status, Gender, and — if you\'ve set up breeding lines — a Breeding Line filter too. A pink "Filtered" badge appears next to the page title whenever any filter is active, so you don\'t forget one is on.',
      },
      {
        stepNumber: 7,
        title: 'Sorting',
        content: 'Two sort buttons — A-Z and Age — sit at the right of the filter bar. Click one to sort by it, click again to flip between ascending and descending.',
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
        content: 'Also on each species group header: Delete Multiple and Archive Multiple buttons. Clicking either switches that group into a selection mode — check the animals you want, then confirm with "Delete Selected" or "Archive Selected," or back out with Cancel.',
      },
      {
        stepNumber: 11,
        title: 'Find Duplicates',
        content: 'The "Find Duplicates" button (top-right, magnifying glass) scans for animals that look like accidental duplicates so you can review and clean them up.',
      },
      {
        stepNumber: 12,
        title: 'Pin your favorite tab',
        content: 'Tip: hover any tab in the row above the dashboard (My Animals, Collections, Enclosures, Reproduction, Health, Feeding & Care) and click its pin icon to set that tab as your default view — it\'ll open automatically next time you visit.',
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
        content: 'Switch to the Collections view and click "Manage Collections" to open the manager. Type a name in the "New collection name…" box and click Create.',
      },
      {
        stepNumber: 2,
        title: 'Adding animals to a collection',
        content: 'Uncategorized animals show a small Plus button on their card (or row, in table view). Click it and pick a collection from the "Add to collection:" list. Each animal can only be in one collection at a time — once assigned, it moves out of Uncategorized and that Plus button disappears.',
      },
      {
        stepNumber: 3,
        title: 'Removing an animal from a collection',
        content: 'Inside a collection, each animal has an X button — click it to remove that animal from that collection. The animal itself stays in your account and reappears under Uncategorized, ready to be added to a different collection.',
      },
      {
        stepNumber: 4,
        title: 'Renaming and deleting collections',
        content: 'In the collection manager, use Rename to edit a collection\'s name in place, or Delete to remove the collection entirely. Deleting a collection unassigns every animal that was in it (they fall back to Uncategorized) — it does not delete the animal records themselves.',
      },
      {
        stepNumber: 5,
        title: 'Customizing color and icon',
        content: 'Click the small icon button next to a collection\'s name (or next to the "New collection name…" box while creating one) to open a picker with preset colors and a curated set of icons. Your choice shows up in the collection\'s section header and in the "Add to collection" menu, making it easier to tell collections apart at a glance.',
      },
      {
        stepNumber: 6,
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
        content: 'The Enclosures tab has its own Card/Section toggle in the top-left. Card view shows a photo-forward grid of every enclosure; Section view lists each enclosure as a collapsible row with its occupants underneath — pin whichever you use most as your default with the pin icon next to the toggle.',
      },
      {
        stepNumber: 2,
        title: 'Adding an enclosure',
        content: 'Click "Add Enclosure" to open the form. Only Name is required — everything else (Type, Purpose, Building/Room, Dimensions, Capacity, Temp/Humidity ranges, Lighting schedule, Bedding, Enrichment, Notes, Tags, and Suitable Species) is optional and fills in as much detail as you want to track.',
      },
      {
        stepNumber: 3,
        title: 'Buildings, rooms, and Purpose',
        content: 'Building and Room dropdowns are populated from whatever locations you\'ve set up — click "Manage Locations" in the filter bar to add or edit them. Purpose (General, Nursery/Breeding, Medical, Quarantine, For Sale, Other) helps enclosures surface in the right places, like the Reproduction and Health tabs\' dedicated enclosure panels.',
      },
      {
        stepNumber: 4,
        title: 'Cleaning tasks',
        content: 'Inside an enclosure\'s edit form, add recurring Tasks with a name, type (Cleaning/Maintenance/Feeding/Other), frequency, notes, and any supplies used. Overdue tasks show up as warning badges on the enclosure card and count toward the "Needs Attention" total on the dashboard.',
      },
      {
        stepNumber: 5,
        title: 'Assigning and removing animals in Card view',
        content: 'Cards are read-only summaries — click into an enclosure to open its detail modal, then use its "Animals" tab: an "Assign Animal" button opens a searchable/filterable picker of unassigned animals to add, while each current occupant gets a "Remove"/trash icon (visible on hover) to unassign it.',
      },
      {
        stepNumber: 6,
        title: 'Assigning and removing animals in Section view',
        content: 'Everything happens inline on the page instead: each unassigned animal has its own "Assign" button that reveals a dropdown of enclosures right on its card — pick one and it\'s assigned instantly. Occupants shown under each enclosure row have their own "Remove" button that unassigns them immediately, no confirmation needed. Either way (Section or Card view), removing an animal only unassigns it — it never affects the animal\'s own record.',
      },
      {
        stepNumber: 7,
        title: 'Filtering and deleting enclosures',
        content: 'Use the Search box plus the Status (Occupied/Empty), Building, Room, and Suitable Species filters to narrow the enclosure list. Deleting an enclosure (trash icon) unassigns every animal inside it back to Unassigned — it does not delete or archive the animals themselves.',
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
        content: 'The Reproduction tab groups animals into Planned Matings, Currently In Mating, Pregnant, and Nursing. Each row shows the relevant dates (mating, due/born, weaning) and a status pill, plus a quick action button that advances that animal to the next stage — e.g. "Mated today" moves a planned pairing into Mating, "Assign Pregnant" moves it to Pregnant, "Born today" moves it to Nursing, and "Mark Weaned" closes out the cycle.',
      },
      {
        stepNumber: 2,
        title: 'Starting a planned mating',
        content: 'Click "Add Mating" and choose a Sire and Dam (by search, local or global). The form automatically calculates the pairing\'s inbreeding coefficient (COI) once both parents are selected, so you can check compatibility before confirming.',
      },
      {
        stepNumber: 3,
        title: 'This tab vs. Litter Management',
        content: 'The Reproduction tab only tracks each parent animal\'s current status (planned/mating/pregnant/nursing) — it doesn\'t record offspring. Actual litters, birth counts, and individual offspring are created and managed in the separate Litter Management feature; recording a birth or weaning there automatically syncs the parent\'s status here.',
      },
      {
        stepNumber: 4,
        title: 'Clearing a status',
        content: 'Each row also has a small X "Clear Status" button for correcting a mistaken entry (e.g. a pairing that didn\'t take) without waiting for it to progress through every stage.',
      },
      {
        stepNumber: 5,
        title: 'Breeding/Nursery enclosures',
        content: 'A dedicated Enclosures panel at the top lists any enclosure marked with the "Nursery / Breeding" purpose — use its Add button to create one. Animals housed there are automatically excluded from the four status lists below, since they\'re already grouped by enclosure.',
      },
      {
        stepNumber: 6,
        title: 'Needs Attention alerts',
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
        content: 'The Health tab splits animals into a Quarantine list and an In Treatment list, each row showing the relevant dates/reason and a status pill. "Release" clears an animal from Quarantine, and "End Treatment" discharges it from active treatment — both without affecting the animal\'s own record.',
      },
      {
        stepNumber: 2,
        title: 'Assigning Quarantine or Treatment',
        content: 'Click "Assign Quarantine/Treatment" to open the bulk assign modal. Choose Quarantine (Status: Quarantine/Isolation, Type/Reason, Notes, Start/End dates) or Treatment (a medication\'s Name, Dose, Reason, Start/Stop dates, Dose Interval, and Notes — an active medication is what actually marks an animal "In Treatment"). Search and check off as many animals as you like to apply the same assignment to all of them at once.',
      },
      {
        stepNumber: 3,
        title: 'Managing medication doses',
        content: 'Each active medication on an animal in Treatment gets its own dose actions: confirm a dose was given, prolong the medication, or finish it early — these are also how a medication stops counting toward "dose due" alerts.',
      },
      {
        stepNumber: 4,
        title: 'The overall health status pill',
        content: 'Healthy / Monitoring / Concern / Critical is calculated automatically from active quarantine (weighted by type — e.g. a contagious disease counts far more than a routine new-arrival hold), active treatment, medication count, medical conditions, and allergies. You can\'t set this pill directly from the Health tab — it can only be manually overridden from the animal\'s own edit form (Health tab → Health Status Override).',
      },
      {
        stepNumber: 5,
        title: 'Medical/Quarantine enclosures',
        content: 'A dedicated Enclosures panel lists any enclosure marked with the "Medical" or "Quarantine" purpose — use its Add button to create one. Animals housed there are automatically excluded from the Quarantine/Treatment lists below, since they\'re already grouped by enclosure.',
      },
      {
        stepNumber: 6,
        title: 'Needs Attention alerts',
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
        content: 'Click "Fed" to open the Record Feeding modal: optionally pick a Food/Supply item, toggle "Deduct from stock" and enter a quantity to draw it down from that supply\'s inventory automatically, and add any notes. "Skip" (only shown once a feeding is overdue) just logs a skipped feeding without opening the modal.',
      },
      {
        stepNumber: 3,
        title: 'Grooming, Special Care, and Training',
        content: 'These aren\'t single generic schedules — each specific type (Grooming, Brushing, Bathing, Nail/Claw/Hoof Care, Dental Care, Daily Exercise, Crate/Litter/Leash Training, and more) is tracked completely separately per animal, only appearing once you\'ve set a frequency for it. "Done" logs it as completed today; "Skip" (shown only when overdue) logs it as skipped instead.',
      },
      {
        stepNumber: 4,
        title: 'Custom Animal Care tasks',
        content: 'For anything without a dedicated schedule type — a weekly weigh-in, a monthly nail trim, whatever you define — Custom Animal Care tasks work the same way, with their own name, frequency, and Done/Skip actions.',
      },
      {
        stepNumber: 5,
        title: 'Where schedules get set up',
        content: 'This tab only tracks and marks progress — it doesn\'t create new schedules. Feeding, Grooming, and Special Care schedules are set up from the animal\'s own edit form on the Routine Care tab; Training schedules are set up on the Behavior tab.',
      },
      {
        stepNumber: 6,
        title: 'Needs Attention alerts',
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
        content: 'The Sold/Archived stat card shows the total count (transferred + archived). Use the "Archive" button just below it to open the Archive screen. It has two sections: Sold/Transferred (animals you no longer own, kept view-only for history/pedigree) and Archived Animals (yours, just hidden from your main lists) — plus a search box that searches both by name, prefix/suffix, or ID.',
      },
      {
        stepNumber: 2,
        title: 'Unarchiving and filtering by recipient',
        content: 'Each archived animal has an "Unarchive" button to bring it back into your active lists — it never went anywhere, just hidden. If your sold/transferred animals have gone to more than one different recipient over time, a "Filter by recipient" dropdown appears above the Sold/Transferred list to narrow it down to just one; clicking a recipient\'s name/avatar opens their public profile.',
      },
      {
        stepNumber: 3,
        title: 'Finding duplicate animals',
        content: 'The "Find Duplicates" button (magnifying glass, top-right) scans your animals for likely accidental duplicates — flagged by an exact or similar name match, matching birthdate + species, or matching parents — and groups each match with the reason(s) it was flagged.',
      },
      {
        stepNumber: 4,
        title: 'Merge vs. Dismiss',
        content: '"Merge" keeps one animal and permanently deletes the other, re-pointing all its litters, offspring links, logs, and transactions onto the one you kept — this can\'t be undone, so double-check which one you\'re keeping. "Dismiss" instead just marks the pair as "not a duplicate" so it stops showing up here, without changing either animal.',
      },
      {
        stepNumber: 5,
        title: 'The Alerts dropdown',
        content: 'The "Alerts On/Off" button (bell icon) in the dashboard row opens a checklist of categories — Feeding, Grooming/Special Care, Training, Reproduction, Medical/Quarantine, Enclosure Maintenance, Supply Restocking, and Birthdays — controlling which of these show up in the notification ticker at the very top of every page, not just this one.',
      },
    ],
  },
];

// "Profile & Settings: A Tab-by-Tab Tour" section — the 7 tabs under the avatar → Profile → Profile Settings page.
const SETTINGS_TAB_LESSONS = [
  {
    id: 'profile-view',
    title: 'Viewing a Profile',
    description: 'What a profile page (yours or someone else\'s) looks like, and how the tabs shown there tie back to your Settings.',
    steps: [
      {
        stepNumber: 1,
        title: 'Getting to a profile page',
        content: 'Click your avatar (top-right) → Profile to jump straight to your own profile page. To view someone else\'s profile, click their name/avatar from Community, the Breeder Directory, or a Marketplace listing.',
      },
      {
        stepNumber: 2,
        title: 'The tabs across the top',
        content: 'Animals is always there (grouped by species, with search/species/gender/status filters). Info & Adoption, Pairings, and For Sale/Stud only appear if that person has relevant content to show. Stats can be hidden via the Profile visibility checklist. Ratings is always shown.',
      },
      {
        stepNumber: 3,
        title: 'Actions on someone else\'s profile',
        content: 'Message (only if they allow messages and you\'re logged in), Favorite (star them for quick access later), Share Profile (QR code + copyable link), and Report. On your own profile these are replaced by a single "Profile Settings" button that jumps you back into Settings.',
      },
    ],
  },
  {
    id: 'settings-profile',
    title: 'Settings: Profile',
    description: 'Your public identity, visibility checklist, messaging preferences, and notification settings.',
    steps: [
      {
        stepNumber: 1,
        title: 'Photo and names',
        content: 'Click the avatar placeholder to upload a profile photo (auto-compressed to a small file size). Personal Name is required and is your base identity in the app; Breeder Name is optional and only shows publicly once you check its box further down.',
      },
      {
        stepNumber: 2,
        title: 'Website, social, bio, and location',
        content: 'Website URL and Social Media Link only get their own "display" checkbox once you\'ve actually entered a value. Bio supports Bold/Italic formatting buttons and is capped at 1000 characters / 15 lines. Country (and State, for the US) are optional and mainly used by the Breeder Directory\'s location filters.',
      },
      {
        stepNumber: 3,
        title: 'Public Profile Visibility checklist',
        content: 'This checklist controls exactly what appears on your public profile card: Display Personal Name (on by default), Display Breeder Name, Display Email Address, Display Website URL, Display Social Media Link, Display Bio, and Show Stats tab. The Breeder Name/Website/Social/Bio checkboxes only appear once you\'ve filled in that field.',
      },
      {
        stepNumber: 4,
        title: 'Messaging preferences',
        content: 'A single "Allow other breeders to message me" checkbox. Turning it off only blocks messages from other users — it doesn\'t affect moderator/system notifications.',
      },
      {
        stepNumber: 5,
        title: 'Push notifications',
        content: 'The "Enable push notifications on this device" button turns on real device alerts for messages, requests, and daily care/feeding/health reminders (requires a supported browser — on iPhone/iPad you must Add to Home Screen first). Once enabled, a per-category checklist appears so you can fine-tune exactly what triggers a push.',
      },
      {
        stepNumber: 6,
        title: 'Email notifications',
        content: 'Four mutually exclusive options control what gets emailed to you: None, Requests Only (breeder/transfer/breeding requests), Messages Only, or All.',
      },
    ],
  },
  {
    id: 'settings-info-adoption',
    title: 'Settings: Info & Adoption',
    description: 'Optional long-form content shown on your public profile\'s own Info & Adoption tab.',
    steps: [
      {
        stepNumber: 1,
        title: 'Blank fields stay hidden',
        content: 'Everything on this tab is optional — any field you leave blank simply doesn\'t appear on your public profile\'s Info & Adoption tab at all.',
      },
      {
        stepNumber: 2,
        title: 'The built-in fields',
        content: 'About My Program/Breeding Goals, Adoption/Rehoming Rules, Enclosure Care Requirements, Routine Care, Health Guarantee, Waitlist and Booking Info, Pricing/Fee Notes, and Contact Preferences — each up to 2000 characters, with the same Bold/Italic formatting buttons as your Bio.',
      },
      {
        stepNumber: 3,
        title: 'Custom Fields',
        content: 'For anything the built-in fields don\'t cover, "Add Field" lets you create up to 10 of your own titled sections, each with its own text.',
      },
    ],
  },
  {
    id: 'settings-directory',
    title: 'Settings: Directory',
    description: 'Opting into the public Breeder Directory, species by species.',
    steps: [
      {
        stepNumber: 1,
        title: 'Species & Breeding Status',
        content: 'Every species you own animals of (plus any you\'ve previously marked) gets its own row with a status dropdown: 🏠 Owner (default, not listed anywhere), ⭐ Active Breeder, or 🌙 Retired Breeder. Click "Save Breeding Status" to apply changes.',
      },
      {
        stepNumber: 2,
        title: 'What actually makes you searchable',
        content: 'Only species marked Active or Retired Breeder show up in Breeder Directory searches — and you still need Display Personal Name or Display Breeder Name checked on the Profile tab, or you won\'t appear in results at all even with a species marked.',
      },
      {
        stepNumber: 3,
        title: 'Marked species stick around',
        content: 'Once a species is marked Active or Retired, it stays in this list (and in Directory results) even if you no longer own any animals of that species — set it back to Owner to remove it.',
      },
    ],
  },
  {
    id: 'settings-ratings',
    title: 'Settings: Ratings',
    description: 'The ratings and reviews other users have left you — read-only.',
    steps: [
      {
        stepNumber: 1,
        title: 'What shows here',
        content: 'An overall average score, a 1–5 star distribution breakdown, and the full list of individual reviews left by other users after transactions with you — reviewer name, star rating, comment, and date. Nothing here is editable; it\'s purely a summary of what others have said about you.',
      },
    ],
  },
  {
    id: 'settings-breeding-lines',
    title: 'Settings: Breeding Lines',
    description: 'Define and manage your own named, color-coded breeding lines.',
    steps: [
      {
        stepNumber: 1,
        title: 'Defining a line',
        content: 'Up to 10 personal breeding lines, each with a name (up to 30 characters) and a color picked from a preset palette. These are private — only visible to you, never on public profiles.',
      },
      {
        stepNumber: 2,
        title: 'Assigning lines to animals',
        content: 'Lines are assigned per-animal from that animal\'s own Identification tab, not from this Settings page — this page only defines and manages the lines themselves.',
      },
      {
        stepNumber: 3,
        title: 'Hiding vs. deleting a line',
        content: 'The eye icon toggles a line off — hidden everywhere without losing which animals are assigned to it — while the trash icon permanently deletes it and unassigns it from every animal that had it.',
      },
      {
        stepNumber: 4,
        title: 'Remember to save',
        content: 'Name, color, and enabled/disabled changes are all just a local draft until you click "Save Breeding Lines."',
      },
    ],
  },
  {
    id: 'settings-data-portability',
    title: 'Settings: Data Portability',
    description: 'Exporting your records for backup, and importing from CritterTrack or other pedigree software.',
    steps: [
      {
        stepNumber: 1,
        title: 'Exporting your data',
        content: 'Choose which sections to include (Animals, Litters, Enclosures, Supplies, Budget), pick a format — JSON (single file) or CSV (zip bundle) — and optionally include archived or sold animals, or embed images as base64 (JSON only).',
      },
      {
        stepNumber: 2,
        title: 'Importing a CritterTrack backup',
        content: 'Upload a previously exported .json or .zip file and click "Preview Import" first — it shows a per-section breakdown of new vs. conflicting records so nothing gets written until you review and confirm.',
      },
      {
        stepNumber: 3,
        title: 'Importing from other pedigree software',
        content: 'Dedicated importers exist for ZooEasy, Kintraks, and SimpleBreed (via profile URL), each with their own dry-run preview and duplicate-conflict resolution step before anything is actually imported.',
      },
    ],
  },
  {
    id: 'settings-account',
    title: 'Settings: Account',
    description: 'Login credentials and the account deletion danger zone.',
    steps: [
      {
        stepNumber: 1,
        title: 'Changing your email',
        content: 'A dedicated "Change Email Address" form — you may need to log back in with the new address afterward.',
      },
      {
        stepNumber: 2,
        title: 'Changing your password',
        content: 'Requires your current password plus the new password entered twice to confirm it.',
      },
      {
        stepNumber: 3,
        title: 'The Danger Zone',
        content: 'A collapsed "Danger Zone" section holds the "Delete Account" button — deleting is permanent, wipes all your animals/litters/profile data, and asks for a final confirmation before it\'s carried out.',
      },
    ],
  },
];

const TUTORIAL_SECTIONS = [
  { id: 'getting-started', label: '🚀 Getting Started', lessons: GETTING_STARTED_LESSONS },
  { id: 'animal-record-tour', label: '🐾 The Animal Record: A Tab-by-Tab Tour', lessons: ANIMAL_RECORD_TAB_LESSONS },
  { id: 'animal-list-tour', label: '📋 The Animal List: A Tab-by-Tab Tour', lessons: ANIMAL_LIST_TOUR_LESSONS },
  { id: 'settings-tour', label: '⚙️ Profile & Settings: A Tab-by-Tab Tour', lessons: SETTINGS_TAB_LESSONS },
];

const ALL_LESSONS_ARRAY = TUTORIAL_SECTIONS.flatMap(section => section.lessons);

// Export in the format expected by app.jsx
export const TUTORIAL_LESSONS = {
  sections: TUTORIAL_SECTIONS,
  all: ALL_LESSONS_ARRAY
};

// Also export as default for compatibility
export default TUTORIAL_LESSONS;
