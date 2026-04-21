// NEW COMPREHENSIVE TUTORIAL SYSTEM
// Tour 1: Getting Started (13 lessons - Animal Creation focused)
// Tour 2: Key Features (4 lessons - Core Features)
// Tour 3: Advanced Features (9 lessons - Advanced functionality)

const GETTING_STARTED_LESSONS = [
  // ============================================
  // TOUR 1: GETTING STARTED - Animal Creation
  // ============================================
  {
    id: 'gs-add-animal',
    title: '1. Add Your First Animal',
    description: 'Start creating your first animal in CritterTrack',
    tour: 'getting-started',
    tourOrder: 1,
    steps: [
      {
        stepNumber: 1,
        title: 'Add Animal Button',
        content: 'Click the "Add Animal" button to start creating your first animal record. This is the primary way to add new animals to your collection.',
        tips: [
          'You can add multiple animals at once by creating them sequentially',
          'All information can be edited later',
          'Press Enter or click next to continue'
        ]
      }
    ]
  },

  {
    id: 'gs-select-species',
    title: '2. Select Species & Learn About Species Management',
    description: 'Understand the species selection system and how to manage species',
    tour: 'getting-started',
    tourOrder: 2,
    steps: [
      {
        stepNumber: 1,
        title: 'Welcome to Species Selection',
        content: 'You are now on the species selection screen. This is where you choose what type of animal you\'re creating. Let me walk you through all the features on this page.',
        tips: [
          'Default species are pre-loaded for you',
          'You can create custom species for your collection',
          'Species selection affects what options are available in other tabs'
        ]
      },
      {
        stepNumber: 2,
        title: 'Default Species',
        content: 'These are the pre-loaded species available to all CritterTrack users. They include common small animals like Fancy Mice, Fancy Rats, and various Hamster species. We\'ll use Fancy Mouse later on. First, let me show you a few other parts of this page.',
        tips: [
          'Default species cannot be deleted',
          'They are available to all users on the platform',
          'You can add custom species in addition to these'
        ]
      },
      {
        stepNumber: 3,
        title: 'Species Search Bar',
        content: 'Use the search bar to find species by name. You can also filter by category (Mammal, Reptile, Bird, etc.) to narrow down your options.',
        tips: [
          'Search is case-insensitive',
          'Category filter helps organize species',
          'Both default and custom species can be searched'
        ]
      },
      {
        stepNumber: 4,
        title: 'Favorite Species (Star Icons)',
        content: 'Notice the star icons on each species card. Click a star to mark a species as a favorite. Favorited species appear at the top of the list with an amber/yellow highlight, making them easier to find.',
        tips: [
          'Favorites are saved to your account',
          'They persist across devices when you log in',
          'Favorites survive clearing browser data - just log back in',
          'A divider separates favorites from other species',
          'The count shows how many favorites are currently displayed'
        ]
      },
      {
        stepNumber: 5,
        title: 'Category Icons on Species Cards',
        content: 'Each species card displays a small category icon — a cat for mammals, turtle for reptiles, bird for birds, and so on. The icon is the only category indicator on the card, making it easy to scan the list at a glance.',
        tips: [
          'Icons appear in the bottom-left corner on small cards',
          'Icons appear in the top-left corner on full-page view',
          'Each category has its own distinctive icon',
          'Icons make visual scanning faster'
        ]
      },
      {
        stepNumber: 6,
        title: 'Add New Species Button',
        content: 'In the bottom right corner is the "Add New Species" button. Click it to create a custom species for your collection.',
        tips: [
          'Custom species are visible only to you',
          'You can add them to any category',
          'Latin/Scientific names are optional but recommended'
        ]
      },
      {
        stepNumber: 7,
        title: 'Species Name',
        content: 'Enter the name of your custom species here. This is the display name that will appear throughout your collection.',
        tips: [
          'Use clear, descriptive names',
          'Can be specific or general',
          'Examples: "Ball Python", "Corn Snake", "Leopard Gecko"'
        ]
      },
      {
        stepNumber: 8,
        title: 'Category Selection',
        content: 'Select a category that best fits your species. This helps organize your species list and makes searching easier. Categories include Mammal, Reptile, Bird, Amphibian, Fish, Invertebrate, and Other.',
        tips: [
          'Choose the most specific category available',
          'You can change this later',
          'The "Other" category is available if no category fits'
        ]
      },
      {
        stepNumber: 9,
        title: 'Latin/Scientific Name',
        content: 'Enter the scientific name of your species here. This is optional but highly recommended for clarity and accuracy. For example, a Fancy Mouse\'s scientific name is "Mus musculus".',
        tips: [
          'Scientific names follow Latin nomenclature',
          'Format: Genus species',
          'This information helps other breeders understand your animals better'
        ]
      },
      {
        stepNumber: 10,
        title: 'Return to Species Selector',
        content: 'Use the "Back" button to return to the species list and select a default species.',
        tips: [
          'You can create more custom species anytime',
          'For this tutorial, we\'ll use a default species',
          'Your custom species will be available for future animals'
        ]
      },
      {
        stepNumber: 11,
        title: 'Select Fancy Mouse',
        content: 'For this tutorial, select "Fancy Mouse" from the species list. This will give us access to all the advanced features like the genetic code builder.',
        tips: [
          'Fancy Mouse is recommended for new users',
          'It has access to genetic code features',
          'You can change this later if needed'
        ]
      }
    ]
  },

  {
    id: 'gs-animal-overview',
    title: '3. Animal Overview - Basic Information',
    description: 'Fill in the basic information about your animal',
    tour: 'getting-started',
    tourOrder: 3,
    steps: [
      {
        stepNumber: 1,
        title: 'Welcome to Animal Overview',
        content: 'You\'re now on the Overview tab. This is where you enter basic information about your animal. Don\'t worry about filling everything now - you can complete other tabs and come back.',
        tips: [
          'Information saves progressively',
          'Only the Save button at the end finalizes everything',
          'You can edit any time after saving'
        ]
      },
      {
        stepNumber: 2,
        title: 'Animal Image',
        content: 'Use the image upload area to add a photo of your animal. A clear, front-facing photo works best. You can update this anytime.',
        tips: [
          'Recommended size: 400x400 pixels or larger',
          'Formats: JPG, PNG, WebP',
          'You can add multiple photos later in the Records tab'
        ]
      },
      {
        stepNumber: 3,
        title: 'Name with Prefix/Suffix',
        content: 'Enter your animal\'s name here. You can also add a Prefix and Suffix. Prefixes and Suffixes are usually abbreviated versions of your breeder "watermark" or affixes - for example, if your breeder prefix is "Starlight Stables", you might use "SS" as a prefix.',
        tips: [
          'Prefix example: "SS" for "Starlight Stables"',
          'Name example: "Luna" or "Max"',
          'Suffix example: might be a generation marker or status code',
          'Full display: "SS Luna Jr" or similar'
        ]
      },
      {
        stepNumber: 4,
        title: 'Gender Selection',
        content: 'Select your animal\'s gender. Options include Male, Female, Intersex, and Unknown. For this tutorial, leave it as Unknown for now.',
        tips: [
          'Intersex and Unknown are available for intersex/unknown animals',
          'Gender affects breeding features',
          'Can be changed anytime'
        ]
      },
      {
        stepNumber: 5,
        title: 'Date of Birth',
        content: 'Enter when your animal was born. This is important for tracking age and health records. If unknown, you can enter an approximate date.',
        tips: [
          'Format: DD/MM/YYYY (displayed)',
          'Use your best estimate if exact date unknown',
          'This affects the animal\'s life stage'
        ]
      },
      {
        stepNumber: 6,
        title: 'Status Selection',
        content: 'Select the current status of your animal. Options include: Pet (living animal in your collection), Breeder (breeding animal), Available (for sale), Booked (reserved/spoken for), Retired (no longer breeding), Deceased (passed away), Rehomed (given to another home), or Unknown. Choose what best describes your animal\'s current situation. Note: The "Sold" status is automatically assigned by the system when a transfer is completed.',
        tips: [
          'Status affects visibility and features available',
          'Can be changed as your animal\'s situation changes',
          'Important for record-keeping and breeding planning'
        ]
      },
      {
        stepNumber: 7,
        title: 'Save vs Continue',
        content: 'The Save button at the bottom saves all tabs at once. All information in the form is held temporarily until you click Save. You can navigate freely between tabs before saving - none of the data is committed until you hit Save.',
        tips: [
          'All tabs\' data is saved together when you hit Save',
          'You can navigate between tabs freely',
          'Only clicking Save finalizes the animal creation'
        ]
      }
    ]
  },

  {
    id: 'gs-status-privacy',
    title: '4. Ownership Settings',
    description: 'Configure ownership and visibility settings',
    tour: 'getting-started',
    tourOrder: 4,
    steps: [
      {
        stepNumber: 1,
        title: 'Welcome to Ownership',
        content: 'This tab controls who owns, manages, and can see your animal. Let\'s walk through each setting.',
        tips: [
          'These settings are crucial for record-keeping',
          'They affect who can see your animal publicly',
          'Multiple visibility toggles throughout the app work the same way'
        ]
      },
      {
        stepNumber: 2,
        title: 'Breeder Assignment',
        content: 'The Breeder section lets you specify who bred this animal. You can either select a registered CritterTrack user as the breeder, or enter a manual name if they\'re not a registered user. Click the field to search for users.',
        tips: [
          'Click to search for registered breeders',
          'Search by name or ID across the platform',
          'Use Manual Name field for non-registered breeders',
          'Tracks breeding history and lineage'
        ]
      },
      {
        stepNumber: 3,
        title: 'Keeper Section',
        content: 'The "🏠 Keeper" section tracks who is currently caring for this animal. Check "Currently Owned by Me" to mark yourself as the current keeper. The Keeper Name field records the name of whoever is keeping the animal right now. The optional Co-Ownership field lets you note shared ownership arrangements. Note: the Co-Ownership field is not available for Fancy Mice.',
        tips: [
          'Checkbox: marks you as the current keeper',
          'Keeper Name: person currently caring for the animal',
          'Co-Ownership: note breeding rights or shared arrangements (not available for Fancy Mice)'
        ]
      },
      {
        stepNumber: 4,
        title: 'Keeper History',
        content: 'The "🏠 Keeper History" section keeps a full log of everyone who has cared for this animal over time. You can add entries manually (type a name) or by searching for a registered CritterTrack user. Optionally select their country. This builds a transparent custody chain, especially useful when animals are transferred between breeders.',
        tips: [
          'Manual Name: type any name for non-registered keepers',
          'Select User: search by name or CTUID for registered users',
          'Country is optional but helps show geographic history',
          'Entries can be removed with the X button',
          'Auto-populated when you receive an animal via transfer'
        ]
      },
      {
        stepNumber: 5,
        title: 'Availability for Sale or Stud',
        content: 'Use this section to make your animal available in the public Marketplace. When you enable "Available for Sale" or "Available for Stud", the price/fee fields will appear inline below the checkbox. Set your desired currency and amount (or select Negotiable). Only public animals marked for sale or stud will appear in the Marketplace.',
        tips: [
          'Enable "Available for Sale" to list with a price',
          'Enable "Available for Stud" to offer breeding services',
          'When enabled, currency and amount fields appear below',
          'Select currency (USD/EUR/GBP/CAD/AUD/JPY) or Negotiable',
          'Requires animal to be set to Public (Eye toggle, top right of detail view)',
          'Public + For Sale/Stud = appears in Marketplace'
        ]
      }
    ]
  },

  {
    id: 'gs-identification',
    title: '5. Identification & Classification',
    description: 'Set up identification numbers, breeds, and tags',
    tour: 'getting-started',
    tourOrder: 5,
    steps: [
      {
        stepNumber: 1,
        title: 'Identification Tab',
        content: 'This tab helps you uniquely identify your animal using multiple identification systems and classification information.',
        tips: [
          'Multiple ID systems ensure uniqueness',
          'Important for record-keeping',
          'Helps prevent accidental duplicates'
        ]
      },
      {
        stepNumber: 2,
        title: 'Identification (Breeder ID)',
        content: 'Enter any custom identification number for your animal. This might be your personal breeder ID, a tattoo number, or any system you use. This field is separate from the microchip number and pedigree registration ID - each serves a different purpose.',
        tips: [
          'Optional but recommended',
          'Use your own numbering system',
          'Examples: "BRD-001", tattoo numbers, cage numbers'
        ]
      },
      {
        stepNumber: 3,
        title: 'Microchip Number',
        content: 'If your animal has been microchipped (common for larger animals or identification purposes), enter the microchip number here.',
        tips: [
          'Optional for most small animals',
          'Common for lost pet recovery',
          'More common in larger animals'
        ]
      },
      {
        stepNumber: 4,
        title: 'Pedigree Registration ID',
        content: 'If your animal is registered with a pedigree or breed registry (like AFRMA for fancy mice), enter that registration ID here.',
        tips: [
          'Important if your animal is registered',
          'Proves pedigree and lineage',
          'Valuable for show animals'
        ]
      },
      {
        stepNumber: 5,
        title: 'Classification Section',
        content: 'The Classification section shows your selected species (Fancy Mouse) and lets you specify the breed. The species cannot be changed after creation - this ensures consistency in your records.',
        tips: [
          'Species is permanent',
          'Set correctly during creation',
          'If wrong, must create a new record'
        ]
      },
      {
        stepNumber: 6,
        title: 'Breed Selection',
        content: 'Fill in the breed of your animal if applicable.',
        tips: [
          'Breeds are species-specific',
          'Only applicable for certain species',
          'Example: Species Mouse > Breed Fancy Mouse'
        ]
      },
      {
        stepNumber: 7,
        title: 'Strain',
        content: 'Enter the strain or genetic line if your animal is part of a specific breeding program. Strains are often named and maintained over generations.',
        tips: [
          'Optional but valuable for breeders',
          'Tracks genetic lines',
          'Examples: "Jackson Black Line", "Siamese Point Strain"'
        ]
      },
      {
        stepNumber: 8,
        title: 'Origin',
        content: 'Select where your animal came from using the Origin dropdown. Options are Captive-bred (born in captivity), Wild-caught (collected from the wild), or Rescue (rehomed from another owner or shelter). This is useful for record-keeping and transparency with buyers.',
        tips: [
          'Captive-bred is the most common for breeders',
          'Wild-caught is relevant for reptiles and fish',
          'Rescue helps track rehomed animals'
        ]
      },
      {
        stepNumber: 9,
        title: 'Tags Feature',
        content: 'Tags allow you to categorize and organize your animals. You can create custom tags like "Show Animal", "Breeding Stock", "Pet", "For Sale", etc. Add tags by typing and pressing Enter.',
        tips: [
          'Tags help organize your collection',
          'Create your own tag system',
          'Can search and filter by tags',
          'One animal can have multiple tags'
        ]
      }
    ]
  },

  {
    id: 'gs-physical',
    title: '6. Appearance & Genetic Code',
    description: 'Document color, coat, genetics, and measurements',
    tour: 'getting-started',
    tourOrder: 6,
    steps: [
      {
        stepNumber: 1,
        title: 'Appearance Tab',
        content: 'This is the Appearance tab where you record detailed physical information about your animal, including appearance and genetic information.',
        tips: [
          'All information here is optional',
          'It helps with breeding decisions',
          'Genetic info is especially important for breeders'
        ]
      },
      {
        stepNumber: 2,
        title: 'Template-Based Physical Fields',
        content: 'The Physical tab displays fields specific to your species based on field templates. For example, Fancy Mouse shows Color, Pattern, Coat Type, and Size fields. Other species may show different fields like Eye Color, Nail Color, Wing Span, Scale Type, and more. Each species template is customized to show only the relevant physical characteristics for that animal type.',
        tips: [
          'Fields vary by species - each template is unique',
          'Fancy Mouse: Color, Pattern, Coat Type, Size',
          'Birds may show Beak Color, Wing Pattern, Crest Type',
          'Reptiles may show Scale Type, Eye Color, Body Pattern',
          'All fields are optional but help with identification and breeding'
        ]
      },
      {
        stepNumber: 3,
        title: 'Carrier Traits',
        content: 'The Carrier Traits field lets you record genetic traits that this animal carries but does not visually express. A carrier animal has one copy of a recessive gene — it looks normal but can pass the trait on to offspring. For example, a "Black Eyed White" mouse may carry "Recessive Yellow" without showing it. Documenting carrier status here helps you make informed breeding decisions and predict offspring outcomes.',
        tips: [
          'Carrier = one copy of a recessive gene, not visually expressed',
          'Important for predicting offspring genetics',
          'Enter traits separated by commas (e.g. "re, p")',
          'Ask the breeder if you are unsure of carrier status',
          'Optional but highly useful for breeding programs'
        ]
      },
      {
        stepNumber: 4,
        title: 'Genetic Code',
        content: 'The Genetic Code field lets you record the genetic notation for your animal. For Fancy Mouse, an ADD button appears next to the field — click it to open the interactive Genetic Builder which guides you through selecting genes with dropdowns. For all other species, only a plain text field is shown with no builder or modal.',
        tips: [
          'Fancy Mouse only: ADD button opens the interactive Genetic Builder',
          'All other species: plain text field, no builder or modal',
          'Genetic codes are optional but highly recommended for breeders',
          'You can always edit this later'
        ]
      },
      {
        stepNumber: 5,
        title: 'Genetic Builder Overview',
        content: 'Welcome to the Genetic Code Builder! This tool helps you document the genetic traits of your animal. You can select genes using dropdown menus (available for Fancy Mouse) or switch to manual mode to enter genetics for any species.',
        tips: [
          'Dropdown mode available for Fancy Mouse',
          'Manual mode available for all species',
          'Both methods produce the same result',
          'Click "Switch to Manual" to continue'
        ]
      },
      {
        stepNumber: 6,
        title: 'Close Genetic Builder',
        content: 'Let\'s go back to the Physical tab. Click the Cancel button to close this builder.',
        tips: [
          'You can always come back to add genetic info',
          'Nothing is saved until you click Save on the main form',
          'Genetic codes are optional'
        ]
      },
      {
        stepNumber: 7,
        title: 'Life Stage',
        content: 'Select the current life stage of your animal from the dropdown. Available options vary by species and may include: Newborn (just born), Juvenile (young), Adult (mature), Senior (elderly), or Unknown. This is a manual selection field.',
        tips: [
          'Life stage options are species-specific',
          'Manually selected from dropdown',
          'Affects breeding eligibility and record organization',
          'Can be updated as the animal ages'
        ]
      },
      {
        stepNumber: 8,
        title: 'Measurements & Growth Tracking',
        content: 'This section tracks your animal\'s physical measurements over time. This is particularly useful for monitoring growth, health, and development. Let\'s add some sample measurements.',
        tips: [
          'Track weight and length over time',
          'Helps monitor health trends',
          'Can identify growth issues early'
        ]
      },
      {
        stepNumber: 9,
        title: 'Measurement Units',
        content: 'First, select your preferred units: Metric (kg, cm) or Imperial (lbs, inches). Choose whichever you\'re most comfortable with.',
        tips: [
          'You can change this anytime',
          'Affects all measurements for this animal',
          'Important for accuracy'
        ]
      },
      {
        stepNumber: 10,
        title: 'Add First Measurement',
        content: 'Now let\'s add a tutorial measurement. Enter the date 01/01/2026, weight 450, and length 20. Then click Add Measurement.',
        tips: [
          'Date: Use recent or estimated date',
          'Weight: In your selected units',
          'Length: In your selected units',
          'Both weight and length are optional'
        ]
      },
      {
        stepNumber: 11,
        title: 'Add Second Measurement',
        content: 'Let\'s add another measurement with today\'s date, weight 500, and length 30. This shows growth over time.',
        tips: [
          'Multiple measurements show trends',
          'The system calculates growth rate',
          'Useful for monitoring health'
        ]
      },
      {
        stepNumber: 12,
        title: 'View Growth Chart',
        content: 'Notice the "Current Measurements" section shows your latest measurement, and the "Growth Curve" chart visualizes how your animal has grown over the dates you entered. This helps you monitor development.',
        tips: [
          'Chart updates automatically with new measurements',
          'Shows growth trajectory',
          'Helps identify health concerns'
        ]
      }
    ]
  },

  {
    id: 'gs-lineage',
    title: '7. Pedigree — Parent Selection',
    description: 'Set up parent information and view pedigree',
    tour: 'getting-started',
    tourOrder: 7,
    steps: [
      {
        stepNumber: 1,
        title: 'Pedigree Tab',
        content: 'The Pedigree tab is where you set your animal\'s parents (Sire and Dam) and view the pedigree chart. This is crucial for understanding genetics and calculating inbreeding coefficients.',
        tips: [
          'Essential for breeding programs',
          'Enables genetic tracking',
          'Helps prevent inbreeding problems'
        ]
      },
      {
        stepNumber: 2,
        title: 'Select Sire (Father)',
        content: 'Click the "Select Sire" button to choose the father of your animal. This will open a search modal.',
        tips: [
          'Sire must be the same species',
          'Sire is typically male (but not always)',
          'Search in Local Animals (yours) or Global (community)'
        ]
      },
      {
        stepNumber: 3,
        title: 'Parent Search System',
        content: 'This modal lets you search for the sire. Notice the buttons for "Local" (your animals), "Global" (community animals), and "Both". You can also search by name or ID. The system only shows animals that match your current animal\'s species and the correct gender. Note: Global search only shows public community animals that other users have made publicly visible.',
        tips: [
          'Local Animals: Your collection only',
          'Global Animals: Public community animals only',
          'Both: Search everywhere',
          'Gender and species filters ensure correct parentage'
        ]
      },
      {
        stepNumber: 4,
        title: 'Close Sire Selector',
        content: 'For now, let\'s close this selector without selecting a parent. Click the X button in the top right corner of the modal to close it.',
        tips: [
          'Click the X button to close the modal',
          'Parents are optional for tutorial',
          'Can add them anytime later',
          'Doesn\'t affect animal creation'
        ]
      },
      {
        stepNumber: 5,
        title: 'Other Parent Selector',
        content: 'This selector is for animals with Intersex or Unknown gender. It works the same way as the Sire and Dam selectors but allows selection of any gender. This is important for inclusive genetics tracking.',
        tips: [
          'Allows selection of Intersex/Unknown genders',
          'Same search functionality as Sire/Dam',
          'Helps track diverse pedigrees'
        ]
      }
    ]
  },

  {
    id: 'gs-breeding',
    title: '9. Fertility Information',
    description: 'Track reproductive status and breeding history',
    tour: 'getting-started',
    tourOrder: 9,
    steps: [
      {
        stepNumber: 1,
        title: 'Fertility Tab',
        content: 'The Fertility tab contains all reproductive information for your animal. It\'s optional for pets but important for breeding animals.',
        tips: [
          'Skip if not planning to breed',
          'Complete if breeding animal',
          'Can be updated anytime'
        ]
      },
      {
        stepNumber: 2,
        title: 'Reproductive Status',
        content: 'This section contains checkboxes for tracking your animal\'s current reproductive status (In Mating, Pregnant, Nursing). These help you monitor active breeding cycles.',
        tips: [
          'Temporary status indicators',
          'Update as status changes',
          'Helps with breeding planning'
        ]
      },
      {
        stepNumber: 3,
        title: 'Estrus & Cycle Information',
        content: 'For females, you can track estrus cycle information. This includes the cycle length and timing, helping you plan breeding.',
        tips: [
          'Important for breeding scheduling',
          'Species-specific cycles',
          'Can be estimated or tracked'
        ]
      },
      {
        stepNumber: 4,
        title: 'Stud Information',
        content: 'This section is available for all male animals to track fertility status and genetics information. To make your animal available for breeding in the showcase, go to the Status & Privacy tab and enable "Available for Stud" with a fee.',
        tips: [
          'Available for all males by default',
          'Track fertility status and genetics',
          'Use Status tab to set "For Stud" and fee',
          'Public + "For Stud" = Appears in showcase'
        ]
      },
      {
        stepNumber: 5,
        title: 'Dam Information',
        content: 'This section is available for all female animals to track fertility status and genetics information. You can fill in fertility status and any genetics or fertility-related notes.',
        tips: [
          'Available for all females by default',
          'Track fertility status and genetics',
          'Optional to complete'
        ]
      }
    ]
  },

  {
    id: 'gs-health',
    title: '10. Health & Medical Records',
    description: 'Track preventive care and medical history',
    tour: 'getting-started',
    tourOrder: 10,
    steps: [
      {
        stepNumber: 1,
        title: 'Health Tab',
        content: 'This tab tracks all health-related information for your animal, including preventive care, procedures, medical history, and veterinary visits.',
        tips: [
          'Important for all animals',
          'Track ongoing care',
          'Create health records'
        ]
      },
      {
        stepNumber: 2,
        title: 'Preventive Care',
        content: 'This section tracks routine preventive care like vaccinations, parasite prevention, and checkups. You can log the date, type, and notes for each preventive treatment.',
        tips: [
          'Regular preventive care extends lifespan',
          'Important for breeding animals',
          'Keep records for future reference'
        ]
      },
      {
        stepNumber: 3,
        title: 'Procedures & Diagnostics',
        content: 'Log any medical procedures or diagnostic tests performed on your animal. This includes surgeries, x-rays, blood tests, etc.',
        tips: [
          'Important for health tracking',
          'Helps identify patterns',
          'Useful for future veterinary care'
        ]
      },
      {
        stepNumber: 4,
        title: 'Active Medical Records',
        content: 'Track current medical conditions, allergies, and medications. This section helps you monitor ongoing health issues and treatments.',
        tips: [
          'Complete medical records are valuable',
          'Track chronic conditions',
          'Share with future owners'
        ]
      },
      {
        stepNumber: 5,
        title: 'Health Clearances & Screening',
        content: 'This collapsible section stores formal health screening results. Fields include Spay/Neuter Date, Heartworm Status, Hip/Elbow Scores, Eye Clearance, Cardiac Clearance, Dental Records, Genetic Test Results, and Chronic Conditions. Most fields are free-text so you can paste in lab results or certification details.',
        tips: [
          'Expand the section to fill in screening results',
          'Genetic test results can include DNA panel summaries',
          'Chronic Conditions is useful for buyer transparency'
        ]
      },
      {
        stepNumber: 6,
        title: 'Veterinary Care',
        content: 'Keep information about your veterinarian and record of visits, including dates, reasons for visit, and treatment provided.',
        tips: [
          'Helps track veterinary history',
          'Important for continuity of care',
          'Useful if changing vets'
        ]
      }
    ]
  },

  {
    id: 'gs-husbandry',
    title: '11. Care Tab — Feeding & Daily Care',
    description: 'Set up feeding schedules, care tasks, and housing details for your animal',
    tour: 'getting-started',
    tourOrder: 11,
    steps: [
      {
        stepNumber: 1,
        title: 'Care Tab',
        content: 'The Care tab is your hub for daily care — feeding schedules, routine care tasks, housing & environment details. Setting these up here is what powers the Management View\'s automated due-date tracking.',
        tips: [
          'Feeding & care schedules set here drive Management View alerts',
          'Helps if you ever need to rehome',
          'Documents your care practices'
        ]
      },
      {
        stepNumber: 2,
        title: 'Feeding Schedule',
        content: 'Set your animal\'s diet type, feeding frequency (in days), and last fed date. Once set, the Management View will automatically flag this animal as "Due" or "Overdue" when feeding time arrives.',
        tips: [
          'Feeding frequency drives Management View alerts',
          'Set last fed date to start tracking from today',
          'Works with Supplies & Inventory to log food used'
        ]
      },
      {
        stepNumber: 3,
        title: 'Housing & Enclosure',
        content: 'Assign your animal to an enclosure and document housing details including type, bedding, enrichment, and enclosure maintenance schedule. Add enclosure care tasks like "Deep clean" or "Water change" with frequencies.',
        tips: [
          'Enclosure assignment helps organize animals',
          'Maintenance tracking powers Management View',
          'Separate from animal-specific care tasks'
        ]
      },
      {
        stepNumber: 4,
        title: 'Animal Care',
        content: 'Track recurring care tasks specific to this animal like weighing, nail trims, health checks, and handling routines. Add notes about handling preferences, socialization, and special care requirements.',
        tips: [
          'Each task tracked independently',
          'Mark done from Management View',
          'Document handling and socialization needs'
        ]
      },
      {
        stepNumber: 5,
        title: 'Environment',
        content: 'Document environmental conditions including temperature range, humidity levels, lighting schedule, and noise levels. Proper environment is crucial for health and breeding success.',
        tips: [
          'Environment affects behavior and health',
          'Important for breeding success',
          'Track seasonal variations'
        ]
      },
      {
        stepNumber: 6,
        title: 'Grooming',
        content: 'Document grooming needs and shedding level for your animal. This section is especially relevant for dogs and cats but applies to any species with regular grooming requirements. Use the Grooming Needs field to note frequency and type (e.g., "Weekly brushing, monthly bath") and the Shedding Level dropdown to indicate how much your animal sheds.',
        tips: [
          'Grooming Needs is a free-text field',
          'Shedding Level helps future owners plan',
          'Documents ongoing care requirements'
        ]
      }
    ]
  },

  {
    id: 'gs-behavior',
    title: '12. Behavior & Personality',
    description: 'Track behavior, temperament, and activity patterns',
    tour: 'getting-started',
    tourOrder: 12,
    steps: [
      {
        stepNumber: 1,
        title: 'Behavior Tab',
        content: 'This tab documents your animal\'s personality, behavior traits, and activity patterns. These observations are valuable for understanding your animal and for breeding decisions.',
        tips: [
          'Behavior can be hereditary',
          'Important for breeding decisions',
          'Helps with animal handling'
        ]
      },
      {
        stepNumber: 2,
        title: 'Behavior Items',
        content: 'Record specific behaviors you observe: friendly, aggressive, shy, active, calm, curious, destructive, etc. Add dates and notes about when and how often you see these behaviors.',
        tips: [
          'Detailed observations are valuable',
          'Behavioral traits can be heritable',
          'Track changes over time'
        ]
      },
      {
        stepNumber: 3,
        title: 'Activity',
        content: 'The Activity section covers your animal\'s schedule and physical needs. Set the Activity Cycle (Nocturnal, Diurnal, or Crepuscular), Exercise Requirements (Low to Very High), and Daily Exercise in minutes. If your species template includes training fields, you\'ll also see Training Level, Training Disciplines, Working Role, Certifications, and training checkboxes (Crate Trained, Litter Trained, Leash Trained, Free Flight Trained) within this same section.',
        tips: [
          'Activity Cycle is mostly species-determined',
          'Exercise fields most relevant for dogs',
          'Training fields are template-controlled — may not appear for all species',
          'Examples: Mice are nocturnal, hamsters are crepuscular'
        ]
      },
      {
        stepNumber: 4,
        title: 'Known Issues',
        content: 'This section records any behavioural challenges or safety considerations. Behavioral Issues captures recurring problems (e.g., resource guarding, separation anxiety), Bite History logs any bite incidents with context, and Reactivity Notes describes triggers, thresholds, and management strategies. These fields are template-controlled and may not appear for all species.',
        tips: [
          'Be honest — this helps future owners',
          'Important for safety and rehoming transparency',
          'Template-controlled — may not show for all species'
        ]
      }
    ]
  },

  {
    id: 'gs-records-eol',
    title: '13. Notes',
    description: 'Add notes and additional information about your animal',
    tour: 'getting-started',
    tourOrder: 13,
    steps: [
      {
        stepNumber: 1,
        title: 'Notes Tab',
        content: 'The Notes tab is for general remarks and any additional information about your animal.',
        tips: [
          'Catch-all for additional info',
          'Good for observations',
          'Can add images here'
        ]
      },
      {
        stepNumber: 2,
        title: 'Remarks & Notes',
        content: 'Add any observations or notes about your animal that don\'t fit in other sections. This might include personality quirks, notable achievements, breeding notes, or any other relevant information.',
        tips: [
          'Free-form text field',
          'Great for detailed observations',
          'Useful for future reference'
        ]
      }
    ]
  },

  {
    id: 'gs-show',
    title: '14. Show Titles & Accomplishments',
    description: 'Document show titles, ratings, and achievements',
    tour: 'getting-started',
    tourOrder: 14,
    steps: [
      {
        stepNumber: 1,
        title: 'Show Tab',
        content: 'This tab is where you document your animal\'s show titles, ratings, judge comments, and any accomplishments from competitions or events.',
        tips: [
          'Important for competitive animals',
          'Track progression over time',
          'Valuable for breeding programs'
        ]
      },
      {
        stepNumber: 2,
        title: 'Show Titles & Ratings',
        content: 'Document any official titles your animal has earned at shows or competitions. Show Titles might include "Champion (CH)", "Grand Champion (GCH)", or "Best in Show". Show Ratings include scores and ratings like "Excellent" or "Very Good".',
        tips: [
          'List all titles earned',
          'Include abbreviations and full names',
          'Helps track accomplishments',
          'Valuable for marketing breeding animals'
        ]
      },
      {
        stepNumber: 3,
        title: 'Judge Comments',
        content: 'Record any notable feedback or comments from judges at shows or competitions. This can help you understand your animal\'s strengths and areas for improvement.',
        tips: [
          'Valuable feedback for breeders',
          'Helps identify strengths',
          'Useful for breeding decisions',
          'Can guide future showing strategy'
        ]
      }
    ]
  },

  {
    id: 'gs-legal',
    title: '15. Legal & End of Life',
    description: 'Manage legal documentation and end-of-life records',
    tour: 'getting-started',
    tourOrder: 15,
    steps: [
      {
        stepNumber: 1,
        title: 'Legal Tab',
        content: 'This tab manages all legal and administrative documentation for your animal, including licensing, insurance, ownership documents, permits, and restrictions.',
        tips: [
          'Important for compliance',
          'Keep official documents recorded',
          'Required for some species'
        ]
      },
      {
        stepNumber: 2,
        title: 'Licensing & Permits',
        content: 'Record License Number and License Jurisdiction for animals that require licensing or permits. This might include kennel licenses, exotic animal permits, or breeding licenses depending on your location and species.',
        tips: [
          'Required for some species or jurisdictions',
          'Keep license numbers up to date',
          'Check local regulations'
        ]
      },
      {
        stepNumber: 3,
        title: 'Legal / Administrative',
        content: 'Document insurance details (pet insurance policy, provider, coverage) and legal status (ownership documents, permits, CITES registration for regulated species).',
        tips: [
          'Some species require permits',
          'Insurance protects your investment',
          'Keep permit numbers accessible'
        ]
      },
      {
        stepNumber: 4,
        title: 'Restrictions',
        content: 'Record any Breeding Restrictions (limited registration, spay/neuter contracts) or Export Restrictions that apply to this animal.',
        tips: [
          'Important for contract compliance',
          'Export restrictions vary by country',
          'Breeding restrictions protect genetics'
        ]
      },
      {
        stepNumber: 5,
        title: 'End of Life Tab',
        content: 'The End of Life tab (tab 14) is where you document end-of-life information for your animal. This is optional for living animals but important to complete when an animal passes away.',
        tips: [
          'Optional for living animals',
          'Important when animal passes',
          'Completes the full record'
        ]
      },
      {
        stepNumber: 6,
        title: 'Date of Death',
        content: 'When your animal passes away, enter the date of death here. This automatically updates the animal\'s status to "Deceased".',
        tips: [
          'Marks end of active record',
          'Status changes to Deceased',
          'Important for complete records'
        ]
      },
      {
        stepNumber: 7,
        title: 'Cause of Death',
        content: 'Document what caused your animal\'s death: natural causes, illness, predation, accident, etc. This helps with understanding health patterns.',
        tips: [
          'Helps track health issues',
          'Useful for breeding decisions',
          'Important for complete records'
        ]
      },
      {
        stepNumber: 8,
        title: 'Necropsy Results',
        content: 'If a necropsy (animal autopsy) was performed, document the findings here. This is valuable medical information.',
        tips: [
          'Professional necropsy provides details',
          'Helps understand health issues',
          'Valuable for genetics research'
        ]
      }
    ]
  }
];

// ============================================
// TOUR 2: KEY FEATURES - Core Features
// ============================================

const KEY_FEATURES_LESSONS = [
  {
    id: 'kf-viewing-animals',
    title: '1. Viewing & Editing Animals',
    description: 'Learn how to view and edit your animal records',
    tour: 'key-features',
    tourOrder: 1,
    steps: [
      {
        stepNumber: 1,
        title: 'Click on an Existing Animal',
        content: 'To view an animal\'s full details, click on any animal card in your My Animals list. This opens the detailed view with all tabs and information.',
        tips: [
          'Each animal has a complete record',
          'Shows all tabs of information',
          'View-only by default'
        ]
      },
      {
        stepNumber: 2,
        title: 'Owned Toggle',
        content: 'The owned toggle lets you mark whether you currently own this animal. When set to owned (red Heart icon), the animal appears under your "Owned" filter and, if also set to public, on your PUBLIC profile. When not owned (gray Heart-Off icon), it only appears in your private "All" filter. This is useful for tracking sold or rehomed animals while keeping their records. You can find this toggle at the top right of the detail overview screen. Changes apply instantly!',
        tips: [
          'Located at top right of detail view',
          'Red Heart = Owned, Gray Heart-Off = Not Owned',
          'Owned + Public = Shows on your PUBLIC profile',
          'Not owned animals only in "All" filter',
          'Useful for sold or rehomed animals',
          'Can be toggled anytime - updates instantly'
        ]
      },
      {
        stepNumber: 3,
        title: 'Private Toggle',
        content: 'The private/public toggle controls global web visibility of this animal. When set to public (green Eye icon), others can view it via search, as a parent/offspring in pedigrees, and on your PUBLIC profile (if also owned). When private (gray Eye-Off icon), only you can see the full record — other users will see a "Hidden / Private Profile" placeholder in pedigree charts where this animal appears, so lineage is indicated but the animal\'s details remain hidden. Exception: users who received or sent this animal via a transfer can still see it. You can find this toggle at the top right of the detail overview screen. Changes apply instantly!',
        tips: [
          'Located at top right of detail view',
          'Green Eye = Public, Gray Eye-Off = Private',
          'Controls global web visibility',
          'Public animals appear in search & pedigrees',
          'Private animals show as a placeholder in others\' pedigree charts',
          'Transfer recipients/senders can always see each other\'s animals',
          'Can be toggled anytime - updates instantly'
        ]
      },
      {
        stepNumber: 4,
        title: 'Pedigree Chart Button',
        content: 'On the Lineage tab, you can click the "View Pedigree" button to see a detailed family tree chart of your animal. This shows parents, grandparents, and further back generations. When you\'re done viewing, close this pedigree screen by clicking the X or close button.',
        tips: [
          'Visual representation of pedigree',
          'Requires parent data to be useful',
          'Can be downloaded as PDF',
          'Close the pedigree screen when done'
        ]
      },
      {
        stepNumber: 5,
        title: 'Edit Button',
        content: 'Click the "Edit" button in the top right corner to enter edit mode. This allows you to modify any information in the animal record.',
        tips: [
          'Edit view is almost identical to create view',
          'All tabs available for editing',
          'Changes save with the Save button'
        ]
      },
      {
        stepNumber: 6,
        title: 'Edit View Overview',
        content: 'You\'re now in the edit view. Notice it works exactly like the create form - same tabs, same fields, same Save button. You can edit any information here.',
        tips: [
          'Familiar interface from Getting Started',
          'All previous data is pre-filled',
          'Navigate tabs to edit different sections'
        ]
      },
      {
        stepNumber: 7,
        title: 'Delete Button',
        content: 'When you\'re in edit mode, you can find the Delete button (usually in red) at the bottom of the form. This allows you to remove an animal from your collection entirely. Warning: This action cannot be undone, so use with caution.',
        tips: [
          'Located in edit mode at the bottom',
          'Permanent action - cannot undo',
          'Cannot delete animals with offspring',
          'Consider marking as Deceased instead'
        ]
      },
      {
        stepNumber: 8,
        title: 'Close Edit Without Saving',
        content: 'For now, let\'s go back to the main animal list without making changes. Click the back arrow at the top right to close edit mode and return to your list. You can always reopen an existing animal to view or edit it again.',
        tips: [
          'Back arrow closes edit mode without saving',
          'Returns you to the main animal list',
          'Your data remains unchanged',
          'You can reopen any animal anytime to view or edit'
        ]
      }
    ]
  },

  {
    id: 'kf-creating-litters',
    title: '2. Creating Litters & Managing Offspring',
    description: 'Learn how to create litters and link offspring',
    tour: 'key-features',
    tourOrder: 2,
    steps: [
      {
        stepNumber: 1,
        title: 'Move to Litters',
        content: 'Now let\'s explore the Litters feature. Click the "Litters" button in the header to navigate to the litter management section.',
        tips: [
          'Litters are where you track breeding',
          'Where offspring are recorded',
          'Essential for breeding programs'
        ]
      },
      {
        stepNumber: 2,
        title: 'Litter Management',
        content: 'You\'re now in the Litters section. This is where you track breeding litters and manage offspring. Click the "New Litter" button to create a new litter.',
        tips: [
          'Litters organize offspring by breeding',
          'Each litter has parents and offspring',
          'Optional but helpful for breeders'
        ]
      },
      {
        stepNumber: 3,
        title: 'Sire & Dam Selection',
        content: 'Select both a Sire (father) and Dam (mother) for the litter. Note: Intersex and Unknown gender animals can be selected on both Sire and Dam selectors, allowing inclusive representation of intersex/unknown animals.',
        tips: [
          'Both parents are mandatory',
          'Can use same species animals',
          'Inclusive gender selection available'
        ]
      },
      {
        stepNumber: 4,
        title: 'Birth Date & Offspring Count',
        content: 'Enter the birth date of the litter (optional but recommended). The male and female count fields are simple text fields for administrative tracking. There is a separate feature for direct offspring creation that relies on the birth date.',
        tips: [
          'Birth date needed to create offspring directly',
          'Male/female counts are optional text fields',
          'Used for statistics and tracking'
        ]
      },
      {
        stepNumber: 5,
        title: 'Link Existing Animals',
        content: 'You can link existing animals as offspring during litter creation. Select animals with matching parents to link them to this litter. If you have no birth date filled, it will auto-fill from the existing offspring when you click them.',
        tips: [
          'Only requires parents to be filled',
          'Shows animals matching those parents',
          'Auto-fills birth date from offspring if empty',
          'Completes the family tree'
        ]
      },
      {
        stepNumber: 6,
        title: 'Create New Offspring Animals',
        content: 'In the "New Offspring Animals" section (separate from the male/female count fields), you can directly create new offspring animals. With a birth date filled in, click "Create Offspring" to add new animals and automatically set them as children of this litter with the sire and dam already assigned.',
        tips: [
          'Different from male/female count fields',
          'Found in "New Offspring Animals" section',
          'Creates animals with parent links pre-filled',
          'Requires birth date to use'
        ]
      },
      {
        stepNumber: 7,
        title: 'Litter Card Details',
        content: 'Once you\'ve created a litter, click on a litter card to view its details. Here you can see the parents, offspring, and manage the litter from an expanded view.',
        tips: [
          'Requires a litter to be created first',
          'Shows complete litter information',
          'Edit, link, or add offspring from here',
          'View parentage clearly'
        ]
      },
      {
        stepNumber: 8,
        title: 'Litter Actions',
        content: 'On the expanded litter view, you\'ll see buttons to: Edit the litter, Link animals to it, Add new offspring, and Delete the litter. These give you full control over litter management.',
        tips: [
          'Edit changes parent or dates',
          'Link connects existing animals',
          'Add offspring creates new animals',
          'Delete removes litter (careful!)'
        ]
      },
      {
        stepNumber: 9,
        title: 'Show a Litter on Your Public Profile',
        content: 'Each litter card has an Eye / EyeOff icon at the very left of the compact header, before the litter name. Click it to toggle public visibility: green Eye = this litter is shown on your public breeder profile, grey EyeOff = hidden. A "Litters" tab automatically appears on your public profile once at least one litter is marked public. The public card shows the pairing name, litter ID badge, sire × dam, status badge (Planned / Born), dates, a photo thumbnail strip, and any notes.',
        tips: [
          'Eye/EyeOff icon is the first element on each litter card',
          'Green Eye = shown publicly, Grey EyeOff = hidden from profile',
          'Litters tab only appears on your public profile when at least 1 litter is public',
          'Notes are always shown when a litter is public',
          'Photos (if uploaded) display as a thumbnail strip on the public card',
          'Works for both planned and born litters'
        ]
      }
    ]
  },

  {
    id: 'kf-profile-settings',
    title: '3. Profile Settings & Public Identity',
    description: 'Configure your breeder profile and visibility',
    tour: 'key-features',
    tourOrder: 3,
    steps: [
      {
        stepNumber: 1,
        title: 'Move to Profile',
        content: 'Let\'s now explore your profile settings. Click the "Profile" button in the header.',
        tips: [
          'Profile shows your public identity',
          'Settings affect sharing and visibility',
          'Where others find you'
        ]
      },
      {
        stepNumber: 2,
        title: 'Profile Summary',
        content: 'Your profile page shows a summary of your settings and information. You can see your Personal ID here - this is a unique identifier in CritterTrack. Your Personal ID is used by other users to find and contact you.',
        tips: [
          'Personal ID is unique to you',
          'Shown to other users',
          'Used for sharing and transfers',
          'Share this ID to receive notifications'
        ]
      },
      {
        stepNumber: 3,
        title: 'Edit Profile Button',
        content: 'Click "Edit Profile" to modify your profile information including name, image, and public settings.',
        tips: [
          'Opens edit mode for profile',
          'Can change all public info',
          'Changes save immediately'
        ]
      },
      {
        stepNumber: 4,
        title: 'Profile Image',
        content: 'Upload a profile picture. This image represents you to other users. Click the image area to upload.',
        tips: [
          'Shows to other users',
          'Professional photo recommended',
          'Optional but recommended'
        ]
      },
      {
        stepNumber: 5,
        title: 'Personal Name & Breeder Name',
        content: 'Enter your Personal Name (your real name) and Breeder Name (your breeder affixes/kennel name). These are separate so you can maintain privacy if desired. Each has a visibility toggle.',
        tips: [
          'Personal Name: Your real identity',
          'Breeder Name: Your breeding prefix/affixes',
          'Both can be private or public'
        ]
      },
      {
        stepNumber: 6,
        title: 'Website & Country',
        content: 'Add your website (if you have a breeding website), select your country, and write a bio. The bio helps tell other breeders about yourself and your breeding program. These help other users find and learn about you.',
        tips: [
          'Website links to your info',
          'Country helps with shipping/contact',
          'Optional information'
        ]
      },
      {
        stepNumber: 7,
        title: 'Public Profile Visibility',
        content: 'These checkboxes control what information is visible on your public profile. Check which aspects you want to share: Personal Name, Breeder Name, website, etc. If private, only you see that info.',
        tips: [
          'Strategic visibility increases interest',
          'Can be very selective',
          'You always see everything'
        ]
      },
      {
        stepNumber: 8,
        title: 'Messaging Preferences',
        content: 'Configure how other users can contact you. You can allow messages, emails, or both. This controls your preferred method of communication.',
        tips: [
          'Controls how users reach you',
          'Choose your preferred method',
          'Can change anytime'
        ]
      },
      {
        stepNumber: 9,
        title: 'Email Notifications',
        content: 'Set up email notifications for important events like messages, transfer requests, or system updates. Choose which notifications you want to receive.',
        tips: [
          'Stay informed about important events',
          'Customizable preferences',
          'Helpful for active breeders'
        ]
      },
      {
        stepNumber: 10,
        title: 'Breeding Status',
        content: 'Set your breeding status for each species you work with. Choose Owner (not breeding), Active Breeder, or Retired Breeder. Active and Retired breeders are visible in the public Breeders Registry.',
        tips: [
          'Owner: You have animals but don\'t breed',
          'Active Breeder: Currently breeding this species',
          'Retired Breeder: No longer actively breeding',
          'Active/Retired breeders appear in directory'
        ]
      },
      {
        stepNumber: 11,
        title: 'Info & Adoption Settings Tab',
        content: 'In your Settings, open the "Info & Adoption" tab to fill in detailed information about your breeding program for visitors to your public profile. Fields include: About My Program, Adoption / Rehoming Rules, Enclosure & Routine Care Requirements, Health Guarantee, Waitlist and Booking Info, Pricing / Fee Notes, Contact Preferences — plus up to 10 fully custom fields with your own title and content. Use the bold/italic toolbar to format your text. Each filled section appears as a collapsible accordion on your public profile\'s "Info & Adoption" tab.',
        tips: [
          'Found under Settings → Info & Adoption tab',
          'All fields are optional — only filled sections appear publicly',
          'Up to 10 custom fields with your own titles',
          'Bold and italic formatting toolbar available',
          'Sections display as collapsible accordions on your public profile',
          'Save after editing to publish changes'
        ]
      },
      {
        stepNumber: 12,
        title: 'Save or Cancel',
        content: 'Use the Save button to keep your changes or Cancel to discard them. Changes are applied immediately upon save.',
        tips: [
          'Save makes changes permanent',
          'Cancel discards edits',
          'Return to summary after save'
        ]
      },
      {
        stepNumber: 13,
        title: 'Move to Budget',
        content: 'Now let\'s explore the Budget section to understand financial tracking. Click the "Budget" button in the header.',
        tips: [
          'Budget tracks breeding finances',
          'Shows profitability',
          'Important for breeders'
        ]
      }
    ]
  },

  {
    id: 'kf-budget-transfers',
    title: '4. Budget & Animal Transfers',
    description: 'Track finances and manage animal transfers',
    tour: 'key-features',
    tourOrder: 4,
    steps: [
      {
        stepNumber: 1,
        title: 'Budget Overview',
        content: 'The Budget section shows your financial overview: Total Sales, Total Purchases, Net Profit/Loss, and Average Sale Price. This helps you understand the financial side of your breeding program.',
        tips: [
          'Shows financial summary',
          'Helps plan breeding',
          'Tracks profitability'
        ]
      },
      {
        stepNumber: 2,
        title: 'Add Transaction - Expense',
        content: 'Click the "Add Transaction" button and select "Expense". This records costs like food, bedding, veterinary care, equipment, etc.',
        tips: [
          'Expenses reduce net profit',
          'Important for accurate tracking',
          'Includes all care costs'
        ]
      },
      {
        stepNumber: 3,
        title: 'Expense Fields',
        content: 'On the Expense form, fill in: Date, Category (food, housing, medical, equipment, other), Description, Amount, and optional notes. This creates a detailed expense record.',
        tips: [
          'Categorize for better tracking',
          'Be specific in description',
          'Notes help remember details'
        ]
      },
      {
        stepNumber: 4,
        title: 'Close & Reopen Add Transaction',
        content: 'Let\'s explore other transaction types. Close this transaction and reopen the "Add Transaction" button.',
        tips: [
          'Multiple transaction types available',
          'Each serves different purpose',
          'Different forms for different types'
        ]
      },
      {
        stepNumber: 5,
        title: 'Animal Sale - Manual Entry',
        content: 'Select "Animal Sale" then "Manual Entry". This records a sale without using the transfer system - you just record the basic sale details manually.',
        tips: [
          'Manual entry is simple',
          'Good for external sales',
          'No system integration'
        ]
      },
      {
        stepNumber: 6,
        title: 'Manual Sale Fields',
        content: 'Enter: Date, Animal (if you want to link it), Buyer, Sale Price, and Notes. This creates a record of the transaction.',
        tips: [
          'Simple transaction entry',
          'Works for any animal',
          'Records sale history'
        ]
      },
      {
        stepNumber: 7,
        title: 'Close & Reopen - Transfer Ownership',
        content: 'Let\'s look at Transfer Ownership, which is more sophisticated. Close this, reopen Add Transaction, select "Animal Sale", then "Transfer Ownership".',
        tips: [
          'Transfer creates relationships',
          'Both users stay connected',
          'Recommended for CritterTrack users'
        ]
      },
      {
        stepNumber: 8,
        title: 'Transfer Ownership Features',
        content: 'Transfer Ownership initiates an animal transfer between CritterTrack users. The key features are: The animal gets a "Sold" status in your collection, you retain a view-only copy of the animal\'s record, the new owner gains full editing rights, and you can see all future changes they make. Neither party can delete the animal. Privacy note: transferred animals are treated like your own animals for visibility purposes — both parties can always view the full record and its ancestors in pedigrees, even if those ancestors are set to private by their owners.',
        tips: [
          'Maintains breeding history',
          'Both parties keep records',
          'Prevents accidental deletion',
          'Shows lineage transparency',
          'Both parties can see ancestors/pedigree even if private'
        ]
      },
      {
        stepNumber: 9,
        title: 'Close & Reopen - Animal Purchase',
        content: 'Now let\'s look at purchases. Close this, reopen Add Transaction, and select "Animal Purchase". Since manual entry is the same as sales, we\'ll focus on the "Notify Seller" option.',
        tips: [
          'Purchase is the other side of sale',
          'Notify Seller is special feature',
          'Creates community connections'
        ]
      },
      {
        stepNumber: 10,
        title: 'Notify Seller Feature',
        content: 'The "Notify Seller" feature sends a notification to the original breeder that you\'ve acquired their animal. You enter their Personal ID, and they receive a notification. The seller gets a view-only copy showing that you now own the animal and any information you\'ve added.',
        tips: [
          'Keeps breeding community connected',
          'Seller gets updates on animal',
          'Read-only access for seller',
          'They cannot edit your records'
        ]
      }
    ]
  },

  {
    id: 'af-searching',
    title: '5. Searching & Filtering Animals',
    description: 'Master search and filtering tools',
    tour: 'key-features',
    tourOrder: 5,
    steps: [
      {
        stepNumber: 1,
        title: 'Global Search Bar in Header',
        content: 'At the top of every screen there is an inline search bar — no button to click, just type! It searches the entire CritterTrack community simultaneously: type a name, species, or ID and results for both users and animals drop down instantly. Animals appear at the top of the results, users appear below.',
        tips: [
          'Start typing after 2 characters — results appear automatically',
          'Use CTU followed by numbers to search users (e.g. CTU1234)',
          'Use CTC followed by numbers to search animals (e.g. CTC5678)',
          'Plain text searches both users and animals at once',
          'Click any result to jump straight to that profile or animal'
        ]
      },
      {
        stepNumber: 2,
        title: 'My Feed',
        content: 'The "My Feed" tab (first in the navigation bar) is your personal community hub. It shows: recently active members with a green dot, your favorited animals, your favorited breeders, and recently updated animals from breeders you follow. It is a quick overview of everything you care about in the community.',
        tips: [
          'Access My Feed from the first nav tab (Users icon)',
          'Recently active members show with a green dot',
          'Favorite animals by clicking the heart icon on any animal profile',
          'Favorite breeders by clicking the heart icon on their profile',
          'Recently updated favorites: see when your saved animals change'
        ]
      },
      {
        stepNumber: 3,
        title: 'My Animals Search Bar',
        content: 'In your "My Animals" section, you\'ll find a separate search bar that lets you search within your own collection by animal name. This is local to your animals only.',
        tips: [
          'Search only your animals',
          'Quick filtering of your collection',
          'Enter animal name to search',
          'Combines with filters below'
        ]
      },
      {
        stepNumber: 4,
        title: 'Species Filter',
        content: 'In your "My Animals" section, use the Species dropdown to filter your collection by animal type. Combine this with the search bar for quick access to specific animals.',
        tips: [
          'Filter your collection by type',
          'Narrows down results quickly',
          'Works with name search above',
          'Helps organize large collections'
        ]
      },
      {
        stepNumber: 5,
        title: 'Gender Filter',
        content: 'Use the Gender filter to find males, females, or other genders in your collection. This is helpful when planning breeding pairs.',
        tips: [
          'Find breeding prospects',
          'Organize by reproductive role',
          'Combine with species filter',
          'Plan your breeding program'
        ]
      },
      {
        stepNumber: 6,
        title: 'Status Filter',
        content: 'Filter by status (Pet, Breeder, Available, Sold, etc.) to quickly find animals in specific situations within your collection.',
        tips: [
          'Find breeding stock',
          'See available for sale animals',
          'Track sold animals',
          'Manage collection purpose'
        ]
      },
      {
        stepNumber: 7,
        title: 'Combined Filtering',
        content: 'Use multiple filters together: search by name, filter by species and gender, then by status. This gives you powerful tools to find exactly what you\'re looking for in your collection.',
        tips: [
          'Layer multiple filters',
          'Quick specific searches',
          'Very flexible organization',
          'Manage large collections easily'
        ]
      }
    ]
  },

  {
    id: 'af-notifications',
    title: '6. Notification System',
    description: 'Stay informed with notifications',
    tour: 'key-features',
    tourOrder: 6,
    steps: [
      {
        stepNumber: 1,
        title: 'Notifications Overview',
        content: 'Notifications alert you to important events: messages from other users, animal transfer requests, breeding inquiries, and system updates. Click the bell icon in the header to access your notification center.',
        tips: [
          'Stay connected to community',
          'Never miss important info',
          'Customizable preferences'
        ]
      },
      {
        stepNumber: 2,
        title: 'Transfer Request Notifications',
        content: 'When someone initiates an animal transfer with you (either to buy or to receive your animal), you\'ll be notified.',
        tips: [
          'Don\'t miss sale opportunities',
          'Stay on top of incoming animals',
          'Act quickly on time-sensitive offers'
        ]
      },
      {
        stepNumber: 3,
        title: 'System Notifications',
        content: 'Receive alerts about important system events, updates, or maintenance. These are typically low-priority but keep you informed.',
        tips: [
          'Stay aware of platform changes',
          'Know about new features',
          'Understand any issues'
        ]
      },
      {
        stepNumber: 4,
        title: 'Message Notifications',
        content: 'Receive alerts when other CritterTrack users send you messages. Click the Messages button in the header to view your conversations with other breeders.',
        tips: [
          'Community communication',
          'Stay in touch with breeders',
          'Unread count badge shows new messages'
        ]
      }
    ]
  },

  {
    id: 'af-messaging',
    title: '7. Messaging System',
    description: 'Communicate with other breeders',
    tour: 'key-features',
    tourOrder: 7,
    steps: [
      {
        stepNumber: 1,
        title: 'Messaging Overview',
        content: 'Send messages to other CritterTrack users. This is how you inquire about animals, discuss breeding, coordinate transfers, or build relationships in the breeding community.',
        tips: [
          'Direct communication tool',
          'Build breeding connections',
          'Share knowledge'
        ]
      },
      {
        stepNumber: 2,
        title: 'Send Message from Profile',
        content: 'To message another breeder, first find their profile (you can search for them using the global search). Once on their profile, click the "Message" button to start a conversation. This lets you reach out about their animals, ask breeding questions, or coordinate transfers.',
        tips: [
          'Find breeders through global search',
          'View their public profile',
          'Click Message button to start chat',
          'Requires them to allow messages'
        ]
      },
      {
        stepNumber: 3,
        title: 'Message Conversations',
        content: 'Messages are organized in conversations. Each conversation shows the history of messages between you and another user.',
        tips: [
          'See full conversation history',
          'Know what was discussed',
          'Reference past agreements'
        ]
      },
      {
        stepNumber: 4,
        title: 'Privacy in Messaging',
        content: 'Messages are private between you and the recipient. Neither party can force messages onto non-responders - messaging requires mutual agreement if messaging preferences are restricted.',
        tips: [
          'Secure communication',
          'Respect privacy settings',
          'Both parties control messaging'
        ]
      },
      {
        stepNumber: 5,
        title: 'Next: Advanced Features Tour',
        content: 'Congratulations on completing the Key Features tour! You now understand how to view and edit animals, manage litters, configure your profile, handle breeding finances, search and filter, receive notifications, and communicate with other breeders. The "My Feed" tab is your personalized community hub — check it regularly to stay up to date with your favorited animals and breeders. Would you like to start the "Advanced Features" tour? This will teach you about tags, genetics, COI calculations, and more advanced community features.',
        tips: [
          'Advanced Features builds on Key Features',
          'Covers tags, genetics, and advanced search',
          'You can start it anytime from the tutorial menu',
          'Optional but highly recommended'
        ]
      }
    ]
  }
];

const ADVANCED_FEATURES_LESSONS = [
  {
    id: 'af-tags-management',
    title: '1. Tags & Mass Management',
    description: 'Organize animals with tags and bulk operations',
    tour: 'advanced-features',
    tourOrder: 1,
    steps: [
      {
        stepNumber: 1,
        title: 'Tags Overview',
        content: 'Tags are labels you create to organize your collection. Common tags: "Show Animals", "Breeding Stock", "Pets", "For Sale", "Problem Behaviors", etc.',
        tips: [
          'Flexible organization system',
          'Create your own tags',
          'Multiple tags per animal'
        ]
      },
      {
        stepNumber: 2,
        title: 'Adding Tags',
        content: 'In the animal form, find the Tags field. Type a tag name and press Enter to add it. Tags can be new or existing from your tag list.',
        tips: [
          'Create tags on the fly',
          'Tag suggestions appear',
          'Press Enter to confirm'
        ]
      },
      {
        stepNumber: 3,
        title: 'Filtering by Tags',
        content: 'You can search for animals by their tags using the "Search by animal name" field. For example, typing "LineB" will show all animals with that tag. The search works for both animal names and tags.',
        tips: [
          'Search field finds tag names',
          'Works for both names and tags',
          'Combine with species/gender filters',
          'Great for line breeding organization'
        ]
      },
      {
        stepNumber: 4,
        title: 'Bulk Privacy Controls',
        content: 'At the top of the My Animals page, you\'ll see "All Public" and "All Private" buttons. These let you instantly change the visibility of ALL your animals at once. The UI updates immediately, and changes sync with the database in the background.',
        tips: [
          'Green Eye icon = Make All Public',
          'Gray Eye-Off icon = Make All Private',
          'Changes apply instantly to all animals',
          'Background sync keeps database updated',
          'Confirmation prompt before applying'
        ]
      },
      {
        stepNumber: 5,
        title: 'Mass Delete',
        content: 'Click the trash icon to enter mass delete mode. Select multiple animals using checkboxes, then click "Delete Selected" to remove them all at once.',
        tips: [
          'Efficient for large collections',
          'Delete multiple animals at once',
          'Click Cancel to exit without deleting'
        ]
      }
    ]
  },

  {
    id: 'af-public-profiles',
    title: '2. Public Profiles & Sharing',
    description: 'Share your breeding program with the community',
    tour: 'advanced-features',
    tourOrder: 2,
    steps: [
      {
        stepNumber: 1,
        title: 'Public Profile Overview',
        content: 'Your public profile is how other breeders find and learn about you. It is organised into up to four tabs that appear automatically once you have content: Animals (always visible), For Sale / Stud (appears when you have animals marked for sale or stud), Info & Adoption (appears when you have breeder info filled in Settings), and Litters (appears when you have at least one litter toggled public in Litter Management).',
        tips: [
          'Tabs appear automatically — no manual setup needed',
          'Animals tab is always shown',
          'For Sale / Stud tab requires animals marked for sale or stud',
          'Info & Adoption tab requires fields filled in Settings',
          'Litters tab requires at least one litter toggled public'
        ]
      },
      {
        stepNumber: 2,
        title: 'For Sale / Stud Tab',
        content: 'The "For Sale / Stud" tab shows two sections: animals you have listed for sale (with price) and animals available for stud services (with fee). Animals appear here when they are both set to Public AND have "Available for Sale" or "Available for Stud" enabled in their Status & Privacy tab. Visitors can see the price/fee, gender, species, and photo at a glance.',
        tips: [
          'Animal must be Public AND marked For Sale or For Stud',
          'Set price/fee or mark as Negotiable',
          'Tab is hidden if you have no animals listed',
          'Also feeds into the global Marketplace'
        ]
      },
      {
        stepNumber: 3,
        title: 'Info & Adoption Tab',
        content: 'The "Info & Adoption" tab shows your breeding program information as collapsible accordions: About My Program, Adoption Rules, Care Requirements, Health Guarantee, Waitlist Info, Pricing Notes, Contact Preferences, and any custom fields you have added. Fill these fields in Settings → Info & Adoption tab. The tab is hidden if none of the fields are filled.',
        tips: [
          'Fill fields in Settings → Info & Adoption tab',
          'Only filled sections are shown publicly',
          'Up to 10 custom fields with your own titles',
          'Formatting (bold, italic) is preserved in the public view',
          'Tab is hidden entirely if no fields are filled'
        ]
      },
      {
        stepNumber: 4,
        title: 'Litters Tab',
        content: 'The "Litters" tab shows litters you have chosen to share publicly. Toggle any litter public using the Eye / EyeOff icon on each litter card in Litter Management. Public litter cards display the pair name and ID, sire × dam names, a status badge (Planned or Born), relevant dates, a photo strip (if you have uploaded litter photos), and your notes. Litters are grouped into Planned and Past (born).',
        tips: [
          'Toggle per-litter from Litter Management (Eye icon at start of card)',
          'Planned and born litters appear in separate groups',
          'Photos and notes are shown if present',
          'Tab hidden until at least one litter is set public'
        ]
      },
      {
        stepNumber: 5,
        title: 'Profile Visibility Control',
        content: 'Use visibility toggles to control what appears on your public profile. You can be selective about what you share while maintaining community connections.',
        tips: [
          'Strategic sharing',
          'Balance openness and privacy',
          'Control your information'
        ]
      },
      {
        stepNumber: 6,
        title: 'Sharing Animals',
        content: 'First, open an existing animal from your collection to view its details. Then, click the "Share" button to copy the unique link to your clipboard. You can share this link with other breeders so they can view the full pedigree and contact you about the animal.',
        tips: [
          'Direct promotion',
          'Easy distribution',
          'Professional presentation'
        ]
      }
    ]
  },

  {
    id: 'af-understanding-coi',
    title: '3. Understanding Coefficient of Inbreeding (COI)',
    description: 'Learn about genetic diversity and inbreeding coefficient',
    tour: 'advanced-features',
    tourOrder: 3,
    steps: [
      {
        stepNumber: 1,
        title: 'What is COI?',
        content: 'The Coefficient of Inbreeding (COI) is a mathematical measure of genetic diversity. It ranges from 0% (no common ancestors) to 100% (completely inbred).',
        tips: [
          '0% = maximum diversity',
          '100% = completely inbred',
          'Important metric for breeding decisions'
        ]
      },
      {
        stepNumber: 2,
        title: 'Why COI Matters',
        content: 'COI helps breeders understand the genetic relationship between ancestors in a pedigree. Monitoring COI allows breeders to make informed decisions about their breeding programs.',
        tips: [
          'Genetics matter',
          'Track genetic relationships',
          'Use COI in breeding decisions'
        ]
      },
      {
        stepNumber: 3,
        title: 'Viewing COI',
        content: 'When viewing an animal, the COI percentage is shown on the Overview tab in the Parents section (top right of the Parents header). It reflects that animal\'s genetic diversity based on all known ancestors in the pedigree. The COI is visible to anyone who can view the animal — including the public view.',
        tips: [
          'Found on the Overview tab, Parents section (top right)',
          'Visible in both private and public views',
          'Check before breeding',
          'Use in breeding decisions',
          'Important pedigree metric'
        ]
      },
      {
        stepNumber: 4,
        title: 'Predicted COI for Pairings',
        content: 'When selecting potential breeding pairs, the system can predict the COI of offspring. This helps you understand the genetic relationship before making breeding decisions.',
        tips: [
          'Plan ahead',
          'Compare different pairings',
          'Preview offspring COI'
        ]
      },
      {
        stepNumber: 5,
        title: 'Using COI in Your Program',
        content: 'COI is one of many tools breeders use to make informed decisions. Consider COI alongside other factors like temperament, conformation, and health testing when planning your breeding program.',
        tips: [
          'One factor among many',
          'Consider COI in every decision',
          'Use alongside other metrics'
        ]
      }
    ]
  },

  {
    id: 'af-marketplace',
    title: '4. Marketplace',
    description: 'Browse and discover animals available for sale or stud',
    tour: 'advanced-features',
    tourOrder: 4,
    steps: [
      {
        stepNumber: 1,
        title: 'Marketplace Overview',
        content: 'The Marketplace lets you browse animals that breeders have marked as "Available for Sale" or "Available for Stud". Only animals that are both marked as available AND have their public profile enabled will appear here.',
        tips: [
          'Find animals for sale',
          'Discover stud services',
          'Connect with breeders',
          'Filter by species and location'
        ]
      },
      {
        stepNumber: 2,
        title: 'Search and Filter',
        content: 'Use the search bar to find animals by name, and filter by species, gender, country, and availability type (For Sale vs For Stud). This helps you narrow down exactly what you\'re looking for.',
        tips: [
          'Search by animal name',
          'Filter by multiple criteria',
          'Find local breeders',
          'Specify what you need'
        ]
      },
      {
        stepNumber: 3,
        title: 'Animal Cards',
        content: 'Each animal card shows the photo, name, price/fee, gender, species, and location. Click on a card to view the full animal profile with pedigree, genetics, and other details.',
        tips: [
          'See key info at a glance',
          'Prices shown with currency',
          'Click for full details',
          'View pedigree and lineage'
        ]
      },
      {
        stepNumber: 4,
        title: 'Contact Breeders',
        content: 'When viewing an animal, you can contact the breeder through their public profile to inquire about availability, ask questions, or arrange a purchase or stud service.',
        tips: [
          'Message breeders directly',
          'Ask about availability',
          'Negotiate terms',
          'Arrange safe transactions'
        ]
      }
    ]
  },

  {
    id: 'af-breeder-directory',
    title: '5. Breeders Registry',
    description: 'Discover and connect with breeders around the world',
    tour: 'advanced-features',
    tourOrder: 5,
    steps: [
      {
        stepNumber: 1,
        title: 'Breeders Registry Overview',
        content: 'The Breeders Registry helps you find active breeders of specific species. Click the star/moon icon in the header to access it. Breeders can mark themselves as "Active Breeder" or "Retired Breeder" for each species in their settings.',
        tips: [
          'Find breeders by species',
          'Connect with the community',
          'Search by name or location',
          'Filter by country and species'
        ]
      },
      {
        stepNumber: 2,
        title: 'Setting Your Breeding Status',
        content: 'In your Settings, you can mark yourself as an "Active Breeder", "Retired Breeder", or "Owner" for each species you keep. Active and Retired breeders appear in the directory. This is optional - you only appear if you choose to.',
        tips: [
          'Choose your status per species',
          'Only opt-in if you want to be listed',
          'Update status as your program changes',
          'Active breeders marked with star icon'
        ]
      },
      {
        stepNumber: 3,
        title: 'Search and Filter Breeders',
        content: 'Search by breeder name or ID, and filter by species they breed and country. This helps you find local breeders or specialists in specific species.',
        tips: [
          'Find local breeders',
          'Search by species',
          'Filter by country',
          'Discover specialists'
        ]
      },
      {
        stepNumber: 4,
        title: 'Breeder Profiles',
        content: 'Click on a breeder card to view their public profile. You can see their animals, contact information (if they\'ve made it public), website, and breeding program.',
        tips: [
          'View their animals',
          'See what they breed',
          'Contact via message or email',
          'Visit their website if available'
        ]
      }
    ]
  },

  {
    id: 'af-animal-tree',
    title: '7. Animal Tree Visualization',
    description: 'View your animals in an interactive family tree by species',
    tour: 'advanced-features',
    tourOrder: 7,
    steps: [
      {
        stepNumber: 1,
        title: 'Animal Tree Overview',
        content: 'The Animal Tree provides a visual family tree for each species, showing all your owned animals and their immediate parents. Click the Network icon next to a species name on your My Animals page to view the tree for that species.',
        tips: [
          'Visual family tree per species',
          'Shows owned animals + parents',
          'Interactive drag and zoom',
          'Organized by generations'
        ]
      },
      {
        stepNumber: 2,
        title: 'Navigate the Tree',
        content: 'The tree displays animals as nodes connected by lines showing parent-child relationships. You can click and drag to pan around, zoom in/out, and click on any animal to view their full details.',
        tips: [
          'Drag to pan the view',
          'Scroll or pinch to zoom',
          'Click animals to view details',
          'Different colors show gender'
        ]
      },
      {
        stepNumber: 3,
        title: 'Search in Tree',
        content: 'Use the search bar to find specific animals in the tree. When you search, matching animals will be highlighted, making it easy to locate them even in large family trees.',
        tips: [
          'Search by animal name',
          'Matching animals highlighted',
          'Useful for large collections',
          'Clear search to reset view'
        ]
      },
      {
        stepNumber: 4,
        title: 'Understanding Connections',
        content: 'Lines connect parents to offspring. Your owned animals are shown prominently, while parents (which may be from other breeders) appear with different styling. This helps you visualize your entire breeding lineage at a glance.',
        tips: [
          'Lines show parent-child links',
          'Owned animals clearly marked',
          'Parent animals may be view-only',
          'Great for understanding lineages'
        ]
      }
    ]
  },

  {
    id: 'af-genetics-calculator',
    title: '8. Genetics Calculator',
    description: 'Use the genetics calculator to predict offspring traits',
    tour: 'advanced-features',
    tourOrder: 8,
    steps: [
      {
        stepNumber: 1,
        title: 'Genetics Calculator Overview',
        content: 'Click the "Genetics" button in the header to access the Genetics Calculator - a tool for predicting offspring genetic traits. It works with species like Fancy Mice that have defined genetic loci.',
        tips: [
          'Predict offspring appearance',
          'Understand inheritance',
          'Plan trait combinations'
        ]
      },
      {
        stepNumber: 2,
        title: 'Selecting Animals',
        content: 'Click the "Select Animal" button to choose parents from your collection. Their genetic codes are automatically filled in when you select them.',
        tips: [
          'Use your animals',
          'Genetic code auto-fills',
          'Pre-populate parents'
        ]
      },
      {
        stepNumber: 3,
        title: 'Genetic Loci',
        content: 'Each genetic locus represents a trait. Select the combination for each parent using the dropdowns. The Sire (father) section is blue and the Dam (mother) section is pink.',
        tips: [
          'One row per genetic trait',
          'Select parent genotypes',
          'System shows options'
        ]
      },
      {
        stepNumber: 4,
        title: 'Calculate Offspring',
        content: 'First, select genetic combinations for both parents (or input "a/a" for both as a test). Then click "Calculate Offspring" to see all possible outcomes.',
        tips: [
          'Both parents must have selections',
          'Button activates when ready',
          'Results show all possibilities'
        ]
      },
      {
        stepNumber: 5,
        title: 'Predicted Offspring',
        content: 'The "Possible Offspring Outcomes" section shows all possible combinations and their probabilities. Click on combinations to see phenotypes (appearance) and any special notes.',
        tips: [
          'See all possibilities',
          'Probabilities shown',
          'Plan desired traits'
        ]
      },
      {
        stepNumber: 6,
        title: 'Phenotype Information',
        content: 'Each phenotype (appearance) is displayed with relevant information like colors, markings, and any lethal or problematic combinations highlighted in red.',
        tips: [
          'Avoid lethal combinations',
          'Plan for traits',
          'Understand genetics'
        ]
      },
      {
        stepNumber: 7,
        title: 'Tutorial Complete!',
        content: 'Congratulations! You\'ve completed all CritterTrack tutorials. You now know how to manage your entire breeding program — from adding animals to tracking genetics and finances, daily feeding management in the Management View, Supplies & Inventory, and per-animal Logs. You can always revisit these tutorials from the Help section in the header. Thank you for taking the time to learn all that CritterTrack has to offer!',
        tips: [
          'Access tutorials anytime from Help',
          'Check Management View for daily operations',
          'Use the Logs tab on any animal for full history',
          'Happy breeding!'
        ]
      }
    ]
  },

  {
    id: 'af-management-view',
    title: '9. Management View — Daily Operations',
    description: 'Use the Management View to handle daily feeding, care tasks, enclosures, and reproduction tracking',
    tour: 'advanced-features',
    tourOrder: 9,
    steps: [
      {
        stepNumber: 1,
        title: 'What Is the Management View?',
        content: 'The Management View is a separate mode in My Animals designed for daily operations. Switch to it using the grid/management icon at the top of your My Animals page. Instead of browsing individual records, it gives you a live dashboard of everything that needs attention today.',
        tips: [
          'Switch between List view and Management view at the top of My Animals',
          'Deceased animals are automatically excluded',
          'Sections collapse/expand to reduce clutter',
          'All actions update instantly with no page reload'
        ]
      },
      {
        stepNumber: 2,
        title: 'Feeding Section — Due & Overdue',
        content: 'The Animal Care section shows three groups: Due Today / Overdue (red), Up to Date (green), and No Schedule Set. Animals appear here based on the feeding frequency you set in their Animal Care tab. The badge in the section header counts how many animals need attention.',
        tips: [
          'Set feeding frequency on the animal\'s Animal Care tab',
          'Animals move groups automatically as dates change',
          'Red badge on section shows total items needing feeding'
        ]
      },
      {
        stepNumber: 3,
        title: 'Recording a Feeding',
        content: 'Click the green "✓ Fed" button next to any animal to record a feeding. A modal opens where you can optionally select which food item from your Supplies was used, enter the quantity fed (which automatically deducts from your stock), and add notes. You can also skip food selection and just mark the animal as fed.',
        tips: [
          'Food selection is optional — just click Record Feeding to mark as fed',
          'Selecting a supply + quantity deducts from your stock automatically',
          'Uncheck "Deduct from stock" for bulk items tracked by date only',
          'Feeding events are logged in the animal\'s Logs tab'
        ]
      },
      {
        stepNumber: 4,
        title: 'Scheduled Care Tasks',
        content: 'Below feeding, you\'ll see Scheduled Care Tasks — custom recurring tasks you\'ve set on individual animals (like weighing or nail trims). Each has its own due date. Click "✓ Done" to mark a task complete; it resets the countdown based on the task\'s frequency.',
        tips: [
          'Tasks are set per-animal in the Animal Care tab',
          'Each task tracks independently',
          'Done state is logged in the animal\'s Logs tab'
        ]
      },
      {
        stepNumber: 5,
        title: 'Enclosures Section',
        content: 'The Enclosures section shows all your enclosures with their assigned animals and any cleaning tasks that are due. You can see which animals are in which enclosure, and mark cleaning tasks done directly from Management View. Create enclosures and assign animals to them from within this section.',
        tips: [
          'Create enclosures from the Enclosures section add button',
          'Assign animals to enclosures in their Animal Care tab',
          'Add cleaning task schedules per enclosure for automatic due tracking'
        ]
      },
      {
        stepNumber: 6,
        title: 'Quarantine & Reproduction Tracking',
        content: 'The Health & Reproduction section shows animals in quarantine (with a "✓ Release" button to un-quarantine directly), and animals with active reproductive statuses. Reproductive statuses (In Mating → Pregnant → Nursing → Done) can be advanced inline without opening the full edit form.',
        tips: [
          'Set quarantine on an animal via their Status & Privacy tab',
          'Release button instantly removes quarantine status',
          'Repro status buttons update immediately — no save needed'
        ]
      },
      {
        stepNumber: 7,
        title: 'Activity Log',
        content: 'Every action you take in Management View — feeding, care tasks, enclosure tasks, quarantine releases, repro changes — is recorded in the Activity Log. Access it via the log button in the Management View header. You can filter by action type, animal, or date range to review what was done and when.',
        tips: [
          'Great for accountability and handover to other caretakers',
          'Filter by action type to find specific events',
          'Feeding events show which food and quantity was used'
        ]
      }
    ]
  },

  {
    id: 'af-supplies-inventory',
    title: '10. Supplies & Inventory',
    description: 'Track food, bedding, medication, and feeder animals — with automatic reorder alerts',
    tour: 'advanced-features',
    tourOrder: 10,
    steps: [
      {
        stepNumber: 1,
        title: 'Accessing Supplies & Inventory',
        content: 'Supplies & Inventory is accessed via the supplies button in the Management View header. It\'s a dedicated screen for tracking everything you use to care for your animals, from food and bedding to medication and feeder animals.',
        tips: [
          'Accessible from within Management View',
          'Separate from the main animal list',
          'Filter by category: Food, Bedding, Medication, Other'
        ]
      },
      {
        stepNumber: 2,
        title: 'Adding a Supply Item',
        content: 'Click "Add Item" to create a new supply. Give it a name, select a category (Food, Bedding, Medication, Other), and enter the current stock amount and unit (e.g. "15 bags" or "200 grams"). Optionally set a Cost Per Unit for budget tracking.',
        tips: [
          'Name: e.g. "Timothy Hay", "Deli Nature Premium", "Adult Mice"',
          'Units can be anything: bags, grams, kg, pieces',
          'Cost Per Unit flows into budget expenses on restock'
        ]
      },
      {
        stepNumber: 3,
        title: 'Feeder Animal Items',
        content: 'Food items can be marked as "Feeder Animal" to unlock extra fields: Feeder Type (e.g. Mice, Rats, Crickets) and Feeder Size (e.g. Pinky, Fuzzy, Adult, Large). These details appear in feeding logs when you select the item during a feeding event.',
        tips: [
          'Only available for Food category items',
          'Feeder type and size shown in feeding log entries',
          'Useful for reptile and amphibian keepers'
        ]
      },
      {
        stepNumber: 4,
        title: 'Reorder Thresholds',
        content: 'Set a "Reorder when stock reaches" threshold so you\'re alerted automatically. When current stock drops to or below this number, the item appears in the Management View\'s maintenance section and the maintenance badge count increases.',
        tips: [
          'Good starting point: 1-2 weeks\' worth of supply',
          'Badge on Management View section changes color when reorder is due',
          'Restock button lets you quickly add stock and optionally log the cost'
        ]
      },
      {
        stepNumber: 5,
        title: 'Schedule-Based Reorder',
        content: 'For bulk items where stock count isn\'t practical (like hay bales or substrate bags), use schedule-based reordering. Set a "Next Order Date" and an order frequency (e.g. every 2 months). The item will appear in alerts when the next order date arrives, independent of stock count.',
        tips: [
          'Great for subscription feeds or regular bulk orders',
          'Frequency: days, weeks, or months',
          'Next Order Date auto-advances when you restock'
        ]
      },
      {
        stepNumber: 6,
        title: 'Restocking',
        content: 'Click "Restock" on any item to add to your running stock. Enter the quantity received and optionally the cost paid — this automatically creates a budget expense entry. After restocking, any overdue reorder date is automatically advanced to the next cycle.',
        tips: [
          'Restock logs a budget expense automatically',
          'You can edit or delete transactions later in Budget',
          'Stock level updates immediately'
        ]
      }
    ]
  },

  {
    id: 'af-animal-logs',
    title: '11. Animal Logs Tab — Per-Animal History',
    description: 'View the full history of feedings, care changes, and field edits on any individual animal',
    tour: 'advanced-features',
    tourOrder: 11,
    steps: [
      {
        stepNumber: 1,
        title: 'What Is the Logs Tab?',
        content: 'Every animal has a "Logs 📜" tab in their detail view. This is a complete, automatically-generated history of everything that has happened to that animal — feedings recorded, care schedule changes, and any field edits made. You don\'t need to do anything special — it builds itself as you use the app.',
        tips: [
          'Find it as the last tab in any animal\'s detail view',
          'Loads lazily — only fetched when you open the tab',
          'Entries are created automatically, not manually'
        ]
      },
      {
        stepNumber: 2,
        title: 'Feeding History Section',
        content: 'The first section (green cards) shows every recorded feeding event with the food item used, feeder type and size (for feeder animals), quantity, date, and any notes you entered in the feeding modal. Great for spotting patterns like a snake refusing prey over several feedings.',
        tips: [
          'Each ✓ Fed action from Management View creates an entry',
          'Shows food name, quantity, and notes',
          'No food selected = entry still recorded with date only'
        ]
      },
      {
        stepNumber: 3,
        title: 'Care Schedule Updates Section',
        content: 'The second section (blue cards) logs any changes to the animal\'s care schedule: feeding frequency changes, maintenance frequency changes, care task list edits, and care tasks marked as done. Old and new values are shown for frequency changes.',
        tips: [
          'Useful for tracking when you adjusted care routines',
          'Shows which task was completed when marking a care task done',
          'Old → new values shown for frequency changes'
        ]
      },
      {
        stepNumber: 4,
        title: 'Field Edits Section',
        content: 'The third section (grey cards) logs changes to the animal\'s core record fields — name, species, status, morph, genetics, breeder, parents, quarantine status, and more. Each entry shows the exact old value → new value, timestamped. Useful for auditing changes and understanding your animal\'s history.',
        tips: [
          'Covers 27+ tracked fields automatically',
          'Old value shown in red strikethrough, new in green',
          'Changes from any edit — including quick management actions'
        ]
      }
    ]
  }
];

// Combine all lessons into array format
const ALL_LESSONS_ARRAY = [
  ...GETTING_STARTED_LESSONS,
  ...KEY_FEATURES_LESSONS,
  ...ADVANCED_FEATURES_LESSONS
];

// Export in the format expected by app.jsx
export const TUTORIAL_LESSONS = {
  onboarding: GETTING_STARTED_LESSONS,
  features: KEY_FEATURES_LESSONS,
  advanced: ADVANCED_FEATURES_LESSONS,
  all: ALL_LESSONS_ARRAY
};

// Also export as default for compatibility
export default TUTORIAL_LESSONS;
