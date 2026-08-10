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
        content: 'Every animal you create defaults to "Owned." Use the Heart / Heart-off button on its card to flip this label — handy for animals you created but don\'t currently have in your possession (co-owned, borrowed, or only added for pedigree). The "Owned"/"All" buttons at the top of the list just filter by this same label, and bulk actions exist to mark many animals at once. Flipping this label never sells, transfers, or archives an animal — that\'s a completely separate process, covered in the Archive lesson.',
      },
      {
        stepNumber: 9,
        title: 'A few features live here but are managed elsewhere',
        content: 'Enclosure assignment, Health/Quarantine & Treatment, Feeding/Grooming/Training schedules, Marketplace availability, Breeding Line assignment, and Seller/Buyer contact linkage can all be set from this same edit form, but you\'ll do the day-to-day work on their own dedicated pages — each covered in a later lesson.',
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
    id: 'animal-list-overview',
    title: 'My Animals — List & Filters',
    description: 'The stat cards, filters, and view options on your main animal list.',
    steps: [
      {
        stepNumber: 1,
        title: 'Top stat cards',
        content: 'Total Animals (click to expand a species/category breakdown), Owned, Public, Sold/Archived, and Needs Attention (click to expand a breakdown by Feeding & Care, Health, Reproduction, and Enclosure maintenance).',
      },
      {
        stepNumber: 2,
        title: 'Owned / All toggle',
        content: 'This two-button toggle under Total Animals filters by each animal\'s own Owned/Unowned label (the same Heart toggle from the animals lesson) — "Owned" shows only your Owned animals, "All" shows everything regardless of that label. It applies to every tab, not just this list.',
      },
      {
        stepNumber: 3,
        title: 'Set All buttons',
        content: 'Under the Owned and Public stat cards, "Set All Owned"/"Set All Unowned" and "Set All Public"/"Set All Private" bulk-update every animal at once — handy for a fresh account import, but easy to trigger by accident.',
      },
      {
        stepNumber: 4,
        title: 'Gender and Status filters',
        content: 'Gender: All Genders, Male, Female, Intersex, Mixed, Unknown. Status: Pet, Growout, Breeder, Available, Booked, Retired, Deceased, Rehomed, Unknown.',
      },
      {
        stepNumber: 5,
        title: 'Card view vs. Table view',
        content: 'Switch layouts with the view toggle. Table view has configurable columns: Animal, Species, Variety, Enclosure, Life Stage, Status, Health, Birthdate/Age, Breeding Lines, and Tags.',
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
];

// "My Animals List Tour" section — Collections, Enclosures, Archive, and the shared pin-tab tip.
const ANIMAL_LIST_TOUR_LESSONS = [
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
        content: 'Uncategorized animals show a small Plus button on their card (or row, in table view). Click it and pick a collection from the "Add to collection:" list. An animal can belong to more than one collection.',
      },
      {
        stepNumber: 3,
        title: 'Removing an animal from a collection',
        content: 'Inside a collection, each animal has an X button — click it to remove that animal from just that collection. It stays in your account and any other collections it belongs to.',
      },
      {
        stepNumber: 4,
        title: 'Renaming and deleting collections',
        content: 'In the collection manager, use Rename to edit a collection\'s name in place, or Delete to remove the collection entirely (this doesn\'t delete the animals in it). There\'s no color or icon customization — collections are name-only folders.',
      },
      {
        stepNumber: 5,
        title: 'Card view vs. Table view',
        content: 'Like the main list, Collections view has its own Card/Table toggle, and each collection section (plus the Uncategorized group) can be collapsed independently.',
      },
    ],
  },
];
const ADVANCED_FEATURES_LESSONS = [];

const TUTORIAL_SECTIONS = [
  { id: 'getting-started', label: '🚀 Getting Started', lessons: GETTING_STARTED_LESSONS },
  { id: 'animal-record-tour', label: '🐾 The Animal Record: A Tab-by-Tab Tour', lessons: ANIMAL_RECORD_TAB_LESSONS },
  { id: 'animal-list-tour', label: '📋 My Animals List Tour', lessons: ANIMAL_LIST_TOUR_LESSONS },
  { id: 'advanced', label: '✨ Advanced Features', lessons: ADVANCED_FEATURES_LESSONS },
];

const ALL_LESSONS_ARRAY = TUTORIAL_SECTIONS.flatMap(section => section.lessons);

// Export in the format expected by app.jsx
export const TUTORIAL_LESSONS = {
  sections: TUTORIAL_SECTIONS,
  all: ALL_LESSONS_ARRAY
};

// Also export as default for compatibility
export default TUTORIAL_LESSONS;
