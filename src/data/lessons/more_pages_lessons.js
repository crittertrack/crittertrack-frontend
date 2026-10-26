export const MORE_PAGES_LESSONS = [
  {
    id: 'lite-mode',
    title: 'Lite Mode',
    description: 'A simpler version of CritterTrack with fewer sections, for people who want the essentials without the full feature set.',
    steps: [
      {
        stepNumber: 1,
        title: 'Switching to Lite',
        content: 'Click the feather icon in the header (next to the other top-right icons) to switch between Full and Lite. You\'ll get a confirmation prompt either way. Lite is tied to your account, not your device, so it follows you between the website and the Android app - switch it on one and it\'s on in the other. You can switch back whenever you like; nothing is lost either way.',
      },
      {
        stepNumber: 2,
        title: 'What Lite hides',
        content: 'To keep things uncluttered, Lite drops the Contacts, Marketplace, Calendar, and Community pages from the navigation. Everything else - your animals, pedigree, litter records, health and vet history, and photos - is still there. If you need Contacts or Marketplace, switch back to Full mode.',
      },
      {
        stepNumber: 3,
        title: 'The trimmed animal view',
        content: 'Animal records open with only four tabs in Lite: Dashboard, Records, Gallery, and Pedigree. In Full mode there are eleven, so this is the most noticeable difference. The sections themselves work exactly as they do in Full - you\'re just not shown the tabs you don\'t need.',
      },
      {
        stepNumber: 4,
        title: 'The trimmed animal form',
        content: 'The edit form matches, with the same four tabs - and note that Lite relabels Health to Records, because the vet visits, medications, vaccinations, deworming, medical conditions, and allergies that live there are what most people actually need day to day. Anything you can\'t see in Lite is still saved on the animal; you can always switch to Full to reach it.',
      },
      {
        stepNumber: 5,
        title: 'Which parts of the site Lite still covers',
        content: 'Lite includes the standalone Collections and Enclosures pages, a trimmed notifications page, and a reduced settings page. It\'s a good fit if you keep animals for your own records and pedigree but don\'t need the breeder-facing tools like the Marketplace and Contacts.',
      },
    ],
  },
  {
    id: 'install-the-app',
    title: 'Installing the Android App',
    description: 'Getting CritterTrack on your phone - from the Play Store, or from a direct APK file.',
    steps: [
      {
        stepNumber: 1,
        title: 'From the Play Store (recommended)',
        content: 'Sign in to crittertrack.net on your phone\'s browser and tap the "Get it on Google Play" button on the login screen. Play Store installs and updates the app for you automatically, so this is the easiest route and keeps you on the newest version.',
      },
      {
        stepNumber: 2,
        title: 'From a direct APK file',
        content: 'If you\'d rather not use the Play Store, download the signed APK directly from this guide\'s URL/file and install it on your device. Only the .apk linked directly here is safe • do not download APKs from third-party offers, mirror sites, or unofficial websites. It\'s the same app with the same features and the same account; it just skips the store. Choose this if the Play Store isn\'t available in your country, or if you prefer to sideload. Updates for a sideloaded app are manual, so return here to download and install a newer APK when one is published.',
        link: {
          label: 'Download the Android APK',
          url: ANDROID_APK_URL,
          download: true,
        },
      },
      {
        stepNumber: 3,
        title: 'Allowing installs from your browser',
        content: 'Android blocks app installs from outside the Play Store by default, so your browser will ask you to allow it. When the download starts, tap the notification or the prompt to open Settings, and turn on "Allow from this source" for the browser you\'re using (Chrome is usually the one that asks). Turn the permission back off afterwards if you prefer - it only affects future installs, not the app you already have.',
      },
      {
        stepNumber: 4,
        title: 'Before you install an update',
        content: 'Android requires the new version to have a higher version number than what\'s already installed, so you can\'t install an older build over a newer one. You also can\'t install the regular app over an existing Play Store install of the same app unless it\'s signed with the same key - if you switch between Play Store and APK versions, uninstall the old one first. Your data lives in your account, not on the phone, so uninstalling never loses your animals; just sign back in afterwards.',
      },
    ],
  },
  {
    id: 'contacts-overview',
    title: 'Contacts',
    description: 'Keeping track of the keepers and breeders you deal with, separate from your own animal records.',
    steps: [
      {
        stepNumber: 1,
        title: 'What Contacts tracks',
        content: 'Each contact stores a Personal Name and/or kennel/Breeder Name, prefix/suffix, and full address, plus a Keeper/Breeder role - kept separate from your own animal collection, for people you buy from, sell to, or breed with.',
      },
      {
        stepNumber: 2,
        title: 'Search, filter, and add',
        content: 'Search by name and narrow the list by Country from the dropdown. "Add Contact" opens the Add New Contact form; clicking any existing contact opens their profile.',
      },
      {
        stepNumber: 3,
        title: 'Reading a contact\'s card',
        content: 'Each row shows their linked CritterTrack ID (if any), country, and how many animals you\'ve recorded as owned by them or bred by them, at a glance - no need to open their profile just to check.',
      },
    ],
  },
  {
    id: 'contacts-add',
    title: 'Adding a Contact',
    description: 'Creating a new record for a keeper or breeder.',
    steps: [
      {
        stepNumber: 1,
        title: 'Filling in the details',
        content: 'Personal Name, kennel/Breeder Name, Prefix/Suffix, and full address are all optional - fill in whatever you actually know about them, then save.',
      },
      {
        stepNumber: 2,
        title: 'Linking a CritterTrack user',
        content: '"Search" next to Linked CritterTrack User lets you look up and attach an actual CritterTrack profile (their CTU ID) to this contact - this is optional, but once linked, any of your animals with that CTU ID recorded as breeder or owner automatically show up under this contact\'s Owned/Bred Animals tabs, instead of relying only on manual per-animal assignment.',
      },
    ],
  },
  {
    id: 'contacts-detail',
    title: 'A Contact\'s Profile',
    description: 'The three tabs shown on an individual contact\'s page.',
    steps: [
      {
        stepNumber: 1,
        title: 'Overview, Owned Animals, Bred Animals',
        content: 'Overview shows this contact\'s saved details, including their linked CritterTrack ID if one was attached. Owned Animals lists your animals linked to them as buyer/owner; Bred Animals lists ones linked to them as breeder - each tab\'s count badge shows how many, matched either through their linked CTU ID or manual per-animal assignment.',
      },
      {
        stepNumber: 2,
        title: 'Getting back to the list',
        content: '"Back to Contacts" at the top returns you to the full list; "Edit" opens this contact\'s details for editing.',
      },
    ],
  },
  {
    id: 'contacts-edit',
    title: 'Editing a Contact',
    description: 'Updating a contact\'s saved details.',
    steps: [
      {
        stepNumber: 1,
        title: 'Updating the record',
        content: 'The same fields as Add New Contact, pre-filled with their current details, including their linked CritterTrack user if one was set - change anything (or link/unlink a user) and save.',
      },
    ],
  },
  {
    id: 'marketplace-overview',
    title: 'Marketplace',
    description: 'Browsing animals other breeders have listed for sale or stud.',
    steps: [
      {
        stepNumber: 1,
        title: 'Listing type tabs',
        content: 'All Listings, For Sale, and For Stud are separate tabs - an animal can appear under both Sale and Stud if it\'s listed as both.',
      },
      {
        stepNumber: 2,
        title: 'Filtering and taking action',
        content: 'Narrow the list by species or location, then click any animal to view its full details or message the seller directly from there. This is the exact same pool of listings shown on each breeder\'s own public profile "For Sale / Stud" tab - Marketplace is just the combined, app-wide view of all of them.',
      },
    ],
  },
  {
    id: 'calendar-overview',
    title: 'Calendar',
    description: 'One combined schedule for every upcoming reproductive and care event.',
    steps: [
      {
        stepNumber: 1,
        title: 'One combined schedule',
        content: 'Upcoming matings, due dates, births, weaning, feeding/care tasks, and other scheduled events all show on the same calendar, instead of being spread across separate pages.',
      },
      {
        stepNumber: 2,
        title: 'Searching and filtering events',
        content: 'The search box filters by pair, litter ID, sire/dam, animal, or enclosure. "Event Types" lets you show or hide whole categories of events at once.',
      },
    ],
  },
  {
    id: 'community-overview',
    title: 'Community',
    description: 'The Community overview page, plus the Community menu for Favorites, News, and Breeders.',
    steps: [
      {
        stepNumber: 1,
        title: 'The Community menu',
        content: 'Click Community in the top navigation to open a menu with four pages: Overview, Favorites, News, and Breeders. News, Favorites, and Breeders each get their own full-width page.',
      },
      {
        stepNumber: 2,
        title: 'Recent Activity',
        content: 'Up to 5 currently-active or newly-joined breeders (marked NEW) show at the top of the Overview - click any of them to jump straight to their public profile.',
      },
      {
        stepNumber: 3,
        title: 'Recently Viewed',
        content: 'Animals and breeders whose public pages you open are remembered here, each with a photo or avatar and an Animal or Breeder label. The last 5 show, and View all expands the list (up to 30). This history is stored on your device only, so it is not shared between devices, and it is cleared when you log out.',
      },
      {
        stepNumber: 4,
        title: 'Favorites card',
        content: 'Shows one of your favorite animals and one of your favorite breeders, with a \"+N more\" note if you have others. Click either to open it, or click View favorites to see the full lists.',
      },
      {
        stepNumber: 5,
        title: 'Recently Added Animals',
        content: 'Newly published public animals, newest first, ranked by their CTC number (the highest CTC number comes first). Each tile shows the photo, name, species, public ID, and breeder where the breeder has chosen to show their name. View all expands the list. Only public animals appear here.',
      },
    ],
  },
  {
    id: 'community-favorites',
    title: 'Community: Favorites',
    description: 'Your saved animals and breeders, side by side.',
    steps: [
      {
        stepNumber: 1,
        title: 'Two columns',
        content: 'Favorite Animals are on the left and Favorite Breeders on the right. On a phone or narrow screen the two lists stack, animals first. Each list scrolls on its own if it gets long.',
      },
      {
        stepNumber: 2,
        title: 'Searching favorites',
        content: 'The search box at the top filters both lists at once. Animals match on name, ID, or species; breeders match on name or ID.',
      },
      {
        stepNumber: 3,
        title: 'Adding and removing favorites',
        content: 'Click the star on any row to remove a favorite. To add one, open an animal or breeder profile and click Favorite.',
      },
    ],
  },
  {
    id: 'community-news',
    title: 'Community: News',
    description: 'Community announcements and polls on their own page.',
    steps: [
      {
        stepNumber: 1,
        title: 'News & Announcements',
        content: 'Open Community > News for announcements and polls from the CritterTrack team. Announcements you have dismissed stay hidden.',
      },
    ],
  },
  {
    id: 'community-breeders',
    title: 'Community: Breeders',
    description: 'Browsing the Breeder Registry on its own page.',
    steps: [
      {
        stepNumber: 1,
        title: 'Finding breeders',
        content: 'Open Community > Breeders to search the registry by name or ID, and filter by species, country, or state (state appears when the country is United States). Cards sit three across on a large screen, two on a tablet, and one on a phone.',
      },
      {
        stepNumber: 2,
        title: 'Reading a breeder card',
        content: 'Each card shows the breeder\'s logo or avatar, name, public ID, country, a bio (use Read more to expand it), and the species they breed with an Active or Retired badge. Click View Profile to open their full public profile.',
      },
      {
        stepNumber: 3,
        title: 'Being listed',
        content: 'To appear in the registry, mark at least one species as Active or Retired Breeder under Settings > Directory, and turn on Display Personal Name or Display Breeder Name on your Profile.',
      },
    ],
  },
  {
    id: 'offspring-calculator',
    title: 'Offspring Calculator',
    description: 'Predicting possible offspring outcomes for a pairing - hypothetical or using your own animals.',
    steps: [
      {
        stepNumber: 1,
        title: 'Picking a species and setting traits',
        content: 'Choose a species (Fancy Mouse is fully supported today; others are listed but not yet calculable). For each locus dropdown under Sire/Father and Dam/Mother, pick a genotype combination - the box below each parent updates live with their calculated Phenotype, Genotype, and any Carried/Hidden traits.',
      },
      {
        stepNumber: 2,
        title: 'Selecting your own animals',
        content: 'If you\'re logged in and own animals of that species, a "Select Animal" button appears next to Sire/Father and Dam/Mother - pick one of your actual animals to pull in its own known genetic traits instead of entering them by hand.',
      },
      {
        stepNumber: 3,
        title: 'Calculating offspring',
        content: '"Calculate Offspring" (enabled once both parents have at least one trait set) lists every possible offspring phenotype with its probability percentage - expand any phenotype to see the individual genotypes that make it up.',
      },
      {
        stepNumber: 4,
        title: 'Reading an offspring card',
        content: 'Each card shows a phenotype name and its probability percentage, plus an italic Note for anything unusual about that outcome. Click the "X genotypes" button to expand a Possible Carriers callout (hidden recessive genes some offspring may carry) and the full list of individual genotype combinations behind that phenotype. "Report Issue" (while logged in) flags a phenotype result that looks wrong or unknown.',
      },
      {
        stepNumber: 5,
        title: 'Viewing genetics examples',
        content: 'For Fancy Mouse, "View Examples" opens a separate reference view of common named varieties and their genotypes, grouped into tabs - handy for looking up a variety\'s genetic makeup without running your own calculation.',
      },
    ],
  },
  {
    id: 'coi-calculator',
    title: 'COI Calculator',
    description: 'Testing a hypothetical pairing\'s inbreeding risk before committing to it.',
    steps: [
      {
        stepNumber: 1,
        title: 'Testing a hypothetical pairing',
        content: 'Filter by species, then choose a sire and dam to calculate the predicted Coefficient of Inbreeding for their potential offspring, based on shared ancestors. This is separate from the actual COI shown automatically on an already-linked animal\'s own Dashboard - use this calculator to test a pairing before it happens.',
      },
    ],
  },
  {
    id: 'target-outcome-calculator',
    title: 'Target Outcome Calculator',
    description: 'Finding a pairing from your own animals likely to produce a specific trait.',
    steps: [
      {
        stepNumber: 1,
        title: 'Adding traits',
        content: 'Pick a species, then switch to "Visual Traits" mode - a dropdown appears for each trait group, letting you build your desired outcome by picking one option per group (e.g. a Base Color, then optionally a dilute). Some traits automatically select their required dependencies for you.',
      },
      {
        stepNumber: 2,
        title: 'Or entering a genetic code',
        content: 'Prefer to type it directly? Switch to "Genetic Code" mode instead and enter the exact allele combination you want (e.g. "a/a d/d e/e"), rather than picking traits from dropdowns.',
      },
      {
        stepNumber: 3,
        title: 'Running the search',
        content: '"Find Potential Pairings" searches your own animals with recorded genetic codes and lists every sire/dam pair that could produce the target outcome. Results are grouped into collapsible sections - High (>50%), Medium (10–50%), and Low (<10%) probability - each showing a count of how many pairings fall in that range.',
      },
      {
        stepNumber: 4,
        title: 'Reading a collapsed outcome card',
        content: 'Each pairing starts collapsed, showing just the Sire and Dam\'s name and ID side by side, with their combined Chance percentage of producing the target outcome on the right. Click anywhere on the card to expand it.',
      },
      {
        stepNumber: 5,
        title: 'Reading an expanded outcome card',
        content: 'Expanding a card reveals the Sire Genotype and Dam Genotype in full - every locus each parent carries, in bold wherever that locus is one of the ones responsible for the target outcome, so you can see exactly which genes make that pairing likely to work.',
      },
    ],
  },
  {
    id: 'family-tree-explorer',
    title: 'Family Tree Explorer',
    description: 'Exploring one of your animals\' full pedigree as an interactive tree.',
    steps: [
      {
        stepNumber: 1,
        title: 'Loading a pedigree tree',
        content: 'Select a species, then one of your own animals, to load its full pedigree as an interactive, explorable tree.',
      },
      {
        stepNumber: 2,
        title: 'Direct vs. Full mode',
        content: '"Direct Lines" shows the focus animal\'s direct ancestors and offspring, plus its siblings, aunts, and uncles. Clicking any animal node in the tree opens that animal\'s own record - handy for jumping straight to a relative instead of searching for it separately.',
      },
      {
        stepNumber: 3,
        title: 'What the Full graph shows',
        content: 'Switching to "Full Graph" expands the tree to every related animal of the same species it can trace a connection to - not just the direct line, but siblings\' other litters, cousins, and further branches of the family. It can take a moment to load on a large pedigree since it\'s tracing many more connections at once.',
      },
    ],
  },
  {
    id: 'budget-tracker',
    title: 'Budget Tracker',
    description: 'Tracking income and expenses from your animals and supplies.',
    steps: [
      {
        stepNumber: 1,
        title: 'Budget Tracker overview',
        content: 'The currency selector at the top changes the symbol shown across the whole page - it doesn\'t convert any values, just how they\'re displayed. "Add Transaction" is where every sale, purchase, expense, or income entry starts.',
      },
      {
        stepNumber: 2,
        title: 'Choosing a transaction type',
        content: '"Add Transaction" first asks what kind you\'re logging: Animal Sale, Animal Purchase, Expense, or Income. These are manual log entries only - they don\'t transfer ownership. To actually transfer an animal to another user, use that animal\'s own "Transfer" button instead.',
      },
      {
        stepNumber: 3,
        title: 'Logging an Animal Sale',
        content: 'Fields: Date, optional Price, an optional link to one of your animals (filter by species, then search by name/ID), a Buyer name, and optional Notes. If you link one of your own animals, saving asks whether to also mark it Rehomed and archive it - logging the sale alone doesn\'t change the animal\'s own status or move it out of your main list automatically.',
      },
      {
        stepNumber: 4,
        title: 'Logging an Animal Purchase',
        content: 'Same fields as a Sale - Date, optional Price, an optional link to one of your animals, and Notes - but with a Seller name instead of a Buyer, and no follow-up prompt afterward.',
      },
      {
        stepNumber: 5,
        title: 'Logging an Expense or Income',
        content: 'Both share the same fields too: Date, optional Price, a required Category (Food & Supplies, Housing & Bedding, Medical & Veterinary, Equipment & Setup, or Other), a required Description, and optional Notes. Unlike Sales/Purchases, these aren\'t linked to a specific animal.',
      },
      {
        stepNumber: 6,
        title: 'Reading your totals',
        content: 'The summary cards above the list show Total Sales, Total Purchases, Net Profit/Loss (green if positive, orange if a loss), and Average Sale (total sales ÷ number of animals sold) - all recalculated instantly as your search/type/year filters below change.',
      },
      {
        stepNumber: 7,
        title: 'Searching and filtering the list',
        content: 'Search matches animal name/ID, buyer/seller, description, category, or notes. "All Types" and "All Years" narrow the list further. Each row\'s pencil and trash icons edit or delete that transaction.',
      },
      {
        stepNumber: 8,
        title: 'Exporting your records',
        content: '"Export CSV" downloads whatever the search/type/year filters currently show (not necessarily your full history) as a spreadsheet-ready file.',
      },
    ],
  },
  {
    id: 'supplies-inventory',
    title: 'Supplies & Inventory',
    description: 'Tracking stock levels, reorder thresholds, and costs for feed and supplies.',
    steps: [
      {
        stepNumber: 1,
        title: 'Tracking stock levels and alerts',
        content: 'Each supply item tracks its current stock, a reorder threshold, cost per unit, and optionally a next-order date and reorder frequency. Items that drop below their reorder threshold, or whose next-order date has passed, automatically show up in the alert banner at the top of the page.',
      },
      {
        stepNumber: 2,
        title: 'Adding a supply item',
        content: '"Add Item" asks for a Name, Category (Food, Bedding, Medication, or Other), Current Stock + Unit (e.g. bags, kg), Cost per unit, and a reorder threshold. For the Food category specifically, you can check "This is a feeder animal" to add Feeder Type (e.g. Mice, Crickets) and Size (e.g. Pinky, Adult) fields, useful for tracking feeder colonies alongside regular supplies. You can also set an optional Reorder Schedule (a repeat frequency in days/weeks/months) for items ordered on a timer rather than by stock count.',
      },
      {
        stepNumber: 3,
        title: 'Stock amount and feeding portion are separate',
        content: 'Current Stock is the amount you have on hand. To record an animal\'s usual portion, open that animal\'s edit form and add the food under Routine Care > Nutrition, with its own quantity and unit. When you record a feeding, that assigned supply and portion are prefilled when they match the inventory item. Stock is only reduced if you turn on "Deduct from stock" in the feeding modal.',
      },
    ],
  },
  {
    id: 'messages-overview',
    title: 'Messages',
    description: 'Direct messaging with other breeders.',
    steps: [
      {
        stepNumber: 1,
        title: 'Direct messaging',
        content: 'Message other breeders directly, including sharing images within a conversation.',
      },
      {
        stepNumber: 2,
        title: 'Managing a conversation',
        content: 'Block or report a user, or delete a conversation entirely, from that conversation\'s own options menu.',
      },
    ],
  },
  {
    id: 'notifications-overview',
    title: 'Notifications',
    description: 'Transfer requests, link requests, and announcements in one panel.',
    steps: [
      {
        stepNumber: 1,
        title: 'What shows up here',
        content: 'Transfer requests, link requests, and system announcements all appear together in this one panel.',
      },
      {
        stepNumber: 2,
        title: 'Acting on a notification',
        content: 'Transfer and view-only requests get full Accept/Decline buttons. Breeder, parent (sire/dam), and link requests only show Reject/Acknowledge instead - that\'s because the assignment is applied automatically as soon as the request is sent, so there\'s nothing to "accept". Rejecting one of these is what actually undoes it, clearing the breeder or sire/dam link back off the animal; Acknowledge just clears it from your pending list and leaves the assignment as-is.',
      },
    ],
  },
  {
    id: 'alert-ticker-overview',
    title: 'The Alert Ticker (Top Banner)',
    description: 'The scrolling banner below the header that surfaces unread items and overdue care alerts.',
    steps: [
      {
        stepNumber: 1,
        title: 'What the ticker banner is',
        content: 'A scrolling banner can appear just below the header on any page - showing unread messages, unread notifications, moderator warnings/notices, and any overdue care or breeding alerts you\'ve opted into. It stays hidden entirely when there\'s nothing to report.',
      },
      {
        stepNumber: 2,
        title: 'Acting on a ticker item',
        content: 'Click an item to act on it: messages open the Messages panel, notifications open the Notifications panel, and care alerts (feeding, grooming, health, etc.) jump to the Dashboard. Warnings and moderator notices expand right in place instead, so you can read and acknowledge them.',
      },
      {
        stepNumber: 3,
        title: 'Choosing which care alerts appear',
        content: 'The optional categories - Feeding, Grooming/Special Care, Training, Reproduction, Medical/Quarantine, Enclosure Maintenance, Supply Restocking, and Birthdays - are turned on or off from the "Alerts" button on the My Animals dashboard. That same setting controls both the dashboard\'s own alert list and this banner.',
      },
    ],
  },
  {
    id: 'report-an-issue',
    title: 'Report an Issue',
    description: 'Sending a bug report, feature suggestion, or general feedback to the developer.',
    steps: [
      {
        stepNumber: 1,
        title: 'Reaching the developer directly',
        content: 'Pick a category, then describe a bug, suggest a feature, or share general feedback - this goes straight to the developer, not to other users.',
      },
      {
        stepNumber: 2,
        title: 'Checking on past reports',
        content: 'Switch to the "My Reports" tab to see everything you\'ve submitted, each with a status badge (Pending, In Progress, Reviewed, Resolved, or Dismissed). If a moderator has replied, their note appears right on the report as "Response from Moderator:".',
      },
    ],
  },
  {
    id: 'helpful-resources',
    title: 'Helpful Resources',
    description: 'A curated directory of external links for care, health, and genetics.',
    steps: [
      {
        stepNumber: 1,
        title: 'A curated external link directory',
        content: 'Browse external links for care, health, genetics, and more, filtered by species, subject, or tag.',
      },
      {
        stepNumber: 2,
        title: 'Suggesting a resource',
        content: 'Logged-in users can paste a link (or just describe one) via "Suggest a Resource" for the team to review and potentially add to the directory.',
      },
    ],
  },
];


const TUTORIAL_SECTIONS = [
  { id: 'getting-started', label: '🚀 Getting Started', lessons: GETTING_STARTED_LESSONS },
  { id: 'animal-record-tour', label: '🐾 The Animal Record: A Tab-by-Tab Tour', lessons: ANIMAL_RECORD_TAB_LESSONS },
  { id: 'animal-list-tour', label: '📋 The Animal List: A Tab-by-Tab Tour', lessons: ANIMAL_LIST_TOUR_LESSONS },
  { id: 'settings-tour', label: '⚙️ Profile & Settings: A Tab-by-Tab Tour', lessons: SETTINGS_TAB_LESSONS },
  { id: 'litter-management-tour', label: '🐣 The Litter Management: A Feature-by-Feature Tour', lessons: LITTER_MANAGEMENT_LESSONS },
  { id: 'more-pages-tour', label: '📚 More Pages & Tools', lessons: MORE_PAGES_LESSONS },
];\n