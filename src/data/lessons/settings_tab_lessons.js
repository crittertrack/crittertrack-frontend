export const SETTINGS_TAB_LESSONS = [
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
        content: 'Animals is always there (grouped by species, with search/category/species/gender/status filters and A-Z/Age sorting). Info & Adoption, Pairings, and For Sale/Stud only appear if that person has relevant content to show. Stats can be hidden via the Profile visibility checklist - see the next step for what it shows. Ratings is always shown.',
      },
      {
        stepNumber: 3,
        title: 'The Pairings tab',
        content: 'When a breeder has pairings, they\'re grouped into up to four sections, each with its own icon and count, and each only shown if it has entries: Mated Pairings, Planned Pairings, Pregnant Pairings, and Past Pairings (born litters). Every card shows the breeding pair\'s nickname (if set) and Sire/Dam mini-cards with photo, name, variety, and ID, plus whichever dates apply - Planned Mating/Mated, Due, or Born with an auto-calculated age. Past Pairings cards also show the litter\'s Male/Female/Unknown split and total born, and a Year filter dropdown appears once litters span more than one year.',
      },
      {
        stepNumber: 4,
        title: 'The For Sale / Stud tab',
        content: 'Split into two sections (each shown only if it has entries): For Sale and Available for Stud - an animal can appear in both if it\'s listed as both. Each card shows a photo, gender icon, name, species, and calculated age, plus a price badge (their set sale price, or "Negotiable") or a stud fee badge (their set fee, or "Negotiable"). Clicking any card opens that animal\'s full public record. These are the exact same listings that show up app-wide in the Marketplace - this tab is just that one breeder\'s slice of it.',
      },
      {
        stepNumber: 5,
        title: 'The Stats tab',
        content: 'When shown, Stats is a live snapshot of everything else on that profile - nothing is entered manually. Summary cards cover Total Animals, Breeder Status, Pet Status, For Sale/Stud, Total Litters, Mated Pairings, Pregnant Pairings, Planned Pairings, and Total Offspring. Below that, breakdown bar-charts compare Animals by Species, Pairings by Species, Offspring by Species, and Pairings/Offspring by Year - each chart only shows up once there\'s more than one species or year to compare, so a single-species breeder won\'t see a species breakdown at all.',
      },
      {
        stepNumber: 6,
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
        content: 'A single "Allow other breeders to message me" checkbox. Turning it off only blocks messages from other users - it doesn\'t affect moderator/system notifications.',
      },
      {
        stepNumber: 5,
        title: 'Push notifications',
        content: 'The "Enable push notifications on this device" button turns on real device alerts for messages, requests, and daily care/feeding/health reminders (requires a supported browser - on iPhone/iPad you must Add to Home Screen first). Once enabled, a per-category checklist appears so you can fine-tune exactly what triggers a push.',
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
        content: 'Everything on this tab is optional - any field you leave blank simply doesn\'t appear on your public profile\'s Info & Adoption tab at all.',
      },
      {
        stepNumber: 2,
        title: 'The built-in fields',
        content: 'About My Program/Breeding Goals, Adoption/Rehoming Rules, Enclosure Care Requirements, Routine Care, Health Guarantee, Waitlist and Booking Info, Pricing/Fee Notes, and Contact Preferences - each up to 2000 characters, with the same Bold/Italic formatting buttons as your Bio.',
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
        content: 'Only species marked Active or Retired Breeder show up in Breeder Directory searches - and you still need Display Personal Name or Display Breeder Name checked on the Profile tab, or you won\'t appear in results at all even with a species marked.',
      },
      {
        stepNumber: 3,
        title: 'Marked species stick around',
        content: 'Once a species is marked Active or Retired, it stays in this list (and in Directory results) even if you no longer own any animals of that species - set it back to Owner to remove it.',
      },
    ],
  },
  {
    id: 'settings-ratings',
    title: 'Settings: Ratings',
    description: 'The ratings and reviews other users have left you - read-only.',
    steps: [
      {
        stepNumber: 1,
        title: 'What shows here',
        content: 'An overall average score, a 1–5 star distribution breakdown, and the full list of individual reviews left by other users after transactions with you - reviewer name, star rating, comment, and date. Nothing here is editable; it\'s purely a summary of what others have said about you.',
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
        content: 'Up to 10 personal breeding lines, each with a name (up to 30 characters) and a color picked from a preset palette. These are private - only visible to you, never on public profiles.',
      },
      {
        stepNumber: 2,
        title: 'Assigning lines to animals',
        content: 'Lines are assigned per-animal from that animal\'s own Identification tab, not from this Settings page - this page only defines and manages the lines themselves.',
      },
      {
        stepNumber: 3,
        title: 'Hiding vs. deleting a line',
        content: 'The eye icon toggles a line off - hidden everywhere without losing which animals are assigned to it - while the trash icon permanently deletes it and unassigns it from every animal that had it.',
      },
      {
        stepNumber: 4,
        title: 'Remember to save',
        content: 'Name, color, and enabled/disabled changes are all just a local draft until you click "Save Breeding Lines."',
      },
    ],
  },
  {
    id: 'settings-appearance-options',
    title: 'Settings: Dropdown Lists',
    description: 'Tidying the values that get suggested in dropdown-style fields on the Animal form.',
    steps: [
      {
        stepNumber: 1,
        title: 'Where these values come from',
        content: 'Every value you type into a dropdown-style field (like Color, Markings, Coat, or Variety) on the Animal form is remembered per species, and suggested again the next time you fill that field in for the same species. So this tab is a record of what you\'ve already used - not a place to pre-load new options. A value only shows up here after you\'ve typed it into an animal form at least once.',
      },
      {
        stepNumber: 2,
        title: 'Narrowing the list',
        content: 'Use the species and field dropdowns to focus on just what you care about (for example Fancy Mouse → Color only), and the search box to find a specific value. The species dropdown shows a count next to each option, including "All species" with the total, so you can tell at a glance how much is saved where.',
      },
      {
        stepNumber: 3,
        title: 'Renaming a typo',
        content: 'Renaming a value fixes it everywhere at once - including on animals you\'ve already saved with the old spelling. This is the fastest way to clean up a value you misspelled when you first typed it in.',
      },
      {
        stepNumber: 4,
        title: 'Removing a value',
        content: 'Remove a value you no longer want suggested and it stops appearing in that field\'s dropdown going forward. This only affects the suggestions - it does not clear the value off animals already using it.',
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
        content: 'Choose which sections to include (Animals, Litters, Enclosures, Supplies, Budget), pick a format - JSON (single file) or CSV (zip bundle) - and optionally include archived or sold animals, or embed images as base64 (JSON only).',
      },
      {
        stepNumber: 2,
        title: 'Importing a CritterTrack backup',
        content: 'Upload a previously exported .json or .zip file and click "Preview Import" first - it shows a per-section breakdown of new vs. conflicting records so nothing gets written until you review and confirm.',
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
        content: 'A dedicated "Change Email Address" form - you may need to log back in with the new address afterward.',
      },
      {
        stepNumber: 2,
        title: 'Changing your password',
        content: 'Requires your current password plus the new password entered twice to confirm it.',
      },
      {
        stepNumber: 3,
        title: 'The Danger Zone',
        content: 'A collapsed "Danger Zone" section holds the "Delete Account" button - deleting is permanent, wipes all your animals/litters/profile data, and asks for a final confirmation before it\'s carried out.',
      },
    ],
  },
];

// "The Litter Management: A Feature-by-Feature Tour" section.\n