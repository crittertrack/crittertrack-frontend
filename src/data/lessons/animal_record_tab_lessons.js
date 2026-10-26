export const ANIMAL_RECORD_TAB_LESSONS = [
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
        content: 'Prefix / Name / Suffix, Gender, Date of Birth, Status (with a Deceased Date field that only appears once Status is set to Deceased). Changing Status to Rehomed pops up a confirmation asking if you\'d also like to archive the animal\'s record - archiving hides it from your main lists but keeps it fully intact in pedigrees. A free-text Remarks box is also here for general notes.',
      },
      {
        stepNumber: 3,
        title: 'Assigning a Breeder or Owner',
        content: 'Click the Breeder or Owner field to open the Assign modal. It has 3 modes: "Search User" (find any CritterTrack user by name or CTU ID), "Select Contact" (pick from your own saved Contacts), or "Manual Entry" (just type a name for someone not on CritterTrack). The same modal and 3 modes are reused later for Seller/Buyer on the Records tab.',
      },
      {
        stepNumber: 4,
        title: 'Co-Ownership Details',
        content: 'A free-text note field below Breeder/Owner for writing out co-ownership terms, breeding rights, or any other arrangement - this is just a note, not a linked contact.',
      },
      {
        stepNumber: 5,
        title: 'Availability',
        content: 'Two independent checkboxes: "Available for Sale" (with a price + currency, or "Negotiable") and "Available for Stud/Breeding" (with a fee + currency). Checking one is what actually puts the animal on the Marketplace - but only once the animal\'s own Public/Private toggle is also set to Public.',
      },
    ],
  },
  {
    id: 'animal-tab-identification',
    title: 'Animal Record: Identification Tab',
    description: 'ID numbers, classification, origin, and tags - all in collapsible sections.',
    steps: [
      {
        stepNumber: 1,
        title: 'Identification Numbers',
        content: 'Breeder Assigned ID and Colony ID are always available. Microchip Number, Pedigree Registration ID, Tattoo ID, Ring ID, and Ear Tag only appear if your species uses them - this keeps the form from showing irrelevant fields like "Ear Tag" on a fish.',
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
        content: 'A free-form tagging field for anything you want to group by - lines, enclosures, projects, etc. Type a tag and press Enter or comma to add it, Backspace on an empty field removes the last tag, and each tag shows as a pill you can click the × on to remove individually.',
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
        content: 'Color, Coat Type, Markings, Eye Color, Size, and Carrier Traits are free text so you can describe your animal however your species/hobby community does. A few fields are species-specific and only appear when relevant - e.g. Earset only shows up for Rats.',
      },
      {
        stepNumber: 2,
        title: 'Genetic Code Builder',
        content: 'For Fancy Mouse and Fancy Rat, click the "Add" button to open a full visual builder: a dropdown per gene locus, with a live-updating Phenotype and Carried gene preview as you pick genotypes. Use "Switch to Manual" to type/paste a code directly instead (e.g. "A/A B/b C/C"). For every other species, it\'s a simple manual text field - if your species isn\'t supported yet, you can click "Submit Genetics Info" to help the community add it.',
      },
      {
        stepNumber: 3,
        title: 'Life Stage',
        content: 'A dropdown: Newborn, Juvenile, Sub-Adult, Adult, Senior, or Mixed. This isn\'t auto-calculated from age - you set it manually.',
      },
      {
        stepNumber: 4,
        title: 'Adding a measurement',
        content: 'Under "Add New Measurement," pick a date and enter Weight, Body Length, Height at Withers, Chest Girth, and/or a Body Condition Score (the BCS scale itself changes based on species - Dogs use a 1-9 scale, Cats and others use 1-5). Add optional Notes, then click "Add Measurement" to save it as a new dated entry.',
      },
      {
        stepNumber: 5,
        title: 'Tracking growth over time',
        content: 'A "Current Measurements" summary always shows the most recent values. Once you\'ve logged 2+ weight entries, a Weight Growth Curve chart appears automatically - hover any point to see its exact date/weight/notes. You can switch Weight and Length units anytime (g/kg/lb/oz, cm/m/in/ft), and delete any past entry from the Measurements list with the trash icon.',
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
        content: 'The badge at the top (Healthy / Monitoring / Concern / Critical) is calculated automatically from what\'s recorded on this tab - hover the info icon to see exactly which factors are driving it. Disagree with the calculation? Click "Enable Override" to set your own status and write a reason (e.g. "well-managed chronic condition, good prognosis") - the calculated status is still shown alongside it for reference.',
      },
      {
        stepNumber: 2,
        title: 'Quarantine Status',
        content: 'Set Status to Quarantine or Isolation, pick a Type/Reason (Preventive - New Arrival, Medical - Contagious Disease, Behavioral - Aggression, etc.), and a Start Date. Add an End Date once it\'s over - a past/today End Date automatically clears the status. Quarantined animals also collect in the Health management tab (My Animals → Health) under a dedicated Quarantine section, where you can review Type/Start/End at a glance and click "Release" to end quarantine without opening the animal at all.',
      },
      {
        stepNumber: 3,
        title: 'Treatment (Medications)',
        content: 'Adding an active medication is what marks the animal as "In Treatment" and factors into its health status. Choose "Manual Entry" to type a medication\'s name/dose/reason/dates yourself, or "From Supplies" to search and pick one from your own tracked Supplies inventory (which pre-fills the name and lets you set dose/reason/dates on top of it). Either way, set an optional recurring Interval (e.g. every 12 hours) if it\'s a repeating dose. Like Quarantine, animals In Treatment collect in the Health management tab\'s In Treatment section, showing each active medication\'s next dose due time with quick Confirm/Prolong/Finish buttons - the Finish button only closes out that one medication, while the "End Full Treatment" button closes out every active medication at once.',
      },
      {
        stepNumber: 4,
        title: 'Medical Conditions & Allergies',
        content: 'Two simple running lists below Treatment - add a Condition or Allergy with a name and optional notes, and remove any entry with its trash icon. These are separate from Treatment: a chronic condition doesn\'t need an active medication to be logged here.',
      },
      {
        stepNumber: 5,
        title: 'Preventive Care',
        content: 'Log Vaccinations, Deworming, and Parasite Control treatments, each with a date and notes. For recurring prevention (e.g. monthly flea/tick treatment), use "Prevention Schedule" to set a treatment name, start date, and repeat interval - this creates a recurring reminder rather than a one-time record.',
      },
      {
        stepNumber: 6,
        title: 'Health Clearances & Screening',
        content: 'Add structured clearances like OFA Hips/Elbows/Cardiac/Eyes, PennHIP, CAER Eyes, or a general Genetic Test/Health Panel - each with a Result, Date Issued, and optional Certificate ID. Below that, a few free-text "Other Health Information" fields remain for Spay/Neuter Date, Heartworm Status, Genetic Test Results, and Chronic Conditions notes.',
      },
      {
        stepNumber: 7,
        title: 'Procedures, Labs & Vet Visits',
        content: 'Medical Procedures and Lab Results are both simple dated entries with a name/test and notes or result. Veterinary Care holds your Primary Veterinarian\'s name plus a running log of Veterinary Visits (date, reason, notes) - useful for a quick history without digging through the Timeline tab.',
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
    title: 'Animal Record: Routine Care Tab',
    description: 'Feeding, enclosure assignment, environment, grooming, and recurring care tasks.',
    steps: [
      {
        stepNumber: 1,
        title: 'Nutrition',
        content: 'Set a Feeding Schedule with "Feed Every (hours)" - type a value or click a quick preset chip (6h, 8h, 12h, 24h, 48h, 72h, 1wk); Last Fed is read-only here and only updates when you log a "Fed" action in the Feeding & Care tab. This schedule is what drives that animal\'s entry in the Feeding & Care management view, showing you exactly when it\'s next due to be fed. For Diet and Supplements, choose "Manual Entry" to type a name (and dosage, for supplements) yourself, or "From Supplies" to search and add items straight from your own tracked Supplies inventory - either way you can add multiple and remove any with its trash icon. Round it out with free-text Portion Size, Feeding Method, Feeding Location, Water Access, and Feeding Pace & Behavior Notes.',
      },
      {
        stepNumber: 2,
        title: 'Enclosure Assignment',
        content: 'Click "Search & Assign Enclosure" to open the enclosure picker. Once assigned, the enclosure\'s card shows its photo, occupancy (current/capacity), dimensions, purpose, type, temperature/humidity ranges, lighting, bedding, and enrichment at a glance - click the unlink icon to unassign without deleting the enclosure itself.',
      },
      {
        stepNumber: 3,
        title: 'Creating a new enclosure on the fly',
        content: 'Don\'t have the right enclosure yet? In that same picker, switch to the "Create" tab instead of "Search". Fill in Name (required), Type, Purpose, Building/Room, Dimensions, Capacity, and Environment details (temperature/humidity range, lighting, bedding, enrichment), then click Confirm - the enclosure is created and automatically assigned to this animal in one step, no need to leave the animal record first. It also immediately shows up in the Enclosures management tab (My Animals → Enclosures) alongside every other enclosure, ready to edit, view occupancy, or reassign later.',
      },
      {
        stepNumber: 4,
        title: 'Environment Needs',
        content: 'Free-text fields for anything about the animal\'s surroundings that isn\'t tied to the enclosure record itself: Lighting Type & Schedule, Noise Level Tolerance & Sound Preferences/Triggers, and Enrichment Needs & Schedule/Frequency.',
      },
      {
        stepNumber: 5,
        title: 'Grooming & Coat Care',
        content: 'Covers General Grooming Needs & Shedding Level, Brushing & Bathing Frequency (plus Coat/Feather/Scale Care Notes), and Specialized Care like Nail/Claw/Hoof, Beak/Hoof/Scale, Skin & Ear, and Dental care requirements. Most of these have their own optional recurring schedule ("Every N days") - set the frequency here, then mark each one done from the Feeding & Care management view, which is also where its "last done" date will show up.',
      },
      {
        stepNumber: 6,
        title: 'Special Requirements & Preferences',
        content: 'Dietary Requirements & Restrictions and Dietary Preferences cover food-specific notes (allergies, favorite treats, refusals). Special Care Needs and Special Observations (each with their own optional recurring schedule) are for anything else worth tracking on a schedule - medication timing quirks, molting isolation, heat lamp requirements. Additional Special Requirements is a catch-all free-text box for anything that doesn\'t fit elsewhere.',
      },
      {
        stepNumber: 7,
        title: 'Animal Care Tasks',
        content: 'For direct, hands-on tasks that aren\'t feeding and aren\'t medical (e.g. Nail Trim, Weigh-In, Litter Box Spot-Change, Handling/Socialization Session) - type a task name (suggestions appear as you type), an optional recurring frequency in days, and optional notes, then click "+ Add Animal Care Task". Every task you add here shows up in the "Scheduled Care" section of the Feeding & Care management view, where you\'ll actually mark it done day to day.',
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
        content: 'The basics: free-text Temperament (e.g. friendly, skittish, aggressive), Handling Tolerance (how well it takes being handled), and Social Structure (who it lives with - cage mates, solitary, group housing).',
      },
      {
        stepNumber: 2,
        title: 'Activity & Training',
        content: 'Activity Cycle is a dropdown (Diurnal/Nocturnal/Crepuscular). Exercise Requirements and Daily Exercise (minutes), Training Level, and Training Disciplines are species-conditional free-text/number fields. Checkboxes mark Crate Trained, Litter Trained, Leash Trained, and Free-Flight Trained - whichever apply to that species.',
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
        content: 'Planned Mating, In Mating, Pregnant, and Nursing flags are all auto-calculated from real Litter Management records - you don\'t normally set these directly. Once a cycle fully wraps up, click "Finish Cycle / Clear State" to reset all four flags at once. Need to correct the calculation? Click "Enable Override" to manually check/uncheck each flag and give a Reason - a running Pregnancy History list (with delete buttons) also appears here once there are past pregnancies on record. Whichever state is active shows as a colored pill right on the animal\'s card in My Animals (Pregnant takes priority, then Nursing, then In Mating, then Planned Mating), and all of these animals are grouped together in the Reproduction management tab (My Animals → Reproduction).',
      },
      {
        stepNumber: 2,
        title: 'Fertility Status',
        content: 'A single dropdown - Fertile, Subfertile, Infertile, Spayed/Neutered/Castrated, Unknown, or Not Applicable (gender determines which spay/neuter option shows). This choice controls what else appears further down: the Reproductive Cycle, Conception & Mating History, and Pregnancy/Development Details sections only show up when Fertility Status is Fertile, Subfertile, Infertile, or Unknown.',
      },
      {
        stepNumber: 3,
        title: 'Reproductive Cycle & Conception History',
        content: 'Reproductive Cycle tracks Last Reproductive Event Date, Cycle Length (days), and Current Reproductive Phase (Available/In Cycle/Resting/Unknown). Conception & Mating History tracks Last Conception Date plus lifetime Successful Conception Count and Unsuccessful Conception Attempts.',
      },
      {
        stepNumber: 4,
        title: 'Pregnancy/Development Details',
        content: 'Not shown for males. Covers Development Period Start and Length (days), Expected Delivery Date, and Development Method (Natural, Assisted, Artificial Incubation, Unknown) - useful for anything from live-bearing gestation to egg incubation.',
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
        content: 'A red warning banner is there for a reason: this only adds a manual note - it does NOT create a real Litter, link offspring, or affect pedigree/COI calculations. Use it for quick historical logging (Breeding Method, Mating Date, Mate - pick "Select from DB" to link an existing animal or type a name manually, Outcome, Birth/Lay Date, Litter Size, Notes). For anything that should actually appear in pedigrees and inbreeding calculations, use Litter Management instead to record a real litter.',
      },
    ],
  },
  {
    id: 'animal-tab-pedigree',
    title: 'Animal Record: Pedigree Tab',
    description: 'Linking real ancestor records, three generations deep, and building a pedigree certificate.',
    steps: [
      {
        stepNumber: 1,
        title: 'Ancestors are always real CritterTrack animals',
        content: 'Every ancestor slot links to an actual animal record on CritterTrack - there is no free-text "manual" option. This is deliberate: manual entries never fed COI/AVK or the parent cards (only real linked parents do), so they left gaps users kept tripping over. If an ancestor isn\'t tracked yet, add them as their own animal record first, then come back and link them into this pedigree. Nothing here saves until you click Save Animal.',
      },
      {
        stepNumber: 2,
        title: 'Linking a CritterTrack ancestor',
        content: 'Click a slot and search to open the search modal - it can match one of your own animals or any other public animal on the site, and automatically filters to the correct gender for that slot (e.g. only males for a Sire slot). Once linked, the slot shows that animal\'s photo, name, variety, and CTC ID; click "Unlink" to remove the connection without deleting anything.',
      },
      {
        stepNumber: 3,
        title: 'Three generations of ancestors',
        content: 'Generation 1 is Sire and Dam. Generation 2 splits into Paternal (Grandsire/Granddam via the Sire) and Maternal (Grandsire/Granddam via the Dam). Generation 3 goes one step further - Great-Grandparents are grouped by which grandparent they came through ("via Grandsire" / "via Granddam") on each side. Each slot is linked independently, and because the pedigree builds off real records, an ancestor you link here also shows up correctly on that animal\'s own record and on any of their relatives\' pedigrees.',
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
        content: 'Photos aren\'t added from the Gallery tab itself - click the "+" tile next to the main photo on the Dashboard tab (or the empty main image box) to pick one or more files at once. Each file opens one at a time in an editor for rotating/cropping before it\'s added; images are also automatically compressed toward a small file size so galleries stay fast to load.',
      },
      {
        stepNumber: 2,
        title: 'Rotating and cropping each photo',
        content: 'In the editor, click "Rotate 90°" repeatedly (or pick a value from the dropdown) to spin the image in 90° steps. Check "Enable Crop" to reveal a draggable crop box - drag its corner handles right on the preview, or type exact X/Y/Width/Height percentages, then click "Next Image" (or "Finish & Add to Gallery" on the last one) to apply the rotation and crop and move on.',
      },
      {
        stepNumber: 3,
        title: 'Working through multiple photos',
        content: 'The editor header shows your progress as "N / total" when you\'ve selected several files, processing one at a time. If a photo fails to preview or can\'t be compressed, a warning appears and a "Skip This Photo" button shows up next to Cancel so you can move past it without losing the rest of the batch.',
      },
      {
        stepNumber: 4,
        title: 'Managing the gallery',
        content: 'Once you have photos, switch to the Gallery tab for the full management view. Hover any image for controls: the star sets it as the primary photo (the one shown on cards and as the main Dashboard image - outlined in your accent color), the left/right arrows reorder it, and the trash icon deletes it. A number badge on each photo always shows its current position, with position 1 being primary.',
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
        content: 'The Timeline auto-aggregates events from across the whole animal record - Health Events, Breeding Events, Keeper & Ownership Events, Show Events, Milestones, Status Changes, Feeding History, Care Schedule Updates, and Field Edits. Uncheck any category here to hide it from the Timeline Events list below without deleting anything.',
      },
      {
        stepNumber: 2,
        title: 'Milestones',
        content: 'Add your own custom timeline entries that aren\'t auto-generated - a Label, a Date, and an optional recurring Interval (every N weeks/months/years) for things like "First Show" or a recurring "Anniversary of Adoption". Remove any milestone with its trash icon.',
      },
      {
        stepNumber: 3,
        title: 'Timeline Events',
        content: 'All events (auto-aggregated + your Milestones) appear here in one combined list, each showing its date, type, and description. Click the star on any event to pin it - pinned events move up into their own "Pinned Events" section above "All Events", so the moments that matter most stay easy to find without scrolling. This same event list also seeds the "Recent Activity" card on the animal\'s read-only Dashboard view (its top 5 most recent events) - so anything the Timeline picks up shows there too.',
      },
      {
        stepNumber: 4,
        title: 'Event Annotations',
        content: 'Click "Add Note to Event" to attach a free-text note to any specific event on the Timeline - pick the event from the dropdown, write your note, and Save. Notes show up directly under that event (with their own delete button), letting you add context (e.g. "Vet said this was just stress-related, not a real relapse") without editing the original record.',
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
        content: 'Log past keepers with "Manual Name" (just type a name) or "Select User" (search any CritterTrack user by name or CTU ID and pick them from the results). Add an Ownership Type (Breeder, Pet Owner, Sanctuary, Foster, Show Home, Research, Other), Start Date, and Country - each entry then shows in a list with its flag, dates, and type, removable with its X button.',
      },
      {
        stepNumber: 2,
        title: 'Show & Performance',
        content: 'Add structured Show Events with Date, Show Name, Title Earned, Judge Name, Score/Placement, and Judge Comments - each becomes its own removable entry. Below that, a set of legacy free-text fields (Show Titles, Working Titles, Show Ratings & Placements, Judge Comments & Evaluations, Performance Scores & Assessments) remain for backward compatibility with older/imported data.',
      },
      {
        stepNumber: 3,
        title: 'Sale & Purchase',
        content: 'Purchase side: Purchase Date, Purchase Price + Currency, Seller Name, and Seller Contact Info (click "Select Contact" to reuse the same Assign modal from the Dashboard tab - Search User / Select Contact / Manual Entry). Sale side mirrors it with Sale Date, Sale Price + Currency, Buyer Name, and Buyer Contact Info. Below that: Breeding/Show/Export Rights and Stud Services Allowed dropdowns, plus free-text Resale Restrictions and Breeder Buyback Clause.',
      },
      {
        stepNumber: 4,
        title: 'Legal & Documentation',
        content: 'Free-text fields for License Number & Jurisdiction, Insurance, Legal Status, and Breeding/Export Restrictions. "Upload Document" accepts PDF, DOC, DOCX, or Pages files up to 10MB - useful for registration papers, contracts, or health certificates. Uploaded documents show as a clickable list (opens in a new tab) with a trash icon to remove any of them.',
      },
    ],
  },
  {
    id: 'animal-tab-view-only',
    title: 'Animal Record: View-Only Extras',
    description: 'A few things that only appear when viewing an animal (not editing it) - most fields you see while viewing are just read-only mirrors of the edit form, but these are new.',
    steps: [
      {
        stepNumber: 1,
        title: 'Header badges & buttons',
        content: 'The pill badges next to the animal\'s name reflect its current state: Owned/Not Owned, Public/Private, an optional Status and Life Stage pill, its Health Status (Healthy/Monitoring/Concern/Critical/etc.), a reproductive state pill when applicable (Pregnant, Nursing, In Mating, or Planned Mating), and For Sale / Stud pills with price when those are set. In your own (private) view, the header buttons are: the Heart toggle (Owned/Not Owned), the Eye toggle (Public/Private), Edit, Transfer (or Withdraw if a transfer is already pending, or Return to Original Breeder if this animal was transferred to you), Add Sibling, and Archive. On a public profile or someone else\'s animal, those owner-only buttons are replaced with Favorite, Share (copyable link + QR code), and Report instead.',
      },
      {
        stepNumber: 2,
        title: 'Relationship Insights',
        content: 'On the read-only Dashboard view, "Relationship Insights" auto-builds this animal\'s wider family tree - Parents, Siblings, Nieces & Nephews, Aunts & Uncles, Grandparents, and Great-Grandparents - grouped and labeled automatically (with Paternal/Maternal sides split where relevant). This is computed from linked pedigree data across your whole collection, not just what\'s entered directly on this one record, so it can surface relatives you didn\'t manually connect. Click any relative\'s card to jump straight to their own record.',
      },
      {
        stepNumber: 3,
        title: 'Offspring & Litters',
        content: 'Also on the Dashboard view, "Offspring & Litters" combines two sources into one list: real Litter Management records where this animal is sire or dam (showing Planned/Mated/Pregnant/Born status, mate, COI, and birth counts by sex), plus any "pedigree-only" offspring - animals whose Pedigree tab links back to this one as a parent but that were never entered as a formal Litter. Click any entry to expand full details (dates, notes, photos) and click any offspring thumbnail to open that animal\'s own record.',
      },
      {
        stepNumber: 4,
        title: 'Coefficient of Inbreeding (COI)',
        content: 'When both parents are linked as real CritterTrack animals, the Dashboard view automatically calculates and displays this animal\'s actual Coefficient of Inbreeding as a percentage, plus how many common ancestors it was calculated from. To test a hypothetical pairing before breeding two specific animals, use the standalone COI Calculator (My Tools) instead - currently supported for Fancy Mouse and Fancy Rat.',
      },
      {
        stepNumber: 5,
        title: 'Pedigree Certificates',
        content: 'On the read-only Pedigree tab, "Open Horizontal Certificate" and "Open Vertical Certificate" generate a formatted, printable/shareable pedigree chart spanning several generations, built from your real linked ancestors and laid out differently from the simple ancestor list shown underneath. A generation slider (1–4) controls how many ancestor rows are shown, and a "Customise" button opens a panel with six controls: Top-right title, Bottom-left text, Font colour, Border colour, Background colour, and Background image. The three colour pickers each pair a swatch with a text box, so you can click to choose or type a hex code directly. For the background image, pick any image from your device - it is automatically downscaled before being stored, so a large photo won\'t bloat your browser storage - and a "Remove" link clears it again. These preferences are saved in your browser and reused for every certificate you open afterward, so you only set them up once. The "Breeder" and "Current Owner" shown on the certificate are looked up automatically: Breeder comes from the animal\'s linked breeder account if one is set, falling back to the free-text "Manual Breeder Name" if not; "Current Owner" only appears at all when the animal\'s current owner differs from that original breeder (e.g. after a transfer or sale) - if the two are the same person, only "Breeder" is shown. Use "Download PDF" once images have finished loading to save or share the finished certificate.',
      },
    ],
  },
  {
    id: 'animal-tab-customize',
    title: 'Animal Record: Customize Tab',
    description: 'Hiding tabs and individual sections you don\'t use, per species.',
    steps: [
      {
        stepNumber: 1,
        title: 'Why hide anything?',
        content: 'The animal form is long, and most breeders only care about a handful of sections for any given species. The "Customize" tab is always the last tab in the form and lets you strip that form down to just what you actually fill in - everything you switch off disappears from the tab bar entirely, so the form is shorter and faster to get through.',
      },
      {
        stepNumber: 2,
        title: 'It applies per species, and syncs',
        content: 'Choices are saved against the species you\'re currently working with (shown in the heading, "Customizing sections for: <species>"), so hiding something on your Fancy Mouse animals leaves your snake form untouched. Preferences are saved to your account automatically - a "Saved" indicator confirms it - so they follow you between the web site and the Android app, and you never need to click a save button.',
      },
      {
        stepNumber: 3,
        title: 'Hiding whole tabs',
        content: 'Each hideable tab has a "Show <Tab> tab" checkbox - Identification, Appearance, Health, Routine Care, Behavior, Breeding, Timeline, and Records can all be switched off. Dashboard, Pedigree, and Gallery can never be hidden, since they carry the animal\'s core identity, ancestry, and photos.',
      },
      {
        stepNumber: 4,
        title: 'Hiding individual sections',
        content: 'With a tab still visible, its sections appear indented underneath as their own checkboxes, so you can be more surgical - keep "Identification Numbers" and "Origin" but drop "Tags" and "Classification", for example. Hiding a whole tab also hides its sections, so you don\'t need to untick them one by one.',
      },
      {
        stepNumber: 5,
        title: 'This only changes the form, not your data',
        content: 'Customizing is purely cosmetic for data entry - it does not delete anything, and it does not change what shows on the read-only view other people (or you) see when viewing an animal. Untick anything here at any time to bring it straight back. The Customize tab itself never hides, so there\'s always a way back in.',
      },
    ],
  },
];

// "The Animal List: A Tab-by-Tab Tour" section - Collections, Enclosures, Archive, and the shared pin-tab tip.\n