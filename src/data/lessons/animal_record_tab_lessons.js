export const ANIMAL_RECORD_TAB_LESSONS = [
  {
    id: 'animal-tab-dashboard',
    title: 'Animal Record: Dashboard Tab',
    description: 'Photos, identity, breeder/owner assignment, and Marketplace availability.',
    steps: [
      {
        stepNumber: 1,
        title: 'Photos',
        content: 'The main photo appears on the left, with up to three thumbnails underneath. Click the dashed + tile to add photos. To change the main photo, hover over a thumbnail and click its star.',
      },
      {
        stepNumber: 2,
        title: 'Identity',
        content: 'Enter the animal\'s Prefix, Name, Suffix, Gender, Date of Birth, and Status. If you set the status to Deceased, a Deceased Date field appears. Choosing Rehomed asks whether you also want to archive the record. Archiving removes it from your main lists but keeps its pedigree connections. Use Remarks for any extra notes.',
      },
      {
        stepNumber: 3,
        title: 'Assigning a Breeder or Owner',
        content: 'Click the Breeder or Owner field to open the assignment window. Choose Search User to find someone on CritterTrack by name or CTU ID, Select Contact to use someone from your saved Contacts, or Manual Entry to type a name. You\'ll find these same options when assigning a Seller or Buyer on the Records tab.',
      },
      {
        stepNumber: 4,
        title: 'Co-Ownership Details',
        content: 'Use Co-Ownership Details to write down any shared ownership arrangements, breeding rights, or agreements. This is a notes field only; it does not link another person to the animal.',
      },
      {
        stepNumber: 5,
        title: 'Availability',
        content: 'Check Available for Sale to enter a price and currency or mark the price as Negotiable. Available for Stud/Breeding has its own fee and currency. You can use either option or both. An animal only appears in the Marketplace when at least one option is enabled and the animal is set to Public.',
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
        content: 'Breeder Assigned ID and Colony ID are available for every animal. Other fields, such as Microchip Number, Pedigree Registration ID, Tattoo ID, Ring ID, and Ear Tag, appear only for species where they are relevant.',
      },
      {
        stepNumber: 2,
        title: 'Additional Identifiers',
        content: 'Need to record an ID that does not have its own field, such as a DNA test number or club registration? Enter a Title and Value, then click the green + button. You can add multiple identifiers and remove any of them with the trash icon.',
      },
      {
        stepNumber: 3,
        title: 'Classification',
        content: 'Species is fixed when you create the animal and cannot be changed later. Breed is a free-text field. For relevant species, you can also enter a Strain, such as C57BL/6 or Wistar.',
      },
      {
        stepNumber: 4,
        title: 'Origin',
        content: 'For species that use this field, select Captive-bred, Wild-caught, or Rescue from the Origin dropdown.',
      },
      {
        stepNumber: 5,
        title: 'Tags',
        content: 'Use Tags to group animals by breeding line, enclosure, project, or anything else you find useful. Type a tag and press Enter or comma to add it. Click its × to remove it, or press Backspace in an empty tag field to remove the last tag.',
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
        content: 'Enter details such as Color, Coat Type, Markings, Eye Color, Size, and Carrier Traits in your own words. Some fields only appear for relevant species; for example, Earset is available for rats.',
      },
      {
        stepNumber: 2,
        title: 'Genetic Code Builder',
        content: 'For Fancy Mouse and Fancy Rat, click Add to open the visual Genetic Code Builder. Choose a genotype for each gene locus and watch the Phenotype and Carried gene previews update. Prefer typing the code yourself? Select Switch to Manual and enter a code such as A/A B/b C/C. Other species use a manual genetic-code field. If your species is not supported yet, you can use Submit Genetics Info to contribute information.',
      },
      {
        stepNumber: 3,
        title: 'Life Stage',
        content: 'Choose Newborn, Juvenile, Sub-Adult, Adult, Senior, or Mixed. Life Stage is not calculated automatically from the animal\'s age, so you can update it whenever needed.',
      },
      {
        stepNumber: 4,
        title: 'Adding a measurement',
        content: 'Under Add New Measurement, choose a date and enter any measurements you have: Weight, Body Length, Height at Withers, Chest Girth, or Body Condition Score. The BCS scale depends on the species; dogs use 1–9, while cats and other species use 1–5. Add notes if useful, then click Add Measurement.',
      },
      {
        stepNumber: 5,
        title: 'Tracking growth over time',
        content: 'Current Measurements shows the latest recorded values. After you add at least two weight entries, a Weight Growth Curve appears. Hover over a point to see its date, weight, and notes. You can switch weight units (g, kg, lb, oz) and length units (cm, m, in, ft), or delete an old measurement using its trash icon.',
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
        content: 'The Health Status badge shows Healthy, Monitoring, Concern, or Critical based on the information recorded for the animal. Hover over its info icon to see what affects the result. If you need to set a different status, click Enable Override, choose the status, and explain why. The calculated status remains visible for comparison.',
      },
      {
        stepNumber: 2,
        title: 'Quarantine Status',
        content: 'Choose Quarantine or Isolation, select a Type/Reason, and enter the Start Date. Reasons include preventive quarantine for a new arrival, contagious illness, or behavioral concerns. You can add an End Date; when that date is today or in the past, the status clears automatically. You can also manage quarantined animals from My Animals → Health, where the Quarantine list shows their details and has a Release button.',
      },
      {
        stepNumber: 3,
        title: 'Treatment (Medications)',
        content: 'Add an active medication to mark the animal as In Treatment. Choose Manual Entry to enter the medication, dose, reason, and dates yourself, or From Supplies to select something from your inventory. Set an Interval, such as every 12 hours, for repeating doses. In My Animals → Health, the In Treatment list shows upcoming doses with Confirm, Prolong, and Finish actions. Finish ends only that medication; End Full Treatment closes every active medication for the animal.',
      },
      {
        stepNumber: 4,
        title: 'Medical Conditions & Allergies',
        content: 'Keep separate lists of Medical Conditions and Allergies, each with a name and optional notes. Use the trash icon to remove an entry. You can record a chronic condition here even when the animal is not receiving treatment.',
      },
      {
        stepNumber: 5,
        title: 'Preventive Care',
        content: 'Record Vaccinations, Deworming, and Parasite Control with their dates and notes. For treatments that repeat, open Prevention Schedule and enter the treatment name, start date, and interval to create a reminder.',
      },
      {
        stepNumber: 6,
        title: 'Health Clearances & Screening',
        content: 'Add health clearances such as OFA Hips, Elbows, Cardiac, or Eyes; PennHIP; CAER Eyes; or a Genetic Test/Health Panel. Record the Result, Date Issued, and an optional Certificate ID. Other Health Information also has free-text fields for Spay/Neuter Date, Heartworm Status, Genetic Test Results, and Chronic Conditions.',
      },
      {
        stepNumber: 7,
        title: 'Procedures, Labs & Vet Visits',
        content: 'Use Medical Procedures and Lab Results to keep dated records of procedures, tests, and results. Under Veterinary Care, you can save the Primary Veterinarian and log visits with a date, reason, and notes.',
      },
      {
        stepNumber: 8,
        title: 'End of Life',
        content: 'When the animal\'s Status is set to Deceased on the Dashboard tab, you can record its Deceased Date, Cause of Death, Necropsy Results, and End of Life Care Notes, including any burial, cremation, or memorial arrangements.',
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
        content: 'Set Feed Every (hours) by entering an interval or choosing a preset: 6h, 8h, 12h, 24h, 48h, 72h, or 1wk. This controls when the animal appears as due in My Animals → Feeding & Care. Last Fed updates when you record a Fed action there, not when you edit this form. For Diet and Supplements, enter items manually or choose them From Supplies; you can add several items and remove them individually. You can also record Portion Size, Feeding Method, Feeding Location, Water Access, and Feeding Pace & Behavior Notes.',
      },
      {
        stepNumber: 2,
        title: 'Enclosure Assignment',
        content: 'Click Search & Assign Enclosure to choose where the animal lives. Once assigned, the enclosure card shows its photo, occupancy and capacity, dimensions, purpose, type, temperature and humidity ranges, lighting, bedding, and enrichment. Click the unlink icon to remove the assignment without deleting the enclosure.',
      },
      {
        stepNumber: 3,
        title: 'Creating a new enclosure on the fly',
        content: 'You can create an enclosure without leaving the animal form. Open Search & Assign Enclosure, switch to Create, and enter a Name (required) plus any details you want, such as Type, Purpose, Building/Room, Dimensions, Capacity, and environmental settings. Click Confirm to create the enclosure and assign the animal at the same time. You can manage it later under My Animals → Enclosures.',
      },
      {
        stepNumber: 4,
        title: 'Environment Needs',
        content: 'Use Environment Needs for details specific to the animal rather than its enclosure: Lighting Type & Schedule, Noise Level Tolerance, Sound Preferences/Triggers, and Enrichment Needs & Schedule/Frequency.',
      },
      {
        stepNumber: 5,
        title: 'Grooming & Coat Care',
        content: 'Record General Grooming Needs, Shedding Level, brushing and bathing frequency, and coat, feather, or scale care notes. You can also track nail, claw, hoof, beak, skin, ear, and dental care as applicable. Many of these tasks support an Every N days schedule. Once set, mark them completed under My Animals → Feeding & Care, where you can also see when they were last done.',
      },
      {
        stepNumber: 6,
        title: 'Special Requirements & Preferences',
        content: 'Use Dietary Requirements & Restrictions and Dietary Preferences for allergies, preferred foods, or foods the animal refuses. Special Care Needs and Special Observations can have their own repeating schedules for things such as heat-lamp checks or extra monitoring. Use Additional Special Requirements for anything that does not fit the other fields.',
      },
      {
        stepNumber: 7,
        title: 'Animal Care Tasks',
        content: 'For other hands-on care, such as nail trimming, weighing, spot-cleaning, or handling sessions, enter a task name, an optional frequency in days, and any notes. Suggestions appear as you type. Click + Add Animal Care Task to save it. These tasks appear under Scheduled Care in My Animals → Feeding & Care, where you can mark them done.',
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
        content: 'Describe the animal\'s Temperament, Handling Tolerance, and Social Structure in your own words. For example, you might record whether it is friendly or nervous, comfortable being handled, or housed alone or in a group.',
      },
      {
        stepNumber: 2,
        title: 'Activity & Training',
        content: 'Choose an Activity Cycle: Diurnal, Nocturnal, or Crepuscular. Depending on the species, you can also enter Exercise Requirements, Daily Exercise minutes, Training Level, and Training Disciplines. Use the relevant checkboxes for Crate Trained, Litter Trained, Leash Trained, or Free-Flight Trained.',
      },
      {
        stepNumber: 3,
        title: 'Working Role & Certifications',
        content: 'If relevant, record a Working Role such as service, therapy, show, or guard work. Use Certifications & Titles for qualifications, awards, or show results, such as CGC or AKC titles.',
      },
      {
        stepNumber: 4,
        title: 'Known Issues & Safety Concerns',
        content: 'Use the notes fields to record Behavioral Issues, Bite History, Reactivity & Triggers, Escape & Flight Risk, and Stereotypic & Stress Behaviors. Escape & Flight Risk also has a level from No Risk to Critical and fields for escape methods and flight triggers. These notes can help you remember important handling and safety considerations.',
      },
      {
        stepNumber: 5,
        title: 'Training Schedules',
        content: 'Set optional Every N days schedules for exercise and training, including crate, litter, leash, free-flight, working-role, behavioral, reactivity, and flight-risk training. Record completed sessions in My Animals → Feeding & Care, which also shows the last completion date.',
      },
      {
        stepNumber: 6,
        title: 'Temperament Assessment (1-5 Scale)',
        content: 'Use the five 1–5 sliders to rate Aggression, Fear/Anxiety, Boldness/Exploration, Sociability, and Independence. Each scale explains what its endpoints mean. You can also add notes about aggression triggers and types, specific fears, or coping strategies.',
      },
      {
        stepNumber: 7,
        title: 'Specialized Behavioral Traits',
        content: 'For more detailed observations, record Prey Drive & Hunting Behavior, Feeding Behavior (including food aggression and eating speed), Bonding & Attachment Style where supported, and Sensory Sensitivities to noise, touch, or light. Each area includes its own ratings or notes fields.',
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
        content: 'Planned Mating, In Mating, Pregnant, and Nursing are normally calculated from Litter Management records. The active status appears on the animal\'s card and in My Animals → Reproduction. If several statuses apply, the display prioritizes Pregnant, then Nursing, In Mating, and Planned Mating. Use Finish Cycle / Clear State when a cycle is complete. If a status needs correcting, choose Enable Override, adjust the flags, and enter a reason. Previous pregnancies appear in Pregnancy History, where entries can also be removed.',
      },
      {
        stepNumber: 2,
        title: 'Fertility Status',
        content: 'Select Fertile, Subfertile, Infertile, Spayed/Neutered/Castrated, Unknown, or Not Applicable, with the appropriate spay/neuter option based on gender. The Reproductive Cycle, Conception & Mating History, and Pregnancy/Development Details sections appear when the status is Fertile, Subfertile, Infertile, or Unknown.',
      },
      {
        stepNumber: 3,
        title: 'Reproductive Cycle & Conception History',
        content: 'Under Reproductive Cycle, record the Last Reproductive Event Date, Cycle Length in days, and Current Reproductive Phase (Available, In Cycle, Resting, or Unknown). Conception & Mating History lets you enter the Last Conception Date and lifetime counts of successful conceptions and unsuccessful attempts.',
      },
      {
        stepNumber: 4,
        title: 'Pregnancy/Development Details',
        content: 'For animals other than males, record the Development Period Start, Development Period Length in days, Expected Delivery Date, and Development Method (Natural, Assisted, Artificial Incubation, or Unknown). This can be used for pregnancies or egg development, depending on the species.',
      },
      {
        stepNumber: 5,
        title: 'Reproductive Outcomes & Nursing',
        content: 'Keep track of lifetime Total Offspring Produced, Viable Offspring Count, Reproductive Event Count (litters or clutches), and the overall outcome (Successful, Partial, Failed, or Unknown). Dependent Care End Date records when the latest offspring were weaned, fledged, or became independent.',
      },
      {
        stepNumber: 6,
        title: 'Reproductive Health & Delivery',
        content: 'Use Reproductive Health & Procedures to record any artificial reproduction method (AI, Embryo Transfer, or In Vitro), the Last Reproductive Intervention Date, whether dependent care is required, and relevant health notes. Delivery & Breeding Health covers the Last Delivery Date, Delivery Method, complications, and species-specific reproductive clearances.',
      },
      {
        stepNumber: 7,
        title: 'Add Breeding Record (Manual Log)',
        content: 'Add Breeding Record creates a manual history entry only. It does not create a Litter Management record, connect offspring, or update pedigree and COI calculations. You can enter the breeding method, mating date, mate (selected from the database or entered by name), outcome, birth/lay date, litter size, and notes. To link actual offspring and include them in pedigrees and calculations, create the litter through Litter Management instead.',
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
        content: 'Every ancestor slot must link to an existing CritterTrack animal record; you cannot type an ancestor name directly into the slot. This allows linked parents to be used in pedigrees, parent cards, and COI/AVK calculations. If an ancestor is missing, create its animal record first and then return to link it. Remember to click Save Animal when you finish.',
      },
      {
        stepNumber: 2,
        title: 'Linking a CritterTrack ancestor',
        content: 'Click an ancestor slot to search your own animals or other users\' public animals. Results are filtered by the required gender, such as males for a Sire slot. After linking, you\'ll see the ancestor\'s photo, name, variety, and CTC ID. Click Unlink to remove the relationship without deleting the animal record.',
      },
      {
        stepNumber: 3,
        title: 'Three generations of ancestors',
        content: 'The form lets you link three generations of ancestors. Generation 1 contains the Sire and Dam. Generation 2 contains the paternal and maternal grandparents. Generation 3 contains the great-grandparents, grouped by their family branch. Because these are linked animal records, changes to the relationships are reflected in related pedigrees.',
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
        content: 'Add photos from the Dashboard tab rather than the Gallery tab. Click the + tile next to the main photo, or click the empty main photo area, and select one or more images. Each image opens in the editor before being added. Photos are compressed automatically to help keep galleries quick to load.',
      },
      {
        stepNumber: 2,
        title: 'Rotating and cropping each photo',
        content: 'In the photo editor, click Rotate 90° or choose a rotation from the dropdown. To crop, enable Enable Crop and drag the handles on the preview, or enter X, Y, Width, and Height percentages. Click Next Image to continue, or Finish & Add to Gallery when you reach the last photo.',
      },
      {
        stepNumber: 3,
        title: 'Working through multiple photos',
        content: 'If you selected several photos, the editor shows your progress as the current image out of the total. If one cannot be previewed or compressed, a warning appears and you can choose Skip This Photo to continue with the others.',
      },
      {
        stepNumber: 4,
        title: 'Managing the gallery',
        content: 'Open the Gallery tab to manage saved photos. Hover over an image to set it as the main photo using the star, change its order with the left and right arrows, or delete it with the trash icon. The main photo is highlighted with your accent color and appears on animal cards and the Dashboard. Each photo also has a position number; position 1 is the main photo.',
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
        content: 'The Timeline brings together Health Events, Breeding Events, Keeper & Ownership Events, Show Events, Milestones, Status Changes, Feeding History, Care Schedule Updates, and Field Edits. Use the category checkboxes to hide events you do not want to see. Filtering them out does not delete them.',
      },
      {
        stepNumber: 2,
        title: 'Milestones',
        content: 'Add your own milestones by entering a Label and Date. You can also set a repeating interval in weeks, months, or years for events such as adoption anniversaries. Use the trash icon to remove a milestone.',
      },
      {
        stepNumber: 3,
        title: 'Timeline Events',
        content: 'Timeline Events combines automatically recorded activity with your own milestones. Each entry shows its date, type, and description. Click an event\'s star to move it into Pinned Events above the main list. The five most recent events also appear in the Recent Activity card on the animal\'s read-only Dashboard.',
      },
      {
        stepNumber: 4,
        title: 'Event Annotations',
        content: 'Click Add Note to Event, choose the event, write your note, and save it. The note appears underneath that event and can be removed separately. This is useful for adding context without changing the original record.',
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
        content: 'Use Ownership History to record previous keepers. Choose Manual Name to type someone\'s name, or Select User to find a CritterTrack account by name or CTU ID. Add the Ownership Type (Breeder, Pet Owner, Sanctuary, Foster, Show Home, Research, or Other), Start Date, and Country. Saved entries show their details and can be removed with the X button.',
      },
      {
        stepNumber: 2,
        title: 'Show & Performance',
        content: 'Add Show Events with a Date, Show Name, Title Earned, Judge Name, Score/Placement, and Judge Comments. Each event can be removed individually. Older free-text fields for titles, ratings, placements, evaluations, and performance scores are also available for existing or imported records.',
      },
      {
        stepNumber: 3,
        title: 'Sale & Purchase',
        content: 'Record purchases with the Purchase Date, Price and Currency, Seller Name, and Seller Contact Info. Sales have matching fields for Sale Date, Price, Buyer Name, and Buyer Contact Info. Select Contact opens the same assignment options used on the Dashboard: Search User, Select Contact, or Manual Entry. You can also record Breeding/Show/Export Rights, whether Stud Services are allowed, Resale Restrictions, and a Breeder Buyback Clause.',
      },
      {
        stepNumber: 4,
        title: 'Legal & Documentation',
        content: 'Use Legal & Documentation for License Number & Jurisdiction, Insurance, Legal Status, and Breeding/Export Restrictions. Click Upload Document to add registration papers, contracts, or health certificates in PDF, DOC, DOCX, or Pages format, up to 10 MB. Saved documents appear in a list; click to open one in a new tab or use the trash icon to remove it.',
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
        content: 'When viewing an animal, the header shows badges for ownership, Public/Private visibility, and any available Status, Life Stage, Health Status, reproductive state, or For Sale/Stud information. For animals you can manage, the header includes the Owned heart, visibility eye, Edit, Transfer (or Withdraw/Return to Original Breeder when relevant), Add Sibling, and Archive actions. When viewing another user\'s public animal, you\'ll instead find Favorite, Share (link and QR code), and Report.',
      },
      {
        stepNumber: 2,
        title: 'Relationship Insights',
        content: 'On the read-only Dashboard, Relationship Insights uses linked pedigree records to show Parents, Siblings, Nieces & Nephews, Aunts & Uncles, Grandparents, and Great-Grandparents. Paternal and maternal relatives are separated where relevant. Some relationships are discovered automatically from connected records, even if you did not link those relatives directly. Click a relative to open its record.',
      },
      {
        stepNumber: 3,
        title: 'Offspring & Litters',
        content: 'Offspring & Litters shows both litters recorded through Litter Management and offspring linked through pedigrees without a formal litter record. Managed litters can show the pairing status, mate, COI, and birth counts by sex. Expand an entry to see its dates, notes, and photos, or click an offspring photo to open that animal\'s record.',
      },
      {
        stepNumber: 4,
        title: 'Coefficient of Inbreeding (COI)',
        content: 'When both parents are linked, the Dashboard calculates the animal\'s Coefficient of Inbreeding (COI) and shows the percentage and number of common ancestors used. To check a possible pairing before breeding, use the separate COI Calculator under Tools, currently available for Fancy Mouse and Fancy Rat.',
      },
      {
        stepNumber: 5,
        title: 'Pedigree Certificates',
        content: 'On the read-only Pedigree tab, choose Open Horizontal Certificate or Open Vertical Certificate to create a printable pedigree. Use the generation slider to show 1–4 generations. Click Customise to edit the top-right title, bottom-left text, font colour, border colour, background colour, and background image. You can choose colours with the picker or enter hex codes. Background images are downscaled before being saved, and Remove clears the selected image. Certificate preferences are stored in your browser and reused next time. The Breeder name comes from the linked breeder account, or Manual Breeder Name if no account is linked. Current Owner appears only when different from the breeder. Once the images have loaded, click Download PDF to save the certificate.',
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
        content: 'The Customize tab lets you hide parts of the animal form that you do not use. It stays at the end of the form, so you can return to it whenever you want to change what is shown.',
      },
      {
        stepNumber: 2,
        title: 'It applies per species, and syncs',
        content: 'Your choices apply to the current species, shown under Customizing sections for: <species>. For example, hiding a field for Fancy Mouse does not hide it for another species. Changes save automatically to your account, and a Saved indicator confirms this. Your preferences follow you between the website and Android app.',
      },
      {
        stepNumber: 3,
        title: 'Hiding whole tabs',
        content: 'Use the Show <Tab> tab checkboxes to hide Identification, Appearance, Health, Routine Care, Behavior, Breeding, Timeline, or Records. Dashboard, Pedigree, and Gallery always remain visible because they contain essential animal information.',
      },
      {
        stepNumber: 4,
        title: 'Hiding individual sections',
        content: 'You can also hide individual sections within a visible tab. For example, keep Identification Numbers and Origin but hide Tags and Classification. Hiding a whole tab hides its sections too, so you do not need to turn each one off separately.',
      },
      {
        stepNumber: 5,
        title: 'This only changes the form, not your data',
        content: 'Customizing only changes what you see in the editing form. It does not delete saved information or change the animal\'s read-only view. You can turn any hidden section back on whenever you need it, and the Customize tab itself always stays available.',
      },
    ],
  },
];
